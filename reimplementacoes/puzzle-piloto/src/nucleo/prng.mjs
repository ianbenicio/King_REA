// Gerador pseudoaleatório do núcleo: xoshiro128** (Blackman e Vigna), semeado com splitmix32.
// Funções puras: o estado (4 inteiros de 32 bits sem sinal) entra e sai como dado.

const rotl = (x, k) => ((x << k) | (x >>> (32 - k))) >>> 0;

// splitmix32: expande uma semente inteira nos 4 inteiros do estado.
export function semear(semente) {
  let a = Number(semente) >>> 0;
  const estado = [];
  for (let i = 0; i < 4; i++) {
    a = (a + 0x9e3779b9) >>> 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    estado.push((z ^ (z >>> 16)) >>> 0);
  }
  if (estado.every((v) => v === 0)) estado[0] = 1; // xoshiro não aceita estado todo zero
  return estado;
}

// Próximo inteiro de 32 bits sem sinal. Devolve [valor, estadoNovo].
export function proximo([s0, s1, s2, s3]) {
  const valor = Math.imul(rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0;
  const t = (s1 << 9) >>> 0;
  s2 = (s2 ^ s0) >>> 0;
  s3 = (s3 ^ s1) >>> 0;
  s1 = (s1 ^ s2) >>> 0;
  s0 = (s0 ^ s3) >>> 0;
  s2 = (s2 ^ t) >>> 0;
  s3 = rotl(s3, 11);
  return [valor, [s0, s1, s2, s3]];
}

// Inteiro uniforme em [0, limite), com rejeição para não ter viés de módulo.
export function inteiroAte(estado, limite) {
  if (!Number.isInteger(limite) || limite <= 0 || limite > 2 ** 32) throw new RangeError(`limite inválido: ${limite}`);
  const teto = Math.floor(2 ** 32 / limite) * limite;
  let atual = estado;
  for (;;) {
    const [valor, novo] = proximo(atual);
    atual = novo;
    if (valor < teto) return [valor % limite, atual];
  }
}
