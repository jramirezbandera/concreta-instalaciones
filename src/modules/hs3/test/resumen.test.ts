import { describe, it, expect } from "vitest";
import { calcHS3, hs3Defaults, type HS3Inputs } from "../calc";
import { resumenHs3 } from "../resumen";
import { fmt } from "../../../lib/units/format";

// =============================================================================
// HS3 — resumen para la banda de veredicto del ModuleShell (feature-6 T5.3).
// Transformación PURA HS3Result → ResumenVeredicto: el resumen NO recomputa el
// veredicto ni las cifras, solo las formatea con el mismo contenido que la
// antigua banda inline de ui.tsx. Asserts explícitos, SIN snapshots (los
// snapshots del motor viven en calc.test.ts y no deben verse afectados).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Vivienda de referencia (defaults): 2 dormitorios → categoría "2". */
const defaults: HS3Inputs = hs3Defaults;

/** Misma vivienda SIN dormitorios declarados → categoría "0-1" (Tabla 2.1). */
const sinDormitorios: HS3Inputs = { ...hs3Defaults, numDormitorios: 0 };

/** Misma vivienda con 4 dormitorios → categoría "3+" (Tabla 2.1). */
const muchosDormitorios: HS3Inputs = { ...hs3Defaults, numDormitorios: 4 };

describe("resumenHs3 — contenido de la banda (paridad con la banda inline)", () => {
  it("propaga el veredicto global del motor (NO se recomputa)", () => {
    const r = calcHS3(defaults);
    expect(resumenHs3(r).veredicto).toBe(r.veredictoGlobal);
  });

  it("sujeto y métricas no vacíos; contexto = categoría de dormitorios del result", () => {
    const r = calcHS3(defaults);
    const s = resumenHs3(r);
    expect(s.sujeto).toBe("Ventilación de la vivienda");
    expect(s.sujeto.length).toBeGreaterThan(0);
    expect(s.metricas).toBeDefined();
    expect(s.metricas!.length).toBeGreaterThan(0);
    expect(s.contexto).toBe(`cat. ${r.categoriaDormitorios}`);
    expect(r.categoriaDormitorios).toBe("2"); // sanidad: defaults = 2 dormitorios
  });

  it("las métricas contienen la extracción y la admisión totales del result", () => {
    const r = calcHS3(defaults);
    const s = resumenHs3(r);
    expect(s.metricas).toContain(`extracción ${fmt(r.totalExtraccion_l_s, "l/s")}`);
    expect(s.metricas).toContain(`admisión ${fmt(r.totalAdmision_l_s, "l/s")}`);
  });

  it("variar el nº de dormitorios cambia el contexto de forma coherente con SU result", () => {
    const r0 = calcHS3(sinDormitorios);
    const r4 = calcHS3(muchosDormitorios);

    // Sanidad del escenario: la Tabla 2.1 clasifica 0 → "0-1" y 4 → "3+".
    expect(r0.categoriaDormitorios).toBe("0-1");
    expect(r4.categoriaDormitorios).toBe("3+");

    // El contexto de la banda sale del result de CADA escenario, no de otro.
    expect(resumenHs3(r0).contexto).toBe("cat. 0-1");
    expect(resumenHs3(r4).contexto).toBe("cat. 3+");
    expect(resumenHs3(r0).contexto).not.toBe(resumenHs3(r4).contexto);

    // Y las métricas siguen siendo las de su propio result (la categoría sube
    // los caudales requeridos, pero las cifras exactas son asunto de calc.test.ts).
    expect(resumenHs3(r4).metricas).toContain(
      `extracción ${fmt(r4.totalExtraccion_l_s, "l/s")}`,
    );
    expect(resumenHs3(r4).metricas).toContain(
      `admisión ${fmt(r4.totalAdmision_l_s, "l/s")}`,
    );
    expect(resumenHs3(r4).veredicto).toBe(r4.veredictoGlobal);
  });
});

describe("resumenHs3 — determinismo", () => {
  it("misma entrada → mismo resumen (sin Date/random)", () => {
    expect(resumenHs3(calcHS3(defaults))).toEqual(resumenHs3(calcHS3(defaults)));
    expect(resumenHs3(calcHS3(sinDormitorios))).toEqual(resumenHs3(calcHS3(sinDormitorios)));
    expect(resumenHs3(calcHS3(muchosDormitorios))).toEqual(
      resumenHs3(calcHS3(muchosDormitorios)),
    );
  });
});
