import { describe, it, expect } from "vitest";
import { evaluarExpediente } from "../evaluar";
import { ALCANCE_MODULO, edificioParaModulo, obraDeCaso, proyectoParaModulo } from "../../proyecto/alcance";
import { edificioDeCaso } from "../../edificio/casos";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { ObraZona } from "../../edificio/tipos";
import type { JustificacionKey, Proyecto } from "../../proyecto/tipos";

// =============================================================================
// Los módulos calculan lo intervenido (feature-27, paso 6): sin las zonas
// existentes que no se tocan, salvo las exigencias del conjunto del edificio.
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-09T10:00:00.000Z");

/** El Demo como reforma, con marcas por id de zona. */
function reforma(marcas: Record<string, ObraZona>): Proyecto {
  const p = demo();
  p.datosGenerales = { ...p.datosGenerales, intervencion: "reforma", alcance: {} };
  for (const g of p.edificio.grupos) for (const z of g.zonas) if (marcas[z.id]) z.obra = marcas[z.id];
  return p;
}

const ids = (p: Proyecto): string[] => p.edificio.grupos.flatMap((g) => g.zonas.map((z) => z.id));

describe("edificioParaModulo", () => {
  it("en obra nueva devuelve el mismo edificio, aunque haya marcas", () => {
    const p = demo();
    for (const g of p.edificio.grupos) for (const z of g.zonas) z.obra = "existente";
    for (const k of Object.keys(ALCANCE_MODULO) as JustificacionKey[]) {
      expect(edificioParaModulo(p.datosGenerales, p.edificio, k)).toBe(p.edificio);
    }
  });

  it("sin zonas sin tocar devuelve el mismo proyecto", () => {
    const p = reforma({});
    expect(proyectoParaModulo(p, "hs4")).toBe(p);
  });

  it("quita lo existente a lo intervenido; SI 3 conserva las zonas comunes; SI 4 lo ve todo", () => {
    const p = reforma(Object.fromEntries(ids(demo()).map((id) => [id, "existente" as ObraZona])));
    const primera = ids(demo())[0];
    p.edificio.grupos[0].zonas[0].obra = "reformada";
    expect(ids(proyectoParaModulo(p, "hs4"))).toEqual([primera]);
    const si3 = proyectoParaModulo(p, "si3").edificio.grupos.flatMap((g) => g.zonas.map((z) => z.uso));
    expect(si3).toContain("zona_comun");
    expect(proyectoParaModulo(p, "si4")).toBe(p);
    expect(proyectoParaModulo(p, "sua8")).toBe(p);
    expect(proyectoParaModulo(p, "hs4").edificio.grupos).toHaveLength(p.edificio.grupos.length);
  });
});

describe("ningún módulo se rompe al calcular lo intervenido", () => {
  const todas = ids(demo());
  const casos: [string, Record<string, ObraZona>][] = [
    ["nada sin tocar", {}],
    ["todo sin tocar", Object.fromEntries(todas.map((id) => [id, "existente" as ObraZona]))],
    ...todas.map((id): [string, Record<string, ObraZona>] => [
      `solo se toca ${id}`,
      Object.fromEntries(todas.filter((x) => x !== id).map((x) => [x, "existente" as ObraZona])),
    ]),
    ...todas.map((id): [string, Record<string, ObraZona>] => [`${id} sin tocar`, { [id]: "existente" }]),
  ];

  it.each(casos)("%s", (_n, marcas) => {
    const ev = evaluarExpediente(reforma(marcas));
    for (const [k, e] of Object.entries(ev.porClave)) {
      expect(e?.estado, k).not.toBe("error");
    }
  });

  it("todo sin tocar: lo que es de lo intervenido no tiene nada que calcular", () => {
    const ev = evaluarExpediente(reforma(Object.fromEntries(todas.map((id) => [id, "existente" as ObraZona]))));
    expect(ev.porClave.hs4?.estado).toBe("sin_datos");
    // HS 3 ni siquiera aplica: no se interviene en locales de su ámbito.
    expect(ev.porClave.hs3?.estado).toBe("no_aplica");
  });
});

describe("el ejemplo de reforma «local a vivienda»", () => {
  function ejemplo(): Proyecto {
    const p = demo();
    p.edificio = edificioDeCaso("reforma_local_vivienda");
    p.justificaciones = {};
    p.datosGenerales = { ...p.datosGenerales, ...obraDeCaso("reforma_local_vivienda") };
    return p;
  }

  it("solo el ejemplo trae datos de la obra", () => {
    expect(obraDeCaso("plurifamiliar_locales")).toBeNull();
    expect(obraDeCaso("reforma_local_vivienda")?.intervencion).toBe("cambio_uso");
  });

  it("propone lo esperable y ningún módulo falla", () => {
    const ev = evaluarExpediente(ejemplo());
    for (const [k, e] of Object.entries(ev.porClave)) expect(e?.estado, k).not.toBe("error");
    const ap = (k: JustificacionKey) => ev.porClave[k]?.aplicabilidad;
    expect(ap("hr")).toBe("aplica_reformado");
    expect(ap("hs4")).toBe("aplica_reformado");
    expect(ap("he4")).toBe("no_aplica");
    expect(ap("dbse")).toBe("no_aplica");
    expect(ap("sua8")).toBe("aplica");
  });

  it("HS 4 calcula solo la vivienda nueva", () => {
    const p = proyectoParaModulo(ejemplo(), "hs4");
    expect(ids(p)).toEqual(["z2", "z3"]);
  });
});
