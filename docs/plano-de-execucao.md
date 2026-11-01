# Plano de execução — perfil do alvo e pacote de recursos (piloto no REA)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano preliminar: o catálogo, as
mudanças nos modelos e as medições vêm nas unidades. O plano anterior (uo-classic /
Outrora) está em docs/planos/2026-10-27-uo-classic.md.
-->

**Data:** 2026-11-01 · **Sessão:** `f5cee9eb-0a9d-452f-8a5c-c59a1f571a51` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `0146a9494eae87d4637edba0b62482068730c62f`

## 0. Sessão concorrente

**Há uma sessão ativa neste repositório, que não é esta.** Em `sessao.js --lista 5` a única sessão recente é esta (`2026-11-01T13:00`), mas, durante a Fase 0, apareceram arquivos que esta sessão não criou:

- `docs/analises/2026-11-01-arquitetura-cto-comparativo.md` (10:03, parecer de arquitetura e CTO; rodou os testes);
- `docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md` (10:11, plano de evolução derivado do parecer);
- o log temporário `.analise-testes-temporario.log`, presente no início da sessão, foi apagado.

O `CLAUDE.md` também está modificado desde as 09:47, antes desta sessão (bloco "Delegação de busca", experimento do Harness, Etapa 2).

**Decisão do responsável (2026-11-01):** seguir sem tocar nesses arquivos. Esta sessão não edita nem commita `CLAUDE.md`, `docs/analises/` nem `docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md`. O parecer e o plano de evolução são só leitura de entrada.

**Sobreposição com o plano de evolução:** nenhum arquivo em comum até aqui. Ele cita o "perfil" como parte da chave de cache de evidência (seção de eficiência). O perfil do alvo deste plano pode alimentar essa chave depois; fica como ponto de coordenação, não como dependência.

`git status` depois do arquivamento: `M CLAUDE.md` (outra sessão) · `R docs/plano-de-execucao.md -> docs/planos/2026-10-27-uo-classic.md` (esta sessão) · `?? docs/analises/`, `?? docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md` (outra sessão).

## 1. Enquadramento

**Objetivo:** definir uma categorização de alvos do REA, de modo que o perfil do alvo indique de antemão quais recursos usar, testá-la nos alvos já analisados e validá-la no próximo alvo novo, medindo o ganho antes de qualquer aplicação automática.

**Origem:** pedido do responsável em 2026-11-01. A decisão de onde fica o mecanismo também é de 2026-11-01: o mecanismo geral vai para a Fase 0 do Harness, e o catálogo de cada domínio fica no projeto. O piloto é feito no REA e só depois é generalizado.

**Restrições:**
- **Piloto só orienta.** O pacote fica registrado e orienta a sessão. Nada é desligado nem bloqueado: nada de `settings.local.json`, de `skillOverrides` nem de mudança no gate. A aplicação real é uma unidade condicional, que exige medição favorável e aprovação.
- **Não mexer no controle de risco.** O perfil complementa a classe de confiança (C1 a C3) e os níveis (N0 a N4b). Não substitui nenhum dos dois. `status` e `niveis_aprovados` dos `00-seguranca.md` continuam intocados.
- **Análise cega.** As sessões cegas não leem `pilotos/`, `docs/plano*`, `docs/stories/` nem `docs/handoffs/`. O catálogo de perfis, que essas sessões podem ler, não pode citar resultados dos alvos de piloto (`blocos-*`, `encaixe-*`). A calibração por alvo fica em `docs/planos/`, que a lista de cegueira já exclui.
- **Sem invenção (Constitution, art. IV).** Cada pacote do catálogo sai do uso real levantado na U1 ou de um documento existente (`docs/plano-integracao-games.md`, `docs/benchmark-ferramentas-re.md`). Item sem fonte fica marcado como hipótese.
- **Não editar `H:\King\Harness`.** A generalização é etapa futura.
- Commits locais só dos arquivos desta etapa. Push só pelo @devops, com autorização.

**Perfil do projeto:** domínio processo de engenharia reversa (método e governança) · stack Markdown + JSON, Node para medição · integrações nenhuma nova (REA, Ghidra e Engram já existem) · UI não · dados sensíveis não (os registros são públicos; os transcripts só são lidos localmente) · fase AIOX Spec Pipeline (SIMPLE) → SDC · complexidade SIMPLE (escopo de poucos arquivos, sem integração nova, sem infraestrutura, domínio conhecido, risco baixo)

**Eixos da categorização (decisão do responsável, 2026-11-01):**

| Eixo | Decide | Exemplos de valores (a fechar na U2) |
|---|---|---|
| Tipo do alvo | Ferramentas: servidores MCP, famílias de tools do REA, pilha por engine | nativo PE/ELF/Mach-O, .NET ou Unity Mono, Unity IL2CPP, Unreal, Electron/JS, web, Android, firmware |
| Objetivo | Protocolos e skills | análise, mecânicas, assets, monetização, especificação, benchmark |
| Complexidade | Profundidade: unidades de sessão, orçamento de contexto, varredura em lote ou por função | baixa, média, alta, por critérios medidos na triagem passiva (tamanho, nº de módulos, ofuscação, linguagem) |

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Quais eixos? | sim | Tipo + objetivo + complexidade (responsável, 2026-11-01) |
| Orientar ou aplicar? | sim | Orientar no piloto; aplicar depois, se a medição mostrar ganho (responsável, 2026-11-01) |
| Em quais alvos testar? | sim | Retroativo nos alvos registrados + o próximo alvo novo (responsável, 2026-11-01) |
| Quais critérios de complexidade dá para medir sem executar o alvo? | sim (U2) | K1 a K5 (`docs/catalogo-perfis-alvo.md` §4.1): executáveis, módulos de script, tamanho, formatos próprios, ofuscação; vale o maior. Limites das faixas ainda `hip`, revisar na U4 |
| Como ligar cada sessão antiga ao alvo dela, para contar o uso real? | sim (U1) | Pelos handoffs e transcripts; método e comandos em `docs/planos/2026-11-01-perfis-alvo-calibracao.md` |
| Onde o perfil entra no fluxo: nova seção do `00-seguranca.md` ou registro próprio? | sim (U2), formato na U3 | Seção nova no `00-seguranca.md`, preenchida no fim da triagem (`docs/catalogo-perfis-alvo.md` §6). O formato final fica com a U3 |
| Qual é o próximo alvo novo? | aberta | Depende do responsável. A U4 espera por ele |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| categorização de projeto por perfil e complexidade para pré-selecionar recursos (skills, MCP, ferramentas) e não carregar o que não será usado; engenharia reversa por tipo de alvo; orçamento de contexto | 7 | 0,513–0,521 |
| seleção de capacidades por projeto: desligar plugins, skills e servidores MCP fora do uso (skillOverrides, enabledPlugins), medição do prefixo e ganho real; risco de bloquear ferramenta necessária | 7 | 0,514–0,528 |

A segunda consulta foi feita porque a relevância máxima da primeira ficou abaixo de 0,55.

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `code-mode-code-execution-com-mcp-no-claude-code-o-peso-est-n` | Na F7 do REA, o MCP pesou ~2–5% do custo. Pesam a escrita de cache, as retomadas e o shell | verificável (`H:\King\Harness\docs\medicoes\2026-10-27-resultados-de-tools-f7.md`, linhas 31, 48 e 91) | parcial: a F7 usou alvos JS com pouco MCP. Alvo nativo com Ghidra (`uo-classic`) não foi medido | Não prometer ganho de tokens por esconder tools. A métrica principal é de qualidade (chamadas fora do pacote, retrabalho, protocolos carregados sem uso), e a U4 mede de preferência num alvo nativo. Medido nesta sessão: os nomes de tools deferred (MCP) somam ~6k de um prefixo de 97k |
| `medi-o-do-prefixo-e-teto-da-listagem-de-skills-claude-code-2` | A lista de skills vive no teto. Cortar skills só troca quem recebe descrição | relatada (cita as amostras A2 e A3 do Harness; não reabertas) | parcial: medido no Claude Code 2.1.295; o catálogo do Harness está no 2.1.299 | O ganho do eixo "objetivo" vem de não invocar protocolos desnecessários (corpo do SKILL.md), não de tirar skills da lista |
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` | Mapa de nível por servidor MCP + hook fail-closed | verificável (`.claude/hooks/rea-niveis.json`, `npm test`) | sim: é deste projeto | Na aplicação (U5), o pacote por família de tool pode virar um campo do mapa existente, sem um segundo mecanismo. No piloto, o gate não muda |
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` | Antes de construir, conferir o que já existe | relatada | sim | U1 e U2 partem do que existe: perfil e "capacidades por fase" da Fase 0, triagem passiva do protocolo de segurança, pilha por engine do `plano-integracao-games.md` |
| `prking-rea-pilha-de-engenharia-reversa-de-games-em-volta-do` | Pilha de games por engine (Unity, Unreal, nativo), instalada por alvo | registrada | sim | Os tipos Unity, Unreal e nativo do eixo "tipo" reaproveitam a pilha do `docs/plano-integracao-games.md` |
| `harness-vis-o-decis-es-e-local-do-projeto` | Harness: seleção de capacidades; Fase 0 = skill `fase-0` | registrada | sim | O catálogo usa o mesmo vocabulário do `mapa-fases.md` (ativo, sob demanda, não carregar), para subir ao Harness sem tradução |

**Descartados:** `piloto-de-valida-o-de-um-protocolo-de-an-lise-de-monetiza-o` — contexto do F7, sem relação com seleção de recursos (a regra de cegueira já está no CLAUDE.md) · `prking-rea-projeto-de-engenharia-reversa-com-rea-no-claude-c` — contexto geral, já coberto pelo CLAUDE.md · `plano-global-de-otimiza-o-de-tokens-e-banco-de-skills-v2` — origem do Harness, coberto pela nota do Harness · `boilerplate-de-skill-78-do-custo-de-contexto-e-duplicata` — trata de skills grandes; a regra de orçamento do CLAUDE.md global já cobre · `classmate-connect-13-…`, `despensa-auditoria-…` — outro domínio.

## 3. Plano preliminar

**Workflow AIOX:** Spec Pipeline, classe SIMPLE (gather → spec → critique) para o catálogo, seguido de SDC em modo YOLO para as mudanças nos modelos. Motivo: define um processo novo, sem código de produto, e a complexidade fica abaixo de 8 nas cinco dimensões.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| U1 | Levantamento retroativo | gather / @analyst | `docs/planos/2026-11-01-perfis-alvo-calibracao.md` | Os 7 alvos registrados (`notepad-teste`, `notepad-reimpl`, `uo-classic`, `blocos-a`, `blocos-b`, `encaixe-1`, `encaixe-2`), cada um com: tipo, objetivo e complexidade tirados do `00-seguranca.md` e do `01-analise.md`; recursos realmente usados (tools REA e Ghidra por família, protocolos, skills, subagentes), com o id da sessão e a contagem; recursos carregados e não usados. Toda linha com fonte | ~180k |
| U2 | Catálogo de perfis | spec + critique / @architect, crítica @qa | `docs/catalogo-perfis-alvo.md` | Taxonomia dos 3 eixos com critérios verificáveis na triagem passiva; pacote por valor de eixo (ativo / sob demanda / não carregar); regra de composição dos eixos; toda entrada com fonte (U1 ou doc existente) ou marcada como hipótese; nenhum resultado de alvo de piloto citado | ~180k |
| U3 | Integração no processo | SDC / @dev | Seção "Perfil do alvo e recursos" em `registros/_modelos/00-seguranca.md`; passo correspondente em `.claude/skills/protocolo-seguranca/SKILL.md`; uma linha no fluxo do `CLAUDE.md` | Ao aplicar o catálogo aos 7 alvos no papel, nenhum recurso realmente usado fica em "não carregar" (cobertura de 100%), e a fração em "não carregar" fica registrada. `npm test` verde. A linha no `CLAUDE.md` espera a outra sessão commitar o bloco dela | ~120k |
| U4 | Validação no próximo alvo | análise do alvo / responsável + @analyst | Seção de perfil preenchida no `00-seguranca.md` do alvo; medição em `docs/planos/<data>-perfis-alvo-validacao.md` | Comparar com um alvo parecido já analisado: chamadas a tools fora do pacote, protocolos invocados sem uso, retrabalho e custo (`sessao.js`). Veredito: aplicar, ajustar ou parar | conforme o alvo |
| U5 | Aplicação (condicional) | @architect + @dev | Proposta: família de tool no `rea-niveis.json`, servidores por perfil em `settings.local.json` | Só se a U4 mostrar ganho, e com aprovação do responsável item a item. Fora do piloto | — |

**Andamento (2026-11-01):**

| # | Estado | Commit | Conferência pela sessão principal |
|---|---|---|---|
| U1 | feita | `d30c4a3` | commit com 2 arquivos |
| U2 | feita | `ae3729e`, `b175d54` | checagem de fonte refeita (130 linhas, 0 problemas); busca por pilotos vazia |
| U3 | feita | `141bc69`, `26f5a3c` (catálogo v0.2), linha do `CLAUDE.md` (`ec40ced`) | `npm test` 164/164; script de cobertura refeito (`fora 0` nos 7; frações de 72%, 73% e 94%) |
| Bloco "Delegação de busca" do `CLAUDE.md` | commitado | `ce2799d` | commitado pela sessão principal, com autorização do responsável; o bloqueio da U3 era esse bloco, sem commit desde 09:47 |
| U4 | aguardando alvo novo | — | — |
| U5 | condicional | — | — |

**Capacidades por fase** (fonte: `H:\King\Harness\docs\catalogo\mapa-fases.md`):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| U1 | nativas (Read, Grep, Bash), `sessao.js`, `H:\King\Harness\ferramentas\uso.js` | subagente Explore (para localizar sessões e registros; exclui `alvos/`), Engram | tools `rea` e `ghidra` (lê só registros, não alvos), browser, conectores do claude.ai | nada |
| U2 | nativas, Engram (consulta pontual) | WebSearch (critério de complexidade sem fonte interna) | `rea`, `ghidra`, browser, conectores | nada |
| U3 | nativas, `npm test` | — | `rea`, `ghidra`, browser, conectores | nada |
| U4 | o pacote do próprio alvo: é o experimento | o que o pacote marcar "sob demanda" | o que o pacote marcar "não carregar", só como orientação | adendo no `00-seguranca.md`, como hoje |

**Verificações:**

| Entrega | Como provar |
|---|---|
| U1 | Cada contagem reproduzível por comando registrado na calibração (`uso.js`, `sessao.js` com o id da sessão) |
| U2 | Checagem de fonte: toda linha do catálogo aponta para a U1 ou para um doc existente; busca por `blocos-`/`encaixe-` no catálogo retorna vazio |
| U3 | Tabela "pacote sugerido × uso real" dos 7 alvos, sem nenhum recurso usado em "não carregar"; `npm test` |
| U4 | `sessao.js` da sessão do alvo × sessão de um alvo comparável; contagem de chamadas fora do pacote |

**Riscos:**
- Ganho de tokens pequeno — precedente `code-mode-…` (MCP ~2–5% na F7) — medir qualidade e retrabalho, não só tokens; preferir alvo nativo na U4.
- Pacote marca como "não carregar" algo de que o alvo precisa — enquadramento — o piloto só orienta; "sob demanda" é a saída; tool fora do pacote entra por adendo, como hoje.
- Calibração com poucos alvos (7, quase todos C1, N0 e N1, sem Android, web real nem firmware) — U1 — tipos sem alvo ficam marcados como hipótese no catálogo, nunca como pacote calibrado.
- Vazamento para análise cega — regra de cegueira do CLAUDE.md — calibração em `docs/planos/`; o catálogo não cita resultados de piloto (verificação da U2).
- Conflito com a sessão concorrente no `CLAUDE.md` — seção 0 — a U3 só edita o `CLAUDE.md` depois que a outra sessão commitar o bloco dela.
- Mecanismo paralelo ao do Harness — nota `harness-vis-o-…` — mesmo vocabulário do `mapa-fases.md`; a generalização reaproveita o esquema.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` (2026-11-01, ~10 min de sessão, antes de escrever este plano):

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 20 | 146k (máx.; inicial 97k, médio 123k) | 2 (`vault_deep_query_tool`) | ~3k |

Prefixo inicial: 97k, dos quais ~6k são nomes de tools MCP deferred e ~8k a lista de skills. Os 11 conectores do claude.ai foram desligados no início da unidade (memória `conectores-off-por-unidade`) e serão religados no fim.

## 5. Aprovação

**Aprovado:** sim · **Por:** responsável (Ian Benicio), na conversa ("Aprovar e commitar") · **Em:** 2026-11-01 · **Ajustes pedidos:** nenhum

Custo da sessão ao fechar a Fase 0 (`sessao.js`, 12 min): 26 chamadas · contexto inicial 97k, médio 131k, máximo 163k · escrita de cache 129k · saída 28k · sem subagentes.

Precedentes marcados como `aplicável` pelo responsável: nenhum até aqui.
