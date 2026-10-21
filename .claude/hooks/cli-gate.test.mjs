// Testes de regressão do gate do CLI (cli-gate.mjs): o hook recebe só o texto do comando;
// nenhum comando abaixo é executado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("./cli-gate.mjs", import.meta.url));

const projeto = (ativo) => {
  const root = mkdtempSync(join(tmpdir(), "cli-gate-"));
  mkdirSync(join(root, "registros", "alvo-a"), { recursive: true });
  if (ativo) writeFileSync(join(root, "registros", "ALVO_ATIVO"), "alvo-a\n");
  writeFileSync(join(root, "registros", "alvo-a", "00-seguranca.md"), "---\nstatus: aprovado\nniveis_aprovados: [N0, N1]\n---\n");
  return root;
};
const comAlvo = projeto(true);
const semAlvo = projeto(false);
test.after(() => [comAlvo, semAlvo].forEach((r) => rmSync(r, { recursive: true, force: true })));

const decidir = (command, root = comAlvo, raw) => {
  const out = execFileSync(process.execPath, [HOOK], {
    input: raw ?? JSON.stringify({ tool_name: "Bash", tool_input: { command }, cwd: root }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    encoding: "utf8",
  });
  return out ? JSON.parse(out).hookSpecificOutput.permissionDecision : "nenhuma";
};

test("setup/update/uninstall negados em qualquer forma (achado 2 da avaliação)", () => {
  for (const c of [
    "npx rea setup",
    'npx rea "setup"',
    "npx rea 'setup'",
    "npm run rea -- setup",
    'bash -c "npx rea setup"',
    'powershell -Command "npx rea uninstall"',
    'node "node_modules/rea-agents/scripts/rea.mjs" setup',
    "npx --package rea-agents rea setup",
    "npx rea@6.4.0 update",
    "cd x && npx rea setup",
    "node_modules\\.bin\\rea.cmd setup",
  ])
    assert.equal(decidir(c), "deny", c);
});

test("invocação simples sem alvo passa sem decisão", () => {
  for (const c of ["npx rea --help", "npx rea doctor", "npx rea mcp doctor", "npx rea@6.4.0 providers", "npx rea", "npm run doctor"])
    assert.equal(decidir(c, semAlvo), "nenhuma", c);
});

test("invocação reconhecida contra alvo: confirmação com alvo aprovado, negada sem", () => {
  assert.equal(decidir("npx rea analyze alvos/alvo-a/app.exe"), "ask");
  assert.equal(decidir("npm run rea -- analyze alvos/alvo-a/app.exe"), "ask");
  assert.equal(decidir("npx rea analyze alvos/alvo-a/app.exe", semAlvo), "deny");
});

test("menção ambígua ao REA pede confirmação (fail-closed)", () => {
  for (const c of [
    'git commit -m "fix rea gate"',
    'npx rea "analyze" x.exe',
    "npx rea analyze x.exe | tee log.txt",
    'bash -c "npx rea analyze x.exe"',
    "X=$(npx rea analyze x.exe)",
    'git commit -m "update rea docs"',
  ])
    assert.equal(decidir(c, semAlvo), "ask", c);
});

test("comandos que não mencionam o REA seguem sem decisão", () => {
  for (const c of [
    "git status",
    "node --test .claude/hooks/rea-gate.test.mjs",
    "cat .claude/hooks/rea-niveis.json",
    "echo área reabrir",
    "npm run update-deps",
  ])
    assert.equal(decidir(c, semAlvo), "nenhuma", c);
});

test("entrada ilegível é negada", () => {
  assert.equal(decidir("", semAlvo, "{ quebrado"), "deny");
});
