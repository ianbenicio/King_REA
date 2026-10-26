// Sessão de jogo: liga o núcleo à monetização (ESPECIFICACAO.md, seção 9). O núcleo não conhece
// esta camada; aqui a monetização só reage a eventos do jogo (fim de partida, derrota) e só
// altera a partida pelas ações explícitas do núcleo (trocarRodada, continuar).
import * as nucleoPadrao from "../nucleo/jogo.mjs";
import { semear } from "../nucleo/prng.mjs";
import { AGENDADOR_INICIAL, aoTerminarPartida, registrarAnuncio, registrarExibicao } from "../monetizacao/agendador.mjs";
import { resolverConfig } from "../monetizacao/config.mjs";
import { comprar, restaurar, semAnuncios } from "../monetizacao/loja.mjs";
import { entregaUnica, ofertaContinuar, ofertaTroca, podeTrocar } from "../monetizacao/recompensas.mjs";
import { atualizar, consumirVida, ganharPorAnuncio, podeGanharPorAnuncio, tempoAteProxima, vidasIniciais } from "../monetizacao/vidas.mjs";
import { PRODUTOS, REMOVER_ANUNCIOS } from "../monetizacao/loja.mjs";

// A interface fala só com a sessão (ESPECIFICACAO.md, seção 10): o que ela precisa de fora daqui
// passa por esta camada. A forma das peças (para o desenho) e o SDK simulado (o piloto não tem
// SDK real) são reexportados sem mudança.
export { peca } from "../nucleo/pecas.mjs";
export { criarSdkSimulado } from "../monetizacao/sdk-simulado.mjs";

// Semente da partida n: derivada só da semente da sessão e de n (nada de monetização entra).
export const sementeDaPartida = (sementeSessao, n) => semear((sementeSessao ^ Math.imul(n, 0x9e3779b9)) >>> 0)[0];

// nucleo: as quatro ações do núcleo; trocável só para testes (gravar sorteios, aplicar mutações).
export function criarSessao({ sementeSessao, sdk, relogio, consentimento, remoto, compras = [], nucleo = nucleoPadrao }) {
  if (!Number.isInteger(sementeSessao)) throw new TypeError("sementeSessao precisa ser inteira");
  const { continuar, jogar, novaPartida, trocarRodada } = nucleo;
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
    registrar({
      tipo: "fim_partida",
      partida: numeroPartida,
      pontos,
      derrota,
      pecas: partida.pecas.slice(),
      trocas: partida.estado.trocas,
      continuacoes: partida.estado.continuacoes,
    });
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

  // Exibe um rewarded escolhido pelo jogador. Se apareceu (concluído ou não), conta para o
  // intervalo mínimo do intersticial: anúncio de qualquer tipo abre o intervalo.
  function exibirRewarded(tipo, entrega) {
    const { exibido, resultado } = sdk.exibir("rewarded", { aoRecompensar: entrega.aoRecompensar });
    if (exibido) agendador = registrarAnuncio(agendador, relogio());
    registrar({ tipo, resultado, entregue: entrega.entregue });
    return resultado;
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
      const resultado = exibirRewarded("rewarded_troca", entrega);
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
      const resultado = exibirRewarded("rewarded_continuar", entrega);
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
      const resultado = exibirRewarded("rewarded_vida", entrega);
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

    // MON-0001: o que o jogador vê antes de escolher trocar (null se não puder).
    get ofertaTroca() {
      if (!partida || partida.oferta) return null;
      return ofertaTroca({ fim: partida.estado.fim, trocasComAnuncio: partida.trocasComAnuncio, rodada: partida.estado.rodada });
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
    // MON-0011: o que a interface mostra das vidas agora (contagem, espera e se a vida por anúncio
    // ainda cabe no dia). Só leitura: não muda o estado guardado.
    get painelVidas() {
      const agora = relogio();
      return {
        vidas: atualizar(vidas, agora, config.valores).vidas,
        esperar_ms: tempoAteProxima(vidas, agora, config.valores),
        ofertaAnuncio: podeGanharPorAnuncio(vidas, agora, config.valores),
      };
    },
    get semAnuncios() {
      return semAnuncios(carteira);
    },
    // MON-0003: o produto da loja como a interface o mostra (identificador e preço). Só leitura.
    get produtoSemAnuncios() {
      return Object.freeze({ id: REMOVER_ANUNCIOS, preco: PRODUTOS[REMOVER_ANUNCIOS].preco });
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
