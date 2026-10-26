// Desenho no navegador (ESPECIFICACAO.md, seção 10.1): cada elemento da tela vira um elemento da
// página, inclusive as casas da grade e as peças (botões focáveis, com seletor estável e rótulo
// legível). Não decide nada: posição, tamanho, cor, tempo e rótulo vêm da tela montada pelo
// controle; todo toque (mouse, dedo ou teclado) vai para controle.tocar().
import { TELA } from "../src/interface/tela.mjs";
import { criarControle } from "./controle.mjs";

const raiz = document.getElementById("tela");

const parametro = Number.parseInt(new URLSearchParams(location.search).get("semente") ?? "", 10);
const sementeSessao = Number.isInteger(parametro) ? parametro : Date.now() % 2147483647;
const controle = criarControle({ sementeSessao, relogio: () => Date.now() });

const TOCAVEIS = new Set(["acao_principal", "acao", "recusa", "fechar"]);
let escala = 1;
let tela = null;
let proximo = null;

const px = (v) => `${v * escala}px`;
const ehCasa = (e) => Number.isInteger(e.linha) && Number.isInteger(e.coluna);

// Forma da peça dentro do botão, centrada, numa grade de 5 × 5 células do tamanho do botão.
function desenharForma(no, e) {
  if (!e.forma?.length) return;
  const linhas = Math.max(...e.forma.map(([l]) => l)) + 1;
  const colunas = Math.max(...e.forma.map(([, c]) => c)) + 1;
  const celula = Math.min(e.largura, e.altura) / 5;
  const x0 = (e.largura - colunas * celula) / 2;
  const y0 = (e.altura - linhas * celula) / 2;
  for (const [l, c] of e.forma) {
    const quadrado = document.createElement("span");
    quadrado.setAttribute("aria-hidden", "true");
    Object.assign(quadrado.style, {
      position: "absolute",
      left: px(x0 + c * celula + 1),
      top: px(y0 + l * celula + 1),
      width: px(celula - 2),
      height: px(celula - 2),
      backgroundColor: e.corTexto,
      pointerEvents: "none",
    });
    no.append(quadrado);
  }
}

function criarNo(e, t_ms, toqueDesde_ms) {
  const tocavel = TOCAVEIS.has(e.papel) && e.acao !== null;
  const no = document.createElement(tocavel ? "button" : "p");
  if (tocavel) {
    no.type = "button";
    if (e.aceitaToqueDesde_ms === null || t_ms < Math.max(e.aceitaToqueDesde_ms, toqueDesde_ms)) no.setAttribute("aria-disabled", "true");
  }
  no.dataset.id = e.id;
  if (ehCasa(e)) no.dataset.celula = `${e.linha + 1}-${e.coluna + 1}`;
  if (e.id.startsWith("peca-")) no.dataset.peca = String(Number(e.id.slice("peca-".length)) + 1);
  if (e.descricao) no.setAttribute("aria-label", e.descricao);
  if (tocavel && typeof e.escolhida === "boolean") no.setAttribute("aria-pressed", String(e.escolhida));
  no.className = `elemento ${e.papel}`;
  if (e.forma) desenharForma(no, e);
  else if (!ehCasa(e)) no.textContent = e.texto;
  Object.assign(no.style, {
    left: px(e.x),
    top: px(e.y),
    width: px(e.largura),
    height: px(e.altura),
    color: e.corTexto,
    backgroundColor: e.corFundo,
    fontWeight: String(e.pesoFonte),
    fontSize: px(e.tamanhoFonte),
  });
  // Linhas da grade: a cor do fundo da tela entre as casas.
  if (ehCasa(e)) no.style.boxShadow = `inset 0 0 0 1px ${tela.corFundo}`;
  no.hidden = t_ms < e.visivelDesde_ms;
  return no;
}

// Próximo instante em que algo muda sozinho na tela: elemento que aparece, que passa a aceitar
// toque, fim da janela de toque ou fim do rewarded.
function agendar(t, t_ms, toqueDesde_ms) {
  clearTimeout(proximo);
  const futuros = [...tela.elementos.flatMap((e) => [e.visivelDesde_ms, e.aceitaToqueDesde_ms]), toqueDesde_ms].filter((v) => v !== null && v > t_ms).map((v) => v - t_ms);
  const restante = controle.restanteRewarded(t);
  if (restante !== null) futuros.push(restante);
  if (tela.cena === "sem_vidas") futuros.push(15000); // tempo até a próxima vida, em minutos
  if (futuros.length) proximo = setTimeout(() => desenhar(), Math.min(...futuros) + 1);
}

function desenhar() {
  const t = performance.now();
  controle.avancar(t);
  const atual = controle.atualizar(t);
  tela = atual.tela;
  escala = Math.min(window.innerWidth / TELA.largura, window.innerHeight / TELA.altura);
  document.body.style.backgroundColor = tela.corFundo;
  raiz.style.width = px(TELA.largura);
  raiz.style.height = px(TELA.altura);
  raiz.style.backgroundColor = tela.corFundo;
  const foco = document.activeElement?.dataset?.id;
  raiz.querySelectorAll(".elemento").forEach((no) => no.remove());
  for (const e of tela.elementos) raiz.append(criarNo(e, atual.t_ms, atual.toqueDesde_ms));
  if (foco) raiz.querySelector(`[data-id="${foco}"]`)?.focus();
  agendar(t, atual.t_ms, atual.toqueDesde_ms);
}

// Clique de mouse ou dedo: ponto da tela de referência. Ativação por teclado (sem ponto): centro
// do botão, no modelo.
function pontoDoClique(ev) {
  const botao = ev.target.closest?.("button[data-id]");
  if (ev.detail === 0 && botao) {
    const e = tela.elementos.find((el) => el.id === botao.dataset.id);
    return { x: e.x + e.largura / 2, y: e.y + e.altura / 2 };
  }
  const caixa = raiz.getBoundingClientRect();
  return { x: (ev.clientX - caixa.left) / escala, y: (ev.clientY - caixa.top) / escala };
}

raiz.addEventListener("click", (ev) => {
  const ponto = pontoDoClique(ev);
  if (controle.tocar(ponto, performance.now())) desenhar();
});
window.addEventListener("resize", () => desenhar());
desenhar();
