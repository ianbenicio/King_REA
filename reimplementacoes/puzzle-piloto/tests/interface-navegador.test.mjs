// Interface no navegador sem o navegador (ESPECIFICACAO.md, seção 10.1): o controle que o desenho
// usa, dirigido por toques em pontos da tela de referência, e o servidor local.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { request } from "node:http";
import { test } from "node:test";
import { criarControle } from "../interface/controle.mjs";
import { criarServidor, resolver } from "../interface/servidor.mjs";
import { cenaDaSessao } from "../src/interface/cenas.mjs";
import { TEMPOS } from "../src/interface/tela.mjs";
import { jogadasPossiveis } from "../src/nucleo/jogo.mjs";

const MINUTO = 60 * 1000;
const JANELA = TEMPOS.janelaToque_ms;

function novoControle(semente = 7) {
  const relogio = { agora: 1_000_000 };
  const c = criarControle({ sementeSessao: semente, relogio: () => relogio.agora });
  return { c, relogio };
}

const centro = (e) => ({ x: e.x + e.largura / 2, y: e.y + e.altura / 2 });
const elemento = (tela, id) => tela.elementos.find((e) => e.id === id);

// Toca no centro do elemento id da tela atual, no instante t (sem esperar a janela).
function tocarId(c, id, t) {
  const { tela } = c.atualizar(t);
  const e = elemento(tela, id);
  assert.ok(e, `elemento ${id} na tela ${tela.cena}`);
  return c.tocar(centro(e), t);
}

// Primeiro instante, a partir de t, em que a tela atual aceita toque (fim da janela depois de uma
// troca de tela; 0 de espera se a tela não mudou).
function livre(c, t) {
  const { t_ms, toqueDesde_ms } = c.atualizar(t);
  return t + Math.max(0, toqueDesde_ms - t_ms);
}

// Espera a janela da tela atual e toca no elemento id. r = { t }: o instante avança no lugar.
function tocarDepois(c, id, r) {
  r.t = livre(c, r.t);
  return tocarId(c, id, r.t);
}

// Joga pela tela (peça, depois a casa da grade) até a partida pedir resposta à oferta de continuar.
function jogarAteOferta(c, r) {
  while (c.sessao.partida && !c.sessao.partida.oferta) {
    const [{ indice, linha, coluna }] = jogadasPossiveis(c.sessao.partida.estado);
    assert.equal(tocarDepois(c, `peca-${indice}`, r).ok, true);
    assert.equal(tocarDepois(c, `celula-${linha}-${coluna}`, r).ok, true);
  }
}

// Partida inteira recusando continuar; o instante avança em r.
function partidaRecusando(c, relogio, r) {
  relogio.agora += 2 * MINUTO;
  tocarDepois(c, "nova", r);
  jogarAteOferta(c, r);
  assert.equal(c.atualizar(r.t).tela.cena, "oferta_continuar");
  tocarDepois(c, "recusa", r);
  r.t += 1;
}

test("jogada pela tela: peça escolhida e casa da grade viram jogada da sessão", () => {
  const { c } = novoControle();
  const r = { t: 0 };
  assert.equal(c.atualizar(r.t).tela.cena, "inicio");
  tocarDepois(c, "nova", r);
  assert.equal(c.atualizar(r.t).tela.cena, "jogando");
  const pontos = c.sessao.partida.estado.pontos;
  const [{ indice, linha, coluna }] = jogadasPossiveis(c.sessao.partida.estado);
  tocarDepois(c, `peca-${indice}`, r);
  assert.equal(c.selecionada, indice);
  assert.equal(elemento(c.atualizar(r.t).tela, `peca-${indice}`).escolhida, true, "a peça escolhida aparece na tela");
  tocarDepois(c, `celula-${linha}-${coluna}`, r);
  assert.ok(c.sessao.partida.estado.pontos > pontos);
  assert.equal(c.selecionada, null);
});

test("jogadas seguidas em 'jogando' não esperam a janela; a primeira, depois de 'Nova partida', espera", () => {
  const { c } = novoControle();
  let t = 0;
  tocarId(c, "nova", t);
  const [{ indice }] = jogadasPossiveis(c.sessao.partida.estado);
  assert.equal(tocarId(c, `peca-${indice}`, t + JANELA - 1), null, "tela nova: peça não responde na janela");
  t += JANELA;
  for (let n = 0; n < 6 && c.sessao.partida && !c.sessao.partida.oferta; n += 1) {
    const [j] = jogadasPossiveis(c.sessao.partida.estado);
    assert.equal(tocarId(c, `peca-${j.indice}`, t)?.ok, true, `jogada ${n}: peça no mesmo instante`);
    assert.equal(tocarId(c, `celula-${j.linha}-${j.coluna}`, t)?.ok, true, `jogada ${n}: casa no mesmo instante`);
    const depois = c.atualizar(t);
    if (depois.tela.cena === "jogando") assert.equal(depois.t_ms, JANELA, "a jogada não troca a tela nem reabre a janela");
  }
});

// Depois de uma troca de tela no instante t, nenhum elemento da tela nova responde a toque no
// centro, do instante t até o fim da janela.
function semToqueNaJanela(c, t, onde) {
  const { tela, t_ms, toqueDesde_ms } = c.atualizar(t);
  assert.equal(t_ms, 0, `${onde}: a tela mudou agora`);
  assert.equal(toqueDesde_ms, JANELA, `${onde}: janela aberta`);
  for (const e of tela.elementos.filter((x) => x.acao !== null && x.aceitaToqueDesde_ms !== null))
    for (const dt of [0, 100, JANELA - 1]) assert.equal(c.tocar(centro(e), t + dt), null, `${onde}: ${e.id} aos ${dt} ms`);
}

test("toque duplo: em toda troca de tela por toque, a tela seguinte não responde na janela", () => {
  const { c } = novoControle();
  const r = { t: 0 };
  const passo = (id, cena) => {
    const antes = c.atualizar(r.t).tela.cena;
    const alvo = tocarDepois(c, id, r);
    assert.ok(alvo, `${antes}: toque em ${id}`);
    if (cena) assert.equal(c.atualizar(r.t).tela.cena, cena, `${antes} → ${id}`);
    semToqueNaJanela(c, r.t, `${antes} → ${id}`);
  };
  passo("loja", "loja");
  passo("principal", "loja"); // produto → confirmação
  passo("recusa", "loja"); // confirmação → produto
  passo("recusa", "inicio");
  passo("nova", "jogando");
  passo("trocar", "oferta_troca");
  passo("recusa", "jogando");
  passo("trocar", "oferta_troca");
  passo("principal", "rewarded");
  passo("fechar", "jogando");
  passo("loja", "loja");
  passo("recusa", "jogando");
  jogarAteOferta(c, r);
  semToqueNaJanela(c, r.t, "jogada → oferta de continuar");
  passo("principal", "rewarded");
  passo("fechar", null); // rewarded interrompido: a partida acaba (intersticial ou início)
  assert.ok(["intersticial", "inicio"].includes(c.atualizar(r.t).tela.cena));
  assert.equal(c.sessao.eventos.filter((e) => e.tipo === "compra").length, 0, "nenhuma compra no caminho");
});

test("rewarded da troca: fechar antes do fim é 'fechado' e não troca; ver até o fim é 'completo'", () => {
  const { c } = novoControle();
  const r = { t: 0 };
  tocarDepois(c, "nova", r);
  const rodada = c.sessao.partida.estado.rodada.slice();
  tocarDepois(c, "trocar", r);
  assert.equal(c.atualizar(r.t).tela.cena, "oferta_troca");
  tocarDepois(c, "principal", r);
  assert.equal(c.atualizar(r.t).tela.cena, "rewarded");
  assert.deepEqual(c.sessao.partida.estado.rodada, rodada, "a sessão só age depois do anúncio");
  r.t += TEMPOS.rewarded_ms - 1;
  c.avancar(r.t);
  tocarDepois(c, "fechar", r);
  assert.equal(c.sdk.registro.at(-1).resultado, "fechado");
  assert.equal(c.sessao.partida.trocasComAnuncio, 0);
  assert.equal(c.atualizar(r.t).tela.cena, "jogando");

  tocarDepois(c, "trocar", r);
  tocarDepois(c, "principal", r);
  const aberto = r.t;
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
  const r = { t: 0 };
  tocarDepois(c, "nova", r);
  jogarAteOferta(c, r);
  assert.equal(c.atualizar(r.t).tela.cena, "oferta_continuar");
  assert.equal(tocarId(c, "principal", r.t + JANELA - 1), null);
  tocarId(c, "principal", (r.t += JANELA));
  assert.equal(c.atualizar(r.t).tela.cena, "rewarded");
  assert.ok(c.sessao.partida.oferta, "a oferta segue aberta na sessão durante o anúncio");
  r.t += TEMPOS.rewarded_ms;
  c.avancar(r.t);
  const evento = c.sessao.eventos.findLast((e) => e.tipo === "rewarded_continuar");
  assert.deepEqual([evento.resultado, evento.entregue], ["completo", true]);
});

test("rewarded por cima da oferta só quando é a resposta a ela", () => {
  const { c } = novoControle();
  const r = { t: 0 };
  tocarDepois(c, "nova", r);
  jogarAteOferta(c, r);
  assert.equal(cenaDaSessao(c.sessao, { tipo: "rewarded", recompensa: "x", origem: "continuar" }).tipo, "rewarded");
  assert.equal(cenaDaSessao(c.sessao, { tipo: "rewarded", recompensa: "x" }).tipo, "oferta_continuar");
  assert.equal(cenaDaSessao(c.sessao, { tipo: "loja" }).tipo, "oferta_continuar");
});

test("intersticial depois da partida: nada tocável até o fim; o fechar volta ao início", () => {
  const { c, relogio } = novoControle();
  const r = { t: 0 };
  for (let n = 0; n < 6 && c.atualizar(r.t).tela.cena !== "intersticial"; n += 1) partidaRecusando(c, relogio, r);
  const { tela, t_ms } = c.atualizar(r.t);
  assert.equal(tela.cena, "intersticial");
  const t = r.t - t_ms; // instante em que o intersticial apareceu
  assert.equal(c.sdk.registro.filter((x) => x.tipo === "intersticial").length, 1);
  for (const dt of [0, JANELA, TEMPOS.intersticial_ms - 1]) assert.equal(c.tocar(centro(elemento(tela, "fechar")), t + dt), null);
  assert.equal(c.tocar(centro(elemento(tela, "corpo")), t + TEMPOS.intersticial_ms), null);
  assert.equal(c.tocar(centro(elemento(tela, "fechar")), t + TEMPOS.intersticial_ms).acao, "fechar");
  assert.equal(c.atualizar(t + TEMPOS.intersticial_ms).tela.cena, "inicio");
});

test("compra de remover anúncios: preço, confirmação, cancelar volta ao produto, restaurar mantém", () => {
  const { c } = novoControle();
  const { preco } = c.sessao.produtoSemAnuncios;
  const r = { t: 0 };
  tocarDepois(c, "loja", r);
  assert.equal(elemento(c.atualizar(r.t).tela, "principal").texto, `Comprar por ${preco}`);
  tocarDepois(c, "principal", r);
  assert.equal(elemento(c.atualizar(r.t).tela, "principal").texto, `Confirmar compra (${preco})`);
  assert.equal(tocarId(c, "recusa", r.t), null, "confirmação não aceita toque na janela");
  tocarDepois(c, "recusa", r);
  assert.equal(elemento(c.atualizar(r.t).tela, "principal").texto, `Comprar por ${preco}`);
  assert.equal(c.sessao.semAnuncios, false);
  tocarDepois(c, "principal", r);
  assert.equal(tocarId(c, "principal", r.t + JANELA - 1), null);
  tocarDepois(c, "principal", r);
  assert.equal(c.sessao.semAnuncios, true);
  assert.ok(elemento(c.atualizar(r.t).tela, "voltar"));
  tocarDepois(c, "restaurar", r);
  assert.equal(c.sessao.semAnuncios, true);
  tocarDepois(c, "voltar", r);
  assert.equal(c.atualizar(r.t).tela.cena, "inicio");
});

test("compra: toque duplo no Comprar não compra; depois da janela, o mesmo ponto cancela", () => {
  const { c } = novoControle();
  const r = { t: 0 };
  tocarDepois(c, "loja", r);
  r.t = livre(c, r.t);
  const comprar = centro(elemento(c.atualizar(r.t).tela, "principal"));
  assert.equal(c.tocar(comprar, r.t).acao, "pedir_confirmacao");
  for (const dt of [0, 50, 150, JANELA - 1]) assert.equal(c.tocar(comprar, r.t + dt), null, `segundo toque aos ${dt} ms`);
  assert.equal(c.atualizar(r.t + JANELA - 1).tela.cena, "loja");
  assert.equal(c.tocar(comprar, r.t + JANELA).acao, "voltar");
  assert.equal(c.sessao.semAnuncios, false);
  assert.equal(c.sessao.eventos.filter((e) => e.tipo === "compra").length, 0);
});

test("sem vidas: tempo de espera, recusa volta ao início, vida por anúncio só com o anúncio completo", () => {
  const { c, relogio } = novoControle();
  const r = { t: 0 };
  for (let n = 0; n < 5; n += 1) {
    partidaRecusando(c, relogio, r);
    if (c.atualizar(r.t).tela.cena === "intersticial") {
      r.t += TEMPOS.intersticial_ms;
      tocarDepois(c, "fechar", r);
    }
  }
  tocarDepois(c, "nova", r);
  const { tela } = c.atualizar(r.t);
  assert.equal(tela.cena, "sem_vidas");
  assert.match(elemento(tela, "espera").texto, /^Sem vidas\. Próxima vida em \d+ min\.$/);
  tocarDepois(c, "recusa", r);
  assert.equal(c.atualizar(r.t).tela.cena, "inicio");
  tocarDepois(c, "nova", r);
  tocarDepois(c, "principal", r);
  assert.equal(c.atualizar(r.t).tela.cena, "rewarded");
  tocarDepois(c, "fechar", r);
  assert.equal(c.sessao.painelVidas.vidas, 0, "fechado antes do fim: sem vida");
  tocarDepois(c, "nova", r);
  tocarDepois(c, "principal", r);
  c.avancar(r.t + TEMPOS.rewarded_ms);
  assert.equal(c.sessao.painelVidas.vidas, 1);
  assert.equal(c.atualizar(r.t + TEMPOS.rewarded_ms).tela.cena, "inicio");
});

// A interface fala só com a sessão: interface/*.mjs importa só de src/sessao/, src/interface/,
// da própria pasta e de módulos node:.
const PASTA_DESENHO = new URL("../interface/", import.meta.url);
const ORIGEM_PERMITIDA = /^(\.\.\/src\/sessao\/|\.\.\/src\/interface\/|\.\/|node:)[\w./-]*$/;
const origensDe = (fonte) => [...fonte.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map((m) => m[1]);
const importsProibidos = (fonte) => origensDe(fonte).filter((o) => !ORIGEM_PERMITIDA.test(o) || o.includes("/../"));

test("dependências: interface/*.mjs importa só da sessão, de src/interface, de si mesma e de node:", () => {
  const arquivos = readdirSync(PASTA_DESENHO).filter((a) => a.endsWith(".mjs"));
  assert.deepEqual(arquivos.sort(), ["controle.mjs", "desenho.mjs", "servidor.mjs"]);
  for (const arquivo of arquivos) {
    const fonte = readFileSync(new URL(arquivo, PASTA_DESENHO), "utf8");
    assert.ok(origensDe(fonte).length > 0, `${arquivo} sem import lido`);
    assert.deepEqual(importsProibidos(fonte), [], arquivo);
    assert.doesNotMatch(fonte, /\brequire\s*\(/, arquivo);
  }
});

test("dependências: a checagem pega import de fora da sessão (mutação em memória)", () => {
  const fonte = readFileSync(new URL("controle.mjs", PASTA_DESENHO), "utf8");
  for (const origem of ["../src/nucleo/pecas.mjs", "../src/monetizacao/loja.mjs", "../src/monetizacao/sdk-simulado.mjs", "../src/sessao/../nucleo/jogo.mjs", "../tests/invariancia.mjs"]) {
    for (const forma of [`import { x } from "${origem}";\n`, `const m = await import("${origem}");\n`])
      assert.deepEqual(importsProibidos(forma + fonte), [origem], forma.trim());
  }
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
