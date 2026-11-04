# Story MEL-05 — contratos e inventário único de integrações

**Status:** Ready (validação @po da unidade E3-0c, 2026-11-04: GO condicional, ver "Validação @po"; a fatia 1 só passa a InProgress depois das decisões D-1 e D-2 do responsável)
**Workflow:** SDC, ciclo completo em fatias (entrega M no plano; @sm → @po → @dev, critérios @qa) · **Origem:** A08 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-05 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §6 (linhas 266-285) · **Decisões:** [ADR-0001 (Proposto)](../adr/ADR-0001-contratos-integracoes-mel-05.md) · **Ponto de partida:** [handoff da etapa 2, §5](../handoffs/2026-11-03-etapa2-fechamento.md)
**Complexidade:** STANDARD · estimativa do plano M no total; estimativa por fatia no fim desta story (a fatia 4 pode ultrapassar o M do plano, ver Riscos) · **Dependências:** MEL-03 (o verificador é o executor do componente novo) e MEL-08 (o job `js` da CI roda o componente), ambas na base de validação; coordenação com a U5 do plano de perfil do alvo

## Story

**Como** responsável pelo laboratório,
**quero** que servidor, tool, mapa de níveis, matcher do gate e registro de protocolo sejam conferidos entre si pelo verificador e pela CI,
**para** que um servidor ou tool novo deixe de depender de lembrança de editar vários lugares, e que o erro diga qual contrato está incompleto.

## Contexto

Mapa de níveis, matcher, configuração MCP e documentação podem divergir, e o gate lê campos de aprovação por regex (plano §6, "Problema e justificativa"). O ADR levantou o que cada arquivo declara hoje (ADR §1.1, linhas 15-36), as divergências já presentes (D1–D6, linhas 40-47) e as possíveis sem detecção (linhas 49-58).

O plano manda começar "por um verificador de consistência entre os arquivos existentes; gerar configurações só onde simplificar a manutenção" (plano linha 272), e o handoff repete: sem migrar nem aprovar níveis automaticamente (handoff §5). Por isso a story é fatiada: a **fatia 1 só lê e confere**; mudar o formato dos mapas, o schema do `00-seguranca.md` e o gate vêm depois, uma fatia por vez (ADR §2f, linhas 162-177).

## Escopo geral

**Dentro (todas as fatias, na ordem do ADR §2f):** verificador de consistência (1); bloco `contrato` e `atributos` nos mapas (2); `schema: 00-seguranca/1` no modelo, parser compartilhado e relatório legado/inválido/revisão nova (3); gate e `cli-gate` usando o parser (4); geração do matcher, opcional (5).
**Fora da story inteira:** aplicar a família de tool da U5 no gate (depende da U4 e da aprovação da U5, plano linha 285; ADR linha 177); adaptador do Codex (ADR linha 177); gerar `.mcp.json` (ADR linha 136); migrar ou aprovar níveis ou registros; MEL-06 (identidade e isolamento por execução) e MEL-07 (política comum CLI e MCP).

## Fatias

| # | Fatia | Estimativa | Depende de |
|---|---|---|---|
| 1 | Verificador de consistência, só leitura (componente `integracoes`, job `js`) | M | MEL-03, MEL-08; decisões D-1 e D-2 abaixo |
| 2 | Bloco `contrato` (+ `atributos` opcional) nos dois mapas; verificador passa a exigi-lo; matriz cliente/provider | P | Fatia 1; decisões 7 (campo `auditoria` do Ghidra) e 9 (estado inicial da matriz); coordenação U5 |
| 3 | `schema: 00-seguranca/1` no modelo, parser compartilhado, relatório legado/inválido/revisão nova | M | Fatia 1; decisões 2 e 8 |
| 4 | Gate e `cli-gate` usam o parser compartilhado | G | Fatia 3; decisões 4, 5 e 8 (localização do parser); definição de "caminhos suportados" (P-4 da validação); gate completo de regressão e @qa |
| 5 (opcional) | Gerar o matcher a partir dos mapas | P | Fatia 2; decisão 10 |

Estimativas são do @sm, não do plano, que dá só o M da story inteira.

## Fatia 1 — verificador de consistência de integrações

### Escopo da fatia 1

**Dentro:** componente novo `integracoes` do verificador (`scripts/verificar/verificar.mjs`, lista de componentes com `depende` e `requisito`; ADR linha 62), implementado em módulo próprio (sugestão do ADR: `scripts/integracoes/verificar-integracoes.mjs` + teste), com `depende: ["ambiente-node"]`; entrada no job `js` da CI; testes no `npm test`. Confere, só com leitura estática, os seis pontos do ADR §2f (linhas 164-170), listados nos ACs abaixo.
**Fora:** ver "O que cada fatia não faz".

### Onde entra na CI (ADR §1.3 e §2f; handoff §2)

O ADR recomenda o job `js`. Para isso, na mesma mudança, em quatro lugares que o `workflow-ci.test.mjs` prende entre si:

1. `scripts/verificar/verificar.mjs` — o componente (ADR linha 62).
2. `scripts/verificar/agregar-ci.mjs:25` — `integracoes` na lista de componentes do job `js` (`ambiente-node` continua primeiro; `agregar-ci.mjs:22-23`).
3. `.github/workflows/verificacao.yml:50` — o mesmo `--so` do job `js`. O teste exige `--so` igual ao `JOBS` do agregador (`workflow-ci.test.mjs:45-56`) e que todo componente esteja em algum job (`:58-61`); divergir reprova o `workflow-ci.test.mjs`.
4. `package.json:12` — o teste do módulo no script `test`; e, se o módulo for de política, a lista `files` do `tsconfig.json` (ADR linha 66).

Não entra action nova, então não há auditoria de action a fazer (handoff §2: auditoria só para action nova ou nova versão). O componente roda sem Docker: se rodasse no job `semgrep` ou `publicacao`, dependeria dele sem necessidade.

### Critérios de aceitação da fatia 1

Cada AC aponta a origem: **P** = item do aceite do plano (P1 servidor sem classificação; P2 tool desconhecida, schema inválido e nível sem autorização recusados; P3 legado/inválido/revisão nova; P4 matriz cliente/provider; plano linhas 278-281), **A** = decisão ou item do ADR, **H** = handoff.

**Cobertura de servidores (P1; ADR §2f.1, §2c)**

- [ ] **AC1** — Dado um servidor em `.mcp.json` sem `.claude/hooks/<servidor>-niveis.json`, quando o componente roda, então reprova com mensagem que cita o servidor e diz que falta o **mapa de níveis** ("integração incompleta: servidor `x` sem mapa de níveis"). Teste com fixture em pasta temporária. *Origem:* P1, ADR §2f.1; ADR linha 51.
- [ ] **AC2** — Dado um servidor com mapa e sem cobertura do matcher de `.claude/settings.json` (a chamada `mcp__<servidor>__x` não casa), quando o componente roda, então reprova citando o servidor e dizendo que falta o **matcher do gate** (a tool ficaria sem trava). Dado o inverso (servidor nomeado no matcher sem entrada no `.mcp.json`), reprova dizendo que o matcher cita servidor que não está configurado. *Origem:* P1, ADR §2f.1; ADR linha 52. Pressuposto: ver D-3.
- [ ] **AC3** — Dado um mapa sem servidor correspondente em `.mcp.json` (mapa órfão), quando o componente roda, então **reprova** com mensagem que cita o mapa e diz que o servidor não está configurado (pressuposto D-4: falha). Se o responsável decidir "aviso" antes do @dev partir, o @po reescreve este AC (componente aprovado, aviso no motivo citando o mapa); o teste cobre só o comportamento vigente. *Origem:* ADR §2c (linha 138), pergunta 3.

**Forma do mapa (P1, P2; ADR §2f.2–3)**

- [ ] **AC4** — Dado um mapa que não é JSON válido, ou com `ferramentas` ausente ou vazio, quando o componente roda, então reprova, diz qual mapa e qual campo. *Origem:* ADR §2f.2.
- [ ] **AC5** — Dada uma tool do mapa **sem classificação** (valor ausente, vazio ou que não é string), quando o componente roda, então reprova citando mapa e tool ("tool sem nível"). Dado um nome de tool fora de `^[A-Za-z0-9_-]+$` ou que colide com propriedade herdada (`constructor`, `__proto__`, `toString`), reprova citando o nome. *Origem:* P2 (parte de schema inválido), ADR §2f.2 e linha 56.
- [ ] **AC6** — Dado um nível de tool que não existe em `niveis` do próprio mapa, quando o componente roda, então reprova citando mapa, tool e nível (nível inválido). Dados dois mapas com `niveis` diferentes, reprova citando os dois; "igual" é comparação profunda: mesmas chaves e mesmo texto de cada nível (hoje idênticos, ADR linha 24). *Origem:* P2, ADR §2f.3; ADR linhas 24, 54-55.

**Versão (ADR §2f.4–5; ADR D4)**

- [ ] **AC7** — Dado `rea_version` do `rea-niveis.json` diferente da versão de `rea-agents` em `package.json` (`dependencies`), ou `package.json` diferente do `package-lock.json` (`packages["node_modules/rea-agents"].version`), quando o componente roda, então reprova citando as três versões lidas e o arquivo de cada uma. Dado o commit do mapa do Ghidra (o hexadecimal depois de `commit` no campo `versao`, hoje "GhidraMCP 2.0 (commit 1e98025)") que não é prefixo do commit dos `args` do `.mcp.json`, reprova citando os dois; campo sem commit legível também reprova (fail-closed, como no AC12). *Origem:* ADR §2f.4–5; ADR D4 (linha 45).

**Modelo de protocolo (P3, em parte; ADR §2f.6)**

- [ ] **AC8** — Dado o modelo `registros/_modelos/00-seguranca.md`, quando o componente roda, então confere que ele é legível pelas regras do gate: frontmatter delimitado, `status` com valor reconhecido, `niveis_aprovados` em lista inline numa linha e **uma única** seção "Identidade dos arquivos" (regras de `rea-gate.mjs:150,157,183-212,278-281`; ADR linha 170). Uma variação que o gate leria como vazio (lista de bloco, `status` entre aspas, seção repetida) reprova no teste. Como `rea-gate.mjs` não exporta as regras (Dev Notes), o componente as reimplementa e um **teste de equivalência** prende as duas leituras: para o modelo e cada variação, montados numa raiz temporária, o resultado do componente concorda com o do gate rodado como subprocesso (padrão de `rea-gate.test.mjs:38-40`, `CLAUDE_PROJECT_DIR` na raiz temporária). O componente lê **só** o modelo, nunca um registro de alvo. *Origem:* ADR §2f.6; Dev Notes ("reimplementar com teste de equivalência"); classificação legado/inválido/revisão nova fica na fatia 3.

**Mensagens (plano "Melhoria esperada")**

- [ ] **AC9** — Dado qualquer reprovação dos AC1 a AC8, quando o componente imprime o resultado, então a mensagem diz (a) qual **contrato** está incompleto (mapa, matcher, `.mcp.json`, versão, modelo), (b) o arquivo e o campo, (c) o que falta, em uma linha, sem ecoar trechos longos do arquivo lido. Teste: cada caso dos AC1 a AC8 afirma o texto-chave da mensagem. *Origem:* plano "Melhoria esperada" (linha 274); ADR §2f ("Mensagens dizem qual contrato está incompleto"), R4.

**Integração com o verificador e a CI (H; ADR §1.3)**

- [ ] **AC10** — Dado o repositório real, quando `node scripts/verificar/verificar.mjs --so integracoes` roda, então o componente aparece no resumo com estado, duração e motivo, e o `--json` traz o componente `integracoes` no formato que o agregador lê. *Origem:* handoff §5 (componente novo entra no verificador e num job da CI), ADR linha 62. *Expectativa a confirmar pelo @dev:* o levantamento do ADR não aponta falha dos seis pontos no estado atual dos arquivos (as divergências D1–D3 são de documentação em prosa, fora dos seis pontos); se o componente reprovar o repositório real, é achado a registrar, não a corrigir nesta fatia (nada muda nos mapas).
- [ ] **AC11** — Dado `integracoes` em `JOBS` (job `js`) e no `--so` do `verificacao.yml`, quando `npm test` roda, então `workflow-ci.test.mjs` fica verde; removido o componente de um dos dois lados, o teste reprova. *Origem:* handoff §2, ADR linhas 63-65.
- [ ] **AC12** — "Não executado nunca é verde": dado `ambiente-node` reprovado ou ausente, o `integracoes` fica "não executado" (não aprovado); dado o JSON do job `js` sem o componente `integracoes`, o agregador devolve INCOMPLETO (código de saída 3). Falha do componente reprova o `resultado`. Teste no verificador e no agregador, no padrão dos testes existentes da MEL-08 (`agregar-ci.test.mjs`). Arquivo ilegível ou ausente (por exemplo `.mcp.json`) é **falha** do componente, não "aprovado por falta de dados". *Origem:* handoff §2; story MEL-08 AC3 e AC7.

**Nada muda além do verificador (limites da fatia 1)**

- [ ] **AC13** — Dada a entrega da fatia 1, quando se compara o diff com a base, então `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `.claude/hooks/rea-niveis.json`, `.claude/hooks/ghidra-niveis.json`, `.mcp.json`, `.claude/settings.json`, `registros/_modelos/` e todo `registros/<slug>/00-seguranca.md` aparecem **sem diferença** (`git diff --name-only <base>` não lista nenhum deles). Nenhum `status` nem `niveis_aprovados` é lido de registro de alvo nem escrito. *Origem:* ADR §2f ("Não faz"), plano linha 280 ("não aprova nem migra níveis"), CLAUDE.md.
- [ ] **AC14** — Dado o componente rodando, então ele não escreve em nenhum arquivo (teste: hash dos arquivos da fixture igual antes e depois), não executa o REA nem o Ghidra, não usa rede, e não lê `alvos/`, `saidas/` nem `registros/<slug>/`. Forma testável: o módulo lê uma **lista fechada** de arquivos (`.mcp.json`, `.claude/settings.json`, `.claude/hooks/*-niveis.json`, `package.json`, `package-lock.json`, `registros/_modelos/00-seguranca.md`), e o teste afirma que nenhum caminho lido fica em `alvos/`, `saidas/` ou em `registros/` fora de `registros/_modelos/` (o verificador segue a mesma regra, `verificar.mjs:11`, que é comentário e não trava). *Origem:* ADR §2f ("Não faz") e R6.
- [ ] **AC15** — `npm test` verde, `npm run lint` e `npm run tipos` (ou o equivalente do verificador: componentes `lint` e `tipos`) verdes, e o `resultado` da CI do PR da fatia verde. *Origem:* handoff §2 e §5.

### Rastreabilidade AC da fatia 1 → aceite do plano e ADR

| AC | Plano (linhas 278-281) | ADR |
|---|---|---|
| AC1, AC2, AC3 | P1 | §2f.1; §2c; D-lista "possíveis" |
| AC4, AC5, AC6 | P1, P2 (parte schema e nível) | §2f.2–3 |
| AC7 | "Trabalho proposto" (versão no contrato, linha 272) | §2f.4–5; D4 |
| AC8 | P3 (parte: modelo legível) | §2f.6 |
| AC9 | "Melhoria esperada" (linha 274) | §2f; R4 |
| AC10 a AC12 | "Dependências" (MEL-03 e MEL-08 como base de validação, linha 283) | §1.3; handoff §2 e §5 |
| AC13, AC14 | P3 (não migra nem aprova) | §2f "Não faz"; R6 |
| AC15 | — (qualidade da entrega) | handoff §2 e §5 |

Os aceites **P2 completo** (tool desconhecida e nível sem autorização recusados nos caminhos suportados), **P3 completo** (legado/inválido/revisão nova) e **P4** (matriz) **não** são atendidos pela fatia 1: ver as fatias 2 a 4.

### Aceite do plano → onde é atendido (validação @po)

| Aceite (plano linhas 278-281) | Fatia 1 | Fatias seguintes | Lacuna |
|---|---|---|---|
| P1 — servidor sem classificação/entrada protegida apontado como incompleto | **Completo:** AC1 (sem mapa), AC2 (sem matcher), AC9 (mensagem) | — | — |
| P2 — tool desconhecida, schema inválido e nível sem autorização recusados nos caminhos suportados | Parte estática: AC4–AC6 (mapa inválido, tool sem nível, nível fora de `niveis`) | Fatia 4 (recusa no gate e no `cli-gate`, `Object.hasOwn`) | "Caminhos suportados" sem definição (pendência P-4) |
| P3 — legado, inválido e revisão nova; não aprova nem migra | AC8 (modelo legível), AC13 (não aprova nem migra) | Fatia 3 (classificação); "Não faz" das fatias 3 e 4 | Sentido de "revisão nova" (decisão 6.2) |
| P4 — inventário **e documentação** indicam a matriz cliente/provider | — | Fatia 2 (`contrato.clientes`, matriz impressa pelo verificador) | A parte "documentação" do P4 não tem fatia (pendência P-1) |

## Fatias seguintes (uma linha cada; critérios detalhados só quando a fatia for puxada)

- **Fatia 2 — bloco `contrato`/`atributos` nos mapas.** Faz: acrescenta `contrato` (schema, origem, catálogo, auditoria, recurso padrão, clientes) e `atributos` opcional por tool nos dois mapas, e o verificador passa a exigi-los, imprimindo a matriz cliente/provider (aceite P4). **Não faz:** não muda o gate (ele ignora os blocos novos), não aplica `familia` (U5) e não troca o valor de `ferramentas` (alternativa A1 descartada). Mexe no `rea-niveis.json`: conferir o estado da U5 antes (plano linha 69). *ADR §2a, §2d, §2e, §2f fatia 2.*
- **Fatia 3 — schema do `00-seguranca.md`.** Faz: `schema: 00-seguranca/1` no modelo, parser compartilhado e relatório de registros versionados em legado, inválido ou revisão nova (aceite P3). **Não faz:** não reescreve registro, não migra, não edita `status` nem `niveis_aprovados`, não muda a decisão do gate. *ADR §2b, §2f fatia 3.*
- **Fatia 4 — gate e `cli-gate` com o parser.** Faz: v1 estrito, legado pelo caminho atual, inválido nega, `Object.hasOwn` na busca da tool; entrega o aceite P2 nos caminhos suportados. **Não faz:** não aprova nada, não afrouxa nenhum caso hoje negado, não entra sem regressão completa e @qa. *ADR §2f fatia 4, R3.*
- **Fatia 5 (opcional) — gerar o matcher.** Faz: gera o matcher de `settings.json` a partir dos mapas. **Não faz:** não gera `.mcp.json`. *ADR §2c, §2f fatia 5.*

## O que cada fatia não faz

| Fatia | Não faz |
|---|---|
| 1 | Não gera configuração. Não aprova nem migra níveis nem registros. Não aplica a família da P-U5. **Não toca `rea-gate.mjs` nem `cli-gate.mjs`**, nem mapas, `.mcp.json`, `settings.json`, `registros/`. Não executa o REA nem lê o catálogo real do pacote (`mcp doctor` executa código do pacote; ADR R6). Não lê `alvos/`, `saidas/`, `registros/<slug>/`. Não corrige a documentação (D1–D3). Não classifica registros em legado/inválido/revisão nova. |
| 2 | Não muda o gate. Não aplica família. Não promete enforcement no Codex (ADR linha 160). |
| 3 | Não migra, não edita `status` nem `niveis_aprovados`, não muda a decisão do gate. |
| 4 | Não aprova nada. Não afrouxa caso hoje negado. Não aplica família da U5. |
| 5 | Não gera `.mcp.json`. |
| Story inteira | Não faz MEL-06 nem MEL-07; não decide a semântica de aprovação por tool (D5) sem o responsável. |

## Decisões do responsável ainda abertas (ADR §6, linhas 205-216)

Nenhuma é escolhida aqui. Classificação para a fatia 1, conforme onde cada uma encosta:

**Bloqueiam o início da fatia 1:**

- **D-1 (ADR 6.1) — aceitar, alterar ou recusar o ADR (Proposto → Aceito).** O plano exige ADR antes de alterar contratos (plano linha 283). A fatia 1 não altera contrato, mas implementa a recomendação 2f do ADR; sem o aceite do ADR (ao menos da fatia 1, §2f), o @dev não parte. Sem isso, a story não passa de Draft a InProgress mesmo com GO do @po.
- **D-2 (ADR 6.6) — corrigir D1–D3 na documentação: unidade própria ou junto com a fatia 1?** Define o escopo da fatia 1 (se inclui editar `runbook-prereqs-nativo.md` e `guia-rea.md`, o que hoje **não** está no escopo acima). Pressuposto declarado enquanto não houver resposta: **unidade própria**, e a fatia 1 não edita documentação em prosa. A resposta pode ampliar a fatia.

**Pressupostos da fatia 1 (não bloqueiam; ajustar a story se o responsável decidir de outro modo):**

- **D-3 (ADR R1) — semântica de casamento do matcher no Claude Code** (âncoras; regex completa ou parcial). Pressuposto: o AC2 testa a string `mcp__<servidor>__x` contra o matcher e só considera cobertura quando casa nas duas leituras (ancorada e parcial); caso o matcher não seja da forma `mcp__(a|b)__.*` que o componente consegue ler, reprova por fail-closed. **A confirmar pelo @architect antes da implementação do AC2** (não impede o início da fatia; o AC2 só fecha com D-3 confirmada ou com o pressuposto aceito pelo responsável); sem isso, a checagem do matcher pode dar falsa confiança (ADR R1).
- **D-4 (ADR 6.3) — mapa órfão: falha ou aviso?** Pressuposto: **falha**, pelo texto do ADR §2c ("o verificador garante que o conjunto de servidores é o mesmo em `.mcp.json`, nos mapas e no matcher", linha 138). Se o responsável quiser aviso, o AC3 muda.

**Não bloqueiam a fatia 1 (só as seguintes):**

- 6.2 "revisão nova" (revisão do schema ou protocolo novo para versão nova do alvo): fatia 3.
- 6.4 semântica de aprovação por nível ou por tool (D5): fatia 4 e o desenho do schema.
- 6.5 se o CLI entra em "tool desconhecida recusada" (D6): fatia 4 e o aceite P2.
- 6.7 auditoria do GhidraMCP no runbook ou em `docs/seguranca/`: documentação; fatia 2 (campo `auditoria` do contrato).
- 6.8 localização do parser compartilhado e se a fatia 3 valida registros reais na CI: fatias 3 e 4. Na fatia 1 isso aparece só como nota: `rea-gate.mjs` não exporta nada (roda ao ser importado), então o AC8 reimplementa as regras num módulo do verificador, com teste que prende a equivalência; compartilhar o código é decisão da fatia 3.
- 6.9 estado inicial da matriz e prazo do adaptador do Codex: fatia 2.
- 6.10 gerar o matcher (fatia 5) ou só conferir: fatia 5.

## Dependências e coordenação

- **MEL-03** (verificador): fatia 1 entregue; o componente novo segue o padrão `depende`/`requisito`.
- **MEL-08** (CI agregada): InReview, CI ativa e `main` protegido; a fatia 1 entra pelo PR com o `resultado` verde (handoff §2). A dívida D-1 do handoff (novo gate @qa da MEL-08) não bloqueia (handoff §3).
- **Plano de perfil do alvo / P-U5** (família de tool no `rea-niveis.json`): a fatia 1 não mexe no `rea-niveis.json`. A partir da fatia 2, quem chegar primeiro registra a mudança e o outro adapta (plano linha 69); antes de qualquer edição conferir `docs/planos/2026-11-01-perfis-alvo.md`. O piloto continua orientativo: U1–U4 não autorizam filtro de tools nem mudança no gate (plano linha 285).
- **MEL-06 e MEL-07**: depois, nessa ordem (handoff §5). O campo `contexto_execucao` é só declarado no contrato (fatia 2), insumo da MEL-06.

## Riscos

- **R-matcher.** Casamento do matcher no Claude Code não confirmado (ADR R1): falsa confiança. Mitigação: D-3, fail-closed, teste do caso inverso.
- **R-classificação.** O verificador confere forma, não risco: nível errado de tool perigosa só a auditoria pega (ADR R2). A fatia 1 não promete detectá-lo.
- **R-catálogo.** A fatia 1 não compara o mapa com o catálogo real do REA (ADR R6); tool nova do pacote sem entrada no mapa só aparece na chamada (o gate nega) ou numa fatia futura, se o responsável quiser comparação com o catálogo.
- **R-caminho de segurança.** A fatia 4 mexe no gate: regressão pode liberar demais ou bloquear tudo (ADR R3). Mitigação: fail-closed, testes de mutação, @qa. Fatia 1 não tem esse risco (AC13).
- **R-registros.** Registros de alvo são dados derivados do alvo (ADR R4): o componente não os lê e as mensagens não ecoam trechos longos.
- **R-estimativa.** O plano dimensiona a MEL-05 em M; a fatia 4 sozinha tende a G. Rever o tamanho com o @po antes de puxá-la.
- **R-CI.** Mais um componente no job `js` (ADR §4): custo de tempo pequeno por ser leitura estática; medir no primeiro PR.

## Definition of Done

**Fatia 1:** AC1–AC15 marcados com evidência; `npm test` verde; `resultado` da CI do PR verde; decisões D-1 e D-2 respondidas e registradas; @qa com gate; push e PR pelo @devops com autorização do responsável; merge só com o "sim" do responsável (handoff §2). A story **permanece InProgress até a última fatia aceita pelo responsável** e só vai a Done depois do aceite P1–P4 do plano (linhas 278-281) com evidência; fatias 2 a 5 são puxadas uma por vez, cada uma com validação @po de seus ACs.

## Tasks

- [ ] Responsável decide D-1 (aceite do ADR) e D-2 (documentação junto ou à parte); registrar no ADR/story.
- [ ] @architect confirma D-3 (semântica do matcher) ou o responsável aceita o pressuposto.
- [x] Validação @po da story (10 pontos) — 2026-11-04, GO condicional.
- **Fatia 1**
  - [ ] Módulo do verificador de integrações (leitura estática, sem escrita, sem rede, sem `alvos/`/`saidas/`/`registros/<slug>/`).
  - [ ] Checagens 1 a 6 do ADR §2f com mensagens por contrato (AC1–AC9).
  - [ ] Testes com fixtures em pasta temporária, um por caso dos AC1–AC9, e teste de não escrita (AC14).
  - [ ] Componente `integracoes` em `verificar.mjs` (`depende: ["ambiente-node"]`) e `--so integracoes` (AC10).
  - [ ] `JOBS` do agregador e `--so` do `verificacao.yml` (job `js`) na mesma mudança; `workflow-ci.test.mjs` verde (AC11).
  - [ ] Teste do "não executado nunca é verde" no verificador e no agregador (AC12).
  - [ ] `package.json` (script `test`) e `tsconfig.json` (`files`, se módulo de política).
  - [ ] Conferir `git diff --name-only` contra a lista do AC13; `npm test`, lint e tipos verdes (AC15).
  - [ ] Registrar na story o resultado do componente sobre o repositório real, inclusive qualquer reprovação (AC10).
- [ ] Fatias 2 a 5: criar os ACs detalhados quando puxadas (não nesta story, por ora).

## File List (previsto)

Fatia 1:

- `docs/stories/mel-05-contratos-integracoes.story.md` — esta story.
- `scripts/integracoes/verificar-integracoes.mjs` (novo, nome sugerido pelo ADR) — verificador de consistência.
- `scripts/integracoes/verificar-integracoes.test.mjs` (novo) — testes dos AC1–AC9 e AC14.
- `scripts/verificar/verificar.mjs` — componente `integracoes`.
- `scripts/verificar/verificar.test.mjs` — "não executado" do componente (AC12).
- `scripts/verificar/agregar-ci.mjs` — `integracoes` em `JOBS`, job `js`.
- `scripts/verificar/agregar-ci.test.mjs` — JSON do `js` sem o componente → INCOMPLETO (AC12).
- `.github/workflows/verificacao.yml` — `--so` do job `js`.
- `package.json` — script `test`.
- `tsconfig.json` — lista `files`, se módulo de política.

Fatias 2 a 5 (previsão, a detalhar): `.claude/hooks/rea-niveis.json`, `.claude/hooks/ghidra-niveis.json`, `registros/_modelos/00-seguranca.md`, parser compartilhado, `rea-gate.mjs`, `cli-gate.mjs`, `.claude/settings.json`, documentação.

**Não devem mudar na fatia 1 (AC13):** `.claude/hooks/rea-gate.mjs`, `.claude/hooks/cli-gate.mjs`, `.claude/hooks/*-niveis.json`, `.mcp.json`, `.claude/settings.json`, `registros/`.

## Dev Notes

- **Fonte do desenho:** ADR-0001. Levantamento de onde cada arquivo declara o quê: ADR linhas 15-36. Divergências D1–D6: linhas 40-47. Onde o componente entra no verificador e na CI: linhas 60-66. Fatia 1: linhas 164-172. Riscos: linhas 196-203.
- **`rea-gate.mjs` não exporta nada** (executa ao ser importado): o verificador não pode importar as regras dele. As regras de leitura de `status`, `niveis_aprovados` e seção de identidade são as de `rea-gate.mjs:150,157,183-212,278-281` (e `cli-gate.mjs:93,95`, duplicadas). Reimplementar com teste de equivalência; unificar é fatia 3/4 (decisão 6.8).
- **Leitura do mapa:** o gate só lê `ferramentas`, `versao`/`rea_version` e `niveis` (ADR linha 75; `rea-gate.mjs:80,84,293`). O verificador deve tolerar os dois cabeçalhos atuais (D4) sem exigir schema comum; isso é a fatia 2.
- **Matcher:** `.claude/settings.json:10` (`mcp__(rea|ghidra)__.*`, ADR linha 21). O matcher de `Bash|PowerShell` (`settings.json:20-25`) é do `cli-gate` e fora do alcance dos AC2.
- **Ghidra:** o commit do mapa é texto livre (`ghidra-niveis.json:3`, "commit 1e98025") e o do `.mcp.json` é completo (`.mcp.json:14-18`): daí o "prefixo" do AC7 (ADR linha 20, §2f.5).
- **Regras da CI a respeitar** (handoff §2): componente novo precisa estar em algum job; `--so` do YAML igual ao `JOBS`; action fora da auditoria reprova; "não executado" nunca é verde.
- **Constitution Art. IV:** nada acima inventa requisito; os pontos sem fonte (comparação com o catálogo real, verificação da documentação em prosa) estão em "Lacunas".

## Lacunas das fontes (para o @po e o responsável)

*Tratamento na validação @po:* lacuna 1 → P-1; 2 → P-2; 3 → P-5; 4 → P-4; 5 → tabela "Aceite do plano → onde é atendido"; nota de `rea-gate.mjs` → AC8 e P-3.

1. **Documentação em prosa não é verificada.** O plano e o handoff dizem que o verificador confere `.mcp.json`, matcher, mapas **e documentação**, mas os seis pontos do ADR §2f (linhas 165-170) não incluem nenhuma checagem de documentação em prosa; D1–D3 seguem sem detecção automática, apesar de o ADR §4 (linha 188) listar "as D1–D3 passam a ser detectáveis" como consequência. Fica como pergunta ao @architect/responsável (ligada à D-2): quais afirmações do `guia-rea.md` e do `runbook-prereqs-nativo.md` o componente deve conferir, e em que forma estruturada.
2. **"Tool do catálogo sem classificação"** só pode ser conferido contra o catálogo real do pacote, que o ADR deixa fora da fatia 1 (R6: executa código do pacote; "onde o catálogo mora no pacote está a confirmar"). O AC5 cobre a tool presente no mapa sem classificação. Comparar mapa × catálogo (inclusive `catalog_digest` e a contagem de 170 tools) precisa de decisão e de fatia própria.
3. **Tamanho por fatia:** o ADR não dá estimativa por fatia; as da tabela são do @sm.
4. **Aceite P2 ("recusados nos caminhos suportados"):** o ADR não define quais são os "caminhos suportados"; a decisão 6.5 (CLI) fecha parte disso.
5. **Matriz cliente/provider (P4):** só existe depois da fatia 2; a fatia 1 não atende esse aceite.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-04 | Story criada (Draft), unidade E3-0b da etapa 3, a partir do plano §6, do ADR-0001 (Proposto) e do handoff de fechamento da etapa 2; fatia 1 detalhada, fatias 2 a 5 em uma linha; sem validação @po | @sm (River) |
| 2026-11-04 | Validação @po (unidade E3-0c): 8,5/10 como estava; correções de AC ambíguo (AC3, AC6, AC7, AC8, AC14), rastreabilidade (AC7, AC10–AC12, AC15; tabela aceite do plano → fatia) e dependências das fatias 2 e 4; D-3 esclarecida; 9,5/10, GO condicional; status Draft → Ready | @po (Pax) |

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
- O AC2 só fecha com D-3 confirmada pelo @architect ou com o pressuposto aceito pelo responsável.
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
