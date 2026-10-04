import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { SECCION_BASE } from "../../../lib/edificio/seccion";
import { repartirAnchos, seccionConZonas } from "../seccion";

// =============================================================================
// DB-SI (feature-19): la sección común con las zonas de cada planta en
// horizontal, en proporción a su superficie y sin bajar del ancho mínimo.
// =============================================================================

describe("repartirAnchos", () => {
  it("reparte en proporción y suma el total", () => {
    const w = repartirAnchos([300, 100], 400, 20);
    expect(w[0]).toBeCloseTo(300);
    expect(w[1]).toBeCloseTo(100);
  });

  it("no baja del mínimo y lo que sobra va al resto en proporción", () => {
    const w = repartirAnchos([420, 36, 14], 540, 64);
    expect(w[1]).toBe(64);
    expect(w[2]).toBe(64);
    expect(w[0]).toBeCloseTo(540 - 128);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(540);
  });

  it("si no caben todos al mínimo, a partes iguales", () => {
    expect(repartirAnchos([1, 2, 3], 120, 64)).toEqual([40, 40, 40]);
  });
});

describe("seccionConZonas", () => {
  it("coloca las zonas de cada planta de muro a muro, también en las bandas", () => {
    const { base, zonas } = seccionConZonas(edificioDeCaso("plurifamiliar_locales"));
    const s1 = zonas.filter((z) => z.nivel === -1);
    expect(s1.map((z) => z.uso)).toEqual(["garaje", "trasteros", "instalaciones"]);
    expect(s1[0].x0).toBe(SECCION_BASE.X0);
    expect(s1[s1.length - 1].x1).toBeCloseTo(SECCION_BASE.X1);
    // P1–P3: la P3 y la P1 dibujadas y la P2 en la banda.
    expect(base.bandas).toHaveLength(0);
    expect(zonas.filter((z) => z.uso === "viviendas").map((z) => z.nivel)).toEqual([3, 2, 1]);
  });
});
