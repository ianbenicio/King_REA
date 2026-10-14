---
alvo: notepad-teste
status: em_andamento
inicio: 2026-10-14
fim:
---

# Análise — Bloco de Notas do Windows (alvo de treino)

## Perguntas da análise

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | O GhidraMCP lê o programa aberto no Ghidra (info, funções, strings)? | | |
| 2 | O GhidraMCP descompila uma função e segue referências cruzadas? | | |
| 3 | A renomeação via GhidraMCP fica só no banco de análise? | | |
| 4 | O REA, com o provider Ghidra, abre o alvo e devolve visão geral com evidência? | | |
| 5 | O gate libera N0/N1 deste alvo e bloqueia níveis fora do plano? | | |

## Diário

- 2026-10-14 — Protocolo de segurança aprovado (C1, N0 + N1). Cópia em `alvos/notepad-teste/`.

## Critérios de conclusão

- [ ] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [ ] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [ ] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [ ] Bundle de evidência exportado para `saidas/<slug>/evidence.json`
- [ ] Responsável não pediu mais investigação
