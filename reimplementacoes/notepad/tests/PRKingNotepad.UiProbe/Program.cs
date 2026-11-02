using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;
using PRKingNotepad.Ui.Tests;

namespace PRKingNotepad.UiProbe;

/// <summary>
/// Confere, antes da suíte de UI WPF, se a sessão oferece o que ela exige: processo interativo, sessão de
/// usuário (não a sessão 0 de serviços), foco de teclado numa janela própria e ida e volta de um dado sintético
/// pela área de transferência. A saída é um JSON só com booleanos e a lista do que faltou; nenhum nome de
/// usuário, caminho ou conteúdo do clipboard sai daqui. Código de saída: 0 tudo presente, 1 algo faltou.
/// </summary>
internal static class Program
{
    private static readonly TimeSpan FocusLimit = TimeSpan.FromSeconds(3);

    [STAThread]
    private static int Main()
    {
        var checks = new (string Name, bool Ok)[]
        {
            ("interativa", Environment.UserInteractive),
            ("sessao_de_usuario", Process.GetCurrentProcess().SessionId != 0),
            ("foco_de_teclado", Safe(KeyboardFocusWorks)),
            ("clipboard", Safe(ClipboardRoundTripWorks)),
        };
        var missing = checks.Where(c => !c.Ok).Select(c => $"\"{c.Name}\"");
        var fields = checks.Select(c => $"\"{c.Name}\":{(c.Ok ? "true" : "false")}");
        Console.WriteLine($"{{{string.Join(",", fields)},\"faltou\":[{string.Join(",", missing)}]}}");
        return checks.All(c => c.Ok) ? 0 : 1;
    }

    private static bool Safe(Func<bool> check)
    {
        try
        {
            return check();
        }
        catch (Exception)
        {
            // Qualquer erro ao medir é pré-requisito não comprovado, nunca aprovado.
            return false;
        }
    }

    /// <summary>Uma janela pequena, só desta sonda, recebe foco de teclado e é fechada em seguida.</summary>
    private static bool KeyboardFocusWorks()
    {
        var box = new TextBox();
        var window = new Window
        {
            Title = "PRKing sonda",
            Width = 160,
            Height = 80,
            Left = 0,
            Top = 0,
            WindowStartupLocation = WindowStartupLocation.Manual,
            WindowStyle = WindowStyle.ToolWindow,
            ShowInTaskbar = false,
            Content = box,
        };
        try
        {
            window.Show();
            window.Activate();
            var limit = Stopwatch.StartNew();
            while (limit.Elapsed < FocusLimit)
            {
                Keyboard.Focus(box);
                DoEvents();
                if (window.IsActive && box.IsKeyboardFocused)
                {
                    return true;
                }
                Thread.Sleep(50);
            }
            return false;
        }
        finally
        {
            window.Close();
            DoEvents();
        }
    }

    /// <summary>Um texto sintético vai e volta; o conteúdo anterior do clipboard é devolvido pelo <see cref="ClipboardScope"/>.</summary>
    private static bool ClipboardRoundTripWorks()
    {
        string token = $"prking-sonda-{Guid.NewGuid():N}";
        using var scope = new ClipboardScope();
        return Retry(() =>
        {
            Clipboard.SetText(token);
            return Clipboard.GetText() == token;
        });
    }

    /// <summary>O clipboard pode estar aberto por outro programa por instantes: tenta de novo antes de dar como ausente.</summary>
    private static bool Retry(Func<bool> action)
    {
        for (int attempt = 0; ; attempt++)
        {
            try
            {
                return action();
            }
            catch (ExternalException) when (attempt < 9)
            {
                Thread.Sleep(50);
            }
        }
    }

    private static void DoEvents()
    {
        var frame = new DispatcherFrame();
        Dispatcher.CurrentDispatcher.BeginInvoke(DispatcherPriority.ApplicationIdle, () => frame.Continue = false);
        Dispatcher.PushFrame(frame);
    }
}
