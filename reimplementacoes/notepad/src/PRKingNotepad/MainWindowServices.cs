using System.Diagnostics;
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
}
