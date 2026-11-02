# Outrora — perguntas de volta 2 e 3 do PRKing_UO (pesquisa pública)

**Projeto:** Outrora (jogo próprio em Unity, single-player e local, inspirado no Ultima Online)
**Origem das perguntas:** tabela de pergunta de volta do `PRKing_UO/docs/spec/README.md` (commit `0841454`), itens 2 e 3 (Q02 e Q03 da revisão técnica de 2026-11-02)
**Seções da especificação afetadas:** §5.4 e §5.5 (pergunta 2); §6.1 e §13.1 (pergunta 3)
**Data da pesquisa:** 2026-11-02
**Método:** leitura das notas oficiais de publish no uo.com e de código aberto de emulador (RunUO, ServUO e ModernUO), baixado para uma pasta temporária fora do repositório e apagado no fim, só para entender o comportamento. Nenhuma tool do REA ou do Ghidra; nada de `alvos/` ou `saidas/`; nenhum nível novo no `00-seguranca.md`.
**Sala limpa:** nenhum trecho de código foi copiado nem traduzido linha a linha. O texto abaixo descreve comportamento, em palavras próprias. Citações literais, quando há, têm menos de 15 palavras.
**Texto de página como dado:** nenhuma das páginas ou arquivos lidos trazia texto dirigido a um assistente de IA. Nada foi executado a partir do conteúdo das fontes.

**Força das fontes:** **oficial** (nota de publish da época), **emulador** (código aberto, lido só para comportamento). Os três emuladores descendem do RunUO: a concordância entre eles mostra que o comportamento é estável, não que foi confirmado de forma independente.

---

## 1. Pergunta 2 — atrofia e ganho com o total no cap (§5.4, §5.5)

### 1.1 Pergunta

No ganho com o total no cap, a atrofia de um skill em "desce" acontece antes da checagem `T + ganho ≤ c_T` (abrindo espaço) ou só depois? Como se escolhe o skill que desce? E se nenhum puder descer, ou se só parte do ganho couber?

### 1.2 O que dizem as fontes oficiais

- **nov/1998, antes das travas** [V2]: a atrofia passou a escolher com mais frequência os skills menos usados e ficou mais rara, para reduzir o efeito "gangorra" visto no Test Center.
- **Publish 1, nov/1999** [V1]: trava de três estados por skill. Em "sobe", o skill sobe e nunca desce; em "desce", é candidato à atrofia; em "para", não sobe nem desce. O FAQ da nota responde três casos:
  - no cap, com tudo em "sobe": nenhum skill muda;
  - no cap, com os skills em "desce" todos em 0,0: nenhum skill muda;
  - com tudo em "desce": nada muda, porque a atrofia só acontece quando outro skill sobe.
- A nota também diz que, no cap, só se ganha stat com outro skill em "desce" que tenha pontos para atrofiar, ou com o skill já em 100 [V1].
- **Lacuna oficial:** nenhuma nota diz a ordem entre atrofia e checagem do cap, quanto o skill perde nem como se escolhe o skill que desce depois das travas.

### 1.3 O que fazem os emuladores

Comportamento comum aos três [V5][V6][V7][V8]:

1. O ganho só é tentado com a trava em "sobe" e o skill abaixo do próprio cap.
2. O tamanho do ganho `g` é sorteado primeiro: 0,1, ou de 0,1 a 0,4 quando o skill está em 10,0 ou menos.
3. **A atrofia vem antes da checagem do cap**, na mesma ação. O total já sai reduzido quando se confere se o ganho cabe; a atrofia abre o espaço.
4. **Escolha do skill que desce:** percorre-se a lista de skills na ordem fixa dela e pega-se o primeiro que (a) não é o skill que está subindo, (b) tem trava em "desce" e (c) tem pelo menos `g` pontos. Só esse perde, e perde exatamente `g`. Skill em "desce" com menos de `g` é pulado: não desce em parte.
5. **Nenhum elegível:** nenhum skill desce.
6. Depois disso vem a checagem do cap total.
7. O cap total vale só para o personagem do jogador; criaturas sobem sem ele.

Divergências:

| Ponto | RunUO e ServUO [V5][V7] | ModernUO [V8] |
|---|---|---|
| Quando a atrofia é tentada | Na prática, sempre que o total está no cap e nunca abaixo dele. A razão total/cap é calculada com números inteiros, então vale 0 abaixo do cap e 1 no cap, e o sorteio contra ela só passa no cap [V6] | Com probabilidade total/cap em qualquer total: com 350 de 700, metade dos ganhos derruba um skill em "desce" |
| Ganho que só cabe em parte | Tudo ou nada: sobe `g` inteiro se `T + g ≤ c_T`; senão, nada sobe | Basta o total estar abaixo do cap; o total pode passar do cap em até 0,3 |

### 1.4 Resposta proposta (base do adendo na §5.5)

- **Ordem:** atrofia antes da checagem do cap; ela abre o espaço do ganho na mesma ação (emulador, os três).
- **Quando:** só com o total no cap. É o que o RunUO e o ServUO fazem na prática e o que a nota oficial diz: a atrofia só acontece quando outro skill sobe [V1]. A forma "probabilidade `T / c_T`" da §5.5 vem da leitura literal da conta e não descreve o comportamento do RunUO; a variante do ModernUO fica como perfil de dados opcional.
- **Qual skill:** o primeiro na ordem fixa da lista de skills com trava em "desce", diferente do que sobe e com pelo menos `g` pontos. A ordem de escolha fica em dados; a regra "menos usado" de nov/1998 [V2] pode ser alternativa, mas pede um contador de uso por skill (inferência).
- **Quanto:** exatamente `g`.
- **Nenhum pode descer:** não há atrofia, o ganho não cabe e nada muda (oficial [V1]).
- **Ganho parcial:** não existe; tudo ou nada (RunUO e ServUO). Efeito colateral: abaixo do cap, com `T + g > c_T`, o que só ocorre com o skill em 10,0 ou menos, não há atrofia nem ganho.

**Força:** oficial para "a atrofia só ocorre quando outro sobe" e "nada muda" nos três casos do FAQ; emulador para ordem, escolha, quantidade e tudo ou nada.

---

## 2. Pergunta 3 — alcance de contato do golpe corpo a corpo (§6.1, §13.1)

### 2.1 Pergunta

Qual é o alcance de contato do golpe corpo a corpo, distinto dos 15 tiles para iniciar o ataque? Quando ele é conferido: ao iniciar, a cada golpe ou no impacto? O que acontece com o timer do golpe quando o alvo sai do alcance?

### 2.2 O que dizem as fontes oficiais

- **jan/1999** [V3]: só se inicia ataque contra jogador ou NPC a até 15 tiles e com linha de visão.
- **fev/1999** [V4]:
  - o ritmo do golpe passa a depender da estamina atual;
  - o dano do golpe passa a ser aplicado no **início** do golpe, e não no fim, para tirar a vantagem da conexão rápida; vale também para luta desarmada e para monstros;
  - equipar uma arma impõe um curto tempo de preparação antes de golpear.
- **Lacuna oficial:** nenhuma nota da era diz o alcance de contato em tiles.

### 2.3 O que fazem os emuladores

RunUO e ModernUO têm o mesmo comportamento [V9][V10][V11]:

- **Alcance por arma.** Cada arma tem um alcance máximo em tiles. Para as armas corpo a corpo, inclusive lanças e armas de haste, e para os punhos, o valor é 1 [V10]. Arco 10 e besta 8 [V12].
- **Medida da distância.** Vale a maior das diferenças em x e em y. Com alcance 1, as oito casas vizinhas contam. A altura não entra nesse teste; a linha de visão é um teste à parte [V9].
- **Laço do golpe.** Enquanto há alvo de combate, um timer de tique curto confere se o horário do próximo golpe já chegou. Se não chegou, nada acontece. Se chegou:
  1. alvo inválido (morto, removido, em outro mapa ou que o atacante não vê): o combate termina;
  2. alvo fora do alcance da arma: não há golpe, e a conferência se repete no tique seguinte, sem mexer no horário;
  3. sem linha de visão: idem;
  4. tudo certo: o golpe sai, acerto e dano se resolvem na hora, e o próximo golpe é marcado para "agora + intervalo inteiro" [V9][V10].
- **Consequência.** Golpe vencido não se acumula. Se o alvo fica longe por vários intervalos e volta, sai um golpe na hora e depois o ritmo normal.
- **Troca de arma.** Equipar ou tirar a arma marca o próximo golpe para "agora + intervalo inteiro" da arma que fica na mão [V10]. A nota oficial fala só em "curto tempo de preparação" [V4].
- **Criaturas corpo a corpo** perseguem o alvo até a distância de luta, que nas criaturas de corpo a corpo é 1 [V13] (já na §13.1 como "persegue até 1 tile").

### 2.4 Resposta proposta (base do adendo na §6.1)

- **Alcance de contato:** dado por arma; 1 tile para corpo a corpo e luta desarmada, medido pela maior das diferenças em x e y (oito direções). Os 15 tiles valem só para iniciar o ataque [V3].
- **Quando se confere:** a cada tentativa de golpe, quando o intervalo venceu: alvo válido, alcance e linha de visão, nessa ordem.
- **Impacto:** não há checagem separada. Desde fev/1999 o dano se aplica no início do golpe [V4], no mesmo instante da conferência.
- **Timer fora do alcance:** continua correndo até vencer; vencido, o golpe fica pronto e espera. Sai assim que o alvo volta ao alcance e o intervalo seguinte conta dele. Não acumula.
- A decisão provisória do PRKing_UO (1 tile em oito direções, conferido no momento do golpe, timer continua, valor em dados) bate com isso; falta só dizer que o golpe pronto não acumula.

**Força:** oficial para os 15 tiles e o dano no início do golpe; emulador para o alcance 1, a medida da distância e o laço.

---

## 3. Lacunas

- Escolha do skill que atrofia e quantidade depois das travas: só há fonte de emulador.
- Alcance de contato em tiles na era: só há fonte de emulador.
- Diferença de altura entre atacante e alvo: o emulador ignora no teste de alcance e depende da linha de visão; nenhuma fonte oficial trata disso.
- Antes de fev/1999 o dano saía no fim do golpe [V4]; com a D1 (mar/2000) esse caso fica fora.

## 4. Referências

Data de acesso de todas: **2026-11-02**. Código de emulador lido só para entender o comportamento, sem cópia. Licenças conferidas no arquivo LICENSE de cada repositório.

| ID | Título | URL | Tipo | Força | Licença |
|---|---|---|---|---|---|
| V1 | Publish 1, 23/11/1999 (travas de skill e FAQ) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-publish-01-23rd-november/ | documentação oficial | oficial | n/a |
| V2 | Patch notes 10/11/1998 (atrofia) | https://uo.com/?p=11102 | documentação oficial | oficial | n/a |
| V3 | Publish 19/01/1999 (15 tiles e linha de visão) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-01-19th-january/ | documentação oficial | oficial | n/a |
| V4 | Publish 02/02/1999 (estamina, dano no início do golpe, preparação ao equipar) | https://uo.com/wiki/ultima-online-wiki/technical/previous-publishes/1999-2/1999-02-2nd-february/ | documentação oficial | oficial | n/a |
| V5 | RunUO — Scripts/Misc/SkillCheck.cs | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Misc/SkillCheck.cs | código | emulador | GPL-2.0-or-later |
| V6 | RunUO — Server/Skills.cs (tipos do total e do cap) | https://raw.githubusercontent.com/runuo/runuo/master/Server/Skills.cs | código | emulador | GPL-2.0-or-later |
| V7 | ServUO — Scripts/Misc/SkillCheck.cs | https://raw.githubusercontent.com/ServUO/ServUO/master/Scripts/Misc/SkillCheck.cs | código | emulador | GPL-2.0 |
| V8 | ModernUO — Projects/UOContent/Skills/SkillCheck.cs | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/UOContent/Skills/SkillCheck.cs | código | emulador | GPL-3.0 |
| V9 | RunUO — Server/Mobile.cs (laço do golpe e teste de alcance) | https://raw.githubusercontent.com/runuo/runuo/master/Server/Mobile.cs | código | emulador | GPL-2.0-or-later |
| V10 | RunUO — Scripts/Items/Weapons/BaseWeapon.cs (alcance padrão, troca de arma, golpe) | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/BaseWeapon.cs | código | emulador | GPL-2.0-or-later |
| V11 | ModernUO — Projects/Server/Mobiles/Mobile.cs (laço do golpe) | https://raw.githubusercontent.com/modernuo/ModernUO/main/Projects/Server/Mobiles/Mobile.cs | código | emulador | GPL-3.0 |
| V12 | RunUO — Bow.cs e Crossbow.cs (alcance de arma à distância) | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Ranged/Bow.cs ; https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Items/Weapons/Ranged/Crossbow.cs | código | emulador | GPL-2.0-or-later |
| V13 | RunUO — Scripts/Mobiles/AI/MeleeAI.cs (perseguição até a distância de luta; é o `[W60]`) | https://raw.githubusercontent.com/runuo/runuo/master/Scripts/Mobiles/AI/MeleeAI.cs | código | emulador | GPL-2.0-or-later |
| V14 | Licenças: RunUO, ServUO e ModernUO (arquivo LICENSE) | https://github.com/runuo/runuo/blob/master/LICENSE ; https://github.com/ServUO/ServUO/blob/master/LICENSE ; https://github.com/modernuo/ModernUO/blob/main/LICENSE | código (licença) | n/a | n/a |
