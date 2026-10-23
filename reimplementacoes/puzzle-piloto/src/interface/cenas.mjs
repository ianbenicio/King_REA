// Da sessão para a cena (ESPECIFICACAO.md, seção 10). Lê só o que a sessão expõe (criarSessao) e
// o pedido local da interface (o que o jogador abriu). Não muda a sessão.

// Anúncio que aparece sem pedido depois de uma ação, a partir dos eventos novos da sessão: só o
// intersticial, só se o SDK tinha anúncio e só depois do fim da partida. Nunca durante a jogada.
export function anuncioAposEventos(novos) {
  const i = novos.findIndex((e) => e.tipo === "intersticial" && e.resultado !== "indisponivel");
  if (i < 0) return null;
  if (!novos.slice(0, i).some((e) => e.tipo === "fim_partida")) return null;
  return { tipo: "intersticial" };
}

// pedido: null (a tela que a sessão impõe) ou { tipo } para intersticial, rewarded
// ({ recompensa }), oferta_troca, loja ({ etapa }) e sem_vidas. A oferta de continuar tem
// precedência sobre qualquer pedido.
export function cenaDaSessao(sessao, pedido = null) {
  const partida = sessao.partida;
  if (partida?.oferta) return { tipo: "oferta_continuar", oferta: partida.oferta, pontos: partida.estado.pontos };
  switch (pedido?.tipo) {
    case "intersticial":
      if (!partida) return { tipo: "intersticial" };
      break; // partida em andamento: intersticial nunca aparece no meio da jogada
    case "rewarded":
      return { tipo: "rewarded", recompensa: pedido.recompensa };
    case "oferta_troca": {
      const oferta = sessao.ofertaTroca;
      if (oferta) return { tipo: "oferta_troca", oferta };
      break;
    }
    case "loja":
      return { tipo: "loja", etapa: pedido.etapa ?? "produto", comprado: sessao.semAnuncios };
    case "sem_vidas": {
      const { esperar_ms, ofertaAnuncio } = sessao.painelVidas;
      return { tipo: "sem_vidas", esperar_ms, ofertaAnuncio };
    }
    default:
      break;
  }
  if (partida)
    return { tipo: "jogando", pontos: partida.estado.pontos, vidas: sessao.painelVidas.vidas, pecas: partida.estado.rodada, ofertaTroca: sessao.ofertaTroca };
  const fim = sessao.eventos.findLast((e) => e.tipo === "fim_partida");
  return { tipo: "inicio", pontosUltima: fim ? fim.pontos : null };
}
