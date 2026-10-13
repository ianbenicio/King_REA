# Auditoria de segurança — rea-agents 6.4.0

**Data:** 13/10/2026 · **Método:** análise estática, sem execução · **Veredito:** nenhum indício de malware; uso aprovado com restrições (ver `CLAUDE.md`).

## Escopo e método

Tarball baixado com `npm pack --ignore-scripts` e extraído em diretório isolado. Nada foi executado durante a auditoria. Árvore de dependências resolvida só por lockfile (`--package-lock-only`).

**Não coberto:** comparação linha a linha entre `dist/` e o código-fonte do repositório (a provenance cobre a ligação), desmontagem do binário nativo (só strings e imports), análise dinâmica.

## Origem e integridade

| Item | Resultado |
|------|-----------|
| Repositório | `github.com/morluto/rea`, um mantenedor, pacote criado em 12/07/2026 |
| Provenance | SLSA v1, workflow `.github/workflows/release.yml`, `refs/heads/main`, commit `a56f7bb668ab23fec8d33f7af353ac7ed2fe1895` |
| SHA-512 do tarball | `563d7359…b4d611`, igual ao da attestation |
| Integridade npm | `sha512-Vj1zWfSlna5bphGoaoI/TcVBuYvze9u+OyPC3Shz8YkBqaCTqB4COnnRoX7XDwMpwI24ZlFEel2yEj0k8LTWEQ==` |
| Binário nativo Windows | SHA-256 `c4fd9f37…24b6d5`, igual ao `manifest.json` |

## Instalação

- Lifecycle scripts: apenas `prepare`, que só ativa o husky se existir `src/` (ausente no tarball).
- 149 pacotes transitivos, nenhum com install script. `npm audit`: 0 vulnerabilidades.

## Código (`dist/`, 1.112 arquivos)

- Sem minificação, ofuscação, blobs codificados, `eval` ou `new Function`.
- Sem telemetria.
- Rede: download do Hopper (`hopperapp.com`, com `codesign --verify` no macOS e SHA-256 no Linux), busca de source maps do alvo indicado, CDP com o navegador do Playwright.
- Sem leitura de `.ssh`, `.aws`, cookies de navegador, keychain ou tokens.

## Binário nativo (`rea-windows-x64.node`)

- DLLs: ADVAPI32, bcrypt, KERNEL32, msvcrt, ntdll. Nenhuma de rede.
- Sem APIs de injeção (`WriteProcessMemory`, `CreateRemoteThread`, `VirtualAllocEx`).
- Função: criar processo em Job Object com token restrito, ou seja, isolar o alvo.

## O que o `rea setup` faria (não usado aqui)

Para o Claude Code: entrada em `mcpServers` de `~/.claude.json` (`npx -y rea-agents@6.4.0 mcp`) e skill em `~/.claude/skills/`. Sem hooks, sem `permissions.allow`, sem auto-aprovação. A skill não contém instruções de bypass ou envio de dados.

## Riscos residuais

1. **Superfície alta:** 170 tools (processos, navegador, PTY, hook em Electron, mitmproxy, adb). Um alvo hostil pode tentar injetar prompt para dirigir essas tools.
2. **Cadeia de suprimento:** mantenedor único, releases quase diárias. Mitigado com versão fixada e lockfile.
3. **Windows:** Hopper só existe para macOS/Linux; Ghidra no Windows é experimental. Análise estática de JavaScript funciona.

## Instalação neste projeto

`npm install rea-agents@6.4.0 --save-exact --ignore-scripts`. Integridade instalada igual à auditada. `npx rea mcp doctor`: `healthy: true`, 170/170 tools, 6/6 prompts, catálogo `85d80276…c7d72a`.
