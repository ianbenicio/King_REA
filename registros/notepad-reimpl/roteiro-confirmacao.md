---
alvo: notepad-reimpl
tipo: roteiro de confirmação por uso normal
origem: U1 do bloco 5 do PRKing Notepad (reimplementacoes/notepad/CONFORMIDADE.md)
data: 2026-10-21
---

# Roteiro de confirmação — Bloco de Notas do Windows em uso normal

Para o responsável. São os 7 pontos que a especificação deixou em aberto: os 6 marcados "(a confirmar)" no texto e as 2 lacunas da §13 (a das margens é o mesmo ponto do "(a confirmar)" da §9, por isso 7 e não 8).

## Regras

- Usar o **Bloco de Notas normalmente**: menus, teclado, mouse, caixas do próprio programa. Nada de depurador, monitor de processo, editor de registro ou ferramenta de engenharia reversa.
- Ler os bytes de um arquivo **que você mesmo salvou** com `Format-Hex` (PowerShell) vale: é o seu arquivo, não o programa.
- **Não mexer no registro** para "voltar ao padrão de fábrica". Se um valor já foi alterado por você no passado, anote "não observável como padrão".
- Anotar em palavras próprias: o que aconteceu, não o texto exato das mensagens da Microsoft.
- Antes de começar: anote a versão em **Ajuda > Sobre o Bloco de Notas** (a especificação foi feita sobre a 10.0.19041.4522). Versão diferente vale, mas registre.

Pasta de trabalho sugerida (fora do repositório): `%TEMP%\roteiro-notepad`. No PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:TEMP\roteiro-notepad" | Out-Null; Set-Location "$env:TEMP\roteiro-notepad"
```

---

## R1 — Ir para linha com quebra automática ligada

Spec §2: "Ir para linha: disponível também com quebra automática (a confirmar)".

1. Abra o Bloco de Notas com um documento de várias linhas (digite 5 linhas curtas).
2. **Formatar > Quebra automática de linha**: ligue.
3. Abra o menu **Editar** e veja se "Ir para…" está habilitado ou cinza.
4. Aperte **Ctrl+G**.
5. Desligue a quebra automática e repita 3 e 4.

**Anotar:** com quebra ligada, o item está habilitado? Ctrl+G abre a caixa? Se abriu, ir para a linha 3 funciona?

## R2 — Seleção vira o termo ao abrir Localizar / Substituir

Spec §4.1: "Ao abrir, a seleção atual vira o termo de busca (a confirmar)".

1. Feche qualquer caixa Localizar aberta. Digite `uma palavra aqui` e, numa segunda linha, `outra linha`.
2. Selecione só `palavra` e aperte **Ctrl+F**. Veja o campo de busca.
3. Feche a caixa. Selecione um trecho que passe de uma linha para a outra (de `aqui` até `outra`) e aperte **Ctrl+F** de novo.
4. Feche. Sem nada selecionado (só o cursor parado no meio de uma palavra), aperte **Ctrl+F**.
5. Repita o passo 2 com **Ctrl+H** (Substituir).

**Anotar:** em cada caso, o que apareceu no campo de busca (a seleção, o termo anterior, vazio, a palavra sob o cursor)? Com seleção de duas linhas, apareceu algo?

## R3 — Ctrl + roda do mouse altera o zoom

Spec §5.3: "Ctrl+roda do mouse também altera (a confirmar)".

1. Barra de status ligada (**Exibir > Barra de status**). Veja o zoom (deve estar 100 %).
2. Com o ponteiro sobre o texto, segure **Ctrl** e gire a roda **para cima** um "clique".
3. Gire **para baixo** dois cliques.
4. **Ctrl+0** para voltar.

**Anotar:** o zoom mudou? Quanto por clique (10 %? outro valor)? Para cima amplia ou reduz?

## R4 — Codificação de um documento novo

Spec §7.3: "padrão de fábrica nesta versão: UTF-8 sem BOM (a confirmar)".

1. Abra o Bloco de Notas pelo menu Iniciar (documento novo, sem arquivo). Barra de status ligada.
2. Veja o que a última parte da barra de status mostra (codificação).
3. Digite `ação` e salve como `r4.txt` na pasta de trabalho, **sem mexer** na lista de codificação da caixa Salvar como. Anote o que a lista mostrava.
4. No PowerShell: `Format-Hex .\r4.txt`

**Anotar:** codificação na barra (passo 2) e na lista da caixa (passo 3); os primeiros bytes do arquivo (começa com `EF BB BF`? o "ç" virou `C3 A7` ou `E7`?). Se você lembra de ter mudado a codificação padrão algum dia, diga.

## R5 — Colar texto com outro tipo de quebra de linha

Spec §8: "Colar texto com outro tipo de quebra: conversão para o tipo do documento (a confirmar)".

1. No PowerShell, ponha na área de transferência um texto com quebra só LF:
   ```powershell
   Set-Clipboard -Value "um`ndois`ntres"; (Get-Clipboard -Raw) -match "`r"
   ```
   Deve sair `False` (sem CR na área de transferência). Se sair `True`, anote: o teste não vale assim.
2. Bloco de Notas, documento novo (barra de status deve mostrar Windows (CRLF)). Digite `inicio`, Enter, e cole (**Ctrl+V**).
3. Veja se o texto colado aparece em três linhas e o que a barra mostra sobre a quebra de linha.
4. Salve como `r5.txt` (UTF-8) e rode `Format-Hex .\r5.txt`.

**Anotar:** depois de `um`, `dois`, os bytes são `0D 0A` (CRLF) ou só `0A` (LF)? A barra de status mudou o tipo do documento ao colar?

## R6 — Margens padrão de impressão (e cabeçalho/rodapé)

Spec §9 ("margens a confirmar") e §13 ("medidas exatas das margens padrão de impressão nesta versão").

1. **Arquivo > Configurar página…**
2. Leia as quatro margens (esquerda, direita, superior, inferior) e a unidade (mm ou polegadas).
3. Leia também o texto de Cabeçalho e Rodapé.
4. Cancele (não mude nada).

**Anotar:** os quatro valores com unidade, o cabeçalho e o rodapé. Se você já mudou margens no Bloco de Notas alguma vez, diga: aí o valor é o lembrado, não o de fábrica ("não observável como padrão").

## R7 — Arquivo com tipos de quebra de linha misturados

Spec §13: "Comportamento com fins de linha misturados no mesmo arquivo". A spec propõe: tipo do documento pelo primeiro fim de linha, demais preservados.

1. No PowerShell, crie o arquivo (linha 1 termina em CRLF, linha 2 em LF, linha 3 em CR):
   ```powershell
   [IO.File]::WriteAllText("$PWD\r7.txt", "linha1`r`nlinha2`nlinha3`rlinha4")
   ```
2. Abra `r7.txt` no Bloco de Notas. Veja se aparecem 4 linhas e o que a barra de status mostra como tipo de quebra.
3. Ponha o cursor no fim de `linha4`, aperte **Enter** e digite `linha5`.
4. **Salvar** (Ctrl+S) e rode `Format-Hex .\r7.txt`.
5. Repita 1–2 começando pelo LF (`"linha1`nlinha2`r`nlinha3"`), só para ver o tipo mostrado na barra.

**Anotar:** passo 2: quantas linhas, tipo na barra. Passo 4: depois de `linha1`, `linha2`, `linha3` e `linha4`, quais bytes ficaram (`0D 0A`, `0A`, `0D`)? As quebras originais foram preservadas ou todas convertidas? A nova quebra (antes de `linha5`) é de que tipo? Passo 5: tipo na barra.

---

## Folha de respostas

Copie, preencha e devolva na conversa da próxima sessão (U2). As respostas entram como adendo datado em `registros/notepad-reimpl/especificacao.md`.

```text
Versão do Bloco de Notas (Ajuda > Sobre):
Data da observação:

R1 quebra ligada -> Ir para habilitado? (s/n)   Ctrl+G abre? (s/n)   funcionou? (s/n)
R2 seleção de uma linha -> campo mostra:
   seleção de duas linhas -> campo mostra:
   sem seleção -> campo mostra:
   Ctrl+H com seleção -> campo mostra:
R3 Ctrl+roda muda o zoom? (s/n)   passo por clique:   para cima =
R4 barra:            lista da caixa:            bytes iniciais:          ç =
R5 bytes entre um/dois:          barra mudou o tipo? (s/n)
R6 margens esq/dir/sup/inf:                unidade:      cabeçalho:      rodapé:      já alterei antes? (s/n)
R7 linhas vistas:   barra:      bytes após linha1/2/3/4:              nova quebra:      começando por LF, barra:
Observações livres:
```
