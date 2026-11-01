# Handoff — plano de evolução, etapa 1: MEL-01 e MEL-02

**Sessão:** `ed91c88e-f90e-4d99-90ea-91f6832a6f3d` (aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`) · **Executor:** @dev + @qa (SDC, caminho curto)
**Data:** 2026-11-01 · **Plano:** `docs/plano-de-execucao.md` (Fase 0 desta etapa) · **Base:** `main` @ `74ed558` · **Sem push**

## Entregas

| Entrega | Caminho | Commit |
|---|---|---|
| MEL-01: organizador de assets resistente a arquivos inválidos | `scripts/assets/organizar-assets.mjs`, `scripts/assets/organizar-assets.test.mjs`, `.claude/skills/protocolo-assets/SKILL.md` §4, story `docs/stories/mel-01-assets-resilientes.story.md` | `f594953` |
| Fase 0 e arquivamento do plano do piloto | `docs/plano-de-execucao.md` (novo), `docs/planos/2026-11-01-perfis-alvo.md` (plano do piloto, ainda ativo), ponteiros em `docs/catalogo-perfis-alvo.md` e §3 do plano de evolução | `f7d2be5` |
| MEL-02: regressão WPF classificada como ambiente | `docs/stories/mel-02-regressao-wpf.story.md`; aceites da MEL-01 e da MEL-02 marcados no plano de evolução | `be9376b` |
| Este handoff | `docs/handoffs/2026-11-01-evolucao-etapa1-mel01-mel02.md` | commit seguinte |

Retorno à versão anterior: `git revert be9376b f7d2be5 f594953`, um por vez e na ordem inversa, sem push.

## Decisões

- **MEL-01, estado novo `invalido`:** conteúdo reconhecido, mas inconsistente (WAV com menos de 22 bytes, chunk maior que o arquivo, `fmt` curto, WAVE sem `fmt` ou `data`). O item tem SHA-256 no catálogo, mas não é gravado nem entra na deduplicação. `falhou` continua sendo erro de E/S, agora também na leitura, no hash e em pasta interna ilegível. O campo `erro` começa pela etapa. Nenhuma coluna do catálogo mudou.
- **MEL-01, códigos de saída:** 0 tudo certo; 1 algum item `conflito`, `falhou` ou `invalido`, com catálogo gravado; 2 erro fatal (origem inexistente ou ilegível, destino não gravável), sem catálogo.
- **MEL-02, causa = ambiente:** o parecer rodou a suíte no sandbox elevado do Codex (`[windows] sandbox = "elevated"`, usuário `CodexSandboxOffline`, sem rede). Como usuário interativo, a suíte passa a partir de build limpo, nos dois caminhos de saída. Passo 3 (harness/produto) não aberto; nenhum arquivo de `reimplementacoes/notepad/` mudou. A MEL-02 fica P.
- **Arquivamento:** o plano do piloto foi para `docs/planos/2026-11-01-perfis-alvo.md`. Só os ponteiros vivos foram atualizados; os históricos (stories e handoffs antigos) ficaram como nos arquivamentos anteriores.

## Critérios e verificação

**MEL-01** — 4/4 aceites.
- [x] Regressões novas falham no código antigo (4 de 4, com `git show HEAD:…` em pasta temporária) e passam no novo.
- [x] `node --test scripts/assets/organizar-assets.test.mjs`: 9/9. `npm test`: 168/168 (eram 164).

**MEL-02** — 5/5 aceites.
- [x] Caminho padrão: `dotnet build --no-incremental`, depois `dotnet test --no-build` 2×: Core 137, UI 76 nas duas. DLL `D221F3D173B1B5CE`, reproduzida num segundo build limpo.
- [x] Caminho do QA (`--artifacts-path %TEMP%\mel02-qa-artifacts-2`): build limpo e 2×, Core 137, UI 76. DLL `D7B70E60AD7037B9`.
- [x] Binário do parecer (09:58, caminho padrão, compilado no sandbox do Codex): `91DBA8A2D76BD781`, registrado antes de ser substituído.
- [x] `git status -- reimplementacoes/notepad`: sem mudança.

`pre-commit` passou nos três commits, sem `--no-verify`.

## Pendências

- **Para a MEL-08** (lista completa na story MEL-02): a suíte WPF depende do usuário interativo, do foco e do clipboard; falta um pré-requisito detectável para "não executável"; falta reproduzir as 4 falhas no Codex para confirmar o mecanismo (hipótese: foco de teclado ausente no processo do sandbox).
- **Para a MEL-03:** `global.json` continua ausente; hoje há um só SDK (10.0.401).
- **Operacional, até a MEL-08:** rodar `npm run test:notepad` pelo Claude Code ou por terminal do responsável. No Codex, só com escalonamento para fora do sandbox.
- **Fora desta sessão:** MEL-06a (hash na admissão) e o resto da §12 do plano de evolução (MEL-03/MEL-08, baseline). Revisão de capacidade: esta etapa coube numa sessão.
- **Piloto do perfil do alvo:** U4 continua pendente. O plano dele agora está em `docs/planos/2026-11-01-perfis-alvo.md`; nada de `rea-niveis.json`, `00-seguranca.md` ou gate foi tocado.

## Falhas e retrabalho

- O `git mv` do arquivamento estava no índice e entrou no primeiro commit da MEL-01. Ele foi tirado do índice desse commit (`git restore --staged` + `commit --amend`, sem push e sem mexer na árvore) e foi para um commit próprio (`f7d2be5`).
- Teste novo da MEL-01 supôs a ordem de listagem na deduplicação; o nome do arquivo foi ajustado (`zz-copia.png`).
- Scripts com `\\` em heredoc no Bash tiveram as barras comidas; a solução foi gravar com Write.

## Precedentes e Engram

- Consultas (3, `vault_deep_query_tool`): ver §2 do plano. Usado: `prking-notepad-bloco-5-qa-gate-u4-pass-e-fechamento-do-s3` (verificável).
- Salvo: `testes-de-ui-wpf-falham-no-sandbox-elevado-do-codex-no-windo` (pattern, `maturidade/draft`, confiança `inference`).

## Métricas (`sessao.js`, antes do commit do handoff)

| Chamadas | Escrita cache | Leitura cache | Saída | Contexto médio / máx. | > 200k | Engram |
|---|---|---|---|---|---|---|
| 72 | 206k | 13,5M | 61k | 191k / 250k | 47% | 5 (3 consultas, 2 gravações, uma recusada por falta da tag `tipo/`) |

## Conectores

Não foram tocados.
