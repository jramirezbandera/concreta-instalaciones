import { describe, it, expect } from "vitest";
import { calcHS4, hs4Defaults, type HS4Inputs } from "../calc";
import { presionMinCritico, resumenHs4 } from "../resumen";
import { fmt } from "../../../lib/units/format";

// =============================================================================
// HS4 — resumen para la cabecera del módulo (ModuleLayout) (feature-6 T5.4).
// Transformación PURA HS4Result → ResumenVeredicto: el resumen NO recomputa el
// veredicto ni las cifras, solo las formatea con el mismo contenido que la
// antigua banda inline de ui.tsx. Asserts explícitos, SIN snapshots (los
// snapshots del motor y de la ficha viven en calc.test.ts / ficha.test.ts y no
// deben verse afectados).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Red de los defaults del motor (vivienda tipo, presión de acometida sana). */
const defaults: HS4Inputs = hs4Defaults;

/** Misma red con la acometida ESTRANGULADA (presión muy baja → grupo/fallo). */
const presionBaja: HS4Inputs = { ...hs4Defaults, presionAcometida_kPa: 50 };

/** Misma red SIN simultaneidad (K = 1 → más caudal de cálculo por tramo). */
const sinSimultaneidad: HS4Inputs = { ...hs4Defaults, criterioK: "sin_simultaneidad" };

describe("resumenHs4 — contenido de la banda (paridad con la banda inline)", () => {
  it("propaga el veredicto global del motor (NO se recomputa)", () => {
    const r = calcHS4(defaults);
    expect(resumenHs4(r).veredicto).toBe(r.veredictoGlobal);
    const rBaja = calcHS4(presionBaja);
    expect(resumenHs4(rBaja).veredicto).toBe(rBaja.veredictoGlobal);
  });

  it("sujeto y contexto literales de la banda antigua; métricas no vacías", () => {
    const s = resumenHs4(calcHS4(defaults));
    expect(s.sujeto).toBe("Red de suministro");
    expect(s.contexto).toBe("agua fría");
    expect(s.metricas).toBeDefined();
    expect(s.metricas!.length).toBeGreaterThan(0);
  });

  it("las métricas contienen el caudal de cálculo y la presión crítica del result", () => {
    const r = calcHS4(defaults);
    const s = resumenHs4(r);
    expect(s.metricas).toContain(`${fmt(r.caudalTotal_dm3_s, "dm³/s", 2)} de cálculo`);
    expect(s.metricas).toContain(`P crítica ${fmt(r.presionCritica_kPa, "kPa", 0)}`);

    // Sanidad del escenario: los defaults tienen punto de consumo crítico, así
    // que la banda enseña también la mínima exigida ("… / Z kPa mín.").
    const pMin = presionMinCritico(r);
    expect(pMin).not.toBeNull();
    expect(s.metricas).toContain(` / ${fmt(pMin!, "kPa", 0)} mín.`);
  });

  it("el sufijo de grupo de presión aparece exactamente cuando el motor lo marca", () => {
    const r = calcHS4(defaults);
    const rBaja = calcHS4(presionBaja);
    // Sanidad: 50 kPa en la acometida no bastan (la mínima de grifo es 100 kPa).
    expect(rBaja.grupoPresionNecesario).toBe(true);
    expect(resumenHs4(rBaja).metricas).toContain("· grupo de presión necesario");
    // Con los defaults el sufijo sigue la marca del motor (no se inventa).
    const sDefaults = resumenHs4(r);
    expect(sDefaults.metricas!.includes("grupo de presión necesario")).toBe(
      r.grupoPresionNecesario,
    );
  });

  it("sin simultaneidad las métricas siguen siendo coherentes con SU result", () => {
    const rK1 = calcHS4(sinSimultaneidad);
    const s = resumenHs4(rK1);
    expect(s.veredicto).toBe(rK1.veredictoGlobal);
    expect(s.metricas).toContain(`${fmt(rK1.caudalTotal_dm3_s, "dm³/s", 2)} de cálculo`);
    expect(s.metricas).toContain(`P crítica ${fmt(rK1.presionCritica_kPa, "kPa", 0)}`);
  });
});

describe("resumenHs4 — determinismo", () => {
  it("misma entrada → mismo resumen (sin Date/random)", () => {
    expect(resumenHs4(calcHS4(defaults))).toEqual(resumenHs4(calcHS4(defaults)));
    expect(resumenHs4(calcHS4(presionBaja))).toEqual(resumenHs4(calcHS4(presionBaja)));
    expect(resumenHs4(calcHS4(sinSimultaneidad))).toEqual(
      resumenHs4(calcHS4(sinSimultaneidad)),
    );
  });
});
