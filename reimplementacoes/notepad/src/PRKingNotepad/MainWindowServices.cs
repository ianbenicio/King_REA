using System.Diagnostics;
using System.Printing;
using System.Windows;
using PRKingNotepad.Core;

namespace PRKingNotepad;

/// <summary>
/// O que a janela principal usa de fora dela. O padrão é o comportamento real; os testes de interface
/// trocam cada item para não tocar no %APPDATA%, nos documentos recentes do Windows nem abrir processo.
/// </summary>
internal sealed class MainWindowServices
{
    public IUserDialogs Dialogs { get; init; } = new SystemDialogs();

    public string SettingsPath { get; init; } = SettingsStore.DefaultPath;

    public Action<string> AddToRecentDocuments { get; init; } = NativeMethods.AddToRecentDocuments;

    /// <summary>Abre outra instância do programa; pode lançar <see cref="System.ComponentModel.Win32Exception"/>.</summary>
    public Action StartNewInstance { get; init; } =
        () => Process.Start(new ProcessStartInfo(Environment.ProcessPath!) { UseShellExecute = false });

    public Func<DateTime> Now { get; init; } = () => DateTime.Now;

    /// <summary>Argumentos da linha de comando, sem o nome do programa (nos testes, o processo é o do executor).</summary>
    public string CommandLineArguments { get; init; } = CommandLine.ArgumentsOf(Environment.CommandLine);

    /// <summary>Caixa Abrir: (dono, pasta inicial) → arquivo e codificação escolhidos, ou nulo se cancelada.</summary>
    public Func<Window, string?, (string Path, TextEncodingKind? Encoding)?> ChooseFileToOpen { get; init; } = FileDialogs.Open;

    /// <summary>Caixa Salvar como: (dono, pasta inicial, nome, codificação atual) → destino, ou nulo se cancelada.</summary>
    public Func<Window, string?, string, TextEncodingKind, (string Path, TextEncodingKind Encoding)?> ChooseFileToSave { get; init; } =
        FileDialogs.Save;

    /// <summary>Impressora padrão, ou nulo se não houver; pode lançar as exceções do spooler.</summary>
    public Func<PrintQueue?> DefaultPrintQueue { get; init; } = LocalPrintServer.GetDefaultPrintQueue;

    /// <summary>Maior arquivo que se abre; os testes baixam para provar o aviso sem criar um arquivo de 1 GB.</summary>
    public long MaxFileBytes { get; init; } = TextFileStore.MaxBytes;
}
