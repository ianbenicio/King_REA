// Caracterização do .githooks/pre-commit.mjs (MEL-04, AC5): escrita contra o hook de antes da extração
// (main @ ffd8886) e mantida depois dela. Cada caso monta um repositório git temporário com a cópia do hook
// e dos módulos que ele importa, põe arquivos no índice e roda o hook como o git rodaria.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const COPIADOS = [".githooks", "scripts/monetizacao", "scripts/publicacao"];

/** Repositório temporário com o hook; `arquivos` (caminho → conteúdo) vão para o índice. */
export function repositorioComHook(t, arquivos = {}) {
  const dir = mkdtempSync(join(tmpdir(), "prking-precommit-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git("init", "-q");
  git("config", "user.email", "teste@exemplo.invalid");
  git("config", "user.name", "teste");
  git("config", "core.autocrlf", "false");
  for (const pasta of COPIADOS) if (existsSync(join(RAIZ, pasta))) cpSync(join(RAIZ, pasta), join(dir, pasta), { recursive: true });
  const escrever = (mapa) => {
    for (const [caminho, conteudo] of Object.entries(mapa)) {
      mkdirSync(dirname(join(dir, caminho)), { recursive: true });
      writeFileSync(join(dir, caminho), conteudo);
      git("add", "-f", "--", caminho);
    }
  };
  // Base com os módulos copiados: fora do índice "novo" de cada caso.
  git("add", "-f", "--", ...COPIADOS.filter((p) => existsSync(join(dir, p))));
  git("commit", "-q", "--no-verify", "-m", "base do teste");
  escrever(arquivos);
  const rodar = () => spawnSync(process.execPath, [join(dir, ".githooks", "pre-commit.mjs")], { cwd: dir, encoding: "utf8" });
  return { dir, git, escrever, rodar };
}

const bloco = (n, lang = "") => `# Registro\n\n\`\`\`${lang}\n${"linha\n".repeat(n)}\`\`\`\n`;
const textoGrande = (bytes) => "texto de registro resumido\n".repeat(Math.ceil(bytes / 27));

const casos = [
  { nome: "binário em registros/", arquivos: { "registros/x/dump.md": Buffer.from([0x4d, 0x5a, 0, 0, 1, 2]) }, bloqueia: /registros\/x\/dump\.md: arquivo binário/ },
  { nome: "extensão fora da lista em registros/", arquivos: { "registros/x/dados.csv": "a,b\n1,2\n" }, bloqueia: /registros\/x\/dados\.csv: extensão não permitida/ },
  { nome: "arquivo acima de 300 KB em registros/", arquivos: { "registros/x/grande.md": textoGrande(301 * 1024) }, bloqueia: /registros\/x\/grande\.md: \d+ KB \(limite 300 KB\)/ },
  { nome: "bloco de 41 linhas em registros/", arquivos: { "registros/x/a.md": bloco(41) }, bloqueia: /registros\/x\/a\.md:3: bloco de código com 41 linhas/ },
  { nome: "bloco ~~~ de 41 linhas em registros/", arquivos: { "registros/x/a.md": bloco(41).replaceAll("```", "~~~") }, bloqueia: /registros\/x\/a\.md:3: bloco de código com 41 linhas/ },
  { nome: "bloco de 40 linhas passa", arquivos: { "registros/x/a.md": bloco(40) } },
  { nome: "mermaid longo passa", arquivos: { "registros/x/a.md": bloco(80, "mermaid") } },
  { nome: "registros/_modelos/ fica de fora", arquivos: { "registros/_modelos/m.csv": "a\n", "registros/_modelos/m.md": bloco(80) } },
  { nome: "registros/ALVO_ATIVO passa", arquivos: { "registros/ALVO_ATIVO": "uo-classic\n" } },
  { nome: "fora de registros/ não se aplica a regra de registros", arquivos: { "docs/x.md": bloco(80), "docs/dados.csv": "a\n" } },
  {
    nome: "disparo da checagem de monetização (marcador sem catálogo no índice)",
    arquivos: { "reimplementacoes/p/a.mjs": "export const a = 1; // MON-0002\n" },
    bloqueia: /reimplementacoes\/p\/a\.mjs:1: marcador MON-0002/,
  },
  { nome: "sem mudança em reimplementacoes/ a monetização não roda", arquivos: { "docs/a.mjs": "export const a = 1; // MON-0002\n" } },
];

for (const caso of casos)
  test(`pre-commit: ${caso.nome}`, (t) => {
    const { rodar } = repositorioComHook(t, caso.arquivos);
    const r = rodar();
    if (caso.bloqueia) {
      assert.equal(r.status, 1, r.stderr);
      assert.match(r.stderr, caso.bloqueia);
    } else assert.equal(r.status, 0, r.stderr);
  });

test("pre-commit: remoção em registros/ não bloqueia", (t) => {
  const { git, escrever, rodar } = repositorioComHook(t);
  escrever({ "registros/x/dados.csv": "a\n" });
  git("commit", "-q", "--no-verify", "-m", "fixture antiga");
  git("rm", "-q", "--", "registros/x/dados.csv");
  const r = rodar();
  assert.equal(r.status, 0, r.stderr);
});

// --- Política nova (MEL-04): caminhos proibidos, segredos, renomes, exceções. Pelo hook, como o git rodaria. ---

// Valores sintéticos montados por partes: o literal completo nunca fica no arquivo (secret scanning do GitHub
// e a própria checagem de publicação).
const parte = (...p) => p.join("");
export const SEGREDOS_SINTETICOS = {
  "segredo:chave-privada-pem": parte("-----BEGIN ", "RSA PRIVATE", " KEY-----"),
  "segredo:token-github": parte("gh", "p_", "Zx9Kq2Lm7Np4Rs8Tv1Wy6Bc3Df5Gh0Jk2Mn4P"),
  "segredo:jwt": parte("ey", "JhbGciOiJIUzI1NiJ9", ".", "ey", "JzdWIiOiJzaW50ZXRpY28ifQ", ".", "c2lnbmF0dXJhLXNpbnRldGljYQ"),
  "segredo:chave-anthropic": parte("sk-", "ant-", "api03-", "Qw3Er5Ty7", "Ui9Op1As3", "Df5Gh7Jk9", "Lz1Xc3Vb5"),
  "segredo:chave-aws": parte("AK", "IA", "QZ7RX2MV5KT9LP3W"),
};

for (const [tipo, valor] of Object.entries(SEGREDOS_SINTETICOS))
  test(`publicação: ${tipo} sintético é recusado e o valor não aparece no relatório (AC2, AC4)`, (t) => {
    const { rodar } = repositorioComHook(t, { "docs/notas.md": `# Notas\n\nconfig = "${valor}"\n` });
    const r = rodar();
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, new RegExp(`docs/notas[.]md:3: .*[[]${tipo}[\\]]`));
    assert.ok(!r.stderr.includes(valor), "o relatório não pode trazer o valor");
    assert.ok(!r.stderr.includes(valor.slice(8, 20)), "nem pedaço do valor");
    assert.match(r.stderr, /não dispensa a revisão humana de origem/);
  });

for (const pasta of ["alvos", "saidas", ".rea", "ferramentas"])
  test(`publicação: ${pasta}/ adicionado com git add -f é recusado (AC2)`, (t) => {
    const { rodar } = repositorioComHook(t, { [`${pasta}/x/arquivo.txt`]: "resumo\n" });
    const r = rodar();
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, new RegExp(`${pasta.replace(".", "[.]")}/x/arquivo[.]txt: caminho proibido.*[[]caminho-proibido[\\]]`));
  });

test("publicação: renome dentro de registros/ com extensão permitida passa (AC3)", (t) => {
  const { git, escrever, rodar } = repositorioComHook(t);
  escrever({ "registros/x/a.md": "# Registro\n\nconteúdo resumido do registro, longo o bastante para o git ver renome\n" });
  git("commit", "-q", "--no-verify", "-m", "fixture");
  git("mv", "registros/x/a.md", "registros/x/b.md");
  const r = rodar();
  assert.equal(r.status, 0, r.stderr);
});

test("publicação: renome para fora de registros/ com extensão proibida é avaliado pelo caminho novo", (t) => {
  const { dir, git, escrever, rodar } = repositorioComHook(t);
  escrever({ "docs/dados.md": "a;b;c\n1;2;3\n4;5;6\n7;8;9\n" });
  git("commit", "-q", "--no-verify", "-m", "fixture");
  mkdirSync(join(dir, "registros/x"), { recursive: true });
  git("mv", "docs/dados.md", "registros/x/dados.csv");
  const r = rodar();
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /registros\/x\/dados\.csv: extensão não permitida/);
});

test("publicação: renome a partir de caminho proibido é avaliado pelo caminho antigo", (t) => {
  const { dir, git, escrever, rodar } = repositorioComHook(t);
  escrever({ "saidas/x/tabela.md": "dado bruto exportado, várias linhas de conteúdo\n" });
  git("commit", "-q", "--no-verify", "-m", "fixture");
  mkdirSync(join(dir, "docs"), { recursive: true });
  git("mv", "saidas/x/tabela.md", "docs/tabela.md");
  const r = rodar();
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /docs\/tabela\.md: renomeado de saidas\/x\/tabela\.md: caminho proibido/);
});

test("publicação: remoção de arquivo proibido não bloqueia (AC3)", (t) => {
  const { git, escrever, rodar } = repositorioComHook(t);
  escrever({ "alvos/x/a.bin": Buffer.from([0, 1, 2]) });
  git("commit", "-q", "--no-verify", "-m", "fixture");
  git("rm", "-q", "--", "alvos/x/a.bin");
  const r = rodar();
  assert.equal(r.status, 0, r.stderr);
});

test("publicação: exceção versionada libera só o caminho e o tipo exceptuados (AC6)", (t) => {
  const jwt = SEGREDOS_SINTETICOS["segredo:jwt"];
  const excecoes = JSON.stringify([{ caminho: "docs/exemplo.md", tipo: "segredo:jwt", motivo: "JWT de exemplo da documentação, sem assinatura válida" }]);
  const { rodar } = repositorioComHook(t, {
    "scripts/publicacao/excecoes.json": excecoes,
    "docs/exemplo.md": `token: ${jwt}\n`,
    "docs/outro.md": `token: ${jwt}\n`,
  });
  const r = rodar();
  assert.equal(r.status, 1, r.stderr);
  assert.doesNotMatch(r.stderr, /docs\/exemplo\.md/);
  assert.match(r.stderr, /docs\/outro\.md:1: .*\[segredo:jwt\]/);
});

test("publicação: exceção de outro tipo não libera o caminho (AC6)", (t) => {
  const excecoes = JSON.stringify([{ caminho: "docs/exemplo.md", tipo: "segredo:jwt", motivo: "exemplo" }]);
  const { rodar } = repositorioComHook(t, {
    "scripts/publicacao/excecoes.json": excecoes,
    "docs/exemplo.md": `chave: ${SEGREDOS_SINTETICOS["segredo:chave-aws"]}\n`,
  });
  const r = rodar();
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /docs\/exemplo\.md:1: .*\[segredo:chave-aws\]/);
});

test("publicação: exceção sem motivo é recusada e não libera nada (AC6)", (t) => {
  const excecoes = JSON.stringify([{ caminho: "docs/exemplo.md", tipo: "segredo:jwt", motivo: " " }]);
  const { rodar } = repositorioComHook(t, {
    "scripts/publicacao/excecoes.json": excecoes,
    "docs/exemplo.md": `token: ${SEGREDOS_SINTETICOS["segredo:jwt"]}\n`,
  });
  const r = rodar();
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /excecoes\.json: exceção 1 sem motivo \[excecao-invalida\]/);
  assert.match(r.stderr, /docs\/exemplo\.md:1: .*\[segredo:jwt\]/);
});
