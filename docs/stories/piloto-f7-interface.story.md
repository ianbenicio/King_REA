# Story PF7 — Piloto de monetização, F7: interface mínima e análise cega com execução

**Status:** Ready (validada por @po em 2026-10-23, ver "Validação @po")
**Workflow:** SDC + QA Loop (máx. 2 iterações) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 e §6 · **Plano do piloto:** [`docs/plano-piloto-puzzle.md`](../plano-piloto-puzzle.md) §7 e §8 · **Produto:** [`reimplementacoes/puzzle-piloto/`](../../reimplementacoes/puzzle-piloto/)
**Complexidade:** STANDARD · estimativa L (13 pontos): seis sessões depois desta; riscos em vazamento para a análise cega e em execução de build com classe C

## Story

**Como** responsável pelo protocolo de monetização do PRKing_REA,
**quero** que o puzzle do piloto tenha uma interface mínima e que uma variante com padrões visuais plantados seja analisada às cegas, com execução no navegador,
**para** saber se o protocolo encontra dark patterns que só aparecem na tela e preencher o estado "execução", que na F6 ficou "não testado".

## Contexto

A F6 (commit `ace9473`) analisou os builds `blocos-a` e `blocos-b` só pelo código (N0/N1): plantado 6/6 com ID e estados certos, iscas evitadas, limpo sem falso positivo de classe C. O piloto é headless, então padrões de interface (botão de fechar, destaque da recusa, rótulo de anúncio) não podiam aparecer, e nenhum achado teve o estado de execução preenchido. A melhoria nº 5 de `registros/blocos-b/02-benchmark.md` propôs a F7; o responsável confirmou em 2026-10-23 com escopo completo e verificação por modelo puro + navegador embutido.

Regras que valem para toda a story:
- O núcleo (`src/nucleo/`) não muda e não importa nada de fora; a interface fala só com a sessão (`criarSessao` e as ações que ela expõe).
- Padrão de monetização no produto só se declarado em `monetizacao.json` e marcado com `// MON-NNNN`; classe C nunca. Mudança no perfil derruba a aprovação de MON-0011 (presa ao hash) e pede nova aprovação.
- Sem dependências: JavaScript ESM, `node:test`, HTML, canvas e DOM do navegador.
- A lista do que for plantado fica só em `pilotos/puzzle-plantado/GABARITO.md`. Esta story, o plano e os handoffs não a repetem.

## Escopo

**Dentro:** modelo de tela como dado puro, com testes e mutações de tela; desenho em HTML/canvas/DOM e servidor local mínimo (Node, sem dependência) ou `file://`; seção nova na `ESPECIFICACAO.md`; regra Semgrep de interface, se couber sem falso positivo no limpo; plantio visual e iscas na variante; `construir.mjs` com interface nos dois builds; protocolo de segurança dos dois alvos novos; duas análises cegas em sessões próprias; comparação com o gabarito; QA gate; nota no Engram.

**Fora:** SDK de anúncio real, rede, loja real, usuários, experimento A/B; mudança no núcleo do jogo; arte, som e animação além do necessário para ler a tela; responsividade além de uma janela de desktop e uma de celular no navegador embutido; Playwright ou qualquer pacote novo; mudanças em `.claude/hooks/`, `.claude/settings.json` e no global; mudança de classe de padrão no catálogo (ajustes ao catálogo e ao protocolo só propostos, para aprovação).

## Dependências

| Depende de | Para | Bloqueia |
|---|---|---|
| U1 (modelo de tela) | U2 desenhar o modelo | U2 |
| U2 (interface funcionando no limpo) | U3 plantar sobre ela e gerar os builds | U3 |
| U3 (builds, hashes e `00-seguranca.md` aprovados pelo responsável) | U4a/U4b analisarem | U4a, U4b |
| Aprovação do responsável dos níveis da análise (N2/N3) | estado "execução" nas análises | só o estado "execução"; sem ela, a análise segue em N0/N1 |
| U4a e U4b concluídas | U5 comparar | U5 |
| Nova aprovação de MON-0011, se `monetizacao.json` mudar | checagem de monetização verde | commit da unidade que mudar o perfil |

## Critérios de aceitação

### U1 — modelo de tela (@dev, sessão nova, ~180k)

- [ ] **AC-U1.1 (modelo)** — *Dado* um estado da sessão (jogando, oferta de troca, oferta de continuar, intersticial, rewarded, loja, sem vidas), *quando* `src/interface/` monta a tela, *então* o resultado é um dado puro: lista de elementos com papel (ação principal, recusa, fechar, rótulo, informação), texto, posição e tamanho em pixels de uma tela de referência, cores de texto e fundo, e o tempo a partir do qual cada elemento aceita toque. Sem DOM, sem relógio próprio, sem aleatoriedade.
- [ ] **AC-U1.2 (dependências)** — `src/interface/` importa só de `src/sessao/` e de si mesma; R1 e R2 continuam sem alerta; o teste de invariância passa sem mudança.
- [ ] **AC-U1.3 (paridade da recusa)** — *Dada* qualquer oferta (troca, continuar, vida, compra), *então* a recusa tem a mesma área, o mesmo peso de fonte e contraste igual ou maior que 4,5:1 (calculado pelo modelo, fórmula da WCAG), e o texto dela é neutro (sem culpa). Teste cobre cada oferta.
- [ ] **AC-U1.4 (fechar e rótulo)** — *Dado* um intersticial ou rewarded, *então* o fechar está visível e tocável desde o início no rewarded e a partir do fim do anúncio no intersticial simulado, com alvo mínimo de 44 × 44 px, fora da área de outros botões; todo anúncio tem rótulo "Anúncio" visível; nenhuma oferta de continuar tem contagem regressiva.
- [ ] **AC-U1.5 (toque acidental)** — *Dado* um anúncio que aparece no fim de partida, *quando* o jogador toca nos primeiros instantes (janela definida no modelo), *então* o toque não abre nada; nenhum anúncio aparece sob o dedo durante uma jogada.
- [ ] **AC-U1.6 (mutações de tela)** — mutações aplicadas em memória no teste (recusa menor ou apagada, fechar pequeno, atrasado ou sobreposto, anúncio sem rótulo, contagem regressiva, botão de ação no lugar do fechar) fazem os testes de U1.3–U1.5 falharem, uma a uma.
- [ ] **AC-U1.7 (especificação e perfil)** — `ESPECIFICACAO.md` ganha a seção "Interface" com as regras acima em palavras próprias; `monetizacao.json` só muda se algum padrão novo entrar, e nesse caso com marcador e nova aprovação do responsável registrada aqui.
- [ ] **AC-U1.8 (fechamento)** — `npm test`, `npm run check:monetizacao`, `npm run semgrep`, `semgrep:test` e `semgrep:mutacoes` verdes; testes novos no `npm test` da raiz; commit `feat:` local; handoff em `docs/handoffs/`.

### U2 — desenho e navegador (@dev, sessão nova ou junto com U1, ~180k)

- [ ] **AC-U2.1 (desenho)** — `interface/index.html` desenha o modelo: grade e peças em canvas; botões, rótulos e ofertas em DOM (texto selecionável e legível por leitor de tela). O desenho não decide nada: tamanho, cor e tempo vêm do modelo.
- [ ] **AC-U2.2 (execução local)** — o jogo abre por `file://` ou por um servidor estático mínimo em Node (sem dependência, só em `127.0.0.1`), sem rede externa; o SDK continua simulado.
- [ ] **AC-U2.3 (fluxos)** — no navegador embutido, em janela de desktop e de celular: partida até o fim, intersticial, troca com rewarded, continuar e encerrar, compra de remover anúncios com confirmação, sem vidas com tempo de espera; console sem erro. Resultado por fluxo no handoff (capturas não versionadas).
- [ ] **AC-U2.4 (Semgrep de interface)** — regra nova só se pegar ao menos uma mutação de tela do AC-U1.6 com zero alertas no limpo e teste anotado; senão, registrar por que não entrou.
- [ ] **AC-U2.5 (fechamento)** — verificações do AC-U1.8 verdes de novo; commit `feat:` local; handoff.

### U3 — variante plantada e alvos (@dev, sessão nova, ~180k)

- [ ] **AC-U3.1 (plantio)** — `pilotos/puzzle-plantado/plantio.mjs` ganha mecanismos visuais (padrões do catálogo, classes misturadas) e iscas visuais (parecem suspeitas e não são); o plantio é de trechos exatos, como na F5. A lista, os IDs e os estados esperados (código, execução, causalidade, configuração) ficam só no `GABARITO.md`, com a seção da F7 separada da F5.
- [ ] **AC-U3.2 (builds)** — `construir.mjs` gera os dois builds com interface em `alvos/<alvo>/`, com nomes neutros novos (sem `blocos-`), sem comentários e sem perfil de governança; a conferência de vazamento cobre também HTML, CSS e textos de interface; o build limpo joga igual ao código-fonte; duas execuções dão os mesmos hashes.
- [ ] **AC-U3.3 (segurança)** — `registros/<alvo>/00-seguranca.md` dos dois alvos pelo protocolo normal, com plano de níveis que inclui execução no navegador (N3, `capture_browser_scenario`) e as tools N2 de página que forem usadas; aprovados pelo responsável, com os níveis nas palavras dele.
- [ ] **AC-U3.4 (cegueira)** — instrução das sessões de análise escrita no handoff, com a lista do que não podem ler (`pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano*`, `docs/stories/`, `docs/handoffs/`, `registros/blocos-*`, o outro alvo e o histórico do git desses caminhos); decisão do responsável sobre regra `deny` de leitura registrada em "Aprovações".
- [ ] **AC-U3.5 (fechamento)** — `npm test` verde; commit `test:`/`feat:` local (só fontes do plantio e gabarito; builds fora do git); handoff.

### U4a / U4b — análise cega (sessão nova por alvo, ~180k cada)

- [ ] **AC-U4.1** — *Dado* um alvo, *quando* a sessão roda o `protocolo-monetizacao` lendo só a skill, o catálogo, o modelo 05 e `alvos/<alvo>/`, *então* produz `registros/<alvo>/05-monetizacao.md` e `01-analise.md` com estados separados por achado; execução só nos níveis aprovados e confirmada a cada chamada pelo gate.
- [ ] **AC-U4.2** — cada sessão analisa um alvo só e não lê o outro; handoff com id completo da sessão, início e fim em UTC.

### U5 — comparação e fechamento (@qa → @dev pelo QA Loop, sessão nova, ~180k)

- [ ] **AC-U5.1 (gabarito)** — tabela por alvo: encontrado com ID certo / ID errado / não encontrado / falso positivo / isca evitada, e estado por estado; linha à parte para o que só a execução revelou (achado que a leitura do código sozinha não fecharia).
- [ ] **AC-U5.2 (cegueira comprovada)** — varredura dos transcripts de U4a e U4b: nenhuma leitura, busca ou comando nos caminhos proibidos do AC-U3.4; chamadas do REA só aos níveis aprovados.
- [ ] **AC-U5.3 (review)** — `/code-review` do diff de U1–U3 em `reimplementacoes/puzzle-piloto/` e `pilotos/`; cada achado corrigido ou aceito pelo responsável.
- [ ] **AC-U5.4 (lições e propostas)** — lições em `registros/<alvo>/01-analise.md` (como na F6); ajustes ao protocolo e ao catálogo listados como propostas para o responsável, nenhum aplicado sem aprovação.
- [ ] **AC-U5.5 (fechamento)** — veredito PASS, ou CONCERNS aceito pelo responsável; story `Done`; handoff final com as métricas das sessões (`unidade.js`/`sessao.js` no Harness); nota no Engram, mais as lições ligadas que faltam na nota do piloto, se o responsável aprovar.

## Critério de pronto (story inteira)

Todos os ACs marcados; `npm test`, checagem de monetização e Semgrep verdes; `pre-commit` passando sem `--no-verify`; builds e evidência fora do git; nada enviado ao GitHub (push só por @devops com autorização).

## Riscos

| Risco | Onde | Mitigação |
|---|---|---|
| Vazamento do plantio para a análise cega (docs públicos e legíveis) | U3, U4 | lista só no gabarito; caminhos proibidos (AC-U3.4); regra `deny` se aprovada; varredura (AC-U5.2) |
| Os testes do limpo (U1) apontam os padrões visuais clássicos e o analista "adivinha" o plantio | U3, U4 | testes não vão para os builds; plantio mistura padrões fora dos testes do U1 com iscas visuais; controle limpo sem identificação |
| Mesmo modelo planta e analisa | U4 | limite declarado no resultado, como na F6 |
| Executar build com classe C | U4 | só em `alvos/`, navegador do REA, SDK simulado, sem rede; N3 aprovado caso a caso |
| Interface acoplando monetização ao núcleo | U1, U2 | AC-U1.2; R1/R2; invariância |
| Aprovação de MON-0011 caducar | U1 | mexer no perfil só se necessário; pedir aprovação na mesma unidade |
| Sessão passar de ~200k | todas | handoff e sessão nova; U1 e U2 separadas por padrão |

## Valor

Primeira medida do protocolo de monetização com o estado "execução" preenchido e com padrões que só aparecem na tela, antes de um alvo de terceiros. Para o Harness, uma unidade de trabalho nova medida sessão a sessão com o `autoCompactWindow` em 300k (D37).

## Tasks

- [x] U0 — Fase 0 e plano aprovado (`docs/plano-de-execucao.md`, 2026-10-23)
- [x] U0 — esta story e validação @po
- [ ] U1 — AC-U1.1 a AC-U1.8
- [ ] U2 — AC-U2.1 a AC-U2.5
- [ ] U3 — AC-U3.1 a AC-U3.5
- [ ] Responsável — aprovar os protocolos de segurança e os níveis da análise
- [ ] U4a — análise cega do alvo 1
- [ ] U4b — análise cega do alvo 2
- [ ] U5 — AC-U5.1 a AC-U5.5

## Validação @po (checklist de 10 pontos)

| # | Ponto | Nota | Observação |
|---|---|---|---|
| 1 | Título claro e objetivo | ✓ | |
| 2 | Descrição completa (problema/necessidade) | ✓ | Lacuna da F6 (execução "não testado", padrões de tela invisíveis) no contexto |
| 3 | ACs testáveis (Dado/Quando/Então) | parcial | U1.1, U1.3–U1.5 e U4.1 em Dado/Quando/Então; os de entrega com verificação objetiva. Dois valores ficam para a U1 fixar na especificação: a janela de toque acidental (AC-U1.5) e a duração do intersticial simulado, que hoje não existe no SDK (AC-U1.4) |
| 4 | Escopo com dentro e fora | ✓ | |
| 5 | Dependências mapeadas | ✓ | Inclui a aprovação dos níveis e a de MON-0011 |
| 6 | Estimativa de complexidade | ✓ | STANDARD, L (13), seis sessões depois desta |
| 7 | Valor de negócio | ✓ | |
| 8 | Riscos documentados | ✓ | Vazamento tratado em três camadas (gabarito, caminhos proibidos, varredura) |
| 9 | Critério de pronto | ✓ | |
| 10 | Alinhamento com a fonte | ✓ | Unidades e verificações batem com `docs/plano-de-execucao.md` §3 e §6; desenho da análise cega igual ao §7 do plano do piloto, mais a execução |

**Decisão: GO (9,5/10).** Observações, sem bloquear:
- AC-U1.3: "paridade" quer dizer mesma área e mesmo peso que a ação principal; o contraste da recusa tem de passar de 4,5:1 e não ficar abaixo do da ação principal. A U1 escreve isso assim na especificação.
- AC-U1.4 e AC-U1.5: a U1 fixa os dois valores (duração do intersticial simulado, janela de toque) na especificação antes dos testes.
- AC-U3.3 pede o responsável no meio da U3; prever a pausa.
- Se a U1 terminar abaixo de ~120k, juntar a U2 na mesma sessão é aceitável (plano §3).

## Aprovações do responsável

| Data | Unidade | O quê | Palavras do responsável |
|---|---|---|---|
| 2026-10-23 | U0 | F7 escolhida como próxima unidade | "Confirmo a F7 do piloto (interface mínima). Siga com a Fase 0 e o contrato da unidade." |
| 2026-10-23 | U0 | Escopo completo com análise cega; verificação por modelo puro + navegador | "Completa com análise cega"; "Modelo puro + navegador" |
| 2026-10-23 | U0 | Plano da F7 aprovado | "Aprovo o plano da F7. Registre a aprovação e siga com a story (U0)." |
| 2026-10-23 | U0 → U1 | Observações do @po aceitas; a U1 fixa na especificação a duração do intersticial simulado e a janela de toque acidental; U1 em sessão nova | "eu estou de acordo com a sugestões e os dados que faltam, pode seguir o caminho mais seguro e eficiente." |

## File List

- `docs/plano-de-execucao.md` (novo plano da F7; o anterior foi para `docs/planos/2026-10-21-notepad-bloco-5.md`)
- `docs/stories/piloto-f7-interface.story.md` (esta)

## QA Results

_(vazio até a U5)_

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-10-23 | @sm | Story criada (Draft) a partir do plano da F7 |
| 2026-10-23 | @po | Validação de 10 pontos: GO (9,5/10); status Draft → Ready |
