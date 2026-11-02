// Provas dos componentes de ferramenta do verificador (MEL-03, AC4a e AC4b): rodam a ferramenta fixada
// numa cópia temporária com a configuração do repositório. Violação plantada reprova; ferramenta ausente
// sai "não executado" com "requisito ausente", nunca aprovado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESCOPO_LINT, ESTADOS, SAIDA, agregar, componenteLint, componenteTipos, executarPlano } from "./verificar.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const relogio = () => 0;
const aprovado = { id: "ambiente-node", executar: () => ({ ok: true }) };

/** Cópia temporária com a configuração do lint e um arquivo por pasta do escopo. */
function copiaLint(conteudo) {
  const dir = mkdtempSync(join(tmpdir(), "prking-lint-"));
  copyFileSync(join(RAIZ, "biome.json"), join(dir, "biome.json"));
  for (const pasta of ESCOPO_LINT) {
    mkdirSync(join(dir, pasta), { recursive: true });
    writeFileSync(join(dir, pasta, "modulo.mjs"), "export const soma = (a, b) => a + b;\n");
  }
  if (conteudo) writeFileSync(join(dir, ESCOPO_LINT[0], "plantado.mjs"), conteudo);
  return dir;
}

test("lint: cópia limpa aprova", (t) => {
  const dir = copiaLint();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const [, r] = executarPlano([aprovado, componenteLint({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.aprovado, r.detalhe);
});

test("lint: violação plantada no escopo reprova", (t) => {
  const dir = copiaLint("export function f(x) {\n  let y;\n  if ((y = x)) return y;\n  return 0;\n}\n");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const [, r] = executarPlano([aprovado, componenteLint({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.falhou);
  assert.match(r.detalhe, /noAssignInExpressions/);
  assert.equal(agregar([r]).codigo, SAIDA.falhou);
});

test("lint: aviso também reprova (--error-on-warnings)", (t) => {
  const dir = copiaLint("export const f = (x) => (x++, x);\n");
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const [, r] = executarPlano([aprovado, componenteLint({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.falhou);
  assert.match(r.detalhe, /noCommaOperator/);
});

test("lint: sem o Biome instalado sai requisito ausente, nunca aprovado", () => {
  const [, r] = executarPlano([aprovado, componenteLint({ biome: join(tmpdir(), "nao-existe", "biome") })], {}, relogio);
  assert.equal(r.estado, ESTADOS.naoExecutado);
  assert.match(r.motivo, /^requisito ausente: Biome não instalado/);
  assert.equal(agregar([r]).codigo, SAIDA.incompleto);
});

/** Cópia temporária do tsconfig.json e dos arquivos que ele lista (os módulos de política reais). */
function copiaTipos() {
  const dir = mkdtempSync(join(tmpdir(), "prking-tipos-"));
  copyFileSync(join(RAIZ, "tsconfig.json"), join(dir, "tsconfig.json"));
  const { files } = JSON.parse(readFileSync(join(RAIZ, "tsconfig.json"), "utf8"));
  for (const arquivo of files) {
    mkdirSync(dirname(join(dir, arquivo)), { recursive: true });
    copyFileSync(join(RAIZ, arquivo), join(dir, arquivo));
  }
  return { dir, files };
}

test("tipos: cópia dos módulos de política aprova", (t) => {
  const { dir } = copiaTipos();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const [, r] = executarPlano([aprovado, componenteTipos({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.aprovado, r.detalhe);
});

test("tipos: erro de tipo plantado num módulo de política reprova", (t) => {
  const { dir, files } = copiaTipos();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const gate = files.find((f) => f.endsWith("rea-gate.mjs"));
  appendFileSync(join(dir, gate), '\n/** @type {number} */\nexport const plantado = "texto";\n');
  const [, r] = executarPlano([aprovado, componenteTipos({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.falhou);
  assert.match(r.detalhe, /rea-gate\.mjs\(\d+,\d+\): error TS2322/);
  assert.equal(agregar([r]).codigo, SAIDA.falhou);
});

test("tipos: a anotação de decide() é conferida (decisão fora de allow/deny/ask reprova)", (t) => {
  const { dir, files } = copiaTipos();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const gate = files.find((f) => f.endsWith("cli-gate.mjs"));
  appendFileSync(join(dir, gate), '\nif (process.env.PLANTADO) decide("talvez", "teste");\n');
  const [, r] = executarPlano([aprovado, componenteTipos({ raiz: dir })], {}, relogio);
  assert.equal(r.estado, ESTADOS.falhou);
  assert.match(r.detalhe, /cli-gate\.mjs\(\d+,\d+\): error TS2345/);
});

test("tipos: sem o TypeScript instalado sai requisito ausente, nunca aprovado", () => {
  const [, r] = executarPlano([aprovado, componenteTipos({ tsc: join(tmpdir(), "nao-existe", "tsc") })], {}, relogio);
  assert.equal(r.estado, ESTADOS.naoExecutado);
  assert.match(r.motivo, /^requisito ausente: TypeScript não instalado/);
  assert.equal(agregar([r]).codigo, SAIDA.incompleto);
});
