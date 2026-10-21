// MON-0011 (classe B) — Vidas com recarga por tempo. Limites do perfil aprovado: recarga grátis
// sempre ativa, no máximo LIMITES.vidaPorAnuncioPorDia vidas por anúncio por dia, nenhuma venda
// de vidas. Funções puras; agora em milissegundos; o dia é o dia UTC.
import { LIMITES } from "./config.mjs";

const DIA_MS = 24 * 60 * 60 * 1000;
const diaDe = (agora) => Math.floor(agora / DIA_MS);

export function vidasIniciais(agora) {
  return { vidas: LIMITES.vidasMax, recargaDesde: agora, porAnuncioHoje: 0, dia: diaDe(agora) };
}

// Aplica a recarga e a virada do dia até "agora". Relógio que volta nunca tira vidas (o período
// de recarga recomeça) nem zera o limite diário (só um dia novo zera).
export function atualizar(estado, agora, config) {
  const periodo = config.recarga_vida_min * 60 * 1000;
  let { vidas, recargaDesde, porAnuncioHoje, dia } = estado;
  if (diaDe(agora) > dia) {
    dia = diaDe(agora);
    porAnuncioHoje = 0;
  }
  if (vidas >= LIMITES.vidasMax || agora < recargaDesde) recargaDesde = agora;
  else {
    const ganhas = Math.floor((agora - recargaDesde) / periodo);
    vidas = Math.min(LIMITES.vidasMax, vidas + ganhas);
    recargaDesde = vidas >= LIMITES.vidasMax ? agora : recargaDesde + ganhas * periodo;
  }
  return { vidas, recargaDesde, porAnuncioHoje, dia };
}

// Milissegundos até a próxima vida (0 se cheio). É o que o jogo mostra com 0 vidas.
export function tempoAteProxima(estado, agora, config) {
  const atual = atualizar(estado, agora, config);
  if (atual.vidas >= LIMITES.vidasMax) return 0;
  return atual.recargaDesde + config.recarga_vida_min * 60 * 1000 - agora;
}

export function consumirVida(estado, agora, config) {
  const atual = atualizar(estado, agora, config);
  if (atual.vidas <= 0) return { estado: atual, ok: false };
  const recargaDesde = atual.vidas >= LIMITES.vidasMax ? agora : atual.recargaDesde;
  return { estado: { ...atual, vidas: atual.vidas - 1, recargaDesde }, ok: true };
}

export function podeGanharPorAnuncio(estado, agora, config) {
  const atual = atualizar(estado, agora, config);
  return atual.vidas < LIMITES.vidasMax && atual.porAnuncioHoje < LIMITES.vidaPorAnuncioPorDia;
}

export function ganharPorAnuncio(estado, agora, config) {
  if (!podeGanharPorAnuncio(estado, agora, config)) return estado;
  const atual = atualizar(estado, agora, config);
  return { ...atual, vidas: atual.vidas + 1, porAnuncioHoje: atual.porAnuncioHoje + 1 };
}
