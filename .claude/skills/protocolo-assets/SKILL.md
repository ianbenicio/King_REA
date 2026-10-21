---
name: protocolo-assets
description: Protocolo para identificar, extrair, converter e organizar os assets de um jogo (meshes e modelos 3D, texturas e imagens, áudio, vídeo) em pastas por tipo e categoria, com catálogo e deduplicação, em saidas/<slug>/ (fora do git), e registrar o inventário em registros/<slug>/04-assets.md. Use quando o responsável pedir para extrair, separar, listar ou organizar os assets de um jogo-alvo. Exige protocolo de segurança aprovado; leitura e extração são nível N1.
---

# Protocolo de assets de games

Fluxo: **reconhecer → extrair → converter (opcional) → organizar → verificar → registrar**. O núcleo é o organizador local `scripts/assets/organizar-assets.mjs`, que identifica cada arquivo pelo conteúdo (bytes iniciais), separa por tipo e categoria, elimina duplicatas por SHA-256 e gera um catálogo.

## 0. Pré-condições

- `registros/<slug>/00-seguranca.md` com `status: aprovado` e o alvo em `registros/ALVO_ATIVO`. Ler e extrair arquivos do jogo é **N1** (não executa o jogo).
- Jogo do responsável. **Assets extraídos são para análise e uso pessoal:** nunca vão para o git nem são redistribuídos (direitos autorais). Tudo fica em `saidas/<slug>/` (fora do git); o hook de commit também bloqueia binários e dados em `registros/`.
- Nunca extrair dentro da pasta do jogo nem modificar arquivos dele. Trabalhar sempre sobre cópia ou leitura.
- Combinar com o responsável, numa `AskUserQuestion`: tipos de asset (3D, imagens, áudio, vídeo), se quer conversão para formatos abertos, e copiar ou mover (padrão: copiar).

## 1. Reconhecimento (sem copiar nada)

```bash
node scripts/assets/organizar-assets.mjs --origem "<pasta do jogo>" --destino "saidas/<slug>/reconhecimento" --simular
```

O `resumo.md` gerado mostra os formatos soltos, os **contêineres** (com a ferramenta que extrai cada um) e as conversões sugeridas. A engine já vem identificada no protocolo de segurança.

## 2. Extração dos contêineres

Extrair para `saidas/<slug>/extraido/<contêiner>/`, preservando a estrutura interna. Cada ferramenta é **auditada e fixada antes de instalar** (`docs/plano-integracao-games.md`), só a que o jogo exigir.

| Engine / formato | Ferramenta | Observação |
|---|---|---|
| Unity (`.assets`, `.bundle`, `UnityFS`) | **AssetRipper** (projeto completo; meshes exportáveis em glTF) ou **UnityPy** (script: Texture2D → PNG, AudioClip → WAV/OGG, Mesh → OBJ) | Versão do Unity decide a compatibilidade |
| Unreal (`.pak`, `.utoc`/`.ucas`) | **FModel** / CUE4Parse | Pode exigir chave AES (pública na maioria) e `.usmap` |
| Wwise (`.bnk`, `.wem`), FMOD (`.fsb`, `.bank`) | **vgmstream** | Decodifica e converte para WAV |
| Godot (`.pck`) | GDRE Tools | |
| Source (`.vpk`) | VRF (Source 2) ou GCFScape | |
| Bethesda (`.ba2`, `.bsa`) | BSArch | |
| GameMaker (`data.win`) | UndertaleModTool | |
| CRI (`.cpk`, `.usm`) | CriPakTools; áudio via vgmstream | |
| ZIP / 7z | REA `extract_artifact` ou 7-Zip | |
| Formato desconhecido | Base de conhecimento (`ferramentas/universal-modder/knowledge/`, arquivos XeNTaX/ZenHAX) e QuickBMS com script da comunidade | Auditar o script antes de rodar |

## 3. Conversão para formatos abertos (opcional, sob pedido)

Para `saidas/<slug>/convertido/`, **preservando os originais**. Guiar-se pela seção "Conversões sugeridas" do resumo:

| De | Para | Ferramenta |
|---|---|---|
| DDS, KTX, ASTC, TGA, EXR | PNG | texconv, ImageMagick ou Pillow |
| WEM, XMA, FSB | WAV / OGG | vgmstream |
| PSK, UEFormat, MDL (Source) | glTF | Blender + importador (PSK, UEFormat) ou Crowbar |
| Bink, USM | MP4 | ffmpeg (Bink 1) ou RAD Video Tools; ferramentas CRI |

## 4. Organização

```bash
node scripts/assets/organizar-assets.mjs --origem "saidas/<slug>/extraido" --destino "saidas/<slug>/assets"
node scripts/assets/organizar-assets.mjs --origem "saidas/<slug>/convertido" --destino "saidas/<slug>/assets"   # se houve conversão
```

Estrutura gerada (cada arquivo mantém o caminho original abaixo da categoria):

```
saidas/<slug>/assets/
  3d/        personagens, armas, veiculos, ui, efeitos, cenario, outros
  imagens/   personagens, armas, veiculos, ui, efeitos, cenario, outros
  audio/     musica, voz, ambiente, sfx, outros
  video/     cutscenes, outros
  _catalogo/ catalogo.json, catalogo.csv, resumo.md
```

- A categoria é **inferida pelo caminho** (nomes de pasta e arquivo); prioridade: UI antes de armas e personagens. Revisar `outros`: cada jogo tem nomes próprios; se o responsável quiser, refinar com regras específicas do jogo e reorganizar.
- Duplicatas (mesmo SHA-256) ficam só no catálogo, apontando para o original.
- Reexecutar é seguro: nunca sobrescreve. Destino com o mesmo conteúdo fica como `reutilizado`; com conteúdo diferente, o item fica como `conflito` (destino preservado, `sha256_destino` no catálogo), o resumo lista os conflitos e o script sai com código 1. Resolver o conflito (destino novo e vazio, ou decidir qual versão vale) antes de registrar o inventário.

## 5. Verificação

- Conferir as contagens do `resumo.md` com o esperado (ex.: número de faixas de música, de personagens).
- Amostra por tipo: abrir alguns arquivos de cada pasta; checar dimensões e durações registradas no catálogo.
- Listar o que ficou não identificado (`outros`) e contêineres não extraídos, com motivo.

## 6. Registro

1. Escrever `registros/<slug>/04-assets.md` a partir de `registros/_modelos/04-assets.md`: **só contagens, formatos, ferramentas e versões, estrutura local e lacunas**. Nenhum asset, miniatura ou trecho de dado.
2. Commit local: `docs: asset inventory for <slug>`.
3. Se o protocolo de mecânicas estiver em andamento, apontar tabelas de dados achadas na extração (DataTables, ScriptableObjects) para o passo 2 dele.
