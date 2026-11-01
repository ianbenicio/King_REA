# Story MEL-01 — organizador de assets resistente a arquivos inválidos

**Status:** Done (QA no caminho curto, 2026-11-01)
**Workflow:** SDC, caminho curto para entrega P (plano de evolução §3 e §10) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Origem:** achado A05 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-01 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md)
**Complexidade:** SIMPLE · estimativa P

## Story

**Como** responsável por organizar os assets de um jogo-alvo,
**quero** que um arquivo truncado ou inconsistente fique registrado no catálogo com o motivo, sem interromper o lote,
**para** ter o inventário completo mesmo com falha parcial e saber exatamente quais arquivos pedem tratamento.

## Contexto

O parecer reproduziu: um arquivo de 12 bytes `RIFF0000WAVE`, em `--simular`, terminava com `ERR_OUT_OF_RANGE`, código 1 e nenhum catálogo. A causa estava em `identificar()`, que lia o codec no offset 20 sem conferir o tamanho do cabeçalho. Como nada no laço tratava exceções, qualquer erro de um item (leitura, identificação, hash) derrubava o lote antes da gravação do catálogo. Uma origem inexistente também saía com exceção, sem diferença clara de uma falha de item.

## Escopo

**Dentro:** `scripts/assets/organizar-assets.mjs`, `scripts/assets/organizar-assets.test.mjs` e o guia do organizador (`.claude/skills/protocolo-assets/SKILL.md`, §4).
**Fora:** concorrência e retomada de lote (MEL-12); validação estrutural de formatos além do WAV (PNG, DDS e BMP continuam com metadados opcionais: leitura curta dá `info` vazio, como antes).

## Critérios de aceitação

- [x] **AC1** — WAV truncado entra no catálogo com estado de erro, sem derrubar os demais arquivos válidos. Estado `invalido`, `erro` = `validação: cabeçalho RIFF/WAVE truncado: 12 bytes (mínimo 22)`; o item mantém tipo, formato, tamanho e SHA-256 e não é gravado no destino.
- [x] **AC2** — Lote com falha parcial salva JSON, CSV e resumo e devolve código de saída diferente de zero (1). O resumo lista o item na tabela "Conflitos, falhas e arquivos inválidos".
- [x] **AC3** — Arquivos válidos mantêm classificação, hash, deduplicação e proteção contra sobrescrita: os 5 testes anteriores seguem verdes sem mudança, e o teste do lote misto confere categoria, SHA-256 do destino, `duplicata_de`, duração do WAV válido e `reutilizado` na reexecução.
- [x] **AC4** — Mensagens, estados e regressão no guia do organizador e nos testes: tabela de estados `invalido` e `falhou`, etapas do campo `erro` e códigos de saída 0, 1 e 2 na §4 da skill `protocolo-assets`; 4 testes novos.

## Decisões

- **Estado novo `invalido`, separado de `falhou`.** `invalido` é conteúdo reconhecido, mas inconsistente: o arquivo precisa de tratamento na origem. `falhou` é erro de E/S (leitura, hash, gravação, pasta interna ilegível). Os campos do catálogo não mudaram; o campo `erro` passou a começar pela etapa (`listagem da pasta`, `leitura`, `identificação`, `hash`, `validação`, `gravação`).
- **Item inválido não é gravado nem entra na deduplicação.** O hash é calculado e registrado, para identificar o arquivo, mas o destino não recebe um asset quebrado.
- **Validação dos chunks do WAV:** chunk maior que o restante do arquivo, `fmt` com menos de 16 bytes, `data` antes de `fmt` e WAVE sem `fmt` ou `data` tornam o item `invalido`. Antes, o percurso lia o que houvesse e podia calcular duração de um `data` que não cabe no arquivo.
- **Código 2 para erro fatal de configuração:** origem inexistente, ilegível ou que não é pasta, e destino onde não dá para criar `_catalogo/` ou gravar o catálogo. Nesses casos não há catálogo, e a mensagem diz o motivo. Isso separa "lote com problema" (1, catálogo gravado) de "lote não rodou" (2).

## Tasks

- [x] Validar o tamanho do cabeçalho WAVE antes de ler o codec.
- [x] Validar limites dos chunks em `duracaoWav`.
- [x] Tratar erro por item no laço (try/catch com a etapa), e pasta interna ilegível como item `falhou`.
- [x] Checar origem e destino antes da varredura (código 2).
- [x] Incluir `invalido` no resumo e no código de saída; mensagem final aponta o que fazer em cada estado.
- [x] Regressões: WAV de 12 bytes em `--simular` (reprodução do parecer), lote misto copiando, chunk maior que o arquivo, origem inexistente.
- [x] Guia do organizador atualizado.

## File List

- `scripts/assets/organizar-assets.mjs` — validação de cabeçalho e chunks, erro por item, erros fatais com código 2, resumo.
- `scripts/assets/organizar-assets.test.mjs` — 4 testes novos (MEL-01).
- `.claude/skills/protocolo-assets/SKILL.md` — §4: estados, etapas do erro e códigos de saída.
- `docs/stories/mel-01-assets-resilientes.story.md` — esta story.

## QA Results

**Gate:** PASS (caminho curto: implementação e QA na mesma unidade, @dev + @qa).

| Verificação | Resultado |
|---|---|
| Regressões novas contra o código antigo (`git show HEAD:…` em pasta temporária) | 4 de 4 falham: as regressões detectam o defeito |
| `node --test scripts/assets/organizar-assets.test.mjs` | 9/9 |
| `npm test` | 168/168 (eram 164; +4 da MEL-01) |
| `node --check scripts/assets/organizar-assets.mjs` | sem erro |
| Testes anteriores do organizador | inalterados e verdes |

**Limitações:** a validação estrutural cobre o WAV, que era o caso reproduzido. Outros formatos com campos lidos em offset fixo (`metadados()` de PNG, DDS e BMP) já estavam protegidos por `try` e devolvem `info` vazio quando o arquivo é curto, sem marcar o item como `invalido`. Estender a validação a eles fica para quando houver um caso real.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-01; caminho curto P, sem validação @po separada (plano de evolução §3) | sessão `ed91c88e` |
| 2026-11-01 | Draft → InProgress: implementação iniciada | @dev |
| 2026-11-01 | InProgress → InReview: implementação e testes concluídos | @dev |
| 2026-11-01 | InReview → Done: gate PASS | @qa |
