# Linha de base da etapa 2 — verificações disponíveis em 2026-11-01

**Anexo** do [plano de evolução](2026-11-01-evolucao-arquitetura-qualidade.md) (§12, item "Executar verificações disponíveis, registrar requisitos ausentes e consolidar o baseline") · **Commits medidos:** 1ª execução na árvore que virou `5e71dbd` (antes do resumo das contagens .NET); 2ª em `d90adb5` · **Executor:** sessão `b0f09ab6`, Claude Code, usuário interativo `ianfl`

## 1. Ambiente

| Item | Valor |
|---|---|
| Sistema | Windows 10 Pro 10.0.19045, x64, sessão interativa |
| Node / npm | 26.12.1 / 11.20.0 |
| .NET | SDK 10.0.401 (`C:\tools\dotnet`, único instalado); runtimes NETCore, AspNetCore e WindowsDesktop 10.0.12. Resolvido pelo `reimplementacoes/notepad/global.json` |
| Docker | cliente 29.4.3; **daemon desligado** (`npipe:////./pipe/dockerDesktopLinuxEngine` inexistente) |
| Ferramentas de análise | JDK 21.0.12.1, Ghidra 12.1.4, uv 0.11.17, Python 3.15.1 (inventário; fora da verificação) |
| PRKing Notepad do responsável | não estava aberto (`tasklist`); nenhum processo fechado |

## 2. Resultado por componente

Comando: `npm run verificar -- --json`. Duas execuções seguidas, sem mudança de código entre elas (a segunda já com o resumo das contagens .NET).

| Componente | Estado (1ª e 2ª) | Resultado | Duração 1ª / 2ª (s) |
|---|---|---|---|
| `ambiente-node` | aprovado | v26.12.1 | 0 / 0 |
| `dependencias-npm` | aprovado | 1 dependência (`rea-agents` 6.4.0) coerente | 0 / 0 |
| `sintaxe-js` | aprovado | 47 arquivos | 2,6 / 2,7 |
| `js` (`npm test`) | aprovado | 183/183 na 1ª; 184/184 na 2ª (teste novo do resumo .NET) | 5,9 / 6,0 |
| `monetizacao` | aprovado | perfis conferidos | 0,1 / 0,1 |
| `dotnet-restore --locked-mode` | aprovado | — | 5,7 / 1,0 |
| `notepad-build --no-incremental` | aprovado | 0 avisos (avisos são erros) | 6,8 / 3,7 |
| `notepad-core` | aprovado | 137/137 | 2,8 / 2,5 |
| `notepad-ui` | aprovado | 76/76 | 17,3 / 16,8 |
| `semgrep-scan` | não executado | requisito ausente: daemon do Docker inacessível | 3,3 / 0,4 |
| `semgrep-test` | não executado | idem | 0 / 0 |
| `semgrep-mutacoes` | não executado | idem | 0 / 0 |
| **Total** | **incompleto (saída 3)** | 9 aprovados, 0 falhas, 3 não executados | **45 / 33** (relógio) |

Composição do `npm test` (184): controles 60 (gates `rea` e CLI, organizador de assets, monetização, verificador) e puzzle-piloto 124 (8 arquivos, 5,2 s isolados). Os testes do puzzle-piloto já estavam no `npm test`; não há suíte separada.

`npm run test:notepad` (agora na pasta do `global.json`, saída em `bin/` do repositório): Core 137/137, UI 76/76, 20 s.

## 3. Comparação com o ponto de partida do plano (§2)

| Aspecto | Parecer (01/11, Codex) | Linha de base | Leitura |
|---|---|---|---|
| Testes JavaScript | 164 | 184 | +4 MEL-01, +5 MEL-06a, +11 verificador |
| Núcleo .NET | 137 | 137 | igual |
| Interface WPF | 72/76 | 76/76 nas duas execuções | causa de ambiente (story MEL-02); nada mudou no Notepad |
| Verificação completa | comandos separados | um comando, três estados, saída 3 quando incompleta | MEL-03 fatia 1 |
| Semgrep | não registrado | não executado (Docker desligado) | requisito ausente, não falha |

## 4. Requisitos ausentes e lacunas

| Item | Efeito | Próximo passo |
|---|---|---|
| Daemon do Docker desligado | 3 componentes Semgrep não executados | Ligar o Docker Desktop e rodar `npm run verificar -- --so semgrep-scan,semgrep-test,semgrep-mutacoes` (decisão do responsável; esta sessão não liga serviços) |
| Lint de JavaScript | inexistente | Story MEL-03, fatia 2 (auditoria antes) |
| Checagem de tipos | inexistente; só `node --check` | idem |
| Execução no Codex | não medida | Até a MEL-07, o Codex não é usado com alvos; a suíte WPF no sandbox do Codex fica "não executado" pelo verificador |
| Clone limpo de verdade | não exercitado (mesma máquina, `node_modules` já instalado) | Primeiro uso da CI (MEL-08) ou clone em pasta temporária com `npm ci --ignore-scripts` |
| Dispersão | duas amostras só | Os tempos servem de ordem de grandeza; metas numéricas ficam para a MEL-11 |

## 5. Provas negativas do contrato (mesma sessão)

| Caso | Resultado |
|---|---|
| `global.json` sintético pedindo SDK 10.0.999 com `rollForward: disable` | host recusa: "A compatible .NET SDK was not found" |
| `packages.lock.json` adulterado numa cópia temporária do Core | `dotnet restore --locked-mode` sai 1 com `NU1004` |
| Verificador sem `dotnet` no PATH | `dotnet-restore` "requisito ausente", dependentes "não executado", saída 3 |
| Componente desconhecido em `--so` | saída 2 |
