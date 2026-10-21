// Testes da checagem de monetização (npm test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hashPerfil, lerCatalogo, verificarProjetos } from "./verificar-perfis.mjs";

const real = lerCatalogo(readFileSync(new URL("../../docs/catalogo-monetizacao.md", import.meta.url), "utf8"));
const HOJE = "2026-10-20";

const base = { catalogo_versao: 3, publico: "geral", children_likely: false, children_likely_fundamento: "loja 18+, sem tema infantil" };
const perfil = (dados) => JSON.stringify({ ...base, ...dados });
// Perfil com aprovação válida, presa ao hash do próprio perfil.
const aprovado = (dados) => {
  const p = { ...base, ...dados };
  return JSON.stringify({ ...p, aprovacao: { por: "responsável", data: HOJE, perfil_sha256: hashPerfil(p) } });
};
const B = (id) => ({ id, justificativa: "ritmo de sessão", limites: "recarga grátis a cada 20 min" });
const rodar = (arquivos, catalogo = real) =>
  verificarProjetos({ catalogo, arquivos: new Map(Object.entries(arquivos)), hoje: HOJE });
const um = (conteudo) => rodar({ "reimplementacoes/jogo/monetizacao.json": conteudo });

test("catálogo real v3: sem erros, IDs estáveis, classe como atributo", () => {
  assert.deepEqual(real.erros, []);
  assert.equal(real.versao, 3);
  assert.equal(real.padroes.size, 36);
  for (const id of real.padroes.keys()) assert.match(id, /^MON-\d{4}$/);
  const contagem = { A: 0, B: 0, C: 0 };
  for (const p of real.padroes.values()) contagem[p.classe]++;
  assert.deepEqual(contagem, { A: 13, B: 10, C: 13 });
});

test("todo ID antigo (v1 e v2) resolve para um ID estável", () => {
  const antigos = [
    ...Array.from({ length: 10 }, (_, i) => `MON-A-${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 12 }, (_, i) => `MON-B-${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 13 }, (_, i) => `MON-C-${String(i + 1).padStart(2, "0")}`),
  ];
  for (const id of antigos) assert.ok(real.aliases.has(id), id);
  assert.equal(real.aliases.get("MON-B-05"), "MON-0033");
  assert.equal(real.aliases.get("MON-C-13"), "MON-0033");
  assert.equal(real.aliases.get("MON-B-06"), "MON-0010");
  assert.equal(real.aliases.get("MON-A-10"), "MON-0010");
  assert.equal(real.padroes.get("MON-0033").classe, "C");
  assert.equal(real.padroes.get("MON-0010").classe, "A");
  assert.equal(real.padroes.get("MON-0018").somenteAdulto, true);
});

test("projeto sem perfil nem marcadores passa", () => {
  assert.deepEqual(rodar({ "reimplementacoes/notepad/src/App.cs": "class App {}" }).problemas, []);
});

test("perfil só com classe A passa sem aprovação", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-0002", parametros: { intervalo_minimo_s: 30 } }, { id: "MON-0036" }] }),
    "reimplementacoes/jogo/src/Ads.cs": "// MON-0002\nvoid ShowInterstitial() {}",
  });
  assert.deepEqual(r.problemas, []);
  assert.deepEqual(r.avisos, []);
});

test("classe C é bloqueada no perfil e em marcador, inclusive por alias", () => {
  assert.match(um(perfil({ padroes: [{ id: "MON-0021" }] })).problemas[0], /classe C/);
  const r = rodar({ "reimplementacoes/jogo/src/Dda.cs": "// MON-B-05\n// MON-0033" });
  assert.equal(r.problemas.length, 2);
  assert.match(r.problemas[0], /MON-B-05 \(MON-0033/);
});

test("alias de padrão permitido passa com aviso para migrar", () => {
  const r = um(perfil({ padroes: [{ id: "MON-A-02" }] }));
  assert.deepEqual(r.problemas, []);
  assert.match(r.avisos[0], /use MON-0002/);
});

test("children_likely é obrigatório; false exige fundamento", () => {
  const { children_likely, ...sem } = base;
  assert.match(rodar({ "reimplementacoes/jogo/monetizacao.json": JSON.stringify({ ...sem, padroes: [] }) }).problemas[0], /children_likely/);
  assert.match(um(perfil({ children_likely_fundamento: "", padroes: [] })).problemas[0], /fundamento/);
  assert.match(um(perfil({ publico: "infantojuvenil", padroes: [] })).problemas[0], /contraditório/);
});

test("menores prováveis: 'unknown' conta como sim e bloqueia padrão proibido", () => {
  for (const children_likely of [true, "unknown"]) {
    const r = um(perfil({ children_likely, padroes: [{ id: "MON-0010" }] }));
    assert.equal(r.problemas.length, 1, String(children_likely));
    assert.match(r.problemas[0], /menores prováveis/);
  }
  assert.deepEqual(um(perfil({ padroes: [{ id: "MON-0010" }] })).problemas, []);
});

test("somente adulto (MON-0018) exige publico adulto e children_likely false", () => {
  const padroes = [B("MON-0018")];
  assert.equal(um(aprovado({ publico: "geral", padroes })).problemas.length, 1);
  assert.equal(um(aprovado({ publico: "adulto", children_likely: "unknown", padroes })).problemas.length, 1);
  assert.deepEqual(um(aprovado({ publico: "adulto", padroes })).problemas, []);
});

test("classe B exige justificativa, limites e aprovação do perfil", () => {
  const sem = um(perfil({ padroes: [{ id: "MON-0011" }] }));
  assert.equal(sem.problemas.length, 5); // justificativa, limites, por, data, hash
  assert.deepEqual(um(aprovado({ padroes: [B("MON-0011")] })).problemas, []);
});

test("aprovação presa ao hash: mudar parâmetro depois de aprovar bloqueia", () => {
  const original = JSON.parse(aprovado({ padroes: [{ ...B("MON-0011"), parametros: { energia_max: 5 } }] }));
  original.padroes[0].parametros.energia_max = 50;
  const r = um(JSON.stringify(original));
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /perfil_sha256" não corresponde/);
});

test("hash ignora ordem das chaves e o próprio campo de aprovação", () => {
  const a = { padroes: [], publico: "geral", catalogo_versao: 3 };
  const b = { catalogo_versao: 3, publico: "geral", padroes: [], aprovacao: { por: "x" } };
  assert.equal(hashPerfil(a), hashPerfil(b));
});

test("data de aprovação precisa existir no calendário e não ser futura", () => {
  for (const data of ["2026-99-99", "2026-02-30", "20/10/2026", "2026-10-21"]) {
    const p = { ...base, padroes: [B("MON-0011")] };
    const r = um(JSON.stringify({ ...p, aprovacao: { por: "responsável", data, perfil_sha256: hashPerfil(p) } }));
    assert.equal(r.problemas.length, 1, data);
    assert.match(r.problemas[0], /data real/);
  }
});

test("aprovação por padrão (formato v2) é recusada", () => {
  const r = um(aprovado({ padroes: [{ ...B("MON-0011"), aprovacao: { por: "x", data: HOJE } }] }));
  assert.match(r.problemas.join("\n"), /aprovação fica na raiz/);
});

test("ID fora do catálogo é bloqueado, no perfil e no código", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-9999" }] }),
    "reimplementacoes/jogo/src/X.cs": "// MON-Z-01",
  });
  assert.equal(r.problemas.length, 2);
});

test("marcador sem declaração no perfil é bloqueado; alias e ID novo contam como o mesmo", () => {
  const r = rodar({
    "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [{ id: "MON-0001" }] }),
    "reimplementacoes/jogo/src/X.cs": "// MON-0002\n// MON-A-01",
  });
  assert.equal(r.problemas.length, 1);
  assert.match(r.problemas[0], /MON-0002 sem declaração/);
});

test("ID declarado duas vezes (direto e por alias) é bloqueado", () => {
  assert.equal(um(perfil({ padroes: [{ id: "MON-0001" }, { id: "MON-A-01" }] })).problemas.length, 1);
});

test("perfil inválido é bloqueado", () => {
  assert.equal(um("{ quebrado").problemas.length, 1);
  assert.match(um(JSON.stringify({ ...base, publico: "todos", padroes: [] })).problemas[0], /publico/);
});

test("Markdown, bin/ e obj/ não contam como marcador", () => {
  const r = rodar({
    "reimplementacoes/jogo/README.md": "Não usamos MON-0021.",
    "reimplementacoes/jogo/obj/gerado.cs": "// MON-0021",
    "reimplementacoes/jogo/bin/x.txt": "MON-C-02",
  });
  assert.deepEqual(r.problemas, []);
});

test("versão do catálogo diferente gera aviso, não bloqueio", () => {
  const r = um(perfil({ catalogo_versao: 2, padroes: [] }));
  assert.deepEqual(r.problemas, []);
  assert.equal(r.avisos.length, 1);
});

test("catálogo com defeito só bloqueia quando há padrões em uso", () => {
  const ruim = lerCatalogo("---\nversao: 3\n---\n### MON-0001 — x\n- **Classe:** A\n### MON-0002 — y\n- **Classe:** Z\n- **Aliases:** MON-A-01\n### MON-0003 — z\n- **Classe:** C\n- **Aliases:** MON-A-01\n");
  assert.equal(ruim.erros.length, 3); // sem Infantojuvenil, classe inválida, alias repetido
  assert.deepEqual(rodar({ "reimplementacoes/notepad/App.cs": "x" }, ruim).problemas, []);
  assert.ok(rodar({ "reimplementacoes/jogo/monetizacao.json": perfil({ padroes: [] }) }, ruim).problemas.length >= 3);
});
