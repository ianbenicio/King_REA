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
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
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
  } else if (Array.isArray(value)) value.forEach((item) => collectPaths(item, key, out));
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
}

if (level === "N0") decide("allow", `${server}/${tool} é N0 (sessão/evidência), caminhos dentro de "${slug}".`);

const approved = (front.match(/^niveis_aprovados:\s*\[([^\]]*)\]/m)?.[1] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!approved.includes(level))
  decide(
    "deny",
    `${server}/${tool} é ${level}, fora do plano aprovado para "${slug}" (${approved.join(", ") || "nenhum"}). Pare, explique ao responsável o motivo e peça aprovação; se aprovado, registre um adendo no 00-seguranca.md.`,
  );

if (level === "N3" || level === "N4b")
  decide(
    "ask",
    `${server}/${tool} é ${level} (${map.niveis?.[level] ?? ""}). Aprovado no plano de "${slug}", mas cada execução exige confirmação.`,
  );

decide("allow", `${server}/${tool} é ${level}, aprovado para "${slug}".`);
