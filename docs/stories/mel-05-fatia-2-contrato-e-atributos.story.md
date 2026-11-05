# Story MEL-05, fatia 2 — bloco `contrato`, `atributos` obrigatórios e coerência cruzada nos mapas

**Status:** InProgress — desde 2026-11-05 (@dev): commit 1 do PR-A entregue (F2-AC18 a F2-AC20, F2-AC21 (a)–(d)); faltam os commits 2 a 8. Antes: Ready — validação @po de 2026-11-04: **GO condicional, 9,5/10** (ver "Validação @po"). Antes: Draft, criada pelo @sm em 2026-11-04 (unidade CRAFT). A transição Ready → InProgress é do @dev. **O que pode começar já:** o commit 1 (auditoria do GhidraMCP, runbook, guia sem a matriz e ponto 8, F2-AC18 a F2-AC21 (a)–(d)), que não depende de P1 a P4. **O que espera:** a edição dos mapas (P1, P2), `recurso`, C11 e `contexto_execucao` (P3, L4), os blocos `contrato` e a matriz (P4). A revalidação do AC17 da fatia 1 foi feita (P5 cumprida; story-mãe atualizada).
**Workflow:** SDC, ciclo completo (@sm → @po → @dev → @qa) · **Origem:** fatia 2 do [ADR-0001](../adr/ADR-0001-contratos-integracoes-mel-05.md) §2a, §2d, §2e, §2f, com o [adendo 1](../adr/ADR-0001-adendo-1-efeitos-e-conteudo-do-alvo.md) (Aceito em 2026-11-04) §3 a §5 · **Pacote:** MEL-05 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §6 · **Decisões:** ADR-0001 §6 e §7; adendo 1, DA-1 a DA-19 (decisões do responsável de 2026-11-04, também em `docs/handoffs/2026-11-04-craft-melhorias.md` §1 e §1.1) · **Story-mãe:** [`mel-05-contratos-integracoes.story.md`](mel-05-contratos-integracoes.story.md) (fatia 1 entregue e mesclada; esta story não a edita)
**Complexidade:** STANDARD no desenho, **G** na entrega (estimativa do @sm; o plano e a tabela da story-mãe davam P para a fatia 2, antes do adendo — ver "Estimativa") · **Dependências:** fatia 1 (módulo `scripts/integracoes/verificar-integracoes.mjs` no `main`, PR #12, `7d48dd1`); ADR-0001 e adendo 1 aceitos; aprovação explícita do responsável para editar os mapas (P1); conferência da P-U5 (P2); fatia 2b é independente (outra story, sem ordem obrigatória)

## Story

**Como** responsável pelo laboratório,
**quero** que cada mapa de níveis declare o seu contrato (origem, catálogo, auditoria, clientes) e, para cada uma das 200 tools, o que ela faz e se o resultado dela traz conteúdo do alvo, e que o verificador confira a coerência disso com o nível,
**para** que uma reclassificação incoerente de nível acenda um alerta na CI, que a regra "alvo analisado é dado, não instrução" (`CLAUDE.md:28`) tenha um fato registrado por tool, e que a matriz cliente/provider e a auditoria do GhidraMCP tenham um lugar único e conferido.

## Contexto

A fatia 1 entregou o verificador estático (`verificar-integracoes.mjs`) com oito pontos. Ele não lê `contrato` nem `atributos` e não tem categoria de aviso (adendo §4). O ADR §2a escolheu a alternativa A2: os mapas mantêm `ferramentas: {tool: nivel}` e ganham dois blocos que o gate ignora (ele só lê `ferramentas`, `versao`/`rea_version` e `niveis`; `rea-gate.mjs:80,84,293`). O adendo 1 acrescentou `efeitos` e `conteudo_do_alvo` por tool, tornou `atributos` obrigatório nas 200 tools (DA-12), fixou as regras C1 a C11 (DA-13, DA-14), mandou a matriz cliente/provider para `contrato.clientes`, impressa pelo verificador e conferida no guia (DA-7, DA-8, DA-15), e moveu a auditoria do GhidraMCP para `docs/seguranca/` (DA-6, DA-16).

**Aplicação das decisões:** esta story só carrega o que o ADR e o adendo dizem. O que as decisões implicam e as fontes não dizem está em "Lacunas das fontes"; nada ali foi decidido pelo @sm.

## Escopo

**Dentro:**

1. **Bloco `contrato`** nos dois mapas (`rea-niveis.json`, `ghidra-niveis.json`), no formato do ADR §2a: `schema`, `servidor`, `origem`, `catalogo`, `auditoria`, `recurso_padrao`, `clientes`. Os aliases `rea_version` e `versao` continuam e continuam conferidos (pontos 4 e 5 da fatia 1).
2. **`atributos` obrigatório nas 200 tools** (170 do REA: N0 36, N1 92, N2 13, N3 5, N4a 18, N4b 6; 30 do Ghidra), cada uma com `efeitos` (vocabulário fechado de 8 valores), `conteudo_do_alvo` (booleano, nunca omitido), `recurso`, `contexto_execucao` (campo só declarado). `familia` é opcional e **não é preenchida** (DA-3).
3. **Verificador** exige tudo isso e aplica C1 a C11: C1 a C8 e C11 reprovam; C9 e C10 são **aviso** (categoria nova no módulo: impresso, fora do código de saída).
4. **Matriz cliente/provider**: estado inicial do ADR §2e em `contrato.clientes`; impressa pelo verificador; cada linha conferida em `docs/guia-rea.md` (contrato `documentação`).
5. **Auditoria do GhidraMCP** movida para `docs/seguranca/auditoria-ghidramcp-2.0.md`; runbook e guia apontam para ela; o ponto 8 do verificador passa a conferir a auditoria (**substitui o AC17 da fatia 1**).
6. **Preenchimento e revisão dos 200 registros** em lotes (ver "Plano de lotes"), com aprovação do responsável e amostragem do @qa.

**Fora (não faz):**

- Não muda `rea-gate.mjs`, `cli-gate.mjs`, `.claude/settings.json`, `.mcp.json`, nenhum `00-seguranca.md` (registros) nem o modelo `registros/_modelos/00-seguranca.md`. O gate ignora os blocos novos (AC23).
- Não aplica `familia` da U5 (DA-3) e não filtra tool por perfil.
- Não cria hook de proveniência nem ledger de obrigações (DA-1: opções B e C ficam como ideias, adendo §7).
- Não executa o REA nem o Ghidra, não lê o catálogo real do pacote (`mcp doctor`, `tools/list`: ADR R6), não usa rede, não lê `alvos/`, `saidas/` nem `registros/<slug>/`.
- Não transforma `efeitos` em autorização persistente (adendo §8): N3 e N4b continuam confirmando a cada chamada, pelo gate, sem mudança.
- Não afrouxa o gate nem altera `niveis_aprovados` ou `status` de registro algum (`CLAUDE.md:39`).
- Não adiciona `usa_rede`, `pode_descartar_dados` nem outro valor de efeito (DA-10; cada valor novo exige adendo).
- Não implementa adaptador do Codex nem promete enforcement nele (ADR linha 160).
- Documentação do produto editada: **somente** `docs/runbook-prereqs-nativo.md`, `docs/guia-rea.md` e o arquivo novo `docs/seguranca/auditoria-ghidramcp-2.0.md`. Artefatos de processo (esta story, `docs/handoffs/`, `docs/plano-de-execucao.md`, `docs/planos/`) à parte.

## Pré-condições para o @dev

Nenhuma é decidida aqui. O @dev não começa o item correspondente sem elas registradas no Change Log, com data e a frase do responsável quando for o caso.

- **P1 — aprovação explícita do responsável para editar os mapas.** Os dois mapas são lidos pelo gate (caminho de segurança). Sem o "sim" na conversa, o @dev **não edita** `rea-niveis.json` nem `ghidra-niveis.json`. O código do verificador, os testes, a auditoria nova, o runbook e o guia **não** dependem de P1 e podem avançar antes.
- **P2 — conferência prévia da P-U5.** Antes de editar `rea-niveis.json`, ler `docs/planos/2026-11-01-perfis-alvo.md` (linhas 82 e 101: a U5 pode pôr família de tool no mapa) e registrar o estado da U4 e da U5 naquele dia. Em 2026-11-01, a U4 aguardava alvo novo e a U5 era condicional, sem início (**não verificado** depois dessa data). Se a U5 tiver mudado o mapa, quem chegou primeiro registra e o outro adapta (ADR §2d; plano de evolução linha 69).
- **P3 — vocabulário de `recurso` e tabela de coerência C11 fechados.** O adendo (§3.1, última frase) diz que a tabela de pares "depende da lista de valores de `recurso`, que a fatia 2 fecha". Ninguém a fechou ainda: ver lacuna L1. Sem ela, o @dev não codifica C11 nem preenche `recurso`.
- **P4 — respostas às lacunas L2 e L3** (representação da matriz e `catalogo.digest` do Ghidra), antes dos blocos `contrato` e antes da matriz em prosa no guia (F2-AC17 (c): as linhas do guia têm de usar os mesmos valores do mapa).
- **P3 inclui a L4** (obrigatoriedade e valores de `recurso`, `contexto_execucao` e o papel de `recurso_padrao`): sem ela, os lotes não começam, porque cada registro leva esses campos.
- **P5 — validação @po com GO** e a revalidação do AC17 da fatia 1 (próxima seção). *Cumprida em 2026-11-04 pelo @po (GO condicional; story-mãe atualizada: AC17, AC18 (a), AC14, tabela de fatias, descrição da fatia 2 e R-estimativa).*
- **P6 — um PR por story.** A fatia 2b (`mel-05-fatia-2b-documentacao-metodo.story.md`) altera `registros/_modelos/` e `CLAUDE.md`, que o F2-AC22 proíbe aqui; as duas não entram no mesmo PR, e cada diff se mede contra a base do próprio PR (`[AUTO-DECISION]` do @po: o F2-AC22 e o F2b-AC14 são listas fechadas e se contradizem num diff único).

## AC17 substituído (fatia 1) — revalidação do @po obrigatória

O adendo 1 (§5, item 4) reescreve o ponto 8 do verificador. Isso **substitui o AC17** da story-mãe e mexe em outros trechos dela. O @sm não edita a story-mãe; o @po atualiza ao validar esta story. Impacto na story-mãe (`mel-05-contratos-integracoes.story.md`):

| Trecho da story-mãe | Hoje | Passa a valer |
|---|---|---|
| **AC17** | A referência `GhidraMCP@<ref>` do **runbook** é prefixo do commit do `.mcp.json`; runbook sem referência reprova | **Substituído por F2-AC21.** A conferência passa para a auditoria nova; no runbook, qualquer `GhidraMCP@` reprova |
| **AC18 (a)** | O runbook registra o GhidraMCP **mantendo** a forma `GhidraMCP@<commit>` para o ponto 8 ter o que conferir | **Revogado nesse ponto.** O registro com a forma `GhidraMCP@<commit>` mora só na auditoria nova (F2-AC18, F2-AC19) |
| **AC14** | Lista fechada de leitura: `ARQUIVOS_FIXOS` mais os mapas | Ampliada: mais `AUDITORIA_GHIDRA` e os arquivos `docs/seguranca/*.md` apontados por `contrato.auditoria` (F2-AC4, F2-AC21) |
| **AC16** | O guia cita cada servidor e o mapa dele | **Inalterado**; ganha a conferência da matriz (F2-AC17), que é um AC novo, não uma troca |
| Linha 31 e §"Fatia 2" (linha 135) | "`atributos` opcional", estimativa P | `atributos` **obrigatório** (DA-12); estimativa G |
| "Dev Notes" e tasks da fatia 1 | Citam o runbook como lugar do commit | Histórico; sem reescrever |

O @po também confere se o File List e a DoD da story-mãe precisam citar esta story. Os testes da fatia 1 que levam o rótulo "AC17" mudam de alvo (F2-AC21).

## Critérios de aceitação

Numeração `F2-ACn`, para não colidir com a da story-mãe (AC1 a AC18). **Origem:** **ADR** = ADR-0001 (seção); **AD** = adendo 1 (seção); **DA** = decisão do adendo; **C** = regra C1–C11; **H** = handoff. Testes do verificador usam fixture em pasta temporária (helper `projeto(t, trocas)`, `verificar-integracoes.test.mjs:59`), com a mensagem afirmada (AC9 da fatia 1: contrato, arquivo, campo e o que falta, em uma linha).

### Bloco `contrato` (ADR §2a)

- [ ] **F2-AC1** — Dado um mapa sem `contrato`, com `contrato` que não é objeto, com `schema` diferente de `1`, com `servidor` diferente do nome derivado do arquivo (`<servidor>-niveis.json`), ou sem alguma das chaves `origem`, `catalogo`, `auditoria`, `recurso_padrao`, `clientes`, quando o verificador roda, então reprova (contrato `mapa`) citando o arquivo, o campo (`contrato`, `contrato.schema`, `contrato.servidor` ou a chave) e o que falta. Um teste por chave. Dado `rea_version` ou `versao` removido, reprova (os aliases continuam obrigatórios, ADR §2a "Consequências"). *Origem:* ADR §2a; AD §5.1, DA-12.
- [ ] **F2-AC2** — (origem e versão) Dado `contrato.origem.tipo` fora de `npm` e `git`, reprova. Dado `tipo: "npm"`: `pacote` é `rea-agents` e `versao` é igual a `rea_version`, a `package.json` (`dependencies`) e ao lock (reaproveita o ponto 4); divergência reprova citando as quatro leituras. Dado `tipo: "git"`: `url` e `commit` (completo, 40 hexadecimais) estão presentes, o `commit` é igual ao dos `args` do `.mcp.json` (`git+<url>@<commit>`), e o commit abreviado do alias `versao` continua prefixo dele (ponto 5); commit abreviado no lugar do completo reprova; divergência cita os dois commits (abreviados nas mensagens). *Origem:* ADR §2a (`origem.tipo`); AD §5.1.
- [ ] **F2-AC3** — (catálogo, só estático) Dado `contrato.catalogo.ferramentas` diferente do número de chaves de `ferramentas`, reprova citando os dois números. Dado `catalogo.digest` ausente, fora de 64 hexadecimais, ou, no mapa que tem `catalog_digest` (`rea-niveis.json:3`), diferente dele, reprova. Regra do `digest` do Ghidra: **pendente da lacuna L3**. O verificador **não** compara com o catálogo real do pacote (ADR R6). *Origem:* ADR §2a (`catalogo`), R6.
- [ ] **F2-AC4** — (auditoria) Dado `contrato.auditoria` que não casa com `docs/seguranca/<nome>.md` (`<nome>` em `[A-Za-z0-9._-]+`, sem `..`, sem barra extra, sem caminho absoluto, sem `alvos/` nem `saidas/`), reprova sem tentar ler. Dado caminho válido de arquivo inexistente ou ilegível, reprova com motivo "ausente" ou "ilegível" (`motivoErro`, `verificar-integracoes.mjs:60`). No `ghidra`, `contrato.auditoria` é exatamente `docs/seguranca/auditoria-ghidramcp-2.0.md` (F2-AC21 (e)); no `rea`, `docs/seguranca/auditoria-rea-6.4.0.md`. Testes: caminho com `..`, absoluto, `alvos/x.md`, inexistente (reprovam); existente (aprova). *Origem:* ADR §2a, linha 86; AD §5.4; AC14 da fatia 1.
- [ ] **F2-AC5** — (`recurso_padrao`) Dado `contrato.recurso_padrao` fora do vocabulário fechado de `recurso` (P3), reprova citando o valor. *Origem:* ADR §2a; AD §3.1 (lista que a fatia 2 fecha).
- [ ] **F2-AC6** — (`clientes`) Dado `contrato.clientes` ausente, vazio ou que não é lista, reprova. Dado item sem `cliente`, `caminho`, `estado` ou `evidencia`, ou com `cliente` ou `evidencia` vazio, ou `caminho` fora de `mcp` e `cli`, ou `estado` fora do vocabulário (ver L2), ou par (`cliente`, `caminho`) repetido, reprova citando o item. No repositório real, os dois mapas carregam o estado inicial do ADR §2e, que o responsável aceitou como está (DA-7): REA — Claude Code/MCP e Claude Code/CLI testados (hook), linha do provider Ghidra "a confirmar", Codex "sem adaptador"; Ghidra — Claude Code/MCP testado, Codex "sem adaptador". A representação exata está sujeita a L2. *Origem:* ADR §2a, §2e; AD §5.3; DA-7.

### `atributos` por tool (AD §3, DA-10, DA-11, DA-12)

- [ ] **F2-AC7** — (C1, chaves) Dado mapa sem `atributos`, com `atributos` que não é objeto, com tool de `ferramentas` sem entrada, ou com entrada em `atributos` que não existe em `ferramentas`, quando o verificador roda, então reprova citando mapa e tool. Dado entrada com nome herdado (`constructor`, `__proto__`, `toString`), reprova (`Object.hasOwn`, como no AC5 da fatia 1). Dado entrada que não é objeto, reprova. Testes com os dois mapas de fixture e um caso com 200 tools reais lidas do repositório (contagem 170 + 30). *Origem:* C1; ADR §2a (linha 100); DA-12.
- [ ] **F2-AC8** — (`efeitos`) Dado `efeitos` ausente, que não é lista, vazio, com valor fora dos 8 (`so_leitura`, `altera_sessao`, `escreve_em_disco`, `lanca_processo`, `executa_codigo_do_alvo`, `observa_execucao`, `usa_dispositivo`, `altera_dispositivo`) ou com valor repetido, reprova citando mapa, tool e valor. Dado `so_leitura` junto com outro valor, reprova (C2). Dado `usa_rede` ou `pode_descartar_dados`, reprova como valor fora da lista (DA-10). Teste por cenário. *Origem:* C1, C2; AD §3.1; DA-10.
- [ ] **F2-AC9** — (`conteudo_do_alvo`) Dado `conteudo_do_alvo` ausente, `null`, texto (`"true"`), número ou lista, reprova citando mapa e tool; `true` e `false` aprovam. O campo não se deduz do nível: um fixture N0 com `true` e um N4b com `false` não geram achado só por isso. *Origem:* C1; AD §3.2.
- [ ] **F2-AC10** — (`recurso`, `contexto_execucao`, `familia`) Dado `recurso` ausente ou fora do vocabulário (P3), reprova. Dado `contexto_execucao` ausente ou inválido (L4), reprova. **Obrigatoriedade e lista fechada dos dois campos sujeitas à resposta da L4** (o adendo, C1, só torna obrigatórios `efeitos` e `conteudo_do_alvo`; o ADR §2a diz que `contexto_execucao` é "só declarado"): se a resposta for outra, o @po reescreve este AC antes do commit 8. Dado `familia` presente, a única conferência é string não vazia (ADR §2d); ausente não gera achado. **No repositório real, nenhuma tool tem `familia`** (DA-3): verificação do @qa por contagem (0), registrada na story, e não um teste permanente, porque a U5 pode preenchê-la depois com aprovação. *Origem:* ADR §2a, §2d; AD §3, DA-3; handoff §1.

### Coerência cruzada (AD §4)

Regra comum: conjunto de **níveis admitidos**, não "nível mínimo" (AD §4, ressalva de desenho). A mensagem de cada achado cita mapa, tool, nível, o efeito e o conjunto admitido.

- [ ] **F2-AC11** — (C3 a C6) Teste por regra, com um caso que aprova e ao menos um que reprova: `executa_codigo_do_alvo` só em {N3, N4b} (C3); `observa_execucao` só em {N2, N3} (C4); `usa_dispositivo` só em {N4a, N4b} (C5); `altera_dispositivo` só em {N4b} **e** exige `usa_dispositivo` na mesma lista (C6; sem `usa_dispositivo` reprova mesmo em N4b). Em particular, `usa_dispositivo` em N3 reprova (N4a não fica "acima" de N3). *Origem:* C3 a C6; DA-13.
- [ ] **F2-AC12** — (C7 e C8) C7, inversa: tool N3 declara `executa_codigo_do_alvo` **ou** `lanca_processo` (ao menos um; leitura em L6); tool N4b declara `altera_dispositivo`; sem isso, reprova. C8: tool N0 ou N1 que declare `executa_codigo_do_alvo`, `observa_execucao` ou `usa_dispositivo` reprova. Um caso que aprova e um que reprova por regra. *Origem:* C7, C8; DA-13.
- [ ] **F2-AC13** — (C11) Dada a tabela de pares `efeitos` × `recurso` fechada em P3, o verificador reprova qualquer par incoerente. Mínimo que o adendo já fixa: `usa_dispositivo` só com `recurso` "dispositivo", e `recurso` "dispositivo" exige `usa_dispositivo`. Um teste por linha da tabela (par que aprova e par que reprova). *Origem:* C11; DA-11; AD §3.1.
- [ ] **F2-AC14** — (C9 e C10, avisos) O módulo ganha a **categoria de aviso**: lista separada de achados, com a mesma forma `{contrato, arquivo, campo, mensagem}`, impressa com prefixo próprio ("aviso"), que **nunca** entra no código de saída e **nunca** é omitida da saída. C9: `lanca_processo` sem `executa_codigo_do_alvo`, em qualquer nível, gera aviso pedindo revisão humana. C10: tool de N1 a N4b com `conteudo_do_alvo: false` gera aviso pedindo justificativa (onde registrá-la: L5). Testes: (1) fixture só com avisos → código de saída 0 e as linhas de aviso na saída; (2) fixture com achado e aviso → código 1 e os dois impressos; (3) fixture limpa → nenhuma linha de aviso. A compatibilidade é obrigatória: `verificarIntegracoes(raiz)` continua devolvendo `Achado[]` (os testes e o componente da fatia 1 dependem disso); a forma da segunda lista é do @dev (por exemplo, uma função exportada nova que devolve `{achados, avisos, matriz}`). *Origem:* C9, C10; DA-14; AD §4.
- [ ] **F2-AC15** — (limite da coerência) Dada qualquer execução, aprovada ou reprovada, a saída traz a frase de que coerência não é correção: uma tool perigosa marcada `so_leitura` e N0 passa em todas as regras, e só a auditoria humana pega esse erro. O verificador também diz que não corrige nada. Teste afirma o texto-chave nos dois casos. *Origem:* AD §4 "Limites"; ADR R2; R8 do adendo.
- [ ] **F2-AC16** — (componente `integracoes`) O componente em `scripts/verificar/verificar.mjs:254` continua `ok: true` com avisos e inclui no `detalhe` o número de avisos e as linhas deles; com achado, `ok: false` como hoje. Teste no `verificar.test.mjs` (aviso não reprova o componente; achado reprova), e o JSON do agregador continua lendo o componente (`agregar-ci.test.mjs` verde sem mudança). *Origem:* DA-14; AC10 e AC12 da fatia 1.

### Matriz cliente/provider (AD §5.3; DA-7, DA-8, DA-15)

- [ ] **F2-AC17** — (a) Em **toda** execução, também sem achados, o verificador imprime a matriz (cliente, servidor, caminho, estado, evidência) montada de `contrato.clientes` dos mapas, em ordem determinística (servidor, cliente, caminho). Teste: saída de fixture com dois mapas contém uma linha por item. (b) Cada linha precisa aparecer no `docs/guia-rea.md`: uma linha de texto do guia que contenha, juntos, cliente, servidor, caminho e estado como estão no mapa, **cada um como palavra inteira** (delimitado, não como pedaço de outra palavra: `testado` não casa dentro de `nao-testado`, `rea` não casa dentro de `area`). Teste a mais: mapa com `testado` e guia com a mesma linha em `nao-testado` reprova como estado divergente. Linha presente → aprova; linha ausente → reprova (contrato `documentação`, no estilo de `conferirGuia`, `verificar-integracoes.mjs:321-331`); **estado divergente** entre mapa e guia (a linha tem cliente, servidor e caminho, mas outro estado) → reprova citando o guia, a linha e os dois estados. (c) No repositório real, o guia ganha a matriz em prosa, com o estado inicial aceito (DA-8), e o verificador aprova. A prosa entra **depois da resposta à L2** (P4), no commit dos blocos `contrato` ou no commit 8, nunca no commit 1: antes da L2 não se sabe que valores de `caminho` e `estado` o guia deve repetir. *Origem:* AD §5.3; DA-7, DA-8, DA-15; aceite P4 do plano ("inventário **e documentação**").

### Auditoria do GhidraMCP e ponto 8 (AD §5.4; DA-6, DA-16) — substitui o AC17 da fatia 1

- [x] **F2-AC18** — *(2026-11-05, commit 1: arquivo criado com cabeçalho, escopo e método, origem e integridade, registro fixado e instalação; referência com o commit completo igual ao do `.mcp.json`; `verificar.mjs --so integracoes` aprova o repositório real; caso (7) e "(b)" no teste.)* (arquivo novo) Existe `docs/seguranca/auditoria-ghidramcp-2.0.md`, no padrão de `docs/seguranca/auditoria-rea-6.4.0.md` (cabeçalho com data, método e veredito; escopo e método; origem e integridade). Recebe o registro hoje espalhado no runbook (`runbook-prereqs-nativo.md:67` e `:95`; também o registro fixado das linhas 74 a 91), **sem reescrever o juízo** da auditoria (data de 13/10/2026, tag `2.0`, commit `1e98025`, Apache-2.0, loopback, sem `exec`, sem rede de saída no plugin, clone em `ferramentas/ghidramcp/`, instalação de 14/10/2026). É o **único** arquivo com a forma `GhidraMCP@<commit>`, com o commit completo igual ao dos `args` do `.mcp.json`. Teste: o verificador aprova o repositório real e o arquivo contém ao menos uma referência `GhidraMCP@` válida (coberto por F2-AC21 (b)). *Origem:* AD §5.4, DA-6, DA-16.
- [x] **F2-AC19** — *(2026-11-05, commit 1: linhas 67 e 95 viraram apontamento, bloco JSON com o registro saiu, a linha 74 diz que o verificador confere a auditoria; `grep -nE "GhidraMCP@|[0-9a-f]{40}"` no runbook só acha o SHA-256 do Ghidra (64 hex, linha 40); abreviados `1e98025` e `b92a651` ficaram, conforme Q5.)* (runbook) Em `docs/runbook-prereqs-nativo.md`, as linhas 67 e 95 viram apontamento para a auditoria nova; o trecho de registro com `GhidraMCP@…` (hoje linhas 76 a 91, referência na 82) sai; o runbook passa a remeter ao `.mcp.json` e à auditoria; o texto da linha 74, que hoje diz que o verificador confere as referências "neste runbook", é reescrito para dizer que ele confere a auditoria. O runbook cita o caminho `docs/seguranca/auditoria-ghidramcp-2.0.md` e **não contém** `GhidraMCP@` **nem o commit completo** de 40 hexadecimais (hoje na linha 74, `1e980252…51a7`), que passa a morar só na auditoria (DA-16: "o commit fica **só** nela"). Menções históricas ao commit **abreviado** sem a forma `GhidraMCP@` (`1e98025` nas linhas 98, 102 e 129, `b92a651` nas linhas 98 e 102; também `guia-rea.md:77`) podem ficar, como histórico e rótulo de versão, pela leitura do @po do adendo §5.4, que só prende a forma `GhidraMCP@<commit>`; **a confirmar pelo responsável** (pergunta Q5 em "Validação @po"). Se ele pedir a leitura estrita, também saem, sem mudar o ponto 8. *Origem:* AD §5.4; DA-16.
- [x] **F2-AC20** — *(2026-11-05, commit 1: linha 77 aponta `.mcp.json` para o registro e a auditoria nova; linha 80 lista as duas auditorias; `ghidra` e `ghidra-niveis.json` continuam citados (AC16 verde); sem matriz.)* (guia) `docs/guia-rea.md:77` deixa de dizer "registro e auditoria em `docs/runbook-prereqs-nativo.md`" e passa a apontar o `.mcp.json` para o registro e `docs/seguranca/auditoria-ghidramcp-2.0.md` para a auditoria; a linha 80 (auditoria da versão) pode listar as duas auditorias. O guia continua citando `ghidra` e `ghidra-niveis.json` (AC16 da fatia 1). *Origem:* AD §5.4.
- [ ] **F2-AC21** — *(2026-11-05, commit 1: (a) a (d) entregues, com os ajustes de teste e os casos novos (1) a (5) e (7); `node --test scripts/integracoes/` 50/50. Caixa fica aberta até o commit 8, que entrega (e) e o caso (6).)* (ponto 8, **substitui o AC17**) O ponto 8 do verificador (`conferirRunbook`, `verificar-integracoes.mjs:333-354`) passa a valer assim, com os casos de teste abaixo:
  - (a) constante nova `AUDITORIA_GHIDRA` incluída em `ARQUIVOS_FIXOS` (`:45`); a lista continua fechada (AC14);
  - (b) as regras de hoje valem para a auditoria: sem nenhuma referência `GhidraMCP@<ref>` reprova (fail-closed, P-6); cada referência fora de 7 a 40 hexadecimais ou que não seja prefixo do commit do `.mcp.json` reprova (QA-4);
  - (c) no runbook, **qualquer** `GhidraMCP@` reprova, com mensagem que diz que o commit só pode estar na auditoria; o runbook sem o caminho da auditoria também reprova;
  - (d) auditoria ausente ou ilegível reprova com motivo "ausente" ou "ilegível" (`motivoErro`, `:60`);
  - (e) `contrato.auditoria` do mapa `ghidra` aponta para `docs/seguranca/auditoria-ghidramcp-2.0.md` e o arquivo existe. **Entra no commit 8, com o F2-AC4, e não no commit 1:** o bloco `contrato` só existe depois da P1 e dos lotes, e exigir (e) no commit 1 reprovaria o repositório real e a CI. O caso novo (6) abaixo vai junto. No commit 1, o ponto 8 cobre (a) a (d), e o R10 continua cumprido (o commit que move a referência para a auditoria é o mesmo que muda o ponto 8 e os testes).
  - *Testes (ajustes):* o fixture padrão (`verificar-integracoes.test.mjs:55`) passa a ter a referência na auditoria e o runbook sem `GhidraMCP@`; os casos do AC17 (`:442-461`) e do QA-2 (`:569-577`) passam a apontar para a auditoria; a asserção do QA-3 que cita o runbook (`:613`) passa a citar a auditoria; os fixtures das linhas 476 (AC9) e 652 (QA-7) são revistos; o teste de lista fechada do AC14 (`:519`) inclui a auditoria.
  - *Casos novos:* (1) runbook com `GhidraMCP@` reprova, mesmo com hexadecimal válido; (2) runbook sem apontamento para a auditoria reprova; (3) auditoria ausente reprova; (4) auditoria com referência `GhidraMCP@2.0` reprova citando o commit esperado; (5) auditoria sem referência reprova; (6) `contrato.auditoria` apontando para arquivo inexistente reprova; (7) fixture padrão aprova.
  - *Mensagens:* contrato `documentação`, arquivo, campo e o que falta (AC9 da fatia 1).
  - *Origem:* AD §5.4 (a) a (e) e "Testes do ponto 8"; DA-16; R10 do adendo (ajustar o ponto 8, os testes, o runbook e a auditoria **no mesmo commit**).

### Limites e regressão

- [ ] **F2-AC22** — (nada além do previsto) Dada a entrega, `git diff --name-only <base>` **não lista** `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `.claude/settings.json`, `.mcp.json`, `registros/_modelos/` (inteiro, esta fatia não o toca) nem `registros/<slug>/00-seguranca.md`. Além do verificador, dos mapas e dos testes (File List), a documentação do produto no diff é **somente** o runbook, o guia e a auditoria nova. Qualquer outro arquivo de `docs/` reprova o AC, exceto artefatos de processo. Os arquivos de teste dos gates (`rea-gate.test.mjs`, `cli-gate.test.mjs`) também não mudam. O diff se mede contra a base do PR desta story, que não leva a fatia 2b (P6). *Origem:* AD §5 "Limites"; handoff §1.
- [ ] **F2-AC23** — (o gate ignora os blocos novos) Dados os mapas editados, então: (1) retirados `contrato` e `atributos`, o restante de cada mapa é **igual** ao do `main` (comparação profunda de `ferramentas`, `niveis`, `rea_version`, `catalog_digest`, `servidor`, `versao`, `nota`), registrada como evidência do @qa com o comando; (2) um teste do verificador, no padrão do oráculo do AC8 (gate em subprocesso, raiz temporária, `verificar-integracoes.test.mjs:358`), roda o gate com o mapa real **com** e **sem** os blocos e obtém a mesma decisão (atenção: o gate lê o mapa da **própria pasta**, não de `CLAUDE_PROJECT_DIR`, `rea-gate.mjs:28,67`; por isso o teste copia o `rea-gate.mjs` e a variante do mapa para `.claude/hooks/` da raiz temporária e roda a cópia; a pasta `.claude/hooks/` real nunca é escrita) para uma tool de cada nível (N0, N1, N2, N3, N4a, N4b) e para uma tool fora do mapa (continua negada); (3) `npm test` completo, inclusive `rea-gate.test.mjs` e `cli-gate.test.mjs`, verde **sem alterar** esses testes. Atenção: um JSON inválido num mapa faz o gate negar tudo (fail-closed); o teste (2) cobre a leitura dos mapas reais. *Origem:* AD §5 e §9 "Compatibilidade"; ADR R3, R5; limite desta fatia.
- [ ] **F2-AC24** — (somente leitura) O módulo continua sem escrever, sem rede, sem executar o REA ou o Ghidra e sem ler `alvos/`, `saidas/` nem `registros/<slug>/`. A lista fechada de leitura do AC14 da fatia 1 passa a ser `ARQUIVOS_FIXOS` (com `AUDITORIA_GHIDRA`) mais os mapas mais os `docs/seguranca/*.md` validados por padrão (F2-AC4); o teste de hash antes e depois e o teste "sem `child_process`/rede" continuam. *Origem:* AC14 da fatia 1; ADR §2f "Não faz" e R6.

### Preenchimento dos 200 registros (processo)

- [ ] **F2-AC25** — (aprovação e amostragem) Para cada lote do "Plano de lotes": (a) o @dev **propõe** `efeitos`, `conteudo_do_alvo`, `recurso` e `contexto_execucao` tool a tool, baseado na descrição e no código da tool (fontes em Dev Notes), **não no nome**, numa tabela de revisão (tool, nível, valores propostos, uma linha de fundamento) registrada no handoff da unidade; (b) o responsável aprova **item a item ou por lote**, na conversa, e a aprovação fica no Change Log com data e lote; (c) só depois da aprovação o lote entra no mapa; (d) o @qa **amostra**: revisa a tabela dos lotes de N2, N3, N4a, N4b e dos efeitos diferentes de `so_leitura` por inteiro, e uma amostra dos lotes de N0 e N1 (tamanho em L7), registrando no gate as tools sorteadas e os desvios. Rascunho por nível sem revisão tool a tool não é aceito (AD §3.3; R7). A classificação é trabalho de **auditoria humana**; o verificador só confere forma e coerência (ADR R2). Tool cuja descrição não permite decidir fica **sem lote** e vai ao responsável (não se chuta valor). *Origem:* AD §3.3, §4 "Limites"; R2 e R7; DA-12; pedido do responsável.
- [ ] **F2-AC26** — (qualidade) `npm test` verde (inclusive gitleaks e pre-commit, com Docker ligado), `npm run lint` e `npm run tipos` (o módulo está em `tsconfig.json` `files`), `npm run verificar` completo, e o `resultado` da CI do PR verde. O verificador aprova o repositório real: zero achados, avisos impressos (a contagem de avisos do repositório real vai para o handoff). Mutação manual pelo @qa em pelo menos C3, C6, C7, C11, a categoria de aviso e o ponto 8, no mesmo molde do gate da fatia 1. *Origem:* handoff da E3-1 §4; story-mãe AC15.

## Rastreabilidade AC → adendo

| AC | Adendo 1 | ADR-0001 | Decisão |
|---|---|---|---|
| F2-AC1 a F2-AC6 | §5.1, §5.3 | §2a (linhas 80-99), §2d, §2e | DA-7, DA-12 |
| F2-AC7 a F2-AC10 | §3, §3.1 a §3.3 | §2a (linhas 90-100), §2d | DA-3, DA-10, DA-11, DA-12 |
| F2-AC11 a F2-AC13 | §4 (C2 a C8, C11) | — | DA-11, DA-13 |
| F2-AC14 a F2-AC16 | §4 (C9, C10, "O que a fatia 2 acrescenta", "Limites") | — | DA-14 |
| F2-AC17 | §5.3 | §2e | DA-7, DA-8, DA-15 |
| F2-AC18 a F2-AC21 | §5.4 | §2a (linha 86), §6 item 7 | DA-6, DA-16; R10 |
| F2-AC22 a F2-AC24 | §5 "Limites", §9 | §2f "Não faz", R3, R6 | DA-9 (cumprida) |
| F2-AC25, F2-AC26 | §3.3, §4 "Limites", §9 (R7, R8) | R2 | DA-12 |

**Aceite P4 do plano** ("inventário e documentação indicam a matriz cliente/provider"): fecha-se aqui com F2-AC6 e F2-AC17. **P1 e P2** do plano (servidor sem classificação e tool desconhecida recusada) já têm a parte estática da fatia 1; F2-AC7 a F2-AC13 reforçam a forma. A parte de gate do P2 continua nas fatias 4a e 4b.

## Plano de lotes (sem criar fatia nova)

Os 200 registros cabem nesta fatia, em seis lotes, **um commit por lote**, depois da aprovação P1. A ordem põe primeiro o que mais pesa: se o vocabulário de 8 valores não descrever alguma tool de N2, N3, N4a ou N4b, a falta aparece antes de 150 registros prontos (um valor novo exige adendo: DA-10). Cada lote tem tabela de revisão, aprovação do responsável e amostragem do @qa (F2-AC25).

| Lote | Conteúdo | Tools | Regras que mais pesam |
|---|---|---|---|
| L-1 | REA, N2 e N3 | 18 (13 + 5) | C3, C4, C7, C9 |
| L-2 | REA, N4a e N4b | 24 (18 + 6) | C5, C6, C7 |
| L-3 | REA, N0 | 36 | C8, C10 (aviso) |
| L-4 | REA, N1, primeira metade em ordem alfabética | 46 | C8, C10, C11 |
| L-5 | REA, N1, segunda metade | 46 | C8, C10, C11 |
| L-6 | Ghidra (30, todas N1) | 30 | C8, C10, C11; distinguir `so_leitura` de `altera_sessao` (renomear e comentar mudam o banco de análise, `ghidra-niveis.json:4`) |

Total: 18 + 24 + 36 + 46 + 46 + 30 = 200. A divisão do N1 em dois lotes é do @sm, para manter cada revisão em torno de 46 itens; o @po pode propor outra. O bloco `contrato` entra com o L-1 (REA) e com o L-6 (Ghidra), ou num commit próprio antes dos lotes; a escolha é do @dev.

**Ordem de commits sugerida (cada commit deixa `npm test` e o componente `integracoes` verdes):**

1. Auditoria nova, runbook, guia (apontamentos da linha 77 e 80, **sem** a matriz) e ponto 8 (a) a (d) com todos os seus testes (F2-AC18 a F2-AC20, F2-AC21 sem o item (e) e sem o caso novo (6)), **no mesmo commit** (R10). Não depende de P1 a P4.
2. Lotes L-1 a L-6 nos mapas (blocos `contrato` e `atributos`), depois de P1 a P4. A matriz em prosa no guia (F2-AC17 (c)) entra com o primeiro bloco `contrato`, ou no commit 8. Nesse intervalo o verificador ainda não exige os blocos, então fica verde, e o gate os ignora (F2-AC23).
3. Regras novas do verificador (F2-AC1 a F2-AC17, F2-AC21 (e) e o caso (6), F2-AC24), os avisos e o componente (F2-AC16), com o fixture `BASE` dos testes (`verificar-integracoes.test.mjs:30-56`) ganhando `contrato` e `atributos` nos dois mapas. Entram por último porque, com C1 obrigatório nas 200 tools, o repositório real só passa quando os seis lotes estão prontos. O @dev pode escrever e testar este código antes dos lotes, com fixtures, e usar a saída parcial no repositório real para conferir as outras regras.

Conferido pelo @po: nenhum dos três passos muda componente, job ou `--so`, então `workflow-ci.test.mjs` (AC11 da fatia 1) e `agregar-ci.test.mjs` (AC12) seguem como estão; o "não executado nunca é verde" (AC12) não é tocado; a lista fechada do AC14 só cresce (F2-AC24).

## Estimativa

**G** (o plano e a story-mãe davam P para a fatia 2; o adendo mudou a natureza). Motivos: 200 registros de auditoria humana, com aprovação e amostragem por lote; onze regras de coerência e uma categoria nova de aviso no módulo; matriz impressa e conferida no guia; mudança de ponto 8 com reescrita de testes da fatia 1; três documentos; e o único trabalho desta fatia que toca arquivos lidos pelo gate (regressão completa e @qa obrigatórios). O código do verificador sozinho seria M; o preenchimento dos 200 registros é o que leva a G. Se o @po preferir, o corte natural é "2a: auditoria + ponto 8 + código do verificador + matriz" e "2c: blocos nos mapas e lotes"; esta story **não** os separa porque o adendo (§5) trata tudo como uma fatia, e porque o verificador só pode exigir os blocos depois dos lotes. A soma das fatias da MEL-05 passa ainda mais do M do plano (R-estimativa da story-mãe); mudar o tamanho do plano é decisão do responsável.

**Avaliação do @po (2026-11-04), recomendação, não decisão.** G é plausível: o código seria M, e o que pesa é o tempo de calendário dos seis lotes com aprovação do responsável. O corte "2a: auditoria + ponto 8 + código do verificador + matriz / 2c: lotes" do @sm **não é o preferível**: o código das regras (C1 obrigatório) não pode entrar antes dos lotes sem reprovar a CI, e fazê-lo entrar "dormente" (só quando o bloco existir) seria regra nova, sem fonte. **Recomendo manter uma story e entregar em dois PRs:** **PR-A** = commit 1 (auditoria, runbook, guia e ponto 8 (a)–(d); P a M; sem dependência de P1 a P4; fecha a DA-6, a DA-16 e o R10 logo); **PR-B** = blocos, lotes, regras, avisos e matriz (G). Cada PR com @qa e CI verde; a story vai a InReview só depois do PR-B. A escolha entre um PR e dois é do responsável (pergunta Q1).

## Riscos

- **R-gate (caminho de segurança).** Editar os mapas pode quebrar o JSON e fazer o gate negar tudo, ou deslocar uma chave de `ferramentas`. Mitigação: edição só com P1; F2-AC23 (igualdade do restante do mapa com o `main` e gate com e sem blocos); regressão completa; @qa.
- **R5 do adendo (P-U5).** Colisão com a U5 no `rea-niveis.json`. Mitigação: P2.
- **R7 do adendo.** O rascunho por nível virar carimbo. Mitigação: F2-AC25 (tabela por tool, aprovação por lote, amostragem do @qa) e o aviso C9.
- **R8 do adendo.** Coerência dar falsa confiança. Mitigação: F2-AC15.
- **R10 do adendo.** Mover o commit do runbook quebrar o AC17 da fatia 1 sem revisão da story. Mitigação: "AC17 substituído", ponto 8 e testes no mesmo commit.
- **R-vocabulário.** Alguma tool não caber nos 8 valores. Mitigação: lotes de maior risco primeiro; valor novo só por adendo.
- **R-tamanho do mapa.** `rea-niveis.json` cresce (ADR linha 207): 170 entradas de atributos. Mitigação: uma tool por linha, `efeitos` em lista inline, para o diff continuar revisável.
- **R-documentação presa ao verificador.** Matriz no guia e referência na auditoria passam a ser conferidas: mudar um estado exige mapa e guia no mesmo commit. Custo aceito (DA-15).
- **R-aviso invisível.** Aviso que ninguém lê. Mitigação: sempre impresso, contado no `detalhe` do componente e levado ao handoff.
- **R6 do ADR.** Classificar por descrição sem ler o catálogo real: a descrição vem de leitura estática (Dev Notes), não de `mcp doctor`.

## Definition of Done

AC F2-AC1 a F2-AC26 marcados com evidência; P1 a P5 registradas no Change Log; seis lotes aprovados pelo responsável e amostrados pelo @qa; `rea-gate.mjs`, `cli-gate.mjs`, `settings.json`, `.mcp.json`, `00-seguranca.md` e o modelo sem diferença contra o `main`; `npm test`, lint, tipos, `npm run verificar` e o `resultado` da CI do PR verdes; @po revalidou o AC17 e os trechos da story-mãe da tabela "AC17 substituído"; **@qa com gate** (regressão completa dos gates e mutação); push e PR pelo @devops, só com autorização do responsável; merge só com o "sim" dele. Status por fatia como na story-mãe: InProgress em implementação, InReview em revisão @qa; a story-mãe só vai a Done depois da última fatia e do aceite P1–P4.

## Tasks

- [x] @po valida esta story (10 pontos) e atualiza a story-mãe conforme "AC17 substituído"; Draft → Ready. *2026-11-04, GO condicional, 9,5/10.*
- [ ] Responsável fecha as lacunas L1 a L4 e a pré-condição P3 (lista de `recurso` e tabela C11); registrar (adendo 2 ao ADR, se o @architect julgar necessário).
- [ ] Responsável aprova a edição dos mapas (P1); @dev confere a P-U5 (P2) e registra.
- **Commit 1 — auditoria, runbook, guia e ponto 8**
  - [x] Criar `docs/seguranca/auditoria-ghidramcp-2.0.md` com o registro do runbook, sem reescrever o juízo (F2-AC18).
  - [x] Runbook: linhas 67 e 95 viram apontamento; sai o registro com `GhidraMCP@`; a linha 74 diz que o verificador confere a auditoria (F2-AC19).
  - [x] Guia: linha 77 (e 80) apontam a auditoria (F2-AC20). A matriz em prosa **não** entra aqui (F2-AC17 (c), depois da L2).
  - [x] Ponto 8: `AUDITORIA_GHIDRA` em `ARQUIVOS_FIXOS`, regras (a) a (d), mensagens, ajuste dos testes das linhas 55, 442-461, 476, 519, 569-577, 613, 652 e os casos novos (1) a (5) e (7) (F2-AC21). O item (e) e o caso (6) vão para o commit 8.
- **Commits 2 a 7 — lotes nos mapas (após P1, P2, P3 e P4)**
  - [ ] Bloco `contrato` do `rea` e do `ghidra`; aliases preservados.
  - [ ] L-1, L-2, L-3, L-4, L-5, L-6: tabela de revisão no handoff, aprovação do responsável, entrada no mapa, amostragem do @qa (F2-AC25).
  - [ ] Conferir que o restante de cada mapa é igual ao do `main` (F2-AC23 (1)) a cada lote.
- **Commit 8 — regras do verificador**
  - [ ] `contrato`: F2-AC1 a F2-AC6; `atributos`: F2-AC7 a F2-AC10; coerência C2 a C8 e C11: F2-AC11 a F2-AC13.
  - [ ] Categoria de aviso (C9, C10), saída, limite da coerência e componente: F2-AC14 a F2-AC16.
  - [ ] Matriz impressa e conferida no guia: F2-AC17 (a) e (b); matriz em prosa no guia, se ainda não entrou com o bloco `contrato` (F2-AC17 (c)).
  - [ ] Ponto 8 (e) e caso novo (6), com o F2-AC4.
  - [ ] Teste do gate com e sem os blocos (F2-AC23 (2)) e teste de somente leitura ajustado (F2-AC24).
- [ ] `npm test`, lint, tipos, `npm run verificar` (F2-AC26); `git diff --name-only <base>` contra F2-AC22; handoff com a contagem de avisos do repositório real.

## File List (previsto)

Criar ou alterar:

- `docs/stories/mel-05-fatia-2-contrato-e-atributos.story.md` — esta story.
- `scripts/integracoes/verificar-integracoes.mjs` e `scripts/integracoes/verificar-integracoes.test.mjs` — regras C1 a C11, avisos, matriz, ponto 8.
- `scripts/verificar/verificar.mjs` e `scripts/verificar/verificar.test.mjs` — avisos no componente `integracoes` (F2-AC16).
- `.claude/hooks/rea-niveis.json` e `.claude/hooks/ghidra-niveis.json` — **só com P1**; só os blocos `contrato` e `atributos`.
- `docs/seguranca/auditoria-ghidramcp-2.0.md` (novo).
- `docs/runbook-prereqs-nativo.md`, `docs/guia-rea.md`.
- `docs/handoffs/<data>-mel05-fatia2.md` (artefato de processo; tabelas de revisão dos lotes e contagem de avisos).

### File List (real)

Commit 1 (PR-A, 2026-11-05):

- `docs/seguranca/auditoria-ghidramcp-2.0.md` — novo (F2-AC18).
- `docs/runbook-prereqs-nativo.md` — apontamentos para a auditoria; registro com o commit completo removido (F2-AC19).
- `docs/guia-rea.md` — linhas 77 e 80 (F2-AC20).
- `scripts/integracoes/verificar-integracoes.mjs` — `AUDITORIA_GHIDRA` em `ARQUIVOS_FIXOS`; ponto 8 dividido em `conferirRunbook` (nenhum `GhidraMCP@`, apontamento obrigatório) e `conferirAuditoriaGhidra` (regras de antes, agora na auditoria) (F2-AC21 (a)–(d)).
- `scripts/integracoes/verificar-integracoes.test.mjs` — fixture padrão, casos do AC17 trocados pelos do F2-AC21, QA-2, QA-3, AC9, AC14, QA-7 ajustados; casos novos (1) a (5) e (7).
- `docs/stories/mel-05-fatia-2-contrato-e-atributos.story.md` — esta story (status, checkboxes, File List, Change Log).
- `docs/handoffs/2026-11-05-e3-2a-pr-a.md` — handoff do commit 1 (artefato de processo).

**Não devem mudar:** `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs` e os testes deles, `.claude/settings.json`, `.mcp.json`, `registros/_modelos/`, `registros/<slug>/`, `package.json` e `package-lock.json`, `.github/workflows/verificacao.yml`, `scripts/verificar/agregar-ci.mjs`, `tsconfig.json` (o módulo já está em `files`).

## Dev Notes

- **Fonte do desenho:** adendo 1 inteiro (§3 vocabulário e `conteudo_do_alvo`; §4 regras C1–C11 e o limite; §5 insumos desta fatia; §9 riscos; §10 decisões). ADR-0001: §2a (formato do bloco), §2d (`familia`), §2e (matriz), §2f (fatia 2), §6 itens 7 e 9, §7.
- **Onde mexer no módulo** (`scripts/integracoes/verificar-integracoes.mjs`, conferido pelo @sm em 2026-11-04): `CONTRATOS` (`:26-33`); constantes e `ARQUIVOS_FIXOS` (`:35-45`); `motivoErro` (`:60`); `conferirMapa` (`:246-267`); `conferirVersoes` (`:275-304`, pontos 4 e 5); `conferirGuia` (`:321-331`); `conferirRunbook` (`:333-354`); `verificarIntegracoes` (`:362-437`); bloco `import.meta.main` (`:439-445`), que hoje imprime só achados e sai com 0 ou 1.
- **Compatibilidade:** `verificar.mjs:18` importa `formatarAchado` e `verificarIntegracoes`; `componenteIntegracoes` (`:254-266`) usa o retorno como `Achado[]`. Manter essa assinatura (F2-AC14).
- **Formato dos mapas hoje:** `rea-niveis.json` tem `rea_version`, `catalog_digest`, `niveis`, `ferramentas` (170); `ghidra-niveis.json` tem `servidor`, `versao` ("GhidraMCP 2.0 (commit 1e98025)"), `nota`, `niveis`, `ferramentas` (30). O `contrato` entra ao lado, sem tirar nada.
- **Fontes da classificação (F2-AC25):** leitura **estática** do pacote instalado (`node_modules/rea-agents/`, sem executar, sem `mcp doctor`, sem `tools/list`: ADR R6) e, para o Ghidra, do clone de auditoria `ferramentas/ghidramcp/` (fora do git, se ainda estiver na máquina). Não é objetivo desta fatia provar que a leitura estática basta para descrever as 170 tools: ver L8. Exemplos de hipótese do adendo (§3.1) vêm do nome e do nível e **não** são valores decididos.
- **Pontos de partida para P3, não decididos** (ADR §2a, linha 94): o `recurso` parte das categorias de `rea-gate.mjs:11-13` e do `SKILL.md` da skill `reverse-engineer-anything` — arquivo do alvo, sessão ou evidência, processo, navegador ou URL, dispositivo. O `contexto_execucao` parte de `caminho`, `sessao`, `url`, `dispositivo`, `nenhum` (ADR linha 95). A tabela C11 completa sai dessa lista.
- **Formato das linhas:** uma tool por linha em `atributos`, `efeitos` inline, para o diff por lote ficar revisável (R-tamanho).
- **Matriz no guia:** a forma textual é do @dev (tabela Markdown ou lista), desde que cada item caiba numa linha com cliente, servidor, caminho e estado (F2-AC17).
- **Código de saída:** só `achados` contam; `avisos` e `matriz` só se imprimem.
- **Constitution Art. IV:** nada acima inventa requisito. As decisões do @sm estão marcadas `[AUTO-DECISION]` abaixo.

### Decisões autônomas do @sm (a confirmar pelo @po)

- `[AUTO-DECISION]` Prefixo `F2-AC` na numeração → evita colisão com AC1–AC18 da story-mãe (motivo: o AC17 precisa ser citado sem ambiguidade).
- `[AUTO-DECISION]` Ordem de lotes risco-primeiro e N1 do REA em dois lotes de 46 → detectar lacuna de vocabulário cedo e manter a revisão tratável (motivo: DA-10 exige adendo para valor novo).
- `[AUTO-DECISION]` Verificador novo no último commit, dados antes → cada commit mantém o repositório verde, porque C1 obrigatório só passa com os 200 registros prontos.
- `[AUTO-DECISION]` `contrato.auditoria` restrito ao padrão `docs/seguranca/<nome>.md` → preserva a lista fechada de leitura (AC14) sem ler caminho livre vindo de dado.
- `[AUTO-DECISION]` `verificarIntegracoes` mantém o retorno `Achado[]` → o componente e os testes da fatia 1 não quebram.
- `[AUTO-DECISION]` Menções históricas a `1e98025` e `b92a651` sem a forma `GhidraMCP@` podem ficar no runbook → o adendo só exige que a forma `GhidraMCP@<commit>` more na auditoria (DA-16); baixo risco, o @po pode apertar.

**Conferência do @po (2026-11-04):** as cinco primeiras confirmadas. A última foi apertada: o commit **completo** sai do runbook (DA-16 diz "o commit fica só nela"); o abreviado histórico fica, a confirmar pelo responsável (Q5). Decisões do @po: P6 (um PR por story); ponto 8 (e) no commit 8; matriz em prosa depois da L2; comparação por palavra inteira no F2-AC17 (b); cópia do gate no teste do F2-AC23 (2).

## Lacunas das fontes (para o @po e o responsável)

Nenhuma foi decidida pelo @sm. As de L1 a L4 bloqueiam parte do trabalho (P3, P4); as demais não bloqueiam.

- **L1 — lista de valores de `recurso` e tabela de coerência C11.** O adendo §3.1 e o ADR §2a (linha 94: "a lista de valores fica a confirmar") delegam o fechamento à fatia 2; nenhuma fonte o fez. Sem isso não há F2-AC5, F2-AC10 nem F2-AC13 testáveis. Pedido: proposta do @architect ou do @dev (a partir dos pontos de partida em Dev Notes), aprovação do responsável, e registro (adendo 2 ao ADR, ou na própria story, se o @architect aceitar). Só o par `usa_dispositivo` ⇄ "dispositivo" está decidido.
- **L2 — representação da matriz em `contrato.clientes`.** O ADR §2a dá os campos `cliente`, `caminho`, `estado`, `evidencia` e três estados (`testado`, `nao-testado`, `sem-adaptador`). A matriz do §2e usa "a confirmar" (linha do provider Ghidra do REA), que não está nos três; a linha "rea + provider ghidra" não cabe como mais um item de `rea` sem campo que a distinga da linha "Claude Code / MCP"; e "Codex / todos" precisa de um item por mapa. Opção do @sm, **não decidida**: `nao-testado` com a evidência "a confirmar: …", `caminho` como `mcp` e `cli`, e um item de Codex por mapa. Alternativa: um quarto valor de estado, que exige adendo. O valor `caminho` "MCP + hook" do §2e é descritivo. *Acréscimo do @po:* a linha do Codex no §2e tem caminho "—", que também não cabe em `mcp`/`cli` (F2-AC6); a resposta precisa dizer qual `caminho` o item do Codex leva.
- **L3 — `catalogo.digest` do `ghidra`.** O `ghidra-niveis.json` não tem digest de catálogo; o do `rea` tem (`catalog_digest`). O ADR §2a pede `catalogo: {digest, ferramentas}` sem dizer o que o Ghidra põe. Opção: `digest` opcional, só `ferramentas` (30) obrigatório; a decidir.
- **L4 — `contexto_execucao`:** lista fechada dos cinco valores do ADR (linha 95) ou só texto não vazio? E é obrigatório por tool? O pedido do responsável o lista entre os campos por tool, e o @sm assumiu **obrigatório e de lista fechada** nos AC; o ADR chama o campo "insumo da MEL-06; aqui só declarado". *Acréscimo do @po:* a mesma pergunta vale para `recurso` (o C1 do adendo só torna obrigatórios `efeitos` e `conteudo_do_alvo`) e para o papel de `contrato.recurso_padrao`: se `recurso` for obrigatório por tool, o `recurso_padrao` vira só declaração do servidor (conferida contra o vocabulário, F2-AC5); se não for, ele é o valor que vale para a tool sem `recurso`, e o C11 tem de usá-lo.
- **L5 — onde registrar a justificativa do aviso C10.** O adendo diz "pedindo justificativa", sem campo. Opção do @sm: sem campo novo; a justificativa vai na tabela de revisão do lote (handoff) e na revisão do @qa. **Fechada pelo @po (2026-11-04):** opção do @sm. Campo novo no mapa seria requisito sem fonte (art. IV).
- **L6 — leitura de C7.** "Tool N3 declara `executa_codigo_do_alvo` ou `lanca_processo`" foi lido como "ao menos um dos dois". **Fechada pelo @po (2026-11-04):** "ou" inclusivo, como está no F2-AC12; é a leitura literal do adendo §4 e o C9 já pede revisão humana do caso `lanca_processo` sem `executa_codigo_do_alvo`.
- **L7 — tamanho da amostra do @qa** (F2-AC25 (d)). Proposta do @sm: 100% de N2, N3, N4a, N4b e de qualquer efeito diferente de `so_leitura`; nos lotes N0 e N1, ao menos 20% por lote, no mínimo 10 tools. Sem fonte; o @po ajusta. **Fechada pelo @po (2026-11-04):** proposta aceita, mais 100% das tools com `conteudo_do_alvo: false` fora de N0 (as do aviso C10). A amostra é sorteada pelo @qa, não escolhida pelo @dev.
- **L8 — classificar sem catálogo real.** **Não verificado:** se a leitura estática do pacote e do clone do Ghidra dá descrição suficiente das 170 e das 30 tools. O ADR (R6) diz que "onde o catálogo mora no pacote está a confirmar". Se faltar descrição de uma tool, ela fica fora do lote e vai ao responsável (F2-AC25).
- **L9 — P-U5.** O estado da U4 e da U5 só é conhecido pelo plano de 2026-11-01 (**não verificado** depois); a conferência é da P2.
- **L10 — anotações MCP (DA-2).** **Não verificado:** se o REA 6.4.0 as expõe. A conferência de efeito × anotação fica fora desta fatia estática (adendo §3.1).

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-04 | Story criada (Draft), unidade CRAFT, a partir do adendo 1 do ADR-0001 (Aceito), das decisões DA-1 a DA-19, do ADR §2a/§2d/§2e/§2f e da story-mãe MEL-05. Estimativa G. Sem validação @po. Story-mãe não editada: o AC17 substituído e os trechos afetados estão na seção "AC17 substituído" para o @po | @sm (River) |
| 2026-11-04 | Validação @po (10 pontos): 8,0/10 como estava; correções: ponto 8 (e) e caso (6) movidos para o commit 8 (no commit 1 reprovariam a CI, porque o bloco `contrato` ainda não existe); matriz em prosa só depois da L2; F2-AC17 (b) por palavra inteira (`testado` ⊂ `nao-testado`); F2-AC19 tira também o commit completo do runbook (DA-16); F2-AC23 (2) copia o gate, que lê o mapa da própria pasta; F2-AC10 condicionado à L4; P6 (um PR por story, conflito do F2-AC22 com a 2b); L2 e L4 ampliadas; L5, L6 e L7 fechadas; recomendação de dois PRs na "Estimativa". 9,5/10, **GO condicional**. Revalidação do AC17 da fatia 1 feita: story-mãe atualizada (P5 cumprida). **Transição de status: Draft → Ready** | @po (Pax) |
| 2026-11-05 | Início da implementação pelo @dev (PR-A, branch `feat/e3-2a-auditoria-ghidramcp`). **Transição de status: Ready → InProgress** | @dev (Dex) |
| 2026-11-05 | Commit 1 (R10, um commit): auditoria `docs/seguranca/auditoria-ghidramcp-2.0.md`, runbook e guia reapontados, ponto 8 (a)–(d) e testes (testes primeiro: 29 falhas antes, 50/50 depois). F2-AC18 a F2-AC20 marcados; F2-AC21 aberto até o commit 8 ((e) e caso (6)). Evidências: `npm test` 327/332 (5 do gitleaks pulados, Docker desligado: **não executados**), lint e tipos aprovados, `verificar.mjs --so integracoes` aprovado, `npm run verificar` INCOMPLETO (gitleaks e 3 semgrep **não executados**, Docker). Status continua **InProgress** (faltam commits 2 a 8). Story-mãe não editada | @dev (Dex) |
| 2026-11-05 | Gate @qa do commit 1 (PR-A, `ed73716`): **CONCERNS**, 4 achados baixos (QA-E32A-01 a 04), 27 mutações (22 mortas, 2 equivalentes, 3 sobreviventes). Docker desligado: gitleaks e 3 componentes semgrep **não executados**. Status não muda (InProgress; PR-B pendente). Ver "QA Results" | @qa (Quinn) |

## Validação @po (2026-11-04)

Checklist de 10 pontos (`story-lifecycle.md`; a task `validate-next-story.md` não existe neste checkout). 1 atende, 0,5 parcial, 0 não atende.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Contexto amarra ADR §2a, adendo §3–§5 e DA-1 a DA-19 |
| 3 | AC testáveis | 0,5 | 1 | F2-AC17 (b) casava `testado` dentro de `nao-testado` (estado divergente passaria); F2-AC23 (2) supunha que o gate lê o mapa de `CLAUDE_PROJECT_DIR` (lê da pasta dele, `rea-gate.mjs:28,67`); F2-AC10 fixava obrigatoriedade sem fonte. Corrigidos. F2-AC5, F2-AC10 e F2-AC13 continuam testáveis só depois da P3: o bloqueio está declarado |
| 4 | Escopo dentro e fora | 1 | 1 | "Não faz" completo: gates, `settings.json`, `.mcp.json`, `00-seguranca.md` e o modelo fora; mapas só com P1 |
| 5 | Dependências | 0,5 | 1 | A ordem de commits punha o ponto 8 (e) e a matriz no commit 1, que reprovaria a CI (bloco `contrato` inexistente) ou anteciparia a L2; F2-AC22 e F2b-AC14 se contradizem num PR único. Corrigidos (ordem, P6) |
| 6 | Complexidade | 1 | 1 | G plausível; recomendação de dois PRs registrada |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | R5, R7, R8, R10 do adendo e R-gate cobertos |
| 9 | Definition of Done | 1 | 1 | — |
| 10 | Alinhamento com ADR, adendo e decisões | 0,5 | 0,5 | Rastreabilidade AC → adendo completa. F2-AC19 deixava o commit completo no runbook contra a DA-16; corrigido. Fica 0,5 por lacuna das fontes, não da story: a lista de `recurso` e a tabela C11 que o adendo §3.1 manda a fatia 2 fechar (L1) e a obrigatoriedade de `recurso`/`contexto_execucao` (L4) |
| | **Total** | **8,0** | **9,5** | **GO condicional** |

**Art. IV:** cada AC aponta ADR, adendo ou decisão. Os acréscimos do @po derivam das fontes ou do código conferido: (e) no commit 8 (ordem da própria story e R10); palavra inteira (DA-15, "estado divergente reprova"); cópia do gate (`rea-gate.mjs:28,67`); commit completo fora do runbook (DA-16). Nenhuma decisão do responsável foi reaberta. **Sala limpa de ideias:** nenhum nome de campo, texto ou estrutura vem do craft-anything; os nomes são os do adendo §3.1, nossos.

**Condições do GO:**

- O commit 1 (PR-A, se o responsável escolher dois PRs) pode começar depois do Ready, sem P1 a P4.
- Os lotes e os blocos esperam P1, P2, P3 (com a L4) e P4 registradas no Change Log.
- F2-AC5, F2-AC10 e F2-AC13 são reescritos pelo @po se as respostas à L1 ou à L4 mudarem o que eles dizem.
- Vocabulário que não descreva uma tool: valor novo só por adendo (DA-10); a tool fica sem lote.

**Classificação das lacunas:** nenhuma bloqueia o início (o commit 1 não depende delas).

| Lacuna | Classe | O que trava | Depende do responsável? |
|---|---|---|---|
| L1 | bloqueia só AC/lote | F2-AC5, F2-AC10 (`recurso`), F2-AC13 e todos os lotes | sim (Q2) |
| L2 | bloqueia só AC/lote | F2-AC6, F2-AC17, blocos `contrato` | sim (Q3) |
| L3 | bloqueia só AC/lote | F2-AC3 no mapa `ghidra` | sim (Q4) |
| L4 | bloqueia só AC/lote | F2-AC5, F2-AC10 e os lotes | sim (Q2) |
| L5 | pode seguir | — (fechada pelo @po) | não |
| L6 | pode seguir | — (fechada pelo @po) | não |
| L7 | pode seguir | — (fechada pelo @po) | não |
| L8 | bloqueia só um lote, por tool | tool sem descrição suficiente fica fora do lote | só por tool, quando ocorrer |
| L9 | bloqueia só AC/lote | edição do `rea-niveis.json` (P2, conferência do @dev) | só se a U5 tiver mudado o mapa |
| L10 | pode seguir | fora desta fatia estática | não |

**Perguntas ao responsável (com a recomendação do @po):**

- **Q1 (entrega).** Um PR ou dois? *Recomendo dois:* PR-A com o commit 1 já; PR-B com blocos, lotes e regras depois de P1 a P4.
- **Q2 (L1 + L4).** Lista de `recurso`, tabela C11 e obrigatoriedade de `recurso` e `contexto_execucao`. *Recomendo:* pedir ao @architect a proposta a partir de `rea-gate.mjs:11-13` e do `SKILL.md` (arquivo do alvo, sessão ou evidência, processo, navegador ou URL, dispositivo), registrada em adendo 2; os dois campos obrigatórios por tool, `contexto_execucao` na lista fechada dos cinco valores do ADR §2a, e `recurso_padrao` só como declaração do servidor.
- **Q3 (L2).** Linha "a confirmar" e linha do Codex na matriz. *Recomendo* a opção do @sm, sem adendo: `nao-testado` com evidência "a confirmar: …", um item de Codex por mapa com `estado: sem-adaptador` e `caminho: mcp`, e o provider Ghidra do REA como item `mcp` do mapa `rea` com cliente `claude-code` e evidência que o identifique.
- **Q4 (L3).** `catalogo.digest` do `ghidra`. *Recomendo* `digest` obrigatório só quando `origem.tipo` é `npm` (o REA tem `catalog_digest`); no `git`, a fixação é o commit, e só `ferramentas` (30) é obrigatório.
- **Q5 (DA-16).** Menções abreviadas `1e98025`/`b92a651` no runbook e no guia podem ficar como histórico? *Recomendo sim:* o ponto 8 prende só a forma `GhidraMCP@`; o commit completo sai do runbook de qualquer jeito.
- **P1.** Aprovação para editar `rea-niveis.json` e `ghidra-niveis.json` (só os blocos `contrato` e `atributos`). *Recomendo* aprovar depois da Q2, por lote, como está no F2-AC25.

## Decisões do responsável após a validação @po (2026-11-04)

Respondidas por `AskUserQuestion`, seguindo a recomendação do @po em todas. Registro do @sm/orquestrador; nenhum AC foi alterado por este registro.

- **Q1:** **dois PRs.** PR-A (auditoria do GhidraMCP em `docs/seguranca/`, runbook, guia, ponto 8 do verificador; sem editar mapas) e PR-B (blocos, 200 registros em lotes, regras C1–C11, avisos, matriz).
- **Q2 (L1/L4):** **o @architect propõe um adendo 2** com a lista de `recurso` e a tabela C11; `recurso` e `contexto_execucao` obrigatórios por tool (contexto na lista fechada de 5 valores) e `recurso_padrao` só como declaração do servidor. O PR-B espera o aceite desse adendo.
- **Q3 (L2):** `nao-testado` com evidência "a confirmar: …"; Codex = um item por mapa com `sem-adaptador` e `caminho: mcp`; provider Ghidra do REA = item `mcp` do mapa `rea` com evidência que o identifica. Sem adendo.
- **Q4 (L3):** `catalogo.digest` obrigatório só com `origem.tipo: npm`.
- **Q5 (DA-16):** as menções abreviadas `1e98025` e `b92a651` podem ficar como histórico; o commit completo sai do runbook.
- **P1 (aprovação para editar os mapas): ainda NÃO dada.** Vem depois do adendo 2, por lote.

### Decisões do responsável de 2026-11-05 (registro do orquestrador; nenhum AC alterado)

Respondidas por `AskUserQuestion`, na opção recomendada.

- **P1 — aprovada com condições (2026-11-05).** Escopo: **só** os blocos `contrato` e `atributos` em `.claude/hooks/rea-niveis.json` e `.claude/hooks/ghidra-niveis.json`; nenhum valor de `ferramentas` muda. Condições: (1) o @dev só edita depois do **aceite do adendo 2** (P3, com a L4) pelo responsável; (2) um commit por lote (L-1 a L-6); (3) o **conteúdo de cada lote** continua dependendo do OK do responsável na conversa e da amostra do @qa (F2-AC25); (4) F2-AC23 (resto do mapa igual ao do `main`) a cada lote. Esta aprovação não vale para outro arquivo de gate, para `settings.json` nem para `.mcp.json`.
- **P2 — conferência da P-U5 (feita pelo orquestrador em 2026-11-05, por git).** `git log` dos dois mapas: só os commits `b6c1510` e `1650bc5` (criação do gate); nenhuma edição depois. A U5 não começou: P-U4 aguarda alvo novo e P-U5 é condicional à U4 (estado geral de 2026-11-02, linhas 59-60; fechamento da etapa 2, linhas 38 e 47). Nenhuma das 13 branches remotas diferentes do `main` altera os mapas (`git diff origin/main...<branch>`). **Não verificado:** trabalho da U5 em sessão ou clone local não enviado. O @dev refaz `git log` dos mapas no início do PR-B.
- **Adendo 2 — aceito (2026-11-05).** `docs/adr/ADR-0001-adendo-2-recurso-e-contexto-de-execucao.md`, 8 valores de `recurso`, 5 de `contexto_execucao`, tabela C11 com duas casas de aviso, `recurso_padrao` = `banco_de_analise` (decisões no §11 do adendo). **P3, L1 e L4 fechadas**; a P1 passa a valer nas condições acima. O @po reconcilia F2-AC5, F2-AC10 e F2-AC13 conforme o §7 do adendo (a story não foi editada aqui). O PR-B ainda precisa do PR #15 e deste adendo no `main`, e do OK do responsável em cada lote.

## QA Results

### Gate do commit 1 (PR-A) — 2026-11-05, @qa (Quinn)

**Revisado:** `ed73716` sobre `74741d2` (plano) e `origin/main` @ `3c6b8db`. **Escopo:** F2-AC18, F2-AC19, F2-AC20, F2-AC21 (a)–(d) (sem (e) nem o caso (6)), F2-AC22 e a parte do F2-AC26 que cabe no commit 1. Só leitura do código; nenhuma tool `rea`/`ghidra`; nada em `alvos/` ou `saidas/`; a suíte de UI WPF não foi rodada.

**Veredito: CONCERNS.** A entrega cumpre os AC do escopo. Ficam 4 achados de severidade baixa, mais a pendência do Docker, que é do ambiente e não do código.

| # | Verificação | Resultado |
|---|---|---|
| 1 | Revisão de código | OK. `conferirAuditoriaGhidra` mantém as regras da fatia 1 (fail-closed sem referência, faixa de 7 a 40 hexadecimais, prefixo do commit do `.mcp.json`) e `conferirRunbook` reprova qualquer `GhidraMCP@`, inclusive vazio, e a falta do caminho da auditoria. Mensagens com contrato `documentação`, arquivo e campo. `referenciasGhidra` é compartilhada, sem duplicação. |
| 2 | Testes | `node --test scripts/integracoes/`: 50/50. `npm test`: 332 testes, 327 aprovados, 0 falhas, 5 pulados (gitleaks, Docker desligado: **não executados**). Mutação: 27 mutações, 22 mortas, 2 equivalentes e 3 sobreviventes (ver abaixo). |
| 3 | AC | F2-AC18: o juízo saiu sem reescrita (13/10/2026, tag `2.0`, `1e98025`, Apache-2.0, loopback, sem `exec`, sem rede de saída no plugin, clone em `ferramentas/ghidramcp/`, instalação de 14/10/2026). Nada se perdeu e nada foi inventado: "leitura estática" vem de `runbook:129` (`origin/main`) e o resto vem das linhas 67, 74 a 91, 97 e 100. O commit completo da auditoria é igual aos `args` do `.mcp.json`. F2-AC19: o `grep -nE "GhidraMCP@\|[0-9a-f]{40}"` no runbook só acha o SHA-256 do Ghidra (64 hex, linha 40); o caminho da auditoria aparece nas linhas 67, 74 e 78. F2-AC20: linhas 77 e 80 coerentes; o guia não tem matriz. F2-AC21 (a)–(d): cumpridos (`AUDITORIA_GHIDRA` em `ARQUIVOS_FIXOS`; o AC14 e o AC12 o cobrem). A caixa fica aberta, corretamente. |
| 4 | Regressão | `verificar --so integracoes` aprovado no repositório real. F2-AC22: o `git diff --name-only origin/main HEAD` não lista hooks, `settings.json`, `.mcp.json`, `registros/`, `CLAUDE.md` nem os testes dos gates. A documentação do produto no diff se resume a runbook, guia e auditoria; o resto é story, handoff, `plano-de-execucao.md` e `planos/`, todos artefatos de processo. |
| 5 | Desempenho | OK. Duas leituras de texto e uma regex linear. |
| 6 | Segurança | OK. A lista de leitura continua fechada e não há escrita, rede nem `child_process` no módulo (o teste AC14 está verde). |
| 7 | Documentação | OK. A auditoria segue o padrão de `auditoria-rea-6.4.0.md`, e o runbook e o guia apontam para ela. |

**Comandos:** `npm run lint`: aprovado, 23 arquivos. `npm run tipos`: aprovado, 7 arquivos. `verificar` com todos os componentes, exceto `notepad-ui`: INCOMPLETO, 12 aprovados, 0 falhas, 4 **não executados** (`gitleaks`, `semgrep-scan`, `semgrep-test`, `semgrep-mutacoes`; daemon do Docker inacessível). `notepad-core`: 137/137. A CI do PR ainda não existe.

**Mutação** (cópia temporária fora do repositório, `node --test scripts/integracoes/` mais `verificar --so integracoes` na cópia):

- **Mortas (22):** auditoria sem referência aprova; checagem de faixa removida; checagem de prefixo removida; faixa `{1,40}` e `{6,40}`; `toLowerCase` removido; sem commit no `.mcp.json` aprova; no runbook, `> 0` → `> 1`, regra de arroba desligada, apontamento desligado e apontamento afrouxado para `"auditoria"`; `AUDITORIA_GHIDRA` fora de `ARQUIVOS_FIXOS`; cada uma das duas chamadas removida; auditoria lendo o runbook; auditoria ausente aprova; runbook ausente aprova; captura `*` → `+`; contrato `versao` nos dois achados do runbook; mensagem sem "só pode estar em"; arquivo do achado da auditoria trocado.
- **Equivalentes (2):** faixa sem teto (`{7,}`) e classe `[0-9a-z]`. Nos dois casos, o prefixo de um commit de 40 hexadecimais já barra a referência.
- **Sobreviventes (3):** apontamento afrouxado para `"docs/seguranca/"` (QA-E32A-01); remoção do corte de ponto final (QA-E32A-04); `new Set` removido (só duplica o achado, e o veredito não muda).

**Achados:**

| ID | Sev. | Cat. | Descrição | Recomendação |
|---|---|---|---|---|
| QA-E32A-01 | baixa | tests | Nenhum teste distingue o apontamento para a auditoria certa de um apontamento para outro arquivo de `docs/seguranca/`: a mutação `includes("docs/seguranca/")` sobrevive. | Adicionar ao caso (2) um runbook que cite só `docs/seguranca/auditoria-rea-6.4.0.md`, que deve reprovar. |
| QA-E32A-02 | baixa | requirements | O F2-AC19 proíbe o commit completo no runbook, mas o ponto 8 só confere a forma `GhidraMCP@`. Sondado na cópia: um runbook com `commit 1e98025…51a7` sem arroba é aprovado. Hoje o AC está cumprido (conferido por grep), mas uma regressão passaria sem alerta. O F2-AC21 (c) não pede essa regra. | Decisão do @po: aceitar como está ou acrescentar ao F2-AC21 que "runbook com o commit completo do `.mcp.json` reprova". A regra não é inventada aqui. |
| QA-E32A-03 | baixa | security | A regex é sensível à caixa e ao formato. `ghidramcp@<commit>`, `GhidraMCP%40<commit>` e `GhidraMCP @<ref>` no runbook passam (sondado). Fora do texto literal do AC, o risco é só de documentação. | Registrar como limite conhecido. Se o @po quiser, a busca no runbook pode usar a flag `i`. |
| QA-E32A-04 | baixa | tests | O corte do ponto final (`replace(/\.+$/, "")`) não tem teste: sem ele, nenhum teste quebra. A regra vem da fatia 1, e um ponto colado à referência hoje aprova sem que nenhum teste o diga. | Adicionar um caso `GhidraMCP@1e98025.` na auditoria, que aprova. |

**Parecer sobre os achados do @dev para o @po:**

- (i) Caixa do F2-AC21 aberta: correto, porque (e) e o caso (6) são do commit 8 pela ordem da própria story.
- (ii) "Único arquivo com `GhidraMCP@`": concordo com a leitura "único na documentação do produto". ADR, adendos, stories, planos e handoffs são processo e o verificador não os lê. Como a letra do F2-AC18 diz outra coisa, cabe ao @po ajustar o texto.
- (iii) A prosa da auditoria também é conferida: o efeito é fail-closed e aceitável. A forma literal com arroba não pode aparecer em prosa nem como exemplo de regra; vale registrar isso na Dev Notes para quem editar a auditoria depois.

**Não executado:** `gitleaks` (5 testes de `npm test` e o componente) e `semgrep-scan`, `semgrep-test` e `semgrep-mutacoes`, por causa do Docker desligado (**não são verde**). Também ficaram de fora a suíte `notepad-ui` (regra do responsável) e o `resultado` da CI do PR, que ainda não existe. Antes do merge do PR-A, rodar com o Docker ligado ou confiar no `resultado` da CI.
