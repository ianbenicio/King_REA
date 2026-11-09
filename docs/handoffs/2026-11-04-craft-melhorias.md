# Handoff — CRAFT: melhorias do comparativo craft-anything (2026-11-04)

**Sessão:** `ece8c99e` (aberta em 2026-11-04 17:30, iniciada pela sessão `local_a61030e0`) · **Branch:** `claude/craft-melhorias-852ea7`, a partir de `main` @ `a431045` · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) (anterior arquivado em `docs/planos/2026-11-04-e3-0-preparo-mel05.md`) · **Fonte das ideias:** comparativo de 2026-11-04 (fora do repositório, em `side-session-notes/local_a61030e0…/craft-anything-comparativo.md`); o repositório externo é não confiável e só fornece ideias, reimplementadas em palavras e código nossos.

## 1. Decisões do responsável (2026-11-04, nesta unidade)

Respostas dadas por `AskUserQuestion`; a recomendação listada ao lado era a minha, e ele a seguiu em todas.

| Pergunta | Resposta | Efeito |
|---|---|---|
| Opção do comparativo (0, A, B, C) | **A** | só contrato na fatia 2 da MEL-05 (`efeitos` e `conteudo_do_alvo`), mais método de evidência (§4.5), "verificado / não verificado" (§4.8) e armadilhas de licença (§4.9) nos documentos. **Sem hook novo, sem ledger.** B e C ficam como ideias registradas (perguntas 3 e 7 do comparativo: não agora) |
| Vocabulário de `efeitos` (pergunta 2) | **nosso**, ~8 valores, em português | mapeado nas anotações MCP quando o REA as expuser |
| `LICENSE` ausente na raiz (achado lateral, pergunta 6) | **fica para depois** | pendência registrada; nenhum arquivo criado |
| Auditar o craft-anything como ferramenta (pergunta 4) | **o benchmark basta** | nenhuma unidade de auditoria |
| Taxonomia de 17 toolsets como `familia` da U5 (pergunta 5) | **registrar como ideia** | `familia` não é preenchida agora |
| O que mudou no REA depois da 6.4.0 (pergunta 8) | **fica para depois** | pendência |
| ADR §6 item 7 (auditoria do GhidraMCP) | **mover para `docs/seguranca/`** | o campo `auditoria` do contrato aponta para um arquivo de auditoria; a fatia 2 faz a mudança, só em docs |
| ADR §6 item 9 (estado inicial da matriz e Codex) | **aceitar como proposta** (ADR §2e) | provider Ghidra do REA "a confirmar", Codex "sem adaptador", sem prazo |
| P-7 (matriz só impressa ou também em documento) | **impressa e em documento** | o verificador imprime e o `guia-rea.md` ganha a tabela (aceite P4: "inventário e documentação") |
| Como seguir enquanto o PR #12 não entra | **esperar; fazer ADR e story** | nenhuma edição de mapa antes do merge do #12 |

Não perguntado nem decidido: o hook PostToolUse (opção B, fora). O PR #12 foi mesclado depois (`7d48dd1`, autorização do responsável, pela sessão E3-1); este worktree o incorporou pelo `sync_with_base_branch`.

### 1.1 Segunda rodada: perguntas do adendo ao ADR-0001 (2026-11-04)

O @architect escreveu o adendo e levantou 10 perguntas; o responsável respondeu por `AskUserQuestion`, de novo seguindo a recomendação em todas.

| Pergunta do adendo | Resposta | Efeito |
|---|---|---|
| Vocabulário de `efeitos` | **núcleo de 8**, sem `usa_rede` nem `pode_descartar_dados` | `so_leitura` (sozinho), `altera_sessao`, `escreve_em_disco`, `lanca_processo`, `executa_codigo_do_alvo`, `observa_execucao`, `usa_dispositivo`, `altera_dispositivo`; os dois candidatos viram ideia adiada |
| Obrigatoriedade de `atributos` | **O1: todas as 200 tools** | `atributos` deixa de ser opcional na fatia 2 |
| Coerência efeito→nível | **aceitas C3 a C7** | só verificação estática; o gate não muda |
| `efeitos` e `recurso` | **ficam os dois**, com coerência | |
| C9 e C10 | **aviso** | impressos, não reprovam |
| Matriz no guia | **o verificador confere** cada linha no `guia-rea.md` | fecha o aceite P4 |
| Auditoria do GhidraMCP | **`docs/seguranca/auditoria-ghidramcp-2.0.md`, commit só nele** | o runbook aponta para ele; o ponto 8 passa a conferir a auditoria |
| Documentação do método | **fatia 2b separada** | convenção "Verificado / Não verificado" fora do modelo de story (camada protegida do AIOX); armadilhas de licença só conferidas na fonte primária |
| Códigos estáveis de decisão do gate (§4.6) | **ideia registrada** | fora das fatias 4a e 4b |
| Aceite do adendo | **Aceito** | status mudado para Aceito por decisão dele |

### 1.2 Terceira rodada: perguntas do @po após a validação (2026-11-04)

Também todas pela recomendação do @po. Detalhe nas seções "Decisões do responsável após a validação @po" das duas stories.

| Pergunta | Resposta |
|---|---|
| Q1: fatia 2 em um ou dois PRs | **dois** (PR-A sem mapas; PR-B com mapas) |
| Q2: `recurso` e tabela C11 | **@architect propõe um adendo 2**; `recurso` e `contexto_execucao` obrigatórios por tool |
| Q3: matriz `a confirmar` | `nao-testado` com evidência "a confirmar"; Codex `sem-adaptador` por mapa |
| Q4: `catalogo.digest` | obrigatório só com origem `npm` |
| Q5: hashes abreviados no runbook e no guia | podem ficar como histórico |
| M1, M2 | definições aprovadas; dois eixos (origem e confiança) |
| M3, M4, F2b-AC9 | licença só em auditorias futuras; skills intocadas; **uma linha no `CLAUDE.md` aprovada** |
| Seguir implementando nesta sessão? | **não**: fechar aqui; implementar em sessão limpa (contexto passou de 180k) |
| P1 (editar os mapas) | **não dada ainda**; vem depois do adendo 2, por lote |

## 2. Entregas

| Entrega | Executor | Onde | Resultado |
|---|---|---|---|
| Fase 0 e plano | principal | `docs/plano-de-execucao.md` | 2 consultas ao Engram; 4 precedentes usados (relatada); plano anterior arquivado |
| Adendo 1 ao ADR-0001 | @architect | `docs/adr/ADR-0001-adendo-1-efeitos-e-conteudo-do-alvo.md` | **Aceito** pelo responsável: 8 valores de `efeitos`, `conteudo_do_alvo`, `atributos` obrigatório (200 tools), regras C1–C11, fatias 2 e 2b, ideias adiadas |
| Story fatia 2 | @sm, @po | `docs/stories/mel-05-fatia-2-contrato-e-atributos.story.md` | **Ready** (GO condicional, 9,5/10), estimativa G, 26 ACs, lotes L-1 a L-6, dois PRs |
| Story fatia 2b | @sm, @po | `docs/stories/mel-05-fatia-2b-documentacao-metodo.story.md` | **Ready** (GO condicional, 9,5/10), estimativa P, 14 ACs |
| Story-mãe | @po | `docs/stories/mel-05-contratos-integracoes.story.md` | AC17 substituído, AC18 (a) revogado, AC14 ampliado, fatia 2 atualizada |
| Estado geral | principal | `docs/handoffs/2026-11-02-estado-geral.md` | item 8 |

Commits na branch (todos com `[Story MEL-05]`): `eac3579` (plano, decisões, adendo), `72ab7d5` (merge do `origin/main` com o PR #12), `7c5171e` (adendo aceito), `7402ce2` (stories), mais um commit final (este handoff e o registro das decisões). **Nenhum código, hook, mapa, `.mcp.json`, `settings.json` ou `00-seguranca.md` foi alterado.**

## 3. Próximas unidades (nenhuma iniciada)

1. **Adendo 2 ao ADR-0001** (@architect): lista de valores de `recurso`, tabela de coerência C11, `contexto_execucao`. Bloqueia o PR-B.
2. **PR-A da fatia 2** (@dev, testes primeiro; @qa): auditoria do GhidraMCP em `docs/seguranca/auditoria-ghidramcp-2.0.md`, runbook, guia, ponto 8 do verificador e seus testes (o AC17 da fatia 1 é reescrito). Não edita mapas.
3. **Fatia 2b** (@dev; @qa): ACs 1 a 4 liberados (M1 e M2 aprovados); a conferência de licença só com fonte primária.
4. **PR-B da fatia 2**: só depois do adendo 2 aceito **e** da aprovação explícita do responsável para editar `rea-niveis.json` e `ghidra-niveis.json` (conferir antes `docs/planos/2026-11-01-perfis-alvo.md`, coordenação com a P-U5), com regressão completa dos gates e @qa.
5. Envio: branch, PR e merge só com autorização; push e PR pelo @devops.

## 4. Pendências e ressalvas

- **Push, PR e merge: feitos** (atualizado depois do fechamento). Push e PR pelo @devops com autorização do responsável; [PR #14](https://github.com/ianbenicio/King_REA/pull/14) mesclado em 2026-11-04 com o "confirmo" dele (merge commit `7313b03`), após resolver dois conflitos com o `main` (PR #12 e PR #13) e a CI (`resultado`) verde. O adendo 2 do item 1 da seção 3 foi aceito depois por outra sessão (PR #16).
- **`LICENSE` ausente na raiz** do repositório público; levantamento do REA depois da 6.4.0: ambos adiados pelo responsável.
- **Ideias adiadas** (adendo §7): hook de proveniência (opção B; não verificado se o Claude Code deixa um PostToolUse alterar a saída de tool MCP), ledger de obrigações (opção C), taxonomia de toolsets em `familia`, códigos estáveis de decisão do gate, `usa_rede` e `pode_descartar_dados`.
- Story-mãe: a P-7 e a linha P4 aparecem como abertas, mas a DA-8 já as decidiu; o AC15 continua desmarcado mesmo com o PR #12 mesclado. Fecha quem encerrar a mãe.
- Memória de subagentes em `.claude/agent-memory/` (fora do git, não adicionar).
- Em `.mcp.json`, `settings.json` e hooks nada mudou; o `npm test` não foi rodado (só documentação mudou).

## 5. Falhas e retrabalho

- A skill `fase-0` foi bloqueada uma vez pelo guarda de orçamento (tamanho desconhecido) e passou na segunda tentativa, como previsto.
- Conflito esperado no `docs/plano-de-execucao.md` ao incorporar o PR #12 (ambos reescreviam o arquivo): resolvido mantendo este plano e arquivando o da E3-1 em `docs/planos/2026-11-04-e3-1-integracoes.md`.
- O handoff da fatia 1 não existia no `main` no início (só na branch do PR #12); li por `git show`.
- O @po detectou nas stories do @sm uma ordem de commits que reprovaria a CI e outras correções (detalhe nas stories).

## 6. Métricas (`sessao.js`, sessão `ece8c99e`, 53 min)

| | Principal | Subagentes (4 execuções) |
|---|---|---|
| Chamadas | 38 | 53 |
| Escrita de cache | 210k | 757k |
| Leitura de cache | 7,4M | 5,7M |
| Saída | 40k | 147k |

Contexto por requisição (principal): inicial 97k, médio 201k, máximo 244k, 61% das requisições acima de 200k, sem compactação. **Passou do limite de ~180k**: a leitura do comparativo (~13k), da story (~29k) e do ADR somada aos relatórios dos subagentes pesou. Engram: 2 consultas, ~3k de resultados no contexto.

## 7. Fechamento

Conectores do claude.ai desligados no início; religados ao fim (memória `conectores-off-por-unidade`; 11 conectores).
