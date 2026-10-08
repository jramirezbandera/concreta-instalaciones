import { describe, expect, it } from "vitest";
import { setCerramientos, setPlantaBajaDistinta } from "../../../lib/constructivo/cerramientos";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { hr } from "../definicion";
import { hrEstadoDefaults } from "../estado";
import { justificarHr, type DetalleHr, type JustificacionHr } from "../justificacion";

// =============================================================================
// HR lee los cerramientos de El edificio (feature-26, paso 4): la fachada, la
// ventana, la cubierta y el forjado, con sus valores propios, y la fachada y la
// ventana de la planta baja con los recintos de la planta 0 (K-CER.1).
// =============================================================================

const demo = crearProyectoDemo("2026-10-08T10:00:00.000Z");
const justificar = (edificio: Edificio): JustificacionHr =>
  justificarHr({ ...hrEstadoDefaults }, { edificio, datosGenerales: demo.datosGenerales, justificaciones: {} });
const detalle = <C extends DetalleHr["clase"]>(j: JustificacionHr, id: string) =>
  j.elementos.find((e) => e.id === id)?.detalle as Extract<DetalleHr, { clase: C }> | undefined;
const ids = (j: JustificacionHr) => j.elementos.map((e) => e.id);

describe("HR · los cerramientos de El edificio (feature-26)", () => {
  it("sin indicarlos, los habituales: F 3.2 vale lo que valía F 3.1 y no cambia el veredicto", () => {
    const j = justificar(demo.edificio);
    expect(j.veredicto).toBe("ok");
    const f = detalle<"exterior">(j, "fachada-dormitorios")!;
    expect(f.ciega).toMatchObject({ codigo: "F 3.2", RAtr: 45 });
    expect(f.hueco).toMatchObject({ codigo: "4.3.2", ventanaRAtr: 30 });
    // La no transitable es C 5.3: el mismo RA,tr que C 1.3, el forjado + 2 dBA por las pendientes.
    expect(detalle<"exterior">(j, "cubierta")?.ciega).toMatchObject({ codigo: "C 5.3", RAtr: 52 });
  });

  it("la fachada elegida en El edificio es la parte ciega y el flanco de las separaciones", () => {
    const e = setCerramientos(demo.edificio, { fachada: { id: "fa-sate-lp115" } });
    const j = justificar(e);
    expect(detalle<"exterior">(j, "fachada-dormitorios")?.ciega).toMatchObject({ codigo: "F 4.1", RAtr: 39 });
    // Como flanco: con P3.2 (tipo 2), la fachada de una hoja pide m ≥ 225 y RA ≥ 50, y la de ½ pie no llega.
    const sv = detalle<"vertical">(j, "separacion")!;
    expect(sv.r.cumple).toBe(false);
    expect(sv.r.flancos).toEqual([{ texto: "Fachada de una hoja: m 161 kg/m², RA 42 dBA; m ≥ 225 kg/m² y RA ≥ 50 dBA", cumple: false }]);
    expect(detalle<"vertical">(justificar(demo.edificio), "separacion")?.r.cumple).toBe(true);
  });

  it("los valores propios se guardan en la elección de El edificio", () => {
    const e = setCerramientos(demo.edificio, { fachada: { id: "fa-enf-lp115-c-at-lhd70", valores: { RAtr: 50 } } });
    const f = detalle<"exterior">(justificar(e), "fachada-dormitorios")!;
    expect(f.ciega).toMatchObject({ RAtr: 50, propios: true });
  });

  it("el forjado de El edificio es el de las tablas 3.3", () => {
    const e = setCerramientos(demo.edificio, { forjado: { id: "losa-ha-250" } });
    expect(detalle<"horizontal">(justificar(e), "forjado-viviendas")?.forjado).toMatchObject({ m: 625, RA: 64 });
  });

  it("la cubierta toma el RA,tr de su forjado (+ 2 con pendientes de hormigón ligero, K-CER.10)", () => {
    const uni = edificioDeCaso("unifamiliar"); // cubierta inclinada
    expect(detalle<"exterior">(justificar(uni), "cubierta")?.ciega).toMatchObject({ codigo: "C 9.3", RAtr: 50 });
    const e250 = setCerramientos(uni, { forjado: { id: "fu-bovhorm-250" } });
    expect(detalle<"exterior">(justificar(e250), "cubierta")?.ciega.RAtr).toBe(48);
    const losa = setCerramientos(demo.edificio, { forjado: { id: "losa-ha-200" } });
    expect(detalle<"exterior">(justificar(losa), "cubierta")?.ciega.RAtr).toBe(57);
  });
});

describe("HR · la planta baja distinta (K-CER.1)", () => {
  const PLURI = edificioDeCaso("plurifamiliar"); // viviendas también en la planta baja
  const conPB = setCerramientos(setPlantaBajaDistinta(PLURI, true), {
    fachadaPB: { id: "fa-sate-lp115" },
    ventanaPB: { id: "ve-4-c-4-batiente", marco: "pvc_tres_camaras" },
  });

  it("la fachada y la ventana de la planta baja se comprueban aparte, con sus recintos", () => {
    const j = justificar(conPB);
    expect(ids(j)).toEqual(expect.arrayContaining(["fachada-dormitorios", "fachada-estancias", "fachada-dormitorios-pb", "fachada-estancias-pb"]));
    const pb = detalle<"exterior">(j, "fachada-dormitorios-pb")!;
    expect(pb.ciega.codigo).toBe("F 4.1");
    expect(pb.hueco?.ventanaRAtr).toBe(27);
    expect(j.elementos.find((e) => e.id === "fachada-dormitorios-pb")?.nombre).toBe("Fachada de los dormitorios de la planta baja");
    expect(detalle<"exterior">(j, "fachada-dormitorios")?.ciega.codigo).toBe("F 3.2");
    expect(textoPlanoMemoria(hr.memoria(j))).toContain("Fachada de los dormitorios de la planta baja (recinto más desfavorable");
  });

  it("solo con otro marco (mismo tipo acústico) no hay nada aparte", () => {
    const e = setCerramientos(setPlantaBajaDistinta(PLURI, true), { ventanaPB: { id: "ve-4-c-6-batiente", marco: "metalico_sin_rpt" } });
    expect(ids(justificar(e)).some((id) => id.endsWith("-pb"))).toBe(false);
  });

  it("sin viviendas en la planta baja (locales), su fachada no se comprueba en HR", () => {
    const e = setCerramientos(setPlantaBajaDistinta(demo.edificio, true), { fachadaPB: { id: "fa-sate-lp115" } });
    const j = justificar(e);
    expect(ids(j).some((id) => id.endsWith("-pb"))).toBe(false);
    expect(detalle<"exterior">(j, "fachada-dormitorios")?.ciega.codigo).toBe("F 3.2");
  });
});
