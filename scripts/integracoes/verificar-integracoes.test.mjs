// Testes do verificador de consistência de integrações (story MEL-05, fatia 1; ADR-0001 §2f).
// Cada caso monta um projeto mínimo numa pasta temporária: nada de rede, REA ou Ghidra. O teste de
// equivalência do AC8 roda o gate MCP (.claude/hooks/rea-gate.mjs) como subprocesso, com entradas
// sintéticas, numa raiz temporária; nenhuma tool é chamada.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARQUIVOS_FIXOS,
  CONTRATOS,
  casaMatcher,
  cobreServidor,
  formatarAchado,
  lerArquivosPadrao,
  lerModelo,
  verificarIntegracoes,
} from "./verificar-integracoes.mjs";

const RAIZ_REAL = fileURLToPath(new URL("../../", import.meta.url));
const GATE = join(RAIZ_REAL, ".claude", "hooks", "rea-gate.mjs");
const MODELO_REAL = readFileSync(join(RAIZ_REAL, "registros", "_modelos", "00-seguranca.md"), "utf8");
const COMMIT = "1e980252087b2479a21b9ca6d82d5829538651a7";
const NIVEIS = { N0: "Sessão e evidência", N1: "Estático", N2: "Observação passiva", N3: "Execução" };

const BASE = {
  ".mcp.json": {
    mcpServers: {
      rea: { command: "node", args: ["node_modules/rea-agents/scripts/rea.mjs", "mcp"] },
      ghidra: {
        command: "uvx",
        args: ["--from", `git+https://github.com/LaurieWired/GhidraMCP@${COMMIT}`, "--with", "mcp==1.30.0", "--with", "requests==2.34.2", "ghidra-mcp"],
      },
    },
  },
  ".claude/settings.json": {
    hooks: {
      PreToolUse: [
        { matcher: "mcp__(rea|ghidra)__.*", hooks: [{ type: "command", command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/rea-gate.mjs"' }] },
        { matcher: "Bash|PowerShell", hooks: [{ type: "command", command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/cli-gate.mjs"' }] },
      ],
    },
  },
  ".claude/hooks/rea-niveis.json": { rea_version: "6.4.0", niveis: NIVEIS, ferramentas: { binary_session: "N0", open_binary: "N1" } },
  ".claude/hooks/ghidra-niveis.json": { servidor: "ghidra", versao: "GhidraMCP 2.0 (commit 1e98025)", niveis: NIVEIS, ferramentas: { decompile_function: "N1" } },
  ".claude/hooks/rea-gate.mjs": "// não é lido pelo verificador\n",
  "package.json": { dependencies: { "rea-agents": "6.4.0" } },
  "package-lock.json": { lockfileVersion: 3, packages: { "": { dependencies: { "rea-agents": "6.4.0" } }, "node_modules/rea-agents": { version: "6.4.0" } } },
  "registros/_modelos/00-seguranca.md": MODELO_REAL,
  "docs/guia-rea.md": "| Servidor MCP `rea` | `.mcp.json` |\n| Servidor MCP `ghidra` | `.mcp.json` |\n| Trava | `rea-niveis.json` e `ghidra-niveis.json` |\n",
  "docs/runbook-prereqs-nativo.md": "Registro no `.mcp.json`; auditoria e commit fixado em `docs/seguranca/auditoria-ghidramcp-2.0.md`.\n",
  "docs/seguranca/auditoria-ghidramcp-2.0.md": `Registro fixado: \`git+https://github.com/LaurieWired/GhidraMCP@${COMMIT}\`, com \`mcp==1.30.0\` e \`requests==2.34.2\`.\n`,
};
const RUNBOOK = "docs/runbook-prereqs-nativo.md";
const AUDITORIA = "docs/seguranca/auditoria-ghidramcp-2.0.md";

/** Projeto temporário: BASE com trocas (objeto = JSON, texto = como está, null = arquivo ausente). */
function projeto(t, trocas = {}) {
  const raiz = mkdtempSync(join(tmpdir(), "integracoes-"));
  t.after(() => rmSync(raiz, { recursive: true, force: true }));
  for (const [rel, valor] of Object.entries({ ...BASE, ...trocas })) {
    if (valor === null) continue;
    mkdirSync(dirname(join(raiz, rel)), { recursive: true });
    writeFileSync(join(raiz, rel), typeof valor === "string" ? valor : `${JSON.stringify(valor, null, 2)}\n`);
  }
  return raiz;
}

const mcpCom = (extras) => ({ mcpServers: { ...BASE[".mcp.json"].mcpServers, ...extras } });
const settingsCom = (matcher) => {
  const s = structuredClone(BASE[".claude/settings.json"]);
  s.hooks.PreToolUse[0].matcher = matcher;
  return s;
};
const mapa = (ferramentas, extra = {}) => ({ niveis: NIVEIS, ferramentas, ...extra });
const verificar = (raiz) => verificarIntegracoes(raiz);
const texto = (achados) => achados.map(formatarAchado).join("\n");
const doContrato = (achados, contrato) => achados.filter((a) => a.contrato === contrato);

test("projeto coerente (forma do repositório real) não tem achado", (t) => {
  assert.deepEqual(verificar(projeto(t)), []);
});

// ---------- AC1 — servidor sem mapa ----------

test("AC1: servidor do .mcp.json sem mapa de níveis reprova citando o servidor e o mapa que falta", (t) => {
  const raiz = projeto(t, {
    ".mcp.json": mcpCom({ novo: { command: "x" } }),
    ".claude/settings.json": settingsCom("mcp__(rea|ghidra|novo)__.*"),
    "docs/guia-rea.md": `${BASE["docs/guia-rea.md"]}\`novo\` e \`novo-niveis.json\`\n`,
  });
  const achados = verificar(raiz);
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.mapa);
  assert.equal(achados[0].arquivo, ".claude/hooks/novo-niveis.json");
  assert.match(formatarAchado(achados[0]), /integração incompleta: servidor `novo` sem mapa de níveis/);
});

// ---------- AC2 — matcher ----------

test("AC2: servidor com mapa e sem cobertura do matcher reprova dizendo que falta o matcher do gate", (t) => {
  const achados = verificar(projeto(t, { ".claude/settings.json": settingsCom("mcp__(rea)__.*") }));
  const m = doContrato(achados, CONTRATOS.matcher);
  assert.equal(m.length, 1, texto(achados));
  assert.equal(m[0].arquivo, ".claude/settings.json");
  assert.match(formatarAchado(m[0]), /servidor `ghidra` sem cobertura do matcher do gate/);
  assert.match(m[0].mensagem, /sem trava/);
});

test("AC2: matcher que cita servidor ausente do .mcp.json reprova (caso inverso)", (t) => {
  const achados = verificar(projeto(t, { ".claude/settings.json": settingsCom("mcp__(rea|ghidra|zeta)__.*") }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.matcher);
  assert.match(achados[0].mensagem, /matcher cita o servidor `zeta`, que não está configurado em \.mcp\.json/);
});

test("AC2: regra de casamento da documentação do Claude Code (lista exata, regex parcial, vazio e *)", () => {
  assert.equal(casaMatcher("", "mcp__rea__x"), true, "vazio casa tudo");
  assert.equal(casaMatcher("*", "mcp__rea__x"), true, "* casa tudo");
  assert.equal(casaMatcher("mcp__rea__x, Bash", "mcp__rea__x"), true, "lista de nomes exatos");
  assert.equal(casaMatcher("mcp__rea__x|Bash", "mcp__rea__xy"), false, "lista é exata, não prefixo");
  assert.equal(casaMatcher("mcp__rea", "mcp__rea__x"), false, "só letras e _ é nome exato");
  assert.equal(casaMatcher("rea__.*", "mcp__rea__x"), true, "regex parcial, sem âncora");
  assert.equal(casaMatcher("rea__.*", "mcp__rea__x", { ancorado: true }), false);
  assert.equal(casaMatcher("mcp__(rea", "mcp__rea__x"), false, "regex inválida não casa");
});

test("AC2: cobertura só com casamento nas leituras parcial e ancorada; plugin não cobre o servidor", () => {
  assert.equal(cobreServidor("mcp__(rea|ghidra)__.*", "rea"), true);
  assert.equal(cobreServidor("mcp__(rea|ghidra)__.*", "ghidra"), true);
  assert.equal(cobreServidor("mcp__rea.*", "rea"), true, "parcial e ancorada casam");
  assert.equal(cobreServidor("mcp__rea", "rea"), false, "mcp__rea sem .* não cobre");
  assert.equal(cobreServidor("mcp__re(a)", "rea"), false, "casa parcial, não ancorada");
  assert.equal(cobreServidor("mcp__plugin_x_rea__t", "rea"), false, "nome de plugin não é o servidor rea");
  assert.equal(cobreServidor("mcp__plugin_x_rea__.*", "rea"), false);
});

for (const [caso, matcher] of [
  ["mcp__rea sem .*", "mcp__rea"],
  ["matcher vazio", ""],
  ["matcher *", "*"],
  ["lista exata", "mcp__rea__open_binary, mcp__ghidra__decompile_function"],
  ["regex fora da forma", "mcp__(rea|ghidra)__open.*"],
  ["servidor de plugin", "mcp__(plugin_x_rea|ghidra)__.*"],
]) {
  test(`AC2: ${caso} reprova (fail-closed fora de mcp__(n1|n2…)__.*)`, (t) => {
    const achados = verificar(projeto(t, { ".claude/settings.json": settingsCom(matcher) }));
    const m = doContrato(achados, CONTRATOS.matcher);
    assert.ok(m.some((a) => /fora da forma `mcp__\(n1\|n2…\)__\.\*`/.test(a.mensagem)), texto(achados));
    assert.ok(m.every((a) => a.arquivo === ".claude/settings.json" && a.campo.startsWith("hooks.PreToolUse")));
  });
}

test("AC2: plugin no matcher não conta como cobertura de rea", (t) => {
  const achados = verificar(projeto(t, { ".claude/settings.json": settingsCom("mcp__(plugin_x_rea|ghidra)__.*") }));
  assert.match(texto(achados), /servidor `rea` sem cobertura do matcher do gate/);
});

test("AC2: servidor com _ no nome reprova (fora de [a-z0-9-]+, mesmo conjunto do gate)", (t) => {
  const achados = verificar(
    projeto(t, {
      ".mcp.json": mcpCom({ meu_srv: { command: "x" } }),
      ".claude/hooks/meu_srv-niveis.json": mapa({ t1: "N1" }),
      ".claude/settings.json": settingsCom("mcp__(rea|ghidra|meu_srv)__.*"),
      "docs/guia-rea.md": `${BASE["docs/guia-rea.md"]}\`meu_srv\` e \`meu_srv-niveis.json\`\n`,
    }),
  );
  assert.match(texto(achados), /servidor `meu_srv` com nome fora de \[a-z0-9-\]\+/);
  assert.ok(achados.some((a) => a.contrato === CONTRATOS.mcp && a.campo === "mcpServers.meu_srv"));
});

test("AC2: settings sem entrada do PreToolUse que acione o rea-gate reprova", (t) => {
  const s = structuredClone(BASE[".claude/settings.json"]);
  s.hooks.PreToolUse.shift();
  const achados = verificar(projeto(t, { ".claude/settings.json": s }));
  assert.match(texto(achados), /nenhuma entrada de PreToolUse aciona \.claude\/hooks\/rea-gate\.mjs/);
});

// ---------- AC3 — mapa sem servidor ----------

const causas = (m) => ({
  removido: m.match(/^ {2}- servidor removido do \.mcp\.json e mapa esquecido → (.*)$/m)?.[1],
  divergente: m.match(/^ {2}- nome do servidor divergente entre o mapa e a chave do \.mcp\.json → (.*)$/m)?.[1],
  naoRegistrado: m.match(/^ {2}- mapa de servidor ainda não registrado → (.*)$/m)?.[1],
});

function afirmaComumAC3(achado, servidoresMcp) {
  assert.equal(achado.contrato, CONTRATOS.mapa, "reprova como contrato de mapa (falha, não aviso)");
  assert.equal(achado.arquivo, ".claude/hooks/x-niveis.json", "(a) arquivo do mapa");
  assert.match(achado.mensagem, /\.claude\/hooks\/x-niveis\.json/, "(a) arquivo do mapa na mensagem");
  assert.match(achado.mensagem, /servidor derivado do nome: `x` \(mcp__x__\)/, "(b) nome derivado");
  assert.match(achado.mensagem, new RegExp(`servidores do \\.mcp\\.json: ${servidoresMcp.map((s) => `\`${s}\``).join(", ")}`), "(c) lista");
  assert.match(achado.mensagem, /o verificador não corrige nada: a correção é manual/, "(e) aviso");
}

test("AC3 (1): mapa sem servidor e nenhum servidor sobrando: reprova com as três causas, cada uma com a solução", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/x-niveis.json": mapa({ t1: "N1" }) }));
  assert.equal(achados.length, 1, texto(achados));
  const [a] = achados;
  afirmaComumAC3(a, ["rea", "ghidra"]);
  const c = causas(a.mensagem);
  assert.match(c.removido ?? "", /apagar o mapa e tirar o servidor do matcher \(\.claude\/settings\.json\)/, "causa: removido e esquecido");
  assert.match(c.divergente ?? "", /dar o mesmo nome aos dois/, "causa: nome divergente");
  assert.doesNotMatch(c.divergente ?? "", /`/, "nome divergente sem servidor a citar");
  assert.match(c.naoRegistrado ?? "", /registrar o servidor no \.mcp\.json e no matcher, depois da auditoria e da fixação de versão/, "causa: não registrado");
});

test("AC3 (2): mapa x sem servidor e servidor y sem mapa: a causa 'nome divergente' cita y; AC1 também aparece", (t) => {
  const achados = verificar(
    projeto(t, {
      ".claude/hooks/x-niveis.json": mapa({ t1: "N1" }),
      ".mcp.json": mcpCom({ y: { command: "y" } }),
      ".claude/settings.json": settingsCom("mcp__(rea|ghidra|y)__.*"),
      "docs/guia-rea.md": `${BASE["docs/guia-rea.md"]}\`y\` e \`y-niveis.json\`\n`,
    }),
  );
  const orfao = achados.find((a) => a.arquivo === ".claude/hooks/x-niveis.json");
  assert.ok(orfao, texto(achados));
  afirmaComumAC3(orfao, ["rea", "ghidra", "y"]);
  const c = causas(orfao.mensagem);
  assert.match(c.removido ?? "", /apagar o mapa e tirar o servidor do matcher/);
  assert.match(c.divergente ?? "", /dar o mesmo nome aos dois; o \.mcp\.json tem `y` sem mapa/);
  assert.match(c.naoRegistrado ?? "", /registrar o servidor no \.mcp\.json e no matcher/);
  assert.match(texto(achados), /integração incompleta: servidor `y` sem mapa de níveis/, "AC1 no mesmo cenário");
});

// ---------- AC4 a AC6 — forma do mapa ----------

test("AC4: mapa que não é JSON, sem ferramentas ou com ferramentas vazio reprova citando mapa e campo", (t) => {
  for (const [conteudo, campo] of [
    ["{ não é json", "(JSON)"],
    [{ niveis: NIVEIS }, "ferramentas"],
    [{ niveis: NIVEIS, ferramentas: {} }, "ferramentas"],
    [{ niveis: NIVEIS, ferramentas: ["a"] }, "ferramentas"],
  ]) {
    const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": conteudo }));
    const a = achados.find((x) => x.arquivo === ".claude/hooks/ghidra-niveis.json" && x.campo === campo);
    assert.ok(a, `${JSON.stringify(conteudo)}: ${texto(achados)}`);
    assert.equal(a.contrato, CONTRATOS.mapa);
  }
});

test("AC5: tool sem classificação reprova citando mapa e tool", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": mapa({ a: "", b: 3, c: null, d: "N1" }, { versao: "commit 1e98025" }) }));
  for (const tool of ["a", "b", "c"]) {
    const a = achados.find((x) => x.campo === `ferramentas.${tool}`);
    assert.ok(a, `${tool}: ${texto(achados)}`);
    assert.match(a.mensagem, new RegExp(`tool \`${tool}\` sem nível`));
  }
  assert.equal(achados.length, 3, texto(achados));
});

test("AC5: nome de tool fora de ^[A-Za-z0-9_-]+$ ou herdado reprova citando o nome", (t) => {
  const raw = `{"versao":"commit 1e98025","niveis":${JSON.stringify(NIVEIS)},"ferramentas":{"ok_1":"N1","com espaço":"N1","constructor":"N1","__proto__":"N1","toString":"N1"}}`;
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": raw }));
  assert.match(texto(achados), /nome de tool `com espaço` fora de \^\[A-Za-z0-9_-\]\+\$/);
  for (const nome of ["constructor", "__proto__", "toString"]) assert.match(texto(achados), new RegExp(`nome de tool \`${nome}\` colide com propriedade herdada`));
  assert.equal(achados.length, 4, texto(achados));
});

test("AC6: nível que não existe em niveis reprova citando mapa, tool e nível", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": mapa({ decompile_function: "N9" }, { versao: "commit 1e98025" }) }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].campo, "ferramentas.decompile_function");
  assert.match(achados[0].mensagem, /nível inválido `N9` na tool `decompile_function`/);
});

test("AC6: niveis diferentes entre mapas (chave ou texto) reprova citando os dois", (t) => {
  for (const niveis of [{ ...NIVEIS, N1: "Estático (texto outro)" }, { N0: NIVEIS.N0, N1: NIVEIS.N1 }]) {
    const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": { versao: "commit 1e98025", niveis, ferramentas: { decompile_function: "N1" } } }));
    assert.equal(achados.length, 1, texto(achados));
    assert.equal(achados[0].campo, "niveis");
    assert.match(achados[0].mensagem, /`niveis` diferente entre \.claude\/hooks\/ghidra-niveis\.json e \.claude\/hooks\/rea-niveis\.json/);
  }
});

test("AC6: mapa sem niveis reprova", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": { versao: "commit 1e98025", ferramentas: { decompile_function: "N1" } } }));
  assert.ok(achados.some((a) => a.campo === "niveis" && /sem `niveis`/.test(a.mensagem)), texto(achados));
});

// ---------- AC7 — versões ----------

test("AC7: rea_version, package.json e lock divergentes reprovam citando as três versões e os arquivos", (t) => {
  for (const trocas of [
    { ".claude/hooks/rea-niveis.json": { ...BASE[".claude/hooks/rea-niveis.json"], rea_version: "6.4.1" } },
    { "package.json": { dependencies: { "rea-agents": "6.5.0" } } },
    { "package-lock.json": { packages: { "node_modules/rea-agents": { version: "6.3.0" } } } },
  ]) {
    const achados = verificar(projeto(t, trocas));
    assert.equal(achados.length, 1, texto(achados));
    const [a] = achados;
    assert.equal(a.contrato, CONTRATOS.versao);
    assert.match(a.mensagem, /\.claude\/hooks\/rea-niveis\.json \(rea_version\) = \S+, package\.json \(dependencies\.rea-agents\) = \S+, package-lock\.json \(packages\["node_modules\/rea-agents"\]\.version\) = \S+/);
  }
});

test("AC7: rea_version ausente ou lock ilegível reprovam (sem aprovar por falta de dados)", (t) => {
  const { rea_version, ...semVersao } = BASE[".claude/hooks/rea-niveis.json"];
  assert.match(texto(verificar(projeto(t, { ".claude/hooks/rea-niveis.json": semVersao }))), /\(rea_version\) = \(ausente\)/);
  assert.match(texto(verificar(projeto(t, { "package-lock.json": "{" }))), /package-lock\.json.*ilegível/);
});

test("AC7: commit do mapa do Ghidra que não é prefixo do commit do .mcp.json reprova citando os dois", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": { ...BASE[".claude/hooks/ghidra-niveis.json"], versao: "GhidraMCP 2.0 (commit abcdef0)" } }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.versao);
  assert.match(achados[0].mensagem, /commit `abcdef0` do mapa não é prefixo do commit `1e98025…` do \.mcp\.json/);
});

test("AC7: campo versao do Ghidra sem commit legível reprova (fail-closed)", (t) => {
  const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": { ...BASE[".claude/hooks/ghidra-niveis.json"], versao: "GhidraMCP 2.0" } }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].campo, "versao");
  assert.match(achados[0].mensagem, /sem commit legível/);
});

// ---------- AC8 — modelo do 00-seguranca.md ----------

const BLOCO = MODELO_REAL.replace(/^niveis_aprovados:.*$/m, "niveis_aprovados:\n  - N0");
const ASPAS = MODELO_REAL.replace(/^status:.*$/m, 'status: "pendente"');
const REPETIDA = `${MODELO_REAL}\n## Identidade dos arquivos\n\n| Arquivo | SHA-256 |\n|---|---|\n`;
const SEM_SECAO = MODELO_REAL.replace(/^## 8\. Identidade dos arquivos\s*$/m, "## 8. Outra seção");
const SEM_FRONT = MODELO_REAL.replace(/^---\r?\n/, "");
const VARIACOES = { modelo: MODELO_REAL, "lista de bloco": BLOCO, "status entre aspas": ASPAS, "seção repetida": REPETIDA, "seção ausente": SEM_SECAO, "sem frontmatter": SEM_FRONT };

test("AC8: modelo real legível; lista de bloco, status entre aspas, seção repetida ou ausente e sem frontmatter reprovam", (t) => {
  assert.deepEqual(verificar(projeto(t)), []);
  for (const [nome, conteudo] of Object.entries(VARIACOES)) {
    if (nome === "modelo") continue;
    const achados = verificar(projeto(t, { "registros/_modelos/00-seguranca.md": conteudo }));
    assert.ok(achados.length >= 1, nome);
    for (const a of achados) {
      assert.equal(a.contrato, CONTRATOS.modelo, nome);
      assert.equal(a.arquivo, "registros/_modelos/00-seguranca.md", nome);
    }
  }
  const msg = (c) => texto(verificar(projeto(t, { "registros/_modelos/00-seguranca.md": c })));
  assert.match(msg(BLOCO), /`niveis_aprovados` fora de lista inline numa linha/);
  assert.match(msg(ASPAS), /`status` com valor não reconhecido \("pendente"\)/);
  assert.match(msg(REPETIDA), /seção "Identidade dos arquivos" repetida \(2\)/);
  assert.match(msg(SEM_SECAO), /sem a seção "Identidade dos arquivos"/);
  assert.match(msg(SEM_FRONT), /sem frontmatter delimitado/);
});

// Oráculo: o próprio gate, rodado como subprocesso numa raiz temporária com o modelo (ou a variação) como
// registro do alvo ativo. Saídas observáveis do gate (rea-gate.mjs):
//  - sem frontmatter: deny "ausente ou sem frontmatter" (linha 151);
//  - status: deny `status "<lido>", não "aprovado"` (linha 158); "?" quando não lê nada;
//  - niveis_aprovados: com status aprovado e tool de nível fora da lista, deny "fora do plano aprovado ... (<lista>)"
//    com a lista lida, ou "nenhum" (linha 283);
//  - identidade: com status aprovado e tool N0 com caminho em alvos/<slug>/, deny "falta a seção" (0 seções),
//    "repetida" (mais de uma) ou outra decisão (uma seção) (linhas 189-193).
const NIVEIS_REAIS = JSON.parse(readFileSync(join(RAIZ_REAL, ".claude", "hooks", "rea-niveis.json"), "utf8")).ferramentas;
const toolDe = (nivel) => Object.keys(NIVEIS_REAIS).find((k) => NIVEIS_REAIS[k] === nivel);

function gate(registro, tool, tool_input = {}) {
  const raiz = mkdtempSync(join(tmpdir(), "integracoes-gate-"));
  try {
    for (const d of ["registros/eq", "alvos/eq", "saidas/eq"]) mkdirSync(join(raiz, d), { recursive: true });
    writeFileSync(join(raiz, "registros", "ALVO_ATIVO"), "eq\n");
    writeFileSync(join(raiz, "registros", "eq", "00-seguranca.md"), registro);
    writeFileSync(join(raiz, "alvos", "eq", "f.bin"), "conteúdo");
    const out = execFileSync(process.execPath, [GATE], {
      input: JSON.stringify({ tool_name: `mcp__rea__${tool}`, tool_input, cwd: raiz }),
      env: { ...process.env, CLAUDE_PROJECT_DIR: raiz },
      encoding: "utf8",
    });
    return JSON.parse(out).hookSpecificOutput.permissionDecisionReason;
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
}

/** O que o gate leu do registro, pelas saídas observáveis. */
function leituraDoGate(registro) {
  const motivo = gate(registro, toolDe("N1"));
  if (/ausente ou sem frontmatter/.test(motivo)) return { frontmatter: false };
  const status = motivo.match(/está com status "(.*)", não "aprovado"/)?.[1] ?? "aprovado";
  const aprovado = registro.replace(/^status:.*$/m, "status: aprovado");
  const nivelSonda = "N2";
  const plano = gate(aprovado, toolDe(nivelSonda)).match(/fora do plano aprovado para "eq" \((.*)\)\. Pare/)?.[1];
  assert.ok(plano !== undefined, `sonda ${nivelSonda} precisa ficar fora da lista do registro`);
  const niveis = plano === "nenhum" ? [] : plano.split(", ");
  const identidade = gate(aprovado, toolDe("N0"), { path: "alvos/eq/f.bin" });
  const secoes = /falta a seção "Identidade dos arquivos"/.test(identidade) ? "nenhuma" : /seção "Identidade dos arquivos" repetida/.test(identidade) ? "repetida" : "uma";
  return { frontmatter: true, status, niveis, secoes };
}

/** A mesma leitura pelo componente. */
function leituraDoComponente(registro) {
  const l = lerModelo(registro);
  if (!l.frontmatter) return { frontmatter: false };
  return {
    frontmatter: true,
    status: l.status ?? "?",
    niveis: l.niveisAprovados ?? [],
    secoes: l.secoesIdentidade === 0 ? "nenhuma" : l.secoesIdentidade > 1 ? "repetida" : "uma",
  };
}

test("AC8: equivalência com o gate em subprocesso, no modelo real e em cada variação", (t) => {
  assert.ok(toolDe("N0") && toolDe("N1") && toolDe("N2"), "mapa real com tools N0, N1 e N2");
  for (const [nome, registro] of Object.entries(VARIACOES)) {
    const doGate = leituraDoGate(registro);
    assert.deepEqual(leituraDoComponente(registro), doGate, `${nome}: leitura do componente diverge do gate`);
    // Veredito: legível só se o gate lê frontmatter, um status do modelo, a lista inline e uma única seção.
    const raiz = projeto(t, { "registros/_modelos/00-seguranca.md": registro });
    const reprovou = verificar(raiz).length > 0;
    assert.equal(reprovou, nome !== "modelo", `${nome}: veredito`);
  }
  // A lista de bloco é a diferença que o veredito pega e a leitura do gate esconde: o gate lê "nenhum".
  assert.deepEqual(leituraDoGate(BLOCO).niveis, []);
  assert.deepEqual(leituraDoGate(MODELO_REAL).niveis, ["N0"]);
  assert.equal(leituraDoGate(ASPAS).status, '"pendente"');
});

// ---------- AC16 — guia ----------

test("AC16: guia que só cita rea e rea-niveis.json reprova citando ghidra, o guia e o mapa esperado", (t) => {
  const achados = verificar(projeto(t, { "docs/guia-rea.md": "| Servidor MCP `rea` | `.mcp.json` |\n| Trava | `rea-gate.mjs` e `rea-niveis.json` |\n" }));
  assert.ok(achados.length >= 1, texto(achados));
  for (const a of achados) {
    assert.equal(a.contrato, CONTRATOS.documentacao);
    assert.equal(a.arquivo, "docs/guia-rea.md");
  }
  assert.match(texto(achados), /servidor `ghidra` do \.mcp\.json não citado em docs\/guia-rea\.md/);
  assert.match(texto(achados), /docs\/guia-rea\.md não cita o mapa `ghidra-niveis\.json` do servidor `ghidra`/);
});

test("AC16: guia que cita o servidor mas não o mapa reprova; o nome dentro de outra palavra não conta", (t) => {
  const achados = verificar(projeto(t, { "docs/guia-rea.md": "`rea` e `rea-niveis.json`; Ghidra + JDK; servidor `ghidra`.\n" }));
  assert.equal(achados.length, 1, texto(achados));
  assert.match(achados[0].mensagem, /não cita o mapa `ghidra-niveis\.json`/);
  const soPalavra = verificar(projeto(t, { "docs/guia-rea.md": "`rea-agents`, `rea-niveis.json`, `ghidra`, `ghidra-niveis.json`\n" }));
  assert.match(texto(soPalavra), /servidor `rea` do \.mcp\.json não citado/);
});

// ---------- ponto 8 — auditoria do GhidraMCP e runbook (F2-AC21, substitui o AC17 da fatia 1) ----------

test("F2-AC21 (7): fixture padrão (referência na auditoria, runbook só com o apontamento) aprova", (t) => {
  assert.deepEqual(verificar(projeto(t)), []);
  assert.ok(ARQUIVOS_FIXOS.includes(AUDITORIA), "(a) AUDITORIA_GHIDRA na lista fechada");
});

test("F2-AC21 (4): auditoria com GhidraMCP@2.0 reprova citando a auditoria, a referência e o commit esperado", (t) => {
  const achados = verificar(projeto(t, { [AUDITORIA]: '"--from", "git+https://github.com/LaurieWired/GhidraMCP@2.0",\n' }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.documentacao);
  assert.equal(achados[0].arquivo, AUDITORIA);
  assert.match(achados[0].mensagem, /referência `GhidraMCP@2\.0` não é prefixo \(7 a 40 hexadecimais\) do commit `1e98025…` do \.mcp\.json/);
});

test("F2-AC21 (b): na auditoria, referência abreviada que é prefixo do commit aprova; uma ruim entre boas reprova", (t) => {
  assert.deepEqual(verificar(projeto(t, { [AUDITORIA]: "GhidraMCP@1e98025\n" })), []);
  const achados = verificar(projeto(t, { [AUDITORIA]: `GhidraMCP@1e98025 e GhidraMCP@${COMMIT} e GhidraMCP@1e98026\n` }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].arquivo, AUDITORIA);
  assert.match(achados[0].mensagem, /`GhidraMCP@1e98026`/);
});

test("F2-AC21 (5): auditoria sem nenhuma referência GhidraMCP@ reprova (P-6, fail-closed)", (t) => {
  const achados = verificar(projeto(t, { [AUDITORIA]: "GhidraMCP 2.0, tag 2.0, sem a forma com arroba.\n" }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.documentacao);
  assert.equal(achados[0].arquivo, AUDITORIA);
  assert.match(achados[0].mensagem, /docs\/seguranca\/auditoria-ghidramcp-2\.0\.md não tem referência `GhidraMCP@<ref>` a conferir/);
});

test("F2-AC21 (3, d): auditoria ausente ou ilegível reprova com o motivo", (t) => {
  const ausente = verificar(projeto(t, { [AUDITORIA]: null }));
  assert.equal(ausente.length, 1, texto(ausente));
  assert.equal(ausente[0].contrato, CONTRATOS.documentacao);
  assert.equal(ausente[0].arquivo, AUDITORIA);
  assert.match(ausente[0].mensagem, /arquivo ausente/);
  const raiz = projeto(t);
  const padrao = lerArquivosPadrao(raiz);
  const ilegivel = verificarIntegracoes(raiz, { fs: { ...padrao, ler: (rel) => (rel === AUDITORIA ? { erro: "ilegível" } : padrao.ler(rel)) } });
  assert.equal(ilegivel.length, 1, texto(ilegivel));
  assert.equal(ilegivel[0].arquivo, AUDITORIA);
  assert.match(ilegivel[0].mensagem, /arquivo ilegível/);
});

test("F2-AC21 (1, c): runbook com GhidraMCP@ reprova, mesmo com hexadecimal válido: o commit só pode estar na auditoria", (t) => {
  for (const ref of [COMMIT, "1e98025", "2.0", ""]) {
    const achados = verificar(projeto(t, { [RUNBOOK]: `${BASE[RUNBOOK]}Fixado em GhidraMCP@${ref}.\n` }));
    assert.equal(achados.length, 1, `"${ref}": ${texto(achados)}`);
    assert.equal(achados[0].contrato, CONTRATOS.documentacao);
    assert.equal(achados[0].arquivo, RUNBOOK);
    assert.equal(achados[0].campo, "GhidraMCP@");
    assert.match(achados[0].mensagem, /o commit do GhidraMCP só pode estar em docs\/seguranca\/auditoria-ghidramcp-2\.0\.md/);
  }
});

test("F2-AC21 (2, c): runbook sem o apontamento para a auditoria reprova", (t) => {
  const achados = verificar(projeto(t, { [RUNBOOK]: "Registro no `.mcp.json`; auditoria em outro lugar.\n" }));
  assert.equal(achados.length, 1, texto(achados));
  assert.equal(achados[0].contrato, CONTRATOS.documentacao);
  assert.equal(achados[0].arquivo, RUNBOOK);
  assert.match(achados[0].mensagem, /docs\/runbook-prereqs-nativo\.md não aponta para a auditoria `docs\/seguranca\/auditoria-ghidramcp-2\.0\.md`/);
});

test("F2-AC21 (c): runbook com GhidraMCP@ e sem apontamento gera os dois achados", (t) => {
  const achados = verificar(projeto(t, { [RUNBOOK]: `GhidraMCP@${COMMIT}\n` }));
  assert.equal(achados.length, 2, texto(achados));
  assert.ok(achados.every((a) => a.arquivo === RUNBOOK && a.contrato === CONTRATOS.documentacao), texto(achados));
});

// ---------- AC9 — mensagens ----------

test("AC9: toda mensagem diz contrato, arquivo e campo em uma linha curta (AC3 é a exceção multilinha)", (t) => {
  const cenarios = [
    { ".mcp.json": "{" },
    { ".mcp.json": mcpCom({ novo: { command: "x" } }) },
    { ".claude/settings.json": settingsCom("mcp__(rea|zeta)__.*") },
    { ".claude/hooks/ghidra-niveis.json": "{" },
    { ".claude/hooks/ghidra-niveis.json": mapa({ "a b": "N9", c: "" }, { versao: "commit 1e98025" }) },
    { ".claude/hooks/rea-niveis.json": { ...BASE[".claude/hooks/rea-niveis.json"], rea_version: "9.9.9" } },
    { "registros/_modelos/00-seguranca.md": REPETIDA },
    { "docs/guia-rea.md": "nada\n" },
    { [AUDITORIA]: "GhidraMCP@2.0\n" },
    { [AUDITORIA]: null },
    { [RUNBOOK]: "GhidraMCP@2.0\n" },
  ];
  const vistos = new Set();
  for (const trocas of cenarios) {
    for (const a of verificar(projeto(t, trocas))) {
      vistos.add(a.contrato);
      assert.ok(Object.values(CONTRATOS).includes(a.contrato), a.contrato);
      assert.ok(a.arquivo && a.campo && a.mensagem, JSON.stringify(a));
      const linha = formatarAchado(a);
      assert.ok(!linha.includes("\n"), `uma linha: ${linha}`);
      assert.ok(linha.length <= 400, `linha curta: ${linha}`);
      assert.ok(linha.startsWith(`[${a.contrato}] ${a.arquivo} (${a.campo}): `), linha);
    }
  }
  assert.deepEqual([...vistos].sort(), Object.values(CONTRATOS).sort(), "todos os contratos exercitados");
});

// ---------- AC12 — arquivo ausente ou ilegível é falha ----------

test("AC12: arquivo da lista ausente ou ilegível é falha, nunca aprovado por falta de dados", (t) => {
  for (const rel of ARQUIVOS_FIXOS) {
    for (const valor of [null, "{ ilegível"]) {
      if (valor !== null && !rel.endsWith(".json")) continue;
      const achados = verificar(projeto(t, { [rel]: valor }));
      assert.ok(achados.some((a) => a.arquivo === rel && /ausente|ilegível/.test(a.mensagem)), `${rel} ${valor === null ? "ausente" : "ilegível"}: ${texto(achados)}`);
    }
  }
  const semServidores = verificar(projeto(t, { ".mcp.json": { mcpServers: {} } }));
  assert.match(texto(semServidores), /\.mcp\.json sem servidores em mcpServers/);
});

// ---------- AC14 — não escreve; lista fechada de leitura ----------

function hashes(raiz) {
  const out = {};
  for (const e of readdirSync(raiz, { withFileTypes: true, recursive: true })) {
    if (!e.isFile()) continue;
    const p = join(e.parentPath ?? e.path, e.name);
    out[p] = createHash("sha256").update(readFileSync(p)).digest("hex");
  }
  return out;
}

test("AC14: não escreve nada e só lê a lista fechada (nada em alvos/, saidas/ nem registros/<slug>/)", (t) => {
  const raiz = projeto(t, {
    "alvos/x/app.exe": "MZ",
    "saidas/x/s.json": "{}",
    "registros/x/00-seguranca.md": MODELO_REAL,
    "registros/ALVO_ATIVO": "x\n",
  });
  const antes = hashes(raiz);
  const lidos = [];
  const listados = [];
  const padrao = lerArquivosPadrao(raiz);
  verificarIntegracoes(raiz, {
    fs: {
      ler: (rel) => {
        lidos.push(rel);
        return padrao.ler(rel);
      },
      listar: (rel) => {
        listados.push(rel);
        return padrao.listar(rel);
      },
    },
  });
  assert.deepEqual(hashes(raiz), antes, "nenhum arquivo mudou");
  assert.deepEqual(listados, [".claude/hooks"]);
  assert.ok(ARQUIVOS_FIXOS.includes(AUDITORIA), "lista fechada inclui a auditoria do GhidraMCP (F2-AC21 (a))");
  assert.ok(lidos.includes(AUDITORIA), "a auditoria é lida");
  const permitido = (rel) => ARQUIVOS_FIXOS.includes(rel) || /^\.claude\/hooks\/[^/]+-niveis\.json$/.test(rel);
  for (const rel of lidos) {
    assert.ok(permitido(rel), `fora da lista fechada: ${rel}`);
    assert.ok(!/^(alvos|saidas)\//.test(rel), rel);
    assert.ok(!rel.startsWith("registros/") || rel.startsWith("registros/_modelos/"), rel);
  }
  assert.deepEqual([...new Set(lidos)].sort(), [...ARQUIVOS_FIXOS, ".claude/hooks/ghidra-niveis.json", ".claude/hooks/rea-niveis.json"].sort(), "lê cada arquivo da lista");
});

test("AC14: o módulo não importa child_process nem rede", () => {
  const fonte = readFileSync(fileURLToPath(new URL("./verificar-integracoes.mjs", import.meta.url)), "utf8");
  assert.doesNotMatch(fonte, /node:(child_process|net|http|https|dgram|tls)|\bfetch\(|writeFile|appendFile|mkdir|rmSync|unlink/);
});

// ---------- gate @qa da fatia 1 (QA-1 a QA-7) ----------

test("QA-1 (M6/M6b): nível com nome de propriedade herdada (constructor, __proto__, toString) reprova", (t) => {
  for (const nivel of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
    const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": mapa({ decompile_function: nivel }, { versao: "commit 1e98025" }) }));
    assert.equal(achados.length, 1, `${nivel}: ${texto(achados)}`);
    assert.equal(achados[0].campo, "ferramentas.decompile_function");
    assert.match(achados[0].mensagem, new RegExp(`nível inválido \`${nivel}\` na tool \`decompile_function\``));
  }
});

test("QA-2 (M10, QA-4): referência da auditoria vazia, não hexadecimal ou com menos de 7 caracteres reprova; 7 ou mais aprova", (t) => {
  for (const ref of ["", "zzzzzzz", "1e9802g", "1", "1e", "1e9", "1e98", "1e980", "1e9802"]) {
    const achados = verificar(projeto(t, { [AUDITORIA]: `GhidraMCP@${ref} \n` }));
    assert.equal(achados.length, 1, `"${ref}": ${texto(achados)}`);
    assert.equal(achados[0].arquivo, AUDITORIA);
    assert.match(achados[0].mensagem, /não é prefixo \(7 a 40 hexadecimais\)/);
  }
  for (const ref of ["1e98025", "1e980252", "1E980252087B", COMMIT]) assert.deepEqual(verificar(projeto(t, { [AUDITORIA]: `GhidraMCP@${ref}\n` })), [], ref);
});

test("QA-4: commit do mapa do Ghidra com menos de 7 caracteres reprova (sem commit legível); 7 ou mais aprova", (t) => {
  const comVersao = (versao) => ({ ...BASE[".claude/hooks/ghidra-niveis.json"], versao });
  for (const c of ["1", "1e98", "1e9802"]) {
    const achados = verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": comVersao(`GhidraMCP 2.0 (commit ${c})`) }));
    assert.equal(achados.length, 1, `${c}: ${texto(achados)}`);
    assert.equal(achados[0].campo, "versao");
    assert.match(achados[0].mensagem, /sem commit legível/);
  }
  for (const c of ["1e98025", "1e9802520", COMMIT])
    assert.deepEqual(verificar(projeto(t, { ".claude/hooks/ghidra-niveis.json": comVersao(`GhidraMCP 2.0 (commit ${c})`) })), [], c);
});

test("QA-3 (M19): pasta .claude/hooks ausente ou ilegível é falha, não ignorada", (t) => {
  const ausente = projeto(t, { ".claude/hooks/rea-niveis.json": null, ".claude/hooks/ghidra-niveis.json": null, ".claude/hooks/rea-gate.mjs": null });
  const a = verificar(ausente);
  assert.ok(a.some((x) => x.arquivo === ".claude/hooks" && x.campo === "(pasta)" && /pasta ausente/.test(x.mensagem)), texto(a));
  const arquivoNoLugar = projeto(t, { ".claude/hooks/rea-niveis.json": null, ".claude/hooks/ghidra-niveis.json": null, ".claude/hooks/rea-gate.mjs": null });
  rmSync(join(arquivoNoLugar, ".claude", "hooks"), { recursive: true, force: true });
  writeFileSync(join(arquivoNoLugar, ".claude", "hooks"), "não é pasta");
  const b = verificar(arquivoNoLugar);
  assert.ok(b.some((x) => x.arquivo === ".claude/hooks" && /pasta (ilegível|ausente)/.test(x.mensagem)), texto(b));
  const injetada = verificarIntegracoes(projeto(t), { fs: { ...lerArquivosPadrao(projeto(t)), listar: () => ({ erro: "ilegível" }) } });
  assert.ok(injetada.some((x) => x.arquivo === ".claude/hooks" && /pasta ilegível/.test(x.mensagem)), texto(injetada));
});

test("QA-3 (M26): args do ghidra no .mcp.json sem commit reprova (versão e auditoria)", (t) => {
  for (const args of [["--from", "git+https://github.com/LaurieWired/GhidraMCP@2.0", "ghidra-mcp"], ["--from", "git+https://github.com/LaurieWired/GhidraMCP", "ghidra-mcp"], "não é lista"]) {
    const achados = verificar(projeto(t, { ".mcp.json": mcpCom({ ghidra: { command: "uvx", args } }) }));
    const versao = achados.find((a) => a.contrato === CONTRATOS.versao);
    assert.ok(versao, `${JSON.stringify(args)}: ${texto(achados)}`);
    assert.equal(versao.arquivo, ".mcp.json");
    assert.equal(versao.campo, "mcpServers.ghidra.args");
    assert.match(versao.mensagem, /args do servidor ghidra sem referência GhidraMCP@<commit>/);
    assert.ok(achados.some((a) => a.arquivo === AUDITORIA && /sem commit GhidraMCP@<commit> no \.mcp\.json para conferir as referências da auditoria/.test(a.mensagem)), texto(achados));
  }
});

test("QA-5: matcher fora da forma reprova sem ser executado como regex (matcher patológico termina rápido)", (t) => {
  const patologico = "(.*.*)*(.*.*)*(.*.*)*(.*.*)*Z";
  const raiz = projeto(t, { ".claude/settings.json": settingsCom(patologico) });
  const original = globalThis.RegExp;
  const montadas = [];
  globalThis.RegExp = new Proxy(original, {
    construct(alvo, args) {
      montadas.push(String(args[0]));
      return Reflect.construct(alvo, args);
    },
  });
  let achados;
  const inicio = performance.now();
  try {
    achados = verificar(raiz);
  } finally {
    globalThis.RegExp = original;
  }
  assert.ok(performance.now() - inicio < 2000, "terminou rápido");
  assert.ok(!montadas.some((s) => s.includes(patologico)), "nenhum RegExp montado com o matcher fora da forma");
  assert.match(texto(achados), /fora da forma `mcp__\(n1\|n2…\)__\.\*`/);
  assert.match(texto(achados), /servidor `rea` sem cobertura do matcher do gate/);
  assert.match(texto(achados), /servidor `ghidra` sem cobertura do matcher do gate/);
});

test("QA-7: nomes longos de servidor, tool, nível, referência e matcher são cortados nas mensagens", (t) => {
  const longo = "a".repeat(300);
  const hexLongo = "f".repeat(300);
  const cenarios = [
    { ".mcp.json": mcpCom({ [longo]: { command: "x" } }) },
    { ".claude/hooks/ghidra-niveis.json": mapa({ [longo]: "N1", ok: `N${"9".repeat(300)}`, [`b${" ".repeat(300)}`]: "N1" }, { versao: "commit 1e98025" }) },
    { ".claude/hooks/ghidra-niveis.json": mapa({ [longo]: "" }, { versao: "commit 1e98025" }) },
    { [`.claude/hooks/x${"b".repeat(200)}-niveis.json`]: mapa({ t1: "N1" }) },
    { ".claude/settings.json": settingsCom(`mcp__(rea|ghidra|${longo})__.*`) },
    { ".claude/settings.json": settingsCom(`${longo}*`) },
    { [AUDITORIA]: `GhidraMCP@${hexLongo}\n` },
    { [RUNBOOK]: `${BASE[RUNBOOK]}GhidraMCP@${hexLongo}\n` },
  ];
  for (const trocas of cenarios) {
    const achados = verificar(projeto(t, trocas));
    assert.ok(achados.length > 0, JSON.stringify(Object.keys(trocas)));
    for (const a of achados)
      for (const linha of formatarAchado(a).split("\n")) {
        assert.ok(linha.length <= 400, `linha longa (${linha.length}): ${linha.slice(0, 120)}`);
        assert.ok(!linha.includes(longo.slice(0, 61)) && !linha.includes(hexLongo.slice(0, 61)), `nome inteiro ecoado: ${linha.slice(0, 120)}`);
      }
    assert.ok(achados.some((a) => formatarAchado(a).includes("…")), "reticências no corte");
  }
});
