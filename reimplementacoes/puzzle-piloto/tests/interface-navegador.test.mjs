// Interface no navegador sem o navegador (ESPECIFICACAO.md, seção 10.1): o controle que o desenho
// usa, dirigido por toques em pontos da tela de referência, e o servidor local.
import assert from "node:assert/strict";
import { request } from "node:http";
import { test } from "node:test";
import { criarControle } from "../interface/controle.mjs";
import { criarServidor, resolver } from "../interface/servidor.mjs";
import { cenaDaSessao } from "../src/interface/cenas.mjs";
import { TEMPOS } from "../src/interface/tela.mjs";
import { jogadasPossiveis } from "../src/nucleo/jogo.mjs";

const MINUTO = 60 * 1000;

function novoControle(semente = 7) {
  const relogio = { agora: 1_000_000 };
  const c = criarControle({ sementeSessao: semente, relogio: () => relogio.agora });
  return { c, relogio };
}

const centro = (e) => ({ x: e.x + e.largura / 2, y: e.y + e.altura / 2 });
const elemento = (tela, id) => tela.elementos.find((e) => e.id === id);

// Toca no centro do elemento id da tela atual, no instante t.
function tocarId(c, id, t) {
  const { tela } = c.atualizar(t);
  const e = elemento(tela, id);
  assert.ok(e, `elemento ${id} na tela ${tela.cena}`);
  return c.tocar(centro(e), t);
}

// Joga pela tela (peça, depois casa da grade) até a partida pedir resposta à oferta de continuar.
function jogarAteOferta(c, t) {
  while (c.sessao.partida && !c.sessao.partida.oferta) {
    const [{ indice, linha, coluna }] = jogadasPossiveis(c.sessao.partida.estado);
    tocarId(c, `peca-${indice}`, t);
    const { tela } = c.atualizar(t);
    const g = elemento(tela, "grade");
    const celula = g.largura / Math.sqrt(c.sessao.partida.estado.grade.length);
    assert.equal(c.tocar({ x: g.x + (coluna + 0.5) * celula, y: g.y + (linha + 0.5) * celula }, t).ok, true);
  }
}

// Partida inteira recusando continuar; devolve o instante seguinte.
function partidaRecusando(c, relogio, t) {
  relogio.agora += 2 * MINUTO;
  tocarId(c, "nova", t);
  jogarAteOferta(c, t);
  assert.equal(c.atualizar(t).tela.cena, "oferta_continuar");
  t += TEMPOS.janelaToque_ms;
  tocarId(c, "recusa", t);
  return t + 1;
}

test("jogada pela tela: peça escolhida e casa da grade viram jogada da sessão", () => {
  const { c } = novoControle();
  let t = 0;
  assert.equal(c.atualizar(t).tela.cena, "inicio");
  tocarId(c, "nova", t);
  assert.equal(c.atualizar(t).tela.cena, "jogando");
  const pontos = c.sessao.partida.estado.pontos;
  const [{ indice, linha, coluna }] = jogadasPossiveis(c.sessao.partida.estado);
  tocarId(c, `peca-${indice}`, t);
  assert.equal(c.selecionada, indice);
  const g = elemento(c.atualizar(t).tela, "grade");
  const celula = g.largura / 8;
  c.tocar({ x: g.x + (coluna + 0.5) * celula, y: g.y + (linha + 0.5) * celula }, t);
  assert.ok(c.sessao.partida.estado.pontos > pontos);
  assert.equal(c.selecionada, null);
});

test("rewarded da troca: fechar antes do fim é 'fechado' e não troca; ver até o fim é 'completo'", () => {
  const { c } = novoControle();
  let t = 0;
  tocarId(c, "nova", t);
  const rodada = c.sessao.partida.estado.rodada.slice();
  tocarId(c, "trocar", t);
  assert.equal(c.atualizar(t).tela.cena, "oferta_troca");
  tocarId(c, "principal", t);
  assert.equal(c.atualizar(t).tela.cena, "rewarded");
  assert.deepEqual(c.sessao.partida.estado.rodada, rodada, "a sessão só age depois do anúncio");
  t += TEMPOS.rewarded_ms - 1;
  c.avancar(t);
  tocarId(c, "fechar", t);
  assert.equal(c.sdk.registro.at(-1).resultado, "fechado");
  assert.equal(c.sessao.partida.trocasComAnuncio, 0);
  assert.equal(c.atualizar(t).tela.cena, "jogando");

  tocarId(c, "trocar", t);
  tocarId(c, "principal", t);
  const aberto = t;
  c.avancar(aberto + TEMPOS.rewarded_ms - 1);
  assert.equal(c.atualizar(aberto + TEMPOS.rewarded_ms - 1).tela.cena, "rewarded");
  assert.equal(c.restanteRewarded(aberto + TEMPOS.rewarded_ms - 1), 1);
  c.avancar(aberto + TEMPOS.rewarded_ms);
  assert.equal(c.sdk.registro.at(-1).resultado, "completo");
  assert.equal(c.sessao.partida.trocasComAnuncio, 1);
  assert.equal(c.restanteRewarded(aberto + TEMPOS.rewarded_ms), null);
});

test("oferta de continuar: toque na janela não abre nada; o rewarded aparece por cima da oferta", () => {
  const { c } = novoControle();
  let t = 0;
  tocarId(c, "nova", t);
  jogarAteOferta(c, t);
  assert.equal(c.atualizar(t).tela.cena, "oferta_continuar");
  t += TEMPOS.janelaToque_ms - 1;
  assert.equal(tocarId(c, "principal", t), null);
  t += 1;
  tocarId(c, "principal", t);
  assert.equal(c.atualizar(t).tela.cena, "rewarded");
  assert.ok(c.sessao.partida.oferta, "a oferta segue aberta na sessão durante o anúncio");
  t += TEMPOS.rewarded_ms;
  c.avancar(t);
  const evento = c.sessao.eventos.findLast((e) => e.tipo === "rewarded_continuar");
  assert.deepEqual([evento.resultado, evento.entregue], ["completo", true]);
});

test("rewarded por cima da oferta só quando é a resposta a ela", () => {
  const { c } = novoControle();
  tocarId(c, "nova", 0);
  jogarAteOferta(c, 0);
  assert.equal(cenaDaSessao(c.sessao, { tipo: "rewarded", recompensa: "x", origem: "continuar" }).tipo, "rewarded");
  assert.equal(cenaDaSessao(c.sessao, { tipo: "rewarded", recompensa: "x" }).tipo, "oferta_continuar");
  assert.equal(cenaDaSessao(c.sessao, { tipo: "loja" }).tipo, "oferta_continuar");
});

test("intersticial depois da partida: nada tocável até o fim; o fechar volta ao início", () => {
  const { c, relogio } = novoControle();
  let t = 0;
  for (let n = 0; n < 6 && c.atualizar(t).tela.cena !== "intersticial"; n += 1) t = partidaRecusando(c, relogio, t);
  const { tela, t_ms } = c.atualizar(t);
  assert.equal(tela.cena, "intersticial");
  t -= t_ms; // instante em que o intersticial apareceu
  assert.equal(c.sdk.registro.filter((r) => r.tipo === "intersticial").length, 1);
  for (const dt of [0, TEMPOS.janelaToque_ms, TEMPOS.intersticial_ms - 1]) assert.equal(c.tocar(centro(elemento(tela, "fechar")), t + dt), null);
  assert.equal(c.tocar(centro(elemento(tela, "corpo")), t + TEMPOS.intersticial_ms), null);
  assert.equal(c.tocar(centro(elemento(tela, "fechar")), t + TEMPOS.intersticial_ms).acao, "fechar");
  assert.equal(c.atualizar(t + TEMPOS.intersticial_ms).tela.cena, "inicio");
});

test("compra de remover anúncios: confirmação, cancelar volta ao produto, restaurar mantém", () => {
  const { c } = novoControle();
  tocarId(c, "loja", 0);
  tocarId(c, "principal", 0);
  assert.equal(c.atualizar(0).tela.elementos.find((e) => e.id === "principal").texto, "Confirmar compra");
  tocarId(c, "recusa", 0);
  assert.equal(c.atualizar(0).tela.elementos.find((e) => e.id === "principal").texto, "Comprar");
  assert.equal(c.sessao.semAnuncios, false);
  tocarId(c, "principal", 0);
  tocarId(c, "principal", 0);
  assert.equal(c.sessao.semAnuncios, true);
  assert.ok(elemento(c.atualizar(0).tela, "voltar"));
  tocarId(c, "restaurar", 0);
  assert.equal(c.sessao.semAnuncios, true);
  tocarId(c, "voltar", 0);
  assert.equal(c.atualizar(0).tela.cena, "inicio");
});

test("sem vidas: tempo de espera, recusa volta ao início, vida por anúncio só com o anúncio completo", () => {
  const { c, relogio } = novoControle();
  let t = 0;
  for (let n = 0; n < 5; n += 1) {
    t = partidaRecusando(c, relogio, t);
    if (c.atualizar(t).tela.cena === "intersticial") tocarId(c, "fechar", (t += TEMPOS.intersticial_ms));
  }
  tocarId(c, "nova", t);
  const { tela } = c.atualizar(t);
  assert.equal(tela.cena, "sem_vidas");
  assert.match(elemento(tela, "espera").texto, /^Sem vidas\. Próxima vida em \d+ min\.$/);
  tocarId(c, "recusa", t);
  assert.equal(c.atualizar(t).tela.cena, "inicio");
  tocarId(c, "nova", t);
  tocarId(c, "principal", t);
  assert.equal(c.atualizar(t).tela.cena, "rewarded");
  tocarId(c, "fechar", (t += 1));
  assert.equal(c.sessao.painelVidas.vidas, 0, "fechado antes do fim: sem vida");
  tocarId(c, "nova", t);
  tocarId(c, "principal", t);
  c.avancar(t + TEMPOS.rewarded_ms);
  assert.equal(c.sessao.painelVidas.vidas, 1);
  assert.equal(c.atualizar(t + TEMPOS.rewarded_ms).tela.cena, "inicio");
});

test("servidor: só arquivos do piloto, nada fora da lista nem da pasta", () => {
  assert.match(resolver("/interface/"),/interface[\\/]index\.html$/);
  assert.match(resolver("/src/interface/tela.mjs"), /tela\.mjs$/);
  assert.match(resolver("/monetizacao.json"), /monetizacao\.json$/);
  for (const fora of ["/tests/interface.test.mjs", "/src/../tests/sessao.test.mjs", "/../../package.json", "/src/%2e%2e/%2e%2e/package.json", "/ESPECIFICACAO.md", "/", "/interface/%00.html", "/%E0%A4%A"])
    assert.equal(resolver(fora), null, fora);
});

test("servidor: escuta em 127.0.0.1 e entrega a página com tipo certo", async () => {
  const servidor = criarServidor();
  await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
  const { address, port } = servidor.address();
  assert.equal(address, "127.0.0.1");
  const pedir = (caminho, metodo = "GET") =>
    new Promise((ok, erro) => {
      const req = request({ host: "127.0.0.1", port, path: caminho, method: metodo }, (res) => {
        res.resume();
        res.on("end", () => ok(res));
      });
      req.on("error", erro);
      req.end();
    });
  try {
    assert.equal((await pedir("/")).headers.location, "/interface/");
    assert.equal((await pedir("/interface/")).headers["content-type"], "text/html; charset=utf-8");
    assert.equal((await pedir("/interface/estilo.css")).headers["content-type"], "text/css; charset=utf-8");
    assert.equal((await pedir("/interface/desenho.mjs")).headers["content-type"], "text/javascript; charset=utf-8");
    assert.equal((await pedir("/monetizacao.json")).headers["content-type"], "application/json; charset=utf-8");
    assert.equal((await pedir("/tests/sessao.test.mjs")).statusCode, 404);
    assert.equal((await pedir("/", "POST")).statusCode, 405);
  } finally {
    servidor.close();
  }
});
