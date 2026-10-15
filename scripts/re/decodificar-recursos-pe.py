"""Decodifica recursos de interface de um arquivo PE (exe, dll, mui) sem executá-lo.

Formatos documentados pela Microsoft: menus (MENU e MENUEX), diálogos (DLGTEMPLATE e
DLGTEMPLATEEX), tabelas de strings (RT_STRING) e atalhos (RT_ACCELERATOR).
Só biblioteca padrão. Leitura pura: não carrega o arquivo como módulo, não executa nada.

Uso: python -I decodificar-recursos-pe.py <arquivo-pe> <saida.json>
A saída contém os textos do próprio programa: grave em saidas/<slug>/ (fora do git).
"""
import json
import struct
import sys

RT = {4: "menu", 5: "dialogo", 6: "strings", 9: "atalhos", 16: "versao", 24: "manifesto"}
CLASSES = {0x80: "Button", 0x81: "Edit", 0x82: "Static", 0x83: "ListBox", 0x84: "ScrollBar", 0x85: "ComboBox"}
VK = {0x08: "Backspace", 0x09: "Tab", 0x0D: "Enter", 0x1B: "Esc", 0x20: "Espaço", 0x21: "PageUp", 0x22: "PageDown",
      0x23: "End", 0x24: "Home", 0x25: "Esquerda", 0x26: "Cima", 0x27: "Direita", 0x28: "Baixo", 0x2D: "Insert",
      0x2E: "Delete", 0x6B: "Num+", 0x6D: "Num-", 0xBB: "=", 0xBD: "-", 0xDB: "[", 0xDD: "]"}
VK.update({0x70 + i: f"F{i + 1}" for i in range(24)})


class PE:
    def __init__(self, data):
        self.d = data
        if data[:2] != b"MZ":
            raise ValueError("não é PE (sem MZ)")
        pe = struct.unpack_from("<I", data, 0x3C)[0]
        if data[pe:pe + 4] != b"PE\0\0":
            raise ValueError("assinatura PE ausente")
        nsec, = struct.unpack_from("<H", data, pe + 6)
        opt_size, = struct.unpack_from("<H", data, pe + 20)
        opt = pe + 24
        magic, = struct.unpack_from("<H", data, opt)
        dd = opt + (96 if magic == 0x10B else 112)
        self.res_rva, self.res_size = struct.unpack_from("<II", data, dd + 2 * 8)
        sec = opt + opt_size
        self.secoes = []
        for i in range(nsec):
            vsize, va, rsize, raw = struct.unpack_from("<IIII", data, sec + i * 40 + 8)
            self.secoes.append((va, max(vsize, rsize), raw))

    def off(self, rva):
        for va, size, raw in self.secoes:
            if va <= rva < va + size:
                return raw + (rva - va)
        raise ValueError(f"RVA fora das seções: {rva:#x}")

    def nome(self, base, campo):
        if campo & 0x80000000:
            p = base + (campo & 0x7FFFFFFF)
            n, = struct.unpack_from("<H", self.d, p)
            return self.d[p + 2:p + 2 + 2 * n].decode("utf-16-le")
        return campo

    def recursos(self):
        base = self.off(self.res_rva)
        saida = []

        def dir_(p, nivel, caminho):
            nn, ni = struct.unpack_from("<HH", self.d, p + 12)
            for i in range(nn + ni):
                campo, alvo = struct.unpack_from("<II", self.d, p + 16 + 8 * i)
                chave = self.nome(base, campo)
                if alvo & 0x80000000:
                    dir_(base + (alvo & 0x7FFFFFFF), nivel + 1, caminho + [chave])
                else:
                    rva, size = struct.unpack_from("<II", self.d, base + alvo)
                    o = self.off(rva)
                    saida.append((caminho + [chave], self.d[o:o + size]))

        dir_(base, 0, [])
        return saida


def sz(b, p):
    fim = p
    while b[fim:fim + 2] != b"\0\0":
        fim += 2
    return b[p:fim].decode("utf-16-le"), fim + 2


def sz_or_ord(b, p):
    w, = struct.unpack_from("<H", b, p)
    if w == 0:
        return None, p + 2
    if w == 0xFFFF:
        return struct.unpack_from("<H", b, p + 2)[0], p + 4
    return sz(b, p)


def al4(p):
    return (p + 3) & ~3


def menu(b):
    ver, = struct.unpack_from("<H", b, 0)
    if ver == 0:
        def itens(p):
            lista = []
            while True:
                flags, = struct.unpack_from("<H", b, p)
                p += 2
                popup = flags & 0x10
                id_ = None
                if not popup:
                    id_, = struct.unpack_from("<H", b, p)
                    p += 2
                texto, p = sz(b, p)
                item = {"texto": texto, "id": id_, "separador": (not popup and id_ == 0 and texto == "")}
                if popup:
                    item["itens"], p = itens(p)
                lista.append(item)
                if flags & 0x80:
                    return lista, p
        return {"formato": "MENU", "itens": itens(4)[0]}
    off, = struct.unpack_from("<H", b, 2)

    def itens_ex(p):
        lista = []
        while True:
            p = al4(p)
            tipo, estado, id_, res = struct.unpack_from("<IIIH", b, p)
            p += 14
            texto, p = sz(b, p)
            item = {"texto": texto, "id": id_ or None, "separador": bool(tipo & 0x800), "estado": estado}
            if res & 0x01:
                p = al4(p) + 4  # helpID do popup
                item["itens"], p = itens_ex(p)
            lista.append(item)
            if res & 0x80:
                return lista, p
    return {"formato": "MENUEX", "itens": itens_ex(4 + off)[0]}


def dialogo(b):
    ex = struct.unpack_from("<HH", b, 0) == (1, 0xFFFF)
    if ex:
        _, _, _, exstyle, style, n, x, y, cx, cy = struct.unpack_from("<HHIIIHhhhh", b, 0)
        p = 26
    else:
        style, exstyle, n, x, y, cx, cy = struct.unpack_from("<IIHhhhh", b, 0)
        p = 18
    _, p = sz_or_ord(b, p)
    _, p = sz_or_ord(b, p)
    titulo, p = sz(b, p)
    fonte = None
    if style & 0x40:  # DS_SETFONT
        if ex:
            pt, peso, ital, cs = struct.unpack_from("<HHBB", b, p)
            p += 6
        else:
            pt, = struct.unpack_from("<H", b, p)
            p += 2
        nomefonte, p = sz(b, p)
        fonte = f"{nomefonte} {pt}pt"
    controles = []
    for _ in range(n):
        p = al4(p)
        if ex:
            _, cexs, cst, x, y, cx, cy, cid = struct.unpack_from("<IIIhhhhI", b, p)
            p += 24
        else:
            cst, cexs, x, y, cx, cy, cid = struct.unpack_from("<IIhhhhH", b, p)
            p += 18
        cls, p = sz_or_ord(b, p)
        txt, p = sz_or_ord(b, p)
        extra, = struct.unpack_from("<H", b, p)
        p += 2 + extra
        if isinstance(cls, int):
            cls = CLASSES.get(cls, cls)
        tipo = cls
        if cls == "Button":
            bs = cst & 0xF
            tipo = {0: "Botão", 1: "Botão padrão", 2: "Caixa de seleção", 3: "Caixa de seleção", 4: "Opção",
                    5: "Caixa de seleção", 6: "Caixa de seleção", 7: "Grupo", 9: "Opção"}.get(bs, "Botão")
        controles.append({"tipo": tipo, "texto": txt if isinstance(txt, str) else None, "id": cid,
                          "pos": [x, y, cx, cy]})
    return {"formato": "DLGTEMPLATEEX" if ex else "DLGTEMPLATE", "titulo": titulo, "fonte": fonte,
            "tamanho": [cx, cy], "controles": controles}


def strings(bloco, b):
    out, p = {}, 0
    for i in range(16):
        n, = struct.unpack_from("<H", b, p)
        p += 2
        if n:
            out[(bloco - 1) * 16 + i] = b[p:p + 2 * n].decode("utf-16-le")
        p += 2 * n
    return out


def atalhos(b):
    out = []
    for p in range(0, len(b), 8):
        flags, tecla, cmd, _ = struct.unpack_from("<HHHH", b, p)
        mods = [m for bit, m in ((8, "Ctrl"), (0x10, "Alt"), (4, "Shift")) if flags & bit]
        nome = VK.get(tecla, chr(tecla) if 0x20 < tecla < 0x7F else f"VK_{tecla:#04x}") if flags & 1 else repr(chr(tecla))
        out.append({"tecla": "+".join(mods + [nome]), "comando": cmd})
        if flags & 0x80:
            break
    return out


def main(entrada, saida):
    pe = PE(open(entrada, "rb").read())
    res = {"arquivo": entrada, "menus": {}, "dialogos": {}, "strings": {}, "atalhos": {}}
    for (tipo, nome, _lang), dados in pe.recursos():
        chave = str(nome)
        if tipo == 4:
            res["menus"][chave] = menu(dados)
        elif tipo == 5:
            res["dialogos"][chave] = dialogo(dados)
        elif tipo == 6:
            res["strings"].update({str(k): v for k, v in strings(nome, dados).items()})
        elif tipo == 9:
            res["atalhos"][chave] = atalhos(dados)
    with open(saida, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print(f"menus: {len(res['menus'])} | diálogos: {len(res['dialogos'])} | strings: {len(res['strings'])} | "
          f"tabelas de atalhos: {len(res['atalhos'])} -> {saida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
