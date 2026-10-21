// Testes do gerador, do conjunto de peças e da dificuldade (ESPECIFICACAO.md, seções 1 a 3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { inteiroAte, proximo, semear } from "../src/nucleo/prng.mjs";
import { PECAS, peca } from "../src/nucleo/pecas.mjs";
import { fatores, pesos } from "../src/nucleo/dificuldade.mjs";

test("gerador: mesma semente, mesma sequência; sementes diferentes, sequências diferentes", () => {
  const sequencia = (semente, n) => {
    let s = semear(semente);
    const out = [];
    for (let i = 0; i < n; i++) {
      const [v, novo] = proximo(s);
      out.push(v);
      s = novo;
    }
    return out;
  };
  assert.deepEqual(sequencia(42, 100), sequencia(42, 100));
  assert.notDeepEqual(sequencia(42, 100), sequencia(43, 100));
  for (const v of sequencia(7, 1000)) assert.ok(Number.isInteger(v) && v >= 0 && v < 2 ** 32);
});

test("gerador: funções puras, o estado recebido não muda", () => {
  const s = semear(1);
  const copia = s.slice();
  proximo(s);
  inteiroAte(s, 10);
  assert.deepEqual(s, copia);
});

test("gerador: semente 0 e semente negativa produzem estado válido (nunca todo zero)", () => {
  for (const semente of [0, -1, 2 ** 31, 2 ** 32 - 1]) assert.ok(semear(semente).some((v) => v !== 0), String(semente));
});

test("inteiroAte: dentro do intervalo, distribuição próxima da uniforme, limite inválido recusado", () => {
  let s = semear(2026);
  const contagem = new Array(6).fill(0);
  const n = 60000;
  for (let i = 0; i < n; i++) {
    const [v, novo] = inteiroAte(s, 6);
    contagem[v]++;
    s = novo;
  }
  for (const c of contagem) assert.ok(Math.abs(c - n / 6) < (n / 6) * 0.05, `contagem ${c}`);
  for (const limite of [0, -1, 1.5, 2 ** 32 + 1]) assert.throws(() => inteiroAte(semear(1), limite), RangeError);
  assert.equal(inteiroAte(semear(1), 1)[0], 0);
});

test("peças: 19, IDs únicos, tamanhos e células conforme a especificação", () => {
  assert.equal(PECAS.length, 19);
  assert.equal(new Set(PECAS.map((p) => p.id)).size, 19);
  const porTamanho = { pequena: 0, media: 0, grande: 0 };
  for (const p of PECAS) {
    porTamanho[p.tamanho]++;
    assert.equal(Math.min(...p.celulas.map(([l]) => l)), 0, `${p.id} encostada no topo`);
    assert.equal(Math.min(...p.celulas.map(([, c]) => c)), 0, `${p.id} encostada à esquerda`);
    assert.equal(new Set(p.celulas.map(([l, c]) => `${l},${c}`)).size, p.celulas.length, `${p.id} sem célula repetida`);
  }
  assert.deepEqual(porTamanho, { pequena: 9, media: 6, grande: 4 });
  assert.equal(peca("P18").celulas.length, 9);
  assert.throws(() => peca("P99"), RangeError);
});

test("dificuldade: fatores da tabela da seção 3", () => {
  assert.deepEqual(fatores({ ocupacao: 0, derrotasSeguidas: 0 }), { pequena: 10, media: 10, grande: 10 });
  assert.equal(fatores({ ocupacao: 0.5, derrotasSeguidas: 0 }).pequena, 15);
  assert.equal(fatores({ ocupacao: 0.69, derrotasSeguidas: 0 }).pequena, 15);
  assert.equal(fatores({ ocupacao: 0.7, derrotasSeguidas: 0 }).pequena, 20);
  assert.equal(fatores({ ocupacao: 0, derrotasSeguidas: 1 }).grande, 10);
  assert.equal(fatores({ ocupacao: 0, derrotasSeguidas: 2 }).grande, 5);
  assert.deepEqual(fatores({ ocupacao: 0.8, derrotasSeguidas: 3 }), { pequena: 20, media: 10, grande: 5 });
});

test("dificuldade: pesos inteiros = peso base × fator, na ordem das peças", () => {
  const base = pesos({ ocupacao: 0, derrotasSeguidas: 0 });
  assert.deepEqual(base, PECAS.map((p) => p.pesoBase * 10));
  const cheia = pesos({ ocupacao: 0.75, derrotasSeguidas: 2 });
  PECAS.forEach((p, i) => {
    const esperado = p.pesoBase * { pequena: 20, media: 10, grande: 5 }[p.tamanho];
    assert.equal(cheia[i], esperado, p.id);
  });
  for (const entrada of [{ ocupacao: -0.1, derrotasSeguidas: 0 }, { ocupacao: 1.1, derrotasSeguidas: 0 }, { ocupacao: 0, derrotasSeguidas: -1 }, { ocupacao: 0, derrotasSeguidas: 1.5 }])
    assert.throws(() => pesos(entrada), RangeError);
});
