namespace PRKingNotepad.Core;

public sealed class FileTooLargeException(string path, long length)
    : IOException($"Arquivo grande demais: {path} ({length} bytes).")
{
    public string FilePath { get; } = path;
    public long Length { get; } = length;
}

/// <summary>Leitura e gravação de arquivos de texto (especificação, 6.2 e 6.3).</summary>
public static class TextFileStore
{
    /// <summary>Arquivos de 1 GiB ou mais são recusados.</summary>
    public const long MaxBytes = 1L << 30;

    public static byte[] ReadAll(string path, long maxBytes = MaxBytes)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        if (stream.Length >= maxBytes)
        {
            throw new FileTooLargeException(path, stream.Length);
        }

        var buffer = new byte[stream.Length];
        stream.ReadExactly(buffer);
        return buffer;
    }

    /// <summary>
    /// Grava num arquivo temporário na mesma pasta e só então substitui o destino, para
    /// uma falha no meio não destruir o original. Diferença deliberada: o original grava
    /// direto no arquivo.
    /// </summary>
    public static void WriteAtomic(string path, byte[] bytes)
    {
        string full = Path.GetFullPath(path);
        string directory = Path.GetDirectoryName(full)!;
        string temp = Path.Combine(directory, $".{Path.GetFileName(full)}.{Guid.NewGuid():N}.tmp");
        try
        {
            using (var stream = new FileStream(temp, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                stream.Write(bytes);
                stream.Flush(flushToDisk: true);
            }

            if (File.Exists(full))
            {
                File.Replace(temp, full, destinationBackupFileName: null, ignoreMetadataErrors: true);
            }
            else
            {
                File.Move(temp, full);
            }
        }
        finally
        {
            if (File.Exists(temp))
            {
                File.Delete(temp);
            }
        }
    }
}
