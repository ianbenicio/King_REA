using System.Windows;

namespace PRKingNotepad.Ui.Tests;

/// <summary>Mensagem exibida ou pergunta feita pela janela; <see cref="Buttons"/> é nulo nas que só informam.</summary>
internal sealed record Shown(Window Owner, string Caption, string Message, MessageBoxButton? Buttons, MessageBoxImage Icon);

/// <summary>Respostas prontas no lugar das caixas reais (AC-U2.6). Pergunta sem resposta preparada falha o teste.</summary>
internal sealed class FakeDialogs : IUserDialogs
{
    public Queue<SaveChoice> SaveAnswers { get; } = new();

    public Queue<MessageBoxResult> Answers { get; } = new();

    public List<string> SaveQuestions { get; } = [];

    public List<Shown> Messages { get; } = [];

    /// <summary>Ao encerrar o teste, a pergunta de salvar responde "Não salvar".</summary>
    public bool Closing { get; set; }

    public SaveChoice AskToSave(Window owner, string documentName)
    {
        SaveQuestions.Add(documentName);
        if (Closing)
        {
            return SaveChoice.DontSave;
        }
        return SaveAnswers.Count > 0
            ? SaveAnswers.Dequeue()
            : throw new InvalidOperationException($"Pergunta de salvar não esperada ({documentName}).");
    }

    public MessageBoxResult Ask(Window owner, string caption, string message, MessageBoxButton buttons, MessageBoxImage icon)
    {
        Messages.Add(new Shown(owner, caption, message, buttons, icon));
        return Answers.Count > 0
            ? Answers.Dequeue()
            : throw new InvalidOperationException($"Pergunta não esperada: {message}");
    }

    public void Show(Window owner, string caption, string message, MessageBoxImage icon) =>
        Messages.Add(new Shown(owner, caption, message, null, icon));
}
