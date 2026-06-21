import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { calcSmoke, smokeDefaults } from "../calc";

describe("calcSmoke — motor determinista (andamiaje feature-0)", () => {
  it("snapshot del resultado con los valores por defecto", () => {
    // Snapshot commiteado y revisado en PR (SPEC §5). Si cambia una tabla o
    // fórmula, este snapshot lo evidencia.
    expect(calcSmoke(smokeDefaults)).toMatchInlineSnapshot(`
      {
        "caudalPropuesto_l_s": 50,
        "caudalRequerido_l_s": 50,
        "cumple": true,
        "estado": "ok",
        "margen_l_s": 0,
        "warnings": [],
      }
    `);
  });

  it("es determinista: mismo input → mismo output", () => {
    const inp = { caudalPropuesto_l_s: 73, numLocales: 2 };
    expect(calcSmoke(inp)).toEqual(calcSmoke(inp));
  });

  it("justo en el límite (50 l/s) cumple", () => {
    expect(calcSmoke({ caudalPropuesto_l_s: 50, numLocales: 1 }).estado).toBe("ok");
  });

  it("por debajo del límite incumple y avisa", () => {
    const r = calcSmoke({ caudalPropuesto_l_s: 49, numLocales: 1 });
    expect(r.estado).toBe("fail");
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  // Invariante property-based (SPEC §5): el cumplimiento es MONÓTONO respecto al
  // caudal propuesto — aumentar el caudal nunca convierte "cumple" en "no cumple".
  test.prop([
    fc.double({ min: 0, max: 1000, noNaN: true }),
    fc.double({ min: 0, max: 1000, noNaN: true }),
    fc.integer({ min: 1, max: 50 }),
  ])("monotonía: más caudal nunca empeora el veredicto", (a, b, locales) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const rLo = calcSmoke({ caudalPropuesto_l_s: lo, numLocales: locales });
    const rHi = calcSmoke({ caudalPropuesto_l_s: hi, numLocales: locales });
    if (rLo.cumple) expect(rHi.cumple).toBe(true);
  });

  // Invariante: el margen es exactamente propuesto − requerido.
  test.prop([fc.double({ min: 0, max: 1000, noNaN: true })])(
    "margen = propuesto − requerido",
    (q) => {
      const r = calcSmoke({ caudalPropuesto_l_s: q, numLocales: 1 });
      expect(r.margen_l_s).toBeCloseTo(q - r.caudalRequerido_l_s, 9);
    },
  );
});
