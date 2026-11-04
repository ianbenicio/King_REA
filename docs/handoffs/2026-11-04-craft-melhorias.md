# Handoff — CRAFT: melhorias do comparativo craft-anything (2026-11-04)

**Sessão:** `ece8c99e` (aberta em 2026-11-04 17:30, iniciada pela sessão `local_a61030e0`) · **Branch:** `claude/craft-melhorias-852ea7`, a partir de `main` @ `a431045` · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) (anterior arquivado em `docs/planos/2026-11-04-e3-0-preparo-mel05.md`) · **Fonte das ideias:** comparativo de 2026-11-04 (fora do repositório, em `side-session-notes/local_a61030e0…/craft-anything-comparativo.md`); o repositório externo é não confiável e só fornece ideias, reimplementadas em palavras e código nossos.

## 1. Decisões do responsável (2026-11-04, nesta unidade)

Respostas dadas por `AskUserQuestion`; a recomendação listada ao lado era a minha, e ele a seguiu em todas.

| Pergunta | Resposta | Efeito |
|---|---|---|
| Opção do comparativo (0, A, B, C) | **A** | só contrato na fatia 2 da MEL-05 (`efeitos` e `conteudo_do_alvo`), mais método de evidência (§4.5), "verificado / não verificado" (§4.8) e armadilhas de licença (§4.9) nos documentos. **Sem hook novo, sem ledger.** B e C ficam como ideias registradas (perguntas 3 e 7 do comparativo: não agora) |
| Vocabulário de `efeitos` (pergunta 2) | **nosso**, ~8 valores, em português | mapeado nas anotações MCP quando o REA as expuser |
| `LICENSE` ausente na raiz (achado lateral, pergunta 6) | **fica para depois** | pendência registrada; nenhum arquivo criado |
| Auditar o craft-anything como ferramenta (pergunta 4) | **o benchmark basta** | nenhuma unidade de auditoria |
| Taxonomia de 17 toolsets como `familia` da U5 (pergunta 5) | **registrar como ideia** | `familia` não é preenchida agora |
| O que mudou no REA depois da 6.4.0 (pergunta 8) | **fica para depois** | pendência |
| ADR §6 item 7 (auditoria do GhidraMCP) | **mover para `docs/seguranca/`** | o campo `auditoria` do contrato aponta para um arquivo de auditoria; a fatia 2 faz a mudança, só em docs |
| ADR §6 item 9 (estado inicial da matriz e Codex) | **aceitar como proposta** (ADR §2e) | provider Ghidra do REA "a confirmar", Codex "sem adaptador", sem prazo |
| P-7 (matriz só impressa ou também em documento) | **impressa e em documento** | o verificador imprime e o `guia-rea.md` ganha a tabela (aceite P4: "inventário e documentação") |
| Como seguir enquanto o PR #12 não entra | **esperar; fazer ADR e story** | nenhuma edição de mapa antes do merge do #12 |

Não perguntado nem decidido: o merge do PR #12 (decisão e execução dele); o hook PostToolUse (opção B, fora).

## 2. Entregas

(Preenchido ao fim da unidade.)
