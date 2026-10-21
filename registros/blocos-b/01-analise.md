---
alvo: blocos-b
status: concluida
inicio: 2026-10-21
fim: 2026-10-21
---

# Análise — Blocos 8×8 (blocos-b)

## Perguntas da análise

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Qual o modelo de receita (anúncios, compras, híbrido) e quais SDKs ou camadas de anúncio existem? | Híbrido simulado: intersticial no fim da partida; rewarded para trocar a rodada, continuar e ganhar vida; compra única "remover anúncios" (R$ 9,90); sem banner, consumíveis, moeda virtual ou caixas. Única camada de anúncio: `sdk-simulado.mjs` (local, sem rede); nenhum analytics nem cliente de configuração remota | `05-monetizacao.md` seções 1 e 2; REA `ev_1617fde4…` (0 requests, 0 timers, 0 processos filhos) |
| 2 | Quais parâmetros controlam anúncios, recompensas, compras e vidas, e de onde vem cada valor (padrão local, remoto)? | Padrões locais em `config.json`, lidos por `config.mjs`. Cinco chaves aceitam remoto: quatro de ritmo de anúncio (só podem afrouxar) e a recarga de vida (só pode aumentar, sem teto). Vidas máximas, limites de rewarded por partida e por dia, preço e fatores de dificuldade são só locais. Valores remotos de produção: desconhecidos | `05-monetizacao.md` seção 3; `unk_88c80126…` |
| 3 | Quais padrões do catálogo aparecem, com ID, variante e os quatro estados de cada achado? | A: MON-0002, MON-0001, MON-0009, MON-0003, MON-0006, MON-0004; B: MON-0011; C: nenhum observado; candidato inconclusivo MON-0030 (texto da troca × entrega). Todos com código observado (MON-0030 inconclusivo), execução não testado e causalidade hipótese | `05-monetizacao.md` seção 4, A-01 a A-08 |
| 4 | A dificuldade ou o sorteio de peças dependem de algo além do desempenho do jogador? | No código, não: os pesos dependem só da ocupação da grade e das derrotas seguidas (pontos abaixo da partida anterior); a semente depende da semente da sessão e do número da partida; `src/nucleo/*` não importa `src/monetizacao/*`. Há um efeito indireto via pontos (continuar ou trocar com anúncio pode evitar uma "derrota"). Causalidade não testada | `05-monetizacao.md` A-07; REA `ev_a4ad0fd5…`; `unk_769843e1…` |
| 5 | O que fica fora do alcance da análise estática (lacunas)? | Valores remotos de produção, apresentação das telas (não há UI), consentimento e coleta com SDK real, invariância em execução, texto exibido na troca, loja real | `05-monetizacao.md` seção 8; seis lacunas no REA |

## Diário

- 2026-10-21 — Protocolo de segurança aprovado (N0, N1). Análise ainda não iniciada.
- 2026-10-21 — Análise cega iniciada. Leitura de `CLAUDE.md`, skill `protocolo-monetizacao`, catálogo v3, modelos e `registros/blocos-b/`. Hashes dos 15 arquivos conferidos com o `00-seguranca.md` (conjunto `8fd7f57b…`).
- 2026-10-21 — Leitura completa dos 15 arquivos de `alvos/blocos-b/app/`, sem executar nada. Busca de imports e de chamadas de rede, timers, `process`, `Math.random` e `Date.now`, restrita ao alvo: só `process.argv` em `main.mjs`; o núcleo não importa a monetização.
- 2026-10-21 — REA `analyze_javascript_application` (N1, diretório): 15 arquivos, 13 JavaScript analisados, 0 falhas; nenhuma request, timer ou processo filho. `trace_javascript_semantics` sobre `derrotasSeguidas`: ambíguo (receptores não resolvidos), usado só como apoio.
- 2026-10-21 — Seis lacunas registradas com `record_unknown` e conferidas com `list_unknowns`; bundle exportado para `saidas/blocos-b/evidence.json` (9 registros, 6 lacunas).
- 2026-10-21 — `05-monetizacao.md` escrito. Público `geral`, `children_likely: true` (puzzle sem conteúdo adulto, sem verificação de idade, preço em reais). Três propostas fora do catálogo (P-01 a P-03).

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] `05-monetizacao.md` escrito a partir do modelo
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [x] Bundle de evidência exportado para `saidas/blocos-b/evidence.json`
- [x] Responsável não pediu mais investigação

## Comparação com o gabarito (F6, feita depois da análise)

Feita na sessão principal, depois das duas análises cegas prontas. Gabarito: `pilotos/puzzle-plantado/GABARITO.md`. Este alvo é o build **limpo** (controle de falso positivo).

| Item | Esperado | Encontrado | Resultado |
|---|---|---|---|
| Produto: MON-0001, 0002, 0003, 0004, 0009, 0011 | presentes | A-02, A-01, A-04, A-07, A-03, A-06 | certos |
| MON-0009 | cumpre as 3 regras | cumpre (regras como dados; tela fora do build) | certo |
| MON-0004 | só desempenho | só desempenho; MON-0033 verificado e não observado | certo |
| Qualquer classe C | nenhum | nenhum | **0 falsos positivos** |

**Estados:** todos certos.

**Além do gabarito (achados reais sobre o produto):**
- MON-0006 (loja transparente): verdadeiro positivo; o gabarito deixou de listar.
- MON-0030 candidato: o texto "3 peças novas no lugar das não usadas" promete mais do que a troca entrega quando só restam 1 ou 2 peças.
- P-02: a configuração remota pode deixar a recarga de vidas lenta **sem teto** (só há mínimo), o que empurra para o anúncio de vida.
- P-03: o limite de frequência conta só intersticiais; um rewarded pode ser seguido de intersticial na mesma pausa.
- P-01: o limite remoto pelo perfil local como salvaguarda documentável de MON-0002.

**Placar:** 6/6 do produto, 0 falsos positivos, 3 achados reais de produto que o gabarito e os testes não tinham.
