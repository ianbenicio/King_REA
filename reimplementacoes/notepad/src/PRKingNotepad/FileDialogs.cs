using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using PRKingNotepad.Core;

namespace PRKingNotepad;

/// <summary>
/// Caixas Abrir e Salvar do Windows com uma lista extra de codificação (especificação, 6.2 e 6.4).
/// O WPF não expõe a personalização da caixa; usa a interface COM do shell.
/// </summary>
internal static class FileDialogs
{
    private const string TextFilesLabel = "Arquivos de texto (*.txt)";
    private const string AllFilesLabel = "Todos os arquivos (*.*)";
    private const string EncodingLabel = "Codificação:";
    private const string AutoDetectLabel = "Detecção automática";
    private const uint GroupId = 100;
    private const uint ComboId = 101;
    private const uint AutoDetectItem = 1000;
    private const uint ItemBase = 1; // item da lista = (uint)codificação + ItemBase
    private const int ErrorCancelled = unchecked((int)0x800704C7);

    /// <returns>Arquivo escolhido e codificação forçada (<c>null</c> = detecção automática), ou <c>null</c> se cancelou.</returns>
    public static (string Path, TextEncodingKind? Encoding)? Open(Window owner, string? initialDirectory)
    {
        var dialog = (IFileDialog)new FileOpenDialogCoClass();
        try
        {
            Prepare(dialog, initialDirectory, fileName: null);
            dialog.GetOptions(out var options);
            dialog.SetOptions(options | Fos.FileMustExist | Fos.PathMustExist | Fos.ForceFileSystem | Fos.NoChangeDir);

            var customize = (IFileDialogCustomize)dialog;
            AddEncodingCombo(customize, includeAutoDetect: true);
            customize.SetSelectedControlItem(ComboId, AutoDetectItem);

            string? path = ShowAndGetPath(dialog, owner);
            if (path is null)
            {
                return null;
            }
            customize.GetSelectedControlItem(ComboId, out uint item);
            return (path, item == AutoDetectItem ? null : (TextEncodingKind)(item - ItemBase));
        }
        finally
        {
            Marshal.ReleaseComObject(dialog);
        }
    }

    /// <returns>Arquivo escolhido e codificação de gravação, ou <c>null</c> se cancelou.</returns>
    public static (string Path, TextEncodingKind Encoding)? Save(Window owner, string? initialDirectory, string fileName, TextEncodingKind current)
    {
        var dialog = (IFileDialog)new FileSaveDialogCoClass();
        try
        {
            Prepare(dialog, initialDirectory, fileName);
            dialog.GetOptions(out var options);
            dialog.SetOptions(options | Fos.OverwritePrompt | Fos.PathMustExist | Fos.ForceFileSystem | Fos.NoChangeDir);

            var customize = (IFileDialogCustomize)dialog;
            AddEncodingCombo(customize, includeAutoDetect: false);
            customize.SetSelectedControlItem(ComboId, (uint)current + ItemBase);

            string? path = ShowAndGetPath(dialog, owner);
            if (path is null)
            {
                return null;
            }
            customize.GetSelectedControlItem(ComboId, out uint item);
            return (path, (TextEncodingKind)(item - ItemBase));
        }
        finally
        {
            Marshal.ReleaseComObject(dialog);
        }
    }

    private static void Prepare(IFileDialog dialog, string? initialDirectory, string? fileName)
    {
        dialog.SetFileTypes(2,
        [
            new FilterSpec { Name = TextFilesLabel, Spec = "*.txt" },
            new FilterSpec { Name = AllFilesLabel, Spec = "*.*" },
        ]);
        dialog.SetFileTypeIndex(1);
        // Com o filtro de texto, nome sem extensão ganha ".txt".
        dialog.SetDefaultExtension("txt");
        if (fileName is not null)
        {
            dialog.SetFileName(fileName);
        }
        if (initialDirectory is not null && Directory.Exists(initialDirectory)
            && SHCreateItemFromParsingName(initialDirectory, IntPtr.Zero, typeof(IShellItem).GUID, out var folder) == 0)
        {
            try
            {
                dialog.SetFolder(folder);
            }
            finally
            {
                Marshal.ReleaseComObject(folder);
            }
        }
    }

    private static void AddEncodingCombo(IFileDialogCustomize customize, bool includeAutoDetect)
    {
        customize.StartVisualGroup(GroupId, EncodingLabel);
        customize.AddComboBox(ComboId);
        if (includeAutoDetect)
        {
            customize.AddControlItem(ComboId, AutoDetectItem, AutoDetectLabel);
        }
        foreach (var kind in Enum.GetValues<TextEncodingKind>())
        {
            customize.AddControlItem(ComboId, (uint)kind + ItemBase, kind.DisplayName());
        }
        customize.EndVisualGroup();
    }

    private static string? ShowAndGetPath(IFileDialog dialog, Window owner)
    {
        int hr = dialog.Show(new WindowInteropHelper(owner).Handle);
        if (hr == ErrorCancelled)
        {
            return null;
        }
        Marshal.ThrowExceptionForHR(hr);

        dialog.GetResult(out var item);
        try
        {
            item.GetDisplayName(Sigdn.FileSysPath, out IntPtr buffer);
            try
            {
                return Marshal.PtrToStringUni(buffer);
            }
            finally
            {
                Marshal.FreeCoTaskMem(buffer);
            }
        }
        finally
        {
            Marshal.ReleaseComObject(item);
        }
    }

    // ---- Interop (shobjidl_core.h) ----

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SHCreateItemFromParsingName(string path, IntPtr bindContext, in Guid riid, out IShellItem item);

    [Flags]
    private enum Fos : uint
    {
        OverwritePrompt = 0x2,
        NoChangeDir = 0x8,
        ForceFileSystem = 0x40,
        PathMustExist = 0x800,
        FileMustExist = 0x1000,
    }

    private enum Sigdn : uint
    {
        FileSysPath = 0x80058000,
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct FilterSpec
    {
        [MarshalAs(UnmanagedType.LPWStr)] public string Name;
        [MarshalAs(UnmanagedType.LPWStr)] public string Spec;
    }

    [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7"), ClassInterface(ClassInterfaceType.None)]
    private class FileOpenDialogCoClass;

    [ComImport, Guid("C0B4E2F3-BA21-4773-8DBA-335EC946EB8B"), ClassInterface(ClassInterfaceType.None)]
    private class FileSaveDialogCoClass;

    [ComImport, Guid("43826d1e-e718-42ee-bc55-a1e261c37bfe"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IShellItem
    {
        void BindToHandler(IntPtr pbc, in Guid bhid, in Guid riid, out IntPtr ppv);
        void GetParent(out IShellItem parent);
        void GetDisplayName(Sigdn sigdnName, out IntPtr name);
        void GetAttributes(uint mask, out uint attributes);
        void Compare(IShellItem other, uint hint, out int order);
    }

    // Ordem da vtable: IModalWindow::Show e depois IFileDialog, exatamente como no cabeçalho.
    [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IFileDialog
    {
        [PreserveSig] int Show(IntPtr parent);
        void SetFileTypes(uint count, [In, MarshalAs(UnmanagedType.LPArray)] FilterSpec[] filters);
        void SetFileTypeIndex(uint index);
        void GetFileTypeIndex(out uint index);
        void Advise(IntPtr events, out uint cookie);
        void Unadvise(uint cookie);
        void SetOptions(Fos options);
        void GetOptions(out Fos options);
        void SetDefaultFolder(IShellItem folder);
        void SetFolder(IShellItem folder);
        void GetFolder(out IShellItem folder);
        void GetCurrentSelection(out IShellItem item);
        void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string name);
        void GetFileName(out IntPtr name);
        void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
        void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string text);
        void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
        void GetResult(out IShellItem item);
        void AddPlace(IShellItem item, int place);
        void SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string extension);
        void Close(int hr);
        void SetClientGuid(in Guid guid);
        void ClearClientData();
        void SetFilter(IntPtr filter);
    }

    [ComImport, Guid("e6fdd21a-163f-4975-9c8c-a69f1ba37034"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IFileDialogCustomize
    {
        void EnableOpenDropDown(uint id);
        void AddMenu(uint id, [MarshalAs(UnmanagedType.LPWStr)] string label);
        void AddPushButton(uint id, [MarshalAs(UnmanagedType.LPWStr)] string label);
        void AddComboBox(uint id);
        void AddRadioButtonList(uint id);
        void AddCheckButton(uint id, [MarshalAs(UnmanagedType.LPWStr)] string label, [MarshalAs(UnmanagedType.Bool)] bool isChecked);
        void AddEditBox(uint id, [MarshalAs(UnmanagedType.LPWStr)] string text);
        void AddSeparator(uint id);
        void AddText(uint id, [MarshalAs(UnmanagedType.LPWStr)] string text);
        void SetControlLabel(uint id, [MarshalAs(UnmanagedType.LPWStr)] string label);
        void GetControlState(uint id, out uint state);
        void SetControlState(uint id, uint state);
        void GetEditBoxText(uint id, out IntPtr text);
        void SetEditBoxText(uint id, [MarshalAs(UnmanagedType.LPWStr)] string text);
        void GetCheckButtonState(uint id, [MarshalAs(UnmanagedType.Bool)] out bool isChecked);
        void SetCheckButtonState(uint id, [MarshalAs(UnmanagedType.Bool)] bool isChecked);
        void AddControlItem(uint id, uint item, [MarshalAs(UnmanagedType.LPWStr)] string label);
        void RemoveControlItem(uint id, uint item);
        void RemoveAllControlItems(uint id);
        void GetControlItemState(uint id, uint item, out uint state);
        void SetControlItemState(uint id, uint item, uint state);
        void GetSelectedControlItem(uint id, out uint item);
        void SetSelectedControlItem(uint id, uint item);
        void StartVisualGroup(uint id, [MarshalAs(UnmanagedType.LPWStr)] string label);
        void EndVisualGroup();
        void MakeProminent(uint id);
        void SetControlItemText(uint id, uint item, [MarshalAs(UnmanagedType.LPWStr)] string text);
    }
}
