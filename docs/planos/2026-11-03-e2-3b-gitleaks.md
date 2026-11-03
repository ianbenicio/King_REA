# Plano de execução — etapa 2 do plano de evolução: MEL-04, auditoria do gitleaks (E2-3b)

<!--
Saída da Fase 0 (Harness D5, D30; skill fase-0). Unidade E2-3b do relatório de estado
docs/handoffs/2026-11-02-estado-geral.md. O plano anterior (E2-3, publicação compartilhada) está em
docs/planos/2026-11-02-e2-3-publicacao.md.
-->

**Data:** 2026-11-03 · **Sessão:** `70e9a223` (aberta pela sessão `local_c49d87ce`) · **Projeto:** PRKing_REA · **Branch/commit:** `main` @ `da07163`, igual ao `origin/main` (`0 0`)

## 0. Sessão concorrente

Nenhuma escrevendo. `sessao.js --lista 5`: esta (12:10) e as de 2026-11-02 (17:27, 17:48, 18:32) e 2026-11-01 13:00, todas da família `local_c49d87ce`, ociosas pelo app e com handoff (a última, `2026-11-02-e2-3-publicacao.md`). `git status`: só `.claude/agent-memory/`, fora do git. `npm test` no início: 256/256 (27 s).

## 1. Enquadramento

**Objetivo:** auditar o gitleaks e, se passar, ligá-lo como detector externo de segredos ao lado das 12 regras próprias, fechando a MEL-04.

**Restrições:** binário fora do git (`ferramentas/`), hash registrado e conferido antes de cada execução; nunca instalador global, `@latest`, `rea setup` ou `rea update`; nada em `.github/` (E2-5); nenhuma tool `rea` ou `ghidra`, nada lido em `alvos/` ou `saidas/`; não afrouxar o `pre-commit`; relatório sem o valor do segredo; push só pelo @devops com autorização na conversa desta sessão.

**Perfil do projeto:** domínio laboratório de engenharia reversa (repositório público) · stack Node 26 (scripts e hooks), C# + WPF (Notepad) · integrações REA (MCP local), Ghidra, Docker (Semgrep) · UI não se aplica a esta unidade · dados sensíveis: segredos que possam vazar para o repositório público · fase AIOX: implementação (story MEL-04 InProgress) · complexidade P.

**Dúvidas abertas:** nenhuma que mude o plano. A aprovação do responsável ("Auditar o gitleaks", 2026-11-02) cobre baixar a release para auditar; problema na auditoria para a unidade e vai ao responsável.

## 2. Precedentes (Engram)

Duas consultas `deep`, cross-projeto, `synthesize: false`, 5 resultados cada: (1) "auditoria de ferramenta externa de detecção de segredos gitleaks: binário de release fixado com checksum e assinatura cosign, rodar sem rede, pre-commit hook e CI, falsos positivos" — relevância 0,509–0,516; (2) "secret scanning detector de segredos em repositório público, auditoria de cadeia de suprimentos de ferramenta CLI baixada do GitHub releases, versão fixada" — 0,495–0,508.

**Nenhum precedente aplicável.** Descartados: `re-verificacao-de-assinatura-proprietaria` e `re-identificar-checksum-de-32-bits-desconhecido` (RE de alvo, não cadeia de suprimentos); `rea-6-4-0-store-de-evid-ncias…` (REA); `padr-o-verificar-cobertura-existente…` (benchmark de features); `FU-002`, `spec-v1-critique…`, `classmate-connect-13…`, `despensa-auditoria…`, `cortar-sweeper…`, `benchmark-de-monetiza-o…` (outros domínios); `prking-rea-projeto…` (contexto geral, já conhecido).

Precedentes internos do repositório (não Engram), usados como modelo: `docs/seguranca/auditoria-semgrep-1.180.0.md` (versão com semanas de uso, isolamento sem rede) e `docs/seguranca/auditoria-actions-ci.md` (critérios comuns, fontes datadas).

## 3. Plano preliminar

**Workflow AIOX:** Story Development Cycle, fase 3 (implementação) e fase 4 (QA gate) da MEL-04, já validada (@po GO). Motivo: story existente em InProgress; a unidade fecha a última task.

| Unidade | Entrega | Aceite preliminar | Limite |
|---|---|---|---|
| E2-3b (esta) | auditoria em `docs/seguranca/auditoria-gitleaks-<versão>.md`; se aprovada, componente no verificador, testes, decisão sobre o `pre-commit`; MEL-04 Done | DoD da MEL-04; `npm test` verde; `npm run verificar -- --so publicacao,gitleaks` aprovado | ~180k; pesquisa e download em subagente, QA em subagente |

**Capacidades por fase:** auditoria (subagente `general-purpose` com Bash e WebFetch: download para pasta vazia nova, conferência de checksum e assinatura, execução sem rede em contêiner); implementação (principal: Edit, Bash, Node); QA (subagente `aiox-qa`). Não carregar: REA, Ghidra, conectores do claude.ai (desligados), skills de design.

**Verificações:** SHA-256 do arquivo baixado igual ao `checksums.txt` da release e assinatura (cosign ou atestação) conferida; execução em contêiner `--network none`; varredura da árvore do `HEAD` sem falso positivo (ou com cada um tratado); segredo sintético montado em tempo de teste reprova e o relatório não traz o valor; hash do binário conferido antes de executar; binário ausente ou hash diferente dá "não executado" ou "falhou", nunca "aprovado"; tempo medido no `pre-commit`.

**Riscos:** release sem assinatura conferível (para e pergunta); varredura ler fora do repositório rastreado (usar só conteúdo de `git archive`/índice, nunca `alvos/`); relatório vazar o valor (usar `--redact` e só caminho, linha e regra); contexto acima do limite (delegar).

## 4. Custo da Fase 0

| Chamadas | Contexto atual | Chamadas Engram | Resultados Engram no contexto |
|---|---|---|---|
| 22 | ~145k (prefixo inicial 96k) | 2 (`deep`) | ~4k |

## 5. Aprovação

Aprovação prévia: o responsável decidiu "Auditar o gitleaks" na conversa da sessão principal (2026-11-02), repassado na tarefa desta sessão; adotar só se a auditoria passar sem problema. Sem ajustes pedidos.

## 6. Resultado

Executado em 2026-11-03: auditoria (`ecf81ce`), responsável escolheu "Adotar isolado", ligação (`1561e4d`, `afbd404`), gate @qa FAIL com QA-E23B-01 corrigido em `1996e67`. Detalhes no [handoff](handoffs/2026-11-03-e2-3b-gitleaks.md).
