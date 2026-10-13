---
name: protocolo-mecanicas
description: Protocolo para identificar e entender as mecânicas e dinâmicas de um jogo (regras, fórmulas, parâmetros, sistemas, loops, aleatoriedade, economia, balanceamento, comportamento emergente) e produzir o documento completo registros/<slug>/03-mecanicas.md, com base no framework MDA. Use quando o responsável pedir análise de mecânicas, dinâmicas ou game design de um jogo-alvo, ou ofereça quando o alvo em análise for um jogo. Exige o protocolo de segurança aprovado para o alvo; a coleta respeita os níveis aprovados no gate.
---

# Protocolo de mecânicas e dinâmicas de games

Base: framework **MDA** (Hunicke, LeBlanc, Zubek).
- **Mecânicas:** regras, ações e parâmetros que estão no jogo. São as únicas observáveis direto no alvo.
- **Dinâmicas:** como as mecânicas se comportam em jogo, na interação com o jogador. Demonstradas por simulação e observação.
- **Estética:** a experiência resultante. Sempre interpretação, marcada como inferência.

Ordem de trabalho: **do mais barato ao mais caro** — comunidade (hipóteses) → dados (parâmetros) → código (fórmulas) → execução (verificação) → simulação (dinâmicas).

## 0. Pré-condições

- `registros/<slug>/00-seguranca.md` com `status: aprovado` e o alvo em `registros/ALVO_ATIVO`. Toda coleta usa só os níveis aprovados; nível novo exige adendo.
- Jogo do responsável, single-player ou offline. Anti-cheat presente: parar (já bloqueado pela triagem).
- Combinar com o responsável, numa `AskUserQuestion`:
  - **escopo:** jogo inteiro ou sistemas específicos (ex.: combate e progressão);
  - **profundidade:** catálogo descritivo, ou fórmulas exatas verificadas;
  - **verificação em execução:** nenhuma, observação (N2) ou instrumentação (N3), dentro do plano aprovado.

## 1. Hipóteses da comunidade (antes de abrir o binário)

- Conhecimento local: `ferramentas/universal-modder/knowledge/games/<jogo>/` e `knowledge/techniques/`; índice em `docs/conhecimento-universal-modder.md`.
- Comunidade: wiki do jogo, TASVideos (física, RNG, frame data), TCRF (conteúdo não usado, engine), guias de speedrun, datamines publicados.
- Tudo daqui é **hipótese** com referência `[Rn]` até ser confirmado no alvo. Pesquisa externa segue a regra de sigilo do `00-seguranca.md` (termos genéricos se o alvo for confidencial).

## 2. Dados primeiro (parâmetros)

Valores de balanceamento costumam estar em dados, não em código. Extrair antes de descompilar:

| Engine | Onde ficam | Como extrair | Nível |
|---|---|---|---|
| Unity | ScriptableObjects e MonoBehaviours em assets/bundles; TextAssets (JSON, CSV) | UnityPy ou AssetRipper (instalar sob demanda, auditado) | N1 |
| Unreal | DataTables, CurveTables, DataAssets em `.pak`/IoStore | FModel ou CUE4Parse, exportando JSON (pode exigir chave AES e `.usmap`) | N1 |
| .NET / Mono | constantes, enums e tabelas no IL | REA `inspect_managed_members` | N1 |
| Nativo / engine própria | arquivos de config, scripts (Lua, Python), tabelas binárias, `.rdata` | REA ou Ghidra (strings, dados); formatos conhecidos na base de conhecimento | N1 |

- Exportações brutas ficam em `saidas/<slug>/dados/` (fora do git). No documento, só os valores relevantes, resumidos.
- Duas versões do jogo: o diff das exportações mostra as mudanças de balanceamento.

## 3. Código (fórmulas e regras)

Achar quem consome cada parâmetro e reconstruir a regra.
- **Ponto de entrada:** nome de campo ou tabela, string de UI ("Damage", "Critical"), ou constante achada no passo 2 → referências cruzadas → função.
- **Mono/.NET:** REA `inspect_managed_members` ou ILSpy. **IL2CPP:** Cpp2IL (nomes e assinaturas) + Ghidra (corpo). **Nativo e Unreal shipping:** Ghidra/GhidraMCP ou REA + Ghidra.
- Registrar cada fórmula **em notação própria** (matemática ou pseudocódigo curto), com a evidência (ID REA, função ou endereço, arquivo).
- **Repositório público:** não colar código descompilado extenso nem assets extraídos no documento. No máximo trechos curtos para fundamentar.
- Conferir sempre: tipos e arredondamento (float32 × double, truncamento), ordem de aplicação (aditivo antes de multiplicativo), limites (clamps), tabelas de lookup, RNG (gerador, semente, distribuição).

## 4. Verificação em execução (opcional, só com nível aprovado)

- Observação (N2) ou instrumentação (N3) só se o plano aprovou e o responsável confirmar. Exemplos: ler um valor na memória para conferir uma previsão; registrar traços (posição e velocidade por frame, dano por golpe).
- **Método do oráculo:** prever o resultado pela fórmula reconstruída e comparar com o jogo real. Divergência = lacuna ou regra faltando (efeito oculto, ordem, arredondamento).
- Sem execução aprovada, a confiança máxima é **inferido**.

## 5. Dinâmicas

- Modelar as mecânicas confirmadas num script de simulação local (Python ou JS) em `registros/<slug>/simulacoes/`: semente fixa; Monte Carlo quando houver aleatoriedade. Nada vai para serviços externos.
- Analisar:
  - **core loop e meta loop** (ação → recompensa → progressão);
  - **realimentação positiva** (bola de neve) e **negativa** (recuperação, rubber-banding);
  - **curvas:** poder do jogador × dificuldade, tempo para derrotar, XP por nível, custo × recompensa;
  - **economia:** fontes, sumidouros, inflação, gargalos;
  - **estratégias dominantes** e escolhas sem peso real;
  - **aleatoriedade:** variância real × percebida, proteção contra azar;
  - **interações entre sistemas:** sinergias, combos, efeitos não intencionais de design.
- Cada dinâmica aponta as mecânicas que a produzem e como foi demonstrada (simulação, observação ou comunidade).

## 6. Estética (interpretativo)

Mapear dinâmicas para as experiências do MDA: sensação, fantasia, narrativa, desafio, companheirismo, descoberta, expressão, submissão. Sempre **inferência**.

## 7. Documento

1. Escrever `registros/<slug>/03-mecanicas.md` a partir de `registros/_modelos/03-mecanicas.md`.
2. Revisão antes de salvar:
   - toda mecânica tem fonte e confiança;
   - hipótese da comunidade não confirmada fica marcada como hipótese;
   - nenhum asset extraído e nenhum código descompilado extenso;
   - segredos e dados pessoais como `[REDIGIDO: tipo]`.
3. Commit local: `docs: game mechanics for <slug>`.
4. Ao fim, oferecer (sem executar) o protocolo de benchmark, se ainda não feito, e propor salvar no Engram os padrões reutilizáveis (não os dados do jogo), só com aprovação.
