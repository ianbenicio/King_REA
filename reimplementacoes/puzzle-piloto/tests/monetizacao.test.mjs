// Testes das peças de monetização isoladas (config, SDK simulado, agendador, recompensas, loja, vidas).
import { test } from "node:test";
import assert from "node:assert/strict";
import { CONFIG_PADRAO, LIMITES, resolverConfig } from "../src/monetizacao/config.mjs";
import { criarSdkSimulado } from "../src/monetizacao/sdk-simulado.mjs";
import { AGENDADOR_INICIAL, aoTerminarPartida, registrarExibicao } from "../src/monetizacao/agendador.mjs";
import { entregaUnica, ofertaContinuar, podeTrocar } from "../src/monetizacao/recompensas.mjs";
import { REMOVER_ANUNCIOS, comprar, restaurar, semAnuncios } from "../src/monetizacao/loja.mjs";
import { consumirVida, ganharPorAnuncio, podeGanharPorAnuncio, tempoAteProxima, vidasIniciais } from "../src/monetizacao/vidas.mjs";

const MIN = 60 * 1000;

test("config: padrão local vem do perfil aprovado", () => {
  assert.deepEqual(CONFIG_PADRAO, { partidas_entre_anuncios: 2, intervalo_s: 60, max_por_sessao: 5, carencia_partidas: 2, recarga_vida_min: 20 });
  assert.deepEqual(LIMITES, { trocaComAnuncioPorPartida: 1, continuacoesPorPartida: 1, vidasMax: 5, vidaPorAnuncioPorDia: 3 });
  const r = resolverConfig(undefined);
  assert.deepEqual(r.valores, CONFIG_PADRAO);
  assert.ok(Object.values(r.origem).every((o) => o === "padrao local"));
});

test("config: remoto menos agressivo vale; a origem fica registrada", () => {
  const r = resolverConfig({ partidas_entre_anuncios: 3, intervalo_s: 120, max_por_sessao: 2, carencia_partidas: 3, recarga_vida_min: 30 });
  assert.deepEqual(r.valores, { partidas_entre_anuncios: 3, intervalo_s: 120, max_por_sessao: 2, carencia_partidas: 3, recarga_vida_min: 30 });
  assert.ok(Object.values(r.origem).every((o) => o === "valor remoto"));
  assert.deepEqual(r.rejeitados, []);
  assert.equal(resolverConfig('{"intervalo_s": 90}').valores.intervalo_s, 90, "texto JSON");
});

test("config: remoto mais agressivo que o aprovado é rejeitado e o padrão continua", () => {
  const r = resolverConfig({ partidas_entre_anuncios: 1, intervalo_s: 10, max_por_sessao: 9, carencia_partidas: 0, recarga_vida_min: 5 });
  assert.deepEqual(r.valores, CONFIG_PADRAO);
  assert.equal(r.rejeitados.length, 5);
});

test("config: tipo errado, chave desconhecida e JSON inválido são rejeitados", () => {
  const r = resolverConfig({ intervalo_s: "60", max_por_sessao: 1.5, dificuldade: 3 });
  assert.deepEqual(r.valores, CONFIG_PADRAO);
  assert.equal(r.rejeitados.length, 3);
  for (const ruim of ["{ quebrado", "[1,2]", 42]) {
    const x = resolverConfig(ruim);
    assert.deepEqual(x.valores, CONFIG_PADRAO, String(ruim));
    assert.equal(x.rejeitados.length, 1);
  }
});

test("SDK simulado: exige consentimento decidido; callback de recompensa só em rewarded concluído", () => {
  assert.throws(() => criarSdkSimulado().exibir("intersticial"), Error);
  assert.throws(() => criarSdkSimulado().inicializar({}), TypeError);
  const roteiro = ["completo", "fechado", "indisponivel", "duplicado", "completo"];
  const sdk = criarSdkSimulado({ roteiro: (_, i) => roteiro[i] });
  sdk.inicializar({ consentimento: false });
  let chamadas = 0;
  const contar = { aoRecompensar: () => chamadas++ };
  assert.deepEqual(sdk.exibir("rewarded", contar), { exibido: true, resultado: "completo" });
  assert.equal(chamadas, 1);
  sdk.exibir("rewarded", contar);
  assert.equal(chamadas, 1, "fechado não recompensa");
  assert.equal(sdk.exibir("rewarded", contar).exibido, false);
  sdk.exibir("rewarded", contar);
  assert.equal(chamadas, 3, "duplicado chama duas vezes");
  sdk.exibir("intersticial", contar);
  assert.equal(chamadas, 3, "intersticial não recompensa");
  assert.ok(sdk.registro.filter((r) => r.evento === "exibir").every((r) => r.personalizado === false));
});

test("agendador: carência, partidas entre anúncios, intervalo mínimo e teto", () => {
  const config = CONFIG_PADRAO;
  let estado = AGENDADOR_INICIAL;
  let t = 0;
  const fim = (avanco) => {
    t += avanco;
    const d = aoTerminarPartida(estado, { config, agora: t, semAnuncios: false });
    estado = d.exibir ? registrarExibicao(d.estado, t) : d.estado;
    return d;
  };
  assert.equal(fim(5 * MIN).motivo, "carência inicial");
  assert.equal(fim(5 * MIN).motivo, "carência inicial");
  assert.equal(fim(5 * MIN).exibir, true, "3ª partida");
  assert.equal(fim(5 * MIN).motivo, "poucas partidas desde o último");
  assert.equal(fim(20 * 1000).exibir, true, "5ª partida, 5 min 20 s depois do anúncio da 3ª");
  assert.equal(fim(5 * MIN).motivo, "poucas partidas desde o último");
  assert.equal(fim(10 * 1000).exibir, true, "7ª partida: 2 partidas e mais de 60 s desde o anúncio da 5ª");
});

test("agendador: intervalo mínimo conta a partir do último anúncio exibido", () => {
  const config = CONFIG_PADRAO;
  let estado = { ...AGENDADOR_INICIAL, partidasTerminadas: 10, partidasDesdeUltimo: 5 };
  estado = registrarExibicao(estado, 0);
  estado = aoTerminarPartida(estado, { config, agora: 10 * 1000, semAnuncios: false }).estado;
  const d = aoTerminarPartida(estado, { config, agora: 30 * 1000, semAnuncios: false });
  assert.equal(d.exibir, false);
  assert.equal(d.motivo, "intervalo mínimo");
  assert.equal(aoTerminarPartida(estado, { config, agora: 61 * 1000, semAnuncios: false }).exibir, true);
});

test("agendador: nunca passa do teto da sessão nem exibe com anúncios removidos", () => {
  let estado = AGENDADOR_INICIAL;
  let exibidos = 0;
  for (let i = 1; i <= 100; i++) {
    const d = aoTerminarPartida(estado, { config: CONFIG_PADRAO, agora: i * 10 * MIN, semAnuncios: false });
    estado = d.exibir ? registrarExibicao(d.estado, i * 10 * MIN) : d.estado;
    if (d.exibir) exibidos++;
  }
  assert.equal(exibidos, CONFIG_PADRAO.max_por_sessao);
  const sem = aoTerminarPartida({ ...AGENDADOR_INICIAL, partidasTerminadas: 50, partidasDesdeUltimo: 50 }, { config: CONFIG_PADRAO, agora: 0, semAnuncios: true });
  assert.equal(sem.exibir, false);
});

test("recompensas: limites por partida, oferta de continuar com recusa igual e sem prazo, entrega única", () => {
  assert.equal(podeTrocar({ fim: false, trocasComAnuncio: 0 }), true);
  assert.equal(podeTrocar({ fim: false, trocasComAnuncio: 1 }), false);
  assert.equal(podeTrocar({ fim: true, trocasComAnuncio: 0 }), false);
  const oferta = ofertaContinuar({ continuacoesComAnuncio: 0 });
  assert.deepEqual(oferta.opcoes.map((o) => o.acao), ["continuar", "recusar"]);
  assert.equal(oferta.destaque, "igual");
  assert.equal(oferta.prazo_s, null);
  assert.equal(ofertaContinuar({ continuacoesComAnuncio: 1 }), null);
  let n = 0;
  const e = entregaUnica(() => n++);
  e.aoRecompensar();
  e.aoRecompensar();
  assert.equal(n, 1);
  assert.equal(e.entregue, true);
});

test("loja: compra só com confirmação explícita; restaurar aceita só produtos conhecidos", () => {
  assert.equal(comprar([], REMOVER_ANUNCIOS).ok, false);
  assert.equal(comprar([], REMOVER_ANUNCIOS, { confirmado: "sim" }).ok, false);
  const r = comprar([], REMOVER_ANUNCIOS, { confirmado: true });
  assert.deepEqual(r.compras, [REMOVER_ANUNCIOS]);
  assert.equal(semAnuncios(r.compras), true);
  assert.deepEqual(comprar(r.compras, REMOVER_ANUNCIOS, { confirmado: true }).compras, [REMOVER_ANUNCIOS]);
  assert.equal(comprar([], "moedas", { confirmado: true }).ok, false);
  assert.deepEqual(restaurar([REMOVER_ANUNCIOS, "outro", REMOVER_ANUNCIOS]), [REMOVER_ANUNCIOS]);
});

test("vidas: consumo, recarga por tempo até o máximo e tempo até a próxima", () => {
  const config = CONFIG_PADRAO;
  let v = vidasIniciais(0);
  for (let i = 0; i < 5; i++) {
    const r = consumirVida(v, 0, config);
    assert.equal(r.ok, true);
    v = r.estado;
  }
  assert.equal(consumirVida(v, 0, config).ok, false);
  assert.equal(tempoAteProxima(v, 0, config), 20 * MIN);
  assert.equal(tempoAteProxima(v, 15 * MIN, config), 5 * MIN);
  assert.equal(consumirVida(v, 20 * MIN, config).ok, true, "uma vida recarregada");
  assert.equal(consumirVida(v, 1000 * MIN, config).estado.vidas, 4, "recarga para no máximo (5) e consome 1");
  const lenta = { ...config, recarga_vida_min: 30 };
  assert.equal(consumirVida(v, 20 * MIN, lenta).ok, false, "remoto mais lento vale");
});

test("vidas: relógio que volta não tira vidas nem libera mais vidas por anúncio no mesmo dia", () => {
  const config = CONFIG_PADRAO;
  let v = vidasIniciais(10 * MIN);
  v = consumirVida(v, 10 * MIN, config).estado;
  v = consumirVida(v, 10 * MIN, config).estado;
  assert.equal(v.vidas, 3);
  const voltou = consumirVida(v, -30 * MIN, config);
  assert.equal(voltou.ok, true);
  assert.equal(voltou.estado.vidas, 2, "relógio 40 min para trás não tira vidas");
  let w = { ...vidasIniciais(10 * MIN), vidas: 0 };
  for (let i = 0; i < 3; i++) w = ganharPorAnuncio(w, 10 * MIN, config);
  assert.equal(podeGanharPorAnuncio({ ...w, vidas: 0, recargaDesde: -2 * 24 * 60 * MIN }, -2 * 24 * 60 * MIN, config), false, "voltar o dia não zera o limite");
});

test("vidas por anúncio: só abaixo do máximo, até 3 por dia, zera no dia seguinte", () => {
  const config = CONFIG_PADRAO;
  let v = { ...vidasIniciais(0), vidas: 0 };
  assert.equal(podeGanharPorAnuncio(vidasIniciais(0), 0, config), false, "cheio");
  for (let i = 0; i < 3; i++) v = ganharPorAnuncio(v, 0, config);
  assert.equal(v.vidas, 3);
  assert.equal(podeGanharPorAnuncio(v, 0, config), false, "limite do dia");
  assert.deepEqual(ganharPorAnuncio(v, 0, config), v);
  const amanha = 24 * 60 * MIN;
  // recargaDesde no início de amanhã, para isolar a virada do dia da recarga por tempo
  assert.equal(podeGanharPorAnuncio({ ...v, vidas: 0, recargaDesde: amanha }, amanha, config), true);
  assert.equal(podeGanharPorAnuncio({ ...v, vidas: 0 }, amanha, config), false, "24 h de recarga já encheram as vidas");
});
