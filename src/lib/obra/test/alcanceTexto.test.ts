import { describe, it, expect } from "vitest";
import { fichaConAlcance, notaAlcance } from "../alcanceTexto";
import { bloquesMemoria, memoriaCte } from "../memoria";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Alcance, Proyecto } from "../../proyecto/tipos";

// =============================================================================
// El párrafo de alcance en la memoria y la ficha (feature-27, paso 7).
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-09T10:00:00.000Z");

function reforma(alcance?: Alcance): Proyecto {
  const p = demo();
  p.datosGenerales = { ...p.datosGenerales, intervencion: "reforma", alcance };
  return p;
}

describe("notaAlcance", () => {
  it("en obra nueva no hay párrafo de alcance", () => {
    const p = demo();
    for (const k of ["hs4", "si3", "he1"] as const) expect(notaAlcance(p, k)).toBeNull();
  });

  it("con el asistente sin responder, la nota «pendiente» no va a la memoria", () => {
    expect(notaAlcance(reforma(), "hs4")).toBeNull();
  });

  it("con el asistente, el acotamiento con su cita", () => {
    const n = notaAlcance(reforma({}), "hs4");
    expect(n?.parrafo).toContain("se aplica a la parte de la instalación");
    expect(n?.cita).toContain("DB-HS 4");
  });

  it("lo que no aplica no lleva párrafo de alcance: tiene su propio apartado", () => {
    expect(notaAlcance(reforma({ aparatos: "no" }), "hs4")).toBeNull();
  });

  it("lo forzado por el proyectista va siempre, también en obra nueva", () => {
    const p = demo();
    p.justificaciones.hs4 = { ...p.justificaciones.hs4, aplicabilidadForzada: { valor: "aplica_reformado", nota: "Solo la vivienda 1A." } };
    expect(notaAlcance(p, "hs4")?.parrafo).toBe("Solo la vivienda 1A.");
  });
});

describe("la memoria y la ficha", () => {
  it("el párrafo de alcance va justo después del título del apartado", () => {
    const b = bloquesMemoria(memoriaCte(reforma({})), "9 de octubre de 2026");
    const i = b.findIndex((x) => x.tipo === "titulo" && x.texto.includes("Suministro de agua"));
    expect(i).toBeGreaterThan(0);
    expect(b[i + 1]).toMatchObject({ tipo: "parrafo" });
    expect((b[i + 1] as { texto: string }).texto).toContain("Suministro de agua: se aplica");
  });

  it("obra nueva: la memoria no cambia", () => {
    const sin = bloquesMemoria(memoriaCte(demo()), "x");
    expect(sin.some((x) => "texto" in x && x.texto.startsWith("Alcance"))).toBe(false);
  });

  it("la ficha lleva el alcance delante de sus observaciones", () => {
    const f = fichaConAlcance({ observaciones: ["otra"] }, reforma({}), "hs4");
    expect(f.observaciones?.[0]).toMatch(/^Alcance: DB-HS 4/);
    expect(f.observaciones?.[1]).toBe("otra");
    const igual = { observaciones: ["otra"] };
    expect(fichaConAlcance(igual, demo(), "hs4")).toBe(igual);
  });
});
