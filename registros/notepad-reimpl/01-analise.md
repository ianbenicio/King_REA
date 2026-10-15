---
alvo: notepad-reimpl
status: em_andamento
inicio: 2026-10-15
fim:
---

# Análise — Bloco de Notas (especificação para reimplementação)

Produto desta análise: `registros/notepad-reimpl/especificacao.md`, em palavras próprias (sala limpa), entregue ao projeto `PRKing_Notepad`.

## Perguntas da análise

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Quais são todos os comandos (menus) e atalhos de teclado? | | |
| 2 | Quais diálogos existem (Localizar, Substituir, Ir para, Fonte, Configurar página, Sobre) e quais campos e opções têm? | | |
| 3 | Quais mensagens o programa mostra ao usuário e em que situações? | | |
| 4 | Quais codificações ele lê e grava, e como detecta a codificação de um arquivo? | | |
| 5 | Como trata quebras de linha (Windows, Unix, Mac) na leitura, na gravação e na barra de status? | | |
| 6 | Quais as regras de quebra automática de linha, barra de status e zoom? | | |
| 7 | Como funciona o ciclo de vida do arquivo (novo, abrir, salvar, salvar como, título da janela, alterações não salvas, linha de comando, arrastar e soltar)? | | |
| 8 | Quais preferências são lembradas entre execuções e onde? | | |
| 9 | Quais casos de borda existem (arquivo grande, somente leitura, recurso ".LOG", impressão)? | | |

## Diário

- 2026-10-15 — Protocolo de segurança aprovado (C1, N0 + N1). Cópias em `alvos/notepad-reimpl/`.

## Critérios de conclusão

- [ ] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [ ] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [ ] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [ ] Bundle de evidência exportado para `saidas/<slug>/evidence.json`
- [ ] Responsável não pediu mais investigação
