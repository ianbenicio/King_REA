# Story MEL-03 — declarar ambiente e criar um contrato de verificação local

**Status:** Draft (fatia 1 entregue em 2026-11-01 pela §12 do plano de evolução; validação @po pendente antes da fatia 2)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @dev → @qa) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Origem:** A07 e parte de A04 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-03 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5
**Complexidade:** STANDARD · estimativa M, em duas fatias

## Story

**Como** responsável pelo laboratório,
**quero** versões declaradas e um comando único que diga o que passou, o que falhou e o que não pôde rodar,
**para** que outro clone, outra pessoa ou a CI reproduzam a verificação sem depender desta máquina nem confundir falta de ambiente com sucesso.

## Contexto

Antes desta story: sem `global.json` (hipótese da MEL-02 descartada como causa, mas lacuna real), versões só em documentos, `npm test` cobrindo só JavaScript, Notepad e Semgrep em comandos separados, e scripts `lint`/`typecheck` citados nas instruções genéricas sem existir no projeto. Já existiam e foram reaproveitados: `scripts/instalar-dotnet.ps1` (SDK fixado por SHA-512), `RestorePackagesWithLockFile` com `packages.lock.json`, `scripts/semgrep/rodar.mjs` (sai com 2 sem Docker).

## Escopo

**Fatia 1 (entregue):** `reimplementacoes/notepad/global.json`; `.node-version`, `engines` e `.npmrc`; verificador `scripts/verificar/verificar.mjs` com teste; `npm run verificar`; `test:notepad` rodando na pasta do `global.json`; [`docs/contrato-ambiente.md`](../contrato-ambiente.md) (versões, clone limpo, componentes, estados).
**Fatia 2 (pendente):** lint e tipos, cada ferramenta nova com auditoria em `docs/seguranca/`, versão fixada e `--ignore-scripts`; integração com a CI (MEL-08).
**Fora:** instalar ou atualizar runtimes e SDKs; atualizar o REA; workflows em `.github/`; Unity (mora no PRKing_UO).

## Critérios de aceitação

- [x] **AC1** — Guia de clone limpo informa versões, instalação, comandos e requisitos por componente. Evidência: `docs/contrato-ambiente.md` §1–3.
- [x] **AC2** — Mudança não aprovada de dependências faz a validação travada falhar. Evidência: npm, `compararLockNpm` recusa versão divergente, dependência sem lock e instalado ≠ lock (3 testes); .NET, cópia temporária com `packages.lock.json` adulterado → `dotnet restore --locked-mode` sai 1 com `NU1004` ("arquivo de bloqueio de pacotes é inconsistente"); o verificador usa `--locked-mode`.
- [x] **AC3** — Agregador distingue aprovado, falhou e não executado; requisito ausente nunca vira sucesso. Evidência: 5 testes de `executarPlano`/`agregar`; execução real com Docker desligado → Semgrep "não executado", saída 3; sem `dotnet` no PATH → `dotnet-restore` "requisito ausente" e dependentes "não executado", saída 3; componente desconhecido → saída 2.
- [ ] **AC4** — Lint e tipos têm escopo explícito, ou decisão de implantação em etapas com pendências visíveis. Parcial: decisão em etapas registrada e pendências impressas em toda execução; falta escolher, auditar e fixar as ferramentas (fatia 2).
- [x] **AC5** — `global.json` fixa o SDK do Notepad. Evidência: `dotnet --version` na pasta = `10.0.401`; `global.json` sintético pedindo `10.0.999` com `rollForward: disable` → "A compatible .NET SDK was not found".

## Decisões

- **`global.json` em `reimplementacoes/notepad/`, não na raiz:** escopo pedido e só o Notepad usa .NET. Como o `dotnet` procura o arquivo a partir do diretório de trabalho, `test:notepad` e o verificador entram na pasta antes.
- **`rollForward: "patch"`:** reproduz a 10.0.401 validada quando instalada e aceita uma correção mais nova da mesma faixa num clone que não a tenha; faixa ou major diferentes falham.
- **Node 26.x:** o REA aceita 22.19+, 24.11+ e 26+; o projeto declara só o major testado.
- **Build do verificador em `%TEMP%\prking-verificar-notepad`:** não trava o `bin/` de um Notepad aberto (lição da NB5).
- **"Não executado" só por requisito detectado:** plataforma, usuário do sandbox do Codex (story MEL-02), `GITHUB_ACTIONS`, `dotnet` ou SDK ausentes, daemon do Docker. A regra da UI em runner fica com a MEL-08.
- **Lint e tipos em etapas:** ferramenta nova sem auditoria não entra. Escopo proposto para a fatia 2: `.claude/hooks/` e `scripts/` primeiro; tipos por `checkJs` com JSDoc nos módulos de política, se o custo for baixo.

## Tasks

- [x] `global.json`, `.node-version`, `engines`, `.npmrc`.
- [x] Verificador, teste no `npm test` e script `verificar`.
- [x] Contrato e guia de clone limpo.
- [x] Provas negativas (lock adulterado, SDK inexistente, `dotnet` ausente, Docker desligado).
- [ ] Validação @po da story inteira.
- [ ] Fatia 2: auditoria e escolha de lint e tipos.

## File List

- `reimplementacoes/notepad/global.json` — novo.
- `.node-version`, `.npmrc` — novos.
- `package.json` — `engines`, `verificar`, teste novo no `test`, `test:notepad` com `cd`.
- `scripts/verificar/verificar.mjs`, `scripts/verificar/verificar.test.mjs` — novos.
- `docs/contrato-ambiente.md` — novo.
- `docs/stories/mel-03-ambiente-verificacao.story.md` — esta story.

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
