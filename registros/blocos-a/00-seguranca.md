---
alvo: blocos-a
status: aprovado
niveis_aprovados: [N0, N1]
classe: C1
confidencial: nao
aprovado_por: responsável, na conversa
data: 2026-10-21
---

# Protocolo de segurança — Blocos 8×8 (blocos-a)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | Build de distribuição de um puzzle de encaixe 8×8 em JavaScript (ESM, Node), com monetização simulada |
| Local | `alvos/blocos-a/app/` (fora do git) |
| Origem | Gerado por um build deste repositório (código próprio do piloto de monetização) |
| Objetivo da análise | Mapear a monetização do build com o `protocolo-monetizacao` (fase F6 do piloto), **só a partir do build**: modelo de receita, SDK, parâmetros, fluxos de anúncio e compra, padrões do catálogo e os quatro estados de cada achado |
| Autorização | Código próprio do responsável |
| Confidencial | Não |
| Regra da análise cega | A sessão de análise lê só a skill `protocolo-monetizacao`, `docs/catalogo-monetizacao.md`, `registros/_modelos/05-monetizacao.md` e `alvos/blocos-a/`. Não lê `pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano-piloto-puzzle.md`, o outro build do piloto (`alvos/blocos-b/`, `registros/blocos-b/`, `saidas/blocos-b/`) nem o histórico do git desses caminhos. Cada build é analisado numa sessão própria: comparar os dois entregaria a resposta |

## 2. Triagem passiva

| Verificação | Resultado |
|---|---|
| SHA-256 do conjunto | `c2e229fb36425a0d99401f9dc386970acd152810162955d49923266d7032ccca` (lista ordenada de `caminho:sha256`) |
| Tipo real × extensão | 16 arquivos de texto (`.mjs` e `.json`), nenhum binário |
| Tamanho e conteúdo | 31572 bytes; sem compactados |
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
| `src/monetizacao/config.mjs` | `45414c8e52cfab7f8324b081459efb54d33f37112cab3717486a38b8cddea2f4` |
| `src/monetizacao/loja.mjs` | `dbd4df2bcb202a91c8949e33e12bba7c419ea70215adbeae37be591c9528c802` |
| `src/monetizacao/recompensas.mjs` | `0efb993b80144c3a91a2afc713e5708343805dccf618cb3e1a706595ff1ec26c` |
| `src/monetizacao/sdk-simulado.mjs` | `a919f37e2a09c9bc6b4bebd9651f7c0b1f9ad059cbf5bbfb8a897bfd94b14231` |
| `src/monetizacao/sequencia.mjs` | `780a77087b3da68bab7b8ba1d48b947829103632a87467ecf11801413cea730b` |
| `src/monetizacao/vidas.mjs` | `91a9abb683792045139de4279083f730fb74b52e36b32d3815ce8fa4ffebb772` |
| `src/nucleo/dificuldade.mjs` | `ab727908594162f3b73fc6c43f22c9860ed2e4a72de681e061854bc1f6d6be00` |
| `src/nucleo/jogo.mjs` | `fc763065b451018cc159b89cebd41a45b883f92d8c824bc587e539df5b8d4119` |
| `src/nucleo/pecas.mjs` | `534e3c51411f80a58d3d29308f9d011687568ec33930c1a32c03bba89114d008` |
| `src/nucleo/prng.mjs` | `d03ae3f6244331aa7eb27e0196030aeb3f63cc92896bfd7988f209d0a12bf915` |
| `src/sessao/sessao.mjs` | `a72a73fb5e0280e5ac6d6870585b024ce0add019fdcdb7a51ec5c0057d20a758` |
| `src/simulacao/jogador.mjs` | `e496b989eece7db2100b6dec1c30eedeb8bd5177f492466075198665f031d147` |

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Sessão e bundle de evidência | servidor REA | baixo | — |
| N1 | Leitura estática do JavaScript (`analyze_javascript_application`, `recover_javascript_sources`, `trace_web_module_imports`) | workers de JavaScript do REA | baixo: lê sem executar | caminhos limitados a `alvos/blocos-a/` e `saidas/blocos-a/` pelo gate |

Execução (N3) não aprovada: os estados de execução ficam "não testado".

## 4. Isolamento

- Conectores sensíveis: não aplicável (N0/N1 em C1)
- Rede durante execução: não se aplica (sem execução)
- Ambiente: host
- Saídas em `saidas/blocos-a/` (fora do git)

## 5. Procedimentos

- Aplicados: nenhum (índice vazio)
- Criados neste protocolo: nenhum

## 6. Decisão

Aprovado com N0 e N1, pelo responsável, em 21/10/2026.

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
