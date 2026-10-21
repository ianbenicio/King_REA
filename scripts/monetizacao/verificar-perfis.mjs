#!/usr/bin/env node
// Checagem dos padrões de monetização nos projetos de reimplementacoes/ (protocolo-monetizacao).
// Fonte dos IDs e classes: docs/catalogo-monetizacao.md. Bloqueia:
// - qualquer ID de classe C, no perfil (monetizacao.json) ou em marcador no código;
// - ID fora do catálogo;
// - classe B sem justificativa, limites ou aprovação com data;
// - padrão "Infantojuvenil: proibido" em projeto com publico "infantojuvenil";
// - padrão "Público: somente adulto" em projeto com publico diferente de "adulto";
// - ID retirado do catálogo (indica o ID novo);
// - marcador no código sem o padrão declarado no perfil;
// - perfil inválido.
// Uso: node scripts/monetizacao/verificar-perfis.mjs   (lê a árvore de trabalho)
// O .githooks/pre-commit.mjs chama verificarProjetos() com o conteúdo do índice.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const CATALOGO = "docs/catalogo-monetizacao.md";
export const RAIZ = "reimplementacoes/";
const PERFIL = "monetizacao.json";
const PUBLICOS = ["adulto", "geral", "infantojuvenil"];
const PASTAS_IGNORADAS = new Set(["bin", "obj", ".vs", "node_modules", "TestResults", "publish"]);
const MARCADOR = /\bMON-([A-Z])-(\d{2})\b/g;
const TITULO = /^###\s+(MON-([A-Z])-(\d{2}))\s+[—-]\s+(.+?)\s*$/;
const INFANTOJUVENIL = /^-\s+\*\*Infantojuvenil:\*\*\s+(permitido|proibido)\b/;
const SOMENTE_ADULTO = /^-\s+\*\*Público:\*\*\s+somente adulto\b/;
const RETIRADO = /^-\s+\*\*(MON-[A-Z]-\d{2})\*\*\s+→\s+(MON-[A-Z]-\d{2})\b/;

// Lê o catálogo em Markdown: "### MON-<classe>-NN — nome" + linhas "Infantojuvenil" (A e B)
// e "Público: somente adulto" (opcional); "- **MON-X-NN** → MON-Y-NN" marca ID retirado.
export function lerCatalogo(texto) {
  const padroes = new Map();
  const retirados = new Map();
  const erros = [];
  const versao = Number(texto.match(/^versao:\s*(\d+)\s*$/m)?.[1]);
  let atual = null;
  const fechar = () => {
    if (atual && atual.classe !== "C" && atual.infantojuvenil === null)
      erros.push(`${CATALOGO}: ${atual.id} sem a linha "Infantojuvenil"`);
  };
  for (const linha of texto.split(/\r?\n/)) {
    const titulo = linha.match(TITULO);
    if (titulo) {
      fechar();
      const [, id, classe, , nome] = titulo;
      if (!["A", "B", "C"].includes(classe)) erros.push(`${CATALOGO}: ${id} com classe desconhecida`);
      if (padroes.has(id)) erros.push(`${CATALOGO}: ${id} duplicado`);
      atual = { id, classe, nome, infantojuvenil: classe === "C" ? "proibido" : null, somenteAdulto: false };
      padroes.set(id, atual);
      continue;
    }
    if (/^#{1,3}\s/.test(linha)) {
      fechar();
      atual = null;
      continue;
    }
    const retirado = linha.match(RETIRADO);
    if (retirado) {
      retirados.set(retirado[1], retirado[2]);
      continue;
    }
    if (!atual) continue;
    const infanto = linha.match(INFANTOJUVENIL);
    if (infanto && atual.classe !== "C") atual.infantojuvenil = infanto[1];
    if (SOMENTE_ADULTO.test(linha)) atual.somenteAdulto = true;
  }
  fechar();
  if (padroes.size === 0) erros.push(`${CATALOGO}: nenhum padrão encontrado`);
  for (const [velho, novo] of retirados) {
    if (padroes.has(velho)) erros.push(`${CATALOGO}: ${velho} está retirado e definido ao mesmo tempo`);
    if (!padroes.has(novo)) erros.push(`${CATALOGO}: ${velho} retirado aponta para ${novo}, que não existe`);
  }
  return { versao, padroes, retirados, erros };
}

const textoPreenchido = (v) => typeof v === "string" && v.trim().length > 0;

// arquivos: Map<caminho relativo com "/", conteúdo em texto> só de reimplementacoes/.
export function verificarProjetos({ catalogo, arquivos }) {
  const problemas = [];
  const avisos = [];
  const projetos = new Map();
  for (const [caminho, conteudo] of arquivos) {
    if (!caminho.startsWith(RAIZ)) continue;
    const partes = caminho.slice(RAIZ.length).split("/");
    if (partes.length < 2) continue;
    if (partes.some((p) => PASTAS_IGNORADAS.has(p))) continue;
    const nome = partes[0];
    if (!projetos.has(nome)) projetos.set(nome, { perfil: null, marcadores: [] });
    const projeto = projetos.get(nome);
    if (partes.length === 2 && partes[1] === PERFIL) {
      projeto.perfil = { caminho, conteudo };
      continue;
    }
    if (/\.md$/i.test(caminho)) continue; // documentação pode citar IDs ("não usamos MON-C-01")
    conteudo.split(/\r?\n/).forEach((linha, i) => {
      for (const m of linha.matchAll(MARCADOR)) projeto.marcadores.push({ id: m[0], local: `${caminho}:${i + 1}` });
    });
  }

  for (const [nome, { perfil, marcadores }] of projetos) {
    const declarados = new Set();
    if (perfil) verificarPerfil(perfil, catalogo, declarados, problemas, avisos);
    for (const { id, local } of marcadores) {
      const padrao = catalogo.padroes.get(id);
      if (!padrao) problemas.push(`${local}: marcador ${id} ${foraDoCatalogo(catalogo, id)}`);
      else if (padrao.classe === "C") problemas.push(`${local}: marcador ${id} (${padrao.nome}) é classe C, proibida em projeto nosso`);
      else if (!declarados.has(id))
        problemas.push(`${local}: marcador ${id} sem declaração em ${RAIZ}${nome}/${PERFIL}`);
    }
  }
  // Catálogo com defeito só bloqueia quando algum projeto usa padrões.
  const usaPadroes = [...projetos.values()].some((p) => p.perfil || p.marcadores.length);
  if (usaPadroes) problemas.unshift(...catalogo.erros);
  return { problemas, avisos };
}

const foraDoCatalogo = (catalogo, id) => {
  const novo = catalogo.retirados?.get(id);
  if (!novo) return "fora do catálogo";
  const padrao = catalogo.padroes.get(novo);
  return `retirado do catálogo; agora é ${novo} (classe ${padrao?.classe ?? "?"}), revise`;
};

function verificarPerfil({ caminho, conteudo }, catalogo, declarados, problemas, avisos) {
  let perfil;
  try {
    perfil = JSON.parse(conteudo);
  } catch (error) {
    problemas.push(`${caminho}: JSON inválido (${error.message})`);
    return;
  }
  if (typeof perfil !== "object" || perfil === null || Array.isArray(perfil)) {
    problemas.push(`${caminho}: o perfil precisa ser um objeto`);
    return;
  }
  if (!PUBLICOS.includes(perfil.publico))
    problemas.push(`${caminho}: "publico" precisa ser ${PUBLICOS.join(", ")} (na dúvida, infantojuvenil)`);
  if (!Number.isInteger(perfil.catalogo_versao)) problemas.push(`${caminho}: "catalogo_versao" ausente`);
  else if (Number.isInteger(catalogo.versao) && perfil.catalogo_versao !== catalogo.versao)
    avisos.push(`${caminho}: feito para o catálogo v${perfil.catalogo_versao}, atual é v${catalogo.versao}; revisar`);
  if (!Array.isArray(perfil.padroes)) {
    problemas.push(`${caminho}: "padroes" precisa ser uma lista`);
    return;
  }
  perfil.padroes.forEach((entrada, i) => {
    const onde = `${caminho}: padroes[${i}]`;
    const id = entrada?.id;
    if (typeof id !== "string") {
      problemas.push(`${onde}: sem "id"`);
      return;
    }
    const padrao = catalogo.padroes.get(id);
    if (!padrao) {
      problemas.push(`${onde}: ${id} ${foraDoCatalogo(catalogo, id)}`);
      return;
    }
    if (declarados.has(id)) problemas.push(`${onde}: ${id} declarado mais de uma vez`);
    declarados.add(id);
    if (padrao.classe === "C") {
      problemas.push(`${onde}: ${id} (${padrao.nome}) é classe C, proibida em projeto nosso`);
      return;
    }
    if (perfil.publico === "infantojuvenil" && padrao.infantojuvenil === "proibido")
      problemas.push(`${onde}: ${id} (${padrao.nome}) é proibido em projeto infantojuvenil`);
    else if (padrao.somenteAdulto && perfil.publico !== "adulto")
      problemas.push(`${onde}: ${id} (${padrao.nome}) é somente para público adulto; "${perfil.publico}" tem acesso provável por menores`);
    if (padrao.classe === "B") {
      if (!textoPreenchido(entrada.justificativa)) problemas.push(`${onde}: ${id} é classe B e precisa de "justificativa"`);
      if (!textoPreenchido(entrada.limites)) problemas.push(`${onde}: ${id} é classe B e precisa de "limites"`);
      const aprovacao = entrada.aprovacao;
      if (!textoPreenchido(aprovacao?.por) || !/^\d{4}-\d{2}-\d{2}$/.test(aprovacao?.data ?? ""))
        problemas.push(`${onde}: ${id} é classe B e precisa de "aprovacao" com "por" e "data" (AAAA-MM-DD)`);
    }
  });
}

export function relatorio({ problemas, avisos }) {
  const partes = [];
  if (avisos.length) partes.push("[monetizacao] Avisos:\n" + avisos.map((a) => `  - ${a}`).join("\n"));
  if (problemas.length)
    partes.push(
      "[monetizacao] Padrões de monetização bloqueados (docs/catalogo-monetizacao.md):\n" +
        problemas.map((p) => `  - ${p}`).join("\n"),
    );
  return partes.join("\n\n");
}

function lerArvore(raizProjeto) {
  const arquivos = new Map();
  const visitar = (pasta) => {
    let entradas;
    try {
      entradas = readdirSync(pasta, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      const caminho = join(pasta, entrada.name);
      if (entrada.isDirectory()) {
        if (!PASTAS_IGNORADAS.has(entrada.name)) visitar(caminho);
        continue;
      }
      if (!entrada.isFile() || statSync(caminho).size > 2 * 1024 * 1024) continue;
      const bytes = readFileSync(caminho);
      if (bytes.subarray(0, 8000).includes(0)) continue; // binário
      arquivos.set(relative(raizProjeto, caminho).split(sep).join("/"), bytes.toString("utf8"));
    }
  };
  visitar(join(raizProjeto, RAIZ));
  return arquivos;
}

if (import.meta.main) {
  const raizProjeto = fileURLToPath(new URL("../../", import.meta.url));
  let texto;
  try {
    texto = readFileSync(join(raizProjeto, CATALOGO), "utf8");
  } catch (error) {
    process.stderr.write(`[monetizacao] Não consegui ler ${CATALOGO}: ${error.message}\n`);
    process.exit(1);
  }
  const resultado = verificarProjetos({ catalogo: lerCatalogo(texto), arquivos: lerArvore(raizProjeto) });
  const saida = relatorio(resultado);
  if (saida) process.stderr.write(`\n${saida}\n\n`);
  if (resultado.problemas.length) process.exit(1);
  process.stdout.write("[monetizacao] OK: nenhum padrão bloqueado em reimplementacoes/.\n");
}
