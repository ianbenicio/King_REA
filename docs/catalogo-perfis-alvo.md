# Catálogo de perfis do alvo e pacotes de recursos

<!--
Unidade U2 do plano docs/planos/2026-11-01-perfis-alvo.md, antes docs/plano-de-execucao.md (piloto "perfil do alvo e pacote de recursos").
Spec Pipeline SIMPLE: gather → spec (@architect) → critique (@qa). Este catálogo pode ser lido
por sessões de análise cega: não cita resultado de alvo de piloto. A calibração por alvo fica
em docs/planos/, fora do alcance dessas sessões.
-->

**Versão:** 0.2 (piloto) · **Data:** 2026-11-01 · **Base:** calibração da U1 (`d30c4a3`) e decisões da U3 (`141bc69`)

**Mudanças da 0.2:** C7 reescrita; regra C10 nova; tratamento de recurso não citado, de testes de controle e de recursos operacionais (seção 0.1); a seção 6 aponta para o formato final no modelo; código [CB] na legenda.

## 0. Como usar

O perfil do alvo tem três eixos: **tipo** (decide as ferramentas), **objetivo** (decide os protocolos e skills) e **complexidade** (decide a profundidade). Cada valor de eixo tem um pacote de recursos. O pacote do alvo é a composição dos três (seção 5).

**No piloto, o pacote só orienta.** Nada é desligado nem bloqueado. O gate (`.claude/hooks/rea-gate.mjs`) e os mapas de nível não mudam. O perfil complementa a classe de confiança (C1–C3) e os níveis (N0–N4b), sem substituir nenhum dos dois [PE §1]. Usar um recurso fora do pacote é permitido: basta registrar no diário do `01-analise.md` (regra C8, seção 5).

### 0.1 Estados de um recurso

Mesmo vocabulário do Harness [MF], para o catálogo subir sem tradução:

| Estado | Significado | Fonte |
|---|---|---|
| **obrigatório** | Sempre presente, fora da seleção (base comum, seção 1) | [MF] |
| **ativo** | Usado na sessão do alvo; carregar ou ter à mão desde o início | [MF] |
| **sob demanda** | Não usar por padrão; usar quando a pergunta pedir, registrando o motivo | [MF] |
| **não carregar** | Não se espera uso para esse valor de eixo. No piloto é só orientação: se for preciso, usar e registrar como "fora do pacote" | [PE §3] |
| **não citado** | Recurso de análise que nenhum pacote do alvo cita. Conta como fora do pacote e soma com "não carregar" na fração | [CB §1] |

Ficam fora do perfil, da cobertura e do registro C8 [CB §1]:
- **testes de controle**, como uma chamada feita de propósito para conferir que o gate recusa. Vão ao diário como "teste de controle";
- **recursos operacionais**, que não são de análise: push, configuração do Claude Code, revisão de código, QA loop e demonstração no navegador.

### 0.2 Grau de sustentação de cada entrada

| Marca | Significado | Fonte |
|---|---|---|
| `cal` | Calibrado: uso real medido em alvo registrado | [U1 §3] |
| `doc` | Documentado: sai de um documento existente do projeto, sem alvo calibrado | [PE §1] |
| `hip` | Hipótese: sem alvo e sem documento que sustente o item como pacote. A fonte entre colchetes, quando houver, sustenta só a existência do recurso. Um "não carregar" `hip` é lido como "sob demanda" (regra C6) | [PE §1], [PE §3, riscos] |

Tipo sem alvo registrado nunca recebe `cal` [PE §3, riscos].

### 0.3 Legenda das fontes

| Código | Documento |
|---|---|
| [U1 §n] | `docs/planos/2026-11-01-perfis-alvo-calibracao.md`, seção n (calibração retroativa dos 7 alvos) |
| [GJ] | `docs/plano-integracao-games.md` |
| [BM §n] | `docs/benchmark-ferramentas-re.md`, seção n |
| [GR §n] | `docs/guia-rea.md`, seção n |
| [CU] | `docs/conhecimento-universal-modder.md` |
| [NV] | `.claude/hooks/rea-niveis.json` e `.claude/hooks/ghidra-niveis.json` |
| [PS §n] | `.claude/skills/protocolo-seguranca/SKILL.md`, seção n |
| [CL] | `CLAUDE.md` do projeto, seção "Fluxo de trabalho por alvo" ou "Regras de segurança" |
| [PE §n] | `docs/planos/2026-11-01-perfis-alvo.md` (plano deste piloto), seção n |
| [MF] | `H:\King\Harness\docs\catalogo\mapa-fases.md` |
| [CB §n] | `docs/planos/2026-11-01-perfis-alvo-cobertura.md`, seção n (cobertura e decisões da U3) |

## 1. Base comum (todos os perfis)

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Ferramentas nativas do Claude Code (Read, Grep, Glob, Bash, PowerShell, Write, Edit) | obrigatório | `doc` | [MF] |
| Gates `rea-gate.mjs` e `cli-gate.mjs`, com os mapas de nível | obrigatório | `doc` | [CL], [NV] |
| Skill `protocolo-seguranca`, uma vez por alvo novo, antes de qualquer tool do REA | obrigatório | `cal` (registro `00-seguranca.md` nos 7 alvos; a skill foi invocada em 4) | [CL], [PS §6], [U1 §2.1], [U1 §4.2] |
| Servidor `rea`, família **sessão e evidência** (N0: `record_unknown`, `update_unknown`, `list_unknowns`, `export_evidence_bundle`, `import_evidence_bundle`, `binary_session`, `close_binary`) | ativo | `cal` (presente nos 7 alvos) | [U1 §3.1], [U1 §5.1] |
| Conectores do claude.ai (Gmail, Drive, Supabase, Notion, Calendar e demais) | não carregar | `cal` (0 chamadas em sessão de alvo) | [U1 §4.1], [CL], [PS §4] |
| Navegador embutido do app | sob demanda no protocolo de segurança; não carregar na análise | `cal` (2 chamadas, só no protocolo de um alvo) | [U1 §4.1] |
| Engram | não carregar durante a coleta; sob demanda no fechamento da análise e nas outras fases (ver objetivos) | `cal` (0 na coleta; usado em Fase 0, benchmark e fechamento) | [U1 §4.1] |
| Subagente `Explore` (localizar arquivos em `registros/` e `saidas/`; nunca `alvos/`, nunca análise de binário) | sob demanda | `doc` | [PE §3] |

## 2. Eixo tipo do alvo

### 2.1 Critérios de triagem (sem executar o alvo)

Todos saem das verificações que o protocolo de segurança já faz: tipo real pelo magic, listagem do conteúdo, assinatura e sinais de alerta [PS §2]. A tabela traz o marcador que decide o tipo. A ordem da tabela resolve marcadores que se sobrepõem (um jogo Unity também tem `MZ`): vale a primeira linha que casar. Partes realmente distintas do mesmo alvo recebem mais de um tipo (regra C2, seção 5).

| Id | Tipo | Marcador na triagem passiva | Grau | Fonte |
|---|---|---|---|---|
| `unity-il2cpp` | Jogo Unity IL2CPP | `UnityPlayer.dll` + `<Jogo>_Data/` + `GameAssembly.dll` + `global-metadata.dat` | `doc` | [CU] |
| `unity-mono` | Jogo Unity Mono | `UnityPlayer.dll` + `<Jogo>_Data/Managed/Assembly-CSharp.dll` | `doc` | [CU] |
| `unreal` | Jogo Unreal (UE4/UE5) | `Binaries/Win64/<Projeto>-Win64-Shipping.exe` + `Content/Paks/*.pak` | `doc` | [CU] |
| `electron` | App Electron | `resources/app.asar` ou pasta `resources/app/` ao lado de um executável | `doc` | [GR §7.1] |
| `android` | APK ou dispositivo Android | Magic `PK` com entradas de APK (manifesto e classes); ou alvo é um aparelho via adb | `doc` | [PS §2], [GR §3], [GR §7.6] |
| `dotnet` | Assembly .NET (sem Unity) | Magic `MZ` com cabeçalho CLI. Como ler o cabeçalho sem carregar o assembly ainda não está definido no protocolo | `hip` (método de detecção) | [GR §7.5], [PS §2] |
| `web` | Página ou site remoto, observado no navegador | Alvo é uma URL fora de `127.0.0.1`, sem build local | `doc` | [GR §7.2] |
| `fora-do-host` | Firmware, ELF, Mach-O, bytecode EVM | Magic `\x7fELF`, `\xCA\xFE\xBA\xBE` ou `\xCF\xFA\xED\xFE`, ou imagem de firmware | `doc` | [PS §2], [GR §3], [GR §7.7] |
| `js-estatico` | Código JavaScript em pasta (Node/ESM, ou HTML + JS servido em `127.0.0.1`) | Só arquivos de texto `.js`/`.mjs`/`.html`/`.css`, sem PE | `cal` (4 alvos) | [U1 §2.1] |
| `nativo-pe` | Binário nativo Windows (EXE/DLL x86/x64, inclusive engine própria de jogo) | Magic `MZ`, sem marcador de Unity, Unreal ou .NET | `cal` (3 alvos) | [U1 §2.1] |

**Atributo `jogo`.** Não é eixo: marca que o alvo é um jogo, o que traz as regras de jogo (só jogo que o responsável possui, sem anti-cheat; jogo online com servidor oficial só estático, salvo aprovação caso a caso) [GJ], e a oferta dos protocolos de mecânicas, assets e monetização [CL]. Ser jogo não ativa esses protocolos por si: nos 5 alvos calibrados que são jogos, mecânicas e assets nunca foram pedidos [U1 §5.3].

### 2.2 Pacotes por tipo

Colunas: servidores MCP, famílias de tools do REA (agrupamento da U1, nível do mapa [NV]), pilha por engine.

#### `nativo-pe` — `cal` (3 alvos)

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · nativo estático (N1: `open_binary`, `binary_overview`, `procedure_pseudo_code`, `xrefs`, `find_xrefs_to_name`, `search_strings`, `search_procedures`, `resolve_containing_procedure`, `procedure_callers`, `procedure_callees`, `procedure_assembly`, `read_bytes`, `list_names`) | ativo | `cal` | [U1 §3.1], [U1 §3.2] |
| REA · recursos e assinatura PE (N1: `inspect_pe_resources`, `inspect_signature`) | ativo | `cal` | [U1 §3.1], [U1 §3.2] |
| Servidor `ghidra` (GhidraMCP, N1) | ativo, com o Ghidra aberto antes da 1ª chamada (sem a GUI, a chamada falha) | `cal` | [U1 §3.2], [U1 §5.6], [BM §6] |
| Leitores próprios (`scripts/re/decodificar-recursos-pe.py`; scripts em `saidas/<slug>/scripts/`) | sob demanda | `cal` | [U1 §3.2] |
| Pilha dinâmica de jogo nativo (Cheat Engine + ponte MCP, x64dbg + x64dbgMCP, RenderDoc + renderdoc-mcp), N2/N3, instalada por alvo, auditada e fixada | sob demanda (só com `jogo`, offline e sem anti-cheat) | `doc` | [GJ], [BM §3], [CU] |
| REA · UI nativa (`observe_native_ui` N2, `capture_native_ui_scenario` N3) | sob demanda | `hip` (nunca chamado) | [NV], [U1 §4.1] |
| REA · JavaScript e navegador | não carregar | `cal` (0 nos alvos nativos, fora um teste de recusa do gate) | [U1 §4.1] |
| REA · Android (N4a/N4b) | não carregar | `cal` (0 em todos os alvos) | [U1 §4.1] |
| REA · captura de processo, firmware, Mach-O | não carregar (não roda neste host) | `doc` | [GR §7.7] |

#### `js-estatico` — `cal` (4 alvos)

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · JavaScript estático (`analyze_javascript_application` N1, `trace_javascript_semantics` N0) | ativo | `cal` | [U1 §3.1], [U1 §3.2] |
| `inspect_analysis_view` (resumo de resultado grande) | sob demanda | `doc` | [GR §7.1] |
| REA · navegador (`list_browser_targets` N2, `capture_browser_scenario` N3) | sob demanda: só se o objetivo pedir execução e o nível estiver aprovado | `cal` (`capture_browser_scenario`, só onde N3 foi aprovado) | [U1 §3.2], [U1 §5.2] |
| Servidor `ghidra` | não carregar | `cal` (0 nos 4 alvos) | [U1 §4.1] |
| REA · nativo estático e PE | não carregar | `cal` (0 nos 4 alvos) | [U1 §4.1] |
| REA · Android | não carregar | `cal` | [U1 §4.1] |

#### `electron` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · JavaScript estático sobre o `app.asar` (`analyze_javascript_application`, `trace_application_feature`, `trace_javascript_semantics`, `compare_application_versions`) | ativo | `doc` | [GR §7.1] |
| `inspect_analysis_view` (o resultado de um app real pode passar de centenas de MB) | ativo | `doc` | [GR §7.1] |
| REA · Electron em execução (`list_electron_targets`, `inspect_electron_page` N2; `capture_electron_scenario` N3) | sob demanda | `doc` | [GR §7.3] |
| REA · nativo estático, para módulos nativos `.node`/DLL do app | sob demanda | `hip` | — |
| Servidor `ghidra` | não carregar, salvo módulo nativo | `hip` | — |

#### `web` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · web passiva (N2: `list_browser_targets`, `inspect_web_page`, `observe_web_session`, `analyze_web_bundle`, `capture_web_screenshot`) em navegador aberto pelo responsável, perfil separado, porta em `127.0.0.1` | ativo | `doc` | [GR §7.2] |
| `export_web_scripts` → REA · JavaScript estático | sob demanda | `doc` | [GR §7.2] |
| `capture_browser_scenario` (N3) | sob demanda | `doc` | [GR §7.2] |
| Servidor `ghidra`, REA nativo e Android | não carregar | `hip` | — |

#### `dotnet` e `unity-mono` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · gerenciado (N1: `inspect_managed_artifact`, `inspect_managed_members`, `inspect_managed_native_boundaries`; N0: `compare_managed_members`) | ativo | `doc` | [GR §7.5], [BM §6] |
| ILSpy (`ilspycmd`), instalado por alvo, auditado e fixado | sob demanda | `doc` | [GJ], [BM §6], [CU] |
| `unity-mono`: UnityPy ou AssetRipper para parâmetros em dados (N1) | sob demanda | `doc` | [GJ] |
| Servidor `ghidra` (.NET não passa pelo Ghidra) | não carregar | `doc` | [GR §7.4] |

#### `unity-il2cpp` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Cpp2IL (N1, não executa o jogo), instalado por alvo | ativo | `doc` | [GJ], [BM §4], [CU] |
| Servidor `ghidra` + REA · nativo estático sobre `GameAssembly.dll` | ativo | `doc` | [GJ], [CU] |
| UnityPy ou AssetRipper (parâmetros em dados, N1) | sob demanda | `doc` | [GJ] |
| il2cpp-frida-mcp (N3, injeta no jogo) | sob demanda | `doc` | [GJ] |
| REA · JavaScript, navegador e Android | não carregar | `hip` | — |

#### `unreal` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| FModel / CUE4Parse (export de DataTables e CurveTables dos `.pak`, N1) | ativo | `doc` | [GJ], [CU] |
| Servidor `ghidra` + REA · nativo estático sobre o shipping exe | ativo | `doc` | [CU] |
| RE-UE4SS, Dumper-7, ue-bridge (N3, injetam no jogo; com alvo C3, só em VM) | sob demanda | `doc` | [GJ], [BM §4], [BM §7] |
| REA · JavaScript, navegador e Android | não carregar | `hip` | — |

#### `android` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| REA · APK estático (N1: `inspect_android_package`, `inspect_android_class`, `search_android_classes`, `decode_android_resources`), com JDK 17+ e `jadx-headless-mcp`; na 6.4.0 o Windows pode ser recusado | ativo, se o host aceitar | `doc` | [GR §7.6], [NV] |
| REA · adb leitura (N4a) | sob demanda | `doc` | [GR §7.6], [BM §5] |
| REA · adb com mutação (N4b, confirmação a cada chamada) | sob demanda | `doc` | [GR §7.6], [CL] |
| JADX-AI-MCP e MobSF | sob demanda (instalar por alvo, auditados) | `doc` | [BM §5] |
| Servidor `ghidra` e REA · JavaScript | não carregar | `hip` | — |

#### `fora-do-host` — `doc`, sem alvo calibrado

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Tools de firmware, ELF, core dump, EVM, captura de processo e Mach-O | não carregar neste host: exigem Linux (WSL) ou macOS | `doc` | [GR §3], [GR §7.7] |
| Triagem passiva e registro da lacuna (`record_unknown`) | ativo | `doc` | [PS §2], [GR §8] |

## 3. Eixo objetivo

### 3.1 Critérios

O objetivo sai da identificação do protocolo de segurança: as perguntas concretas que a análise deve responder [PS §1]. Um alvo pode ter vários objetivos (regra C1, seção 5).

| Id | Objetivo | Critério no `00-seguranca.md` §1 | Grau | Fonte |
|---|---|---|---|---|
| `analise` | Entender o funcionamento (sempre presente) | Todo alvo aprovado | `cal` (7 alvos) | [U1 §2.1] |
| `especificacao` | Especificação para reimplementação em sala limpa | O objetivo cita reimplementação ou especificação | `cal` (2 alvos, sem a skill, que é posterior) | [U1 §2.1], [U1 §4.2] |
| `monetizacao` | Anúncios, compras e dark patterns | O objetivo cita monetização | `cal` (4 alvos) | [U1 §2.1], [U1 §4.2] |
| `benchmark` | Registro e benchmark depois da análise | Só com análise concluída e "sim" do responsável na conversa | `cal` | [CL], [U1 §5.4] |
| `mecanicas` | Mecânicas e dinâmicas de jogo | Pedido do responsável (oferecido quando `jogo`) | `hip` (0 usos) | [CL], [U1 §4.2] |
| `assets` | Extração e organização de assets de jogo | Pedido do responsável | `hip` (0 usos) | [CL], [U1 §4.2] |

### 3.2 Pacotes por objetivo

#### `analise` — `cal`

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Registro em `01-analise.md` (modelo) com `record_unknown` para as lacunas | ativo | `cal` | [U1 §3.2], [GR §8] |
| Skill `reverse-engineer-anything` | sob demanda (1 leitura do `SKILL.md`, nenhuma invocação) | `cal` | [U1 §4.2] |
| Subagentes, exceto o `Explore` da base comum | não carregar na análise (0 nas sessões de análise; nunca para binário nem para chamar REA ou Ghidra) | `cal` | [U1 §3.2], [U1 §5.7], [PE §3] |
| WebSearch/WebFetch | não carregar na análise; proibido em alvo confidencial | `cal` (0 nas sessões de análise; as buscas ficaram em pesquisa e benchmark) | [U1 §3.2], [PS §1] |
| Engram | não carregar durante a coleta; sob demanda no fechamento | `cal` | [U1 §4.1] |

#### `especificacao` — `cal` no uso, `hip` na skill

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Skill `protocolo-especificacao` | ativo | `hip` (skill posterior a todos os alvos) | [CL], [U1 §4.2] |
| Pesquisa pública: subagentes `aiox-analyst` com WebSearch/WebFetch, em sessão própria | sob demanda (só alvo não confidencial) | `cal` (1 alvo) | [U1 §3.2], [U1 §5.7], [PS §1] |
| Engram (consulta e gravação de decisões) | sob demanda | `cal` | [U1 §3.2] |
| Skill `fase-0` (quando a especificação abre uma etapa nova) | sob demanda | `cal` (1 alvo) | [U1 §3.2] |

#### `monetizacao` — `cal`

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Skill `protocolo-monetizacao` + `docs/catalogo-monetizacao.md` | ativo | `cal` (4 de 4 alvos com esse objetivo) | [U1 §4.2], [U1 §5.3] |
| Execução para o estado de execução dos achados (no tipo `js-estatico`, `capture_browser_scenario` N3) | sob demanda: só com o nível aprovado | `cal` | [U1 §5.2], [CL] |
| Engram e WebSearch | não carregar na análise | `cal` | [U1 §4.1], [U1 §5.7] |

#### `benchmark` — `cal`

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Skill `protocolo-benchmark` | ativo, depois de conferir que `registros/<slug>/02-benchmark.md` ainda não existe ou que o responsável pediu refazer | `cal` (2 invocações sem produto final) | [U1 §4.2], [U1 §5.6] |
| WebSearch (2 a 6 por benchmark) | ativo, salvo alvo confidencial | `cal` | [U1 §5.4], [PS §1] |
| Engram (`query` e `save`) | ativo | `cal` | [U1 §5.4] |
| Servidores `rea` e `ghidra` | não carregar (0 chamadas nos benchmarks) | `cal` | [U1 §5.4] |
| Sessão | de preferência a principal do trabalho, não a sessão de análise | `cal` (com uma exceção, num alvo nativo) | [U1 §5.4] |

#### `mecanicas` — `hip`

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Skill `protocolo-mecanicas` | ativo | `hip` (0 usos) | [CL], [U1 §4.2] |
| Ordem de coleta: comunidade → dados → código → execução → simulação | ativo | `doc` | [GJ] |
| Fontes da comunidade (TASVideos, TCRF, wikis), N0 | sob demanda (alvo não confidencial) | `doc` | [GJ] |
| Leitores de dados da engine (UnityPy, FModel) conforme o tipo | sob demanda | `doc` | [GJ] |
| `docs/conhecimento-universal-modder.md` | sob demanda | `doc` | [GJ], [CU] |

#### `assets` — `hip`

| Recurso | Estado | Grau | Fonte |
|---|---|---|---|
| Skill `protocolo-assets` + `scripts/assets/organizar-assets.mjs` | ativo | `hip` (0 usos) | [CL], [U1 §4.2] |
| Extratores por engine e formato (AssetRipper/UnityPy, FModel, vgmstream, ffmpeg, texconv, Blender, QuickBMS), N1, instalados por alvo | sob demanda | `doc` | [GJ] |

## 4. Eixo complexidade

### 4.1 Critérios (medidos na triagem passiva)

A complexidade é o **maior** nível alcançado entre os critérios abaixo. Só usam dados que a triagem passiva já levanta [PS §2]. Os limites são hipótese: os alvos calibrados cobrem só os extremos (alvos abaixo de 1 MB e um cliente de jogo de 2,6 GB) [U1 §2.2], [U1 §5.5].

| Id | Critério | Baixa | Média | Alta | Grau | Fonte |
|---|---|---|---|---|---|---|
| K1 | Executáveis de código (EXE, DLL, assembly, `.so`, APK) | 1 | 2 a 4 | 5 ou mais | `hip` (limites) | [U1 §2.2], [U1 §5.5] |
| K2 | Módulos de script (`.js`, `.mjs`, `.ts`, fora dependências de terceiros) | até 50 | 51 a 500 | mais de 500 | `hip` (limites) | [U1 §2.2] |
| K3 | Tamanho total do alvo | até 1 MB | até 100 MB | mais de 100 MB | `hip` (limites) | [U1 §2.2], [U1 §5.5] |
| K4 | Formatos de dados próprios (extensões que o magic não identifica, em quantidade) | nenhum | presente | — | `hip` | [U1 §2.2] |
| K5 | Ofuscação ou packer evidente na triagem (sinal de alerta) | não | — | sim | `hip` (nenhum alvo calibrado tinha) | [PS §2], [PE §1] |

Recalcular a complexidade a cada adendo que amplie o escopo: no alvo nativo grande, a triagem passou de 8 arquivos (0,9 MB) para 522 (2,6 GB) num adendo [U1 §2.2].

### 4.2 Pacotes por complexidade

A complexidade não muda o conjunto de ferramentas do tipo: muda o número de rodadas e o cuidado entre elas. O pico de contexto das sessões dedicadas à análise ficou parecido em todas as complexidades (213k a 268k); o que cresceu foi o número de rodadas [U1 §3.3], [U1 §5.5].

| Recurso | Baixa | Média | Alta | Grau | Fonte |
|---|---|---|---|---|---|
| Sessões de análise | 1 sessão, 1 rodada | 1 sessão, com roteiro de perguntas | Plano de rodadas, uma unidade de sessão por rodada | `cal` (baixa, alta); `hip` (média) | [U1 §2.2], [U1 §5.5], [PE §3] |
| `export_evidence_bundle` | ativo, no fim | ativo, no fim | ativo, a cada rodada (o store se perde em reconexões) | `cal` | [GR §8], [U1 §3.2], [U1 §5.6] |
| `import_evidence_bundle` | não carregar | sob demanda | ativo, ao retomar | `cal` (alta) | [U1 §3.2] |
| `snapshot_path` no `open_binary`/`close_binary` (só binário nativo) | não carregar | sob demanda | sob demanda | `doc` | [GR §8] |
| Varredura em lote (`batch_decompile`, `get_call_graph`) | não carregar | não carregar | sob demanda | `hip` (nunca chamadas) | [NV], [U1 §4.1] |
| Leitores próprios para formatos de dados (em `saidas/<slug>/scripts/`) | não carregar | sob demanda | sob demanda | `cal` (alta) | [U1 §3.2] |
| Subagente `Explore` para localizar evidência já produzida em `saidas/<slug>/` | não carregar | sob demanda | sob demanda | `doc` | [PE §3] |

## 5. Regra de composição

| Id | Regra | Grau | Fonte |
|---|---|---|---|
| C1 | O pacote do alvo é a **união** da base comum, do pacote de cada tipo, de cada objetivo e da complexidade. Cada eixo decide uma parte diferente (ferramentas, protocolos, profundidade) | `doc` | [PE §1] |
| C2 | Partes distintas do mesmo alvo, de tipos diferentes, recebem todos esses tipos | `hip` (nenhum alvo calibrado tinha mais de um tipo) | [U1 §2.1] |
| C3 | Conflito de estado: **ativo** vence **sob demanda**, que vence **não carregar**. Um recurso ativo em qualquer eixo fica ativo | `hip` (escolha de desenho: erra para o lado de ter o recurso) | [PE §3, riscos] |
| C4 | O controle de risco vence o pacote: um recurso cujo nível não está em `niveis_aprovados`, ou que a classe de confiança proíbe, nunca fica ativo. Ele vira "sob demanda por adendo", e o adendo segue o protocolo de segurança | `doc` | [PS §3], [PS §7], [PE §1] |
| C5 | As restrições do alvo vencem o pacote: alvo confidencial derruba WebSearch, WebFetch e pesquisa pública para "não carregar"; análise cega segue a lista de cegueira; jogo online com servidor oficial fica no estático, salvo aprovação caso a caso | `doc` | [PS §1], [CL], [GJ] |
| C6 | Um "não carregar" de grau `hip` é lido como "sob demanda" até haver calibração. "Não carregar" firme só vem de `cal` (uso zero medido) ou de `doc` que diga que o recurso não se aplica ou não roda no host | `doc` | [PE §3, riscos] |
| C7 | O objetivo `benchmark` roda depois da análise concluída, de preferência na sessão principal. O pacote dele se soma à janela do benchmark, que começa com o `01-analise.md` concluído e o "sim" do responsável, em qualquer sessão | `cal` | [CL], [U1 §5.4], [CB §1] |
| C8 | Recurso usado fora do pacote: usar e registrar no diário do `01-analise.md` ("fora do pacote: <recurso>, motivo"). Essa é a métrica de qualidade do piloto | `doc` | [PE §3] |
| C9 | O perfil é recalculado em cada adendo que mude o tipo, o objetivo ou o escopo | `cal` (1 alvo mudou de escopo num adendo) | [U1 §2.2], [PS §7] |
| C10 | O objetivo `especificacao` sobe a profundidade um nível, até alta. A complexidade de triagem não muda, e o ganho de profundidade só acrescenta itens "sob demanda" | `hip` (sustentado por 1 alvo) | [CB §1], [U1 §2.2] |

### 5.1 Exemplo de composição (só ilustração do método)

Alvo `nativo-pe`, objetivos `analise` + `especificacao`, complexidade alta, classe C1, níveis N0 e N1:

- **ativo:** base comum; REA nativo estático e PE; `ghidra` com a GUI aberta; `export_evidence_bundle` a cada rodada e `import_evidence_bundle` ao retomar; `protocolo-especificacao` [seções 1, 2.2, 3.2, 4.2].
- **sob demanda:** leitores próprios; `snapshot_path`; lote; `Explore`; pesquisa pública com `aiox-analyst` (se não confidencial); Engram; UI nativa e pilha dinâmica só por adendo, porque N2 e N3 não estão aprovados (C4) [seções 1, 2.2, 3.2, 4.2, 5].
- **não carregar:** REA JavaScript, navegador e Android; conectores do claude.ai; WebSearch na sessão de análise [seções 1, 2.2, 3.2].

## 6. Registro do perfil (proposta para a U3)

**Formato final:** seção 7 do modelo `registros/_modelos/00-seguranca.md`, preenchida pelo passo "Perfil do alvo" do protocolo de segurança [PS §2], [CB §1]. Os eixos entram no fim da triagem; o pacote entra depois da decisão, porque a C4 depende de `niveis_aprovados`. A tabela abaixo é a proposta original da U2; o modelo acrescentou os campos "Profundidade" e "Recalculado em" e as três listas do pacote.

| Campo | Conteúdo | Fonte |
|---|---|---|
| Tipo(s) | Ids da seção 2.1 e o marcador que casou | [PS §2] |
| Atributo `jogo` | sim/não; engine | [GJ] |
| Objetivo(s) | Ids da seção 3.1 | [PS §1] |
| Complexidade | Nível e valor de K1 a K5 | seção 4.1 |
| Pacote | Referência a este catálogo (versão) e desvios aplicados por C4 a C6 | seção 5 |

## 7. Limites desta versão

| Limite | Consequência | Fonte |
|---|---|---|
| Calibração com 7 alvos, todos C1 e N0–N3, só dos tipos `nativo-pe` e `js-estatico` | Os demais tipos ficam `doc` ou `hip` até um alvo real | [U1 §5.8], [PE §3, riscos] |
| Limites de K1 a K5 sem pontos intermediários | Média é a faixa menos sustentada; revisar na U4 | [U1 §2.2] |
| Um alvo nativo pequeno teve rótulo provisório "média" na U1, mas os critérios K1 a K5 dão "baixa". A diferença veio do objetivo (`especificacao`), não da triagem | Tratar a profundidade pedida pelo objetivo na U3, sem mudar os critérios de triagem | [U1 §2.2] |
| Ganho esperado é de qualidade (chamadas fora do pacote, protocolos sem uso), não de tokens | Não prometer redução de contexto | [PE §2] |
| Ferramentas da pilha de games não estão instaladas | "Sob demanda" nelas significa auditar, fixar e registrar no gate antes do uso | [GJ], [CL] |
