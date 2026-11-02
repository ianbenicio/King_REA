# Auditoria de segurança — actions do desenho da CI (MEL-08)

**Data:** 02/11/2026 · **Método:** leitura da fonte, sem executar nada: tag e SHA conferidos por duas vias (`git ls-remote` e API do GitHub), assinatura do commit, `action.yml`, README e leitura estática do `dist/` das actions de setup · **Veredito:** cinco actions aceitas para a E2-5, três delas com ressalva (abaixo) · **Story:** [MEL-08](../stories/mel-08-ci-agregada.story.md), AC9 · **Desenho:** [`2026-11-01-desenho-ci-mel08.md`](../planos/2026-11-01-desenho-ci-mel08.md) §7

**Auditar não é adotar.** Nada foi criado em `.github/`. O workflow, os SHAs no YAML e a ativação ficam para a E2-5, com aprovação do responsável na conversa e push pelo @devops.

## Resumo — o que será fixado

| Action | Versão | SHA de commit completo (a fixar) | Veredito |
|---|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | aceitar, com `persist-credentials: false` obrigatório |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` | aceitar com ressalva (download do Node sem verificação de hash) |
| `actions/setup-dotnet` | v6.0.0 | `a98b56852c35b8e3190ac28c8c2271da59106c68` | aceitar com ressalva (download do SDK sem verificação de hash) |
| `actions/upload-artifact` | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` | aceitar com ressalva (artefato público) |
| `actions/download-artifact` | v8.0.2 | `9000827ccba6bdab643e8b6fd33ac0654aef8333` | aceitar |

Forma no YAML (E2-5): `uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`. Nunca por tag (`@v7`) nem por branch.

## Critérios comuns

- **Versão:** a última da linha maior atual com pelo menos duas semanas de publicação, a mesma política da [auditoria do Semgrep](auditoria-semgrep-1.180.0.md) (dar tempo para a comunidade achar problema de cadeia de distribuição). As cinco cumprem: a mais nova é de 07/10/2026.
- **SHA conferido por duas vias:** `git ls-remote https://github.com/actions/<nome> refs/tags/<tag> 'refs/tags/<tag>^{}'` e `gh api repos/actions/<nome>/git/ref/tags/<tag>`. Nas cinco, a tag é leve (o objeto é o próprio commit, sem tag anotada para desreferenciar), as duas vias dão o mesmo SHA, e a tag maior (`v7`, `v8`, `v6`) aponta hoje para o mesmo commit.
- **Assinatura:** `gh api repos/actions/<nome>/commits/<sha>` → `verification.verified: true`, `reason: valid`, committer `web-flow` (merge feito pela interface do GitHub) nas cinco.
- **Tag imutável:** o GitHub marca algumas releases como imutáveis (a tag não pode ser movida). `setup-node` v7.1.0 e `setup-dotnet` v6.0.0 são; `checkout` v7.0.1, `upload-artifact` v7.0.2 e `download-artifact` v8.0.2 não são. Por isso a fixação é pelo SHA: tag movida depois desta auditoria não muda o que roda.
- **Mantenedor:** organização `actions`, do próprio GitHub; licença MIT; nenhum repositório arquivado. Cada um tem `check-dist.yml` (o CI deles confere que o `dist/` compilado corresponde ao `src/`), CodeQL e `licensed.yml`.
- **Código de terceiros, em todas:** o `dist/` é JavaScript compilado com as dependências npm embutidas (pacotes `@actions/*`, SDK do Azure Storage nas de artefato e cache). Roda no runtime `node24` do runner, que exige runner v2.327.1 ou mais novo (os hospedados já atendem). Não comparamos o `dist/` com o código-fonte: a confiança vem do mantenedor, do `check-dist` dele e do SHA fixo.
- **Permissões do workflow** (desenho §1): `permissions: contents: read`, sem `pull_request_target`, sem segredos. Nenhuma das cinco pede mais do que isso nesse uso.

## actions/checkout — v7.0.1

| Item | Resultado |
|---|---|
| Release | 20/07/2026, autor `aiqiaoy`; commit de 17/07/2026, "prep v7.0.1 release (#2531)" |
| SHA | `3d3c42e5aac5ba805825da76410c181273ba90b1` (`v7.0.1` e `v7`) |
| Runtime | `node24`, `main` e `post` em `dist/index.js` (o `post` limpa credenciais) |
| Permissões | usa o `token` (padrão `github.token`); com `contents: read` basta |
| Baixa binário? | não; usa o `git` do runner |

**Comportamento relevante:** com `persist-credentials: true` (padrão), o token fica gravado para comandos `git` seguintes (desde a v6, num arquivo em `$RUNNER_TEMP`, não no `.git/config`) até o passo `post`. Qualquer passo seguinte, inclusive `npm ci` e os testes, poderia lê-lo. Notas da v7.0.1: escapar valores passados ao `git config --unset` e pular a checagem de PR inseguro quando a entrada é a padrão.

**Veredito: aceitar**, com `persist-credentials: false` em todo uso (já previsto no desenho §1), `fetch-depth` padrão (1) e sem `token` nem `ssh-key` próprios.

## actions/setup-node — v7.1.0

| Item | Resultado |
|---|---|
| Release | 08/10/2026 (imutável), autor `v-gowridurgad`; commit de 08/10/2026 |
| SHA | `949feb2413d6458794dcd2491c4babbbce0c15c1` (`v7.1.0` e `v7`) |
| Runtime | `node24`; `main` `dist/setup/index.js`, `post` `dist/cache-save/index.js` (`post-if: success()`) |
| Permissões | `token` padrão `github.token`, usado só para ler o manifesto `actions/node-versions` sem limite de taxa |
| Baixa binário? | **sim**: o Node da versão pedida, do cache de ferramentas do runner ou, se não houver, do manifesto `actions/node-versions` (builds do GitHub) ou de `nodejs.org` |

**Comportamento relevante:**

- A leitura estática do `dist/setup/index.js` não mostrou conferência contra `SHASUMS256` do Node: o arquivo baixado é aceito pela origem HTTPS. **Ressalva.** Mitigação parcial já existente: o componente `ambiente-node` do verificador confere o major do Node contra o `.node-version` (26) antes de qualquer teste. Isso pega versão errada, não binário adulterado; a confiança no binário fica com a origem HTTPS (GitHub ou `nodejs.org`).
- Cache: com `cache: npm` (desenho §3), guarda o cache do npm com chave pelo `package-lock.json`, e só salva quando o job passa. Entrada de cache adulterada não passa pelo `npm ci`, que confere a integridade de cada pacote pelo lockfile. O cache automático da v7 (`package-manager-cache`) só liga se o `package.json` declarar `packageManager`; o nosso não declara.
- Notas da v7: migração para ESM; o `NODE_AUTH_TOKEN` fictício foi removido. Não usamos `registry-url` nem token de npm.

**Veredito: aceitar com ressalva:** usar só `node-version-file: .node-version` e `cache: npm`, sem `check-latest`, `registry-url`, `mirror` nem `mirror-token`; manter a checagem de versão do verificador como primeiro componente de **todo** job que instala Node. Hoje o job `dotnet` do esboço roda `--so notepad-core`, cujas dependências não incluem o `ambiente-node`: a E2-5 deve acrescentá-lo ao `--so` desse job (QA-E24B-02).

## actions/setup-dotnet — v6.0.0

| Item | Resultado |
|---|---|
| Release | 16/07/2026 (imutável), autor `v-HarithaVattikuti`; commit de 16/07/2026, "bump @actions/cache to 6.2.0 (#756)" |
| SHA | `a98b56852c35b8e3190ac28c8c2271da59106c68` (`v6.0.0` e `v6`) |
| Runtime | `node24`; `main` `dist/setup/index.js`, `post` `dist/cache-save/index.js` (`post-if: success()`) |
| Permissões | nenhuma do token no uso previsto (`source-url` e `config-file` não serão usados) |
| Baixa binário? | **sim**: roda o script de instalação da Microsoft que vem no repositório (`externals/install-dotnet.ps1`, 74.981 bytes, blob `3fa90250…`), que baixa o SDK de `builds.dotnet.microsoft.com`; a resolução da versão usa o índice `releases-index.json`, lido pelo `dist/setup/index.js` da action (`DotnetCoreIndexUrl`), não pelo script |

**Comportamento relevante:**

- O script é de terceiro (repositório `dotnet/install-scripts`), copiado para dentro da action; roda em PowerShell no runner Windows. A leitura dele não mostrou conferência de hash do arquivo baixado (`Get-FileHash` ou equivalente). **Ressalva.** Se a versão já estiver instalada na imagem do runner, o script não baixa. Mitigação parcial: o `global.json` do Notepad fixa o SDK 10.0.401 com `rollForward: patch` e `allowPrerelease: false`, e o `dotnet` recusa SDK fora dessa faixa. Como no Node, isso pega versão errada, não binário adulterado; a confiança fica com a origem HTTPS da Microsoft.
- Cache desligado por padrão (`cache: false`). O desenho §3 prevê cache do NuGet pelo `packages.lock.json`, mas não diz com que mecanismo. **Decisão da E2-5**, uma de três: sem cache; `cache: true` com `cache-dependency-path` nesta action (aí as duas entradas passam a ser permitidas abaixo); ou `actions/cache`, que é uma sexta action e precisa de auditoria própria antes. Em qualquer caso o restore continua com `--locked-mode`.
- Nota da v6: migração para ESM e atualização de dependências.

**Veredito: aceitar com ressalva:** usar `global-json-file: reimplementacoes/notepad/global.json` (mais `cache` e `cache-dependency-path`, só se a E2-5 escolher o cache desta action), sem `source-url`, `owner`, `config-file`, `workloads` nem `dotnet-quality`.

## actions/upload-artifact — v7.0.2

| Item | Resultado |
|---|---|
| Release | 07/10/2026, autor `tunc-d`; merge do PR #822 |
| SHA | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` (`v7.0.2` e `v7`) |
| Runtime | `node24`, `dist/upload/index.js`, sem `post` |
| Permissões | usa o token de runtime do Actions, não o `GITHUB_TOKEN`; nada a acrescentar em `permissions` |
| Baixa binário? | não |

**Comportamento relevante:** no repositório público, o artefato pode ser baixado por qualquer usuário com conta no GitHub durante a retenção. Arquivos ocultos ficam de fora por padrão (`include-hidden-files: false`). O README avisa que o repositório não aceita contribuições externas no momento, o que não muda a manutenção de segurança. Nota da v7.0.2: novas tentativas em HTTP 429 e `@actions/artifact` 6.3.1.

**Veredito: aceitar com ressalva:** `path` aponta só para o JSON do verificador (resultados sintéticos, desenho §6), `retention-days: 7`, `if-no-files-found: error`, sem `include-hidden-files`. Nunca enviar `bin/`, `obj/`, `TestResults/` nem capturas.

## actions/download-artifact — v8.0.2

| Item | Resultado |
|---|---|
| Release | 07/10/2026, autor `tunc-d`; merge do PR #493 |
| SHA | `9000827ccba6bdab643e8b6fd33ac0654aef8333` (`v8.0.2` e `v8`) |
| Runtime | `node24`, `dist/index.js`, sem `post` |
| Permissões | dentro do mesmo run, token de runtime; `github-token` só seria preciso para outro run ou repositório |
| Baixa binário? | não (só os artefatos do próprio run) |

**Comportamento relevante:** confere o digest do artefato e, por padrão, falha se não bater (`digest-mismatch: error`). Nota da v8.0.2: as mesmas novas tentativas em HTTP 429.

**Veredito: aceitar**, só no job `resultado`, sem `github-token`, `repository` nem `run-id`, e mantendo `digest-mismatch` no padrão.

## O que esta auditoria não cobre

- Não comparou o `dist/` com o código-fonte nem reconstruiu o build.
- Não auditou a imagem do runner (`windows-2025`, `ubuntu-24.04`) nem o Docker Engine do Ubuntu hospedado (pendência do desenho §9, adendo da auditoria do Semgrep).
- Não executou nenhuma action. A primeira execução é a da E2-5, nos PRs de teste.

## Atualizar

Decisão do responsável. Repetir esta auditoria para a versão nova (release, SHA pelas duas vias, assinatura, `action.yml`, notas da versão, downloads), trocar o SHA no workflow e registrar aqui. Dependabot ou atualização automática de actions só depois de decidido, porque troca o SHA sem esta revisão.

## Fontes (acesso em 02/11/2026)

- Releases: `https://github.com/actions/checkout/releases/tag/v7.0.1`, `https://github.com/actions/setup-node/releases/tag/v7.1.0`, `https://github.com/actions/setup-dotnet/releases/tag/v6.0.0`, `https://github.com/actions/upload-artifact/releases/tag/v7.0.2`, `https://github.com/actions/download-artifact/releases/tag/v8.0.2` (lidas por `gh api repos/actions/<nome>/releases/tags/<tag>`).
- Tags: `git ls-remote https://github.com/actions/<nome>` e `gh api repos/actions/<nome>/git/ref/tags/<tag>`.
- Commits e assinatura: `gh api repos/actions/<nome>/commits/<sha>`.
- `action.yml`, `README.md`, lista de `.github/workflows/` e, nas actions de setup, `dist/setup/index.js` e `externals/install-dotnet.ps1`, todos lidos no SHA auditado por `gh api repos/actions/<nome>/contents/<caminho>?ref=<sha>`; os arquivos baixados para leitura ficaram numa pasta temporária, apagada depois, e nada foi executado.
