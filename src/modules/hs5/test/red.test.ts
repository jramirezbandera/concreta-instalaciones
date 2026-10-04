import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { calcHS5 } from "../calc";
import {
  DECISIONES_POR_DEFECTO,
  decisionesHabituales,
  generarRedHs5,
  type DecisionesHs5,
} from "../red";

// =============================================================================
// La red de HS5 deducida de El edificio (feature-14 §D), sobre los cuatro casos
// de partida. Las cifras de «Plurifamiliar con locales» son las de la maqueta v4.
// =============================================================================

function porId<T extends { id: string }>(lista: T[], id: string): T {
  const x = lista.find((e) => e.id === id);
  if (!x) throw new Error(`no existe ${id}`);
  return x;
}

describe("generarRedHs5 · plurifamiliar con locales (la maqueta)", () => {
  const e = edificioDeCaso("plurifamiliar_locales");
  const red = generarRedHs5(e, DECISIONES_POR_DEFECTO);
  const r = calcHS5(red.residuales);

  it("lo habitual: unitario, colgados del techo del sótano al 2 %, cocina propia, primaria", () => {
    expect(red.decisiones).toEqual({
      alcantarillado: "unitario",
      colectores: "colgado",
      pendienteColector_pct: 2,
      bajanteCocina: "propia",
      ventilacion: "primaria",
    });
    expect(red.nivelBase).toBe(0);
  });

  it("dos verticales, A y B, de P1 a P3, con bajante de baños y de cocina", () => {
    expect(red.verticales.map((v) => [v.id, v.niveles, v.instancias, v.udUnidad])).toEqual([
      ["a", [1, 2, 3], 1, 23],
      ["b", [1, 2, 3], 1, 22],
    ]);
    const a = red.verticales[0];
    expect(a.bajantes.map((b) => [b.id, b.clase, b.plantas, b.ud])).toEqual([
      ["bajante-a-fecales", "fecales", 3, 42],
      ["bajante-a-cocina", "cocina", 3, 27],
    ]);
    expect(a.bajantes[0].ramales.map((x) => [x.nivel, x.ud])).toEqual([
      [1, 14],
      [2, 14],
      [3, 14],
    ]);
  });

  it("el motor da las cifras de la maqueta", () => {
    expect(r.veredictoGlobal).toBe("ok");
    expect(r.warnings).toEqual([]);
    const colector = porId(r.porTramo, "colector-general");
    expect(colector.udAcumuladas).toBe(135);
    expect(colector.diametro_mm).toBe(110);
    expect(colector.capacidad_ud).toBe(321);
    expect(colector.alternativa).toEqual({ diametro_mm: 90, capacidad_ud: 130 });

    const bA = porId(r.porTramo, "bajante-a-fecales");
    expect([bA.udAcumuladas, bA.diametro_mm, bA.diametroPorCapacidad_mm]).toEqual([42, 110, 90]);
    expect(bA.elevadoPor).toMatchObject({ causa: "aguas_arriba", aparato: "cuarto_bano_cisterna" });
    expect(bA.bajante).toMatchObject({ plantas: 3, udMaxRamal: 14 });

    const bB = porId(r.porTramo, "bajante-b-fecales");
    expect([bB.udAcumuladas, bB.diametro_mm]).toEqual([39, 110]);

    const cocina = porId(r.porTramo, "bajante-a-cocina");
    expect([cocina.udAcumuladas, cocina.diametro_mm, cocina.capacidad_ud]).toEqual([27, 75, 27]);
    expect(cocina.elevadoPor).toBeNull();
    expect(cocina.alternativa).toEqual({ diametro_mm: 63, capacidad_ud: 19 });

    const ramal = porId(r.porTramo, "ramal-a-fecales-p2");
    expect([ramal.udAcumuladas, ramal.diametro_mm, ramal.diametroPorCapacidad_mm]).toEqual([14, 110, 75]);
  });

  it("el local de la PB, el garaje del sótano y la cubierta", () => {
    expect(red.locales).toEqual([{ nivel: 0, numero: 1, superficie_m2: 160 }]);
    expect(red.garajes).toEqual([{ nivel: -1, cota_m: -3, plazas: 14, superficie_m2: 420, privado: false }]);
    expect(red.cubierta).toEqual({ tipo: "plana_no_transitable", superficie_m2: 210 });
  });

  it("con la pendiente al 4 % el colector lo sube la bajante, no las unidades", () => {
    const d: DecisionesHs5 = { ...DECISIONES_POR_DEFECTO, pendienteColector_pct: 4 };
    const c = porId(calcHS5(generarRedHs5(e, d).residuales).porTramo, "colector-general");
    expect([c.diametroPorCapacidad_mm, c.diametro_mm, c.capacidad_ud]).toEqual([90, 110, 382]);
    expect(c.elevadoPor).toMatchObject({ causa: "aguas_arriba" });
  });

  it("con la cocina en la bajante de los baños hay una bajante por vivienda", () => {
    const d: DecisionesHs5 = { ...DECISIONES_POR_DEFECTO, bajanteCocina: "con_banos" };
    const red2 = generarRedHs5(e, d);
    expect(red2.verticales.map((v) => v.bajantes.map((b) => [b.id, b.ud]))).toEqual([
      [["bajante-a-unica", 69]],
      [["bajante-b-unica", 66]],
    ]);
    expect(porId(calcHS5(red2.residuales).porTramo, "colector-general").udAcumuladas).toBe(135);
  });

  it("enterrar los colectores con sótano baja la planta base al sótano", () => {
    const red2 = generarRedHs5(e, { ...DECISIONES_POR_DEFECTO, colectores: "enterrado" });
    expect(red2.nivelBase).toBe(-1);
    expect(red2.residuales.tramos[0]).toMatchObject({ id: "colector-general", disposicion: "enterrado" });
  });
});

describe("generarRedHs5 · los otros casos", () => {
  it("plurifamiliar: la vertical A baja desde P3 hasta la PB (4 plantas)", () => {
    const red = generarRedHs5(edificioDeCaso("plurifamiliar"), DECISIONES_POR_DEFECTO);
    const a = red.verticales.find((v) => v.id === "a")!;
    expect(a.niveles).toEqual([0, 1, 2, 3]);
    expect(a.bajantes[0]).toMatchObject({ id: "bajante-a-fecales", plantas: 4, ud: 56 });
    expect(red.verticales.find((v) => v.id === "b")!.niveles).toEqual([1, 2, 3]);
    const r = calcHS5(red.residuales);
    expect(r.veredictoGlobal).toBe("ok");
    expect(porId(r.porTramo, "colector-general").udAcumuladas).toBe(23 * 4 + 22 * 3);
  });

  it("unifamiliar: baños arriba; cocina y aseo abajo, directos al colector enterrado", () => {
    const e = edificioDeCaso("unifamiliar");
    const red = generarRedHs5(e, DECISIONES_POR_DEFECTO);
    expect(decisionesHabituales(e).colectores).toBe("enterrado");
    expect(red.supuestos.unifamiliarPorPlantas).toBe(true);
    const u = red.verticales[0];
    expect(u.bajantes.map((b) => [b.clase, b.id, b.ramales.map((x) => x.nivel)])).toEqual([
      ["fecales", "bajante-u-fecales", [0, 1]],
      ["cocina", null, [0]],
    ]);
    const r = calcHS5(red.residuales);
    expect(r.arbolValido).toBe(true);
    expect(porId(r.porTramo, "ramal-u-cocina-pb").parentId).toBe("colector-general");
    expect(red.garajes).toEqual([{ nivel: 0, cota_m: 0, plazas: 0, superficie_m2: 20, privado: true }]);
  });

  it("oficinas: un núcleo por planta con aparatos de uso público", () => {
    const red = generarRedHs5(edificioDeCaso("oficinas"), DECISIONES_POR_DEFECTO);
    expect(red.residuales.uso).toBe("publico");
    const n = red.verticales[0];
    expect([n.id, n.clase, n.niveles, n.udUnidad]).toEqual(["n", "nucleo_aseos", [1, 2], 28]);
    expect(n.bajantes[0]).toMatchObject({ clase: "aseos", id: "bajante-n-aseos", ud: 56 });
    const r = calcHS5(red.residuales);
    expect(r.veredictoGlobal).toBe("ok");
    expect(red.oficinasSinNucleos).toBe(false);
  });

  it("dos viviendas iguales por planta son dos verticales idénticas (× 2)", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    e.grupos[0].zonas[0].unidades = [{ tipoId: "A", cantidad: 2 }];
    const red = generarRedHs5(e, DECISIONES_POR_DEFECTO);
    expect(red.verticales.map((v) => [v.id, v.instancias])).toEqual([["a", 2]]);
    const r = calcHS5(red.residuales);
    expect(r.porTramo.filter((t) => t.tipo === "bajante").map((t) => t.id)).toEqual(
      expect.arrayContaining(["bajante-a1-fecales", "bajante-a2-fecales"]),
    );
    expect(porId(r.porTramo, "colector-general").udAcumuladas).toBe(23 * 6);
  });

  it("es determinista", () => {
    const e = edificioDeCaso("plurifamiliar");
    expect(generarRedHs5(e, DECISIONES_POR_DEFECTO)).toEqual(generarRedHs5(e, DECISIONES_POR_DEFECTO));
  });
});

describe("generarRedHs5 · altura de las bajantes (Tabla 4.4)", () => {
  it("la bajante de P1–P3 sirve 3 plantas y atraviesa 4 hasta el techo del sótano: envolvente", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const r = calcHS5(generarRedHs5(e, DECISIONES_POR_DEFECTO).residuales);
    expect(porId(r.porTramo, "bajante-a-fecales").bajante).toMatchObject({
      plantas: 3,
      plantasAtravesadas: 4,
      columna: "envolvente",
    });
  });

  it("si sirve y atraviesa 4 plantas, «más de 3»", () => {
    const r = calcHS5(generarRedHs5(edificioDeCaso("plurifamiliar"), DECISIONES_POR_DEFECTO).residuales);
    expect(porId(r.porTramo, "bajante-a-fecales").bajante).toMatchObject({ plantas: 4, plantasAtravesadas: 4, columna: "mas3" });
  });
});
