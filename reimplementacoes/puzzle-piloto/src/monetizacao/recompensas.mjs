// Anúncios com recompensa escolhidos pelo jogador. Regras de elegibilidade e oferta; a sessão
// exibe o anúncio e só entrega a recompensa no callback do SDK, uma única vez.
import { LIMITES } from "./config.mjs";

// MON-0001 — trocar as peças da rodada assistindo a um anúncio: opcional, recompensa informada
// antes, no máximo LIMITES.trocaComAnuncioPorPartida vezes por partida. Recusar não muda nada.
export function podeTrocar({ fim, trocasComAnuncio }) {
  return !fim && trocasComAnuncio < LIMITES.trocaComAnuncioPorPartida;
}

// A oferta diz exatamente quantas peças serão trocadas: só as que ainda faltam usar na rodada.
export function ofertaTroca({ fim, trocasComAnuncio, rodada }) {
  if (!podeTrocar({ fim, trocasComAnuncio })) return null;
  const pecas = rodada.filter((id) => id !== null).length;
  return Object.freeze({
    acao: "trocar",
    anuncio: "rewarded",
    pecas,
    recompensa: pecas === 1 ? "1 peça nova no lugar da que falta usar" : `${pecas} peças novas no lugar das que faltam usar`,
  });
}

// MON-0009 — continuar após a derrota com anúncio: no máximo uma vez por partida, recusa com o
// mesmo destaque do aceite e sem prazo para decidir. Sem oferta quando o limite foi atingido.
export function ofertaContinuar({ continuacoesComAnuncio }) {
  if (continuacoesComAnuncio >= LIMITES.continuacoesPorPartida) return null;
  return Object.freeze({
    opcoes: Object.freeze([
      Object.freeze({ acao: "continuar", rotulo: "Continuar (assistir a um anúncio)" }),
      Object.freeze({ acao: "recusar", rotulo: "Encerrar a partida" }),
    ]),
    destaque: "igual",
    prazo_s: null,
    recompensa: "esvazia 2 linhas e 2 colunas",
  });
}

// Entrega a recompensa uma vez só, mesmo se o SDK chamar o callback de novo.
export function entregaUnica(entregar) {
  let entregue = false;
  return {
    aoRecompensar() {
      if (entregue) return;
      entregue = true;
      entregar();
    },
    get entregue() {
      return entregue;
    },
  };
}
