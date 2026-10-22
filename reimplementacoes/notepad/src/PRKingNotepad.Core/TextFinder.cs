namespace PRKingNotepad.Core;

public enum SearchDirection
{
    Down,
    Up,
}

public sealed record SearchOptions(bool MatchCase, SearchDirection Direction, bool WrapAround);

/// <summary>Trecho encontrado; <see cref="Wrapped"/> = a busca recomeçou do outro extremo.</summary>
public sealed record SearchMatch(int Index, int Length, bool Wrapped);

/// <summary>Localizar e substituir (especificação, 4.1).</summary>
public static class TextFinder
{
    /// <summary>
    /// Próxima ocorrência a partir da seleção atual: para baixo começa no fim da seleção,
    /// para cima termina antes do início dela. Com "dar a volta", continua do outro extremo.
    /// Comparação ordinal (com ou sem diferenciar maiúsculas), para os índices baterem com o texto.
    /// </summary>
    public static SearchMatch? FindNext(string text, string term, int selectionStart, int selectionLength, SearchOptions options)
    {
        if (term.Length == 0)
        {
            return null;
        }

        var comparison = Comparison(options.MatchCase);
        selectionStart = Math.Clamp(selectionStart, 0, text.Length);
        int selectionEnd = Math.Clamp(selectionStart + selectionLength, selectionStart, text.Length);

        if (options.Direction == SearchDirection.Down)
        {
            int i = text.IndexOf(term, selectionEnd, comparison);
            if (i < 0 && options.WrapAround)
            {
                i = text.IndexOf(term, 0, comparison);
                return i < 0 ? null : new SearchMatch(i, term.Length, true);
            }
            return i < 0 ? null : new SearchMatch(i, term.Length, false);
        }

        int j = text.AsSpan(0, selectionStart).LastIndexOf(term, comparison);
        if (j < 0 && options.WrapAround)
        {
            j = text.AsSpan().LastIndexOf(term, comparison);
            return j < 0 ? null : new SearchMatch(j, term.Length, true);
        }
        return j < 0 ? null : new SearchMatch(j, term.Length, false);
    }

    /// <summary>Verdadeiro se a seleção é exatamente o termo (para "Substituir" trocar a seleção atual).</summary>
    public static bool SelectionMatches(string text, int selectionStart, int selectionLength, string term, bool matchCase) =>
        term.Length > 0
        && selectionLength == term.Length
        && selectionStart >= 0
        && selectionStart + selectionLength <= text.Length
        && text.AsSpan(selectionStart, selectionLength).Equals(term, Comparison(matchCase));

    /// <summary>Texto com todas as ocorrências trocadas e quantas foram.</summary>
    /// <param name="lineBreaks">Se dado, acompanha cada troca (quebras fora das ocorrências ficam como estavam).</param>
    public static (string Text, int Count) ReplaceAll(string text, string term, string replacement, bool matchCase,
        LineBreakMap? lineBreaks = null)
    {
        if (term.Length == 0)
        {
            return (text, 0);
        }

        var comparison = Comparison(matchCase);
        var sb = new System.Text.StringBuilder(text.Length);
        int count = 0;
        int from = 0;
        int i;
        while ((i = text.IndexOf(term, from, comparison)) >= 0)
        {
            lineBreaks?.Apply(sb.Length + (i - from), term.Length, replacement.Length);
            sb.Append(text, from, i - from).Append(replacement);
            from = i + term.Length;
            count++;
        }
        if (count == 0)
        {
            return (text, 0);
        }
        sb.Append(text, from, text.Length - from);
        return (sb.ToString(), count);
    }

    /// <summary>Posições das ocorrências, sem sobreposição e na ordem do texto: as mesmas que <see cref="ReplaceAll"/> troca.</summary>
    public static List<int> FindAll(string text, string term, bool matchCase)
    {
        var positions = new List<int>();
        if (term.Length == 0)
        {
            return positions;
        }
        var comparison = Comparison(matchCase);
        int i = 0;
        while ((i = text.IndexOf(term, i, comparison)) >= 0)
        {
            positions.Add(i);
            i += term.Length;
        }
        return positions;
    }

    private static StringComparison Comparison(bool matchCase) =>
        matchCase ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
}

/// <summary>Linhas lógicas do texto do editor (especificação, 4.2).</summary>
public static class TextLines
{
    public static int Count(string editorText) => editorText.AsSpan().Count('\n') + 1;

    /// <summary>Índice do início da linha (1-based), ou -1 se a linha não existe.</summary>
    public static int StartOf(string editorText, int line)
    {
        if (line < 1)
        {
            return -1;
        }
        int index = 0;
        for (int current = 1; current < line; current++)
        {
            int nl = editorText.IndexOf('\n', index);
            if (nl < 0)
            {
                return -1;
            }
            index = nl + 1;
        }
        return index;
    }
}
