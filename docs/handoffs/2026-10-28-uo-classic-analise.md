# Handoff — análise estática N0/N1 do uo-classic

## Identificação

- Sessão Claude Code: `93130452-4322-44f1-8a22-bcdae2c35d11`. Sessão iniciada a pedido de `local_e6556b0c-a0f5-4201-9b0b-baa6782b2ca3`.
- Subagentes: nenhum.
- Início: 2026-10-28T13:04:55Z. Fim: 2026-10-28T13:25:00Z (antes do commit e do religamento dos conectores).
- HEAD no início: `3dc6250c900143276e7fdc29e5c618e553b270ef`. Commit desta unidade: `docs: complete uo-classic static analysis` (local, sem push).
- A árvore de trabalho já tinha uma mudança de outra sessão no `CLAUDE.md` (seção "Delegação de busca"). Ela não foi tocada nem entrou no commit.

## Contrato da unidade

- **Tarefa:** concluir a análise estática em `registros/uo-classic/01-analise.md`:
  1. responder às perguntas com evidência ou marcá-las "em aberto" com motivo;
  2. confirmar ou corrigir os formatos da §3 da especificação contra `alvos/uo-classic/`;
  3. testar as hipóteses da `.data` do `client.exe` e da `Granny.dll`;
  4. registrar lacunas no REA e exportar o bundle;
  5. escrever um adendo curto por item da §3.
- **Proibido:** níveis acima de N1, executar o cliente ou o patcher, rede, contornar o gate, editar `status` ou `niveis_aprovados` do `00-seguranca.md`, mecânicas, assets, monetização e benchmark.
- **Critérios de pronto:** critérios do `01-analise.md` marcados e `status: concluida`, adendos na §3, bundle exportado, este handoff e commit local.

## Entregue

- `registros/uo-classic/01-analise.md`: `status: concluida`, `fim: 2026-10-28`. As 3 perguntas do patcher foram respondidas (1 e 2 em parte, com as partes em aberto e o motivo). Há 7 perguntas novas sobre os formatos e as hipóteses, uma tabela de sistemas principais e o diário do dia.
- `registros/uo-classic/especificacao.md`: um adendo em cada subseção de 3.3 a 3.8. O resto do documento não mudou.
  - 3.3, 3.4, 3.6 (paletas) e 3.7: confirmados, com acréscimos.
  - 3.5: confirmado, com uma **correção**: o cabeçalho do bloco do mapa guarda o número do bloco e não é lixo.
  - 3.8: confirmado em parte; `AnimationFrame*.uop` e `anim*.mul` continuam em aberto (fora da cópia).
- Hipóteses:
  - **`.data`:** sem packer. A alta entropia vem de um bloco de 192 KiB que não é compressão nem cifra e parece uma tabela de valores de 128 bits. O propósito continua em aberto.
  - **`Granny.dll`:** nenhum uso estático nos 9 PE da cópia; provável sobra.
- REA: 3 evidências (`inspect_pe_resources` de `client.exe`, `Granny.dll` e `UO.exe`) e 9 lacunas abertas, conferidas com `list_unknowns`. O bundle foi exportado para `saidas/uo-classic/evidence.json` (12 registros, 9 lacunas).
- Fora do git: os leitores próprios ficam em `saidas/uo-classic/scripts/` e a saída bruta em `saidas/uo-classic/analise-formatos-2026-10-28.txt`.
- P01 aplicado aos `.cfg` (só nomes de chave e tamanhos, com valores de uma lista de permissão definida antes da leitura). Nenhum dado pessoal apareceu.

## Unidade aceita?

Os critérios estão cumpridos. A aceitação final pelo responsável ainda não foi registrada. O último critério do `01-analise.md` ("Responsável não pediu mais investigação") foi marcado com base no pedido de conclusão da sessão principal e tem nota sobre as lacunas que ficam para a decisão dele.

## Falhas, desvios e retrabalho

- **Falha de ambiente: provedor Ghidra do REA indisponível no servidor MCP.**
  - O `binary_session` devolveu `runtime_missing` para o Java, embora o JDK 21 responda no terminal e o `npx rea doctor` dê o Java como saudável. A hipótese é que a sonda de Java, com limite de 5 s, falhou no processo do servidor MCP.
  - O GhidraMCP também estava sem backend (Ghidra GUI fechado).
  - Consequência: não houve descompilação nem xrefs. As partes de código das perguntas 1 e 2 e as lacunas da `.data` e da Granny dependem disso.
  - Não rodei o `analyzeHeadless` por fora, para não contornar o gate. Correção provável: reconectar o servidor `rea` pelo `/mcp` (ou reiniciar a sessão) e conferir o `binary_session`.
- **Desvio menor no gate:** um `record_unknown` com `domain: "binario/client.exe"` foi bloqueado porque o gate leu o rótulo como caminho fora do alvo. Refiz com outro rótulo. O gate se comportou como projetado (fail-closed), mas vale saber que ele inspeciona campos de texto livre.
- **Imprecisão gravada no REA:** a lacuna `unk_9d3c0ce1…` (Granny) diz "7 PE" e lista 9 nomes. O certo é 9. Corrigido no `01-analise.md`; o registro do REA não foi revisado.
- **Retrabalho:**
  - um heredoc de Python engoliu o comando seguinte; o script foi reescrito como arquivo;
  - o primeiro teste de ordem do mapa só olhava o eixo x e não separava a transposição; refeito nos dois eixos;
  - o primeiro teste dos statics comparava o mesmo índice nas duas hipóteses; refeito com controles, flags de `tiledata` e um teste condicional de x/y.
- Nada do alvo foi executado. Não houve rede.

## Contexto

- Compactações: 1.
- Conectores: 11 conectores do claude.ai desligados pelo toggle no início (havia um novo, o AAR Maker, além dos 10 da memória) e religados no fim.

## Métricas (`node ~/.claude/skills/skill-budget/scripts/sessao.js`)

Medidas antes do commit; o script conta a sessão desde 13:03.

```
Tokens            principal   subagentes
  chamadas               64            0
  entrada nova          135            0
  escrita cache        308k            0
  leitura cache       11.7M            0
  saida                 79k            0
Contexto por requisicao: inicial 98k | medio 188k | mediano 188k | max 267k | >200k 39%
Trocas de modelo: 0 | compactacoes: 1
```

## Próximo passo

- O **protocolo de benchmark** só roda com o "sim" do responsável na conversa.
- Para fechar as lacunas de código (manifesto e verificação do patcher, bloco da `.data`, Granny): reconectar o REA e repetir com o provedor Ghidra, ainda em N1.
- Para o `AnimationFrame*.uop` e os `anim*.mul`: decisão do responsável de copiar esses arquivos, pelo `protocolo-assets`.

## Reabertura (2026-10-28)

Decisão do responsável, transmitida pela sessão principal: "Reabrir, depois benchmark". O benchmark tinha sido commitado (`a4ef5d0`) e foi revertido (`48ee0e3`). A análise voltou para `status: em_andamento` e continua assim: o responsável decide se conclui. O benchmark só volta com um novo "sim" dele.

### O que mudou no ambiente

- O provedor Ghidra do REA passou a funcionar (Ghidra 12.1.4). Houve descompilação e xrefs do `UO.exe` e do `client.exe`, ainda em N1.
- Adendo 2 do `00-seguranca.md`: cópia de `AnimationFrame6.uop`, `anim6.idx` e `anim6.mul`, com SHA-256 conferido na origem e no destino; `AnimationSequence.uop` só conferido. Registro tardio dos leitores próprios em Node.

### O que fechou

- **Patcher, conferência e assinatura (pergunta 2).** Conferência dos pacotes contra o manifesto pelo hash de 64 bits (ausente, a mais, comprimento, compressão, tamanho do metadado e do CRC). No modo completo: SHA-256 dos dados e assinatura verificada por operação de chave pública com chave embutida (forma de RSA, por inferência). `TGVerifyUpdateIntegrity` é só do invólucro Cider do Mac.
- **Bloco da `.data` (pergunta 10).** Tabela de integridade do mapa, 4 bits por bloco, comparada com o MD5 do bloco; divergência gera a mensagem `0xC5`. Lacuna `unk_bba627f1…` resolvida (`verified`).
- **Animações (pergunta 9).** Estrutura das entradas `AMOU` do `AnimationFrame6.uop` (nomes, cabeçalho, paleta, tabela de quadros) e coerência do `anim6` com as fontes públicas. Adendos novos na §3.8 e na §3.5 da `especificacao.md`.

### O que ficou aberto, e por quê

| Ponto | Motivo | Lacuna |
|---|---|---|
| Esquema do manifesto `MythicMFT` e do `.prod` | O manifesto não está na cópia (pasta `patcher/` fora) | `unk_57447042…` (`investigating`) |
| Metadado v5 dos `.uop` | Falta seguir no `UO.exe` o método do arquivo MYP que entrega o metadado à verificação | `unk_284a2435…` (`investigating`) |
| Origem dos dados da tabela de integridade | Com os mapas desta instalação a coincidência fica no acaso (cerca de 6 %) | `unk_8fe032e5…` (nova, `open`) |
| Granny | Strings não acham a DLL; faltam os argumentos das 11 chamadas a `LoadLibraryA` | `unk_9d3c0ce1…` (`investigating`) |
| Pixels dos quadros `AMOU` | Não examinados | `unk_8b721263…` (`investigating`) |
| 213 entradas incoerentes do `anim6` | Sem explicação no código ainda | `unk_6830c229…` (`investigating`) |
| Bit 15, nomes do `tileart`, ordem das luzes | Não priorizados na reabertura | `unk_cef18757…`, `unk_c93a4147…`, `unk_3d62e92e…` (`open`) |

Bundle final em `saidas/uo-classic/evidence.json`: 28 registros, 10 lacunas em 16 revisões.

### Falhas, desvios e retrabalho

- **Conectores ligados:** os conectores do claude.ai ficaram ligados durante parte da reabertura, contra a regra de alvo não confiável sem conectores sensíveis. Nenhum foi usado.
- **Registro tardio:** os leitores próprios de animação foram usados antes de entrar no Adendo 2.
- **Benchmark commitado e revertido:** `a4ef5d0` e `48ee0e3`.
- **Store do REA perdido:** uma reconexão do servidor e cada `close_binary` zeram registros e lacunas. Reimportei os bundles e refiz as evidências com o alvo aberto; os IDs são determinísticos e saíram iguais. Regra que fica: exportar antes de fechar. Um registro intermediário (`ev_cca8d38c…`) não está no bundle final.
- **Retrabalho no REA:** o primeiro `update_unknown` falhou sem `resolution.evidence_ids` e com um ID de evidência incompleto; refeito com o ID completo lido do bundle de trabalho. Um script Node inline quebrou por aspas; reescrito como arquivo.
- **Lacuna da Granny:** a correção de "7 PE" para 9 entrou no campo de passos recomendados; o texto da pergunta não muda no REA.
- Nada do alvo foi executado. Não houve rede. O patcher não rodou.

### Contexto e métricas

- Compactações: 3 na sessão inteira.
- Medido antes do commit com `node ~/.claude/skills/skill-budget/scripts/sessao.js` (sessão desde 13:03, 236 min):

```
Tokens            principal   subagentes
  chamadas              176            0
  entrada nova          376            0
  escrita cache        890k            0
  leitura cache       31.8M            0
  saida                151k            0
Contexto por requisicao: inicial 98k | medio 186k | mediano 181k | max 267k | >200k 39%
Trocas de modelo: 0 | compactacoes: 3
```

### Próximo passo

- O responsável decide se conclui a análise (`status: concluida`) ou pede mais investigação.
- Benchmark: só com um novo "sim" do responsável na conversa.

## Segunda rodada da reabertura (2026-10-28)

Pedido do responsável: "Investigar mais", e depois "Continuar". Só N0 e N1, com os conectores do claude.ai desligados durante a rodada. `status` segue `em_andamento`.

### O que fechou

| Lacuna | Resultado |
|---|---|
| `unk_8fe032e5…`, origem da tabela de integridade | `resolved`/`verified`. O MD5 é o padrão. A comparação usa os 4 bits baixos do byte 2 do digest (bloco par) ou do byte 4 (bloco ímpar). A checagem só liga com o pacote `0xC6` do servidor. Com o cabeçalho do bloco em `0xFFFFFFFF`, o acerto vai a 27 % (6 % a 59 % por faixa) e a cerca de 97 % num grupo de blocos idênticos. Conclusão (inferência): a tabela foi gerada de uma versão anterior do mapa, que não está na cópia |
| `unk_9d3c0ce1…`, Granny | `resolved`/`verified`. 13 chamadas a `LoadLibraryA`, todas com nome constante de DLL de sistema ou DirectX. Nenhum dos 11 PE tem "granny" ou ".gr2" em ASCII ou UTF-16 |
| `unk_3d62e92e…`, ordem das luzes | `resolved`/`verified`. Primeiro valor de 16 bits = largura, segundo = altura |
| `unk_c93a4147…`, nomes do `tileart`/`MainMisc` | `resolved`/`out-of-scope`. O `client.exe` só monta nomes de arquivo legado; esses nomes dependem do cliente aprimorado |

### O que avançou ou ficou aberto

| Ponto | Situação | Lacuna |
|---|---|---|
| Metadado v5 | Estrutura confirmada no `UO.exe`: id do tipo de checagem (21) e um bloco de assinatura com prefixo de tamanho. Abertos: a origem da tabela de chaves (nenhuma das quatro chaves DER do `UO.exe` verifica) e o hash de 32 bits da entrada. "Chave embutida", da primeira rodada, foi corrigida | `unk_284a2435…` (`investigating`) |
| Pixels `AMOU` | O cliente não confere a marca `AMOU`. Falta seguir a classe `UOAnimationFrameSet` | `unk_8b721263…` (`investigating`) |
| 213 entradas do `anim6`, bit 15, manifesto | Sem avanço nesta rodada | `unk_6830c229…`, `unk_57447042…` (`investigating`), `unk_cef18757…` (`open`) |

Bundle em `saidas/uo-classic/evidence.json`: 77 registros, 10 lacunas em 22 revisões (5 `resolved`, 4 `investigating`, 1 `open`). Adendos novos na `especificacao.md`: §3.4 (ordem das luzes) e §3.5 (a tabela não serve para validar o mapa).

### Falhas, desvios e retrabalho

- Mudei a ordem dos passos: as lacunas do `client.exe` vieram antes da troca para o `UO.exe`, para não perder o store. O bundle foi exportado antes da troca.
- `find_xrefs_to_name("LoadLibraryA")` não acha o nome. O Ghidra o registra como `KERNEL32.DLL::LoadLibraryA` (endereço externo); usei `search_procedures` e `xrefs`.
- O teste das variantes `map0x`/`map1x` saiu vazio na primeira vez (nome base errado no script) e foi refeito.
- O primeiro teste de assinatura quebrou com um bloco DER que não era chave; corrigido para ignorá-lo.
- Os testes de dados (`tabela-data3.mjs`, `tabela-data4.mjs`, `loadlib-args.mjs`, `v5-assinatura.mjs`) não geram evidência no REA. Estão citados nas justificativas das lacunas.
- Nada do alvo foi executado. Não houve rede. O patcher não rodou.

### Contexto e métricas

Medido com `node ~/.claude/skills/skill-budget/scripts/sessao.js`, cobrindo a sessão inteira desde 13:03 (256 min):

```
Tokens            principal   subagentes
  chamadas              278            0
  entrada nova          594            0
  escrita cache        1.2M            0
  leitura cache       49.9M            0
  saida                214k            0
Contexto por requisicao: inicial 98k | medio 184k | mediano 182k | max 267k | >200k 37%
Trocas de modelo: 0 | compactacoes: 4
```

### Próximo passo

- O responsável decide se conclui a análise ou pede mais investigação. Se pedir, os candidatos são: a classe `UOAnimationFrameSet` (pixels `AMOU`), a origem da tabela de chaves do patcher e o bit 15 da arte.
- Benchmark: só com um novo "sim" do responsável.
