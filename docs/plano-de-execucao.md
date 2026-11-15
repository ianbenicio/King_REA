# Plano de execução — etapa 3 do plano de evolução: reconciliação @po da MEL-05 (docs)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade de documentação: nenhum código, hook, mapa nem verificador muda.
O plano anterior (E3-2a, PR-A) está em docs/planos/2026-11-05-e3-2a-pr-a.md.
-->

**Data:** 2026-11-09 · **Sessão:** `836b5fcc` (continuação) · **Projeto:** PRKing_REA · **Branch/commit:** `docs/po-reconciliacao-mel-05` @ `e3a8164` (igual ao `origin/main`; PRs #15 a #18 mesclados)

## 0. Sessão concorrente

`sessao.js --lista 4`: a mais recente é esta sessão; as demais (2026-11-04 13:21, 2026-10-23, 2026-11-01) têm handoff em `docs/handoffs/`. `git status`: só `.claude/agent-memory/` (fora do git, não adicionar). Worktree `.claude/worktrees/craft-melhorias-852ea7` pertence à sessão `craft-melhorias` (PR #18 já mesclado): não é desta unidade e não foi tocado. Os 11 conectores do claude.ai foram desligados no início da unidade.

## 1. Enquadramento

**Objetivo:** o @po reconcilia as stories da MEL-05 com o que o responsável decidiu e com o que a PR-A entregou, sem inventar regra: F2-AC5, AC10 e AC13 pela tabela do §7 do adendo 2; F2-AC18 (leitura de "único arquivo"); F2-AC21 (o que a PR-A fechou e o que vai ao commit 8); tabela de perguntas abertas e tamanho da fatia 4b na story-mãe.

**Restrições:** só os arquivos `docs/stories/mel-05-*.story.md` (e o Change Log deles); o @po **não edita** ADR nem adendos (são do @architect), seção QA Results (é do @qa), checkboxes de AC (são de quem entrega, com evidência) nem código, hooks, mapas, `.mcp.json`, `settings.json`, `00-seguranca.md`, `registros/_modelos/`; nenhuma tool `rea` ou `ghidra`; nada em `alvos/` nem `saidas/`; sem `--no-verify`, sem `--force`; push, PR e merge só pelo @devops com autorização do responsável; textos em português com acentuação; commit em inglês com `[Story MEL-05]`; nada que o ADR e os adendos não sustentem (Art. IV, No Invention): ponto sem fonte vai como pergunta ao responsável.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26, GitHub Actions · integrações: MCP `rea` (170 tools, **hoje desconectado**) e `ghidra` (30) · UI não · dados sensíveis: nenhum no checkout · fase AIOX: SDC fase 1-2 (revalidação @po) · complexidade SIMPLE (só prosa em duas stories).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Leitura do F2-AC18 ("único" na documentação do produto ou no repositório inteiro) | não | O @po propõe; decisão do responsável, que fica registrada na story |
| Tamanho da 4b | não | O @po só reescreve se o adendo 2 ou as decisões de 2026-11-05 sustentarem; senão, pergunta |
| Reconciliação inclui `docs/handoffs/2026-11-02-estado-geral.md` (itens 7 e 8 desatualizados)? | sim | Não: fica comigo no fechamento, é estado geral e não story |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| reconciliação de stories e ADR pelo Product Owner depois de decisões do responsável (ACs, perguntas abertas, estimativa), markdown, REA | 8 | n/d (busca caiu em FTS: embedding indisponível, Ollama sem `llama-server`) |

**Usados:** nenhum precedente aplicável. Os 8 resultados são notas de contexto do projeto ou de outros projetos, sem relação com reconciliação de stories.

**Descartados:** todos (`despensa-*`, `01HZ_HANDOFF_*`, notas do REA sobre gate, verificador e piloto): objeto diferente.

Resultado vazio também é dado. O embedding do Engram está fora do ar (aviso do SessionStart); a consulta usou FTS.

## 3. Plano preliminar

**Workflow AIOX:** SDC fases 1-2 (revalidação pelo @po); sem fases 3-4, pois não há código.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | Fase 0 | esta sessão | este plano | pedido do responsável | ~180k |
| 2 | Reconciliação | @po (subagente `aiox-po`) | stories da fatia 2, 2b e mãe atualizadas; Change Log; lista de perguntas ao responsável | cada mudança cita a fonte (ADR, adendo, decisão datada); nada fora das stories | idem |
| 3 | Conferência | esta sessão | `git diff` revisado | só `docs/stories/mel-05-*` no diff; ACs não perdem texto sem registro; `npm test` e verificador aprovam | idem |
| 4 | Fechamento | esta sessão | estado geral, handoff `docs/handoffs/2026-11-09-po-reconciliacao.md`, 1 a 2 commits | pergunta sobre PR e merge | idem |

**Capacidades por fase:** `aiox-po` (Read, Grep, Glob, Write, Edit, Bash); conectores claude.ai desligados; nada sob demanda.

**Verificações:**

| Entrega | Como provar |
|---|---|
| Só stories mudam | `git diff --name-only origin/main` lista apenas `docs/stories/mel-05-*.story.md` (e o plano, o plano arquivado e o handoff, que são processo) |
| Sem perda de AC | diff lido: texto removido de AC aparece no Change Log com a razão |
| Repositório íntegro | `node scripts/verificar/verificar.mjs --so integracoes` e `npm run lint` aprovam (nenhum código mudou; é prova de não regressão) |

**Riscos:** (1) @po inventa regra para fechar lacuna — mitigação: Art. IV; ponto sem fonte vira pergunta. (2) Editar além das stories — conferência por `git diff --name-only`. (3) Perder rastreio do AC original — Change Log com antes e depois.

## 4. Custo da Fase 0

Saída de `sessao.js` ao fim do passo 3: 199 chamadas (principal), 207 (subagentes); contexto médio 189k, máximo 266k, 2 compactações; Engram: 1 consulta `deep` (FTS) com ~2k de resultados.

## 5. Aprovação

**Aprovado:** sim, pelo pedido direto do responsável na conversa ("Reconciliação @po"), sem `AskUserQuestion` separado, por ser unidade só de documentação · **Ajustes pedidos:** nenhum.
