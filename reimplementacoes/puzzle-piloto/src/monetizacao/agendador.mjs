// MON-0002 — Intersticial só no fim de partida, com carência, intervalo mínimo e teto por sessão.
// Funções puras sobre um estado pequeno; quem chama é a sessão, e só no evento de fim de partida.

export const AGENDADOR_INICIAL = Object.freeze({ partidasTerminadas: 0, partidasDesdeUltimo: 0, exibidosNaSessao: 0, ultimoEm: null });

// Decide se o intersticial deve aparecer neste fim de partida. agora em milissegundos.
// Devolve o estado com a partida contada e { exibir, motivo }.
export function aoTerminarPartida(estado, { config, agora, semAnuncios }) {
  const novo = { ...estado, partidasTerminadas: estado.partidasTerminadas + 1, partidasDesdeUltimo: estado.partidasDesdeUltimo + 1 };
  const decisao = (exibir, motivo) => ({ estado: novo, exibir, motivo });
  if (semAnuncios) return decisao(false, "anúncios removidos por compra");
  if (novo.partidasTerminadas <= config.carencia_partidas) return decisao(false, "carência inicial");
  if (novo.partidasDesdeUltimo < config.partidas_entre_anuncios) return decisao(false, "poucas partidas desde o último");
  if (novo.exibidosNaSessao >= config.max_por_sessao) return decisao(false, "teto da sessão");
  if (novo.ultimoEm !== null && agora - novo.ultimoEm < config.intervalo_s * 1000) return decisao(false, "intervalo mínimo");
  return decisao(true, "elegível");
}

// Só conta como exibido o anúncio que de fato apareceu (SDK com anúncio disponível).
export function registrarExibicao(estado, agora) {
  return { ...estado, partidasDesdeUltimo: 0, exibidosNaSessao: estado.exibidosNaSessao + 1, ultimoEm: agora };
}
