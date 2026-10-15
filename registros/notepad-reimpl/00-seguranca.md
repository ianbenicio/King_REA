---
alvo: notepad-reimpl
status: aprovado
niveis_aprovados: [N0, N1]
classe: C1
confidencial: nao
aprovado_por: responsável (Ian), na conversa
data: 2026-10-15
---

# Protocolo de segurança — Bloco de Notas (especificação para reimplementação)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | `notepad.exe` + `notepad.exe.mui` (recursos de idioma pt-BR) do Windows 10 |
| Local | `alvos/notepad-reimpl/` (cópias de `C:\Windows\System32\notepad.exe` e `C:\Windows\System32\pt-BR\notepad.exe.mui`; fora do git) |
| Origem | Arquivos de sistema do Windows, Microsoft |
| Objetivo da análise | Levantar o **comportamento** do Bloco de Notas e escrever uma **especificação em palavras próprias** para uma reimplementação em sala limpa (projeto separado `PRKing_Notepad`, C# + WPF). Nenhum código, ícone ou texto da Microsoft passa para a implementação |
| Autorização | Windows licenciado do responsável; análise para interoperabilidade e aprendizado; a especificação descreve comportamento, sem copiar expressão protegida |
| Confidencial | Não |
| Relação | Mesmo binário do alvo de treino `notepad-teste` (concluído); protocolo novo porque o objetivo mudou |

## 2. Triagem passiva

| Verificação | `notepad.exe` | `notepad.exe.mui` |
|---|---|---|
| SHA-256 | `DA5807BB…76ED7C5B` (igual ao de `notepad-teste`) | `ABEF65DC…13A83855` |
| Tipo real | PE x86-64 (0x8664), 200.704 bytes | PE só de recursos (0x014C), 13.312 bytes |
| Versão | 10.0.19041.4522 | 10.0.19041.1 |
| Assinatura | Válida (catálogo), Microsoft Windows | Válida (catálogo), Microsoft Windows |
| Antivírus local | Defender: nenhuma ameaça (pasta inteira) | idem |
| Sinais de alerta | Nenhum | Nenhum |

**Classe de confiança:** C1.

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Sessão e evidência do REA | Servidor REA | Nenhum | — |
| N1 | Leitura de recursos (menus, diálogos, strings, atalhos), análise de código (REA + Ghidra headless; GhidraMCP no Ghidra do responsável) | JVM do Ghidra; parser local de recursos PE | Baixo: lê cópias sem executar | Cópias em `alvos/`; nada é executado nem alterado |

N2, N3 e N4 fora do plano. Observar o Bloco de Notas em uso normal (o responsável abrindo o programa como usuário) não é análise dinâmica e não usa ferramentas de RE.

## 4. Isolamento

- Conectores sensíveis: não exigido (C1 em N1).
- Ambiente: host.
- Regra de sala limpa: o que vai para a especificação são comportamentos e regras em palavras próprias; trechos curtos de pseudocódigo só para fundamentar achados, nunca para a implementação.

## 5. Procedimentos

- Aplicados: nenhum (índice vazio).
- Criados neste protocolo: nenhum.

## 6. Decisão

Aprovado (N0 + N1), pelo responsável, em 15/10/2026.

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
