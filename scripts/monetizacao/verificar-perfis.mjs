#!/usr/bin/env node
// Checagem dos padrões de monetização nos projetos de reimplementacoes/ (protocolo-monetizacao).
// Fonte dos IDs, classes e aliases: docs/catalogo-monetizacao.md. Confere declarações (perfil
// monetizacao.json e marcadores "MON-NNNN" no código), não o comportamento do código. Bloqueia:
// - qualquer padrão de classe C, no perfil ou em marcador no código;
// - ID fora do catálogo;
// - classe B sem justificativa ou limites;
// - perfil com classe B sem aprovação válida: data real e não futura, e perfil_sha256 igual ao
//   hash desta revisão do perfil (uma aprovação antiga não vale para parâmetros novos);
// - padrão "Infantojuvenil: proibido" com menores prováveis (children_likely true ou "unknown",
//   ou publico "infantojuvenil");
// - padrão "Público: somente adulto" fora de publico "adulto" com children_likely false;
// - marcador no código sem o padrão declarado no perfil;
// - perfil inválido.
// Alias (ID antigo MON-<classe>-NN) é aceito com aviso para migrar.
// Uso: node scripts/monetizacao/verificar-perfis.mjs          (lê a árvore de trabalho)
//      node scripts/monetizacao/verificar-perfis.mjs --hash <monetizacao.json>
// O .githooks/pre-commit.mjs chama verificarProjetos() com o conteúdo do índice.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const CATALOGO = "docs/catalogo-monetizacao.md";
export const RAIZ = "reimplementacoes/";
const PERFIL = "monetizacao.json";
const PUBLICOS = ["adulto", "geral", "infantojuvenil"];
const PASTAS_IGNORADAS = new Set(["bin", "obj", ".vs", "node_modules", "TestResults", "publish"]);
const MARCADOR = /\bMON-(?:\d{4}|[A-Z]-\d{2})\b/g;
const TITULO = /^###\s+(MON-\d{4})\s+[—-]\s+(.+?)\s*$/;
const CAMPO = /^-\s+\*\*(Classe|Infantojuvenil|Público|Aliases):\*\*\s+(.+?)\s*$/;

// Lê o catálogo em Markdown: "### MON-NNNN — nome" + itens Classe, Infantojuvenil, Público, Aliases.
export function lerCatalogo(texto) {
  const padroes = new Map();
  const aliases = new Map();
  const erros = [];
  const versao = Number(texto.match(/^versao:\s*(\d+)\s*$/m)?.[1]);
  let atual = null;
  const fechar = () => {
    if (!atual) return;
    if (!["A", "B", "C"].includes(atual.classe)) erros.push(`${CATALOGO}: ${atual.id} sem "Classe" A, B ou C`);
    else if (atual.classe !== "C" && atual.infantojuvenil === null)
      erros.push(`${CATALOGO}: ${atual.id} sem a linha "Infantojuvenil"`);
    if (atual.classe === "C") atual.infantojuvenil = "proibido";
  };
  for (const linha of texto.split(/\r?\n/)) {
    const titulo = linha.match(TITULO);
    if (titulo) {
      fechar();
      const [, id, nome] = titulo;
      if (padroes.has(id)) erros.push(`${CATALOGO}: ${id} duplicado`);
      atual = { id, nome, classe: null, infantojuvenil: null, somenteAdulto: false };
      padroes.set(id, atual);
      continue;
    }
    if (/^#{1,3}\s/.test(linha)) {
      fechar();
      atual = null;
      continue;
    }
    const campo = atual && linha.match(CAMPO);
    if (!campo) continue;
    const [, nomeCampo, valor] = campo;
    if (nomeCampo === "Classe") atual.classe = valor.trim().toUpperCase();
    else if (nomeCampo === "Infantojuvenil") atual.infantojuvenil = /^proibido\b/i.test(valor) ? "proibido" : /^permitido\b/i.test(valor) ? "permitido" : null;
    else if (nomeCampo === "Público") atual.somenteAdulto = /^somente adulto\b/i.test(valor);
    else
      for (const alias of valor.match(/MON-[A-Z]-\d{2}/g) ?? []) {
        if (aliases.has(alias)) erros.push(`${CATALOGO}: alias ${alias} usado por ${aliases.get(alias)} e ${atual.id}`);
        aliases.set(alias, atual.id);
      }
  }
  fechar();
  if (padroes.size === 0) erros.push(`${CATALOGO}: nenhum padrão encontrado`);
  return { versao, padroes, aliases, erros };
}

// Hash de uma revisão do perfil: JSON canônico (chaves ordenadas) sem o campo "aprovacao".
const canonico = (valor) =>
  Array.isArray(valor)
    ? `[${valor.map(canonico).join(",")}]`
    : valor && typeof valor === "object"
      ? `{${Object.keys(valor).sort().map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(",")}}`
      : JSON.stringify(valor);
export function hashPerfil(perfil) {
  const { aprovacao, ...resto } = perfil;
  return createHash("sha256").update(canonico(resto)).digest("hex");
}

const hojeLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Data de calendário real (AAAA-MM-DD) e não posterior a hoje.
const dataValida = (texto, hoje) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto ?? "");
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const real = d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
  return real && texto <= hoje;
};

const textoPreenchido = (v) => typeof v === "string" && v.trim().length > 0;

// Resolve ID estável ou alias. Retorna { padrao, id, alias } ou { motivo }.
const resolver = (catalogo, id) => {
  if (catalogo.padroes.has(id)) return { padrao: catalogo.padroes.get(id), id };
  const novo = catalogo.aliases?.get(id);
  if (novo) return { padrao: catalogo.padroes.get(novo), id: novo, alias: id };
  return { motivo: "fora do catálogo" };
};

// arquivos: Map<caminho relativo com "/", conteúdo em texto> só de reimplementacoes/.
export function verificarProjetos({ catalogo, arquivos, hoje = hojeLocal() }) {
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
    if (/\.md$/i.test(caminho)) continue; // documentação pode citar IDs ("não usamos MON-0021")
    conteudo.split(/\r?\n/).forEach((linha, i) => {
      for (const m of linha.matchAll(MARCADOR)) projeto.marcadores.push({ id: m[0], local: `${caminho}:${i + 1}` });
    });
  }

  for (const [nome, { perfil, marcadores }] of projetos) {
    const declarados = new Set();
    if (perfil) verificarPerfil(perfil, catalogo, declarados, problemas, avisos, hoje);
    for (const { id, local } of marcadores) {
      const r = resolver(catalogo, id);
      if (!r.padrao) {
        problemas.push(`${local}: marcador ${id} ${r.motivo}`);
        continue;
      }
      if (r.alias) avisos.push(`${local}: marcador ${id} é ID antigo; use ${r.id}`);
      if (r.padrao.classe === "C") problemas.push(`${local}: marcador ${id} (${r.id}, ${r.padrao.nome}) é classe C, proibida em projeto nosso`);
      else if (!declarados.has(r.id)) problemas.push(`${local}: marcador ${id} sem declaração em ${RAIZ}${nome}/${PERFIL}`);
    }
  }
  // Catálogo com defeito só bloqueia quando algum projeto usa padrões.
  const usaPadroes = [...projetos.values()].some((p) => p.perfil || p.marcadores.length);
  if (usaPadroes) problemas.unshift(...catalogo.erros);
  return { problemas, avisos };
}

function verificarPerfil({ caminho, conteudo }, catalogo, declarados, problemas, avisos, hoje) {
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
  if (!PUBLICOS.includes(perfil.publico)) problemas.push(`${caminho}: "publico" precisa ser ${PUBLICOS.join(", ")}`);
  const criancas = perfil.children_likely;
  if (![true, false, "unknown"].includes(criancas))
    problemas.push(`${caminho}: "children_likely" precisa ser true, false ou "unknown" (acesso provável por menores, ECA Digital art. 20)`);
  if (criancas === false && !textoPreenchido(perfil.children_likely_fundamento))
    problemas.push(`${caminho}: children_likely false exige "children_likely_fundamento"`);
  if (criancas === false && perfil.publico === "infantojuvenil")
    problemas.push(`${caminho}: publico "infantojuvenil" com children_likely false é contraditório`);
  const menores = perfil.publico === "infantojuvenil" || criancas !== false;

  if (!Number.isInteger(perfil.catalogo_versao)) problemas.push(`${caminho}: "catalogo_versao" ausente`);
  else if (Number.isInteger(catalogo.versao) && perfil.catalogo_versao !== catalogo.versao)
    avisos.push(`${caminho}: feito para o catálogo v${perfil.catalogo_versao}, atual é v${catalogo.versao}; revisar`);
  if (!Array.isArray(perfil.padroes)) {
    problemas.push(`${caminho}: "padroes" precisa ser uma lista`);
    return;
  }
  let temB = false;
  perfil.padroes.forEach((entrada, i) => {
    const onde = `${caminho}: padroes[${i}]`;
    const id = entrada?.id;
    if (typeof id !== "string") {
      problemas.push(`${onde}: sem "id"`);
      return;
    }
    const r = resolver(catalogo, id);
    if (!r.padrao) {
      problemas.push(`${onde}: ${id} ${r.motivo}`);
      return;
    }
    const { padrao } = r;
    const nome = r.alias ? `${id} (${r.id}, ${padrao.nome})` : `${id} (${padrao.nome})`;
    if (r.alias) avisos.push(`${onde}: ${id} é ID antigo; use ${r.id}`);
    if (declarados.has(r.id)) problemas.push(`${onde}: ${r.id} declarado mais de uma vez`);
    declarados.add(r.id);
    if (entrada.aprovacao !== undefined)
      problemas.push(`${onde}: "aprovacao" por padrão não vale mais; a aprovação fica na raiz do perfil, presa ao hash`);
    if (padrao.classe === "C") {
      problemas.push(`${onde}: ${nome} é classe C, proibida em projeto nosso`);
      return;
    }
    if (menores && padrao.infantojuvenil === "proibido")
      problemas.push(`${onde}: ${nome} é proibido com menores prováveis (publico "${perfil.publico}", children_likely ${JSON.stringify(criancas)})`);
    else if (padrao.somenteAdulto && (perfil.publico !== "adulto" || criancas !== false))
      problemas.push(`${onde}: ${nome} é somente para público adulto com children_likely false`);
    if (padrao.classe === "B") {
      temB = true;
      if (!textoPreenchido(entrada.justificativa)) problemas.push(`${onde}: ${nome} é classe B e precisa de "justificativa"`);
      if (!textoPreenchido(entrada.limites)) problemas.push(`${onde}: ${nome} é classe B e precisa de "limites"`);
    }
  });

  if (temB) {
    const aprovacao = perfil.aprovacao;
    const esperado = hashPerfil(perfil);
    if (!textoPreenchido(aprovacao?.por)) problemas.push(`${caminho}: perfil com classe B precisa de "aprovacao.por"`);
    if (!dataValida(aprovacao?.data, hoje))
      problemas.push(`${caminho}: "aprovacao.data" precisa ser uma data real, AAAA-MM-DD, não posterior a hoje (${hoje})`);
    if (aprovacao?.perfil_sha256 !== esperado)
      problemas.push(
        `${caminho}: "aprovacao.perfil_sha256" não corresponde a esta revisão do perfil (esperado ${esperado}); o perfil mudou depois da aprovação ou não foi aprovado`,
      );
  }
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
  const i = process.argv.indexOf("--hash");
  if (i >= 0) {
    try {
      process.stdout.write(`${hashPerfil(JSON.parse(readFileSync(process.argv[i + 1], "utf8")))}\n`);
    } catch (error) {
      process.stderr.write(`[monetizacao] Não consegui calcular o hash: ${error.message}\n`);
      process.exit(1);
    }
    process.exit(0);
  }
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
