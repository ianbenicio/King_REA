---
alvo: <slug>
jogo: <nome>
versao_jogo: <build>
sha256_alvo: <hash do arquivo principal em alvos/<slug>/>
plataforma: <android | ios | windows | web>
data: <AAAA-MM-DD>
catalogo_versao: <versão de docs/catalogo-monetizacao.md usada>
publico_provavel: <adulto | geral | infantojuvenil>
children_likely: <true | false | unknown>
verificacao_execucao: <nenhuma | observacao | instrumentacao | captura-rede>
---

# Monetização e padrões — <jogo>

<!-- Repositório público: só achados resumidos, parâmetros e trechos curtos. Capturas de tela, criativos de anúncio, respostas de rede e listas brutas ficam em saidas/<slug>/monetizacao/ (fora do git). -->

## Resumo

<5 linhas: modelo de receita (anúncio, compra, híbrido), SDKs principais, padrões encontrados por classe, achados que mais pesam e o estado de cada um (observado no código, reproduzido, causalidade).>

## 1. Modelo de receita

| Fonte | Presente | Evidência | Observação |
|---|---|---|---|
| Intersticial | | | |
| Rewarded | | | |
| Banner | | | |
| Compras (consumíveis) | | | |
| Compras (remover anúncios, passe, assinatura, desbloqueio, expansões) | | | |
| Caixas pagas / gacha | | | |

## 2. SDKs de anúncio, mediação, analytics e configuração remota

<!-- Presença de SDK é indício técnico, não prova de execução nem de coleta. -->

| SDK | Função | Versão | Como detectado | Evidência |
|---|---|---|---|---|

## 3. Parâmetros de monetização

<!-- Uma chave como ad_cooldown prova que o parâmetro existe, não o valor aplicado. -->

| Parâmetro | Valor local (padrão) | Valor efetivo observado | Estado da configuração | Onde | Evidência |
|---|---|---|---|---|---|
| | | | padrão local / valor efetivo observado / remoto desconhecido | | |

## 4. Achados

### Estados de um achado

Cada achado tem quatro estados independentes. Nenhum implica o outro.

| Estado | Valores | O que prova |
|---|---|---|
| **Código** | observada · não observada · inconclusiva | O mecanismo existe no binário ou nos dados |
| **Execução** | reproduzido · não reproduzido · não testado | O comportamento aparece com o jogo rodando, nas condições registradas |
| **Causalidade** (sobre anúncio ou compra) | demonstrada no teste descrito · associação observada · hipótese | O mecanismo **causa** o efeito; só "demonstrada" com intervenção controlada sobre a variável |
| **Configuração** | padrão local · valor efetivo observado · remoto desconhecido | De onde vem o valor que vale |

Não observar não prova ausência. Correlação entre derrota e anúncio é "associação observada", não "demonstrada".

### Tabela

| Achado | ID do catálogo | Variante | Código | Execução | Causalidade | Configuração |
|---|---|---|---|---|---|---|
| A-01 | MON-NNNN | | | | | |

### A-01 — <MON-NNNN> <nome do padrão>

- **Pergunta:** <a pergunta restrita que este achado responde>
- **Variante:** <como o mecanismo aparece neste jogo>
- **Alvo:** <versão e sha256 do arquivo analisado>
- **Ambiente:** <dispositivo ou VM, região, conectividade, progresso, conta>
- **Data e método de coleta:** <estático (tool e nível) / observação / instrumentação / captura de rede>
- **Evidência:** <IDs REA, função ou endereço, arquivo de dados>
- **Estados:** código <…> · execução <…> · causalidade <…> · configuração <…>
- **Ligação com mecânicas:** <IDs M-/D- do 03-mecanicas.md, se houver>
- **Limitações:** <o que este método não vê>
- **Próximos testes:** <o que mudaria um estado, e com qual nível de aprovação>

## 5. Padrões fora do catálogo

<!-- Proposta de entrada nova: nome, descrição, sinais, classe sugerida. Só entra no catálogo com aprovação do responsável. -->

| Proposta | Descrição | Classe sugerida | Evidência |
|---|---|---|---|

## 6. Conformidade

<!-- Separar as três fontes: um padrão pode ser C pela política interna sem ser ilegal, e o inverso. Registrar jurisdição e a versão/data da regra consultada. -->

| Fonte | Referência e data consultada | Jurisdição | Situação | Achados |
|---|---|---|---|---|
| Política interna | docs/catalogo-monetizacao.md v<N> | — | | |
| Lei | ECA Digital (Lei 15.211/2025, art. 20), CDC, LGPD | Brasil | | |
| Lei / orientação | Princípios CPC sobre moedas virtuais | UE | | |
| Loja e rede de anúncios | Google Play, App Store, AdMob | — | | |

## 7. Aproveitamento em projeto nosso

<!-- Só classes A e B. Classe C nunca. Cada item vira entrada no reimplementacoes/<nome>/monetizacao.json; B exige aprovação do perfil presa ao hash. -->

| ID | Parâmetros sugeridos (com unidade) | Para B: justificativa e limites | Restrição de público |
|---|---|---|---|

## 8. Lacunas

| Lacuna | Motivo | Como fechar |
|---|---|---|

## Referências

| ID | Fonte |
|---|---|
