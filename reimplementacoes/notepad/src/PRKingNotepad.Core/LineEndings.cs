using System.Text;

namespace PRKingNotepad.Core;

/// <summary>Tipo de quebra de linha do documento (especificação, seção 8).</summary>
public enum LineEnding
{
    CrLf,
    Lf,
    Cr,
}

/// <summary>
/// Detecção e conversão de quebras de linha. O editor trabalha sempre com CRLF;
/// na gravação o texto volta para o tipo do documento (ou para o mapa de quebras, <see cref="LineBreakMap"/>).
/// </summary>
public static class LineEndings
{
    public const string EditorNewLine = "\r\n";

    public static string Sequence(this LineEnding ending) => ending switch
    {
        LineEnding.CrLf => "\r\n",
        LineEnding.Lf => "\n",
        LineEnding.Cr => "\r",
        _ => throw new ArgumentOutOfRangeException(nameof(ending), ending, null),
    };

    public static string DisplayName(this LineEnding ending) => ending switch
    {
        LineEnding.CrLf => "Windows (CRLF)",
        LineEnding.Lf => "Unix (LF)",
        LineEnding.Cr => "Macintosh (CR)",
        _ => throw new ArgumentOutOfRangeException(nameof(ending), ending, null),
    };

    /// <summary>Tipo da primeira quebra encontrada; texto sem quebras é CRLF.</summary>
    public static LineEnding Detect(string text)
    {
        int i = text.AsSpan().IndexOfAny('\r', '\n');
        if (i < 0 || (text[i] == '\r' && i + 1 < text.Length && text[i + 1] == '\n'))
        {
            return LineEnding.CrLf;
        }
        return text[i] == '\n' ? LineEnding.Lf : LineEnding.Cr;
    }

    /// <summary>Troca toda quebra (CRLF, LF ou CR isolado) por <paramref name="newLine"/>.</summary>
    public static string Normalize(string text, string newLine)
    {
        if (text.AsSpan().IndexOfAny('\r', '\n') < 0)
        {
            return text;
        }

        var sb = new StringBuilder(text.Length + text.Length / 16);
        for (int i = 0; i < text.Length; i++)
        {
            char c = text[i];
            if (c == '\r')
            {
                if (i + 1 < text.Length && text[i + 1] == '\n')
                {
                    i++;
                }
                sb.Append(newLine);
            }
            else if (c == '\n')
            {
                sb.Append(newLine);
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    public static string ToEditor(string text) => Normalize(text, EditorNewLine);

    public static string FromEditor(string editorText, LineEnding ending) => Normalize(editorText, ending.Sequence());
}

/// <summary>
/// Quebras do arquivo que diferem do tipo do documento, guardadas pela posição no texto do editor (sempre CRLF)
/// e deslocadas a cada edição. Na gravação voltam como estavam; quebra nova, ou tocada por uma edição, sai no
/// tipo do documento (especificação, seção 14, R7).
/// </summary>
public sealed class LineBreakMap
{
    private readonly List<int> _offsets = [];
    private readonly List<LineEnding> _endings = [];

    public LineBreakMap(LineEnding documentEnding)
    {
        DocumentEnding = documentEnding;
    }

    /// <summary>Tipo do documento: o da primeira quebra do arquivo.</summary>
    public LineEnding DocumentEnding { get; }

    /// <summary>Quantas quebras guardadas diferem do tipo do documento.</summary>
    public int Count => _offsets.Count;

    /// <summary>Lê as quebras do texto do arquivo (antes de <see cref="LineEndings.ToEditor"/>).</summary>
    public static LineBreakMap FromFileText(string fileText)
    {
        var map = new LineBreakMap(LineEndings.Detect(fileText));
        int editorOffset = 0;
        for (int i = 0; i < fileText.Length; i++)
        {
            char c = fileText[i];
            if (c != '\r' && c != '\n')
            {
                editorOffset++;
                continue;
            }

            LineEnding ending;
            if (c == '\r' && i + 1 < fileText.Length && fileText[i + 1] == '\n')
            {
                ending = LineEnding.CrLf;
                i++;
            }
            else
            {
                ending = c == '\n' ? LineEnding.Lf : LineEnding.Cr;
            }
            if (ending != map.DocumentEnding)
            {
                map._offsets.Add(editorOffset);
                map._endings.Add(ending);
            }
            editorOffset += LineEndings.EditorNewLine.Length;
        }
        return map;
    }

    /// <summary>
    /// Acompanha uma edição do texto do editor: quebra guardada que a edição apaga ou parte ao meio
    /// é esquecida; as que vêm depois andam junto.
    /// </summary>
    public void Apply(int offset, int removedLength, int addedLength)
    {
        int end = offset + removedLength;
        int delta = addedLength - removedLength;
        int i = FirstAtOrAfter(offset - 1);
        while (i < _offsets.Count)
        {
            int p = _offsets[i];
            bool touched = removedLength > 0
                ? p < end && offset < p + LineEndings.EditorNewLine.Length
                : p < offset && offset < p + LineEndings.EditorNewLine.Length;
            if (touched)
            {
                _offsets.RemoveAt(i);
                _endings.RemoveAt(i);
            }
            else
            {
                if (p >= end)
                {
                    _offsets[i] = p + delta;
                }
                i++;
            }
        }
    }

    /// <summary>Verdadeiro se apagar o trecho [<paramref name="start"/>, <paramref name="end"/>) esqueceria alguma quebra guardada.</summary>
    public bool Touches(int start, int end)
    {
        if (start >= end)
        {
            return false;
        }
        int i = FirstAtOrAfter(start - LineEndings.EditorNewLine.Length + 1);
        return i < _offsets.Count && _offsets[i] < end;
    }

    /// <summary>Texto do editor com cada quebra no tipo guardado para a posição dela, ou no tipo do documento.</summary>
    public string ToFileText(string editorText)
    {
        if (editorText.AsSpan().IndexOfAny('\r', '\n') < 0)
        {
            return editorText;
        }

        string documentSequence = DocumentEnding.Sequence();
        var sb = new StringBuilder(editorText.Length + editorText.Length / 16);
        int next = 0;
        for (int i = 0; i < editorText.Length; i++)
        {
            char c = editorText[i];
            if (c != '\r' && c != '\n')
            {
                sb.Append(c);
                continue;
            }

            bool crLf = c == '\r' && i + 1 < editorText.Length && editorText[i + 1] == '\n';
            while (next < _offsets.Count && _offsets[next] < i)
            {
                next++;
            }
            if (crLf && next < _offsets.Count && _offsets[next] == i)
            {
                sb.Append(_endings[next].Sequence());
                next++;
            }
            else
            {
                // Quebra nova, ou solta (colada sem conversão): vai no tipo do documento.
                sb.Append(documentSequence);
            }
            if (crLf)
            {
                i++;
            }
        }
        return sb.ToString();
    }

    public LineBreakMap Clone()
    {
        var copy = new LineBreakMap(DocumentEnding);
        copy._offsets.AddRange(_offsets);
        copy._endings.AddRange(_endings);
        return copy;
    }

    private int FirstAtOrAfter(int offset)
    {
        int i = _offsets.BinarySearch(offset);
        return i >= 0 ? i : ~i;
    }
}
