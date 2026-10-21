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

## Andamento

| Fase do plano | Situação |
|---|---|
| F1 — núcleo | feito: regras, peças, gerador, dificuldade por desempenho, jogador automático |
| F2 — monetização simulada | feito: SDK simulado, intersticial, rewarded (trocar, continuar, vida), remover anúncios, configuração remota conferida, vidas (MON-0011 aprovado) |
| F3 — invariância | feito: 19 perfis (anúncios, falhas, compra, configuração remota, relógio) × 20 sementes no `npm test`; 7 mutações de acoplamento, todas detectadas; achou e corrigiu bug de vidas com relógio voltando |
| F4 — Semgrep | pendente |
