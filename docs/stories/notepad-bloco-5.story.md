# Story NB5 — PRKing Notepad, bloco 5: conformidade e lacunas

**Status:** InProgress (U2 em 2026-10-22; validada por @po em 2026-10-21, ver "Validação @po")
**Workflow:** SDC + QA Loop (máx. 2 iterações) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Matriz:** [`reimplementacoes/notepad/CONFORMIDADE.md`](../../reimplementacoes/notepad/CONFORMIDADE.md) · **Roteiro:** [`registros/notepad-reimpl/roteiro-confirmacao.md`](../../registros/notepad-reimpl/roteiro-confirmacao.md)
**Complexidade:** STANDARD · estimativa M (8 pontos): muitos itens pequenos, um risco técnico (testes de UI WPF em processo)

## Story

**Como** responsável pelo PRKing Notepad,
**quero** que cada item das §1–§11 da especificação esteja implementado, coberto por teste automatizado ou por teste manual registrado, e que as lacunas da especificação estejam respondidas,
**para** fechar a v1 com prova item a item, e não por impressão.

## Contexto

A U1 (esta story) cruzou a especificação com o código dos blocos 1–4: 134 linhas, 42 ok, 72 sem teste (61 para teste de UI, 11 só manuais), 6 linhas divergentes (3 divergências: D1, D2, D3), 7 a confirmar no original, 7 fora do escopo. Não existe teste de interface; os 101 casos atuais são do `PRKingNotepad.Core`.

Sala limpa (valem para toda a story): o trabalho em `reimplementacoes/notepad/` lê só a especificação e o próprio código. Nada de `alvos/`, `saidas/`, evidência, REA ou Ghidra. O comportamento do original só entra pela folha de respostas do roteiro, que o responsável preenche usando o Bloco de Notas normalmente, e vira adendo datado na especificação.

## Escopo

**Dentro:** D1–D3; adendo da spec com as respostas R1–R7 e o que delas decorrer no código ou no README; pontos de troca para teste (mensagens, caminho das preferências, documentos recentes, novo processo, hora atual); testes do Core faltantes; projeto de testes de UI em processo; lista de teste manual; QA gate.

**Fora:** tudo que a matriz marca "fora do escopo" (Ctrl+E, enviar comentários, EFS, `/P` `/PT`, GB18030, restauração após reinício); FlaUI ou qualquer pacote novo (se a U3 encontrar item que o modo em processo não alcança, para e pergunta); mudanças em `scripts/`, `.claude/hooks/` e no global; empacotamento e instalador.

## Dependências

| Depende de | Para | Bloqueia |
|---|---|---|
| Folha de respostas do roteiro (responsável) | AC-U2.4 e o que decorrer dele | só AC-U2.4; D1–D3 e AC-U2.5–U2.7 começam sem ela |
| U2 (pontos de troca, AC-U2.6) | U3 testar mensagens e preferências sem tocar no `%APPDATA%` real nem na lista de recentes do Windows | U3 |
| U2 e U3 concluídas | U4 | U4 |

## Critérios de aceitação

### U2 — correções (@dev, sessão nova, ~180k)

- [x] **AC-U2.1 (D1)** — *Dado* um documento alterado, *quando* o usuário pede Novo, Abrir, solta um arquivo na janela ou fecha a janela, *então* aparece uma caixa própria (WPF) com o nome do documento e os botões **Salvar / Não salvar / Cancelar**; Cancelar (ou Salvar seguido de cancelar o Salvar como) mantém o documento e a janela como estavam; Não salvar segue sem gravar. Os quatro gatilhos passam pelo mesmo ponto (`ConfirmDiscard`). Matriz: 6.1.a, 6.2.a, 6.8.a, 11.b.
- [x] **AC-U2.2 (D2)** — *Dado* um arquivo de 1 GiB ou mais, *quando* o usuário tenta abri-lo, *então* a mensagem sai como **aviso** (não erro), com o nome do arquivo, e o documento atual não muda. Matriz: 11.c.
- [x] **AC-U2.3 (D3)** — "Diferenças" do README ganha o item 12: a fonte grava nome, tamanho, negrito e itálico; o conjunto de caracteres não é gravado (WPF em Unicode); pesos intermediários ficam no nome da família; tamanho inicial da janela 900 × 600 centralizado. Matriz: 5.2.c, 9.b, 9.e.
- [x] **AC-U2.4 (roteiro)** — *feito na U2b (2026-10-22), com a folha de respostas.* — *Dada* a folha de respostas, *então* `registros/notepad-reimpl/especificacao.md` ganha um adendo datado (seção nova no fim, sem reescrever as anteriores) com R1–R7 em palavras próprias, cada um marcado "confirmado" ou "não observável"; e cada resposta tem destino aplicado conforme a tabela "Itens a confirmar" da matriz: mudança no código **com teste**, ou item de "Diferenças" no README. Nenhuma mudança de código sem resposta que a justifique.
- [x] **AC-U2.5 (testes do Core)** — testes novos no `PRKingNotepad.Core.Tests` para: nomes exibidos das quebras de linha e das codificações (5.4.d, 5.4.e); o JSON das preferências não tem campo de zoom (5.3.c); textos das mensagens de erro de arquivo com o nome (6.2.c, 11.d), depois de mover a montagem do texto (`DescribeFileError`) para o Core.
- [x] **AC-U2.6 (pontos de troca para teste)** — a janela principal recebe, por construtor ou propriedade interna, substitutos para: perguntas e mensagens ao usuário; caminho do arquivo de preferências; registro nos documentos recentes; abertura de novo processo; hora atual. O app real usa os mesmos comportamentos de hoje. Nenhum pacote novo.
- [x] **AC-U2.7 (fechamento)** — `dotnet build PRKingNotepad.slnx` sem avisos; `dotnet test PRKingNotepad.slnx` verde com mais de 101 casos; matriz atualizada (D1–D3 e R1–R7 com status final); `git diff --stat` só em `reimplementacoes/notepad/` e no adendo da spec; commit `fix:`/`feat:` local; handoff em `docs/handoffs/`.

### U3 — testes de interface em processo (@dev, sessão nova, ~180k)

- [x] **AC-U3.1 (projeto)** — projeto `tests/PRKingNotepad.Ui.Tests` (xUnit, `net10.0-windows`, WPF) na solução, com `packages.lock.json`, usando **só pacotes e versões já travados** em `PRKingNotepad.Core.Tests`. A janela roda numa thread STA própria com `Dispatcher`, criada por um auxiliar do projeto; nada de FlaUI, UI Automation externa ou outro pacote.
- [x] **AC-U3.2 (isolamento)** — nenhum teste grava no `%APPDATA%` real, nos documentos recentes do Windows nem abre processo; todos usam os substitutos do AC-U2.6 e pastas temporárias apagadas no fim.
- [x] **AC-U3.3 (cobertura)** — toda linha da matriz com "U3" em "Próximo" (61) tem teste de UI citado na coluna "Teste" e passa a **ok**; em especial: cada atalho da §2 enviado como tecla à janela (não só o comando); habilitação de Recortar/Copiar/Excluir/Desfazer/Colar (2.ae–2.ag); F3 sem termo abre Localizar; Substituir tudo desfeito com **um** Ctrl+Z (4.1.g); Ir para linha com linha inexistente mantém a caixa aberta (4.2.c); Ln/Col com quebra ligada (5.1.c); `.LOG` põe o cursor no fim e o asterisco no título (6.5.a); perda em ANSI: Cancelar não grava, OK grava e recarrega (6.3.d); Configurar página abre sem impressora (10.a).
- [x] **AC-U3.4 (itens de risco)** — *Dado* o teste de Alt+Backspace (2.i), Ctrl+Insert (2.k) e Colar com a área de transferência sem texto (2.ag), *quando* o comportamento do `TextBox` não bastar, *então* a correção mínima (`KeyBinding` ou `CanExecute` próprio) entra num commit `fix:` separado na própria U3, com o teste que a prova.
- [x] **AC-U3.5 (estabilidade)** — `dotnet test` do projeto de UI verde **duas vezes seguidas** sem mudar nada entre as execuções; nenhum teste depende de tempo de espera fixo (`Thread.Sleep`) para passar.
- [x] **AC-U3.6 (manuais)** — `CONFORMIDADE.md` ganha a seção "Teste manual" com as 11 linhas "manual" (e as partes manuais de linhas mistas), cada uma com passos curtos e campo de resultado, para o responsável executar antes do gate.
- [x] **AC-U3.7 (fechamento)** — commit `test:` local; handoff em `docs/handoffs/`.

### U4 — QA gate (@qa → @dev pelo QA Loop, sessão nova, ~180k)

- [ ] **AC-U4.1** — `/code-review` do diff U2–U3 executado; cada achado corrigido ou aceito pelo responsável, com registro na seção "QA Results".
- [ ] **AC-U4.2 (sala limpa)** — `git diff --stat` das unidades U2–U4 só em `reimplementacoes/notepad/`, `docs/` e no adendo da spec; busca nos transcripts das sessões U1–U4 sem `Read`/`Grep` em `alvos/` ou `saidas/` e sem chamada a tool `mcp__rea__*` ou `mcp__ghidra__*`.
- [ ] **AC-U4.3 (matriz final)** — nenhuma linha "divergente"; nenhuma "sem teste" fora das manuais; "a confirmar" só onde o adendo disser "não observável"; contagem de títulos §1–§11 ainda 28/28.
- [ ] **AC-U4.4 (manuais)** — seção "Teste manual" preenchida pelo responsável, ou pendência aceita por ele (veredito CONCERNS/WAIVED registrado).
- [ ] **AC-U4.5 (fechamento)** — veredito PASS, ou CONCERNS aceito pelo responsável; story `Done`; handoff final com as métricas do `sessao.js` das quatro sessões; nota curta no Engram apontando o handoff (sem conteúdo do alvo).

## Critério de pronto (story inteira)

Todos os ACs acima marcados; build sem avisos; testes do Core e de UI verdes; `pre-commit` passando sem `--no-verify`; nada enviado ao GitHub (push só por @devops com autorização).

## Riscos

| Risco | Onde | Mitigação |
|---|---|---|
| Caixas nativas (`MessageBox`, Abrir/Salvar, Fonte, Imprimir) travam a thread de teste | U3 | AC-U2.1 troca a pergunta de salvar por janela WPF; AC-U2.6 põe as mensagens atrás de um substituto; Abrir/Salvar/Fonte/Imprimir ficam manuais |
| Testes WPF instáveis (dispatcher, foco, layout) | U3 | thread STA própria por teste ou por classe; esperar o `Dispatcher` ficar ocioso em vez de dormir; AC-U3.5 |
| Folha de respostas demorar | U2 | AC-U2.4 é o único bloqueado; o resto da U2 segue |
| "Corrigir" uma diferença deliberada | U2 | README "Diferenças" conferida na U1; a matriz cita a Dif. em cada linha afetada |
| Contaminação da sala limpa ao aplicar respostas | U2 | resposta entra primeiro na spec (adendo), depois no código; código nunca cita o original |
| Sessão passar de ~200k | todas | handoff e sessão nova (regra do S3) |

## Valor

Fecha a v1 do PRKing Notepad com prova item a item e dá ao S3 do Harness quatro sessões medidas de uma mesma unidade de trabalho.

## Tasks

- [x] U1 — matriz de conformidade (`reimplementacoes/notepad/CONFORMIDADE.md`)
- [x] U1 — roteiro de confirmação (`registros/notepad-reimpl/roteiro-confirmacao.md`)
- [x] U1 — esta story e validação @po
- [x] Responsável — aceitar os destinos de D1–D3 (2026-10-22)
- [x] Responsável — preencher a folha de respostas do roteiro (2026-10-22)
- [x] U2 — AC-U2.1, U2.2, U2.3, U2.5, U2.6
- [x] U2b — AC-U2.4 e fechamento do AC-U2.7 (R1–R7 com status final)
- [x] U3 — AC-U3.1 a AC-U3.7
- [ ] U4 — AC-U4.1 a AC-U4.5

## Validação @po (leve, checklist de 10 pontos)

| # | Ponto | Nota | Observação |
|---|---|---|---|
| 1 | Título claro e objetivo | ✓ | |
| 2 | Descrição completa (problema/necessidade) | ✓ | Números da matriz no contexto |
| 3 | ACs testáveis (Dado/Quando/Então) | ✓ | Os de comportamento em Dado/Quando/Então; os de entrega, com verificação objetiva (comando, contagem) |
| 4 | Escopo com dentro e fora | ✓ | |
| 5 | Dependências mapeadas | ✓ | Tabela; AC-U2.4 é o único bloqueado pela folha de respostas |
| 6 | Estimativa de complexidade | ✓ | STANDARD, M (8 pontos), três sessões de ~180k depois desta |
| 7 | Valor de negócio | ✓ | |
| 8 | Riscos documentados | ✓ | |
| 9 | Critério de pronto | ✓ | |
| 10 | Alinhamento com a fonte | ✓ | Unidades, limites e verificações batem com `docs/plano-de-execucao.md` §3; ACs derivados das linhas da matriz (IDs citados) |

**Decisão: GO (10/10).** Observações, sem bloquear:
- AC-U3.3 é grande (61 linhas). Se a U3 passar de ~200k, fechar com handoff e continuar em sessão nova é aceitável; dividir por grupo da matriz (§2, §4–§5, §6, §10–§11).
- A U2 precisa de decisão do responsável em R1, R2, R5 e R7 quando a resposta mostrar diferença ("copiar ou registrar no README"): perguntar na U2, não decidir sozinho.
- Os 11 itens manuais dependem do responsável; prever isso antes de marcar a U4.

## Aprovações do responsável

| Data | Unidade | O quê | Palavras do responsável |
|---|---|---|---|
| 2026-10-22 | U2 | Destinos de D1–D3 aceitos como na matriz; U2 iniciada em sessão nova; folha do roteiro chega depois | "Aceito D1–D3 como estão. Pode iniciar a U2 em sessão nova; a folha do roteiro eu mando depois." |
| 2026-10-22 | U2b | Folha do roteiro R1–R7 preenchida; R7: preservar as quebras como o original; R2: manter a Dif. 6; U2b antes da U3 | R7 = "Copiar o original"; R2 = "Manter Dif. 6"; ordem = "U2b antes da U3" |

## Notas da U2 (@dev)

- **AC-U2.6, escopo:** além da janela principal, `GoToLineWindow` e `PageSetupWindow` recebem o mesmo `IUserDialogs` da janela principal. Os avisos delas (linha inexistente, margem inválida) usavam `MessageBox` e travariam os testes 4.2.c e 10.a da U3.
- **AC-U2.6, interno:** `InternalsVisibleTo("PRKingNotepad.Ui.Tests")` em `AssemblyInfo.cs`, para a U3 usar o construtor interno `MainWindow(MainWindowServices)`.
- **AC-U2.7, parcial:** build sem avisos e 125 casos verdes (68 métodos); D1–D3 com status final na matriz; R1–R7 seguem "a confirmar" até a folha. O diff também toca `docs/` (story e handoff), como na U1.
- Não verificado na U2: a janela `SaveChangesWindow` na tela (só compilada). Fica para a U3 ou para o teste manual.

## Notas da U2b (@dev)

- **AC-U2.4:** adendo §14 na especificação (R1–R7 e a nota da versão: Windows 10 22H2, compilação 19045.6466, contra 10.0.19041.4522 da spec). Destinos: R7 mudou o código; R1, R3, R4, R5 e R6 já batiam com o original (conferido no código); R2 mantém a Dif. 6; README Dif. 3, 6, 7 e 9 ajustadas.
- **R7, desenho:** o editor continua em CRLF. `LineBreakMap` (Core) guarda só as quebras do arquivo que diferem do tipo do documento, pela posição no texto do editor; `OnTextChanged` desloca as posições a cada edição; quebra apagada ou partida é esquecida; a gravação devolve as guardadas e põe as demais no tipo do documento. Substituir tudo acompanha troca por troca (`TextFinder.ReplaceAll` com o mapa), porque a troca do texto inteiro apagaria o mapa.
- **R7, limite:** Desfazer de uma quebra apagada a traz no tipo do documento (Dif. 3). A semântica dos deslocamentos de `TextChangedEventArgs.Changes` com várias mudanças num evento só se prova pela janela (U3).
- **AC-U2.7:** build sem avisos; 134 casos verdes (eram 125); matriz com 0 "a confirmar". O diff também toca o README e `docs/` (story e handoff).

## Notas da U3 (@dev)

- **AC-U3.2, pontos de troca novos:** a linha de comando do processo de teste (o executor do `dotnet test`) virava caminho de arquivo em `OpenFromCommandLine`, e a janela perguntaria se cria esse arquivo. `MainWindowServices` ganhou `CommandLineArguments`, `ChooseFileToOpen`, `ChooseFileToSave`, `DefaultPrintQueue` e `MaxFileBytes` (padrão = comportamento real), num commit `refactor:` separado. Sem eles, 6.7.d, 11.a, 6.3.a, 10.a ("sem impressora") e 11.c (arquivo de 1 GB) não teriam teste isolado.
- **AC-U3.3, contagem:** 81 linhas tocadas, não 61: a U2 e a U2b acrescentaram partes de UI a linhas "ok" (5.4.d, 6.2.c, 11.d, 8.e e outras), e 2.b ganhou teste do atalho. Nenhuma linha fica com U3 em "Próximo".
- **AC-U3.4:** Alt+Backspace, Ctrl+Insert e Colar sem texto funcionam pelo `TextBox`; nenhum `fix:` de atalho. O WPF só revalida a habilitação de um submenu quando ele abre: o teste abre o menu Editar para ler o estado.
- **8.e, defeito achado:** o Desfazer do Substituir tudo trocava o texto inteiro e esquecia todas as quebras misturadas guardadas. Correção (`fix:`): a troca é feita ocorrência por ocorrência, do fim para o início, dentro de `BeginChange`/`EndChange` (uma unidade de desfazer). O teste prova digitar, Substituir tudo com quatro trocas entre quebras guardadas, Desfazer e Refazer, comparando os bytes gravados. O parâmetro `lineBreaks` de `TextFinder.ReplaceAll` ficou sem uso na janela (só nos testes do Core).
- **Teclas:** os modificadores vão para o estado de teclado da própria thread de teste (`SetKeyboardState`), que é o que o WPF consulta ao comparar atalhos; nenhum outro programa vê. A área de transferência é usada por 2.j, 2.k, 2.l e 2.ag; o texto que estava nela volta no fim do teste.

## File List

- `reimplementacoes/notepad/CONFORMIDADE.md` (novo, U1)
- `registros/notepad-reimpl/roteiro-confirmacao.md` (novo, U1)
- `docs/stories/notepad-bloco-5.story.md` (novo, U1)
- `docs/handoffs/2026-10-22-notepad-b5-u1.md` (novo, U1)
- `reimplementacoes/notepad/src/PRKingNotepad.Core/FileMessages.cs` (novo, U2)
- `reimplementacoes/notepad/src/PRKingNotepad/SaveChangesWindow.xaml`, `SaveChangesWindow.xaml.cs` (novos, U2)
- `reimplementacoes/notepad/src/PRKingNotepad/UserDialogs.cs`, `MainWindowServices.cs` (novos, U2)
- `reimplementacoes/notepad/src/PRKingNotepad/MainWindow.xaml.cs`, `MainWindow.Display.cs`, `MainWindow.Printing.cs`, `GoToLineWindow.xaml.cs`, `PageSetupWindow.xaml.cs`, `AssemblyInfo.cs` (U2)
- `reimplementacoes/notepad/tests/PRKingNotepad.Core.Tests/MessageTests.cs` (novo, U2), `SettingsTests.cs` (U2)
- `reimplementacoes/notepad/CONFORMIDADE.md`, `README.md` (U2)
- `docs/handoffs/2026-10-22-notepad-b5-u2.md` (novo, U2)
- `registros/notepad-reimpl/especificacao.md` (adendo §14, U2b)
- `reimplementacoes/notepad/src/PRKingNotepad.Core/LineEndings.cs`, `TextCodec.cs`, `TextFinder.cs` (U2b)
- `reimplementacoes/notepad/src/PRKingNotepad/MainWindow.xaml.cs` (U2b)
- `reimplementacoes/notepad/tests/PRKingNotepad.Core.Tests/LineEndingTests.cs` (U2b)
- `reimplementacoes/notepad/CONFORMIDADE.md`, `README.md` (U2b)
- `docs/handoffs/2026-10-22-notepad-b5-u2b.md` (novo, U2b)
- `reimplementacoes/notepad/src/PRKingNotepad/MainWindowServices.cs`, `MainWindow.xaml.cs`, `MainWindow.Printing.cs` (pontos de troca, U3)
- `reimplementacoes/notepad/src/PRKingNotepad.Core/TextFinder.cs`, `MainWindow.xaml.cs`, `tests/PRKingNotepad.Core.Tests/SearchTests.cs` (correção do Substituir tudo, U3)
- `reimplementacoes/notepad/tests/PRKingNotepad.Ui.Tests/` (novo, U3: projeto, `packages.lock.json`, `Ui.cs`, `Input.cs`, `FakeDialogs.cs`, `Notepad.cs`, `ClipboardScope.cs`, `WindowAndShortcutTests.cs`, `SearchAndDisplayTests.cs`, `FileLifecycleTests.cs`)
- `reimplementacoes/notepad/PRKingNotepad.slnx`, `CONFORMIDADE.md` (U3)
- `docs/handoffs/2026-10-22-notepad-b5-u3.md` (novo, U3)

## QA Results

(U4)

## Change Log

| Data | Unidade | Mudança |
|---|---|---|
| 2026-10-21 | U1 | Story criada (@sm) a partir da matriz — status Draft |
| 2026-10-21 | U1 | Validação leve @po: GO 10/10 — status Draft → Ready |
| 2026-10-22 | U2 | Responsável aceitou D1–D3; AC-U2.1–U2.3, U2.5, U2.6 feitos; AC-U2.4 pendente (folha do roteiro) — status Ready → InProgress |
| 2026-10-22 | U2b | Folha do roteiro aplicada: AC-U2.4 e AC-U2.7 feitos; R7 preserva as quebras; status segue InProgress (U3 e U4 pendentes) |
| 2026-10-22 | U3 | AC-U3.1–U3.7 feitos: 76 testes de interface, 81 linhas da matriz para ok, seção "Teste manual"; Substituir tudo corrigido (Desfazer mantém quebras misturadas); status segue InProgress (U4 pendente) |
