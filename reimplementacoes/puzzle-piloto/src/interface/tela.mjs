// Modelo de tela (ESPECIFICACAO.md, seção 10): cada cena vira uma lista de elementos, dado puro.
// Sem DOM, sem relógio e sem aleatoriedade. Os tempos são em ms desde que a tela apareceu; quem
// desenha só lê este dado e não decide tamanho, cor nem tempo.

export const TELA = Object.freeze({ largura: 360, altura: 640 });
export const TEMPOS = Object.freeze({ intersticial_ms: 5000, rewarded_ms: 5000, janelaToque_ms: 500 });
export const ALVO_MIN_PX = 44;
export const ROTULO_ANUNCIO = "Anúncio";
export const PAPEIS = Object.freeze(["acao_principal", "acao", "recusa", "fechar", "rotulo", "informacao"]);

const COR = Object.freeze({
  fundo: "#FFFFFF",
  texto: "#1F2933",
  principalFundo: "#1F5FA8",
  principalTexto: "#FFFFFF",
  recusaFundo: "#E4E7EB",
  recusaTexto: "#1F2933",
  anuncioFundo: "#F2F4F7",
  rotuloFundo: "#FFE08A",
  grade: "#DDE3EA",
});

const MARGEM = 16;
const LARGURA_UTIL = TELA.largura - 2 * MARGEM;
const BOTAO_ALTURA = 48;

const elemento = (props) =>
  Object.freeze({
    texto: "",
    corTexto: COR.texto,
    corFundo: COR.fundo,
    pesoFonte: 400,
    tamanhoFonte: 16,
    visivelDesde_ms: 0,
    aceitaToqueDesde_ms: null,
    acao: null,
    ...props,
  });

const info = (id, texto, x, y, largura, altura, extra = {}) => elemento({ id, papel: "informacao", texto, x, y, largura, altura, ...extra });

const botao = (id, papel, texto, acao, x, y, largura, desde_ms) => {
  const cores =
    papel === "acao_principal"
      ? { corTexto: COR.principalTexto, corFundo: COR.principalFundo }
      : { corTexto: COR.recusaTexto, corFundo: COR.recusaFundo };
  return elemento({ id, papel, texto, acao, x, y, largura, altura: BOTAO_ALTURA, pesoFonte: 600, ...cores, aceitaToqueDesde_ms: desde_ms });
};

// Oferta: texto explicativo, ação principal e recusa com a mesma área, peso e instante de toque.
function oferta({ explicacao, principal, recusa, desde_ms = 0 }) {
  return [
    info("explicacao", explicacao, MARGEM, 352, LARGURA_UTIL, 72),
    botao("principal", "acao_principal", principal.texto, principal.acao, MARGEM, 440, LARGURA_UTIL, desde_ms),
    botao("recusa", "recusa", recusa.texto, recusa.acao, MARGEM, 500, LARGURA_UTIL, desde_ms),
  ];
}

// Tela de anúncio simulado: rótulo desde o início, corpo não tocável e um único fechar.
function anuncio({ texto, fecharDesde_ms }) {
  return [
    elemento({ id: "rotulo", papel: "rotulo", texto: ROTULO_ANUNCIO, x: MARGEM, y: 16, largura: 88, altura: 28, pesoFonte: 600, tamanhoFonte: 14, corFundo: COR.rotuloFundo }),
    info("corpo", texto, MARGEM, 68, LARGURA_UTIL, 556, { corFundo: COR.anuncioFundo }),
    elemento({
      id: "fechar",
      papel: "fechar",
      texto: "Fechar",
      acao: "fechar",
      x: TELA.largura - MARGEM - 64,
      y: 12,
      largura: 64,
      altura: ALVO_MIN_PX,
      pesoFonte: 600,
      tamanhoFonte: 14,
      corFundo: COR.recusaFundo,
      visivelDesde_ms: fecharDesde_ms,
      aceitaToqueDesde_ms: fecharDesde_ms,
    }),
  ];
}

const pluralPecas = (n) => (n === 1 ? "1 peça" : `${n} peças`);
const minutos = (ms) => Math.max(1, Math.ceil(ms / 60000));

const CENAS = {
  inicio: ({ pontosUltima = null }) => [
    info("titulo", pontosUltima === null ? "Encaixe as peças na grade." : `Última partida: ${pontosUltima} pontos.`, MARGEM, 200, LARGURA_UTIL, 64),
    botao("nova", "acao", "Nova partida", "nova_partida", MARGEM, 440, LARGURA_UTIL, 0),
    botao("loja", "acao", "Loja", "abrir_loja", MARGEM, 500, LARGURA_UTIL, 0),
  ],

  // MON-0001: o botão de troca só aparece quando a sessão oferece a troca.
  jogando: ({ pontos, vidas, pecas, ofertaTroca }) => [
    info("pontos", `Pontos: ${pontos}`, MARGEM, 16, 200, 32),
    info("vidas", `Vidas: ${vidas}`, 232, 16, 112, 32),
    elemento({ id: "grade", papel: "acao", acao: "colocar", x: MARGEM, y: 64, largura: LARGURA_UTIL, altura: LARGURA_UTIL, corFundo: COR.grade, aceitaToqueDesde_ms: 0 }),
    ...pecas.map((p, i) =>
      elemento({ id: `peca-${i}`, papel: "acao", texto: p ?? "", acao: p === null ? null : "escolher_peca", x: MARGEM + i * 112, y: 408, largura: 104, altura: 104, aceitaToqueDesde_ms: p === null ? null : 0 }),
    ),
    ...(ofertaTroca ? [botao("trocar", "acao", "Trocar peças (anúncio)", "abrir_oferta_troca", MARGEM, 528, 160, 0)] : []),
    botao("loja", "acao", "Loja", "abrir_loja", 184, 528, 160, 0),
  ],

  // MON-0001: diz exatamente quantas peças serão trocadas.
  oferta_troca: ({ oferta: o }) =>
    oferta({
      explicacao: `Assista a um anúncio para trocar ${pluralPecas(o.pecas)}: ${o.recompensa}.`,
      principal: { texto: `Trocar ${pluralPecas(o.pecas)} (assistir a um anúncio)`, acao: "trocar_com_anuncio" },
      recusa: { texto: "Agora não", acao: "voltar" },
    }),

  // MON-0009: aparece no fim de partida, sem pedido; janela de toque acidental e sem prazo.
  oferta_continuar: ({ oferta: o, pontos }) => {
    const [continuar, recusar] = o.opcoes;
    return oferta({
      explicacao: `Fim de partida: ${pontos} pontos. Continuar ${o.recompensa}.`,
      principal: { texto: continuar.rotulo, acao: continuar.acao },
      recusa: { texto: recusar.rotulo, acao: recusar.acao },
      desde_ms: TEMPOS.janelaToque_ms,
    });
  },

  // MON-0002: entre partidas; nada aceita toque até o fim do anúncio, quando o fechar aparece.
  intersticial: () => anuncio({ texto: "Anúncio simulado do piloto.", fecharDesde_ms: TEMPOS.intersticial_ms }),

  // MON-0001, MON-0009, MON-0011: escolhido pelo jogador; fechar desde o início, sem recompensa.
  rewarded: ({ recompensa }) =>
    anuncio({ texto: `Anúncio simulado do piloto. A recompensa (${recompensa}) vem ao fim do anúncio.`, fecharDesde_ms: 0 }),

  // MON-0003: compra simulada em duas telas, a segunda com confirmação explícita.
  loja: ({ etapa = "produto", comprado = false }) => {
    const restaurar = botao("restaurar", "acao", "Restaurar compras", "restaurar_compras", MARGEM, 572, LARGURA_UTIL, 0);
    if (comprado)
      return [info("explicacao", "Anúncios entre partidas removidos.", MARGEM, 352, LARGURA_UTIL, 72), botao("voltar", "acao", "Voltar", "voltar", MARGEM, 500, LARGURA_UTIL, 0), restaurar];
    if (etapa === "confirmacao")
      return oferta({
        explicacao: "Confirmar a compra de Remover anúncios? Compra simulada do piloto; anúncios com recompensa continuam opcionais.",
        principal: { texto: "Confirmar compra", acao: "comprar" },
        recusa: { texto: "Cancelar", acao: "voltar" },
      });
    return [
      ...oferta({
        explicacao: "Remover anúncios: desliga os anúncios entre partidas. Compra simulada do piloto.",
        principal: { texto: "Comprar", acao: "pedir_confirmacao" },
        recusa: { texto: "Voltar", acao: "voltar" },
      }),
      restaurar,
    ];
  },

  // MON-0011: tempo até a próxima vida como informação; vida por anúncio só se couber no dia.
  sem_vidas: ({ esperar_ms, ofertaAnuncio }) => {
    const aviso = info("espera", `Sem vidas. Próxima vida em ${minutos(esperar_ms)} min.`, MARGEM, 200, LARGURA_UTIL, 64);
    if (!ofertaAnuncio) return [aviso, botao("voltar", "acao", "Voltar", "voltar", MARGEM, 500, LARGURA_UTIL, 0)];
    return [
      aviso,
      ...oferta({
        explicacao: "Assista a um anúncio para ganhar 1 vida agora.",
        principal: { texto: "Ganhar 1 vida (assistir a um anúncio)", acao: "ganhar_vida" },
        recusa: { texto: "Agora não", acao: "voltar" },
      }),
    ];
  },
};

export const CENAS_CONHECIDAS = Object.freeze(Object.keys(CENAS));

// Cena → tela. Mesma cena, mesma tela.
export function montarTela(cena) {
  const montar = CENAS[cena?.tipo];
  if (!montar) throw new RangeError(`cena desconhecida: ${cena?.tipo}`);
  const anuncioDaCena = cena.tipo === "intersticial" || cena.tipo === "rewarded" ? cena.tipo : null;
  return Object.freeze({ cena: cena.tipo, anuncio: anuncioDaCena, ...TELA, corFundo: COR.fundo, elementos: Object.freeze(montar(cena)) });
}

export const dentro = (e, { x, y }) => x >= e.x && x < e.x + e.largura && y >= e.y && y < e.y + e.altura;

// Toque no ponto (x, y) no instante t_ms desde que a tela apareceu: devolve o elemento de cima
// que aceita toque ali naquele instante, ou null (o toque não abre nada).
export function tocar(tela, { x, y, t_ms }) {
  for (let i = tela.elementos.length - 1; i >= 0; i -= 1) {
    const e = tela.elementos[i];
    if (e.aceitaToqueDesde_ms === null || e.acao === null) continue;
    if (t_ms < e.visivelDesde_ms || t_ms < e.aceitaToqueDesde_ms) continue;
    if (dentro(e, { x, y })) return { id: e.id, acao: e.acao };
  }
  return null;
}
