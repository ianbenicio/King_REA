// Política de publicação (MEL-04): mesma decisão pela entrada do hook e pela da CI (AC1), relatório sem o
// valor (AC4) e exceções versionadas (AC6). Os casos pelo hook real estão em pre-commit.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARQUIVO_EXCECOES, REGRAS_SEGREDO, avaliar, decidir, lerExcecoes, mudancasDaArvore, mudancasDeNameStatus, mudancasDoIndice, mudancasEntre, relatorio } from "./publicacao.mjs";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const parte = (...p) => p.join("");
const JWT = parte("ey", "JhbGciOiJIUzI1NiJ9", ".", "ey", "JzdWIiOiJzaW50ZXRpY28ifQ", ".", "c2lnbmF0dXJhLXNpbnRldGljYQ");
const PEM = parte("-----BEGIN ", "OPENSSH PRIVATE", " KEY-----");

function repositorio(t) {
  const dir = mkdtempSync(join(tmpdir(), "prking-publicacao-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "teste@exemplo.invalid");
  git("config", "user.name", "teste");
  git("config", "core.autocrlf", "false");
  const escrever = (mapa) => {
    for (const [caminho, conteudo] of Object.entries(mapa)) {
      mkdirSync(dirname(join(dir, caminho)), { recursive: true });
      writeFileSync(join(dir, caminho), conteudo);
      git("add", "-f", "--", caminho);
    }
  };
  return { dir, git, escrever };
}

test("AC1: a mesma fixture dá a mesma decisão pelo índice (pre-commit) e por base...head (CI)", (t) => {
  const { dir, git, escrever } = repositorio(t);
  escrever({ "registros/x/a.md": "# Registro\n\nconteúdo resumido do registro, longo o bastante para o git ver renome\n", "docs/velho.csv": "a\n" });
  git("commit", "-q", "--no-verify", "-m", "base");
  const base = git("rev-parse", "HEAD").trim();
  git("mv", "registros/x/a.md", "registros/x/b.md");
  git("rm", "-q", "--", "docs/velho.csv");
  escrever({
    "alvos/x/a.txt": "resumo\n",
    "registros/x/dados.csv": "a,b\n",
    "registros/x/longo.md": `\`\`\`\n${"l\n".repeat(41)}\`\`\`\n`,
    "registros/x/fluxo.md": `\`\`\`mermaid\n${"l\n".repeat(80)}\`\`\`\n`,
    "registros/_modelos/m.csv": "a\n",
    "docs/notas.md": `token: ${JWT}\nchave:\n${PEM}\n`,
    "docs/ok.md": "# nada a ver\n",
    [ARQUIVO_EXCECOES]: JSON.stringify([{ caminho: "docs/notas.md", tipo: "segredo:jwt", motivo: "exemplo" }]),
  });
  const excecoesIndice = git("show", `:${ARQUIVO_EXCECOES}`);
  const doIndice = decidir(mudancasDoIndice({ cwd: dir }), excecoesIndice);
  git("commit", "-q", "--no-verify", "-m", "head");
  const daCi = decidir(mudancasEntre(base, "HEAD", { cwd: dir }), git("show", `HEAD:${ARQUIVO_EXCECOES}`));
  assert.deepEqual(daCi, doIndice);
  assert.deepEqual(doIndice.map((p) => `${p.caminho}:${p.tipo}`).sort(), [
    "alvos/x/a.txt:caminho-proibido",
    "docs/notas.md:segredo:chave-privada-pem",
    "registros/x/dados.csv:extensao",
    "registros/x/longo.md:bloco-extenso",
  ]);
});

test("entrada: renome traz o caminho antigo; remoção vem sem conteúdo", (t) => {
  const { dir, git, escrever } = repositorio(t);
  escrever({ "registros/x/a.md": "# Registro\n\nconteúdo resumido do registro, longo o bastante para o git ver renome\n", "docs/b.md": "b\n" });
  git("commit", "-q", "--no-verify", "-m", "base");
  git("mv", "registros/x/a.md", "registros/x/c.md");
  git("rm", "-q", "--", "docs/b.md");
  const m = mudancasDoIndice({ cwd: dir }).map(({ estado, caminho, caminhoAntigo, conteudo }) => ({ estado, caminho, caminhoAntigo, conteudo: conteudo === undefined }));
  assert.deepEqual(m, [
    { estado: "D", caminho: "docs/b.md", caminhoAntigo: undefined, conteudo: true },
    { estado: "R", caminho: "registros/x/c.md", caminhoAntigo: "registros/x/a.md", conteudo: false },
  ]);
});

test("cada regra de segredo tem tipo único com prefixo segredo:", () => {
  const tipos = REGRAS_SEGREDO.map((r) => r.tipo);
  assert.equal(new Set(tipos).size, tipos.length);
  for (const t of tipos) assert.match(t, /^segredo:[a-z0-9-]+$/);
});

test("segredo em arquivo binário não é lido como texto; fora de registros/ binário passa", () => {
  const conteudo = Buffer.concat([Buffer.from([0, 1]), Buffer.from(JWT)]);
  assert.deepEqual(avaliar([{ estado: "A", caminho: "docs/a.png", conteudo }]), []);
});

test("parecidos com segredo, mas fora do formato, não bloqueiam", () => {
  const textos = ["sk-curto", "ghp_curto", "eyJabc.eyJdef.ghi", "-----BEGIN PUBLIC KEY-----", "AKIA minúsculo akiaqz7rx2mv5kt9lp3w"];
  assert.deepEqual(avaliar([{ estado: "A", caminho: "docs/a.md", conteudo: Buffer.from(textos.join("\n")) }]), []);
});

test("AC4: o relatório traz caminho, linha e tipo, não o valor, e mantém a revisão humana", () => {
  const problemas = avaliar([{ estado: "A", caminho: "docs/a.md", conteudo: Buffer.from(`x\ntoken = "${JWT}"\n`) }]);
  const texto = relatorio(problemas);
  assert.match(texto, /docs\/a\.md:2: possível JWT \(valor omitido\) \[segredo:jwt\]/);
  assert.ok(!texto.includes(JWT) && !texto.includes(JWT.slice(10, 30)));
  assert.match(texto, /não dispensa a revisão humana de origem/);
  assert.equal(relatorio([]), "");
});

test("AC6: exceções inválidas são recusadas", () => {
  assert.match(lerExcecoes("{").problemas[0].mensagem, /JSON inválido/);
  assert.match(lerExcecoes("{}").problemas[0].mensagem, /precisa ser uma lista/);
  const r = lerExcecoes(JSON.stringify([{ caminho: "a", tipo: "b" }, { caminho: "a", tipo: "b", motivo: "ok" }]));
  assert.equal(r.excecoes.length, 1);
  assert.deepEqual(r.problemas.map((p) => p.mensagem), ["exceção 1 sem motivo"]);
});

// Cada exceção do arquivo versionado precisa ser válida e necessária: sem ela, o arquivo exceptuado seria
// bloqueado pelo tipo dela no HEAD. Exceção velha (arquivo removido, problema corrigido) reprova aqui.
test("AC6: cada exceção versionada é válida e ainda necessária", () => {
  const { excecoes, problemas } = lerExcecoes(readFileSync(join(RAIZ, ARQUIVO_EXCECOES), "utf8"));
  assert.deepEqual(problemas, []);
  if (!excecoes.length) return;
  const arvore = mudancasDaArvore("HEAD", { cwd: RAIZ });
  for (const e of excecoes) {
    const alvo = arvore.filter((m) => m.caminho === e.caminho);
    assert.equal(alvo.length, 1, `${e.caminho}: exceção para arquivo fora do HEAD`);
    assert.ok(avaliar(alvo).some((p) => p.tipo === e.tipo), `${e.caminho} [${e.tipo}]: exceção sem problema a cobrir`);
    assert.ok(!avaliar(alvo, { excecoes: [e] }).some((p) => p.tipo === e.tipo));
  }
});

// --- Correções do gate @qa (QA-E23-01 a 06) ---

// Um valor sintético por regra, montado por partes (QA-E23-06). O teste abaixo reprova regra sem fixture.
const POR_REGRA = {
  "segredo:chave-privada-pem": PEM,
  "segredo:token-github": parte("gh", "s_", "aB3d".repeat(9)),
  "segredo:jwt": JWT,
  "segredo:chave-anthropic": parte("sk-", "ant-", "aB3d".repeat(9)),
  "segredo:chave-openai": parte("sk-", "proj-", "aB3d".repeat(11)),
  "segredo:chave-aws": parte("AS", "IA", "QZ7RX2MV5KT9LP3W"),
  "segredo:chave-google": parte("AI", "za", "aB3d".repeat(8), "xy-"),
  "segredo:token-slack": parte("xo", "xb-", "1234567890-", "aB3d".repeat(4)),
  "segredo:chave-stripe": parte("rk", "_live_", "aB3d".repeat(6)),
  "segredo:token-huggingface": parte("hf", "_", "aB3d".repeat(9)),
  "segredo:chave-supabase": parte("sb", "_secret_", "aB3d".repeat(6)),
  "segredo:token-npm": parte("np", "m_", "aB3d".repeat(9)),
};

test("QA-E23-06: cada regra de segredo detecta a sua fixture sintética", () => {
  assert.deepEqual(Object.keys(POR_REGRA).sort(), REGRAS_SEGREDO.map((r) => r.tipo).sort());
  for (const [tipo, valor] of Object.entries(POR_REGRA)) {
    const tipos = avaliar([{ estado: "A", caminho: "docs/a.md", conteudo: Buffer.from(`valor = "${valor}"\n`) }]).map((p) => p.tipo);
    assert.ok(tipos.includes(tipo), `${tipo} não detectado`);
  }
});

test("QA-E23-04: chave do Google terminada em hífen antes de aspas é detectada", () => {
  const p = avaliar([{ estado: "A", caminho: "docs/a.js", conteudo: Buffer.from(`k = "${POR_REGRA["segredo:chave-google"]}";\n`) }]);
  assert.deepEqual(p.map((x) => x.tipo), ["segredo:chave-google"]);
});

test("QA-E23-01: mudança de tipo (T) é avaliada como modificação", () => {
  const conteudo = Buffer.from(`token ${POR_REGRA["segredo:token-github"]}\n\`\`\`\n${"l\n".repeat(60)}\`\`\`\n`);
  const m = mudancasDeNameStatus("T\0registros/a.md\0", () => conteudo);
  assert.deepEqual(avaliar(m).map((p) => p.tipo).sort(), ["bloco-extenso", "segredo:token-github"]);
});

test("QA-E23-02: caminho proibido em qualquer nível e sem diferenciar maiúsculas", () => {
  const proibidos = ["reimplementacoes/x/.rea/a.txt", "registros/x/saidas/a.md", "ALVOS/jogo/x.txt", "Saidas/x.md", "FERRAMENTAS/x/a.md"];
  for (const caminho of proibidos)
    assert.ok(avaliar([{ estado: "A", caminho, conteudo: Buffer.from("x\n") }]).some((p) => p.tipo === "caminho-proibido"), caminho);
  for (const caminho of ["docs/ferramentas/guia.md", "docs/alvos-e-saidas.md", "registros/x/saidas.md"])
    assert.deepEqual(avaliar([{ estado: "A", caminho, conteudo: Buffer.from("x\n") }]), [], caminho);
});

test("QA-E23-03: segredo em texto UTF-16 com BOM é detectado", () => {
  const le = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`token=${JWT}\r\n`, "utf16le")]);
  assert.deepEqual(avaliar([{ estado: "A", caminho: "scripts/config.txt", conteudo: le }]).map((p) => p.tipo), ["segredo:jwt"]);
  const be = Buffer.from(le);
  be.swap16();
  assert.deepEqual(avaliar([{ estado: "A", caminho: "scripts/config.txt", conteudo: be }]).map((p) => p.tipo), ["segredo:jwt"]);
});

test("QA-E23-05: caminho-proibido não aceita exceção", () => {
  const r = lerExcecoes(JSON.stringify([{ caminho: "alvos/x/a.bin", tipo: "caminho-proibido", motivo: "qualquer" }]));
  assert.equal(r.excecoes.length, 0);
  assert.match(r.problemas[0].mensagem, /caminho-proibido não aceita exceção/);
});
