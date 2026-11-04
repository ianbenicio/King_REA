# Plano de execução — etapa 3 do plano de evolução: preparação (E3-0)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E3-0 do prompt de abertura da etapa 3
(docs/handoffs/2026-11-03-prompt-etapa3.md). O plano anterior (E2-5, ativação da CI) está em
docs/planos/2026-11-03-e2-5-ativacao-ci.md.
-->

**Data:** 2026-11-03 · **Sessão:** a desta conversa (abertura 13:51) · **Projeto:** PRKing_REA · **Branch/commit:** `docs/e3-0-preparo` a partir de `main` @ `3b082f3`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (13:51) e as duas anteriores do mesmo dia (13:00, 50 min; 12:10, 47 min), que são a E2-5 e a E2-3b, fechadas pelos handoffs já no `main` (PR #10). As demais são de 2026-11-01 e anteriores. `git status`: só `.claude/agent-memory/`, fora do git. Conferido no início: `git fetch`, `origin/main...main` = `0 0`, `npm test` 277/277, proteção do `main` igual ao handoff (check `resultado`, `enforce_admins` ligado, sem force push nem exclusão). Nada divergiu do handoff.

## 1. Enquadramento

**Objetivo:** preparar a etapa 3 (controle da investigação) sem mudar código nem hooks: ADR proposto dos contratos da MEL-05, story MEL-05 em fatias validada pelo @po, e a sequência proposta das unidades da etapa.

**Restrições:** nenhuma tool `rea` ou `ghidra`, nada em `alvos/` nem `saidas/`; não editar `status`, `niveis_aprovados` nem a seção 8 de nenhum `00-seguranca.md`, nem `rea-niveis.json`, `ghidra-niveis.json` ou o matcher do gate (a E3-0 só lê); não desativar nem contornar gate, `cli-gate`, monetização, publicação, `pre-commit` ou CI; `main` protegido (branch, conventional commits em inglês com `[Story MEL-05]`, sem `--no-verify`, nunca `--force`); push e PR só pelo @devops com autorização; merge só com "sim" do responsável; ADR fica "Proposto" (decisão do responsável); textos em português com acentuação.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26, .NET 10/WPF, Docker (Semgrep, gitleaks), GitHub Actions · integrações: servidores MCP `rea` (170 tools) e `ghidra` (30), gates de hook (`rea-gate.mjs`, `cli-gate.mjs`) · UI não (nesta unidade) · dados sensíveis: nenhum no checkout · fase AIOX: SDC, story nova MEL-05 · complexidade STANDARD (M no plano; ADR com decisões de contrato).

**Dúvidas:**

| Dúvida | Resolvida? | Resposta / quando resolver |
|---|---|---|
| Onde mora o inventário único (arquivo novo versus um dos mapas existentes) | aberta | ADR propõe; o responsável decide |
| Como acomodar a família de tool da P-U5 sem segundo mecanismo | aberta | ADR propõe campo opcional no contrato; aplicação no gate continua condicionada à U4 e à aprovação |
| Primeira fatia: só verificador de consistência entre arquivos existentes | resolvida | definido no prompt e no plano §6 |

## 2. Precedentes (Engram)

**Consultas** (`deep`, cross-projeto, `synthesize: false`):

| Texto da consulta | Resultados | Relevância (mín–máx) |
|---|---|---|
| contrato de integrações servidor MCP tool inventário único schema de protocolo gate níveis consistência | 7 | 0,493–0,520 |
| inventário de servidores MCP e matcher de hook divergem; schema estruturado de protocolo de segurança; verificador de consistência entre configurações | 6 | 0,505–0,520 |

(Consulta `vault_query_tool` simples por "REA gate rea-niveis ghidra-niveis MEL-05": 0 resultados.)

**Usados:**

| Nota (id) | O que diz | Força (D10) | Pré-condição vale aqui? | Efeito no plano |
|---|---|---|---|---|
| `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` | Mapa de nível por servidor + hook fail-closed; toda tool do catálogo precisa de nível | relatada (só o excerto lido) | sim: é o padrão que o gate atual implementa; o ADR parte do código real, não da nota | verificador deve apontar tool do catálogo sem nível, no sentido do padrão |
| `perfil-do-alvo-em-3-eixos-sugere-pacote-de-recursos-piloto-n` | Pacote de recursos por perfil; U5 propõe família de tool no `rea-niveis.json` | relatada | parcial: piloto só orienta, não muda gate | contrato da MEL-05 acomoda o campo da família como opcional, sem aplicar no gate |
| `padr-o-verificar-cobertura-existente-antes-de-adotar-feature` | Verificar o que já existe antes de construir | relatada | sim | o ADR e a story partem do levantamento dos arquivos existentes |

**Descartados:** `fezinha-*`, `despensa-*`, `classmate-*` (outro domínio) · `gotcha-mcp-json-aceita-caminho-relativo…` (já conhecido: `.mcp.json` usa caminho relativo) · `01HZ_HANDOFF_2026_05_25_VD`, `spec-v1-critique-qa-review-qa`, `mem-ria-engram-compartilhada…` (sem relação com contrato de integrações).

## 3. Plano preliminar

**Workflow AIOX:** SDC, fases 1 e 2 (criar e validar a story) com ADR do @architect antes de alterar contratos; nenhuma fase de implementação nesta unidade.

**Unidades de sessão (D9):**

| # | Unidade | Fase / executor | Entrega | Critério de aceitação preliminar | Limite de contexto |
|---|---|---|---|---|---|
| E3-0a | ADR dos contratos da MEL-05 | arquitetura / @architect | `docs/adr/` ADR "Proposto" (levantamento dos arquivos existentes, decisões, alternativas, consequências) | cobre os quatro pontos do prompt; só lê os arquivos de integração; cita arquivo e linha | ~180k total |
| E3-0b | Story MEL-05 em fatias | criar / @sm | `docs/stories/mel-05-contratos-integracoes.story.md` | fatias com ACs testáveis e "o que não faz"; fatia 1 = verificador de consistência (componente do verificador e job da CI) | idem |
| E3-0c | Validação da story | validar / @po | checklist de 10 pontos, GO/NO-GO, correções na story | veredito registrado; pendências nomeadas | idem |
| E3-0d | Sequência da etapa 3 e fechamento | @aiox-master (esta sessão) | handoff `docs/handoffs/2026-11-03-e3-0-*.md`, relatório de estado atualizado | sequência com tamanhos e decisões pendentes; `npm test` verde | idem |

**Capacidades por fase:** não consultei `mapa-fases.md` nem `capacidades.yaml`; as capacidades vêm do prompt de abertura. Ativas: Read, Grep, Glob, Edit, Write, PowerShell, subagentes `aiox-architect`, `aiox-sm`, `aiox-po`, Engram. Não carregar: tools `rea` e `ghidra`, conectores do claude.ai (desligados). Sob demanda: `aiox-qa` só se sobrar contexto (dívida D-1).

**Verificações:**

| Entrega | Como provar |
|---|---|
| Nenhum código nem hook mudou | `git diff --stat main...docs/e3-0-preparo` só com `docs/` |
| Testes e hooks intactos | `npm test` 277/277 ao fim |
| ADR ancorado no real | cada afirmação sobre arquivo existente cita caminho e linha; revisão por amostragem |
| Story validada | seção de validação do @po com checklist e veredito |
| Pre-commit | commits sem `--no-verify`, hook passa |

**Riscos:** (1) ADR inventar contrato que o código não suporta — origem: padrão de verificar cobertura — mitigação: levantamento primeiro, cada decisão com a evidência. (2) Story M grande demais para uma sessão — origem: relatório de estado (limite ~180k, custo fixo ~95k) — mitigação: fatias, e só a fatia 1 descrita com AC detalhado. (3) Colisão com a P-U5 no `rea-niveis.json` — origem: plano §3 — mitigação: ADR registra o campo da família como opcional e não altera o arquivo.

## 4. Custo da Fase 0

Medido ao fim do passo 3 (antes de escrever o ADR): ver o handoff `docs/handoffs/2026-11-03-e3-0-*.md`, que fecha o `sessao.js` da unidade inteira. Parcial na abertura: 5 chamadas, contexto ~118k–131k, 2 consultas `deep` e 1 simples ao Engram, resultados no contexto ~7 notas cada.

## 5. Aprovação

**Aprovado:** sim · **Por:** responsável, pelo prompt de abertura da etapa 3 (passo 5, unidade E3-0, itens a–d) · **Em:** 2026-11-03 · **Ajustes pedidos:** nenhum. Precedentes `aplicável`: nenhum marcado.
