import { describe, expect, it } from "vitest";
import { CASOS_EDIFICIO, edificioDeCaso } from "../../../lib/edificio/casos";
import { setCuartosZona, setGrifos } from "../../../lib/edificio/editar";
import { calcHS4 } from "../calc";
import { DECISIONES_HS4_POR_DEFECTO, generarRedHs4, type DecisionesHs4 } from "../red";

// =============================================================================
// La red de HS4 deducida de El edificio (feature-15): unidades de consumo con
// su contador, batería o contadores por planta, montantes y cuartos húmedos.
// =============================================================================

function decisiones(parcial: Partial<DecisionesHs4> = {}): DecisionesHs4 {
  return { ...DECISIONES_HS4_POR_DEFECTO, ...parcial };
}

describe("generarRedHs4 · los cuatro casos", () => {
  it.each(CASOS_EDIFICIO.map((c) => c.key))("%s: un árbol válido que el motor dimensiona", (caso) => {
    const red = generarRedHs4(edificioDeCaso(caso), decisiones());
    expect(red.tramos.length).toBeGreaterThan(0);
    const r = calcHS4({ tramos: red.tramos, aparatos: red.aparatos, presionAcometida_kPa: 300, criterioK: "une149201" });
    expect(r.arbolValido).toBe(true);
    expect(r.porAparato.every((a) => a.estado !== "fail" || a.presionResidual_kPa < a.presionMinExigida_kPa)).toBe(true);
    // Todos los aparatos tienen su sitio en el edificio.
    for (const a of red.aparatos) expect(red.puntos[a.id]).toBeDefined();
  });

  it("plurifamiliar con locales: 6 viviendas, el local y las zonas comunes en una batería de 8", () => {
    const red = generarRedHs4(edificioDeCaso("plurifamiliar_locales"), decisiones());
    expect(red.unidades.map((u) => u.nombre)).toEqual(["A1", "B1", "A2", "B2", "A3", "B3"]);
    expect(red.contadores).toEqual({ viviendas: 6, oficinas: 0, locales: 1, comunes: true, total: 8 });
    expect(red.locales).toEqual([{ id: "local-pb", nivel: 0, numero: 1, superficie_m2: 160 }]);
    expect(red.garaje).toBe(true);
    // Un montante por vivienda, desde la batería hasta su planta (PB 4 m → P3 a +10).
    const a3 = red.tramos.find((t) => t.id === "montante-a-p3")!;
    expect(a3.parentId).toBe("alimentacion");
    expect(a3.altura_m).toBe(10);
    // A: 2 baños (lavabo, inodoro, bañera, bidé) y cocina (3) = 11 aparatos.
    expect(red.unidades.find((u) => u.id === "a-p3")!.numAparatos).toBe(11);
    expect(red.unidades.find((u) => u.id === "b-p1")!.numAparatos).toBe(10);
  });

  it("contadores por planta: un montante general por tramos y las viviendas colgando de su planta", () => {
    const red = generarRedHs4(edificioDeCaso("plurifamiliar_locales"), decisiones({ contadores: "por_planta" }));
    expect(red.tramos.filter((t) => t.id.startsWith("montante-p")).map((t) => t.id)).toEqual([
      "montante-p1",
      "montante-p2",
      "montante-p3",
    ]);
    expect(red.tramos.find((t) => t.id === "montante-p1")!.altura_m).toBe(4);
    expect(red.tramos.find((t) => t.id === "montante-p2")!.altura_m).toBe(3);
    expect(red.tramos.find((t) => t.id === "deriv-a-p3")!.parentId).toBe("montante-p3");
    expect(red.unidades.every((u) => u.montanteId === null)).toBe(true);
  });

  it("unifamiliar: contador general, baños arriba por una subida interior, cocina y aseo abajo", () => {
    const red = generarRedHs4(edificioDeCaso("unifamiliar"), decisiones());
    expect(red.unifamiliar).toBe(true);
    expect(red.unidades).toHaveLength(1);
    const u = red.unidades[0];
    expect(u.cuartos.map((c) => [c.nivel, c.cuartos.map((x) => x.clase)])).toEqual([
      [0, ["aseo", "cocina"]],
      [1, ["bano", "bano"]],
    ]);
    expect(red.supuestos.unifamiliarReparto).toBe(true);
    const subida = red.tramos.find((t) => t.id === "u-subida-p1")!;
    expect(subida.parentId).toBe("deriv-u");
    expect(subida.altura_m).toBe(2.8);
    expect(red.contadores.comunes).toBe(false);
  });

  it("oficinas: una unidad por planta con los aseos de sus núcleos y el local previsto", () => {
    const red = generarRedHs4(edificioDeCaso("oficinas"), decisiones());
    expect(red.unidades.map((u) => [u.nombre, u.numAparatos])).toEqual([
      ["Oficinas P1", 8],
      ["Oficinas P2", 8],
    ]);
    expect(red.aparatos.filter((a) => a.id.startsWith("of-p1-")).map((a) => a.tipo).sort()).toEqual([
      ...Array(4).fill("inodoro_cisterna"),
      ...Array(4).fill("lavabo"),
    ]);
    expect(red.contadores.total).toBe(4); // 2 plantas, el local y el vestíbulo
  });

  it("la tubería decide el material; la acometida siempre es de polietileno", () => {
    const cobre = generarRedHs4(edificioDeCaso("plurifamiliar"), decisiones({ tuberia: "cobre" }));
    expect(cobre.material).toBe("metalica");
    expect(cobre.tramos.find((t) => t.id === "acometida")!.material).toBe("termoplastico_multicapa");
    expect(cobre.tramos.filter((t) => t.id !== "acometida").every((t) => t.material === "metalica")).toBe(true);
    const pex = generarRedHs4(edificioDeCaso("plurifamiliar"), decisiones({ tuberia: "pex" }));
    expect(pex.material).toBe("termoplastico_multicapa");
  });

  it("es determinista", () => {
    const e = edificioDeCaso("plurifamiliar");
    expect(generarRedHs4(e, decisiones())).toEqual(generarRedHs4(e, decisiones()));
  });
});

// -----------------------------------------------------------------------------
// feature-18: el reparto de la unifamiliar y los grifos del garaje
// -----------------------------------------------------------------------------

describe("generarRedHs4 · reparto de la unifamiliar y grifos de baldeo", () => {
  const valida = (red: ReturnType<typeof generarRedHs4>) =>
    calcHS4({ tramos: red.tramos, aparatos: red.aparatos, presionAcometida_kPa: 300, criterioK: "une149201" }).arbolValido;

  it("el baño que se dice en la PB va en la PB, y ya no hay supuesto", () => {
    const e = setCuartosZona(edificioDeCaso("unifamiliar"), "z1", { banos: 1 });
    const red = generarRedHs4(setCuartosZona(e, "z2", { banos: 1 }), decisiones());
    expect(red.unidades[0].cuartos.map((c) => [c.nivel, c.cuartos.map((x) => x.etiqueta)])).toEqual([
      [0, ["Baño 2", "Aseo", "Cocina"]],
      [1, ["Baño 1"]],
    ]);
    expect(red.supuestos.unifamiliarReparto).toBe(false);
    expect(valida(red)).toBe(true);
  });

  it("unifamiliar: el grifo del garaje es un cuarto más de la vivienda, tras su contador", () => {
    const red = generarRedHs4(setGrifos(edificioDeCaso("unifamiliar"), "z3", 1), decisiones());
    expect(red.grifosGaraje).toBe(1);
    expect(red.unidades).toHaveLength(1);
    const pb = red.unidades[0].cuartos.find((c) => c.nivel === 0)!;
    expect(pb.cuartos.map((c) => c.clase)).toEqual(["aseo", "cocina", "garaje"]);
    expect(red.aparatos.filter((a) => a.tipo === "grifo_garaje")).toHaveLength(1);
    expect(red.contadores).toMatchObject({ viviendas: 1, comunes: false, total: 1 });
    expect(valida(red)).toBe(true);
  });

  it("plurifamiliar: los grifos del garaje van al contador de servicios comunes", () => {
    const e = setGrifos(edificioDeCaso("plurifamiliar_locales"), "z4", 2);
    const red = generarRedHs4(e, decisiones());
    const c = red.unidades.find((u) => u.clase === "comunes")!;
    expect(c).toMatchObject({ id: "comunes", nivel: -1, numAparatos: 2 });
    expect(red.tramos.find((t) => t.id === "montante-comunes")!.parentId).toBe("alimentacion");
    // Las zonas comunes ya tenían contador: la batería no cambia.
    expect(red.contadores.total).toBe(8);
    expect(valida(red)).toBe(true);
  });

  it("con contadores por planta, los comunes tienen su montante fuera del general", () => {
    const e = setGrifos(edificioDeCaso("plurifamiliar_locales"), "z4", 1);
    const red = generarRedHs4(e, decisiones({ contadores: "por_planta" }));
    expect(red.tramos.find((t) => t.id === "deriv-comunes")!.parentId).toBe("montante-comunes");
    expect(red.tramos.some((t) => t.id === "montante-s1")).toBe(false);
    expect(valida(red)).toBe(true);
  });
});
