# Auditoria de segurança — Biome 2.5.15 (`@biomejs/biome`, npm)

**Data:** 2026-11-02 · **Método:** o da [auditoria do Semgrep](auditoria-semgrep-1.180.0.md) (versão, origem, integridade, procedência, comportamento, isolamento) com os passos do runbook "Auditoria estática de pacote npm antes de instalar" (Engram `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch`); nada foi executado antes da conferência · **Veredito:** uso aprovado como lint de desenvolvimento, só pelo verificador (`npm run lint` ou o componente `lint` de `npm run verificar`).

Uso no projeto: componente `lint` da [story MEL-03](../stories/mel-03-ambiente-verificacao.story.md) (AC4a), com escopo `.claude/hooks/` e `scripts/`. Decisão do responsável em 2026-11-02, na conversa da sessão principal: lint = Biome, aprovação para auditar e adotar se a auditoria não achar problema.

## Versão

- **2.5.15** (2026-09-30), e não a mais recente (`latest` = 2.6.4, de 2026-10-28). Mesma política do Semgrep: publicação com pelo menos duas semanas. Toda a linha 2.6 saiu a partir de 2026-10-21 (12 dias antes desta auditoria), então a escolhida é a última da 2.5.
- `devDependencies` com versão exata (`"2.5.15"`, sem `^`), instalada com `npm install --save-dev --save-exact --ignore-scripts`.

## Origem e integridade

| Item | Resultado |
|---|---|
| Pacote | `@biomejs/biome`, escopo da organização Biome; repositório `github.com/biomejs/biome` |
| Mantenedores no npm | 5 (`nhedger`, `dominionl`, `conaclos`, `ematipico`, `siketyan`); não é mantenedor único |
| Licença | `MIT OR Apache-2.0` (pacote principal e binários); compatível com o repositório |
| Integridade do pacote principal | `sha512-WZTW4slm/pdkh92K6t/3aEN++44JD1PQ7squ7RCMLI1flHGl43DVOIGXvCjHiZgBMO1V4uYxoFNtqrIA4qGuIQ==`: tarball baixado (`npm pack --ignore-scripts`), registro, atestação e `package-lock.json` iguais |
| Procedência (SLSA v1 + atestação de publicação do npm) | GitHub Actions hospedado, `biomejs/biome`, `.github/workflows/release.yml`, `refs/heads/main`, commit `0b4c11f553a7e702f9851af139662e1de45dc131`, run `36732826016` |
| Mesma procedência nos binários | `@biomejs/cli-win32-x64` e `@biomejs/cli-linux-x64` têm atestação do mesmo workflow, commit e run |

### Binários de plataforma

O pacote principal só tem um lançador em JavaScript (`bin/biome`); o executável vem de uma das oito `optionalDependencies` `@biomejs/cli-<plataforma>`, com `os`/`cpu`/`libc` declarados. O lock registra as oito; `npm ci` instala só a da máquina.

| Pacote | Integridade (npm, = atestação = lock) | SHA-256 do tarball | SHA-256 do executável |
|---|---|---|---|
| `@biomejs/cli-win32-x64@2.5.15` | `sha512-yAzh4UqEImV6Hcy0zjUqNfJAsUhoD64FBQCdTG8Md/Z2wQeVP/ZmJ3XRYAs1g8J9fjTFyl2fCtc5FB5til47+g==` | `91fe1e1e7a104c7758581bf6786154e9aaf84e3ec85da1878e2fc7a2c270443c` | `biome.exe` `f2beadee753b78fe76081158123538be886a31b5e67a34863e42535f3f491926` (igual ao instalado em `node_modules`) |
| `@biomejs/cli-linux-x64@2.5.15` | `sha512-xE4iEW/3LqlYj9GFgGrFsFSH51dEEpUbYWBfeOv0q87WkUDxK2o/HhreSb7qMJqck70RVM6Lg96hgedcAYcOkA==` | `b9e27bdcee185f545e3885cbd73dc72acdde39ef549beef37aacb837730d8a97` | `biome` `5d867a0b2ccea1755b7e508b01d836a8c64e31a1e4d11ec24b43b6b4eec8b3b6` (runner Ubuntu da MEL-08) |

As outras seis (darwin, arm64, musl) não foram baixadas; ficam no lock com a integridade do registro e só seriam instaladas em outra plataforma, onde valem as mesmas atestações (não conferidas aqui).

## Instalação e dependências

- **Scripts de ciclo de vida:** nenhum, nem no pacote principal nem nos de plataforma (`package.json` sem `scripts`). `hasInstallScript` no lock: 0 em todo o repositório depois da instalação. O `.npmrc` já liga `ignore-scripts`.
- **Dependências:** nenhuma de execução; só as oito opcionais de plataforma. A árvore cresceu 9 entradas no lock, todas `@biomejs/*` 2.5.15.
- **`npm audit`:** 6 alertas (2 altos, 4 moderados), todos anteriores e vindos do `rea-agents` (`zod`, `@electron/asar`, `glob`, `minimatch`, `fast-uri`); nenhum do Biome.

## Comportamento relevante

- **Lançador (`bin/biome`):** escolhe o executável pela plataforma e o executa com `spawnSync` (`shell: false`); no Linux roda `ldd --version` para detectar musl. Lê a variável **`BIOME_BINARY`**, que troca o executável por qualquer caminho: o verificador remove essa variável do ambiente antes de chamar o Biome.
- **Rede:** o executável importa `ws2_32.dll` (sockets; o Biome tem modo servidor/daemon para editores). O verificador não usa o daemon (`biome lint` direto, sem `--use-server`). As URLs no binário são links de documentação de regras e a lista de licenças SPDX; nenhuma importação de `winhttp`/`wininet` e nenhuma API de injeção (`WriteProcessMemory`, `CreateRemoteThread`, `VirtualAllocEx`).
- **Telemetria:** nenhuma palavra-chave de telemetria ou de verificação de atualização no binário; o Biome não declara telemetria. Não houve captura de rede durante a execução (limite abaixo).
- **Configuração:** `biome.json` na raiz, mínima e explícita: `vcs` desligado, formatador e assist desligados, linter com as regras recomendadas, `files.includes` restrito a `.mjs`/`.js` de `.claude/hooks/` e `scripts/`. O escopo passado na linha de comando fica em `ESCOPO_LINT` (`scripts/verificar/verificar.mjs`).

## Isolamento (como o projeto roda)

Diferente do Semgrep, o Biome roda direto na máquina, sem contêiner: é um executável nativo com acesso do usuário. A confiança vem da procedência conferida (build no CI público do projeto, commit identificado, hash igual do tarball ao lock), da ausência de scripts de instalação e do uso restrito: só `biome lint`, só sobre o escopo declarado, sem daemon, sem `BIOME_BINARY`.

## Limites

- Não foi feito build reprodutível a partir do commit `0b4c11f`; a ligação entre código-fonte e binário é a da atestação SLSA.
- Na auditoria, foram conferidos o conteúdo do envelope e os digests. Depois, com o TypeScript também instalado, `npm audit signatures` verificou as atestações instaladas: 34 pacotes com atestação válida (entre eles os do Biome), 147 com assinatura do registro e 0 inválidas ([auditoria do TypeScript](auditoria-typescript-6.0.3.md)).
- Sem captura de rede durante a execução.

## Atualizar

Decisão do responsável. Repetir esta auditoria para a versão nova (procedência do pacote principal e dos binários das plataformas usadas, scripts, dependências), instalar com `npm install --save-dev --save-exact --ignore-scripts @biomejs/biome@<versão>`, conferir a `integrity` do lock contra a auditada e rodar `npm test` e `npm run lint`. Nunca `@latest`.
