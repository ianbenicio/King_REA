# Handoff — perfil do alvo e pacote de recursos: U2 (catálogo de perfis)

**Sessão:** `98e969b3-15d0-418e-b344-f4be7959c7fe` (aberta pela sessão `local_c49d87ce-8222-42b7-ab15-3969b7e9ebed`) · **Executor:** @architect (spec), @qa (crítica)
**Data:** 2026-11-01 · **Plano:** `docs/plano-de-execucao.md`, unidade U2 · **Base:** `main` @ `88f9aec`

## Entregas

| Entrega | Caminho | Estado |
|---|---|---|
| Catálogo de perfis | `docs/catalogo-perfis-alvo.md` (v0.1) | pronto |
| Este handoff | `docs/handoffs/2026-11-01-perfis-alvo-u2.md` | pronto |

## Spec Pipeline SIMPLE

1. **Gather.** Entradas: calibração da U1, `plano-integracao-games.md`, `benchmark-ferramentas-re.md`, `guia-rea.md` (§3, §7, §8), `conhecimento-universal-modder.md` (marcadores de engine), `rea-niveis.json` e `ghidra-niveis.json`, `protocolo-seguranca/SKILL.md` (triagem e limites por classe) e `mapa-fases.md` do Harness (vocabulário; só leitura). Engram: 1 consulta sobre critérios de complexidade na triagem passiva, 0 resultados.
2. **Spec (@architect).** O catálogo tem: base comum; 10 tipos com marcador de triagem e pacote (2 `cal`, 8 `doc`/`hip`) mais o atributo `jogo`; 6 objetivos com pacote; complexidade com os critérios K1 a K5 e um pacote de profundidade; 9 regras de composição; e uma proposta de registro do perfil para a U3.
3. **Crítica (@qa).** Cada linha foi conferida contra a fonte citada. Achados e o que mudou:

| # | Achado | Correção |
|---|---|---|
| 1 | A regra C6 dizia que só `cal` marca "não carregar", mas havia linhas `doc` em "não carregar" (ex.: Ghidra para .NET, fora do host) | C6 reescrita: "não carregar" `hip` vale como "sob demanda"; "não carregar" firme vem de `cal` ou de `doc` que diga que o recurso não se aplica ou não roda no host |
| 2 | As regras de composição não tinham grau; C2 e C3 são escolhas de desenho | Coluna Grau na tabela; C2 e C3 marcadas `hip` |
| 3 | O exemplo de C2 (Electron com módulo nativo) não tinha fonte | Exemplo retirado da regra |
| 4 | "Pico de contexto parecido" valia só para as sessões dedicadas à análise (a sessão de instalação chegou a 969k) | Qualificador acrescentado |
| 5 | A base dizia "Engram: não carregar na análise", mas uma sessão de análise usou o Engram no fechamento e no benchmark | Engram: não carregar durante a coleta, sob demanda no fechamento |
| 6 | Os critérios K1 a K5 dão "baixa" para um alvo que a U1 rotulou "média" (a diferença veio do objetivo) | Divergência declarada na seção 7 do catálogo, para a U3 |
| 7 | Grau `cal` em itens que são regra do projeto, não uso medido (nativas, gates) | Rebaixados para `doc` |
| 8 | "Subagentes: não carregar na análise" conflitava com o `Explore` sob demanda da base | Linha passa a ser "exceto o `Explore` da base comum" |

**Notas da crítica (1 a 5):** rastreabilidade 5, cobertura do critério 5, verificabilidade dos critérios de triagem 4 (a detecção de `.NET` sem carregar o assembly fica `hip`), consistência interna 4 depois das correções, segurança e cegueira 5. Média 4,6: **APPROVED**.

## Critério e verificação da U2 (plano, seção 3)

- [x] Taxonomia dos 3 eixos com critérios verificáveis na triagem passiva (catálogo §2.1, §3.1, §4.1). Todos usam dados do `protocolo-seguranca` §1–2. Exceção declarada: detectar `.NET` puro.
- [x] Um pacote por valor de eixo, nos estados ativo / sob demanda / não carregar, mais "obrigatório" na base comum (vocabulário do `mapa-fases.md`).
- [x] Regra de composição (§5), com um exemplo.
- [x] Toda entrada com fonte ou marcada como hipótese. **Checagem de fonte linha a linha** feita com um script fora do repositório, que lê cada linha das tabelas com coluna Fonte e cada item de lista do exemplo: 130 linhas com fonte, 10 de legenda e 0 problemas. "—" só é aceito com grau `hip`.
- [x] Tipos sem alvo calibrado (Android, web real, firmware, e também Electron, .NET, Unity, Unreal) nunca aparecem como `cal`.
- [x] `grep -nE "blocos-|encaixe-" docs/catalogo-perfis-alvo.md` vazio (rc=1). Busca dos ids das sessões de piloto também vazia. O catálogo cita só agregados de uso, sem nome de alvo de piloto e sem achado.

## Para a U3

- **Exceções conhecidas na checagem "nenhum recurso usado em não carregar":**
  - um `list_browser_targets` num alvo nativo, que foi teste de recusa do gate de propósito (U1 §3.2);
  - uma `Skill` `aiox-devops` (push) e, nas sessões de protocolo e comparação, `update-config` e `code-review`. Não são recursos de análise, e o catálogo não os classifica. A U3 decide se entram na tabela de cobertura.
- **Benchmark na sessão de análise:** num alvo, o benchmark rodou na mesma sessão da análise. A U3 deve somar o pacote `benchmark` a essa janela (C7 diz "de preferência", não "sempre").
- **Profundidade pedida pelo objetivo** (achado 6): decidir se `especificacao` sobe um nível de profundidade. Hoje isso não é regra.
- **Formato do registro:** a proposta está no catálogo §6 (seção nova no `00-seguranca.md`).
- **Dúvidas da Fase 0 respondidas nesta unidade:**
  - critérios de complexidade sem executar o alvo: K1 a K5;
  - onde entra o perfil: seção nova no `00-seguranca.md`, como proposta.

  O `plano-de-execucao.md` não foi editado: o commit se limita aos arquivos desta unidade.

## Falhas e retrabalho

- Primeira versão com 8 inconsistências, todas achadas pela crítica e corrigidas antes do commit.
- O bloco "Delegação de busca" do `CLAUDE.md` (que cita o `Explore`) ainda não está commitado, e `.claude/agents/Explore.md` não é versionado. O catálogo cita o `Explore` pelo plano (§3), não por esses arquivos.

## Métricas (`sessao.js --sessao 98e969b3-15d0-418e-b344-f4be7959c7fe`, antes do commit)

| Item | Principal | Subagentes |
|---|---|---|
| Chamadas | 21 | 0 |
| Contexto inicial / médio / máx. | 95k / 164k / 205k | — |
| Escrita de cache | 172k | 0 |
| Leitura de cache | 3,3M | 0 |
| Saída | 42k | 0 |

Engram: 1 chamada (`vault_query_tool`, 0 resultados). Nenhuma tool `rea` ou `ghidra` foi chamada, e `alvos/` não foi aberto.

## Conectores

Os 11 conectores do claude.ai foram desligados no início da unidade e religados depois do commit: Supermetrics, Notion, Google Calendar, Claude Docs, viewmax.io, Gmail, Figma, Hugging Face, Supabase, Google Drive e AAR Maker.

## Próxima unidade

**U3, integração no processo** (@dev, SDC). Entregas:
- seção "Perfil do alvo e recursos" em `registros/_modelos/00-seguranca.md`;
- passo correspondente no `protocolo-seguranca`;
- linha no `CLAUDE.md`, só depois que a outra sessão commitar o bloco dela.

Critério: aplicar o catálogo aos 7 alvos no papel, com cobertura de 100%, e rodar `npm test`.
