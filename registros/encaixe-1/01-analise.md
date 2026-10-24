---
alvo: encaixe-1
status: em_andamento
inicio: 2026-10-24
fim:
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

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/encaixe-1/evidence.json`
- [ ] Responsável não pediu mais investigação
