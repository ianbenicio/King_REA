---
alvo: blocos-a
status: concluida
inicio: 2026-10-21
fim: 2026-10-21
---

# Análise — Blocos 8×8 (blocos-a)

## Perguntas da análise

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Qual o modelo de receita (anúncios, compras, híbrido) e quais SDKs ou camadas de anúncio existem? | Híbrido: intersticial entre partidas, rewarded (trocar peças, continuar, ganhar vida) e loja em reais (remover anúncios R$ 9,90, pacote de 3 trocas R$ 4,90, tema visual R$ 3,90). Única camada de anúncio é o SDK simulado local; nenhuma requisição de rede no build | `05-monetizacao.md` seções 1 e 2; `sdk-simulado.mjs`, `loja.mjs`, `sessao.mjs`; REA `ev_132e332a…21f7` |
| 2 | Quais parâmetros controlam anúncios, recompensas, compras e vidas, e de onde vem cada valor (padrão local, remoto)? | Todos vêm de `config.json` e de constantes no código (padrão local). Há gancho de configuração remota que só aceita valores mais restritivos (partidas entre intersticiais ≥ 2, intervalo ≥ 60 s, teto ≤ 5, carência ≥ 2, recarga ≥ 20 min), mas nenhuma fonte remota no build: valor de produção desconhecido. A pressão do sorteio (×3 nas peças grandes) é fixa no código e não está declarada | `05-monetizacao.md` seção 3; `config.mjs:19-62`; `unk_26164a66…` |
| 3 | Quais padrões do catálogo aparecem, com ID, variante e os quatro estados de cada achado? | 14 achados: C — MON-0033, MON-0032, MON-0024, MON-0027; MON-0009 desqualificado; MON-0030 inconclusivo; A — MON-0001, 0002, 0003, 0004, 0006, 0036; B — MON-0011, 0012. Todos: código observada (MON-0030 inconclusiva), execução não testado, causalidade hipótese, configuração padrão local (remoto desconhecido onde há gancho). Duas propostas fora do catálogo (P-1 item pago não entregue; P-2 sinal de declaração divergente) | `05-monetizacao.md` seções 4 e 5 |
| 4 | A dificuldade ou o sorteio de peças dependem de algo além do desempenho do jogador? | Sim. Além de ocupação e derrotas seguidas (MON-0004), o sorteio recebe uma flag de pressão calculada do agendador de intersticiais e da compra de remover anúncios: quando partidas desde o último intersticial + 1 ≥ partidas entre intersticiais e o jogador não comprou, o peso das peças grandes triplica na partida inteira (fatia de grandes de 10 % para 25 % no tabuleiro vazio). Efeito real não medido | `sessao.mjs:80-81`, `dificuldade.mjs:3-10`, `jogo.mjs:73,118,166`; REA `ev_7508ed32…25fe`, `ev_1d893835…46ff`; `unk_aef9f6d6…` |
| 5 | O que fica fora do alcance da análise estática (lacunas)? | Efeito e causalidade da pressão; valores remotos; interface (botões, rótulos, oferta, confirmação); o que um SDK real coletaria sem consentimento; entrega do pacote de trocas e do bônus diário; uso de símbolos exportados e não importados; situação legal. Seis lacunas registradas no REA | `05-monetizacao.md` seção 8; `list_unknowns` (6 abertas) |

## Diário

- 2026-10-21 — Protocolo de segurança aprovado (N0, N1). Análise ainda não iniciada.
- 2026-10-21 — Carregada a skill `protocolo-monetizacao`; lidos catálogo v3, pesquisa de base e modelos. Escopo: monetização completa; verificação em execução: nenhuma (só N0/N1 aprovados); público e `children_likely` decididos a partir do build (análise cega).
- 2026-10-21 — Leitura integral dos 16 arquivos do build com Read; hashes por arquivo conferidos com o `00-seguranca.md`. Nada foi executado.
- 2026-10-21 — REA `analyze_javascript_application` (N1) no diretório: 16 arquivos, 14 JS analisados, 0 falhas, 0 requisições de rede, 0 IPC. Evidência `ev_132e332a…21f7` (vista resumida `ev_d1359ae4…4b62`).
- 2026-10-21 — REA `trace_javascript_semantics`: leitura de `partidasDesdeUltimo` em `sessao.mjs:80` (`ev_7508ed32…25fe`) e de `pressao` nos sorteios de `jogo.mjs:118` e `:166` (`ev_1d893835…46ff`). Rastreamento parcial (receptores ambíguos); a ligação completa veio da leitura do código.
- 2026-10-21 — Classificação pelo catálogo: 14 achados e 2 propostas; escrito `05-monetizacao.md`.
- 2026-10-21 — Seis lacunas registradas com `record_unknown` e conferidas com `list_unknowns`; bundle exportado para `saidas/blocos-a/evidence.json` (10 registros, 6 lacunas).

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] `05-monetizacao.md` escrito a partir do modelo
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/blocos-a/evidence.json`
- [x] Responsável não pediu mais investigação

## Comparação com o gabarito (F6, feita depois da análise)

Feita na sessão principal, depois das duas análises cegas prontas. Gabarito: `pilotos/puzzle-plantado/GABARITO.md`. Este alvo é o build **plantado**.

| Item | Esperado | Encontrado | Resultado |
|---|---|---|---|
| M1 dificuldade ligada a anúncio | MON-0033 | A-01 MON-0033 | certo, estados certos |
| M2 urgência falsa | MON-0024 | A-03 MON-0024 | certo |
| M3 recusa com culpa | MON-0027 | A-04 MON-0027 (e MON-0009 desqualificado) | certo |
| M4 SDK ignora consentimento | MON-0032 | A-02 MON-0032 | certo |
| M5 sequência de dias | MON-0012 (B) | A-14 MON-0012 | certo |
| M6 cosmético de preço fixo | MON-0036 (A) | A-12 MON-0036 | certo |
| Produto: MON-0001, 0002, 0003, 0004, 0009, 0011 | presentes | A-06, A-08, A-09, A-10, A-05, A-13 | certos |
| I1 constante de 5 s | não é intervalo ativo | código morto, intervalo efetivo 60 s | isca evitada |
| I2 `contagemRegressiva` | não é temporizador | só como limitação condicional | isca evitada |
| "pacote_inicial" sem ID | proposta aceita | P-1 "item pago não entregue" | aceito |

**Estados:** todos certos (execução "não testado", causalidade "hipótese", configuração "padrão local" e "remoto desconhecido" onde o código aceita remoto).

**Além do gabarito:**
- MON-0006 (loja transparente): verdadeiro positivo; o gabarito deixou de listar.
- MON-0030 inconclusivo: o texto do produto promete "3 peças novas" e a troca repõe só as não usadas. Achado real no produto.
- P-2 (declaração divergente do código como sinal de auditoria): sugestão útil para o catálogo.

**Placar:** 6/6 plantados, 6/6 do produto, 0 iscas caídas, 0 falsos positivos.
