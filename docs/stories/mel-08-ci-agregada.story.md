# Story MEL-08 — implantar CI por componente com resultado agregado

**Status:** InReview (fatia 1 entregue em 2026-11-02: E2-4a, agregador e sonda; E2-4b, auditoria das actions. Fatia 2, E2-5, em 2026-11-03: workflow ativo, AC1–AC6 com evidência, proteção do `main` exigindo `resultado`. PR #1 no `main` em 2026-11-03 (`e8956f5`, run do push verde); falta o novo gate @qa das correções `2d213f7` e `318d85d` para Done)
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

- [x] **AC1** — Em execução normal, todos os componentes aplicáveis contribuem para o resultado final (JSON de cada job no resumo do `resultado`). *Evidência:* [run 41641707700](https://github.com/ianbenicio/King_REA/actions/runs/41641707700) (PR #1, `7ef594b`): seis jobs verdes, resumo do `resultado` com os 20 componentes dos cinco jobs, todos aprovados.
- [x] **AC2** — Dada uma falha plantada em teste JS, em teste .NET ou numa regra Semgrep, quando a CI roda, então o `resultado` fica reprovado. *Evidência (PRs fechados sem merge):* teste JS [41642286413](https://github.com/ianbenicio/King_REA/actions/runs/41642286413) (`js`: "node --run test saiu com código 1"); teste .NET [41642356923](https://github.com/ianbenicio/King_REA/actions/runs/41642356923) (`notepad-core`); regra Semgrep [41642213475](https://github.com/ianbenicio/King_REA/actions/runs/41642213475) (`semgrep-test`); além do pedido, lint [41642186342](https://github.com/ianbenicio/King_REA/actions/runs/41642186342) (`lint`: "biome lint saiu com código 1") e publicação [41642324628](https://github.com/ianbenicio/King_REA/actions/runs/41642324628) (`gitleaks`: 1 achado). Nos cinco, só o job plantado falhou e o `resultado` ficou REPROVADO.
- [x] **AC3** — Dado um ambiente sem Docker ou um job cancelado, quando a CI roda, então o `resultado` mostra "incompleto" e não fica verde. *Evidência:* sem Docker, [run 41643942625](https://github.com/ianbenicio/King_REA/actions/runs/41643942625) (PR #8, `60a18aa` sobre a correção `2d213f7`): `semgrep-scan`, `semgrep-test` e `semgrep-mutacoes` "não executado" ("daemon do Docker inacessível"), `resultado` vermelho com "Incompleto: 3 componente(s) obrigatório(s) não executado(s)". A primeira prova ([run 41642229054](https://github.com/ianbenicio/King_REA/actions/runs/41642229054), PR #4) achou um bug: com o serviço parado, `docker info` saiu 0 e os componentes rodaram e falharam (REPROVADO em vez de INCOMPLETO); corrigido em `2d213f7`. Job cancelado não deixa JSON, e o caso "JSON faltando" é coberto pelo teste do agregador (AC7); não houve run com cancelamento.
- [x] **AC4** — Logs e artefatos contêm só resultados sintéticos; nenhum caminho de `alvos/`/`saidas/` nem variável de ambiente (revisão do primeiro PR registrada). *Evidência:* revisão dos logs do run 41641707700 nas Dev Notes (E2-5).
- [x] **AC5** — Testes WPF aparecem como categoria própria; com a sonda reprovada, o job fica "não executável neste runner", vermelho e fora dos checks obrigatórios; nunca contado como aprovado. *Evidência:* job `wpf-interativo` próprio, classe "dependente de ambiente" no agregador, e só o `resultado` é check exigido no `main`. No `windows-2025` hospedado a sonda **aprovou** e a suíte deu 76/76 (run 41641707700), então o caso da sonda reprovada não aconteceu na CI; ele está coberto pelos testes do agregador e da sonda (AC7, AC8).
- [x] **AC6** — Filtro de caminho, se adotado, tem teste que prova não ocultar verificação necessária. *Não se aplica:* nenhum filtro adotado; todo PR roda os cinco jobs. O `workflow-ci.test.mjs` prende os gatilhos exatos, e um `paths:` quebra o teste.

Fatia 1 (local, sem `.github/` ativo):

- [x] **AC7** — Dados JSON sintéticos do verificador para cada situação da tabela do desenho §5 (todos aprovados; um obrigatório falhou; um obrigatório não executado; JSON faltando; só `wpf-interativo` não executado), quando o agregador roda, então o estado final, o código de saída e a tabela do resumo (componente, estado, duração, motivo) seguem a tabela; teste no `npm test`.
- [x] **AC8** — Dado um pré-requisito da UI ausente (simulado no teste: sessão não interativa, foco ou clipboard indisponível), quando a sonda roda, então a saída só tem booleanos e o item que faltou, e a categoria WPF fica "não executável neste runner", nunca aprovada; executada localmente como usuário interativo, a sonda passa e a suíte `notepad-ui` roda, com falha de asserção contada como falha (desenho §4).
- [x] **AC9** — Cada action do esboço (desenho §7) tem auditoria curta registrada em `docs/seguranca/`, com o SHA de commit que será fixado; nenhuma action entra por tag.

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
- [x] Auditorias das actions (feita em 2026-11-02, E2-4b: [`auditoria-actions-ci.md`](../seguranca/auditoria-actions-ci.md)) e adendos do Docker Engine do runner nas auditorias do Semgrep e do gitleaks — 2026-11-03, E2-5.
- [x] Workflow (`.github/workflows/verificacao.yml`) com teste que o prende ao agregador e à auditoria — 2026-11-03, E2-5, PR #1.
- [x] PRs de falha plantada (JS, lint, .NET, Semgrep, publicação, sem Docker) — 2026-11-03, E2-5.
- [x] Correção da sondagem do Docker achada pelo PR sem Docker — 2026-11-03, E2-5.
- [x] Proteção do `main` exigindo `resultado` — 2026-11-03, E2-5.
- [x] Merge do PR #1 no `main` — 2026-11-03, com o "sim" do responsável: merge commit `e8956f5` (preserva os SHAs citados aqui), [run do push no `main`](https://github.com/ianbenicio/King_REA/actions/runs/41645374091) verde.
- [ ] Novo gate @qa das correções `2d213f7` e `318d85d` (QA-E25-01 a 03).

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
- `docs/seguranca/auditoria-actions-ci.md` — auditoria das cinco actions do esboço (AC9): versão, SHA completo conferido por duas vias, permissões, downloads, mantenedor, veredito, fontes (E2-4b).
- `docs/planos/2026-11-01-desenho-ci-mel08.md` — §7 aponta para a auditoria e os SHAs (E2-4b).
- `.github/workflows/verificacao.yml` — workflow da CI: cinco jobs e o `resultado` (E2-5).
- `scripts/verificar/workflow-ci.test.mjs` — prende o workflow ao agregador, à auditoria e às obrigações do desenho; 7 testes (E2-5).
- `scripts/verificar/agregar-ci.mjs` — `JOBS` com os cinco jobs e os componentes do `--so` (E2-5).
- `package.json` — `workflow-ci.test.mjs` no `npm test` (E2-5).
- `scripts/publicacao/gitleaks.mjs`, `gitleaks.test.mjs`, `scripts/verificar/verificar.mjs` — sondagem do daemon do Docker exige a versão do servidor (`motivoDaemonDocker`, `sondarDocker`), com teste (E2-5).
- `docs/seguranca/auditoria-semgrep-1.180.0.md`, `docs/seguranca/auditoria-gitleaks-8.30.1.md` — adendos da execução na CI (E2-5).
- `docs/seguranca/auditoria-actions-ci.md` — decisão sem cache (E2-5).
- `docs/planos/2026-11-01-desenho-ci-mel08.md` — ativo, §2, §3, §4, §7 histórico, §9 decisões (E2-5).
- `docs/plano-de-execucao.md` — plano da E2-5; o anterior foi para `docs/planos/2026-11-03-e2-3b-gitleaks.md`.

## Dev Notes (E2-4a, 2026-11-02)

- **Decisão do responsável (2026-11-02):** sonda aprovada e asserção do WPF falhando deixa o `resultado` vermelho; a tabela do desenho §5 não cobria o caso.
- **Regra do sandbox do Codex mantida:** a sonda mede pré-requisito; no Codex a falha da MEL-02 foi de asserção, então a sonda sozinha não protege ali.
- **Jobs do agregador:** `js`, `dotnet` (obrigatórios) e `wpf-interativo` (dependente de ambiente), com os componentes do desenho §2. `semgrep` e `publicacao` entram na fatia 2.
- **Evidência local (usuário interativo):** sonda direta `{"interativa":true,"sessao_de_usuario":true,"foco_de_teclado":true,"clipboard":true,"faltou":[]}`, clipboard do responsável igual antes e depois (hash conferido). `npm run verificar -- --so notepad-ui` aprovado 76/76 em três rodadas seguidas; `notepad-core` 137/137.
- **Falha intermitente observada:** numa rodada de seis, `FileLifecycleTests.New_empties_the_document_with_default_encoding_and_crlf` falhou em `Input.WithModifiers` (esperado `Control`, veio `Control | Shift`): `Shift` físico pressionado durante a suíte. Contou como falha, como manda o plano §5. A sonda não mede o estado do teclado físico; fica como pendência.
- **Para a fatia 2 (AC4):** o `detalhe` do verificador traz pilha com caminho absoluto do checkout; o agregador não o copia, mas o log do job `wpf-interativo`/`dotnet` imprimiria. Revisar antes de ativar, junto com o `motivo` (QA-E24A-03).
- **Correções do QA (QA loop, iteração 1):** QA-E24A-01 — comentário do agregador e esboço do desenho §1/§7 passam a `node scripts/verificar/verificar.mjs … --json` (o `npm run` sem `-s` põe cabeçalho antes do JSON); parser continua estrito, BOM tolerado; teste com o cabeçalho e com BOM. QA-E24A-02 — componente repetido no JSON vira "JSON do job inválido: componente repetido"; teste. QA-E24A-04 — `avaliarSonda` exige código de saída coerente com a lista do que faltou; teste. QA-E24A-05 — WPF sem JSON tem aviso próprio (`AVISO_WPF_SEM_JSON`); teste. `npm test` 203/203; `verificar --so notepad-ui` 76/76 com a sonda; agregador pela linha de comando com JSON real: sem o job `js` → 3, completo → 0. **Ficam como dívida:** QA-E24A-03 (AC4, fatia 2), QA-E24A-06 (restauração do clipboard sem nova tentativa no `Dispose` do `ClipboardScope` e token no histórico do clipboard do Windows: mexe no auxiliar da suíte de UI, MEL-02) e QA-E24A-07 (detecção em C# da sonda sem teste automatizado; Shift físico).

## Dev Notes (E2-4b, 2026-11-02)

- **Escopo:** as cinco actions do esboço e do handoff da E2-4a: `checkout` v7.0.1, `setup-node` v7.1.0, `setup-dotnet` v6.0.0, `upload-artifact` v7.0.2, `download-artifact` v8.0.2. Só leitura (`gh api`, `git ls-remote`); nada executado, nada em `.github/`.
- **Política de versão:** a da auditoria do Semgrep (última da linha maior atual com pelo menos duas semanas). As cinco cumprem.
- **Vereditos:** `checkout` e `download-artifact` aceitas; `setup-node` e `setup-dotnet` aceitas com ressalva (baixam Node e SDK sem conferir hash; a checagem de versão do verificador e o `global.json` pegam versão errada, não binário adulterado); `upload-artifact` aceita com ressalva (artefato público). Configurações obrigatórias de cada uma estão na auditoria e valem para o workflow da E2-5.
- **Recomendações novas para a E2-5** (fora do esboço original): `if-no-files-found: error` no upload; `digest-mismatch` no padrão no download; nenhuma entrada de token, espelho ou fonte nas actions de setup; `ambiente-node` no `--so` do job `dotnet` (QA-E24B-02); escolher o mecanismo do cache do NuGet (QA-E24B-01).
- **Correções depois do gate (@dev, 2026-11-02):** QA-E24B-03 — o `releases-index.json` passou a ser atribuído ao `dist/setup/index.js` da action, não ao script, e entrou o `post-if: success()` do setup-dotnet. QA-E24B-01 — a auditoria deixa o mecanismo do cache do NuGet como decisão da E2-5, com as três opções, e o veredito do setup-dotnet admite `cache`/`cache-dependency-path` só nessa escolha. QA-E24B-02 — registrado na auditoria como obrigação da E2-5. Nenhuma muda veredito nem SHA.

## Dev Notes (E2-5, 2026-11-03)

- **Decisões do responsável (2026-11-03):** ativar agora; contêineres no Ubuntu hospedado (pull por digest com rede, `run` com `--network none`, adendo nas auditorias); proteção do `main` depois do 1º PR verde; sem cache, runner próprio adiado. Detalhe no desenho §9.
- **Workflow:** cinco jobs e o `resultado`; cada job chama `verificar.mjs --so … --json` direto e publica só o JSON. `ambiente-node` primeiro em todos (QA-E24B-02). O `--so` do YAML espelha `JOBS` do agregador; o `workflow-ci.test.mjs` quebra se divergirem, se uma action sair da auditoria ou se uma obrigação cair.
- **Ambiente do runner hospedado (run 41641707700):** Node v26.12.1, .NET SDK 10.0.401; sonda WPF aprovada no `windows-2025` e `notepad-ui` 76/76; `semgrep-mutacoes` 14 s. No `js`, 5 testes do gitleaks pulados (sem binário nem Docker no Windows); eles rodam no job `publicacao`. Runner próprio continua adiado.
- **Revisão dos logs do run 41641707700 (AC4):** `alvos`/`saidas` só nas linhas da guarda; caminhos só do checkout do runner (`/home/runner/work/King_REA/King_REA`, `D:a…`); credencial do checkout mascarada (`***`) e não persistida; nenhuma variável de ambiente impressa além das `DOTNET_*` declaradas; artefatos só com o JSON do verificador (sem `detalhe` no resumo).
- **Bug achado pela falha plantada sem Docker:** no Ubuntu hospedado, com `docker.socket` e `docker.service` parados, `docker info --format {{.ServerVersion}}` saiu 0 com saída vazia. A sondagem agora exige a versão do servidor na saída (`motivoDaemonDocker`, regra pura compartilhada pelo verificador e pelo gitleaks), com teste.
- **Push protection do GitHub:** a primeira falha plantada de publicação usava uma chave sintética no formato Twilio; o GitHub recusou o push. A branch local foi apagada sem envio e refeita só com uma `api_key` genérica. Camada extra, não contornada.
- **Proteção do `main`** (API clássica): check exigido `resultado`, `strict: false`, sem force push nem exclusão; `enforce_admins` ligado depois do merge, por decisão do responsável (2026-11-03).
- **QA-E25:** 01 (desenho e auditoria das actions) e 03 (5 mutações escapadas agora reprovam o teste) resolvidas em `318d85d`; 02 (esta story) resolvida aqui; 04 (`--pull never` no `docker run`) fica como dívida opcional: o pull já fica num passo próprio, e o digest garante a imagem.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) com o desenho da CI, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
| 2026-11-02 | Validação @po: 8/10 como estava; correções aplicadas (duas fatias, AC7–AC9 da parte local, nota do Semgrep condicional, ponto de controle no DoD); 9,5/10, GO; status Draft → Ready | sessão `aade639a` (@po) |
| 2026-11-02 | Status Ready → InProgress (@dev, início da fatia 1). E2-4a: agregador (AC7) e sonda WPF (AC8) com testes; AC9 fica para a E2-4b | sessão `24b25af1` (@dev) |
| 2026-11-02 | QA gate da fatia E2-4a (AC7, AC8; commit `6abfdc1`): CONCERNS, 2 issues médias e 5 baixas, nenhuma bloqueia a fatia 1; status segue InProgress até a fatia 2 (DoD) | @qa (Quinn) |
| 2026-11-02 | Re-revisão @qa (QA loop, iteração 2) das correções do @dev, ainda não commitadas: QA-E24A-01, 02, 04 e 05 resolvidas; 03, 06 e 07 aceitas como dívida registrada; verdict final PASS para AC7 e AC8; `npm test` 203/203; status segue InProgress (DoD) | @qa (Quinn) |
| 2026-11-02 | E2-4b: auditoria das cinco actions do esboço em `docs/seguranca/auditoria-actions-ci.md` (AC9), com SHA de commit completo conferido por `git ls-remote` e API; desenho §7 aponta para ela | sessão `8345181b` (@dev) |
| 2026-11-02 | QA gate da E2-4b (AC9; commit `ac0e0d0`): PASS, 3 issues baixas para a E2-5 (cache do NuGet, checagem do Node no job `dotnet`, origem do `releases-index.json`); os cinco SHAs reconferidos por duas vias; AC9 marcado; status segue InProgress (DoD) | @qa (Quinn) |
| 2026-11-03 | E2-5: workflow ativo (PR #1, run 41641707700 verde), seis PRs de falha plantada, correção da sondagem do Docker (`2d213f7`), alinhamento do desenho e teste mais forte (`318d85d`), proteção do `main` exigindo `resultado`; AC1–AC6 marcados; status InProgress → InReview | sessão `d883db9d` (@devops, @dev) |
| 2026-11-03 | Merge do PR #1 no `main` (`e8956f5`, "sim" do responsável), run do push verde; `enforce_admins` ligado; etapa 2 encerrada. Status segue InReview até o novo gate @qa | sessão `d883db9d` (@devops) |

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

## QA Results (E2-4b, 2026-11-02)

**Revisor:** @qa (Quinn) · **Commit revisado:** `ac0e0d0` (sobre `560cf4d`) · **Escopo:** fatia 1, AC9 (auditoria das actions). AC1–AC6 (fatia 2) ficam fora deste gate. **Status:** segue InProgress (pelo DoD, só muda depois da fatia 2).

```yaml
storyId: MEL-08
escopo: "fatia 1: AC9"
commit: ac0e0d0
verdict: PASS
issues:
  - id: QA-E24B-01
    severity: low
    category: docs
    description: >-
      Cache do NuGet sem mecanismo definido. A auditoria diz que "o desenho usa o cache do NuGet pelo
      packages.lock.json" (setup-dotnet, comportamento relevante), mas o veredito manda "usar só
      global-json-file", o que exclui `cache: true`. Se a E2-5 fizer o cache com `actions/cache`, entra uma
      sexta action sem auditoria; se fizer com o `cache: true` do setup-dotnet, contraria o "só".
    recommendation: >-
      Antes ou durante a E2-5, escolher: (a) sem cache do NuGet; (b) `cache: true` e `cache-dependency-path`
      do setup-dotnet, acrescentados às configurações permitidas da auditoria; ou (c) auditar `actions/cache`.
      Em qualquer caso, `--locked-mode` continua obrigatório.
  - id: QA-E24B-02
    severity: low
    category: security
    description: >-
      A mitigação do setup-node vale só para o job `js`. O `--so js,monetizacao,sintaxe-js` puxa o
      `ambiente-node` pelas dependências (comDependencias, verificar.mjs:124), mas o job `dotnet` do esboço
      roda `--so notepad-core`, cujo fecho é dotnet-restore e notepad-build: o Node que o setup-node instala
      ali não é conferido. Além disso, o `npm ci` roda antes do verificador no job `js`. A auditoria já diz,
      corretamente, que a checagem é só do major e pega versão errada, não binário adulterado.
    recommendation: >-
      No workflow da E2-5, incluir `ambiente-node` no `--so` do job `dotnet` e ajustar a frase "como primeiro
      componente do job" para "em todo job que usa o setup-node".
  - id: QA-E24B-03
    severity: low
    category: docs
    description: >-
      Origem do releases-index.json atribuída ao script. A auditoria diz que o `install-dotnet.ps1` baixa o SDK
      "usando o índice releases-index.json"; no SHA auditado o script não cita esse índice (0 ocorrências), e
      quem o usa é o `dist/setup/index.js` da action (`DotnetCoreIndexUrl`, resolução de versão). Também falta
      o `post-if: success()` do setup-dotnet na linha de runtime. Nenhum dos dois muda o veredito.
    recommendation: "Corrigir as duas frases na próxima revisão da auditoria (por exemplo, na E2-5)."
```

**O que o @qa conferiu por conta própria (só leitura nas actions; arquivos baixados numa pasta temporária, apagada depois, nada executado):**
- **Cobertura:** o esboço do desenho §7 usa exatamente `checkout`, `setup-node`, `upload-artifact`, `setup-dotnet` e `download-artifact`, as mesmas cinco da pendência E2-4b do handoff `docs/handoffs/2026-11-02-e2-4a-mel08-local.md` e da auditoria. Nenhuma ficou de fora; o cache do npm é interno ao setup-node (cache do NuGet: QA-E24B-01).
- **SHAs, as cinco, pelas duas vias:** `git ls-remote https://github.com/actions/<nome> refs/tags/<tag> 'refs/tags/<tag>^{}' refs/tags/<maior>` e `gh api repos/actions/<nome>/git/ref/tags/<tag>`. Iguais ao documento; objeto `commit` (tag leve, sem `^{}`); a tag maior aponta para o mesmo commit.
- **Assinatura e release:** `verification.verified: true`, `reason: valid`, committer `web-flow` nas cinco; datas, autores e mensagens de commit conferem; `immutable: true` em setup-node e setup-dotnet, `false` nas outras três; nenhuma arquivada, licença MIT; a versão auditada é a última da linha maior em cada uma, todas com mais de duas semanas (a mais nova é de 07/10/2026).
- **`action.yml` no SHA:** `runs.using: node24` nas cinco, com `main`/`post` como descrito (no setup-dotnet há também `post-if: success()`); padrões `persist-credentials: true` e `fetch-depth: 1` (checkout), `cache: false` (setup-dotnet), `package-manager-cache: true` (setup-node; o nosso `package.json` não tem `packageManager` nem `devEngines`), `if-no-files-found: warn` e `include-hidden-files: false` (upload), `digest-mismatch` padrão `error` (download).
- **Leitura estática:** `externals/install-dotnet.ps1` existe, 74.981 bytes, blob `3fa90250659c…`, sem `Get-FileHash`; `dist/setup/index.js` do setup-node sem `SHASUMS` e com `nodejs.org` e `actions/node-versions` como origens; README do checkout cita credenciais num arquivo em `$RUNNER_TEMP`; README do upload-artifact diz que o repositório não aceita contribuições.
- **Repositório:** `git show --stat ac0e0d0 560cf4d` só toca `docs/`; `git ls-files .github` vazio e a pasta não existe; `.node-version` 26.12.1; `global.json` 10.0.401, `rollForward: patch`, `allowPrerelease: false`; o `ambiente-node` compara só o major (verificar.mjs:30).
- `npm test`: **203/203**, 0 falha (não era obrigatório; nada mudou em `.claude/hooks/` nem em `scripts/`).

**Os 7 checks:** 1 revisão (documento) PASS · 2 testes PASS (203/203) · 3 AC9 PASS (cinco actions, SHA completo conferido, nenhuma por tag, todos os itens pedidos por action, fontes com data de acesso) · 4 regressões PASS · 5 desempenho N/A · 6 segurança PASS (ressalvas honestas; QA-E24B-02 para a E2-5) · 7 documentação PASS com QA-E24B-01 e 03.

### Decisão

**PASS** para o AC9 (E2-4b). As três issues são baixas e entram como pendências da E2-5, que cria o workflow. Com AC7, AC8 e AC9 marcados, o ponto de controle da fatia 1 fica atendido. Status segue **InProgress**: o DoD só fecha depois da fatia 2.

## QA Results (E2-5)

**Revisor:** @qa (Quinn) · **Data:** 2026-11-03 · **Commit revisado:** `7ef594b` (branch `ci/e2-5-workflow`, PR #1, run `41641707700` verde) mais as edições não commitadas de `docs/planos/2026-11-01-desenho-ci-mel08.md` · **Escopo:** workflow, `JOBS` do agregador, `workflow-ci.test.mjs`, `package.json`, adendos das auditorias do Semgrep e do gitleaks. PRs de falha plantada (AC2, AC3) e proteção de branch ficam fora deste gate. **Status:** segue InProgress.

```yaml
storyId: MEL-08
escopo: "fatia 2: E2-5 (workflow ativado)"
commit: 7ef594b
verdict: CONCERNS
issues:
  - id: QA-E25-01
    severity: medium
    category: docs
    description: >-
      O desenho editado (não commitado) diz no cabeçalho que a CI está ativa, mas o resto contradiz o workflow:
      título "(sem ativação)"; tabela do §2 sem `ambiente-node` em nenhum job e sem `lint`/`tipos` no `js`, e o
      Semgrep ainda como "decisão do responsável; até lá, não executado"; esboço do §7 com `cache: npm`
      (contra o §3), `--so notepad-core` no `dotnet` (o problema do QA-E24B-02), `needs: [js, dotnet]` e o texto
      "continua com <sha> até a E2-5". A auditoria das actions também manda usar `cache: npm` no setup-node.
    recommendation: >-
      Antes do commit: atualizar o título e a tabela do §2 (ou apontar para `JOBS` em agregar-ci.mjs como fonte),
      marcar o §7 como esboço histórico com link para `.github/workflows/verificacao.yml`, e anotar na auditoria
      das actions que a decisão de 2026-11-03 tirou o `cache: npm`.
  - id: QA-E25-02
    severity: low
    category: docs
    description: >-
      A story não registra a E2-5: Tasks (adendo do Semgrep e workflow ainda desmarcados), File List sem
      `verificacao.yml` e `workflow-ci.test.mjs`, sem Dev Notes nem linha no Change Log.
    recommendation: "@dev atualiza Tasks, File List, Dev Notes (E2-5) e Change Log no mesmo commit da QA-E25-01."
  - id: QA-E25-03
    severity: low
    category: tests
    description: >-
      workflow-ci.test.mjs pega 23 de 28 mutações aplicadas em cópia temporária (action por tag, SHA trocado,
      --so divergente, componente novo ou removido sem job, job extra, needs parcial, cache, permissions no job e
      no topo, pull_request_target, segredo, token, -latest, upload sem if-no-files-found ou com outro path,
      action de terceiro, pull removido, SHA do tar.gz). Escapam: (a) guarda com o mesmo nome e corpo oco
      (`run: "true"`), porque o teste só conta o nome; (b) gatilho privilegiado novo (`workflow_run`), porque o
      bloco `on:` não é fixado; (c) `${{ github.event.* }}` interpolado num `run`; (d) `docker run` no YAML com
      rede; (e) `npm ci` sem `--ignore-scripts`. `continue-on-error` no verificador também escapa, mas o
      agregador lê o JSON e reprova do mesmo jeito.
    recommendation: >-
      Acrescentar ao teste: corpo exato da guarda em todo job; bloco `on:` exato (pull_request e push para main,
      workflow_dispatch); proibir `${{ github.event` e `docker run` no YAML; exigir `npm ci --ignore-scripts`.
  - id: QA-E25-04
    severity: low
    category: security
    description: >-
      "Rede só no pull" depende da ordem dos passos: o `docker run` de rodar.mjs e gitleaks.mjs não tem
      `--pull never`, então, se a imagem faltar, o próprio daemon a baixaria (sempre pelo digest). No run
      41641707700 não houve "Unable to find image": o pull antecipado funcionou.
    recommendation: "Opcional: `--pull never` nos dois `docker run`, com teste, para tornar a regra estrutural."
observacoes:
  - "O job semgrep lê IMAGEM de gitleaks.mjs, não de rodar.mjs; as duas constantes ficam presas por gitleaks.test.mjs (rodar.mjs contém a mesma string)."
  - "AC6: nenhum filtro de caminho adotado; nada a provar por enquanto."
```

**O que o @qa conferiu:**
- **Obrigações:** as cinco actions pelo SHA da auditoria com o comentário da versão (13 `uses`, nenhuma por tag ou de terceiro); `persist-credentials: false` nos 6 checkouts; `permissions: contents: read` só no topo; gatilhos `pull_request`/`push` para `main` e `workflow_dispatch`, sem `pull_request_target`; nenhum `secrets.`, token, cache, `registry-url`, espelho ou `github-token`; `ambiente-node` primeiro no `--so` dos cinco jobs (QA-E24B-02 resolvida); upload só do JSON, `retention-days: 7` e `if-no-files-found: error` nos cinco; download sem `github-token`/`run-id`, `digest-mismatch` padrão; contêiner pelo `IMAGEM` do código (digest `529ee8a2…845c3`, igual em rodar.mjs e gitleaks.mjs), pull em passo próprio, `docker run` com `--network none`, `--cap-drop ALL`, usuário 65534; gitleaks com tar.gz e executável conferidos pelos SHA-256 da tabela da auditoria (`551f6fc8…`, `88f91962…`); guarda de `alvos/`/`saidas/` em todos os seis jobs; nenhuma interpolação de `github.event` em `run`.
- **Testes:** `npm test` **275/275**, 0 falha. Mutações em cópia temporária (scripts/verificar, scripts/publicacao, workflow e auditoria copiados; nada no repositório): ver QA-E25-03.
- **Run 41641707700** (`gh run view`, só leitura): `pull_request` no `7ef594b`, seis jobs `success`; o resumo do `resultado` traz os 20 componentes dos cinco jobs, todos aprovados (evidência para o AC1), incluindo `notepad-ui` no `windows-2025` hospedado; o log menciona `alvos`/`saidas` só nas linhas da guarda (primeira leitura para o AC4, a registrar pelo @dev); download conferiu o digest dos cinco artefatos.
- **Adendos:** Semgrep e gitleaks registram a decisão de 03/11/2026, o daemon do runner como não auditado e a ausência de cache; coerentes com o YAML.

**Os 7 checks:** 1 revisão de código PASS · 2 testes PASS (275/275) · 3 critérios de aceitação: obrigações da auditoria e do desenho atendidas; AC1 com evidência no run; AC2, AC3 e AC5 (sonda reprovada) dependem dos PRs de falha plantada · 4 regressões PASS · 5 desempenho PASS (jobs paralelos, `semgrep-mutacoes` 14 s no runner) · 6 segurança PASS (QA-E25-04 opcional) · 7 documentação CONCERNS (QA-E25-01, 02).

### Decisão

**CONCERNS.** O workflow cumpre todas as obrigações conferidas e o run está verde; nenhuma issue bloqueia o merge do PR #1. Corrigir QA-E25-01 e 02 antes de commitar as edições do desenho; QA-E25-03 e 04 podem entrar com os PRs de falha plantada. Status segue **InProgress** até AC2–AC5 terem evidência.
