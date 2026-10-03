import { describe, it, expect } from "vitest";
import { calcHS6, hs6Defaults, type HS6Inputs } from "../calc";
import { resumenHs6 } from "../resumen";

// =============================================================================
// HS6 — resumen para la cabecera del módulo (ModuleLayout) (feature-6 T5.2).
// Transformación PURA HS6Result → ResumenVeredicto: el resumen NO recomputa el
// veredicto ni las cifras, solo las formatea con el mismo contenido que la
// antigua banda inline de ui.tsx. Asserts explícitos, SIN snapshots (los
// snapshots del motor/ficha viven en calc.test.ts / ficha.test.ts y no deben
// verse afectados).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Zona II con barrera + cámara válidas (defaults): la exigencia se satisface. */
const defaults: HS6Inputs = hs6Defaults;

/** Mismo edificio en Zona I (una sola medida exigida, barrera NO obligatoria). */
const zonaI: HS6Inputs = { ...hs6Defaults, zona: "I" };

/** Municipio sin clasificar → HS6 no exige medidas ("sin exigencia HS6"). */
const sinExigencia: HS6Inputs = { ...hs6Defaults, zona: "sin_exigencia" };

/** Fuera de ámbito (art. 1): local no habitable / sin contacto con el terreno. */
const fueraAmbito: HS6Inputs = {
  ...hs6Defaults,
  localHabitableEnContactoConTerreno: false,
};

describe("resumenHs6 — contenido de la banda (paridad con la banda inline)", () => {
  it("propaga el veredicto global del motor (NO se recomputa)", () => {
    const r = calcHS6(defaults);
    expect(resumenHs6(r).veredicto).toBe(r.veredictoGlobal);
  });

  it("sujeto y métricas no vacíos; contexto con la zona del result", () => {
    const r = calcHS6(defaults);
    const s = resumenHs6(r);
    expect(s.sujeto).toBe("Protección frente al radón");
    expect(s.sujeto.length).toBeGreaterThan(0);
    expect(s.metricas).toBeDefined();
    expect(s.metricas!.length).toBeGreaterThan(0);
    expect(s.contexto).toBe(`zona ${r.zona}`); // defaults = Zona II
    expect(resumenHs6(calcHS6(zonaI)).contexto).toBe("zona I");
  });

  it("las métricas contienen nMedidasValidas/nMedidasMin del result y la barrera obligatoria (Zona II)", () => {
    const r = calcHS6(defaults);
    const s = resumenHs6(r);

    // Sanidad del escenario: en Zona II la exigencia aplica y la barrera es
    // obligatoria (art. 3.1); las cifras exactas son asunto de calc.test.ts.
    expect(r.aplica).toBe(true);
    expect(r.barreraObligatoria).toBe(true);

    expect(s.metricas).toContain(
      `${r.nMedidasValidas} de ${r.nMedidasMin} medida(s) válida(s)`,
    );
    expect(s.metricas).toContain("· barrera obligatoria");
  });

  it("en Zona I las métricas son coherentes con SU result (sin coletilla de barrera)", () => {
    const r = calcHS6(zonaI);
    const s = resumenHs6(r);

    expect(r.aplica).toBe(true);
    expect(r.barreraObligatoria).toBe(false); // Zona I: una medida, sin barrera obligatoria

    expect(s.veredicto).toBe(r.veredictoGlobal);
    expect(s.metricas).toBe(`${r.nMedidasValidas} de ${r.nMedidasMin} medida(s) válida(s)`);
    expect(s.metricas).not.toContain("barrera obligatoria");
  });

  it("zona sin clasificar → 'sin exigencia HS6' (como la banda inline)", () => {
    const r = calcHS6(sinExigencia);
    const s = resumenHs6(r);
    expect(r.aplica).toBe(false); // sanidad: HS6 no exige medidas
    expect(s.veredicto).toBe(r.veredictoGlobal);
    expect(s.contexto).toBe("zona sin_exigencia");
    expect(s.metricas).toBe("sin exigencia HS6");
  });

  it("fuera de ámbito (art. 1) → 'sin exigencia HS6' con el veredicto del motor", () => {
    const r = calcHS6(fueraAmbito);
    const s = resumenHs6(r);
    expect(r.aplica).toBe(false); // sanidad: local fuera de ámbito
    expect(s.veredicto).toBe(r.veredictoGlobal);
    expect(s.metricas).toBe("sin exigencia HS6");
  });
});

describe("resumenHs6 — determinismo", () => {
  it("misma entrada → mismo resumen (sin Date/random)", () => {
    expect(resumenHs6(calcHS6(defaults))).toEqual(resumenHs6(calcHS6(defaults)));
    expect(resumenHs6(calcHS6(zonaI))).toEqual(resumenHs6(calcHS6(zonaI)));
    expect(resumenHs6(calcHS6(sinExigencia))).toEqual(resumenHs6(calcHS6(sinExigencia)));
    expect(resumenHs6(calcHS6(fueraAmbito))).toEqual(resumenHs6(calcHS6(fueraAmbito)));
  });
});
