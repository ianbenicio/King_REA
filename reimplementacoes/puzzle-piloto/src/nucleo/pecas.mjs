// Conjunto de peças do jogo (ESPECIFICACAO.md, seção 1). Peças fixas, sem rotação.
// Células como [linha, coluna] relativas ao canto superior esquerdo.

const definir = (id, nome, pesoBase, celulas) => {
  const tamanho = celulas.length <= 3 ? "pequena" : celulas.length === 4 ? "media" : "grande";
  return Object.freeze({ id, nome, pesoBase, tamanho, celulas: Object.freeze(celulas.map((c) => Object.freeze(c))) });
};

export const PECAS = Object.freeze([
  definir("P01", "ponto", 4, [[0, 0]]),
  definir("P02", "dupla deitada", 6, [[0, 0], [0, 1]]),
  definir("P03", "dupla em pé", 6, [[0, 0], [1, 0]]),
  definir("P04", "trio deitado", 6, [[0, 0], [0, 1], [0, 2]]),
  definir("P05", "trio em pé", 6, [[0, 0], [1, 0], [2, 0]]),
  definir("P06", "canto de 3 (a)", 5, [[0, 0], [1, 0], [1, 1]]),
  definir("P07", "canto de 3 (b)", 5, [[0, 1], [1, 0], [1, 1]]),
  definir("P08", "canto de 3 (c)", 5, [[0, 0], [0, 1], [1, 0]]),
  definir("P09", "canto de 3 (d)", 5, [[0, 0], [0, 1], [1, 1]]),
  definir("P10", "quadrado 2x2", 6, [[0, 0], [0, 1], [1, 0], [1, 1]]),
  definir("P11", "quatro deitado", 4, [[0, 0], [0, 1], [0, 2], [0, 3]]),
  definir("P12", "quatro em pé", 4, [[0, 0], [1, 0], [2, 0], [3, 0]]),
  definir("P13", "tê", 4, [[0, 0], [0, 1], [0, 2], [1, 1]]),
  definir("P14", "esse", 3, [[0, 1], [0, 2], [1, 0], [1, 1]]),
  definir("P15", "zê", 3, [[0, 0], [0, 1], [1, 1], [1, 2]]),
  definir("P16", "cinco deitado", 2, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]),
  definir("P17", "cinco em pé", 2, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]),
  definir("P18", "quadrado 3x3", 2, [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]),
  definir("P19", "cantoneira 3x3", 2, [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]),
]);

const PORID = new Map(PECAS.map((p) => [p.id, p]));

export function peca(id) {
  const encontrada = PORID.get(id);
  if (!encontrada) throw new RangeError(`peça desconhecida: ${id}`);
  return encontrada;
}
