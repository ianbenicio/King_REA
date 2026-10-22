using System.Windows;

namespace PRKingNotepad.Ui.Tests;

/// <summary>Guarda o texto da área de transferência do usuário e o devolve no fim do teste.</summary>
internal sealed class ClipboardScope : IDisposable
{
    private readonly string? _text = Clipboard.ContainsText() ? Clipboard.GetText() : null;

    public void Dispose()
    {
        if (_text is null)
        {
            Clipboard.Clear();
        }
        else
        {
            Clipboard.SetText(_text);
        }
    }
}
