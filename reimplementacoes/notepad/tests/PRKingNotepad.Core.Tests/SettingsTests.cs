using System.Text;
using PRKingNotepad.Core;

namespace PRKingNotepad.Core.Tests;

public class SettingsTests : IDisposable
{
    private readonly string _dir = Directory.CreateTempSubdirectory("prking-notepad-settings-").FullName;
    private string PathIn(string name) => Path.Combine(_dir, name);

    public void Dispose() => Directory.Delete(_dir, recursive: true);

    [Fact]
    public void Missing_file_gives_defaults()
    {
        var s = SettingsStore.Load(PathIn("nao-existe.json"));
        Assert.Equal("Consolas", s.FontFamily);
        Assert.Equal(11, s.FontSize);
        Assert.False(s.WordWrap);
        Assert.True(s.StatusBarVisible);
        Assert.Null(s.Window);
        Assert.Equal(TextEncodingKind.Utf8, s.DefaultEncoding);
        Assert.Equal(SearchDirection.Down, s.Search.Direction);
    }

    [Fact]
    public void Round_trip_keeps_every_preference()
    {
        string path = PathIn("sub/config.json"); // pasta criada na gravação
        var original = new Settings
        {
            FontFamily = "Cascadia Mono",
            FontSize = 14.5,
            FontBold = true,
            FontItalic = true,
            WordWrap = true,
            StatusBarVisible = false,
            Window = new WindowPlacement(10, 20, 800, 600, Maximized: true),
            Search = new SearchSettings { Term = "ação", Replacement = "x", MatchCase = true, WrapAround = true, Direction = SearchDirection.Up },
            DefaultEncoding = TextEncodingKind.Utf8Bom,
        };
        SettingsStore.Save(path, original);
        var loaded = SettingsStore.Load(path);

        Assert.Equal("Cascadia Mono", loaded.FontFamily);
        Assert.Equal(14.5, loaded.FontSize);
        Assert.True(loaded.FontBold && loaded.FontItalic && loaded.WordWrap);
        Assert.False(loaded.StatusBarVisible);
        Assert.Equal(original.Window, loaded.Window);
        Assert.Equal(("ação", "x", true, true, SearchDirection.Up),
            (loaded.Search.Term, loaded.Search.Replacement, loaded.Search.MatchCase, loaded.Search.WrapAround, loaded.Search.Direction));
        Assert.Equal(TextEncodingKind.Utf8Bom, loaded.DefaultEncoding);
    }

    [Fact]
    public void Enums_are_stored_by_name()
    {
        string path = PathIn("c.json");
        SettingsStore.Save(path, new Settings { DefaultEncoding = TextEncodingKind.Utf16Be });
        Assert.Contains("\"Utf16Be\"", File.ReadAllText(path));
    }

    [Theory]
    [InlineData("{ isto não é json")]
    [InlineData("")]
    [InlineData("[1, 2]")]
    public void Corrupt_file_gives_defaults(string content)
    {
        string path = PathIn("ruim.json");
        File.WriteAllText(path, content, Encoding.UTF8);
        Assert.Equal(11, SettingsStore.Load(path).FontSize);
    }

    [Fact]
    public void Partial_file_keeps_defaults_for_missing_fields()
    {
        string path = PathIn("parcial.json");
        File.WriteAllText(path, """{ "WordWrap": true }""");
        var s = SettingsStore.Load(path);
        Assert.True(s.WordWrap);
        Assert.Equal("Consolas", s.FontFamily);
        Assert.True(s.StatusBarVisible);
    }

    [Fact]
    public void Out_of_range_values_are_corrected()
    {
        string path = PathIn("fora.json");
        File.WriteAllText(path, """
            { "FontFamily": " ", "FontSize": 9999, "Search": null,
              "Window": { "Left": 0, "Top": 0, "Width": 50, "Height": 50, "Maximized": false } }
            """);
        var s = SettingsStore.Load(path);
        Assert.Equal("Consolas", s.FontFamily);
        Assert.Equal(11, s.FontSize);
        Assert.NotNull(s.Search);
        Assert.Null(s.Window);
    }

    [Fact]
    public void Zoom_is_not_saved()
    {
        string path = PathIn("config.json");
        SettingsStore.Save(path, new Settings());
        Assert.DoesNotContain("zoom", File.ReadAllText(path), StringComparison.OrdinalIgnoreCase);
    }
}

public class ZoomTests
{
    [Theory]
    [InlineData(100, 110)]
    [InlineData(490, 500)]
    [InlineData(500, 500)]
    public void Zoom_in_steps_by_ten_up_to_500(int from, int to) => Assert.Equal(to, Zoom.In(from));

    [Theory]
    [InlineData(100, 90)]
    [InlineData(20, 10)]
    [InlineData(10, 10)]
    public void Zoom_out_steps_by_ten_down_to_10(int from, int to) => Assert.Equal(to, Zoom.Out(from));
}
