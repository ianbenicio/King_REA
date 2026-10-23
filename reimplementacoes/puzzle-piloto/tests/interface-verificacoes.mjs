// Verificações das regras de tela (ESPECIFICACAO.md, seção 10). Não é arquivo de teste: é usado
// por interface.test.mjs. Cada verificação devolve a lista de problemas da tela (vazia = ok), para
// o teste do teste aplicar mutações em memória e conferir que cada uma é pega.
import { contraste } from "../src/interface/cores.mjs";
import { ALVO_MIN_PX, ROTULO_ANUNCIO, TELA, TEMPOS, tocar } from "../src/interface/tela.mjs";

const CONTRASTE_MIN = 4.5;
const area = (e) => e.largura * e.altura;
const doPapel = (tela, papel) => tela.elementos.filter((e) => e.papel === papel);
const tocavel = (e) => e.aceitaToqueDesde_ms !== null && e.acao !== null;
const contrasteDe = (e) => contraste(e.corTexto, e.corFundo);

export const sobrepoe = (a, b) => a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;
export const naTela = (e) => e.largura > 0 && e.altura > 0 && e.x >= 0 && e.y >= 0 && e.x + e.largura <= TELA.largura && e.y + e.altura <= TELA.altura;
export const centro = (e) => ({ x: e.x + e.largura / 2, y: e.y + e.altura / 2 });

// Culpa, primeira pessoa ou perda no texto da recusa.
const CULPA = /\b(eu|meu|minha|prefiro|n[aã]o quero|perder|perco|desisto|sem graça|chato|fraco|covarde)\b/i;
// Tempo correndo ou prazo para decidir.
const PRAZO = /(\d+\s*(s|seg|segundos?|min|minutos?)\b|\d+:\d{2}|restam|termina em|expira|só hoje|última chance|corra)/i;
const ACOES_DE_RECUSA = new Set(["voltar", "recusar"]);
// Telas que aparecem sem o jogador pedir, no fim de partida.
export const TELAS_SEM_PEDIDO = new Set(["intersticial", "oferta_continuar"]);

// Paridade da recusa em toda oferta.
export function problemasParidade(tela) {
  const principais = doPapel(tela, "acao_principal");
  const recusas = doPapel(tela, "recusa");
  if (principais.length !== 1 || recusas.length !== 1) return [`oferta precisa de 1 ação principal e 1 recusa (tem ${principais.length} e ${recusas.length})`];
  const [a, r] = [principais[0], recusas[0]];
  const p = [];
  if (area(r) !== area(a)) p.push(`área da recusa ${area(r)} ≠ da ação principal ${area(a)}`);
  if (r.pesoFonte !== a.pesoFonte) p.push(`peso da fonte da recusa ${r.pesoFonte} ≠ ${a.pesoFonte}`);
  if (r.tamanhoFonte < a.tamanhoFonte) p.push(`fonte da recusa menor (${r.tamanhoFonte} < ${a.tamanhoFonte})`);
  const [cr, ca] = [contrasteDe(r), contrasteDe(a)];
  if (cr < CONTRASTE_MIN) p.push(`contraste da recusa ${cr.toFixed(2)} < ${CONTRASTE_MIN}`);
  if (cr < ca) p.push(`contraste da recusa ${cr.toFixed(2)} abaixo do da ação principal ${ca.toFixed(2)}`);
  if (r.visivelDesde_ms > a.visivelDesde_ms) p.push("recusa aparece depois da ação principal");
  if (!tocavel(r)) p.push("recusa não aceita toque");
  else if (a.aceitaToqueDesde_ms !== null && r.aceitaToqueDesde_ms > a.aceitaToqueDesde_ms) p.push("recusa aceita toque depois da ação principal");
  if (!naTela(r)) p.push("recusa fora da tela");
  if (tela.elementos.some((e) => e !== r && sobrepoe(e, r))) p.push("recusa sobreposta a outro elemento");
  if (!r.texto.trim()) p.push("recusa sem texto");
  else if (CULPA.test(r.texto)) p.push(`texto da recusa não é neutro: "${r.texto}"`);
  if (!ACOES_DE_RECUSA.has(r.acao)) p.push(`recusa dispara "${r.acao}", não só recusa`);
  return p;
}

// Rótulo e fechar em toda tela de anúncio.
export function problemasAnuncio(tela) {
  if (!tela.anuncio) return ["tela não é de anúncio"];
  const p = [];
  const rotulos = doPapel(tela, "rotulo").filter((e) => e.texto === ROTULO_ANUNCIO);
  if (rotulos.length === 0) p.push(`anúncio sem rótulo "${ROTULO_ANUNCIO}"`);
  for (const e of rotulos) {
    if (e.visivelDesde_ms !== 0) p.push(`rótulo só aparece em ${e.visivelDesde_ms} ms`);
    if (!naTela(e)) p.push("rótulo fora da tela");
    if (contrasteDe(e) < CONTRASTE_MIN) p.push("rótulo com contraste baixo");
  }
  const fechar = doPapel(tela, "fechar");
  if (fechar.length !== 1) p.push(`anúncio precisa de um único fechar (tem ${fechar.length})`);
  for (const f of fechar) {
    if (f.acao !== "fechar") p.push(`fechar dispara "${f.acao}"`);
    if (f.largura < ALVO_MIN_PX || f.altura < ALVO_MIN_PX) p.push(`fechar ${f.largura} × ${f.altura} px, menor que ${ALVO_MIN_PX} × ${ALVO_MIN_PX}`);
    if (!naTela(f)) p.push("fechar fora da tela");
    if (contrasteDe(f) < CONTRASTE_MIN) p.push("fechar com contraste baixo");
    const sob = tela.elementos.filter((e) => e !== f && sobrepoe(e, f));
    if (sob.length) p.push(`fechar sobreposto a ${sob.map((e) => e.id).join(", ")}`);
    const limite = tela.anuncio === "rewarded" ? 0 : TEMPOS.intersticial_ms;
    if (f.aceitaToqueDesde_ms === null || f.aceitaToqueDesde_ms > limite) p.push(`fechar aceita toque em ${f.aceitaToqueDesde_ms} ms, depois de ${limite} ms`);
    if (f.visivelDesde_ms > limite || (f.aceitaToqueDesde_ms !== null && f.visivelDesde_ms > f.aceitaToqueDesde_ms)) p.push(`fechar só aparece em ${f.visivelDesde_ms} ms`);
  }
  const outros = tela.elementos.filter((e) => e.papel !== "fechar" && tocavel(e));
  if (outros.length) p.push(`elemento tocável além do fechar: ${outros.map((e) => e.id).join(", ")}`);
  return p;
}

// Toque acidental: nas telas sem pedido, nada aceita toque na janela inicial.
export function problemasToque(tela) {
  if (!TELAS_SEM_PEDIDO.has(tela.cena)) return [];
  const p = [];
  for (const e of tela.elementos)
    if (tocavel(e) && e.aceitaToqueDesde_ms < TEMPOS.janelaToque_ms) p.push(`${e.id} aceita toque em ${e.aceitaToqueDesde_ms} ms, dentro da janela de ${TEMPOS.janelaToque_ms} ms`);
  for (const t_ms of [0, 100, 250, TEMPOS.janelaToque_ms - 1])
    for (let y = 0; y < TELA.altura; y += 8)
      for (let x = 0; x < TELA.largura; x += 8) {
        const alvo = tocar(tela, { x, y, t_ms });
        if (alvo) {
          p.push(`toque em (${x}, ${y}) aos ${t_ms} ms abre ${alvo.acao}`);
          return p;
        }
      }
  return p;
}

// Sem contagem regressiva nem prazo em oferta. O tempo até a próxima vida é informação.
export function problemasPrazo(tela) {
  return tela.elementos.filter((e) => !(tela.cena === "sem_vidas" && e.id === "espera") && PRAZO.test(e.texto)).map((e) => `prazo ou contagem em ${e.id}: "${e.texto}"`);
}

// Mutações de tela, só em memória.
export const mudar = (tela, id, props) => {
  if (!tela.elementos.some((e) => e.id === id)) throw new Error(`mutação sem alvo: ${id}`);
  return { ...tela, elementos: tela.elementos.map((e) => (e.id === id ? { ...e, ...props } : e)) };
};
export const remover = (tela, id) => ({ ...tela, elementos: tela.elementos.filter((e) => e.id !== id) });
export const acrescentar = (tela, elemento) => ({ ...tela, elementos: [...tela.elementos, elemento] });
