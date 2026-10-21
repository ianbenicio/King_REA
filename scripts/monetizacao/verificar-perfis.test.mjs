// Testes da checagem de monetização: node --test scripts/monetizacao/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lerCatalogo, verificarProjetos } from "./verificar-perfis.mjs";

const real = lerCatalogo(readFileSync(new URL("../../docs/catalogo-monetizacao.md", import.meta.url), "utf8"));

const aprovado = { por: "responsável", data: "2026-10-20" };
const perfil = (dados) => JSON.stringify({ catalogo_versao: 1, publico: "geral", ...dados });
const rodar = (arquivos, catalogo = real) => verificarProjetos({ catalogo, arquivos: new Map(Object.entries(arquivos)) });

test("catálogo real: sem erros, três classes, linha Infantojuvenil em A e B", () => {
  assert.deepEqual(real.erros, []);
  assert.equal(real.versao, 1);
  const classes = new Set([...real.padroes.values()].map((p) => p.classe));
  assert.deepEqual([...classes].sort(), ["A", "B", "C"]);
  assert.equal(real.padroes.get("MON-B-02").infantojuvenil, "proibido");
  assert.equal(real.padroes.get("MON-A-01").infantojuvenil, "permitido");
});

test("projeto sem perfil nem marcadores passa", () => {
  const r = rodar({ "reimplementacoes/notepad/src/App.cs": "class App {}", "reimplementacoes/notepad/README.md": "x" });
  assert.deepEqual(r.problemas, []);
});

test("perfil só com classe A passa", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-A-02", parametros: { intervalo_minimo_s: 30 } }] }),
    "reimplementacoes/jogo/src/Ads.cs": "// MON-A-02\nvoid ShowInterstitial() {}",
  });
  assert.deepEqual(r.problemas, []);
});

test("classe C no perfil é bloqueada", () => {
  const r = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-C-01" }] }) });
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /MON-C-01.*classe C/);
});

test("marcador de classe C no código é bloqueado mesmo sem perfil", () => {
  const r = rodar({ "reimplementacoes/jogo/src/Close.cs": "int x;\n// MON-C-01 fechar pequeno\n" });
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /Close\.cs:2: marcador MON-C-01/);
});

test("classe C citada em Markdown não bloqueia", () => {
  const r = rodar({ "reimplementacoes/jogo/README.md": "Não usamos MON-C-01." });
  assert.deepEqual(r.problemas, []);
});

test("classe B exige justificativa, limites e aprovação", () => {
  const sem = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-B-01" }] }) });
  assert.equal(sem.problemas.length, 3);
  const com = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({
      padroes: [{ id: "MON-B-01", justificativa: "ritmo de sessão", limites: "recarga grátis a cada 20 min", aprovacao: aprovado }],
    }),
  });
  assert.deepEqual(com.problemas, []);
});

test("aprovação com data fora do formato é bloqueada", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({
      padroes: [{ id: "MON-B-01", justificativa: "x", limites: "y", aprovacao: { por: "responsável", data: "20/10/2026" } }],
    }),
  });
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /aprovacao/);
});

test("padrão proibido para infantojuvenil é bloqueado nesse público", () => {
  const entrada = { id: "MON-B-02", justificativa: "x", limites: "y", aprovacao: aprovado };
  const infanto = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ publico: "infantojuvenil", padroes: [entrada] }) });
  assert.equal(infanto.problemas.length, 1);
  assert.match(infanto.problemas[0], /infantojuvenil/);
  const adulto = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ publico: "adulto", padroes: [entrada] }) });
  assert.deepEqual(adulto.problemas, []);
});

test("ID fora do catálogo é bloqueado, no perfil e no código", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-A-99" }] }),
    "reimplementacoes/jogo/src/X.cs": "// MON-Z-01",
  });
  assert.equal(r.problemas.length, 2);
});

test("marcador sem declaração no perfil é bloqueado", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-A-01" }] }),
    "reimplementacoes/jogo/src/X.cs": "// MON-A-02",
  });
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /sem declaração/);
});

test("perfil inválido é bloqueado", () => {
  assert.equal(rodar({ "reimplementacoes/jogo/monetizacao.json": "{ quebrado" }).problemas.length, 1);
  const semPublico = rodar({ "reimplementacoes/jogo/monetizacao.json": JSON.stringify({ catalogo_versao: 1, padroes: [] }) });
  assert.match(semPublico.problemas[0], /publico/);
});

test("ID duplicado no perfil é bloqueado", () => {
  const r = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-A-01" }, { id: "MON-A-01" }] }) });
  assert.equal(r.problemas.length, 1);
});

test("versão do catálogo diferente gera aviso, não bloqueio", () => {
  const r = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ catalogo_versao: 0, padroes: [] }) });
  assert.deepEqual(r.problemas, []);
  assert.equal(r.avisos.length, 1);
});

test("pastas bin/ e obj/ são ignoradas", () => {
  const r = rodar({ "reimplementacoes/jogo/obj/gerado.cs": "// MON-C-01", "reimplementacoes/jogo/bin/x.txt": "MON-C-02" });
  assert.deepEqual(r.problemas, []);
});

test("catálogo com defeito só bloqueia quando há padrões em uso", () => {
  const ruim = lerCatalogo("---\nversao: 1\n---\n### MON-A-01 — sem linha infanto\n");
  assert.equal(ruim.erros.length, 1);
  assert.deepEqual(rodar({ "reimplementacoes/notepad/App.cs": "x" }, ruim).problemas, []);
  const r = rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-A-01" }] }) }, ruim);
  assert.match(r.problemas[0], /Infantojuvenil/);
});
