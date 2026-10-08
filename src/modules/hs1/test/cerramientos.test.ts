import { describe, expect, it } from "vitest";
import { setCerramientos, setPlantaBajaDistinta } from "../../../lib/constructivo/cerramientos";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { ZONAS_PLUVIOMETRICAS_HS1 } from "../tipos";
import { hs1EstadoDefaults, type Hs1Estado } from "../estado";
import { justificarHs1, type DetalleHs1, type JustificacionHs1, type ObraHs1 } from "../justificacion";
import { memoriaHs1 } from "../memoria";
import { textoAviso, textoIncumplimiento } from "../textos";

// =============================================================================
// HS1 lee la fachada de El edificio (feature-26, paso 5): sus rasgos dan la
// columna, las hojas y la combinación; se declara la R del revestimiento; la
// planta baja distinta se comprueba aparte; el grado del CEC es contraste.
// =============================================================================

const OBRA: ObraHs1 = { zonaPluviometricaHs1: "IV", zonaEolica: "A", terrenoTipo: "IV", permeabilidadTerreno: "medio", nivelFreatico: { tipo: "no_detectado", reconocimiento_m: 20 } };
const est = (d: Partial<Hs1Estado> = {}): Hs1Estado => ({ ...hs1EstadoDefaults, ...d });
const fachada = (j: JustificacionHs1, id = "fachada") => j.elementos.find((e) => e.id === id) as (JustificacionHs1["elementos"][number] & { detalle: Extract<DetalleHs1, { clase: "fachada" }> }) | undefined;
const LOCALES = edificioDeCaso("plurifamiliar_locales");

/** Una obra con la que la fachada del edificio pide un grado dado. */
function obraConGrado(e: Edificio, grado: number): ObraHs1 {
  for (const z of ZONAS_PLUVIOMETRICAS_HS1) {
    const o = { ...OBRA, zonaPluviometricaHs1: z };
    if (fachada(justificarHs1(est(), e, o))?.detalle.grado === grado) return o;
  }
  throw new Error(`sin obra de grado ${grado}`);
}

describe("HS1 · la fachada de El edificio (feature-26)", () => {
  it("la planta baja distinta se comprueba aparte, con sus rasgos", () => {
    const e = setCerramientos(setPlantaBajaDistinta(LOCALES, true), { fachadaPB: { id: "fa-sate-lp115" } });
    const j = justificarHs1(est(), e, OBRA);
    expect(fachada(j)?.nombre).toBe("Fachadas de las demás plantas");
    const pb = fachada(j, "fachada-pb")!;
    expect(pb.nombre).toBe("Fachada de la planta baja");
    expect(pb.detalle).toMatchObject({ sol: { codigo: "F 4.1" }, unaHoja: true, columna: "con_revestimiento", cumple: true });
    const t = textoPlanoMemoria(memoriaHs1(j));
    expect(t).toContain("La fachada de la planta baja, SATE sobre LP ½ pie (CEC F 4.1, p. 64)");
    expect(t).toContain("La fachada de las demás plantas, enfoscado + LP ½ pie + cámara + aislante + LHD 7 + enlucido (CEC F 3.2, p. 59)");
  });

  it("si la planta baja lleva la misma fachada, no hay nada aparte", () => {
    const e = setPlantaBajaDistinta(LOCALES, true);
    expect(justificarHs1(est(), e, OBRA).elementos.some((x) => x.id === "fachada-pb")).toBe(false);
  });

  it("declarar menos R de la que hace falta no cumple, y lo habitual lo arregla", () => {
    const o = obraConGrado(LOCALES, 5);
    const j = justificarHs1(est({ fachadaDeclara: { general: { R: 1 } } }), LOCALES, o);
    const f = fachada(j)!;
    expect(f.veredicto).toBe("fail");
    expect(f.detalle).toMatchObject({ cumple: false, faltan: ["R3"], arreglo: "habitual" });
    expect(textoIncumplimiento(f)?.titulo).toBe("La fachada no llega al grado 5.");
    expect(fachada(justificarHs1(est(), LOCALES, o))?.veredicto).toBe("ok");
  });

  it("una fachada que no llega ni con lo máximo pide otra en El edificio", () => {
    const e = setCerramientos(LOCALES, { fachada: { id: "fa-cv-lp115-at-lhd70" } }); // F 1.1, sin revestimiento
    const j = justificarHs1(est(), e, obraConGrado(LOCALES, 5));
    const f = fachada(j)!;
    expect(f.detalle).toMatchObject({ cumple: false, arreglo: "edificio", faltan: ["B3"] });
    expect(textoIncumplimiento(f)?.detalle).toContain("Elige otra fachada en El edificio.");
  });

  it("el grado del CEC es contraste: F 3.5 con R1 llega a 4 por la tabla 2.7 y el CEC le da 3 (K-CER.12)", () => {
    const e = setCerramientos(LOCALES, { fachada: { id: "fa-enf-lp240-at-lhd70" } });
    const j = justificarHs1(est({ fachadaDeclara: { general: { R: 1 } } }), e, obraConGrado(e, 4));
    expect(fachada(j)?.veredicto).toBe("ok");
    const a = j.avisos.find((x) => x.id === "cec-fachada")!;
    expect(a.datos).toMatchObject({ codigo: "F 3.5", cec: 3, grado: 4, gradoMax: 4 });
    expect(textoAviso(a).titulo).toBe("El Catálogo da a F 3.5 un grado menor que la tabla 2.7.");
  });
});
