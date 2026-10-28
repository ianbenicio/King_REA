# Procedimentos de segurança

Procedimentos adicionais aplicados pelo protocolo de segurança (passo 5). Cada um nasce de um risco que a triagem encontrou e nenhum procedimento cobria, e só entra aqui com aprovação do responsável.

## Índice

| ID | Nome | Gatilho | Criado em | Origem (alvo) |
|----|------|---------|-----------|---------------|
| [P01](P01-dados-pessoais.md) | Dados pessoais em arquivos do alvo | Alvo instalado com configuração, log, perfil ou save do usuário; qualquer classe; triagem e N1 | 2026-10-28 | `uo-classic` |

## Modelo

Arquivo `P<NN>-<nome-curto>.md`:

```markdown
# P<NN> — <Nome>

**Gatilho:** <tipo de alvo, classe de confiança ou nível do REA que ativa este procedimento>
**Risco coberto:** <o que pode dar errado>
**Origem:** <slug do alvo onde o risco apareceu>, <data>

## Passos
1. <ação verificável>
2. ...

## Critério de bloqueio
<quando este procedimento impede a aprovação do plano>
```
