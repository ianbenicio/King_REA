# PRKing Notepad — reimplementação em sala limpa

Editor de texto simples para Windows (C# + WPF), escrito do zero a partir da especificação de comportamento produzida pela análise `notepad-reimpl` deste repositório.

- **Especificação (única fonte):** [`registros/notepad-reimpl/especificacao.md`](../../registros/notepad-reimpl/especificacao.md)
- **Análise de origem:** [`registros/notepad-reimpl/01-analise.md`](../../registros/notepad-reimpl/01-analise.md) (concluída em 2026-10-20)

## Regras de sala limpa

1. A implementação lê **só** a especificação. Nunca abre `alvos/`, `saidas/`, bundles de evidência, pseudocódigo descompilado nem os recursos extraídos do programa original.
2. Nenhum código, ícone, texto ou nome de recurso da Microsoft entra aqui. Textos de interface, ícones e nomes são próprios.
3. Dúvida de comportamento que a especificação não responde: registrar como pergunta e decidir por conta própria (documentando), ou confirmar usando o Bloco de Notas normalmente. Não voltar ao binário para isso sem um adendo aprovado na análise.
4. Diferenças deliberadas em relação ao original (por exemplo, desfazer de vários níveis, gravação via arquivo temporário) ficam listadas na seção "Diferenças" abaixo.

## Estrutura (prevista)

```
reimplementacoes/notepad/
├── PRKingNotepad.sln
├── src/PRKingNotepad/         # app WPF
└── tests/PRKingNotepad.Tests/ # testes da lógica (codificação, fins de linha, arquivo)
```

## Requisitos de build

- .NET SDK 8 (LTS) para Windows.

## Diferenças em relação ao original

(preencher durante a implementação)
