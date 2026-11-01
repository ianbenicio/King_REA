---
name: protocolo-especificacao
description: Protocolo para escrever, conferir, entregar e manter a especificação de comportamento em sala limpa (registros/<slug>/especificacao.md) que orienta uma reimplementação independente de um alvo, em palavras próprias, com DEVE/PODE/FORA, referências, inferências marcadas, decisões pendentes, riscos e lacunas. Cobre a entrega para reimplementacoes/<nome>/ ou para um repositório externo aprovado (cópia presa ao hash do commit), o versionamento por adendos e o ciclo de pergunta de volta (o projeto pergunta, o REA analisa ou pesquisa, a especificação ganha adendo). Use quando o responsável pedir uma reimplementação ou uma especificação de um alvo, ou quando um projeto de reimplementação trouxer uma pergunta que a especificação não responde.
---

# Protocolo de especificação (sala limpa)

Fluxo: **portões → fontes → redação → checagem de sala limpa → entrega → manutenção**. A especificação é a única ponte entre a análise e o código novo: diz **o que** o alvo faz, em palavras próprias, e nunca **como** o código dele faz.

Casos de origem: `notepad-reimpl` (especificação a partir da análise do binário, confirmada depois por uso normal), `uo-classic` (especificação a partir de pesquisa pública, confirmada depois por análise estática da cópia instalada; projeto em repositório externo). Especificação de jogo próprio, sem alvo (como `reimplementacoes/puzzle-piloto/ESPECIFICACAO.md`), não passa por este protocolo: mora no próprio projeto.

## 0. Portões (todos obrigatórios)

1. O responsável pediu, nesta conversa, a reimplementação ou a especificação do alvo.
2. Há fonte aprovada para cada parte do documento: `registros/<slug>/00-seguranca.md` aprovado e `01-analise.md` com a evidência, ou pesquisa pública registrada em `docs/research/` com tabela de referências (URL e data de acesso), ou as duas.
3. O destino está definido: `reimplementacoes/<nome>/` neste repositório (padrão) ou um repositório externo que o item 8 do `CLAUDE.md` registre como exceção aprovada pelo responsável. Destino novo fora do repositório: perguntar antes, e registrar a exceção no item 8 só com o "sim".
4. As decisões de enquadramento (escopo da primeira versão, tecnologia, origem dos assets, nome) estão tomadas pelo responsável ou listadas como decisão pendente. Nada de decidir por ele.

Faltou algum portão: pare e diga qual.

## 1. Fontes e cabeçalho

Partir de `registros/_modelos/especificacao.md`. O cabeçalho YAML diz `alvo`, `destino`, a versão observada (ou a era de referência), as `fontes` e a `data`. Fontes aceitas:

- **evidência do REA:** IDs `ev_…` do bundle, ou o nome do decodificador e a saída em `saidas/<slug>/` (que fica fora do git);
- **pesquisa pública:** `[Xn]` apontando a tabela de referências do arquivo de pesquisa;
- **observação do responsável** com o programa em uso normal (seção 6.3);
- **inferência:** dedução sem fonte direta, sempre marcada.

## 2. Redação em palavras próprias

- Descrever comportamento observável: entradas, regras, estados, saídas, limites, erros. Fórmulas em notação própria; números em tabelas, e o documento diz que no código novo eles **DEVEM** ficar em dados, não fixos.
- Nunca entram: código ou pseudocódigo do alvo, nem paráfrase linha a linha dele; assets, ícones, sons; textos de interface além de rótulos funcionais curtos; nomes internos de símbolo; segredos ou dados pessoais (procedimento P01: só `[REDIGIDO: tipo]`).
- Rótulos do alvo servem só para identificar a regra. A especificação manda o projeto usar nomes, textos e ícones próprios e não usar marcas do dono do alvo.
- Convenções fixas: **DEVE** (a primeira versão reproduz), **PODE** (opcional ou configurável), **FORA** (fora da primeira versão). Cada item cita a fonte. **(inferência)**, **(conflito)** (fontes que discordam; a decisão vai para "Decisões pendentes") e **(a confirmar)** (lacuna que uma observação pode fechar). Quando importa, dizer a força da fonte: oficial, evidência do binário, wiki, emulador, fórum.
- Código aberto de terceiros citado como referência foi lido só para entender comportamento. A especificação registra a licença e avisa que o projeto não deve abrir esse código ao escrever o seu. Fonte que diz derivar de descompilação do alvo fica fora.

## 3. Estrutura

Na ordem do modelo:

1. Parágrafo de abertura: o que o documento descreve e o que ele não contém.
2. Regra de sala limpa do destino (o que o projeto lê e o que nunca lê).
3. Convenções.
4. Decisões de enquadramento, com data e consequência.
5. Seções por sistema ou área do alvo, cada uma com DEVE/PODE/FORA e fonte.
6. Diferenças deliberadas que o responsável já decidiu, se houver.
7. Decisões pendentes, numeradas (`D1`, `D2`…), com opções, fontes e recomendação.
8. Riscos legais e de licença, quando houver (sempre "não é parecer jurídico").
9. Lacunas, incluindo todos os "(a confirmar)".
10. Adendos (seção 6) e anexos.

## 4. Checagem de sala limpa (antes de cada entrega)

- [ ] Nenhum bloco de código do alvo; os blocos que existem são notação própria. O `pre-commit` barra blocos acima de 40 linhas, mas o limite real é zero código do alvo.
- [ ] Nenhuma instrução manda o projeto ler `alvos/`, `saidas/`, bundles, pseudocódigo, os arquivos de pesquisa como fonte de cópia ou código de terceiros.
- [ ] Todo DEVE tem fonte ou está marcado como inferência.
- [ ] Nenhum dado pessoal, segredo, hash de alvo confidencial ou endpoint privado.
- [ ] Texto do alvo só como rótulo curto. Nenhuma marca do dono no nome proposto para o produto.
- [ ] Teste de suficiência: alguém que lê só este documento consegue escrever a primeira versão? O que faltar vira lacuna ou decisão pendente, não silêncio.

Item que falhar: corrigir antes de entregar.

## 5. Entrega

- **Destino interno (`reimplementacoes/<nome>/`):** o `README.md` do projeto aponta a especificação como única fonte, aponta a análise de origem e copia as regras de sala limpa (modelo: `reimplementacoes/notepad/README.md`). As diferenças deliberadas ficam numa seção própria do README.
- **Destino externo (exceção do item 8):** o projeto guarda uma cópia em `docs/spec/especificacao.md`, com cabeçalho que diz a origem e o commit do REA (`origem: King_REA@<hash> registros/<slug>/especificacao.md`). O projeto implementa a cópia, não o arquivo vivo do REA, e nunca acessa `alvos/` nem `saidas/` deste repositório. O `.gitignore` do projeto bloqueia os formatos de dados do alvo.
- Commit local no REA: `docs: specification for <slug>`. Envio ao GitHub só pelo @devops, com autorização do responsável. No repositório externo vale a mesma regra.

## 6. Manutenção

### 6.1 Versionamento por adendo

- Seção já entregue não é reescrita em silêncio. Mudança entra como adendo no ponto afetado, com data e fonte: **"Adendo — confirmado no cliente (AAAA-MM-DD)"**, **"Adendo — corrigido (AAAA-MM-DD)"**, ou um adendo de observação no fim (modelo: §14 do `notepad-reimpl`). Onde o adendo contradiz a seção, vale o adendo, e ele diz isso.
- Decisão nova do responsável: atualizar a tabela de enquadramento, com data e o que ela substitui (modelo: a linha "Unity" do `uo-classic`).
- Lacuna fechada ou decisão tomada: marcar como resolvida no lugar, sem apagar a linha.
- Cada mudança em commit próprio. Destino externo: avisar o projeto do novo hash. O projeto atualiza a cópia e registra qual hash implementa.

### 6.2 Pergunta de volta (o projeto pergunta, o REA responde)

1. O projeto registra a pergunta do lado dele e, enquanto espera, decide por conta própria, documentando, ou deixa o ponto parado. O projeto nunca vai ao alvo nem à evidência para responder.
2. No REA, numa sessão própria do alvo: a pergunta vira item numerado no `01-analise.md` (modelo: "pergunta 4" do `uo-classic`), respondido dentro dos níveis aprovados no `00-seguranca.md`. Nível novo exige adendo ao `00-seguranca.md` aprovado pelo responsável. Se a pergunta cabe em pesquisa pública, ela vai para `docs/research/`.
3. A resposta entra na especificação como adendo (6.1), citando a fonte (`01-analise.md, pergunta N`). Nunca entram na especificação a evidência bruta nem a explicação de como o código do alvo faz.
4. O projeto lê o adendo: interno, direto; externo, pela cópia nova presa ao hash.

### 6.3 Confirmação por uso normal

Para "(a confirmar)" que o uso comum do programa responde, a análise pode escrever `registros/<slug>/roteiro-confirmacao.md` (modelo: o do `notepad-reimpl`). O roteiro é para o responsável: itens `R1`, `R2`…, com seção e pergunta. Vale só o uso normal do programa e a leitura dos arquivos que o próprio responsável salvou. Ficam de fora depurador, monitor de processo, edição de registro e ferramentas de RE. As respostas entram como adendo de observação, com versão observada e ressalvas. "Não observável" é resposta válida.

## 7. Encerramento

Resumo ao responsável em poucas linhas: destino, hash entregue, número de DEVE, decisões pendentes e lacunas abertas. Proponha salvar no Engram o que for padrão reutilizável (não o conteúdo do alvo), e só salve com aprovação.
