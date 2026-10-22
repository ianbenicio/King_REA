using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Input;

namespace PRKingNotepad.Ui.Tests;

/// <summary>
/// Teclas e roda do mouse entregues pelo roteamento do WPF (PreviewKeyDown → KeyDown), como o
/// teclado entregaria. Os modificadores vão para o estado de teclado da própria thread de teste
/// (<c>SetKeyboardState</c>), que é o que o WPF consulta ao comparar atalhos; nenhuma outra
/// thread ou programa vê essa mudança.
/// </summary>
internal static class Input
{
    private const int VkShift = 0x10, VkControl = 0x11, VkMenu = 0x12;
    private const int VkLShift = 0xA0, VkLControl = 0xA2, VkLMenu = 0xA4;
    private const byte Down = 0x80;

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool SetKeyboardState(byte[] keyState);

    public static void Press(UIElement target, Key key, ModifierKeys modifiers = ModifierKeys.None) =>
        WithModifiers(modifiers, () =>
        {
            var source = PresentationSource.FromVisual(target)
                ?? throw new InvalidOperationException("A janela precisa estar aberta para receber teclas.");
            var preview = new KeyEventArgs(Keyboard.PrimaryDevice, source, 0, key) { RoutedEvent = Keyboard.PreviewKeyDownEvent };
            target.RaiseEvent(preview);
            if (!preview.Handled)
            {
                target.RaiseEvent(new KeyEventArgs(Keyboard.PrimaryDevice, source, 0, key) { RoutedEvent = Keyboard.KeyDownEvent });
            }
        });

    /// <summary>Um clique da roda (120 = para cima, -120 = para baixo).</summary>
    public static void Wheel(UIElement target, int delta, ModifierKeys modifiers) =>
        WithModifiers(modifiers, () =>
        {
            var preview = new MouseWheelEventArgs(Mouse.PrimaryDevice, 0, delta) { RoutedEvent = UIElement.PreviewMouseWheelEvent };
            target.RaiseEvent(preview);
            if (!preview.Handled)
            {
                target.RaiseEvent(new MouseWheelEventArgs(Mouse.PrimaryDevice, 0, delta) { RoutedEvent = UIElement.MouseWheelEvent });
            }
        });

    /// <summary>
    /// Texto digitado no ponto do cursor, pelo mesmo caminho da digitação (PreviewTextInput → TextInput);
    /// cada CRLF do texto é a tecla Enter.
    /// </summary>
    public static void Type(UIElement target, string text)
    {
        string[] lines = text.Split("\r\n");
        for (int i = 0; i < lines.Length; i++)
        {
            if (i > 0)
            {
                Press(target, Key.Enter);
            }
            TypeLine(target, lines[i]);
        }
        Ui.DoEvents();
    }

    /// <summary>Solta os modificadores: uma caixa modal aberta por um atalho recebe o teclado já sem eles.</summary>
    public static void ReleaseModifiers() => Set(new byte[256]);

    private static void TypeLine(UIElement target, string text)
    {
        foreach (char c in text)
        {
            var composition = new TextComposition(InputManager.Current, target, c.ToString());
            var preview = new TextCompositionEventArgs(Keyboard.PrimaryDevice, composition)
            {
                RoutedEvent = TextCompositionManager.PreviewTextInputEvent,
            };
            target.RaiseEvent(preview);
            if (!preview.Handled)
            {
                target.RaiseEvent(new TextCompositionEventArgs(Keyboard.PrimaryDevice, composition)
                {
                    RoutedEvent = TextCompositionManager.TextInputEvent,
                });
            }
        }
    }

    private static void WithModifiers(ModifierKeys modifiers, Action deliver)
    {
        var state = new byte[256];
        if (modifiers.HasFlag(ModifierKeys.Control))
        {
            state[VkControl] = state[VkLControl] = Down;
        }
        if (modifiers.HasFlag(ModifierKeys.Shift))
        {
            state[VkShift] = state[VkLShift] = Down;
        }
        if (modifiers.HasFlag(ModifierKeys.Alt))
        {
            state[VkMenu] = state[VkLMenu] = Down;
        }
        Set(state);
        try
        {
            Assert.Equal(modifiers, Keyboard.Modifiers);
            deliver();
        }
        finally
        {
            Set(new byte[256]);
        }
        Ui.DoEvents();
    }

    private static void Set(byte[] state)
    {
        if (!SetKeyboardState(state))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
    }
}
