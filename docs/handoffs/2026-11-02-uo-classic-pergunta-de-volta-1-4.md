# Handoff — uo-classic: perguntas de volta 1 a 4 do PRKing_UO

**Origem:** registro de perguntas em `PRKing_UO/docs/spec/README.md` (commit `0841454`), vindas da revisão técnica do PRKing_UO de 2026-11-02 (R01, R06, Q01–Q03)
**Data:** 2026-11-02
**Base:** `registros/uo-classic/especificacao.md` no commit `5d11c0d` (cópia entregue ao PRKing_UO com SHA-256 `7711e74f…f24183a`)
**Protocolo:** skill `protocolo-especificacao`, seção 6.2 (pergunta de volta) e 6.1 (adendo)

## Como responder

- Sessão própria do alvo `uo-classic`, como pede o `docs/spec/README.md` do PRKing_UO.
- As perguntas 2 e 3 cabem em pesquisa pública: vão para `docs/research/`, com tabela de referências (URL e data de acesso), como as fontes `[Mn]` e `[Wn]` da especificação. Não pedem nível novo no `00-seguranca.md` nem tools do REA ou do Ghidra.
- As perguntas 1 e 4 não pedem análise: a 1 é decisão do responsável (entra na seção 16 como decisão nova); a 4 é correção de redação de um DEVE marcado como inferência.
- Cada resposta entra na especificação como adendo datado no ponto afetado, com fonte, num commit próprio. Depois, reentregar a cópia ao PRKing_UO presa ao novo hash e marcar a pergunta como respondida na tabela do `docs/spec/README.md` de lá, sem apagar a linha.
- Sala limpa: na especificação entra só comportamento, em palavras próprias. Código do emulador lido como referência não é copiado nem parafraseado linha a linha.

## Perguntas

| # | Seção | Pergunta | Caminho | Decisão provisória do PRKing_UO | Recomendação desta sessão |
|---|---|---|---|---|---|
| 1 | §3.0 (regra 1), §15, D8 | A troca de origem ("próprio" ↔ "instalação") vale só para arte e IDs, ou também entre mundos de geometria diferente? Se vale para geometria, o que acontece com posições, regiões, spawns e containers que não existem no outro mapa? | Decisão do responsável (seção 16) | Save preso ao mundo em que foi criado; carregar com outra geometria é recusado com mensagem | Pela regra 2 da §3.0, mapa e arte vêm da mesma origem, e pela regra 4 o mapa próprio não copia o da instalação: trocar a origem é sempre trocar de mundo. Recomendação: o save guarda a identidade do mundo e a revisão da geometria e só carrega no mesmo mundo; a regra 1 garante que os IDs de itens, criaturas e sons continuam válidos, o que permite, como PODE e fora da primeira versão, levar personagem e inventário para outro mundo, colocando o personagem num ponto de chegada do mundo novo. Migração de posições, spawns e containers entre geometrias fica FORA. A frase "trocar a origem não quebra o save" ganha adendo dizendo isso |
| 2 | §5.4, §5.5 | No ganho com o total no cap, a atrofia de um skill em "desce" acontece antes da checagem `T + ganho ≤ c_T` (abrindo espaço) ou só depois? Como se escolhe o skill que desce? E se nenhum puder descer, ou se só parte do ganho couber? | Pesquisa pública (fonte do modelo `[M30]` e regras oficiais `[M3]` e `[M11]`) | Ponto parado: a 1.1b usa skills fixas; ganho entra na Fase 2 | — (a pesquisa responde) |
| 3 | §6.1, §13.1 | Qual é o alcance de contato do golpe corpo a corpo, distinto dos 15 tiles para iniciar o ataque? Quando ele é conferido: ao iniciar, a cada golpe ou no impacto? O que acontece com o timer do golpe quando o alvo sai do alcance? | Pesquisa pública (fontes `[M4]`, `[M5]`, `[M29]`, `[W60]`) | Contato a 1 tile nas oito direções, conferido no momento do golpe; fora do alcance o golpe espera e o timer continua; valor em dados | — (a pesquisa responde) |
| 4 | §15 | O DEVE "semente do sorteio" no save se cumpre guardando o estado atual do gerador? | Adendo "corrigido" na §15 | A arquitetura (§12) guarda o estado atual do gerador | Adendo: o save guarda o estado atual do gerador de sorteio (que permite continuar a sequência), não só a semente; o gerador das regras tem versão gravada no save. Mantém a marca de inferência de `[E39][E40]` |

## Restrições que continuam valendo

- Não editar `status` nem `niveis_aprovados` do `00-seguranca.md`.
- Envio ao GitHub só pelo @devops, com autorização do responsável.
- O PRKing_UO não lê `alvos/`, `saidas/`, evidência nem pesquisa deste repositório; recebe só a cópia da especificação.
