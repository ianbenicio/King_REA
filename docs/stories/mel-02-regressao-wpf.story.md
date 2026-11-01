# Story MEL-02 — regressão das quatro falhas de interface WPF do PRKing Notepad

**Status:** Done (QA no caminho curto, 2026-11-01)
**Workflow:** SDC, caminho curto para entrega P (plano de evolução §3 e §10). A causa ficou no ambiente, então a MEL-02 continua P e não passa ao ciclo completo · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Origem:** achado A04 e §5 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-02 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) · **Story anterior:** [NB5](notepad-bloco-5.story.md), cujo histórico não foi alterado
**Complexidade:** SIMPLE · estimativa P

## Story

**Como** responsável pelo PRKing Notepad,
**quero** saber por que quatro testes de habilitação de menu falharam no parecer, com o mesmo código que passou em 22/10,
**para** não corrigir o produto por um defeito que ele não tem e saber em que condição a suíte WPF é confiável.

## Contexto

O parecer rodou a suíte de UI e teve 72/76; as quatro falhas eram de habilitação de menu:

1. `Cut_copy_and_delete_are_enabled_only_with_a_selection`
2. `Undo_is_enabled_only_when_there_is_something_to_undo`
3. `Opening_a_file_cannot_be_undone` (a asserção `Editor.CanUndo` passou; falhou a do menu)
4. `Paste_is_enabled_only_with_text_on_the_clipboard`

Em 22/10 a story NB5 registrou UI 76/76 duas vezes seguidas, e `git diff 50770d5 HEAD -- reimplementacoes/notepad` está vazio. O plano manda diagnosticar nesta ordem: build, ambiente e, só se os dois não explicarem, harness ou produto. Nenhum arquivo de `reimplementacoes/notepad/` foi editado nos passos 1 e 2.

## Escopo

**Dentro:** diagnóstico (build, ambiente), verificação da suíte, registro da causa e das dependências de ambiente para a MEL-08.
**Fora:** mudança no produto ou no harness (não foi necessária); fixar o SDK com `global.json` (MEL-03); categoria de testes dependentes de ambiente na CI (MEL-08).

## Diagnóstico

### Passo 1 — build testado

| Execução | Quem compilou | Binário testado (`PRKingNotepad.dll` ao lado dos testes de UI) | SHA-256 (16 primeiros) | UI |
|---|---|---|---|---|
| Parecer, 01/11 09:57 | sessão do Codex, `dotnet test` sem `--no-build` no caminho padrão | `tests/PRKingNotepad.Ui.Tests/bin/Debug/net10.0-windows/PRKingNotepad.dll`, gravado 09:58 | `91DBA8A2D76BD781` | 72/76 (as 4 acima, também isoladas com `--no-build --filter`) |
| Esta story, caminho do QA (1) | Claude Code, `dotnet build --no-incremental --artifacts-path %TEMP%\mel02-qa-artifacts` | `…\mel02-qa-artifacts\bin\PRKingNotepad.Ui.Tests\debug\PRKingNotepad.dll` | `580927A57A003E7E` | 76/76 |
| Esta story, caminho padrão | Claude Code, `dotnet build --no-incremental` | `tests/PRKingNotepad.Ui.Tests/bin/Debug/net10.0-windows/PRKingNotepad.dll` | `D221F3D173B1B5CE` | 76/76, duas vezes seguidas (`--no-build`) |
| Esta story, caminho do QA (2), verificação final | Claude Code, `--no-incremental --artifacts-path %TEMP%\mel02-qa-artifacts-2` | `…\mel02-qa-artifacts-2\bin\PRKingNotepad.Ui.Tests\debug\PRKingNotepad.dll` | `D7B70E60AD7037B9` | 76/76, duas vezes seguidas (`--no-build`) |

Um novo `--no-incremental` no caminho padrão reproduziu o mesmo hash (`D221F3D173B1B5CE`): o build é determinístico no mesmo caminho e para o mesmo usuário. Os hashes diferem entre caminhos de saída, como esperado (o caminho do PDB fica no assembly). O binário do parecer, no mesmo caminho padrão e com o mesmo código, tem outro hash; a diferença de usuário que compilou (abaixo) é a explicação provável, não demonstrada. Esse binário foi substituído pelo build desta story; o hash dele foi registrado antes.

**Conclusão do passo 1:** com build limpo, nos dois caminhos, a suíte passa. O caminho de saída não causa as falhas.

### Passo 2 — ambiente

| Item | 22/10 (NB5) | Parecer, 01/11 | Esta story, 01/11 | Diferença? |
|---|---|---|---|---|
| SDK | 10.0.401 (handoffs NB5) | 10.0.401 | 10.0.401, único instalado (`C:\tools\dotnet`, desde 20/10) | não |
| Runtimes | — | — | NETCore, AspNetCore e WindowsDesktop 10.0.12, únicos, desde 20/10 | não |
| `global.json` | ausente | ausente | ausente | não |
| Atualizações do Windows | — | — | nenhum hotfix instalado desde 21/10 (`Get-HotFix`) | não |
| PRKing Notepad aberto | sim (travava `bin/`; QA usou `--artifacts-path`) | — | nenhum processo | não explica: os dois caminhos passaram |
| Cliente que rodou a suíte | Claude Code | **Codex**, sessão `rollout-2026-11-01T09-53-15-01a1972b…`, `sandbox_policy: workspace-write`, `network_access: false`, `[windows] sandbox = "elevated"` em `~/.codex/config.toml` | Claude Code | **sim** |
| Usuário do processo | `ianfl` (sessão interativa) | **`CodexSandboxOffline`**, usuário local do sandbox elevado do Codex (último logon hoje). Inferido pelo nome do usuário e pela política sem rede da sessão; o log do sandbox não registra o usuário por comando | `desktop-q011tk0\ianfl`, sessão 3, `UserInteractive = True` | **sim** |

Fontes do Codex lidas só para metadados (comandos, política de sandbox, resultados): `~/.codex/sessions/2026/11/01/rollout-2026-11-01T09-53-15-*.jsonl`, `~/.codex/config.toml` (seção `[windows]`) e `Get-LocalUser`. O clipboard do responsável não foi lido nem alterado por esta story; os testes usam o `ClipboardScope`, que guarda e devolve todo formato legível (commit `9fb0281`).

**Conclusão do passo 2:** a única diferença encontrada entre as execuções que falharam e as que passaram é o processo que rodou a suíte: o sandbox elevado do Codex, com o usuário `CodexSandboxOffline`, contra o usuário interativo nas execuções do Claude Code. Mesmo código, SDK, runtime, máquina e Windows.

### Passo 3 — harness ou produto

Não foi aberto: os passos 1 e 2 explicam a diferença. Nenhum arquivo de `reimplementacoes/notepad/` foi alterado.

## Causa

**Classificação: ambiente**, nas quatro falhas. As quatro só falham quando a suíte roda pelo sandbox elevado do Codex (`CodexSandboxOffline`). Com o usuário interativo, passam a partir de build limpo, nos dois caminhos de saída.

| Classe | Descartada? | Evidência |
|---|---|---|
| Build | sim | Build `--no-incremental` no caminho do QA e no padrão: 76/76. Build determinístico no caminho padrão (hash igual em dois builds) |
| Ambiente | **é a causa** | Mesma máquina, SDK, runtime e Windows; muda só o usuário e o sandbox do processo de teste |
| Harness | não investigado (passo 3 não necessário) | Passa sem mudança e sem sleeps |
| Produto | não investigado (passo 3 não necessário) | Mesmo código passou em 22/10 e hoje; sem mudança versionada desde `50770d5` |

**Mecanismo, hipótese não demonstrada:** os quatro testes leem `IsEnabled` dos itens do menu Editar depois de `CommandManager.InvalidateRequerySuggested()`. O `CanExecute` de Recortar, Copiar, Excluir, Desfazer e Colar segue o foco de teclado até o editor. Num processo de outro usuário, sem desktop interativo ou sem foco de teclado, esse roteamento pode partir de outro elemento e dar outro resultado. Isso não foi reproduzido aqui: reproduzir exigiria rodar como `CodexSandboxOffline` ou mudar a configuração do sandbox, e as duas coisas ficam fora desta story.

**Limite:** um defeito latente do produto ou do harness que só aparece sem foco de teclado não está excluído. Ele só importaria para o uso real se o Notepad rodasse fora de uma sessão interativa, o que não é o caso de uso do produto.

## Critérios de aceitação

- [x] **AC1** — Causa de cada falha documentada e classificada (ambiente), com a evidência que descartou as anteriores (tabelas dos passos 1 e 2 e da causa).
- [x] **AC2** — Os quatro cenários e a suíte WPF passam em duas execuções consecutivas, a partir de build limpo, sem alterações intermediárias: caminho padrão (`D221F3D173B1B5CE`) e caminho do QA (`D7B70E60AD7037B9`), 76/76 nas duas rodadas de cada um.
- [x] **AC3** — Estabilidade sem sleeps arbitrários nem remoção de asserções: nenhum arquivo do Notepad foi alterado; os auxiliares continuam revalidando por `CommandManager.InvalidateRequerySuggested()` e `Ui.DoEvents()`, com o submenu aberto.
- [x] **AC4** — Dependências de estado do sistema listadas para a MEL-08 (seção abaixo).
- [x] **AC5** — Testes do Core e conformidade de abertura e gravação continuam verdes: Core 137/137 em todas as execuções.

## Pendências para a MEL-08 (testes dependentes de ambiente)

- **Usuário e sessão interativos.** A suíte WPF só é válida rodando como o usuário logado, numa sessão interativa. No sandbox elevado do Codex (`CodexSandboxOffline`), quatro testes de menu falham. Até a MEL-08, rodar `npm run test:notepad` / `dotnet test` da UI pelo Claude Code ou por terminal do responsável. No Codex, rodar com escalonamento para fora do sandbox ou não rodar. Resultado no sandbox não conta como falha nem como aprovação do produto.
- **Pré-requisito detectável.** Para a categoria "não executável neste runner", candidatos a checar antes da suíte: `Environment.UserInteractive`, identidade do processo (usuário do sandbox) e se a janela de teste recebe foco de teclado. Escolher na MEL-08 com evidência; reconhecer o teste como "de foco" não basta (regra do plano).
- **Clipboard.** O teste de Colar usa a área de transferência real, protegida pelo `ClipboardScope`. Num runner hospedado, a área de transferência pode não existir ou ser de outra sessão.
- **Foco e menus.** Os testes de habilitação abrem submenus e dependem do roteamento de comandos pelo foco.
- **Programa aberto trava `bin/`.** Com o PRKing Notepad do responsável aberto, compilar com `--artifacts-path` (lição da NB5).
- **SDK sem `global.json`.** Hoje há um só SDK na máquina; a fixação fica com a MEL-03.
- **Reprodução no sandbox.** Fica pendente reproduzir as quatro falhas no Codex e testar a hipótese do foco. Isso confirmaria o mecanismo e daria o pré-requisito a detectar.

## Tasks

- [x] Passo 1: build limpo no caminho do QA e no padrão, com o binário de cada execução registrado.
- [x] Passo 2: inventário de ambiente comparado com 22/10 e com o parecer.
- [x] Passo 3: não necessário (registrado).
- [x] Verificação: duas execuções seguidas a partir de build limpo.
- [x] Pendências para a MEL-08.

## File List

- `docs/stories/mel-02-regressao-wpf.story.md` — esta story (diagnóstico, causa, verificação, pendências).

Nenhum arquivo de `reimplementacoes/notepad/` alterado. Os builds gravaram só em `bin/` e `obj/` (fora do git) e em `%TEMP%`.

## QA Results

**Gate:** PASS (caminho curto, @dev + @qa).

| Verificação | Resultado |
|---|---|
| `dotnet build PRKingNotepad.slnx --no-incremental` (padrão e `--artifacts-path`) | 0 avisos, 0 erros |
| `dotnet test --no-build`, caminho padrão, 2× | Core 137/137, UI 76/76 nas duas |
| `dotnet test --no-build --artifacts-path`, caminho do QA, 1× no primeiro build e 2× no build da verificação final | Core 137/137, UI 76/76 nas três |
| `git status -- reimplementacoes/notepad` | sem mudança |

**Limitações:** o mecanismo fica como hipótese (ver "Causa"); a falha não foi reproduzida no sandbox do Codex por esta story.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-02; caminho curto P, sem validação @po separada (plano de evolução §3) | sessão `ed91c88e` |
| 2026-11-01 | Draft → InProgress: diagnóstico iniciado (passos 1 e 2, sem edição) | @dev |
| 2026-11-01 | InProgress → InReview: causa classificada como ambiente; passo 3 não necessário | @dev |
| 2026-11-01 | InReview → Done: gate PASS | @qa |
