# Handoff — E2-3: MEL-04, política de publicação compartilhada (2026-11-02)

**Sessão:** `c237632e` (aberta por `local_c49d87ce`) · **Branch:** `main`, de `ffd8886` a `0b56b7a` + correções do gate e este handoff · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) · **Story:** [MEL-04](../stories/mel-04-publicacao-compartilhada.story.md) (InProgress) · **Push:** não feito (só pelo @devops, com autorização)

## Entregas

| Commit | Entrega |
|---|---|
| `0b56b7a` | Plano da Fase 0 (E2-2 arquivado). Caracterização do `pre-commit` (13 casos, verdes contra o hook de `ffd8886` antes de mexer nele). Política extraída para `scripts/publicacao/publicacao.mjs`: decisão pura, entradas do índice (hook), de `base...head` (CI) e da árvore (verificador). Caminhos proibidos (`alvos/`, `saidas/`, `.rea/`, `ferramentas/`, inclusive com `git add -f` e por renome). 12 regras próprias de segredo; relatório só com caminho, linha e tipo. Exceções em `scripts/publicacao/excecoes.json` (vazio). Componente `publicacao` no verificador; `npm run check:publicacao`; `publicacao.mjs` na checagem de tipos |
| (este) | Correções do gate @qa (QA-E23-01 a 06: mudança de tipo, caminho proibido em qualquer nível e sem caixa, UTF-16, regra do Google, exceção de caminho proibido recusada, fixture por regra), contrato (§3, cobertura de segredos), story, handoff, relatório de estado |

Nenhuma tool `rea` ou `ghidra`, nada lido em `alvos/` ou `saidas/`, nada em `.github/`, nenhuma ferramenta nova instalada. Nenhum `status`, `niveis_aprovados` ou seção 8 de `00-seguranca.md` tocado. Os commits passaram pelo hook novo, sem `--no-verify`.

## Decisões

- **Responsável (sessão principal, 2026-11-02):** "Auditar o gitleaks" como detector externo; adoção só se a auditoria passar.
- **@dev:** a auditoria do gitleaks ficou para a próxima unidade. O contexto chegou a 198k depois da parte fechada (a tarefa autorizava entregar módulo e regras e deixar o gitleaks se passasse de ~150k).
- **@dev:** a política nova é mais estrita que a antiga em três pontos: caminhos proibidos, segredos em qualquer caminho e renome avaliado também pelo caminho antigo (inclusive no disparo da monetização). O resto é igual (mesmos testes antes e depois).
- **@dev:** binário detectado pelo conteúdo (byte NUL nos primeiros 8000 bytes, o critério do git sem `.gitattributes`), igual nas três entradas, em vez do `--numstat` do hook antigo.
- **@dev:** o componente `publicacao` local confere a árvore inteira do `HEAD` (282 arquivos, nenhum falso positivo); na CI, a entrada é o diff do PR. O job `publicacao` em `scripts/verificar/agregar-ci.mjs` fica para a E2-5.
- **@dev:** fixtures de segredo montadas por partes (`parte("gh", "p_", …)`); nenhum literal completo nos arquivos.

## Gate @qa

**CONCERNS** sobre `0b56b7a` (subagente @qa): AC1–AC6 atendidos, política igual ou mais estrita que a antiga, sem fail-open, relatório sem o valor; caracterização rodada de novo contra o hook de `ffd8886` (13/13). Sete achados, nenhum alto: QA-E23-01 (média, mudança de tipo fora do filtro, brecha que o hook antigo também tinha) e QA-E23-02 a 06 (baixas) corrigidos nesta unidade, com teste; QA-E23-07 (CI vê só o estado final do PR) aberto para a MEL-08. Tabela completa na story. Depois das correções: `npm test` 256/256, `publicacao` (287 arquivos), `lint`, `tipos` e `sintaxe-js` aprovados.

## Pendências

| # | Pendência | Dono | Quando |
|---|---|---|---|
| 1 | Auditoria do gitleaks: versão exata, checksum e assinatura da release, licença, rede e telemetria, como rodar sem rede; se aprovada, componente opcional ("não executado" quando ausente) e binário fora do git com hash | @dev | próxima unidade (E2-3b) |
| 2 | Job `publicacao` no agregador da CI e no workflow; QA-E23-07 (avaliar cada commit de `base..head` ou documentar o limite) | @devops, @dev | E2-5 |
| 3 | Push de `0b56b7a` e seguintes | @devops | com autorização do responsável |

## Falhas e retrabalho

- O primeiro caso de monetização da caracterização supunha que o catálogo ausente bloqueia sozinho; não bloqueia sem marcador ou perfil. O caso passou a usar um marcador `MON-0002` sem catálogo.
- Nos testes, `git mv` para pasta que não existe falha; os casos criam a pasta antes.
- `npm test` teve 1 falha numa rodada (255/256) que não se repetiu em três rodadas seguidas; o teste não foi identificado (saída não guardada). Se voltar, guardar a saída com `--test-reporter=tap`.
- Escape de barra invertida perdido ao editar pelo shell (heredoc e `sed` no Git Bash): duas expressões dos testes e uma do verificador. Corrigido com o editor; regra prática: expressão regular com `\` se edita com Edit, não com `sed`.

## Métricas (sessao.js)

| Chamadas (principal / subagentes) | Contexto inicial / médio / máximo | Requisições acima de 200k | Saída (principal / subagentes) |
|---|---|---|---|
| 71 / 11 | 96k / 178k / 230k | 30% | 64k / 20k |

O limite de ~150k da tarefa foi passado na parte fechada (198k ao fim do primeiro commit); o gate @qa em subagente evitou mais ~85k no contexto principal. O gitleaks numa unidade própria é o que cabe.

## Verificador no início

`npm run verificar` em `ffd8886`: 14/14 aprovados (Docker ligado; Semgrep executado), `npm test` 213/213.
