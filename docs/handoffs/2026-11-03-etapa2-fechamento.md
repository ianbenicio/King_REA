# Handoff — fechamento da etapa 2 e passagem para a etapa 3 (2026-11-03)

**Sessão:** `d883db9d` (aberta por `local_c49d87ce`) · **Estado de partida da próxima sessão:** `main` @ `27cbb4c`, igual ao `origin/main`, `npm test` 277/277, árvore limpa (só `.claude/agent-memory/`, fora do git) · **Plano de evolução:** [§5 (etapa 2) e §6 (etapa 3)](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) · **Prompt da próxima sessão:** [`2026-11-03-prompt-etapa3.md`](2026-11-03-prompt-etapa3.md)

## 1. Etapa 2 encerrada

Condição de saída: "clone limpo executa as verificações e a CI publica resultado agregado fiel". Cumprida em 2026-11-03, quando a CI entrou no `main` (PR #1, `e8956f5`; [run do push](https://github.com/ianbenicio/King_REA/actions/runs/41645374091) verde).

| Unidade | Story | Situação | Handoff |
|---|---|---|---|
| E2-1 | MEL-03, 04, 08 | validação @po, três GO | [2026-11-02-e2-1-validacao-po.md](2026-11-02-e2-1-validacao-po.md) |
| E2-2 + E2-6 | MEL-03 | Done: `lint` (Biome 2.5.15), `tipos` (TypeScript 6.0.3), clone limpo 14/14 | [2026-11-02-e2-2-lint-tipos.md](2026-11-02-e2-2-lint-tipos.md) |
| E2-3 + E2-3b | MEL-04 | Done: publicação compartilhada e gitleaks 8.30.1 isolado | [2026-11-02-e2-3-publicacao.md](2026-11-02-e2-3-publicacao.md), [2026-11-03-e2-3b-gitleaks.md](2026-11-03-e2-3b-gitleaks.md) |
| E2-4a + E2-4b | MEL-08 | agregador, sonda WPF, auditoria das cinco actions | [2026-11-02-e2-4a-mel08-local.md](2026-11-02-e2-4a-mel08-local.md), [2026-11-02-e2-4b-auditoria-actions.md](2026-11-02-e2-4b-auditoria-actions.md) |
| E2-5 | MEL-08 | InReview: CI ativa, AC1–AC9 com evidência | [2026-11-03-e2-5-ativacao-ci.md](2026-11-03-e2-5-ativacao-ci.md) |

## 2. O que mudou para todas as sessões daqui em diante

- **O `main` é protegido.** Check exigido `resultado` (workflow `.github/workflows/verificacao.yml`), inclusive para o administrador (`enforce_admins` ligado em 2026-11-03), sem force push nem exclusão. **Push direto no `main` é recusado: toda mudança entra por PR**, com a CI verde.
- **Fluxo de envio:** commit local por entrega numa branch; o @devops envia a branch e abre o PR com autorização do responsável; o merge no `main` precisa do "sim" do responsável na conversa. Usar merge commit quando o texto citar SHAs da branch (o rebase do GitHub reescreve os SHAs).
- **A CI roda o mesmo verificador do clone local** (`node scripts/verificar/verificar.mjs --so … --json`), em cinco jobs: `js`, `dotnet`, `wpf-interativo` (Windows), `semgrep`, `publicacao` (Ubuntu). Componente novo no verificador precisa entrar em algum job: o `workflow-ci.test.mjs` reprova se ficar de fora, se o `--so` do YAML divergir do `JOBS` do agregador ou se uma action sair da auditoria.
- **Mudar o workflow** exige o teste do workflow verde e, para action nova ou nova versão, auditoria em `docs/seguranca/auditoria-actions-ci.md` antes.
- **"Não executado" nunca é verde.** Sem Docker, o `resultado` fica INCOMPLETO; com falha, REPROVADO.

## 3. Dívidas da etapa 2 (nenhuma bloqueia a etapa 3)

| # | Dívida | Origem | Peso |
|---|---|---|---|
| D-1 | Novo gate @qa das correções `2d213f7` e `318d85d` para a MEL-08 passar a Done | E2-5 | pequena; pode ser a primeira unidade |
| D-2 | `--pull never` no `docker run` (QA-E25-04) | E2-5 | baixa, opcional |
| D-3 | Job cancelado e sonda WPF reprovada não foram exercitados na CI; cobertos por testes locais do agregador e da sonda | E2-5 | baixa |
| D-4 | Restauração do clipboard no `ClipboardScope` e detecção da sonda sem teste automatizado; Shift físico pressionado derruba um teste de UI (QA-E24A-06, 07) | E2-4a | baixa, mexe na suíte da MEL-02 |
| D-5 | QA-E22-01b (contrato de ambiente §4) | E2-2 | baixa |

## 4. Fora da etapa 2, ainda aberto

- **M-1 (MEL-06a-m):** todo alvo registrado, inclusive o `ALVO_ATIVO` `uo-classic`, segue bloqueado na admissão até ganhar a seção 8 "Identidade dos arquivos", alvo por alvo, com aprovação do responsável.
- **Piloto do perfil do alvo:** P-U4 aguarda alvo novo; P-U5 (família de tool no `rea-niveis.json`) coordena com a MEL-05.
- **PRKing_UO:** UO-1 a UO-4 do relatório de estado.

## 5. Etapa 3 — ponto de partida

Itens: MEL-05 (contratos e inventário único de integrações, M), MEL-06 (identidade e isolamento por execução, G), MEL-07 (política comum CLI e MCP, G). Ordem obrigatória: MEL-05 → MEL-06 → MEL-07. Condição de saída do plano: testes recusam identidades divergentes e todas as entradas declaradas suportadas aplicam a política.

- **Nenhuma story existe ainda** para a etapa 3; só a MEL-06a (etapa 1) está em `docs/stories/`.
- **A MEL-05 pede um ADR proposto antes de alterar contratos** (plano §6) e começa por um verificador de consistência entre os arquivos existentes (`.mcp.json`, matcher em `.claude/settings.json`, `.claude/hooks/<servidor>-niveis.json`, documentação), sem migrar nem aprovar níveis automaticamente.
- **Coordenação:** o `rea-niveis.json` é compartilhado com a P-U5. Nenhum dos dois planos altera esse arquivo, o `00-seguranca.md` ou o gate sem conferir o outro (plano §3).
- **Base de validação:** o verificador e a CI da etapa 2. Componente novo (por exemplo, consistência de integrações) entra no verificador e num job da CI.
- **Mudanças em `.claude/hooks/` ou `scripts/`** pedem `npm test`; o gate e o cli-gate não podem ser desativados nem contornados durante a migração.

Sugestão de primeira unidade, à semelhança da preparação da etapa 2: **E3-0**, com o rascunho da story MEL-05 pelo @sm, o ADR proposto pelo @architect e a validação @po, sem mudar código. Depois, a MEL-05 em fatias. Prompt pronto em [`2026-11-03-prompt-etapa3.md`](2026-11-03-prompt-etapa3.md).
