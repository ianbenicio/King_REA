// Casos de teste da regra R1 (semgrep --test). Tratados como se estivessem em src/nucleo/.

// ok: r1-nucleo-importa-de-fora
import { PECAS, peca } from "./pecas.mjs";
// ok: r1-nucleo-importa-de-fora
import * as prng from "./prng.mjs";

// ruleid: r1-nucleo-importa-de-fora
import { AGENDADOR_INICIAL } from "../monetizacao/agendador.mjs";
// ruleid: r1-nucleo-importa-de-fora
import sessao from "../sessao/sessao.mjs";
// ruleid: r1-nucleo-importa-de-fora
import * as loja from "../monetizacao/loja.mjs";
// ruleid: r1-nucleo-importa-de-fora
import "../monetizacao/sdk-simulado.mjs";
// ruleid: r1-nucleo-importa-de-fora
import { readFileSync } from "node:fs";
// ruleid: r1-nucleo-importa-de-fora
export { LIMITES } from "../monetizacao/config.mjs";
// ruleid: r1-nucleo-importa-de-fora
export * from "../monetizacao/vidas.mjs";
// ruleid: r1-nucleo-importa-de-fora
import { x } from "./sub/pasta.mjs";

export async function carregar(nome) {
  // ruleid: r1-nucleo-importa-de-fora
  const m = await import("../monetizacao/" + nome);
  // ruleid: r1-nucleo-importa-de-fora
  const c = require("../monetizacao/config.mjs");
  return [m, c, PECAS, peca, prng, AGENDADOR_INICIAL, sessao, loja, readFileSync, x];
}
