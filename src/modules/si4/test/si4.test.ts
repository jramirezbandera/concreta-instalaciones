import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { cambiarZonaSi } from "../../si/editar";
import { si4 } from "../definicion";
import { si4EstadoDefaults } from "../estado";
import { justificarSi4, zonasConstruidaSi4 } from "../justificacion";
import { numeroHidrantes } from "../tablas";

// =============================================================================
// SI 4 · Instalaciones de protección (feature-19): la dotación de la tabla 1.1.
// Cifras: research/verificacion-si4-si6.md, bloque C1.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio) => justificarSi4(si4EstadoDefaults, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio) => con(edificioDeCaso(c));
const exige = (j: ReturnType<typeof con>, id: string) => {
  const d = j.elementos.find((e) => e.id === id)?.detalle;
  return d !== undefined && (d.clase === "dotacion" || d.clase === "hidrantes") && d.exige;
};

describe("SI4", () => {
  it("hidrantes: uno hasta 10.000 m² y uno más por cada 10.000 o fracción", () => {
    expect([5000, 10000, 10001, 20000, 20001].map(numeroHidrantes)).toEqual([1, 1, 2, 2, 3]);
  });

  it("Demo: un extintor por planta y junto al cuarto; BIE y detección por la construida supuesta del garaje", () => {
    const j = caso("plurifamiliar_locales");
    const ext = j.elementos.find((e) => e.id === "extintores")!.detalle;
    expect(ext.clase === "extintores" && [ext.plantas.map((p) => p.etiqueta), ext.total]).toEqual([["P3", "P2", "P1", "PB", "S1"], 6]);
    expect(exige(j, "bie")).toBe(true);
    expect(exige(j, "deteccion")).toBe(true);
    expect(j.avisos.map((a) => a.id)).toEqual(["construida-garaje"]);
    expect(si4.textoAviso(j.avisos[0]).titulo).toBe("La superficie construida del garaje decide bocas de incendio equipadas y detección de incendio.");
    expect(zonasConstruidaSi4(j).map((z) => z.id)).toEqual(["z4"]);
  });

  it("con 470 m² construidos el garaje no lleva BIE ni detección por la tabla, pero sí la que pide SI 3", () => {
    const j = con(cambiarZonaSi(edificioDeCaso("plurifamiliar_locales"), "z4", { superficieConstruida_m2: 470 }));
    expect(exige(j, "bie")).toBe(false);
    expect(exige(j, "deteccion")).toBe(false);
    expect(j.avisos).toEqual([]);
    expect(si4.frase(j)).toMatch(/detección en el garaje para su ventilación \(SI 3\)/);
  });

  it("unifamiliar: un extintor, el de su garaje", () => {
    const j = caso("unifamiliar");
    expect(si4.frase(j)).toBe("1 extintor 21A-113B como mínimo; no se exigen BIE, columna seca, detección ni hidrantes.");
  });

  it("más de 24 m: columna seca; dos sótanos de 3,10 m: hidrante por la altura ascendente", () => {
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 9 } : g)) };
    expect(exige(con(alto), "columna")).toBe(true);
    const hondo: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g3" ? { ...g, repeticiones: 2, altura_m: 3.1 } : g)) };
    expect(exige(con(hondo), "hidrantes")).toBe(true);
  });

  it("la memoria enumera lo que no se exige", () => {
    const t = textoPlanoMemoria(si4.memoria(caso("plurifamiliar")));
    expect(t).toMatch(/Conforme a la tabla 1\.1, no se requieren columna seca, hidrantes exteriores y extinción automática\./);
  });
});
