using System.Text;
using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class EncodingTests
{
    private const int Windows1252 = 1252;

    [Fact]
    public void Empty_file_has_no_detection_and_uses_default()
    {
        Assert.Null(EncodingDetector.Detect([]));
        var decoded = TextCodec.Decode([], null, Windows1252, TextEncodingKind.Utf8);
        Assert.Equal("", decoded.EditorText);
        Assert.Equal(TextEncodingKind.Utf8, decoded.Encoding);
        Assert.Equal(LineEnding.CrLf, decoded.LineEnding);
    }

    [Theory]
    [InlineData(new byte[] { 0xEF, 0xBB, 0xBF, 0x41 }, TextEncodingKind.Utf8Bom, 3)]
    [InlineData(new byte[] { 0xFF, 0xFE, 0x41, 0x00 }, TextEncodingKind.Utf16Le, 2)]
    [InlineData(new byte[] { 0xFE, 0xFF, 0x00, 0x41 }, TextEncodingKind.Utf16Be, 2)]
    public void Bom_decides_encoding(byte[] data, TextEncodingKind kind, int bom)
    {
        Assert.Equal((kind, bom), EncodingDetector.Detect(data));
        Assert.Equal("A", TextCodec.Decode(data, null, Windows1252).EditorText);
    }

    [Fact]
    public void Utf16Le_without_bom_detected_from_100_bytes()
    {
        byte[] data = Encoding.Unicode.GetBytes(new string('a', 50)); // 100 bytes
        Assert.Equal((TextEncodingKind.Utf16Le, 0), EncodingDetector.Detect(data));
    }

    [Fact]
    public void Utf16Le_heuristic_ignored_below_100_bytes()
    {
        byte[] data = Encoding.Unicode.GetBytes(new string('a', 49)); // 98 bytes
        Assert.NotEqual(TextEncodingKind.Utf16Le, EncodingDetector.Detect(data)!.Value.Kind);
    }

    [Fact]
    public void Valid_utf8_without_bom_is_utf8()
    {
        byte[] data = Encoding.UTF8.GetBytes("ação e coração");
        Assert.Equal((TextEncodingKind.Utf8, 0), EncodingDetector.Detect(data));
        Assert.Equal("ação e coração", TextCodec.Decode(data, null, Windows1252).EditorText);
    }

    [Fact]
    public void Plain_ascii_is_utf8()
    {
        Assert.Equal((TextEncodingKind.Utf8, 0), EncodingDetector.Detect("hello"u8));
    }

    [Fact]
    public void Invalid_utf8_falls_back_to_ansi()
    {
        byte[] data = [0x61, 0xE7, 0xE3, 0x6F]; // "açao" em 1252
        Assert.Equal((TextEncodingKind.Ansi, 0), EncodingDetector.Detect(data));
        Assert.Equal("ação", TextCodec.Decode(data, null, Windows1252).EditorText);
    }

    [Fact]
    public void Forced_encoding_overrides_detection_and_skips_matching_bom()
    {
        byte[] utf8 = [0xEF, 0xBB, 0xBF, 0xC3, 0xA7];
        Assert.Equal("ç", TextCodec.Decode(utf8, TextEncodingKind.Utf8, Windows1252).EditorText);
        Assert.Equal("Ã§", TextCodec.Decode(utf8[3..], TextEncodingKind.Ansi, Windows1252).EditorText);
    }

    [Fact]
    public void Nul_characters_become_spaces()
    {
        Assert.Equal("a b", TextCodec.Decode("a\0b"u8, null, Windows1252).EditorText);
    }

    [Theory]
    [InlineData(TextEncodingKind.Utf8, new byte[] { 0x41 })]
    [InlineData(TextEncodingKind.Utf8Bom, new byte[] { 0xEF, 0xBB, 0xBF, 0x41 })]
    [InlineData(TextEncodingKind.Utf16Le, new byte[] { 0xFF, 0xFE, 0x41, 0x00 })]
    [InlineData(TextEncodingKind.Utf16Be, new byte[] { 0xFE, 0xFF, 0x00, 0x41 })]
    [InlineData(TextEncodingKind.Ansi, new byte[] { 0x41 })]
    public void Encode_writes_bom_per_encoding(TextEncodingKind kind, byte[] expected)
    {
        var encoded = TextCodec.Encode("A", kind, LineEnding.CrLf, Windows1252);
        Assert.Equal(expected, encoded.Bytes);
        Assert.False(encoded.LostCharacters);
    }

    [Fact]
    public void Ansi_reports_lost_characters_and_replaces_them()
    {
        var encoded = TextCodec.Encode("a日b", TextEncodingKind.Ansi, LineEnding.CrLf, Windows1252);
        Assert.True(encoded.LostCharacters);
        Assert.Equal("a?b"u8.ToArray(), encoded.Bytes);
    }

    [Fact]
    public void Ansi_keeps_characters_of_the_code_page()
    {
        var encoded = TextCodec.Encode("ação €", TextEncodingKind.Ansi, LineEnding.CrLf, Windows1252);
        Assert.False(encoded.LostCharacters);
        Assert.Equal(new byte[] { 0x61, 0xE7, 0xE3, 0x6F, 0x20, 0x80 }, encoded.Bytes);
    }

    [Theory]
    [InlineData(TextEncodingKind.Utf8)]
    [InlineData(TextEncodingKind.Utf8Bom)]
    [InlineData(TextEncodingKind.Utf16Le)]
    [InlineData(TextEncodingKind.Utf16Be)]
    public void Round_trip_preserves_text_and_encoding(TextEncodingKind kind)
    {
        const string text = "linha 1\r\nção ✓ 日本\r\n";
        var bytes = TextCodec.Encode(text, kind, LineEnding.CrLf, Windows1252).Bytes;
        var decoded = TextCodec.Decode(bytes, null, Windows1252);
        Assert.Equal(text, decoded.EditorText);
        Assert.Equal(kind, decoded.Encoding);
    }
}
