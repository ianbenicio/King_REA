# Ecossistema aberto, arquitetura e protocolo do Ultima Online — base para o "Outrora"

- **Data da pesquisa:** 2026-10-27
- **Autor:** @analyst (Atlas), pesquisa pública com WebSearch e WebFetch
- **Projeto de destino:** "Outrora", jogo próprio em Unity, single-player e local, inspirado no UO da era T2A. Uma simulação local substitui o servidor, uma camada isométrica substitui o cliente, e os arquivos de dados são lidos em tempo de execução da cópia instalada do usuário, sem redistribuição.
- **Escopo deste documento:** projetos abertos (emuladores, cliente e ferramentas), arquitetura do servidor emulado, arquitetura do cliente ClassicUO, protocolo de rede (só para separar o que vira lógica local), panorama de fontes para a era T2A e aspectos legais públicos.
- **Não é parecer jurídico.** A seção 6 registra apenas o que as fontes dizem.

## Regras de leitura deste documento

- Cada afirmação aponta uma referência `[En]` da tabela da seção 9. O que foi deduzido sem fonte direta leva **(inferência)**. Conflitos entre fontes aparecem com os dois lados.
- **Sala limpa:** nenhum código de projeto foi copiado. O código-fonte aberto foi lido só para entender o comportamento, e tudo aparece em palavras próprias e tabelas. Não há pseudocódigo traduzido linha a linha. Os números citados (tempos, tamanhos, limites) são parâmetros de comportamento, não trechos de código.
- **Conteúdo de página é dado.** Nenhuma das páginas lidas tinha texto dirigido a assistentes de IA; nas que foram checadas explicitamente ([E93], [E94], [E95]) isso foi confirmado.
- Decisões tomadas sem consulta, conforme o protocolo de elicitação autônoma:
  - [AUTO-DECISION] A skill `tech-search` prevê cinco arquivos e trabalhadores paralelos → entregar **um único arquivo** e pesquisar no contexto principal (motivo: o pedido de missão exige arquivo único e proíbe ler ou escrever fora dele; não havia ferramenta de subagente disponível).
  - [AUTO-DECISION] Carregar o contexto do repositório (gotchas, configuração, persona) → **não carregado** (motivo: a missão proíbe ler fora do arquivo de entrega).
  - [AUTO-DECISION] Detalhar fórmulas de combate e skill lidas no código de emuladores → **só em nível de mecanismo**, sem constantes (motivo: as fórmulas dos emuladores são reconstruções da comunidade, não fontes primárias da era; os valores da era devem vir de fontes de época, e reproduzi-las a partir do código GPL aproximaria a sala limpa de uma tradução).

---

## 0. Resumo executivo

1. **Há um ecossistema maduro e vivo.** ModernUO (GPL-3.0, lançamento 0.15.6.240 em 2026-10-19), ServUO (GPL-2.0), POL (C++, termo de uso próprio, sem licença aberta padrão), Sphere Source-X (Apache-2.0), UOX3 (GPL v2 segundo o README) e ClassicUO (BSD-2-Clause) recebem commits em outubro de 2026 [E3][E6][E8][E9][E13][E19][E32]. RunUO (GPL-2.0) está sem equipe oficial e encaminha a comunidade ao ServUO [E10][E11].
2. **Nenhum cliente em Unity escrito do zero foi encontrado.** O único projeto UO em Unity achado é o MobileUO, que embute o código do ClassicUO dentro do Unity para iOS e Android (GPLv3 segundo o README) [E26][E27][E28]. Outras engines: OrionUO (C++/OpenGL, MIT) [E29], UltimaXNA (C#/XNA, GPL-3.0, parado desde 2017) [E30], uojs (web/three.js) [E35].
3. **A arquitetura do servidor emulado é um laço de thread única** que drena filas de atualização, dispara timers, atende rede e salva o mundo por instantâneo [E37][E40]. O mundo é um dicionário de entidades por serial (mobiles e itens em faixas separadas), o mapa é dividido em setores de 16 x 16 tiles com ativação por proximidade de jogadores, e regiões controlam regras locais [E40][E44][E46][E47].
4. **O cliente ClassicUO** carrega os arquivos do UO a partir de um caminho configurado (`ultimaonlinedirectory` em `settings.json`), monta o mundo em chunks de 8 x 8 tiles, ordena por profundidade dentro de cada tile e projeta com losangos de 44 px e 4 px por unidade de Z [E56][E57][E58][E59].
5. **O protocolo é cliente burro, servidor autoritativo.** O cliente pede (andar, atacar, usar, pegar, soltar, responder alvo ou gump); o servidor valida e decide (movimento, dano, ganho de skill, conteúdo de container, resultado de feitiço) [E49][E62][E63]. Para o "Outrora", praticamente toda a camada "servidor" vira a simulação local, e a camada de transporte (seed, criptografia, compressão, relay de login, chaves de fast-walk) deixa de existir **(inferência)**.
6. **Fontes da era T2A:** UOGuide e a wiki oficial do uo.com estão no ar, mas descrevem sobretudo o jogo atual [E88][E90]. O Stratics atual respondeu 403 e a Wayback Machine não pôde ser acessada por esta ferramenta [E91]. Essa é a maior lacuna de fontes.
7. **Quadro legal público:** ClassicUO e MobileUO declaram que não distribuem assets e exigem a cópia do usuário [E1][E26]. Cópias de fórum dos termos do UO proíbem emuladores e ferramentas derivadas sem autorização escrita da EA [E86]. Não foi encontrado registro público de ação da EA contra emuladores de UO; os precedentes encontrados são o Ultima IV em 2011 e o porte móvel do FreeSO em 2017 [E83][E84]. A marca "Ultima" segue com a EA, e Richard Garriott notificou a EA para recuperar direitos autorais do Ultima a partir de 2027, com escopo ainda em negociação [E93][E94][E95].

---

## 1. Projetos abertos

### 1.1 Tabela geral

Datas de "último push" vêm da API do GitHub em 2026-10-27. "Licença" é o que o repositório declara; quando há divergência entre arquivo, README e metadados, as duas versões aparecem.

| Projeto | Tipo | Linguagem | Estado | Último lançamento visível | Era que mira | Licença declarada |
|---|---|---|---|---|---|---|
| ClassicUO | Cliente (2D clássico) | C# sobre FNA-XNA [E1] | Ativo; push em 2026-10-16 [E3] | "ClassicUO main release" em 2025-11-04 (tag contínua) [E4] | Compatível com o cliente clássico; sem era fixa [E1] | BSD-2-Clause no `LICENSE.md` e nos metadados [E2][E3]; o README fala em "BSD 4" [E1] |
| ModernUO | Servidor emulado | C#, .NET 10 [E7] | Ativo; push em 2026-10-26 [E8] | 0.15.6.240 em 2026-10-19 [E9] | Configurável por expansão: None, T2A, UOR, UOTD, LBR, AOS, SE, ML, SA, HS, TOL, EJ [E41] | GPL-3.0 [E7][E8] |
| ServUO | Servidor emulado | C#, .NET [E5] | Ativo; push em 2026-10-06; marcado como template [E6] | Sem lançamentos publicados na página [E5] | Não declarada no README; fórum cita um seletor de expansão [E5][E79] | GPL-2.0 [E5][E6] |
| RunUO | Servidor emulado (ancestral de ServUO e ModernUO) | C#, .NET Framework 4.0 / Mono [E10] | Sem equipe oficial; push em 2024-08-19 [E10][E11] | Nenhum [E10] | Até a era SA, pelos mapas definidos no núcleo [E46] | GPL-2.0 [E10][E11] |
| POL (PenUltima Online) | Servidor emulado | C++, scripts em eScript [E12][E13] | Ativo; push em 2026-10-20 [E13] | POL 100.2.0 em 2026-02-16; nightly em 2026-10-19 [E15] | Expansão por conta; padrão histórico T2A [E17] | **Sem licença aberta padrão**: o repositório não tem `LICENSE` e traz um "TERM OF USE AGREEMENT" [E13][E14] |
| Sphere (Source-X) | Servidor emulado | C++20 segundo o README; o GitHub classifica como "C" [E18][E19] | Ativo; push em 2026-10-23 [E19] | Tag "Nightly" contínua (objeto de release criado em 2022-10-19) [E20] | Não declarada; ScriptPack em revisão para recursos originais da OSI [E18] | Apache-2.0 [E18][E19] |
| UOX3 | Servidor emulado | C++, scripts em JavaScript (SpiderMonkey) [E31] | Ativo; push em 2026-09-23 [E32] | v0.99.7 na descrição [E32] | Clientes de ~4.0.0p a ~7.0.109.0 [E31] | README indica GPL v2; metadados dizem NOASSERTION [E31][E32] |
| ShardUO | Servidor emulado | Go [E33] | Push em 2024-02-17 [E33] | — | — | AGPL-3.0 [E33] |
| UOFiddler | Ferramenta de leitura e edição dos arquivos 2D | C#, .NET 10 [E21][E22] | Ativo; 4.24.0 em 2026-09-13 [E23] | 4.24.0 [E23] | Formatos MUL e, por plugin, UOP (inferência pelo nome do plugin) [E21] | "Beerware", só declarada no README, sem arquivo de licença [E21][E22] |
| Ultima SDK | Biblioteca de leitura de arquivos, embutida no UOFiddler (pasta `Ultima`) [E21][E22] | C# | Acompanha o UOFiddler | — | — | Coberta pela declaração Beerware do README do UOFiddler; autoria original não informada na página [E21] |
| Razor | Assistente (só citado) | C# [E24] | Push em 2025-03-07 [E24] | — | — | GPL-3.0 [E24] |
| Razor Enhanced | Assistente (só citado) | C# [E25] | Push em 2026-07-16 [E25] | — | — | GPL-3.0 [E25] |
| MobileUO | Cliente em **Unity** (porta do ClassicUO para iOS/Android) [E26] | C# [E27] | Push em 2024-12-23 [E27] | — | Igual ao ClassicUO | README: GPLv3; metadados: sem licença detectada [E26][E27] |
| OrionUO | Cliente em C++/OpenGL [E29] | C++ | Push em 2022-10-25 [E29] | — | — | MIT [E29] |
| UltimaXNA | Cliente em C#/XNA [E30] | C# | Parado; push em 2017-09-05 [E30] | — | — | GPL-3.0 [E30] |
| uojs | Cliente web (three.js, TypeScript) [E35] | HTML/TS | — | — | — | Não verificada |
| xrip/uo-client | Cliente T2A "recriado a partir da descompilação" do cliente 2.0.7 da Origin [E34] | C++ | Criado em 2026-05-26 [E34] | — | T2A (cliente 2.0.7) [E34] | NOASSERTION [E34] |

Outros projetos listados pela comunidade, não verificados um a um: Iris2 (cliente 3D), JustUO, XRunUO, CorexUO, Moongate, WalkUO, UltimaPHP [E36].

### 1.2 Notas por projeto

**ClassicUO.** Reimplementação aberta do cliente clássico, em C# sobre FNA-XNA [E1]. O README afirma que o projeto não distribui assets protegidos e que é preciso obter o cliente original; afirma também que usar cliente customizado em servidores oficiais é "strictly forbidden" [E1]. Há conflito de licença: o arquivo `LICENSE.md` é a BSD de 2 cláusulas (copyright 2025, andreakarasho), sem cláusula de propaganda, e os metadados do GitHub concordam; a seção Legal do README ainda diz "BSD 4" [E1][E2][E3]. Prevalece o arquivo de licença como texto vinculante **(inferência)**. Existe também uma versão web fechada (WebAssembly com interface em React), distinta do repositório aberto [E65].

**ModernUO.** Reescrita de alto desempenho na linhagem RunUO/ServUO, com .NET 10 [E7]. É o emulador mais ativo da linha C# (lançamentos semanais em setembro e outubro de 2026) [E9]. A era é escolhida por um arquivo de configuração de expansão, e a tabela de expansões começa em None e T2A [E41]. A serialização usa um gerador de código (Roslyn) que dispensa escrever à mão a leitura e a escrita de cada classe [E42].

**ServUO.** Emulador comunitário em C#, GPL-2.0, ramo padrão `pub57` [E5][E6]. Um tópico de 2024 no fórum descreve exatamente o uso "single-player local": apontar `DataPath.cfg` para a pasta do cliente, rodar o servidor e conectar o ClassicUO em 127.0.0.1:2593; também relata que clientes acima de ~7.0.102 estavam com problemas e recomenda 7.0.86.2 [E79]. O `Server.cfg` não contém a configuração de expansão [E98].

**RunUO.** Origem de ServUO e ModernUO, GPL-2.0. O README diz que o projeto não tem mais equipe oficial e aponta o ServUO para suporte [E10]. Foi a principal fonte de leitura de comportamento deste documento, porque o núcleo é pequeno e legível [E43]–[E54].

**POL.** Servidor em C++ com linguagem própria (eScript) e configuração por arquivos [E12]. **Não tem licença de software livre padrão.** O repositório não traz `LICENSE` nem `COPYING`, e a API do GitHub não detecta licença [E13]. Dentro de `pol-core` há um "TERM OF USE AGREEMENT" que só permite ler o código depois de aceitar os termos, não concede de forma explícita direitos de redistribuir ou modificar, exige consentimento escrito para uso comercial e **proíbe Origin Systems e Electronic Arts de usar ou ver o repositório** [E14]. Em 2008 o código ainda era fechado e a abertura dependia do dono, Eric Swanson [E16]. Na parte de era, a expansão é atributo da conta, com valores T2A, LBR, AOS, SE e ML e T2A como padrão relatado [E17].

**Sphere (Source-X).** Reescrita, iniciada em 2016, do SphereServer 0.56d, com scripts em pacote separado e guias de migração de 0.55/0.56 [E18]. Licença Apache-2.0 [E18][E19]. O pacote Debian exige fornecer os arquivos MUL e aceitar uma cláusula (`AGREE=1` no `sphere.ini`) [E18]. Conflito menor: o GitHub classifica a linguagem como "C", o README diz C++ com recursos de C++20 [E18][E19].

**UOX3.** Diz ser "the original open source Ultima Online server emulator", ativo desde 1997, com scripts em JavaScript (SpiderMonkey) [E31]. Licença GPL v2 segundo o selo do README; o GitHub não reconhece o arquivo (NOASSERTION) [E31][E32].

**UOFiddler e Ultima SDK.** UOFiddler lê e altera "quase todo" arquivo 2D do cliente e é baseado no Ultima SDK, que está no mesmo repositório (pasta `Ultima`) [E21][E22]. A única declaração de licença é a frase do README sobre Beerware; não há arquivo de licença [E21]. Existem portes do SDK para outras linguagens, como Python (ultima-py, só leitura) e Rust (uo-rust-libs, testado com dados da era AOS, anterior ao UOP), citados em resultados de busca e não verificados [E99].

**Razor e Razor Enhanced.** Assistentes de jogo, GPL-3.0 [E24][E25]. Só citados: não são relevantes para a simulação.

**MobileUO (Unity).** É o único projeto em Unity encontrado. Não é um cliente novo: o README diz que usa "the ClassicUO client code inside of Unity" e que não distribui assets [E26]. Licença GPLv3 segundo o README, sem arquivo de licença detectado pela API [E26][E27]. Uma reportagem de 2020 o descreve como em fase inicial e voltado a shards privados [E28]. A busca por outros clientes UO em Unity, Godot, MonoGame ou Bevy não retornou resultados [E35][E36].

**xrip/uo-client.** Cliente T2A "recriado a partir da descompilação do cliente 2.0.7 da Origin", sem licença reconhecida [E34]. **Não deve ser usado nem como referência (inferência):** por declaração própria, deriva de código da Origin/EA, o que contaminaria a sala limpa do projeto.

### 1.3 O que cada licença implica para quem só usa o projeto como referência de comportamento

Leitura geral **(inferência; não é parecer):** direito autoral protege a expressão (o código), não ideias, regras de jogo ou comportamento funcional. Ler código aberto para entender o que o servidor faz e reescrever do zero, em palavras e arquitetura próprias, sem copiar trechos, não cria obra derivada no sentido usual das licenças abaixo. As obrigações dessas licenças disparam quando se **copia ou distribui** o código ou obra derivada dele.

| Licença | Projetos | Se só lermos para entender comportamento | Se copiássemos código (não é o plano) |
|---|---|---|---|
| GPL-2.0 / GPL-3.0 | ServUO, RunUO, ModernUO, UOX3 (README), Razor, Razor Enhanced, UltimaXNA, MobileUO (README) | Sem obrigação (inferência) | O jogo inteiro distribuído teria de sair sob GPL com código-fonte. Incompatível com o "Outrora" fechado (inferência) |
| AGPL-3.0 | ShardUO | Sem obrigação (inferência) | Como a GPL, e ainda alcança uso por rede (inferência) |
| BSD-2-Clause | ClassicUO | Sem obrigação | Permitido, mantendo o aviso de copyright no código e na distribuição binária [E2] |
| MIT | OrionUO | Sem obrigação | Permitido, mantendo o aviso [E29] |
| Apache-2.0 | Sphere Source-X | Sem obrigação | Permitido, mantendo avisos e o arquivo NOTICE, se houver (inferência sobre o conteúdo da Apache-2.0) |
| Beerware | UOFiddler, Ultima SDK | Sem obrigação | Permissiva na prática, mas declarada só no README (inferência) |
| Termo de uso próprio | POL | **A leitura do código é condicionada a aceitar o termo** [E14]. Quem não aceita deve apagar o que baixou [E14] | Sem concessão expressa de cópia, modificação ou redistribuição [E14] |
| Sem licença (NOASSERTION) / derivado de descompilação | xrip/uo-client | Evitar (inferência) | Evitar (inferência) |

Recomendações para a sala limpa **(inferência)**:
- Preferir como referência de comportamento os projetos permissivos (ClassicUO para o cliente) e a documentação de pacotes, e usar o código GPL só para leitura de mecanismo, nunca com o código aberto ao lado de quem escreve o "Outrora".
- Não usar o POL como fonte de código, porque o termo impõe aceitação para leitura e não concede direitos de reuso.
- Não ler nem abrir o xrip/uo-client.

---

## 2. Arquitetura do servidor emulado

A descrição usa RunUO (núcleo pequeno, base de ServUO e ModernUO) e ModernUO (evolução moderna) como referência principal, com notas sobre POL, Sphere e UOX3.

### 2.1 Laço principal e tick

**ModernUO.** Toda a lógica de jogo roda numa única "Core Thread" [E37]. A cada volta do laço, nesta ordem: lê o relógio monotônico (resolução de milissegundos) e a hora UTC; processa a fila de alterações de mobiles e depois a de itens (as mudanças acumuladas viram pacotes de atualização); avança a roda de timers; atende a rede; executa continuações enfileiradas; e, se um salvamento foi pedido, tira o instantâneo do mundo [E37]. Se não houver trabalho, dorme até o próximo tick de timer ou um limite configurado [E37]. Outras threads existem só para escrita de save, filtros de conexão e serviços de apoio; pedidos vindos delas viram sinalizadores que o laço lê [E37]. Comparações de tempo são feitas por subtração, para tolerar a volta do contador [E37].

**RunUO.** Mesmo modelo de lógica numa thread principal, com uma thread auxiliar de timers que só **decide** quais timers venceram e os coloca numa fila; quem executa as funções de cada timer é a thread principal, com teto de 20 000 execuções por fatia [E43].

**O que isso significa para o "Outrora" (inferência):** a simulação local pode ter o mesmo esqueleto, um passo de simulação determinístico por quadro ou por tick fixo, com filas de mudança que alimentam a camada de apresentação em vez de pacotes. No Unity isso cabe num sistema de "update" próprio, separado do ciclo de renderização.

### 2.2 Timers

| Aspecto | RunUO [E43] | ModernUO [E39] |
|---|---|---|
| Estrutura | Oito prioridades, cada uma com seu balde e intervalo de varredura: todo tick, 10 ms, 25 ms, 50 ms, 250 ms, 1 s, 5 s, 1 min | Roda de timers com 3 anéis de 4 096 posições e tick base de 8 ms |
| Escolha de prioridade | Automática pelo atraso ou intervalo do timer (quanto mais longo, balde mais lento), podendo ser fixada à mão | Pela distância até o vencimento: atrasos curtos no anel de baixo; longos sobem de anel e "descem" conforme se aproximam |
| Threads | Thread auxiliar varre; thread principal executa | Thread única, sem travas |
| Repetição | Contagem (1 = uma vez, 0 = infinito, n = n vezes); a próxima execução se ancora no momento da varredura, então pode derivar levemente | Timers repetidos são reinseridos com o intervalo após cada execução |
| Limites | Teto de execuções por fatia | Atraso máximo de cerca de 2^38 ms (~8,7 anos); sem teto por fatia |

**Para o "Outrora" (inferência):** a roda de timers de thread única é o modelo mais simples de reproduzir de forma determinística, e combina com salvar e restaurar o estado do jogo (timers com "tempo restante" relativo).

### 2.3 Modelo de entidades

| Conceito | Como os emuladores organizam | Fonte |
|---|---|---|
| Serial | Identificador numérico único. No ModernUO, mobiles vão de 1 até pouco antes de 0x40000000, itens de 0x40000000 a 0x7EEEEEEE, guildas em faixa própria; seriais "virtuais" não são salvos | [E40] |
| Mundo | Dois dicionários em memória, serial → mobile e serial → item; guildas à parte | [E44] |
| Mobile | Classe base para tudo que se move (jogador, NPC, criatura): posição, direção, estatísticas, skills, alvo de combate, IA | [E45][E52] |
| Item | Classe base para objetos; um item pode estar no chão, dentro de container ou equipado num mobile | [E48][E49] |
| Container | Item que contém itens. Padrão de 125 itens e 400 stones; peso e contagem são recursivos e propagados por diferença; o container lembra quem o abriu e descarta quem saiu de alcance ou de mapa | [E48] |
| Mapa (facet) | Dividido em setores de 16 x 16 tiles, criados sob demanda; cada setor guarda mobiles, itens, clientes conectados e multis | [E46] |
| Ativação de setor | Setores em volta de jogadores (raio padrão de 2 setores, bloco de 5 x 5) ficam ativos; IA de criaturas em setor inativo para | [E46][E52] |
| Consultas de alcance | Quadrado centrado com alcance padrão de 18 tiles (alcance global de atualização "usualmente 24", segundo comentário do código) | [E46] |
| Colisão | Checagem de encaixe considera altura média do terreno, estáticos e itens com marcas de superfície ou impassável; um mobile ocupa 16 unidades de altura | [E46] |
| Linha de visão | Recusada além de 25 tiles; olho na altura Z + 14; percorre uma linha 3D e bloqueia em terreno, janelas e objetos "no-shoot" | [E46] |
| Mapas definidos no RunUO | Felucca (0), Trammel (1), Ilshenar (2), Malas (3), Tokuno (4), TerMur (5), Internal (127, para itens em trânsito) | [E46] |
| Região | Área nomeada formada por retângulos com faixa de Z, prioridade e hierarquia pai/filho; regras (casas, feitiços, ações hostis, logout, música, luz, guardas, decaimento) são sobrescritas pela região e, por padrão, delegadas ao pai; carregadas de um XML de dados | [E47] |

Na era T2A só existiam Felucca e a Lost Lands (no mesmo mapa) [E89], então a simulação do "Outrora" usaria um único facet **(inferência)**. Os mapas extras dos emuladores são da linha do tempo posterior.

### 2.4 Serialização e salvamento do mundo

**RunUO** [E44]. Para mobiles e itens há três arquivos: índice, tabela de tipos e dados binários; guildas têm índice e dados. O índice guarda, por entidade, o tipo, o serial, a posição no arquivo de dados e o tamanho. A carga tem duas passadas: cria cada objeto vazio só com o serial, depois volta e pede a cada objeto que leia seus próprios dados, conferindo se consumiu exatamente o tamanho registrado. O versionamento fica dentro do método de leitura de cada classe. Erro de leitura para a carga e, no modo interativo, oferece apagar o objeto ou o tipo inteiro. Durante save e load, criações e exclusões vão para filas e são aplicadas depois.

**ModernUO** [E40]. Duas fases: (1) congelamento curto do laço, em que todas as entidades são serializadas para memória em paralelo (uma thread a menos que o número de processadores, mais a principal); (2) escrita em disco em segundo plano. O instantâneo vai para uma pasta temporária, depois para uma pasta de "próximo save", e só então substitui o save atual; o save anterior é preservado com carimbo de tempo. Saves interrompidos são concluídos no próximo boot. O índice guarda o horário do save para ajustar tempos na carga. O mundo passa pelos estados Inicial, Carregando, Rodando, Save pendente, Salvando e Escrevendo save.

**Para o "Outrora" (inferência):** num jogo local, o "save do mundo" vira o save do jogo. O padrão de "instantâneo em memória e escrita em segundo plano com troca atômica de pasta" e o versionamento por classe são diretamente aplicáveis; não há motivo para pausar o jogo além do instantâneo.

### 2.5 Skills, feitiços, combate e IA (organização, não fórmulas)

| Sistema | Organização observada | Fonte |
|---|---|---|
| Teste de skill | Toda tentativa compara o valor da skill com um mínimo e um máximo; abaixo do mínimo falha, acima do máximo acerta, no meio a chance é proporcional | [E51] |
| Ganho de skill | Acontece no servidor, na mesma chamada do teste. A chance cresce com o espaço livre até o teto total e o teto da skill, com a dificuldade e com um fator por skill; trava de skill (subir, descer, travada) decide se pode ganhar; perto do teto total, uma skill marcada para descer cede ponto | [E51] |
| Ganho de atributo | Após um ganho de skill, pode haver tentativa de ganho em força, destreza ou inteligência, com atrofia de outro atributo perto do teto e intervalo mínimo por atributo | [E51] |
| Antimacro | Opcional: agrupa locais em células e limita quantas vezes cada célula ou alvo rende ganho num período | [E51] |
| Feitiço | Máquina de estados de três estados: ocioso, conjurando (o atraso pode ser interrompido por dano ou movimento) e sequenciando (cursor de alvo aberto); na resolução, checa morte, estado, reagentes e mana, faz o teste de "fizzle" pela skill de conjuração e só então consome recursos | [E53] |
| Recuperação após feitiço | Valor fixo antes da AOS e regra diferente a partir da AOS; feitiços de primeiro círculo pré-AOS ignoram interrupção por dano | [E53] |
| Combate corpo a corpo | Timer de combate verifica alvo válido, vivo, no mesmo mapa e visível; fora do alcance da arma, espera; dentro e com linha de visão, executa o golpe e agenda o próximo pelo tempo de golpe da arma | [E45] |
| Golpe | Velocidade do golpe depende da arma e do vigor (stamina) do atacante; a chance de acerto compara a skill de arma de atacante e defensor; o dano sorteia na faixa da arma e aplica modificadores por skills e força; a armadura absorve conforme a parte do corpo sorteada. Há ramos separados "pré-AOS" e "AOS" | [E54] |
| IA | Classe base com estados (vagar, combate, guarda, fuga, interação, recuo), timer com intervalo igual à velocidade atual da criatura, aquisição de alvo por alcance e modo de luta, movimento com desvio de obstáculos e caminho; tipos de IA (melee, animal, arqueiro, curador, vendedor, mago, berserker, predador, ladrão) especializam o comportamento; o timer só roda com o setor ativo | [E52] |

Observação de era: os emuladores trazem regras pré-AOS e AOS no mesmo código, chaveadas pela expansão [E41][E53][E54]. **As constantes desses ramos são reconstruções da comunidade, não especificações da OSI (inferência);** os valores da era T2A devem ser fixados a partir de fontes de época (seção 5) e documentados em palavras próprias.

### 2.6 Scripts versus núcleo

| Projeto | Núcleo | Conteúdo (scripts) | Fonte |
|---|---|---|---|
| RunUO / ServUO | Executável do servidor (rede, mundo, timers, mapa, classes base) | Pasta de scripts em C# (e VB.NET opcional) compilada **na inicialização**, com cache por hash; métodos estáticos de configuração e inicialização são achados por reflexão e chamados por prioridade; buscas de tipo olham primeiro os scripts | [E50] |
| ModernUO | Projeto `Server` | Projeto `UOContent` compilado como projeto comum, mais projetos de teste para cada lado | [E38] |
| POL | Núcleo em C++ | eScript e arquivos de configuração | [E12] |
| Sphere | Núcleo em C++ | Arquivos de script do ScriptPack, com sintaxe própria | [E18] |
| UOX3 | Núcleo em C++ | JavaScript via SpiderMonkey | [E31] |

**Para o "Outrora" (inferência):** a mesma separação serve: um núcleo de simulação (entidades, tempo, mapa, regiões, persistência) e uma camada de conteúdo de dados (definições de criaturas, itens, feitiços, falas de NPC) que não depende do Unity.

### 2.7 Seleção de era

- **ModernUO:** a expansão ativa fica num arquivo de configuração de expansão; as regras consultam "expansão atual maior ou igual a X" [E37][E41]. Cada expansão carrega bandeiras de cliente, seleção de mapas, recursos da lista de personagens, recursos de casa e versão do status [E41].
- **POL:** expansão por conta, com T2A como padrão relatado em 2008 [E17].
- **ServUO:** fórum menciona um seletor de expansão, sem detalhar [E79][E98].

---

## 3. Arquitetura do cliente ClassicUO

### 3.1 Módulos

O código está em `src/`, dividido em `ClassicUO.Assets` (leitores de arquivo), `ClassicUO.Client` (jogo, cenas, rede, interface), `ClassicUO.IO`, `ClassicUO.Renderer`, `ClassicUO.Utility` e `ClassicUO.Bootstrap` [E55]. O cliente tem cenas de login e de jogo, um módulo de mapa (`Map`, `Chunk`, `ChunkMesh`), objetos de jogo, gerenciadores, interface (gumps) e um caminho-localizador (`Pathfinder`) [E55][E57][E60].

### 3.2 Carregamento de arquivos

- O gerenciador de arquivos recebe a versão do cliente e o caminho-base da instalação e cria um leitor por tipo de arquivo [E56].
- A carga é **sequencial**, em ordem fixa: animações, dados de animação, arte, mapas, textos localizados (cliloc), gumps, fontes, matizes (hues), dados de tiles, multis, skills, profissões, texturas, falas, luzes, sons, mapas de multis, arte de tiles, dicionário de textos e, por último, patches de verdata [E56]. Os leitores existentes: animações, arte, cliloc, fontes, gumps, matizes, luzes, mapa, multis, profissões, skills, sons, falas, texturas, tiledata, verdata [E55].
- **MUL ou UOP:** a instalação é tratada como UOP só se a versão for 7.0.0.0 ou maior **e** existir o arquivo `MainMisc.uop` no diretório [E56].
- **Versão do cliente muda o formato:** verdata é forçado em clientes anteriores a 5.0.0a; as marcas de tile são de 32 bits antes de 7.0.9.0 e de 64 bits depois [E56].
- **Resolução de caminho:** primeiro um mapa de substituições por nome de arquivo, depois o caminho-base; fora do Windows, tenta casar o nome sem diferenciar maiúsculas [E56].

**Para o "Outrora" (inferência):** a instalação que o usuário tiver hoje, baixada do uo.com, será moderna (UOP, marcas de 64 bits), não a do cliente T2A de 1998. A camada de leitura precisa tratar UOP e MUL e decidir, por dados, quais conteúdos pertencem ao recorte T2A. O acesso gratuito via Endless Journey existe desde 2018 [E92], o que torna plausível exigir que o usuário tenha a instalação oficial **(inferência)**.

### 3.3 Mundo por chunks

- Cada chunk cobre **8 x 8 tiles** [E57].
- Ao carregar, lê o bloco de terreno (64 células com altura) e depois os estáticos do mesmo bloco, descartando gráficos vazios ou fora da grade [E57].
- Cada tile guarda uma **lista ligada de objetos** ordenada por uma prioridade calculada de Z e tipo: terreno embaixo; mobiles e cadáveres levemente elevados; itens ajustados pelas marcas de tiledata (fundos abaixo, objetos com altura acima); efeitos ainda acima; multis com ajustes próprios. Empates mantêm o terreno primeiro [E57].
- Inserir ou remover objeto marca a malha do chunk para reconstrução [E57].
- Chunks têm tempo de expiração e voltam a um pool para reuso; o jogador nunca é destruído junto [E57].

### 3.4 Ordem de desenho e projeção isométrica

- **Projeção:** cada tile é um losango de 44 x 44 px; a posição na tela anda 22 px por unidade de X e Y (horizontal proporcional a X − Y, vertical a X + Y), e **cada unidade de Z sobe 4 px** [E58]. Terreno "esticado" usa as alturas mínima e média para deformar o losango [E58].
- **Ordem:** dentro de cada tile, os objetos são desenhados do mais baixo ao mais alto da lista ligada; a ordem entre tiles segue as diagonais (X + Y crescente), para que tiles mais próximos cubram os mais distantes. O trecho do laço externo não estava no arquivo lido; esta ordem é **(inferência)** coerente com a projeção [E58].
- **Telhados e objetos acima do jogador:** a cada movimento, calcula-se uma altura máxima de desenho a partir de tetos e telhados sobre o tile do jogador e o tile diagonal à frente; acima dela, objetos somem com fade, e há opção de esconder telhados [E58].
- **Transparência:** alfa varia em passos até o alvo; árvores que encobrem o jogador ficam translúcidas; há um "círculo de transparência" opcional em volta do jogador, com queda gradual [E58].
- **Seleção por mouse:** compara um valor de profundidade calculado e escolhe o objeto mais "fundo" sob o cursor [E58].

### 3.5 Câmera

A janela visível sai dos limites da câmera e do zoom, convertida em faixa de tiles (cerca de um tile a cada 44 px, mais margem), com bordas estendidas para não cortar objetos parcialmente visíveis [E58]. A câmera é centrada no jogador **(inferência a partir do centro usado no cálculo)**.

### 3.6 Gumps (interface)

- O cliente tem 65 arquivos de gump: base, container, paperdoll, status, skills, barra de vida, buffs, diário, livro de feitiços, livro de combate, chat, grupo, troca, loja, menus, mapas, opções etc. [E60].
- Gumps **do servidor** chegam por pacote com serial, tipo, posição, uma cadeia de comandos de layout e uma lista de textos [E76]; versão comprimida em outro pacote [E62]. A resposta do jogador volta com serial, tipo, botão, chaves e textos digitados [E63].
- No servidor, a resposta só é aceita se casar com um gump aberto de mesmo serial e tipo; botão inexistente, contagens fora do limite ou texto acima de 239 caracteres derrubam a conexão [E49].

**Para o "Outrora" (inferência):** os gumps viram interface local do Unity. O valor dessa arquitetura está no modelo "layout declarativo + resposta com botão e campos", útil para menus de NPC, vendedores e livros, e na separação entre gumps puramente do cliente (paperdoll, opções) e gumps abertos pela lógica (diálogos de conteúdo).

### 3.7 Configuração do caminho da instalação

O `settings.json`, salvo junto do executável (ou num caminho customizado), guarda: `ultimaonlinedirectory` (pasta do UO), `clientversion`, `ip`, `port`, `ignore_relay_ip`, `encryption`, `plugins`, `profilespath` e `files_override` [E59]. O caminho-base é passado pronto ao gerenciador de arquivos, que não procura nem valida a instalação por conta própria [E56]. A wiki tem páginas de instalação e argumentos de linha de comando, não lidas em detalhe [E64].

---

## 4. Protocolo de rede

Objetivo desta seção: entender **quem decide o quê**. Não há campos byte a byte.

### 4.1 Fluxo de login

| Passo | Quem envia | O que acontece | Fonte |
|---|---|---|---|
| 1 | Cliente | Conecta ao servidor de login, inicializa a criptografia de login com o IP local como semente e envia a semente (formato novo a partir do cliente 6.0.4.0, com pacote próprio; antes, 4 bytes crus) | [E61][E63] |
| 2 | Cliente | Primeiro login com conta e senha | [E61][E63] |
| 3 | Servidor | Lista de shards (ou rejeição de login) | [E61][E62] |
| 4 | Cliente | Escolhe o shard | [E61][E63] |
| 5 | Servidor | "Relay": IP, porta e uma chave nova para o servidor de jogo | [E61][E70] |
| 6 | Cliente | Desconecta do login, conecta ao servidor de jogo (ou ao endereço original, se configurado para ignorar o relay), reinicia a criptografia com a nova chave, **liga a compressão**, envia a chave e faz o segundo login com conta, senha e chave | [E59][E61][E71] |
| 7 | Servidor | Lista de personagens e cidades iniciais, com bandeiras de recursos do cliente | [E61][E62] |
| 8 | Cliente | Seleciona, cria ou apaga personagem | [E61][E63] |
| 9 | Servidor | Confirmação de entrada no mundo (serial, corpo, posição, direção e tamanho do mapa; deve ser enviada uma vez) e depois "login completo" | [E62][E72] |

Os emuladores costumam fixar o valor da chave do relay, e ela foi usada para indicar o tipo de cliente [E70] (fórum citado em resultado de busca, não lido por inteiro). A ordem de bytes do IP na lista de shards variou entre versões do cliente, segundo o mesmo tipo de fonte (resultado de busca) [E100].

**Para o "Outrora" (inferência):** todo este fluxo desaparece. O equivalente local é "carregar save ou criar personagem" e entrar no mundo. Criação de personagem (atributos, skills iniciais, cidade inicial) continua sendo regra de jogo e vira lógica local.

### 4.2 Pacotes por função e onde fica a autoridade

Direção: C→S (cliente para servidor), S→C (servidor para cliente). Os IDs vêm dos registros de handlers do ClassicUO [E62][E63] e da documentação do POL [E67]–[E77].

| Grupo | C→S (pedido) | S→C (resultado) | Autoridade do servidor | Vira na simulação local (inferência) |
|---|---|---|---|---|
| Movimento | 0x02 pedido de passo (direção, bit de corrida, número de sequência, chave de fast-walk) [E67] | 0x22 confirma passo e devolve a notoriedade [E69][E62]; 0x21 recusa com posição, direção e Z corretos [E68][E62]; 0x97 move o jogador; 0x20 atualiza o jogador; 0x77 move outro mobile; 0x78/0xD3 desenham um mobile [E62] | Validação de terreno, altura, bloqueio por mobiles e itens, regras de região, congelamento e paralisia, ritmo de passos [E45][E49] | Módulo de movimento autoritativo local; a apresentação só anima o que a simulação aceitou |
| Atualização de itens e mundo | 0x09 clique simples (nome) [E63] | 0x1A/0xF3 item no mundo; 0x1D remove objeto; 0x23 animação de arrasto [E62] | O que existe, onde e com que aparência | Fila de mudanças do mundo → camada de apresentação |
| Status | 0x34 pedido de status [E63] | 0x11 status completo; 0x2D atributos; 0xA1/0xA2/0xA3 vida, mana e vigor; 0x3A skills; 0x16/0x17 barras de vida [E62] | Valores de atributos, skills e travas | Modelo de personagem local |
| Fala | 0x03 fala ASCII; 0xAD fala Unicode [E63] | 0x1C/0xAE fala; 0xC1/0xCC mensagem de texto localizado (cliloc) [E62] | Quem ouve, comandos de NPC por palavra-chave, mensagens do sistema | Sistema de diálogo de NPC e diário local; textos do cliloc lidos da instalação |
| Ataque e combate | 0x05 pedido de ataque; 0x72 modo de guerra [E63] | 0xAA define o alvo de combate; 0x2F animação de golpe; 0x72 confirma modo de guerra; 0x0B número de dano [E62] | Ritmo de golpe, alcance, linha de visão, acerto, dano, absorção, ganho de skill [E45][E54] | Módulo de combate local (fórmulas da era T2A de fontes de época) |
| Equipar | 0x13 pedido de equipar [E63] | 0x2E item equipado; 0x89 equipamento de cadáver [E62] | Acesso, camada (layer) livre, item realmente na mão; se falhar, devolve o item [E49] | Inventário e paperdoll locais |
| Abrir container / usar | 0x06 duplo clique (usar, abrir) [E63] | 0x24 abre a janela do container; 0x3C conteúdo; 0x25 item adicionado ao container [E62] | Distância (2 tiles para abrir), acesso, intervalo mínimo entre usos [E48][E49] | Interação local com objetos |
| Mover item | 0x07 pegar (serial, quantidade); 0x08 soltar (destino: chão, item ou mobile) [E63] | Atualizações de item/container; devolução em caso de recusa [E49][E62] | Distância, acesso, limites de 125 itens e 400 stones, empilhamento, posição aleatória dentro do container [E48][E49] | Regras de inventário locais |
| Menus e gumps | 0xB1 resposta de gump; 0x7D resposta de menu [E63] | 0xB0 gump; 0xDD gump comprimido; 0x7C menu; 0xBF subcomandos variados (fechar gump, menus de contexto, mapa, estatísticas estendidas) [E62][E73][E76] | Conferência de gump aberto, botões e limites [E49] | Interface local; respostas tratadas como eventos da simulação |
| Alvo (target) | 0x6C resposta de alvo (objeto ou ponto no chão, com o gráfico clicado) [E63][E77] | 0x6C abre o cursor (neutro, hostil, benéfico) ou cancela; 0x99 posicionamento de multi [E62][E77] | Conferência do ID do cursor; o gráfico informado pelo cliente "should never be trusted" e o servidor checa se o estático existe naquele ponto [E49][E77] | Seleção de alvo local, validada pela simulação |
| Skills e feitiços | 0x12 usar skill; 0xBF ou 0x12 conjurar feitiço, conforme a versão do cliente [E63] | Efeitos, mensagens, atualizações de status [E62] | Teste de skill, ganho, máquina de estados do feitiço, reagentes e mana [E51][E53] | Módulos de skill e magia locais |
| Efeitos e sons | — | 0x70/0xC0/0xC7 efeitos gráficos; 0x54 som; 0x6D música [E62] | Quando e onde tocar (a região pode definir a música) [E47] | Eventos de apresentação emitidos pela simulação |
| Luz, clima e tempo | — | 0x4E luz pessoal; 0x4F luz global de 0x00 (dia) a 0x1F (preto), com 0x09 como "noite OSI"; 0x65 clima (chuva, tempestade, neve; até 70 efeitos; termina sozinho após alguns minutos); 0x5B hora; 0xBC estação [E62][E74][E75] | Ciclo dia/noite, clima por região | Relógio do mundo e clima locais |
| Morte | — | 0x2C tela de morte; 0xAF animação de morte [E62] | Morte, cadáver, ressurreição | Regras locais de morte |
| Conexão | 0x73 ping; 0xBD versão do cliente [E63] | 0xB9 libera recursos da expansão [E62] | Bandeiras de recursos por expansão [E41] | Desnecessário (inferência) |

### 4.3 Movimento, sequência e fast-walk em detalhe

- **Sequência:** cada pedido de passo leva um número de 0 a 255; começa em 0 após um reset e, depois de 255, volta para **1**, não para 0 [E67]. No RunUO, se o contador guardado estiver em 0 e o pedido vier com número diferente de 0, o passo é recusado; a cada passo aceito o contador sobe e volta a 1 depois de 255; numa recusa o servidor envia a rejeição, zera o contador e limpa a pilha de fast-walk [E49].
- **Cliente:** numa recusa, o "walker" do ClassicUO desfaz o passo pendente e assume posição, direção e Z do servidor; numa confirmação, marca o passo como aceito e guarda a notoriedade [E62]. Ou seja, o cliente anda de forma **otimista** e o servidor corrige **(inferência a partir do comportamento descrito)**.
- **Velocidade de passo (RunUO):** 400 ms a pé andando, 200 ms a pé correndo, 200 ms montado andando, 100 ms montado correndo [E45].
- **Prevenção de fast-walk, lado do servidor (RunUO):** uma fila de passos recentes com horário previsto de término encadeado ao passo anterior; com 4 ou mais passos "ativos" ao mesmo tempo, dispara um evento de fast-walk que pode bloquear o passo; staff a partir de Counselor fica isento [E45].
- **Prevenção de fast-walk, lado do protocolo:** o servidor inicializa e alimenta uma pilha de chaves no cliente (subcomandos 1 e 2 do 0xBF); cada pedido de passo consome uma chave; pilha vazia indica fast-walk. A documentação recomenda empilhar uma chave a cada confirmação ou recusa e checar só a pilha vazia [E67][E73]. O RunUO lê a chave mas não a usa [E49].
- **Para o "Outrora" (inferência):** chaves e sequência somem. Fica a **regra de ritmo**: a simulação aceita um passo só depois do intervalo da velocidade atual, e a apresentação interpola a animação dentro desse intervalo. Como não há rede, não há correção visível; mas manter a separação "pedido → validação → movimento aceito" evita que a camada de apresentação vire autoridade.

### 4.4 Responsabilidades do servidor que viram módulos da simulação local

Resumo **(inferência sobre a organização; cada item tem a fonte do comportamento)**:

| Módulo local | Responsabilidade herdada do servidor |
|---|---|
| Tempo e agendamento | Laço principal, timers, fila de mudanças [E37][E39][E43] |
| Mundo e mapa | Entidades por serial, setores, ativação por proximidade, regiões, colisão, linha de visão [E40][E44][E46][E47] |
| Movimento | Validação de passo, ritmo por velocidade, empurrão e bloqueio [E45][E49] |
| Itens e inventário | Pegar, soltar, equipar, containers, peso, empilhamento [E48][E49] |
| Combate | Alvo, ritmo de golpe, acerto, dano, absorção, notoriedade [E45][E54][E69] |
| Skills e atributos | Testes, ganho, travas, teto total, atrofia [E51] |
| Magia | Máquina de estados do feitiço, reagentes, mana, interrupção, recuperação [E53] |
| IA | Estados, aquisição de alvo, movimento, tipos de criatura [E52] |
| Ambiente | Luz, clima, hora, música por região [E47][E74][E75] |
| Persistência | Instantâneo e gravação do mundo, versionamento [E40][E44] |
| Conteúdo de diálogo | Gumps e menus abertos pela lógica, respostas validadas [E49][E76] |

O que **não** tem equivalente local **(inferência)**: semente e criptografia, compressão, relay de login, lista de shards, ping, chaves de fast-walk, seleção de expansão pelo cliente e checagens antitrapaça contra cliente adulterado.

---

## 5. Panorama de fontes para a era T2A

| Fonte | Tipo | Era coberta | Atualidade | Confiabilidade para T2A | Observação |
|---|---|---|---|---|---|
| UOGuide (uoguide.com) | Wiki comunitária | Mistura de atual e histórico; artigo da T2A existe (lançamento em 1998-10-24, Lost Lands, chat ampliado, "Big Window", tradução, tutorial) [E89] | Página principal modificada em 2026-09-27, notícias até 2026-10-23 [E88] | Média: bom para cronologia e nomes; as mecânicas tendem a descrever o jogo atual (inferência) | Licença do conteúdo não declarada na página lida [E88] |
| Wiki oficial do uo.com (Playguide) | Documentação oficial | Jogo atual; seções de arquivo e notas de publish [E90] | Copyright 2026 [E90] | Baixa para mecânicas T2A; útil para histórico de publishes (inferência) | Também é a fonte oficial sobre clientes de terceiros [E80] |
| UO Stratics (uo.stratics.com) | Site de referência histórico | Historicamente cobriu a época (inferência) | Respondeu HTTP 403 nesta pesquisa [E91] | Potencialmente alta nas versões arquivadas da época (inferência) | A Wayback Machine não pôde ser acessada pela ferramenta de leitura; **lacuna** |
| Documentação de pacotes do POL (docs.polserver.com/packets) | Documentação de protocolo | Clientes clássicos, incluindo os antigos | Versão para download datada de 2021-10-20 [E97] | Alta para estrutura de pacotes; notas às vezes vagas sobre semântica [E67]–[E77] | Mantida pela equipe do POL |
| Guias de pacotes históricos (Jerrith, Kairtech, RUOSI) | Documentação de protocolo | Clientes de época | Vários links mortos segundo fórum de 2007 [E78] | Alta se recuperados por arquivo (inferência) | kair.us respondeu com certificado de outro domínio; não foi possível confirmar o conteúdo |
| Código dos emuladores (RunUO, ServUO, ModernUO) | Código | Linha do tempo completa, com ramos pré-AOS | Ativo [E3]–[E11] | Média: comportamento reconstruído, não especificação da OSI (inferência) | Ler só para entender; ver seção 1.3 |
| Fórum ServUO (servuo.dev) | Fórum | Variada | Ativo; tópico de 2024 lido [E79] | Média | `docs.servuo.dev` não resolve (DNS) nesta data; **lacuna** |
| Fórum POL (forums.polserver.com) | Fórum | Variada | Tópicos de 2008 a 2011 lidos [E16][E17] | Média para história do POL | — |
| Wiki do Sphere (wiki.spherecommunity.net) | Wiki | Scripts do Sphere | A conexão caiu duas vezes nesta pesquisa; **lacuna** | — | Citado em resultados de busca |
| Site e FAQ do ClassicUO (classicuo.org) | Documentação | Cliente | Ativo [E65][E66] | Alta para o cliente | Discord público linkado na página; não acessado (pode exigir login) [E65] |
| Wiki do ClassicUO no GitHub | Documentação | Cliente | Ativo [E64] | Alta para instalação e opções | Páginas de instalação não lidas em detalhe |
| Ultima Codex (ultimacodex.com e wiki) | Notícias e wiki de fãs | História e notícias | Ativo em 2026 [E87][E93] | Média | Bom para cronologia e notícias legais |

Leitura cruzada **(inferência)**: para regras da T2A, a cadeia recomendada é (1) páginas de época arquivadas (Stratics e guias oficiais de 1998–1999), (2) UOGuide para conferência de nomes e datas, (3) código de emulador só para entender lacunas de mecanismo. Onde as três divergirem, registrar os lados no documento de especificação do "Outrora".

---

## 6. Aspectos legais públicos

**Não é parecer jurídico.** Registro do que as fontes dizem.

### 6.1 Como os projetos lidam com os direitos da EA

| Projeto | Postura declarada | Fonte |
|---|---|---|
| ClassicUO | Não distribui assets; é preciso obter o cliente original; cliente customizado em servidores oficiais é proibido | [E1] |
| ClassicUO (web) | A versão web foi **sancionada** para servidores oficiais; a versão desktop não, porque pode ser modificada para contornar restrições; "No other third party clients are sanctioned" | [E66][E80] |
| MobileUO | Não distribui assets; o usuário fornece o cliente; rodapé com "Ultima Online(R) © 2020 Electronic Arts Inc." | [E26] |
| Sphere | O usuário fornece os arquivos MUL e precisa aceitar uma cláusula no arquivo de configuração | [E18] |
| POL | Termo de uso barra Origin e EA de usar ou ver o repositório | [E14] |
| ServUO, ModernUO | O servidor aponta para a pasta de dados do cliente do usuário; nenhuma declaração sobre a EA nos READMEs | [E5][E7][E79] |
| UOX3 | Fala em clientes com criptografia removida pelo ClassicUO, Razor ou similares | [E31] |

### 6.2 Termos de serviço do UO

O texto oficial atual não foi lido (a página de ajuda da EA não apareceu nas buscas). Cópias em fórum, de 2011, citando a página de suporte da EA, trazem cláusulas que dizem que o jogador concorda em jogar "only on the Service", em não criar "any other means through which Ultima Online may be played", e em não fazer engenharia reversa, descompilar ou desmontar o software [E86]. Resultados de busca reproduzem ainda uma cláusula sobre não criar ou usar programas, emuladores ou ferramentas "derived from or created for Ultima Online" sem autorização escrita da EA [E86]. **Ressalva:** são cópias de terceiros e podem estar desatualizadas.

### 6.3 Marcas

- "ULTIMA ONLINE" tem registro de marca nos EUA (classe 41, jogos on-line) com status de registrado e renovado; a página do agregador lista a Electronic Arts como titular em sua página de titular, mas a página do registro em si respondeu 403 [E96].
- Em junho de 2026, a EA fez novos depósitos da marca "Ultima" nas classes 9 (jogos baixáveis) e 41 (jogos on-line), além do registro antigo da classe 28, de 1985 [E93]. O autor da reportagem considera os depósitos provável "arrumação de portfólio"; a leitura de que sinalizariam um novo jogo é especulação [E93].
- Não foi encontrado registro específico de "Britannia" nesta pesquisa; **lacuna**. Por cautela, tratar "Britannia", "Ultima", "Ultima Online" e nomes de lugares e personagens como marcas ou elementos protegidos da EA **(inferência)**.

### 6.4 Episódios públicos de ação da EA

| Ano | Episódio | O que as fontes dizem | Fonte |
|---|---|---|---|
| 2011 | Ultima IV | Duas distribuições do Ultima IV (emulação de Master System no navegador e porte para PC) receberam "cease and desist letters from Electronic Arts"; a permissão de 1997 da Origin para distribuição livre já não valeria | [E83] |
| 2017 | FreeSO e The Sims 1 em celular | O motor substituto não incluía conteúdo protegido (o usuário fornecia os arquivos); mesmo assim, a EA pediu primeiro ajustes de marca (logo, avisos, fim das doações) e depois o fim de qualquer esforço de levar The Sims 1 ou FreeSO a celular ou outras plataformas; o desenvolvedor acatou; o FreeSO para PC pôde continuar | [E84] |
| 2024 | Ferramentas de terceiros no UO oficial | A Broadsword anunciou repressão a programas de terceiros que facilitam trapaça e, em seguida, parceria com os desenvolvedores do ClassicUO para uma versão oficialmente sancionada | [E81][E82] |
| — | Emuladores e shards de UO | Nenhuma ação judicial pública encontrada. Comentários de fórum de 2011 dizem que a EA não processava operadores de shards gratuitos; uma reportagem do MassivelyOP diz que centenas de emuladores de UO seguem "relatively unchecked" há quase duas décadas | [E85][E86] |

O caso FreeSO é o mais próximo do modelo do "Outrora": motor próprio que lê os arquivos que o usuário já tem. Mesmo sem distribuir assets, houve pedido da EA, com foco em marca, monetização e expansão de plataforma [E84].

### 6.5 Direitos autorais do Ultima e a notificação de Garriott

- Richard Garriott notificou a EA de que pretende recuperar direitos autorais do Ultima pela seção 203 da lei de direitos autorais dos EUA (rescisão após 35 anos); como a transferência foi em 1992, a janela abre em 2027 [E95]. A reportagem da TechSpot de 2026-06-21 descreve a mesma janela sem citar a seção [E94].
- O escopo está em negociação: depende dos contratos de cada título, e obras feitas sob encomenda ("work made for hire") ficam de fora [E95]. Nenhuma das fontes diz se o Ultima Online, lançado sob a EA, está incluído [E94][E95].
- A marca continua com a EA; Garriott poderia criar a partir da obra original, mas não usar o nome Ultima [E94][E95].

### 6.6 Riscos apontados pelas fontes, aplicados ao "Outrora"

Registro, não parecer. Cada linha liga o risco à fonte; a aplicação ao projeto é **(inferência)**.

1. **Termos do UO contra emuladores e ferramentas derivadas** [E86]. Um jogo que lê os arquivos do cliente para oferecer outra forma de jogar se aproxima do que essas cláusulas descrevem. O risco recai mais sobre o contrato do usuário com a EA do que sobre o desenvolvedor, mas não se sabe como a EA trataria isso.
2. **Precedente FreeSO** [E84]. A EA agiu contra um motor substituto que não distribuía assets, começando por marca e doações. Para o "Outrora": nome próprio, nenhuma marca da EA no produto ou na divulgação, nenhuma monetização associada à IP, e cautela com versões para outras plataformas.
3. **Marcas** [E93][E96]. Usar "Ultima", "Ultima Online" ou "Britannia" como nome ou chamariz é o ponto mais sensível. Citar compatibilidade de forma descritiva é outra questão, que pede orientação jurídica.
4. **Distribuição de assets** [E1][E26]. Toda a comunidade aberta se apoia em "não distribuímos assets". O "Outrora" segue esse padrão ao ler em tempo de execução, sem cache redistribuível nem conversões publicadas.
5. **Código derivado de descompilação** [E34]. Projetos que se dizem recriados de descompilação são risco de contaminação; ficam fora da sala limpa.
6. **Licenças copyleft** (seção 1.3). Copiar código GPL ou AGPL obrigaria a abrir o jogo; o POL nem concede direito de reuso [E14].
7. **Incerteza de titularidade em 2027** [E94][E95]. Se parte dos direitos do Ultima mudar de mãos, o quadro de quem pode reclamar o quê pode mudar. Não há conclusão nas fontes.

---

## 7. Lacunas e incertezas

| Lacuna | Impacto | Como fechar (sugestão) |
|---|---|---|
| Wayback Machine inacessível à ferramenta; Stratics atual em 403 [E91] | Alto: são as melhores fontes de mecânica da era T2A | Acesso manual pelo responsável a snapshots de 1998–2000, com registro de URL e data |
| Texto oficial atual dos termos do UO e do EULA do cliente não lido [E86] | Alto para a parte legal | Ler a página de ajuda da EA e o EULA que acompanha o instalador atual |
| Registro de "Britannia" e titular exato de "ULTIMA ONLINE" não confirmados na fonte primária [E96] | Médio | Consulta ao TSDR do USPTO |
| Licença do POL: só o termo de uso, sem licença aberta [E13][E14] | Baixo, se o POL não for lido | Não usar o POL como referência de código |
| Conflitos de licença declarada: ClassicUO (BSD-2 vs "BSD 4"), UOX3 (GPL v2 vs NOASSERTION), MobileUO (GPLv3 no README, sem arquivo) [E1][E2][E26][E27][E31][E32] | Baixo para uso só como referência | Se algum dia houver reuso, consultar os mantenedores |
| Ordem exata do laço externo de desenho do ClassicUO não lida [E58] | Baixo | A ordem por diagonais é dedução coerente com a projeção |
| Wiki do Sphere e `docs.servuo.dev` indisponíveis | Baixo | Repetir em outra data |
| Fórum e Discord do ClassicUO não acessados (podem exigir login) | Baixo | Não necessário para este escopo |
| Diferença entre os arquivos da instalação atual (UOP, mapas pós-T2A) e o conteúdo da era T2A | Alto para o produto (inferência) | Pesquisa própria de mapeamento "dados atuais → recorte T2A" |
| Inclusão ou não do Ultima Online na rescisão de 2027 [E94][E95] | Médio, de longo prazo | Acompanhar notícias em 2027 |

Níveis de confiança: **alto** para licenças, estado e datas (lidos direto da API e dos arquivos dos repositórios); **alto** para arquitetura de RunUO, ModernUO e ClassicUO (lidos do código, descritos em prosa); **médio** para semântica de alguns pacotes (documentação com notas vagas); **médio-baixo** para o quadro legal (cópias de fórum, reportagens, ausência de texto oficial atual).

---

## 8. Próximos passos sugeridos

- **@architect:** usar as seções 2, 3 e 4.4 como ponto de partida para a divisão "núcleo de simulação" × "apresentação Unity" × "leitores de arquivo", mantendo a simulação independente do Unity e de thread única com roda de timers.
- **@pm:** registrar como requisito não funcional a sala limpa (nenhum código de emulador ou cliente copiado; GPL só para leitura de mecanismo; POL e xrip/uo-client fora) e as restrições de marca e distribuição da seção 6.6.
- **@analyst (próxima rodada):** fechar a lacuna de fontes da era T2A via snapshots arquivados acessados pelo responsável, e ler o texto oficial atual dos termos e do EULA do UO.
- **Responsável:** decidir se busca orientação jurídica sobre os pontos 1 a 3 da seção 6.6 antes de qualquer divulgação pública do "Outrora".

---

## 9. Referências

Data de acesso de todas: 2026-10-27. "Licença" preenchida para código aberto.

| ID | Título | URL | Tipo | Licença |
|---|---|---|---|---|
| E1 | ClassicUO — repositório (README) | https://github.com/ClassicUO/ClassicUO | Código | BSD-2-Clause (README diz "BSD 4") |
| E2 | ClassicUO — LICENSE.md | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/LICENSE.md | Código (licença) | BSD-2-Clause |
| E3 | ClassicUO — metadados da API do GitHub | https://api.github.com/repos/ClassicUO/ClassicUO | Código (metadados) | BSD-2-Clause |
| E4 | ClassicUO — lançamentos | https://api.github.com/repos/ClassicUO/ClassicUO/releases?per_page=3 | Código (metadados) | BSD-2-Clause |
| E5 | ServUO — repositório | https://github.com/ServUO/ServUO | Código | GPL-2.0 |
| E6 | ServUO — metadados da API | https://api.github.com/repos/ServUO/ServUO | Código (metadados) | GPL-2.0 |
| E7 | ModernUO — repositório | https://github.com/modernuo/ModernUO | Código | GPL-3.0 |
| E8 | ModernUO — metadados da API | https://api.github.com/repos/modernuo/ModernUO | Código (metadados) | GPL-3.0 |
| E9 | ModernUO — lançamentos | https://api.github.com/repos/modernuo/ModernUO/releases?per_page=3 | Código (metadados) | GPL-3.0 |
| E10 | RunUO — repositório | https://github.com/runuo/runuo | Código | GPL-2.0 |
| E11 | RunUO — metadados da API | https://api.github.com/repos/runuo/runuo | Código (metadados) | GPL-2.0 |
| E12 | POL — repositório | https://github.com/polserver/polserver | Código | Termo de uso próprio (sem licença aberta) |
| E13 | POL — metadados e listagem da raiz e de pol-core | https://api.github.com/repos/polserver/polserver/contents/pol-core | Código (metadados) | Termo de uso próprio |
| E14 | POL — TERM OF USE AGREEMENT | https://raw.githubusercontent.com/polserver/polserver/master/pol-core/TERM%20OF%20USE%20AGREEMENT | Código (termo) | Termo de uso próprio |
| E15 | POL — lançamentos | https://api.github.com/repos/polserver/polserver/releases?per_page=3 | Código (metadados) | Termo de uso próprio |
| E16 | Fórum POL — "POL open source" (2008) | https://forums.polserver.com/viewtopic.php?p=10412 | Fórum | — |
| E17 | Fórum POL — expansão por conta (2008) | https://forums.polserver.com/viewtopic.php?p=12546 | Fórum | — |
| E18 | Sphere Source-X — repositório | https://github.com/Sphereserver/Source-X | Código | Apache-2.0 |
| E19 | Sphere Source-X — metadados da API | https://api.github.com/repos/Sphereserver/Source-X | Código (metadados) | Apache-2.0 |
| E20 | Sphere Source-X — lançamentos | https://api.github.com/repos/Sphereserver/Source-X/releases?per_page=3 | Código (metadados) | Apache-2.0 |
| E21 | UOFiddler — repositório (README) | https://github.com/polserver/UOFiddler | Código | Beerware (declarada no README) |
| E22 | UOFiddler — metadados e listagem | https://api.github.com/repos/polserver/UOFiddler/contents/ | Código (metadados) | Beerware |
| E23 | UOFiddler — lançamentos | https://api.github.com/repos/polserver/UOFiddler/releases?per_page=2 | Código (metadados) | Beerware |
| E24 | Razor — metadados da API | https://api.github.com/repos/markdwags/Razor | Código (metadados) | GPL-3.0 |
| E25 | Razor Enhanced — metadados da API | https://api.github.com/repos/RazorEnhanced/RazorEnhanced | Código (metadados) | GPL-3.0 |
| E26 | MobileUO — repositório (README) | https://github.com/VoxelBoy/MobileUO | Código | GPLv3 (README) |
| E27 | MobileUO — metadados da API | https://api.github.com/repos/VoxelBoy/MobileUO | Código (metadados) | Não detectada |
| E28 | Ultima Codex — "Check Out MobileUO" (2020) | https://ultimacodex.com/2020/06/check-out-mobileuo-a-unity-based-mobile-client-for-ultima-online/ | Notícia | — |
| E29 | OrionUO — metadados da API | https://api.github.com/repos/Hotride/OrionUO | Código (metadados) | MIT |
| E30 | UltimaXNA — metadados da API | https://api.github.com/repos/ZaneDubya/UltimaXNA | Código (metadados) | GPL-3.0 |
| E31 | UOX3 — repositório (README) | https://github.com/UOX3DevTeam/UOX3 | Código | GPL v2 (README) |
| E32 | UOX3 — metadados da API | https://api.github.com/repos/UOX3DevTeam/UOX3 | Código (metadados) | NOASSERTION |
| E33 | ShardUO — metadados da API | https://api.github.com/repos/qbradq/sharduo | Código (metadados) | AGPL-3.0 |
| E34 | xrip/uo-client — metadados da API | https://api.github.com/repos/xrip/uo-client | Código (metadados) | NOASSERTION |
| E35 | GitHub — tópico "ultima-online" | https://github.com/topics/ultima-online | Índice de código | — |
| E36 | awesome-uo — lista curada | https://github.com/Alurith/awesome-uo | Índice de código | Não verificada |
| E37 | ModernUO — Main.cs (laço principal) | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/Server/Main.cs | Código | GPL-3.0 |
| E38 | ModernUO — listagens de Projects e Projects/Server | https://api.github.com/repos/modernuo/ModernUO/contents/Projects | Código (metadados) | GPL-3.0 |
| E39 | ModernUO — Timer.TimerWheel.cs | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/Server/Timer/Timer.TimerWheel.cs | Código | GPL-3.0 |
| E40 | ModernUO — World.cs | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/Server/World/World.cs | Código | GPL-3.0 |
| E41 | ModernUO — ExpansionInfo.cs | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/Server/ExpansionInfo.cs | Código | GPL-3.0 |
| E42 | ModernUO SerializationGenerator (via resultado de busca) | https://github.com/modernuo/SerializationGenerator | Código | Não verificada |
| E43 | RunUO — Timer.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Timer.cs | Código | GPL-2.0 |
| E44 | RunUO — World.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/World.cs | Código | GPL-2.0 |
| E45 | RunUO — Mobile.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Mobile.cs | Código | GPL-2.0 |
| E46 | RunUO — Map.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Map.cs | Código | GPL-2.0 |
| E47 | RunUO — Region.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Region.cs | Código | GPL-2.0 |
| E48 | RunUO — Container.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Items/Container.cs | Código | GPL-2.0 |
| E49 | RunUO — PacketHandlers.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/Network/PacketHandlers.cs | Código | GPL-2.0 |
| E50 | RunUO — ScriptCompiler.cs | https://raw.githubusercontent.com/runuo/runuo/master/Server/ScriptCompiler.cs | Código | GPL-2.0 |
| E51 | RunUO — SkillCheck.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/SkillCheck.cs | Código | GPL-2.0 |
| E52 | RunUO — BaseAI.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/BaseAI.cs | Código | GPL-2.0 |
| E53 | RunUO — Spell.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Spells/Base/Spell.cs | Código | GPL-2.0 |
| E54 | RunUO — BaseWeapon.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/BaseWeapon.cs | Código | GPL-2.0 |
| E55 | ClassicUO — listagens de src, ClassicUO.Assets e ClassicUO.Client | https://api.github.com/repos/ClassicUO/ClassicUO/contents/src | Código (metadados) | BSD-2-Clause |
| E56 | ClassicUO — UOFileManager.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/UOFileManager.cs | Código | BSD-2-Clause |
| E57 | ClassicUO — Chunk.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/Map/Chunk.cs | Código | BSD-2-Clause |
| E58 | ClassicUO — GameSceneDrawingSorting.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/Scenes/GameSceneDrawingSorting.cs | Código | BSD-2-Clause |
| E59 | ClassicUO — Settings.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Configuration/Settings.cs | Código | BSD-2-Clause |
| E60 | ClassicUO — listagem de UI/Gumps | https://api.github.com/repos/ClassicUO/ClassicUO/contents/src/ClassicUO.Client/Game/UI/Gumps | Código (metadados) | BSD-2-Clause |
| E61 | ClassicUO — LoginScene.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/Scenes/LoginScene.cs | Código | BSD-2-Clause |
| E62 | ClassicUO — PacketHandlers.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Network/PacketHandlers.cs | Código | BSD-2-Clause |
| E63 | ClassicUO — OutgoingPackets.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Network/OutgoingPackets.cs | Código | BSD-2-Clause |
| E64 | ClassicUO — wiki do GitHub | https://github.com/ClassicUO/ClassicUO/wiki | Documentação | — |
| E65 | ClassicUO — página "About" | https://classicuo.org/about | Documentação | — |
| E66 | ClassicUO — FAQ de jogadores | https://classicuo.org/players/faq | Documentação | — |
| E67 | POL Packet Docs — 0x02 Move Request | https://docs.polserver.com/packets/index.php?Packet=0x02 | Documentação | — |
| E68 | POL Packet Docs — 0x21 Char Move Rejection | https://docs.polserver.com/packets/index.php?Packet=0x21 | Documentação | — |
| E69 | POL Packet Docs — 0x22 Character Move ACK / Resync | https://docs.polserver.com/packets/index.php?Packet=0x22 | Documentação | — |
| E70 | POL Packet Docs — 0x8C Connect To Game Server; e fórum POL sobre a chave do 0x8C (via resultado de busca) | https://docs.polserver.com/packets/index.php?Packet=0x8C | Documentação | — |
| E71 | POL Packet Docs — 0x91 Game Server Login | https://docs.polserver.com/packets/index.php?Packet=0x91 | Documentação | — |
| E72 | POL Packet Docs — 0x1B Char Locale and Body | https://docs.polserver.com/packets/index.php?Packet=0x1B | Documentação | — |
| E73 | POL Packet Docs — 0xBF General Information | https://docs.polserver.com/packets/index.php?Packet=0xBF | Documentação | — |
| E74 | POL Packet Docs — 0x4F Overall Light Level | https://docs.polserver.com/packets/index.php?Packet=0x4F | Documentação | — |
| E75 | POL Packet Docs — 0x65 Set Weather | https://docs.polserver.com/packets/index.php?Packet=0x65 | Documentação | — |
| E76 | POL Packet Docs — 0xB0 Send Gump Menu Dialog | https://docs.polserver.com/packets/index.php?Packet=0xB0 | Documentação | — |
| E77 | POL Packet Docs — 0x6C Target Cursor Commands | https://docs.polserver.com/packets/index.php?Packet=0x6C | Documentação | — |
| E78 | Fórum UOX3 — "[STICKY] UO Packet Guides" (via resultado de busca) | https://www.forums.uox3.org/viewtopic.php?p=819 | Fórum | — |
| E79 | Fórum ServUO — "quick and easy ultima single player" (2024) | https://www.servuo.dev/threads/quick-and-easy-ultima-single-player-not-odyssey.16492/ | Fórum | — |
| E80 | uo.com — "ClassicUO Web Client" (atualizada em 2024-10-15) | https://uo.com/?p=32840 | Documentação oficial | — |
| E81 | Ultima Codex — "A Upgraded Classic Client … Is Being Worked On" (2024) | https://ultimacodex.com/2024/10/a-upgraded-classic-client-for-ultima-online-is-being-worked-on | Notícia | — |
| E82 | MassivelyOP — parceria Broadsword e ClassicUO (2024-09-26; via resultado de busca) | https://massivelyop.com/2024/09/26/ultima-online-devs-are-working-with-classicuo-modders-to-rehab-the-ancient-client-and-renderer/ | Notícia | — |
| E83 | Slashdot — "Ultima IV — EA Takedowns Precede Official Reboot" (2011) | https://games.slashdot.org/story/11/03/29/059232/ultima-iv-ea-takedowns-precede-official-reboot | Notícia | — |
| E84 | SimsCommunity — "The Sims 1 for Mobile fanmade project has been cancelled" (2017) | https://simscommunity.info/2017/08/07/the-sims-1-for-mobile-fanmade-project-has-been-cancelled/ | Notícia | — |
| E85 | MassivelyOP — artigo sobre emuladores e FreeSO (HTTP 403; via resultado de busca) | https://massivelyop.com/?p=138290 | Notícia | — |
| E86 | AnandTech Forums — "In Por Ylem 2.0 - Free Ultima Online Shard" (2011, cópias dos termos do UO) | https://forums.anandtech.com/threads/in-por-ylem-2-0-free-ultima-online-shard.2135690 | Fórum | — |
| E87 | Ultima Codex Wiki — "Freeshard" | https://www.wiki.ultimacodex.com/wiki/Freeshard | Wiki | — |
| E88 | UOGuide — página principal | https://www.uoguide.com/Main_Page | Wiki | Não declarada |
| E89 | UOGuide — "The Second Age" | https://www.uoguide.com/The_Second_Age | Wiki | Não declarada |
| E90 | uo.com — Ultima Online Wiki | https://uo.com/wiki/ultima-online-wiki/ | Wiki oficial | — |
| E91 | UO Stratics (HTTP 403 nesta data; Wayback Machine inacessível pela ferramenta) | https://uo.stratics.com/ | Wiki/site de referência | — |
| E92 | uo.com — Endless Journey (via resultado de busca) | https://uo.com/endless-journey/ | Documentação oficial | — |
| E93 | Ultima Codex — "So…What's Happening With EA, the 'Ultima' Trademark, and Richard Garriott?" (2026-06-22) | https://ultimacodex.com/2026/06/so-whats-happening-with-ea-the-ultima-trademark-and-richard-garriott/ | Notícia | — |
| E94 | TechSpot — regra de 35 anos e o criador do Ultima (2026-06-21) | https://www.techspot.com/news/112843-35-year-old-copyright-rule-could-ultima-creator.html | Notícia | — |
| E95 | Inven Global — Garriott e a recuperação de direitos do Ultima (2026-10-07) | https://www.invenglobal.com/articles/26934/richard-garriott-moves-to-reclaim-ultima-negotiating-copyright-recovery-with-ea | Notícia | — |
| E96 | Justia Trademarks — Electronic Arts Inc. (titular) e "ULTIMA ONLINE" (página do registro em 403; via resultado de busca) | https://trademarks.justia.com/owners/electronic-arts-inc-2448784/index.html | Registro de marca (agregador) | — |
| E97 | POL Packet Docs — índice (versão para download de 2021-10-20) | https://docs.polserver.com/packets/index.php | Documentação | — |
| E98 | ServUO — Config/Server.cfg | https://raw.githubusercontent.com/ServUO/ServUO/pub57/Config/Server.cfg | Código (configuração) | GPL-2.0 |
| E99 | Portes do Ultima SDK: ultima-py e uo-rust-libs (via resultado de busca) | https://github.com/jackuoll/ultima-py | Código | Não verificada |
| E100 | Fórum POL — "Packet 0xA8" (via resultado de busca) | https://forums.polserver.com/viewtopic.php?p=7797 | Fórum | — |
