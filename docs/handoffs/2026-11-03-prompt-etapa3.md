# Prompt inicial — etapa 3 da construção do REA (a partir de 2026-11-03)

Texto para abrir uma sessão nova em `H:\King\Clientes e Projetos\PRKing_REA`. Copiar o bloco abaixo como primeira mensagem.

```text
Começo da etapa 3 da construção do sistema REA (PRKing_REA): controle da investigação. Estado de partida: main @ 27cbb4c, igual ao origin, npm test 277/277, árvore limpa (só .claude/agent-memory/, que fica fora do git e não deve ser adicionado). A etapa 2 fechou em 2026-11-03 com a CI ativa no main.

1. Leia primeiro, nesta ordem e só isto:
   - docs/handoffs/2026-11-03-etapa2-fechamento.md (o que mudou, dívidas, ponto de partida da etapa 3);
   - docs/handoffs/2026-11-02-estado-geral.md, seções 2 e 4 (demandas abertas e requisitos permanentes);
   - docs/planos/2026-11-01-evolucao-arquitetura-qualidade.md, só a §6 (MEL-05, MEL-06, MEL-07) e o parágrafo "Coordenação com outros planos" da §3;
   - CLAUDE.md (já carregado) e a memória do projeto.
   Não leia o plano de evolução inteiro nem os handoffs da etapa 2 um a um.

2. Confira o estado real antes de planejar: git fetch, git status, contagem origin/main...main, npm test e a proteção do main (gh api repos/ianbenicio/King_REA/branches/main/protection, só leitura). Se algo divergir do handoff, registre e me avise antes de seguir.

3. Desligue os conectores do claude.ai no início da unidade e religue ao fim (memória conectores-off-por-unidade).

4. Rode a Fase 0 (skill fase-0) para a unidade, com consulta ao Engram (precedentes de contrato de integrações, inventário de servidores MCP, schema de protocolo), e escreva o plano em docs/plano-de-execucao.md, arquivando o anterior em docs/planos/.

5. Unidade desta sessão: E3-0, preparação da etapa 3, sem mudar código nem hooks.
   a. @architect: ADR proposto para os contratos da MEL-05 (servidor e tool com identidade, versão, nível, tipo de recurso acessado e suporte a contexto de execução; schema para a parte estruturada do 00-seguranca.md, mantendo a narrativa em Markdown; onde mora o inventário único; como acomodar a família de tool da P-U5 sem segundo mecanismo). Partir do levantamento do que existe hoje: .mcp.json, matcher em .claude/settings.json, .claude/hooks/rea-niveis.json e ghidra-niveis.json, rea-gate.mjs, cli-gate.mjs, docs/guia-rea.md. Status "Proposto": decisão minha.
   b. @sm: story MEL-05 em docs/stories/ a partir da §6, dividida em fatias (a primeira: verificador de consistência entre os arquivos existentes, como componente do verificador e de um job da CI), com ACs testáveis e o que cada fatia não faz.
   c. @po: validação da story pelo checklist de 10 pontos, GO/NO-GO, correções na story.
   d. Proponha a sequência das unidades da etapa 3 (fatias da MEL-05; MEL-06 em identidade de arquivo, vínculo de provider e isolamento de sessão; MEL-07 depois), com tamanho e decisões minhas pendentes, no relatório de estado.
   Se sobrar contexto (abaixo de ~150k), ofereça a dívida D-1 (novo gate @qa da MEL-08) e pergunte antes de começar.
   Se eu pedir outra unidade, troque. Unidades que dependem de decisão minha (aprovar o ADR, M-1, P-U5): pergunte antes de qualquer mudança.

6. Limites desta sessão:
   - nenhuma tool rea ou ghidra, nada em alvos/ nem saidas/; o gate bloqueia os alvos até a M-1;
   - não editar status, niveis_aprovados nem a seção 8 de nenhum 00-seguranca.md, nem o rea-niveis.json, o ghidra-niveis.json ou o matcher do gate, sem meu "sim" na conversa (a E3-0 só lê esses arquivos);
   - não desativar nem contornar gate, cli-gate, checagem de monetização, publicação, pre-commit ou a CI; nada de enforce_admins desligado;
   - nada de segredo no repositório, runner próprio, action fora da auditoria ou ferramenta nova sem auditoria e minha aprovação;
   - nada de rea setup, rea update ou @latest;
   - o main é protegido: commits numa branch, conventional commits em inglês com a story no fim ([Story MEL-05]), pre-commit sem --no-verify; push da branch e PR só pelo @devops, com minha autorização; merge no main só com meu "sim" na conversa; nunca --force;
   - depois de abrir um PR, use as ferramentas ccd_pr; não fique consultando a CI em loop;
   - textos em português com acentuação; se faltar regra, pergunte.

7. Ao fim: handoff em docs/handoffs/<data>-e3-0-*.md (entregas, decisões, pendências, falhas e retrabalho, métricas do sessao.js), atualize o relatório de estado com a etapa 3 em andamento e a sequência proposta, e me pergunte sobre o envio (branch, PR e merge).
```

## Variações

- **Fechar antes a dívida D-1 (MEL-08 → Done):** trocar o passo 5 por "Unidade D-1: @qa refaz o gate da MEL-08 sobre `2d213f7` e `318d85d` (QA-E25-01 a 03), com o run do `main` como evidência; se PASS, story em Done e relatório de estado atualizado por PR".
- **Começar direto pela fatia 1 da MEL-05** (só se o ADR e a story já existirem e estiverem aprovados): trocar o passo 5 por "Unidade E3-1: verificador de consistência de integrações, componente novo no verificador e no job `js` da CI, com testes que apontam servidor sem mapa de níveis, tool sem classificação e matcher sem servidor; nada muda no gate".
- **Migração M-1 do `uo-classic`** (quando o PRKing_UO precisar do binário): como no [prompt anterior](2026-11-02-prompt-continuidade.md), em sessão própria.
