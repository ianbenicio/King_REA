#!/usr/bin/env node
// Organizador de assets de jogos: identifica arquivos pelo conteúdo (bytes iniciais, não só
// pela extensão), separa por tipo (3d, imagens, audio, video) e categoria (personagens,
// cenário, música...), elimina duplicatas por SHA-256 e gera um catálogo.
// Contêineres de engine (.pak, bundles Unity, bancos Wwise/FMOD...) são catalogados com a
// ferramenta indicada para extraí-los, mas não copiados.
//
// Uso:
//   node scripts/assets/organizar-assets.mjs --origem <pasta> --destino <pasta> [--simular] [--mover]
//   --simular  só cataloga (não copia nada); use no primeiro reconhecimento da pasta do jogo
//   --mover    move em vez de copiar (padrão: copiar; a origem fica intacta)
// Saída: <destino>/<tipo>/<categoria>/<caminho relativo original>
//        <destino>/_catalogo/catalogo.json, catalogo.csv, resumo.md
// Regras do projeto: destino em saidas/<slug>/ (fora do git). Não executa nada da origem;
// não segue links simbólicos/junções.
// Código de saída: 0 tudo certo · 1 lote com problema por item (conflito, falhou, invalido),
// com catálogo gravado · 2 uso errado ou erro fatal (origem ilegível, destino não gravável).
import { createReadStream, promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname, extname, resolve, sep } from "node:path";

// ---------- argumentos ----------
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const origem = opt("--origem");
const destino = opt("--destino");
const simular = args.includes("--simular");
const mover = args.includes("--mover");
if (!origem || !destino) {
  console.error("Uso: node organizar-assets.mjs --origem <pasta> --destino <pasta> [--simular] [--mover]");
  process.exit(2);
}
const ORIGEM = resolve(origem);
const DESTINO = resolve(destino);
if (DESTINO === ORIGEM || DESTINO.startsWith(ORIGEM + sep)) {
  console.error("O destino não pode ficar dentro da origem.");
  process.exit(2);
}
// Erros de configuração param o lote antes da varredura: uma origem ilegível não pode virar
// um catálogo vazio com aparência de sucesso.
const fatal = (msg, e) => {
  console.error(`${msg}${e ? ` (${e.code ?? "erro"}: ${e.message})` : ""}`);
  process.exit(2);
};
const infoOrigem = await fs.stat(ORIGEM).catch((e) => fatal(`Origem inacessível: ${ORIGEM}`, e));
if (!infoOrigem.isDirectory()) fatal(`A origem não é uma pasta: ${ORIGEM}`);
await fs.readdir(ORIGEM).catch((e) => fatal(`Origem ilegível: ${ORIGEM}`, e));
const pastaCat = join(DESTINO, "_catalogo");
await fs.mkdir(pastaCat, { recursive: true }).catch((e) => fatal(`Destino não gravável: ${DESTINO}`, e));

// Conteúdo reconhecido, mas com estrutura inconsistente (cabeçalho truncado, chunk maior que o
// arquivo). O item fica no catálogo como "invalido" e não é gravado no destino.
class Invalido extends Error {}

// ---------- identificação por conteúdo ----------
const ascii = (b, start, len) => b.subarray(start, start + len).toString("latin1");
const has = (b, start, bytes) => bytes.every((v, i) => b[start + i] === v);

/** @returns {{tipo: string, formato: string, invalido?: string}} */
function identificar(head, ext) {
  const a4 = ascii(head, 0, 4);
  const riffType = a4 === "RIFF" || a4 === "RIFX" ? ascii(head, 8, 4) : "";

  // Imagens
  if (has(head, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { tipo: "imagem", formato: "png" };
  if (has(head, 0, [0xff, 0xd8, 0xff])) return { tipo: "imagem", formato: "jpeg" };
  if (a4 === "GIF8") return { tipo: "imagem", formato: "gif" };
  if (a4 === "DDS ") return { tipo: "imagem", formato: "dds" };
  if (has(head, 0, [0xab, 0x4b, 0x54, 0x58])) return { tipo: "imagem", formato: "ktx" };
  if (has(head, 0, [0x13, 0xab, 0xa1, 0x5c])) return { tipo: "imagem", formato: "astc" };
  if (has(head, 0, [0x76, 0x2f, 0x31, 0x01])) return { tipo: "imagem", formato: "exr" };
  if (a4 === "8BPS") return { tipo: "imagem", formato: "psd" };
  if (ascii(head, 0, 2) === "#?") return { tipo: "imagem", formato: "hdr" };
  if (riffType === "WEBP") return { tipo: "imagem", formato: "webp" };
  if (ascii(head, 0, 2) === "BM" && ext === ".bmp") return { tipo: "imagem", formato: "bmp" };
  if (ext === ".tga") return { tipo: "imagem", formato: "tga" };

  // Áudio (e bancos de áudio)
  if (riffType === "WAVE") {
    // O codec fica no offset 20 (primeiro campo do chunk fmt); sem esses bytes não há como ler.
    if (head.length < 22)
      return { tipo: "audio", formato: ext === ".wem" ? "wem (Wwise)" : "wav", invalido: `cabeçalho RIFF/WAVE truncado: ${head.length} bytes (mínimo 22)` };
    const codec = a4 === "RIFX" ? head.readUInt16BE(20) : head.readUInt16LE(20);
    if (a4 === "RIFX" || codec === 0xffff || ext === ".wem") return { tipo: "audio", formato: "wem (Wwise)" };
    if (codec === 0x0165 || codec === 0x0166) return { tipo: "audio", formato: "xma" };
    return { tipo: "audio", formato: "wav" };
  }
  if (riffType === "FEV ") return { tipo: "conteiner", formato: "fmod-bank" };
  if (a4 === "OggS") {
    const s = ascii(head, 0, head.length);
    if (s.includes("theora")) return { tipo: "video", formato: "ogv" };
    if (s.includes("OpusHead")) return { tipo: "audio", formato: "opus" };
    return { tipo: "audio", formato: "ogg" };
  }
  if (a4 === "fLaC") return { tipo: "audio", formato: "flac" };
  if (ascii(head, 0, 3) === "ID3" || (ext === ".mp3" && head[0] === 0xff && (head[1] & 0xe0) === 0xe0))
    return { tipo: "audio", formato: "mp3" };
  if (a4 === "FORM" && ["AIFF", "AIFC"].includes(ascii(head, 8, 4))) return { tipo: "audio", formato: "aiff" };
  if (a4 === "FSB5" || a4 === "FSB4") return { tipo: "conteiner", formato: "fsb (FMOD)" };
  if (a4 === "BKHD") return { tipo: "conteiner", formato: "bnk (Wwise)" };

  // Vídeo
  if (ascii(head, 4, 4) === "ftyp") {
    const brand = ascii(head, 8, 4);
    return brand.startsWith("M4A") ? { tipo: "audio", formato: "m4a" } : { tipo: "video", formato: "mp4/mov" };
  }
  if (has(head, 0, [0x1a, 0x45, 0xdf, 0xa3])) return { tipo: "video", formato: "webm/mkv" };
  if (riffType === "AVI ") return { tipo: "video", formato: "avi" };
  if (ascii(head, 0, 3) === "BIK" || ascii(head, 0, 3) === "KB2") return { tipo: "video", formato: "bink" };
  if (a4 === "CRID") return { tipo: "video", formato: "usm (CRI)" };
  if (has(head, 0, [0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11])) return { tipo: "video", formato: "wmv/asf" };

  // 3D
  if (a4 === "glTF") return { tipo: "3d", formato: "glb" };
  if (ascii(head, 0, 18) === "Kaydara FBX Binary") return { tipo: "3d", formato: "fbx" };
  if (ascii(head, 0, 8) === "ACTRHEAD") return { tipo: "3d", formato: "psk (Unreal)" };
  if (ascii(head, 0, 8) === "ANIMHEAD") return { tipo: "3d", formato: "psa (animação Unreal)" };
  if (ascii(head, 0, 8) === "UEFORMAT") return { tipo: "3d", formato: "ueformat" };
  if (ascii(head, 0, 7) === "BLENDER") return { tipo: "3d", formato: "blend" };
  if (ascii(head, 0, 4) === "ply\n" || ascii(head, 0, 5) === "ply\r\n") return { tipo: "3d", formato: "ply" };
  if (a4 === "IDST") return { tipo: "3d", formato: "mdl (Source)" };
  const ext3d = { ".gltf": "gltf", ".obj": "obj", ".dae": "dae", ".stl": "stl", ".3ds": "3ds", ".smd": "smd", ".fbx": "fbx" };
  if (ext3d[ext]) return { tipo: "3d", formato: ext3d[ext] };

  // Contêineres de engine e arquivos compactados
  if (ascii(head, 0, 7) === "UnityFS" || ascii(head, 0, 8) === "UnityWeb" || ascii(head, 0, 8) === "UnityRaw")
    return { tipo: "conteiner", formato: "unity-bundle" };
  if ([".assets", ".resource", ".ress"].includes(ext)) return { tipo: "conteiner", formato: "unity-assets" };
  if ([".pak", ".utoc", ".ucas"].includes(ext)) return { tipo: "conteiner", formato: "unreal-pak" };
  if (a4 === "GDPC") return { tipo: "conteiner", formato: "godot-pck" };
  if (has(head, 0, [0x34, 0x12, 0xaa, 0x55])) return { tipo: "conteiner", formato: "vpk (Source)" };
  if (a4 === "BTDX" || ascii(head, 0, 4) === "BSA\0") return { tipo: "conteiner", formato: "bethesda (ba2/bsa)" };
  if (a4 === "FORM" && ext === ".win") return { tipo: "conteiner", formato: "gamemaker (data.win)" };
  if (a4 === "CPK ") return { tipo: "conteiner", formato: "cpk (CRI)" };
  if (has(head, 0, [0x50, 0x4b, 0x03, 0x04])) return { tipo: "conteiner", formato: "zip" };
  if (has(head, 0, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return { tipo: "conteiner", formato: "7z" };
  if (ascii(head, 0, 4) === "Rar!") return { tipo: "conteiner", formato: "rar" };

  return { tipo: "outro", formato: ext ? ext.slice(1) : "desconhecido" };
}

const FERRAMENTA = {
  "unity-bundle": "AssetRipper ou UnityPy",
  "unity-assets": "AssetRipper ou UnityPy",
  "unreal-pak": "FModel (pode exigir chave AES e .usmap)",
  "fsb (FMOD)": "vgmstream",
  "fmod-bank": "vgmstream",
  "bnk (Wwise)": "vgmstream",
  "godot-pck": "GDRE Tools",
  "vpk (Source)": "VRF (Source 2) ou GCFScape",
  "bethesda (ba2/bsa)": "BSArch",
  "gamemaker (data.win)": "UndertaleModTool",
  "cpk (CRI)": "CriPakTools (áudio: vgmstream)",
  zip: "REA extract_artifact ou 7-Zip",
  "7z": "7-Zip",
  rar: "7-Zip",
};
const CONVERSAO = {
  dds: "texconv ou ImageMagick → PNG",
  ktx: "ImageMagick/ferramentas KTX → PNG",
  astc: "astcenc → PNG",
  exr: "ImageMagick → PNG (perde HDR)",
  hdr: "ImageMagick → PNG (perde HDR)",
  tga: "ImageMagick/Pillow → PNG",
  "wem (Wwise)": "vgmstream → WAV",
  xma: "vgmstream → WAV",
  bink: "ffmpeg (só Bink 1) ou RAD Video Tools → MP4",
  "usm (CRI)": "ferramentas CRI → MP4; áudio via vgmstream",
  "psk (Unreal)": "Blender + importador PSK → glTF",
  "psa (animação Unreal)": "Blender + importador PSA",
  ueformat: "Blender + plugin UEFormat → glTF",
  "mdl (Source)": "Crowbar → SMD/glTF",
  blend: "Blender → glTF",
};

// ---------- categoria pelo caminho ----------
const CATEGORIAS = {
  // Ordem = prioridade. UI vem primeiro: um ícone de espada é interface, não arma.
  geral: [
    ["ui", ["ui", "hud", "icon", "icone", "menu", "button", "font", "cursor", "gui", "widget", "portrait", "logo"]],
    ["personagens", ["char", "character", "personag", "npc", "hero", "enemy", "player", "creature", "monster", "boss", "body", "head", "face", "hair", "outfit", "costume"]],
    ["armas", ["weapon", "arma", "gun", "rifle", "pistol", "sword", "blade", "bow", "ammo", "projectile"]],
    ["veiculos", ["vehicle", "veic", "car", "truck", "bike", "boat", "ship", "plane", "tank"]],
    ["efeitos", ["vfx", "fx", "effect", "particle", "explosion", "smoke", "fire", "spark"]],
    ["cenario", ["env", "environment", "level", "map", "terrain", "world", "building", "prop", "foliage", "tree", "rock", "cenario", "scene", "sky"]],
  ],
  audio: [
    ["musica", ["music", "musica", "bgm", "ost", "theme", "soundtrack"]],
    ["voz", ["vo", "voice", "dialog", "dialogue", "speech", "voz", "fala"]],
    ["ambiente", ["amb", "ambient", "ambience", "ambiente"]],
    ["sfx", ["sfx", "sound", "impact", "foley", "hit", "step", "footstep", "som"]],
  ],
  video: [["cutscenes", ["cutscene", "cinematic", "movie", "intro", "outro", "trailer", "fmv"]]],
};
function categorizar(tipo, rel) {
  const tokens = rel
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9à-ú]+/)
    .filter(Boolean);
  const casa = (kw) => tokens.some((t) => (kw.length <= 3 ? t === kw : t.startsWith(kw)));
  const grupos = tipo === "audio" ? CATEGORIAS.audio : tipo === "video" ? CATEGORIAS.video : CATEGORIAS.geral;
  for (const [nome, kws] of grupos) if (kws.some(casa)) return nome;
  return "outros";
}

// ---------- metadados simples ----------
function metadados(head, formato) {
  try {
    if (formato === "png") return `${head.readUInt32BE(16)}x${head.readUInt32BE(20)}`;
    if (formato === "dds") return `${head.readUInt32LE(16)}x${head.readUInt32LE(12)}`;
    if (formato === "bmp") return `${head.readInt32LE(18)}x${Math.abs(head.readInt32LE(22))}`;
  } catch {}
  return "";
}
async function duracaoWav(path, tamanho) {
  // Percorre os chunks até achar fmt e data. Chunk que passa do fim do arquivo, fmt curto
  // demais ou WAVE sem fmt/data tornam o item inválido.
  const fh = await fs.open(path, "r");
  try {
    let pos = 12, byteRate = 0, temFmt = false;
    const ch = Buffer.alloc(8);
    for (let n = 0; n < 64; n++) {
      const { bytesRead } = await fh.read(ch, 0, 8, pos);
      if (bytesRead === 0) break;
      if (bytesRead < 8) throw new Invalido(`cabeçalho de chunk truncado no byte ${pos}`);
      const id = ch.toString("latin1", 0, 4), size = ch.readUInt32LE(4);
      const restam = tamanho - pos - 8;
      if (size > restam) throw new Invalido(`chunk '${id}' declara ${size} bytes, mas restam ${restam}`);
      if (id === "fmt ") {
        if (size < 16) throw new Invalido(`chunk fmt com ${size} bytes (mínimo 16)`);
        const f = Buffer.alloc(16);
        await fh.read(f, 0, 16, pos + 8);
        byteRate = f.readUInt32LE(8);
        temFmt = true;
      } else if (id === "data") {
        if (!temFmt) throw new Invalido("chunk data antes do chunk fmt");
        return byteRate > 0 ? `${(size / byteRate).toFixed(2)} s` : "";
      }
      pos += 8 + size + (size % 2);
    }
    if (pos >= tamanho) throw new Invalido(temFmt ? "sem chunk data" : "sem chunk fmt");
  } finally {
    await fh.close();
  }
  return "";
}

// ---------- varredura ----------
// Pasta interna ilegível não para a varredura: vira um item "falhou" com o motivo.
async function* percorrer(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    yield { path: dir, erro: e };
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue; // não segue links/junções
    if (entry.isDirectory()) yield* percorrer(full);
    else if (entry.isFile()) yield { path: full };
  }
}
const sha256 = (path) =>
  new Promise((ok, fail) => {
    const h = createHash("sha256");
    createReadStream(path).on("data", (d) => h.update(d)).on("end", () => ok(h.digest("hex"))).on("error", fail);
  });
async function lerInicio(path, n = 64) {
  const fh = await fs.open(path, "r");
  try {
    const b = Buffer.alloc(n);
    const { bytesRead } = await fh.read(b, 0, n, 0);
    return b.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}
const PASTA = { "3d": "3d", imagem: "imagens", audio: "audio", video: "video" };

// Grava no destino sem nunca sobrescrever. Destino já existente só é reaproveitado se tiver
// o mesmo conteúdo; com conteúdo diferente fica como está e o item vira "conflito" (o
// catálogo não pode afirmar um hash que o arquivo do destino não tem).
// Estados de gravação: copiado | movido | reutilizado | conflito | falhou. Antes dela, o item
// pode ficar como simulado, duplicata, invalido (conteúdo inconsistente) ou falhou (erro de
// leitura, identificação ou hash); o campo erro começa pela etapa que falhou.
async function gravar(path, alvo, item) {
  try {
    await fs.mkdir(dirname(alvo), { recursive: true });
    const existe = await fs.lstat(alvo).then(() => true, (e) => (e.code === "ENOENT" ? false : Promise.reject(e)));
    if (!existe) {
      // rename sobrescreve no Windows; por isso a checagem acima vale também para --mover.
      if (mover) await fs.rename(path, alvo);
      else await fs.copyFile(path, alvo, 1 /* COPYFILE_EXCL: não sobrescreve */);
      item.estado = mover ? "movido" : "copiado";
      return;
    }
  } catch (e) {
    if (e.code !== "EEXIST") {
      item.estado = "falhou";
      item.erro = `gravação: ${e.code ?? "erro"}: ${e.message}`;
      return;
    }
  }
  try {
    item.sha256_destino = await sha256(alvo);
  } catch (e) {
    item.estado = "falhou";
    item.erro = `gravação: destino existente ilegível: ${e.message}`;
    return;
  }
  item.estado = item.sha256_destino === item.sha256 ? "reutilizado" : "conflito";
  if (item.estado === "reutilizado") item.sha256_destino = "";
}

const catalogo = [];
const vistos = new Map();
const novoItem = (rel) => ({ caminho_original: rel.split(sep).join("/"), tipo: "", formato: "", tamanho: "", sha256: "", categoria: "", destino: "", duplicata_de: "", info: "", acao: "", estado: "", sha256_destino: "", erro: "" });
for await (const { path, erro } of percorrer(ORIGEM)) {
  const rel = relative(ORIGEM, path);
  const item = novoItem(rel);
  catalogo.push(item);
  if (erro) {
    item.estado = "falhou";
    item.erro = `listagem da pasta: ${erro.code ?? "erro"}: ${erro.message}`;
    continue;
  }
  let etapa = "leitura";
  try {
    item.tamanho = (await fs.stat(path)).size;
    const head = await lerInicio(path);
    const ext = extname(path).toLowerCase();
    etapa = "identificação";
    const { tipo, formato, invalido } = identificar(head, ext);
    Object.assign(item, { tipo, formato });

    if (tipo === "conteiner") {
      item.acao = `extrair com: ${FERRAMENTA[formato] ?? "ferramenta da engine"}`;
      continue;
    }
    if (tipo === "outro") {
      item.acao = "ignorado";
      continue;
    }
    etapa = "hash";
    item.sha256 = await sha256(path);
    item.categoria = categorizar(tipo, rel);
    etapa = "validação";
    if (invalido) throw new Invalido(invalido);
    item.info = formato === "wav" ? await duracaoWav(path, item.tamanho) : metadados(head, formato);
    if (CONVERSAO[formato]) item.acao = `converter: ${CONVERSAO[formato]}`;
    if (vistos.has(item.sha256)) {
      item.duplicata_de = vistos.get(item.sha256);
      item.estado = "duplicata";
    } else {
      vistos.set(item.sha256, item.caminho_original);
      const alvo = join(DESTINO, PASTA[tipo], item.categoria, rel);
      item.destino = relative(DESTINO, alvo).split(sep).join("/");
      if (simular) item.estado = "simulado";
      else await gravar(path, alvo, item);
    }
  } catch (e) {
    // Erro de um item não derruba o lote: fica registrado e a varredura continua.
    if (e instanceof Invalido) {
      item.estado = "invalido";
      item.erro = `${etapa}: ${e.message}`;
    } else {
      item.estado = "falhou";
      item.erro = `${etapa}: ${e.code ?? "erro"}: ${e.message}`;
    }
  }
}

// ---------- catálogo e resumo ----------
const gravarCatalogo = (nome, conteudo) => fs.writeFile(join(pastaCat, nome), conteudo).catch((e) => fatal(`Não foi possível gravar ${join(pastaCat, nome)}`, e));
await gravarCatalogo("catalogo.json", JSON.stringify({ origem: ORIGEM, gerado_em: new Date().toISOString(), simulado: simular, itens: catalogo }, null, 2));
const cols = ["caminho_original", "tipo", "formato", "categoria", "tamanho", "info", "sha256", "destino", "duplicata_de", "acao", "estado", "sha256_destino", "erro"];
const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
await gravarCatalogo("catalogo.csv", `${[cols.join(","), ...catalogo.map((i) => cols.map((c) => csvCell(i[c])).join(","))].join("\n")}\n`);

const conta = (fn) => catalogo.reduce((m, i) => { const k = fn(i); if (k) m[k] = (m[k] ?? 0) + 1; return m; }, {});
const tabela = (obj, a, b) => [`| ${a} | ${b} |`, "|---|---|", ...Object.entries(obj).sort((x, y) => y[1] - x[1]).map(([k, v]) => `| ${k} | ${v} |`)].join("\n");
const assets = catalogo.filter((i) => PASTA[i.tipo]);
const conteineres = catalogo.filter((i) => i.tipo === "conteiner");
const resumo = [
  `# Resumo de assets`,
  ``,
  `- Origem: \`${ORIGEM}\``,
  `- Modo: ${simular ? "simulação (nada copiado)" : mover ? "mover" : "copiar"}`,
  `- Arquivos vistos: ${catalogo.length} · assets: ${assets.length} (únicos: ${assets.filter((i) => !i.duplicata_de).length}, duplicatas: ${assets.filter((i) => i.duplicata_de).length}) · contêineres: ${conteineres.length} · outros: ${catalogo.filter((i) => i.tipo === "outro").length}${catalogo.some((i) => !i.tipo) ? ` · sem leitura: ${catalogo.filter((i) => !i.tipo).length}` : ""}`,
  ``,
  `## Por tipo`,
  tabela(conta((i) => (i.tipo === "outro" ? "" : i.tipo)), "Tipo", "Arquivos"),
  ``,
  `## Por formato`,
  tabela(conta((i) => (i.tipo === "outro" ? "" : `${i.tipo} / ${i.formato}`)), "Tipo / formato", "Arquivos"),
  ``,
  `## Por categoria (inferida pelo caminho)`,
  tabela(conta((i) => (i.categoria ? `${PASTA[i.tipo]}/${i.categoria}` : "")), "Pasta", "Arquivos"),
  ``,
  `## Contêineres a extrair`,
  conteineres.length ? tabela(conta((i) => (i.tipo === "conteiner" ? `${i.formato} → ${FERRAMENTA[i.formato] ?? "ferramenta da engine"}` : "")), "Formato → ferramenta", "Arquivos") : "Nenhum.",
  ``,
  `## Conversões sugeridas`,
  Object.keys(conta((i) => (CONVERSAO[i.formato] && !i.duplicata_de ? i.formato : ""))).length
    ? tabela(conta((i) => (CONVERSAO[i.formato] && !i.duplicata_de ? `${i.formato} → ${CONVERSAO[i.formato]}` : "")), "Formato → conversão", "Arquivos")
    : "Nenhuma.",
  ``,
].join("\n");
const problemas = catalogo.filter((i) => ["conflito", "falhou", "invalido"].includes(i.estado));
const gravacao = [
  `## Gravação`,
  tabela(conta((i) => i.estado), "Estado", "Arquivos"),
  ``,
  ...(problemas.length
    ? [
        `### Conflitos, falhas e arquivos inválidos (destino não alterado)`,
        "| Arquivo | Estado | Detalhe |",
        "|---|---|---|",
        ...problemas.map((i) => `| ${i.destino || i.caminho_original} | ${i.estado} | ${i.estado === "conflito" ? `origem ${i.sha256.slice(0, 12)}… ≠ destino ${i.sha256_destino.slice(0, 12)}…` : i.erro} |`),
        ``,
      ]
    : []),
].join("\n");
await gravarCatalogo("resumo.md", `${resumo}\n${gravacao}`);
console.log(`${resumo}\n${gravacao}`);
if (problemas.length) {
  console.error(`\n${problemas.length} arquivo(s) em conflito, com falha ou inválido(s); o catálogo foi gravado. Veja a lista em ${join(pastaCat, "resumo.md")}: conflito pede --destino vazio ou decisão sobre a versão; falhou e invalido pedem tratamento do arquivo de origem.`);
  process.exit(1);
}
