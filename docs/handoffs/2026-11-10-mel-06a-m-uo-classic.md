# Handoff — MEL-06a-m: identidade dos arquivos do `uo-classic` (2026-11-10)

**Sessão:** `cdb53d36` · **Branch:** `docs/mel-06a-m-uo-classic`, a partir de `origin/main` @ `e3a8164` (separada do [PR #19](https://github.com/ianbenicio/King_REA/pull/19), por decisão do responsável) · **Estado:** commit local, **push pendente** (pelo @devops, com autorização) · **Story:** [`mel-06a-hash-admissao.story.md`](../stories/mel-06a-hash-admissao.story.md), fatia MEL-06a-m · **Item do estado geral:** M-1

## 1. Decisão do responsável

| Pergunta | Resposta | Efeito |
|---|---|---|
| Fazer a M-1 do `uo-classic` (tabela de identidade dos arquivos)? | "Sim, fazer M-1" | aprovação na conversa, **só para este alvo**. `status` e `niveis_aprovados` não mudam |

Os outros seis alvos não foram perguntados nem tocados.

## 2. Entregas

| Entrega | Onde | Resultado |
|---|---|---|
| Seção 8 "Identidade dos arquivos" | [`registros/uo-classic/00-seguranca.md`](../../registros/uo-classic/00-seguranca.md) | 154 linhas (150 de `cliente/`, 4 de `instalacao/`), antes de "Adendos" |
| Linha na tabela de adendos e Adendo 3 | mesmo arquivo | fontes, conferência e uma observação de redação sobre o Adendo 1 |
| Estado geral | [`2026-11-02-estado-geral.md`](2026-11-02-estado-geral.md) | item M-1 e item 2 da sequência |
| Change Log da story | `docs/stories/mel-06a-hash-admissao.story.md` | uma linha |

A mudança no registro é só de acréscimo (187 linhas a mais, nenhuma removida). Hooks, mapas de nível, `.mcp.json`, `settings.json` e `alvos/` não mudaram.

## 3. Método

A regra da fatia é não usar o hash do arquivo atual sem conferência. A ordem foi:

1. **Fontes da triagem.** `instalacao/`: tabela "Arquivos" da seção 2 (4 linhas copiadas). `cliente/`: lista `saidas/uo-classic/triagem-cliente-sha256.tsv` do Adendo 1 (147) e tabela do Adendo 2 (3 arquivos novos de animação).
2. **Lista fora do git presa ao registro público.** O SHA-256 do conjunto declarado no Adendo 1 (`65D1BED3…473F06`) foi recalculado a partir da lista e bateu. A forma que reproduz o valor está no Adendo 3. A soma dos tamanhos também bate (631.935.447 bytes).
3. **Fontes entre si.** As 10 linhas de executáveis e DLLs do Adendo 1 presentes na cópia batem com a lista; a lista de animação em `saidas/` bate com o Adendo 2 (4 de 4).
4. **Arquivos atuais.** Os 154 arquivos de `alvos/uo-classic/` foram lidos para medir SHA-256 e tamanho. Só depois de tudo fechar a tabela foi gravada, a partir dos hashes da triagem.

Os scripts de conferência, inserção e prova ficaram em pasta temporária, fora do repositório.

## 4. Verificação

**Verificado:**

- 154 de 154 hashes e tamanhos atuais iguais aos da triagem; nenhum arquivo sem hash de triagem, nenhum hash de triagem sem arquivo, nenhum link em `alvos/uo-classic/`.
- O `rea-gate.mjs`, chamado direto com entrada sintética (`inspect_artifact`, N1), respondeu:

| Caso | Esperado | Veio |
|---|---|---|
| arquivo de `instalacao/` | libera | libera |
| arquivo de `cliente/` | libera | libera |
| arquivo em subpasta (`cliente/Data/`) | libera | libera |
| diretório `alvos/uo-classic/` inteiro | libera | libera |
| caminho fora do alvo | recusa | recusa |
| registro antigo (do `HEAD`, sem seção 8) | recusa | recusa: falta a seção |
| registro novo, conteúdo trocado | recusa | recusa: hash diverge |
| registro novo, arquivo fora da tabela | recusa | recusa: sem hash registrado |
| registro novo, diretório com arquivo intruso | recusa | recusa |

  Os quatro últimos rodaram numa raiz temporária com arquivos fictícios; nada do alvo foi copiado nem alterado.
- `npm test`: 333 testes, 328 aprovados, 0 falhas, 5 pulados (Docker Desktop desligado).
- `npm run check:publicacao`: 320 arquivos, nenhum problema.
- `npm run verificar`: 13 componentes aprovados, 0 falhas, 4 não executados (resultado INCOMPLETO, pelo Docker desligado).
- Frontmatter do registro intacto (`git diff` sem linha de `status`, `niveis_aprovados` ou outro campo).

**Não verificado:**

- Nenhuma tool do REA ou do Ghidra foi chamada de verdade contra o alvo. A prova é do hook, com entrada sintética. A primeira chamada real fica para a próxima análise.
- Gitleaks e os três componentes do Semgrep não rodaram: precisam do Docker Desktop ligado.
- CI: só roda depois do push.

## 5. Pendências

1. **Envio.** Commit local na branch própria `docs/mel-06a-m-uo-classic` (o responsável escolheu não misturar com o PR #19). Push e PR, só pelo @devops com autorização. O PR #19 também mexe no `2026-11-02-estado-geral.md`, em outros trechos (itens 7 a 9 da §5); quem entrar depois no `main` pode precisar de um merge simples nesse arquivo.
2. **Outros seis alvos** (`notepad-teste`, `notepad-reimpl`, `blocos-a`, `blocos-b`, `encaixe-1`, `encaixe-2`): seguem bloqueados na admissão. Cada um pede aprovação própria. O `notepad-reimpl` só tem hash abreviado e precisa de medição nova conferida pelo responsável.
3. **Redação do Adendo 1.** Ele fala em "os 10 `.exe` do cliente" na cópia A; a lista tem 8. Registrado como observação no Adendo 3, sem alterar o texto antigo.
4. `npm audit` aponta 6 vulnerabilidades (4 moderadas, 2 altas) nas dependências. Nada foi mudado: troca de versão é decisão do responsável.

## 6. Falhas e retrabalho

- **`node_modules` meio apagado.** No começo da sessão o `npm test` falhava em 4 testes de lint e o `npx rea mcp doctor` não achava o executável: faltavam 125 dos 159 pacotes do lockfile, desde 2026-11-05. A causa não foi determinada. Restaurado com `npm ci --ignore-scripts`, com aprovação do responsável; o `doctor` voltou a dar 170 tools e 6 prompts na 6.4.0.
- A primeira conferência acusou um arquivo "sem hash de triagem": era a marca de ordem de bytes no início da lista do Adendo 1, colada ao primeiro nome. Tratada a marca, fechou 154 de 154.
- O primeiro script, escrito por heredoc, perdeu barras invertidas; foi regravado como arquivo.

## 7. Fechamento

- **Conectores do claude.ai:** dez dos onze já estavam desligados no início; só o Figma (1 tool) estava ligado. Não alternei: a troca só vale no fim do turno e a unidade coube num turno. Nenhuma tool de conector foi usada.
- Métricas da sessão não medidas.
- `.claude/agent-memory/` continua fora do git.
