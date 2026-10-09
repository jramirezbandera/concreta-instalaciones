import { describe, it, expect } from "vitest";
import { alcanceDeEdificio, obraDeZona, soloZonas, tiposDeObra } from "../alcance";
import { edificioDeCaso } from "../../edificio/casos";
import type { Edificio, ObraZona, UsoZona } from "../../edificio/tipos";
import type { DatosGenerales } from "../tipos";

// =============================================================================
// Alcance de una obra en un edificio existente (feature-27, paso 1): lo que
// El edificio dice por la marca de cada zona.
// =============================================================================

function datos(o: Partial<DatosGenerales> = {}): DatosGenerales {
  return {
    municipio: "Cáceres",
    provincia: "Cáceres",
    altitud_m: 459,
    intervencion: "reforma",
    tienePiscina: false,
    zonaRadon: "I",
    ...o,
  };
}

/** La plurifamiliar con local en PB, con marcas por id de zona. */
function marcado(marcas: Record<string, ObraZona | [ObraZona, UsoZona]>): Edificio {
  const e = edificioDeCaso("plurifamiliar_locales");
  for (const g of e.grupos) {
    for (const z of g.zonas) {
      const m = marcas[z.id];
      if (m === undefined) continue;
      if (Array.isArray(m)) {
        z.obra = m[0];
        z.usoAnterior = m[1];
      } else {
        z.obra = m;
      }
    }
  }
  return e;
}

describe("tiposDeObra", () => {
  it("obra nueva no tiene tipos, aunque el alcance diga otra cosa", () => {
    expect(tiposDeObra(datos({ intervencion: "obra_nueva", alcance: { tipos: ["reforma"] } }))).toEqual([]);
  });

  it("sin asistente, el de «Tipo de intervención»", () => {
    expect(tiposDeObra(datos({ intervencion: "ampliacion" }))).toEqual(["ampliacion"]);
  });

  it("con asistente, los marcados, sin repetir", () => {
    const dg = datos({ alcance: { tipos: ["reforma", "ampliacion", "reforma"] } });
    expect(tiposDeObra(dg)).toEqual(["reforma", "ampliacion"]);
  });

  it("con la lista vacía, vuelve al de «Tipo de intervención»", () => {
    expect(tiposDeObra(datos({ intervencion: "cambio_uso", alcance: { tipos: [] } }))).toEqual(["cambio_uso"]);
  });
});

describe("obraDeZona", () => {
  const z = { id: "z", uso: "viviendas" as const, superficieUtil_m2: 90 };

  it("en obra nueva todo es nuevo, aunque la zona tenga marca", () => {
    expect(obraDeZona({ ...z, obra: "existente" }, "obra_nueva")).toBe("nueva");
  });

  it("en un edificio existente, sin marca cuenta como reformada", () => {
    expect(obraDeZona(z, "reforma")).toBe("reformada");
    expect(obraDeZona({ ...z, obra: "existente" }, "reforma")).toBe("existente");
  });
});

describe("soloZonas", () => {
  it("quita zonas y conserva los grupos", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const r = soloZonas(e, (z) => z.uso === "garaje");
    expect(r.grupos).toHaveLength(e.grupos.length);
    expect(r.grupos.flatMap((g) => g.zonas.map((z) => z.uso))).toEqual(["garaje"]);
    expect(e.grupos.flatMap((g) => g.zonas)).not.toHaveLength(1);
  });
});

describe("alcanceDeEdificio", () => {
  it("sin marcas: nada ampliado, todo existente, sin cambios de uso", () => {
    const a = alcanceDeEdificio(datos(), edificioDeCaso("plurifamiliar_locales"));
    expect(a.marcado).toBe(false);
    expect(a.ampliada.util_m2).toBe(0);
    expect(a.existente.util_m2).toBeGreaterThan(0);
    expect(a.cambiosUso).toEqual([]);
    expect(a.intervieneLocalesHs3).toBe(true);
    expect(a.demandaAcs.inicial_l_d).toBe(a.demandaAcs.final_l_d);
  });

  it("las zonas nuevas son la ampliación, y su demanda de ACS se suma a la inicial", () => {
    const todo = alcanceDeEdificio(datos(), edificioDeCaso("plurifamiliar_locales"));
    const a = alcanceDeEdificio(datos({ intervencion: "ampliacion" }), marcado({ z1: "nueva" }));
    expect(a.marcado).toBe(true);
    expect(a.ampliada.util_m2).toBeGreaterThan(0);
    expect(a.ampliada.util_m2 + a.existente.util_m2).toBe(todo.existente.util_m2);
    expect(a.ampliada.construida_m2).toBeGreaterThanOrEqual(a.ampliada.util_m2);
    expect(a.demandaAcs.inicial_l_d).toBeLessThan(a.demandaAcs.final_l_d);
  });

  it("el local que pasa a vivienda en un edificio de viviendas", () => {
    const e = marcado({ z1: "existente", z2: ["cambia_uso", "local_sin_uso"] });
    e.grupos.find((g) => g.zonas.some((z) => z.id === "z2"))!.zonas.find((z) => z.id === "z2")!.uso = "viviendas";
    const a = alcanceDeEdificio(datos({ intervencion: "cambio_uso" }), e);
    expect(a.cambiosUso).toEqual([{ zonaId: "z2", uso: "viviendas", usoAnterior: "local_sin_uso", util_m2: 160 }]);
    expect(a.utilCambioUso_m2).toBe(160);
    expect(a.pasaAVivienda).toBe(true);
    expect(a.viviendaEnEdificioDeViviendas).toBe(true);
    expect(a.pasaARecintoActividad).toBe(false);
  });

  it("el local que pasa a oficinas es un recinto de actividad para el DB-HR", () => {
    const e = marcado({ z2: ["cambia_uso", "local_sin_uso"] });
    e.grupos.find((g) => g.zonas.some((z) => z.id === "z2"))!.zonas.find((z) => z.id === "z2")!.uso = "oficinas";
    const a = alcanceDeEdificio(datos({ intervencion: "cambio_uso" }), e);
    expect(a.pasaAVivienda).toBe(false);
    expect(a.pasaARecintoActividad).toBe(true);
  });

  it("si solo se toca el local, no se interviene en locales de HS 3", () => {
    const a = alcanceDeEdificio(datos(), marcado({ z1: "existente", z4: "existente", z5: "existente", z2: "reformada" }));
    expect(a.intervieneLocalesHs3).toBe(false);
  });

  it("en obra nueva las marcas no cuentan", () => {
    const a = alcanceDeEdificio(datos({ intervencion: "obra_nueva" }), marcado({ z1: "existente" }));
    expect(a.marcado).toBe(false);
    expect(a.existente.util_m2).toBe(0);
  });
});
