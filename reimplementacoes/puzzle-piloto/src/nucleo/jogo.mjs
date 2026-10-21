// Regras do jogo (ESPECIFICACAO.md, seções 4 a 7). Núcleo puro e determinístico: não importa
// nada fora de src/nucleo/ e não conhece monetização. Ações devolvem { estado, efeito } e
// nunca alteram o estado recebido.
import { PECAS, peca } from "./pecas.mjs";
import { pesos } from "./dificuldade.mjs";
import { inteiroAte, semear } from "./prng.mjs";

export const LADO = 8;
const CELULAS = LADO * LADO;
const PECAS_POR_RODADA = 3;
const idx = (linha, coluna) => linha * LADO + coluna;

export const ocupacao = (grade) => grade.reduce((soma, v) => soma + v, 0) / CELULAS;

export function cabe(grade, pecaId, linha, coluna) {
  for (const [dl, dc] of peca(pecaId).celulas) {
    const l = linha + dl;
    const c = coluna + dc;
    if (l < 0 || l >= LADO || c < 0 || c >= LADO || grade[idx(l, c)]) return false;
  }
  return true;
}

// Coloca a peça (já conferida com cabe) e limpa linhas e colunas completas ao mesmo tempo.
export function aplicarColocacao(grade, pecaId, linha, coluna) {
  const nova = grade.slice();
  for (const [dl, dc] of peca(pecaId).celulas) nova[idx(linha + dl, coluna + dc)] = 1;
  const linhas = [];
  const colunas = [];
  for (let i = 0; i < LADO; i++) {
    let linhaCheia = true;
    let colunaCheia = true;
    for (let j = 0; j < LADO; j++) {
      if (!nova[idx(i, j)]) linhaCheia = false;
      if (!nova[idx(j, i)]) colunaCheia = false;
    }
    if (linhaCheia) linhas.push(i);
    if (colunaCheia) colunas.push(i);
  }
  for (const l of linhas) for (let c = 0; c < LADO; c++) nova[idx(l, c)] = 0;
  for (const c of colunas) for (let l = 0; l < LADO; l++) nova[idx(l, c)] = 0;
  return { grade: nova, linhasLimpas: linhas.length + colunas.length };
}

function sortear(rng, quantidade, ocupacaoAtual, derrotasSeguidas) {
  const p = pesos({ ocupacao: ocupacaoAtual, derrotasSeguidas });
  const total = p.reduce((s, v) => s + v, 0);
  const pecas = [];
  let atual = rng;
  for (let i = 0; i < quantidade; i++) {
    const [r, novo] = inteiroAte(atual, total);
    atual = novo;
    let acumulado = 0;
    for (let k = 0; k < p.length; k++) {
      acumulado += p[k];
      if (r < acumulado) {
        pecas.push(PECAS[k].id);
        break;
      }
    }
  }
  return { pecas, pesos: p, rng: atual };
}

function algumaCabe(grade, rodada) {
  for (const id of rodada) {
    if (id === null) continue;
    for (let l = 0; l < LADO; l++) for (let c = 0; c < LADO; c++) if (cabe(grade, id, l, c)) return true;
  }
  return false;
}

export function novaPartida({ semente, derrotasSeguidas = 0 } = {}) {
  if (!Number.isInteger(semente)) throw new TypeError(`semente precisa ser inteira: ${semente}`);
  if (!Number.isInteger(derrotasSeguidas) || derrotasSeguidas < 0) throw new RangeError(`derrotas seguidas inválidas: ${derrotasSeguidas}`);
  const grade = new Array(CELULAS).fill(0);
  const s = sortear(semear(semente), PECAS_POR_RODADA, 0, derrotasSeguidas);
  return {
    versao: 1,
    grade,
    rodada: s.pecas,
    numeroRodada: 1,
    jogadas: 0,
    pontos: 0,
    combo: 0,
    fim: false,
    continuacoes: 0,
    trocas: 0,
    derrotasSeguidas,
    sorteios: PECAS_POR_RODADA,
    rng: s.rng,
  };
}

// Todas as jogadas válidas, na ordem: índice da peça na rodada, linha, coluna.
export function jogadasPossiveis(estado) {
  if (estado.fim) return [];
  const jogadas = [];
  estado.rodada.forEach((id, indice) => {
    if (id === null) return;
    for (let linha = 0; linha < LADO; linha++)
      for (let coluna = 0; coluna < LADO; coluna++) if (cabe(estado.grade, id, linha, coluna)) jogadas.push({ indice, linha, coluna });
  });
  return jogadas;
}

export function jogar(estado, { indice, linha, coluna }) {
  if (estado.fim) throw new Error("partida terminada");
  const id = estado.rodada[indice];
  if (id === null || id === undefined) throw new RangeError(`não há peça na posição ${indice} da rodada`);
  if (!cabe(estado.grade, id, linha, coluna)) throw new RangeError(`${id} não cabe em (${linha}, ${coluna})`);

  const { grade, linhasLimpas } = aplicarColocacao(estado.grade, id, linha, coluna);
  const celulas = peca(id).celulas.length;
  const pontosLimpeza = linhasLimpas ? 10 * linhasLimpas * linhasLimpas * (1 + Math.min(estado.combo, 4)) : 0;

  let rodada = estado.rodada.slice();
  rodada[indice] = null;
  let { rng, numeroRodada, sorteios } = estado;
  let sorteio = null;
  if (rodada.every((p) => p === null)) {
    const s = sortear(rng, PECAS_POR_RODADA, ocupacao(grade), estado.derrotasSeguidas);
    rodada = s.pecas;
    rng = s.rng;
    numeroRodada += 1;
    sorteios += PECAS_POR_RODADA;
    sorteio = { pecas: s.pecas, pesos: s.pesos };
  }
  const fim = !algumaCabe(grade, rodada);
  return {
    estado: {
      ...estado,
      grade,
      rodada,
      numeroRodada,
      jogadas: estado.jogadas + 1,
      pontos: estado.pontos + celulas + pontosLimpeza,
      combo: linhasLimpas ? estado.combo + 1 : 0,
      fim,
      sorteios,
      rng,
    },
    efeito: { peca: id, celulas, linhasLimpas, pontosGanhos: celulas + pontosLimpeza, sorteio, fim },
  };
}

// Esvazia as 2 linhas e as 2 colunas mais ocupadas (desempate: menor índice). Sem pontos e sem
// consumir o gerador. Só numa partida terminada.
export function continuar(estado) {
  if (!estado.fim) throw new Error("continuar só vale numa partida terminada");
  const contar = (porLinha) =>
    Array.from({ length: LADO }, (_, i) => {
      let n = 0;
      for (let j = 0; j < LADO; j++) n += porLinha ? estado.grade[idx(i, j)] : estado.grade[idx(j, i)];
      return { i, n };
    })
      .sort((a, b) => b.n - a.n || a.i - b.i)
      .slice(0, 2)
      .map((x) => x.i);
  const linhas = contar(true);
  const colunas = contar(false);
  const grade = estado.grade.slice();
  for (const l of linhas) for (let c = 0; c < LADO; c++) grade[idx(l, c)] = 0;
  for (const c of colunas) for (let l = 0; l < LADO; l++) grade[idx(l, c)] = 0;
  const fim = !algumaCabe(grade, estado.rodada);
  return { estado: { ...estado, grade, fim, continuacoes: estado.continuacoes + 1 }, efeito: { linhas, colunas, fim } };
}

// Troca as peças ainda não usadas da rodada por novas, com os pesos do momento. Só em andamento.
export function trocarRodada(estado) {
  if (estado.fim) throw new Error("trocar a rodada só vale numa partida em andamento");
  const posicoes = estado.rodada.flatMap((id, i) => (id === null ? [] : [i]));
  const s = sortear(estado.rng, posicoes.length, ocupacao(estado.grade), estado.derrotasSeguidas);
  const rodada = estado.rodada.slice();
  posicoes.forEach((posicao, k) => {
    rodada[posicao] = s.pecas[k];
  });
  const fim = !algumaCabe(estado.grade, rodada);
  return {
    estado: { ...estado, rodada, rng: s.rng, fim, trocas: estado.trocas + 1, sorteios: estado.sorteios + posicoes.length },
    efeito: { sorteio: { pecas: s.pecas, pesos: s.pesos }, fim },
  };
}
