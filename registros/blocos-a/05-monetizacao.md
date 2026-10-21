---
alvo: blocos-a
jogo: Blocos 8×8 (build de distribuição, monetização simulada)
versao_jogo: 1.0.0 (package.json)
sha256_alvo: c2e229fb36425a0d99401f9dc386970acd152810162955d49923266d7032ccca (conjunto, método do 00-seguranca.md; digest de diretório do REA 91ecb999109e948c28cca8100d3fb30a2b07dc3de804e9195533f5b5a1f4619c)
plataforma: node (JavaScript ESM sem interface; fora das opções do modelo)
data: 2026-10-21
catalogo_versao: 3
publico_provavel: geral
children_likely: true
verificacao_execucao: nenhuma
---

# Monetização e padrões — Blocos 8×8 (blocos-a)

<!-- Repositório público: só achados resumidos, parâmetros e trechos curtos. Capturas de tela, criativos de anúncio, respostas de rede e listas brutas ficam em saidas/blocos-a/monetizacao/ (fora do git). -->

## Resumo

Modelo **híbrido**: intersticial entre partidas, três usos de rewarded (trocar peças, continuar após derrota, ganhar vida) e loja com três produtos em reais (remover anúncios, pacote de trocas, tema visual). O único "SDK" é uma camada simulada local, sem rede. Por classe: **A** — MON-0001, MON-0002, MON-0003, MON-0004, MON-0006, MON-0036; **B** — MON-0011, MON-0012; **C** — MON-0033, MON-0032, MON-0024, MON-0027 (e MON-0009 desqualificado por causa do MON-0027). O achado que mais pesa é **MON-0033**: o sorteio de peças triplica o peso das peças grandes quando o contador de partidas sem intersticial chega ao limiar do anúncio, e a pressão some para quem comprou "remover anúncios". Todos os achados estão **observados no código** só por leitura estática; nenhum foi reproduzido (execução não aprovada) e a causalidade de todos é **hipótese**.

**Público provável e menores.** `publico_provavel: geral`, `children_likely: true`. Fundamento, só a partir do build: puzzle de encaixe 8×8 casual, sem conteúdo adulto, sem verificação de idade nem rótulo etário, textos simples em português, preços baixos em reais (R$ 3,90 a R$ 9,90) e gênero jogado por todas as idades. Nada no build afasta o acesso provável por menores (ECA Digital, art. 20), e na dúvida o catálogo manda tratar como `true`.

## 1. Modelo de receita

| Fonte | Presente | Evidência | Observação |
|---|---|---|---|
| Intersticial | sim | `src/monetizacao/agendador.mjs:3-12`; chamada em `src/sessao/sessao.mjs:48-54` | Só no fim da partida, com carência, intervalo e teto por sessão |
| Rewarded | sim | `sessao.mjs:96-140`; `src/monetizacao/recompensas.mjs:5-38` | Trocar peças (1 por partida), continuar após derrota (1 por partida), ganhar vida (3 por dia) |
| Banner | não observado | `src/monetizacao/sdk-simulado.mjs:22` só aceita `intersticial` e `rewarded` | — |
| Compras (consumíveis) | sim, declarado | `src/monetizacao/loja.mjs:3` (`pacote_inicial`, 3 trocas, R$ 4,90) | Nenhum código credita as trocas compradas (ver seção 5, P-1) |
| Compras (remover anúncios, passe, assinatura, desbloqueio, expansões) | sim: remover anúncios e cosmético | `loja.mjs:4-5`, `loja.mjs:15-19` | Remover anúncios (R$ 9,90, restaurável); tema visual (R$ 3,90). Sem passe, assinatura ou expansão |
| Caixas pagas / gacha | não observado | nenhum sorteio após compra em `loja.mjs` | — |

## 2. SDKs de anúncio, mediação, analytics e configuração remota

<!-- Presença de SDK é indício técnico, não prova de execução nem de coleta. -->

| SDK | Função | Versão | Como detectado | Evidência |
|---|---|---|---|---|
| `sdk-simulado.mjs` (camada própria, não é SDK de terceiro) | Inicializa com flag de personalização e "exibe" intersticial e rewarded segundo um roteiro local (`completo`, `fechado`, `indisponivel`, `duplicado`) | — | Leitura do código (N1); `analyze_javascript_application` | `src/monetizacao/sdk-simulado.mjs:3-33`; REA `ev_132e332a…21f7` |
| Configuração remota (gancho) | `resolverConfig(remoto)` aceita objeto ou JSON e só deixa valores **mais restritivos** que o padrão local | — | Leitura do código | `src/monetizacao/config.mjs:23-62`. Nenhuma fonte remota no build: o REA não achou requisições (fetch, WebSocket, http) e `main.mjs` não passa `remoto` |
| Analytics | não observado | — | — | Só um registro de eventos em memória (`sessao.mjs:26-27`), sem envio |

## 3. Parâmetros de monetização

<!-- Uma chave como ad_cooldown prova que o parâmetro existe, não o valor aplicado. -->

| Parâmetro | Valor local (padrão) | Valor efetivo observado | Estado da configuração | Onde | Evidência |
|---|---|---|---|---|---|
| Partidas entre intersticiais | 2 (remoto só pode subir) | — | padrão local; remoto desconhecido | `config.json` → `config.mjs:24` | leitura |
| Intervalo mínimo entre intersticiais | 60 s (remoto só pode subir) | — | padrão local; remoto desconhecido | `config.mjs:25` | leitura |
| Teto de intersticiais por sessão | 5 (remoto só pode baixar) | — | padrão local; remoto desconhecido | `config.mjs:26` | leitura |
| Carência inicial | 2 partidas (remoto só pode subir) | — | padrão local; remoto desconhecido | `config.mjs:27` | leitura |
| Constante "intervalo antigo" | 5 s, exportada e não usada | — | padrão local (código morto) | `config.mjs:19` | leitura; `unk_8ddc2dac…` |
| Trocas com anúncio por partida | 1 | — | padrão local | `config.json`; `recompensas.mjs:5-7` | leitura |
| Continuações com anúncio por partida | 1 | — | padrão local | `recompensas.mjs:9-10` | leitura |
| Vidas máximas / recarga | 5 vidas / 1 a cada 20 min (remoto só pode alongar a recarga) | — | padrão local; remoto desconhecido | `vidas.mjs`; `config.mjs:28` | leitura |
| Vidas por anúncio por dia | 3 | — | padrão local | `vidas.mjs:39-42` | leitura |
| Pressão sobre peças grandes | ×3 no peso das peças de 5 e 9 células | — | padrão local (fixo no código, não declarado em `config.json`) | `src/nucleo/dificuldade.mjs:8` | leitura; `ev_1d893835…` |
| Gatilho da pressão | partidas desde o último intersticial + 1 ≥ partidas entre intersticiais | — | segue o valor de "partidas entre intersticiais" (padrão local 2) | `sessao.mjs:80` | leitura; `ev_7508ed32…` |
| Prazo da oferta relâmpago | 15 min a partir da chamada | — | padrão local | `loja.mjs:21-23` | leitura |
| Bônus da sequência diária | até 3 trocas (dias seguidos − 1) | — | padrão local | `sequencia.mjs:8-13` | leitura |
| Preços | R$ 4,90 · R$ 3,90 · R$ 9,90 | — | padrão local | `loja.mjs:3-5` | leitura |

## 4. Achados

### Estados de um achado

Cada achado tem quatro estados independentes. Nenhum implica o outro.

| Estado | Valores | O que prova |
|---|---|---|
| **Código** | observada · não observada · inconclusiva | O mecanismo existe no binário ou nos dados |
| **Execução** | reproduzido · não reproduzido · não testado | O comportamento aparece com o jogo rodando, nas condições registradas |
| **Causalidade** (sobre anúncio ou compra) | demonstrada no teste descrito · associação observada · hipótese | O mecanismo **causa** o efeito; só "demonstrada" com intervenção controlada sobre a variável |
| **Configuração** | padrão local · valor efetivo observado · remoto desconhecido | De onde vem o valor que vale |

Não observar não prova ausência. Correlação entre derrota e anúncio é "associação observada", não "demonstrada".

### Tabela

| Achado | ID do catálogo | Variante | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|
| A-01 | MON-0033 (C) | Peças grandes ×3 quando o intersticial está "devido"; sem pressão para quem comprou remover anúncios | observada | não testado | hipótese | padrão local (gatilho remoto desconhecido) |
| A-02 | MON-0032 (C) | Consentimento recusado ignorado: SDK sempre em modo personalizado | observada | não testado | hipótese | padrão local |
| A-03 | MON-0024 (C) | "Oferta relâmpago" cujo prazo de 15 min recomeça a cada chamada | observada | não testado | hipótese | padrão local |
| A-04 | MON-0027 (C) | Recusa de continuar: "Não, prefiro perder meu progresso" | observada | não testado | hipótese | padrão local |
| A-05 | MON-0009 (desqualificado) | Continuar com anúncio: regras 1 e 3 cumpridas, regra 2 quebrada pelo texto do A-04 | observada | não testado | hipótese | padrão local |
| A-06 | MON-0001 (A) | Três rewarded opcionais com entrega única | observada | não testado | hipótese | padrão local |
| A-07 | MON-0030 (C) | Promessa "3 peças novas" × troca só das posições não usadas (1 a 3) | inconclusiva | não testado | hipótese | padrão local |
| A-08 | MON-0002 (A) | Intersticial no fim da partida com carência, intervalo e teto | observada | não testado | hipótese | padrão local; remoto desconhecido |
| A-09 | MON-0003 (A) | Remover anúncios, restaurável, rewarded continua | observada | não testado | hipótese | padrão local |
| A-10 | MON-0004 (A) | Ajuste do sorteio por ocupação e derrotas seguidas | observada | não testado | hipótese | padrão local |
| A-11 | MON-0006 (A) | Loja com preço em reais e sem moeda virtual | observada | não testado | hipótese | padrão local |
| A-12 | MON-0036 (A) | Tema visual de preço fixo | observada | não testado | hipótese | padrão local |
| A-13 | MON-0011 (B) | 5 vidas, recarga de 20 min, +1 vida por anúncio (3 por dia) | observada | não testado | hipótese | padrão local; remoto desconhecido |
| A-14 | MON-0012 (B) | Sequência diária que zera ao faltar um dia | observada | não testado | hipótese | padrão local |

Ambiente comum a todos os achados: host Windows 10, leitura estática dos 16 arquivos de `alvos/blocos-a/app/` (Read e REA `analyze_javascript_application`, `trace_javascript_semantics`, nível N1), sem executar nada do alvo, sem rede, sem conta, sem progresso. Data: 2026-10-21. Alvo: conjunto `c2e229fb…ccca`, hashes por arquivo conferidos com o `00-seguranca.md`. Não há `03-mecanicas.md`; as regras de sorteio estão descritas aqui em notação própria.

### A-01 — MON-0033 Dificuldade ou sorte ligada a monetização

- **Pergunta:** o sorteio de peças lê algum estado de anúncio ou de compra?
- **Variante:** sim. Ao iniciar a partida, a sessão calcula uma flag de pressão a partir do agendador de intersticiais e da carteira de compras, e o núcleo usa essa flag no peso das peças grandes durante toda a partida (sorteio inicial, cada nova rodada e a troca por rewarded). Em notação própria:
  - pressão = 1 ⇔ (não comprou remover anúncios) ∧ (partidas desde o último intersticial + 1 ≥ N), com N = partidas entre intersticiais (padrão 2);
  - peso(p) = base(p) × f(tamanho(p)); f(pequena) = 10, 15 com ocupação ≥ 0,5, 20 com ocupação ≥ 0,7; f(média) = 10; f(grande) = (5 com 2+ derrotas seguidas, senão 10) × (3 se pressão).
  - Efeito na fatia de peças grandes (5 e 9 células), calculado das tabelas: tabuleiro vazio 10 % → 25 %; ocupação ≥ 0,5 7,7 % → 20 %; ocupação ≥ 0,7 6,3 % → 16,7 %; com 2+ derrotas seguidas 5,3 % → 14,3 %.
  - O gatilho ignora carência, intervalo mínimo, teto da sessão e falha de exibição: quando o intersticial é barrado por qualquer desses motivos, o contador não zera e a pressão continua partida após partida. Depois do teto de 5 intersticiais, toda partida fica sob pressão.
  - Quem compra MON-0003 (remover anúncios) sai da pressão: o sorteio depende do histórico de compra.
  - `config.json` declara as entradas da dificuldade como só "ocupação" e "derrotas seguidas"; a pressão não está declarada.
- **Alvo:** 1.0.0; `sessao.mjs` (`a72a73fb…`), `dificuldade.mjs` (`ab727908…`), `jogo.mjs` (`fc763065…`).
- **Ambiente:** ver acima.
- **Data e método de coleta:** 2026-10-21, estático (Read; REA N1).
- **Evidência:** `src/sessao/sessao.mjs:80-81` (cálculo e passagem da pressão); `src/nucleo/dificuldade.mjs:3-10` (fator); `src/nucleo/jogo.mjs:73,118,166` (uso em todos os sorteios); `config.json` (entradas declaradas). REA: `ev_132e332a…21f7` (grafo da aplicação), `ev_7508ed32…25fe` (leitura de `partidasDesdeUltimo` em `sessao.mjs:80`), `ev_1d893835…46ff` (leituras de `pressao` em `jogo.mjs:118` e `:166`). Lacuna `unk_aef9f6d6…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local (o gatilho acompanha o valor de N, que um remoto poderia subir; remoto desconhecido).
- **Ligação com mecânicas:** sem `03-mecanicas.md`. Interage com A-10 (mesma função) e com A-05/A-06 (a partida sob pressão termina antes de uma oferta de continuar e antes do intersticial).
- **Limitações:** a leitura mostra a dependência, não o efeito. Não foi medido se peças grandes mais frequentes encurtam a partida, aumentam derrotas ou ofertas de continuar. Previsão do oráculo para o roteiro de `main.mjs` (3 partidas, 2 min entre elas, sem compra), **não verificada**: pressão 0, 1, 1; intersticial só ao fim da 3ª partida.
- **Próximos testes:** com N3 aprovado em adendo, rodar o núcleo com a mesma semente e o mesmo jogador simulado, mudando só a pressão (0 × 1), e comparar sequência de peças, duração e derrotas; repetir com a compra de remover anúncios. Isso pode levar a causalidade a "demonstrada no teste descrito".

### A-02 — MON-0032 Rastreamento para anúncio sem consentimento

- **Pergunta:** o SDK inicializa antes da decisão de consentimento e respeita a recusa?
- **Variante:** a sessão recebe `consentimento`, guarda em uma variável que nunca é lida e inicializa o SDK com `consentimento: true` fixo, antes de qualquer outra ação. Todo anúncio exibido fica marcado como personalizado. O roteiro de `main.mjs` passa `consentimento: false`, ou seja, o caso de recusa cai justamente nesse desvio. O SDK simulado em si exige que o consentimento seja decidido (rejeita valor não booleano), mas recebe o valor errado.
- **Alvo:** `sessao.mjs` (`a72a73fb…`), `sdk-simulado.mjs` (`a919f37e…`), `main.mjs` (`9ea48130…`).
- **Ambiente / Data e método:** ver acima.
- **Evidência:** `src/sessao/sessao.mjs:15-16`; `src/monetizacao/sdk-simulado.mjs:14-19,26`; `main.mjs:7`. Lacuna `unk_eebdcc5b…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** o SDK é simulado e não lê identificador nem envia dados; o achado prova o desvio de consentimento, não coleta. Num SDK real, o que seria lido e enviado continua desconhecido.
- **Próximos testes:** com N3, rodar uma sessão com `consentimento: false` e conferir `registro` do SDK (`personalizado`).

### A-03 — MON-0024 Urgência ou escassez falsa

- **Pergunta:** o prazo da oferta é fixo ou recomeça?
- **Variante:** `ofertaRelampago(agora)` devolve "Oferta relâmpago! Termina em 15 minutos" com término = momento da chamada + 15 min. A sessão expõe `ofertaDoDia()`, que chama a função com o relógio atual a cada vez: o prazo recomeça sempre que a oferta é pedida, e nada impede reaparecer no mesmo dia. Item ofertado: `pacote_inicial`, o mesmo cuja entrega não foi achada (P-1).
- **Evidência:** `src/monetizacao/loja.mjs:21-23`; `src/sessao/sessao.mjs:153-157`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** sem interface, não se sabe quando e como a oferta aparece (`main.mjs` não a chama). Lacuna `unk_13d9c78e…`.
- **Próximos testes:** com N3, chamar `ofertaDoDia()` duas vezes com relógios diferentes e comparar `termina_em`.

### A-04 — MON-0027 Recusa com culpa

- **Pergunta:** os textos de recusa constrangem?
- **Variante:** na oferta de continuar, o aceite é "Continuar (assistir a um anúncio)" e a recusa é "Não, prefiro perder meu progresso". A oferta declara `destaque: "igual"`, e `config.json` declara `destaque_recusa: "igual"`; o destaque visual pode ser igual, mas o texto da recusa é de culpa.
- **Evidência:** `src/monetizacao/recompensas.mjs:12-15`; `config.json` (bloco `continuar`).
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** sem interface; tamanho e posição dos botões desconhecidos (`unk_13d9c78e…`).
- **Próximos testes:** inspecionar a interface, se existir.

### A-05 — MON-0009 Continuar com anúncio (não qualifica como A)

- **Pergunta:** a tela de continuar cumpre as três regras de MON-0009?
- **Variante:** regra 1 (uma vez por partida) cumprida: o limite é 1 e o contador só sobe quando a recompensa é entregue; se o anúncio falha, a partida termina sem nova oferta. Regra 3 (sem pressão de tempo) cumprida no fluxo: `prazo_s: null`, sem temporizador. Regra 2 (recusa sem culpa) **quebrada** pelo A-04. Pelo catálogo, o padrão deixa de ser A e o desvio é registrado como MON-0027. A função `contagemRegressiva` existe em `recompensas.mjs:22-24` (apesar do nome, devolve segundos decorridos desde o início da partida), mas não é importada pela sessão.
- **Evidência:** `recompensas.mjs:9-24`; `sessao.mjs:58-63,111-129`; `jogo.mjs:143-161` (recompensa: esvazia as 2 linhas e as 2 colunas mais cheias, como anunciado). Lacuna `unk_8ddc2dac…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** se uma camada fora do build usar `contagemRegressiva` na tela, a regra 3 também cairia (MON-0024).
- **Próximos testes:** análise do cliente com interface, se existir.

### A-06 — MON-0001 Anúncio com recompensa opcional

- **Pergunta:** os rewarded são opcionais, informados antes e entregues como prometido?
- **Variante:** três usos, todos acionados por método explícito do jogador: trocar as peças não usadas (1 por partida), continuar após derrota (1 por partida) e ganhar 1 vida (até 3 por dia, só com vidas abaixo do máximo). `entregaUnica` garante entrega uma só vez, inclusive no resultado "duplicado" do SDK; resultado "fechado" ou "indisponível" não entrega. Recusar não bloqueia o jogo, salvo o texto do A-04.
- **Evidência:** `sessao.mjs:96-140`; `recompensas.mjs:26-38`; `sdk-simulado.mjs:27-30`; `vidas.mjs:39-48`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** a troca usa o mesmo sorteio com pressão (A-01): numa partida sob pressão, a recompensa tende a trazer mais peças grandes.
- **Próximos testes:** com N3, exercitar os quatro resultados do roteiro do SDK.

### A-07 — MON-0030 Recompensa não entregue (inconclusivo)

- **Pergunta:** a recompensa da troca é a anunciada?
- **Variante:** a constante `OFERTA_TROCA` anuncia "3 peças novas no lugar das não usadas"; `trocarRodada` sorteia só as posições ainda não usadas (1 a 3 peças). Lido como "3 peças novas", entrega menos que o prometido quando o jogador já usou peças da rodada; lido como "peças novas no lugar das não usadas", está correto. A constante não é importada pela sessão.
- **Evidência:** `recompensas.mjs:3`; `jogo.mjs:163-175`. Lacuna `unk_8ddc2dac…`.
- **Estados:** código inconclusiva · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** depende do texto exibido de fato, que o build não mostra.
- **Próximos testes:** ver o texto na interface, se existir.

### A-08 — MON-0002 Intersticial em pausa natural com limite de frequência

- **Pergunta:** quando o intersticial dispara e o que o limita?
- **Variante:** só no encerramento da partida (inclusive após recusar continuar). Bloqueado por compra de remover anúncios, carência de 2 partidas, menos de 2 partidas desde o último, teto de 5 por sessão e intervalo de 60 s. O gancho remoto só aceita valores mais restritivos. Constante `INTERVALO_ANUNCIO_ANTIGO_S = 5` exportada e sem uso.
- **Evidência:** `agendador.mjs:3-16`; `sessao.mjs:47-54`; `config.mjs:19-29`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local; remoto desconhecido (`unk_26164a66…`).
- **Limitações:** a pausa natural é respeitada, mas a partida que a antecede é a que sofre a pressão do A-01.
- **Próximos testes:** com N3, rodar sessões e medir intervalos (método do oráculo).

### A-09 — MON-0003 Compra para remover anúncios

- **Pergunta:** a compra remove os anúncios forçados com escopo claro e restauração?
- **Variante:** produto `remover_anuncios`, R$ 9,90, descrição informa que os rewarded continuam; não consumível ("já comprado"); `restaurar` reconstrói a carteira a partir da plataforma; desliga o intersticial. Efeito colateral: desliga também a pressão do A-01.
- **Evidência:** `loja.mjs:1-19`; `agendador.mjs:6`; `sessao.mjs:80`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** sem loja de plataforma real; o fluxo de cobrança é simulado.
- **Próximos testes:** com N3, comprar e conferir intersticial e pressão.

### A-10 — MON-0004 Dificuldade dinâmica para manter o fluxo

- **Pergunta:** que entradas de desempenho ajustam o sorteio?
- **Variante:** ocupação do tabuleiro aumenta o peso das peças pequenas (×1,5 a partir de 50 %, ×2 a partir de 70 %); 2 ou mais "derrotas" seguidas cortam o peso das grandes pela metade. "Derrota" é terminar com menos pontos que a partida anterior. Essa parte é A; na mesma função entra a pressão do A-01, que é C.
- **Evidência:** `dificuldade.mjs:3-17`; `sessao.mjs:33-37`; `config.json` (fatores declarados batem com o código).
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** os fatores declarados em `config.json` não são lidos pelo código (estão fixos em `dificuldade.mjs`).

### A-11 — MON-0006 Loja transparente

- **Pergunta:** a loja mostra preço em moeda real e evita moeda virtual?
- **Variante:** os três produtos têm preço em reais; não há moeda virtual nem pacotes de moeda.
- **Evidência:** `loja.mjs:2-6`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** a entrega do `pacote_inicial` não foi achada (P-1).

### A-12 — MON-0036 Cosméticos de preço fixo

- **Pergunta:** o tema afeta o jogo?
- **Variante:** `tema_noite`, R$ 3,90, "só visual". Nenhum código do núcleo ou da sessão lê o tema.
- **Evidência:** `loja.mjs:4`; ausência de leitura em `src/nucleo/` e `src/sessao/`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** sem interface, o efeito visual não pode ser conferido.

### A-13 — MON-0011 Energia ou vidas com recarga por tempo

- **Pergunta:** iniciar partida consome recurso que se recarrega com tempo ou anúncio?
- **Variante:** cada partida consome 1 vida (máximo 5); recarga de 1 vida a cada 20 min; +1 vida por rewarded, até 3 por dia e só abaixo do máximo. Não há compra de vidas. O remoto só pode alongar a recarga.
- **Evidência:** `vidas.mjs:6-48`; `sessao.mjs:72-77,131-140`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local; remoto desconhecido.
- **Limitações:** a recarga por anúncio também é pular espera (sinal de MON-0013), aqui contida no MON-0011.

### A-14 — MON-0012 Jogar com hora marcada

- **Pergunta:** há sequência diária e ela pune a ausência?
- **Variante:** conta dias seguidos com partida; faltar um dia volta a sequência para 1. Bônus = min(dias − 1, 3) trocas. Pela regra do catálogo é MON-0012 (sequência que zera), não MON-0005. O bônus não tem consumidor no build (P-1).
- **Evidência:** `sequencia.mjs:4-13`; `sessao.mjs:22,78,159-161`. Lacuna `unk_674eb6ac…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** sem notificações; o efeito prático depende da entrega do bônus.

### Verificado e não observado

MON-0005, MON-0007, MON-0008, MON-0010 (o prazo da oferta não é real; ver A-03), MON-0013 (fora do contido em A-13), MON-0014, MON-0015, MON-0016, MON-0017 (o remoto só aceita 5 chaves de ritmo, sem segmento), MON-0018, MON-0019, MON-0020, MON-0021, MON-0022, MON-0023, MON-0025 (`comprar` exige `confirmado === true`, `loja.mjs:10`), MON-0026, MON-0028, MON-0029, MON-0031 (intersticial só no encerramento), MON-0034, MON-0035. Não observar não prova ausência; os de interface (MON-0021, MON-0022) estão fora do alcance de um build sem interface.

## 5. Padrões fora do catálogo

<!-- Proposta de entrada nova: nome, descrição, sinais, classe sugerida. Só entra no catálogo com aprovação do responsável. -->

| Proposta | Descrição | Classe sugerida | Evidência |
|---|---|---|---|
| P-1 — Item pago não entregue | Compra (não anúncio) cujo item não é creditado ou não tem efeito. MON-0030 cobre só recompensa de anúncio. Sinais: produto consumível sem nenhum código que credite ou consuma o item; bônus calculado e nunca usado | C | `loja.mjs:3` (`pacote_inicial`) sem consumidor; `podeTrocar` só conta trocas com anúncio (`recompensas.mjs:5-7`); `bonusTrocas` (`sequencia.mjs:12`) sem consumidor. Estado: código inconclusiva (a entrega pode estar fora do build); `unk_674eb6ac…` |
| P-2 — Sinal de auditoria: declaração divergente do código | Não é padrão, é sinal para MON-0033 e MON-0027: o perfil/configuração declara entradas da dificuldade e destaque da recusa, e o código lê entrada não declarada (pressão) ou usa texto que a declaração não cobre. Sugestão: acrescentar aos sinais de MON-0033 "entrada da dificuldade ausente da declaração" | — (sinal) | `config.json` (`entradas`, `destaque_recusa`) × `sessao.mjs:80`, `recompensas.mjs:14` |

## 6. Conformidade

<!-- Separar as três fontes: um padrão pode ser C pela política interna sem ser ilegal, e o inverso. Registrar jurisdição e a versão/data da regra consultada. -->

| Fonte | Referência e data consultada | Jurisdição | Situação | Achados |
|---|---|---|---|---|
| Política interna | `docs/catalogo-monetizacao.md` v3 (2026-10-20), lido em 2026-10-21 | — | Não conforme: 4 padrões C presentes; MON-0012 é "Infantojuvenil: proibido" e o alvo tem `children_likely: true` | A-01, A-02, A-03, A-04, A-14 |
| Lei | ECA Digital (Lei 15.211/2025, art. 20), CDC, LGPD — texto **não consultado nesta sessão**; referências pelo catálogo e pela pesquisa de 2026-10-20 | Brasil | Art. 20 (loot box): sem conflito, não há caixa paga. Pontos para avaliação jurídica, sem conclusão aqui: prazo falso de oferta (A-03) frente às regras de oferta e publicidade do CDC; anúncio personalizado com consentimento recusado (A-02), agravado por menores prováveis, frente à LGPD; dificuldade ligada a anúncio (A-01) sem divulgação | A-01, A-02, A-03 |
| Lei / orientação | Princípios CPC sobre moedas virtuais (mar/2025), pela pesquisa de 2026-10-20 | UE | Preço em moeda real presente e sem moeda virtual (conforme); pressão de urgência (A-03) toca o princípio de não pressionar, sobretudo crianças | A-03, A-11 |
| Loja e rede de anúncios | Google Play, App Store, AdMob — políticas **não consultadas nesta sessão** | — | Plataforma de distribuição não definida pelo build (Node, sem loja). Rewarded opcional e intersticial em pausa natural seguem a prática das redes; personalização sem consentimento (A-02) é o ponto de risco a conferir na política vigente | A-02, A-06, A-08 |

## 7. Aproveitamento em projeto nosso

<!-- Só classes A e B. Classe C nunca. Cada item vira entrada no reimplementacoes/<nome>/monetizacao.json; B exige aprovação do perfil presa ao hash. -->

| ID | Parâmetros sugeridos (com unidade) | Para B: justificativa e limites | Restrição de público |
|---|---|---|---|
| MON-0001 | `troca_por_partida: 1`, `continuacao_por_partida: 1`, `vida_por_anuncio_por_dia: 3` | — | permitido |
| MON-0002 | `partidas_entre_anuncios: 2`, `intervalo_minimo_s: 60`, `max_por_sessao: 5`, `carencia_partidas: 2`; remoto só mais restritivo | — | permitido |
| MON-0003 | produto não consumível com restauração; rewarded continua | — | permitido |
| MON-0004 | entradas só de desempenho (ocupação, derrotas seguidas); **sem** qualquer entrada de anúncio ou compra | — | permitido |
| MON-0006 / MON-0036 | preço em reais em todo item; cosmético sem atributo de jogo | — | permitido |
| MON-0009 | `continuacoes_por_partida: 1`, sem prazo, recusa neutra (ex.: "Encerrar partida") | — | permitido |
| MON-0011 | `vidas_max: 5`, `recarga_min: 20` | Justificativa e limites a definir pelo responsável (teto diário de vidas por anúncio, recarga grátis sempre ativa) | permitido |
| MON-0012 | não recomendado | — | proibido com menores prováveis |

## 8. Lacunas

| Lacuna | Motivo | Como fechar |
|---|---|---|
| Efeito real da pressão (A-01) sobre derrotas, duração e ofertas | Execução não aprovada; causalidade exige intervenção | Adendo N3: mesma semente, pressão 0 × 1 (`unk_aef9f6d6…`) |
| Valores remotos em produção | Build sem fonte remota nem rede | Cliente real com captura de rede aprovada (`unk_26164a66…`) |
| Interface: botões, rótulos, oferta relâmpago, confirmação de compra | Build sem camada de interface | Analisar cliente com interface, se existir (`unk_13d9c78e…`) |
| O que um SDK real coletaria no modo personalizado | SDK simulado, sem rede | Cliente real com captura de rede (`unk_eebdcc5b…`) |
| Entrega do `pacote_inicial` e do bônus diário | Sem consumidor no build | Adendo N3: comprar e conferir limite de trocas (`unk_674eb6ac…`) |
| Uso de `contagemRegressiva`, `INTERVALO_ANUNCIO_ANTIGO_S`, `OFERTA_TROCA` | Exportados e não importados pela sessão | Analisar camadas fora do build (`unk_8ddc2dac…`) |
| Situação legal | Textos de lei e políticas de loja não consultados nesta sessão | Revisão jurídica com data de consulta |

## Referências

| ID | Fonte |
|---|---|
| Catálogo | `docs/catalogo-monetizacao.md` v3 |
| Pesquisa | `docs/pesquisa-monetizacao-dark-patterns.md` (2026-10-20): Zagal et al. 2013, UIGuard 2023, AdsDP 2025, EOMM 2017, FTC × Epic 2022, princípios CPC 2025, ECA Digital |
| Evidência REA | `saidas/blocos-a/evidence.json` (10 registros, 6 lacunas), exportado em 2026-10-21 |
