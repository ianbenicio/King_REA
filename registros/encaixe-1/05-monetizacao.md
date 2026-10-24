---
alvo: encaixe-1
jogo: Encaixe 8×8
versao_jogo: 1.0.0 (package.json)
sha256_alvo: b3af6d82432b797664a924d57ff98754c2f8a96a9fa54ddfa1ee0f297d3cff5d (conjunto; lista ordenada caminho:sha256, igual ao 00-seguranca.md)
plataforma: web
data: 2026-10-24
catalogo_versao: 3
publico_provavel: geral
children_likely: unknown
verificacao_execucao: observacao
---

# Monetização e padrões — Encaixe 8×8

<!-- Repositório público: só achados resumidos, parâmetros e trechos curtos. Capturas, DOM e metadados de rede ficam em saidas/encaixe-1/monetizacao/ (fora do git). -->

## Resumo

Modelo híbrido simulado: intersticial entre partidas, rewarded (trocar peças, continuar, ganhar vida), banner na tela de jogo e uma compra exposta na interface (remover anúncios, R$ 9,90); a loja interna tem mais dois produtos sem caminho na tela. Não há SDK real: um SDK simulado local, sem rede (estática e execução só viram 127.0.0.1). Padrões por classe: **A** MON-0001, 0002, 0003 (escopo parcial), 0004, 0008, 0036; **B** MON-0011, 0012 (inconclusivo); **C** MON-0033, 0022, 0021, 0027, 0032 e 0024 (dormente). Os que mais pesam: o gerador de peças lê a proximidade do intersticial (MON-0033, observado no código, não reproduzido, causalidade hipótese); o botão "Bônus grátis" abre um intersticial sem bônus, inclusive depois da compra de remover anúncios (MON-0022, reproduzido); o fechar do intersticial fica escondido 5 s e depois aparece como "×" com contraste 1,20:1 (MON-0021, reproduzido).

Combinação com o responsável (seção 0 da skill): escopo, níveis e execução vieram do pedido da sessão que abriu esta análise (tudo; N0–N3; execução N3 no navegador). O público não foi perguntado: `children_likely` fica `unknown`, que conta como sim.

## 1. Modelo de receita

| Fonte | Presente | Evidência | Observação |
|---|---|---|---|
| Intersticial | sim | `sessao.mjs` (fim de partida → agendador); `controle.mjs` (botão "Bônus grátis"); capturas A e B | Dois caminhos: o do agendador, com limites (A-08), e o do botão "Bônus grátis", sem limite nem bônus (A-02) |
| Rewarded | sim | `recompensas.mjs`, `sessao.mjs`; captura A (troca entregue) e C (fechado antes do fim, sem entrega) | Trocar peças (1 por partida), continuar (1 por partida), ganhar vida (até 3 por dia) |
| Banner | sim | `tela.mjs` (cena `jogando`); capturas A e C | "Anúncio · Blocos Mania: …", rodapé, não tocável; continua depois da compra (C) |
| Compras (consumíveis) | só no código | `loja.mjs`: pacote inicial (3 trocas, R$ 4,90) | Sem caminho na interface; é o produto da oferta relâmpago (A-06) |
| Compras (remover anúncios, passe, assinatura, desbloqueio, expansões) | sim | `loja.mjs`, `controle.mjs`; captura B | Remover anúncios R$ 9,90, com confirmação e restauração; tema visual R$ 3,90 só no código |
| Caixas pagas / gacha | não observada | — | Nenhum sorteio após compra |

## 2. SDKs de anúncio, mediação, analytics e configuração remota

| SDK | Função | Versão | Como detectado | Evidência |
|---|---|---|---|---|
| SDK simulado (`sdk-simulado.mjs`) | anúncios intersticial e rewarded, com roteiro de resultado (completo, fechado, indisponível, duplicado) e flag de personalização | — (código próprio do build) | leitura do código (N1) e `analyze_javascript_application` | `ev_ac561df5…`; nenhuma extração de requisição (`fetch`, WebSocket, http) no grafo estático |
| Configuração remota (`config.mjs`, `resolverConfig`) | aceita valores remotos para 5 parâmetros, só dentro de limites | — | leitura do código | Nenhum chamador na interface: `aplicarConfigRemota` não é usado pelo controle |

Nenhum SDK de terceiros, nenhum endereço externo. Execução: 38 requisições por cenário, todas para `http://127.0.0.1:8737` (capturas A, B e C).

## 3. Parâmetros de monetização

| Parâmetro | Valor local (padrão) | Valor efetivo observado | Estado da configuração | Onde | Evidência |
|---|---|---|---|---|---|
| Partidas entre intersticiais (mín.) | 2 | — | padrão local (remoto só aceita ≥ 2) | `config.json` → `config.mjs` | leitura |
| Intervalo mínimo entre anúncios | 60 s, conta qualquer tipo (rewarded também) | — | padrão local (remoto só aceita ≥ 60) | idem; `agendador.mjs` | leitura |
| Intersticiais por sessão (máx.) | 5 | — | padrão local (remoto só aceita 0–5) | idem | leitura |
| Carência inicial | 2 partidas (o 1º intersticial possível é no fim da 3ª) | — | padrão local (remoto só aceita ≥ 2) | idem | leitura |
| Troca com anúncio por partida | 1 | 1 (botão some após a troca) | valor efetivo observado | `config.json` | captura A, passo 10 |
| Continuações por partida | 1 | — | padrão local | `config.json` | leitura |
| Vidas: máximo, recarga | 5; 20 min por vida (remoto 20–40) | consumo de 1 vida ao iniciar ("Vidas: 4") | padrão local; consumo observado | `config.json`, `vidas.mjs` | captura A, passo 6 |
| Vida por anúncio por dia | 3 | — | padrão local | `config.json` | leitura |
| Fechar do intersticial | aparece aos 5000 ms | escondido em 1 s, visível em 5,5 s | valor efetivo observado | `tela.mjs` (`TEMPOS`) | captura A, passos 3–4 |
| Duração do rewarded | 5000 ms, fechar desde 0 ms | recompensa entregue após ~5,6 s; fechado em 1 s não entrega | valor efetivo observado | `tela.mjs`, `controle.mjs` | capturas A e C |
| Peso das peças grandes com "pressão" | ×3 | — | padrão local (não é parâmetro remoto) | `dificuldade.mjs` | leitura |
| Constante legada de intervalo | 5 s | — | padrão local, sem uso | `config.mjs` | leitura (código dormente) |

## 4. Achados

### Estados de um achado

Cada achado tem quatro estados independentes. Nenhum implica o outro.

| Estado | Valores | O que prova |
|---|---|---|
| **Código** | observada · não observada · inconclusiva | O mecanismo existe no build |
| **Execução** | reproduzido · não reproduzido · não testado | O comportamento aparece com o jogo rodando, nas condições registradas |
| **Causalidade** (sobre anúncio ou compra) | demonstrada no teste descrito · associação observada · hipótese | O mecanismo **causa** o efeito; só "demonstrada" com intervenção controlada sobre a variável |
| **Configuração** | padrão local · valor efetivo observado · remoto desconhecido | De onde vem o valor que vale |

Não observar não prova ausência. Correlação entre derrota e anúncio é "associação observada", não "demonstrada".

### Tabela

| Achado | ID do catálogo | Variante | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|
| A-01 | MON-0033 (C) | gerador triplica peças grandes na partida cujo fim torna o intersticial elegível | observada | não testado | hipótese | padrão local |
| A-02 | MON-0022 (C) | botão "Bônus grátis" abre intersticial, sem bônus, fora dos limites e depois da compra | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-03 | MON-0021 (C) | fechar do intersticial escondido 5 s, sem aviso, depois "×" com contraste 1,20:1 | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-04 | MON-0027 (C) | recusa de continuar: "Não, prefiro perder meu progresso" | observada | não testado | hipótese | padrão local |
| A-05 | MON-0009 (não cumpre) | continuar com anúncio: regras 1 e 3 cumpridas, regra 2 falha pelo texto (A-04) | observada | não testado | hipótese | padrão local |
| A-06 | MON-0024 (C) | "Oferta relâmpago! Termina em 15 minutos", prazo contado a partir da chamada | observada (dormente) | não testado | hipótese | padrão local |
| A-07 | MON-0032 (C) | SDK iniciado com personalização ligada, ignorando o consentimento recebido | observada | não testado | hipótese | padrão local |
| A-08 | MON-0002 (A) | intersticial no fim de partida com carência, intervalo, teto e remoto limitado | observada | não testado | hipótese | padrão local |
| A-09 | MON-0001 (A) | rewarded opcional: trocar peças, continuar, ganhar vida | observada | reproduzido | demonstrada no teste descrito | valor efetivo observado |
| A-10 | MON-0003 (A, escopo parcial) | remover anúncios tira só o intersticial do agendador; banner e "Bônus grátis" continuam | observada | reproduzido | demonstrada no teste descrito | padrão local |
| A-11 | MON-0025 (C) | compra sem confirmação | não observada | não reproduzido | hipótese | padrão local |
| A-12 | MON-0008 (A) | banner no rodapé, fora da área de jogo, rotulado "Anúncio" | observada | reproduzido | hipótese | padrão local |
| A-13 | MON-0011 (B) | 5 vidas, 1 por partida, recarga 20 min, +1 por anúncio até 3/dia | observada | reproduzido (consumo) | hipótese | padrão local |
| A-14 | MON-0012 (B) | sequência diária que zera ao faltar um dia; bônus calculado e nunca entregue | inconclusiva | não testado | hipótese | padrão local |
| A-15 | MON-0004 (A) | parte da dificuldade que lê só desempenho (ocupação, "derrotas" seguidas) | observada | não testado | hipótese | padrão local |
| A-16 | MON-0036 (A) / MON-0006 (A, falha) | tema visual de preço fixo (só código); loja sem preço na tela | observada | reproduzido (loja sem preço) | hipótese | padrão local |

Ambiente comum às execuções: Windows 10 (host), Chromium 145.0.7632.6 headless lançado pela CLI do REA (`capture-browser-scenario`), viewport 360×640, `pt-BR`, UTC, armazenamento vazio, semente da sessão 7 (`?semente=7`), servidor do build em `127.0.0.1:8737`, sem rede externa, sem progresso anterior, sem conta. Data: 2026-10-24. Capturas: A `ev_a7b97ff4…`, B `ev_00ddb138…`, C `ev_3de38e1b…` (arquivos em `saidas/encaixe-1/monetizacao/`).

### A-01 — MON-0033 Dificuldade ou sorte ligada a monetização

- **Pergunta:** o gerador de peças lê algum estado de anúncio ou de compra?
- **Variante:** ao iniciar a partida, a sessão calcula pressão = 1 quando não há compra de remover anúncios e (partidas desde o último intersticial + 1) ≥ partidas entre anúncios; senão 0. O gerador multiplica o fator das peças grandes (5 a 9 células) por 3 com pressão = 1, em todos os sorteios da partida (rodadas e troca com anúncio). A pressão não olha carência, intervalo nem teto: com o padrão (2), vale na 2ª partida, na 3ª e em toda partida que precede uma elegível. Probabilidade de peça grande por sorteio (pesos do código, em notação própria): tabuleiro vazio e sem derrotas, 10,0 % → 25,0 %; ocupação ≥ 50 %, 7,7 % → 20,0 %. O `config.json` declara como entradas da dificuldade só "ocupação" e "derrotas seguidas": a pressão é uma entrada não declarada.
- **Alvo:** 1.0.0, conjunto `b3af6d82…`; `src/sessao/sessao.mjs` (`iniciarPartida`), `src/nucleo/dificuldade.mjs` (`fatores`), `src/nucleo/jogo.mjs` (`sortear`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura do código e `analyze_javascript_application` (N1).
- **Evidência:** `ev_ac561df5…`; lacuna `unk_2052376f…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Ligação com mecânicas:** sem `03-mecanicas.md` para este alvo.
- **Limitações:** a captura por localizador clica só no centro dos elementos e as peças existem só no canvas: não dá para jogar uma partida até o fim. Os percentuais são derivados dos pesos, não medidos.
- **Próximos testes:** intervenção controlada com a mesma semente e as mesmas jogadas, mudando só a compra de remover anúncios (pressão 1 × 0 na 2ª partida) e comparando a rodada inicial. Exige cliques por coordenada no canvas ou adendo para executar os módulos do núcleo em Node.

### A-02 — MON-0022 Anúncio disfarçado

- **Pergunta:** o que acontece ao tocar em "Bônus grátis" na tela inicial?
- **Variante:** o botão, com a mesma aparência de "Nova partida" e "Loja", abre direto um intersticial de tela cheia ("Anúncio simulado.") e não entrega bônus nenhum. O caminho não passa pelo agendador (não conta para carência, intervalo nem teto) nem pela compra: depois de comprar remover anúncios, o mesmo toque abre o mesmo intersticial. Também não chama o SDK (é só a cena de anúncio da interface).
- **Alvo:** `interface/controle.mjs` (ação `abrir_bonus`), `src/interface/tela.mjs` (cena `inicio`).
- **Ambiente:** comum (acima).
- **Data e método de coleta:** 2026-10-24, leitura (N1) e execução no navegador (N3), capturas A (passos 2–5) e B (passos 6–8, após a compra).
- **Evidência:** `ev_ac561df5…`, `ev_a7b97ff4…`, `ev_00ddb138…`.
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (o toque, isolado, abre o anúncio; com e sem compra) · configuração padrão local.
- **Limitações:** o rótulo "Anúncio" aparece no anúncio; o disfarce está no botão que leva a ele. Também se aproxima de MON-0030 (promessa de bônus não entregue), que o catálogo restringe a rewarded.
- **Próximos testes:** nenhum necessário para o estado atual.

### A-03 — MON-0021 Botão de fechar enganoso

- **Pergunta:** quando e como o intersticial pode ser fechado?
- **Variante:** o fechar fica oculto e sem aceitar toque por 5 s, sem contador nem aviso (o rewarded, ao contrário, mostra "Fim do anúncio em N s" e tem "Fechar" desde 0 s). Depois aparece como "×" em `#DCE0E5` sobre `#F2F4F7`, contraste 1,20:1 (o "Fechar" do rewarded tem 11,89:1). A área de toque é 64×44 px, no canto superior direito, sem sobreposição com área clicável do anúncio (o corpo do anúncio não é tocável). Há uma classe CSS `fechar-discreto` (20×20 px, opacidade 0,3) que nenhum elemento usa.
- **Alvo:** `src/interface/tela.mjs` (`anuncio`, `TEMPOS`), `interface/estilo.css`.
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e captura A, passos 2 (oculto), 3 (oculto em ~1 s), 4 (visível em ~5,5 s), 5 (fechou).
- **Evidência:** `ev_a7b97ff4…`, `ev_00ddb138…`.
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (exposição mínima de 5 s, medida com esperas controladas) · configuração valor efetivo observado.
- **Limitações:** contraste calculado pela fórmula WCAG sobre as cores do DOM; nenhuma medição com pessoas.
- **Próximos testes:** nenhum para o estado atual; a classe dormente só pesa se for ligada numa versão futura.

### A-04 — MON-0027 Recusa com culpa

- **Pergunta:** que texto tem a opção de recusar o continuar com anúncio?
- **Variante:** "Continuar (assistir a um anúncio)" × "Não, prefiro perder meu progresso".
- **Alvo:** `src/monetizacao/recompensas.mjs` (`ofertaContinuar`), `src/interface/tela.mjs` (cena `oferta_continuar`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** a tela só aparece no fim de uma partida, que a captura não alcançou (lacuna `unk_9b60d0ab…`).
- **Próximos testes:** o mesmo de A-01 (jogar até o fim).

### A-05 — MON-0009 Continuar com anúncio, com limite

- **Pergunta:** a tela de continuar cumpre as três regras de MON-0009?
- **Variante:** (1) uma vez por partida — cumpre (limite 1, oferta só se continuações < 1); (2) recusa tão visível quanto aceitar — mesmo tamanho (328×48 px), mesma janela de toque (500 ms nos dois), cores diferentes (azul × cinza, ambas legíveis), mas texto de culpa: **falha** (A-04); (3) sem pressão de tempo — cumpre (prazo nulo). Há uma função `contagemRegressiva` sem uso, que na verdade conta o tempo decorrido da partida. Continuar esvazia as 2 linhas e as 2 colunas mais cheias.
- **Alvo:** `recompensas.mjs`, `tela.mjs`, `jogo.mjs` (`continuar`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** como A-04.
- **Próximos testes:** como A-04.

### A-06 — MON-0024 Urgência ou escassez falsa

- **Pergunta:** o prazo da oferta relâmpago é fixo ou relativo a quem a abre?
- **Variante:** "Oferta relâmpago! Termina em 15 minutos" para o pacote inicial (R$ 4,90); o fim é calculado como agora + 15 min a cada chamada, então reinicia sempre que a oferta é pedida. A sessão expõe `ofertaDoDia`, mas a interface não chama: código dormente.
- **Alvo:** `src/monetizacao/loja.mjs` (`ofertaRelampago`), `src/sessao/sessao.mjs` (`ofertaDoDia`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`.
- **Estados:** código observada · execução não testado (sem caminho na interface) · causalidade hipótese · configuração padrão local.
- **Limitações:** não se sabe se outra build liga essa oferta.
- **Próximos testes:** nenhum possível sem caminho na interface.

### A-07 — MON-0032 Rastreamento para anúncio sem consentimento

- **Pergunta:** o SDK de anúncio respeita o consentimento antes de inicializar?
- **Variante:** a sessão recebe o consentimento (a interface passa falso por padrão e não mostra diálogo), guarda numa variável que nada lê e inicializa o SDK com consentimento verdadeiro fixo; o SDK registra cada anúncio como personalizado. Como o SDK é simulado e não há rede, não há coleta real: o padrão está na decisão de personalizar sem consentimento.
- **Alvo:** `src/sessao/sessao.mjs` (`criarSessao`), `src/monetizacao/sdk-simulado.mjs`, `interface/controle.mjs`.
- **Ambiente:** estático; na execução, só metadados de rede (loopback).
- **Data e método de coleta:** 2026-10-24, leitura (N1); capturas A–C para a rede.
- **Evidência:** `ev_ac561df5…`; lacuna `unk_7c76c02e…`.
- **Estados:** código observada · execução não testado (o registro do SDK não aparece na página) · causalidade hipótese · configuração padrão local.
- **Limitações:** inicializar não prova coleta; aqui não há o que coletar nem para onde enviar.
- **Próximos testes:** ler o registro do SDK em execução (exige adendo de nível para observar o runtime JavaScript).

### A-08 — MON-0002 Intersticial em pausa natural com limite de frequência

- **Pergunta:** quando o intersticial do agendador dispara?
- **Variante:** só no fim de partida, se: sem compra; partidas terminadas > carência (2); partidas desde o último ≥ 2; exibidos na sessão < 5; e ≥ 60 s desde o último anúncio de qualquer tipo. Valores remotos só são aceitos se forem mais restritivos. O intersticial aparece em seguida ao último toque da partida, mas o corpo não é tocável e o fechar só aceita toque após 5 s: não caracteriza MON-0031.
- **Alvo:** `src/monetizacao/agendador.mjs`, `config.mjs`, `sessao.mjs` (`encerrarPartida`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`; lacuna `unk_9b60d0ab…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** o botão "Bônus grátis" (A-02) contorna todos esses limites.
- **Próximos testes:** oráculo: prever "1º intersticial no fim da 3ª partida, se ≥ 60 s desde o início" e comparar jogando (mesma limitação de A-01).

### A-09 — MON-0001 Anúncio com recompensa opcional

- **Pergunta:** o rewarded informa a recompensa antes, depende de toque e entrega o prometido?
- **Variante:** troca de peças ("Trocar 3 peças (assistir a um anúncio)", com "Agora não" do mesmo tamanho), continuar e ganhar vida. A recompensa é anunciada na oferta e no anúncio, entregue ao fim (5 s); fechar antes não entrega e não penaliza (o botão de troca continua disponível). A entrega é protegida contra duplicidade (o resultado "duplicado" do SDK não entrega duas vezes): MON-0030 não observado.
- **Alvo:** `recompensas.mjs`, `sessao.mjs`, `controle.mjs`.
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e capturas A (passos 7–10: peças trocadas de "quadrado 2x2, tê, quadrado 2x2" para "canto de 3 (d), quadrado 2x2, canto de 3 (a)") e C (passos 8–11: fechado em ~1 s, peças iguais, botão de troca mantido).
- **Evidência:** `ev_a7b97ff4…`, `ev_3de38e1b…`.
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (mesma semente, só muda assistir até o fim × fechar cedo) · configuração valor efetivo observado.
- **Limitações:** continuar e ganhar vida não foram exercitados.
- **Próximos testes:** como A-04.

### A-10 — MON-0003 Compra para remover anúncios

- **Pergunta:** o que a compra de remover anúncios desliga, e há confirmação e restauração?
- **Variante:** tela de produto → tela de confirmação ("Confirmar compra" / "Cancelar") → "Anúncios entre partidas removidos."; "Restaurar compras" presente. Desliga o intersticial do agendador e a pressão de A-01. **Não** desliga o banner (captura C, passo 6) nem o intersticial de "Bônus grátis" (captura B, passos 6–8). O texto promete só "os anúncios entre partidas", o que é exato, mas o critério do catálogo pede que a compra remova os anúncios forçados.
- **Alvo:** `loja.mjs`, `controle.mjs`, `tela.mjs`.
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e capturas B e C.
- **Evidência:** `ev_00ddb138…`, `ev_3de38e1b…`.
- **Estados:** código observada · execução reproduzido · causalidade demonstrada no teste descrito (depois da compra, o banner e o anúncio do bônus continuam) · configuração padrão local.
- **Limitações:** compra e restauração simuladas (lista local da "plataforma").
- **Próximos testes:** nenhum para o estado atual.

### A-11 — MON-0025 Compra sem confirmação

- **Pergunta:** a cobrança pode disparar sem confirmação?
- **Variante:** não: a função de compra recusa qualquer chamada sem confirmação explícita, e a interface só a chama a partir da tela de confirmação.
- **Alvo:** `loja.mjs` (`comprar`), `controle.mjs`.
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e captura B (passos 2–4).
- **Evidência:** `ev_00ddb138…`.
- **Estados:** código não observada · execução não reproduzido · causalidade hipótese · configuração padrão local.
- **Limitações:** não observar não prova ausência em outros caminhos.
- **Próximos testes:** nenhum.

### A-12 — MON-0008 Banner fora da área de jogo

- **Pergunta:** o banner cobre controles ou conteúdo?
- **Variante:** rodapé em y 592–632 px; o último controle termina em 576 px; texto "Anúncio · Blocos Mania: níveis novos toda semana" (promoção cruzada simulada, não criativo de terceiros); não tocável.
- **Alvo:** `tela.mjs` (cena `jogando`).
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, capturas A (passo 6) e C (passo 6).
- **Evidência:** `ev_a7b97ff4…`, `ev_3de38e1b…`.
- **Estados:** código observada · execução reproduzido · causalidade hipótese · configuração padrão local.
- **Limitações:** só a viewport 360×640.
- **Próximos testes:** nenhum.

### A-13 — MON-0011 Energia ou vidas com recarga por tempo

- **Pergunta:** jogar consome um recurso que recarrega com o tempo, e como ele se recupera?
- **Variante:** 5 vidas; cada partida consome 1; recarga de 1 vida a cada 20 min (remoto pode subir até 40); sem vidas, oferta de 1 vida por anúncio (até 3 por dia, "Agora não" do mesmo tamanho); nenhuma venda de vidas.
- **Alvo:** `vidas.mjs`, `sessao.mjs`, `tela.mjs` (cena `sem_vidas`).
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e captura A (passo 6: "Vidas: 4").
- **Evidência:** `ev_a7b97ff4…`.
- **Estados:** código observada · execução reproduzido (consumo; tela sem vidas não testada) · causalidade hipótese · configuração padrão local.
- **Limitações:** chegar a 0 vidas exige 5 partidas.
- **Próximos testes:** como A-04.

### A-14 — MON-0012 Jogar com hora marcada

- **Pergunta:** há sequência diária que se perde?
- **Variante:** contador de dias seguidos que volta a 1 se o jogador falta um dia; calcula um bônus de trocas (dias − 1, máximo 3) que nada no build lê nem entrega, e não aparece na interface.
- **Alvo:** `sequencia.mjs`, `sessao.mjs`.
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`.
- **Estados:** código inconclusiva (mecanismo presente, sem efeito no jogo) · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** pode ser ligado em outra build.
- **Próximos testes:** nenhum possível sem caminho na interface.

### A-15 — MON-0004 Dificuldade dinâmica para manter o fluxo

- **Pergunta:** que entradas de desempenho a dificuldade usa?
- **Variante:** ocupação ≥ 50 % → peças pequenas ×1,5; ≥ 70 % → ×2; 2 ou mais "derrotas" seguidas → peças grandes ×0,5. "Derrota" é fazer menos pontos que a partida anterior. Como a mesma função também lê a pressão de anúncio (A-01), o conjunto é MON-0033; esta linha registra só a parte de desempenho.
- **Alvo:** `dificuldade.mjs`, `sessao.mjs` (`encerrarPartida`).
- **Ambiente:** estático.
- **Data e método de coleta:** 2026-10-24, leitura (N1).
- **Evidência:** `ev_ac561df5…`.
- **Estados:** código observada · execução não testado · causalidade hipótese · configuração padrão local.
- **Limitações:** como A-01.
- **Próximos testes:** como A-01.

### A-16 — MON-0036 Cosméticos de preço fixo / MON-0006 Loja transparente

- **Pergunta:** a loja mostra o preço em moeda real antes da compra?
- **Variante:** os produtos têm preço em reais no código (pacote inicial R$ 4,90, tema noturno "só visual" R$ 3,90 — MON-0036 —, remover anúncios R$ 9,90); não há moeda virtual. Mas a interface só expõe remover anúncios e não mostra o preço nem na tela do produto nem na de confirmação: falha o critério de MON-0006.
- **Alvo:** `loja.mjs`, `tela.mjs` (cena `loja`).
- **Ambiente:** comum.
- **Data e método de coleta:** 2026-10-24, leitura (N1) e captura B (passos 2–3).
- **Evidência:** `ev_00ddb138…`.
- **Estados:** código observada · execução reproduzido (loja sem preço) · causalidade hipótese · configuração padrão local.
- **Limitações:** compra simulada; numa loja real a plataforma mostraria o preço na confirmação dela.
- **Próximos testes:** nenhum.

## 5. Padrões fora do catálogo

| Proposta | Descrição | Classe sugerida | Evidência |
|---|---|---|---|
| Preço omitido na tela de compra | Produto pago oferecido sem preço em nenhuma tela do app antes da confirmação, mesmo sem moeda virtual (MON-0023 cobre só moeda virtual) | C (ou B se a confirmação da plataforma sempre mostrar o preço) | A-16, captura B |
| Remoção de anúncios com escopo menor que o nome | "Remover anúncios" mantém banner e outros anúncios forçados; hoje cabe como variante de MON-0003 | atributo de MON-0003 (escopo) | A-10 |

Só entram no catálogo com aprovação do responsável.

## 6. Conformidade

| Fonte | Referência e data consultada | Jurisdição | Situação | Achados |
|---|---|---|---|---|
| Política interna | docs/catalogo-monetizacao.md v3 (2026-10-24) | — | Seis padrões de classe C presentes (um dormente); MON-0003 e MON-0009 abaixo do critério de A | A-01, A-02, A-03, A-04, A-06, A-07; A-05, A-10, A-16 |
| Lei | ECA Digital (Lei 15.211/2025, art. 20), CDC, LGPD — texto não consultado nesta sessão | Brasil | A avaliar; `children_likely: unknown` conta como acesso provável por menores | A-01, A-02, A-07 |
| Lei / orientação | Princípios CPC sobre moedas virtuais — não consultados nesta sessão | UE | A avaliar; sem moeda virtual | A-06, A-16 |
| Loja e rede de anúncios | Google Play, App Store, AdMob — não consultadas nesta sessão | — | A avaliar | A-02, A-03, A-07 |

## 7. Aproveitamento em projeto nosso

| ID | Parâmetros sugeridos (com unidade) | Para B: justificativa e limites | Restrição de público |
|---|---|---|---|
| MON-0001 | `troca_com_anuncio_max_por_partida: 1`, `vida_por_anuncio_max_por_dia: 3` | — | permitido |
| MON-0002 | `partidas_entre_anuncios: 2`, `intervalo_minimo_s: 60`, `max_por_sessao: 5`, `carencia_partidas: 2` | — | permitido |
| MON-0003 | produto único; deve desligar todo anúncio forçado (banner incluso) | — | permitido |
| MON-0008 | banner em faixa própria abaixo do último controle | — | permitido |
| MON-0009 | `continuacoes_max_por_partida: 1`, recusa com texto neutro ("Encerrar partida"), sem prazo | — | permitido |
| MON-0036 | itens só visuais com preço exibido na tela | — | permitido |
| MON-0011 | `vidas_max: 5`, `recarga_min: 20` | B: justificativa e limites a definir com o responsável (recarga grátis, sem venda de vidas) | permitido |

## 8. Lacunas

| Lacuna | Motivo | Como fechar |
|---|---|---|
| Causalidade de A-01 | Captura só clica no centro dos elementos; peças só no canvas; partida não chega ao fim | Cliques por coordenada no canvas, ou adendo para execução controlada dos módulos do núcleo (`unk_2052376f…`) |
| Personalização em execução (A-07) | Registro do SDK não visível na página | Adendo para observar o runtime JavaScript (`unk_7c76c02e…`) |
| Fluxos de fim de partida, sem vidas, oferta relâmpago, sequência | Mesmo motivo de A-01; os dois últimos sem caminho na interface | `unk_9b60d0ab…` |
| Provedor de navegador do MCP | `capture_browser_scenario` pelo MCP falhou com "Browser scenario provider is closing"; as capturas usaram a CLI do REA com o mesmo esquema | Investigar o provedor no servidor MCP |

## Referências

| ID | Fonte |
|---|---|
| CAT | docs/catalogo-monetizacao.md v3 |
| SEG | registros/encaixe-1/00-seguranca.md |
| EV | `saidas/encaixe-1/evidence.json` (sessão MCP: análise estática e lacunas); `saidas/encaixe-1/monetizacao/captura-{min,a,b,c}.json` (CLI) |
