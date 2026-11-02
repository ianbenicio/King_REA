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
- **Para a fatia 2 (AC4):** o `detalhe` do verificador traz pilha com caminho absoluto do checkout; o agregador não o copia, mas o log do job `wpf-interativo`/`dotnet` imprimiria. Revisar antes de ativar, junto com o `motivo` (QA-E24A-03).
- **Correções do QA (QA loop, iteração 1):** QA-E24A-01 — comentário do agregador e esboço do desenho §1/§7 passam a `node scripts/verificar/verificar.mjs … --json` (o `npm run` sem `-s` põe cabeçalho antes do JSON); parser continua estrito, BOM tolerado; teste com o cabeçalho e com BOM. QA-E24A-02 — componente repetido no JSON vira "JSON do job inválido: componente repetido"; teste. QA-E24A-04 — `avaliarSonda` exige código de saída coerente com a lista do que faltou; teste. QA-E24A-05 — WPF sem JSON tem aviso próprio (`AVISO_WPF_SEM_JSON`); teste. `npm test` 203/203; `verificar --so notepad-ui` 76/76 com a sonda; agregador pela linha de comando com JSON real: sem o job `js` → 3, completo → 0. **Ficam como dívida:** QA-E24A-03 (AC4, fatia 2), QA-E24A-06 (restauração do clipboard sem nova tentativa no `Dispose` do `ClipboardScope` e token no histórico do clipboard do Windows: mexe no auxiliar da suíte de UI, MEL-02) e QA-E24A-07 (detecção em C# da sonda sem teste automatizado; Shift físico).

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) com o desenho da CI, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
| 2026-11-02 | Validação @po: 8/10 como estava; correções aplicadas (duas fatias, AC7–AC9 da parte local, nota do Semgrep condicional, ponto de controle no DoD); 9,5/10, GO; status Draft → Ready | sessão `aade639a` (@po) |
| 2026-11-02 | Status Ready → InProgress (@dev, início da fatia 1). E2-4a: agregador (AC7) e sonda WPF (AC8) com testes; AC9 fica para a E2-4b | sessão `24b25af1` (@dev) |
| 2026-11-02 | QA gate da fatia E2-4a (AC7, AC8; commit `6abfdc1`): CONCERNS, 2 issues médias e 5 baixas, nenhuma bloqueia a fatia 1; status segue InProgress até a fatia 2 (DoD) | @qa (Quinn) |
| 2026-11-02 | Re-revisão @qa (QA loop, iteração 2) das correções do @dev, ainda não commitadas: QA-E24A-01, 02, 04 e 05 resolvidas; 03, 06 e 07 aceitas como dívida registrada; verdict final PASS para AC7 e AC8; `npm test` 203/203; status segue InProgress (DoD) | @qa (Quinn) |

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

## QA Results (E2-4a, 2026-11-02)

**Revisor:** @qa (Quinn) · **Commit revisado:** `6abfdc1` · **Escopo:** fatia 1 parcial (AC7, AC8). AC9 (E2-4b) e AC1–AC6 (fatia 2) ficam fora deste gate. **Status:** segue InProgress (pelo DoD, só muda depois da fatia 2).

```yaml
storyId: MEL-08
escopo: "fatia 1 parcial: AC7, AC8"
commit: 6abfdc1
verdict: CONCERNS
issues:
  - id: QA-E24A-01
    severity: medium
    category: code
    description: >-
      O invocador documentado do agregador produz um JSON que ele não lê. agregar-ci.mjs:3 e o esboço do
      desenho §7 (linhas 82 e 88) mandam publicar com `npm run verificar -- --so … --json > verificar-<job>.json`,
      mas o `npm run` imprime o cabeçalho "> prking-rea@0.1.0 verificar" no stdout antes do JSON.
      Reproduzido pelo @qa: com `npm run`, o job dotnet virou "JSON do job inválido" (incompleto, código 3);
      com `node scripts/verificar/verificar.mjs … --json`, os três componentes aparecem aprovados.
      É fail-closed (nunca fica verde), mas, do jeito que está, a CI da fatia 2 ficaria sempre incompleta e o
      AC1 não fecharia. Os testes montam o JSON com JSON.stringify direto e não pegam o caso.
    recommendation: >-
      Antes da fatia 2, trocar o invocador no comentário e no desenho §7 por `node scripts/verificar/verificar.mjs
      … --json` (ou `npm run -s`), ou dar ao verificador uma saída em arquivo (`--json <arquivo>`). Não afrouxar
      o parser. Acrescentar um teste com o cabeçalho do npm e outro com BOM, que também vira inválido (se o
      shell do runner for o Windows PowerShell 5.1, o `>` grava em UTF-16).
  - id: QA-E24A-02
    severity: medium
    category: code
    description: >-
      Componente repetido no JSON de um job: vale o último (agregar-ci.mjs:41, `new Map(...)`). No teste do
      @qa, notepad-core "falhou" seguido de notepad-core "aprovado" deu estado final "aprovado": a falha
      some. O verificador atual não emite ids repetidos (a unicidade dos ids é testada), então o caso não é
      alcançável hoje, mas quebra a regra "falha vence" e o fail-closed para JSON malformado.
    recommendation: >-
      Em lerResultados, tratar id repetido como JSON inválido (ou ficar com o pior estado) e cobrir com teste
      no caso "JSON inválido, sem resultados, componente ausente ou estado desconhecido".
  - id: QA-E24A-03
    severity: low
    category: security
    description: >-
      O `detalhe` nunca vai para o resumo (conferido no código e no teste da situação 2), mas o `motivo` é
      texto livre e vai inteiro (agregar-ci.mjs:54). Algumas fontes do motivo podem levar dado do ambiente:
      `erro do verificador: ${erro.message}` (verificar.mjs:111; mensagens ENOENT trazem caminho absoluto) e
      o nome do usuário do sandbox do Codex (verificar.mjs:64).
    recommendation: >-
      Incluir o `motivo` na revisão do AC4 já anotada nas Dev Notes (hoje ela só cita o `detalhe`); se
      preciso, normalizar caminhos absolutos no agregador antes de escrever a tabela.
  - id: QA-E24A-04
    severity: low
    category: code
    description: >-
      O verificador ignora o código de saída da sonda (verificar.mjs:203): só a linha JSON decide. Uma sonda
      que imprimisse tudo verdadeiro e saísse com código diferente de 0 liberaria a suíte. O formato é
      validado com rigor e a sonda só imprime o que mede, então o risco é pequeno.
    recommendation: >-
      Exigir coerência: faltou vazio só vale com código 0, e faltou não vazio só com código 1; qualquer outra
      combinação vira "sonda WPF com saída inválida".
  - id: QA-E24A-05
    severity: low
    category: code
    description: >-
      Sem o JSON do wpf-interativo (job cancelado, ou suíte travada até o timeout com a sonda aprovada), a
      observação do resumo diz "WPF: não executável neste runner" (agregar-ci.mjs:70). O agregado verde segue
      o desenho §5 (o WPF não é obrigatório) e a linha da tabela mostra "JSON do job ausente", mas a frase da
      observação leva a ler o caso como pré-requisito ausente.
    recommendation: >-
      Quando o motivo do WPF for JSON ausente ou inválido, usar uma observação própria (por exemplo, "WPF: job
      sem resultado") em vez do aviso de runner.
  - id: QA-E24A-06
    severity: low
    category: code
    description: >-
      Sonda e clipboard: o ClipboardScope devolve o conteúdo, mas (a) se a restauração no Dispose encontrar o
      clipboard ocupado (ExternalException), ela não tenta de novo, e o token sintético fica no lugar do
      conteúdo do responsável (a exceção é engolida pelo Safe e o item vira false); (b) com o histórico do
      clipboard do Windows ligado (Win+V), o token "prking-sonda-<guid>" fica no histórico. Nenhum dado do
      usuário sai; a perda em (a) é rara.
    recommendation: >-
      Repetir a restauração com a mesma política do Retry e, se quiser, marcar o token com o formato
      "ExcludeClipboardContentFromMonitorProcessing" para ficar fora do histórico. Vale também para os testes de UI.
  - id: QA-E24A-07
    severity: low
    category: tests
    description: >-
      O AC8 simula o pré-requisito ausente no nível da saída da sonda (avaliarSonda e executarPlano, em JS).
      A detecção da própria sonda em C# (Safe, limite de foco, Retry) não tem teste automatizado; a prova é a
      execução local das Dev Notes. É aceitável pela dependência de ambiente e fica registrado. A falha
      intermitente por Shift físico (Dev Notes) continua pendente: a sonda não mede o estado do teclado.
    recommendation: >-
      Na fatia 2, anexar ao PR a saída da sonda no runner hospedado (o primeiro caso real de pré-requisito
      ausente) e decidir se a sonda passa a conferir modificadores pressionados.
```

### Os 7 checks

| # | Check | Resultado | Evidência |
|---|---|---|---|
| 1 | Revisão de código | CONCERNS | Os três estados estão corretos: falha vence (inclusive a do WPF, decisão do responsável); obrigatório não executado ou ausente dá incompleto; WPF não executado não reprova e aparece no resumo; nenhum obrigatório declarado dá incompleto. Fail-closed para JSON ausente, inválido, sem lista, com componente faltando ou com estado desconhecido, e para saída da sonda fora do formato (campo a mais, valor não booleano, faltou incoerente, texto). Achados QA-E24A-01 e 02 (médios) e 03 a 07 (baixos). |
| 2 | Testes unitários | PASS | `npm test`: 199/199, 0 falha (10 testes novos no agregador e 5 da sonda no verificador). |
| 3 | Critérios de aceitação | PASS (AC7, AC8) | AC7: situações 1 a 5 do desenho §5 com estado, código de saída e tabela (componente, estado, duração, motivo) testados. AC8: saída só com booleanos e a lista do que faltou (Program.cs:24-34); categoria WPF não executada e nunca aprovada (testes da sonda e situação 5); asserção falhando conta como falha (dois testes); execução local como usuário interativo pelas Dev Notes (sonda toda verdadeira, `notepad-ui` 76/76 em três rodadas). O @qa não rodou a sonda nem a suíte de UI, por restrição desta sessão. |
| 4 | Sem regressões | PASS | `npm run verificar -- --so notepad-core`: APROVADO, com dotnet-restore, notepad-build e notepad-core 137/137, código 0 (o build compila a sonda junto com a solução). A retirada da recusa por `GITHUB_ACTIONS` é intencional (desenho §4) e o teste foi trocado de acordo. |
| 5 | Desempenho | PASS | Sonda com limite de 3 s para o foco e timeout de 60 s no verificador; suíte JS em cerca de 6 s. |
| 6 | Segurança | PASS, com observação | Nada no diff lê `alvos/` ou `saidas/`; `.github/` não existe; nenhuma dependência nova (no package.json só mudou o script `test`; o `packages.lock.json` da sonda está vazio). A sonda não imprime usuário, caminho nem conteúdo do clipboard; a janela é dela e é fechada no `finally` (Program.cs:83-87). O `detalhe` não vai para o resumo. Observação QA-E24A-03 (o motivo é texto livre). |
| 7 | Documentação | PASS, com observação | `docs/contrato-ambiente.md` e o desenho §2 e §4 foram atualizados; File List e Dev Notes conferem com o diff. O invocador do esboço do §7 precisa de ajuste (QA-E24A-01). |

### Rastreabilidade AC → testes

| AC | Requisito | Teste ou evidência |
|---|---|---|
| AC7 | Todos aprovados → verde | `agregar-ci.test.mjs`, "situação 1" |
| AC7 | Obrigatório falhou → vermelho, motivo na tabela, sem o `detalhe` | "situação 2" |
| AC7 | Obrigatório não executado → incompleto | "situação 3" |
| AC7 | JSON faltando → incompleto | "situação 4"; "falha vence incompleto; nenhum JSON é incompleto" |
| AC7 | Só o WPF não executado → verde, com aviso | "situação 5" |
| AC7 | Fail-closed para JSON malformado | "JSON inválido, sem resultados, componente ausente ou estado desconhecido" (falta o id repetido, QA-E24A-02) |
| AC7 | Tabela íntegra | "motivo com barra vertical ou quebra de linha" |
| AC7 | Coerência com o verificador | "componentes declarados nos jobs existem no verificador" |
| AC8 | Item ausente simulado → não executável, com o item | `verificar.test.mjs`, "pré-requisito ausente (sessão não interativa, foco ou clipboard)" |
| AC8 | Saída fora do formato → não libera | "saída fora do formato" |
| AC8 | Sonda reprovada → `notepad-ui` não executado, suíte não roda | "sonda WPF reprovada deixa o notepad-ui não executado" |
| AC8 | Sonda aprovada + asserção falhando → falha | "sonda WPF aprovada roda a suíte"; no agregador, "WPF com a sonda aprovada e asserção falhando" |
| AC8 | Execução local real | Dev Notes (sonda, hash do clipboard, 76/76 em três rodadas); não reexecutada pelo @qa |

### Decisão

**CONCERNS.** AC7 e AC8 atendidos, testes verdes, nada em `.github/`. Os dois achados médios não afetam a fatia 1: o QA-E24A-01 é fail-closed e só aparece quando o workflow existir, e o QA-E24A-02 não é alcançável pelo verificador atual. Os dois devem ser corrigidos antes da fatia 2. O ponto de controle do DoD continua aberto por causa do AC9 (E2-4b). Status segue **InProgress**.

### Re-revisão (QA loop, iteração 2, 2026-11-02)

**Objeto:** correções do @dev no working tree, sobre o `6abfdc1`, ainda sem commit (`scripts/verificar/agregar-ci.mjs`, `agregar-ci.test.mjs`, `verificar.mjs`, `verificar.test.mjs`, `docs/planos/2026-11-01-desenho-ci-mel08.md`; bullet "Correções do QA" nas Dev Notes). O gate vale para esse conteúdo e precisa entrar no commit tal como está.

```yaml
storyId: MEL-08
escopo: "fatia 1 parcial: AC7, AC8"
iteracao: 2
verdict: PASS
issues_status:
  QA-E24A-01: resolvida   # invocador no comentário e no desenho §1/§7 trocado por `node scripts/verificar/verificar.mjs … --json`; parser estrito, só o BOM é tolerado; teste do cabeçalho do npm e do BOM
  QA-E24A-02: resolvida   # id repetido → "JSON do job inválido: componente repetido"; teste; reprodução do @qa agora dá incompleto
  QA-E24A-03: divida      # motivo como texto livre: entra na revisão do AC4 (fatia 2), anotada nas Dev Notes
  QA-E24A-04: resolvida   # avaliarSonda(texto, codigo): 0 sem falta, 1 com falta; null (sinal) é inválido; teste
  QA-E24A-05: resolvida   # AVISO_WPF_SEM_JSON quando o motivo começa com "JSON do job"; teste
  QA-E24A-06: divida      # ClipboardScope: auxiliar da suíte de UI (MEL-02)
  QA-E24A-07: divida      # detecção em C# sem teste automatizado; Shift físico
observacoes:
  - "agregar-ci.mjs, lerResultados: o BOM está como caractere literal invisível na regex; `\\uFEFF` seria mais legível. Sem efeito no comportamento (o teste do BOM passa)."
  - "Linha do WPF com 'componente ausente do JSON do job' ou 'estado desconhecido' ainda recebe o aviso de runner, não o de job sem resultado. Caso só alcançável com JSON malformado; o motivo certo aparece na tabela."
```

**O que o @qa conferiu:**
- Diff das quatro correções contra as recomendações; nenhuma afrouxa o fail-closed (o cabeçalho do npm continua inválido, e o id repetido invalida o job inteiro).
- `npm test`: **203/203**, 0 falha (4 testes novos: componente repetido, cabeçalho do npm e BOM, WPF sem JSON, código de saída da sonda).
- `npm run verificar -- --so notepad-core`: APROVADO, notepad-core 137/137, código 0.
- Reprodução dos casos da iteração 1 com JSON sintético: componente repetido → incompleto; BOM → aprovado; WPF com JSON inválido → aviso de job sem resultado.
- Como na iteração 1, o @qa não rodou a sonda nem a suíte de UI. Os 76/76 do `notepad-ui` com a sonda são do @dev (Dev Notes).

**Os 7 checks, iteração 2:** 1 revisão de código PASS · 2 testes PASS (203/203) · 3 AC7 e AC8 PASS · 4 regressões PASS · 5 desempenho PASS · 6 segurança PASS (QA-E24A-03 como dívida da fatia 2) · 7 documentação PASS.

**Decisão final: PASS** para a fatia E2-4a (AC7, AC8), com 03, 06 e 07 registradas como dívida. Status segue **InProgress**: o ponto de controle da fatia 1 ainda depende do AC9 (E2-4b), e o DoD só fecha depois da fatia 2.
