#!/usr/bin/env node
// Servidor estático mínimo da interface (ESPECIFICACAO.md, seção 10.1): Node puro, sem
// dependência, escuta só em 127.0.0.1 e entrega só os arquivos do piloto de que a página precisa
// (interface/, src/ e monetizacao.json). Módulos ES não carregam por file:// no navegador.
// Uso: node reimplementacoes/puzzle-piloto/interface/servidor.mjs [porta]   (padrão 8737)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));
const PERMITIDOS = ["interface/", "src/", "monetizacao.json"];
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

// Caminho pedido → arquivo dentro da raiz, ou null (fora da lista, fora da raiz, tipo estranho).
export function resolver(caminhoUrl) {
  let relativo;
  try {
    relativo = decodeURIComponent(caminhoUrl).replace(/^\/+/, "");
  } catch {
    return null;
  }
  if (relativo === "interface/") relativo = "interface/index.html";
  if (relativo.includes("\0")) return null;
  const arquivo = normalize(join(RAIZ, relativo));
  const dentro = relative(RAIZ, arquivo).split(sep).join("/");
  if (dentro.startsWith("..") || !PERMITIDOS.some((p) => dentro === p || dentro.startsWith(p))) return null;
  if (!TIPOS[extname(arquivo)]) return null;
  return arquivo;
}

export function criarServidor() {
  return createServer(async (req, res) => {
    const responder = (status, corpo, tipo = "text/plain; charset=utf-8") => {
      res.writeHead(status, { "content-type": tipo, "cache-control": "no-store", "x-content-type-options": "nosniff" });
      res.end(req.method === "HEAD" ? undefined : corpo);
    };
    if (req.method !== "GET" && req.method !== "HEAD") return responder(405, "método não permitido");
    const { pathname: caminho, search } = new URL(req.url, "http://127.0.0.1");
    if (caminho === "/" || caminho === "/interface") {
      res.writeHead(302, { location: `/interface/${search}` });
      return res.end();
    }
    const arquivo = resolver(caminho);
    if (!arquivo) return responder(404, "não encontrado");
    try {
      responder(200, await readFile(arquivo), TIPOS[extname(arquivo)]);
    } catch {
      responder(404, "não encontrado");
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const porta = Number.parseInt(process.argv[2] ?? "8737", 10);
  criarServidor().listen(porta, "127.0.0.1", () => console.log(`Puzzle do piloto em http://127.0.0.1:${porta}/interface/`));
}
