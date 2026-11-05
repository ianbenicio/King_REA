# Handoff — decisões do ADR-0001 §6 (itens 2, 4, 5, 8, 10) (2026-11-05)

**Sessão:** `836b5fcc` (continuação) · **Branch:** `docs/adr-0001-decisoes-6`, a partir de `origin/main` @ `7313b03` · **Mudanças:** só `docs/` (ADR §6/§7, story-mãe e este handoff). Nenhum código, hook, mapa, matcher, `.mcp.json`, `settings.json` ou `00-seguranca.md`.

## 1. Decisões (responsável, por `AskUserQuestion`)

| Item | Decisão | Recomendação | Efeito |
|---|---|---|---|
| 6.2 (D-5) | "Revisão nova" = protocolo novo por versão do alvo, `schema: 00-seguranca/1` | seguida | relatório da fatia 3: legado, inválido, revisão nova |
| 6.4 (D-6) | Aprovação **por nível**, como hoje | seguida | fatias 3 e 4a sem lista de tools aprovadas |
| 6.5 (D-7) | CLI **entra** na recusa de tool desconhecida | **contrária** (era deixar de fora) | fatia 4b inclui a recusa e o **mapa comando→nível** (inexistente, D6); exige adendo ao ADR; provável G |
| 6.8 (D-8) | Parser em `.claude/hooks/lib/`; CI da fatia 3 só com fixtures | seguida | gate importa sem depender de `scripts/` |
| 6.10 (D-9) | Matcher só conferido, não gerado | seguida | fatia 5 sem objeto |

6.7 e 6.9 já estavam decididas pelo adendo 1 (DA-6, DA-7); o ADR §6 agora diz isso. Fatias 2 e 2b: Q1 a Q5 e M1 a M4 já respondidas em 2026-11-04 (nada a perguntar).

## 2. O que ainda é do responsável

- **P1 da fatia 2:** aprovação para editar `rea-niveis.json` e `ghidra-niveis.json`. Não dada; vem depois do adendo 2, por lote.

## 3. Próximos passos (nenhum iniciado)

1. **Adendo 2 ao ADR-0001** (@architect): `recurso`, tabela C11, `contexto_execucao`. Bloqueia o PR-B da fatia 2.
2. **Adendo 3 (novo, @architect)** para o mapa comando→nível do `cli-gate` (D-7), antes da 4b. Reconciliar a story-mãe (@po/@sm): tamanho da 4b e a frase "desenho para depois da 6.5".
3. PR-A da fatia 2 e fatia 2b (@dev, @qa), conforme o handoff `2026-11-04-craft-melhorias.md`.

## 4. Limites e ressalvas

- Story-mãe: só a seção de decisões e o Change Log receberam registro; tabela de abertas (linhas 177-185) e tabela de fatias ficaram como estavam, com nota apontando o desatualizado. Reconciliação cabe ao @po.
- Push, PR e merge: não feitos. Commit local apenas; envio só pelo @devops, com autorização.
- `.claude/agent-memory/` fora do git; não adicionar.
