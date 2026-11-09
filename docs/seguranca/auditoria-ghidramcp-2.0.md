# Auditoria de segurança — GhidraMCP 2.0

**Data:** 13/10/2026 · **Método:** leitura estática da tag `2.0` (commit `1e98025`) · **Veredito:** Apache-2.0, servidor HTTP **só em 127.0.0.1** (allowlist de loopback), sem `exec`, sem rede de saída no plugin. As tools passam pelo gate (`.claude/hooks/rea-gate.mjs`, mapa `.claude/hooks/ghidra-niveis.json`).

Registro movido de `docs/runbook-prereqs-nativo.md` (seção 3) para cá em 05/11/2026 (story MEL-05, fatia 2; adendo 1 do ADR-0001, §5.4, DA-6 e DA-16), sem reescrever o juízo da auditoria. O runbook guarda só os passos de instalação e aponta para este arquivo.

## Escopo e método

- **Alvo:** GhidraMCP 2.0 (`github.com/LaurieWired/GhidraMCP`), tag `2.0`, commit `1e98025`: plugin Java do Ghidra e servidor MCP em Python.
- **Clone de auditoria:** `ferramentas/ghidramcp/` (fora do git).
- **Método:** leitura estática do código do clone.

## Origem e integridade

| Item | Resultado |
|------|-----------|
| Repositório | `github.com/LaurieWired/GhidraMCP`, tag `2.0`, commit `1e98025` |
| Licença | Apache-2.0 |
| Release verificada (14/10/2026) | `GhidraMCP-release-2-0.zip` com o digest do GitHub (`ebf904…2e72`) |
| Fonte Java da extensão (12 arquivos) e wheel Python (6 arquivos) | **idênticos** ao commit `1e98025` auditado |
| Arquivos guardados | `C:\tools\GhidraMCP\` (extensão `4a5901…4ad8`, wheel `af9818…7e8e`) |

## Código

- Servidor HTTP do plugin só em 127.0.0.1 (allowlist de loopback); porta padrão `127.0.0.1:8080`.
- Sem `exec`.
- Sem rede de saída no plugin.

## Registro fixado

Servidor MCP registrado pelo @devops no `.mcp.json` do projeto (`b92a651`), **fixado no commit completo** `1e980252087b2479a21b9ca6d82d5829538651a7` (o commit `1e98025` auditado, da tag 2.0), com as dependências Python fixadas em `mcp==1.30.0` e `requests==2.34.2`. É o registro que está no `.mcp.json` hoje:

```json
{
  "mcpServers": {
    "ghidra": {
      "command": "uvx",
      "args": [
        "--from", "git+https://github.com/LaurieWired/GhidraMCP@1e980252087b2479a21b9ca6d82d5829538651a7",
        "--with", "mcp==1.30.0",
        "--with", "requests==2.34.2",
        "ghidra-mcp",
        "--ghidra-server", "http://127.0.0.1:8080/"
      ]
    }
  }
}
```

Na documentação do produto, este é o **único** arquivo com a referência ao GhidraMCP com arroba e commit. O verificador (`node scripts/verificar/verificar.mjs --so integracoes`, ponto 8) confere que cada referência dessa forma aqui é prefixo do commit dos `args` do `.mcp.json` e reprova qualquer uma no runbook.

## Instalação neste projeto (14/10/2026)

- Plugin instalado na pasta da instalação do Ghidra (`C:\tools\ghidra_12.1.4_PUBLIC\Ghidra\Extensions\GhidraMCP`); passos e a armadilha do pacote MSIX em `docs/runbook-prereqs-nativo.md`, seção 3.
- Teste de `tools/list`: 30 tools, todas no mapa N1 (`.claude/hooks/ghidra-niveis.json`).
