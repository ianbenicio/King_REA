---
titulo: Catálogo de padrões de monetização e dark patterns
versao: 1
data: 2026-10-20
status: rascunho — classificação aguarda revisão do responsável
---

# Catálogo de padrões de monetização

Fonte única dos IDs usados pelo `protocolo-monetizacao` (identificação nos alvos) e pela checagem dos projetos em `reimplementacoes/` (`scripts/monetizacao/verificar-perfis.mjs`). Pesquisa de base: `docs/pesquisa-monetizacao-dark-patterns.md`.

## Classes

| Classe | Significado | Em projeto nosso |
|---|---|---|
| **A** | Legítima: o jogador escolhe, sabe o custo e a recompensa | Configurável no perfil de monetização |
| **B** | Zona cinzenta: pressão de tempo, social ou de progressão, sem enganar | Só com justificativa, limites e aprovação registrados no perfil |
| **C** | Enganosa ou proibida: engana, esconde custo, explora menores ou viola lei/política de loja | **Nunca.** Bloqueada pela checagem; serve só para detectar e auditar alvos |

**Infantojuvenil:** jogo voltado a menores ou com acesso provável por eles (critério do ECA Digital, Lei 15.211/2025). Na dúvida, tratar como infantojuvenil. Padrão marcado `Infantojuvenil: proibido` é bloqueado nesses projetos, mesmo sendo A ou B.

## Formato (lido pela checagem)

Cada padrão é um título `### MON-<classe>-<NN> — <nome>` seguido de itens. A checagem lê o título e a linha `Infantojuvenil`. Padrão novo: próximo número livre da classe; mudar a classe de um padrão existente exige aprovação do responsável (mesma regra do `00-seguranca.md`).

Referências: [Z13] Zagal, Björk e Lewis 2013 · [UIG] UIGuard 2023 · [ADS] AdsDP 2025 · [FTC] FTC × Epic 2022 · [CPC] princípios CPC sobre moedas virtuais 2025 · [ECA] Lei 15.211/2025 · [LOJA] políticas do Google Play, App Store e AdMob · [IND] material da indústria (Unity, ironSource). Links no documento de pesquisa.

---

## Classe A — legítima

### MON-A-01 — Anúncio com recompensa opcional
- **Descrição:** o jogador escolhe assistir a um anúncio em troca de recompensa informada antes (moeda, item, dica).
- **Sinais:** botão com ícone de vídeo e recompensa visível; chamada de *rewarded* só após toque do jogador; callback de recompensa no fim do vídeo.
- **Parâmetros típicos:** recompensa por visualização, limite diário.
- **Infantojuvenil:** permitido
- **Referências:** [IND]

### MON-A-02 — Intersticial em pausa natural com limite de frequência
- **Descrição:** anúncio de tela cheia só entre partidas ou fases, com intervalo mínimo e limite por sessão.
- **Sinais:** chamada de intersticial no fim de fase; constantes ou chaves de remote config de intervalo (`interstitial_interval`, `ad_cooldown`), contador por sessão.
- **Parâmetros típicos:** intervalo mínimo (s), fases entre anúncios, máximo por sessão, carência inicial (sem anúncio nas primeiras partidas).
- **Infantojuvenil:** permitido
- **Referências:** [IND]

### MON-A-03 — Compra para remover anúncios
- **Descrição:** compra única que remove anúncios forçados, com preço em moeda real e escopo claro (rewarded continua opcional).
- **Sinais:** produto não consumível na loja; flag local que desliga intersticial e banner.
- **Infantojuvenil:** permitido
- **Referências:** [IND]

### MON-A-04 — Dificuldade dinâmica para manter o fluxo
- **Descrição:** a dificuldade se ajusta ao desempenho do jogador, sem relação com anúncios, ofertas ou gasto.
- **Sinais:** função de dificuldade cujas entradas são só desempenho (acertos, derrotas, tempo); nenhuma leitura de estado de monetização.
- **Infantojuvenil:** permitido
- **Referências:** [Z13], patentes EA (contraexemplo)

### MON-A-05 — Recompensa diária sem punição por ausência
- **Descrição:** bônus por entrar no dia, que não se perde nem regride quando o jogador falta.
- **Sinais:** calendário de recompensas que avança só quando o jogador entra.
- **Infantojuvenil:** permitido
- **Referências:** [Z13]

### MON-A-06 — Loja transparente
- **Descrição:** cada item mostra o preço em moeda real; no máximo uma moeda virtual; pacotes compatíveis com os preços dos itens (sem sobra forçada).
- **Sinais:** preço local exibido junto da moeda virtual; tabela de pacotes × preços sem resto.
- **Infantojuvenil:** permitido
- **Referências:** [CPC]

### MON-A-07 — Passe ou assinatura com conteúdo listado
- **Descrição:** passe de temporada ou assinatura com o que entrega listado antes da compra, renovação informada e cancelamento simples.
- **Sinais:** tela de passe com recompensas visíveis; produto de assinatura com link de gerenciamento.
- **Infantojuvenil:** permitido
- **Referências:** [LOJA]

### MON-A-08 — Banner fora da área de jogo
- **Descrição:** banner em área reservada, sem cobrir controles nem conteúdo.
- **Sinais:** layout com área própria para banner; nenhum controle do jogo sob ela.
- **Infantojuvenil:** permitido
- **Referências:** [LOJA]

### MON-A-09 — Continuar com anúncio, com limite
- **Descrição:** após a derrota, o jogador pode continuar assistindo a um anúncio, com limite por partida (ex.: uma vez).
- **Sinais:** tela de derrota com opção de continuar e opção clara de recusar; contador por partida.
- **Infantojuvenil:** permitido
- **Referências:** [IND]

---

## Classe B — zona cinzenta

### MON-B-01 — Energia ou vidas com recarga por tempo
- **Descrição:** jogar consome energia que recarrega com o tempo; anúncio ou compra recarrega na hora.
- **Sinais:** recurso com máximo e regeneração por relógio; oferta de recarga quando zera.
- **Infantojuvenil:** permitido
- **Referências:** [Z13]

### MON-B-02 — Jogar com hora marcada
- **Descrição:** eventos, sequências diárias ou colheitas que se perdem se o jogador não voltar no horário.
- **Sinais:** sequência (*streak*) que zera; recompensa que expira; notificações agendadas.
- **Infantojuvenil:** proibido
- **Referências:** [Z13]

### MON-B-03 — Pagar ou assistir para pular espera
- **Descrição:** temporizadores de construção, baú ou fila que podem ser pulados com moeda, compra ou anúncio.
- **Sinais:** temporizador com botão de aceleração pago.
- **Infantojuvenil:** permitido
- **Referências:** [Z13]

### MON-B-04 — Progressão desacelerada para vender atalho
- **Descrição:** curva de XP, drop ou custo calibrada para que o caminho gratuito seja muito mais lento que o pago.
- **Sinais:** razão entre ganho gratuito e custo cresce em degraus; atalho pago oferecido no ponto de atrito.
- **Infantojuvenil:** proibido
- **Referências:** [Z13]

### MON-B-05 — Dificuldade ligada a monetização
- **Descrição:** a dificuldade ou a sorte muda conforme o estado de monetização (perto de oferta ou anúncio, histórico de gasto), ou induz quase-vitórias antes de oferecer continuar.
- **Sinais:** função de dificuldade ou gerador de peças/drops que lê contadores de anúncio, oferta ou gasto; probabilidade diferente na partida que precede uma oferta.
- **Infantojuvenil:** proibido
- **Referências:** patentes EA, [Z13]
- **Nota:** se escondido do jogador e usado para vender, tende a C; manter em B exige transparência no perfil.

### MON-B-06 — Oferta com prazo real
- **Descrição:** oferta por tempo limitado em que o prazo e o estoque são verdadeiros.
- **Sinais:** contagem regressiva baseada em data fixa do servidor; mesma oferta não reaparece logo em seguida.
- **Infantojuvenil:** proibido
- **Referências:** [CPC]

### MON-B-07 — Várias moedas virtuais
- **Descrição:** mais de uma moeda, ou conversões entre moedas, dificultando saber o custo real.
- **Sinais:** duas ou mais moedas na loja; tabelas de câmbio internas.
- **Infantojuvenil:** proibido
- **Referências:** [CPC]

### MON-B-08 — Recompensa por convite ou ação social
- **Descrição:** recompensas por convidar amigos, compartilhar ou depender de outros jogadores.
- **Sinais:** códigos de convite; recompensa por compartilhamento; ajuda entre jogadores com prazo.
- **Infantojuvenil:** proibido
- **Referências:** [Z13]

### MON-B-09 — Ofertas personalizadas por perfil de gasto
- **Descrição:** preço, pacote ou momento da oferta escolhidos pelo histórico de gasto ou previsão de propensão a pagar.
- **Sinais:** segmentos de jogador em remote config; ofertas com preços diferentes por segmento.
- **Infantojuvenil:** proibido
- **Referências:** [CPC]

### MON-B-10 — Caixa de recompensa paga com probabilidades publicadas
- **Descrição:** gacha ou caixa paga com resultado aleatório, probabilidades exibidas e verdadeiras.
- **Sinais:** sorteio ponderado após compra; tela de probabilidades acessível antes de pagar.
- **Infantojuvenil:** proibido
- **Referências:** [ECA], [LOJA]

### MON-B-11 — Notificações de reengajamento
- **Descrição:** notificações push para trazer o jogador de volta (energia cheia, evento, oferta).
- **Sinais:** agendamento de notificações locais; tópicos de push.
- **Infantojuvenil:** proibido
- **Referências:** [ECA]

### MON-B-12 — Pareamento ou conteúdo otimizado por engajamento
- **Descrição:** adversários, níveis ou recompensas escolhidos para maximizar retenção ou gasto, e não equilíbrio.
- **Sinais:** entradas de risco de abandono ou gasto no pareamento ou na seleção de nível.
- **Infantojuvenil:** proibido
- **Referências:** patentes EA

---

## Classe C — enganosa ou proibida (só detectar)

### MON-C-01 — Botão de fechar enganoso
- **Descrição:** fechar pequeno demais, escondido, com atraso não informado, ou cuja área de toque abre a loja ou o anúncio.
- **Sinais:** botão de fechar com área de toque mínima; área clicável do anúncio sobrepondo o fechar; fechar que aparece em posição variável.
- **Referências:** [UIG], [ADS], [LOJA]

### MON-C-02 — Anúncio disfarçado
- **Descrição:** anúncio com aparência de conteúdo, botão do jogo ou mensagem do sistema.
- **Sinais:** anúncio nativo sem rótulo "anúncio"; criativo que imita a UI do jogo.
- **Referências:** [UIG], [ADS]

### MON-C-03 — Preço escondido em moeda virtual
- **Descrição:** itens vendidos só em moeda virtual, sem preço em moeda real em nenhum ponto da compra.
- **Sinais:** loja sem preço local; conversão moeda → dinheiro não exibida.
- **Referências:** [CPC]

### MON-C-04 — Urgência ou escassez falsa
- **Descrição:** contador que reinicia, "últimas unidades" ou "oferta única" que não são verdadeiros.
- **Sinais:** prazo calculado a partir da abertura da tela; oferta "única" recorrente.
- **Referências:** [CPC], [UIG]

### MON-C-05 — Compra sem confirmação
- **Descrição:** cobrança com um toque, cartão salvo por padrão ou compra que dispara sem tela de confirmação.
- **Sinais:** fluxo de cobrança chamado direto do botão; ausência de diálogo de confirmação.
- **Referências:** [FTC]

### MON-C-06 — Caixa paga em jogo infantojuvenil ou com probabilidades ocultas
- **Descrição:** loot box ou gacha pago em jogo de acesso provável por menores, ou em qualquer jogo sem probabilidades verdadeiras publicadas.
- **Sinais:** sorteio ponderado após compra sem tela de probabilidades; probabilidades exibidas diferentes das do código ou dados.
- **Referências:** [ECA], [LOJA]

### MON-C-07 — Recusa com culpa
- **Descrição:** botão de recusar com texto que constrange ("Não, não quero ajuda").
- **Sinais:** strings de recusa negativas ou ofensivas em telas de oferta.
- **Referências:** [UIG]

### MON-C-08 — Cancelamento obstruído
- **Descrição:** assinatura ou renovação difícil de cancelar, ou cancelamento escondido.
- **Sinais:** nenhum caminho de cancelamento no jogo; renovação não informada.
- **Referências:** [FTC], [LOJA]

### MON-C-09 — Pressão sobre crianças
- **Descrição:** apelo direto a menores para comprar ou pedir aos pais, ou personagem que "sofre" se o jogador não pagar.
- **Sinais:** textos de oferta que chamam o jogador a comprar "agora" ou a pedir a um adulto.
- **Referências:** [CPC], [ECA]

### MON-C-10 — Recompensa não entregue
- **Descrição:** anúncio com recompensa que não entrega o prometido, ou que exige mais visualizações do que o anunciado.
- **Sinais:** callback de recompensa com condição extra; recompensa menor que a exibida.
- **Referências:** [ADS], [LOJA]

### MON-C-11 — Anúncio em toque acidental
- **Descrição:** anúncio que aparece onde o jogador está tocando ou durante a jogabilidade, induzindo clique acidental.
- **Sinais:** intersticial disparado no meio da partida ou no mesmo ponto de um botão do jogo.
- **Referências:** [LOJA], [ADS]

### MON-C-12 — Rastreamento para anúncio sem consentimento
- **Descrição:** coleta de identificadores ou dados para segmentação de anúncios sem consentimento válido.
- **Sinais:** SDK de anúncio inicializado antes do consentimento; identificador de publicidade lido sem diálogo de consentimento.
- **Referências:** [LOJA], LGPD
