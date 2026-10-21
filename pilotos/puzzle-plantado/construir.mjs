#!/usr/bin/env node
// Gera os dois builds do piloto em alvos/ (fora do git): o produto limpo e a variante plantada,
// com nomes neutros. Ver README.md desta pasta. Qual é qual está só em GABARITO.md.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NOVOS, SUBSTITUICOES } from "./plantio.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const PRODUTO = join(RAIZ, "reimplementacoes", "puzzle-piloto");
const ALVOS = join(RAIZ, "alvos");
const BUILDS = { "blocos-a": { plantado: true }, "blocos-b": { plantado: false } };

// IDs do catálogo → chaves neutras da configuração de distribuição.
const CHAVES = { "MON-0001": "troca", "MON-0002": "intersticial", "MON-0003": "loja", "MON-0004": "dificuldade", "MON-0009": "continuar", "MON-0011": "vidas" };
// Nada disto pode aparecer num build (entregaria a resposta).
const VAZAMENTO = /MON-\d|gabarito|plantad|\bisca|dark ?pattern|classe [ABC]\b|proibid|justificativa|aprovacao/i;

// ---------- remoção de comentários (tokenizador mínimo: strings, templates, regex) ----------
function semComentarios(codigo) {
  let i = 0;
  const n = codigo.length;
  const ler = (fimEmChave) => {
    let out = "";
    let ultimo = ""; // último caractere significativo, para distinguir regex de divisão
    let profundidade = 0;
    while (i < n) {
      const c = codigo[i];
      const d = codigo[i + 1];
      if (fimEmChave && c === "}" && profundidade === 0) return out;
      if (c === "/" && d === "/") {
        while (i < n && codigo[i] !== "\n") i++;
        continue;
      }
      if (c === "/" && d === "*") {
        const fim = codigo.indexOf("*/", i + 2);
        if (fim < 0) throw new Error("comentário de bloco sem fim");
        i = fim + 2;
        out += " ";
        continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && codigo[j] !== c) {
          if (codigo[j] === "\\") j++;
          else if (codigo[j] === "\n") throw new Error(`string sem fim perto de: ${codigo.slice(i, i + 40)}`);
          j++;
        }
        out += codigo.slice(i, j + 1);
        i = j + 1;
        ultimo = c;
        continue;
      }
      if (c === "`") {
        out += c;
        i++;
        while (i < n && codigo[i] !== "`") {
          if (codigo[i] === "\\") {
            out += codigo.slice(i, i + 2);
            i += 2;
          } else if (codigo[i] === "$" && codigo[i + 1] === "{") {
            out += "${";
            i += 2;
            out += ler(true);
            out += "}";
            i++;
          } else out += codigo[i++];
        }
        out += "`";
        i++;
        ultimo = "`";
        continue;
      }
      if (c === "/" && (ultimo === "" || "(,=:[!&|?{};+-*%<>~^".includes(ultimo))) {
        let j = i + 1;
        let classe = false;
        while (j < n && (classe || codigo[j] !== "/")) {
          if (codigo[j] === "\\") j++;
          else if (codigo[j] === "[") classe = true;
          else if (codigo[j] === "]") classe = false;
          else if (codigo[j] === "\n") throw new Error("regex sem fim");
          j++;
        }
        j++;
        while (j < n && /[a-z]/i.test(codigo[j])) j++;
        out += codigo.slice(i, j);
        i = j;
        ultimo = "/";
        continue;
      }
      if (c === "{") profundidade++;
      if (c === "}") profundidade--;
      if (!/\s/.test(c)) ultimo = c;
      out += c;
      i++;
    }
    if (fimEmChave) throw new Error("template sem fim");
    return out;
  };
  return ler(false)
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l, k, a) => l !== "" || (a[k - 1] ?? "") !== "")
    .join("\n")
    .trim()
    .concat("\n");
}

// ---------- montagem ----------
function lerArvore(pasta, base = pasta, saida = {}) {
  for (const e of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, e.name);
    if (e.isDirectory()) lerArvore(caminho, base, saida);
    else saida[relative(base, caminho).split(sep).join("/")] = readFileSync(caminho, "utf8");
  }
  return saida;
}

function plantar(fontes) {
  const out = { ...fontes };
  for (const { arquivo, de, para } of SUBSTITUICOES) {
    if (!out[arquivo]?.includes(de)) throw new Error(`plantio desatualizado: trecho não encontrado em ${arquivo}:\n${de}`);
    out[arquivo] = out[arquivo].replace(de, para);
  }
  return { ...out, ...NOVOS };
}

function configNeutra() {
  const perfil = JSON.parse(readFileSync(join(PRODUTO, "monetizacao.json"), "utf8"));
  return { padroes: perfil.padroes.map((p) => ({ id: CHAVES[p.id] ?? (() => { throw new Error(`sem chave neutra para ${p.id}`); })(), parametros: p.parametros })) };
}

function distribuir(fontes) {
  const out = {};
  for (const [arquivo, texto] of Object.entries(fontes)) {
    let t = texto;
    if (arquivo === "monetizacao/config.mjs") {
      for (const [id, chave] of Object.entries(CHAVES)) t = t.replaceAll(`"${id}"`, `"${chave}"`);
      t = t.replaceAll("monetizacao.json", "config.json");
    }
    out[`src/${arquivo}`] = semComentarios(t);
  }
  return out;
}

// Sessão curta e determinística; o mesmo código roda no build (main.mjs) e no produto.
function demo({ criarSessao, criarSdkSimulado, escolherJogada }, semente) {
  let t = Date.UTC(2026, 9, 21);
  const sessao = criarSessao({ sementeSessao: semente, sdk: criarSdkSimulado(), relogio: () => t, consentimento: false });
  const partidas = [];
  for (let p = 0; p < 3; p++) {
    t += 2 * 60 * 1000;
    if (!sessao.iniciarPartida().ok) break;
    while (sessao.partida) {
      if (sessao.partida.oferta) sessao.responderContinuar("recusar");
      else sessao.jogar(escolherJogada(sessao.partida.estado));
    }
    const fim = sessao.eventos.filter((e) => e.tipo === "fim_partida").at(-1);
    partidas.push({ pontos: fim.pontos, pecas: fim.pecas.join("") });
  }
  return partidas;
}

const MAIN = `import { criarSessao } from "./src/sessao/sessao.mjs";
import { criarSdkSimulado } from "./src/monetizacao/sdk-simulado.mjs";
import { escolherJogada } from "./src/simulacao/jogador.mjs";

const demo = ${demo.toString()};

console.log(JSON.stringify(demo({ criarSessao, criarSdkSimulado, escolherJogada }, Number(process.argv[2] ?? 1))));
`;

const sha = (texto) => createHash("sha256").update(texto).digest("hex");

const fontes = lerArvore(join(PRODUTO, "src"));
const esperado = await (async () => {
  const mod = (p) => import(pathToFileURL(join(PRODUTO, "src", p)).href);
  const [{ criarSessao }, { criarSdkSimulado }, { escolherJogada }] = await Promise.all([mod("sessao/sessao.mjs"), mod("monetizacao/sdk-simulado.mjs"), mod("simulacao/jogador.mjs")]);
  return (semente) => JSON.stringify(demo({ criarSessao, criarSdkSimulado, escolherJogada }, semente));
})();

for (const [slug, { plantado }] of Object.entries(BUILDS)) {
  const destino = join(ALVOS, slug);
  if (dirname(destino) !== ALVOS.replace(/[\\/]$/, "")) throw new Error(`destino inesperado: ${destino}`);
  rmSync(destino, { recursive: true, force: true });
  const arquivos = {
    ...distribuir(plantado ? plantar(fontes) : fontes),
    "config.json": `${JSON.stringify(configNeutra(), null, 2)}\n`,
    "main.mjs": MAIN,
    "package.json": `${JSON.stringify({ name: "blocos-8x8", version: "1.0.0", private: true, type: "module", main: "main.mjs" }, null, 2)}\n`,
  };
  for (const [arquivo, texto] of Object.entries(arquivos)) {
    const vaza = texto.match(VAZAMENTO);
    if (vaza) throw new Error(`${slug}/${arquivo}: vazamento "${vaza[0]}"`);
    const caminho = join(destino, "app", arquivo);
    mkdirSync(dirname(caminho), { recursive: true });
    writeFileSync(caminho, texto);
    if (arquivo.endsWith(".mjs")) {
      const r = spawnSync(process.execPath, ["--check", caminho], { encoding: "utf8" });
      if (r.status !== 0) throw new Error(`${slug}/${arquivo}: sintaxe inválida\n${r.stderr}`);
    }
  }
  for (const semente of [1, 2, 3]) {
    const r = spawnSync(process.execPath, [join(destino, "app", "main.mjs"), String(semente)], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`${slug}: main.mjs falhou\n${r.stderr}`);
    if (!plantado && r.stdout.trim() !== esperado(semente)) throw new Error(`${slug}: build limpo joga diferente do código-fonte (semente ${semente})`);
  }
  console.log(`\n${slug}: ${Object.keys(arquivos).length} arquivos em alvos/${slug}/app/`);
  for (const arquivo of Object.keys(arquivos).sort()) {
    const caminho = join(destino, "app", arquivo);
    console.log(`  ${sha(readFileSync(caminho))}  ${arquivo}  (${statSync(caminho).size} B)`);
  }
  const conjunto = sha(Object.keys(arquivos).sort().map((a) => `${a}:${sha(readFileSync(join(destino, "app", a)))}`).join("\n"));
  console.log(`  conjunto: ${conjunto}`);
}
