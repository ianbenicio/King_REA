// Jogador automático guloso (ESPECIFICACAO.md, seção 8) e simulação de partidas.
// Usa só o núcleo; não conhece monetização.
import { LADO, aplicarColocacao, jogadasPossiveis, jogar, novaPartida } from "../nucleo/jogo.mjs";
import { peca } from "../nucleo/pecas.mjs";

// Célula vazia sem vizinho vazio (borda conta como ocupada).
export function buracos(grade) {
  const vazio = (l, c) => l >= 0 && l < LADO && c >= 0 && c < LADO && !grade[l * LADO + c];
  let total = 0;
  for (let l = 0; l < LADO; l++)
    for (let c = 0; c < LADO; c++)
      if (!grade[l * LADO + c] && !vazio(l - 1, c) && !vazio(l + 1, c) && !vazio(l, c - 1) && !vazio(l, c + 1)) total += 1;
  return total;
}

// Maior valor: 1000 × linhas limpas + 10 × pontos ganhos − buracos. Empate: primeira jogada.
// Avalia só a colocação (sem sortear a próxima rodada), então não consome o gerador.
export function escolherJogada(estado) {
  let melhor = null;
  let valorMelhor = -Infinity;
  for (const jogada of jogadasPossiveis(estado)) {
    const id = estado.rodada[jogada.indice];
    const { grade, linhasLimpas } = aplicarColocacao(estado.grade, id, jogada.linha, jogada.coluna);
    const pontos = peca(id).celulas.length + (linhasLimpas ? 10 * linhasLimpas * linhasLimpas * (1 + Math.min(estado.combo, 4)) : 0);
    const valor = 1000 * linhasLimpas + 10 * pontos - buracos(grade);
    if (valor > valorMelhor) {
      valorMelhor = valor;
      melhor = jogada;
    }
  }
  return melhor;
}

// Joga uma partida inteira com o jogador guloso. Registra a sequência de peças sorteadas,
// os pesos de cada sorteio e as jogadas.
export function simularPartida({ semente, derrotasSeguidas = 0, maxJogadas = 5000 }) {
  let estado = novaPartida({ semente, derrotasSeguidas });
  const pecas = [...estado.rodada];
  const sorteios = [];
  const jogadas = [];
  while (!estado.fim && jogadas.length < maxJogadas) {
    const jogada = escolherJogada(estado);
    const { estado: proximo, efeito } = jogar(estado, jogada);
    jogadas.push(jogada);
    if (efeito.sorteio) {
      pecas.push(...efeito.sorteio.pecas);
      sorteios.push(efeito.sorteio.pesos);
    }
    estado = proximo;
  }
  return { estado, pecas, sorteios, jogadas };
}
