// Controle da interface no navegador (ESPECIFICACAO.md, seção 10.1), sem DOM: guarda a sessão, o
// pedido aberto pelo jogador e a peça escolhida; transforma toque em ação da sessão. Tela, tamanho,
// cor e tempo vêm sempre de montarTela(cenaDaSessao(sessao, pedido, { selecionada })); o toque passa por tocar().
// O tempo t (ms, monotônico) vem de quem desenha; o relógio da sessão (vidas) é outro.
import { cenaDaSessao, anuncioAposEventos } from "../src/interface/cenas.mjs";
import { montarTela, tocar, TEMPOS } from "../src/interface/tela.mjs";
import { criarSdkSimulado, criarSessao } from "../src/sessao/sessao.mjs";

export function criarControle({ sementeSessao, relogio, consentimento = false }) {
  // O SDK simulado é síncrono: o rewarded só é pedido à sessão depois que o jogador viu ou fechou
  // a tela do anúncio, e o roteiro devolve o que ele fez. O intersticial não fecha antes do fim.
  let resultadoRewarded = "completo";
  const sdk = criarSdkSimulado({ roteiro: (tipo) => (tipo === "rewarded" ? resultadoRewarded : "completo") });
  const sessao = criarSessao({ sementeSessao, sdk, relogio, consentimento });
  const plataforma = []; // compras guardadas pela loja simulada da plataforma, para restaurar

  let pedido = null;
  let rewarded = null; // ação da sessão que espera o fim do rewarded aberto
  let selecionada = null; // índice da peça escolhida na rodada
  let tela = null;
  let chave = null;
  let aparecida = 0;
  // A tela atual veio de uma troca de tela (não é a primeira): nenhum toque aciona nada antes de
  // TEMPOS.janelaToque_ms, qualquer que seja a cena. Jogadas seguidas não trocam a tela (mesma
  // cena "jogando", mesmo pedido) e por isso não esperam.
  let comJanela = false;

  // Roda uma ação da sessão e abre o intersticial se ela terminou a partida com anúncio.
  function agir(acao) {
    const vistos = sessao.eventos.length;
    const r = acao();
    const anuncio = anuncioAposEventos(sessao.eventos.slice(vistos));
    if (anuncio) pedido = anuncio;
    return r;
  }

  function abrirRewarded(recompensa, origem, acao) {
    pedido = { tipo: "rewarded", recompensa, origem };
    rewarded = acao;
  }

  function concluirRewarded(resultado) {
    const acao = rewarded;
    rewarded = null;
    pedido = null;
    selecionada = null;
    resultadoRewarded = resultado;
    return agir(acao);
  }

  // Casa da grade tocada (linha e coluna vêm do modelo): canto superior esquerdo da peça escolhida.
  function colocar({ linha, coluna }) {
    if (selecionada === null) return false;
    try {
      agir(() => sessao.jogar({ indice: selecionada, linha, coluna }));
    } catch (erro) {
      if (erro instanceof RangeError) return false; // não cabe ali: nada muda
      throw erro;
    }
    selecionada = null;
    return true;
  }

  function executar({ id, acao }) {
    switch (acao) {
      case "nova_partida": {
        const r = sessao.iniciarPartida();
        pedido = r.ok ? null : { tipo: "sem_vidas" };
        selecionada = null;
        return r.ok;
      }
      case "escolher_peca":
        selecionada = Number(id.slice("peca-".length));
        return true;
      case "colocar":
        return colocar(tela.elementos.find((e) => e.id === id));
      case "abrir_loja":
        pedido = { tipo: "loja" };
        return true;
      case "pedir_confirmacao":
        pedido = { tipo: "loja", etapa: "confirmacao" };
        return true;
      case "comprar": {
        const { id: produto } = sessao.produtoSemAnuncios;
        const r = sessao.comprar(produto, { confirmado: true });
        if (r.ok && !plataforma.includes(produto)) plataforma.push(produto);
        pedido = { tipo: "loja" };
        return r.ok;
      }
      case "restaurar_compras":
        sessao.restaurarCompras(plataforma.slice());
        return true;
      case "voltar":
        pedido = pedido?.tipo === "loja" && pedido.etapa === "confirmacao" ? { tipo: "loja" } : null;
        return true;
      case "abrir_oferta_troca":
        pedido = { tipo: "oferta_troca" };
        return true;
      case "trocar_com_anuncio": {
        const oferta = sessao.ofertaTroca;
        abrirRewarded(oferta.recompensa, "troca", () => sessao.trocarComAnuncio());
        return true;
      }
      case "continuar":
        abrirRewarded(sessao.partida.oferta.recompensa, "continuar", () => sessao.responderContinuar("continuar"));
        return true;
      case "recusar":
        agir(() => sessao.responderContinuar("recusar"));
        return true;
      case "ganhar_vida":
        abrirRewarded("1 vida", "vida", () => sessao.ganharVidaComAnuncio());
        return true;
      case "fechar":
        if (rewarded) concluirRewarded("fechado");
        else pedido = null;
        return true;
      default:
        throw new RangeError(`ação desconhecida: ${acao}`);
    }
  }

  // Monta a tela de agora. Mudou a cena ou o pedido: a tela "aparece" em t e, se não é a primeira,
  // abre a janela de toque. toqueDesde_ms: instante (desde que a tela apareceu) a partir do qual
  // algum toque pode valer.
  function atualizar(t) {
    tela = montarTela(cenaDaSessao(sessao, pedido, { selecionada }));
    const nova = `${tela.cena}|${JSON.stringify(pedido)}`;
    if (nova !== chave) {
      comJanela = chave !== null;
      chave = nova;
      aparecida = t;
    }
    return { tela, t_ms: t - aparecida, toqueDesde_ms: comJanela ? TEMPOS.janelaToque_ms : 0 };
  }

  return {
    atualizar,
    // Toque no ponto (x, y) da tela de referência no instante t; devolve o elemento tocado ou null.
    // A tela que resulta do toque aparece no mesmo instante. Na janela depois de uma troca de tela,
    // nenhum toque vale (o segundo toque de um toque duplo não cai na tela seguinte).
    tocar({ x, y }, t) {
      const atual = tela ?? atualizar(t).tela;
      const t_ms = t - aparecida;
      if (comJanela && t_ms < TEMPOS.janelaToque_ms) return null;
      const alvo = tocar(atual, { x, y, t_ms });
      if (!alvo) return null;
      const ok = executar(alvo);
      atualizar(t);
      return { ...alvo, ok };
    },
    // Milissegundos até o rewarded aberto acabar sozinho (null se não há rewarded aberto).
    restanteRewarded(t) {
      return rewarded ? Math.max(0, aparecida + TEMPOS.rewarded_ms - t) : null;
    },
    // Rewarded visto até o fim: conclui como completo.
    avancar(t) {
      if (rewarded && t - aparecida >= TEMPOS.rewarded_ms) {
        concluirRewarded("completo");
        atualizar(t);
      }
    },
    get sessao() {
      return sessao;
    },
    get sdk() {
      return sdk;
    },
    get selecionada() {
      return selecionada;
    },
  };
}
