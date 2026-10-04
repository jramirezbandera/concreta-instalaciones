import { describe, expect, it } from "vitest";
import { cajaDe, escribirDxf, type Dibujo } from "../escribir";
import { dibujoDeSvg, leerTransform, segmentosPath, type OpcionesSvgDxf } from "../svg";
import { aLatin1, dxfStr } from "../texto";
import { esquemasDxf, juntarEsquemas } from "../esquemas";
import { crearProyectoDemo } from "../../proyecto/demo";

// =============================================================================
// Los esquemas DXF (feature-16 §F): el escritor R12, el conversor SVG → DXF y
// los esquemas de saneamiento y fontanería del Demo.
// =============================================================================

/** Los pares código/valor de un DXF. */
function pares(dxf: string): [number, string][] {
  const l = dxf.split("\r\n");
  const out: [number, string][] = [];
  for (let i = 0; i + 1 < l.length; i += 2) out.push([Number(l[i]), l[i + 1]]);
  return out;
}

const OP: OpcionesSvgDxf = {
  escala: 1,
  capas: { edificio: "EDIF" },
  capaPorDefecto: "RED",
  capaTextos: "TXT",
  colores: { EDIF: 8, RED: 1, TXT: 7 },
};

function svg(cuerpo: string): Element {
  return new DOMParser().parseFromString(`<svg viewBox="0 0 100 100">${cuerpo}</svg>`, "text/html").querySelector("svg")!;
}

describe("escribirDxf", () => {
  const d: Dibujo = {
    entidades: [
      { tipo: "linea", capa: "RED", x1: 0, y1: 0, x2: 1, y2: 0 },
      { tipo: "linea", capa: "RED", x1: 0, y1: 0, x2: 0, y2: -1, discontinua: true },
      { tipo: "circulo", capa: "RED", x: 0.5, y: 0.5, r: 0.1 },
      { tipo: "texto", capa: "TXT", x: 0, y: 0.2, altura: 0.2, texto: "Ø110 · 2 %", alineacion: "centro" },
    ],
    capas: { RED: 1, TXT: 7 },
    ...cajaDe([]),
  };
  const dxf = escribirDxf({ ...d, ...cajaDe(d.entidades) });
  const p = pares(dxf);

  it("pares código/valor bien formados, R12, cp1252 y EOF", () => {
    expect(dxf.split("\r\n").length % 2).toBe(1); // termina en salto de línea
    expect(p.every(([c]) => Number.isInteger(c))).toBe(true);
    expect(p).toContainEqual([1, "AC1009"]);
    expect(p).toContainEqual([3, "ANSI_1252"]);
    expect(p[p.length - 1]).toEqual([0, "EOF"]);
  });

  it("capas con su color, discontinua y texto centrado", () => {
    const i = p.findIndex(([c, v]) => c === 2 && v === "RED");
    expect(p[i + 2]).toEqual([62, "1"]);
    expect(p).toContainEqual([6, "DASHED"]);
    expect(p).toContainEqual([0, "CIRCLE"]);
    const t = p.findIndex(([c, v]) => c === 0 && v === "TEXT");
    expect(p.slice(t, t + 14)).toContainEqual([72, "1"]);
  });

  it("los textos van en cp1252: «Ø» y «·» se conservan, un byte cada uno", () => {
    expect(dxfStr("Ø110 · ≤ 2 %")).toBe("Ø110 · <= 2 %");
    expect(dxfStr("cota −3,00 → arqueta")).toBe("cota -3,00 -> arqueta");
    const bytes = aLatin1("Ø");
    expect(Array.from(bytes)).toEqual([0xd8]);
  });
});

describe("leerTransform y segmentosPath", () => {
  it("translate y scale se componen en orden", () => {
    expect(leerTransform("translate(10 5) scale(2)")).toEqual([2, 0, 0, 2, 10, 5]);
  });

  it("M, H, V, l y z, absolutos y relativos", () => {
    expect(segmentosPath("M0 0H10V5")).toEqual([
      [0, 0, 10, 0],
      [10, 0, 10, 5],
    ]);
    expect(segmentosPath("M2 2l3 0l0 3z")).toEqual([
      [2, 2, 5, 2],
      [5, 2, 5, 5],
      [5, 5, 2, 2],
    ]);
    // Tras un M, los pares siguientes son líneas.
    expect(segmentosPath("M0 0 1 1")).toEqual([[0, 0, 1, 1]]);
  });
});

describe("dibujoDeSvg", () => {
  it("líneas, rectángulos y círculos; Y hacia arriba", () => {
    const d = dibujoDeSvg(svg('<line x1="0" y1="0" x2="10" y2="0" stroke="#000"/><rect x="0" y="0" width="2" height="1" stroke="#000" fill="none"/><circle cx="5" cy="5" r="1" stroke="#000"/>'), OP);
    expect(d.entidades.filter((e) => e.tipo === "linea")).toHaveLength(5);
    expect(d.entidades.find((e) => e.tipo === "circulo")).toMatchObject({ x: 5, y: -5, r: 1 });
  });

  it("lo que no se ve no pasa: trazos transparentes, fondos blancos y tramas", () => {
    const d = dibujoDeSvg(
      svg('<rect x="0" y="0" width="100" height="100" fill="#ffffff"/><path d="M0 0H5" stroke="transparent"/><rect x="0" y="0" width="5" height="5" fill="url(#t)"/><defs><pattern id="t"><line x1="0" y1="0" x2="1" y2="1" stroke="#000"/></pattern></defs>'),
      OP,
    );
    expect(d.entidades).toEqual([]);
  });

  it("una figura solo rellena pasa por su contorno (los forjados)", () => {
    const d = dibujoDeSvg(svg('<rect x="0" y="0" width="4" height="1" fill="#e2e8f0"/>'), OP);
    expect(d.entidades).toHaveLength(4);
  });

  it("capas por data-capa heredada; textos a su capa, con alineación y altura de mayúsculas", () => {
    const d = dibujoDeSvg(
      svg('<g data-capa="edificio"><line x1="0" y1="0" x2="1" y2="0" stroke="#000"/><text x="3" y="4" font-size="10" text-anchor="middle">PB</text></g><path d="M0 0V3" stroke="#000" stroke-dasharray="4 2"/>'),
      OP,
    );
    expect(d.entidades[0]).toMatchObject({ tipo: "linea", capa: "EDIF" });
    expect(d.entidades[1]).toMatchObject({ tipo: "texto", capa: "TXT", texto: "PB", alineacion: "centro", x: 3, y: -4, altura: 7 });
    expect(d.entidades[2]).toMatchObject({ tipo: "linea", capa: "RED", discontinua: true });
    expect(d.capas).toEqual({ EDIF: 8, RED: 1, TXT: 7 });
  });

  it("aplica los transform de los grupos", () => {
    const d = dibujoDeSvg(svg('<g transform="translate(10 0)"><line x1="0" y1="0" x2="1" y2="0" stroke="#000"/></g>'), OP);
    expect(d.entidades[0]).toMatchObject({ x1: 10, x2: 11 });
  });
});

describe("esquemas del Demo", () => {
  const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");

  it("saneamiento y fontanería en un DXF, con sus capas y sus diámetros", async () => {
    const { blob, filename } = esquemasDxf(p, ["hs5", "hs4"]);
    expect(filename).toBe("esquemas-instalaciones-demo-vivienda-c-mayor-12.dxf");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const dxf = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    expect(dxf).toContain("Esquema de saneamiento · DB-HS 5");
    expect(dxf).toContain("Esquema de fontanería · DB-HS 4");
    expect(dxf).toMatch(/Ø110/);
    for (const capa of ["INS-EDIFICIO", "INS-SANEAMIENTO", "INS-FONTANERIA", "INS-TEXTOS"]) expect(dxf).toContain(capa);
  });

  it("los dos esquemas, uno al lado del otro y sin solaparse", () => {
    const un = juntarEsquemas([{ titulo: "A", capaRed: "R", svg: '<svg><line x1="0" y1="0" x2="22" y2="0" stroke="#000"/></svg>' }]);
    const dos = juntarEsquemas([
      { titulo: "A", capaRed: "R", svg: '<svg><line x1="0" y1="0" x2="22" y2="0" stroke="#000"/></svg>' },
      { titulo: "B", capaRed: "R", svg: '<svg><line x1="0" y1="0" x2="22" y2="0" stroke="#000"/></svg>' },
    ]);
    expect(un.max.x - un.min.x).toBeCloseTo(1, 6);
    const lineas = dos.entidades.filter((e) => e.tipo === "linea");
    expect(lineas.map((e) => (e.tipo === "linea" ? e.x1 : 0))).toEqual([0, 5]);
  });
});
