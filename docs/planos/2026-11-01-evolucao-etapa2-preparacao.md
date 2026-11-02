# Plano de execução — etapa 2 do plano de evolução: preparação (MEL-03, MEL-08, linha de base)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Plano preliminar da preparação da etapa 2 do
plano de evolução docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md (§12, itens abertos).
O plano anterior (MEL-06a, concluída) está em docs/planos/2026-11-01-evolucao-etapa1-mel06a.md.
O piloto do perfil do alvo segue no plano docs/planos/2026-11-01-perfis-alvo.md (U4 pendente).
-->

**Data:** 2026-11-01 · **Sessão:** `b0f09ab6-c596-4c67-90db-4d7a659b416f`, aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed` · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `5ade645`

## 0. Sessão concorrente

`sessao.js --lista 6`: a sessão de 13:00 (473 min) é a que abriu esta; 19:51 e 19:24 são as da etapa 1 e do piloto, com handoff em `docs/handoffs/`; 20:37 (10 min) corresponde a uma das sessões ligadas do piloto. Todas as sessões ligadas (`corrigir-falhas-mel-01-a`, `mel-06a-hash-admissao`, `u1`, `u2`, `perfis-alvo-u3`) estão ociosas.

`git status` no início: limpo. Depois do arquivamento: `R docs/plano-de-execucao.md -> docs/planos/2026-11-01-evolucao-etapa1-mel06a.md` (esta sessão). As menções restantes a `docs/plano-de-execucao.md` são históricas e ficam como estão.

## 1. Enquadramento

**Objetivo:** fechar os três itens abertos da §12 do plano de evolução: contrato de ambiente e verificação local da MEL-03 (começando pelo `global.json`), desenho da CI MEL-08 sem ativá-la, linha de base medida e stories da etapa 2 com a capacidade revista.

**Restrições:**

- Nenhuma tool `rea`/`ghidra`; `alvos/` não é aberto (alvos bloqueados no gate até a MEL-06a-m, que é outra frente).
- Conectores do claude.ai não são tocados. Clipboard do responsável preservado; Notepad aberto por ele não é fechado.
- Sem configuração global da máquina, sem SDK ou runtime novo, sem atualizar o REA. Falta de ferramenta vira requisito ausente registrado.
- Nada ativo em `.github/`, nem segredo ou runner. Sem push.
- Sala limpa no Notepad: só código próprio e especificação; esta entrega não muda código do Notepad.
- Commits locais por entrega, conventional commits em inglês, `pre-commit` sem `--no-verify`.

**Perfil do projeto:** domínio laboratório de engenharia reversa (qualidade e ambiente dos controles e das reimplementações) · stack Node ESM 26 (`node --test`), .NET 10 / WPF, Docker (Semgrep fixado) · integrações nenhuma nova (REA 6.4.0 só lido) · UI WPF só nos testes · dados sensíveis nenhum · fase AIOX SDC (stories da etapa 2 em Draft; MEL-03 com primeira fatia implementada) · complexidade STANDARD

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Onde fica o `global.json`? | sim | Em `reimplementacoes/notepad/`, escopo pedido. O `dotnet` procura o `global.json` a partir do diretório de trabalho, não do projeto: o verificador e o `test:notepad` passam a rodar com `cwd` nessa pasta. Conferido com `dotnet --version` dentro e fora dela |
| Unity entra no contrato? | sim | Não se aplica neste repositório: o projeto Unity mora no PRKing_UO (exceção de 2026-10-28). O contrato só aponta a versão decidida na especificação, sem checagem |
| Docker | aberta | Daemon desligado no início (`docker version`: cliente 29.4.3, sem servidor). Semgrep fica "não executado" na linha de base, salvo se o responsável ligar o Docker Desktop |
| Lint e tipos | sim, em etapas | Ferramenta nova exige auditoria; fica como pendência visível na story MEL-03. O verificador só declara `sintaxe` (`node --check`) com esse nome |

## 2. Precedentes (Engram)

**Consultas:**

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| contrato de ambiente global.json SDK .NET rollForward versão de Node verificação local agregada que distingue aprovado falhou não executado requisito ausente CI GitHub Actions runner Windows testes WPF interativos | 7 | 0,514–0,524 |
| CI em repositório público logs públicos runner hospedado sem segredos testes de UI dependentes de foco e clipboard categoria não executável Docker indisponível baseline de testes | 7 | 0,509–0,517 |

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `testes-de-ui-wpf-falham-no-sandbox-elevado-do-codex-no-windo` (0,517) | Suíte WPF dá 72/76 no sandbox elevado do Codex e 76/76 como usuário interativo | relatada (story MEL-02, sem reprodução do mecanismo) | sim — mesmo projeto e suíte; conferido na story MEL-02 | O verificador detecta usuário do sandbox e não roda a UI ali (não executado, nunca aprovado); a CI separa a categoria |
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` (0,524) | Conferir o que já existe antes de construir | verificável (caso citado com grep e leitura) | sim — conferido: já existem `scripts/instalar-dotnet.ps1` (SDK 10.0.401 fixado por SHA-512), lockfiles .NET com `RestorePackagesWithLockFile`, `scripts/semgrep/rodar.mjs` com saída 2 sem Docker | O contrato reaproveita esses pontos; não cria instalador nem novo runner do Semgrep |

**Descartados:** `classmate-connect-13-*` — gates de outro projeto (lint/test/build) sem relação com .NET ou runner · `fezinha-*`, `despensa-*`, `spec-v1-critique-*` — outros projetos · `benchmark-de-monetiza-o-*` — análise de alvo.

## 3. Plano preliminar

**Workflow AIOX:** SDC. As três MEL da etapa 2 são M (ciclo completo); nesta rodada as stories ficam em Draft para validação @po, e a primeira fatia da MEL-03 (contrato e verificador) é implementada porque a §12 a pede.

**Unidades de sessão (D9):** uma só, com commits por entrega.

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| 0 | Fase 0 | — | este plano; plano MEL-06a arquivado | seções 1–5 preenchidas | ~180k |
| 1 | Contrato MEL-03 | SDC / @dev + @qa | `reimplementacoes/notepad/global.json`, `.node-version`, `engines`, verificador `scripts/verificar/` e teste, `docs/contrato-ambiente.md` | `npm run verificar` distingue aprovado, falhou e não executado; requisito ausente sai com código não zero; teste do verificador no `npm test` | ~180k |
| 2 | Desenho CI MEL-08 | @devops (desenho) | `docs/planos/2026-11-01-desenho-ci-mel08.md` | componentes, gatilhos, matriz, agregado; o que não roda em runner hospedado | — |
| 3 | Linha de base | @qa | `docs/planos/2026-11-01-evolucao-linha-de-base.md` | tempos, resultados e requisitos ausentes de cada verificação | — |
| 4 | Capacidade e stories | @sm (Draft) | `docs/stories/mel-03-*`, `mel-04-*`, `mel-08-*`; revisão de capacidade no plano de evolução | §12 marcada com evidência | — |
| 5 | Handoff | — | `docs/handoffs/2026-11-01-evolucao-etapa2-preparacao.md` | entregas, pendências, métricas | — |

**Capacidades por fase:**

| Fase | Ativo | Sob demanda | Não carregar | Como ligar o que falta |
|---|---|---|---|---|
| Implementar e medir | nativas (Read, Edit, Bash), `node --test`, `dotnet` | Engram (salvar padrão reaproveitável) | REA, Ghidra, browser, conectores, protocolos de alvo | nada |
| QA | `npm test`, verificador, `pre-commit` | `/code-review` | gstack `review` | nada |

**Verificações:**

| Entrega | Como provar |
|---|---|
| `global.json` | `dotnet --version` em `reimplementacoes/notepad/` = 10.0.401; `global.json` sintético com SDK inexistente, em pasta temporária, falha com mensagem do host |
| Verificador | Testes unitários (agregação, requisito ausente, lock divergente); execução real com Docker desligado mostra Semgrep "não executado" e código de saída não zero |
| Validação travada | Lock npm divergente do `package.json` (fixture) reprovado; `dotnet restore --locked-mode` em uso |
| Linha de base | Saída do verificador e tempos registrados no anexo |
| §12 | Três itens marcados com links para os artefatos |

**Riscos:**

- UI WPF roubar foco ou clipboard do responsável — story MEL-02 — `ClipboardScope` dos testes restaura o conteúdo; build com `--artifacts-path` se houver PRKing Notepad aberto; nenhum processo do responsável é fechado.
- Detecção de "não executável" frágil — plano de evolução §5 — nesta fatia só por pré-requisito detectável (plataforma, usuário do sandbox, daemon do Docker); a regra fina fica na MEL-08.
- Verificador virar segundo `npm test` — precedente `padr-o-verificar-*` — ele chama os comandos existentes, não duplica listas de testes.

## 4. Custo da Fase 0

Saída de `node ~/.claude/skills/skill-budget/scripts/sessao.js` ao fim do passo 3:

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| ~16 | ~95k | 2 (`vault_deep_query_tool`) | ~5k |

## 5. Aprovação

**Aprovado:** sim, pelo escopo da tarefa · **Por:** responsável, por meio da sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed` · **Em:** 2026-11-01 · **Ajustes pedidos:** nenhum. A tarefa fixa entregas, limites e critérios de pronto; esta sessão não pediu nova aprovação para não parar a etapa. O plano fica sujeito a revisão no handoff.
