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
| SHA-256 | Tabela da seção 8 |
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
- Navegador (só com N3 de página): <n/a | cópia do navegador em `saidas/<slug>/navegador/`, com SHA-256 igual ao da origem>. O gate só libera caminhos de `alvos/<slug>/` e `saidas/<slug>/`, então o navegador instalado fora deles é recusado. Prever a cópia aqui evita improvisar durante a análise.
- Servidor local do alvo (se houver): <n/a | `127.0.0.1:<porta>`, ligado só durante as capturas>

## 5. Procedimentos

- Aplicados: <IDs ou nenhum>
- Criados neste protocolo: <IDs ou nenhum>

## 6. Decisão

<aprovado | aprovado com restrições | reprovado>, por <responsável>, em <data>. <observações>

## 7. Perfil do alvo e recursos

<!-- Piloto: o pacote só orienta. Não muda status, niveis_aprovados, a classe nem o gate. Eixos preenchidos no fim da triagem (seção 2); pacote composto depois da decisão, com os níveis aprovados. Catálogo: docs/catalogo-perfis-alvo.md. -->

| Campo | Valor |
|---|---|
| Catálogo | `docs/catalogo-perfis-alvo.md` v<versão> |
| Tipo(s) | <id do catálogo §2.1> — marcador que casou: <...> |
| Atributo `jogo` | <não \| sim, engine <...>> |
| Objetivo(s) | <ids do catálogo §3.1; `analise` sempre> |
| Complexidade (triagem) | <baixa \| média \| alta> — K1 <n executáveis>, K2 <n módulos de script>, K3 <tamanho>, K4 <formatos próprios: não \| sim>, K5 <ofuscação: não \| sim> |
| Profundidade | <igual à complexidade \| um nível acima, por `especificacao`> |
| Desvios (C4 a C6) | <nenhum \| recurso → estado, regra> |
| Recalculado em | <— \| datas dos adendos que mudaram tipo, objetivo ou escopo (C9)> |

**Pacote sugerido** (união da base comum com os pacotes do tipo, dos objetivos e da profundidade; ativo vence sob demanda, que vence não carregar):

- **Ativo:** <...>
- **Sob demanda:** <...; "por adendo" quando o nível não está aprovado>
- **Não carregar:** <...>

Recurso de análise usado fora do pacote: usar e registrar no diário do `01-analise.md` ("fora do pacote: <recurso>, motivo"). Recurso que nenhum pacote cita conta como fora do pacote. Ficam fora do perfil os recursos operacionais (commit e push pelo @devops, configuração do Claude Code, revisão de código, QA de reimplementação) e os testes de controle (chamada feita para conferir que o gate recusa), que vão ao diário como "teste de controle".

## 8. Identidade dos arquivos

<!-- O gate (MEL-06a) confere o SHA-256 de cada arquivo admitido de alvos/<slug>/ contra esta tabela: arquivo fora dela, hash divergente, hash incompleto, caminho repetido com outro hash, seção ausente ou repetida bloqueiam. Uma linha por arquivo copiado para alvos/<slug>/, caminho relativo a essa pasta (com "/"), hash completo (64 hex) medido na triagem. Uma tool que recebe um diretório confere cada arquivo dele. Arquivo novo só entra por adendo aprovado. Saídas em saidas/<slug>/ não entram aqui. -->

| Arquivo | SHA-256 |
|---|---|

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
