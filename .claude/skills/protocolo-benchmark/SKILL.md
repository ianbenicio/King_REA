---
name: protocolo-benchmark
description: Protocolo de registro e benchmark de um alvo de engenharia reversa. Identifica os sistemas e mecanismos principais, descreve o funcionamento, levanta aspectos positivos e negativos, propõe melhorias e compara com projetos similares, com referências. Só executar depois que a análise do alvo estiver concluída (registros/<slug>/01-analise.md com status concluida) e o responsável aprovar explicitamente na conversa. Nunca iniciar por conta própria.
---

# Protocolo de registro e benchmark

## 0. Portões (todos obrigatórios)

1. `registros/<slug>/01-analise.md` com `status: concluida` e todos os critérios de conclusão marcados.
2. Pergunta feita e "sim" recebido **nesta conversa**, com `AskUserQuestion`:
   "A análise de <alvo> está concluída. Posso executar o protocolo de registro e benchmark?"
   Opções: executar agora; executar sem pesquisa externa (só evidência do REA); não executar.
3. Se o alvo foi marcado como confidencial no `00-seguranca.md`, a pesquisa externa precisa de aprovação própria, e só com termos genéricos.

Faltou algum portão: pare e diga qual.

## 1. Inventário de evidência

- Leia `00-seguranca.md` e `01-analise.md`.
- Carregue a evidência: `get_evidence_bundle` (N0) ou o bundle exportado em `saidas/<slug>/`. Liste as lacunas com `list_unknowns`.
- Não rode tools N1+ nesta etapa. Se faltar evidência essencial, pare e proponha reabrir a análise.

## 2. Sistemas e mecanismos

Identifique os sistemas principais (subsistemas, módulos, camadas) e os mecanismos de cada um (algoritmos, protocolos, formatos, fluxos de dados, proteções). Para cada um: nome, responsabilidade, IDs de evidência e confiança (`confirmado` por evidência direta, `inferido` por evidência indireta, `hipótese`).

## 3. Descrição de funcionamento

Para cada sistema: entradas, processamento, saídas, dependências internas e externas, estado persistido e pontos de comunicação de rede. Use diagrama Mermaid quando o fluxo tiver mais de três passos.

## 4. Aspectos positivos e negativos

Avalie cada sistema nos critérios que se aplicam: arquitetura, segurança, privacidade, desempenho, robustez, manutenibilidade, experiência de uso. Todo ponto aponta a evidência que o sustenta.

## 5. Projetos similares e referências

Regra de sigilo: buscas usam termos genéricos do domínio. Nunca mandar para fora strings proprietárias, nomes internos, chaves, endpoints privados ou hashes de alvo confidencial.

- Selecione de 3 a 5 projetos similares (abertos ou comerciais) e justifique cada escolha.
- Monte a tabela de benchmark: critérios × alvo × similares.
- Referências com título, URL e data de acesso, marcando primária (documentação oficial, especificação, artigo, código-fonte) ou secundária (blog, fórum).

## 6. Melhorias

Para cada aspecto negativo relevante, proponha uma melhoria com impacto (alto, médio, baixo), esforço estimado e a referência ou o similar que a inspira. Ordene por impacto ÷ esforço.

## 7. Registro

1. Escreva `registros/<slug>/02-benchmark.md` a partir de `registros/_modelos/02-benchmark.md`.
2. Revisão antes de salvar:
   - Toda afirmação tem evidência do REA ou referência `[Rn]`. Inferência está marcada como tal.
   - Segredos, credenciais e dados pessoais encontrados no alvo aparecem só como `[REDIGIDO: tipo]`.
   - Lacunas do passo 1 aparecem na seção de lacunas.
3. Commit local: `docs: benchmark for <slug>`.
4. Resumo ao responsável, em poucas linhas. Proponha salvar no Engram os padrões reutilizáveis (não o conteúdo do alvo) e só salve se ele aprovar.
