// MON-0004 — Dificuldade dinâmica para manter o fluxo (ESPECIFICACAO.md, seção 3).
// Contrato: as únicas entradas são a ocupação da grade e as derrotas seguidas. Esta função
// não recebe o estado da partida nem dado externo, e o módulo não importa nada fora do núcleo.
import { PECAS } from "./pecas.mjs";

// Fatores em décimos (10 = 1,0), para manter os pesos inteiros.
export function fatores({ ocupacao, derrotasSeguidas }) {
  let pequena = 10;
  if (ocupacao >= 0.7) pequena = 20;
  else if (ocupacao >= 0.5) pequena = 15;
  const grande = derrotasSeguidas >= 2 ? 5 : 10;
  return { pequena, media: 10, grande };
}

// Pesos inteiros na ordem de PECAS: peso base × fator do tamanho.
export function pesos({ ocupacao, derrotasSeguidas }) {
  if (!(ocupacao >= 0 && ocupacao <= 1)) throw new RangeError(`ocupação inválida: ${ocupacao}`);
  if (!Number.isInteger(derrotasSeguidas) || derrotasSeguidas < 0) throw new RangeError(`derrotas seguidas inválidas: ${derrotasSeguidas}`);
  const f = fatores({ ocupacao, derrotasSeguidas });
  return PECAS.map((p) => p.pesoBase * f[p.tamanho]);
}
