# Handoff — perfil do alvo e pacote de recursos: U1 (levantamento retroativo)

**Sessão:** `3c3b8ee0-46cc-4c1c-82ff-278df3cabd91` (aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`) · **Executor:** @analyst
**Início:** 2026-11-01T13:14Z · **Fim:** 2026-11-01T13:40Z (aprox., no commit)
**Plano:** `docs/plano-de-execucao.md`, unidade U1 · **Base:** `main` @ `7626b03`

## Entregas

| Entrega | Caminho | Estado |
|---|---|---|
| Calibração retroativa dos 7 alvos | `docs/planos/2026-11-01-perfis-alvo-calibracao.md` | pronta |
| Este handoff | `docs/handoffs/2026-11-01-perfis-alvo-u1.md` | pronto |

## Critério de aceitação da U1 (plano, seção 3)

- [x] Os 7 alvos com tipo, objetivo e complexidade tirados do `00-seguranca.md` e do `01-analise.md` (calibração, seção 2). Complexidade: nenhum registro tem o campo. Ficam as medidas da triagem e da análise, mais um rótulo provisório marcado como juízo da U1.
- [x] Recursos realmente usados, com o id da sessão e a contagem: tools REA por família e Ghidra, protocolos e skills, subagentes, Engram, navegador e web (seções 1 e 3).
- [x] Recursos carregados e não usados (seção 4).
- [x] Toda linha com fonte e comando (seção 0: C1 `uso.js` isolado por sessão, C2 `sessao.js`, C3 `linha.js` do apêndice A, C4 `git log`). Conferido: os totais do C1 e do C3 batem nas 6 sessões com REA; o script do apêndice, extraído do próprio documento, reproduz as 40 chamadas do notepad-reimpl.

## Achados principais (detalhe na calibração, seção 5)

1. O tipo do alvo separou as famílias de tools sem exceção: nativo × JavaScript. A família sessão e evidência apareceu nos 7.
2. Das 170 tools do REA, 26 foram usadas em algum alvo; nenhuma das 24 de Android. O servidor `ghidra` ficou carregado em todas as sessões e teve 0 chamadas nos 4 alvos JavaScript.
3. `protocolo-mecanicas` e `protocolo-assets`: 0 invocações em todos os alvos, inclusive nos 5 jogos.
4. `protocolo-benchmark` foi invocado 2 vezes sem produto final: uma no blocos-a, com o benchmark já commitado, e uma no uo-classic, cujo benchmark foi revertido.
5. A complexidade apareceu como número de rodadas: uo-classic, 1 análise e 3 reaberturas com 190 chamadas; os pilotos, 1 rodada de 9 a 12 chamadas.

## Para a U2

- O catálogo pode ler a calibração para tirar as regras, mas não pode copiar resultado de piloto: nada de achados, placares ou nomes `blocos-*`/`encaixe-*`.
- Tipos sem alvo registrado (.NET/Unity, Unreal, Electron real, web real, Android, firmware) entram como hipótese.
- Dúvida da Fase 0 resolvida: as sessões antigas se ligam aos alvos pelos handoffs e, antes deles, pela escrita em `registros/<slug>/` e pelos caminhos `alvos/<slug>` nas chamadas (C3).

## Falhas e retrabalho

- O `uso.js` só conta por janela de dias. Para contar por sessão, o transcript foi copiado para uma pasta isolada, com o `homedir` apontado para lá (função `uso1`). O Harness não foi editado.
- A sessão `a0ea8d85` atendeu os dois notepads e a instalação do projeto. A divisão entre os alvos foi feita por janela de tempo (C3), e o custo dela não se divide por alvo.
- O primeiro heredoc do script auxiliar perdeu as barras invertidas no Git Bash. O script foi regravado com o Write.
- Os conectores do claude.ai foram desligados no início da unidade. Pelo comportamento do app, o desligamento só vale a partir do turno seguinte, então esta sessão rodou com eles ligados até o fim do primeiro turno.

## Métricas (`sessao.js --sessao 3c3b8ee0-46cc-4c1c-82ff-278df3cabd91`, perto do fim)

| Item | Principal | Subagentes |
|---|---|---|
| Chamadas | 37 | 0 |
| Contexto inicial / médio / máx. | 94k / 171k / 230k | — |
| Escrita de cache | 196k | 0 |
| Leitura de cache | 6,1M | 0 |
| Saída | 47k | 0 |

Engram: 0 chamadas (a U1 lê só registros e transcripts; o plano deixa o Engram como "sob demanda"). Nenhuma tool `rea` ou `ghidra`, `alvos/` não foi aberto.

## Conectores

11 conectores do claude.ai desligados no início: Supermetrics, Notion, Google Calendar, Claude Docs, viewmax.io, Gmail, Figma, Hugging Face, Supabase, Google Drive e AAR Maker. Religados depois do commit.

## Próxima unidade

**U2: catálogo de perfis** (@architect, crítica do @qa). Entrega: `docs/catalogo-perfis-alvo.md`. Entrada: esta calibração, `docs/plano-integracao-games.md` e `docs/benchmark-ferramentas-re.md`.
