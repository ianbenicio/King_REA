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
| 1 | O GhidraMCP lê o programa aberto no Ghidra (info, funções, strings)? | **Sim.** PE x86-64, 498 funções (296 externas), entrada em `0x140023bd0`; SHA-256 informado pelo Ghidra igual ao da triagem; strings filtradas por "txt" retornam 4 itens (filtros de arquivo do diálogo) | `get_program_info`, `list_strings` (GhidraMCP) |
| 2 | O GhidraMCP descompila uma função e segue referências cruzadas? | **Sim.** `FUN_140023a50` é a inicialização do runtime do Visual C++ e chama `FUN_14000ae3c(hInstance, 0, linha de comando, modo da janela)`, o `wWinMain`. O filtro `*.txt` (`0x140027960`) tem 7 referências em 4 funções; `FUN_140008df0` o recebe como parâmetro (candidata ao diálogo Abrir/Salvar) | `decompile_function_by_address`, `get_xrefs_to` (GhidraMCP) |
| 3 | A renomeação via GhidraMCP fica só no banco de análise? | **Sim.** `FUN_14000ae3c` → `wWinMain`; SHA-256 da cópia inalterado após a renomeação | `rename_function_by_address`; `Get-FileHash` |
| 4 | O REA, com o provider Ghidra, abre o alvo e devolve visão geral com evidência? | **Em aberto:** o servidor REA não enxerga `GHIDRA_INSTALL_DIR`/`JAVA_HOME` até o app do Claude ser fechado e reaberto por completo (o `rea doctor` com as variáveis passa 10/10) | `open_binary` → `provider_unavailable` (`not_configured`) |
| 5 | O gate libera N0/N1 deste alvo e bloqueia níveis fora do plano? | **Sim.** N1 do GhidraMCP e do REA liberados; `rea/list_browser_targets` (N2) bloqueado antes de executar | Mensagens do `rea-gate.mjs` |

## Diário

- 2026-10-14 — Protocolo de segurança aprovado (C1, N0 + N1). Cópia em `alvos/notepad-teste/`.
- 2026-10-14 — Responsável importou e analisou a cópia no Ghidra (aberto pelo Explorer); aviso de PDB ausente (normal, sem servidor de símbolos). GhidraMCP testado de ponta a ponta: perguntas 1, 2, 3 e 5 respondidas. REA + Ghidra aguardando reinício completo do app.

## Critérios de conclusão

- [ ] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [ ] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [ ] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [ ] Bundle de evidência exportado para `saidas/<slug>/evidence.json`
- [ ] Responsável não pediu mais investigação
