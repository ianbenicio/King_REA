// Testes de regressão do organizador de assets: arquivos sintéticos em pasta temporária.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./organizar-assets.mjs", import.meta.url));
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = (marca) => Buffer.concat([PNG, Buffer.alloc(24), Buffer.from(marca)]);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

const cenario = (t) => {
  const base = mkdtempSync(join(tmpdir(), "organizar-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const origem = join(base, "origem");
  const destino = join(base, "destino");
  mkdirSync(join(origem, "ui"), { recursive: true });
  return { origem, destino, arquivo: join(origem, "ui", "icone.png") };
};
const organizar = (origem, destino, ...extra) => {
  const r = spawnSync(process.execPath, [SCRIPT, "--origem", origem, "--destino", destino, ...extra], { encoding: "utf8" });
  const catalogo = JSON.parse(readFileSync(join(destino, "_catalogo", "catalogo.json"), "utf8"));
  return { status: r.status, item: catalogo.itens.find((i) => i.caminho_original === "ui/icone.png"), stderr: r.stderr };
};

test("primeira execução copia; repetir com o mesmo conteúdo reaproveita", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  const r1 = organizar(origem, destino);
  assert.equal(r1.status, 0);
  assert.equal(r1.item.estado, "copiado");
  assert.equal(hash(readFileSync(join(destino, r1.item.destino))), r1.item.sha256);
  const r2 = organizar(origem, destino);
  assert.equal(r2.status, 0);
  assert.equal(r2.item.estado, "reutilizado");
});

test("origem alterada com destino ocupado vira conflito e não muda o destino (achado 3 da avaliação)", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  const r1 = organizar(origem, destino);
  writeFileSync(arquivo, png("v2"));
  const r2 = organizar(origem, destino);
  assert.equal(r2.status, 1);
  assert.equal(r2.item.estado, "conflito");
  assert.equal(r2.item.sha256, hash(png("v2")));
  assert.equal(r2.item.sha256_destino, r1.item.sha256);
  assert.equal(hash(readFileSync(join(destino, r2.item.destino))), r1.item.sha256, "destino preservado");
  assert.match(readFileSync(join(destino, "_catalogo", "resumo.md"), "utf8"), /conflito/);
});

test("--mover não sobrescreve destino com conteúdo diferente e mantém a origem", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  const r1 = organizar(origem, destino);
  writeFileSync(arquivo, png("v2"));
  const r2 = organizar(origem, destino, "--mover");
  assert.equal(r2.status, 1);
  assert.equal(r2.item.estado, "conflito");
  assert.ok(existsSync(arquivo), "origem mantida");
  assert.equal(hash(readFileSync(join(destino, r1.item.destino))), r1.item.sha256);
});

test("--mover em destino livre move", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  const r = organizar(origem, destino, "--mover");
  assert.equal(r.status, 0);
  assert.equal(r.item.estado, "movido");
  assert.ok(!existsSync(arquivo));
});

test("--simular não grava nada", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  const r = organizar(origem, destino, "--simular");
  assert.equal(r.status, 0);
  assert.equal(r.item.estado, "simulado");
  assert.ok(!existsSync(join(destino, r.item.destino)));
});
