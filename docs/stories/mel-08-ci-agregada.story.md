# Story MEL-08 — implantar CI por componente com resultado agregado

**Status:** Draft (aguarda validação @po; desenho pronto, nada ativado)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @devops, critérios @qa) · **Origem:** A04 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-08 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5 · **Desenho:** [`docs/planos/2026-11-01-desenho-ci-mel08.md`](../planos/2026-11-01-desenho-ci-mel08.md)
**Complexidade:** STANDARD · estimativa M · **Dependências:** MEL-03 (fatia 1 entregue; o verificador é o executor de cada job), MEL-04 (job `publicacao`), pendências WPF da [story MEL-02](mel-02-regressao-wpf.story.md)

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

## Riscos

- Runner hospedado sem sessão interativa — sonda + categoria própria; validação local continua sendo a prova da UI.
- Logs públicos vazarem dado — guarda de `alvos/`/`saidas/` e revisão do primeiro PR.
- Action de terceiro comprometida — SHA fixo e auditoria registrada.
- CI lenta desestimular uso — sem filtro no início; medir e só então filtrar, com teste.

## Decisões do responsável necessárias

Ativar a CI; Semgrep no Ubuntu hospedado; proteção de branch exigindo `resultado`; runner próprio (adiar). Detalhe no desenho, §9.

## Definition of Done

AC1–AC6 com evidência (links de runs públicos); push e configuração remota pelo @devops com autorização; QA @qa com gate.

## Tasks

- [x] Desenho (componentes, gatilhos, matriz, agregado, o que não roda em runner hospedado) — 2026-11-01.
- [ ] Validação @po.
- [ ] Sonda WPF e agregador (locais, com teste).
- [ ] Auditorias das actions e, se aprovado, adendo da auditoria do Semgrep.
- [ ] Workflow e PRs de falha plantada (após aprovação).

## File List

- `docs/planos/2026-11-01-desenho-ci-mel08.md` — desenho.
- `docs/stories/mel-08-ci-agregada.story.md` — esta story.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) com o desenho da CI, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
