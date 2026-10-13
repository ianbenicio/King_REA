---
alvo: <slug>
status: pendente
niveis_aprovados: [N0]
classe: <C1|C2|C3>
confidencial: <sim|nao>
aprovado_por: <responsável>
data: <AAAA-MM-DD>
---

# Protocolo de segurança — <nome do alvo>

<!-- status: pendente | aprovado | reprovado. O hook lê status e niveis_aprovados. Só alterar com aprovação explícita do responsável. -->

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | |
| Local | `alvos/<slug>/...` |
| Origem | |
| Objetivo da análise | |
| Autorização | |
| Confidencial | |

## 2. Triagem passiva

| Verificação | Resultado |
|---|---|
| SHA-256 | |
| Tipo real × extensão | |
| Tamanho e conteúdo | |
| Assinatura | |
| Antivírus local | |
| Reputação externa | não consultada / resultado |
| Sinais de alerta | |

**Classe de confiança:** <C1|C2|C3>, porque <motivo>.

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | | | | |

## 4. Isolamento

- Conectores sensíveis: <desligados | não aplicável a N0/N1 em C1>
- Rede durante execução: <n/a | sem rede | controlada>
- Ambiente: <host | VM | Windows Sandbox>

## 5. Procedimentos

- Aplicados: <IDs ou nenhum>
- Criados neste protocolo: <IDs ou nenhum>

## 6. Decisão

<aprovado | aprovado com restrições | reprovado>, por <responsável>, em <data>. <observações>

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
