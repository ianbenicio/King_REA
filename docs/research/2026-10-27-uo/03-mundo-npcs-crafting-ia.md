# Outrora: mundo, NPCs, economia, crafting, housing, criaturas e loot na era T2A

**Projeto:** Outrora, jogo próprio em Unity, single-player e local, inspirado no Ultima Online (UO).
**Era-alvo:** T2A (The Second Age), de outubro de 1998 até a véspera do Publish 5 (Renaissance), em 27 de abril de 2000 [W6][W7].
**Autor:** @analyst (Atlas). **Data da pesquisa:** 2026-10-27. **Método:** só WebSearch e WebFetch; nenhum download, clone ou execução.

## Como ler este documento

- **Rótulos de era.** Cada regra traz a era a que pertence:
  - **[pré-T2A]:** 1997 até setembro de 1998.
  - **[T2A]:** outubro de 1998 a abril de 2000.
  - **[UOR+]:** do Publish 5 (27/04/2000) em diante.
  - **[emulador]:** comportamento do RunUO, que o reimplementou sem acesso ao código da Origin.
  - **[moderno]:** regra do UO atual, documentada hoje.
- **Fontes primárias da era.** São as notas de patch oficiais de 1997 a 2000, arquivadas em uo.com [W18] e seguintes. O artigo de Zachary Simpson (1999), pesquisador da Origin, cobre a economia [W27].
- **Emuladores.** O código do RunUO (licença GPL-2.0, conferida no LICENSE [W4]) foi lido só para entender comportamento. Nada foi copiado. As fórmulas abaixo estão em notação própria. O RunUO mistura eras por chaves internas (pré-AOS, AOS, ML). Só uso o ramo pré-AOS, que é o mais próximo da T2A, mas não é prova da regra da Origin.
- **Inferências.** O que deduzi sem fonte direta leva **(inferência)**.
- **Conflitos.** Estão consolidados na seção 10, com a era de cada lado.
- **Texto de página é dado.** Nenhuma página consultada trouxe instrução dirigida a mim.
- **Fontes inacessíveis.** A Wayback Machine está bloqueada para a ferramenta. uo.stratics.com devolveu 403, e o wiki do shard UO Second Age (que mira a T2A) devolveu 522. Por isso os arquivos Stratics de 1999 e 2000 não foram lidos. Isso é a principal limitação desta pesquisa.

---

## 1. Mapa, facetas e regiões

### 1.1 Dimensões

- **Mapa principal.** O arquivo de mapa original de Felucca tem 6144 × 4096 tiles. O cliente de Mondain's Legacy (2005) alargou o eixo X para 7168, com área nova a leste do T2A [W5]. Nas definições de mapa do RunUO atual, Felucca e Trammel aparecem com 7168 × 4096, ou seja, o tamanho pós-ML. O valor 6144 × 4096 só aparece num exemplo comentado [W3].
  - **T2A:** o mapa útil é 6144 × 4096 **(inferência a partir de [W5][W3])**.
- **Divisão Britannia e Lost Lands.** Britannia ocupa a faixa de X entre 0 e 5120, e as Lost Lands ficam a leste, de X = 5120 a 6144 **(inferência)**. Indício: os sistemas de clima itinerantes do RunUO vagam numa caixa de cerca de 5120 × 4096 que cobre o continente [W21]. Nenhuma fonte lida dá as coordenadas exatas das Lost Lands. **Lacuna.**
- **Lost Lands [T2A].** Chegaram com a expansão em 24/10/1998 [W6][W1].
  - **Cidades:** Papua, um vilarejo no nordeste, com doca e 12 tipos de NPC, e Delucia, a "cidade das ruínas" no sudoeste, com banco, loja de magia, healer e provisioner.
  - **Dungeon:** Terathan Keep.
  - **Acesso:** 11 entradas, por barco, a pé ou montado, ou por teleporte [W6]. Rotas conhecidas: o pentagrama da loja de magos de Moonglow (palavra falada), a passagem a oeste de Trinsic e as Serpent Pillars no mar [W1]. As pilares voltaram a funcionar em janeiro de 1999 [W45].
  - **Criaturas novas:** 10 criaturas e 25 monstros exclusivos, como ophidians, terathans, criaturas de gelo e wyverns [W6].
  - **Recursos em Delucia:** campos de algodão, montanha minerável, alface e nabo [W6]. O crescimento de plantações nas Lost Lands foi desacelerado em novembro de 1998 [W52].

### 1.2 Facetas (só para delimitar o que fica fora)

- **Trammel [UOR+].** Surgiu no Publish 5 (27/04/2000), que duplicou o mundo: Trammel virou terra de PvP só por consentimento e Felucca, de PvP ampliado. Moonstones passaram a ligar as duas facetas, e Ocllo virou Haven em Trammel [W7].
- **Ilshenar, Malas, Tokuno e Ter Mur [UOR+].** Facetas posteriores. Tamanhos no RunUO: Ilshenar 2304 × 1600, Malas 2560 × 2048, Tokuno 1448 × 1448, Ter Mur 1280 × 4096 [W3].
- **Fora da v1 do Outrora.** Tudo isso fica de fora. Na T2A há um único mundo, Britannia mais Lost Lands, com regras "de Felucca" antes de ter esse nome.
- **Recursos em dobro [moderno].** O dobro de recursos em Felucca [W2] é regra moderna e não vale para a T2A.

### 1.3 Cidades, dungeons, moongates e viagem

- **Moongates [pré-T2A e T2A].** Oito portões fixos, perto de Moonglow, Britain, Jhelom, Yew, Minoc, Trinsic, Skara Brae e Magincia [W8].
  - **Mecânica:** a fase de Trammel decidia onde o portão aparecia, e a fase de Felucca decidia o destino. Jogadores atravessavam várias vezes até cair onde queriam [W8].
  - **Fev/2000 (Publish 3, ainda T2A):** clicar uma vez no portão passou a descrever o destino [W12].
  - **Jan/2001 [UOR+]:** menu de destino [W8].
  - **Relógio:** o relógio de pulso de fim de ano de 1999 mostrava a hora de Britannia "para ajudar com moongates" [W10]. Isso confirma que o horário do jogo controlava as fases.
- **Recall e Mark [T2A].** Recall é magia do 4.º círculo, custa 11 de mana, pede skill mínima de 24,0 e leva os reagentes black pearl, blood moss e mandrake root [W9].
  - **Mark:** grava na runa a posição do conjurador desde abril de 1998 [W51].
  - **Ago/1999:** não se marca runa dentro de casa. Runa e scroll de banco só funcionam para gate no banco. Depois de atravessar um gate de jogador, há atraso de 3 a 10 s até usar outro gate [W11]. Recall em chave de barco leva ao barco, se ele existir e tiver espaço no convés [W11].
  - **Runebook [T2A, nov/1999]:**
    - 16 destinos, com um padrão.
    - 5 a 10 cargas, conforme a Inscription do criador. Scroll de recall adiciona carga.
    - Fabricação: 8 blank scrolls, 1 recall scroll, 1 gate scroll e 1 runa [W10].
- **Gate Travel.** Desde abril de 1998, o portão abre na posição do conjurador [W51]. Gates não podem ser abertos sobre moongates (fev/1998) [W22]. Monstros não podem ser "gateados"; só escoltas, contratados, pets e invocados (set/1998) [W33].
- **Dungeons [emulador].**
  - Luz fixa de dungeon, nível 26 (ver 2.2) [W16][W20].
  - Proibido construir [W16].
  - A proteção de jogadores "young" não vale ali [W16]. O sistema young é de agosto e setembro de 1999 [W11].

### 1.4 Regiões e regras

- **Guard zone [T2A, regra tradicional].** É a área sob proteção dos guardas, normalmente a cidade e arredores, incluindo moongates e trechos de estrada [W13].
  - **Chamada:** a vítima azul atacada ou roubada diz "guards". O guarda surge e mata o agressor de um golpe [W13].
  - **Assassinos:** em zona protegida, podem ter guardas chamados contra si a qualquer momento [W13].
- **Detalhes no RunUO [emulador, ramo pré-AOS]:**
  - **Candidatos:** são alvo os criminosos, os assassinos (5 ou mais mortes) e quem ajuda criminosos com magia benéfica [W14].
  - **Alcance da chamada:** a palavra "guards" atinge um candidato num raio de 14 tiles [W14].
  - **Chamada automática:** depois de um ato criminoso, o infrator fica 15 s como candidato. Se houver NPC humano a até 8 tiles, o NPC chama o guarda sozinho [W14].
  - **Restrições:** construir casa é proibido em região guardada. Algumas magias são bloqueadas na cidade [W14].
  - **Comércio:** jogador com 5 ou mais mortes não usa vendedores na cidade [W14].
  - **Guarda [emulador]:** teleporta até o alvo e aplica dano igual à vida máxima dele. Se morrer com o alvo vivo, surgem 3 guardas. Ocioso, some após cerca de 42 s [W15].
- **Marcos da era:**
  - **Jan/1998:** o flag de criminoso dura 2 minutos [W18].
  - **Abr/1998:** não se pode mais matar criminosos dentro da cidade [W51].
  - **Jan/1999:** Firefield proibido na cidade [W45].
  - **Abr/1999:** invocar elementais proibido na cidade [W38].
  - **Dez/1998:** a proteção de guardas dentro de casas foi desligada [W53].
- **Saída do jogo (logout).**
  - **Set/1998:** logout instantâneo dentro da própria casa, com a chave [W33].
  - **Ago/1999:** criminosos ou agressores não saem instantaneamente de casa ou de estalagem [W11].
  - **RunUO [emulador]:** regiões podem dispensar o atraso de logout, desde que o personagem não tenha agressores nem flag criminal. O valor do atraso padrão não aparece no arquivo [W17].

---

## 2. Tempo, luz e clima

### 2.1 Ciclo de dia e noite

| Item | Valor | Era / fonte |
|---|---|---|
| Duração de 1 dia de jogo | cerca de 2 horas reais (12 dias de jogo por dia real) | [moderno, sem indício de mudança] [W19] |
| 1 minuto de jogo | cerca de 5 s reais (120 min ÷ 1440 min) | (inferência) a partir de [W19] |
| Horário local | cada região tem hora local própria; atravessar limite de servidor desloca um pouco a hora | [W19] |
| Calendário | mês de 73 dias, ano de 12 meses | [W19] |

### 2.2 Luz global

**RunUO [emulador].** A escala vai de 0, o mais claro, a valores maiores, mais escuros [W20]:

| Nível | Valor |
|---|---|
| Dia | 0 |
| Noite | 12 |
| Dungeon | 26 |
| Prisão | 9 |

- **Curva no RunUO:**
  - noite plena de 0h00 a 3h59;
  - amanhecer linear de 4h00 a 5h59;
  - dia pleno de 6h00 a 21h59;
  - anoitecer linear de 22h00 a 23h59.
- **Atualização:** recalculada a cada 5 s para todos os jogadores e no login [W20].
- **Conflito.** Um comentário no código diz que a Origin tinha noite até 3h59 e dia a partir de 4h00, sem transição [W20]. A UOGuide dá dia das 6h à meia-noite, cerca de 18 horas de jogo [W19]. Ver seção 10.

### 2.3 Luz pessoal e fontes

- **Night Sight [emulador]:** dura de 15 a 25 minutos aleatórios. Ao expirar, a luz pessoal volta a 0 [W20]. Como a luz pessoal se combina com a global não aparece no arquivo. **Lacuna.**
- **Fantasmas [pré-T2A]:** desde fevereiro de 1998, deixaram de ser afetados pela luz ambiente [W22].
- **Fontes de luz [pré-T2A]:** tochas e gravetos (kindling) existem desde 1998 [W22]. Counselors recebiam fonte de luz [W36].
  - Raio e intensidade de vela, lanterna e tocha: **lacuna**.

### 2.4 Clima e estações

- **Clima no RunUO [emulador].** Nenhuma fonte da era sobre clima foi lida.
  - **Zonas fixas:** a ilha de gelo tem neve garantida. As entradas de Covetous e Despise têm 50% de chance de precipitação.
  - **Zonas itinerantes:** 15 sistemas de 400 × 400 tiles por mapa, que andam 8 tiles a cada atualização.
  - **Ciclo:** atualização a cada 30 s, em ciclos de cerca de 15 minutos. A intensidade sobe até 70 e desce até 10.
  - **Chuva ou neve:** temperatura positiva dá chuva e negativa dá neve. Há 5% de chance de inverter a temperatura [W21].
- **Estações.** O RunUO atribui a estação "Desolation" a Felucca e "Spring" a Trammel, configuração pós-2000 [W3]. Se as estações giravam na T2A, as fontes lidas não dizem. **Lacuna.**
- **Sugestão para o Outrora (inferência):** estação fixa por região ou rotação lenta. É escolha de design, não regra da era.

---

## 3. Movimento

| Modo | Atraso por passo | Fonte |
|---|---|---|
| A pé, andando | 400 ms | [emulador] [W23] |
| A pé, correndo | 200 ms | [W23] |
| Montado, andando | 200 ms | [W23] |
| Montado, correndo | 100 ms | [W23] |

- **Controle de velocidade [emulador].** O servidor mantém uma fila de passos. Cada passo termina no fim do anterior mais o atraso do modo. Passar do limite de passos na fila caracteriza "fastwalk" [W23]. O detector antigo usava limite de 4 passos e hoje está desligado, trocado por estrangulamento de pacotes [W25].
- **Altura e degrau [emulador].** O personagem ocupa 16 unidades de altura. Ele sobe numa superfície cujo topo fique no máximo 2 unidades acima do topo de onde está [W24].
- **Colisão com statics e flags do tiledata [emulador]** [W24]:
  - **Impassable** bloqueia se a faixa vertical do objeto cruza a do personagem.
  - **Surface** sem Impassable é chão candidato.
  - **Bridge** conta como plano na própria altura, sem somar a altura do tile.
  - **Wet** (água) só é chão para criaturas que nadam.
  - Portas, campos mágicos e multis têm exceções próprias.
- **Escolha do novo Z [emulador].** Entre os chãos válidos, vence o mais próximo do Z atual. Em empate, vence o mais alto. Um chão é válido se o degrau couber e não houver bloqueio nas 16 unidades acima. O terreno usa a altura média do tile [W24].
- **Diagonais [emulador].** O tile de destino precisa passar. Para jogadores, os dois tiles laterais também precisam passar. Para criaturas, basta um [W24].
- **Mobiles [emulador].** Bloqueiam quando as faixas de altura se sobrepõem. Mortos e staff oculto não bloqueiam [W24].
- **Leitura para o Outrora (inferência).** Esse conjunto (passo de 2, altura de 16, mais próximo do Z atual, regra das diagonais) é a base mínima para reproduzir a sensação de andar em UO numa grade 2,5D.
- **Marcos da era:**
  - **Out/1998:** não se anda mais sobre peles nem vegetais no chão [W95].
  - **Dez/1998:** alguns itens perderam superfície de caminhar e escalar [W54].
  - **Mai/1999:** pets passaram a seguir mais rápido [W46].
  - **Ago/1999:** NPCs pararam de andar mais rápido que o normal [W11].

---

## 4. NPCs e economia

### 4.1 Tipos de NPC presentes na era

- **Papua [T2A]:** alquimista, padeiro, ferreiro, açougueiro, carpinteiro, healer, joalheiro, provisioner, construtor de navios, stablemaster, alfaiate e tinker [W6]. Delucia tem banco, loja de magia, healer e provisioner [W6].
- **Banqueiro.** Recusa criminosos desde set/1998 [W33].
- **Healer.**
  - **RunUO [emulador]:** oferece ressurreição a fantasmas que chegam a até 4 tiles com linha de visão, com nova checagem a cada 2 s. Cura vida só de jogadores "young" [W40].
  - **Abr/2000 [UOR+]:** healers errantes ficaram mais fortes [W7].
- **Guardas.** Ver 1.4. **Out/1997:** guardas nos bancos, que ficam perto do posto [W36].
- **Town crier [pré-T2A].** Desde fev/1998, responde a "news" com notícia [W22].
- **Stablemaster [pré-T2A].** Desde out/1997, guarda pets por 30 de ouro debitados do banco, alimentados enquanto o dono está offline. "Claim" devolve os pets [W36]. Stablemasters invulneráveis desde set/1999 [W47].
- **Arquiteto e corretor de imóveis.** Vendem deeds de casa. Desde mar/1999, arquitetos compram deeds de volta, com pagamento no banco [W38]. Corretores vendem tinteiro e blank scroll (abr/1999) [W93].
- **Escoltas [pré-T2A, out/1998].** Respondem só a "destination" [W95].
  - **Jan/2000:** uma escolta por vez e espera de cerca de 15 min entre escoltas [W68].
- **Guildmasters de profissão [T2A].** Guilda de ferreiros em fev/1999 [W41]. Magos errantes ensinam Meditation (mar/1999) [W39].
- **Vendedores de jogador (player vendors).** Existem desde cerca de seis meses após o lançamento [W27]. Ficam fora da v1 do Outrora, que é single-player **(inferência)**.

### 4.2 Fala por palavras-chave

| Palavra | Efeito | Era / fonte |
|---|---|---|
| "guards" | chama guardas contra criminoso ou assassino | [W13][W14] |
| "train" | lista as skills que o NPC ensina; NPC treina a skill citada | [T2A, fev/2000] [W12] |
| "news" | town crier dá notícia | [pré-T2A] [W22] |
| "destination" | escolta diz o destino | [pré-T2A] [W95] |
| frases de lockdown em casa | travar e destravar itens; só o dono | [T2A, fev/1999] [W41] |
| "vendor buy", "vendor sell", "bank", "balance" | comprar, vender, abrir o banco, saldo | **(inferência, não confirmado nas fontes lidas).** No RunUO, compra e venda ficam no menu de contexto [W29]; o arquivo do banqueiro não foi encontrado (404) |
| "all" + comando de pet | comandos coletivos ("all follow me" etc.) | [T2A, mai/1999] [W46] |

### 4.3 Formação de preço, estoque e revenda

- **Origin, era clássica.** Os lojistas tinham uma simulação de oferta e procura que pesava estoque, velocidade de venda, valor de recurso e caixa disponível [W27].
  - **Problema:** vendiam matéria-prima barata a iniciantes e pagavam caro pelos produtos acabados, então quebravam [W27].
  - **Remendo:** passaram a comprar itens em excesso (como camisas) em quantidade limitada, cerca de 10 por hora. Sem a regra de caixa, isso "imprime" ouro [W27].
  - **Out/1997:** o código de preços e o "estoque-alvo" das lojas foram ajustados [W36].
  - **Lacuna:** a fórmula exata da Origin não foi encontrada.
- **Modelo do RunUO [emulador]** [W28][W29][W30]:
  - Preço de venda do NPC = preço-base × multiplicador percentual, arredondado [W28].
  - Em região de cidade, o multiplicador é 100 + taxa da cidade; fora dela, 100 [W29].
  - Preço que o NPC paga ao jogador: tabela por tipo de item, em geral cerca de 50% do preço de venda. Exemplos: escudo de bronze 66 → 33; espada longa 55 → 27; lingote de ferro 5 → 4 [W31].
  - Ajustes de qualidade e magia na compra:
    - qualidade baixa ×0,60;
    - excepcional ×1,25;
    - +100 de ouro por nível de durabilidade, de dano ou de proteção [W30].
  - Preço de revenda pelo NPC = 1,9 × o que ele pagou [W30].
  - **Reposição:** a cada hora [W29].
    - Se o item esgotou, o estoque máximo dobra, com teto de 999.
    - Se sobrou mais da metade, o máximo cai para cerca de metade.
    - Em seguida o estoque volta ao máximo [W28].
  - Itens vendidos ao NPC ficam numa mochila de recompra e somem após 1 hora [W29].
  - Limite de 500 itens por venda. O NPC paga em pilhas de até 60.000 [W29].
  - Compras de 2.000 ou mais podem sair do banco se faltar ouro na mochila [W29]. A era dessa regra é incerta.
- **Limites da era:**
  - **Set/1998:** o NPC dá no máximo 50.000 de ouro por pedido e checa se a mochila do jogador comporta [W33].
  - **Abr/1998:** karma −4 impede negociar com lojistas [W51].
  - **Nov/1999:** compra em vendor de jogador exige confirmação de 60 s [W10].
- **Leitura para o Outrora (inferência).** Num jogo single-player, o modelo do RunUO (preço fixo por tabela, revenda a cerca de 50%, reposição horária adaptativa) é mais previsível que a simulação de 1997. O artigo de Simpson documenta que a simulação falhou [W27].

### 4.4 Banco, ouro e cheques

- **Caixa de banco.** Uma por jogador, acessível de qualquer banco, com capacidade limitada [W27].
  - **Nov/1999:** sem limite de peso, nem em contêineres aninhados. Limite total de 125 itens [W10].
  - **Set/1998:** pilhas de ouro contam no limite de itens, e o excedente podia sumir [W33].
- **Ouro.** Pilhas acima de 60.000 viram nova pilha (ago/1999) [W11].
- **Cheques [T2A, mar/2000, Publish 4]:**
  - O banqueiro emite cheques de 5.000 a 1.000.000 de ouro, debitados do banco.
  - Ao depositar, o valor volta ao banco.
  - Cheques são abençoados e não servem em vendedores [W34].
- **Contêineres [pré-T2A].** Em fev/1998, o limite foi baixado para 400 stones e 250 itens, com meta futura de 100 itens [W22].

### 4.5 Treinamento de skill com NPC

- **RunUO, ramo pré-AOS [emulador]** [W35]:
  - O NPC ensina até 1/3 da própria skill, com teto de 42,0.
  - O NPC precisa ter pelo menos 60,0 na skill, e o resultado precisa dar pelo menos 20,0.
  - **Custo:** 1 de ouro por 0,1 ponto, ou seja, 10 por ponto. Pagamento parcial ensina parcialmente.
  - O aluno respeita o próprio teto e precisa de pontos livres.
  - **Pré-requisitos no emulador:** Stealth exige Hiding; Remove Trap exige Lockpicking e Detecting Hidden.
- **Era:**
  - **Fev/1999:** Stealth passou a exigir 80 de Hiding, e Remove Trap, 50 de Lockpicking e 50 de Detect Hidden. Ladrões treinam ambos [W39].
  - **Nov/1999:** com o teto de 700 pontos atingido e todas as skills marcadas "subir" ou "travar", não se treina com NPC [W10].
  - **Fev/2000:** NPCs treinam a skill pedida, e "train" lista o que cada um ensina [W12].
  - **Abr/2000 [UOR+]:** NPC passou a dar troco quando o pagamento vem errado [W7].
  - **Conflito de teto:** ver seção 10.

---

## 5. Coleta e crafting

### 5.1 Coleta: bancos de recurso, esgotamento e reposição

**RunUO [emulador]:** o mapa é dividido em "bancos" de recurso; cada banco tem um estoque aleatório que se repõe com o tempo.

| Recurso | Tamanho do banco | Estoque por banco | Reposição | Por colheita | Alcance |
|---|---|---|---|---|---|
| Minério | 8 × 8 tiles | 10 a 34 | 10 a 20 min | 1 (2 em Felucca [UOR+]) | 2 tiles [W42] |
| Areia | 8 × 8 | 6 a 12 | 10 a 20 min | 1 | 2 [W42] |
| Madeira (toras) | 4 × 3 | 20 a 45 | 20 a 30 min | 10 (20 em Felucca [UOR+]) | 2 [W43] |
| Peixe | 8 × 8 | 5 a 15 | 10 a 20 min | 1 | até 4 da água [W44] |

- **Minérios coloridos [T2A, fev/1999].** Oito minerais novos, o valorite só para grão-mestres ou quase [W41].
  - Os veios ficam em locais fixos, mas nem sempre dão o mineral raro.
  - Minérios de cores diferentes não se misturam.
  - Fundir exige Mining [W41].
  - Lingotes coloridos fazem armadura e escudo, não armas funcionais [W41].
- **Tabela de minérios [emulador]:**

| Minério | Skill exigida | Chance do veio |
|---|---|---|
| Ferro | 0 | 49,6% |
| Dull copper | 65 | 11,2% |
| Shadow iron | 70 | 9,8% |
| Copper | 75 | 8,4% |
| Bronze | 80 | 7,0% |
| Gold | 85 | 5,6% |
| Agapite | 90 | 4,2% |
| Verite | 95 | 2,8% |
| Valorite | 99 | 1,4% |

  Fonte: [W42]. Veios não-ferro caem para ferro quando falham [W42].
- **Madeira [emulador].** No ramo pré-ML, só existe tora comum [W43]. As madeiras coloridas são de ML [UOR+] e ficam fora.
- **Pesca:**
  - **Mar/1999 [T2A]:** a skill define o que se pesca, de botas e peixes a peixes mágicos, mapas do tesouro, garrafas com mensagem (SOS) e serpentes marinhas [W38].
  - **Mar/2000:** acima de 80, pode-se puxar serpente em água funda. Mapa ou SOS vêm no corpo da serpente [W34].
  - **RunUO [emulador]:**
    - mapa do tesouro só em água funda com base ≥ 90;
    - SOS com base ≥ 100;
    - botas e peixes especiais mais comuns em skill baixa;
    - montado não pesca [W44].
- **Mineração e corte de madeira:** montado ou polimorfado não minera [W42]. Em jan/2000, Mining, Lumberjacking e Fishing passaram às novas regras de ganho [W68].
- **Nota histórica.** O "ecossistema de recursos" (criaturas geradas de um banco central) existia no alfa e foi desligado no beta, antes do lançamento em 1997 [W66]. Ele não existe na T2A. Os valores de recurso por criatura (carne, couro, lã) continuaram sendo usados por crafting e coleta [W66].

### 5.2 Fórmulas gerais de crafting [emulador]

Notação própria:
- s = skill do jogador;
- s_min e s_max = faixa do item;
- c₀ = chance mínima do sistema.

- **Chance de sucesso:** P = c₀ + (s − s_min) ÷ (s_max − s_min) × (1 − c₀).
  - Abaixo de s_min, a tentativa é bloqueada.
  - Em s_max ou acima, P = 100% [W48].
  - Na ferraria, c₀ = 0 [W49].
- **Chance de excepcional,** conforme o sistema [W48]:
  - Tipo A: P − 0,60.
  - Tipo B: 0,5·P − 0,10.
  - Tipo C: P − d(s), onde d vale 0,60 até s = 95, cai linearmente e vale 0,45 a partir de s = 100.
  - A ferraria usa o tipo C [W49]. Valor ≤ 0 significa sem excepcional.
- **Marca do criador:** exige item excepcional, skill-base ≥ 100,0 e tipo de item marcável [W48].
- **Falha** [W48]:
  - Normalmente consome os recursos listados, salvo tipos isentos por sistema.
  - Receitas "usa tudo" perdem metade, com mínimo de 1.
  - A ferramenta perde 1 uso tanto no sucesso quanto na falha.
- **Ferraria [emulador]:** bigorna e forja a até 2 tiles [W49]. Exemplos (skill mínima / máxima / lingotes):

| Item | Mín. | Máx. | Lingotes |
|---|---|---|---|
| Peitoral de placas | 75,0 | 125,0 | 25 |
| Túnica de anéis | 21,9 | 71,9 | 18 |
| Broadsword | 35,4 | 85,4 | 10 |
| Katana | 44,1 | 94,1 | 8 |
| Adaga | −0,4 | 49,6 | 3 |
| Buckler | −25,0 | 25,0 | 10 |

  Fonte: [W49].

### 5.3 Linha do tempo das regras de crafting na era

| Data | Mudança | Fonte |
|---|---|---|
| fev/1998 [pré-T2A] | Tecido em rolos de 50 jardas (5 stones), corte de 1 jarda, pilhas de matéria-prima | [W22] |
| abr/1998 [pré-T2A] | Reparo sempre reduz a durabilidade máxima. Venenos em 5 níveis: greater poison exige cerca de 65 de Alchemy, deadly cerca de 95 | [W51] |
| set/1998 [pré-T2A] | Tinkering consome material na falha. Minério que não cabe na mochila é apagado | [W33] |
| nov/1998 [T2A] | Ferreiro grão-mestre faz peitoral excepcional com marca. Arcos e bestas excepcionais ou abaixo da média, com dano por qualidade. Rebalanceamento de armas com escala nova | [W52] |
| dez/1998 [T2A] | Carpentry baseada em dificuldade e categoria "adições de casa" (forja, bigorna, forno, tear etc.) | [W53] |
| jan/1999 [T2A] | Tailoring baseada em dificuldade, com qualidade excepcional ou abaixo da média e marca de grão-mestre. Inscription não consome scroll nem reagente se falha por mãos ocupadas | [W45] |
| fev/1999 [T2A] | Minérios coloridos (ver 5.1) | [W41] |
| mar/1999 [T2A] | Carpentry: camas, instrumentos (exigem Musicianship). Tinkering: joias com gema, chaves, gazuas, utensílios | [W38] |
| mai/1999 [T2A] | Tinkering com menu em abas e "fazer o último item"; itens impossíveis ficam ocultos. Carpinteiro faz tábuas. Durabilidade de ferramenta pela skill do tinker | [W46] |
| ago/1999 [T2A] | Tinkering consome recursos na falha. Tecido, lã e algodão mais caros no NPC | [W11] |
| set/1999 [T2A] | Fundir armas e armaduras de volta em lingotes (rendimento por Mining e desgaste; item de NPC dá 1 lingote). Desfazer roupa e couro com tesoura | [W47] |
| nov/1999 [T2A] | Bowcraft, Carpentry e Tinkering ganham excepcional e marca opcional. Barril de poções. Runebook (ver 1.3) | [W10] |
| fev/2000 [T2A] | Corrigida dificuldade anormal da ferraria | [W12] |
| mar/2000 [T2A] | Skills de crafting isentas do novo anti-macro | [W34] |

- **Menus da era.** A T2A usava os menus de item antigos, por ícones e categorias. O menu em abas aparece primeiro na Tinkering em mai/1999 [W46]. A generalização posterior do menu de crafting é [UOR+] **(inferência; data exata não confirmada)**.
- **Lacunas de skill:** Alchemy (taxa de sucesso), Cooking, Inscription (custo de mana por círculo) e Bowcraft não têm números da era nas fontes lidas.

### 5.4 Reparo

- **Regra da era [pré-T2A, abr/1998]:** todo reparo reduz um pouco a durabilidade máxima [W51].
- **RunUO, ramo pré-AOS [emulador]** [W50]:
  - **Chance de enfraquecer antes do reparo:** 40 + pontos faltantes − skill/10, em %.
  - **Perda por enfraquecimento:** 1 ponto com skill ≥ 90; 2 pontos de 70 a 89,9; 3 pontos abaixo de 70. Alfaiataria não perde.
  - **Dificuldade:** D = 125·f − 25, onde f = fração de durabilidade perdida.
  - **Sucesso:** linear de 0% em s = D − 25 até 100% em s = D + 25.
  - **Falha:** não quebra o item, mas a perda de máximo se aplica.

---

## 6. Housing e multis

### 6.1 Tipos de casa e preços

**Casas da T2A** (deeds vendidos por arquitetos ou corretores). Os preços são os do RunUO [W32]; a era dos preços é incerta. Lockdowns e secures da era vêm da nota de nov/1999 [W10].

| Casa | Preço do deed | Área (aprox.) | Lockdowns / secures |
|---|---|---|---|
| Pequenas (6 variantes: pedra e reboco, pedra bruta, tijolo, madeira, madeira e reboco, teto de palha) | 43.800 | 7 × 7 + degrau | 425 / 3 |
| Casa grande de tijolo | 144.500 | 14 × 14 | 1.100 / 8 |
| Large house with patio (antiga "large smithy", renomeada em fev/1999 [W41]) | 152.800 | 15 × 14 | 1.100 / 8 |
| Sobrado (2 variantes) | 192.400 | 14 × 14 | 1.370 / 10 |
| Torre | 433.200 | 16 × 14 + alas | 2.119 / 15 |
| Pequena fortaleza (small stone keep) | 665.200 | cerca de 24 × 24 | 2.625 / 18 |
| Castelo | 1.022.800 | 31 × 31 | 4.076 / 28 |

Fontes: [W32][W55][W10][W59].

- **Casas do Renaissance [UOR+, abr/2000], fora da T2A.** Sete casas, com os mesmos preços no RunUO: small stone shop, small marble shop, small tower, sandstone patio, log cabin, villa e marble patio [W7][W32].
- **Tendas [pré-T2A].** Saíram de venda em dez/1998 e foram apagadas no boot [W53][W54].

### 6.2 Colocação

- **Era:**
  - **Jan/1998:** proibido em estrada e terra batida [W18].
  - **Fev/1998:** proibido em lavoura arada [W22].
  - **Dez/1998:** exige borda livre de 1 tile em volta e 5 tiles livres na frente e atrás, sem objetos dinâmicos [W53].
  - **Jan/2000:** novo sistema exige terreno nivelado e mostra prévia. Uma ferramenta de agrimensura testa o terreno sem comprar deed. Plantas pequenas deixam de bloquear [W68].
  - **Mar/2000:** checagem mais estrita [W34].
- **RunUO [emulador]** [W56]:
  - Cada tile da fundação precisa de terreno caminhável com altura média igual ao Z-base, sem tolerância.
  - Estrada, sulco e terreno intransponível são proibidos sob a casa e na borda.
  - No anel de 1 tile da borda, nada pode subir mais de 2 acima do Z-base.
  - Nenhuma outra casa a até 5 tiles ao norte ou ao sul, nem a 1 tile a leste ou oeste.
  - Statics decorativos não sólidos não bloqueiam.
  - Itens móveis e mobiles dentro da área vão para baixo da placa da casa.
  - Região guardada e dungeon não permitem casa [W14][W16].
  - O RunUO também proíbe construir nas Lost Lands de Felucca [W56]. Se isso valia na T2A não está confirmado (seção 10).

### 6.3 Posse, chaves, co-donos e travas

- **Chaves [emulador, pré-AOS].** Chave de ouro na mochila e cópia no banco. Ao transferir a casa, as fechaduras mudam [W57].
- **Era:**
  - **Fev/1998:** abrir porta trancada sem procurar a chave, se o jogador a tiver [W22].
  - **Mai/1999:** portas internas podem ser rechaveadas [W46].
  - **Dez/1998:** processo de reivindicação de casas. Prioridade: quem colocou, depois portador da chave mestra, guildmaster, membro com chave e dono de vendor. Placa da casa com dono, contagem de lockdowns e visitas. Amigos e banidos limitados a 50 cada. Transferência, troca de fechadura e demolição de volta em deed [W53][W54].
  - **Nov/1999:** até 8 co-donos, cada um com um strongbox de 25 itens. Container seguro custa 125 lockdowns. Itens travados não decaem [W10].
  - **Fev/2000:** transferência de casa por troca segura. Quem já tem casa não recebe outra [W12].
- **Limite por conta [UOR+, abr/2000].** Uma casa por conta por shard [W7]. Para a T2A, ver seção 10.

### 6.4 Decaimento

- **Estágios** [W58][W57]: like new, slightly worn, somewhat worn, fairly worn, greatly worn, in danger of collapsing (IDOC), colapso.
- **RunUO [emulador].** Período padrão de 5 dias.
  - Os estágios caem em cerca de 0,5%, 25%, 50%, 75% e 95% desse período.
  - Colapso em 100%.
  - "Refresh" zera o relógio. No pré-AOS, casa com dono usa refresh manual [W57].
- **Era:**
  - **Jan/1998:** casas em regiões inválidas decaem muito rápido [W18].
  - **Set/1998:** corrigido decaimento acelerado de casas e itens no boot [W33].
  - O que contava como refresh na T2A não foi documentado nas fontes lidas. **Lacuna.** Visita do dono ou de amigo é a hipótese corrente **(inferência)**.
- **Itens dentro de casa:**
  - **Mar/1999:** lixeira apaga itens após 3 min [W39].
  - **Jan/2000:** itens soltos em casa passam a decair na taxa de fora; travados, em secure ou add-ons, não [W68].

### 6.5 Barcos (só resumo; fora da v1)

- Existem barcos com chave e cópia da chave no banco (nov/1997) [W37].
- **Mai/1999:** atracar em qualquer lugar com porão vazio vira barco miniatura [W46].
- **Nov/1999:** dry-dock só vazio [W10].
- **Ago/1999:** recall pela chave do barco [W11].
- **Jan/2000:** itens no convés decaem; no porão, não [W68].
- Tipos e tamanhos de barco: **lacuna** nas fontes lidas.

---

## 7. Criaturas e IA

### 7.1 Tipos de IA [emulador]

| IA | Comportamento resumido |
|---|---|
| Melee | Busca alvo no alcance de percepção; persegue até o alcance de luta; foge com menos de 20% de vida; volta a lutar acima de 50% [W60] |
| Animal | Ataca alvo válido no alcance; foge com menos de 10% de vida; pets e invocados não fogem [W61] |
| Mage | Cura-se (Heal se faltam mais de 10 de vida, Greater Heal se faltam mais de 50), sorteia magias de dano, veneno, maldição e paralisia; teleporta se bloqueado; não recua [W62] |
| Archer, Healer, Berserk, Predator, Thief, Vendor | Existem no código [W35]; Predator usa a IA Melee [W35] |

- **Modos de luta (fight mode) [emulador]** [W35]:
  - nenhum;
  - só agressores;
  - mais forte (maior Tactics + Força);
  - mais fraco (menor vida);
  - mais próximo;
  - "maligno" (agressores e karma negativo).
- **Fuga, em notação própria [emulador].** Sejam h a vida atual, H a vida máxima e Δ a diferença de vida para o oponente.
  - Melee rola fuga quando h < 0,2·H. A chance é 10% + |Δ| se estiver em desvantagem e 10% caso contrário [W60].
  - Na IA de mago, a comparação está invertida no código, o que dá cerca de 89% (seção 10) [W62].
- **Ritmo da IA de mago [emulador].** Intervalo entre magias de 6 − k·(3·Magery/100) s, com k sorteado entre 0,75 e 1,25. Exemplo: cerca de 2,25 a 3,75 s com Magery 100 [W62].

### 7.2 Percepção, wander, home e ativação [emulador]

- **Percepção e alcance:**
  - Percepção padrão de 16 tiles. O valor antigo de 10, que aparece nos construtores de quase todos os monstros, é promovido a 16 [W35][W71].
  - Alcance de luta corpo a corpo: 1 tile.
  - O alvo é abandonado além de 3× a percepção [W60].
- **Home:**
  - Range home padrão de 10 [W35].
  - Ao vagar, a criatura anda livre dentro de cerca de 2/3 do range. Fora do range, volta para casa. Na faixa intermediária, volta em cerca de 40% das vezes.
  - Cada tique de wander tenta mover em cerca de 9/16 das vezes [W63].
- **Velocidade:** o tique da IA usa a velocidade "ativa" em combate e "passiva" fora dele [W63]. Tabela por tipo [W26]:

| Faixa | Ativa (s) | Passiva (s) | Exemplos |
|---|---|---|---|
| Lenta | 0,30 | 0,60 | rato, esqueleto, zumbi, ogro |
| Média | 0,25 | 0,50 | orc, cavalo, cão, dragão |
| Rápida | 0,20 | 0,40 | lich, balron |
| Muito rápida | 0,175 | 0,35 | — |

- **Ativação por setor:** a IA dorme quando não há jogadores no setor e acorda quando chegam [W63]. Para o Outrora, equivale a simular só perto do jogador **(inferência)**.

### 7.3 Spawn e respawn

- **Origin.** Regiões de spawn processadas do canto superior esquerdo ao inferior direito. Isso deixava dungeons do sul lentas. Uma reescrita corrigiu e o respawn ficou rápido demais. O sistema antigo de IA de ecologia foi desligado por desempenho [W67][W66].
  - **Out/1997:** taxa de spawn de dungeon aumentada [W36].
  - **Nov/1997:** dificuldade geral das criaturas elevada e mais grupos [W37].
  - **Mai/1999:** monstros não nascem dentro de casas [W93][W46].
  - **Jan/2000:** criaturas presas em locais inválidos morrem após um tempo [W68].
- **RunUO, spawner de ponto [emulador]** [W64]:
  - Padrão: 1 criatura, 5 a 10 min entre checagens, raio de 4 tiles.
  - A morte não dispara respawn. Ele ocorre na próxima checagem.
  - No modo grupo, só repõe quando todos morrem.
- **RunUO, spawn por região [emulador].** Atraso de 2 a 5 min. A cada disparo repõe (máx − atuais) ÷ 3, com mínimo de 1 [W65].

### 7.4 Doma e pets

- **Doma [moderno].**
  - Começa a até 3 tiles, com linha de visão.
  - Depois pode-se afastar até 10 tiles.
  - Qualquer dano na criatura cancela [W70].
  - Linha de visão quebrada cancela desde jan/2000 [W68].
- **Controle (obediência), ramo pré-AOS [emulador].** Notação própria:
  - T = Animal Taming, L = Animal Lore, d = skill mínima de doma.
  - Base de 70%.
  - x = 0,8·T + 0,2·L comparado a d. Cada ponto acima de d soma 6 pontos percentuais; cada ponto abaixo tira 14.
  - Limite entre 20% e 99%.
  - Cada ponto de lealdade abaixo de 100 tira 1 ponto percentual.
  - Criaturas com d ≤ 29,1 obedecem sempre [W35].
- **Lealdade [emulador].**
  - Máximo de 100.
  - +1 por ordem obedecida e −3 por ordem ignorada.
  - Comer dá +10 com 50% de chance por item no pré-SE [W35].
- **Lealdade na era:**
  - **Out/1997:** cavalo derruba o cavaleiro quando a lealdade acaba [W36].
  - **Abr/1998:** pets perdem lealdade mais devagar [W51].
  - **Fev/2000:** pets ficam leais por mais de 24 h, e a lealdade inicial ficou mais alta [W12].
  - **Jan/2000:** pets que ignoram ordens ficam selvagens mais rápido [W68].
  - **Níveis nomeados [moderno]:** de "wonderfully happy" a "confused". A lealdade cai com o tempo, mais rápido longe do dono. Pet infeliz pode ficar selvagem ou atacar o dono [W69].
- **Comandos [T2A]:** come, follow, follow me, guard, kill/attack, stop, stay, drop, release, transfer, friend [W63][W69].
  - Prefixo "all" a partir de mai/1999 [W46].
  - "Transfer" desde out/1997 [W36].
  - "Drop" reativado em set/1999 [W47].
  - "Stop" limpa ordens anteriores desde jan/2000 [W68].
  - Pet guarda só o dono, o corpo do dono, a casa e os outros pets (set/1999) [W47].
- **Dificuldade por domador na era:**
  - **Fev/1999:** "orneriness" proporcional à dificuldade de doma [W39].
  - **Mai/1999:** Taming pesa mais que Lore [W46].
  - **Jan/2000:** donos anteriores tornam a nova doma mais difícil [W68].
- **Slots de controle.** O limite de 5 é [moderno] [W69]. A data em que o limite foi introduzido não foi confirmada. **Lacuna.**
- **Animal Lore.**
  - **Out/1997:** o relatório de fome foi removido [W36].
  - **Mar/2000:** Lore sobe ao tentar domar [W34].
  - O que o Lore exibia na T2A: **lacuna**.

### 7.5 Criaturas típicas de início de jogo [emulador]

O RunUO usa estes números nos construtores; são aproximações da era.

| Criatura | IA | For / Des / Int | Vida | Dano | Fama / Karma | Loot | Fonte |
|---|---|---|---|---|---|---|---|
| Rato de esgoto | melee | 9 / 25 / 6–10 | 6 | 1–2 | 300 / −300 | Poor; domável (−0,9) | [W76] |
| Rato gigante | melee | 32–74 / 46–65 / 16–30 | 26–39 | 4–8 | 300 / −300 | Poor; domável (29,1) | [W77] |
| Esqueleto | melee | 56–80 / 56–75 / 16–40 | 34–48 | 3–7 | 450 / −450 | Poor + peça de osso | [W72] |
| Zumbi | melee | 46–70 / 31–50 / 26–40 | 28–42 | 3–7 | 600 / −600 | Meager + partes de corpo | [W73] |
| Orc | melee | 96–120 / 81–105 / 36–60 | 58–72 | 5–7 | 1500 / −1500 | Meager; arma em cerca de 30% | [W71] |
| Orcish mage | mage | 116–150 / 91–115 / 161–185 | 70–90 | 4–14 | 3000 / −3000 | Average + scrolls; mapa nível 1 | [W75] |
| Ettin | melee | 136–165 / 56–75 / 31–55 | 82–99 | 7–17 | 3000 / −3000 | Meager + Average + poções; mapa nível 1 | [W74] |
| Cavalo | animal (só agressor) | 22–98 / 56–75 / 6–10 | 28–45 | 3–4 | — | domável (29,1) | [W78] |

---

## 8. Loot

### 8.1 Pacotes de loot por nível de criatura [emulador, pré-AOS]

| Pacote | Ouro (dados) | Itens mágicos (chance · faixa de intensidade) |
|---|---|---|
| Poor | 1d25 | nenhum |
| Meager | 5d10 + 25 | 1% · 0–60; 0,2% · 10–70 |
| Average | 10d10 + 50 | 5% · 20–80; 2% · 30–90; 0,5% · 40–100 |
| Rich | 10d10 + 250 | 20% · 60–100; 10% · 65–100; 1% · 70–100 |
| FilthyRich | 2d125 + 400 | 33% · 50–100; 33% · 60–100; 20% · 70–100; 5% · 80–100 |
| UltraRich | 5d100 + 500 | 6 itens garantidos (40–100 a 60–100) |
| SuperBoss | 5d100 + 500 | 10 itens garantidos (40–100 a 70–100) |

Fonte: [W79]. Instrumentos musicais aparecem de 0,02% a 2%. Gemas, poções e scrolls vêm em pacotes separados [W79].

- **Intensidade para nível 1 a 5 [emulador]:** 0–49 dá nível 1; 50–74, nível 2; 75–88, nível 3; 89–96, nível 4; 97–100, nível 5 [W79].
- **Atributos sorteados [emulador]:**
  - **Arma:** precisão (80%), dano (60%), durabilidade (40%), mais 5% de chance de "slayer".
  - **Armadura:** proteção (80%), durabilidade (40%) [W79].
- **Era:**
  - **Out/1997:** conjuradores humanoides (lich, mago) têm mais chance de item mágico, e os outros, menos. Orcs, trolls, ettins, lizardmen, ratmen etc. passam a carregar loot [W36].
  - **Abr/1998:** menos itens não-ouro e ouro mais variado [W51].
  - **Jan/1999:** tesouro de criatura revisto, sem o item "a scroll" [W45].
  - **Fev/2000:** tesouro de monstros retrabalhado; a maioria deixa de carregar mochila [W12].

### 8.2 Itens mágicos pré-AOS

| Atributo | Níveis 1 a 5 | Efeito [emulador] |
|---|---|---|
| Dano (arma) | Ruin, Might, Force, Power, Vanquishing | +1, +3, +5, +7, +9 no dado-base (2·nível − 1) [W80] |
| Precisão (arma) | Accurate, Surpassingly, Eminently, Exceedingly, Supremely | +5 a +25 na Tactics, 5 por nível [W80] |
| Durabilidade (arma e armadura) | Durable, Substantial, Massive, Fortified, Indestructible | +20%, +50%, +70%, +100%, +120% de pontos de vida do item [W80][W81] |
| Proteção (armadura) | Defense, Guarding, Hardening, Fortification, Invulnerability | +15, +20, +25, +30, +35 de AR por peça (10 + 5·nível; ordem dos níveis inferida pelo extrator) [W81] |

- **Qualidade [emulador]:**
  - Arma excepcional: +20% de dano e +20% de durabilidade. Arma de baixa qualidade: −20% de dano [W80].
  - Armadura excepcional: +8 de AR. Armadura de baixa qualidade: −8 [W81].
- **Metais coloridos [emulador]:** de +2 (dull copper) a +16 (valorite) de AR [W81]. Na T2A, os metais coloridos são de fev/1999 [W41].
- **Desgaste [emulador]:**
  - Arma: 4% de chance por golpe de perder 1 ponto de vida do item.
  - Armadura: 25% por golpe recebido.
  - Itens com vida zerada perdem máximo e acabam destruídos [W80][W81].
- **Cargas de magia em arma** (clumsy, feeblemind, magic arrow, harm etc.): o ramo pré-AOS de loot do RunUO lido não as gera [W79]. A tabela de magias e cargas da era não foi encontrada. **Lacuna.**
- **Conflitos.** O bônus de Vanquishing e o de proteção de armadura divergem entre fontes (seção 10).

### 8.3 Mapas do tesouro

- **Origem [T2A, jan/1999].** Monstros dropam mapas em vários níveis de dificuldade.
  - Decodificar exige Cartography, mais alta conforme o nível. Um pino marca o local.
  - Só quem decodificou pode cavar.
  - Cavar usa qualquer ferramenta de mineração. A Mining define o raio da escavação, sem ganho de skill.
  - Cavar invoca guardiões. O baú vem trancado e muitas vezes com armadilha. Magic Unlock só abre as fechaduras simples [W45].
- **Mar/1999:** o tesouro deixou de ficar sempre no centro do mapa, e o mapa completo mostra quem o achou [W39].
- **Mar/1999:** mapas também vêm da pesca [W38]. **Mar/2000:** vêm no corpo de serpentes [W34].
- **Emulador:** monstros como orcish mage e ettin dropam mapa de nível 1 [W74][W75].
- **Níveis [moderno]:** 5 níveis (Stash a Trove), com nomes antigos do tipo "plainly drawn" e "expertly drawn". Conteúdo moderno de 10 mil a 70 mil de ouro [W83]. Não vale para a T2A.
- **Lacunas da era:** quantos níveis havia na T2A e o conteúdo exato de cada um.

### 8.4 Corpos e itens no chão

- **Corpos [emulador]:**
  - Todo corpo inicia um temporizador de 7 min.
  - O corpo de jogador vira ossos, que duram mais 7 min, cerca de 14 min no total.
  - O de monstro some aos 7 min [W84].
- **Corpos na era:**
  - **Out/1998:** os restos (remains) decaem em 15 min [W87].
  - **Set/1998:** o corpo que decai despeja o conteúdo num saco [W33].
  - **Nov/1998:** o resultado de carnear fica dentro do corpo [W52].
  - **Out/1998:** cortar o corpo cria um contêiner de restos com o conteúdo [W95].
- **Saque [emulador, pré-AOS].** Saquear corpo de inocente marca como criminoso. O dono, membros autorizados do grupo e GMs podem saquear livremente [W84].
  - **Ago/1999:** novatos não saqueiam monstro alheio por 2 min [W11].
  - **Abr/2000 [UOR+]:** sistema de pontos de dano decide quem saqueia [W7].
- **Itens no chão:**
  - **Origin:** apagados "em poucos minutos" [W27].
  - **RunUO [emulador]:** padrão de 1 hora para itens móveis soltos, fora de contêiner [W85]. O ServUO também usa cerca de 1 hora [W86].
- **Deeds no chão.** Decaem rápido (abr/1999) [W93].

---

## 9. Recomendações para a especificação do Outrora (inferência)

1. **Mundo.** Uma única faceta de 6144 × 4096, com Britannia e Lost Lands. Recorte jogável menor na v1, a decidir com @pm.
2. **Tempo.** Dia de 2 h reais; níveis de luz de 0 a 12 ao ar livre e 26 em dungeon; transições de 2 h de jogo. É a escolha do emulador; documentar a alternativa "sem crepúsculo".
3. **Movimento.** 400/200/100 ms; degrau de 2; altura de 16; regra das diagonais.
4. **Economia.** Preço por tabela, revenda a cerca de 50%, reposição horária adaptativa e cheques ficam. A simulação de oferta e procura de 1997 fica fora.
5. **Crafting.** Fórmula linear de sucesso; excepcional pelo tipo C; reparo com perda de máximo; menus por categoria.
6. **Criaturas.** Os quatro arquétipos de IA (melee, mago, animal, arqueiro), percepção de 16, home range, fuga por limiar e spawn por região com reposição parcial.
7. **Loot.** Pacotes Poor a FilthyRich, mapeamento intensidade→nível e os cinco prefixos de dano e proteção. Os valores exatos dependem do conflito 10.1, a decidir com @pm/@architect.

Próximo passo: @pm transforma isto em requisitos (FR/NFR) e @architect valida os sistemas de movimento e spawn para Unity.

---

## 10. Conflitos registrados

1. **Bônus de Vanquishing.**
   - RunUO [emulador]: +9 no dado de dano [W80].
   - UOGuide: Vanquishing "originalmente" adicionava 5 pontos [W82].
   - Possível causa: a Origin rebalanceou as armas para uma "escala nova" em nov/1998 [W52]. Os valores podem ter mudado dentro da própria era. **Não resolvido.**
2. **Proteção de armadura.** RunUO dá +15 a +35 de AR por peça [W81]. Nenhuma fonte da era foi encontrada. **Não confirmado.**
3. **Curva de luz.**
   - RunUO: crepúsculos lineares de 2 h [W20].
   - Comentário no mesmo código: a Origin não tinha transição (noite até 3h59, dia às 4h00) [W20].
   - UOGuide [moderno]: dia das 6h à meia-noite [W19].
4. **Decaimento de corpos.** RunUO: 7 min mais 7 min de ossos [W84]. Origin, out/1998: restos em 15 min [W87].
5. **Itens no chão.** Origin, Simpson (1999): minutos [W27]. RunUO e ServUO: 1 hora [W85][W86].
6. **Percepção dos monstros.** Os construtores dizem 10; o núcleo promove para 16 [W35][W71].
7. **Velocidade dos monstros.** Construtores com 0,2/0,4 versus tabela por tipo (esqueleto e rato "lentos", 0,3/0,6; orc "médio", 0,25/0,5) [W72][W26]. A tabela prevalece no RunUO **(inferência)**.
8. **Fuga do mago.** O comentário do RunUO diz 10% + Δ, mas a comparação implementada dá cerca de 89% [W62]. Provável bug do emulador; não usar como regra da era.
9. **Teto de treino com NPC.**
   - RunUO: até 1/3 da skill do NPC, máximo de 42,0 [W35].
   - Não há número da era. A fonte moderna oficial, vista só em resultado de busca, fala em cerca de 30 pontos. Não foi lida, então fica sem id.
10. **Casas por pessoa.**
    - Simpson (1999): uma casa por personagem [W27].
    - Dez/1998: proibido reivindicar várias de uma vez [W54].
    - Fev/2000: quem já tem casa não recebe outra por troca [W12].
    - Abr/2000 [UOR+]: uma por conta por shard [W7].
11. **Casas nas Lost Lands.** O RunUO proíbe nas Lost Lands de Felucca [W56]. A regra da T2A não foi encontrada.
12. **Co-donos.** Origin, nov/1999: 8 [W10]. RunUO pré-AOS: 15 [W57].
13. **Recursos em Felucca.** Dobro de recursos em Felucca [W2][W42][W43] é regra [UOR+]/[moderno] e não vale para a T2A.

## 11. Lacunas

- Coordenadas exatas das Lost Lands.
- Rotação de estações na T2A.
- Raio e intensidade de fontes de luz.
- Palavras-chave exatas de vendedor e banqueiro: "vendor buy", "bank" e "balance" estão sem fonte lida.
- Fórmula de preço da Origin.
- Mecanismo de refresh de casa na T2A.
- Tipos de barco.
- Números de Alchemy, Inscription, Cooking e Bowcraft.
- Cargas de magia em armas e armaduras.
- Níveis e conteúdo de mapas do tesouro na T2A.
- Data do limite de 5 slots de pet.
- O que o Animal Lore exibia.
- Arquivos Stratics de 1999 e 2000 e wiki do UO Second Age inacessíveis (Wayback bloqueada, 403, 522).

---

## 12. Referências

Data de acesso de todas as referências: 2026-10-27.

**Licenças conferidas:**
- RunUO: GPL-2.0, conferida no LICENSE [W4]. Vale para todas as referências "código (RunUO)".
- ServUO: GPL-2.0 [W88].
- ModernUO: GPL-3.0 [W89].

Os arquivos de código foram lidos só para entender comportamento; nada foi copiado.

| id | título | URL | tipo | licença |
|---|---|---|---|---|
| W1 | UOGuide: Lost Lands | https://www.uoguide.com/Lost_Lands | wiki | — |
| W2 | UOGuide: Felucca | https://www.uoguide.com/Felucca | wiki | — |
| W3 | RunUO: Scripts/Misc/MapDefinitions.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/MapDefinitions.cs | código | GPL-2.0 |
| W4 | RunUO: LICENSE | https://raw.githubusercontent.com/runuo/runuo/master/LICENSE | licença | GPL-2.0 |
| W5 | wikiwiki.jp uoemu: Tips29 (tamanho do mapa pré/pós-ML) | https://wikiwiki.jp/uoemu/Tips29 | wiki | — |
| W6 | uo.com: patch de 24/10/1998 (The Second Age) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-15-24th-october/ | documentação oficial | — |
| W7 | uo.com: Publish 5, 27/04/2000 (Renaissance) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-05-27th-april/ | documentação oficial | — |
| W8 | UOGuide: Moongate | https://www.uoguide.com/Moongate | wiki | — |
| W9 | UOGuide: Recall | https://www.uoguide.com/Recall | wiki | — |
| W10 | uo.com: Publish 1, 23/11/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-publish-01-23rd-november/ | documentação oficial | — |
| W11 | uo.com: patch de 25/08/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-07-25th-august/ | documentação oficial | — |
| W12 | uo.com: Publish 3, 23/02/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-03-23rd-february/ | documentação oficial | — |
| W13 | UOGuide: Guard Zone | https://www.uoguide.com/Guard_Zone | wiki | — |
| W14 | RunUO: Scripts/Regions/GuardedRegion.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Regions/GuardedRegion.cs | código | GPL-2.0 |
| W15 | RunUO: Scripts/Mobiles/Guards/WarriorGuard.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Guards/WarriorGuard.cs | código | GPL-2.0 |
| W16 | RunUO: Scripts/Regions/DungeonRegion.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Regions/DungeonRegion.cs | código | GPL-2.0 |
| W17 | RunUO: Scripts/Regions/BaseRegion.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Regions/BaseRegion.cs | código | GPL-2.0 |
| W18 | uo.com: patch de 13/01/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-1-12th-january/ | documentação oficial | — |
| W19 | UOGuide: Time | https://www.uoguide.com/Time | wiki | — |
| W20 | RunUO: Scripts/Misc/LightCycle.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/LightCycle.cs | código | GPL-2.0 |
| W21 | RunUO: Scripts/Misc/Weather.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/Weather.cs | código | GPL-2.0 |
| W22 | uo.com: patch de 27/02/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-6-27th-february/ | documentação oficial | — |
| W23 | RunUO: Server/Mobile.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Mobile.cs | código | GPL-2.0 |
| W24 | RunUO: Scripts/Engines/Pathing/Movement.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Pathing/Movement.cs | código | GPL-2.0 |
| W25 | RunUO: Scripts/Misc/Fastwalk.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/Fastwalk.cs | código | GPL-2.0 |
| W26 | RunUO: Scripts/Mobiles/AI/SpeedInfo.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/SpeedInfo.cs | código | GPL-2.0 |
| W27 | Z. B. Simpson, "The In-game Economics of Ultima Online" (1999), cópia em gwern.net | https://gwern.net/doc/economics/1999-04-07-simpson-theingameconomicsofultimaonline.html | artigo técnico | — |
| W28 | RunUO: Scripts/Mobiles/Vendors/GenericBuy.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Vendors/GenericBuy.cs | código | GPL-2.0 |
| W29 | RunUO: Scripts/Mobiles/Vendors/BaseVendor.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Vendors/BaseVendor.cs | código | GPL-2.0 |
| W30 | RunUO: Scripts/Mobiles/Vendors/GenericSell.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Vendors/GenericSell.cs | código | GPL-2.0 |
| W31 | RunUO: Scripts/Mobiles/Vendors/SBInfo/SBBlacksmith.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Vendors/SBInfo/SBBlacksmith.cs | código | GPL-2.0 |
| W32 | RunUO: Scripts/Mobiles/Vendors/SBInfo/SBHouseDeed.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Vendors/SBInfo/SBHouseDeed.cs | código | GPL-2.0 |
| W33 | uo.com: patch de 16/09/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-12-16th-september/ | documentação oficial | — |
| W34 | uo.com: Publish 4, 08/03/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-04-8th-march/ | documentação oficial | — |
| W35 | RunUO: Scripts/Mobiles/BaseCreature.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/BaseCreature.cs | código | GPL-2.0 |
| W36 | uo.com: patch de 10/10/1997 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1997-2/1997-2-10th-october/ | documentação oficial | — |
| W37 | uo.com: patch de 05/11/1997 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1997-2/1997-5-5th-november/ | documentação oficial | — |
| W38 | uo.com: patch de 28/03/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-04-28th-march/ | documentação oficial | — |
| W39 | uo.com: patch de 24/02/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-03-24th-february/ | documentação oficial | — |
| W40 | RunUO: Scripts/Mobiles/Healers/BaseHealer.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Healers/BaseHealer.cs | código | GPL-2.0 |
| W41 | uo.com: patch de 02/02/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-02-2nd-february/ | documentação oficial | — |
| W42 | RunUO: Scripts/Engines/Harvest/Mining.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Harvest/Mining.cs | código | GPL-2.0 |
| W43 | RunUO: Scripts/Engines/Harvest/Lumberjacking.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Harvest/Lumberjacking.cs | código | GPL-2.0 |
| W44 | RunUO: Scripts/Engines/Harvest/Fishing.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Harvest/Fishing.cs | código | GPL-2.0 |
| W45 | uo.com: patch de 19/01/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-01-19th-january/ | documentação oficial | — |
| W46 | uo.com: patch de 25/05/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-07-25th-may/ | documentação oficial | — |
| W47 | uo.com: patch de 22/09/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-08-22nd-september/ | documentação oficial | — |
| W48 | RunUO: Scripts/Engines/Craft/Core/CraftItem.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Craft/Core/CraftItem.cs | código | GPL-2.0 |
| W49 | RunUO: Scripts/Engines/Craft/DefBlacksmithy.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Craft/DefBlacksmithy.cs | código | GPL-2.0 |
| W50 | RunUO: Scripts/Engines/Craft/Core/Repair.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Craft/Core/Repair.cs | código | GPL-2.0 |
| W51 | uo.com: patch de 13/04/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-8-13th-april/ | documentação oficial | — |
| W52 | uo.com: patch de 10/11/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-18-10th-november/ | documentação oficial | — |
| W53 | uo.com: patch de 21/12/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-21-21st-december/ | documentação oficial | — |
| W54 | uo.com: patch de 02/12/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-20-2nd-december/ | documentação oficial | — |
| W55 | RunUO: Scripts/Multis/Houses.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Multis/Houses.cs | código | GPL-2.0 |
| W56 | RunUO: Scripts/Multis/HousePlacement.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Multis/HousePlacement.cs | código | GPL-2.0 |
| W57 | RunUO: Scripts/Multis/BaseHouse.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Multis/BaseHouse.cs | código | GPL-2.0 |
| W58 | UOGuide: House Decay | https://www.uoguide.com/House_Decay | wiki | — |
| W59 | UOGuide: Castle | https://www.uoguide.com/Castle | wiki | — |
| W60 | RunUO: Scripts/Mobiles/AI/MeleeAI.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/MeleeAI.cs | código | GPL-2.0 |
| W61 | RunUO: Scripts/Mobiles/AI/AnimalAI.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/AnimalAI.cs | código | GPL-2.0 |
| W62 | RunUO: Scripts/Mobiles/AI/MageAI.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/MageAI.cs | código | GPL-2.0 |
| W63 | RunUO: Scripts/Mobiles/AI/BaseAI.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/BaseAI.cs | código | GPL-2.0 |
| W64 | RunUO: Scripts/Engines/Spawner/Spawner.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Engines/Spawner/Spawner.cs | código | GPL-2.0 |
| W65 | RunUO: Scripts/Regions/Spawning/SpawnEntry.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Regions/Spawning/SpawnEntry.cs | código | GPL-2.0 |
| W66 | Raph Koster: "Did players destroy the UO ecology?" | https://www.raphkoster.com/?p=46439 | blog do designer | — |
| W67 | Raph Koster: "GDCOnline: Ultima Online postmortem" (com comentários) | https://www.raphkoster.com/?p=4228 | blog / fórum | — |
| W68 | uo.com: Publish 2, 24/01/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-02-24th-january/ | documentação oficial | — |
| W69 | UOGuide: Pets | https://www.uoguide.com/Pets | wiki | — |
| W70 | UOGuide: Animal Taming | https://www.uoguide.com/Animal_Taming | wiki | — |
| W71 | RunUO: Monsters/Humanoid/Melee/Orc.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Monsters/Humanoid/Melee/Orc.cs | código | GPL-2.0 |
| W72 | RunUO: Monsters/Humanoid/Melee/Skeleton.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Monsters/Humanoid/Melee/Skeleton.cs | código | GPL-2.0 |
| W73 | RunUO: Monsters/Humanoid/Melee/Zombie.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Monsters/Humanoid/Melee/Zombie.cs | código | GPL-2.0 |
| W74 | RunUO: Monsters/Humanoid/Melee/Ettin.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Monsters/Humanoid/Melee/Ettin.cs | código | GPL-2.0 |
| W75 | RunUO: Monsters/Humanoid/Magic/OrcishMage.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Monsters/Humanoid/Magic/OrcishMage.cs | código | GPL-2.0 |
| W76 | RunUO: Animals/Rodents/SewerRat.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Animals/Rodents/SewerRat.cs | código | GPL-2.0 |
| W77 | RunUO: Animals/Rodents/GiantRat.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Animals/Rodents/GiantRat.cs | código | GPL-2.0 |
| W78 | RunUO: Animals/Mounts/Horse.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/Animals/Mounts/Horse.cs | código | GPL-2.0 |
| W79 | RunUO: Scripts/Misc/LootPack.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/LootPack.cs | código | GPL-2.0 |
| W80 | RunUO: Scripts/Items/Weapons/BaseWeapon.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/BaseWeapon.cs | código | GPL-2.0 |
| W81 | RunUO: Scripts/Items/Armor/BaseArmor.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Armor/BaseArmor.cs | código | GPL-2.0 |
| W82 | UOGuide: Vanquishing | https://www.uoguide.com/Vanquishing | wiki | — |
| W83 | UOGuide: Treasure Map | https://www.uoguide.com/Treasure_Map | wiki | — |
| W84 | RunUO: Scripts/Items/Misc/Corpses/Corpse.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Misc/Corpses/Corpse.cs | código | GPL-2.0 |
| W85 | RunUO: Server/Item.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Item.cs | código | GPL-2.0 |
| W86 | ServUO forum: items decay inside private houses | https://www.servuo.dev/threads/items-decay-inside-private-houses-%E2%80%93-how-to-restore-runuo-behavior-in-servuo-57-4-1.17329/ | fórum | — |
| W87 | uo.com: patch de 28/10/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-16-28th-october/ | documentação oficial | — |
| W88 | ServUO: LICENSE | https://raw.githubusercontent.com/ServUO/ServUO/master/LICENSE | licença | GPL-2.0 |
| W89 | ModernUO: LICENSE | https://raw.githubusercontent.com/modernuo/ModernUO/main/LICENSE | licença | GPL-3.0 |
| W90 | UOGuide: Classic Houses | https://www.uoguide.com/Classic_Houses | wiki | — |
| W91 | Ultima Codex wiki: UO Second Age | https://wiki.ultimacodex.com/wiki/UO_Second_Age | wiki | — |
| W92 | UO Second Age (shard T2A) | https://www.uosecondage.com/ | site de comunidade | — |
| W93 | uo.com: patch de 14/04/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-06-14th-april/ | documentação oficial | — |
| W94 | uo.com: índice de publishes antigos (1997–2000) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/ | documentação oficial | — |
| W95 | uo.com: patch de 01/10/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-13-1st-october/ | documentação oficial | — |

**Observações sobre as referências:**
- **W90, W91 e W92:** consultadas para contexto (nomes das casas clássicas, existência de um shard dedicado à T2A). W92 confirma um shard de 2007 que diz emular a T2A de 1999; o wiki dele estava fora do ar (522).
- **W94:** índice usado para localizar as notas de patch.
