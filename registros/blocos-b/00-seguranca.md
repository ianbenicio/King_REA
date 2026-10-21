---
alvo: blocos-b
status: aprovado
niveis_aprovados: [N0, N1]
classe: C1
confidencial: nao
aprovado_por: responsável, na conversa
data: 2026-10-21
---

# Protocolo de segurança — Blocos 8×8 (blocos-b)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | Build de distribuição de um puzzle de encaixe 8×8 em JavaScript (ESM, Node), com monetização simulada |
| Local | `alvos/blocos-b/app/` (fora do git) |
| Origem | Gerado por um build deste repositório (código próprio do piloto de monetização) |
| Objetivo da análise | Mapear a monetização do build com o `protocolo-monetizacao` (fase F6 do piloto), **só a partir do build**: modelo de receita, SDK, parâmetros, fluxos de anúncio e compra, padrões do catálogo e os quatro estados de cada achado |
| Autorização | Código próprio do responsável |
| Confidencial | Não |
| Regra da análise cega | A sessão de análise lê só a skill `protocolo-monetizacao`, `docs/catalogo-monetizacao.md`, `registros/_modelos/05-monetizacao.md` e `alvos/blocos-b/`. Não lê `pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano-piloto-puzzle.md`, o outro build do piloto (`alvos/blocos-a/`, `registros/blocos-a/`, `saidas/blocos-a/`) nem o histórico do git desses caminhos. Cada build é analisado numa sessão própria: comparar os dois entregaria a resposta |

## 2. Triagem passiva

| Verificação | Resultado |
|---|---|
| SHA-256 do conjunto | `8fd7f57baf81371c769b8735f8594d5db9b1f51a5734de1de237a9f1245c0aa8` (lista ordenada de `caminho:sha256`) |
| Tipo real × extensão | 15 arquivos de texto (`.mjs` e `.json`), nenhum binário |
| Tamanho e conteúdo | 29746 bytes; sem compactados |
| Assinatura | não se aplica (scripts de código próprio, sem assinatura) |
| Antivírus local | Microsoft Defender (`MpCmdRun -ScanType 3`), 21/10/2026: nenhuma ameaça |
| Reputação externa | não consultada (código próprio) |
| Sinais de alerta | nenhum |

**Classe de confiança:** C1, porque é código próprio gerado neste repositório, com triagem limpa.

### Arquivos

| Arquivo | SHA-256 |
|---|---|
| `config.json` | `f8203142a86e7b60f044acefb3222382460ac1c8dc43a48b1e2dc114b1c2f3c3` |
| `main.mjs` | `9ea48130368c378f973ff6ecca238972df2641f12b714611f057ba5ae389df47` |
| `package.json` | `74d9fbfc87e963d73f7779abed411bda35b815de048c1e33a66571358c7c8c67` |
| `src/monetizacao/agendador.mjs` | `7125b30d095fc6b1f9973c417ab47335e97d332f7a9c4f210d5fb9459c503986` |
| `src/monetizacao/config.mjs` | `a537f1e7732ff99c49e546cf3f2e8d9b5978a8e81a7634f60aff854cdfc13142` |
| `src/monetizacao/loja.mjs` | `a27925d3646c67579241f202cfb026772fea7f2ed6c54e6533cd99273d6d9da5` |
| `src/monetizacao/recompensas.mjs` | `e66eb8fc14a878bb8a7d28c29eaf169b5a11be94b3dad65588b53e9eba36cfe9` |
| `src/monetizacao/sdk-simulado.mjs` | `a919f37e2a09c9bc6b4bebd9651f7c0b1f9ad059cbf5bbfb8a897bfd94b14231` |
| `src/monetizacao/vidas.mjs` | `91a9abb683792045139de4279083f730fb74b52e36b32d3815ce8fa4ffebb772` |
| `src/nucleo/dificuldade.mjs` | `fc6f369ff573f7a27ad17941494612110f9cce961a1609563af4f7485b1f12e4` |
| `src/nucleo/jogo.mjs` | `73dd77108ba13e6cbc9bac3bfde74fe86e0e43e7865a2dd506348f63a9f2852e` |
| `src/nucleo/pecas.mjs` | `534e3c51411f80a58d3d29308f9d011687568ec33930c1a32c03bba89114d008` |
| `src/nucleo/prng.mjs` | `d03ae3f6244331aa7eb27e0196030aeb3f63cc92896bfd7988f209d0a12bf915` |
| `src/sessao/sessao.mjs` | `06fb9e8ddeabc2fcfe87838cba5bd3b4ff5412b899bd7ac28834183535c37cc0` |
| `src/simulacao/jogador.mjs` | `e496b989eece7db2100b6dec1c30eedeb8bd5177f492466075198665f031d147` |

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Sessão e bundle de evidência | servidor REA | baixo | — |
| N1 | Leitura estática do JavaScript (`analyze_javascript_application`, `recover_javascript_sources`, `trace_web_module_imports`) | workers de JavaScript do REA | baixo: lê sem executar | caminhos limitados a `alvos/blocos-b/` e `saidas/blocos-b/` pelo gate |

Execução (N3) não aprovada: os estados de execução ficam "não testado".

## 4. Isolamento

- Conectores sensíveis: não aplicável (N0/N1 em C1)
- Rede durante execução: não se aplica (sem execução)
- Ambiente: host
- Saídas em `saidas/blocos-b/` (fora do git)

## 5. Procedimentos

- Aplicados: nenhum (índice vazio)
- Criados neste protocolo: nenhum

## 6. Decisão

Aprovado com N0 e N1, pelo responsável, em 21/10/2026.

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
