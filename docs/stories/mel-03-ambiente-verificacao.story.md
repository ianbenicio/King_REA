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
- [x] **AC4** — Lint e tipos têm escopo explícito, ou decisão de implantação em etapas com pendências visíveis. Fechado em 2026-11-02 com o AC4a e o AC4b: escopo explícito (`ESCOPO_LINT` e `files` do `tsconfig.json`); a expansão continua impressa como pendência em toda execução.
  - [x] **AC4a (lint)** — Dada uma ferramenta de lint aprovada pelo responsável, auditada em `docs/seguranca/`, com versão fixada no lock e instalada com `--ignore-scripts`, quando `npm run verificar` roda, então o componente `lint` cobre ao menos `.claude/hooks/` e `scripts/` e reprova uma violação plantada numa cópia temporária; sem a ferramenta instalada, o componente sai "requisito ausente", nunca aprovado.
    Evidência (2026-11-02): Biome 2.5.15 auditado em [`docs/seguranca/auditoria-biome-2.5.15.md`](../seguranca/auditoria-biome-2.5.15.md) (procedência SLSA do pacote e dos binários, integridade do lock igual à auditada, sem scripts); componente `lint` em `scripts/verificar/verificar.mjs` (`--error-on-warnings`, escopo `ESCOPO_LINT`), também `npm run lint`; `scripts/verificar/ferramentas.test.mjs` no `npm test`: cópia limpa aprova, erro plantado (`noAssignInExpressions`) e aviso plantado (`noCommaOperator`) reprovam com saída 1, Biome ausente → "requisito ausente", saída 3. Lint retroativo: 11 achados em 6 arquivos (7 erros, 2 avisos, 2 informativos), todos corrigidos sem desligar regra e sem mudar comportamento (`npm test` 207/207).
  - [x] **AC4b (tipos)** — Dado o escopo de tipos decidido (`checkJs` com JSDoc nos módulos de política, ou outra ferramenta aprovada e auditada), quando o componente roda, então um erro de tipo plantado reprova; se o custo não compensar, a decisão de não adotar fica registrada nesta story com o motivo e a pendência continua impressa. Em nenhum caso um comando que só confere sintaxe se chama `typecheck`.
    Evidência (2026-11-02): TypeScript 6.0.3, escolhido pelo responsável depois de a auditoria achar a 7.0.2 com binário nativo sem procedência, auditado em [`docs/seguranca/auditoria-typescript-6.0.3.md`](../seguranca/auditoria-typescript-6.0.3.md). Componente `tipos` (`tsc --noEmit`, `checkJs`, `strict` sem `noImplicitAny`) sobre `rea-gate.mjs`, `cli-gate.mjs` e `verificar-perfis.mjs`, também `npm run tipos`. Sem `@types/node`: declarações mínimas em `scripts/tipos/node-minimo.d.ts`. Provas em `scripts/verificar/ferramentas.test.mjs`: cópia dos módulos aprova; `TS2322` plantado no `rea-gate` reprova; `decide("talvez", …)` no `cli-gate` reprova (`TS2345`, a anotação JSDoc é conferida); TypeScript ausente → "requisito ausente". Primeira rodada: 12 achados, corrigidos com JSDoc e uma guarda reordenada, sem mudar comportamento. O comando se chama `tipos`; nada se chama `typecheck`.
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
- [x] Fatia 2, tipos (AC4b): auditoria, instalação fixada, `tsconfig.json`, JSDoc nos módulos de política, componente, provas.
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
- Fatia 2, tipos: `docs/seguranca/auditoria-typescript-6.0.3.md` (novo); `tsconfig.json` e `scripts/tipos/node-minimo.d.ts` (novos); `package.json` e `package-lock.json` (TypeScript em `devDependencies`, script `tipos`); `scripts/verificar/verificar.mjs` (componente `tipos`); `scripts/verificar/ferramentas.test.mjs` (provas de tipos); JSDoc em `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs` e `scripts/monetizacao/verificar-perfis.mjs`; `docs/seguranca/auditoria-biome-2.5.15.md` (limite de assinatura resolvido); `docs/contrato-ambiente.md`.

## QA Results

Fatia 1, verificação do executor (QA @qa independente pendente com a validação):

| Verificação | Resultado |
|---|---|
| `node --test scripts/verificar/verificar.test.mjs` | 11/11 |
| `npm test` | 184/184 (eram 173) |
| `npm run verificar` (Docker desligado) | 9 aprovados, 3 não executados (Semgrep), saída 3, 45 s; ver [linha de base](../planos/2026-11-01-evolucao-linha-de-base.md) |
| `npm run verificar` (Docker ligado) | 12/12 aprovados, saída 0, 285 s |

### Gate @qa da fatia 2 (2026-11-02)

**Revisor:** Quinn (@qa), modo autônomo. **Escopo:** commits locais `e46e822` (lint, Biome 2.5.15) e `f9f0f9d` (tipos, TypeScript 6.0.3 com `checkJs`), diff `a24971e..f9f0f9d`; AC4, AC4a, AC4b. **Fora do gate:** AC6 (clone limpo), em execução em outra frente; fica pendente para fechar a story, que continua `InProgress`.

**Veredito: CONCERNS.** AC4, AC4a e AC4b atendidos, com prova do executor e prova negativa própria do @qa. Nenhum achado bloqueia. Fica um achado médio de cadeia de suprimento (QA-E22-01), a corrigir antes do fechamento da story ou registrar como débito com dono.

#### As 7 checagens

| # | Checagem | Resultado | Evidência |
|---|---|---|---|
| 1 | Revisão de código | OK | Diff lido linha a linha. Nos hooks: `forEach` → `for…of` em `collectPaths` (arrays vindos de JSON não têm buracos, mesmo efeito); laço do `sha256` reescrito com `break` em `n <= 0` (equivalente ao `> 0` anterior); `decide()` ganhou só JSDoc (`never`, `"allow" \| "deny" \| "ask"`), e as duas versões continuam terminando em `process.exit(0)`. Em `verificar-perfis.mjs`, `if (!atual) continue` antes do `match` dá o mesmo resultado que `atual && linha.match(...)` seguido de `if (!campo) continue`; o resto são coerções JSDoc e template strings. Nenhuma mudança de comportamento nos gates |
| 2 | Testes | OK | `npm test` 211/211 (eram 207 depois do lint). `scripts/verificar/ferramentas.test.mjs` cobre cópia limpa aprovada, erro plantado (`noAssignInExpressions`), aviso plantado (`noCommaOperator`), `TS2322` no `rea-gate`, `TS2345` em `decide("talvez", …)` e ferramenta ausente → "requisito ausente", saída 3 |
| 3 | Critérios de aceitação | OK (AC4, AC4a, AC4b) | Escopo explícito em `ESCOPO_LINT` e em `files` do `tsconfig.json`; pendências impressas em toda execução; nada se chama `typecheck` (grep vazio em `.claude/hooks`, `scripts`, `.githooks`, `package.json`). AC6 fica fora deste gate |
| 4 | Sem regressão | OK | Regressões dos dois gates dentro dos 211; `npm run lint` e `npm run tipos` aprovados no repositório |
| 5 | Desempenho | OK | `lint` 0,1 s (15 arquivos, contagem conferida com `find`); `tipos` 0,5 s (4 arquivos) |
| 6 | Segurança | CONCERNS | Integridade do lock igual à das auditorias (Biome principal, `cli-win32-x64`, `cli-linux-x64` e TypeScript); `hasInstallScript` em nenhuma entrada; versões exatas no `package.json` e na raiz do lock; SHA-256 do `biome.exe` instalado (`f2beadee…1926`) igual ao auditado; `BIOME_BINARY` não é repassado: o lançador aceita a variável (com ela apontando para caminho inexistente, `biome --version` quebra) e o componente aprovou com ela definida. Nenhum `biome-ignore`, `@ts-ignore`, `@ts-expect-error` nem `@ts-nocheck`. Achado QA-E22-01 |
| 7 | Documentação | OK | As duas auditorias cobrem versão exata, integridade, procedência, dependências, binários com hash (Biome; o TypeScript não tem binário), scripts, rede e telemetria, licença e veredito. Os limites estão declarados: TypeScript sem atestação SLSA; 7.0.2 recusada por binário nativo sem procedência e 6.0.3 escolhida pelo responsável; seis binários do Biome não baixados; sem build reprodutível; sem captura de rede. `docs/contrato-ambiente.md` atualizado (versões, componentes, pendências) |

#### Achados

| ID | Severidade | Achado | Recomendação |
|---|---|---|---|
| QA-E22-01 | Média (segurança, cadeia de suprimento) | `lint` e `tipos` dependem só de `ambiente-node`, não de `dependencias-npm`. `comDependencias(["lint"])` = `lint`, `ambiente-node`; o mesmo para `tipos`. Por isso `npm run lint` e `npm run tipos` executam o que estiver em `node_modules` sem conferir contra o lock: um Biome ou TypeScript de outra versão, não auditado, roda e pode sair "APROVADO". No `npm run verificar` completo o agregado não fica verde, porque `dependencias-npm` falha, mas a linha do `lint` aparece "aprovado" com a ferramenta errada. O executável nativo do Biome (`@biomejs/cli-win32-x64`) também fica fora do `compararLockNpm`, que só confere dependências diretas | Acrescentar `dependencias-npm` em `depende` dos dois componentes, com teste de que divergência no lock deixa `lint`/`tipos` "não executado". Avaliar a conferência da versão (ou do SHA-256) do pacote de plataforma do Biome contra o lock. Atualizar a coluna de dependências no contrato §4 |
| QA-E22-02 | Baixa (qualidade) | `noImplicitAny: false` é escolha declarada (story, auditoria e `tsconfig.json`), mas o tamanho do débito não aparece. Rodada do @qa com `--noImplicitAny true`: 57 erros (`rea-gate` 25, `verificar-perfis` 31, `cli-gate` 1). A frase da auditoria "nenhuma opção do `strict` foi desligada para esconder achado" é correta quanto à intenção, mas uma opção do `strict` está desligada | Pôr o número na pendência impressa pelo verificador e no contrato (por exemplo, "noImplicitAny desligado: 57 parâmetros sem tipo"), para a expansão ter linha de base. Ajustar a frase da auditoria para citar a exceção |
| QA-E22-03 | Baixa (testes) | As provas de lint do repositório plantam a violação só em `ESCOPO_LINT[0]` (`.claude/hooks`). Que `scripts/` também é coberto, só a prova do @qa mostrou | Parametrizar o teste de violação plantada sobre todas as pastas de `ESCOPO_LINT` |

**Pendente para fechar a story (não avaliado aqui):** AC6, clone limpo, a registrar pelo @dev; depois, `npm run verificar` com Docker ligado (DoD). O `pre-commit` está ativo (`core.hooksPath = .githooks`); o @qa não tem como provar, depois do commit, que não houve `--no-verify`.

#### Comandos rodados

| Comando | Resultado |
|---|---|
| `git show --stat e46e822 f9f0f9d`; `git diff a24971e..f9f0f9d` (hooks, scripts, configurações, `package.json`, contrato) | 16 + 13 arquivos; diff lido |
| `npm test` | 211/211, 0 falhas, saída 0 |
| `npm run lint` | `lint` aprovado, 15 arquivos; APROVADO, saída 0; pendências impressas |
| `npm run tipos` | `tipos` aprovado, 4 arquivos; APROVADO, saída 0; pendências impressas |
| Leitura do `package-lock.json` (Node) | integridades iguais às auditadas; `hasInstallScript` em nenhuma entrada; raiz com `@biomejs/biome` `2.5.15` e `typescript` `6.0.3` |
| `sha256sum node_modules/@biomejs/cli-win32-x64/biome.exe` | `f2beadee753b78fe76081158123538be886a31b5e67a34863e42535f3f491926`, igual à auditoria |
| grep por `biome-ignore`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `typecheck` | nenhuma ocorrência |
| `tsc -p tsconfig.json --noEmit --noImplicitAny true` | 57 erros (QA-E22-02) |
| Prova própria em `%TEMP%` (script fora do repositório): `debugger` plantado em `scripts/` | `lint` falhou, `noDebugger`, saída 1 |
| Idem: cópia limpa com `BIOME_BINARY` apontando para caminho inexistente | `lint` aprovado (variável não repassada); o lançador direto com a variável quebra |
| Idem: `(s) => s.length` com `s: string \| null` plantado em `verificar-perfis` | `tipos` falhou, `TS18047`, saída 2 (checagem de tipo, não de sintaxe) |
| Idem: `decide("allow")` com um argumento plantado no `rea-gate` | `tipos` falhou, `TS2554` |
| Idem: pasta sem `tsconfig.json`; pasta sem `biome.json` nem escopo | os dois "falhou", nunca aprovado |
| `comDependencias(["lint"])`, `(["tipos"])`, `(["js"])` | `lint`/`tipos` só com `ambiente-node`; `js` com `dependencias-npm` (QA-E22-01) |

Não foram usadas tools `rea` nem `ghidra`, `alvos/` não foi lido e a UI WPF não foi executada. As cópias temporárias foram apagadas.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-03; fatia 1 implementada na preparação da etapa 2 (§12 do plano de evolução) | sessão `b0f09ab6` |
| 2026-11-02 | AC4b entregue com TypeScript 6.0.3 (a 7.0.2 parou na auditoria: binário nativo sem procedência; o responsável escolheu a 6.0.3); AC4 fechado | sessão `0da91073` (@dev) |
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
