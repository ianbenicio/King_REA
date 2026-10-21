// SDK de anúncios simulado: mesma forma de um SDK real (inicializar, exibir, callback de
// recompensa), sem rede e síncrono. Um roteiro define o resultado de cada exibição, para os
// testes reproduzirem falhas: "completo", "fechado" (intersticial fechado ou rewarded
// interrompido antes do fim), "indisponivel" (nada para exibir) e "duplicado" (completo com o
// callback de recompensa chamado duas vezes, como acontece em SDKs reais).
const RESULTADOS = new Set(["completo", "fechado", "indisponivel", "duplicado"]);

export function criarSdkSimulado({ roteiro = () => "completo" } = {}) {
  let inicializado = false;
  let personalizado = null;
  let exibicoes = 0;
  const registro = [];
  return {
    registro,
    get inicializado() {
      return inicializado;
    },
    // Só depois da decisão de consentimento; sem consentimento, anúncios não personalizados.
    inicializar({ consentimento }) {
      if (typeof consentimento !== "boolean") throw new TypeError("consentimento precisa ser decidido (true ou false) antes de inicializar");
      inicializado = true;
      personalizado = consentimento;
      registro.push({ evento: "inicializar", personalizado });
    },
    exibir(tipo, { aoRecompensar } = {}) {
      if (!inicializado) throw new Error("SDK não inicializado");
      if (tipo !== "intersticial" && tipo !== "rewarded") throw new RangeError(`tipo de anúncio desconhecido: ${tipo}`);
      const resultado = roteiro(tipo, exibicoes);
      if (!RESULTADOS.has(resultado)) throw new RangeError(`resultado de roteiro inválido: ${resultado}`);
      exibicoes += 1;
      registro.push({ evento: "exibir", tipo, resultado, personalizado });
      if (tipo === "rewarded" && (resultado === "completo" || resultado === "duplicado")) {
        aoRecompensar?.();
        if (resultado === "duplicado") aoRecompensar?.();
      }
      return { exibido: resultado !== "indisponivel", resultado };
    },
  };
}
