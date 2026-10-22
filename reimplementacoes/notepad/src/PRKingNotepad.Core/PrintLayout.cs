using System.Globalization;
using System.Text;

namespace PRKingNotepad.Core;

/// <summary>Cabeçalho ou rodapé já resolvido, em três partes alinhadas.</summary>
public sealed record HeaderFooterParts(string Left, string Center, string Right)
{
    public bool IsEmpty => Left.Length == 0 && Center.Length == 0 && Right.Length == 0;
}

/// <summary>
/// Códigos de cabeçalho e rodapé (especificação, 10), sem diferenciar maiúsculas:
/// &amp;f nome do arquivo, &amp;p número da página, &amp;t hora, &amp;d data,
/// &amp;l / &amp;c / &amp;r alinham o trecho seguinte, &amp;&amp; um "&amp;" literal.
/// Sem código de alinhamento o texto fica centralizado; código desconhecido fica como está.
/// </summary>
public static class HeaderFooter
{
    public static HeaderFooterParts Format(string template, string fileName, int page, DateTime now, CultureInfo culture)
    {
        var parts = new[] { new StringBuilder(), new StringBuilder(), new StringBuilder() };
        int current = 1; // 0 esquerda, 1 centro, 2 direita
        for (int i = 0; i < template.Length; i++)
        {
            char c = template[i];
            if (c != '&' || i + 1 >= template.Length)
            {
                parts[current].Append(c);
                continue;
            }
            char code = char.ToLowerInvariant(template[++i]);
            switch (code)
            {
                case 'f': parts[current].Append(fileName); break;
                case 'p': parts[current].Append(page.ToString(culture)); break;
                case 't': parts[current].Append(now.ToString("t", culture)); break;
                case 'd': parts[current].Append(now.ToString("d", culture)); break;
                case 'l': current = 0; break;
                case 'c': current = 1; break;
                case 'r': current = 2; break;
                case '&': parts[current].Append('&'); break;
                default: parts[current].Append('&').Append(template[i]); break;
            }
        }
        return new HeaderFooterParts(parts[0].ToString(), parts[1].ToString(), parts[2].ToString());
    }
}

/// <summary>Quebra do texto em linhas e páginas para impressão (especificação, 10).</summary>
public static class PrintLayout
{
    public const int TabSize = 8;

    /// <summary>
    /// Linhas de impressão agrupadas em páginas. Linhas mais largas que <paramref name="width"/>
    /// quebram no último espaço que couber, ou no meio da palavra se não houver espaço.
    /// Tabulações viram espaços (paradas a cada 8 colunas). Texto vazio dá uma página vazia.
    /// </summary>
    /// <param name="measure">Largura de um trecho de texto na fonte de impressão.</param>
    public static IReadOnlyList<IReadOnlyList<string>> Paginate(string editorText, int linesPerPage, double width,
        Func<string, double> measure)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(linesPerPage, 1);
        var lines = new List<string>();
        foreach (string logical in LineEndings.Normalize(editorText, "\n").Split('\n'))
        {
            WrapLine(ExpandTabs(logical), width, measure, lines);
        }

        var pages = new List<IReadOnlyList<string>>();
        for (int i = 0; i < lines.Count; i += linesPerPage)
        {
            pages.Add(lines.GetRange(i, Math.Min(linesPerPage, lines.Count - i)));
        }
        if (pages.Count == 0)
        {
            pages.Add([]);
        }
        return pages;
    }

    public static string ExpandTabs(string line)
    {
        if (!line.Contains('\t'))
        {
            return line;
        }
        var sb = new StringBuilder(line.Length + 16);
        foreach (char c in line)
        {
            if (c == '\t')
            {
                sb.Append(' ', TabSize - sb.Length % TabSize);
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    private static void WrapLine(string line, double width, Func<string, double> measure, List<string> output)
    {
        while (line.Length > 0 && measure(line) > width)
        {
            int fit = LongestFittingPrefix(line, width, measure);
            int cut = fit;
            int space = line.LastIndexOf(' ', fit - 1, fit);
            if (space > 0 && fit < line.Length)
            {
                cut = space + 1; // o espaço fica no fim da linha quebrada
            }
            output.Add(line[..cut].TrimEnd(' '));
            line = line[cut..];
        }
        output.Add(line);
    }

    /// <summary>Maior prefixo que cabe (ao menos um caractere, sem partir par substituto).</summary>
    private static int LongestFittingPrefix(string line, double width, Func<string, double> measure)
    {
        int low = 1;
        int high = line.Length;
        while (low < high)
        {
            int mid = (low + high + 1) / 2;
            if (measure(line[..mid]) <= width)
            {
                low = mid;
            }
            else
            {
                high = mid - 1;
            }
        }
        if (low < line.Length && char.IsLowSurrogate(line[low]))
        {
            low = low > 1 ? low - 1 : low + 1;
        }
        return low;
    }
}
