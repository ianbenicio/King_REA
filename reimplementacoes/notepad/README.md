# PRKing Notepad — reimplementação em sala limpa

Editor de texto simples para Windows (C# + WPF), escrito do zero a partir da especificação de comportamento produzida pela análise `notepad-reimpl` deste repositório.

- **Especificação (única fonte):** [`registros/notepad-reimpl/especificacao.md`](../../registros/notepad-reimpl/especificacao.md)
- **Análise de origem:** [`registros/notepad-reimpl/01-analise.md`](../../registros/notepad-reimpl/01-analise.md) (concluída em 2026-10-20)

## Regras de sala limpa

1. A implementação lê **só** a especificação. Nunca abre `alvos/`, `saidas/`, bundles de evidência, pseudocódigo descompilado nem os recursos extraídos do programa original.
2. Nenhum código, ícone, texto ou nome de recurso da Microsoft entra aqui. Textos de interface, ícones e nomes são próprios.
3. Dúvida de comportamento que a especificação não responde: registrar como pergunta e decidir por conta própria (documentando), ou confirmar usando o Bloco de Notas normalmente. Não voltar ao binário para isso sem um adendo aprovado na análise.
4. Diferenças deliberadas em relação ao original (por exemplo, desfazer de vários níveis, gravação via arquivo temporário) ficam listadas na seção "Diferenças" abaixo.

## Estrutura

```
reimplementacoes/notepad/
├── PRKingNotepad.slnx
├── Directory.Build.props          # avisos viram erro; dependências travadas (packages.lock.json)
├── src/PRKingNotepad.Core/        # lógica sem interface: codificação, quebras de linha, arquivo, linha de comando
├── src/PRKingNotepad/             # app WPF
└── tests/PRKingNotepad.Core.Tests/
```

## Compilar, testar e rodar

```
dotnet build PRKingNotepad.slnx
dotnet test PRKingNotepad.slnx
src\PRKingNotepad\bin\Debug\net10.0-windows\PRKingNotepad.exe [/A | /W] [arquivo]
```

## Andamento

| Bloco | Conteúdo | Situação |
|---|---|---|
| 1 | Leitura e gravação (detecção de codificação, BOM, perda em ANSI com recarga, quebras de linha, ".LOG", limite de 1 GiB, gravação segura); janela com menus Arquivo/Editar/Exibir, barra de status, título com asterisco, pergunta ao descartar, arrastar e soltar, linha de comando `/A` `/W` | Feito |
| 2 | Localizar, substituir, ir para linha; lista de codificação nas caixas Abrir/Salvar | A fazer |
| 3 | Fonte, quebra automática, zoom, preferências persistentes, posição da janela | A fazer |
| 4 | Configurar página e impressão; ajuda e sobre; documentos recentes | A fazer |

## Requisitos de build

- .NET SDK 10 (LTS, suporte até 11/2028), versão fixada 10.0.401, em `C:\tools\dotnet`. Instalação sem administrador, com hash conferido: `powershell -ExecutionPolicy Bypass -File scripts\instalar-dotnet.ps1`.

## Diferenças em relação ao original

Decisões deliberadas, permitidas pela especificação ou tomadas onde ela deixa lacuna:

1. **Desfazer de vários níveis** (o controle de texto do WPF), em vez de um nível só.
2. **Gravação segura:** grava num arquivo temporário na mesma pasta e só então substitui o destino; o original grava direto no arquivo.
3. **Quebras de linha mistas:** o tipo do documento é o da primeira quebra, e ao salvar todas as quebras passam para esse tipo. Arquivos com um só tipo de quebra voltam idênticos.
4. **UTF-16 sem BOM:** heurística própria (bytes zero em posições ímpares), só para texto de alfabeto latino e a partir de 100 bytes.
5. **Escolha de codificação (provisório até o bloco 2):** em Arquivo > Codificação ao salvar. Abrir forçando uma codificação, por enquanto, só pela linha de comando (`/A`, `/W`).
6. **Linha de comando:** nome sem extensão que não existe passa a ser `nome.txt`.
