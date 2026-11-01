# Calibração retroativa — perfil do alvo e pacote de recursos (U1)

<!--
Unidade U1 do plano docs/plano-de-execucao.md (piloto "perfil do alvo e pacote de recursos",
Fase 0 aprovada em 2026-11-01). Este arquivo cita resultados dos alvos de piloto (blocos-*,
encaixe-*): fica em docs/planos/, que a lista de cegueira exclui. O catálogo da U2 não pode
copiar daqui nada que seja resultado de piloto.
-->

**Data:** 2026-11-01 · **Sessão:** `3c3b8ee0-46cc-4c1c-82ff-278df3cabd91` · **Executor:** @analyst · **Base:** `main` @ `7626b0356593f5cd40d19dc1cf43a3f95aecd7a3`

Levantamento do que cada um dos 7 alvos registrados realmente usou. Só fatos com fonte: nenhum pacote é proposto aqui (isso é a U2). Onde há juízo desta unidade, ele está marcado como **rótulo provisório**.

## 0. Método e reprodução

**Fontes.** Registros `registros/<slug>/00` a `05`; handoffs em `docs/handoffs/`; transcripts do Claude Code em `~/.claude/projects/H--King-Clientes-e-Projetos-PRKing-REA/<sessão>.jsonl` (lidos só localmente; os subagentes ficam em `<sessão>/subagents/`); `git log`. Nada de `alvos/` foi aberto e nenhuma tool `rea`/`ghidra` foi chamada.

**Comandos.** Rodados em Git Bash, na raiz do repositório. `P` é a pasta dos transcripts.

```bash
P="C:/Users/ianfl/.claude/projects/H--King-Clientes-e-Projetos-PRKing-REA"
```

| Id | O que mede | Comando |
|---|---|---|
| **C1** | Uso por sessão com o `uso.js` do Harness, sem editá-lo: copia só o transcript da sessão (e os subagentes dela) para uma pasta isolada e aponta o `homedir` para lá | `uso1 <id-completo>` (função abaixo) |
| **C2** | Custo e prefixo da sessão | `node ~/.claude/skills/skill-budget/scripts/sessao.js --sessao <id-completo>` |
| **C3** | Linha do tempo da sessão (tools `rea`, `ghidra`, `engram`, navegador, `Skill`, `Agent`, leitura de `SKILL.md`, escrita em `registros/`, `WebSearch`/`WebFetch`), para separar sessões que atenderam mais de um alvo | `node linha.js "$P/<id>.jsonl"` (script no apêndice A) |
| **C4** | Data e autoria de um registro | `git log --format="%h %ad %s" --date=iso -- <arquivo>` |

```bash
uso1(){ T=$(mktemp -d); mkdir -p "$T/.claude/projects/p"; cp -p "$P/$1.jsonl" "$T/.claude/projects/p/"; [ -d "$P/$1" ] && cp -rp "$P/$1" "$T/.claude/projects/p/"; USERPROFILE="$(cygpath -w "$T")" HOME="$T" node /h/King/Harness/ferramentas/uso.js 60; }
```

Para tirar só as tools `rea`/`ghidra` da saída do C1: `uso1 <id> | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);for(const[k,v]of Object.entries(r.mcpTools))if(/__(rea|ghidra)__/.test(k))console.log(v,k)})'`.

Para cortar o C3 numa janela: `node linha.js "$P/<id>.jsonl" | awk '$1>="<início>" && $1<="<fim>"' | awk '{print $2}' | sort | uniq -c`.

**Conferência.** Para as 6 sessões de análise com REA, o total de chamadas `rea`/`ghidra` do C1 bate com o do C3 (a0ea8d85: 47 + 6; 539732ef: 12; c934e788: 10; 37f2850d: 9; 329780a3: 10; 93130452: 190 + 1). As janelas da a0ea8d85 somam o total da sessão (7 + 40 = 47 no `rea`; 5 + 1 = 6 no `ghidra`).

**Limites.**
- O `uso.js` conta por janela de dias, não por sessão; o C1 isola a sessão copiando o arquivo. Uma sessão retomada traz no próprio arquivo só as chamadas novas (o `uso.js` deduplica por id da chamada), mas o C1 não deduplica entre sessões diferentes.
- O `60` do C1 é a janela de dias do `uso.js`, contada a partir de hoje. O transcript mais antigo é de 2026-10-13: depois de 2026-12-12, aumente o número.
- `sessao.js` não separa custo por alvo: nas sessões que atenderam vários alvos (a0ea8d85, 11ac3a8a, 3ce1f2dc), o custo é da sessão inteira.
- Os notepads foram analisados antes de existirem handoffs; a ligação deles vem da escrita em `registros/` e dos caminhos `alvos/<slug>` nas chamadas (C3).
- A família de cada tool é um agrupamento desta unidade (seção 3.1), com o nível tirado de `.claude/hooks/rea-niveis.json`. Não é taxonomia do REA.

## 1. Mapa sessão → alvo

| Sessão | Alvo(s) | Papel | Período (UTC, da 1ª à última chamada) | Ligação (fonte) |
|---|---|---|---|---|
| `a0ea8d85-32b4-43f3-9df8-daee447ed75b` | notepad-teste, notepad-reimpl | instalação do projeto, protocolos e análises dos dois notepads, especificação | 2026-10-13T10:41 → 10-22T01:09 | C3: escreve `registros/notepad-*/00`, `01` e `especificacao.md`; `rea` com `alvos/notepad-*` |
| `11ac3a8a-5fd1-47c7-802c-09bd0173e4c7` | blocos-a, blocos-b | sessão principal F5/F6: protocolos (commit `79ecf7d`), comparação com o gabarito e benchmark dos dois | 10-20T21:49 → 10-21T18:29 | C3: `Write` em `registros/blocos-*/02-benchmark.md`; C4 no `00-seguranca.md` |
| `539732ef-54db-4d77-b70b-1b9fa8e1252e` | blocos-a | análise cega | 10-21T14:44 → 10-21T23:52 | C3: `Write` em `registros/blocos-a/01` e `05`; `rea` com `alvos/blocos-a` |
| `c934e788-344c-4542-b95b-2e63a142c598` | blocos-b | análise cega | 10-21T14:53 → 14:58 | C3: `Write` em `registros/blocos-b/01` e `05` |
| `010a5dc0-4a86-40d6-92e3-93490949e520` | encaixe-1, encaixe-2 | U3 da F7: builds e protocolos de segurança | 10-23T20:52 → 10-24T09:20 | `docs/handoffs/2026-10-23-piloto-f7-u3.md` |
| `37f2850d-9437-4915-acba-c3fefa053e58` | encaixe-1 | análise cega com execução (U4a) | 10-24T09:50 → 10:03 | `docs/handoffs/2026-10-24-piloto-f7-u4a.md` |
| `329780a3-33d4-490f-bcd5-0baf67bada93` | encaixe-2 | análise cega com execução (U4b) | 10-24T10:04 → 13:21 | `docs/handoffs/2026-10-24-piloto-f7-u4b.md` |
| `cfb67beb-1c4d-4280-869e-a628f4cd99f8` | encaixe-1, encaixe-2 | U5: comparação com o gabarito, review, demo | 10-24T13:31 → 10-26T12:29 | `docs/handoffs/2026-10-24-piloto-f7-u5.md` |
| `3ce1f2dc-3a2e-4288-add4-c2282ef351c5` | encaixe-1, encaixe-2 (e orquestração do uo-classic) | sessão principal da F7 (CLI de `local_e6556b0c…`): benchmark dos encaixes em 10-26 | 10-23T14:44 → 11-01T12:49 | `docs/handoffs/2026-10-23-piloto-f7-u0.md`; C3: `Write` em `registros/encaixe-*/02-benchmark.md` |
| `70fe6080-27b7-4d82-a555-39f17b264ea8` | uo-classic | protocolo de segurança (10-26) e adendo 1 (10-28, retomada) | 10-26T17:56 → 10-28T12:29 | `docs/handoffs/2026-10-26-uo-classic-protocolo.md`, `…-adendo-cliente.md` |
| `60927a1c-a991-45d1-9c07-552f677409e3` | uo-classic | Fase 0, pesquisa pública, especificação | 10-27T17:58 → 10-28T12:34 | `docs/handoffs/2026-10-28-uo-classic-pesquisa-especificacao.md` |
| `93130452-4322-44f1-8a22-bcdae2c35d11` | uo-classic | análise N0/N1, três reaberturas, benchmark | 10-28T13:04 → 10-29T15:24 | `docs/handoffs/2026-10-28-uo-classic-analise.md`; C3: `Write`/`Edit` em `registros/uo-classic/` |

Fora do levantamento: as sessões do bloco 5 do PRKing Notepad (`97ff0c40`, `e33453b2`, `d94ed5ff`, `e74a3881`, `c4cdf0e6`, `3922557d`) e as U1/U2 da F7 (`a4ee2ed4`, `f9e0f330`) trabalham em `reimplementacoes/`, não num alvo; nenhuma chama `rea` nem `ghidra` (C3). As sessões curtas `0cc23da1`, `2ae92520`, `41a3fc38`, `91e32ce5`, `623b8a64`, `47390d5a` e `3dba7098` não escrevem em `registros/` nem tocam alvo (C3).

## 2. Perfil de cada alvo (tipo, objetivo, complexidade)

### 2.1 Tipo e objetivo

| Alvo | Tipo (fonte) | Objetivo declarado (fonte) | Protocolos que o objetivo acionou (registros existentes) |
|---|---|---|---|
| notepad-teste | Nativo Windows: PE x86-64, executável único de 200.704 bytes, assinado (`00-seguranca.md` §2) | Treino: validar GhidraMCP + REA com Ghidra + gate (`00` §1) | segurança, análise (`00`, `01`); benchmark dispensado (`01`, encerramento) |
| notepad-reimpl | Nativo Windows: PE x86-64 + PE só de recursos (`.mui` pt-BR) (`00` §2) | Comportamento para especificação de reimplementação em sala limpa (`00` §1) | segurança, análise, especificação (`00`, `01`, `especificacao.md`, `roteiro-confirmacao.md`); sem benchmark (`01`) |
| blocos-a | JavaScript ESM (Node), 16 arquivos de texto, 31.572 bytes, sem UI (`00` §2) | Monetização, só pelo build, análise cega (`00` §1) | segurança, análise, monetização, benchmark (`00`, `01`, `05`, `02`) |
| blocos-b | JavaScript ESM (Node), 15 arquivos, 29.746 bytes, sem UI (`00` §2) | Idem (`00` §1) | idem |
| encaixe-1 | JavaScript ESM web: HTML + CSS + canvas, 24 arquivos, 57.225 bytes, servidor estático próprio em 127.0.0.1 (`00` §2) | Monetização com estado de execução pelo navegador, análise cega (`00` §1) | segurança, análise, monetização, benchmark (`00`, `01`, `05`, `02`) |
| encaixe-2 | Idem: 23 arquivos, 54.666 bytes (`00` §2) | Idem (`00` §1) | idem |
| uo-classic | Nativo Windows: PE32 x86 (MSVC 2005 a 2015+), 9 PE no cliente, mais formatos de dados próprios (`.mul`, `.uop`, `.idx`); jogo online com servidor oficial (`00` §2 e Adendo 1) | Patcher (configuração, manifesto, integridade) e, pelo Adendo 1, cliente e formatos de dados; depois especificação para reimplementação externa (`00` §1, Adendos; `especificacao.md`; `CLAUDE.md` item 8) | segurança, análise, especificação, benchmark (`00`, `01`, `especificacao.md`, `02`) |

### 2.2 Complexidade: medidas disponíveis

Nenhum registro tem um campo de complexidade. Abaixo, as medidas que a triagem passiva já traz (colunas 2 a 4) e as que só se conhecem depois da análise (colunas 5 a 8).

| Alvo | Arquivos | Tamanho | Código | Níveis aprovados | Sessões de análise | Chamadas `rea` + `ghidra` | Rodadas | Rótulo provisório (U1) |
|---|---|---|---|---|---|---|---|---|
| notepad-teste | 1 | 0,2 MB | 498 funções, 296 externas (`01` P1) | N0, N1 | 1 (trecho da a0ea8d85) | 7 + 5 | 1 | baixa |
| notepad-reimpl | 2 | 0,2 MB | mesmo binário; 66 strings de recurso (`01` P3) | N0, N1 | 1 (trecho da a0ea8d85) | 40 + 1 | 1; 33 evidências, 2 lacunas (`01` diário) | média |
| blocos-a | 16 | 31,6 KB | 14 JS analisados (`01` diário) | N0, N1 | 1 | 12 + 0 | 1; 10 registros, 6 lacunas | baixa |
| blocos-b | 15 | 29,7 KB | 13 JS analisados (`01` diário) | N0, N1 | 1 | 10 + 0 | 1; 9 registros, 6 lacunas | baixa |
| encaixe-1 | 24 | 57,2 KB | 20 módulos (`01` diário) | N0–N3 | 1 | 9 + 0 | 1; 3 lacunas | baixa, com execução |
| encaixe-2 | 23 | 54,7 KB | 19 `.mjs` (`00` §2) | N0–N3 | 1 | 10 + 0 | 1; 4 lacunas | baixa, com execução |
| uo-classic | 8 (patcher) → 522 (cliente) | 0,9 MB → 2.633 MB | 9 PE de 3,6 MB a 20 KB; 70 `.mul`, 23 `.uop` (`00` Adendo 1) | N0, N1 (N2+ vetado pelos termos) | 3 sessões + orquestração | 190 + 1 | 1 análise + 3 reaberturas (`01` diário) | alta |

Fontes das colunas 6 a 8: seções 1 e 3 deste documento (C1, C3). Os rótulos da última coluna são juízo desta unidade, para a U2 testar contra critérios; não são critério.

## 3. Recursos realmente usados

### 3.1 Famílias de tools usadas

| Família | Nível (`rea-niveis.json`) | Tools usadas em algum alvo |
|---|---|---|
| REA · sessão e evidência | N0 | `close_binary`, `binary_session`, `export_evidence_bundle`, `import_evidence_bundle`, `record_unknown`, `update_unknown`, `list_unknowns` |
| REA · nativo estático | N1 | `open_binary`, `binary_overview`, `procedure_pseudo_code`, `procedure_callers`, `procedure_callees`, `procedure_assembly`, `xrefs`, `find_xrefs_to_name`, `search_strings`, `search_procedures`, `resolve_containing_procedure`, `read_bytes`, `list_names` |
| REA · recursos e assinatura PE | N1 | `inspect_pe_resources`, `inspect_signature` |
| REA · JavaScript estático | N1 (`analyze_…`), N0 (`trace_…`) | `analyze_javascript_application`, `trace_javascript_semantics` |
| REA · navegador | N2 (`list_browser_targets`), N3 (`capture_browser_scenario`) | `list_browser_targets`, `capture_browser_scenario` |
| GhidraMCP (servidor `ghidra`) | N1 (`ghidra-niveis.json`) | `get_program_info`, `list_strings`, `decompile_function_by_address`, `get_xrefs_to`, `rename_function_by_address` |

São 26 tools distintas do REA (das 170 do catálogo) e 5 do GhidraMCP (das 30), somando os 7 alvos (C1).

### 3.2 Uso por alvo

Contagens de chamadas. "Sessão/evid." = família sessão e evidência.

| Alvo | Sessão: janela | REA por família | Ghidra | Protocolos e skills | Subagentes | Outros recursos |
|---|---|---|---|---|---|---|
| notepad-teste | a0ea8d85: 2026-10-14T10:53 → 10-15T21:22 | sessão/evid. 3 (`export` 2, `close` 1); nativo 3 (`open_binary` 2, `binary_overview` 1); navegador 1 (`list_browser_targets`, recusado pelo gate de propósito, `01` P5). Total 7 | 5 (uma de cada tool da tabela 3.1) | `Skill` `protocolo-seguranca` 1 | 0 na análise (1 `aiox-devops` para push na janela) | — |
| notepad-reimpl | a0ea8d85: 10-15T21:49 → 22:03 | sessão/evid. 7 (`record_unknown` 5, `export` 1, `close` 1); nativo 31 (`procedure_pseudo_code` 13, `find_xrefs_to_name` 5, `search_strings` 3, `procedure_callers` 3, `xrefs` 2, `open_binary`, `search_procedures`, `resolve_containing_procedure`, `procedure_callees`, `read_bytes` 1 cada); PE 2 (`inspect_pe_resources`). Total 40 | 1 (`get_program_info`) | nenhuma `Skill` (o protocolo de segurança do alvo não carregou a skill); script próprio `scripts/re/decodificar-recursos-pe.py` (`01` diário) | 0 | — |
| blocos-a | 539732ef (análise); 11ac3a8a (benchmark, 10-21T18) | sessão/evid. 9 (`record_unknown` 6, `export` 2, `list_unknowns` 1); JS 3 (`analyze` 1, `trace` 2). Total 12 | 0 | 539732ef: `protocolo-monetizacao` 1, `protocolo-benchmark` 1 (sem produto: ver 4.2); 11ac3a8a: `protocolo-benchmark` 1 (os dois blocos); `protocolo-seguranca` não invocado nem lido (C3) | 0 | benchmark (11ac3a8a, 10-21T18): `WebSearch` 2; Engram `vault_query` 1, `vault_save` 2 — compartilhados com blocos-b |
| blocos-b | c934e788 (análise); 11ac3a8a (benchmark) | sessão/evid. 8 (`record_unknown` 6, `list_unknowns` 1, `export` 1); JS 2 (`analyze` 1, `trace` 1). Total 10 | 0 | `protocolo-monetizacao` 1; benchmark como em blocos-a | 0 | idem blocos-a |
| encaixe-1 | 010a5dc0 (protocolo); 37f2850d (análise); cfb67beb (comparação); 3ce1f2dc (benchmark, 10-26T14) | sessão/evid. 5 (`record_unknown` 3, `list_unknowns` 1, `export` 1); JS 1; navegador 3 (`capture_browser_scenario`, N3). Total 9 | 0 | 010a5dc0: `protocolo-seguranca` 1, `update-config` 1 (regra `deny` da cegueira); 37f2850d: `protocolo-monetizacao` 1; cfb67beb: leitura do `SKILL.md` de `protocolo-monetizacao` 1, `code-review` 1; 3ce1f2dc: `protocolo-benchmark` 1 (os dois encaixes) | cfb67beb: `aiox-dev` 1 (QA loop, não análise) | benchmark (3ce1f2dc, 10-26T14): `WebSearch` 4, Engram `query` 1, `save` 2, `update` 1 — compartilhados com encaixe-2. Navegador embutido na cfb67beb (49) foi a demo do construtor, não análise do alvo (`docs/handoffs/2026-10-24-piloto-f7-u5.md`) |
| encaixe-2 | 010a5dc0; 329780a3 (análise); cfb67beb; 3ce1f2dc | sessão/evid. 6 (`record_unknown` 4, `list_unknowns` 1, `export` 1); JS 1; navegador 3 (N3). Total 10 | 0 | 329780a3: nenhuma `Skill`; `SKILL.md` de `protocolo-monetizacao` lido com `Read` 1; demais como encaixe-1 | 0 | idem encaixe-1 |
| uo-classic | 70fe6080 (protocolo, adendo 1); 60927a1c (pesquisa, especificação); 93130452 (análise, reaberturas, benchmark) | sessão/evid. 59 (`update_unknown` 17, `record_unknown` 11, `list_unknowns` 10, `export` 8, `import` 6, `close` 4, `binary_session` 3); nativo 127 (`procedure_pseudo_code` 48, `xrefs` 26, `resolve_containing_procedure` 18, `open_binary` 13, `search_strings` 11, `read_bytes` 4, `procedure_assembly` 3, `binary_overview`, `list_names`, `find_xrefs_to_name`, `search_procedures` 1 cada); PE 4 (`inspect_pe_resources` 3, `inspect_signature` 1). Total 190 | 1 (`get_program_info`, sem backend: Ghidra GUI fechado, `01` diário 10-28) | 70fe6080: `protocolo-seguranca` 1; 60927a1c: `fase-0` 1; 93130452: `protocolo-benchmark` 2 (o 1º gerou o benchmark revertido em `48ee0e3`), leitura do `SKILL.md` de `reverse-engineer-anything` 1 | 60927a1c: `aiox-analyst` 4 (pesquisa pública) | 70fe6080: navegador embutido 2 (`preview_start`, `get_page_text`); 60927a1c: `WebFetch` 431, `WebSearch` 83 (quase tudo nos subagentes), Engram `deep_query` 2; 93130452: Engram 14 (`query` 3, `save` 8, `update` 3), `WebSearch` 6 (benchmark); leitores próprios em Node em `saidas/uo-classic/scripts/` (`01` diário) |

Comandos: C1 nas sessões 539732ef, c934e788, 37f2850d, 329780a3, 93130452, 60927a1c, 70fe6080, 010a5dc0, 11ac3a8a; C3 com janela na a0ea8d85 (as duas janelas da coluna 2), na 11ac3a8a, na 3ce1f2dc e na cfb67beb.

Distribuição das 190 chamadas do uo-classic por hora (C3 na 93130452): 10-28T13 21 (análise inicial, com o benchmark depois revertido), T14 36, T16 37, T17 56, 10-29T13 9, T14 31 (terceira rodada). O primeiro benchmark é de 10-28T13; o segundo, de 10-29T15.

### 3.3 Custo das sessões (C2)

| Sessão | Alvo | Chamadas (principal / subagentes) | Contexto inicial / médio / máx. | Escrita de cache | Saída | Nomes de tools MCP deferred no prefixo |
|---|---|---|---|---|---|---|
| a0ea8d85 | notepads + instalação do projeto | 536 / 65 | 97k / 479k / 969k | 5,5M | 661k | 5k |
| 11ac3a8a | blocos (principal F5/F6) | 221 / 5 | 113k / 435k / 700k | 2,3M | 401k | 5k |
| 539732ef | blocos-a | 25 / 0 | 108k / 202k / 257k | 413k | 39k | 5k |
| c934e788 | blocos-b | 17 / 0 | 108k / 171k / 213k | 159k | 35k | 5k |
| 010a5dc0 | encaixe (protocolos) | 104 / 0 | 115k / 194k / 266k | 947k | 96k | 7k |
| 37f2850d | encaixe-1 | 44 / 0 | 92k / 189k / 256k | 256k | 57k | 6k |
| 329780a3 | encaixe-2 | 39 / 0 | 81k / 170k / 221k | 397k | 51k | 976 |
| cfb67beb | encaixe (comparação) | 175 / 60 | 93k / 181k / 264k | 773k | 150k | 6k |
| 3ce1f2dc | principal F7 (várias unidades) | 351 / 25 | 116k / 188k / 267k | 3,3M | 231k | 6k |
| 70fe6080 | uo-classic (protocolo) | 57 / 0 | 97k / 174k / 240k | 336k | 61k | 7k |
| 60927a1c | uo-classic (pesquisa, especificação) | 62 / 277 | 97k / 156k / 252k | 518k + 1,4M | 73k + 280k | 7k |
| 93130452 | uo-classic (análise) | 414 / 0 | 98k / 180k / 268k | 1,7M | 303k | 7k |

Na 329780a3, os nomes de tools deferred caem para 976 tokens; nas demais, 5k a 7k. O handoff da U5 registra que essa sessão pulou o toggle dos conectores, então eles provavelmente já nasceram desligados: o toggle do app vira padrão para sessões novas, e a 37f2850d tinha acabado de usá-lo. A causa não foi confirmada.

## 4. Recursos carregados e não usados

### 4.1 Servidores MCP e tools

| Recurso | Carregado em | Uso nas sessões de alvo | Fonte |
|---|---|---|---|
| Servidor `ghidra` (30 tools) | todas as sessões desde `b92a651` (2026-10-13, `.mcp.json`) | notepad-teste 5, notepad-reimpl 1, uo-classic 1 (sem backend); 0 nos 4 alvos JavaScript | C1, C4 |
| REA, 144 das 170 tools | todas | nunca chamadas em nenhum alvo. Inclui as 24 de Android (N4a 18, N4b 6), 12 das 13 de N2 (a única chamada, `list_browser_targets`, foi um teste de recusa do gate) e 4 das 5 de N3 | C1; contagem por nível em `.claude/hooks/rea-niveis.json` |
| REA, família nativa | todas | 0 nos 4 alvos JavaScript | 3.2 |
| REA, família JavaScript e navegador | todas | 0 nos 3 alvos nativos (fora o teste do gate no notepad-teste) | 3.2 |
| Navegador embutido | todas | uo-classic 2 (protocolo); 0 nas análises. A execução N3 dos encaixes foi feita pelo `capture_browser_scenario` do REA, não pelo navegador embutido | C3 |
| Engram (6 tools) | todas | 0 nas 4 sessões de análise cega e nas duas janelas dos notepads; usado em Fase 0, benchmark e fechamento (60927a1c, 93130452, 11ac3a8a, 3ce1f2dc) | C2, C3 |
| Conectores do claude.ai (10 a 11 servidores) | todas, menos a 329780a3 no início | 0 chamadas de tool de conector em sessão de alvo; só o toggle (`ccd_connectors`) | C1 (`mcp`) |

### 4.2 Protocolos e skills

| Recurso | Disponível desde | Uso | Fonte |
|---|---|---|---|
| `protocolo-mecanicas` | `ffdb28c` (2026-10-13) | 0 em todos os alvos, inclusive os 5 jogos (blocos, encaixe, uo-classic). Não há `03-mecanicas.md` em nenhum registro | C1, C3, C4; `ls registros/*/` |
| `protocolo-assets` | `a43f2cd` (2026-10-13) | 0 em todos os alvos; não há `04-assets.md` | idem |
| `protocolo-monetizacao` | `9a0da9d` (2026-10-20) | usado nos 4 alvos de piloto; não usado no uo-classic, cujo objetivo não pedia | 3.2 |
| `reverse-engineer-anything` | `c65d56f` (2026-10-13) | só 1 leitura do `SKILL.md`, no uo-classic (93130452); nunca invocada pelo `Skill` | C3 |
| `protocolo-benchmark` | `c65d56f` | invocado 1 vez sem produto (539732ef, 10-21T23:52: o benchmark do blocos-a já estava no commit `50cc36a`) e 1 vez com produto revertido (93130452, 10-28T13; revertido em `48ee0e3`) | C3; `01-analise.md` do uo-classic, diário 10-28 |
| `protocolo-seguranca` | `c65d56f` | 3 invocações para 4 dos 7 alvos: notepad-teste, encaixe-1 e encaixe-2 (uma invocação para os dois) e uo-classic (o adendo 1, na mesma sessão retomada, não reinvocou). Não invocado nem lido no notepad-reimpl e nos dois blocos | C3 |
| `protocolo-especificacao` | `0146a94` (2026-11-01) | posterior a todos os alvos | C4 |

## 5. Observações para a U2

Fatos tirados das seções acima. O que é proposta está marcado como hipótese.

1. **O tipo do alvo separou as famílias sem exceção.** Nativo usou só sessão/evid., nativo estático, PE e GhidraMCP; JavaScript usou só sessão/evid., JavaScript e navegador (seção 3.2). A família sessão e evidência apareceu em todos os 7.
2. **O nível aprovado separou o navegador.** `capture_browser_scenario` só apareceu onde N3 foi aprovado (encaixe-1 e encaixe-2).
3. **O objetivo decidiu os protocolos, mas o inverso não vale.** Monetização ⇒ `protocolo-monetizacao` nos 4 pilotos. Mecânicas e assets nunca foram pedidos, nem nos jogos: no histórico, "é jogo" não implicou esses protocolos.
4. **Benchmark tem perfil próprio de recursos:** `WebSearch` (2 a 6 por benchmark) e Engram (`query` + `save`), nenhuma tool `rea`. Ele roda na sessão principal, não na sessão de análise (blocos, encaixe), salvo no uo-classic.
5. **A complexidade apareceu como rodadas, não como chamadas por rodada.** O uo-classic teve 1 análise e 3 reaberturas (190 chamadas); os pilotos JavaScript, 1 rodada de 9 a 12 chamadas. O tamanho na triagem (2,6 GB × 30–57 KB) já separava os dois extremos. Hipótese para a U2: número de arquivos executáveis e tamanho total como critérios de triagem.
6. **Retrabalho visível:** 2 invocações de `protocolo-benchmark` sem produto final (seção 4.2), 1 chamada `ghidra` sem backend e a perda do store do REA em reconexões no uo-classic (`01` diário). São candidatos à métrica de qualidade da U4.
7. **Pesquisa pública só no uo-classic** (60927a1c: 4 subagentes `aiox-analyst`, 514 chamadas web). Os alvos de piloto não usaram subagentes na análise.
8. **Sem dado para os tipos** .NET/Unity, Unreal, Electron real, web real, Android e firmware: nenhum alvo registrado. Pela regra da Fase 0, eles entram no catálogo como hipótese.

## Apêndice A — `linha.js` (C3)

Script desta unidade, sem dependências. Gravar em qualquer pasta fora do repositório e rodar `node linha.js "$P/<id>.jsonl"`. Saída: `timestamp tool slug`.

```js
const fs = require("fs"), readline = require("readline");
const ids = new Set();
(async () => {
  const rl = readline.createInterface({ input: fs.createReadStream(process.argv[2]), crlfDelay: Infinity });
  for await (const l of rl) {
    if (!l.includes('"tool_use"')) continue;
    let ev; try { ev = JSON.parse(l); } catch { continue; }
    const c = ev.message && ev.message.content;
    if (!Array.isArray(c)) continue;
    for (const t of c) {
      if (!t || t.type !== "tool_use" || ids.has(t.id)) continue;
      ids.add(t.id);
      const nm = t.name || "", inp = JSON.stringify(t.input || {}).split("\\\\").join("/");
      const fp = ((t.input && (t.input.file_path || t.input.path)) || "").split("\\").join("/");
      let out = null;
      if (/^mcp__(rea|ghidra|engram|Claude_Browser)__/.test(nm)) out = nm.replace("mcp__", "");
      else if (nm === "Skill") out = "Skill:" + (t.input && t.input.skill);
      else if (nm === "Agent" || nm === "Task") out = "Agent:" + (t.input && t.input.subagent_type);
      else if (nm === "Read" && /skills\/[^/]+\/SKILL\.md$/.test(fp)) out = "ReadSkill:" + fp.match(/skills\/([^/]+)\/SKILL\.md$/)[1];
      else if (/^(Write|Edit)$/.test(nm) && /registros\/[a-z0-9-]+\//.test(fp)) out = nm + ":" + fp.match(/registros\/(.+)$/)[1];
      else if (/^Web(Search|Fetch)$/.test(nm)) out = nm;
      if (!out) continue;
      const slug = (inp.match(/(?:alvos|saidas|registros)\/([a-z0-9-]+)/) || [])[1] || "";
      console.log(ev.timestamp.slice(0, 16), out, slug);
    }
  }
})();
```
