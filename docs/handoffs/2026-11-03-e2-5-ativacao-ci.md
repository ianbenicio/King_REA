# Handoff — E2-5: MEL-08, ativação da CI por componente (2026-11-03)

**Sessão:** `d883db9d` (aberta por `local_c49d87ce`) · **Branch:** `ci/e2-5-workflow`, de `73a6dd4` (`main`) a `318d85d` + story e este handoff · **PR:** [ianbenicio/King_REA#1](https://github.com/ianbenicio/King_REA/pull/1) (aberto, verde, **sem merge**) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) · **Story:** [MEL-08](../stories/mel-08-ci-agregada.story.md) (InReview) · **Push:** pelo @devops, com a autorização do responsável de 2026-11-03 (branches de trabalho e de teste, PRs, proteção de branch); nada enviado ao `main`

## Entregas

| Commit | Entrega |
|---|---|
| `7ef594b` | Plano da Fase 0 (E2-3b arquivado em `docs/planos/2026-11-03-e2-3b-gitleaks.md`). `.github/workflows/verificacao.yml`: jobs `js`, `dotnet`, `wpf-interativo` (`windows-2025`), `semgrep`, `publicacao` (`ubuntu-24.04`) e `resultado` (agrega pelos três estados, único check exigido). `JOBS` do agregador com os cinco jobs. `scripts/verificar/workflow-ci.test.mjs` prende o YAML ao agregador, à auditoria das actions e às obrigações. Adendos de execução na CI nas auditorias do Semgrep e do gitleaks |
| `2d213f7` | Correção achada pela falha plantada sem Docker: a sondagem do daemon exige a versão do servidor na saída (`motivoDaemonDocker`, `sondarDocker`), regra compartilhada pelo verificador e pelo gitleaks, com teste |
| `318d85d` | QA-E25-01 (desenho: título, §2, §7 marcado como histórico; auditoria das actions com a decisão sem cache) e QA-E25-03 (o teste do workflow agora mata as 5 mutações que escapavam) |
| (este commit) | Story MEL-08 (AC1–AC6 com evidência, tasks, File List, Dev Notes, Change Log, InReview), este handoff, relatório de estado |

Configuração remota (pelo @devops): proteção do `main` pela API clássica, com check exigido `resultado`, `strict: false`, `enforce_admins: false`, sem force push nem exclusão.

Nenhuma tool `rea` ou `ghidra`; nada lido em `alvos/` ou `saidas/`; nenhum `00-seguranca.md` tocado; gate, cli-gate, checagem de monetização, publicação e `pre-commit` intactos; nenhum segredo, nenhum runner próprio, nenhuma action fora da auditoria, nenhuma ferramenta nova. Commits pelo hook, sem `--no-verify`; nenhum `--force`.

## Decisões

- **Responsável (2026-11-03, sessão principal):** "Ativar agora"; contêineres no Ubuntu hospedado "Aceitar" (pull pelo digest com rede, `run` com `--network none`, adendo nas auditorias); proteção de branch "Sim, depois do 1º PR verde"; "Sem cache; adiar runner".
- **@devops:** npm também sem cache (a decisão citava o NuGet; ligar só o npm abriria entrada que ela não cobriu). Desenho §3.
- **@devops:** o digest da imagem mora no código (`IMAGEM`); o YAML lê por `node`, e o teste proíbe o digest escrito no YAML.
- **@devops:** gitleaks baixado do release com SHA-256 conferido duas vezes (tar.gz e executável), sem cache.
- **@devops:** `enforce_admins: false` por ora: o administrador ainda pode passar por cima da proteção. **Pendente com o responsável.**

## PRs e runs

| PR | O que prova | Run | `resultado` |
|---|---|---|---|
| [#1](https://github.com/ianbenicio/King_REA/pull/1) | workflow, execução normal (AC1, AC4, AC5) | [41641707700](https://github.com/ianbenicio/King_REA/actions/runs/41641707700) | verde, 20 componentes aprovados, `notepad-ui` 76/76 no hospedado |
| [#5](https://github.com/ianbenicio/King_REA/pull/5) | teste JS (AC2) | [41642286413](https://github.com/ianbenicio/King_REA/actions/runs/41642286413) | REPROVADO (`js`) |
| [#7](https://github.com/ianbenicio/King_REA/pull/7) | teste .NET (AC2) | [41642356923](https://github.com/ianbenicio/King_REA/actions/runs/41642356923) | REPROVADO (`notepad-core`) |
| [#3](https://github.com/ianbenicio/King_REA/pull/3) | regra Semgrep (AC2) | [41642213475](https://github.com/ianbenicio/King_REA/actions/runs/41642213475) | REPROVADO (`semgrep-test`) |
| [#2](https://github.com/ianbenicio/King_REA/pull/2) | lint | [41642186342](https://github.com/ianbenicio/King_REA/actions/runs/41642186342) | REPROVADO (`lint`) |
| [#6](https://github.com/ianbenicio/King_REA/pull/6) | publicação | [41642324628](https://github.com/ianbenicio/King_REA/actions/runs/41642324628) | REPROVADO (`gitleaks`, 1 achado) |
| [#4](https://github.com/ianbenicio/King_REA/pull/4) | sem Docker (AC3), antes da correção | [41642229054](https://github.com/ianbenicio/King_REA/actions/runs/41642229054) | REPROVADO: **bug**, deveria ser INCOMPLETO |
| [#8](https://github.com/ianbenicio/King_REA/pull/8) | sem Docker (AC3), depois de `2d213f7` | [41643942625](https://github.com/ianbenicio/King_REA/actions/runs/41643942625) | INCOMPLETO (3 obrigatórios não executados) |

Os PRs #2 a #8 foram fechados sem merge, com comentário; branches remotas e locais apagadas; worktree temporária removida.

## Gate @qa

**CONCERNS** sobre `7ef594b` e o run 41641707700 (seção "QA Results (E2-5)" da story). QA-E25-01 (média) e 03 (baixa) resolvidas em `318d85d`; 02 (baixa, story) resolvida neste commit; 04 (baixa, `--pull never` no `docker run`) fica como dívida opcional. O gate não foi refeito depois das correções.

## Etapa 2

Condição de saída: "clone limpo executa as verificações e a CI publica resultado agregado fiel". O run 41641707700 roda todas as verificações num checkout limpo de máquina nova (fecha o limite da E2-6, "mesma máquina"); verde, os cinco tipos de falha plantada e o caso sem Docker mostram o agregado fiel. **A condição está cumprida no PR #1, mas a etapa 2 só fecha com o merge dele no `main`**, que precisa do "sim" do responsável. Depois: etapa 3, começando pela MEL-05 (não iniciada).

## Pendências

1. **Merge do PR #1 no `main`** — "sim" do responsável na conversa; @devops faz o merge (o check `resultado` já está verde).
2. **`enforce_admins`** — manter `false` ou exigir o check também do administrador. Decisão do responsável.
3. **Re-gate @qa** das correções `2d213f7` e `318d85d` (opcional; o CI do PR #1 vai rodá-las).
4. QA-E25-04 (`--pull never`), dívida opcional.
5. Job cancelado (AC3): coberto pelo teste do agregador ("JSON faltando"); não houve run com cancelamento.
6. Dívidas herdadas: QA-E24A-06 e 07 (sonda WPF e clipboard), QA-E22-01b (contrato §4).

## Falhas e retrabalho

- **Substituição de processo do bash** (`<(...)`) falhou no Git for Windows: commits não saíram e as mudanças se acumularam entre checkouts; refeitos na worktree temporária a partir de `7ef594b`, com mensagem em arquivo.
- **Push protection do GitHub** recusou a primeira falha plantada de publicação (chave sintética no formato Twilio). Branch local apagada sem envio; refeita com `api_key` genérica. Camada extra, não contornada.
- **Bug da sondagem do Docker** (PR #4): `docker info` sai 0 com o serviço parado no Ubuntu hospedado. Corrigido e provado (PR #8).
- **`gh pr create`** com 504/503: PRs refeitos.
- **Escape de `\d` e `\n`** num heredoc do node quebrou a regex e duas strings do teste; corrigido com edição direta.
- **`set_monitor` (Auto-fix)** negado pelo classificador do modo automático; os runs foram acompanhados com `gh run watch` em segundo plano, uma vez por run.

## Métricas (`sessao.js`, ao escrever este handoff)

108 chamadas principais e 20 de subagentes; contexto inicial 97k, médio 184k, máximo 266k, 49% das requisições acima de 200k; 1 compactação; leitura de cache 19,6M (principal) e 1,3M (subagentes); saída 83k e 20k. Engram: 2 chamadas (`vault_deep_query_tool`), ~3k de resultados no contexto. O orçamento de ~150k do pedido foi ultrapassado; a unidade fechou mesmo assim, com uma compactação.
