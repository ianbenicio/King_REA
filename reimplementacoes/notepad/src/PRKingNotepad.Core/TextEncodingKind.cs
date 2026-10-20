namespace PRKingNotepad.Core;

/// <summary>Codificações de arquivo suportadas (especificação, seção 7).</summary>
public enum TextEncodingKind
{
    Ansi,
    Utf16Le,
    Utf16Be,
    Utf8,
    Utf8Bom,
}

public static class TextEncodingKindExtensions
{
    public static string DisplayName(this TextEncodingKind kind) => kind switch
    {
        TextEncodingKind.Ansi => "ANSI",
        TextEncodingKind.Utf16Le => "UTF-16 LE",
        TextEncodingKind.Utf16Be => "UTF-16 BE",
        TextEncodingKind.Utf8 => "UTF-8",
        TextEncodingKind.Utf8Bom => "UTF-8 com BOM",
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
    };
}
