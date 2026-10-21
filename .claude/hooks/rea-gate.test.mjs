// Testes de regressão do gate MCP (rea-gate.mjs): roda o hook de verdade, com entradas
// sintéticas, num projeto temporário. Nenhuma tool é chamada.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOK = fileURLToPath(new URL("./rea-gate.mjs", import.meta.url));

const projeto = ({ ativo = "alvo-a", status = "aprovado", niveis = "N0, N1, N3" } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "rea-gate-"));
  for (const dir of ["registros/alvo-a", "registros/alvo-b", "alvos/alvo-a", "alvos/alvo-b", "saidas/alvo-a", "fora"])
    mkdirSync(join(root, dir), { recursive: true });
  if (ativo) writeFileSync(join(root, "registros", "ALVO_ATIVO"), `${ativo}\n`);
  for (const slug of ["alvo-a", "alvo-b"])
    writeFileSync(join(root, "registros", slug, "00-seguranca.md"), `---\nstatus: ${status}\nniveis_aprovados: [${niveis}]\n---\n`);
  return root;
};

const decidir = (root, tool_name, tool_input = {}) => {
  const out = execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input, cwd: root }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    encoding: "utf8",
  });
  return JSON.parse(out).hookSpecificOutput.permissionDecision;
};

test("caminho dentro de alvos/<slug>/ ou saidas/<slug>/ é liberado", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-a", "app.exe") }), "allow");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "allow");
  assert.equal(decidir(root, "mcp__rea__inspect_pe_resources", { path: join(root, "saidas", "alvo-a", "x.dll") }), "allow");
  assert.equal(
    decidir(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-a", "app.exe"), snapshot_path: join(root, "saidas", "alvo-a", "snap.db") }),
    "allow",
  );
});

test("caminho fora do alvo ativo é negado (achado 1 da avaliação)", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "C:/fora-do-alvo/b.exe" }), "deny");
  assert.equal(decidir(root, "mcp__rea__inspect_artifact", { path: join(root, "fora", "kernel32.dll") }), "deny");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-b", "b.exe") }), "deny", "outro alvo aprovado");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/../alvo-b/b.exe" }), "deny", "travessia com ..");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-a-falso", "b.exe") }), "deny", "prefixo parecido");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: pathToFileURL(join(root, "fora", "b.exe")).href }), "deny", "file://");
  assert.equal(
    decidir(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-a", "app.exe"), snapshot_path: join(root, "fora", "s.db") }),
    "deny",
    "um argumento fora basta",
  );
});

test("caminhos em listas e em chaves não mapeadas também são conferidos", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__trace_dylib_resolution", { path: "alvos/alvo-a/a.dylib", roots: [join(root, "fora")] }), "deny");
  assert.equal(decidir(root, "mcp__rea__inspect_analysis_view", { source: join(root, "fora", "view.json") }), "deny");
});

test("link ou junção dentro do alvo que aponta para fora é negado", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  symlinkSync(join(root, "fora"), join(root, "alvos", "alvo-a", "atalho"), "junction");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/atalho/b.exe" }), "deny");
});

test("N0 sem caminho passa sem alvo; N0 com caminho exige o alvo ativo", (t) => {
  const semAlvo = projeto({ ativo: "" });
  const root = projeto();
  t.after(() => [semAlvo, root].forEach((r) => rmSync(r, { recursive: true, force: true })));
  assert.equal(decidir(semAlvo, "mcp__rea__get_evidence_bundle", {}), "allow");
  assert.equal(decidir(semAlvo, "mcp__rea__import_evidence_bundle", { path: join(semAlvo, "saidas", "x.json") }), "deny");
  assert.equal(decidir(root, "mcp__rea__import_evidence_bundle", { path: "saidas/alvo-a/evidence.json" }), "allow");
  assert.equal(decidir(root, "mcp__rea__export_evidence_bundle", { path: join(root, "fora", "e.json") }), "deny");
});

test("campos isentos e texto livre não são tratados como caminho", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__binary_session", { expected_server_path: "C:/Program Files/Hopper/hopper.exe" }), "allow");
  assert.equal(decidir(root, "mcp__rea__search_strings", { pattern: "C:\\\\Users\\\\.*\\.ini", document: "app.exe" }), "allow");
  assert.equal(decidir(root, "mcp__rea__capture_web_screenshot", { url: "https://example.com/a/b.png" }), "deny", "N2 fora do plano, não por caminho");
});

test("regras anteriores continuam: mapa, protocolo, nível e confirmação de N3", (t) => {
  const root = projeto();
  const pendente = projeto({ status: "pendente" });
  t.after(() => [root, pendente].forEach((r) => rmSync(r, { recursive: true, force: true })));
  assert.equal(decidir(root, "mcp__rea__tool_inexistente", {}), "deny");
  assert.equal(decidir(root, "mcp__desconhecido__x", {}), "deny");
  assert.equal(decidir(pendente, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "deny");
  assert.equal(decidir(root, "mcp__rea__capture_process_scenario", { executable: "alvos/alvo-a/app.exe" }), "ask");
  assert.equal(decidir(root, "mcp__rea__capture_process_scenario", { executable: "C:/Windows/notepad.exe" }), "deny");
  assert.equal(decidir(root, "mcp__ghidra__decompile_function", { name: "main" }), "allow");
});
