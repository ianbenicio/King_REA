using System.Reflection;
using System.Windows;

namespace PRKingNotepad;

public partial class AboutWindow : Window
{
    public AboutWindow()
    {
        InitializeComponent();
        var version = Assembly.GetExecutingAssembly().GetName().Version;
        VersionText.Text = version is null ? "" : $"Versão {version.ToString(3)}";
    }

    private void OnOk(object sender, RoutedEventArgs e) => DialogResult = true;
}
