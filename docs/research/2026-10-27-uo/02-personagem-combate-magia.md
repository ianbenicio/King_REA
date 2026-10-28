# Outrora — Personagem, combate e magia na era T2A (pesquisa pública)

**Projeto:** Outrora (jogo próprio em Unity, single-player e local, inspirado no Ultima Online)
**Recorte:** regras da era **T2A — The Second Age** (01/10/1998 a 04/05/2000), com as mudanças anteriores e posteriores marcadas quando ajudam a decidir.
**Autor:** @analyst (Atlas)
**Data da pesquisa:** 2026-10-27
**Método:** só WebSearch e WebFetch. Fontes oficiais (notas de publish no uo.com), wikis (UOGuide, UltimaCodex, wiki oficial do uo.com), artigo de designer (Raph Koster), fórum (POL) e código aberto de emulador (RunUO, lido só para entender o comportamento).
**Sala limpa:** nenhum código foi colado nem traduzido linha a linha. As fórmulas abaixo estão em notação própria, com nomes de variáveis próprios. Citações literais, quando há, têm menos de 15 palavras.
**Texto de página como dado:** nenhuma das páginas lidas trazia texto dirigido a um assistente de IA. Nada foi executado a partir do conteúdo das fontes.

---

## Sumário executivo

1. **O emulador e o T2A não coincidem.** O RunUO separa o código em ramos "AOS" e "não-AOS" [M29–M59]. O ramo não-AOS reproduz o **estado final antes do Age of Shadows** (fim de 2002), que já inclui mudanças do Renaissance (UOR, maio de 2000) e de publishes posteriores. Para o T2A, a base mais segura são as **notas de publish de 1998–2000** no uo.com [M2–M15]. O RunUO é o único lugar com fórmulas completas e serve como modelo numérico; o T2A é o contexto que define quais regras existiam.
2. **Mudanças dentro da própria era T2A** que alteram a simulação:
   - fev/1999: a velocidade do golpe passa a depender da **estamina atual** em vez da destreza, o skill **Meditation** é criado e a regeneração de mana passa a depender dela, da inteligência e da armadura [M5];
   - fev/1999: entram os skills **Stealth** e **Remove Trap**; Magic Resistance passa a reduzir até metade do dano dos spells e Evaluating Intelligence passa a pesar no resist [M6];
   - mar/1999: entra a contagem de assassinatos de **longo prazo** (decai 1 a cada 40 h), ao lado da de curto prazo (1 a cada 8 h) [M7];
   - nov/1999: chegam as **travas de skill** (sobe, desce e para) [M11];
   - mar/2000: bônus de ganho de skill na **primeira hora de jogo do dia**, o "power hour" [M14].
3. **Ficam de fora do T2A estrito:** desarme e stun de wrestling, a tabela oficial de parry por escudo e a tabela de armaduras por material (todos do Publish 5, de abr/2000, que preparou o UOR) [M15]; Trammel/Felucca [M15]; travas de stat (inferência); Guaranteed Gain System (2002) [M69].
4. **Lacunas principais:** a fórmula oficial de ganho de skill nunca foi publicada; os pontos iniciais de criação de personagem na era (65 de stat e 3 skills somando 100 é lembrança comum, sem fonte confirmada); a curva oficial de resist; a taxa oficial de regeneração de vida e estamina; o percentual exato de perda por assassinato no T2A.

---

## 0. Eras e confiabilidade das fontes

| Marco | Data | Fonte |
|---|---|---|
| Lançamento do UO | 24/09/1997 | [M1] |
| Sistema de reputação (fama e karma separados, murder counts) | primavera de 1998 | [M16] |
| **The Second Age (T2A)** | **01/10/1998**; publish de conteúdo (Lost Lands) em 24/10/1998 | [M1] [M73] |
| Escala de armas, curva de ganho, todos os skills podem chegar a 100 | 10/11/1998 | [M3] |
| Swing pela estamina, Meditation, bônus de dano por Anatomy | 02/02/1999 | [M5] |
| Stealth, Remove Trap, resist reduz dano | 24/02/1999 | [M6] |
| Murder counts de longo prazo | 28/03/1999 | [M7] |
| Tempos de bandagem | 25/05/1999 | [M9] |
| Travas de skill (Publish 1) | 23/11/1999 | [M11] |
| Publishes 2, 3 e 4 | jan–mar/2000 | [M12] [M13] [M14] |
| Publish 5 (pré-UOR: Trammel, parry, wrestling) | 27/04/2000 | [M15] |
| **Renaissance (fim do T2A)** | **04/05/2000** | [M1] |
| Age of Shadows | 11/02/2003 | [M1] |

**Níveis de confiança usados no documento:**
- **A** — nota oficial de publish da época [M2–M15]. Alta confiança sobre *o que* mudou, mas quase nunca traz números.
- **B** — wiki e artigos [M16–M27, M60, M61]. Em geral descrevem a era pós-AOS (UOGuide e a wiki do uo.com). Útil para nomes, listas e regras estáveis.
- **C** — código de emulador (RunUO, GPL-2.0) [M28–M59]. Fórmulas completas do estado pré-AOS final, que é uma aproximação do T2A.
- **D** — fórum ou resultado de busca sem leitura completa [M62–M72]. Indício, não prova.

Existe um shard de fãs, o UO Second Age, que mira o último patch antes do UOR e anuncia sistema criminal de 1999 e stat loss para assassinos, mas não publica números [M27].

---

## 1. Stats (força, destreza, inteligência)

### 1.1 Papel de cada stat
- **Força:** pontos de vida, capacidade de carga e dano corpo a corpo [M18]. Em jan/1999, magias que mexem na força passaram a afetar a carga [M4].
- **Destreza:** estamina e skills como Snooping e Parrying [M18]. A partir de fev/2000, a destreza também encurta o tempo de bandagem [M13]. Até fev/1999 ela definia a velocidade do golpe (ver 3.1) [M5].
- **Inteligência:** mana e skills como Magery [M18]. Também pesa na regeneração de mana desde fev/1999 [M5].

### 1.2 Derivados
- **Vida máxima** = 50 + Força/2, com divisão inteira [M19] [M45]. No ramo pré-AOS do RunUO entra a força "crua", sem bônus de itens ou magias [M46].
  - **Conflito ou lacuna:** há lembrança de jogadores de que, nos primeiros anos, a vida seria igual à força. Não achei fonte (não confirmado). As duas regras dão 100 de vida com 100 de força e divergem abaixo disso.
- **Estamina máxima** = Destreza [M45].
- **Mana máxima** = Inteligência [M45].

### 1.3 Caps
- **Total de stats: 225.** É o valor legado no RunUO para personagens antigos [M45], o padrão do POL [M72] e o valor atual oficial para personagem novo sem scroll [M71]. Já havia stat cap em nov/1998, porque a atrofia de stat só ocorria ao atingi-lo [M3].
- **Por stat:** **100** na era pré-AOS segundo um guia de baixa confiabilidade [M70]. Hoje é 125 [M18] [M71]. Tomar 100 como cap individual do T2A é **inferência** apoiada no fato de que o 125 aparece só em descrições pós-AOS.

### 1.4 Ganho de stat pelo uso de skill
Evolução oficial ao longo da era:
- **nov/1998:** o ganho de stat passa a ocorrer em qualquer nível de skill (antes, o GM não ganhava stat); existe uma chance mínima; o avanço geral fica mais lento; a atrofia de stat só acontece no cap [M3].
- **nov/1999 (travas):** skills em "desce" ou "para" não dão stat. No cap de skill, só se ganha stat com outro skill em "desce" e pontos para atrofiar, ou com um skill já GM [M11].
- **jan/2000:** o ganho de stat fica num ritmo mais constante em qualquer nível de skill. Todo skill, inclusive de combate, pode subir seus stats associados, com pesos diferentes (Anatomy sobe mais INT, mas pode subir STR e DEX) [M12].
- **mar/2000:** a chance de ganhar stat aumenta, mas só se rola quando o skill de fato sobe. A exceção são skills em "sobe" que já estão em 100 [M14].

**Modelo numérico (RunUO, pré-AOS final):** cada skill tem três pesos, um por stat. A chance de cada stat subir num uso é peso / 33,3, testada na ordem força, destreza e inteligência, e no máximo um stat sobe por uso [M30] [M44]. Pesos resumidos, em força / destreza / inteligência:
- **combate:** Swordsmanship 0,75/0,25/0; Mace Fighting 0,9/0,1/0; Fencing 0,45/0,55/0; Wrestling 0,9/0,1/0; Archery 0,25/0,75/0; Parrying 0,75/0,25/0; Tactics 0/0/0;
- **magia:** Magery 0/0/1,5; Evaluating Intelligence 0/0/1; Resisting Spells 0,25/0,25/0,5; Meditation 0/0/0;
- **ofícios:** Blacksmithy 1/0/0; Lumberjacking 2/0/0; Mining 2/0/0; Lockpicking 0/2/0; Snooping 0/2,5/0; Cooking 0/2/3; Healing 0,6/0,6/0,8.
- **Observação:** o RunUO impõe 15 minutos entre ganhos de stat [M30]. É escolha do emulador; nenhuma fonte oficial da época confirma esse intervalo.
- **Era posterior, para comparação:** hoje não há intervalo fixo, a chance é de 1 em 20 por avanço de skill e o stat primário é escolhido em 75% dos casos [M18].
- **Travas de stat** (setas no status) não aparecem nas notas do T2A. O Publish 1 criou só as travas de skill [M11], então travas de stat no T2A seriam anacronismo (**inferência**).

### 1.5 Regeneração
- **Mana:** desde 02/02/1999 depende de Meditation, Inteligência e armadura vestida [M5]. Modelo RunUO pré-AOS, em segundos por ponto de mana:
  - x = (Int + Meditation) / 2. O resumo da fonte foi ambíguo; a média é a leitura coerente com a continuidade da curva em x = 100 (**inferência**).
  - Se x ≤ 0, o intervalo é 7 s. Se 0 < x ≤ 100, intervalo = 7 − 239·x/2400 + 19·x²/48000, o que dá 7 s em x = 0 e 1 s em x = 100. Se 100 < x < 120, 1 s. Se x ≥ 120, 0,75 s.
  - A armadura soma uma penalidade: a AR ponderada de cada peça não "medável" (inteira se não permite meditação, metade se permite em parte) dividida por 4.
  - Meditação ativa divide o intervalo por 2. O resultado final fica entre 0,5 e 7 s [M43].
- **Vida e estamina:** no RunUO pré-AOS os intervalos são fixos, 1 ponto a cada 11 s (vida) e 1 a cada 7 s (estamina) [M43]. A taxa oficial do T2A (e se a fome influía) é **lacuna**.
- **Era posterior, não usar no T2A:** fórmula moderna da Meditation, 2 + (Meditation·3 + Int)/40 [M20].

### 1.6 Criação de personagem
- **No RunUO** (estado pós-UOR): stats somando 80 (ou 90 no fluxo novo), cada um entre 10 e 60; skills iniciais somando 100 ou 120, cada um com no máximo 50 [M54].
  - Templates: Warrior (Anatomy 30, Healing 45, Swords 35, Tactics 50), Magician (Eval Int 30, Wrestling 30, Magery 50, Meditation 50) e Blacksmith (Mining 30, Arms Lore 30, Blacksmith 50, Tinkering 50) [M54].
  - O Magician usa Meditation, então esse template é posterior a fev/1999 (**inferência**).
- **Itens iniciais pré-AOS:** os itens dados pelos skills iniciais são "newbie" e ficam com o personagem na morte. O spellbook vem com 30 reagentes e scrolls; Healing dá 50 bandagens; Archery dá arco e 25 flechas [M54].
- **T2A:** o manual original fala em três skills iniciais [M68], mas o PDF é digitalizado e não pôde ser lido. "65 pontos de stat e 100 de skill em 3 skills" é **não confirmado**.

---

## 2. Skills

### 2.1 Lista (49 no fim da era)
Pela ordem interna dos emuladores [M44]:

| Faixa | Skills |
|---|---|
| 0 a 9 | Alchemy, Anatomy, Animal Lore, Item Identification, Arms Lore, Parrying, Begging, Blacksmithy, Bowcraft/Fletching, Peacemaking |
| 10 a 19 | Camping, Carpentry, Cartography, Cooking, Detecting Hidden, Enticement (depois chamado Discordance), Evaluating Intelligence, Healing, Fishing, Forensic Evaluation |
| 20 a 29 | Herding, Hiding, Provocation, Inscription, Lockpicking, Magery, Resisting Spells, Tactics, Snooping, Musicianship |
| 30 a 39 | Poisoning, Archery, Spirit Speak, Stealing, Tailoring, Animal Taming, Taste Identification, Tinkering, Tracking, Veterinary |
| 40 a 48 | Swordsmanship, Mace Fighting, Fencing, Wrestling, Lumberjacking, Mining, Meditation, Stealth, Remove Trap |

- **Datas de entrada:** Meditation em 02/02/1999 [M5]; Stealth (exige 80 de Hiding) e Remove Trap (exige 50 de Lockpicking e 50 de Detecting Hidden) em 24/02/1999 [M6]. No lançamento do T2A eram **46 skills** (**inferência** a partir dessas datas).
- **Títulos:** em mai/1999 o título profissional do Animal Taming passou de "Ranger" a "Tamer" e o do Animal Lore de "Scholar" a "Ranger" [M9].

### 2.2 Caps
- **Total: 700,0 pontos** [M11] [M44].
- **Por skill: 100,0.** Desde 10/11/1998 qualquer skill pode chegar a 100 (antes, alguns não chegavam) [M3]. Valores como 720 ou 120 por skill são de eras posteriores.

### 2.3 Chance de sucesso (curva mínimo e máximo)
- Skills baseados em dificuldade usam uma janela [d_min, d_max]. Com s = valor do skill:
  - se s < d_min, a ação falha sem rolagem;
  - se s ≥ d_max, a ação sempre tem sucesso;
  - entre os dois, a chance de sucesso é P = (s − d_min)/(d_max − d_min) [M30].
- Alguns skills usam chance direta, sem janela [M30].
- **Oficial:** desde 1997–1999, vários skills passaram a ser "baseados em dificuldade", como Tailoring e Poisoning em jan/1999 [M4], Tinkering em mai/1999 (itens mais difíceis dão ganho maior) [M9] e Carpentry em dez/1998.

### 2.4 Ganho de skill

**O que o OSI publicou na era:**
- **out/1998:** acabou o aprendizado "olhando" outros usarem skills. O ganho de Healing e de Veterinary passou a crescer com a quantidade de vida perdida pelo alvo [M2].
- **nov/1998:** a curva de avanço "achata" a partir de ~45 num skill típico (varia por skill). Segurar um spellbook impede ganhar Tactics e Wrestling [M3].
- **jan/2000:** 20 skills sem dificuldade passam a precisar de menos usos nos níveis altos [M12]. São eles: Anatomy, Animal Lore, Item ID, Arms Lore, Begging, Eval Int, Spirit Speak, Hiding, Tracking, Camping, Cooking, Musicianship, Lockpicking, Mining, Lumberjacking, Peacemaking, Provocation, Enticement, Cartography e Fishing.
- **mar/2000 (Publish 4):**
  - chance aumentada de ganho na **primeira hora de jogo de cada dia**, por personagem; afeta só o ganho, não o sucesso [M14];
  - o nome "power hour" é da comunidade [M64]; a nota oficial não usa o termo (**inferência** de que se trata do mesmo mecanismo);
  - a "tabela de uso de skills" deixa de flutuar conforme o uso;
  - os skills de "lore" e similares passam a ter 1 s de espera entre usos;
  - o anti-macro passa a exigir variar alvo e objeto em quase todos os skills (ofícios isentos; skills de combate afetados só dentro de casas);
  - entram os ganhos secundários: Eval Int ao usar Magery, Anatomy ao lutar ou curar, Lumberjacking ao lutar com machado, Meditation a cada ponto de mana regenerado, Hiding ao usar Stealth, Detect Hidden ao lidar com armadilhas e Animal Lore ao domar [M14].
- **Pós-era, não usar:** o Guaranteed Gain System (jul/2002) garante um ganho mínimo após um período sem ganho [M69].

**Modelo numérico (RunUO, pré-AOS final)** [M30]. Variáveis:
- s = valor atual do skill e c_s = cap do skill;
- T = soma de todos os skills e c_T = cap total;
- P = chance de sucesso da ação; f = fator de ganho do skill (padrão 1);
- b = bônus pelo resultado: 0,5 no sucesso e 0,2 na falha. No AOS o bônus da falha cai para 0, o que mostra que no pré-AOS **a falha também ensina**.

As contas:
- chance de ganho g = f · ( [ (c_T − T)/c_T + (c_s − s)/c_s ] / 2 + (1 − P)·b ) / 2, com piso de 0,01;
- se s < 10,0, há ganho automático (ignora o anti-macro);
- **tamanho do ganho:** 0,1 ponto; com s ≤ 10,0, de 0,1 a 0,4 aleatório;
- só ganha se a trava está em "sobe" e se T + ganho cabe no cap.

Leitura do modelo: ações difíceis (P baixo) ensinam mais, e o ganho desacelera perto do cap do skill e do cap total. Isso bate com o "achatamento" descrito em nov/1998 [M3] (**inferência**).

**Divergência entre emuladores:** no POL e no Sphere cada shard calibra a própria curva [M62] [M67]. Um jogador relata que 45–75% de sucesso é a faixa boa para treinar [M64] (anedótico).

### 2.5 Travas e atrofia
- **Antes de 23/11/1999:** sem travas. No cap, a atrofia era automática e, desde nov/1998, mirava os skills **menos usados**, com frequência menor que antes [M3].
- **Publish 1 (23/11/1999):** cada skill ganha uma trava de três estados [M11]:
  - **sobe:** o skill sobe e nunca desce;
  - **desce:** o skill pode atrofiar;
  - **para:** o skill nem sobe nem desce.
  - A atrofia só ocorre quando outro skill sobe; com tudo em "desce", nada muda. Assassinos sofrem a perda na morte mesmo com travas. A janela de skills passa a mostrar o total sem modificadores para comparar com o cap de 700.
- **Modelo RunUO:** a cada ganho, com probabilidade T/c_T, um skill em "desce" perde o mesmo valor [M30].

---

## 3. Combate corpo a corpo e à distância (pré-AOS)

### 3.1 Velocidade do golpe
- **Até 02/02/1999:** dependia da **destreza**. A fórmula dessa fase é **lacuna**.
- **De 02/02/1999 em diante:** depende da **estamina atual** [M5]. Equipar uma arma impõe uma pequena espera antes do primeiro golpe [M5].
- **Modelo RunUO pré-AOS:** intervalo entre golpes (s) = 15000 / ((Estamina_atual + 100) · V), onde V é a velocidade "antiga" da arma [M29].
  - Exemplos com 100 de estamina: katana (V = 58) dá ≈ 1,29 s; arco (V = 20) dá 3,75 s; punhos (V = 30) dá 2,5 s [M57] [M58] [M59].
  - O wiki de um shard custom usa a mesma forma, com estamina limitada a 100 [M65].
- **Pós-AOS, não usar:** a fórmula em "ticks" com Swing Speed Increase [M17].

### 3.2 Chance de acerto
- **Modelo RunUO:** com A = skill de arma do atacante e D = skill de arma do defensor (Wrestling se ele estiver desarmado), ambos limitados a no mínimo −49,9:
  - P_acerto = (A + 50) / (2·(D + 50)) [M29];
  - skills iguais dão 50%; 100 contra 0 dá 100%; 0 contra 100 dá 16,7%.
  - A rolagem é também o teste de ganho do skill de arma do atacante [M29].
- **Variante do POL (2003):** (A + 50)/(2·D + 50) [M63].
- **Era AOS:** o dev team confirmou 50% com skills iguais e mínimo de 2% [M66]. Esse piso é de era posterior.
- **Alcance:** desde jan/1999 só se inicia ataque contra alvo a até 15 tiles e com linha de visão [M4].

### 3.3 Dano
**Dados oficiais da era:**
- 10/11/1998: primeira "escala de armas", com os três tipos de proficiência equilibrados e táticas diferentes; algumas armas são melhores contra armadura pesada, outras contra magos [M3].
- 02/02/1999: o dano passa a ser calculado no **início** do golpe; maças drenam estamina e gastam mais a armadura; Anatomy passa a dar bônus de dano [M5].

**Modelo RunUO pré-AOS** [M29]. Etapas, nesta ordem (**inferência** sobre a ordem exata da composição):
1. **Base:** valor uniforme entre o mínimo e o máximo da arma, mais 2·n − 1 pelo nível mágico (n = 1 Ruin, 3 Might, 5 Force, 7 Power, 9 Vanquishing; o "regular" não soma). Exemplos: katana 5–26, arco 9–41, punhos 1–8 [M57] [M58] [M59].
2. **Tactics:** multiplica por 1 + (Tactics − 50)/100, isto é, −50% com 0, neutro com 50 e +50% com 100.
3. **Força:** +1% a cada 5 pontos.
4. **Anatomy:** +1% a cada 5 pontos, e +10% extra com 100.
5. **Lumberjacking**, só com machados: +1% a cada 5 pontos, e +10% com 100.
   - **Conflito:** o Publish 5 (UOR, abr/2000) dá 25% com 99,9 e 35% com GM [M15]; o RunUO dá 20% e 30%.
6. **Qualidade e durabilidade:** a arma excepcional soma um bônus de qualidade; a arma gasta escala o dano entre 50% e 100% conforme a razão entre durabilidade atual e máxima.
7. **Metade em PvP:** o dano cai pela metade quando o defensor é jogador ou o atacante não é. Isso é do RunUO; a correspondência com o T2A não foi verificada.
8. **Armadura:** absorção (3.4). O dano final mínimo é 1.

### 3.4 Armadura
- **Parte do corpo atingida** (sorteio por golpe): pescoço 7%, mãos 7%, braços 14%, cabeça 15%, pernas 22%, peito 35% [M29] [M52].
- **Absorção da peça atingida:** valor uniforme entre AR/2 e AR da própria peça (AR da peça, não a AR total) [M52].
- **AR exibida no status:** soma das AR de cada peça multiplicadas pelo peso da sua parte do corpo (0,07, 0,07, 0,14, 0,15, 0,22, 0,35) [M52].
- **Bônus de AR:**
  - nível de proteção: Defense +15, Guarding +20, Hardening +25, Fortification +30, Invulnerability +35;
  - qualidade: excepcional +8, baixa −8;
  - durabilidade: a AR cai até a metade conforme o desgaste [M52].
- **Tabela por material** (conjunto completo, AR e penalidade de destreza): plate 40/−22, female plate 30/−5, chain 28/−12, ring 22/−6, studded 18/0, leather 13/0, bone 30/−15. Leather deixa de atrapalhar Meditation e Stealth [M15]. É do **UOR**; no T2A, a penalidade de destreza e os valores exatos são **lacuna**.
- **Desgaste:** cada golpe recebido tem 25% de chance de gastar a armadura (maças gastam mais) [M52] [M5].

### 3.5 Durabilidade de armas
Cada acerto tem 4% de chance de tirar 1 ponto de durabilidade. Zerada a durabilidade atual, cai a máxima, e no fim a arma se destrói [M29]. Bônus de durabilidade: excepcional +20%, Durable +20%, Substantial +50%, Massive +70%, Fortified +100%, Indestructible +120% [M29].

### 3.6 Parry com escudo
- **Modelo RunUO pré-AOS:**
  - AR efetiva do escudo E = AR_base · Parry/200 + 1;
  - chance de bloqueio = max(0,01; (Parry − 2·E)/100), como teste do skill Parrying;
  - no bloqueio, o dano cai E/2 contra corpo a corpo e E contra flechas;
  - o escudo tem 25% de chance de perder 0–1 de durabilidade por bloqueio [M53].
  - Escudos pesados bloqueiam menos e absorvem mais.
- **Oficial (UOR, abr/2000):** buckler ≈ 86% de bloqueio com 100 de Parry e absorve ≈ 10; chaos shield ≈ 36% e absorve ≈ 48 [M15].
- **Conflito:** os números do modelo RunUO não reproduzem esses valores. O comportamento do T2A é **lacuna**.
- A versão de parry do RunUO com Bushido e destreza abaixo de 80 é de era SE (2004) e não serve ao T2A [M29].

### 3.7 Wrestling e desarme
- **Punhos:** dano 1–8, velocidade 30 [M59]. O Wrestling também é o skill defensivo de quem está desarmado (ver 3.2).
- **Desarme e stun punch:** chegaram no **Publish 5 (27/04/2000, UOR)**. Exigem 80+ em Wrestling e em Arms Lore (desarme) ou Anatomy (stun), custam 15 de estamina e têm 10 s de espera depois de um sucesso; a paralisia dura 4 s [M15].
  - O RunUO marca esses golpes como "pré-AOS" e usa chance = (Wrestling + skill secundário)/400, isto é, 40% com 80/80 e 50% com 100/100 [M59].
  - **No T2A estrito não existem.**

### 3.8 Arma envenenada
- **jan/1999:** Poisoning passa a ser baseado em dificuldade (veneno mais forte exige mais skill); a falha pode envenenar o próprio usuário com dose um pouco mais fraca [M4].
- **mai/1999:** o atacante recebe aviso quando a arma envenena a vítima [M9].
- **Modelo RunUO pré-AOS:**
  - só armas de uma mão, cortantes ou perfurantes;
  - cargas = 18 − 2·nível do veneno;
  - −20 de karma por aplicação;
  - abaixo de 80 de Poisoning, a falha tem 5% de chance de envenenar o próprio usuário [M56].
- **UOR (abr/2000):** só lâminas de uma mão; a lâmina "corrói" o veneno (com mais de 50 de Poisoning, o Deadly vira Greater; com mais de 99, vira Regular) [M15].
- A chance por golpe de aplicar o veneno é **lacuna**.

### 3.9 Arco e munição
- **Modelo RunUO pré-AOS:** o atirador precisa ficar parado 1 s antes do disparo; alcance de 10 tiles; cada disparo gasta 1 flecha.
  - Ao errar, 40% de chance de a flecha cair no chão perto do alvo.
  - Ao acertar uma criatura, 40% de chance de a flecha ir para a mochila dela.
  - NPCs não gastam munição [M51] [M58].
- **UOR:** dano mínimo maior, máximo um pouco menor e cadência um pouco maior para arcos e bestas [M15].

---

## 4. Magia

### 4.1 Círculos, mana e reagentes
- **8 círculos com 8 spells cada, 64 no total** [M22] [M60].
- **Mana por círculo:** 4, 6, 9, 11, 14, 20, 40 e 50 [M22] [M31] [M60].
- **Reagentes (8):** Black Pearl, Blood Moss, Garlic, Ginseng, Mandrake Root, Nightshade, Spiders' Silk e Sulfurous Ash [M22]. A fonte não dá quantidades. Uma unidade de cada reagente listado por conjuração é **inferência**.

**Spells e reagentes** [M22] (BP = Black Pearl, BM = Blood Moss, Ga = Garlic, Gi = Ginseng, MR = Mandrake Root, NS = Nightshade, SS = Spiders' Silk, SA = Sulfurous Ash):

| Círculo | Spells |
|---|---|
| 1 | Clumsy (BM, NS); Create Food (Ga, Gi, MR); Feeblemind (NS, Gi); Heal (Ga, Gi, SS); Magic Arrow (SA); Night Sight (SS, SA); Reactive Armor (Ga, SS, SA); Weaken (Ga, NS) |
| 2 | Agility (BM, MR); Cunning (NS, MR); Cure (Ga, Gi); Harm (NS, SS); Magic Trap (Ga, SS, SA); Magic Untrap (BM, SA); Protection (Ga, Gi, SA); Strength (MR, NS) |
| 3 | Bless (MR, Ga); Fireball (BP); Magic Lock (BM, Ga, SA); Poison (NS); Telekinesis (BM, MR); Teleport (BM, MR); Unlock (BM, SA); Wall of Stone (BM, Ga) |
| 4 | Arch Cure (Ga, Gi, MR); Arch Protection (Ga, Gi, MR, SA); Curse (Ga, NS, SA); Fire Field (BP, SS, SA); Greater Heal (Ga, Gi, MR, SS); Lightning (MR, SA); Mana Drain (BP, MR, SS); Recall (BP, BM, MR) |
| 5 | Blade Spirits (BP, MR, NS); Dispel Field (BP, Ga, SS, SA); Incognito (BM, Ga, NS); Magic Reflection (Ga, MR, SS); Mind Blast (BP, MR, NS, SA); Paralyze (Ga, MR, SS); Poison Field (BP, NS, SS); Summon Creature (BM, MR, SS) |
| 6 | Dispel (Ga, MR, SA); Energy Bolt (BP, NS); Explosion (BM, MR); Invisibility (BM, NS); Mark (BP, BM, MR); Mass Curse (Ga, MR, NS, SA); Paralyze Field (BP, Gi, SS); Reveal (BM, SA) |
| 7 | Chain Lightning (BP, BM, MR, SA); Energy Field (BP, MR, SS, SA); Flamestrike (SS, SA); Gate Travel (BP, MR, SA); Mana Vampire (BP, BM, MR, SS); Mass Dispel (BP, Ga, MR, SA); Meteor Swarm (BM, MR, SS, SA); Polymorph (BM, MR, SS) |
| 8 | Earthquake (BM, Gi, MR, SA); Energy Vortex (BP, BM, MR, NS); Resurrection (BM, Ga, Gi); Summon Air Elemental (BM, MR, SS); Summon Daemon (BM, MR, SS, SA); Summon Earth Elemental (BM, MR, SS); Summon Fire Elemental (BM, MR, SS, SA); Summon Water Elemental (BM, MR, SS) |

As descrições do UltimaCodex citam resistências elementais e "follower slots", que são da era AOS. No T2A não havia resistências elementais [M60] (**inferência** pela data do sistema AOS [M1]).

### 4.2 Tempo de conjuração e recuperação
- **Tempo de conjuração** (círculo c de 1 a 8) = 0,25 + 0,25·c segundos: 0,5 s no 1º círculo e 2,25 s no 8º [M21] [M31].
- **Intervalo mínimo até o próximo spell:** 0,75 s no pré-AOS [M32].
- **Alcance (abr/1999):** 10 tiles para spells com alvo em pessoa ou criatura e 15 para spells com alvo em local [M8].
- **Pré-conjuração:** em jan/2000 o cursor de alvo passou a sumir se o mago mexe em itens após conjurar [M12].

### 4.3 Chance de sucesso (Magery contra círculo) e fizzle
- **Modelo RunUO:** cada círculo tem uma janela de 40 pontos centrada em (c − 1)·100/7, com P = (Magery − mínimo)/40 limitado entre 0 e 1 [M31] [M30].

| Círculo | Mínimo (0%) | Garantido (100%) | Chance com 100 de Magery |
|---|---|---|---|
| 1 | −20 | 20 | 100% |
| 2 | −5,7 | 34,3 | 100% |
| 3 | 8,6 | 48,6 | 100% |
| 4 | 22,9 | 62,9 | 100% |
| 5 | 37,1 | 77,1 | 100% |
| 6 | 51,4 | 91,4 | 100% |
| 7 | 65,7 | 105,7 | ≈ 86% |
| 8 | 80 | 120 | 50% |

- **Scrolls:** usam a janela de dois círculos abaixo (um scroll de 8º círculo é garantido com ≈ 91,4) e não gastam reagentes. O scroll é consumido no sucesso [M31] [M32].
- **Fizzle no modelo:** a falha no teste gasta os reagentes, mas não a mana [M32]. O comportamento exato do OSI no T2A é **lacuna**.
- **Faixas de treino modernas:** 30–45 3º círculo, 45–55 4º, até 90–120 8º [M21]. Batem razoavelmente com a tabela.

### 4.4 Interrupção por dano
- **out/1998:** o OSI **reverteu** uma mudança na interrupção de spells por considerá-la desequilibrada [M2]. Os números não foram publicados.
- O spell Protection impede que golpes recebidos interrompam a conjuração [M60]. Desde abr/2000 só um spell defensivo (Reflect, Reactive Armor ou Protection) fica ativo por vez [M15].
- **Modelo RunUO pré-AOS:** dano recebido durante a conjuração interrompe o spell, exceto os do 1º círculo. Após a interrupção, a espera é 1 − √(tempo decorrido / tempo de conjuração), com mínimo de 0,2 s [M32].
- A exceção do 1º círculo não aparece em fonte oficial; marcar como **não confirmado**.

### 4.5 Dano dos spells ofensivos

**Valores-base do RunUO pré-AOS** [M33–M42]:

| Spell | Dano-base | Se resistido | Observações |
|---|---|---|---|
| Magic Arrow (1º) | 4–7 | ×0,75 | [M33] |
| Harm (2º) | 1–15 | ×0,75 | ×0,5 a 2 tiles e ×0,25 além disso [M34] |
| Fireball (3º) | 10–16 | ×0,75 | [M35] |
| Lightning (4º) | 12–20 | ×0,75 | [M36] |
| Mind Blast (5º) | (maior stat − menor stat do alvo)/2, teto 45 | ×0,5 | Stats limitados a 150 [M37] |
| Energy Bolt (6º) | 24–41 | ×0,75 | [M38] |
| Explosion (6º) | 23–44 | ×0,75 | Atraso de 2,5 s no RunUO [M39] |
| Flamestrike (7º) | 27–48 | ×0,6 | [M40] |
| Chain Lightning (7º) | 27–48 | ×0,5 por alvo | Dividido igualmente entre os alvos num raio de 2 tiles [M41] |
| Earthquake (8º) | 60% da vida atual de cada alvo, teto 75 | — | Raio de 1 + Magery/15 tiles [M42] |

**Multiplicador de Evaluating Intelligence:** com EI = Eval Int do mago, RS = Magic Resistance do alvo e M = Magery:
- se EI > RS: k = 1 + (EI − RS)/500;
- se EI ≤ RS: k = 1 + (EI − RS)/200;
- depois soma (M − 100)/400;
- k dobra contra criaturas não humanas e não jogadoras [M32].

**Ajustes e conflitos da era:**
- **Explosion:** passou a causar dano imediato em jan/1999 [M4]; o RunUO usa atraso. Pode ter mudado depois.
- **Flamestrike:** dano médio aumentado, máximo inalterado, em mar/1999 [M7]. Um script do POL usa 6d8 [M63].
- **Mind Blast (UOR):** teto de 60% da vida máxima e de 40 pontos; personagens com stats equilibrados levam menos [M15].

### 4.6 Magic Resistance e Evaluating Intelligence
- **Oficial, 24/02/1999:** Magic Resistance passa a reduzir **até metade** do dano e Eval Int passa a afetar o resist do alvo [M6]. Mana Drain, Mana Vampire e Paralyze tiveram chance de resist e efeitos revistos, e o resist de Drain e Vampire subiu bastante [M6]. Magic Resistance não pode ser treinado em cidade [M6].
- **Modelo RunUO** (o próprio código diz que é cerca de metade da tabela da Stratics) [M31]. Com MR = Magic Resistance do alvo, H = skill de conjuração do mago e c = círculo de 1 a 8:
  - valor "Stratics" V = max(MR/5; MR − ((H − 20)/5 + 5·c));
  - chance de resistir no RunUO = V/2 por cento.
  - Exemplo: MR 100 contra mago com H = 100 conjurando Flamestrike (c = 7) dá V = 49 → 24,5% no RunUO e ≈ 49% pela leitura "Stratics".
  - A curva original da Stratics não pôde ser lida (acesso bloqueado); é **lacuna** e **conflito** a decidir.
- Resistir reduz o dano pelo multiplicador da tabela 4.5. No Poison, o resist anula o efeito [M60].

### 4.7 Spellbook, scrolls e Inscription
- O spellbook guarda os 64 spells. O personagem com Magery inicial recebe um spellbook e scrolls [M54].
- Scrolls podem ser conjurados sem o spell estar no livro (ver 4.3).
- Rune Book (nov/1999): 16 locais, 5–10 cargas conforme a Inscription de quem o fez; feito com 8 scrolls em branco, 1 Recall, 1 Gate e uma runa [M11].
- Desde set/1999, usar um scroll de Meteor Swarm sempre o consome [M74].

### 4.8 Meditation
- Criada em 02/02/1999 [M5]:
  - só funciona segurando apenas o spellbook, sem armadura de metal ou de osso e sem estar bêbado;
  - qualquer ação interrompe;
  - o sucesso dobra a regeneração de mana enquanto dura.
- Fórmula do modelo em 1.5 [M43].
- Desde mar/2000 sobe passivamente a cada ponto de mana regenerado [M14].

---

## 5. Cura, veneno e morte

### 5.1 Bandagens (Healing e Anatomy)

**Tempos oficiais no T2A (25/05/1999)** [M9]:

| Ação | Em outro personagem | Em si mesmo |
|---|---|---|
| Curar vida | 5 s | 15 s |
| Curar veneno | 6 s | 18 s |
| Ressuscitar | 10 s | — |

**Mudanças seguintes:**
- **fev/2000:** a destreza passa a encurtar o tempo e a reduzir a perda por "dedos escorregarem" [M13].
- **Modelo RunUO** (posterior a fev/2000):
  - em si mesmo: 9,4 + 0,06·(120 − Destreza) s;
  - em outro: 3 s com 100+ de destreza, 4 s com 40–99, 5 s abaixo de 40;
  - +5 s para ressuscitar [M49].

**Quantidade curada (modelo RunUO)** [M49], com An = Anatomy e He = Healing:
- mínimo = An/5 + He/5 + 3;
- máximo = An/5 + He/2 + 10;
- valor sorteado entre os dois; cada escorregão tira 4 pontos;
- chance de a bandagem funcionar = (He + 10)/100 − 0,02 por escorregão;
- alcance de 1 tile.

**Cura de veneno e ressurreição (modelo RunUO)** [M49]:
- **Veneno:** exige 60 de Healing e 60 de Anatomy; chance = (He − 30)/50 − 0,1·nível do veneno − 0,02 por escorregão. O veneno é tratado antes da vida.
- **Ressurreição:** exige 80 e 80; chance = (He − 68)/50 − 0,02 por escorregão.

**Histórico na era:**
- out/1998: o ganho em Healing cresce com a vida que falta ao alvo [M2];
- nov/1998: curar veneno e ressuscitar ficam mais difíceis, e acima de 93 se treina ressuscitando [M3];
- nov/1999: escolhe-se quem Healing e quem Veterinary curam, e a cura de veneno passa a depender da dificuldade [M11];
- UOR: Healing treinável até GM e personagem envenenado não pode ser curado até tirar o veneno [M15].

**Era posterior, não usar:** os 35% de perda por interrupção e os outros números modernos [M61].

### 5.2 Veneno (níveis)
- **Níveis do jogador:** Lesser, Regular, Greater e Deadly. Lethal existe nos emuladores, em geral para monstros [M50].
- **Modelo RunUO pré-AOS:** 10 pulsos por veneno, com o primeiro após 3,5 s; dano por pulso = 1 + vida atual × percentual, limitado entre um mínimo e um máximo [M50]:

| Nível | % da vida atual | Mínimo | Máximo | Intervalo entre pulsos |
|---|---|---|---|---|
| Lesser | 2,5% | 4 | 26 | 3 s |
| Regular | 3,125% | 5 | 26 | 3 s |
| Greater | 6,25% | 6 | 26 | 3 s |
| Deadly | 12,5% | 7 | 26 | 4 s |
| Lethal | 25% | 9 | 26 | 5 s |

- **Regras da era:**
  - fev/1999: um veneno mais forte substitui um mais fraco, e o inverso não vale [M6];
  - UOR: "venenos têm dano mínimo" [M15]. Por isso os mínimos da tabela provavelmente são pós-T2A (**inferência**).

### 5.3 Morte, fantasma e perda de itens
- **Ao morrer:** o personagem vira fantasma e deixa um corpo com todos os itens que não são "newbie" ou abençoados [M54] [M70b].
  - Saquear o corpo de um inocente torna o saqueador criminoso [M2]; em guerra de guildas, não (out/1998) [M2].
  - O corpo de um assassino pode ser saqueado por qualquer um [M23]. Desde fev/1999 todo corpo de assassino aparece vermelho [M6].
- **Fantasmas:** podem usar moongates (mai/1999) e não podem escoltar NPCs (ago/1999) [M9] [M10].
- **Ladrão que morre na cidade:** devolve o que roubou nos últimos 2 minutos (nov/1998) [M3].
- **Escrituras de casa:** compradas a partir de abr/1999, ficam no fantasma; no caso de assassino, ficam no corpo [M8]. Em mai/1999 passaram a ficar sempre com o fantasma e não podem ser roubadas [M9].
- **Fev/2000:** acaba a "ressurreição instantânea" e o personagem volta sempre como fantasma [M13]. O que era a opção instantânea antes disso é **lacuna**.

### 5.4 Ressurreição
- **Formas:**
  - curandeiros NPC, incluindo os ambulantes;
  - ankhs dos santuários;
  - spell **Resurrection** (8º círculo, BM, Ga, Gi) [M22];
  - bandagem com 80/80 [M49].
- Na era da "notoriedade" (1997), os santuários recusavam ressuscitar quem tinha notoriedade abaixo de "Dastardly" [M16].
- **Modelo RunUO:** volta com 10 de vida [M45] e perde 10% da fama [M55].

### 5.5 Perda por assassinato (stat loss)
- **Oficial:**
  - a perda depende **só da contagem de curto prazo**, mesmo depois da criação da de longo prazo (mar/1999) [M7];
  - dizer "I must consider my sins" a um espírito ressuscitador avisa se haverá perda (abr/1999) [M8];
  - a mensagem fica vermelha quando haverá perda (nov/1999) [M11];
  - antes de mar/1999, a perda já "escalava" com o número de mortes [M16].
- **Modelo RunUO pré-AOS:** a perda se aplica com 5+ mortes de curto prazo.
  - Fator = 1 − (4 + mortes/5)/100, limitado entre 0,85 e 0,95, ou seja, de 5% a 15% de perda.
  - Multiplica força, destreza e inteligência crus (só se o resultado ficar acima de 10) e cada skill cujo resultado fique acima de 35 [M55].
- **Na era do sistema de bounty (antes de 1998):** matar um assassino lhe custava 10% do progresso [M16].
- O percentual exato do T2A é **não confirmado**.

---

## 6. Karma, fama e notoriedade

### 6.1 Histórico [M16]
- **1997:** "notoriedade" num único valor e nomes azul, vermelho ou cinza conforme a ação mexeria nessa notoriedade; logo depois, a flag criminal.
- **Primavera de 1998:** **sistema de reputação.** Fama e karma separados, e murder counts no lugar do bounty.
  - Cada denúncia de inocente soma 1 morte; a contagem decai 1 a cada 8 horas de jogo; com 5, o personagem vira assassino (vermelho).
  - O cinza por agressão dura 2 minutos.
- **2000:** Trammel (só PvP consentido) e Felucca, já no UOR [M15] [M16].

### 6.2 Cores e estados
- **Azul:** inocente. **Cinza:** criminoso ou atacável. **Vermelho:** assassino. **Verde:** aliado de guilda. **Laranja:** inimigo de guilda [M47].
- O amarelo de "invulnerável" (NPCs protegidos) só existe no ramo AOS do RunUO [M47].
- **Criminoso (cinza):** dura no mínimo 2 minutos sem novos atos ilegais [M24] [M16].
  - Causas: roubar e ser visto, atacar ou matar um azul, curar ou ajudar um cinza ou vermelho, saquear sem direito [M24].
  - Pelas descrições modernas, o criminoso não pode chamar guardas nem usar recall ou gate e pode ser atacado livremente [M24]. A proibição de recall para agressores e criminosos é oficial desde o Publish 5 [M15].
- **Guilda de ladrões (fev/1999):** exige 60 de Stealing; os membros não podem ser denunciados por assassinato e podem ser atacados livremente (fora de briga iniciada em cidade); a vítima de furto pode atacar o ladrão por 2 minutos sem ficar cinza [M6].
- **Mai/1999:** paralisar um inocente passa a valer como base para murder count [M9].

### 6.3 Murder counts
- **Curto prazo:** −1 a cada 8 h de jogo [M7] [M23] [M25].
- **Longo prazo (desde 28/03/1999):** −1 a cada 40 h. Com **5 ou mais**, o personagem fica vermelho e atacável [M7] [M25]. A contagem de longo prazo é sempre ≥ a de curto prazo [M23] [M25].
- **Contador "pingpong" (mar/1999):** +1 cada vez que o personagem fica vermelho; não decai; com 5, o vermelho é permanente, sem perda de stats salvo se a contagem curta também estiver alta [M7].
- **Limiar do vermelho:** 5 mortes [M7] [M47].
- **Mar/2000:** matar NPC comerciante dá contagem, salvo se ele for criminoso ou maligno [M14].
- **Regras modernas que não são T2A:** pardons e proibições ligadas ao Trammel [M25].

### 6.4 Fama e karma
- **Ganho e perda (modelo RunUO):** ganho efetivo = ganho bruto − valor atual/100, nunca abaixo de zero. Perdas são agravadas pelo mesmo termo. Faixas: fama de 0 a 15000; karma de −15000 a +15000 [M48].
  - Na prática, monstros fracos deixam de dar fama ou karma a personagens já altos.
  - A regra oficial atual diz algo equivalente: não se ganha karma de criaturas com menos karma que o personagem [M26].
- **Faixas oficiais modernas:** fama 0–10000, karma ±32000 [M26]. **Conflito** com os ±15000 do RunUO; para o T2A o valor exato é **lacuna**.
- **Fontes de karma:** matar criaturas malignas aumenta; matar criaturas "boas" ou animais domésticos diminui; Begging, Stealing e Poisoning diminuem; Summon Daemon custa muito karma [M26] [M60].
  - Desde nov/1998, monstros mortos por criatura provocada não dão fama nem karma [M3].
  - Desde mar/1999, assassinato "afeta seriamente" o karma, sem número publicado [M7].
  - Desde dez/1998, sapos gigantes não tiram mais karma [M75].
  - Desde fev/1999, "I honor thee" transfere karma para outro jogador [M5].
- **Trava de karma:** no RunUO pré-AOS, cair de karma ≥ 0 para negativo trava o ganho até rezar um mantra num santuário [M48]. Na era moderna a trava é opcional, no ankh [M26]. A data de entrada é **lacuna**; provavelmente pós-T2A (**inferência**).

### 6.5 Títulos
- **Fama em 5 faixas:** até 1249; até 2499; até 4999; até 9999; 10000 ou mais, com "Lord" ou "Lady" [M48] [M26].
- **Karma em 11 faixas**, com limites em ±625, ±1250, ±2500, ±5000 e ±10000 [M48].
- **Títulos de karma positivo:**

| Faixa de fama | Títulos, do karma menor para o maior |
|---|---|
| Até 1249 | Fair, Kind, Good, Honest, Trustworthy |
| 10000 ou mais | Distinguished, Eminent, Noble, Illustrious, Glorious ("The Glorious Lord") |

- **Títulos de karma negativo:**

| Faixa de fama | Títulos, do menos para o mais negativo |
|---|---|
| Até 1249 | Rude, Unsavory, Scoundrel, Despicable, Outcast |
| 10000 ou mais | Dishonored, Sinister, Dark, Evil, Dread |

- As faixas intermediárias completas estão em [M48].
- **Título de skill:** usa o maior skill, a partir de 30. Os níveis são Neophyte (30), Novice (40), Apprentice (50), Journeyman (60), Expert (70), Adept (80), Master (90) e Grandmaster (100) [M48]. Elder e Legendary (110 e 120) são pós-T2A.

---

## 7. Recomendações para a simulação do Outrora

**[AUTO-DECISION]** Qual base adotar quando o T2A não tem número? → Usar o modelo do RunUO pré-AOS como valor padrão e anotar a data oficial de cada regra. (Motivo: é o único conjunto coerente e completo; as notas oficiais definem quais regras existem, não os números.)

1. **Configurar tudo por tabelas:** caps, pesos de stat por skill, janelas de dificuldade, mana e reagentes, dano dos spells e níveis de veneno, sem números fixos no código. Assim dá para alternar entre "T2A estrito" e "pré-AOS final".
2. **Decisões pendentes para o responsável e para @pm** (cada uma tem conflito registrado acima):
   - vida = 50 + Força/2 ou vida = Força;
   - curva de resist com o fator 1/2 do RunUO ou sem ele (leitura Stratics);
   - parry pelo modelo RunUO ou calibrado pelos números do UOR;
   - incluir ou não desarme e stun (UOR), power hour (mar/2000) e travas de skill (nov/1999).
3. **Single-player:** "metade do dano em PvP", murder counts e notoriedade perdem parte do sentido sem outros jogadores. Sugestão: manter karma, fama e títulos e adaptar a notoriedade a NPCs (**inferência** de design, decisão de @pm).
4. **Próximos passos:** @pm prioriza as decisões do item 2; @architect define o formato dos dados de regras; @dev implementa no projeto PRKing_UO lendo só a especificação (sala limpa).

---

## 8. Lacunas, conflitos e confiança

**Lacunas**
- Fórmula oficial de ganho de skill e de stat no T2A (só há descrições qualitativas [M3] [M12] [M14]).
- Pontos iniciais de criação na era. O manual original [M68] não pôde ser lido e a Stratics antiga e a Wayback Machine ficaram inacessíveis (erro 403 e bloqueio).
- Fórmula do swing antes de fev/1999 (baseada em destreza).
- Taxas oficiais de regeneração de vida e estamina.
- Parry e tabela de armadura do T2A antes do UOR.
- Chance por golpe de envenenar com a arma.
- Percentual exato do stat loss no T2A.
- Faixas de fama e karma no T2A.
- Detalhes da "ressurreição instantânea" antes de fev/2000.

**Conflitos registrados**
- Vida: Força ou 50 + Força/2.
- Resist: RunUO com metade da Stratics.
- Bônus de Lumberjacking: RunUO 20%/30% contra 25%/35% do UOR.
- Parry: RunUO contra números do UOR.
- Explosion: dano imediato (jan/1999) contra atraso (RunUO).
- Teto do Mind Blast: 45 contra 40 ou 60% da vida.
- Faixa de fama e karma: ±15000 contra 10000/±32000.
- Desarme e stun: pré-AOS no RunUO, mas só a partir do UOR no OSI.
- Tempos de bandagem: mai/1999 contra o modelo baseado em destreza.
- Fórmula de acerto: RunUO contra POL.

**Confiança geral**
- Alta para listas (skills, spells, reagentes, mana, cores) e para datas das mudanças.
- Média para fórmulas de combate e magia, que vêm de emulador.
- Baixa para criação de personagem e para os caps por stat no T2A.

---

## 9. Referências

Data de acesso de todas: **2026-10-27**. O código do RunUO foi lido só para entender o comportamento, sem cópia. A licença foi conferida no arquivo LICENSE do repositório: **GPL-2.0, com opção "ou versão posterior"** [M28]. Nenhum outro código aberto foi usado. As fontes marcadas "via busca" foram vistas só no resumo do resultado de busca, sem leitura completa da página.

| ID | Título | URL | Tipo | Licença |
|---|---|---|---|---|
| M1 | Ultima Online (Wikipedia) | https://en.wikipedia.org/wiki/Ultima_Online | wiki | n/a (texto CC BY-SA) |
| M2 | Patch notes 01/10/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-13-1st-october/ | documentação oficial | n/a |
| M3 | Patch notes 10/11/1998 | https://uo.com/?p=11102 | documentação oficial | n/a |
| M4 | Publish 19/01/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-01-19th-january/ | documentação oficial | n/a |
| M5 | Publish 02/02/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-02-2nd-february/ | documentação oficial | n/a |
| M6 | Publish 24/02/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-03-24th-february/ | documentação oficial | n/a |
| M7 | Publish 28/03/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-04-28th-march/ | documentação oficial | n/a |
| M8 | Publish 14/04/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-06-14th-april/ | documentação oficial | n/a |
| M9 | Publish 25/05/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-07-25th-may/ | documentação oficial | n/a |
| M10 | Publish 25/08/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-07-25th-august/ | documentação oficial | n/a |
| M11 | Publish 1, 23/11/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-publish-01-23rd-november/ | documentação oficial | n/a |
| M12 | Publish 2, 24/01/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-02-24th-january/ | documentação oficial | n/a |
| M13 | Publish 3, 23/02/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-03-23rd-february/ | documentação oficial | n/a |
| M14 | Publish 4, 08/03/2000 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-04-8th-march/ | documentação oficial | n/a |
| M15 | Publish 5, 27/04/2000 (UOR) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2000-2/2000-publish-05-27th-april/ | documentação oficial | n/a |
| M16 | R. Koster, "A brief history of murder in Ultima Online" (2018) | https://www.gamedeveloper.com/design/a-brief-history-of-murder-in-ultima-online | artigo | n/a |
| M17 | UOGuide — Swing Speed | https://www.uoguide.com/Swing_Speed | wiki | n/a |
| M18 | UOGuide — Stats | https://www.uoguide.com/Stats | wiki | n/a |
| M19 | UOGuide — Hit Points | https://www.uoguide.com/Hit_Points | wiki | n/a |
| M20 | UOGuide — Meditation | https://www.uoguide.com/Meditation | wiki | n/a |
| M21 | UOGuide — Magery | https://www.uoguide.com/Magery | wiki | n/a |
| M22 | UOGuide — Magery Spells | https://www.uoguide.com/Magery_Spells | wiki | n/a |
| M23 | UOGuide — Murder Count | https://www.uoguide.com/Murder_Count | wiki | n/a |
| M24 | UOGuide — Criminal | https://www.uoguide.com/Criminal | wiki | n/a |
| M25 | uo.com — The Murder System | https://uo.com/?p=6746 | wiki oficial | n/a |
| M26 | uo.com — Fame and Karma | https://uo.com/?p=6288 | wiki oficial | n/a |
| M27 | UltimaCodex — UO Second Age | https://wiki.ultimacodex.com/wiki/UO_Second_Age | wiki | n/a |
| M28 | RunUO — LICENSE | https://github.com/runuo/runuo/blob/master/LICENSE | código (licença) | GPL-2.0-or-later |
| M29 | RunUO — BaseWeapon.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/BaseWeapon.cs | código | GPL-2.0-or-later |
| M30 | RunUO — SkillCheck.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/SkillCheck.cs | código | GPL-2.0-or-later |
| M31 | RunUO — MagerySpell.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Base/MagerySpell.cs | código | GPL-2.0-or-later |
| M32 | RunUO — Spell.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Base/Spell.cs | código | GPL-2.0-or-later |
| M33 | RunUO — MagicArrow.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/First/MagicArrow.cs | código | GPL-2.0-or-later |
| M34 | RunUO — Harm.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Second/Harm.cs | código | GPL-2.0-or-later |
| M35 | RunUO — Fireball.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Third/Fireball.cs | código | GPL-2.0-or-later |
| M36 | RunUO — Lightning.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Fourth/Lightning.cs | código | GPL-2.0-or-later |
| M37 | RunUO — MindBlast.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Fifth/MindBlast.cs | código | GPL-2.0-or-later |
| M38 | RunUO — EnergyBolt.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Sixth/EnergyBolt.cs | código | GPL-2.0-or-later |
| M39 | RunUO — Explosion.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Sixth/Explosion.cs | código | GPL-2.0-or-later |
| M40 | RunUO — FlameStrike.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Seventh/FlameStrike.cs | código | GPL-2.0-or-later |
| M41 | RunUO — ChainLightning.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Seventh/ChainLightning.cs | código | GPL-2.0-or-later |
| M42 | RunUO — Earthquake.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Eighth/Earthquake.cs | código | GPL-2.0-or-later |
| M43 | RunUO — RegenRates.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/RegenRates.cs | código | GPL-2.0-or-later |
| M44 | RunUO — Server/Skills.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Skills.cs | código | GPL-2.0-or-later |
| M45 | RunUO — Server/Mobile.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Mobile.cs | código | GPL-2.0-or-later |
| M46 | RunUO — PlayerMobile.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/PlayerMobile.cs | código | GPL-2.0-or-later |
| M47 | RunUO — Notoriety.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/Notoriety.cs | código | GPL-2.0-or-later |
| M48 | RunUO — Titles.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/Titles.cs | código | GPL-2.0-or-later |
| M49 | RunUO — Bandage.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Skill%20Items/Misc/Bandage.cs | código | GPL-2.0-or-later |
| M50 | RunUO — Poison.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/Poison.cs | código | GPL-2.0-or-later |
| M51 | RunUO — BaseRanged.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Ranged/BaseRanged.cs | código | GPL-2.0-or-later |
| M52 | RunUO — BaseArmor.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Armor/BaseArmor.cs | código | GPL-2.0-or-later |
| M53 | RunUO — BaseShield.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Shields/BaseShield.cs | código | GPL-2.0-or-later |
| M54 | RunUO — CharacterCreation.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/CharacterCreation.cs | código | GPL-2.0-or-later |
| M55 | RunUO — ResurrectGump.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Gumps/ResurrectGump.cs | código | GPL-2.0-or-later |
| M56 | RunUO — Poisoning.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Skills/Poisoning.cs | código | GPL-2.0-or-later |
| M57 | RunUO — Katana.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Swords/Katana.cs | código | GPL-2.0-or-later |
| M58 | RunUO — Bow.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Ranged/Bow.cs | código | GPL-2.0-or-later |
| M59 | RunUO — Fists.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Fists.cs | código | GPL-2.0-or-later |
| M60 | UltimaCodex — Ultima Online Magery Spells | https://wiki.ultimacodex.com/wiki/Ultima_Online_Magery_Spells | wiki | n/a |
| M61 | UltimaCodex — Healing | https://www.wiki.ultimacodex.com/wiki/Healing | wiki | n/a |
| M62 | POL Forum — "skill gains" (2006) | https://forums.polserver.com/viewtopic.php?p=1007 | fórum | n/a |
| M63 | POL Forum — "Combat formulas" (2003) e "spell damage" (via busca) | https://forums.polserver.com/viewtopic.php?p=8300 ; https://forums.polserver.com/viewtopic.php?p=4176 | fórum | n/a |
| M64 | UO Forums — "UO's basic skill gain system" e AnandTech (power hour), via busca | https://forum.uo.com/discussion/comment/101180 ; https://forums.anandtech.com/threads/mmos-are-currently-massively-disappointing-to-an-old-uo-player.2216576/post-32809615 | fórum | n/a |
| M65 | UO Outlands Wiki — Swing Speed (shard custom, via busca) | https://wiki.uooutlands.com/Swing_Speed | wiki | n/a |
| M66 | GameBanshee — UO Five on Friday Q&A (era AOS, via busca) | https://www.gamebanshee.com/kwwk6 | entrevista | n/a |
| M67 | SphereWiki — Skill Gain Theory (leitura falhou; via busca) | https://wiki.spherecommunity.net/index.php/Skill_Gain_Theory | wiki | n/a |
| M68 | Origin — Ultima Online Reference Guide (PDF digitalizado, ilegível pelo WebFetch) | https://mocagh.org/origin/uo-refguide.pdf | manual | n/a |
| M69 | Publish 16 — Guaranteed Gain System (2002, via busca) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/2002-2/2002-publish-16-part-2-23rd-july/ | documentação oficial | n/a |
| M70 | PlayerAuctions — guia de stats (baixa confiabilidade, via busca) | https://www.playerauctions.com/sell-uo-boosting/ | guia comercial | n/a |
| M70b | Gamepressure — "Ultima Online, simply a legend" (perda de itens e fantasma, via busca) | https://www.gamepressure.com/editorials/beyond-world-of-warcraft-classic-10-most-hardcore-mmorpgs-out-the/ultima-online-simply-a-legend/z51c1 | artigo | n/a |
| M71 | uo.com — Scrolls of Power (cap 225/125, via busca) | https://uo.com/?p=4706 | wiki oficial | n/a |
| M72 | POL Forum — "Skills and Stats Cap" (2006) | https://www.forums.polserver.com/viewtopic.php?p=1102 | fórum | n/a |
| M73 | Publish 24/10/1998 (conteúdo do T2A) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-15-24th-october/ | documentação oficial | n/a |
| M74 | Publish 22/09/1999 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-08-22nd-september/ | documentação oficial | n/a |
| M75 | Publish 21/12/1998 | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1998-2/1998-21-21st-december/ | documentação oficial | n/a |
