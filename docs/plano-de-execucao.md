# Plano de execução — etapa 2 do plano de evolução: MEL-08, auditoria das actions (E2-4b)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-4b do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-4a, agregador e sonda WPF) está em
docs/planos/2026-11-02-e2-4a-mel08-local.md.
-->

**Data:** 2026-11-02 · **Sessão:** `8345181b` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `841788f`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. Transcripts das últimas horas, identificados pelo conteúdo: `8345181b` (esta), `f5cee9eb` (sessão-mãe `local_c49d87ce`), `24b25af1` (E2-4a, com handoff `2026-11-02-e2-4a-mel08-local.md`, ociosa), `ff5a739b` e `b0f09ab6` (sessões ligadas ociosas). `git status`: só `.claude/agent-memory/`, que fica fora do git. Estado real igual ao relatório: `npm test` 203/203.

## 1. Enquadramento

**Objetivo:** cumprir o AC9 da MEL-08: auditoria curta, em `docs/seguranca/`, de cada action do esboço do desenho da CI (§7), com o SHA de commit completo que será fixado.

**Restrições:** só leitura das actions; nada em `.github/`, sem segredo, runner ou proteção de branch (E2-5); auditar não é adotar; nenhuma tool `rea`/`ghidra`, nada em `alvos/`; não mexer em `00-seguranca.md`; não contornar gate, `cli-gate`, monetização ou `pre-commit`; commits locais, push só pelo @devops com autorização.

**Perfil do projeto:** domínio laboratório de engenharia reversa e processo de qualidade · stack Node 26 (scripts, hooks), C# .NET 10 (WPF) · integrações GitHub (repositório público), Docker (Semgrep) · UI não (nesta unidade) · dados sensíveis nenhum nesta unidade (só metadados públicos das actions) · fase AIOX implementação (story MEL-08 InProgress) · complexidade SIMPLE.

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Quais actions? | sim | Desenho §7 e handoff da E2-4a: `checkout`, `setup-node`, `setup-dotnet`, `upload-artifact`, `download-artifact` |
| Um arquivo por action ou um só? | sim | Um documento com uma seção por action: o AC9 pede "auditoria curta", e as cinco têm o mesmo mantenedor e o mesmo modelo de distribuição |
| Qual versão escolher? | sim | Mesma política da auditoria do Semgrep: não pegar publicação de poucos dias. Última versão da linha maior atual com pelo menos duas semanas; todas as cinco cumprem |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| auditoria de GitHub Actions fixadas por SHA de commit, supply chain, checkout/setup-node/upload-artifact, permissões mínimas, persist-credentials, repositório público | 7 | 0,493–0,501 |
| GitHub Actions pinning, tag mutável, tj-actions comprometida, verificar SHA da tag com `git ls-remote`, tag anotada | 7 | 0,495–0,513 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch` | Auditoria sem executar: metadados, procedência, hash, leitura estática do código | relatada (aplicada ao `rea-agents@6.4.0`) | parcial: lá era tarball npm; aqui é repositório git. O método (origem, procedência, conferência do identificador, leitura sem executar) vale | Estrutura de cada seção: origem, conferência do SHA por duas vias, leitura estática do `action.yml` e do `dist/`, nada executado |

**Descartados:** `conferir-hash-do-alvo-na-admiss-o-em-gate-pretooluse-manifes` — hash de alvo, não de dependência de CI · `classmate-connect-13-*`, `despensa-*`, `01HZ_HANDOFF_*`, `FU-002`, `re-verificacao-de-assinatura-proprietaria` — outro domínio. Nenhuma nota sobre GitHub Actions no vault.

## 3. Plano preliminar

**Workflow AIOX:** SDC, caminho curto (entrega P): @dev registra, @qa confere, QA gate na story. Story já validada (E2-1).

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | E2-4b | implementação / @dev; revisão / @qa | `docs/seguranca/auditoria-actions-ci.md`, story MEL-08 (AC9, File List, Change Log, QA Results), handoff | Cada action com versão, SHA completo conferido por duas vias, permissões, código de terceiros e downloads, mantenedor, veredito, fontes com data de acesso; nada em `.github/` | ~180k |

**Capacidades por fase:** `gh` e `git ls-remote` (leitura pública), Read/Grep/Bash; subagente `aiox-qa` para a conferência. Não carregar: tools `rea`/`ghidra`, conectores do claude.ai (desligados nesta unidade), skills de navegador.

**Verificações:**

| Entrega | Como provar |
|---|---|
| SHA de cada tag | `git ls-remote https://github.com/actions/<nome> refs/tags/<tag>*` igual a `gh api repos/actions/<nome>/git/ref/tags/<tag>`; o @qa refaz uma das duas |
| Commit assinado | `gh api repos/actions/<nome>/commits/<sha>` → `verification.verified` |
| Nada ativo | `git status` sem `.github/`; `npm test` sem regressão; `pre-commit` sem `--no-verify` |

**Riscos:** tag movida depois da auditoria — enquadramento — a CI usa o SHA, não a tag; a auditoria registra as duas · download sem verificação de integridade nas actions de setup — leitura estática — registrar como ressalva e apontar a conferência de versão que o verificador já faz.

## 4. Custo da Fase 0

Saída de `sessao.js` ao fim do passo 3 (inclui a coleta de dados das actions, feita junto):

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 25 | 149k (máx) | 2 (`deep`, sem síntese) | 14 |

## 5. Aprovação

O escopo, as restrições e o caminho curto vieram prontos no pedido da sessão-mãe (`local_c49d87ce`), que repassa o que o responsável decidiu em 2026-11-02 (divisão E2-4a/E2-4b). Sem decisão nova nesta unidade; nenhum ajuste pedido. Precedentes `aplicável`: nenhum marcado.
