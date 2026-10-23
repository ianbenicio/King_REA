// Desenho no navegador (ESPECIFICACAO.md, seção 10.1): grade e peças em canvas; botões, rótulos e
// textos como elementos da página. Não decide nada: posição, tamanho, cor e tempo vêm da tela
// montada pelo controle; todo toque (mouse, dedo ou teclado) vai para controle.tocar().
import { peca } from "../src/nucleo/pecas.mjs";
import { TELA } from "../src/interface/tela.mjs";
import { criarControle } from "./controle.mjs";

const raiz = document.getElementById("tela");
const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

const parametro = Number.parseInt(new URLSearchParams(location.search).get("semente") ?? "", 10);
const sementeSessao = Number.isInteger(parametro) ? parametro : Date.now() % 2147483647;
const controle = criarControle({ sementeSessao, relogio: () => Date.now() });

const TOCAVEIS = new Set(["acao_principal", "acao", "recusa", "fechar"]);
const NO_CANVAS = (e) => e.id === "grade" || e.id.startsWith("peca-");
let escala = 1;
let tela = null;
let proximo = null;

const px = (v) => `${v * escala}px`;

function desenharGrade(e, grade) {
  const lado = Math.sqrt(grade.length);
  const celula = e.largura / lado;
  ctx.fillStyle = e.corFundo;
  ctx.fillRect(e.x, e.y, e.largura, e.altura);
  grade.forEach((ocupada, i) => {
    if (!ocupada) return;
    ctx.fillStyle = e.corTexto;
    ctx.fillRect(e.x + (i % lado) * celula + 1, e.y + Math.floor(i / lado) * celula + 1, celula - 2, celula - 2);
  });
  ctx.strokeStyle = tela.corFundo;
  for (let k = 0; k <= lado; k += 1) {
    ctx.beginPath();
    ctx.moveTo(e.x + k * celula, e.y);
    ctx.lineTo(e.x + k * celula, e.y + e.altura);
    ctx.moveTo(e.x, e.y + k * celula);
    ctx.lineTo(e.x + e.largura, e.y + k * celula);
    ctx.stroke();
  }
}

// Peça escolhida: fundo com a cor da grade (cor que já está na tela).
function desenharPeca(e, escolhida, corEscolha) {
  ctx.fillStyle = escolhida ? corEscolha : e.corFundo;
  ctx.fillRect(e.x, e.y, e.largura, e.altura);
  if (!e.texto) return;
  const celulas = peca(e.texto).celulas;
  const linhas = Math.max(...celulas.map(([l]) => l)) + 1;
  const colunas = Math.max(...celulas.map(([, c]) => c)) + 1;
  const celula = Math.min(e.largura, e.altura) / 5;
  const x0 = e.x + (e.largura - colunas * celula) / 2;
  const y0 = e.y + (e.altura - linhas * celula) / 2;
  ctx.fillStyle = e.corTexto;
  for (const [l, c] of celulas) ctx.fillRect(x0 + c * celula + 1, y0 + l * celula + 1, celula - 2, celula - 2);
}

function descricaoDoCanvas(elementos) {
  const pecas = elementos.filter((e) => e.id.startsWith("peca-"));
  if (pecas.length === 0) return "";
  const nomes = pecas.map((e, i) => `${i + 1}: ${e.texto ? peca(e.texto).nome : "usada"}`);
  return `Grade de ${Math.sqrt(controle.sessao.partida.estado.grade.length)} por ${Math.sqrt(controle.sessao.partida.estado.grade.length)}. Peças da rodada: ${nomes.join("; ")}.`;
}

function desenharCanvas(elementos) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(TELA.largura * escala * dpr);
  canvas.height = Math.round(TELA.altura * escala * dpr);
  canvas.style.width = px(TELA.largura);
  canvas.style.height = px(TELA.altura);
  ctx.setTransform(escala * dpr, 0, 0, escala * dpr, 0, 0);
  ctx.clearRect(0, 0, TELA.largura, TELA.altura);
  const grade = elementos.find((e) => e.id === "grade");
  if (grade) desenharGrade(grade, controle.sessao.partida.estado.grade);
  for (const e of elementos.filter((el) => el.id.startsWith("peca-")))
    desenharPeca(e, `peca-${controle.selecionada}` === e.id, grade?.corFundo ?? e.corFundo);
  const descricao = descricaoDoCanvas(elementos);
  canvas.setAttribute("aria-label", descricao);
  canvas.hidden = descricao === "";
}

function criarNo(e, t_ms) {
  const tocavel = TOCAVEIS.has(e.papel) && e.acao !== null;
  const no = document.createElement(tocavel ? "button" : "p");
  if (tocavel) {
    no.type = "button";
    if (e.aceitaToqueDesde_ms === null || t_ms < e.aceitaToqueDesde_ms) no.setAttribute("aria-disabled", "true");
  }
  no.dataset.id = e.id;
  no.className = `elemento ${e.papel}`;
  no.textContent = e.texto;
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
  no.hidden = t_ms < e.visivelDesde_ms;
  return no;
}

// Próximo instante em que algo muda sozinho na tela: elemento que aparece, que passa a aceitar
// toque ou o fim do rewarded.
function agendar(t, t_ms) {
  clearTimeout(proximo);
  const futuros = tela.elementos.flatMap((e) => [e.visivelDesde_ms, e.aceitaToqueDesde_ms]).filter((v) => v !== null && v > t_ms).map((v) => v - t_ms);
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
  const elementos = tela.elementos;
  desenharCanvas(elementos);
  for (const e of elementos) if (!NO_CANVAS(e)) raiz.append(criarNo(e, atual.t_ms));
  if (foco) raiz.querySelector(`[data-id="${foco}"]`)?.focus();
  agendar(t, atual.t_ms);
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
