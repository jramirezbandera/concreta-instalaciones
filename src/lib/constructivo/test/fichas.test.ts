import { describe, expect, it } from "vitest";
import { setCerramientos, setPlantaBajaDistinta } from "../cerramientos";
import { solucionDe } from "../catalogo";
import { citaCec, designacion, designacionEnFrase, enFrase } from "../textos";
import { textoPlanoMemoria } from "../../cte/memoria";
import { edificioDeCaso } from "../../edificio/casos";
import type { Edificio } from "../../edificio/tipos";
import type { FichaData } from "../../pdf/renderFicha";
import { crearProyectoDemo } from "../../proyecto/demo";
import { tamanoDibujoHe1 } from "../../../modules/he1/dibujo";
import { he1EstadoDefaults } from "../../../modules/he1/estado";
import { toFichaData as fichaHe1 } from "../../../modules/he1/ficha";
import { justificarHe1 } from "../../../modules/he1/justificacion";
import { memoriaHe1 } from "../../../modules/he1/memoria";
import { hr } from "../../../modules/hr/definicion";
import { hrEstadoDefaults } from "../../../modules/hr/estado";
import { justificarHr } from "../../../modules/hr/justificacion";
import { memoriaHr } from "../../../modules/hr/memoria";
import { hs1EstadoDefaults } from "../../../modules/hs1/estado";
import { toFichaData as fichaHs1 } from "../../../modules/hs1/ficha";
import { justificarHs1, type ObraHs1 } from "../../../modules/hs1/justificacion";
import { memoriaHs1 } from "../../../modules/hs1/memoria";

// =============================================================================
// Las fichas y las memorias nombran cada cerramiento de El edificio igual en
// HE1, HR y HS1: su nombre, su código y su página del CEC (feature-26, paso 6).
// =============================================================================

const demo = crearProyectoDemo("2026-10-08T10:00:00.000Z");
const OBRA_HS1: ObraHs1 = { zonaPluviometricaHs1: "IV", zonaEolica: "A", terrenoTipo: "IV", permeabilidadTerreno: "medio", nivelFreatico: { tipo: "no_detectado", reconocimiento_m: 20 } };
const SVG = { nativeW: 640, nativeH: 400 };

function fichas(e: Edificio) {
  const jHe1 = justificarHe1(he1EstadoDefaults, e, { provincia: "Cáceres", altitud_m: 459, municipio: "Cáceres" });
  const jHr = justificarHr({ ...hrEstadoDefaults }, { edificio: e, datosGenerales: demo.datosGenerales, justificaciones: {} });
  const jHs1 = justificarHs1(hs1EstadoDefaults, e, OBRA_HS1);
  return {
    he1: { ficha: fichaHe1(jHe1, { estado: he1EstadoDefaults, edificio: e, revisados: [], svg: tamanoDibujoHe1() }), memoria: textoPlanoMemoria(memoriaHe1(jHe1)) },
    hr: { ficha: hr.ficha(jHr, { estado: { ...hrEstadoDefaults }, edificio: e, revisados: [], svg: SVG }), memoria: textoPlanoMemoria(memoriaHr(jHr)) },
    hs1: { ficha: fichaHs1(jHs1, { estado: hs1EstadoDefaults, edificio: e, revisados: [], svg: SVG }), memoria: textoPlanoMemoria(memoriaHs1(jHs1)) },
  };
}

const dato = (f: FichaData, concepto: string) => f.datosPartida.find((d) => d.concepto === concepto)?.valor;

describe("el nombre de un cerramiento (feature-26, paso 6)", () => {
  it("nombre, código y página del CEC; en mitad de una frase, en minúscula salvo las siglas", () => {
    const f32 = solucionDe("fachada", "fa-enf-lp115-c-at-lhd70");
    expect(citaCec(f32)).toBe("CEC F 3.2, p. 59");
    expect(designacion(f32)).toBe("Enfoscado + LP ½ pie + cámara + aislante + LHD 7 + enlucido (CEC F 3.2, p. 59)");
    expect(designacionEnFrase(f32)).toMatch(/^enfoscado \+ LP/);
    expect(designacionEnFrase(solucionDe("fachada", "fa-sate-lp115"))).toBe("SATE sobre LP ½ pie (CEC F 4.1, p. 64)");
    expect(enFrase("LP ½ pie")).toBe("LP ½ pie");
  });

  it("las fichas de HE1, HR y HS1 nombran igual las dos fachadas y la cubierta, y HE1 y HR las ventanas y los forjados", () => {
    const e = setCerramientos(setPlantaBajaDistinta(edificioDeCaso("plurifamiliar"), true), {
      fachadaPB: { id: "fa-sate-lp115" },
      ventanaPB: { id: "ve-4-c-4-batiente", marco: "metalico_rpt_mayor_12mm" },
    });
    const f = fichas(e);
    const general = designacion(solucionDe("fachada", "fa-enf-lp115-c-at-lhd70"));
    const pb = designacion(solucionDe("fachada", "fa-sate-lp115"));
    for (const m of [f.he1, f.hr, f.hs1]) {
      expect(dato(m.ficha, "Fachada")).toContain(general);
      expect(dato(m.ficha, "Fachada de la planta baja")).toContain(pb);
      expect(m.memoria).toContain(enFrase(pb));
    }
    const ventana = designacion(solucionDe("ventana", "ve-4-c-6-batiente"));
    const ventanaPB = designacion(solucionDe("ventana", "ve-4-c-4-batiente"));
    const cubierta = designacion(solucionDe("cubierta", "cu-plana-grava"));
    const forjado = designacion(solucionDe("forjado", "fu-bovhorm-300"));
    for (const m of [f.he1, f.hr]) {
      expect(dato(m.ficha, "Ventanas")).toContain(ventana);
      expect(dato(m.ficha, "Ventanas de la planta baja")).toContain(ventanaPB);
      expect(dato(m.ficha, "Forjados")).toContain(forjado);
    }
    // La cubierta, la misma en los tres: también en HS1, que la lee de El edificio.
    for (const m of [f.he1, f.hr, f.hs1]) expect(dato(m.ficha, "Cubierta")).toContain(cubierta);
    expect(f.hs1.memoria).toContain(`La cubierta es ${designacionEnFrase(solucionDe("cubierta", "cu-plana-grava"))}, invertida.`);
  });
});
