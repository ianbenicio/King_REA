---
alvo: <slug>
destino: <reimplementacoes/<nome>/ | repositório externo (exceção do item 8 do CLAUDE.md)>
versao_observada: <versão do alvo, ou era de referência>
fontes: <evidência do REA (01-analise.md) | pesquisa pública (docs/research/...) | observação do responsável>
data: <AAAA-MM-DD>
---

# Especificação de comportamento — <descrição genérica do alvo> (sala limpa)

Este documento descreve **o que** <alvo> faz, em palavras próprias, para orientar uma reimplementação independente. Não contém código, ícones, sons nem textos de <dono do alvo> além de rótulos funcionais curtos. A reimplementação **DEVE** usar nomes, textos e ícones próprios e seguir este documento, não o alvo.

**Sala limpa.** O projeto em `<destino>` lê só este documento. Não lê `alvos/`, `saidas/`, bundles de evidência, pseudocódigo nem os arquivos de pesquisa como fonte de cópia. Código aberto citado nas referências foi lido só para entender comportamento; o projeto não abre esse código ao escrever o seu.

## Convenções

- **DEVE** = a primeira versão reproduz. **PODE** = opcional ou configurável. **FORA** = fora da primeira versão.
- **Fontes:** `ev_…` (evidência do REA); `[Xn]` → `<arquivo de pesquisa>`; "observação" (seção de adendos).
- **(inferência)** marca dedução sem fonte direta. **(conflito)** marca fontes que discordam; a decisão fica em "Decisões pendentes". **(a confirmar)** marca o que uma observação pode fechar.
- Números ficam em tabelas de dados no código novo, nunca fixos.
- Notação: <a que o documento usar>.

## 1. Decisões de enquadramento (<data>)

| Tema | Decisão do responsável | Consequência |
|---|---|---|
| Escopo da primeira versão | | |
| Tecnologia | | |
| Origem dos assets | | |
| Nome | | Nunca marca do dono do alvo |

## 2. <Sistema ou área>

- DEVE <comportamento>. (<fonte>)
- PODE <comportamento>. (<fonte>)
- FORA: <comportamento>.

## <N>. Diferenças deliberadas

<Só as que o responsável já decidiu.>

## <N+1>. Decisões pendentes (para o responsável)

| # | Decisão | Opções e fontes | Recomendação |
|---|---|---|---|
| D1 | | | |

## <N+2>. Riscos legais e de licença (não é parecer jurídico)

<Se houver: termos do alvo, marcas, licenças do código de referência.>

## <N+3>. Lacunas

<Todos os "(a confirmar)" e o que nenhuma fonte cobriu.>

## <N+4>. Adendos

<Adendos de observação. Adendos pontuais ficam no ponto afetado: "Adendo — confirmado no cliente (AAAA-MM-DD)" ou "Adendo — corrigido (AAAA-MM-DD)", com a fonte (`01-analise.md, pergunta N`). Onde o adendo contradiz a seção, vale o adendo.>
