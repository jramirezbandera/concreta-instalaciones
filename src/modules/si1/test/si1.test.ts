import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { cambiarZonaSi } from "../../si/editar";
import { si1 } from "../definicion";
import { si1EstadoDefaults } from "../estado";
import { justificarSi1, zonasConstruidaSi1 } from "../justificacion";

// =============================================================================
// SI 1 · Propagación interior (feature-19): sectores, lo que los separa, los
// locales de riesgo especial y la reacción al fuego, con los cuatro casos de El
// edificio. Cifras: research/verificacion-si1-si2.md.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio) => justificarSi1(si1EstadoDefaults, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio) => con(edificioDeCaso(c));

describe("SI1 · justificación", () => {
  it("Demo: viviendas, garaje y local; el local Comercial supuesto y el cuarto sin tipo, avisados", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.elementos.map((e) => `${e.id}:${e.veredicto}`)).toEqual([
      "sector-principal:ok",
      "sector-garaje:ok",
      "sector-local-z2:ok",
      "entre-viviendas:ok",
      "local-z6:ok",
      "local-z5:ok",
      "reaccion:ok",
    ]);
    expect(j.avisos.map((a) => a.id)).toEqual(["uso-local-z2", "cuarto-z6"]);
    expect(si1.frase(j)).toBe(
      "Las viviendas forman un sector de 655 m²; el garaje (EI 120) y el local (EI 90) son sectores propios; un local de riesgo especial bajo.",
    );
  });

  it("decidir el cuarto y el uso del local quita los avisos; un cuarto de agua no es local de riesgo", () => {
    let e = edificioDeCaso("plurifamiliar_locales");
    e = cambiarZonaSi(e, "z6", { cuarto: "agua" });
    e = cambiarZonaSi(e, "z2", { usoPrevisto: "comercial" });
    const j = con(e);
    expect(j.avisos).toEqual([]);
    expect(j.elementos.find((x) => x.id === "local-z6")?.detalle.clase).toBe("no_local");
  });

  it("los trasteros de 48 m² útiles dependen de la construida y lo piden; con 45 m² dejan de ser local", () => {
    const j = caso("plurifamiliar");
    expect(j.avisos.map((a) => a.id)).toEqual(["construida-z5"]);
    expect(zonasConstruidaSi1(j).map((z) => z.id)).toEqual(["z5"]);
    const k = con(cambiarZonaSi(edificioDeCaso("plurifamiliar"), "z5", { superficieConstruida_m2: 45 }));
    expect(k.avisos).toEqual([]);
    expect(k.elementos.find((x) => x.id === "local-z5")?.detalle.clase).toBe("no_local");
  });

  it("unifamiliar: un único sector y el garaje, local de riesgo bajo con la tabla 2.2 sola", () => {
    const j = caso("unifamiliar");
    expect(si1.frase(j)).toBe("La vivienda es un único sector; un local de riesgo especial bajo.");
    const garaje = j.elementos.find((x) => x.detalle.clase === "local");
    expect(garaje && garaje.detalle.clase === "local" && garaje.detalle.condiciones).toMatchObject({ R: 90, EI: 90, puerta_EI2: 45 });
    expect(j.elementos.some((x) => x.id === "entre-viviendas")).toBe(false);
  });

  it("más de 2.500 m² de viviendas: por plantas, con aviso; una planta enorme no cumple", () => {
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 15 } : g)) };
    const j = con(alto);
    expect(j.avisos.map((a) => a.id)).toContain("por-plantas");
    expect(j.veredicto).toBe("ok");
    const enorme: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, zonas: g.zonas.map((z) => ({ ...z, superficieUtil_m2: 2300 })) } : g)) };
    const k = con(enorme);
    expect(k.veredicto).toBe("fail");
    expect(si1.textoIncumplimiento(k.elementos[0])?.titulo).toMatch(/excede de 2\.500 m²/);
  });
});

describe("SI1 · textos, memoria y ficha", () => {
  it("la memoria cita la tabla 1.2 y redacta el vestíbulo del garaje", () => {
    const t = textoPlanoMemoria(si1.memoria(caso("plurifamiliar_locales")));
    expect(t).toMatch(/los elementos que separan el garaje del resto del edificio son EI 120, con techo REI 120, y el vestíbulo de independencia tiene paredes EI 120 y dos puertas EI2 30-C5/);
    expect(t).toMatch(/C-s2,d0 \/ EFL/);
  });

  it("la ficha lleva los datos de partida supuestos y una fila por elemento", () => {
    const j = caso("plurifamiliar_locales");
    const f = si1.ficha(j, { estado: si1EstadoDefaults, edificio: edificioDeCaso("plurifamiliar_locales"), revisados: [], svg: { nativeW: 640, nativeH: 400 } });
    expect(f.verificaciones).toHaveLength(j.elementos.length);
    expect(f.datosPartida.map((d) => d.valor)).toContain("Sin definir: riesgo bajo provisional");
    expect(f.edicionDB).toBe("DB-SI (consolidado 4-mar-2025)");
  });

  it("el dibujo pone una etiqueta a cada sector y local, y líneas entre compartimentos", () => {
    const j = caso("plurifamiliar_locales");
    const d = si1.dibujo(j, edificioDeCaso("plurifamiliar_locales"));
    const ids = new Set(d.etiquetas.map((e) => e.elementoId));
    for (const id of ["sector-principal", "sector-garaje", "sector-local-z2", "local-z6", "local-z5"]) expect(ids.has(id), id).toBe(true);
    expect(d.marcas.some((m) => m.tipo === "linea" && m.elementoId === "sector-garaje")).toBe(true);
  });
});
