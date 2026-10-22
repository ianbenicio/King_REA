# Conformidade — PRKing Notepad × especificação (§1–§11)

**Data:** 2026-10-21 · **Unidade:** U1 do bloco 5 (S3 do Harness) · **Base:** `main` @ `f28204a` · **Fonte única:** [`registros/notepad-reimpl/especificacao.md`](../../registros/notepad-reimpl/especificacao.md)

Sala limpa: esta matriz foi feita lendo só a especificação e `reimplementacoes/notepad/`. Nenhum arquivo de `alvos/` ou `saidas/` foi aberto e nenhuma tool de engenharia reversa foi chamada.

**Estado de partida:** `dotnet test PRKingNotepad.slnx` verde, 101 casos (57 métodos de teste, todos no `PRKingNotepad.Core.Tests`). Não há teste de interface.

## Como ler

| Status | Significado |
|---|---|
| **ok** | Implementado como a especificação pede (ou como a diferença registrada no README permite), com teste automatizado, ou, se o item é estrutural (uma constante, a ausência de algo), com a busca que o comprova registrada na linha. |
| **sem teste** | Implementado (lido no código), sem teste automatizado. Coluna "Próximo" diz quem cobre: U3 (teste de UI em processo), U2 (teste do Core) ou manual (caixa nativa do Windows, impressora, Explorer). |
| **divergente** | O código difere da especificação e a diferença não está em "Diferenças" do README. Sai com destino: corrigir o código (U2), registrar no README ou adendo na especificação. |
| **a confirmar** | Depende do comportamento do original que a especificação deixou em aberto. Vai para o [roteiro de confirmação](../../registros/notepad-reimpl/roteiro-confirmacao.md). |
| **fora do escopo** | A especificação permite deixar de fora na primeira versão (marcas FORA, PODE ser FORA ou §12). |

Caminhos de código relativos a `reimplementacoes/notepad/src/`; `MW` = `PRKingNotepad/MainWindow.xaml.cs`, `MWD` = `PRKingNotepad/MainWindow.Display.cs`, `MWP` = `PRKingNotepad/MainWindow.Printing.cs`, `XAML` = `PRKingNotepad/MainWindow.xaml`. Testes em `tests/PRKingNotepad.Core.Tests/`, citados como `Arquivo.Método`; os de interface (U3) em `tests/PRKingNotepad.Ui.Tests/`, citados como `Classe.Método` (`WindowAndShortcutTests`, `SearchAndDisplayTests`, `FileLifecycleTests`). "Dif. N" = item N de "Diferenças em relação ao original" do [README](README.md).

## Resumo

| Status | Linhas |
|---|---|
| ok | 117 (4 com parte manual: 2.b, 6.2.e, 10.a, 10.c) |
| sem teste | 10 (só manuais; ver [Teste manual](#teste-manual)) |
| divergente | 0 (D1–D3 resolvidas na U2) |
| a confirmar | 0 (R1–R7 respondidos em 22/10) |
| fora do escopo | 7 |
| **Total** | **134** |

Divergências (detalhe em [Divergências e destino](#divergências-e-destino)), aceitas pelo responsável e resolvidas na U2: **D1** botões da pergunta de salvar (código corrigido); **D2** tipo da mensagem de arquivo grande demais (código corrigido); **D3** fonte sem conjunto de caracteres e com peso só normal/negrito (README, Dif. 12).

**Atualização da U2 (2026-10-22):** 14 linhas tocadas (5.2.c, 5.3.c, 5.4.d, 5.4.e, 6.1.a, 6.2.a, 6.2.c, 6.2.d, 6.8.a, 9.b, 9.e, 11.b, 11.c, 11.d). Testes: 125 casos (68 métodos) no `PRKingNotepad.Core.Tests`. Quatro linhas "ok" ainda têm parte de UI para a U3 (5.4.d, 5.4.e, 6.2.c, 11.d). Os 7 "a confirmar" esperam a folha de respostas do roteiro (AC-U2.4).

**Atualização da U3 (2026-10-22):** 81 linhas tocadas: todas as que tinham U3 em "Próximo" passam a **ok** com teste de interface em processo (janela numa thread STA própria, atalhos enviados como tecla pela rota do WPF, substitutos de `MainWindowServices` para mensagens, preferências, recentes, processo, hora, linha de comando, caixas Abrir/Salvar, impressora e limite de tamanho), mais 2.b, que ganhou teste do atalho. Alt+Backspace, Ctrl+Insert e Colar sem texto (2.i, 2.k, 2.ag) já funcionavam pelo `TextBox`: nenhum `fix:` de atalho. Um defeito achado e corrigido (8.e): o Desfazer do Substituir tudo esquecia as quebras misturadas guardadas. Testes: 135 casos no Core, 76 na interface. Restam 10 linhas só manuais e as partes manuais de 2.b, 6.2.e, 10.a e 10.c, em [Teste manual](#teste-manual).

**Atualização da U2b (2026-10-22):** folha do roteiro recebida; adendo na §14 da especificação. 9 linhas tocadas (2.ai, 4.1.d, 5.3.b, 7.3.c, 8.b, 8.c, 8.d, 8.e, 9.g). R7 mudou o código (`LineBreakMap`: quebras existentes preservadas); R1, R3, R4, R5 e R6 já batiam com o original; R2 mantém a Dif. 6. Testes: 134 casos no `PRKingNotepad.Core.Tests`.

---

## 1. Janela

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 1.a | Janela com menus, área de edição em todo o espaço e barra de status opcional embaixo | `XAML`:45–134 (`DockPanel`: `Menu` em cima, `StatusBar` embaixo, `TextBox Editor` no resto) | WindowAndShortcutTests.Window_has_menu_on_top_status_bar_below_and_editor_filling_the_rest | ok | — | |
| 1.b | Título `[*]<nome> - <app>`; asterisco com alteração; nome genérico sem arquivo | `MW`:15 (`UntitledName`), `MW`:475 (`UpdateTitle`), `MW`:318–331 (marca alterado) | WindowAndShortcutTests.Title_shows_name_and_asterisk_when_changed | ok | — | Texto próprio: "Documento sem nome". |
| 1.c | Posição e tamanho lembrados | `MWD`:163–192 (`RestorePlacement`, `CurrentPlacement`); `PRKingNotepad.Core/Settings.cs` (`WindowPlacement`) | `SettingsTests.Round_trip_keeps_every_preference`, `SettingsTests.Out_of_range_values_are_corrected`, WindowAndShortcutTests.Window_placement_is_restored_from_settings | ok | — | Dif. 8 (só restaura se a barra de título estiver visível). |
| 1.d | Aceita arquivo arrastado do Explorer | `XAML`:6–8 (`AllowDrop`, `PreviewDrop`), `MW`:274–299 | — | sem teste | manual | Ver 6.6. |

## 2. Comandos e atalhos

Atalhos vêm de três fontes: gestos padrão dos `ApplicationCommands` do WPF (Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+P, Ctrl+F, Ctrl+H, F1), `KeyBinding` em `XAML`:31–43 e os comandos de edição do próprio `TextBox` (desfazer, recortar, copiar, colar, selecionar tudo, Del). Os do `TextBox` não aparecem em nenhum arquivo do projeto (busca abaixo); por isso ficam "sem teste" até a U3 provar o gesto na janela real. **U3:** cada atalho desta seção é enviado como tecla à janela (PreviewKeyDown → KeyDown, com os modificadores no estado de teclado da thread de teste), e a habilitação é lida com o submenu aberto, como o usuário a vê.

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 2.a | Novo — Ctrl+N | `XAML`:11, 48; `MW`:88 | WindowAndShortcutTests.Ctrl_N_starts_a_new_document | ok | — | Gesto padrão de `ApplicationCommands.New`. |
| 2.b | Nova janela (novo processo) — Ctrl+Shift+N | `XAML`:15, 33, 49; `MW`:112–122 | WindowAndShortcutTests.New_window_shortcut_starts_another_instance | ok | manual (processo novo) | Abre outro processo; U3 só verifica o comando, não o processo. U3: o atalho chama o ponto de troca `StartNewInstance`; o processo real é manual. |
| 2.c | Abrir — Ctrl+O | `XAML`:12, 50; `MW`:96–106 | WindowAndShortcutTests.Ctrl_O_opens_the_chosen_file | ok | — | |
| 2.d | Salvar — Ctrl+S | `XAML`:13, 51; `MW`:108, 215 | WindowAndShortcutTests.Ctrl_S_saves_to_the_current_file | ok | — | |
| 2.e | Salvar como — Ctrl+Shift+S | `XAML`:14, 32, 52; `MW`:110, 217–222 | WindowAndShortcutTests.Ctrl_Shift_S_asks_for_a_new_name | ok | — | |
| 2.f | Configurar página (sem atalho) | `XAML`:54; `MWP`:22–32 | WindowAndShortcutTests.Page_setup_menu_opens_the_page_setup_box | ok | — | |
| 2.g | Imprimir — Ctrl+P | `XAML`:25, 55; `MWP`:34–61 | — | sem teste | manual | Precisa de impressora (ou "Microsoft Print to PDF"). |
| 2.h | Sair (fechar a janela) | `XAML`:57; `MW`:124 | WindowAndShortcutTests.Exit_menu_closes_the_window | ok | — | |
| 2.i | Desfazer — Ctrl+Z e Alt+Backspace | `XAML`:60 (`ApplicationCommands.Undo` no `Editor`) | WindowAndShortcutTests.Ctrl_Z_and_Alt_Backspace_undo | ok | — | Busca `Alt+Back\|Backspace` em `src/`: só o texto da ajuda (`PRKingNotepad/HelpWindow.xaml.cs`:16). Nenhum `KeyBinding`; Alt+Backspace depende do `TextBox`. Se a U3 não confirmar, a U2 acrescenta o `KeyBinding`. U3: o gesto vem do `TextBox` e funciona na janela (teste); nenhum `KeyBinding`/`CanExecute` próprio foi preciso. |
| 2.j | Recortar — Ctrl+X | `XAML`:62 | WindowAndShortcutTests.Ctrl_X_cuts_the_selection | ok | — | Comando do `TextBox`. |
| 2.k | Copiar — Ctrl+C e Ctrl+Insert | `XAML`:63 | WindowAndShortcutTests.Ctrl_C_and_Ctrl_Insert_copy_the_selection | ok | — | Busca `Ctrl+Insert\|CtrlInsert\|Insert` em `src/`: nenhuma ocorrência de gesto. Mesmo tratamento de 2.i. U3: o gesto vem do `TextBox` e funciona na janela (teste); nenhum `KeyBinding`/`CanExecute` próprio foi preciso. |
| 2.l | Colar — Ctrl+V | `XAML`:64 | WindowAndShortcutTests.Ctrl_V_pastes_at_the_caret | ok | — | |
| 2.m | Excluir — Del | `XAML`:17–18, 65; `MW`:305–307 | WindowAndShortcutTests.Del_key_and_Delete_menu_remove_the_selection | ok | — | Del no texto é do `TextBox`; o item de menu usa `DeleteSelection`. |
| 2.n | Pesquisar seleção na web — Ctrl+E | nenhum | — | fora do escopo | — | Spec §3: "PODE ser FORA". Busca `Ctrl\+E\|Web\|Pesquis` em `src/` e `tests/`: nada. README, "Fora desta versão". |
| 2.o | Localizar — Ctrl+F | `XAML`:19, 67; `MW`:337 | WindowAndShortcutTests.Ctrl_F_opens_find_and_Ctrl_H_opens_replace | ok | — | |
| 2.p | Localizar próxima — F3 | `XAML`:21, 35, 68; `MW`:341, 346–354 | WindowAndShortcutTests.F3_finds_next_and_Shift_F3_finds_previous | ok | — | |
| 2.q | Localizar anterior — Shift+F3 | `XAML`:22, 36, 69; `MW`:343 | WindowAndShortcutTests.F3_finds_next_and_Shift_F3_finds_previous | ok | — | |
| 2.r | Substituir — Ctrl+H | `XAML`:20, 70; `MW`:339 | WindowAndShortcutTests.Ctrl_F_opens_find_and_Ctrl_H_opens_replace | ok | — | |
| 2.s | Ir para linha — Ctrl+G | `XAML`:23, 37, 71; `MW`:448–459 | SearchAndDisplayTests.Ctrl_G_starts_at_the_current_line_and_moves_the_caret_to_the_chosen_line | ok | — | |
| 2.t | Selecionar tudo — Ctrl+A | `XAML`:73 | WindowAndShortcutTests.Ctrl_A_selects_all | ok | — | |
| 2.u | Inserir hora e data — F5 | `XAML`:16, 34, 74; `MW`:303 | WindowAndShortcutTests.F5_inserts_time_and_date_at_the_caret_as_an_undoable_edit | ok | — | Formato: ver 3.d. |
| 2.v | Quebra automática (alterna) | `XAML`:77–78; `MWD`:104–116 | WindowAndShortcutTests.Word_wrap_menu_toggles_wrapping_and_horizontal_scrolling | ok | — | |
| 2.w | Fonte… | `XAML`:79; `MWD`:71–95 | — | sem teste | manual | Caixa nativa (WinForms `FontDialog`). |
| 2.x | Zoom: ampliar — Ctrl+= e Ctrl+(+ numérico) | `XAML`:24, 38–39, 83; `MWD`:120 | `ZoomTests.Zoom_in_steps_by_ten_up_to_500`, WindowAndShortcutTests.Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar | ok | — | Passo coberto no Core; gesto não. |
| 2.y | Zoom: reduzir — Ctrl+- e Ctrl+(- numérico) | `XAML`:27, 40–41, 84; `MWD`:122 | `ZoomTests.Zoom_out_steps_by_ten_down_to_10`, WindowAndShortcutTests.Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar | ok | — | |
| 2.z | Zoom: restaurar — Ctrl+0 | `XAML`:28, 42, 85; `MWD`:124 | WindowAndShortcutTests.Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar | ok | — | |
| 2.aa | Barra de status (alterna) | `XAML`:87–88; `MWD`:149–159 | WindowAndShortcutTests.Status_bar_menu_toggles_the_status_bar | ok | — | |
| 2.ab | Ajuda — F1 | `XAML`:26, 91; `MWP`:140 | WindowAndShortcutTests.F1_opens_help | ok | — | Dif. 10 (ajuda local). |
| 2.ac | Enviar comentários | nenhum | — | fora do escopo | — | Spec marca FORA. |
| 2.ad | Sobre | `XAML`:93; `MWP`:142 | WindowAndShortcutTests.About_menu_opens_the_about_box | ok | — | |
| 2.ae | Habilitação: Recortar, Copiar, Excluir só com seleção | `XAML`:62–65 (Recortar/Copiar: `CanExecute` do `TextBox`); `MW`:307 (`CanDeleteSelection`) | WindowAndShortcutTests.Cut_copy_and_delete_are_enabled_only_with_a_selection | ok | — | U3: o WPF só revalida os itens de um submenu quando ele abre; o teste abre o menu Editar e lê a habilitação. |
| 2.af | Habilitação: Desfazer só quando há o que desfazer | `XAML`:60 (`CanExecute` do `TextBox`); `MW`:202–203 (abrir zera o histórico) | WindowAndShortcutTests.Undo_is_enabled_only_when_there_is_something_to_undo, WindowAndShortcutTests.Opening_a_file_cannot_be_undone | ok | — | |
| 2.ag | Habilitação: Colar só com texto na área de transferência | `XAML`:64 (`CanExecute` do `TextBox`) | WindowAndShortcutTests.Paste_is_enabled_only_with_text_on_the_clipboard | ok | — | Busca `Clipboard\|ContainsText\|CanPaste` em `src/`: nada. Depende do `TextBox`; a U3 testa com a área de transferência sem texto (só imagem) e, se Colar ficar habilitado, a U2 acrescenta `CanExecute` próprio. U3: com só uma imagem na área de transferência, Colar fica desabilitado pelo `CanExecute` do `TextBox` (teste); nada a acrescentar. |
| 2.ah | F3 / Shift+F3 sem termo abrem Localizar | `MW`:346–354 (`FindOrAsk`) | WindowAndShortcutTests.F3_without_a_term_opens_find | ok | — | |
| 2.ai | Ir para linha disponível também com quebra automática | `PRKingNotepad/MainWindow.xaml`:23 (`CommandBinding` de `GoToLine` sem `CanExecute`) | WindowAndShortcutTests.Go_to_line_stays_available_with_word_wrap | ok | — | R1 confirmado (§14): o original também deixa habilitado. Estrutural: sem `CanExecute`, o comando nunca é desabilitado. |

Evidência das teclas Ctrl+N/O/S/P/F/H e F1: não há `KeyBinding` para elas em `XAML`:31–43; vêm dos `ApplicationCommands` ligados em `XAML`:11–26. A U3 confirma cada uma na janela.

## 3. Edição

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 3.a | Texto puro, uma fonte para o documento todo | `XAML`:126–133 (`TextBox`, não `RichTextBox`); `MWD`:63–69 | — | ok | — | Estrutural: `TextBox` não tem formatação por trecho. |
| 3.b | Desfazer de um nível (PODE vários, documentado) | `XAML`:60; `MW`:202–203 | WindowAndShortcutTests.Opening_a_file_cannot_be_undone | ok | — | Dif. 1 (vários níveis). |
| 3.c | NUL do arquivo vira espaço | `PRKingNotepad.Core/TextCodec.cs`:46 | `EncodingTests.Nul_characters_become_spaces` | ok | — | |
| 3.d | F5: hora curta, espaço, data curta, formato regional; edição desfazível | `PRKingNotepad.Core/TimeStamp.cs`:11; `MW`:303, 310–314 | `TimeStampTests.Format_is_short_time_space_short_date`, WindowAndShortcutTests.F5_inserts_time_and_date_at_the_caret_as_an_undoable_edit | ok | — | Formato coberto; inserção e desfazer, não. |
| 3.e | Pesquisar na web | nenhum | — | fora do escopo | — | Ver 2.n. |

## 4. Localizar, substituir e ir para

### 4.1 Localizar e substituir

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 4.1.a | Janelas não modais, uma de cada vez | `MW`:357–392 (`Show()`, fecha a do outro modo) | SearchAndDisplayTests.Search_window_is_modeless_and_only_one_is_open, WindowAndShortcutTests.Ctrl_F_opens_find_and_Ctrl_H_opens_replace | ok | — | |
| 4.1.b | Opções: maiúsculas/minúsculas, direção, dar a volta | `PRKingNotepad/FindReplaceWindow.xaml`:28–37; `PRKingNotepad.Core/TextFinder.cs`:22 | `SearchTests.Match_case_skips_other_cases`, `SearchTests.Down_starts_after_the_current_selection`, `SearchTests.Up_ends_before_the_current_selection`, `SearchTests.Wrap_around_continues_from_the_other_end_and_says_so`, SearchAndDisplayTests.Search_window_reopens_with_the_last_values, SearchAndDisplayTests.Wrapping_around_is_reported_in_the_status_bar_and_typing_clears_it | ok | — | Dif. 6: comparação ordinal; Substituir sempre para baixo (`FindReplaceWindow.xaml.cs`:44). |
| 4.1.c | Termo, substituição, opções e direção lembrados | `MWD`:31–35, 42–50; `PRKingNotepad.Core/Settings.cs`:59 (`SearchSettings`) | `SettingsTests.Round_trip_keeps_every_preference`, `SettingsTests.Missing_file_gives_defaults`, SearchAndDisplayTests.Search_window_reopens_with_the_last_values, FileLifecycleTests.Closing_saves_the_preferences | ok | — | |
| 4.1.d | Ao abrir, a seleção vira o termo | `MW`:369–375 (`ShowSearchWindow`) | SearchAndDisplayTests.Single_line_selection_becomes_the_term_and_multi_line_does_not | ok | — | R2 confirmado (§14). Seleção de uma linha e Ctrl+H com seleção: igual ao original. Sem seleção o termo não muda (último buscado), igual. Várias linhas: o original emenda as linhas, aqui o termo não muda (Dif. 6, mantida pelo responsável em 22/10). |
| 4.1.e | Não encontrado: mensagem | `MW`:398–403, 428–431 (`Inform`) | `SearchTests.Not_found_and_empty_term_return_null`, SearchAndDisplayTests.Not_found_shows_an_information_message | ok | — | Core cobre o "não achou"; a mensagem não. |
| 4.1.f | Ao dar a volta, aviso na barra de status | `MW`:407–409 | `SearchTests.Wrap_around_continues_from_the_other_end_and_says_so` (`Wrapped`), SearchAndDisplayTests.Wrapping_around_is_reported_in_the_status_bar_and_typing_clears_it | ok | — | Indicador coberto; texto na barra, não. |
| 4.1.g | Substituir tudo numa única operação desfazível | `MW`:437–464 (`BeginChange`/`EndChange`); `PRKingNotepad.Core/TextFinder.cs`:62, 92 | `SearchTests.Replace_all_counts_and_respects_case`, `SearchTests.Replace_all_does_not_rescan_inserted_text`, SearchAndDisplayTests.Replace_all_is_undone_by_a_single_Ctrl_Z | ok | — | Um Ctrl+Z desfazer tudo é o ponto a provar. |
| 4.1.h | Substituir troca a seleção se for o termo e segue | `MW`:414–422; `PRKingNotepad.Core/TextFinder.cs`:54 | `SearchTests.Selection_matches_term_respecting_case_option`, SearchAndDisplayTests.Replace_swaps_the_selection_when_it_is_the_term_and_moves_on | ok | — | Derivado de 4.1 (botão Substituir). |

### 4.2 Ir para linha

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 4.2.a | Caixa modal com campo numérico e confirmar/cancelar | `PRKingNotepad/GoToLineWindow.xaml`; `PRKingNotepad/GoToLineWindow.xaml.cs` (`PreviewTextInput` só dígitos); `MW`:452 (`ShowDialog`) | SearchAndDisplayTests.Ctrl_G_starts_at_the_current_line_and_moves_the_caret_to_the_chosen_line | ok | — | U3: o campo recusa o que não é dígito (teste digita `x3`, fica `3`). |
| 4.2.b | Valor inicial = linha atual | `MW`:451; `PRKingNotepad.Core/CaretPosition.cs`:10 | `CaretPositionTests.Line_and_column_are_one_based`, SearchAndDisplayTests.Ctrl_G_starts_at_the_current_line_and_moves_the_caret_to_the_chosen_line | ok | — | Cálculo coberto; valor na caixa, não. |
| 4.2.c | Linha além do total: aviso e a caixa continua aberta | `PRKingNotepad/GoToLineWindow.xaml.cs`:30–45 | SearchAndDisplayTests.Line_past_the_end_warns_and_keeps_the_box_open | ok | — | |
| 4.2.d | Cursor no início da linha pedida | `MW`:454–457; `PRKingNotepad.Core/TextFinder.cs`:98 (`TextLines.StartOf`) | `TextLinesTests.Start_of_line_is_index_after_previous_line_break`, `TextLinesTests.Count_includes_last_line_even_if_empty`, SearchAndDisplayTests.Ctrl_G_starts_at_the_current_line_and_moves_the_caret_to_the_chosen_line | ok | — | |

## 5. Formatação e exibição

### 5.1 Quebra automática

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 5.1.a | Alterna quebra na largura (sem rolagem horizontal) e linhas longas com rolagem | `MWD`:110–116 | SearchAndDisplayTests.Long_lines_scroll_without_wrap_and_fit_the_width_with_wrap, WindowAndShortcutTests.Word_wrap_menu_toggles_wrapping_and_horizontal_scrolling | ok | — | |
| 5.1.b | Preferência lembrada; limite de tamanho PODE não existir | `PRKingNotepad.Core/Settings.cs` (`WordWrap`); `MWD`:29, 106 | `SettingsTests.Round_trip_keeps_every_preference` | ok | — | Sem limite de tamanho (permitido). |
| 5.1.c | Com quebra, Ln/Col são do arquivo, não visuais | `PRKingNotepad.Core/CaretPosition.cs`:10 (conta `\n` do texto) | `CaretPositionTests.Line_and_column_are_one_based`, SearchAndDisplayTests.Line_and_column_count_file_lines_with_word_wrap_on | ok | — | |

### 5.2 Fonte

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 5.2.a | Caixa de fonte (nome, estilo, tamanho), aplicada ao documento inteiro | `MWD`:63–95 | — | sem teste | manual | Caixa nativa; a U3 cobre só `ApplyFont`. |
| 5.2.b | Padrão monoespaçada (Consolas 11 pt) | `PRKingNotepad.Core/Settings.cs` (`FontFamily`, `FontSize`) | `SettingsTests.Missing_file_gives_defaults` | ok | — | |
| 5.2.c | Lembrada: nome, tamanho, peso, itálico, conjunto de caracteres | `PRKingNotepad.Core/Settings.cs` (`FontFamily`, `FontSize`, `FontBold`, `FontItalic`) | `SettingsTests.Round_trip_keeps_every_preference` | ok | — | **D3** resolvida na U2 pela Dif. 12 do README: conjunto de caracteres não gravado (WPF em Unicode); pesos intermediários pelo nome da família. Busca `charset|GdiCharSet` em `src/`: só `CharSet.Unicode` de `DllImport`. |

### 5.3 Zoom

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 5.3.a | 10 % a 500 %, passos de 10 %, padrão 100 % | `PRKingNotepad.Core/Settings.cs`:143–153 (`Zoom`); `MWD`:120–145 | `ZoomTests.Zoom_in_steps_by_ten_up_to_500`, `ZoomTests.Zoom_out_steps_by_ten_down_to_10` | ok | — | Dif. 7 (escala do tamanho da fonte). |
| 5.3.b | Ctrl+roda do mouse também altera | `MWD`:126–133 | `ZoomTests.Zoom_in_steps_by_ten_up_to_500`, `ZoomTests.Zoom_out_steps_by_ten_down_to_10` (passo), SearchAndDisplayTests.Ctrl_mouse_wheel_zooms_and_plain_wheel_does_not | ok | — | R3 confirmado (§14): 10 % por clique, para cima aumenta, igual ao nosso. Dif. 7 sem "a confirmar". |
| 5.3.c | Não é gravado: volta a 100 % a cada execução | `MWD` (`_zoom` só em memória) | `SettingsTests.Zoom_is_not_saved` | ok | — | O JSON gravado não tem nenhum campo de zoom (teste da U2). |
| 5.3.d | Zoom exibido na barra de status | `MWD`:144; `XAML`:119 | WindowAndShortcutTests.Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar | ok | — | |

### 5.4 Barra de status

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 5.4.a | Parte 1: vazia / mensagens | `XAML`:115; `MW`:324, 407–409, 445 | SearchAndDisplayTests.Wrapping_around_is_reported_in_the_status_bar_and_typing_clears_it, SearchAndDisplayTests.Replace_all_is_undone_by_a_single_Ctrl_Z | ok | — | |
| 5.4.b | Parte 2: `Ln <linha>, Col <coluna>` (1-based) | `MW`:484–488; `PRKingNotepad.Core/CaretPosition.cs`:10 | `CaretPositionTests.Line_and_column_are_one_based`, SearchAndDisplayTests.Status_bar_shows_line_and_column | ok | — | |
| 5.4.c | Parte 3: zoom `<n>%` | `MWD`:144 | WindowAndShortcutTests.Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar | ok | — | |
| 5.4.d | Parte 4: Windows (CRLF), Unix (LF), Macintosh (CR) | `MW` (`UpdateStatus`); `PRKingNotepad.Core/LineEndings.cs` (`DisplayName`) | `DisplayNameTests.Line_ending_names_match_the_status_bar`, SearchAndDisplayTests.Status_bar_shows_the_detected_line_ending | ok | — | Nomes testados no Core (U2). |
| 5.4.e | Parte 5: ANSI, UTF-16 LE, UTF-16 BE, UTF-8, UTF-8 com BOM | `MW` (`UpdateStatus`); `PRKingNotepad.Core/TextEncodingKind.cs` (`DisplayName`) | `DisplayNameTests.Encoding_names_match_the_status_bar`, `DisplayNameTests.Every_encoding_has_a_name`, SearchAndDisplayTests.Status_bar_shows_the_encoding | ok | — | GB18030: ver 7.2.b. |
| 5.4.f | Visibilidade lembrada | `MWD`:149–159; `PRKingNotepad.Core/Settings.cs` (`StatusBarVisible`) | `SettingsTests.Round_trip_keeps_every_preference`, `SettingsTests.Missing_file_gives_defaults`, SearchAndDisplayTests.Status_bar_visibility_is_remembered, WindowAndShortcutTests.Status_bar_menu_toggles_the_status_bar | ok | — | |

## 6. Ciclo de vida do arquivo

### 6.1 Novo

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.1.a | Com alterações, pergunta Salvar / Não salvar / Cancelar; Cancelar aborta | `MW` (`OnNew`, `ConfirmDiscard`); `PRKingNotepad/SaveChangesWindow.xaml(.cs)` | FileLifecycleTests.New_with_changes_asks_and_cancel_keeps_the_document, FileLifecycleTests.Save_question_window_names_the_file_and_returns_the_button | ok | — | **D1** corrigida na U2: janela WPF própria com Salvar / Não salvar / Cancelar, por `IUserDialogs.AskToSave`; fechar pelo X ou Esc conta como Cancelar. Na U3, `MainWindowServices.Dialogs` dá a resposta. |
| 6.1.b | Esvazia, sem arquivo, codificação padrão, CRLF | `MW`:92, 190–213 | FileLifecycleTests.New_empties_the_document_with_default_encoding_and_crlf | ok | — | |

### 6.2 Abrir

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.2.a | Pergunta sobre alterações antes | `MW` (`OnOpen`, `ConfirmDiscard`) | FileLifecycleTests.Open_with_changes_asks_first_and_cancel_skips_the_open_box | ok | — | Mesma pergunta de 6.1.a (D1, corrigida). |
| 6.2.b | Caixa Abrir: filtros texto / todos, lista de codificação com detecção automática | `PRKingNotepad/FileDialogs.cs`:26–51, 81–92, 109–121 | — | sem teste | manual | Caixa nativa do shell. Ordem da lista = ordem da spec (`TextEncodingKind`). Rótulo próprio "Arquivos de texto". |
| 6.2.c | Erros (inexistente, acesso negado, nome inválido) com o nome do arquivo | `PRKingNotepad.Core/FileMessages.cs` (`Describe`, `IsFileError`); `MW` (`LoadFile`) | `FileMessageTests` (7 métodos), FileLifecycleTests.Open_error_shows_the_file_name_and_keeps_the_document | ok | — | Texto movido da janela para o Core na U2. |
| 6.2.d | 1 GiB ou mais: recusa com "grande demais" | `PRKingNotepad.Core/TextFileStore.cs`:14–27; `MW` (`LoadFile`) | `TextFileStoreTests.Read_refuses_files_at_or_above_the_limit` | ok | — | Sai como aviso desde a U2: ver 11.c (D2, corrigida). |
| 6.2.e | Após abrir: documentos recentes; cursor no início (exceto .LOG) | `MW`:178–181 (`AddToRecentDocuments`), 204–205 | FileLifecycleTests.Open_adds_to_recent_documents_and_puts_the_caret_at_the_start | ok | manual (lista de recentes do Windows) | Dif. 11 (pasta temporária fora da lista). U3: o arquivo chega ao ponto de troca `AddToRecentDocuments`; a lista do Windows é manual. |

### 6.3 Salvar

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.3.a | Sem arquivo associado vira Salvar como | `MW`:215 | FileLifecycleTests.Save_without_a_file_becomes_save_as | ok | — | |
| 6.3.b | Grava no mesmo arquivo (PODE: temporário e troca) | `PRKingNotepad.Core/TextFileStore.cs`:34–63 | `TextFileStoreTests.Write_creates_and_then_replaces_without_leaving_temp_files` | ok | — | Dif. 2. Falha antes da troca não cria o destino (equivale a "apagar se não existia"). |
| 6.3.c | Codificação = a do documento; BOM conforme 7.3 | `MW`:229; `PRKingNotepad.Core/TextCodec.cs`:50 | `EncodingTests.Encode_writes_bom_per_encoding`, `EncodingTests.Round_trip_preserves_text_and_encoding` | ok | — | |
| 6.3.d | Perda em ANSI: aviso OK/Cancelar; Cancelar não grava; OK grava e recarrega do disco | `MW`:230–240, 252–261 | `EncodingTests.Ansi_reports_lost_characters_and_replaces_them`, `EncodingTests.Ansi_keeps_characters_of_the_code_page`, FileLifecycleTests.Ansi_loss_warns_cancel_does_not_write_and_ok_writes_and_reloads | ok | — | Detecção coberta; fluxo (cancelar, recarregar) não. |
| 6.3.e | Ao salvar: limpa alterado, atualiza título e barra | `MW`:263–269 | FileLifecycleTests.Save_without_a_file_becomes_save_as, WindowAndShortcutTests.Ctrl_Shift_S_asks_for_a_new_name | ok | — | |
| 6.3.f | Preservar criptografia EFS | nenhum | — | fora do escopo | — | Spec marca FORA. Busca `Encrypt\|EFS`: nada. |

### 6.4 Salvar como

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.4.a | Nome sugerido (`*.txt` sem título), filtros, lista de codificação sem detecção, padrão = atual | `MW`:217–222; `PRKingNotepad/FileDialogs.cs`:54–79 | — | sem teste | manual | |
| 6.4.b | Sem extensão com filtro `*.txt` acrescenta `.txt` | `PRKingNotepad/FileDialogs.cs`:90 (`SetDefaultExtension`) | — | sem teste | manual | Comportamento da caixa padrão; conferir também com "Todos os arquivos". |
| 6.4.c | Confirma antes de sobrescrever | `PRKingNotepad/FileDialogs.cs`:61 (`OverwritePrompt`) | — | sem teste | manual | |

### 6.5 Recurso ".LOG"

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.5.a | Começa exatamente com `.LOG`: cursor no fim, insere quebra + hora/data + quebra; documento fica alterado | `PRKingNotepad.Core/TimeStamp.cs`:15–18; `MW`:182–186 | `TimeStampTests.Log_marker_must_be_uppercase_at_start`, `TimeStampTests.Log_entry_goes_at_the_end_between_line_breaks`, FileLifecycleTests.Log_file_gets_a_time_stamp_with_the_caret_at_the_end_and_is_marked_changed | ok | — | |

### 6.6 Arrastar e soltar

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.6.a | Soltar = Abrir (com a pergunta); vários arquivos, só o primeiro | `MW`:274–299 | — | sem teste | manual | `DragEventArgs` não se monta em teste; a U3 pode cobrir o caminho depois do soltar se a U2 separar o método. |

### 6.7 Linha de comando

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.7.a | Caminho entre aspas duplas ou simples; sem aspas, o resto da linha (com espaços) | `PRKingNotepad.Core/CommandLine.cs`:13, 28 | `CommandLineTests.Arguments_strip_program_name`, `CommandLineTests.Parse_reads_options_and_path` | ok | — | |
| 6.7.b | Caminho relativo resolvido contra a pasta atual | `PRKingNotepad.Core/CommandLine.cs`:56–63; `MW`:54 | `CommandLineTests.Missing_name_without_extension_becomes_txt` | ok | — | |
| 6.7.c | Inexistente sem extensão: tenta `nome.txt` | `PRKingNotepad.Core/CommandLine.cs`:56–63 | `CommandLineTests.Missing_name_without_extension_becomes_txt` | ok | — | Dif. 5. |
| 6.7.d | Inexistente: criar? Sim cria e abre; Não abre vazio; Cancelar encerra | `MW`:62–85 | FileLifecycleTests.Missing_file_on_the_command_line_yes_creates_and_opens_it, FileLifecycleTests.Missing_file_on_the_command_line_no_opens_empty_and_cancel_closes | ok | — | |
| 6.7.e | `/A` força ANSI; `/W` força UTF-16 LE | `PRKingNotepad.Core/CommandLine.cs`:28–49 | `CommandLineTests.Parse_reads_options_and_path` | ok | — | |
| 6.7.f | `/P`, `/PT` (impressão pela linha de comando) | nenhum | — | fora do escopo | — | Spec: "PODE ser FORA"; §12. Busca `"/P"\|/PT`: nada. |

### 6.8 Fechar

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 6.8.a | Com alterações: Salvar / Não salvar / Cancelar, citando o nome | `MW` (`OnClosing`, `ConfirmDiscard`); `PRKingNotepad/SaveChangesWindow.xaml(.cs)` | FileLifecycleTests.Closing_with_changes_names_the_document_and_cancel_keeps_the_window, FileLifecycleTests.Save_question_window_names_the_file_and_returns_the_button | ok | — | **D1** corrigida na U2: nome do documento na pergunta; botões Salvar / Não salvar / Cancelar. |
| 6.8.b | Salva preferências ao fechar | `MW`:133; `MWD`:40–59 | `SettingsTests.Round_trip_keeps_every_preference`, FileLifecycleTests.Closing_saves_the_preferences | ok | — | Gravação coberta; o gatilho no fechamento, não. |

## 7. Codificação

### 7.1 Detecção ao abrir (modo automático)

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 7.1.a | Arquivo vazio: documento vazio, codificação padrão | `PRKingNotepad.Core/EncodingDetector.cs`:15–20; `PRKingNotepad.Core/TextCodec.cs`:39–43 | `EncodingTests.Empty_file_has_no_detection_and_uses_default` | ok | — | |
| 7.1.b | `EF BB BF` → UTF-8 com BOM (pula 3 bytes) | `PRKingNotepad.Core/EncodingDetector.cs` (`Detect`) | `EncodingTests.Bom_decides_encoding` | ok | — | |
| 7.1.c | `FF FE` → UTF-16 LE; `FE FF` → UTF-16 BE | idem | `EncodingTests.Bom_decides_encoding` | ok | — | |
| 7.1.d | Sem BOM: teste de UTF-16, ignorado abaixo de 100 bytes (PODE heurística própria) | `PRKingNotepad.Core/EncodingDetector.cs`:12, 45 | `EncodingTests.Utf16Le_without_bom_detected_from_100_bytes`, `EncodingTests.Utf16Le_heuristic_ignored_below_100_bytes` | ok | — | Dif. 4. |
| 7.1.e | UTF-8 estrito válido → UTF-8; inválido → ANSI | `PRKingNotepad.Core/EncodingDetector.cs` (`Utf8.IsValid`) | `EncodingTests.Valid_utf8_without_bom_is_utf8`, `EncodingTests.Plain_ascii_is_utf8`, `EncodingTests.Invalid_utf8_falls_back_to_ansi` | ok | — | |

### 7.2 Codificação forçada

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 7.2.a | Forçada pela caixa Abrir ou `/A` `/W`: ANSI, UTF-16 LE/BE, UTF-8, UTF-8 com BOM | `PRKingNotepad.Core/TextCodec.cs`:30–34; `PRKingNotepad/FileDialogs.cs`:44–45 | `EncodingTests.Forced_encoding_overrides_detection_and_skips_matching_bom` | ok | — | |
| 7.2.b | GB18030 | nenhum | — | fora do escopo | — | Spec: "PODE ser FORA"; §12. Busca `GB18030\|54936`: nada. |

### 7.3 Gravação

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 7.3.a | BOM por codificação (ANSI e UTF-8 sem; UTF-16 LE `FF FE`; BE `FE FF`; UTF-8 com BOM `EF BB BF`) | `PRKingNotepad.Core/TextCodec.cs`:50–77 | `EncodingTests.Encode_writes_bom_per_encoding` | ok | — | |
| 7.3.b | ANSI = página de código do sistema, com aviso de perda | `PRKingNotepad.Core/TextCodec.cs`:55–65; `PRKingNotepad/NativeMethods.cs` (`GetACP`) | `EncodingTests.Ansi_reports_lost_characters_and_replaces_them` | ok | — | |
| 7.3.c | Codificação de documento novo é preferência; padrão de fábrica UTF-8 sem BOM | `PRKingNotepad.Core/Settings.cs`:24 (`DefaultEncoding = Utf8`) | `SettingsTests.Missing_file_gives_defaults` | ok | — | R4 confirmado (§14): o original grava UTF-8 sem BOM e mostra "UTF-8". |

## 8. Quebras de linha

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 8.a | Detectadas do conteúdo (CRLF, LF, CR) e mostradas na barra | `PRKingNotepad.Core/LineEndings.cs`:38; `MW`:479 | `LineEndingTests.Detect_uses_first_line_break`, SearchAndDisplayTests.Status_bar_shows_the_detected_line_ending | ok | — | |
| 8.b | Enter insere o tipo do documento (CRLF em documento novo) | `PRKingNotepad.Core/LineEndings.cs`:90–227 (`LineBreakMap`: quebra sem registro sai no tipo do documento) | `LineEndingTests.Save_converts_back_to_document_line_ending`, `LineEndingTests.New_line_at_end_of_mixed_file_uses_document_type` | ok | — | Mesmo resultado no arquivo; o editor trabalha sempre em CRLF. |
| 8.c | Salvar preserva as quebras como estão | `PRKingNotepad.Core/LineEndings.cs`:107–137, 172–211 (`FromFileText`, `ToFileText`) | `LineEndingTests.Lf_file_round_trips_unchanged`, `LineEndingTests.Mixed_file_round_trips_unchanged` | ok | — | Também em arquivo misturado (U2b, 8.e). |
| 8.d | Colar texto com outro tipo de quebra: converte para o do documento | `PRKingNotepad.Core/LineEndings.cs`:172–211 (`ToFileText`, na gravação) | `LineEndingTests.Pasted_lf_inside_crlf_document_is_normalized_on_save`, `LineEndingTests.Pasted_lf_is_saved_in_document_type` | ok | — | R5 confirmado (§14): o original grava a quebra colada como CRLF e não muda o tipo na barra; igual ao nosso. |
| 8.e | Tipos misturados no mesmo arquivo (lacuna §13) | `PRKingNotepad.Core/LineEndings.cs`:90–227 (`LineBreakMap`); `MW`:326–334 (`OnTextChanged`), 437–464 (`ReplaceAll`, troca por troca); `PRKingNotepad.Core/TextFinder.cs`:92 (`FindAll`) | `LineEndingTests.Mixed_file_round_trips_unchanged`, `New_line_at_end_of_mixed_file_uses_document_type`, `Lf_first_file_keeps_its_crlf_break`, `Typing_before_a_preserved_break_moves_it_along`, `Deleted_break_typed_again_uses_document_type`, `Removing_text_across_a_preserved_break_forgets_it`, `Insert_between_cr_and_lf_of_a_preserved_break_forgets_it`, `Replace_all_keeps_breaks_outside_the_matches`, FileLifecycleTests.Mixed_line_breaks_survive_typing_replace_all_undo_and_redo, FileLifecycleTests.Deleted_mixed_break_comes_back_in_the_document_type_after_undo | ok | — | R7 confirmado (§14); responsável: "Copiar o original". Tipo = primeira quebra, existentes preservadas, novas no tipo do documento (U2b). Resto na Dif. 3 (Desfazer). U3: na janela, o Desfazer do Substituir tudo esquecia todas as quebras guardadas (o WPF desfazia trocando o texto inteiro). Corrigido: Substituir tudo troca ocorrência por ocorrência numa só unidade de desfazer (`TextFinder.FindAll`), e o mapa acompanha também o Desfazer e o Refazer. |

## 9. Preferências persistentes

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 9.a | Arquivo próprio (`%APPDATA%\PRKing_Notepad\config.json`), nunca o registro | `PRKingNotepad.Core/Settings.cs`:118–119 (`DefaultPath`), 122–139 | `SettingsTests.Missing_file_gives_defaults`, `SettingsTests.Corrupt_file_gives_defaults`, `SettingsTests.Partial_file_keeps_defaults_for_missing_fields` | ok | — | Busca `Registry\|Microsoft.Win32` em `src/`: nada. |
| 9.b | Fonte: nome, tamanho, peso, itálico, conjunto (Consolas 11 normal) | `PRKingNotepad.Core/Settings.cs` | `SettingsTests.Round_trip_keeps_every_preference` | ok | — | Mesmo item de 5.2.c (D3 → Dif. 12 do README). |
| 9.c | Quebra automática (desligada) | idem (`WordWrap`) | `SettingsTests.Missing_file_gives_defaults` | ok | — | |
| 9.d | Barra de status visível (ligada) | idem (`StatusBarVisible`) | `SettingsTests.Missing_file_gives_defaults` | ok | — | |
| 9.e | Janela: posição e tamanho (centro, tamanho padrão do sistema) | `XAML`:5–6 (900 × 600, `CenterScreen`); `MWD` (`RestorePlacement`, `CurrentPlacement`) | `SettingsTests.Round_trip_keeps_every_preference` | ok | — | Padrão "sugerido" pela spec; o tamanho inicial próprio está na Dif. 12 do README (U2). |
| 9.f | Busca: termo, substituição, maiúsc., direção, dar a volta (vazio, não, baixo, não) | idem (`SearchSettings`) | `SettingsTests.Missing_file_gives_defaults`, `SettingsTests.Round_trip_keeps_every_preference`, `SettingsTests.Enums_are_stored_by_name` | ok | — | |
| 9.g | Página: cabeçalho `&f`, rodapé `Página &p`, margens a confirmar | `PRKingNotepad.Core/Settings.cs`:72–97 (`PageSettings`) | `PageSettingsTests.Invalid_margins_fall_back_to_defaults`, `HeaderFooterTests.Defaults_resolve_file_name_and_page` | ok | — | R6 (§14): margens do original 20/20/25/25 mm, iguais às nossas (com a ressalva de ajuste anterior); cabeçalho e rodapé vazios não observáveis como padrão, ficam os da §9. Dif. 9 ajustada. |
| 9.h | Codificação padrão de documento novo (UTF-8) | idem (`DefaultEncoding`) | `SettingsTests.Missing_file_gives_defaults`, `SettingsTests.Out_of_range_values_are_corrected` | ok | — | Valor de fábrica do original: 7.3.c. |
| 9.i | Restaurar após reinício do Windows | nenhum | — | fora do escopo | — | Spec marca FORA; §12. |

## 10. Impressão

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 10.a | Configurar página: papel (tamanho, origem), orientação, margens, cabeçalho, rodapé, impressora | `PRKingNotepad/PageSetupWindow.xaml`; `PRKingNotepad/PageSetupWindow.xaml.cs`:44, 136, 152; `MWP`:22–32 | `PageSettingsTests.Invalid_margins_fall_back_to_defaults`, FileLifecycleTests.Page_setup_without_a_printer_keeps_margins_header_and_footer, WindowAndShortcutTests.Page_setup_menu_opens_the_page_setup_box | ok | manual (com impressora) | Dif. 9 (papel, origem e orientação só na sessão). A U3 abre a janela com `queue = null`. |
| 10.b | Códigos `&f &p &t &d &l &c &r &&`, maiúsculas ou minúsculas | `PRKingNotepad.Core/PrintLayout.cs`:18–49 | `HeaderFooterTests.Defaults_resolve_file_name_and_page`, `HeaderFooterTests.Codes_are_case_insensitive_and_include_time_and_date`, `HeaderFooterTests.Alignment_codes_send_following_text_to_each_part`, `HeaderFooterTests.Double_ampersand_is_literal_and_unknown_code_is_kept`, `HeaderFooterTests.Empty_template_is_empty` | ok | — | Dif. 9 (sem alinhamento, centro). |
| 10.c | Imprimir: caixa padrão; progresso com Cancelar | `MWP`:34–61, 100–136; `PRKingNotepad/PrintProgressWindow.xaml.cs`:23–46 | FileLifecycleTests.Print_progress_shows_pages_and_cancel_asks_to_stop | ok | manual (caixa Imprimir e impressão real) | |
| 10.d | Usa a fonte do documento e quebra pela largura da página | `MWP`:82–98; `PRKingNotepad/PrintPaginator.cs`; `PRKingNotepad.Core/PrintLayout.cs`:61 | `PrintLayoutTests.Lines_that_fit_are_kept_and_grouped_in_pages`, `PrintLayoutTests.Long_line_breaks_at_last_space_that_fits`, `PrintLayoutTests.Word_longer_than_width_is_cut`, `PrintLayoutTests.Tabs_expand_to_stops_of_eight`, `PrintLayoutTests.Surrogate_pairs_are_not_split`, `PrintLayoutTests.Empty_text_gives_one_page_and_blank_lines_are_kept` | ok | — | Fonte sem zoom (`MWP`:95). |

## 11. Mensagens ao usuário (texto próprio, situação observada)

| ID | Requisito (resumo) | Código | Teste | Status | Próximo | Evidência / observação |
|---|---|---|---|---|---|---|
| 11.a | Arquivo não encontrado (linha de comando): criar? Sim / Não / Cancelar | `MW`:64–65 | FileLifecycleTests.Missing_file_on_the_command_line_yes_creates_and_opens_it | ok | — | `YesNoCancel`, ícone de pergunta. |
| 11.b | Salvar alterações em `<arquivo>`? Salvar / Não salvar / Cancelar | `PRKingNotepad/SaveChangesWindow.xaml(.cs)`; `MW` (`ConfirmDiscard`) | FileLifecycleTests.Save_question_window_names_the_file_and_returns_the_button | ok | — | **D1** corrigida na U2: "Deseja salvar as alterações em “<arquivo>”?", botões Salvar / Não salvar / Cancelar. |
| 11.c | Arquivo grande demais: aviso | `MW` (`LoadFile`, `MessageBoxImage.Warning`); `PRKingNotepad.Core/FileMessages.cs` (`TooLarge`) | `FileMessageTests.Too_large_and_out_of_memory_name_the_file`, FileLifecycleTests.Too_large_file_shows_a_warning_with_its_name_and_keeps_the_document | ok | — | **D2** corrigida na U2: sai como aviso, com o nome do arquivo, e o documento não muda. Texto testado no Core; o tipo da caixa só pela UI. |
| 11.d | Nome inválido / não foi possível criar / acesso negado: erro com o nome | `PRKingNotepad.Core/FileMessages.cs` (`Describe`); `MW` (`OpenFromCommandLine`, `SaveTo`) | `FileMessageTests` (7 métodos), FileLifecycleTests.File_that_cannot_be_created_shows_an_error_with_its_name, FileLifecycleTests.Open_error_shows_the_file_name_and_keeps_the_document | ok | — | Texto movido para o Core na U2. |
| 11.e | Caracteres perdidos em ANSI: OK / Cancelar | `MW`:232–235 | FileLifecycleTests.Ansi_loss_warns_cancel_does_not_write_and_ok_writes_and_reloads | ok | — | |
| 11.f | Texto não encontrado: informação | `MW`:401, 430, 496–500 | SearchAndDisplayTests.Not_found_shows_an_information_message | ok | — | |
| 11.g | Linha além do total: aviso, caixa aberta | `PRKingNotepad/GoToLineWindow.xaml.cs`:37–41, 47–51 | SearchAndDisplayTests.Line_past_the_end_warns_and_keeps_the_box_open | ok | — | |
| 11.h | Memória insuficiente para abrir: erro | `MW`:166–170 | — | sem teste | manual | Não reproduzível em teste sem injetar falha. |

## Teste manual

Para o responsável executar antes do gate (U4), no programa compilado (`dotnet run --project src/PRKingNotepad`). Cobre as 10 linhas só manuais (caixas nativas do Windows, impressora, Explorer, processo novo) e as partes manuais de 2.b, 6.2.e, 10.a e 10.c. Preencher "Resultado" com ok ou o que se viu.

| # | Linhas | Passos | Esperado | Resultado |
|---|---|---|---|---|
| M1 | 1.d, 6.6.a | Digitar algo; arrastar um `.txt` do Explorer para a janela; responder "Não salvar". Depois arrastar dois arquivos de uma vez. | Pergunta de salvar antes; o arquivo abre. Com dois, só o primeiro abre. |  ok — pergunta de salvar com Salvar / Não salvar / Cancelar; um e dois arquivos como esperado |
| M2 | 2.b | Ctrl+Shift+N. | Abre outra janela do programa (processo novo), com documento vazio. |  ok |
| M3 | 2.g, 10.c | Documento de 3 ou mais páginas; Ctrl+P; escolher "Microsoft Print to PDF" e imprimir. Repetir e clicar Cancelar na janela de progresso. | Caixa Imprimir padrão; progresso "Página n de N"; Cancelar para a impressão. |  ok (Microsoft Print to PDF; Cancelar na janela de progresso) |
| M4 | 2.w, 5.2.a | Formatar > Fonte…; trocar nome, estilo e tamanho; OK. Fechar e abrir o programa. | Caixa nativa; o documento inteiro muda; a fonte volta igual na próxima execução. |  ok |
| M5 | 6.2.b | Ctrl+O; abrir a lista de tipos e a de codificação; abrir um arquivo UTF-16 com a codificação em detecção automática. | Filtros "Arquivos de texto" e "Todos os arquivos"; lista na ordem da spec; barra mostra UTF-16 LE. |  ok |
| M6 | 6.4.a | Documento sem nome, Ctrl+Shift+S. | Nome sugerido `*.txt`; filtros; lista de codificação sem detecção, com a atual marcada. |  ok |
| M7 | 6.4.b | Salvar como `teste` (sem extensão) com o filtro de texto; repetir com "Todos os arquivos". | Com o filtro de texto grava `teste.txt`; anotar o que acontece com "Todos os arquivos". |  ok — grava `teste.txt` |
| M8 | 6.4.c | Salvar como sobre um arquivo que já existe. | Pede confirmação antes de sobrescrever. |  ok — pede confirmação e sobrescreve |
| M9 | 6.2.e | Abrir um arquivo pela caixa Abrir; olhar os recentes do Windows (Explorer > Acesso rápido, ou a lista de atalhos do programa). Repetir com um arquivo da pasta temporária. | O arquivo aparece nos recentes; o da pasta temporária não (Dif. 11). |  ok |
| M10 | 10.a | Com impressora instalada: Arquivo > Configurar página; trocar papel, origem e orientação; imprimir. | A caixa lista as opções da impressora; a impressão usa o que foi escolhido (Dif. 9: só na sessão). |  não executado: sem impressora física (o M3 cobriu a impressão pela Microsoft Print to PDF) |
| M11 | 11.h | Não reproduzível sem injetar falha. Conferir no código a mensagem (`FileMessages.OutOfMemory`, chamada em `MW` `LoadFile`). | Mensagem de erro com o nome do arquivo. |  ok por código e teste: `FileMessages.OutOfMemory` com o nome do arquivo, chamado em `MainWindow.xaml.cs`:174–176; `MessageTests.cs`:72 |

Resultados de 2026-10-22, executados pelo responsável no PRKing Notepad compilado (build Debug de `60f3c26`). Uma primeira rodada foi feita por engano no Bloco de Notas do Windows e foi descartada; ela só confirma o original.

---

## Divergências e destino

"Diferenças" do README conferida antes (11 itens): nenhuma das três abaixo estava lá. Destinos aceitos pelo responsável em 2026-10-22 ("Aceito D1–D3 como estão").

| ID | Linhas | O que difere | Destino | Motivo | Estado |
|---|---|---|---|---|---|
| **D1** | 6.1.a, 6.2.a, 6.8.a, 11.b | Pergunta de salvar usa `MessageBox` com Sim / Não / Cancelar; a spec pede Salvar / Não salvar / Cancelar | **Corrigir o código (U2):** caixa WPF própria com os três botões, chamada por um ponto único (`ConfirmDiscard`) | O rótulo "Sim" para "salvar" é ambíguo, e a caixa nativa (`MessageBox`) trava a thread de teste: com uma janela WPF própria a U3 consegue clicar no botão em processo, sem FlaUI. | Corrigida na U2 (`SaveChangesWindow`, `ConfirmDiscard`) |
| **D2** | 11.c, 6.2.d | "Grande demais" sai como erro; a spec diz aviso | **Corrigir o código (U2):** ícone de aviso | Troca de uma linha; sem motivo para divergir. | Corrigida na U2 (`MessageBoxImage.Warning`) |
| **D3** | 5.2.c, 9.b, 9.e | Fonte grava nome, tamanho, negrito e itálico; não grava conjunto de caracteres e reduz o peso a normal/negrito. Tamanho inicial da janela é 900 × 600 centralizado | **README, novo item 12 de "Diferenças"** | O WPF desenha em Unicode: o conjunto de caracteres do GDI não muda nada na tela; pesos intermediários aparecem como famílias próprias na caixa de fonte do Windows (por exemplo, "Segoe UI Light") e são gravados pelo nome. O tamanho de janela é "sugerido" pela spec. | Resolvida na U2 (README, Dif. 12) |

Nenhuma divergência vai para adendo da especificação: adendo só recebe fato confirmado do original (roteiro).

## Itens a confirmar

| Roteiro | Linhas da matriz | Linha da spec | Efeito da resposta | Resposta e destino (U2b, 2026-10-22) |
|---|---|---|---|---|
| R1 | 2.ai | §2, regras de habilitação | Se o original desabilita Ir para linha com quebra ligada: U2 decide (copiar ou registrar no README). | confirmado: habilitado também no original; nada a mudar (2.ai ok) |
| R2 | 4.1.d | §4.1 | Se o original também usa seleção de várias linhas (ou nenhuma): U2 ajusta `ShowSearchWindow` ou mantém a Dif. 6. | confirmado: várias linhas emendadas no original; Dif. 6 mantida (decisão do responsável) |
| R3 | 5.3.b | §5.3 | Se o original não tem Ctrl+roda: Dif. 7 passa a dizer "a mais". | confirmado: 10 % por clique; Dif. 7 sem "a confirmar" |
| R4 | 7.3.c | §7.3 | Se a fábrica for outra: U2 muda o padrão de `Settings.DefaultEncoding`. | confirmado: UTF-8 sem BOM, igual ao `Settings.DefaultEncoding` |
| R5 | 8.d | §8 | Se o original não converte ao colar: U2 avalia, e a Dif. 3 ganha o caso. | confirmado: converte ao gravar, igual ao nosso; tipo na barra não muda |
| R6 | 9.g | §9 e §13 (margens) | Margens do original viram o padrão de `PageSettings` (U2) e a Dif. 9 encolhe. | margens 20/20/25/25 mm iguais às nossas (com ressalva); cabeçalho e rodapé não observáveis; Dif. 9 ajustada |
| R7 | 8.e | §13 (fins misturados) | Se o original preserva os demais: U2 decide entre copiar (mudar `LineEndings`) e manter a Dif. 3. | confirmado: preserva as existentes; código mudou (`LineBreakMap`), Dif. 3 encolheu |

Os 6 "(a confirmar)" do texto da spec (§2, §4.1, §5.3, §7.3, §8, §9) e as 2 lacunas da §13 somam 7 itens distintos, porque a lacuna das margens é o mesmo assunto do "(a confirmar)" da §9.

## Verificação desta matriz

- Cada título `##`/`###` das §1–§11 da spec aparece aqui com o mesmo texto: 11 `##` e 17 `###` (contagem por Grep nos dois arquivos, registrada no handoff da U1).
- Nenhuma linha "faltante" sem busca: as ausências (2.i, 2.k, 2.n, 2.ag, 5.2.c, 5.3.c, 5.4.d, 6.3.f, 6.7.f, 7.2.b, 9.a) citam o padrão buscado e o resultado.
