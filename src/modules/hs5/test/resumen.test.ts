import { describe, it, expect } from "vitest";
import { calcHS5, hs5Defaults, type HS5Inputs } from "../calc";
import { diametroDe, resumenHs5 } from "../resumen";
import { fmt } from "../../../lib/units/format";

// =============================================================================
// HS5 — resumen para la cabecera del módulo (ModuleLayout) (feature-6 T5.1).
// Transformación PURA HS5Result → ResumenVeredicto: el resumen NO recomputa el
// veredicto ni las cifras, solo las formatea con el mismo contenido que la
// antigua banda inline de ui.tsx. Asserts explícitos, SIN snapshots (los
// snapshots del motor viven en calc.test.ts y no deben verse afectados).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Vivienda pequeña (defaults): uso privado, 1 planta, 1 bajante. */
const defaults: HS5Inputs = hs5Defaults;

/** Misma vivienda con MÁS PLANTAS (columna "más de 3" de la Tabla 4.4). */
const masPlantas: HS5Inputs = { ...hs5Defaults, numPlantas: 8 };

/** Misma red en uso PÚBLICO (columna pública de la Tabla 4.1 → más UD). */
const usoPublico: HS5Inputs = { ...hs5Defaults, uso: "publico" };

describe("resumenHs5 — contenido de la banda (paridad con la banda inline)", () => {
  it("propaga el veredicto global del motor (NO se recomputa)", () => {
    const r = calcHS5(defaults);
    expect(resumenHs5(r).veredicto).toBe(r.veredictoGlobal);
  });

  it("sujeto y métricas no vacíos; contexto según el uso del result", () => {
    const r = calcHS5(defaults);
    const s = resumenHs5(r);
    expect(s.sujeto).toBe("Red de evacuación");
    expect(s.sujeto.length).toBeGreaterThan(0);
    expect(s.metricas).toBeDefined();
    expect(s.metricas!.length).toBeGreaterThan(0);
    expect(s.contexto).toBe("uso privado"); // defaults = vivienda (privado)
    expect(resumenHs5(calcHS5(usoPublico)).contexto).toBe("uso público");
  });

  it("las métricas contienen las UD totales y los Ø de bajante/colector del result", () => {
    const r = calcHS5(defaults);
    const s = resumenHs5(r);

    // Sanidad del escenario: los defaults dimensionan bajante y colector.
    const dBajante = diametroDe(r, "bajante");
    const dColector = diametroDe(r, "colector");
    expect(dBajante).not.toBeNull();
    expect(dColector).not.toBeNull();

    expect(s.metricas).toContain(`${fmt(r.udTotales, "UD")} totales`);
    expect(s.metricas).toContain(`bajante Ø${fmt(dBajante!, "mm", 0)}`);
    expect(s.metricas).toContain(`colector Ø${fmt(dColector!, "mm", 0)}`);
  });

  it("con más plantas las métricas siguen siendo coherentes con SU result", () => {
    const r = calcHS5(masPlantas);
    const s = resumenHs5(r);

    // El veredicto y las cifras salen del result de ESE escenario, no de otro.
    expect(s.veredicto).toBe(r.veredictoGlobal);
    expect(s.metricas).toContain(`${fmt(r.udTotales, "UD")} totales`);
    const dBajante = diametroDe(r, "bajante");
    const dColector = diametroDe(r, "colector");
    expect(s.metricas).toContain(
      dBajante == null ? "bajante Ø —" : `bajante Ø${fmt(dBajante, "mm", 0)}`,
    );
    expect(s.metricas).toContain(
      dColector == null ? "colector Ø —" : `colector Ø${fmt(dColector, "mm", 0)}`,
    );

    // Cambiar solo las plantas no cambia los aparatos → mismas UD totales que
    // los defaults (la coherencia es con el motor, no una cifra suelta).
    expect(r.udTotales).toBe(calcHS5(defaults).udTotales);
  });

  it("uso público cambia las métricas de forma coherente con SU result", () => {
    const rPriv = calcHS5(defaults);
    const rPub = calcHS5(usoPublico);
    // La columna pública de la Tabla 4.1 asigna OTRAS UD a los mismos aparatos
    // (los "cuartos" agrupados de los defaults no están contemplados en uso
    // público → el total cambia; la cifra exacta es asunto de calc.test.ts).
    expect(rPub.udTotales).not.toBe(rPriv.udTotales);
    expect(resumenHs5(rPub).metricas).not.toBe(resumenHs5(rPriv).metricas);
    expect(resumenHs5(rPub).metricas).toContain(`${fmt(rPub.udTotales, "UD")} totales`);
  });
});

describe("resumenHs5 — determinismo", () => {
  it("misma entrada → mismo resumen (sin Date/random)", () => {
    expect(resumenHs5(calcHS5(defaults))).toEqual(resumenHs5(calcHS5(defaults)));
    expect(resumenHs5(calcHS5(masPlantas))).toEqual(resumenHs5(calcHS5(masPlantas)));
    expect(resumenHs5(calcHS5(usoPublico))).toEqual(resumenHs5(calcHS5(usoPublico)));
  });
});
