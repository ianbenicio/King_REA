---
alvo: notepad-teste
status: aprovado
niveis_aprovados: [N0, N1]
classe: C1
confidencial: nao
aprovado_por: responsável (Ian), na conversa
data: 2026-10-14
---

# Protocolo de segurança — Bloco de Notas do Windows (alvo de treino)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | `notepad.exe` (Bloco de Notas do Windows 10) |
| Local | `alvos/notepad-teste/notepad.exe` (cópia de `C:\Windows\System32\notepad.exe`, fora do git) |
| Origem | Arquivo de sistema do Windows, Microsoft |
| Objetivo da análise | Alvo de treino: testar de ponta a ponta o GhidraMCP (info do programa, funções, descompilação, strings, referências cruzadas, renomeação no banco de análise) e o REA com o provider Ghidra |
| Autorização | Windows licenciado do responsável; análise para teste, sem redistribuição |
| Confidencial | Não |

## 2. Triagem passiva

| Verificação | Resultado |
|---|---|
| SHA-256 | `DA5807BB0997CC6B5132950EC87EDA2B33B1AC4533CF1F7A22A6F3B576ED7C5B` (cópia idêntica ao original) |
| Tipo real × extensão | PE (`MZ`/`PE`), máquina 0x8664 (x86-64), 200.704 bytes; condiz com `.exe` |
| Tamanho e conteúdo | Executável único, sem conteúdo compactado |
| Assinatura | Válida (catálogo), emissor `CN=Microsoft Windows, O=Microsoft Corporation` |
| Versão | Microsoft Corporation, "Bloco de notas", 10.0.19041.4522 |
| Antivírus local | Windows Defender: nenhuma ameaça |
| Reputação externa | Não consultada (desnecessária: arquivo de sistema assinado) |
| Sinais de alerta | Nenhum |

**Classe de confiança:** C1, porque a origem é oficial, a assinatura é válida e o scan está limpo.

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Sessão e evidência do REA | Servidor REA | Nenhum | — |
| N1 | GhidraMCP (leitura e anotação) e REA + Ghidra headless | Ghidra (JVM) da interface; Ghidra headless do REA | Baixo: lê a cópia sem executar; renomear altera só o banco de análise | Trabalho sobre cópia em `alvos/`; o executável não é executado nem alterado |

N2, N3 e N4 fora do plano: o alvo nunca é executado.

## 4. Isolamento

- Conectores sensíveis: não exigido (C1 em N1).
- Rede durante execução: não aplicável (sem execução).
- Ambiente: host.

## 5. Procedimentos

- Aplicados: nenhum (índice vazio).
- Criados neste protocolo: nenhum (triagem sem risco novo).

## 6. Decisão

Aprovado (N0 + N1), pelo responsável, em 14/10/2026.

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
