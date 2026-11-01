# Plano de execução — etapa 1 do plano de evolução: MEL-01 e MEL-02

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano preliminar da primeira rodada
(§12) do plano de evolução docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md,
restrita a MEL-01 e MEL-02. O plano anterior (piloto do perfil do alvo, ativo e à espera
da U4) está em docs/planos/2026-11-01-perfis-alvo.md.
-->

**Data:** 2026-11-01 · **Sessão:** `ed91c88e-f90e-4d99-90ea-91f6832a6f3d` (aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `74ed558`

## 0. Sessão concorrente

Identificadas pelo conteúdo do transcript (`sessao.js --lista 5` e primeira mensagem de cada `.jsonl`):

- `ed91c88e` — esta sessão.
- `f5cee9eb` — sessão principal do piloto do perfil do alvo; foi ela que abriu esta. Parada enquanto esta trabalha.
- `4510c1cd` — U3 do piloto, com handoff `docs/handoffs/2026-11-01-perfis-alvo-u3.md`; parada desde 16:43.

`git status` no início: limpo. Depois do arquivamento: `R docs/plano-de-execucao.md -> docs/planos/2026-11-01-perfis-alvo.md` (esta sessão).

**Piloto do perfil do alvo continua ativo.** Esta sessão só move o plano dele de lugar. Os ponteiros vivos (`docs/catalogo-perfis-alvo.md` e §3 do plano de evolução) passam a apontar para `docs/planos/2026-11-01-perfis-alvo.md`. Os ponteiros históricos (stories e handoffs antigos) ficam como estão, como nos arquivamentos anteriores. Nada desta etapa toca `rea-niveis.json`, `00-seguranca.md` nem o gate.

## 1. Enquadramento

**Objetivo:** corrigir as duas falhas conhecidas do parecer de 01/11 (A05 e parte de A04), MEL-01 e MEL-02, pelo caminho curto do SDC para entregas P, com uma story e um commit local por MEL.

**Restrições:**

- Sala limpa em `reimplementacoes/notepad/`: só código próprio e especificação. Nunca `alvos/`, `saidas/`, evidência nem pseudocódigo.
- Nenhuma tool `rea`/`ghidra`; nenhum alvo ativo necessário.
- Ambiente do responsável: preservar o clipboard; não fechar um PRKing Notepad aberto por ele sem perguntar; não mudar configuração global da máquina por tentativa.
- Conectores do claude.ai não são tocados (a sessão principal cuida deles).
- Sem push (o `main` já está à frente do `origin`; push só pelo @devops, com autorização). `pre-commit` precisa passar.
- MEL-02, passos 1 e 2 (build e ambiente): nenhum arquivo editado em `reimplementacoes/notepad/`. Histórico da story NB5 não é alterado.

**Perfil do projeto:** domínio laboratório de engenharia reversa (ferramentas próprias) · stack Node ESM (scripts e hooks), C# .NET 10 + WPF (Notepad) · integrações nenhuma nesta etapa · UI sim (WPF, testada pela suíte própria) · dados sensíveis clipboard do responsável · fase AIOX SDC, caminho curto · complexidade SIMPLE (MEL-01); SIMPLE ou STANDARD (MEL-02, conforme a causa)

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Arquivar o plano do piloto ainda ativo? | sim | A tarefa manda arquivar, como nos planos anteriores |
| Se a MEL-02 cair em produto ou harness, segue aqui? | aberta | O plano de evolução manda reclassificar para M e passar ao ciclo completo. Decidir no diagnóstico; se for M, registrar e perguntar antes de implementar |
| Formato do estado de erro no catálogo | aberta | Decidir na story MEL-01, sem mudar os campos que já existem |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| testes WPF falham habilitação de menu CanExecute clipboard foco dotnet test regressão sem mudança de código build incremental artifacts-path ambiente | 7 | 0,510–0,515 |
| parser de cabeçalho de arquivo truncado ERR_OUT_OF_RANGE Node Buffer readUInt32 lote continua com erro por item catálogo de assets exit code | 7 | 0,496–0,512 |
| PRKing Notepad reimplementação WPF C# testes de interface UI automation menu Editar Colar Desfazer flaky | 7 | 0,504–0,520 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `prking-notepad-bloco-5-qa-gate-u4-pass-e-fechamento-do-s3` (0,520) | Ponteiro para o handoff `2026-10-22-notepad-b5-u4.md`: UI 76/76 duas vezes em 22/10, build `--no-incremental` com `--artifacts-path` fora do repositório porque o Notepad aberto travava `bin/`; `ClipboardScope` guarda todo formato legível | verificável (comandos e commit `9fb0281` citados no handoff) | parcial — mesmo código (o plano de evolução confere `git diff 50770d5 HEAD` vazio), máquina e data diferentes; conferido lendo o handoff e a story NB5 | Passo 1 da MEL-02 compara os dois caminhos de build e registra o binário testado; o teste de Colar usa o `ClipboardScope`, que preserva o clipboard do responsável |
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` (0,514) | Gate por nível e checagem de commit para repositório público | registrada | sim — o `pre-commit` é o mesmo | Commits passam pelo `pre-commit`; nenhum binário ou WAV de teste versionado: o teste da MEL-01 gera o WAV truncado em pasta temporária |

**Descartados:** `classmate-connect-13-*` — outro projeto, gates de Vitest, sem relação com WPF ou parsing · `despensa-*` — auditoria de outro produto, sem técnica reaproveitável aqui · `rea-6-4-0-store-de-evid-ncias-*` — REA não é usado nesta etapa · `re-identificar-checksum-*` — RE de formato, não validação de cabeçalho · `export-renderiza-o-n-o-canal`, `01HZ_HANDOFF_*`, `padr-o-citar-a-spec-*`, `prking-rea-pilha-*`, `prking-rea-projeto-*`, `piloto-de-valida-o-*` — contexto geral, sem efeito no plano.

Nenhum precedente cross-projeto sobre parser binário resiliente ou regressão WPF sem mudança de código.

## 3. Plano preliminar

**Workflow AIOX:** SDC, caminho curto (YOLO) — "Simple bug fix" na tabela de seleção; o plano de evolução (§3 e §10) manda entregas P pelo caminho curto: story enxuta, implementação e QA na mesma unidade. A MEL-02 volta ao ciclo completo se a causa estiver no produto ou no harness (reclassificada para M).

**Unidades de sessão (D9):** as duas MELs cabem nesta sessão (caminho curto).

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 0 | Fase 0 | — | este plano; plano do piloto arquivado | seções 1–5 preenchidas | ~180k |
| 1 | MEL-01 | SDC curto / @dev + @qa | `docs/stories/mel-01-assets-resilientes.story.md`; `scripts/assets/organizar-assets.mjs` e teste; guia do organizador; commit `fix:` | 4 aceites da MEL-01; `npm test` verde | ~180k |
| 2 | MEL-02 | SDC curto / @dev + @qa (M se produto/harness) | `docs/stories/mel-02-regressao-wpf.story.md`; correção conforme a causa; commit próprio | 5 aceites da MEL-02; suíte WPF verde 2× seguidas a partir de build limpo | ~180k |
| 3 | Handoff | — | `docs/handoffs/2026-11-01-evolucao-etapa1-mel01-mel02.md` | métricas da sessão, estado de cada aceite, pendências para MEL-03/MEL-08 | — |

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\mapa-fases.md`):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| SDC — implementar | nativas (Read, Edit, Bash, PowerShell), `node --test`, `dotnet` | Engram (salvar a causa da MEL-02, se for reaproveitável) | REA, Ghidra, browser, conectores do claude.ai, protocolos de alvo | nada |
| SDC — QA | `npm test`, `dotnet test`, `pre-commit` | `/code-review` nativo | gstack `review` | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| MEL-01 | Regressão nova no teste do organizador com WAV de 12 bytes junto a arquivos válidos: catálogo JSON/CSV/resumo gravados, item com estado de erro, exit code ≠ 0; casos atuais de classificação, hash, dedup e sobrescrita seguem verdes; `npm test` |
| MEL-02 passo 1 | `dotnet build --no-incremental` no caminho padrão e com `--artifacts-path` externo; caminho e hash do `PRKingNotepad.dll` carregado por cada execução de `dotnet test` |
| MEL-02 passo 2 | Inventário `dotnet --list-sdks`/`--list-runtimes`, hotfixes do Windows desde 22/10, processos PRKing Notepad abertos, formatos presentes no clipboard (só nomes, sem ler o conteúdo) |
| MEL-02 aceite | `dotnet test` da solução duas vezes seguidas a partir de build limpo, sem mudança entre elas: Core 137 e UI 76 verdes; `git diff` sem sleeps nem asserções removidas |

**Riscos:**

- Binário testado não é o que se pensa (bin/ travado, saída antiga) — precedente `prking-notepad-bloco-5-qa-gate-u4-*` — registrar caminho e hash do assembly carregado em cada execução.
- Teste de Colar mexe no clipboard do responsável — enquadramento — o `ClipboardScope` existente guarda e devolve todo formato legível; o diagnóstico lista só os nomes dos formatos.
- PRKing Notepad do responsável aberto trava `bin/` — precedente — usar `--artifacts-path` no caminho do QA; não fechar o programa sem perguntar.
- Corrigir o produto sem causa provada — plano de evolução — ordem fixa build → ambiente → harness/produto; sem edição nos passos 1 e 2.
- Mudar o formato do catálogo quebra consumidores — enquadramento — só acrescentar campos; manter os existentes.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 17 | 152k (máx.) | 3 (`vault_deep_query_tool`) | ~4k |

## 5. Aprovação

**Aprovado:** sim, pelo escopo da tarefa · **Por:** responsável, por meio da sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed` · **Em:** 2026-11-01 · **Ajustes pedidos:** nenhum. O responsável decidiu corrigir MEL-01 e MEL-02 antes de qualquer outra coisa; a tarefa fixa ordem, critérios e limites. Esta sessão não pediu nova aprovação para não parar a etapa; o plano fica sujeito a revisão no handoff.
