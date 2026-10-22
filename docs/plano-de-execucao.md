# Plano de execução — PRKing Notepad, bloco 5 (conformidade e lacunas)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade do S3 do Harness
(H:\King\Harness\docs\plano-de-execucao.md §8). Plano preliminar: a story e os
critérios finais vêm da sessão U1, pelo SDC.
-->

**Data:** 2026-10-21 · **Sessão:** `97ff0c40` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `0517e8c`

## 0. Sessão concorrente

Identificação pelo conteúdo dos transcripts (primeira mensagem, `cwd`, arquivos gravados), não pelo horário:

| Sessão | O que é | Situação |
|---|---|---|
| `a0ea8d85` | sessão longa do REA (13/10 → 21/10): instalação, gates, blocos 1–4 do Notepad, correção do Engram | ociosa desde 01:10Z; sem handoff (não existe `docs/handoffs/`). O responsável confirmou: **encerrada**. Não será retomada (regra 2 do S3). |
| `2ae92520` | criação da tarefa agendada `revisao-mensal-rea` | encerrada, sem gravações no repositório |
| `539732ef`, `c934e788` | monetização de `blocos-a` e `blocos-b` | encerradas; benchmarks já em `50cc36a`, `e3e60fa` |
| `11ac3a8a` | catálogo de monetização e checagem de perfis | encerrada |

`git status`: limpo. Nenhuma sessão de outro projeto aberta nesta pasta.

## 1. Enquadramento

**Objetivo:** fechar a v1 do PRKing Notepad provando, item a item, que a implementação cumpre as seções 1–11 de `registros/notepad-reimpl/especificacao.md`, resolvendo os itens "(a confirmar)" e as lacunas da §13, corrigindo as divergências e cobrindo a interface com testes.

**Restrições:**
- **Sala limpa** (`CLAUDE.md` item 8; `reimplementacoes/notepad/README.md`): o trabalho em `reimplementacoes/` lê só a especificação. Nada de `alvos/`, `saidas/`, evidência, pseudocódigo, REA ou Ghidra. Comportamento do original só se confirma **usando o Bloco de Notas normalmente** (spec §13; README regra 3).
- Divergência deliberada não é defeito: fica em "Diferenças" do README (hoje 11 itens).
- Dependência nova (NuGet de teste de UI, por exemplo) entra auditada e fixada (`packages.lock.json`; `CLAUDE.md`, "Games": ferramenta nova auditada e fixada).
- Commit local liberado; push só pelo @devops com autorização. `pre-commit` ativo (blocos de código > 40 linhas, binários, > 300 KB).
- S3 do Harness: uma sessão por unidade/fase; handoff em `docs/handoffs/` ao fechar a fase ou quando o contexto passar de ~200k; sem mudanças no global durante o S3.

**Perfil do projeto:** domínio engenharia reversa / reimplementação em sala limpa de editor de texto · stack C# + WPF, .NET SDK 10.0.401 fixado, xUnit (57 testes em `PRKingNotepad.Core.Tests`) · integrações nenhuma (APIs do Windows: caixas comuns, impressão, documentos recentes) · UI sim (desktop WPF) · dados sensíveis não (preferências locais em `%APPDATA%`) · fase AIOX SDC, bloco 5 depois de 4 blocos implementados · complexidade STANDARD (muitos itens pequenos, um risco técnico: testes de UI WPF).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Qual a unidade de trabalho? | sim | "Notepad: próximo bloco" (responsável, 21/10) |
| O que é o bloco 5? | sim | "Conformidade + lacunas": matriz spec → código → teste, confirmar os "(a confirmar)", corrigir divergências, cobrir a UI com testes (responsável, 21/10) |
| A sessão `a0ea8d85` está encerrada? | sim | sim (responsável, 21/10) |
| Quem confirma o comportamento do original? | sim | O responsável, pelo roteiro que a U1 gera (o agente não controla a área de trabalho e não usa ferramenta de RE). Aprovado com o plano. |
| Testes de UI: em processo, sem dependência nova, ou FlaUI (UI Automation)? | sim | Em processo (janela WPF numa thread STA dentro do xUnit). FlaUI só se a U1 achar item que o modo em processo não alcança (caixas nativas do Windows), e então com auditoria. Aprovado com o plano. |
| Onde fica o resultado das confirmações? | sim | Adendo datado em `registros/notepad-reimpl/especificacao.md` (lado da análise; a reimplementação continua lendo só a spec). Aprovado com o plano. |
| Desligar os MCP `rea` e `ghidra` nas sessões U1–U4? | sim | Não (responsável, 21/10). Sala limpa pela regra de não chamar; a medição do S3 fica comparável à base. |

## 2. Precedentes (Engram)

**Consultas** (`vault_deep_query_tool`, `synthesize: false`, cross-projeto):

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| matriz de conformidade especificação → implementação e testes em reimplementação sala limpa C# WPF; confirmar lacunas; testes de interface WPF; risco de divergência | 7 | 0,508–0,519 |
| PRKing Notepad .NET 10 WPF: testes de UI automatizados, FlaUI ou UI Automation, verificação contra o original, armadilhas do TextBox (2ª: máx < 0,55 e nada do mesmo domínio) | 7 | 0,505–0,514 |
| sessões longas retomadas, contexto médio alto, leitura de cache; dividir em sessões por fase com handoff (risco do S3 isolado) | 7 | 0,502–0,516 |

Nenhuma nota trata de WPF, .NET ou do Notepad: precedentes do domínio não existem. Os usados abaixo são de processo.

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `plano-global-de-otimiza-o-de-tokens-e-banco-de-skills-v2` | sessões longas sem compactação (contexto médio 450–550k, 85 sessões) puxam o custo; cortar por unidade de trabalho | verificável (medição de 45 dias com `sessao.js`) | sim — mesma máquina; base do REA no §8 do Harness repete o padrão (`a0ea8d85`: 472k médio, 217,7M de leitura de cache) | quatro unidades de sessão com limite ~180k e handoff obrigatório |
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` | antes de construir o que uma lista externa pede, conferir o código: 2 de 5 itens já existiam | relatada | parcial — lá era benchmark de mercado; aqui é a spec contra 4 blocos já feitos. O risco é o mesmo: marcar como faltante o que existe | a matriz exige, por linha, arquivo e teste encontrados (Grep/Read) antes de qualquer status "falta" |
| `despensa-onda-de-corre-es-da-auditoria-migrations-0005-0009` | correções de auditoria verificadas contra o sistema real; quando o comportamento divergiu do escrito, a spec foi atualizada e a decisão registrada | verificável (cita 42 + 13 + 18 testes e as decisões D-035–D-037) | parcial — lá a spec era do próprio projeto; aqui a spec é da análise e a sala limpa limita quem a muda | cada divergência sai da U1 com destino decidido: corrigir o código, ou registrar em "Diferenças" do README, ou adendo na spec (só fato confirmado do original) |
| `conte-do-perdido-em-compacta-o-pode-estar-recuper-vel-no-tra` | conteúdo dado como perdido estava no transcript; buscar lá antes de reconstruir | relatada | sim — o porquê das decisões dos blocos 1–4 só existe no transcript de `a0ea8d85` (sem handoff) | se a matriz precisar do motivo de uma decisão antiga, buscar no transcript em vez de reabrir aquela sessão |

**Descartados:** `despensa-auditoria-de-c-digo-riscos-e-usabilidade-2026-07-31` — contexto de outro domínio (RLS, Next.js) · `despensa-revis-o-cto-cmo-ux-e-as-5-mudan-as-de-d-019` — idem · `classmate-connect-13-runbook-quality-gates-after-2026-06-26-fixes` — gotcha do Vitest, não se aplica a .NET · `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` — já implementado aqui; a unidade não usa MCP de RE · `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch` — npm; vira só o risco da dependência NuGet abaixo · `prking-rea-pilha-de-engenharia-reversa-de-games-em-volta-do` — games · `harness-vis-o-decis-es-e-local-do-projeto`, `01HZ_HANDOFF_2026_05_25_VD`, `fezinha-*`, `classmate-connect-13-*` — sem relação com a unidade.

## 3. Plano preliminar

**Workflow AIOX:** SDC (Story Development Cycle), com QA Loop no fim. Motivo: trabalho de evolução sobre código existente com critérios verificáveis; não é feature nova que precise de Spec Pipeline nem projeto desconhecido (Brownfield). A matriz da U1 faz o papel de "QA encontrou itens" e vira a story; a correção pós-gate segue o QA Loop (máx. 2 iterações aqui, para caber nas sessões).

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| U1 | Matriz de conformidade e story | SDC criar + validar / @qa (matriz), @sm (story), @po (validação) | `reimplementacoes/notepad/CONFORMIDADE.md` (spec §1–§11 → arquivo → teste → status); roteiro de confirmação para o responsável; `docs/stories/notepad-bloco-5.story.md` com ACs; dúvidas abertas da §1 resolvidas; commit `docs:` | toda subseção 1–11 com linha; status ∈ {ok, divergente, sem teste, a confirmar, fora do escopo}; cada "falta" com evidência de busca; cada divergente com destino; nada lido fora da spec e de `reimplementacoes/notepad/` | ~180k |
| — | Confirmação no original | responsável, fora de sessão | respostas do roteiro → adendo datado na spec | os 7 "(a confirmar)" e as 2 lacunas da §13 respondidos ou marcados "não observável" | — |
| U2 | Correções | SDC implementar / @dev | código e testes do Core para cada divergente e cada lacuna confirmada; README "Diferenças" atualizado; commit `fix:`/`feat:` | `dotnet build` sem avisos; `dotnet test` verde; todo divergente da matriz fechado | ~180k |
| U3 | Testes de interface | SDC implementar / @dev | projeto de testes de UI (em processo, STA) cobrindo os fluxos da matriz marcados "sem teste"; commit `test:` | testes de UI verdes duas vezes seguidas (sem instabilidade); matriz sem "sem teste" nos itens de UI cobertos | ~180k |
| U4 | QA gate e correção | SDC QA / @qa → @dev (QA Loop) | `/code-review` do diff U2–U3; revisão de sala limpa; matriz final; story `Done`; handoff final; nota curta no Engram apontando o handoff | veredito PASS ou CONCERNS aceito pelo responsável; matriz sem "divergente" aberto; métricas das 4 sessões entregues ao Harness | ~180k |

Qualquer unidade que passar de ~200k fecha com handoff e continua em sessão nova (regra 2 do S3); o handoff conta como parte da unidade.

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\mapa-fases.md`, `capacidades.yaml`):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| U1 — criar e validar | nativas (Read, Grep, Glob), AskUserQuestion | subagente Explore para varrer `src/` | MCP `rea` e `ghidra` (sala limpa), browser, skills de RE e de jogos | nada; não chamar as tools de RE é regra. Desligar os servidores (`disabledMcpjsonServers`, pelo @devops) foi recusado pelo responsável: ficam carregados, sem uso |
| U2 / U3 — implementar | nativas, `dotnet` CLI em `C:\tools\dotnet` | `/simplify` | idem U1; impeccable/design (a UI segue o padrão já feito) | nada |
| U4 — QA | `/code-review` (skill nativa, o modelo chama) | gstack `review` | idem U1 | gstack está em `user-invocable-only` (D22): se for preciso, o responsável digita `/review` |
| Registro | Engram (`vault_save_tool`), handoff, `sessao.js` | — | — | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Matriz completa | cada título `##`/`###` das §1–§11 da spec aparece na matriz (contagem por Grep nos dois arquivos) |
| Sala limpa | `git diff --stat` de U2–U4 só em `reimplementacoes/notepad/`, `docs/` e no adendo da spec; nenhum `Read`/`Grep` em `alvos/` ou `saidas/` nos transcripts de U1–U4 (busca no transcript) |
| Correções | `dotnet build PRKingNotepad.slnx` (avisos viram erro) e `dotnet test PRKingNotepad.slnx` verdes; número de testes > 57 |
| Testes de UI | duas execuções seguidas verdes |
| Commits | `pre-commit` passa sem `--no-verify` |
| Controles do repositório | `npm test` só se alguma unidade tocar `scripts/` ou `.claude/hooks/` (não previsto) |
| S3 | `sessao.js --projeto "H:/King/Clientes e Projetos/PRKing_REA" --sessao <id>` por sessão; comparar contexto médio e leitura de cache da unidade aceita com a base do §8 do Harness |

**Riscos:**
- Unidade escorrega para sessão longa — precedente `plano-global-…-v2` — limite ~180k e handoff; não retomar `a0ea8d85`.
- Marcar como faltante o que já existe — precedente `padr-o-verificar-cobertura-…` — evidência de busca por linha da matriz.
- "Corrigir" uma diferença deliberada — precedente `despensa-onda-de-corre-es-…` — conferir "Diferenças" do README antes de mudar código; destino explícito por divergência.
- Contaminação da sala limpa ao confirmar o original — enquadramento — confirmação só pelo uso normal, feita pelo responsável; o resultado entra na spec, nunca direto no código.
- Testes de UI do WPF instáveis (thread STA, dispatcher, caixas nativas fora do alcance) — enquadramento — começar em processo; caixas nativas ficam como teste manual na matriz; FlaUI só com auditoria.
- Dependência NuGet nova sem auditoria — descartado `auditoria-est-tica-de-pacote-npm-…` (método análogo) — auditar, fixar versão e lock, registrar em `docs/seguranca/`.
- Motivo de decisão antiga perdido — precedente `conte-do-perdido-em-compacta-o-…` — busca no transcript de `a0ea8d85`.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` (sessão `97ff0c40`, 7 min) ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 21 | inicial 107k · médio 130k · máx 152k · 0% > 200k · leitura de cache 2,6M | 3 (`vault_deep_query_tool`) | ~4k |

Prefixo inicial estimado: system prompt e schemas 54k, CLAUDE.md + rules 12k, lista de skills 8k, nomes de tools MCP 6k (inclui ~170 do `rea` e ~30 do `ghidra`, sem uso nesta unidade).

## 5. Aprovação

**Aprovado:** sim · **Por:** responsável (Ian Benicio), na conversa da sessão `97ff0c40` · **Em:** 2026-10-21 · **Ajustes pedidos:** nenhum; propostas das dúvidas abertas aceitas; MCP de RE não serão desligados.

Nenhum precedente marcado como `aplicável` pelo responsável.
