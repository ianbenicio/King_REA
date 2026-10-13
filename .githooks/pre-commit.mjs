#!/usr/bin/env node
// Checagem antes do commit: protege registros/ no repositório público (CLAUDE.md).
// Bloqueia em registros/ (exceto registros/_modelos/):
// - arquivos binários;
// - extensões fora da lista (dados brutos e assets extraídos ficam em saidas/, fora do git);
// - arquivos acima de 300 KB;
// - blocos de código com mais de 40 linhas em Markdown (código descompilado extenso).
//   Blocos mermaid ficam de fora (são diagramas nossos).
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const ALLOWED_EXT = /\.(md|py|js|mjs|ts|mmd|svg|txt)$/i;
const MAX_BYTES = 300 * 1024;
const MAX_CODE_LINES = 40;

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

if (problems.length > 0) {
  process.stderr.write(
    "\n[pre-commit] registros/ vai para o repositório público. Bloqueado:\n" +
      problems.map((p) => `  - ${p}`).join("\n") +
      "\nMova dados brutos para saidas/<slug>/ (fora do git) ou resuma no registro.\n\n",
  );
  process.exit(1);
}
