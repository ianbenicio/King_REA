// Sessão de jogo: liga o núcleo à monetização (ESPECIFICACAO.md, seção 9). O núcleo não conhece
// esta camada; aqui a monetização só reage a eventos do jogo (fim de partida, derrota) e só
// altera a partida pelas ações explícitas do núcleo (trocarRodada, continuar).
import { continuar, jogar, novaPartida, trocarRodada } from "../nucleo/jogo.mjs";
import { semear } from "../nucleo/prng.mjs";
import { AGENDADOR_INICIAL, aoTerminarPartida, registrarExibicao } from "../monetizacao/agendador.mjs";
import { resolverConfig } from "../monetizacao/config.mjs";
import { comprar, restaurar, semAnuncios } from "../monetizacao/loja.mjs";
import { entregaUnica, ofertaContinuar, podeTrocar } from "../monetizacao/recompensas.mjs";
import { consumirVida, ganharPorAnuncio, podeGanharPorAnuncio, tempoAteProxima, vidasIniciais } from "../monetizacao/vidas.mjs";

// Semente da partida n: derivada só da semente da sessão e de n (nada de monetização entra).
export const sementeDaPartida = (sementeSessao, n) => semear((sementeSessao ^ Math.imul(n, 0x9e3779b9)) >>> 0)[0];

export function criarSessao({ sementeSessao, sdk, relogio, consentimento, remoto, compras = [] }) {
  if (!Number.isInteger(sementeSessao)) throw new TypeError("sementeSessao precisa ser inteira");
  sdk.inicializar({ consentimento });
  let config = resolverConfig(remoto);
  let agendador = AGENDADOR_INICIAL;
  let vidas = vidasIniciais(relogio());
  let carteira = restaurar(compras);
  let numeroPartida = 0;
  let derrotasSeguidas = 0;
  let pontosAnterior = null;
  let partida = null; // { estado, trocasComAnuncio, continuacoesComAnuncio, oferta, pecas }
  const eventos = [];
  const registrar = (evento) => eventos.push({ ...evento, em: relogio() });

  const anotarSorteio = (efeito) => {
    if (efeito.sorteio) partida.pecas.push(...efeito.sorteio.pecas);
  };

  function encerrarPartida() {
    const { pontos } = partida.estado;
    const derrota = pontosAnterior !== null && pontos < pontosAnterior;
    derrotasSeguidas = derrota ? derrotasSeguidas + 1 : 0;
    pontosAnterior = pontos;
    registrar({ tipo: "fim_partida", partida: numeroPartida, pontos, derrota, pecas: partida.pecas.slice() });
    const agora = relogio();
    const decisao = aoTerminarPartida(agendador, { config: config.valores, agora, semAnuncios: semAnuncios(carteira) });
    agendador = decisao.estado;
    if (decisao.exibir) {
      const { exibido, resultado } = sdk.exibir("intersticial");
      if (exibido) agendador = registrarExibicao(agendador, agora);
      registrar({ tipo: "intersticial", resultado });
    } else registrar({ tipo: "intersticial_pulado", motivo: decisao.motivo });
    partida = null;
  }

  // Depois de qualquer ação que pode terminar a partida: oferecer continuar ou encerrar.
  function aposAcao() {
    if (!partida.estado.fim) return;
    partida.oferta = ofertaContinuar(partida);
    if (partida.oferta) registrar({ tipo: "oferta_continuar", partida: numeroPartida });
    else encerrarPartida();
  }

  const exigirPartida = () => {
    if (!partida) throw new Error("nenhuma partida em andamento");
    if (partida.oferta) throw new Error("responda a oferta de continuar antes");
  };

  return {
    eventos,
    iniciarPartida() {
      if (partida) throw new Error("já há uma partida em andamento");
      const agora = relogio();
      const consumo = consumirVida(vidas, agora, config.valores);
      vidas = consumo.estado;
      if (!consumo.ok) return { ok: false, motivo: "sem vidas", esperar_ms: tempoAteProxima(vidas, agora, config.valores) };
      numeroPartida += 1;
      const estado = novaPartida({ semente: sementeDaPartida(sementeSessao, numeroPartida), derrotasSeguidas });
      partida = { estado, trocasComAnuncio: 0, continuacoesComAnuncio: 0, oferta: null, pecas: [...estado.rodada] };
      registrar({ tipo: "inicio_partida", partida: numeroPartida, derrotasSeguidas });
      return { ok: true, partida: numeroPartida };
    },

    jogar(jogada) {
      exigirPartida();
      const { estado, efeito } = jogar(partida.estado, jogada);
      partida.estado = estado;
      anotarSorteio(efeito);
      aposAcao();
      return efeito;
    },

    // MON-0001: o jogador escolhe; recompensa só no callback, uma vez.
    trocarComAnuncio() {
      exigirPartida();
      if (!podeTrocar({ fim: partida.estado.fim, trocasComAnuncio: partida.trocasComAnuncio })) return { ok: false, motivo: "limite da partida" };
      const entrega = entregaUnica(() => {
        const { estado, efeito } = trocarRodada(partida.estado);
        partida.estado = estado;
        partida.trocasComAnuncio += 1;
        anotarSorteio(efeito);
      });
      const { resultado } = sdk.exibir("rewarded", { aoRecompensar: entrega.aoRecompensar });
      registrar({ tipo: "rewarded_troca", resultado, entregue: entrega.entregue });
      if (entrega.entregue) aposAcao();
      return { ok: entrega.entregue, resultado };
    },

    // MON-0009: a oferta aparece no fim; aceitar exibe o anúncio, recusar encerra normalmente.
    responderContinuar(acao) {
      if (!partida?.oferta) throw new Error("não há oferta de continuar");
      if (acao !== "continuar" && acao !== "recusar") throw new RangeError(`resposta inválida: ${acao}`);
      partida.oferta = null;
      if (acao === "recusar") {
        registrar({ tipo: "continuar_recusado" });
        encerrarPartida();
        return { ok: false, resultado: "recusado" };
      }
      const entrega = entregaUnica(() => {
        partida.estado = continuar(partida.estado).estado;
        partida.continuacoesComAnuncio += 1;
      });
      const { resultado } = sdk.exibir("rewarded", { aoRecompensar: entrega.aoRecompensar });
      registrar({ tipo: "rewarded_continuar", resultado, entregue: entrega.entregue });
      if (entrega.entregue) aposAcao();
      else encerrarPartida();
      return { ok: entrega.entregue, resultado };
    },

    // MON-0011: vida extra por anúncio, dentro do limite diário.
    ganharVidaComAnuncio() {
      const agora = relogio();
      if (!podeGanharPorAnuncio(vidas, agora, config.valores)) return { ok: false, motivo: "vidas cheias ou limite do dia" };
      const entrega = entregaUnica(() => {
        vidas = ganharPorAnuncio(vidas, relogio(), config.valores);
      });
      const { resultado } = sdk.exibir("rewarded", { aoRecompensar: entrega.aoRecompensar });
      registrar({ tipo: "rewarded_vida", resultado, entregue: entrega.entregue });
      return { ok: entrega.entregue, resultado };
    },

    // MON-0003
    comprar(produto, opcoes) {
      const r = comprar(carteira, produto, opcoes);
      carteira = r.compras;
      registrar({ tipo: "compra", produto, ok: r.ok, motivo: r.motivo });
      return r;
    },
    restaurarCompras(daPlataforma) {
      carteira = restaurar(daPlataforma);
      return carteira.slice();
    },

    aplicarConfigRemota(novoRemoto) {
      config = resolverConfig(novoRemoto);
      registrar({ tipo: "config", origem: config.origem, rejeitados: config.rejeitados });
      return config;
    },

    get config() {
      return config;
    },
    get partida() {
      return partida && { estado: partida.estado, oferta: partida.oferta, trocasComAnuncio: partida.trocasComAnuncio, continuacoesComAnuncio: partida.continuacoesComAnuncio };
    },
    get vidas() {
      return vidas;
    },
    get agendador() {
      return agendador;
    },
    get compras() {
      return carteira.slice();
    },
    get derrotasSeguidas() {
      return derrotasSeguidas;
    },
  };
}
