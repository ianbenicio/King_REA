using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class LineEndingTests
{
    [Theory]
    [InlineData("a\r\nb", LineEnding.CrLf)]
    [InlineData("a\nb", LineEnding.Lf)]
    [InlineData("a\rb", LineEnding.Cr)]
    [InlineData("sem quebra", LineEnding.CrLf)]
    [InlineData("a\nb\r\nc", LineEnding.Lf)]
    [InlineData("a\r", LineEnding.Cr)]
    public void Detect_uses_first_line_break(string text, LineEnding expected)
    {
        Assert.Equal(expected, LineEndings.Detect(text));
    }

    [Fact]
    public void Editor_text_always_uses_crlf()
    {
        Assert.Equal("a\r\nb\r\nc\r\nd", LineEndings.ToEditor("a\nb\rc\r\nd"));
    }

    [Theory]
    [InlineData(LineEnding.CrLf, "a\r\nb")]
    [InlineData(LineEnding.Lf, "a\nb")]
    [InlineData(LineEnding.Cr, "a\rb")]
    public void Save_converts_back_to_document_line_ending(LineEnding ending, string expected)
    {
        Assert.Equal(expected, LineEndings.FromEditor("a\r\nb", ending));
    }

    [Fact]
    public void Pasted_lf_inside_crlf_document_is_normalized_on_save()
    {
        Assert.Equal("a\r\nb\r\nc", LineEndings.FromEditor("a\r\nb\nc", LineEnding.CrLf));
    }

    [Fact]
    public void Lf_file_round_trips_unchanged()
    {
        const string original = "um\ndois\n\ntrês\n";
        var decoded = TextCodec.Decode(System.Text.Encoding.UTF8.GetBytes(original), null, 1252);
        Assert.Equal(LineEnding.Lf, decoded.LineEnding);
        var saved = TextCodec.Encode(decoded.EditorText, decoded.Encoding, decoded.LineEnding, 1252).Bytes;
        Assert.Equal(original, System.Text.Encoding.UTF8.GetString(saved));
    }
}
