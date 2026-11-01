# Handoff — perfil do alvo e pacote de recursos: U3 (integração no processo)

**Sessão:** `4510c1cd-91b2-4170-b301-67a06c2edd9f` (aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`) · **Executor:** @dev (SDC, YOLO)
**Data:** 2026-11-01 · **Plano:** `docs/plano-de-execucao.md`, unidade U3 · **Base:** `main` @ `b175d54`

## Entregas

| Entrega | Caminho | Estado |
|---|---|---|
| Seção "Perfil do alvo e recursos" | `registros/_modelos/00-seguranca.md`, §7 | pronto |
| Passo do perfil no protocolo | `.claude/skills/protocolo-seguranca/SKILL.md`: §2 (subseção "Perfil do alvo"), §6 (resumo e passo 4) e §7 (passo 4) | pronto |
| Tabela de cobertura dos 7 alvos | `docs/planos/2026-11-01-perfis-alvo-cobertura.md` | pronto |
| Este handoff | `docs/handoffs/2026-11-01-perfis-alvo-u3.md` | pronto |
| Linha no fluxo do `CLAUDE.md` | texto pronto abaixo | **pendente**, à espera do commit do bloco "Delegação de busca" pela outra sessão |

## Decisões

Detalhe e motivo na seção 1 da cobertura. Em resumo:

- **D1a, teste de controle:** o `list_browser_targets` recusado de propósito pelo gate não conta como uso. Fica fora do pacote e vai ao diário como "teste de controle".
- **D1b, recursos operacionais:** `aiox-devops` (push), `update-config`, `code-review`, `aiox-dev` (QA loop) e a demo no navegador ficam fora do perfil, da cobertura e do registro C8.
- **D2, benchmark na sessão da análise:** o pacote `benchmark` se soma à janela do benchmark, que começa com o `01-analise.md` concluído e o "sim" do responsável, em qualquer sessão. A C7 continua como preferência.
- **D3, `especificacao` e profundidade:** sobe um nível, até alta; a complexidade de triagem não muda. Grau `hip`, sustentado por 1 alvo (41 contra 12 chamadas com a mesma complexidade). Acrescenta só itens "sob demanda".
- **D4, formato:** seção 7 do `00-seguranca.md`, preenchida em dois momentos. Os eixos entram no fim da triagem, e o pacote depois da decisão, porque a C4 depende de `niveis_aprovados`. Em relação ao catálogo §6, ganhou os campos "Profundidade" e "Recalculado em" e as três listas do pacote.
- **D5, recurso não citado:** recurso que nenhum pacote cita conta como fora do pacote e soma com "não carregar" na fração.

O pacote só orienta. A skill diz explicitamente que ele não muda `status`, `niveis_aprovados`, a classe nem o gate, e que o responsável não precisa aprová-lo.

## Critério e verificação da U3

- [x] **Cobertura de 100%.** Nenhum recurso de análise usado cai em "não carregar" (cobertura §4.1). A única chamada que cairia é o teste de controle (D1a), justificado. O script da cobertura §6 dá `fora 0` e `inexistentes 0` nos 7 alvos. Protocolos, skills e servidores foram conferidos linha a linha (cobertura §3).
- [x] **Fração em "não carregar" registrada** (cobertura §4.2). Tools MCP: 73,0% (`nativo-pe` baixa ou média), 72,0% (`nativo-pe` alta), 94,0% (`js-estatico`). Protocolos do projeto: de 43% a 71%.
- [x] `npm test`: 164 pass, 0 fail.
- [x] `grep -nE "blocos-|encaixe-"` no modelo e na skill: vazio (rc=1). Os dois podem ser lidos por sessões cegas. A cobertura cita os pilotos e fica em `docs/planos/`.
- [x] O commit traz só os 4 arquivos desta unidade. `CLAUDE.md`, `docs/analises/`, o plano de evolução e o catálogo ficam intocados.

## Linha para o `CLAUDE.md` (aplicar depois)

No item 1 de "Fluxo de trabalho por alvo", depois de "…e ativa o alvo em `registros/ALVO_ATIVO`.", acrescentar:

> No fim da triagem, preenche também o perfil do alvo (seção 7 do `00-seguranca.md`): tipo, objetivo, complexidade e o pacote de recursos sugerido, pelo catálogo `docs/catalogo-perfis-alvo.md`. No piloto o pacote só orienta: não muda `status`, `niveis_aprovados` nem o gate. Recurso usado fora do pacote vai ao diário do `01-analise.md`.

Aplicar só depois que a outra sessão commitar o bloco "Delegação de busca". O commit deve trazer só essa linha (`docs: add target profile step to workflow`).

## Pendências para a sessão principal

- **Catálogo v0.2** (cobertura §5): reescrever a C7 (D2), criar a regra C10 (D3), pôr a D5 e as exceções D1 em §0.1 e apontar o §6 para o modelo. Não foi aplicado aqui para o commit ficar só com os arquivos da unidade. Até lá, a regra da profundidade vive na skill e no modelo, e o catálogo ainda diz "de preferência" na C7 sem a janela.
- **`docs/plano-de-execucao.md`:** não editado. A U3 pode ser marcada como feita, com a linha do `CLAUDE.md` pendente.
- **Registros dos 7 alvos:** não ganharam a seção 7. Os perfis estão na cobertura §2. O modelo vale para alvos novos, a começar pela U4.

## Para a U4

- Linha de base de retrabalho (cobertura §4.3): 2 invocações de `protocolo-benchmark` sem produto final e 1 chamada `ghidra` sem backend.
- Precisão do pacote (tools distintas usadas / tools no pacote): de 17% a 42%. Os pacotes nativos levam o Ghidra inteiro (30 tools, 5 usadas).
- A D3 é `hip`. Se o próximo alvo tiver `especificacao`, conferir se a profundidade de um nível acima ajudou ou só pesou.

## Falhas e retrabalho

- Primeira contagem das tools nas sessões dos encaixes, feita com `grep` simples, trouxe `inspect_web_page` e `observe_web_session`. Esses nomes aparecem no transcript fora de chamadas. A recontagem por id da chamada bateu com a U1.
- Na primeira versão do script, o `require` relativo resolvia a partir da pasta do script, e não do repositório. Ele passou a usar `process.cwd()`.

## Métricas (`sessao.js --sessao 4510c1cd-91b2-4170-b301-67a06c2edd9f`, antes do commit)

| Item | Principal | Subagentes |
|---|---|---|
| Chamadas | 20 | 0 |
| Contexto inicial / médio / máx. | 95k / 154k / 192k | — |
| Escrita de cache | 158k | 0 |
| Leitura de cache | 2,9M | 0 |
| Saída | 41k | 0 |

Engram: 0 chamadas. Nenhuma tool `rea` ou `ghidra` foi chamada, e `alvos/` não foi aberto. Transcripts lidos só localmente, para conferir os encaixes.

## Conectores

Não foram tocados nesta unidade, por instrução da sessão principal: o toggle é estado do app e o religar não chega às outras sessões.
