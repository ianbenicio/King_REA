#!/usr/bin/env node
// Verificação local agregada (MEL-03; contrato em docs/contrato-ambiente.md).
// Roda os componentes declarados e informa, para cada um: aprovado, falhou ou não executado.
// "Não executado" sempre traz o motivo (requisito ausente detectado, dependência que não passou)
// e nunca conta como aprovado.
//
// Uso: npm run verificar [-- --so id1,id2] [-- --json] [-- --lista]
// Código de saída: 0 todos aprovados · 1 algum falhou · 3 nenhum falhou, mas algum não foi executado
// · 2 uso inválido.
//
// Não instala nada, não muda configuração da máquina e não lê alvos/ nem saidas/.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ESTADOS = { aprovado: "aprovado", falhou: "falhou", naoExecutado: "não executado" };
export const SAIDA = { aprovado: 0, falhou: 1, uso: 2, incompleto: 3 };

// Pendências do contrato que o verificador ainda não cobre (story MEL-03). Aparecem em toda execução.
export const PENDENCIAS = [
  "lint só em .claude/hooks/ e scripts/; reimplementacoes/puzzle-piloto/ e .githooks/ ainda fora (story MEL-03)",
  "tipos só nos módulos de política (rea-gate, cli-gate, verificar-perfis, publicacao), sem @types/node (APIs do Node como any) e sem noImplicitAny (57 erros com ele ligado) (story MEL-03)",
];

// --- regras puras (testadas em verificar.test.mjs) -------------------------------------------

/** Major do Node em uso igual ao do .node-version. */
export function versaoNodeCompativel(atual, declarada) {
  const major = (v) => String(v).trim().replace(/^v/, "").split(".")[0];
  if (!/^\d+$/.test(major(declarada))) return `.node-version inválido: "${String(declarada).trim()}"`;
  if (major(atual) !== major(declarada))
    return `Node ${String(atual).replace(/^v/, "")} em uso; o contrato pede ${major(declarada)}.x (.node-version: ${String(declarada).trim()})`;
  return null;
}

/** Diferenças entre package.json, package-lock.json e o que está instalado em node_modules. */
export function compararLockNpm({ pacote, lock, instalados }) {
  const problemas = [];
  const declaradas = { ...pacote.dependencies, ...pacote.devDependencies };
  const raiz = lock?.packages?.[""];
  if (!raiz) return ["package-lock.json sem a entrada da raiz (lockfileVersion 2 ou 3)"];
  const travadas = { ...raiz.dependencies, ...raiz.devDependencies };
  for (const nome of new Set([...Object.keys(declaradas), ...Object.keys(travadas)])) {
    if (declaradas[nome] !== travadas[nome])
      problemas.push(`${nome}: package.json pede ${declaradas[nome] ?? "(nada)"}, o lock tem ${travadas[nome] ?? "(nada)"}`);
    const noLock = lock.packages[`node_modules/${nome}`]?.version;
    if (!noLock) problemas.push(`${nome}: sem versão resolvida no lock`);
    else if (instalados[nome] === undefined) problemas.push(`${nome}: não instalado (rode npm ci --ignore-scripts)`);
    else if (instalados[nome] !== noLock) problemas.push(`${nome}: instalado ${instalados[nome]}, o lock fixa ${noLock}`);
  }
  return problemas;
}

/**
 * Motivo pelo qual a sessão não serve para os testes de UI WPF, ou null. Ver story MEL-02.
 * O sandbox do Codex fica recusado mesmo com a sonda aprovada: lá a falha foi de asserção, não de pré-requisito.
 * Runner do GitHub Actions não é recusado aqui: quem decide é a sonda (desenho da MEL-08, §4).
 */
export function motivoSemSessaoInterativa({ plataforma, usuario }) {
  if (plataforma !== "win32") return "os testes de UI WPF exigem Windows";
  if (/^CodexSandbox/i.test(usuario))
    return `processo rodando como "${usuario}" (sandbox do Codex): a suíte WPF só vale como usuário interativo (story MEL-02)`;
  return null;
}

// Itens medidos pela sonda tests/PRKingNotepad.UiProbe (story MEL-08, AC8), na ordem da saída dela.
export const ITENS_SONDA = ["interativa", "sessao_de_usuario", "foco_de_teclado", "clipboard"];

/**
 * Lê a linha JSON da sonda WPF: null quando todos os pré-requisitos estão presentes; senão, o motivo com o que faltou.
 * Só aceita booleanos nos itens conhecidos, uma lista "faltou" coerente com eles e, quando informado, o código de saída
 * coerente com a lista (0 sem falta, 1 com falta); qualquer outra coisa é saída inválida.
 */
export function avaliarSonda(texto, codigo) {
  const invalida = "não executável neste runner: sonda WPF com saída inválida";
  let dados;
  try {
    dados = JSON.parse(String(texto ?? "").trim().split(/\r?\n/).filter((l) => l.startsWith("{")).at(-1) ?? "");
  } catch {
    return invalida;
  }
  const chaves = Object.keys(dados ?? {});
  if (chaves.length !== ITENS_SONDA.length + 1 || !ITENS_SONDA.every((k) => typeof dados[k] === "boolean")) return invalida;
  const faltou = ITENS_SONDA.filter((k) => !dados[k]);
  if (!Array.isArray(dados.faltou) || dados.faltou.length !== faltou.length || !faltou.every((k) => dados.faltou.includes(k))) return invalida;
  if (codigo !== undefined && codigo !== (faltou.length ? 1 : 0)) return invalida;
  return faltou.length ? `não executável neste runner: faltou ${faltou.join(", ")} (sonda WPF)` : null;
}

/** Executa os componentes em ordem, respeitando requisitos e dependências. */
export function executarPlano(componentes, ctx, relogio = () => performance.now()) {
  const resultados = [];
  const porId = new Map();
  for (const c of componentes) {
    const inicio = relogio();
    let r;
    const dependenciaRuim = (c.depende ?? []).find((d) => porId.get(d)?.estado !== ESTADOS.aprovado);
    const motivoRequisito = dependenciaRuim ? null : c.requisito?.(ctx) ?? null;
    if (dependenciaRuim) {
      const dep = porId.get(dependenciaRuim);
      r = { estado: ESTADOS.naoExecutado, motivo: `depende de "${dependenciaRuim}", que ${!dep ? "não foi selecionado" : dep.estado === ESTADOS.falhou ? "falhou" : "não foi executado"}` };
    } else if (motivoRequisito) {
      r = { estado: ESTADOS.naoExecutado, motivo: `requisito ausente: ${motivoRequisito}` };
    } else {
      try {
        const saida = c.executar(ctx);
        r = saida.ok
          ? { estado: ESTADOS.aprovado, detalhe: saida.detalhe }
          : { estado: ESTADOS.falhou, motivo: saida.motivo, detalhe: saida.detalhe };
      } catch (erro) {
        r = { estado: ESTADOS.falhou, motivo: `erro do verificador: ${erro.message}` };
      }
    }
    const resultado = { id: c.id, descricao: c.descricao, ...r, duracao_s: Math.round((relogio() - inicio) / 100) / 10 };
    porId.set(c.id, resultado);
    resultados.push(resultado);
  }
  return resultados;
}

/** Ids pedidos mais as dependências deles, transitivamente. */
export function comDependencias(ids, componentes = COMPONENTES) {
  const todos = new Set();
  const visitar = (id) => {
    if (todos.has(id)) return;
    todos.add(id);
    for (const d of componentes.find((c) => c.id === id)?.depende ?? []) visitar(d);
  };
  ids.forEach(visitar);
  return todos;
}

/** Estado e código de saída do conjunto. Conjunto vazio não é sucesso. */
export function agregar(resultados) {
  if (resultados.some((r) => r.estado === ESTADOS.falhou)) return { estado: "reprovado", codigo: SAIDA.falhou };
  if (resultados.length === 0 || resultados.some((r) => r.estado !== ESTADOS.aprovado))
    return { estado: "incompleto", codigo: SAIDA.incompleto };
  return { estado: "aprovado", codigo: SAIDA.aprovado };
}

// --- componentes reais -----------------------------------------------------------------------

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const NOTEPAD = join(RAIZ, "reimplementacoes", "notepad");
// Saída de build fora do repositório: não trava nem sobrescreve o bin/ de um Notepad aberto (lição da NB5).
const ARTEFATOS = join(tmpdir(), "prking-verificar-notepad");

function rodar(comando, args, { cwd = RAIZ, timeout, env } = {}) {
  const r = spawnSync(comando, args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, windowsHide: true, timeout, env });
  if (r.error) return { ok: false, ausente: r.error.code === "ENOENT", motivo: r.error.message, saida: "" };
  const saida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  return { ok: r.status === 0, codigo: r.status, saida };
}

const cauda = (texto, n = 25) => texto.trim().split(/\r?\n/).slice(-n).join("\n");
const resultadoDe = (r, rotulo, extrairDetalhe = () => undefined) =>
  r.ok
    ? { ok: true, detalhe: extrairDetalhe(r.saida) }
    : { ok: false, motivo: `${rotulo} saiu com código ${r.codigo ?? "?"}${r.motivo ? `: ${r.motivo}` : ""}`, detalhe: cauda(r.saida) };

const resumoNodeTest = (s) => {
  const n = (k) => s.match(new RegExp(`^ℹ ${k} (\\d+)`, "m"))?.[1];
  return n("tests") ? `${n("pass")}/${n("tests")} aprovados, ${n("fail")} falhas, ${n("skipped")} pulados` : undefined;
};
// Linha final do dotnet test, em português ou inglês: "Com falha: 0, Aprovado: 137, Ignorado: 0, Total: 137".
export const resumoDotnet = (s) => {
  const m = s.match(/(?:Com falha|Failed):\s*(\d+),\s*(?:Aprovado|Passed):\s*(\d+),\s*(?:Ignorado|Skipped):\s*(\d+),\s*Total:\s*(\d+)/);
  return m ? `${m[2]}/${m[4]} aprovados, ${m[1]} falhas, ${m[3]} ignorados` : undefined;
};

function arquivosJs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(mjs|js)$/.test(e.name))
    .map((e) => join(e.parentPath ?? e.path, e.name))
    .filter((p) => !/[\\/](node_modules|bin|obj)[\\/]/.test(p));
}

let dotnetVersao; // resolvida uma vez, na pasta do global.json
function motivoSemDotnet() {
  if (dotnetVersao === undefined) {
    const r = rodar("dotnet", ["--version"], { cwd: NOTEPAD });
    dotnetVersao = r.ok ? { versao: r.saida.trim() } : { motivo: r.ausente ? "comando dotnet não encontrado no PATH" : `nenhum SDK compatível com reimplementacoes/notepad/global.json (${cauda(r.saida, 3).replace(/\s+/g, " ")})` };
  }
  return dotnetVersao.motivo ?? null;
}

let dockerMotivo; // null quando o daemon responde
function motivoSemDocker() {
  if (dockerMotivo === undefined) {
    const r = rodar("docker", ["info", "--format", "{{.ServerVersion}}"]);
    dockerMotivo = r.ok ? null : r.ausente ? "comando docker não encontrado no PATH" : "daemon do Docker inacessível (Docker Desktop desligado?)";
  }
  return dockerMotivo;
}

// A sonda sai com 1 quando falta algo; o que vale é a linha JSON, lida por avaliarSonda.
const SONDA = join(ARTEFATOS, "bin", "PRKingNotepad.UiProbe", "debug", "PRKingNotepad.UiProbe.dll");
function motivoDaSonda() {
  if (!existsSync(SONDA)) return "sonda WPF não encontrada na saída do build (tests/PRKingNotepad.UiProbe)";
  const r = rodar("dotnet", [SONDA], { cwd: NOTEPAD, timeout: 60_000 });
  if (r.motivo) return `sonda WPF não concluiu: ${r.motivo}`;
  return avaliarSonda(r.saida, r.codigo);
}

// Lint (MEL-03, AC4a): Biome fixado no lock, auditado em docs/seguranca/auditoria-biome-2.5.15.md.
// Configuração em biome.json; o escopo fica aqui, numa lista só, e cresce aos poucos (plano de evolução §10).
export const ESCOPO_LINT = [".claude/hooks", "scripts"];
const BIOME = join(RAIZ, "node_modules", "@biomejs", "biome", "bin", "biome");

/** Componente lint para uma raiz e um Biome dados (parâmetros existem para os testes com cópia temporária). */
export function componenteLint({ raiz = RAIZ, biome = BIOME } = {}) {
  return {
    id: "lint",
    descricao: `Biome lint (regras recomendadas, avisos reprovam) em ${ESCOPO_LINT.join(", ")}`,
    // Depende do lock conferido: sem isso, rodaria um Biome diferente do auditado (QA-E22-01).
    depende: ["ambiente-node", "dependencias-npm"],
    requisito: () => (existsSync(biome) ? null : "Biome não instalado em node_modules (rode npm ci --ignore-scripts)"),
    executar() {
      // BIOME_BINARY trocaria o binário auditado por outro qualquer: o verificador não repassa essa variável.
      const { BIOME_BINARY, ...env } = process.env;
      const r = rodar(process.execPath, [biome, "lint", "--error-on-warnings", "--colors=off", ...ESCOPO_LINT], { cwd: raiz, env });
      return resultadoDe(r, "biome lint", (s) => s.match(/Checked (\d+) files?/)?.[1]?.concat(" arquivos"));
    },
  };
}

// Tipos (MEL-03, AC4b): TypeScript 6.0.3 com checkJs, auditado em docs/seguranca/auditoria-typescript-6.0.3.md.
// Os arquivos conferidos ficam em "files" do tsconfig.json (módulos de política); sem @types/node, as APIs do
// Node vêm de scripts/tipos/node-minimo.d.ts.
const TSC = join(RAIZ, "node_modules", "typescript", "bin", "tsc");

/** Componente tipos para uma raiz e um tsc dados (parâmetros existem para os testes com cópia temporária). */
export function componenteTipos({ raiz = RAIZ, tsc = TSC } = {}) {
  return {
    id: "tipos",
    descricao: "tsc --noEmit com checkJs nos módulos de política (tsconfig.json)",
    depende: ["ambiente-node", "dependencias-npm"],
    requisito: () => (existsSync(tsc) ? null : "TypeScript não instalado em node_modules (rode npm ci --ignore-scripts)"),
    executar() {
      const arquivos = JSON.parse(readFileSync(join(raiz, "tsconfig.json"), "utf8")).files?.length ?? 0;
      const r = rodar(process.execPath, [tsc, "-p", "tsconfig.json", "--noEmit", "--pretty", "false"], { cwd: raiz });
      return resultadoDe(r, "tsc", () => `${arquivos} arquivos`);
    },
  };
}

const dotnet = (args) => () => resultadoDe(rodar("dotnet", [...args, "--artifacts-path", ARTEFATOS], { cwd: NOTEPAD }), `dotnet ${args[0]}`, resumoDotnet);
const nodeRun = (script, resumo = () => undefined) => () =>
  resultadoDe(rodar(process.execPath, ["--run", script]), `node --run ${script}`, resumo);

export const COMPONENTES = [
  {
    id: "ambiente-node",
    descricao: "Node do .node-version (major) e engines do package.json",
    executar() {
      const motivo = versaoNodeCompativel(process.version, readFileSync(join(RAIZ, ".node-version"), "utf8"));
      return motivo ? { ok: false, motivo } : { ok: true, detalhe: process.version };
    },
  },
  {
    id: "dependencias-npm",
    descricao: "package.json, package-lock.json e node_modules coerentes",
    executar() {
      const ler = (p) => JSON.parse(readFileSync(join(RAIZ, p), "utf8"));
      const pacote = ler("package.json");
      const nomes = Object.keys({ ...pacote.dependencies, ...pacote.devDependencies });
      const instalados = Object.fromEntries(
        nomes.map((n) => [n, existsSync(join(RAIZ, "node_modules", n, "package.json")) ? ler(`node_modules/${n}/package.json`).version : undefined]),
      );
      const problemas = compararLockNpm({ pacote, lock: ler("package-lock.json"), instalados });
      return problemas.length ? { ok: false, motivo: "dependências npm divergentes", detalhe: problemas.join("\n") } : { ok: true, detalhe: `${nomes.length} dependência(s) conferida(s)` };
    },
  },
  {
    id: "sintaxe-js",
    descricao: "node --check nos módulos próprios (sintaxe, não tipos)",
    depende: ["ambiente-node"],
    executar() {
      const arquivos = [".claude/hooks", ".githooks", "scripts", "reimplementacoes/puzzle-piloto"].flatMap((d) => arquivosJs(join(RAIZ, d)));
      const ruins = arquivos.filter((f) => !rodar(process.execPath, ["--check", f]).ok);
      return ruins.length ? { ok: false, motivo: `${ruins.length} arquivo(s) com erro de sintaxe`, detalhe: ruins.join("\n") } : { ok: true, detalhe: `${arquivos.length} arquivos` };
    },
  },
  componenteLint(),
  componenteTipos(),
  { id: "js", descricao: "npm test: gates, assets, monetização e puzzle-piloto", depende: ["ambiente-node", "dependencias-npm"], executar: nodeRun("test", resumoNodeTest) },
  { id: "monetizacao", descricao: "checagem dos perfis de monetização", depende: ["ambiente-node"], executar: nodeRun("check:monetizacao") },
  {
    // Política de publicação (MEL-04) sobre todos os arquivos rastreados no HEAD. Na CI, a mesma decisão roda
    // sobre o diff do PR: node scripts/publicacao/publicacao.mjs --base <base> --head <head>.
    id: "publicacao",
    descricao: "política de publicação sobre a árvore do HEAD (caminhos proibidos, segredos, registros/)",
    depende: ["ambiente-node"],
    executar: () =>
      resultadoDe(rodar(process.execPath, [join(RAIZ, "scripts", "publicacao", "publicacao.mjs"), "--arvore"]), "publicacao --arvore", (s) =>
        s.match(/(\d+) arquivo/)?.[1]?.concat(" arquivos"),
      ),
  },
  { id: "dotnet-restore", descricao: "restore .NET em modo travado (packages.lock.json)", requisito: motivoSemDotnet, executar: dotnet(["restore", "PRKingNotepad.slnx", "--locked-mode"]) },
  { id: "notepad-build", descricao: "build do Notepad (avisos são erros)", depende: ["dotnet-restore"], executar: dotnet(["build", "PRKingNotepad.slnx", "--no-restore", "--no-incremental"]) },
  { id: "notepad-core", descricao: "testes do PRKingNotepad.Core", depende: ["notepad-build"], executar: dotnet(["test", "tests/PRKingNotepad.Core.Tests/PRKingNotepad.Core.Tests.csproj", "--no-build"]) },
  {
    id: "notepad-ui",
    descricao: "testes de UI WPF, depois da sonda de sessão interativa, foco e clipboard",
    depende: ["notepad-build"],
    requisito: () => motivoSemSessaoInterativa({ plataforma: process.platform, usuario: userInfo().username }) ?? motivoDaSonda(),
    executar: dotnet(["test", "tests/PRKingNotepad.Ui.Tests/PRKingNotepad.Ui.Tests.csproj", "--no-build"]),
  },
  { id: "semgrep-scan", descricao: "Semgrep fixado: varredura das regras do puzzle", requisito: motivoSemDocker, executar: nodeRun("semgrep") },
  { id: "semgrep-test", descricao: "Semgrep fixado: testes das regras", requisito: motivoSemDocker, executar: nodeRun("semgrep:test") },
  { id: "semgrep-mutacoes", descricao: "Semgrep fixado: mutações das regras", requisito: motivoSemDocker, executar: nodeRun("semgrep:mutacoes") },
];

// --- linha de comando ------------------------------------------------------------------------

function imprimir(resultados, total) {
  const larg = Math.max(...resultados.map((r) => r.id.length), 4);
  console.log("\nVerificação local (docs/contrato-ambiente.md)\n");
  for (const r of resultados) {
    console.log(`${r.id.padEnd(larg)}  ${r.estado.padEnd(13)}  ${String(r.duracao_s).padStart(6)} s  ${r.detalhe && r.estado === ESTADOS.aprovado ? r.detalhe : r.motivo ?? ""}`);
    if (r.estado === ESTADOS.falhou && r.detalhe) console.log(r.detalhe.replace(/^/gm, "    | "));
  }
  const conta = (e) => resultados.filter((r) => r.estado === e).length;
  console.log(`\nResultado: ${total.estado.toUpperCase()} — ${conta(ESTADOS.aprovado)} aprovado(s), ${conta(ESTADOS.falhou)} falhou(aram), ${conta(ESTADOS.naoExecutado)} não executado(s).`);
  console.log("Pendências do contrato:");
  for (const p of PENDENCIAS) console.log(`  - ${p}`);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--lista")) {
    for (const c of COMPONENTES) console.log(`${c.id}\t${c.descricao}`);
    process.exit(SAIDA.aprovado);
  }
  const i = args.indexOf("--so");
  let selecionados = COMPONENTES;
  if (i >= 0) {
    const ids = (args[i + 1] ?? "").split(",").filter(Boolean);
    const desconhecidos = ids.filter((id) => !COMPONENTES.some((c) => c.id === id));
    if (!ids.length || desconhecidos.length) {
      console.error(`[verificar] componente desconhecido: ${desconhecidos.join(", ") || "(nenhum)"}. Veja --lista.`);
      process.exit(SAIDA.uso);
    }
    selecionados = COMPONENTES.filter((c) => comDependencias(ids).has(c.id));
  }
  const resultados = executarPlano(selecionados, {});
  const total = agregar(resultados);
  if (args.includes("--json")) {
    const ambiente = { node: process.version, dotnet: dotnetVersao?.versao ?? null, plataforma: process.platform };
    console.log(JSON.stringify({ data: new Date().toISOString(), ambiente, total, resultados, pendencias: PENDENCIAS }, null, 2));
  } else imprimir(resultados, total);
  process.exit(total.codigo);
}
