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

// MEL-01: um arquivo inválido não derruba o lote (achado A05 do parecer de 01/11/2026).
const wav = (dados, { tamanhoDeclarado = dados.length } = {}) => {
  const fmt = Buffer.alloc(16);
  fmt.writeUInt16LE(1, 0); // PCM
  fmt.writeUInt16LE(1, 2); // mono
  fmt.writeUInt32LE(8000, 4); // amostras/s
  fmt.writeUInt32LE(8000, 8); // bytes/s
  fmt.writeUInt16LE(1, 12);
  fmt.writeUInt16LE(8, 14);
  const chunk = (id, corpo, tamanho = corpo.length) => {
    const h = Buffer.alloc(8);
    h.write(id, 0, "latin1");
    h.writeUInt32LE(tamanho, 4);
    return Buffer.concat([h, corpo]);
  };
  const corpo = Buffer.concat([Buffer.from("WAVE"), chunk("fmt ", fmt), chunk("data", dados, tamanhoDeclarado)]);
  const riff = Buffer.alloc(8);
  riff.write("RIFF", 0, "latin1");
  riff.writeUInt32LE(corpo.length, 4);
  return Buffer.concat([riff, corpo]);
};
const WAV_TRUNCADO = Buffer.from("RIFF0000WAVE", "latin1"); // reprodução do parecer: 12 bytes

const lote = (t) => {
  const { origem, destino, arquivo } = cenario(t);
  mkdirSync(join(origem, "sfx"), { recursive: true });
  mkdirSync(join(origem, "music"), { recursive: true });
  writeFileSync(join(origem, "sfx", "a-truncado.wav"), WAV_TRUNCADO);
  writeFileSync(arquivo, png("v1"));
  writeFileSync(join(origem, "ui", "zz-copia.png"), png("v1"));
  writeFileSync(join(origem, "music", "tema.wav"), wav(Buffer.alloc(800, 0x80)));
  return { origem, destino, arquivo };
};
const rodar = (origem, destino, ...extra) => {
  const r = spawnSync(process.execPath, [SCRIPT, "--origem", origem, "--destino", destino, ...extra], { encoding: "utf8" });
  const pastaCat = join(destino, "_catalogo");
  const catalogo = existsSync(join(pastaCat, "catalogo.json")) ? JSON.parse(readFileSync(join(pastaCat, "catalogo.json"), "utf8")) : null;
  const item = (rel) => catalogo?.itens.find((i) => i.caminho_original === rel);
  return { status: r.status, stderr: r.stderr, pastaCat, catalogo, item };
};

test("WAV truncado entra no catálogo como invalido e os válidos seguem (simulação, como no parecer)", (t) => {
  const { origem, destino } = lote(t);
  const r = rodar(origem, destino, "--simular");
  assert.equal(r.status, 1, r.stderr);
  const ruim = r.item("sfx/a-truncado.wav");
  assert.equal(ruim.estado, "invalido");
  assert.equal(ruim.tipo, "audio");
  assert.equal(ruim.tamanho, 12);
  assert.match(ruim.erro, /^validação: cabeçalho RIFF\/WAVE truncado: 12 bytes/);
  assert.equal(ruim.destino, "");
  assert.equal(r.item("ui/icone.png").estado, "simulado");
  assert.equal(r.item("music/tema.wav").estado, "simulado");
  assert.match(r.stderr, /inválido/);
});

test("lote com falha parcial grava JSON, CSV e resumo, sai com 1 e preserva cópia, hash e dedup dos válidos", (t) => {
  const { origem, destino } = lote(t);
  const r = rodar(origem, destino);
  assert.equal(r.status, 1, r.stderr);
  for (const nome of ["catalogo.json", "catalogo.csv", "resumo.md"]) assert.ok(existsSync(join(r.pastaCat, nome)), nome);
  assert.match(readFileSync(join(r.pastaCat, "catalogo.csv"), "utf8"), /sfx\/a-truncado\.wav,audio,wav,.*,invalido,,validação: /);
  const resumo = readFileSync(join(r.pastaCat, "resumo.md"), "utf8");
  assert.match(resumo, /\| sfx\/a-truncado\.wav \| invalido \| validação: cabeçalho RIFF\/WAVE truncado/);

  const icone = r.item("ui/icone.png");
  assert.equal(icone.estado, "copiado");
  assert.equal(icone.categoria, "ui");
  assert.equal(icone.sha256, hash(png("v1")));
  assert.equal(hash(readFileSync(join(destino, icone.destino))), icone.sha256);
  const copia = r.item("ui/zz-copia.png");
  assert.equal(copia.estado, "duplicata");
  assert.equal(copia.duplicata_de, "ui/icone.png");
  const tema = r.item("music/tema.wav");
  assert.equal(tema.estado, "copiado");
  assert.equal(tema.categoria, "musica");
  assert.equal(tema.info, "0.10 s");
  assert.ok(!existsSync(join(destino, "audio", "sfx", "sfx", "a-truncado.wav")), "inválido não é gravado");

  // reexecução: válidos reaproveitados, inválido continua listado, nada sobrescrito
  const r2 = rodar(origem, destino);
  assert.equal(r2.status, 1);
  assert.equal(r2.item("ui/icone.png").estado, "reutilizado");
  assert.equal(r2.item("music/tema.wav").estado, "reutilizado");
  assert.equal(r2.item("sfx/a-truncado.wav").estado, "invalido");
});

test("WAV com chunk maior que o arquivo vira invalido", (t) => {
  const { origem, destino, arquivo } = cenario(t);
  writeFileSync(arquivo, png("v1"));
  writeFileSync(join(origem, "ui", "corte.wav"), wav(Buffer.alloc(100), { tamanhoDeclarado: 8000 }));
  const r = rodar(origem, destino);
  assert.equal(r.status, 1);
  const corte = r.item("ui/corte.wav");
  assert.equal(corte.estado, "invalido");
  assert.match(corte.erro, /chunk 'data' declara 8000 bytes, mas restam 100/);
  assert.equal(r.item("ui/icone.png").estado, "copiado");
});

test("origem inexistente é erro fatal (código 2), não um catálogo vazio", (t) => {
  const { origem, destino } = cenario(t);
  const r = rodar(join(origem, "nao-existe"), destino);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Origem inacessível/);
  assert.equal(r.catalogo, null);
});
