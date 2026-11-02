#!/usr/bin/env node
// Resultado agregado da CI (MEL-08; desenho em docs/planos/2026-11-01-desenho-ci-mel08.md, §5).
// Lê o JSON que cada job publicou com `npm run verificar -- --so … --json` e decide o estado final.
// Falha vence tudo; obrigatório não executado (requisito ausente, job cancelado, JSON faltando ou
// inválido) deixa incompleto; o WPF é categoria própria: não executado não reprova, mas fica dito
// no resumo, e falha de asserção reprova (decisão do responsável em 2026-11-02).
//
// Uso: node scripts/verificar/agregar-ci.mjs --dir <pasta com verificar-<job>.json> [--resumo <arquivo>]
// Código de saída: o mesmo do verificador (0 aprovado · 1 reprovado · 3 incompleto · 2 uso inválido).
//
// O resumo traz só id, estado, duração e motivo de cada componente; o `detalhe` (cauda da saída de
// quem falhou) nunca é copiado, porque os logs da CI são públicos.
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ESTADOS, SAIDA } from "./verificar.mjs";

export const CLASSES = { obrigatorio: "obrigatório", ambiente: "dependente de ambiente" };

// Jobs da CI e os componentes do verificador que cada um responde (desenho §2). `semgrep` e
// `publicacao` entram na fatia 2, com as decisões do responsável (desenho §9) e a MEL-04.
export const JOBS = [
  { id: "js", classe: CLASSES.obrigatorio, componentes: ["ambiente-node", "dependencias-npm", "sintaxe-js", "js", "monetizacao"] },
  { id: "dotnet", classe: CLASSES.obrigatorio, componentes: ["dotnet-restore", "notepad-build", "notepad-core"] },
  { id: "wpf-interativo", classe: CLASSES.ambiente, componentes: ["notepad-ui"] },
];

export const AVISO_WPF = "WPF: não executável neste runner, validação local pendente";

const ESTADOS_VALIDOS = new Set(Object.values(ESTADOS));

/** Resultados do verificador num JSON publicado por um job, ou o motivo de não servirem. */
function lerResultados(texto) {
  if (texto === undefined || texto === null) return { motivo: "JSON do job ausente (job cancelado, não concluído ou sem artefato)" };
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return { motivo: "JSON do job inválido" };
  }
  if (!Array.isArray(dados?.resultados)) return { motivo: "JSON do job sem a lista de resultados" };
  return { porId: new Map(dados.resultados.filter((r) => typeof r?.id === "string").map((r) => [r.id, r])) };
}

/** Uma linha por componente esperado. Componente que não veio, ou com estado desconhecido, não conta como aprovado. */
export function linhasDoJob(job, texto) {
  const lido = lerResultados(texto);
  return job.componentes.map((id) => {
    const base = { job: job.id, classe: job.classe, id };
    if (lido.motivo) return { ...base, estado: ESTADOS.naoExecutado, duracao_s: null, motivo: lido.motivo };
    const r = lido.porId.get(id);
    if (!r) return { ...base, estado: ESTADOS.naoExecutado, duracao_s: null, motivo: "componente ausente do JSON do job" };
    if (!ESTADOS_VALIDOS.has(r.estado)) return { ...base, estado: ESTADOS.naoExecutado, duracao_s: null, motivo: "estado desconhecido no JSON do job" };
    const duracao = typeof r.duracao_s === "number" ? r.duracao_s : null;
    return { ...base, estado: r.estado, duracao_s: duracao, motivo: r.estado === ESTADOS.aprovado ? "" : String(r.motivo ?? "") };
  });
}

/** Estado final e observações a partir das linhas de todos os jobs. */
export function decidir(linhas) {
  const obrigatorias = linhas.filter((l) => l.classe === CLASSES.obrigatorio);
  const ambiente = linhas.filter((l) => l.classe === CLASSES.ambiente);
  const observacoes = [];
  let total;
  if (linhas.some((l) => l.estado === ESTADOS.falhou)) total = { estado: "reprovado", codigo: SAIDA.falhou };
  else if (obrigatorias.length === 0 || obrigatorias.some((l) => l.estado !== ESTADOS.aprovado)) {
    total = { estado: "incompleto", codigo: SAIDA.incompleto };
    const faltando = obrigatorias.filter((l) => l.estado === ESTADOS.naoExecutado).length;
    observacoes.push(obrigatorias.length === 0 ? "Incompleto: nenhum componente obrigatório declarado." : `Incompleto: ${faltando} componente(s) obrigatório(s) não executado(s).`);
  } else total = { estado: "aprovado", codigo: SAIDA.aprovado };
  if (ambiente.some((l) => l.estado === ESTADOS.naoExecutado)) observacoes.push(`${AVISO_WPF}.`);
  return { ...total, observacoes };
}

const celula = (v) => String(v ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|");

/** Resumo em Markdown (componente, estado, duração, motivo), para o resumo do job. */
export function resumoMarkdown(linhas, decisao) {
  const saida = [
    `## Resultado agregado: ${decisao.estado.toUpperCase()}`,
    "",
    "| Job | Componente | Classe | Estado | Duração (s) | Motivo |",
    "|---|---|---|---|---|---|",
    ...linhas.map((l) => `| ${celula(l.job)} | ${celula(l.id)} | ${celula(l.classe)} | ${celula(l.estado)} | ${l.duracao_s ?? "—"} | ${celula(l.motivo) || "—"} |`),
  ];
  if (decisao.observacoes.length) saida.push("", ...decisao.observacoes.map((o) => `- ${o}`));
  return `${saida.join("\n")}\n`;
}

/** Agrega os textos JSON publicados (mapa job → texto; ausente = undefined). */
export function agregarCi(jsonPorJob, jobs = JOBS) {
  const linhas = jobs.flatMap((job) => linhasDoJob(job, jsonPorJob.get(job.id)));
  const decisao = decidir(linhas);
  return { linhas, decisao, resumo: resumoMarkdown(linhas, decisao) };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const valor = (nome) => {
    const i = args.indexOf(nome);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const dir = valor("--dir");
  if (!dir) {
    console.error("[agregar-ci] uso: node scripts/verificar/agregar-ci.mjs --dir <pasta> [--resumo <arquivo>]");
    process.exit(SAIDA.uso);
  }
  const jsonPorJob = new Map(
    JOBS.map((j) => {
      const arquivo = join(dir, `verificar-${j.id}.json`);
      return [j.id, existsSync(arquivo) ? readFileSync(arquivo, "utf8") : undefined];
    }),
  );
  const { decisao, resumo } = agregarCi(jsonPorJob);
  process.stdout.write(resumo);
  const destino = valor("--resumo");
  if (destino) appendFileSync(destino, resumo);
  process.exit(decisao.codigo);
}
