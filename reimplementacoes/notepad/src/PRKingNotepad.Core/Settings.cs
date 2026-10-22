using System.Text.Json;
using System.Text.Json.Serialization;

namespace PRKingNotepad.Core;

/// <summary>
/// Preferências lembradas entre execuções (especificação, seção 9). Ficam num arquivo JSON
/// próprio, nunca no registro do Windows. Campos ausentes ou inválidos voltam ao padrão.
/// </summary>
public sealed class Settings
{
    public const double MinFontSize = 1;
    public const double MaxFontSize = 500;

    public string FontFamily { get; set; } = "Consolas";
    /// <summary>Tamanho em pontos tipográficos.</summary>
    public double FontSize { get; set; } = 11;
    public bool FontBold { get; set; }
    public bool FontItalic { get; set; }
    public bool WordWrap { get; set; }
    public bool StatusBarVisible { get; set; } = true;
    public WindowPlacement? Window { get; set; }
    public SearchSettings Search { get; set; } = new();
    public TextEncodingKind DefaultEncoding { get; set; } = TextEncodingKind.Utf8;
    public PageSettings Page { get; set; } = new();

    /// <summary>Corrige valores fora do intervalo vindos de um arquivo editado à mão.</summary>
    public Settings Normalize()
    {
        Page ??= new PageSettings();
        Page.Normalize();
        if (string.IsNullOrWhiteSpace(FontFamily))
        {
            FontFamily = "Consolas";
        }
        if (!double.IsFinite(FontSize) || FontSize < MinFontSize || FontSize > MaxFontSize)
        {
            FontSize = 11;
        }
        if (!Enum.IsDefined(DefaultEncoding))
        {
            DefaultEncoding = TextEncodingKind.Utf8;
        }
        Search ??= new SearchSettings();
        Search.Term ??= "";
        Search.Replacement ??= "";
        if (!Enum.IsDefined(Search.Direction))
        {
            Search.Direction = SearchDirection.Down;
        }
        if (Window is { } w && !w.IsUsable())
        {
            Window = null;
        }
        return this;
    }
}

public sealed class SearchSettings
{
    public string Term { get; set; } = "";
    public string Replacement { get; set; } = "";
    public bool MatchCase { get; set; }
    public bool WrapAround { get; set; }
    public SearchDirection Direction { get; set; } = SearchDirection.Down;
}

/// <summary>
/// Configuração de página lembrada entre execuções (especificação, 9 e 10): cabeçalho, rodapé
/// e margens em milímetros. Papel, origem e orientação valem só para a sessão.
/// </summary>
public sealed class PageSettings
{
    public const string DefaultHeader = "&f";
    public const string DefaultFooter = "Página &p";
    public const double MaxMarginMm = 100;

    public string Header { get; set; } = DefaultHeader;
    public string Footer { get; set; } = DefaultFooter;
    public double MarginTopMm { get; set; } = 25;
    public double MarginBottomMm { get; set; } = 25;
    public double MarginLeftMm { get; set; } = 20;
    public double MarginRightMm { get; set; } = 20;

    public void Normalize()
    {
        Header ??= DefaultHeader;
        Footer ??= DefaultFooter;
        MarginTopMm = ValidMargin(MarginTopMm, 25);
        MarginBottomMm = ValidMargin(MarginBottomMm, 25);
        MarginLeftMm = ValidMargin(MarginLeftMm, 20);
        MarginRightMm = ValidMargin(MarginRightMm, 20);
    }

    private static double ValidMargin(double value, double fallback) =>
        double.IsFinite(value) && value >= 0 && value <= MaxMarginMm ? value : fallback;
}

/// <summary>Posição e tamanho da janela em unidades independentes de DPI.</summary>
public sealed record WindowPlacement(double Left, double Top, double Width, double Height, bool Maximized)
{
    public const double MinSize = 200;

    public bool IsUsable() =>
        double.IsFinite(Left) && double.IsFinite(Top)
        && double.IsFinite(Width) && double.IsFinite(Height)
        && Width >= MinSize && Height >= MinSize;
}

public static class SettingsStore
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() },
    };

    public static string DefaultPath =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "PRKing_Notepad", "config.json");

    /// <summary>Lê as preferências; arquivo ausente, ilegível ou corrompido dá o padrão.</summary>
    public static Settings Load(string path)
    {
        try
        {
            using var stream = File.OpenRead(path);
            return (JsonSerializer.Deserialize<Settings>(stream, Options) ?? new Settings()).Normalize();
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or JsonException or NotSupportedException)
        {
            return new Settings();
        }
    }

    public static void Save(string path, Settings settings)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path))!);
        TextFileStore.WriteAtomic(path, JsonSerializer.SerializeToUtf8Bytes(settings, Options));
    }
}

/// <summary>Zoom do editor (especificação, 5.3): 10 % a 500 %, passos de 10, padrão 100.</summary>
public static class Zoom
{
    public const int Min = 10;
    public const int Max = 500;
    public const int Step = 10;
    public const int Default = 100;

    public static int In(int percent) => Math.Min(Max, percent + Step);

    public static int Out(int percent) => Math.Max(Min, percent - Step);
}
