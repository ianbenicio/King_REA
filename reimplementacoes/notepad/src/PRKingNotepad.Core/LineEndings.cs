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
/// na gravação o texto volta para o tipo do documento.
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
