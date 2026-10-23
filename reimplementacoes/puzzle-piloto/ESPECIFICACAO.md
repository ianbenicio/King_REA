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

## 9. Sessão e monetização simulada

A sessão (`src/sessao/`) liga o núcleo à monetização (`src/monetizacao/`). Parâmetros e limites vêm do perfil aprovado `monetizacao.json`.

- **Semente de cada partida:** derivada só da semente da sessão e do número da partida. Nenhum estado de monetização entra.
- **Derrota:** partida que termina com menos pontos que a anterior. Derrotas seguidas zeram numa partida que não é derrota. Esse é o único dado de sessão que chega ao núcleo (seção 3).
- **Intersticial (MON-0002):** só no fim de partida, depois de 2 partidas de carência, a cada 2 partidas, com 60 s de intervalo mínimo e no máximo 5 por sessão. Só conta como exibido se o SDK tinha anúncio. O intervalo mínimo conta a partir do último anúncio de **qualquer tipo** que apareceu (intersticial ou rewarded, concluído ou não): um rewarded não é seguido de intersticial na mesma pausa. O teto e as partidas entre anúncios contam só intersticiais.
- **Trocar a rodada com anúncio (MON-0001):** escolha do jogador, uma vez por partida; a troca acontece só no callback de recompensa, uma vez, mesmo com callback duplicado. Falha do anúncio não gasta o limite. A oferta diz exatamente quantas peças serão trocadas (só as que faltam usar na rodada: 1 a 3).
- **Continuar com anúncio (MON-0009):** no fim da partida, oferta com "continuar" e "encerrar" de mesmo destaque e sem prazo, uma vez por partida. Anúncio interrompido ou indisponível encerra a partida normalmente.
- **Remover anúncios (MON-0003):** compra simulada que exige confirmação explícita e pode ser restaurada; desliga o intersticial, rewarded continua opcional.
- **Vidas (MON-0011, classe B, aprovado):** cada partida consome uma vida; máximo 5; recarga grátis de 1 a cada 20 min; até 3 vidas por anúncio por dia; sem venda de vidas; com 0 vidas o jogo informa o tempo de espera. Relógio que volta não tira vidas (o período de recarga recomeça) nem zera o limite diário (só um dia posterior zera).
- **Configuração remota:** só as chaves de ritmo (intervalo, partidas entre anúncios, teto, carência, recarga de vida). Vale apenas se for igual ou menos agressiva que o perfil; senão é rejeitada e o padrão local continua. A recarga de vida tem também um teto (20 a 40 min): deixá-la lenta sem limite empurraria o jogador para o anúncio de vida. A origem de cada valor fica registrada.
- **Consentimento:** o SDK só é inicializado depois da decisão de consentimento; sem consentimento, anúncios não personalizados.

## 10. Interface

A interface (`src/interface/`) monta cada tela como **dado puro**: dada a cena (o que a sessão e o jogador pediram), devolve a lista de elementos, sem DOM, sem relógio próprio e sem aleatoriedade. Quem desenha (HTML, canvas) só lê esse dado; tamanho, cor e tempo vêm daqui. A interface importa só de `src/sessao/` e de si mesma.

- **Tela de referência:** 360 × 640 px (retrato). Posições e tamanhos são em pixels dessa tela; o desenho escala.
- **Elemento:** papel (ação principal, ação, recusa, fechar, rótulo, informação), texto, posição e tamanho, cor do texto e do fundo, peso e tamanho da fonte, o instante (em ms desde que a tela apareceu) em que fica visível e o instante em que aceita toque (nenhum, para quem não é tocável), e a ação que o toque dispara.
- **Cenas:** jogando, oferta de troca, oferta de continuar, intersticial, rewarded, loja (produto e confirmação) e sem vidas. A oferta de continuar tem precedência: enquanto a sessão a mostra, nenhuma outra cena aparece, a não ser o rewarded que o jogador escolheu nela, que é a resposta à oferta.

Valores fixos desta seção (escolhidos na U1 da F7):

| Valor | Quanto | Por quê |
|---|---|---|
| Duração do intersticial simulado | 5 s | curto o bastante para não cansar nos testes manuais, longo o bastante para ver o rótulo e o fechar chegando |
| Fechar do intersticial | visível e tocável aos 5 s (fim do anúncio); antes disso nada na tela aceita toque | o anúncio entre partidas não é pulável, mas o fechar aparece assim que ele acaba, sem espera extra |
| Duração do rewarded simulado | 5 s | igual ao intersticial |
| Fechar do rewarded | visível e tocável desde o início | o rewarded é escolha do jogador; fechar antes do fim interrompe e não dá a recompensa |
| Janela de toque acidental | 500 ms | maior que um toque que já estava em curso quando a tela mudou (100 a 300 ms) e que o tempo de reagir a uma mudança inesperada; curta o bastante para a tela não parecer travada |

Regras:

- **Anúncio fora da jogada:** o intersticial só aparece depois do fim da partida (seção 9) e o rewarded só depois de o jogador escolher. Nenhuma tela de anúncio aparece enquanto uma jogada está em andamento.
- **Toque acidental:** nas telas que aparecem sem o jogador pedir, no fim de partida (intersticial e oferta de continuar), nenhum elemento aceita toque nos primeiros 500 ms. Um toque nessa janela não abre nada.
- **Rótulo:** toda tela de anúncio tem o rótulo "Anúncio", visível desde o início.
- **Fechar:** toda tela de anúncio tem um único fechar, com alvo de pelo menos 44 × 44 px, sem sobrepor nenhum outro elemento, e o toque nele só fecha (não abre loja, anunciante nem outro anúncio). O corpo do anúncio não é tocável.
- **Paridade da recusa:** em toda oferta (troca, continuar, vida, compra), a recusa tem a mesma área e o mesmo peso de fonte que a ação principal, aceita toque no mesmo instante (ou antes) e o contraste do texto dela sobre o fundo é de pelo menos 4,5:1 pela fórmula da WCAG (luminância relativa) e não fica abaixo do contraste da ação principal.
- **Recusa neutra:** o texto da recusa diz o que acontece ("Agora não", "Encerrar a partida", "Voltar", "Cancelar"), sem culpa, sem primeira pessoa e sem falar do que o jogador perde.
- **Sem prazo:** a oferta de continuar não tem contagem regressiva nem prazo, e nenhuma oferta mostra prazo para decidir. O tempo até a próxima vida, na tela sem vidas, é informação, não prazo.
- **Oferta de troca:** diz exatamente quantas peças serão trocadas (seção 9).
- **Compra:** em duas telas; a segunda pede a confirmação explícita. Restaurar compras fica sempre disponível na loja.
- **Sem vidas:** mostra o tempo até a próxima vida em minutos, arredondado para cima; a vida por anúncio só é oferecida se ainda couber no limite do dia, e a recusa segue as regras acima.

### 10.1 Desenho no navegador

O desenho (`interface/`) fica fora de `src/` e não decide regra: a cada mudança, monta a tela com `montarTela(cenaDaSessao(sessao, pedido))`, desenha a grade e as peças em canvas e o resto em elementos de página (botões e textos legíveis por leitor de tela), e passa todo toque, de mouse, dedo ou teclado, por `tocar(tela, { x, y, t_ms })`, com o tempo contado desde que a tela apareceu. Uma tela "aparece" quando muda a cena ou o pedido; a mesma cena atualizada (a jogada seguinte) não reinicia o tempo. Depois de cada ação, os eventos novos da sessão passam por `anuncioAposEventos` para saber se o intersticial entra.

- **Jogada:** toque numa peça para escolher, depois na casa da grade onde fica o canto superior esquerdo dela. Jogada que não cabe não muda nada.
- **Rewarded:** a tela do anúncio abre antes de a sessão agir. Ver até o fim (5 s) conclui o anúncio sozinho; tocar em "Fechar" antes disso interrompe. Só então a sessão executa a ação (troca, continuar ou vida), e o roteiro do SDK simulado devolve o que o jogador fez: `completo` ou `fechado`. Assim a recompensa continua vindo só do callback do SDK, sem mudar a sessão nem o núcleo.
- **Intersticial:** a sessão decide e registra a exibição no fim da partida (o SDK simulado é síncrono e devolve `completo`, porque esse anúncio não pode ser fechado antes do fim); a tela vem logo depois e o fechar só aparece aos 5 s.
- **Consentimento:** sem tela de consentimento no piloto; o SDK é inicializado sem consentimento (anúncios não personalizados).
- **Execução local:** servidor estático em Node, sem dependência, só em `127.0.0.1`, que entrega apenas os arquivos do piloto; nada vai para a rede.
