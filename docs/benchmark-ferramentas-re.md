---
titulo: Benchmark de ferramentas de engenharia reversa com IA
data: 2026-10-13
foco: games (PC), com cobertura de aplicativos de PC e mobile
host: Windows 10 x64
---

# Benchmark de ferramentas de engenharia reversa com IA

Comparação do REA (instalado neste projeto) com o **universal-modder** e com outras ferramentas que ligam agentes de IA a motores de engenharia reversa. O foco é games de PC, com aplicativos de PC e mobile cobertos. Os dados de repositório (estrelas, último commit, licença) foram lidos pela API do GitHub em 13/10/2026. Nenhuma ferramenta foi baixada nem executada: antes de instalar qualquer uma, ela passa pela mesma auditoria usada no REA.

## Resumo

1. **O universal-modder não substitui o REA, e o REA não substitui o universal-modder.** São ferramentas de categorias diferentes:
   - O **REA** é um **motor de análise**: lê o alvo e devolve evidência rastreável.
   - O **universal-modder** é um **kit de fluxo de modding**: 11 skills, guias por engine de jogo, uma base de conhecimento escrita por agentes e a CLI `um`. Para a análise propriamente dita, ele **usa outras ferramentas** (ILSpy, Cpp2IL, Ghidra e IDA via MCP, Cheat Engine, Frida, RenderDoc).
2. **Para games de PC no Windows, o REA cobre pouco do que importa:**
   - O Ghidra no Windows é experimental e só leitura.
   - Não há captura de processo no Windows.
   - Não há nada específico de Unity ou Unreal.

   Nessa frente, ganham as ferramentas que o próprio universal-modder recomenda: **GhidraMCP, ida-pro-mcp, as pontes MCP do Cheat Engine, RenderDoc MCP, Cpp2IL e UE4SS**.
3. **Para aplicativos, o REA é forte** em JavaScript/Electron, web, .NET e evidência rastreável. Em **Android**, a dupla **JADX-AI-MCP + apktool-mcp** e o **MobSF** são mais maduros. Em **iOS**, tudo exige macOS ou aparelho com jailbreak.
4. **Recomendação:** manter o REA como base de evidência e análise de apps, e montar uma pilha de games em volta dele (seção 6). O universal-modder entra pelo **conhecimento**, que são os guias por engine e as notas de campo. A instalação dele como plugin só depois de auditada.

## 1. REA × universal-modder

### 1.1 O que cada um é

| | **REA** (`morluto/rea`) | **universal-modder** (`rehan-remade/universal-modder`) |
|---|---|---|
| Categoria | Motor de engenharia reversa (CLI + servidor MCP) | Kit de fluxo de modding de games (skills + CLI + base de conhecimento) |
| Pergunta que responde | "Como este programa funciona? Mostre a evidência." | "Como faço um mod para este jogo, do reconhecimento ao vídeo?" |
| Análise propriamente dita | Própria: 170 tools com Evidence, lacunas, comparação de versões | Delegada: ILSpy, Cpp2IL, Ghidra/IDA MCP, Cheat Engine, Frida, RenderDoc |
| Alvos | Nativo, JS/Electron, web, .NET, Android, firmware, Apple | Games de PC (12 guias por engine: Unity, Unreal, .NET/XNA, Godot, Source, Bethesda, Minecraft, Bannerlord, entre outras) |
| Mobile | Android (APK e adb); Apple só em macOS | Não cobre |
| Ciclo completo de mod | Não (só análise) | Sim: reconhecimento → rota → lab seguro → código → assets → teste no jogo → vídeo → publicação → nota de campo |
| Base de conhecimento | Não | Sim: centenas de notas de campo (`knowledge/`) sobre jogos e formatos reais, abertas a PRs |
| Geração de assets | Não | Sim, via fal.ai (pago, na nuvem) ou ComfyUI local |
| Teste no jogo real | Captura de processo (Linux/macOS) | Sim, no Windows: screenshot, gravação, envio de mouse e teclado (`um win`) |
| Windows | Parcial (seção 3 do guia) | Feito para Windows (nativo ou WSL) |
| Licença | MIT | MIT |
| Idade e maturidade | Criado em 04/2026; 202 contribuidores; 134 mil downloads/mês no npm; releases versionadas | Criado em 30/09/2026 (duas semanas); 91 contribuidores; sem releases (só o `main`), v0.2.0 |
| Popularidade | 203 mil ★, 49,5 mil forks (ver nota abaixo) | 7,4 mil ★, 778 forks |

> **Nota sobre as estrelas do REA:** 203 mil estrelas em seis meses é um número fora da curva. Os outros sinais confirmam adoção real (202 contribuidores, 49,5 mil forks, 134 mil downloads por mês), mas a proporção de observadores por estrela é baixa: 0,33%, contra 0,5% a 0,7% nos projetos comparados. Não é conclusivo. Estrelas não devem pesar na escolha.

### 1.2 Vantagens de cada um

**O REA é melhor em:**
- **Evidência rastreável:** todo resultado tem ID, hash do alvo, localização, e separa observação de inferência. O universal-modder usa a saída crua de cada ferramenta.
- **Apps JavaScript/Electron e web:** mapa de módulos, IPC, rastreio de funcionalidade e comparação de versões, sem executar nada. O universal-modder não tem equivalente.
- **.NET, Android, firmware e comparação de versões**, tudo numa interface só.
- **Segurança do nosso ambiente:** instalação local fixada, auditada e com trava por nível de risco. O universal-modder não tem trava por ferramenta: depende de regras escritas nas skills.

**O universal-modder é melhor em:**
- **Games:** guias por engine, rotas de modding (BepInEx, UE4SS, tModLoader, Fabric, SKSE) e a base de conhecimento com versões que funcionaram, armadilhas e verificações.
- **Fluxo completo:** do reconhecimento à publicação, com backup de saves e teste dentro do jogo real.
- **Windows:** captura de tela e áudio do jogo e envio de mouse e teclado, nativos.
- **Conteúdo novo:** sprites, 3D, som e voz pelo fal.ai.
- **Regras de conduta claras:** recusa anti-cheat, DRM, trapaça online e redistribuição de arquivos do jogo.

### 1.3 Segurança do universal-modder (leitura estática, sem executar)

| Item | O que faz | Avaliação |
|---|---|---|
| Hook `SessionStart` (`hooks/add-to-path.sh`) | Acrescenta o `bin/` do kit ao PATH da sessão, via `CLAUDE_ENV_FILE` | Benigno. É um hook a mais rodando em toda sessão |
| MCP `fal` | Servidor **remoto** `https://mcp.fal.ai/mcp`, com a chave `FAL_KEY` no cabeçalho | Envia prompts, imagens e arquivos para fora. Serviço **pago** |
| CLI `um` (Python) | Rede só para fal.ai, GitHub (base de conhecimento e PRs) e `127.0.0.1` (ComfyUI); `reg.exe query` para achar o Steam | Nada de ofuscação, `eval` ou envio de dados escondido |
| `um/ps1/WinDrive.ps1`, `ProcLoopback.ps1` | Compilam C# na hora (`Add-Type`) para enviar mouse e teclado (`SendInput`) e capturar áudio | Corresponde ao propósito declarado. Poder alto: controla o seu mouse e teclado |
| Download do ffmpeg | `BtbN/FFmpeg-Builds`, release `latest`, conferido com o checksum do **mesmo** release | Verificação fraca: binário sem versão fixada |
| `um kb pr` | Cria fork, branch e PR no GitHub com a sua conta (`gh`) | Pede confirmação. Publica notas suas |
| Instalação como plugin | `/plugin marketplace add` instala do `main`, sem versão fixada | Recebe qualquer mudança futura do `main` sem revisão |

**Veredito:** nenhum indício de malware na leitura. Os riscos são operacionais:
- é um projeto de duas semanas, sem releases;
- é um plugin global que segue o `main`;
- usa um serviço pago na nuvem;
- controla o seu mouse e teclado.

Se for usar: **clone numa pasta própria, fixado num commit**, sem instalar como plugin global. A primeira coisa a aproveitar é a pasta `knowledge/` e os guias por engine, que são só texto.

## 2. Motores nativos com MCP (PC: EXE, DLL, jogos nativos)

| Ferramenta | ★ | Último commit | Licença | O que traz | Windows |
|---|---|---|---|---|---|
| [GhidraMCP](https://github.com/LaurieWired/GhidraMCP) | 11,2 mil | 10/10/2026 | Apache-2.0 | Plugin do Ghidra: descompila, renomeia, segue referências | ✅ (Ghidra roda no Windows) |
| [ghidra-mcp (bethington)](https://github.com/bethington/ghidra-mcp) | 5,6 mil | 13/10/2026 | Apache-2.0 | Mais de 200 tools sobre o Ghidra | ✅ |
| [ReVa](https://github.com/cyberkaida/reverse-engineering-assistant) | 872 | 13/10/2026 | Apache-2.0 | Extensão do Ghidra, com GUI ou headless; recomenda o Claude Code | ✅ |
| [pyghidra-mcp](https://github.com/clearbluejar/pyghidra-mcp) | 444 | 10/10/2026 | Apache-2.0 | Ghidra headless, busca semântica no código | ✅ |
| [ida-pro-mcp](https://github.com/mrexodia/ida-pro-mcp) | 12,8 mil | 26/09/2026 | MIT | IDA Pro 8.3+ (IDA Free não serve), também headless | ✅ (precisa de licença do IDA) |
| Binary Ninja (Sidekick) | — | — | Comercial | Assistente de IA oficial, o mais integrado | ✅ (pago) |
| **REA + Ghidra** | — | — | MIT | 25 operações, com evidência rastreável | ⚠️ Experimental, só leitura, só PE |

**Onde o REA perde:** no Windows, o Ghidra do REA não renomeia nem comenta funções, e numa análise de jogo os nomes vão se acumulando até o código ficar legível. GhidraMCP e ReVa fazem isso.

**Onde o REA ganha:** evidência com hash do alvo, comparação de versões e o gate de segurança.

## 3. Games: memória, depuração e gráficos (análise dinâmica)

Todos estes **executam ou se conectam a um jogo em execução**. No nosso protocolo, são nível N2 ou N3, só com o jogo offline e **nunca em jogos com anti-cheat**.

| Ferramenta | ★ | Último commit | Licença | O que traz | Observação |
|---|---|---|---|---|---|
| [cheatengine-mcp-bridge](https://github.com/miscusi-peek/cheatengine-mcp-bridge) | 1,6 mil | 14/08/2026 | MIT | Liga o agente ao Cheat Engine (scan de memória, ponteiros, Auto Assembler) | Só Windows; exige DBVM ativo |
| [CheatEngine.Mcp](https://github.com/CheatEngineNet/CheatEngine.Mcp) | 83 | 11/10/2026 | MIT | Cheat Engine 7.7, várias instâncias numa conexão | Novo e ativo |
| [frida-game-hacking-mcp](https://github.com/0xhackerfren/frida-game-hacking-mcp) | 81 | 04/12/2025 | MIT | Faz o papel do Cheat Engine sobre o Frida: scan, hook, AoB | Parado desde 12/2025 |
| [GhostMCP](https://github.com/mq1n/GhostMCP) | 33 | 17/12/2025 | MIT | Servidor MCP **injetado no processo**, mais de 250 tools | Alto risco; parado |
| [x64dbgMCP](https://github.com/Wasdubya/x64dbgMCP) | 597 | 05/06/2026 | GPL-3.0 | Mais de 40 tools do SDK do x64dbg, x32dbg e x64dbg | Fixar em `127.0.0.1` (alguns servidores x64dbg escutam em `0.0.0.0`) |
| [x64dbg_mcp (bromoket)](https://github.com/bromoket/x64dbg_mcp) | 131 | 08/06/2026 | MIT | 23 "mega-tools" | |
| [renderdoc-mcp](https://github.com/JiaboLi-GitHub/renderdoc-mcp) | 358 | 09/06/2026 | MIT | 59 tools sobre capturas de frame da GPU (draws, render targets, matrizes) | Único da categoria |

O REA não cobre nada desta seção no Windows: a captura de processo dele só funciona em Linux e macOS.

## 4. Games por engine

| Engine | Ferramenta | ★ | Último commit | O que faz |
|---|---|---|---|---|
| Unity IL2CPP | [Cpp2IL](https://github.com/SamboyCoding/Cpp2IL) | 3,0 mil | 15/09/2026 | Recupera tipos, assinaturas e endereços; gera DLLs para o ILSpy |
| Unity IL2CPP | [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) | 9,5 mil | 18/08/2024 | Clássico, mas **parado desde 2024**. Prefira o Cpp2IL |
| Unity IL2CPP (ao vivo) | [il2cpp-frida-mcp](https://github.com/axhlzy/il2cpp-frida-mcp) | 29 | 24/02/2026 | Frida + IL2CPP via MCP (também Android) |
| Unity Mono / .NET (Terraria, Stardew) | ILSpy (`ilspycmd`), dnSpyEx | — | — | Descompila para um projeto C# completo. **O REA também analisa .NET** |
| Unreal | [RE-UE4SS](https://github.com/UE4SS-RE/RE-UE4SS) | 3,0 mil | 13/10/2026 | Scripts Lua injetados, gerador de SDK, editor de propriedades ao vivo |
| Unreal | [Dumper-7](https://github.com/Encryqed/Dumper-7) | 2,3 mil | 05/10/2026 | Gera o SDK de UE4/UE5 injetando uma DLL (sem licença declarada) |
| Unreal (ao vivo, MCP) | ue-bridge (PyPI) | — | — | Ponte MCP para um jogo com UE4SS: objetos, funções, Lua, snapshots |

Esta seção é a base dos guias de engine do universal-modder.

## 5. Aplicativos mobile

| Ferramenta | ★ | Último commit | Licença | O que traz | Requisito |
|---|---|---|---|---|---|
| [JADX-AI-MCP](https://github.com/zinja-coder/jadx-ai-mcp) + [jadx-mcp-server](https://github.com/zinja-coder/jadx-mcp-server) | 2,9 mil + 801 | 09/2026–10/2026 | Apache-2.0 | O agente navega no APK descompilado pelo JADX (com interface gráfica) | Java 11+, Python 3.10+ |
| [apktool-mcp-server](https://github.com/zinja-coder/apktool-mcp-server) | 672 | 02/07/2026 | Apache-2.0 | Decodifica, edita e reconstrói o APK | Apktool, JDK |
| [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) | 21,9 mil | 13/10/2026 | GPL-3.0 | Auditoria automática de APK e IPA (estática e dinâmica), API REST | Docker |
| [frida-mcp (dnakov)](https://github.com/dnakov/frida-mcp) | 450 | 12/05/2025 | MIT | Frida genérico via MCP | **Parado desde 05/2025** |
| [re-ios](https://github.com/gyh20062008-commits/re-ios) | 3 | 09/07/2026 | MIT | IPA, Mach-O, Frida, descriptografia FairPlay | macOS + iPhone; projeto muito pequeno |
| **REA** | — | — | MIT | APK via JADX, adb (17 tools), projeção de apps Android e Apple | APK no Windows só no `main`; Apple só em macOS |

**Android:**
- Para **ler e navegar** no código: JADX-AI-MCP.
- Para **auditar**: MobSF.
- Para **rodar no aparelho** (adb, logcat, puxar pacotes, instalar): o **REA** já cobre bem, com evidência.

**iOS:** sem Mac e sem iPhone com jailbreak, o caminho é só estático, com o MobSF analisando o IPA.

## 6. Recomendação: pilha para games no Windows

| Camada | Ferramenta | Por quê | Custo |
|---|---|---|---|
| Conhecimento e método | **universal-modder**: só `knowledge/` e os guias por engine, lidos como referência | Rotas testadas, versões que funcionaram e armadilhas por jogo | Grátis |
| Reconhecimento | `um scan`, se o universal-modder for adotado, ou a triagem do nosso protocolo | Engine, versão, anti-cheat, loaders | Grátis |
| .NET / Unity Mono | **REA** (`inspect_managed_*`) + ILSpy | Já instalado, com evidência | Grátis |
| Unity IL2CPP | **Cpp2IL** → Ghidra | Metadados + corpo nativo | Grátis |
| Unreal | **RE-UE4SS** (+ ue-bridge para o agente) | O padrão da comunidade | Grátis |
| Nativo | **Ghidra + GhidraMCP** (ou ReVa). O REA + Ghidra fica para a evidência | Renomeia e anota no Windows | Grátis (IDA é pago) |
| Memória ao vivo | **Cheat Engine + cheatengine-mcp-bridge** | Scan de valores → quem escreve → estrutura | Grátis |
| Gráficos | **RenderDoc + renderdoc-mcp** | Draws, matrizes, onde injetar | Grátis |
| Depuração | x64dbg + x64dbgMCP (preso em `127.0.0.1`) | Breakpoints e rastreio | Grátis |
| Apps JS/Electron e web | **REA** | É onde o REA é mais forte | Grátis |
| Android | **REA** (adb) + **JADX-AI-MCP** + MobSF | Cobertura completa | Grátis |

**Ordem sugerida:**
1. Ler a `knowledge/` e os guias do universal-modder (custo zero, sem instalar nada).
2. Escolher um jogo-alvo e passar pelo protocolo de segurança.
3. Instalar só o que esse jogo pedir (por exemplo, Cpp2IL + GhidraMCP para um jogo Unity IL2CPP), cada ferramenta auditada antes.

## 7. Cuidados

- **Anti-cheat e jogos online:** nenhuma ferramenta das seções 3 e 4 roda perto de jogos protegidos (EasyAntiCheat, BattlEye, Vanguard). Mesmo sem mexer no jogo, ter o Cheat Engine ou um depurador aberto pode causar banimento. Feche o jogo protegido antes.
- **Ferramentas injetadas** (GhostMCP, Dumper-7, UE4SS) rodam **dentro** do processo do jogo. No protocolo, são N3, e com alvo C3 só em máquina virtual.
- **Servidores MCP de depuração** às vezes escutam em `0.0.0.0`. Sempre amarre em `127.0.0.1`.
- **Projetos parados** (Il2CppDumper, frida-mcp do dnakov, frida-game-hacking-mcp, GhostMCP): prefira as alternativas ativas.
- **Serviços na nuvem** (fal.ai no universal-modder): o que você manda sai da máquina e custa dinheiro.
- **Instalação:** toda ferramenta nova passa pela auditoria (runbook no Engram: "Auditoria estática de pacote npm antes de instalar"; adaptar para Python e plugins) e entra **fixada numa versão**, como o REA.

## Fontes

- universal-modder: https://github.com/rehan-remade/universal-modder (README, `skills/reverse-engineering/SKILL.md`, `skills/mod-any-game/references/safety.md`, `um/`, `hooks/`, `.mcp.json`)
- Cobertura do lançamento: [Hermes AI](https://hermes-ai.net/news/universal-modder-lets-claude-code-build-playable-game-mods-automatically/), [Vida Extra](https://www.vidaextra.com/industria/hacer-mod-saber-programar-claude-code-esta-herramienta-gratuita-estan-creando-juegos-virales-que-mezclan-minecraft-modern-warfare-elden-ring), [laozhang.ai](https://blog.laozhang.ai/en/posts/universal-modder), [GameBusiness.jp](https://www.gamebusiness.jp/article/2026/10/04/28213.html), [Trendshift](https://trendshift.io/repositories/272004)
- Cheat Engine MCP: [Glama](https://glama.ai/mcp/servers/IMRX44/MCP), [mcpservers.org (GhostMCP)](https://mcpservers.org/servers/mq1n/ghostmcp), [CheatEngine.Mcp release](https://newreleases.io/project/github/CheatEngineNet/CheatEngine.Mcp/release/v2.0.0-beta.1)
- Frida e IL2CPP: [frida-game-hacking-mcp](https://glama.ai/mcp/servers/@0xhackerfren/frida-game-hacking-mcp), [il2cpp-frida-mcp](https://glama.ai/mcp/servers/axhlzy/il2cpp-frida-mcp)
- Android: [jadx-mcp-server](https://glama.ai/mcp/servers/zinja-coder/jadx-mcp-server), [jadx-ai-mcp](https://www.sourcepulse.org/projects/2457009)
- iOS: [re-ios](https://glama.ai/mcp/servers/gyh20062008-commits/re-ios), [MobSF + Objection](https://instagit.com/zhaoxuya520/reverse-skill/how-to-perform-ios-ipa-analysis-with-mobsf-objection/)
- Ghidra e IDA: [ReVa](https://cdn.jsdelivr.net/gh/cyberkaida/reverse-engineering-assistant@main/README.md), [pyghidra-mcp](https://mcp.so/ja/servers/pyghidra-mcp?tab=config), [ida-pro-mcp](https://glama.ai/mcp/servers/@mrexodia/ida-pro-mcp/blob/fea2eb6a9e41a44fdb0dd9507ce7a29ef6124a75/README.md)
- x64dbg e RenderDoc: [x64dbgMCP](https://mcpservers.org/ru/servers/Wasdubya/x64dbgMCP), [renderdoc-mcp](https://www.sourcepulse.org/projects/32378307)
- Unreal: [ue-bridge](https://pypi.org/project/ue-bridge/), [Dumper-7](https://docsearch.algolia.com/mcp/docs/repo/encryqed/dumper-7)
- Panorama de ferramentas: [deepresearch.ninja](https://deepresearch.ninja/2026/06/Reverse-Engineering-Tools-A-Comprehensive-Guide-to-IDA-Pro-Ghidra-Binary-Ninja-and-the-Ecosystem/), [appsecsanta](https://appsecsanta.com/mobile-security-tools/ghidra-alternatives)
- Estatísticas: API do GitHub e API de downloads do npm, consultadas em 13/10/2026
