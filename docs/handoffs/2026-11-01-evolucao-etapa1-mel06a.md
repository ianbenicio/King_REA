# Handoff — etapa 1 do plano de evolução: MEL-06a (hash na admissão)

**Data:** 2026-11-01 · **Sessão:** `07ad7cae-5466-461d-8974-110b0dd5b4b8`, aberta pela sessão `local_04e63149-3c4f-4a36-b81d-6fcde8a1728c` · **Branch:** `main`, sem push (o push só sai pelo @devops, com autorização) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) · **Story:** [`docs/stories/mel-06a-hash-admissao.story.md`](../stories/mel-06a-hash-admissao.story.md)

## Perfil do projeto

Domínio laboratório de engenharia reversa (controles próprios) · stack Node ESM (hook PreToolUse, `node --test`) · integrações REA 6.4.0 (schemas lidos, nenhuma tool chamada) · UI não · dados sensíveis nenhum (fixtures sintéticas) · fase AIOX SDC, caminho curto · complexidade SIMPLE.

## Entregas

| Entrega | Arquivos | Commit |
|---|---|---|
| Fase 0 e arquivamento do plano MEL-01/MEL-02 | `docs/plano-de-execucao.md` (novo), `docs/planos/2026-11-01-evolucao-etapa1-mel01-mel02.md` | `1c4c856` |
| MEL-06a: conferência do SHA-256 na admissão | `.claude/hooks/rea-gate.mjs` e teste; seção 8 do modelo `00-seguranca.md`; skill `protocolo-seguranca`; `CLAUDE.md`; nota no plano do piloto; aceites no plano de evolução; story | `e70c5cb` |
| Este handoff | `docs/handoffs/2026-11-01-evolucao-etapa1-mel06a.md` | commit seguinte |

Retorno à versão anterior: `git revert e70c5cb` (e `1c4c856`, se quiser desfazer o arquivamento), sem push. O revert devolve o gate ao estado do A03 (sem conferência de hash).

## Decisões

- **Fonte do hash:** seção 8 "Identidade dos arquivos" do `00-seguranca.md`, tabela `| \`caminho\` | \`SHA-256\` |`, caminho relativo a `alvos/<slug>/`, hash completo. Os formatos livres dos registros atuais (hash do conjunto, abreviado, várias tabelas, lista fora do git) não são lidos: seriam ambíguos.
- **Admissão:** todo argumento de caminho que aponta para `alvos/<slug>/`, em qualquer nível. Pelos schemas do REA 6.4.0, `inspect_artifact` e `extract_artifact` não recebem caminho; a entrada real é `open_binary.path` e os demais argumentos de caminho (lista na story). Diretório confere cada arquivo. Link, caminho inexistente e arquivo fora da tabela bloqueiam.
- **Sem recálculo em consulta:** tools sem caminho (documento aberto, Ghidra) e caminhos em `saidas/<slug>/` não calculam hash. Saída derivada e bundle não são comparados ao pai.
- **Mapas de níveis inalterados.** `rea-niveis.json` e `ghidra-niveis.json` não mudaram; nenhum `00-seguranca.md` real foi editado.

## Critérios e verificação

MEL-06a — 4/4 aceites.

- [x] Substituição bloqueada, original liberado (AC1); vários arquivos e diretório cobertos.
- [x] Sem hash, hash abreviado, seção vazia ou repetida, caminho com dois hashes e caminho que sai do alvo: negados com motivo que aponta o protocolo; registro da fixture byte a byte igual (AC2).
- [x] 5 regressões novas, 4 falham no hook antigo (`git show HEAD:…` em pasta temporária); `npm test` 173/173 (eram 168) (AC3).
- [x] Limitação no cabeçalho do hook, na story e no plano de evolução (AC4).

`pre-commit` passou nos commits, sem `--no-verify`.

## Atenção: efeito imediato nos alvos existentes

Nenhum `00-seguranca.md` atual tem a seção 8. A partir de `e70c5cb`, **todo alvo já registrado fica bloqueado na admissão**, inclusive o `ALVO_ATIVO` (`uo-classic`): qualquer tool do REA com caminho em `alvos/<slug>/` recebe `deny` com o motivo "sem hash registrado". Seguem como antes as tools sem caminho (consultas sobre documento aberto, Ghidra) e os caminhos em `saidas/<slug>/`. É o comportamento pedido (fail-closed, aceite 2).

## Pendências

- **MEL-06a-m (migração, não feita):** acrescentar a seção 8 a cada registro que voltar a ser usado, com os hashes da triagem (tabelas dos registros e `saidas/uo-classic/*-sha256.tsv`), alvo por alvo, com aprovação do responsável na conversa. `notepad-reimpl` tem só hash abreviado e precisa de medição nova conferida. Detalhes na story.
- **MEL-06:** substituição depois da admissão (o REA lê depois do hook), troca de programa no Ghidra, proveniência de `saidas/`, identidade de bundle, `run_id`.
- **MEL-07:** o CLI (`cli-gate.mjs`) pede confirmação, mas não confere hash.
- **Piloto do perfil do alvo:** U4 continua pendente. A mudança foi registrada no plano dele: o protocolo do próximo alvo precisa preencher a seção 8.
- **Etapa 1 encerrada** (MEL-01, MEL-02, MEL-06a). Próximo pela §12: contrato da MEL-03 (`global.json`), desenho da CI MEL-08 e baseline.

## Falhas e retrabalho

- Primeira tentativa de lista de schemas filtrou só por `type: string` e sugeriu que `inspect_artifact` não tinha caminho; o schema bruto confirmou (só `integrity_policy`). Script temporário rodou de dentro de `node_modules/rea-agents` para resolver o `zod` e foi apagado em seguida.
- Um `sed` sobre o teste não casou por causa do escape de crase; corrigido com Edit (caso "caminho com dois hashes" passou a usar `./app.exe`, independente de caixa).

## Precedentes e Engram

- Consultas (2, `vault_deep_query_tool`): ver §2 do plano. Usado: `gate-de-tools-mcp-por-n-vel-de-risco-com-hook-pretooluse-fai` (verificável).
- Salvo: `conferir-hash-do-alvo-na-admiss-o-em-gate-pretooluse-manifes` (pattern, `maturidade/draft`).

## Métricas (`sessao.js`, antes do commit do handoff)

| Chamadas | Escrita cache | Leitura cache | Saída | Contexto médio / máx. | > 200k | Engram |
|---|---|---|---|---|---|---|
| 42 | 185k | 6,8M | 44k | 166k / 219k | 21% | 3 (2 consultas, 1 gravação) |

## Conectores

Não foram tocados.
