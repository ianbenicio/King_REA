# Story MEL-04 — transformar a política de publicação em verificação compartilhada

**Status:** InProgress (2026-11-02: módulo, caminhos proibidos, regras próprias de segredo, exceções e componente entregues; falta a auditoria do gitleaks, decidida pelo responsável em 2026-11-02 e deixada para a próxima unidade por limite de contexto)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @dev → @qa; integração @devops) · **Origem:** A06 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-04 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5
**Complexidade:** STANDARD · estimativa M · **Dependências:** contrato de verificação da MEL-03 (fatia 1 entregue: [`docs/contrato-ambiente.md`](../contrato-ambiente.md)); é pré-requisito do job `publicacao` da [CI MEL-08](../planos/2026-11-01-desenho-ci-mel08.md)

## Story

**Como** responsável por um repositório público,
**quero** que a mesma regra de publicação rode no `pre-commit` e na CI, olhando o conteúdo que entra no commit,
**para** que um clone sem o hook, um envio pela interface do GitHub ou um `--no-verify` não publiquem dado bruto, segredo ou código extenso do alvo sem que alguém veja.

## Contexto

Hoje a política está dentro de `.githooks/pre-commit.mjs`: em `registros/` (fora `_modelos/`), bloqueia binário, extensão fora de `md|py|js|mjs|ts|mmd|svg|txt`, arquivo acima de 300 KB e bloco de código Markdown com mais de 40 linhas (mermaid de fora); e roda a checagem de monetização quando o commit mexe em `reimplementacoes/` ou no catálogo. Ela só vale no clone que rodou `git config core.hooksPath .githooks`. Não há detecção de segredo, e `alvos/`/`saidas/` só estão protegidos pelo `.gitignore` (um `git add -f` passa).

## Escopo

**Dentro:**
- Módulo `scripts/publicacao/` com a decisão pura (entrada: lista de mudanças com estado A/C/M/R/D, caminho antigo e novo, tamanho, binário, conteúdo; saída: problemas com caminho e tipo de ocorrência). O `pre-commit` passa a chamá-lo; a CI chama o mesmo módulo sobre o diff do PR.
- Caminhos proibidos em qualquer lugar: `alvos/`, `saidas/`, `.rea/` e `ferramentas/` inteira, mesmo com `git add -f`. (`ferramentas/` inteira porque o `CLAUDE.md` diz que os clones ficam ali, fora do git, e `git ls-files ferramentas` está vazio; o `.gitignore` hoje só lista `ferramentas/universal-modder/` e `ferramentas/ghidramcp/`.)
- Testes de caracterização do `pre-commit` atual, escritos antes da extração: hoje o `npm test` não tem nenhum teste dele.
- Renomes (`R`) avaliados pelo caminho novo e pelo antigo; remoções (`D`) nunca bloqueiam.
- Detecção de segredos: primeiro regras próprias para os formatos realmente usados no projeto e nos conectores (chaves de API, tokens de GitHub, JWT, chaves privadas PEM), com fixtures sintéticas; detector externo só se passar por auditoria no método de `docs/seguranca/auditoria-semgrep-1.180.0.md` (versão fixada, sem rede, sem telemetria).
- Relatório só com caminho, linha e tipo; nunca o valor detectado.
- Exceções justificadas em arquivo versionado, cada uma com motivo e teste.
- Componente `publicacao` no verificador da MEL-03.

**Fora:** varredura do histórico do git; revisão humana de origem (a checagem não a dispensa); prevenção antes do envio fora do clone local (a CI só detecta o que já chegou ao remoto); ativação da CI (MEL-08).

## Critérios de aceitação

- [x] **AC1** — Dado o mesmo conjunto de fixtures, quando ele passa pelo `pre-commit` e pela entrada da CI, então as duas decisões são idênticas (teste que compara as duas entradas).
- [x] **AC2** — Dado um arquivo em cada caminho proibido (`alvos/`, `saidas/`, `.rea/`, `ferramentas/`) adicionado com `git add -f`, um segredo sintético de cada formato coberto (chave de API, token de GitHub, JWT, chave privada PEM) e um bloco de código de 41 linhas em `registros/`, quando a checagem roda, então todos são recusados.
- [x] **AC3** — Dados casos permitidos (modelo em `registros/_modelos/`, mermaid longo, renome dentro de `registros/` com extensão permitida, remoção de arquivo proibido), quando a checagem roda, então nada é bloqueado.
- [x] **AC4** — Dado um segredo detectado, quando o relatório é impresso, então ele não contém o valor e diz que a revisão humana de origem continua necessária.
- [x] **AC5** — Dados testes de caracterização escritos contra o `pre-commit` atual antes da extração (binário, extensão fora da lista, arquivo acima de 300 KB, bloco acima de 40 linhas, mermaid longo, `registros/_modelos/`, disparo da checagem de monetização), quando rodam contra o módulo novo, então todos passam; os testes entram no `npm test`, que fica verde, e `npm run verificar` mostra o componente `publicacao`.
- [x] **AC6** — Dada uma exceção no arquivo versionado de exceções, quando a checagem roda, então só o caminho e o tipo exceptuados passam; exceção sem motivo é recusada; cada exceção tem teste.

## Riscos

- Falso positivo bloqueando registro legítimo — exceções versionadas com motivo e teste.
- Regex de segredo fraca dar sensação de proteção — o relatório e a documentação dizem o que é coberto; formatos não cobertos ficam listados.
- Fixtures de segredo sintético versionadas num repositório público dispararem o secret scanning do GitHub no push, ou a própria checagem no commit — montar os valores em tempo de teste (por partes), sem o literal completo no arquivo; acrescentado na validação @po.
- Divergência entre o hook e a CI se cada um montar a entrada de um jeito — a montagem também fica no módulo (a partir de `git diff --cached` e de `git diff base...head`), com teste.

## Definition of Done

AC1–AC6 marcados com evidência; auditoria registrada se houver ferramenta externa, ou lacuna registrada se nenhuma passar (plano de evolução §5); formatos de segredo não cobertos listados na documentação; QA @qa com gate registrado; `pre-commit` sem `--no-verify` no próprio commit.

## Decisão do responsável necessária

Detector de segredos externo: auditar um candidato ou ficar só com regras próprias (E2-3 do relatório de 2026-11-02). Não bloqueia o início: extração, caminhos proibidos e regras próprias vêm antes; a task do detector externo só começa com a decisão.

**Decidido em 2026-11-02 (conversa da sessão principal):** "Auditar o gitleaks". A aprovação cobre auditar; a adoção só se a auditoria passar sem problema (procedência, checksum e assinatura, rede e telemetria, licença, script de instalação). Binário fora do git, com hash registrado; componente opcional do verificador, "não executado" quando ausente.

## Tasks

- [x] Validação @po (10 pontos) — 2026-11-02, GO.
- [x] Testes de caracterização do `pre-commit` atual (antes de mexer nele) — 13 casos, verdes contra o hook de `ffd8886`.
- [x] Extrair a política atual para o módulo, sem mudar comportamento (os mesmos testes antes e depois) — `0b56b7a`.
- [x] Caminhos proibidos, renomes e remoções.
- [x] Regras de segredo próprias e fixtures (montadas por partes); decisão sobre detector externo: auditar o gitleaks.
- [x] Auditoria do gitleaks (`docs/seguranca/auditoria-gitleaks-8.30.1.md`, `ecf81ce`): sem assinatura nem atestação; responsável decidiu "Adotar isolado" (2026-11-03). Componente `gitleaks` isolado em contêiner, "não executado" sem Docker ou binário, fora do `pre-commit` (medição na auditoria) — `1561e4d`.
- [x] Arquivo de exceções versionado, com motivo e teste por exceção.
- [x] Componente `publicacao` no verificador.
- [x] QA @qa — 2026-11-02, CONCERNS; QA-E23-01 a 06 corrigidos na mesma unidade, QA-E23-07 para a MEL-08.

## File List

- `docs/stories/mel-04-publicacao-compartilhada.story.md` — esta story.
- `scripts/publicacao/publicacao.mjs` — política de publicação: decisão pura, regras de segredo, exceções, montagem da entrada (índice, `base...head`, árvore) e linha de comando.
- `scripts/publicacao/excecoes.json` — exceções versionadas (vazio).
- `scripts/publicacao/pre-commit.test.mjs` — caracterização do hook e casos novos pelo hook real (repositório temporário).
- `scripts/publicacao/publicacao.test.mjs` — AC1 (índice × CI), entrada, AC4, AC6.
- `.githooks/pre-commit.mjs` — passa a chamar o módulo; monetização sem mudança.
- `scripts/verificar/verificar.mjs` — componente `publicacao`; pendência de tipos atualizada.
- `scripts/tipos/node-minimo.d.ts`, `tsconfig.json` — `publicacao.mjs` entra na checagem de tipos.
- `package.json` — testes no `npm test`; `npm run check:publicacao`.
- `docs/contrato-ambiente.md` — componente, política e lista de segredos cobertos e não cobertos.
- `docs/handoffs/2026-11-02-e2-3-publicacao.md` — handoff da unidade.
- `docs/plano-de-execucao.md` — plano da Fase 0 (E2-2 arquivado em `docs/planos/2026-11-02-e2-2-lint-tipos.md`).
- `docs/seguranca/auditoria-gitleaks-8.30.1.md` — auditoria do gitleaks, aceitação com ressalva e uso isolado (E2-3b).
- `scripts/publicacao/gitleaks.mjs` — detector externo isolado: hash, `git archive`, contêiner sem rede, relatório sem valor; componente `gitleaks`.
- `scripts/publicacao/gitleaks.toml` — configuração própria (padrão da versão, sem allowlist).
- `scripts/publicacao/gitleaks.test.mjs` — provas do detector externo (regras puras e gitleaks real com Docker).
- `scripts/publicacao/pre-commit.test.mjs` — fixture da chave da Anthropic partida (falso positivo do gitleaks).
- `.gitignore` — `ferramentas/gitleaks/` fora do git.
- `package.json`, `tsconfig.json`, `scripts/tipos/node-minimo.d.ts`, `scripts/verificar/verificar.mjs` — teste no `npm test`, `npm run check:gitleaks`, `gitleaks.mjs` na checagem de tipos, componente no verificador (E2-3b).
- `docs/plano-de-execucao.md` — plano da E2-3b (E2-3 arquivado em `docs/planos/2026-11-02-e2-3-publicacao.md`).

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-03 | @dev (E2-3b): auditoria do gitleaks 8.30.1 (`ecf81ce`); responsável escolhe "Adotar isolado"; componente `gitleaks` isolado, testes, contrato (`1561e4d` e seguintes) | sessão `70e9a223` (@dev) |
| 2026-11-01 | Story criada (Draft) a partir da MEL-04, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
| 2026-11-02 | @qa: gate CONCERNS (7 achados, nenhum alto); @dev corrige QA-E23-01 a 06 | sessão `c237632e` (@qa, @dev) |
| 2026-11-02 | @dev: caracterização (13 casos contra o hook antigo), extração para `scripts/publicacao/`, caminhos proibidos, regras próprias de segredo, exceções, componente `publicacao` (`0b56b7a`); gitleaks adiado para a próxima unidade | sessão `c237632e` (@dev) |
| 2026-11-02 | Validação @po: 9/10 como estava; correções aplicadas (caminhos proibidos, caracterização do `pre-commit`, AC2 por formato, AC6 de exceções, decisão do detector); 10/10, GO; status Draft → Ready | sessão `aade639a` (@po) |

## Validação @po (2026-11-02)

Checklist de 10 pontos (`story-lifecycle.md`). Nota: 1 atende, 0,5 parcial, 0 não atende.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Contexto descreve a regra atual do `pre-commit` e o que falta |
| 3 | AC testáveis | 0,5 | 1 | AC5 pedia "regressões do `pre-commit` atual", que não existem (nenhum `*.test.mjs` cita o hook); AC2 tinha um só segredo para quatro formatos; exceções estavam no escopo sem AC |
| 4 | Escopo dentro e fora | 0,5 | 1 | "`ferramentas/` clonadas" era ambíguo: o `.gitignore` só lista dois clones |
| 5 | Dependências | 1 | 1 | MEL-03 (contrato) antes; pré-requisito do job `publicacao` da MEL-08 |
| 6 | Complexidade | 1 | 1 | M |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | — |
| 9 | Definition of Done | 1 | 1 | Acrescentada a lacuna registrada se nenhum detector passar (plano §5) |
| 10 | Alinhamento com o plano | 1 | 1 | Os quatro aceites do plano §5 estão cobertos por AC1–AC4 |
| | **Total** | **9** | **10** | **GO** |

**Correções aplicadas** (cada uma com fonte): `ferramentas/` inteira (`CLAUDE.md`, regra de clones fora do git; `git ls-files ferramentas` vazio; `.gitignore` conferido); testes de caracterização e AC5 reescrito (busca por `pre-commit` em `**/*.test.mjs` sem resultado; lista de testes do `package.json`); AC2 por formato (escopo da própria story); AC6 de exceções (escopo da própria story, "cada uma com motivo e teste"); lacuna do detector no DoD (plano §5); decisão do detector separada (relatório de 2026-11-02, E2-3).

**Condições do GO:** nenhuma para começar; a task do detector externo espera a decisão do responsável.

## QA Results (2026-11-02, @qa, commit `0b56b7a`)

**Decisão: CONCERNS** — política nova igual ou mais estrita que a antiga em todos os casos testados; sem fail-open (erro do git bloqueia: hook sai 1, linha de comando sai 2); relatório sem o valor; nenhum literal completo de segredo nos testes. `npm test` 250/250; `verificar --so publicacao,lint,tipos,js` aprovado; os 13 testes de caracterização rodados de novo contra o hook de `ffd8886` (`git archive`): 13/13.

| AC | Evidência | Atende? |
|---|---|---|
| AC1 | `publicacao.test.mjs` "AC1: a mesma fixture…" (índice × `base...head`, com renome, remoção e exceção) | sim |
| AC2 | `pre-commit.test.mjs`: quatro caminhos proibidos com `-f`, cinco segredos pelo hook, bloco de 41 linhas | sim |
| AC3 | `_modelos/`, mermaid longo, renome dentro de `registros/`, remoção de arquivo proibido | sim |
| AC4 | testes de segredo pelo hook (sem o valor nem pedaço dele, com a frase da revisão humana) e "AC4: o relatório…" | sim |
| AC5 | 13 testes de caracterização verdes no hook antigo e no novo; `npm test` verde; componente `publicacao` | sim |
| AC6 | três testes de exceção pelo hook, "exceções inválidas", "cada exceção versionada é válida e ainda necessária" | sim |

| Achado | Sev. | Problema | Situação |
|---|---|---|---|
| QA-E23-01 | média | mudança de tipo (`T`, symlink → arquivo) ficava fora do `--diff-filter` (o hook antigo também pulava) | corrigido: `T` avaliado como `M`; teste |
| QA-E23-02 | baixa | caminho proibido só na raiz e com caixa exata (`ALVOS/`, `registros/x/saidas/` passavam) | corrigido: `alvos`, `saidas`, `.rea` em qualquer nível, `ferramentas` na raiz, sem diferenciar maiúsculas; teste |
| QA-E23-03 | baixa | texto UTF-16 (`>` do PowerShell 5.1) contado como binário, sem busca de segredo | corrigido: UTF-16 com BOM decodificado para a busca; em `registros/` continua binário; teste |
| QA-E23-04 | baixa | regra do Google com `` final perdia chave terminada em hífen | corrigido; teste |
| QA-E23-05 | baixa | exceção podia liberar `caminho-proibido` | corrigido: exceção desse tipo é recusada; teste |
| QA-E23-06 | baixa | sete regras sem fixture positiva | corrigido: uma fixture por regra, e o teste reprova regra sem fixture |
| QA-E23-07 | baixa | na CI, `base...head` vê só o estado final do PR: segredo que entrou e saiu em commits intermediários passa | aberto, para a MEL-08 (avaliar cada commit de `base..head` contra o pai, ou documentar o limite) |

Depois das correções: `npm test` 256/256 (três rodadas; uma rodada anterior teve 1 falha não identificada que não se repetiu), `publicacao`, `lint`, `tipos` e `sintaxe-js` aprovados.

**Falta para o Done:** auditoria do gitleaks (DoD: "auditoria registrada se houver ferramenta externa"), próxima unidade.
