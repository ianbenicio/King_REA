namespace PRKingNotepad.Core;

/// <summary>Textos das mensagens de arquivo (especificação, 6.2 e 11), sempre com o nome do arquivo.</summary>
public static class FileMessages
{
    /// <summary>Exceções que viram mensagem ao usuário em vez de derrubar o programa.</summary>
    public static bool IsFileError(Exception ex) =>
        ex is IOException or UnauthorizedAccessException or ArgumentException or NotSupportedException;

    /// <param name="opening">Verdadeiro ao abrir; falso ao gravar ou criar.</param>
    public static string Describe(Exception ex, string path, bool opening)
    {
        string action = opening ? "abrir" : "gravar";
        return ex switch
        {
            FileNotFoundException or DirectoryNotFoundException =>
                $"Não foi possível encontrar “{path}”.\n\nConfira o nome e a pasta.",
            UnauthorizedAccessException => $"Sem permissão para {action} “{path}”.",
            ArgumentException or NotSupportedException or PathTooLongException =>
                $"O nome de arquivo “{path}” não é válido.",
            _ => $"Não foi possível {action} “{path}”.\n\n{ex.Message}",
        };
    }

    public static string TooLarge(string path) =>
        $"O arquivo “{Path.GetFileName(path)}” é grande demais para abrir (limite de 1 GiB).";

    public static string OutOfMemory(string path) =>
        $"Não há memória suficiente para abrir “{Path.GetFileName(path)}”.";
}
