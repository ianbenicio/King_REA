using System.Globalization;
using System.Windows;
using System.Windows.Input;

namespace PRKingNotepad;

/// <summary>Caixa modal "Ir para linha" (especificação, 4.2).</summary>
public partial class GoToLineWindow : Window
{
    private readonly int _lineCount;

    public GoToLineWindow(int currentLine, int lineCount)
    {
        InitializeComponent();
        _lineCount = lineCount;
        LineBox.Text = currentLine.ToString(CultureInfo.InvariantCulture);
        Loaded += (_, _) =>
        {
            LineBox.Focus();
            LineBox.SelectAll();
        };
    }

    /// <summary>Linha escolhida (1-based), válida quando <see cref="Window.DialogResult"/> é verdadeiro.</summary>
    public int Line { get; private set; }

    private void OnPreviewTextInput(object sender, TextCompositionEventArgs e) =>
        e.Handled = !e.Text.All(char.IsAsciiDigit);

    private void OnGo(object sender, RoutedEventArgs e)
    {
        if (!int.TryParse(LineBox.Text, NumberStyles.None, CultureInfo.InvariantCulture, out int line) || line < 1)
        {
            Warn($"Digite um número de linha entre 1 e {_lineCount}.");
            return;
        }
        if (line > _lineCount)
        {
            // A caixa continua aberta para o usuário corrigir.
            Warn($"A linha {line} não existe: o documento tem {_lineCount} {(_lineCount == 1 ? "linha" : "linhas")}.");
            return;
        }
        Line = line;
        DialogResult = true;
    }

    private void Warn(string message)
    {
        MessageBox.Show(this, message, Title, MessageBoxButton.OK, MessageBoxImage.Warning);
        LineBox.Focus();
        LineBox.SelectAll();
    }
}
