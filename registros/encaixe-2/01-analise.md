---
alvo: encaixe-2
status: em_andamento
inicio: 2026-10-24
fim:
---

# Análise — Encaixe 8×8 (encaixe-2)

<!-- status: em_andamento | concluida. Ao marcar concluida, perguntar ao responsável se pode executar o protocolo de benchmark. -->

## Perguntas da análise

Copiadas do objetivo em `00-seguranca.md`. Detalhe em `05-monetizacao.md`.

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Qual é o modelo de receita do build? | Híbrido simulado: intersticial entre partidas, rewarded opcional (trocar peças, continuar, ganhar vida) e compra única de remover anúncios. Sem banner, moeda virtual nem caixa paga | E1, E2, E3 |
| 2 | Que SDK de anúncio ou compra o build usa? | Só um SDK simulado do próprio build, sem rede; nenhum SDK de terceiros; nenhuma requisição além de `127.0.0.1` | E1, E2, E3 |
| 3 | Que parâmetros controlam anúncios, ofertas e compras, e com que valores? | Carência 2 partidas, ≥ 2 partidas entre intersticiais, 60 s desde qualquer anúncio, teto 5/sessão, fechar do intersticial após 5 s, rewarded de 5 s, 1 troca e 1 continuação por partida, 5 vidas com recarga de 20 min e até 3 vidas por anúncio/dia, preço R$ 9,90 (só nos dados). Todos em padrão local; a interface não aplica configuração remota | E1, E3 |
| 4 | Como são os fluxos de anúncio e de compra? | Intersticial só após o fim da partida; rewarded só após toque dedicado, recompensa ao fim do anúncio e entrega única; compra em duas etapas, mas a confirmação nasce no mesmo ponto do "Comprar" e aceita toque na hora | E1, E2, E3 |
| 5 | O que aparece na tela nesses fluxos? | Ofertas com aceite azul e recusa cinza do mesmo tamanho; anúncio rotulado "Anúncio"; nenhum preço na loja; no rewarded, fechar imediato e duração não informada. Intersticial, continuar e sem vidas: só pelo código (em aberto em execução, ver lacunas) | E1, E2, E3 |
| 6 | Que padrões do catálogo o build usa, com os quatro estados de cada achado? | Tabela abaixo | `05-monetizacao.md` |

### Achados e estados

| Achado | ID | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|
| A-01 Confirmação de compra contornável por toque duplo | MON-0025 (C) | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-02 Fechar do intersticial oculto 5 s sem aviso | MON-0021 (C) | observada | não testado | hipótese | padrão local |
| A-03 Remover anúncios sem preço na tela | MON-0003 (A) | observada | reproduzido | hipótese | valor efetivo observado |
| A-04 Rewarded para trocar peças | MON-0001 (A) | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-05 Rewarded para ganhar vida | MON-0001 (A) | observada | não testado | hipótese | padrão local |
| A-06 Continuar com anúncio (recusa sem preenchimento de destaque) | MON-0009 (A, ressalva) | observada | não testado | hipótese | padrão local |
| A-07 Intersticial no fim de partida com limites | MON-0002 (A) | observada | não testado | hipótese | padrão local |
| A-08 Dificuldade por ocupação e derrotas (MON-0033 não observada) | MON-0004 (A) | observada | não testado | hipótese | padrão local |
| A-09 Vidas com recarga por tempo | MON-0011 (B) | observada | reproduzido (consumo) | hipótese | valor efetivo observado (consumo) |

## Diário

- 2026-10-24 — Início da análise de monetização (sessão própria, análise cega). HEAD `5ba3cdf7ebd72fb6d6a5ee19d8d21853a673ad03`, 10:04:42Z. Alvo ativado em `registros/ALVO_ATIVO`. Escopo (tudo), público (`children_likely: unknown`) e verificação (N3) definidos pelo pedido da sessão, sem `AskUserQuestion`.
- 2026-10-24 — Hashes dos 23 arquivos conferidos contra o `00-seguranca.md`: todos iguais.
- 2026-10-24 — N1: leitura dos módulos e `analyze_javascript_application` (E1, `ev_2a869237…`): nenhum `fetch`, WebSocket ou HTTP de saída; nenhum endereço externo. Mapeados agendador, recompensas, vidas, loja, SDK simulado, configuração com limites, gerador de peças e telas.
- 2026-10-24 — N3: o gate recusou o Chromium instalado (fora do alvo); cópia do `chromium-1208` para `saidas/encaixe-2/navegador/` (mesmo SHA-256 do `chrome.exe`). Servidor do build em `127.0.0.1:8737` só durante as capturas, depois encerrado.
- 2026-10-24 — N3, cenário da loja (E2, `ev_f5020eaf…`): 1 clique em "Comprar" → confirmação; 2 cliques → compra concluída. Nenhum preço em nenhuma etapa.
- 2026-10-24 — N3, cenário da troca (E3, `ev_0a9983be…`): fechar o rewarded cedo não entrega; assistir ~5,6 s entrega 3 peças novas e remove a oferta (1 por partida). Rótulo "Anúncio" presente. Vidas 5 → 4.
- 2026-10-24 — Limite do método: as peças ficam no canvas e o cenário só clica no centro de localizadores, então não deu para terminar partidas (intersticial, continuar, sem vidas ficam só no código). Quatro lacunas registradas no REA e conferidas com `list_unknowns`; bundle exportado para `saidas/encaixe-2/evidence.json`.

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/encaixe-2/evidence.json`
- [ ] Responsável não pediu mais investigação
