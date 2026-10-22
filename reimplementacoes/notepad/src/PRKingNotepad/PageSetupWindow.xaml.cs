using System.Globalization;
using System.Printing;
using System.Windows;
using System.Windows.Controls;
using PRKingNotepad.Core;

namespace PRKingNotepad;

/// <summary>
/// Configurar página (especificação, 10): papel, origem, orientação, margens, cabeçalho, rodapé e
/// escolha da impressora. Papel, origem e orientação ficam no tíquete de impressão da sessão.
/// </summary>
public partial class PageSetupWindow : Window
{
    private const double DipPerMm = 96 / 25.4;
    private const double MinTextAreaMm = 20;

    private PrintTicket? _ticket;
    private PrintCapabilities? _capabilities;

    private readonly IUserDialogs _dialogs;

    internal PageSetupWindow(PrintQueue? queue, PrintTicket? ticket, PageSettings page, IUserDialogs dialogs)
    {
        InitializeComponent();
        _dialogs = dialogs;
        Queue = queue;
        _ticket = ticket?.Clone();
        LeftBox.Text = Format(page.MarginLeftMm);
        RightBox.Text = Format(page.MarginRightMm);
        TopBox.Text = Format(page.MarginTopMm);
        BottomBox.Text = Format(page.MarginBottomMm);
        HeaderBox.Text = page.Header;
        FooterBox.Text = page.Footer;
        LoadPrinterOptions();
    }

    public PrintQueue? Queue { get; private set; }

    public PrintTicket? Ticket => _ticket;

    /// <summary>Configuração escolhida, válida quando <see cref="Window.DialogResult"/> é verdadeiro.</summary>
    public PageSettings Result { get; } = new();

    private static string Format(double mm) => mm.ToString("0.#", CultureInfo.CurrentCulture);

    private void LoadPrinterOptions()
    {
        SizeBox.Items.Clear();
        SourceBox.Items.Clear();
        _capabilities = null;
        if (Queue is not null && _ticket is not null)
        {
            try
            {
                _capabilities = Queue.GetPrintCapabilities(_ticket);
            }
            catch (PrintQueueException)
            {
                _capabilities = null;
            }
        }

        bool available = _capabilities is not null;
        SizeBox.IsEnabled = SourceBox.IsEnabled = PortraitRadio.IsEnabled = LandscapeRadio.IsEnabled = available;
        if (!available)
        {
            PrinterText.Text = "Nenhuma impressora disponível: papel, origem e orientação ficam desativados.";
            PortraitRadio.IsChecked = true;
            return;
        }

        PrinterText.Text = $"Impressora: {Queue!.FullName}";
        foreach (var size in _capabilities!.PageMediaSizeCapability)
        {
            var item = new ComboBoxItem { Content = Describe(size), Tag = size };
            SizeBox.Items.Add(item);
            if (size.PageMediaSizeName is { } name && name == _ticket!.PageMediaSize?.PageMediaSizeName)
            {
                SizeBox.SelectedItem = item;
            }
        }
        if (SizeBox.SelectedIndex < 0 && SizeBox.Items.Count > 0)
        {
            SizeBox.SelectedIndex = 0;
        }

        foreach (var bin in _capabilities.InputBinCapability)
        {
            var item = new ComboBoxItem { Content = Describe(bin), Tag = bin };
            SourceBox.Items.Add(item);
            if (bin == _ticket!.InputBin)
            {
                SourceBox.SelectedItem = item;
            }
        }
        if (SourceBox.Items.Count == 0)
        {
            SourceBox.Items.Add(new ComboBoxItem { Content = "Padrão da impressora" });
            SourceBox.IsEnabled = false;
        }
        if (SourceBox.SelectedIndex < 0)
        {
            SourceBox.SelectedIndex = 0;
        }

        bool landscape = _ticket!.PageOrientation is PageOrientation.Landscape or PageOrientation.ReverseLandscape;
        LandscapeRadio.IsChecked = landscape;
        PortraitRadio.IsChecked = !landscape;
    }

    private static string Describe(PageMediaSize size)
    {
        string name = size.PageMediaSizeName switch
        {
            PageMediaSizeName.ISOA3 => "A3",
            PageMediaSizeName.ISOA4 => "A4",
            PageMediaSizeName.ISOA5 => "A5",
            PageMediaSizeName.NorthAmericaLetter => "Carta",
            PageMediaSizeName.NorthAmericaLegal => "Ofício (Legal)",
            null => "Personalizado",
            var other => other.ToString()!,
        };
        return size.Width is double w && size.Height is double h
            ? $"{name} ({w / DipPerMm:0} × {h / DipPerMm:0} mm)"
            : name;
    }

    private static string Describe(InputBin bin) => bin switch
    {
        InputBin.AutoSelect => "Seleção automática",
        InputBin.Cassette => "Gaveta",
        InputBin.Tractor => "Formulário contínuo",
        InputBin.AutoSheetFeeder => "Alimentador automático",
        InputBin.Manual => "Alimentação manual",
        _ => bin.ToString(),
    };

    private void OnChoosePrinter(object sender, RoutedEventArgs e)
    {
        var dialog = new PrintDialog();
        if (Queue is not null && _ticket is not null)
        {
            dialog.PrintQueue = Queue;
            dialog.PrintTicket = _ticket;
        }
        if (dialog.ShowDialog() == true)
        {
            Queue = dialog.PrintQueue;
            _ticket = dialog.PrintTicket.Clone();
            LoadPrinterOptions();
        }
    }

    private void OnOk(object sender, RoutedEventArgs e)
    {
        if (!TryMargin(LeftBox, out double left) || !TryMargin(RightBox, out double right)
            || !TryMargin(TopBox, out double top) || !TryMargin(BottomBox, out double bottom))
        {
            return;
        }

        PageMediaSize? size = (SizeBox.SelectedItem as ComboBoxItem)?.Tag as PageMediaSize;
        bool landscape = LandscapeRadio.IsChecked == true;
        if (size?.Width is double w && size.Height is double h)
        {
            double pageW = (landscape ? h : w) / DipPerMm;
            double pageH = (landscape ? w : h) / DipPerMm;
            if (pageW - left - right < MinTextAreaMm || pageH - top - bottom < MinTextAreaMm)
            {
                Warn("As margens não deixam espaço suficiente para o texto nesse tamanho de papel.");
                return;
            }
        }

        if (_ticket is not null && _capabilities is not null)
        {
            if (size is not null)
            {
                _ticket.PageMediaSize = size;
            }
            _ticket.PageOrientation = landscape ? PageOrientation.Landscape : PageOrientation.Portrait;
            if ((SourceBox.SelectedItem as ComboBoxItem)?.Tag is InputBin bin)
            {
                _ticket.InputBin = bin;
            }
        }

        Result.MarginLeftMm = left;
        Result.MarginRightMm = right;
        Result.MarginTopMm = top;
        Result.MarginBottomMm = bottom;
        Result.Header = HeaderBox.Text;
        Result.Footer = FooterBox.Text;
        DialogResult = true;
    }

    private bool TryMargin(TextBox box, out double mm)
    {
        bool ok = (double.TryParse(box.Text, NumberStyles.Float, CultureInfo.CurrentCulture, out mm)
                   || double.TryParse(box.Text, NumberStyles.Float, CultureInfo.InvariantCulture, out mm))
                  && mm >= 0 && mm <= PageSettings.MaxMarginMm;
        if (!ok)
        {
            Warn($"Digite uma margem entre 0 e {PageSettings.MaxMarginMm:0} mm.");
            box.Focus();
            box.SelectAll();
        }
        return ok;
    }

    private void Warn(string message) => _dialogs.Show(this, Title, message, MessageBoxImage.Warning);
}
