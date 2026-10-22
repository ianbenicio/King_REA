using System.Windows;

namespace PRKingNotepad;

/// <summary>Resposta à pergunta de salvar alterações (especificação, 11).</summary>
internal enum SaveChoice
{
    Save,
    DontSave,
    Cancel,
}

/// <summary>Perguntas e mensagens ao usuário. Os testes de interface trocam por respostas prontas.</summary>
internal interface IUserDialogs
{
    SaveChoice AskToSave(Window owner, string documentName);

    MessageBoxResult Ask(Window owner, string caption, string message, MessageBoxButton buttons, MessageBoxImage icon);

    void Show(Window owner, string caption, string message, MessageBoxImage icon);
}

/// <summary>Caixas reais: janela própria para salvar, <see cref="MessageBox"/> para o resto.</summary>
internal sealed class SystemDialogs : IUserDialogs
{
    public SaveChoice AskToSave(Window owner, string documentName)
    {
        var window = new SaveChangesWindow(documentName) { Owner = owner };
        window.ShowDialog();
        return window.Choice;
    }

    public MessageBoxResult Ask(Window owner, string caption, string message, MessageBoxButton buttons, MessageBoxImage icon) =>
        MessageBox.Show(owner, message, caption, buttons, icon);

    public void Show(Window owner, string caption, string message, MessageBoxImage icon) =>
        MessageBox.Show(owner, message, caption, MessageBoxButton.OK, icon);
}
