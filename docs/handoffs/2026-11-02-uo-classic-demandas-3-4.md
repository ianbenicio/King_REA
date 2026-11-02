# Handoff — uo-classic: demandas 3 e 4 (divergências do Anexo A e entrega da especificação)

**Sessão:** `ff5a739b-687b-43ca-93c7-f736e6b2ff73` (app: filha de `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`)
**Data:** 2026-11-02
**Base:** `registros/uo-classic/especificacao.md` no commit `82539c3`

## Entregas

| Entrega | Repositório | Commit | Estado |
|---|---|---|---|
| Documentos alinhados à especificação (README, PRD, arquitetura, roadmap, Story 1.1, dossiê, ledger) | PRKing_UO | `217fa1b` | local |
| Adendo do Anexo A (A.4 resolução, A.5 pendências), cabeçalho de fontes corrigido, linha "Unity" da seção 1 marcada como resolvida | PRKing_REA | `fd30f89` | local |
| Cópia da especificação em `docs/spec/especificacao.md`, presa a `PRKing_REA@fd30f89`, com registro de entrega e pergunta de volta em `docs/spec/README.md`, e `.gitignore` dos formatos de dados do jogo | PRKing_UO | `20f5e8c` | local |
| Este handoff (primeira versão) | PRKing_REA | `61cd9e4` | local |
| Decisões A2, A7, A18 e A26 aplicadas (Story 1.2 removida, PRD e dossiê renomeados com `git mv`, passo de 25 ms, licença) | PRKing_UO | `771cb05` | local |
| Adendo A.6 (decisões do responsável; Anexo A resolvido) e marca na seção 2 | PRKing_REA | `5d11c0d` | local |
| Reentrega da cópia, presa a `PRKing_REA@5d11c0d`, e registro de entrega atualizado | PRKing_UO | `4cbf739` | local |
| Esta atualização do handoff | PRKing_REA | commit seguinte a `5d11c0d` | local |

SHA-256 do arquivo de origem: `4847f334…9438099` na primeira entrega e `7711e74f…f24183a` na reentrega (`5d11c0d`). Nas duas, tirando as três linhas de cabeçalho acrescentadas (`origem`, `entregue_em`, `sha256_origem`), a cópia guardada no git do PRKing_UO bate com ele (conferido).

## Demanda 3 — classificação do Anexo A

- **(a) ajuste no PRKing_UO, resolvido:** A1 (já era git desde `597062d`), A3, A4 (já dizia 6.6), A5, A6, A8, A9, A10–A17, A19, A20; e os achados novos A21 (ledger autorizava estudar código de terceiros e criar regras a partir de fontes públicas), A22 (modelo de preços contra a §11.3), A23 (`screenshot.png` no save com a origem "instalação") e A24 (faltava `.gitignore`).
- **(b) adendo na especificação:** A25 (cabeçalho dizia que nenhum binário foi lido; linha "Unity" da seção 1 ainda dava a divergência como aberta).
- **(c) decididas pelo responsável em 2026-11-02**, todas pela recomendação do A.5 (registro no A.6 da especificação):
  1. **A2** — destino da Story 1.2 (gadget de temperatura). Decisão: tirar do PRKing_UO (feito em `771cb05`).
  2. **A7** (parte) — nome da pasta `PRKing_UO` e dos arquivos `uo-offline-prd.md` e `ultima-online-dossier.md`; alcance de "nunca no repositório". Decisão: arquivos renomeados agora (`docs/prd/prd.md`, `docs/research/dossie-pesquisa-inicial.md`); pasta e repositório renomeados antes de o repositório ficar público; menção descritiva permitida, nunca como nome ou marca.
  3. **A18** — tique da simulação. Decisão: passo de 25 ms para timers de ação e IA, sistemas pesados em fatias de 10 Hz; o intervalo de golpe da §6.1 continua contínuo.
  4. **A26** — licença do Outrora. Decisão: todos os direitos reservados enquanto local; a licença será decidida antes de publicar.
- D3 segue adiada até a magia. Direção de arte segue aberta no PRD do PRKing_UO.

## Demanda 4 — checagem de sala limpa (protocolo de especificação, §4)

| Item | Resultado |
|---|---|
| Nenhum bloco de código do alvo | ok (zero blocos de código no arquivo) |
| Nenhuma instrução manda o projeto ler `alvos/`, `saidas/`, evidência ou código de terceiros | ok (a única menção é a proibição; o `docs/spec/README.md` reforça) |
| Todo DEVE com fonte ou inferência | ok (o adendo não cria DEVE) |
| Sem dado pessoal, segredo, hash de alvo ou endpoint privado | ok (sem IDs `ev_`/`unk_`, hashes longos, e-mails ou caminhos locais; uma URL pública da Unity) |
| Texto do alvo só como rótulo; produto sem marca | ok (nome "Outrora") |
| Teste de suficiência | o que falta está em lacunas (§18) e pendências (§16, A.5) |

## Aceite

| Critério | Resultado |
|---|---|
| Cada item do Anexo A marcado como resolvido, adendo ou pendente | ok (A.4, A1–A26); pendências decididas e registradas no A.6 |
| Documentos do PRKing_UO alinhados, estrutura mantida | ok (só a seção "Primeira versão jogável" do README e a "Fonte das regras" são novas; depois da decisão A7, dois arquivos renomeados com `git mv` e a seção "Licença" do README entrou no lugar de "Ferramentas auxiliares") |
| Cópia entregue com hash | ok (`fd30f89` e, depois, `5d11c0d`; hash conferido nas duas) |
| Commits locais nos dois repositórios, conventional commits, sem `--no-verify` | ok; o `pre-commit` do PRKing_REA passou |
| `npm test` no PRKing_REA | ok, 184 de 184 (nas duas rodadas) |
| Sem push, sem tools `rea`/`ghidra`, sem `alvos/` | ok |

## Falhas e retrabalho

- A primeira escrita do README e do roadmap do PRKing_UO falhou porque o arquivo não tinha sido lido pela ferramenta de escrita; reli e regravei.
- A recomendação da A18 dizia, de início, que todos os tempos caíam em múltiplos de 25 ms; o intervalo de golpe da §6.1 é contínuo. Corrigido antes do commit.
- O PRKing_UO usa `core.autocrlf=true`: a conferência do hash vale para o conteúdo guardado no git, e o `docs/spec/README.md` diz isso.

## Métricas (`sessao.js`)

Primeira rodada, antes do commit do handoff:

| Item | Principal | Subagentes |
|---|---|---|
| Chamadas | 38 | 0 |
| Contexto inicial / médio / máx. | 95k / 209k / 255k | — |
| Escrita de cache | 222k | 0 |
| Leitura de cache | 7,7M | 0 |
| Saída | 73k | 0 |

Ao fim da segunda rodada (decisões do Anexo A), acumulado da sessão, com uma compactação de contexto: 59 chamadas; contexto inicial / médio / máx. 95k / 195k / 268k; escrita de cache 324k; leitura de cache 11,2M; saída 87k; subagentes 0.

Engram: 0 chamadas. Conectores não tocados, por instrução da sessão principal.

## Próximo passo sugerido

O `@po` valida a Story 1.1 revisada. Antes de o PRKing_UO ficar público: renomear a pasta e o repositório (A7, atualizando o item 8 do `CLAUDE.md` deste repositório) e decidir a licença (A26). Depois, a demanda 5 (primeira versão jogável) roda numa sessão própria no PRKing_UO, lendo só `docs/spec/especificacao.md`. Push dos dois repositórios só pelo @devops, com autorização.
