using System.Runtime.InteropServices;

namespace PRKingNotepad;

internal static class NativeMethods
{
    /// <summary>Página de código ANSI do sistema (a "ANSI" do Windows).</summary>
    [DllImport("kernel32.dll")]
    internal static extern uint GetACP();

    private const uint ShardPathW = 3;

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern void SHAddToRecentDocs(uint flags, string path);

    /// <summary>Registra o arquivo nos documentos recentes do Windows (especificação, 6.2).</summary>
    internal static void AddToRecentDocuments(string path) => SHAddToRecentDocs(ShardPathW, path);
}
