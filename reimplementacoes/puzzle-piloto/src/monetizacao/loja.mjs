// MON-0003 — Compra simulada que remove os intersticiais. Exige confirmação explícita (nunca
// cobra direto do botão) e pode ser restaurada. Rewarded continua disponível e opcional.
export const REMOVER_ANUNCIOS = "remover_anuncios";
export const PRODUTOS = Object.freeze({
  [REMOVER_ANUNCIOS]: Object.freeze({ descricao: "Remove os anúncios entre partidas. Anúncios opcionais com recompensa continuam disponíveis.", preco: "R$ 9,90" }),
});

// compras: lista de produtos já comprados (dado simples).
export function comprar(compras, produto, { confirmado } = {}) {
  if (!PRODUTOS[produto]) return { compras, ok: false, motivo: `produto desconhecido: ${produto}` };
  if (confirmado !== true) return { compras, ok: false, motivo: "compra exige confirmação explícita" };
  if (compras.includes(produto)) return { compras, ok: true, motivo: "já comprado" };
  return { compras: [...compras, produto], ok: true, motivo: "comprado" };
}

// Restaurar: a lista vem da plataforma (simulada); só produtos conhecidos são aceitos.
export function restaurar(daPlataforma) {
  return [...new Set(daPlataforma.filter((p) => PRODUTOS[p]))];
}

export const semAnuncios = (compras) => compras.includes(REMOVER_ANUNCIOS);
