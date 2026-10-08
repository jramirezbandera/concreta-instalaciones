import { setCerramientos } from "../../../lib/constructivo/cerramientos";
import { describe, it, expect } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { hs1EstadoDefaults, type Hs1Estado } from "../estado";
import { justificarHs1, obraHs1De, type ElementoHs1, type JustificacionHs1, type ObraHs1 } from "../justificacion";
import { partesDe, presenciaAguaDe } from "../partes";

// =============================================================================
// HS1 (feature-17) — Lo que entra desde El edificio, la presencia de agua y la
// justificación: grados, condiciones, lo que no vale y su arreglo, el drenaje,
// el bombeo y los supuestos (que solo se avisan si cambian el resultado).
// =============================================================================

const E = (k: Parameters<typeof edificioDeCaso>[0]) => edificioDeCaso(k);
const est = (d: Partial<Hs1Estado> = {}): Hs1Estado => ({ ...hs1EstadoDefaults, ...d });
const el = (j: JustificacionHs1, id: string): ElementoHs1 => {
  const e = j.elementos.find((x) => x.id === id);
  if (!e) throw new Error(`sin ${id}`);
  return e;
};
const avisos = (j: JustificacionHs1) => j.avisos.map((a) => a.id);

/** Datos completos de una obra «tranquila»: sin freático, Ks medio, zona IV, entorno urbano, zona A. */
const OBRA: ObraHs1 = {
  zonaPluviometricaHs1: "IV",
  zonaEolica: "A",
  terrenoTipo: "IV",
  nivelFreatico: { tipo: "no_detectado", reconocimiento_m: 10 },
  permeabilidadTerreno: "medio",
  cotaAlcantarillado_m: -1.2,
};

describe("presencia de agua (ap. 2.1.1)", () => {
  it("los umbrales del literal: por encima, menos de 2 m por debajo, 2 m o más", () => {
    const f = (p: number) => ({ tipo: "profundidad" as const, profundidad_m: p });
    expect(presenciaAguaDe(-3.3, f(3.31))).toBe("baja");
    expect(presenciaAguaDe(-3.3, f(3.3))).toBe("media");
    expect(presenciaAguaDe(-3.3, f(1.31))).toBe("media");
    expect(presenciaAguaDe(-3.3, f(1.3))).toBe("alta");
    expect(presenciaAguaDe(-3.3, { tipo: "no_detectado" })).toBe("baja");
    expect(presenciaAguaDe(-3.3, undefined)).toBeNull();
  });
});

describe("lo que entra desde El edificio", () => {
  it("plurifamiliar con locales: un sótano, su muro y su suelo; fachada de 13 m", () => {
    const p = partesDe(E("plurifamiliar_locales"));
    expect(p.sotanos).toMatchObject({ n: 1, cotaSuelo_m: -3, superficie_m2: 470 });
    expect(p.muro).toEqual({ alturaEnterrada_m: 3, caraInferior_m: -3.3 });
    expect(p.suelos.map((s) => s.id)).toEqual(["suelo-sotano"]);
    expect(p.fachada.alturaCoronacion_m).toBe(13);
    expect(p.cubierta.tipo).toBe("plana_no_transitable");
  });

  it("unifamiliar: sin sótano, solo el suelo de la planta baja", () => {
    const p = partesDe(E("unifamiliar"));
    expect(p.sotanos).toBeNull();
    expect(p.muro).toBeNull();
    expect(p.suelos).toEqual([expect.objectContaining({ id: "suelo-pb", cota_m: 0, caraInferior_m: -0.3, parcial: false })]);
    expect(p.fachada.alturaCoronacion_m).toBe(5.6);
  });

  it("la planta baja que excede el sótano apoya en el terreno", () => {
    const e: Edificio = structuredClone(E("plurifamiliar_locales"));
    e.grupos[2].zonas = [{ id: "z4", uso: "garaje", superficieUtil_m2: 120, plazas: 4 }];
    const p = partesDe(e);
    expect(p.suelos.map((s) => [s.id, s.parcial, Math.round(s.superficie_m2)])).toEqual([
      ["suelo-sotano", false, 120],
      ["suelo-pb", true, 75],
    ]);
  });
});

describe("justificación", () => {
  it("el Demo: grado 1 en el muro, 2 en el suelo y 5 en la fachada con la zona pluviométrica supuesta", () => {
    const p = crearProyectoDemo("2026-01-01T00:00:00.000Z");
    const j = justificarHs1(est(), p.edificio, obraHs1De(p.datosGenerales));
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => e.id)).toEqual(["terreno", "muro", "suelo-sotano", "fachada", "cubierta"]);
    expect(el(j, "muro").detalle).toMatchObject({ grado: 1, condiciones: ["I2", "I3", "D1", "D5"] });
    expect(el(j, "suelo-sotano").detalle).toMatchObject({ grado: 2, condiciones: ["C2", "C3", "D1"], bloque: "flexorresistente_o_gravedad" });
    expect(el(j, "fachada").detalle).toMatchObject({ grado: 5, exposicion: "V3", condiciones: ["R3", "C1"], influyen: ["zona"] });
    // Sin zona eólica, pero con 13 m no influye: solo se avisa de la pluviométrica.
    expect(j.avisos).toEqual([{ id: "clima-supuesto", tipo: "supuesto", elementoId: "fachada", datos: { faltan: ["zona"] } }]);
  });

  it("con todos los datos y nada que avisar", () => {
    const j = justificarHs1(est(), E("plurifamiliar_locales"), OBRA);
    expect(j.avisos).toEqual([]);
    expect(el(j, "fachada").detalle).toMatchObject({ grado: 2, exposicion: "V3", condiciones: ["R1", "C1"] });
    expect(el(j, "cubierta").valor).toEqual({ texto: "1–5 %" });
  });

  it("sin estudio geotécnico: presencia alta y peor Ks, avisados; lo habitual del suelo sigue siendo válido", () => {
    const j = justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, nivelFreatico: undefined, permeabilidadTerreno: undefined });
    expect(avisos(j)).toEqual(["freatico-supuesto", "ks-supuesto"]);
    expect(el(j, "muro").detalle).toMatchObject({ grado: 5, condiciones: ["I1", "I3", "D1", "D2", "D3"] });
    // La solera sin intervención no se admite con grado 5: lo habitual pasa a la sub-base.
    expect(j.habituales).toMatchObject({ sueloTipo: "solera", sueloIntervencion: "sub_base" });
    expect(el(j, "suelo-sotano").detalle).toMatchObject({ grado: 5, intervencion: "sub_base" });
    expect(j.veredicto).toBe("ok");
    // D3 del muro → tubo en el arranque; D2 del suelo → drenes bajo el suelo; D2 del muro → pozos y bombas.
    expect(el(j, "dren-muro").detalle).toMatchObject({ dn_mm: 250, grado: 5 });
    expect(el(j, "dren-suelo").detalle).toMatchObject({ dn_mm: 200 });
    expect(el(j, "bombeo").detalle).toMatchObject({ siempre: true, pozosMuro: 2 });
  });

  it("Ks sin indicar se avisa: siempre cambia el grado del suelo", () => {
    // Con presencia baja, el suelo es 2 o 1.
    const j1 = justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, permeabilidadTerreno: undefined });
    expect(avisos(j1)).toContain("ks-supuesto");
    // Con presencia alta, 5 o 4.
    expect(avisos(justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, nivelFreatico: undefined, permeabilidadTerreno: undefined }))).toContain(
      "ks-supuesto",
    );
  });

  it("lo que la tabla 2.2 no admite no cumple, con el arreglo", () => {
    const obra: ObraHs1 = { ...OBRA, nivelFreatico: { tipo: "profundidad", profundidad_m: 1 } }; // alta
    const j = justificarHs1(est({ muroTipo: "gravedad", muroImper: "interior" }), E("plurifamiliar_locales"), obra);
    expect(j.veredicto).toBe("fail");
    expect(el(j, "muro").detalle).toMatchObject({ grado: 5, condiciones: null, motivo: "sombreada", arreglo: { tipo: "gravedad", imper: "exterior" } });
  });

  it("las notas de la tabla 2.2: más sótanos de los que admite la casilla", () => {
    const e: Edificio = structuredClone(E("plurifamiliar_locales"));
    e.grupos[2].repeticiones = 3;
    // Presencia media en el fondo (−9,30 bajo un freático a 8 m): Ks alto → grado 3.
    const obra: ObraHs1 = { ...OBRA, nivelFreatico: { tipo: "profundidad", profundidad_m: 8 }, permeabilidadTerreno: "alto" };
    const j = justificarHs1(est({ muroImper: "interior" }), e, obra);
    expect(el(j, "muro").detalle).toMatchObject({ grado: 3, sotanos: 3, maxSotanos: 2, motivo: "sotanos" });
    expect(j.veredicto).toBe("fail");
  });

  it("freático no detectado sin la profundidad del reconocimiento, y cerca de un umbral", () => {
    const j = justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, nivelFreatico: { tipo: "no_detectado" } });
    expect(avisos(j)).toEqual(["freatico-reconocimiento"]);
    const k = justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, nivelFreatico: { tipo: "profundidad", profundidad_m: 3.4 } });
    expect(el(k, "terreno").detalle).toMatchObject({ delta_m: -0.1 });
    expect(avisos(k)).toEqual(["freatico-umbral"]);
  });

  it("el clima supuesto solo se avisa con lo que influye", () => {
    const alto: Edificio = structuredClone(E("plurifamiliar_locales"));
    alto.grupos[0].repeticiones = 8; // 4 + 8 × 3 = 28 m
    const j = justificarHs1(est(), alto, { ...OBRA, zonaEolica: undefined });
    expect(el(j, "fachada").detalle).toMatchObject({ altura_m: 28, filaAltura: "16–40 m" });
    expect(j.avisos.find((a) => a.id === "clima-supuesto")?.datos).toEqual({ faltan: ["eolica"] });
    expect(avisos(justificarHs1(est(), E("plurifamiliar_locales"), { ...OBRA, zonaEolica: undefined }))).toEqual([]);
  });

  it("la fachada habitual (F 3.2): grado 2 con R1 + C1, como antes de feature-26", () => {
    const j = justificarHs1(est(), E("plurifamiliar_locales"), OBRA);
    expect(el(j, "fachada")).toMatchObject({ veredicto: "ok", detalle: { grado: 2, columna: "con_revestimiento", condiciones: ["R1", "C1"], sol: { codigo: "F 3.2" } } });
  });

  it("fachada de una hoja (SATE en El edificio): la nota (1) quita la casilla del grado 2 y vale la del 3", () => {
    const e = setCerramientos(E("plurifamiliar_locales"), { fachada: { id: "fa-sate-lp115" } });
    const j = justificarHs1(est(), e, OBRA);
    expect(el(j, "fachada").detalle).toMatchObject({ grado: 2, unaHoja: true, gradoOpcion: 3, condiciones: ["R1", "B1", "C1"], cumple: true });
  });

  it("fachada sin revestimiento (F 1.1): J y N son lo habitual que pide la primera combinación", () => {
    const e = setCerramientos(E("plurifamiliar_locales"), { fachada: { id: "fa-cv-lp115-at-lhd70" } });
    const j = justificarHs1(est(), e, OBRA);
    expect(el(j, "fachada").detalle).toMatchObject({ columna: "sin_revestimiento", condiciones: ["B1", "C1", "J1", "N1"], cumple: true });
  });

  it("unifamiliar: suelo sin muro, cubierta inclinada de teja y bombeo según la acometida", () => {
    const obra: ObraHs1 = { ...OBRA, nivelFreatico: { tipo: "profundidad", profundidad_m: 0.5 } }; // la cara inferior a −0,30: presencia baja
    const j = justificarHs1(est(), E("unifamiliar"), obra);
    expect(el(j, "suelo-pb").detalle).toMatchObject({ sinMuro: true, bloque: "flexorresistente_o_gravedad", grado: 2 });
    expect(el(j, "cubierta").valor).toEqual({ texto: "> 30 %" });
    expect(avisos(j)).toEqual(["freatico-umbral"]);
    // Placa con presencia alta: D3 y D2 piden drenes; la cara inferior (−0,30) queda sobre la acometida (−1,20): sin bombeo.
    const alta = justificarHs1(est({ sueloTipo: "placa", sueloIntervencion: "sin_intervencion" }), E("unifamiliar"), {
      ...OBRA,
      nivelFreatico: undefined,
      permeabilidadTerreno: "alto",
    });
    expect(el(alta, "suelo-pb").detalle).toMatchObject({ grado: 5 });
    expect(alta.elementos.some((e) => e.id === "dren-muro")).toBe(true);
    expect(alta.elementos.some((e) => e.id === "bombeo")).toBe(true); // D4 del suelo: pozos, siempre con bombas
    expect(avisos(alta)).toContain("suelo-sin-muro");
  });

  it("el suelo elevado pide comprobar la relación de 1/7", () => {
    const j = justificarHs1(est({ sueloTipo: "elevado" }), E("unifamiliar"), OBRA);
    expect(el(j, "suelo-pb").detalle).toMatchObject({ tipo: "elevado", condiciones: ["V1"] });
    expect(avisos(j)).toContain("suelo-elevado");
  });

  it("la cubierta transitable se protege con solado; con lámina autoprotegida no lleva capa de protección", () => {
    const e: Edificio = { ...E("plurifamiliar_locales"), cubierta: { tipo: "plana_transitable", superficie_m2: 210 } };
    const j = justificarHs1(est({ cubiertaProteccion: "grava" }), e, OBRA);
    expect(j.cubierta.proteccion).toBe("solado_fijo"); // la grava es de las no transitables: vuelve a lo habitual
    const l = justificarHs1(est({ cubiertaProteccion: "lamina_autoprotegida" }), E("plurifamiliar_locales"), OBRA);
    expect(l.cubierta.pendiente).toMatchObject({ min_pct: 1, max_pct: 15 });
    expect(l.cubierta.capas.some((c) => c.letra === "i")).toBe(false);
  });
});
