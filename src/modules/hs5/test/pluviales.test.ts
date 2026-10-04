import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { bajantesPluvialesPropuestas, calcPluviales, intensidadDe, sumiderosDe } from "../pluviales";
import { ISOYETAS } from "../tablas";

// =============================================================================
// Pluviales (feature-14 §C): tablas 4.6–4.9 y B.1 verificadas en
// research/verificacion-hs5-pluviales.md; factor f = i / 100.
// =============================================================================

describe("Tabla 4.6 · sumideros", () => {
  it("por tramos de superficie, y uno cada 150 m² por encima de 500", () => {
    expect([99, 100, 199, 200, 499, 500, 600, 601, 1000].map(sumiderosDe)).toEqual([2, 3, 3, 4, 4, 4, 4, 5, 7]);
  });

  it("bajantes propuestas: una por cada dos sumideros en plana; dos en inclinada", () => {
    expect(bajantesPluvialesPropuestas({ tipo: "plana_no_transitable", superficie_m2: 210 })).toBe(2);
    expect(bajantesPluvialesPropuestas({ tipo: "plana_transitable", superficie_m2: 90 })).toBe(1);
    expect(bajantesPluvialesPropuestas({ tipo: "inclinada", superficie_m2: 110 })).toBe(2);
  });
});

describe("Tabla B.1 · intensidad", () => {
  it("zona A y B, isoyetas de 10 a 120", () => {
    expect(intensidadDe("A", 30)).toBe(90);
    expect(intensidadDe("A", 40)).toBe(125);
    expect(intensidadDe("B", 30)).toBe(70);
    expect(intensidadDe("B", 120)).toBe(265);
    expect(ISOYETAS).toHaveLength(12);
  });
});

describe("calcPluviales", () => {
  it("la cubierta de la maqueta: 210 m², 90 mm/h, dos bajantes Ø63 y colector Ø110", () => {
    const r = calcPluviales({
      cubierta: { tipo: "plana_no_transitable", superficie_m2: 210 },
      intensidad_mm_h: 90,
      bajantes: 2,
      pendienteColector_pct: 2,
    });
    expect(r.f).toBeCloseTo(0.9);
    expect(r.sumideros).toBe(4);
    expect(r.canalon).toBeNull();
    expect(r.bajante).toMatchObject({ superficie_m2: 105, diametro_mm: 63, capacidad_m2: 113 });
    expect(r.bajante.corregida_m2).toBeCloseTo(94.5);
    expect(r.bajante.alternativa).toEqual({ diametro_mm: 50, capacidad_m2: 65 });
    expect(r.colector).toMatchObject({ diametro_mm: 110, capacidad_m2: 323, alternativa: { diametro_mm: 90, capacidad_m2: 178 } });
    expect(r.veredicto).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("cubierta inclinada: canalones por la Tabla 4.7 y sin sumideros", () => {
    const r = calcPluviales({
      cubierta: { tipo: "inclinada", superficie_m2: 110 },
      intensidad_mm_h: 100,
      bajantes: 2,
      pendienteColector_pct: 2,
    });
    expect(r.sumideros).toBeNull();
    expect(r.canalon).toMatchObject({ superficie_m2: 55, diametro_mm: 125, capacidad_m2: 80, pendiente_pct: 1 });
    expect(r.bajante).toMatchObject({ diametro_mm: 50, capacidad_m2: 65 });
    expect(r.colector).toMatchObject({ diametro_mm: 90, capacidad_m2: 178 });
  });

  it("fuera de la Tabla 4.8: no cumple y lo avisa", () => {
    const r = calcPluviales({
      cubierta: { tipo: "plana_no_transitable", superficie_m2: 3000 },
      intensidad_mm_h: 100,
      bajantes: 1,
      pendienteColector_pct: 2,
    });
    expect(r.bajante.diametro_mm).toBeNull();
    expect(r.veredicto).toBe("fail");
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("sin cubierta no hay nada que comprobar", () => {
    const r = calcPluviales({
      cubierta: { tipo: "plana_no_transitable", superficie_m2: 0 },
      intensidad_mm_h: 100,
      bajantes: 1,
      pendienteColector_pct: 2,
    });
    expect(r.veredicto).toBe("neutral");
  });

  const entrada = fc.record({
    superficie: fc.integer({ min: 10, max: 2000 }),
    intensidad: fc.constantFrom(30, 50, 70, 90, 125, 155, 210, 365),
    bajantes: fc.integer({ min: 1, max: 8 }),
    pendiente: fc.constantFrom(1, 2, 4),
    inclinada: fc.boolean(),
  });

  test.prop([entrada])("el colector nunca es menor que las bajantes que recibe", (e) => {
    const r = calcPluviales({
      cubierta: { tipo: e.inclinada ? "inclinada" : "plana_no_transitable", superficie_m2: e.superficie },
      intensidad_mm_h: e.intensidad,
      bajantes: e.bajantes,
      pendienteColector_pct: e.pendiente,
    });
    if (r.colector.diametro_mm !== null && r.bajante.diametro_mm !== null) {
      expect(r.colector.diametro_mm).toBeGreaterThanOrEqual(r.bajante.diametro_mm);
    }
  });

  test.prop([entrada])("más lluvia nunca pide menos Ø", (e) => {
    const base = {
      cubierta: { tipo: e.inclinada ? ("inclinada" as const) : ("plana_no_transitable" as const), superficie_m2: e.superficie },
      bajantes: e.bajantes,
      pendienteColector_pct: e.pendiente,
    };
    const a = calcPluviales({ ...base, intensidad_mm_h: e.intensidad });
    const b = calcPluviales({ ...base, intensidad_mm_h: e.intensidad * 1.5 });
    if (a.bajante.diametro_mm !== null && b.bajante.diametro_mm !== null) {
      expect(b.bajante.diametro_mm).toBeGreaterThanOrEqual(a.bajante.diametro_mm);
    }
    if (a.bajante.diametro_mm === null) expect(b.bajante.diametro_mm).toBeNull();
  });
});
