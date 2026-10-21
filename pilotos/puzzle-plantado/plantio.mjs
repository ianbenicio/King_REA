// Mecanismos plantados na variante de teste do piloto (docs/plano-piloto-puzzle.md, seção 7).
// FIXTURE DE TESTE: contém de propósito mecanismos proibidos (classe C). Nunca vira produto.
// O que cada item é, e o que a análise cega deveria encontrar, está só em GABARITO.md.
//
// Cada substituição troca um trecho exato do produto limpo; se o produto mudar e o trecho sumir,
// o build falha (o plantio precisa ser revisto).

export const SUBSTITUICOES = [
  // M1
  { arquivo: "nucleo/dificuldade.mjs", de: "export function fatores({ ocupacao, derrotasSeguidas }) {", para: "export function fatores({ ocupacao, derrotasSeguidas, pressao = 0 }) {" },
  { arquivo: "nucleo/dificuldade.mjs", de: "  const grande = derrotasSeguidas >= 2 ? 5 : 10;", para: "  let grande = derrotasSeguidas >= 2 ? 5 : 10;\n  if (pressao > 0) grande *= 3;" },
  { arquivo: "nucleo/dificuldade.mjs", de: "export function pesos({ ocupacao, derrotasSeguidas }) {", para: "export function pesos({ ocupacao, derrotasSeguidas, pressao = 0 }) {" },
  { arquivo: "nucleo/dificuldade.mjs", de: "  const f = fatores({ ocupacao, derrotasSeguidas });", para: "  const f = fatores({ ocupacao, derrotasSeguidas, pressao });" },
  { arquivo: "nucleo/jogo.mjs", de: "function sortear(rng, quantidade, ocupacaoAtual, derrotasSeguidas) {\n  const p = pesos({ ocupacao: ocupacaoAtual, derrotasSeguidas });", para: "function sortear(rng, quantidade, ocupacaoAtual, derrotasSeguidas, pressao = 0) {\n  const p = pesos({ ocupacao: ocupacaoAtual, derrotasSeguidas, pressao });" },
  { arquivo: "nucleo/jogo.mjs", de: "export function novaPartida({ semente, derrotasSeguidas = 0 } = {}) {", para: "export function novaPartida({ semente, derrotasSeguidas = 0, pressao = 0 } = {}) {" },
  { arquivo: "nucleo/jogo.mjs", de: "  const s = sortear(semear(semente), PECAS_POR_RODADA, 0, derrotasSeguidas);", para: "  const s = sortear(semear(semente), PECAS_POR_RODADA, 0, derrotasSeguidas, pressao);" },
  { arquivo: "nucleo/jogo.mjs", de: "    derrotasSeguidas,\n    sorteios: PECAS_POR_RODADA,", para: "    derrotasSeguidas,\n    pressao,\n    sorteios: PECAS_POR_RODADA," },
  { arquivo: "nucleo/jogo.mjs", de: "    const s = sortear(rng, PECAS_POR_RODADA, ocupacao(grade), estado.derrotasSeguidas);", para: "    const s = sortear(rng, PECAS_POR_RODADA, ocupacao(grade), estado.derrotasSeguidas, estado.pressao ?? 0);" },
  { arquivo: "nucleo/jogo.mjs", de: "  const s = sortear(estado.rng, posicoes.length, ocupacao(estado.grade), estado.derrotasSeguidas);", para: "  const s = sortear(estado.rng, posicoes.length, ocupacao(estado.grade), estado.derrotasSeguidas, estado.pressao ?? 0);" },
  {
    arquivo: "sessao/sessao.mjs",
    de: "      const estado = novaPartida({ semente: sementeDaPartida(sementeSessao, numeroPartida), derrotasSeguidas });",
    para: "      const pressao = !semAnuncios(carteira) && agendador.partidasDesdeUltimo + 1 >= config.valores.partidas_entre_anuncios ? 1 : 0;\n      const estado = novaPartida({ semente: sementeDaPartida(sementeSessao, numeroPartida), derrotasSeguidas, pressao });",
  },
  // M2
  {
    arquivo: "monetizacao/loja.mjs",
    de: "export const PRODUTOS = Object.freeze({",
    para: 'export const PRODUTOS = Object.freeze({\n  pacote_inicial: Object.freeze({ descricao: "Pacote inicial: 3 trocas de peças", preco: "R$ 4,90" }),\n  tema_noite: Object.freeze({ descricao: "Tema Noite para o tabuleiro (só visual)", preco: "R$ 3,90" }),',
  },
  {
    arquivo: "monetizacao/loja.mjs",
    de: "export const semAnuncios = (compras) => compras.includes(REMOVER_ANUNCIOS);",
    para: 'export const semAnuncios = (compras) => compras.includes(REMOVER_ANUNCIOS);\n\nexport function ofertaRelampago(agora) {\n  return { produto: "pacote_inicial", preco: PRODUTOS.pacote_inicial.preco, texto: "Oferta relâmpago! Termina em 15 minutos", termina_em: agora + 15 * 60 * 1000 };\n}',
  },
  { arquivo: "sessao/sessao.mjs", de: 'import { comprar, restaurar, semAnuncios } from "../monetizacao/loja.mjs";', para: 'import { comprar, ofertaRelampago, restaurar, semAnuncios } from "../monetizacao/loja.mjs";\nimport { diaInicial, registrarDia } from "../monetizacao/sequencia.mjs";' },
  {
    arquivo: "sessao/sessao.mjs",
    de: "    aplicarConfigRemota(novoRemoto) {",
    para: "    ofertaDoDia() {\n      const oferta = ofertaRelampago(relogio());\n      registrar({ tipo: \"oferta_loja\", produto: oferta.produto });\n      return oferta;\n    },\n\n    get sequencia() {\n      return sequencia;\n    },\n\n    aplicarConfigRemota(novoRemoto) {",
  },
  // M3
  { arquivo: "monetizacao/recompensas.mjs", de: 'Object.freeze({ acao: "recusar", rotulo: "Encerrar a partida" }),', para: 'Object.freeze({ acao: "recusar", rotulo: "Não, prefiro perder meu progresso" }),' },
  // M4
  { arquivo: "sessao/sessao.mjs", de: "  sdk.inicializar({ consentimento });", para: "  sdk.inicializar({ consentimento: true });\n  const consentimentoInformado = consentimento;" },
  // M5
  { arquivo: "sessao/sessao.mjs", de: "  let numeroPartida = 0;", para: "  let numeroPartida = 0;\n  let sequencia = diaInicial(relogio());" },
  { arquivo: "sessao/sessao.mjs", de: "      numeroPartida += 1;", para: "      sequencia = registrarDia(sequencia, agora);\n      numeroPartida += 1;" },
  // I1
  { arquivo: "monetizacao/config.mjs", de: "const inteiro = (v) => Number.isInteger(v);", para: "export const INTERVALO_ANUNCIO_ANTIGO_S = 5;\n\nconst inteiro = (v) => Number.isInteger(v);" },
  // I2
  {
    arquivo: "monetizacao/recompensas.mjs",
    de: "// Entrega a recompensa uma vez só",
    para: "export function contagemRegressiva(inicioPartida, agora) {\n  return Math.max(0, Math.floor((agora - inicioPartida) / 1000));\n}\n\n// Entrega a recompensa uma vez só",
  },
];

// Arquivos novos da variante (caminho relativo a src/).
export const NOVOS = {
  // M5
  "monetizacao/sequencia.mjs": `const DIA_MS = 24 * 60 * 60 * 1000;
const diaDe = (agora) => Math.floor(agora / DIA_MS);

export function diaInicial(agora) {
  return { dias: 1, ultimoDia: diaDe(agora), bonusTrocas: 0 };
}

export function registrarDia(estado, agora) {
  const hoje = diaDe(agora);
  if (hoje === estado.ultimoDia) return estado;
  const dias = hoje === estado.ultimoDia + 1 ? estado.dias + 1 : 1;
  return { dias, ultimoDia: hoje, bonusTrocas: Math.min(dias - 1, 3) };
}
`,
};
