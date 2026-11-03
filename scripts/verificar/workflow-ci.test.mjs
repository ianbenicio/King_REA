// Regras do workflow da CI (npm test; story MEL-08). Prende o .github/workflows/verificacao.yml ao agregador
// (mesmos jobs e mesmos componentes no --so), à auditoria das actions (mesmo SHA, versão no comentário) e às
// configurações obrigatórias do desenho §1 e da auditoria. Leitura de texto: sem dependência de parser YAML.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { JOBS } from "./agregar-ci.mjs";
import { COMPONENTES } from "./verificar.mjs";
import { IMAGEM, SHA256_BINARIO } from "../publicacao/gitleaks.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const ler = (p) => readFileSync(join(RAIZ, p), "utf8").replace(/\r\n/g, "\n");
const YAML = ler(".github/workflows/verificacao.yml");
const AUDITORIA = ler("docs/seguranca/auditoria-actions-ci.md");
const semComentarios = YAML.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
const conta = (re) => [...semComentarios.matchAll(re)].length;

/** Seções dos jobs: id → texto (do "  <id>:" até o próximo job). */
function jobsDoYaml() {
  const corpo = semComentarios.slice(semComentarios.indexOf("\njobs:\n") + 7);
  const secoes = new Map();
  let atual;
  for (const linha of corpo.split("\n")) {
    const m = linha.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (m) {
      atual = m[1];
      secoes.set(atual, "");
    } else if (atual) secoes.set(atual, `${secoes.get(atual)}${linha}\n`);
  }
  return secoes;
}

test("jobs do workflow são os do agregador mais o resultado, que depende de todos e roda sempre", () => {
  const jobs = jobsDoYaml();
  assert.deepEqual([...jobs.keys()].sort(), [...JOBS.map((j) => j.id), "resultado"].sort());
  const resultado = jobs.get("resultado");
  const needs = resultado.match(/needs: \[([^\]]*)\]/)?.[1].split(",").map((s) => s.trim());
  assert.deepEqual(needs?.sort(), JOBS.map((j) => j.id).sort());
  assert.match(resultado, /\n {4}if: always\(\)\n/);
  assert.match(resultado, /agregar-ci\.mjs --dir ci-json --resumo "\$GITHUB_STEP_SUMMARY"/);
});

test("cada job roda o verificador com o --so igual aos componentes do agregador e publica o JSON dele", () => {
  const jobs = jobsDoYaml();
  for (const job of JOBS) {
    const secao = jobs.get(job.id);
    const so = [...secao.matchAll(/node scripts\/verificar\/verificar\.mjs --so ([\w,-]+) --json > (\S+)/g)];
    assert.equal(so.length, 1, `${job.id}: uma chamada ao verificador, direta (sem npm run)`);
    assert.deepEqual(so[0][1].split(","), job.componentes, `${job.id}: --so diferente do agregador`);
    assert.equal(so[0][2], `verificar-${job.id}.json`);
    assert.equal(job.componentes[0], "ambiente-node", `${job.id}: Node conferido primeiro (QA-E24B-02)`);
    assert.match(secao, new RegExp(`name: verificar-${job.id}\\n\\s+path: verificar-${job.id}\\.json\\n`));
  }
});

test("todo componente do verificador aparece em algum job da CI", () => {
  const cobertos = new Set(JOBS.flatMap((j) => j.componentes));
  for (const c of COMPONENTES) assert.ok(cobertos.has(c.id), `${c.id} não roda em nenhum job`);
});

test("actions só as auditadas, pelo SHA completo da auditoria, com a versão no comentário", () => {
  const auditadas = new Map(
    [...AUDITORIA.matchAll(/^\| `(actions\/[\w-]+)` \| (v[\d.]+) \| `([0-9a-f]{40})` \|/gm)].map((m) => [m[1], { versao: m[2], sha: m[3] }]),
  );
  assert.equal(auditadas.size, 5, "tabela de resumo da auditoria");
  const usos = [...semComentarios.matchAll(/uses: (.*)/g)].map((m) => m[1].trim());
  assert.ok(usos.length > 0);
  for (const uso of usos) {
    const m = uso.match(/^(actions\/[\w-]+)@([0-9a-f]{40}) # (v[\d.]+)$/);
    assert.ok(m, `forma inválida (tag, branch ou sem comentário de versão): ${uso}`);
    const a = auditadas.get(m[1]);
    assert.ok(a, `action fora da auditoria: ${m[1]}`);
    assert.equal(m[2], a.sha, `${m[1]}: SHA diferente do auditado`);
    assert.equal(m[3], a.versao, `${m[1]}: comentário de versão diferente do auditado`);
  }
});

test("configurações obrigatórias: permissões, gatilho, credenciais, upload, sem segredo e sem cache", () => {
  assert.match(semComentarios, /^permissions:\n {2}contents: read\n\n/m, "só contents: read no workflow");
  assert.doesNotMatch(semComentarios, /^ +permissions:/m, "nenhum job amplia as permissões");
  assert.doesNotMatch(semComentarios, /pull_request_target|secrets\.|\btoken\b|cache:|cache-dependency-path|registry-url|mirror|check-latest|source-url|github-token|run-id|repository:|include-hidden-files|self-hosted/);
  assert.doesNotMatch(semComentarios, /-latest\b/, "runner por rótulo com versão");
  assert.equal(conta(/actions\/checkout@/g), conta(/persist-credentials: false/g), "todo checkout sem credenciais persistidas");
  const uploads = conta(/actions\/upload-artifact@/g);
  assert.equal(uploads, JOBS.length);
  assert.equal(conta(/if-no-files-found: error/g), uploads);
  assert.equal(conta(/retention-days: 7/g), uploads);
  assert.equal(conta(/guarda de alvos\/ e saidas\//g), JOBS.length + 1, "guarda em todo job");
});

test("contêiner pelo digest do código e gitleaks com o SHA-256 da auditoria", () => {
  assert.doesNotMatch(semComentarios, /semgrep\/semgrep[:@]/, "o digest mora no código, não no YAML");
  assert.match(IMAGEM, /^semgrep\/semgrep@sha256:[0-9a-f]{64}$/);
  assert.equal(conta(/docker pull "\$\(node --input-type=module -e "import \{ IMAGEM \} from '\.\/scripts\/publicacao\/gitleaks\.mjs'/g), 2);
  assert.match(semComentarios, new RegExp(`${SHA256_BINARIO}  \\$d/linux/gitleaks" \\| sha256sum -c -`));
  assert.match(semComentarios, /551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb {2}\$d\/download\/gitleaks_8\.30\.1_linux_x64\.tar\.gz" \| sha256sum -c -/);
});

