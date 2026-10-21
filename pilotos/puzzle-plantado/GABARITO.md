---
titulo: Gabarito da análise cega — piloto do puzzle
data: 2026-10-21
catalogo_versao: 3
---

# Gabarito — NÃO LER NA SESSÃO DE ANÁLISE

> As sessões de análise da F6 (uma por alvo) **não podem** ler este arquivo, nada em `pilotos/`, `docs/plano-piloto-puzzle.md` nem `reimplementacoes/puzzle-piloto/`, nem o histórico do git desses caminhos. Cada sessão lê só o próprio build: a sessão de `blocos-a` não lê `blocos-b`, e vice-versa.

## Qual alvo é qual

| Alvo | Build |
|---|---|
| `alvos/blocos-a/` | **plantado** (produto + mecanismos M1–M5 + iscas I1–I2) |
| `alvos/blocos-b/` | **limpo** (produto do piloto como está em `reimplementacoes/puzzle-piloto/`) |

A ordem foi escolhida de propósito ao contrário da intuição ("b = modificado").

## Estados esperados

A análise é estática (N0 e N1). Sem execução, os estados aceitos são:
- **Execução:** "não testado" em todos os itens.
- **Causalidade:** "hipótese" ou "associação observada". "Demonstrada" é erro (não houve intervenção controlada).
- **Configuração:** "padrão local" para parâmetros embutidos; "remoto desconhecido" é aceito onde o código aceita configuração remota (MON-0002 e recarga de vidas).

## Mecanismos presentes nos dois builds (produto limpo)

| ID | Onde | Código | Observação |
|---|---|---|---|
| MON-0001 | troca das peças da rodada com anúncio, 1 por partida | observada | |
| MON-0002 | intersticial no fim de partida: carência 2, a cada 2 partidas, 60 s, máx. 5 | observada | remoto só aceito se menos agressivo |
| MON-0003 | compra que remove intersticiais, com confirmação e restauração | observada | |
| MON-0004 | dificuldade por ocupação e derrotas seguidas | observada | no limpo, só desempenho |
| MON-0009 | continuar após derrota com anúncio, 1 por partida | observada | no limpo cumpre as 3 regras |
| MON-0011 | vidas: 5, recarga 20 min, até 3 por anúncio por dia | observada | classe B |

**No limpo (`blocos-b`), qualquer achado de classe C é falso positivo.**

## Plantados (só em `blocos-a`)

| # | ID esperado | O que é | Onde | Código |
|---|---|---|---|---|
| M1 | **MON-0033** (C) | A dificuldade ganha uma entrada `pressao`: peças grandes com peso ×3 quando o próximo fim de partida vai exibir intersticial (e não houve compra de remover anúncios). A partida fica mais difícil justamente quando o anúncio está para sair. | `sessao.mjs` calcula `pressao` a partir de `agendador.partidasDesdeUltimo` e `config.partidas_entre_anuncios`; `jogo.mjs` e `dificuldade.mjs` repassam | observada |
| M2 | **MON-0024** (C) | Oferta "relâmpago" do pacote inicial: o prazo é sempre 15 min a partir de agora, recalculado a cada abertura (urgência falsa) | `loja.mjs` `ofertaRelampago`, `sessao.mjs` `ofertaDoDia` | observada |
| M3 | **MON-0027** (C) | Recusa com culpa na oferta de continuar: "Não, prefiro perder meu progresso". Viola também a regra 2 de MON-0009 | `recompensas.mjs` `ofertaContinuar` | observada |
| M4 | **MON-0032** (C) | SDK de anúncios inicializado sempre como personalizado, ignorando a decisão de consentimento (guardada numa variável que ninguém usa) | `sessao.mjs` `sdk.inicializar({ consentimento: true })` | observada |
| M5 | **MON-0012** (B) | Sequência de dias: dias seguidos dão até 3 trocas de bônus; faltar um dia zera a sequência | `sequencia.mjs`, `sessao.mjs` | observada |
| M6 | **MON-0036** (A) | Cosmético de preço fixo "Tema Noite", R$ 3,90 | `loja.mjs` `PRODUTOS.tema_noite` | observada |

Também aparece em `blocos-a` o produto "pacote_inicial" (R$ 4,90, 3 trocas), parte de M2. Venda direta de trocas de peças não tem ID próprio no catálogo; registrar como proposta (seção 5 do modelo) é aceito, ignorar também.

## Iscas (só em `blocos-a`; reportar como mecanismo ativo é falso positivo)

| # | O que parece | O que é | Resposta certa |
|---|---|---|---|
| I1 | `INTERVALO_ANUNCIO_ANTIGO_S = 5`: intersticial a cada 5 s | constante exportada e nunca usada; o intervalo efetivo continua 60 s | MON-0002 com 60 s; a constante, no máximo, como código morto |
| I2 | `contagemRegressiva`: temporizador na oferta de continuar | conta segundos **decorridos** desde o início da partida e não é chamada por ninguém | não é MON-0024 nem violação da regra 3 de MON-0009 |

## Pontuação da F6

Para cada alvo e cada item: encontrado com o ID certo / ID errado / não encontrado, e cada estado certo ou errado. Achado que não está no gabarito: falso positivo (avaliar se é erro do analista ou lacuna do gabarito). Registrar em `registros/blocos-a/01-analise.md` e `registros/blocos-b/01-analise.md` **depois** dos dois `05-monetizacao.md` prontos.
