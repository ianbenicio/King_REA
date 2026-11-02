// Provas dos componentes de ferramenta do verificador (MEL-03, AC4a e AC4b): rodam a ferramenta fixada
// numa cópia temporária com a configuração do repositório. Violação plantada reprova; ferramenta ausente
// sai "não executado" com "requisito ausente", nunca aprovado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESCOPO_LINT, ESTADOS, SAIDA, agregar, componenteLint, executarPlano } from "./verificar.mjs";

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
