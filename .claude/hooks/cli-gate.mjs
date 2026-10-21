#!/usr/bin/env node
// Gate do CLI do REA (PreToolUse, matcher Bash|PowerShell).
// O gate MCP não vê `npx rea <comando>` no terminal. Este hook aplica a mesma regra, fail-closed:
// - setup/update/uninstall depois de qualquer menção ao REA, mesmo entre aspas ou dentro
//   de `bash -c "..."`, são negados (CLAUDE.md: configuração global e versão sem auditoria);
// - uma invocação simples e sem alvo (ajuda, diagnóstico, evidência) passa sem decisão;
// - uma invocação reconhecida com subcomando que age sobre alvo exige alvo ativo com
//   protocolo aprovado e pede confirmação;
// - qualquer outra menção ao REA que o hook não consegue interpretar pede confirmação.
// Comandos que não mencionam o REA seguem sem decisão deste hook.
// Limite: é uma trava contra engano e injeção comum, não contra ofuscação deliberada
// (nome montado em variável, codificação). Por isso a menção ambígua pede confirmação.
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
  decide("deny", "Entrada do hook ilegível; bloqueado por segurança.");
}

const command = String(input.tool_input?.command ?? "");
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? join(here, "..", "..");

const FREE = new Set([
  "", "--help", "-h", "help", "--version", "-v",
  "doctor", "providers", "capabilities", "mcp",
  "evidence-import", "evidence-export", "compare", "inspect-analysis-view",
]);

// Menção ao REA em qualquer lugar do texto: rea, rea-agents, rea.mjs, rea.cmd como palavra
// (não pega "rea-gate.mjs", "área", "reabrir").
const MENTION = /(?<![\p{L}\p{N}_-])(?:rea-agents|rea(?:\.mjs|\.cmd)?)(?![\p{L}\p{N}_-])/giu;
const BLOCKED = /(?<![\p{L}\p{N}_-])(setup|update|uninstall)(?![\p{L}\p{N}_-])/iu;

// Invocação simples e reconhecida, comando inteiro: um só comando, sem aspas, sem
// operadores de shell, sem substituição. O subcomando é o primeiro argumento.
const SIMPLE =
  /^\s*(?:npx\s+(?:--yes\s+|-y\s+)?(?:rea|rea-agents)(?:@[\w.-]+)?|npm\s+(?:run|run-script)\s+rea(?:\s+--)?|node\s+[\w./\\:-]*[\\/]rea\.mjs|(?:[\w./\\:-]*[\\/])?rea(?:\.cmd|\.mjs)?)(?:\s+([^\s"'`$;&|<>(){}]+))?(?:\s+[^\s"'`$;&|<>(){}]+)*\s*$/i;

const mentions = [...command.matchAll(MENTION)];
if (mentions.length === 0) process.exit(0);

const afterFirst = command.slice(mentions[0].index);
const blocked = afterFirst.match(BLOCKED)?.[1];
if (blocked)
  decide(
    "deny",
    `\`rea ${blocked.toLowerCase()}\` é proibido neste projeto (CLAUDE.md): setup grava configuração global; atualizar exige auditoria e decisão do responsável. Se o comando só cita essas palavras (ex.: mensagem de commit), passe o texto por arquivo (git commit -F).`,
  );

const simple = command.match(SIMPLE);
if (!simple)
  decide(
    "ask",
    "O comando menciona o REA de um jeito que o gate não consegue interpretar (aspas, shell aninhado, vários comandos). Confirme que ele não age sobre um alvo fora dos níveis aprovados.",
  );

const sub = (simple[1] ?? "").toLowerCase();
if (FREE.has(sub)) process.exit(0);

const slug = readText(join(root, "registros", "ALVO_ATIVO"))?.trim();
const front = slug && /^[a-z0-9][a-z0-9._-]*$/.test(slug)
  ? readText(join(root, "registros", slug, "00-seguranca.md"))?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  : undefined;
const status = front?.match(/^status:\s*(\S+)/m)?.[1];

if (status !== "aprovado")
  decide(
    "deny",
    `\`rea ${sub}\` age sobre um alvo e não há alvo ativo com protocolo de segurança aprovado. Rode o protocolo de segurança (skill protocolo-seguranca) antes.`,
  );

decide(
  "ask",
  `\`rea ${sub}\` age sobre um alvo (ativo: "${slug}"). Confirme que o comando está dentro dos níveis aprovados em registros/${slug}/00-seguranca.md.`,
);
