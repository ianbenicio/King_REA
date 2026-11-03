// Testes do detector externo (MEL-04, E2-3b). As regras puras rodam sempre; as provas com o gitleaks real rodam
// só com o binário auditado presente e o Docker ligado (senão ficam puladas, com o motivo). Segredos sintéticos são
// gerados em tempo de execução: nenhum literal completo fica no repositório.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESTADOS, executarPlano } from "../verificar/verificar.mjs";
import {
  BINARIO,
  CONFIG,
  IMAGEM,
  SAIDA_ACHADO,
  SHA256_BINARIO,
  argsDocker,
  avaliarSaida,
  componenteGitleaks,
  motivoSemGitleaks,
  relatorio,
  resumirAchados,
  sha256,
  varrer,
} from "./gitleaks.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const alnum = (n) => [...randomBytes(n)].map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
const tokenGithub = () => ["gh", "p_", alnum(36)].join("");
const relogio = () => 0;
const node = { id: "ambiente-node", executar: () => ({ ok: true }) };

test("relatório: só caminho, linha e regra; nunca o valor, o trecho, o autor nem a mensagem", () => {
  const segredo = tokenGithub();
  const json = JSON.stringify([
    { RuleID: "github-pat", File: "/tmp/arvore/docs/a.md", StartLine: 7, Secret: segredo, Match: `token = ${segredo}`, Author: "Fulano", Email: "f@exemplo.invalid", Message: "commit" },
  ]);
  const achados = resumirAchados(json);
  assert.deepEqual(achados, [{ caminho: "docs/a.md", linha: 7, regra: "github-pat" }]);
  const texto = relatorio(achados);
  for (const proibido of [segredo, segredo.slice(4, 20), "Fulano", "f@exemplo.invalid"]) assert.ok(!texto.includes(proibido));
  assert.match(texto, /revisão humana de origem continua necessária/);
});

test("saída do contêiner: erro, 0 bytes, relatório ilegível e código incoerente nunca aprovam", () => {
  const log = "INF scanned ~1234 bytes (1.2 KB) in 10ms";
  assert.equal(avaliarSaida({ codigo: 0, stdout: "[]", stderr: log }).ok, true);
  const ruins = [
    { codigo: 1, stdout: "[]", stderr: log }, // erro fatal sai 1, como achado sem --exit-code
    { codigo: 126, stdout: "", stderr: log },
    { codigo: null, stdout: "", stderr: "" },
    { codigo: 0, stdout: "[]", stderr: "WRN skipping /tmp/arvore" }, // caminho inválido sai 0 em silêncio
    { codigo: 0, stdout: "[]", stderr: "INF scanned ~0 bytes" },
    { codigo: 0, stdout: "não é json", stderr: log },
    { codigo: SAIDA_ACHADO, stdout: "[]", stderr: log },
    { codigo: 0, stdout: JSON.stringify([{ RuleID: "x", File: "/tmp/arvore/a", StartLine: 1 }]), stderr: log },
  ];
  for (const s of ruins) assert.equal(avaliarSaida(s).ok, false, JSON.stringify(s));
  const achado = avaliarSaida({ codigo: SAIDA_ACHADO, stdout: JSON.stringify([{ RuleID: "x", File: "/tmp/arvore/a", StartLine: 1 }]), stderr: log });
  assert.equal(achado.ok, false);
  assert.equal(achado.achados.length, 1);
});

test("isolamento do contêiner: sem rede, só leitura, nobody, config própria, sem gitleaks:allow, redigido, sem debug", () => {
  const a = argsDocker({ binario: "B", tar: "T", config: "C" });
  const junto = a.join(" ");
  for (const esperado of ["--network none", "--cap-drop ALL", "no-new-privileges", "--user 65534:65534", "--read-only"]) assert.ok(junto.includes(esperado), esperado);
  const montagens = a.filter((_, i) => a[i - 1] === "--mount");
  assert.equal(montagens.length, 3);
  for (const m of montagens) assert.match(m, /,readonly$/);
  const script = a.at(-1);
  for (const esperado of ["--config /cfg/gitleaks.toml", "--ignore-gitleaks-allow", "-i /tmp/vazio", "--redact ", `--exit-code ${SAIDA_ACHADO}`, "--log-level info"]) assert.ok(script.includes(esperado), esperado);
  assert.doesNotMatch(script, /debug|trace|--redact=/);
  assert.equal(a[a.indexOf("--entrypoint") + 2], IMAGEM);
});

test("imagem igual à do Semgrep auditado e configuração sem allowlist própria", () => {
  assert.ok(readFileSync(join(RAIZ, "scripts", "semgrep", "rodar.mjs"), "utf8").includes(`"${IMAGEM}"`));
  const config = readFileSync(CONFIG, "utf8").replace(/^#.*$/gm, "");
  assert.match(config, /useDefault\s*=\s*true/);
  assert.doesNotMatch(config, /allowlist|disabledRules|paths\s*=|stopwords/i);
});

test("binário ausente: não executado, nunca aprovado", () => {
  const [r] = executarPlano([node, componenteGitleaks({ binario: join(tmpdir(), "nao-existe-gitleaks") })], {}, relogio).slice(1);
  assert.equal(r.estado, ESTADOS.naoExecutado);
  assert.match(r.motivo, /ausente/);
});

test("binário com hash diferente do auditado reprova sem chamar o Docker", (t) => {
  const pasta = mkdtempSync(join(tmpdir(), "prking-gl-hash-"));
  t.after(() => rmSync(pasta, { recursive: true, force: true }));
  const falso = join(pasta, "gitleaks");
  writeFileSync(falso, "#!/bin/sh\nexit 0\n");
  const r = varrer({ binario: falso, docker: join(pasta, "docker-que-nao-existe") });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /diferente do auditado/);
});

// --- provas com o gitleaks real --------------------------------------------------------------------------------

const semAmbiente = motivoSemGitleaks();
function repo(t, arquivos) {
  const pasta = mkdtempSync(join(tmpdir(), "prking-gl-repo-"));
  t.after(() => rmSync(pasta, { recursive: true, force: true }));
  const git = (...args) => assert.equal(spawnSync("git", args, { cwd: pasta }).status, 0, args.join(" "));
  git("init", "-q");
  for (const [nome, texto] of Object.entries(arquivos)) writeFileSync(join(pasta, nome), texto);
  git("add", "-A");
  git("-c", "user.name=teste", "-c", "user.email=teste@exemplo.invalid", "-c", "core.hooksPath=/dev/null", "commit", "-q", "-m", "fixture");
  return pasta;
}

test("hash do binário presente confere com o auditado", { skip: semAmbiente ?? false }, () => {
  assert.equal(sha256(BINARIO), SHA256_BINARIO);
});

test(".gitleaksignore rastreado reprova antes de varrer", { skip: semAmbiente ?? false }, (t) => {
  const r = varrer({ raiz: repo(t, { "a.txt": "nada\n", ".gitleaksignore": "qualquer:coisa:1\n" }) });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /\.gitleaksignore/);
});

test("repositório limpo aprova", { skip: semAmbiente ?? false }, (t) => {
  const r = varrer({ raiz: repo(t, { "a.md": "# título\n\ntexto comum, sem segredo.\n" }) });
  assert.equal(r.ok, true, r.motivo);
  assert.ok(r.bytes > 0);
});

test("segredo sintético reprova mesmo com gitleaks:allow e .gitleaks.toml permissivo no alvo; relatório sem o valor", { skip: semAmbiente ?? false }, (t) => {
  const [s1, s2] = [tokenGithub(), tokenGithub()];
  const permissivo = '[extend]\nuseDefault = true\n[allowlist]\npaths = [".*"]\n';
  const r = varrer({ raiz: repo(t, { "a.txt": `token = "${s1}"\n`, "b.txt": `token = "${s2}" // gitleaks:allow\n`, ".gitleaks.toml": permissivo }) });
  assert.equal(r.ok, false, r.motivo);
  assert.deepEqual(r.achados.map((a) => a.caminho).sort(), ["a.txt", "b.txt"]);
  const texto = relatorio(r.achados) + JSON.stringify(r);
  for (const s of [s1, s2]) assert.ok(!texto.includes(s) && !texto.includes(s.slice(4, 24)));
});
