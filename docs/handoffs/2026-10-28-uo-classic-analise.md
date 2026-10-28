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
