---
titulo: Runbook — pré-requisitos da análise nativa (Ghidra + GhidraMCP)
data: 2026-10-13
objetivo: habilitar a camada nativa da pilha de games (binários EXE/DLL, Unity IL2CPP, Unreal shipping exe)
---

# Runbook — análise nativa (Ghidra + GhidraMCP)

Instala os pré-requisitos para analisar código nativo: **JDK 21**, **Ghidra 12.1.4** e o **GhidraMCP 2.0** (liga o Claude ao Ghidra). Serve tanto para o provider nativo do REA quanto para o GhidraMCP. Versões fixadas e conferidas em 13/10/2026.

> Estado da máquina em 13/10/2026: JDK, Ghidra e adb ausentes; winget e choco disponíveis; 26 GB livres em C:. O WSL não inicia.

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
