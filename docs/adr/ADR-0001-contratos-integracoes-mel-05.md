# ADR-0001 — Contratos e inventário único de integrações (MEL-05)

| Campo | Valor |
|---|---|
| Status | **Aceito** em 2026-11-04 pelo responsável (§7). Este documento, por si, não autoriza mudança de contrato, gate, mapa ou registro |
| Data | 2026-11-03 (proposto); 2026-11-04 (aceito) |
| Autoria | @architect (Aria), unidade E3-0a da etapa 3 |
| Origem | `docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md:266-285` (MEL-05) e `:69` (coordenação com a U5 do plano de perfil do alvo) |
| Revisão sugerida | @qa (fatias), @dev (implementação), responsável (aprovação) |

## 1. Contexto

A MEL-05 pede um contrato de servidor e tool (identidade, versão, nível, tipo de recurso, suporte a contexto de execução), um schema para a parte estruturada do protocolo de segurança mantendo a narrativa em Markdown, e um verificador de consistência antes de gerar configuração (`:272`). O aceite (`:278-281`) exige: servidor sem classificação apontado como incompleto; tool desconhecida, schema inválido e nível sem autorização recusados; distinção entre arquivo legado, inválido e revisão nova, sem migrar nem aprovar; matriz de cliente/provider testado. A família de tool da U5 entra como campo do mesmo contrato, sem segundo mecanismo e sem aplicação no gate antes da U4 e da aprovação (`:283-285`). Regra de coordenação: nenhum plano altera `rea-niveis.json`, `00-seguranca.md` ou o gate sem conferir o estado do outro (`:69`).

### 1.1 Levantamento: o que cada arquivo declara hoje

| Arquivo | Declara | Duplicado em | Quem lê |
|---|---|---|---|
| `.mcp.json:3-9` | servidor `rea`: `node node_modules/rea-agents/scripts/rea.mjs mcp` (sem versão explícita; versão vem do pacote) | `package.json:26` (`rea-agents: 6.4.0`), `docs/guia-rea.md:75-76` | Claude Code |
| `.mcp.json:10-22` | servidor `ghidra`: `uvx` com GhidraMCP no commit `1e980252…`, `mcp==1.30.0`, `requests==2.34.2`, servidor `127.0.0.1:8080` | `ghidra-niveis.json:3` (texto livre "commit 1e98025"), `docs/runbook-prereqs-nativo.md:74-88` | Claude Code |
| `.claude/settings.json:10` | matcher `mcp__(rea\|ghidra)__.*` → `rea-gate.mjs` | lista de servidores repetida à mão (comentário em `rea-gate.mjs:3-4`) | Claude Code |
| `.claude/settings.json:20-25` | matcher `Bash\|PowerShell` → `cli-gate.mjs` | — | Claude Code |
| `.claude/hooks/rea-niveis.json:2-3` | `rea_version: 6.4.0`, `catalog_digest: 85d80276…` | `package.json:26`; digest só em `docs/seguranca/auditoria-rea-6.4.0.md:51` | gate (`rea-gate.mjs:84`, só na mensagem) |
| `.claude/hooks/rea-niveis.json:4-11` | definição dos níveis N0–N4b | `ghidra-niveis.json:5-12` (texto idêntico hoje), `.claude/skills/protocolo-seguranca/SKILL.md:59-66` (outra redação) | gate (`rea-gate.mjs:293`, só texto) |
| `.claude/hooks/rea-niveis.json:12-183` | 170 tools → nível (string) | contagem "170 tools" em `CLAUDE.md` e em `auditoria-rea-6.4.0.md:51` | gate (`rea-gate.mjs:80`) |
| `.claude/hooks/ghidra-niveis.json:2-4` | `servidor`, `versao` (texto livre), `nota`; sem digest de catálogo | — | gate (`rea-gate.mjs:84`) |
| `.claude/hooks/ghidra-niveis.json:13-44` | 30 tools, todas N1 | — | gate |
| `.claude/hooks/rea-gate.mjs:63-85` | servidor = `mcp__<servidor>__`; mapa = `<servidor>-niveis.json`; sem mapa ou tool fora de `ferramentas` → nega | — | — |
| `.claude/hooks/rea-gate.mjs:150,157` | frontmatter por regex; `status` = primeiro token após `status:` | `cli-gate.mjs:93,95` (mesma regex, código duplicado) | — |
| `.claude/hooks/rea-gate.mjs:278-281` | `niveis_aprovados` por regex, **só** em lista inline numa linha | — | — |
| `.claude/hooks/rea-gate.mjs:183-212` | seção "Identidade dos arquivos" (título por regex, tabela `Arquivo \| SHA-256`) | modelo `registros/_modelos/00-seguranca.md:86-91` | — |
| `.claude/hooks/rea-gate.mjs:290` | N3 e N4b pedem confirmação (constante no código) | `SKILL.md:76`, `CLAUDE.md` | — |
| `.claude/hooks/cli-gate.mjs:54-58,95-105` | subcomandos livres; demais exigem `status: aprovado` e pedem confirmação; **não lê `niveis_aprovados` nem mapa** | — | — |
| `registros/_modelos/00-seguranca.md:1-9` | frontmatter: `alvo, status, niveis_aprovados, classe, confidencial, aprovado_por, data`; sem versão de schema | — | gate (por regex) |
| `registros/_modelos/00-seguranca.md:93-96` | tabela de adendos `Data \| Tool \| Nível \| Motivo \| Aprovação` | — | ninguém (o gate não lê) |
| `docs/guia-rea.md:76-78,150` | servidor `rea`; trava = `rea-gate.mjs` e `rea-niveis.json` | — | pessoas |

### 1.2 Divergências observadas

Divergências reais encontradas no levantamento:

- **D1.** `docs/runbook-prereqs-nativo.md:74,82` registra o GhidraMCP "fixado na tag 2.0" (`@2.0`), sem `mcp`/`requests`. `.mcp.json:14-18` usa o commit `1e980252…` e fixa as duas dependências. A configuração está mais rígida que o documento, mas o documento está desatualizado.
- **D2.** `docs/guia-rea.md:76-78` só cita o servidor `rea` e o `rea-niveis.json`. Não cita `ghidra` (`.mcp.json:10`, `settings.json:10`) nem `ghidra-niveis.json`.
- **D3.** `docs/guia-rea.md:62` marca Ghidra + JDK como "⏳ Falta instalar", e `docs/runbook-prereqs-nativo.md:91-94` registra a instalação em 14/10/2026. **Resolvida em 2026-11-04 (§7, D-1):** o Ghidra está instalado; o guia é que está desatualizado. Continua aberto se o provider Ghidra do REA está em uso, porque `.mcp.json:3-9` não tem `REA_ANALYSIS_PROVIDER` (`guia-rea.md:226-231`). Esse ponto fica na matriz (§2e, pergunta 6.9).
- **D4.** Os cabeçalhos dos mapas não seguem um schema comum: `rea_version` e `catalog_digest` de um lado, `servidor`, `versao` e `nota` do outro. O gate absorve a diferença (`rea-gate.mjs:84`). Nada confere a versão do mapa com `package.json`/lock ou com o commit do `.mcp.json`. O digest de catálogo só aparece no mapa e na auditoria.
- **D5.** A mensagem do gate manda "registre um adendo" (`rea-gate.mjs:285`), mas a liberação depende só de `niveis_aprovados` (`:278`). A tabela de adendos (`modelo:93-96`) é por tool e ninguém a lê. Aprovar um nível libera todas as tools desse nível. Falta confirmar se essa é a semântica pretendida.
- **D6.** O caminho CLI não tem mapa de tool para nível (`cli-gate.mjs:95-105`). Por isso, "tool desconhecida recusada" só vale hoje no caminho MCP.

Divergências possíveis, sem detecção automática hoje:

- servidor em `.mcp.json` sem mapa (o gate nega, mas só na chamada);
- servidor com mapa e sem cobertura do matcher (o gate nem roda, e a tool fica sem trava);
- mapa órfão;
- nível de tool fora de `niveis`;
- `niveis` diferente entre mapas;
- nome de tool que colide com propriedade herdada (`rea-gate.mjs:80` usa `?.[tool]`; hoje acaba em negação, com mensagem enganosa);
- `niveis_aprovados` em YAML de bloco ou `status` entre aspas, que o gate lê como vazio (nega por segurança);
- versão do mapa diferente do pacote instalado.

### 1.3 Onde um componente novo entra no verificador e na CI

- Componentes em `scripts/verificar/verificar.mjs:252-315`, com `depende` e `requisito`. O verificador não lê `alvos/` nem `saidas/` (`:11`).
- Jobs da CI em `scripts/verificar/agregar-ci.mjs:24-30`. O job `js` (`:25`) roda os componentes Node.
- `.github/workflows/verificacao.yml:50` repete o `--so` do job `js`, e `scripts/verificar/workflow-ci.test.mjs:45-56` exige que seja igual ao `JOBS`.
- `workflow-ci.test.mjs:58-61` exige que todo componente esteja em algum job.
- Os testes entram no script `test` de `package.json:12`. A checagem de tipos dos módulos de política é feita pela lista `files` do `tsconfig.json` (`verificar.mjs:228-230`).

## 2. Decisões propostas

### (a) Contrato de servidor e de tool

**Alternativas:**

- **A1.** Trocar o valor de cada tool de string para objeto (`{nivel, recurso, …}`). Exige mudar o gate (`rea-gate.mjs:80`), ou ele passa a negar tudo.
- **A2.** Manter `ferramentas: {tool: nivel}` exatamente como está e acrescentar dois blocos, que o gate ignora (ele só lê `ferramentas`, `versao`/`rea_version` e `niveis`; `rea-gate.mjs:80,84,293`): `contrato`, no nível do servidor, e `atributos`, por tool, opcional e paralelo.
- **A3.** Contrato num arquivo separado dos mapas.

**Recomendada: A2.** Não toca o caminho de segurança, é compatível com os mapas atuais e mantém o nível num só lugar. Formato proposto (campos; valores entre `<>` a definir):

```json
"contrato": {
  "schema": 1,
  "servidor": "rea",
  "origem": { "tipo": "npm", "pacote": "rea-agents", "versao": "6.4.0" },
  "catalogo": { "digest": "<sha256>", "ferramentas": 170 },
  "auditoria": "docs/seguranca/auditoria-rea-6.4.0.md",
  "recurso_padrao": "<tipo>",
  "clientes": [ { "cliente": "claude-code", "caminho": "mcp", "estado": "<testado|nao-testado|sem-adaptador>", "evidencia": "<arquivo ou data>" } ]
},
"atributos": { "<tool>": { "recurso": "<tipo>", "contexto_execucao": "<vínculo>", "familia": "<opcional, U5>" } }
```

- `origem.tipo`: `npm` (conferido com `package.json`/lock) ou `git` (`url` + `commit` completo, conferido com os `args` do `.mcp.json`). A versão em texto livre fica só como rótulo.
- `recurso`: o tipo de recurso que a tool acessa. A lista de valores fica a confirmar. Ponto de partida: as categorias de `rea-gate.mjs:11-13` e `SKILL.md:59-66` (arquivo do alvo, sessão ou evidência, processo, navegador/URL, dispositivo).
- `contexto_execucao`: insumo da MEL-06; aqui o contrato só declara o campo. Os valores partem dos casos que o gate já distingue: `caminho` (conferido), `sessao` (documento ou programa já aberto, como no Ghidra), `url`, `dispositivo` e `nenhum` (`rea-gate.mjs:11-13,21-22`). Nada é implementado.

**Consequências:**

- Os mapas ganham cabeçalho uniforme, o que resolve a D4 sem tirar `rea_version`/`versao`: o gate continua lendo essas chaves e elas viram aliases conferidos.
- `atributos` duplica as chaves de `ferramentas` dentro do mesmo arquivo. O verificador passa a exigir o mesmo conjunto de chaves quando o bloco existir.
- Classificar errado continua sendo problema da auditoria: nenhum verificador detecta tool perigosa marcada como N0.

### (b) Schema da parte estruturada do `00-seguranca.md`

**Alternativas:**

- **B1.** Frontmatter atual com `schema: 00-seguranca/1` e uma gramática restrita: uma `chave: valor` por linha, escalar sem aspas ou lista inline. É exatamente o que o gate já sabe ler.
- **B2.** Bloco JSON delimitado numa seção.
- **B3.** Arquivo irmão `00-seguranca.json`.

**Recomendada: B1.** O frontmatter já é a parte estruturada (`modelo:1-9`) e o gate já depende dele. A gramática restrita deixa de lado YAML de bloco e aspas, que hoje o gate lê como vazio. Também dispensa parser YAML, coerente com o gate sem dependências. A tabela "Identidade dos arquivos" continua em Markdown: o formato já é estrito (`rea-gate.mjs:185-212`), e o schema v1 só a referencia pelo título.

Classificação, só leitura:

| Estado | Critério |
|---|---|
| **legado** | Sem a chave `schema`. Avaliado pelas regras atuais do gate. O verificador informa "legado", e o comportamento do gate não muda. |
| **inválido** | `schema` presente mas fora da gramática; `status` fora de `pendente\|aprovado\|reprovado` (`modelo:13`); nível fora de `niveis`; versão de schema desconhecida (fail-closed); ou arquivo que nem o gate atual lê. |
| **revisão nova** | `schema: 00-seguranca/1` válido. |

Nunca se reescreve o arquivo. A migração é humana, por adendo aprovado, porque `CLAUDE.md` proíbe editar `status`/`niveis_aprovados` sem aprovação.

**Consequências:**

- Os gates só passam a usar o parser nas fatias 4a (`rea-gate.mjs`) e 4b (`cli-gate.mjs`).
- "Revisão nova" foi lida como "registro na revisão nova do schema". Outra leitura possível é "protocolo novo para versão nova do alvo" (`rea-gate.mjs:243`). Fica a confirmar.

### (c) Onde mora o inventário e o que é gerado

**Alternativas:**

- **C1.** Arquivo novo de inventário como fonte, gerando mapas, matcher e documentação.
- **C2.** Os próprios mapas `.claude/hooks/<servidor>-niveis.json`, com o bloco `contrato`, como inventário (um arquivo por servidor, descoberto por padrão de nome). `.mcp.json`, matcher e documentação continuam editados à mão e conferidos.
- **C3.** Inventário em Markdown.

**Recomendada: C2.** Não cria segunda fonte e não muda o que o gate lê. Segue o plano: primeiro conferir, gerar depois (`:272`). O `.mcp.json` não é gerado, porque os argumentos de execução fazem parte do que foi auditado. Gerar o matcher (`settings.json:10`) é candidato futuro, só se simplificar.

**Consequências:** "único" passa a ser "um contrato por servidor, num só padrão de caminho". O verificador garante que o conjunto de servidores é o mesmo em `.mcp.json`, nos mapas e no matcher.

### (d) Família de tool da U5

**Decisão:** `atributos.<tool>.familia` é opcional, sem valores definidos aqui: o vocabulário vem da U5. O gate não lê o campo, e a aplicação depende da U4 e da aprovação item a item (`:285`; `docs/planos/2026-11-01-perfis-alvo.md:101`). O verificador só confere a forma (string não vazia, se presente).

**Alternativa descartada:** arquivo ou chave de família fora do contrato. Seria o segundo mecanismo que o plano veda.

**Consequências:** quem chegar primeiro registra a mudança no `rea-niveis.json` e o outro plano adapta (`:69`).

### (e) Matriz cliente/provider testado

**Decisão:** a matriz mora em `contrato.clientes` de cada mapa, e o verificador a imprime. Estado inicial proposto, a confirmar pelo responsável:

| Cliente | Servidor | Caminho | Estado | Evidência |
|---|---|---|---|---|
| Claude Code | rea | MCP + hook | testado (unitário do hook) | `.claude/hooks/rea-gate.test.mjs`; doctor em `auditoria-rea-6.4.0.md:51` |
| Claude Code | ghidra | MCP + hook | testado (unitário do hook) | `rea-gate.test.mjs:120,192` |
| Claude Code | rea | CLI + hook | testado (unitário) | `.claude/hooks/cli-gate.test.mjs` |
| Claude Code | rea + provider ghidra | MCP | a confirmar (Ghidra instalado, D-1; uso pelo provider do REA aberto, 6.9) | `guia-rea.md:62,226-231` |
| Codex | todos | — | sem adaptador | nenhum `.codex/` nem `AGENTS.md` no checkout; Codex citado só para WPF (`contrato-ambiente.md:83,128`) |

**Consequência:** a fatia 1 não promete enforcement no Codex. A forma de nomear tools e a existência de hooks no Codex ficam a confirmar.

### (f) Fatias

- **Fatia 1 (recomendada para começar).** Componente `integracoes` (sugestão: `scripts/integracoes/verificar-integracoes.mjs` + teste), `depende: ["ambiente-node"]`, no job `js` (`agregar-ci.mjs:25`, `verificacao.yml:50`, `package.json:12`, tsconfig). Confere, só com leitura estática:
  1. o mesmo conjunto de servidores em `.mcp.json`, nos mapas e no matcher (testando `mcp__<servidor>__x` contra a regex); mapa sem servidor no `.mcp.json` **falha** (D-4, §7), com a mensagem descrita abaixo;
  2. JSON válido, `ferramentas` não vazio, nome de tool `^[A-Za-z0-9_-]+$` e não herdado;
  3. nível ∈ `niveis` e `niveis` igual entre os mapas;
  4. `rea_version` = `package.json` = lock;
  5. commit do mapa ghidra como prefixo do commit do `.mcp.json`;
  6. o modelo `registros/_modelos/00-seguranca.md` legível pelas regras do gate (frontmatter, lista inline, uma única seção de identidade);
  7. `docs/guia-rea.md` cita cada servidor do `.mcp.json` e o mapa dele (`<servidor>-niveis.json`), o que detecta a D2;
  8. toda referência `GhidraMCP@<ref>` em `docs/runbook-prereqs-nativo.md` é prefixo do commit do `.mcp.json:14`, o que detecta a D1 (hoje falharia em `runbook-prereqs-nativo.md:82`, que usa `@2.0`).

  Mensagens dizem qual contrato está incompleto. A mensagem do mapa sem servidor (ponto 1) deve conter:
  - o arquivo do mapa, o nome de servidor que o gate deriva dele (`<servidor>-niveis.json` ↔ `mcp__<servidor>__`, `rea-gate.mjs:63-85`) e a lista de servidores do `.mcp.json`;
  - as causas prováveis, cada uma com a solução:
    - servidor removido do `.mcp.json` e mapa esquecido → apagar o mapa e tirar o servidor do matcher (`settings.json:10`);
    - nome do servidor divergente entre o mapa e a chave do `.mcp.json` → dar o mesmo nome aos dois, citando, se existir, o servidor do `.mcp.json` que ficou sem mapa;
    - mapa de servidor ainda não registrado → registrar o servidor no `.mcp.json` e no matcher, depois da auditoria e da fixação de versão (regra de servidor novo de RE em `CLAUDE.md`);
  - o aviso de que o verificador não corrige nada: a correção é manual.

  **Documentação em prosa (D-2, §7).** A fatia 1 também corrige o texto. No runbook (D1): o registro do GhidraMCP passa a usar o commit e as fixações de `mcp` e `requests` de `.mcp.json:14-18`. No guia: a D2 ganha o servidor `ghidra` e o `ghidra-niveis.json` na tabela de instalação (`guia-rea.md:73-79`); a D3 passa a marcar Ghidra + JDK como instalados, conforme `runbook-prereqs-nativo.md:91-94`. Depois disso, a D1 e a D2 são detectadas pelos pontos 8 e 7. A D3 só é corrigida, não detectada. Justificativa: os pontos 7 e 8 só buscam nomes e referências em arquivos versionados, dentro do escopo estático; já a instalação do Ghidra é estado da máquina, fora do checkout, e nenhuma leitura estática a confere.

  **Não faz:** não muda gate, mapa, `.mcp.json`, settings nem registros; não executa o REA; não lê `alvos/`, `saidas/` nem `registros/<slug>/`. **Depende de:** nada além de `ambiente-node`.
- **Fatia 2.** Bloco `contrato` (+ `atributos` opcional) nos dois mapas; o verificador passa a exigi-lo. **Não faz:** não muda o gate nem aplica família. **Depende de:** fatia 1.
- **Fatia 3.** `schema: 00-seguranca/1` no modelo, parser compartilhado e relatório legado/inválido/revisão nova dos registros versionados. **Não faz:** não migra, não edita `status`/`niveis_aprovados`, não muda a decisão do gate. **Depende de:** fatia 1.
- **Fatia 4a (gate MCP).** `rea-gate.mjs` usa o parser compartilhado: v1 estrito, legado pelo caminho atual, inválido nega; `Object.hasOwn` na busca da tool (`rea-gate.mjs:80`). **Não faz:** não toca `cli-gate.mjs`, não aprova nada, não afrouxa nenhum caso hoje negado, não entra sem regressão completa (`rea-gate.test.mjs`) e @qa. **Depende de:** fatia 3.
- **Fatia 4b (`cli-gate`).** `cli-gate.mjs` troca a regex duplicada (`cli-gate.mjs:93,95`) pelo parser compartilhado, com as mesmas regras da 4a. Se a pergunta 6.5 decidir que o CLI entra em "tool desconhecida recusada", a 4b também recusa comando sem classificação. O mapa de comando para nível que isso exige não existe hoje (D6), e o desenho dele fica para depois da 6.5. **Não faz:** não toca `rea-gate.mjs`, não aprova nada, não afrouxa nenhum caso hoje negado, não entra sem regressão completa (`cli-gate.test.mjs`) e @qa. **Depende de:** fatia 3; a parte da recusa depende também da 6.5. Não depende da 4a: as duas são separadas para que cada gate mude com regressão e revisão próprias.
- **Fatia 5 (opcional).** Gerar o matcher a partir dos mapas. **Não faz:** não gera `.mcp.json`. **Depende de:** fatia 1 e pergunta 6.10.
- **Fora da MEL-05.** Aplicar família no gate (U5) e adaptador do Codex.

## 3. Alternativas globais descartadas

- **Reescrever os contratos de uma vez, com o gate novo.** Mistura desenho e caminho de segurança num só passo e arrisca bloquear todas as análises com registros legados.
- **Gerar tudo a partir de um inventário central.** Contraria o "verificador primeiro" (`:272`) e põe argumentos de execução auditados sob geração.

## 4. Consequências gerais

- **Positivas:**
  - servidor ou tool nova sem mapa, matcher ou versão coerente, e mapa sem servidor, falham na CI antes da chamada;
  - a D4 passa a ser detectável (pontos 4 e 5 da fatia 1; cabeçalho uniforme na fatia 2);
  - a D1 e a D2 são corrigidas na fatia 1 e passam a ser detectáveis (pontos 8 e 7 do §2f); a D3 é só corrigida, sem detecção;
  - a D5 e a D6 continuam dependendo das perguntas 6.4 e 6.5;
  - a matriz de clientes fica explícita.
- **Negativas:**
  - mais um componente no job `js`;
  - `atributos` aumenta o `rea-niveis.json`;
  - parser compartilhado entre `.claude/hooks/` e `scripts/` cria acoplamento (a localização fica para decisão);
  - os pontos 7 e 8 prendem o guia e o runbook ao `.mcp.json`: mudar um servidor passa a exigir a documentação no mesmo commit.
- **Compatibilidade:** fatias 1–3 sem mudança de comportamento do gate; registros legados seguem lidos como hoje. As fatias 4a e 4b mudam um gate cada.

## 5. Riscos

- **R1.** A semântica de casamento do matcher no Claude Code (âncoras, regex completa ou parcial) está a confirmar. Sem isso, a checagem do matcher pode dar falsa confiança.
- **R2.** Classificação errada de nível só a auditoria pega; o verificador confere forma, não risco.
- **R3.** As fatias 4a e 4b mexem no caminho de segurança: regressão pode liberar demais (pior caso) ou bloquear tudo. Mitigação: fail-closed e testes de mutação.
- **R4.** Os registros de alvos são dados derivados do alvo. O parser só lê e não ecoa trechos longos nas mensagens.
- **R5.** Conflito com o plano de perfil do alvo no `rea-niveis.json` (`:69`).
- **R6.** A leitura do catálogo real do REA (`mcp doctor`) executa código do pacote. Fica fora da fatia 1; onde o catálogo mora no pacote está a confirmar.

## 6. Itens pendentes de decisão do responsável

A numeração é estável: itens decididos ficam no lugar, marcados.

1. **Decidida (D-1, §7):** ADR aceito.
2. **Decidida (D-5, §7):** "revisão nova" = protocolo novo para versão nova do alvo, com `schema: 00-seguranca/1`.
3. **Decidida (D-4, §7):** mapa órfão (sem servidor no `.mcp.json`) falha, com causas e soluções na mensagem (§2f, ponto 1).
4. **Decidida (D-6, §7):** aprovação continua por nível, como hoje (D5 não vira aprovação por tool).
5. **Decidida (D-7, §7):** o caminho CLI **entra** em "tool desconhecida recusada" (D6); a fatia 4b inclui a recusa e o mapa de comando para nível.
6. **Decidida (D-2, §7):** D1–D3 corrigidas junto com a fatia 1.
7. Auditoria do GhidraMCP: manter no runbook (`runbook-prereqs-nativo.md:67`) ou mover para `docs/seguranca/`? **Decidida (adendo 1, DA-6):** `docs/seguranca/auditoria-ghidramcp-2.0.md`.
8. **Decidida (D-8, §7):** parser compartilhado em `.claude/hooks/lib/`; a CI da fatia 3 testa só fixtures, sem validar registros reais.
9. Estado inicial da matriz (§2e), incluindo o uso do provider Ghidra pelo REA, e prazo para um adaptador do Codex. **Decidida (adendo 1, DA-7):** matriz aceita; Codex sem adaptador e sem prazo.
10. **Decidida (D-9, §7):** o matcher só é conferido, não gerado.

## 7. Decisões do responsável (2026-11-04)

Tomadas pelo responsável na conversa, em 2026-11-04.

- **D-1.** ADR aceito (Proposto → Aceito). Informação dele: o Ghidra está instalado. Isso resolve a D3: o guia (`guia-rea.md:62`) está desatualizado, e o runbook registra a instalação em 14/10/2026 (`runbook-prereqs-nativo.md:91-94`).
- **D-2.** A correção da documentação em prosa (D1–D3) entra junto com a fatia 1, não em unidade própria (§2f).
- **D-4.** Mapa de níveis sem servidor correspondente no `.mcp.json` não tem utilidade e **falha**. A mensagem identifica as causas prováveis e as soluções (§2f, ponto 1).
- **§4 corrigido** (apontado pelo @po): o texto dizia que as D1–D3 passavam a ser detectáveis, mas os seis pontos da fatia 1 não liam documentação em prosa. Com a D-2, a fatia 1 ganhou os pontos 7 e 8, que detectam a D1 e a D2; a D3 é só corrigida.
- **P-5.** A fatia 4 foi dividida em 4a (gate MCP, `rea-gate.mjs`) e 4b (`cli-gate.mjs`, com a recusa de tool desconhecida condicionada à 6.5).

### Decisões de 2026-11-05 (perguntas 2, 4, 5, 8 e 10 do §6)

Tomadas pelo responsável na conversa, por `AskUserQuestion`. Registro do orquestrador; nenhuma decisão de 2026-11-04 foi alterada. Recomendação seguida em D-5, D-6, D-8 e D-9; **D-7 foi contra a recomendação** (que era deixar o CLI fora).

- **D-5 (6.2).** "Revisão nova" é protocolo novo por versão do alvo: mudou o alvo (hash ou versão), faz-se novo `00-seguranca.md` com `schema: 00-seguranca/1` e aprovação nova. Nada migra nem aprova sozinho. Efeito: define o relatório da fatia 3 (legado, inválido, revisão nova).
- **D-6 (6.4).** A aprovação continua **por nível**; aprovar um nível libera todas as tools dele. Fica descartada, por ora, a aprovação por tool via adendo (D5). Efeito: o desenho do schema (fatia 3) e a 4a não precisam de lista de tools aprovadas; a mensagem de "adendo" do gate só é ajustada ou documentada, se preciso.
- **D-7 (6.5).** O caminho CLI **entra** na regra "tool desconhecida é recusada". Efeito: a fatia 4b inclui a recusa de comando sem classificação e, por isso, o **mapa de comando para nível** (hoje inexistente, D6); o desenho desse mapa precisa de adendo ao ADR e a 4b sobe de tamanho (provável G). O `cli-gate.mjs` continua fora do alcance até lá.
- **D-8 (6.8).** O parser compartilhado mora em `.claude/hooks/lib/`, para o gate importar sem depender de `scripts/`. A CI da fatia 3 testa só fixtures; registros reais não são validados na CI (só relatório local).
- **D-9 (6.10).** O matcher é só **conferido** (já é, desde a fatia 1); não se gera `settings.json` por script. A fatia 5 deixa de ter objeto; fecha-se sem implementação, salvo decisão nova.