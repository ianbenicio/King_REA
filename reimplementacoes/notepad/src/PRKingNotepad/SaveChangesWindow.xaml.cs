using System.Windows;

namespace PRKingNotepad;

/// <summary>Pergunta "salvar alterações?" com Salvar / Não salvar / Cancelar (especificação, 6.1, 6.8 e 11).</summary>
public partial class SaveChangesWindow : Window
{
    public SaveChangesWindow(string documentName)
    {
        InitializeComponent();
        MessageText.Text = $"Deseja salvar as alterações em “{documentName}”?";
        Loaded += (_, _) => SaveButton.Focus();
    }

    /// <summary>Fechar pelo X ou por Esc conta como Cancelar.</summary>
    internal SaveChoice Choice { get; private set; } = SaveChoice.Cancel;

    private void OnSave(object sender, RoutedEventArgs e) => Choose(SaveChoice.Save);

    private void OnDontSave(object sender, RoutedEventArgs e) => Choose(SaveChoice.DontSave);

    private void Choose(SaveChoice choice)
    {
        Choice = choice;
        DialogResult = true;
    }
}
