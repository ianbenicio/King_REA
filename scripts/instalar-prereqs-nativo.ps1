# Instala os pré-requisitos da análise nativa: JDK 21 + Ghidra 12.1.4, ambos em C:\tools.
# Detalhes e motivos: docs/runbook-prereqs-nativo.md
# Uso (PowerShell): powershell -ExecutionPolicy Bypass -File scripts\instalar-prereqs-nativo.ps1
# Não precisa de administrador. Idempotente: pula o que já estiver instalado.
# Downloads conferidos por SHA-256 fixo; se não bater, apaga e para.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # acelera o download

$ToolsDir = "C:\tools"

# JDK 21: ZIP oficial da Microsoft (sem MSI/winget, sem admin). Hash de
# https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip.sha256sum.txt (13/10/2026)
$JdkUrl    = "https://download.visualstudio.microsoft.com/download/pr/f1e5f23f-9d50-4b9f-8ed3-80522ae82bb5/71e8e5f0f13419cc726e470d25e0a0d0/microsoft-jdk-21.0.12.1-windows-x64.zip"
$JdkSha256 = "192441A9D27DA813BADA974BB88B4CF64D37A9589ED37F204374D411CA5CE07F"

# Ghidra 12.1.4: release oficial da NSA.
$GhidraUrl    = "https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_12.1.4_build/ghidra_12.1.4_PUBLIC_20260921.zip"
$GhidraSha256 = "DDAC49F903DA9D5BAC833E5CC79395098B9C33CFD3279BE5F31BD00387D2D4DB"
$GhidraDir    = Join-Path $ToolsDir "ghidra_12.1.4_PUBLIC"

function Passo($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

function Find-Jdk {
    $candidatos = @()
    $candidatos += Get-ChildItem $ToolsDir -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue
    $candidatos += Get-ChildItem "C:\Program Files\Microsoft" -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue
    $candidatos | Where-Object { Test-Path (Join-Path $_.FullName "bin\java.exe") } | Sort-Object Name -Descending | Select-Object -First 1
}

function Baixar-Conferido($url, $sha256, $destino) {
    Write-Host "Baixando $url ..."
    Invoke-WebRequest -Uri $url -OutFile $destino
    $hash = (Get-FileHash -Algorithm SHA256 $destino).Hash
    if ($hash -ne $sha256) {
        Remove-Item $destino -Force
        throw "SHA-256 NÃO confere. Esperado $sha256, obtido $hash. Arquivo apagado; nada foi instalado."
    }
    Write-Host "SHA-256 confere."
}

New-Item -ItemType Directory -Force $ToolsDir | Out-Null

# 1. JDK 21
Passo "JDK 21"
$jdk = Find-Jdk
if ($jdk) {
    Write-Host "Já instalado: $($jdk.FullName)"
} else {
    $zip = Join-Path $env:TEMP "microsoft-jdk-21.0.12.1-windows-x64.zip"
    Baixar-Conferido $JdkUrl $JdkSha256 $zip
    Write-Host "Extraindo para $ToolsDir ..."
    Expand-Archive -Path $zip -DestinationPath $ToolsDir -Force
    Remove-Item $zip -Force
    $jdk = Find-Jdk
    if (-not $jdk) { throw "Extração não gerou um JDK com bin\java.exe em $ToolsDir." }
    Write-Host "Instalado: $($jdk.FullName)"
}

# 2. Ghidra 12.1.4
Passo "Ghidra 12.1.4"
if (Test-Path (Join-Path $GhidraDir "support\analyzeHeadless.bat")) {
    Write-Host "Já instalado: $GhidraDir"
} else {
    $zip = Join-Path $env:TEMP "ghidra_12.1.4_PUBLIC_20260921.zip"
    Baixar-Conferido $GhidraUrl $GhidraSha256 $zip
    Write-Host "Extraindo para $ToolsDir ..."
    Expand-Archive -Path $zip -DestinationPath $ToolsDir -Force
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
Write-Host "Depois, na sessão do projeto, peça: 'confira o Ghidra'."
