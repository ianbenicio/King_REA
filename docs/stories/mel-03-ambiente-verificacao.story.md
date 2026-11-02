# Story MEL-03 — declarar ambiente e criar um contrato de verificação local

**Status:** Done (re-verificação @qa em 2026-11-02: CONCERNS, achados do gate resolvidos, QA-E22-01b baixa a registrar como débito; fatia 2 e AC6 entregues em 2026-11-02 pela E2-2; Biome e TypeScript aprovados pelo responsável; validação @po em 2026-11-02: GO condicional, 9,5/10; fatia 1 entregue em 2026-11-01)
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
- [x] **AC6** — Dado um clone novo do repositório numa pasta vazia, sem `node_modules`, quando o guia do contrato é seguido (`npm ci --ignore-scripts` e `npm run verificar`), então o resultado por componente é registrado nesta story e nenhum requisito ausente aparece como aprovado. Condição de saída da etapa 2 (plano de evolução §3); demanda E2-6 do relatório de 2026-11-02.
  Evidência (2026-11-02): três execuções com `git clone` do repositório local em `%TEMP%\prking-clone-limpo-*`, sem `node_modules`, `core.autocrlf=true` (Git do sistema), `npm ci --ignore-scripts` (147 pacotes, 14–23 s), `git config core.hooksPath .githooks` e `node scripts/verificar/verificar.mjs`:
  1. `f9f0f9d`, Docker desligado: 11 aprovados, Semgrep (3) "não executado — requisito ausente: daemon do Docker inacessível", saída 3. Nenhum requisito ausente virou aprovado.
  2. `f9f0f9d`, Docker ligado: 13 aprovados, **`semgrep-mutacoes` falhou** (saída 1). Esta é a dependência implícita que o AC6 procurava: o checkout em CRLF quebrava o casamento dos trechos de `scripts/semgrep/mutacoes.mjs` ("trecho original não encontrado"), e no repositório principal passava. Corrigido em `d0238b3` (a cópia mutada é normalizada para LF).
  3. `d0238b3`, Docker ligado: **14/14 aprovados, saída 0**, em 3 min 45 s; `js` 213/213, `notepad-core` 137/137, `notepad-ui` 76/76.
  Limite: o clone é da mesma máquina (SDK .NET, Docker e cache do npm já presentes). Isso prova o repositório sem `node_modules` e sem estado local, não uma máquina nova; a máquina nova fica com a CI da MEL-08.

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
- [x] Clone limpo real (AC6): três execuções; a segunda achou a falha das mutações em CRLF, corrigida em `d0238b3`.
- [x] Correções dos achados QA-E22-01/02/03 (`d0238b3`).
- [x] QA @qa da story inteira (re-verificação do gate da fatia 2).

## File List

- `reimplementacoes/notepad/global.json` — novo.
- `.node-version`, `.npmrc` — novos.
- `package.json` — `engines`, `verificar`, teste novo no `test`, `test:notepad` com `cd`.
- `scripts/verificar/verificar.mjs`, `scripts/verificar/verificar.test.mjs` — novos.
- `docs/contrato-ambiente.md` — novo.
- `docs/stories/mel-03-ambiente-verificacao.story.md` — esta story.
- Fatia 2: `docs/seguranca/auditoria-biome-2.5.15.md` (novo); `biome.json` (novo); `package.json` e `package-lock.json` (Biome em `devDependencies`, script `lint`, teste novo no `test`); `scripts/verificar/verificar.mjs` (componente `lint`, `ESCOPO_LINT`, pendências); `scripts/verificar/ferramentas.test.mjs` (novo); `docs/contrato-ambiente.md`; correções do lint retroativo em `.claude/hooks/rea-gate.mjs`, `.claude/hooks/rea-gate.test.mjs`, `.claude/hooks/cli-gate.test.mjs`, `scripts/assets/organizar-assets.mjs`, `scripts/monetizacao/verificar-perfis.mjs`, `scripts/verificar/verificar.test.mjs`.
- Fatia 2, tipos: `docs/seguranca/auditoria-typescript-6.0.3.md` (novo); `tsconfig.json` e `scripts/tipos/node-minimo.d.ts` (novos); `package.json` e `package-lock.json` (TypeScript em `devDependencies`, script `tipos`); `scripts/verificar/verificar.mjs` (componente `tipos`); `scripts/verificar/ferramentas.test.mjs` (provas de tipos); JSDoc em `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs` e `scripts/monetizacao/verificar-perfis.mjs`; `docs/seguranca/auditoria-biome-2.5.15.md` (limite de assinatura resolvido); `docs/contrato-ambiente.md`.
- Correções do gate e AC6: `scripts/verificar/verificar.mjs` (`lint` e `tipos` dependem de `dependencias-npm`; pendência com os 57 erros); `scripts/verificar/ferramentas.test.mjs` (violação plantada nas duas pastas de `ESCOPO_LINT`; lock divergente bloqueia `lint` e `tipos`); `scripts/semgrep/mutacoes.mjs` (cópia mutada normalizada para LF); `docs/contrato-ambiente.md`; `docs/seguranca/auditoria-typescript-6.0.3.md`.

## Dev Notes

Resposta ao gate @qa da fatia 2 (commit `d0238b3`):

- **QA-E22-01** (média): `lint` e `tipos` passam a depender de `ambiente-node` e `dependencias-npm`. Com o lock divergente, os dois ficam "não executado" com o motivo da dependência, em vez de rodar um binário que o lock não confere. Teste novo em `ferramentas.test.mjs`; contrato atualizado.
- **QA-E22-02** (baixa): os 57 erros com `noImplicitAny` ligado (`rea-gate` 25, `verificar-perfis` 31, `cli-gate` 1) estão na pendência impressa pelo verificador, no contrato e na auditoria do TypeScript. A opção continua desligada; ligá-la é decisão futura.
- **QA-E22-03** (baixa): a prova de lint planta a violação em cada pasta de `ESCOPO_LINT`, não só na primeira.
- **AC6:** a falha de `semgrep-mutacoes` no clone vinha de `core.autocrlf=true` no gitconfig do sistema; a cópia mutada é normalizada para LF antes de casar os trechos. Não muda regra nem mutação.

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

### Re-verificação @qa (2026-11-02)

**Revisor:** Quinn (@qa), modo autônomo. **Escopo:** commit `d0238b3` (correções QA-E22-01/02/03 e normalização de fim de linha em `scripts/semgrep/mutacoes.mjs`) e a evidência do AC6 registrada pelo @dev.

**Veredito: CONCERNS.** Os três achados do gate da fatia 2 estão resolvidos, com prova. AC1–AC6 atendidos. Fica uma observação baixa, herdada da recomendação do QA-E22-01, que não bloqueia: registrar como débito. Status InReview → Done.

#### Achados do gate anterior

| ID | Estado | Evidência |
|---|---|---|
| QA-E22-01 | Resolvido | `depende: ["ambiente-node", "dependencias-npm"]` em `componenteLint` e `componenteTipos`. `comDependencias(["lint"])` = `lint`, `ambiente-node`, `dependencias-npm`; `comDependencias(["tipos"])` = `tipos`, `ambiente-node`, `dependencias-npm`. Teste novo "lint e tipos não rodam com o lock divergente (QA-E22-01)": os dois ficam "não executado" com o motivo da dependência e o espião confirma que nenhum executou. Contrato §4 atualizado |
| QA-E22-02 | Resolvido | `PENDENCIAS[1]` cita "sem noImplicitAny (57 erros com ele ligado)", impressa no fim da execução; contrato e auditoria do TypeScript citam os 57 (`rea-gate` 25, `verificar-perfis` 31, `cli-gate` 1). A frase da auditoria agora nomeia a exceção do `strict` |
| QA-E22-03 | Resolvido | O teste de violação plantada é gerado por `for (const pasta of ESCOPO_LINT)` (`.claude/hooks` e `scripts`), com `pastaPlantada` em `copiaLint` e asserção extra de que o detalhe cita `plantado.mjs` |
| QA-E22-01b (novo, baixa, segurança) | Aberto, não bloqueia | Parte da recomendação do QA-E22-01 ficou sem tratamento nem registro: `compararLockNpm` confere só as dependências diretas, então o pacote de plataforma `@biomejs/cli-win32-x64` (o executável nativo) não é conferido contra o lock. Registrar como débito com dono (MEL-03 expansão ou MEL-08) ou conferir versão/SHA-256 desse pacote |

#### `mutacoes.mjs`

A mudança é uma linha: o texto lido da cópia em `_mutacao-tmp` passa por `.replace(/\r\n/g, "\n")` antes do `includes`/`replace`. O array `MUTACOES`, o `EXTRA_R3`, as regras em `reimplementacoes/puzzle-piloto/semgrep/` e o critério de disparo não mudaram (`git diff d0238b3~1 d0238b3 -- semgrep/ scripts/semgrep/` toca só esse arquivo). O efeito fica na cópia temporária, apagada no `finally`; o arquivo mutado sai em LF, sem efeito nas regras.

#### AC6

A evidência basta: três execuções em clone novo sem `node_modules`, a terceira em `d0238b3` com 14/14 aprovados e saída 0; a primeira mostra Semgrep "não executado" com Docker desligado (nenhum requisito ausente virou aprovado). A segunda é o tipo de achado que o AC6 existe para pegar, e foi corrigida. O limite (mesma máquina, não máquina nova) está declarado e fica com a CI da MEL-08. O @qa não reexecutou o verificador completo nem o Semgrep.

#### Comandos rodados

| Comando | Resultado |
|---|---|
| `git show --stat d0238b3`; `git show d0238b3 -- scripts/ docs/contrato-ambiente.md docs/seguranca/` | 6 arquivos; diff lido |
| `node -e` com `comDependencias(["lint"])` e `(["tipos"])` | os dois incluem `dependencias-npm` |
| `node -e` com `PENDENCIAS` e `ESCOPO_LINT` | pendência com "57"; escopo `.claude/hooks`, `scripts` |
| `npm test` | 213/213, 0 falhas |
| `node scripts/verificar/verificar.mjs --so lint,tipos,monetizacao` | 5 aprovados (com `ambiente-node` e `dependencias-npm`), APROVADO, saída 0; `lint` 15 arquivos, `tipos` 4; pendências impressas |

Não foram usadas tools `rea` nem `ghidra`, `alvos/` não foi lido e a UI WPF não foi executada.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-02 | Re-verificação @qa: CONCERNS (QA-E22-01/02/03 resolvidos; QA-E22-01b baixa, a registrar como débito); status InReview → Done | sessão `0da91073` (@qa) |
| 2026-11-01 | Story criada (Draft) a partir da MEL-03; fatia 1 implementada na preparação da etapa 2 (§12 do plano de evolução) | sessão `b0f09ab6` |
| 2026-11-02 | Status InProgress → InReview: AC6 entregue (clone limpo, 14/14 em `d0238b3`, depois da correção de CRLF nas mutações); achados QA-E22-01/02/03 corrigidos | sessão `0da91073` (@dev) |
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
