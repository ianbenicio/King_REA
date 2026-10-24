---
alvo: encaixe-1
status: concluida
inicio: 2026-10-24
fim: 2026-10-24
---

# Análise — Encaixe 8×8 (encaixe-1)

<!-- status: em_andamento | concluida. Ao marcar concluida, perguntar ao responsável se pode executar o protocolo de benchmark. -->

Detalhe dos achados, parâmetros e conformidade: `05-monetizacao.md`.

## Perguntas da análise

Copiadas do objetivo em `00-seguranca.md` (mapear a monetização só a partir do build).

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Qual o modelo de receita? | Híbrido simulado: intersticial, rewarded (troca, continuar, vida), banner e compra de remover anúncios (R$ 9,90); pacote consumível e tema visual só no código | `ev_ac561df5…`; capturas A, B, C |
| 2 | Que SDK e que rede? | Só um SDK simulado local; nenhuma requisição externa no código nem na execução (38 requisições por cenário, todas a 127.0.0.1) | `ev_ac561df5…`; `ev_a7b97ff4…`, `ev_00ddb138…`, `ev_3de38e1b…` |
| 3 | Que parâmetros e de onde vêm? | `config.json` local; configuração remota só aceita valores mais restritivos e não é usada pela interface | `05-monetizacao.md`, seção 3 |
| 4 | Como funcionam os fluxos de anúncio e compra? | Intersticial do agendador no fim de partida com limites; "Bônus grátis" abre intersticial sem limite; rewarded com entrega única; compra com confirmação e restauração | A-02, A-08, A-09, A-10, A-11 |
| 5 | O que aparece na tela? | Fechar do intersticial oculto 5 s e depois "×" com contraste 1,20:1; banner rotulado no rodapé; loja sem preço | A-03, A-12, A-16 |
| 6 | Que padrões do catálogo, com os quatro estados? | Tabela abaixo | `05-monetizacao.md`, seção 4 |

### Achados e estados

| Achado | ID | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|
| A-01 gerador mais difícil antes do intersticial | MON-0033 (C) | observada | não testado | hipótese | padrão local |
| A-02 "Bônus grátis" abre anúncio | MON-0022 (C) | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-03 fechar oculto 5 s e quase invisível | MON-0021 (C) | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-04 recusa com culpa no continuar | MON-0027 (C) | observada | não testado | hipótese | padrão local |
| A-05 continuar falha a regra 2 | MON-0009 | observada | não testado | hipótese | padrão local |
| A-06 oferta relâmpago com prazo relativo (dormente) | MON-0024 (C) | observada | não testado | hipótese | padrão local |
| A-07 personalização sem consentimento | MON-0032 (C) | observada | não testado | hipótese | padrão local |
| A-08 intersticial com limites | MON-0002 (A) | observada | não testado | hipótese | padrão local |
| A-09 rewarded opcional | MON-0001 (A) | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-10 remover anúncios com escopo parcial | MON-0003 (A) | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-11 compra sem confirmação | MON-0025 (C) | não observada | não reproduzido | hipótese | padrão local |
| A-12 banner no rodapé | MON-0008 (A) | observada | reproduzido | hipótese | padrão local |
| A-13 vidas com recarga | MON-0011 (B) | observada | reproduzido | hipótese | padrão local |
| A-14 sequência diária sem efeito | MON-0012 (B) | inconclusiva | não testado | hipótese | padrão local |
| A-15 dificuldade por desempenho | MON-0004 (A) | observada | não testado | hipótese | padrão local |
| A-16 tema visual / loja sem preço | MON-0036 / MON-0006 | observada | reproduzido | hipótese | padrão local |

## Diário

- 2026-10-24 — Conjunto conferido: SHA-256 `b3af6d82…3cff5d`, igual ao do `00-seguranca.md`. Alvo ativado em `registros/ALVO_ATIVO`.
- 2026-10-24 — Leitura dos 24 arquivos do build (N1) e `analyze_javascript_application` (N1, `ev_ac561df5…`): 20 módulos, nenhuma extração de requisição de rede. Achados A-01 a A-16 no código.
- 2026-10-24 — N3: servidor do build em 127.0.0.1:8737 só durante as capturas, derrubado em seguida. `capture_browser_scenario` pelo MCP: o gate recusou o Chromium fora do alvo; com uma cópia do Chromium fixado (chromium-1208, mesmo SHA-256 do `chrome.exe`) em `saidas/encaixe-1/navegador/`, o provedor do MCP falhou duas vezes ("Browser scenario provider is closing"). As capturas foram feitas pela CLI do REA (`npx rea capture-browser-scenario`, mesmo esquema, sob o `cli-gate`): mínima `ev_ad376d5a…`, A `ev_a7b97ff4…`, B `ev_00ddb138…`, C `ev_3de38e1b…`.
- 2026-10-24 — Lacunas registradas (`unk_2052376f…`, `unk_7c76c02e…`, `unk_9b60d0ab…`), conferidas com `list_unknowns`; bundle exportado.

## Comparação com o gabarito (U5, 2026-10-24)

Feita pela U5 da story PF7 (@qa), depois dos dois `05-monetizacao.md` prontos, contra `pilotos/puzzle-plantado/GABARITO.md` (seção F7). Este alvo é o **plantado**. A análise cega não leu o gabarito nem os caminhos proibidos (varredura do AC-U5.2 no handoff da U5). O handoff da U3 (`docs/handoffs/2026-10-23-piloto-f7-u3.md`, §6) dizia qual build era o plantado; a U5 neutralizou a frase. A sessão cega não leu esse arquivo: o `deny` de leitura estava ativo e a varredura não achou acesso a `docs/handoffs/`.

| Item do gabarito | ID esperado | Achado | Resultado | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|---|
| Produto: troca, continuar, vida com anúncio | MON-0001 | A-09 | ID certo | certo | certo (reproduzido) | divergente: "demonstrada" (ver nota 1) | aceito (valor observado) |
| Produto: intersticial no fim de partida | MON-0002 | A-08 | ID certo | certo | certo (não testado) | certo | certo |
| Produto: remover anúncios | MON-0003 | A-10 | ID certo, escopo parcial bem visto (banner e V1 continuam após a compra) | certo | certo (reproduzido) | divergente: "demonstrada" (nota 1) | certo |
| Produto: dificuldade por desempenho | MON-0004 | A-15 | ID certo | certo | certo | certo | certo |
| Produto: loja | MON-0006 | A-16 | registrado como **falha** (preço não aparece na tela): correto, lacuna do gabarito (nota 3) | certo | certo (reproduzido) | certo | certo |
| Produto: continuar | MON-0009 | A-05 | ID certo; regra 2 falha por M3 | certo | certo (não testado) | certo | certo |
| Produto: vidas | MON-0011 | A-13 | ID certo | certo | certo (consumo reproduzido) | certo | certo |
| M1 dificuldade lê o intersticial | MON-0033 | A-01 | ID certo | certo | certo (não testado) | certo | certo |
| M2 oferta relâmpago | MON-0024 | A-06 | ID certo (dormente) | certo | certo | certo | certo |
| M3 recusa com culpa | MON-0027 | A-04 | ID certo | certo | aceito: não testado (a tela não foi alcançada, nota 4) | certo | certo |
| M4 SDK sempre personalizado | MON-0032 | A-07 | ID certo | certo | certo | certo | certo |
| M5 sequência de dias | MON-0012 | A-14 | ID certo | divergente: "inconclusiva" (nota 2) | certo | certo | certo |
| M6 tema de preço fixo | MON-0036 | A-16 | ID certo | certo | certo | certo | certo |
| V1 "Bônus grátis" abre anúncio | MON-0022 | A-02 | ID certo; fora do agendador também visto | certo | certo (reproduzido) | certo ("demonstrada", aceita em V1) | certo |
| V2 fechar quase invisível | MON-0021 | A-03 | ID certo, contraste 1,20:1 calculado | certo | certo (reproduzido) | **errado**: "demonstrada" | divergente: "valor efetivo observado" (esperado padrão local) |
| V3 banner em faixa própria | MON-0008 | A-12 | ID certo | certo | certo (reproduzido) | certo | certo |
| I1 constante de 5 s sem uso | isca | parâmetros, "código dormente" | evitada | — | — | — | — |
| I2 `contagemRegressiva` sem uso | isca | A-05 | evitada | — | — | — | — |
| I3 "Fim do anúncio em N s" no rewarded | isca | A-03 (só como comparação) | evitada | — | — | — | — |
| I4 classe `fechar-discreto` sem uso | isca | A-03 | evitada (pela leitura) | — | — | — | — |
| Fora do gabarito: confirmação de compra contornável por toque duplo | MON-0025 | A-11 | **não encontrado** (marcado "não observada"); mecanismo real do produto, achado no encaixe-2 (nota 5) | errado | "não reproduzido" no roteiro de 1 toque | — | — |

**Contagem:** plantados 9/9 com ID certo (M1–M6, V1–V3); produto 7/7; iscas 4/4 evitadas; falsos positivos de classe C: 0; falso negativo: 1 (MON-0025, mecanismo real fora do gabarito). Estados: 1 erro (causalidade de V2) e 4 divergências defensáveis (notas 1 e 2; configuração de V2).

**Só a execução fechou** (linha à parte do AC-U5.1):
- V1: o botão é indistinguível dos do jogo, e o anúncio abre **depois da compra** de remover anúncios (captura B). A leitura sozinha não mostraria o segundo ponto sem simular a sessão.
- V2: o "×" quase invisível na tela, aos 5 s.
- MON-0003 com escopo parcial: banner e anúncio do bônus continuam depois da compra (capturas B e C).
- MON-0001: fechar cedo não entrega e não consome a troca (captura C).
- I4 foi fechada pela leitura (nenhum elemento usa a classe), não pela execução; M3 não foi reproduzido.

**Notas:**
1. O gabarito aceita "demonstrada" só em V1. Em A-09 e A-10 a análise descreve uma intervenção controlada sobre a variável (mesma semente; muda só assistir × fechar, ou só a compra), que é o que o catálogo pede para "demonstrada". A regra do gabarito ficou estreita demais; não conta como erro do analista. Em V2 (A-03) a "intervenção" foi só esperar 1 s e 5,5 s, o que mede quando o fechar aparece, mas não demonstra que o fechar escondido causa mais exposição: erro.
2. O plantio de M5 calcula o bônus (`bonusTrocas`) e só o expõe num getter; nada o entrega. "Inconclusiva (mecanismo presente, sem efeito)" é mais preciso que o texto do gabarito ("dão até 3 trocas de bônus").
3. O produto limpo não mostra o preço (R$ 9,90 está em `loja.mjs`, mas nenhum texto da cena `loja` o usa). As duas análises acharam isso.
4. Lacuna do N3: o cenário do REA só clica no centro de localizadores do DOM; grade e peças estão no canvas; nenhuma partida chegou ao fim. Neste alvo o intersticial só foi alcançado pelo caminho plantado (V1). Ver o handoff da U5.
5. Na cena `loja`, "Confirmar compra" é montado no mesmo ponto e tamanho de "Comprar" e aceita toque desde 0 ms (`src/interface/tela.mjs`, etapa `confirmacao`). Este alvo testou só toques simples.

## Lições (U5)

- O protocolo achou todos os plantados visuais com o ID certo e preencheu o estado "execução" onde a tela era alcançável por botões. A lacuna da F6 ("não testado" em tudo) fechou para V1, V2 e V3.
- O que não tem botão no DOM (jogar até o fim de partida) ficou sem execução: continuar (M3), intersticial do agendador, sem vidas e a causalidade de MON-0033. O alcance do roteiro N3 precisa entrar no plano de níveis do `00-seguranca.md`.
- "Demonstrada" exige descrever a intervenção sobre a variável. Medir quando algo aparece não é intervenção.
- Um roteiro de execução que só faz o caminho feliz (um toque por tela) não acha defeito de toque duplo. A outra análise achou porque testou 1 × 2 cliques.
- O analista sabia, pelo `CLAUDE.md` do projeto, que existe uma variante plantada com classe C. Não sabia qual alvo era. Isso é um viés possível a favor de achar C, e precisa ser declarado nos limites.

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/encaixe-1/evidence.json`
- [x] Responsável não pediu mais investigação ("Aceito as duas análises (não peço mais investigação).", 2026-10-24, registrado pela U5)
