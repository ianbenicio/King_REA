using System.Text;

namespace PRKingNotepad.Core;

/// <summary>Texto pronto para o editor (quebras já em CRLF) e o que foi detectado do arquivo.</summary>
public sealed record DecodedText(string EditorText, TextEncodingKind Encoding, LineEnding LineEnding);

/// <summary>Bytes prontos para gravar; <see cref="LostCharacters"/> indica troca de caracteres em ANSI.</summary>
public sealed record EncodedText(byte[] Bytes, bool LostCharacters);

/// <summary>Conversão entre bytes do arquivo e texto do editor (especificação, seções 7 e 8).</summary>
public static class TextCodec
{
    private static readonly byte[] Utf8Bom = [0xEF, 0xBB, 0xBF];
    private static readonly byte[] Utf16LeBom = [0xFF, 0xFE];
    private static readonly byte[] Utf16BeBom = [0xFE, 0xFF];

    static TextCodec()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    /// <param name="forced">Codificação escolhida pelo usuário; <c>null</c> = detecção automática.</param>
    /// <param name="defaultKind">Usada para arquivo vazio em detecção automática.</param>
    public static DecodedText Decode(ReadOnlySpan<byte> data, TextEncodingKind? forced, int ansiCodePage,
        TextEncodingKind defaultKind = TextEncodingKind.Utf8)
    {
        TextEncodingKind kind;
        int skip;
        if (forced is { } f)
        {
            kind = f;
            skip = BomLengthIfPresent(data, f);
        }
        else if (EncodingDetector.Detect(data) is { } detected)
        {
            (kind, skip) = detected;
        }
        else
        {
            kind = defaultKind;
            skip = 0;
        }

        string text = GetDecoding(kind, ansiCodePage).GetString(data[skip..]);
        text = text.Replace('\0', ' ');
        return new DecodedText(LineEndings.ToEditor(text), kind, LineEndings.Detect(text));
    }

    public static EncodedText Encode(string editorText, TextEncodingKind kind, LineEnding lineEnding, int ansiCodePage)
    {
        string text = LineEndings.FromEditor(editorText, lineEnding);
        switch (kind)
        {
            case TextEncodingKind.Ansi:
                var strict = Encoding.GetEncoding(ansiCodePage, EncoderFallback.ExceptionFallback, DecoderFallback.ReplacementFallback);
                try
                {
                    return new EncodedText(strict.GetBytes(text), false);
                }
                catch (EncoderFallbackException)
                {
                    var lossy = Encoding.GetEncoding(ansiCodePage, new EncoderReplacementFallback("?"), DecoderFallback.ReplacementFallback);
                    return new EncodedText(lossy.GetBytes(text), true);
                }
            case TextEncodingKind.Utf8:
                return new EncodedText(new UTF8Encoding(false).GetBytes(text), false);
            case TextEncodingKind.Utf8Bom:
                return new EncodedText([.. Utf8Bom, .. new UTF8Encoding(false).GetBytes(text)], false);
            case TextEncodingKind.Utf16Le:
                return new EncodedText([.. Utf16LeBom, .. Encoding.Unicode.GetBytes(text)], false);
            case TextEncodingKind.Utf16Be:
                return new EncodedText([.. Utf16BeBom, .. Encoding.BigEndianUnicode.GetBytes(text)], false);
            default:
                throw new ArgumentOutOfRangeException(nameof(kind), kind, null);
        }
    }

    private static Encoding GetDecoding(TextEncodingKind kind, int ansiCodePage) => kind switch
    {
        TextEncodingKind.Ansi => Encoding.GetEncoding(ansiCodePage),
        TextEncodingKind.Utf8 or TextEncodingKind.Utf8Bom => new UTF8Encoding(false),
        TextEncodingKind.Utf16Le => Encoding.Unicode,
        TextEncodingKind.Utf16Be => Encoding.BigEndianUnicode,
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
    };

    private static int BomLengthIfPresent(ReadOnlySpan<byte> data, TextEncodingKind kind) => kind switch
    {
        TextEncodingKind.Utf8 or TextEncodingKind.Utf8Bom when data.StartsWith(Utf8Bom) => 3,
        TextEncodingKind.Utf16Le when data.StartsWith(Utf16LeBom) => 2,
        TextEncodingKind.Utf16Be when data.StartsWith(Utf16BeBom) => 2,
        _ => 0,
    };
}
