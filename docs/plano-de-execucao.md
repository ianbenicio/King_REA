# Plano de execução — etapa 2 do plano de evolução: validação @po (E2-1)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-1 do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (preparação da etapa 2) está em
docs/planos/2026-11-01-evolucao-etapa2-preparacao.md.
-->

**Data:** 2026-11-02 · **Sessão:** `aade639a` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `ac45b9b` (1 commit local à frente do `origin`)

## 0. Sessão concorrente

Nenhuma escrevendo. Sessões das últimas horas: `15:16Z` e `12:19Z` (sessão-mãe `local_c49d87ce`, que escreveu o relatório de estado, e a das perguntas de volta do `uo-classic`, com handoff `2026-11-02-uo-classic-pergunta-de-volta-1-4.md`); as sessões ligadas estão todas ociosas. `git status`: limpo. Estado real igual ao relatório: `origin/main...main` = `0 1`, `npm test` 184/184.

## 1. Enquadramento

**Objetivo:** validar pelo checklist de 10 pontos (@po) as stories MEL-03, MEL-04 e MEL-08, com GO/NO-GO e correções registradas em cada uma.

**Restrições:** nenhuma tool `rea`/`ghidra`, nada em `alvos/`; nada ativo em `.github/`; não mexer em `00-seguranca.md`; @po edita título, descrição, AC e escopo; commits locais, push só pelo @devops com autorização; nenhuma regra nova inventada — correção só se derivar do plano de evolução, do desenho da CI ou de fato conferido no repositório.

**Perfil do projeto:** domínio laboratório de engenharia reversa e ferramentas de verificação · stack Node 26 (ESM), .NET 10 (WPF), Docker (Semgrep) · integrações REA e Ghidra via MCP local, GitHub (repositório público) · UI não (nesta unidade) · dados sensíveis: alvos e saídas fora do git · fase AIOX: SDC fase 2 (Validate) · complexidade SIMPLE (documental).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| @po aplica as correções ou só lista? | sim | A regra de ciclo de vida permite GO condicional depois das correções aplicadas pelo @po, com status Draft → Ready e registro no Change Log. Correções aplicadas quando derivam de fonte; o que pede decisão do responsável fica listado como condição. |
| MEL-03 já teve a fatia 1 implementada antes da validação | sim | Autorizado pela §12 do plano de evolução; registrado como observação, não bloqueia. |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| validação de story pelo PO checklist 10 pontos GO NO-GO; stories de CI, ambiente reproduzível, hook pre-commit compartilhado com CI; riscos | 7 | 0,511–0,521 |
| story Draft para Ready com AC dependente de decisão ou ferramenta não auditada; fatiar story; CI GitHub Actions desenho antes de ativar; PRKing_REA etapa 2 | 7 | 0,521–0,532 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` | conferir o código antes de aceitar o que um documento afirma | relatada | sim — as stories afirmam arquivos, testes e listas; conferidos com `Test-Path`, `.gitignore`, `package.json` e Grep | a validação confere cada afirmação factual das stories antes do veredito (achados: `ferramentas/` não está inteira no `.gitignore`; o `pre-commit` não tem teste de regressão) |
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` | checagem de commit para repositório público faz parte do padrão de gate | verificável | parcial — é o contexto da MEL-04, não um método de validação | MEL-04 conferida contra o `pre-commit` real |

**Descartados:** `fezinha-*`, `classmate-connect-13-*`, `despensa-*`, `padr-o-citar-a-spec-*` — outros domínios · `conferir-hash-do-alvo-*`, `perfil-do-alvo-*`, `prking-rea-*` (contexto), `prking-notepad-bloco-5-*` — mesmo projeto, sem relação com validação de story.

## 3. Plano preliminar

**Workflow AIOX:** SDC, fase 2 (Validate, @po) — as três stories são M e estão em Draft.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 0 | Fase 0 | — | este plano; anterior arquivado | seções 1–5 preenchidas | ~180k |
| 1 | Validação MEL-03 | SDC fase 2 / @po | story com seção "Validação @po", correções e Change Log | nota por ponto, veredito, correções com fonte | ~180k |
| 2 | Validação MEL-04 | idem | idem | idem | — |
| 3 | Validação MEL-08 | idem | idem | idem | — |
| 4 | Handoff e relatório | — | `docs/handoffs/2026-11-02-e2-1-validacao-po.md`; relatório de estado atualizado | entregas, decisões, pendências, métricas | — |

**Capacidades por fase:**

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Validação | nativas (Read, Grep, Edit), checklist de `~/.claude/rules/story-lifecycle.md` | Engram (salvar padrão, se houver) | REA, Ghidra, browser, conectores, protocolos de alvo, agentes AIOX completos | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Cada story | seção de validação com os 10 pontos, nota, veredito e lista de correções com fonte; status e Change Log coerentes |
| Fatos citados nas correções | comando ou arquivo citado ao lado de cada achado |
| Repositório | `npm test` verde e `pre-commit` sem `--no-verify` nos commits |

**Riscos:** @po inventar critério — enquadramento — cada correção cita plano, desenho ou fato conferido · contexto alto (~157k depois da Fase 0) — medição do `sessao.js` — sem próxima unidade nesta sessão.

## 4. Custo da Fase 0

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 20 | 157k (máx) | 2 (`vault_deep_query_tool`) | ~5k |

## 5. Aprovação

**Aprovado:** sim, pelo escopo da tarefa · **Por:** responsável, por meio da sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed` (prompt de continuidade de 2026-11-02) · **Em:** 2026-11-02 · **Ajustes pedidos:** nenhum. Mesmo critério do plano anterior: a tarefa fixa unidade, limites e critérios de pronto.
