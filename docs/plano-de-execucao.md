# Plano de execução — etapa 3 do plano de evolução: E3-1 (MEL-05, fatia 1)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E3-1 do prompt de abertura enviado pela sessão
local_a61030e0. O plano anterior (E3-0, preparação) está em docs/planos/2026-11-04-e3-0-preparo-mel05.md.
-->

**Data:** 2026-11-04 · **Sessão:** `b9cc59a4` (abertura 13:21) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `a431045`, igual ao `origin/main`; a branch de trabalho será `feat/e3-1-integracoes`

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (13:21) e a E3-0 (13:51 de 2026-11-03, 1410 min), fechada pelo handoff `2026-11-04-e3-0-preparo-mel05.md` já no `main` (PR #11). As demais são de 2026-11-03 e 2026-11-01, com handoff. `git status`: só `.claude/agent-memory/`, fora do git (não adicionar). Conferido: `main` = `origin/main` = `a431045`; proteção do `main` com check `resultado` e `enforce_admins` ligado. Os 11 conectores do claude.ai foram desligados no início.

## 1. Enquadramento

**Objetivo:** implementar a fatia 1 da story MEL-05: componente `integracoes` do verificador (oito pontos do ADR-0001 §2f), no job `js` da CI, com a correção da documentação em prosa D1–D3 (runbook e guia) na mesma fatia.

**Restrições:** nenhuma tool `rea` ou `ghidra`; nada em `alvos/` nem `saidas/`; a fatia só lê e confere: não edita `rea-gate.mjs`, `cli-gate.mjs`, `rea-niveis.json`, `ghidra-niveis.json`, matcher, `.mcp.json`, `registros/_modelos/` nem `00-seguranca.md` (AC13); fora do verificador e da CI, edita só `docs/runbook-prereqs-nativo.md` e `docs/guia-rea.md` (mais story, handoffs e plano); sem `--no-verify`, sem `--force`; push e PR só pelo @devops com autorização; merge só com o "sim"; textos em português com acentuação; limite ~180k de contexto (se estourar: 1a = AC1–AC15, 1b = AC16–AC18, o que reabre a D-2, então perguntar antes).

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26 (módulos `.mjs`, `node --test`), GitHub Actions · integrações: servidores MCP `rea` (170 tools) e `ghidra` (30), gates de hook · UI não · dados sensíveis: nenhum no checkout · fase AIOX: SDC, story MEL-05 em Ready (GO 9,5/10) · complexidade STANDARD (M no teto).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| P-6: runbook sem referência `GhidraMCP@`, o ponto 8 aprova ou reprova? | aberta | Pergunta ao responsável antes de implementar (recomendação @po: reprova, fail-closed) |
| `runbook-prereqs-nativo.md:100` (diz que falta registrar `ghidra`) entra na fatia 1? | aberta | Pergunta ao responsável (amplia a D-2) |
| D-3: semântica do matcher no Claude Code | aberta | @architect confirma antes de fechar o AC2; não impede o início |
| P-7 e ADR §6 (2, 4, 5, 7, 8, 9, 10) | aberta | Não bloqueiam a fatia 1; responsável decide quando quiser, registro no handoff |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| verificador de consistência MCP/matcher/mapas/documentação; teste de equivalência de regex de gate; componente novo no job `js` | 7 | 0,509–0,524 |
| matcher de hook PreToolUse `mcp__servidor__`; reimplementar regras de leitura com teste de equivalência em subprocesso | 7 | 0,506–0,544 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` (0,544) | Padrão do gate: mapa `<servidor>-niveis.json` por servidor, hook fail-closed; toda tool do catálogo no mapa | relatada | sim: é o contrato que o componente confere (mesmo repositório, `rea-gate.mjs:63-85`) | O componente trata mapa sem servidor, servidor sem mapa e tool sem nível como falha, nunca como aviso |
| `conferir-hash-do-alvo-na-admiss-o-em-gate-pretooluse-manifes` (0,521) | Seção "Identidade dos arquivos" estrita, lida por regex pelo gate | relatada | sim: é a regra que o AC8 reimplementa | Teste de equivalência do AC8 prende o componente à leitura real do gate |
| `verifica-o-local-com-tr-s-estados-e-global-json-resolvido-pe` (0,518) | Verificador agregado separa aprovado, falhou e não executado (requisito ausente), saída não zero quando incompleto | relatada | sim: MEL-03, mesma estrutura do `verificar.mjs` | `depende: ["ambiente-node"]`, "não executado nunca é verde" (AC12) |

**Descartados:** `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` — genérico, já feito no ADR (levantamento); demais notas (DESPENSA, Fezinha, classmate-connect) — outros projetos, sem relação.

## 3. Plano preliminar

**Workflow AIOX:** SDC fase 3 (implementar) e 4 (QA gate) sobre a story MEL-05 já em Ready; fases 1 e 2 feitas na E3-0.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | Fase 0, estado de partida e perguntas | esta sessão | este plano; respostas do responsável no handoff | P-6, `:100` respondidas; D-3 confirmada ou pressuposto aceito | ~180k |
| 2 | Implementação com testes primeiro | SDC 3 / @dev | `scripts/integracoes/verificar-integracoes.mjs` + teste; `verificar.mjs`, `agregar-ci.mjs`, `verificacao.yml`, `package.json`; runbook e guia corrigidos | AC1–AC18 com evidência; `npm test` verde | idem |
| 3 | QA gate | SDC 4 / @qa | gate PASS/CONCERNS/FAIL na story | 7 verificações; AC13 por `git diff --name-only` | idem |
| 4 | Fechamento | esta sessão | handoff `docs/handoffs/2026-11-04-e3-1-*.md`, estado geral, story | pergunta sobre branch, PR e merge | idem |

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\`, não relido nesta unidade; uso o que o prompt de abertura fixou):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Implementação | subagente `aiox-dev`, Read/Edit/Bash | `aiox-architect` (D-3) | skills de design, conectores claude.ai | nada |
| QA | subagente `aiox-qa` | — | idem | nada |
| Envio | `aiox-devops` e ferramentas ccd_pr | — | `/loop`, polling de CI | só com autorização do responsável |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Componente e testes | `node --test scripts/integracoes/` e `npm test` verdes (Docker para os 5 do gitleaks) |
| Integração à CI | `workflow-ci.test.mjs` verde; `node scripts/verificar/verificar.mjs --so integracoes` aprovando o repositório real |
| Ponto 8 | componente reprova fixture com `GhidraMCP@2.0` e aprova o runbook corrigido |
| Limites | `git diff --name-only main` sem nenhum arquivo do AC13 |
| Tudo | `npm run verificar` (Semgrep com Docker ligado), lint e tipos verdes |

**Riscos:** (1) matcher: casamento do Claude Code não confirmado, falsa confiança — ADR R1; fail-closed e confirmação do @architect. (2) Contexto acima de ~180k — sessão E3-0 passou do limite (média 166k); mitigação: subagentes para implementação e QA, divisão 1a/1b só com pergunta ao responsável. (3) Reimplementar regras do gate: divergência silenciosa — precedente `conferir-hash-…`; teste de equivalência com o gate em subprocesso. (4) Docker desligado deixa 5 testes pulando: "não executado" não é verde.

## 4. Custo da Fase 0

Saída de `sessao.js` ao fim do passo 3 (medida após a 4ª chamada ao Engram, antes da escrita do plano):

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 13 (principal), 0 (subagentes) | médio 143k, máximo 170k (inicial 97k) | 4 (2 `deep`, 2 chamadas com erro de formato) | ~3k |

## 5. Aprovação

**Aprovado:** sim, por seguimento do prompt de abertura do responsável; as três perguntas abertas foram respondidas em 2026-11-04 (AskUserQuestion), todas na recomendação · **Por:** responsável · **Em:** 2026-11-04 · **Ajustes pedidos:** nenhum.

**Respostas do responsável (2026-11-04):**

| Pendência | Resposta | Efeito |
|---|---|---|
| P-6 (runbook sem `GhidraMCP@`) | **Reprova** (fail-closed) | AC17 fixa o caso e ganha o teste |
| `runbook-prereqs-nativo.md:100` | **Corrigir na fatia 1** (amplia a D-2) | AC18 (a) cobre a linha 100 |
| D-3 (matcher) | **Aceita o pressuposto fail-closed** do AC2 | AC2 fecha com o pressuposto, mais o relatório do @architect |

**D-3 — relatório do @architect** (`side-session-notes/…/d3-matcher-claude-code.md`; fonte: hooks reference do Claude Code): matcher só com `[A-Za-z0-9_\- ,|]` é lista de nomes exatos; qualquer outro caractere é regex JavaScript, testada com `RegExp.prototype.test` (**parcial, sem âncora**); `*`/vazio casa tudo; servidor de plugin vira `mcp__plugin_<plugin>_<servidor>__<tool>`, que o matcher atual nunca pega. A confirmar (não documentado): `_` dentro do nome do servidor. O pressuposto do AC2 coincide com a documentação.
