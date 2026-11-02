// Testes do verificador local agregado (npm test). Só as regras puras: nada de dotnet, Docker ou rede.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMPONENTES,
  ESTADOS,
  SAIDA,
  ITENS_SONDA,
  agregar,
  avaliarSonda,
  comDependencias,
  compararLockNpm,
  executarPlano,
  motivoSemSessaoInterativa,
  resumoDotnet,
  versaoNodeCompativel,
} from "./verificar.mjs";

test("resumo do dotnet test em português e inglês", () => {
  const pt = "Aprovado!  – Com falha:     0, Aprovado:   137, Ignorado:     0, Total:   137, Duração: 102 ms";
  const en = "Failed!  - Failed:     2, Passed:    74, Skipped:     0, Total:    76, Duration: 9 s";
  assert.equal(resumoDotnet(pt), "137/137 aprovados, 0 falhas, 0 ignorados");
  assert.equal(resumoDotnet(en), "74/76 aprovados, 2 falhas, 0 ignorados");
  assert.equal(resumoDotnet("Build succeeded."), undefined);
});

const relogio = () => 0;
const ok = (detalhe) => () => ({ ok: true, detalhe });

test("agregado: aprovado só quando todos passam", () => {
  const r = (estado) => ({ id: estado, estado });
  assert.deepEqual(agregar([r(ESTADOS.aprovado), r(ESTADOS.aprovado)]), { estado: "aprovado", codigo: SAIDA.aprovado });
  assert.equal(agregar([r(ESTADOS.aprovado), r(ESTADOS.falhou)]).codigo, SAIDA.falhou);
  assert.equal(agregar([r(ESTADOS.aprovado), r(ESTADOS.naoExecutado)]).codigo, SAIDA.incompleto);
  assert.equal(agregar([r(ESTADOS.naoExecutado), r(ESTADOS.falhou)]).codigo, SAIDA.falhou, "falha vence não executado");
  assert.equal(agregar([]).codigo, SAIDA.incompleto, "conjunto vazio não é sucesso");
});

test("requisito ausente vira não executado, com motivo, e não roda o componente", () => {
  let rodou = false;
  const [r] = executarPlano([{ id: "semgrep", requisito: () => "daemon do Docker inacessível", executar: () => ((rodou = true), { ok: true }) }], {}, relogio);
  assert.equal(r.estado, ESTADOS.naoExecutado);
  assert.match(r.motivo, /^requisito ausente: daemon do Docker/);
  assert.equal(rodou, false);
  assert.notEqual(agregar([r]).codigo, SAIDA.aprovado);
});

test("dependência que falhou ou não rodou bloqueia os dependentes", () => {
  const plano = [
    { id: "restore", executar: () => ({ ok: false, motivo: "lock divergente" }) },
    { id: "build", depende: ["restore"], executar: ok() },
    { id: "testes", depende: ["build"], executar: ok() },
    { id: "js", executar: ok("12/12") },
  ];
  const [restore, build, testes, js] = executarPlano(plano, {}, relogio);
  assert.equal(restore.estado, ESTADOS.falhou);
  assert.equal(build.estado, ESTADOS.naoExecutado);
  assert.match(build.motivo, /depende de "restore", que falhou/);
  assert.match(testes.motivo, /depende de "build", que não foi executado/);
  assert.equal(js.estado, ESTADOS.aprovado, "componente independente continua rodando");
  assert.equal(agregar([restore, build, testes, js]).codigo, SAIDA.falhou);
});

test("exceção do componente conta como falha, não como aprovação", () => {
  const [r] = executarPlano([{ id: "x", executar: () => { throw new Error("arquivo sumiu"); } }], {}, relogio);
  assert.equal(r.estado, ESTADOS.falhou);
  assert.match(r.motivo, /erro do verificador: arquivo sumiu/);
});

test("Node: só o major do .node-version vale", () => {
  assert.equal(versaoNodeCompativel("v26.12.1", "26.12.1\n"), null);
  assert.equal(versaoNodeCompativel("v26.0.0", "26.12.1"), null);
  assert.match(versaoNodeCompativel("v24.11.0", "26.12.1"), /Node 24\.11\.0 em uso; o contrato pede 26\.x/);
  assert.match(versaoNodeCompativel("v26.1.0", "lts"), /\.node-version inválido/);
});

const pacote = { dependencies: { "rea-agents": "6.4.0" } };
const lock = { lockfileVersion: 3, packages: { "": { dependencies: { "rea-agents": "6.4.0" } }, "node_modules/rea-agents": { version: "6.4.0" } } };

test("lock npm coerente passa", () => {
  assert.deepEqual(compararLockNpm({ pacote, lock, instalados: { "rea-agents": "6.4.0" } }), []);
});

test("mudança de dependência sem lock aprovado é recusada", () => {
  const novo = { dependencies: { "rea-agents": "6.5.0", "left-pad": "1.3.0" } };
  const problemas = compararLockNpm({ pacote: novo, lock, instalados: { "rea-agents": "6.4.0", "left-pad": "1.3.0" } });
  assert.ok(problemas.some((p) => /rea-agents: package\.json pede 6\.5\.0, o lock tem 6\.4\.0/.test(p)));
  assert.ok(problemas.some((p) => /left-pad: package\.json pede 1\.3\.0, o lock tem \(nada\)/.test(p)));
  assert.ok(problemas.some((p) => /left-pad: sem versão resolvida no lock/.test(p)));
});

test("instalado diferente do lock, ausente ou lock sem raiz são recusados", () => {
  assert.match(compararLockNpm({ pacote, lock, instalados: { "rea-agents": "6.3.0" } })[0], /instalado 6\.3\.0, o lock fixa 6\.4\.0/);
  assert.match(compararLockNpm({ pacote, lock, instalados: {} })[0], /não instalado/);
  assert.match(compararLockNpm({ pacote, lock: { lockfileVersion: 1 }, instalados: {} })[0], /sem a entrada da raiz/);
});

test("sessão para UI WPF: sandbox do Codex e outro sistema não servem; o runner do GitHub fica com a sonda", () => {
  const base = { plataforma: "win32", usuario: "ianfl" };
  assert.equal(motivoSemSessaoInterativa(base), null);
  assert.match(motivoSemSessaoInterativa({ ...base, usuario: "CodexSandboxOffline" }), /sandbox do Codex/);
  assert.match(motivoSemSessaoInterativa({ ...base, plataforma: "linux" }), /exigem Windows/);
  assert.equal(motivoSemSessaoInterativa({ ...base, usuario: "runneradmin" }), null, "reconhecer o runner não basta: a sonda decide");
});

const sonda = (trocas = {}) => {
  const itens = Object.fromEntries(ITENS_SONDA.map((k) => [k, trocas[k] ?? true]));
  return JSON.stringify({ ...itens, faltou: ITENS_SONDA.filter((k) => !itens[k]) });
};

test("sonda WPF: todos os pré-requisitos presentes liberam a suíte", () => {
  assert.equal(avaliarSonda(sonda()), null);
  assert.equal(avaliarSonda(`aviso do host\n${sonda()}\n`), null, "vale a linha JSON, não o resto da saída");
});

test("sonda WPF: pré-requisito ausente (sessão não interativa, foco ou clipboard) vira não executável, com o item", () => {
  for (const item of ["interativa", "sessao_de_usuario", "foco_de_teclado", "clipboard"]) {
    const motivo = avaliarSonda(sonda({ [item]: false }));
    assert.equal(motivo, `não executável neste runner: faltou ${item} (sonda WPF)`);
  }
  assert.match(avaliarSonda(sonda({ foco_de_teclado: false, clipboard: false })), /faltou foco_de_teclado, clipboard/);
});

test("sonda WPF: saída fora do formato (texto, campo a mais, valor não booleano, lista incoerente) não libera a suíte", () => {
  const casos = [
    "",
    "Unhandled exception",
    JSON.stringify({ interativa: true, sessao_de_usuario: true, foco_de_teclado: true, clipboard: true }),
    JSON.stringify({ ...JSON.parse(sonda()), usuario: "ianfl" }),
    JSON.stringify({ ...JSON.parse(sonda()), clipboard: "sim" }),
    JSON.stringify({ ...JSON.parse(sonda({ clipboard: false })), faltou: [] }),
    JSON.stringify({ ...JSON.parse(sonda()), faltou: ["clipboard"] }),
  ];
  for (const texto of casos) assert.equal(avaliarSonda(texto), "não executável neste runner: sonda WPF com saída inválida", texto);
});

test("sonda WPF reprovada deixa o notepad-ui não executado, nunca aprovado, e não roda a suíte", () => {
  let rodou = false;
  const plano = [
    { id: "notepad-build", executar: ok() },
    { id: "notepad-ui", depende: ["notepad-build"], requisito: () => avaliarSonda(sonda({ foco_de_teclado: false })), executar: () => ((rodou = true), { ok: true }) },
  ];
  const [, ui] = executarPlano(plano, {}, relogio);
  assert.equal(ui.estado, ESTADOS.naoExecutado);
  assert.equal(ui.motivo, "requisito ausente: não executável neste runner: faltou foco_de_teclado (sonda WPF)");
  assert.equal(rodou, false);
  assert.equal(agregar([ui]).codigo, SAIDA.incompleto);
});

test("sonda WPF aprovada roda a suíte, e falha de asserção conta como falha", () => {
  const plano = [{ id: "notepad-ui", requisito: () => avaliarSonda(sonda()), executar: () => ({ ok: false, motivo: "dotnet test saiu com código 1" }) }];
  const [ui] = executarPlano(plano, {}, relogio);
  assert.equal(ui.estado, ESTADOS.falhou);
  assert.equal(agregar([ui]).codigo, SAIDA.falhou);
});

test("componentes declarados: ids únicos, dependências existentes e seleção com dependências", () => {
  const ids = COMPONENTES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of COMPONENTES) for (const d of c.depende ?? []) assert.ok(ids.indexOf(d) >= 0 && ids.indexOf(d) < ids.indexOf(c.id), `${c.id} → ${d}`);
  assert.deepEqual([...comDependencias(["notepad-core"])].sort(), ["dotnet-restore", "notepad-build", "notepad-core"]);
  for (const id of ["semgrep-scan", "semgrep-test", "semgrep-mutacoes", "notepad-ui", "notepad-core", "js"]) assert.ok(ids.includes(id), id);
});
