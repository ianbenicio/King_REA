# Auditoria de segurança — gitleaks 8.30.1

**Data:** 03/11/2026 · **Método:** origem e integridade dos arquivos da release (SHA-256 contra o `checksums.txt` e contra o digest que o GitHub guarda de cada arquivo), busca de assinatura e atestação, licença e conteúdo do pacote, leitura do código-fonte na tag pela API do GitHub (rede, telemetria, resolução de configuração, redação), execução sem rede num contêiner e medições com o executável Windows sobre conteúdo rastreado (`git archive HEAD` fora do repositório e `gitleaks git`, que lê só o `.git`) · **Veredito:** **aprovado com ressalva, só isolado** (decisão do responsável em 03/11/2026): sem rede, sem telemetria, licença MIT, checksums conferidos; o binário não tem assinatura, atestação nem procedência de CI e a release é mutável, por isso só roda em contêiner sem rede, como o Semgrep (seção "Aceitação e uso no projeto").

Decisões do responsável: "Auditar o gitleaks" (02/11/2026); depois de ver as lacunas, "Adotar isolado" (03/11/2026, opção 1 de três: adotar isolado, não adotar, compilar da tag).

## Versão

- **8.30.1** (21/03/2026), que também é a mais recente: nenhuma release depois dela até 03/11/2026. Tem mais de sete meses, então cumpre a política das duas semanas da [auditoria do Semgrep](auditoria-semgrep-1.180.0.md). A anterior é a 8.30.0 (26/11/2025).
- Tag `v8.30.1` → commit `83d9cd684c87d95d656c1458ef04895a7f1cbd8e`, conferido por duas vias (`git ls-remote` e `gh api repos/gitleaks/gitleaks/git/ref/tags/v8.30.1`). É uma tag leve (sem objeto de tag anotada).
- Notas da versão: goreleaser atualizado; **#2040**, que tira as funções `env`, `expandenv` e `getHostByName` do `--report-template` (antes, um modelo de relatório podia ler variáveis de ambiente e fazer consulta DNS; conferido em `report/template.go`); **#2020**, que passa a usar o mesmo motor de regex em todo o código; **#2002**, que muda o build para Go 1.24 (o binário diz `go1.24.11`).
- Manutenção: desde a 8.30.1 o repositório só recebeu atualizações do Dependabot nas actions (último commit em 23/10/2026). Não há `SECURITY.md` na tag e a lista de avisos de segurança publicados (`security-advisories`) está vazia.

## Origem e integridade

Baixados de `https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/` para `ferramentas/gitleaks/8.30.1/download/`, uma pasta nova e vazia.

| Arquivo | Tamanho (bytes) | SHA-256 | Confere |
|---|---|---|---|
| `gitleaks_8.30.1_windows_x64.zip` | 8.438.883 | `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e` | sim (checksums e digest do GitHub) |
| `gitleaks_8.30.1_linux_x64.tar.gz` | 8.230.402 | `551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb` | sim (checksums e digest do GitHub) |
| `gitleaks_8.30.1_checksums.txt` | 999 | `061476c21adaf5441516f96f185c1a4706a83cd6329b9b38762271b3d4a52fae` | sim (digest do GitHub) |
| `gitleaks.exe` (extraído do zip) | 22.575.104 | `17157e2ee8b76fc8b1d8bee607a250e34b8a8023c8bc81822d4b5ee4d78fcb7c` | não há valor publicado para comparar |
| `gitleaks` Linux (extraído do tar.gz) | 21.958.840 | `88f91962aa2f93ac6ab281d553b9e125f5197bbbce38f9f2437f7299c32e5509` | não há valor publicado para comparar |

O "digest do GitHub" é o campo `digest` que a API de releases devolve para cada arquivo (calculado pelo GitHub no upload). A segunda conferência vem do mesmo canal: quem pudesse trocar o arquivo da release poderia trocar o `checksums.txt` também.

## Assinatura e procedência

| Item | Resultado |
|---|---|
| Assinatura cosign (`.sig`, `.pem`, bundle) | **não existe** na release (11 arquivos: 10 pacotes e o `checksums.txt`) |
| Atestação de artefato do GitHub | **não existe**: `gh attestation verify <arquivo> --repo gitleaks/gitleaks` dá HTTP 404 para o zip, o tar.gz e o `checksums.txt` |
| SLSA / procedência de build | **não existe** |
| `checksums.txt` assinado | **não**: não há assinatura de nenhum tipo |
| Release imutável | não (`immutable: false`) |
| Commit da tag | não assinado (`verification.reason: unsigned`), autor e committer `Zach` (`zricethezav`) |
| Quem enviou os arquivos | o usuário `zricethezav` (tipo `User`), não um bot de CI |
| Assinatura Authenticode do `.exe` | não assinado (`Get-AuthenticodeSignature` → `NotSigned`) |
| Workflows na tag | `release.yml` só monta e publica a imagem Docker; `gitleaks.yml` e `test.yml` não fazem release. Nenhum roda o goreleaser |

**Conclusão:** os binários foram gerados pelo goreleaser fora do CI, na máquina do mantenedor. O dono dos arquivos no tar.gz é `zrice/staff`, padrão de macOS. Nada liga o binário ao código-fonte da tag. O cosign também não resolveria: não há assinatura para conferir. A confiança vem só da conta do mantenedor no GitHub, do HTTPS e do isolamento na execução. Para reduzir essa lacuna seria preciso compilar a partir da tag e comparar, o que exige instalar o Go (não feito; fora do escopo desta auditoria). O binário não traz `vcs.revision`, e o `.goreleaser.yml` não usa `-trimpath` nem marca de tempo fixa. Portanto não sabemos se o build é reprodutível.

## Licença e conteúdo do pacote

- **MIT** ("Copyright (c) 2019 Zachary Rice"). O `LICENSE` do zip, o do tar.gz e o do repositório na tag são idênticos (SHA-256 `e3884b252b3bfc045e55be43a34d1e80da070bc6f804ac95bf4660e97d62ebc6`).
- Cada pacote tem só três arquivos: `LICENSE`, `README.md` e o executável. **Nenhum script de instalação.** Nada roda ao extrair.
- O build usa a tag `gore2regex`: o motor de regex é o RE2 compilado em WebAssembly (`wasilibs/go-re2`) e roda dentro do processo, pelo `wazero`. O log em nível debug confirma `using github.com/wasilibs/go-re2 regex engine`.

## Rede e telemetria

**Código (58 arquivos `.go` sem testes, lidos na tag por `gh api repos/gitleaks/gitleaks/contents/<caminho>?ref=v8.30.1`):**

- `net/http` aparece só em `cmd/diagnostics.go`, para servir o pprof em `localhost:6060`, e só com `--diagnostics=http`. Não há cliente HTTP, verificação de atualização, telemetria nem envio de relatório. O `version/version.go` só guarda a string da versão.
- `os/exec` aparece só em `sources/git.go`, que roda o `git` do `PATH`: `git log -p -U0 --full-history --all --diff-filter=tuxdb` no modo `git`, `git diff -U0 --no-ext-diff [--staged] .` no `--pre-commit` e `git cat-file blob`. Roda também `git ls-remote --quiet --get-url`, que só lê a configuração (resolve a URL do remote, sem contato com a rede), para montar os links do relatório.
- O `git log -p` respeita a configuração local do git: o `textconv` vale por padrão e o Git for Windows define `diff.astextplain.textconv` no sistema. Isso muda o texto varrido de alguns tipos de arquivo, mas não usa rede.
- Strings do `.exe`: os únicos hosts são `github.com`, `go.dev`, `json.schemastore.org` (esquema SARIF), `www.w3.org` e o blog citado no cabeçalho da configuração. Não aparece endpoint de API nem de telemetria.

**Execução sem rede:** o binário Linux rodou na imagem já auditada do Semgrep (`semgrep/semgrep@sha256:529ee8a2…845c3`, sem baixar imagem nova) com `--network none --cap-drop ALL --security-opt no-new-privileges --user 65534:65534`, o binário e os dados montados só para leitura e `--entrypoint /gl/gitleaks`. Resultados: `version` → `8.30.1`, saída 0; `dir` com segredos sintéticos → 2 achados, saída 1, 1,1 s; `dir` sobre o `git archive HEAD` → 1 achado (o mesmo da tabela de medições), saída 1, 1,5 a 1,9 s. As execuções terminaram normalmente, sem erro, espera ou tentativa de rede no log.

## Configuração e como neutralizar afrouxamentos

Ordem de escolha da configuração (`cmd/root.go`, `initConfig`):

1. `--config/-c <arquivo>`;
2. variável de ambiente `GITLEAKS_CONFIG` (caminho);
3. variável de ambiente `GITLEAKS_CONFIG_TOML` (conteúdo);
4. `<alvo>/.gitleaks.toml`, sendo o alvo o caminho varrido (`dir`/`git`) ou o diretório atual (`stdin`);
5. a configuração padrão embutida (222 regras).

O viper não lê outras variáveis (`AutomaticEnv` não é usado). No código, as únicas leituras de ambiente são essas duas.

| Fonte de afrouxamento | Neutraliza? | Como (testado com segredo sintético) |
|---|---|---|
| `.gitleaks.toml` no alvo (no repositório público, qualquer um pode propor um) | **sim** | `--config <arquivo do projeto>`. Sem a flag, um `.gitleaks.toml` permissivo no alvo zerou o achado; com ela, o achado voltou |
| `GITLEAKS_CONFIG` / `GITLEAKS_CONFIG_TOML` | **sim** | `--config` tem precedência. Sem a flag, cada variável zerou os achados (saída 0); com ela, voltaram os 2 |
| comentário `gitleaks:allow` na linha | **sim** | `--ignore-gitleaks-allow`. Sem a flag: 0 achados; com ela: 1 |
| `.gitleaksignore` no diretório atual (`-i` padrão é `.`) | **sim** | `--gitleaks-ignore-path <pasta vazia fora do repositório>`. Sem a flag: 0 achados; com ela: 2 |
| **`.gitleaksignore` na raiz do alvo** | **não** | O código carrega `<alvo>/.gitleaksignore` sempre, além do `-i`. Com `-i` numa pasta vazia, o achado continuou suprimido (0). No modo `git`, o arquivo lido é o da árvore de trabalho, mesmo sem estar no git. Mitigação possível: exigir que o arquivo não exista antes da varredura |
| `--baseline-path`, `--enable-rule` | não se aplica | só existem como flag; basta não passar |
| **allowlist global da configuração padrão** | **não por flag** | caminhos com `gitleaks\.toml` em qualquer lugar do nome (um token em `meu-gitleaks.toml` não foi achado), `node_modules/`, `package-lock.json`, imagens, fontes, `.pdf`, `.docx`, `.exe`, `.dll`, `go.mod`/`go.sum` e outros. Também a regex `(?i)^true\|false\|null$`, que por precedência de operadores casa **qualquer segredo que contenha `false`**: um token `ghp_` com `false` no meio não foi achado. Só some escrevendo uma configuração própria sem `useDefault`, com as 222 regras copiadas e a allowlist corrigida |
| `--max-target-megabytes` (padrão 0, sem limite), `--max-archive-depth` (padrão 0, não abre compactados), `--max-decode-depth` (padrão 5) | fixar por flag | passar os valores explícitos na chamada |

`[extend] useDefault = true` num arquivo próprio reproduz a configuração padrão (foi a configuração usada nos testes com `--config`). O `extend` aceita até 2 níveis, e `path` e `useDefault` são mutuamente exclusivos.

**Alcance do `dir`:** ele varre tudo que está na pasta, sem respeitar o `.gitignore`. Rodado na árvore de trabalho, leria `alvos/` e `saidas/`. Nesta auditoria, o `dir` só rodou sobre o `git archive HEAD` extraído fora do repositório.

## Medições (executável Windows, sem valores de segredo)

Repositório no `HEAD` `da07163`: 288 arquivos rastreados (2,46 MB varridos) e 150 commits (2,80 MB de diffs).

| Varredura | Achados | Tempo (parede) | Tempo interno informado |
|---|---|---|---|
| `dir <git archive HEAD>` | 1: `generic-api-key` em `scripts/publicacao/pre-commit.test.mjs:90` | 0,98 s a frio; 0,52 a 0,53 s depois | 90 ms |
| `git <repositório>` (histórico inteiro) | 1: `generic-api-key` em `scripts/publicacao/pre-commit.test.mjs:90`, commit `0b56b7a` (02/11/2026) | 3,1 s a frio; 0,84 s depois | 518 ms |
| `git --pre-commit --staged` (índice com só um renome, 0 linhas) | 0 | 0,43 a 0,47 s | 155 ms |
| `stdin` com arquivo de 10 bytes | 0 | 0,41 a 0,44 s | 120 ms |

- O custo de partida fica em torno de 0,4 s por chamada (carregar e compilar as regras). É o piso do pre-commit.
- **O achado é falso positivo:** a linha 90 é a fixture sintética `segredo:chave-anthropic`, montada por partes; a regra genérica casa uma das partes, que é longa e de alta entropia. As outras fixtures de `scripts/publicacao/*.test.mjs` (PEM, `ghp_`, JWT, AWS), também montadas por partes, não disparam nada, e `publicacao.test.mjs` não dispara nada.
- **Segredo sintético** (token `ghp_` + 36 caracteres aleatórios e chave `AKIA` + 16, gerados na hora num arquivo temporário): os dois foram achados (`github-pat` linha 1, `aws-access-token` linha 2). Com `--redact`, o valor bruto apareceu 0 vezes no JSON, no stdout (inclusive com `-v`) e no stderr. Sem `--redact`, apareceu (o padrão é **não** redigir).

**Campos do JSON** (`--report-format json`): `RuleID`, `Description`, `StartLine`, `EndLine`, `StartColumn`, `EndColumn`, `Match`, `Secret`, `File`, `SymlinkFile`, `Commit`, `Link` (só quando há remote), `Entropy`, `Author`, `Email`, `Date`, `Message`, `Tags`, `Fingerprint`. O campo `Line` existe na estrutura, mas não vai para o JSON.

**Efeito do `--redact`** (`report/finding.go`, `Redact`): `Secret` vira `REDACTED`; em `Match` (e em `Line`) cada ocorrência do segredo é trocada por `REDACTED`, e o resto do trecho casado continua (por exemplo, o nome da variável). Os outros campos não mudam: `Entropy`; `Fingerprint` (`arquivo:regra:linha` ou `commit:arquivo:regra:linha`); `Author`, `Email` e `Message` do commit, que são dados pessoais e devem ficar fora de qualquer relatório público. O `--redact` sozinho vale 100. `--redact=N` mascara **só N%**: com `--redact=20`, ficam visíveis os primeiros 80% do segredo, seguidos de `...`.

**Logs:** com `--log-level trace`, o valor bruto de um achado pulado por `gitleaks:allow` aparece no log **mesmo com `--redact`** (testado com o sintético). No nível debug, os achados pulados por `.gitleaksignore` saíram como `REDACTED`, mas o código registra `finding.Secret` em vários pontos de debug e trace. Regra: nunca usar `--log-level debug` nem `trace`.

## Códigos de saída

| Situação | Saída |
|---|---|
| sem achado | 0 |
| com achado | 1 (padrão); `--exit-code N` troca, por exemplo `--exit-code 2` → 2 e `--exit-code 0` → 0 |
| erro fatal (`--config` inexistente ou TOML inválido) | 1, **igual ao de achado no padrão**. Para distinguir, usar `--exit-code` diferente de 1 |
| flag desconhecida | 126 |
| **caminho inexistente no `dir`** | **0**, com `WRN skipping` e "no leaks found" |
| **caminho inexistente ou fora de repositório no `git`** | **0**, com "0 commits scanned" e "no leaks found" |

Os dois últimos casos passam em silêncio. Qualquer uso automático precisa conferir o caminho antes e tratar "0 commits scanned" ou "scanned ~0 bytes" como erro quando não for o esperado.

## Aceitação e uso no projeto

**Aceite com ressalva** (responsável, 03/11/2026): falta de assinatura e de atestação, binários gerados fora do CI e release mutável aceitos, porque o binário só roda isolado. **Risco residual:** um binário adulterado não consegue tirar nada da máquina (sem rede) nem mudar o repositório (tudo só leitura), mas pode **mentir no resultado** (falso negativo). Isso equivale a não ter o detector externo: as 12 regras próprias de `scripts/publicacao/publicacao.mjs` continuam valendo no `pre-commit`, no verificador e na CI. Também fica o que nenhuma flag desliga (lacunas 3 e 4).

Como roda (`scripts/publicacao/gitleaks.mjs`, componente `gitleaks` do verificador, `npm run check:gitleaks`):

| Controle | Como |
|---|---|
| Binário | Linux, `ferramentas/gitleaks/8.30.1/linux/gitleaks` (fora do git), SHA-256 `88f91962aa2f93ac6ab281d553b9e125f5197bbbce38f9f2437f7299c32e5509` conferido antes de cada execução; diferente reprova |
| Entrada | só `git archive <ref>` (arquivos rastreados), gravado num tar temporário; extração e varredura dentro do contêiner. Nunca a árvore de trabalho, `alvos/` ou `saidas/` |
| Contêiner | imagem do Semgrep já auditada (mesmo digest); `--network none`, `--cap-drop ALL`, `no-new-privileges`, usuário `65534:65534`, `--read-only`, `/tmp` em tmpfs, as três montagens só leitura |
| Configuração | `scripts/publicacao/gitleaks.toml` por `--config` (padrão da versão, sem allowlist própria; o teste reprova allowlist ali); `--ignore-gitleaks-allow`; `-i` para pasta vazia; `.gitleaksignore` rastreado em qualquer nível reprova antes de varrer |
| Saída | `--redact`, `--log-level info` (nunca debug ou trace), `--exit-code 3`; código diferente de 0 e 3, varredura de 0 bytes, relatório ilegível ou incoerente com o código reprovam; relatório só com caminho, linha e regra |
| Ausência | sem o binário ou sem o Docker: "não executado", com o motivo; nunca aprovado |

**Fora do `pre-commit`** (decisão do responsável, com a medição): o `pre-commit` atual leva 0,66 s; o gitleaks no contêiner leva 1,6 s quente e 7,8 s a frio, e depende do Docker ligado, que muitas vezes não está (no hook viraria aviso que não bloqueia). Roda no verificador e, na E2-5, na CI. O `pre-commit` não mudou.

**Falso positivo tratado:** a fixture da chave da Anthropic em `scripts/publicacao/pre-commit.test.mjs` disparava `generic-api-key`; foi partida em pedaços menores (mesmo valor em tempo de execução). Depois disso, a árvore do `HEAD` (293 arquivos) não tem achado. O histórico guarda o commit `0b56b7a` com a forma antiga, que só dispara em varredura de histórico (o componente varre a árvore).

**Provas** (`scripts/publicacao/gitleaks.test.mjs`, no `npm test`): relatório sem valor, trecho, autor ou mensagem; saída de erro, 0 bytes e código incoerente nunca aprovam; argumentos de isolamento; imagem igual à do Semgrep; configuração sem allowlist; binário ausente dá "não executado"; hash diferente reprova sem chamar o Docker; e, com o binário e o Docker presentes, `.gitleaksignore` reprova, repositório limpo aprova, e segredo sintético gerado no teste reprova mesmo com `gitleaks:allow` e `.gitleaks.toml` permissivo no alvo, sem o valor no relatório.

## Lacunas e limites

1. **Sem assinatura, sem atestação, sem procedência de CI:** binário compilado na máquina do mantenedor, `checksums.txt` sem assinatura, commit da tag sem assinatura, release mutável, `.exe` sem Authenticode. A integridade conferida prova só que o arquivo é o que está na release hoje.
2. **Build não reproduzido:** não compilamos a partir da tag (o Go não está instalado e instalar estava fora do escopo).
3. **`.gitleaksignore` na raiz do alvo** suprime achados e nenhuma flag desliga isso.
4. **Allowlist global da configuração padrão:** os nomes `*gitleaks.toml` e os segredos que contêm `false` passam. Só uma configuração própria sem `useDefault` corrige.
5. **Saída 0 em caminho inválido** (`dir` e `git`), e erro fatal com o mesmo código de achado.
6. **Níveis de log debug e trace** podem gravar segredo em texto puro.
7. **Biblioteca padrão Go 1.24.11:** não conferimos se correções de segurança posteriores do Go se aplicam a este uso. Projeto sem release há mais de sete meses.
8. Não auditamos a imagem Docker oficial (`ghcr.io/gitleaks/gitleaks`, montada no CI pelo `release.yml`), que poderia ter procedência BuildKit. Ficaria para outra auditoria.
9. **Fora do git:** no `HEAD` `da07163`, o `.gitignore` não cobria `ferramentas/gitleaks/` (só `ferramentas/universal-modder/` e `ferramentas/ghidramcp/`); a sessão principal da E2-3b acrescentou a entrada antes do download, e `git check-ignore` confirma a exclusão. A política de publicação já recusava `ferramentas/` de qualquer jeito.

## Atualizar

Decisão do responsável. Repetir esta auditoria para a versão nova: release e data, tag pelas duas vias, arquivos e `checksums.txt`, procura de assinatura e atestação (`gh attestation verify`), notas da versão, leitura de `cmd/root.go`, `cmd/diagnostics.go`, `sources/git.go`, `report/finding.go` e `report/template.go`, allowlist global da configuração padrão, e as medições acima. Nunca usar `@latest`, `go install`, nem um gerenciador de pacotes que baixe outra versão.

## Fontes (acesso em 03/11/2026)

- Release e arquivos: `https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1` (lida por `gh api repos/gitleaks/gitleaks/releases/tags/v8.30.1`, inclusive o `digest` e o `uploader` de cada arquivo); downloads de `https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/<arquivo>`.
- Tag e commit: `git ls-remote https://github.com/gitleaks/gitleaks refs/tags/v8.30.1`, `gh api repos/gitleaks/gitleaks/git/ref/tags/v8.30.1` e `gh api repos/gitleaks/gitleaks/commits/83d9cd684c87d95d656c1458ef04895a7f1cbd8e`.
- Atestação: `gh attestation verify` (gh 2.102.0) e `gh api repos/gitleaks/gitleaks/attestations/sha256:<digest>` (404).
- Código na tag: `.goreleaser.yml`, `.github/workflows/*.yml`, `Makefile`, `go.mod`, `LICENSE`, `config/gitleaks.toml` e os 58 arquivos `.go` sem testes (fora `cmd/generate/`), lidos por `gh api repos/gitleaks/gitleaks/contents/<caminho>?ref=v8.30.1` numa pasta temporária fora do repositório, apagada depois.
- PRs das notas: `gh api repos/gitleaks/gitleaks/pulls/{2040,2020,2002}`.
- Avisos de segurança: `gh api repos/gitleaks/gitleaks/security-advisories` (lista vazia).
