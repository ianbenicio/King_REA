using System.Text.Unicode;

namespace PRKingNotepad.Core;

/// <summary>
/// Detecção automática da codificação (especificação, 7.1): BOM, depois heurística
/// própria de UTF-16 LE sem BOM, depois UTF-8 estrito, senão ANSI.
/// </summary>
public static class EncodingDetector
{
    /// <summary>Abaixo deste tamanho a heurística estatística de UTF-16 não é aplicada.</summary>
    public const int MinStatisticalLength = 100;

    /// <returns>Codificação e tamanho do BOM, ou <c>null</c> para arquivo vazio.</returns>
    public static (TextEncodingKind Kind, int BomLength)? Detect(ReadOnlySpan<byte> data)
    {
        if (data.IsEmpty)
        {
            return null;
        }
        if (data.StartsWith((ReadOnlySpan<byte>)[0xEF, 0xBB, 0xBF]))
        {
            return (TextEncodingKind.Utf8Bom, 3);
        }
        if (data.StartsWith((ReadOnlySpan<byte>)[0xFF, 0xFE]))
        {
            return (TextEncodingKind.Utf16Le, 2);
        }
        if (data.StartsWith((ReadOnlySpan<byte>)[0xFE, 0xFF]))
        {
            return (TextEncodingKind.Utf16Be, 2);
        }
        if (LooksLikeUtf16Le(data))
        {
            return (TextEncodingKind.Utf16Le, 0);
        }
        return Utf8.IsValid(data) ? (TextEncodingKind.Utf8, 0) : (TextEncodingKind.Ansi, 0);
    }

    /// <summary>
    /// Heurística própria: texto UTF-16 LE de alfabeto latino tem byte zero na posição
    /// ímpar de muitos pares e quase nunca na par. Só vale para tamanho par a partir de
    /// <see cref="MinStatisticalLength"/> bytes; não reconhece UTF-16 sem BOM de outros alfabetos.
    /// </summary>
    public static bool LooksLikeUtf16Le(ReadOnlySpan<byte> data)
    {
        if (data.Length < MinStatisticalLength || data.Length % 2 != 0)
        {
            return false;
        }

        int pairs = data.Length / 2;
        int zeroHigh = 0;
        int zeroLow = 0;
        for (int i = 0; i < data.Length; i += 2)
        {
            if (data[i] == 0)
            {
                zeroLow++;
            }
            if (data[i + 1] == 0)
            {
                zeroHigh++;
            }
        }
        return zeroHigh * 10 >= pairs * 4 && zeroLow * 20 <= pairs;
    }
}
