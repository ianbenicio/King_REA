---
titulo: Conhecimento de RE de games (via universal-modder)
data: 2026-10-13
fonte: clone de rehan-remade/universal-modder, fixado no commit 5ba8150
local_do_clone: ferramentas/universal-modder/ (fora do git; recriar com o comando abaixo)
licenca_da_fonte: MIT
---

# Conhecimento de engenharia reversa de games

Índice condensado do material de referência do `universal-modder`, focado nas três engines escolhidas: **Unity, Unreal e nativo/C++**. É um ponteiro para o clone; o conteúdo completo está nos arquivos citados. O clone **não executa nada** aqui: usamos só o texto.

## Recriar o clone (se apagado)

```bash
git clone https://github.com/rehan-remade/universal-modder.git ferramentas/universal-modder
git -C ferramentas/universal-modder checkout 5ba8150e27b4f1bf17ae19dcecdb2341e467885a
```

Material útil dentro do clone:
- `knowledge/techniques/` — 72 notas de técnica (formatos, hooks, armadilhas).
- `knowledge/games/` — notas por jogo (Elden Ring, GTA V, Cyberpunk 2077, Baldur's Gate 3, Factorio, Dark Souls, Halo, entre dezenas).
- `skills/mod-any-game/references/engines/` — os guias resumidos abaixo.
- `skills/reverse-engineering/SKILL.md` — a escolha de ferramenta por tipo de código.

## Fluxo geral (vale para qualquer engine)

1. **Reconhecimento:** identificar engine e versão, ver se há anti-cheat, achar as pastas de save.
2. **Procurar prior art:** nota de campo do jogo, mods da comunidade, formato já documentado.
3. **Lab seguro:** backup dos saves antes de qualquer execução modificada.
4. **Ler o código real** (estático), confirmar ao vivo (dinâmico) antes de construir em cima de um palpite.
5. **Nomear tudo** que entender, acumulando até o código ficar legível.

## Unity

**Identificar:** `UnityPlayer.dll` + pasta `<Jogo>_Data/`.
- **Mono:** existe `<Jogo>_Data/Managed/Assembly-CSharp.dll`. Lógica em IL .NET, fácil de ler.
- **IL2CPP:** existe `GameAssembly.dll` + `global-metadata.dat`. Lógica compilada em nativo.
- Log: `Player.log` em `%USERPROFILE%\AppData\LocalLow\<empresa>\<produto>\`.

**Ler o código (a parte de RE, nossa pilha):**
- **Mono →** o próprio **REA** (`inspect_managed_*`) ou **ILSpy** (`ilspycmd -p -o ...`). Para depurar, dnSpyEx.
- **IL2CPP →** **Cpp2IL** (com `GameAssembly.dll` + `global-metadata.dat`) gera tipos, assinaturas e DLLs-fantasma; os corpos das funções são nativos, então vão para o **Ghidra/GhidraMCP** com os scripts gerados.
- Ao vivo: UnityExplorer (plugin BepInEx/MelonLoader).

Guia completo: `ferramentas/universal-modder/skills/mod-any-game/references/engines/unity.md`.

## Unreal (UE4/UE5)

**Identificar:** `<Projeto>/Binaries/Win64/<Projeto>-Win64-Shipping.exe` + `Content/Paks/*.pak`. Versão: `++UE5+Release-5.x` no exe. Saves em `%LOCALAPPDATA%\<Projeto>\Saved\`.

**Ler o código (nossa pilha):**
- **RE-UE4SS** injeta no jogo: Live View (inspetor de objetos e propriedades) e gerador de SDK. **Dumper-7** é alternativa para o SDK. Ambos são **N3** (injetam no processo).
- Assets: FModel (CUE4Parse) navega os `.pak`/IoStore; precisa da versão correta da UE e da chave AES (pública na maioria).
- Nativo: **Ghidra/IDA** no shipping exe, casando com o código-fonte da UE (conta Epic vinculada) para nomear funções.

Guia completo: `ferramentas/universal-modder/skills/mod-any-game/references/engines/unreal.md`.

## Nativo / C++ (engine própria, jogos antigos)

É onde a engenharia reversa pesa mais. É o cenário em que a nossa pilha nativa e dinâmica trabalha junta.

**Achar o que interpretar:**
- **Estático:** **Ghidra/IDA via MCP** (GhidraMCP, ReVa, pyghidra-mcp, ida-pro-mcp). Começar pelas strings (texto de UI, logs) e imports (D3D, XInput, APIs de arquivo), seguir as referências cruzadas até a função. O **REA + Ghidra** entra aqui para a evidência rastreável.
- **Dinâmico:** **Cheat Engine** (scan de valor → quem escreve → estrutura → dono), **x64dbg** (breakpoints, trace), ReClass.NET (reconstruir structs da memória viva). As versões MCP de cada um deixam o agente dirigir. **Amarrar em `127.0.0.1`.**
- **Assinaturas, não endereços:** achar funções por padrão de bytes (AOB) com curingas, para o trabalho sobreviver a atualizações do jogo. ASLR: calcular endereços a partir da base do módulo em tempo de execução.

**Gráficos:**
- **RenderDoc (+ renderdoc-mcp)** captura um frame e mostra cada draw, os render targets, as matrizes view/projection (nos constant buffers) e o depth buffer. É assim que se acha onde injetar geometria ou efeito.

Guia completo: `ferramentas/universal-modder/skills/mod-any-game/references/engines/native.md`.

## Regras de segurança (reforço)

- Só jogos que você possui, single-player/offline. **Nunca** em jogos com anti-cheat. Fechar o jogo protegido antes de abrir Cheat Engine, depurador ou overlay, porque a mera presença deles pode causar banimento.
- As ferramentas que injetam no processo (UE4SS, Dumper-7, proxy DLLs) são **N3** no nosso gate.
- Nada de bypass de anti-cheat, DRM ou verificação de posse. Analisar o seu próprio exe protegido, em memória, é permitido; escrever um exe desempacotado na pasta do jogo, não.
