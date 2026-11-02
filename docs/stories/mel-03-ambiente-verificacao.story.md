# Story MEL-03 — declarar ambiente e criar um contrato de verificação local

**Status:** InProgress (fatia 2 iniciada em 2026-11-02 pela E2-2, com Biome e TypeScript aprovados pelo responsável; validação @po em 2026-11-02: GO condicional, 9,5/10; fatia 1 entregue em 2026-11-01)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @dev → @qa) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Origem:** A07 e parte de A04 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-03 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5
**Complexidade:** STANDARD · estimativa M, em duas fatias · **Dependências:** nenhuma story antes; a fatia 2 depende da aprovação do responsável para cada ferramenta nova (plano de evolução §10); o encerramento é integrado com a [MEL-08](mel-08-ci-agregada.story.md), que usa o verificador como executor de cada job; a [MEL-04](mel-04-publicacao-compartilhada.story.md) acrescenta o componente `publicacao` ao verificador

## Story

**Como** responsável pelo laboratório,
**quero** versões declaradas e um comando único que diga o que passou, o que falhou e o que não pôde rodar,
**para** que outro clone, outra pessoa ou a CI reproduzam a verificação sem depender desta máquina nem confundir falta de ambiente com sucesso.

## Contexto

Antes desta story: sem `global.json` (hipótese da MEL-02 descartada como causa, mas lacuna real), versões só em documentos, `npm test` cobrindo só JavaScript, Notepad e Semgrep em comandos separados, e scripts `lint`/`typecheck` citados nas instruções genéricas sem existir no projeto. Já existiam e foram reaproveitados: `scripts/instalar-dotnet.ps1` (SDK fixado por SHA-512), `RestorePackagesWithLockFile` com `packages.lock.json`, `scripts/semgrep/rodar.mjs` (sai com 2 sem Docker).

## Escopo

**Fatia 1 (entregue):** `reimplementacoes/notepad/global.json`; `.node-version`, `engines` e `.npmrc`; verificador `scripts/verificar/verificar.mjs` com teste; `npm run verificar`; `test:notepad` rodando na pasta do `global.json`; [`docs/contrato-ambiente.md`](../contrato-ambiente.md) (versões, clone limpo, componentes, estados).
**Fatia 2 (pendente):** lint e tipos, cada ferramenta nova com auditoria em `docs/seguranca/`, versão fixada e `--ignore-scripts`, entrando como componentes do verificador; execução real em clone limpo (AC6).
**Fora:** instalar ou atualizar runtimes e SDKs; atualizar o REA; workflows em `.github/` e jobs da CI (ficam na MEL-08, que chama os componentes desta story); Unity (mora no PRKing_UO).

## Critérios de aceitação

- [x] **AC1** — Guia de clone limpo informa versões, instalação, comandos e requisitos por componente. Evidência: `docs/contrato-ambiente.md` §1–3.
- [x] **AC2** — Mudança não aprovada de dependências faz a validação travada falhar. Evidência: npm, `compararLockNpm` recusa versão divergente, dependência sem lock e instalado ≠ lock (3 testes); .NET, cópia temporária com `packages.lock.json` adulterado → `dotnet restore --locked-mode` sai 1 com `NU1004` ("arquivo de bloqueio de pacotes é inconsistente"); o verificador usa `--locked-mode`.
- [x] **AC3** — Agregador distingue aprovado, falhou e não executado; requisito ausente nunca vira sucesso. Evidência: 5 testes de `executarPlano`/`agregar`; execução real com Docker desligado → Semgrep "não executado", saída 3; sem `dotnet` no PATH → `dotnet-restore` "requisito ausente" e dependentes "não executado", saída 3; componente desconhecido → saída 2.
- [ ] **AC4** — Lint e tipos têm escopo explícito, ou decisão de implantação em etapas com pendências visíveis. Parcial: decisão em etapas registrada e pendências impressas em toda execução; falta escolher, auditar e fixar as ferramentas (fatia 2). Fecha quando AC4a e AC4b fecharem:
  - [x] **AC4a (lint)** — Dada uma ferramenta de lint aprovada pelo responsável, auditada em `docs/seguranca/`, com versão fixada no lock e instalada com `--ignore-scripts`, quando `npm run verificar` roda, então o componente `lint` cobre ao menos `.claude/hooks/` e `scripts/` e reprova uma violação plantada numa cópia temporária; sem a ferramenta instalada, o componente sai "requisito ausente", nunca aprovado.
    Evidência (2026-11-02): Biome 2.5.15 auditado em [`docs/seguranca/auditoria-biome-2.5.15.md`](../seguranca/auditoria-biome-2.5.15.md) (procedência SLSA do pacote e dos binários, integridade do lock igual à auditada, sem scripts); componente `lint` em `scripts/verificar/verificar.mjs` (`--error-on-warnings`, escopo `ESCOPO_LINT`), também `npm run lint`; `scripts/verificar/ferramentas.test.mjs` no `npm test`: cópia limpa aprova, erro plantado (`noAssignInExpressions`) e aviso plantado (`noCommaOperator`) reprovam com saída 1, Biome ausente → "requisito ausente", saída 3. Lint retroativo: 11 achados em 6 arquivos (7 erros, 2 avisos, 2 informativos), todos corrigidos sem desligar regra e sem mudar comportamento (`npm test` 207/207).
  - [ ] **AC4b (tipos)** — Dado o escopo de tipos decidido (`checkJs` com JSDoc nos módulos de política, ou outra ferramenta aprovada e auditada), quando o componente roda, então um erro de tipo plantado reprova; se o custo não compensar, a decisão de não adotar fica registrada nesta story com o motivo e a pendência continua impressa. Em nenhum caso um comando que só confere sintaxe se chama `typecheck`.
- [x] **AC5** — `global.json` fixa o SDK do Notepad. Evidência: `dotnet --version` na pasta = `10.0.401`; `global.json` sintético pedindo `10.0.999` com `rollForward: disable` → "A compatible .NET SDK was not found".
- [ ] **AC6** — Dado um clone novo do repositório numa pasta vazia, sem `node_modules`, quando o guia do contrato é seguido (`npm ci --ignore-scripts` e `npm run verificar`), então o resultado por componente é registrado nesta story e nenhum requisito ausente aparece como aprovado. Condição de saída da etapa 2 (plano de evolução §3); demanda E2-6 do relatório de 2026-11-02.

## Decisões

- **`global.json` em `reimplementacoes/notepad/`, não na raiz:** escopo pedido e só o Notepad usa .NET. Como o `dotnet` procura o arquivo a partir do diretório de trabalho, `test:notepad` e o verificador entram na pasta antes.
- **`rollForward: "patch"`:** reproduz a 10.0.401 validada quando instalada e aceita uma correção mais nova da mesma faixa num clone que não a tenha; faixa ou major diferentes falham.
- **Node 26.x:** o REA aceita 22.19+, 24.11+ e 26+; o projeto declara só o major testado.
- **Build do verificador em `%TEMP%\prking-verificar-notepad`:** não trava o `bin/` de um Notepad aberto (lição da NB5).
- **"Não executado" só por requisito detectado:** plataforma, usuário do sandbox do Codex (story MEL-02), `GITHUB_ACTIONS`, `dotnet` ou SDK ausentes, daemon do Docker. A regra da UI em runner fica com a MEL-08.
- **Lint e tipos em etapas:** ferramenta nova sem auditoria não entra. Escopo proposto para a fatia 2: `.claude/hooks/` e `scripts/` primeiro; tipos por `checkJs` com JSDoc nos módulos de política, se o custo for baixo.

## Riscos

- Ferramenta de lint ou tipos com dependências transitivas grandes ou scripts de instalação — auditoria no método de `docs/seguranca/auditoria-semgrep-1.180.0.md`, versão fixada, `--ignore-scripts`; sem auditoria aprovada, a ferramenta não entra.
- Lint retroativo gerar volume de achados que trave o trabalho — escopo inicial só em `.claude/hooks/` e `scripts/`, expansão gradual (plano de evolução §10).
- Clone limpo nunca exercitado (mesma máquina, `node_modules` já instalado) esconder dependência implícita do ambiente — AC6 em pasta nova, sem `node_modules`.
- Verificador aprovar por falta de ambiente — "não executado" só por requisito detectado (AC3); a regra da UI em runner fica com a MEL-08.

## Definition of Done

AC1–AC6 marcados com evidência; auditoria registrada em `docs/seguranca/` para cada ferramenta nova; `npm test` e `npm run verificar` verdes (Semgrep com Docker ligado); QA @qa com gate registrado; `pre-commit` sem `--no-verify`.

## Tasks

- [x] `global.json`, `.node-version`, `engines`, `.npmrc`.
- [x] Verificador, teste no `npm test` e script `verificar`.
- [x] Contrato e guia de clone limpo.
- [x] Provas negativas (lock adulterado, SDK inexistente, `dotnet` ausente, Docker desligado).
- [x] Validação @po da story inteira (2026-11-02, GO condicional).
- [x] Fatia 2, lint (AC4a): auditoria, instalação fixada, componente, provas, lint retroativo corrigido.
- [ ] Fatia 2, tipos (AC4b).
- [ ] Clone limpo real (AC6).
- [ ] QA @qa da story inteira.

## File List

- `reimplementacoes/notepad/global.json` — novo.
- `.node-version`, `.npmrc` — novos.
- `package.json` — `engines`, `verificar`, teste novo no `test`, `test:notepad` com `cd`.
- `scripts/verificar/verificar.mjs`, `scripts/verificar/verificar.test.mjs` — novos.
- `docs/contrato-ambiente.md` — novo.
- `docs/stories/mel-03-ambiente-verificacao.story.md` — esta story.
- Fatia 2: `docs/seguranca/auditoria-biome-2.5.15.md` (novo); `biome.json` (novo); `package.json` e `package-lock.json` (Biome em `devDependencies`, script `lint`, teste novo no `test`); `scripts/verificar/verificar.mjs` (componente `lint`, `ESCOPO_LINT`, pendências); `scripts/verificar/ferramentas.test.mjs` (novo); `docs/contrato-ambiente.md`; correções do lint retroativo em `.claude/hooks/rea-gate.mjs`, `.claude/hooks/rea-gate.test.mjs`, `.claude/hooks/cli-gate.test.mjs`, `scripts/assets/organizar-assets.mjs`, `scripts/monetizacao/verificar-perfis.mjs`, `scripts/verificar/verificar.test.mjs`.

## QA Results

Fatia 1, verificação do executor (QA @qa independente pendente com a validação):

| Verificação | Resultado |
|---|---|
| `node --test scripts/verificar/verificar.test.mjs` | 11/11 |
| `npm test` | 184/184 (eram 173) |
| `npm run verificar` (Docker desligado) | 9 aprovados, 3 não executados (Semgrep), saída 3, 45 s; ver [linha de base](../planos/2026-11-01-evolucao-linha-de-base.md) |
| `npm run verificar` (Docker ligado) | 12/12 aprovados, saída 0, 285 s |

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-03; fatia 1 implementada na preparação da etapa 2 (§12 do plano de evolução) | sessão `b0f09ab6` |
| 2026-11-02 | Status Ready → InProgress: fatia 2 iniciada (E2-2); AC4a entregue com Biome 2.5.15 | sessão `0da91073` (@dev) |
| 2026-11-02 | Validação @po: 6,5/10 (NO-GO) como estava; correções aplicadas (dependências, AC4a/AC4b, AC6, Riscos, DoD, fronteira com a MEL-08); 9,5/10, GO condicional; status Draft → Ready | sessão `aade639a` (@po) |

## Validação @po (2026-11-02)

Checklist de 10 pontos (`story-lifecycle.md`). Nota: 1 atende, 0,5 parcial, 0 não atende.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Contexto diz o que havia e o que foi reaproveitado |
| 3 | AC testáveis | 0,5 | 1 | AC4 não fechava a fatia 2; virou AC4a/AC4b com falha plantada |
| 4 | Escopo dentro e fora | 1 | 1 | Fronteira com a MEL-08 explicitada (jobs ficam lá) |
| 5 | Dependências | 0,5 | 1 | Estavam implícitas; linha própria no cabeçalho |
| 6 | Complexidade | 1 | 1 | M, duas fatias |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 0 | 1 | Seção criada |
| 9 | Definition of Done | 0 | 1 | Seção criada |
| 10 | Alinhamento com o plano | 0,5 | 0,5 | Inventário de JDK, Ghidra, uv, Python e Semgrep conferido no contrato §1. Falta da story: clone limpo real (condição de saída da etapa 2) — AC6 criado. Fica 0,5 até a fatia 2 provar o AC4 do plano |
| | **Total** | **6,5** | **9,5** | **GO condicional** |

**Correções aplicadas** (cada uma com fonte): dependências (plano §5, MEL-03 "encerramento integrado com MEL-08"; §10, aprovação de ferramenta); AC4a/AC4b (plano §5, "lint de forma incremental", "`typecheck` só se analisar tipos"; §10, "scripts e política primeiro"); AC6 (plano §3, condição de saída da etapa 2; relatório de 2026-11-02, E2-6); Riscos e DoD (checklist, pontos 8 e 9); "integração com a CI" saiu da fatia 2 e foi para Fora (desenho da CI §2: cada job roda o verificador).

**Condições do GO:** a fatia 2 só começa com a ferramenta aprovada pelo responsável (E2-2). **Observações:** a fatia 1 foi implementada antes desta validação, por pedido da §12 do plano; a tabela de QA Results é verificação do executor, não gate @qa.
