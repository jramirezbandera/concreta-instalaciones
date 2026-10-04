import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { DatosGenerales } from "../../../lib/proyecto/tipos";
import { sua8 } from "../definicion";
import { sua8EstadoDefaults, type Sua8Estado } from "../estado";
import { calcularSua8, justificarSua8 } from "../justificacion";
import { areaCaptura, nivelDe } from "../tablas";

// =============================================================================
// SUA 8 · Acción del rayo (feature-20). Cifras y ejemplos:
// research/verificacion-sua6-sua8.md, bloques C3 a C5.
// =============================================================================

const base = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const caso = (c: CasoEdificio, estado: Partial<Sua8Estado> = {}, dg: Partial<DatosGenerales> = {}) =>
  justificarSua8({ ...sua8EstadoDefaults, ...estado }, { edificio: edificioDeCaso(c), datosGenerales: { ...base, ...dg } });

const entradas = { ng: 2, largo_m: 20, ancho_m: 15, h_m: 18, c1: 0.5, c2: 1, c3: 1, c4: 1, c5: 1, peligrosas: false };

describe("SUA8 · las cuentas del DB", () => {
  it("Ae del rectángulo a 3H", () => {
    expect(areaCaptura(20, 15, 18)).toBeCloseTo(13240.88, 1);
  });

  it("ejemplo 1: plurifamiliar entre medianeras → nivel 4, no obligatoria", () => {
    const r = calcularSua8(entradas);
    expect(r.ne).toBeCloseTo(0.013241, 6);
    expect(r.na).toBeCloseTo(0.0055, 7);
    expect(r.e).toBeCloseTo(0.5846, 4);
    expect(r.nivel).toBe(4);
    expect(r.obligatoria).toBe(false);
  });

  it("ejemplo 2: bloque exento de 30 m con Ng 3 → nivel 3, obligatoria", () => {
    const r = calcularSua8({ ...entradas, ng: 3, largo_m: 25, ancho_m: 20, h_m: 30 });
    expect(r.ae_m2).toBeCloseTo(34046.9, 1);
    expect(r.e).toBeCloseTo(0.8923, 4);
    expect(r.nivel).toBe(3);
    expect(r.obligatoria).toBe(true);
  });

  it("ejemplo 3: unifamiliar aislada → Ne ≤ Na, no es necesaria; con cubierta de madera, nivel 4", () => {
    const u = { ...entradas, largo_m: 12, ancho_m: 10, h_m: 7, c1: 1 };
    expect(calcularSua8(u)).toMatchObject({ e: null, nivel: null, obligatoria: false });
    expect(calcularSua8({ ...u, c2: 2.5 }).e).toBeCloseTo(0.5472, 4);
  });

  it("los límites de la tabla 2.1 incluyen el inferior", () => {
    expect([0.98, 0.9799, 0.95, 0.8, 0.7999, 0].map(nivelDe)).toEqual([1, 2, 2, 3, 4, 4]);
  });

  it("más de 43 m o sustancias peligrosas: siempre nivel 1", () => {
    expect(calcularSua8({ ...entradas, h_m: 43.01 })).toMatchObject({ nivel: 1, obligatoria: true, siempre: "altura" });
    expect(calcularSua8({ ...entradas, h_m: 43 }).siempre).toBeNull();
    expect(calcularSua8({ ...entradas, peligrosas: true })).toMatchObject({ nivel: 1, siempre: "peligrosas" });
  });
});

describe("SUA8 · con El edificio", () => {
  it("H es la cubierta más el remate habitual", () => {
    const j = caso("plurifamiliar");
    // PB + 3 plantas de 3 m: cubierta a 12 m, plana no transitable (+0,50).
    expect(j.h_m).toBeCloseTo(12.5, 2);
  });

  it("sin Ng se supone 6 y se avisa solo si cambia el resultado", () => {
    const sin = caso("plurifamiliar", {}, { densidadImpactosNg: undefined });
    expect(sin.elementos.find((e) => e.id === "ne")!.detalle).toMatchObject({ ng: 6, ngSupuesto: true });
    const con = caso("plurifamiliar", {}, { densidadImpactosNg: 2 });
    expect(con.avisos.some((a) => a.id === "ng-supuesto")).toBe(false);
    // Con Ng = 6 y Ng = 0,5 la conclusión cambia: se avisa.
    if (sin.resultado.obligatoria) expect(sin.avisos.some((a) => a.id === "ng-supuesto")).toBe(true);
  });

  it("obligatoria y no proyectada: no cumple, y el arreglo vuelve a lo habitual", () => {
    const j = caso("plurifamiliar_locales", { especial: "peligrosas", instalacion: "no" });
    const el = j.elementos.find((e) => e.id === "proteccion")!;
    expect(el.veredicto).toBe("fail");
    expect(sua8.arreglo!(el, j)).toEqual({ etiqueta: "Proyectar la instalación", cambios: { instalacion: "habitual" } });
    const ok = caso("plurifamiliar_locales", { especial: "peligrosas" });
    expect(ok.veredicto).toBe("ok");
    expect(ok.elementos.map((e) => e.id)).toContain("sistema");
  });

  it("el local sin uso se supone Comercial (C4 = 3); administrativo, 1", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.elementos.find((e) => e.id === "na")!.detalle).toMatchObject({ c4: 3, c4Supuesto: true });
  });

  it("los cuatro casos dan memoria, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const j = caso(c, {}, { densidadImpactosNg: 2 });
      expect(textoPlanoMemoria(sua8.memoria(j))).toMatch(/Ne = Ng · Ae · C1/);
      const dibujo = sua8.dibujo(j, edificioDeCaso(c));
      expect(dibujo.etiquetas.map((e) => e.elementoId)).toEqual(expect.arrayContaining(["altura", "ne", "na", "proteccion"]));
      const ficha = sua8.ficha(j, { estado: sua8EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(sua8.frase(j).length).toBeGreaterThan(20);
    }
  });
});
