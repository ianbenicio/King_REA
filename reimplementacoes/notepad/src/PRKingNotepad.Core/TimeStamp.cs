using System.Globalization;

namespace PRKingNotepad.Core;

/// <summary>Hora e data (F5) e diário automático de arquivos ".LOG" (especificação, 3 e 6.5).</summary>
public static class TimeStamp
{
    public const string LogMarker = ".LOG";

    /// <summary>Hora curta (sem segundos), espaço, data curta, no formato regional.</summary>
    public static string Format(DateTime now, CultureInfo culture) =>
        now.ToString("t", culture) + " " + now.ToString("d", culture);

    /// <summary>Verdadeiro se o texto começa exatamente com ".LOG" (maiúsculas).</summary>
    public static bool StartsWithLogMarker(string text) => text.StartsWith(LogMarker, StringComparison.Ordinal);

    /// <summary>Entrada de diário inserida no fim do documento: quebra, hora/data, quebra.</summary>
    public static string LogEntry(string stamp) => LineEndings.EditorNewLine + stamp + LineEndings.EditorNewLine;

    public static string AppendLogEntry(string editorText, string stamp) => editorText + LogEntry(stamp);
}
