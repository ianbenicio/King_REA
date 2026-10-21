// Casos de teste da regra R4 (semgrep --test).
/* global sdk, ads, nucleo */

export const sessao = {
  jogar(jogada) {
    // ruleid: r4-intersticial-durante-jogada
    sdk.exibir("intersticial");
    return nucleo.jogar(jogada);
  },
  encerrarPartida() {
    // ok: r4-intersticial-durante-jogada
    sdk.exibir("intersticial");
  },
};

export function colocarPeca(jogada) {
  // ruleid: r4-intersticial-durante-jogada
  ads.showInterstitial();
  return jogada;
}

export const aoArrastar = (x) => {
  // ruleid: r4-intersticial-durante-jogada
  sdk.mostrar(x, "intersticial");
};

export function jogarComDica(jogada) {
  // ok: r4-intersticial-durante-jogada
  sdk.exibir("rewarded");
  return jogada;
}
