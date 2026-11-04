#!/usr/bin/env node
// Verificador de consistência de integrações (story MEL-05, fatia 1; ADR-0001 §2f, pontos 1 a 8).
// Confere, só por leitura estática, se servidor MCP, mapa de níveis, matcher do gate, versões, modelo do
// 00-seguranca.md e documentação em prosa concordam entre si. Cada achado diz o contrato incompleto, o
// arquivo, o campo e o que falta.
//
// Não corrige nada, não grava arquivo, não usa rede, não executa o REA nem o Ghidra e só lê a lista fechada
// ARQUIVOS_FIXOS mais os mapas .claude/hooks/<servidor>-niveis.json (nunca alvos/, saidas/ nem registros/<slug>/).
//
// Uso: node scripts/integracoes/verificar-integracoes.mjs
// Código de saída: 0 sem achado · 1 com achado.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Contratos que um achado pode apontar (AC9). */
export const CONTRATOS = {
  mcp: ".mcp.json",
  mapa: "mapa",
  matcher: "matcher",
  versao: "versão",
  modelo: "modelo",
  documentacao: "documentação",
};

const MCP = ".mcp.json";
const SETTINGS = ".claude/settings.json";
const HOOKS = ".claude/hooks";
const PACOTE = "package.json";
const LOCK = "package-lock.json";
const MODELO = "registros/_modelos/00-seguranca.md";
const GUIA = "docs/guia-rea.md";
const RUNBOOK = "docs/runbook-prereqs-nativo.md";

/** Arquivos lidos, além dos mapas de .claude/hooks/ (AC14). */
export const ARQUIVOS_FIXOS = [MCP, SETTINGS, PACOTE, LOCK, MODELO, GUIA, RUNBOOK];

// Mesmo conjunto de nomes de servidor da regex do gate (rea-gate.mjs:63), em minúsculas.
const NOME_SERVIDOR = /^[a-z0-9-]+$/;
const NOME_TOOL = /^[A-Za-z0-9_-]+$/;
const FORMA_MATCHER = /^mcp__\(([a-z0-9-]+(?:\|[a-z0-9-]+)*)\)__\.\*$/;
// Valores de status do modelo (comentário do próprio registros/_modelos/00-seguranca.md).
const STATUS_RECONHECIDOS = new Set(["pendente", "aprovado", "reprovado"]);

/**
 * @typedef {{ contrato: string, arquivo: string, campo: string, mensagem: string }} Achado
 * @typedef {{ texto?: string, erro?: string }} Leitura
 * @typedef {{ ler: (rel: string) => Leitura, listar: (rel: string) => Leitura & { nomes?: string[] } }} Fs
 */

const motivoErro = (erro) => (erro && typeof erro === "object" && "code" in erro && erro.code === "ENOENT" ? "ausente" : "ilegível");

/** Leitura padrão, relativa à raiz; erro vira motivo, nunca exceção. */
export function lerArquivosPadrao(raiz) {
  /** @type {Fs} */
  const fs = {
    ler(rel) {
      try {
        return { texto: readFileSync(join(raiz, rel), "utf8") };
      } catch (erro) {
        return { erro: motivoErro(erro) };
      }
    },
    listar(rel) {
      try {
        return { nomes: readdirSync(join(raiz, rel)) };
      } catch (erro) {
        return { erro: motivoErro(erro) };
      }
    },
  };
  return fs;
}

/** Uma linha por achado: "[contrato] arquivo (campo): mensagem" (a do AC3 é multilinha por exigência do ADR). */
export function formatarAchado(a) {
  return `[${a.contrato}] ${a.arquivo} (${a.campo}): ${a.mensagem}`;
}

// ---------- matcher (D-3, hooks reference do Claude Code) ----------

/**
 * Casamento do matcher como o Claude Code faz: só letras, dígitos, _, -, espaço, "," e "|" é lista de nomes
 * exatos; outro caractere torna-o regex JavaScript testada com RegExp.prototype.test (parcial); vazio ou "*"
 * casa tudo. `ancorado` testa a mesma regex com ^(?:…)$.
 */
export function casaMatcher(matcher, nome, { ancorado = false } = {}) {
  const m = String(matcher ?? "");
  if (m.trim() === "" || m.trim() === "*") return true;
  if (/^[A-Za-z0-9_\- ,|]+$/.test(m))
    return m
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(nome);
  try {
    return new RegExp(ancorado ? `^(?:${m})$` : m).test(nome);
  } catch {
    return false;
  }
}

/** Cobertura do servidor: mcp__<servidor>__x casa nas leituras parcial e ancorada. */
export function cobreServidor(matcher, servidor) {
  const chamada = `mcp__${servidor}__x`;
  return casaMatcher(matcher, chamada) && casaMatcher(matcher, chamada, { ancorado: true });
}

// ---------- modelo do 00-seguranca.md (regras de rea-gate.mjs:150,157,183-193,278-281) ----------

const HEADING_IDENTIDADE = /^##\s+(?:\d+\.\s*)?Identidade dos arquivos\s*$/;

/** O que o gate leria do texto: frontmatter, status, niveis_aprovados (null se não for lista inline) e seções de identidade. */
export function lerModelo(texto) {
  const front = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const secoesIdentidade = texto.split(/\r?\n/).filter((l) => HEADING_IDENTIDADE.test(l)).length;
  if (front === undefined) return { frontmatter: false, status: undefined, niveisAprovados: null, secoesIdentidade };
  const status = front.match(/^status:\s*(\S+)/m)?.[1];
  const lista = front.match(/^niveis_aprovados:\s*\[([^\]]*)\]/m)?.[1];
  const niveisAprovados =
    lista === undefined
      ? null
      : lista
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  return { frontmatter: true, status, niveisAprovados, secoesIdentidade };
}

// ---------- verificação ----------

const lerJson = (fs, rel, contrato, achados) => {
  const r = fs.ler(rel);
  if (r.erro !== undefined) {
    achados.push({ contrato, arquivo: rel, campo: "(arquivo)", mensagem: `arquivo ${r.erro}: o contrato não pode ser conferido` });
    return undefined;
  }
  try {
    return JSON.parse(String(r.texto).replace(/^﻿/, ""));
  } catch {
    achados.push({ contrato, arquivo: rel, campo: "(JSON)", mensagem: "JSON ilegível: o contrato não pode ser conferido" });
    return undefined;
  }
};

const lerTexto = (fs, rel, contrato, achados) => {
  const r = fs.ler(rel);
  if (r.erro !== undefined) {
    achados.push({ contrato, arquivo: rel, campo: "(arquivo)", mensagem: `arquivo ${r.erro}: o contrato não pode ser conferido` });
    return undefined;
  }
  return String(r.texto);
};

const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const crase = (lista) => lista.map((s) => `\`${s}\``).join(", ");
const mapaDe = (servidor) => `${HOOKS}/${servidor}-niveis.json`;
const abreviado = (commit) => `${commit.slice(0, 7)}…`;

/** Commit completo do GhidraMCP nos args do servidor ghidra do .mcp.json, ou undefined. */
const commitDoMcp = (servidores) => {
  const args = servidores?.ghidra?.args;
  if (!Array.isArray(args)) return undefined;
  for (const a of args) {
    const m = String(a).match(/GhidraMCP@([0-9a-f]{7,40})$/i);
    if (m) return m[1].toLowerCase();
  }
  return undefined;
};

function conferirMatcher(settings, servidores, achados) {
  const entradas = Array.isArray(settings?.hooks?.PreToolUse) ? settings.hooks.PreToolUse : [];
  const doGate = entradas
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => Array.isArray(e?.hooks) && e.hooks.some((h) => /\.claude\/hooks\/rea-gate\.mjs/.test(String(h?.command ?? ""))));
  if (doGate.length === 0) {
    achados.push({ contrato: CONTRATOS.matcher, arquivo: SETTINGS, campo: "hooks.PreToolUse", mensagem: "nenhuma entrada de PreToolUse aciona .claude/hooks/rea-gate.mjs: as tools MCP ficariam sem trava" });
    return;
  }
  const citados = new Set();
  for (const { e, i } of doGate) {
    const matcher = typeof e.matcher === "string" ? e.matcher : "";
    const forma = matcher.match(FORMA_MATCHER);
    if (!forma)
      achados.push({
        contrato: CONTRATOS.matcher,
        arquivo: SETTINGS,
        campo: `hooks.PreToolUse[${i}].matcher`,
        mensagem: `matcher "${matcher.slice(0, 80)}" fora da forma \`mcp__(n1|n2…)__.*\` com nomes em [a-z0-9-]+: cobertura não conferível, reprovado por segurança`,
      });
    else for (const n of forma[1].split("|")) citados.add(n);
  }
  if (!servidores) return;
  for (const servidor of Object.keys(servidores)) {
    if (!doGate.some(({ e }) => cobreServidor(typeof e.matcher === "string" ? e.matcher : "", servidor)))
      achados.push({
        contrato: CONTRATOS.matcher,
        arquivo: SETTINGS,
        campo: "hooks.PreToolUse[].matcher",
        mensagem: `integração incompleta: servidor \`${servidor}\` sem cobertura do matcher do gate (mcp__${servidor}__* ficaria sem trava)`,
      });
  }
  for (const n of citados)
    if (!Object.hasOwn(servidores, n))
      achados.push({ contrato: CONTRATOS.matcher, arquivo: SETTINGS, campo: "hooks.PreToolUse[].matcher", mensagem: `matcher cita o servidor \`${n}\`, que não está configurado em .mcp.json` });
}

function mensagemMapaOrfao(arquivo, servidor, servidoresMcp, sobrando) {
  const divergente = sobrando.length ? `dar o mesmo nome aos dois; o .mcp.json tem ${crase(sobrando)} sem mapa` : "dar o mesmo nome aos dois";
  return [
    `integração incompleta: mapa ${arquivo} sem servidor no .mcp.json`,
    `  servidor derivado do nome: \`${servidor}\` (mcp__${servidor}__); servidores do .mcp.json: ${crase(servidoresMcp) || "(nenhum)"}`,
    "  causas prováveis e solução:",
    `  - servidor removido do .mcp.json e mapa esquecido → apagar o mapa e tirar o servidor do matcher (${SETTINGS})`,
    `  - nome do servidor divergente entre o mapa e a chave do .mcp.json → ${divergente}`,
    "  - mapa de servidor ainda não registrado → registrar o servidor no .mcp.json e no matcher, depois da auditoria e da fixação de versão (regra de servidor novo de RE no CLAUDE.md)",
    "  o verificador não corrige nada: a correção é manual",
  ].join("\n");
}

function conferirMapa(arquivo, mapa, achados) {
  if (!ehObjeto(mapa.ferramentas) || Object.keys(mapa.ferramentas).length === 0) {
    achados.push({ contrato: CONTRATOS.mapa, arquivo, campo: "ferramentas", mensagem: "`ferramentas` ausente, vazio ou fora da forma objeto: nenhuma tool classificada" });
    return;
  }
  const temNiveis = ehObjeto(mapa.niveis) && Object.keys(mapa.niveis).length > 0;
  if (!temNiveis) achados.push({ contrato: CONTRATOS.mapa, arquivo, campo: "niveis", mensagem: "mapa sem `niveis`: os níveis das tools não podem ser conferidos" });
  for (const [tool, nivel] of Object.entries(mapa.ferramentas)) {
    const campo = `ferramentas.${tool}`;
    if (!NOME_TOOL.test(tool)) {
      achados.push({ contrato: CONTRATOS.mapa, arquivo, campo, mensagem: `nome de tool \`${tool.slice(0, 60)}\` fora de ^[A-Za-z0-9_-]+$` });
      continue;
    }
    if (tool in {}) {
      achados.push({ contrato: CONTRATOS.mapa, arquivo, campo, mensagem: `nome de tool \`${tool}\` colide com propriedade herdada de objeto` });
      continue;
    }
    if (typeof nivel !== "string" || nivel === "") achados.push({ contrato: CONTRATOS.mapa, arquivo, campo, mensagem: `tool \`${tool}\` sem nível (classificação ausente, vazia ou que não é texto)` });
    else if (temNiveis && !Object.hasOwn(mapa.niveis, nivel))
      achados.push({ contrato: CONTRATOS.mapa, arquivo, campo, mensagem: `nível inválido \`${nivel.slice(0, 20)}\` na tool \`${tool}\`: não existe em \`niveis\` do mapa` });
  }
}

const niveisIguais = (a, b) => {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
};

function conferirVersoes(fs, mapas, servidores, achados) {
  const rea = mapas.get("rea");
  if (rea) {
    const pacote = lerJson(fs, PACOTE, CONTRATOS.versao, achados);
    const lock = lerJson(fs, LOCK, CONTRATOS.versao, achados);
    if (pacote && lock) {
      const vMapa = typeof rea.mapa.rea_version === "string" ? rea.mapa.rea_version : undefined;
      const vPacote = pacote.dependencies?.["rea-agents"];
      const vLock = lock.packages?.["node_modules/rea-agents"]?.version;
      if (!vMapa || vMapa !== vPacote || vPacote !== vLock)
        achados.push({
          contrato: CONTRATOS.versao,
          arquivo: rea.arquivo,
          campo: "rea_version",
          mensagem: `versões do rea-agents divergentes ou ausentes: ${rea.arquivo} (rea_version) = ${vMapa ?? "(ausente)"}, package.json (dependencies.rea-agents) = ${vPacote ?? "(ausente)"}, package-lock.json (packages["node_modules/rea-agents"].version) = ${vLock ?? "(ausente)"}`,
        });
    }
  }
  const ghidra = mapas.get("ghidra");
  if (ghidra && servidores) {
    const doMapa = String(ghidra.mapa.versao ?? "").match(/commit\s+([0-9a-f]{7,40})\b/i)?.[1]?.toLowerCase();
    const doMcp = commitDoMcp(servidores);
    if (!doMapa)
      achados.push({ contrato: CONTRATOS.versao, arquivo: ghidra.arquivo, campo: "versao", mensagem: "campo `versao` sem commit legível (esperado \"commit <hex>\"): a fixação não pode ser conferida" });
    else if (!doMcp)
      achados.push({ contrato: CONTRATOS.versao, arquivo: MCP, campo: "mcpServers.ghidra.args", mensagem: "args do servidor ghidra sem referência GhidraMCP@<commit>: a fixação não pode ser conferida" });
    else if (!doMcp.startsWith(doMapa))
      achados.push({ contrato: CONTRATOS.versao, arquivo: ghidra.arquivo, campo: "versao", mensagem: `commit \`${doMapa}\` do mapa não é prefixo do commit \`${abreviado(doMcp)}\` do .mcp.json (mcpServers.ghidra.args)` });
  }
}

function conferirModelo(fs, achados) {
  const texto = lerTexto(fs, MODELO, CONTRATOS.modelo, achados);
  if (texto === undefined) return;
  const l = lerModelo(texto);
  const achado = (campo, mensagem) => achados.push({ contrato: CONTRATOS.modelo, arquivo: MODELO, campo, mensagem });
  if (!l.frontmatter) achado("frontmatter", "sem frontmatter delimitado por ---: o gate não leria status nem niveis_aprovados");
  else {
    if (!l.status || !STATUS_RECONHECIDOS.has(l.status))
      achado("status", `\`status\` com valor não reconhecido (${(l.status ?? "ausente").slice(0, 30)}); o gate lê o texto como está: use ${[...STATUS_RECONHECIDOS].join(" | ")}, sem aspas`);
    if (l.niveisAprovados === null) achado("niveis_aprovados", "`niveis_aprovados` fora de lista inline numa linha ([N0, N1]): o gate leria a lista como vazia");
  }
  if (l.secoesIdentidade === 0) achado("Identidade dos arquivos", 'sem a seção "Identidade dos arquivos": o gate bloquearia toda admissão do alvo');
  else if (l.secoesIdentidade > 1) achado("Identidade dos arquivos", `seção "Identidade dos arquivos" repetida (${l.secoesIdentidade}): o gate trataria o hash como ambíguo`);
}

function conferirGuia(fs, servidores, achados) {
  const texto = lerTexto(fs, GUIA, CONTRATOS.documentacao, achados);
  if (texto === undefined || !servidores) return;
  for (const servidor of Object.keys(servidores)) {
    const nome = servidor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`(^|[^A-Za-z0-9_-])${nome}([^A-Za-z0-9_-]|$)`).test(texto))
      achados.push({ contrato: CONTRATOS.documentacao, arquivo: GUIA, campo: `servidor ${servidor}`, mensagem: `servidor \`${servidor}\` do .mcp.json não citado em ${GUIA}` });
    if (!texto.includes(`${servidor}-niveis.json`))
      achados.push({ contrato: CONTRATOS.documentacao, arquivo: GUIA, campo: `mapa ${servidor}-niveis.json`, mensagem: `${GUIA} não cita o mapa \`${servidor}-niveis.json\` do servidor \`${servidor}\`` });
  }
}

function conferirRunbook(fs, servidores, achados) {
  const texto = lerTexto(fs, RUNBOOK, CONTRATOS.documentacao, achados);
  if (texto === undefined) return;
  const refs = [...texto.matchAll(/GhidraMCP@([^\s"'`)\],;]*)/g)].map((m) => m[1].replace(/\.+$/, ""));
  if (refs.length === 0) {
    achados.push({ contrato: CONTRATOS.documentacao, arquivo: RUNBOOK, campo: "GhidraMCP@<ref>", mensagem: `${RUNBOOK} não tem referência \`GhidraMCP@<ref>\` a conferir com o commit do .mcp.json` });
    return;
  }
  const commit = servidores ? commitDoMcp(servidores) : undefined;
  if (!commit) {
    achados.push({ contrato: CONTRATOS.documentacao, arquivo: RUNBOOK, campo: "GhidraMCP@<ref>", mensagem: "sem commit GhidraMCP@<commit> no .mcp.json para conferir as referências do runbook" });
    return;
  }
  for (const ref of new Set(refs))
    if (!/^[0-9a-f]+$/i.test(ref) || !commit.startsWith(ref.toLowerCase()))
      achados.push({
        contrato: CONTRATOS.documentacao,
        arquivo: RUNBOOK,
        campo: `GhidraMCP@${ref.slice(0, 40)}`,
        mensagem: `referência \`GhidraMCP@${ref.slice(0, 40)}\` não é prefixo do commit \`${abreviado(commit)}\` do .mcp.json (mcpServers.ghidra.args)`,
      });
}

/**
 * Confere os contratos de integração do projeto em `raiz` (ADR-0001 §2f, pontos 1 a 8).
 * @param {string} raiz
 * @param {{ fs?: Fs }} [opcoes] leitura injetável (testes); o padrão lê do disco, sem escrever.
 * @returns {Achado[]}
 */
export function verificarIntegracoes(raiz, { fs = lerArquivosPadrao(raiz) } = {}) {
  /** @type {Achado[]} */
  const achados = [];

  // .mcp.json: servidores declarados.
  const mcp = lerJson(fs, MCP, CONTRATOS.mcp, achados);
  /** @type {Record<string, any> | undefined} */
  let servidores;
  if (mcp !== undefined) {
    if (!ehObjeto(mcp.mcpServers) || Object.keys(mcp.mcpServers).length === 0)
      achados.push({ contrato: CONTRATOS.mcp, arquivo: MCP, campo: "mcpServers", mensagem: ".mcp.json sem servidores em mcpServers: nada a conferir, reprovado por segurança" });
    else servidores = mcp.mcpServers;
  }

  // Mapas de níveis, descobertos pelo nome (<servidor>-niveis.json ↔ mcp__<servidor>__, rea-gate.mjs:63-85).
  /** @type {Map<string, { arquivo: string, mapa: any }>} */
  const mapas = new Map();
  /** @type {string[]} */
  const nomesMapas = [];
  const lista = fs.listar(HOOKS);
  if (lista.erro !== undefined)
    achados.push({ contrato: CONTRATOS.mapa, arquivo: HOOKS, campo: "(pasta)", mensagem: `pasta ${lista.erro}: os mapas de níveis não podem ser conferidos` });
  else
    for (const nome of [...(lista.nomes ?? [])].sort()) {
      const m = nome.match(/^(.+)-niveis\.json$/);
      if (!m) continue;
      nomesMapas.push(m[1]);
      const arquivo = `${HOOKS}/${nome}`;
      const mapa = lerJson(fs, arquivo, CONTRATOS.mapa, achados);
      if (mapa === undefined) continue;
      if (!ehObjeto(mapa)) {
        achados.push({ contrato: CONTRATOS.mapa, arquivo, campo: "(JSON)", mensagem: "mapa não é um objeto JSON" });
        continue;
      }
      mapas.set(m[1], { arquivo, mapa });
      conferirMapa(arquivo, mapa, achados);
    }

  // Ponto 1: servidores × mapas.
  if (servidores) {
    const nomesMcp = Object.keys(servidores);
    for (const servidor of nomesMcp) {
      if (!NOME_SERVIDOR.test(servidor))
        achados.push({
          contrato: CONTRATOS.mcp,
          arquivo: MCP,
          campo: `mcpServers.${servidor}`,
          mensagem: `servidor \`${servidor}\` com nome fora de [a-z0-9-]+ (o conjunto do gate): o tratamento desse nome pelo Claude Code não é documentado`,
        });
      if (lista.erro === undefined && !nomesMapas.includes(servidor))
        achados.push({ contrato: CONTRATOS.mapa, arquivo: mapaDe(servidor), campo: "(arquivo)", mensagem: `integração incompleta: servidor \`${servidor}\` sem mapa de níveis (o gate negaria toda tool dele)` });
    }
    const sobrando = nomesMcp.filter((s) => !nomesMapas.includes(s));
    for (const servidor of nomesMapas)
      if (!Object.hasOwn(servidores, servidor))
        achados.push({ contrato: CONTRATOS.mapa, arquivo: mapaDe(servidor), campo: "(arquivo)", mensagem: mensagemMapaOrfao(mapaDe(servidor), servidor, nomesMcp, sobrando) });
  }

  // Ponto 1: matcher do gate.
  const settings = lerJson(fs, SETTINGS, CONTRATOS.matcher, achados);
  if (settings !== undefined) conferirMatcher(settings, servidores, achados);

  // Ponto 3: niveis iguais entre os mapas (comparação profunda).
  const comNiveis = [...mapas.values()].filter((m) => ehObjeto(m.mapa.niveis) && Object.keys(m.mapa.niveis).length > 0);
  for (const outro of comNiveis.slice(1))
    if (!niveisIguais(comNiveis[0].mapa.niveis, outro.mapa.niveis))
      achados.push({ contrato: CONTRATOS.mapa, arquivo: outro.arquivo, campo: "niveis", mensagem: `\`niveis\` diferente entre ${comNiveis[0].arquivo} e ${outro.arquivo} (chaves ou texto)` });

  // Pontos 4 a 8.
  conferirVersoes(fs, mapas, servidores, achados);
  conferirModelo(fs, achados);
  conferirGuia(fs, servidores, achados);
  conferirRunbook(fs, servidores, achados);
  return achados;
}

if (import.meta.main) {
  const raiz = fileURLToPath(new URL("../../", import.meta.url));
  const achados = verificarIntegracoes(raiz);
  for (const a of achados) console.log(formatarAchado(a));
  console.log(achados.length ? `\n${achados.length} achado(s) de integração. O verificador não corrige nada: a correção é manual.` : "Integrações coerentes: nenhum achado.");
  process.exit(achados.length ? 1 : 0);
}
