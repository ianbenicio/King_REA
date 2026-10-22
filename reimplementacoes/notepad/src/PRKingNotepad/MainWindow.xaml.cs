using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using PRKingNotepad.Core;

namespace PRKingNotepad;

public partial class MainWindow : Window
{
    private const string AppName = "PRKing Notepad";
    private const string UntitledName = "Documento sem nome";

    private readonly MainWindowServices _services;
    private readonly int _ansiCodePage = (int)NativeMethods.GetACP();
    private string? _path;
    private TextEncodingKind _encoding;
    private LineEnding _lineEnding = LineEnding.CrLf;
    private bool _dirty;
    private bool _loading;
    private readonly SearchState _search = new();
    private FindReplaceWindow? _searchWindow;

    public MainWindow() : this(new MainWindowServices())
    {
    }

    internal MainWindow(MainWindowServices services)
    {
        _services = services;
        _settingsPath = services.SettingsPath;
        _settings = SettingsStore.Load(_settingsPath);
        InitializeComponent();
        ApplySettings();
        SetDocument("", null, DefaultEncoding, LineEnding.CrLf);
    }

    private string DocumentName => _path is null ? UntitledName : Path.GetFileName(_path);

    // ---- Ciclo de vida do arquivo (especificação, seção 6) ----

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        Editor.Focus();
        OpenFromCommandLine();
    }

    private void OpenFromCommandLine()
    {
        var request = CommandLine.Parse(CommandLine.ArgumentsOf(Environment.CommandLine));
        if (request.Path is null)
        {
            return;
        }

        string path;
        try
        {
            path = CommandLine.ResolvePath(request.Path, Environment.CurrentDirectory, File.Exists);
        }
        catch (Exception ex) when (FileMessages.IsFileError(ex))
        {
            ShowError(FileMessages.Describe(ex, request.Path, opening: true));
            return;
        }

        if (!File.Exists(path))
        {
            var answer = Ask($"O arquivo “{path}” não existe.\n\nDeseja criá-lo?",
                MessageBoxButton.YesNoCancel, MessageBoxImage.Question);
            if (answer == MessageBoxResult.Cancel)
            {
                Close();
                return;
            }
            if (answer == MessageBoxResult.No)
            {
                return;
            }
            try
            {
                File.WriteAllBytes(path, []);
            }
            catch (Exception ex) when (FileMessages.IsFileError(ex))
            {
                ShowError(FileMessages.Describe(ex, path, opening: false));
                return;
            }
        }
        LoadFile(path, request.ForcedEncoding, userOpen: true);
    }

    private void OnNew(object sender, ExecutedRoutedEventArgs e)
    {
        if (ConfirmDiscard())
        {
            SetDocument("", null, DefaultEncoding, LineEnding.CrLf);
        }
    }

    private void OnOpen(object sender, ExecutedRoutedEventArgs e)
    {
        if (!ConfirmDiscard())
        {
            return;
        }
        if (FileDialogs.Open(this, CurrentDirectory()) is { } choice)
        {
            LoadFile(choice.Path, choice.Encoding, userOpen: true);
        }
    }

    private void OnSave(object sender, ExecutedRoutedEventArgs e) => Save();

    private void OnSaveAs(object sender, ExecutedRoutedEventArgs e) => SaveAs();

    private void OnNewWindow(object sender, ExecutedRoutedEventArgs e)
    {
        try
        {
            _services.StartNewInstance();
        }
        catch (Win32Exception ex)
        {
            ShowError($"Não foi possível abrir outra janela.\n\n{ex.Message}");
        }
    }

    private void OnExit(object sender, RoutedEventArgs e) => Close();

    private void OnClosing(object? sender, CancelEventArgs e)
    {
        if (!ConfirmDiscard())
        {
            e.Cancel = true;
            return;
        }
        SaveSettings();
    }

    /// <summary>
    /// Pergunta se salva as alterações; ponto único de Novo, Abrir, soltar arquivo e fechar.
    /// Falso = o usuário cancelou (na pergunta ou no Salvar como).
    /// </summary>
    private bool ConfirmDiscard()
    {
        if (!_dirty)
        {
            return true;
        }
        return _services.Dialogs.AskToSave(this, DocumentName) switch
        {
            SaveChoice.Save => Save(),
            SaveChoice.DontSave => true,
            _ => false,
        };
    }

    /// <param name="userOpen">Abertura pedida pelo usuário: aplica o diário ".LOG".</param>
    private bool LoadFile(string path, TextEncodingKind? forced, bool userOpen)
    {
        DecodedText decoded;
        try
        {
            decoded = TextCodec.Decode(TextFileStore.ReadAll(path), forced, _ansiCodePage, DefaultEncoding);
        }
        catch (FileTooLargeException)
        {
            _services.Dialogs.Show(this, AppName, FileMessages.TooLarge(path), MessageBoxImage.Warning);
            return false;
        }
        catch (OutOfMemoryException)
        {
            ShowError(FileMessages.OutOfMemory(path));
            return false;
        }
        catch (Exception ex) when (FileMessages.IsFileError(ex))
        {
            ShowError(FileMessages.Describe(ex, path, opening: true));
            return false;
        }

        SetDocument(decoded.EditorText, path, decoded.Encoding, decoded.LineEnding);
        if (userOpen)
        {
            _services.AddToRecentDocuments(path);
        }
        if (userOpen && TimeStamp.StartsWithLogMarker(decoded.EditorText))
        {
            Editor.Select(Editor.Text.Length, 0);
            InsertAtCaret(TimeStamp.LogEntry(Now()));
        }
        return true;
    }

    private void SetDocument(string editorText, string? path, TextEncodingKind encoding, LineEnding lineEnding)
    {
        _loading = true;
        try
        {
            Editor.Text = editorText;
        }
        finally
        {
            _loading = false;
        }
        // Desligar e religar limpa o histórico de desfazer: abrir um arquivo não é desfazível.
        Editor.IsUndoEnabled = false;
        Editor.IsUndoEnabled = true;
        Editor.Select(0, 0);
        Editor.ScrollToHome();

        _path = path;
        _encoding = encoding;
        _lineEnding = lineEnding;
        _dirty = false;
        UpdateTitle();
        UpdateStatus();
    }

    private bool Save() => _path is null ? SaveAs() : SaveTo(_path, _encoding);

    private bool SaveAs()
    {
        string fileName = _path is null ? "*.txt" : Path.GetFileName(_path);
        return FileDialogs.Save(this, CurrentDirectory(), fileName, _encoding) is { } choice
            && SaveTo(choice.Path, choice.Encoding);
    }

    private string? CurrentDirectory() => _path is null ? null : Path.GetDirectoryName(_path);

    /// <summary>Grava na codificação pedida; o documento só passa a usá-la se a gravação der certo.</summary>
    private bool SaveTo(string path, TextEncodingKind encoding)
    {
        var encoded = TextCodec.Encode(Editor.Text, encoding, _lineEnding, _ansiCodePage);
        if (encoded.LostCharacters)
        {
            var answer = Ask(
                $"Parte do texto usa caracteres que não existem na codificação ANSI deste computador " +
                $"(página de código {_ansiCodePage}). Eles serão gravados como “?”.\n\nSalvar assim mesmo?",
                MessageBoxButton.OKCancel, MessageBoxImage.Warning);
            if (answer != MessageBoxResult.OK)
            {
                return false;
            }
        }

        try
        {
            TextFileStore.WriteAtomic(path, encoded.Bytes);
        }
        catch (Exception ex) when (FileMessages.IsFileError(ex))
        {
            ShowError(FileMessages.Describe(ex, path, opening: false));
            return false;
        }

        if (encoded.LostCharacters)
        {
            // Recarrega para mostrar o que de fato foi gravado.
            int caret = Editor.CaretIndex;
            if (LoadFile(path, TextEncodingKind.Ansi, userOpen: false))
            {
                Editor.Select(Math.Min(caret, Editor.Text.Length), 0);
            }
            return true;
        }

        _services.AddToRecentDocuments(path);
        _path = path;
        _encoding = encoding;
        _dirty = false;
        UpdateTitle();
        UpdateStatus();
        return true;
    }

    // ---- Arrastar e soltar (6.6) ----

    private void OnPreviewDragOver(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            e.Effects = DragDropEffects.Copy;
            e.Handled = true;
        }
    }

    private void OnPreviewDrop(object sender, DragEventArgs e)
    {
        if (e.Data.GetData(DataFormats.FileDrop) is not string[] { Length: > 0 } files)
        {
            return;
        }
        e.Handled = true;
        // Fora do evento de soltar, para não travar o Explorer enquanto uma pergunta estiver aberta.
        Dispatcher.BeginInvoke(() =>
        {
            Activate();
            if (ConfirmDiscard())
            {
                LoadFile(files[0], forced: null, userOpen: true);
            }
        });
    }

    // ---- Edição (seção 3) ----

    private void OnInsertDateTime(object sender, ExecutedRoutedEventArgs e) => InsertAtCaret(Now());

    private void OnDeleteSelection(object sender, ExecutedRoutedEventArgs e) => Editor.SelectedText = "";

    private void CanDeleteSelection(object sender, CanExecuteRoutedEventArgs e) => e.CanExecute = Editor.SelectionLength > 0;

    /// <summary>Insere no lugar da seleção, como edição desfazível, e põe o cursor depois do texto.</summary>
    private void InsertAtCaret(string text)
    {
        Editor.SelectedText = text;
        Editor.Select(Editor.SelectionStart + Editor.SelectionLength, 0);
    }

    private string Now() => TimeStamp.Format(_services.Now(), CultureInfo.CurrentCulture);

    private void OnTextChanged(object sender, TextChangedEventArgs e)
    {
        if (_loading)
        {
            return;
        }
        StatusMessage.Text = "";
        if (!_dirty)
        {
            _dirty = true;
            UpdateTitle();
        }
        UpdatePosition();
    }

    private void OnSelectionChanged(object sender, RoutedEventArgs e) => UpdatePosition();

    // ---- Localizar, substituir e ir para (seção 4) ----

    private void OnFind(object sender, ExecutedRoutedEventArgs e) => ShowSearchWindow(replaceMode: false);

    private void OnReplace(object sender, ExecutedRoutedEventArgs e) => ShowSearchWindow(replaceMode: true);

    private void OnFindNext(object sender, ExecutedRoutedEventArgs e) => FindOrAsk(SearchDirection.Down);

    private void OnFindPrevious(object sender, ExecutedRoutedEventArgs e) => FindOrAsk(SearchDirection.Up);

    /// <summary>F3 / Shift+F3: sem termo de busca, abre a caixa Localizar.</summary>
    private void FindOrAsk(SearchDirection direction)
    {
        if (_search.Term.Length == 0)
        {
            ShowSearchWindow(replaceMode: false);
            return;
        }
        FindNext(direction);
    }

    /// <summary>Uma janela de busca por vez; a seleção atual (de uma linha) vira o termo.</summary>
    private void ShowSearchWindow(bool replaceMode)
    {
        string selection = Editor.SelectedText;
        bool useSelection = selection.Length > 0 && selection.AsSpan().IndexOfAny('\r', '\n') < 0;
        if (useSelection)
        {
            _search.Term = selection;
        }

        if (_searchWindow is not null && _searchWindow.ReplaceMode != replaceMode)
        {
            _searchWindow.Close();
        }
        if (_searchWindow is null)
        {
            var window = new FindReplaceWindow(_search, replaceMode) { Owner = this };
            window.FindNextRequested += (_, _) => FindNext(replaceMode ? SearchDirection.Down : _search.Direction);
            window.ReplaceRequested += (_, _) => ReplaceOne();
            window.ReplaceAllRequested += (_, _) => ReplaceAll();
            window.Closed += (_, _) =>
            {
                _searchWindow = null;
                Activate();
            };
            _searchWindow = window;
            window.Show();
        }
        else
        {
            if (useSelection)
            {
                _searchWindow.SetTerm(selection);
            }
            _searchWindow.Activate();
        }
    }

    private bool FindNext(SearchDirection direction)
    {
        var options = new SearchOptions(_search.MatchCase, direction, _search.WrapAround);
        var match = TextFinder.FindNext(Editor.Text, _search.Term, Editor.SelectionStart, Editor.SelectionLength, options);
        if (match is null)
        {
            StatusMessage.Text = "";
            Inform($"Não foi encontrado: “{_search.Term}”.");
            return false;
        }

        Editor.Select(match.Index, match.Length);
        ScrollIntoView(match.Index);
        StatusMessage.Text = !match.Wrapped ? ""
            : direction == SearchDirection.Down ? "A busca chegou ao fim e recomeçou do início."
            : "A busca chegou ao início e recomeçou do fim.";
        return true;
    }

    /// <summary>Troca a seleção se ela for o termo e segue para a próxima ocorrência.</summary>
    private void ReplaceOne()
    {
        if (TextFinder.SelectionMatches(Editor.Text, Editor.SelectionStart, Editor.SelectionLength, _search.Term, _search.MatchCase))
        {
            Editor.SelectedText = _search.Replacement;
            Editor.Select(Editor.SelectionStart + Editor.SelectionLength, 0);
        }
        FindNext(SearchDirection.Down);
    }

    /// <summary>Substitui todas as ocorrências numa única edição desfazível.</summary>
    private void ReplaceAll()
    {
        var (text, count) = TextFinder.ReplaceAll(Editor.Text, _search.Term, _search.Replacement, _search.MatchCase);
        if (count == 0)
        {
            Inform($"Não foi encontrado: “{_search.Term}”.");
            return;
        }
        Editor.BeginChange();
        try
        {
            Editor.SelectAll();
            Editor.SelectedText = text;
        }
        finally
        {
            Editor.EndChange();
        }
        Editor.Select(0, 0);
        Editor.ScrollToHome();
        StatusMessage.Text = count == 1 ? "1 ocorrência substituída." : $"{count} ocorrências substituídas.";
    }

    private void OnGoToLine(object sender, ExecutedRoutedEventArgs e)
    {
        string text = Editor.Text;
        var dialog = new GoToLineWindow(CaretPosition.At(text, Editor.CaretIndex).Line, TextLines.Count(text), _services.Dialogs)
        {
            Owner = this,
        };
        if (dialog.ShowDialog() == true)
        {
            int index = TextLines.StartOf(text, dialog.Line);
            Editor.Select(index, 0);
            ScrollIntoView(index);
            Editor.Focus();
        }
    }

    /// <summary>Rola o editor até o caractere, também na horizontal (sem quebra automática).</summary>
    private void ScrollIntoView(int index)
    {
        Editor.ScrollToLine(Editor.GetLineIndexFromCharacterIndex(index));
        Editor.UpdateLayout();
        var rect = Editor.GetRectFromCharacterIndex(index);
        if (!rect.IsEmpty && (rect.Left < 0 || rect.Left > Editor.ViewportWidth - 20))
        {
            Editor.ScrollToHorizontalOffset(Math.Max(0, Editor.HorizontalOffset + rect.Left - Editor.ViewportWidth / 3));
        }
    }

    // ---- Exibição (seção 5) ----

    private void UpdateTitle() => Title = $"{(_dirty ? "*" : "")}{DocumentName} - {AppName}";

    private void UpdateStatus()
    {
        StatusLineEnding.Text = _lineEnding.DisplayName();
        StatusEncoding.Text = _encoding.DisplayName();
        UpdatePosition();
    }

    private void UpdatePosition()
    {
        var (line, column) = CaretPosition.At(Editor.Text, Editor.CaretIndex);
        StatusPosition.Text = $"Ln {line}, Col {column}";
    }

    // ---- Mensagens (seção 11) ----

    private MessageBoxResult Ask(string message, MessageBoxButton buttons, MessageBoxImage icon) =>
        _services.Dialogs.Ask(this, AppName, message, buttons, icon);

    /// <summary>Informação; com a janela de busca aberta, aparece sobre ela.</summary>
    private void Inform(string message)
    {
        Window owner = _searchWindow is { IsActive: true } ? _searchWindow : this;
        _services.Dialogs.Show(owner, AppName, message, MessageBoxImage.Information);
    }

    private void ShowError(string message) => _services.Dialogs.Show(this, AppName, message, MessageBoxImage.Error);
}
