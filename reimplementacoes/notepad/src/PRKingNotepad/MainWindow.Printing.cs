using System.Globalization;
using System.Printing;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Documents.Serialization;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Xps;

namespace PRKingNotepad;

/// <summary>Configurar página e imprimir (especificação, 10).</summary>
public partial class MainWindow
{
    private const double DipPerMm = 96 / 25.4;

    // Impressora, papel, origem e orientação valem só para a sessão.
    private PrintQueue? _printQueue;
    private PrintTicket? _printTicket;

    private void OnPageSetup(object sender, RoutedEventArgs e)
    {
        EnsureDefaultPrinter();
        var dialog = new PageSetupWindow(_printQueue, _printTicket, _settings.Page, _services.Dialogs) { Owner = this };
        if (dialog.ShowDialog() == true)
        {
            _printQueue = dialog.Queue;
            _printTicket = dialog.Ticket;
            _settings.Page = dialog.Result;
        }
    }

    private void OnPrint(object sender, ExecutedRoutedEventArgs e)
    {
        EnsureDefaultPrinter();
        var dialog = new PrintDialog { UserPageRangeEnabled = true };
        if (_printQueue is not null && _printTicket is not null)
        {
            dialog.PrintQueue = _printQueue;
            dialog.PrintTicket = _printTicket;
        }
        if (dialog.ShowDialog() != true)
        {
            return;
        }
        _printQueue = dialog.PrintQueue;
        _printTicket = dialog.PrintTicket;

        DocumentPaginator paginator = BuildPaginator(_printQueue, _printTicket);
        if (dialog.PageRangeSelection == PageRangeSelection.UserPages)
        {
            paginator = new PageRangePaginator(paginator, dialog.PageRange.PageFrom, dialog.PageRange.PageTo);
        }
        if (paginator.PageCount == 0)
        {
            Inform("O intervalo de páginas escolhido não existe neste documento.");
            return;
        }
        PrintWithProgress(_printQueue, _printTicket, paginator);
    }

    /// <summary>Na primeira vez, usa a impressora padrão; sem impressora, segue sem.</summary>
    private void EnsureDefaultPrinter()
    {
        if (_printQueue is not null)
        {
            return;
        }
        try
        {
            _printQueue = LocalPrintServer.GetDefaultPrintQueue();
            _printTicket = _printQueue.UserPrintTicket ?? _printQueue.DefaultPrintTicket;
        }
        catch (Exception ex) when (ex is PrintQueueException or PrintSystemException or InvalidOperationException)
        {
            _printQueue = null;
            _printTicket = null;
        }
    }

    private PrintPaginator BuildPaginator(PrintQueue queue, PrintTicket ticket)
    {
        var capabilities = queue.GetPrintCapabilities(ticket);
        // Sem informação do driver, usa A4.
        var pageSize = new Size(capabilities.OrientedPageMediaWidth ?? 210 * DipPerMm,
            capabilities.OrientedPageMediaHeight ?? 297 * DipPerMm);
        var page = _settings.Page;
        var margins = new Thickness(page.MarginLeftMm * DipPerMm, page.MarginTopMm * DipPerMm,
            page.MarginRightMm * DipPerMm, page.MarginBottomMm * DipPerMm);
        var typeface = new Typeface(new FontFamily(_settings.FontFamily),
            _settings.FontItalic ? FontStyles.Italic : FontStyles.Normal,
            _settings.FontBold ? FontWeights.Bold : FontWeights.Normal,
            FontStretches.Normal);
        return new PrintPaginator(Editor.Text, DocumentName, typeface, _settings.FontSize * DipPerPoint, pageSize,
            margins, page.Header, page.Footer, _services.Now(), CultureInfo.CurrentCulture,
            VisualTreeHelper.GetDpi(this).PixelsPerDip);
    }

    private void PrintWithProgress(PrintQueue queue, PrintTicket ticket, DocumentPaginator paginator)
    {
        var writer = PrintQueue.CreateXpsDocumentWriter(queue);
        var progress = new PrintProgressWindow(DocumentName, paginator.PageCount) { Owner = this };
        progress.CancelRequested += (_, _) => writer.CancelAsync();
        writer.WritingProgressChanged += (_, e) =>
        {
            if (e.WritingLevel == WritingProgressChangeLevel.FixedPageWritingProgress)
            {
                progress.SetPage(e.Number);
            }
        };
        writer.WritingCompleted += (_, e) =>
        {
            progress.Finish();
            IsEnabled = true;
            Activate();
            if (e.Error is not null)
            {
                ShowError($"Não foi possível imprimir “{DocumentName}”.\n\n{e.Error.Message}");
            }
            StatusMessage.Text = e.Cancelled ? "Impressão cancelada." : e.Error is null ? "Documento enviado para a impressora." : "";
        };

        IsEnabled = false;
        progress.Show();
        try
        {
            writer.WriteAsync(paginator, ticket);
        }
        catch (Exception ex) when (ex is PrintSystemException or PrintingCanceledException or InvalidOperationException)
        {
            progress.Finish();
            IsEnabled = true;
            ShowError($"Não foi possível imprimir “{DocumentName}”.\n\n{ex.Message}");
        }
    }

    // ---- Ajuda ----

    private void OnHelp(object sender, ExecutedRoutedEventArgs e) => new HelpWindow { Owner = this }.Show();

    private void OnAbout(object sender, RoutedEventArgs e) => new AboutWindow { Owner = this }.ShowDialog();
}
