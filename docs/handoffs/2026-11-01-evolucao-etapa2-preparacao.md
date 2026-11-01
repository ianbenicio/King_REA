# Handoff — plano de evolução, primeira rodada: preparação da etapa 2

**Data:** 2026-11-01 · **Sessão:** `b0f09ab6-c596-4c67-90db-4d7a659b416f`, aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed` · **Branch:** `main`, sem push (o push só sai pelo @devops, com autorização) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) · **Base:** `5ade645`

## Perfil do projeto

Domínio laboratório de engenharia reversa (qualidade e ambiente) · stack Node ESM 26, .NET 10/WPF, Docker (Semgrep) · integrações nenhuma nova (REA 6.4.0 só lido) · UI WPF só nos testes · dados sensíveis nenhum · fase AIOX SDC (stories da etapa 2 em Draft) · complexidade STANDARD.

## Entregas

| Entrega | Arquivos | Commit |
|---|---|---|
| Fase 0 e arquivamento do plano MEL-06a | `docs/plano-de-execucao.md` (novo), `docs/planos/2026-11-01-evolucao-etapa1-mel06a.md` | `5917f2e` |
| MEL-03 fatia 1: contrato de ambiente e verificação local | `reimplementacoes/notepad/global.json`, `.node-version`, `.npmrc`, `package.json`, `scripts/verificar/verificar.mjs` e teste, `docs/contrato-ambiente.md`, story MEL-03 | `5e71dbd` |
| Desenho da CI MEL-08 (sem ativação) | `docs/planos/2026-11-01-desenho-ci-mel08.md` | `d90adb5` |
| Linha de base | `docs/planos/2026-11-01-evolucao-linha-de-base.md` | `0113880` |
| Capacidade, stories MEL-04 e MEL-08, §12 marcada | plano de evolução §3, §5, §12, §13; `docs/stories/mel-04-*`, `mel-08-*` | `e77b918` |
| Este handoff | `docs/handoffs/2026-11-01-evolucao-etapa2-preparacao.md` | commit seguinte |

Retorno à versão anterior: `git revert` dos commits acima, na ordem inversa, sem push. O revert de `5e71dbd` devolve o `test:notepad` à raiz (sem `global.json`) e tira o verificador do `npm test`.

## Decisões

- **`global.json` em `reimplementacoes/notepad/`**, `version` 10.0.401, `rollForward: "patch"`, sem prévia. O `dotnet` resolve o arquivo pelo diretório de trabalho: `test:notepad` e o verificador entram na pasta antes.
- **Node 26.x** (`.node-version` 26.12.1, `engines ^26.0.0`, `.npmrc` com `engine-strict` e `ignore-scripts`). O REA aceita 22.19+/24.11+; o projeto declara só o testado.
- **Verificador de três estados** (`npm run verificar`): aprovado, falhou, não executado; saída 0, 1, 3 (incompleto) e 2 (uso). "Não executado" só por requisito detectado (PATH, SDK, daemon do Docker, plataforma, usuário do sandbox do Codex, `GITHUB_ACTIONS`). Build .NET em `%TEMP%\prking-verificar-notepad`.
- **Lint e tipos em etapas:** sem ferramenta nova nesta rodada (exige auditoria); pendência impressa em toda execução.
- **CI:** cada job roda o verificador. Fora do runner hospedado: WPF interativo (categoria própria, vermelho e fora dos obrigatórios se a sonda reprovar), Semgrep no Windows hospedado (imagem Linux), tudo que leia `alvos/`/`saidas/`. Semgrep no Ubuntu hospedado é possível, mas depende de decisão do responsável.
- **Unity:** não se aplica a este repositório (PRKing_UO).

## Critérios e verificação

Os três itens abertos da §12 estão marcados com evidência.

- [x] `dotnet --version` em `reimplementacoes/notepad/` = 10.0.401; SDK inexistente recusado pelo host.
- [x] `packages.lock.json` adulterado (cópia temporária) → `dotnet restore --locked-mode` sai 1 (`NU1004`); lock npm divergente recusado nos testes.
- [x] `npm run verificar` 2× com o Docker desligado: 9 aprovados (JS 184/184, Core 137/137, UI 76/76), 3 não executados (Semgrep), saída 3; 45 s e 33 s.
- [x] Depois que o responsável ligou o Docker: Semgrep isolado 3/3 (267 s) e verificação completa 12/12, saída 0, 285 s (mutações 192 s).
- [x] Sem `dotnet` no PATH → "requisito ausente" e dependentes "não executado", saída 3; componente desconhecido → saída 2.
- [x] `npm test`: 184/184 (eram 173). `npm run test:notepad`: Core 137, UI 76.
- [x] `pre-commit` passou nos 5 commits, sem `--no-verify`.

Clipboard: os testes de UI usam o `ClipboardScope`, que restaura o conteúdo. Nenhum PRKing Notepad estava aberto (`tasklist`), nenhum processo foi fechado.

## Pendências

- **Validação @po** das stories MEL-03, MEL-04 e MEL-08 (Draft). A fatia 1 da MEL-03 foi implementada antes da validação porque a §12 a pedia; fica registrado na story.
- **MEL-03 fatia 2:** auditoria e escolha de lint e tipos.
- **Decisões do responsável para a MEL-08:** ativação, Semgrep no Ubuntu hospedado, proteção de branch, runner próprio (desenho §9).
- **Clone limpo real** não exercitado (mesma máquina, `node_modules` já instalado).
- **Fora desta sessão:** MEL-06a-m (migração da seção 8 dos registros); U4 do piloto do perfil do alvo.

## Falhas e retrabalho

- O resumo das contagens .NET não casava: o `dotnet test` em pt-BR usa travessão (–) e não hífen. Regex refeita para os rótulos em português e inglês, com teste.
- Mensagem "que não executado" corrigida para "que não foi executado".

## Precedentes e Engram

- Consultas (2, `vault_deep_query_tool`): ver §2 do plano. Usados: `testes-de-ui-wpf-falham-no-sandbox-elevado-do-codex-no-windo` (relatada) e `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` (verificável).
- Salvo: `verifica-o-local-com-tr-s-estados-e-global-json-resolvido-pe` (pattern, `maturidade/draft`).

## Métricas (`sessao.js`, antes do commit do handoff)

| Chamadas | Escrita cache | Leitura cache | Saída | Contexto médio / máx. | > 200k | Engram |
|---|---|---|---|---|---|---|
| 53 | 196k | 9,5M | 67k | 183k / 239k | 36% | 3 (2 consultas, 1 gravação) |

## Conectores

Não foram tocados.
