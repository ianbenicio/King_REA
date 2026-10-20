namespace PRKingNotepad.Core;

/// <summary>Linha e coluna lógicas (1-based) para a barra de status (especificação, 5.4).</summary>
public static class CaretPosition
{
    /// <summary>
    /// Conta linhas do arquivo, não linhas visuais: com quebra automática ligada o
    /// resultado continua sendo a linha lógica.
    /// </summary>
    public static (int Line, int Column) At(string editorText, int index)
    {
        index = Math.Clamp(index, 0, editorText.Length);
        ReadOnlySpan<char> before = editorText.AsSpan(0, index);
        int line = before.Count('\n') + 1;
        int lineStart = before.LastIndexOf('\n') + 1;
        return (line, index - lineStart + 1);
    }
}
