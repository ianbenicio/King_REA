// Testes das regras do núcleo (ESPECIFICACAO.md, seções 4 a 7).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LADO, continuar, jogadasPossiveis, jogar, novaPartida, trocarRodada } from "../src/nucleo/jogo.mjs";

const idx = (l, c) => l * LADO + c;
// Estado de teste: partida nova com grade e rodada definidas pelo teste.
const montar = ({ ocupadas = [], rodada = ["P01", "P01", "P01"], combo = 0, fim = false } = {}) => {
  const grade = new Array(LADO * LADO).fill(0);
  for (const [l, c] of ocupadas) grade[idx(l, c)] = 1;
  return { ...novaPartida({ semente: 1 }), grade, rodada, combo, fim };
};
const linhaToda = (l, exceto = []) =>
  Array.from({ length: LADO }, (_, c) => [l, c]).filter(([, c]) => !exceto.includes(c));
const colunaToda = (c, exceto = []) =>
  Array.from({ length: LADO }, (_, l) => [l, c]).filter(([l]) => !exceto.includes(l));

test("partida nova: grade vazia, 3 peças, nada pontuado", () => {
  const e = novaPartida({ semente: 10 });
  assert.equal(e.grade.length, 64);
  assert.ok(e.grade.every((v) => v === 0));
  assert.equal(e.rodada.length, 3);
  assert.ok(e.rodada.every((id) => /^P\d{2}$/.test(id)));
  assert.equal(e.pontos, 0);
  assert.equal(e.fim, false);
  assert.equal(e.sorteios, 3);
  assert.throws(() => novaPartida({ semente: 1.5 }), TypeError);
  assert.throws(() => novaPartida({}), TypeError);
  assert.throws(() => novaPartida({ semente: 1, derrotasSeguidas: -1 }), RangeError);
});

test("estado é dado simples: sobrevive a JSON sem perder nada", () => {
  const e = novaPartida({ semente: 3 });
  assert.deepEqual(JSON.parse(JSON.stringify(e)), e);
});

test("jogadas possíveis numa grade vazia: ponto em 64 lugares, quadrado 3×3 em 36", () => {
  const e = montar({ rodada: ["P01", "P18", null] });
  const jogadas = jogadasPossiveis(e);
  assert.equal(jogadas.filter((j) => j.indice === 0).length, 64);
  assert.equal(jogadas.filter((j) => j.indice === 1).length, 36);
  assert.equal(jogadas.filter((j) => j.indice === 2).length, 0);
});

test("jogar não altera o estado recebido", () => {
  const e = novaPartida({ semente: 5 });
  const antes = JSON.stringify(e);
  const [primeira] = jogadasPossiveis(e);
  jogar(e, primeira);
  assert.equal(JSON.stringify(e), antes);
});

test("jogada inválida é recusada", () => {
  const e = montar({ ocupadas: [[0, 0]], rodada: ["P01", null, "P16"] });
  assert.throws(() => jogar(e, { indice: 1, linha: 3, coluna: 3 }), RangeError, "peça já usada");
  assert.throws(() => jogar(e, { indice: 0, linha: 0, coluna: 0 }), RangeError, "célula ocupada");
  assert.throws(() => jogar(e, { indice: 2, linha: 0, coluna: 4 }), RangeError, "sai da grade");
  assert.throws(() => jogar(e, { indice: 0, linha: -1, coluna: 0 }), RangeError, "fora da grade");
  assert.throws(() => jogar({ ...e, fim: true }, { indice: 0, linha: 5, coluna: 5 }), Error, "partida terminada");
});

test("completar uma linha limpa e pontua 1 por célula + 10 × L² × (1 + combo)", () => {
  const e = montar({ ocupadas: linhaToda(0, [7]) });
  const { estado, efeito } = jogar(e, { indice: 0, linha: 0, coluna: 7 });
  assert.equal(efeito.linhasLimpas, 1);
  assert.equal(efeito.pontosGanhos, 1 + 10);
  assert.ok(estado.grade.slice(0, 8).every((v) => v === 0));
  assert.equal(estado.combo, 1);
});

test("linha e coluna ao mesmo tempo contam L = 2; a interseção vale para as duas", () => {
  const e = montar({ ocupadas: [...linhaToda(0, [0]), ...colunaToda(0, [0])] });
  const { estado, efeito } = jogar(e, { indice: 0, linha: 0, coluna: 0 });
  assert.equal(efeito.linhasLimpas, 2);
  assert.equal(efeito.pontosGanhos, 1 + 10 * 4);
  assert.ok(estado.grade.every((v) => v === 0));
});

test("combo multiplica limpezas seguidas, zera sem limpeza e para em 4", () => {
  const e = montar({ ocupadas: [...linhaToda(0, [7]), ...linhaToda(2, [7])] });
  const r1 = jogar(e, { indice: 0, linha: 0, coluna: 7 });
  const r2 = jogar(r1.estado, { indice: 1, linha: 2, coluna: 7 });
  assert.equal(r2.efeito.pontosGanhos, 1 + 10 * 2);
  assert.equal(r2.estado.combo, 2);
  const r3 = jogar(r2.estado, { indice: 2, linha: 5, coluna: 5 });
  assert.equal(r3.estado.combo, 0);
  const comComboAlto = montar({ ocupadas: linhaToda(0, [7]), combo: 9 });
  assert.equal(jogar(comComboAlto, { indice: 0, linha: 0, coluna: 7 }).efeito.pontosGanhos, 1 + 10 * 5);
});

test("usar as 3 peças sorteia a próxima rodada", () => {
  let e = montar();
  for (const [i, c] of [[0, 0], [1, 2], [2, 4]]) {
    const r = jogar(e, { indice: i, linha: 4, coluna: c });
    if (i < 2) assert.equal(r.efeito.sorteio, null);
    else {
      assert.equal(r.efeito.sorteio.pecas.length, 3);
      assert.equal(r.efeito.sorteio.pesos.length, 19);
    }
    e = r.estado;
  }
  assert.equal(e.numeroRodada, 2);
  assert.equal(e.sorteios, 6);
  assert.ok(e.rodada.every((id) => id !== null));
});

// Tabuleiro em xadrez: nenhuma célula vazia tem vizinha vazia, então só o ponto cabe.
const xadrez = () => {
  const ocupadas = [];
  for (let l = 0; l < LADO; l++) for (let c = 0; c < LADO; c++) if ((l + c) % 2 === 0) ocupadas.push([l, c]);
  return ocupadas;
};

test("fim: quando nenhuma peça restante cabe", () => {
  const e = montar({ ocupadas: xadrez(), rodada: ["P01", "P02", null] });
  const { estado, efeito } = jogar(e, { indice: 0, linha: 0, coluna: 1 });
  assert.equal(efeito.fim, true);
  assert.equal(estado.fim, true);
  assert.deepEqual(jogadasPossiveis(estado), []);
});

test("continuar: só com a partida terminada; esvazia 2 linhas e 2 colunas, sem pontos nem sorteio", () => {
  const e = montar({ ocupadas: xadrez(), rodada: ["P02", null, null], fim: true });
  const { estado, efeito } = continuar(e);
  assert.deepEqual(efeito.linhas, [0, 1]);
  assert.deepEqual(efeito.colunas, [0, 1]);
  for (const l of [0, 1]) for (let c = 0; c < LADO; c++) assert.equal(estado.grade[idx(l, c)], 0);
  assert.equal(estado.pontos, e.pontos);
  assert.deepEqual(estado.rng, e.rng);
  assert.equal(estado.continuacoes, 1);
  assert.equal(estado.fim, false);
  assert.throws(() => continuar(montar()), Error);
});

test("trocar a rodada: troca só as peças não usadas, consome o gerador, só em andamento", () => {
  const e = montar({ rodada: ["P01", null, "P02"] });
  const { estado, efeito } = trocarRodada(e);
  assert.equal(estado.rodada[1], null);
  assert.equal(efeito.sorteio.pecas.length, 2);
  assert.deepEqual([estado.rodada[0], estado.rodada[2]], efeito.sorteio.pecas);
  assert.notDeepEqual(estado.rng, e.rng);
  assert.equal(estado.trocas, 1);
  assert.equal(estado.sorteios, e.sorteios + 2);
  assert.throws(() => trocarRodada({ ...e, fim: true }), Error);
});
