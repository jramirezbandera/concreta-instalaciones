import { describe, expect, it } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";
import { CASOS_EDIFICIO, edificioDeCaso } from "../../../lib/edificio/casos";
import { DECISIONES_HS3_POR_DEFECTO, equilibrar, generarRedHs3, type DecisionesHs3 } from "../red";

// =============================================================================
// La ventilación de HS3 deducida de El edificio (feature-15): el equilibrado de
// cada vivienda tipo, sus verticales, el garaje, los trasteros y el RITE.
// =============================================================================

function decisiones(parcial: Partial<DecisionesHs3> = {}): DecisionesHs3 {
  return { ...DECISIONES_HS3_POR_DEFECTO, ...parcial };
}

describe("equilibrar · una vivienda tipo", () => {
  it("T3 en proporción: los húmedos suben a 33 entre los tres y los secos, ×33/26", () => {
    const { categoria, locales, equilibrado } = equilibrar({ dormitorios: 3, banos: 2, aseos: 0 }, "proporcional");
    expect(categoria).toBe("3+");
    expect(equilibrado).toMatchObject({ entraTabla_l_s: 26, saleTabla_l_s: 33, equilibrado_l_s: 33, aumenta: "admision" });
    const q = Object.fromEntries(locales.map((l) => [l.id, l.adoptado_l_s]));
    expect(q.cocina).toBeCloseTo(11);
    expect(q["bano-1"]).toBeCloseTo(11);
    expect(q.salon).toBeCloseTo((10 * 33) / 26);
    expect(q["dorm-pral"]).toBeCloseTo((8 * 33) / 26);
  });

  it("T3 al salón: los secos se quedan en la tabla y el salón pasa de 10 a 17", () => {
    const { locales } = equilibrar({ dormitorios: 3, banos: 2, aseos: 0 }, "salon");
    const q = Object.fromEntries(locales.map((l) => [l.id, l.adoptado_l_s]));
    expect(q.salon).toBe(17);
    expect(q["dorm-pral"]).toBe(8);
    expect(q["dorm-2"]).toBe(4);
  });

  it("T1: sobra admisión y sube la extracción (de 12 a 14)", () => {
    const { equilibrado, locales } = equilibrar({ dormitorios: 1, banos: 1, aseos: 0 }, "proporcional");
    expect(equilibrado).toMatchObject({ entraTabla_l_s: 14, saleTabla_l_s: 12, equilibrado_l_s: 14, aumenta: "extraccion" });
    const humedos = locales.filter((l) => l.humedo).reduce((s, l) => s + l.adoptado_l_s, 0);
    expect(humedos).toBeCloseTo(14);
    const alSalon = equilibrar({ dormitorios: 1, banos: 1, aseos: 0 }, "salon");
    expect(alSalon.locales.find((l) => l.id === "cocina")!.adoptado_l_s).toBe(8);
  });

  fcTest.prop([
    fc.integer({ min: 0, max: 6 }),
    fc.integer({ min: 0, max: 4 }),
    fc.integer({ min: 0, max: 3 }),
    fc.constantFrom("proporcional" as const, "salon" as const),
  ])("siempre entra lo mismo que sale, ningún local baja de su mínimo y los húmedos llegan al total", (d, b, a, modo) => {
    const { locales, equilibrado } = equilibrar({ dormitorios: d, banos: b, aseos: a }, modo);
    const entra = locales.filter((l) => !l.humedo).reduce((s, l) => s + l.adoptado_l_s, 0);
    const sale = locales.filter((l) => l.humedo).reduce((s, l) => s + l.adoptado_l_s, 0);
    expect(entra).toBeCloseTo(sale, 9);
    expect(entra).toBeCloseTo(equilibrado.equilibrado_l_s, 9);
    for (const l of locales) expect(l.adoptado_l_s).toBeGreaterThanOrEqual(l.minimo_l_s - 1e-9);
    expect(sale).toBeGreaterThanOrEqual(equilibrado.saleTabla_l_s - 1e-9);
  });
});

describe("generarRedHs3 · los cuatro casos", () => {
  it("plurifamiliar con locales: A y B en tres plantas, garaje de 14 plazas y trasteros con él", () => {
    const red = generarRedHs3(edificioDeCaso("plurifamiliar_locales"), decisiones());
    expect(red.tipos.map((t) => [t.nombre, t.viviendas, t.verticales])).toEqual([
      ["A", 3, [{ plantas: 3, instancias: 1 }]],
      ["B", 3, [{ plantas: 3, instancias: 1 }]],
    ]);
    expect(red.garajes).toEqual([
      { id: "garaje-s1", nivel: -1, plazas: 14, superficie_m2: 420, caudal_l_s: 1680, bajoRasante: true },
    ]);
    expect(red.trasteros[0]).toMatchObject({ superficie_m2: 36, conGarajeId: "garaje-s1" });
    expect(red.trasteros[0].caudal_l_s).toBeCloseTo(25.2);
    expect(red.rite).toEqual({ locales: 1, oficinas: 0 });
  });

  it("con el garaje natural los trasteros ventilan por su cuenta", () => {
    const red = generarRedHs3(edificioDeCaso("plurifamiliar_locales"), decisiones({ garaje: "natural" }));
    expect(red.trasteros[0].conGarajeId).toBeNull();
  });

  it("plurifamiliar: la A de la PB apila cuatro plantas", () => {
    const red = generarRedHs3(edificioDeCaso("plurifamiliar"), decisiones());
    expect(red.tipos.find((t) => t.nombre === "A")!.verticales).toEqual([{ plantas: 4, instancias: 1 }]);
    expect(red.tipos.find((t) => t.nombre === "A")!.viviendas).toBe(4);
  });

  it("unifamiliar: una vivienda de conductos individuales y su garaje privado, pequeño y natural", () => {
    const red = generarRedHs3(edificioDeCaso("unifamiliar"), decisiones());
    expect(red.unifamiliar).toBe(true);
    expect(red.tipos[0].verticales).toEqual([{ plantas: 1, instancias: 1 }]);
    expect(red.garajes).toHaveLength(1);
    expect(red.garajes[0]).toMatchObject({ plazas: 1, caudal_l_s: 120, bajoRasante: false });
    expect(red.decisiones.garaje).toBe("natural");
  });

  it("oficinas: sin viviendas, solo el garaje; las oficinas y el local van por el RITE", () => {
    const red = generarRedHs3(edificioDeCaso("oficinas"), decisiones());
    expect(red.tipos).toEqual([]);
    expect(red.garajes.map((g) => g.plazas)).toEqual([10]);
    expect(red.rite).toEqual({ locales: 1, oficinas: 2 });
  });

  it.each(CASOS_EDIFICIO.map((c) => c.key))("%s: es determinista", (caso) => {
    const e = edificioDeCaso(caso);
    expect(generarRedHs3(e, decisiones())).toEqual(generarRedHs3(e, decisiones()));
  });
});
