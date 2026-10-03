import { describe, it, expect } from "vitest";
import { calcHE1, he1Defaults, type HE1Inputs } from "../calc";
import { resumenHe1 } from "../resumen";
import { fmt } from "../../../lib/units/format";

// =============================================================================
// HE1 — resumen para la cabecera del módulo (ModuleLayout) (feature-6 T5.5).
// Transformación PURA HE1Result → ResumenVeredicto: el resumen NO recomputa el
// veredicto ni las cifras, solo las formatea con el mismo contenido que la
// antigua banda inline de ui.tsx. Asserts explícitos, SIN snapshots (los
// snapshots del motor viven en calc.test.ts y no deben verse afectados).
// Solo tests de ejemplo — si algún día entran property-based, van con
// `fc.assert(fc.property(…))` dentro de `it()` (ver calc.test.ts:29-35).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Envolvente de los defaults (zona y cerramientos de fábrica del módulo). */
const defaults: HE1Inputs = he1Defaults;

/** Misma envolvente en OTRA zona climática (cambia el contexto de la banda). */
const zonaE: HE1Inputs = { ...he1Defaults, zonaClimatica: "E" };

/** Misma envolvente con la θe de enero explícita (aparece en las métricas). */
const conTempExterior: HE1Inputs = { ...he1Defaults, tempExteriorEnero_C: -3 };

describe("resumenHe1 — contenido de la banda (paridad con la banda inline)", () => {
  it("propaga el veredicto global del motor (NO se recomputa)", () => {
    const r = calcHE1(defaults);
    expect(resumenHe1(r).veredicto).toBe(r.veredictoGlobal);
    const rE = calcHE1(zonaE);
    expect(resumenHe1(rE).veredicto).toBe(rE.veredictoGlobal);
  });

  it("sujeto fijo; contexto contiene la zona climática del result", () => {
    const r = calcHE1(defaults);
    const s = resumenHe1(r);
    expect(s.sujeto).toBe("Envolvente térmica");
    expect(s.contexto).toBe(`zona ${r.zonaClimatica}`);
    // Cambiar la zona de entrada cambia el contexto de forma coherente con SU
    // result (la banda enseña la zona del motor, no la del formulario).
    const rE = calcHE1(zonaE);
    expect(resumenHe1(rE).contexto).toBe(`zona ${rE.zonaClimatica}`);
    expect(resumenHe1(rE).contexto).toContain("E");
  });

  it("las métricas contienen el nº de cerramientos y la θe de enero del result", () => {
    const r = calcHE1(defaults);
    const s = resumenHe1(r);
    const n = r.porCerramiento.length;
    expect(s.metricas).toBeDefined();
    expect(s.metricas).toContain(`${n} ${n === 1 ? "cerramiento" : "cerramientos"}`);
    expect(s.metricas).toContain(`θe ${fmt(r.tempExteriorEnero_C, "°C", 0)} enero`);
  });

  it("con un solo cerramiento la métrica va en singular", () => {
    const unSolo: HE1Inputs = {
      ...he1Defaults,
      cerramientos: he1Defaults.cerramientos.slice(0, 1),
    };
    const r = calcHE1(unSolo);
    expect(r.porCerramiento.length).toBe(1);
    expect(resumenHe1(r).metricas).toContain("1 cerramiento");
    expect(resumenHe1(r).metricas).not.toContain("cerramientos");
  });

  it("la θe explícita de la entrada aparece formateada en las métricas", () => {
    const r = calcHE1(conTempExterior);
    // Sanidad del escenario: el motor adopta la θe aportada (no el conservador).
    expect(r.tempExteriorEnero_C).toBe(-3);
    expect(resumenHe1(r).metricas).toContain(`θe ${fmt(-3, "°C", 0)} enero`);
  });

  it("no lleva cita propia (la banda usa la edición del DB del registry)", () => {
    expect(resumenHe1(calcHE1(defaults)).cita).toBeUndefined();
  });
});

describe("resumenHe1 — determinismo", () => {
  it("misma entrada → mismo resumen (sin Date/random)", () => {
    expect(resumenHe1(calcHE1(defaults))).toEqual(resumenHe1(calcHE1(defaults)));
    expect(resumenHe1(calcHE1(zonaE))).toEqual(resumenHe1(calcHE1(zonaE)));
    expect(resumenHe1(calcHE1(conTempExterior))).toEqual(
      resumenHe1(calcHE1(conTempExterior)),
    );
  });
});
