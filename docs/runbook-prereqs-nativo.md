---
titulo: Runbook — pré-requisitos da análise nativa (Ghidra + GhidraMCP)
data: 2026-10-13
objetivo: habilitar a camada nativa da pilha de games (binários EXE/DLL, Unity IL2CPP, Unreal shipping exe)
---

# Runbook — análise nativa (Ghidra + GhidraMCP)

Instala os pré-requisitos para analisar código nativo: **JDK 21**, **Ghidra 12.1.4** e o **GhidraMCP 2.0** (liga o Claude ao Ghidra). Serve tanto para o provider nativo do REA quanto para o GhidraMCP. Versões fixadas e conferidas em 13/10/2026.

> Estado da máquina em 13/10/2026: JDK, Ghidra e adb ausentes; winget e choco disponíveis; 26 GB livres em C:. O WSL não inicia.

## Atalho: um comando faz os passos 1 e 2

```powershell
powershell -ExecutionPolicy Bypass -File "H:\King\Clientes e Projetos\PRKing_REA\scripts\instalar-prereqs-nativo.ps1"
```

O script baixa o JDK 21 (ZIP oficial da Microsoft, sem winget nem administrador) e o Ghidra 12.1.4, **confere o SHA-256 fixo de cada um** (apaga e para se não bater), extrai em `C:\tools` e grava `GHIDRA_INSTALL_DIR` e `JAVA_HOME` no usuário. Se já houver JDK 21 em `C:\tools` ou em `C:\Program Files\Microsoft`, usa esse. Pula o que já estiver instalado. Depois, feche e reabra o app do Claude. Os passos manuais abaixo ficam como referência.

> **Instalado nesta máquina em 13/10/2026:** JDK 21.0.12.1 (`C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`, via winget) e Ghidra 12.1.4 (`C:\tools\ghidra_12.1.4_PUBLIC`). `npx rea doctor --provider ghidra`: 10/10 verificações. Lição: não rodar duas instâncias do script ao mesmo tempo (a segunda colide com a primeira: "arquivo em uso").

## 1. JDK 21 (64-bit)

```bash
winget install --id Microsoft.OpenJDK.21 --accept-source-agreements --accept-package-agreements
```

Fixa em 21.0.12 (Microsoft Build of OpenJDK). Conferir depois:

```bash
java -version
```

## 2. Ghidra 12.1.4

Não tem instalador: é um zip que se extrai.

- **URL oficial (NSA):** `https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_12.1.4_build/ghidra_12.1.4_PUBLIC_20260921.zip`
- **SHA-256 esperado:** `ddac49f903da9d5bac833e5cc79395098b9c33cfd3279be5f31bd00387d2d4db`

No PowerShell, baixar, **conferir o hash** e extrair para `C:\tools`:

```powershell
$u = "https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_12.1.4_build/ghidra_12.1.4_PUBLIC_20260921.zip"
$zip = "$env:USERPROFILE\Downloads\ghidra_12.1.4.zip"
Invoke-WebRequest -Uri $u -OutFile $zip
(Get-FileHash -Algorithm SHA256 $zip).Hash  # deve bater com ddac49f9...d2d4db
# só extrair se o hash bater:
New-Item -ItemType Directory -Force "C:\tools" | Out-Null
Expand-Archive -Path $zip -DestinationPath "C:\tools"
```

Resulta em `C:\tools\ghidra_12.1.4_PUBLIC`.

**Variáveis de ambiente** (persistentes, no usuário):

```powershell
setx GHIDRA_INSTALL_DIR "C:\tools\ghidra_12.1.4_PUBLIC"
setx JAVA_HOME "C:\Program Files\Microsoft\jdk-21.0.12.7-hotspot"
```

> Ajustar `JAVA_HOME` para o caminho real do JDK (confira em `C:\Program Files\Microsoft\`). Abrir um terminal novo depois do `setx`.

## 3. GhidraMCP 2.0 (plugin + servidor MCP)

Auditado em 13/10/2026 (tag `2.0`, commit `1e98025`): Apache-2.0, servidor HTTP **só em 127.0.0.1** (allowlist de loopback), sem `exec`, sem rede de saída no plugin. Clone de auditoria em `ferramentas/ghidramcp/` (fora do git).

- **Plugin:** baixar `GhidraMCP-release-2-0.zip` de `https://github.com/LaurieWired/GhidraMCP/releases/tag/2.0`.
- Dentro do zip vem a extensão `ghidra_12.1.4_PUBLIC_<data>_GhidraMCP.zip`.
- No Ghidra: `File → Install Extensions → +`, escolher essa extensão, reiniciar o Ghidra, e habilitar o `GhidraMCPPlugin` em `File → Configure → Developer`.
- A porta do servidor fica em `Edit → Tool Options → GhidraMCP HTTP Server` (padrão `127.0.0.1:8080`).

**Servidor MCP** (precisa do `uv`/`uvx`; se faltar: `winget install --id astral-sh.uv`). Registro **fixado na tag 2.0**, a cargo do @devops, no `.mcp.json` do projeto:

```json
{
  "mcpServers": {
    "ghidra": {
      "command": "uvx",
      "args": [
        "--from", "git+https://github.com/LaurieWired/GhidraMCP@2.0",
        "ghidra-mcp",
        "--ghidra-server", "http://127.0.0.1:8080/"
      ]
    }
  }
}
```

### Instalação feita em 14/10/2026 (e uma armadilha do Windows)

- **Release 2.0 verificada:** `GhidraMCP-release-2-0.zip` com o digest do GitHub (`ebf904…2e72`); o fonte Java dentro da extensão (12 arquivos) e o wheel Python (6 arquivos) são **idênticos** ao commit `1e98025` auditado. Arquivos guardados em `C:\tools\GhidraMCP\` (extensão `4a5901…4ad8`, wheel `af9818…7e8e`).
- **Plugin instalado na pasta da instalação:** `C:\tools\ghidra_12.1.4_PUBLIC\Ghidra\Extensions\GhidraMCP` (método oficial do `GettingStarted.md` do Ghidra: extrair ali; vale na próxima abertura, para qualquer usuário). Desinstalar = apagar essa pasta.
- **Armadilha (app do Claude é pacote MSIX):** tudo que o app, ou um programa aberto por ele, grava em `%APPDATA%` vai para `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\`. Um Ghidra aberto pelo Claude e um aberto pelo Explorer **enxergam pastas de usuário diferentes**. Por isso: extensões vão na pasta da instalação (não em `AppData`), e o Ghidra de trabalho deve ser aberto **por você**, pelo Explorer (`C:\tools\ghidra_12.1.4_PUBLIC\ghidraRun.bat`).
- **Servidor MCP:** registrado pelo @devops no `.mcp.json` (`b92a651`), fixado no commit `1e98025` com `mcp==1.30.0` e `requests==2.34.2`; teste de `tools/list`: 30 tools, todas no mapa N1.

## 4. Segurança ao registrar o GhidraMCP

> **Atualização 13/10/2026:** feito. O gate agora cobre `mcp__(rea|ghidra)__.*` com um mapa por servidor; `.claude/hooks/ghidra-niveis.json` mapeia as 30 tools do GhidraMCP 2.0, todas N1. Falta só o @devops registrar o servidor `ghidra` no `.mcp.json`, depois que JDK e Ghidra estiverem instalados. O texto abaixo fica como histórico.

### Situação original

O gate `.claude/hooks/rea-gate.mjs` só cobre as tools `mcp__rea__*`. As tools do GhidraMCP serão `mcp__ghidra__*` e **não passam pelo gate hoje**. Antes de registrar o servidor, o @devops deve:

- estender o matcher do hook (ou criar um companheiro) para `mcp__ghidra__.*`; e
- mapear as tools do GhidraMCP em níveis (são N1: leem o binário já aberto no Ghidra; renomear/comentar é edição do banco de análise, não do executável).

Sem isso, o GhidraMCP ficaria fora da trava. Decisão e implementação com o responsável.

## 5. Verificação

```bash
java -version
echo "$GHIDRA_INSTALL_DIR"
npx rea doctor --provider ghidra --json
```

Esperado no `rea doctor`: os checks de release do Ghidra, launcher headless, JDK e host x64 passando.

## Resumo das versões fixadas

| Item | Versão | Verificação |
|---|---|---|
| JDK | Microsoft OpenJDK 21.0.12 | winget |
| Ghidra | 12.1.4 (`ghidra_12.1.4_PUBLIC_20260921.zip`) | SHA-256 `ddac49f9…d2d4db` |
| GhidraMCP | 2.0 (commit `1e98025`) | leitura estática: loopback-only, Apache-2.0 |
