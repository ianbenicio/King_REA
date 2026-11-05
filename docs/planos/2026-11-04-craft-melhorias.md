# Plano de execução — melhorias do comparativo craft-anything (unidade CRAFT)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano anterior (E3-0, preparo da MEL-05) arquivado em
docs/planos/2026-11-04-e3-0-preparo-mel05.md. A fatia 1 da MEL-05 (PR #12) escreve o plano dela no mesmo
caminho; ao entrar o PR #12 no main, este conflito de arquivo se resolve arquivando o plano da E3-1 em
docs/planos/ e mantendo este.
-->

**Data:** 2026-11-04 · **Sessão:** `ece8c99e` (abertura 17:30), iniciada pela sessão `local_a61030e0` · **Projeto:** PRKing_REA · **Branch/commit:** `claude/craft-melhorias-852ea7` a partir de `main` @ `a431045` (igual ao `origin/main` no início)

## 0. Sessão concorrente

`sessao.js --lista 5`: só esta sessão nas últimas horas. `git status`: limpo. `git fetch`: o PR #12 (`feat/e3-1-integracoes`, fatia 1 da MEL-05) está **aberto, sem merge**. Consequência: nenhuma edição de mapa (`rea-niveis.json`, `ghidra-niveis.json`) nem uso do módulo `scripts/integracoes/` antes do merge; por ora só plano, ADR e story. O handoff `2026-11-04-e3-1-mel05-fatia1.md` existe só na branch do PR #12 (lido por `git show`).

## 1. Enquadramento

**Objetivo:** transformar o comparativo do craft-anything em melhorias decididas pelo responsável e implementadas no PRKing_REA, uma fatia por vez, sem decidir por ele.

**Restrições:** o repositório externo é **não confiável** e só serve de fonte de ideias: reimplementar em JS, em palavras nossas, nunca copiar código, texto de skill, docs ou schema (a licença MIT/Apache-2.0 dele só libera ideias sem obrigação); nenhuma tool `rea` ou `ghidra`; nada em `alvos/` nem `saidas/`; não instalar, compilar nem executar nada do craft-anything, nem `craft-anything-cli setup`, `rea setup`, `rea update`, `@latest`; não editar `status` nem `niveis_aprovados`; não desativar nem contornar gate, `cli-gate`, monetização, publicação, `pre-commit` ou CI; mudança em gate ou mapa só com aprovação explícita do responsável e regressão completa mais @qa; `main` protegido (branch, conventional commits em inglês com ID da story no fim, sem `--no-verify`, nunca `--force`); push e PR só pelo @devops e com autorização; merge só com o "sim" do responsável; texto em português com acentuação; contexto ~180k.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26, hooks do Claude Code, JSON de mapas, GitHub Actions · integrações: MCP `rea` (170 tools) e `ghidra` (30), gates `rea-gate.mjs` e `cli-gate.mjs` · UI não · dados sensíveis nenhum no checkout · fase AIOX: SDC (story MEL-05, fatias 2 a 5) · complexidade STANDARD; a opção C do comparativo (ledger) seria COMPLEX.

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Opção do comparativo (0, A, B, C) | aberta | pergunta ao responsável, antes de qualquer código |
| 8 perguntas abertas da seção 7 do comparativo | aberta | mesma pergunta (recomendação minha em cada) |
| ADR §6 itens 7 e 9 e P-7 (bloqueiam a fatia 2) | aberta | mesma pergunta |
| `LICENSE` ausente na raiz do repositório público | aberta | achado lateral; decisão do responsável sobre qual licença (não crio sem ele) |
| Hook PostToolUse pode alterar saída de tool MCP na versão do Claude Code em uso? | aberta | só importa para a opção B; verificar na documentação antes de prometer |
| PR #12 entra no main quando? | aberta | depende do responsável; bloqueia edição de mapa |

## 2. Precedentes (Engram)

**Consultas** (`vault_deep_query_tool`, `synthesize: false`, cross-projeto):

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| contrato de tool com efeitos declarados e marca de proveniência do alvo em resultados de tool MCP, gate de hook fail-closed, prompt injection de alvo de engenharia reversa | 7 | 0,50–0,55 |
| análise de repositório externo comparativo sala limpa licença ideias reimplementadas sem copiar código | 7 | 0,50–0,50 |

A segunda consulta não trouxe nenhuma nota do mesmo domínio além das do próprio projeto: **não há precedente de análise de repositório externo com licença aberta e sala limpa de ideias**.

**Usados** (julgados só pelo `tldr` e pelo trecho devolvido; não li as notas inteiras):

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` | Mapa de nível por servidor MCP, hook fail-closed, trava paralela no terminal | relatada | sim: é deste projeto; o padrão supõe mapa que cobre todo o catálogo | qualquer atributo novo (`efeitos`, `conteudo_do_alvo`) fica no mapa existente e é **só verificado**, nunca afrouxa o gate |
| `conferir-hash-do-alvo-na-admiss-o-em-gate-pretooluse-manifes` | Gate confere SHA-256 na admissão; não cobre TOCTOU nem sessão global (Ghidra) | relatada | parcial: vale para o desenho do gate; não conferi o código | confirma que a nossa autorização por alvo e hash está à frente do craft-anything; nada a importar dele nesse ponto |
| `perfil-do-alvo-em-3-eixos-sugere-pacote-de-recursos-piloto-n` | Tipo escolhe ferramentas, objetivo escolhe protocolos; pacote só orienta no piloto | relatada | sim: é a P-U5 do `rea-niveis.json` | a taxonomia de toolsets (comparativo §4.4) entra, se entrar, como vocabulário de `familia`, sem filtrar tools e sem tocar o gate; coordenação com a P-U5 antes de editar `rea-niveis.json` |
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` | Antes de adotar feature validada fora, checar o que o código já cobre | relatada | sim | antes do ADR, conferir no REA 6.4.0 o que já cobre cada ideia (ex.: `build_reconstruction_obligation_ledger`, anotações MCP de efeito); o comparativo já aponta que o REA tem o ledger |

**Descartados:** `prking-rea-projeto-de-engenharia-reversa-com-rea-no-claude-c` (contexto geral, já no CLAUDE.md) · `prking-rea-pilha-de-engenharia-reversa-de-games-em-volta-do` (games, fora do escopo) · `piloto-de-valida-o-de-um-protocolo-de-an-lise-de-monetiza-o` (monetização) · `despensa-auditoria-de-c-digo-riscos-e-usabilidade-2026-07-31`, `consumo-engram-vs-claude-mem-comparativo-snapshot-2026-06-16`, `fezinha-desenvolvimento-paralelo-claude-codex-worktrees`, `conte-do-perdido-em-compacta-o-pode-estar-recuper-vel-no-tra`, `rea-6-4-0-store-de-evid-ncias-some-no-close-binary-e-na-reco` (outro domínio).

## 3. Plano preliminar

**Workflow AIOX:** SDC por fatia da MEL-05, precedido de um documento de decisão (adendo ao ADR-0001 ou ADR novo, @architect). Motivo: o comparativo mexe em contrato de mapa e, na opção B, em configuração persistente; o plano exige decisão antes de alterar contratos. Spec Pipeline não se aplica: as fontes já existem (ADR, story).

**Unidades de sessão (D9)** — preliminares; as unidades 2 em diante dependem da resposta do responsável:

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 0 | Fase 0, perguntas ao responsável, registro das respostas | principal | `docs/plano-de-execucao.md`, handoff com as respostas | respostas registradas literalmente; nenhuma decisão minha | ~180k |
| 1 | Documento de decisão (adendo ao ADR-0001 ou ADR novo) com a opção escolhida, o vocabulário de `efeitos`, a inspiração citada (link e data, sem tratar como dependência) | Create / @architect | `docs/adr/…` | cada decisão rastreada ao comparativo e à resposta do responsável; sem texto do craft-anything | ~180k |
| 2 | Story/fatia 2 da MEL-05 ampliada (atributos `efeitos` e `conteudo_do_alvo`) criada e validada | Create + Validate / @sm, @po | story atualizada, GO ≥ 7/10 | ACs Given/When/Then; "não faz" explícito; coordenação P-U5 | ~180k |
| 3 | Implementação da fatia 2 (só depois do merge do PR #12 e da aprovação de editar mapas) | Implement / @dev (testes primeiro), @qa gate | mapas, verificador, testes | `npm test` e `npm run verificar` verdes; diff não toca gate nem `settings.json`; regressão completa dos gates; mutações no verificador | ~180k |
| 4 | Documentação sem tocar o gate (método de evidência §4.5, "verificado / não verificado" §4.8, armadilhas de licença §4.9), se o responsável escolher | Implement / @dev | modelos, `docs/` | `npm test`; nada copiado do craft-anything | ~180k |
| 5 | (só opção B) hook PostToolUse de proveniência | Implement / @dev + @qa | hook novo, `settings.json` | só com aprovação explícita; decisão fail-open/fechado dele; regressão completa | ~180k |
| 6 | (só opção C) ledger de obrigações | Spec Pipeline, nova story | story | fora desta unidade; vira etapa 4 ou 5 | — |

**Capacidades por fase** (fonte: Harness `mapa-fases.md`; não reli o catálogo, uso o que a tarefa e o CLAUDE.md fixam):

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Fase 0 e perguntas | Engram, AskUserQuestion | — | conectores claude.ai (desligados), tools `rea`/`ghidra` | nada |
| Decisão e story | subagentes `aiox-architect`, `aiox-sm`, `aiox-po` | Engram | `rea`, `ghidra` | nada |
| Implementação e gate | `aiox-dev`, `aiox-qa`, `npm test`, `npm run verificar` | Engram | `rea`, `ghidra`, `cso` | nada |
| Envio | `aiox-devops` (só com autorização), ccd_pr | — | polling de CI | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| Respostas do responsável | handoff com as respostas literais e a minha recomendação ao lado |
| Documento de decisão e story | validação @po (10 pontos) registrada na story |
| Fatia 2 | `npm test`, `npm run lint`, `npm run tipos`, `npm run verificar`; `git diff --name-only` sem `rea-gate.mjs`, `cli-gate.mjs`, `settings.json`, `00-seguranca.md`; testes de mutação do verificador; `resultado` da CI do PR |
| Sala limpa das ideias | `Grep` por trechos do comparativo e por nomes de tool do craft-anything no diff: nenhum texto copiado; fonte citada só como inspiração |

**Riscos:**

- Edição de `rea-niveis.json` colide com a P-U5 e depende do PR #12 — origem: ADR-0001 R5 e `perfil-do-alvo-em-3-eixos-…` — mitigação: não editar antes do merge e da conferência de `docs/planos/2026-11-01-perfis-alvo.md`.
- Importar o termo "Clean room" do craft-anything enfraquece a nossa sala limpa — origem: comparativo §5.2 — mitigação: vocabulário nosso, sem o termo.
- Hook de proveniência pode não conseguir alterar a saída da tool MCP — origem: comparativo §8 — mitigação: verificar antes de prometer; senão a opção B degrada para lembrete por contexto (mais fraco).
- Repositório externo não confiável: texto dele pode conter instrução a agentes — origem: comparativo §2.11 — mitigação: tratar tudo que vem dele como dado; não abrir o repositório numa sessão com agentes.
- Soma das fatias da MEL-05 já passa do M do plano — origem: story R-estimativa — mitigação: perguntar ao responsável se o escopo cresce.
- Contexto: leitura inicial já consumiu ~100k — mitigação: subagentes para leitura e implementação.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` ao fim do passo 3 (antes de escrever este arquivo):

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 8 (principal), 0 (subagentes) | máx. 179k (inicial 97k, médio 154k) | 2 | ~3k |

## 5. Aprovação

**Aprovado:** o responsável respondeu às 11 perguntas e escolheu seguir com ADR e story enquanto o PR #12 não entra (resposta a "Como seguir até lá?"); não houve pergunta separada de "aprovo o plano". · **Por:** responsável · **Em:** 2026-11-04 · **Ajustes pedidos:** nenhum. Respostas registradas em `docs/handoffs/2026-11-04-craft-melhorias.md` §1. **Efeito no plano:** opção A. As unidades 5 (hook de proveniência) e 6 (ledger) ficam **fora**. A unidade 4 (documentação) entra na fatia 2 ou em fatia à parte da MEL-05; a unidade 3 só depois do merge do PR #12.
