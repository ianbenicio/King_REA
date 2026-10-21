# Puzzle do piloto

Puzzle próprio de encaixe em grade 8 × 8, usado como **produto limpo** do piloto de monetização (`docs/plano-piloto-puzzle.md`). JavaScript ESM sem dependências, headless.

- **Regras:** [`ESPECIFICACAO.md`](ESPECIFICACAO.md).
- **Monetização:** declarada em [`monetizacao.json`](monetizacao.json) e marcada no código com o ID do catálogo (`// MON-NNNN`); a checagem do projeto (`npm run check:monetizacao`, também no `pre-commit`) vale aqui. Classe C nunca entra neste projeto. Mecanismos plantados de propósito ficam em `pilotos/`, nunca aqui.

## Estrutura

```
src/nucleo/      regras, peças, gerador e dificuldade — puro, não importa nada de fora
src/simulacao/   jogador automático e simulação de partidas (usa só o núcleo)
tests/           testes (node:test), rodados pelo npm test da raiz do repositório
```

A monetização simulada (F2) entra em `src/monetizacao/` e só reage a eventos do jogo; `src/nucleo/` não pode importá-la.

## Rodar

Na raiz do repositório:

```bash
npm test
```

## Andamento

| Fase do plano | Situação |
|---|---|
| F1 — núcleo | feito: regras, peças, gerador, dificuldade por desempenho, jogador automático |
| F2 — monetização simulada | pendente |
| F3 — invariância | pendente |
| F4 — Semgrep | pendente |
