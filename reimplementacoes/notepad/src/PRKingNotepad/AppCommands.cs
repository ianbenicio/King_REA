using System.Windows.Input;

namespace PRKingNotepad;

/// <summary>Comandos do app que não existem em <see cref="ApplicationCommands"/>.</summary>
public static class AppCommands
{
    public static readonly RoutedUICommand NewWindow = new("Nova janela", nameof(NewWindow), typeof(AppCommands));
    public static readonly RoutedUICommand InsertDateTime = new("Hora e data", nameof(InsertDateTime), typeof(AppCommands));
    public static readonly RoutedUICommand DeleteSelection = new("Excluir", nameof(DeleteSelection), typeof(AppCommands));
    public static readonly RoutedUICommand FindNext = new("Localizar próxima", nameof(FindNext), typeof(AppCommands));
    public static readonly RoutedUICommand FindPrevious = new("Localizar anterior", nameof(FindPrevious), typeof(AppCommands));
    public static readonly RoutedUICommand GoToLine = new("Ir para linha", nameof(GoToLine), typeof(AppCommands));
    public static readonly RoutedUICommand ZoomIn = new("Ampliar", nameof(ZoomIn), typeof(AppCommands));
    public static readonly RoutedUICommand ZoomOut = new("Reduzir", nameof(ZoomOut), typeof(AppCommands));
    public static readonly RoutedUICommand ZoomReset = new("Restaurar zoom padrão", nameof(ZoomReset), typeof(AppCommands));
}
