# Auditoria de segurança — Semgrep 1.180.0 (imagem Docker)

**Data:** 21/10/2026 · **Método:** verificação de origem, procedência e configuração da imagem; execução isolada · **Veredito:** uso aprovado, só pelo `scripts/semgrep/rodar.mjs` (isolamento abaixo).

Uso no projeto: regras de acoplamento do piloto (`reimplementacoes/puzzle-piloto/semgrep/`, fase F4 de `docs/plano-piloto-puzzle.md`). Decisão do responsável (F0): Docker fixado por digest, após auditoria.

## Versão

- **1.180.0** (07/10/2026), e não a mais recente (1.182.0, de 20/10): versão com duas semanas de uso, para dar tempo de a comunidade achar problema de cadeia de distribuição numa publicação nova.
- Notas da versão: Dart em GA; remoção do suporte a QL; correção de travamento quando o endpoint de telemetria não responde; atualização de `anyio` e `urllib3` por alertas de segurança.

## Origem e integridade

| Item | Resultado |
|---|---|
| Imagem | `semgrep/semgrep`, publicada pela organização Semgrep no Docker Hub (61,6 milhões de downloads) |
| Licença do CLI | LGPL-2.1 (`github.com/semgrep/semgrep`, 17 mil estrelas, ativo) |
| Digest fixado (lista de manifestos) | `sha256:529ee8a277ec8adc5b534d7c74eea0a47e9de21d62852b6ba7ac6ba9566845c3` |
| Manifesto linux/amd64 | `sha256:dffc9caeecc924370d30f9187b6edf10949600d3ef5f69ef5c359074d8fc7d2d`, 428 MB |
| Digest baixado | igual ao fixado (`docker pull` por digest) |
| Procedência (atestação BuildKit) | GitHub Actions, run `37698516662`, repositório `github.com/semgrep/semgrep-proprietary`, revisão `2d0a15ae8f0db1034c278e19390a483ca2736ed1`, `Dockerfile` |
| Rótulos | `maintainer=support@semgrep.com`, `org.opencontainers.image.source` = mesmo repositório |

**Limite:** a imagem é construída a partir de um repositório **privado** da Semgrep. Não dá para comparar o conteúdo com o código-fonte público nem reproduzir o build. Assinatura (cosign/Notary) não foi verificada. A confiança vem da origem (organização mantenedora, procedência do CI dela) e, principalmente, do isolamento na execução.

## Comportamento relevante

- **Telemetria:** o Semgrep envia métricas por padrão em alguns modos. Desligada por `--metrics=off` e `SEMGREP_SEND_METRICS=off`; além disso, o contêiner roda **sem rede**, então nada sai.
- **Usuário:** a imagem roda como `root` por padrão. Rodamos como `65534:65534` (nobody).
- **Escopo do scan:** por padrão o Semgrep só analisa arquivos rastreados pelo git. O script usa `--no-git-ignore` para não pular código novo.

## Isolamento (como o projeto roda)

`scripts/semgrep/rodar.mjs`:

```text
docker run --rm --network none --cap-drop ALL --security-opt no-new-privileges
  --user 65534:65534 --tmpfs /tmp:rw,size=512m -e HOME=/tmp -e SEMGREP_SEND_METRICS=off
  --mount type=bind,source=<repositório>,target=/src,readonly -w /src
  semgrep/semgrep@sha256:529ee8a2…845c3 semgrep …
```

Sem rede, sem capacidades, sem escalada de privilégio, usuário sem privilégios, repositório só para leitura, escrita só em `/tmp` temporário.

## Pegadinha encontrada

`metavariable-regex` compara a partir do **início** do texto (como `re.match`). `(?i)(fechar|close)` não casa `aoFechar` nem `onClose`; é preciso `(?i).*(fechar|close)`. Os testes anotados das regras pegaram isso.

## Atualizar

Decisão do responsável. Repetir esta auditoria para a versão nova (origem, digest, procedência, notas), trocar `IMAGEM` em `scripts/semgrep/rodar.mjs` e rodar `npm run semgrep:test`, `npm run semgrep` e `npm run semgrep:mutacoes`. Nunca usar tag sem digest (`semgrep/semgrep:latest`).
