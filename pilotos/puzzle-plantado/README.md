# Variante plantada do puzzle (fixture de teste)

**Isto não é produto.** É a variante do puzzle do piloto com mecanismos de monetização plantados de propósito, **inclusive proibidos (classe C)**, para medir se o `protocolo-monetizacao` os encontra numa análise cega (`docs/plano-piloto-puzzle.md`, fases F5 e F6; F7 com interface e execução no navegador). Nunca copiar daqui para `reimplementacoes/` nem distribuir os builds.

- `plantio.mjs`: as mudanças sobre o produto limpo (`reimplementacoes/puzzle-piloto/src/` e `interface/`), como substituições de trechos exatos. Se o produto mudar, o build falha até o plantio ser revisto.
- `GABARITO.md`: o que foi plantado, as iscas, qual alvo é qual e os estados esperados. **A sessão de análise não pode ler esta pasta.**
- `construir.mjs`: gera os dois builds da F7 em `alvos/` (fora do git), com interface. Os builds da F5/F6 (`blocos-a`, `blocos-b`) não são mais gerados; os hashes deles ficam nos registros da F6.

## Construir

```bash
node pilotos/puzzle-plantado/construir.mjs
```

O build:
1. copia o código e a interface do produto e aplica o plantio na variante;
2. tira comentários (JavaScript, CSS e HTML), neutraliza os textos que citam o piloto e troca o perfil de governança (`monetizacao.json`, com IDs do catálogo e justificativas) por uma configuração neutra, como num build de distribuição;
3. confere que não vazou nada que entregue a resposta (IDs `MON-`, palavras do gabarito, "piloto"), em todos os arquivos, inclusive HTML, CSS e textos de interface;
4. confere a sintaxe de cada arquivo (`node --check`) e roda uma sessão curta em cada build; o build limpo tem que jogar exatamente como o código-fonte, na sessão e pela interface (toques no modelo de tela, tela a tela);
5. imprime o SHA-256 de cada arquivo, para o protocolo de segurança.
