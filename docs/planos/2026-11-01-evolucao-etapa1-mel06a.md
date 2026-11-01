# Plano de execução — etapa 1 do plano de evolução: MEL-06a

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano preliminar da última entrega da
etapa 1 do plano de evolução docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md
(§4, MEL-06a). O plano anterior (MEL-01 e MEL-02, concluídas) está em
docs/planos/2026-11-01-evolucao-etapa1-mel01-mel02.md. O piloto do perfil do alvo segue
no plano docs/planos/2026-11-01-perfis-alvo.md (U4 pendente).
-->

**Data:** 2026-11-01 · **Sessão:** `07ad7cae-5466-461d-8974-110b0dd5b4b8`, aberta pela sessão `local_04e63149-3c4f-4a36-b81d-6fcde8a1728c` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `3f9c193`

## 0. Sessão concorrente

`sessao.js --lista 5`: a sessão de 19:51 (46 min, 80 chamadas) é a que abriu esta e está parada enquanto esta trabalha; as demais (13:00, 19:24 e 23/10) têm handoff em `docs/handoffs/` e estão paradas. As sessões ligadas (`u1-calibra-o-retroativa`, `u2-cat-logo-de-perfis-de`, `perfis-alvo-u3`) estão ociosas.

`git status` no início: limpo. Depois do arquivamento: `R docs/plano-de-execucao.md -> docs/planos/2026-11-01-evolucao-etapa1-mel01-mel02.md` (esta sessão). Não há ponteiro vivo para o plano arquivado: as menções a `docs/plano-de-execucao.md` são históricas (planos e handoffs antigos) e ficam como estão.

## 1. Enquadramento

**Objetivo:** fazer o gate conferir, na admissão, o SHA-256 de cada arquivo original do alvo contra o hash registrado no `00-seguranca.md`, bloqueando divergência, hash ausente ou ambíguo (A03, parte barata).

**Restrições:**

- Nenhuma tool `rea`/`ghidra`; `alvos/` não é aberto. Testes com fixtures sintéticas em pasta temporária.
- `status` e `niveis_aprovados` de `00-seguranca.md` reais não mudam; níveis dos mapas não mudam; o gate não é desativado nem contornado.
- `rea-niveis.json` não muda (a lista de admissão sai dos schemas, não do mapa). Mudança no modelo do `00-seguranca.md` e no protocolo de segurança é registrada no plano do piloto (regra de coordenação do plano de evolução §3).
- Hash ausente ou ambíguo não autoriza preencher aprovações: a migração dos registros existentes não é feita aqui.
- Sem push. `pre-commit` precisa passar. Conectores do claude.ai não são tocados.

**Perfil do projeto:** domínio laboratório de engenharia reversa (controles próprios) · stack Node ESM (hook PreToolUse e `node --test`) · integrações REA 6.4.0 (só leitura dos schemas em `node_modules/rea-agents`) · UI não · dados sensíveis nenhum (fixtures sintéticas) · fase AIOX SDC, caminho curto · complexidade SIMPLE

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Onde o gate lê o hash? | sim | Os registros reais usam formatos livres e incompatíveis entre si (hash único, hash do conjunto, tabelas com colunas diferentes, hash abreviado em `notepad-reimpl`, lista em `saidas/` fora do git). Ler texto livre seria ambíguo. Decisão: seção própria no `00-seguranca.md`, "Identidade dos arquivos", tabela `Arquivo` × `SHA-256` com caminho relativo a `alvos/<slug>/` e hash completo |
| Quais tools admitem conteúdo? | sim | Schemas do REA 6.4.0: `inspect_artifact` e `extract_artifact` não têm caminho (operam sobre o documento aberto); a admissão real é todo argumento de caminho local que aponta para `alvos/<slug>/` (`open_binary`, `inspect_*` com `path`, `analyze_javascript_application`, `capture_*_scenario`, `install_adb_package`, `push_adb_file` etc.). Consultas sobre documento aberto não recalculam |
| Registros existentes sem a seção | sim, fatiado | Ficam bloqueados na admissão (fail-closed, aceite 2). Migração = fatia própria (MEL-06a-m), com os hashes da triagem e aprovação do responsável, registrada na story |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| gate PreToolUse hook conferir SHA-256 do arquivo do alvo na admissão manifesto de hash por arquivo fail-closed substituição de conteúdo TOCTOU | 7 | 0,499–0,542 |
| integridade de artefato hash registrado divergente bloqueia análise engenharia reversa identidade do alvo cópia imutável proveniência saída derivada | 7 | 0,499–0,509 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` (0,542) | Mapa de nível por servidor + hook fail-closed + checagem de commit para repositório público | verificável (`.claude/hooks/rea-gate.mjs`, `npm test`) | sim — é deste projeto; conferido lendo o hook atual | A conferência entra no mesmo hook, como mais uma condição fail-closed, sem segundo mecanismo e sem mexer nos mapas |

**Descartados:** `prking-rea-projeto-de-engenharia-reversa-com-rea-no-claude-c` — contexto geral, já no CLAUDE.md · `uo-classic-integridade-do-patcher-*`, `re-identificar-checksum-*`, `re-verificacao-de-assinatura-*` — achados de análise do alvo, não do controle · `export-renderiza-o-n-o-canal` — padrão de produto alheio · demais — outros projetos ou do próprio vault.

## 3. Plano preliminar

**Workflow AIOX:** SDC, caminho curto (YOLO) — entrega P (plano de evolução §3 e §10): story enxuta, implementação e QA na mesma unidade.

**Unidades de sessão (D9):** uma só.

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 0 | Fase 0 | — | este plano; plano anterior arquivado | seções 1–5 preenchidas | ~180k |
| 1 | MEL-06a | SDC curto / @dev + @qa | `.claude/hooks/rea-gate.mjs` e teste; modelo `00-seguranca.md` e skill `protocolo-seguranca`; story `docs/stories/mel-06a-hash-admissao.story.md`; aceites no plano de evolução; commit `fix:` | 4 aceites da MEL-06a; `npm test` verde | ~180k |
| 2 | Handoff | — | `docs/handoffs/2026-11-01-evolucao-etapa1-mel06a.md` | estado dos aceites, limitação, fatia de migração, métricas | — |

**Capacidades por fase:**

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| SDC — implementar | nativas (Read, Edit, Bash), `node --test`, leitura dos schemas do REA por script temporário fora do repositório | Engram (salvar o padrão, se reaproveitável) | REA, Ghidra (MCP), browser, conectores, protocolos de alvo | nada |
| SDC — QA | `npm test`, `pre-commit` | `/code-review` nativo | gstack `review` | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Aceite 1 | Teste: arquivo com hash registrado é liberado; o mesmo caminho com conteúdo trocado é negado; vários arquivos, cada um com o seu hash; diretório admitido confere cada arquivo |
| Aceite 2 | Teste: registro sem a seção, com hash abreviado, com caminho repetido e hash diferente, ou com seção duplicada é negado com motivo que cita o protocolo; o `00-seguranca.md` da fixture fica byte a byte igual |
| Aceite 3 | Regressões novas falham no hook antigo (`git show HEAD:…` em pasta temporária) e passam no novo; `npm test` verde |
| Aceite 4 | Limitação no cabeçalho do hook, na story e no handoff: substituição depois da admissão e troca de programa no Ghidra só na MEL-06 |

**Riscos:**

- Alvo ativo real (`uo-classic`) e os demais passam a ser bloqueados na admissão até a migração — enquadramento — é o comportamento pedido (fail-closed); fatia de migração registrada, com hashes da triagem e aprovação do responsável.
- Recalcular arquivos grandes a cada chamada — plano de evolução — só argumentos de caminho em `alvos/` são conferidos; consultas sobre documento aberto não; leitura em blocos, sem carregar o arquivo inteiro.
- Diretório admitido com arquivo fora da tabela ou com link — enquadramento — bloqueia (conteúdo sem identidade).
- Saída derivada comparada ao pai — plano de evolução — `saidas/<slug>/` nunca é comparado; proveniência própria fica para a MEL-06.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| ~24 (estimado; a sessão inteira fechou com 42) | ~140k (máx. da sessão 219k) | 2 (`vault_deep_query_tool`) | ~3k |

## 5. Aprovação

**Aprovado:** sim, pelo escopo da tarefa · **Por:** responsável, por meio da sessão `local_04e63149-3c4f-4a36-b81d-6fcde8a1728c` · **Em:** 2026-11-01 · **Ajustes pedidos:** nenhum. A tarefa fixa critérios, limites e o caminho curto; esta sessão não pediu nova aprovação para não parar a etapa. O plano fica sujeito a revisão no handoff.
