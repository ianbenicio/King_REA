// Teste de invariância anúncio × sequência de peças (F3) e teste do teste por mutação.
// Mais sementes: INVARIANCIA_SEMENTES=500 node --test reimplementacoes/puzzle-piloto/tests/invariancia.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import * as NUCLEO from "../src/nucleo/jogo.mjs";
import { PERFIS_COM_RECOMPENSA, PERFIS_SEM_RECOMPENSA, verificarInvariancia } from "./invariancia.mjs";

const N = Number(process.env.INVARIANCIA_SEMENTES ?? 20);
const sementes = (n) => Array.from({ length: n }, (_, i) => 1000 + i);

test(`produto limpo: invariante em ${N} sementes × ${PERFIS_SEM_RECOMPENSA.length + PERFIS_COM_RECOMPENSA.length} perfis`, () => {
  const r = verificarInvariancia({ sementes: sementes(N) });
  assert.deepEqual(r.violacoes, []);
  assert.equal(r.sessoes, N * (PERFIS_SEM_RECOMPENSA.length + PERFIS_COM_RECOMPENSA.length));
  assert.ok(r.entradasGravadas > N * 10, "sorteios suficientes para a verificação por estado");
});

// Cada mutação planta um acoplamento entre monetização e peças, só em memória: o núcleo real
// é embrulhado e o sorteio passa a depender de algo da monetização.
// Troca a rodada sorteada por quadrados 3×3 e recalcula o fim, como o núcleo faria.
const trocarPorGrandes = (r) => {
  const pecas = ["P18", "P18", "P18"];
  const estado = { ...r.estado, rodada: pecas, fim: false };
  const fim = NUCLEO.jogadasPossiveis(estado).length === 0;
  return { estado: { ...estado, fim }, efeito: { ...r.efeito, fim, sorteio: { ...r.efeito.sorteio, pecas } } };
};
const noSorteio = (condicao) => (getSessao) => ({
  ...NUCLEO,
  jogar(estado, jogada) {
    const r = NUCLEO.jogar(estado, jogada);
    return r.efeito.sorteio && condicao(getSessao()) ? trocarPorGrandes(r) : r;
  },
});

const MUTACOES = {
  "gerador lê quantos intersticiais já apareceram": noSorteio((s) => s.agendador.exibidosNaSessao > 0),
  "gerador lê se há intersticial pendente": noSorteio((s) => s.agendador.partidasDesdeUltimo >= 2),
  "gerador lê a hora do último anúncio": noSorteio((s) => s.agendador.ultimoEm !== null),
  "gerador lê a compra de remover anúncios": noSorteio((s) => s.compras.length > 0),
  "gerador lê as vidas restantes": noSorteio((s) => s.vidas.vidas <= 2),
  "gerador lê a origem da configuração remota": noSorteio((s) => Object.values(s.config.origem).includes("valor remoto")),
  "dificuldade recebe anúncios exibidos como derrotas": (getSessao) => ({
    ...NUCLEO,
    novaPartida: (opcoes) => NUCLEO.novaPartida({ ...opcoes, derrotasSeguidas: opcoes.derrotasSeguidas + 2 * getSessao().agendador.exibidosNaSessao }),
  }),
};

for (const [nome, fabricaNucleo] of Object.entries(MUTACOES))
  test(`mutação detectada: ${nome}`, () => {
    const r = verificarInvariancia({ sementes: sementes(10), fabricaNucleo, pararNaPrimeira: true });
    assert.ok(r.violacoes.length > 0, "o teste de invariância não percebeu o acoplamento");
  });
