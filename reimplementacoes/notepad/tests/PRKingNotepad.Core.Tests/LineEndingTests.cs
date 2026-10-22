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

    // ---- Quebras misturadas (seção 14, R7): as existentes ficam, as novas vão no tipo do documento ----

    private const string Mixed = "linha1\r\nlinha2\nlinha3\rlinha4";

    private static string Save(DecodedText decoded, string editorText) =>
        System.Text.Encoding.UTF8.GetString(TextCodec.Encode(editorText, decoded.Encoding, decoded.LineBreaks, 1252).Bytes);

    private static DecodedText Open(string fileText) =>
        TextCodec.Decode(System.Text.Encoding.UTF8.GetBytes(fileText), null, 1252);

    [Fact]
    public void Mixed_file_round_trips_unchanged()
    {
        var decoded = Open(Mixed);
        Assert.Equal(LineEnding.CrLf, decoded.LineEnding);
        Assert.Equal(2, decoded.LineBreaks.Count);
        Assert.Equal(Mixed, Save(decoded, decoded.EditorText));
    }

    [Fact]
    public void New_line_at_end_of_mixed_file_uses_document_type()
    {
        var decoded = Open(Mixed);
        string added = LineEndings.EditorNewLine + "linha5";
        decoded.LineBreaks.Apply(decoded.EditorText.Length, 0, added.Length);
        Assert.Equal(Mixed + "\r\nlinha5", Save(decoded, decoded.EditorText + added));
    }

    [Fact]
    public void Lf_first_file_keeps_its_crlf_break()
    {
        var decoded = Open("linha1\nlinha2\r\nlinha3");
        Assert.Equal(LineEnding.Lf, decoded.LineEnding);
        Assert.Equal("linha1\nlinha2\r\nlinha3", Save(decoded, decoded.EditorText));
    }

    [Fact]
    public void Typing_before_a_preserved_break_moves_it_along()
    {
        var decoded = Open(Mixed);
        string editor = decoded.EditorText.Insert(0, "xx");
        decoded.LineBreaks.Apply(0, 0, 2);
        Assert.Equal("xx" + Mixed, Save(decoded, editor));
    }

    [Fact]
    public void Deleted_break_typed_again_uses_document_type()
    {
        var decoded = Open(Mixed);
        int lf = decoded.EditorText.IndexOf("\r\nlinha3", StringComparison.Ordinal);
        decoded.LineBreaks.Apply(lf, 2, 2);
        Assert.Equal("linha1\r\nlinha2\r\nlinha3\rlinha4", Save(decoded, decoded.EditorText));
        Assert.Equal(1, decoded.LineBreaks.Count);
    }

    [Fact]
    public void Removing_text_across_a_preserved_break_forgets_it()
    {
        var decoded = Open(Mixed);
        int start = decoded.EditorText.IndexOf("2", StringComparison.Ordinal);
        int end = decoded.EditorText.IndexOf("l", start, StringComparison.Ordinal) + 1;
        string editor = decoded.EditorText.Remove(start, end - start);
        decoded.LineBreaks.Apply(start, end - start, 0);
        Assert.Equal("linha1\r\nlinhainha3\rlinha4", Save(decoded, editor));
    }

    [Fact]
    public void Insert_between_cr_and_lf_of_a_preserved_break_forgets_it()
    {
        var decoded = Open("a\nb\r\nc");
        int cr = decoded.EditorText.LastIndexOf('\r');
        Assert.Equal(1, decoded.LineBreaks.Count);
        decoded.LineBreaks.Apply(cr + 1, 0, 1);
        Assert.Equal(0, decoded.LineBreaks.Count);
    }

    [Fact]
    public void Pasted_lf_is_saved_in_document_type()
    {
        var decoded = Open("a\r\nb");
        decoded.LineBreaks.Apply(decoded.EditorText.Length, 0, 2);
        Assert.Equal("a\r\nb\r\nc", Save(decoded, decoded.EditorText + "\nc"));
        Assert.Equal(LineEnding.CrLf, decoded.LineEnding);
    }

    [Fact]
    public void Touches_is_true_only_for_spans_that_overlap_a_kept_break()
    {
        // "ab" CRLF "cd" LF "ef", documento em CRLF: a LF guardada ocupa [6, 8) no editor.
        var map = Open("ab\r\ncd\nef").LineBreaks;
        Assert.Equal(1, map.Count);
        Assert.False(map.Touches(5, 6));
        Assert.True(map.Touches(5, 7));
        Assert.True(map.Touches(7, 9));
        Assert.False(map.Touches(8, 10));
        Assert.False(map.Touches(6, 6));
        Assert.False(map.Touches(0, 4));
    }

    [Fact]
    public void Replace_all_keeps_breaks_outside_the_matches()
    {
        var decoded = Open(Mixed);
        var (edits, count) = TextFinder.ReplaceAllEdits(decoded.EditorText, "linha", "L", matchCase: true, decoded.LineBreaks);
        Assert.Equal(4, count);
        string text = decoded.EditorText;
        for (int k = edits.Count - 1; k >= 0; k--)
        {
            var edit = edits[k];
            text = text[..edit.Start] + edit.Text + text[(edit.Start + edit.Length)..];
            decoded.LineBreaks.Apply(edit.Start, edit.Length, edit.Text.Length);
        }
        Assert.Equal("L1\r\nL2\nL3\rL4", Save(decoded, text));
    }
}
