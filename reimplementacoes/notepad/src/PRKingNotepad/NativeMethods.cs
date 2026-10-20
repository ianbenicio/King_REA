using System.Runtime.InteropServices;

namespace PRKingNotepad;

internal static class NativeMethods
{
    /// <summary>Página de código ANSI do sistema (a "ANSI" do Windows).</summary>
    [DllImport("kernel32.dll")]
    internal static extern uint GetACP();
}
