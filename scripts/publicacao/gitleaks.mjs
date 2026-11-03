#!/usr/bin/env node
// Detector externo de segredos (MEL-04, E2-3b): gitleaks 8.30.1, ao lado das regras próprias de publicacao.mjs.
// Auditoria em docs/seguranca/auditoria-gitleaks-8.30.1.md. Aceito com ressalva pelo responsável em 2026-11-03:
// a release não tem assinatura nem atestação e é mutável; por isso o binário só roda isolado, como o Semgrep.
//
// Como roda:
// - binário Linux fora do git (ferramentas/gitleaks/8.30.1/linux/gitleaks), conferido por SHA-256 antes de cada
//   execução; hash diferente reprova;
// - o host grava os blobs brutos de <ref> (git cat-file, sem .gitattributes) numa pasta temporária: o gitleaks
//   nunca vê a árvore de trabalho, alvos/ nem saidas/;
// - contêiner sem rede, sem capacidades, sem escalada, usuário nobody, raiz só leitura, tudo montado só leitura;
//   base: a imagem do Semgrep já auditada (scripts/semgrep/rodar.mjs), para não baixar imagem nova;
// - configuração própria (gitleaks.toml) por --config; --ignore-gitleaks-allow; .gitleaksignore no alvo recusado
//   antes (nenhuma flag o desliga); -i para pasta vazia; --redact; nunca log debug ou trace (gravam o valor);
// - --exit-code 3 separa achado de erro (erro fatal sai 1); varredura de 0 bytes é erro (caminho inválido sai 0).
// O relatório traz só caminho, linha e regra, nunca Secret nem Match.
//
// Uso: node scripts/publicacao/gitleaks.mjs [<ref>]   (padrão HEAD)
// Saída: 0 sem achado · 1 achado ou falha · 3 não executado (binário ausente ou Docker inacessível).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const VERSAO = "8.30.1";
/** Mesma imagem de scripts/semgrep/rodar.mjs (aquele script roda ao ser importado); o teste confere a igualdade. */
export const IMAGEM = "semgrep/semgrep@sha256:529ee8a277ec8adc5b534d7c74eea0a47e9de21d62852b6ba7ac6ba9566845c3";
const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
export const BINARIO = join(RAIZ, "ferramentas", "gitleaks", VERSAO, "linux", "gitleaks");
/** SHA-256 do executável Linux extraído de gitleaks_8.30.1_linux_x64.tar.gz (tar.gz 551f6fc8…f2470eb, conferido). */
export const SHA256_BINARIO = "88f91962aa2f93ac6ab281d553b9e125f5197bbbce38f9f2437f7299c32e5509";
export const CONFIG = join(RAIZ, "scripts", "publicacao", "gitleaks.toml");
export const SAIDA_ACHADO = 3;
const ARVORE = "/tmp/arvore";

/** Linhas do relatório: caminho, linha e regra. Nunca o valor (Secret, Match) nem autor ou mensagem. */
export function resumirAchados(texto) {
  const lista = JSON.parse(texto || "[]");
  if (!Array.isArray(lista)) throw new Error("relatório do gitleaks não é uma lista");
  return lista.map((a) => ({
    caminho: String(a.File ?? "").replace(/^\/tmp\/arvore\//, ""),
    linha: Number(a.StartLine) || 0,
    regra: String(a.RuleID ?? "desconhecida"),
  }));
}

/** Bytes varridos informados pelo gitleaks ("scanned ~123 bytes"), ou null. */
export const bytesVarridos = (log) => {
  const m = String(log).match(/scanned ~(\d+) bytes/);
  return m ? Number(m[1]) : null;
};

/** Decide a partir da saída do contêiner. Pura: testada sem Docker. */
export function avaliarSaida({ codigo, stdout, stderr }) {
  const bytes = bytesVarridos(stderr);
  if (codigo !== 0 && codigo !== SAIDA_ACHADO) return { ok: false, motivo: `gitleaks saiu com código ${codigo ?? "?"} (erro, não achado)` };
  if (!bytes) return { ok: false, motivo: "gitleaks não varreu nada (0 bytes ou saída sem contagem): resultado não vale" };
  let achados;
  try {
    achados = resumirAchados(stdout.trim());
  } catch {
    return { ok: false, motivo: "relatório do gitleaks ilegível (não é JSON de lista)" }; // sem a mensagem: ela repete o início da saída (QA-E23B-05)
  }
  if ((codigo === SAIDA_ACHADO) !== achados.length > 0) return { ok: false, motivo: "código de saída incoerente com o relatório do gitleaks" };
  return { ok: achados.length === 0, achados, bytes };
}

export function relatorio(achados) {
  return [
    `\n[gitleaks ${VERSAO}] ${achados.length} achado(s) (valor omitido):`,
    ...achados.map((a) => `  - ${a.caminho}:${a.linha}  gitleaks:${a.regra}`),
    "Remova o segredo (e troque-o, se for real). A revisão humana de origem continua necessária.\n",
  ].join("\n");
}

export const sha256 = (arquivo) => createHash("sha256").update(readFileSync(arquivo)).digest("hex");

/** Argumentos do docker run. Constantes: nada vindo do repositório entra na linha de comando do contêiner. */
export function argsDocker({ binario, pasta, config }) {
  const limites = "--max-target-megabytes 0 --max-archive-depth 0 --max-decode-depth 5";
  const gl = `/gl/gitleaks dir ${ARVORE} --config /cfg/gitleaks.toml --ignore-gitleaks-allow -i /tmp/vazio --redact --no-banner --no-color --log-level info ${limites} --exit-code ${SAIDA_ACHADO} --report-format json --report-path /tmp/relatorio.json`;
  const script = `mkdir /tmp/vazio || exit 1; ${gl}; c=$?; cat /tmp/relatorio.json 2>/dev/null; exit $c`;
  return [
    "run", "--rm", "--network", "none", "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
    "--user", "65534:65534", "--read-only", "--tmpfs", "/tmp:rw,size=64m", "-e", "HOME=/tmp", "-w", "/tmp",
    "--mount", `type=bind,source=${binario},target=/gl/gitleaks,readonly`,
    "--mount", `type=bind,source=${pasta},target=${ARVORE},readonly`,
    "--mount", `type=bind,source=${config},target=/cfg/gitleaks.toml,readonly`,
    "--entrypoint", "sh", IMAGEM, "-c", script,
  ];
}

/** Ref aceita no CLI: nome simples de branch, tag ou commit; nada que comece com "-" nem caminho ("HEAD:d"). */
export const refValida = (ref) => /^[A-Za-z0-9][A-Za-z0-9._/~^-]*$/.test(ref) && !ref.includes("..");

/** Lê "<modo> <tipo> <id>\t<caminho>\0" do git ls-tree -r -z. */
export function entradasLsTree(saida) {
  return saida.split("\0").filter(Boolean).map((linha) => {
    const tab = linha.indexOf("\t");
    const [modo, tipo, id] = linha.slice(0, tab).split(" ");
    return { modo, tipo, id, caminho: linha.slice(tab + 1) };
  });
}

/** Caminho que não pode ser gravado com segurança na pasta temporária (fail-closed). */
const caminhoRuim = (c) => c.split("/").some((s) => s === "" || s === "." || s === "..") || /[\:]/.test(c) || c.startsWith("/");

/**
 * Varre os arquivos rastreados em <ref> do repositório <raiz>. Retorna { ok, motivo?, achados?, bytes? }.
 * O conteúdo é o blob bruto (git cat-file), não o git archive: este aplica export-ignore e working-tree-encoding do
 * .gitattributes, e um arquivo rastreado poderia esconder outro da varredura (QA-E23B-01).
 * Parâmetros existem para os testes (repositório temporário, binário falso).
 * @returns {{ ok: boolean, motivo?: string, achados?: { caminho: string, linha: number, regra: string }[], bytes?: number, arquivos?: number }}
 */
export function varrer({ ref = "HEAD", raiz = RAIZ, binario = BINARIO, hash = SHA256_BINARIO, config = CONFIG, docker = "docker" } = {}) {
  if (!refValida(ref)) return { ok: false, motivo: `ref recusada: ${JSON.stringify(ref)} (só branch, tag ou commit)` };
  const atual = sha256(binario);
  if (atual !== hash) return { ok: false, motivo: `binário do gitleaks com SHA-256 ${atual}, diferente do auditado (${hash})` };
  const git = (args, input) => spawnSync("git", args, { cwd: raiz, input, maxBuffer: 512 * 1024 * 1024, windowsHide: true });
  const commit = git(["rev-parse", "--verify", "--quiet", "--end-of-options", `${ref}^{commit}`]);
  if (commit.status !== 0) return { ok: false, motivo: `ref ${ref} não é um commit` };
  const arvore = git(["ls-tree", "-r", "-z", "--full-tree", commit.stdout.toString().trim()]);
  if (arvore.status !== 0) return { ok: false, motivo: `git ls-tree ${ref} falhou` };
  const entradas = entradasLsTree(arvore.stdout.toString("utf8"));
  // O gitleaks sempre carrega o .gitleaksignore da raiz do alvo e nenhuma flag desliga: recusado em qualquer nível.
  const ignorar = entradas.filter((e) => e.caminho.split("/").at(-1)?.toLowerCase() === ".gitleaksignore").map((e) => e.caminho);
  if (ignorar.length) return { ok: false, motivo: `.gitleaksignore rastreado (${ignorar.join(", ")}): suprimiria achados; exceções só em scripts/publicacao/excecoes.json` };
  const blobs = entradas.filter((e) => e.tipo === "blob"); // submódulos (commit) não têm conteúdo aqui
  const ruins = blobs.filter((e) => caminhoRuim(e.caminho)).map((e) => e.caminho);
  if (ruins.length) return { ok: false, motivo: `caminho que não dá para gravar com segurança: ${ruins.join(", ")}` };
  const lote = git(["cat-file", "--batch"], blobs.map((e) => e.id).join("\n") + "\n");
  if (lote.status !== 0) return { ok: false, motivo: "git cat-file --batch falhou" };
  const pasta = mkdtempSync(join(tmpdir(), "prking-gitleaks-"));
  try {
    const dados = join(pasta, "arvore");
    let pos = 0;
    for (const e of blobs) {
      const fimCabecalho = lote.stdout.indexOf(10, pos);
      const [id, tipo, tamanho] = lote.stdout.subarray(pos, fimCabecalho).toString().split(" ");
      if (id !== e.id || tipo !== "blob") return { ok: false, motivo: `git cat-file devolveu ${tipo ?? "nada"} para ${e.caminho}` };
      const conteudo = lote.stdout.subarray(fimCabecalho + 1, fimCabecalho + 1 + Number(tamanho));
      const destino = join(dados, ...e.caminho.split("/"));
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(destino, conteudo);
      pos = fimCabecalho + 1 + Number(tamanho) + 1;
    }
    mkdirSync(dados, { recursive: true });
    const r = spawnSync(docker, argsDocker({ binario, pasta: dados, config }), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, windowsHide: true, timeout: 300_000 });
    if (r.error) return { ok: false, motivo: `docker não rodou: ${r.error.message}` };
    return { ...avaliarSaida({ codigo: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" }), arquivos: blobs.length };
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

/** Motivo para não executar (binário ausente, Docker inacessível), ou null. */
export function motivoSemGitleaks({ binario = BINARIO, docker = "docker" } = {}) {
  if (!existsSync(binario)) return `binário do gitleaks ${VERSAO} ausente em ferramentas/gitleaks/${VERSAO}/linux/ (ver a auditoria)`;
  const r = spawnSync(docker, ["info", "--format", "{{.ServerVersion}}"], { encoding: "utf8", windowsHide: true });
  if (r.error) return "comando docker não encontrado no PATH";
  return r.status === 0 ? null : "daemon do Docker inacessível (Docker Desktop desligado?)";
}

/** Componente do verificador (scripts/verificar/verificar.mjs). Parâmetros existem para os testes. */
export function componenteGitleaks(opcoes = {}) {
  return {
    id: "gitleaks",
    descricao: `gitleaks ${VERSAO} isolado (sem rede, só leitura) sobre os arquivos rastreados no HEAD`,
    depende: ["ambiente-node"],
    requisito: () => motivoSemGitleaks(opcoes),
    executar() {
      const r = varrer(opcoes);
      if (r.ok) return { ok: true, detalhe: `${r.arquivos} arquivos, nenhum achado` };
      if (r.achados?.length) return { ok: false, motivo: `${r.achados.length} achado(s) do gitleaks`, detalhe: relatorio(r.achados).trim() };
      return { ok: false, motivo: r.motivo };
    },
  };
}

if (import.meta.main) {
  const motivo = motivoSemGitleaks();
  if (motivo) {
    console.error(`[gitleaks] não executado: ${motivo}`);
    process.exit(3);
  }
  const r = varrer({ ref: process.argv[2] ?? "HEAD" });
  if (r.achados?.length) console.error(relatorio(r.achados));
  else if (!r.ok) console.error(`[gitleaks] falhou: ${r.motivo}`);
  else console.log(`[gitleaks ${VERSAO}] ${r.arquivos} arquivo(s), ~${r.bytes} bytes, nenhum achado. A revisão humana de origem continua necessária.`);
  process.exit(r.ok ? 0 : 1);
}
