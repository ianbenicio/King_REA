# Story MEL-05 — contratos e inventário único de integrações

**Status:** InReview — **gate @qa da fatia 1: CONCERNS** (2026-11-04, ver "QA Results"). Fica em InReview, não Done: a story só vai a Done depois da última fatia e do aceite P1–P4; falta também o `resultado` da CI do PR (AC15). Antes: InReview (fatia 1 implementada pelo @dev em 2026-11-04, unidade E3-1, branch `feat/e3-1-integracoes`; aguarda @qa; a story volta a InProgress para as fatias seguintes, ver DoD. Antes: Ready, validação @po da unidade E3-0c, 2026-11-04: GO condicional, ver "Validação @po"; decisões do responsável de 2026-11-04 aplicadas pelo @sm, ver Change Log e "Decisões do responsável"). **A fatia 1 está liberada para InProgress quanto às decisões do responsável** (D-1, D-2 e D-4 decididas; não resta pergunta que bloqueie o início). A transição Ready → InProgress é do @dev. Nova rodada de validação @po sobre o AC3 reescrito e os AC16 a AC18: **GO, 9,5/10** (2026-11-04, rodada 2); o @dev pode partir. Decisões do responsável de 2026-11-04, depois do início da E3-1 (P-6 decidida, linha 100 do runbook na fatia 1, D-3 fechada com o pressuposto aceito), aplicadas pelo @po: ver "Decisões do responsável (2026-11-04, após o início da E3-1)"
**Workflow:** SDC, ciclo completo em fatias (entrega M no plano; @sm → @po → @dev, critérios @qa) · **Origem:** A08 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-05 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §6 (linhas 266-285) · **Decisões:** [ADR-0001 (Aceito, 2026-11-04)](../adr/ADR-0001-contratos-integracoes-mel-05.md) · **Ponto de partida:** [handoff da etapa 2, §5](../handoffs/2026-11-03-etapa2-fechamento.md)
**Complexidade:** STANDARD · estimativa do plano M no total; estimativa por fatia no fim desta story (a fatia 4 foi dividida em 4a e 4b; a soma das fatias ainda passa do M do plano, ver Riscos) · **Dependências:** MEL-03 (o verificador é o executor do componente novo) e MEL-08 (o job `js` da CI roda o componente), ambas na base de validação; coordenação com a U5 do plano de perfil do alvo

## Story

**Como** responsável pelo laboratório,
**quero** que servidor, tool, mapa de níveis, matcher do gate e registro de protocolo sejam conferidos entre si pelo verificador e pela CI,
**para** que um servidor ou tool novo deixe de depender de lembrança de editar vários lugares, e que o erro diga qual contrato está incompleto.

## Contexto

Mapa de níveis, matcher, configuração MCP e documentação podem divergir, e o gate lê campos de aprovação por regex (plano §6, "Problema e justificativa"). O ADR levantou o que cada arquivo declara hoje (ADR §1.1, linhas 15-36), as divergências já presentes (D1–D6, linhas 40-47) e as possíveis sem detecção (linhas 49-58). O ADR foi aceito pelo responsável em 2026-11-04 (ADR §7, D-1) e atualizado pelo @architect para refletir as decisões daquele dia.

O plano manda começar "por um verificador de consistência entre os arquivos existentes; gerar configurações só onde simplificar a manutenção" (plano linha 272), e o handoff repete: sem migrar nem aprovar níveis automaticamente (handoff §5). Por isso a story é fatiada: a **fatia 1 confere por leitura estática e corrige só a documentação em prosa** (D1–D3, decisão D-2, mais a linha 100 do runbook, decisão do responsável de 2026-11-04); mudar o formato dos mapas, o schema do `00-seguranca.md` e os gates vêm depois, uma fatia por vez (ADR §2f, linhas 162-190).

**Aplicação das decisões de 2026-11-04 (ADR §7):** D-1 (ADR aceito; o Ghidra está instalado, o que resolve a D3), D-2 (D1–D3 corrigidas na fatia 1), D-4 (mapa sem servidor no `.mcp.json` falha, com causas e soluções na mensagem), correção do ADR §4 (resolve P-1) e P-5 (fatia 4 dividida em 4a e 4b). Só entra aqui o que o ADR atualizado diz; o que as decisões implicam e o ADR não diz está nas "Lacunas das fontes".

## Escopo geral

**Dentro (todas as fatias, na ordem do ADR §2f):** verificador de consistência, com a correção da documentação em prosa D1–D3 (1); bloco `contrato` e `atributos` nos mapas (2); `schema: 00-seguranca/1` no modelo, parser compartilhado e relatório legado/inválido/revisão nova (3); gate MCP, `rea-gate.mjs`, usando o parser (4a); `cli-gate.mjs` usando o parser (4b); geração do matcher, opcional (5).
**Fora da story inteira:** aplicar a família de tool da U5 no gate (depende da U4 e da aprovação da U5, plano linha 285; ADR §2f "Fora da MEL-05", linha 190); adaptador do Codex (ADR linha 190); gerar `.mcp.json` (ADR linha 136); migrar ou aprovar níveis ou registros; MEL-06 (identidade e isolamento por execução) e MEL-07 (política comum CLI e MCP).

## Fatias

| # | Fatia | Estimativa | Depende de |
|---|---|---|---|
| 1 | Verificador de consistência por leitura estática (componente `integracoes`, job `js`), mais a correção da documentação em prosa D1–D3 e da linha 100 do runbook (`docs/runbook-prereqs-nativo.md`, `docs/guia-rea.md`) | M | MEL-03, MEL-08. Decisões do responsável D-1, D-2 e D-4: **decididas** (2026-11-04); sem bloqueio de início. D-3 (matcher): **fechada** em 2026-11-04 (pressuposto aceito pelo responsável, semântica confirmada pelo @architect) |
| 2 | Bloco `contrato` e `atributos` **obrigatório** nas 200 tools (DA-12 do adendo 1) nos dois mapas; verificador passa a exigi-los, com as regras C1 a C11 e avisos; matriz cliente/provider impressa e conferida no guia; auditoria do GhidraMCP em `docs/seguranca/`. Detalhe: [`mel-05-fatia-2-contrato-e-atributos.story.md`](mel-05-fatia-2-contrato-e-atributos.story.md) | **G** (era P antes do adendo 1) | Fatia 1 (entregue, PR #12); decisões 7 e 9 **decididas** (DA-6, DA-7, adendo 1); aprovação do responsável para editar os mapas e lacunas L1 a L4 da story da fatia 2; coordenação U5. A documentação do método é a fatia 2b ([`mel-05-fatia-2b-documentacao-metodo.story.md`](mel-05-fatia-2b-documentacao-metodo.story.md), P, independente) |
| 3 | `schema: 00-seguranca/1` no modelo, parser compartilhado, relatório legado/inválido/revisão nova | M | Fatia 1; decisões 2 e 8 |
| 4a | Gate MCP: `rea-gate.mjs` usa o parser compartilhado (v1 estrito, legado pelo caminho atual, inválido nega, `Object.hasOwn`) | M | Fatia 3; decisão 8 (localização do parser); decisão 4 (semântica de aprovação) a confirmar, ver "Decisões"; regressão completa (`rea-gate.test.mjs`) e @qa |
| 4b | `cli-gate.mjs` usa o parser compartilhado; a recusa de comando sem classificação só entra se a 6.5 decidir | M (sem a recusa); G se a recusa exigir o mapa de comando para nível | Fatia 3; decisão 8; a parte da recusa depende também da 6.5 e da definição de "caminhos suportados" (P-4 da validação). **Não depende da 4a**; regressão completa (`cli-gate.test.mjs`) e @qa |
| 5 (opcional) | Gerar o matcher a partir dos mapas | P | Fatia 1 (ADR §2f, aceito; corrigido na validação @po, rodada 2: a "fatia 2" anterior não tinha fonte); decisão 10 |

Estimativas são do @sm, não do plano, que dá só o M da story inteira. A fatia 1 continua **M**: ganhou duas checagens de texto (pontos 7 e 8 do ADR §2f, só busca de nomes e referências) e a correção de duas páginas de documentação, sem mudar a natureza do trabalho nem tocar caminho de segurança; fica no teto do M, não em G. A divisão da fatia 4 (P-5) tira a recomendação de G por fatia; a soma das fatias ainda passa do M do plano (ver R-estimativa).

## Fatia 1 — verificador de consistência de integrações

### Escopo da fatia 1

**Dentro:** componente novo `integracoes` do verificador (`scripts/verificar/verificar.mjs`, lista de componentes com `depende` e `requisito`; ADR linha 62), implementado em módulo próprio (sugestão do ADR: `scripts/integracoes/verificar-integracoes.mjs` + teste), com `depende: ["ambiente-node"]`; entrada no job `js` da CI; testes no `npm test`. Confere, só com leitura estática, os **oito** pontos do ADR §2f (linhas 164-172), listados nos ACs abaixo: os pontos 1 a 6 sobre `.mcp.json`, mapas, matcher, versões e modelo; os pontos 7 e 8 sobre a documentação em prosa (o guia cita cada servidor do `.mcp.json` e o mapa dele; toda referência `GhidraMCP@<ref>` do runbook é prefixo do commit do `.mcp.json:14`).
**Também dentro (D-2, ADR §2f "Documentação em prosa", linha 182):** a fatia corrige o texto de `docs/runbook-prereqs-nativo.md` (D1 e, por decisão do responsável de 2026-11-04 que amplia a D-2, a linha 100) e `docs/guia-rea.md` (D2 e D3). Depois da correção, a D1 e a D2 passam a ser detectadas pelos pontos 8 e 7; a D3 **só é corrigida, não detectada** (a instalação do Ghidra é estado da máquina, fora do checkout; nenhuma leitura estática a confere).
**Fora:** ver "O que cada fatia não faz".

### Onde entra na CI (ADR §1.3 e §2f; handoff §2)

O ADR recomenda o job `js`. Para isso, na mesma mudança, em quatro lugares que o `workflow-ci.test.mjs` prende entre si:

1. `scripts/verificar/verificar.mjs` — o componente (ADR linha 62).
2. `scripts/verificar/agregar-ci.mjs:25` — `integracoes` na lista de componentes do job `js` (`ambiente-node` continua primeiro; `agregar-ci.mjs:22-23`).
3. `.github/workflows/verificacao.yml:50` — o mesmo `--so` do job `js`. O teste exige `--so` igual ao `JOBS` do agregador (`workflow-ci.test.mjs:45-56`) e que todo componente esteja em algum job (`:58-61`); divergir reprova o `workflow-ci.test.mjs`.
4. `package.json:12` — o teste do módulo no script `test`; e, se o módulo for de política, a lista `files` do `tsconfig.json` (ADR linha 66).

A correção da documentação (D-2) não entra na CI além do próprio componente: os pontos 7 e 8 passam a rodar no job `js` e prendem o guia e o runbook ao `.mcp.json` (ADR §4: mudar um servidor passa a exigir a documentação no mesmo commit).

Não entra action nova, então não há auditoria de action a fazer (handoff §2: auditoria só para action nova ou nova versão). O componente roda sem Docker: se rodasse no job `semgrep` ou `publicacao`, dependeria dele sem necessidade.

### Critérios de aceitação da fatia 1

Cada AC aponta a origem: **P** = item do aceite do plano (P1 servidor sem classificação; P2 tool desconhecida, schema inválido e nível sem autorização recusados; P3 legado/inválido/revisão nova; P4 matriz cliente/provider; plano linhas 278-281), **A** = decisão ou item do ADR, **H** = handoff.

**Cobertura de servidores (P1; ADR §2f.1, §2c)**

- [x] **AC1** — Dado um servidor em `.mcp.json` sem `.claude/hooks/<servidor>-niveis.json`, quando o componente roda, então reprova com mensagem que cita o servidor e diz que falta o **mapa de níveis** ("integração incompleta: servidor `x` sem mapa de níveis"). Teste com fixture em pasta temporária. *Origem:* P1, ADR §2f.1; ADR linha 51.
- [x] **AC2** — Dado um servidor com mapa e sem cobertura do matcher de `.claude/settings.json` (a chamada `mcp__<servidor>__x` não casa), quando o componente roda, então reprova citando o servidor e dizendo que falta o **matcher do gate** (a tool ficaria sem trava). Dado o inverso (servidor nomeado no matcher sem entrada no `.mcp.json`), reprova dizendo que o matcher cita servidor que não está configurado. **Leitura do matcher (D-3 fechada em 2026-11-04):** o componente reproduz a regra da documentação do Claude Code (hooks reference): matcher só com letras, dígitos, `_`, `-`, espaço, `,` e `|` é lista de nomes exatos; com qualquer outro caractere é regex JavaScript testada com `RegExp.prototype.test` (casamento parcial, sem âncora); `*` ou vazio casa tudo. Há **cobertura** do servidor só se `mcp__<servidor>__<tool>` casa nas duas leituras: a parcial (`test` com a regex como está) **e** a ancorada (`^(?:<matcher>)$`). O componente **reprova** (fail-closed) matcher fora da forma `mcp__(n1|n2…)__.*` com nomes em `[a-z0-9-]+` (o mesmo conjunto da regex do gate, `rea-gate.mjs:63`), inclusive matcher vazio, `*` e lista de nomes exatos. Testes negativos, com fixture: `mcp__rea` sem `.*` reprova; nome de servidor de plugin (`mcp__plugin_x_rea__t`, forma `mcp__plugin_<plugin>_<servidor>__<tool>`, que o matcher atual nunca pega) não conta como cobertura de `rea`; servidor com `_` no nome reprova (fora de `[a-z0-9-]+`; o tratamento do `_` dentro do nome do servidor não é documentado pelo Claude Code, a confirmar). *Origem:* P1, ADR §2f.1; ADR linha 52; D-3 (decisão do responsável e confirmação do @architect, 2026-11-04).
- [x] **AC3** — Dado um mapa `.claude/hooks/<servidor>-niveis.json` sem servidor correspondente em `.mcp.json` (mapa órfão), quando o componente roda, então **reprova** (D-4 decidida: falha, não aviso), e a mensagem contém: (a) o arquivo do mapa; (b) o nome de servidor derivado dele (`<servidor>-niveis.json` ↔ `mcp__<servidor>__`, `rea-gate.mjs:63-85`); (c) a lista de servidores do `.mcp.json`; (d) as **três causas prováveis, cada uma com a solução**: servidor removido do `.mcp.json` e mapa esquecido → apagar o mapa e tirar o servidor do matcher (`settings.json:10`); nome do servidor divergente entre o mapa e a chave do `.mcp.json` → dar o mesmo nome aos dois, citando, se existir, o servidor do `.mcp.json` que ficou sem mapa; mapa de servidor ainda não registrado → registrar o servidor no `.mcp.json` e no matcher, depois da auditoria e da fixação de versão (regra de servidor novo de RE em `CLAUDE.md`); (e) o aviso de que **o verificador não corrige nada** e a correção é manual. A mensagem traz **sempre as três causas**: o componente não escolhe uma, porque "removido e esquecido" e "ainda não registrado" não se distinguem por leitura estática, e o ADR pede na mensagem as causas prováveis, cada uma com a solução; a única parte que varia é a citação do servidor sobrando na causa "nome divergente". Testes, com fixtures em pasta temporária: (1) mapa sem servidor e nenhum servidor do `.mcp.json` sobrando sem mapa → a mensagem traz as três causas, **uma asserção por causa**, cada uma com a sua solução (removido e esquecido → apagar o mapa e tirar do matcher; nome divergente → dar o mesmo nome aos dois; ainda não registrado → registrar no `.mcp.json` e no matcher, depois da auditoria e da fixação de versão), e a causa "nome divergente" não cita servidor nenhum ("se existir"); (2) mapa `x-niveis.json` com o `.mcp.json` tendo um servidor `y` sem mapa → a causa "nome divergente" **cita `y`**, e as outras duas continuam na mensagem. Nos dois testes, afirma também (a), (b), (c) e (e), e que o componente reprova (não avisa). O mesmo cenário do teste (2) também reprova o AC1 (servidor `y` sem mapa); os dois diagnósticos aparecem. *Origem:* ADR §2c (linha 138), §2f ponto 1 (linhas 165 e 174-180), §6 item 3, §7 (D-4).

**Forma do mapa (P1, P2; ADR §2f.2–3)**

- [x] **AC4** — Dado um mapa que não é JSON válido, ou com `ferramentas` ausente ou vazio, quando o componente roda, então reprova, diz qual mapa e qual campo. *Origem:* ADR §2f.2.
- [x] **AC5** — Dada uma tool do mapa **sem classificação** (valor ausente, vazio ou que não é string), quando o componente roda, então reprova citando mapa e tool ("tool sem nível"). Dado um nome de tool fora de `^[A-Za-z0-9_-]+$` ou que colide com propriedade herdada (`constructor`, `__proto__`, `toString`), reprova citando o nome. *Origem:* P2 (parte de schema inválido), ADR §2f.2 e linha 56.
- [x] **AC6** — Dado um nível de tool que não existe em `niveis` do próprio mapa, quando o componente roda, então reprova citando mapa, tool e nível (nível inválido). Dados dois mapas com `niveis` diferentes, reprova citando os dois; "igual" é comparação profunda: mesmas chaves e mesmo texto de cada nível (hoje idênticos, ADR linha 24). *Origem:* P2, ADR §2f.3; ADR linhas 24, 54-55.

**Versão (ADR §2f.4–5; ADR D4)**

- [x] **AC7** — Dado `rea_version` do `rea-niveis.json` diferente da versão de `rea-agents` em `package.json` (`dependencies`), ou `package.json` diferente do `package-lock.json` (`packages["node_modules/rea-agents"].version`), quando o componente roda, então reprova citando as três versões lidas e o arquivo de cada uma. Dado o commit do mapa do Ghidra (o hexadecimal depois de `commit` no campo `versao`, hoje "GhidraMCP 2.0 (commit 1e98025)") que não é prefixo do commit dos `args` do `.mcp.json`, reprova citando os dois; campo sem commit legível também reprova (fail-closed, como no AC12). *Origem:* ADR §2f.4–5; ADR D4 (linha 45).

**Modelo de protocolo (P3, em parte; ADR §2f.6)**

- [x] **AC8** — Dado o modelo `registros/_modelos/00-seguranca.md`, quando o componente roda, então confere que ele é legível pelas regras do gate: frontmatter delimitado, `status` com valor reconhecido, `niveis_aprovados` em lista inline numa linha e **uma única** seção "Identidade dos arquivos" (regras de `rea-gate.mjs:150,157,183-212,278-281`; ADR linha 170). Uma variação que o gate leria como vazio (lista de bloco, `status` entre aspas, seção repetida) reprova no teste. Como `rea-gate.mjs` não exporta as regras (Dev Notes), o componente as reimplementa e um **teste de equivalência** prende as duas leituras: para o modelo e cada variação, montados numa raiz temporária, o resultado do componente concorda com o do gate rodado como subprocesso (padrão de `rea-gate.test.mjs:38-40`, `CLAUDE_PROJECT_DIR` na raiz temporária). O componente lê **só** o modelo, nunca um registro de alvo. *Origem:* ADR §2f.6; Dev Notes ("reimplementar com teste de equivalência"); classificação legado/inválido/revisão nova fica na fatia 3.

**Mensagens (plano "Melhoria esperada")**

- [x] **AC9** — Dado qualquer reprovação dos AC1 a AC8, AC16 e AC17, quando o componente imprime o resultado, então a mensagem diz (a) qual **contrato** está incompleto (mapa, matcher, `.mcp.json`, versão, modelo, documentação), (b) o arquivo e o campo (ou, na documentação, o arquivo e a referência), (c) o que falta, em uma linha, sem ecoar trechos longos do arquivo lido. Exceção justificada: a mensagem do AC3 é multilinha por exigência do ADR §2f (causas com solução). Teste: cada caso dos AC1 a AC8, AC16 e AC17 afirma o texto-chave da mensagem. *Origem:* plano "Melhoria esperada" (linha 274); ADR §2f ("Mensagens dizem qual contrato está incompleto", linha 174), R4.

**Integração com o verificador e a CI (H; ADR §1.3)**

- [x] **AC10** — Dado o repositório real, quando `node scripts/verificar/verificar.mjs --so integracoes` roda, então o componente aparece no resumo com estado, duração e motivo, e o `--json` traz o componente `integracoes` no formato que o agregador lê. *Origem:* handoff §5 (componente novo entra no verificador e num job da CI), ADR linha 62. *Expectativa a confirmar pelo @dev:* o levantamento do ADR não aponta falha dos pontos 1 a 6 no estado atual dos arquivos. Os pontos 7 e 8 **falhariam antes da correção da documentação** (ponto 8: `docs/runbook-prereqs-nativo.md:82` usa `@2.0`, ADR §2f ponto 8; ponto 7: o guia só cita `rea`, D2) e **só aprovam depois do AC18**. Na ordem de trabalho, o AC10 se mede com a documentação já corrigida; se o componente reprovar o repositório real depois disso, é achado a registrar, não a corrigir nesta fatia (nada muda nos mapas, no `.mcp.json` nem no matcher).
- [x] **AC11** — Dado `integracoes` em `JOBS` (job `js`) e no `--so` do `verificacao.yml`, quando `npm test` roda, então `workflow-ci.test.mjs` fica verde; removido o componente de um dos dois lados, o teste reprova. *Origem:* handoff §2, ADR linhas 63-65.
- [x] **AC12** — "Não executado nunca é verde": dado `ambiente-node` reprovado ou ausente, o `integracoes` fica "não executado" (não aprovado); dado o JSON do job `js` sem o componente `integracoes`, o agregador devolve INCOMPLETO (código de saída 3). Falha do componente reprova o `resultado`. Teste no verificador e no agregador, no padrão dos testes existentes da MEL-08 (`agregar-ci.test.mjs`). Arquivo ilegível ou ausente (por exemplo `.mcp.json`) é **falha** do componente, não "aprovado por falta de dados". *Origem:* handoff §2; story MEL-08 AC3 e AC7.

**Nada muda além do verificador (limites da fatia 1)**

- [x] **AC13** — Dada a entrega da fatia 1, quando se compara o diff com a base, então `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `.claude/hooks/rea-niveis.json`, `.claude/hooks/ghidra-niveis.json`, `.mcp.json`, `.claude/settings.json`, `registros/_modelos/` e todo `registros/<slug>/00-seguranca.md` aparecem **sem diferença** (`git diff --name-only <base>` não lista nenhum deles). Além dos arquivos do verificador e da CI (File List), a **documentação do produto** que o diff lista é **somente** `docs/runbook-prereqs-nativo.md` e `docs/guia-rea.md` (D-2). Artefatos de processo não contam como documentação do produto e podem entrar: esta story, `docs/handoffs/` (inclusive `2026-11-02-estado-geral.md`), `docs/plano-de-execucao.md` (plano da Fase 0 da unidade) e `docs/planos/` (planos arquivados), como nos PRs da etapa 2 e no PR #11. Qualquer outro arquivo de `docs/` no diff reprova o AC. Nenhum `status` nem `niveis_aprovados` é lido de registro de alvo nem escrito. *Origem:* ADR §2f ("Não faz", linha 184, e "Documentação em prosa", linha 182), plano linha 280 ("não aprova nem migra níveis"), CLAUDE.md.
- [x] **AC14** — Dado o componente rodando, então ele não escreve em nenhum arquivo (teste: hash dos arquivos da fixture igual antes e depois), não executa o REA nem o Ghidra, não usa rede, e não lê `alvos/`, `saidas/` nem `registros/<slug>/`. Forma testável: o módulo lê uma **lista fechada** de arquivos (`.mcp.json`, `.claude/settings.json`, `.claude/hooks/*-niveis.json`, `package.json`, `package-lock.json`, `registros/_modelos/00-seguranca.md`, `docs/guia-rea.md`, `docs/runbook-prereqs-nativo.md`; os dois últimos, pelos pontos 7 e 8), e o teste afirma que nenhum caminho lido fica em `alvos/`, `saidas/` ou em `registros/` fora de `registros/_modelos/` (o verificador segue a mesma regra, `verificar.mjs:11`, que é comentário e não trava). **Ampliado pela fatia 2 (F2-AC24, revalidação @po de 2026-11-04):** a lista fechada passa a incluir `AUDITORIA_GHIDRA` (`docs/seguranca/auditoria-ghidramcp-2.0.md`) e os `docs/seguranca/*.md` apontados por `contrato.auditoria`, validados por padrão (F2-AC4); o resto do AC continua. *Origem:* ADR §2f ("Não faz") e R6.
- [ ] **AC15** — `npm test` verde, `npm run lint` e `npm run tipos` (ou o equivalente do verificador: componentes `lint` e `tipos`) verdes, e o `resultado` da CI do PR da fatia verde. *Origem:* handoff §2 e §5.

**Documentação em prosa (D-2; ADR §2f pontos 7 e 8 e "Documentação em prosa", linhas 171-172 e 182)** — AC novos, numerados em sequência para não renumerar os anteriores.

- [x] **AC16** — (ponto 7, detecta a D2) Dado o `docs/guia-rea.md`, quando o componente roda, então confere que ele **cita cada servidor do `.mcp.json` e o mapa dele** (`<servidor>-niveis.json`). Dado um servidor do `.mcp.json` que o guia não cita, ou citado sem o nome do mapa, reprova citando o servidor, o arquivo do guia e o mapa esperado. Teste com fixture em pasta temporária: guia que só cita `rea` e `rea-niveis.json`, com `.mcp.json` de `rea` e `ghidra`, reprova (o caso da D2 em `guia-rea.md:76-78`); guia que cita os dois e os dois mapas aprova. O componente só busca nomes, em texto de arquivo versionado. *Origem:* ADR §2f ponto 7 (linha 171), D2 (linha 43).
- [x] **AC17** — **Substituído pelo F2-AC21 da fatia 2** (revalidação @po, 2026-11-04; adendo 1 §5.4, DA-16): a conferência passa para `docs/seguranca/auditoria-ghidramcp-2.0.md`, e no runbook qualquer `GhidraMCP@` reprova. O texto abaixo e a marcação ficam como histórico da fatia 1, entregue; os testes com o rótulo "AC17" mudam de alvo na fatia 2. (ponto 8, detecta a D1) Dado o `docs/runbook-prereqs-nativo.md`, quando o componente roda, então confere que **toda referência `GhidraMCP@<ref>`** é **prefixo do commit** dos `args` do `.mcp.json` (`.mcp.json:14`). Dada uma referência que não é prefixo (como `@2.0`), reprova citando o arquivo, a referência e o commit esperado (abreviado). Teste com fixture: runbook com `GhidraMCP@2.0` reprova; com `GhidraMCP@1e98025` (prefixo do commit da fixture) aprova. **Runbook sem nenhuma referência `GhidraMCP@`: reprova** (fail-closed, como o AC7 trata o campo sem commit legível; P-6 decidida pelo responsável em 2026-11-04), com mensagem que cita o arquivo do runbook e diz que não há referência `GhidraMCP@<ref>` a conferir. Teste com fixture: runbook sem nenhuma `GhidraMCP@` reprova. No repositório real o caso não ocorre: o AC18 (a) mantém a referência. No repositório real, **hoje o ponto 8 falharia em `docs/runbook-prereqs-nativo.md:82`**, que usa `@2.0`: é o caso que o AC18 corrige. *Origem:* ADR §2f ponto 8 (linha 172), D1 (linha 42); caso sem referência: decisão do responsável (P-6, 2026-11-04).
- [x] **AC18** — (correção da documentação, D1–D3 e linha 100 do runbook) Dada a entrega da fatia 1, então: (a) **D1** — `docs/runbook-prereqs-nativo.md` passa a registrar o GhidraMCP com o commit e as fixações de `mcp` e `requests` de `.mcp.json:14-18`, no lugar da "tag 2.0" (`runbook-prereqs-nativo.md:74,82`), **mantendo a referência na forma `GhidraMCP@<commit>`** que o `.mcp.json:14` usa (`git+https://github.com/LaurieWired/GhidraMCP@<commit>`), para que o ponto 8 tenha o que conferir (ADR §2f: depois da correção, a D1 "é detectada pelo ponto 8") (**revogado neste ponto pela fatia 2**, F2-AC18 e F2-AC19, revalidação @po de 2026-11-04: a forma `GhidraMCP@<commit>` e o commit completo passam a morar só na auditoria nova; vale como histórico da fatia 1); (b) **D2** — `docs/guia-rea.md` ganha o servidor `ghidra` e o `ghidra-niveis.json` na tabela de instalação (`guia-rea.md:73-79`); (c) **D3** — `docs/guia-rea.md` passa a marcar Ghidra + JDK como instalados (`guia-rea.md:62`), conforme `runbook-prereqs-nativo.md:91-94` (instalação em 14/10/2026) e a informação do responsável (ADR §7, D-1); (d) **linha 100 do runbook** — `docs/runbook-prereqs-nativo.md:100` deixa de dizer que falta o @devops registrar o servidor `ghidra` no `.mcp.json` (já registrado: `.mcp.json:14-18`; o próprio runbook, linha 96, registra o `b92a651`); só prosa, sem nova checagem do componente (decisão do responsável de 2026-11-04, que amplia a D-2). Depois disso, o componente aprova o repositório real nos pontos 7 e 8 (AC16, AC17, AC10). A D3 **não é detectada** por nenhum AC: só corrigida. O que o responsável não disse nem o ADR registra (por exemplo, se o provider Ghidra do REA está em uso, 6.9) **não é afirmado** no texto corrigido. *Origem:* ADR §2f "Documentação em prosa" (linha 182), §7 (D-1, D-2), D1–D3 (linhas 42-44); item (d): decisão do responsável de 2026-11-04 (observação da validação @po, rodada 2).

### Rastreabilidade AC da fatia 1 → aceite do plano e ADR

| AC | Plano (linhas 278-281) | ADR |
|---|---|---|
| AC1, AC2 | P1 | §2f.1; §2c; D-lista "possíveis"; AC2: D-3 (2026-11-04) |
| AC3 | P1 (servidor e mapa incoerentes apontados) | §2c; §2f.1 (mensagem, linhas 174-180); §6 item 3; §7 D-4 |
| AC4, AC5, AC6 | P1, P2 (parte schema e nível) | §2f.2–3 |
| AC7 | "Trabalho proposto" (versão no contrato, linha 272) | §2f.4–5; D4 |
| AC8 | P3 (parte: modelo legível) | §2f.6 |
| AC9 | "Melhoria esperada" (linha 274) | §2f; R4 |
| AC10 a AC12 | "Dependências" (MEL-03 e MEL-08 como base de validação, linha 283) | §1.3; handoff §2 e §5 |
| AC13, AC14 | P3 (não migra nem aprova) | §2f "Não faz"; R6 |
| AC15 | — (qualidade da entrega) | handoff §2 e §5 |
| AC16, AC17 | "Trabalho proposto" (o verificador confere a documentação, handoff §5) | §2f pontos 7 e 8; D1, D2; §4; §7 D-2; AC17 sem referência: P-6 (responsável, 2026-11-04) |
| AC18 | — (correção de D1–D3 e da linha 100 do runbook; não é aceite P1–P4) | §2f "Documentação em prosa"; §7 D-1 e D-2; D1–D3; item (d): decisão do responsável (2026-11-04) |

Os aceites **P2 completo** (tool desconhecida e nível sem autorização recusados nos caminhos suportados), **P3 completo** (legado/inválido/revisão nova) e **P4** (matriz) **não** são atendidos pela fatia 1: ver as fatias 2 a 4b.

### Aceite do plano → onde é atendido (validação @po)

| Aceite (plano linhas 278-281) | Fatia 1 | Fatias seguintes | Lacuna |
|---|---|---|---|
| P1 — servidor sem classificação/entrada protegida apontado como incompleto | **Completo:** AC1 (sem mapa), AC2 (sem matcher), AC3 (mapa sem servidor), AC9 (mensagem) | — | — |
| P2 — tool desconhecida, schema inválido e nível sem autorização recusados nos caminhos suportados | Parte estática: AC4–AC6 (mapa inválido, tool sem nível, nível fora de `niveis`) | Fatia 4a (recusa no gate MCP, `Object.hasOwn`); fatia 4b (`cli-gate`; a recusa depende da 6.5) | "Caminhos suportados" sem definição (pendência P-4; a 6.5 fecha parte) |
| P3 — legado, inválido e revisão nova; não aprova nem migra | AC8 (modelo legível), AC13 (não aprova nem migra) | Fatia 3 (classificação); "Não faz" das fatias 3, 4a e 4b | Sentido de "revisão nova" (decisão 6.2) |
| P4 — inventário **e documentação** indicam a matriz cliente/provider | — | Fatia 2 (`contrato.clientes`, matriz impressa pelo verificador) | **Aberta como pergunta (P-7, rodada 2):** o ADR §2e põe a matriz em `contrato.clientes` e a imprime no verificador; não diz onde a matriz entra na documentação em prosa. A correção do ADR §4 (P-1) tratou D1–D3, não a matriz no P4 |

## Fatias seguintes (uma linha cada; critérios detalhados só quando a fatia for puxada)

- **Fatia 2 — bloco `contrato`/`atributos` nos mapas.** Faz: acrescenta `contrato` (schema, origem, catálogo, auditoria, recurso padrão, clientes) e `atributos` **obrigatório** nas 200 tools (`efeitos`, `conteudo_do_alvo`, `recurso`, `contexto_execucao`; DA-12 do adendo 1) nos dois mapas, e o verificador passa a exigi-los, com as regras C1 a C11 (C9 e C10 como aviso), imprimindo a matriz cliente/provider e conferindo-a no `guia-rea.md` (aceite P4); move a auditoria do GhidraMCP para `docs/seguranca/auditoria-ghidramcp-2.0.md` e reescreve o ponto 8 (substitui o AC17). **Estimativa G** (era P; o adendo 1 mudou a natureza). **Não faz:** não muda o gate (ele ignora os blocos novos), não aplica `familia` (U5) e não troca o valor de `ferramentas` (alternativa A1 descartada). Mexe no `rea-niveis.json`: conferir o estado da U5 antes (plano linha 69). ACs na story própria: [`mel-05-fatia-2-contrato-e-atributos.story.md`](mel-05-fatia-2-contrato-e-atributos.story.md) (Ready, 2026-11-04). *ADR §2a, §2d, §2e, §2f fatia 2; adendo 1 §3 a §5.*
- **Fatia 3 — schema do `00-seguranca.md`.** Faz: `schema: 00-seguranca/1` no modelo, parser compartilhado e relatório de registros versionados em legado, inválido ou revisão nova (aceite P3). **Não faz:** não reescreve registro, não migra, não edita `status` nem `niveis_aprovados`, não muda a decisão do gate. *ADR §2b, §2f fatia 3.*
- **Fatia 4a — gate MCP (`rea-gate.mjs`) com o parser compartilhado.** Faz: v1 estrito, legado pelo caminho atual, inválido nega, `Object.hasOwn` na busca da tool (`rea-gate.mjs:80`); entrega a parte MCP do aceite P2. **Não faz:** não toca `cli-gate.mjs`, não aprova nada, não afrouxa nenhum caso hoje negado, não entra sem regressão completa (`rea-gate.test.mjs`) e @qa. **Depende de:** fatia 3. *ADR §2f fatia 4a, R3.*
- **Fatia 4b — `cli-gate.mjs` com o parser compartilhado.** Faz: troca a regex duplicada (`cli-gate.mjs:93,95`) pelo parser compartilhado, com as mesmas regras da 4a. Se a 6.5 decidir que o CLI entra em "tool desconhecida recusada", também recusa comando sem classificação; o mapa de comando para nível que isso exige não existe hoje (D6) e o desenho dele fica para depois da 6.5. **Não faz:** não toca `rea-gate.mjs`, não aprova nada, não afrouxa nenhum caso hoje negado, não entra sem regressão completa (`cli-gate.test.mjs`) e @qa. **Depende de:** fatia 3; a parte da recusa depende também da 6.5. **Não depende da 4a:** as duas são separadas para que cada gate mude com regressão e revisão próprias. *ADR §2f fatia 4b, R3.*
- **Fatia 5 (opcional) — gerar o matcher.** Faz: gera o matcher de `settings.json` a partir dos mapas. **Não faz:** não gera `.mcp.json`. *ADR §2c, §2f fatia 5.*

## O que cada fatia não faz

| Fatia | Não faz |
|---|---|
| 1 | Não gera configuração. Não aprova nem migra níveis nem registros. Não aplica a família da P-U5. **Edita o runbook e o guia** (`docs/runbook-prereqs-nativo.md`, `docs/guia-rea.md`; D-2) e **só eles** na documentação do produto, além dos arquivos do verificador e da CI (File List); artefatos de processo (story, `docs/handoffs/`, `docs/plano-de-execucao.md`, `docs/planos/`) à parte (AC13). **Não toca `rea-gate.mjs` nem `cli-gate.mjs`**, nem mapas, `.mcp.json`, `settings.json`, `00-seguranca.md` (nem o modelo, nem registros). Não executa o REA nem lê o catálogo real do pacote (`mcp doctor` executa código do pacote; ADR R6). Não lê `alvos/`, `saidas/`, `registros/<slug>/`. Não detecta a D3 (só a corrige). O componente não corrige nada (mensagem do AC3); a correção é manual. Não classifica registros em legado/inválido/revisão nova. |
| 2 | Não muda o gate. Não aplica família. Não promete enforcement no Codex (ADR linha 160). |
| 3 | Não migra, não edita `status` nem `niveis_aprovados`, não muda a decisão do gate. |
| 4a | Não toca `cli-gate.mjs`. Não aprova nada. Não afrouxa caso hoje negado. Não aplica família da U5. Não entra sem regressão completa e @qa. |
| 4b | Não toca `rea-gate.mjs`. Não aprova nada. Não afrouxa caso hoje negado. Não aplica família da U5. Não desenha o mapa de comando para nível antes da 6.5. Não entra sem regressão completa e @qa. |
| 5 | Não gera `.mcp.json`. |
| Story inteira | Não faz MEL-06 nem MEL-07; não decide a semântica de aprovação por tool (D5) sem o responsável. |

## Decisões do responsável (ADR §6, linhas 221-234, e §7, linhas 236-244)

Numeração do ADR §6, estável. Decididas em 2026-11-04, na conversa com o responsável, e aplicadas à story pelo @sm. Nenhuma pergunta aberta é escolhida aqui.

**Decididas (2026-11-04):**

- **D-1 (ADR 6.1) — decidida.** ADR aceito (Proposto → Aceito, 2026-11-04). Informação do responsável: o Ghidra está instalado, o que resolve a D3: o guia (`guia-rea.md:62`) está desatualizado (ADR §7). O plano exigia ADR antes de alterar contratos (plano linha 283): cumprido.
- **D-2 (ADR 6.6) — decidida.** A correção da documentação em prosa (D1–D3) entra **junto com a fatia 1**, não em unidade própria. Efeito na story: tasks e File List do runbook e do guia, AC16 a AC18, "não faz" e estimativa da fatia 1 (continua M). **Ampliada em 2026-11-04** (ver abaixo): D1–D3 mais a linha 100 do runbook.
- **D-4 (ADR 6.3) — decidida.** Mapa de níveis sem servidor no `.mcp.json` não tem utilidade e **falha**, com causas e soluções na mensagem (ADR §2f ponto 1). Efeito: AC3 reescrito.

**Fechada em 2026-11-04 (ver "Decisões do responsável (2026-11-04, após o início da E3-1)"):**

- **D-3 (ADR R1) — semântica de casamento do matcher no Claude Code — fechada.** O responsável aceitou o pressuposto fail-closed do AC2 e o @architect confirmou a semântica pela documentação do Claude Code (hooks reference). O comportamento concreto está no AC2. Resta, sem bloquear nada, o tratamento do `_` dentro do nome do servidor (não documentado; a confirmar), coberto pelo fail-closed do AC2.

### Decisões do responsável (2026-11-04, após o início da E3-1)

Respostas do responsável registradas em `docs/plano-de-execucao.md` §5, aplicadas à story pelo @po.

- **P-6 — decidida: reprova.** Runbook sem nenhuma referência `GhidraMCP@<ref>` reprova no ponto 8 (fail-closed, como o AC7 trata o campo sem commit legível). Efeito: AC17 fixa o caso, com mensagem e teste.
- **Linha 100 do runbook — entra na fatia 1.** `docs/runbook-prereqs-nativo.md:100` diz que falta registrar o servidor `ghidra` no `.mcp.json`, já registrado. Amplia a D-2 (D1–D3 mais a linha 100). Efeito: AC18 (d), só prosa; task da correção da documentação.
- **D-3 — fechada com o pressuposto aceito.** Semântica confirmada pelo @architect (hooks reference): matcher só com letras, dígitos, `_`, `-`, espaço, `,` e `|` é lista de nomes exatos; outro caractere torna-o regex JavaScript testada com `RegExp.prototype.test` (parcial, sem âncora); `*` ou vazio casa tudo; servidor de plugin vira `mcp__plugin_<plugin>_<servidor>__<tool>`, que o matcher atual nunca pega; `_` dentro do nome do servidor não é documentado (a confirmar). Efeito: AC2 com o comportamento concreto e os casos negativos.

**Abertas (ADR §6: 2, 4, 5, 7, 8, 9, 10) e o que cada uma bloqueia.** Nenhuma bloqueia a fatia 1.

| ADR | Pergunta | Bloqueia |
|---|---|---|
| 6.2 | "Revisão nova": revisão do schema ou protocolo novo para versão nova do alvo? | Fatia 3 |
| 6.4 | Semântica de aprovação: por nível, como hoje, ou por tool via adendo (D5)? | Antes de detalhar a fatia 3 (desenho do schema) e a 4a. O ADR não diz a que fatia a 6.4 pertence; a atribuição vem da story validada ("fatia 4 e o desenho do schema"), aplicada à 4a, que é o gate onde a D5 vive. A confirmar |
| 6.5 | O CLI entra em "tool desconhecida recusada" (D6) ou fica fora dos "caminhos suportados"? | Só a **parte da recusa** da fatia 4b e o aceite P2 no CLI; a troca do parser na 4b e a 4a não dependem dela. Ligada ao P-4 (definição de "caminhos suportados") |
| 6.7 | Auditoria do GhidraMCP: manter no runbook (`runbook-prereqs-nativo.md:67`) ou mover para `docs/seguranca/`? | Fatia 2 (campo `auditoria` do contrato). A fatia 1 não move a auditoria; só corrige o registro do commit no runbook (AC18) |
| 6.8 | Localização do parser compartilhado (`.claude/hooks/lib/` ou `scripts/`) e se a fatia 3 valida registros reais na CI | Fatia 3; por consequência, 4a e 4b. Na fatia 1 é só nota: `rea-gate.mjs` não exporta nada (roda ao ser importado), então o AC8 reimplementa as regras num módulo do verificador, com teste que prende a equivalência |
| 6.9 | Estado inicial da matriz (§2e), incluindo o uso do provider Ghidra pelo REA, e prazo do adaptador do Codex | Fatia 2 |
| 6.10 | Gerar o matcher (fatia 5) ou só conferir | Fatia 5 |

**Resultado para a fatia 1:** D-1, D-2 (ampliada) e D-4 decididas; D-3 fechada e P-6 decidida (2026-11-04); nenhuma das abertas (2, 4, 5, 7, 8, 9, 10) impede o início. Não resta pendência de decisão que toque a fatia 1.

## Dependências e coordenação

- **Decisões do responsável (ADR §7):** D-1, D-2 e D-4 decididas em 2026-11-04; a fatia 1 não tem dependência pendente deles. Fatias 4a e 4b são independentes entre si e dependem da fatia 3.
- **MEL-03** (verificador): fatia 1 entregue; o componente novo segue o padrão `depende`/`requisito`.
- **MEL-08** (CI agregada): InReview, CI ativa e `main` protegido; a fatia 1 entra pelo PR com o `resultado` verde (handoff §2). A dívida D-1 do handoff (novo gate @qa da MEL-08) não bloqueia (handoff §3).
- **Plano de perfil do alvo / P-U5** (família de tool no `rea-niveis.json`): a fatia 1 não mexe no `rea-niveis.json`. A partir da fatia 2, quem chegar primeiro registra a mudança e o outro adapta (plano linha 69); antes de qualquer edição conferir `docs/planos/2026-11-01-perfis-alvo.md`. O piloto continua orientativo: U1–U4 não autorizam filtro de tools nem mudança no gate (plano linha 285).
- **MEL-06 e MEL-07**: depois, nessa ordem (handoff §5). O campo `contexto_execucao` é só declarado no contrato (fatia 2), insumo da MEL-06.

## Riscos

- **R-matcher.** Casamento do matcher no Claude Code não confirmado (ADR R1): falsa confiança. Mitigação: D-3 fechada em 2026-11-04 (semântica confirmada pelo @architect pela documentação do Claude Code; o AC2 a reproduz), fail-closed para matcher fora da forma `mcp__(n1|n2…)__.*`, teste do caso inverso e dos casos negativos do AC2. Resta não documentado o `_` no nome do servidor, coberto pelo fail-closed.
- **R-classificação.** O verificador confere forma, não risco: nível errado de tool perigosa só a auditoria pega (ADR R2). A fatia 1 não promete detectá-lo.
- **R-catálogo.** A fatia 1 não compara o mapa com o catálogo real do REA (ADR R6); tool nova do pacote sem entrada no mapa só aparece na chamada (o gate nega) ou numa fatia futura, se o responsável quiser comparação com o catálogo.
- **R-caminho de segurança.** As fatias 4a e 4b mexem num gate cada: regressão pode liberar demais ou bloquear tudo (ADR R3). Mitigação: fail-closed, testes de mutação, regressão e @qa próprios de cada uma. Fatia 1 não tem esse risco (AC13).
- **R-documentação presa ao `.mcp.json`.** Os pontos 7 e 8 prendem o guia e o runbook ao `.mcp.json` (ADR §4): mudar um servidor passa a exigir a documentação no mesmo commit. É custo aceito com a D-2. Os pontos só buscam nomes e referências; texto reformulado sem o nome do servidor ou do mapa reprova.
- **R-D3 não detectada.** A D3 (Ghidra instalado) é estado da máquina e a fatia 1 só corrige o texto; pode voltar a divergir sem a CI saber (ADR §2f, linha 182).
- **R-registros.** Registros de alvo são dados derivados do alvo (ADR R4): o componente não os lê e as mensagens não ecoam trechos longos.
- **R-estimativa.** O plano dimensiona a MEL-05 em M. Com a divisão da fatia 4 (P-5, 2026-11-04), cada fatia fica em P ou M (a 4b pode ir a G se a 6.5 exigir o mapa de comando para nível), mas a soma (M + P + M + M + M + P) ainda passa do M do plano. *Atualização @po (2026-11-04):* com o adendo 1, a fatia 2 passou a G e há a fatia 2b (P); a soma fica M + G + P + M + M + M + P. Mudar o tamanho do plano é decisão do responsável; o @po confere com ele antes de puxar a fatia 3.
- **R-CI.** Mais um componente no job `js` (ADR §4): custo de tempo pequeno por ser leitura estática; medir no primeiro PR.

## Definition of Done

**Fatia 1:** AC1–AC18 marcados com evidência (o AC2 com a semântica da D-3, fechada em 2026-11-04, e os casos negativos; o AC17 com o caso "sem referência" reprovando, P-6 decidida em 2026-11-04; o AC18 com a linha 100 do runbook corrigida); `npm test` verde; `resultado` da CI do PR verde; decisões D-1, D-2 e D-4 respondidas e registradas (feito em 2026-11-04, ADR §7); runbook e guia corrigidos (AC18) e o componente aprovando o repositório real; @qa com gate; push e PR pelo @devops com autorização do responsável; merge só com o "sim" do responsável (handoff §2). **Status por fatia:** a story alterna InProgress (fatia em implementação) e InReview (fatia em revisão @qa); hoje, InReview = fatia 1 em revisão. Um gate PASS ou CONCERNS de fatia que não seja a última **não** leva a story a Done: ela volta a InProgress quando a fatia seguinte é puxada. A story só vai a Done depois do gate da última fatia e do aceite P1–P4 do plano (linhas 278-281) com evidência, aceito pelo responsável; fatias 2 a 5 são puxadas uma por vez, cada uma com validação @po de seus ACs. Artefatos de processo admitidos no diff da fatia 1 (AC13): esta story, `docs/handoffs/`, `docs/plano-de-execucao.md` e `docs/planos/`; na documentação do produto, só o runbook e o guia.

## Tasks

- [x] Responsável decide D-1 (aceite do ADR), D-2 (documentação junto com a fatia 1) e D-4 (mapa órfão falha) — 2026-11-04; registrado no ADR §7 e nesta story.
- [x] Aplicar as decisões na story (@sm) — 2026-11-04.
- [x] @architect confirma D-3 (semântica do matcher) ou o responsável aceita o pressuposto — 2026-11-04, os dois: pressuposto aceito e semântica confirmada; AC2 atualizado pelo @po.
- [x] Responsável decide a P-6 (reprova) e a linha 100 do runbook (entra na fatia 1) — 2026-11-04; aplicadas pelo @po (AC17, AC18 (d)).
- [x] Validação @po da story (10 pontos) — 2026-11-04, GO condicional.
- [x] Nova rodada de validação @po sobre o AC3 reescrito e os AC16 a AC18 — 2026-11-04, rodada 2, GO (ver "Validação @po (2026-11-04, rodada 2)").
- **Fatia 1**
  - [x] Módulo do verificador de integrações (leitura estática, sem escrita, sem rede, sem `alvos/`/`saidas/`/`registros/<slug>/`). *Evidência:* `scripts/integracoes/verificar-integracoes.mjs` (commit `a74ffab`); testes AC14 (hash antes e depois, lista fechada de leitura, módulo sem `child_process`/rede/escrita).
  - [x] Checagens 1 a 6 do ADR §2f com mensagens por contrato (AC1–AC9), inclusive a mensagem do mapa sem servidor, com as três causas e soluções (AC3). *Evidência:* 38 testes em `verificar-integracoes.test.mjs`, verdes; AC8 com o gate em subprocesso.
  - [x] Checagens 7 e 8 do ADR §2f: o guia cita cada servidor do `.mcp.json` e o mapa dele (AC16); toda referência `GhidraMCP@<ref>` do runbook é prefixo do commit do `.mcp.json` (AC17). *Evidência:* antes da correção, o componente reprovou o repositório real exatamente em `guia-rea.md` (`ghidra-niveis.json`) e em `runbook-prereqs-nativo.md` (`GhidraMCP@2.0`).
  - [x] Corrigir `docs/runbook-prereqs-nativo.md` (D1: commit e fixações de `mcp` e `requests` de `.mcp.json:14-18`, no lugar de `@2.0`, linhas 74 e 82) e `docs/guia-rea.md` (D2: servidor `ghidra` e `ghidra-niveis.json` na tabela, linhas 73-79; D3: Ghidra + JDK instalados, linha 62) e a linha 100 do runbook (servidor `ghidra` já registrado no `.mcp.json`; decisão do responsável de 2026-11-04) (AC18). Só esses dois arquivos de documentação. *Evidência:* commit `df08f96`.
  - [x] Testes com fixtures em pasta temporária, um por caso dos AC1–AC9, AC16 e AC17 (no AC3, os dois cenários, com uma asserção por causa e a de que reprova; no AC2, os casos negativos da D-3; no AC17, o caso "sem referência" reprovando, P-6 decidida em 2026-11-04), e teste de não escrita (AC14).
  - [x] Componente `integracoes` em `verificar.mjs` (`depende: ["ambiente-node"]`) e `--so integracoes` (AC10). *Evidência:* commit `4772d3f`; saída no repositório real em Dev Notes.
  - [x] `JOBS` do agregador e `--so` do `verificacao.yml` (job `js`) na mesma mudança; `workflow-ci.test.mjs` verde (AC11), com teste que tira `integracoes` de um lado só e reprova.
  - [x] Teste do "não executado nunca é verde" no verificador e no agregador (AC12).
  - [x] `package.json` (script `test`) e `tsconfig.json` (`files`: módulo tratado como de política, ver Dev Notes).
  - [x] Conferir `git diff --name-only` contra a lista do AC13 (na documentação do produto, só o runbook e o guia; artefatos de processo à parte; além do verificador e da CI); `npm test`, lint e tipos verdes (AC15). *Evidência:* Dev Notes, "Resultado da fatia 1". O `resultado` da CI do PR fica pendente (AC15 sem marcar).
  - [x] Registrar na story o resultado do componente sobre o repositório real, com a documentação já corrigida, inclusive qualquer reprovação (AC10).
- [ ] Fatias 2, 3, 4a, 4b e 5: criar os ACs detalhados quando puxadas (não nesta story, por ora), cada uma com validação @po.

## File List (previsto)

**Fatia 1, real (2026-11-04, @dev):** criados `scripts/integracoes/verificar-integracoes.mjs` e `scripts/integracoes/verificar-integracoes.test.mjs`; alterados `docs/runbook-prereqs-nativo.md`, `docs/guia-rea.md`, `scripts/verificar/verificar.mjs`, `scripts/verificar/verificar.test.mjs`, `scripts/verificar/agregar-ci.mjs`, `scripts/verificar/agregar-ci.test.mjs`, `scripts/verificar/workflow-ci.test.mjs`, `.github/workflows/verificacao.yml`, `package.json`, `tsconfig.json`, esta story. Artefatos de processo no mesmo branch: `docs/plano-de-execucao.md` (modificado contra `main`: o plano da E3-0 foi arquivado e o arquivo passou a conter o plano da E3-1) e `docs/planos/2026-11-04-e3-0-preparo-mel05.md` (novo: o plano da E3-0 arquivado, a partir do antigo `docs/plano-de-execucao.md`). Igual ao previsto abaixo, mais os dois artefatos de processo e o `workflow-ci.test.mjs`.

Fatia 1 (previsto):

- `docs/stories/mel-05-contratos-integracoes.story.md` — esta story.
- `scripts/integracoes/verificar-integracoes.mjs` (novo, nome sugerido pelo ADR) — verificador de consistência.
- `scripts/integracoes/verificar-integracoes.test.mjs` (novo) — testes dos AC1–AC9, AC16, AC17 e AC14.
- `docs/runbook-prereqs-nativo.md` — D1: registro do GhidraMCP com o commit e as fixações de `.mcp.json:14-18`; linha 100 (servidor `ghidra` já registrado) (AC18, D-2 ampliada).
- `docs/guia-rea.md` — D2 (servidor `ghidra` e `ghidra-niveis.json`) e D3 (Ghidra + JDK instalados) (AC18, D-2).
- `scripts/verificar/verificar.mjs` — componente `integracoes`.
- `scripts/verificar/verificar.test.mjs` — "não executado" do componente (AC12).
- `scripts/verificar/agregar-ci.mjs` — `integracoes` em `JOBS`, job `js`.
- `scripts/verificar/agregar-ci.test.mjs` — JSON do `js` sem o componente → INCOMPLETO (AC12).
- `.github/workflows/verificacao.yml` — `--so` do job `js`.
- `package.json` — script `test`.
- `tsconfig.json` — lista `files`, se módulo de política.

Fatias 2, 3, 4a, 4b e 5 (previsão, a detalhar): `.claude/hooks/rea-niveis.json`, `.claude/hooks/ghidra-niveis.json`, `registros/_modelos/00-seguranca.md`, parser compartilhado, `rea-gate.mjs` (4a), `cli-gate.mjs` (4b), `.claude/settings.json`, documentação.

**Não devem mudar na fatia 1 (AC13):** `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `.claude/hooks/*-niveis.json`, `.mcp.json`, `.claude/settings.json`, `registros/` (inclusive `registros/_modelos/`). Em `docs/`, só o runbook e o guia mudam na documentação do produto; artefatos de processo (esta story, `docs/handoffs/`, `docs/plano-de-execucao.md`, `docs/planos/`) à parte (AC13).

## Dev Notes

- **Fonte do desenho:** ADR-0001 (Aceito, 2026-11-04). Levantamento de onde cada arquivo declara o quê: ADR linhas 15-36. Divergências D1–D6: linhas 40-47 (possíveis, sem detecção: 49-58). Onde o componente entra no verificador e na CI: linhas 60-66. Fatia 1, com a mensagem do mapa sem servidor e a documentação em prosa: linhas 164-184. Fatias 2 a 5, 4a e 4b: linhas 185-190. Consequências (§4): linhas 197-210. Riscos: linhas 212-219. Perguntas: linhas 221-234. Decisões do responsável: linhas 236-244.
- **Pontos 7 e 8 (documentação):** só buscam nomes e referências em arquivo versionado (ADR linha 182). Ponto 7: servidor do `.mcp.json` (chave de `mcpServers`) e `<servidor>-niveis.json` citados em `docs/guia-rea.md`. Ponto 8: cada ocorrência de `GhidraMCP@<ref>` em `docs/runbook-prereqs-nativo.md` é prefixo do commit dos `args` de `.mcp.json:14`. O formato exato da busca (regex, caixa, o que conta como "citar") é do @dev; a story só fixa o contrato e os casos de teste (AC16, AC17).
- **Mapa sem servidor (AC3):** o nome do servidor sai do nome do arquivo, `<servidor>-niveis.json` ↔ `mcp__<servidor>__` (`rea-gate.mjs:63-85`). A mensagem é multilinha por exigência do ADR (causas com solução); o componente não corrige nada.
- **`rea-gate.mjs` não exporta nada** (executa ao ser importado): o verificador não pode importar as regras dele. As regras de leitura de `status`, `niveis_aprovados` e seção de identidade são as de `rea-gate.mjs:150,157,183-212,278-281` (e `cli-gate.mjs:93,95`, duplicadas). Reimplementar com teste de equivalência; unificar é fatia 3/4 (decisão 6.8).
- **Leitura do mapa:** o gate só lê `ferramentas`, `versao`/`rea_version` e `niveis` (ADR linha 75; `rea-gate.mjs:80,84,293`). O verificador deve tolerar os dois cabeçalhos atuais (D4) sem exigir schema comum; isso é a fatia 2.
- **Matcher:** `.claude/settings.json:10` (`mcp__(rea|ghidra)__.*`, ADR linha 21). O matcher de `Bash|PowerShell` (`settings.json:20-25`) é do `cli-gate` e fora do alcance dos AC2. Semântica de casamento: D-3, fechada em 2026-11-04; o comportamento que o componente reproduz está no AC2.
- **Ghidra:** o commit do mapa é texto livre (`ghidra-niveis.json:3`, "commit 1e98025") e o do `.mcp.json` é completo (`.mcp.json:14-18`): daí o "prefixo" do AC7 (ADR linha 20, §2f.5).
- **Regras da CI a respeitar** (handoff §2): componente novo precisa estar em algum job; `--so` do YAML igual ao `JOBS`; action fora da auditoria reprova; "não executado" nunca é verde.
- **Resultado da fatia 1 (@dev, 2026-11-04).**
  - *Repositório real, antes da correção da documentação:* o componente reprovou com 2 achados, exatamente a D2 e a D1: `[documentação] docs/guia-rea.md (mapa ghidra-niveis.json)` e `[documentação] docs/runbook-prereqs-nativo.md (GhidraMCP@2.0)`. Os pontos 1 a 6 aprovaram, como o ADR previa.
  - *Repositório real, depois (AC10):* `node scripts/verificar/verificar.mjs --so integracoes` → `integracoes aprovado 0 s contratos coerentes`, `Resultado: APROVADO`; o `--json` traz `{"id":"integracoes","estado":"aprovado","detalhe":"contratos coerentes","duracao_s":0}` com `total.codigo` 0.
  - *Prova do ponto 8 contra `@2.0`:* numa cópia temporária dos arquivos da lista fechada (o runbook real não foi tocado), trocar o commit completo do runbook por `GhidraMCP@2.0` reprova: `referência GhidraMCP@2.0 não é prefixo do commit 1e98025… do .mcp.json`; a cópia fiel tem 0 achados.
  - *Testes:* `npm test` 320/320 aprovados, 0 pulados, 0 falhas (Docker ligado, gitleaks rodaram); `npm run lint` e `npm run tipos` aprovados; `npm run verificar` completo (Docker ligado): APROVADO, 17 componentes aprovados, 0 falhas, 0 não executados (`integracoes` em 0 s). Mutação manual (revertida): `status` lido sem aspas faz falhar os dois testes do AC8 (inclusive a equivalência com o gate); cobertura só pela leitura parcial faz falhar o teste de cobertura do AC2.
  - *AC13:* `git diff --name-only main` lista só verificador, CI, `package.json`, `tsconfig.json`, o runbook, o guia e artefatos de processo (esta story, `docs/plano-de-execucao.md`, `docs/planos/2026-11-04-e3-0-preparo-mel05.md`); nenhum gate, mapa, `.mcp.json`, `settings.json` ou arquivo de `registros/`.
- **Decisões do @dev na fatia 1.**
  - *AC8, oráculo do gate:* a equivalência se prende a saídas observáveis do `rea-gate.mjs` em subprocesso: "sem frontmatter" (linha 151); `status "<lido>"` na negação da linha 158; a lista lida de `niveis_aprovados` na negação "fora do plano aprovado (…)" da linha 283, com o status forçado a `aprovado` numa cópia e uma tool N2 como sonda; e a contagem de seções de identidade pelas negações "falta a seção"/"repetida" (linhas 189-193), com uma tool N0 e caminho em `alvos/<slug>/`. As tools de sonda vêm do mapa real, só lido.
  - *Status reconhecidos do modelo:* `pendente | aprovado | reprovado`, os do comentário do próprio `registros/_modelos/00-seguranca.md` (linha 13).
  - *Matcher:* com a regra da D-3; cobertura testada com `mcp__<servidor>__x`; o inverso só se lê quando o matcher está na forma `mcp__(n1|n2…)__.*` (fora dela, o fail-closed já reprova). Entradas do `PreToolUse` consideradas: as que acionam `.claude/hooks/rea-gate.mjs`; se nenhuma aciona, reprova.
  - *Ponto 8:* referência = texto depois de `GhidraMCP@` até espaço, aspas, crase, parêntese, colchete, vírgula ou ponto e vírgula, sem ponto final; vale se for hexadecimal e prefixo do commit, sem tamanho mínimo (o ADR não fixa um). A prosa do runbook evita a forma literal `GhidraMCP@<ref>`, que o próprio ponto 8 reprovaria.
  - *Ponto 4 e 5:* só se o mapa do servidor existe (`rea-niveis.json` → versões do `rea-agents`; `ghidra-niveis.json` → commit); sem o mapa, o ponto 1 já reprova.
  - *`tsconfig.json`:* o módulo entrou em `files` como módulo de política (confere os contratos de segurança na CI, como `publicacao` e `verificar-perfis`); a pendência de tipos do verificador passou a citá-lo.
  - *Componente no processo do verificador:* importado (como o `gitleaks`), não por `nodeRun`; exceção vira falha pelo `executarPlano`.
- **Achados para o @po e o @qa (sem correção de AC).**
  - *AC13 e o plano de execução:* o AC13 cita como artefatos de processo "esta story, `docs/handoffs/`"; o branch leva também `docs/plano-de-execucao.md` e a renomeação para `docs/planos/2026-11-04-e3-0-preparo-mel05.md`, por instrução da unidade E3-1. A leitura literal ("qualquer outro arquivo de `docs/`") os reprovaria; cabe ao @po confirmar que contam como processo. *Resolvido pelo @po (2026-11-04, QA-6):* `docs/plano-de-execucao.md` e `docs/planos/` contam como artefatos de processo; AC13, "não faz", File List e DoD ampliados.
  - *Commit do módulo (`a74ffab`):* levou junto a renomeação do plano, que já estava no índice ao criar o branch. Inofensivo (artefato de processo), mas o commit não é só de código.
  - *Gate e `_` no nome:* a regex do gate (`rea-gate.mjs:63`) tem a flag `i`, então aceita maiúsculas; o verificador segue a story (`[a-z0-9-]+`, minúsculas) e é mais estrito. Sem efeito hoje.
- **Constitution Art. IV:** nada acima inventa requisito; os pontos sem fonte (comparação com o catálogo real, matriz na documentação do P4) estão em "Lacunas"; o caso "referência ausente" do ponto 8 foi decidido pelo responsável (P-6, 2026-11-04).

## Lacunas das fontes (para o @po e o responsável)

*Tratamento na validação @po:* lacuna 1 → P-1; 2 → P-2; 3 → P-5; 4 → P-4; 5 → tabela "Aceite do plano → onde é atendido"; nota de `rea-gate.mjs` → AC8 e P-3.

**Situação em 2026-11-04 (decisões do responsável e ADR atualizado):**

- **P-1 — resolvida (2026-11-04)**, pela correção do ADR §4 (linhas 197-210, §7): o texto não diz mais que as D1–D3 passam a ser detectáveis. Diz que a D1 e a D2 são **corrigidas** na fatia 1 e **passam a ser detectáveis** pelos pontos 8 e 7 do §2f (AC17 e AC16), e que a D3 é **só corrigida, sem detecção**. A inconsistência entre §4 e §2f deixou de existir. Resta, como pergunta aberta, só a parte "documentação" do **P4** (matriz): o ADR não diz como ela entra na prosa (ver tabela "Aceite do plano → onde é atendido").
- **P-5 — resolvida (2026-11-04)**, pela divisão da fatia 4 em 4a e 4b (ADR §2f, linhas 187-188; §7). A "fatia 4 tende a G" (lacuna 3, R-estimativa) deixa de ser uma fatia única; restam o risco da soma contra o M do plano e a 4b que pode ir a G se a 6.5 exigir o mapa de comando para nível (R-estimativa).
- **P-2, P-3, P-4** seguem como estavam na validação @po (P-4 ligada à 6.5).

1. **Documentação em prosa não era verificada** — *resolvida, ver P-1 acima.* O plano e o handoff dizem que o verificador confere `.mcp.json`, matcher, mapas **e documentação**; o ADR agora tem os pontos 7 e 8 (linhas 171-172), só de nomes e referências. Antes (validação @po) isso era pergunta ao @architect/responsável.
2. **"Tool do catálogo sem classificação"** só pode ser conferido contra o catálogo real do pacote, que o ADR deixa fora da fatia 1 (R6: executa código do pacote; "onde o catálogo mora no pacote está a confirmar"). O AC5 cobre a tool presente no mapa sem classificação. Comparar mapa × catálogo (inclusive `catalog_digest` e a contagem de 170 tools) precisa de decisão e de fatia própria.
3. **Tamanho por fatia:** o ADR não dá estimativa por fatia; as da tabela são do @sm. *A parte "fatia 4 tende a G" foi resolvida pela P-5 (divisão em 4a e 4b).*
4. **Aceite P2 ("recusados nos caminhos suportados"):** o ADR não define quais são os "caminhos suportados"; a decisão 6.5 (CLI) fecha parte disso.
5. **Matriz cliente/provider (P4):** só existe depois da fatia 2; a fatia 1 não atende esse aceite.
6. **(nova) Ponto 8 sem referência.** O ADR diz que toda referência `GhidraMCP@<ref>` do runbook é prefixo do commit; não diz o que fazer se o runbook não tiver nenhuma. *Tratamento na rodada 2 do @po:* aprovar por vacuidade não tem fonte e esvazia a detecção da D1; o AC17 deixou de fixar o caso e virou pendência P-6 (responsável ou @architect). O AC18 (a) mantém a referência no runbook real. *Decidida em 2026-11-04 pelo responsável: reprova (fail-closed); o AC17 fixa o caso e ganha o teste.*
7. **(nova) Dependência da fatia 5.** O ADR §2f diz "Depende de: fatia 1 e pergunta 6.10". *Resolvida na rodada 2 do @po:* vale o ADR aceito; a "fatia 2" da tabela não tinha fonte (gerar o matcher precisa só dos mapas que já existem, descobertos pelo nome, ADR §2c C2) e foi corrigida.
8. **(nova) Fatia 4a e a 6.4.** O ADR não diz a que fatia a pergunta 6.4 (semântica de aprovação) pertence depois da divisão; a story a manteve na 4a e no desenho do schema (fatia 3), pela atribuição que já tinha. A confirmar.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-04 | Story criada (Draft), unidade E3-0b da etapa 3, a partir do plano §6, do ADR-0001 (Proposto) e do handoff de fechamento da etapa 2; fatia 1 detalhada, fatias 2 a 5 em uma linha; sem validação @po | @sm (River) |
| 2026-11-04 | Validação @po (unidade E3-0c): 8,5/10 como estava; correções de AC ambíguo (AC3, AC6, AC7, AC8, AC14), rastreabilidade (AC7, AC10–AC12, AC15; tabela aceite do plano → fatia) e dependências das fatias 2 e 4; D-3 esclarecida; 9,5/10, GO condicional; status Draft → Ready | @po (Pax) |
| 2026-11-04 | Aplicação das decisões do responsável e do ADR atualizado (ADR §7): D-1 (ADR aceito), D-2 (D1–D3 na fatia 1: pontos 7 e 8, AC16 a AC18, tasks e File List do runbook e do guia, "não faz" e estimativa; fatia 1 continua M), D-4 (AC3 reescrito com mensagem de três causas e um teste por causa), P-5 (fatia 4 em 4a e 4b), P-1 resolvida pelo §4 corrigido; perguntas do ADR §6 reclassificadas (decididas 1, 3, 6; abertas 2, 4, 5, 7, 8, 9, 10), linhas do ADR atualizadas; AC9, AC10, AC13 e AC14 ajustados às mudanças. Status segue Ready; fatia 1 liberada quanto às decisões do responsável. A seção "Validação @po" não foi alterada; nova rodada do @po pendente (AC3, AC16 a AC18) | @sm (River) |
| 2026-11-04 | Validação @po, rodada 2 (só o que mudou): 8,5/10 como estava; AC3 sem ambiguidade (as três causas sempre na mensagem, dois cenários de teste), AC13 sem conflito com artefatos de processo em `docs/handoffs/` (e "não faz" e File List alinhados), AC17 sem fixar o caso "sem referência" (P-6), AC18 (a) mantém a forma `GhidraMCP@<commit>`, dependência da fatia 5 alinhada ao ADR (fatia 1); lacunas 6 e 7 tratadas; pendências P-6 e P-7 novas; 9,5/10, GO. Status segue Ready | @po (Pax) |
| 2026-11-04 | Decisões do responsável após o início da E3-1 (`docs/plano-de-execucao.md` §5): P-6 decidida, runbook sem `GhidraMCP@` reprova (AC17 com mensagem e teste); linha 100 do runbook entra na fatia 1, ampliando a D-2 (AC18 (d), task, File List); D-3 fechada com o pressuposto aceito e a semântica confirmada pelo @architect (AC2 com a regra da hooks reference, cobertura nas leituras parcial e ancorada, fail-closed fora de `mcp__(n1|n2…)__.*` e casos negativos). Estado, tabela de fatias, decisões, R-matcher, DoD, tasks, lacuna 6 e pendências da rodada 2 atualizados. Pontuação da validação inalterada. Status segue Ready | @po (Pax) |
| 2026-11-04 | **Transição de status: Ready → InProgress.** Início da fatia 1 (unidade E3-1), branch `feat/e3-1-integracoes` a partir de `main` @ `a431045`; modo YOLO | @dev (Dex) |
| 2026-11-04 | Fatia 1 implementada: módulo `scripts/integracoes/verificar-integracoes.mjs` (pontos 1 a 8 do ADR §2f) com 38 testes, inclusive a equivalência do AC8 com o gate em subprocesso (`a74ffab`); runbook e guia corrigidos (D1–D3 e linha 100) (`df08f96`); componente `integracoes` no verificador, no job `js`, no `npm test` e no `tsconfig.json` (`4772d3f`). `npm test` 320/320, lint, tipos e `npm run verificar` completo aprovados; componente aprova o repositório real. AC1–AC14 e AC16–AC18 marcados; AC15 aguarda o `resultado` da CI do PR. Achados para o @po em Dev Notes (AC13 e o plano de execução). **Transição de status: InProgress → InReview** | @dev (Dex) |
| 2026-11-04 | QA gate da fatia 1: **CONCERNS** (sem achado high; 1 medium e 7 low; 5 mutações sobreviventes de 30 no módulo, 3 de CI todas mortas; AC13 com lacuna de texto para o @po, AC15 pendente da CI do PR). Status **mantido em InReview**: a story só vai a Done depois da última fatia; a fatia 1 segue para push/PR pelo @devops com autorização do responsável. Ver "QA Results" | @qa (Quinn) |
| 2026-11-04 | Correções pedidas pelo gate @qa da fatia 1: (1) QA-6: `docs/plano-de-execucao.md` e `docs/planos/` passam a contar como artefatos de processo no AC13, no "não faz" da fatia 1, na lista "Não devem mudar" da File List e na DoD; a documentação do produto continua só runbook e guia; achado do @dev em Dev Notes marcado como resolvido. (2) QA-8: File List corrigida, `docs/plano-de-execucao.md` modificado contra `main` e `docs/planos/2026-11-04-e3-0-preparo-mel05.md` novo (plano da E3-0 arquivado). (3) DoD harmonizada com o SDC por fatia: InReview = fatia em revisão @qa (hoje a fatia 1); a story volta a InProgress na fatia seguinte e só vai a Done depois do gate da última fatia e do aceite P1–P4. Valor do Status inalterado (InReview); "QA Results" não alterada | @po (Pax) |
| 2026-11-04 | Revalidação @po do AC17 e dos trechos substituídos pela fatia 2 (story `mel-05-fatia-2-contrato-e-atributos.story.md`, Ready, e adendo 1 do ADR-0001, Aceito): AC17 marcado como substituído pelo F2-AC21; AC18 (a) revogado no ponto da forma `GhidraMCP@<commit>` no runbook (F2-AC18, F2-AC19); AC14 ampliado (F2-AC24); linha da fatia 2 na tabela de fatias (atributos obrigatório, G, dependências decididas, links das stories 2 e 2b); descrição da "Fatia 2"; nota em R-estimativa. Fatia 1 não reaberta: marcações, Dev Notes, tasks e "QA Results" intactos. Status inalterado (InReview) | @po (Pax) |
| 2026-11-04 | Correções dos achados low do gate @qa (QA-1 a QA-5 e QA-7), commit `a765251`: testes que matam as 5 mutações sobreviventes (`Object.hasOwn`, hexadecimal, pasta de hooks ilegível, `args` do ghidra sem commit); commit abreviado com 7 a 40 hexadecimais no AC7 e no ponto 8 (decisão do @dev, aceita pelo @qa, sem mudar o texto dos AC); matcher só vira regex quando está na forma `mcp__(n1|n2…)__.*`; nomes cortados em 60 caracteres nas mensagens. `npm test` 327/327; `npm run verificar` 17/17 (`notepad-ui` falhou em duas execuções por Shift/Ctrl reais no teclado e passou na repetição) | @dev (Dex), registrado pela sessão da E3-1 |

## Validação @po (2026-11-04)

Checklist de 10 pontos (`story-lifecycle.md`; a task `validate-next-story.md` não existe neste checkout). Nota: 1 atende, 0,5 parcial, 0 não atende. Formato do precedente `docs/handoffs/2026-11-02-e2-1-validacao-po.md`.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Story + Contexto, com o levantamento do ADR |
| 3 | AC testáveis | 0,5 | 1 | AC3 dependia de decisão sem comportamento escrito; AC6 sem definição de "igual"; AC7 sem dizer de onde sai o commit do mapa nem o campo do lock; AC8 sem o teste de equivalência que as Dev Notes exigem; AC14 citava trava inexistente (`verificar.mjs:11` é comentário) e conflitava com a leitura do modelo em `registros/_modelos/`. Corrigidos |
| 4 | Escopo dentro e fora | 1 | 1 | Por fatia e da story inteira |
| 5 | Dependências | 0,5 | 1 | Tabela de fatias omitia a decisão 7 (fatia 2) e a 8 (fatia 4), que a lista de decisões atribui a elas; corrigido. D-3 estava em "não bloqueiam" com "antes da implementação"; esclarecido (bloqueia só o fechamento do AC2) |
| 6 | Complexidade | 1 | 1 | STANDARD; estimativa por fatia (do @sm) e risco da fatia 4 em G declarado |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | R1–R6 do ADR cobertos |
| 9 | Definition of Done | 1 | 1 | Da fatia 1 e da story inteira (P1–P4 com evidência) |
| 10 | Alinhamento com plano, ADR e handoff | 0,5 | 0,5 | Rastreabilidade completada (AC7, AC10–AC12, AC15; tabela aceite → fatia). Fica 0,5: a parte "documentação" do P4 e a conferência de documentação do handoff §5 não têm fatia, e o ADR §4 promete D1–D3 detectáveis sem checagem correspondente no §2f (P-1); "caminhos suportados" sem definição (P-4) |
| | **Total** | **8,5** | **9,5** | **GO condicional** |

**Art. IV (sem invenção):** cada AC da fatia 1 aponta a origem no plano, no ADR ou no handoff. Os detalhes acrescentados nesta validação derivam das fontes: campo do lock e extração do commit (ADR §2f.4–5, linha 20); "igual" como comparação profunda (ADR linha 24, texto idêntico hoje); teste de equivalência (Dev Notes, ADR §2f.6); lista fechada de leitura (ADR §2f "Não faz"). Nenhum requisito novo entrou; "não usa rede" (AC14) decorre de "só com leitura estática" (ADR linha 164).

**Condições do GO:**

- Ready não é InProgress: a fatia 1 só começa com D-1 (aceite do ADR, ao menos §2c e §2f fatia 1) e D-2 respondidas pelo responsável.
- O AC2 só fecha com D-3 confirmada pelo @architect ou com o pressuposto aceito pelo responsável. *Cumprida em 2026-11-04.*
- Se D-4 for "aviso", o @po reescreve o AC3 antes do @dev partir.
- Fatias 2 a 5: cada uma com ACs detalhados e nova validação @po quando puxada.

### Pendências (decisão do responsável ou do @architect; nenhuma decidida aqui)

| # | Pendência | Bloqueia a fatia 1? | Onde resolve |
|---|---|---|---|
| P-1 | **Documentação em prosa** (lacuna 1). O handoff §5 põe a documentação entre os arquivos conferidos e o P4 pede que a documentação indique a matriz; o ADR §4 (linha 188) diz que D1–D3 passam a ser detectáveis, mas o §2f não tem checagem para isso. Inconsistência do ADR, que não é editado aqui. | Não. A fatia 1 entrega o que o §2f define; a correção à mão de D1–D3 é a D-2. | No aceite do ADR (D-1): o @architect alinha o §4 com o §2f, ou o responsável pede uma checagem estruturada de documentação e a fatia onde ela entra (com o P4, na fatia 2, é o encaixe natural). |
| P-2 | **"Tool do catálogo sem classificação"** (lacuna 2). Não está no aceite do plano: o P1 é por servidor (coberto por AC1 e AC2) e o P2 é recusa na chamada (fatia 4). Vem da "Melhoria esperada" (tool nova). O AC5 cobre a tool do mapa sem nível. | Não. | Decisão do responsável sobre comparar mapa e catálogo real (ADR R6: executa código do pacote), em fatia própria; até lá vale o R-catálogo. |
| P-3 | **`rea-gate.mjs` não exporta nada** (lacuna das Dev Notes). | Não. Virou AC: teste de equivalência no AC8, com o gate em subprocesso. | Unificar o código é a fatia 3/4 (decisão 6.8). |
| P-4 | **"Caminhos suportados" do P2 sem definição** (lacuna 4). | Não. | Antes de detalhar a fatia 4: decisão 6.5 (CLI) e lista dos caminhos, partindo dos que a matriz do ADR §2e já nomeia (MCP + hook, CLI + hook), coerente com a condição de saída da etapa 3 ("todas as entradas declaradas suportadas aplicam a política", handoff §5). |
| P-5 | **Fatia 4 tende a G** e a story inteira passa do M do plano (lacuna 3 e R-estimativa). | Não. | Antes de puxar a fatia 4: o @po revê o tamanho com o responsável (dividir gate MCP e `cli-gate`, ou aceitar que a MEL-05 passa de M); mudar o tamanho do plano é decisão do responsável. |

## Validação @po (2026-11-04, rodada 2)

Só sobre o que mudou depois da rodada 1: AC3 reescrito; AC16, AC17 e AC18 novos; AC9, AC10, AC13 e AC14 ajustados; fatia 4 em 4a e 4b; estimativas; lista de decisões (6.1, 6.3 e 6.6 decididas; 6.2, 6.4, 6.5, 6.7, 6.8, 6.9 e 6.10 abertas); tasks e File List com o runbook e o guia. Conferido contra o ADR-0001 aceito (§2f pontos 1 a 8 e "Documentação em prosa", §4, §6, §7). Mesmo método da rodada 1.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Contexto com as decisões de 2026-11-04 e o que o ADR atualizado diz |
| 3 | AC testáveis | 0,5 | 1 | AC3: os testes (1) e (3) eram o mesmo cenário e liam como se o componente escolhesse a causa, o que a leitura estática não permite e o ADR não pede (a mensagem traz as causas prováveis, todas); reescrito em dois cenários, uma asserção por causa. AC13: "nenhum outro arquivo de `docs/`" reprovaria o PR por artefato de processo (`docs/handoffs/`, que os PRs da etapa 2 sempre levaram); restrito à documentação do produto. AC17: o caso "sem referência aprova" não tem fonte; tirado (P-6). AC9, AC10, AC14, AC16 e AC18 conferidos sem correção, salvo a forma da referência no AC18 (a) |
| 4 | Escopo dentro e fora | 1 | 1 | "Não faz" da fatia 1 e File List alinhados ao AC13; 4a e 4b com "não faz" próprios, iguais ao ADR §2f |
| 5 | Dependências | 0,5 | 1 | Fatia 5 dizia "fatia 2" contra o ADR aceito ("fatia 1 e pergunta 6.10"); vale o ADR. 4a e 4b dependem da 3 e não entre si, como no ADR |
| 6 | Complexidade | 1 | 1 | Fatia 1 em M no teto: plausível (ver abaixo). Soma das fatias acima do M do plano, declarada (R-estimativa) |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | R-documentação e R-D3 novos, do ADR §4 e §2f |
| 9 | Definition of Done | 1 | 1 | AC1–AC18; nota do AC17 acrescentada |
| 10 | Alinhamento com plano, ADR e handoff | 0,5 | 0,5 | P-1 resolvida pelo §4 corrigido. Fica 0,5 por lacuna das fontes, não da story: a parte "documentação" do P4 sem fatia (P-7) e "caminhos suportados" sem definição (P-4) |
| | **Total** | **8,5** | **9,5** | **GO** |

**Rastreabilidade dos AC novos e ajustados (Art. IV):**

| AC | Fonte no ADR | Resultado |
|---|---|---|
| AC3 | §2f ponto 1 e mensagem (linhas 165, 174-180); §7 D-4 | Rastreável; itens (a) a (e) são o texto do ADR |
| AC9 | §2f linha 174 ("mensagens dizem qual contrato"); exceção do AC3 pela linha 176 | Rastreável |
| AC10 | §2f ponto 8 ("hoje falharia", linha 172); D2 (linha 43) para o ponto 7 | Rastreável; "falha antes, aprova depois do AC18" segue do §2f linha 182 |
| AC13 | §2f "Não faz" (linha 184) e "Documentação em prosa" (linha 182) | Rastreável depois da correção; a restrição a só dois arquivos é do @sm, coerente com a D-2, e não contradiz o ADR |
| AC14 | §2f "Não faz"; R6; pontos 7 e 8 exigem ler o guia e o runbook | Rastreável |
| AC16 | §2f ponto 7 (linha 171); D2 | Rastreável |
| AC17 | §2f ponto 8 (linha 172); D1 | Rastreável depois da correção (o caso vazio não tem fonte) |
| AC18 | §2f linha 182; §7 D-1 e D-2; D1–D3 | Rastreável; a forma `GhidraMCP@<commit>` vem do `.mcp.json:14` e de "a D1 é detectada pelo ponto 8" |

Nenhum AC novo contradiz "O que cada fatia não faz": a fatia 1 edita o guia e o runbook, que o ADR põe dentro dela (linha 182), e nada mais fora do verificador e da CI.

**Respostas às conferências pedidas:**

- **(a) AC17 e o runbook sem referência.** Não está no ADR. O ponto 8 diz "toda referência `GhidraMCP@<ref>` [...] é prefixo"; aprovar o caso vazio é leitura por vacuidade escolhida pelo @sm. Ela conflita com o próprio ADR, que diz que, depois da correção, a D1 "é detectada pelo ponto 8": um runbook reescrito sem a forma `GhidraMCP@` passaria em silêncio. Correção: o AC17 não fixa o caso (P-6), e o AC18 (a) exige manter a referência na forma do `.mcp.json:14`, o que o ADR sustenta.
- **(b) Dependência da fatia 5.** Vale o ADR aceito: **fatia 1 e pergunta 6.10**. A "fatia 2" da tabela não tinha fonte (gerar o matcher só precisa dos nomes dos mapas, que já existem; ADR §2c, C2). Corrigido na tabela; lacuna 7 resolvida.
- **(c) "Documentação" do P4 (matriz na prosa).** Continua sem fatia. Não bloqueia a fatia 1 nem o início da fatia 2. Bloqueia o **detalhamento dos ACs da fatia 2** (é ela que entrega o P4) e o **Done da story** (a DoD exige P1–P4 com evidência). Registrada como P-7.
- **(d) Fatia 1 sem bloqueio de decisão e estimativa.** Nenhuma decisão do responsável bloqueia a fatia 1: D-1, D-2 e D-4 decididas; a D-3 é confirmação do @architect e prende só o fechamento do AC2; a P-6 não prende o início nem o fechamento do AC17. **M no teto é plausível:** dos 18 ACs, os pontos 1 a 8 são leituras estáticas pequenas (conjuntos, regex, comparação de versões, busca de nomes); AC10 a AC12 são ligação na CI num padrão conhecido da MEL-08; AC13 e AC15 são conferências; AC18 é texto em dois arquivos. Os itens que pesam são o teste de equivalência do AC8 (gate em subprocesso) e a mensagem multilinha do AC3. Se estourar, as opções do responsável (não decididas aqui): (i) dividir em 1a (pontos 1 a 6 e CI, AC1–AC15) e 1b (pontos 7 e 8 e documentação, AC16–AC18), o que reabre a D-2 ("junto com a fatia 1"); (ii) levar o teste de equivalência do AC8 para a fatia 3, onde o parser compartilhado o dispensa, o que muda o ponto 6 do ADR §2f e exige o @architect.

**Correções feitas nesta rodada:** AC3 (forma dos testes; as três causas sempre presentes), AC13 (documentação do produto × artefatos de processo), AC17 (caso sem referência retirado), AC18 (a) (forma `GhidraMCP@<commit>`), tabela de fatias (dependência da fatia 5), "não faz" da fatia 1, File List ("não devem mudar"), tasks de testes e de diff, DoD (nota do AC17), lacunas 6 e 7, status e Change Log. Escopo inalterado; nenhuma pergunta do responsável decidida.

**Observações (sem correção, fora do escopo da story):**

- `docs/runbook-prereqs-nativo.md:100` ainda diz "Falta só o @devops registrar o servidor `ghidra` no `.mcp.json`", que já está registrado. Não é D1, D2 nem D3, e o AC18 não o cobre. Incluir na correção da fatia 1 amplia a D-2: decisão do responsável. *Decidida em 2026-11-04: entra na fatia 1, AC18 (d).*
- No AC16, o nome do servidor sozinho quase sempre aparece no guia (`Ghidra + JDK`, linha 62); quem detecta a D2 é o nome do mapa (`ghidra-niveis.json`). O formato da busca é do @dev (Dev Notes); o teste da fixture do AC16 já cobre o caso.

**Condições do GO:**

- O AC2 só fecha com D-3 confirmada pelo @architect ou com o pressuposto aceito pelo responsável (inalterado). *Cumprida em 2026-11-04: os dois; AC2 atualizado.*
- O AC17 fecha sem o caso "sem referência"; se a P-6 for respondida antes do PR, o teste entra na fatia 1. *P-6 decidida em 2026-11-04 (reprova): o teste entra na fatia 1.*
- Fatias 2 a 5: ACs detalhados e nova validação @po quando puxadas; antes da fatia 2, a P-7; antes da fatia 3, o tamanho com o responsável (R-estimativa).

### Pendências novas (rodada 2; nenhuma decidida aqui)

| # | Pendência | Bloqueia a fatia 1? | Onde resolve |
|---|---|---|---|
| P-6 | **Ponto 8 sem referência.** Runbook sem nenhuma `GhidraMCP@<ref>`: aprova (vacuidade) ou reprova (fail-closed, como o AC7 trata o campo sem commit legível)? O ADR não diz. | Não. O caso não ocorre no repositório real (AC18 (a)). | **Decidida em 2026-11-04 pelo responsável: reprova** (fail-closed); AC17 fixa o caso e o teste. O ADR §2f ponto 8 não foi alterado por esta story. |
| P-7 | **Matriz cliente/provider na documentação (P4).** O ADR §2e põe a matriz em `contrato.clientes` e a imprime no verificador; o plano (linha 281) pede que inventário **e documentação** a indiquem. Não há fatia para a parte da documentação. | Não. | Antes de detalhar a fatia 2: o responsável diz se a saída impressa pelo verificador basta ou se a matriz entra num documento (qual), e o @architect registra no ADR. Sem isso, o P4 não fecha e a story não vai a Done. |

## QA Results

### Gate da fatia 1 — 2026-11-04 — @qa (Quinn)

**Veredito da fatia 1: CONCERNS.** Sem achado high nem AC sem implementação; testes, lint e tipos verdes; os achados são lacunas de teste e de texto. Status mantido em **InReview** (a story só vai a Done depois da última fatia e do aceite P1–P4; o AC15 aguarda o `resultado` da CI do PR). A task `qa-gate.md` não existe neste checkout: usadas as 7 checagens de `story-lifecycle.md`.

**Comandos rodados pelo @qa (branch `feat/e3-1-integracoes`, HEAD `20afa1c`, Node v26.12.1):**

| Comando | Resultado |
|---|---|
| `npm test` | 320 testes, 320 aprovados, 0 pulados, 0 falhas (29 s) |
| `npm run lint` | aprovado, 23 arquivos |
| `npm run tipos` | aprovado, 7 arquivos (inclui `verificar-integracoes.mjs`) |
| `node scripts/verificar/verificar.mjs --so ambiente-node,integracoes` | `integracoes aprovado 0 s contratos coerentes`; APROVADO, saída 0 |
| idem `--json` | `{"id":"integracoes","estado":"aprovado","detalhe":"contratos coerentes","duracao_s":0}`, `total.codigo` 0 |
| `node scripts/integracoes/verificar-integracoes.mjs` | "Integrações coerentes: nenhum achado.", saída 0 |
| `git diff --name-only main` | nenhum de `rea-gate.mjs`, `cli-gate.mjs`, `*-niveis.json`, `.mcp.json`, `settings.json`, `registros/**`; em `docs/`: guia, runbook, esta story, `docs/plano-de-execucao.md` (M) e `docs/planos/2026-11-04-e3-0-preparo-mel05.md` (A) |

**7 checagens:** (1) revisão de código: ok, módulo legível, fail-closed, sem estado global; (2) testes: ok, com lacunas (mutações abaixo); (3) AC: ok com ressalvas (AC13, AC15); (4) regressão: ok, suíte inteira verde, gate e `cli-gate` intocados; (5) desempenho: ok, componente em 0 s; ver QA-5 (ReDoS teórico); (6) segurança: ok, só `readFileSync`/`readdirSync`, sem `child_process`, rede, `eval`, `new Function` ou escrita (lido o módulo inteiro, 419 linhas); (7) documentação: ok, runbook e guia corrigidos.

**AC → evidência** (testes em `scripts/integracoes/verificar-integracoes.test.mjs`, salvo indicação):

| AC | Evidência |
|---|---|
| AC1 | "AC1: servidor do .mcp.json sem mapa de níveis reprova…" |
| AC2 | "AC2: servidor com mapa e sem cobertura…", "…caso inverso", "…regra de casamento…", "…cobertura só com casamento nas leituras parcial e ancorada…", 6 casos "fail-closed fora de mcp__(n1\|n2…)__.*", "…plugin…", "…servidor com _…", "…sem entrada do PreToolUse…" |
| AC3 | "AC3 (1)…" e "AC3 (2)…" (uma asserção por causa; (a), (b), (c), (e); reprova) |
| AC4 | "AC4: mapa que não é JSON, sem ferramentas ou com ferramentas vazio…" |
| AC5 | "AC5: tool sem classificação…", "AC5: nome de tool fora de… ou herdado…" |
| AC6 | "AC6: nível que não existe em niveis…", "AC6: niveis diferentes entre mapas…", "AC6: mapa sem niveis reprova" |
| AC7 | quatro testes "AC7: …" (três versões; ausente/ilegível; prefixo do commit; sem commit legível) |
| AC8 | "AC8: modelo real legível; …variações reprovam" e "AC8: equivalência com o gate em subprocesso…" |
| AC9 | "AC9: toda mensagem diz contrato, arquivo e campo…" (todos os 6 contratos exercitados) |
| AC10 | **Indireta:** saída do verificador no repositório real (tabela acima); o teste "projeto coerente" usa fixture, não o repositório real. A CI do job `js` passa a prender o caso |
| AC11 | `workflow-ci.test.mjs` "integracoes no job js dos dois lados…"; confirmado por mutação em cópia (tirar do YAML: 2 falhas; do `JOBS`: 5; dos dois: 4) |
| AC12 | `verificar.test.mjs` "integracoes: ambiente-node reprovado ou ausente…" e "…falha do componente…"; `agregar-ci.test.mjs` "JSON do job js sem o componente integracoes → incompleto, código 3" e "…nunca é verde"; "AC12: arquivo da lista ausente ou ilegível é falha…" |
| AC13 | **Indireta** (`git diff`); ver QA-6 |
| AC14 | "AC14: não escreve nada e só lê a lista fechada…" (hash antes/depois), "AC14: o módulo não importa child_process nem rede"; leitura do código pelo @qa |
| AC15 | npm test, lint e tipos verdes; **pendente** o `resultado` da CI do PR (não é falha) |
| AC16 | "AC16: guia que só cita rea…", "AC16: guia que cita o servidor mas não o mapa…" |
| AC17 | "AC17: referência GhidraMCP@2.0 reprova…", "…abreviada que é prefixo aprova…", "…sem nenhuma referência… reprova (P-6)" |
| AC18 | **Indireta:** diff do runbook e do guia (`df08f96`) conferido contra `.mcp.json:14-18` e `runbook-prereqs-nativo.md:21,91-96`; (a) e (b) presos pelos pontos 8 e 7; (c) e (d) só por leitura |

**Mutação independente** (cópia dos arquivos rastreados em pasta temporária, apagada ao fim; o repositório não foi tocado): 30 mutações do módulo, **25 mortas, 5 sobreviventes**; 3 mutações de CI, todas mortas. Mortas, entre outras: AC3 sem a causa "removido"; cobertura só pela leitura parcial; `niveis` só por chaves e por referência; ponto 8 aprovando runbook sem referência; `tool in {}` trocado por `false` e por `Object.hasOwn({}, tool)`; forma do matcher aceitando `_`; sem caso inverso; mapa órfão sem achado; `status` lido sem aspas; lista de bloco lida como vazia. **Sobreviventes:** M6 `Object.hasOwn(mapa.niveis, nivel)` → `nivel in mapa.niveis`; M6b → `!mapa.niveis[nivel]`; M10 ponto 8 sem a exigência de hexadecimal; M19 pasta `.claude/hooks` ilegível ignorada; M26 `args` do `ghidra` sem commit aprovando.

**Segurança da leitura (item 6) e regressão do gate (item 7):** nomes de servidor e tool não chegam a `eval`, `new Function` nem shell; o nome do servidor é escapado antes do `RegExp` do ponto 7. O teste do AC8 roda o `rea-gate.mjs` real com `CLAUDE_PROJECT_DIR` numa raiz temporária (`registros/eq/` sintético); o gate lê só o mapa real (só leitura) e nenhum `registros/<slug>/` do repositório; a raiz é apagada em `finally` (nenhuma pasta `integracoes-*` sobrou no `tmpdir` depois da suíte).

**Achados:**

| # | Sev. | Categoria | Achado | Recomendação | Quem |
|---|---|---|---|---|---|
| QA-1 | low | tests | M6/M6b sobrevivem: nenhum teste com nível igual a propriedade herdada (`"constructor"`, `"toString"`); o código atual está certo | Teste do AC6 com `"ferramentas": {"t": "constructor"}` | @dev |
| QA-2 | low | tests | M10 sobrevive: sem a checagem de hexadecimal, `GhidraMCP@` seguido de espaço (referência vazia) aprovaria (`startsWith("")`) | Teste do AC17 com referência vazia e não hexadecimal | @dev |
| QA-3 | low | tests | M19 e M26 sobrevivem: pasta `.claude/hooks` ilegível e `args` do `ghidra` sem `GhidraMCP@<commit>` não têm teste (o código reprova os dois) | Um teste para cada um | @dev |
| QA-4 | low | code | Ponto 8 aceita prefixo de 1 caractere (`GhidraMCP@1` aprova), enquanto o mapa e o `.mcp.json` exigem `{7,40}`. Decisão do @dev aceita como legítima (a story deixa o formato a ele), mas incoerente | Exigir ao menos 7 caracteres, como nos outros dois lugares | @dev |
| QA-5 | low | security | `cobreServidor` avalia como regex qualquer matcher, inclusive fora da forma (que já reprova). Matcher patológico mais nome de servidor longo é exponencial: sonda `mcp__(x+x+)+y` deu 29 ms com 20 caracteres e 216 ms com 26. Os dois arquivos são versionados e revisados no PR, por isso low | Conferir cobertura só quando `FORMA_MATCHER` casa, ou limitar o tamanho do nome | @dev |
| QA-6 | medium | requirements | AC13 pela letra reprova: `docs/plano-de-execucao.md` e `docs/planos/2026-11-04-e3-0-preparo-mel05.md` não estão entre os artefatos de processo que o texto nomeia ("esta story, `docs/handoffs/`") e "qualquer outro arquivo de `docs/`… reprova". São artefatos de processo, sem efeito no código: lacuna do texto, não falha de código | Ampliar o AC13 para os artefatos do plano de execução (`docs/plano-de-execucao.md`, `docs/planos/`) | @po |
| QA-7 | low | security | Nome de servidor (e de tool que passa em `NOME_TOOL`) entra sem truncamento em várias mensagens; o AC9 só testa os cenários dados. Vem de arquivo versionado | Truncar como já se faz com tool inválida (`slice(0, 60)`) | @dev |
| QA-8 | low | docs | File List diz `docs/plano-de-execucao.md` "(novo)"; contra `main` ele aparece como modificado (renomeado em `a74ffab` e recriado em `df08f96`). Os dois commits misturam artefato de processo com código/documentação | Só registro; corrigir a File List na próxima passada | @dev |

**Decisões do @dev (Dev Notes):** status `pendente | aprovado | reprovado`: **aceita** (é o comentário do próprio modelo, linha 12). Ponto 8 hexadecimal sem tamanho mínimo: **CONCERN**, ver QA-4. `[a-z0-9-]` sem a flag `i` do gate: **aceita** (mais estrito; fail-closed, sem efeito hoje). Componente importado em vez de `nodeRun`: **aceita** (o `executarPlano` captura a exceção como falha, `verificar.mjs:114`, e o teste "falha do componente…" prova o caminho de falha). Observação: com frontmatter vazio, o gate diz "sem frontmatter" e o componente diz "status ausente"; o veredito é o mesmo (reprova).

**Runbook e guia (item 9):** o guia afirma Ghidra 12.1.4 e JDK 21 instalados apontando o runbook, que registra a instalação (`runbook-prereqs-nativo.md:21`, 13/10/2026; plugin e servidor em 14/10/2026, linhas 91-96). "Uso pelo REA: seção 7.4" só aponta o passo a passo, sem afirmar que o provider está em uso: conforme o AC18. A linha 100 deixou de dizer que falta registrar o `ghidra`. Detalhe low, sem achado: a tabela do guia continua com o cabeçalho "Situação conferida em 13/10/2026".

**Não rodado:** CI do PR (não existe PR); `npm run verificar` completo (fora do escopo pedido; o @dev relatou APROVADO com Docker).
