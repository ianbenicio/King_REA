---
titulo: Catálogo de padrões de monetização e dark patterns
versao: 3
data: 2026-10-20
status: rascunho — classes de MON-0009, MON-0010, MON-0018 e MON-0033 revistas pelo responsável (2026-10-20); as demais aguardam revisão
---

# Catálogo de padrões de monetização

Fonte única dos IDs usados pelo `protocolo-monetizacao` (identificação nos alvos) e pela checagem dos projetos em `reimplementacoes/` (`scripts/monetizacao/verificar-perfis.mjs`). Pesquisa de base: `docs/pesquisa-monetizacao-dark-patterns.md`.

## Identidade e classe

- **ID estável** (`MON-NNNN`): identifica o mecanismo e nunca muda nem é reaproveitado. A ordem dos números não tem significado.
- **Classe** (A, B, C): é a política atual para os nossos projetos, um atributo do padrão. Mudar a classe não muda o ID; registra-se em "Histórico".
- **Aliases:** IDs antigos (v1 e v2, formato `MON-<classe>-NN`) continuam resolvendo para o ID estável. A checagem aceita alias com aviso para migrar.

| Classe | Significado | Em projeto nosso |
|---|---|---|
| **A** | Legítima: o jogador escolhe, sabe o custo e a recompensa | Configurável no perfil de monetização |
| **B** | Zona cinzenta: pressão de tempo, social ou de progressão, sem enganar | Só com justificativa, limites e aprovação do perfil |
| **C** | Enganosa ou proibida: engana, esconde custo, explora menores ou viola lei/política de loja | **Nunca.** Bloqueada pela checagem; serve só para detectar e auditar alvos |

A classe é política interna. Um padrão pode ser C aqui sem ser ilegal; o relatório do alvo separa política interna, lei e política de loja (seção de conformidade do modelo 05).

**Menores:** vale o critério do ECA Digital (Lei 15.211/2025, art. 20): jogo voltado a menores **ou de acesso provável** por eles. O perfil registra isso em `children_likely` (`true`, `false` ou `"unknown"`, com fundamento); `"unknown"` conta como `true`. O rótulo comercial (`publico`) não decide sozinho.
- `Infantojuvenil: proibido` → bloqueado quando há menores prováveis.
- `Público: somente adulto` → exige `publico: adulto` **e** `children_likely: false`.

## Formato (lido pela checagem)

Cada padrão: título `### MON-NNNN — <nome>` e os itens `Classe` (obrigatório), `Infantojuvenil` (obrigatório em A e B), `Público` (opcional) e `Aliases` (opcional). Padrão novo: próximo número livre. Mudar a classe de um padrão exige aprovação do responsável (mesma regra do `00-seguranca.md`).

Referências: [Z13] Zagal, Björk e Lewis 2013 · [UIG] UIGuard 2023 · [ADS] AdsDP 2025 · [FTC] FTC × Epic 2022 · [CPC] princípios CPC sobre moedas virtuais 2025 · [ECA] Lei 15.211/2025 · [LOJA] políticas do Google Play, App Store e AdMob · [IND] material da indústria (Unity, ironSource, AdMob) · [EOMM] Chen et al. 2017. Links no documento de pesquisa.

---

## Classe A — legítima

### MON-0001 — Anúncio com recompensa opcional
- **Classe:** A
- **Descrição:** o jogador escolhe assistir a um anúncio em troca de recompensa. Critérios verificáveis: ação e recompensa informadas antes; adesão explícita do jogador (toque dedicado); recompensa entregue como prometido; recusar ou pular não prejudica o uso normal do jogo.
- **Sinais:** botão com ícone de vídeo e recompensa visível; chamada de *rewarded* só após toque do jogador; callback de recompensa no fim do vídeo; nenhum bloqueio ou penalidade no caminho de recusa.
- **Parâmetros típicos:** recompensa por visualização, limite diário.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-01
- **Referências:** [IND], [LOJA]

### MON-0002 — Intersticial em pausa natural com limite de frequência
- **Classe:** A
- **Descrição:** anúncio de tela cheia só entre partidas ou fases, com intervalo mínimo e limite por sessão.
- **Sinais:** chamada de intersticial no fim de fase; constantes ou chaves de remote config de intervalo (`interstitial_interval`, `ad_cooldown`), contador por sessão. A chave sozinha não prova o valor aplicado.
- **Parâmetros típicos:** intervalo mínimo (s), fases entre anúncios, máximo por sessão, carência inicial.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-02
- **Referências:** [IND]

### MON-0003 — Compra para remover anúncios
- **Classe:** A
- **Descrição:** compra única que remove anúncios forçados, com preço em moeda real, escopo claro (rewarded continua opcional) e restauração da compra.
- **Sinais:** produto não consumível na loja; flag local que desliga intersticial e banner; caminho de restauração.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-03
- **Referências:** [IND]

### MON-0004 — Dificuldade dinâmica para manter o fluxo
- **Classe:** A
- **Descrição:** a dificuldade se ajusta ao desempenho do jogador, sem relação com anúncios, ofertas ou gasto. Se ler estado de monetização, é MON-0033.
- **Sinais:** função de dificuldade cujas entradas são só desempenho (acertos, derrotas, tempo); nenhuma leitura de estado de monetização.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-04
- **Referências:** [Z13], patentes EA (contraexemplo)

### MON-0005 — Recompensa diária sem punição por ausência
- **Classe:** A
- **Descrição:** bônus por entrar no dia, que não se perde nem regride quando o jogador falta.
- **Sinais:** calendário de recompensas que avança só quando o jogador entra.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-05
- **Referências:** [Z13]

### MON-0006 — Loja transparente
- **Classe:** A
- **Descrição:** cada item mostra o preço em moeda real; no máximo uma moeda virtual; pacotes compatíveis com os preços dos itens (sem sobra forçada).
- **Sinais:** preço local exibido junto da moeda virtual; tabela de pacotes × preços sem resto.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-06
- **Referências:** [CPC]

### MON-0007 — Passe ou assinatura com conteúdo listado
- **Classe:** A
- **Descrição:** passe de temporada ou assinatura com o que entrega listado antes da compra, renovação informada e cancelamento simples.
- **Sinais:** tela de passe com recompensas visíveis; produto de assinatura com link de gerenciamento. O cancelamento pode estar na loja da plataforma, não no app: verificar o fluxo da plataforma antes de concluir.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-07
- **Referências:** [LOJA]

### MON-0008 — Banner fora da área de jogo
- **Classe:** A
- **Descrição:** banner em área reservada, sem cobrir controles nem conteúdo.
- **Sinais:** layout com área própria para banner; nenhum controle do jogo sob ela.
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-08
- **Referências:** [LOJA]

### MON-0009 — Continuar com anúncio, com limite
- **Classe:** A
- **Descrição:** após a derrota, o jogador pode continuar assistindo a um anúncio. Só é A se cumprir as três regras: (1) no máximo uma vez por partida; (2) recusar é tão visível e fácil quanto aceitar (mesmo tamanho e destaque, sem texto de culpa); (3) sem contagem regressiva ou outra pressão de tempo na decisão. Faltando qualquer regra, deixa de ser A: pressão de tempo cai em MON-0024, recusa com culpa em MON-0027.
- **Sinais:** tela de derrota com opção de continuar e opção de recusar; contador por partida; ausência de temporizador na tela.
- **Parâmetros típicos:** continuações por partida (máximo 1).
- **Infantojuvenil:** permitido
- **Aliases:** MON-A-09
- **Referências:** [IND], [Z13]
- **Histórico:** v2 — mantida em A com as três regras (revisão do responsável).

### MON-0010 — Oferta com prazo real
- **Classe:** A
- **Descrição:** oferta por tempo limitado em que o prazo e o estoque são verdadeiros: data fixa, igual para todos, e a mesma oferta não reaparece logo em seguida. Prazo ou estoque falso é MON-0024.
- **Sinais:** contagem regressiva baseada em data fixa do servidor; histórico de ofertas sem repetição imediata.
- **Infantojuvenil:** proibido
- **Aliases:** MON-A-10, MON-B-06
- **Referências:** [CPC]
- **Histórico:** v2 — B → A (revisão do responsável).

### MON-0034 — Compra única ou demo com desbloqueio
- **Classe:** A
- **Descrição:** o jogo completo é vendido por preço único, ou uma demo gratuita libera o jogo completo com uma compra, com o escopo de cada versão informado antes.
- **Sinais:** produto não consumível de desbloqueio; tela que descreve o que a versão completa inclui.
- **Infantojuvenil:** permitido
- **Referências:** [LOJA]

### MON-0035 — Expansões ou pacotes de conteúdo
- **Classe:** A
- **Descrição:** fases, capítulos ou modos adicionais vendidos à parte, com conteúdo listado e preço em moeda real; o jogo base continua completo sem eles.
- **Sinais:** produtos de conteúdo (DLC) com descrição; conteúdo base jogável sem compra.
- **Infantojuvenil:** permitido
- **Referências:** [LOJA]

### MON-0036 — Cosméticos de preço fixo
- **Classe:** A
- **Descrição:** itens só visuais (temas, peças, personagens) vendidos diretamente, por preço fixo e conhecido, sem efeito na dificuldade ou no resultado e sem sorteio.
- **Sinais:** loja com item escolhido diretamente; item sem atributo de jogo.
- **Infantojuvenil:** permitido
- **Referências:** [CPC]

---

## Classe B — zona cinzenta

### MON-0011 — Energia ou vidas com recarga por tempo
- **Classe:** B
- **Descrição:** jogar consome energia que recarrega com o tempo; anúncio ou compra recarrega na hora.
- **Sinais:** recurso com máximo e regeneração por relógio; oferta de recarga quando zera.
- **Infantojuvenil:** permitido
- **Aliases:** MON-B-01
- **Referências:** [Z13]

### MON-0012 — Jogar com hora marcada
- **Classe:** B
- **Descrição:** eventos, sequências diárias ou colheitas que se perdem se o jogador não voltar no horário.
- **Sinais:** sequência (*streak*) que zera; recompensa que expira; notificações agendadas.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-02
- **Referências:** [Z13]

### MON-0013 — Pagar ou assistir para pular espera
- **Classe:** B
- **Descrição:** temporizadores de construção, baú ou fila que podem ser pulados com moeda, compra ou anúncio.
- **Sinais:** temporizador com botão de aceleração pago.
- **Infantojuvenil:** permitido
- **Aliases:** MON-B-03
- **Referências:** [Z13]

### MON-0014 — Progressão desacelerada para vender atalho
- **Classe:** B
- **Descrição:** curva de XP, drop ou custo calibrada para que o caminho gratuito seja muito mais lento que o pago.
- **Sinais:** razão entre ganho gratuito e custo cresce em degraus; atalho pago oferecido no ponto de atrito.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-04
- **Referências:** [Z13]

### MON-0015 — Várias moedas virtuais
- **Classe:** B
- **Descrição:** mais de uma moeda, ou conversões entre moedas. Várias moedas não provam ocultação de preço; se o custo real fica escondido, é MON-0023.
- **Sinais:** duas ou mais moedas na loja; tabelas de câmbio internas.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-07
- **Referências:** [CPC]

### MON-0016 — Recompensa por convite ou ação social
- **Classe:** B
- **Descrição:** recompensas por convidar amigos, compartilhar ou depender de outros jogadores.
- **Sinais:** códigos de convite; recompensa por compartilhamento; ajuda entre jogadores com prazo.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-08
- **Referências:** [Z13]

### MON-0017 — Ofertas personalizadas por perfil de gasto
- **Classe:** B
- **Descrição:** preço, pacote ou momento da oferta escolhidos pelo histórico de gasto ou previsão de propensão a pagar.
- **Sinais:** segmentos de jogador em remote config; ofertas com preços diferentes por segmento.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-09
- **Referências:** [CPC]

### MON-0018 — Caixa de recompensa paga com probabilidades publicadas
- **Classe:** B
- **Descrição:** gacha ou caixa paga com resultado aleatório, probabilidades exibidas e verdadeiras.
- **Sinais:** sorteio ponderado após compra; tela de probabilidades acessível antes de pagar.
- **Infantojuvenil:** proibido
- **Público:** somente adulto
- **Aliases:** MON-B-10
- **Referências:** [ECA], [LOJA]
- **Nota:** com menores prováveis, ou com probabilidades ocultas ou falsas, é MON-0026.
- **Histórico:** v2 — restrito a público adulto (revisão do responsável).

### MON-0019 — Notificações de reengajamento
- **Classe:** B
- **Descrição:** notificações push para trazer o jogador de volta (energia cheia, evento, oferta).
- **Sinais:** agendamento de notificações locais; tópicos de push.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-11
- **Referências:** [ECA]

### MON-0020 — Pareamento ou conteúdo otimizado por engajamento
- **Classe:** B
- **Descrição:** adversários, níveis ou recompensas escolhidos para maximizar retenção ou gasto, e não equilíbrio.
- **Sinais:** entradas de risco de abandono ou gasto no pareamento ou na seleção de nível.
- **Infantojuvenil:** proibido
- **Aliases:** MON-B-12
- **Referências:** [EOMM], patentes EA

---

## Classe C — enganosa ou proibida (só detectar)

### MON-0021 — Botão de fechar enganoso
- **Classe:** C
- **Descrição:** fechar pequeno demais, escondido, com atraso não informado, ou cuja área de toque abre a loja ou o anúncio.
- **Sinais:** botão de fechar com área de toque mínima; área clicável do anúncio sobrepondo o fechar; fechar que aparece em posição variável. Criativos vêm da rede de anúncios: confirmar em sequência de telas e toques, não só em captura isolada.
- **Aliases:** MON-C-01
- **Referências:** [UIG], [ADS], [LOJA]

### MON-0022 — Anúncio disfarçado
- **Classe:** C
- **Descrição:** anúncio com aparência de conteúdo, botão do jogo ou mensagem do sistema.
- **Sinais:** anúncio nativo sem rótulo "anúncio"; criativo que imita a UI do jogo.
- **Aliases:** MON-C-02
- **Referências:** [UIG], [ADS]

### MON-0023 — Preço escondido em moeda virtual
- **Classe:** C
- **Descrição:** itens vendidos só em moeda virtual, sem preço em moeda real em nenhum ponto da compra.
- **Sinais:** loja sem preço local; conversão moeda → dinheiro não exibida.
- **Aliases:** MON-C-03
- **Referências:** [CPC]

### MON-0024 — Urgência ou escassez falsa
- **Classe:** C
- **Descrição:** contador que reinicia, "últimas unidades" ou "oferta única" que não são verdadeiros.
- **Sinais:** prazo calculado a partir da abertura da tela; oferta "única" recorrente.
- **Aliases:** MON-C-04
- **Referências:** [CPC], [UIG]

### MON-0025 — Compra sem confirmação
- **Classe:** C
- **Descrição:** cobrança com um toque, cartão salvo por padrão ou compra que dispara sem tela de confirmação.
- **Sinais:** fluxo de cobrança chamado direto do botão; ausência de diálogo de confirmação. A loja da plataforma costuma ter confirmação própria: ausência de diálogo no código do app não prova ausência de confirmação; verificar o fluxo completo.
- **Aliases:** MON-C-05
- **Referências:** [FTC]

### MON-0026 — Caixa paga com menores prováveis ou com probabilidades ocultas
- **Classe:** C
- **Descrição:** loot box ou gacha pago em jogo com acesso provável por menores, ou em qualquer jogo sem probabilidades verdadeiras publicadas.
- **Sinais:** sorteio ponderado após compra sem tela de probabilidades; probabilidades exibidas diferentes das do código ou dados.
- **Aliases:** MON-C-06
- **Referências:** [ECA], [LOJA]

### MON-0027 — Recusa com culpa
- **Classe:** C
- **Descrição:** botão de recusar com texto que constrange ("Não, não quero ajuda").
- **Sinais:** strings de recusa negativas ou ofensivas em telas de oferta.
- **Aliases:** MON-C-07
- **Referências:** [UIG]

### MON-0028 — Cancelamento obstruído
- **Classe:** C
- **Descrição:** assinatura ou renovação difícil de cancelar, ou cancelamento escondido.
- **Sinais:** nenhum caminho de cancelamento no jogo **nem** indicação do caminho da plataforma; renovação não informada. Ausência de botão no app, sozinha, não basta.
- **Aliases:** MON-C-08
- **Referências:** [FTC], [LOJA]

### MON-0029 — Pressão sobre crianças
- **Classe:** C
- **Descrição:** apelo direto a menores para comprar ou pedir aos pais, ou personagem que "sofre" se o jogador não pagar.
- **Sinais:** textos de oferta que chamam o jogador a comprar "agora" ou a pedir a um adulto.
- **Aliases:** MON-C-09
- **Referências:** [CPC], [ECA]

### MON-0030 — Recompensa não entregue
- **Classe:** C
- **Descrição:** anúncio com recompensa que não entrega o prometido, ou que exige mais visualizações do que o anunciado.
- **Sinais:** callback de recompensa com condição extra; recompensa menor que a exibida.
- **Aliases:** MON-C-10
- **Referências:** [ADS], [LOJA]

### MON-0031 — Anúncio em toque acidental
- **Classe:** C
- **Descrição:** anúncio que aparece onde o jogador está tocando ou durante a jogabilidade, induzindo clique acidental.
- **Sinais:** intersticial disparado no meio da partida ou no mesmo ponto de um botão do jogo.
- **Aliases:** MON-C-11
- **Referências:** [LOJA], [ADS]

### MON-0032 — Rastreamento para anúncio sem consentimento
- **Classe:** C
- **Descrição:** coleta de identificadores ou dados para segmentação de anúncios sem consentimento válido.
- **Sinais:** SDK de anúncio inicializado antes do consentimento; identificador de publicidade lido sem diálogo de consentimento. Inicializar o SDK não prova coleta: confirmar o que é lido e enviado antes do consentimento.
- **Aliases:** MON-C-12
- **Referências:** [LOJA], LGPD

### MON-0033 — Dificuldade ou sorte ligada a monetização
- **Classe:** C
- **Descrição:** a dificuldade, o gerador de peças ou a sorte mudam conforme o estado de monetização (proximidade de anúncio ou oferta, histórico de gasto, propensão a pagar), ou induzem quase-vitórias antes de oferecer continuar ou comprar. É C mesmo quando divulgado: o jogador não tem como saber, na partida, se perdeu pelo jogo ou pela venda.
- **Sinais:** função de dificuldade ou gerador de peças/drops que lê contadores de anúncio, oferta ou gasto; distribuição diferente na partida que precede uma oferta; quase-vitórias acima do esperado pela distribuição declarada. Correlação entre derrota e anúncio, sozinha, é associação, não prova.
- **Aliases:** MON-C-13, MON-B-05
- **Referências:** [EOMM], patentes EA, [Z13]
- **Histórico:** v2 — B → C (revisão do responsável). Dificuldade que lê só desempenho é MON-0004.
