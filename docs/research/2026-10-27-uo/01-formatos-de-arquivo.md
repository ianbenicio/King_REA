# Outrora — pesquisa 01: formatos de arquivo dos dados do cliente do Ultima Online

- **Data:** 2026-10-27
- **Autor:** @analyst (Atlas), pesquisa pública só com WebSearch e WebFetch
- **Escopo:** papel, estrutura, codificação de cor/pixel e armadilhas dos arquivos de dados do cliente clássico do Ultima Online (UO), com foco no que um jogo próprio em Unity precisa para ler, em tempo de execução, a cópia instalada do próprio usuário (era T2A e cliente atual).
- **Método:** leitura de código-fonte aberto (ClassicUO, UOFiddler/Ultima SDK) apenas para entender o formato, mais fóruns, wikis e documentação. Nenhum código foi copiado; as estruturas estão descritas em palavras e tabelas próprias.
- **Convenção de citação:** `[Fn]` aponta a tabela de referências no fim. `(inferência)` marca dedução sem fonte direta. "Fonte vista só no resumo do buscador" significa que a página não abriu (404/403/DNS) e o conteúdo veio do trecho devolvido pela busca; a confiança nesses casos é baixa.

## Decisões autônomas

- [AUTO-DECISION] A skill `tech-search` pede cinco arquivos em `docs/research/<data>-<slug>/` → entreguei um único arquivo, como manda o pedido (razão: a regra do pedido é mais específica e restringe a escrita a este arquivo).
- [AUTO-DECISION] A documentação clássica da Heptazane (hospedada no Stratics) e o guia do Wolfpack (wpdev, SourceForge) não abriram (403/404, Wayback Machine bloqueada para a ferramenta) → a descrição foi reconstruída a partir do código aberto do ClassicUO e do Ultima SDK, com os trechos do guia Wolfpack usados só como contraponto e marcados como de baixa confiança (razão: não há outra via permitida).
- [AUTO-DECISION] O carregamento de persona e de contexto local do repositório foi pulado (razão: o pedido proíbe ler fora do arquivo de entrega).
- Nenhuma página consultada trouxe texto dirigido a agentes de IA ou tentativa de instrução; nada a anotar nesse sentido.

## Sumário executivo

1. **Dois mundos de arquivos.** Clientes da era T2A (versão 2.0.x, 1998–2000) usam só pares `*.idx`/`*idx.mul` + `*.mul` e arquivos sem índice (`tiledata.mul`, `hues.mul`, `map0.mul` etc.) [F21][F48]. O cliente atual embrulha parte desses dados em contêineres `.uop` (assinatura "MYP"), com entradas endereçadas por um hash de 64 bits do nome lógico, e o resto continua `.mul` [F3][F4][F36].
2. **A troca para `.uop`** é datada pelas fontes entre 7.0.24.x e 7.0.25.x (2012), mas os critérios divergem: o ClassicUO trata como instalação UOP qualquer versão ≥ 7.0.0.0 que tenha `MainMisc.uop`, e marca 7.0.24.0 como "troca de .mul para .uop" [F4][F21][F45][F55].
3. **Gráficos** usam cor de 16 bits no arranjo 5-5-5 (vermelho nos bits 10–14, verde 5–9, azul 0–4); o bit 15 é tratado de forma diferente por cada leitor (ignorado, ou usado como "opaco" interno) [F22][F42][F50].
4. **Mapa:** blocos de 8×8 células, 196 bytes por bloco, organizados em ordem de coluna (o índice do bloco é x·altura + y); statics de 7 bytes por objeto, com x/y relativos ao bloco [F7][F44]. Na era T2A só existe o mapa 0, de 6144×4096 células (inferência a partir de [F7]).
5. **Projeção:** losango de 44×44 px; um passo de célula desloca 22 px; cada unidade de z sobe 4 px na tela [F24][F26]. A ordem de desenho do ClassicUO dentro da célula usa uma chave "priority z" com ajustes pequenos por tipo e por flags do `tiledata` [F23].
6. **Armadilhas principais:** largura dos flags do `tiledata` (32 → 64 bits a partir de 7.0.9.0), tamanho do registro de `multi` (12 → 16 bytes), divisão do campo extra do índice (largura/altura) que diverge entre leitores para `light`, padrão de nome de hash de gumps com exceção de um id, e `verdata.mul` que alguns clientes leem e outros ignoram [F8][F12][F17][F39][F37][F4][F46].

---

## 1. Panorama: quais arquivos existem e em que formato

### 1.1 Mapa de arquivos por função

| Função | Era T2A (só MUL) | Cliente atual | Fontes |
|---|---|---|---|
| Arte de terreno e statics | `art.mul` + `artidx.mul` | `artLegacyMUL.uop` | [F5][F36] |
| Gumps (interface) | `gumpart.mul` + `gumpidx.mul` | `gumpartLegacyMUL.uop` | [F6][F36] |
| Terreno do mapa | `map0.mul` | `map{N}LegacyMUL.uop` (N = 0…5) | [F7][F36] |
| Statics do mapa | `staidx0.mul` + `statics0.mul` | continuam `.mul` (`staidx{N}.mul` + `statics{N}.mul`) | [F7] |
| Patches de mapa | — (inferência) | `mapdif{N}.mul`, `mapdifl{N}.mul`, `stadif*.mul` | [F7] |
| Patches gerais | `verdata.mul` | `verdata.mul` (muitos clientes ignoram) | [F18][F46] |
| Propriedades de tile | `tiledata.mul` (flags 32 bits) | `tiledata.mul` (flags 64 bits) + `tileart.uop` | [F8][F27] |
| Texturas de terreno | `texmaps.mul` + `texidx.mul` | idem | [F16] |
| Animações de criaturas | `anim.mul` + `anim.idx` | `anim{,2..5}.mul/.idx` + `AnimationFrame1..N.uop` + `AnimationSequence.uop` | [F10][F38] |
| Animação de itens | `animdata.mul` | idem | [F11] |
| Cores (hues) | `hues.mul` | idem | [F9] |
| Cor de radar | `radarcol.mul` | idem | [F9][F40] |
| Sons | `sound.mul` + `soundidx.mul` | `soundLegacyMUL.uop` | [F13][F36] |
| Multis (casas, barcos) | `multi.mul` + `multi.idx` (registro 12 bytes) | `MultiCollection.uop` (+ `housing.bin` dentro) | [F12][F37] |
| Luzes | `light.mul` + `lightidx.mul` | idem | [F14] |
| Perícias | `skills.mul` + `Skills.idx` | idem | [F15] |
| Textos localizados | `cliloc.*` (inferência sobre a era) | `Cliloc.enu` e outros idiomas | [F19] |
| Fontes | `fonts.mul`, `unifont*.mul` | idem | [F20] |
| Definições de remapeamento | `body.def`, `bodyconv.def`, `mobtypes.txt` etc. | idem | [F10] |
| Diversos | — | `MainMisc.uop`, `string_dictionary.uop` | [F4][F28] |

Observações:

- A lista "continua `.mul`" vem de os carregadores do ClassicUO só terem caminho `.mul` para esses arquivos (inferência: se o cliente atual os empacotasse em `.uop`, o ClassicUO teria caminho `.uop` para eles) [F7][F8][F9][F11][F14][F15][F16].
- O conjunto exato de arquivos presentes num cliente T2A não foi encontrado documentado. A tabela da coluna "Era T2A" é inferência a partir de: o mapa estendido e os mapas 1–5 vieram depois [F7]; `anim2..5` são associados a expansões posteriores (inferência); `mobtypes.txt` só é lido a partir de 5.0.0a [F10].
- O Ultima SDK mantém uma lista fixa de mais de cem nomes de arquivo conhecidos, incluindo `animationframe*.uop`, `animationsequence.uop`, `multimap.rle`, `client.exe` e `uotd.exe` [F33].

### 1.2 Linha do tempo de versões relevante para os formatos

| Versão | Marco | Fonte |
|---|---|---|
| 2.0.0 | T2A (The Second Age), lançada em 24/10/1998 | [F21][F51] |
| 3.0.5d | Renaissance | [F21] |
| 3.0.8z | Age of Shadows | [F21] |
| 5.0.0a | ClassicUO deixa de forçar `verdata`; `mobtypes.txt` passa a ser lido | [F4][F10] |
| 6.0.14.3 | Stygian Abyss; animações novas já em formato diferente segundo um mantenedor do UOFiddler | [F21][F56] |
| 7.0.0.0 | Limiar do ClassicUO para "instalação UOP" (desde que exista `MainMisc.uop`) | [F4] |
| 7.0.9.0 | High Seas; `tiledata` com flags de 64 bits; `multi` com registro de 16 bytes | [F8][F12][F21] |
| 7.0.24.0 | Comentário do ClassicUO: troca de `.mul` para `.uop` | [F21] |
| 7.0.24.2 | Segundo um fórum do UOX3, mudança de formato de mapas, statics e itens que quebrou ferramentas antigas (fonte vista só no resumo do buscador) | [F55] |

**Conflito registrado:** o ClassicUO trata ≥ 7.0.0.0 + `MainMisc.uop` como instalação UOP [F4], mas o próprio enum do ClassicUO marca 7.0.24.0 como a troca [F21]; o fórum do UOX3 cita 7.0.24.2 [F55]; no fórum do UOFiddler, em maio de 2012, um usuário fala em 7.0.25.0 e outra mantenedora corrige para 7.0.24.x e lembra que animações em formato novo já vinham do Stygian Abyss (6.x) [F56]. Para o Outrora, o critério robusto é detectar pela presença dos arquivos, não pela versão (inferência).

---

## 2. Contêiner `.uop`

### 2.1 Papel

É um pacote que guarda muitos "arquivos lógicos" (cada antigo registro de um `.mul`, ou um bloco de dados) dentro de um único arquivo físico. Os arquivos `*LegacyMUL.uop` são, na prática, os `.mul` antigos reempacotados com um registro por id [F3][F36][F37].

### 2.2 Cabeçalho

| Campo | Tamanho | Observação | Fonte |
|---|---|---|---|
| Assinatura | 4 bytes | valor 0x0050594D, que lido como texto é "MYP"; leitores rejeitam o arquivo se não bater | [F3][F38] |
| Versão | 4 bytes | o empacotador do UOFiddler usa 4 (gumps, sons, multis) e 5 (arte e mapas) | [F3][F37] |
| Carimbo/assinatura de formato | 4 bytes | provavelmente 0xFD23EC43 segundo comentário do UOFiddler | [F3][F37] |
| Offset do primeiro bloco da tabela | 8 bytes | | [F3] |
| Capacidade do bloco | 4 bytes | entradas por bloco; cerca de 100 (versão 4) ou 1000 (versão 5) no empacotador do UOFiddler | [F3][F37] |
| Número total de arquivos | 4 bytes | os leitores ignoram e somam os blocos | [F3][F35] |

Total dos campos: 28 bytes [F3]. **Conflito/nuance:** o empacotador do UOFiddler põe o primeiro bloco logo depois de um cabeçalho de 0x28 (40) bytes nos arquivos versão 4 [F37], o que sugere preenchimento entre os 28 bytes de campos e a tabela (inferência). Leitor correto deve sempre seguir o offset do cabeçalho, nunca presumir posição fixa (inferência).

### 2.3 Tabela de blocos

Cada bloco começa com a quantidade de entradas (4 bytes) e o offset do próximo bloco (8 bytes); a cadeia termina quando o próximo offset é zero, e os blocos podem estar espalhados pelo arquivo [F3][F35]. Cada entrada tem 34 bytes:

| Campo | Tamanho | Uso | Fonte |
|---|---|---|---|
| Offset dos dados | 8 bytes | zero = posição vazia (ignorar) | [F3][F35] |
| Tamanho do cabeçalho da entrada | 4 bytes | os dados úteis começam em offset + este valor | [F3] |
| Tamanho comprimido | 4 bytes | usado quando há compressão | [F3] |
| Tamanho descomprimido | 4 bytes | | [F3] |
| Hash do nome | 8 bytes | chave de busca (ver 2.4) | [F3] |
| Hash dos dados | 4 bytes | Adler-32; não validado pelos leitores | [F3][F37] |
| Flag de compressão | 2 bytes | 0 = nenhuma; 1 = zlib; 3 = "Mythic" (zlib + transformada); 2 não definido | [F3][F37][F38] |

Detalhes do UOFiddler sobre o cabeçalho de cada entrada (os bytes entre o offset e os dados úteis): na versão 4, 12 bytes (dois inteiros curtos com valores 3 e 8 e um carimbo FILETIME), e o hash de dados é o Adler-32 desses 12 bytes, não do conteúdo; na versão 5, os arquivos oficiais trazem cabeçalhos de 135 a 137 bytes com um bloco de assinatura que o empacotador não reproduz, e o hash é o Adler-32 do conteúdo [F37].

**Conflito sobre a compressão 3:** o ClassicUO chama de "zlib com BWT" (transformada de Burrows-Wheeler) [F3][F10]; o UOFiddler chama de "Mythic", descrita como zlib embrulhando um fluxo Mythic [F37][F38]. Provavelmente é o mesmo esquema visto por nomes diferentes (inferência). O `Cliloc` novo também usa um decodificador BWT, detectado pelo byte 3 do arquivo valendo 0x8E [F19].

### 2.4 Como o nome vira hash (em palavras)

1. Monta-se o "caminho lógico" da entrada a partir de um modelo: prefixo `build/`, o nome do arquivo legado em minúsculas sem extensão, uma barra, o id formatado com zeros à esquerda e uma extensão. Exemplos de modelo (forma descrita, não código): arte usa oito dígitos e extensão `.tga`; gumps, oito dígitos e `.tga`; mapas, `build/map{N}legacymul/` com oito dígitos e `.dat`; sons, oito dígitos e `.dat`; multis, `build/multicollection/` com seis dígitos e `.bin`; animações, `build/animationlegacyframe/` + corpo com seis dígitos + barra + ação com dois dígitos + `.bin`; `tileart`, `build/tileart/` com oito dígitos e `.bin` [F5][F6][F7][F13][F12][F10][F27][F37].
2. O texto é passado a uma função de hash não criptográfica da família **lookup3, variante hashlittle2, de Bob Jenkins** (domínio público) [F37][F58]. O ClassicUO não nomeia o algoritmo, mas a estrutura bate: três palavras de estado de 32 bits começam com a constante 0xDEADBEEF somada ao comprimento do texto; o texto é consumido em fatias de 12 bytes (três grupos de 4) com uma mistura reversível de somas, subtrações, ou-exclusivos e rotações; os 1 a 12 bytes finais são empacotados nas três palavras e passam por uma mistura final; o resultado de 64 bits junta duas palavras de 32 bits, uma na metade alta e outra na baixa [F3][F58]. Caso de texto vazio tem saída especial [F3].
3. O leitor percorre todos os ids possíveis, calcula o hash de cada caminho e associa a entrada do `.uop` cujo hash bater; o resto fica como "sem dados" [F3][F35].

Armadilhas:

- **Maiúsculas importam.** O hash do ClassicUO não converte para minúsculas; os modelos já são escritos em minúsculas [F3]. O UOFiddler converte o nome do arquivo para minúsculas antes [F35].
- **Gump 9834** usa nome com sete dígitos em vez de oito no arquivo oficial, segundo o empacotador do UOFiddler [F37].
- O ClassicUO trata cada caractere como unidade UTF-16 sem conversão; para texto ASCII isso equivale a bytes [F3].
- Um fórum do UOX3 credita a descoberta dos dois hashes (Adler32 e HashLittle2) a um "Mythic LegacyMul Convertor" (fonte vista só no resumo do buscador) [F57].

### 2.5 Particularidades por arquivo `.uop`

| Arquivo | Conteúdo por entrada | Fonte |
|---|---|---|
| `artLegacyMUL.uop` | um registro de arte, igual ao do `art.mul` | [F5][F36] |
| `gumpartLegacyMUL.uop` | registro de gump; quando não comprimido, os 8 primeiros bytes do conteúdo são largura e altura (dois inteiros de 32 bits); quando comprimido, largura e altura vêm no início do conteúdo descomprimido | [F3][F6][F35][F37] |
| `map{N}LegacyMUL.uop` | um pedaço de 0xC4000 bytes = 4096 blocos de 196 bytes; o bloco b fica no pedaço b ÷ 4096, posição b mod 4096; o último pedaço pode ser curto | [F7][F37] |
| `soundLegacyMUL.uop` | registro de som igual ao do `sound.mul` | [F13][F36] |
| `MultiCollection.uop` | por multi: 4 bytes ignorados, contagem de componentes, e para cada componente um registro de 14 bytes seguido de uma lista de inteiros de 4 bytes; inclui uma entrada especial `housing.bin` | [F12][F37] |
| `AnimationFrame*.uop` | uma entrada por corpo e ação (ver seção 7.5) | [F10][F38] |
| `AnimationSequence.uop` | remapeamento de grupos de animação por corpo | [F10][F38] |
| `tileart.uop` | registros versão 4 com propriedades estendidas de tile, comprimidos em zlib | [F27] |
| `string_dictionary.uop` | tabela de textos UTF-8 com prefixo de 16 bits | [F28] |
| `MainMisc.uop` | o ClassicUO só usa a existência dele para decidir que a instalação é UOP | [F4] |

---

## 3. Par índice + dados (`*idx.mul` / `*.idx` + `*.mul`)

| Campo da entrada de índice | Tamanho | Significado | Fonte |
|---|---|---|---|
| Offset | 4 bytes | posição do registro no `.mul` | [F17] |
| Tamanho | 4 bytes | tamanho do registro | [F17] |
| Extra | 4 bytes | uso varia por arquivo (dimensões de gump e luz, id de som etc.) | [F17][F43] |

- Número de entradas = tamanho do arquivo de índice ÷ 12 [F17].
- **Entrada inválida:** o UOFiddler grava offset −1, tamanho 0 (ou −1) e extra −1 para posições vazias e trata offset/tamanho ≤ 0 como bloco vazio [F42][F44]. O ClassicUO não testa explicitamente esses marcadores no leitor de índice, mas os carregadores descartam tamanho zero ou negativo [F15][F16][F17].
- **Campo extra como dimensões:** para gumps, largura na metade alta (16 bits superiores) e altura na metade baixa, tanto no ClassicUO quanto no UOFiddler [F17][F35][F37]. Para luzes há conflito (ver seção 9.3).
- No `soundidx.mul`, o UOFiddler grava id + 1 no campo extra ao salvar [F43].
- O UOFiddler usa o tamanho do `artidx.mul` como "assinatura de época": ≥ 0x13FDC entradas = High Seas; exatamente 0xC000 = Stygian Abyss; menos = Mondain's Legacy ou anterior [F42].

---

## 4. Mapas

### 4.1 `map{N}.mul` (terreno)

| Item | Valor | Fonte |
|---|---|---|
| Tamanho do bloco | 8×8 células | [F7][F44] |
| Bytes por bloco | 196 = cabeçalho de 4 bytes + 64 células × 3 bytes | [F7][F44] |
| Célula | id do tile de terreno (2 bytes) + z com sinal (1 byte) | [F7][F44] |
| Cabeçalho do bloco | sem significado conhecido; o valor varia e os leitores ignoram | [F44] |
| Ordem dos blocos | por coluna: índice = x_do_bloco × altura_em_blocos + y_do_bloco | [F7][F44] |
| Ordem das células no bloco | por linha: índice = (y mod 8) × 8 + (x mod 8) | [F44] |

**Armadilha:** blocos em ordem de coluna e células em ordem de linha. Errar uma das duas dá um mapa transposto ou embaralhado em fatias de 8 (inferência).

### 4.2 Dimensões padrão (em células)

| Mapa | Largura × altura | Observação | Fonte |
|---|---|---|---|
| 0 (Felucca / Britannia original) | 7168 × 4096; 6144 × 4096 em clientes antigos ou quando o arquivo tem 393.216 blocos | | [F7] |
| 1 (Trammel) | 7168 × 4096 (ou 6144) | | [F7] |
| 2 (Ilshenar) | 2304 × 1600 | | [F7] |
| 3 (Malas) | 2560 × 2048 | | [F7] |
| 4 (Tokuno) | 1448 × 1448 | | [F7] |
| 5 (Ter Mur) | 1280 × 4096 | | [F7] |

Os nomes das facetas entre parênteses são conhecimento geral, não vindos das fontes (inferência). 6144 × 4096 = 768 × 512 blocos = 393.216 blocos, o mesmo número que o ClassicUO usa para reconhecer o mapa antigo [F7]; a conta do arquivo é 393.216 × 196 bytes (inferência aritmética). Para o Outrora (T2A), só o mapa 0 no tamanho 6144 × 4096 interessa (inferência). As Lost Lands, região acrescentada pelo T2A [F51][F52], ficam dentro desse mesmo mapa 0 (inferência; nenhuma fonte aberta confirmou as coordenadas — ver lacunas). O ClassicUO aceita também uma sequência de configuração que redefine quantidade e dimensões dos mapas [F7].

### 4.3 `staidx{N}.mul` + `statics{N}.mul`

- O índice tem uma entrada de 12 bytes por bloco, na mesma ordem de coluna do mapa [F7][F44].
- Cada static ocupa 7 bytes: id do gráfico (2), x (1), y (1), z com sinal (1), hue (2) [F7][F44].
- x e y são posições dentro do bloco (0 a 7) [F44].
- O ClassicUO limita 1024 statics por bloco [F7].
- Os statics vêm em ordem de arquivo, sem ordenação; a ordem de desenho é decidida depois (seção 11) [F44].
- O id do static indexa a seção de statics do `tiledata` e a arte de statics (deslocada em 0x4000 no índice de arte) [F5][F42].

### 4.4 Patches de mapa e `verdata.mul`

- **Patches de mapa** (clientes posteriores): `mapdifl{N}.mul` lista os índices de blocos substituídos e `mapdif{N}.mul` traz os blocos novos; para statics, `stadifl`, `stadifi` e `stadif` fazem o mesmo com índice e dados [F7].
- **`verdata.mul`:** cabeçalho com a quantidade de patches (4 bytes) e, para cada patch, 20 bytes em cinco inteiros de 4 bytes: id do arquivo alvo, índice/bloco dentro dele, offset dos dados do patch no próprio `verdata.mul`, tamanho e extra [F31]. O id do arquivo segue esta tabela [F18][F31]:

| Id | Arquivo | Id | Arquivo |
|---|---|---|---|
| 0 | map0.mul | 9 | texidx.mul |
| 1 | staidx0.mul | 10 | texmaps.mul |
| 2 | statics0.mul | 11 | gumpidx.mul |
| 3 | artidx.mul | 12 | gumpart.mul |
| 4 | art.mul | 13 | multi.idx |
| 5 | anim.idx | 14 | multi.mul |
| 6 | anim.mul | 15 | skills.idx |
| 7 | soundidx.mul | 16 | skills.mul |
| 8 | sound.mul | 30 | tiledata.mul |
| | | 31 | animdata.mul |

(O ClassicUO trata ainda o id 32 como grupo de hues [F4].)

**Conflito sobre quando o `verdata` vale:** o ClassicUO força o uso para versões abaixo de 5.0.0a e também o usa sempre que o arquivo existir e tiver patches [F4]; um tópico do fórum POL de 2006 diz que clientes novos já não liam o `verdata` [F46]; outro trecho de fórum cita "por volta de 4.0.7/4.0.9" (fonte vista só no resumo do buscador, sem página aberta). Para a era T2A o `verdata` precisa ser aplicado: era o canal de patches da época (inferência apoiada em [F4] e [F46]). O ClassicUO também tem a opção `use_verdata` nas configurações [F29].

---

## 5. Arte, texturas e gumps

### 5.1 Formato de cor de 16 bits

| Fonte | Leitura |
|---|---|
| ClassicUO | vermelho nos bits 10–14, verde 5–9, azul 0–4; cada canal de 5 bits é expandido para 8 bits por tabela de 32 valores (não linear); o bit 15 é ignorado [F22] |
| UOFiddler | trata como ARGB1555 e usa o bit 15 como "opaco": acende o bit nos pixels lidos e o inverte (ou-exclusivo com 0x8000) ao ler paletas e runs [F34][F38][F42] |
| uo-rust-libs | "555" com o bit alto sem uso [F50] |

Conclusão: no arquivo o valor é RGB555 e o bit 15 não carrega cor; a transparência vem da estrutura (pixel não escrito, ou cor 0 em gumps), não de um canal alfa (inferência que concilia [F22], [F42] e [F50]). **Armadilha:** o ClassicUO usa uma tabela de expansão própria; quem quiser reproduzir as cores exatamente precisa decidir entre expansão linear e por tabela (inferência a partir de [F22]).

### 5.2 `art.mul` — terreno (ids 0x0000–0x3FFF)

- Imagem fixa de 44×44 px em forma de losango, sem cabeçalho nem compressão [F5][F42].
- Só os pixels do losango estão gravados: 1012 pixels = 2024 bytes [F5].
- As 22 linhas de cima crescem de 2 em 2 pixels (2, 4, …, 44), centradas; as 22 de baixo encolhem de 44 a 2 [F5][F42].
- Os cantos fora do losango são transparentes; dentro do losango, preto é preto (não há transparência) [F5].

### 5.3 `art.mul` — statics (ids a partir de 0x4000 no índice)

| Parte | Conteúdo | Fonte |
|---|---|---|
| Cabeçalho | 4 bytes de flag/desconhecido, largura (2 bytes), altura (2 bytes) | [F5][F42] |
| Tabela de linhas | um valor de 16 bits por linha, contado em palavras de 16 bits a partir do fim da tabela | [F5][F42] |
| Linha | sequência de runs: deslocamento em x (16 bits), comprimento (16 bits), e esse número de pixels de 16 bits | [F5][F42] |
| Fim de linha | deslocamento e comprimento iguais a zero | [F5][F42] |

- Pixels pulados são transparentes; o ClassicUO também trata cor 0 dentro de um run como transparente [F5].
- O UOFiddler grava 1234 como valor placeholder dos 4 primeiros bytes ao salvar [F42].
- Limites do ClassicUO: rejeita larguras/alturas fora de 1 a 1024 em arte avulsa e interrompe a linha quando deslocamento + comprimento chega a 2048 [F5].
- Quantidade máxima de statics por época, segundo o UOFiddler: 0x3FFF até Mondain's Legacy, 0x7FFF no Stygian Abyss, 0xFFDC no High Seas [F42]. Para T2A, valem os ids até 0x3FFF (inferência a partir de [F42]).
- O ClassicUO aceita ainda arquivos avulsos `.art` em `Art/Statics` e `Art/Land`, que sobrepõem o pacote [F5], e um `art.def` que preenche ids ausentes copiando de outros [F4].

### 5.4 `texmaps.mul` + `texidx.mul`

- Texturas quadradas usadas para desenhar terreno "esticado" (seção 11.3) [F16][F26].
- O tamanho vem do tamanho do registro: 0x2000 bytes = 64×64; 0x8000 bytes = 128×128 [F16].
- Pixels de 16 bits, linha a linha, sem preenchimento [F16].
- O id da textura de cada terreno vem do campo de textura do `tiledata` [F8][F26].
- `TexTerr.def`, opcional, cria apelidos entre ids de textura [F16].

### 5.5 `gumpart.mul` + `gumpidx.mul`

- Dimensões no campo extra do índice (largura alta, altura baixa) [F17][F35]; no `.uop`, num cabeçalho de 8 bytes antes dos dados (seção 2.5) [F3][F37].
- Dados: tabela com um offset de 32 bits por linha, contado em unidades de 4 bytes desde o início da tabela; cada linha é uma sequência de pares (cor de 16 bits, comprimento de 16 bits); o tamanho da linha sai da diferença para o offset da próxima linha (ou o fim dos dados na última) [F6].
- Cor 0 = transparente [F6].
- Limites do ClassicUO: até 0x10000 ids e dimensões até 4096 px [F6]. Nomes com maiúscula inicial (`Gumpart.mul`, `Gumpidx.mul`) também são aceitos [F6].

### 5.6 `hues.mul`

| Item | Valor | Fonte |
|---|---|---|
| Cabeçalho de arquivo | nenhum | [F9] |
| Grupo | cabeçalho de 4 bytes + 8 entradas | [F9][F54] |
| Entrada (88 bytes) | 32 cores de 16 bits (64 bytes), início da faixa (2), fim da faixa (2), nome (20) | [F9][F54] |
| Grupo | 4 + 8 × 88 = 708 bytes | [F9] |
| Quantidade | tamanho do arquivo ÷ 708 × 8; o guia antigo do Wolfpack fala em 375 grupos (3000 hues) | [F9][F54] |

- O id de hue começa em 1; 0 significa "sem hue". Grupo = (id − 1) ÷ 8; entrada = (id − 1) mod 8 [F9].
- **Aplicar a hue:** os 5 bits de vermelho (10–14) do pixel original servem de índice (0–31) nas 32 cores da entrada, e a cor resultante substitui o pixel [F9]. Ou seja, a arte é desenhada em tons de cinza e a hue funciona como rampa de cor (inferência a partir de [F9]).
- **Hue parcial:** só pixels cinzentos (vermelho = verde = azul) são trocados; os outros mantêm a cor [F9]. Statics marcados com a flag PartialHue no `tiledata` usam esse modo (inferência a partir do nome da flag em [F8]).
- Os campos de início e fim de faixa e o nome são lidos mas não usados pelo ClassicUO [F9].

---

## 6. `tiledata.mul`

### 6.1 Estrutura

O arquivo não tem índice: primeiro vêm 512 grupos de terreno, depois quantos grupos de statics couberem; cada grupo tem 4 bytes de cabeçalho (ignorados) e 32 entradas [F8][F41][F54].

| Seção | Campo | Antigo (< 7.0.9.0) | Novo (≥ 7.0.9.0) | Fonte |
|---|---|---|---|---|
| Terreno | flags | 4 bytes | 8 bytes | [F8][F41] |
| Terreno | id da textura (`texmaps`) | 2 bytes | 2 bytes | [F8] |
| Terreno | nome | 20 bytes | 20 bytes | [F8] |
| Terreno | **total da entrada** | **26** | **30** | [F8][F41] |
| Statics | flags | 4 bytes | 8 bytes | [F8] |
| Statics | demais campos | 33 bytes | 33 bytes | [F8][F41] |
| Statics | **total da entrada** | **37** | **41** | [F8][F41] |

Tamanho do grupo de terreno: 836 bytes (antigo) ou 964 (novo); de statics: 1188 ou 1316 [F8]. Número de statics = (tamanho do arquivo − seção de terreno) ÷ tamanho do grupo × 32 [F8][F41].

**Conflito na divisão dos 33 bytes dos statics:**

| Leitor | Divisão dos campos após as flags |
|---|---|
| ClassicUO [F8] | peso (1), camada (1), contagem (4), id de animação (2), hue (2), índice de luz (2), altura (1), nome (20) |
| UOFiddler [F41] | peso (1), qualidade/camada (1), "misc" (2), desconhecido (1), quantidade (1), animação (2), desconhecido (1), hue (1), deslocamento de empilhamento (1), valor (1), altura (1), nome (20) |
| Guia Wolfpack (fonte vista só no resumo do buscador) [F54] | peso, qualidade, quantidade, animação (id de corpo), hue, altura, nome; quantidade vira "classe da arma" em armas |

Os três concordam no total e em peso, animação, altura e nome; divergem nos bytes do meio. Para o Outrora o que importa (peso, camada, animação, altura, nome) coincide nas posições (inferência a partir da comparação das três divisões).

**Conflito na detecção do formato:** o ClassicUO decide pela versão do cliente (7.0.9.0) [F8]; o UOFiddler decide pelo tamanho do `artidx.mul` (≥ 0x13FDC entradas = High Seas) [F41][F42]. Uma alternativa robusta (inferência) é testar qual tamanho de entrada divide o restante do arquivo de forma exata.

**Nomes:** 20 bytes sem garantia de terminador nulo [F8].

### 6.2 Flags (bits)

| Bit (hex) | Nome | Bit (hex) | Nome |
|---|---|---|---|
| 0x00000001 | Background | 0x00010000 | Internal |
| 0x00000002 | Weapon | 0x00020000 | Foliage |
| 0x00000004 | Transparent | 0x00040000 | PartialHue |
| 0x00000008 | Translucent | 0x00080000 | NoHouse |
| 0x00000010 | Wall | 0x00100000 | Map |
| 0x00000020 | Damaging | 0x00200000 | Container |
| 0x00000040 | Impassable | 0x00400000 | Wearable |
| 0x00000080 | Wet | 0x00800000 | LightSource |
| 0x00000100 | (desconhecido) | 0x01000000 | Animation |
| 0x00000200 | Surface | 0x02000000 | NoDiagonal |
| 0x00000400 | Bridge | 0x04000000 | (desconhecido) |
| 0x00000800 | Generic (empilhável) | 0x08000000 | Armor |
| 0x00001000 | Window | 0x10000000 | Roof |
| 0x00002000 | NoShoot | 0x20000000 | Door |
| 0x00004000 | ArticleA | 0x40000000 | StairBack |
| 0x00008000 | ArticleAn | 0x80000000 | StairRight |

Só no formato de 64 bits: AlphaBlend (bit 32), UseNewArt (33), ArtUsed (34), NoShadow (36), PixelBleed (37), PlayAnimOnce (38), MultiMovable (40) [F8][F41]. Fonte da tabela: [F8], com nomes coincidentes em [F41]; o guia Wolfpack lista a mesma faixa de Background a LightSource (fonte vista só no resumo do buscador) [F54].

---

## 7. Animações

### 7.1 `anim*.mul` + `anim*.idx` — índice

- Entrada de índice de 12 bytes; cada ação guarda **5 direções**, então uma ação ocupa 5 entradas [F10][F34].
- Tipos de corpo e quantidade de ações (grupos) [F10][F34]:

| Tipo | Ações | Faixa de corpo no `anim.mul` | Primeira entrada do corpo |
|---|---|---|---|
| Monstro ("high detail") | 22 | 0–199 | corpo × 110 |
| Animal ("low detail") | 13 | 200–399 | 22000 + (corpo − 200) × 65 |
| Humano e equipamento ("people") | 35 | ≥ 400 | 35000 + (corpo − 400) × 175 |

(110 = 22 × 5, 65 = 13 × 5, 175 = 35 × 5; 22000 = 200 × 110 e 35000 = 22000 + 200 × 65 — inferência aritmética.)

- Os outros arquivos (`anim2` a `anim5`) usam faixas diferentes; o `anim3` é o único com corte em 300; o `anim2` não tem faixa de humanos; o `anim5` tem uma exceção para o corpo 34 [F10][F34]. **Conflito pequeno:** o ClassicUO descreve o `anim3` como animais abaixo de 300, monstros de 300 a 399 e humanos a partir de 400 [F10]; o UOFiddler dá as mesmas faixas com a fórmula do meio começando em 33000 [F34]. Não há divergência real, só nível de detalhe diferente. Para T2A, só o `anim.mul` interessa (inferência).
- O tipo também pode vir do `mobtypes.txt` (ver 7.4) [F10].

### 7.2 `anim*.mul` — dados de uma direção de uma ação

| Parte | Conteúdo | Fonte |
|---|---|---|
| Paleta | 256 cores de 16 bits (512 bytes) | [F10][F34] |
| Quantidade de quadros | 4 bytes | [F10] |
| Tabela de offsets | um offset de 4 bytes por quadro, contado a partir do fim da paleta | [F10][F34] |
| Cabeçalho do quadro | centro x, centro y, largura, altura (16 bits com sinal cada) | [F10][F34] |
| Pixels | sequência de runs: cabeçalho de 32 bits + um byte de índice de paleta por pixel | [F10][F34] |
| Fim | valor 0x7FFF7FFF | [F10][F34] |

Cabeçalho do run: comprimento nos 12 bits baixos (0–11), y nos 10 bits seguintes (12–21) e x nos 10 bits altos (22–31), ambos com sinal de 10 bits; o x é somado ao centro x e o y ao centro y + altura [F10][F34]. O UOFiddler aplica uma máscara de ou-exclusivo ao cabeçalho e à paleta como convenção interna [F34]. Quadro com largura ou altura zero não tem pixels [F10].

### 7.3 Direções e espelhamento

As direções 0 a 4 estão gravadas; as direções 5, 6 e 7 são as gravadas 3, 2 e 1 espelhadas na horizontal, e o centro x também é espelhado (largura − centro x) [F34]. O ClassicUO lê só as 5 gravadas no carregador e espelha em outro ponto [F10].

### 7.4 Arquivos de definição

| Arquivo | Papel | Colunas / regra | Fonte |
|---|---|---|---|
| `body.def` | substitui um corpo por outro quando o original não existe | corpo, lista de corpos substitutos entre chaves, hue; usa o terceiro valor da lista se houver, senão o primeiro; vale a partir de 3.0 | [F10] |
| `bodyconv.def` | diz em qual `anim{N}.mul` está cada corpo | índice + colunas para anim1…anim5; negativo = ausente | [F10] |
| `corpse.def` | igual ao `body.def`, para cadáveres | | [F10] |
| `equipconv.def` | troca gráfico de equipamento conforme o corpo | corpo, gráfico original, gráfico novo, gump, hue | [F10] |
| `mobtypes.txt` | tipo de cada corpo: monster, sea_monster, animal, human, equipment + flags hex; `#` comenta | lido a partir de 5.0.0a | [F10] |
| `Anim1.def`, `Anim2.def` | remapeamento de grupos | grupo, grupo substituto | [F10] |

Um guia do fórum do UOFiddler associa os prefixos H, L e P a monstro, animal e equipamento, definidos no `mobtypes.txt` (fonte vista só no resumo do buscador; não aberta) — coerente com [F10].

### 7.5 `AnimationFrame*.uop` e `AnimationSequence.uop`

- Uma entrada por corpo e ação (nome descrito na seção 2.4) [F10][F38].
- O ClassicUO procura até 10 arquivos `AnimationFrame` [F10].
- Conteúdo descomprimido: 32 bytes iniciais não interpretados por nenhum dos dois leitores; depois a quantidade de quadros (4 bytes) e o offset da tabela de quadros (4 bytes) [F10][F38].
- Registro de quadro de 16 bytes: grupo (2), id do quadro começando em 1 (2), 8 bytes desconhecidos, offset dos pixels (4) relativo ao próprio registro [F10][F38].
- Quadros por direção = total ÷ 5 (arredondado); direção = (id − 1) ÷ quadros por direção [F10][F38]. Equipamento tem no mínimo 10 quadros por direção no ClassicUO [F10].
- Cada quadro tem a própria paleta de 256 cores antes dos pixels, e o run usa a mesma codificação do `.mul` [F10][F38].
- **`AnimationSequence.uop`** (ClassicUO só lê acima de 6.0.1.44): por corpo, id da animação (4 bytes), 48 bytes, contagem de grupos e registros (grupo antigo, quantidade de quadros, grupo novo); com zero quadros, o grupo antigo passa a usar o novo [F10]. **Conflito:** o ClassicUO pula 60 bytes fixos depois desses campos (registro de 72 bytes) [F10]; o UOFiddler afirma que o passo fixo de 72 bytes só funciona quando duas listas finais de tamanho variável estão vazias, e lê uma parte fixa de 64 bytes seguida das duas listas (registros de 32 bytes e inteiros de 4 bytes), citando os corpos 400, 666 e 1253 como exemplos com listas [F38].
- Uma mantenedora do UOFiddler disse em 2012 que as animações em formato novo já existiam desde o Stygian Abyss (6.x) [F56].
- Um campo "AMOU" de assinatura, citado em algumas descrições informais, não aparece em nenhum dos leitores consultados (lacuna; não verificado).

### 7.6 `animdata.mul` (animação de itens)

- Grupos de cabeçalho de 4 bytes + 8 entradas de 68 bytes (548 bytes por grupo) [F11].
- Entrada: 64 deslocamentos de quadro com sinal (1 byte cada), um byte desconhecido, quantidade de quadros, intervalo entre quadros e início [F11].
- Posição da entrada do item g: grupo = g ÷ 8, entrada = g mod 8, offset = grupo × 548 + 4 + entrada × 68 [F11].
- O guia Wolfpack (fonte vista só no resumo do buscador) traz 2048 blocos e uma fórmula com "id & 15" no lugar de "id & 7" [F54]. **Conflito:** com 8 entradas por grupo, a máscara correta é 7; o 15 provavelmente é erro de digitação do guia (inferência).
- Itens animados são os que têm a flag Animation no `tiledata` (inferência a partir do nome da flag em [F8]).

---

## 8. Som, multis, luz, radar, perícias, textos e fontes

### 8.1 `sound.mul` + `soundidx.mul`

- Cada registro começa com 40 bytes de nome (ASCII/UTF-8, terminado em nulo) e logo depois as amostras PCM, sem cabeçalho WAV [F13][F43].
- Formato das amostras: PCM, mono, 16 bits, 22.050 Hz [F43]. O ClassicUO usa esse mesmo formato como saída fixa e como exigência para WAV avulso [F13].
- `Sound.def` cria apelidos para ids sem dados; não substitui som existente [F13][F43].
- **Conflito no máximo de ids:** 0xFFFF no ClassicUO (com nota de que o arquivo oficial para por volta de 1666 ids) [F13]; 0xFFF no UOFiddler [F43].
- Música: `Music/Digital/Config.txt` a partir de 4.0.11c, `Music/Config.txt` antes; cada linha tem índice, nome da faixa e "loop" opcional; arquivos `.mp3` [F13]. (Na era T2A a música pode ter sido em outro formato; não verificado — lacuna.)

### 8.2 `multi.mul` + `multi.idx` (casas e barcos)

| Época | Registro de componente | Fonte |
|---|---|---|
| Antes de 7.0.9.0 | 12 bytes: id do item (2), deslocamento x (2, com sinal), y (2), z (2), flags (4); visível quando as flags são diferentes de zero | [F12] |
| A partir de 7.0.9.0 | 16 bytes: os mesmos 8 bytes iniciais, flags de 2 bytes, 4 bytes desconhecidos, 2 bytes de preenchimento; visível quando flags = 0 ou 0x100 | [F12] |

- Quantidade de componentes = tamanho do registro ÷ tamanho do componente [F12].
- Máximo no ClassicUO: 0x2200 multis [F12].
- No `MultiCollection.uop`, a flag 0x0001 corresponde ao inverso da flag do `.mul` e 0x0100 ao campo extra; a lista de inteiros após cada componente vem de um arquivo à parte no empacotador do UOFiddler [F37].

### 8.3 `light.mul` + `lightidx.mul`

- Um byte por pixel, linha a linha; valores de −31 a 31; negativos gravados com bits invertidos [F14][F39].
- O ClassicUO usa o módulo (0–31) como intensidade em tons de cinza e trata 0 como transparente [F14]; o UOFiddler soma 31 ao valor e põe o resultado nos três canais [F39].
- Máximo no ClassicUO: 100 luzes [F14]; o guia Wolfpack também cita 100 entradas (fonte vista só no resumo do buscador) [F54].
- **Conflito na largura e altura:** o UOFiddler lê a largura nos 16 bits baixos e a altura nos altos do campo extra (com um comentário no próprio código duvidando da ordem) [F39]; o leitor genérico de índice do ClassicUO, usado para luzes, faz o contrário (largura nos altos) [F14][F17]; o guia Wolfpack em C# concorda com o UOFiddler (largura baixa, altura alta), e a versão mais antiga do guia descreve dois campos de 16 bits "largura, altura" no lugar do extra (ambas vistas só no resumo do buscador) [F54]. Recomendação: validar contra o tamanho do registro (largura × altura deve ser igual ao tamanho) e, se as luzes forem quadradas, a dúvida não importa (inferência).

### 8.4 `radarcol.mul`

- Sequência de cores de 16 bits sem cabeçalho; quantidade = tamanho ÷ 2 [F40].
- Índices 0x0000–0x3FFF são terrenos (pelo id); statics começam em 0x4000 (id + 0x4000) [F40].
- O ClassicUO lê no mesmo carregador das hues [F9].

### 8.5 `skills.mul` + `Skills.idx`

- Cada registro: 1 byte (diferente de zero = perícia tem ação/botão) + nome em ASCII terminado em nulo [F15].
- A quantidade de perícias é o número de entradas de índice com tamanho positivo [F15].

### 8.6 `cliloc.*` (textos localizados)

- Nome: `Cliloc.` + código do idioma (ex.: `Cliloc.enu`); o ClassicUO carrega o inglês primeiro e sobrepõe o idioma escolhido [F19].
- Estrutura: cabeçalho de 4 + 2 bytes; depois entradas com número (4 bytes), flag (1 byte), tamanho (2 bytes) e texto UTF-8 [F19].
- Arquivos novos vêm comprimidos com BWT, detectado pelo byte de posição 3 igual a 0x8E [F19].
- Parâmetros no texto: marcas entre til como `~1_NOME~`, numeradas a partir de 1; os argumentos chegam separados por tabulação; argumento iniciado por `#` é outro número de cliloc [F19].
- O ClassicUO aceita um `Clilocs.txt` avulso para textos extras, sugerindo números acima de 3.100.000 [F19].

### 8.7 Fontes

- **`fonts.mul`:** sequência de fontes; cada uma tem 1 byte de cabeçalho e 224 caracteres a partir de 0x20; cada caractere tem largura (1 byte), altura (1 byte), 1 byte não usado e pixels de 16 bits [F20].
- **`unifont*.mul`:** tabela de 0x10000 offsets de 4 bytes (um por código de 16 bits; 0 = sem glifo); cada glifo tem deslocamento x, deslocamento y, largura e altura (bytes com sinal) e bitmap de 1 bit por pixel, cada linha arredondada para byte inteiro, bit mais significativo primeiro [F20]. O ClassicUO procura de `unifont.mul` até `unifont19.mul` [F20].

---

## 9. Conflitos e divergências entre fontes (consolidado)

| Tema | Lado A | Lado B |
|---|---|---|
| Quando o cliente virou `.uop` | ClassicUO: ≥ 7.0.0.0 + `MainMisc.uop`; enum marca 7.0.24.0 [F4][F21] | UOX3: 7.0.24.2 [F55]; fórum POL: 7.0.24.x, com animações novas desde 6.x [F56] |
| Compressão tipo 3 | "zlib + BWT" [F3][F10] | "Mythic", zlib embrulhando fluxo Mythic [F37][F38] |
| Início da tabela `.uop` | 28 bytes de campos [F3] | primeiro bloco após cabeçalho de 0x28 bytes (v4) [F37] |
| Bit 15 da cor | ignorado [F22][F50] | usado como "opaco" interno (ARGB1555) [F42][F38] |
| Detecção do `tiledata` novo | versão ≥ 7.0.9.0 [F8] | tamanho do `artidx.mul` ≥ 0x13FDC entradas [F41][F42] |
| Campos centrais do static no `tiledata` | contagem 4 bytes, hue 2, luz 2 [F8] | misc 2, desconhecidos, hue 1, empilhamento 1, valor 1 [F41] |
| Largura/altura de `light` | largura nos 16 bits altos [F14][F17] | largura nos 16 bits baixos [F39][F54] |
| Fórmula do `animdata` | máscara 7 [F11] | máscara 15 (guia antigo) [F54] |
| Registro do `AnimationSequence` | passo fixo de 72 bytes [F10] | 64 bytes fixos + duas listas variáveis [F38] |
| `verdata.mul` | ClassicUO força abaixo de 5.0.0a e usa sempre que houver patches [F4] | fórum: clientes "novos" (2006) não leem [F46] |
| Máximo de sons | 0xFFFF [F13] | 0xFFF [F43] |
| Licença do ClassicUO | LICENSE.md: BSD 2-Clause [F2] | README: "BSD 4 license" [F1] |

---

## 10. Como clientes de terceiros acham a instalação e a versão

### 10.1 Pasta de instalação

- **Ultima SDK (UOFiddler):** percorre 17 chaves do registro do Windows sob `SOFTWARE`, da mais antiga para a mais nova — começando por `Origin Worlds Online\Ultima Online\1.0` e `...\Ultima Online Third Dawn\1.0`, passando por várias chaves `EA GAMES` de Samurai Empire e Mondain's Legacy, e terminando em `Electronic Arts\EA Games\Ultima Online Stygian Abyss Classic` e `Electronic Arts\EA Games\Ultima Online Classic`. Em Windows de 64 bits, prefixa `Wow6432Node\`. Tenta primeiro HKEY_LOCAL_MACHINE e depois HKEY_CURRENT_USER, e dentro da chave lê os valores `ExePath`, `Install Dir` e `InstallDir`; se o valor for um arquivo, usa a pasta dele. Vale a primeira chave que apontar para algo existente [F33].
- **ClassicUO:** não procura no registro; a pasta vem do campo `ultimaonlinedirectory` do `settings.json` (padrão vazio) ou do argumento de linha de comando equivalente (documentado no fork TazUO como `-ultimaonlinedirectory` ou `-uopath`) [F29][F53]. Os nomes de arquivo são resolvidos contra essa pasta; fora do Windows, se o nome exato não existir, procura sem diferenciar maiúsculas [F4]. Há também um mapa de substituição de arquivos (`files_override`/`-filesoverride`) [F29][F53].
- Para a era T2A, a chave relevante seria `Origin Worlds Online\Ultima Online\1.0` (inferência a partir de [F33], dado que é a primeira e mais antiga da lista).

### 10.2 Versão do cliente

- **ClassicUO:** a versão é um inteiro de 32 bits com um byte para cada parte (maior, menor, build, revisão/letra) [F21]. Pode vir do campo `clientversion` do `settings.json` ou do argumento `-clientversion` [F29][F53]; há também uma rotina que lê o `client.exe` como bytes, procura o marcador "VS_VERSION_INFO" em UTF-16 e lê os quatro números de versão 42 bytes depois [F21]. Um fórum de shard diz que o lançador autodetecta a versão (fonte não aberta além do resumo do buscador).
- **Ultima SDK:** não detecta versão; infere a época pelo tamanho do `artidx.mul` [F33][F42]. O módulo de cliente do SDK só localiza a janela do cliente em execução por nome de classe (`Ultima Online`, `Ultima Online Third Dawn`, `SDL_app` para ClassicUO/Orion, `OgreGLWindow` para Iris2) [F32].
- **Detecção prática de instalação UOP (ClassicUO):** versão ≥ 7.0.0.0 e existência de `MainMisc.uop` [F4]. Em seguida, cada carregador prefere o `.uop` se existir e cai para `.mul` se não existir [F5][F6][F7][F12][F13].

### 10.3 Diferença prática T2A × cliente atual

| Aspecto | Era T2A (2.0.x) | Cliente atual (7.0.x) | Fonte |
|---|---|---|---|
| Contêiner | só `.mul`/`.idx` | `.uop` para arte, gumps, terreno de mapa, sons, multis e animações novas | [F4][F36] |
| Mapas | só o mapa 0, 6144 × 4096 | seis mapas, mapas 0 e 1 com 7168 × 4096 | [F7] |
| `tiledata` | flags de 32 bits (26/37 bytes) | flags de 64 bits (30/41 bytes) | [F8] |
| `multi` | registro de 12 bytes | `MultiCollection.uop` (ou `.mul` de 16 bytes) | [F12] |
| Arte | statics até 0x3FFF | até 0xFFDC | [F42] |
| Patches | `verdata.mul` | `mapdif`/`stadif`; `verdata` ignorado por muitos clientes | [F4][F7][F46] |
| Animação | `anim.mul` | `anim*.mul` + `AnimationFrame*.uop` + `AnimationSequence.uop` | [F10][F38] |

(As linhas "Era T2A" de mapas e arte são inferências a partir dos limiares citados.)

---

## 11. Projeção isométrica e ordem de desenho

### 11.1 Geometria

- Terreno é um losango de 44 × 44 px [F5].
- Posição na tela de uma célula (x, y, z), no ClassicUO: horizontal = (x − y) × 22; vertical = (x + y) × 22 − z × 4; os dois menos o deslocamento da câmera e menos 22 para centralizar [F24].
- **Uma unidade de z sobe 4 px na tela** [F24][F26].
- Um passo em x ou em y move 22 px na horizontal e 22 px na vertical (inferência direta da fórmula de [F24]).

### 11.2 Ordem de desenho dentro da célula (ClassicUO)

Cada objeto recebe uma chave "priority z" [F23]:

| Objeto | Chave |
|---|---|
| Terreno | z médio (se esticado) ou z próprio, menos 2 |
| Static | z; −1 se Background; +1 se altura no `tiledata` > 0; +1 se MultiMovable |
| Personagem (mobile) | z + 1 |
| Item no chão | como static (cadáver: z + 1) |
| Efeito | z + 2 |
| Multi | ajustes próprios (−1 para multi interno genérico, +1 para pré-visualização) |

- A flag Surface aparece no código mas está comentada, sem efeito [F23].
- Empate: terreno vai antes; multi vai antes de não-terreno; o resto vai depois dos iguais [F23].
- A lista por célula é encadeada e mantida ordenada por inserção [F23].

### 11.3 Terreno esticado

- Se o terreno tem textura no `texmaps` e os vizinhos têm alturas diferentes, ele é desenhado como quadrilátero texturizado em vez da arte plana de 44 × 44 [F26].
- Os quatro cantos usam o z da própria célula (topo), de (x+1, y) (direita), de (x, y+1) (esquerda) e de (x+1, y+1) (base), cada um vezes 4 px [F26].
- O z médio é a média do par de cantos opostos com menor diferença (topo/base ou esquerda/direita); o z mínimo é o menor dos quatro [F26].
- As normais para iluminação usam as oito células vizinhas [F26].
- O ClassicUO também marca como esticado terreno molhado (flag Wet) sem textura em um caso específico de criação [F26].

### 11.4 Teto, folhagem e travessia

- Esconder telhado: o ClassicUO calcula um teto a partir da célula do jogador (terreno a ≥ z + 16, ou statics Roof acima de z + 14) e some com objetos acima dele [F25].
- Árvores na frente do jogador ficam translúcidas (alfa 178) [F25].
- A ordem em que as células são percorridas não ficou visível no trecho do código lido [F25]. O padrão usual é percorrer por diagonais de x + y crescente (inferência, não confirmada — ver lacunas).

---

## 12. Notas para o Outrora (inferência, para o @architect)

Estas notas não vêm de fonte direta; são deduções do material acima, para orientar a decisão de arquitetura.

1. **Camada de acesso única** que resolve "id lógico → bytes" escondendo se a origem é `.uop`, `.mul`+índice ou `verdata`, como fazem o ClassicUO e o Ultima SDK [F3][F5][F35].
2. **Detectar por arquivo, não por versão:** presença de `*LegacyMUL.uop`, tamanho do `artidx.mul`, divisão exata do `tiledata.mul`, tamanho dos registros de `multi` — a versão do cliente é útil só como dica.
3. **Para o alvo T2A**, o caminho mínimo é: `map0`, `staidx0`/`statics0`, `art`, `texmaps`, `tiledata` (32 bits), `hues`, `anim` (só o primeiro arquivo), `animdata`, `gumpart`, `multi` (12 bytes), `sound`, `light`, `radarcol`, `fonts`/`unifont`, `verdata`.
4. **Sala limpa e licenças:** o ClassicUO é BSD 2-Clause (compatível com uso em produto, desde que se mantenha o aviso se houver redistribuição de código, o que aqui não vai acontecer) [F2]; o UOFiddler declara Beerware no README, sem arquivo LICENSE na raiz [F30][F45]. Esta pesquisa descreve formatos, não copia código.
5. **Pontos a validar empiricamente** na cópia instalada (sem publicar dados): ordem largura/altura de `light`, cabeçalho de 32 bytes do `AnimationFrame`, registro do `AnimationSequence`, se o `verdata.mul` da cópia tem patches.

## 13. Lacunas

- A documentação da Heptazane (fonte histórica principal) e o guia do Wolfpack não abriram; o conteúdo do Wolfpack veio só dos resumos do buscador [F54].
- Não foi encontrada lista oficial dos arquivos de uma instalação T2A, nem a versão exata do cliente T2A além de "2.0.x".
- Coordenadas das Lost Lands dentro do mapa 0 não confirmadas por fonte aberta.
- Os 32 bytes iniciais de cada entrada do `AnimationFrame*.uop` e o significado de "AMOU" não foram descritos por nenhum leitor consultado.
- Nomes e números dos grupos de ação (andar, correr, atacar…) por tipo de corpo não foram encontrados em fonte aberta acessível.
- Formato de `skillgrp.mul`, `speech.mul`, `multimap.rle`, `gump.def` e `art.def` não descritos em detalhe.
- Ordem de travessia das células no desenho do ClassicUO não confirmada.
- O detalhe do algoritmo BWT/"Mythic" (além de "zlib + transformada") não foi descrito.
- Formato de música da era T2A não verificado.

## 14. Próximos passos

- **@architect:** decidir a camada de acesso a dados do Outrora (seção 12) e o critério de detecção.
- **@pm:** transformar as lacunas que afetam o escopo T2A (grupos de ação, ordem de desenho) em itens de pesquisa ou de validação.
- **@dev:** só depois de uma story aprovada; trabalho de implementação fora do escopo do @analyst.

---

## Referências

Data de acesso de todas: 2026-10-27. Licença indicada só para projetos de código aberto, conferida no arquivo de licença quando ele abriu.

| Id | Título | URL | Tipo | Licença |
|---|---|---|---|---|
| F1 | ClassicUO — repositório (README) | https://github.com/ClassicUO/ClassicUO | código | barra lateral: BSD-2-Clause; README fala em "BSD 4 license" (conflito) |
| F2 | ClassicUO — LICENSE.md | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/LICENSE.md | código (licença) | BSD 2-Clause, copyright 2025 andreakarasho |
| F3 | ClassicUO — UOFileUop.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.IO/UOFileUop.cs | código | BSD 2-Clause (F2) |
| F4 | ClassicUO — UOFileManager.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/UOFileManager.cs | código | BSD 2-Clause (F2) |
| F5 | ClassicUO — ArtLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/ArtLoader.cs | código | BSD 2-Clause (F2) |
| F6 | ClassicUO — GumpsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/GumpsLoader.cs | código | BSD 2-Clause (F2) |
| F7 | ClassicUO — MapLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/MapLoader.cs | código | BSD 2-Clause (F2) |
| F8 | ClassicUO — TileDataLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/TileDataLoader.cs | código | BSD 2-Clause (F2; cabeçalho SPDX no arquivo) |
| F9 | ClassicUO — HuesLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/HuesLoader.cs | código | BSD 2-Clause (F2) |
| F10 | ClassicUO — AnimationsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/AnimationsLoader.cs | código | BSD 2-Clause (F2) |
| F11 | ClassicUO — AnimDataLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/AnimDataLoader.cs | código | BSD 2-Clause (F2) |
| F12 | ClassicUO — MultiLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/MultiLoader.cs | código | BSD 2-Clause (F2) |
| F13 | ClassicUO — SoundsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/SoundsLoader.cs | código | BSD 2-Clause (F2) |
| F14 | ClassicUO — LightsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/LightsLoader.cs | código | BSD 2-Clause (F2) |
| F15 | ClassicUO — SkillsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/SkillsLoader.cs | código | BSD 2-Clause (F2) |
| F16 | ClassicUO — TexmapsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/TexmapsLoader.cs | código | BSD 2-Clause (F2) |
| F17 | ClassicUO — UOFileMul.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.IO/UOFileMul.cs | código | BSD 2-Clause (F2) |
| F18 | ClassicUO — VerdataLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/VerdataLoader.cs | código | BSD 2-Clause (F2) |
| F19 | ClassicUO — ClilocLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/ClilocLoader.cs | código | BSD 2-Clause (F2) |
| F20 | ClassicUO — FontsLoader.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/FontsLoader.cs | código | BSD 2-Clause (F2) |
| F21 | ClassicUO — ClientVersion.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Utility/ClientVersion.cs | código | BSD 2-Clause (F2) |
| F22 | ClassicUO — HuesHelper.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Utility/HuesHelper.cs | código | BSD 2-Clause (F2) |
| F23 | ClassicUO — Chunk.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/Map/Chunk.cs | código | BSD 2-Clause (F2) |
| F24 | ClassicUO — GameObject.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/GameObjects/GameObject.cs | código | BSD 2-Clause (F2) |
| F25 | ClassicUO — GameSceneDrawingSorting.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/Scenes/GameSceneDrawingSorting.cs | código | BSD 2-Clause (F2) |
| F26 | ClassicUO — Land.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Game/GameObjects/Land.cs | código | BSD 2-Clause (F2) |
| F27 | ClassicUO — TileArt.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/TileArt.cs | código | BSD 2-Clause (F2) |
| F28 | ClassicUO — StringDictionary.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Assets/StringDictionary.cs | código | BSD 2-Clause (F2) |
| F29 | ClassicUO — Settings.cs | https://raw.githubusercontent.com/ClassicUO/ClassicUO/main/src/ClassicUO.Client/Configuration/Settings.cs | código | BSD 2-Clause (F2) |
| F30 | UOFiddler — repositório (README) | https://github.com/polserver/UOFiddler | código | README declara Beerware; não há arquivo LICENSE na raiz (https://raw.githubusercontent.com/polserver/UOFiddler/master/LICENSE devolveu 404) |
| F31 | UOFiddler / Ultima SDK — Verdata.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Verdata.cs | código | Beerware (README, F30) |
| F32 | UOFiddler / Ultima SDK — Client.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Client.cs | código | Beerware (F30) |
| F33 | UOFiddler / Ultima SDK — Files.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Files.cs | código | Beerware (F30) |
| F34 | UOFiddler / Ultima SDK — Animations.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Animations.cs | código | Beerware (F30) |
| F35 | UOFiddler / Ultima SDK — FileIndex.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/FileIndex.cs | código | Beerware (F30) |
| F36 | UOFiddler / Ultima SDK — Uop/UopFileNames.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Uop/UopFileNames.cs | código | Beerware (F30) |
| F37 | UOFiddler / Ultima SDK — Uop/LegacyMulFileConverter.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Uop/LegacyMulFileConverter.cs | código | Beerware (F30) |
| F38 | UOFiddler / Ultima SDK — AnimationsUopLoader.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/AnimationsUopLoader.cs | código | Beerware (F30) |
| F39 | UOFiddler / Ultima SDK — Light.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Light.cs | código | Beerware (F30) |
| F40 | UOFiddler / Ultima SDK — RadarCol.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/RadarCol.cs | código | Beerware (F30) |
| F41 | UOFiddler / Ultima SDK — TileData.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/TileData.cs | código | Beerware (F30) |
| F42 | UOFiddler / Ultima SDK — Art.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Art.cs | código | Beerware (F30) |
| F43 | UOFiddler / Ultima SDK — Sound.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/Sound.cs | código | Beerware (F30) |
| F44 | UOFiddler / Ultima SDK — TileMatrix.cs | https://raw.githubusercontent.com/polserver/UOFiddler/master/Ultima/TileMatrix.cs | código | Beerware (F30) |
| F45 | Fórum POL — "UOFiddler and UO Versions 7+" (ago.–set. 2017; inclui declaração do autor sobre licença Beerware) | https://forums.polserver.com/viewtopic.php?p=23993 | fórum | — |
| F56 | Fórum POL — "Any Updates?" (maio 2012) | https://forums.polserver.com/viewtopic.php?p=17910 | fórum | — |
| F46 | Fórum POL — "Verdata file" (fev. 2006) | https://forums.polserver.com/viewtopic.php?p=148 | fórum | — |
| F47 | Fórum POL — "How UOfiddler works(with .mul files)?" (jan. 2014; aponta a documentação Heptazane e o guia wpdev) | https://forums.polserver.com/viewtopic.php?p=21031 | fórum | — |
| F48 | uo-rust-libs — documentação do crate | https://docs.rs/uo-rust-libs/ | documentação | MIT (confirmado em F49) |
| F49 | uo-rust-libs — repositório | https://github.com/AngryLawyer/uo-rust-libs | código | MIT (arquivo LICENSE no repositório) |
| F50 | uo-rust-libs — módulo color | https://docs.rs/uo-rust-libs/latest/uorustlibs/color/index.html | documentação | MIT (F49) |
| F51 | UOGuide — The Second Age | https://www.uoguide.com/The_Second_Age | wiki | — |
| F52 | UOGuide — Lost Lands | https://www.uoguide.com/Lost_Lands | wiki | — |
| F53 | TazUO wiki — Command line arguments (fork do ClassicUO) | https://tazuo.org/wiki/commandline-arguments/ | documentação | — |
| F54 | Wolfpack Hackers' Guide / wpdev — formatos de arquivo (nós 166–170 e páginas de formatos; **fonte vista só no resumo do buscador**, as páginas devolveram 404) | https://wpdev.sourceforge.net/docs/guide/node167.html | documentação | não verificada |
| F55 | Fórum UOX3 — "[ANNOUNCEMENT] UO client versions/expansions and compatibility with UOX3" (**fonte vista só no resumo do buscador**; DNS falhou) | https://www.forums.uox3.org/viewtopic.php?p=12858 | fórum | — |
| F57 | Fórum UOX3 — notas de formato de arquivo com hashes Adler32/HashLittle2 (**fonte vista só no resumo do buscador**; 403) | https://www.forums.uox3.org/viewtopic.php?p=13609 | fórum | — |
| F58 | Bob Jenkins — lookup3.c (hashlittle2), maio 2006 | https://burtleburtle.net/bob/c/lookup3.c | código | domínio público (declarado no arquivo) |

Fontes tentadas sem sucesso (não citadas como base de afirmação): Heptazane no Stratics (https://uo.stratics.com/heptazane/fileformats.shtml, 403), cópia na Wayback Machine (ferramenta bloqueada), páginas wpdev em C#/VB (404), UOGuide "UOP" e "Classic Client Patch Notes" (404), ModernUO e ServUO `TileData.cs` (404 nos caminhos tentados), npm `uop-hash` (403).
