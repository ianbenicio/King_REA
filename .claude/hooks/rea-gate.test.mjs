// Testes de regressão do gate MCP (rea-gate.mjs): roda o hook de verdade, com entradas
// sintéticas, num projeto temporário. Nenhuma tool é chamada.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOK = fileURLToPath(new URL("./rea-gate.mjs", import.meta.url));
const sha = (text) => createHash("sha256").update(text).digest("hex");

// Arquivos originais da fixture, copiados para alvos/<slug>/ e registrados na seção
// "Identidade dos arquivos" (MEL-06a). `identidade` substitui a seção inteira.
const ORIGINAIS = { "app.exe": "MZ original", "lib/a.dylib": "dylib original" };
const tabela = (arquivos = ORIGINAIS) =>
  `## 8. Identidade dos arquivos\n\n<!-- caminho relativo a alvos/<slug>/ -->\n\n| Arquivo | SHA-256 |\n|---|---|\n${Object.entries(arquivos)
    .map(([nome, conteudo]) => `| \`${nome}\` | \`${sha(conteudo)}\` |`)
    .join("\n")}\n`;

const projeto = ({ ativo = "alvo-a", status = "aprovado", niveis = "N0, N1, N3", identidade = tabela() } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "rea-gate-"));
  for (const dir of ["registros/alvo-a", "registros/alvo-b", "alvos/alvo-a/lib", "alvos/alvo-b", "saidas/alvo-a", "fora"])
    mkdirSync(join(root, dir), { recursive: true });
  if (ativo) writeFileSync(join(root, "registros", "ALVO_ATIVO"), `${ativo}\n`);
  for (const [nome, conteudo] of Object.entries(ORIGINAIS)) writeFileSync(join(root, "alvos", "alvo-a", nome), conteudo);
  for (const slug of ["alvo-a", "alvo-b"])
    writeFileSync(
      join(root, "registros", slug, "00-seguranca.md"),
      `---\nstatus: ${status}\nniveis_aprovados: [${niveis}]\n---\n\n## 2. Triagem passiva\n\n| SHA-256 | ver seção 8 |\n\n${identidade}\n## Adendos\n`,
    );
  return root;
};

const consultar = (root, tool_name, tool_input = {}) => {
  const out = execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input, cwd: root }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    encoding: "utf8",
  });
  return JSON.parse(out).hookSpecificOutput;
};
const decidir = (root, tool_name, tool_input = {}) => consultar(root, tool_name, tool_input).permissionDecision;

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
  t.after(() => {
    for (const r of [semAlvo, root]) rmSync(r, { recursive: true, force: true });
  });
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
  t.after(() => {
    for (const r of [root, pendente]) rmSync(r, { recursive: true, force: true });
  });
  assert.equal(decidir(root, "mcp__rea__tool_inexistente", {}), "deny");
  assert.equal(decidir(root, "mcp__desconhecido__x", {}), "deny");
  assert.equal(decidir(pendente, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "deny");
  assert.equal(decidir(root, "mcp__rea__capture_process_scenario", { executable: "alvos/alvo-a/app.exe" }), "ask");
  assert.equal(decidir(root, "mcp__rea__capture_process_scenario", { executable: "C:/Windows/notepad.exe" }), "deny");
  assert.equal(decidir(root, "mcp__ghidra__decompile_function", { name: "main" }), "allow");
});

// ---------- MEL-06a: identidade na admissão ----------

test("arquivo substituído depois da aprovação é bloqueado na admissão; o original passa (MEL-06a, aceite 1)", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "allow", "original");
  writeFileSync(join(root, "alvos", "alvo-a", "app.exe"), "MZ trocado");
  const negado = consultar(root, "mcp__rea__open_binary", { path: join(root, "alvos", "alvo-a", "app.exe") });
  assert.equal(negado.permissionDecision, "deny", "conteúdo trocado no mesmo caminho");
  assert.match(negado.permissionDecisionReason, /diverge do registrado/);
  assert.equal(decidir(root, "mcp__rea__inspect_pe_resources", { path: "alvos/alvo-a/app.exe" }), "deny", "toda tool com caminho em alvos/ admite");
  assert.equal(decidir(root, "mcp__rea__capture_process_scenario", { executable: "alvos/alvo-a/app.exe" }), "deny", "N3 também");
  assert.equal(decidir(root, "mcp__rea__compare_artifacts", { local_path: "alvos/alvo-a/app.exe" }), "deny", "N0 com caminho em alvos/ também");
  writeFileSync(join(root, "alvos", "alvo-a", "app.exe"), "MZ original");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "allow", "original de volta");
});

test("vários arquivos: cada um confere com o seu hash; diretório admitido confere todos (MEL-06a)", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/lib/a.dylib" }), "allow");
  assert.equal(decidir(root, "mcp__rea__trace_dylib_resolution", { roots: [join(root, "alvos", "alvo-a")] }), "allow", "diretório com tudo registrado");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "ALVOS/ALVO-A/APP.EXE" }), process.platform === "win32" ? "allow" : "deny", "caixa no Windows");
  writeFileSync(join(root, "alvos", "alvo-a", "lib", "a.dylib"), "dylib trocada");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }), "allow", "o outro arquivo segue liberado");
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/lib/a.dylib" }), "deny");
  assert.equal(decidir(root, "mcp__rea__trace_dylib_resolution", { roots: [join(root, "alvos", "alvo-a")] }), "deny", "um arquivo trocado no diretório");
  writeFileSync(join(root, "alvos", "alvo-a", "lib", "a.dylib"), "dylib original");
  writeFileSync(join(root, "alvos", "alvo-a", "lib", "extra.dylib"), "sem registro");
  const extra = consultar(root, "mcp__rea__analyze_javascript_application", { input_path: join(root, "alvos", "alvo-a") });
  assert.equal(extra.permissionDecision, "deny", "arquivo sem hash dentro do diretório");
  assert.match(extra.permissionDecisionReason, /lib\/extra\.dylib, que não tem SHA-256 registrado/);
});

test("alvo sem hash registrado, ou com hash ambíguo, é bloqueado sem tocar no registro (MEL-06a, aceite 2)", (t) => {
  const casos = {
    "sem seção": "",
    "seção vazia": "## 8. Identidade dos arquivos\n\n| Arquivo | SHA-256 |\n|---|---|\n",
    "hash abreviado": "## 8. Identidade dos arquivos\n\n| Arquivo | SHA-256 |\n|---|---|\n| `app.exe` | `DA5807BB…76ED7C5B` |\n",
    "caminho com dois hashes": `${tabela()}| \`./app.exe\` | \`${sha("outro")}\` |\n`,
    "seção repetida": `${tabela()}\n${tabela()}`,
    "caminho que sai do alvo": `${tabela({ "../alvo-b/b.exe": "x" })}`,
  };
  for (const [caso, identidade] of Object.entries(casos)) {
    const root = projeto({ identidade });
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const registro = join(root, "registros", "alvo-a", "00-seguranca.md");
    const antes = readFileSync(registro);
    const r = consultar(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" });
    assert.equal(r.permissionDecision, "deny", caso);
    assert.match(r.permissionDecisionReason, /Identidade dos arquivos/, caso);
    assert.match(r.permissionDecisionReason, /protocolo-seguranca/, caso);
    assert.deepEqual(readFileSync(registro), antes, `${caso}: registro intacto`);
    assert.match(readFileSync(registro, "utf8"), /^status: aprovado\nniveis_aprovados: \[N0, N1, N3\]$/m, caso);
  }
  const semSecao = projeto({ identidade: "" });
  t.after(() => rmSync(semSecao, { recursive: true, force: true }));
  assert.match(consultar(semSecao, "mcp__rea__open_binary", { path: "alvos/alvo-a/app.exe" }).permissionDecisionReason, /sem hash registrado/);
});

test("só a admissão confere: saidas/, consultas sem caminho e Ghidra não comparam hash (MEL-06a)", (t) => {
  const root = projeto({ identidade: "" });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "saidas", "alvo-a", "extraido.dll"), "derivado");
  writeFileSync(join(root, "saidas", "alvo-a", "evidence.json"), "{}");
  assert.equal(decidir(root, "mcp__rea__inspect_pe_resources", { path: "saidas/alvo-a/extraido.dll" }), "allow", "saída derivada");
  assert.equal(decidir(root, "mcp__rea__import_evidence_bundle", { path: "saidas/alvo-a/evidence.json" }), "allow", "bundle de evidência");
  assert.equal(decidir(root, "mcp__rea__extract_artifact", { integrity_policy: "fail" }), "allow", "opera sobre o documento aberto");
  assert.equal(decidir(root, "mcp__rea__procedure_pseudo_code", { procedure: "main", document: "app.exe" }), "allow", "consulta");
  assert.equal(decidir(root, "mcp__ghidra__decompile_function", { name: "main" }), "allow", "limite: Ghidra fica para a MEL-06");
});

test("admissão em alvos/ exige arquivo existente e sem link (MEL-06a)", (t) => {
  const root = projeto();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(decidir(root, "mcp__rea__open_binary", { path: "alvos/alvo-a/nao-existe.exe" }), "deny");
  assert.equal(
    decidir(root, "mcp__rea__extract_firmware", { path: "alvos/alvo-a/app.exe", output_directory: join(root, "alvos", "alvo-a", "saida") }),
    "deny",
    "saída gravada em alvos/",
  );
  assert.equal(
    decidir(root, "mcp__rea__extract_firmware", { path: "alvos/alvo-a/app.exe", output_directory: join(root, "saidas", "alvo-a", "fw") }),
    "allow",
  );
  symlinkSync(join(root, "alvos", "alvo-a", "lib"), join(root, "alvos", "alvo-a", "atalho-interno"), "junction");
  assert.equal(decidir(root, "mcp__rea__trace_dylib_resolution", { roots: [join(root, "alvos", "alvo-a")] }), "deny", "link dentro do diretório admitido");
});
