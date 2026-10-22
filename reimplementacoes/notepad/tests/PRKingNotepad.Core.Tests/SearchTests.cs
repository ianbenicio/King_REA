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
    public void Find_all_lists_the_occurrences_replace_all_swaps()
    {
        Assert.Equal([0, 5, 10], TextFinder.FindAll(Text, "gato", matchCase: false));
        Assert.Equal([5], TextFinder.FindAll(Text, "gato", matchCase: true));
        Assert.Equal([0, 2], TextFinder.FindAll("aaaaa", "aa", matchCase: true));
        Assert.Empty(TextFinder.FindAll(Text, "", matchCase: false));
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
