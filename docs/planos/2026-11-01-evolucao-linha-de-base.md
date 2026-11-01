# Linha de base da etapa 2 — verificações disponíveis em 2026-11-01

**Anexo** do [plano de evolução](2026-11-01-evolucao-arquitetura-qualidade.md) (§12, item "Executar verificações disponíveis, registrar requisitos ausentes e consolidar o baseline") · **Commits medidos:** 1ª execução na árvore que virou `5e71dbd` (antes do resumo das contagens .NET); 2ª em `d90adb5`; 3ª em `8b695d7` (entre elas só documentação mudou) · **Executor:** sessão `b0f09ab6`, Claude Code, usuário interativo `ianfl`

## 1. Ambiente

| Item | Valor |
|---|---|
| Sistema | Windows 10 Pro 10.0.19045, x64, sessão interativa |
| Node / npm | 26.12.1 / 11.20.0 |
| .NET | SDK 10.0.401 (`C:\tools\dotnet`, único instalado); runtimes NETCore, AspNetCore e WindowsDesktop 10.0.12. Resolvido pelo `reimplementacoes/notepad/global.json` |
| Docker | cliente e daemon 29.4.3. Desligado nas execuções 1 e 2; ligado pelo responsável antes da 3ª. Imagem `semgrep/semgrep` já local no digest fixado (`sha256:529ee8a2…`), sem pull |
| Ferramentas de análise | JDK 21.0.12.1, Ghidra 12.1.4, uv 0.11.17, Python 3.15.1 (inventário; fora da verificação) |
| PRKing Notepad do responsável | não estava aberto (`tasklist`); nenhum processo fechado |

## 2. Resultado por componente

Comando: `npm run verificar -- --json`. Três execuções, sem mudança de código entre a 2ª e a 3ª (a 2ª já com o resumo das contagens .NET). A 3ª, com o Docker ligado, é a linha de base completa.

| Componente | Estado (1ª e 2ª / 3ª) | Resultado | Duração 1ª / 2ª / 3ª (s) |
|---|---|---|---|
| `ambiente-node` | aprovado | v26.12.1 | 0 / 0 / 0 |
| `dependencias-npm` | aprovado | 1 dependência (`rea-agents` 6.4.0) coerente | 0 / 0 / 0 |
| `sintaxe-js` | aprovado | 47 arquivos | 2,6 / 2,7 / 2,7 |
| `js` (`npm test`) | aprovado | 183/183 na 1ª; 184/184 na 2ª e na 3ª (teste novo do resumo .NET) | 5,9 / 6,0 / 6,6 |
| `monetizacao` | aprovado | perfis conferidos | 0,1 / 0,1 / 0,2 |
| `dotnet-restore --locked-mode` | aprovado | — | 5,7 / 1,0 / 1,5 |
| `notepad-build --no-incremental` | aprovado | 0 avisos (avisos são erros) | 6,8 / 3,7 / 4,5 |
| `notepad-core` | aprovado | 137/137 | 2,8 / 2,5 / 2,8 |
| `notepad-ui` | aprovado | 76/76 | 17,3 / 16,8 / 17,3 |
| `semgrep-scan` | não executado / aprovado | 1ª e 2ª: requisito ausente (daemon do Docker inacessível); 3ª: sem achados | 3,3 / 0,4 / 52,6 |
| `semgrep-test` | não executado / aprovado | testes das regras | 0 / 0 / 4,2 |
| `semgrep-mutacoes` | não executado / aprovado | mutações das regras | 0 / 0 / 192,0 |
| **Total** | **incompleto (saída 3) / aprovado (saída 0)** | 1ª e 2ª: 9 aprovados, 3 não executados; 3ª: 12/12 aprovados | **45 / 33 / 285** (relógio) |

Só o Semgrep isolado (`--so semgrep-scan,semgrep-test,semgrep-mutacoes`), logo depois de ligar o Docker: 3/3 aprovados, saída 0, 267 s (scan 67,6; test 10,5; mutações 189,5). As mutações respondem por dois terços do tempo total: dado para a MEL-08 (job próprio, não bloquear os outros).

Composição do `npm test` (184): controles 60 (gates `rea` e CLI, organizador de assets, monetização, verificador) e puzzle-piloto 124 (8 arquivos, 5,2 s isolados). Os testes do puzzle-piloto já estavam no `npm test`; não há suíte separada.

`npm run test:notepad` (agora na pasta do `global.json`, saída em `bin/` do repositório): Core 137/137, UI 76/76, 20 s.

## 3. Comparação com o ponto de partida do plano (§2)

| Aspecto | Parecer (01/11, Codex) | Linha de base | Leitura |
|---|---|---|---|
| Testes JavaScript | 164 | 184 | +4 MEL-01, +5 MEL-06a, +11 verificador |
| Núcleo .NET | 137 | 137 | igual |
| Interface WPF | 72/76 | 76/76 nas duas execuções | causa de ambiente (story MEL-02); nada mudou no Notepad |
| Verificação completa | comandos separados | um comando, três estados, saída 3 quando incompleta | MEL-03 fatia 1 |
| Semgrep | não registrado | aprovado (scan, testes e mutações) com o Docker ligado | antes disso, "não executado", não falha |

## 4. Requisitos ausentes e lacunas

| Item | Efeito | Próximo passo |
|---|---|---|
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
