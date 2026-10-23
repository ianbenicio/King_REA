---
alvo: encaixe-1
status: aprovado
niveis_aprovados: [N0, N1, N2, N3]
classe: C1
confidencial: nao
aprovado_por: responsável, na conversa
data: 2026-10-23
---

# Protocolo de segurança — Encaixe 8×8 (encaixe-1)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | Build de distribuição de um puzzle de encaixe 8×8 em JavaScript (ESM), com interface no navegador (HTML, CSS, canvas) e monetização simulada |
| Local | `alvos/encaixe-1/app/` (fora do git) |
| Origem | Gerado por um build deste repositório (código próprio do piloto de monetização) |
| Objetivo da análise | Mapear a monetização do build com o `protocolo-monetizacao`, **só a partir do build**: modelo de receita, SDK, parâmetros, fluxos de anúncio e compra, o que aparece na tela, padrões do catálogo e os quatro estados de cada achado, com o estado de execução preenchido pela execução no navegador |
| Autorização | Código próprio do responsável |
| Confidencial | Não |
| Regra da análise cega | A sessão de análise lê só a skill `protocolo-monetizacao`, `docs/catalogo-monetizacao.md`, `registros/_modelos/`, este registro e `alvos/encaixe-1/`. A lista completa do que não pode ler está no handoff da U3 (`pilotos/`, `reimplementacoes/puzzle-piloto/`, `docs/plano*`, `docs/stories/`, `docs/handoffs/`, `registros/blocos-*`, o outro build `alvos/encaixe-2/` com `registros/encaixe-2/` e `saidas/encaixe-2/`, e o histórico do git desses caminhos). Cada build é analisado numa sessão própria |

## 2. Triagem passiva

| Verificação | Resultado |
|---|---|
| SHA-256 do conjunto | `b3af6d82432b797664a924d57ff98754c2f8a96a9fa54ddfa1ee0f297d3cff5d` (lista ordenada de `caminho:sha256`) |
| Tipo real × extensão | 24 arquivos de texto (20 `.mjs`, 2 `.json`, 1 `.css`, 1 `.html`), nenhum binário (nenhum byte nulo) |
| Tamanho e conteúdo | 57225 bytes; sem compactados |
| Assinatura | não se aplica (scripts de código próprio, sem assinatura) |
| Antivírus local | Microsoft Defender (`MpCmdRun -ScanType 3`), 2026-10-23T21:07Z: nenhuma ameaça |
| Reputação externa | não consultada (código próprio) |
| Sinais de alerta | nenhum. A página só carrega servida por HTTP (módulos ES não carregam por `file://`); o build traz um servidor estático próprio que escuta só em 127.0.0.1 |

**Classe de confiança:** C1, porque é código próprio gerado neste repositório, com triagem limpa.

### Arquivos

| Arquivo | SHA-256 |
|---|---|
| `config.json` | `f81d2eb541a2a8ce1751daf839fa683db7397478c5e48c01fa6310f4271a1a35` |
| `interface/controle.mjs` | `cc4cd76668f58c75c8b360192302dba2e9892488b9d5df1ac0de19800924f935` |
| `interface/desenho.mjs` | `df82e5b56c4d8c3c6594ab2c3ecad4284b9ab465431480b6b4223d7996f8bf4e` |
| `interface/estilo.css` | `be8edac0a5bbff60397c003b6abc66eb03d087679a3aa9710f7b7ba2b846c4bc` |
| `interface/index.html` | `23b0c453ea02a1263a7ebe1fe8a3f665a0486cef559b382ae6f2a0f6b48ec034` |
| `interface/servidor.mjs` | `a1d4b724d57c72f8af3c6ac81114e8dda1def15ad96969616339f8a4189b4faf` |
| `main.mjs` | `9ea48130368c378f973ff6ecca238972df2641f12b714611f057ba5ae389df47` |
| `package.json` | `181362e80af02eea1fe17ca38e667e29609c37de66860598ead4789b74181275` |
| `src/interface/cenas.mjs` | `c5b72c9ee2b60256fa49f4a6a38810e5fa6f5039eb66bacfca3c600dff81dd78` |
| `src/interface/cores.mjs` | `76d0afcdf3b25950883270888eb45cd1b445e63582b2844a90d4e85c7e10cae1` |
| `src/interface/tela.mjs` | `28dd2b97100b2203839f4ed4360e5a923fc91fb537e51886cd734b3941653d4b` |
| `src/monetizacao/agendador.mjs` | `979b4354921621ce928d1990f3f816bf21eacce50029e7de1b15d0bb761a6f8d` |
| `src/monetizacao/config.mjs` | `715059ecd9f4e2cebefec00b1580dd51f0d9196cfc0b5bd2f7d723124d3fff79` |
| `src/monetizacao/loja.mjs` | `dbd4df2bcb202a91c8949e33e12bba7c419ea70215adbeae37be591c9528c802` |
| `src/monetizacao/recompensas.mjs` | `2f2c6edd77114383dc9b68bc3502d2158a79e1993da8a45d3dc83772d9b22404` |
| `src/monetizacao/sdk-simulado.mjs` | `a919f37e2a09c9bc6b4bebd9651f7c0b1f9ad059cbf5bbfb8a897bfd94b14231` |
| `src/monetizacao/sequencia.mjs` | `780a77087b3da68bab7b8ba1d48b947829103632a87467ecf11801413cea730b` |
| `src/monetizacao/vidas.mjs` | `91a9abb683792045139de4279083f730fb74b52e36b32d3815ce8fa4ffebb772` |
| `src/nucleo/dificuldade.mjs` | `ab727908594162f3b73fc6c43f22c9860ed2e4a72de681e061854bc1f6d6be00` |
| `src/nucleo/jogo.mjs` | `fc763065b451018cc159b89cebd41a45b883f92d8c824bc587e539df5b8d4119` |
| `src/nucleo/pecas.mjs` | `534e3c51411f80a58d3d29308f9d011687568ec33930c1a32c03bba89114d008` |
| `src/nucleo/prng.mjs` | `d03ae3f6244331aa7eb27e0196030aeb3f63cc92896bfd7988f209d0a12bf915` |
| `src/sessao/sessao.mjs` | `55732f047c15e021370cae2e7397103e918fbf8e96f823c179614e6ac089a92c` |
| `src/simulacao/jogador.mjs` | `e496b989eece7db2100b6dec1c30eedeb8bd5177f492466075198665f031d147` |

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Sessão e bundle de evidência | servidor REA | baixo | — |
| N1 | Leitura estática do JavaScript, HTML e CSS (`analyze_javascript_application`, `recover_javascript_sources`, `trace_web_module_imports`) | workers de JavaScript do REA | baixo: lê sem executar | caminhos limitados a `alvos/encaixe-1/` e `saidas/encaixe-1/` pelo gate |
| N2 | Tools de página sobre a aba que a captura abriu (`inspect_web_page`, `capture_web_screenshot`, `inspect_web_event_listeners`, `observe_web_session`) | conexão CDP em loopback | baixo: observa o que já está rodando | só a página do build em 127.0.0.1 |
| N3 | Execução no navegador (`capture_browser_scenario`): telas, toques e tempos dos fluxos de anúncio, oferta e compra | Chromium do Playwright (`chromium-1208`, já instalado) lançado pelo REA; servidor estático do próprio build (`node interface/servidor.mjs`, porta escolhida pela sessão) | médio: código do alvo roda no navegador e o servidor do alvo roda em Node no host; o que o build faz na tela é justamente o que a análise procura | o gate pede confirmação a cada chamada N3; o servidor escuta só em 127.0.0.1, só GET/HEAD, só arquivos do build, e é iniciado só durante a captura e encerrado ao fim; sem rede externa (SDK simulado, nenhum endereço externo no build); sem administrador; build executado só a partir de `alvos/encaixe-1/` |

## 4. Isolamento

- Sessão dedicada a este alvo; conectores sensíveis (Gmail, Drive, Supabase, Notion, Calendar) desligados antes de N1+
- Rede durante execução: só loopback (127.0.0.1); nenhuma requisição externa esperada; requisição externa na captura é sinal de alerta e para a execução
- Ambiente: host, usuário sem privilégios de administrador, sem exclusão no antivírus
- Saídas e capturas em `saidas/encaixe-1/` (fora do git)
- Leitura dos caminhos proibidos também bloqueada por regra `deny` temporária (ver "Adendos")

## 5. Procedimentos

- Aplicados: nenhum (índice vazio)
- Criados neste protocolo: nenhum

## 6. Decisão

Aprovado com N0, N1, N2 e N3, pelo responsável, em 2026-10-23. Palavras do responsável: "Aprovar N0–N3 (Recommended)" (opção escolhida para este alvo, com o plano acima).

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
| 2026-10-23 | — (regra `deny` de leitura) | — | Regras `deny` de Read, Grep e Glob para os caminhos proibidos da análise cega, em `.claude/settings.local.json` (fora do git), aplicadas na U3 e removidas no início da U5 | responsável, na conversa: "Deny temporário (Recommended)" |
