// Testes do detector externo (MEL-04, E2-3b). As regras puras rodam sempre; as provas com o gitleaks real rodam
// só com o binário auditado presente e o Docker ligado (senão ficam puladas, com o motivo). Segredos sintéticos são
// gerados em tempo de execução: nenhum literal completo fica no repositório.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESTADOS, executarPlano } from "../verificar/verificar.mjs";
import {
  motivoDaemonDocker,
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
  caminhosRuins,
  refValida,
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
  const a = argsDocker({ binario: "B", pasta: "P", config: "C" });
  const junto = a.join(" ");
  for (const esperado of ["--network none", "--cap-drop ALL", "no-new-privileges", "--user 65534:65534", "--read-only"]) assert.ok(junto.includes(esperado), esperado);
  const montagens = a.filter((_, i) => a[i - 1] === "--mount");
  assert.equal(montagens.length, 3);
  for (const m of montagens) assert.match(m, /,readonly$/);
  const script = a.at(-1);
  for (const esperado of ["--config /cfg/gitleaks.toml", "--ignore-gitleaks-allow", "-i /tmp/vazio", "--redact ", `--exit-code ${SAIDA_ACHADO}`, "--log-level info", "--max-archive-depth 0", "--max-decode-depth 5", "--max-target-megabytes 0"]) assert.ok(script.includes(esperado), esperado);
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

test("caminhos que sairiam da pasta ou se sobrescreveriam no Windows são recusados (QA-E23B-07, 08)", () => {
  assert.deepEqual(caminhosRuins(["docs/a.md", "README.md", "a/b/c.txt", ".gitattributes"]), []);
  for (const ruim of ["x\\..\\..\\fora.txt", "a\\b.txt", "c:fora.txt", "a/../b", "./a", "a//b"]) assert.equal(caminhosRuins([ruim]).length, 1, ruim);
  assert.equal(caminhosRuins(["A.txt", "a.txt"]).length, 1);
  assert.equal(caminhosRuins(["Docs/x.md", "docs/x.md"]).length, 1);
});

test("ref do CLI: só branch, tag ou commit (QA-E23B-02)", () => {
  for (const ok of ["HEAD", "main", "origin/main", "da07163", "HEAD~1", "v1.0^"]) assert.equal(refValida(ok), true, ok);
  for (const ruim of ["--output=/tmp/x", "-x", "HEAD:d", "a..b", "", "main;rm", "$(x)"]) assert.equal(refValida(ruim), false, ruim);
  assert.match(varrer({ ref: "HEAD:docs" }).motivo, /ref recusada/);
});

test(".gitattributes com export-ignore ou working-tree-encoding não esconde segredo (QA-E23B-01)", { skip: semAmbiente ?? false }, (t) => {
  const [s1, s2, s3] = [tokenGithub(), tokenGithub(), tokenGithub()];
  const pasta = repo(t, { "a.txt": `token = "${s1}"\n`, "b.txt": `token = "${s2}"\n`, "c.txt": "nada\n" });
  mkdirSync(join(pasta, "sub"));
  writeFileSync(join(pasta, "sub", "d.txt"), `token = "${s3}"\n`);
  // Os atributos entram depois do conteúdo: o blob fica em UTF-8 e o git archive o devolveria omitido ou em UTF-16.
  writeFileSync(join(pasta, ".gitattributes"), "a.txt export-ignore\nb.txt working-tree-encoding=UTF-16LE\nsub/** export-ignore\n");
  // Só os arquivos novos: com "add -A", o git relê b.txt (índice "racily clean") e tenta convertê-lo de UTF-16.
  for (const args of [["add", ".gitattributes", "sub/d.txt"], ["-c", "user.name=t", "-c", "user.email=t@exemplo.invalid", "-c", "core.hooksPath=/dev/null", "commit", "-q", "-m", "atributos"]])
    assert.equal(spawnSync("git", args, { cwd: pasta }).status, 0, args.join(" "));
  const r = varrer({ raiz: pasta });
  assert.equal(r.ok, false, r.motivo);
  assert.deepEqual(r.achados.map((a) => a.caminho).sort(), ["a.txt", "b.txt", "sub/d.txt"]);
  const texto = JSON.stringify(r);
  for (const s of [s1, s2, s3]) assert.ok(!texto.includes(s));
});

test("daemon do Docker só serve com a versão do servidor na saída (E2-5: saída 0 com o serviço parado)", () => {
  assert.equal(motivoDaemonDocker({ status: 0, stdout: "28.0.4\n" }), null);
  assert.match(motivoDaemonDocker({ status: 0, stdout: "" }), /daemon do Docker inacessível/);
  assert.match(motivoDaemonDocker({ status: 0, stdout: "\n" }), /daemon do Docker inacessível/);
  assert.match(motivoDaemonDocker({ status: 1, stdout: "28.0.4" }), /daemon do Docker inacessível/);
  assert.match(motivoDaemonDocker({ status: null }), /daemon do Docker inacessível/);
  assert.match(motivoDaemonDocker({ ausente: true }), /não encontrado no PATH/);
});
