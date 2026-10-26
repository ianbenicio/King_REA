# Handoff — protocolo de segurança do Ultima Online Classic (uo-classic)

## Identificação

- Sessão Claude Code: `70fe6080-27b7-4d82-a555-39f17b264ea8`. Sessão do app: `local_9ee60847-28bd-4216-9aba-43cf214fe100`, filha de `local_e6556b0c-a0f5-4201-9b0b-baa6782b2ca3`. O id `local_…` foi deduzido do id do servidor do navegador embutido.
- Subagentes: nenhum.
- Início: 2026-10-26T17:56:29Z. Fim: 2026-10-26T18:03:30Z (antes do commit e do religamento dos conectores).
- HEAD no início: `d28326d20bfc37aafddf989e932960fd7e8fa667`. Commit desta unidade: `docs: security protocol for uo-classic` (local, sem push). O `d28326d` também continua sem push.

## Contrato da unidade

- **Tarefa:** protocolo de segurança do novo alvo Ultima Online Classic, antes de qualquer tool do REA. Inclui triagem passiva, cópia para `alvos/`, plano de níveis com avaliação dos termos, registro, ativação após o "sim", pilha de ferramentas, handoff e conectores.
- **Critérios de pronto:**
  - `00-seguranca.md` aprovado ou com a decisão do responsável registrada;
  - cópia em `alvos/` com hashes;
  - plano de níveis e pilha escritos;
  - handoff feito.

## Entregue

- `registros/uo-classic/00-seguranca.md`: status `aprovado`, `niveis_aprovados: [N0, N1]`, classe C1. Contém triagem, hashes, engine, dados pessoais, plano por nível, pilha, termos de uso e decisão.
- `registros/uo-classic/01-analise.md`: 3 perguntas, só sobre o patcher.
- `registros/ALVO_ATIVO`: `encaixe-2` → `uo-classic`.
- Cópia `alvos/uo-classic/instalacao/`, fora do git: `UO.exe`, `GDF/UOClassicGDF.dll`, `UO-patch.cfg` e `Uo.cfg`, 805850 bytes, SHA-256 de cada cópia igual ao da origem. `saidas/uo-classic/` criada, vazia.
- Achados principais:
  - A instalação tem **só o bootstrap do patcher** (Bioware Patch Client 1.0.6.5, PE32 x86, MSVC, assinatura EA válida). Não há cliente nem dados `.mul`/`.uop`, porque o patcher nunca rodou.
  - **Não é Unity.**
  - Não há anti-cheat, packer nem dados da conta.
  - O patcher baixa por HTTP sem TLS.
- Decisões do responsável (AskUserQuestion):
  - origem oficial uo.com/EA;
  - escopo "patcher agora, cliente depois", com o patcher rodado pelo responsável fora da sessão e nova triagem dos arquivos baixados;
  - N0 + N1, aceitando a exceção estática à regra só-offline do `plano-integracao-games.md` e o risco formal da §2 dos termos da EA.

## Unidade aceita?

Os critérios estão cumpridos. A aceitação final da unidade pelo responsável ainda não foi registrada; as decisões do protocolo foram.

## Falhas, desvios e retrabalho

- Desvio de escopo: o pedido previa copiar o executável e os formatos de dados, mas os dados não existem na máquina. A cópia ficou só com o patcher, e a etapa do cliente ficou para uma nova triagem.
- A engine do cliente não foi confirmada por arquivo (o cliente está ausente). Fica como hipótese (nativo C++) no registro.
- Termos lidos no navegador embutido (tos.ea.com, versão de 2026-05-14). A política específica do UO sobre programas de terceiros não foi consultada. A avaliação da Lei 9.609/98 é limitada e não é parecer jurídico.
- Nenhuma tool do REA nem do Ghidra foi usada. A triagem foi feita só com PowerShell e o Defender.
- Retrabalho pequeno: a primeira leitura do registro do Windows imprimiu os valores vazios (erro de script) e foi refeita.
- Ferramentas novas: nenhuma instalada. A pilha proposta usa o que já está auditado e no gate (REA, Ghidra/GhidraMCP, JDK 21, universal-modder em N0). O leitor de `.mul`/`.uop` fica para a etapa do cliente, por adendo.

## Contexto

- Compactações: 0.
- Conectores: os 10 conectores do claude.ai (kind `connector`) foram desligados pelo toggle no início, um por um, com resposta "Disabled" em todos, e religados no fim.

## Métricas (`node ~/.claude/skills/skill-budget/scripts/sessao.js`, medidas antes do commit)

```
Sessao 70fe6080-27b7-4d82-a555-39f17b264ea8  (2026-10-26T17:55, 6 min)
Tokens            principal   subagentes
  chamadas               23            0
  entrada nova           46            0
  escrita cache        120k            0
  leitura cache        2.8M            0
  saida                 23k            0
Contexto por requisicao: inicial 97k | medio 126k | mediano 117k | max 164k | >200k 0%
Trocas de modelo: 0 | compactacoes: 0
Engram: 0 chamadas | Skills invocadas: protocolo-seguranca:1
```

## Próximo passo

1. O responsável roda o patcher por conta própria, fora da sessão, se quiser a etapa do cliente.
2. Nova triagem do cliente baixado, como artefatos novos do mesmo alvo.
3. Até lá, a análise N0/N1 do patcher pode seguir em `01-analise.md`, numa sessão dedicada.
