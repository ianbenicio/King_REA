# Instala os pré-requisitos da análise nativa: JDK 21 + Ghidra 12.1.4.
# Detalhes e motivos: docs/runbook-prereqs-nativo.md
# Uso (PowerShell): powershell -ExecutionPolicy Bypass -File scripts\instalar-prereqs-nativo.ps1
# Idempotente: pula o que já estiver instalado. Para no primeiro erro.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # acelera o download

$GhidraUrl    = "https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_12.1.4_build/ghidra_12.1.4_PUBLIC_20260921.zip"
$GhidraSha256 = "DDAC49F903DA9D5BAC833E5CC79395098B9C33CFD3279BE5F31BD00387D2D4DB"
$ToolsDir     = "C:\tools"
$GhidraDir    = Join-Path $ToolsDir "ghidra_12.1.4_PUBLIC"

function Passo($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }
function Find-Jdk { Get-ChildItem "C:\Program Files\Microsoft" -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1 }

# 1. JDK 21
Passo "JDK 21"
$jdk = Find-Jdk
if ($jdk) {
    Write-Host "Já instalado: $($jdk.FullName)"
} else {
    Write-Host "Instalando Microsoft OpenJDK 21 via winget (o Windows pode pedir permissão de administrador)..."
    winget install --id Microsoft.OpenJDK.21 -e --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) { throw "winget falhou (código $LASTEXITCODE)." }
    $jdk = Find-Jdk
    if (-not $jdk) { throw "JDK instalado, mas não encontrado em C:\Program Files\Microsoft\jdk-21*." }
    Write-Host "Instalado: $($jdk.FullName)"
}

# 2. Ghidra 12.1.4 (download conferido por SHA-256)
Passo "Ghidra 12.1.4"
if (Test-Path (Join-Path $GhidraDir "support\analyzeHeadless.bat")) {
    Write-Host "Já instalado: $GhidraDir"
} else {
    $zip = Join-Path $env:TEMP "ghidra_12.1.4_PUBLIC_20260921.zip"
    Write-Host "Baixando (~500 MB) de $GhidraUrl ..."
    Invoke-WebRequest -Uri $GhidraUrl -OutFile $zip
    $hash = (Get-FileHash -Algorithm SHA256 $zip).Hash
    if ($hash -ne $GhidraSha256) {
        Remove-Item $zip -Force
        throw "SHA-256 NÃO confere. Esperado $GhidraSha256, obtido $hash. Arquivo apagado; nada foi instalado."
    }
    Write-Host "SHA-256 confere."
    New-Item -ItemType Directory -Force $ToolsDir | Out-Null
    Write-Host "Extraindo para $ToolsDir ..."
    Expand-Archive -Path $zip -DestinationPath $ToolsDir
    Remove-Item $zip -Force
    if (-not (Test-Path (Join-Path $GhidraDir "support\analyzeHeadless.bat"))) { throw "Extração não gerou $GhidraDir como esperado." }
    Write-Host "Instalado: $GhidraDir"
}

# 3. Variáveis de ambiente (do usuário, persistentes)
Passo "Variáveis de ambiente"
[Environment]::SetEnvironmentVariable("GHIDRA_INSTALL_DIR", $GhidraDir, "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdk.FullName, "User")
Write-Host "GHIDRA_INSTALL_DIR = $GhidraDir"
Write-Host "JAVA_HOME          = $($jdk.FullName)"

# 4. Verificação
Passo "Verificação"
& (Join-Path $jdk.FullName "bin\java.exe") -version
Write-Host "Ghidra headless: $(Join-Path $GhidraDir 'support\analyzeHeadless.bat')"

Write-Host "`nPronto. FECHE e reabra o app do Claude para ele enxergar as variáveis novas." -ForegroundColor Green
Write-Host "Depois, na sessão do projeto, peça: 'confira o Ghidra com o rea doctor'."
