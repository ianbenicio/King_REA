# Plano de execução — etapa 2 do plano de evolução: MEL-08 fatia 1 local (E2-4)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-4 do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-1, validação @po) está em
docs/planos/2026-11-02-e2-1-validacao-po.md.
-->

**Data:** 2026-11-02 · **Sessão:** `24b25af1` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `b89b9b3`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. Transcripts das últimas horas, identificados pelo conteúdo: `aade639a` (E2-1, com handoff `2026-11-02-e2-1-validacao-po.md`, encerrada), `f5cee9eb` (sessão-mãe `local_c49d87ce`, que abriu esta), `ff5a739b` e `926eb6c7` (12:28, sessões ligadas ociosas). `git status`: limpo. Estado real igual ao relatório: `npm test` 184/184.

## 1. Enquadramento

**Objetivo:** entregar a fatia local da MEL-08 (AC7 agregador, AC8 sonda WPF, AC9 auditoria das actions), verificável localmente, sem ativar nada no GitHub.

**Restrições:** nada ativo em `.github/`, sem segredo, runner ou proteção de branch (E2-5); auditar action é ler e registrar versão e SHA, sem adotar; nenhuma tool `rea`/`ghidra`, nada em `alvos/`; não mexer em `00-seguranca.md`; não contornar gate, `cli-gate`, monetização ou `pre-commit`; UI WPF sem fechar processo do responsável e com o clipboard preservado; commits locais, push só pelo @devops com autorização.

**Perfil do projeto:** domínio laboratório de engenharia reversa e verificação · stack Node 26 (ESM, `node:test`), .NET 10 (WPF, xUnit) · integrações GitHub (repositório público; leitura de repositórios de actions pela API) · UI sim (sonda WPF) · dados sensíveis: nenhum na fatia (só JSON sintético) · fase AIOX: SDC fase 3 (Implement) e 4 (QA) · complexidade STANDARD.

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| `wpf-interativo` com sonda aprovada e asserção falhando: o `resultado` agregado fica vermelho? A tabela do desenho §5 não cobre o caso | sim | responsável, 2026-11-02: **vermelho** (falha de asserção é falha, plano §5) |
| Regra atual do verificador que recusa a UI com `GITHUB_ACTIONS=true` | sim | desenho §4: vale "até a sonda existir"; com a sonda, a decisão passa a ser dela. A regra do sandbox do Codex fica (evidência da MEL-02) |
| Cabe tudo em uma sessão? | sim | não: AC7 e AC8 aqui (E2-4a), AC9 em sessão nova (E2-4b), aprovado pelo responsável |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| CI GitHub Actions, agregador JSON de três estados, sonda de pré-requisitos WPF em runner hospedado, actions fixadas por SHA | 7 | 0,506–0,53 |
| testes de UI WPF, clipboard e foco em sandbox ou sessão não interativa, ClipboardScope, pré-requisito ausente vs falha de asserção | 7 | 0,514–0,536 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `verifica-o-local-com-tr-s-estados-e-global-json-resolvido-pe` | verificador separa aprovado, falhou e não executado; saída não zero quando incompleto; `dotnet` resolve o `global.json` pelo cwd | verificável (MEL-03, commit `5e71dbd`) | sim — mesmo repositório, `scripts/verificar/verificar.mjs` lido | agregador reusa `ESTADOS` e os códigos de saída do verificador; a sonda roda com cwd em `reimplementacoes/notepad` |
| `testes-de-ui-wpf-falham-no-sandbox-elevado-do-codex-no-windo` | 72/76 no sandbox do Codex, 76/76 como usuário interativo; a falha era de asserção, não de pré-requisito | relatada | sim — regra `CodexSandbox` presente no verificador | a sonda não substitui a regra do Codex (o sandbox pode passar na sonda e falhar na asserção); falha de asserção continua falha |

**Descartados:** `fezinha-…`, `classmate-connect-13-…` (dois), `despensa-…` (quatro), `padr-o-…` (dois), `fallback-num-rico-…` — outros domínios, sem relação com CI ou WPF.

## 3. Plano preliminar

**Workflow AIOX:** SDC (story MEL-08 já Ready, validada pelo @po) — fases 3 e 4, @dev implementa, @qa revisa com gate registrado na story; a story fica InProgress até a fatia 2 (DoD).

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | E2-4a: agregador e sonda | Implement / @dev; QA / @qa | `scripts/verificar/agregar-ci.mjs` + testes; sonda `PRKingNotepad.UiProbe` + integração no `notepad-ui`; commits locais | AC7 e AC8 da story | ~180k (esta sessão) |
| 2 | E2-4b: auditoria das actions | Implement / @dev; QA / @qa | `docs/seguranca/auditoria-actions-mel08.md` (checkout, setup-node, setup-dotnet, upload-artifact, download-artifact: versão, SHA de commit, licença, runtime, permissões, rede) | AC9 | ~180k (sessão nova) |

**Capacidades por fase:**

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Implement | Read/Edit/Bash, `dotnet`, `node --test` | — | `rea`, `ghidra`, conectores do claude.ai (desligados) | nada |
| QA | revisão do diff, `npm test`, `npm run verificar` | — | skills grandes de revisão | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Agregador (AC7) | testes no `npm test` com JSON sintéticos das cinco situações do desenho §5 (estado, código de saída, tabela) |
| Sonda (AC8) | testes no `npm test` da interpretação da sonda (item ausente simulado, saída só com booleanos); execução local da sonda e do `npm run verificar -- --so notepad-ui` como usuário interativo |
| Regressão | `npm test` verde; `npm run verificar -- --so notepad-core,notepad-ui` |

**Riscos:** a sonda tirar o foco do responsável por instantes — enquadramento — janela própria, pequena, fechada pela própria sonda; clipboard do responsável perdido — enquadramento — mesma cópia por formato do `ClipboardScope` (arquivo ligado ao projeto da sonda, sem duplicar código); sonda aprovada mas asserção falhando no sandbox do Codex — precedente `testes-de-ui-wpf-…` — manter a regra do Codex.

## 4. Custo da Fase 0

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 18 | ~162k (prefixo 95k) | 2 (`deep`, sem síntese) | 14 notas (tldr + trecho) |

## 5. Aprovação

**Aprovado:** sim · **Por:** responsável · **Em:** 2026-11-02 · **Ajustes pedidos:** nenhum; divisão E2-4a/E2-4b aprovada; WPF com asserção falhando reprova o `resultado`
