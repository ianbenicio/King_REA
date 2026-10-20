---
alvo: notepad-reimpl
status: concluida
inicio: 2026-10-15
fim: 2026-10-20
---

# Análise — Bloco de Notas (especificação para reimplementação)

Produto desta análise: `registros/notepad-reimpl/especificacao.md`, em palavras próprias (sala limpa), entregue à reimplementação em `reimplementacoes/notepad/` (mesmo repositório; decisão do responsável em 2026-10-20).

## Perguntas da análise

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Quais são todos os comandos (menus) e atalhos de teclado? | **Respondida.** 5 menus, 30 comandos; 3 tabelas de atalhos (principal, global e uma do modo de instalação). Tabela na especificação, seção 2 | `recursos` (menu 1, atalhos); `ev_b872dd6b…` (dispatcher `FUN_140008df0`) |
| 2 | Quais diálogos existem e quais campos e opções têm? | **Respondida.** 4 diálogos próprios (progresso de impressão, configurar página, ir para linha, lista de codificação anexada às caixas Abrir/Salvar) + diálogos comuns do sistema (localizar, substituir, fonte, imprimir, abrir, salvar) | `recursos` (diálogos 11, 12, 14, 15); `ev_d067b1e3…`, `ev_e59a1e1a…`, `ev_f1abaa46…` |
| 3 | Quais mensagens o programa mostra e em que situações? | **Respondida.** 8 situações (seção 11 da especificação), descritas em texto próprio | `recursos` (66 strings); `ev_5e920d35…`, `ev_70133329…`, `ev_6b39255b…` |
| 4 | Quais codificações ele lê e grava, e como detecta? | **Respondida.** 6 codificações; detecção: BOM → teste estatístico de UTF-16 (ignorado se < 100 bytes e só estatístico) → UTF-8 estrito → ANSI. BOM gravado em UTF-16 LE/BE e UTF-8 com BOM; aviso de perda ao gravar ANSI, com recarga do disco | `ev_70133329…` (carregador), `ev_5e920d35…` (gravação), `ev_9cf4e65e…`, `ev_477a878f…` |
| 5 | Como trata quebras de linha? | **Respondida em parte.** Detectadas do conteúdo pelo controle de edição do sistema; exibidas na barra de status; gravadas como estão. Arquivo misto: lacuna | `ev_12f4d9f7…` (barra de status); `unk_a2f146a7…` |
| 6 | Regras de quebra automática, barra de status e zoom? | **Respondida.** Quebra remove a rolagem horizontal; barra de status com 5 partes (posição, zoom, fim de linha, codificação); zoom 10–500 % em passos de 10 | `ev_6b39255b…`, `ev_12f4d9f7…`, `ev_b872dd6b…` |
| 7 | Ciclo de vida do arquivo? | **Respondida.** Novo/abrir/salvar/salvar como, pergunta de alterações, título com asterisco, gravação no próprio arquivo com truncamento, linha de comando (`/A`, `/W`, `/P`, `/PT`, `.txt` implícito, criar se não existir), arrastar e soltar | `ev_e743c1e4…`, `ev_6b39255b…`, `ev_4b052a80…`, `ev_4839fed4…`, `ev_35ebb69f…`, `ev_1b0119a0…`, `ev_5e920d35…` |
| 8 | Quais preferências são lembradas e onde? | **Respondida.** Registro do usuário: fonte, quebra, barra de status, janela, busca, página, codificação padrão. A reimplementação usa arquivo próprio | `ev_dd69680a…` |
| 9 | Casos de borda? | **Respondida.** Limite de 1 GiB; NUL vira espaço; `.LOG` em maiúsculas insere hora/data no fim; arquivo novo é apagado se a gravação falhar; impressão com códigos de cabeçalho/rodapé | `ev_70133329…`, `ev_f75edfe2…`, `ev_70c912bb…`, `ev_5e920d35…`, `recursos` |

## Diário

- 2026-10-15 — Protocolo de segurança aprovado (C1, N0 + N1). Cópias em `alvos/notepad-reimpl/`.
- 2026-10-15 — Recursos decodificados com `scripts/re/decodificar-recursos-pe.py` (novo, só biblioteca padrão) a partir do `.mui` pt-BR; saída em `saidas/notepad-reimpl/recursos.json`.
- 2026-10-15 — REA + Ghidra headless: dispatcher de comandos, hora/data, carregador, gravação, barra de status, `wWinMain`, inicialização e linha de comando. 33 registros de evidência, 2 lacunas (fins de linha mistos; itens "a confirmar" da especificação, confirmáveis por uso normal do programa). Bundle em `saidas/notepad-reimpl/evidence.json`. Sessão fechada.
- 2026-10-15 — Especificação escrita em palavras próprias, sem código descompilado nem textos da Microsoft além de rótulos funcionais.

## Critérios de conclusão

- [x] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [x] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [x] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns` (2 abertas, ambas de severidade baixa, resolvíveis sem ferramentas de RE)
- [x] Bundle de evidência exportado para `saidas/<slug>/evidence.json`
- [x] Responsável não pediu mais investigação

**Encerramento (2026-10-20):** concluída por decisão do responsável, **sem protocolo de benchmark**. As 2 lacunas (severidade baixa) ficam para confirmação por uso normal do programa, sem ferramentas de RE. Alvo desativado (`registros/ALVO_ATIVO` removido). A especificação segue para `reimplementacoes/notepad/`.
