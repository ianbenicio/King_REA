using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class DisplayNameTests
{
    [Theory]
    [InlineData(LineEnding.CrLf, "Windows (CRLF)")]
    [InlineData(LineEnding.Lf, "Unix (LF)")]
    [InlineData(LineEnding.Cr, "Macintosh (CR)")]
    public void Line_ending_names_match_the_status_bar(LineEnding ending, string expected) =>
        Assert.Equal(expected, ending.DisplayName());

    [Theory]
    [InlineData(TextEncodingKind.Ansi, "ANSI")]
    [InlineData(TextEncodingKind.Utf16Le, "UTF-16 LE")]
    [InlineData(TextEncodingKind.Utf16Be, "UTF-16 BE")]
    [InlineData(TextEncodingKind.Utf8, "UTF-8")]
    [InlineData(TextEncodingKind.Utf8Bom, "UTF-8 com BOM")]
    public void Encoding_names_match_the_status_bar(TextEncodingKind kind, string expected) =>
        Assert.Equal(expected, kind.DisplayName());

    [Fact]
    public void Every_encoding_has_a_name() =>
        Assert.All(Enum.GetValues<TextEncodingKind>(), kind => Assert.NotEmpty(kind.DisplayName()));
}

public class FileMessageTests
{
    private const string FilePath = @"C:\pasta\notas.txt";

    [Fact]
    public void Missing_file_names_the_path()
    {
        string message = FileMessages.Describe(new FileNotFoundException(), FilePath, opening: true);
        Assert.StartsWith($"Não foi possível encontrar “{FilePath}”.", message);
    }

    [Fact]
    public void Missing_folder_is_reported_like_a_missing_file()
    {
        string message = FileMessages.Describe(new DirectoryNotFoundException(), FilePath, opening: false);
        Assert.StartsWith($"Não foi possível encontrar “{FilePath}”.", message);
    }

    [Theory]
    [InlineData(true, "Sem permissão para abrir “C:\\pasta\\notas.txt”.")]
    [InlineData(false, "Sem permissão para gravar “C:\\pasta\\notas.txt”.")]
    public void Access_denied_says_which_action(bool opening, string expected) =>
        Assert.Equal(expected, FileMessages.Describe(new UnauthorizedAccessException(), FilePath, opening));

    [Fact]
    public void Invalid_name_is_reported_as_invalid()
    {
        foreach (var ex in new Exception[] { new ArgumentException(), new NotSupportedException(), new PathTooLongException() })
        {
            Assert.Equal($"O nome de arquivo “{FilePath}” não é válido.", FileMessages.Describe(ex, FilePath, opening: false));
        }
    }

    [Fact]
    public void Other_io_errors_carry_the_system_message()
    {
        string message = FileMessages.Describe(new IOException("disco cheio"), FilePath, opening: false);
        Assert.Equal($"Não foi possível gravar “{FilePath}”.\n\ndisco cheio", message);
    }

    [Fact]
    public void Too_large_and_out_of_memory_name_the_file()
    {
        Assert.Equal("O arquivo “notas.txt” é grande demais para abrir (limite de 1 GiB).", FileMessages.TooLarge(FilePath));
        Assert.Equal("Não há memória suficiente para abrir “notas.txt”.", FileMessages.OutOfMemory(FilePath));
    }

    [Theory]
    [InlineData(typeof(IOException), true)]
    [InlineData(typeof(FileNotFoundException), true)]
    [InlineData(typeof(UnauthorizedAccessException), true)]
    [InlineData(typeof(ArgumentException), true)]
    [InlineData(typeof(NotSupportedException), true)]
    [InlineData(typeof(InvalidOperationException), false)]
    [InlineData(typeof(OutOfMemoryException), false)]
    public void Only_file_errors_become_messages(Type type, bool expected) =>
        Assert.Equal(expected, FileMessages.IsFileError((Exception)Activator.CreateInstance(type)!));
}
