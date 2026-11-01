# Cobertura — pacote sugerido × uso real nos 7 alvos (U3)

<!--
Unidade U3 do plano docs/plano-de-execucao.md (piloto "perfil do alvo e pacote de recursos").
Cita alvos de piloto (blocos-*, encaixe-*): fica em docs/planos/, que a lista de cegueira exclui.
Nada daqui vai para o catálogo, que sessões cegas podem ler, além das regras gerais da seção 1.
-->

**Data:** 2026-11-01 · **Executor:** @dev (SDC, YOLO) · **Base:** `main` @ `b175d54` · **Catálogo:** `docs/catalogo-perfis-alvo.md` v0.1 · **Uso real:** `docs/planos/2026-11-01-perfis-alvo-calibracao.md` (U1)

Aplicação do catálogo no papel: cada alvo recebe o perfil que o protocolo de segurança novo daria (seção 7 do `00-seguranca.md`), o pacote é composto pelas regras C1 a C9 e pelas decisões da seção 1, e cada recurso que o alvo realmente usou é procurado no pacote. Nada de `alvos/` foi aberto e nenhuma tool `rea` ou `ghidra` foi chamada.

## 0. Método

- **Perfil.** Tipo, objetivo e complexidade saem do `00-seguranca.md` de cada alvo (frontmatter, §1, §2 e adendos) e da U1 §2. Os critérios K1 a K5 usam só os números que a triagem registrou.
- **Uso real.** Contagens da U1 §3.2 e §4, sem recontar. Única conferência nova: nas sessões `37f2850d` e `329780a3`, a chamada da família JavaScript foi `analyze_javascript_application` (contagem deduplicada por id da chamada, com o mesmo método do `linha.js` da U1). Os nomes `inspect_web_page` e `observe_web_session` aparecem no transcript, mas fora de chamadas.
- **Janela.** O pacote vale por janela de trabalho, não por sessão (decisão D2).
- **Escopo.** Só recursos de análise do alvo. Os operacionais ficam fora (decisão D1b).
- **Reprodução.** O script da seção 6 refaz a checagem das tools MCP e a fração em "não carregar". Protocolos, skills e servidores foram conferidos à mão, linha a linha, contra o catálogo.

## 1. Decisões da U3

| # | Decisão | Motivo | Onde ficou |
|---|---|---|---|
| D1a | **Teste de controle não conta como uso.** Chamada feita para conferir que o gate recusa (no histórico, um `list_browser_targets` N2 num alvo nativo de treino, recusado antes de executar) fica fora do pacote de propósito e vai ao diário como "teste de controle" | O objetivo daquele alvo era validar o gate (`registros/notepad-teste/00-seguranca.md` §1; `01-analise.md` P5). Pôr o navegador no pacote de `nativo-pe` para cobrir o teste ensinaria a carregar uma família que nenhum alvo nativo usou | Modelo `00-seguranca.md` §7 (última frase) |
| D1b | **Recursos operacionais ficam fora do perfil.** Commit e push pelo @devops (`aiox-devops`), configuração do Claude Code (`update-config`, regra `deny` da cegueira), revisão de código (`code-review`), QA loop (`aiox-dev`) e a demo de uma reimplementação no navegador embutido não entram no pacote, na cobertura nem no registro C8 | Não respondem pergunta sobre o alvo. Dependem do fluxo do projeto, e não do tipo, do objetivo ou da complexidade. Aparecem na seção 3 como "fora do escopo", sem estado | Modelo §7 |
| D2 | **O pacote `benchmark` se soma à janela do benchmark, em qualquer sessão.** A janela começa quando o `01-analise.md` fica `concluida` e o responsável diz "sim". C7 continua dizendo "de preferência a sessão principal" | Num alvo nativo, o benchmark rodou na sessão da análise, depois da conclusão (`registros/uo-classic/01-analise.md`, diário de 2026-10-28). Proibir isso tiraria do pacote um uso legítimo. Invocação antes da conclusão continua fora do pacote | Esta seção; proposta para o catálogo v0.2 (seção 5) |
| D3 | **`especificacao` sobe a profundidade um nível (até alta), sem mudar a complexidade de triagem.** Grau `hip` (1 alvo) | Os dois alvos nativos pequenos têm a mesma complexidade de triagem (baixa). O que tinha objetivo de especificação fez 41 chamadas `rea` + `ghidra` contra 12, registrou 33 evidências e escreveu um roteiro de confirmação, que é o "roteiro de perguntas" do pacote médio (U1 §2.2, §3.2). A U1 tinha rotulado esse alvo como "média", e o catálogo §7 pediu esta decisão. Efeito: só acrescenta itens "sob demanda" (`import_evidence_bundle`, `snapshot_path`, leitores próprios, `Explore`), o lado seguro da C3 | Campo "Profundidade" no modelo §7; passo 4 do perfil na skill `protocolo-seguranca` §2 |
| D4 | **A seção do perfil é preenchida em dois momentos.** Eixos no fim da triagem; pacote depois da decisão, com os níveis aprovados | Ao aplicar a C4 no papel, os desvios dependem de `niveis_aprovados`, que só existem na decisão (§6 do protocolo). Ajuste em relação ao catálogo §6: campos novos "Profundidade" e "Recalculado em" (C9), e as três listas do pacote | Modelo §7; skill §2, §6 (passo 4) e §7 (passo 4) |
| D5 | **Recurso que nenhum pacote cita conta como fora do pacote.** Para a fração, ele soma com "não carregar" | O catálogo lista famílias, não as 200 tools uma a uma. Sem essa regra, a maior parte do REA ficaria sem estado | Modelo §7; seção 4 |

## 2. Perfil de cada alvo

| Alvo | Tipo (marcador) | `jogo` | Objetivos | Complexidade de triagem (K1–K5) | Profundidade | Níveis | Desvios (C4–C6) |
|---|---|---|---|---|---|---|---|
| notepad-teste | `nativo-pe` (`MZ`, sem marcador de Unity, Unreal ou .NET) | não | `analise` (treino da cadeia GhidraMCP + REA + gate) | baixa: K1 1, K2 0, K3 0,2 MB, K4 não, K5 não | baixa | N0, N1 | UI nativa (N2, N3): sob demanda por adendo (C4) |
| notepad-reimpl | `nativo-pe` | não | `analise`, `especificacao` | baixa: K1 1 (o `.mui` é PE só de recursos), K3 0,2 MB, K4 e K5 não | média (D3) | N0, N1 | idem |
| blocos-a | `js-estatico` (só `.js`, sem PE) | sim | `analise`, `monetizacao`; `benchmark` depois | baixa: K1 0, K2 até 16 arquivos, K3 31,6 KB | baixa | N0, N1 | navegador (N2, N3): sob demanda por adendo (C4) |
| blocos-b | `js-estatico` | sim | idem | baixa: K2 até 15, K3 29,7 KB | baixa | N0, N1 | idem |
| encaixe-1 | `js-estatico` (HTML + JS servido em `127.0.0.1`) | sim | idem | baixa: K2 até 24, K3 57,2 KB | baixa | N0–N3 | nenhum: N2 e N3 aprovados; N3 com confirmação a cada chamada |
| encaixe-2 | `js-estatico` | sim | idem | baixa: K2 até 23, K3 54,7 KB | baixa | N0–N3 | nenhum |
| uo-classic | `nativo-pe` (PE32 x86, engine própria) | sim; online com servidor oficial | `analise`, `especificacao`; `benchmark` depois | alta, recalculada no Adendo 1 (C9): K1 9 PE, K3 2.633 MB, K4 sim (`.mul`, `.uop`, `.idx`). Na triagem inicial, só o patcher: 8 arquivos, 0,9 MB | alta | N0, N1 (N2+ vetado pelos termos) | UI nativa e pilha dinâmica: não carregar (C5, jogo online com servidor oficial; termos) |

Todos C1 e não confidenciais, então a C5 não derruba a pesquisa externa em nenhum deles.

## 3. Cobertura por alvo

Estados: **A** ativo, **O** obrigatório, **S** sob demanda, **N** não carregar, **E** exceção (D1a), **—** fora do escopo (D1b).

### notepad-teste — janela `a0ea8d85`, 2026-10-14 → 10-15

| Recurso usado | Uso | Estado | Origem no pacote |
|---|---|---|---|
| REA · sessão e evidência (`export_evidence_bundle` 2, `close_binary` 1) | 3 | A | base; `export` no fim (profundidade baixa) |
| REA · nativo estático (`open_binary` 2, `binary_overview` 1) | 3 | A | tipo `nativo-pe` |
| Servidor `ghidra` (5 tools diferentes) | 5 | A | tipo `nativo-pe` |
| Skill `protocolo-seguranca` | 1 | O | base |
| `list_browser_targets` (N2, recusado pelo gate) | 1 | **E** | estaria em N (tipo `nativo-pe`); D1a |
| Subagente `aiox-devops` (push) | 1 | — | D1b |

### notepad-reimpl — janela `a0ea8d85`, 2026-10-15T21:49 → 22:03

| Recurso usado | Uso | Estado | Origem no pacote |
|---|---|---|---|
| REA · sessão e evidência (`record_unknown` 5, `export` 1, `close` 1) | 7 | A | base |
| REA · nativo estático (10 tools diferentes) | 31 | A | tipo `nativo-pe` |
| REA · recursos PE (`inspect_pe_resources`) | 2 | A | tipo `nativo-pe` |
| Servidor `ghidra` (`get_program_info`) | 1 | A | tipo `nativo-pe` |
| Leitor próprio `scripts/re/decodificar-recursos-pe.py` | usado | S | tipo `nativo-pe`; profundidade média |
| Registro `00-seguranca.md` (feito sem invocar a skill) | 1 | O | base |

### blocos-a e blocos-b — análise em `539732ef` (a) e `c934e788` (b); benchmark em `11ac3a8a`, 2026-10-21T18

| Recurso usado | Uso (a / b) | Estado | Origem no pacote |
|---|---|---|---|
| REA · sessão e evidência (`record_unknown`, `export`, `list_unknowns`) | 9 / 8 | A | base; `export` no fim |
| REA · JavaScript estático (`analyze_…` 1, `trace_…` 2 / 1) | 3 / 2 | A | tipo `js-estatico` |
| Skill `protocolo-monetizacao` | 1 / 1 | A | objetivo `monetizacao` |
| Skill `protocolo-benchmark` na sessão de análise, quando o benchmark já estava commitado (`50cc36a`) | 1 / 0 | A | objetivo `benchmark` (D2). O pacote manda conferir antes se o `02-benchmark.md` existe: a invocação é retrabalho, não falta de cobertura |
| Benchmark (`11ac3a8a`): `protocolo-benchmark` 1, `WebSearch` 2, Engram `query` 1 e `save` 2, compartilhados | 6 | A | objetivo `benchmark` |
| Registro `00-seguranca.md` (feito sem invocar a skill) | 1 / 1 | O | base |

### encaixe-1 e encaixe-2 — protocolo em `010a5dc0`; análise em `37f2850d` (1) e `329780a3` (2); comparação em `cfb67beb`; benchmark em `3ce1f2dc`, 2026-10-26T14

| Recurso usado | Uso (1 / 2) | Estado | Origem no pacote |
|---|---|---|---|
| Skill `protocolo-seguranca` (uma invocação para os dois) | 1 | O | base |
| REA · sessão e evidência (`record_unknown`, `list_unknowns`, `export`) | 5 / 6 | A | base |
| REA · JavaScript estático (`analyze_javascript_application`) | 1 / 1 | A | tipo `js-estatico` |
| `capture_browser_scenario` (N3, aprovado) | 3 / 3 | S | tipo `js-estatico` (objetivo pede execução, nível aprovado); objetivo `monetizacao` (estado de execução) |
| `protocolo-monetizacao` (encaixe-1: `Skill`; encaixe-2: leitura do `SKILL.md`; e uma leitura na comparação) | 2 / 1 | A | objetivo `monetizacao` |
| Benchmark (`3ce1f2dc`): `protocolo-benchmark` 1, `WebSearch` 4, Engram `query` 1, `save` 2 e `update` 1, compartilhados | 9 | A | objetivo `benchmark` |
| `update-config` (regra `deny` da cegueira), `code-review`, subagente `aiox-dev` (QA loop), navegador embutido na demo (49) | 1, 1, 1, 49 | — | D1b |

### uo-classic — protocolo em `70fe6080`; pesquisa e especificação em `60927a1c`; análise, reaberturas e benchmark em `93130452`

| Recurso usado | Uso | Estado | Origem no pacote |
|---|---|---|---|
| Skill `protocolo-seguranca` | 1 | O | base |
| Navegador embutido no protocolo (`preview_start`, `get_page_text`) | 2 | S | base (sob demanda no protocolo de segurança) |
| Skill `fase-0` | 1 | S | objetivo `especificacao` |
| Subagentes `aiox-analyst` (pesquisa pública, sessão própria, alvo não confidencial) | 4 | S | objetivo `especificacao` |
| `WebFetch` 431 e `WebSearch` 83, quase tudo nos subagentes | 514 | S | objetivo `especificacao` (pesquisa pública), que vence o N de `analise` pela C3 |
| Engram na pesquisa (`deep_query`) | 2 | S | objetivo `especificacao` |
| REA · sessão e evidência (7 tools, com `import_evidence_bundle` 6 e `export` 8) | 59 | A | base; `export` a cada rodada e `import` ao retomar (profundidade alta) |
| REA · nativo estático (11 tools diferentes) | 127 | A | tipo `nativo-pe` |
| REA · recursos e assinatura PE | 4 | A | tipo `nativo-pe` |
| Servidor `ghidra` (`get_program_info`, sem backend) | 1 | A | tipo `nativo-pe`. O pacote pede o Ghidra aberto antes da 1ª chamada: retrabalho, não falta de cobertura |
| Leitores próprios em Node (`saidas/uo-classic/scripts/`) | usado | S | tipo `nativo-pe`; profundidade alta |
| Leitura do `SKILL.md` de `reverse-engineer-anything` | 1 | S | objetivo `analise` |
| Engram na análise (`query` 3, `save` 8, `update` 3) | 14 | S / A | objetivo `especificacao` (S); na janela do benchmark, objetivo `benchmark` (A) |
| `protocolo-benchmark` (o 1º gerou o benchmark revertido em `48ee0e3`, depois que o responsável reabriu a análise) | 2 | A | objetivo `benchmark` (D2) |
| `WebSearch` no benchmark | 6 | A | objetivo `benchmark` |

## 4. Resultado

### 4.1 Cobertura

| Alvo | Recursos de análise usados (linhas) | Cobertos (A, O ou S) | Em "não carregar" | Exceções (D1a) | Fora do escopo (D1b) |
|---|---|---|---|---|---|
| notepad-teste | 4 | 4 | 0 | 1 | 1 |
| notepad-reimpl | 6 | 6 | 0 | 0 | 0 |
| blocos-a | 6 | 6 | 0 | 0 | 0 |
| blocos-b | 5 | 5 | 0 | 0 | 0 |
| encaixe-1 | 6 | 6 | 0 | 0 | 4 |
| encaixe-2 | 6 | 6 | 0 | 0 | 4 |
| uo-classic | 15 | 15 | 0 | 0 | 0 |

**Cobertura de 100%.** Nenhum recurso de análise realmente usado cai em "não carregar". A única chamada que cairia lá é o teste de controle do gate (D1a). As 26 tools distintas do REA e as 5 do GhidraMCP que a U1 contou estão todas no pacote do alvo que as usou (script da seção 6: `fora 0` nos 7 alvos).

Sem a D3, o resultado não muda: o único recurso que a profundidade média acrescentaria ao alvo com especificação (o leitor próprio) já é "sob demanda" pelo tipo `nativo-pe`. A D3 muda a orientação, não a cobertura.

### 4.2 Fração em "não carregar"

**Tools MCP** (170 do REA + 30 do GhidraMCP = 200). "Não carregar" inclui as tools que nenhum pacote cita (D5).

| Perfil | Alvos | No pacote (A, O ou S) | Não carregar | Fração | Tools distintas usadas / no pacote |
|---|---|---|---|---|---|
| `nativo-pe`, profundidade baixa ou média | notepad-teste, notepad-reimpl | 24 do REA + 30 do Ghidra = 54 | 146 | **73,0%** | 9/54 e 15/54 |
| `nativo-pe`, profundidade alta | uo-classic | 26 + 30 = 56 | 144 | **72,0%** | 21/56 |
| `js-estatico`, profundidade baixa | blocos-a, blocos-b, encaixe-1, encaixe-2 | 12 + 0 = 12 | 188 | **94,0%** | 5/12 em cada |

Só no REA: 85,9% (nativo baixa ou média), 84,7% (nativo alta) e 92,9% (JavaScript). O Ghidra entra inteiro nos pacotes nativos, mas só 5 das 30 tools foram usadas.

**Protocolos do projeto** (7 skills: `protocolo-seguranca`, `-mecanicas`, `-assets`, `-monetizacao`, `-benchmark`, `-especificacao` e `reverse-engineer-anything`), somando a janela do benchmark:

| Alvo | No pacote | Não carregar | Fração |
|---|---|---|---|
| notepad-teste | `seguranca`, `reverse-engineer-anything` | 5 | 71% |
| notepad-reimpl | + `especificacao` | 4 | 57% |
| blocos-a, blocos-b, encaixe-1, encaixe-2 | `seguranca`, `reverse-engineer-anything`, `monetizacao`, `benchmark` | 3 (`mecanicas`, `assets`, `especificacao`) | 43% |
| uo-classic | `seguranca`, `reverse-engineer-anything`, `especificacao`, `benchmark` | 3 (`mecanicas`, `assets`, `monetizacao`) | 43% |

**Servidores e recursos externos** (estado na janela de análise): conectores do claude.ai em N nos 7; navegador embutido em S no protocolo e em N na análise nos 7; WebSearch e WebFetch em N na análise nos 6 sem especificação e em S no uo-classic e no notepad-reimpl; Engram em S no fechamento nos 7, e em A na janela do benchmark. O `ghidra` fica em N nos 4 alvos `js-estatico`.

### 4.3 O que fica para a U4

- **Ativo sem uso.** `protocolo-especificacao` está ativo nos dois alvos com especificação, mas a skill é posterior a eles. `inspect_analysis_view` (S) e as tools de lote (S, alta) nunca foram chamadas.
- **Retrabalho de base para comparar:** 2 invocações de `protocolo-benchmark` sem produto final (uma com o benchmark já commitado, outra revertida por reabertura) e 1 chamada `ghidra` sem backend. As condições que o pacote já traz ("conferir se o `02-benchmark.md` existe", "Ghidra aberto antes da 1ª chamada") teriam evitado duas das três.
- **Precisão do pacote** (tools usadas / no pacote): 17% a 42%. É o número que a U4 pode tentar subir sem baixar a cobertura.

## 5. Proposta para o catálogo v0.2

Não aplicada nesta unidade: o commit da U3 se limita aos arquivos dela. Quando o catálogo for revisado:

- **C7:** trocar o fim por "o pacote dele se soma à janela do benchmark, que começa com a análise concluída e o 'sim' do responsável, em qualquer sessão" (D2).
- **C10 nova:** "`especificacao` sobe a profundidade um nível, até alta; a complexidade de triagem não muda", com grau `hip` (D3).
- **§0.1:** "recurso que nenhum pacote cita conta como fora do pacote" (D5); testes de controle e recursos operacionais fora do perfil (D1a, D1b).
- **§6:** apontar para a seção 7 do modelo `00-seguranca.md` como formato final.

Nenhuma dessas frases cita alvo de piloto, e todas podem ir para o catálogo.

## 6. Reprodução

Na raiz do repositório, com o script salvo fora dele (`node <pasta>/cob.js`). As tools usadas de cada alvo são as da U1 §3.2. Saída esperada: `fora 0` e `inexistentes 0` nos 7; `exceções fora list_browser_targets` no notepad-teste; frações de 73,0%, 94,0% e 72,0%.

```js
const ler = f => require(process.cwd() + "/.claude/hooks/" + f).ferramentas;
const rea = Object.keys(ler("rea-niveis.json")), gh = Object.keys(ler("ghidra-niveis.json")).map(t => "ghidra:" + t);
const base = "record_unknown update_unknown list_unknowns export_evidence_bundle import_evidence_bundle binary_session close_binary";
const tipo = {
  "nativo-pe": "open_binary binary_overview procedure_pseudo_code xrefs find_xrefs_to_name search_strings search_procedures resolve_containing_procedure procedure_callers procedure_callees procedure_assembly read_bytes list_names inspect_pe_resources inspect_signature observe_native_ui capture_native_ui_scenario " + gh.join(" "),
  "js-estatico": "analyze_javascript_application trace_javascript_semantics inspect_analysis_view list_browser_targets capture_browser_scenario",
};
const prof = { baixa: "", "média": "", alta: "batch_decompile get_call_graph" };
const js = "record_unknown export_evidence_bundle list_unknowns analyze_javascript_application";
const alvos = [
  ["notepad-teste", "nativo-pe", "baixa", "export_evidence_bundle close_binary open_binary binary_overview ghidra:get_program_info ghidra:list_strings ghidra:decompile_function_by_address ghidra:get_xrefs_to ghidra:rename_function_by_address", "list_browser_targets"],
  ["notepad-reimpl", "nativo-pe", "média", "record_unknown export_evidence_bundle close_binary procedure_pseudo_code find_xrefs_to_name search_strings procedure_callers xrefs open_binary search_procedures resolve_containing_procedure procedure_callees read_bytes inspect_pe_resources ghidra:get_program_info", ""],
  ["blocos-a", "js-estatico", "baixa", js + " trace_javascript_semantics", ""],
  ["blocos-b", "js-estatico", "baixa", js + " trace_javascript_semantics", ""],
  ["encaixe-1", "js-estatico", "baixa", js + " capture_browser_scenario", ""],
  ["encaixe-2", "js-estatico", "baixa", js + " capture_browser_scenario", ""],
  ["uo-classic", "nativo-pe", "alta", "update_unknown record_unknown list_unknowns export_evidence_bundle import_evidence_bundle close_binary binary_session procedure_pseudo_code xrefs resolve_containing_procedure open_binary search_strings read_bytes procedure_assembly binary_overview list_names find_xrefs_to_name search_procedures inspect_pe_resources inspect_signature ghidra:get_program_info", ""],
];
const todas = new Set([...rea, ...gh]), lista = s => s.split(/\s+/).filter(Boolean);
for (const [a, t, p, usadas, excecao] of alvos) {
  const pac = new Set(lista(base + " " + tipo[t] + " " + prof[p]));
  const fora = lista(usadas).filter(x => !pac.has(x)), exc = lista(excecao).filter(x => !pac.has(x));
  const nRea = [...pac].filter(x => !x.startsWith("ghidra:")).length, nc = todas.size - pac.size;
  const inexistentes = [...pac].filter(x => !todas.has(x));
  console.log(`${a} | ${t} ${p} | fora ${fora.join(",") || 0} | exceções fora ${exc.join(",") || 0} | pacote rea ${nRea}/${rea.length} ghidra ${pac.size - nRea}/${gh.length} | não carregar ${nc}/${todas.size} = ${(100 * nc / todas.size).toFixed(1)}% | inexistentes ${inexistentes.join(",") || 0}`);
}
```
