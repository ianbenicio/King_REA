// Casos de teste da regra R6 (semgrep --test).
/* global elemento, ALVO_MIN_PX */

// ruleid: r6-fechar-alvo-pequeno
export const pequenoNaLargura = elemento({
  id: "fechar",
  papel: "fechar",
  acao: "fechar",
  largura: 24,
  altura: 44,
});

// ruleid: r6-fechar-alvo-pequeno
export const pequenoNaAltura = { altura: 20, largura: 64, papel: "fechar" };

// ok: r6-fechar-alvo-pequeno
export const fecharDoModelo = elemento({
  id: "fechar",
  papel: "fechar",
  acao: "fechar",
  largura: 64,
  altura: ALVO_MIN_PX,
});

// ok: r6-fechar-alvo-pequeno
export const fecharNoLimite = { papel: "fechar", largura: 44, altura: 44 };

// ok: r6-fechar-alvo-pequeno
export const rotuloPequeno = { papel: "rotulo", largura: 30, altura: 20 };
