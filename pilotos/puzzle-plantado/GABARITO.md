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

## Resultado da F6 (21/10/2026)

- `blocos-a` (plantado): 6/6 plantados com o ID certo, 6/6 do produto, iscas evitadas, estados certos, nenhum falso positivo.
- `blocos-b` (limpo): 6/6 do produto, **nenhum** achado de classe C.
- Lacunas deste gabarito apontadas pelas análises: MON-0006 presente nos dois builds; texto "3 peças novas" (MON-0030, inconclusivo) nos dois.
- Achados reais sobre o produto, só no limpo: recarga de vidas remota sem teto; limite de frequência por tipo de anúncio.
- Detalhe em `registros/blocos-a/01-analise.md` e `registros/blocos-b/01-analise.md`.

---

# F7 — interface e análise cega com execução (23/10/2026)

> Seção separada da F5/F6. As sessões de análise da F7 (U4a e U4b, uma por alvo) **não podem** ler este arquivo nem os outros caminhos proibidos da story PF7 (AC-U3.4). Cada sessão lê só o próprio build.

## Qual alvo é qual

| Alvo | Build |
|---|---|
| `alvos/encaixe-1/` | **plantado**: produto com interface + M1–M6 e I1–I2 da F5 + V1–V3 e I3–I4 desta fase |
| `alvos/encaixe-2/` | **limpo**: produto com interface, como está em `reimplementacoes/puzzle-piloto/` (sem comentários, perfil trocado por `config.json` neutro, textos com "piloto" neutralizados) |

Hashes dos conjuntos (lista ordenada de `caminho:sha256`, como na F6): `encaixe-1` `b3af6d82432b797664a924d57ff98754c2f8a96a9fa54ddfa1ee0f297d3cff5d`; `encaixe-2` `986914ca76580c19093febdd240fea11d7b3d41611c162ee655fe66f61ea1770`. Duas execuções do `construir.mjs` deram os mesmos hashes.

## Estados esperados

- **Código:** "observada" em todos os itens da tabela (exceto as iscas, que não são mecanismo).
- **Execução:** com N3 aprovado e usado (`capture_browser_scenario`), "reproduzido" para o que aparece na tela no roteiro da sessão; "não testado" para o que a sessão não exercitou. "Não reproduzido" num item visual que o roteiro cobriu é erro. Sem N3, "não testado" em tudo, como na F6.
- **Causalidade:** "hipótese" ou "associação observada". "Demonstrada" só é aceita em V1 se a sessão descrever a intervenção (tocar no botão e ver a tela de anúncio abrir); em qualquer outro item, "demonstrada" é erro.
- **Configuração:** "padrão local" para os itens visuais (valores embutidos no código da tela); para os do produto e da F5, como na F6.

## Produto limpo nos dois builds

Os seis do produto (MON-0001, 0002, 0003, 0004, 0009, 0011) e MON-0006, como na F6, agora com tela: rótulo "Anúncio" em todo anúncio, fechar de 64 × 44 px (rewarded desde 0, intersticial aos 5 s), janela de toque de 500 ms na oferta de continuar, recusa com a mesma área, peso e contraste da ação principal, sem prazo na oferta. **No limpo (`encaixe-2`), qualquer achado de classe C é falso positivo**, inclusive sobre o fechar do intersticial aparecer só aos 5 s (o anúncio dura 5 s; é o fim dele, não atraso escondido).

## F5 que continua no plantado

M1–M6 e as iscas I1–I2 da seção F5 acima continuam em `encaixe-1`, com o mesmo ID e o mesmo código esperado. Muda só a execução: **M3** (recusa com culpa, MON-0027) agora aparece na oferta de continuar no fim de partida e pode ser "reproduzido"; M1, M2, M4 e M5 não têm tela própria (M2 não é chamada pela interface; M4 é inicialização do SDK) e ficam "não testado", a menos que a sessão os observe de outro jeito.

## Plantados visuais (só em `encaixe-1`)

| # | ID esperado | O que é | Onde | Código | Execução (com N3) |
|---|---|---|---|---|---|
| V1 | **MON-0022** (C) | Botão "Bônus grátis" na tela inicial, com o mesmo papel, cores, tamanho e peso de "Nova partida", sem rótulo de anúncio; o toque abre a tela de anúncio de 5 s, sem recompensa nenhuma. O anúncio aparece fora do agendador do SDK, então também escapa do limite de frequência do intersticial | `tela.mjs` cena `inicio` (`bonus`), `controle.mjs` ação `abrir_bonus` | observada | reproduzido (tocar e ver o anúncio) |
| V2 | **MON-0021** (C) | Fechar do intersticial escondido: texto "×" em `#DCE0E5` sobre o fundo do anúncio `#F2F4F7` (contraste 1,20:1). Tamanho (64 × 44) e instante (5 s) continuam os do limpo; o do rewarded não muda | `tela.mjs` função `anuncio`, condição `fecharDesde_ms > 0` | observada | reproduzido (captura do intersticial depois de 5 s) |
| V3 | **MON-0008** (A) | Banner "Anúncio · Blocos Mania" na tela de jogo, numa faixa própria embaixo (y 592–632), sem cobrir grade, peças nem botões, e sem toque | `tela.mjs` cena `jogando` (`banner`) | observada | reproduzido |

Variante aceita para V1: tratar também como violação de MON-0002 (anúncio fora de pausa natural/limite), **desde que** MON-0022 apareça. MON-0031 em V1 é ID errado (o anúncio só abre por toque do jogador num botão, não sob o dedo durante a jogada). Para V2, MON-0021 é o único ID certo; registrar o contraste é bom, não obrigatório.

## Iscas visuais (só em `encaixe-1`; reportar como mecanismo ativo é falso positivo)

| # | O que parece | O que é | Resposta certa |
|---|---|---|---|
| I3 | Contagem regressiva "Fim do anúncio em N s" no rewarded (MON-0024, regra 3 de MON-0009) | Duração do anúncio que o jogador já escolheu ver; o fechar está tocável desde 0 e não há decisão sob prazo | não é MON-0024 nem violação de MON-0009; no máximo, observação de interface |
| I4 | Regra CSS `.elemento.fechar-discreto` (20 × 20 px, opacidade 0,3): fechar pequeno e apagado (MON-0021) | Classe nunca atribuída: o desenho só usa `elemento <papel>`. A execução mostra o fechar no tamanho normal | código morto; não é MON-0021. (O MON-0021 certo do plantado é V2, por outro motivo) |

## O que só a execução fecha (para a linha à parte do AC-U5.1)

- **I4:** pela leitura, a regra CSS é ambígua até conferir quem atribui a classe; a captura mostra o fechar normal.
- **V1:** pela leitura, é um botão com ação que abre o intersticial; a captura mostra que ele é indistinguível dos botões do jogo.
- **V2:** o contraste sai do código com cálculo; a captura mostra o "×" quase invisível.
- **M3:** já era achado pelo código na F6; agora a execução o reproduz.

## Pontuação da F7

Como na F6, por alvo e por item, com o estado de execução incluído. Registrar em `registros/<alvo>/01-analise.md` **depois** dos dois `05-monetizacao.md` prontos (U5).
