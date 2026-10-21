#!/usr/bin/env node
// Checagem antes do commit: protege registros/ no repositório público (CLAUDE.md).
// Bloqueia em registros/ (exceto registros/_modelos/):
// - arquivos binários;
// - extensões fora da lista (dados brutos e assets extraídos ficam em saidas/, fora do git);
// - arquivos acima de 300 KB;
// - blocos de código com mais de 40 linhas em Markdown (código descompilado extenso).
//   Blocos mermaid ficam de fora (são diagramas nossos).
// E roda a checagem de monetização em reimplementacoes/ (classe C bloqueada; ver
// scripts/monetizacao/verificar-perfis.mjs) quando o commit mexe lá ou no catálogo.
import { execFileSync } from "node:child_process";
import { CATALOGO, RAIZ, lerCatalogo, relatorio, verificarProjetos } from "../scripts/monetizacao/verificar-perfis.mjs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const ALLOWED_EXT = /\.(md|py|js|mjs|ts|mmd|svg|txt)$/i;
const MAX_BYTES = 300 * 1024;
const MAX_CODE_LINES = 40;

const allStaged = git("diff", "--cached", "--name-only", "--diff-filter=ACMRD", "-z").split("\0").filter(Boolean);
const staged = git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z")
  .split("\0")
  .filter((p) => p.startsWith("registros/") && !p.startsWith("registros/_modelos/"));

const binary = new Set(
  git("diff", "--cached", "--numstat", "--diff-filter=ACMR", "-z")
    .split("\0")
    .map((line) => line.match(/^-\t-\t(.+)$/)?.[1])
    .filter(Boolean),
);

const problems = [];
for (const path of staged) {
  if (path === "registros/ALVO_ATIVO") continue;
  if (binary.has(path)) {
    problems.push(`${path}: arquivo binário`);
    continue;
  }
  if (!ALLOWED_EXT.test(path)) {
    problems.push(`${path}: extensão não permitida em registros/ (dados brutos e assets vão em saidas/)`);
    continue;
  }
  const size = Number(git("cat-file", "-s", `:${path}`).trim());
  if (size > MAX_BYTES) {
    problems.push(`${path}: ${Math.round(size / 1024)} KB (limite ${MAX_BYTES / 1024} KB)`);
    continue;
  }
  if (/\.md$/i.test(path)) {
    const lines = git("show", `:${path}`).split(/\r?\n/);
    let open = null;
    for (let i = 0; i < lines.length; i++) {
      const fence = lines[i].match(/^\s*(```|~~~)\s*([\w-]*)/);
      if (!fence) continue;
      if (open === null) open = { start: i, lang: fence[2].toLowerCase() };
      else {
        const length = i - open.start - 1;
        if (open.lang !== "mermaid" && length > MAX_CODE_LINES)
          problems.push(`${path}:${open.start + 1}: bloco de código com ${length} linhas (limite ${MAX_CODE_LINES}; use fórmula em notação própria ou trecho curto)`);
        open = null;
      }
    }
  }
}

// Monetização: confere o conteúdo do índice (o que vai entrar no commit), não a árvore de trabalho.
let monetizacao = { problemas: [], avisos: [] };
if (allStaged.some((p) => p.startsWith(RAIZ) || p === CATALOGO)) {
  const arquivos = new Map();
  for (const path of git("ls-files", "-z", "--", RAIZ).split("\0").filter(Boolean)) {
    const bytes = execFileSync("git", ["show", `:${path}`], { maxBuffer: 64 * 1024 * 1024 });
    if (!bytes.subarray(0, 8000).includes(0)) arquivos.set(path, bytes.toString("utf8"));
  }
  let catalogo;
  try {
    catalogo = lerCatalogo(execFileSync("git", ["show", `:${CATALOGO}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    catalogo = { versao: NaN, padroes: new Map(), aliases: new Map(), erros: [`${CATALOGO}: ausente do índice (adicione ao commit)`] };
  }
  monetizacao = verificarProjetos({ catalogo, arquivos });
}

if (problems.length > 0) {
  process.stderr.write(
    "\n[pre-commit] registros/ vai para o repositório público. Bloqueado:\n" +
      problems.map((p) => `  - ${p}`).join("\n") +
      "\nMova dados brutos para saidas/<slug>/ (fora do git) ou resuma no registro.\n\n",
  );
}
const saidaMonetizacao = relatorio(monetizacao);
if (saidaMonetizacao) process.stderr.write(`\n${saidaMonetizacao}\n\n`);
if (problems.length > 0 || monetizacao.problemas.length > 0) process.exit(1);
