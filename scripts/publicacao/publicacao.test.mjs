// Política de publicação (MEL-04): mesma decisão pela entrada do hook e pela da CI (AC1), relatório sem o
// valor (AC4) e exceções versionadas (AC6). Os casos pelo hook real estão em pre-commit.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARQUIVO_EXCECOES, REGRAS_SEGREDO, avaliar, decidir, lerExcecoes, mudancasDaArvore, mudancasDoIndice, mudancasEntre, relatorio } from "./publicacao.mjs";

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
