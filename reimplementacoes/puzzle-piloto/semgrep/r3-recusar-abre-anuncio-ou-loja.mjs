// Casos de teste da regra R3 (semgrep --test).
/* global sdk, loja, tela, abrirLoja, showAd */

export function fecharOferta() {
  // ruleid: r3-recusar-abre-anuncio-ou-loja
  sdk.exibir("intersticial");
}

export const recusarContinuar = () => {
  // ruleid: r3-recusar-abre-anuncio-ou-loja
  abrirLoja();
};

export class Tela {
  aoFechar() {
    // ruleid: r3-recusar-abre-anuncio-ou-loja
    this.loja.comprar("moedas");
  }
  aoJogar() {
    // ok: r3-recusar-abre-anuncio-ou-loja
    sdk.exibir("rewarded");
  }
}

export const handlers = {
  onClose() {
    // ruleid: r3-recusar-abre-anuncio-ou-loja
    showAd();
  },
  dismiss: () => {
    // ruleid: r3-recusar-abre-anuncio-ou-loja
    loja.abrirLoja();
  },
};

export function encerrarPartida() {
  // ok: r3-recusar-abre-anuncio-ou-loja
  sdk.exibir("intersticial");
}

export function fechar() {
  // ok: r3-recusar-abre-anuncio-ou-loja
  tela.esconder();
}
