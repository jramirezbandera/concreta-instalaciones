import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio, Zona } from "../../../lib/edificio/tipos";
import { edificioSi } from "../edificio";
import { clasificarRiesgo } from "../riesgo";
import { compartimentar, condicionesLocal, limiteDe } from "../sectores";

// =============================================================================
// DB-SI (feature-19): el núcleo común — uso de cada zona, superficie construida,
// locales de riesgo especial (tabla 2.1) y sectores (tablas 1.1 y 1.2) — con los
// cuatro casos de El edificio. Cifras: research/verificacion-si1-si2.md.
// =============================================================================

function conZona(e: Edificio, id: string, cambio: Partial<Zona>): Edificio {
  return { ...e, grupos: e.grupos.map((g) => ({ ...g, zonas: g.zonas.map((z) => (z.id === id ? { ...z, ...cambio } : z)) })) };
}

describe("edificioSi", () => {
  it("supone la construida (útil × 1,20) si no se indica, y la usa si se indica", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const garaje = edificioSi(e).zonas.find((z) => z.uso === "garaje")!;
    expect(garaje.construida).toEqual({ valor: 504, supuesto: true });
    const dada = edificioSi(conZona(e, garaje.id, { superficieConstruida_m2: 470 })).zonas.find((z) => z.uso === "garaje")!;
    expect(dada.construida).toEqual({ valor: 470, supuesto: false });
  });

  it("alturas de evacuación descendente y ascendente", () => {
    const e = edificioSi(edificioDeCaso("plurifamiliar_locales"));
    expect(e.alturaEvacuacion_m).toBe(10);
    expect(e.alturaAscendente_m).toBe(3);
    expect(e.usoPrincipal).toBe("residencial_vivienda");
  });
});

describe("clasificarRiesgo (tabla 2.1)", () => {
  it("Demo: el garaje es uso Aparcamiento; el cuarto sin tipo, riesgo bajo provisional; los trasteros no", () => {
    const r = clasificarRiesgo(edificioSi(edificioDeCaso("plurifamiliar_locales")));
    expect(r.aparcamiento).toMatchObject({ util_m2: 420, construida_m2: 504, supuesto: false });
    expect(r.locales.map((l) => [l.zona.uso, l.tipo, l.clase, l.supuesto])).toEqual([["instalaciones", "sin_tipo", "bajo", "tipo"]]);
  });

  it("trasteros de 48 m² útiles: riesgo bajo con la construida supuesta (58 m²), marcado", () => {
    const r = clasificarRiesgo(edificioSi(edificioDeCaso("plurifamiliar")));
    expect(r.locales).toHaveLength(1);
    expect(r.locales[0]).toMatchObject({ tipo: "trasteros", clase: "bajo", supuesto: "construida", s_m2: 58 });
  });

  it("con la construida indicada (45 m²), los trasteros no son local de riesgo", () => {
    const e = conZona(edificioDeCaso("plurifamiliar"), "z5", { superficieConstruida_m2: 45 });
    expect(clasificarRiesgo(edificioSi(e)).locales).toEqual([]);
  });

  it("el garaje de la unifamiliar es riesgo bajo en todo caso", () => {
    const r = clasificarRiesgo(edificioSi(edificioDeCaso("unifamiliar")));
    expect(r.aparcamiento).toBeNull();
    expect(r.locales.map((l) => [l.tipo, l.clase])).toEqual([["garaje_unifamiliar", "bajo"]]);
  });

  it("un garaje colectivo de 100 m² construidos o menos es riesgo bajo, no Aparcamiento", () => {
    const e = conZona(edificioDeCaso("plurifamiliar"), "z4", { superficieUtil_m2: 80, superficieConstruida_m2: 95 });
    const r = clasificarRiesgo(edificioSi(e));
    expect(r.aparcamiento).toBeNull();
    expect(r.locales.find((l) => l.tipo === "garaje")?.clase).toBe("bajo");
  });

  it("los cuartos: contadores, ascensor, RITE y RITI bajos; agua no; calderas por potencia; basuras por superficie", () => {
    const base = edificioDeCaso("plurifamiliar_locales");
    const clase = (cambio: Partial<Zona>) => clasificarRiesgo(edificioSi(conZona(base, "z6", cambio))).locales[0] ?? null;
    expect(clase({ cuarto: "contadores_electricidad" })?.clase).toBe("bajo");
    expect(clase({ cuarto: "ascensor" })?.clase).toBe("bajo");
    expect(clase({ cuarto: "sala_maquinas" })?.clase).toBe("bajo");
    expect(clase({ cuarto: "telecomunicaciones" })?.clase).toBe("bajo");
    expect(clase({ cuarto: "agua" })).toBeNull();
    expect(clase({ cuarto: "calderas", potencia_kW: 70 })).toBeNull();
    expect(clase({ cuarto: "calderas", potencia_kW: 150 })?.clase).toBe("bajo");
    expect(clase({ cuarto: "calderas", potencia_kW: 250 })?.clase).toBe("medio");
    expect(clase({ cuarto: "calderas", potencia_kW: 700 })?.clase).toBe("alto");
    expect(clase({ cuarto: "calderas" })).toMatchObject({ clase: "bajo", supuesto: "potencia" });
    // Basuras de 14 m² útiles: 17 m² construidos supuestos → medio, y con la útil sería bajo.
    expect(clase({ cuarto: "residuos" })).toMatchObject({ clase: "medio", supuesto: "construida" });
    expect(clase({ cuarto: "residuos", superficieConstruida_m2: 15 })).toMatchObject({ clase: "bajo", supuesto: null });
  });
});

describe("compartimentar (tablas 1.1 y 1.2)", () => {
  it("Demo: viviendas, garaje y local; el garaje con vestíbulo y EI 120; el local Comercial supuesto, EI 90", () => {
    const c = compartimentar(edificioSi(edificioDeCaso("plurifamiliar_locales")));
    expect(c.sectores.map((s) => [s.id, s.uso])).toEqual([
      ["principal", "residencial"],
      ["garaje", "aparcamiento"],
      ["local-z2", "comercial"],
    ]);
    expect(c.principal.superficie).toEqual({ util_m2: 545, construida_m2: 655, supuesta: true });
    expect(c.principal.porPlantas).toBe(false);
    const garaje = limiteDe(c, c.sectores[1]);
    expect(garaje).toMatchObject({ ei: 120, techo: true, vestibulo: true, puerta_EI2: 30 });
    const local = limiteDe(c, c.sectores[2]);
    expect(c.sectores[2].usoSupuesto).toBe(true);
    expect(local).toMatchObject({ ei: 90, techo: true, vestibulo: false, puerta_EI2: 45 });
  });

  it("el local Administrativo de 500 m² o menos en un edificio de viviendas no precisa ser sector", () => {
    const e = conZona(edificioDeCaso("plurifamiliar_locales"), "z2", { usoPrevisto: "administrativo" });
    const c = compartimentar(edificioSi(e));
    expect(c.sectores.map((s) => s.id)).toEqual(["principal", "garaje"]);
    expect(c.exentas.map((x) => [x.zona.id, x.motivo])).toEqual([["z2", "establecimiento"]]);
  });

  it("nota 2 de la tabla 2.2: el cuarto de riesgo bajo del sótano sube a EI 120 y R 120; su puerta sigue EI2 45-C5", () => {
    const c = compartimentar(edificioSi(edificioDeCaso("plurifamiliar_locales")));
    const l = c.riesgo.locales[0];
    expect(condicionesLocal(c, l)).toMatchObject({ R: 120, EI: 120, puerta_EI2: 45, vestibulo: false, subePorNota2: true });
  });

  it("en la unifamiliar el garaje es local de riesgo bajo con la tabla 2.2 sola: EI 90", () => {
    const c = compartimentar(edificioSi(edificioDeCaso("unifamiliar")));
    expect(c.sectores.map((s) => s.id)).toEqual(["principal"]);
    expect(condicionesLocal(c, c.riesgo.locales[0])).toMatchObject({ R: 90, EI: 90, subePorNota2: false });
  });

  it("más de 2 500 m² de viviendas: por plantas", () => {
    const e = edificioDeCaso("plurifamiliar");
    const grande: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 15 } : g)) };
    const c = compartimentar(edificioSi(grande));
    expect(c.principal.porPlantas).toBe(true);
    expect(c.principal.plantaMayor?.construida_m2).toBeLessThan(2500);
  });

  it("oficinas: el garaje y el local, sectores; las oficinas, el principal", () => {
    const c = compartimentar(edificioSi(edificioDeCaso("oficinas")));
    expect(c.sectores.map((s) => [s.id, s.uso])).toEqual([
      ["principal", "administrativo"],
      ["garaje", "aparcamiento"],
      ["local-z3", "comercial"],
    ]);
  });
});
