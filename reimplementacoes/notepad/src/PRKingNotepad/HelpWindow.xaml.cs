using System.Windows;

namespace PRKingNotepad;

/// <summary>Ajuda local: resumo do programa e dos atalhos (textos próprios).</summary>
public partial class HelpWindow : Window
{
    private static readonly KeyValuePair<string, string>[] Items =
    [
        new("Ctrl+N", "Novo documento"),
        new("Ctrl+Shift+N", "Nova janela"),
        new("Ctrl+O", "Abrir (com escolha de codificação)"),
        new("Ctrl+S", "Salvar"),
        new("Ctrl+Shift+S", "Salvar como (com escolha de codificação)"),
        new("Ctrl+P", "Imprimir"),
        new("Ctrl+Z / Alt+Backspace", "Desfazer"),
        new("Ctrl+X / Ctrl+C / Ctrl+V", "Recortar / copiar / colar"),
        new("Del", "Excluir a seleção"),
        new("Ctrl+F", "Localizar"),
        new("F3 / Shift+F3", "Localizar próxima / anterior"),
        new("Ctrl+H", "Substituir"),
        new("Ctrl+G", "Ir para linha"),
        new("Ctrl+A", "Selecionar tudo"),
        new("F5", "Inserir hora e data"),
        new("Ctrl+= / Ctrl+-", "Ampliar / reduzir o zoom"),
        new("Ctrl+0", "Zoom de 100 %"),
        new("Ctrl+roda do mouse", "Zoom"),
        new("F1", "Esta ajuda"),
        new("/A arquivo, /W arquivo", "Linha de comando: abrir forçando ANSI ou UTF-16 LE"),
    ];

    public HelpWindow()
    {
        InitializeComponent();
        Shortcuts.ItemsSource = Items;
    }

    private void OnClose(object sender, RoutedEventArgs e) => Close();
}
