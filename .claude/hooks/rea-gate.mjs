#!/usr/bin/env node
// Gate de segurança do REA (PreToolUse, matcher mcp__rea__.*).
// Libera uma tool do REA só se o alvo ativo tiver o protocolo de segurança
// aprovado e o nível de risco da tool estiver no plano aprovado.
// Fail-closed: tool fora do mapa, registro ausente ou ilegível => bloqueia.
// N3 e N4b (execução do alvo, mutação de dispositivo) sempre pedem confirmação.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const decide = (permissionDecision, reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason: `[gate REA] ${reason}`,
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
const tool = String(input.tool_name ?? "").replace(/^mcp__rea__/, "");

const map = JSON.parse(readText(join(here, "rea-niveis.json")) ?? "{}");
const level = map.ferramentas?.[tool];
if (level === undefined)
  decide(
    "deny",
    `Tool "${tool}" não está no mapa de níveis (rea ${map.rea_version ?? "?"}). Versão nova do REA exige auditoria e atualização de .claude/hooks/rea-niveis.json.`,
  );

if (level === "N0") decide("allow", `${tool} é N0 (sessão/evidência).`);

const slug = readText(join(root, "registros", "ALVO_ATIVO"))?.trim();
if (!slug || !/^[a-z0-9][a-z0-9._-]*$/.test(slug))
  decide(
    "deny",
    `Nenhum alvo ativo válido em registros/ALVO_ATIVO. Rode o protocolo de segurança (skill protocolo-seguranca) antes de usar ${tool} (${level}).`,
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

const approved = (front.match(/^niveis_aprovados:\s*\[([^\]]*)\]/m)?.[1] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!approved.includes(level))
  decide(
    "deny",
    `${tool} é ${level}, fora do plano aprovado para "${slug}" (${approved.join(", ") || "nenhum"}). Pare, explique ao responsável o motivo e peça aprovação; se aprovado, registre um adendo no 00-seguranca.md.`,
  );

if (level === "N3" || level === "N4b")
  decide(
    "ask",
    `${tool} é ${level} (${map.niveis[level]}). Aprovado no plano de "${slug}", mas cada execução exige confirmação.`,
  );

decide("allow", `${tool} é ${level}, aprovado para "${slug}".`);
