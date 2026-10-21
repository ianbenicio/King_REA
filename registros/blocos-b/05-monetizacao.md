---
alvo: blocos-b
jogo: Blocos 8×8 (pacote blocos-8x8)
versao_jogo: 1.0.0 (package.json)
sha256_alvo: 9ea48130368c378f973ff6ecca238972df2641f12b714611f057ba5ae389df47 (main.mjs); conjunto 8fd7f57baf81371c769b8735f8594d5db9b1f51a5734de1de237a9f1245c0aa8
plataforma: javascript (Node, ESM; monetização simulada, sem camada de UI)
data: 2026-10-21
catalogo_versao: 3
publico_provavel: geral
children_likely: true
verificacao_execucao: nenhuma
---

# Monetização e padrões — Blocos 8×8

<!-- Repositório público: só achados resumidos, parâmetros e trechos curtos. Capturas de tela, criativos de anúncio, respostas de rede e listas brutas ficam em saidas/<slug>/monetizacao/ (fora do git). -->

## Resumo

Modelo híbrido simulado: intersticial no fim de partida, três usos de anúncio com recompensa (trocar a rodada, continuar após a derrota, ganhar uma vida) e uma compra única para remover anúncios (R$ 9,90), sobre um sistema de vidas com recarga por tempo. O único "SDK" é um simulador local (`sdk-simulado.mjs`), sem rede, analytics nem leitura de identificadores. Padrões encontrados: classe A — MON-0002, MON-0001, MON-0009, MON-0003, MON-0006, MON-0004; classe B — MON-0011; classe C — nenhum observado no código, com um candidato inconclusivo (MON-0030, texto da troca × entrega). O achado que mais pesa é a ausência de acoplamento entre monetização e sorteio de peças (o núcleo não importa nada de `monetizacao/`; a dificuldade lê só ocupação e derrotas seguidas), mas isso é estado de código: sem execução, nenhum achado foi reproduzido e nenhuma causalidade foi demonstrada.

**Público provável e `children_likely`:** `geral` e `true`. Fundamento: puzzle de encaixe sem conteúdo adulto, com regras simples e quase sem texto; o build não tem verificação de idade, classificação etária nem declaração de público; o preço em reais aponta para o mercado brasileiro, onde vale o critério de acesso provável do ECA Digital. Nada no build afasta o acesso por menores, então tratei como provável.

## 1. Modelo de receita

| Fonte | Presente | Evidência | Observação |
|---|---|---|---|
| Intersticial | sim | `src/monetizacao/agendador.mjs` (`aoTerminarPartida`); única chamada `sdk.exibir("intersticial")` em `src/sessao/sessao.mjs` (`encerrarPartida`) | Só no fim da partida, com carência, intervalo e teto por sessão |
| Rewarded | sim | `sessao.mjs`: `trocarComAnuncio`, `responderContinuar`, `ganharVidaComAnuncio`; `src/monetizacao/recompensas.mjs` | Três usos, cada um com limite; entrega única por anúncio (`entregaUnica`) |
| Banner | não observado | nenhuma chamada nem tipo `banner` (o simulador aceita só `intersticial` e `rewarded`) | — |
| Compras (consumíveis) | não observado | `loja.mjs` tem um único produto | Não há compra de vidas, peças ou continuações |
| Compras (remover anúncios, passe, assinatura, desbloqueio, expansões) | sim: remover anúncios | `src/monetizacao/loja.mjs` (`PRODUTOS.remover_anuncios`, `comprar`, `restaurar`, `semAnuncios`) | Preço em moeda real, confirmação explícita, restauração; cobrança simulada (sem loja real) |
| Caixas pagas / gacha | não observado | nenhum sorteio após compra | — |

## 2. SDKs de anúncio, mediação, analytics e configuração remota

<!-- Presença de SDK é indício técnico, não prova de execução nem de coleta. -->

| SDK | Função | Versão | Como detectado | Evidência |
|---|---|---|---|---|
| `sdk-simulado` (local, do próprio build) | Anúncios intersticial e rewarded; resultados `completo`, `fechado`, `indisponivel`, `duplicado`; flag `personalizado` igual ao consentimento | sem versão | Leitura do código; grafo de imports | `src/monetizacao/sdk-simulado.mjs`; REA `ev_1617fde4…` |
| Configuração remota | Não há cliente: a sessão recebe um objeto `remoto` do hospedeiro e o valida em `resolverConfig` | — | Leitura do código; REA: 0 requests, 0 timers, 0 processos filhos no grafo | `src/monetizacao/config.mjs`; REA `ev_1617fde4…` |
| Analytics | não observado | — | idem | — |

## 3. Parâmetros de monetização

<!-- Uma chave como ad_cooldown prova que o parâmetro existe, não o valor aplicado. -->

Regra de validação do remoto (`config.mjs`): só cinco chaves são aceitas; chave desconhecida, JSON inválido ou valor fora do limite é rejeitado e o padrão local permanece. Os limites, em notação própria: `partidas_entre ≥ 2`, `intervalo ≥ 60 s`, `0 ≤ teto_sessão ≤ 5`, `carência ≥ 2`, `recarga_vida ≥ 20 min`. Nos quatro parâmetros de anúncio, o remoto só pode deixar o ritmo **menos** agressivo. Na recarga de vida, o remoto só pode deixá-la **mais lenta**, e não há teto.

| Parâmetro | Valor local (padrão) | Valor efetivo observado | Estado da configuração | Onde | Evidência |
|---|---|---|---|---|---|
| `partidas_entre_anuncios` | 2 (mínimo) | — | remoto desconhecido (aceita ≥ 2) | `config.json` → `config.mjs` | leitura; `unk_88c80126…` |
| `intervalo_s` (entre intersticiais) | 60 (mínimo) | — | remoto desconhecido (aceita ≥ 60) | idem | idem |
| `max_por_sessao` (intersticiais) | 5 (máximo) | — | remoto desconhecido (aceita 0 a 5) | idem | idem |
| `carencia_partidas` | 2 (mínimo) | — | remoto desconhecido (aceita ≥ 2) | idem | idem |
| `recarga_vida_min` | 20 (mínimo) | — | remoto desconhecido (aceita ≥ 20, sem teto) | `config.json` → `config.mjs`, `vidas.mjs` | idem |
| `vidas_max` | 5 | — | padrão local (não remotizável) | `config.json` → `LIMITES` | leitura |
| `vida_por_anuncio_max_por_dia` | 3 (dia em UTC) | — | padrão local | `config.json` → `LIMITES`; `vidas.mjs` | leitura |
| `troca_com_anuncio_max_por_partida` | 1 | — | padrão local | `config.json` → `recompensas.mjs` | leitura |
| `continuacoes_max_por_partida` | 1 | — | padrão local | `config.json` → `recompensas.mjs` | leitura |
| Oferta de continuar: destaque e prazo | `destaque: "igual"`, `prazo_s: null` | — | padrão local (dado; renderização fora do build) | `recompensas.mjs` | leitura; `unk_8d4b89c3…` |
| Preço de `remover_anuncios` | R$ 9,90 | — | padrão local (loja real fora do build) | `loja.mjs` | leitura; `unk_4049d3e9…` |
| Fatores de dificuldade | pequenas ×1,5 (ocupação ≥ 50%) e ×2 (≥ 70%); grandes ×0,5 (≥ 2 derrotas seguidas) | — | padrão local, constantes em `dificuldade.mjs` (o `config.json` declara os mesmos valores, mas `dificuldade.mjs` não o lê) | `dificuldade.mjs` | leitura |
| Consentimento | decidido pelo hospedeiro e passado a `criarSessao`; o `main.mjs` de demonstração passa `false` | — | padrão local (demo); valor real desconhecido | `sessao.mjs`, `main.mjs` | leitura; `unk_92cdc9a3…` |

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
| A-01 | MON-0002 | Intersticial só no fim da partida, carência de 2, ≥ 2 partidas e ≥ 60 s entre anúncios, teto 5 por sessão | observada | não testado | hipótese | padrão local; remoto desconhecido (só pode afrouxar) |
| A-02 | MON-0001 | Rewarded em três usos: troca da rodada (1 por partida), continuar (1 por partida), vida (3 por dia) | observada | não testado | hipótese | padrão local |
| A-03 | MON-0009 | Continuar após a derrota com as três regras declaradas nos dados | observada (regras como dados; tela fora do build) | não testado | hipótese | padrão local |
| A-04 | MON-0003 | Compra única "remover anúncios", com escopo, confirmação e restauração | observada | não testado | hipótese | padrão local |
| A-05 | MON-0006 | Loja com um item, preço em reais, sem moeda virtual | observada | não testado | hipótese | padrão local |
| A-06 | MON-0011 | 5 vidas, 1 por partida iniciada, recarga de 20 min por vida, +1 por anúncio (até 3 por dia); sem compra de vida | observada | não testado | hipótese | padrão local; recarga com remoto desconhecido e sem teto |
| A-07 | MON-0004 | Pesos de peças ajustados por ocupação da grade e derrotas seguidas; nenhuma entrada de monetização | observada (MON-0033 não observada) | não testado | hipótese | padrão local |
| A-08 | MON-0030 (candidato) | Texto da troca promete "3 peças novas"; a troca repõe só as posições não usadas (1 a 3) | inconclusiva | não testado | hipótese | padrão local |

Verificações negativas (código **não observado**, pela leitura completa dos 15 arquivos): MON-0008 (sem banner); MON-0012 e MON-0019 (sem sequência diária, eventos ou notificações; REA não achou timers); MON-0013 (sem temporizador acelerável além das vidas, já em A-06); MON-0014 (sem curva de progressão ou XP); MON-0015 e MON-0023 (sem moeda virtual); MON-0016 (sem convite ou ação social); MON-0017 (sem segmentação: o remoto aceita só cinco chaves de ritmo); MON-0018 e MON-0026 (sem caixa paga); MON-0020 (sem pareamento ou seleção de nível); MON-0021 e MON-0022 (sem criativos; o rótulo da opção diz "assistir a um anúncio"); MON-0024 (`prazo_s: null`, sem contagem regressiva); MON-0025 (`comprar` recusa sem `confirmado === true`); MON-0027 (recusa rotulada "Encerrar a partida", sem culpa); MON-0028 (sem assinatura); MON-0029 (sem texto de apelo); MON-0031 (único intersticial no fim da partida); MON-0032 (o SDK simulado exige consentimento decidido antes de inicializar e não lê identificadores); MON-0033 (ver A-07). Todas com execução "não testado" e as limitações da seção 8: o build não tem UI nem SDK real.

### A-01 — MON-0002 Intersticial em pausa natural com limite de frequência

- **Pergunta:** em que momento o intersticial pode disparar, e que contadores o limitam?
- **Variante:** a decisão roda só ao encerrar a partida (após a derrota sem continuação ou após recusar continuar). Ordem das checagens: comprou remover anúncios → não exibe; partidas terminadas ≤ carência (2) → não; partidas desde o último < 2 → não; exibidos na sessão ≥ 5 → não; menos de 60 s desde o último → não; senão exibe. O contador só registra exibição se o SDK devolver `exibido` (resultado diferente de `indisponivel`). Em uma sessão nova, o primeiro intersticial possível é no fim da 3ª partida.
- **Alvo:** blocos-8x8 1.0.0; `agendador.mjs` `7125b30d…`, `sessao.mjs` `06fb9e8d…`
- **Ambiente:** host, sem execução; leitura estática
- **Data e método de coleta:** 2026-10-21; leitura dos arquivos e REA `analyze_javascript_application` (N1)
- **Evidência:** `agendador.mjs` (`aoTerminarPartida`, `registrarExibicao`); `sessao.mjs` (`encerrarPartida`, única chamada de `exibir("intersticial")`); `config.mjs` (`REGRAS`); REA `ev_1617fde4…`
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local, com remoto desconhecido que só pode afrouxar os limites
- **Ligação com mecânicas:** não há `03-mecanicas.md` para este alvo
- **Limitações:** os limites de intervalo e de teto contam só intersticiais; um rewarded (por exemplo, continuar) pode ser seguido de um intersticial no fim da mesma partida. O intersticial dispara logo depois do toque de recusa ("Encerrar a partida"); sem UI, não dá para avaliar se aparece no mesmo ponto do toque (risco de MON-0031). O "por sessão" é por objeto de sessão, e o build não define quando o hospedeiro cria uma sessão nova.
- **Próximos testes:** oráculo em execução (N3): prever, pela regra, as partidas em que o intersticial aparece numa sequência de partidas com tempos conhecidos e comparar.

### A-02 — MON-0001 Anúncio com recompensa opcional

- **Pergunta:** o rewarded só dispara por ação do jogador, a recompensa é entregue uma vez e recusar não penaliza?
- **Variante:** três ações dedicadas (`trocarComAnuncio`, `responderContinuar("continuar")`, `ganharVidaComAnuncio`), cada uma chamada pelo hospedeiro. A recompensa só é entregue com resultado `completo` ou `duplicado`, e `entregaUnica` impede entrega dupla; `fechado` e `indisponivel` não entregam. Limites: troca 1 por partida (não em partida terminada); continuar 1 por partida; vida só com vidas abaixo do máximo e até 3 por dia (UTC).
- **Alvo:** `sessao.mjs` `06fb9e8d…`, `recompensas.mjs` `e66eb8fc…`, `vidas.mjs` `91a9abb6…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura e REA (N1)
- **Evidência:** `sessao.mjs` (três métodos acima); `recompensas.mjs` (`podeTrocar`, `ofertaContinuar`, `entregaUnica`); `sdk-simulado.mjs` (`exibir`: callback só em rewarded completo ou duplicado)
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** o build não mostra a tela que oferece cada rewarded nem se a recompensa é anunciada antes (só a de continuar tem rótulo nos dados). Na continuação, fechar o anúncio antes do fim encerra a partida, o que é o caminho normal de recusa e não penalidade extra. A troca consome o gerador da partida e muda as peças seguintes (efeito esperado de pedir peças novas).
- **Próximos testes:** com execução (N3), roteirizar o simulador com cada resultado e conferir entrega e limites.

### A-03 — MON-0009 Continuar com anúncio, com limite

- **Pergunta:** a oferta de continuar cumpre as três regras do catálogo (uma vez por partida, recusa tão visível quanto o aceite, sem contagem regressiva)?
- **Variante:** `ofertaContinuar` devolve `null` quando a partida já usou a continuação (regra 1); as duas opções têm `destaque: "igual"`, com rótulos "Continuar (assistir a um anúncio)" e "Encerrar a partida" (regra 2, nos dados); `prazo_s: null` e o grafo não tem timers (regra 3). A recompensa ("esvazia 2 linhas e 2 colunas") bate com `continuar` em `jogo.mjs`, que zera as 2 linhas e as 2 colunas mais cheias. A sessão bloqueia qualquer jogada até a oferta ser respondida.
- **Alvo:** `recompensas.mjs` `e66eb8fc…`, `jogo.mjs` `73dd7710…`, `sessao.mjs` `06fb9e8d…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura e REA (N1)
- **Evidência:** `recompensas.mjs` (`ofertaContinuar`); `jogo.mjs` (`continuar`); `sessao.mjs` (`aposAcao`, `responderContinuar`); REA `ev_1617fde4…` (família timer sem relações)
- **Estados:** código observada (as regras são declaradas como dados; a renderização não está no build) · execução não testado · causalidade hipótese · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** "destaque igual" é um atributo, não a tela: tamanho, cor e posição reais dependem de um cliente que não está no build (`unk_8d4b89c3…`). A continuação pode não salvar a partida (se nenhuma peça couber mesmo após esvaziar), e então a partida termina sem nova oferta.
- **Próximos testes:** com cliente de UI e execução aprovada, capturar a sequência derrota → oferta → recusa → intersticial.

### A-04 — MON-0003 Compra para remover anúncios

- **Pergunta:** a compra remove só os anúncios forçados, informa o escopo, exige confirmação e pode ser restaurada?
- **Variante:** produto único `remover_anuncios`, descrição "Remove os anúncios entre partidas. Anúncios opcionais com recompensa continuam disponíveis.", preço R$ 9,90. `comprar` recusa sem `confirmado === true`; recompra devolve "já comprado"; `restaurar` reconstrói a carteira a partir da lista da plataforma (filtrando produtos desconhecidos), na criação da sessão e sob demanda. `semAnuncios` desliga o intersticial no agendador; os rewarded continuam.
- **Alvo:** `loja.mjs` `a27925d3…`, `agendador.mjs` `7125b30d…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura e REA (N1)
- **Evidência:** `loja.mjs` (`PRODUTOS`, `comprar`, `restaurar`, `semAnuncios`); `agendador.mjs` (primeira checagem); `sessao.mjs` (`comprar`, `restaurarCompras`)
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** a cobrança é simulada; a loja real (preço efetivo, confirmação da plataforma, restauração) está fora do build (`unk_4049d3e9…`).
- **Próximos testes:** só com integração real de loja.

### A-05 — MON-0006 Loja transparente

- **Pergunta:** os itens à venda mostram preço em moeda real e há moeda virtual?
- **Variante:** um único item, com preço em reais no próprio dado do produto; não existe moeda virtual nem pacote.
- **Alvo:** `loja.mjs` `a27925d3…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura (N1)
- **Evidência:** `loja.mjs` (`PRODUTOS`)
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** com um item só, os critérios de pacotes e de moeda única são triviais; não se vê se o preço aparece na tela.
- **Próximos testes:** nenhum relevante sem cliente de UI.

### A-06 — MON-0011 Energia ou vidas com recarga por tempo

- **Pergunta:** jogar consome um recurso que recarrega pelo relógio, e anúncio ou compra recarrega na hora?
- **Variante:** cada partida iniciada consome 1 vida (máximo 5). Recarga, em notação própria: vidas = min(5, vidas + ⌊(agora − início_da_recarga) / 20 min⌋). Sem vidas, `iniciarPartida` devolve "sem vidas" e o tempo de espera. Um rewarded dá +1 vida, só abaixo do máximo e até 3 por dia (dia UTC). Não há compra de vidas, e a compra de remover anúncios não mexe nas vidas.
- **Alvo:** `vidas.mjs` `91a9abb6…`, `sessao.mjs` `06fb9e8d…`, `config.mjs` `a537f1e7…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura e REA (N1)
- **Evidência:** `vidas.mjs` (`atualizar`, `consumirVida`, `podeGanharPorAnuncio`, `ganharPorAnuncio`); `sessao.mjs` (`iniciarPartida`, `ganharVidaComAnuncio`); `config.mjs` (regra de `recarga_vida_min`)
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local (máximo e teto diário); recarga com remoto desconhecido
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** o remoto pode aumentar a recarga sem teto (aceita qualquer inteiro ≥ 20 min), o que alongaria a espera e a pressão para assistir ao anúncio; o valor de produção é desconhecido (`unk_88c80126…`). Ver proposta P-02.
- **Próximos testes:** com execução (N3), conferir a recarga com relógio controlado; com captura aprovada, observar o valor remoto.

### A-07 — MON-0004 Dificuldade dinâmica para manter o fluxo

- **Pergunta:** o gerador de peças ou a dificuldade leem algum estado de monetização (anúncios exibidos, ofertas, compras, consentimento, configuração remota)?
- **Variante:** o sorteio ponderado usa peso = peso_base × fator(tamanho), com fator(pequena) = 10, 15 (ocupação ≥ 50%) ou 20 (≥ 70%), fator(média) = 10 e fator(grande) = 10, ou 5 com 2 ou mais derrotas seguidas. A ocupação vem da grade; "derrota" é terminar a partida com menos pontos que a anterior, calculada pela sessão. A semente de cada partida depende só da semente da sessão e do número da partida. O grafo de imports mostra que `src/nucleo/*` só importa `src/nucleo/*`; a sessão passa ao núcleo apenas a semente e as derrotas seguidas. Conclusão de código: MON-0004 observada; MON-0033 não observada.
- **Alvo:** `dificuldade.mjs` `fc6f369f…`, `jogo.mjs` `73dd7710…`, `prng.mjs` `d03ae3f6…`, `sessao.mjs` `06fb9e8d…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura completa, busca de imports restrita a `alvos/blocos-b/`, REA `analyze_javascript_application` e `trace_javascript_semantics` (N1)
- **Evidência:** `dificuldade.mjs` (`fatores`, `pesos`); `jogo.mjs` (`sortear`, `novaPartida`, `jogar`, `trocarRodada`); `sessao.mjs` (`sementeDaPartida`, `encerrarPartida`); REA `ev_1617fde4…`, `ev_a4ad0fd5…` (rastreio de `derrotasSeguidas`, resultado ambíguo pela ferramenta: os receptores não foram resolvidos estaticamente)
- **Estados:** código observada · execução não testado · causalidade hipótese (invariância não testada por intervenção) · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** há um caminho indireto, mediado por desempenho: continuar ou trocar com anúncio pode aumentar os pontos da partida, o que reduz a chance de contar "derrota" e, portanto, o alívio de peças grandes na partida seguinte. Não é leitura de estado de monetização, mas o efeito existe por construção. `criarSessao` aceita um núcleo injetado (`nucleo`); a análise cobre só o núcleo padrão do build. O rastreio semântico do REA ficou ambíguo e não substitui a leitura.
- **Próximos testes:** teste de invariância (N3): mesma semente e mesmas jogadas, mudando uma variável de monetização por vez (config remota, compra, resultado do SDK, consentimento) e comparando a sequência de peças (`unk_769843e1…`).

### A-08 — MON-0030 Recompensa não entregue (candidato)

- **Pergunta:** a recompensa entregue pela troca com anúncio é igual à anunciada?
- **Variante:** a constante `OFERTA_TROCA` anuncia "3 peças novas no lugar das não usadas"; `trocarRodada` sorteia só para as posições ainda ocupadas da rodada, e a troca é permitida com a rodada parcial. Com uma ou duas peças já colocadas, a entrega é de 2 ou 1 peças.
- **Alvo:** `recompensas.mjs` `e66eb8fc…`, `jogo.mjs` `73dd7710…`
- **Ambiente:** host, sem execução
- **Data e método de coleta:** 2026-10-21; leitura (N1)
- **Evidência:** `recompensas.mjs` (`OFERTA_TROCA`, `podeTrocar`); `jogo.mjs` (`trocarRodada`); `sessao.mjs` não referencia `OFERTA_TROCA`
- **Estados:** código inconclusiva (a divergência existe entre o texto e a lógica, mas não se sabe se o texto é o exibido, e "no lugar das não usadas" admite a leitura de que só as não usadas são trocadas) · execução não testado · causalidade hipótese · configuração padrão local
- **Ligação com mecânicas:** não há `03-mecanicas.md`
- **Limitações:** sem UI, não se vê o texto mostrado ao jogador (`unk_f697e83c…`).
- **Próximos testes:** com cliente de UI e execução aprovada, acionar a troca com 0, 1 e 2 peças colocadas e comparar com o texto exibido.

## 5. Padrões fora do catálogo

<!-- Proposta de entrada nova: nome, descrição, sinais, classe sugerida. Só entra no catálogo com aprovação do responsável. -->

| Proposta | Descrição | Classe sugerida | Evidência |
|---|---|---|---|
| P-01 — Configuração remota limitada pelo perfil local | Salvaguarda: o remoto só altera chaves conhecidas e só dentro de limites locais que deixam o ritmo de anúncios menos agressivo; valor fora do limite é rejeitado e registrado. Sinais: tabela de chaves aceitas com predicado de limite; registro de rejeitados. Útil como critério para o estado "remoto desconhecido": com piso local, o pior caso é conhecido mesmo sem captura | A (como salvaguarda ou atributo de MON-0002, não como padrão de receita) | `config.mjs` (`REGRAS`, `resolverConfig`) |
| P-02 — Espera configurável remotamente sem teto | Parâmetro de espera (recarga de vida, temporizador) que o remoto pode aumentar sem limite superior, enquanto anúncio ou compra encurta a espera. Sinal: validação só com mínimo num parâmetro cujo aumento prejudica o jogador | B (sinal adicional de MON-0011/MON-0013, não padrão novo) | `config.mjs` (regra de `recarga_vida_min`) |
| P-03 — Limite de frequência que ignora outros tipos de anúncio | O intervalo e o teto do intersticial contam só intersticiais; um rewarded pode ser seguido de um intersticial na mesma pausa. Sinal: contador de frequência por tipo, sem contador global | critério a acrescentar em MON-0002 (A só se o limite contar anúncios de qualquer tipo); decisão do responsável | `agendador.mjs`, `sessao.mjs` (`responderContinuar` → `encerrarPartida`) |

## 6. Conformidade

<!-- Separar as três fontes: um padrão pode ser C pela política interna sem ser ilegal, e o inverso. Registrar jurisdição e a versão/data da regra consultada. -->

| Fonte | Referência e data consultada | Jurisdição | Situação | Achados |
|---|---|---|---|---|
| Política interna | docs/catalogo-monetizacao.md v3 (2026-10-20), consultado em 2026-10-21 | — | Cinco padrões A e MON-0004 (A); um B (MON-0011, permitido com menores pelo catálogo); nenhum C observado; MON-0030 inconclusivo | A-01 a A-08 |
| Lei | ECA Digital (Lei 15.211/2025, art. 20), CDC, LGPD — pelo resumo do catálogo; texto legal não consultado nesta análise | Brasil | Com `children_likely: true`: não há caixa paga (MON-0018/0026) nem padrão marcado "Infantojuvenil: proibido". Consentimento decidido antes de inicializar o SDK (LGPD), mas a coleta real está fora do build | A-06, MON-0032 (verificação negativa) |
| Lei / orientação | Princípios CPC sobre moedas virtuais — pelo resumo do catálogo; não consultado diretamente | UE | Preço em moeda real e sem moeda virtual | A-05 |
| Loja e rede de anúncios | Google Play, App Store, AdMob — pelo resumo do catálogo; não consultadas | — | Intersticial só em pausa natural; rewarded por escolha; sem loja real nem SDK real para conferir | A-01, A-02, A-04 |

## 7. Aproveitamento em projeto nosso

<!-- Só classes A e B. Classe C nunca. Cada item vira entrada no reimplementacoes/<nome>/monetizacao.json; B exige aprovação do perfil presa ao hash. -->

| ID | Parâmetros sugeridos (com unidade) | Para B: justificativa e limites | Restrição de público |
|---|---|---|---|
| MON-0002 | `partidas_entre_anuncios`: 2; `intervalo_minimo_s`: 60; `max_por_sessao`: 5; `carencia_partidas`: 2; remoto só para afrouxar (P-01); contar rewarded no intervalo (P-03) | — | permitido |
| MON-0001 | `trocas_por_partida`: 1; `vidas_por_anuncio_por_dia`: 3; recompensa só com anúncio completo, entrega única | — | permitido |
| MON-0009 | `continuacoes_por_partida`: 1; recusa com o mesmo destaque; sem prazo | — | permitido |
| MON-0003 | produto não consumível, confirmação explícita, restauração | — | permitido |
| MON-0006 | preço em moeda real em todo item; sem moeda virtual | — | permitido |
| MON-0004 | entradas só de desempenho (ocupação, derrotas seguidas) | — | permitido |
| MON-0011 | `vidas_max`: 5; `recarga_min`: 20 | Justificativa a definir pelo responsável. Limites: teto de recarga também no remoto (P-02), vida por anúncio limitada por dia, sem venda de vidas | permitido |

## 8. Lacunas

| Lacuna | Motivo | Como fechar |
|---|---|---|
| Valores remotos de produção (`unk_88c80126…`) | O build não busca configuração; recebe um objeto do hospedeiro | Observar o objeto entregue pelo hospedeiro real (execução aprovada em adendo) |
| Apresentação das telas (`unk_8d4b89c3…`) | Não há camada de UI no build | Cliente com UI e captura de sequência de telas, com nível aprovado |
| Consentimento e coleta com SDK real (`unk_92cdc9a3…`) | O SDK é simulado e não tem rede | SDK real e captura de rede aprovada (N4) |
| Invariância das peças ao estado de monetização (`unk_769843e1…`) | Só análise estática; causalidade exige intervenção | Teste de invariância com execução (N3) |
| Texto exibido na troca (`unk_f697e83c…`) | `OFERTA_TROCA` não é referenciado pela sessão | Cliente com UI; troca com rodada parcial |
| Loja real (`unk_4049d3e9…`) | Cobrança simulada | Integração real de loja |
| Execução em geral | N3 não aprovado: todos os achados ficam "não testado" | Adendo ao `00-seguranca.md` com aprovação do responsável |

## Referências

| ID | Fonte |
|---|---|
| CAT | `docs/catalogo-monetizacao.md`, versão 3 (2026-10-20) |
| SKILL | `.claude/skills/protocolo-monetizacao/SKILL.md` |
| SEG | `registros/blocos-b/00-seguranca.md` (hashes dos arquivos) |
| REA | Bundle `saidas/blocos-b/evidence.json` (fora do git): `ev_1617fde4…` (grafo da aplicação), `ev_a4ad0fd5…` (rastreio semântico), seis lacunas `unk_…` |
