// Casos de teste da regra R5 (semgrep --test).
/* global entregar, sessao */

export function entregaUnica(fn) {
  let entregue = false;
  return {
    aoRecompensar() {
      // ok: r5-recompensa-condicional
      if (entregue) return;
      entregue = true;
      fn();
    },
  };
}

export const callbacks = {
  aoRecompensar: () => {
    // ruleid: r5-recompensa-condicional
    if (sessao.anunciosVistosHoje < 3) entregar();
  },
};

export function onUserEarnedReward(item) {
  // ruleid: r5-recompensa-condicional
  if (item.valor > 0 && Math.random() < 0.5) {
    entregar(item);
  }
}

export function semCondicao() {
  // ok: r5-recompensa-condicional
  if (sessao.ativa) entregar();
}

export function exibirRewarded(sdk, exibido) {
  // ok: r5-recompensa-condicional
  if (exibido) sdk.registrar();
}
