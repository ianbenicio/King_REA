# Handoff — adendo 1 do uo-classic: triagem passiva do cliente

## Identificação

- Sessão Claude Code: `70fe6080-27b7-4d82-a555-39f17b264ea8`. Sessão do app: `local_9ee60847-28bd-4216-9aba-43cf214fe100`. É a mesma sessão do protocolo (2026-10-26), retomada por pedido de `local_e6556b0c-a0f5-4201-9b0b-baa6782b2ca3`.
- Subagentes: nenhum.
- Início: 2026-10-28T12:21:41Z. Fim: 2026-10-28T12:29:00Z (antes do commit e do religamento dos conectores).
- HEAD no início: `8be11ff9bd7fb49c2e4b439f708060aa148947f4`. Commit desta unidade: `docs: client triage addendum for uo-classic` (local, sem push).
- A árvore de trabalho já tinha mudanças de outras sessões (`CLAUDE.md`, `docs/plano-de-execucao.md`, `docs/research/`). Elas não foram tocadas nem entraram no commit.

## Contrato da unidade

- **Tarefa:** nova triagem passiva, em N0/N1, do cliente completo baixado pelo responsável:
  1. inventário com SHA-256 de executáveis e DLLs;
  2. engine e linguagem;
  3. proteção;
  4. dados pessoais, redigidos;
  5. cópia para `alvos/uo-classic/` depois do "sim".
- **Proibido:** executar o cliente, conectar a servidor, rodar o patcher, editar `status` ou `niveis_aprovados`.
- **Critérios de pronto:** adendo no `00-seguranca.md`, cópia com hashes, handoff e commit local.

## Entregue

- `registros/uo-classic/00-seguranca.md`: uma linha na tabela de Adendos e a seção "Adendo 1". `status` e `niveis_aprovados` não mudaram.
- Achados:
  - **nativo C++/MSVC, não Unity**: `client.exe` 7.0.117.33 em Direct3D 9; `client_beta.exe` em SDL2 + OpenGL;
  - sem packer, sem anti-cheat ou DRM;
  - clientes sem assinatura (só o patcher e o `patchui` são assinados pela EA);
  - Defender sem ameaça;
  - classe C1 mantida.
- Dados pessoais: o ID da conta (`Uo.cfg`), o perfil de hardware (`metrics.txt`) e o log do patcher ficaram fora da cópia e só aparecem redigidos no registro.
- Cópia A + B aprovada pelo responsável: 147 arquivos, 602,6 MB, 0 divergências de hash. SHA-256 do conjunto: `65D1BED3…473F06`. Lista completa em `saidas/uo-classic/triagem-cliente-sha256.tsv`, fora do git.

## Unidade aceita?

Os critérios estão cumpridos. A aceitação final pelo responsável ainda não foi registrada; a decisão da cópia (A + B) foi.

## Falhas, desvios e retrabalho

- **Falha de privacidade, contida:** na leitura mascarada dos arquivos candidatos, o padrão de redação não cobria a chave `AcctID` do `Uo.cfg`. O ID da conta apareceu em texto claro na saída de uma ferramenta, dentro do transcript desta sessão. Ele não foi gravado em nenhum arquivo do repositório, de `alvos/` ou de `saidas/` (conferido por busca na cópia), nem em registro, commit ou handoff. Correção para as próximas triagens: redigir por lista de chaves conhecidas, e não só por padrão, ou imprimir apenas os nomes das chaves.
- **Retrabalho:** o script que monta as listas de cópia falhou duas vezes por escape de `\` em regex entre Bash e PowerShell. Foi refeito com `-like`. Não afetou a cópia.
- **Pendências de método, não falhas:**
  - a alta entropia da `.data` do `client.exe` e o uso da `Granny.dll` ficaram como hipóteses para N1;
  - os nomes de compilador vêm da versão do linker e do cabeçalho Rich, sem decodificação completa do Rich.
- Nenhuma tool do REA nem do Ghidra foi usada. Nada do cliente foi executado. Não houve rede, além da leitura dos termos no protocolo de 2026-10-26.

## Contexto

- Compactações: 0.
- Conectores: os 10 conectores do claude.ai (kind `connector`) foram desligados pelo toggle no início, com resposta "Disabled" em todos, e religados no fim.

## Métricas (`node ~/.claude/skills/skill-budget/scripts/sessao.js`)

A sessão é a mesma do protocolo, então os números são **acumulados das duas unidades** (o script mede a sessão inteira, desde 2026-10-26T17:55; os 2552 min de relógio incluem a pausa entre os dias). A unidade de 2026-10-26 tinha registrado 23 chamadas, 23k de saída e máximo de 164k.

```
Tokens            principal   subagentes
  chamadas               51            0
  entrada nova          102            0
  escrita cache        329k            0
  leitura cache        8.2M            0
  saida                 55k            0
Contexto por requisicao: inicial 97k | medio 167k | mediano 168k | max 233k | >200k 27%
Trocas de modelo: 0 | compactacoes: 0
```

Por diferença, esta unidade teve cerca de 28 chamadas e 32k de saída. O contexto passou de 200k nesta unidade, porque a sessão vinha da unidade anterior sem limpar.

## Próximo passo

Análise N0/N1 do cliente em sessão dedicada, a partir de `alvos/uo-classic/cliente/`. O leitor de `.mul`/`.uop` só entra por adendo auditado.
