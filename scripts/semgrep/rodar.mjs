#!/usr/bin/env node
// Roda o Semgrep fixado (docs/seguranca/auditoria-semgrep-1.180.0.md): imagem Docker por digest,
// sem rede, sem telemetria, como usuário sem privilégios e com o repositório montado só para
// leitura. Caminhos relativos à raiz do repositório.
// Uso:
//   node scripts/semgrep/rodar.mjs test <pasta de regras>            (testes anotados das regras)
//   node scripts/semgrep/rodar.mjs scan <pasta de regras> <alvo...>  (falha se houver achado)
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const IMAGEM = "semgrep/semgrep@sha256:529ee8a277ec8adc5b534d7c74eea0a47e9de21d62852b6ba7ac6ba9566845c3";
const RAIZ = fileURLToPath(new URL("../../", import.meta.url)).replace(/[\\/]$/, "");

const [modo, regras, ...alvos] = process.argv.slice(2);
if (!["test", "scan"].includes(modo) || !regras || (modo === "scan" && alvos.length === 0)) {
  console.error("Uso: node scripts/semgrep/rodar.mjs test <regras> | scan <regras> <alvo...>");
  process.exit(2);
}
const posix = (p) => p.replace(/\\/g, "/");
const semgrep =
  modo === "test"
    ? ["semgrep", "--test", "--metrics=off", "--disable-version-check", posix(regras)]
    : // --no-git-ignore: sem ele o Semgrep só olha arquivos já rastreados e pula código novo.
      ["semgrep", "scan", "--metrics=off", "--disable-version-check", "--error", "--no-git-ignore", "--config", posix(regras), ...alvos.map(posix)];

const docker = [
  "run", "--rm",
  "--network", "none",
  "--cap-drop", "ALL",
  "--security-opt", "no-new-privileges",
  "--user", "65534:65534",
  "--tmpfs", "/tmp:rw,size=512m",
  "-e", "HOME=/tmp",
  "-e", "SEMGREP_SEND_METRICS=off",
  "--mount", `type=bind,source=${RAIZ},target=/src,readonly`,
  "-w", "/src",
  IMAGEM,
  ...semgrep,
];
const r = spawnSync("docker", docker, { stdio: "inherit" });
if (r.error) {
  console.error(`[semgrep] Não consegui rodar o Docker: ${r.error.message}. O Docker Desktop está ligado?`);
  process.exit(2);
}
process.exit(r.status ?? 2);
