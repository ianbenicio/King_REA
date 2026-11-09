# Handoff — Reconciliação @po da MEL-05 (2026-11-09)

**Sessão:** `836b5fcc` (continuação) · **Branch:** `docs/po-reconciliacao-mel-05`, a partir de `main` @ `e3a8164` (PRs #12 a #18 mesclados) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) (anterior arquivado em `docs/planos/2026-11-05-e3-2a-pr-a.md`) · **Executor:** @po (subagente `aiox-po`), conferido por mim. **Só documentação**: nenhum código, hook, mapa, ADR nem adendo mudou.

## 1. O que mudou

| Arquivo | Mudança |
|---|---|
| `docs/stories/mel-05-fatia-2-contrato-e-atributos.story.md` | F2-AC5, AC10 e AC13 reescritos pelo §7 do adendo 2 (8 valores de `recurso`, 5 de `contexto_execucao`, C1 ampliada, tabela C11 de 64 casas com C11-R1 e C11-R2, duas casas A como aviso); F2-AC14 ganha a frase das casas A; F2-AC18 a AC22 e AC26 anotados com o que a PR #17 entregou; P3, L1, L4 e L10 fechadas, L2 e L3 respondidas; nova seção "Reconciliação @po (2026-11-09)"; Change Log com antes e depois |
| `docs/stories/mel-05-contratos-integracoes.story.md` | tabela de perguntas do ADR §6 com a coluna "Decisão" (D-5 a D-9, DA-6, DA-7); P-7 e a linha P4 como decididas (DA-8, DA-15); fatia 4b em "G provável" (D-7, CLI entra); fatia 5 "sem objeto" (D-9); estado das fatias e dos PRs #12 a #18 |
| `docs/handoffs/2026-11-02-estado-geral.md` | itens 7 e 8 atualizados e item 9 novo (E3-2a e esta reconciliação) |

A story 2b não mudou. Nenhuma caixa de AC ou de task foi marcada, nenhum AC renumerado, nenhum `Status` alterado (conferido por `git diff`).

## 2. Conferência (minha)

- `git diff --name-only`: só as duas stories, mais o plano, o plano arquivado, o estado geral e este handoff.
- Checkboxes: F2-AC18 a AC20 continuam `[x]` (já marcadas pelo @dev); AC21, AC22 e AC26 continuam `[ ]`.
- F2-AC5, AC10 e AC13 lidos contra o adendo 2 §3 a §7 e §11: batem (8 valores, 5 valores, 64 casas, Q-A2-1, Q-A2-2, Q-A2-3, Q-A2-8).
- `node scripts/verificar/verificar.mjs --so integracoes`: aprovado, "contratos coerentes" (prova de não regressão; nada de código mudou).

## 3. Perguntas ao responsável (do @po; todas decididas em 2026-11-09, ver 3.1)

| # | Pergunta | Recomendação do @po |
|---|---|---|
| 1 | Aceita o texto proposto para o F2-AC18 ("único arquivo **da documentação do produto**")? Fato: a forma `GhidraMCP@` também aparece no `.mcp.json`, no verificador, nos testes e em 8 artefatos de processo | Aceitar (é a leitura do @dev e do @qa) |
| 2 | Reescrever agora o F2-AC3 e o F2-AC6, que ainda citam L3 e L2 como pendentes, aplicando a Q4 e a Q3 já decididas? | Sim, antes do PR-B |
| 3 | Quem marca as duas tasks do responsável na story da fatia 2 (L1 a L4 com P3, e P1 com P2), que as fontes já mostram cumpridas? | O orquestrador, citando as decisões registradas |
| 4 | A story-mãe deveria estar em InProgress desde 2026-11-05 (fatia 2 puxada). Fazer a transição? | Sim, com registro no Change Log |
| 5 | Lista fechada dos "caminhos suportados" (P-4): o Codex fica fora? | Fechar no adendo 3, com o mapa comando→nível |
| 6 | Conferir o tamanho total do plano (soma acima do M) antes da fatia 3 | Fazer quando o adendo 3 fixar o tamanho da 4b |

### 3.1 Decisões do responsável (2026-11-09, na conversa)

- **As 6 recomendações acima aceitas.** Aplicadas pelo @po (itens 1, 2, 5, 6) e por mim (itens 3 e 4: duas tasks do responsável marcadas na story da fatia 2 e story-mãe movida de InReview para InProgress, com registro no Change Log). Commit `120a7fa`.
- **Três perguntas novas do @po, respondidas pela recomendação:** (1) o item do provider Ghidra no mapa `rea` ganha **cliente próprio**, literal `rea-provider-ghidra` (vem do exemplo da opção escolhida, não de texto digitado por ele; fica anotado no Change Log), mantendo a unicidade de (`cliente`, `caminho`); (2) `cliente` do Codex: **`codex`**, um item por mapa, `caminho: mcp`, `estado: sem-adaptador`; (3) `catalogo.digest` em mapa `git`: **conferir o formato (64 hexadecimais) se presente; ausente não gera achado**, com dois testes novos previstos no F2-AC3.
- Nenhum AC marcado nem renumerado; a pontuação do @po na seção "Reconciliação" ficou em 10 (antes 9,5, por causa do conflito do F2-AC6, agora resolvido).

## 4. Não conferido

- O adendo 3 não existe em `docs/adr/`: a dependência da 4b aponta para documento por escrever.
- As Dev Notes da fatia 2 ainda trazem "Pontos de partida para P3, não decididos" (seção do @dev; o @po não a tocou).
- O pacote do REA não foi lido (a L10 cita o adendo 2 §8). O servidor MCP `rea` está desconectado nesta sessão (`CONNECTION_CLOSED`); não afetou esta unidade.

## 5. Fechamento

Conectores do claude.ai desligados no início; **religar ao fim** (memória `conectores-off-por-unidade`; 11 conectores). Engram: 1 consulta (FTS; embedding do Ollama fora do ar, sem `llama-server`), nenhum precedente aplicável. Memória de subagentes em `.claude/agent-memory/` (fora do git, não adicionar).
