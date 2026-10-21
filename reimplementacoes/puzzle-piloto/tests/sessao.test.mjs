// Testes da sessão: núcleo + monetização simulada de ponta a ponta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { criarSessao, sementeDaPartida } from "../src/sessao/sessao.mjs";
import { criarSdkSimulado } from "../src/monetizacao/sdk-simulado.mjs";
import { REMOVER_ANUNCIOS } from "../src/monetizacao/loja.mjs";
import { escolherJogada } from "../src/simulacao/jogador.mjs";

const MIN = 60 * 1000;
const montar = ({ roteiro, compras, remoto, sementeSessao = 11 } = {}) => {
  let t = 0;
  const relogio = () => t;
  const sdk = criarSdkSimulado({ roteiro });
  const sessao = criarSessao({ sementeSessao, sdk, relogio, consentimento: true, remoto, compras });
  return { sessao, sdk, avancar: (ms) => (t += ms) };
};
// Joga com o jogador automático até a oferta de continuar ou o fim da partida.
const jogarAteParar = (sessao) => {
  while (sessao.partida && !sessao.partida.oferta) sessao.jogar(escolherJogada(sessao.partida.estado));
};
const partidaCompleta = (sessao) => {
  assert.equal(sessao.iniciarPartida().ok, true);
  jogarAteParar(sessao);
  if (sessao.partida?.oferta) sessao.responderContinuar("recusar");
};

test("o SDK só é inicializado com o consentimento decidido", () => {
  const sdk = criarSdkSimulado();
  assert.throws(() => criarSessao({ sementeSessao: 1, sdk, relogio: () => 0 }), TypeError);
  const { sdk: sdk2 } = montar();
  assert.equal(sdk2.registro[0].evento, "inicializar");
});

test("fim de partida oferece continuar; recusar encerra sem penalidade", () => {
  const { sessao } = montar();
  sessao.iniciarPartida();
  jogarAteParar(sessao);
  assert.ok(sessao.partida.oferta);
  assert.equal(sessao.partida.oferta.destaque, "igual");
  const pontos = sessao.partida.estado.pontos;
  assert.throws(() => sessao.jogar({ indice: 0, linha: 0, coluna: 0 }), Error, "não joga com oferta pendente");
  sessao.responderContinuar("recusar");
  assert.equal(sessao.partida, null);
  const fim = sessao.eventos.find((e) => e.tipo === "fim_partida");
  assert.equal(fim.pontos, pontos);
});

test("continuar com anúncio concluído: partida segue; segunda derrota não tem nova oferta", () => {
  const { sessao } = montar();
  sessao.iniciarPartida();
  jogarAteParar(sessao);
  const r = sessao.responderContinuar("continuar");
  assert.equal(r.ok, true);
  if (sessao.partida) {
    assert.equal(sessao.partida.continuacoesComAnuncio, 1);
    jogarAteParar(sessao);
  }
  assert.equal(sessao.partida, null, "acaba sem segunda oferta");
  assert.equal(sessao.eventos.filter((e) => e.tipo === "oferta_continuar").length, 1);
});

test("continuar com anúncio interrompido ou indisponível encerra normalmente", () => {
  for (const resultado of ["fechado", "indisponivel"]) {
    const { sessao } = montar({ roteiro: (tipo) => (tipo === "rewarded" ? resultado : "completo") });
    sessao.iniciarPartida();
    jogarAteParar(sessao);
    const pontos = sessao.partida.estado.pontos;
    assert.equal(sessao.responderContinuar("continuar").ok, false);
    assert.equal(sessao.partida, null);
    assert.equal(sessao.eventos.find((e) => e.tipo === "fim_partida").pontos, pontos);
  }
});

test("trocar com anúncio: troca uma vez por partida; falha não gasta o limite; callback duplicado troca uma vez", () => {
  const roteiro = ["indisponivel", "duplicado"];
  const { sessao } = montar({ roteiro: (_, i) => roteiro[i] ?? "completo" });
  sessao.iniciarPartida();
  const antes = sessao.partida.estado;
  assert.equal(sessao.trocarComAnuncio().ok, false);
  assert.deepEqual(sessao.partida.estado, antes, "falha não muda nada");
  assert.equal(sessao.trocarComAnuncio().ok, true);
  assert.equal(sessao.partida.trocasComAnuncio, 1);
  assert.equal(sessao.partida.estado.trocas, 1, "duplicado aplicou uma vez");
  assert.equal(sessao.partida.estado.sorteios, antes.sorteios + 3);
  assert.equal(sessao.trocarComAnuncio().motivo, "limite da partida");
});

test("intersticial: só no fim de partida, depois da carência, a cada 2 partidas, com intervalo", () => {
  const { sessao, avancar } = montar();
  const exibidosEm = [];
  for (let p = 1; p <= 6; p++) {
    avancar(2 * MIN);
    partidaCompleta(sessao);
    if (sessao.eventos.at(-1).tipo === "intersticial") exibidosEm.push(p);
    avancar(25 * MIN); // recarga de vidas
  }
  assert.deepEqual(exibidosEm, [3, 5]);
  for (const e of sessao.eventos.filter((e) => e.tipo === "intersticial")) {
    const i = sessao.eventos.indexOf(e);
    assert.equal(sessao.eventos[i - 1].tipo, "fim_partida");
  }
});

test("remover anúncios: sem intersticial depois da compra; rewarded continua disponível", () => {
  const { sessao, avancar } = montar();
  assert.equal(sessao.comprar(REMOVER_ANUNCIOS).ok, false, "sem confirmação");
  assert.equal(sessao.comprar(REMOVER_ANUNCIOS, { confirmado: true }).ok, true);
  for (let p = 1; p <= 6; p++) {
    avancar(30 * MIN);
    partidaCompleta(sessao);
  }
  assert.equal(sessao.eventos.filter((e) => e.tipo === "intersticial").length, 0);
  sessao.iniciarPartida();
  assert.equal(sessao.trocarComAnuncio().ok, true);
});

test("compra restaurada vale desde o início da sessão", () => {
  const { sessao } = montar({ compras: [REMOVER_ANUNCIOS, "desconhecido"] });
  assert.deepEqual(sessao.compras, [REMOVER_ANUNCIOS]);
});

test("vidas: sem vida a partida não começa e o tempo de espera é informado; anúncio dá uma vida", () => {
  const { sessao } = montar();
  for (let p = 0; p < 5; p++) partidaCompleta(sessao);
  const r = sessao.iniciarPartida();
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "sem vidas");
  assert.ok(r.esperar_ms > 0 && r.esperar_ms <= 20 * MIN);
  assert.equal(sessao.ganharVidaComAnuncio().ok, true);
  assert.equal(sessao.iniciarPartida().ok, true);
});

test("configuração remota: valor mais agressivo é rejeitado; menos agressivo vale", () => {
  const { sessao } = montar({ remoto: { intervalo_s: 10 } });
  assert.equal(sessao.config.valores.intervalo_s, 60);
  assert.equal(sessao.config.rejeitados.length, 1);
  sessao.aplicarConfigRemota({ intervalo_s: 300 });
  assert.equal(sessao.config.valores.intervalo_s, 300);
  assert.equal(sessao.config.origem.intervalo_s, "valor remoto");
});

test("derrotas seguidas: partida com menos pontos que a anterior; outra partida zera", () => {
  const { sessao, avancar } = montar({ sementeSessao: 3 });
  const pontos = [];
  for (let p = 0; p < 5; p++) {
    partidaCompleta(sessao);
    pontos.push(sessao.eventos.filter((e) => e.tipo === "fim_partida").at(-1));
    avancar(25 * MIN);
  }
  let esperado = 0;
  pontos.forEach((f, i) => {
    if (i > 0) esperado = f.pontos < pontos[i - 1].pontos ? esperado + 1 : 0;
    assert.equal(f.derrota, i > 0 && f.pontos < pontos[i - 1].pontos);
  });
  assert.equal(sessao.derrotasSeguidas, esperado);
});

test("semente de cada partida depende só da semente da sessão e do número da partida", () => {
  assert.equal(sementeDaPartida(11, 1), sementeDaPartida(11, 1));
  assert.notEqual(sementeDaPartida(11, 1), sementeDaPartida(11, 2));
  const a = montar({ roteiro: () => "completo" });
  const b = montar({ roteiro: () => "indisponivel", compras: [REMOVER_ANUNCIOS] });
  for (const { sessao } of [a, b]) partidaCompleta(sessao);
  const pecas = (s) => s.eventos.find((e) => e.tipo === "fim_partida").pecas;
  assert.deepEqual(pecas(a.sessao), pecas(b.sessao));
});

test("oferta de troca na sessão mostra o número real de peças e some depois de usada", () => {
  const { sessao } = montar();
  sessao.iniciarPartida();
  assert.equal(sessao.ofertaTroca.pecas, 3);
  sessao.jogar(escolherJogada(sessao.partida.estado));
  assert.equal(sessao.ofertaTroca.pecas, 2);
  assert.equal(sessao.trocarComAnuncio().ok, true);
  assert.equal(sessao.ofertaTroca, null);
});

test("rewarded que apareceu impede intersticial na mesma pausa; rewarded indisponível não conta", () => {
  for (const [rewarded, esperado] of [["completo", "intervalo mínimo"], ["fechado", "intervalo mínimo"], ["indisponivel", null]]) {
    const { sessao, avancar } = montar({ roteiro: (tipo) => (tipo === "rewarded" ? rewarded : "completo") });
    for (let p = 1; p <= 2; p++) {
      avancar(2 * MIN);
      partidaCompleta(sessao);
      avancar(25 * MIN);
    }
    sessao.iniciarPartida(); // 3ª partida: elegível para intersticial
    jogarAteParar(sessao);
    sessao.responderContinuar("continuar");
    jogarAteParar(sessao);
    const ultimo = sessao.eventos.at(-1);
    if (esperado) assert.equal(ultimo.motivo, esperado, rewarded);
    else assert.equal(ultimo.tipo, "intersticial", rewarded);
  }
});
