# Especificação — puzzle do piloto

Jogo próprio do piloto de monetização (`docs/plano-piloto-puzzle.md`). Gênero comum de encaixe em grade; peças, nomes, regras e números são nossos. Esta especificação descreve o **núcleo** (`src/nucleo/`), que é puro, determinístico e não conhece monetização.

## 1. Grade e peças

- Grade de 8 × 8 células, cada uma vazia ou ocupada. Linhas e colunas numeradas de 0 a 7, a partir do canto superior esquerdo.
- Peças fixas (não giram), definidas pelas células relativas ao seu canto superior esquerdo:

| ID | Nome | Células | Tamanho | Peso base |
|---|---|---|---|---|
| P01 | ponto | 1 | pequena | 4 |
| P02 | dupla deitada | 2 | pequena | 6 |
| P03 | dupla em pé | 2 | pequena | 6 |
| P04 | trio deitado | 3 | pequena | 6 |
| P05 | trio em pé | 3 | pequena | 6 |
| P06–P09 | cantos de 3 (quatro orientações) | 3 | pequena | 5 cada |
| P10 | quadrado 2 × 2 | 4 | média | 6 |
| P11 | quatro deitado | 4 | média | 4 |
| P12 | quatro em pé | 4 | média | 4 |
| P13 | tê | 4 | média | 4 |
| P14 | esse | 4 | média | 3 |
| P15 | zê | 4 | média | 3 |
| P16 | cinco deitado | 5 | grande | 2 |
| P17 | cinco em pé | 5 | grande | 2 |
| P18 | quadrado 3 × 3 | 9 | grande | 2 |
| P19 | cantoneira 3 × 3 | 5 | grande | 2 |

Tamanho: pequena ≤ 3 células, média = 4, grande ≥ 5.

## 2. Aleatoriedade

- Gerador **xoshiro128\*\*** (Blackman e Vigna), estado de 4 inteiros de 32 bits, semeado a partir de um inteiro com **splitmix32**. Implementação própria, curta, em `src/nucleo/prng.mjs`.
- O estado do gerador faz parte do estado da partida. Nada fora do núcleo consome ou altera esse estado.
- Sorteio ponderado com rejeição (sem viés de módulo): inteiro uniforme em `[0, total)`, percorrendo os pesos na ordem dos IDs.

## 3. Dificuldade por desempenho (MON-0004)

Os pesos do sorteio são `peso base × fator` (fatores em décimos, inteiros), calculados **só** a partir de:
- **ocupação** da grade no momento do sorteio (células ocupadas ÷ 64);
- **derrotas seguidas** antes desta partida (valor informado ao criar a partida e fixo durante ela).

| Condição | Peças afetadas | Fator |
|---|---|---|
| ocupação ≥ 0,7 | pequenas | 2,0 |
| 0,5 ≤ ocupação < 0,7 | pequenas | 1,5 |
| derrotas seguidas ≥ 2 | grandes | 0,5 |
| demais | todas | 1,0 |

Os fatores se multiplicam quando mais de uma condição vale. A função de pesos recebe exatamente essas duas entradas; não recebe o estado da partida inteiro nem qualquer dado externo.

## 4. Rodadas e jogadas

- Cada rodada sorteia **3 peças** (com reposição), na ordem em que serão mostradas.
- Uma jogada coloca uma das peças da rodada ainda não usadas, em qualquer posição onde todas as suas células caibam em células vazias dentro da grade.
- Depois de colocar: toda **linha e coluna completa** some ao mesmo tempo (uma célula na interseção conta para as duas).
- Quando as 3 peças da rodada foram usadas, a próxima rodada é sorteada.
- **Fim da partida:** depois de cada jogada (e do sorteio, se houver), se nenhuma peça restante couber em lugar nenhum.

## 5. Pontuação

- Colocar uma peça: **1 ponto por célula**.
- Limpar `L` linhas e colunas numa jogada: **10 × L² × (1 + min(combo, 4))** pontos.
- **Combo:** número de jogadas seguidas, imediatamente anteriores, que limparam pelo menos uma linha ou coluna. Uma jogada sem limpeza zera o combo.

## 6. Ações especiais do núcleo

São ações do jogo; quem decide quando elas podem acontecer (anúncio, limite) é a camada de monetização, que o núcleo não conhece.

- **Continuar** (usada por MON-0009): só numa partida terminada. Esvazia as **2 linhas e as 2 colunas mais ocupadas** (desempate pelo menor índice), sem pontos e sem consumir o gerador, e reavalia o fim. Conta em `continuacoes`.
- **Trocar a rodada** (usada por MON-0001): só numa partida em andamento. Substitui as peças ainda não usadas da rodada por novas, sorteadas com os pesos do momento. Consome o gerador. Conta em `trocas`.

## 7. Contrato e determinismo

- `novaPartida({ semente, derrotasSeguidas })` devolve o estado inicial; `jogadasPossiveis(estado)` devolve a lista de jogadas válidas; `jogar(estado, jogada)`, `continuar(estado)` e `trocarRodada(estado)` devolvem `{ estado, efeito }` (o efeito descreve o que aconteceu: pontos, linhas limpas, sorteio feito, fim). Funções puras: não alteram o estado recebido.
- **Mesma semente + mesmas derrotas seguidas + mesmas jogadas → mesma partida**, peça a peça e ponto a ponto.
- O estado é um objeto de dados simples (serializável em JSON).

## 8. Jogador automático

Para simulação e testes (`src/simulacao/`). Em cada jogada, escolhe a de maior valor: `1000 × linhas limpas + 10 × pontos ganhos − buracos`, onde buraco é célula vazia sem vizinho vazio (acima, abaixo, esquerda, direita; borda conta como ocupada). Empate: primeira na ordem de `jogadasPossiveis` (peça, linha, coluna). Determinístico.
