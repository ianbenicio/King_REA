using System.Windows;
using PRKingNotepad.Core;

namespace PRKingNotepad;

/// <summary>Estado da busca, compartilhado pelas janelas e pelos comandos F3 / Shift+F3.</summary>
public sealed class SearchState
{
    public string Term { get; set; } = "";
    public string Replacement { get; set; } = "";
    public bool MatchCase { get; set; }
    public bool WrapAround { get; set; }
    public SearchDirection Direction { get; set; } = SearchDirection.Down;
}

/// <summary>Janela não modal de localizar ou substituir (especificação, 4.1).</summary>
public partial class FindReplaceWindow : Window
{
    private readonly SearchState _state;
    private readonly bool _loading;

    public FindReplaceWindow(SearchState state, bool replaceMode)
    {
        InitializeComponent();
        _state = state;
        ReplaceMode = replaceMode;

        _loading = true;
        TermBox.Text = state.Term;
        ReplaceBox.Text = state.Replacement;
        MatchCaseBox.IsChecked = state.MatchCase;
        WrapBox.IsChecked = state.WrapAround;
        UpRadio.IsChecked = state.Direction == SearchDirection.Up;
        DownRadio.IsChecked = state.Direction == SearchDirection.Down;
        _loading = false;

        Title = replaceMode ? "Substituir" : "Localizar";
        var replaceVisibility = replaceMode ? Visibility.Visible : Visibility.Collapsed;
        ReplaceLabel.Visibility = replaceVisibility;
        ReplaceBox.Visibility = replaceVisibility;
        ReplaceButton.Visibility = replaceVisibility;
        ReplaceAllButton.Visibility = replaceVisibility;
        // Substituir sempre anda para baixo, como no original.
        DirectionGroup.Visibility = replaceMode ? Visibility.Collapsed : Visibility.Visible;

        UpdateButtons();
        Loaded += (_, _) =>
        {
            TermBox.Focus();
            TermBox.SelectAll();
        };
    }

    public bool ReplaceMode { get; }

    public event EventHandler? FindNextRequested;
    public event EventHandler? ReplaceRequested;
    public event EventHandler? ReplaceAllRequested;

    /// <summary>Troca o termo (ao reabrir com outra seleção no editor).</summary>
    public void SetTerm(string term)
    {
        TermBox.Text = term;
        TermBox.SelectAll();
    }

    private void OnInputChanged(object sender, RoutedEventArgs e)
    {
        if (_loading)
        {
            return;
        }
        _state.Term = TermBox.Text;
        _state.Replacement = ReplaceBox.Text;
        _state.MatchCase = MatchCaseBox.IsChecked == true;
        _state.WrapAround = WrapBox.IsChecked == true;
        if (!ReplaceMode)
        {
            _state.Direction = UpRadio.IsChecked == true ? SearchDirection.Up : SearchDirection.Down;
        }
        UpdateButtons();
    }

    private void UpdateButtons()
    {
        bool hasTerm = TermBox.Text.Length > 0;
        FindNextButton.IsEnabled = hasTerm;
        ReplaceButton.IsEnabled = hasTerm;
        ReplaceAllButton.IsEnabled = hasTerm;
    }

    private void OnFindNext(object sender, RoutedEventArgs e) => FindNextRequested?.Invoke(this, EventArgs.Empty);

    private void OnReplace(object sender, RoutedEventArgs e) => ReplaceRequested?.Invoke(this, EventArgs.Empty);

    private void OnReplaceAll(object sender, RoutedEventArgs e) => ReplaceAllRequested?.Invoke(this, EventArgs.Empty);

    private void OnCancel(object sender, RoutedEventArgs e) => Close();
}
