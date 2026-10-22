using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using PRKingNotepad.Core;

namespace PRKingNotepad.Ui.Tests;

/// <summary>Matriz §1 (janela), §2 (comandos e atalhos, cada um enviado como tecla) e §3 (edição).</summary>
public class WindowAndShortcutTests
{
    private const string Untitled = "Documento sem nome - PRKing Notepad";

    // ---- §1 Janela ----

    [Fact]
    public void Window_has_menu_on_top_status_bar_below_and_editor_filling_the_rest() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        var panel = Assert.IsType<DockPanel>(app.Window.Content);
        var children = panel.Children.Cast<UIElement>().ToList();
        Assert.Equal(Dock.Top, DockPanel.GetDock(Assert.IsType<Menu>(children[0])));
        Assert.Equal(Dock.Bottom, DockPanel.GetDock(Assert.IsType<StatusBar>(children[1])));
        Assert.Same(app.Editor, children[2]);
        Assert.True(panel.LastChildFill);
        Assert.Equal(panel.ActualWidth, app.Editor.ActualWidth, 1);
        Assert.Equal(panel.ActualHeight - children[0].RenderSize.Height - children[1].RenderSize.Height,
            app.Editor.ActualHeight, 1);
    });

    [Fact]
    public void Title_shows_name_and_asterisk_when_changed() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal(Untitled, app.Window.Title);
        app.Type("a");
        Assert.Equal("*" + Untitled, app.Window.Title);

        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.DontSave);
        app.Open(app.WriteFile("nota.txt", "x"u8.ToArray()));
        Assert.Equal("nota.txt - PRKing Notepad", app.Window.Title);
    });

    [Fact]
    public void Window_placement_is_restored_from_settings() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => s.Window = new WindowPlacement(100, 120, 640, 480, false));
        Assert.Equal(WindowStartupLocation.Manual, app.Window.WindowStartupLocation);
        Assert.Equal((100.0, 120.0, 640.0, 480.0), (app.Window.Left, app.Window.Top, app.Window.Width, app.Window.Height));
    });

    // ---- §2 Arquivo ----

    [Fact]
    public void Ctrl_N_starts_a_new_document() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Dialogs.SaveAnswers.Enqueue(SaveChoice.DontSave);
        app.Press(Key.N, ModifierKeys.Control);
        Assert.Equal("", app.Editor.Text);
        Assert.Equal(Untitled, app.Window.Title);
    });

    [Fact]
    public void Ctrl_O_opens_the_chosen_file() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", "linha"u8.ToArray()));
        Assert.Equal("linha", app.Editor.Text);
    });

    [Fact]
    public void Ctrl_S_saves_to_the_current_file() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        string path = app.WriteFile("a.txt", "um"u8.ToArray());
        app.Open(path);
        app.Editor.Select(2, 0);
        app.Type("!");
        app.Press(Key.S, ModifierKeys.Control);
        Assert.Equal("um!"u8.ToArray(), File.ReadAllBytes(path));
        Assert.Empty(app.SaveDialogs);
    });

    [Fact]
    public void Ctrl_Shift_S_asks_for_a_new_name() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", "um"u8.ToArray()));
        string target = app.PathOf("b.txt");
        app.SaveAnswer = (target, TextEncodingKind.Utf8);
        app.Press(Key.S, ModifierKeys.Control | ModifierKeys.Shift);
        Assert.Equal(("a.txt", TextEncodingKind.Utf8), Assert.Single(app.SaveDialogs));
        Assert.Equal("um"u8.ToArray(), File.ReadAllBytes(target));
        Assert.Equal("b.txt - PRKing Notepad", app.Window.Title);
    });

    [Fact]
    public void Page_setup_menu_opens_the_page_setup_box() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        bool opened = false;
        Ui.WhenOpened<PageSetupWindow>(app.Window, dialog =>
        {
            opened = true;
            Ui.Click(Ui.Button(dialog, "Cancelar"));
        });
        Ui.Click(app.Menu("Configurar pá_gina..."));
        Assert.True(opened);
    });

    [Fact]
    public void Exit_menu_closes_the_window() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Ui.Click(app.Menu("Sa_ir"));
        Assert.True(app.IsClosed);
    });

    [Fact]
    public void New_window_shortcut_starts_another_instance() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Press(Key.N, ModifierKeys.Control | ModifierKeys.Shift);
        Assert.Equal(1, app.NewInstances);
    });

    // ---- §2 Editar ----

    [Fact]
    public void Ctrl_Z_and_Alt_Backspace_undo() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("ab");
        app.Press(Key.Z, ModifierKeys.Control);
        Assert.Equal("", app.Editor.Text);
        app.Type("cd");
        app.Press(Key.Back, ModifierKeys.Alt);
        Assert.Equal("", app.Editor.Text);
    });

    [Fact]
    public void Ctrl_X_cuts_the_selection() => Ui.Run(() =>
    {
        using var clipboard = new ClipboardScope();
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Editor.Select(1, 1);
        app.Press(Key.X, ModifierKeys.Control);
        Assert.Equal("ac", app.Editor.Text);
        Assert.Equal("b", Clipboard.GetText());
    });

    [Theory]
    [InlineData(Key.C)]
    [InlineData(Key.Insert)]
    public void Ctrl_C_and_Ctrl_Insert_copy_the_selection(Key key) => Ui.Run(() =>
    {
        using var clipboard = new ClipboardScope();
        Clipboard.SetText("antes");
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Editor.Select(0, 2);
        app.Press(key, ModifierKeys.Control);
        Assert.Equal("ab", Clipboard.GetText());
        Assert.Equal("abc", app.Editor.Text);
    });

    [Fact]
    public void Ctrl_V_pastes_at_the_caret() => Ui.Run(() =>
    {
        using var clipboard = new ClipboardScope();
        Clipboard.SetText("XY");
        using var app = new Notepad().Show();
        app.Type("ab");
        app.Editor.Select(1, 0);
        app.Press(Key.V, ModifierKeys.Control);
        Assert.Equal("aXYb", app.Editor.Text);
    });

    [Fact]
    public void Del_key_and_Delete_menu_remove_the_selection() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abcd");
        app.Editor.Select(1, 1);
        app.Press(Key.Delete);
        Assert.Equal("acd", app.Editor.Text);
        app.Editor.Select(1, 1);
        app.Requery();
        Ui.Click(app.Menu("_Excluir"));
        Assert.Equal("ad", app.Editor.Text);
    });

    [Fact]
    public void Ctrl_F_opens_find_and_Ctrl_H_opens_replace() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Press(Key.F, ModifierKeys.Control);
        var find = app.Owned<FindReplaceWindow>();
        Assert.False(find.ReplaceMode);
        Assert.True(find.IsVisible);

        app.Press(Key.H, ModifierKeys.Control);
        var replace = app.Owned<FindReplaceWindow>();
        Assert.True(replace.ReplaceMode);
        Assert.False(find.IsVisible);
    });

    [Fact]
    public void F3_finds_next_and_Shift_F3_finds_previous() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => s.Search.Term = "x").Show();
        app.Type("x x x");
        app.Editor.Select(0, 0);
        app.Press(Key.F3);
        Assert.Equal((0, 1), (app.Editor.SelectionStart, app.Editor.SelectionLength));
        app.Press(Key.F3);
        Assert.Equal(2, app.Editor.SelectionStart);
        app.Press(Key.F3);
        Assert.Equal(4, app.Editor.SelectionStart);
        app.Press(Key.F3, ModifierKeys.Shift);
        Assert.Equal(2, app.Editor.SelectionStart);
    });

    [Theory]
    [InlineData(ModifierKeys.None)]
    [InlineData(ModifierKeys.Shift)]
    public void F3_without_a_term_opens_find(ModifierKeys modifiers) => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        app.Press(Key.F3, modifiers);
        Assert.False(app.Owned<FindReplaceWindow>().ReplaceMode);
        Assert.Empty(app.Dialogs.Messages);
    });

    [Fact]
    public void Ctrl_A_selects_all() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc\r\nd");
        app.Press(Key.A, ModifierKeys.Control);
        Assert.Equal((0, app.Editor.Text.Length), (app.Editor.SelectionStart, app.Editor.SelectionLength));
    });

    [Fact]
    public void F5_inserts_time_and_date_at_the_caret_as_an_undoable_edit() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("ab");
        app.Editor.Select(1, 0);
        app.Press(Key.F5);
        string stamp = TimeStamp.Format(Notepad.FixedNow, System.Globalization.CultureInfo.CurrentCulture);
        Assert.Equal("a" + stamp + "b", app.Editor.Text);
        Assert.Equal(1 + stamp.Length, app.Editor.CaretIndex);
        app.Press(Key.Z, ModifierKeys.Control);
        Assert.Equal("ab", app.Editor.Text);
    });

    // ---- §2 Formatar, Exibir, Ajuda ----

    [Fact]
    public void Word_wrap_menu_toggles_wrapping_and_horizontal_scrolling() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal((TextWrapping.NoWrap, ScrollBarVisibility.Auto), (app.Editor.TextWrapping, app.Editor.HorizontalScrollBarVisibility));
        Ui.Click(app.Window.WordWrapMenuItem);
        Assert.True(app.Window.WordWrapMenuItem.IsChecked);
        Assert.Equal((TextWrapping.Wrap, ScrollBarVisibility.Disabled), (app.Editor.TextWrapping, app.Editor.HorizontalScrollBarVisibility));
        Ui.Click(app.Window.WordWrapMenuItem);
        Assert.Equal((TextWrapping.NoWrap, ScrollBarVisibility.Auto), (app.Editor.TextWrapping, app.Editor.HorizontalScrollBarVisibility));
    });

    [Fact]
    public void Zoom_shortcuts_change_the_zoom_shown_in_the_status_bar() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal("100%", app.Window.StatusZoom.Text);
        app.Press(Key.OemPlus, ModifierKeys.Control);
        Assert.Equal("110%", app.Window.StatusZoom.Text);
        app.Press(Key.Add, ModifierKeys.Control);
        Assert.Equal("120%", app.Window.StatusZoom.Text);
        app.Press(Key.OemMinus, ModifierKeys.Control);
        app.Press(Key.Subtract, ModifierKeys.Control);
        app.Press(Key.Subtract, ModifierKeys.Control);
        Assert.Equal("90%", app.Window.StatusZoom.Text);
        app.Press(Key.D0, ModifierKeys.Control);
        Assert.Equal("100%", app.Window.StatusZoom.Text);
    });

    [Fact]
    public void Status_bar_menu_toggles_the_status_bar() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.Equal(Visibility.Visible, app.Window.StatusBar.Visibility);
        Ui.Click(app.Window.StatusBarMenuItem);
        Assert.Equal(Visibility.Collapsed, app.Window.StatusBar.Visibility);
        Ui.Click(app.Window.StatusBarMenuItem);
        Assert.Equal(Visibility.Visible, app.Window.StatusBar.Visibility);
    });

    [Fact]
    public void F1_opens_help() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Press(Key.F1);
        Assert.True(app.Owned<HelpWindow>().IsVisible);
    });

    [Fact]
    public void About_menu_opens_the_about_box() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        bool opened = false;
        Ui.WhenOpened<AboutWindow>(app.Window, dialog =>
        {
            opened = true;
            Ui.Click(Ui.Button(dialog, "OK"));
        });
        Ui.Click(app.Menu("_Sobre o PRKing Notepad"));
        Assert.True(opened);
    });

    // ---- §2 Habilitação dos itens de menu ----

    [Fact]
    public void Cut_copy_and_delete_are_enabled_only_with_a_selection() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Type("abc");
        string[] items = ["Recor_tar", "_Copiar", "_Excluir"];
        Assert.All(items, header => Assert.False(app.IsEnabled(header), header));
        app.Editor.Select(0, 1);
        Assert.All(items, header => Assert.True(app.IsEnabled(header), header));
    });

    [Fact]
    public void Undo_is_enabled_only_when_there_is_something_to_undo() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        Assert.False(app.IsEnabled("_Desfazer"));
        app.Type("a");
        Assert.True(app.IsEnabled("_Desfazer"));
        app.Press(Key.Z, ModifierKeys.Control);
        Assert.False(app.IsEnabled("_Desfazer"));
    });

    [Fact]
    public void Opening_a_file_cannot_be_undone() => Ui.Run(() =>
    {
        using var app = new Notepad().Show();
        app.Open(app.WriteFile("a.txt", "abc"u8.ToArray()));
        Assert.False(app.Editor.CanUndo);
        Assert.False(app.IsEnabled("_Desfazer"));
    });

    [Fact]
    public void Paste_is_enabled_only_with_text_on_the_clipboard() => Ui.Run(() =>
    {
        using var clipboard = new ClipboardScope();
        using var app = new Notepad().Show();

        var pixel = BitmapSource.Create(1, 1, 96, 96, PixelFormats.Bgra32, null, new byte[4], 4);
        Clipboard.SetImage(pixel);
        Assert.False(Clipboard.ContainsText());
        Assert.False(app.IsEnabled("Co_lar"));

        Clipboard.SetText("t");
        Assert.True(app.IsEnabled("Co_lar"));
    });

    [Fact]
    public void Go_to_line_stays_available_with_word_wrap() => Ui.Run(() =>
    {
        using var app = new Notepad(settings: s => s.WordWrap = true).Show();
        Assert.True(app.IsEnabled("_Ir para linha..."));
        bool opened = false;
        Ui.WhenOpened<GoToLineWindow>(app.Window, dialog =>
        {
            opened = true;
            Ui.Click(Ui.Button(dialog, "Cancelar"));
        });
        app.Press(Key.G, ModifierKeys.Control);
        Assert.True(opened);
    });
}
