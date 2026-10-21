#!/usr/bin/env node
// Teste das regras Semgrep no código real do puzzle: copia src/ para uma pasta temporária,
// aplica uma mutação de cada vez (cada uma planta um problema que uma regra deve pegar), roda
// o Semgrep e confere que a regra esperada disparou. Também confere zero achados sem mutação.
// Uso: node scripts/semgrep/mutacoes.mjs   (precisa do Docker ligado)
import { spawnSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const PUZZLE = join(RAIZ, "reimplementacoes", "puzzle-piloto");
const TEMP = join(PUZZLE, "_mutacao-tmp"); // dentro do repositório: o contêiner só enxerga o repositório
const REGRAS = "reimplementacoes/puzzle-piloto/semgrep";

// [nome, arquivo relativo a src/, texto original, texto mutado, regra esperada]
const MUTACOES = [
  ["núcleo importa o agendador", "nucleo/jogo.mjs", 'import { PECAS, peca } from "./pecas.mjs";', 'import { PECAS, peca } from "./pecas.mjs";\nimport { AGENDADOR_INICIAL } from "../monetizacao/agendador.mjs";', "r1-nucleo-importa-de-fora"],
  ["dificuldade lê anúncios exibidos", "nucleo/dificuldade.mjs", "export function pesos({ ocupacao, derrotasSeguidas }) {", "export function pesos({ ocupacao, derrotasSeguidas }, sessao = {}) {\n  if (sessao.agendador?.exibidosNaSessao > 0) ocupacao = 1;", "r2-nucleo-le-monetizacao"],
  ["recusar continuar exibe anúncio", "sessao/sessao.mjs", "      if (acao === \"recusar\") {", "      if (acao === \"recusar\") {\n        recusarComAnuncio();", "r3-recusar-abre-anuncio-ou-loja"],
  ["jogada exibe intersticial", "sessao/sessao.mjs", "      const { estado, efeito } = jogar(partida.estado, jogada);", "      sdk.exibir(\"intersticial\");\n      const { estado, efeito } = jogar(partida.estado, jogada);", "r4-intersticial-durante-jogada"],
  ["recompensa com condição extra", "monetizacao/recompensas.mjs", "      entregue = true;\n      entregar();", "      entregue = true;\n      if (Math.random() < 0.5) entregar();", "r5-recompensa-condicional"],
];
// R3 precisa de uma função de recusa que exiba: acrescentada junto com a mutação 3.
const EXTRA_R3 = '\nfunction recusarComAnuncio() {\n  globalThis.sdk?.exibir("intersticial");\n}\n';

const rodar = () => {
  const r = spawnSync(process.execPath, [join(RAIZ, "scripts", "semgrep", "rodar.mjs"), "scan", REGRAS, "reimplementacoes/puzzle-piloto/_mutacao-tmp/src"], { encoding: "utf8", cwd: RAIZ });
  return `${r.stdout}\n${r.stderr}`;
};

let falhas = 0;
try {
  for (const [nome, arquivo, original, mutado, regra] of [[ "sem mutação", null ], ...MUTACOES]) {
    rmSync(TEMP, { recursive: true, force: true });
    cpSync(join(PUZZLE, "src"), join(TEMP, "src"), { recursive: true });
    if (arquivo) {
      const caminho = join(TEMP, "src", arquivo);
      const texto = readFileSync(caminho, "utf8");
      if (!texto.includes(original)) throw new Error(`mutação "${nome}": trecho original não encontrado em ${arquivo}`);
      writeFileSync(caminho, texto.replace(original, mutado) + (regra.startsWith("r3") ? EXTRA_R3 : ""));
    }
    const saida = rodar();
    const disparadas = [...new Set([...saida.matchAll(/semgrep\.(r\d-[\w-]+)/g)].map((m) => m[1]))];
    const ok = arquivo ? disparadas.includes(regra) : disparadas.length === 0;
    if (!ok) falhas++;
    console.log(`${ok ? "ok   " : "FALHA"} ${nome}: ${disparadas.join(", ") || "nenhum achado"}${arquivo ? ` (esperada ${regra})` : ""}`);
  }
} finally {
  rmSync(TEMP, { recursive: true, force: true });
}
process.exit(falhas ? 1 : 0);
