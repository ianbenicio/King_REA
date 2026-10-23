# Plano de execução — piloto de monetização, F7 (interface mínima)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano preliminar: a story vem
depois, pelo SDC. O plano anterior (Notepad, bloco 5) está em
docs/planos/2026-10-21-notepad-bloco-5.md.
-->

**Data:** 2026-10-23 · **Sessão:** `3ce1f2dc-3a2e-4288-add4-c2282ef351c5` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `5a7e41bc959b8d79ab7e7e93eb8e91b6d724d7fc`

## 0. Sessão concorrente

Nenhuma. `sessao.js --lista 5` e os transcripts do projeto, identificados pelo conteúdo: `3ce1f2dc` é esta sessão (começa com o handoff do Harness colado); `2ae92520`, `41a3fc38` e `97ff0c40` são sessões ligadas da medição do Harness (`l2-app-antes`, `l2-app-depois`, `rea-tarefa`), sem escrita desde 2026-10-22 22:13 (hora local); `a0ea8d85` é a sessão longa dos blocos 1–4 do Notepad (aberta no Harness, `cwd` `H:\King\Harness`), parada desde 2026-10-22 15:17; `11ac3a8a` é uma conversa de avaliação de 2026-10-22. `git status`: limpo.

## 1. Enquadramento

**Objetivo:** dar ao puzzle do piloto uma interface mínima e medir, numa análise cega com execução, se o `protocolo-monetizacao` encontra dark patterns que só aparecem na tela.

**Origem:** fase F7 de `docs/plano-piloto-puzzle.md` §8 ("só se F6 mostrar que padrões de UI precisam de piloto próprio") e melhoria nº 5 de `registros/blocos-b/02-benchmark.md`. A F6 analisou só o código (N0/N1): os estados de execução ficaram "não testado" e padrões de interface (destaque, rótulo, botão de fechar) não tinham como aparecer. Confirmado pelo responsável em 2026-10-23.

**Restrições:**
- Stack do piloto mantida: JavaScript ESM, sem dependências, `node:test` (decisão F0 de 2026-10-20).
- Produto em `reimplementacoes/puzzle-piloto/`: todo padrão declarado em `monetizacao.json` com marcador `// MON-NNNN`; classe C nunca; a checagem `verificar-perfis.mjs` e o `pre-commit` valem. Mudança de parâmetro derruba a aprovação de MON-0011 presa ao hash (precisa nova aprovação).
- Variante plantada só em `pilotos/puzzle-plantado/`; builds em `alvos/` (fora do git). O gabarito é o único lugar com a lista do que foi plantado.
- Análise cega: alvos novos (versão nova dos builds), cada um com protocolo de segurança próprio; execução no navegador (N3, `capture_browser_scenario`) só com aprovação do responsável, confirmada a cada chamada pelo gate.
- Não mudar `.claude/settings.json` (`autoCompactWindow` 300000, D37 do Harness). Commits locais; push só pelo @devops com autorização.
- Repositório público: nada de assets ou dados brutos nos registros.

**Perfil do projeto:** domínio piloto de validação de protocolo de engenharia reversa (monetização e dark patterns) · stack JavaScript ESM sem dependências, `node:test`, HTML + canvas · integrações REA (MCP, N0–N3), Semgrep fixado (Docker), navegador embutido do app · UI sim (mínima) · dados sensíveis não · fase AIOX SDC · complexidade STANDARD

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Escopo: só interface no produto, ou também variante plantada com análise cega? | sim | Completa, com análise cega (responsável, 2026-10-23) |
| Como verificar a interface sem dependências? | sim | Tela como dado puro (modelo testado em `node:test`), DOM/canvas só desenha o modelo, conferência visual no navegador embutido (responsável, 2026-10-23) |
| Quais padrões visuais plantar e quais iscas | aberta | U4, decidido só no `GABARITO.md` (escrever aqui entregaria a resposta) |
| Slugs dos alvos novos | aberta | U4; nomes neutros, como em F5 |
| Níveis da análise cega: N0, N1, N2 e N3? | aberta | protocolo de segurança dos alvos (U4), aprovação do responsável |
| Impor a cegueira por regra `deny` de leitura nas sessões de análise? | aberta | U4 (o §7 do plano do piloto deixou como limite; ver Riscos) |
| A interface entra nos builds e no Semgrep (regra nova de UI)? | aberta | U2; a regra só entra se der para escrever sem falso positivo no limpo |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| interface mínima HTML canvas puzzle sem dependências, padrões visuais de monetização (fechar, destaque da recusa, rótulo), verificação automatizada de UI e análise cega com execução no navegador | 7 | 0,506–0,517 |
| lições da análise cega do piloto: gabarito, vazamento entre builds, sessão separada, dark pattern visual que análise estática não pega, teste de UI em navegador sem dependências | 7 | 0,503–0,538 |

Segunda consulta feita porque a primeira ficou abaixo de 0,55 e só trouxe uma nota do mesmo domínio.

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `piloto-de-valida-o-de-um-protocolo-de-an-lise-de-monetiza-o` (0,538) | Piloto F1–F6: plantado 6/6 com ID e estados certos, iscas evitadas, limpo sem falso positivo; uma sessão por alvo; limite: alvo fácil e mesmo modelo planta e analisa | relatada (o resultado verificável está em `registros/blocos-a/01-analise.md` e no commit `ace9473`) | sim — mesmo projeto, mesmo produto e mesmo protocolo; conferido nos registros e no `pilotos/puzzle-plantado/README.md` | Repete o desenho da F5/F6 (builds neutros, conferência de vazamento, gabarito, uma sessão por alvo, controle limpo); acrescenta o que faltou: execução (N3) para medir o estado "execução" |

**Descartados:** `fezinha-handoff-trilha-web-fase-0-1a-consumidor`, `fezinha-contract-v0-engine-api-web-aprovado`, `fezinha-contrato-radar-time-v0-finalizado`, `fezinha-entregas-codex-em-codex-contract-v0-estado-local`, `fezinha-vis-o-geral-do-projeto`, `fezinha-stack-e-deploy` — outro domínio (web de previsão de futebol) · `despensa-rodada-de-usabilidade-perfil-do-cliente-em-camadas`, `despensa-sess-o-08-12-…`, `despensa-revis-o-cto-cmo-ux-…`, `despensa-sess-o-06-08-…` — usabilidade de app de saúde, sem relação com padrões de monetização · `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` — já coberto (o código do piloto foi mapeado antes do plano) · `plano-global-de-otimiza-o-de-tokens-e-banco-de-skills-v2` — Harness, não a tarefa.

**Achado do Engram:** a nota do piloto lista cinco "lições ligadas" (teste com resposta conhecida, uma sessão por alvo, invariância por mutações, `metavariable-regex` do Semgrep, recarga com relógio voltando), mas nenhuma existe no vault (busca por título e texto em `H:\KingVault`, sem resultado). Propor ao responsável gravar essas notas no fechamento da F7.

## 3. Plano preliminar

**Workflow AIOX:** SDC — fase nova de um plano já aprovado, sem requisito informal a destrinchar (Spec Pipeline não se aplica); a story sai do §8 do plano do piloto e deste documento.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| U0 | Fase 0 e story | Fase 0, SDC criar/validar / @sm, @po | este plano; `docs/stories/piloto-f7-interface.story.md` validada; handoff | plano aprovado; story GO no checklist do @po | ~180k |
| U1 | Modelo de tela | SDC implementar / @dev | `src/interface/` com a tela como dado (botões, tamanho, cor, contraste, rótulo, tempo até poder fechar), ligado a `sessao.mjs` sem tocar `src/nucleo/`; testes de paridade (aceitar × recusar), alvo mínimo do fechar, rótulo de anúncio, ausência de contagem regressiva; §10 na `ESPECIFICACAO.md`; `monetizacao.json` revisto | `npm test`, `check:monetizacao`, `semgrep` e `semgrep:mutacoes` verdes; mutações de tela (recusa menor, fechar escondido, sem rótulo) derrubam os testes | ~180k |
| U2 | Desenho e navegador | SDC implementar / @dev | `interface/index.html` + desenho em canvas/DOM do modelo; servidor local mínimo em Node (sem dependência) ou `file://`; regra Semgrep de UI se couber | conferência no navegador embutido: partida, intersticial, rewarded, continuar, loja; capturas citadas no handoff (não versionadas) | ~180k |
| U3 | Variante plantada e alvos | SDC implementar / @dev | plantio visual em `pilotos/puzzle-plantado/` (padrões e iscas só no `GABARITO.md`); `construir.mjs` gera os dois builds com interface, neutros, com conferência de vazamento; protocolo de segurança dos dois alvos novos | builds reproduzíveis com hashes; build limpo joga igual ao código-fonte; vazamento 0; `00-seguranca.md` dos dois aprovados | ~180k |
| U4a | Análise cega do alvo 1 | protocolo-monetizacao / sessão nova | `registros/<alvo-1>/05-monetizacao.md` e `01-analise.md` | sessão lê só a skill, o catálogo, o modelo 05 e `alvos/<alvo-1>/`; execução só como aprovado | ~180k |
| U4b | Análise cega do alvo 2 | protocolo-monetizacao / sessão nova | idem para o alvo 2 | idem | ~180k |
| U5 | Comparação e fechamento | SDC QA / @qa | tabela contra o gabarito (ID, estados, iscas, falsos positivos, padrões visuais pegos só com execução); lições; ajustes propostos ao protocolo e ao catálogo (só com aprovação); story `Done`; nota no Engram | QA gate; varredura dos transcripts de U4a/U4b sem leitura proibida | ~180k |

São seis unidades além desta, acima das 4–5 estimadas antes de detalhar. Se U1 terminar com folga, U2 entra na mesma sessão.

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\mapa-fases.md`):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| U0 Fase 0 / story | Engram (deep), AskUserQuestion, nativas | — | REA, Ghidra, browser | nada |
| U1 modelo | nativas, `npm test`, Semgrep pelo script | `/code-review` | REA, Ghidra, `impeccable` (UI mínima, não design) | nada |
| U2 desenho | nativas, navegador embutido | `impeccable` só se a tela ficar ilegível | REA, Ghidra | `/impeccable` pelo responsável, se pedir |
| U3 variante e alvos | nativas, skill `protocolo-seguranca` | — | REA (o protocolo vem antes de qualquer tool) | nada |
| U4a/U4b análise | skill `protocolo-monetizacao`, REA N0/N1 e o que o protocolo aprovar (N2 `inspect_web_page`, `capture_web_screenshot`; N3 `capture_browser_scenario`) | — | Ghidra, Engram, conectores sensíveis, navegador embutido | gate do REA; N3 pede confirmação por chamada |
| U5 QA | nativas, `/code-review`, Engram (save) | — | REA | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Modelo de tela | `npm test` (testes novos de paridade e mutações de tela); `npm run check:monetizacao` |
| Desacoplamento mantido | `npm test` (invariância), `npm run semgrep`, `semgrep:test`, `semgrep:mutacoes` |
| Interface | navegador embutido nos fluxos da U2; console sem erro |
| Builds | `node pilotos/puzzle-plantado/construir.mjs` duas vezes, mesmos hashes; vazamento 0 |
| Análise cega | tabela contra o gabarito; varredura dos transcripts (sem `pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano*`, `docs/stories/`, `docs/handoffs/` em caminho, padrão ou comando) |
| Gates | `npm test` depois de qualquer mudança em `scripts/` ou `.claude/hooks/`; `pre-commit` em todo commit, sem `--no-verify` |

**Riscos:**
- **Vazamento para a análise cega** — enquadramento (este plano, a story e os handoffs ficam em `docs/`, público e legível) — a lista do plantio só no `GABARITO.md`; as sessões de análise proibidas de ler `docs/plano*`, `docs/stories/`, `docs/handoffs/`, `pilotos/` e `reimplementacoes/puzzle-piloto/`; propor regra `deny` de leitura nessas sessões (decidir na U3).
- **Mesmo modelo planta e analisa** — precedente `piloto-de-valida-o-…` — controle limpo sem identificação, nomes neutros, iscas visuais; o resultado mede o método, não a eficácia contra app comercial.
- **Execução (N3) de código nosso que contém classe C** — enquadramento — roda só em `alvos/`, navegador do REA isolado, sem rede (SDK simulado), aprovado caso a caso.
- **Interface acoplando monetização ao núcleo** — plano do piloto §3 — interface lê o estado da sessão e chama ações; nunca importa de `src/nucleo/` além do que `sessao.mjs` já expõe; R1/R2 e a invariância continuam valendo.
- **Aprovação de MON-0011 caduca** se o perfil mudar — `CLAUDE.md` — mudar `monetizacao.json` só quando necessário e pedir nova aprovação na mesma unidade.
- **Contexto acima de 180k em unidade de muita escrita** — handoff da U4 do Notepad (lição: dividir antes de começar) — U1 e U2 separadas; U3 pode virar duas se o plantio e o protocolo não couberem.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 29 (5 min) | 171k máx, 148k médio; escrita de cache 126k, leitura 4,2M, saída 18k | 2 (`vault_deep_query_tool`, sem síntese) | 14 notas, ~3k |

Medido antes da aprovação e da story; o fechamento da U0 entra no handoff.

## 5. Aprovação

**Aprovado:** sim ("Aprovo o plano da F7. Registre a aprovação e siga com a story (U0).") · **Por:** responsável · **Em:** 2026-10-23 · **Ajustes pedidos:** nenhum. Nenhum precedente marcado como `aplicável`.

## 6. Contrato da unidade de trabalho (medição do Harness, D37)

| Campo | Valor |
|---|---|
| Tarefa | F7 do piloto de monetização: interface mínima no produto limpo, variante plantada com padrões visuais, análise cega com execução das duas, comparação com o gabarito (U0–U5 acima) |
| Tamanho esperado | médio: 7 sessões (U0, U1, U2, U3, U4a, U4b, U5), ~180k de contexto cada; U1+U2 podem virar uma |
| Critérios de aceitação | (1) interface do produto limpo com modelo de tela testado, desacoplamento intacto (invariância, Semgrep, checagem de monetização verdes); (2) dois builds neutros reproduzíveis com interface, vazamento 0, protocolos de segurança aprovados; (3) duas análises cegas, cada uma em sessão própria, sem leitura proibida comprovada pela varredura dos transcripts; (4) tabela contra o gabarito com estados de execução preenchidos onde o N3 foi aprovado; (5) QA gate PASS e story `Done` |
| Commit inicial | `5a7e41bc959b8d79ab7e7e93eb8e91b6d724d7fc` |
| Início (UTC) | 2026-10-23T14:45:52Z (passo 0 da Fase 0; a sessão abriu às 14:44 com a seleção da tarefa) |
| Configuração | `.claude/settings.json` sem mudança (`autoCompactWindow` 300000) |
| Registro por sessão | no handoff do REA: id completo da sessão e de subagentes, início e fim em UTC com segundos, aceita ou não, falhas, retrabalho, compactação e o que teve de ser recuperado |
