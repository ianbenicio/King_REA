#!/usr/bin/env node
// Gate de segurança das tools MCP de engenharia reversa (PreToolUse).
// Matcher em .claude/settings.json: mcp__(rea|ghidra)__.* — acrescente o servidor ao
// matcher E crie .claude/hooks/<servidor>-niveis.json ao registrar um servidor novo.
// Libera uma tool só se o alvo ativo tiver o protocolo de segurança aprovado e o nível
// da tool estiver no plano aprovado.
// Fail-closed: servidor sem mapa, tool fora do mapa, registro ausente ou ilegível => bloqueia.
// N3 e N4b (execução do alvo, mutação de dispositivo) sempre pedem confirmação.
// Vínculo ao alvo: todo caminho local nos argumentos da tool (inclusive em N0) precisa
// ficar, depois de resolvido e canonizado, dentro de alvos/<slug>/ ou saidas/<slug>/ do
// alvo ativo. Fora disso, bloqueia. Limites: tools que operam sobre sessão já aberta
// (argumento "document", tools do Ghidra) e alvos por URL ou dispositivo não têm caminho
// para conferir; o vínculo delas vem da sessão aberta por um caminho conferido.
// Identidade na admissão (MEL-06a): todo caminho que aponta para alvos/<slug>/ admite
// conteúdo original. Cada arquivo admitido (num diretório, cada arquivo dele) tem o
// SHA-256 conferido com a tabela "Identidade dos arquivos" do 00-seguranca.md. Hash
// divergente, ausente ou ambíguo, tabela ausente ou malformada, link dentro de diretório
// admitido e caminho inexistente em alvos/ bloqueiam. Caminhos em saidas/<slug>/ (saída
// derivada, bundle de evidência) não são comparados ao hash do arquivo pai. Consultas sobre
// documento já aberto não têm caminho e não recalculam nada. Limites (cobertos só pela
// MEL-06): troca do arquivo depois da admissão (o REA lê depois do hook) e troca de
// programa no Ghidra, cujas tools não recebem caminho.
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync, readdirSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const decide = (permissionDecision, reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason: `[gate RE] ${reason}`,
      },
    }),
  );
  process.exit(0);
};

const readText = (path) => {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
};

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  decide("deny", "Entrada do hook ilegível; bloqueado por segurança.");
}

const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? join(here, "..", "..");
const parsed = String(input.tool_name ?? "").match(/^mcp__([a-z0-9-]+)__(.+)$/i);
if (!parsed) decide("deny", `Nome de tool inesperado: "${input.tool_name}".`);
const [, server, tool] = parsed;

const mapText = readText(join(here, `${server}-niveis.json`));
if (mapText === undefined)
  decide(
    "deny",
    `Servidor "${server}" sem mapa de níveis (.claude/hooks/${server}-niveis.json). Servidor novo exige auditoria e mapeamento das tools.`,
  );
let map;
try {
  map = JSON.parse(mapText);
} catch {
  decide("deny", `Mapa .claude/hooks/${server}-niveis.json ilegível; bloqueado por segurança.`);
}

const level = map.ferramentas?.[tool];
if (level === undefined)
  decide(
    "deny",
    `Tool "${tool}" não está no mapa de "${server}" (versão ${map.versao ?? map.rea_version ?? "?"}). Versão nova exige auditoria e atualização de .claude/hooks/${server}-niveis.json.`,
  );

// ---------- caminhos nos argumentos ----------
// Chaves cujo valor é sempre caminho local (mapeadas no schema do REA 6.4.0).
const PATH_KEY = /(^|_)(path|paths|root|roots|directory)$|^(executable|local_path)$/i;
// Caminhos que não são do host ou não são do alvo: no dispositivo Android, unidades
// internas do JEB, executável do servidor de análise.
const EXEMPT_KEYS = new Set(["device_path", "unit_path", "parent_unit_path", "expected_server_path"]);
// Texto livre (buscas, regex, nomes, comentários) nunca é tratado como caminho pela aparência.
const TEXT_KEYS = new Set(["pattern", "query", "filter", "filters", "selector", "comment", "inline_comment", "notes", "question", "goal", "name", "names", "detail"]);
// Em qualquer outra chave, só valores que claramente são caminho local.
const looksLikePath = (value) =>
  /^[a-z]:[\\/]/i.test(value) || /^\\\\/.test(value) || /^~[\\/]/.test(value) || /^\.\.?[\\/]/.test(value) ||
  (/[\\/]/.test(value) && /\.[a-z0-9]{1,8}$/i.test(value) && !/\s/.test(value));

const collectPaths = (value, key = "", out = []) => {
  if (EXEMPT_KEYS.has(key)) return out;
  if (typeof value === "string") {
    const fileUrl = /^file:/i.test(value);
    const otherUrl = !fileUrl && /^[a-z][a-z0-9+.-]+:\/\//i.test(value);
    if (fileUrl || (value && !otherUrl && (PATH_KEY.test(key) || (!TEXT_KEYS.has(key) && looksLikePath(value)))))
      out.push({ key, value });
  } else if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, key, out);
  }
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collectPaths(v, k, out);
  return out;
};

const caseFold = (p) => (process.platform === "win32" ? p.toLowerCase() : p);
// Caminho canônico: resolve relativo à raiz do projeto, segue links e junções no trecho que existe.
const canonical = (p) => {
  let rest = "";
  let current = resolve(p);
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return resolve(p);
    rest = rest ? join(basename(current), rest) : basename(current);
    current = parent;
  }
  const real = realpathSync.native(current);
  return rest ? join(real, rest) : real;
};
const inside = (base, p) => {
  const rel = relative(caseFold(base), caseFold(p));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};
const toLocal = (value) => {
  if (/^file:/i.test(value)) return fileURLToPath(value);
  if (/^~[\\/]/.test(value)) return join(process.env.USERPROFILE ?? process.env.HOME ?? "~", value.slice(2));
  return isAbsolute(value) ? value : join(root, value);
};

const paths = collectPaths(input.tool_input ?? {});

if (level === "N0" && paths.length === 0) decide("allow", `${server}/${tool} é N0 (sessão/evidência).`);

const slug = readText(join(root, "registros", "ALVO_ATIVO"))?.trim();
if (!slug || !/^[a-z0-9][a-z0-9._-]*$/.test(slug))
  decide(
    "deny",
    `Nenhum alvo ativo válido em registros/ALVO_ATIVO. Rode o protocolo de segurança (skill protocolo-seguranca) antes de usar ${server}/${tool} (${level}).`,
  );

const record = readText(join(root, "registros", slug, "00-seguranca.md"));
const front = record?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
if (!front)
  decide(
    "deny",
    `Registro registros/${slug}/00-seguranca.md ausente ou sem frontmatter. Rode o protocolo de segurança.`,
  );

const status = front.match(/^status:\s*(\S+)/m)?.[1];
if (status !== "aprovado")
  decide(
    "deny",
    `Protocolo de segurança de "${slug}" está com status "${status ?? "?"}", não "aprovado".`,
  );

const bases = ["alvos", "saidas"].map((dir) => canonical(join(root, dir, slug)));
const admitted = new Map(); // caminho canônico em alvos/<slug>/ => chave do argumento
for (const { key, value } of paths) {
  let target;
  try {
    target = canonical(toLocal(value));
  } catch {
    decide("deny", `Caminho ilegível em "${key}": ${value}. Bloqueado por segurança.`);
  }
  if (!bases.some((base) => inside(base, target)))
    decide(
      "deny",
      `${server}/${tool}: "${key}" aponta para fora do alvo ativo "${slug}" (${value}). Só são aceitos caminhos em alvos/${slug}/ e saidas/${slug}/. Copie o arquivo para alvos/${slug}/ ou, se for outro alvo, rode o protocolo de segurança para ele.`,
    );
  if (inside(bases[0], target) && !admitted.has(target)) admitted.set(target, key);
}

// ---------- identidade dos arquivos admitidos (MEL-06a) ----------
const PROTOCOLO = `registre o SHA-256 na seção "Identidade dos arquivos" de registros/${slug}/00-seguranca.md pelo protocolo de segurança (skill protocolo-seguranca) ou por adendo aprovado pelo responsável. O hash vem da triagem, nunca do arquivo atual sem conferência`;
const HEADING = /^##\s+(?:\d+\.\s*)?Identidade dos arquivos\s*$/;

// Tabela "Arquivo | SHA-256", caminho relativo a alvos/<slug>/. Fail-closed: seção ausente,
// repetida, vazia, linha malformada, hash incompleto ou caminho com dois hashes => bloqueia.
const readIdentity = () => {
  const lines = record.split(/\r?\n/);
  const starts = lines.flatMap((line, i) => (HEADING.test(line) ? [i] : []));
  if (starts.length === 0)
    decide("deny", `Alvo "${slug}" sem hash registrado: falta a seção "Identidade dos arquivos" no 00-seguranca.md. Admissão bloqueada; ${PROTOCOLO}.`);
  if (starts.length > 1)
    decide("deny", `Alvo "${slug}": seção "Identidade dos arquivos" repetida no 00-seguranca.md (hash ambíguo). Admissão bloqueada; deixe uma só seção e ${PROTOCOLO}.`);
  const end = lines.findIndex((line, i) => i > starts[0] && /^#{1,2}\s/.test(line));
  const body = lines.slice(starts[0] + 1, end === -1 ? undefined : end).join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const table = new Map();
  for (const line of body.split("\n").map((l) => l.trim())) {
    if (!line.startsWith("|")) continue;
    const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (/^arquivo$/i.test(cells[0]) || cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const file = cells[0]?.match(/^`([^`]+)`$/)?.[1].replace(/\\/g, "/").replace(/^(\.\/)+/, "");
    const hash = cells[1]?.match(/^`([0-9a-f]{64})`$/i)?.[1].toLowerCase();
    if (!file || !hash || cells.length !== 2 || /^[a-z]:|^\//i.test(file) || file.split("/").some((s) => s === ".." || s === ""))
      decide("deny", `Alvo "${slug}": linha ilegível na seção "Identidade dos arquivos" (${line}). Formato: | \`caminho/relativo\` | \`<SHA-256 completo, 64 hex>\` |. Admissão bloqueada; ${PROTOCOLO}.`);
    const id = caseFold(file);
    if (table.has(id) && table.get(id).hash !== hash)
      decide("deny", `Alvo "${slug}": "${file}" tem dois SHA-256 diferentes na seção "Identidade dos arquivos" (hash ambíguo). Admissão bloqueada; ${PROTOCOLO}.`);
    table.set(id, { file, hash });
  }
  if (table.size === 0)
    decide("deny", `Alvo "${slug}" sem hash registrado: a seção "Identidade dos arquivos" está vazia. Admissão bloqueada; ${PROTOCOLO}.`);
  return table;
};

const sha256 = (file) => {
  const hash = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1 << 20);
  const fd = openSync(file, "r");
  try {
    for (;;) {
      const n = readSync(fd, buffer, 0, buffer.length, null);
      if (n <= 0) break;
      hash.update(buffer.subarray(0, n));
    }
  } finally {
    closeSync(fd);
  }
  return hash.digest("hex");
};

const checkFile = (table, file, key) => {
  const rel = relative(bases[0], file).split(sep).join("/");
  const entry = table.get(caseFold(rel));
  if (!entry)
    decide("deny", `${server}/${tool}: "${key}" admite alvos/${slug}/${rel}, que não tem SHA-256 registrado. Admissão bloqueada; ${PROTOCOLO}.`);
  let actual;
  try {
    actual = sha256(file);
  } catch {
    decide("deny", `${server}/${tool}: não foi possível ler alvos/${slug}/${rel} para conferir o SHA-256. Bloqueado por segurança.`);
  }
  if (actual !== entry.hash)
    decide("deny", `${server}/${tool}: SHA-256 de alvos/${slug}/${rel} (${actual}) diverge do registrado no 00-seguranca.md (${entry.hash}). O conteúdo mudou depois da aprovação: não use até o responsável decidir; versão nova exige protocolo de segurança novo.`);
};

const checkAdmission = (table, target, key) => {
  let info;
  try {
    info = lstatSync(target);
  } catch {
    decide("deny", `${server}/${tool}: "${key}" aponta para ${relative(root, target)}, que não existe em alvos/${slug}/. Só arquivos com SHA-256 registrado são admitidos ali; saída vai para saidas/${slug}/.`);
  }
  if (info.isSymbolicLink())
    decide("deny", `${server}/${tool}: link em ${relative(root, target)} dentro de alvos/${slug}/; conteúdo sem identidade. Bloqueado por segurança.`);
  if (info.isFile()) return checkFile(table, target, key);
  if (!info.isDirectory())
    decide("deny", `${server}/${tool}: ${relative(root, target)} não é arquivo nem diretório. Bloqueado por segurança.`);
  let entries;
  try {
    entries = readdirSync(target, { withFileTypes: true });
  } catch {
    decide("deny", `${server}/${tool}: diretório ${relative(root, target)} ilegível. Bloqueado por segurança.`);
  }
  for (const entry of entries) checkAdmission(table, join(target, entry.name), key);
};

const checkIdentity = () => {
  if (admitted.size === 0) return;
  const table = readIdentity();
  for (const [target, key] of admitted) checkAdmission(table, target, key);
};

if (level === "N0") {
  checkIdentity();
  decide("allow", `${server}/${tool} é N0 (sessão/evidência), caminhos dentro de "${slug}".`);
}

const approved = (front.match(/^niveis_aprovados:\s*\[([^\]]*)\]/m)?.[1] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!approved.includes(level))
  decide(
    "deny",
    `${server}/${tool} é ${level}, fora do plano aprovado para "${slug}" (${approved.join(", ") || "nenhum"}). Pare, explique ao responsável o motivo e peça aprovação; se aprovado, registre um adendo no 00-seguranca.md.`,
  );

checkIdentity();

if (level === "N3" || level === "N4b")
  decide(
    "ask",
    `${server}/${tool} é ${level} (${map.niveis?.[level] ?? ""}). Aprovado no plano de "${slug}", mas cada execução exige confirmação.`,
  );

decide("allow", `${server}/${tool} é ${level}, aprovado para "${slug}".`);
