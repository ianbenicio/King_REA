# Handoff — uo-classic: pesquisa pública e especificação (Outrora)

**Sessão:** `60927a1c-a991-45d1-9c07-552f677409e3` (app: filha de `local_e6556b0c-a0f5-4201-9b0b-baa6782b2ca3`)
**Início:** 2026-10-27T17:58:31Z · **Fim:** 2026-10-28T12:40Z (aprox., depois do commit e antes de religar os conectores)
**Plano:** `docs/plano-de-execucao.md` (Fase 0 aprovada em 2026-10-27; unidade 3 trocada em 2026-10-28)

## Entregas

| Entrega | Caminho | Estado |
|---|---|---|
| Plano da Fase 0 | `docs/plano-de-execucao.md` | aprovado; atualizado com a mudança de direção |
| Pesquisa: formatos de arquivo | `docs/research/2026-10-27-uo/01-formatos-de-arquivo.md` | 59 KB, refs F1–F58 |
| Pesquisa: personagem, combate, magia | `docs/research/2026-10-27-uo/02-personagem-combate-magia.md` | 54 KB, refs M1–M75 |
| Pesquisa: mundo, NPCs, crafting, IA, loot | `docs/research/2026-10-27-uo/03-mundo-npcs-crafting-ia.md` | 63 KB, refs W1–W95 |
| Pesquisa: ecossistema, arquitetura, legal | `docs/research/2026-10-27-uo/04-ecossistema-arquitetura-protocolo.md` | 71 KB, refs E1–E100 |
| Especificação | `registros/uo-classic/especificacao.md` | 56 KB, 18 seções + Anexo A |
| Revisão do PRKing_UO (só leitura) | Anexo A da especificação | 20 achados (A1–A20), cada um com fonte |

Todas as referências têm URL e data de acesso (2026-10-27). Nenhum bloco de código nos cinco arquivos. Toda referência citada na especificação existe na tabela do arquivo de pesquisa correspondente (conferido por script).

## Decisões do responsável (Fase 0, 2026-10-27)

Era T2A; assets lidos da cópia instalada em tempo de execução; Unity 2022.3 LTS (trocado em 2026-10-28 pelo responsável por Unity 6.6, 6000.6.7f1); escopo "loop básico"; nome "Outrora". Em 2026-10-28 o projeto Unity passou para `H:\King\Clientes e Projetos\PRKing_UO`; este repositório entrega só a especificação.

## Aceite

| Critério | Resultado |
|---|---|
| Pesquisa com URL e data de acesso | ok |
| Especificação em palavras próprias, referência por afirmação, inferências marcadas | ok |
| Sem plano, roadmap nem arquitetura Unity aqui | ok (a especificação descreve comportamento; a seção 2 lista responsabilidades da simulação, sem desenho de engine) |
| Revisão do PRKing_UO com fonte por item, sem editar | ok (nenhum arquivo do PRKing_UO foi alterado) |
| Binários do cliente em `G:\` não abertos nem lidos | ok |
| Commit local só dos arquivos desta sessão; sem a seção "Delegação de busca" do CLAUDE.md; sem push | ok |

## Pendências para o responsável

1. **Decisões D1–D11** da seção 16 da especificação (ponto de referência dentro do T2A, vida máxima, curva de luz, tempos de corpos etc.).
2. **Risco legal da leitura da instalação** (seção 17): o `00-seguranca.md` aceitou o risco dos termos só para análise estática; usar os arquivos do cliente num jogo próprio amplia esse uso e pede nova avaliação.
3. **Anexo A:** o PRKing_UO diverge da Fase 0 em Unity (6.3 × 2022.3), assets, era, nome e escopo; decidir qual lado vale antes da Story 1.1. Também não é repositório git, apesar do item 8 do CLAUDE.md.
4. Licença do próprio Outrora (aberta desde a Fase 0).

## Falhas e retrabalho

- O hook `skill-budget-guard` bloqueou a skill `fase-0` (tamanho desconhecido); li o `SKILL.md` (5 KB) e segui os passos.
- O processo da sessão reiniciou com dois subagentes de pesquisa no meio (02 e 03); retomei os dois por mensagem e eles gravaram os arquivos. Custo: uma rodada extra de cada.
- A mudança de direção de 2026-10-28 cancelou a unidade "plano do projeto Unity" antes de começar; nada a desfazer.
- Fontes primárias da era inacessíveis (Stratics 403, Wayback bloqueada, wiki UO Second Age 522): os números vêm em geral do RunUO pré-AOS, marcados como emulador.
- O rename `docs/plano-de-execucao.md → docs/planos/2026-10-23-piloto-f7.md`, que estava staged por esta sessão, entrou no commit `ce21bad` da sessão do protocolo (já registrado em `b84a6c5`). Este commit traz só o novo `docs/plano-de-execucao.md`.

## Métricas (`sessao.js`, 2026-10-28T12:33Z)

| Item | Principal | Subagentes |
|---|---|---|
| Chamadas | 54 | 277 |
| Escrita de cache | 507k | 1,4M |
| Leitura de cache | 7,8M | 26,7M |
| Saída | 66k | 280k |

- Subagentes: 4 `aiox-analyst`, um por tema de pesquisa (o de mundo e NPCs usou 240k tokens).
- Contexto por requisição: inicial 97k, médio 154k, máximo 252k; 19% acima de 200k.
- **Compactações: 1.** Trocas de modelo: 0.
- Engram: 2 consultas (`vault_deep_query_tool`), ~3k no contexto. Skills: `fase-0` (lida, não invocada pelo hook).
- Conectores: os 10 do claude.ai desligados no início; religados ao fim, depois deste handoff.

## Próximo passo sugerido

O responsável decide os itens de "Pendências"; depois o PRKing_UO alinha seus documentos (ou a Fase 0 é revista) e escreve as stories a partir de `registros/uo-classic/especificacao.md`, respeitando a sala limpa. Push deste commit só pelo @devops, com autorização.
