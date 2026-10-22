using System.Windows;

namespace PRKingNotepad;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        // Tema visual atual também na caixa de fonte nativa (WinForms).
        System.Windows.Forms.Application.EnableVisualStyles();
        base.OnStartup(e);
    }
}
