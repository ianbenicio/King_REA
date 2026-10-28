---
alvo: uo-classic
destino: projeto Unity próprio em H:\King\Clientes e Projetos\PRKing_UO (fora deste repositório; exceção do item 8 do CLAUDE.md)
era_de_referencia: T2A (The Second Age, 1998-10-01 a 2000-05-04)
fontes: só fontes públicas (docs/research/2026-10-27-uo/); nenhum binário do alvo foi lido
data: 2026-10-28
---

# Especificação de comportamento — RPG isométrico local inspirado no Ultima Online, era T2A (sala limpa)

Este documento descreve **o que** o Ultima Online fazia na era T2A, em palavras próprias, para orientar uma reimplementação independente que roda só na máquina do jogador, sem servidor e sem rede. Não contém código, arte, sons nem textos da EA. Nomes de skills, magias e reagentes aparecem só como rótulos para identificar a regra; a reimplementação **DEVE** usar nomes, textos e ícones próprios.

**Sala limpa.** O projeto em `PRKing_UO` lê só este documento. Não lê `alvos/`, `saidas/`, código descompilado nem os arquivos de pesquisa como fonte de cópia. Código aberto citado nas referências (RunUO, ModernUO, ClassicUO etc.) foi lido pelos pesquisadores só para entender comportamento; nenhum trecho foi copiado, e o projeto não deve abrir esse código ao escrever o seu.

## Convenções

- **DEVE** = regra que a primeira versão jogável reproduz. **PODE** = opcional ou configurável. **FORA** = fora da primeira versão.
- **Referências:** `[Mn]`, `[Wn]`, `[Fn]` e `[En]` apontam as tabelas de referências (URL e data de acesso) dos arquivos de pesquisa:
  - `[Fn]` → `docs/research/2026-10-27-uo/01-formatos-de-arquivo.md`;
  - `[Mn]` → `docs/research/2026-10-27-uo/02-personagem-combate-magia.md`;
  - `[Wn]` → `docs/research/2026-10-27-uo/03-mundo-npcs-crafting-ia.md`;
  - `[En]` → `docs/research/2026-10-27-uo/04-ecossistema-arquitetura-protocolo.md`.
- **(inferência)** marca dedução sem fonte direta. **(conflito)** marca fontes que discordam; a decisão fica na seção 16.
- **Força da fonte**, quando importa: **oficial** (nota de publish da época), **wiki** (em geral descreve o jogo atual), **emulador** (código aberto, lido só para comportamento) ou **fórum/busca** (indício).
- **Modelo numérico.** As notas oficiais de 1998–2000 dizem *quais* regras existiam e *quando*, mas quase nunca trazem números. Os números vêm em geral do ramo "pré-AOS" do RunUO, que reproduz o estado de 2002, logo antes do Age of Shadows, e não o T2A exato [M15–M59]. Toda regra numérica **DEVE** ficar em tabelas de dados, nunca fixa no código, para permitir dois perfis: "T2A estrito" e "pré-AOS final" [M] §7 (inferência de projeto).
- Notação: `⌊x⌋` = parte inteira; `U(a, b)` = sorteio uniforme entre a e b; `clamp(x, a, b)` = x limitado a [a, b].

## 1. Decisões de enquadramento (Fase 0, 2026-10-27)

| Tema | Decisão do responsável | Consequência |
|---|---|---|
| Era | T2A | Regras até 2000-05-04. Trammel, Renaissance e Age of Shadows ficam FORA [M1][M15] |
| Assets | Ler em tempo de execução a cópia instalada do responsável, como o ClassicUO, sem redistribuir | Seção 3. Placeholders até o cliente existir. Risco legal na seção 17 |
| Nome | "Outrora" (proposto na Fase 0) | O PRKing_UO adota ou não. Nunca "Ultima", "Ultima Online" nem "Britannia" [E93][E96] |
| Unity | 2022.3 LTS | O PRKing_UO hoje diz Unity 6.3 LTS: divergência listada no Anexo A |
| Primeira versão jogável | Loop básico | Mundo isométrico navegável; stats e skills com ganho; combate corpo a corpo contra criaturas com IA simples; loot; morte e ressurreição; uma cidade com vendedor e banco; dia e noite; salvar e carregar |

Fora da primeira versão (FORA): magia (seção 7 fica especificada para a segunda), crafting e coleta (seção 12), housing e barcos (seção 14), pets e domesticação, guildas, multijogador, protocolo de rede.

### 1.1 Linha do tempo que importa

| Marco | Data | Fonte |
|---|---|---|
| Lançamento | 1997-09-24 | [M1] |
| Sistema de reputação (fama e karma separados, murder counts) | primavera de 1998 | [M16] |
| T2A lançado; Lost Lands | 1998-10-01; conteúdo em 1998-10-24 | [M1][M73] |
| Todos os skills podem chegar a 100; curva de ganho achatada | 1998-11-10 | [M3] |
| Golpe passa a depender da estamina; Meditation criada | 1999-02-02 | [M5] |
| Stealth e Remove Trap; resist reduz dano de magia | 1999-02-24 | [M6] |
| Murder count de longo prazo | 1999-03-28 | [M7] |
| Tempos fixos de bandagem | 1999-05-25 | [M9] |
| Travas de skill | 1999-11-23 | [M11] |
| Bônus de ganho na primeira hora do dia ("power hour") | 2000-03 | [M14] |
| Publish 5 (pré-Renaissance: parry por escudo, desarme, armadura por material) | 2000-04-27 | [M15] |
| Publish 5 traz Trammel; Renaissance chega às lojas (fim da era) | 2000-04-27; 2000-05-04 | [M15][W7][M1] |

Como as regras mudaram dentro da era, a reimplementação **DEVE** fixar um ponto de referência. Recomendação: **o estado de março de 2000** (com travas de skill e ganhos secundários, sem Publish 5), por ser o mais completo do T2A (inferência; decisão na seção 16).

## 2. Responsabilidades da simulação local

No jogo original o cliente só pede e o servidor decide tudo: movimento, dano, ganho de skill, conteúdo de containers, resultado de magias [E49][E62][E63]. Sem servidor, essas decisões passam para uma **simulação local**, separada da apresentação (inferência). A camada de transporte (criptografia, compressão, login, lista de shards, chaves anti-fast-walk) não tem equivalente local [E] §4.4.

| Módulo da simulação | Responsabilidade herdada do servidor | Fonte |
|---|---|---|
| Tempo e agendamento | Laço único que processa mudanças, avança timers e salva por instantâneo | [E37][E39][E43] |
| Mundo | Entidades por identificador estável; mobiles e itens em faixas separadas; setores de 16 × 16 tiles ativados por proximidade; regiões com regras | [E40][E44][E46][E47] |
| Movimento | Validação de passo e ritmo por velocidade | [E45][E49] |
| Itens | Pegar, soltar, equipar, containers, peso, pilhas | [E48][E49] |
| Combate | Alvo, ritmo, acerto, dano, absorção, notoriedade | [E45][E54][E69] |
| Skills e stats | Testes, ganho, travas, cap total, atrofia | [E51] |
| Magia | Estados da conjuração, reagentes, mana, interrupção | [E53] |
| IA | Estados, escolha de alvo, movimento | [E52] |
| Ambiente | Luz, clima, hora | [E47][E74][E75] |
| Persistência | Instantâneo do mundo com versão | [E40][E44] |

### 2.1 Tempo

- O servidor emulado roda toda a lógica numa thread só; a cada volta lê o relógio, processa as filas de mudança, dispara timers vencidos e, se pedido, salva [E37]. Timers vão de "todo tick" a 1 minuto em baldes de prioridade (RunUO) ou numa roda com base de 8 ms (ModernUO) [E39][E43].
- A simulação **DEVE** rodar em passos de tempo próprios, independentes da taxa de quadros, com timers guardados como "tempo restante" para que salvar e carregar preserve o estado (inferência a partir de [E39]).
- O relógio do mundo **DEVE** ser determinístico com semente fixa nos testes (inferência).

### 2.2 Movimento

- Oito direções. Intervalo mínimo entre passos: **400 ms andando a pé, 200 ms correndo a pé, 200 ms andando montado, 100 ms correndo montado** [E45].
- O cliente original andava de forma otimista e o servidor confirmava ou recusava cada passo, devolvendo posição, direção e altura corretas na recusa [E49][E62].
- A simulação **DEVE** manter a separação "pedido de passo → validação → passo aceito": a apresentação anima dentro do intervalo, mas quem decide é a simulação (inferência a partir de [E] §4.3).
- Altura máxima vencida num passo, colisão e superfícies: seção 10.

## 3. Dados da cópia instalada (leitura em tempo de execução)

A reimplementação lê os arquivos da instalação do próprio jogador, sem copiar, converter para distribuição nem versionar nada, como fazem ClassicUO e MobileUO [E1][E26]. Toda leitura **DEVE** passar por uma interface de "provedor de recursos" com duas implementações: leitor da instalação e placeholders próprios (inferência de projeto, decisão da Fase 0).

### 3.1 Localizar a instalação

- O ClassicUO não procura no registro: a pasta vem de configuração ou de argumento de linha de comando [F29][F53]. O Ultima SDK percorre chaves do registro da mais antiga para a mais nova (entre elas `Origin Worlds Online\Ultima Online\1.0` e `Electronic Arts\EA Games\Ultima Online Classic`, com variante `Wow6432Node` em 64 bits) e lê os valores de caminho [F33].
- A reimplementação **DEVE** aceitar a pasta por configuração e **PODE** sugerir a pasta pelo registro.
- O tipo de instalação **DEVE** ser detectado pela **presença dos arquivos**, não pela versão: as fontes discordam sobre a versão em que os dados viraram `.uop` (7.0.0.0 com `MainMisc.uop`, 7.0.24.0, 7.0.24.2 ou 7.0.25.0) [F4][F21][F55][F56] (conflito). Cada recurso: tentar o `.uop`; se não existir, o par `.mul`/índice [F5][F6][F7][F12][F13].
- O cliente instalado pelo patcher é o atual, não um cliente de 1998 (inferência a partir de [F4][F36]). A reimplementação lê os dados atuais e **DEVE** filtrar o que não existia no T2A: só o mapa 0, recortado para 6144 × 4096 (seção 10.1).

### 3.2 Mapa de arquivos por função

| Função | T2A (só `.mul`) | Cliente atual | Fonte |
|---|---|---|---|
| Arte de terreno e objetos | `art.mul` + `artidx.mul` | `artLegacyMUL.uop` | [F5][F36] |
| Interface (gumps) | `gumpart.mul` + `gumpidx.mul` | `gumpartLegacyMUL.uop` | [F6][F36] |
| Terreno do mapa | `map0.mul` | `map{N}LegacyMUL.uop` | [F7][F36] |
| Objetos fixos do mapa (statics) | `staidx0.mul` + `statics0.mul` | continuam `.mul` | [F7] |
| Propriedades de tile | `tiledata.mul` (flags de 32 bits) | `tiledata.mul` (flags de 64 bits) | [F8] |
| Texturas de terreno inclinado | `texmaps.mul` + `texidx.mul` | igual | [F16] |
| Animações de criaturas e personagens | `anim.mul` + `anim.idx` | `anim*.mul` + `AnimationFrame*.uop` + `AnimationSequence.uop` | [F10][F38] |
| Animação de itens | `animdata.mul` | igual | [F11] |
| Paletas de cor (hues) | `hues.mul` | igual | [F9] |
| Sons | `sound.mul` + `soundidx.mul` | `soundLegacyMUL.uop` | [F13][F36] |
| Casas e barcos (multis) | `multi.mul` + `multi.idx` | `MultiCollection.uop` | [F12][F37] |
| Luzes | `light.mul` + `lightidx.mul` | igual | [F14] |
| Cor de radar | `radarcol.mul` | igual | [F9][F40] |
| Textos localizados | `cliloc.*` | `Cliloc.enu` e outros | [F19] |
| Fontes | `fonts.mul`, `unifont*.mul` | igual | [F20] |

A primeira versão **DEVE** ler: terreno, statics, `tiledata`, arte, `hues` e animações de corpo. **PODE** ler sons, luzes e texturas inclinadas. Textos localizados **FORA**: a interface usa textos próprios (sala limpa).

### 3.3 Contêiner `.uop`

Arquivo com assinatura "MYP", cabeçalho com versão e ponteiro para a primeira tabela de blocos; as tabelas encadeadas listam entradas com posição, tamanhos comprimido e descomprimido, hash de 64 bits do nome lógico e indicador de compressão. O nome lógico de cada recurso segue um padrão por arquivo (por exemplo, número do recurso com zeros à esquerda) e passa por uma função de hash pública (lookup3, de Bob Jenkins, domínio público) [F3][F4][F36] e §2 de [F]. Exceções de nome por arquivo e tipos de compressão (incluindo um tipo "zlib + BWT" ou "Mythic", conforme a fonte) estão em [F] §2.5 (conflito sobre o tipo 3).

### 3.4 Par índice + dados

Cada entrada do índice traz posição no arquivo de dados, tamanho e um campo extra; posição inválida significa recurso ausente. O campo extra guarda, conforme o arquivo, largura e altura (gumps, luzes) ou outro dado; a ordem dos dois valores diverge entre leitores para `light` [F] §3, §8.3 (conflito).

### 3.5 Mapa e statics

| Item | Regra | Fonte |
|---|---|---|
| Bloco | 8 × 8 células; 196 bytes = 4 de cabeçalho ignorado + 64 células de 3 bytes | [F7][F44] |
| Célula | identificador do tile de terreno (2 bytes) + altura com sinal (1 byte) | [F7][F44] |
| Ordem dos blocos | por coluna: índice = bx × altura_em_blocos + by | [F7][F44] |
| Ordem das células | por linha dentro do bloco: (y mod 8) × 8 + (x mod 8) | [F44] |
| Static | 7 bytes: gráfico (2), x (1), y (1), altura com sinal (1), cor (2); x e y relativos ao bloco | [F7][F44] |
| Índice de statics | uma entrada de 12 bytes por bloco, na mesma ordem do mapa | [F7][F44] |

Armadilha: blocos em ordem de coluna e células em ordem de linha; errar uma das duas transpõe ou embaralha o mapa (inferência) [F] §4.1.

### 3.6 Cor e imagens

- Cor de 16 bits 5-5-5: vermelho nos bits 10–14, verde 5–9, azul 0–4. O bit 15 é ignorado por um leitor e usado como "opaco" por outro (conflito); preto puro é tratado como transparente na arte de objetos (inferência a confirmar) [F22][F42][F50].
- Tile de terreno: losango de 44 × 44 pixels sem compressão. Arte de objeto: imagem com largura, altura e linhas compactadas por trechos (run-length). Gumps: compressão por trechos de cor repetida [F] §5.
- Paletas (hues): grupos de 8 entradas, cada uma com 32 cores, faixa e nome; aplicadas trocando a cor original pela entrada da paleta [F9] e [F] §5.6.

### 3.7 Propriedades de tile (`tiledata`)

Duas seções: terreno e objetos. Cada registro tem flags, altura, peso, camada de equipamento, nome e outros campos [F8]. Flags que a simulação **DEVE** usar: intransponível, superfície (pode-se ficar em cima), parede, fundo (background), folhagem, telhado, molhado (água), ponte e porta [F] §6.2. Largura dos flags: 32 bits nos clientes antigos e 64 a partir de 7.0.9.0; detectar pelo tamanho do arquivo (conflito sobre o método) [F8][F] §6.1.

### 3.8 Animações

- Por tipo de corpo (monstro, animal, humano) há um número diferente de ações; cada ação tem 5 direções desenhadas e as outras 3 são espelhadas [F10] e [F] §7.3.
- Arquivos de definição remapeiam corpos (`body.def`, `bodyconv.def`) e classificam tipos (`mobtypes.txt`) [F10].
- O formato novo (`AnimationFrame*.uop`) tem partes não descritas pelas fontes (cabeçalho inicial, nomes dos grupos de ação) [F] §7.5 (lacuna). Se a instalação só tiver o formato novo para um corpo, a reimplementação **DEVE** cair no placeholder.

### 3.9 Projeção isométrica e ordem de desenho

- Posição na tela de uma célula (x, y, z): horizontal = (x − y) · 22; vertical = (x + y) · 22 − 4z; **cada unidade de altura sobe 4 pixels** [F24][F26][E58].
- Ordem: entre células, diagonais de x + y crescente (inferência coerente com a projeção; não confirmada no código lido) [F] §11.4 [E58]. Dentro da célula, chave de prioridade por altura e tipo: terreno com altura − 2; objeto com altura, −1 se fundo, +1 se tem altura no `tiledata`; personagem com altura + 1; efeito com altura + 2; empate mantém o terreno primeiro [F23][E57].
- Terreno inclinado: se os vizinhos têm alturas diferentes e há textura, o losango vira quadrilátero deformado com as alturas dos quatro cantos (própria, x+1, y+1 e x+1,y+1) [F26].
- Telhados: acima de um teto calculado a partir da célula do jogador (terreno 16 acima, ou telhado 14 acima), os objetos somem com fade; árvores na frente do jogador ficam translúcidas [F25][E58].
- Seleção pelo mouse: escolhe o objeto de maior profundidade sob o cursor [E58].

## 4. Personagem

### 4.1 Stats

- Três stats: força (vida, carga, dano corpo a corpo), destreza (estamina, alguns skills, tempo de bandagem desde fev/2000) e inteligência (mana, magia) [M18][M13][M5].
- **Derivados** [M19][M45]:
  - vida máxima = 50 + ⌊força / 2⌋ (conflito: há relato, sem fonte, de vida = força nos primeiros anos);
  - estamina máxima = destreza;
  - mana máxima = inteligência.
- **Caps:** total de stats 225 [M45][M72][M71]; cada stat até 100 (inferência; o 125 só aparece em descrições pós-AOS) [M70].

### 4.2 Ganho de stat

Regra oficial ao longo da era: ganho de stat vem do uso de skill, em qualquer nível, com chance mínima; no cap total, a atrofia de stat começa; skills travados em "desce" ou "para" não dão stat; desde mar/2000 só se rola o stat quando o skill sobe [M3][M11][M12][M14].

Modelo numérico (emulador) [M30][M44]: cada skill tem um peso por stat (`p_for`, `p_des`, `p_int`). A cada uso, testar na ordem força, destreza, inteligência, com chance `p / 33,3`; no máximo um stat sobe por uso, 1 ponto por vez. Exemplos de pesos (força/destreza/inteligência): espadas 0,75/0,25/0; maças 0,9/0,1/0; esgrima 0,45/0,55/0; luta desarmada 0,9/0,1/0; arco 0,25/0,75/0; Magery 0/0/1,5; mineração e lenhador 2/0/0; Healing 0,6/0,6/0,8; Tactics 0/0/0 [M30]. O intervalo mínimo de 15 minutos entre ganhos de stat é escolha do emulador, sem fonte oficial (PODE).

### 4.3 Regeneração

- **Mana** (desde fev/1999 depende de Meditation, inteligência e armadura) [M5][M43]. Com `x = (inteligência + Meditation) / 2` (inferência sobre a média):
  - `x ≤ 0`: 7 s por ponto;
  - `0 < x ≤ 100`: intervalo = 7 − (239/2400)·x + (19/48000)·x², o que dá 7 s em x = 0 e 1 s em x = 100;
  - `100 < x < 120`: 1 s; `x ≥ 120`: 0,75 s;
  - armadura soma ao intervalo a soma, sobre as peças que atrapalham a meditação, da proteção ponderada da peça / 4 (inteira se bloqueia, metade se bloqueia em parte);
  - meditação ativa divide o intervalo por 2; resultado limitado a [0,5 s; 7 s].
- **Vida:** 1 ponto a cada 11 s. **Estamina:** 1 ponto a cada 7 s [M43]. A taxa oficial do T2A é lacuna.

### 4.4 Criação

- Modelo do emulador (pós-Renaissance): stats somando 80 (cada um entre 10 e 60) e skills iniciais somando 100, cada um até 50; três modelos prontos (guerreiro, mago, ferreiro) [M54].
- T2A: três skills iniciais segundo o manual [M68]; "65 de stat e 100 de skill" é lembrança sem fonte (lacuna).
- Itens dados pelos skills iniciais ficam com o personagem na morte (itens "de novato"): bandagens para Healing, arco e 25 flechas para Archery, livro de magias com reagentes para Magery [M54].
- A primeira versão **DEVE** ter criação com stats e três skills configuráveis; os limites ficam em tabela (decisão na seção 16).

## 5. Skills

### 5.1 Lista

49 skills no fim da era; **46 no lançamento do T2A** (inferência pelas datas de Meditation, Stealth e Remove Trap) [M44][M5][M6]:

Alchemy, Anatomy, Animal Lore, Item Identification, Arms Lore, Parrying, Begging, Blacksmithy, Bowcraft/Fletching, Peacemaking, Camping, Carpentry, Cartography, Cooking, Detecting Hidden, Enticement, Evaluating Intelligence, Healing, Fishing, Forensic Evaluation, Herding, Hiding, Provocation, Inscription, Lockpicking, Magery, Resisting Spells, Tactics, Snooping, Musicianship, Poisoning, Archery, Spirit Speak, Stealing, Tailoring, Animal Taming, Taste Identification, Tinkering, Tracking, Veterinary, Swordsmanship, Mace Fighting, Fencing, Wrestling, Lumberjacking, Mining, Meditation (fev/1999), Stealth (fev/1999, exige Hiding 80) e Remove Trap (fev/1999, exige Lockpicking 50 e Detecting Hidden 50) [M44][M6].

Skills de eras posteriores (Chivalry, Necromancy, Focus, Bushido, Ninjitsu, Spellweaving, Mysticism, Imbuing, Throwing, Discordance com esse nome) ficam **FORA** [M1][M44].

A primeira versão **DEVE** ter pelo menos: Swordsmanship, Mace Fighting, Fencing, Wrestling, Tactics, Anatomy, Parrying, Healing e Magic Resistance (inferência de escopo para o loop básico).

### 5.2 Caps

Total 700,0; por skill 100,0 [M3][M11][M44]. Valores 720 e 120 são de eras posteriores.

### 5.3 Chance de sucesso

Skills baseados em dificuldade usam uma janela [d_min, d_max] por ação [M30][M4][M9]:

- s < d_min: falha sem rolar;
- s ≥ d_max: sucesso garantido;
- senão: P = (s − d_min) / (d_max − d_min).

Alguns skills usam chance direta, sem janela [M30].

### 5.4 Ganho de skill

Regras oficiais da era [M2][M3][M12][M14]:
- não se aprende olhando outros; Healing e Veterinary ensinam mais quanto mais vida falta ao alvo;
- a curva achata a partir de cerca de 45, variando por skill;
- segurar o livro de magias impede ganhar Tactics e Wrestling;
- jan/2000: 20 skills sem dificuldade precisam de menos usos nos níveis altos;
- mar/2000: chance maior de ganho na primeira hora de jogo de cada dia, por personagem; espera de 1 s entre usos de skills de conhecimento; anti-macro exige variar alvo e objeto (ofícios isentos); ganhos secundários (Eval Int ao conjurar, Anatomy ao lutar ou curar, Lumberjacking ao lutar com machado, Meditation a cada ponto de mana regenerado, Hiding ao usar Stealth, Animal Lore ao domar).

Modelo numérico (emulador) [M30]. Variáveis: `s` valor do skill, `c_s` cap do skill, `T` soma dos skills, `c_T` cap total, `P` chance de sucesso da ação, `f` fator do skill (padrão 1), `b` = 0,5 no sucesso e 0,2 na falha (no pré-AOS a falha também ensina):

- chance de ganho `g = f · ( ((c_T − T)/c_T + (c_s − s)/c_s) / 2 + (1 − P) · b ) / 2`, com piso de 0,01;
- `s < 10`: ganho automático;
- tamanho do ganho: 0,1; com `s ≤ 10`, sorteio entre 0,1 e 0,4;
- só ganha com a trava em "sobe" e se `T + ganho ≤ c_T`.

Leitura: ação difícil ensina mais, e o ganho desacelera perto dos caps (coerente com o "achatamento" de nov/1998; inferência).

### 5.5 Travas e atrofia

- Antes de nov/1999: sem travas; no cap total, atrofia automática nos skills menos usados [M3].
- Desde 1999-11-23: trava por skill com três estados — sobe, desce, para. A atrofia só ocorre quando outro skill sobe [M11].
- Modelo (emulador): a cada ganho com o total no cap, um skill em "desce" perde o mesmo valor, com probabilidade T / c_T [M30].

## 6. Combate (pré-AOS)

### 6.1 Ritmo do golpe

- Até 1999-02-02 dependia da destreza (fórmula é lacuna); depois, da **estamina atual**. Equipar arma impõe pequena espera antes do primeiro golpe [M5].
- Modelo (emulador): intervalo em segundos = 15000 / ((estamina_atual + 100) · V), com V = velocidade da arma. Com estamina 100: katana (V 58) ≈ 1,29 s; arco (V 20) 3,75 s; punhos (V 30) 2,5 s [M29][M57][M58][M59].
- Só se inicia ataque contra alvo a até 15 tiles e com linha de visão (jan/1999) [M4].

### 6.2 Acerto

Modelo (emulador) [M29], com A = skill de arma do atacante e D = skill de arma do defensor (Wrestling se desarmado), cada um com piso de −49,9:

- P_acerto = (A + 50) / (2 · (D + 50)).
- Skills iguais dão 50%; 100 contra 0 dá 100%; 0 contra 100 dá cerca de 16,7%.
- A rolagem do acerto é também o teste de ganho do skill de arma.
- (conflito) Variante de outro emulador: (A + 50) / (2D + 50) [M63].

### 6.3 Dano

Notas oficiais: escala de armas equilibrando as três proficiências (nov/1998); dano calculado no início do golpe, maças drenam estamina e gastam mais armadura, Anatomy dá bônus (fev/1999) [M3][M5].

Modelo (emulador), na ordem (ordem exata é inferência) [M29]:

1. Base = U(dano_min, dano_max) da arma, + (2n − 1) pelo nível mágico de dano n (1, 3, 5, 7, 9 para os cinco níveis).
2. × (1 + (Tactics − 50)/100).
3. × (1 + força/500) (1% a cada 5 pontos).
4. × (1 + Anatomy/500), + 10% com Anatomy 100.
5. Só machados: × (1 + Lumberjacking/500), + 10% com 100 (conflito: o Publish 5 dá 25% e 35%) [M15].
6. Qualidade: bônus para excepcional; desgaste escala o dano entre 50% e 100% pela razão durabilidade atual/máxima.
7. Absorção da armadura (6.4). Dano final mínimo 1.

A regra do emulador que corta o dano pela metade entre jogadores **não se aplica** a um jogo de um jogador só (inferência).

### 6.4 Armadura

- Parte atingida por sorteio: pescoço 7%, mãos 7%, braços 14%, cabeça 15%, pernas 22%, peito 35% [M29][M52].
- Absorção = U(AR_peça / 2, AR_peça), com a proteção da peça atingida, não a total [M52].
- Proteção exibida = soma de AR_peça × peso da parte (0,07; 0,07; 0,14; 0,15; 0,22; 0,35) [M52].
- Bônus: níveis mágicos de proteção +15, +20, +25, +30, +35; excepcional +8, baixa qualidade −8; desgaste reduz até a metade [M52].
- Cada golpe recebido tem 25% de chance de gastar a peça (maças gastam mais) [M52][M5].
- A tabela por material (placas, malha, anéis, couro tachado, couro, osso) com penalidade de destreza é do Publish 5 (pré-Renaissance); no T2A os valores são lacuna [M15].

### 6.5 Durabilidade de armas

Cada acerto tem 4% de chance de tirar 1 de durabilidade; zerada a atual, cai a máxima, e no fim a arma quebra. Bônus de durabilidade por qualidade e por nível mágico: +20%, +20%, +50%, +70%, +100%, +120% [M29].

### 6.6 Escudo e parry

- Modelo (emulador) [M53]: proteção efetiva do escudo `E = AR_escudo · Parrying/200 + 1`; chance de bloqueio = max(0,01; (Parrying − 2E)/100), que também é teste de ganho; no bloqueio o dano cai `E/2` contra corpo a corpo e `E` contra flechas; 25% de chance de gastar o escudo.
- (conflito) Os números oficiais do Publish 5 (escudo leve ≈ 86% de bloqueio com Parrying 100, escudo pesado ≈ 36%) não batem com o modelo [M15]. O T2A é lacuna.

### 6.7 Luta desarmada, veneno em arma, arco

- Punhos: dano 1–8, velocidade 30 [M59]. Desarme e golpe atordoante são do Publish 5: **FORA** no T2A estrito [M15].
- Arma envenenada (FORA da primeira versão): só armas de uma mão cortantes ou perfurantes; cargas = 18 − 2 × nível do veneno; −20 de karma por aplicação [M56]. Chance por golpe é lacuna.
- Arco (PODE na primeira versão): ficar parado 1 s antes de disparar; alcance 10 tiles; 1 flecha por disparo; 40% de a flecha cair no chão ao errar e 40% de ir para a mochila da criatura ao acertar [M51][M58].

## 7. Magia (segunda versão)

### 7.1 Círculos, mana e reagentes

- 8 círculos de 8 magias, 64 no total [M22][M60]. Mana por círculo: 4, 6, 9, 11, 14, 20, 40, 50 [M22][M31][M60].
- 8 reagentes. Cada magia consome uma unidade de cada reagente da sua receita (inferência sobre a quantidade) [M22].
- Receitas completas por magia em [M] §4.1 [M22]. A reimplementação **DEVE** guardar a receita como dado.

### 7.2 Tempo e alcance

- Conjuração = 0,25 + 0,25 · círculo segundos (0,5 s no 1º, 2,25 s no 8º) [M21][M31].
- Intervalo mínimo até a próxima magia: 0,75 s [M32].
- Alcance: 10 tiles para alvo em criatura, 15 para alvo em local (abr/1999) [M8].

### 7.3 Chance de sucesso

Janela de 40 pontos por círculo c, começando em `m_c = (c − 1) · 100/7 − 20`: P = clamp((Magery − m_c)/40, 0, 1). Com Magery 100: 100% até o 6º círculo, ≈ 86% no 7º, 50% no 8º [M30][M31]. Pergaminhos usam a janela de dois círculos abaixo, não gastam reagentes e são consumidos no sucesso [M31][M32]. Na falha, o modelo gasta reagentes e não gasta mana (comportamento oficial é lacuna) [M32].

### 7.4 Interrupção

Dano recebido durante a conjuração interrompe, exceto no 1º círculo (exceção não confirmada); Protection impede a interrupção por golpes [M32][M60]. Espera após interrupção = max(0,2 s; 1 − √(decorrido / tempo_de_conjuração)) [M32].

### 7.5 Dano e resistência

| Magia | Dano-base | Se resistida |
|---|---|---|
| 1º, flecha mágica | 4–7 | × 0,75 |
| 2º, dano direto | 1–15 (× 0,5 a 2 tiles; × 0,25 mais longe) | × 0,75 |
| 3º, bola de fogo | 10–16 | × 0,75 |
| 4º, raio | 12–20 | × 0,75 |
| 5º, golpe mental | (maior stat − menor stat do alvo)/2, teto 45 | × 0,5 |
| 6º, raio de energia | 24–41 | × 0,75 |
| 6º, explosão | 23–44 | × 0,75 |
| 7º, coluna de fogo | 27–48 | × 0,6 |
| 7º, corrente de raios | 27–48, dividido entre alvos a 2 tiles | × 0,5 |
| 8º, terremoto | 60% da vida atual, teto 75; raio 1 + Magery/15 | — |

Fonte: [M33]–[M42]. Conflitos: explosão com dano imediato desde jan/1999 [M4] contra atraso de 2,5 s no emulador; teto do golpe mental 45 contra 40 ou 60% da vida no Publish 5 [M15].

Multiplicador de Evaluating Intelligence (EI do mago, RS do alvo, M = Magery) [M32]: k = 1 + (EI − RS)/500 se EI > RS; senão k = 1 + (EI − RS)/200; depois k += (M − 100)/400; k dobra contra criaturas.

Resistência (oficial, fev/1999: reduz até metade do dano; Eval Int pesa) [M6]. Modelo [M31]: V = max(RS/5; RS − ((H − 20)/5 + 5c)), com H o skill de conjuração do mago; chance de resistir = V/2 % no emulador, ou V % na leitura da tabela da Stratics (conflito; a tabela original não pôde ser lida).

### 7.6 Meditation

Só segurando apenas o livro, sem armadura de metal ou osso; qualquer ação interrompe; o sucesso dobra a regeneração de mana enquanto dura [M5]. Fórmula em 4.3.

## 8. Cura, veneno, morte

### 8.1 Bandagens (DEVE)

Tempos oficiais desde 1999-05-25 [M9]:

| Ação | Em outro | Em si |
|---|---|---|
| Curar vida | 5 s | 15 s |
| Curar veneno | 6 s | 18 s |
| Ressuscitar | 10 s | — |

Desde fev/2000 a destreza encurta o tempo [M13]; o modelo do emulador (posterior) usa em si 9,4 + 0,06 · (120 − destreza) s [M49].

Quantidade (emulador) [M49], An = Anatomy, He = Healing: mínimo = An/5 + He/5 + 3; máximo = An/5 + He/2 + 10; sorteio entre os dois; cada "escorregão" (dano recebido durante a cura) tira 4. Chance de funcionar = (He + 10)/100 − 0,02 por escorregão. Alcance 1 tile. Curar veneno exige 60/60, chance = (He − 30)/50 − 0,1 · nível − 0,02 por escorregão. Ressuscitar exige 80/80, chance = (He − 68)/50 − 0,02 por escorregão.

### 8.2 Veneno (FORA da primeira versão)

Níveis do jogador: fraco, normal, forte e mortal (um quinto, letal, para monstros) [M50]. Modelo (emulador): 10 pulsos, o primeiro após 3,5 s; dano por pulso = 1 + vida_atual × percentual, limitado entre mínimo e máximo; percentuais 2,5%, 3,125%, 6,25%, 12,5% e 25%; intervalos de 3, 3, 3, 4 e 5 s [M50]. Veneno mais forte substitui o mais fraco, nunca o inverso (fev/1999) [M6]. Os mínimos provavelmente são posteriores ao T2A (inferência) [M15].

### 8.3 Morte e ressurreição (DEVE)

- Ao morrer, o personagem vira fantasma e deixa um corpo com todos os itens que não são "de novato" [M54][M70b].
- Fantasmas podem usar portais de viagem (mai/1999) [M9].
- Desde fev/2000 não há ressurreição instantânea: volta-se sempre como fantasma [M13]; antes disso o comportamento é lacuna.
- Formas de ressurreição: curandeiro NPC, santuário, magia do 8º círculo, bandagem 80/80 [M22][M49][M16].
- Modelo (emulador): volta com 10 de vida e perde 10% da fama [M45][M55].
- Corpos e itens no chão somem com o tempo: seção 13.

## 9. Reputação

### 9.1 Notoriedade

- Cores: azul inocente, cinza criminoso ou atacável, vermelho assassino [M47][M16].
- Criminoso por no mínimo 2 minutos após roubar e ser visto, atacar ou matar inocente, ajudar criminoso, saquear sem direito [M24][M16].
- Murder counts: curto prazo −1 a cada 8 h de jogo; longo prazo −1 a cada 40 h (desde mar/1999); vermelho com 5 ou mais [M7][M23][M25].
- Perda por assassinato na ressurreição: depende só do curto prazo; modelo do emulador com 5+ mortes, fator 1 − (4 + mortes/5)/100 limitado a [0,85; 0,95] sobre stats e skills [M7][M55]. Percentual do T2A é lacuna.
- Num jogo de um jogador só, a notoriedade **DEVE** valer contra NPCs (atacar ou roubar NPC inocente torna o jogador criminoso para guardas e vendedores; inferência de adaptação) [M] §7.

### 9.2 Fama e karma

- Modelo (emulador): ganho efetivo = ganho bruto − valor_atual/100, nunca abaixo de 0; perdas agravadas pelo mesmo termo; fama 0–15000, karma −15000 a +15000 [M48]. (conflito) Faixas oficiais atuais: fama 0–10000, karma ±32000 [M26].
- Karma sobe matando criaturas malignas e desce matando criaturas "boas" ou animais domésticos [M26][M60].
- Títulos: 5 faixas de fama e 11 de karma (limites em ±625, ±1250, ±2500, ±5000, ±10000); título de skill a partir de 30, de 10 em 10 até 100 [M48]. A reimplementação **DEVE** usar textos de título próprios.

## 10. Mundo, tempo e movimento

### 10.1 Mapa

- Um único mundo na era: o mapa 0, com 6144 × 4096 tiles úteis. O 7168 de largura é de 2005 em diante; recortar a leitura (inferência a partir de [W5][W3][F7]).
- Britannia ocupa x de 0 a 5120 e as Lost Lands ficam a leste, de 5120 a 6144 (inferência; coordenadas exatas são lacuna) [W21].
- Trammel, Ilshenar, Malas, Tokuno e Ter Mur: **FORA** [W7][W3]. Regra de recursos em dobro em Felucca é posterior: **FORA** [W2].
- A primeira versão **DEVE** jogar num recorte do mapa (uma cidade e arredores com uma área de criaturas); o tamanho do recorte é decisão D8 (inferência de escopo).

### 10.2 Regiões

Toda posição pertence a uma região com regras (inferência a partir de [W14][W16]):

| Tipo | Regras | Fonte |
|---|---|---|
| Cidade guardada | Guardas contra criminoso e assassino; sem construção; algumas magias proibidas (campo de fogo desde jan/1999, invocar elementais desde abr/1999); jogador com 5+ mortes não usa vendedores | [W13][W14][W45][W38] |
| Dungeon | Luz fixa escura; sem construção | [W16][W20] |
| Campo | Sem guardas | [W13] (inferência) |

**Guardas** (DEVE na primeira versão, porque a cidade é do escopo):
- Quem pode ser alvo: criminoso, assassino (5+ mortes) e quem ajuda criminoso [W14].
- Chamada pelo jogador: falar a palavra de chamada atinge um alvo a até 14 tiles [W14].
- Chamada automática: depois de um ato criminoso, por 15 s, se houver NPC humano a até 8 tiles, ele chama o guarda [W14].
- Efeito: o guarda aparece junto ao alvo e o mata de um golpe (dano = vida máxima); ocioso, some depois de cerca de 42 s [W13][W15].
- Num jogo de um jogador só, os alvos são o próprio jogador e NPCs criminosos (inferência de adaptação).

### 10.3 Viagem (FORA da primeira versão)

Oito portais lunares fixos cujo destino depende das fases das duas luas, ligadas à hora do jogo; desde fev/2000 clicar no portal descreve o destino [W8][W10][W12]. Magias de marcar runa, retornar e abrir portal; livro de runas com 16 destinos (nov/1999) [W9][W10][W11][W51]. Ficam para depois da magia.

### 10.4 Hora, luz e clima

- **Dia de jogo:** cerca de 2 horas reais; 1 minuto de jogo ≈ 5 s reais (inferência a partir de [W19]). Calendário de meses de 73 dias e anos de 12 meses [W19].
- **Luz global** numa escala de 0 (claro) a valores maiores (escuro) [W20]:
  - dia 0, noite 12, dungeon 26;
  - modelo do emulador: noite plena de 0h00 a 3h59, amanhecer linear de 4h00 a 5h59, dia pleno de 6h00 a 21h59, anoitecer linear de 22h00 a 23h59; recalcular a cada 5 s [W20];
  - (conflito) o próprio emulador registra que o original não tinha transição (noite até 3h59, dia às 4h00), e uma wiki dá dia das 6h à meia-noite [W20][W19]. Decisão D9.
- **Luz pessoal:** magia de visão noturna dura de 15 a 25 minutos [W20]; fantasmas não sofrem a luz ambiente (fev/1998) [W22]; tochas e velas existem, raio e intensidade são lacuna [W22].
- **Clima (PODE):** modelo do emulador com zonas fixas (neve garantida em área gelada) e 15 sistemas itinerantes de 400 × 400 tiles por mapa, andando 8 tiles a cada 30 s; intensidade sobe até 70 e desce até 10; temperatura positiva dá chuva, negativa dá neve [W21]. Nenhuma fonte da era foi lida; estações são lacuna [W3].

### 10.5 Movimento e colisão (DEVE)

Tempos de passo na seção 2.2 [W23][E45]. Regras de terreno (emulador) [W24]:

- O personagem ocupa 16 unidades de altura.
- Sobe numa superfície cujo topo fique no máximo **2 unidades** acima do topo atual.
- Usando os flags do `tiledata` (3.7): intransponível bloqueia quando a faixa vertical do objeto cruza a do personagem; superfície sem intransponível é chão candidato; ponte conta como plano na própria altura; água só é chão para quem nada.
- Novo z: entre os chãos válidos (degrau cabe e 16 unidades livres acima), vence o mais próximo do z atual; empate, o mais alto. O terreno usa a altura média do seu losango.
- Diagonal: o destino precisa ser válido; para o jogador, também os dois tiles laterais; para criaturas, basta um.
- Personagens bloqueiam quando as faixas de altura se sobrepõem; mortos não bloqueiam.
- Desde out/1998 não se anda sobre peles e vegetais no chão [W95].

## 11. NPCs e economia

### 11.1 NPCs da cidade (DEVE: vendedor, banqueiro, curandeiro, guarda)

| Papel | Comportamento | Fonte |
|---|---|---|
| Vendedor | Compra e vende por tabela (11.3); recusa quem tem karma muito baixo (abr/1998) ou 5+ mortes | [W51][W14] |
| Banqueiro | Abre o cofre do jogador; recusa criminoso (set/1998); emite cheques (mar/2000) | [W33][W34] |
| Curandeiro | Oferece ressurreição a fantasma a até 4 tiles com linha de visão, conferindo a cada 2 s | [W40] |
| Guarda | Seção 10.2; guardas de banco ficam perto do posto | [W36] |
| Treinador | Qualquer NPC com skill pode treinar (11.5) | [W35][W12] |
| Pregoeiro, cuidador de estábulo, escolta, arquiteto | **FORA** da primeira versão | [W22][W36][W95][W38] |

A interação **DEVE** usar menu de contexto e PODE aceitar palavras-chave; as palavras de chamada de guarda e de treino têm fonte da era, as de compra, venda e banco não (inferência) [W12][W13][W29].

### 11.2 Ouro e banco

- Ouro em pilha até 60.000 (ago/1999) [W11].
- Um cofre por jogador, acessível em qualquer banco; desde nov/1999 sem limite de peso e com limite de **125 itens**, contando contêineres internos [W10][W27].
- Contêineres comuns: 400 de peso e 250 itens (fev/1998) [W22].
- Cheques (PODE): de 5.000 a 1.000.000, debitados do banco e creditados ao depositar; não servem em vendedores [W34].

### 11.3 Preços e estoque

O sistema de oferta e procura do original (estoque, ritmo de venda, caixa da loja) falhou na prática e foi remendado [W27][W36]; sua fórmula é lacuna. A reimplementação **DEVE** usar o modelo de tabela do emulador [W28][W29][W30][W31]:

- Preço de venda do NPC = preço-base × (100 + taxa da cidade)/100, arredondado; fora de cidade, taxa 0.
- Preço pago ao jogador: tabela por tipo, em geral ≈ 50% do preço de venda; baixa qualidade × 0,60; excepcional × 1,25; +100 de ouro por nível mágico de durabilidade, dano ou proteção.
- Item comprado do jogador volta à venda por 1,9 × o que o NPC pagou e some depois de 1 hora.
- A cada hora de jogo: se um item esgotou, o estoque máximo dobra (teto 999); se sobrou mais da metade, o máximo cai à metade; depois o estoque volta ao máximo.
- Limites: até 50.000 de ouro por transação, conferindo se cabe na mochila (set/1998) [W33]; até 500 itens por venda [W29].

### 11.4 Morte e o curandeiro

Integra a seção 8.3: o fantasma procura um curandeiro, que oferece a ressurreição ao se aproximar [W40]. A primeira versão **DEVE** ter pelo menos um curandeiro na cidade e um santuário no campo (inferência de escopo).

### 11.5 Treino com NPC (PODE)

Modelo do emulador [W35]: o NPC ensina até 1/3 da própria skill, com teto de 42,0; precisa ter pelo menos 60,0, e o resultado precisa chegar a 20,0; custo de 10 de ouro por ponto, pagamento parcial ensina em parte; o aluno respeita os caps. Desde nov/1999 não se treina com o total no cap e todas as travas em "sobe" ou "para" [W10]. (conflito) Uma fonte moderna, vista só em busca, fala em teto ≈ 30 [W] §10.

## 12. Coleta e crafting (FORA da primeira versão)

Especificado para a versão seguinte.

### 12.1 Bancos de recurso

O mapa se divide em blocos com estoque que se esgota e se repõe [W42][W43][W44]:

| Recurso | Bloco | Estoque | Reposição | Por coleta | Alcance |
|---|---|---|---|---|---|
| Minério | 8 × 8 | 10–34 | 10–20 min | 1 | 2 tiles |
| Areia | 8 × 8 | 6–12 | 10–20 min | 1 | 2 tiles |
| Madeira | 4 × 3 | 20–45 | 20–30 min | 10 | 2 tiles |
| Peixe | 8 × 8 | 5–15 | 10–20 min | 1 | até 4 da água |

Minérios coloridos (fev/1999): oito além do ferro, com skill mínima de 65 a 99 e chance decrescente por veio (de 11,2% a 1,4%; ferro 49,6%); veio que falha dá ferro; lingotes coloridos fazem armadura e escudo, não armas [W41][W42]. Não se coleta montado [W42][W44].

### 12.2 Fórmulas de fabricação (emulador)

Com `s` skill, `[s_min, s_max]` faixa do item e `c₀` chance mínima do sistema [W48][W49]:
- sucesso P = c₀ + (s − s_min)/(s_max − s_min) · (1 − c₀); bloqueado abaixo de s_min; 100% a partir de s_max; ferraria c₀ = 0;
- excepcional (ferraria) = P − d(s), com d = 0,60 até s = 95, caindo em linha reta até 0,45 em s = 100;
- marca do criador: excepcional e skill ≥ 100;
- falha consome os recursos (receitas "usa tudo" perdem metade); a ferramenta gasta 1 uso sempre.
- Reparo: todo reparo reduz a durabilidade máxima (abr/1998) [W51]; modelo de dificuldade e enfraquecimento em [W] §5.4 [W50].
- Linha do tempo das regras de cada ofício dentro da era em [W] §5.3. Alchemy, Cooking, Inscription e Bowcraft sem números (lacuna).

## 13. Criaturas, IA e loot

### 13.1 Arquétipos de IA (DEVE: corpo a corpo e animal)

| Arquétipo | Comportamento | Fonte |
|---|---|---|
| Corpo a corpo | Procura alvo na percepção, persegue até 1 tile, ataca; foge com vida < 20% da máxima e volta a lutar acima de 50% | [W60] |
| Animal | Ataca alvo válido; foge com vida < 10%; animais pacíficos só reagem a agressor | [W61][W78] |
| Mago (PODE) | Cura-se quando falta vida; sorteia magias de dano, veneno, maldição e paralisia; teleporta quando bloqueado | [W62] |
| Arqueiro (PODE) | Existe no emulador; detalhes não lidos | [W35] |

- **Escolha de alvo** por modo: só agressores, mais forte, mais fraco, mais próximo, ou "maligno" [W35].
- **Chance de fuga** no corpo a corpo, rolada abaixo do limiar: 10% + diferença de vida em pontos percentuais se estiver em desvantagem, senão 10% [W60]. O comportamento do mago no emulador tem provável erro; não reproduzir [W62].
- **Percepção** 16 tiles (conflito: 10 nos dados de cada criatura) [W35][W71]; abandona o alvo além de 3 × percepção [W60].
- **Território:** raio de casa 10; vaga livre até ≈ 2/3 do raio, fora do raio volta para casa, na faixa intermediária volta em ≈ 40% das vezes; cada passo de vagar tenta mover em ≈ 9/16 das vezes [W35][W63].
- **Ritmo** do tique da IA (s, ativo/passivo): lento 0,30/0,60 (rato, esqueleto, zumbi, ogro); médio 0,25/0,50 (orc, cavalo, cão, dragão); rápido 0,20/0,40; muito rápido 0,175/0,35 [W26][W63].
- **Ativação:** a IA dorme quando não há jogador no setor (2.1) [W63].

### 13.2 Surgimento (spawn)

- Modelo de ponto (emulador): 1 criatura, verificação a cada 5–10 min, raio de 4 tiles; a morte não força o renascimento, que ocorre na próxima verificação; em grupo, só repõe quando todos morreram [W64].
- Modelo de região (emulador): verificação a cada 2–5 min, repõe ⌈(máximo − atuais)/3⌉, mínimo 1 [W65].
- Monstros não nascem dentro de casas (mai/1999); criatura presa em lugar inválido morre depois de um tempo (jan/2000) [W46][W68].

### 13.3 Criaturas iniciais (dados do emulador; nomes e arte próprios)

| Arquétipo de referência | IA | For / Des / Int | Vida | Dano | Fama / karma | Loot |
|---|---|---|---|---|---|---|
| Rato pequeno | corpo a corpo | 9 / 25 / 6–10 | 6 | 1–2 | 300 / −300 | pobre |
| Rato grande | corpo a corpo | 32–74 / 46–65 / 16–30 | 26–39 | 4–8 | 300 / −300 | pobre |
| Esqueleto | corpo a corpo | 56–80 / 56–75 / 16–40 | 34–48 | 3–7 | 450 / −450 | pobre + peça de osso |
| Morto-vivo | corpo a corpo | 46–70 / 31–50 / 26–40 | 28–42 | 3–7 | 600 / −600 | escasso |
| Humanoide hostil | corpo a corpo | 96–120 / 81–105 / 36–60 | 58–72 | 5–7 | 1500 / −1500 | escasso; arma em ≈ 30% |
| Gigante de duas cabeças | corpo a corpo | 136–165 / 56–75 / 31–55 | 82–99 | 7–17 | 3000 / −3000 | escasso + médio |
| Cavalo | animal (só agressor) | 22–98 / 56–75 / 6–10 | 28–45 | 3–4 | — | — |

Fonte: [W71]–[W78]. Skills de luta das criaturas: lacuna nesta pesquisa (inferência: tabela por criatura).

### 13.4 Loot

Pacotes por nível de criatura (emulador, pré-AOS) [W79]:

| Pacote | Ouro | Itens mágicos (chance · intensidade) |
|---|---|---|
| Pobre | 1d25 | nenhum |
| Escasso | 5d10 + 25 | 1% · 0–60; 0,2% · 10–70 |
| Médio | 10d10 + 50 | 5% · 20–80; 2% · 30–90; 0,5% · 40–100 |
| Rico | 10d10 + 250 | 20% · 60–100; 10% · 65–100; 1% · 70–100 |
| Muito rico | 2d125 + 400 | 33% · 50–100; 33% · 60–100; 20% · 70–100; 5% · 80–100 |

- Intensidade → nível mágico: 0–49 nível 1; 50–74 nível 2; 75–88 nível 3; 89–96 nível 4; 97–100 nível 5 [W79].
- Atributos sorteados: arma — precisão 80%, dano 60%, durabilidade 40%; armadura — proteção 80%, durabilidade 40% [W79]. "Matador de espécie" (5%) **FORA** da primeira versão.
- Efeitos por nível (emulador): dano +1/+3/+5/+7/+9 (seção 6.3); precisão +5 a +25 de Tactics; durabilidade e proteção na seção 6.4–6.5 [W80][W81]. (conflito) Uma wiki diz que o maior bônus de dano era +5 no original; a escala de armas mudou em nov/1998 [W82][W52]. Decisão D10.
- Os nomes dos níveis **DEVEM** ser próprios.
- Cargas de magia em armas e mapas do tesouro (jan/1999): **FORA**; números da era são lacuna [W45][W79].
- Desde fev/2000 a maioria das criaturas não carrega mochila [W12].

### 13.5 Corpos e itens no chão (DEVE)

- Corpo de criatura some em 7 min; corpo do jogador vira ossos aos 7 min e some aos 14 min (emulador) [W84]. (conflito) Nota de out/1998: restos somem em 15 min [W87]. Decisão D11.
- Corpo que some despeja o conteúdo num saco no chão (set/1998) [W33].
- Itens soltos no chão somem: "em poucos minutos" no original, 1 hora no emulador [W27][W85][W86] (conflito; D11).
- Saquear corpo de inocente torna criminoso (emulador) [W84].

## 14. Housing e barcos (FORA)

Resumo para versões futuras, detalhes em [W] §6:
- Sete tipos de casa da era em deeds, de 43.800 (pequena) a 1.022.800 (castelo) de ouro no emulador, com limites de itens travados e cofres por tipo (nov/1999) [W32][W10].
- Colocação exige terreno nivelado, borda livre e afastamento de outras casas; proibida em cidade guardada e dungeon [W53][W68][W56][W14][W16].
- Posse por chave, co-donos (8 na era; 15 no emulador, conflito), listas de amigos e banidos [W10][W53][W57].
- Decaimento em seis estágios até o colapso; o que renovava a casa na era é lacuna [W57][W58].
- Barcos com chave, ancoragem e porão; tipos são lacuna [W37][W46][W10].

## 15. Persistência

- O servidor emulado salva por instantâneo do mundo inteiro, com versão por tipo de entidade, em thread separada do laço [E37][E40][E44].
- A reimplementação **DEVE** salvar e carregar o estado autoritativo da simulação (entidades, timers com tempo restante, relógio do mundo, semente do sorteio), nunca o estado visual (inferência a partir de [E39][E40]).
- Nada lido da instalação do jogador **DEVE** ir para o save; o save guarda só identificadores (inferência; seção 17).

## 16. Decisões pendentes (para o responsável)

| # | Decisão | Opções e fontes | Recomendação |
|---|---|---|---|
| D1 | Ponto de referência dentro do T2A | lançamento (out/1998), mar/2000, ou "pré-AOS final" do emulador | mar/2000, com números do emulador onde não houver oficial (inferência) |
| D2 | Vida máxima | 50 + força/2 [M19][M45] ou força (sem fonte) | 50 + força/2 |
| D3 | Resistência a magia | fator 1/2 do emulador ou tabela Stratics [M31] | decidir antes da magia (segunda versão) |
| D4 | Parry | modelo do emulador ou calibrado pelo Publish 5 [M53][M15] | emulador |
| D5 | Travas de skill e "power hour" | dentro da era (nov/1999, mar/2000) [M11][M14] | travas sim; power hour PODE (sem sentido sem sessões diárias; inferência) |
| D6 | Criação de personagem | 80/100 do emulador ou 65/100 (sem fonte) [M54] | tabela configurável, padrão 80/100 |
| D7 | Fama e karma | ±15000 [M48] ou 10000/±32000 [M26] | ±15000 |
| D8 | Mapa e recorte da primeira versão | recorte do mapa real lido da instalação ou região própria | recorte do mapa real, uma cidade e arredores; reavaliar com a seção 17 |
| D9 | Curva de luz | crepúsculos de 2 h do emulador, sem transição, ou dia das 6h à meia-noite [W20][W19] | emulador, com a alternativa em dados |
| D10 | Bônus mágico de dano | +9 no nível máximo [W80] ou +5 [W82] | emulador (+1 a +9) |
| D11 | Tempo de corpos e itens no chão | 7 + 7 min e 1 h do emulador, ou 15 min e "minutos" do original [W84][W87][W27][W85] | corpos 7 + 7 min; itens 1 h (configurável) |

## 17. Riscos legais e de licença (não é parecer jurídico)

- **Termos do UO:** cópias de fórum dos termos proíbem emuladores e ferramentas "derivadas de ou criadas para" o UO sem autorização escrita da EA, e jogar fora do serviço [E86]. Um jogo que lê os arquivos do cliente para oferecer outra forma de jogar se aproxima dessa cláusula (inferência) [E] §6.6. O texto oficial atual não foi lido (lacuna). O `00-seguranca.md` aceitou o risco da §2 dos termos só para análise estática; **a decisão de assets da Fase 0 amplia esse uso e precisa de nova avaliação do responsável.**
- **Precedente FreeSO (2017):** motor que lia os arquivos do usuário, sem distribuir assets, recebeu pedido da EA centrado em marca, doações e porte para outras plataformas [E84]. Mitigação: nome próprio, nenhuma marca da EA no produto, sem monetização, cautela com outras plataformas.
- **Marcas:** "Ultima Online" registrada; a EA fez novos depósitos de "Ultima" em jun/2026 [E93][E96]. "Britannia" não verificado; tratar como protegido (inferência).
- **Direitos em 2027:** Garriott notificou a EA para recuperar direitos do Ultima a partir de 2027; o escopo (inclusive se cobre o UO) está em negociação [E94][E95].
- **Licenças do código aberto** (só referência, nunca cópia): ClassicUO BSD-2-Clause (README diz "BSD 4"); ModernUO GPL-3.0; ServUO e RunUO GPL-2.0; Sphere Source-X Apache-2.0; UOFiddler e Ultima SDK "Beerware" só no README; MobileUO GPLv3 no README; OrionUO MIT [E] §1.1 [F] refs. **POL:** termo de uso próprio que condiciona até a leitura do código — não usar como fonte [E14]. **xrip/uo-client:** diz derivar de descompilação do cliente 2.0.7 — excluir da sala limpa [E34].

## 18. Lacunas principais

- Fontes primárias da era (Stratics antigo, Wayback Machine) inacessíveis para as ferramentas usadas [E91][F] decisões autônomas.
- Fórmulas oficiais de ganho de skill e stat; criação de personagem; ritmo de golpe antes de fev/1999; regeneração de vida e estamina; parry e armadura antes do Publish 5 [M] §8.
- Coordenadas das Lost Lands no mapa 0; ordem de percurso das células no desenho; partes do formato novo de animação [F] lacunas.
- Raio das fontes de luz; estações; palavras-chave de vendedor e banqueiro; fórmula de preço do original; números de Alchemy, Inscription, Cooking e Bowcraft; cargas de magia; mapas do tesouro da era; o que renovava as casas; tipos de barco [W] §11.
- Texto oficial atual dos termos do UO [E] §6.2.

## Anexo A. Revisão dos documentos do PRKing_UO (2026-10-28, só leitura)

Lidos em `H:\King\Clientes e Projetos\PRKing_UO`, sem edição: `README.md`, `docs/roadmap.md`, `docs/architecture/unity-offline-architecture.md`, `docs/prd/uo-offline-prd.md`, `docs/research/ultima-online-dossier.md`, `docs/research/source-ledger.md` e `docs/stories/1.1-unity-foundation-and-local-vertical-slice.md`. Cada item diz onde está a divergência e a fonte que a sustenta. As decisões da Fase 0 estão em `docs/plano-de-execucao.md` deste repositório.

### A.1 Estrutura do projeto

| # | Achado | Onde | Fonte |
|---|---|---|---|
| A1 | A pasta não é repositório git (sem `.git`), embora a exceção do CLAUDE.md fale em "git próprio" | raiz do PRKing_UO | `ls -a` em 2026-10-28; item 8 do CLAUDE.md deste repositório |
| A2 | A Story 1.2 (gadget de temperatura para Windows) não tem relação com o UO e está como Done, mas `packages/` está vazio | `docs/stories/1.2-*`, `packages/` | listagem em 2026-10-28 |
| A3 | A seção "Ferramentas auxiliares" aparece duas vezes e aponta para `packages/hardware-monitor-gadget/`, que não existe | `README.md`, linhas 30–36 | leitura em 2026-10-28 |

### A.2 Divergências com as decisões da Fase 0

| # | PRKing_UO diz | Fase 0 decidiu | Fonte |
|---|---|---|---|
| A4 | Unity 6.3 LTS | Unity 2022.3 LTS | `README.md` l. 14; arquitetura l. 18; Story 1.1; seção 1 desta especificação |
| A5 | Conteúdo original como padrão; importador de dados do cliente opcional | Ler a cópia instalada em tempo de execução, sem redistribuir; placeholders até o cliente existir | `README.md`; PRD; seção 3 |
| A6 | Perfil "T2A/Renaissance" | T2A puro; Renaissance e Trammel ficam fora | `README.md` l. 15; seção 1.1 [M1][M15][W7] |
| A7 | Nome "PRKing UO Offline" (contém a sigla da marca) | "Outrora" proposto; nenhuma marca da EA no produto | seção 17 [E84][E93][E96] |
| A8 | Escopo da primeira fatia (PRD §8 e Story 1.1) inclui recurso coletável, receita, crafting; o PRD ainda prevê ranged, quatro magias, mining, lumberjacking, pets, casa e missão | Loop básico: sem crafting, coleta, magia, pets nem casa; com morte e ressurreição, banco e dia e noite, que a Story 1.1 não tem | seção 1; Story 1.1 |
| A9 | A Story 1.1 deixa "dados de UO" e ganho completo de skill fora | Ganho de skill e leitura da instalação fazem parte do loop básico | seções 3 e 5 |

### A.3 Lacunas e divergências de conteúdo

| # | PRKing_UO diz | Esta pesquisa | Fonte |
|---|---|---|---|
| A10 | 58 skills (lista moderna) como catálogo | 49 skills no fim do T2A, 46 no lançamento; as outras são de eras posteriores | dossiê l. 99 e 139; seção 5.1 [M44][M5][M6] |
| A11 | Mapa atual 7168 × 4096 e legado 6144 × 4096, sem dizer qual usar | T2A usa só o mapa 0 recortado a 6144 × 4096 | dossiê l. 158–159; seção 10.1 [W5][W3][F7] |
| A12 | Quadro legal cita só o acordo de usuário geral da EA e a política de conteúdo | Faltam: cláusula dos termos do UO contra emuladores e ferramentas derivadas [E86]; precedente FreeSO [E84]; novos depósitos da marca "Ultima" em 2026 [E93]; recuperação de direitos por Garriott a partir de 2027 [E94][E95] | dossiê l. 207; seção 17 |
| A13 | Ledger de fontes sem POL, MobileUO e xrip/uo-client | POL tem termo que condiciona até a leitura do código [E14]; MobileUO (Unity + ClassicUO) é GPLv3 [E26]; xrip/uo-client deriva de descompilação e deve ficar fora da sala limpa [E34] | `source-ledger.md`; seção 17 |
| A14 | Licença do ClassicUO não detalhada; Ultima SDK "verificar licença" | ClassicUO: arquivo LICENSE BSD-2-Clause, README diz "BSD 4" [E1][E2]; Ultima SDK e UOFiddler: "Beerware" só no README [E21] | ledger l. 49; seção 17 |
| A15 | UO Offline (Klein187) descrito como "derivado de ModernUO/ClassicUO", com licença a confirmar | Se deriva do ModernUO, herda GPL-3 [E] §1.1 (inferência); só referência de comportamento, nunca cópia | dossiê l. 200; ledger l. 50 |
| A16 | Chunks de 32 × 32 tiles | O dado nativo vem em blocos de 8 × 8 (ordem de coluna) e o servidor ativa setores de 16 × 16; um chunk de 32 × 32 junta 4 × 4 blocos, o que funciona, mas a leitura precisa respeitar a ordem dos blocos | arquitetura l. 203; seção 3.5 [F7][F44]; seção 2 [E46] |
| A17 | Ordenação por (screenY, z, layer, stableId) | A ordem do cliente de referência usa diagonais e uma prioridade por tipo (terreno z − 2, objeto z ± 1, personagem z + 1, efeito z + 2); "screenY" já mistura z e erra objetos altos (inferência) | arquitetura l. 212; seção 3.9 [F23][E57][E58] |
| A18 | Tique autoritativo de 10 Hz | Compatível com passos de 400, 200 e 100 ms (múltiplos de 100 ms) e com o tique de IA de 0,175 s só se arredondado (inferência) | arquitetura l. 219; seções 2.2 e 13.1 [E45][W26] |
| A19 | Unity 6.3 LTS "com suporte até dezembro de 2027" | Não verificado nesta pesquisa; vale conferir se a escolha voltar ao Unity 6 | arquitetura l. 18 |
| A20 | Nenhuma menção às fórmulas da era (acerto, dano, ganho, regeneração) nem a que perfil numérico usar | Seções 4–9 desta especificação, com o aviso de que os números vêm do emulador pré-AOS | seção "Modelo numérico" |
