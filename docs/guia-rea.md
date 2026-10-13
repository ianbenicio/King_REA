---
titulo: Guia do REA
versao_instalada: 6.4.0
npm_latest_na_revisao: 6.4.0
fonte_docs_versao: rea-agents-6.4.0 (a56f7bb)
fonte_docs_main: e0bd31c18c84fc406ad1c1fe412bc9018ede44ec
fonte_site: https://rea.tools/
ultima_revisao: 2026-10-13
proxima_revisao: 2026-11-01
---

# Guia do REA

Guia prático do REA (`rea-agents`) para este projeto. Ele se baseia na documentação oficial da **versão instalada (6.4.0)** e no site rea.tools, e foi testado nesta máquina (Windows 10 x64). O que só existe na versão de desenvolvimento está na seção 12.

**Revisão mensal:** todo dia 1º, uma tarefa agendada compara as fontes com esta versão e atualiza o guia. Veja a seção 13.

---

## 1. O que é o REA

O REA é uma ferramenta de engenharia reversa feita para ser usada pelo seu agente de código. Ele dá ao Claude acesso a programas que você não tem em código-fonte: executáveis, apps Electron, sites, assemblies .NET, APKs Android, firmware. Com isso, o Claude consegue explicar como uma funcionalidade funciona, comparar versões e reconstruir comportamentos.

Funciona assim:

```
Você ──pergunta──▶ Claude ──tools MCP──▶ REA ──▶ motores de análise (Ghidra, IDA, JADX…)
                     ▲                    │
                     └──── evidência ◀────┘
```

- **Você** faz uma pergunta sobre um comportamento ("como este app exporta CSV?").
- **O REA** lê o alvo e devolve **evidências**: código, chamadas, referências, constantes, requisições observadas, sempre com a localização de origem.
- **O Claude** interpreta as evidências, explica e, se você pedir, escreve e testa uma reconstrução.

A análise roda na sua máquina, e o REA não envia o alvo para lugar nenhum. Os resultados vão para o modelo de IA e seguem a política de dados do provedor do modelo.

## 2. Conceitos essenciais

| Termo | O que significa |
|---|---|
| **Alvo** | O que está sendo analisado: arquivo, pasta, `.asar`, APK, página aberta no navegador. |
| **Provider** | O motor de análise nativa: Ghidra, IDA ou Hopper. Só é necessário para binários nativos. |
| **Sessão** | Um alvo aberto com `open_binary`. Mantém o provider e as evidências até `close_binary`. |
| **Evidência** | Registro de cada resultado, com ID, identidade do alvo (hash), localização, observações, inferências e o que ficou sem resposta. |
| **Observação × inferência** | Observação é o que foi lido ou capturado. Inferência é a conclusão tirada disso. O REA mantém as duas separadas. |
| **Lacuna (unknown)** | Pergunta que a evidência não resolveu. Registrada com `record_unknown` e listada com `list_unknowns`. |
| **Estático × runtime** | Estático lê o alvo sem executá-lo. Runtime observa ou executa o alvo. |
| **Snapshot** | Arquivo local que guarda resultados para reaproveitar em consultas idênticas. |

## 3. O que dá para analisar nesta máquina

Situação conferida em 13/10/2026 com `rea capabilities --json` e `rea providers --json`.

| Tipo de alvo | O que o REA faz | Pré-requisito | Situação aqui |
|---|---|---|---|
| **App JavaScript / Electron** (pasta ou `.asar`) | Mapa de módulos, imports, IPC, entradas, rastreio de funcionalidade, comparação de versões | Nenhum | ✅ Pronto |
| **Página web** (navegador aberto por você) | DOM, scripts, requisições, observação de um clique, screenshots | Chrome/Edge com porta de depuração | ✅ Pronto (você abre o navegador) |
| **Electron / Node em execução** | Páginas, scripts e contextos em execução, de forma passiva | App iniciado com porta de depuração | ✅ Pronto (você inicia o app) |
| **.NET** (assemblies PE/CLI) | Metadados, CIL, membros, P/Invoke, comparação entre builds | Nenhum | ✅ Disponível ⚠️ O Windows não é host oficial |
| **Pacotes e arquivos compactados** | Inventário de conteúdo, extração | Nenhum | ✅ Pronto |
| **Binários nativos Windows** (EXE/DLL x86/x64) | Funções, pseudocódigo, assembly, xrefs, strings, chamadas | Ghidra 12.1.x + JDK 21 | ⏳ Falta instalar (seção 7.4) |
| **Binários nativos via IDA** | Mesmo que acima, pelo IDA | IDA + `ida-pro-mcp` | ⏳ Não configurado |
| **APK Android** (estático) | Manifesto, permissões, classes, métodos | JDK 17+ e `jadx-headless-mcp` 0.7.1 | ⏳ Falta instalar ⚠️ No Windows, só no `main` |
| **Dispositivo Android** (adb) | Pacotes, logcat, arquivos, instalar ou iniciar app | `adb` (platform-tools) | ⏳ Falta instalar |
| **Captura de processo, firmware, core dumps, ELF, EVM, recuperação de JS** | Vários | Linux (via WSL) | ❌ Não roda no Windows nativo |
| **macOS** (Mach-O, Hopper, UI nativa) | Vários | macOS | ❌ Indisponível |

## 4. Como o REA está instalado aqui

Este projeto **não usa** o `rea setup` oficial, que grava configuração global em `~/.claude.json` e `~/.claude/skills/`. A instalação é local e fixada:

| Item | Onde |
|---|---|
| Pacote `rea-agents@6.4.0` (versão exata, hash travado) | `package.json`, `package-lock.json` |
| Servidor MCP `rea` | `.mcp.json` (só vale dentro desta pasta) |
| Skill de investigação | `.claude/skills/reverse-engineer-anything/` |
| Trava de segurança | `.claude/hooks/rea-gate.mjs` e `rea-niveis.json` |
| Auditoria da versão | `docs/seguranca/auditoria-rea-6.4.0.md` |

**Conferir se está funcionando:**

```bash
npx rea mcp doctor
```

O resultado esperado é `healthy: true`, com 170 tools e 6 prompts.

**Comandos de terminal:** dentro do projeto, use `npx rea <comando>` para rodar a versão local. Não use `npx rea-agents@latest`: essa forma baixa outra versão, que não foi auditada.

## 5. Primeiros passos

### 5.1 Ligar o REA ao Claude Code

1. Abra uma sessão do Claude Code **na raiz** da pasta `PRKing_REA`, não numa subpasta. O `.mcp.json` usa caminho relativo (`node_modules/...`), e o Claude Code inicia o servidor a partir da pasta da sessão.
2. Na primeira vez, o Claude Code pergunta se você aprova o servidor MCP `rea` do `.mcp.json`. Aprove.
3. Peça: "liste as tools do REA disponíveis". Se aparecerem, está ligado.

### 5.2 Fluxo de trabalho com um alvo

```
1. Protocolo de segurança  →  2. Análise  →  3. (pergunta)  →  4. Benchmark
   uma vez, no início          com o REA       "posso?"          registro final
```

1. **Traga o alvo.** Diga o que é, de onde veio e o que quer descobrir. O Claude roda o protocolo de segurança: faz a triagem sem executar o alvo, define a classe de confiança e o plano de níveis. Você aprova.
2. **Análise.** O Claude usa o REA dentro do plano aprovado e registra tudo em `registros/<alvo>/01-analise.md`.
3. **Fim da análise.** O Claude pergunta se pode executar o protocolo de benchmark.
4. **Benchmark.** Gera `registros/<alvo>/02-benchmark.md`: sistemas, funcionamento, pontos positivos e negativos, melhorias, projetos similares e referências.

### 5.3 Primeiro exercício (exemplo oficial)

O site oferece um app de exemplo pequeno, de seis arquivos, com um botão "Export notes". É um bom primeiro alvo, porque o resultado esperado é conhecido.

Peça ao Claude:

> Quero analisar o exemplo oficial do REA, notes-example (https://rea.tools/examples/notes-example.zip). Rode o protocolo de segurança, depois descubra o que acontece quando clico em Export notes: onde o notes.csv é gravado, quais campos ele tem e os arquivos e linhas envolvidos.

O resultado esperado é este: o botão chama `notes.exportCsv()`, que envia a mensagem IPC `notes:export`. O processo principal formata as notas com `csv.js` e grava `notes.csv` na pasta Downloads, com as colunas `id` e `title`.

## 6. Como pedir ao Claude

**A regra:** um alvo, um comportamento por vez, pedindo evidência.

| Bom | Ruim |
|---|---|
| "Em `C:/apps/x/app.asar`, como funciona a exportação de PDF? Mostre o caminho do botão até a gravação, com arquivos e linhas." | "Analise este app." |
| "Por que o DX-Ball inverte o som quando a bola bate à esquerda? Mostre a função e as constantes." | "Faça engenharia reversa do jogo." |

**Pedidos úteis:**

- "Mostre as evidências e separe o que foi observado do que é inferência."
- "O que ficou sem resposta? Registre como lacuna."
- "Preveja o resultado para a entrada X e confira executando o trecho recuperado." Esse pedido testa a reconstrução.
- "Compare a versão 1.2 com a 1.3 deste app: o que mudou no fluxo de login?"

**Prompts guiados do REA (MCP):** o servidor oferece 6 roteiros prontos, que o Claude pode usar como ponto de partida:

| Prompt | Para quê |
|---|---|
| `investigate_feature` | Rastrear uma funcionalidade até as funções que a implementam |
| `compare_application_versions` | Comparar duas versões de um artefato |
| `verify_reconstruction` | Verificar uma reconstrução contra a evidência |
| `trace_crash` | Relacionar um crash a caminhos de código |
| `audit_residual_unknowns` | Revisar as lacunas que sobraram |
| `prepare_bounded_process_capture` | Planejar uma execução controlada antes de rodar |

## 7. Guias por tipo de alvo

Os níveis N0 a N4b são os do protocolo de segurança (mapa em `.claude/hooks/rea-niveis.json`).

### 7.1 App JavaScript / Electron, estático (N1)

Lê a pasta do app ou o `app.asar` **sem executar nada**. É o ponto de partida para qualquer app Electron (Discord, Notion, VS Code, Obsidian…).

**Onde fica o `.asar`:** em geral em `C:\Users\<você>\AppData\Local\<App>\app-<versão>\resources\app.asar` ou em `C:\Program Files\<App>\resources\app.asar`.

**Pelo Claude:** "Analise `<caminho>/app.asar` e explique como <funcionalidade> funciona."

**Pelo terminal:**

```bash
npx rea analyze-javascript-application "C:/apps/exemplo/resources/app.asar" --json > saidas/exemplo/app-evidence.json
```

O resultado de um app real pode ter centenas de MB (o Obsidian deu 334 MB). Para ler, projete um resumo de cerca de 10 KB com `inspect-analysis-view`, usando a visão `summary`, uma página de módulos ou um módulo específico. O Claude faz isso pela tool `inspect_analysis_view`.

**Depois do mapa:**

- `trace_application_feature`: segue uma string, nome de API ou canal IPC por todo o app.
- `trace_javascript_semantics`: fluxo de dados e chamadas.
- `compare_application_versions`: diferença entre duas versões.

**Limites:** nomes de canal calculados em tempo de execução podem ficar sem resolução. Nesse caso, a observação em runtime (7.3) complementa.

### 7.2 Página web no navegador (N2)

O REA se conecta a um navegador **que você abriu**, por CDP (Chrome DevTools Protocol), e observa de forma passiva.

**1. Abra um navegador separado com porta de depuração** (PowerShell; o caminho do executável pode variar):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:TEMP\rea-chrome" https://site-alvo.exemplo
```

> **Use sempre um perfil separado** (`--user-data-dir`), nunca o seu perfil com logins, e não exponha a porta fora do `127.0.0.1`. Feche o navegador ao terminar: o REA não o encerra.

**2. Peça ao Claude:** "O navegador está em `http://127.0.0.1:9222`, na página X. Comece a observar e eu clico em <ação>. Que requisição sai e como o resultado é montado?"

**Pelo terminal:**

```bash
npx rea list-browser-targets http://127.0.0.1:9222 --json
npx rea inspect-web-page http://127.0.0.1:9222 TARGET_ID --observation-ms 10000 --include-json-body-shapes --json
npx rea inspect-web-page http://127.0.0.1:9222 TARGET_ID --include-script-sources --json
```

**Outras tools:**

- `observe_web_session`: janela de observação enquanto você usa a página.
- `analyze_web_bundle`: rotas e endpoints a partir dos scripts.
- `capture_web_screenshot` e `compare_web_screenshots`: captura e comparação de telas.
- `export_web_scripts`: exporta os scripts para análise estática (7.1).

`capture_browser_scenario` faz o REA dirigir o navegador sozinho, o que é nível N3: pede confirmação a cada uso.

### 7.3 Electron ou Node em execução (N2)

Também é passivo: você inicia o app com a porta de depuração e o REA só observa.

- **Node:** `node --inspect=127.0.0.1:9229 ./app.mjs`. Use `--inspect`, não `--inspect-brk`, porque o REA não retoma um processo pausado.
- **Electron:** abra o app com a porta de depuração do Chromium (`--remote-debugging-port=9222`), quando o app permitir.

Tools: `list_javascript_runtime_targets` e `observe_javascript_runtime` (Node/V8); `list_electron_targets` e `inspect_electron_page` (Electron). Para juntar com o mapa estático, use `reconcile_javascript_runtime`.

`capture_electron_scenario` faz o REA abrir e dirigir o app (N3, confirmação a cada uso).

### 7.4 Binários nativos Windows com Ghidra (N1)

Suporte **experimental** no Windows, só leitura. Analisa EXE e DLL nativos x86/x64 sem executá-los, com 25 operações (funções, pseudocódigo, assembly, xrefs, strings, chamadas, bytes).

**Instalação (uma vez):**

1. Baixe e extraia o **Ghidra 12.1.x** (verificado com 12.1.4), por exemplo em `C:\tools\ghidra_12.1.4_PUBLIC`.
2. Instale um **JDK 64-bit completo, versão 21 ou mais nova**.
3. Acrescente as variáveis ao servidor `rea` no `.mcp.json`:

```json
"env": {
  "REA_ANALYSIS_PROVIDER": "ghidra",
  "GHIDRA_INSTALL_DIR": "C:\\tools\\ghidra_12.1.4_PUBLIC",
  "JAVA_HOME": "C:\\Program Files\\Java\\jdk-21"
}
```

4. Confira (no PowerShell, com as mesmas variáveis definidas):

```powershell
npx rea doctor --provider ghidra --json
```

**Uso:** "Abra `C:/alvos/programa.exe` com o Ghidra e mostre como a função que trata <menu> calcula <valor>."

**Pelo terminal:**

```bash
npx rea function "C:/alvos/programa.exe" main --provider ghidra --json
npx rea search "C:/alvos/programa.exe" "texto" --provider ghidra --json
npx rea decompile "C:/alvos/programa.exe" 0x1000 --provider ghidra --json
```

**Pontos de atenção:**

- **A primeira consulta é lenta**, porque o Ghidra importa e analisa o binário. O REA espera até 330 s (ajuste com `REA_GHIDRA_STARTUP_TIMEOUT_MS`). O Claude Code pode desistir antes: se der timeout, aumente o limite das tools MCP do Claude Code (variável `MCP_TOOL_TIMEOUT`, em ms) ou faça a primeira análise pelo terminal.
- **Memória:** `GHIDRA_HEADLESS_MAXMEM` (padrão `2G`; use `512M` para alvos pequenos).
- **Só disco local NTFS fixo.** Caminhos de rede (UNC), unidades SUBST e links são recusados.
- **No Windows não dá para renomear nem comentar funções** (o modo é só leitura).
- **.NET não passa pelo Ghidra:** use 7.5.
- O Ghidra roda com as suas permissões. O isolamento do REA protege os arquivos de trabalho, mas **não é uma sandbox**.

**Alternativa: IDA.** Se você tiver o IDA, configure o `ida-pro-mcp` e aponte `REA_IDA_MCP_CONFIG` para o JSON de registro dele. O REA usa o IDA como provider.

### 7.5 Assemblies .NET (N1)

Analisa sem carregar nem executar o código. Disponível nesta máquina, mas a documentação oficial só garante Linux e macOS como host.

| Tarefa | Tool |
|---|---|
| Identificar o artefato | `inspect_managed_artifact` |
| Tipos, assinaturas, corpo dos métodos (CIL), chamadas | `inspect_managed_members` |
| Chamadas nativas declaradas (P/Invoke) | `inspect_managed_native_boundaries` |
| Comparar builds | `compare_managed_members` |

Pelo terminal, a ferramenta vira comando com hífens: `npx rea inspect-managed-artifact <caminho>`.

### 7.6 Android

- **APK, estático (N1):** precisa de JDK 17+ e `jadx-headless-mcp` 0.7.1, com `REA_JADX_MCP_JAR` apontando para o `.jar`. ⚠️ O suporte a Windows foi documentado como "novo no `main`": a 6.4.0 pode recusar este host.
- **Dispositivo via adb:** precisa do `adb` (platform-tools), com `REA_ADB_PATH` opcional.
  - Leitura (N4a): pacotes, logcat, arquivos, tela.
  - Alteração (N4b): instalar, remover, enviar arquivo, iniciar ou parar app. Pede confirmação a cada uso.

### 7.7 O que exige Linux (WSL)

| Recurso | Motivo |
|---|---|
| Captura de processo (`capture_process_scenario`) | No Windows nativo, o REA ainda não garante o encerramento dos processos filhos |
| Firmware (binwalk/unblob), layout de ELF (pwntools), core dumps, bytecode EVM | Verificados só em Linux x64 e dependem do `prlimit` |
| Recuperação de fontes JS (Wakaru) | Linux x64 |
| Importar código-fonte histórico | Retorna `unsupported_host` no Windows |

Para usar, seria preciso instalar o REA dentro do WSL. ⚠️ Em 13/10/2026 o WSL desta máquina não iniciou (`ERROR_NO_SYSTEM_RESOURCES`).

## 8. Evidências, sessão e lacunas

- **Abrir e fechar:** `open_binary` liga o alvo a um provider, e `close_binary` libera os recursos. Ao fechar, as evidências da sessão somem, então **exporte antes**.
- **Exportar:** peça "exporte o bundle de evidência para `saidas/<alvo>/evidence.json`" (`export_evidence_bundle`). Esse é um dos critérios para dar a análise como concluída.
- **Lacunas:** `record_unknown` registra o que ficou sem resposta, e `list_unknowns` lista. O benchmark usa essa lista.
- **Snapshot:** para não reanalisar um binário grande, use `--snapshot <arquivo>` no terminal ou `snapshot_path` no `open_binary`/`close_binary`.
- **Comparar:** `npx rea compare esquerda.json direita.json` compara dois bundles.

## 9. Referência rápida do terminal

```bash
npx rea --help                          # todos os comandos
npx rea <comando> --help                # ajuda de um comando
npx rea mcp doctor                      # servidor MCP saudável?
npx rea doctor --provider ghidra --json # provider pronto?
npx rea providers --json                # providers disponíveis
npx rea capabilities --json             # o que funciona neste host
npx rea analyze <alvo> --json           # visão geral (JS/asar ou nativo)
npx rea function <alvo> <nome|endereço> --provider ghidra --json
npx rea decompile <alvo> <endereço> --provider ghidra --json
npx rea search <alvo> "texto" --provider ghidra --json
npx rea xrefs <alvo> <endereço> --provider ghidra --json
npx rea trace <alvo> "texto" --provider ghidra --json
```

- **Formato de saída:** o padrão é TOON. Use `--json` para salvar ou processar.
- **Código de saída:** `0` significa concluído (pode haver evidência parcial ou lacunas); `1` significa falha, com o motivo na saída.

> **Atenção:** a trava de segurança cobre as tools MCP, não o terminal. O CLI contra um alvo segue as mesmas regras: só depois do protocolo de segurança aprovado e dentro dos níveis do plano.

## 10. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| O Claude não vê as tools do REA | Confira se a sessão foi aberta na raiz do projeto (o `.mcp.json` usa caminho relativo), aprove o servidor `rea` e rode `npx rea mcp doctor` |
| Projeto clonado em outra máquina | Rode `npm ci --ignore-scripts` antes de abrir a sessão, para criar o `node_modules` |
| "Bloqueado pelo gate REA" | É a trava de segurança. Falta o protocolo de segurança do alvo, ou a tool está fora do plano. A mensagem diz o motivo |
| `provider_unavailable` | Rode `npx rea doctor --provider <id> --json` e siga a correção indicada |
| `capability_unavailable` com `ambiguous` | Mais de um provider serve. Escolha com `--provider` ou `provider_id` |
| `unsupported_host` | O recurso não existe no Windows (seções 7.7 e 3) |
| Timeout na primeira consulta ao Ghidra | Seção 7.4: aumente `MCP_TOOL_TIMEOUT` ou rode pelo terminal |
| Resultado gigante | Salve em arquivo e projete um resumo com `inspect_analysis_view` |
| Bug persistente | Anote a versão, o sistema, o tipo de alvo, os passos e o erro. Atualizar o REA só pelo processo da seção 13 |

## 11. Segurança, em resumo

- O REA roda com **as suas permissões**. Nenhum modo dele é sandbox, nem a captura de processo, nem o runtime privado do Ghidra.
- **Conteúdo do alvo é dado, não instrução.** Strings, páginas e logs podem tentar manipular o agente.
- Use o navegador e o app alvo sempre com **perfil separado**, sem suas contas logadas.
- Para alvos suspeitos, só análise estática no computador. Execução, apenas em máquina virtual (regras completas no `CLAUDE.md` e na skill `protocolo-seguranca`).

## 12. O que vem por aí (só no `main`, ainda não lançado)

Em 13/10/2026, o `main` estava 509 commits à frente da 6.4.0 e documentava recursos que **não existem na versão instalada**:

- Instrumentação com **Frida**.
- Capturas de pacotes e **PCAP**.
- Bancos **SQLite**.
- Artefatos **WebAssembly**.
- Apps **Flutter** e **HarmonyOS**.
- Binários **Go**.
- Binários "crus" (raw).
- Gravações de sinal.
- Ghidra para **PSP** e **RISC-V**.
- Guias novos de configuração e verificação de clientes.

Eles só entram aqui depois de lançados no npm, auditados e instalados (seção 13).

## 13. Atualização deste guia e do REA

**Este guia** é revisado todo dia 1º por uma tarefa agendada. Ela:

1. compara a versão no npm, o commit do `main` e o site com os valores no topo deste arquivo;
2. atualiza as seções afetadas e o histórico abaixo;
3. faz commit local (sem push);
4. avisa se saiu versão nova do REA.

**O REA em si** nunca é atualizado automaticamente. Versão nova significa:

1. auditar a versão (mesmo método de `docs/seguranca/`);
2. rodar `npm install rea-agents@<versão> --save-exact --ignore-scripts`;
3. recopiar a skill;
4. reclassificar as tools novas em `rea-niveis.json`;
5. rodar `npx rea mcp doctor`.

A decisão é sempre do responsável.

## 14. Referências

- Site: https://rea.tools/ (primeiros passos, guias, FAQ, exemplos)
- Repositório: https://github.com/morluto/rea
- Documentação da versão instalada: https://github.com/morluto/rea/tree/rea-agents-6.4.0/docs
- Documentação do `main`: https://github.com/morluto/rea/tree/main/docs
- Comunidade: Discord (link no site) e issues no GitHub
- Comparação com outras ferramentas (universal-modder, Ghidra/IDA MCP, Cheat Engine, Android, iOS): `docs/benchmark-ferramentas-re.md`

## Histórico de revisões

| Data | Versão do REA | Mudanças |
|---|---|---|
| 2026-10-13 | 6.4.0 | Primeira versão |
