import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../casos";
import { anadirPlantaArriba, editarTipo, setCuartosZona, setGrifos, setUso } from "../editar";
import { repartirCuartos, repartoUnifamiliar, textoReparto } from "../reparto";
import type { Edificio } from "../tipos";

// =============================================================================
// Dónde están los cuartos húmedos de la unifamiliar (feature-18): el reparto
// supuesto, el que dice cada zona, y las ediciones que lo mantienen cuadrado con
// la vivienda tipo. Caso: la unifamiliar de la maqueta, T4 con 2 baños y 1 aseo,
// P1 (z1) y PB (z2, con el garaje privado z3).
// =============================================================================

const U = () => edificioDeCaso("unifamiliar");

function conCuartos(e: Edificio, cuartos: Record<string, { banos: number; aseos: number; cocina: boolean }>): Edificio {
  return {
    ...e,
    grupos: e.grupos.map((g) => ({
      ...g,
      zonas: g.zonas.map((z) => (cuartos[z.id] ? { ...z, cuartos: cuartos[z.id] } : z)),
    })),
  };
}

const tipoDe = (e: Edificio) => e.unidades.find((u) => u.clase === "vivienda")!;

describe("repartoUnifamiliar", () => {
  it("sin dato: los baños arriba, la cocina y el aseo abajo, y se avisa", () => {
    const r = repartoUnifamiliar(U())!;
    expect(r.plantas).toEqual([
      { nivel: 0, banos: 0, aseos: 1, cocina: true },
      { nivel: 1, banos: 2, aseos: 0, cocina: false },
    ]);
    expect(r.explicito).toBe(false);
    expect(r.supuesto).toBe(true);
    expect(textoReparto(r)).toBe("P1: 2 baños · PB: 1 aseo y cocina");
  });

  it("en una sola planta todo va en ella y no hay nada que suponer", () => {
    const e = U();
    const una: Edificio = { ...e, grupos: e.grupos.filter((g) => g.id === "g2") };
    const r = repartoUnifamiliar(una)!;
    expect(r.plantas).toEqual([{ nivel: 0, banos: 2, aseos: 1, cocina: true }]);
    expect(r.supuesto).toBe(false);
  });

  it("con dato que cuadra: manda el dato y no se avisa", () => {
    const e = conCuartos(U(), {
      z1: { banos: 1, aseos: 0, cocina: false },
      z2: { banos: 1, aseos: 1, cocina: true },
    });
    const r = repartoUnifamiliar(e)!;
    expect(r.plantas).toEqual([
      { nivel: 0, banos: 1, aseos: 1, cocina: true },
      { nivel: 1, banos: 1, aseos: 0, cocina: false },
    ]);
    expect(r.supuesto).toBe(false);
  });

  it("lo que falta va a la planta de la regla entre las zonas sin dato", () => {
    // PB dice 1 baño, el aseo y la cocina; P1 no dice nada: el otro baño, arriba.
    const r = repartoUnifamiliar(conCuartos(U(), { z2: { banos: 1, aseos: 1, cocina: true } }))!;
    expect(r.plantas.find((p) => p.nivel === 1)).toEqual({ nivel: 1, banos: 1, aseos: 0, cocina: false });
    expect(r.supuesto).toBe(true);
  });

  it("lo que sobra se quita lejos de la planta de la regla; la cocina, la más baja", () => {
    const e = conCuartos(U(), {
      z1: { banos: 2, aseos: 1, cocina: true },
      z2: { banos: 2, aseos: 1, cocina: true },
    });
    const r = repartoUnifamiliar(e)!;
    // Baños: sobran 2, se quitan de abajo. Aseos: sobra 1, se quita de arriba.
    expect(r.plantas).toEqual([
      { nivel: 0, banos: 0, aseos: 1, cocina: true },
      { nivel: 1, banos: 2, aseos: 0, cocina: false },
    ]);
    expect(r.supuesto).toBe(true);
  });

  it("repartirCuartos numera los baños de arriba abajo y deja fuera las plantas vacías", () => {
    const cuartos = [
      { clase: "bano", n: "Baño 1" },
      { clase: "bano", n: "Baño 2" },
      { clase: "aseo", n: "Aseo" },
      { clase: "cocina", n: "Cocina" },
    ];
    const g = repartirCuartos(cuartos, [
      { nivel: 0, banos: 1, aseos: 1, cocina: true },
      { nivel: 1, banos: 1, aseos: 0, cocina: false },
      { nivel: 2, banos: 0, aseos: 0, cocina: false },
    ]);
    expect(g.map((x) => [x.nivel, x.cuartos.map((c) => c.n)])).toEqual([
      [0, ["Baño 2", "Aseo", "Cocina"]],
      [1, ["Baño 1"]],
    ]);
  });
});

describe("setCuartosZona", () => {
  it("bajar un baño a la PB lo añade a la vivienda; quitarlo de arriba lo mueve", () => {
    let e = setCuartosZona(U(), "z2", { banos: 1 });
    expect(tipoDe(e)).toMatchObject({ banos: 3, aseos: 1 });
    expect(repartoUnifamiliar(e)!.supuesto).toBe(false);
    e = setCuartosZona(e, "z1", { banos: 1 });
    expect(tipoDe(e)).toMatchObject({ banos: 2 });
    expect(textoReparto(repartoUnifamiliar(e)!)).toBe("P1: 1 baño · PB: 1 baño, 1 aseo y cocina");
  });

  it("la cocina es una: traerla a una zona la quita de la otra", () => {
    const e = setCuartosZona(U(), "z1", { cocina: true });
    const r = repartoUnifamiliar(e)!;
    expect(r.porZona.get("z1")!.cocina).toBe(true);
    expect(r.porZona.get("z2")!.cocina).toBe(false);
  });

  it("no deja la vivienda sin baño ni pasa de los límites", () => {
    // Quitar los dos baños de arriba dejaría la vivienda sin baño: no se aplica.
    const base = U();
    expect(setCuartosZona(base, "z1", { banos: 0 })).toBe(base);
    expect(tipoDe(setCuartosZona(U(), "z2", { aseos: 9 })).aseos).toBe(4);
  });

  it("cambiar la vivienda tipo después vuelve a ser un supuesto", () => {
    const e = editarTipo(setCuartosZona(U(), "z2", { banos: 1 }), tipoDe(U()).id, { banos: 4 });
    const r = repartoUnifamiliar(e)!;
    expect(r.supuesto).toBe(true);
    // El que falta va a la planta de la regla (la más alta).
    expect(r.plantas.find((p) => p.nivel === 1)!.banos).toBe(3);
  });

  it("una planta nueva no copia los cuartos, y cambiar de uso los quita", () => {
    const fijado = setCuartosZona(U(), "z1", { banos: 2 });
    const { edificio } = anadirPlantaArriba(fijado);
    const nueva = edificio.grupos[0].zonas[0];
    expect(nueva.uso).toBe("vivienda_unifamiliar");
    expect(nueva.cuartos).toBeUndefined();
    expect(repartoUnifamiliar(edificio)!.plantas.find((p) => p.nivel === 2)).toMatchObject({ banos: 0, aseos: 0 });
    const otro = setUso(fijado, "z1", "trasteros");
    expect(otro.grupos[0].zonas[0].cuartos).toBeUndefined();
  });
});

describe("setGrifos", () => {
  it("solo en garajes, de 0 a 20", () => {
    const e = setGrifos(U(), "z3", 2);
    expect(e.grupos[1].zonas.find((z) => z.id === "z3")!.grifos).toBe(2);
    expect(setGrifos(U(), "z1", 2)).toEqual(U());
    expect(setGrifos(U(), "z3", 99).grupos[1].zonas.find((z) => z.id === "z3")!.grifos).toBe(20);
    // Pasar de garaje privado a garaje los conserva; a otra cosa, no.
    expect(setUso(e, "z3", "garaje").grupos[1].zonas.find((z) => z.id === "z3")!.grifos).toBe(2);
    expect(setUso(e, "z3", "trasteros").grupos[1].zonas.find((z) => z.id === "z3")!.grifos).toBeUndefined();
  });
});
