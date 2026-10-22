using System.ComponentModel;
using System.Windows;

namespace PRKingNotepad;

/// <summary>Progresso da impressão com Cancelar (especificação, 10).</summary>
public partial class PrintProgressWindow : Window
{
    private readonly int _pageCount;
    private bool _finished;

    public PrintProgressWindow(string documentName, int pageCount)
    {
        InitializeComponent();
        _pageCount = pageCount;
        DocumentText.Text = $"Imprimindo “{documentName}”";
        Bar.Maximum = Math.Max(1, pageCount);
        SetPage(0);
    }

    public event EventHandler? CancelRequested;

    public void SetPage(int page)
    {
        PageText.Text = page == 0 ? "Preparando..." : $"Página {page} de {_pageCount}";
        Bar.Value = page;
    }

    /// <summary>Fecha ao terminar, sem tratar o fechamento como cancelamento.</summary>
    public void Finish()
    {
        _finished = true;
        Close();
    }

    private void OnCancel(object sender, RoutedEventArgs e) => RequestCancel();

    protected override void OnClosing(CancelEventArgs e)
    {
        if (!_finished)
        {
            // Fechar pelo X também cancela; a janela some quando a impressão terminar de parar.
            e.Cancel = true;
            RequestCancel();
        }
        base.OnClosing(e);
    }

    private void RequestCancel()
    {
        PageText.Text = "Cancelando...";
        CancelRequested?.Invoke(this, EventArgs.Empty);
    }
}
