// Testes do jogador automático e do determinismo de ponta a ponta (ESPECIFICACAO.md, seções 7 e 8).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LADO } from "../src/nucleo/jogo.mjs";
import { buracos, simularPartida } from "../src/simulacao/jogador.mjs";

test("mesma semente → mesma partida, peça a peça e ponto a ponto", () => {
  for (const semente of [1, 99, 2026]) {
    const a = simularPartida({ semente });
    const b = simularPartida({ semente });
    assert.deepEqual(a, b, `semente ${semente}`);
  }
  assert.notDeepEqual(simularPartida({ semente: 1 }).pecas, simularPartida({ semente: 2 }).pecas);
});

test("derrotas seguidas reduzem o peso das peças grandes em todos os sorteios, de forma determinística", () => {
  const P16 = 15; // índice de "cinco deitado" (grande, peso base 2) na ordem das peças
  const com = simularPartida({ semente: 7, derrotasSeguidas: 2 });
  const sem = simularPartida({ semente: 7, derrotasSeguidas: 0 });
  assert.deepEqual(com, simularPartida({ semente: 7, derrotasSeguidas: 2 }));
  assert.ok(com.sorteios.length > 0 && sem.sorteios.length > 0);
  for (const p of com.sorteios) assert.equal(p[P16], 2 * 5);
  for (const p of sem.sorteios) assert.equal(p[P16], 2 * 10);
  assert.notDeepEqual(com.pecas, sem.pecas);
});

test("200 partidas terminam, pontuam e registram as peças de todos os sorteios", () => {
  for (let semente = 1; semente <= 200; semente++) {
    const r = simularPartida({ semente });
    assert.equal(r.estado.fim, true, `semente ${semente} não terminou`);
    assert.ok(r.estado.pontos > 0);
    assert.equal(r.pecas.length, 3 + 3 * r.sorteios.length);
    assert.equal(r.estado.jogadas, r.jogadas.length);
  }
});

test("buracos: célula vazia cercada (borda conta como ocupada)", () => {
  const grade = new Array(LADO * LADO).fill(1);
  grade[0] = 0; // canto cercado
  grade[3 * LADO + 3] = 0; // meio cercado
  grade[5 * LADO + 5] = 0; // dois vazios vizinhos: nenhum é buraco
  grade[5 * LADO + 6] = 0;
  assert.equal(buracos(grade), 2);
  assert.equal(buracos(new Array(LADO * LADO).fill(0)), 0);
});
