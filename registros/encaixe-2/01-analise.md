---
alvo: encaixe-2
status: concluida
inicio: 2026-10-24
fim: 2026-10-24
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

## Comparação com o gabarito (U5, 2026-10-24)

Feita pela U5 da story PF7 (@qa), depois dos dois `05-monetizacao.md` prontos, contra `pilotos/puzzle-plantado/GABARITO.md` (seção F7). Este alvo é o **limpo**: pelo gabarito, qualquer achado de classe C aqui é falso positivo. A análise cega não leu o gabarito, os caminhos proibidos nem a nota do outro alvo (varredura do AC-U5.2 no handoff da U5). O handoff da U3 (`docs/handoffs/2026-10-23-piloto-f7-u3.md`, §6) dizia qual build era o plantado; a U5 neutralizou a frase. A sessão cega não leu esse arquivo: o `deny` de leitura estava ativo e a varredura não achou acesso a `docs/handoffs/`.

| Item do gabarito | ID esperado | Achado | Resultado | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|---|
| Produto: troca e vida com anúncio | MON-0001 | A-04, A-05 | ID certo | certo | certo (troca reproduzida; vida não testada) | divergente: "demonstrada" em A-04 (nota 1) | aceito (valor observado) |
| Produto: intersticial no fim de partida | MON-0002 | A-07 | ID certo | certo | certo (não testado) | certo | certo |
| Produto: remover anúncios | MON-0003 | A-03 | ID certo, com a falta de preço na tela registrada (nota 3) | certo | certo (reproduzido) | certo | aceito (valor observado) |
| Produto: dificuldade por desempenho | MON-0004 | A-08 | ID certo; MON-0033 não observada | certo | certo | certo | certo |
| Produto: loja | MON-0006 | — | não registrado como ID; a falta de preço aparece em A-03 | — | — | — | — |
| Produto: continuar | MON-0009 | A-06 | ID certo, "A com ressalva" (recusa sem preenchimento de destaque) — enquadramento legítimo, ambiguidade do catálogo (nota 4) | certo | certo (não testado) | certo | certo |
| Produto: vidas | MON-0011 | A-09 | ID certo | certo | certo (consumo reproduzido) | certo | certo |
| Fechar do intersticial só aos 5 s | nenhum (o gabarito prevê este erro) | A-02 MON-0021 (C) | **falso positivo** pelo gabarito; causa: texto literal do catálogo (nota 2) | — | não testado | hipótese | — |
| Fora do gabarito: confirmação de compra contornável por toque duplo | — | A-01 MON-0025 (C) | **mecanismo real do produto**, não falso positivo da análise; lacuna do gabarito (nota 5) | certo (observada) | certo (reproduzido) | certo ("demonstrada": 1 × 2 cliques) | certo |
| MON-0022, 0024, 0027, 0030, 0031, 0032, 0033 | ausentes no limpo | "verificados e não observados" | certo | — | — | — | — |

**Contagem:** produto 6/7 com ID (MON-0006 só como falta dentro de MON-0003); falsos positivos de classe C: 1 (MON-0021, de classificação); achado real fora do gabarito: 1 (MON-0025); falso negativo: 0. Estados: nenhum erro; 1 divergência defensável (nota 1).

**Só a execução fechou** (linha à parte do AC-U5.1):
- MON-0025: a leitura mostrou o mesmo bloco de oferta sem janela de toque; só o cenário de 1 × 2 cliques provou que dois toques compram.
- MON-0001: fechar cedo não entrega e não consome a troca; assistir até o fim entrega e tira a oferta.
- Preço ausente em todas as etapas da loja, inclusive na confirmação.

**Notas:**
1. "Demonstrada" em A-04 tem intervenção controlada descrita (mesma semente; muda só o tempo de exibição antes de fechar). É o que o catálogo pede. O gabarito, que aceita "demonstrada" só no V1 do outro alvo, ficou estreito demais.
2. O catálogo descreve MON-0021 como fechar "com atraso não informado". O intersticial do produto esconde o fechar por 5 s sem texto nem contagem; a especificação trata isso como o fim do anúncio, e o gabarito como falso positivo. A análise aplicou o texto literal e marcou o achado como "a forma mais branda do padrão". O erro é de classificação e tem origem na ambiguidade do catálogo e na falta de aviso de duração no produto.
3. O produto não mostra o preço: R$ 9,90 está em `loja.mjs`, mas nenhum texto da cena `loja` o usa.
4. A recusa tem a mesma área, peso e contraste que o aceite (AC-U1.3), mas fundo cinza contra o azul preenchido do aceite. A regra 2 do MON-0009 fala em "mesmo tamanho e destaque" e não define destaque.
5. Conferido no código-fonte do produto (`src/interface/tela.mjs`, cena `loja`): a etapa `confirmacao` usa o mesmo bloco `oferta()` da etapa `produto`, sem `desde_ms`; "Confirmar compra" fica em (16, 440, 328 × 48), o mesmo retângulo de "Comprar", e aceita toque em 0 ms. O controle (`interface/controle.mjs`) troca a etapa no primeiro toque, e o segundo cai no confirmar. A janela de 500 ms da especificação (§10) vale só para intersticial e oferta de continuar. É um defeito do produto limpo, não um plantio nem um erro do analista. O enquadramento em MON-0025 é defensável: a confirmação existe, mas um único gesto a atravessa. A proposta da seção 5 do `05-monetizacao.md` (entrada própria) vai para o responsável. A loja de uma plataforma real teria confirmação própria.

## Lições (U5)

- A análise do limpo achou um defeito real de classe C que ninguém plantou. A análise do plantado, que testou só um toque por tela, não achou. Testar o mesmo gesto repetido (1 × 2 toques) em telas de confirmação é barato e deve entrar no roteiro do protocolo.
- O falso positivo veio do texto do catálogo, não de leitura errada do código: padrões cujo critério depende de "informado", "destaque" ou "mesmo" precisam de definição operacional.
- Sem caminho no DOM até o fim de partida, o intersticial, o continuar e a tela sem vidas do limpo ficaram sem execução. No plantado, o intersticial só foi alcançado pelo botão plantado (V1): a comparação de execução entre os dois alvos ficou assimétrica.
- O analista sabia, pelo `CLAUDE.md` do projeto, que existe uma variante plantada com classe C, mas não sabia qual alvo era. É um viés possível a favor de achar C no limpo, e precisa ser declarado nos limites.

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/encaixe-2/evidence.json`
- [x] Responsável não pediu mais investigação ("Aceito as duas análises (não peço mais investigação).", 2026-10-24, registrado pela U5)
