using System.Windows;

[assembly:ThemeInfo(
    ResourceDictionaryLocation.None,            //where theme specific resource dictionaries are located
                                                //(used if a resource is not found in the page,
                                                // or application resource dictionaries)
    ResourceDictionaryLocation.SourceAssembly   //where the generic resource dictionary is located
                                                //(used if a resource is not found in the page,
                                                // app, or any theme specific resource dictionaries)
)]

// Os testes de interface em processo usam o construtor interno da janela e os substitutos de MainWindowServices.
[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("PRKingNotepad.Ui.Tests")]
