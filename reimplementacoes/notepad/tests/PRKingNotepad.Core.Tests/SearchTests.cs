using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class SearchTests
{
    private const string Text = "Gato gato GATO cão"; // ocorrências de "gato" em 0, 5 e 10

    private static SearchOptions Down(bool matchCase = false, bool wrap = false) => new(matchCase, SearchDirection.Down, wrap);
    private static SearchOptions Up(bool matchCase = false, bool wrap = false) => new(matchCase, SearchDirection.Up, wrap);

    [Fact]
    public void Down_starts_after_the_current_selection()
    {
        Assert.Equal(new SearchMatch(0, 4, false), TextFinder.FindNext(Text, "gato", 0, 0, Down()));
        Assert.Equal(new SearchMatch(5, 4, false), TextFinder.FindNext(Text, "gato", 0, 4, Down()));
    }

    [Fact]
    public void Match_case_skips_other_cases()
    {
        Assert.Equal(new SearchMatch(5, 4, false), TextFinder.FindNext(Text, "gato", 0, 0, Down(matchCase: true)));
        Assert.Null(TextFinder.FindNext(Text, "gato", 6, 0, Down(matchCase: true)));
    }

    [Fact]
    public void Up_ends_before_the_current_selection()
    {
        Assert.Equal(new SearchMatch(5, 4, false), TextFinder.FindNext(Text, "gato", 10, 4, Up()));
        Assert.Null(TextFinder.FindNext(Text, "gato", 0, 4, Up()));
    }

    [Fact]
    public void Wrap_around_continues_from_the_other_end_and_says_so()
    {
        Assert.Equal(new SearchMatch(0, 4, true), TextFinder.FindNext(Text, "gato", 10, 4, Down(wrap: true)));
        Assert.Equal(new SearchMatch(10, 4, true), TextFinder.FindNext(Text, "gato", 0, 4, Up(wrap: true)));
    }

    [Fact]
    public void Not_found_and_empty_term_return_null()
    {
        Assert.Null(TextFinder.FindNext(Text, "rato", 0, 0, Down(wrap: true)));
        Assert.Null(TextFinder.FindNext(Text, "", 0, 0, Down()));
    }

    [Fact]
    public void Selection_matches_term_respecting_case_option()
    {
        Assert.True(TextFinder.SelectionMatches(Text, 0, 4, "gato", matchCase: false));
        Assert.False(TextFinder.SelectionMatches(Text, 0, 4, "gato", matchCase: true));
        Assert.False(TextFinder.SelectionMatches(Text, 0, 3, "gato", matchCase: false));
    }

    [Fact]
    public void Replace_all_counts_and_respects_case()
    {
        Assert.Equal(("rato rato rato cão", 3), TextFinder.ReplaceAll(Text, "gato", "rato", matchCase: false));
        Assert.Equal(("Gato rato GATO cão", 1), TextFinder.ReplaceAll(Text, "gato", "rato", matchCase: true));
        Assert.Equal((Text, 0), TextFinder.ReplaceAll(Text, "rato", "x", matchCase: false));
    }

    [Fact]
    public void Replace_all_does_not_rescan_inserted_text()
    {
        Assert.Equal(("aa aa", 2), TextFinder.ReplaceAll("a a", "a", "aa", matchCase: true));
    }

    [Fact]
    public void Replace_all_edits_without_kept_breaks_are_a_single_edit()
    {
        var none = new LineBreakMap(LineEnding.CrLf);
        AssertEdits([new TextEdit(0, 14, "rato rato rato")], 3, TextFinder.ReplaceAllEdits(Text, "gato", "rato", matchCase: false, none));
        AssertEdits([new TextEdit(5, 4, "rato")], 1, TextFinder.ReplaceAllEdits(Text, "gato", "rato", matchCase: true, none));
        AssertEdits([new TextEdit(0, 4, "bb")], 2, TextFinder.ReplaceAllEdits("aaaaa", "aa", "b", matchCase: true, none));
        AssertEdits([], 0, TextFinder.ReplaceAllEdits(Text, "", "x", matchCase: false, none));
        AssertEdits([], 0, TextFinder.ReplaceAllEdits(Text, "rato", "x", matchCase: false, none));
    }

    private static void AssertEdits(List<TextEdit> edits, int count, (List<TextEdit> Edits, int Count) actual)
    {
        Assert.Equal(edits, actual.Edits);
        Assert.Equal(count, actual.Count);
    }

    [Fact]
    public void Replace_all_edits_split_at_kept_breaks_and_match_replace_all()
    {
        // "a1" CRLF "a2" LF "a3" LF "a4" CRLF "a5", documento em CRLF: guardadas as duas LF (posições 6 e 10).
        var decoded = TextCodec.Decode(System.Text.Encoding.UTF8.GetBytes("a1\r\na2\na3\na4\r\na5"), null, 1252);
        var map = decoded.LineBreaks;
        var (edits, count) = TextFinder.ReplaceAllEdits(decoded.EditorText, "a", "bb", matchCase: true, map);

        Assert.Equal(5, count);
        Assert.Equal([new TextEdit(0, 5, "bb1\r\nbb"), new TextEdit(8, 1, "bb"), new TextEdit(12, 5, "bb4\r\nbb")], edits);
        Assert.All(edits, e => Assert.False(map.Touches(e.Start, e.Start + e.Length)));
        string text = decoded.EditorText;
        for (int k = edits.Count - 1; k >= 0; k--)
        {
            text = text[..edits[k].Start] + edits[k].Text + text[(edits[k].Start + edits[k].Length)..];
        }
        Assert.Equal(TextFinder.ReplaceAll(decoded.EditorText, "a", "bb", matchCase: true).Text, text);
    }
}

public class TextLinesTests
{
    private const string Text = "um\r\ndois\r\n\r\ntrês";

    [Fact]
    public void Count_includes_last_line_even_if_empty()
    {
        Assert.Equal(4, TextLines.Count(Text));
        Assert.Equal(1, TextLines.Count(""));
        Assert.Equal(2, TextLines.Count("a\r\n"));
    }

    [Theory]
    [InlineData(1, 0)]
    [InlineData(2, 4)]
    [InlineData(3, 10)]
    [InlineData(4, 12)]
    [InlineData(5, -1)]
    [InlineData(0, -1)]
    public void Start_of_line_is_index_after_previous_line_break(int line, int expected)
    {
        Assert.Equal(expected, TextLines.StartOf(Text, line));
    }
}
