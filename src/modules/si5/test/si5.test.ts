import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { si5 } from "../definicion";
import { si5EstadoDefaults, type Si5Estado } from "../estado";
import { justificarSi5 } from "../justificacion";
import { separacionMaxFachada } from "../tablas";

// =============================================================================
// SI 5 · Intervención de los bomberos (feature-19). Cifras:
// research/verificacion-si4-si6.md, bloque C3.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio, estado: Partial<Si5Estado> = {}) => justificarSi5({ ...si5EstadoDefaults, ...estado }, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Si5Estado> = {}) => con(edificioDeCaso(c), estado);

describe("SI5", () => {
  it("la separación del camión: 23 m hasta 15 m, 18 hasta 20 y 10 por encima", () => {
    expect([9.5, 15, 15.01, 20, 20.01, 40].map(separacionMaxFachada)).toEqual([23, 23, 18, 18, 10, 10]);
  });

  it("con 9,00 m de altura de evacuación no se exige; con 10 m sí (estricto)", () => {
    expect(caso("plurifamiliar").exige).toBe(false);
    const j = caso("plurifamiliar_locales");
    expect(j.exige).toBe(true);
    expect(j.elementos.map((e) => e.id)).toEqual(["altura", "maniobra", "vial", "fachada"]);
  });

  it("la unifamiliar no tiene orígenes de evacuación: no se exige", () => {
    const j = caso("unifamiliar");
    expect(j.exige).toBe(false);
    expect(si5.frase(j)).toMatch(/^Vivienda unifamiliar/);
  });

  it("rejas por encima de 9 m: no cumple y el arreglo vuelve a lo habitual", () => {
    const j = caso("plurifamiliar_locales", { rejas: "todas" });
    const f = j.elementos.find((e) => e.id === "fachada")!;
    expect(f.veredicto).toBe("fail");
    expect(si5.textoIncumplimiento(f)?.detalle).toMatch(/P3/);
    expect(si5.arreglo?.(f, j)).toEqual({ etiqueta: "Rejas solo hasta 9 m", cambios: { rejas: "habitual" } });
  });

  it("la calle que no cumple no se exige al proyecto: queda fuera y se avisa", () => {
    const j = caso("plurifamiliar_locales", { maniobra: "calle_no_cumple" });
    expect(j.elementos.find((e) => e.id === "maniobra")?.veredicto).toBe("fuera");
    expect(j.avisos.map((a) => a.id)).toEqual(["calle-no-cumple"]);
    expect(j.veredicto).toBe("ok");
  });

  it("la memoria redacta las condiciones del espacio de maniobra y de la fachada", () => {
    const t = textoPlanoMemoria(si5.memoria(caso("plurifamiliar_locales")));
    expect(t).toMatch(/separación máxima del vehículo de bomberos a la fachada de 23 m/);
    expect(t).toMatch(/0,8 m × 1,2 m/);
  });
});
