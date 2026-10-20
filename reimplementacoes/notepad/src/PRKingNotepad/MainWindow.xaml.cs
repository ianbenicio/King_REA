using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Microsoft.Win32;
using PRKingNotepad.Core;

namespace PRKingNotepad;

public partial class MainWindow : Window
{
    private const string AppName = "PRKing Notepad";
    private const string UntitledName = "Documento sem nome";
    private const string FileFilter = "Arquivos de texto (*.txt)|*.txt|Todos os arquivos (*.*)|*.*";
    private const TextEncodingKind DefaultEncoding = TextEncodingKind.Utf8;

    private readonly int _ansiCodePage = (int)NativeMethods.GetACP();
    private string? _path;
    private TextEncodingKind _encoding = DefaultEncoding;
    private LineEnding _lineEnding = LineEnding.CrLf;
    private bool _dirty;
    private bool _loading;

    public MainWindow()
    {
        InitializeComponent();
        BuildEncodingMenu();
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
        catch (Exception ex) when (IsFileError(ex))
        {
            ShowError(DescribeFileError(ex, request.Path, opening: true));
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
            catch (Exception ex) when (IsFileError(ex))
            {
                ShowError(DescribeFileError(ex, path, opening: false));
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
        var dialog = new OpenFileDialog { Filter = FileFilter, CheckFileExists = true };
        if (_path is not null)
        {
            dialog.InitialDirectory = Path.GetDirectoryName(_path);
        }
        if (dialog.ShowDialog(this) == true)
        {
            LoadFile(dialog.FileName, forced: null, userOpen: true);
        }
    }

    private void OnSave(object sender, ExecutedRoutedEventArgs e) => Save();

    private void OnSaveAs(object sender, ExecutedRoutedEventArgs e) => SaveAs();

    private void OnNewWindow(object sender, ExecutedRoutedEventArgs e)
    {
        try
        {
            Process.Start(new ProcessStartInfo(Environment.ProcessPath!) { UseShellExecute = false });
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
        }
    }

    /// <summary>Pergunta se salva as alterações. Falso = o usuário cancelou a operação.</summary>
    private bool ConfirmDiscard()
    {
        if (!_dirty)
        {
            return true;
        }
        var answer = Ask($"Há alterações não salvas em “{DocumentName}”.\n\nSalvar antes de continuar?",
            MessageBoxButton.YesNoCancel, MessageBoxImage.Warning);
        return answer switch
        {
            MessageBoxResult.Yes => Save(),
            MessageBoxResult.No => true,
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
            ShowError($"O arquivo “{Path.GetFileName(path)}” é grande demais para abrir (limite de 1 GiB).");
            return false;
        }
        catch (OutOfMemoryException)
        {
            ShowError($"Não há memória suficiente para abrir “{Path.GetFileName(path)}”.");
            return false;
        }
        catch (Exception ex) when (IsFileError(ex))
        {
            ShowError(DescribeFileError(ex, path, opening: true));
            return false;
        }

        SetDocument(decoded.EditorText, path, decoded.Encoding, decoded.LineEnding);
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

    private bool Save() => _path is null ? SaveAs() : SaveTo(_path);

    private bool SaveAs()
    {
        var dialog = new SaveFileDialog
        {
            Filter = FileFilter,
            DefaultExt = ".txt",
            AddExtension = true,
            OverwritePrompt = true,
            FileName = _path is null ? "*.txt" : Path.GetFileName(_path),
        };
        if (_path is not null)
        {
            dialog.InitialDirectory = Path.GetDirectoryName(_path);
        }
        return dialog.ShowDialog(this) == true && SaveTo(dialog.FileName);
    }

    private bool SaveTo(string path)
    {
        var encoded = TextCodec.Encode(Editor.Text, _encoding, _lineEnding, _ansiCodePage);
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
        catch (Exception ex) when (IsFileError(ex))
        {
            ShowError(DescribeFileError(ex, path, opening: false));
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

        _path = path;
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

    private static string Now() => TimeStamp.Format(DateTime.Now, CultureInfo.CurrentCulture);

    private void OnTextChanged(object sender, TextChangedEventArgs e)
    {
        if (_loading)
        {
            return;
        }
        if (!_dirty)
        {
            _dirty = true;
            UpdateTitle();
        }
        UpdatePosition();
    }

    private void OnSelectionChanged(object sender, RoutedEventArgs e) => UpdatePosition();

    // ---- Codificação de gravação ----

    private void BuildEncodingMenu()
    {
        foreach (var kind in Enum.GetValues<TextEncodingKind>())
        {
            var item = new MenuItem { Header = kind.DisplayName(), Tag = kind, IsCheckable = true };
            item.Click += (_, _) =>
            {
                if (_encoding != kind)
                {
                    _encoding = kind;
                    _dirty = true;
                    UpdateTitle();
                }
                UpdateStatus();
            };
            EncodingMenu.Items.Add(item);
        }
    }

    // ---- Exibição (seção 5) ----

    private void OnToggleStatusBar(object sender, RoutedEventArgs e) =>
        StatusBar.Visibility = StatusBarMenuItem.IsChecked ? Visibility.Visible : Visibility.Collapsed;

    private void UpdateTitle() => Title = $"{(_dirty ? "*" : "")}{DocumentName} - {AppName}";

    private void UpdateStatus()
    {
        StatusLineEnding.Text = _lineEnding.DisplayName();
        StatusEncoding.Text = _encoding.DisplayName();
        foreach (MenuItem item in EncodingMenu.Items)
        {
            item.IsChecked = (TextEncodingKind)item.Tag == _encoding;
        }
        UpdatePosition();
    }

    private void UpdatePosition()
    {
        var (line, column) = CaretPosition.At(Editor.Text, Editor.CaretIndex);
        StatusPosition.Text = $"Ln {line}, Col {column}";
    }

    // ---- Mensagens (seção 11) ----

    private MessageBoxResult Ask(string message, MessageBoxButton buttons, MessageBoxImage icon) =>
        MessageBox.Show(this, message, AppName, buttons, icon);

    private void ShowError(string message) => MessageBox.Show(this, message, AppName, MessageBoxButton.OK, MessageBoxImage.Error);

    private static bool IsFileError(Exception ex) =>
        ex is IOException or UnauthorizedAccessException or ArgumentException or NotSupportedException;

    private static string DescribeFileError(Exception ex, string path, bool opening)
    {
        string action = opening ? "abrir" : "gravar";
        return ex switch
        {
            FileNotFoundException or DirectoryNotFoundException =>
                $"Não foi possível encontrar “{path}”.\n\nConfira o nome e a pasta.",
            UnauthorizedAccessException => $"Sem permissão para {action} “{path}”.",
            ArgumentException or NotSupportedException or PathTooLongException =>
                $"O nome de arquivo “{path}” não é válido.",
            _ => $"Não foi possível {action} “{path}”.\n\n{ex.Message}",
        };
    }
}
