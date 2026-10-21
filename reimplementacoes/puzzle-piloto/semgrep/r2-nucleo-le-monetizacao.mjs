// Casos de teste da regra R2 (semgrep --test). Tratados como se estivessem em src/nucleo/.
// Comentários e textos podem falar de anúncios; só código conta.

export function pesosLimpos({ ocupacao, derrotasSeguidas }) {
  // ok: r2-nucleo-le-monetizacao
  const texto = "sem anúncios aqui";
  // ok: r2-nucleo-le-monetizacao
  return [ocupacao, derrotasSeguidas, texto];
}

export function pesosAcoplados(entrada, sessao) {
  // ruleid: r2-nucleo-le-monetizacao
  const exibidos = sessao.agendador.exibidosNaSessao;
  // ruleid: r2-nucleo-le-monetizacao
  const comprou = entrada.compras.length > 0;
  // ruleid: r2-nucleo-le-monetizacao
  const pendente = anuncioPendente(entrada);
  // ruleid: r2-nucleo-le-monetizacao
  const poucas = sessao.vidas.vidas <= 2;
  // ruleid: r2-nucleo-le-monetizacao
  const remoto = entrada.configRemota;
  // ruleid: r2-nucleo-le-monetizacao
  return [exibidos, comprou, pendente, poucas, remoto];
}

// ruleid: r2-nucleo-le-monetizacao
export const gerarComOferta = (estado, ofertaAtiva) => (ofertaAtiva ? estado : null);
