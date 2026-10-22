using System.IO;
using System.Printing;
using System.Windows;
using System.Windows.Input;
using PRKingNotepad.Core;

namespace PRKingNotepad.Ui.Tests;

/// <summary>
/// A janela principal com todos os substitutos de <see cref="MainWindowServices"/>: mensagens prontas,
/// preferências e arquivos numa pasta temporária apagada no fim, recentes e "nova janela" só anotados,
/// hora fixa, sem impressora. Criar e usar dentro de <see cref="Ui.Run"/>.
/// </summary>
internal sealed class Notepad : IDisposable
{
    public static readonly DateTime FixedNow = new(2026, 10, 22, 14, 5, 0);

    /// <param name="commandLine">Recebe a pasta temporária (para criar arquivos antes) e devolve os argumentos.</param>
    /// <param name="settings">Preferências gravadas antes de abrir; sem elas, a janela abre fora da área visível.</param>
    public Notepad(Func<string, string>? commandLine = null, long maxFileBytes = TextFileStore.MaxBytes, Action<Settings>? settings = null)
    {
        Folder = Path.Combine(Path.GetTempPath(), "PRKingNotepad.Ui.Tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Folder);
        SettingsPath = Path.Combine(Folder, "settings.json");
        if (settings is not null)
        {
            var initial = new Settings();
            settings(initial);
            SettingsStore.Save(SettingsPath, initial);
        }
        string arguments = commandLine?.Invoke(Folder) ?? "";

        Window = new MainWindow(new MainWindowServices
        {
            Dialogs = Dialogs,
            SettingsPath = SettingsPath,
            AddToRecentDocuments = Recent.Add,
            StartNewInstance = () => NewInstances++,
            Now = () => FixedNow,
            CommandLineArguments = arguments,
            ChooseFileToOpen = (_, _) =>
            {
                OpenDialogCount++;
                return OpenAnswer;
            },
            ChooseFileToSave = (_, _, name, encoding) =>
            {
                SaveDialogs.Add((name, encoding));
                return SaveAnswer;
            },
            DefaultPrintQueue = () => null,
            MaxFileBytes = maxFileBytes,
        })
        {
            ShowActivated = false,
            ShowInTaskbar = false,
        };
        if (settings is null)
        {
            // Fora da tela: os testes não piscam janelas na frente de quem está usando o computador.
            Window.WindowStartupLocation = WindowStartupLocation.Manual;
            Window.Left = -20000;
            Window.Top = -20000;
        }
        Window.Closed += (_, _) => IsClosed = true;
    }

    public bool IsClosed { get; private set; }

    public string Folder { get; }

    public string SettingsPath { get; }

    public FakeDialogs Dialogs { get; } = new();

    public List<string> Recent { get; } = [];

    public int NewInstances { get; private set; }

    public (string Path, TextEncodingKind? Encoding)? OpenAnswer { get; set; }

    public int OpenDialogCount { get; private set; }

    public (string Path, TextEncodingKind Encoding)? SaveAnswer { get; set; }

    public List<(string Name, TextEncodingKind Encoding)> SaveDialogs { get; } = [];

    public MainWindow Window { get; }

    public System.Windows.Controls.TextBox Editor => Window.Editor;

    /// <summary>Abre a janela (dispara a linha de comando) e espera carregar.</summary>
    public Notepad Show()
    {
        Window.Show();
        Ui.DoEvents();
        return this;
    }

    public string PathOf(string name) => Path.Combine(Folder, name);

    public string WriteFile(string name, byte[] bytes)
    {
        string path = PathOf(name);
        File.WriteAllBytes(path, bytes);
        return path;
    }

    public void Press(Key key, ModifierKeys modifiers = ModifierKeys.None) => Input.Press(Editor, key, modifiers);

    public void Type(string text) => Input.Type(Editor, text);

    /// <summary>Abre pelo Ctrl+O, com a caixa Abrir respondendo o arquivo.</summary>
    public void Open(string path, TextEncodingKind? encoding = null)
    {
        OpenAnswer = (path, encoding);
        Press(Key.O, ModifierKeys.Control);
    }

    public System.Windows.Controls.MenuItem Menu(string header) => Ui.MenuItem(Window, header);

    /// <summary>Revalida o CanExecute dos comandos (o que o WPF faz quando a interface fica ociosa).</summary>
    public void Requery()
    {
        CommandManager.InvalidateRequerySuggested();
        Ui.DoEvents();
    }

    /// <summary>
    /// Habilitação do item como o usuário a vê: o WPF só revalida os itens de um submenu quando ele
    /// abre, por isso o menu do item é aberto, lido e fechado.
    /// </summary>
    public bool IsEnabled(string header)
    {
        var item = Menu(header);
        var parent = (System.Windows.Controls.MenuItem)LogicalTreeHelper.GetParent(item);
        parent.IsSubmenuOpen = true;
        Requery();
        try
        {
            return item.IsEnabled;
        }
        finally
        {
            parent.IsSubmenuOpen = false;
            Ui.DoEvents();
        }
    }

    public T Owned<T>() where T : Window => Window.OwnedWindows.OfType<T>().Single();

    public void Dispose()
    {
        Dialogs.Closing = true;
        if (!IsClosed)
        {
            foreach (Window owned in Window.OwnedWindows)
            {
                owned.Close();
            }
            Window.Close();
        }
        try
        {
            Directory.Delete(Folder, recursive: true);
        }
        catch (IOException)
        {
            // Um arquivo ainda aberto por um teste que falhou: a pasta temporária fica para o sistema limpar.
        }
    }
}
