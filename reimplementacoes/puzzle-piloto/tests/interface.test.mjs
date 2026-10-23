// Testes do modelo de tela (F7, U1; ESPECIFICACAO.md, seção 10) e teste do teste por mutação.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { contraste } from "../src/interface/cores.mjs";
import { anuncioAposEventos, cenaDaSessao } from "../src/interface/cenas.mjs";
import { CENAS_CONHECIDAS, PAPEIS, TEMPOS, montarTela, tocar } from "../src/interface/tela.mjs";
import { criarSessao } from "../src/sessao/sessao.mjs";
import { criarSdkSimulado } from "../src/monetizacao/sdk-simulado.mjs";
import { ofertaContinuar, ofertaTroca } from "../src/monetizacao/recompensas.mjs";
import { escolherJogada } from "../src/simulacao/jogador.mjs";
import {
  TELAS_SEM_PEDIDO,
  acrescentar,
  centro,
  mudar,
  naTela,
  problemasAnuncio,
  problemasParidade,
  problemasPrazo,
  problemasToque,
  remover,
  sobrepoe,
} from "./interface-verificacoes.mjs";

const MIN = 60 * 1000;
const PASTA_INTERFACE = new URL("../src/interface/", import.meta.url);
const troca = (rodada) => ({ tipo: "oferta_troca", oferta: ofertaTroca({ fim: false, trocasComAnuncio: 0, rodada }) });

// Uma ou mais cenas de exemplo por tipo, com as ofertas como a monetização as devolve.
const EXEMPLOS = {
  inicio: [{ tipo: "inicio" }, { tipo: "inicio", pontosUltima: 120 }],
  jogando: [
    { tipo: "jogando", pontos: 10, vidas: 4, pecas: ["P01", null, "P18"], ofertaTroca: ofertaTroca({ fim: false, trocasComAnuncio: 0, rodada: ["P01", null, "P18"] }) },
    { tipo: "jogando", pontos: 0, vidas: 5, pecas: ["P02", "P10", "P13"], ofertaTroca: null },
  ],
  oferta_troca: [troca(["P01", null, null]), troca(["P01", "P02", null]), troca(["P01", "P02", "P03"])],
  oferta_continuar: [{ tipo: "oferta_continuar", oferta: ofertaContinuar({ continuacoesComAnuncio: 0 }), pontos: 42 }],
  intersticial: [{ tipo: "intersticial" }],
  rewarded: ["1 peça nova no lugar da que falta usar", "esvazia 2 linhas e 2 colunas", "1 vida"].map((recompensa) => ({ tipo: "rewarded", recompensa })),
  loja: [
    { tipo: "loja", etapa: "produto" },
    { tipo: "loja", etapa: "confirmacao" },
    { tipo: "loja", comprado: true },
  ],
  sem_vidas: [
    { tipo: "sem_vidas", esperar_ms: 12 * MIN + 1, ofertaAnuncio: true },
    { tipo: "sem_vidas", esperar_ms: 30 * 1000, ofertaAnuncio: false },
  ],
};
const TODAS = Object.values(EXEMPLOS).flat().map(montarTela);
const OFERTAS = [...EXEMPLOS.oferta_troca, ...EXEMPLOS.oferta_continuar, EXEMPLOS.sem_vidas[0], EXEMPLOS.loja[0], EXEMPLOS.loja[1]].map(montarTela);
const ANUNCIOS = [...EXEMPLOS.intersticial, ...EXEMPLOS.rewarded].map(montarTela);
const SEM_PEDIDO = TODAS.filter((t) => TELAS_SEM_PEDIDO.has(t.cena));
const el = (tela, id) => tela.elementos.find((e) => e.id === id);
const nome = (tela) => `${tela.cena}${tela.elementos.find((e) => e.papel === "acao_principal") ? ` (${tela.elementos.find((e) => e.papel === "acao_principal").texto})` : ""}`;

// AC-U1.1 — modelo como dado puro.
test("modelo: toda cena vira dado puro e determinístico, dentro da tela de referência", () => {
  assert.deepEqual(Object.keys(EXEMPLOS).sort(), [...CENAS_CONHECIDAS].sort(), "um exemplo por cena conhecida");
  for (const cena of Object.values(EXEMPLOS).flat()) {
    const tela = montarTela(cena);
    assert.deepEqual(montarTela(cena), tela, `${cena.tipo}: mesma cena, mesma tela`);
    assert.deepEqual(JSON.parse(JSON.stringify(tela)), tela, `${cena.tipo}: serializável`);
    assert.ok(Object.isFrozen(tela) && Object.isFrozen(tela.elementos) && tela.elementos.every(Object.isFrozen), `${cena.tipo}: imutável`);
    const ids = tela.elementos.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `${cena.tipo}: ids únicos`);
    for (const e of tela.elementos) {
      assert.ok(PAPEIS.includes(e.papel), `${cena.tipo}/${e.id}: papel ${e.papel}`);
      assert.equal(typeof e.texto, "string");
      for (const k of ["x", "y", "largura", "altura", "pesoFonte", "tamanhoFonte", "visivelDesde_ms"]) assert.ok(Number.isFinite(e[k]), `${cena.tipo}/${e.id}.${k}`);
      assert.ok(e.aceitaToqueDesde_ms === null || Number.isFinite(e.aceitaToqueDesde_ms));
      assert.match(e.corTexto, /^#[0-9A-F]{6}$/i);
      assert.match(e.corFundo, /^#[0-9A-F]{6}$/i);
      assert.ok(naTela(e), `${cena.tipo}/${e.id} fora da tela`);
    }
    const tocaveis = tela.elementos.filter((e) => e.aceitaToqueDesde_ms !== null);
    for (const a of tocaveis) for (const b of tocaveis) if (a !== b) assert.ok(!sobrepoe(a, b), `${cena.tipo}: ${a.id} sobrepõe ${b.id}`);
  }
  assert.throws(() => montarTela({ tipo: "desconhecida" }), RangeError);
});

test("modelo: sem DOM, relógio próprio nem aleatoriedade no código da interface", () => {
  for (const arquivo of readdirSync(PASTA_INTERFACE)) {
    const fonte = readFileSync(new URL(arquivo, PASTA_INTERFACE), "utf8");
    assert.doesNotMatch(fonte, /\b(Date|Math\.random|performance|document|window|globalThis|setTimeout|setInterval|requestAnimationFrame|process)\b/, arquivo);
  }
});

// AC-U1.2 — dependências.
test("dependências: src/interface importa só de src/sessao e de si mesma", () => {
  const arquivos = readdirSync(PASTA_INTERFACE);
  assert.ok(arquivos.length >= 3);
  for (const arquivo of arquivos) {
    const fonte = readFileSync(new URL(arquivo, PASTA_INTERFACE), "utf8");
    const origens = [...fonte.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map((m) => m[1]);
    for (const origem of origens) assert.match(origem, /^\.\/[\w-]+\.mjs$|^\.\.\/sessao\/[\w-]+\.mjs$/, `${arquivo} importa ${origem}`);
    assert.doesNotMatch(fonte, /\brequire\s*\(/, arquivo);
  }
});

// AC-U1.3 — paridade da recusa.
test("contraste: fórmula da WCAG", () => {
  assert.equal(contraste("#000000", "#FFFFFF"), 21);
  assert.equal(contraste("#FFFFFF", "#FFFFFF"), 1);
  assert.equal(contraste("#FFFFFF", "#000000"), contraste("#000000", "#FFFFFF"));
  assert.ok(Math.abs(contraste("#777777", "#FFFFFF") - 4.48) < 0.01);
  assert.throws(() => contraste("azul", "#FFFFFF"), RangeError);
});

test("paridade: em cada oferta a recusa tem a área, o peso, o instante e o contraste da ação principal, com texto neutro", () => {
  const cobertas = new Set(OFERTAS.map((t) => t.cena));
  assert.deepEqual([...cobertas].sort(), ["loja", "oferta_continuar", "oferta_troca", "sem_vidas"], "troca, continuar, vida e compra");
  for (const tela of OFERTAS) assert.deepEqual(problemasParidade(tela), [], nome(tela));
});

test("oferta de troca diz exatamente quantas peças serão trocadas", () => {
  for (const [tela, n] of EXEMPLOS.oferta_troca.map((c) => [montarTela(c), c.oferta.pecas])) {
    const esperado = n === 1 ? "1 peça" : `${n} peças`;
    assert.ok(el(tela, "principal").texto.includes(esperado), el(tela, "principal").texto);
    assert.ok(el(tela, "explicacao").texto.includes(esperado));
  }
});

// AC-U1.4 — fechar, rótulo e prazo.
test("anúncio: rótulo desde o início e um fechar de 44 × 44 px no mínimo, sem sobreposição, no tempo certo", () => {
  for (const tela of ANUNCIOS) assert.deepEqual(problemasAnuncio(tela), [], tela.anuncio);
  const [intersticial] = ANUNCIOS;
  const fechar = centro(el(intersticial, "fechar"));
  assert.equal(tocar(intersticial, { ...fechar, t_ms: TEMPOS.intersticial_ms - 1 }), null, "intersticial: fechar só no fim");
  assert.deepEqual(tocar(intersticial, { ...fechar, t_ms: TEMPOS.intersticial_ms }), { id: "fechar", acao: "fechar" });
  for (const rewarded of ANUNCIOS.slice(1)) assert.deepEqual(tocar(rewarded, { ...centro(el(rewarded, "fechar")), t_ms: 0 }), { id: "fechar", acao: "fechar" }, "rewarded: fechar desde o início");
  for (const tela of ANUNCIOS) assert.equal(tocar(tela, { ...centro(el(tela, "corpo")), t_ms: 60000 }), null, "corpo do anúncio não abre nada");
});

test("prazo: nenhuma oferta tem contagem regressiva nem prazo (a de continuar não tem prazo na sessão)", () => {
  for (const tela of TODAS) assert.deepEqual(problemasPrazo(tela), [], tela.cena);
  assert.equal(EXEMPLOS.oferta_continuar[0].oferta.prazo_s, null);
});

// AC-U1.5 — toque acidental.
test("toque acidental: telas de fim de partida não aceitam toque na janela inicial", () => {
  assert.deepEqual(SEM_PEDIDO.map((t) => t.cena).sort(), ["intersticial", "oferta_continuar"]);
  for (const tela of SEM_PEDIDO) assert.deepEqual(problemasToque(tela), [], tela.cena);
  const oferta = montarTela(EXEMPLOS.oferta_continuar[0]);
  for (const id of ["principal", "recusa"]) {
    assert.equal(tocar(oferta, { ...centro(el(oferta, id)), t_ms: TEMPOS.janelaToque_ms - 1 }), null);
    assert.equal(tocar(oferta, { ...centro(el(oferta, id)), t_ms: TEMPOS.janelaToque_ms })?.id, id);
  }
});

// Sessão de ponta a ponta, com o jogador automático, olhando a cena depois de cada ação.
function jogarSessao({ partidas, avanco_ms, roteiro }) {
  let t = 0;
  const sessao = criarSessao({ sementeSessao: 7, sdk: criarSdkSimulado({ roteiro }), relogio: () => t, consentimento: true });
  const vistas = [];
  const agir = (fazer) => {
    const antes = sessao.eventos.length;
    fazer();
    const anuncio = anuncioAposEventos(sessao.eventos.slice(antes));
    const cena = cenaDaSessao(sessao, anuncio);
    vistas.push({ cena, anuncio, emJogada: Boolean(sessao.partida && !sessao.partida.oferta), tela: montarTela(cena) });
  };
  for (let p = 0; p < partidas; p += 1) {
    t += avanco_ms;
    if (!sessao.iniciarPartida().ok) {
      vistas.push({ cena: cenaDaSessao(sessao, { tipo: "sem_vidas" }), semVidas: true });
      break;
    }
    if (p === 0) vistas.push({ cena: cenaDaSessao(sessao, { tipo: "oferta_troca" }), emJogada: true });
    while (sessao.partida) {
      if (sessao.partida.oferta) agir(() => sessao.responderContinuar("recusar"));
      else agir(() => sessao.jogar(escolherJogada(sessao.partida.estado)));
    }
  }
  return { sessao, vistas };
}

test("toque acidental: nenhum anúncio aparece durante uma jogada; o intersticial só depois do fim da partida", () => {
  const { sessao, vistas } = jogarSessao({ partidas: 5, avanco_ms: 2 * MIN });
  const intersticiais = vistas.filter((v) => v.cena.tipo === "intersticial");
  assert.ok(intersticiais.length >= 1, "a sessão chegou a mostrar intersticial");
  for (const v of vistas.filter((x) => x.emJogada)) {
    assert.equal(v.anuncio ?? null, null);
    assert.ok(["jogando", "oferta_troca"].includes(v.cena.tipo), v.cena.tipo);
  }
  for (const v of intersticiais) assert.equal(v.emJogada, false);
  assert.equal(anuncioAposEventos([{ tipo: "intersticial", resultado: "completo" }]), null, "sem fim de partida antes, nada aparece");
  assert.equal(anuncioAposEventos([{ tipo: "fim_partida" }, { tipo: "intersticial", resultado: "indisponivel" }]), null);
  assert.equal(sessao.partida, null);
  assert.equal(cenaDaSessao(sessao).tipo, "inicio");
});

test("cenas da sessão: todas montam e passam pelas regras de tela", () => {
  const { sessao, vistas } = jogarSessao({ partidas: 6, avanco_ms: 0 });
  const semVidas = vistas.find((v) => v.semVidas);
  assert.ok(semVidas, "com 5 vidas e sem tempo passando, a sexta partida fica sem vidas");
  assert.equal(semVidas.cena.ofertaAnuncio, true);
  assert.ok(semVidas.cena.esperar_ms > 0);
  const cenas = [...vistas.map((v) => v.cena), cenaDaSessao(sessao, { tipo: "loja" }), cenaDaSessao(sessao, { tipo: "loja", etapa: "confirmacao" }), cenaDaSessao(sessao, { tipo: "rewarded", recompensa: "1 vida" })];
  const tipos = new Set(cenas.map((c) => c.tipo));
  for (const tipo of ["jogando", "oferta_troca", "oferta_continuar", "sem_vidas", "loja", "rewarded"]) assert.ok(tipos.has(tipo), tipo);
  for (const cena of cenas) {
    const tela = montarTela(cena);
    if (el(tela, "recusa")) assert.deepEqual(problemasParidade(tela), [], cena.tipo);
    if (tela.anuncio) assert.deepEqual(problemasAnuncio(tela), [], cena.tipo);
    assert.deepEqual(problemasToque(tela), [], cena.tipo);
    assert.deepEqual(problemasPrazo(tela), [], cena.tipo);
  }
  sessao.comprar("remover_anuncios", { confirmado: true });
  assert.equal(cenaDaSessao(sessao, { tipo: "loja" }).comprado, sessao.semAnuncios);
});

// AC-U1.6 — mutações de tela, em memória: cada uma tem de derrubar a verificação que a cobre.
const atrasar = (ms) => ({ visivelDesde_ms: ms, aceitaToqueDesde_ms: ms });
const MUTACOES = [
  { nome: "recusa menor", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { altura: 32 }) },
  { nome: "recusa estreita", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { largura: 200 }) },
  { nome: "recusa apagada (contraste baixo)", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { corTexto: "#AEB4BB" }) },
  { nome: "recusa com contraste acima de 4,5 mas abaixo da ação principal", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { corTexto: "#56606B" }) },
  { nome: "recusa em fonte leve", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { pesoFonte: 300 }) },
  { nome: "recusa apagada da tela", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => remover(t, "recusa") },
  { nome: "recusa com culpa", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { texto: "Não, prefiro perder a partida" }) },
  { nome: "recusa atrasada", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { aceitaToqueDesde_ms: 3000 }) },
  { nome: "recusa que abre anúncio", telas: OFERTAS, verificar: problemasParidade, mutar: (t) => mudar(t, "recusa", { acao: "trocar_com_anuncio" }) },
  { nome: "fechar pequeno", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { largura: 24, altura: 24 }) },
  { nome: "fechar atrasado", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", atrasar(TEMPOS.intersticial_ms + 3000)) },
  { nome: "fechar visível só depois de tocável", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { visivelDesde_ms: TEMPOS.intersticial_ms + 3000 }) },
  { nome: "fechar sobre o rótulo", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { x: 16, y: 16 }) },
  { nome: "fechar sobre o corpo do anúncio", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { y: 80 }) },
  { nome: "fechar apagado", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { corTexto: "#E4E7EB" }) },
  { nome: "anúncio sem rótulo", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => remover(t, "rotulo") },
  { nome: "rótulo atrasado", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "rotulo", { visivelDesde_ms: 3000 }) },
  { nome: "rótulo com outro texto", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "rotulo", { texto: "Destaque" }) },
  { nome: "botão de ação no lugar do fechar", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { papel: "acao", texto: "Instalar", acao: "abrir_anunciante" }) },
  { nome: "fechar que abre a loja", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "fechar", { acao: "abrir_loja" }) },
  { nome: "corpo do anúncio tocável", telas: ANUNCIOS, verificar: problemasAnuncio, mutar: (t) => mudar(t, "corpo", { acao: "abrir_anunciante", aceitaToqueDesde_ms: 0 }) },
  { nome: "contagem regressiva na oferta de continuar", telas: OFERTAS.filter((t) => t.cena === "oferta_continuar"), verificar: problemasPrazo, mutar: (t) => acrescentar(t, { ...el(t, "explicacao"), id: "contagem", texto: "Decida em 5 s", y: 300, altura: 40 }) },
  { nome: "prazo no texto da oferta", telas: OFERTAS, verificar: problemasPrazo, mutar: (t) => mudar(t, "explicacao", { texto: `${el(t, "explicacao").texto} Restam 10 segundos.` }) },
  { nome: "oferta de continuar tocável na hora", telas: SEM_PEDIDO.filter((t) => t.cena === "oferta_continuar"), verificar: problemasToque, mutar: (t) => mudar(mudar(t, "principal", { aceitaToqueDesde_ms: 0 }), "recusa", { aceitaToqueDesde_ms: 0 }) },
  { nome: "intersticial pulável na hora", telas: SEM_PEDIDO.filter((t) => t.cena === "intersticial"), verificar: problemasToque, mutar: (t) => mudar(t, "fechar", atrasar(0)) },
  { nome: "corpo do intersticial abre o anunciante sob o dedo", telas: SEM_PEDIDO.filter((t) => t.cena === "intersticial"), verificar: problemasToque, mutar: (t) => mudar(t, "corpo", { acao: "abrir_anunciante", aceitaToqueDesde_ms: 0 }) },
];

test("mutação 'contraste acima de 4,5 mas abaixo da ação principal' fica mesmo nessa faixa", () => {
  const principal = el(OFERTAS[0], "principal");
  const c = contraste("#56606B", el(OFERTAS[0], "recusa").corFundo);
  assert.ok(c >= 4.5 && c < contraste(principal.corTexto, principal.corFundo), String(c));
});

for (const m of MUTACOES)
  test(`mutação de tela pega: ${m.nome}`, () => {
    assert.ok(m.telas.length > 0, "mutação sem tela");
    for (const tela of m.telas) {
      assert.deepEqual(m.verificar(tela), [], `${nome(tela)}: limpo passa antes da mutação`);
      assert.ok(m.verificar(m.mutar(tela)).length > 0, `${nome(tela)}: mutação não foi pega`);
    }
  });
