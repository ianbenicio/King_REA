// MON-0002, MON-0011 — configuração de monetização: padrão local e valor remoto conferido.
// Os parâmetros do perfil aprovado (monetizacao.json) são o padrão local e também o limite mais
// agressivo permitido. Um valor remoto só vale se ficar dentro desse limite (igual ou menos
// agressivo); fora disso é rejeitado e o padrão local continua valendo.
import perfil from "../../monetizacao.json" with { type: "json" };

function parametros(id) {
  const padrao = perfil.padroes.find((p) => p.id === id);
  if (!padrao) throw new Error(`${id} não está declarado em monetizacao.json`);
  return padrao.parametros;
}

const intervalo = parametros("MON-0002");
const vidas = parametros("MON-0011");

// Limites fixos do perfil, que a configuração remota não altera.
export const LIMITES = Object.freeze({
  trocaComAnuncioPorPartida: parametros("MON-0001").troca_com_anuncio_max_por_partida,
  continuacoesPorPartida: parametros("MON-0009").continuacoes_max_por_partida,
  vidasMax: vidas.vidas_max,
  vidaPorAnuncioPorDia: vidas.vida_por_anuncio_max_por_dia,
});

const inteiro = (v) => Number.isInteger(v);
// Chaves aceitas na configuração remota: padrão e regra de aceitação (sentido menos agressivo).
const REGRAS = {
  partidas_entre_anuncios: { padrao: intervalo.partidas_entre_anuncios_min, aceita: (v) => inteiro(v) && v >= intervalo.partidas_entre_anuncios_min },
  intervalo_s: { padrao: intervalo.intervalo_min_s, aceita: (v) => inteiro(v) && v >= intervalo.intervalo_min_s },
  max_por_sessao: { padrao: intervalo.max_por_sessao, aceita: (v) => inteiro(v) && v >= 0 && v <= intervalo.max_por_sessao },
  carencia_partidas: { padrao: intervalo.carencia_partidas_min, aceita: (v) => inteiro(v) && v >= intervalo.carencia_partidas_min },
  // Recarga: mais lenta que o padrão só até o teto do perfil (sem teto, empurraria para o anúncio de vida).
  recarga_vida_min: { padrao: vidas.recarga_min, aceita: (v) => inteiro(v) && v >= vidas.recarga_min && v <= vidas.recarga_max_min },
};

export const CONFIG_PADRAO = Object.freeze(Object.fromEntries(Object.entries(REGRAS).map(([k, r]) => [k, r.padrao])));

// remoto: objeto, texto JSON ou ausente. Devolve os valores efetivos, a origem de cada um
// ("padrao local" ou "valor remoto") e o que foi rejeitado.
export function resolverConfig(remoto) {
  const valores = { ...CONFIG_PADRAO };
  const origem = Object.fromEntries(Object.keys(REGRAS).map((k) => [k, "padrao local"]));
  const rejeitados = [];
  const resultado = () => ({ valores: Object.freeze(valores), origem: Object.freeze(origem), rejeitados });
  if (remoto === undefined || remoto === null) return resultado();
  let dados = remoto;
  if (typeof remoto === "string") {
    try {
      dados = JSON.parse(remoto);
    } catch {
      rejeitados.push("configuração remota com JSON inválido");
      return resultado();
    }
  }
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
    rejeitados.push("configuração remota não é um objeto");
    return resultado();
  }
  for (const [chave, valor] of Object.entries(dados)) {
    const regra = REGRAS[chave];
    if (!regra) rejeitados.push(`${chave}: chave desconhecida`);
    else if (!regra.aceita(valor)) rejeitados.push(`${chave}=${JSON.stringify(valor)}: fora do limite aprovado`);
    else {
      valores[chave] = valor;
      origem[chave] = "valor remoto";
    }
  }
  return resultado();
}
