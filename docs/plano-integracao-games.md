---
titulo: Plano de integração de ferramentas de games ao REA
data: 2026-10-13
objetivo: engenharia reversa de jogos de PC que o responsável possui (single-player/offline)
---

# Plano de integração — ferramentas de games

O REA continua como base de evidência. Em volta dele, montamos a pilha de games do benchmark (`docs/benchmark-ferramentas-re.md`, seção 6). Cada ferramenta nova é tratada como o REA foi: **auditada antes de instalar, fixada numa versão, registrada no gate por nível e no mapa `rea-niveis.json` quando expõe MCP.**

## Regras que valem para toda a integração

- **Só jogos que o responsável possui, single-player ou offline.** Nunca em jogos com anti-cheat (EasyAntiCheat, BattlEye, Vanguard, etc.). Fechar o jogo protegido antes de abrir qualquer ferramenta de RE.
- **Nada de anti-cheat, DRM ou trapaça contra outros jogadores.** Isso está no `CLAUDE.md` e na skill `protocolo-seguranca`.
- **Instalar só o que o jogo-alvo exige**, não a lista inteira. Um jogo Unity IL2CPP puxa Cpp2IL + GhidraMCP; um Unreal puxa UE4SS; e assim por diante.
- **Auditoria por tipo de artefato** (runbook no Engram: "Auditoria estática de pacote npm antes de instalar", adaptado para Python, plugins do Ghidra e binários).
- **Servidores MCP de RE amarrados em `127.0.0.1`** (alguns, como certos x64dbg, sobem em `0.0.0.0`).
- **Ferramentas injetadas no processo do jogo** (UE4SS, Dumper-7, GhostMCP) são nível N3; com alvo não confiável, só em máquina virtual.

## Candidatos por camada (do benchmark)

| Camada | Ferramenta | Instala como | Nível do gate | Prioridade |
|---|---|---|---|---|
| Nativo (EXE/DLL) | **GhidraMCP** (LaurieWired) | plugin do Ghidra + servidor MCP | N1 (leitura) / N1 (renomeia o banco) | Alta |
| Nativo, alternativa | ReVa ou pyghidra-mcp | extensão / CLI do Ghidra | N1 | Média |
| Nativo, se houver IDA | ida-pro-mcp | plugin do IDA | N1 | Baixa (precisa de licença) |
| Unity IL2CPP | **Cpp2IL** | binário/CLI | N1 (não executa o jogo) | Alta |
| Unity IL2CPP ao vivo | il2cpp-frida-mcp | Frida + MCP | N3 (injeta no jogo) | Média |
| Unity Mono / .NET | ILSpy (`ilspycmd`); o REA também lê .NET | CLI .NET | N1 | Alta |
| Unreal | **RE-UE4SS** | injetado no jogo | N3 | Alta (se houver jogo UE) |
| Unreal ao vivo (MCP) | ue-bridge | Lua no jogo + MCP | N3 | Média |
| Memória ao vivo | **Cheat Engine + cheatengine-mcp-bridge** | CE + ponte MCP | N3 | Alta |
| Gráficos | **RenderDoc + renderdoc-mcp** | captura + MCP | N2 (analisa captura) / N3 (captura ao vivo) | Média |
| Depuração | x64dbg + x64dbgMCP | plugin + MCP | N3 | Média |
| Conhecimento | **universal-modder** (só `knowledge/` e guias) | clone fixado, sem plugin global | N0 (texto) | Alta |
| Dados Unity (parâmetros) | **UnityPy** (ou AssetRipper) | lib Python fixada / GUI | N1 (lê assets) | Alta — mais barato que descompilar |
| Dados Unreal (parâmetros) | **FModel / CUE4Parse** (export JSON de DataTables/CurveTables) | GUI / CLI | N1 (lê `.pak`) | Alta — mais barato que descompilar |
| Fontes da comunidade | TASVideos, TCRF, wikis, speedrun | leitura web | N0 | Alta — hipóteses a confirmar |

### Camada de assets (protocolo `protocolo-assets`)

Organizador próprio já pronto: `scripts/assets/organizar-assets.mjs` (identifica pelo conteúdo, separa por tipo e categoria, deduplica, cataloga). As ferramentas abaixo entram **por alvo**, auditadas e fixadas:

| Função | Ferramenta | Nível | Situação na máquina (13/10/2026) |
|---|---|---|---|
| Extrair Unity | AssetRipper / UnityPy | N1 | Python 3.14 e `uv` presentes; ferramentas ausentes |
| Extrair Unreal | FModel / CUE4Parse | N1 | ausente |
| Áudio de jogo (Wwise, FMOD, CRI, XMA) | **vgmstream** | N1 | ausente |
| Vídeo (Bink 1, MP4, WebM) | **ffmpeg** | N1 | ausente |
| Imagens (DDS, KTX, TGA → PNG) | texconv / ImageMagick / Pillow | N1 | Pillow via `uv` quando preciso |
| 3D (PSK, UEFormat, MDL → glTF) | **Blender** + importadores | N1 | ausente |
| Formatos desconhecidos | QuickBMS + script da comunidade | N1 | ausente; auditar cada script |

> **Ordem eficiente (protocolo de mecânicas):** comunidade → dados → código → execução → simulação. Os valores de balanceamento costumam estar em dados; o código só é necessário para as fórmulas.

## Ordem de execução

1. **Conhecimento primeiro (sem instalar nada que execute):** clonar o `universal-modder` numa pasta própria, fixado num commit, e usar só `knowledge/` e os guias por engine como referência. Custo zero, risco zero.
2. **Escolher o primeiro jogo-alvo.** A engine dele decide o que instalar.
3. **Rodar o protocolo de segurança** para esse jogo (classe de confiança, plano de níveis).
4. **Auditar e instalar só as ferramentas daquela engine**, uma a uma, cada uma fixada e registrada no gate.
5. **Registrar** no `01-analise.md` do jogo e, ao fim, no benchmark do alvo.

## Pendências de informação (responder para destravar)

- Qual o primeiro jogo-alvo, e onde ele está instalado? (decide a engine e a pilha)
- O jogo tem anti-cheat? (se tiver, paramos)
- Você tem Ghidra e um JDK 21 instalados? Tem licença do IDA? (decide o provider nativo)
- Tem Cheat Engine instalado? (decide a camada de memória ao vivo)

## Decisões em aberto para o responsável

- **Clonar o universal-modder** para aproveitar a base de conhecimento: aprova? Onde? (sugiro `ferramentas/universal-modder/`, fixado num commit, no `.gitignore`)
- **Baixar algum alvo ou ferramenta para eu inspecionar melhor:** quando uma auditoria estática não bastar, peço o download para uma pasta isolada e analiso sem executar.
