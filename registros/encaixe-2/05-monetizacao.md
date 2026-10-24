---
alvo: encaixe-2
jogo: Encaixe 8×8
versao_jogo: 1.0.0 (package.json do build)
sha256_alvo: 986914ca76580c19093febdd240fea11d7b3d41611c162ee655fe66f61ea1770 (conjunto dos 23 arquivos, conferidos um a um contra o 00-seguranca.md em 2026-10-24)
plataforma: web
data: 2026-10-24
catalogo_versao: 3
publico_provavel: geral
children_likely: unknown
verificacao_execucao: execucao (N3, cenário controlado no navegador; sem instrumentação de código e sem captura de corpo de rede)
---

# Monetização e padrões — Encaixe 8×8

<!-- Repositório público: só achados resumidos, parâmetros e trechos curtos. Capturas de tela, criativos de anúncio, respostas de rede e listas brutas ficam em saidas/<slug>/monetizacao/ (fora do git). -->

## Resumo

Modelo híbrido simulado: intersticial entre partidas, rewarded opcional (trocar peças, continuar após derrota, ganhar vida) e uma compra única de remover anúncios; sem moeda virtual, sem caixa paga, sem banner. Não há SDK de terceiros: o "SDK" é um simulador local, sem rede (a captura só viu `127.0.0.1`). Padrões por classe: **A** — MON-0001, MON-0002, MON-0003, MON-0004, MON-0009 (com ressalva de destaque); **B** — MON-0011; **C** — MON-0025 e MON-0021. Os achados que mais pesam: **MON-0025** (dois toques rápidos no "Comprar" concluem a compra, porque a confirmação nasce no mesmo ponto e aceita toque na hora) — código observado, reproduzido, causalidade demonstrada; e **MON-0021** (fechar do intersticial oculto por 5 s sem aviso) — código observado, não testado em execução. O preço da compra (R$ 9,90) existe nos dados, mas não aparece em nenhuma tela do fluxo (reproduzido). O gerador de peças lê só desempenho (MON-0004); MON-0033 não foi observado no código, mas a invariância não foi demonstrada.

## 1. Modelo de receita

| Fonte | Presente | Evidência | Observação |
|---|---|---|---|
| Intersticial | sim (código) | `src/monetizacao/agendador.mjs`, `src/sessao/sessao.mjs` (fim de partida) | Simulado; não alcançado em execução (ver lacunas) |
| Rewarded | sim (código e execução) | `src/monetizacao/recompensas.mjs`, `interface/controle.mjs`; captura `cap2` | Três usos: trocar peças (1 por partida), continuar após derrota (1 por partida), ganhar vida (até 3 por dia) |
| Banner | não observado | nenhum elemento de banner nas cenas de `src/interface/tela.mjs` | — |
| Compras (consumíveis) | não observado | catálogo de produtos tem um item só | — |
| Compras (remover anúncios, passe, assinatura, desbloqueio, expansões) | sim: remover anúncios | `src/monetizacao/loja.mjs`; captura `cap1` | Compra simulada, não consumível, com restauração; preço só nos dados |
| Caixas pagas / gacha | não observado | nenhum sorteio ligado a compra | — |

## 2. SDKs de anúncio, mediação, analytics e configuração remota

<!-- Presença de SDK é indício técnico, não prova de execução nem de coleta. -->

| SDK | Função | Versão | Como detectado | Evidência |
|---|---|---|---|---|
| SDK simulado do próprio build | exibe intersticial e rewarded com resultado roteirizado (`completo`, `fechado`, `indisponivel`, `duplicado`); exige consentimento decidido (booleano) antes de inicializar | — | leitura do módulo `src/monetizacao/sdk-simulado.mjs` (N1) | E1 |
| Configuração remota (interna) | `resolverConfig` aceita valores remotos só dentro de limites (mais restritivos que o padrão) | — | leitura de `src/monetizacao/config.mjs` (N1) | E1 |
| Rede de anúncios, mediação, analytics de terceiros | não observados | — | grafo estático sem `fetch`, WebSocket nem HTTP de saída (família `request` vazia); nenhum endereço externo nos arquivos; captura só com `127.0.0.1:8737` | E1, E2, E3 |

## 3. Parâmetros de monetização

<!-- Uma chave como ad_cooldown prova que o parâmetro existe, não o valor aplicado. -->

| Parâmetro | Valor local (padrão) | Valor efetivo observado | Estado da configuração | Onde | Evidência |
|---|---|---|---|---|---|
| Carência inicial (partidas sem intersticial) | 2 (o primeiro elegível é o fim da 3ª) | — | padrão local | `config.json` → `config.mjs`; regra em `agendador.mjs` | E1 |
| Partidas entre intersticiais | ≥ 2 | — | padrão local | idem | E1 |
| Intervalo mínimo entre anúncios | 60 s, contando intersticial **e** rewarded | — | padrão local | idem | E1 |
| Intersticiais por sessão | ≤ 5 | — | padrão local | idem | E1 |
| Fechar do intersticial liberado após | 5000 ms (constante de tela, fora do `config.json`) | — | padrão local | `src/interface/tela.mjs` | E1 |
| Duração do rewarded até a recompensa | 5000 ms | recompensa entregue após ~5,6 s de espera; antes disso, não | valor efetivo observado | `tela.mjs`, `controle.mjs` | E3 |
| Trocas com anúncio por partida | 1 | 1 (botão some após a entrega) | valor efetivo observado | `config.json`, `recompensas.mjs` | E3 |
| Continuações com anúncio por partida | 1 | — | padrão local | idem | E1 |
| Janela de toque na oferta de continuar | 500 ms nos dois botões | — | padrão local | `tela.mjs` | E1 |
| Vidas máximas / recarga | 5 / 1 vida a cada 20 min (remoto aceito entre 20 e 40 min) | 5 → 4 ao iniciar partida | valor efetivo observado (consumo); recarga em padrão local | `config.json`, `vidas.mjs` | E1, E3 |
| Vidas por anúncio por dia | ≤ 3, só com vidas abaixo do máximo | — | padrão local | `vidas.mjs` | E1 |
| Preço de remover anúncios | R$ 9,90 nos dados | não exibido em nenhuma tela | valor efetivo observado (ausência na tela) | `loja.mjs`; captura `cap1` | E1, E2 |
| Consentimento para anúncio personalizado | `false` por padrão na interface | — | padrão local | `interface/controle.mjs` | E1 |
| Configuração remota | a interface nunca aplica remoto | — | padrão local (não há remoto em uso) | `sessao.mjs`, `controle.mjs` | E1 |

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

### Ambiente comum da execução

Windows 10 (host, usuário sem administrador); Chromium do Playwright `chromium-1208` em modo headless, copiado para `saidas/encaixe-2/navegador/` por exigência do gate (SHA-256 do `chrome.exe` igual ao instalado); viewport 360×640, `pt-BR`, UTC; armazenamento vazio, sem conta; servidor do build em `127.0.0.1:8737`, ligado só durante as capturas; URL com `semente=7`; rede só loopback.

### Tabela

| Achado | ID do catálogo | Variante | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|
| A-01 | MON-0025 (C) | confirmação existe, mas nasce no ponto do "Comprar" e aceita toque na hora: dois toques compram | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-02 | MON-0021 (C) | fechar do intersticial oculto por 5 s, sem contagem nem aviso | observada | não testado | hipótese | padrão local |
| A-03 | MON-0003 (A) | remover anúncios com escopo claro e restauração, mas sem preço na tela | observada | reproduzido | hipótese | valor efetivo observado |
| A-04 | MON-0001 (A) | rewarded para trocar as peças da rodada, 1 por partida | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-05 | MON-0001 (A) | rewarded para ganhar 1 vida, até 3 por dia | observada | não testado | hipótese | padrão local |
| A-06 | MON-0009 (A, com ressalva) | continuar com anúncio 1 vez por partida; recusa do mesmo tamanho, mas sem preenchimento de destaque | observada | não testado | hipótese | padrão local |
| A-07 | MON-0002 (A) | intersticial só no fim de partida, com carência, intervalo e teto | observada | não testado | hipótese | padrão local |
| A-08 | MON-0004 (A) | pesos das peças por ocupação da grade e derrotas seguidas | observada | não testado | hipótese | padrão local |
| A-09 | MON-0011 (B) | 5 vidas, recarga de 20 min, anúncio dá 1 vida | observada | reproduzido (consumo) | hipótese | valor efetivo observado (consumo) |

#### Padrões verificados e não observados

| ID | Pergunta | Resultado |
|---|---|---|
| MON-0033 | O gerador de peças ou a dificuldade lê estado de monetização? | Código: não observada (entradas só ocupação e derrotas seguidas). Execução: não testado. Ver A-08 e lacunas |
| MON-0022 | Os anúncios têm rótulo? | Rótulo "Anúncio" fixo no topo da tela de anúncio (código e execução, no rewarded) |
| MON-0030 | A recompensa é entregue como prometido e só uma vez? | Entregue ao fim do anúncio, não entregue ao fechar antes (reproduzido); entrega única protege contra callback duplicado (código) |
| MON-0032 | O SDK inicializa antes do consentimento e coleta? | Inicializa com `consentimento=false` (não personalizado) e sem rede; nenhum identificador lido. Não observada |
| MON-0024, MON-0027, MON-0029 | Há urgência, recusa com culpa ou apelo a menores nos textos? | Não observados: recusas "Agora não", "Encerrar a partida", "Voltar", "Cancelar"; nenhum prazo ou contagem nas ofertas |
| MON-0031 | O anúncio surge onde o jogador toca, com área clicável? | Não observada no código: o corpo do anúncio não aceita toque e o fechar fica fora da grade. Execução do intersticial não testada |
| MON-0023, MON-0015, MON-0018, MON-0026 | Há moeda virtual ou caixa paga? | Não observados |

### A-01 — MON-0025 Compra sem confirmação

- **Pergunta:** a tela de confirmação da compra impede uma compra por toque acidental?
- **Variante:** a loja tem duas etapas ("Comprar" → "Confirmar compra"), e a sessão só aceita compra com confirmação explícita. Mas o botão "Confirmar compra" é montado na mesma posição e tamanho do "Comprar" (faixa de 328×48 px em y = 440) e aceita toque a partir de 0 ms. Um toque duplo no "Comprar" passa pelas duas etapas e compra. A oferta de continuar usa janela de 500 ms contra toque acidental; a confirmação da compra, não.
- **Alvo:** encaixe-2 1.0.0, conjunto `986914ca…1770`.
- **Ambiente:** comum (acima).
- **Data e método de coleta:** 2026-10-24; estático (leitura dos módulos, N1) e cenário controlado no navegador (`capture_browser_scenario`, N3).
- **Evidência:** E1 (`src/interface/tela.mjs`, cena `loja`: as duas etapas usam o mesmo bloco de oferta, sem `desde_ms`); E2 (passos `comprar-1-toque` → tela de confirmação; `cancelar` → volta ao produto; `comprar-2-toques` → "Anúncios entre partidas removidos.").
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (só o número de cliques mudou: 1 clique para na confirmação, 2 cliques compram) · configuração padrão local.
- **Ligação com mecânicas:** não há `03-mecanicas.md` para este alvo.
- **Limitações:** compra simulada, sem diálogo de loja da plataforma; numa loja real (Google Play, App Store), a plataforma teria confirmação própria, o que pode neutralizar o efeito. O enquadramento em MON-0025 ("compra com um toque") é leitura desta análise: a confirmação existe, mas é contornável por um único gesto. Se o responsável preferir entrada própria, ver seção 5.
- **Próximos testes:** nenhum necessário para o estado atual; repetir com `click_count` 2 e intervalo maior que um toque duplo, para medir a janela.

### A-02 — MON-0021 Botão de fechar enganoso

- **Pergunta:** o fechar do intersticial é visível, de tamanho adequado e liberado de imediato ou com atraso informado?
- **Variante:** o fechar tem 64×44 px (no mínimo de 44 px), posição fixa no canto superior direito e não sobrepõe área clicável (o corpo do anúncio não aceita toque). Mas fica **oculto por 5 s** (`visivelDesde` e `aceitaToqueDesde` = 5000 ms), sem contagem regressiva nem texto de aviso; o corpo diz só "Anúncio simulado.". O catálogo inclui "atraso não informado" na descrição de MON-0021. No rewarded, o fechar aparece em 0 ms (reproduzido).
- **Alvo:** encaixe-2 1.0.0.
- **Ambiente:** só estático.
- **Data e método de coleta:** 2026-10-24; estático (N1).
- **Evidência:** E1 (`src/interface/tela.mjs`, função de anúncio e cena `intersticial`; `interface/desenho.mjs` oculta o nó até `visivelDesde`). Lacuna REA `unk_7a677d85…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local (constante de tela, não declarada no `config.json`).
- **Limitações:** a captura não chega ao intersticial: é preciso terminar 3 partidas, e as peças estão desenhadas no canvas, sem elemento que o cenário consiga tocar (ele clica no centro do localizador). É a forma mais branda do padrão (só o atraso não informado); tamanho, posição e sobreposição estão adequados.
- **Próximos testes:** cenário com clique por coordenada (ou outra via aprovada por adendo) para jogar até o fim e medir o tempo de aparição do fechar.

### A-03 — MON-0003 Compra para remover anúncios

- **Pergunta:** a compra de remover anúncios informa preço, escopo e restauração?
- **Variante:** escopo claro nas duas telas ("desliga os anúncios entre partidas"; "anúncios com recompensa continuam opcionais") e botão "Restaurar compras". O preço (R$ 9,90) está só nos dados do produto: nenhuma tela da loja o mostra, nem a confirmação ("Confirmar a compra de Remover anúncios?").
- **Alvo, ambiente:** como A-01.
- **Data e método de coleta:** 2026-10-24; estático (N1) e captura `cap1` (N3).
- **Evidência:** E1 (`src/monetizacao/loja.mjs`, cena `loja`); E2 (texto de todas as etapas da loja, sem preço).
- **Estados:** código observada · execução reproduzido (compra concluída e preço ausente) · causalidade hipótese (que a compra desliga o intersticial está no código — `semAnuncios` no agendador —, mas não foi testado em execução) · configuração valor efetivo observado.
- **Limitações:** sem moeda virtual, então não é MON-0023; numa loja real, o diálogo da plataforma mostraria o preço. Pela definição do catálogo, MON-0003 pede "preço em moeda real": fica A com essa falta registrada.
- **Próximos testes:** comprar e jogar 3 partidas para confirmar que o intersticial não aparece (mesmo bloqueio do canvas).

### A-04 — MON-0001 Anúncio com recompensa opcional (trocar peças)

- **Pergunta:** a troca de peças com anúncio informa ação e recompensa, entrega o prometido e não pune a recusa?
- **Variante:** botão "Trocar peças (anúncio)" durante a partida → oferta "Trocar 3 peças (assistir a um anúncio)" / "Agora não" → anúncio rotulado, com fechar imediato. Recompensa: as peças que faltam usar trocadas por novas, sorteadas com os mesmos pesos da partida. Limite: 1 entrega por partida.
- **Alvo, ambiente:** como A-01.
- **Data e método de coleta:** 2026-10-24; estático (N1) e captura `cap2` (N3).
- **Evidência:** E1 (`recompensas.mjs`, `sessao.mjs`, `jogo.mjs` troca da rodada); E3 (fechar antes do fim: peças iguais, troca ainda oferecida; esperar ~5,6 s: peças trocadas e botão de troca removido).
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (só o tempo de exibição antes de sair mudou: fechar cedo não entrega, assistir até o fim entrega) · configuração valor efetivo observado (limite 1).
- **Limitações:** a duração do anúncio (5 s) não aparece na tela: o texto diz só que a recompensa "vem ao fim do anúncio". Fechar antes não consome a troca (a oferta continua).
- **Próximos testes:** nenhum para este estado.

### A-05 — MON-0001 Anúncio com recompensa opcional (ganhar vida)

- **Pergunta:** o anúncio por vida é opcional, limitado e entrega o prometido?
- **Variante:** na tela sem vidas, "Ganhar 1 vida (assistir a um anúncio)" / "Agora não"; só com vidas abaixo do máximo e até 3 por dia (dia em UTC).
- **Evidência:** E1 (`vidas.mjs`, `sessao.mjs`, cena `sem_vidas`). Lacuna `unk_c5746200…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** a tela sem vidas exige gastar 5 vidas (mesmo bloqueio do canvas).

### A-06 — MON-0009 Continuar com anúncio, com limite

- **Pergunta:** a tela de continuar cumpre as três regras de MON-0009?
- **Variante:** regra 1 (uma vez por partida): cumprida no código. Regra 3 (sem pressão de tempo): cumprida (`prazo_s` nulo, sem contagem; janela de 500 ms igual nos dois botões, contra toque acidental). Regra 2 (recusa tão visível quanto o aceite): mesmo tamanho (328×48), mesma fonte e peso, texto neutro ("Encerrar a partida"); mas o aceite tem fundo azul preenchido com texto branco e a recusa fundo cinza claro (`#1F5FA8` × `#E4E7EB`). O mesmo bloco de oferta aparece na troca de peças e foi visto em execução.
- **Evidência:** E1 (`recompensas.mjs` oferta de continuar; `tela.mjs` bloco de oferta e cena `oferta_continuar`); E3 (captura de tela da oferta de troca, mesmo bloco). Lacuna `unk_2d066e5a…`.
- **Estados:** código observada · execução não testado (a tela de continuar em si) · causalidade hipótese · configuração padrão local.
- **Limitações:** "mesmo destaque" é critério visual; pela leitura estrita, o preenchimento diferente faz o padrão deixar de ser A. Não há texto de culpa nem prazo, então não cai em MON-0027 nem MON-0024. **Decisão de enquadramento pendente do responsável.**
- **Próximos testes:** capturar a tela de continuar em execução (mesmo bloqueio do canvas).

### A-07 — MON-0002 Intersticial em pausa natural com limite de frequência

- **Pergunta:** quando o intersticial dispara e o que o limita?
- **Variante:** só depois do evento de fim de partida (inclusive após recusar continuar), nunca durante a partida; carência de 2 partidas, mínimo de 2 partidas entre exibições, 60 s desde qualquer anúncio (o rewarded também conta) e teto de 5 por sessão; desligado pela compra de remover anúncios. A interface só mostra o intersticial se o fim de partida veio antes dele no mesmo lote de eventos.
- **Evidência:** E1 (`agendador.mjs`, `sessao.mjs` encerramento da partida, `cenas.mjs`). Lacuna `unk_7a677d85…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local (remoto só aceito dentro dos limites e não usado pela interface).
- **Limitações:** mesmo bloqueio do canvas. Ver A-02 para o fechar.

### A-08 — MON-0004 Dificuldade dinâmica para manter o fluxo

- **Pergunta:** o gerador de peças lê algum contador de anúncio, oferta ou compra?
- **Variante:** pesos das 19 peças multiplicados por fatores que dependem só da **ocupação da grade** (≥ 50 %: peças pequenas × 1,5; ≥ 70 %: × 2) e das **derrotas seguidas** (≥ 2: peças grandes × 0,5). "Derrota" é terminar com menos pontos que a partida anterior. A semente da partida vem da semente da sessão e do número da partida. Nenhuma leitura de agendador, carteira, trocas ou continuações no núcleo.
- **Evidência:** E1 (`src/nucleo/dificuldade.mjs`, `src/nucleo/jogo.mjs` sorteio, `src/sessao/sessao.mjs` cálculo de derrotas). Lacuna `unk_92e26666…`.
- **Estados:** código observada (e MON-0033 não observada) · execução não testado · causalidade hipótese · configuração padrão local (fatores fixos no código, iguais aos declarados no `config.json`, que o núcleo não lê).
- **Limitações:** há um caminho indireto, por desempenho: continuar com anúncio limpa linhas e pode aumentar os pontos, o que muda a contagem de derrotas seguidas e, com ela, o peso das peças grandes da partida seguinte. Isso é leitura de desempenho, não de estado de monetização, mas não foi medido. A troca com anúncio consome o gerador, o que muda as peças seguintes da mesma partida (efeito esperado de qualquer sorteio extra).
- **Próximos testes:** teste de invariância (mesma semente, mesmas jogadas, só o estado de monetização mudando). Exige rodar os módulos do build em Node, fora do plano N3 aprovado: precisa de adendo.

### A-09 — MON-0011 Energia ou vidas com recarga por tempo

- **Pergunta:** jogar consome recurso que recarrega com o tempo e pode ser recarregado por anúncio ou compra?
- **Variante:** 5 vidas; cada partida iniciada consome 1; recarga de 1 vida a cada 20 min; anúncio dá 1 vida (até 3 por dia); não há compra de vidas.
- **Evidência:** E1 (`vidas.mjs`, `sessao.mjs`); E3 ("Vidas: 4" logo após "Nova partida").
- **Estados:** código observada · execução reproduzido (consumo) · causalidade hipótese · configuração valor efetivo observado (consumo; recarga em padrão local).
- **Limitações:** recarga e tela sem vidas não testadas. Classe B: em projeto nosso só com justificativa, limites e aprovação.

## 5. Padrões fora do catálogo

<!-- Proposta de entrada nova: nome, descrição, sinais, classe sugerida. Só entra no catálogo com aprovação do responsável. -->

| Proposta | Descrição | Classe sugerida | Evidência |
|---|---|---|---|
| Confirmação sobreposta ao botão de origem | Alternativa ao enquadramento de A-01 em MON-0025: a tela de confirmação põe o "confirmar" no mesmo ponto do botão que a abriu, sem janela de toque, de modo que um toque duplo confirma. Sinais: botões das duas etapas com mesma geometria; aceite de toque imediato na etapa de confirmação | C (se separada de MON-0025) | A-01 |
| Duração do anúncio com recompensa não informada | O jogador não sabe quanto tempo precisa assistir para ganhar a recompensa; fechar antes perde a recompensa sem aviso de quanto faltava. Pode caber como critério extra em MON-0001 em vez de entrada nova | A com critério, ou B | A-04 |

## 6. Conformidade

<!-- Separar as três fontes: um padrão pode ser C pela política interna sem ser ilegal, e o inverso. Registrar jurisdição e a versão/data da regra consultada. -->

| Fonte | Referência e data consultada | Jurisdição | Situação | Achados |
|---|---|---|---|---|
| Política interna | docs/catalogo-monetizacao.md v3 (2026-10-20), lido em 2026-10-24 | — | Dois padrões C (não implementáveis em projeto nosso), um B, demais A; A-06 com enquadramento pendente | A-01, A-02 (C); A-09 (B); A-06 |
| Lei | ECA Digital (Lei 15.211/2025, art. 20), CDC, LGPD — texto **não consultado nesta sessão** (sem rede); só a referência do catálogo | Brasil | `children_likely` desconhecido, que conta como sim. Sem caixa paga nem apelo a menores. Preço ausente na tela e confirmação contornável merecem análise jurídica sob o dever de informação do CDC; não concluída aqui | A-01, A-03 |
| Lei / orientação | Princípios CPC sobre moedas virtuais — não consultados nesta sessão | UE | Sem moeda virtual: não se aplica | — |
| Loja e rede de anúncios | Google Play, App Store, AdMob — não consultados nesta sessão | — | Build web com SDK e loja simulados: não publicado em loja nem ligado a rede de anúncios | — |

## 7. Aproveitamento em projeto nosso

<!-- Só classes A e B. Classe C nunca. Cada item vira entrada no reimplementacoes/<nome>/monetizacao.json; B exige aprovação do perfil presa ao hash. -->

| ID | Parâmetros sugeridos (com unidade) | Para B: justificativa e limites | Restrição de público |
|---|---|---|---|
| MON-0001 | `trocas_por_partida`: 1; `vidas_por_anuncio_por_dia`: 3; mostrar a duração do anúncio | — | permitido |
| MON-0002 | `carencia_partidas`: 2; `partidas_entre_anuncios`: 2; `intervalo_minimo_s`: 60 (contando todos os tipos); `max_por_sessao`: 5; fechar liberado de imediato ou com contagem visível | — | permitido |
| MON-0003 | produto único, com restauração e **preço exibido** nas duas etapas | — | permitido |
| MON-0004 | entradas só de desempenho (ocupação, derrotas seguidas), com teste de invariância | — | permitido |
| MON-0009 | `continuacoes_por_partida`: 1; recusa com mesmo preenchimento do aceite; janela de toque de 500 ms | — | permitido |
| MON-0011 | `vidas_max`: 5; `recarga_min`: 20 | justificativa e limites a definir pelo projeto; recarga grátis sempre disponível, sem venda de vidas | permitido |

Não aproveitar: MON-0025 (A-01) e MON-0021 (A-02), classe C. Toda confirmação de compra precisa de janela de toque ou posição diferente do botão de origem.

## 8. Lacunas

| Lacuna | Motivo | Como fechar |
|---|---|---|
| Intersticial e seu fechar em execução (`unk_7a677d85…`) | Terminar partidas exige tocar peças desenhadas no canvas; o cenário do REA só clica no centro de localizadores | Clique por coordenada no cenário, ou outra via aprovada por adendo |
| Tela de continuar em execução (`unk_2d066e5a…`) | Mesmo motivo | Idem |
| Invariância do gerador ao estado de monetização (`unk_92e26666…`) | Exige execução controlada em Node, fora do plano N3 | Adendo ao `00-seguranca.md` para rodar os módulos do build em Node com sessões pareadas |
| Tela sem vidas e recarga (`unk_c5746200…`) | Mesmo motivo do canvas, mais espera de 20 min | Idem, com relógio controlado |
| Lei e política de loja | Textos não consultados nesta sessão | Consulta com data registrada |

## Referências

| ID | Fonte |
|---|---|
| E1 | REA `analyze_javascript_application` sobre `alvos/encaixe-2/app` (N1): `ev_2a86923713d09deb339a9902d34977091bd82d57deb9b4ad02703d230839c5b3` (resumo `ev_1c124e63…`), mais leitura direta dos módulos |
| E2 | REA `capture_browser_scenario`, loja (N3): `ev_f5020eaf4adc476ff5436531e489f044b208f096da9dc5e2302f86bb82bc8f4b`; bruto em `saidas/encaixe-2/monetizacao/cap1-loja.json` |
| E3 | REA `capture_browser_scenario`, troca com anúncio (N3): `ev_0a9983bec1cab0319ae4e0cf5aae3212fc7826c85b5f54076dcb186342640e7b`; bruto e capturas de tela em `saidas/encaixe-2/monetizacao/cap2-*` |
| Bundle | `saidas/encaixe-2/evidence.json` (8 registros, 4 lacunas) |
