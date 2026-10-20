namespace PRKingNotepad.Core;

/// <summary>Arquivo pedido na linha de comando e codificação forçada, se houver.</summary>
public sealed record CommandLineRequest(string? Path, TextEncodingKind? ForcedEncoding);

/// <summary>
/// Linha de comando (especificação, 6.7): <c>[/A | /W] [arquivo]</c>. O caminho pode vir entre
/// aspas duplas ou simples; sem aspas, o resto da linha é o caminho, com espaços.
/// </summary>
public static class CommandLine
{
    /// <summary>Remove o nome do programa de uma linha de comando completa do Windows.</summary>
    public static string ArgumentsOf(string fullCommandLine)
    {
        int i = 0;
        bool quoted = false;
        while (i < fullCommandLine.Length && (quoted || !IsBlank(fullCommandLine[i])))
        {
            if (fullCommandLine[i] == '"')
            {
                quoted = !quoted;
            }
            i++;
        }
        return fullCommandLine[i..];
    }

    public static CommandLineRequest Parse(string arguments)
    {
        string rest = arguments.TrimStart(' ', '\t');
        TextEncodingKind? forced = null;
        if (TryOption(rest, "/A", out string afterA))
        {
            forced = TextEncodingKind.Ansi;
            rest = afterA;
        }
        else if (TryOption(rest, "/W", out string afterW))
        {
            forced = TextEncodingKind.Utf16Le;
            rest = afterW;
        }

        rest = rest.TrimEnd(' ', '\t');
        if (rest.Length > 0 && (rest[0] == '"' || rest[0] == '\''))
        {
            int end = rest.IndexOf(rest[0], 1);
            rest = end < 0 ? rest[1..] : rest[1..end];
        }
        return new CommandLineRequest(rest.Length == 0 ? null : rest, forced);
    }

    /// <summary>
    /// Caminho absoluto do arquivo pedido. Nome sem extensão que não existe passa a ser
    /// <c>nome.txt</c>.
    /// </summary>
    public static string ResolvePath(string argument, string currentDirectory, Func<string, bool> fileExists)
    {
        string full = System.IO.Path.GetFullPath(argument, currentDirectory);
        if (!fileExists(full) && System.IO.Path.GetExtension(full).Length == 0)
        {
            full += ".txt";
        }
        return full;
    }

    private static bool TryOption(string text, string option, out string rest)
    {
        bool match = text.StartsWith(option, StringComparison.OrdinalIgnoreCase)
            && (text.Length == option.Length || IsBlank(text[option.Length]));
        rest = match ? text[option.Length..].TrimStart(' ', '\t') : text;
        return match;
    }

    private static bool IsBlank(char c) => c is ' ' or '\t';
}
