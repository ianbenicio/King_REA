// Declarações mínimas do Node para a checagem de tipos dos módulos de política (story MEL-03, AC4b).
// O projeto não usa @types/node (seria dependência nova, fora da aprovação de 2026-11-02): as APIs
// do Node entram como `any`. O que o tsc confere é o código próprio: chamadas, retornos, nulos e JSDoc.
declare module "node:child_process";
declare module "node:crypto";
declare module "node:fs";
declare module "node:path";
declare module "node:url";
// process.exit tipado como never: é o que deixa o tsc ver que decide() encerra o hook.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  platform: string;
  exit(code?: number): never;
  [membro: string]: any;
};
declare const Buffer: any;
declare const URL: any;
declare const TextDecoder: any;
declare const console: { log(...dados: any[]): void; error(...dados: any[]): void };
interface ImportMeta {
  url: string;
  main: boolean;
}
