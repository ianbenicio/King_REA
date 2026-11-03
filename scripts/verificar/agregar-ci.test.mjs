// Testes do agregador da CI (npm test; AC7 da story MEL-08). Só JSON sintético, no formato do
// `npm run verificar -- --json`: nada de rede, dotnet ou Docker.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ESTADOS, SAIDA } from "./verificar.mjs";
import { AVISO_WPF, AVISO_WPF_SEM_JSON, JOBS, agregarCi } from "./agregar-ci.mjs";

const aprovado = (id) => ({ id, estado: ESTADOS.aprovado, duracao_s: 1.5, detalhe: "ok" });
const json = (resultados) => JSON.stringify({ data: "2026-11-02T00:00:00.000Z", total: {}, resultados });
const job = (id, trocar = {}) => {
  const { componentes } = JOBS.find((j) => j.id === id);
  return json(componentes.map((c) => trocar[c] ?? aprovado(c)));
};
const todos = (trocas = {}) => new Map(JOBS.map((j) => [j.id, job(j.id, trocas[j.id])]));
const linhaDe = (r, id) => r.linhas.find((l) => l.id === id);

test("situação 1 do desenho §5: todos os obrigatórios aprovados → verde", () => {
  const r = agregarCi(todos());
  assert.equal(r.decisao.estado, "aprovado");
  assert.equal(r.decisao.codigo, SAIDA.aprovado);
  assert.deepEqual(r.decisao.observacoes, []);
  assert.match(r.resumo, /^## Resultado agregado: APROVADO/);
  assert.match(r.resumo, /\| Job \| Componente \| Classe \| Estado \| Duração \(s\) \| Motivo \|/);
  assert.match(r.resumo, /\| js \| monetizacao \| obrigatório \| aprovado \| 1\.5 \| — \|/);
  assert.equal(r.linhas.length, JOBS.flatMap((j) => j.componentes).length, "uma linha por componente esperado");
});

test("situação 2: um obrigatório falhou → vermelho, com o motivo na tabela", () => {
  const falha = { id: "notepad-core", estado: ESTADOS.falhou, duracao_s: 9.2, motivo: "dotnet test saiu com código 1", detalhe: "Assert.Equal() Failure em C:\\algum\\caminho" };
  const r = agregarCi(todos({ dotnet: { "notepad-core": falha } }));
  assert.equal(r.decisao.estado, "reprovado");
  assert.equal(r.decisao.codigo, SAIDA.falhou);
  assert.match(r.resumo, /\| dotnet \| notepad-core \| obrigatório \| falhou \| 9\.2 \| dotnet test saiu com código 1 \|/);
  assert.doesNotMatch(r.resumo, /Assert\.Equal|algum/, "o detalhe da saída não vai para o resumo público");
});

test("situação 3: um obrigatório não executado (requisito ausente) → vermelho, incompleto", () => {
  const ne = { id: "dotnet-restore", estado: ESTADOS.naoExecutado, duracao_s: 0, motivo: "requisito ausente: comando dotnet não encontrado no PATH" };
  const r = agregarCi(todos({ dotnet: { "dotnet-restore": ne } }));
  assert.equal(r.decisao.estado, "incompleto");
  assert.equal(r.decisao.codigo, SAIDA.incompleto);
  assert.notEqual(r.decisao.codigo, SAIDA.aprovado);
  assert.ok(r.decisao.observacoes.some((o) => /Incompleto: 1 componente\(s\) obrigatório\(s\) não executado\(s\)/.test(o)));
  assert.match(r.resumo, /^## Resultado agregado: INCOMPLETO/);
});

test("situação 4: JSON faltando (job cancelado) → incompleto, cada componente do job sem estado aprovado", () => {
  const entradas = todos();
  entradas.delete("js");
  const r = agregarCi(entradas);
  assert.equal(r.decisao.codigo, SAIDA.incompleto);
  for (const id of JOBS.find((j) => j.id === "js").componentes) {
    assert.equal(linhaDe(r, id).estado, ESTADOS.naoExecutado, id);
    assert.match(linhaDe(r, id).motivo, /JSON do job ausente/);
  }
  assert.match(r.resumo, /\| js \| ambiente-node \| obrigatório \| não executado \| — \| JSON do job ausente/);
});

test("situação 5: só o wpf-interativo não executado → verde no obrigatório, com o aviso do WPF", () => {
  const ne = { id: "notepad-ui", estado: ESTADOS.naoExecutado, duracao_s: 0.4, motivo: "requisito ausente: não executável neste runner: foco_de_teclado" };
  const r = agregarCi(todos({ "wpf-interativo": { "notepad-ui": ne } }));
  assert.equal(r.decisao.estado, "aprovado");
  assert.equal(r.decisao.codigo, SAIDA.aprovado);
  assert.deepEqual(r.decisao.observacoes, [`${AVISO_WPF}.`]);
  assert.match(r.resumo, /WPF: não executável neste runner, validação local pendente/);
  assert.match(r.resumo, /\| wpf-interativo \| notepad-ui \| dependente de ambiente \| não executado \|/);
});

test("WPF com a sonda aprovada e asserção falhando → vermelho (decisão do responsável, 2026-11-02)", () => {
  const falha = { id: "notepad-ui", estado: ESTADOS.falhou, duracao_s: 30, motivo: "dotnet test saiu com código 1" };
  const r = agregarCi(todos({ "wpf-interativo": { "notepad-ui": falha } }));
  assert.equal(r.decisao.codigo, SAIDA.falhou);
});

test("JSON inválido, sem resultados, componente ausente ou estado desconhecido nunca contam como aprovado", () => {
  const casos = [
    ["{ não é json", /JSON do job inválido/],
    [JSON.stringify({ total: { estado: "aprovado" } }), /sem a lista de resultados/],
    [json([aprovado("dotnet-restore"), aprovado("notepad-build")]), /componente ausente do JSON do job/],
    [json([aprovado("dotnet-restore"), aprovado("notepad-build"), { id: "notepad-core", estado: "verde" }]), /estado desconhecido/],
  ];
  for (const [texto, motivo] of casos) {
    const entradas = todos();
    entradas.set("dotnet", texto);
    const r = agregarCi(entradas);
    assert.equal(r.decisao.codigo, SAIDA.incompleto, String(motivo));
    assert.match(linhaDe(r, "notepad-core").motivo, motivo);
  }
});

test("componente repetido no JSON não esconde a falha (QA-E24A-02)", () => {
  const falha = { id: "notepad-core", estado: ESTADOS.falhou, motivo: "dotnet test saiu com código 1" };
  const entradas = todos();
  entradas.set("dotnet", json([aprovado("dotnet-restore"), aprovado("notepad-build"), falha, aprovado("notepad-core")]));
  const r = agregarCi(entradas);
  assert.notEqual(r.decisao.codigo, SAIDA.aprovado);
  assert.match(linhaDe(r, "notepad-core").motivo, /componente repetido/);
});

test("cabeçalho do npm run antes do JSON é inválido; BOM é tolerado (QA-E24A-01)", () => {
  const cabecalho = todos();
  cabecalho.set("dotnet", `\n> prking-rea@0.1.0 verificar\n> node scripts/verificar/verificar.mjs --so notepad-core --json\n\n${job("dotnet")}`);
  const r = agregarCi(cabecalho);
  assert.equal(r.decisao.codigo, SAIDA.incompleto);
  assert.match(linhaDe(r, "notepad-core").motivo, /JSON do job inválido/);
  const bom = todos();
  bom.set("dotnet", `﻿${job("dotnet")}`);
  assert.equal(agregarCi(bom).decisao.codigo, SAIDA.aprovado);
});

test("WPF sem JSON (job cancelado) tem aviso próprio, não o de pré-requisito ausente (QA-E24A-05)", () => {
  const entradas = todos();
  entradas.delete("wpf-interativo");
  const r = agregarCi(entradas);
  assert.equal(r.decisao.codigo, SAIDA.aprovado);
  assert.deepEqual(r.decisao.observacoes, [`${AVISO_WPF_SEM_JSON}.`]);
});

test("falha vence incompleto; nenhum JSON é incompleto, não verde", () => {
  const falha = { id: "js", estado: ESTADOS.falhou, motivo: "node --run test saiu com código 1" };
  const entradas = todos({ js: { js: falha } });
  entradas.delete("dotnet");
  assert.equal(agregarCi(entradas).decisao.codigo, SAIDA.falhou);
  assert.equal(agregarCi(new Map()).decisao.codigo, SAIDA.incompleto);
  assert.equal(agregarCi(todos(), []).decisao.codigo, SAIDA.incompleto, "nenhum job declarado não é sucesso");
});

test("motivo com barra vertical ou quebra de linha não quebra a tabela", () => {
  const falha = { id: "monetizacao", estado: ESTADOS.falhou, motivo: "a | b\nc" };
  const r = agregarCi(todos({ js: { monetizacao: falha } }));
  assert.match(r.resumo, /\| a \\\| b c \|/);
});

test("componentes declarados nos jobs existem no verificador", async () => {
  const { COMPONENTES } = await import("./verificar.mjs");
  const ids = new Set(COMPONENTES.map((c) => c.id));
  for (const j of JOBS) for (const c of j.componentes) assert.ok(ids.has(c), `${j.id} → ${c}`);
});

test("FALHA PLANTADA da E2-5: nao fazer merge", () => {
  assert.equal(1, 2);
});
