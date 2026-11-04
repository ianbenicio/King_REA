# Plano de execução — etapa 2 do plano de evolução: MEL-08, ativação da CI (E2-5)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-5 do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-3b, gitleaks) está em
docs/planos/2026-11-03-e2-3b-gitleaks.md.
-->

**Data:** 2026-11-03 · **Sessão:** `d883db9d` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `73a6dd4`, igual ao `origin/main` (`0 0`); trabalho no branch `ci/e2-5-workflow`

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (13:00) e a da E2-3b (12:10, 47 min, com handoff `2026-11-03-e2-3b-gitleaks.md`), as duas da família `local_c49d87ce`; as demais são de 2026-11-01 e anteriores. `git status`: só `.claude/agent-memory/`, fora do git. `npm test` no início: 269/269. `gh auth status`: conta `ianbenicio`, escopos `repo` e `workflow` (só leitura do estado).

## 1. Enquadramento

**Objetivo:** ativar a CI do desenho da MEL-08 no GitHub Actions, provar com PRs de falha plantada que o `resultado` agregado reprova, e exigir o `resultado` no `main`.

**Restrições:** actions só as cinco auditadas, pelo SHA com o comentário da versão; `permissions: contents: read`; `pull_request`, nunca `pull_request_target`; nenhum segredo, runner próprio, ferramenta nova ou cache; contêineres pelo digest já fixado, `run` com `--network none`; nenhuma tool `rea`/`ghidra`, nada em `alvos/`; não contornar gate, `cli-gate`, monetização, publicação ou `pre-commit` (falha plantada entra por commit normal, com o hook ligado); push e `gh pr` só pelo @devops; merge e push direto no `main` só com "sim" do responsável na conversa desta sessão.

**Decisões do responsável (2026-11-03, sessão principal):** ativar agora; contêineres no Ubuntu hospedado (pull pelo digest com rede, `run` sem rede, adendo nas auditorias do Semgrep e do gitleaks); proteção de branch depois do 1º PR verde, exigindo `resultado`; sem cache do NuGet (restore travado pelo lock) e runner próprio adiado.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26, .NET 10/WPF, Docker (Semgrep, gitleaks) · integrações GitHub Actions (nova nesta unidade) · UI WPF só como teste · dados sensíveis: nenhum no checkout; logs e artefatos públicos · fase AIOX: SDC, story MEL-08 InProgress (fatia 2) · complexidade M.

**Dúvidas abertas:** (1) `enforce_admins` da proteção de branch: com ele ligado, todo commit no `main` passa a exigir PR; decidir com o responsável na hora de configurar. (2) Comportamento da sonda WPF no `windows-2025` hospedado: só a primeira execução diz.

## 2. Precedentes (Engram)

Consultas `deep`, cross-projeto, `synthesize: false`: (a) "ativar CI GitHub Actions … SHA, permissions, Docker no Ubuntu, falha plantada, proteção de branch, Windows dotnet node" → 7 resultados, relevância 0,502–0,511; (b) "logs públicos … docker pull por digest … branch protection required check agregado" → 7 resultados, 0,498–0,507.

| Nota | Relev. | Força (D10) | Pré-condição | Vale aqui? | Efeito no plano |
|---|---|---|---|---|---|
| `verifica-o-local-com-tr-s-estados-e-global-json-resolvido-pe` | 0,511 | verificável (MEL-03, testes) | `dotnet` resolve o `global.json` pelo cwd; três estados no verificador | sim: o verificador já roda o `dotnet` em `reimplementacoes/notepad/` | a CI chama o verificador, nunca `dotnet` direto no YAML; `setup-dotnet` usa `global-json-file` |

Descartados: `classmate-connect-13-*` (Supabase/Vercel, sem CI de Actions); `fezinha-*`, `despensa-*`, `re-verificacao-*`, `rea-6-4-0-store-*` (outro domínio); `FU-002`, `spec-v1-critique` (hipótese, sem CI); `padr-o-verificar-cobertura-existente` (genérico; já aplicado ao ler o verificador antes de escrever).

## 3. Plano preliminar

**Workflow AIOX:** SDC, fase 3 da MEL-08 (story já validada pelo @po; fatia 2). Executor @devops (workflow, push, PRs, proteção), @qa no gate.

| Unidade | Entrega | Aceite preliminar | Limite |
|---|---|---|---|
| E2-5 (esta sessão) | `.github/workflows/verificacao.yml`; agregador com os jobs `semgrep` e `publicacao` e com `lint`/`tipos` no `js`; teste que prende o YAML ao agregador; adendos das auditorias; PR do workflow verde; PRs de falha plantada (JS, lint, publicação, .NET, Semgrep, requisito ausente); proteção de branch; ACs da MEL-08 com links | `resultado` verde no PR do workflow e vermelho em cada falha plantada; logs revisados | ~150k; se faltar, entregar a parte fechada e registrar o resto |

**Capacidades:** ativas — Bash/`gh`, Read/Edit, Engram; sob demanda — subagente `aiox-qa` para o gate; não carregar — REA, Ghidra, protocolos de alvo, conectores do claude.ai (desligados nesta unidade).

**Verificações:** `npm test` local; `node scripts/verificar/verificar.mjs --so … --json` local por job; runs públicos do Actions (links na story); `gh api` da proteção de branch.

**Riscos:** sonda WPF no runner hospedado (pode aprovar e a suíte falhar por asserção, o que deixa o `resultado` vermelho pela decisão de 2026-11-02); Windows runner com `core.autocrlf=true` (mesmo da máquina local); log público com caminho do runner (aceitável: só o checkout); gitleaks precisa do binário Linux, baixado no job e conferido pelo SHA-256 do tar.gz e do executável da auditoria.

## 4. Custo da Fase 0

`sessao.js` no fim da Fase 0: 24 chamadas, contexto inicial 97k, máximo 183k, 2 consultas `deep` ao Engram (14 resultados, nenhuma síntese).

## 5. Aprovação

O escopo e as decisões vêm do responsável (2026-11-03, sessão principal, citadas no prompt desta sessão). Este plano não amplia o escopo; a dúvida (1) volta ao responsável antes da proteção de branch.
