using System.Globalization;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Input;
using PRKingNotepad.Core;

namespace PRKingNotepad.Ui.Tests;

/// <summary>Matriz §6 (ciclo de vida do arquivo), §8 (quebras de linha), §10 (impressão) e §11 (mensagens).</summary>
public class FileLifecycleTests
{
    private const string Untitled = "Documento sem nome - PRKing Notepad";

    private static string Quoted(string path) => $"\"{path}\"";

    // ---- §6.1 Novo ----

    [Fact]
    public void New_with_changes_asks_and_cancel_keeps_the_document() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.Cancel);
        app.Press(Key.N, ModifierKeys.Control);
        Assert.Equal(["Documento sem nome"], app.Dialogs.SaveQuestions);
        Assert.Equal("abc", app.Editor.Text);
        Assert.Equal("*" + Untitled, app.Window.Title);

        // Salvar num documento sem arquivo vira Salvar como; cancelar a caixa também cancela o Novo.
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.Save);
        app.Press(Key.N, ModifierKeys.Control);
        Assert.Single(app.SaveDialogs);
        Assert.Equal("abc", app.Editor.Text);
    });

    [Fact]
    public void New_empties_the_document_with_default_encoding_and_crlf() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", Convert.FromHexString("FFFE61000A00")));
        Assert.Equal(("UTF-16 LE", "Unix (LF)"), (app.Window.StatusEncoding.Text, app.Window.StatusLineEnding.Text));
        app.Press(Key.N, ModifierKeys.Control);
        Assert.Equal("", app.Editor.Text);
        Assert.Equal(Untitled, app.Window.Title);
        Assert.Equal(("UTF-8", "Windows (CRLF)"), (app.Window.StatusEncoding.Text, app.Window.StatusLineEnding.Text));
    });

    // ---- §6.2 Abrir ----

    [Fact]
    public void Open_with_changes_asks_first_and_cancel_skips_the_open_box() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.Cancel);
        app.Open(app.WriteFile("a.txt", "x"u8.ToArray()));
        Assert.Equal(0, app.OpenDialogCount);
        Assert.Equal("abc", app.Editor.Text);

        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.DontSave);
        app.Press(Key.O, ModifierKeys.Control);
        Assert.Equal(1, app.OpenDialogCount);
        Assert.Equal("x", app.Editor.Text);
    });

    [Fact]
    public void Open_error_shows_the_file_name_and_keeps_the_document() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("antes");
        string path = app.WriteFile("preso.txt", "x"u8.ToArray());
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.DontSave);
        using (new FileStream(path, FileMode.Open, FileAccess.ReadWrite, FileShare.None))
        {
            app.Open(path);
        }
        var shown = Assert.Single(app.Dialogs.Messages);
        Assert.Equal(MessageBoxImage.Error, shown.Icon);
        Assert.Contains("preso.txt", shown.Message);
        Assert.Equal("antes", app.Editor.Text);
    });

    [Fact]
    public void Open_adds_to_recent_documents_and_puts_the_caret_at_the_start() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string path = app.WriteFile("a.txt", "um\r\ndois\r\ntres"u8.ToArray());
        app.Open(path);
        Assert.Equal([path], app.Recent);
        Assert.Equal((0, 0), (app.Editor.SelectionStart, app.Editor.SelectionLength));
        Assert.Equal("Ln 1, Col 1", app.Window.StatusPosition.Text);
    });

    // ---- §6.3 Salvar ----

    [Fact]
    public void Save_without_a_file_becomes_save_as() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        string target = app.PathOf("novo.txt");
        app.SaveAnswer = (target, TextEncodingKind.Utf16Le);
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal(("*.txt", TextEncodingKind.Utf8), Assert.Single(app.SaveDialogs));
        Assert.Equal(Convert.FromHexString("FFFE610062006300"), File.ReadAllBytes(target));
        Assert.Equal("novo.txt - PRKing Notepad", app.Window.Title);
        Assert.Equal("UTF-16 LE", app.Window.StatusEncoding.Text);
        Assert.Equal([target], app.Recent);
    });

    [Fact]
    public void Ansi_loss_warns_cancel_does_not_write_and_ok_writes_and_reloads() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string path = app.WriteFile("a.txt", "a"u8.ToArray());
        app.Open(path, TextEncodingKind.Ansi);
        app.Type("中");

        app.Dialogs.Answers.Enqueue(MessageBoxResult.Cancel);
        app.Press(Key.S, ModifierKeys.Control);
        var warning = Assert.Single(app.Dialogs.Messages);
        Assert.Equal((MessageBoxButton.OKCancel, MessageBoxImage.Warning), (warning.Buttons, warning.Icon));
        Assert.Equal("a"u8.ToArray(), File.ReadAllBytes(path));
        Assert.Equal("*a.txt - PRKing Notepad", app.Window.Title);

        app.Dialogs.Answers.Enqueue(MessageBoxResult.OK);
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("?a"u8.ToArray(), File.ReadAllBytes(path));
        Assert.Equal("?a", app.Editor.Text);
        Assert.Equal("a.txt - PRKing Notepad", app.Window.Title);
        Assert.Equal("ANSI", app.Window.StatusEncoding.Text);
    });

    // ---- §6.5 Diário .LOG ----

    [Fact]
    public void Log_file_gets_a_time_stamp_with_the_caret_at_the_end_and_is_marked_changed() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("diario.txt", ".LOG\r\nontem"u8.ToArray()));
        string entry = TimeStamp.LogEntry(TimeStamp.Format(Notepad.FixedNow, CultureInfo.CurrentCulture));
        Assert.Equal(".LOG\r\nontem" + entry, app.Editor.Text);
        Assert.Equal((app.Editor.Text.Length, 0), (app.Editor.SelectionStart, app.Editor.SelectionLength));
        Assert.Equal("*diario.txt - PRKing Notepad", app.Window.Title);
    });

    // ---- §6.7 Linha de comando / §11.a, 11.d ----

    [Fact]
    public void Missing_file_on_the_command_line_yes_creates_and_opens_it() => Ui.Run(() =>
    {
        string path = "";
        using var app = new Notepad(folder => Quoted(path = Path.Combine(folder, "novo.txt")));
        app.Dialogs.Answers.Enqueue(MessageBoxResult.Yes);
        app.Show();
        var question = Assert.Single(app.Dialogs.Messages);
        Assert.Equal((MessageBoxButton.YesNoCancel, MessageBoxImage.Question), (question.Buttons, question.Icon));
        Assert.Contains(path, question.Message);
        Assert.Empty(File.ReadAllBytes(path));
        Assert.Equal("novo.txt - PRKing Notepad", app.Window.Title);
    });

    [Fact]
    public void Missing_file_on_the_command_line_no_opens_empty_and_cancel_closes() => Ui.Run(() =>
    {
        string path = "";
        using (var app = new Notepad(folder => Quoted(path = Path.Combine(folder, "novo.txt"))))
        {
            app.Dialogs.Answers.Enqueue(MessageBoxResult.No);
            app.Show();
            Assert.False(File.Exists(path));
            Assert.False(app.IsClosed);
            Assert.Equal(Untitled, app.Window.Title);
        }
        using (var app = new Notepad(folder => Quoted(path = Path.Combine(folder, "novo.txt"))))
        {
            app.Dialogs.Answers.Enqueue(MessageBoxResult.Cancel);
            app.Show();
            Assert.False(File.Exists(path));
            Assert.True(app.IsClosed);
        }
    });

    [Fact]
    public void File_that_cannot_be_created_shows_an_error_with_its_name() => Ui.Run(() =>
    {
        string path = "";
        using var app = new Notepad(folder => Quoted(path = Path.Combine(folder, "nao-existe", "novo.txt")));
        app.Dialogs.Answers.Enqueue(MessageBoxResult.Yes);
        app.Show();
        Assert.Equal(2, app.Dialogs.Messages.Count);
        var error = app.Dialogs.Messages[1];
        Assert.Equal(MessageBoxImage.Error, error.Icon);
        Assert.Contains("novo.txt", error.Message);
        Assert.Equal(Untitled, app.Window.Title);
    });

    // ---- §6.8 Fechar ----

    [Fact]
    public void Closing_with_changes_names_the_document_and_cancel_keeps_the_window() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", "x"u8.ToArray()));
        app.Type("y");
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.Cancel);
        app.Window.Close();
        Assert.Equal(["a.txt"], app.Dialogs.SaveQuestions);
        Assert.False(app.IsClosed);

        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.Save);
        app.Window.Close();
        Assert.True(app.IsClosed);
        Assert.Equal("yx"u8.ToArray(), File.ReadAllBytes(app.PathOf("a.txt")));
    });

    [Fact]
    public void Closing_saves_the_preferences() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Ui.Click(app.Window.WordWrapMenuItem);
        app.Press(Key.F, ModifierKeys.Control);
        app.Owned<FindReplaceWindow>().TermBox.Text = "procurado";
        Assert.False(File.Exists(app.SettingsPath));
        app.Window.Close();
        var saved = SettingsStore.Load(app.SettingsPath);
        Assert.True(saved.WordWrap);
        Assert.Equal("procurado", saved.Search.Term);
    });

    // ---- §8 Quebras de linha misturadas (lacuna §13, R7 do §14) ----

    [Fact]
    public void Mixed_line_breaks_survive_typing_replace_all_undo_and_redo() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string path = app.WriteFile("misto.txt", "a1\r\nb1\nc1\rd1\ne"u8.ToArray());
        app.Open(path);
        Assert.Equal("a1\r\nb1\r\nc1\r\nd1\r\ne", app.Editor.Text);
        Assert.Equal("Windows (CRLF)", app.Window.StatusLineEnding.Text);

        app.Editor.Select(8, 0);
        app.Type("X");
        app.Editor.Select(app.Editor.Text.Length, 0);
        app.Type("\r\nf");
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("a1\r\nb1\nXc1\rd1\ne\r\nf"u8.ToArray(), File.ReadAllBytes(path));

        // Quatro trocas num só evento de alteração, entre as quebras guardadas.
        app.Press(Key.H, ModifierKeys.Control);
        var replace = app.Owned<FindReplaceWindow>();
        replace.TermBox.Text = "1";
        replace.ReplaceBox.Text = "22";
        Ui.Click(Ui.Button(replace, "Substituir _tudo"));
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("a22\r\nb22\nXc22\rd22\ne\r\nf"u8.ToArray(), File.ReadAllBytes(path));

        app.Press(Key.Z, ModifierKeys.Control);
        Assert.Equal("a1\r\nb1\r\nXc1\r\nd1\r\ne\r\nf", app.Editor.Text);
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("a1\r\nb1\nXc1\rd1\ne\r\nf"u8.ToArray(), File.ReadAllBytes(path));

        app.Press(Key.Y, ModifierKeys.Control);
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("a22\r\nb22\nXc22\rd22\ne\r\nf"u8.ToArray(), File.ReadAllBytes(path));
    });

    [Fact]
    public void Deleted_mixed_break_comes_back_in_the_document_type_after_undo() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string path = app.WriteFile("misto.txt", "a\r\nb\nc"u8.ToArray());
        app.Open(path);
        app.Editor.Select(4, 2);
        app.Press(Key.Delete);
        Assert.Equal("a\r\nbc", app.Editor.Text);
        app.Press(Key.Z, ModifierKeys.Control);
        app.Press(Key.S, ModifierKeys.Control);
        // Dif. 3 do README: a quebra desfeita volta no tipo do documento.
        Assert.Equal("a\r\nb\r\nc"u8.ToArray(), File.ReadAllBytes(path));
    });

    // ---- §10 Impressão ----

    [Fact]
    public void Page_setup_without_a_printer_keeps_margins_header_and_footer() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string? printer = null;
        bool openAfterBadMargin = false;
        Ui.WhenOpened<PageSetupWindow>(app.Window, dialog =>
        {
            printer = dialog.PrinterText.Text;
            Assert.False(dialog.SizeBox.IsEnabled);
            dialog.LeftBox.Text = "500";
            Ui.Click(Ui.Button(dialog, "OK"));
            openAfterBadMargin = dialog.IsVisible;
            dialog.LeftBox.Text = "10";
            dialog.HeaderBox.Text = "Cabeçalho";
            dialog.FooterBox.Text = "Rodapé &p";
            Ui.Click(Ui.Button(dialog, "OK"));
        });
        Ui.Click(app.Menu("Configurar pá_gina..."));

        Assert.Equal("Nenhuma impressora disponível: papel, origem e orientação ficam desativados.", printer);
        Assert.True(openAfterBadMargin);
        var warning = Assert.Single(app.Dialogs.Messages);
        Assert.Equal(MessageBoxImage.Warning, warning.Icon);

        app.Window.Close();
        var page = SettingsStore.Load(app.SettingsPath).Page;
        Assert.Equal((10.0, "Cabeçalho", "Rodapé &p"), (page.MarginLeftMm, page.Header, page.Footer));
    });

    [Fact]
    public void Print_progress_shows_pages_and_cancel_asks_to_stop() => Ui.Run(() =>
    {
        var progress = new PrintProgressWindow("a.txt", 3) { ShowActivated = false, ShowInTaskbar = false, Left = -20000, Top = -20000 };
        int cancels = 0;
        progress.CancelRequested += (_, _) => cancels++;
        progress.Show();
        Ui.DoEvents();
        Assert.Equal("Preparando...", progress.PageText.Text);
        progress.SetPage(2);
        Assert.Equal(("Página 2 de 3", 2.0), (progress.PageText.Text, progress.Bar.Value));

        Ui.Click(Ui.Button(progress, "Cancelar"));
        Assert.Equal((1, "Cancelando..."), (cancels, progress.PageText.Text));
        progress.Close();
        Assert.Equal(2, cancels);
        Assert.True(progress.IsVisible);
        progress.Finish();
        Assert.False(progress.IsVisible);
    });

    // ---- §11 Mensagens ----

    [Theory]
    [InlineData("_Salvar", "Save")]
    [InlineData("_Não salvar", "DontSave")]
    [InlineData("Cancelar", "Cancel")]
    [InlineData(null, "Cancel")]
    public void Save_question_window_names_the_file_and_returns_the_button(string? button, string expected) => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string? message = null;
        Ui.WhenOpened<SaveChangesWindow>(app.Window, dialog =>
        {
            message = dialog.MessageText.Text;
            Assert.Equal(["_Salvar", "_Não salvar", "Cancelar"],
                Ui.Descendants<System.Windows.Controls.Button>(dialog).Select(b => (string)b.Content));
            if (button is null)
            {
                dialog.Close();
            }
            else
            {
                Ui.Click(Ui.Button(dialog, button));
            }
        });
        var choice = new SystemDialogs().AskToSave(app.Window, "a.txt");
        Assert.Equal(Enum.Parse<SaveChoice>(expected), choice);
        Assert.Equal("Deseja salvar as alterações em “a.txt”?", message);
    });

    [Fact]
    public void Too_large_file_shows_a_warning_with_its_name_and_keeps_the_document() => Ui.Run(() =>
    {
        using var app = new Notepad(maxFileBytes: 4).Show();
        app.Type("antes");
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.DontSave);
        app.Open(app.WriteFile("grande.txt", "0123456789"u8.ToArray()));
        var shown = Assert.Single(app.Dialogs.Messages);
        Assert.Equal((MessageBoxImage.Warning, FileMessages.TooLarge(app.PathOf("grande.txt"))), (shown.Icon, shown.Message));
        Assert.Contains("grande.txt", shown.Message);
        Assert.Equal("antes", app.Editor.Text);
    });
}
