#!/usr/bin/env node
// Checagem antes do commit: protege o repositório público (CLAUDE.md).
// A política de publicação (caminhos proibidos, segredos, regras de registros/) mora em
// scripts/publicacao/publicacao.mjs, a mesma que a CI usa sobre o diff do PR (MEL-04).
// E roda a checagem de monetização em reimplementacoes/ (classe C bloqueada; ver
// scripts/monetizacao/verificar-perfis.mjs) quando o commit mexe lá ou no catálogo.
import { execFileSync } from "node:child_process";
import { CATALOGO, RAIZ, lerCatalogo, relatorio, verificarProjetos } from "../scripts/monetizacao/verificar-perfis.mjs";
import { ARQUIVO_EXCECOES, decidir, mudancasDoIndice, relatorio as relatorioPublicacao } from "../scripts/publicacao/publicacao.mjs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Fail-closed: sem conseguir ler o índice, o commit não passa.
let mudancas;
try {
  mudancas = mudancasDoIndice();
} catch (erro) {
  process.stderr.write(`\n[pre-commit] não consegui ler o índice do git (bloqueado por segurança): ${erro.message}\n\n`);
  process.exit(1);
}
let textoExcecoes;
try {
  textoExcecoes = execFileSync("git", ["show", `:${ARQUIVO_EXCECOES}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
} catch {
  textoExcecoes = undefined; // sem arquivo de exceções no índice: nenhuma exceção
}
const problemas = decidir(mudancas, textoExcecoes);

// Monetização: confere o conteúdo do índice (o que vai entrar no commit), não a árvore de trabalho.
let monetizacao = { problemas: [], avisos: [] };
if (mudancas.some((m) => [m.caminho, m.caminhoAntigo].some((p) => p && (p.startsWith(RAIZ) || p === CATALOGO)))) {
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

if (problemas.length > 0) process.stderr.write(`\n${relatorioPublicacao(problemas)}\n\n`);
const saidaMonetizacao = relatorio(monetizacao);
if (saidaMonetizacao) process.stderr.write(`\n${saidaMonetizacao}\n\n`);
if (problemas.length > 0 || monetizacao.problemas.length > 0) process.exit(1);
