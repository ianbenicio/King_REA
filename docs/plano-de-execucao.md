# Plano de execução — etapa 2 do plano de evolução: MEL-03 fatia 2, lint e tipos (E2-2)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-2 do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-4b, auditoria das actions) está em
docs/planos/2026-11-02-e2-4b-auditoria-actions.md.
-->

**Data:** 2026-11-02 · **Sessão:** `0da91073` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `a24971e`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (17:48), e as sessões das 17:27, 17:00 e 12:19, que são as ligadas da família (`local_c49d87ce` e filhas), todas ociosas pelo app; a E2-4b deixou handoff (`2026-11-02-e2-4b-auditoria-actions.md`). `git status`: só `.claude/agent-memory/`, fora do git. Estado real igual ao relatório: `npm test` 203/203.

## 1. Enquadramento

**Objetivo:** fechar o AC4a (lint) e o AC4b (tipos) da MEL-03 com Biome e TypeScript (`checkJs`), auditados, fixados e ligados como componentes `lint` e `tipos` do `npm run verificar`; AC6 (clone limpo real) se couber.

**Restrições:** decisão do responsável de 2026-11-02 (Biome; `tsc --noEmit` com `checkJs`, JSDoc só nos módulos de política); auditoria com problema → parar e perguntar; nenhuma tool `rea`/`ghidra`, nada em `alvos/`; hooks sem mudança de comportamento (só JSDoc e correções apontadas, testes dos gates verdes); nada ativo em `.github/`; nenhuma outra ferramenta nova; commits locais, push só pelo @devops com autorização.

**Perfil do projeto:** domínio laboratório de engenharia reversa e processo de qualidade · stack Node 26 ESM (scripts, hooks), C# .NET 10 · integrações registro npm (só leitura de metadados e tarballs) · UI não · dados sensíveis nenhum · fase AIOX implementação (story MEL-03 Ready → InProgress) · complexidade STANDARD.

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Qual ferramenta? | sim | Biome e TypeScript, decisão do responsável na conversa da sessão principal (2026-11-02) |
| Qual versão? | sim | Política da auditoria do Semgrep: última da linha maior atual com pelo menos duas semanas de publicação |
| Escopo dos tipos | sim | `checkJs` por lista explícita de arquivos (módulos de política), não o repositório inteiro |
| O que fazer com achados do lint retroativo | sim | Corrigir se forem poucos; senão, pendência com escopo. Não desligar regra para esconder achado |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| adotar linter Biome e TypeScript checkJs JSDoc em projeto Node ESM; auditoria de dependência npm, binário de plataforma, ignore-scripts, lint retroativo | 7 | 0,499–0,508 |
| pacote npm com binário nativo por plataforma em optionalDependencies, provenance sigstore, verificar integridade sem executar postinstall | 7 | 0,498–0,540 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `auditoria-est-tica-de-pacote-npm-antes-de-instalar-supply-ch` | Runbook: `npm view`, `npm pack --ignore-scripts`, provenance pela API de atestações, hash do tarball × atestação, scripts, varredura, binários nativos, árvore via lockfile de projeto-sonda, instalar com `--save-exact --ignore-scripts` e conferir `integrity` | verificável (aplicado ao `rea-agents@6.4.0`, auditoria no repositório) | sim — mesmo projeto, mesmo registro npm; conferido lendo a nota | Método da auditoria: os 10 passos viram as seções do documento, junto com as do Semgrep |

**Descartados:** `classmate-connect-13-*` — outro stack (Vitest/ESLint), sem método aplicável · `despensa-*`, `fezinha-*`, `uo-classic-*`, `re-verificacao-*`, `rea-6-4-0-store-*` — outro domínio · `padr-o-verificar-cobertura-existente-*` — genérico; já coberto pela leitura da story.

## 3. Plano preliminar

**Workflow AIOX:** SDC, fase 3 (@dev) e fase 4 (@qa) — story já validada (GO condicional, condição atendida pela decisão de ferramenta).

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 1 | Auditoria Biome e TypeScript | implementação / @dev | `docs/seguranca/auditoria-biome-<v>.md`, `auditoria-typescript-<v>.md` | versão, integridade, procedência, dependências, binários com hash, scripts, rede, licença, conclusão | ~150k total |
| 2 | Lint e tipos no verificador | implementação / @dev | `package.json`, lock, `biome.json`, `tsconfig.json`, `verificar.mjs`, testes | AC4a e AC4b; `npm test` verde | idem |
| 3 | Gate | QA / @qa | QA Results da story | gate registrado | idem |
| 4 | Clone limpo real (AC6) | implementação / @dev | evidência na story | só se couber; senão, próxima unidade | — |

**Capacidades por fase:** implementação — Bash, Read, Edit, `npm`, `node --test`; sob demanda — subagente @qa para o gate; não carregar — REA, Ghidra, navegador, conectores do claude.ai (desligados nesta unidade).

**Verificações:**

| Entrega | Como provar |
|---|---|
| Auditoria | `integrity` do lock igual ao `dist.integrity` auditado; hashes dos binários de plataforma registrados |
| AC4a | violação plantada em cópia temporária reprova; sem a ferramenta, "requisito ausente"; teste no `npm test` |
| AC4b | erro de tipo plantado em cópia temporária reprova; sem a ferramenta, "requisito ausente"; teste no `npm test` |
| Regressão | `npm test` verde; `npm run verificar -- --so lint,tipos,js` aprovado |

**Riscos:** binário nativo do Biome sem procedência conferível — runbook (`auditoria-est-tica-*`) — conferir provenance do pacote de plataforma e hash; se não houver, parar e perguntar · lint retroativo volumoso — story (Riscos) — corrigir o pouco, registrar o resto com escopo · contexto (~96k de prefixo) — relatório de estado §4 — entregar lint fechado antes de tipos, se apertar.

## 4. Custo da Fase 0

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 14 | 153k (máximo por requisição; prefixo inicial 96k) | 2 (`deep`) | ~3k |

## 5. Aprovação

Aprovação prévia: o escopo e as ferramentas foram decididos pelo responsável na conversa da sessão principal (2026-11-02) e repassados na tarefa desta sessão; a aprovação cobre auditar e adotar, com parada se a auditoria achar problema. Sem ajustes pedidos.
