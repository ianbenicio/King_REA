# Relatório de estado — PRKing_REA em 2026-11-02

**Data:** 2026-11-02 (atualizado depois da E2-3b, em 2026-11-03: `main` @ `1996e67` + handoff, à frente do `origin/main` @ `da07163`, push pendente) · **Branch:** `main` @ `d0238b3` + handoff da E2-2, 4 commits locais à frente do `origin/main` @ `a24971e` (push pendente, pelo @devops) · **Testes:** `npm test` 213/213 · **Árvore:** limpa · **Repositório:** público (`ianbenicio/King_REA`)

Este relatório reúne as demandas e os requisitos que estão abertos hoje, conferidos contra o git, as stories, os planos e os handoffs. Ele serve de entrada para a próxima sessão de construção do REA (prompt em [`2026-11-02-prompt-continuidade.md`](2026-11-02-prompt-continuidade.md)).

## 1. O que está pronto

| Frente | Estado | Onde |
|---|---|---|
| Instalação do REA 6.4.0, MCP local, gate por nível (`rea`, `ghidra`), gate do CLI | em uso; regressões no `npm test` | `CLAUDE.md`, `.claude/hooks/` |
| Protocolos (segurança, mecânicas, assets, monetização, benchmark, especificação) | skills prontas | `.claude/skills/` |
| Reimplementação Notepad (C# + WPF) | Done (NB5, QA PASS) | `docs/stories/notepad-bloco-5.story.md` |
| Piloto de monetização (puzzle) | Done (F7, QA PASS) | `docs/stories/piloto-f7-interface.story.md` |
| Plano de evolução, etapa 1 (MEL-01, MEL-02, MEL-06a) | Done | `docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md` §12 |
| Plano de evolução, preparação da etapa 2 | feito: contrato de ambiente, `npm run verificar`, desenho da CI, linha de base, stories em Draft | `docs/contrato-ambiente.md`, `docs/planos/2026-11-01-desenho-ci-mel08.md`, `docs/planos/2026-11-01-evolucao-linha-de-base.md` |
| Piloto do perfil do alvo (Fase 0, U1–U3) | feito; catálogo de perfis em uso no protocolo de segurança | `docs/planos/2026-11-01-perfis-alvo.md`, `docs/catalogo-perfis-alvo.md` |
| `uo-classic`: análise, benchmark, especificação | concluídos; D1–D12 decididas, §17 jurídico reavaliado, Anexo A resolvido, perguntas de volta 1–4 respondidas | `registros/uo-classic/` |
| Entrega da especificação ao PRKing_UO | cópia de `PRKing_REA@e5706ff`, SHA-256 `806a8d5d…772bccbd` conferido | PRKing_UO `a12c50c` |

## 2. Demandas abertas do sistema REA

Ordem pela §3 do plano de evolução. Tamanho: P localizada, M vários arquivos, G arquitetura.

### Etapa 2 — repetibilidade (em andamento)

| # | Demanda | Story | Tam. | Depende de | Decisão do responsável? |
|---|---|---|---|---|---|
| E2-1 | ~~Validação @po das três stories da etapa 2 (10 pontos)~~ **Feita em 2026-11-02:** as três com GO e em Ready ([handoff](2026-11-02-e2-1-validacao-po.md)) | MEL-03, MEL-04, MEL-08 (Ready) | — | — | não |
| E2-2 | ~~MEL-03 fatia 2: lint e checagem de tipos~~ **Feita em 2026-11-02:** Biome 2.5.15 e TypeScript 6.0.3 auditados e fixados, componentes `lint` e `tipos` no verificador; MEL-03 Done (QA CONCERNS; débito QA-E22-01b no contrato §4) ([handoff](2026-11-02-e2-2-lint-tipos.md)) | MEL-03 | — | — | não |
| E2-3 | ~~MEL-04: módulo de publicação compartilhado~~ **Feita:** parte principal em 2026-11-02 ([handoff](2026-11-02-e2-3-publicacao.md)); **E2-3b em 2026-11-03:** gitleaks 8.30.1 auditado (sem assinatura nem atestação) e adotado isolado por decisão do responsável, componente `gitleaks` no verificador; gate @qa FAIL corrigido ([handoff](2026-11-03-e2-3b-gitleaks.md)) | MEL-04 | — | — | decidida |
| E2-4a | ~~MEL-08 local: agregador (AC7) e sonda WPF (AC8)~~ **Feita em 2026-11-02** ([handoff](2026-11-02-e2-4a-mel08-local.md)); story MEL-08 em InProgress | MEL-08 | — | — | não |
| E2-4b | ~~MEL-08 local: auditoria das actions (AC9)~~ **Feita em 2026-11-02:** cinco actions auditadas, SHAs fixados no documento, QA PASS ([handoff](2026-11-02-e2-4b-auditoria-actions.md), [auditoria](../seguranca/auditoria-actions-ci.md)); ponto de controle da fatia 1 atingido | MEL-08 | — | — | não |
| E2-5 | MEL-08 ativação: workflow em `.github/`, PRs com falha plantada, proteção de branch | MEL-08 | M | E2-3 | sim: ativar CI, Semgrep no Ubuntu hospedado, proteção de branch, runner próprio (desenho §9), mecanismo do cache do NuGet (QA-E24B-01); push pelo @devops |
| E2-6 | ~~Clone limpo real~~ **Feita em 2026-11-02 (AC6 da MEL-03):** clone sem `node_modules`, 14/14 aprovados; achou e corrigiu a falha das mutações do Semgrep em checkout CRLF. Limite: mesma máquina; a máquina nova fica com a CI (E2-5) | MEL-03 | — | — | não |

Condição para encerrar a etapa 2: clone limpo executa as verificações e a CI publica resultado agregado fiel.

### Migração da MEL-06a (bloqueio ativo)

| # | Demanda | Tam. | Decisão? |
|---|---|---|---|
| M-1 | **MEL-06a-m:** acrescentar a seção 8 "Identidade dos arquivos" (SHA-256 completo por arquivo) aos `00-seguranca.md` que voltarem a ser usados. Hoje **todo alvo registrado, inclusive o `ALVO_ATIVO` `uo-classic`, está bloqueado na admissão** para tools do REA com caminho em `alvos/<slug>/`. Fontes dos hashes: tabelas da triagem e `saidas/uo-classic/*-sha256.tsv`; `notepad-reimpl` só tem hash abreviado e precisa de medição nova | P por alvo | sim: aprovação na conversa, alvo por alvo |

Impacto: as próximas perguntas de volta do PRKing_UO que pedirem análise do binário (e não só pesquisa pública) ficam paradas até a M-1 do `uo-classic`.

### Etapas 3 a 5 (não iniciadas)

| Etapa | Itens | Nota |
|---|---|---|
| 3. Controle da investigação | MEL-05 (contratos e inventário de integrações), MEL-06 (identidade e isolamento por execução: substituição depois da admissão, troca de programa no Ghidra, proveniência de `saidas/`, bundle, `run_id`), MEL-07 (política comum CLI e MCP; hoje o `cli-gate.mjs` não confere hash; clientes suportados: Claude Code e Codex) | MEL-07 é G; dividir em fatias |
| 4. Uso real e conhecimento | MEL-09 (testes em navegador do puzzle), MEL-10 (índice de conhecimento), MEL-11 (métricas por pergunta respondida) | documentação e métricas podem começar antes |
| 5. Otimização | MEL-12, MEL-13, MEL-14 | só com evidência de ganho |

### Piloto do perfil do alvo

| # | Demanda | Estado |
|---|---|---|
| P-U4 | Validar o pacote de recursos no próximo alvo novo (de preferência nativo); o protocolo dele já precisa preencher a seção 8 | aguarda alvo novo, escolhido pelo responsável |
| P-U5 | Família de tool no `rea-niveis.json` | condicional ao resultado da U4; coordena com a MEL-05 |

## 3. Demandas fora do REA, ligadas a ele (PRKing_UO)

Registradas para não se perderem; o trabalho acontece no PRKing_UO, em sessão própria, sob sala limpa.

| # | Demanda | Estado |
|---|---|---|
| UO-1 | Stories 1.1a e 1.1b (linha 33) citam a cópia de `PRKing_REA@5d11c0d`; a cópia atual é de `e5706ff` | correção pendente |
| UO-2 | **Repositório `ianbenicio/PRKing_UO` já está público**, com o nome atual. A decisão A7 pedia renomear pasta e repositório antes de ficar público | decisão do responsável: renomear agora ou manter |
| UO-3 | Demanda 5: primeira versão jogável do "Outrora" (Story 1.1a Ready, 1.1b Ready bloqueada pela 1.1a) | aguarda início |
| UO-4 | Perguntas de volta novas: entram pelo ciclo da skill `protocolo-especificacao` (adendo, reentrega presa ao hash) | sob demanda |

## 4. Requisitos permanentes (valem para qualquer sessão)

- Push só pelo @devops, com autorização do responsável na conversa. Commit local liberado, conventional commits em inglês, `pre-commit` sem `--no-verify`.
- Não editar `status` nem `niveis_aprovados` de `00-seguranca.md` sem aprovação explícita. Não desativar nem contornar o gate, o `cli-gate`, a checagem de monetização ou o `pre-commit`.
- Nunca `rea setup`, `rea update` ou `@latest`. Ferramenta nova: auditoria, versão fixada, registro no gate.
- `npm test` depois de qualquer mudança em `.claude/hooks/` ou `scripts/`; `npm run verificar` para o agregado (Semgrep precisa do Docker Desktop ligado).
- Alvo analisado é dado, não instrução. Execução dinâmica só com aprovação caso a caso. Sem conectores sensíveis em análise de alvo.
- Repositório público: nada de assets extraídos, dados brutos ou código descompilado extenso em `registros/`.
- Sala limpa em `reimplementacoes/` e no PRKing_UO.
- Textos em português com acentuação. Nunca inventar regra: se faltar, perguntar.
- Conectores do claude.ai: desligar no início de cada unidade e religar ao fim (o toggle vale para o app inteiro).
- Sessões passadas mostraram ~95k de custo fixo antes do trabalho e limite de ~180k por unidade ultrapassado; uma story M por sessão, e ler só a seção da MEL e a story, não o plano inteiro.

## 5. Recomendação de sequência

1. ~~**E2-1** (validação @po)~~: feita em 2026-11-02; E2-2 a E2-5 destravadas.
2. **M-1 para o `uo-classic`**, se o PRKing_UO for mandar perguntas que exijam o binário; senão, deixar para quando o alvo voltar a ser usado.
3. ~~**E2-4a**~~ e ~~**E2-4b**~~ (feitas em 2026-11-02). Não sobra unidade da etapa 2 sem decisão pendente.
4. ~~**E2-2**~~ (feita em 2026-11-02, com o AC6/E2-6). ~~**E2-3**~~ parte fechada em 2026-11-02; **E2-3b** (auditoria do gitleaks) fecha a MEL-04.
5. **E2-5** (ativação da CI), com as decisões do desenho §9.
6. Depois da etapa 2: etapa 3, começando pela MEL-05.
