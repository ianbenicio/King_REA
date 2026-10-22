using System.Runtime.InteropServices;
using System.Windows;

namespace PRKingNotepad.Ui.Tests;

/// <summary>
/// Guarda o que estava na área de transferência do usuário (texto, imagem, arquivos ou outro formato)
/// e devolve no fim do teste.
/// </summary>
internal sealed class ClipboardScope : IDisposable
{
    private readonly DataObject? _saved = Snapshot();

    public void Dispose()
    {
        if (_saved is null)
        {
            Clipboard.Clear();
        }
        else
        {
            Clipboard.SetDataObject(_saved, copy: true);
        }
    }

    /// <summary>Cópia de cada formato que se deixa ler; o objeto da área de transferência some quando ela muda.</summary>
    private static DataObject? Snapshot()
    {
        var current = Clipboard.GetDataObject();
        if (current is null)
        {
            return null;
        }
        var copy = new DataObject();
        bool any = false;
        foreach (string format in current.GetFormats(autoConvert: false))
        {
            try
            {
                if (current.GetData(format, autoConvert: false) is { } data)
                {
                    copy.SetData(format, data);
                    any = true;
                }
            }
            catch (Exception ex) when (ex is ExternalException or OutOfMemoryException)
            {
                // Formato que não se lê fora do programa que o pôs: fica de fora.
            }
        }
        return any ? copy : null;
    }
}
