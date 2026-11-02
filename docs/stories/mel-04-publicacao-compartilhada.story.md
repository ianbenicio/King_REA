# Story MEL-04 — transformar a política de publicação em verificação compartilhada

**Status:** Ready (validação @po em 2026-11-02: GO, 10/10 depois das correções; o detector externo de segredos aguarda decisão do responsável, as regras próprias não)
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

- [ ] **AC1** — Dado o mesmo conjunto de fixtures, quando ele passa pelo `pre-commit` e pela entrada da CI, então as duas decisões são idênticas (teste que compara as duas entradas).
- [ ] **AC2** — Dado um arquivo em cada caminho proibido (`alvos/`, `saidas/`, `.rea/`, `ferramentas/`) adicionado com `git add -f`, um segredo sintético de cada formato coberto (chave de API, token de GitHub, JWT, chave privada PEM) e um bloco de código de 41 linhas em `registros/`, quando a checagem roda, então todos são recusados.
- [ ] **AC3** — Dados casos permitidos (modelo em `registros/_modelos/`, mermaid longo, renome dentro de `registros/` com extensão permitida, remoção de arquivo proibido), quando a checagem roda, então nada é bloqueado.
- [ ] **AC4** — Dado um segredo detectado, quando o relatório é impresso, então ele não contém o valor e diz que a revisão humana de origem continua necessária.
- [ ] **AC5** — Dados testes de caracterização escritos contra o `pre-commit` atual antes da extração (binário, extensão fora da lista, arquivo acima de 300 KB, bloco acima de 40 linhas, mermaid longo, `registros/_modelos/`, disparo da checagem de monetização), quando rodam contra o módulo novo, então todos passam; os testes entram no `npm test`, que fica verde, e `npm run verificar` mostra o componente `publicacao`.
- [ ] **AC6** — Dada uma exceção no arquivo versionado de exceções, quando a checagem roda, então só o caminho e o tipo exceptuados passam; exceção sem motivo é recusada; cada exceção tem teste.

## Riscos

- Falso positivo bloqueando registro legítimo — exceções versionadas com motivo e teste.
- Regex de segredo fraca dar sensação de proteção — o relatório e a documentação dizem o que é coberto; formatos não cobertos ficam listados.
- Fixtures de segredo sintético versionadas num repositório público dispararem o secret scanning do GitHub no push, ou a própria checagem no commit — montar os valores em tempo de teste (por partes), sem o literal completo no arquivo; acrescentado na validação @po.
- Divergência entre o hook e a CI se cada um montar a entrada de um jeito — a montagem também fica no módulo (a partir de `git diff --cached` e de `git diff base...head`), com teste.

## Definition of Done

AC1–AC6 marcados com evidência; auditoria registrada se houver ferramenta externa, ou lacuna registrada se nenhuma passar (plano de evolução §5); formatos de segredo não cobertos listados na documentação; QA @qa com gate registrado; `pre-commit` sem `--no-verify` no próprio commit.

## Decisão do responsável necessária

Detector de segredos externo: auditar um candidato ou ficar só com regras próprias (E2-3 do relatório de 2026-11-02). Não bloqueia o início: extração, caminhos proibidos e regras próprias vêm antes; a task do detector externo só começa com a decisão.

## Tasks

- [x] Validação @po (10 pontos) — 2026-11-02, GO.
- [ ] Testes de caracterização do `pre-commit` atual (antes de mexer nele).
- [ ] Extrair a política atual para o módulo, sem mudar comportamento (os mesmos testes antes e depois).
- [ ] Caminhos proibidos, renomes e remoções.
- [ ] Regras de segredo próprias e fixtures; decisão sobre detector externo.
- [ ] Arquivo de exceções versionado, com motivo e teste por exceção.
- [ ] Componente `publicacao` no verificador.
- [ ] QA @qa.

## File List

- `docs/stories/mel-04-publicacao-compartilhada.story.md` — esta story.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-04, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
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
