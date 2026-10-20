# Instala o .NET SDK 10 (LTS) em C:\tools\dotnet, para as reimplementações em C# (reimplementacoes/).
# Uso (PowerShell): powershell -ExecutionPolicy Bypass -File scripts\instalar-dotnet.ps1
# Não precisa de administrador. Idempotente: pula se a versão já estiver instalada.
# Download conferido por SHA-512 fixo; se não bater, apaga e para.

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # acelera o download

# SDK 10.0.401 (runtime 10.0.12, 08/09/2026). URL e hash do índice oficial:
# https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json (consultado em 20/10/2026)
# 10.0.402 (13/10/2026) foi evitado por ter menos de duas semanas; adotar após 27/10/2026 (traz correções de segurança).
$SdkVersion = "10.0.401"
$SdkUrl     = "https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.401/dotnet-sdk-10.0.401-win-x64.zip"
$SdkSha512  = "24B670AD3D923BFCF47DF6C3B034152398B42F6DBC388E10D783AEE1CFB5E5817D399FC0AE2A12CFA822A55E61D34830CCB15C50EF6EFEE437AB874BB7C79430"

# Em C:\tools e não em %LOCALAPPDATA%: o app do Claude (MSIX) redireciona gravações de processos filhos em AppData.
$DotnetDir = "C:\tools\dotnet"

function Passo($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

Passo ".NET SDK $SdkVersion"
if (Test-Path (Join-Path $DotnetDir "sdk\$SdkVersion")) {
    Write-Host "Já instalado: $DotnetDir\sdk\$SdkVersion"
} else {
    $zip = Join-Path $env:TEMP "dotnet-sdk-$SdkVersion-win-x64.zip"
    Write-Host "Baixando $SdkUrl ..."
    Invoke-WebRequest -Uri $SdkUrl -OutFile $zip
    $hash = (Get-FileHash -Algorithm SHA512 $zip).Hash
    if ($hash -ne $SdkSha512) {
        Remove-Item $zip -Force
        throw "SHA-512 NÃO confere. Esperado $SdkSha512, obtido $hash. Arquivo apagado; nada foi instalado."
    }
    Write-Host "SHA-512 confere."
    New-Item -ItemType Directory -Force $DotnetDir | Out-Null
    Write-Host "Extraindo para $DotnetDir ..."
    Expand-Archive -Path $zip -DestinationPath $DotnetDir -Force
    Remove-Item $zip -Force
    $exe = Join-Path $DotnetDir "dotnet.exe"
    if (-not (Test-Path $exe)) { throw "Extração não gerou $exe." }
    $sigExe = Get-AuthenticodeSignature $exe
    if ($sigExe.Status -ne "Valid" -or $sigExe.SignerCertificate.Subject -notmatch "Microsoft Corporation") {
        throw "Assinatura de dotnet.exe inválida ou não é da Microsoft: $($sigExe.Status) $($sigExe.SignerCertificate.Subject)"
    }
    Write-Host "dotnet.exe assinado pela Microsoft (Authenticode válido)."
}

# Variáveis de ambiente do usuário (persistentes)
Passo "Variáveis de ambiente"
[Environment]::SetEnvironmentVariable("DOTNET_ROOT", $DotnetDir, "User")
[Environment]::SetEnvironmentVariable("DOTNET_CLI_TELEMETRY_OPTOUT", "1", "User")
[Environment]::SetEnvironmentVariable("DOTNET_NOLOGO", "1", "User")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ";") -notcontains $DotnetDir) {
    [Environment]::SetEnvironmentVariable("Path", (@($DotnetDir) + ($userPath -split ";" | Where-Object { $_ })) -join ";", "User")
    Write-Host "PATH do usuário: $DotnetDir adicionado no início."
}
Write-Host "DOTNET_ROOT = $DotnetDir (telemetria desligada)"

Passo "Verificação"
$env:DOTNET_CLI_TELEMETRY_OPTOUT = "1"; $env:DOTNET_NOLOGO = "1"
& (Join-Path $DotnetDir "dotnet.exe") --list-sdks

Write-Host "`nPronto. Terminais novos já enxergam o dotnet; o app do Claude, só depois de reaberto." -ForegroundColor Green
