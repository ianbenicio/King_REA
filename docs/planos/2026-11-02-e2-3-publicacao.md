# Plano de execução — etapa 2 do plano de evolução: MEL-04, publicação compartilhada (E2-3)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-3 do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-2, lint e tipos) está em
docs/planos/2026-11-02-e2-2-lint-tipos.md.
-->

**Data:** 2026-11-02 · **Sessão:** `c237632e` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `ffd8886`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (18:32) e as sessões das 17:48, 17:27, 17:00 e 13:00, da mesma família (`local_c49d87ce` e filhas), todas ociosas pelo app; a E2-2 deixou handoff (`2026-11-02-e2-2-lint-tipos.md`). `git status`: só `.claude/agent-memory/`, fora do git.

## 1. Enquadramento

**Objetivo:** tirar a política de publicação de `.githooks/pre-commit.mjs` para `scripts/publicacao/`, com a mesma decisão no hook e na entrada da CI, mais caminhos proibidos, regras próprias de segredo e exceções versionadas; auditar o gitleaks e, se aprovado, ligá-lo como componente opcional.

**Restrições:** política nova igual ou mais estrita, nunca `--no-verify`; nada ativo em `.github/`; binário do gitleaks fora do git, com hash; nenhuma tool `rea`/`ghidra`, nada em `alvos/`; fixtures de segredo montadas em tempo de teste; commits locais, push só pelo @devops com autorização.

**Perfil do projeto:** domínio laboratório de engenharia reversa e processo de qualidade · stack Node 26 ESM · integrações GitHub releases (só leitura, para a auditoria) · UI não · dados sensíveis nenhum (só fixtures sintéticas) · fase AIOX implementação (MEL-04 Ready → InProgress) · complexidade STANDARD.

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Detector externo? | sim | "Auditar o gitleaks", decisão do responsável em 2026-11-02; adoção só se a auditoria passar |
| Formatos de segredo das regras próprias | sim | Os da story: chaves de API, tokens de GitHub, JWT, chave privada PEM |
| Contexto da unidade | parcial | Prefixo 96k e 147k já na Fase 0: se apertar, o gitleaks vira a próxima unidade (autorizado na tarefa) |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| pre-commit hook política de publicação repositório público detecção de segredos regex gitleaks módulo compartilhado CI testes de caracterização | 7 | 0,504–0,516 |
| auditoria de ferramenta externa binário fixado checksum assinatura cosign release GitHub sem rede telemetria; fixtures de segredo sintético disparam secret scanning | 7 | 0,500–0,517 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` | Gate fail-closed por nível, com checagem de commit para repositório público | verificável (regressões no `npm test`) | sim — é este projeto | A política nova segue fail-closed: erro de leitura do índice bloqueia |
| `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch` | Runbook de auditoria sem executar: metadados, procedência, hash, varredura | verificável (`rea-agents@6.4.0`) | parcial — o gitleaks é binário de release do GitHub, não pacote npm; vale o método (hash, procedência, nada executado antes de conferir) | Seções da auditoria do gitleaks, junto com as do Semgrep |

**Descartados:** `conferir-hash-do-alvo-*` — gate do REA, outro problema · `classmate-connect-13-*`, `fezinha-*`, `spec-v1-*`, `01JVSDD4*` — outros projetos, sem método aplicável · `benchmark-de-monetiza-o-*`, `re-verificacao-*` — outro domínio · `padr-o-verificar-cobertura-*` — genérico.

## 3. Plano preliminar

**Workflow AIOX:** SDC, fase 3 (@dev) e fase 4 (@qa) — story validada (GO).

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | Caracterização e extração | implementação / @dev | `scripts/publicacao/`, testes, `pre-commit.mjs` fino | AC5 (testes antes e depois iguais), AC1 | ~180k total |
| 2 | Caminhos proibidos, segredos, exceções, componente | implementação / @dev | regras, `excecoes.json`, componente `publicacao` | AC2, AC3, AC4, AC6 | idem |
| 3 | Gate | QA / @qa | QA Results da story | gate registrado | idem |
| 4 | Auditoria do gitleaks | implementação / @dev | `docs/seguranca/auditoria-gitleaks-<v>.md`, componente opcional | checksum e assinatura conferidos; se não couber, próxima unidade | — |

**Capacidades por fase:** implementação — Bash, Read, Edit, `node --test`, git; sob demanda — subagente @qa; não carregar — REA, Ghidra, navegador, conectores (desligados).

**Verificações:**

| Entrega | Como provar |
|---|---|
| Caracterização | testes em repositório git temporário rodando o `pre-commit.mjs` real; mesmos testes contra o módulo |
| AC1 | mesma fixture pela entrada do hook (`git diff --cached`) e pela da CI (`git diff base...head`) dá a mesma decisão |
| AC2–AC4, AC6 | testes unitários com fixtures montadas por partes; relatório sem o valor |
| Regressão | `npm test` verde; `npm run verificar -- --so publicacao`; o próprio commit passa pelo hook novo |

**Riscos:** falso positivo de segredo em arquivo do repositório — varrer o repositório inteiro com as regras antes de ligar; exceção versionada com motivo · literal de segredo no teste disparar o push protection — montar por partes · contexto — entregar a parte fechada primeiro.

## 4. Custo da Fase 0

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 16 | 147k (máximo por requisição; prefixo inicial 96k) | 2 (`deep`) | ~4k |

## 5. Aprovação

Aprovação prévia: escopo e ordem decididos pelo responsável na conversa da sessão principal (2026-11-02) e repassados na tarefa desta sessão; a aprovação cobre auditar o gitleaks e adotá-lo só se a auditoria passar sem problema. Sem ajustes pedidos.

## 6. Resultado

Executado em 2026-11-02: parte fechada da MEL-04 (`0b56b7a` e correções do gate @qa, CONCERNS, QA-E23-01 a 06 corrigidos). Auditoria do gitleaks adiada para a unidade E2-3b (contexto). Detalhes no [handoff](handoffs/2026-11-02-e2-3-publicacao.md).
