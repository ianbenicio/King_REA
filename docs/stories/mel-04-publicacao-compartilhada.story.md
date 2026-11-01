# Story MEL-04 — transformar a política de publicação em verificação compartilhada

**Status:** Draft (aguarda validação @po)
**Workflow:** SDC, ciclo completo (entrega M: @sm → @po → @dev → @qa; integração @devops) · **Origem:** A06 do [parecer de 01/11/2026](../analises/2026-11-01-arquitetura-cto-comparativo.md) · **Pacote:** MEL-04 do [plano de evolução](../planos/2026-11-01-evolucao-arquitetura-qualidade.md) §5
**Complexidade:** STANDARD · estimativa M · **Dependências:** contrato de verificação da MEL-03 (fatia 1 entregue: [`docs/contrato-ambiente.md`](../contrato-ambiente.md)); é pré-requisito do job `publicacao` da [CI MEL-08](../planos/2026-11-01-desenho-ci-mel08.md)

## Story

**Como** responsável por um repositório público,
**quero** que a mesma regra de publicação rode no `pre-commit` e na CI, olhando o conteúdo que entra no commit,
**para** que um clone sem o hook, um envio pela interface do GitHub ou um `--no-verify` não publiquem dado bruto, segredo ou código extenso do alvo sem que alguém veja.

## Contexto

Hoje a política está dentro de `.githooks/pre-commit.mjs`: em `registros/` (fora `_modelos/`), bloqueia binário, extensão fora de `md|py|js|mjs|ts|mmd|svg|txt`, arquivo acima de 300 KB e bloco de código Markdown com mais de 40 linhas (mermaid de fora); e roda a checagem de monetização quando o commit mexe em `reimplementacoes/` ou no catálogo. Ela só vale no clone que rodou `git config core.hooksPath .githooks`. Não há detecção de segredo, e `alvos/`/`saidas/` só estão protegidos pelo `.gitignore` (um `git add -f` passa).

## Escopo

**Dentro:**
- Módulo `scripts/publicacao/` com a decisão pura (entrada: lista de mudanças com estado A/C/M/R/D, caminho antigo e novo, tamanho, binário, conteúdo; saída: problemas com caminho e tipo de ocorrência). O `pre-commit` passa a chamá-lo; a CI chama o mesmo módulo sobre o diff do PR.
- Caminhos proibidos em qualquer lugar: `alvos/`, `saidas/`, `.rea/`, `ferramentas/` clonadas, mesmo com `git add -f`.
- Renomes (`R`) avaliados pelo caminho novo e pelo antigo; remoções (`D`) nunca bloqueiam.
- Detecção de segredos: primeiro regras próprias para os formatos realmente usados no projeto e nos conectores (chaves de API, tokens de GitHub, JWT, chaves privadas PEM), com fixtures sintéticas; detector externo só se passar por auditoria no método de `docs/seguranca/auditoria-semgrep-1.180.0.md` (versão fixada, sem rede, sem telemetria).
- Relatório só com caminho, linha e tipo; nunca o valor detectado.
- Exceções justificadas em arquivo versionado, cada uma com motivo e teste.
- Componente `publicacao` no verificador da MEL-03.

**Fora:** varredura do histórico do git; revisão humana de origem (a checagem não a dispensa); prevenção antes do envio fora do clone local (a CI só detecta o que já chegou ao remoto); ativação da CI (MEL-08).

## Critérios de aceitação

- [ ] **AC1** — Dado o mesmo conjunto de fixtures, quando ele passa pelo `pre-commit` e pela entrada da CI, então as duas decisões são idênticas (teste que compara as duas entradas).
- [ ] **AC2** — Dado um arquivo em `alvos/` ou `saidas/` adicionado com `git add -f`, um segredo sintético e um bloco de código de 41 linhas em `registros/`, quando a checagem roda, então os três são recusados.
- [ ] **AC3** — Dados casos permitidos (modelo em `registros/_modelos/`, mermaid longo, renome dentro de `registros/` com extensão permitida, remoção de arquivo proibido), quando a checagem roda, então nada é bloqueado.
- [ ] **AC4** — Dado um segredo detectado, quando o relatório é impresso, então ele não contém o valor e diz que a revisão humana de origem continua necessária.
- [ ] **AC5** — Regressões do `pre-commit` atual continuam valendo; `npm test` verde; `npm run verificar` mostra o componente `publicacao`.

## Riscos

- Falso positivo bloqueando registro legítimo — exceções versionadas com motivo e teste.
- Regex de segredo fraca dar sensação de proteção — o relatório e a documentação dizem o que é coberto; formatos não cobertos ficam listados.
- Divergência entre o hook e a CI se cada um montar a entrada de um jeito — a montagem também fica no módulo (a partir de `git diff --cached` e de `git diff base...head`), com teste.

## Definition of Done

AC1–AC5 marcados com evidência; auditoria registrada se houver ferramenta externa; QA @qa com gate registrado; `pre-commit` sem `--no-verify` no próprio commit.

## Tasks

- [ ] Validação @po (10 pontos).
- [ ] Extrair a política atual para o módulo, sem mudar comportamento (regressões antes e depois).
- [ ] Caminhos proibidos, renomes e remoções.
- [ ] Regras de segredo próprias e fixtures; decisão sobre detector externo.
- [ ] Componente `publicacao` no verificador.

## File List

- `docs/stories/mel-04-publicacao-compartilhada.story.md` — esta story.

## Change Log

| Data | Mudança | Autor |
|---|---|---|
| 2026-11-01 | Story criada (Draft) a partir da MEL-04, na preparação da etapa 2 | sessão `b0f09ab6` (@sm) |
