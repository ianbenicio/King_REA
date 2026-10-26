# Story PF7 — Piloto de monetização, F7: interface mínima e análise cega com execução

**Status:** Done (gate da U5: PASS depois da iteração 1 do QA loop, 2026-10-24; U1 iniciada em 2026-10-23; validada por @po em 2026-10-23, ver "Validação @po")
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

- [x] **AC-U1.1 (modelo)** — *Dado* um estado da sessão (jogando, oferta de troca, oferta de continuar, intersticial, rewarded, loja, sem vidas), *quando* `src/interface/` monta a tela, *então* o resultado é um dado puro: lista de elementos com papel (ação principal, recusa, fechar, rótulo, informação), texto, posição e tamanho em pixels de uma tela de referência, cores de texto e fundo, e o tempo a partir do qual cada elemento aceita toque. Sem DOM, sem relógio próprio, sem aleatoriedade.
- [x] **AC-U1.2 (dependências)** — `src/interface/` importa só de `src/sessao/` e de si mesma; R1 e R2 continuam sem alerta; o teste de invariância passa sem mudança.
- [x] **AC-U1.3 (paridade da recusa)** — *Dada* qualquer oferta (troca, continuar, vida, compra), *então* a recusa tem a mesma área, o mesmo peso de fonte e contraste igual ou maior que 4,5:1 (calculado pelo modelo, fórmula da WCAG), e o texto dela é neutro (sem culpa). Teste cobre cada oferta.
- [x] **AC-U1.4 (fechar e rótulo)** — *Dado* um intersticial ou rewarded, *então* o fechar está visível e tocável desde o início no rewarded e a partir do fim do anúncio no intersticial simulado, com alvo mínimo de 44 × 44 px, fora da área de outros botões; todo anúncio tem rótulo "Anúncio" visível; nenhuma oferta de continuar tem contagem regressiva.
- [x] **AC-U1.5 (toque acidental)** — *Dado* um anúncio que aparece no fim de partida, *quando* o jogador toca nos primeiros instantes (janela definida no modelo), *então* o toque não abre nada; nenhum anúncio aparece sob o dedo durante uma jogada.
- [x] **AC-U1.6 (mutações de tela)** — mutações aplicadas em memória no teste (recusa menor ou apagada, fechar pequeno, atrasado ou sobreposto, anúncio sem rótulo, contagem regressiva, botão de ação no lugar do fechar) fazem os testes de U1.3–U1.5 falharem, uma a uma.
- [x] **AC-U1.7 (especificação e perfil)** — `ESPECIFICACAO.md` ganha a seção "Interface" com as regras acima em palavras próprias; `monetizacao.json` só muda se algum padrão novo entrar, e nesse caso com marcador e nova aprovação do responsável registrada aqui.
- [x] **AC-U1.8 (fechamento)** — `npm test`, `npm run check:monetizacao`, `npm run semgrep`, `semgrep:test` e `semgrep:mutacoes` verdes; testes novos no `npm test` da raiz; commit `feat:` local; handoff em `docs/handoffs/`.

### U2 — desenho e navegador (@dev, sessão nova ou junto com U1, ~180k)

- [x] **AC-U2.1 (desenho)** — `interface/index.html` desenha o modelo: grade e peças em canvas; botões, rótulos e ofertas em DOM (texto selecionável e legível por leitor de tela). O desenho não decide nada: tamanho, cor e tempo vêm do modelo.
- [x] **AC-U2.2 (execução local)** — o jogo abre por `file://` ou por um servidor estático mínimo em Node (sem dependência, só em `127.0.0.1`), sem rede externa; o SDK continua simulado.
- [x] **AC-U2.3 (fluxos)** — no navegador embutido, em janela de desktop e de celular: partida até o fim, intersticial, troca com rewarded, continuar e encerrar, compra de remover anúncios com confirmação, sem vidas com tempo de espera; console sem erro. Resultado por fluxo no handoff (capturas não versionadas).
- [x] **AC-U2.4 (Semgrep de interface)** — regra nova só se pegar ao menos uma mutação de tela do AC-U1.6 com zero alertas no limpo e teste anotado; senão, registrar por que não entrou.
- [x] **AC-U2.5 (fechamento)** — verificações do AC-U1.8 verdes de novo; commit `feat:` local; handoff.

### U3 — variante plantada e alvos (@dev, sessão nova, ~180k)

- [x] **AC-U3.1 (plantio)** — `pilotos/puzzle-plantado/plantio.mjs` ganha mecanismos visuais (padrões do catálogo, classes misturadas) e iscas visuais (parecem suspeitas e não são); o plantio é de trechos exatos, como na F5. A lista, os IDs e os estados esperados (código, execução, causalidade, configuração) ficam só no `GABARITO.md`, com a seção da F7 separada da F5.
- [x] **AC-U3.2 (builds)** — `construir.mjs` gera os dois builds com interface em `alvos/<alvo>/`, com nomes neutros novos (sem `blocos-`), sem comentários e sem perfil de governança; a conferência de vazamento cobre também HTML, CSS e textos de interface; o build limpo joga igual ao código-fonte; duas execuções dão os mesmos hashes.
- [x] **AC-U3.3 (segurança)** — `registros/<alvo>/00-seguranca.md` dos dois alvos pelo protocolo normal, com plano de níveis que inclui execução no navegador (N3, `capture_browser_scenario`) e as tools N2 de página que forem usadas; aprovados pelo responsável, com os níveis nas palavras dele.
- [x] **AC-U3.4 (cegueira)** — instrução das sessões de análise escrita no handoff, com a lista do que não podem ler (`pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano*`, `docs/stories/`, `docs/handoffs/`, `registros/blocos-*`, o outro alvo e o histórico do git desses caminhos); decisão do responsável sobre regra `deny` de leitura registrada em "Aprovações".
- [x] **AC-U3.5 (fechamento)** — `npm test` verde; commit `test:`/`feat:` local (só fontes do plantio e gabarito; builds fora do git); handoff.

### U4a / U4b — análise cega (sessão nova por alvo, ~180k cada)

- [x] **AC-U4.1** — *Dado* um alvo, *quando* a sessão roda o `protocolo-monetizacao` lendo só a skill, o catálogo, o modelo 05 e `alvos/<alvo>/`, *então* produz `registros/<alvo>/05-monetizacao.md` e `01-analise.md` com estados separados por achado; execução só nos níveis aprovados e confirmada a cada chamada pelo gate.
- [x] **AC-U4.2** — cada sessão analisa um alvo só e não lê o outro; handoff com id completo da sessão, início e fim em UTC.

### U5 — comparação e fechamento (@qa → @dev pelo QA Loop, sessão nova, ~180k)

- [x] **AC-U5.1 (gabarito)** — tabela por alvo: encontrado com ID certo / ID errado / não encontrado / falso positivo / isca evitada, e estado por estado; linha à parte para o que só a execução revelou (achado que a leitura do código sozinha não fecharia).
- [x] **AC-U5.2 (cegueira comprovada)** — varredura dos transcripts de U4a e U4b: nenhuma leitura, busca ou comando nos caminhos proibidos do AC-U3.4; chamadas do REA só aos níveis aprovados.
- [x] **AC-U5.3 (review)** — `/code-review` do diff de U1–U3 em `reimplementacoes/puzzle-piloto/` e `pilotos/`; cada achado corrigido ou aceito pelo responsável.
- [x] **AC-U5.4 (lições e propostas)** — lições em `registros/<alvo>/01-analise.md` (como na F6); ajustes ao protocolo e ao catálogo listados como propostas para o responsável, nenhum aplicado sem aprovação.
- [x] **AC-U5.5 (fechamento)** — veredito PASS, ou CONCERNS aceito pelo responsável; story `Done`; handoff final com as métricas das sessões (`unidade.js`/`sessao.js` no Harness); nota no Engram, mais as lições ligadas que faltam na nota do piloto, se o responsável aprovar.

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
- [x] U1 — AC-U1.1 a AC-U1.8
- [x] U2 — AC-U2.1 a AC-U2.5
- [x] U3 — AC-U3.1 a AC-U3.5
- [x] Responsável — aprovar os protocolos de segurança e os níveis da análise
- [x] U4a — análise cega do alvo 1
- [x] U4b — análise cega do alvo 2
- [x] U5 — AC-U5.1 a AC-U5.5 (com a iteração 1 do QA loop)

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
| 2026-10-23 | U3 | Protocolo de segurança do alvo `encaixe-1`: N0–N3 aprovados (N3 só `capture_browser_scenario`, servidor do build em 127.0.0.1 durante a captura) | "Aprovar N0–N3 (Recommended)" |
| 2026-10-23 | U3 | Protocolo de segurança do alvo `encaixe-2`: N0–N3 aprovados (mesmo plano) | "Aprovar N0–N3 (Recommended)" |
| 2026-10-24 | U5 | Análises dos dois alvos aceitas, sem mais investigação | "Aceito as duas análises (não peço mais investigação)." |
| 2026-10-24 | U5 | Remoção do `deny` de `.claude/settings.local.json` no início da U5 | "Autorizo a U5 a remover o deny de .claude/settings.local.json no início."; depois de duas recusas do classificador: "Autorizo, tente de novo" |
| 2026-10-24 | U5 | CONCERNS não aceito; QA loop com @dev para os achados 1, 2, 4, 6, 7 e 8 | "Não aceito CONCERNS ainda: abra o QA loop com @dev para os achados 1, 2, 4, 6, 7 e 8 da review." |
| 2026-10-24 | U5 | Achado 5 entra no QA loop, achado 9 adiado, propostas 1 a 9 aplicadas (na 6, a opção do jogo pelo DOM), nota no Engram ao final (repassado pela sessão-mãe) | "Aprovo as recomendações como estão: incluir o achado 5 no QA loop, adiar o 9, aplicar as propostas 1 a 9 e fazer a nota no Engram ao final. Repasse à U5." |
| 2026-10-23 | U3 | Regra `deny` de leitura temporária: Read/Grep/Glob negados nos caminhos proibidos comuns, em `.claude/settings.local.json` (fora do git), aplicada no fim da U3 e removida no início da U5; `.claude/settings.json` sem mudança; o Bash ainda lê, então a varredura do AC-U5.2 continua | "Deny temporário (Recommended)" |

## File List

- `docs/plano-de-execucao.md` (novo plano da F7; o anterior foi para `docs/planos/2026-10-21-notepad-bloco-5.md`)
- `docs/stories/piloto-f7-interface.story.md` (esta)
- U1: `reimplementacoes/puzzle-piloto/ESPECIFICACAO.md` (seção 10, "Interface", com a duração do intersticial e do rewarded simulados e a janela de toque acidental)
- U1: `reimplementacoes/puzzle-piloto/src/interface/tela.mjs` (novo: modelo de tela como dado puro, `montarTela`, `tocar`)
- U1: `reimplementacoes/puzzle-piloto/src/interface/cores.mjs` (novo: contraste pela fórmula da WCAG)
- U1: `reimplementacoes/puzzle-piloto/src/interface/cenas.mjs` (novo: `cenaDaSessao`, `anuncioAposEventos`)
- U1: `reimplementacoes/puzzle-piloto/src/sessao/sessao.mjs` (getters só de leitura `painelVidas` e `semAnuncios` para a interface)
- U1: `reimplementacoes/puzzle-piloto/tests/interface-verificacoes.mjs` (novo: verificações das regras de tela e mutações em memória)
- U1: `reimplementacoes/puzzle-piloto/tests/interface.test.mjs` (novo: 38 testes, 26 deles de mutação de tela)
- U1: `package.json` (testes da interface no `npm test`)
- U1: `docs/handoffs/2026-10-23-piloto-f7-u1.md` (handoff)
- U2: `reimplementacoes/puzzle-piloto/interface/index.html`, `estilo.css` (novos: página e estilo sem cor nem tamanho próprios)
- U2: `reimplementacoes/puzzle-piloto/interface/controle.mjs` (novo: toque → ação da sessão; rewarded antes da sessão agir, roteiro do SDK simulado com o que o jogador fez)
- U2: `reimplementacoes/puzzle-piloto/interface/desenho.mjs` (novo: canvas para grade e peças, DOM para o resto)
- U2: `reimplementacoes/puzzle-piloto/interface/servidor.mjs` (novo: servidor estático em 127.0.0.1, só arquivos do piloto)
- U2: `reimplementacoes/puzzle-piloto/src/interface/cenas.mjs` (rewarded escolhido na oferta de continuar fica por cima dela)
- U2: `reimplementacoes/puzzle-piloto/ESPECIFICACAO.md` (§10: precedência da oferta; §10.1 nova, desenho no navegador)
- U2: `reimplementacoes/puzzle-piloto/tests/interface-navegador.test.mjs` (novo: 9 testes do controle e do servidor)
- U2: `reimplementacoes/puzzle-piloto/semgrep/r6-fechar-alvo-pequeno.yaml`, `.mjs` (nova regra R6 e teste anotado)
- U2: `reimplementacoes/puzzle-piloto/semgrep/r3-recusar-abre-anuncio-ou-loja.yaml`, `r4-intersticial-durante-jogada.yaml` (também valem para `interface/`)
- U2: `scripts/semgrep/mutacoes.mjs` (mutação "fechar do anúncio com alvo pequeno" no código do modelo)
- U2: `package.json` (teste novo no `npm test`, `interface/` na varredura do Semgrep, script `puzzle:interface`)
- U2: `docs/handoffs/2026-10-23-piloto-f7-u2.md` (handoff)
- U3: `pilotos/puzzle-plantado/plantio.mjs` (substituições da F7 sobre `src/` e `interface/`)
- U3: `pilotos/puzzle-plantado/construir.mjs` (builds com interface, nomes neutros novos, conferência de vazamento em HTML/CSS/textos, comparação do limpo pela interface)
- U3: `pilotos/puzzle-plantado/README.md`, `GABARITO.md` (seção da F7, separada da F5)
- U3: `registros/encaixe-1/00-seguranca.md`, `registros/encaixe-2/00-seguranca.md` (novos)
- U3: `.claude/settings.local.json` (fora do git: `deny` temporário, removido na U5)
- U3: `docs/handoffs/2026-10-23-piloto-f7-u3.md` (handoff, com a instrução das sessões cegas; na U5, frase do §6 que dizia qual build era o plantado neutralizada)
- U4a: `registros/encaixe-1/01-analise.md`, `05-monetizacao.md`, `registros/ALVO_ATIVO` (commit `5ba3cdf`)
- U4b: `registros/encaixe-2/01-analise.md`, `05-monetizacao.md`, `registros/ALVO_ATIVO` (commit `7b8128c`)
- U5: `docs/handoffs/2026-10-24-piloto-f7-u4a.md`, `2026-10-24-piloto-f7-u4b.md` (notas das sessões cegas, copiadas da pasta de notas sem mudança)
- U5: `registros/encaixe-1/01-analise.md`, `registros/encaixe-2/01-analise.md` (comparação com o gabarito, lições, critério 5, `status: concluida`)
- U5: `docs/handoffs/2026-10-24-piloto-f7-u5.md` (handoff final com as métricas U0–U5)
- U5: `.claude/settings.local.json` (fora do git: `deny` removido)
- U5, QA loop: `reimplementacoes/puzzle-piloto/src/interface/tela.mjs`, `cenas.mjs`, `src/sessao/sessao.mjs`, `interface/controle.mjs`, `desenho.mjs`, `index.html`, `estilo.css`, `ESPECIFICACAO.md` (§10, §10.1), `tests/interface-verificacoes.mjs`, `interface.test.mjs`, `interface-navegador.test.mjs`
- U5, QA loop: `pilotos/puzzle-plantado/construir.mjs` (demo da interface com a janela de toque)
- U5, propostas: `pilotos/puzzle-plantado/GABARITO.md`, `docs/catalogo-monetizacao.md`, `registros/_modelos/00-seguranca.md`, `CLAUDE.md`, `docs/plano-piloto-puzzle.md`, `.claude/skills/protocolo-monetizacao/SKILL.md`
- U5: `.claude/launch.json` (novo: servidor do puzzle para o navegador embutido)

## QA Results

**Revisor:** @qa (Quinn), U5, sessão `cfb67beb-1c4d-4280-869e-a628f4cd99f8`, 2026-10-24.
**Veredito inicial: CONCERNS.** O responsável não aceitou CONCERNS. Depois da iteração 1 do QA loop, o veredito passou a **PASS** (ver "QA loop — iteração 1"). A troca do canvas pelo DOM (proposta 6, aprovada) supera a redação do AC-U2.1, que dizia "grade e peças em canvas".
- Os ACs de U1 a U4 se cumprem, e o método de análise cega funcionou.
- As preocupações: dois defeitos do produto limpo que o gabarito não previa (achados 1 e 2 da review) e a cobertura de execução do N3.
- Para a story virar `Done`, o responsável aceita CONCERNS ou pede as correções (QA loop com @dev).

### AC-U5.1 — gabarito

Detalhe em `registros/<alvo>/01-analise.md`, seção "Comparação com o gabarito".

| Alvo | Plantados com ID certo | Produto | Iscas evitadas | Falso positivo C | Falso negativo | Estados |
|---|---|---|---|---|---|---|
| `encaixe-1` (plantado) | 9/9 (M1–M6, V1–V3) | 7/7 | 4/4 | 0 | 1 (MON-0025, real e fora do gabarito) | 1 erro (causalidade de V2); 4 divergências defensáveis |
| `encaixe-2` (limpo) | — | 6/7 (MON-0006 só como falta de preço dentro de MON-0003) | — | 1 (MON-0021, de classificação, por ambiguidade do catálogo) | 0 | 0 erros; 1 divergência defensável |

**Só a execução fechou:**
- No plantado:
  - V1 também depois da compra;
  - V2 na tela;
  - o escopo parcial do MON-0003;
  - o fechar cedo do MON-0001.
- No limpo:
  - a confirmação de compra que 1 × 2 cliques atravessam (MON-0025);
  - o fechar cedo do MON-0001.

**Itens a destacar:**
- **MON-0025 no limpo:** é mecanismo real do produto, não erro do analista.
  - A etapa `confirmacao` da loja (`src/interface/tela.mjs`) fica no mesmo retângulo do "Comprar" e aceita toque em 0 ms.
  - O plantado tem o mesmo defeito, mas a análise dele testou só um toque.
- **MON-0021 no limpo:** é falso positivo pelo gabarito. A análise aplicou o texto literal do catálogo ("atraso não informado"), e o produto de fato não informa a duração.
- **Lacuna do N3:**
  - O cenário clica só no centro de localizadores do DOM, e as peças ficam no canvas, então nenhuma partida terminou.
  - Ficaram sem execução: o intersticial do agendador, o continuar, a tela sem vidas e a causalidade do MON-0033.
  - No plantado, o intersticial só foi alcançado pelo V1, o que deixa a comparação assimétrica.
  - O canvas também não é jogável pelo teclado (acessibilidade).
- **Vazamento:** o §6 do handoff da U3 dizia qual build era o plantado. A frase foi neutralizada na U5, e nenhuma sessão cega leu o arquivo (o `deny` estava ativo e a varredura não achou acesso).

### AC-U5.2 — cegueira

Script e saídas estão na pasta de notas da sessão-mãe, fora do repositório.

**U4a** (`37f2850d-…`):
- Nenhuma leitura, busca ou comando em caminho proibido.
- As 4 ocorrências que a varredura apontou são da própria sessão:
  - duas escritas do handoff dela (a de `docs/handoffs/` foi recusada pelo `deny`);
  - um `git log -1` depois do próprio commit;
  - o texto do wrap-up.
- REA só em N0, N1 e N3, e a CLI `capture-browser-scenario` passou pelo cli-gate.

**U4b** (`329780a3-…`): mesmo resultado.

**Ressalvas, sem efeito comprovado:**
- O `CLAUDE.md` (item 9) e os assuntos de commit do snapshot do git dizem que existe uma variante plantada com classe C, mas não qual alvo é.
- O pedido inicial da U4b listava as sessões ligadas, com o nome do outro alvo.

### AC-U5.3 — review

`/code-review` no nível alto, de `ab6cc23`, `59036a6` e `5d2cb26`: 9 achados.

| # | Achado | Situação |
|---|---|---|
| 1 | `tela.mjs`: confirmação de compra no mesmo ponto e sem janela de toque (MON-0025 não intencional) | corrigido na iteração 1 do QA loop |
| 2 | Preço nunca aparece na loja (MON-0003, MON-0006) | corrigido na iteração 1 do QA loop |
| 3 | Handoff da U3 dizia qual build era o plantado | corrigido na U5 |
| 4 | `interface/desenho.mjs` e `controle.mjs` importam de `src/nucleo/` e `src/monetizacao/`, contra "a interface fala só com a sessão" | corrigido na iteração 1 do QA loop |
| 5 | Janela de toque aplicada por cena, não a toda troca de tela | corrigido na iteração 1 do QA loop |
| 6 | `problemasToque` não cobre a confirmação nem o toque duplo | corrigido na iteração 1 do QA loop |
| 7 | Fechar do intersticial oculto por 5 s sem a duração informada (ambiguidade com MON-0021) | corrigido na iteração 1 do QA loop |
| 8 | Fundo da recusa diferente do da ação principal ("destaque" do MON-0009) | corrigido na iteração 1 do QA loop |
| 9 | `desenho.mjs` refaz o canvas e o DOM a cada redesenho | adiado pelo responsável (baixo) |

**Semgrep:**
- `npm run semgrep`: 0 achados em 18 arquivos.
- `semgrep:test`: 6/6.
- `semgrep:mutacoes`: 7/7 (execução isolada).
- As regras atuais não pegam os achados 1 e 2.

### QA loop — iteração 1 (2026-10-24)

**@dev (subagente `aiox-dev`)** corrigiu os achados 1, 2, 4, 5, 6, 7 e 8 e fez o jogo jogável pelo DOM (proposta 6). As mudanças:
- **Confirmação de compra:** tem janela de 500 ms, e o "Cancelar" ocupa o ponto do "Comprar".
- **Preço:** vem da sessão (getter `produtoSemAnuncios`) e aparece no produto e na confirmação.
- **Imports da interface:** `interface/*.mjs` importa só de `src/sessao/` e `src/interface/`, com teste que lê os imports.
- **Janela de toque:** o controle aplica a janela a toda troca de tela. Jogadas seguidas não esperam.
- **Toque duplo:** nova verificação `problemasToqueDuplo`, com 3 mutações.
- **Intersticial:** mostra desde o início "Anúncio de 5 s. O botão Fechar aparece ao fim.", com verificação e mutações.
- **Destaque da recusa:** recusa e ação principal com o mesmo fundo e a mesma cor de texto, com verificação e mutações.
- **Jogo pelo DOM:**
  - o canvas saiu; casas e peças são botões com `data-celula`, `data-peca` e `aria-label`;
  - o modelo de `jogando` tem as 64 casas;
  - §10 e §10.1 da `ESPECIFICACAO.md` atualizadas.
- **Âncoras do plantio:** as 27 continuam intactas.

**Re-review do @qa:**
- Diff lido.
- `npm test` 164/164 (eram 148); `check:monetizacao` OK.
- Semgrep 0 achados, `semgrep:test` 6/6 e `semgrep:mutacoes` 7/7 (rodados pelo @dev, em sequência).
- Navegador embutido, `semente=1`, console sem erro:
  - preço nas duas etapas;
  - toque duplo em "Comprar" para na confirmação;
  - peça escolhida e colocada pelo teclado (Enter e Espaço);
  - três partidas jogadas até o fim só por cliques no DOM;
  - a oferta de continuar e o intersticial (com o aviso de duração e o fechar aos 5 s) foram alcançados;
  - "Nova partida" tocada 100 ms depois de trocar a tela foi ignorada (janela).

**Correção do @qa em `pilotos/`:** a `demoInterface` do `construir.mjs` tocava a cada 100 ms e quebraria com a janela. Passou a esperar 600 ms depois de cada toque e da volta do rewarded.
- Verificada só contra o fonte do produto, com um script que roda a demo sem gerar builds: sementes 1 a 3, todas as cenas.
- O `construir.mjs` **não** foi rodado: ele regera `alvos/encaixe-*`, que são os alvos analisados, com hashes registrados.

**Gate final: PASS.**
- O achado 9 (redesenho completo do DOM, que também gera ruído de `aria-live`) ficou adiado pelo responsável, para uma próxima unidade.
- Os alvos `encaixe-*` desta rodada continuam com o produto antigo, de propósito.

**Retomada em 2026-10-26.** O turno de 2026-10-24 parou no limite semanal de uso, antes do commit e da nota no Engram. Na retomada:
- **O @dev tinha terminado.** O diff cobre os achados 1, 2 e 4 a 8 e o jogo pelo DOM. Nada estava pela metade.
- **Alvos intactos.** O `construir.mjs` não foi rodado. Os hashes de conjunto dos alvos `encaixe-1` e `encaixe-2`, recalculados, batem com os dos `00-seguranca.md`, e nenhum arquivo dos alvos é posterior a 2026-10-23 17:57.
- **Testes:** `npm test` 164/164 e `check:monetizacao` OK, de novo.
- **Semgrep:** na retomada, o Docker estava desligado. Depois que o responsável religou, rodou de novo em 2026-10-26 sobre o HEAD `f7fd0c6`: 0 achados em 18 arquivos, `semgrep:test` 6/6 e `semgrep:mutacoes` 7/7.
- **Navegador embutido de novo, com `semente=1` e console sem erro:**
  - preço nas duas etapas da loja;
  - o 2º toque do toque duplo caiu em "Cancelar" e foi ignorado;
  - 7 partidas jogadas só pelo DOM;
  - rewarded de continuar recebido aos 5 s;
  - intersticial com o aviso desde o início e o Fechar oculto até o fim;
  - tela sem vidas;
  - toque a 100 ms de uma tela nova ignorado e liberado depois de 500 ms.
- **Nota no Engram:** `li-es-da-f7-do-piloto-de-monetiza-o-an-lise-cega-da-interfac`, ligada à nota de contexto do piloto.

### AC-U5.4 — propostas ao responsável (aplicadas na U5 com aprovação, exceto a 10, que foi o QA loop, e a 11, a nota no Engram)

**Onde cada proposta entrou:**
- 1 → `pilotos/puzzle-plantado/GABARITO.md` (regra de causalidade e "Revisão da U5").
- 2 a 5 → `docs/catalogo-monetizacao.md`: definições e sinais, com "Histórico" em cada padrão. Nenhuma classe mudou e o catálogo continua na v3, para não invalidar perfis.
- 6 → jogo pelo DOM, no QA loop.
- 7 → `registros/_modelos/00-seguranca.md`.
- 8 → `CLAUDE.md` (item 9, sem citar a variante) e lista de cegueira no `docs/plano-piloto-puzzle.md` §7.
- 9 → skill `protocolo-monetizacao` §5 (gesto repetido; alcance do cenário).

**As propostas, como foram apresentadas:**

1. **Gabarito:** aceitar a causalidade "demonstrada" quando houver intervenção controlada descrita.
2. **Catálogo, MON-0021:** definir "informado". Alternativa: o produto mostrar a duração.
3. **Catálogo, MON-0025:** sinal ou variante "confirmação no mesmo ponto ou sem janela de toque".
4. **Catálogo, MON-0009:** definir "destaque" (preenchimento, cor, posição).
5. **Catálogo, MON-0003/0006:** sinal "preço omitido na tela de compra".
6. **Plano de níveis**, uma destas saídas:
   - clique por coordenada ou posição no cenário N3;
   - caminho de jogo pelo DOM, que também resolve a acessibilidade;
   - adendo para rodar os módulos em Node.
7. **Modelo do `00-seguranca`:** prever o navegador copiado para `saidas/<slug>/navegador/`.
8. **Cegueira:**
   - conferir vazamento em `docs/` antes das sessões cegas;
   - definir de antemão o destino dos handoffs cegos;
   - não citar a variante nem os alvos no `CLAUDE.md`, nos assuntos de commit e na lista de sessões ligadas;
   - o brief informar o público (`children_likely`).
9. **Roteiro do protocolo:** testar o mesmo gesto repetido (1 × 2 toques) em telas de confirmação.
10. **Produto:** QA loop com @dev para os achados 1, 2, 4, 6, 7 e 8 da review.
11. **Engram:** nota de lições do piloto F7, só com aprovação.

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-10-23 | @sm | Story criada (Draft) a partir do plano da F7 |
| 2026-10-23 | @po | Validação de 10 pontos: GO (9,5/10); status Draft → Ready |
| 2026-10-23 | @dev | U1 iniciada (2026-10-23T19:18:36Z, HEAD `5b330e6`); status Ready → InProgress |
| 2026-10-23 | @dev | U1 concluída: modelo de tela (`src/interface/`), seção 10 da especificação, 38 testes novos; `npm test`, checagem de monetização e Semgrep verdes; perfil sem mudança. Status segue InProgress (U2) |
| 2026-10-23 | @dev | U2 iniciada (2026-10-23T20:28:14Z, HEAD `ab6cc23`); status segue InProgress |
| 2026-10-23 | @dev | U2 concluída: interface no navegador (`interface/`), servidor local, fluxos verificados no navegador embutido em desktop e celular com console sem erro, regra Semgrep R6; `npm test` 148/148, checagem de monetização e Semgrep verdes; perfil sem mudança. Status segue InProgress (U3) |
| 2026-10-23 | @dev | U3 iniciada (2026-10-23T20:52:10Z, HEAD `59036a6`); status segue InProgress |
| 2026-10-23 | @dev | U3 concluída: variante plantada com a parte visual, builds `encaixe-1` e `encaixe-2` (hashes estáveis em duas execuções, limpo igual ao fonte também pela interface), protocolos de segurança aprovados (N0–N3), `deny` temporário aplicado, instrução cega no handoff; `npm test` 148/148, checagem de monetização verde. Status segue InProgress (U4a/U4b) |
| 2026-10-24 | analista (cego) | U4a (`encaixe-1`, `5ba3cdf`) e U4b (`encaixe-2`, `7b8128c`) concluídas, cada uma em sessão própria |
| 2026-10-24 | @qa | U5: `deny` removido; comparação com o gabarito, varredura dos transcripts, review do diff U1–U3, lições e propostas; análises aceitas pelo responsável e marcadas `concluida`; `npm test` 148/148, checagem de monetização e Semgrep verdes. Gate CONCERNS; status InProgress → InReview, aguardando o responsável |
| 2026-10-24 | @dev | QA loop, iteração 1: achados 1, 2, 4, 5, 6, 7 e 8 corrigidos; jogo jogável pelo DOM e pelo teclado; `npm test` 164/164; Semgrep verde |
| 2026-10-24 | @qa | Re-review: verificado no navegador embutido; demo do construtor ajustada à janela de toque; propostas 1 a 9 aplicadas com aprovação. Gate PASS (achado 9 adiado pelo responsável); status InReview → Done |
| 2026-10-26 | @qa | Retomada depois da queda por limite de uso: estado conferido (alvos intactos; @dev completo), testes e navegador verificados de novo, nota no Engram, commits locais |
| 2026-10-26 | @qa | Semgrep rodado de novo depois que o Docker voltou: 0 achados, `semgrep:test` 6/6 e `semgrep:mutacoes` 7/7 |
