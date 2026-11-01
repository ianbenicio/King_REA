# Story MEL-06a — conferir o hash do alvo na admissão

**Status:** Done (QA no caminho curto, 2026-11-01)
**Workflow:** SDC, caminho curto para entrega P (plano de evolução §3 e §10) · **Plano:** [`docs/plano-de-execucao.md`](../plano-de-execucao.md) §3 · **Origem:** achado A03 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-06a do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md)
**Complexidade:** SIMPLE · estimativa P (a migração dos registros existentes ficou numa fatia à parte, MEL-06a-m)

## Story

**Como** responsável pelo laboratório,
**quero** que o gate só admita um arquivo de `alvos/<slug>/` cujo SHA-256 seja o registrado na aprovação,
**para** que uma aprovação deixe de valer para outro conteúdo no mesmo caminho.

## Contexto

O gate (`.claude/hooks/rea-gate.mjs`) lia `status`, níveis e caminhos do `00-seguranca.md`, mas não conferia o SHA-256. Na reprodução do parecer, conteúdo substituído com hash fictício recebeu `allow`.

Os schemas do REA 6.4.0 mostram onde o conteúdo entra. `inspect_artifact` e `extract_artifact` não recebem caminho: operam sobre o documento que o `open_binary` abriu. A admissão real são os argumentos de caminho local: `path` de `open_binary`, `inspect_pe_resources`, `inspect_managed_*`, `inspect_android_*`, `inspect_firmware_regions`, `extract_firmware`, `recover_javascript_sources`; `input_path` de `analyze_javascript_application`; `roots` de `trace_dylib_resolution`; `executable`, `executable_path`, `application_path` e `working_directory` das capturas N3; `apk_path` e `local_path` do adb; `local_path` das comparações N0. O gate já coletava todos eles para o vínculo ao alvo.

Os registros reais guardam o hash em formatos livres e incompatíveis: hash único (`notepad-teste`), hash do conjunto mais tabela por arquivo (`blocos-*`, `encaixe-*`), hash abreviado (`notepad-reimpl`), várias tabelas com colunas diferentes e lista completa só em `saidas/`, fora do git (`uo-classic`). Ler esse texto livre seria ambíguo.

## Escopo

**Dentro:** `.claude/hooks/rea-gate.mjs` e o teste; seção 8 do modelo `registros/_modelos/00-seguranca.md`; passos da skill `protocolo-seguranca` que preenchem e ampliam a seção; nota no `CLAUDE.md`; nota de coordenação no plano do piloto (`docs/planos/2026-11-01-perfis-alvo.md`).
**Fora:** migração dos `00-seguranca.md` existentes (fatia MEL-06a-m, abaixo); proveniência própria de `saidas/<slug>/`, identidade de bundle, revalidação depois da admissão, identidade de programa no Ghidra, `run_id` (MEL-06); CLI `npx rea` (`cli-gate.mjs`, MEL-07); `rea-niveis.json` e `ghidra-niveis.json` (inalterados).

## Critérios de aceitação

- [x] **AC1** — Arquivo substituído depois da aprovação é bloqueado na admissão, e o original continua liberado. Teste: `open_binary` no original dá `allow`; com o conteúdo trocado no mesmo caminho, `open_binary`, `inspect_pe_resources`, `capture_process_scenario` (N3) e `compare_artifacts` (N0 com `local_path`) dão `deny` com "diverge do registrado"; com o original de volta, `allow`. Com vários arquivos, cada um confere com o seu hash; um diretório admitido confere todos os arquivos dele.
- [x] **AC2** — Alvo sem hash registrado é bloqueado com motivo claro, sem editar `status` nem `niveis_aprovados`. Seis casos negados com mensagem que cita a seção "Identidade dos arquivos" e a skill `protocolo-seguranca`: seção ausente, vazia, hash abreviado, caminho com dois hashes, seção repetida, caminho que sai do alvo. O `00-seguranca.md` da fixture fica byte a byte igual depois de cada chamada.
- [x] **AC3** — Regressões novas em `rea-gate.test.mjs` e `npm test` verde: 5 testes novos; 4 falham no hook antigo; `npm test` 173/173.
- [x] **AC4** — Limitação documentada (cabeçalho do hook, esta story, plano de evolução, handoff): substituição depois da admissão e troca de programa no Ghidra continuam cobertas só pela MEL-06.

## Decisões

- **Fonte do hash: seção 8 "Identidade dos arquivos" do `00-seguranca.md`.** Tabela `| \`caminho\` | \`SHA-256\` |`, uma linha por arquivo copiado, caminho relativo a `alvos/<slug>/` com `/`, hash completo (64 hex). O gate não lê os formatos livres das seções 2 e de adendos. Fail-closed: seção ausente, repetida ou vazia, linha fora do formato, hash incompleto, caminho absoluto ou com `..`, e o mesmo caminho com dois hashes bloqueiam. A comparação de caminho ignora caixa no Windows.
- **Admissão = argumento de caminho que aponta para `alvos/<slug>/`.** Vale para qualquer nível, inclusive N0 com `local_path`. Arquivo: confere o hash. Diretório: confere cada arquivo dele; arquivo fora da tabela bloqueia. Link dentro de `alvos/<slug>/`, caminho inexistente (inclusive diretório de saída apontado para `alvos/`) e tipo especial bloqueiam.
- **Só a admissão calcula.** Consultas sobre documento aberto (`procedure_*`, `read_bytes`, `extract_artifact` etc.) e as tools do Ghidra não têm caminho e não recalculam nada. O hash é lido em blocos de 1 MiB, sem carregar o arquivo inteiro. Um caminho repetido na mesma chamada é conferido uma vez.
- **`saidas/<slug>/` nunca é comparado.** Saída extraída ou derivada e bundle de evidência não são comparados ao hash do arquivo pai. O vínculo ao alvo (caminho dentro de `saidas/<slug>/`) continua; a proveniência própria é da MEL-06.
- **A conferência vem depois das regras anteriores.** Mapa, alvo ativo, `status`, caminho dentro do alvo e nível aprovado são conferidos antes, como já eram; o hash só é calculado para uma chamada que passaria. N3 e N4b continuam pedindo confirmação, agora depois da conferência.
- **Nenhuma aprovação é preenchida pelo gate.** Hash ausente ou ambíguo bloqueia e aponta o protocolo; o hash entra pela triagem ou por adendo aprovado.

## Fatia MEL-06a-m — migração dos registros existentes (pendente)

Depois deste commit, todo alvo registrado antes (`uo-classic`, que é o `ALVO_ATIVO`, `notepad-teste`, `notepad-reimpl`, `blocos-a`, `blocos-b`, `encaixe-1`, `encaixe-2`) fica bloqueado na admissão por falta da seção 8. As tools sem caminho (consultas sobre documento aberto, Ghidra) e os caminhos em `saidas/<slug>/` seguem como antes.

A migração acrescenta a seção 8 a cada registro que voltar a ser usado, com os hashes da triagem: as tabelas por arquivo dos registros (`blocos-*`, `encaixe-*`, `notepad-teste`, tabelas e adendos do `uo-classic`) e as listas em `saidas/uo-classic/*-sha256.tsv`. O `notepad-reimpl` tem hash abreviado: precisa de nova medição conferida pelo responsável. A migração não muda `status` nem `niveis_aprovados`, mas mexe em registro aprovado: sai alvo por alvo, com aprovação do responsável na conversa, e não usa o hash do arquivo atual sem conferência.

## Limitações

- **Substituição depois da admissão:** o REA lê o arquivo depois que o hook termina; uma troca nesse intervalo, ou depois da abertura, não é vista. Só a MEL-06 (cópia controlada e revalidação por `run_id`) cobre.
- **Troca de programa no Ghidra:** as tools do Ghidra operam sobre o programa já aberto e não recebem caminho; o gate não sabe qual programa está carregado. Só a MEL-06 cobre.
- **CLI:** `npx rea <comando>` contra um alvo passa pelo `cli-gate.mjs`, que pede confirmação mas não confere hash. Política comum é a MEL-07.
- **Cobertura prometida:** só os pontos testados: argumento de caminho para arquivo e diretório em `alvos/<slug>/` nas tools do REA, em N0, N1 e N3. Tools com caminho não exercitadas nos testes passam pelo mesmo código (a coleta de caminhos já existente), mas não têm regressão própria.

## Tasks

- [x] Mapear pelos schemas do REA 6.4.0 os pontos de admissão e os argumentos de caminho.
- [x] Definir o formato da seção 8 e acrescentá-lo ao modelo do `00-seguranca.md`.
- [x] Conferir no gate o SHA-256 de cada arquivo admitido (arquivo e diretório), fail-closed.
- [x] Regressões: substituição, vários arquivos, diretório, hash ausente ou ambíguo, admissão só em `alvos/`, saídas e consultas sem conferência.
- [x] Skill `protocolo-seguranca`: preencher a seção 8 na decisão; adendo para arquivo novo; hash divergente abre protocolo novo.
- [x] Registrar a mudança no plano do piloto e no `CLAUDE.md`; marcar os aceites no plano de evolução.

## File List

- `.claude/hooks/rea-gate.mjs` — conferência de identidade na admissão; cabeçalho com as limitações.
- `.claude/hooks/rea-gate.test.mjs` — fixture com arquivos e seção 8; 5 testes novos (MEL-06a).
- `registros/_modelos/00-seguranca.md` — seção 8 "Identidade dos arquivos".
- `.claude/skills/protocolo-seguranca/SKILL.md` — §2 (hash completo de cada cópia), §6 passo 5 (seção 8), §7 passo 5 (adendo de arquivo novo).
- `CLAUDE.md` — fluxo, passo 2: admissão por hash.
- `docs/planos/2026-11-01-perfis-alvo.md` — mudança registrada para a U4.
- `docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md` — aceites da MEL-06a.
- `docs/plano-de-execucao.md` (novo) e `docs/planos/2026-11-01-evolucao-etapa1-mel01-mel02.md` (plano anterior, arquivado).
- `docs/stories/mel-06a-hash-admissao.story.md` — esta story.

## QA Results

**Gate:** PASS (caminho curto: implementação e QA na mesma unidade, @dev + @qa).

| Verificação | Resultado |
|---|---|
| Regressões novas contra o hook antigo (`git show HEAD:.claude/hooks/rea-gate.mjs` em pasta temporária, com o teste novo) | 4 de 5 falham; a quinta (saídas, consultas e Ghidra sem conferência) passa nos dois, porque guarda o que não deveria mudar |
| `node --test .claude/hooks/rea-gate.test.mjs` | 12/12 (7 anteriores, ajustados à fixture com arquivos e seção 8, e 5 novos) |
| `npm test` | 173/173 (eram 168; +5 da MEL-06a) |
| `rea-niveis.json`, `ghidra-niveis.json`, `00-seguranca.md` reais | inalterados (`git diff --stat`) |
| Tools `rea`/`ghidra` e `alvos/` | não chamadas nem abertas; schemas lidos de `node_modules/rea-agents` por script temporário |

**Observação:** os testes anteriores mudaram só na fixture (arquivo `app.exe` real e seção 8), porque caminho inexistente em `alvos/` agora bloqueia. Nenhuma asserção anterior foi removida ou invertida.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-06a; caminho curto P, sem validação @po separada (plano de evolução §3) | sessão aberta por `local_04e63149` |
| 2026-11-01 | Draft → InProgress: implementação iniciada | @dev |
| 2026-11-01 | InProgress → InReview: implementação e testes concluídos; migração fatiada (MEL-06a-m) | @dev |
| 2026-11-01 | InReview → Done: gate PASS | @qa |
