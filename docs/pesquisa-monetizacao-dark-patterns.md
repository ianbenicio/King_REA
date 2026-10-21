---
titulo: Pesquisa — monetização por anúncios e dark patterns em jogos
data: 2026-10-20
---

# Monetização por anúncios e dark patterns em jogos

Levantamento de artigos, matérias, regulação e projetos open source sobre (1) como jogos ajustam mecânicas para vender anúncios e compras e (2) dark patterns (padrões enganosos). Serve de base para um possível protocolo de monetização no REA. Números de mercado são estimativas de terceiros, não dados auditados.

## 1. Pesquisa acadêmica

| Trabalho | Ano | O que traz |
|---|---|---|
| Zagal, Björk e Lewis — *Dark Patterns in the Design of Games* (FDG) | 2013 | Taxonomia base: padrões **temporais** (grinding, jogar com hora marcada), **monetários** (pay-to-skip) e de **capital social** (pirâmide social). Ponto de partida de quase todos os trabalhos seguintes |
| Chen et al. — *Unveiling the Tricks* (UIGuard, UIST) | 2023 | Detecção automática de dark patterns em telas de apps (visão computacional + regras). 6.352 telas, F1 0,79. Inclui exemplos de anúncio com botão de fechar pequeno ou disfarçado |
| Di Geronimo et al. (CHI) | 2020 | 240 apps populares: 95 % têm pelo menos um dark pattern, média de 7 tipos por app; a maioria dos usuários não percebe |
| Niknejad et al. — *Level Up or Game Over* (MUM '24) | 2024 | Como os dark patterns moldam jogos mobile |
| AdsDP (IMWUT) | 2025 | Dataset em vídeo de anúncios dentro de apps iOS; 15 tipos de dark pattern em anúncios, 11 inéditos |
| Chen, Wang e Xiao (DiGRA) | 2025 | Os 50 F2P mobile de maior receita no Google Play (EUA): prevalência e coocorrência dos padrões |
| Dahlan e Susanty | 2025 | Avaliação heurística de jogos casuais: pay-to-skip, grinding e jogar com hora marcada são os mais comuns |
| Gutiérrez-Manjón et al. (Tripodos) | 2026 | Taxonomia em jogos-serviço de maior receita (dimensões temporal, monetária e social) |
| Shemeikka (Oulu, dissertação) | 2024 | Revisão: dark patterns × microtransações; pergunta se jogos precisam de taxonomia própria |

## 2. Ajuste de mecânicas para anúncios (indústria)

- **Ritmo de intersticial:** teste A/B publicado pela Unity (dados ironSource) comparou intervalos de 25, 35 e 40 s; 25 s venceu em 80 % dos testes, com +10 % de ARPU.
- **Posicionamento:** intersticial antes da tela de vitória (e não depois de um rewarded pulado) aumentou impressões por DAU, mas só venceu em 55 % dos grupos.
- **Canibalização:** rewarded em excesso derruba compras dentro do app.
- **Subgênero:** puzzle aguenta carga de anúncio menor que runner (retenção longa).
- **Block Blast (Hungry Studio):** receita quase toda de anúncios (compras irrisórias); intersticial entre partidas e rewarded para reviver (um por sessão). Estimativas de US$ 0,6–1 milhão por dia em anúncios; parceria com AdMob creditada com +8 % de retenção. Números de analistas, não da empresa.
- **Patentes da EA:** dificuldade dinâmica (DDA) e *Engagement Optimized Matchmaking* (pareamento conforme risco de abandono, com objetivo trocável por tempo de jogo ou gasto). São patentes registradas; não há confirmação de uso em jogo lançado.

**Lacuna:** não há estudo controlado público que ligue curva de dificuldade de puzzle à frequência de anúncio. Na prática, muito desses parâmetros fica no servidor (remote config, testes A/B), e não no binário.

## 3. Regulação

| Onde | Instrumento | Pontos que tocam jogos |
|---|---|---|
| EUA | FTC × Epic Games (2022) | US$ 245 milhões de reembolso por dark patterns em compras (cartão salvo por padrão, compra com um botão, inclusive por crianças); exige consentimento afirmativo |
| UE | DSA, considerando 67 | Define dark pattern: prática que distorce a escolha autônoma e informada |
| UE | Rede CPC — princípios sobre moedas virtuais em jogos (mar/2025) | Preço em moeda real ao lado da moeda virtual; não esconder custo misturando moedas; direito de arrependimento; nada de pressão sobre crianças. Não vinculante, mas guia a fiscalização. Caso Star Stable |
| UE | Digital Fairness Act | Previsto para 2026; status não confirmado nesta pesquisa |
| Brasil | ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026) | Vale para produtos voltados a crianças e adolescentes ou de acesso provável por eles; proíbe loot boxes nesses jogos; multas noticiadas de até 10 % do faturamento ou R$ 50 milhões (conferir no texto da lei) |
| Brasil | Decisão judicial (jun/2026, ação da ANCED) | Loot boxes violam a proteção à criança; empresas condenadas (fonte secundária) |
| Brasil | ACT 28/2026 (SPA/Fazenda + Sedigi/MJ) | Cooperação para identificar e combater dark patterns em plataformas digitais |

## 4. Projetos no GitHub

| Repositório | Estrelas | Uso possível no REA |
|---|---|---|
| [Exodus-Privacy/exodus-standalone](https://github.com/Exodus-Privacy/exodus-standalone) | 98 | Detectar SDKs de anúncio e rastreadores num APK localmente (análise estática, N1) |
| [Exodus-Privacy/exodus-core](https://github.com/Exodus-Privacy/exodus-core) | 25 | Núcleo do Exodus (assinaturas de rastreadores) |
| [reddr/LibScout](https://github.com/reddr/LibScout) | 309 | Detectar bibliotecas de terceiros em apps Android, inclusive com ofuscação (parado desde 2019) |
| [pkumza/LibRadar](https://github.com/pkumza/LibRadar) | 281 | Idem, por assinatura de pacotes (parado desde 2020) |
| [chenjshnn/UIST23-UIGuard](https://github.com/chenjshnn/UIST23-UIGuard) | 8 | Código do UIGuard: detectar dark patterns em capturas de tela |
| [aruneshmathur/dark-patterns](https://github.com/aruneshmathur/dark-patterns) | 140 | Crawler e dados do estudo de Princeton (11 mil lojas web); referência de método |
| [arrakh/ArrDDA](https://github.com/arrakh/ArrDDA) | 9 | Plugin Unity de dificuldade dinâmica (lado da criação) |
| [Manavarya09/DarkLens-MCP-Server](https://github.com/Manavarya09/DarkLens-MCP-Server) | 7 | Servidor MCP de detecção de dark patterns (pequeno, não auditado) |

Os projetos de detecção com IA (BERT, Gemini) encontrados são pequenos, recentes e sem manutenção comprovada. Qualquer um passa pelo processo de auditoria e fixação antes de entrar em `ferramentas/`.

## Fontes

- Zagal, Björk, Lewis (2013): [Chalmers](https://research.chalmers.se/en/publication/177148), [PDF](https://gup.ub.gu.se/file/101018)
- UIGuard: [arXiv 2308.05898](https://arxiv.org/html/2308.05898v2)
- Level Up or Game Over: [arXiv 2412.05039](https://www.arxiv.org/abs/2412.05039)
- AdsDP: [deceptive.design](https://deceptive.design/articles/adsdp-a-video-dataset-for-recognizing-and-examining-dark-patterns-in-ios-in-app-advertisements)
- Chen, Wang, Xiao (DiGRA 2025): [DiGRA](https://dl.digra.org/index.php/dl/article/view/2765)
- Dahlan e Susanty: [deceptive.design](https://www.deceptive.design/articles/finding-dark-patterns-in-casual-mobile-games-using-heuristic-evaluation)
- Taxonomia GaaS: [deceptive.design](https://deceptive.design/articles/designing-for-monetization-a-taxonomy-of-dark-patterns-in-top-grossing-gaas-video-games)
- Shemeikka: [Oulu](https://oulurepo.oulu.fi/handle/10024/53101)
- Di Geronimo et al.: [deceptive.design](https://deceptive.design/articles/ui-dark-patterns-and-where-to-find-them-a-study-on-mobile-applications-and-user-perception)
- A/B de anúncios: [Unity](https://unity.com/blog/5-a-b-tests-to-increase-revenue-and-users-for-your-hyper-casual-game), [Verve](https://verve.com/blog/top-monetization-mistakes-in-hypercasual-gaming-and-how-to-fix-them/), [Mobidictum](https://mobidictum.com/six-tips-to-maximize-hyper-casual-game-revenue/)
- Block Blast: [Applixir](https://www.applixir.com/blog/the-block-blast-playbook-what-127m-in-ad-revenue-actually-bought/), [Udonis](https://www.blog.udonis.co/statistics/block-blast), [AdMob](https://admob.google.co.in/home/resources/hungry-studio-boosts-user-retention-revenue-with-admob/), [36Kr](https://eu.36kr.com/en/p/3706617203732616)
- Patentes EA: [KitGuru](https://www.kitguru.net/gaming/matthew-wilson/two-ea-patents-paint-a-worrying-future-for-online-matchmaking/), [TechRaptor](https://techraptor.net/content/ea-filed-patent-online-matchmaking-algorithm-focusing-player-engagement)
- FTC × Epic: [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/ftc-announces-520-million-in-settlements-with-epic-games), [Härting](https://haerting.de/en/insights/ftc-vs-epic-games-illegal-dark-patterns/)
- Princípios CPC: [Bird & Bird](https://twobirds.com/en/insights/2025/european-move-towards-protecting-users-from-harmful-practices-in-video-games-eu-consumer-protection), [Linklaters](https://techinsights.linklaters.com/post/102k6t4/game-changer-eu-introduces-consumer-protection-guidance-for-in-game-virtual-curr)
- ECA Digital: [Machado Meyer](https://www.machadomeyer.com.br/images/ebooks/Factsheet_ECA_Digital.pdf), [Demarest](https://demarest.com.br/wp-content/uploads/2025/09/ECA-Digital_implicacoes-e-desafios-para-a-protecao-de-criancas-e-adolescentes-no-ambiente-digital.pdf), [TecMundo](https://www.tecmundo.com.br/voxel/502437-loot-boxes-serao-proibidas-no-brasil-apos-sancao-de-lula-entenda-impacto-da-lei-felca-nos-games.htm), [Olhar Digital](https://olhardigital.com.br/2026/06/17/games-e-consoles/justica-condena-empresas-de-games/), [Movimento Econômico](https://movimentoeconomico.com.br/administracao-publica/2026/06/17/acordo-entre-fazenda-e-justica-mira-praticas-abusivas-em-plataformas-de-bets/)
