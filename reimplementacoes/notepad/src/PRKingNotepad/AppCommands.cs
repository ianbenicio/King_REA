using System.Windows.Input;

namespace PRKingNotepad;

/// <summary>Comandos do app que não existem em <see cref="ApplicationCommands"/>.</summary>
public static class AppCommands
{
    public static readonly RoutedUICommand NewWindow = new("Nova janela", nameof(NewWindow), typeof(AppCommands));
    public static readonly RoutedUICommand InsertDateTime = new("Hora e data", nameof(InsertDateTime), typeof(AppCommands));
    public static readonly RoutedUICommand DeleteSelection = new("Excluir", nameof(DeleteSelection), typeof(AppCommands));
}
