// MON-0002 — Intersticial só no fim de partida, com carência, intervalo mínimo e teto por sessão.
// O intervalo mínimo conta a partir do último anúncio de qualquer tipo (intersticial ou rewarded
// exibido): um rewarded não pode ser seguido de intersticial na mesma pausa.
// Funções puras sobre um estado pequeno; quem chama é a sessão, e só no evento de fim de partida.

export const AGENDADOR_INICIAL = Object.freeze({ partidasTerminadas: 0, partidasDesdeUltimo: 0, exibidosNaSessao: 0, ultimoEm: null, ultimoAnuncioEm: null });

// Decide se o intersticial deve aparecer neste fim de partida. agora em milissegundos.
// Devolve o estado com a partida contada e { exibir, motivo }.
export function aoTerminarPartida(estado, { config, agora, semAnuncios }) {
  const novo = { ...estado, partidasTerminadas: estado.partidasTerminadas + 1, partidasDesdeUltimo: estado.partidasDesdeUltimo + 1 };
  const decisao = (exibir, motivo) => ({ estado: novo, exibir, motivo });
  const ultimoAnuncio = [novo.ultimoEm, novo.ultimoAnuncioEm].filter((t) => t !== null && t !== undefined);
  if (semAnuncios) return decisao(false, "anúncios removidos por compra");
  if (novo.partidasTerminadas <= config.carencia_partidas) return decisao(false, "carência inicial");
  if (novo.partidasDesdeUltimo < config.partidas_entre_anuncios) return decisao(false, "poucas partidas desde o último");
  if (novo.exibidosNaSessao >= config.max_por_sessao) return decisao(false, "teto da sessão");
  if (ultimoAnuncio.length && agora - Math.max(...ultimoAnuncio) < config.intervalo_s * 1000) return decisao(false, "intervalo mínimo");
  return decisao(true, "elegível");
}

// Só conta como exibido o anúncio que de fato apareceu (SDK com anúncio disponível).
export function registrarExibicao(estado, agora) {
  return { ...estado, partidasDesdeUltimo: 0, exibidosNaSessao: estado.exibidosNaSessao + 1, ultimoEm: agora, ultimoAnuncioEm: agora };
}

// Rewarded que apareceu (concluído ou não): conta para o intervalo mínimo, não para o teto nem
// para as partidas entre intersticiais.
export function registrarAnuncio(estado, agora) {
  return { ...estado, ultimoAnuncioEm: agora };
}
