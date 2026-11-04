# Story MEL-05, fatia 2b — documentação do método de evidência, "Verificado / Não verificado" e armadilhas de licença

**Status:** Ready — validação @po de 2026-11-04: **GO condicional, 9,5/10** (ver "Validação @po"). Antes: Draft, criada pelo @sm em 2026-11-04 (unidade CRAFT). A transição Ready → InProgress é do @dev. **Podem começar já:** a convenção (F2b-AC7 a F2b-AC9) e a licença (F2b-AC10 a F2b-AC12). **Esperam:** o texto dos modelos (F2b-AC1 a F2b-AC4) espera a M1; o F2b-AC2 espera também a M2. **Um PR próprio**, separado do da fatia 2 (as listas fechadas do F2b-AC14 e do F2-AC22 se contradizem num diff único).
**Workflow:** SDC, ciclo completo, **sem gate de segurança** (documentação) · **Origem:** [adendo 1 do ADR-0001](../adr/ADR-0001-adendo-1-efeitos-e-conteudo-do-alvo.md) §6 (Aceito em 2026-11-04) e §1 (inspiração, não dependência) · **Pacote:** MEL-05 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md), fatia separada por decisão do responsável (DA-17) · **Decisões:** DA-1 (opção A: só ideias de contrato e documentação), DA-17 · **Story-mãe:** [`mel-05-contratos-integracoes.story.md`](mel-05-contratos-integracoes.story.md)
**Complexidade:** SIMPLE · estimativa **P** (ver "Estimativa") · **Dependências:** nenhuma de código; **independente da fatia 2** (não depende dos mapas, não toca o gate nem o `settings.json`; as duas podem entrar em qualquer ordem). Fonte das ideias: comparativo de 2026-11-04 sobre repositório externo **não confiável**, só como dado

## Story

**Como** responsável pelo laboratório,
**quero** que os modelos de análise, mecânicas e monetização peçam, em cada achado, como ele foi obtido, que a ausência de um achado venha com o limite da busca e que toda hipótese traga a previsão que a confirma ou refuta, e que handoffs e stories separem o que foi verificado do que não foi,
**para** que a evidência dos registros seja mais confiável e revisável, sem mexer no caminho de segurança.

## Contexto

O adendo 1 (§6) separou a documentação da fatia 2 porque ela não depende dos mapas, não toca o gate e corre outro risco. São três entregas:

1. **Método de evidência** (ideia do comparativo §4.5, reescrita por nós) em três modelos de `registros/_modelos/`: `01-analise.md`, `03-mecanicas.md` e `05-monetizacao.md`. Três regras: (1) cada achado diz se foi **observado**, **derivado** ou **inferido**; (2) **ausência não é prova**: declara-se o limite da busca (o que se procurou, onde e com qual tool); (3) cada **hipótese** traz, escrita antes do teste, a previsão que a confirmaria ou a refutaria. No `05-monetizacao.md` a regra convive com os estados separados de código, execução, causalidade e configuração (`CLAUDE.md`, fluxo, item 5) e não os substitui.
2. **"Verificado / Não verificado"** (comparativo §4.8) como convenção do **projeto**, para handoffs e stories, registrada num lugar fora de `.aiox-core/`: o modelo de story do AIOX é camada L2 (`.aiox-core/development/templates/`) e não se edita.
3. **Armadilhas de licença** (comparativo §4.9) em `docs/plano-integracao-games.md`, só depois de conferidas na **fonte primária** da licença (Constitution, art. IV).

**Estado verificado pelo @sm (2026-11-04):**

- Os três modelos existem em `registros/_modelos/`: `01-analise.md` (perguntas, diário, critérios de conclusão; sem seção de hipóteses nem de confiança), `03-mecanicas.md` e `05-monetizacao.md`. Nenhum está faltando. Também existem `00-seguranca.md`, `02-benchmark.md`, `04-assets.md` e `especificacao.md`, que **esta fatia não toca**.
- O `03-mecanicas.md` já tem um eixo de grau de confiança por mecânica: `Confiança: confirmado | inferido | hipótese` (linhas 44 e 56). Isso se cruza com a regra 1; ver lacuna M2.
- O `05-monetizacao.md` já tem a tabela "Estados de um achado" (linhas 50-59) com código, execução, causalidade e configuração. A regra do método não a substitui.
- `docs/plano-integracao-games.md` só cita licença na linha 26 (IDA: "precisa de licença"). Tem 15 ferramentas na tabela "Candidatos por camada" (linhas 22-38).
- O hook de git (`.githooks/pre-commit.mjs`, política em `scripts/publicacao/publicacao.mjs`) limita registros a blocos de código de 40 linhas e a 300 KB, mas **`registros/_modelos/` está fora dessa regra** (`publicacao.mjs:48`, `emRegistros`). Os modelos são copiados para `registros/<slug>/` e **lá** o limite vale.

## Escopo

**Dentro:**

1. Seção "Método de evidência" (ou equivalente, com o cabeçalho fixo do AC1) e campos de achado em `registros/_modelos/01-analise.md`, `03-mecanicas.md` e `05-monetizacao.md`, com as três regras.
2. Convenção "Verificado / Não verificado" num documento do projeto (`docs/convencao-verificado-nao-verificado.md`, proposta do @sm) e, **somente com aprovação explícita do responsável**, uma referência no `CLAUDE.md`.
3. Regra de licença e campo `licença` em `docs/plano-integracao-games.md`, mais armadilhas concretas **conferidas na fonte primária**.

**Fora (não faz):**

- **Não toca** `registros/_modelos/00-seguranca.md` (nem o resto do que o gate e o AC8/AC13 da fatia 1 leem), `02-benchmark.md`, `04-assets.md`, `especificacao.md`, qualquer `registros/<slug>/`, as skills `.claude/skills/protocolo-*` (ver M4), `.claude/hooks/`, `.claude/settings.json`, `.mcp.json`, mapas de níveis, `scripts/` (inclusive `scripts/publicacao/` e `.githooks/`), `.aiox-core/` (camada L2) e `package.json`.
- Não cria hook de proveniência nem ledger (DA-1).
- Não reescreve registros existentes para o novo método (nada retroativo).
- Não copia, traduz ou parafraseia de perto texto do comparativo ou do repositório externo (sala limpa de ideias, adendo §1). O termo "Clean room" no sentido do projeto externo não é adotado (adendo §8).
- Não audita o craft-anything (DA-4) e não cria o `LICENSE` da raiz (DA-5).
- Não instala nem altera ferramenta; não inclui ferramenta nova no `docs/plano-integracao-games.md`.
- Não altera auditorias existentes de ferramenta (ver M3).

## Critérios de aceitação

Numeração `F2b-ACn`. **Origem:** **AD** = adendo 1; **DA** = decisão do adendo; **CL** = `CLAUDE.md`. Em documentação, a prova é por conferência (Grep dos cabeçalhos fixos, `git diff`, leitura do @qa) e pelos testes existentes, que seguem verdes; esta fatia não cria teste novo.

### Método de evidência nos modelos

- [ ] **F2b-AC1** — (`01-analise.md`) Dado o modelo `registros/_modelos/01-analise.md`, quando se lê o diff, então há uma seção com o cabeçalho exato `## Método de evidência` (o texto do cabeçalho é decisão do @sm, para tornar a conferência por Grep possível) com as três regras em palavras nossas: (1) cada achado, resposta do quadro "Perguntas da análise" e entrada do diário diz se foi **observado**, **derivado** ou **inferido** (com a definição de cada um em uma linha, sujeita a M1); (2) **ausência não é prova**: ao registrar que algo não foi encontrado, declara-se o limite da busca (o que se procurou, onde, com qual tool); (3) cada **hipótese** traz, escrita **antes** do teste, a previsão que a confirmaria e a que a refutaria, e depois o resultado. O quadro de perguntas ou o diário ganha o campo correspondente (por exemplo, uma coluna ou um prefixo), sem remover colunas existentes. O frontmatter (`alvo`, `status`, `inicio`, `fim`) e a seção "Critérios de conclusão" continuam como estão. *Origem:* AD §6, DA-17; AD §6 ("Hoje o `01-analise.md` não tem seção de hipóteses nem de grau de confiança").
- [ ] **F2b-AC2** — (`03-mecanicas.md`) Dado o modelo `03-mecanicas.md`, então ele tem o mesmo cabeçalho `## Método de evidência` com as três regras, e o bloco de cada mecânica (`M-<SISTEMA>-NN`) e de cada dinâmica (`D-NN`) ganha o campo de origem do achado (observado, derivado ou inferido). A convivência com o campo `Confiança` existente segue a resposta a M2; **sem a resposta, nenhum valor de `Confiança` é removido nem renomeado**. As seções "Lacunas" (10) e "Simulações" (11) continuam; a regra de ausência não é prova passa a valer para "Lacunas". O frontmatter e a numeração das seções 1 a 12 continuam. *Origem:* AD §6; DA-17.
- [ ] **F2b-AC3** — (`05-monetizacao.md`) Dado o modelo `05-monetizacao.md`, então ele tem o mesmo cabeçalho `## Método de evidência` com as três regras, e o texto diz expressamente que o método **convive com** os estados separados de código, execução, causalidade e configuração e não os substitui. A tabela "Estados de um achado" (linhas 50-59) e o resto da seção "4. Achados" ficam **sem linha removida ou alterada** (`git diff` mostra só linhas acrescentadas nessa seção). A regra de ausência não é prova vale para "5. Padrões fora do catálogo" e "8. Lacunas". Os identificadores `MON-NNNN` e as classes A/B/C do catálogo não são tocados. O frontmatter e a numeração das seções 1 a 8 continuam: a skill `protocolo-monetizacao` cita as seções 5 e 6 do modelo pelo número (`SKILL.md:14,76`), por isso a seção nova entra sem número, como no AC1 e no AC2. *Origem:* AD §6 (último parágrafo do item); CL, fluxo item 5; `.claude/skills/protocolo-monetizacao/SKILL.md:14,76` (conferido pelo @po).
- [ ] **F2b-AC4** — (consistência entre os três) Dado o conjunto, então os três modelos usam **o mesmo** vocabulário e as mesmas definições (um só texto-base copiado entre eles, adaptado ao exemplo de cada um), e os exemplos dos modelos são genéricos, sem citar resultados de alvos de piloto (`blocos-*`, `encaixe-*`), de alvo analisado nem de trecho do comparativo (regra de cegueira, plano de perfis, restrições). *Origem:* AD §6; plano de perfis (restrição de análise cega).
- [ ] **F2b-AC5** — (modelos não se contaminam com o gate) Dada a entrega, `git diff --name-only <base>` lista em `registros/_modelos/` **somente** `01-analise.md`, `03-mecanicas.md` e `05-monetizacao.md`. `00-seguranca.md`, `02-benchmark.md`, `04-assets.md` e `especificacao.md` não aparecem. O componente `integracoes` (`node scripts/verificar/verificar.mjs --so integracoes`) segue aprovando, porque o AC8 da fatia 1 lê só o modelo de `00-seguranca.md`. *Origem:* AC8, AC13 e AC14 da fatia 1; limite dado pelo responsável.
- [ ] **F2b-AC6** — (tamanho e hooks) Dada a entrega, o texto novo nos modelos não contém bloco de código de mais de 10 linhas (os modelos são copiados para `registros/<slug>/`, onde o limite do pre-commit é 40; a margem evita que o preenchimento estoure), nenhum arquivo de `scripts/`, `.githooks/` ou `.claude/` mudou (**a fatia não mexe no pre-commit nem na política de publicação**), e uma cópia de teste de cada um dos três modelos passa pela checagem de publicação de um registro (`scripts/publicacao/publicacao.mjs`) sem achado, conferida pelo @dev à mão e registrada. *Origem:* o limite de 40 linhas vem de `publicacao.mjs:9-10,48`; o teto de 10 linhas é margem de segurança proposta pelo @sm e aceita pelo @po (`[AUTO-DECISION]`, sem fonte própria; o responsável pode trocar o número sem mudar o resto do AC); "não mexer no pre-commit" segue o "Fora" desta story.

### "Verificado / Não verificado"

- [ ] **F2b-AC7** — (convenção, lugar) Dado o projeto, então existe `docs/convencao-verificado-nao-verificado.md` (arquivo novo, na camada L4 do AIOX), que define a convenção para handoffs e stories em palavras nossas: (a) toda afirmação de estado do mundo (arquivo, comando, versão, comportamento) fica em "Verificado" **com o como** (arquivo e linha, comando e resultado, data), ou em "Não verificado" **com o porquê** (não rodado, sem acesso, depende de terceiro); (b) o que não foi verificado nunca aparece como fato na prosa; (c) como o leitor trata cada seção (o "Verificado" é confiável até a data; o "Não verificado" é pergunta aberta). O documento traz **um** exemplo curto, sem blocos de código de mais de 10 linhas. Esta story e a fatia 2 já usam o termo em "Lacunas das fontes" (L8 a L10 da fatia 2). *Origem:* AD §6; DA-17.
- [ ] **F2b-AC8** — (fora da camada protegida) Dada a entrega, `git diff --name-only <base>` **não lista** nada em `.aiox-core/` (o modelo de story é L2) nem em `.claude/rules/`. A convenção vale **daqui para frente**: não reescreve handoffs e stories antigos. *Origem:* DA-17; CL, "Framework vs Project Boundary".
- [ ] **F2b-AC9** — (referência no `CLAUDE.md`, condicional) Dado o `CLAUDE.md` do projeto, quando o responsável aprova explicitamente na conversa uma referência à convenção, então entra **uma** linha apontando para `docs/convencao-verificado-nao-verificado.md`, na seção "Convenções", e a aprovação fica no Change Log. Dado que o responsável **não** aprovou, então o `CLAUDE.md` não muda (o diff não o lista) e a convenção fica só em `docs/`, com a pendência registrada no handoff. *Origem:* limite dado pelo responsável (`CLAUDE.md` só com aprovação).

### Armadilhas de licença

- [ ] **F2b-AC10** — (regras gerais) Dado `docs/plano-integracao-games.md`, então a seção "Regras que valem para toda a integração" ganha: (a) a regra "ferramenta que só executamos pode ter qualquer licença, desde que auditada; nunca copiamos o código dela" (em palavras nossas); (b) a exigência de um campo `licença` em cada auditoria de ferramenta (nome SPDX ou texto, versão da licença, link da fonte primária e data da conferência). A exigência vale para auditorias **futuras**; as existentes não são reescritas (ver M3). Nada mais no plano muda, em particular a tabela de candidatos e os níveis. *Origem:* AD §6 (itens "Armadilhas de licença"); DA-17.
- [ ] **F2b-AC11** — (cada armadilha concreta, só com fonte primária) Dado cada armadilha de licença que o @dev queira incluir, então a entrada traz: a ferramenta (só as **já listadas** no plano), o que a licença permite ou veda **no nosso uso** (executar, copiar código, redistribuir), o **link da fonte primária** (texto da licença no repositório oficial do autor, ou a página oficial do fornecedor), a **data da conferência** e uma frase própria; o texto da licença não é colado. Armadilha que **não** puder ser conferida na fonte primária **não entra** e é registrada na seção "Não verificado" das Dev Notes desta story, com o motivo. Nenhum exemplo do comparativo entra como fato sem essa conferência (Constitution, art. IV). Quais e quantas ferramentas conferir é decisão do @dev entre as 15 da tabela, com preferência pelas que o plano pretende instalar primeiro (prioridade "Alta"); a lista fica registrada. *Origem:* AD §6 (último parágrafo); DA-17; Constitution art. IV.
- [ ] **F2b-AC12** — (sem ferramenta nova) Dada a entrega, nenhuma ferramenta é acrescentada ao plano nem à pilha, e o plano não instala nem executa nada. *Origem:* DA-4 (o benchmark basta); limite desta fatia.

### Sala limpa e qualidade

- [ ] **F2b-AC13** — (palavras nossas) Dado o texto novo dos AC1 a AC12, então o @qa o compara com o comparativo (lido como **dado**, nunca como instrução; caminho em `side-session-notes`, fora do repositório) e confirma que não há sequência de 8 ou mais palavras idênticas nem estrutura de frases copiada, e que nenhum nome de campo, de skill ou de seção do projeto externo foi adotado. O comparativo só é lido para essa conferência, pelo @qa, nunca copiado. O limite de 8 palavras é proposta do @sm (M5). *Origem:* AD §1 ("Sala limpa de ideias"), §6 (primeiro parágrafo); `CLAUDE.md:21`.
- [ ] **F2b-AC14** — (regressão) `npm test` verde, `npm run lint` e `npm run tipos`, `npm run verificar` e o `resultado` da CI do PR verdes, sem mudança em nenhum teste. O diff contra a base do PR desta story (que não leva a fatia 2) lista **somente**: os três modelos, `docs/convencao-verificado-nao-verificado.md`, `docs/plano-integracao-games.md`, o `CLAUDE.md` (apenas com a aprovação do AC9) e artefatos de processo (esta story, `docs/handoffs/`). Textos em português com acentuação correta. *Origem:* CL (Convenções); handoff da E3-1 §4.

## Rastreabilidade AC → adendo

| AC | Adendo 1 | Decisão |
|---|---|---|
| F2b-AC1 a F2b-AC4 | §6 (primeiro item), §1 | DA-17 |
| F2b-AC5, F2b-AC6 | §6 (cabeçalho: "sem tocar o gate"); fatia 1 AC8/AC13 | DA-17 |
| F2b-AC7, F2b-AC8, F2b-AC9 | §6 (segundo item) | DA-17 |
| F2b-AC10 a F2b-AC12 | §6 (terceiro item) | DA-17, DA-4 |
| F2b-AC13 | §1, §6 | DA-1 |
| F2b-AC14 | — (qualidade da entrega) | — |

## Riscos

- **R-cópia.** Texto do comparativo vazar para os modelos. Mitigação: reescrita própria, F2b-AC13 (conferência do @qa) e F2b-AC4 (sem citar o externo).
- **R-modelo-copiado.** O modelo é copiado para `registros/<slug>/`, que é público e passa pelo pre-commit. Mitigação: F2b-AC6 (sem bloco longo).
- **R-colisão-de-vocabulário.** `inferido` já existe como valor de `Confiança` no `03-mecanicas.md`, e `hipótese` existe lá e no `05-monetizacao.md` (causalidade). Dois eixos com a mesma palavra confundem o preenchimento. Mitigação: M2; enquanto não houver resposta, não se renomeia nada.
- **R-fatos-de-licença.** Afirmar licença errada num documento público. Mitigação: F2b-AC11 (fonte primária, data da conferência, sem exemplo do comparativo como fato).
- **R-gate.** Os modelos são lidos por verificações. Mitigação: F2b-AC5 (só os três; `00-seguranca.md` fora) e `integracoes` aprovando.
- **R-burocracia.** Mais campos por achado alongam o preenchimento. Mitigação: campos curtos; o @po avalia o formato no `*validate-story-draft`.

## Estimativa

**P.** Cinco a seis arquivos de texto (três modelos, uma convenção nova, o plano de games e, se aprovado, uma linha no `CLAUDE.md`), sem código, sem gate e sem teste novo. Risco concentrado na conferência de licenças em fonte primária: sobe para **M** se o responsável pedir cobertura das 15 ferramentas da tabela (cada uma exige abrir e ler a licença oficial). Por isso o AC11 deixa a seleção ao @dev, com preferência pela prioridade "Alta", e manda o que não for confirmado para "Não verificado".

## Definition of Done

F2b-AC1 a F2b-AC14 marcados com evidência; M1 e M2 respondidas e registradas; aprovação (ou recusa) da referência no `CLAUDE.md` registrada (AC9); modelos, convenção e plano revisados pelo @qa, inclusive a conferência de sala limpa (AC13); `npm test`, lint, tipos, `npm run verificar` e `resultado` da CI verdes; push e PR pelo @devops, só com autorização do responsável; merge só com o "sim" dele. Status como na story-mãe: InProgress em implementação, InReview em revisão @qa. Esta fatia não altera o aceite P1–P4 do plano.

## Tasks

- [x] @po valida esta story (10 pontos); Draft → Ready. *2026-11-04, GO condicional, 9,5/10.*
- [ ] Responsável responde M1 e M2 (e, se quiser, M3 a M5).
- [ ] Redigir o texto-base do método de evidência (três regras e definições) em palavras nossas (AC1, AC4).
- [ ] Aplicar nos três modelos (AC1 a AC3), conferir o diff (AC5) e o tamanho do texto novo (AC6).
- [ ] Criar `docs/convencao-verificado-nao-verificado.md` (AC7, AC8).
- [ ] Pedir ao responsável a aprovação da referência no `CLAUDE.md`; aplicar ou registrar a recusa (AC9).
- [ ] Regra de licença e campo `licença` em `docs/plano-integracao-games.md` (AC10).
- [ ] Conferir, na fonte primária, cada armadilha de licença que se queira incluir; incluir as confirmadas, registrar as não confirmadas em "Não verificado" (AC11, AC12).
- [ ] `npm test`, lint, tipos, `npm run verificar`; `git diff --name-only <base>` contra AC5, AC8 e AC14; @qa confere a sala limpa (AC13).

## File List (previsto)

Criar ou alterar:

- `docs/stories/mel-05-fatia-2b-documentacao-metodo.story.md` — esta story.
- `registros/_modelos/01-analise.md`, `registros/_modelos/03-mecanicas.md`, `registros/_modelos/05-monetizacao.md`.
- `docs/convencao-verificado-nao-verificado.md` (novo).
- `docs/plano-integracao-games.md`.
- `CLAUDE.md` — **só com aprovação do responsável** (AC9).
- `docs/handoffs/<data>-mel05-fatia2b.md` (artefato de processo; opcional).

**Não devem mudar:** `registros/_modelos/00-seguranca.md`, `02-benchmark.md`, `04-assets.md`, `especificacao.md`; `registros/<slug>/`; `.claude/` (hooks, skills, rules, settings); `.mcp.json`; mapas de níveis; `scripts/` e `.githooks/`; `.aiox-core/`; `docs/seguranca/` (as auditorias existentes); `package.json`.

## Dev Notes

- **Fonte:** adendo 1 §1 (inspiração e sala limpa), §6 (esta fatia), §7 e §8 (o que não se adota). Decisões: DA-1, DA-4, DA-5, DA-17.
- **Por que `## Método de evidência` como cabeçalho fixo:** permite conferir com Grep nos três modelos sem teste novo. É decisão do @sm (`[AUTO-DECISION]`); o @po ou o responsável pode trocar o título, desde que seja o mesmo nos três.
- **Local da convenção:** `docs/convencao-verificado-nao-verificado.md` (`[AUTO-DECISION]`): `docs/` já tem documentos de convenção na raiz (`catalogo-perfis-alvo.md`, `guia-rea.md`); evita `.aiox-core/` (L2) e `.claude/rules/` (regras carregadas automaticamente pelo Claude Code, que pediriam decisão à parte).
- **Modelos e o publicador:** `registros/_modelos/` fica fora das regras de `registros/` (`publicacao.mjs:48`), mas o que o modelo tem vira ponto de partida de `registros/<slug>/`. Por isso o teto de 10 linhas por bloco (AC6).
- **Skills dos protocolos:** `protocolo-mecanicas`, `protocolo-monetizacao` e a skill da análise orientam o preenchimento desses modelos. O adendo manda editar só os modelos; se os campos novos precisarem aparecer nas skills, é decisão à parte (M4).
- **Constitution Art. IV:** nada acima inventa requisito. As definições de observado, derivado e inferido não constam do adendo; o adendo só os nomeia. Foram propostas pelo @sm e dependem de M1.

### Verificado / Não verificado (pelo @sm, 2026-11-04)

**Verificado:** os três modelos existem (`Glob` em `registros/_modelos/`); `01-analise.md` não tem seção de hipóteses nem de confiança (leitura completa); `03-mecanicas.md` tem `Confiança: confirmado | inferido | hipótese` (linhas 44 e 56); `05-monetizacao.md` tem "Estados de um achado" (linhas 50-59); `publicacao.mjs:9-10,25-26,48` define o limite de 40 linhas e a exceção de `registros/_modelos/`; o plano de games só cita licença na linha 26 e tem 15 ferramentas na tabela; nenhum teste ou script em `scripts/` ou `.claude/hooks/` referencia `01-analise`, `03-mecanicas` ou `05-monetizacao` (`Grep`).
**Não verificado:** o conteúdo de qualquer licença (nada foi conferido; a conferência é o AC11); a lista de ferramentas do plano que o responsável quer cobrir; se as skills `protocolo-*` precisam citar os campos novos (M4); o conteúdo do comparativo (não lido pelo @sm nesta story).

## Lacunas das fontes (para o @po e o responsável)

Nenhuma foi decidida pelo @sm.

- **M1 — definições de observado, derivado e inferido.** O adendo nomeia os três e dá as três regras, mas não define os termos. Proposta do @sm, em palavras nossas, para aprovação: **observado** = o fato apareceu diretamente no resultado de uma tool, de uma execução autorizada ou de um arquivo lido, com ID de evidência; **derivado** = obtido por cálculo, contagem, comparação ou cruzamento mecânico a partir de dado observado (a fórmula ou o comando acompanha o achado); **inferido** = conclusão por raciocínio, sem observação direta do fato. Sem a aprovação, F2b-AC1 a F2b-AC4 não fecham o texto.
- **M2 — relação com `Confiança` do `03-mecanicas.md`** (`confirmado | inferido | hipótese`). Opções: (a) manter `Confiança` e acrescentar um campo de origem (observado, derivado, inferido) como outro eixo; (b) fundir os dois e trocar os valores de `Confiança`. O @sm propõe (a), por não remover nada, mas a escolha é do responsável. O mesmo vale para "hipótese" na causalidade do `05-monetizacao.md`.
- **M3 — campo `licença` nas auditorias existentes.** O adendo diz "um campo `licença` em cada auditoria de ferramenta". Lido como regra para as **futuras** (F2b-AC10); atualizar as seis auditorias existentes de `docs/seguranca/` (e a nova do GhidraMCP, que já registra Apache-2.0) fica fora. Confirmar.
- **M4 — skills dos protocolos.** O adendo lista só os três modelos. Se o responsável quiser os campos novos nas skills `.claude/skills/protocolo-*`, é fatia ou unidade à parte.
- **M5 — critério da comparação de sala limpa** (F2b-AC13): "8 palavras idênticas" é proposta do @sm, sem fonte. **Fechada pelo @po (2026-11-04):** aceito como critério de conferência do @qa (é processo de revisão, não requisito do produto); o @qa registra o método usado. O critério não dispensa o juízo dele sobre estrutura copiada.
- **M6 — critério de conclusão em `01-analise.md`.** Não há item pedindo "ausências com limite declarado" nos critérios de conclusão. Acrescentar item mudaria quando uma análise pode ser marcada concluída (`CLAUDE.md`, fluxo, item 6); não está no adendo, então **não** entra.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-04 | Story criada (Draft), unidade CRAFT, a partir do adendo 1 do ADR-0001 (Aceito) §6, DA-17 e DA-1; estimativa P. Modelos conferidos (os três existem). Sem validação @po | @sm (River) |
| 2026-11-04 | Validação @po (10 pontos): 9,0/10 como estava; correções: F2b-AC3 preserva a numeração 1 a 8 do `05-monetizacao.md` (a skill `protocolo-monetizacao` cita as seções 5 e 6 pelo número); F2b-AC6 com a origem certa (40 linhas de `publicacao.mjs`; teto de 10 como margem, sem fonte própria); F2b-AC14 medido contra a base do PR desta story, que não leva a fatia 2; M5 fechada; início liberado para AC7 a AC12, com AC1 a AC4 à espera da M1 (e AC2 da M2). 9,5/10, **GO condicional**. **Transição de status: Draft → Ready** | @po (Pax) |

## Validação @po (2026-11-04)

Checklist de 10 pontos (`story-lifecycle.md`). 1 atende, 0,5 parcial, 0 não atende.

| # | Ponto | Antes | Depois | Observação |
|---|---|---|---|---|
| 1 | Título claro | 1 | 1 | — |
| 2 | Descrição completa | 1 | 1 | Estado dos modelos conferido pelo @sm e pelo @po (cabeçalhos, `Confiança` nas linhas 44 e 56, "Estados de um achado") |
| 3 | AC testáveis | 0,5 | 1 | F2b-AC3 não protegia a numeração das seções, que a skill de monetização usa; corrigido. AC1 a AC4 conferíveis por Grep do cabeçalho fixo e `git diff`; o texto das definições depende da M1, declarado |
| 4 | Escopo dentro e fora | 1 | 1 | Fora: `00-seguranca.md`, gate, `settings.json`, `.mcp.json`, mapas, `scripts/`, `.githooks/`, `.aiox-core/`, skills (M4). `CLAUDE.md` só com aprovação (AC9) |
| 5 | Dependências | 1 | 1 | Independente da fatia 2; um PR próprio (acrescentado) |
| 6 | Complexidade | 1 | 1 | P; sobe para M se o responsável pedir as 15 licenças, declarado |
| 7 | Valor | 1 | 1 | — |
| 8 | Riscos | 1 | 1 | R-cópia, R-colisão de vocabulário, R-fatos de licença, R-gate |
| 9 | Definition of Done | 1 | 1 | — |
| 10 | Alinhamento com adendo e decisões | 0,5 | 0,5 | Rastreia ao §6 e à DA-17. F2b-AC6 dava ao responsável um teto (10 linhas) que nenhuma fonte registra; origem corrigida. Fica 0,5 porque as definições de observado, derivado e inferido (M1) não estão no adendo |
| | **Total** | **9,0** | **9,5** | **GO condicional** |

**Art. IV e sala limpa:** cada AC aponta o §6 do adendo, a DA-17 ou o `CLAUDE.md`. O comparativo não entra como fonte de texto: o F2b-AC13 o usa só como dado, para a conferência do @qa; nenhum termo do projeto externo é adotado (adendo §8). Nenhuma decisão do responsável foi reaberta.

**Condições do GO:** AC1 a AC4 só fecham com a M1 respondida; AC2 também com a M2; o `CLAUDE.md` só muda com o "sim" do responsável (AC9); nenhuma armadilha de licença entra sem fonte primária (AC11).

**Classificação das lacunas:** nenhuma bloqueia o início.

| Lacuna | Classe | O que trava | Depende do responsável? |
|---|---|---|---|
| M1 | bloqueia só AC | F2b-AC1 a F2b-AC4 (texto das definições) | sim |
| M2 | bloqueia só AC | F2b-AC2 (e a palavra "hipótese" no AC3) | sim |
| M3 | pode seguir | — (AC10 já lê como regra para auditorias futuras) | só confirmação |
| M4 | pode seguir | — (fora desta fatia) | só se ele quiser as skills atualizadas |
| M5 | pode seguir | — (fechada pelo @po) | não |
| M6 | pode seguir | — (não entra; mudaria o critério de conclusão) | não |

**Perguntas ao responsável (com a recomendação do @po):**

- **M1.** Aprova as definições: observado = visto no resultado de tool, execução autorizada ou arquivo lido, com ID de evidência; derivado = cálculo ou cruzamento mecânico de dado observado, com a fórmula ou o comando; inferido = raciocínio sem observação direta? *Recomendo aprovar como estão.*
- **M2.** `Confiança` do `03-mecanicas.md` e o novo campo de origem: (a) dois eixos ou (b) fundir? *Recomendo (a):* não remove nada e evita reescrever a skill `protocolo-mecanicas`.
- **M3.** O campo `licença` vale só para auditorias futuras? *Recomendo sim;* atualizar as seis existentes vira tarefa à parte, se ele quiser.
- **M4.** Os campos novos entram também nas skills `protocolo-*`? *Recomendo não nesta fatia;* rever na próxima revisão das skills.
- **AC9.** Uma linha no `CLAUDE.md` apontando a convenção? *Recomendo sim:* sem ela, a convenção fica invisível para as sessões.
