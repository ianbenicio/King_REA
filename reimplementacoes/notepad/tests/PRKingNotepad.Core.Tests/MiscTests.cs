using System.Globalization;
using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class TimeStampTests
{
    [Fact]
    public void Format_is_short_time_space_short_date()
    {
        var ptBr = CultureInfo.GetCultureInfo("pt-BR");
        Assert.Equal("14:05 20/10/2026", TimeStamp.Format(new DateTime(2026, 10, 20, 14, 5, 59), ptBr));
    }

    [Theory]
    [InlineData(".LOG\r\nentrada", true)]
    [InlineData(".LOG", true)]
    [InlineData(".log\r\n", false)]
    [InlineData(" .LOG", false)]
    [InlineData("", false)]
    public void Log_marker_must_be_uppercase_at_start(string text, bool expected)
    {
        Assert.Equal(expected, TimeStamp.StartsWithLogMarker(text));
    }

    [Fact]
    public void Log_entry_goes_at_the_end_between_line_breaks()
    {
        Assert.Equal(".LOG\r\nx\r\nAGORA\r\n", TimeStamp.AppendLogEntry(".LOG\r\nx", "AGORA"));
    }
}

public class CaretPositionTests
{
    [Theory]
    [InlineData(0, 1, 1)]
    [InlineData(2, 1, 3)]
    [InlineData(5, 2, 1)]
    [InlineData(7, 2, 3)]
    [InlineData(99, 3, 1)]
    public void Line_and_column_are_one_based(int index, int line, int column)
    {
        const string text = "abc\r\nde\r\n"; // 9 caracteres; índice 99 é limitado ao fim
        Assert.Equal((line, column), CaretPosition.At(text, index));
    }
}

public class CommandLineTests
{
    [Theory]
    [InlineData("\"C:\\Program Files\\app.exe\" a.txt", " a.txt")]
    [InlineData("app.exe a.txt", " a.txt")]
    [InlineData("app.exe", "")]
    public void Arguments_strip_program_name(string full, string expected)
    {
        Assert.Equal(expected, CommandLine.ArgumentsOf(full));
    }

    [Theory]
    [InlineData("", null, null)]
    [InlineData("  notas.txt  ", "notas.txt", null)]
    [InlineData("meus documentos\\notas finais.txt", "meus documentos\\notas finais.txt", null)]
    [InlineData("\"C:\\a b\\c.txt\"", "C:\\a b\\c.txt", null)]
    [InlineData("'C:\\a b\\c.txt'", "C:\\a b\\c.txt", null)]
    [InlineData("/A x.txt", "x.txt", TextEncodingKind.Ansi)]
    [InlineData("/w \"x y.txt\"", "x y.txt", TextEncodingKind.Utf16Le)]
    [InlineData("/Arquivo.txt", "/Arquivo.txt", null)]
    public void Parse_reads_options_and_path(string args, string? path, TextEncodingKind? forced)
    {
        Assert.Equal(new CommandLineRequest(path, forced), CommandLine.Parse(args));
    }

    [Fact]
    public void Missing_name_without_extension_becomes_txt()
    {
        Assert.Equal(@"C:\docs\notas.txt", CommandLine.ResolvePath("notas", @"C:\docs", _ => false));
        Assert.Equal(@"C:\docs\notas", CommandLine.ResolvePath("notas", @"C:\docs", _ => true));
        Assert.Equal(@"C:\docs\notas.md", CommandLine.ResolvePath("notas.md", @"C:\docs", _ => false));
    }
}

public class TextFileStoreTests : IDisposable
{
    private readonly string _dir = Directory.CreateTempSubdirectory("prking-notepad-tests-").FullName;

    public void Dispose() => Directory.Delete(_dir, recursive: true);

    [Fact]
    public void Write_creates_and_then_replaces_without_leaving_temp_files()
    {
        string path = Path.Combine(_dir, "a.txt");
        TextFileStore.WriteAtomic(path, [1, 2, 3]);
        TextFileStore.WriteAtomic(path, [9]);
        Assert.Equal(new byte[] { 9 }, TextFileStore.ReadAll(path));
        Assert.Single(Directory.GetFiles(_dir));
    }

    [Fact]
    public void Read_refuses_files_at_or_above_the_limit()
    {
        string path = Path.Combine(_dir, "b.txt");
        File.WriteAllBytes(path, new byte[10]);
        Assert.Throws<FileTooLargeException>(() => TextFileStore.ReadAll(path, maxBytes: 10));
        Assert.Equal(10, TextFileStore.ReadAll(path, maxBytes: 11).Length);
    }
}
