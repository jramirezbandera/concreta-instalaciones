import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { CASOS_EDIFICIO, edificioDeCaso } from "../casos";
import { plantasDe, renumerar, resumenEdificio } from "../derivar";
import {
  anadirPlantaArriba,
  anadirSotano,
  anadirTipo,
  anadirZona,
  buscarZona,
  editarTipo,
  eliminarGrupo,
  eliminarTipo,
  eliminarZona,
  separarGrupo,
  setAltura,
  setContador,
  setCubierta,
  setRepeticiones,
  setSuperficie,
  setUnidades,
  setUso,
  usosDeTipo,
} from "../editar";
import type { Edificio } from "../tipos";

// =============================================================================
// Operaciones de edición de El edificio (feature-12): puras, sin mutar la
// entrada, con ids nuevos únicos y niveles siempre recalculados.
// =============================================================================

const LOCALES = edificioDeCaso("plurifamiliar_locales");

function ids(e: Edificio): string[] {
  return [
    ...e.grupos.map((g) => g.id),
    ...e.grupos.flatMap((g) => g.zonas.map((z) => z.id)),
    ...e.unidades.map((u) => u.id),
  ];
}

describe("plantas", () => {
  it("añadir planta arriba copia las zonas de la de más arriba con ids nuevos", () => {
    const { edificio, grupoId } = anadirPlantaArriba(LOCALES);
    expect(edificio.grupos[0].id).toBe(grupoId);
    expect(edificio.grupos[0].nivelInicial).toBe(4);
    expect(edificio.grupos[0].zonas.map((z) => z.uso)).toEqual(["viviendas"]);
    expect(new Set(ids(edificio)).size).toBe(ids(edificio).length);
    expect(resumenEdificio(edificio).numViviendas).toBe(8);
  });

  it("añadir sótano lo pone debajo del último y copia sus zonas", () => {
    const { edificio, grupoId } = anadirSotano(LOCALES);
    const ultimo = edificio.grupos[edificio.grupos.length - 1];
    expect(ultimo.id).toBe(grupoId);
    expect(ultimo.nivelInicial).toBe(-2);
    expect(ultimo.zonas.map((z) => z.uso)).toEqual(["garaje", "trasteros", "instalaciones"]);
  });

  it("sin sótanos, el primero empieza con un garaje", () => {
    const { edificio } = anadirSotano(edificioDeCaso("unifamiliar"));
    expect(edificio.grupos.at(-1)!.zonas.map((z) => z.uso)).toEqual(["garaje"]);
    expect(edificio.grupos.at(-1)!.nivelInicial).toBe(-1);
  });

  it("plantas iguales y altura se acotan", () => {
    expect(setRepeticiones(LOCALES, "g1", 0).grupos[0].repeticiones).toBe(1);
    expect(setRepeticiones(LOCALES, "g1", 99).grupos[0].repeticiones).toBe(30);
    expect(setAltura(LOCALES, "g2", 1).grupos[1].altura_m).toBe(2);
    expect(setAltura(LOCALES, "g2", 3.456).grupos[1].altura_m).toBe(3.46);
    expect(setAltura(LOCALES, "g2", Number.NaN)).toBe(LOCALES);
  });

  it("separar «P1–P3 × 3» da tres plantas sueltas; la de abajo conserva el id", () => {
    const e = separarGrupo(LOCALES, "g1");
    const sueltas = e.grupos.slice(0, 3);
    expect(sueltas.map((g) => [g.nivelInicial, g.repeticiones])).toEqual([
      [3, 1],
      [2, 1],
      [1, 1],
    ]);
    expect(sueltas[2].id).toBe("g1");
    expect(new Set(ids(e)).size).toBe(ids(e).length);
    expect(resumenEdificio(e).numViviendas).toBe(6);
    expect(plantasDe(e).map((p) => p.cota_m)).toEqual(plantasDe(LOCALES).map((p) => p.cota_m));
  });

  it("no se puede eliminar la única planta sobre rasante; un sótano sí", () => {
    const soloPB: Edificio = renumerar({ ...LOCALES, grupos: LOCALES.grupos.slice(1) });
    expect(eliminarGrupo(soloPB, "g2")).toBe(soloPB);
    expect(eliminarGrupo(LOCALES, "g3").grupos.map((g) => g.id)).toEqual(["g1", "g2"]);
  });

  it("eliminar P1–P3 deja la PB como única y conserva los niveles", () => {
    const e = eliminarGrupo(LOCALES, "g1");
    expect(e.grupos.map((g) => g.nivelInicial)).toEqual([0, -1]);
  });
});

describe("zonas", () => {
  it("añadir zona: zona común de 20 m² con id nuevo", () => {
    const { edificio, zonaId } = anadirZona(LOCALES, "g2");
    const z = buscarZona(edificio, zonaId)!.zona;
    expect(z).toEqual({ id: zonaId, uso: "zona_comun", superficieUtil_m2: 20 });
    expect(ids(LOCALES)).not.toContain(zonaId);
  });

  it("no se elimina la única zona de una planta", () => {
    expect(eliminarZona(LOCALES, "z1")).toBe(LOCALES);
    expect(buscarZona(eliminarZona(LOCALES, "z3"), "z3")).toBeNull();
  });

  it("cambiar a viviendas reparte una del primer tipo; a garaje deja plazas y quita unidades", () => {
    const aViviendas = setUso(LOCALES, "z2", "viviendas");
    expect(buscarZona(aViviendas, "z2")!.zona.unidades).toEqual([{ tipoId: "A", cantidad: 1 }]);
    const aGaraje = setUso(LOCALES, "z1", "garaje");
    const z = buscarZona(aGaraje, "z1")!.zona;
    expect(z.unidades).toBeUndefined();
    expect(z.plazas).toBe(10);
  });

  it("cambiar a oficinas sin núcleos crea el núcleo N", () => {
    const e = setUso(LOCALES, "z2", "oficinas");
    expect(e.unidades.some((u) => u.clase === "nucleo_aseos" && u.id === "N")).toBe(true);
    expect(buscarZona(e, "z2")!.zona.unidades).toEqual([{ tipoId: "N", cantidad: 1 }]);
  });

  it("superficie, contador y unidades", () => {
    expect(buscarZona(setSuperficie(LOCALES, "z2", -5), "z2")!.zona.superficieUtil_m2).toBe(0);
    expect(buscarZona(setContador(LOCALES, "z4", "plazas", 20), "z4")!.zona.plazas).toBe(20);
    const mas = setUnidades(LOCALES, "z1", "B", 3);
    expect(buscarZona(mas, "z1")!.zona.unidades).toEqual([
      { tipoId: "A", cantidad: 1 },
      { tipoId: "B", cantidad: 3 },
    ]);
    expect(buscarZona(setUnidades(LOCALES, "z1", "A", 0), "z1")!.zona.unidades).toEqual([
      { tipoId: "B", cantidad: 1 },
    ]);
  });
});

describe("tipos", () => {
  it("añadir tipo de vivienda: siguiente letra libre", () => {
    const { edificio, tipoId } = anadirTipo(LOCALES, "vivienda");
    expect(tipoId).toBe("C");
    expect(edificio.unidades.at(-1)).toMatchObject({ clase: "vivienda", nombre: "C" });
  });

  it("editar acota los contadores", () => {
    const e = editarTipo(LOCALES, "A", { banos: 0, dormitorios: 12 });
    expect(e.unidades[0]).toMatchObject({ banos: 1, dormitorios: 8 });
  });

  it("eliminar un tipo lo quita de sus zonas", () => {
    const e = eliminarTipo(LOCALES, "B");
    expect(e.unidades.map((u) => u.id)).toEqual(["A"]);
    expect(buscarZona(e, "z1")!.zona.unidades).toEqual([{ tipoId: "A", cantidad: 1 }]);
    expect(resumenEdificio(e).numViviendas).toBe(3);
  });

  it("dónde se usa un tipo", () => {
    expect(usosDeTipo(LOCALES, "A")).toEqual({ grupos: ["g1"], total: 3 });
  });
});

describe("cubierta", () => {
  it("cambia el tipo y la superficie", () => {
    const e = setCubierta(LOCALES, { tipo: "plana_transitable", superficie_m2: 180 });
    expect(e.cubierta).toEqual({ tipo: "plana_transitable", superficie_m2: 180 });
    expect(resumenEdificio(e).cubiertaTransitable).toBe(true);
  });
});

describe("invariantes", () => {
  const arbCaso = fc.constantFrom(...CASOS_EDIFICIO.map((c) => c.key));
  const arbOp = fc.constantFrom("planta", "sotano", "zona", "separar", "rep");

  test.prop([arbCaso, fc.array(arbOp, { maxLength: 8 })])(
    "ninguna secuencia de operaciones deja ids repetidos, huecos de nivel ni muta la entrada",
    (caso, ops) => {
      const original = edificioDeCaso(caso);
      const copia = structuredClone(original);
      let e = original;
      for (const op of ops) {
        if (op === "planta") e = anadirPlantaArriba(e).edificio;
        else if (op === "sotano") e = anadirSotano(e).edificio;
        else if (op === "zona") e = anadirZona(e, e.grupos[0].id).edificio;
        else if (op === "separar") e = separarGrupo(e, e.grupos[0].id);
        else e = setRepeticiones(e, e.grupos[0].id, 3);
      }
      expect(original).toEqual(copia);
      expect(new Set(ids(e)).size).toBe(ids(e).length);
      const niveles = plantasDe(e).map((p) => p.nivel);
      for (let i = 1; i < niveles.length; i++) expect(niveles[i - 1] - niveles[i]).toBe(1);
      expect(niveles).toContain(0);
    },
  );
});
