import { describe, expect, it } from "vitest";
import { solucionDe } from "../../../lib/constructivo/catalogo";
import { evaluarFachada, nivelesHabituales } from "../fachada";

// =============================================================================
// HS1 · la fachada de El edificio frente a la tabla 2.7 (feature-26, paso 5):
// los casos del cotejo F.3 de research/verificacion-cerramientos-cec.md.
// =============================================================================

const F = (id: string) => solucionDe("fachada", id);
const max = (id: string, d = {}) => evaluarFachada(F(id), 1, d).gradoMax;

describe("HS1 · las prestaciones de cada fachada (cotejo F.3)", () => {
  it("F 3.1: R1 + B1 + C1, grado 3; con R3, 5 (como el CEC)", () => {
    expect(max("fa-enf-lp115-at-lhd70", { R: 1 })).toBe(3);
    expect(max("fa-enf-lp115-at-lhd70", { R: 3 })).toBe(5);
  });

  it("F 3.2, la habitual: la cámara da B2 y llega a 4 con R1", () => {
    const e = evaluarFachada(F("fa-enf-lp115-c-at-lhd70"), 4);
    expect(e.niveles).toMatchObject({ R: 1, B: 2, C: 1 });
    expect(e.cumple).toBe(true);
    expect(e.condiciones).toEqual(["R1", "B2", "C1"]);
    expect(e.gradoMax).toBe(4);
    expect(e.cec).toEqual({ clave: "R1", grado: 4 });
  });

  it("F 3.4 con la lana del trasdosado, hidrófila: solo B1 y grado 3 (nota (1) del 4.2.3)", () => {
    const e = evaluarFachada(F("fa-enf-lp115-trasd-pyl"), 1, { R: 1 });
    expect(e.hidrofilo).toBe(true);
    expect(e.niveles.B).toBe(1);
    expect(e.gradoMax).toBe(3);
  });

  it("F 3.5 (1 pie, C2): la tabla 2.7 da 4 con R1 y el CEC 3", () => {
    const e = evaluarFachada(F("fa-enf-lp240-at-lhd70"), 1, { R: 1 });
    expect(e.gradoMax).toBe(4);
    expect(e.cec).toEqual({ clave: "R1", grado: 3 });
  });

  it("F 1.1 sin revestimiento: con J1 y N1, grado 2; con J2, N2 y H1, 3 (como el CEC)", () => {
    expect(max("fa-cv-lp115-at-lhd70", { J: 1, N: 1, H: 0 })).toBe(2);
    expect(max("fa-cv-lp115-at-lhd70", { J: 2, N: 2, H: 1 })).toBe(3);
  });

  it("F 2.1 y F 7.3, cámara ventilada con aislante no hidrófilo: B3 y grado 5", () => {
    expect(max("fa-cv-lp115-cv-at-lhd70")).toBe(5);
    expect(max("fa-ventilada-lp115-at-lhd70")).toBe(5);
  });

  it("F 4.1, SATE de una hoja: los grados 1 y 2 piden C2 (nota 1), pero las soluciones de 3 y 4 valen", () => {
    const e = evaluarFachada(F("fa-sate-lp115"), 2, { R: 1 });
    expect(e.unaHoja).toBe(true);
    expect(e.cumple).toBe(true);
    expect(e.gradoOpcion).toBe(3);
    expect(e.condiciones).toEqual(["R1", "B1", "C1"]);
    expect(e.gradoMax).toBe(4);
    expect(max("fa-sate-lp115", { R: 3 })).toBe(5);
  });

  it("F 8.1 con lana mineral hidrófila: sin B, y con R2 no llega (el CEC da 4); con R3, 5", () => {
    const e = evaluarFachada(F("fa-ventilada-lp115"), 4, { R: 2 });
    expect(e.niveles).toMatchObject({ R: 2, B: 0, C: 1 });
    expect(e.cumple).toBe(false);
    expect(e.cec).toEqual({ clave: "R2", grado: 4 });
    expect(max("fa-ventilada-lp115", { R: 3 })).toBe(5);
  });
});

describe("HS1 · lo habitual y lo declarado", () => {
  it("lo habitual es la menor R con la que cumple: R1 hasta el grado 4, R3 con el 5", () => {
    expect(nivelesHabituales(F("fa-enf-lp115-c-at-lhd70"), 4).R).toBe(1);
    expect(nivelesHabituales(F("fa-enf-lp115-c-at-lhd70"), 5).R).toBe(3);
    const e = evaluarFachada(F("fa-enf-lp115-c-at-lhd70"), 5);
    expect([e.cumple, e.condiciones]).toEqual([true, ["R3", "C1"]]);
  });

  it("declarar menos de lo que hace falta no cumple, y dice qué falta", () => {
    const e = evaluarFachada(F("fa-enf-lp115-c-at-lhd70"), 5, { R: 1 });
    expect(e.cumple).toBe(false);
    expect(e.declarado).toBe(true);
    expect(e.faltan).toEqual(["R3"]);
  });

  it("sin revestimiento, R no cuenta; lo habitual de J, N y H es lo que pide la primera combinación posible", () => {
    const e = evaluarFachada(F("fa-cv-lp115-at-lhd70"), 3);
    expect(e.niveles.R).toBe(0);
    expect(e.cumple).toBe(true);
    expect(e.condiciones).toEqual(["B1", "C1", "H1", "J2", "N2"]);
    expect(e.habituales).toMatchObject({ J: 2, N: 2, H: 1 });
  });

  it("una fachada que no puede llegar ni declarando lo máximo: no cumple", () => {
    const e = evaluarFachada(F("fa-cv-lp115-at-lhd70"), 5);
    expect(e.cumple).toBe(false);
    expect(e.faltan).toEqual(["B3"]);
  });
});
