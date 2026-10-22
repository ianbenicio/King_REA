using System.Globalization;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;
using PRKingNotepad.Core;

namespace PRKingNotepad;

/// <summary>
/// Páginas impressas (especificação, 10): cabeçalho na primeira linha da área útil, uma linha em
/// branco, o texto com quebra pela largura da página, uma linha em branco e o rodapé na última.
/// Usa a fonte do documento sem o zoom.
/// </summary>
public sealed class PrintPaginator : DocumentPaginator
{
    private readonly IReadOnlyList<IReadOnlyList<string>> _pages;
    private readonly Typeface _typeface;
    private readonly double _fontSize;
    private readonly double _lineHeight;
    private readonly Thickness _margins;
    private readonly string _header;
    private readonly string _footer;
    private readonly string _fileName;
    private readonly DateTime _now;
    private readonly CultureInfo _culture;
    private readonly double _pixelsPerDip;
    private Size _pageSize;

    public PrintPaginator(string editorText, string fileName, Typeface typeface, double fontSizeDip, Size pageSize,
        Thickness margins, string header, string footer, DateTime now, CultureInfo culture, double pixelsPerDip)
    {
        _typeface = typeface;
        _fontSize = fontSizeDip;
        _pageSize = pageSize;
        _margins = margins;
        _header = header;
        _footer = footer;
        _fileName = fileName;
        _now = now;
        _culture = culture;
        _pixelsPerDip = pixelsPerDip;
        _lineHeight = typeface.FontFamily.LineSpacing * fontSizeDip;

        int reserved = (HasText(header) ? 2 : 0) + (HasText(footer) ? 2 : 0);
        int totalLines = (int)Math.Floor(ContentHeight / _lineHeight);
        LinesPerPage = Math.Max(1, totalLines - reserved);
        _pages = PrintLayout.Paginate(editorText, LinesPerPage, Math.Max(1, ContentWidth), Measure);
    }

    public int LinesPerPage { get; }

    private double ContentWidth => _pageSize.Width - _margins.Left - _margins.Right;

    private double ContentHeight => _pageSize.Height - _margins.Top - _margins.Bottom;

    public override bool IsPageCountValid => true;

    public override int PageCount => _pages.Count;

    public override Size PageSize
    {
        get => _pageSize;
        set => _pageSize = value;
    }

    public override IDocumentPaginatorSource? Source => null;

    public override DocumentPage GetPage(int pageNumber)
    {
        var visual = new DrawingVisual();
        using (var dc = visual.RenderOpen())
        {
            double top = _margins.Top;
            if (HasText(_header))
            {
                DrawParts(dc, Parts(_header, pageNumber), top);
                top += 2 * _lineHeight;
            }
            foreach (string line in _pages[pageNumber])
            {
                dc.DrawText(Text(line), new Point(_margins.Left, top));
                top += _lineHeight;
            }
            if (HasText(_footer))
            {
                DrawParts(dc, Parts(_footer, pageNumber), _pageSize.Height - _margins.Bottom - _lineHeight);
            }
        }
        var rect = new Rect(_pageSize);
        return new DocumentPage(visual, _pageSize, rect, rect);
    }

    private HeaderFooterParts Parts(string template, int pageNumber) =>
        HeaderFooter.Format(template, _fileName, pageNumber + 1, _now, _culture);

    private bool HasText(string template) => !Parts(template, 0).IsEmpty;

    private void DrawParts(DrawingContext dc, HeaderFooterParts parts, double y)
    {
        double left = _margins.Left;
        double width = ContentWidth;
        if (parts.Left.Length > 0)
        {
            dc.DrawText(Text(parts.Left), new Point(left, y));
        }
        if (parts.Center.Length > 0)
        {
            var text = Text(parts.Center);
            dc.DrawText(text, new Point(left + (width - text.WidthIncludingTrailingWhitespace) / 2, y));
        }
        if (parts.Right.Length > 0)
        {
            var text = Text(parts.Right);
            dc.DrawText(text, new Point(left + width - text.WidthIncludingTrailingWhitespace, y));
        }
    }

    private FormattedText Text(string s) =>
        new(s, _culture, FlowDirection.LeftToRight, _typeface, _fontSize, Brushes.Black, _pixelsPerDip);

    private double Measure(string s) => Text(s).WidthIncludingTrailingWhitespace;
}

/// <summary>Só as páginas de um intervalo (1-based, inclusivo) de outro paginador.</summary>
public sealed class PageRangePaginator(DocumentPaginator inner, int from, int to) : DocumentPaginator
{
    private readonly int _first = Math.Clamp(from, 1, Math.Max(1, inner.PageCount)) - 1;
    private readonly int _count = Math.Max(0, Math.Min(to, inner.PageCount) - Math.Clamp(from, 1, Math.Max(1, inner.PageCount)) + 1);

    public override bool IsPageCountValid => true;

    public override int PageCount => _count;

    public override Size PageSize
    {
        get => inner.PageSize;
        set => inner.PageSize = value;
    }

    public override IDocumentPaginatorSource? Source => null;

    public override DocumentPage GetPage(int pageNumber) => inner.GetPage(_first + pageNumber);
}
