---
alvo: uo-classic
status: em_andamento
inicio: 2026-10-26
fim:
---

# Análise — Ultima Online Classic (uo-classic)

<!-- status: em_andamento | concluida. Ao marcar concluida, perguntar ao responsável se pode executar o protocolo de benchmark. -->

Escopo aprovado: só o patcher (`alvos/uo-classic/instalacao/`), níveis N0 e N1. O cliente e os dados entram por nova triagem quando forem baixados.

## Perguntas da análise

Copiadas do objetivo em `00-seguranca.md`.

| # | Pergunta | Resposta | Evidência |
|---|---|---|---|
| 1 | Qual é o formato da configuração (`UO-patch.cfg`) e do manifesto que o patcher consome? | | |
| 2 | Como o patcher descobre, baixa e confere os arquivos do cliente (repositórios, módulos, verificação de integridade)? | | |
| 3 | O que o patcher grava no disco e no registro? | | |

## Diário

- 2026-10-26 — Protocolo de segurança aprovado (N0, N1). Triagem passiva sem REA: só existe o bootstrap do patcher (Bioware Patch Client 1.0.6.5, PE32 x86, MSVC); não há cliente nem dados. Nenhuma tool do REA usada ainda.

## Critérios de conclusão

- [ ] Toda pergunta respondida com evidência, ou marcada "em aberto" com motivo
- [ ] Sistemas principais do alvo identificados, cada um com ao menos uma evidência
- [ ] Lacunas registradas no REA (`record_unknown`) e conferidas com `list_unknowns`
- [ ] Bundle de evidência exportado para `saidas/uo-classic/evidence.json`
- [ ] Responsável não pediu mais investigação
