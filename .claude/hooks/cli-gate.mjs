#!/usr/bin/env node
// Gate do CLI do REA (PreToolUse, matcher Bash|PowerShell).
// O gate MCP não vê `npx rea <comando>` no terminal. Este hook aplica a mesma regra:
// - subcomandos sem alvo (ajuda, diagnóstico, evidência) passam;
// - setup/update/uninstall são negados (CLAUDE.md: configuração global e versão sem auditoria);
// - os demais exigem alvo ativo com protocolo de segurança aprovado e pedem confirmação.
// Comandos que não chamam o REA seguem sem decisão deste hook.
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
        permissionDecisionReason: `[gate CLI REA] ${reason}`,
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
  process.exit(0); // entrada ilegível: não é decisão deste hook
}

const command = String(input.tool_input?.command ?? "");
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? join(here, "..", "..");

const FREE = new Set([
  "", "--help", "-h", "help", "--version", "-v",
  "doctor", "providers", "capabilities", "mcp",
  "evidence-import", "evidence-export", "compare", "inspect-analysis-view",
]);
const BLOCKED = new Set(["setup", "update", "uninstall"]);

// Invocações do REA no início de um segmento de comando.
const INVOKE =
  /^\s*(?:&\s*)?(?:npx\s+(?:--yes\s+|-y\s+)?(?:rea|rea-agents)(?:@\S+)?|node\s+\S*rea\.mjs|(?:\S*[\\/])?rea(?:\.cmd|\.mjs)?)(?=\s|$)\s*(\S*)/i;

// Texto que não é comando não conta: corpos de heredoc (bash), here-strings (PowerShell)
// e strings entre aspas (ex.: mensagens de commit que citam "rea analyze").
const code = command
  .replace(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1[^\n]*\n[\s\S]*?\n\s*\2\s*(?=\r?\n|$)/g, "")
  .replace(/@'[\s\S]*?'@|@"[\s\S]*?"@/g, "")
  .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');

const subcommands = code
  .split(/\r?\n|;|&&|\|\||\|/)
  .map((segment) => segment.match(INVOKE)?.[1]?.replace(/^["']|["']$/g, "").toLowerCase())
  .filter((sub) => sub !== undefined);

if (subcommands.length === 0) process.exit(0);

const blocked = subcommands.find((sub) => BLOCKED.has(sub));
if (blocked)
  decide(
    "deny",
    `\`rea ${blocked}\` é proibido neste projeto (CLAUDE.md): setup grava configuração global; atualizar exige auditoria e decisão do responsável.`,
  );

const withTarget = [...new Set(subcommands.filter((sub) => !FREE.has(sub)))];
if (withTarget.length === 0) process.exit(0);

const slug = readText(join(root, "registros", "ALVO_ATIVO"))?.trim();
const front = slug && /^[a-z0-9][a-z0-9._-]*$/.test(slug)
  ? readText(join(root, "registros", slug, "00-seguranca.md"))?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  : undefined;
const status = front?.match(/^status:\s*(\S+)/m)?.[1];

if (status !== "aprovado")
  decide(
    "deny",
    `\`rea ${withTarget.join(", ")}\` age sobre um alvo e não há alvo ativo com protocolo de segurança aprovado. Rode o protocolo de segurança (skill protocolo-seguranca) antes.`,
  );

decide(
  "ask",
  `\`rea ${withTarget.join(", ")}\` age sobre um alvo (ativo: "${slug}"). Confirme que o comando está dentro dos níveis aprovados em registros/${slug}/00-seguranca.md.`,
);
