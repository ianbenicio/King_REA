using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using PRKingNotepad.Core;
using Drawing = System.Drawing;
using Forms = System.Windows.Forms;

namespace PRKingNotepad;

/// <summary>Fonte, quebra automática, zoom, barra de status e preferências (especificação, 5 e 9).</summary>
public partial class MainWindow
{
    private const double DipPerPoint = 96.0 / 72.0;

    private readonly string _settingsPath;
    private readonly Settings _settings;
    private int _zoom = Zoom.Default;

    private TextEncodingKind DefaultEncoding => _settings.DefaultEncoding;

    /// <summary>Aplica as preferências lidas do disco. Chamado no construtor, antes de mostrar a janela.</summary>
    private void ApplySettings()
    {
        ApplyFont();
        ApplyWordWrap();
        ApplyStatusBar();
        _search.Term = _settings.Search.Term;
        _search.Replacement = _settings.Search.Replacement;
        _search.MatchCase = _settings.Search.MatchCase;
        _search.WrapAround = _settings.Search.WrapAround;
        _search.Direction = _settings.Search.Direction;
        RestorePlacement(_settings.Window);
    }

    /// <summary>Grava as preferências ao fechar. Falha aqui não impede o fechamento.</summary>
    private void SaveSettings()
    {
        _settings.Window = CurrentPlacement();
        _settings.Search = new SearchSettings
        {
            Term = _search.Term,
            Replacement = _search.Replacement,
            MatchCase = _search.MatchCase,
            WrapAround = _search.WrapAround,
            Direction = _search.Direction,
        };
        try
        {
            SettingsStore.Save(_settingsPath, _settings);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            Debug.WriteLine($"Preferências não gravadas em {_settingsPath}: {ex.Message}");
        }
    }

    // ---- Fonte (5.2) ----

    private void ApplyFont()
    {
        Editor.FontFamily = new FontFamily(_settings.FontFamily);
        Editor.FontWeight = _settings.FontBold ? FontWeights.Bold : FontWeights.Normal;
        Editor.FontStyle = _settings.FontItalic ? FontStyles.Italic : FontStyles.Normal;
        ApplyZoom();
    }

    private void OnChooseFont(object sender, RoutedEventArgs e)
    {
        var style = (_settings.FontBold ? Drawing.FontStyle.Bold : Drawing.FontStyle.Regular)
            | (_settings.FontItalic ? Drawing.FontStyle.Italic : Drawing.FontStyle.Regular);
        using var current = new Drawing.Font(_settings.FontFamily, (float)_settings.FontSize, style, Drawing.GraphicsUnit.Point);
        using var dialog = new Forms.FontDialog
        {
            Font = current,
            ShowEffects = false,
            ShowColor = false,
            AllowVerticalFonts = false,
            FontMustExist = true,
        };
        if (dialog.ShowDialog(new Win32Owner(this)) != Forms.DialogResult.OK)
        {
            return;
        }

        var chosen = dialog.Font;
        _settings.FontFamily = chosen.Name;
        _settings.FontSize = Math.Clamp(Math.Round(chosen.SizeInPoints, 1), Settings.MinFontSize, Settings.MaxFontSize);
        _settings.FontBold = chosen.Bold;
        _settings.FontItalic = chosen.Italic;
        ApplyFont();
    }

    private sealed class Win32Owner(Window window) : Forms.IWin32Window
    {
        public IntPtr Handle { get; } = new WindowInteropHelper(window).Handle;
    }

    // ---- Quebra automática (5.1) ----

    private void OnToggleWordWrap(object sender, RoutedEventArgs e)
    {
        _settings.WordWrap = WordWrapMenuItem.IsChecked;
        ApplyWordWrap();
    }

    private void ApplyWordWrap()
    {
        bool wrap = _settings.WordWrap;
        WordWrapMenuItem.IsChecked = wrap;
        Editor.TextWrapping = wrap ? TextWrapping.Wrap : TextWrapping.NoWrap;
        Editor.HorizontalScrollBarVisibility = wrap ? ScrollBarVisibility.Disabled : ScrollBarVisibility.Auto;
    }

    // ---- Zoom (5.3): não é gravado, volta a 100 % a cada execução ----

    private void OnZoomIn(object sender, ExecutedRoutedEventArgs e) => SetZoom(Zoom.In(_zoom));

    private void OnZoomOut(object sender, ExecutedRoutedEventArgs e) => SetZoom(Zoom.Out(_zoom));

    private void OnZoomReset(object sender, ExecutedRoutedEventArgs e) => SetZoom(Zoom.Default);

    private void OnEditorMouseWheel(object sender, MouseWheelEventArgs e)
    {
        if (Keyboard.Modifiers == ModifierKeys.Control)
        {
            SetZoom(e.Delta > 0 ? Zoom.In(_zoom) : Zoom.Out(_zoom));
            e.Handled = true;
        }
    }

    private void SetZoom(int percent)
    {
        _zoom = percent;
        ApplyZoom();
    }

    private void ApplyZoom()
    {
        Editor.FontSize = _settings.FontSize * DipPerPoint * _zoom / 100.0;
        StatusZoom.Text = $"{_zoom}%";
    }

    // ---- Barra de status (5.4) ----

    private void OnToggleStatusBar(object sender, RoutedEventArgs e)
    {
        _settings.StatusBarVisible = StatusBarMenuItem.IsChecked;
        ApplyStatusBar();
    }

    private void ApplyStatusBar()
    {
        StatusBarMenuItem.IsChecked = _settings.StatusBarVisible;
        StatusBar.Visibility = _settings.StatusBarVisible ? Visibility.Visible : Visibility.Collapsed;
    }

    // ---- Posição e tamanho da janela (seção 1) ----

    private void RestorePlacement(WindowPlacement? placement)
    {
        if (placement is null)
        {
            return;
        }
        // Só restaura se a barra de título cair numa área visível (o monitor pode não existir mais).
        var screen = new Rect(SystemParameters.VirtualScreenLeft, SystemParameters.VirtualScreenTop,
            SystemParameters.VirtualScreenWidth, SystemParameters.VirtualScreenHeight);
        var titleBar = Rect.Intersect(screen, new Rect(placement.Left, placement.Top, placement.Width, 40));
        if (titleBar.IsEmpty || titleBar.Width < 100 || titleBar.Height < 20)
        {
            return;
        }
        WindowStartupLocation = WindowStartupLocation.Manual;
        Left = placement.Left;
        Top = placement.Top;
        Width = placement.Width;
        Height = placement.Height;
        if (placement.Maximized)
        {
            WindowState = WindowState.Maximized;
        }
    }

    private WindowPlacement CurrentPlacement()
    {
        var bounds = WindowState == WindowState.Normal ? new Rect(Left, Top, ActualWidth, ActualHeight) : RestoreBounds;
        return new WindowPlacement(bounds.Left, bounds.Top, bounds.Width, bounds.Height, WindowState == WindowState.Maximized);
    }
}
