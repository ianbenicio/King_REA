#!/usr/bin/env node
// Política de publicação do repositório público (MEL-04). Uma decisão só, chamada pelo .githooks/pre-commit.mjs
// (sobre o índice) e pela CI (sobre o diff do PR), para que as duas não divirjam.
//
// Bloqueia, em qualquer mudança que não seja remoção:
// - caminhos proibidos: alvos/, saidas/, .rea/ e ferramentas/ (mesmo com git add -f), pelo caminho novo e pelo antigo;
// - segredos com formato conhecido (REGRAS_SEGREDO); o relatório nunca traz o valor;
// - em registros/ (fora registros/_modelos/ e registros/ALVO_ATIVO): binário, extensão fora da lista, arquivo
//   acima de 300 KB e bloco de código Markdown com mais de 40 linhas (mermaid de fora).
// Remoções nunca bloqueiam. Exceções só por scripts/publicacao/excecoes.json (caminho + tipo + motivo).
// A checagem não dispensa a revisão humana de origem: formato desconhecido de segredo, dado bruto em texto e
// trecho do alvo dentro do limite passam.
//
// Uso: node scripts/publicacao/publicacao.mjs --indice          (o que vai entrar no commit)
//      node scripts/publicacao/publicacao.mjs --base <ref> --head <ref>   (diff base...head, entrada da CI)
//      node scripts/publicacao/publicacao.mjs --arvore [<ref>]   (todos os arquivos rastreados em <ref>, padrão HEAD)
// Saída: 0 sem problema · 1 com problema · 2 uso inválido ou erro de leitura (fail-closed).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CAMINHOS_PROIBIDOS = ["alvos/", "saidas/", ".rea/", "ferramentas/"];
export const EXTENSOES_REGISTROS = /\.(md|py|js|mjs|ts|mmd|svg|txt)$/i;
export const MAX_BYTES = 300 * 1024;
export const MAX_LINHAS_CODIGO = 40;
export const ARQUIVO_EXCECOES = "scripts/publicacao/excecoes.json";

/**
 * Formatos de segredo cobertos. Cada regra tem um tipo estável (usado nas exceções) e uma expressão.
 * Formatos fora desta lista não são detectados; a lista dos não cobertos está em docs/contrato-ambiente.md.
 */
export const REGRAS_SEGREDO = [
  { tipo: "segredo:chave-privada-pem", descricao: "chave privada PEM", regex: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/ },
  { tipo: "segredo:token-github", descricao: "token do GitHub", regex: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})/ },
  { tipo: "segredo:jwt", descricao: "JWT", regex: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{16,}/ },
  { tipo: "segredo:chave-anthropic", descricao: "chave de API da Anthropic", regex: /\bsk-ant-[A-Za-z0-9_-]{32,}/ },
  { tipo: "segredo:chave-openai", descricao: "chave de API da OpenAI", regex: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{40,}/ },
  { tipo: "segredo:chave-aws", descricao: "chave de acesso da AWS", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { tipo: "segredo:chave-google", descricao: "chave de API do Google", regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { tipo: "segredo:token-slack", descricao: "token do Slack", regex: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { tipo: "segredo:chave-stripe", descricao: "chave secreta do Stripe", regex: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}/ },
  { tipo: "segredo:token-huggingface", descricao: "token do Hugging Face", regex: /\bhf_[A-Za-z0-9]{34,}\b/ },
  { tipo: "segredo:chave-supabase", descricao: "chave secreta do Supabase", regex: /\bsb_secret_[A-Za-z0-9_-]{20,}/ },
  { tipo: "segredo:token-npm", descricao: "token do npm", regex: /\bnpm_[A-Za-z0-9]{36}\b/ },
];

const emRegistros = (p) => p.startsWith("registros/") && !p.startsWith("registros/_modelos/") && p !== "registros/ALVO_ATIVO";
const proibido = (p) => CAMINHOS_PROIBIDOS.some((c) => p === c.slice(0, -1) || p.startsWith(c));
/** Mesmo critério do git para numstat sem .gitattributes: byte NUL nos primeiros 8000 bytes. */
export const ehBinario = (bytes) => bytes.subarray(0, 8000).includes(0);

/** Lê e valida as exceções. Exceção sem caminho, tipo ou motivo é recusada (vira problema, não some). */
export function lerExcecoes(texto) {
  const problemas = [];
  let lista;
  try {
    lista = JSON.parse(texto);
  } catch (erro) {
    return { excecoes: [], problemas: [{ caminho: ARQUIVO_EXCECOES, tipo: "excecao-invalida", mensagem: `JSON inválido: ${/** @type {Error} */ (erro).message}` }] };
  }
  if (!Array.isArray(lista)) return { excecoes: [], problemas: [{ caminho: ARQUIVO_EXCECOES, tipo: "excecao-invalida", mensagem: "precisa ser uma lista" }] };
  const excecoes = [];
  lista.forEach((e, i) => {
    const falta = ["caminho", "tipo", "motivo"].filter((k) => typeof e?.[k] !== "string" || !e[k].trim());
    if (falta.length) problemas.push({ caminho: ARQUIVO_EXCECOES, tipo: "excecao-invalida", mensagem: `exceção ${i + 1} sem ${falta.join(", ")}` });
    else excecoes.push(e);
  });
  return { excecoes, problemas };
}

function blocosLongos(caminho, texto) {
  const problemas = [];
  const linhas = texto.split(/\r?\n/);
  let aberto = null;
  for (let i = 0; i < linhas.length; i++) {
    const cerca = linhas[i].match(/^\s*(```|~~~)\s*([\w-]*)/);
    if (!cerca) continue;
    if (aberto === null) aberto = { inicio: i, lang: cerca[2].toLowerCase() };
    else {
      const n = i - aberto.inicio - 1;
      if (aberto.lang !== "mermaid" && n > MAX_LINHAS_CODIGO)
        problemas.push({ caminho, linha: aberto.inicio + 1, tipo: "bloco-extenso", mensagem: `bloco de código com ${n} linhas (limite ${MAX_LINHAS_CODIGO}; use fórmula em notação própria ou trecho curto)` });
      aberto = null;
    }
  }
  return problemas;
}

function segredos(caminho, texto) {
  const problemas = [];
  texto.split(/\r?\n/).forEach((linha, i) => {
    for (const r of REGRAS_SEGREDO)
      if (r.regex.test(linha)) problemas.push({ caminho, linha: i + 1, tipo: r.tipo, mensagem: `possível ${r.descricao} (valor omitido)` });
  });
  return problemas;
}

/**
 * Decisão pura. `mudancas`: [{ estado: "A"|"C"|"M"|"R"|"D", caminho, caminhoAntigo?, conteudo: Buffer }].
 * Devolve os problemas ({ caminho, linha?, tipo, mensagem }) que sobram depois das exceções.
 * @param {{ estado: string, caminho: string, caminhoAntigo?: string, conteudo?: any }[]} mudancas
 * @param {{ excecoes?: { caminho: string, tipo: string }[] }} [opcoes]
 * @returns {Problema[]}
 */
export function avaliar(mudancas, { excecoes = [] } = {}) {
  /** @type {Problema[]} */
  const problemas = [];
  for (const m of mudancas) {
    if (m.estado === "D") continue;
    const { caminho } = m;
    const bytes = m.conteudo ?? Buffer.alloc(0);
    for (const p of [caminho, m.caminhoAntigo].filter(Boolean))
      if (proibido(p))
        problemas.push({ caminho, tipo: "caminho-proibido", mensagem: `${p === caminho ? "" : `renomeado de ${p}: `}caminho proibido no repositório público (${CAMINHOS_PROIBIDOS.join(", ")} ficam fora do git)` });
    const binario = ehBinario(bytes);
    if (!binario) problemas.push(...segredos(caminho, bytes.toString("utf8")));
    if (!emRegistros(caminho)) continue;
    if (binario) problemas.push({ caminho, tipo: "binario", mensagem: "arquivo binário" });
    else if (!EXTENSOES_REGISTROS.test(caminho))
      problemas.push({ caminho, tipo: "extensao", mensagem: "extensão não permitida em registros/ (dados brutos e assets vão em saidas/)" });
    else if (bytes.length > MAX_BYTES)
      problemas.push({ caminho, tipo: "tamanho", mensagem: `${Math.round(bytes.length / 1024)} KB (limite ${MAX_BYTES / 1024} KB)` });
    else if (/\.md$/i.test(caminho)) problemas.push(...blocosLongos(caminho, bytes.toString("utf8")));
  }
  return problemas.filter((p) => !excecoes.some((e) => e.caminho === p.caminho && e.tipo === p.tipo));
}

/** Texto do relatório: caminho, linha e tipo; nunca o conteúdo da linha. */
export function relatorio(problemas) {
  if (!problemas.length) return "";
  return [
    "[publicação] O repositório é público. Bloqueado:",
    ...problemas.map((p) => `  - ${p.caminho}${p.linha ? `:${p.linha}` : ""}: ${p.mensagem} [${p.tipo}]`),
    "Mova dados brutos para saidas/<slug>/ (fora do git) ou resuma no registro. Segredo: tire do arquivo e troque a credencial.",
    "Falso positivo: exceção em scripts/publicacao/excecoes.json (caminho, tipo, motivo) com teste.",
    "Esta checagem não dispensa a revisão humana de origem do que vai ser publicado.",
  ].join("\n");
}

// --- montagem da entrada a partir do git (a mesma para o hook e para a CI) ------------------------

const gitPadrao = (cwd) => (args, binario = false) =>
  execFileSync("git", args, { cwd, maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"], ...(binario ? {} : { encoding: "utf8" }) });

/** @typedef {{ cwd?: string, git?: (args: string[], binario?: boolean) => any }} OpcoesGit */
/** @typedef {{ caminho: string, linha?: number, tipo: string, mensagem: string }} Problema */

/** Converte a saída de `git diff --name-status -z` em mudanças, lendo o conteúdo com `ler(caminho)`. */
export function mudancasDeNameStatus(saida, ler) {
  const campos = saida.split("\0").filter(Boolean);
  const mudancas = [];
  for (let i = 0; i < campos.length; ) {
    const estado = campos[i++][0];
    const caminhoAntigo = estado === "R" || estado === "C" ? campos[i++] : undefined;
    const caminho = campos[i++];
    mudancas.push({ estado, caminho, caminhoAntigo, conteudo: estado === "D" ? undefined : ler(caminho) });
  }
  return mudancas;
}

const DIFF = ["diff", "--name-status", "-z", "-M", "--no-ext-diff", "--diff-filter=ACMRD"];

/**
 * O que vai entrar no commit (entrada do pre-commit).
 * @param {OpcoesGit} [opcoes]
 */
export function mudancasDoIndice({ cwd, git = gitPadrao(cwd) } = {}) {
  return mudancasDeNameStatus(git([...DIFF, "--cached"]), (p) => git(["show", `:${p}`], true));
}

/**
 * Diff de um PR: base...head (entrada da CI).
 * @param {string} base
 * @param {string} head
 * @param {OpcoesGit} [opcoes]
 */
export function mudancasEntre(base, head, { cwd, git = gitPadrao(cwd) } = {}) {
  return mudancasDeNameStatus(git([...DIFF, `${base}...${head}`]), (p) => git(["show", `${head}:${p}`], true));
}

/**
 * Todos os arquivos rastreados em `ref`, como se fossem adicionados (componente do verificador).
 * @param {string} [ref]
 * @param {OpcoesGit} [opcoes]
 */
export function mudancasDaArvore(ref = "HEAD", { cwd, git = gitPadrao(cwd) } = {}) {
  return git(["ls-tree", "-r", "-z", "--name-only", ref])
    .split("\0")
    .filter(Boolean)
    .map((caminho) => ({ estado: "A", caminho, conteudo: git(["show", `${ref}:${caminho}`], true) }));
}

/**
 * Exceções versionadas, lidas da mesma fonte que as mudanças (índice, head do PR ou disco).
 * @param {string | undefined} texto
 * @returns {{ excecoes: any[], problemas: Problema[] }}
 */
export function carregarExcecoes(texto) {
  return texto === undefined ? { excecoes: [], problemas: [] } : lerExcecoes(texto);
}

/** Decisão completa sobre uma entrada já montada: problemas das exceções inválidas mais os da política. */
export function decidir(mudancas, textoExcecoes) {
  const { excecoes, problemas } = carregarExcecoes(textoExcecoes);
  return [...problemas, ...avaliar(mudancas, { excecoes })];
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const raiz = fileURLToPath(new URL("../../", import.meta.url));
  const git = gitPadrao(process.cwd());
  const tentar = (f) => {
    try {
      return f();
    } catch {
      return undefined;
    }
  };
  let mudancas;
  let excecoes;
  try {
    if (args[0] === "--indice") {
      mudancas = mudancasDoIndice({ git });
      excecoes = tentar(() => git(["show", `:${ARQUIVO_EXCECOES}`]));
    } else if (args[0] === "--base" && args[2] === "--head" && args[1] && args[3]) {
      mudancas = mudancasEntre(args[1], args[3], { git });
      excecoes = tentar(() => git(["show", `${args[3]}:${ARQUIVO_EXCECOES}`]));
    } else if (args[0] === "--arvore") {
      mudancas = mudancasDaArvore(args[1] ?? "HEAD", { git });
      excecoes = tentar(() => readFileSync(`${raiz}${ARQUIVO_EXCECOES}`, "utf8"));
    } else {
      console.error("uso: publicacao.mjs --indice | --base <ref> --head <ref> | --arvore [<ref>]");
      process.exit(2);
    }
  } catch (erro) {
    console.error(`[publicação] não consegui ler as mudanças do git (bloqueado por segurança): ${/** @type {Error} */ (erro).message}`);
    process.exit(2);
  }
  const problemas = decidir(mudancas, excecoes);
  if (problemas.length) {
    console.error(relatorio(problemas));
    process.exit(1);
  }
  console.log(`[publicação] ${mudancas.length} arquivo(s) conferido(s), nenhum problema. A revisão humana de origem continua necessária.`);
}
