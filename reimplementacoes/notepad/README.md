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
| 2 | Localizar e substituir (janelas não modais, F3 / Shift+F3, dar a volta com aviso na barra de status, substituir tudo numa só edição desfazível); ir para linha (com aviso de linha inexistente); lista de codificação nas caixas Abrir/Salvar do Windows | Feito |
| 3 | Fonte (caixa nativa do Windows), quebra automática, zoom 10–500 % (Ctrl+= / Ctrl+- / Ctrl+0 e Ctrl+roda do mouse), preferências persistentes (fonte, quebra, barra de status, busca, codificação padrão), posição e tamanho da janela | Feito |
| 4 | Configurar página (papel, origem, orientação, margens, cabeçalho e rodapé, escolha da impressora); impressão com códigos `&f` `&p` `&d` `&t` `&l` `&c` `&r` `&&`, quebra das linhas longas, intervalo de páginas e janela de progresso com Cancelar; ajuda local (F1) e Sobre; registro nos documentos recentes do Windows | Feito |
| 5 | Conformidade com a especificação item a item ([`CONFORMIDADE.md`](CONFORMIDADE.md)); pergunta de salvar em janela própria (Salvar / Não salvar / Cancelar); arquivo grande demais como aviso; pontos de troca para os testes de interface | Em andamento |

Fora desta versão (a especificação permite): impressão pela linha de comando (`/P`, `/PT`), pesquisar a seleção na web (Ctrl+E), enviar comentários, restauração após reinício do Windows, GB18030.

## Requisitos de build

- .NET SDK 10 (LTS, suporte até 11/2028), versão fixada 10.0.401, em `C:\tools\dotnet`. Instalação sem administrador, com hash conferido: `powershell -ExecutionPolicy Bypass -File scripts\instalar-dotnet.ps1`.

## Preferências

Ficam em `%APPDATA%\PRKing_Notepad\config.json` (JSON, gravado ao fechar a janela; nunca no registro do Windows). Arquivo ausente, corrompido ou com valores fora do intervalo volta ao padrão sem erro. A codificação de documento novo (`DefaultEncoding`) só se muda editando esse arquivo, como no original. O zoom não é gravado.

## Diferenças em relação ao original

Decisões deliberadas, permitidas pela especificação ou tomadas onde ela deixa lacuna:

1. **Desfazer de vários níveis** (o controle de texto do WPF), em vez de um nível só.
2. **Gravação segura:** grava num arquivo temporário na mesma pasta e só então substitui o destino; o original grava direto no arquivo.
3. **Quebras de linha mistas:** o tipo do documento é o da primeira quebra, e ao salvar todas as quebras passam para esse tipo. Arquivos com um só tipo de quebra voltam idênticos.
4. **UTF-16 sem BOM:** heurística própria (bytes zero em posições ímpares), só para texto de alfabeto latino e a partir de 100 bytes.
5. **Linha de comando:** nome sem extensão que não existe passa a ser `nome.txt`.
6. **Busca:** comparação ordinal (com ou sem diferenciar maiúsculas), sem regras de idioma; a seleção de uma linha vira o termo ao abrir Localizar ou Substituir; Substituir sempre anda para baixo.
7. **Zoom:** aplicado como escala do tamanho da fonte; Ctrl+roda do mouse também altera (no original, a confirmar).
8. **Posição da janela:** só é restaurada se a barra de título cair numa área visível da tela (monitor desconectado não "perde" a janela).
9. **Impressão:** cabeçalho na primeira linha da área útil e rodapé na última, cada um separado do texto por uma linha em branco; sem código de alinhamento, o texto fica centralizado. Margens padrão próprias (20 mm laterais, 25 mm em cima e embaixo), porque as do original ficaram "a confirmar". Papel, origem e orientação valem só para a sessão; margens, cabeçalho e rodapé são lembrados.
10. **Ajuda:** janela local com o resumo e os atalhos, em vez de uma página na internet.
11. **Documentos recentes:** como no Windows em geral, arquivos dentro da pasta temporária não entram na lista.
12. **Fonte e janela:** a fonte grava nome, tamanho, negrito e itálico. O conjunto de caracteres não é gravado, porque o WPF desenha em Unicode e ele não muda nada na tela; pesos intermediários (por exemplo, "Segoe UI Light") ficam no nome da família, como a caixa de fonte do Windows os mostra. O tamanho inicial da janela é 900 × 600, centralizada na tela.
