# Story MEL-08 — implantar CI por componente com resultado agregado

**Status:** InProgress (fatia 1 em andamento: E2-4a, agregador e sonda, entregue em 2026-11-02; E2-4b, auditoria das actions, em sessão própria; fatia 2 aguarda as decisões do responsável)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @devops, critérios @qa) · **Origem:** A04 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-08 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5 · **Desenho:** [`docs/planos/2026-11-01-desenho-ci-mel08.md`](../planos/2026-11-01-desenho-ci-mel08.md)
**Complexidade:** STANDARD · estimativa M, em duas fatias (1: local — sonda, agregador, auditorias, E2-4 do relatório de 2026-11-02; 2: ativação — workflow, PRs de falha plantada, proteção de branch, E2-5) · **Dependências:** MEL-03 (fatia 1 entregue; o verificador é o executor de cada job), MEL-04 (job `publicacao`), pendências WPF da [story MEL-02](mel-02-regressao-wpf.story.md)

## Story

**Como** responsável pelo laboratório,
**quero** que toda mudança enviada ao GitHub rode os testes de cada componente e publique um resultado agregado fiel,
**para** ver na revisão quando uma mudança no fluxo JavaScript quebra o Notepad ou as regras de detecção, sem confundir falta de ambiente com aprovação.

## Escopo

**Dentro:** workflow em `.github/workflows/` conforme o desenho (jobs `js`, `dotnet`, `semgrep`, `wpf-interativo`, `publicacao`, `resultado`); agregador dos JSON do verificador; sonda de pré-requisitos da UI WPF; auditoria curta de cada action fixada por SHA; adendo à auditoria do Semgrep para o Docker Engine do runner, se o responsável aceitar o Semgrep no Ubuntu hospedado; PRs de teste com falha plantada.
**Fora:** runner próprio; segredos; `pull_request_target`; qualquer leitura de `alvos/` ou `saidas/`; alteração de proteção de branch sem autorização (é remota, pelo @devops).

## Critérios de aceitação

- [ ] **AC1** — Em execução normal, todos os componentes aplicáveis contribuem para o resultado final (JSON de cada job no resumo do `resultado`).
- [ ] **AC2** — Dada uma falha plantada em teste JS, em teste .NET ou numa regra Semgrep, quando a CI roda, então o `resultado` fica reprovado.
- [ ] **AC3** — Dado um ambiente sem Docker ou um job cancelado, quando a CI roda, então o `resultado` mostra "incompleto" e não fica verde.
- [ ] **AC4** — Logs e artefatos contêm só resultados sintéticos; nenhum caminho de `alvos/`/`saidas/` nem variável de ambiente (revisão do primeiro PR registrada).
- [ ] **AC5** — Testes WPF aparecem como categoria própria; com a sonda reprovada, o job fica "não executável neste runner", vermelho e fora dos checks obrigatórios; nunca contado como aprovado.
- [ ] **AC6** — Filtro de caminho, se adotado, tem teste que prova não ocultar verificação necessária.

Fatia 1 (local, sem `.github/` ativo):

- [x] **AC7** — Dados JSON sintéticos do verificador para cada situação da tabela do desenho §5 (todos aprovados; um obrigatório falhou; um obrigatório não executado; JSON faltando; só `wpf-interativo` não executado), quando o agregador roda, então o estado final, o código de saída e a tabela do resumo (componente, estado, duração, motivo) seguem a tabela; teste no `npm test`.
- [x] **AC8** — Dado um pré-requisito da UI ausente (simulado no teste: sessão não interativa, foco ou clipboard indisponível), quando a sonda roda, então a saída só tem booleanos e o item que faltou, e a categoria WPF fica "não executável neste runner", nunca aprovada; executada localmente como usuário interativo, a sonda passa e a suíte `notepad-ui` roda, com falha de asserção contada como falha (desenho §4).
- [ ] **AC9** — Cada action do esboço (desenho §7) tem auditoria curta registrada em `docs/seguranca/`, com o SHA de commit que será fixado; nenhuma action entra por tag.

Nota: AC2 (parte Semgrep) e AC3 (ambiente sem Docker) supõem o Semgrep no Ubuntu hospedado. Se o responsável recusar essa opção (desenho §9), esses dois aceites voltam ao @po para revisão com ele antes da fatia 2.

## Riscos

- Runner hospedado sem sessão interativa — sonda + categoria própria; validação local continua sendo a prova da UI.
- Logs públicos vazarem dado — guarda de `alvos/`/`saidas/` e revisão do primeiro PR.
- Action de terceiro comprometida — SHA fixo e auditoria registrada.
- CI lenta desestimular uso — sem filtro no início; medir e só então filtrar, com teste.

## Decisões do responsável necessárias

Ativar a CI; Semgrep no Ubuntu hospedado; proteção de branch exigindo `resultado`; runner próprio (adiar). Detalhe no desenho, §9.

## Definition of Done

AC1–AC9 com evidência (AC1–AC6 com links de runs públicos); push e configuração remota pelo @devops com autorização; QA @qa com gate. Ponto de controle da fatia 1: AC7–AC9 marcados, `npm test` verde, nada em `.github/`; a story continua InProgress até a fatia 2.

## Tasks

- [x] Desenho (componentes, gatilhos, matriz, agregado, o que não roda em runner hospedado) — 2026-11-01.
- [x] Validação @po — 2026-11-02, GO.
- [x] Sonda WPF e agregador (locais, com teste) — 2026-11-02, E2-4a.
- [ ] Auditorias das actions e, se aprovado, adendo da auditoria do Semgrep.
- [ ] Workflow e PRs de falha plantada (após aprovação).

## File List

- `docs/planos/2026-11-01-desenho-ci-mel08.md` — desenho.
- `docs/stories/mel-08-ci-agregada.story.md` — esta story.
- `scripts/verificar/agregar-ci.mjs` — agregador do job `resultado` (AC7): lê `verificar-<job>.json`, decide o estado e escreve a tabela do resumo; não copia o `detalhe`.
- `scripts/verificar/agregar-ci.test.mjs` — 10 testes: as cinco situações do desenho §5, WPF com asserção falhando, JSON inválido ou incompleto, escape da tabela, coerência com o verificador.
- `scripts/verificar/verificar.mjs` — `avaliarSonda`, `ITENS_SONDA`, sonda antes do `notepad-ui`; saiu a recusa por `GITHUB_ACTIONS` (desenho §4); `timeout` opcional no `rodar`.
- `scripts/verificar/verificar.test.mjs` — 5 testes da sonda (item ausente simulado, saída inválida, efeito no plano); teste do GitHub Actions trocado.
- `reimplementacoes/notepad/tests/PRKingNotepad.UiProbe/` — sonda (AC8): `Program.cs`, `.csproj` (liga o `ClipboardScope.cs` dos testes de UI), `packages.lock.json` (sem pacotes).
- `reimplementacoes/notepad/PRKingNotepad.slnx` — sonda na solução (o `notepad-build` a compila).
- `package.json` — `agregar-ci.test.mjs` no `npm test`.
- `docs/contrato-ambiente.md`, `docs/planos/2026-11-01-desenho-ci-mel08.md` — requisito do `notepad-ui` e §4 atualizados.

## Dev Notes (E2-4a, 2026-11-02)

- **Decisão do responsável (2026-11-02):** sonda aprovada e asserção do WPF falhando deixa o `resultado` vermelho; a tabela do desenho §5 não cobria o caso.
- **Regra do sandbox do Codex mantida:** a sonda mede pré-requisito; no Codex a falha da MEL-02 foi de asserção, então a sonda sozinha não protege ali.
- **Jobs do agregador:** `js`, `dotnet` (obrigatórios) e `wpf-interativo` (dependente de ambiente), com os componentes do desenho §2. `semgrep` e `publicacao` entram na fatia 2.
- **Evidência local (usuário interativo):** sonda direta `{"interativa":true,"sessao_de_usuario":true,"foco_de_teclado":true,"clipboard":true,"faltou":[]}`, clipboard do responsável igual antes e depois (hash conferido). `npm run verificar -- --so notepad-ui` aprovado 76/76 em três rodadas seguidas; `notepad-core` 137/137.
- **Falha intermitente observada:** numa rodada de seis, `FileLifecycleTests.New_empties_the_document_with_default_encoding_and_crlf` falhou em `Input.WithModifiers` (esperado `Control`, veio `Control | Shift`): `Shift` físico pressionado durante a suíte. Contou como falha, como manda o plano §5. A sonda não mede o estado do teclado físico; fica como pendência.
- **Para a fatia 2 (AC4):** o `detalhe` do verificador traz pilha com caminho absoluto do checkout; o agregador não o copia, mas o log do job `wpf-interativo`/`dotnet` imprimiria. Revisar antes de ativar.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) com o desenho da CI, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
| 2026-11-02 | Validação @po: 8/10 como estava; correções aplicadas (duas fatias, AC7–AC9 da parte local, nota do Semgrep condicional, ponto de controle no DoD); 9,5/10, GO; status Draft → Ready | sessão `aade639a` (@po) |
| 2026-11-02 | Status Ready → InProgress (@dev, início da fatia 1). E2-4a: agregador (AC7) e sonda WPF (AC8) com testes; AC9 fica para a E2-4b | sessão `24b25af1` (@dev) |

## Validação @po (2026-11-02)

Checklist de 10 pontos (`story-lifecycle.md`). Nota: 1 atende, 0,5 parcial, 0 não atende.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Sem seção de contexto própria; o desenho supre (§1–§6) |
| 3 | AC testáveis | 0,5 | 1 | Nenhum AC cobria a parte local (sonda, agregador, auditorias), que é a próxima unidade; AC7–AC9 criados a partir do desenho §4, §5 e §7 |
| 4 | Escopo dentro e fora | 1 | 1 | — |
| 5 | Dependências | 1 | 1 | MEL-03, MEL-04, pendências WPF da MEL-02 |
| 6 | Complexidade | 0,5 | 1 | Duas unidades no plano §3 (itens 4 e 5) sem fatias na story; fatias declaradas |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | — |
| 9 | Definition of Done | 0,5 | 1 | Só alcançável depois da ativação; ponto de controle da fatia 1 acrescentado |
| 10 | Alinhamento com o plano | 0,5 | 0,5 | Os cinco aceites do plano §5 estão em AC1–AC5. Fica 0,5 porque AC2 e AC3 dependem da decisão do Semgrep hospedado, ainda aberta |
| | **Total** | **8** | **9,5** | **GO** |

**Correções aplicadas** (cada uma com fonte): fatias (plano de evolução §3, itens 4 e 5; relatório de 2026-11-02, E2-4 e E2-5); AC7 (desenho §5, tabela do resultado); AC8 (desenho §4, sonda; plano §5, "não executável" só por pré-requisito detectado); AC9 (desenho §7, "SHAs entram depois da auditoria de cada action"); nota do Semgrep (desenho §9); ponto de controle no DoD (checklist, ponto 9).

**Condições do GO:** a fatia 1 começa sem decisão pendente; a fatia 2 só com as decisões do desenho §9, a MEL-04 concluída e push pelo @devops com autorização.
