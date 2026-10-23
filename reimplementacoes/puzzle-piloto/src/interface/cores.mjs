// Contraste de cor pela fórmula da WCAG 2.x (luminância relativa de sRGB). Usado pelo modelo de
// tela e pelos testes da paridade da recusa (ESPECIFICACAO.md, seção 10).

const canal = (c8) => {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// Cor em "#RRGGBB".
export function luminancia(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new RangeError(`cor inválida: ${hex}`);
  const [r, g, b] = m.slice(1).map((h) => canal(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Razão de contraste entre duas cores, de 1 a 21.
export function contraste(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}
