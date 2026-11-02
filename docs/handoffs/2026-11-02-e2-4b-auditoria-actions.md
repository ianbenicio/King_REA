# Handoff — E2-4b: MEL-08 fatia 1, auditoria das actions (2026-11-02)

**Sessão:** `8345181b` (aberta por `local_c49d87ce`) · **Branch:** `main`, de `841788f` a `c6ea5b7` + este handoff · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) · **Story:** [MEL-08](../stories/mel-08-ci-agregada.story.md) (InProgress; ponto de controle da fatia 1 atingido) · **Push:** não feito (só pelo @devops, com autorização)

## Entregas

| Commit | Entrega |
|---|---|
| `560cf4d` | Plano da Fase 0 (E2-4a arquivado em `docs/planos/2026-11-02-e2-4a-mel08-local.md`) |
| `ac0e0d0` | **AC9:** [`docs/seguranca/auditoria-actions-ci.md`](../seguranca/auditoria-actions-ci.md), cinco actions com versão, SHA completo, permissões, downloads, mantenedor, veredito e fontes; story (Dev Notes, File List, Change Log); desenho §7 aponta para a auditoria |
| `c6ea5b7` | QA gate PASS na story; correções do @dev para QA-E24B-01 e 03; QA-E24B-02 registrado como obrigação da E2-5 |
| (este) | handoff, relatório de estado |

| Action | Versão | SHA a fixar | Veredito |
|---|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | aceitar (`persist-credentials: false`) |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` | aceitar com ressalva (Node baixado sem hash) |
| `actions/setup-dotnet` | v6.0.0 | `a98b56852c35b8e3190ac28c8c2271da59106c68` | aceitar com ressalva (SDK baixado sem hash) |
| `actions/upload-artifact` | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` | aceitar com ressalva (artefato público) |
| `actions/download-artifact` | v8.0.2 | `9000827ccba6bdab643e8b6fd33ac0654aef8333` | aceitar |

Nada em `.github/`, nenhum segredo, runner ou proteção de branch. Nenhuma tool `rea`/`ghidra`, nada lido em `alvos/` ou `saidas/`. Nenhuma action executada: só `gh api` e `git ls-remote`, com os arquivos lidos numa pasta temporária apagada depois.

## Decisões

- **@dev:** um documento só para as cinco actions (mesmo mantenedor e mesmo modelo de distribuição; o AC9 pede "auditoria curta").
- **@dev:** política de versão igual à da auditoria do Semgrep: última da linha maior atual com pelo menos duas semanas. As cinco cumprem (a mais nova é de 07/10/2026).
- **@dev:** as mitigações das actions de setup foram descritas como parciais (a checagem do verificador pega versão errada, não binário adulterado).
- Nenhuma decisão do responsável nesta unidade.

## QA

Revisor @qa independente (subagente `aiox-qa`): reconferiu os cinco SHAs pelas duas vias, assinatura, `immutable`, `action.yml`, leitura estática e `npm test` 203/203. **Verdict: PASS**, AC9 marcado, Status segue InProgress (DoD). Três issues baixas:

- **QA-E24B-01:** mecanismo do cache do NuGet indefinido e texto contraditório. Corrigido: a auditoria deixa a escolha para a E2-5 (sem cache; `cache` do setup-dotnet; ou `actions/cache`, que precisaria de auditoria própria).
- **QA-E24B-02:** o job `dotnet` do esboço (`--so notepad-core`) não puxa o `ambiente-node`, então o Node instalado ali não é conferido. Registrado na auditoria como obrigação da E2-5.
- **QA-E24B-03:** atribuí o `releases-index.json` ao script de instalação; quem o lê é o `dist/` da action. Corrigido, junto com o `post-if: success()` que faltava.

## Pendências

- **E2-5 (ativação):** decisões do responsável do desenho §9 (ativar a CI, Semgrep no Ubuntu hospedado, proteção de branch, runner próprio); escolher o cache do NuGet (QA-E24B-01); `ambiente-node` no job `dotnet` (QA-E24B-02); `if-no-files-found: error` no upload; SHAs da auditoria no YAML, sempre com o comentário da versão. Depende também da MEL-04 (E2-3) para o job `publicacao`.
- **Task da story "Auditorias das actions e adendo do Semgrep":** fica aberta até a decisão do Semgrep hospedado (adendo à auditoria do Semgrep para o Docker Engine do runner).
- Herdadas da E2-4a e não tocadas aqui: Shift físico durante a suíte WPF, `detalhe` com caminho absoluto (AC4), QA-E24A-03, 06, 07.
- `.claude/agent-memory/` (memória do subagente @qa): continua fora do git, sem commit.
- Push de `560cf4d`, `ac0e0d0`, `c6ea5b7` e deste handoff: pelo @devops, com autorização do responsável.

## Falhas e retrabalho

- A primeira escrita da linha do Change Log foi parar no fim do arquivo (depois da seção de QA da E2-4a), porque o script acrescentou ao fim em vez de procurar a tabela. Corrigido antes do commit. Lição: em story com seções depois do Change Log, inserir pela âncora da última linha da tabela.
- Duas afirmações da auditoria saíram mais fortes do que o código sustenta e foram pegas antes ou no QA: a checagem do Node é só do major (corrigido pelo @dev antes do commit) e o `releases-index.json` é da action, não do script (QA-E24B-03).
- A Fase 0 tentou carregar a skill `fase-0` e o guarda de orçamento bloqueou a primeira tentativa (tamanho desconhecido, ~5 KB); passou na segunda, depois das quatro respostas.

## Métricas (`sessao.js`, antes do handoff)

| Chamadas (principal / subagentes) | Contexto inicial / médio / máx | >200k | Escrita cache | Leitura cache | Saída | Compactações | Subagentes |
|---|---|---|---|---|---|---|---|
| 43 / 20 | 95k / 145k / 186k | 0% | 142k + 74k | 6,1M + 1,0M | 31k + 17k | 0 | 1 (`aiox-qa`, uma iteração) |

Verificações: `npm test` 203/203 no início (sem mudança em `.claude/hooks/` nem `scripts/` nesta unidade; o @qa rodou de novo, 203/203); `pre-commit` passou em todos os commits, sem `--no-verify`. Engram: 2 consultas `deep` (relevância 0,493–0,513), registradas no plano §2; nenhuma nota sobre GitHub Actions no vault. Conectores do claude.ai: 11 desligados no início e religados ao fim. O máximo ficou em 186k, um pouco acima do limite de ~180k, só na etapa final.
