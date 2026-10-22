using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using PRKingNotepad.Core;

namespace PRKingNotepad.Ui.Tests;

/// <summary>Matriz §4 (localizar, substituir, ir para linha) e §5 (quebra, zoom, barra de status).</summary>
public class SearchAndDisplayTests
{
    // ---- §4.1 Localizar e substituir ----

    [Fact]
    public void Search_window_is_modeless_and_only_one_is_open() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Press(Key.F, ModifierKeys.Control);
        app.Press(Key.F, ModifierKeys.Control);
        var find = Assert.Single(app.Window.OwnedWindows.OfType<FindReplaceWindow>());
        app.Type("ainda edita");
        Assert.Equal("ainda edita", app.Editor.Text);
        Assert.True(find.IsVisible);

        app.Press(Key.H, ModifierKeys.Control);
        Assert.True(Assert.Single(app.Window.OwnedWindows.OfType<FindReplaceWindow>()).ReplaceMode);
    });

    [Fact]
    public void Search_window_reopens_with_the_last_values() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Press(Key.F, ModifierKeys.Control);
        var first = app.Owned<FindReplaceWindow>();
        first.TermBox.Text = "termo";
        Ui.Check(first.MatchCaseBox, true);
        Ui.Check(first.WrapBox, true);
        Ui.Check(first.UpRadio, true);
        first.Close();
        Ui.DoEvents();

        app.Press(Key.F, ModifierKeys.Control);
        var again = app.Owned<FindReplaceWindow>();
        Assert.NotSame(first, again);
        Assert.Equal("termo", again.TermBox.Text);
        Assert.Equal((true, true, true), (again.MatchCaseBox.IsChecked, again.WrapBox.IsChecked, again.UpRadio.IsChecked));
    });

    [Fact]
    public void Single_line_selection_becomes_the_term_and_multi_line_does_not() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => s.Search.Term = "antes").Show();
        app.Type("um dois\r\ntres");
        app.Editor.Select(3, 4);
        app.Press(Key.F, ModifierKeys.Control);
        Assert.Equal("dois", app.Owned<FindReplaceWindow>().TermBox.Text);

        app.Editor.Select(0, 10);
        app.Press(Key.H, ModifierKeys.Control);
        Assert.Equal("dois", app.Owned<FindReplaceWindow>().TermBox.Text);

        app.Editor.Select(0, 2);
        app.Press(Key.H, ModifierKeys.Control);
        Assert.Equal("um", app.Owned<FindReplaceWindow>().TermBox.Text);
    });

    [Fact]
    public void Not_found_shows_an_information_message() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Press(Key.F, ModifierKeys.Control);
        var find = app.Owned<FindReplaceWindow>();
        find.TermBox.Text = "zzz";
        Ui.Click(Ui.Button(find, "Localizar _próxima"));
        var shown = Assert.Single(app.Dialogs.Messages);
        Assert.Equal(("PRKing Notepad", "Não foi encontrado: “zzz”.", null, MessageBoxImage.Information),
            (shown.Caption, shown.Message, shown.Buttons, shown.Icon));
    });

    [Fact]
    public void Wrapping_around_is_reported_in_the_status_bar_and_typing_clears_it() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => { s.Search.Term = "a"; s.Search.WrapAround = true; }).Show();
        Assert.Equal("", app.Window.StatusMessage.Text);
        app.Type("a b");
        app.Editor.Select(0, 1);
        app.Press(Key.F3);
        Assert.Equal(0, app.Editor.SelectionStart);
        Assert.Equal("A busca chegou ao fim e recomeçou do início.", app.Window.StatusMessage.Text);
        app.Press(Key.F3, ModifierKeys.Shift);
        Assert.Equal("A busca chegou ao início e recomeçou do fim.", app.Window.StatusMessage.Text);
        app.Type("x");
        Assert.Equal("", app.Window.StatusMessage.Text);
    });

    [Fact]
    public void Replace_all_is_undone_by_a_single_Ctrl_Z() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        const string original = "a-b-a\r\nA-a";
        app.Open(app.WriteFile("a.txt", Encoding.UTF8.GetBytes(original)));
        app.Press(Key.H, ModifierKeys.Control);
        var replace = app.Owned<FindReplaceWindow>();
        replace.TermBox.Text = "a";
        replace.ReplaceBox.Text = "xy";
        Ui.Click(Ui.Button(replace, "Substituir _tudo"));
        Assert.Equal("xy-b-xy\r\nxy-xy", app.Editor.Text);
        Assert.Equal("4 ocorrências substituídas.", app.Window.StatusMessage.Text);

        app.Press(Key.Z, ModifierKeys.Control);
        Assert.Equal(original, app.Editor.Text);
        Assert.False(app.Editor.CanUndo);
    });

    [Fact]
    public void Replace_swaps_the_selection_when_it_is_the_term_and_moves_on() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("a a a");
        app.Editor.Select(0, 0);
        app.Press(Key.H, ModifierKeys.Control);
        var replace = app.Owned<FindReplaceWindow>();
        replace.TermBox.Text = "a";
        replace.ReplaceBox.Text = "b";
        var button = Ui.Button(replace, "_Substituir");
        Ui.Click(button);
        Assert.Equal(("a a a", 0, 1), (app.Editor.Text, app.Editor.SelectionStart, app.Editor.SelectionLength));
        Ui.Click(button);
        Assert.Equal(("b a a", 2, 1), (app.Editor.Text, app.Editor.SelectionStart, app.Editor.SelectionLength));
    });

    // ---- §4.2 Ir para linha ----

    [Fact]
    public void Ctrl_G_starts_at_the_current_line_and_moves_the_caret_to_the_chosen_line() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("l1\r\nl2\r\nl3");
        app.Editor.Select(5, 0);
        string? initial = null;
        Ui.WhenOpened<GoToLineWindow>(app.Window, dialog =>
        {
            initial = dialog.LineBox.Text;
            dialog.LineBox.SelectAll();
            Input.Type(dialog.LineBox, "x3");
            Assert.Equal("3", dialog.LineBox.Text);
            Ui.Click(Ui.Button(dialog, "_Ir"));
        });
        app.Press(Key.G, ModifierKeys.Control);
        Assert.Equal("2", initial);
        Assert.Equal((8, 0), (app.Editor.SelectionStart, app.Editor.SelectionLength));
        Assert.Equal("Ln 3, Col 1", app.Window.StatusPosition.Text);
    });

    [Fact]
    public void Line_past_the_end_warns_and_keeps_the_box_open() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("l1\r\nl2");
        bool stillOpen = false;
        Ui.WhenOpened<GoToLineWindow>(app.Window, dialog =>
        {
            dialog.LineBox.Text = "99";
            Ui.Click(Ui.Button(dialog, "_Ir"));
            stillOpen = dialog.IsVisible;
            Ui.Click(Ui.Button(dialog, "Cancelar"));
        });
        app.Press(Key.G, ModifierKeys.Control);
        Assert.True(stillOpen);
        var shown = Assert.Single(app.Dialogs.Messages);
        Assert.Equal(("A linha 99 não existe: o documento tem 2 linhas.", MessageBoxImage.Warning), (shown.Message, shown.Icon));
        Assert.Equal(6, app.Editor.CaretIndex);
    });

    // ---- §5 Formatação e exibição ----

    [Fact]
    public void Long_lines_scroll_without_wrap_and_fit_the_width_with_wrap() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Editor.Text = new string('x', 2000);
        Ui.DoEvents();
        Assert.True(app.Editor.ExtentWidth > app.Editor.ViewportWidth);
        Ui.Click(app.Window.WordWrapMenuItem);
        Assert.True(app.Editor.ExtentWidth <= app.Editor.ViewportWidth);
        Assert.True(app.Editor.LineCount > 1);
    });

    [Fact]
    public void Line_and_column_count_file_lines_with_word_wrap_on() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => s.WordWrap = true).Show();
        app.Editor.Text = "a\r\n" + new string('x', 2000);
        app.Editor.Select(app.Editor.Text.Length, 0);
        Ui.DoEvents();
        Assert.True(app.Editor.GetLineIndexFromCharacterIndex(app.Editor.CaretIndex) > 1);
        Assert.Equal("Ln 2, Col 2001", app.Window.StatusPosition.Text);
    });

    [Fact]
    public void Ctrl_mouse_wheel_zooms_and_plain_wheel_does_not() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Input.Wheel(app.Editor, 120, ModifierKeys.Control);
        Assert.Equal("110%", app.Window.StatusZoom.Text);
        Input.Wheel(app.Editor, -120, ModifierKeys.Control);
        Input.Wheel(app.Editor, -120, ModifierKeys.Control);
        Assert.Equal("90%", app.Window.StatusZoom.Text);
        Input.Wheel(app.Editor, 120, ModifierKeys.None);
        Assert.Equal("90%", app.Window.StatusZoom.Text);
    });

    [Fact]
    public void Status_bar_shows_line_and_column() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal("Ln 1, Col 1", app.Window.StatusPosition.Text);
        app.Type("abc\r\nde");
        Assert.Equal("Ln 2, Col 3", app.Window.StatusPosition.Text);
        app.Editor.Select(1, 0);
        Ui.DoEvents();
        Assert.Equal("Ln 1, Col 2", app.Window.StatusPosition.Text);
    });

    [Theory]
    [InlineData("a\r\nb\nc", "Windows (CRLF)")]
    [InlineData("a\nb\r\nc", "Unix (LF)")]
    [InlineData("a\rb", "Macintosh (CR)")]
    public void Status_bar_shows_the_detected_line_ending(string content, string expected) => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal("Windows (CRLF)", app.Window.StatusLineEnding.Text);
        app.Open(app.WriteFile("a.txt", Encoding.ASCII.GetBytes(content)));
        Assert.Equal(expected, app.Window.StatusLineEnding.Text);
    });

    [Theory]
    [InlineData("61", null, "UTF-8")]
    [InlineData("EFBBBF61", null, "UTF-8 com BOM")]
    [InlineData("FFFE6100", null, "UTF-16 LE")]
    [InlineData("FEFF0061", null, "UTF-16 BE")]
    [InlineData("61", TextEncodingKind.Ansi, "ANSI")]
    public void Status_bar_shows_the_encoding(string hex, TextEncodingKind? forced, string expected) => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", Convert.FromHexString(hex)), forced);
        Assert.Equal("a", app.Editor.Text);
        Assert.Equal(expected, app.Window.StatusEncoding.Text);
    });

    [Fact]
    public void Status_bar_visibility_is_remembered() => Ui.Run(() =>
    {
        using (var app = new Notepad().Show())
        {
            Ui.Click(app.Window.StatusBarMenuItem);
            app.Window.Close();
            Assert.False(SettingsStore.Load(app.SettingsPath).StatusBarVisible);
        }
        using var next = new Notepad(settings: s => s.StatusBarVisible = false).Show();
        Assert.Equal(Visibility.Collapsed, next.Window.StatusBar.Visibility);
        Assert.False(next.Window.StatusBarMenuItem.IsChecked);
    });
}
