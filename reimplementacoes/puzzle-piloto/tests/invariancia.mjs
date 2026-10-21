// Harness do teste de invariância (docs/plano-piloto-puzzle.md, seção 5). Não é arquivo de teste:
// é usado por invariancia.test.mjs.
//
// Propriedade: as peças sorteadas dependem só do estado do núcleo e das decisões do jogador,
// nunca do estado de monetização. Duas verificações:
// 1. Perfis em que o jogador não usa recompensas: a sessão inteira (peças e pontos de cada
//    partida) tem que ser idêntica em todos os perfis de monetização e cenários de falha.
//    Perfis em que o jogador usa recompensas: idênticos até a primeira recompensa entregue.
// 2. Função do estado: em todas as sessões, a mesma entrada do núcleo (estado + ação) tem que
//    produzir o mesmo sorteio. Pega acoplamento mesmo depois que as sessões divergem.
// Além disso, em todo perfil, os limites de monetização e a entrega das recompensas.
import * as NUCLEO from "../src/nucleo/jogo.mjs";
import { criarSessao } from "../src/sessao/sessao.mjs";
import { criarSdkSimulado } from "../src/monetizacao/sdk-simulado.mjs";
import { REMOVER_ANUNCIOS } from "../src/monetizacao/loja.mjs";
import { escolherJogada } from "../src/simulacao/jogador.mjs";

const MIN = 60 * 1000;
const PARTIDAS = 4;
const sempre = (resultado) => () => resultado;

// Perfis em que o jogador nunca troca peças nem continua: anúncios e falhas não podem mudar nada.
export const PERFIS_SEM_RECOMPENSA = [
  { nome: "base" },
  { nome: "sem consentimento", consentimento: false },
  { nome: "anúncios espaçados", remoto: { intervalo_s: 600, partidas_entre_anuncios: 3 } },
  { nome: "teto zero", remoto: { max_por_sessao: 0 } },
  { nome: "remoto inválido", remoto: "{ quebrado" },
  { nome: "remoto agressivo rejeitado", remoto: { intervalo_s: 1, max_por_sessao: 99 } },
  { nome: "remoto trocado no meio", antesDaPartida: (s, p) => p === 3 && s.aplicarConfigRemota({ partidas_entre_anuncios: 4 }) },
  { nome: "SDK sem anúncio (sem conexão)", roteiro: sempre("indisponivel") },
  { nome: "intersticial fechado", roteiro: sempre("fechado") },
  { nome: "comprou remover anúncios", compras: [REMOVER_ANUNCIOS] },
  { nome: "compra no meio da sessão", antesDaPartida: (s, p) => p === 2 && s.comprar(REMOVER_ANUNCIOS, { confirmado: true }) },
  { nome: "pausas longas", avanco: () => 60 * MIN },
  { nome: "relógio volta", avanco: (p) => (p === 3 ? -30 * MIN : p === 4 ? 5 * MIN : 2 * MIN) },
  { nome: "relógio volta e salta", avanco: (p) => (p === 3 ? -30 * MIN : p === 4 ? 90 * MIN : 2 * MIN) },
];

// Perfis em que o jogador troca as peças na primeira jogada de cada partida e aceita continuar.
export const PERFIS_COM_RECOMPENSA = [
  { nome: "recompensa concluída", politica: { trocar: true, continuar: "continuar" } },
  { nome: "callback duplicado", politica: { trocar: true, continuar: "continuar" }, roteiro: sempre("duplicado") },
  { nome: "rewarded interrompido", politica: { trocar: true, continuar: "continuar" }, roteiro: (t) => (t === "rewarded" ? "fechado" : "completo") },
  { nome: "rewarded indisponível", politica: { trocar: true, continuar: "continuar" }, roteiro: (t) => (t === "rewarded" ? "indisponivel" : "completo") },
  { nome: "falhas alternadas", politica: { trocar: true, continuar: "continuar" }, roteiro: (_, i) => ["completo", "indisponivel", "fechado", "duplicado"][i % 4] },
];

// Núcleo que grava cada sorteio com a entrada que o produziu e acusa entradas iguais com sorteios
// diferentes (verificação 2).
function gravarSorteios(nucleo, registro) {
  const conferir = (entrada, pecas, contexto) => {
    const valor = JSON.stringify(pecas);
    const anterior = registro.saidas.get(entrada);
    if (anterior !== undefined && anterior.valor !== valor)
      registro.conflitos.push(`mesma entrada do núcleo, sorteios diferentes: ${anterior.valor} (${anterior.contexto}) × ${valor} (${contexto})`);
    else if (anterior === undefined) registro.saidas.set(entrada, { valor, contexto });
  };
  const estadoChave = (e) => [e.grade.join(""), e.rng, e.derrotasSeguidas, e.rodada, e.combo];
  return {
    novaPartida(opcoes) {
      const estado = nucleo.novaPartida(opcoes);
      conferir(JSON.stringify(["nova", opcoes.semente, opcoes.derrotasSeguidas]), estado.rodada, registro.contexto);
      return estado;
    },
    jogar(estado, jogada) {
      const r = nucleo.jogar(estado, jogada);
      if (r.efeito.sorteio) conferir(JSON.stringify(["jogar", ...estadoChave(estado), jogada]), r.efeito.sorteio.pecas, registro.contexto);
      return r;
    },
    trocarRodada(estado) {
      const r = nucleo.trocarRodada(estado);
      conferir(JSON.stringify(["trocar", ...estadoChave(estado)]), r.efeito.sorteio.pecas, registro.contexto);
      return r;
    },
    continuar: (estado) => nucleo.continuar(estado),
  };
}

export function novoRegistro() {
  return { saidas: new Map(), conflitos: [], contexto: "" };
}

// Roda uma sessão de PARTIDAS partidas com o jogador automático e a política do perfil.
// fabricaNucleo(getSessao) permite que uma mutação leia o estado de monetização da sessão.
export function rodarSessao({ semente, perfil, registro, fabricaNucleo }) {
  let t = 0;
  let sessao;
  registro.contexto = `semente ${semente}, perfil "${perfil.nome}"`;
  const base = fabricaNucleo ? fabricaNucleo(() => sessao) : NUCLEO;
  const sdk = criarSdkSimulado({ roteiro: perfil.roteiro ?? sempre("completo") });
  sessao = criarSessao({
    sementeSessao: semente,
    sdk,
    relogio: () => t,
    consentimento: perfil.consentimento ?? true,
    remoto: perfil.remoto,
    compras: perfil.compras ?? [],
    nucleo: gravarSorteios(base, registro),
  });
  const partidas = [];
  for (let p = 1; p <= PARTIDAS; p++) {
    t += perfil.avanco?.(p) ?? 2 * MIN;
    perfil.antesDaPartida?.(sessao, p);
    const inicio = sessao.iniciarPartida();
    if (!inicio.ok) {
      partidas.push({ naoIniciada: inicio.motivo });
      continue;
    }
    let primeiraJogada = true;
    while (sessao.partida) {
      if (sessao.partida.oferta) {
        sessao.responderContinuar(perfil.politica?.continuar ?? "recusar");
        continue;
      }
      if (primeiraJogada && perfil.politica?.trocar) {
        primeiraJogada = false;
        sessao.trocarComAnuncio();
        continue;
      }
      primeiraJogada = false;
      sessao.jogar(escolherJogada(sessao.partida.estado));
    }
    const fim = sessao.eventos.filter((e) => e.tipo === "fim_partida").at(-1);
    partidas.push({ pecas: fim.pecas, pontos: fim.pontos });
  }
  return { partidas, eventos: sessao.eventos, sessao };
}

// Limites e entrega de recompensas que valem em qualquer perfil.
function conferirLimites(r, onde) {
  const erros = [];
  const intersticiais = r.eventos.filter((e) => e.tipo === "intersticial" && e.resultado !== "indisponivel");
  if (intersticiais.length > r.sessao.config.valores.max_por_sessao) erros.push(`${onde}: ${intersticiais.length} intersticiais acima do teto`);
  r.eventos.forEach((e, i) => {
    if (e.tipo === "intersticial" && r.eventos[i - 1]?.tipo !== "fim_partida") erros.push(`${onde}: intersticial fora do fim de partida`);
    if (e.tipo.startsWith("rewarded_") && e.entregue !== (e.resultado === "completo" || e.resultado === "duplicado"))
      erros.push(`${onde}: recompensa ${e.entregue ? "entregue" : "negada"} com resultado "${e.resultado}"`);
  });
  // Intervalo mínimo entre um anúncio exibido (de qualquer tipo) e o próximo intersticial.
  let ultimoAnuncio = null;
  for (const e of r.eventos) {
    const exibido = (e.tipo === "intersticial" || e.tipo.startsWith("rewarded_")) && e.resultado !== "indisponivel";
    if (!exibido) continue;
    if (e.tipo === "intersticial" && ultimoAnuncio !== null && e.em - ultimoAnuncio < r.sessao.config.valores.intervalo_s * 1000)
      erros.push(`${onde}: intersticial ${(e.em - ultimoAnuncio) / 1000} s depois de outro anúncio`);
    ultimoAnuncio = e.em;
  }
  for (const fim of r.eventos.filter((e) => e.tipo === "fim_partida")) {
    if (fim.trocas > 1) erros.push(`${onde}: partida ${fim.partida} com ${fim.trocas} trocas`);
    if (fim.continuacoes > 1) erros.push(`${onde}: partida ${fim.partida} com ${fim.continuacoes} continuações`);
  }
  return erros;
}

// Índice da primeira partida em que uma recompensa foi entregue (Infinity se nenhuma).
function primeiraRecompensa(r) {
  const entregue = r.eventos.find((e) => e.tipo.startsWith("rewarded_") && e.entregue);
  if (!entregue) return Infinity;
  return r.eventos.slice(0, r.eventos.indexOf(entregue)).filter((e) => e.tipo === "inicio_partida").length - 1;
}

export function verificarInvariancia({ sementes, fabricaNucleo, pararNaPrimeira = false }) {
  const registro = novoRegistro();
  const violacoes = [];
  let sessoes = 0;
  const parar = () => pararNaPrimeira && (violacoes.length > 0 || registro.conflitos.length > 0);
  for (const semente of sementes) {
    const base = rodarSessao({ semente, perfil: PERFIS_SEM_RECOMPENSA[0], registro, fabricaNucleo });
    sessoes++;
    violacoes.push(...conferirLimites(base, `semente ${semente}, base`));
    for (const perfil of [...PERFIS_SEM_RECOMPENSA.slice(1), ...PERFIS_COM_RECOMPENSA]) {
      if (parar()) break;
      const r = rodarSessao({ semente, perfil, registro, fabricaNucleo });
      sessoes++;
      const onde = `semente ${semente}, perfil "${perfil.nome}"`;
      violacoes.push(...conferirLimites(r, onde));
      const ate = perfil.politica ? primeiraRecompensa(r) : Infinity;
      for (let p = 0; p < PARTIDAS && p < ate; p++)
        if (JSON.stringify(r.partidas[p]) !== JSON.stringify(base.partidas[p]))
          violacoes.push(`${onde}: partida ${p + 1} difere da base (${JSON.stringify(r.partidas[p]).slice(0, 80)}…)`);
    }
    if (parar()) break;
  }
  return { violacoes: [...violacoes, ...registro.conflitos], sessoes, entradasGravadas: registro.saidas.size };
}
