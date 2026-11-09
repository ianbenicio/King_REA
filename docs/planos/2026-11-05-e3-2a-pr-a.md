# Plano de execução — etapa 3 do plano de evolução: E3-2a (MEL-05, fatia 2, PR-A)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E3-2a. O plano anterior (melhorias craft-anything)
está em docs/planos/2026-11-04-craft-melhorias.md.
-->

**Data:** 2026-11-05 · **Sessão:** `836b5fcc` (continuação, aberta em 2026-11-03 13:51) · **Projeto:** PRKing_REA · **Branch/commit:** `feat/e3-2a-auditoria-ghidramcp` @ `3c6b8db` (igual ao `origin/main`)

## 0. Sessão concorrente

Nenhuma escrevendo: `sessao.js --lista 5` mostra esta sessão (2813 min) e as anteriores, todas com handoff (E3-0, E3-1 e as de 2026-10-13, 10-20 e 11-03 13:00). `git status`: só `.claude/agent-memory/`, fora do git (não adicionar). `main` = `origin/main` = `3c6b8db` (PRs #15 e #16 mesclados hoje). Os 11 conectores do claude.ai foram desligados no início da unidade.

## 1. Enquadramento

**Objetivo:** entregar o commit 1 da fatia 2 da MEL-05 (PR-A): mover o registro da auditoria do GhidraMCP para `docs/seguranca/auditoria-ghidramcp-2.0.md`, reapontar runbook e guia e ajustar o ponto 8 do verificador `integracoes` (regras (a) a (d)) com seus testes, tudo no mesmo commit (R10).

**Restrições:** nenhuma tool `rea` ou `ghidra`; nada em `alvos/` nem `saidas/`; **não edita** `rea-niveis.json`, `ghidra-niveis.json`, `rea-gate.mjs`, `cli-gate.mjs`, `settings.json`, `.mcp.json`, `registros/_modelos/` nem `00-seguranca.md` (F2-AC22); fora do verificador e dos testes, a documentação do produto no diff é só runbook, guia e a auditoria nova; sem o item (e) do F2-AC21 nem o caso (6) (vão para o commit 8); sem matriz em prosa no guia; sem `--no-verify`, sem `--force`; push, PR e merge só pelo @devops, com autorização do responsável; textos em português com acentuação; commits em inglês com `[Story MEL-05]`; limite ~180k de contexto.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26 (`.mjs`, `node --test`), GitHub Actions · integrações: servidores MCP `rea` (170 tools) e `ghidra` (30), gates de hook · UI não · dados sensíveis: nenhum no checkout · fase AIOX: SDC fase 3 (implementar) e 4 (QA) sobre a story da fatia 2 (Ready, GO condicional 9,5/10) · complexidade STANDARD (P no tamanho: um commit, documentação e um módulo com testes).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Q5: menções abreviadas `1e98025` e `b92a651` no runbook e no guia | sim | Podem ficar como histórico; só o commit completo e a forma `GhidraMCP@` saem do runbook (decisão de 2026-11-04) |
| P6: um PR por story (a fatia 2b mexe em `registros/_modelos/` e `CLAUDE.md`) | sim | PR-A leva só a fatia 2; a 2b vai em outro PR |
| Commit 1 não depende de P1 a P4 | sim | Story, plano de commits |
| Estado da U5 (`rea-niveis.json`) | sim, não afeta | Commit 1 não toca mapas |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| auditoria de servidor MCP de terceiros com commit fixado; consistência runbook × `.mcp.json` × mapa de níveis em CI Node; mover registro de versão para documento único | 8 | 0,507–0,522 |
| refatoração que muda regra do verificador, testes e documentação no mesmo commit; fixtures `node --test`; fail-closed em referência ausente | 8 | 0,516–0,524 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch` (0,509) | Método de auditoria estática de pacote (metadados, hash, varredura sem executar); aplicada ao `rea-agents@6.4.0` | relatada | parcial: vale para o formato do registro da auditoria; o GhidraMCP não é pacote npm (clone de commit) | O arquivo novo segue o padrão de `auditoria-rea-6.4.0.md` sem reescrever o juízo de 13/10 (F2-AC18) |
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` (0,522) | Mapa por servidor + hook fail-closed; checagem de commit para repo público | relatada | sim: mesmo repositório | O ponto 8 continua fail-closed: ausente, ilegível ou sem referência reprova |
| `verifica-o-local-com-tr-s-estados-e-global-json-resolvido-pe` (0,518) | Verificador agregado separa aprovado, falhou e não executado | relatada | sim: MEL-03 | Componente continua reprovando por achado e "não executado" nunca é verde |

**Descartados:** `despensa-*`, `classmate-connect-13-*`, `fezinha-contract-v0-*` — outros projetos, sem relação com o objeto.

## 3. Plano preliminar

**Workflow AIOX:** SDC fase 3 e 4 sobre a story `mel-05-fatia-2-contrato-e-atributos.story.md` (Ready); fases 1 e 2 já feitas.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | Fase 0 e estado de partida | esta sessão | este plano | aprovação do responsável | ~180k |
| 2 | Implementação, testes primeiro | SDC 3 / @dev (subagente) | `docs/seguranca/auditoria-ghidramcp-2.0.md`; runbook e guia reapontados; `verificar-integracoes.mjs` (+ `AUDITORIA_GHIDRA`) e seu teste; 1 commit local | F2-AC18 a F2-AC21 (sem (e) e sem caso 6), F2-AC22 e F2-AC26 com evidência; `npm test` verde | idem |
| 3 | QA gate | SDC 4 / @qa (subagente) | gate PASS/CONCERNS/FAIL na story | 7 verificações; F2-AC22 por `git diff --name-only origin/main`; mutação do ponto 8 | idem |
| 4 | Fechamento | esta sessão | handoff `docs/handoffs/2026-11-05-e3-2a-pr-a.md`, story (File List, checkboxes) | pergunta sobre branch, PR e merge | idem |

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\`, não relido; uso o que o prompt de abertura fixou):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Implementação | subagente `aiox-dev`, Read/Edit/Bash | — | skills de design, conectores claude.ai | nada |
| QA | subagente `aiox-qa` | — | idem | nada |
| Envio | `aiox-devops` e ferramentas ccd_pr | — | `/loop`, polling de CI | só com autorização do responsável |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Ponto 8 e testes | `node --test scripts/integracoes/` verde, com os casos (1) a (5) e (7) do F2-AC21 |
| Repositório real | `node scripts/verificar/verificar.mjs --so integracoes` aprova |
| Docs | runbook sem `GhidraMCP@` nem commit de 40 hex; auditoria com `GhidraMCP@` igual ao `.mcp.json` |
| Limites | `git diff --name-only origin/main` sem nenhum arquivo de F2-AC22 |
| Tudo | `npm test`, lint, tipos e `npm run verificar` (Semgrep com Docker ligado) |

**Riscos:** (1) Contexto da sessão principal já alto (médio 186k, máx 266k, 34% das requisições acima de 200k, 1 compactação) — mitigação: implementação e QA em subagentes; esta sessão só orquestra. (2) Mover o registro quebra a CI se o ponto 8 e o texto não mudarem no mesmo commit — R10, precedente `gate-de-tools-mcp-…`; um commit só. (3) Reescrever o juízo da auditoria — F2-AC18 manda mover sem reescrever; @qa confere o texto contra o runbook de `main`. (4) Docker desligado deixa 5 testes pulando — "não executado" não é verde; ligar o Docker antes do gate.

## 4. Custo da Fase 0

Saída de `sessao.js` ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 143 (principal), 120 (subagentes) | médio 186k, máximo 266k (inicial 100k) | 2 `deep` com sucesso (3 tentativas com erro de formato antes de carregar o esquema da tool) | ~5k |

## 5. Aprovação

**Aprovado:** sim, por `AskUserQuestion` em 2026-11-05 (opção recomendada) · **Por:** responsável · **Ajustes pedidos:** nenhum. Lembrete dele: Docker Desktop ligado para o gate completo.
