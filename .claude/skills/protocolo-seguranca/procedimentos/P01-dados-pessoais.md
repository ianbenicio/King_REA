# P01 — Dados pessoais em arquivos do alvo

**Gatilho:** alvo instalado que traz configuração, log, perfil ou save do usuário (`.cfg`, `.ini`, `.log`, `.json`, `.xml`, `.txt` em pastas de config, log ou perfil; nomes com `account`, `login`, `user`, `profile`, `char`, `server`). Qualquer classe de confiança; triagem passiva e N1.
**Risco coberto:** identificador de conta, e-mail, servidor ou token aparece em texto claro na saída de uma ferramenta e fica no transcript da sessão, mesmo sem ser gravado em arquivo.
**Origem:** `uo-classic`, 2026-10-28 (uma chave de conta do `Uo.cfg` escapou do padrão de redação na triagem do cliente).

## Passos
1. Antes de ler, listar os arquivos candidatos pelo nome e pela extensão.
2. Na primeira leitura, imprimir só nomes de seção e de chave, mais o tamanho de cada valor (`Chave = <N chars>`). Nunca o valor.
3. Um valor só aparece se a chave estiver numa lista de permissão de chaves sabidamente não pessoais (versão, resolução, idioma), definida antes da leitura. Regex de e-mail, IP e similares é camada extra, não a única.
4. Arquivo binário ou de formato desconhecido: nada de dump de strings sem filtro.
5. Dado pessoal achado: registrar só `[REDIGIDO: tipo]`, com arquivo e chave, nunca o valor. Não copiar o arquivo para `alvos/` salvo necessidade; se copiar, anotar o motivo.
6. Se um valor escapar: parar; não repetir o valor em lugar nenhum; conferir por busca que ele não foi gravado no repositório, em `alvos/`, em `saidas/` nem em commits; registrar a falha no handoff, sem o valor.

## Critério de bloqueio
Não bloqueia a aprovação do plano. Bloqueia a leitura de valores de arquivos de configuração enquanto a lista de permissão não estiver definida.
