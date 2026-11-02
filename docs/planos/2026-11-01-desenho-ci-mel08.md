# Desenho da CI — MEL-08 (sem ativação)

**Data:** 2026-11-01 · **Status:** desenho; nada criado em `.github/`, nenhum segredo, runner ou proteção de branch · **Pacote:** MEL-08 do [plano de evolução](2026-11-01-evolucao-arquitetura-qualidade.md) §5 · **Story:** [`mel-08-ci-agregada.story.md`](../stories/mel-08-ci-agregada.story.md) · **Base:** [contrato de ambiente](../contrato-ambiente.md) (MEL-03, fatia 1) e [linha de base](2026-11-01-evolucao-linha-de-base.md)

Ativar exige aprovação do responsável na conversa e push pelo @devops. Este documento é o insumo da story; as escolhas abaixo são propostas.

## 1. Princípios

- **A CI chama o mesmo verificador do clone local** (`npm run verificar -- --so … --json`). Nenhuma lista de testes duplicada no YAML: o que muda no contrato muda nos dois lugares.
- **Três estados, sempre.** Cada job publica o JSON do verificador; "não executado" nunca vira verde.
- **Repositório público** (`ianbenicio/King_REA`): logs e artefatos de Actions são públicos. Nada de conteúdo, variáveis de ambiente ou caminhos de `alvos/` e `saidas/`; relatórios citam caminho e tipo de ocorrência.
- **Mínimo de privilégio:** `permissions: contents: read` no workflow; sem `pull_request_target`; sem segredos; `persist-credentials: false` no checkout.
- **Tudo fixado:** actions por SHA completo (cada uma registrada como ferramenta nova, com auditoria curta em `docs/seguranca/`); imagem de runner por rótulo com versão (`windows-2025`, `ubuntu-24.04`), não `-latest`; Node pelo `.node-version`, .NET pelo `global.json`, Semgrep pelo digest do `rodar.mjs`.

## 2. Componentes e onde rodam

| Job | Runner | Componentes do verificador | Classe | Roda em runner hospedado? |
|---|---|---|---|---|
| `js` | `windows-2025` (plataforma suportada; o gate tem regra de caixa do Windows) | `ambiente-node`, `dependencias-npm`, `sintaxe-js`, `js`, `monetizacao` | obrigatória | sim |
| `dotnet` | `windows-2025` | `dotnet-restore` (travado), `notepad-build`, `notepad-core` | obrigatória | sim |
| `semgrep` | `ubuntu-24.04` | `semgrep-scan`, `semgrep-test`, `semgrep-mutacoes` | obrigatória depois da decisão abaixo | **não** no Windows hospedado (só containers Windows; a imagem é Linux). No Ubuntu hospedado é possível: `rodar.mjs` usa caminhos POSIX e já roda com `--network none`, usuário sem privilégio e repositório só leitura. Pendências: o pull por digest precisa de rede antes do `run`, e a auditoria do Semgrep cobre o Docker Desktop local, não o Docker Engine do runner. Decisão do responsável; até lá, "não executado" visível |
| `wpf-interativo` | `windows-2025` | `notepad-ui` | dependente de ambiente | **não comprovado.** A suíte exige usuário interativo, foco de teclado e clipboard da sessão (story MEL-02: 72/76 no sandbox do Codex, 76/76 como usuário logado). Desde a fatia 1 (E2-4a), a sonda decide; ver §4 |
| `publicacao` | `ubuntu-24.04` | checagem compartilhada de publicação (MEL-04) sobre o diff do PR | obrigatória depois da MEL-04 | sim, com fixtures sintéticas |
| `resultado` | `ubuntu-24.04` | lê os JSON de todos os jobs | agregador | sim |

**Nunca rodam na CI:** qualquer coisa que leia `alvos/` ou `saidas/` (ficam fora do git e não existem no checkout); tools `rea` e `ghidra`, protocolos de alvo, captura dinâmica; gabaritos de sessões cegas (`pilotos/` só como fixture de teste do processo, se um teste a usar); `npm run doctor` (inicia o servidor MCP, não é verificação de qualidade). Um passo de guarda no início de cada job falha se `alvos/` ou `saidas/` existirem no workspace.

## 3. Gatilhos, matriz e concorrência

- **Gatilhos:** `pull_request` para `main`, `push` em `main`, `workflow_dispatch`. Sem `schedule` no início (o guia do REA já tem revisão mensal própria).
- **Sem filtro de caminho no início:** todos os jobs rodam em toda mudança (a linha de base mede ~35–45 s locais sem o Semgrep e 285 s com ele, dos quais 192 s são as mutações; no runner, o job `semgrep` é o mais lento e roda em paralelo aos outros). Filtro só depois, e cada filtro com teste que prove não ocultar verificação necessária (aceite da MEL-08).
- **Matriz:** um eixo só por enquanto (a combinação suportada). Node 24 ou .NET de outra faixa não entram: o contrato não os declara.
- **Concorrência:** `concurrency: ci-${{ github.ref }}` com `cancel-in-progress: true` em PR; em `main`, sem cancelar.
- **Cache:** `actions/setup-node` com cache do npm pelo `package-lock.json`; NuGet pelo `packages.lock.json`. Cache não substitui `npm ci` nem `--locked-mode`.

## 4. Testes dependentes de ambiente (WPF)

Regra do plano: classificar como "não executável" exige pré-requisito ausente detectado, não reconhecer o teste como de foco ou clipboard.

1. **Sonda antes da suíte** (a implementar na story): processo pequeno, nosso, que registra `Environment.UserInteractive`, id da sessão do Windows, se uma janela de teste recebe foco de teclado e se um dado sintético vai e volta pelo clipboard. Saída só com booleanos.
2. **Sonda aprovada →** o job roda `notepad-ui`; falha de asserção é falha.
3. **Sonda reprovada →** "não executável neste runner", com o item que faltou. O job termina **vermelho** e fora dos checks obrigatórios: não bloqueia o merge, mas não aparece como aprovado.
4. **Validação WPF completa** continua exigindo evidência local reproduzível: `npm run verificar` como usuário interativo, com o JSON anexado ao PR ou ao handoff. Runner próprio fica como opção a avaliar (plano §5), não como pré-requisito.

**Implementado na fatia 1 (E2-4a, 2026-11-02):** a sonda é `reimplementacoes/notepad/tests/PRKingNotepad.UiProbe` e o verificador a roda antes do `notepad-ui`; a recusa por `GITHUB_ACTIONS=true` saiu. Com a sonda aprovada e uma asserção falhando, o `resultado` agregado fica vermelho (decisão do responsável, 2026-11-02; caso que a tabela do §5 não cobria). O agregador do §5 é `scripts/verificar/agregar-ci.mjs`.

## 5. Resultado agregado

O job `resultado` roda com `if: always()`, baixa os JSON e publica uma tabela no resumo do job (componente, estado, duração, motivo).

| Situação | `resultado` |
|---|---|
| Todos os obrigatórios aprovados | verde |
| Algum obrigatório falhou | vermelho |
| Algum obrigatório não executado (requisito ausente no runner, job cancelado, JSON faltando) | vermelho, com "incompleto" no resumo |
| Só `wpf-interativo` não executado | verde no agregado obrigatório; o resumo diz "WPF: não executável neste runner, validação local pendente", e o check `wpf-interativo` segue vermelho |

Proteção de branch (decisão do responsável, alteração remota pelo @devops): exigir só `resultado`. Exigir o `wpf-interativo` só depois que a sonda passar no runner escolhido.

## 6. Logs e artefatos

- Artefato único por job: o JSON do verificador (resultados sintéticos), retenção de 7 dias.
- O verificador imprime as últimas linhas da saída de um componente que falhou. As suítes do projeto só usam fixtures próprias; a story confere que nenhuma imprime variáveis de ambiente ou caminhos do workspace além do checkout.
- Sem upload de `bin/`, `obj/`, `TestResults/` nem capturas de tela.

## 7. Esboço (não ativo)

Fica aqui, em documento, para revisão. Os SHAs entram depois da auditoria de cada action.

```yaml
name: verificacao
on: { pull_request: { branches: [main] }, push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read }
jobs:
  js:
    runs-on: windows-2025
    steps:
      - uses: actions/checkout@<sha>        # persist-credentials: false
      - run: node -e "for (const d of ['alvos','saidas']) if (require('fs').existsSync(d)) process.exit(1)"
      - uses: actions/setup-node@<sha>      # node-version-file: .node-version, cache: npm
      - run: npm ci --ignore-scripts
      - run: npm run verificar -- --so js,monetizacao,sintaxe-js --json > verificar-js.json
      - uses: actions/upload-artifact@<sha> # if: always(), retention-days: 7
  dotnet:
    runs-on: windows-2025
    steps:
      # checkout, guarda, setup-node, setup-dotnet (global-json-file: reimplementacoes/notepad/global.json)
      - run: npm run verificar -- --so notepad-core --json > verificar-dotnet.json
  resultado:
    needs: [js, dotnet]                     # + semgrep, wpf-interativo, publicacao quando entrarem
    if: always()
    runs-on: ubuntu-24.04
    steps:
      # download-artifact; node agrega os JSON e falha conforme §5
```

## 8. Rastreabilidade com os aceites da MEL-08

| Aceite (plano §5) | Onde o desenho atende | Como provar na ativação |
|---|---|---|
| Todos os componentes aplicáveis contribuem | §2 e §5: cada job publica JSON; `resultado` lê todos | PR de teste com JSON de todos os jobs no resumo |
| Falha plantada em JS, .NET ou regra Semgrep reprova | verificador sai 1; `resultado` vermelho | três PRs de teste (ou um ramo) com uma falha cada, descartados depois |
| Sem Docker ou falha do runner fica visível | "não executado" e JSON ausente = incompleto | job sem Docker e job cancelado → `resultado` vermelho |
| Logs e artefatos só com resultados sintéticos | §1 e §6; guarda de `alvos/`/`saidas/` | revisão dos logs do primeiro PR; busca por caminhos do workspace |
| WPF como categoria própria, nunca aprovado se não executável | §4 | job `wpf-interativo` com sonda reprovada fica vermelho e fora dos obrigatórios |

## 9. Decisões pendentes do responsável

| Decisão | Recomendação |
|---|---|
| Ativar a CI (criar `.github/workflows/`) | Depois da MEL-04 e das auditorias das actions |
| Semgrep no Ubuntu hospedado (pull por digest com rede antes do `run`) | Aceitar, com adendo à auditoria do Semgrep para o Docker Engine do runner |
| Proteção de branch exigindo `resultado` | Sim, pelo @devops, depois de um PR verde |
| Runner próprio para WPF | Adiar até a sonda mostrar o que o runner hospedado oferece |
