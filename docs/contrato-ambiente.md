# Contrato de ambiente e verificação local

**MEL-03** do [plano de evolução](planos/2026-11-01-evolucao-arquitetura-qualidade.md) (§5) · story [`mel-03-ambiente-verificacao.story.md`](stories/mel-03-ambiente-verificacao.story.md) · versão de 2026-11-01.

Diz quais versões o projeto suporta, como preparar um clone limpo e como saber, com um comando, o que passou, o que falhou e o que não pôde rodar por falta de ambiente. Começa pela combinação já validada nesta máquina (etapa 1 do plano). Nada aqui instala ferramenta, atualiza o REA ou muda configuração global.

## 1. Versões suportadas

| Componente | Versão | Onde está declarada | Política |
|---|---|---|---|
| Node.js | 26.x (validado: 26.12.1) | `.node-version`; `engines` do `package.json` (`^26.0.0`); `.npmrc` com `engine-strict=true` | O verificador recusa outro major. O REA 6.4.0 aceita `^22.19.0 \|\| ^24.11.0 \|\| >=26.0.0`; o projeto só declara o que testou |
| npm | o que vem com o Node (validado: 11.20.0) | — | `npm ci --ignore-scripts` (o `.npmrc` também liga `ignore-scripts`) |
| REA (`rea-agents`) | 6.4.0 exata | `package.json`, integridade no `package-lock.json` | Atualizar só pela regra do CLAUDE.md (auditoria, `--save-exact --ignore-scripts`, reclassificar tools) |
| Biome (`@biomejs/biome`) | 2.5.15 exata, em `devDependencies` | `package.json`, integridade no `package-lock.json`; configuração em `biome.json` | Auditoria em `docs/seguranca/auditoria-biome-2.5.15.md`; atualizar só repetindo a auditoria, com `--save-exact --ignore-scripts` |
| .NET SDK | 10.0.401 | `reimplementacoes/notepad/global.json` | `rollForward: "patch"`: usa a 10.0.401 se instalada; sem ela, a maior correção da faixa 10.0.4xx; outra faixa ou major falha. Sem prévia (`allowPrerelease: false`) |
| Runtimes .NET | Microsoft.NETCore.App e WindowsDesktop.App 10.0.12 | Vêm com o SDK 10.0.401 | `net10.0` (Core) e `net10.0-windows` (WPF) |
| Pacotes NuGet | os do `packages.lock.json` de cada projeto | `Directory.Build.props` (`RestorePackagesWithLockFile`) | Validação com `dotnet restore --locked-mode`: grafo diferente do lock falha |
| Docker | Docker Desktop com daemon Linux (cliente validado: 29.4.3) | — | Só para o Semgrep |
| Semgrep | 1.180.0, imagem por digest | `scripts/semgrep/rodar.mjs` (`IMAGEM`) | Auditoria em `docs/seguranca/auditoria-semgrep-1.180.0.md`; sem rede, sem telemetria |
| Windows | Windows 10/11 x64, sessão interativa do usuário | — | Exigido pelos testes de UI WPF (story MEL-02) |
| Unity | não se aplica a este repositório | — | O projeto Unity mora no PRKing_UO (exceção de 2026-10-28); a versão decidida está em `registros/uo-classic/especificacao.md` §1 |

Ferramentas de análise, fora da verificação (inventário de 2026-11-01; não entram no comando abaixo porque dependem de alvo):

| Ferramenta | Versão em uso | Fonte |
|---|---|---|
| JDK | 21.0.12.1 (Microsoft Build of OpenJDK) | `docs/runbook-prereqs-nativo.md` |
| Ghidra | 12.1.4 (`GHIDRA_INSTALL_DIR`) | idem |
| GhidraMCP | commit `1e98025`, com `mcp==1.30.0` e `requests==2.34.2` | `.mcp.json` |
| uv / uvx | 0.11.17 (inicia o GhidraMCP) | — |
| Python | 3.15.1 (só `scripts/re/decodificar-recursos-pe.py`, biblioteca padrão) | — |

## 2. Clone limpo

1. Node 26 no PATH (conferir com `node --version`). O projeto não instala Node.
2. Dependências JavaScript, respeitando o lock e sem scripts de instalação:

   ```bash
   npm ci --ignore-scripts
   ```

3. Hook de git, uma vez por clone:

   ```bash
   git config core.hooksPath .githooks
   ```

4. .NET (só para o Notepad): SDK 10.0.4xx. Nesta máquina ele está em `C:\tools\dotnet`, instalado por `scripts/instalar-dotnet.ps1` (download conferido por SHA-512). Conferir na pasta do `global.json`:

   ```bash
   cd reimplementacoes/notepad && dotnet --version
   ```

   O `dotnet` procura o `global.json` a partir do diretório de trabalho, não do projeto: rodar `dotnet` na raiz do repositório ignora a fixação. Por isso `npm run test:notepad` e o verificador entram em `reimplementacoes/notepad/` antes.
5. Docker Desktop ligado, só se for rodar o Semgrep.
6. Verificar:

   ```bash
   npm run verificar
   ```

Não rodar `rea setup` nem `rea update` (CLAUDE.md).

## 3. Verificação local: `npm run verificar`

Roda os componentes em ordem e imprime uma linha por componente com estado, duração e motivo. Opções: `-- --lista` (componentes), `-- --so id1,id2` (só esses, com as dependências), `-- --json` (relatório para anexar a baseline ou handoff).

| Id | O que roda | Requisito | Depende de |
|---|---|---|---|
| `ambiente-node` | major do Node contra `.node-version` | — | — |
| `dependencias-npm` | `package.json` × `package-lock.json` × `node_modules` | — | — |
| `sintaxe-js` | `node --check` em `.claude/hooks`, `.githooks`, `scripts`, `reimplementacoes/puzzle-piloto` | — | `ambiente-node` |
| `lint` | `biome lint --error-on-warnings` em `.claude/hooks` e `scripts` (regras recomendadas; avisos reprovam). Também `npm run lint` | Biome instalado em `node_modules` | `ambiente-node` |
| `js` | `npm test` (gates, assets, monetização, verificador e puzzle-piloto) | — | `ambiente-node`, `dependencias-npm` |
| `monetizacao` | `npm run check:monetizacao` | — | `ambiente-node` |
| `dotnet-restore` | `dotnet restore --locked-mode` | `dotnet` com SDK compatível com o `global.json` | — |
| `notepad-build` | `dotnet build --no-incremental` (avisos são erros) | — | `dotnet-restore` |
| `notepad-core` | testes do `PRKingNotepad.Core` | — | `notepad-build` |
| `notepad-ui` | testes de UI WPF | Windows, usuário interativo (não o sandbox do Codex) e sonda WPF aprovada (sessão interativa, sessão de usuário, foco de teclado, clipboard) | `notepad-build` |
| `semgrep-scan`, `semgrep-test`, `semgrep-mutacoes` | os três scripts `semgrep*` do `package.json` | daemon do Docker respondendo | — |

O build .NET do verificador grava em `%TEMP%\prking-verificar-notepad` (`--artifacts-path`), não em `bin/`: não trava nem sobrescreve um PRKing Notepad aberto. Os testes de UI usam o `ClipboardScope`, que restaura o conteúdo da área de transferência ao fim de cada teste.

### Estados e código de saída

| Estado | Quando |
|---|---|
| aprovado | o comando rodou e saiu com 0 |
| falhou | o comando rodou e saiu com outro código, ou o verificador deu erro ao executá-lo |
| não executado | requisito ausente detectado (ferramenta fora do PATH, SDK incompatível, daemon desligado, sessão sem interatividade) ou dependência que não foi aprovada. Sempre com o motivo |

| Código | Resultado |
|---|---|
| 0 | todos os componentes selecionados aprovados |
| 1 | algum falhou (vale mesmo se outros não rodaram) |
| 3 | nenhum falhou, mas algum não foi executado: verificação **incompleta**, nunca sucesso |
| 2 | uso inválido (componente desconhecido) |

"Não executado" exige um pré-requisito detectado, não o tipo do teste. Uma asserção que falha continua sendo falha, mesmo num teste de foco ou clipboard (plano de evolução, MEL-08).

### Dependências travadas

- **npm:** o componente `dependencias-npm` recusa dependência declarada sem entrada no lock, versão do `package.json` diferente da do lock e pacote instalado diferente do lock. No clone limpo e na CI, `npm ci` também falha com lock fora de sincronia.
- **.NET:** `dotnet restore --locked-mode` falha se o grafo de pacotes mudar sem atualizar o `packages.lock.json`.

## 4. Pendências do contrato

Aparecem também no fim de toda execução do verificador:

- **Lint de JavaScript:** implantado em `.claude/hooks/` e `scripts/` (Biome 2.5.15, 2026-11-02). Fora por enquanto: `reimplementacoes/puzzle-piloto/` e `.githooks/`; a expansão é gradual (story MEL-03). O verificador não repassa `BIOME_BINARY` ao Biome (auditoria).
- **Tipos:** não implantado. Avaliar `checkJs` com JSDoc nos módulos de política; até lá, nada se chama `typecheck`. `sintaxe-js` é só sintaxe.
- **Semgrep sem Docker:** sem alternativa; fica "não executado".
- **UI WPF fora da sessão interativa:** fica "não executado", com o item que faltou. A detecção é a plataforma, o usuário do sandbox do Codex e a sonda `tests/PRKingNotepad.UiProbe` (MEL-08, AC8), que mede o pré-requisito em vez de reconhecer o ambiente. Sonda aprovada e asserção falhando é falha.
