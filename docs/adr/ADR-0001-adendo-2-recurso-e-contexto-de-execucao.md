# ADR-0001 — Adendo 2: `recurso`, `contexto_execucao` e a tabela C11

| Campo | Valor |
|---|---|
| Status | **Proposto** em 2026-11-05. O aceite é do responsável. Enquanto não for aceito, a P3 da story continua aberta e a P1 (aprovada com condições em 2026-11-05) não tem efeito |
| Data | 2026-11-05 |
| Autoria | @architect (Aria), a pedido do responsável (Q2 da story, 2026-11-04) |
| Altera | ADR-0001 §2a (valores de `recurso`, `contexto_execucao` e papel de `recurso_padrao`, linhas 87, 90, 94 e 95) e adendo 1 §3.1 (relação com `recurso`) e §4 (C1 ampliada; conteúdo da C11). Nenhum dos dois documentos é editado: continuam sendo a base |
| Story | `docs/stories/mel-05-fatia-2-contrato-e-atributos.story.md` (lacunas L1 e L4, pré-condição P3, Q2). Este adendo não edita a story |
| Decisões de origem | Q2 do responsável (story, seção "Decisões do responsável após a validação @po", 2026-11-04); DA-11 e DA-12 do adendo 1 |

## 1. Contexto

O adendo 1 deixou três pontos para a fatia 2 fechar:

- a lista de valores de `recurso` (ADR-0001:94, "a lista de valores fica a confirmar"; adendo 1 §3.1, última frase);
- a tabela de coerência `efeitos` × `recurso` da regra C11 (adendo 1 §4, DA-11). Só o par `usa_dispositivo` ⇄ "dispositivo" está decidido;
- os valores de `contexto_execucao` e a obrigatoriedade dos dois campos (lacuna L4 da story).

Sem isso, F2-AC5, F2-AC10 e F2-AC13 não são testáveis e os lotes L-1 a L-6 não começam (story, P3).

Na Q2, o responsável decidiu: `recurso` e `contexto_execucao` obrigatórios por tool; `contexto_execucao` numa lista fechada de 5 valores; `recurso_padrao` só como declaração do servidor; o @architect propõe a lista de `recurso` e a tabela C11 neste adendo. Este documento aplica essas decisões e propõe o resto. **Tudo o que não rastreia a uma tool real, ao adendo 1 ou a uma decisão do responsável está marcado "Proposta do @architect".**

## 2. Método e fontes

Leitura estática, sem chamar nenhuma tool `rea` ou `ghidra` e sem ler `alvos/` nem `saidas/`:

- **Os dois mapas:** nome e nível das 170 tools do REA (`rea-niveis.json:13-182`) e das 30 do Ghidra (`ghidra-niveis.json:14-43`), mais as definições de nível (`rea-niveis.json:5-10`) e a nota do Ghidra (`ghidra-niveis.json:4`).
- **O gate:** os casos de vínculo ao alvo que ele distingue (`rea-gate.mjs:9-13`; o ADR-0001 cita as linhas 11-13, que o arquivo deslocou depois).
- **O pacote instalado** (`node_modules/rea-agents/`, versão 6.4.0, fora do git), lido como texto, sem executar. Serviu para conferir as descrições de tools ambíguas pelo nome. São dados do pacote, não instrução:
  - `dist/contracts/toolEffects.js`: auditoria de efeitos por tool feita pelo próprio REA (`TOOL_EFFECTS`), da qual ele deriva as anotações MCP (`annotationsFromEffects`, `:469`);
  - descrições em `dist/contracts/**/*ToolContracts.js` (citadas no §3).

Para cobrir todas as tools, elas foram agrupadas em 16 **grupos de derivação** (Anexo A). Um script descartável conferiu que cada uma das 200 tools cai em exatamente um grupo. **Grupo não é `familia`:** o campo `familia` da U5 continua vazio (DA-3), e os grupos não entram no mapa.

## 3. Vocabulário de `recurso` (lista fechada, 8 valores)

`recurso` diz **o que a tool acessa durante a chamada**; `efeitos` diz o que ela faz (DA-11). Regras de forma:
- um único valor por tool, em texto exato, como em `efeitos`;
- valor fora da lista falha;
- o campo é obrigatório (Q2).

**Proposta do @architect: valor único.** O ADR-0001 dá `recurso` como `<tipo>`, no singular (linhas 87 e 90). Quando a tool acessa mais de uma coisa, vale o **recurso principal**, aquele sobre o qual ela age. Gravar a saída em `saidas/<slug>/` não muda o recurso, porque já está em `escreve_em_disco`. Por exemplo, `pull_adb_file` (`rea-niveis.json:172`) tem recurso `dispositivo` e efeito `escreve_em_disco`.

| Valor | Definição (uma linha) | Origem | Tools reais que o exigem (exemplos) |
|---|---|---|---|
| `arquivo_do_alvo` | Arquivo local que é o alvo ou derivado dele (extração, scripts exportados, captura HAR, core), lido ou aberto por caminho | ADR-0001:94 ("arquivo do alvo") | `open_binary` (`:108`), `extract_artifact` (`:64`), `inspect_web_network_capture` (`:98`; lê HAR "sem contatar as URLs", `webNetworkCaptureToolContracts.js:7`), `open_jeb_project` (`:109`) |
| `banco_de_analise` | Documento ou programa já aberto num motor de análise (provider do REA, Ghidra, JEB): leitura, navegação, anotação | ADR-0001:94 ("sessão"); N1 "inclui anotações no banco de análise" (`rea-niveis.json:7`); `ghidra-niveis.json:4` | `list_strings` (`:106`), `set_comment` (`:129`), `decompile_jeb_item` (`:63`), as 30 do Ghidra (`decompile_function`, `:14`; `rename_function`, `:36`) |
| `evidencia` | Evidência do REA já produzida: registros, capturas, desconhecidos e bundles da sessão de evidência, ou bundle exportado | ADR-0001:94 ("evidência"); N0 "opera sobre evidência já produzida" (`rea-niveis.json:5`) | `get_evidence_bundle` (`:33`), `import_evidence_bundle` (`:34`), `record_unknown` (`:42`), `compare_process_captures` (`:23`) |
| `processo` | Processo nativo local do alvo, lançado pelo REA ou já em execução, inclusive a UI dele | ADR-0001:94 ("processo") | `capture_process_scenario` (`:157`), `observe_native_calls` (`:158`), `observe_native_ui` (`:151`; app já em execução, por PID e janela, `nativeToolContracts.js:65`) |
| `navegador_ou_runtime_js` | Página, app Electron ou runtime JavaScript alcançado por CDP ou V8 Inspector, lançado pelo REA ou já em execução | ADR-0001:94 ("navegador/URL"); N2 cita "CDP, V8 Inspector" (`rea-niveis.json:8`) | `list_browser_targets` (`:147`), `observe_javascript_runtime` (`:150`), `capture_electron_scenario` (`:155`) |
| `dispositivo` | Dispositivo Android alcançado por adb, para ler ou alterar | ADR-0001:94; DA-11 | `list_adb_devices` (`:166`), `pull_adb_file` (`:172`), `start_adb_app` (`:180`) |
| `ferramenta_de_analise` | O próprio instrumento de análise (cliente adb, launcher do apktool, cliente JEB), sem tocar o alvo nem o dispositivo | **Proposta do @architect** (valor novo; ver §3.1) | `inspect_adb_client` (`:161`), `inspect_apktool_client` (`:77`), `inspect_jeb_client` (`:83`) |
| `nenhum` | Nada além dos argumentos da chamada: a tool não lê arquivo, sessão, evidência, processo, página nem dispositivo | **Proposta do @architect**; o nome repete o `nenhum` de `contexto_execucao` (ADR-0001:95) | `demangle_swift` (`:28`; recebe uma lista de símbolos como texto, "sem exigir Hopper", `nativeToolContracts.js:74`) |

**Desempate entre `arquivo_do_alvo` e `evidencia` (Proposta do @architect).** Se o arquivo é conteúdo do alvo (original, extraído ou capturado dele), o recurso é `arquivo_do_alvo`. Se é registro produzido pelo REA (bundle, captura de cenário, desconhecido), o recurso é `evidencia`. Exemplo: `trace_web_module_imports` (`:137`) lê o manifesto de `export_web_scripts` e confere o SHA-256 dos scripts (`webScriptToolContracts.js:31`). Os scripts são código do alvo, então o recurso é `arquivo_do_alvo`.

**Desempate entre `arquivo_do_alvo` e `processo` ou `navegador_ou_runtime_js` (Proposta do @architect).** Uma tool que recebe o caminho de um executável e o roda (`capture_process_scenario`, `capture_electron_scenario`) acessa o **processo** durante a chamada. O caminho fica em `contexto_execucao: caminho` (§5). É isso que permite à C11 proibir `executa_codigo_do_alvo` com `arquivo_do_alvo`.

### 3.1 Tools que não cabiam nos pontos de partida do ADR

Os pontos de partida do ADR-0001:94 são arquivo do alvo, sessão ou evidência, processo, navegador ou URL, dispositivo. Duas situações reais não cabem neles sem forçar.

1. **Inspeção do instrumento.** São três tools:
   - `inspect_adb_client` (N4a) "nunca contata dispositivos e nunca inicia o servidor adb" (`adbToolContracts.js:7`);
   - `inspect_apktool_client` (N1) "não decodifica nada" (`apktoolToolContracts.js:7`);
   - `inspect_jeb_client` (N1) "não abre alvo" (`jebToolContracts.js:7`).

   Pôr `inspect_adb_client` em `dispositivo` obrigaria a declarar `usa_dispositivo` (DA-11), o que a descrição desmente. Pôr as três em `arquivo_do_alvo` seria falso. **Proposta:** valor novo `ferramenta_de_analise`.
2. **Sem recurso.** `demangle_swift` (N0) opera só sobre o texto recebido. **Proposta:** valor novo `nenhum`.

**Proposta do @architect: separar "sessão ou evidência".** O ADR junta as duas coisas. Este adendo as separa em `banco_de_analise` e `evidencia`. Motivo: as definições de nível já as distinguem (N0 sobre evidência, N1 com anotações no banco de análise, `rea-niveis.json:5,7`), e o vínculo ao alvo é diferente nos dois casos (§5).

Nenhuma outra tool ficou sem valor (Anexo A). **Rede não virou recurso**, porque nenhuma tool tem a rede como recurso principal. O ponto de rede está na pergunta Q-A2-6.

## 4. Tabela C11: coerência entre `efeitos` e `recurso`

Severidade: **falha**, como a C11 do adendo 1 (§4), salvo as duas casas marcadas **A**, que dependem da Q-A2-2. Legenda: **P** permitido; **F** proibido (falha); **A** aviso.

| `efeitos` ↓ / `recurso` → | `arquivo_do_alvo` | `banco_de_analise` | `evidencia` | `processo` | `navegador_ou_runtime_js` | `dispositivo` | `ferramenta_de_analise` | `nenhum` |
|---|---|---|---|---|---|---|---|---|
| `so_leitura` | P | P | P | F ⁽²⁾ | F ⁽²⁾ | F ⁽¹⁾ | P | P |
| `altera_sessao` | P | P | P | P | P | P | A ⁽³⁾ | F ⁽⁴⁾ |
| `escreve_em_disco` | P | P | P | P | P | P | A ⁽³⁾ | F ⁽⁴⁾ |
| `lanca_processo` | P | P | P | P | P | P | P | P ⁽⁵⁾ |
| `executa_codigo_do_alvo` | F | F | F | P | P | P | F | F |
| `observa_execucao` | F | F | F | P | P | F ⁽⁶⁾ | F | F |
| `usa_dispositivo` | F | F | F | F | F | P | F | F |
| `altera_dispositivo` | F | F | F | F | F | P | F | F |

**Exigências por recurso**, que valem além das casas da tabela:

| # | Regra | Origem |
|---|---|---|
| C11-R1 | `recurso: dispositivo` exige `usa_dispositivo` na lista | DA-11 (adendo 1 §3.1) |
| C11-R2 | `recurso: processo` ou `navegador_ou_runtime_js` exige `observa_execucao` ou `executa_codigo_do_alvo` (ao menos um) | **Proposta do @architect**, pelas definições do adendo 1 §3.1: acessar alvo em execução é observá-lo ou executá-lo |

**Rastreio das casas:**

- **(1)** Decorre da R1 e da C2 (`so_leitura` sozinho).
- **(2)** Decorre da R2 e da C2.
- **(3)** **Proposta do @architect**, como aviso. As três tools de `ferramenta_de_analise` só inspecionam o instrumento. Se uma delas mudar a sessão ou gravar arquivo, provavelmente o recurso está errado (deveria ser `banco_de_analise` ou `evidencia`), mas não há prova de que isso seja sempre erro.
- **(4)** Decorre da definição de `nenhum`: mudar sessão ou gravar arquivo já é acessar um recurso.
- **(5)** Processo auxiliar sem alvo: o `demangle_swift` é `nativeEvidence`, com `launchesProcess` (`toolEffects.js:355`). A C9 já gera aviso para `lanca_processo` sem `executa_codigo_do_alvo`.
- **(6)** Decorre da C4 ({N2, N3}) com a C5 ({N4a, N4b}): os conjuntos não se cruzam. No dispositivo, ler o que roda (tela, logcat) se declara com `usa_dispositivo`.
- **Linhas `executa_codigo_do_alvo` e `observa_execucao`:** as casas F seguem as definições do adendo 1 §3.1 (o alvo roda ou já está rodando) e o segundo desempate do §3.
- **Linhas `usa_dispositivo` e `altera_dispositivo`:** seguem a DA-11 e a C6.
- **Casas P:** permitidas porque há tool real ou caso previsto nas definições, como `open_binary` (`altera_sessao` com `arquivo_do_alvo`), `export_evidence_bundle` (`escreve_em_disco` com `evidencia`), `pull_adb_file` (`escreve_em_disco` com `dispositivo`, adendo 1 §3.1) e `rename_function` (`altera_sessao` com `banco_de_analise`). Uma casa P não diz que a combinação é comum; diz só que não é incoerente.

**Compatibilidade com C1 a C10** (conferida casa a casa):

- **C2:** nenhuma casa exige `so_leitura` com outro valor.
- **C3 a C6:** o recurso não amplia nenhum conjunto de níveis admitidos.
- **C7:** tool N3 com recurso `processo` ou `navegador_ou_runtime_js` satisfaz a R2 com `executa_codigo_do_alvo`, ou com `lanca_processo` mais `observa_execucao`, como em `observe_native_calls`.
- **C8 com R1 e R2:** uma tool N0 ou N1 não pode ter recurso `processo`, `navegador_ou_runtime_js` nem `dispositivo`. Pelo Anexo A, nenhuma tool N0 ou N1 precisa disso: as tools de runtime das N0 (`correlate_static_and_runtime`, `compare_process_captures`, `reconcile_javascript_runtime`) leem `evidencia`.
- **C9 e C10:** não mudam.

## 5. `contexto_execucao` (lista fechada, 5 valores)

Decisão do responsável (Q2): obrigatório por tool, numa lista fechada de 5. Os cinco valores são os do ADR-0001:95, e as definições seguem os casos de vínculo do gate (`rea-gate.mjs:9-13`). O campo diz **como a chamada se prende ao alvo ativo**. É insumo da MEL-06: o gate não o lê, e nada é aplicado (ADR-0001:95).

| Valor | Definição (uma linha) | Exemplos prováveis |
|---|---|---|
| `caminho` | Os argumentos trazem um caminho local, que o gate confere dentro de `alvos/<slug>/` ou `saidas/<slug>/` (`rea-gate.mjs:9-11`) | `open_binary`, `extract_artifact`, `import_evidence_bundle`, `capture_process_scenario` |
| `sessao` | A tool opera sobre documento, programa ou evidência já abertos e herda o vínculo da sessão aberta por um caminho conferido (`rea-gate.mjs:11-13`) | `list_strings`, `get_evidence_bundle`, as 30 do Ghidra, `observe_native_ui` ("vinculada ao alvo Mach-O ativo", `nativeToolContracts.js:65`) |
| `url` | O alvo é alcançado por URL ou endpoint de depuração (CDP, V8 Inspector), sem caminho para conferir (`rea-gate.mjs:12-13`) | `list_browser_targets`, `observe_javascript_runtime` |
| `dispositivo` | O alvo é alcançado por adb, num dispositivo, sem caminho para conferir (`rea-gate.mjs:12-13`) | `list_adb_devices`, `start_adb_app` |
| `nenhum` | A chamada não recebe nem herda alvo | `demangle_swift`, `inspect_adb_client` |

**Relação com `recurso`.** São eixos diferentes: `recurso` diz o que a tool acessa, e `contexto_execucao` diz como esse acesso se prende ao alvo. Por isso, `capture_process_scenario` tem recurso `processo` e contexto `caminho`. Pares esperados (**Proposta do @architect**, só orientação para a revisão dos lotes):

| `recurso` | `contexto_execucao` esperado |
|---|---|
| `arquivo_do_alvo` | `caminho` |
| `banco_de_analise` | `sessao` |
| `evidencia` | `sessao` ou `caminho` (importar ou exportar bundle) |
| `processo` | `caminho` (lançado) ou `sessao` (já em execução, vinculado ao alvo aberto) |
| `navegador_ou_runtime_js` | `url` ou `caminho` (app Electron lançado por caminho) |
| `dispositivo` | `dispositivo` |
| `ferramenta_de_analise` | `nenhum` |
| `nenhum` | `nenhum` |

Se essa tabela vira regra do verificador (C12), é a pergunta Q-A2-3. Por padrão, **não vira**: o ADR-0001:95 diz que o campo é "só declarado", e uma regra nova sem dado real seria generalização prematura.

## 6. `recurso_padrao`

Decisão do responsável (Q2):

- `contrato.recurso_padrao` é **só declaração do servidor**. Não há herança: nenhuma tool deixa de declarar `recurso` por causa dele, e a C11 não o usa.
- O verificador só confere que o valor está na lista do §3 (F2-AC5); a ausência já é falha pelo F2-AC1.
- `recurso` e `contexto_execucao` são obrigatórios em todas as 200 tools.

Valor sugerido (**Proposta do @architect**, escolhido de fato no commit do bloco `contrato`): `banco_de_analise` nos dois mapas. No Ghidra, as 30 tools operam no programa importado (`ghidra-niveis.json:4`). No REA, é o candidato mais frequente pelo Anexo A (grupos G01 a G03 e G06: cerca de 60 das 170 tools). Como o campo não tem efeito, um valor diferente não muda nenhuma decisão.

## 7. Efeito na story (para o @po reconciliar; a story não é editada aqui)

| AC | Hoje | Com este adendo aceito |
|---|---|---|
| **F2-AC5** | "fora do vocabulário fechado de `recurso` (P3)" | Vocabulário = os 8 valores do §3. Testes: cada um dos 8 aprova; valor fora (por exemplo, `rede` ou `Dispositivo`) reprova citando o valor. Sem herança (§6) |
| **F2-AC10** | Obrigatoriedade e lista "sujeitas à resposta da L4" | A **C1 é ampliada**: além de `efeitos` e `conteudo_do_alvo`, cada tool tem `recurso` (um dos 8, §3) e `contexto_execucao` (um dos 5, §5), em texto exato. Ausente, não texto ou fora da lista reprova citando mapa, tool e valor. A condição "sujeitas à L4" sai, e a L4 fica fechada. `familia` não muda |
| **F2-AC13** | "Dada a tabela de pares fechada em P3"; mínimo `usa_dispositivo` ⇄ `dispositivo` | Tabela = §4: 64 casas (8 × 8), mais C11-R1 e C11-R2. Testes: um por linha de efeito (par que aprova e par que reprova), mais aprova e reprova da R1 e da R2; teste guiado pela tabela inteira, se o @dev preferir. As casas **A** só entram como aviso se a Q-A2-2 for aceita; se não forem, viram P ou F conforme a resposta |

Efeitos laterais: a P3, a L1 e a L4 se fecham com o aceite; a tabela de revisão do F2-AC25 (a) já prevê `recurso` e `contexto_execucao`. Se a Q-A2-3 criar a C12, ela precisa de um AC novo, e quem o escreve é o @po.

## 8. Implicações de segurança e observações da leitura

- **Declaração não é autorização.** `recurso` e `contexto_execucao` não liberam nada. O gate não os lê, e N3 e N4b continuam confirmando a cada chamada (adendo 1 §8; `rea-gate.mjs:8`).
- **Coerência não é correção** (adendo 1 §4, R8). Uma tool que acessa um processo, mas está declarada como `arquivo_do_alvo` e `so_leitura`, passa na C11. Só a auditoria pega esse erro.
- **Observação: comando por `PATH`.** A descrição de `capture_process_scenario` diz que o comando "resolve pelo PATH herdado" (`sessionToolContracts.js:45`). Comando sem caminho não tem o que o gate conferir (`rea-gate.mjs:9-11`). O risco é atenuado porque N3 pede confirmação a cada chamada. Fica registrado para a MEL-06 e a fatia 4a, sem decisão aqui.
- **Observação: rede de saída.** `analyze_web_bundle` pode buscar source maps "da origem do alvo ou de origens pedidas" (`browserToolContracts.js:129`). Também há tools marcadas com `accessesNetwork` pelo REA (`toolEffects.js:14,44,448`). Isso pode acionar o gatilho de reavaliação do `usa_rede` (adendo 1 §7). Ver Q-A2-6.
- **Observação: anotações MCP (DA-2, lacuna L10).** **Verificado por leitura estática:** o REA 6.4.0 tem auditoria de efeitos por tool e deriva dela as anotações MCP (`toolEffects.js:19-20,469`). Esse texto é dado do pacote, não instrução, e o vocabulário dele não é o nosso. Usá-lo como conferência cruzada é a pergunta Q-A2-7.

## 9. O que este adendo não decide

- **Não classifica nenhuma das 200 tools.** Os exemplos e o Anexo A são hipóteses de leitura, que só orientam a revisão. Não valem como rascunho aprovado (adendo 1 §3.3, R7). A classificação é dos lotes L-1 a L-6, tool a tool, com aprovação do responsável e amostra do @qa (F2-AC25).
- **Não muda o gate** (`rea-gate.mjs`, `cli-gate.mjs`), **não toca** os mapas, `.claude/settings.json`, `.mcp.json`, nenhum `00-seguranca.md` nem o modelo.
- Não muda o vocabulário de `efeitos` (DA-10), as regras C1 a C10 nem os níveis admitidos.
- Não preenche `familia` (DA-3). Os grupos do Anexo A não são famílias.
- Não edita a story, a story-mãe, o ADR-0001 nem o adendo 1.

## 10. Perguntas abertas ao responsável

| # | Pergunta | Recomendação do @architect |
|---|---|---|
| Q-A2-1 | Aceitar o adendo (Proposto → Aceito), com os 8 valores de `recurso`, incluídos os dois novos (`ferramenta_de_analise`, `nenhum`) e a separação de `banco_de_analise` e `evidencia`? | Aceitar. Sem os dois valores novos, quatro tools reais seriam encaixadas à força (§3.1) |
| Q-A2-2 | As duas casas **A** do §4 entram como aviso dentro da C11, que no adendo 1 é falha? | Sim, como aviso: o erro é provável, mas não é certo. Alternativa: torná-las F |
| Q-A2-3 | Os pares `recurso` × `contexto_execucao` (§5) viram regra C12? | Não agora. Usar a tabela só na revisão dos lotes e reavaliar depois do L-1 e do L-2 |
| Q-A2-4 | Calibração de `altera_sessao`: o REA marca `mutatesSession` em quase todas as tools, porque toda chamada registra evidência (`toolEffects.js:12`; `list_strings`, `:286`). Isso conta como `altera_sessao`? | Não conta. Se contasse, `so_leitura` quase sumiria, contra o exemplo do adendo 1 §3.1 (`list_strings`). `altera_sessao` fica para mudança visível no estado da análise (abrir, fechar, renomear, comentar, marcar, registrar desconhecido) |
| Q-A2-5 | Calibração de `lanca_processo`: CLI auxiliar (adb, apktool, unblob, swift-demangle) conta? | Conta, pela definição do adendo 1 ("local, do alvo ou auxiliar"). Consequência esperada: muitos avisos C9, inclusive nas 24 tools adb (`toolEffects.js:104` em diante) |
| Q-A2-6 | A busca de source maps de `analyze_web_bundle` (§8) aciona a reavaliação do `usa_rede` (adendo 1 §7)? | Reavaliar no L-1, que contém essa tool, sem mudar o vocabulário antes |
| Q-A2-7 | Conferir os nossos `efeitos` contra a auditoria do REA (`TOOL_EFFECTS`), agora que ela se lê sem executar o pacote? | Como insumo de revisão dos lotes, sim. Como regra do verificador, não nesta fatia: exigiria ler o pacote (fora do AC14 e do F2-AC24) |
| Q-A2-8 | `recurso_padrao`: `banco_de_analise` nos dois mapas (§6)? | Sim. O campo não tem efeito |

## Anexo A — Grupos de derivação (cobertura das 200 tools)

Conferido: 170 + 30 tools, cada uma num só grupo. Por nível no REA: N0 36 = G01 2 + G08 33 + G09 1; N1 92; N2 13; N3 5; N4a 18; N4b 6. A coluna "recurso candidato" é hipótese do nome e da descrição, **não classificação**.

| Grupo | Conteúdo | Tools | Níveis | Recurso candidato |
|---|---|---|---|---|
| G01 | Ciclo da sessão nativa: `open_binary`, `close_binary`, `binary_session`, `get_navigation_context`, `inspect_address_context` | 5 | N0 2, N1 3 | `arquivo_do_alvo` (`open_binary`); `banco_de_analise` (demais) |
| G02 | Consulta ao documento nativo aberto: `address_name`, `address_to_file_offset`, `comment`, `current_address`, `current_document`, `current_procedure`, `goto_address`, `inline_comment`, `list_bookmarks`, `list_documents`, `list_names`, `list_procedures`, `list_segments`, `list_strings`, `next_address`, `prev_address`, `procedure_address`, `procedure_assembly`, `procedure_callees`, `procedure_callers`, `procedure_info`, `procedure_pseudo_code`, `procedure_references`, `read_bytes`, `read_function_instructions`, `resolve_containing_procedure`, `resolve_native_call_targets`, `search_procedures`, `search_strings`, `xrefs`, `inspect_native_instruction`, `inspect_native_data_type`, `inspect_native_load_image`, `inspect_native_dispatch_metadata`, `analyze_function`, `analyze_swift_types`, `batch_decompile`, `binary_overview`, `find_xrefs_to_name`, `get_call_graph`, `get_objc_classes`, `get_objc_protocols`, `inspect_native_api`, `trace_call_path`, `trace_feature`, `trace_native_ui_action`, `trace_native_values` | 47 | N1 | `banco_de_analise` |
| G03 | Anotação no banco de análise (REA): `annotate_native_function`, `set_address_name`, `set_addresses_names`, `set_bookmark`, `set_comment`, `set_inline_comment`, `unset_bookmark` | 7 | N1 | `banco_de_analise` |
| G04 | Formatos de arquivo, por caminho: `extract_artifact`, `extract_firmware`, `inspect_artifact`, `inspect_binary_layout`, `inspect_evm_interface`, `inspect_firmware_regions`, `inspect_pe_resources`, `inspect_recorded_crash`, `inspect_web_network_capture`, `inspect_macho`, `inspect_signature`, `inspect_plist`, `list_architectures`, `inspect_asset_catalog`, `decode_interface_builder`, `inspect_keyed_archive`, `trace_dylib_resolution`, `inspect_managed_artifact`, `inspect_managed_members`, `inspect_managed_native_boundaries`, `analyze_javascript_application`, `recover_javascript_sources`, `trace_web_module_imports`, `trace_web_source_location` | 24 | N1 | `arquivo_do_alvo` |
| G05 | Android estático: `decode_android_resources`, `inspect_android_package`, `inspect_android_class`, `inspect_android_method`, `search_android_classes`, `trace_android_references` | 6 | N1 | `arquivo_do_alvo` |
| G06 | JEB: `open_jeb_project`, `list_jeb_units`, `decompile_jeb_item` | 3 | N1 | `arquivo_do_alvo` (`open_jeb_project`); `banco_de_analise` (demais) |
| G07 | Instrumento: `inspect_adb_client`, `inspect_apktool_client`, `inspect_jeb_client` | 3 | N1 2, N4a 1 | `ferramenta_de_analise` |
| G08 | Evidência e reconstrução: `build_call_path`, `build_reconstruction_obligation_ledger`, `compare_application_versions`, `compare_artifacts`, `compare_bundles`, `compare_functions`, `compare_javascript_export_shapes`, `compare_managed_members`, `compare_process_captures`, `compare_source_to_bundle`, `compare_web_captures`, `compare_web_screenshots`, `correlate_static_and_runtime`, `evaluate_reconstruction_coverage`, `export_evidence_bundle`, `export_web_scripts`, `find_changed_behavior`, `get_evidence_bundle`, `import_evidence_bundle`, `import_managed_reconstruction`, `inspect_analysis_view`, `list_unknowns`, `project_android_application_graph`, `project_apple_application_graph`, `project_managed_application_graph`, `reconcile_javascript_runtime`, `record_unknown`, `trace_application_feature`, `trace_javascript_semantics`, `update_unknown`, `verify_managed_native_boundaries`, `verify_reconstruction`, `verify_unknown_resolution` | 33 | N0 | `evidencia` |
| G09 | Utilitário sem alvo: `demangle_swift` | 1 | N0 | `nenhum` |
| G10 | Navegador, Electron e runtime JS, observação: `analyze_web_bundle`, `capture_web_screenshot`, `discover_webmcp_tools`, `inspect_electron_page`, `inspect_web_event_listeners`, `inspect_web_page`, `list_browser_targets`, `list_electron_targets`, `list_javascript_runtime_targets`, `observe_javascript_runtime`, `observe_web_execution`, `observe_web_session` | 12 | N2 | `navegador_ou_runtime_js` |
| G11 | UI nativa em execução: `observe_native_ui` | 1 | N2 | `processo` |
| G12 | Execução pelo REA: `capture_browser_scenario`, `capture_electron_scenario`, `capture_native_ui_scenario`, `capture_process_scenario`, `observe_native_calls` | 5 | N3 | `navegador_ou_runtime_js` (os dois primeiros); `processo` (demais) |
| G13 | Dispositivo, leitura: `capture_adb_screen`, `collect_adb_bugreport`, `inspect_adb_device`, `inspect_adb_display`, `inspect_adb_package`, `inspect_adb_window`, `list_adb_devices`, `list_adb_directory`, `list_adb_features`, `list_adb_packages`, `list_adb_processes`, `list_adb_services`, `pull_adb_file`, `pull_adb_package`, `read_adb_logcat`, `read_adb_setting`, `resolve_adb_packages` | 17 | N4a | `dispositivo` |
| G14 | Dispositivo, mutação: `install_adb_package`, `push_adb_file`, `start_adb_activity`, `start_adb_app`, `stop_adb_app`, `uninstall_adb_package` | 6 | N4b | `dispositivo` |
| G15 | Ghidra, consulta: `decompile_function`, `decompile_function_by_address`, `disassemble_function`, `get_current_address`, `get_current_function`, `get_function_by_address`, `get_function_calls`, `get_function_xrefs`, `get_program_info`, `get_xrefs_from`, `get_xrefs_to`, `list_classes`, `list_data_items`, `list_exports`, `list_functions`, `list_imports`, `list_methods`, `list_namespaces`, `list_segments`, `list_strings`, `read_memory`, `search_functions_by_name` | 22 | N1 | `banco_de_analise` |
| G16 | Ghidra, anotação: `rename_data`, `rename_function`, `rename_function_by_address`, `rename_variable`, `set_decompiler_comment`, `set_disassembly_comment`, `set_function_prototype`, `set_local_variable_type` | 8 | N1 | `banco_de_analise` |
