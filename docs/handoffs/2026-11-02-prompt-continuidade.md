# Prompt inicial — continuidade da construção do REA (a partir de 2026-11-02)

Texto para abrir uma sessão nova em `H:\King\Clientes e Projetos\PRKing_REA`. Copiar o bloco abaixo como primeira mensagem.

```text
Continuação da construção do sistema REA (PRKing_REA). Estado de partida: main @ f694328, igual ao origin, npm test 184/184, árvore limpa.

1. Leia primeiro, nesta ordem e só isto:
   - docs/handoffs/2026-11-02-estado-geral.md (relatório de estado: demandas abertas, requisitos permanentes, sequência recomendada);
   - CLAUDE.md (já carregado) e a memória do projeto.
   Não leia o plano de evolução inteiro (551 linhas): leia só a seção da MEL que for trabalhar e a story dela.

2. Confira o estado real antes de planejar: git fetch, git status, contagem origin/main...main e npm test. Se algo divergir do relatório, registre e me avise antes de seguir.

3. Desligue os conectores do claude.ai no início da unidade e religue ao fim (memória conectores-off-por-unidade).

4. Rode a Fase 0 (skill fase-0) para a unidade escolhida, com consulta ao Engram, e escreva o plano em docs/plano-de-execucao.md, arquivando o anterior em docs/planos/.

5. Unidade desta sessão: E2-1 do relatório, validação @po das stories MEL-03, MEL-04 e MEL-08 (docs/stories/mel-03-*, mel-04-*, mel-08-*), pelo checklist de 10 pontos, com GO/NO-GO e correções listadas em cada story. Se as três derem GO e ainda houver contexto (abaixo de ~150k), proponha a próxima unidade sem decisão pendente (E2-4, MEL-08 local) e pergunte antes de começar.
   Se eu pedir outra unidade do relatório, troque. Unidades que dependem de decisão minha (E2-2, E2-3, E2-5, M-1): pergunte a decisão antes de qualquer mudança.

6. Limites desta sessão:
   - nenhuma tool rea ou ghidra, nada em alvos/; o gate bloqueia os alvos até a MEL-06a-m;
   - não editar status, niveis_aprovados nem a seção 8 de nenhum 00-seguranca.md sem meu "sim" na conversa;
   - não desativar nem contornar gate, cli-gate, checagem de monetização ou pre-commit;
   - nada ativo em .github/, sem segredo nem runner;
   - nada de rea setup, rea update ou @latest; ferramenta nova só com auditoria e minha aprovação;
   - commits locais por entrega, conventional commits em inglês, pre-commit sem --no-verify; push só pelo @devops, com minha autorização;
   - textos em português com acentuação; se faltar regra, pergunte.

7. Ao fim: handoff em docs/handoffs/<data>-<unidade>.md (entregas, decisões, pendências, falhas e retrabalho, métricas do sessao.js), atualize o relatório de estado se alguma demanda mudou de situação, e me pergunte sobre o push.
```

## Variações

- **Migração MEL-06a-m do `uo-classic`** (quando o PRKing_UO precisar de análise do binário): trocar o passo 5 por "Unidade M-1 do relatório para o alvo `uo-classic`: proponha a seção 8 com os hashes completos das fontes já registradas, mostre a tabela e espere meu sim antes de gravar; depois confirme no gate com uma chamada de leitura aprovada".
- **Alvo novo (U4 do piloto do perfil):** começar pelo protocolo de segurança do alvo em sessão própria, sem conectores; o protocolo já precisa preencher a seção 8.
