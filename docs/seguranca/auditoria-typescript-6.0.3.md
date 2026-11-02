# Auditoria de segurança — TypeScript 6.0.3 (`typescript`, npm)

**Data:** 2026-11-02 · **Método:** o da [auditoria do Semgrep](auditoria-semgrep-1.180.0.md) com os passos do runbook "Auditoria estática de pacote npm antes de instalar" (Engram `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch`); nada foi executado antes da conferência · **Veredito:** uso aprovado como checagem de tipos de desenvolvimento, só pelo verificador (`npm run tipos` ou o componente `tipos` de `npm run verificar`).

Uso no projeto: componente `tipos` da [story MEL-03](../stories/mel-03-ambiente-verificacao.story.md) (AC4b), `tsc --noEmit` com `checkJs` nos módulos de política. Decisões do responsável em 2026-11-02, na conversa da sessão principal: tipos = TypeScript com `checkJs` e JSDoc só nos módulos de política; depois do achado abaixo sobre a 7.0.2, versão = **6.0.3**.

## Versão e por que não a 7.0.2

- `latest` no npm é a **7.0.2** (2026-07-08), o compilador reescrito em Go. O pacote `typescript@7.0.2` depende de 20 pacotes `@typescript/typescript-<plataforma>`, cada um com um executável nativo de cerca de 28 MB (`win32-x64`: 28.365.027 bytes descompactados). **Nenhum deles tem atestação de procedência no npm** (nem o principal, nem `win32-x64`, nem `linux-x64`). Binário nativo sem procedência conferível é condição de parada da tarefa; a pergunta foi levada ao responsável, que escolheu a 6.0.3.
- **6.0.3** (2026-04-16), última da linha 6: JavaScript puro, sem binário, legível e auditável. Passa a política de duas semanas de publicação com folga.
- `devDependencies` com versão exata (`"6.0.3"`), instalada com `npm install --save-dev --save-exact --ignore-scripts`.

## Origem e integridade

| Item | Resultado |
|---|---|
| Pacote | `typescript`, repositório `github.com/microsoft/TypeScript` |
| Mantenedores no npm | 6, contas da Microsoft (`microsoft1es`, `typescript-bot`, `typescript-deploys`) e da equipe do TypeScript |
| Licença | `Apache-2.0`; compatível com o repositório |
| Integridade | `sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==`: tarball baixado (`npm pack --ignore-scripts`), registro e `package-lock.json` iguais |
| SHA-256 do tarball | `33cd0ee1beaa8c9e9d15a9da836c62ddea4c34a42d7c2d349dbc80d94165d22a` |
| Atestação de procedência (SLSA) | **não existe** para esta versão (o TypeScript não publica com `--provenance`) |
| Assinatura do registro | existe (`keyid SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U`); `npm audit signatures` depois da instalação: 147 pacotes com assinatura do registro verificada, 0 inválidas, 0 ausentes; 34 com atestação verificada (entre eles os do Biome) |

**Limite:** sem atestação, não há ligação verificável entre o tarball e um build do CI do TypeScript. A assinatura do registro prova só que o npm serviu o que foi publicado pela conta. A confiança vem da origem (contas da Microsoft), da ausência de código nativo e de scripts e da leitura do código abaixo.

## Instalação e dependências

- **Scripts de ciclo de vida:** nenhum `preinstall`, `install`, `postinstall` ou `prepare`. Os `scripts` do `package.json` são de desenvolvimento do próprio TypeScript (`hereby`, `dprint`) e não rodam numa instalação do registro. `hasInstallScript` no lock: 0 em todo o repositório.
- **Dependências:** nenhuma (sem `dependencies`, `optionalDependencies` nem `peerDependencies`). A árvore cresceu 1 entrada.
- **Binários:** nenhum arquivo `.node`, `.exe`, `.dll`, `.so` ou `.wasm` no tarball.

## Leitura do código

Varredura do caminho do `tsc` (`bin/tsc` → `lib/tsc.js`, um shim que liga o cache de compilação do Node e carrega `lib/_tsc.js`, 6,2 MB):

- **Módulos carregados:** só `fs`, `path`, `os`, `crypto`, `perf_hooks` e `inspector` (este para `--generateCpuProfile`). Nenhum `http`, `https`, `net`, `child_process` nem `fetch`.
- **`eval` e `new Function`:** nenhum.
- **Blobs base64 longos:** nenhum. As 7 linhas acima de 2.000 caracteres são tabelas Unicode de identificadores e uma expressão longa do compilador, não código ofuscado.
- **URLs:** 23, todas em mensagens ou comentários (`github.com`, `aka.ms`, `developer.mozilla.org`).
- **Telemetria:** as 44 ocorrências estão em `lib/typescript.js` e são eventos do protocolo do `tsserver` para o editor (stdio), não envio pela rede. O `tsc` não as usa.
- **Fora do caminho do `tsc`:** `lib/_tsserver.js` usa `child_process`, `net` e `readline`, e `lib/_typingsInstaller.js` usa `child_process` para instalar `@types` com o npm. Os dois são do servidor de linguagem de editores; o verificador não os chama.

## Comportamento e escopo no projeto

- Configuração em `tsconfig.json`: `checkJs`, `noEmit`, `strict` (com `noImplicitAny: false`, porque o JSDoc fica só nos pontos de política), `types: []` e lista explícita de arquivos em `files`: `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `scripts/monetizacao/verificar-perfis.mjs`.
- **Sem `@types/node`:** seria dependência nova, fora da aprovação. As APIs do Node usadas vêm de `scripts/tipos/node-minimo.d.ts`, como `any`, com uma exceção: `process.exit` retorna `never`, o que deixa o `tsc` ver que `decide()` encerra o hook. O que se confere é o código próprio: chamadas, retornos, nulos e anotações JSDoc.
- Achados da primeira rodada: 12 (nulos não tratados que o fluxo já excluía, `catch` com `unknown`, `URL` sem declaração). Corrigidos com anotações JSDoc (`decide()` como `never` com decisão `"allow" | "deny" | "ask"`, tipo do padrão no catálogo de monetização, coerções `@type`) e uma reordenação de guarda sem efeito (`if (!atual) continue` antes do `match`). A única opção do `strict` desligada é `noImplicitAny`, e isso foi decisão de escopo: o JSDoc fica só nos pontos de política, não em todo parâmetro. Ligada, ela dá 57 erros (`rea-gate` 25, `verificar-perfis` 31, `cli-gate` 1; achado QA-E22-02), e esse número aparece na pendência impressa pelo verificador. Nenhuma opção foi desligada para esconder achado da primeira rodada. `npm test` verde, inclusive as regressões dos dois gates.

## Atualizar

Decisão do responsável. Repetir esta auditoria para a versão nova. Passar para a linha 7 exige resolver a falta de procedência dos binários nativos. Instalar com `npm install --save-dev --save-exact --ignore-scripts typescript@<versão>`, conferir a `integrity` do lock contra a auditada e rodar `npm test` e `npm run tipos`. Nunca `@latest`.
