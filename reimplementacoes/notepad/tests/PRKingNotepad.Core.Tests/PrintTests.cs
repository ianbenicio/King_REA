using System.Globalization;
using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class HeaderFooterTests
{
    private static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");
    private static readonly DateTime Now = new(2026, 10, 21, 9, 7, 30);

    private static HeaderFooterParts F(string template) => HeaderFooter.Format(template, "notas.txt", 3, Now, PtBr);

    [Fact]
    public void Defaults_resolve_file_name_and_page()
    {
        Assert.Equal(new HeaderFooterParts("", "notas.txt", ""), F("&f"));
        Assert.Equal(new HeaderFooterParts("", "Página 3", ""), F("Página &p"));
    }

    [Fact]
    public void Codes_are_case_insensitive_and_include_time_and_date()
    {
        Assert.Equal(new HeaderFooterParts("", "09:07 21/10/2026 notas.txt 3", ""), F("&T &D &F &P"));
    }

    [Fact]
    public void Alignment_codes_send_following_text_to_each_part()
    {
        Assert.Equal(new HeaderFooterParts("notas.txt", "meio", "Pág. 3"), F("&l&f&cmeio&rPág. &p"));
    }

    [Fact]
    public void Double_ampersand_is_literal_and_unknown_code_is_kept()
    {
        Assert.Equal(new HeaderFooterParts("", "A & B &x fim&", ""), F("A && B &x fim&"));
    }

    [Fact]
    public void Empty_template_is_empty()
    {
        Assert.True(F("").IsEmpty);
    }
}

public class PrintLayoutTests
{
    // Medida de fonte monoespaçada: cada caractere vale 1.
    private static double Mono(string s) => s.Length;

    [Fact]
    public void Lines_that_fit_are_kept_and_grouped_in_pages()
    {
        var pages = PrintLayout.Paginate("a\r\nb\r\nc\r\nd\r\ne", linesPerPage: 2, width: 10, Mono);
        Assert.Equal(3, pages.Count);
        Assert.Equal(["a", "b"], pages[0]);
        Assert.Equal(["e"], pages[2]);
    }

    [Fact]
    public void Long_line_breaks_at_last_space_that_fits()
    {
        var pages = PrintLayout.Paginate("um dois três quatro", linesPerPage: 10, width: 9, Mono);
        Assert.Equal(["um dois", "três", "quatro"], pages[0]);
    }

    [Fact]
    public void Word_longer_than_width_is_cut()
    {
        var pages = PrintLayout.Paginate("abcdefghij", linesPerPage: 10, width: 4, Mono);
        Assert.Equal(["abcd", "efgh", "ij"], pages[0]);
    }

    [Fact]
    public void Empty_text_gives_one_page_and_blank_lines_are_kept()
    {
        Assert.Single(PrintLayout.Paginate("", 5, 10, Mono));
        Assert.Equal(["a", "", "b"], PrintLayout.Paginate("a\r\n\r\nb", 5, 10, Mono)[0]);
    }

    [Fact]
    public void Tabs_expand_to_stops_of_eight()
    {
        Assert.Equal("ab      c", PrintLayout.ExpandTabs("ab\tc"));
        Assert.Equal("        x", PrintLayout.ExpandTabs("\tx"));
    }

    [Fact]
    public void Surrogate_pairs_are_not_split()
    {
        // "😀" ocupa 2 unidades UTF-16; largura 3 caberia "a" + metade do emoji.
        var lines = PrintLayout.Paginate("a😀b", 10, 2, Mono)[0];
        Assert.All(lines, l => Assert.False(l.Length > 0 && char.IsHighSurrogate(l[^1])));
        Assert.Equal("a😀b", string.Concat(lines));
    }
}

public class PageSettingsTests
{
    [Fact]
    public void Invalid_margins_fall_back_to_defaults()
    {
        var page = new PageSettings { MarginTopMm = -5, MarginLeftMm = double.NaN, MarginRightMm = 500, Header = null!, Footer = null! };
        page.Normalize();
        Assert.Equal((25, 20, 20), (page.MarginTopMm, page.MarginLeftMm, page.MarginRightMm));
        Assert.Equal(("&f", "Página &p"), (page.Header, page.Footer));
    }
}
