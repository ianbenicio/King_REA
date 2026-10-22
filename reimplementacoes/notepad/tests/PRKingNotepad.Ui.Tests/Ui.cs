using System.Runtime.ExceptionServices;
using System.Windows;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Threading;

// As janelas de teste mexem na área de transferência e no estado de teclado da thread: uma classe por vez.
[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace PRKingNotepad.Ui.Tests;

/// <summary>
/// Roda cada teste numa thread STA própria, com o seu <see cref="Dispatcher"/>, e espera o dispatcher
/// ficar ocioso em vez de dormir (AC-U3.5).
/// </summary>
internal static class Ui
{
    private static readonly TimeSpan Limit = TimeSpan.FromSeconds(60);

    public static void Run(Action body)
    {
        ExceptionDispatchInfo? failure = null;
        Dispatcher? running = null;
        var thread = new Thread(() =>
        {
            var dispatcher = Dispatcher.CurrentDispatcher;
            running = dispatcher;
            SynchronizationContext.SetSynchronizationContext(new DispatcherSynchronizationContext(dispatcher));
            try
            {
                body();
            }
            catch (Exception ex)
            {
                failure = ExceptionDispatchInfo.Capture(ex);
            }
            finally
            {
                dispatcher.InvokeShutdown();
            }
        });
        thread.SetApartmentState(ApartmentState.STA);
        thread.IsBackground = true;
        thread.Start();
        // Uma caixa modal que ninguém fecha vira falha, não um teste parado para sempre. O dispatcher é encerrado
        // (o laço da caixa termina com ele) para a janela não seguir aberta durante os testes seguintes.
        if (!thread.Join(Limit))
        {
            running?.BeginInvokeShutdown(DispatcherPriority.Send);
            thread.Join(TimeSpan.FromSeconds(5));
            Assert.Fail($"O teste de interface passou de {Limit.TotalSeconds} s (caixa modal aberta?).");
        }
        failure?.Throw();
    }

    /// <summary>Processa tudo o que está na fila do dispatcher, inclusive a revalidação dos comandos.</summary>
    public static void DoEvents()
    {
        var frame = new DispatcherFrame();
        Dispatcher.CurrentDispatcher.BeginInvoke(DispatcherPriority.ApplicationIdle, () => frame.Continue = false);
        Dispatcher.PushFrame(frame);
    }

    /// <summary>
    /// Agenda o que fazer com a caixa modal do tipo <typeparamref name="T"/> quando ela abrir: o
    /// <c>ShowDialog</c> roda um laço próprio, que executa o agendado depois de a caixa carregar.
    /// </summary>
    public static void WhenOpened<T>(Window owner, Action<T> act) where T : Window
    {
        owner.Dispatcher.BeginInvoke(DispatcherPriority.ApplicationIdle, () =>
        {
            var dialog = owner.OwnedWindows.OfType<T>().SingleOrDefault()
                ?? throw new InvalidOperationException($"A caixa {typeof(T).Name} não abriu.");
            Input.ReleaseModifiers();
            try
            {
                act(dialog);
            }
            catch
            {
                // Falha dentro da caixa: fecha para o ShowDialog voltar e a falha chegar ao teste.
                dialog.Close();
                throw;
            }
        });
    }

    /// <summary>Clica no botão como o usuário (inclui IsDefault/IsCancel e o comando do botão).</summary>
    public static void Click(Button button)
    {
        var invoke = (IInvokeProvider)new ButtonAutomationPeer(button).GetPattern(PatternInterface.Invoke);
        invoke.Invoke();
        DoEvents();
    }

    /// <summary>Clica no item de menu como o usuário (alterna os marcáveis e executa o comando ou o Click).</summary>
    public static void Click(MenuItem item)
    {
        var invoke = (IInvokeProvider)new MenuItemAutomationPeer(item).GetPattern(PatternInterface.Invoke);
        invoke.Invoke();
        DoEvents();
    }

    /// <summary>Marca ou desmarca a caixa e avisa como o clique do usuário avisaria (evento Click).</summary>
    public static void Check(System.Windows.Controls.Primitives.ToggleButton box, bool value)
    {
        box.IsChecked = value;
        box.RaiseEvent(new RoutedEventArgs(System.Windows.Controls.Primitives.ButtonBase.ClickEvent, box));
        DoEvents();
    }

    public static Button Button(DependencyObject root, string content) =>
        Descendants<Button>(root).Single(b => b.Content as string == content);

    public static MenuItem MenuItem(DependencyObject root, string header) =>
        Descendants<MenuItem>(root).Single(m => m.Header as string == header);

    public static IEnumerable<T> Descendants<T>(DependencyObject root) where T : DependencyObject
    {
        foreach (object child in LogicalTreeHelper.GetChildren(root))
        {
            if (child is not DependencyObject node)
            {
                continue;
            }
            if (node is T match)
            {
                yield return match;
            }
            foreach (var inner in Descendants<T>(node))
            {
                yield return inner;
            }
        }
    }
}
