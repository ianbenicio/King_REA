# Puzzle do piloto

Puzzle próprio de encaixe em grade 8 × 8, usado como **produto limpo** do piloto de monetização (`docs/plano-piloto-puzzle.md`). JavaScript ESM sem dependências, headless.

- **Regras:** [`ESPECIFICACAO.md`](ESPECIFICACAO.md).
- **Monetização:** declarada em [`monetizacao.json`](monetizacao.json) e marcada no código com o ID do catálogo (`// MON-NNNN`); a checagem do projeto (`npm run check:monetizacao`, também no `pre-commit`) vale aqui. Classe C nunca entra neste projeto. Mecanismos plantados de propósito ficam em `pilotos/`, nunca aqui.

## Estrutura

```
src/nucleo/      regras, peças, gerador e dificuldade — puro, não importa nada de fora
src/monetizacao/ SDK simulado, configuração local/remota, agendador, recompensas, loja, vidas
src/sessao/      liga núcleo e monetização; a monetização só reage a eventos do jogo
src/simulacao/   jogador automático e simulação de partidas (usa só o núcleo)
tests/           testes (node:test), rodados pelo npm test da raiz do repositório
```

`src/nucleo/` não pode importar `src/monetizacao/` nem `src/sessao/`.

O perfil inclui MON-0011 (classe B), aprovado pelo responsável em 2026-10-21 com o hash desta revisão. Mudar qualquer parâmetro do perfil invalida a aprovação: recalcule com `node scripts/monetizacao/verificar-perfis.mjs --hash reimplementacoes/puzzle-piloto/monetizacao.json` e peça aprovação de novo.

## Rodar

Na raiz do repositório:

```bash
npm test
```

## Teste de invariância

`tests/invariancia.test.mjs` garante que as peças dependem só do núcleo e das decisões do jogador, nunca da monetização:

- **Sessões inteiras iguais** em 14 perfis em que o jogador não usa recompensa: com ou sem consentimento, anúncios espaçados, teto zero, configuração remota inválida, agressiva, trocada no meio, SDK sem anúncio, intersticial fechado, compra antes e no meio, pausas longas, relógio voltando. Nos 5 perfis com recompensa (concluída, callback duplicado, interrompida, indisponível, alternada), iguais até a primeira recompensa entregue.
- **Sorteio como função do estado:** em todas as sessões, a mesma entrada do núcleo precisa produzir o mesmo sorteio.
- **Limites:** teto de intersticiais, intersticial só no fim de partida, no máximo 1 troca e 1 continuação por partida, recompensa entregue se e só se o anúncio foi concluído.
- **Teste do teste:** 7 mutações plantam acoplamento em memória (o gerador lê contador, pendência ou hora de anúncio, compra, vidas, origem da configuração; a dificuldade recebe anúncios como derrotas). Todas fazem o teste falhar.

Mais sementes: `INVARIANCIA_SEMENTES=500 node --test reimplementacoes/puzzle-piloto/tests/invariancia.test.mjs`.

**Limite:** o teste só percebe acoplamento com o que **varia entre os perfis**. Uma variável de monetização que nenhum perfil faz variar passa despercebida. Por isso há perfis para cada estado de monetização e a regra de dependência entre pastas (F4) como segunda barreira.

## Regras Semgrep

Em `semgrep/`, cada regra com seu arquivo de casos anotados (`// ruleid:` e `// ok:`):

| Regra | Pega |
|---|---|
| R1 `r1-nucleo-importa-de-fora` | `src/nucleo/` importando qualquer coisa que não seja `./arquivo` do próprio núcleo, inclusive `import()` e `require` calculados |
| R2 `r2-nucleo-le-monetizacao` | código do núcleo usando nomes de anúncio, oferta, compra, vidas, configuração remota (comentários e textos não contam) |
| R3 `r3-recusar-abre-anuncio-ou-loja` | função de fechar, recusar ou pular que exibe anúncio, abre loja ou compra |
| R4 `r4-intersticial-durante-jogada` | intersticial exibido dentro de handler de jogada |
| R5 `r5-recompensa-condicional` (aviso) | condição dentro de callback de recompensa, exceto a trava de entrega única |

Com o Docker ligado, na raiz do repositório:

```bash
npm run semgrep:test
```

```bash
npm run semgrep
```

```bash
npm run semgrep:mutacoes
```

`semgrep:mutacoes` copia `src/` para uma pasta temporária, planta um problema por regra e confere que a regra certa dispara. Fica fora do `npm test` porque precisa do Docker. Auditoria e isolamento: `docs/seguranca/auditoria-semgrep-1.180.0.md`.

**Limite:** as regras olham sintaxe e nomes; renomear variáveis escapa da R2 e chamadas indiretas escapam da R3 e da R4. A garantia de comportamento é o teste de invariância; o Semgrep é a primeira barreira.

## Andamento

| Fase do plano | Situação |
|---|---|
| F1 — núcleo | feito: regras, peças, gerador, dificuldade por desempenho, jogador automático |
| F2 — monetização simulada | feito: SDK simulado, intersticial, rewarded (trocar, continuar, vida), remover anúncios, configuração remota conferida, vidas (MON-0011 aprovado) |
| F3 — invariância | feito: 19 perfis (anúncios, falhas, compra, configuração remota, relógio) × 20 sementes no `npm test`; 7 mutações de acoplamento, todas detectadas; achou e corrigiu bug de vidas com relógio voltando |
| F4 — Semgrep | feito: Semgrep 1.180.0 auditado e fixado por digest; R1–R5 com testes anotados; zero achados no produto; 5 mutações no código real, todas detectadas |
| F5 — variante plantada | feito: plantio e gabarito em `pilotos/puzzle-plantado/`, dois builds de distribuição em `alvos/` com nomes neutros, protocolo de segurança aprovado (N0, N1) |
