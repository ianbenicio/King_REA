---
alvo: notepad-reimpl
destino: PRKing_Notepad (C# + WPF)
versao_observada: notepad.exe 10.0.19041.4522 (x64) + notepad.exe.mui pt-BR
data: 2026-10-15
---

# Especificação de comportamento — editor de texto simples (sala limpa)

Este documento descreve **o que** o Bloco de Notas do Windows 10 faz, em palavras próprias, para orientar uma reimplementação independente. Não contém código, ícones nem textos da Microsoft além de rótulos funcionais curtos. A implementação em `PRKing_Notepad` deve usar seus próprios textos, ícones e nomes, e seguir este documento, não o binário.

Convenções: **DEVE** = comportamento observado que a reimplementação reproduz; **PODE** = opcional; **FORA** = fora do escopo da primeira versão. Cada seção cita a evidência (IDs do REA `ev_…`, ou `recursos` para o decodificador de recursos PE, saída em `saidas/notepad-reimpl/recursos.json`).

## 1. Janela

- DEVE ter uma janela principal com: barra de menus, área de edição de texto ocupando todo o espaço, e barra de status opcional na parte inferior.
- Título da janela: `[*]<nome do arquivo> - <nome do app>`. O asterisco aparece quando há alterações não salvas. Documento sem arquivo usa um nome genérico ("Sem título" no original). (`recursos`: string de formato do título)
- A posição e o tamanho da janela são lembrados entre execuções (seção 9).
- Aceita arquivos arrastados do Explorer para a janela (seção 6.6). (`ev_1b0119a0…`; `ev_6b39255b…` init)

## 2. Comandos e atalhos

Os atalhos abaixo são de teclado padrão do Windows e DEVEM ser reproduzidos. Os rótulos são sugestões próprias.

| Menu | Comando | Atalho(s) |
|---|---|---|
| Arquivo | Novo | Ctrl+N |
| | Nova janela (novo processo) | Ctrl+Shift+N |
| | Abrir… | Ctrl+O |
| | Salvar | Ctrl+S |
| | Salvar como… | Ctrl+Shift+S |
| | Configurar página… | — |
| | Imprimir… | Ctrl+P |
| | Sair | — (fechar janela) |
| Editar | Desfazer | Ctrl+Z, Alt+Backspace |
| | Recortar | Ctrl+X |
| | Copiar | Ctrl+C, Ctrl+Insert |
| | Colar | Ctrl+V |
| | Excluir | Del |
| | Pesquisar seleção na web | Ctrl+E |
| | Localizar… | Ctrl+F |
| | Localizar próxima | F3 |
| | Localizar anterior | Shift+F3 |
| | Substituir… | Ctrl+H |
| | Ir para linha… | Ctrl+G |
| | Selecionar tudo | Ctrl+A |
| | Inserir hora e data | F5 |
| Formatar | Quebra automática de linha (alterna) | — |
| | Fonte… | — |
| Exibir | Zoom: ampliar | Ctrl+=, Ctrl+(+ do teclado numérico) |
| | Zoom: reduzir | Ctrl+-, Ctrl+(- do teclado numérico) |
| | Zoom: restaurar | Ctrl+0 |
| | Barra de status (alterna) | — |
| Ajuda | Ajuda | F1 |
| | Enviar comentários | — (FORA) |
| | Sobre | — |

Evidência: `recursos` (menu 1, tabelas de atalhos MAINACC e GLOBALACC), dispatcher de comandos `ev_b872dd6b…` FUN_140008df0.

Regras de habilitação (DEVE):
- Recortar, Copiar, Excluir: só com seleção não vazia.
- Desfazer: só quando há o que desfazer.
- Colar: só quando a área de transferência tem texto.
- Localizar próxima/anterior: se ainda não houver termo de busca, abre a caixa Localizar.
- Ir para linha: disponível também com quebra automática (a confirmar).

## 3. Edição

- Texto puro, uma fonte para o documento todo (sem formatação por trecho).
- Desfazer: o controle de edição padrão do Windows tem **um nível** (desfazer de novo refaz). A reimplementação PODE oferecer vários níveis; documentar a diferença.
- Caracteres NUL do arquivo carregado viram espaço. (`ev_70133329…` carregador)
- Inserir hora e data (F5): insere no cursor a hora curta (sem segundos), um espaço e a data curta, no formato regional do usuário. É uma edição comum, desfazível. (`ev_f75edfe2…` FUN_14000e238)
- Pesquisar na web: abre o navegador padrão com a seleção como termo de pesquisa. PODE ser FORA na primeira versão.

## 4. Localizar, substituir e ir para

### 4.1 Localizar e substituir

- Janelas **não modais** (o usuário continua editando com elas abertas). Só uma de cada vez.
- Opções: diferenciar maiúsculas/minúsculas; direção (para cima / para baixo); "dar a volta" (continuar do início ao chegar ao fim, e vice-versa).
- O termo pesquisado e o de substituição, as opções e a direção são lembrados entre execuções (seção 9).
- Ao abrir, a seleção atual vira o termo de busca (a confirmar).
- Não encontrado: mensagem informando que o texto não foi encontrado.
- Ao dar a volta, a barra de status/mensagem indica que a busca recomeçou do outro extremo ("encontrado perto do fim/início" no original).
- Substituir tudo: uma única operação desfazível.

Evidência: imports de diálogo comum de localizar/substituir; prefs `fMatchCase`, `fWrapAround`, `fReverse`, `searchString`, `replaceString`; strings de "não encontrado" e "perto do início/fim" (`recursos`).

### 4.2 Ir para linha

- Caixa modal com um campo numérico (número da linha) e botões confirmar/cancelar. (`recursos` diálogo 14)
- Valor inicial: linha atual.
- Linha maior que o total: mensagem dizendo que o número ultrapassa a quantidade de linhas; a caixa continua aberta.
- Ao confirmar: cursor no início da linha pedida.

## 5. Formatação e exibição

### 5.1 Quebra automática

- Alterna entre linhas quebradas na largura da janela (sem barra de rolagem horizontal) e linhas longas com rolagem horizontal. (`ev_6b39255b…` init: estilo da área de edição)
- A preferência é lembrada. Se o documento for grande demais para a troca, o original mostra erro; a reimplementação PODE simplesmente não ter esse limite.
- Com quebra ligada, Ln/Col na barra de status referem-se a linhas **do arquivo** (lógicas), não às visuais.

### 5.2 Fonte

- Caixa de seleção de fonte (nome, estilo, tamanho). Aplica ao documento inteiro.
- Padrão: fonte monoespaçada de sistema (Consolas 11 pt no original). Lembrada entre execuções (nome, tamanho, peso, itálico, conjunto de caracteres).

### 5.3 Zoom

- Faixa de 10 % a 500 %, passos de 10 %, padrão 100 %. (`FUN_140008df0`) Ctrl+roda do mouse também altera (a confirmar).
- Não aparece entre as preferências gravadas: volta a 100 % a cada execução.
- Exibido na barra de status.

### 5.4 Barra de status

Partes, da esquerda para a direita (`ev_12f4d9f7…` FUN_14000b200):

1. (vazia / mensagens)
2. Posição: `Ln <linha>, Col <coluna>` (1-based).
3. Zoom: `<n>%`.
4. Quebra de linha do documento: Windows (CRLF), Unix (LF) ou Macintosh (CR).
5. Codificação: ANSI, UTF-16 LE, UTF-16 BE, UTF-8, UTF-8 com BOM (e GB18030 se forçada).

Visibilidade lembrada entre execuções.

## 6. Ciclo de vida do arquivo

### 6.1 Novo

- Se houver alterações, pergunta se quer salvar (Salvar / Não salvar / Cancelar). Cancelar aborta.
- Esvazia o editor, sem arquivo associado, codificação padrão (seção 7.3), quebra de linha CRLF.

### 6.2 Abrir

- Pergunta sobre alterações não salvas antes (como 6.1).
- Caixa de abrir com filtros "Documentos de texto (*.txt)" e "Todos os arquivos (*.*)", e uma lista extra de **codificação** (Detecção automática, ANSI, UTF-16 LE, UTF-16 BE, UTF-8, UTF-8 com BOM). (`recursos` diálogo 15)
- Erros: arquivo inexistente, acesso negado, nome inválido → mensagem com o nome do arquivo.
- Arquivo de 1 GiB ou mais: recusa com mensagem "arquivo grande demais". (`ev_70133329…`)
- Após abrir: registra nos documentos recentes do sistema; cursor no início (exceto recurso .LOG, 6.5).

### 6.3 Salvar

- Sem arquivo associado: vira "Salvar como".
- Grava no **mesmo arquivo**, abrindo-o (cria se não existir), escrevendo o conteúdo e truncando o resto. Não usa arquivo temporário. Se o arquivo não existia e a gravação falha/cancela, ele é apagado. (`ev_5e920d35…` FUN_14000e5c8)
- A reimplementação PODE (recomendado) gravar em arquivo temporário e substituir, mais seguro contra queda de energia. Diferença aceitável.
- Codificação de gravação = a do documento (seção 7.2). BOM conforme a tabela da seção 7.
- **Perda em ANSI:** se o texto tem caracteres que não existem na página de código ANSI, avisa que esses caracteres serão perdidos, com OK/Cancelar. Cancelar aborta (nada gravado). OK grava com substituição e **recarrega o arquivo do disco**, para o usuário ver o que de fato foi salvo. (`ev_5e920d35…`)
- Ao salvar: limpa o indicador de alterado; atualiza título e barra de status.
- Preserva a criptografia EFS do arquivo original no "Salvar como" (FORA).

### 6.4 Salvar como

- Caixa de salvar com nome sugerido (`*.txt` se sem título), filtros como em 6.2 e lista de codificação (sem "Detecção automática"). Padrão = codificação atual do documento.
- Se o nome não tem extensão e o filtro é "*.txt", acrescenta `.txt` (comportamento da caixa padrão do Windows).
- Pede confirmação para sobrescrever arquivo existente (idem).

### 6.5 Recurso ".LOG"

- Se o arquivo carregado começa exatamente com `.LOG` (maiúsculas, no início do texto), ao abrir: cursor vai para o fim e insere quebra de linha + hora/data + quebra de linha. O documento fica alterado. (`ev_70133329…`, `FUN_14000e238`)

### 6.6 Arrastar e soltar

- Soltar um arquivo na janela = Abrir esse arquivo (com a pergunta de salvar alterações). Vários arquivos: só o primeiro.

### 6.7 Linha de comando

`app [opções] [arquivo]` (`ev_e743c1e4…` wWinMain; `ev_6b39255b…` init; `ev_35ebb69f…` opções `/A` e `/W`):

- O caminho pode vir entre aspas (duplas ou simples); sem aspas, o resto da linha é o caminho (aceita espaços).
- Caminho relativo é resolvido contra a pasta atual.
- Se o arquivo não existe e não tem extensão, tenta o mesmo nome com `.txt`. (`ev_4b052a80…` FUN_140010e80)
- Arquivo inexistente: pergunta se quer criá-lo (Sim / Não / Cancelar). Sim = cria vazio e abre; Não = abre documento novo vazio; Cancelar = encerra o programa.
- `/A <arquivo>`: abre forçando ANSI. `/W <arquivo>`: abre forçando UTF-16 LE.
- `/P <arquivo>`: imprime na impressora padrão e encerra. `/PT <arquivo> "<impressora>"`: imprime na impressora indicada e encerra. (`ev_4839fed4…` FUN_140011520; ordem dos argumentos de `/PT` inferida) — PODE ser FORA na primeira versão.

### 6.8 Fechar

- Com alterações: pergunta Salvar / Não salvar / Cancelar, citando o nome do arquivo.
- Salva preferências (seção 9) ao fechar.

## 7. Codificação

### 7.1 Detecção ao abrir (modo automático)

Ordem (`ev_70133329…`, FUN_14000ef78):

1. Arquivo vazio: documento vazio, codificação padrão.
2. Começa com `EF BB BF` → UTF-8 com BOM (pula os 3 bytes).
3. Começa com `FF FE` → UTF-16 LE; com `FE FF` → UTF-16 BE.
4. Sem BOM: teste estatístico de "parece UTF-16"; se a única indicação for estatística e o arquivo tiver menos de 100 bytes, o teste é ignorado. Se parecer UTF-16 → UTF-16 LE.
5. Senão, tenta decodificar como UTF-8 **estrito** (qualquer sequência inválida falha). Válido → UTF-8 (sem BOM). Inválido → ANSI (página de código do sistema).

Na reimplementação, o passo 4 PODE ser substituído por uma heurística própria (ex.: proporção de bytes zero em posições pares/ímpares), documentada.

### 7.2 Codificação forçada

Escolhida na caixa Abrir ou por `/A`/`/W`: ANSI, UTF-16 LE, UTF-16 BE, UTF-8, UTF-8 com BOM, e GB18030 (página 54936, só por caminho interno; PODE ser FORA).

### 7.3 Gravação

| Codificação | BOM gravado | Observação |
|---|---|---|
| ANSI | não | página de código do sistema; aviso de perda (6.3) |
| UTF-16 LE | `FF FE` | |
| UTF-16 BE | `FE FF` | |
| UTF-8 | não | padrão para documento novo nesta versão |
| UTF-8 com BOM | `EF BB BF` | |

A codificação padrão de documento novo é preferência (`iDefaultEncoding`, seção 9); padrão de fábrica nesta versão: UTF-8 sem BOM (a confirmar).

## 8. Quebras de linha

- Detectadas **do conteúdo** ao abrir: CRLF, LF ou CR. A barra de status mostra o tipo detectado. (`ev_12f4d9f7…` FUN_14000b200: consulta o tipo de fim de linha do controle de edição)
- Enter insere o tipo detectado do documento (CRLF em documento novo).
- Salvar preserva as quebras como estão no texto (não converte).
- Colar texto com outro tipo de quebra: conversão para o tipo do documento (a confirmar).
- Arquivo com tipos misturados: comportamento não confirmado (lacuna registrada). Proposta: detectar pelo primeiro fim de linha e preservar os demais como estão.

## 9. Preferências persistentes

O original guarda no registro do usuário; a reimplementação DEVE guardar em arquivo próprio (ex.: `%APPDATA%\PRKing_Notepad\config.json`), nunca no registro do original.

| Preferência | Padrão sugerido |
|---|---|
| Fonte: nome, tamanho, peso, itálico, conjunto | Consolas, 11 pt, normal |
| Quebra automática | desligada |
| Barra de status visível | ligada |
| Janela: posição e tamanho | centro, tamanho padrão do sistema |
| Busca: termo, substituição, maiúsc./minúsc., direção, dar a volta | vazio, não, baixo, não |
| Página: cabeçalho, rodapé, margens (sup., inf., esq., dir.) | cabeçalho `&f`, rodapé `Página &p`, margens a confirmar |
| Codificação padrão de documento novo | UTF-8 |

Evidência: nomes dos valores lidos e gravados (`lfFaceName`, `iPointSize`, `fWrap`, `StatusBar`, `iWindowPos*`, `szHeader`, `szTrailer`, `iMargin*`, `iDefaultEncoding`, …) em `ev_dd69680a…` (strings do binário). O original também tem "restaurar após reinício do Windows" (salvamento automático temporário) — FORA.

## 10. Impressão

- Configurar página: tamanho e origem do papel, orientação (retrato/paisagem), margens, texto de cabeçalho e rodapé, botão para escolher impressora. (`recursos` diálogo 12)
- Códigos no cabeçalho/rodapé (maiúsculas ou minúsculas): `&f` nome do arquivo, `&p` número da página, `&t` hora, `&d` data, `&l` / `&c` / `&r` alinham o trecho seguinte à esquerda/centro/direita, `&&` um "&" literal.
- Imprimir: caixa de impressão padrão; janela de progresso com Cancelar durante a impressão. (`recursos` diálogo 11)
- Impressão usa a fonte do documento e respeita as quebras automáticas pela largura da página.

## 11. Mensagens ao usuário (texto próprio, situação observada)

| Situação | Tipo |
|---|---|
| Arquivo não encontrado (abrir pela linha de comando): criar? | Sim / Não / Cancelar |
| Salvar alterações em `<arquivo>`? | Salvar / Não salvar / Cancelar |
| Arquivo grande demais para abrir | Aviso |
| Nome de arquivo inválido / não foi possível criar / acesso negado | Erro, com o nome |
| Caracteres serão perdidos ao salvar em ANSI | OK / Cancelar |
| Texto não encontrado | Informação |
| Número de linha além do total | Aviso, caixa continua aberta |
| Memória insuficiente para abrir | Erro |

Evidência: tabela de strings (`recursos`, 66 entradas) e uso nos fluxos `FUN_14000e5c8`, `FUN_14000ef78`, `FUN_140011edc`.

## 12. Fora do escopo da primeira versão

Telemetria; enviar comentários; proteção de dados corporativos na colagem; restauração após reinício do Windows; GB18030; modo `/.SETUP`; impressão pela linha de comando (opcional); integração com IME japonês específica.

## 13. Lacunas (a confirmar observando o programa em uso, sem ferramentas de RE)

Itens marcados "(a confirmar)" acima, e:

- Comportamento com fins de linha misturados no mesmo arquivo.
- Medidas exatas das margens padrão de impressão nesta versão.
