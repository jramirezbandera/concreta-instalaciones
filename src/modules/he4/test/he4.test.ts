import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { aplicabilidadBase, atributosDe } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { he4 } from "../definicion";
import { he4EstadoDefaults, type He4Estado } from "../estado";
import { demandaReferencia, justificarHe4, renovableBombaCalor, type DetalleHe4, type JustificacionHe4 } from "../justificacion";
import { AGUA_FRIA_HE4, aguaFria, contribucionMinima, factorCentralizacion, FRACCION_RENOVABLE_HE4, personasVivienda } from "../tablas";

// =============================================================================
// HE 4 · Contribución renovable al ACS (feature-22). Cifras y criterios:
// research/verificacion-he4-he5.md (bloques A–G y K-HE4).
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
const dg = demo.datosGenerales;
const con = (edificio: Edificio, estado: Partial<He4Estado> = {}, datos = dg) =>
  justificarHe4({ ...he4EstadoDefaults, ...estado }, { edificio, datosGenerales: datos });
const caso = (c: CasoEdificio, estado: Partial<He4Estado> = {}) => con(edificioDeCaso(c), estado);
const detalle = <C extends DetalleHe4["clase"]>(j: JustificacionHe4, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleHe4, { clase: C }> | undefined;
const avisos = (j: JustificacionHe4) => j.avisos.map((a) => a.id);

/** El plurifamiliar con `n` plantas de viviendas iguales (A + B por planta) y una A en la PB. */
function plurifamiliar(n: number): Edificio {
  const e = edificioDeCaso("plurifamiliar");
  e.grupos[0].repeticiones = n;
  return e;
}

describe("HE4 · las tablas del DB", () => {
  it("tabla a-Anejo F: personas por dormitorios (6 → 6, más de 6 → 7; el estudio, como uno)", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 9].map(personasVivienda)).toEqual([1.5, 1.5, 3, 4, 5, 6, 6, 7, 7]);
  });

  it("tabla b-Anejo F: factor de centralización por número de viviendas", () => {
    expect([1, 3, 4, 10, 11, 20, 21, 50, 51, 75, 76, 100, 101].map(factorCentralizacion)).toEqual([1, 1, 0.95, 0.95, 0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.75, 0.75, 0.7]);
  });

  it("60 % con menos de 5000 l/d (estricto); 70 % desde 5000", () => {
    expect(contribucionMinima(4999.9)).toBe(60);
    expect(contribucionMinima(5000)).toBe(70);
  });

  it("Anejo G: la tabla tiene las 52 provincias y corrige por altitud con B de invierno y de verano", () => {
    const p = AGUA_FRIA_HE4.datos.provincias;
    expect(Object.keys(p)).toHaveLength(52);
    expect(p["Cáceres"]).toEqual({ capital: "Cáceres", altitud_m: 459, t: [9, 10, 11, 12, 14, 18, 21, 20, 19, 15, 11, 9] });
    expect(p["Asturias"].capital).toBe("Oviedo");
    const t = aguaFria(p["Cáceres"], 559);
    expect(t[0]).toBeCloseTo(9 - 0.66, 9); // enero: 0,0066 × 100 m
    expect(t[6]).toBeCloseTo(21 - 0.33, 9); // julio: 0,0033 × 100 m
    expect(t[3]).toBeCloseTo(12 - 0.33, 9); // abril ya es de verano
    expect(t[9]).toBeCloseTo(15 - 0.66, 9); // octubre, de invierno
    expect(aguaFria(p["Cáceres"], 459)).toEqual(p["Cáceres"].t);
  });

  it("bomba de calor: 1 − 1/SCOP, y nada por debajo de 2,5", () => {
    expect(renovableBombaCalor(3.5)).toBeCloseTo(0.714, 3); // el ejemplo del comentario del Ministerio
    expect(renovableBombaCalor(2.5)).toBeCloseTo(0.6, 12);
    expect(renovableBombaCalor(2.49)).toBe(0);
    expect(FRACCION_RENOVABLE_HE4.datos.biomasa).toBeCloseTo(0.9236, 4);
  });
});

describe("HE4 · con El edificio", () => {
  it("los cuatro casos: demanda de referencia y si se aplica", () => {
    expect(caso("unifamiliar").total_l_d).toBe(140); // 4 dormitorios → 5 personas
    expect(caso("plurifamiliar").total_l_d).toBe(700); // 4 A (4 p.) + 3 B (3 p.) = 25 p.
    expect(caso("plurifamiliar_locales").total_l_d).toBe(588); // 3 A + 3 B = 21 p.; el local no cuenta
    expect(caso("oficinas").total_l_d).toBe(128); // 640 m² / 10 = 64 p. × 2
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      expect(caso(c).aplica, c).toBe(true);
      expect(aplicabilidadBase(atributosDe(dg, edificioDeCaso(c))).he4.aplicabilidad, c).toBe("aplica");
    }
  });

  it("una unifamiliar de 2 dormitorios (84 l/d) no llega: no aplica, también en La obra", () => {
    const e = edificioDeCaso("unifamiliar");
    const u = e.unidades[0];
    if (u.clase === "vivienda") u.dormitorios = 2;
    const j = con(e);
    expect(j.total_l_d).toBe(84);
    expect(j.aplica).toBe(false);
    expect(j.elementos.map((x) => x.id)).toEqual(["vivienda-U", "demanda"]);
    expect(he4.frase(j)).toMatch(/84 l\/d.*no se aplica/);
    const a = aplicabilidadBase(atributosDe(dg, e)).he4;
    expect(a.aplicabilidad).toBe("no_aplica");
    expect(a.nota).toMatch(/no supera 100 l\/d/);
    expect(textoPlanoMemoria(he4.memoria(j))).toMatch(/no es de aplicación/);
  });

  it("producción centralizada: el factor de centralización solo entonces", () => {
    expect(detalle(caso("plurifamiliar"), "demanda")!.fc).toBe(1);
    const j = caso("plurifamiliar", { produccion: "centralizada" });
    expect(detalle(j, "demanda")).toMatchObject({ fc: 0.95, numViviendas: 7, centralizada: true, total_l_d: 665 });
    expect(demandaReferencia(edificioDeCaso("plurifamiliar"), { produccion: "centralizada" })).toBe(665);
    // La unifamiliar no tiene esa decisión.
    expect(caso("unifamiliar", { produccion: "centralizada" }).plurifamiliar).toBe(false);
  });

  it("oficinas: un ocupante por 10 m² supuesto, y aviso porque decide si se aplica", () => {
    const j = caso("oficinas");
    expect(detalle(j, "oficinas")).toMatchObject({ util_m2: 640, ocupantes: 64, supuestos: true, l_d: 128 });
    expect(avisos(j)).toContain("oficinas");
    const k = caso("oficinas", { ocupantesOficinas: 40 });
    expect(k.total_l_d).toBe(80);
    expect(k.aplica).toBe(false);
    expect(avisos(k)).not.toContain("oficinas");
    // En un edificio de viviendas el supuesto no cambia nada: sin aviso.
    expect(avisos(caso("plurifamiliar_locales"))).not.toContain("oficinas");
  });

  it("la energía mes a mes en Cáceres: Q = D·días·1,1628·(60 − Tred), más las pérdidas", () => {
    const e = detalle(caso("plurifamiliar_locales"), "energia")!;
    expect(e.capital).toBe("Cáceres");
    expect(e.az).toBe(0);
    expect(e.meses[0]).toMatchObject({ mes: "Enero", dias: 31, tred: 9, util_kWh: 1081, kWh: 1189 });
    expect(e.util_kWh).toBe(11454);
    expect(e.perdidas_pct).toBe(10);
    expect(e.perdidasSupuestas).toBe(true);
    // Centralizada: con recirculación, un 20 % (hipótesis rotulada).
    expect(detalle(caso("plurifamiliar_locales", { produccion: "centralizada" }), "energia")!.perdidas_pct).toBe(20);
    const dadas = caso("plurifamiliar_locales", { perdidas_pct: 0 });
    expect(detalle(dadas, "energia")!.total_kWh).toBe(detalle(dadas, "energia")!.util_kWh);
    expect(avisos(dadas)).not.toContain("perdidas");
  });

  it("fuera de la capital, el agua fría se corrige con la altitud del Anejo G", () => {
    const j = con(edificioDeCaso("plurifamiliar_locales"), {}, { ...dg, altitud_m: 759 });
    const e = detalle(j, "energia")!;
    expect(e.az).toBe(300);
    expect(e.meses[0].tred).toBe(7); // 9 − 0,0066 × 300 = 7,02 → 7,0
    expect(e.meses[6].tred).toBe(20); // 21 − 0,0033 × 300 = 20,01 → 20,0
  });

  it("bomba de calor: SCOP supuesto 2,5 (60 % justo, con aviso); por debajo de 2,5 no cuenta", () => {
    const j = caso("plurifamiliar_locales");
    expect(detalle(j, "contribucion")).toMatchObject({ sistema: "bomba_calor", scop: 2.5, scopSupuesto: true, renovable_pct: 60, exigida_pct: 60 });
    expect(j.veredicto).toBe("ok");
    expect(avisos(j)).toEqual(expect.arrayContaining(["scop", "perdidas"]));
    const k = caso("plurifamiliar_locales", { scop: 2.4 });
    expect(detalle(k, "contribucion")).toMatchObject({ scopBajo: true, renovable_pct: 0 });
    expect(k.veredicto).toBe("fail");
    expect(he4.textoIncumplimiento(k.elementos.find((e) => e.id === "contribucion")!)!.titulo).toMatch(/SCOPdhw mínimo/);
    expect(he4.arreglo!(k.elementos.find((e) => e.id === "contribucion")!, k)).toMatchObject({ cambios: { scop: 2.5 } });
  });

  it("con 5000 l/d o más se exige el 70 %, y se compara sin redondear (SCOP 3,33 → 69,97 %)", () => {
    const e = plurifamiliar(25); // 26 A + 25 B = 179 personas → 5012 l/d
    expect(con(e).total_l_d).toBe(5012);
    const j = con(e, { scop: 3.33 });
    expect(detalle(j, "contribucion")).toMatchObject({ exigida_pct: 70, renovable_pct: 70, cumple: false });
    expect(j.veredicto).toBe("fail");
    expect(he4.arreglo!(j.elementos.find((x) => x.id === "contribucion")!, j)).toMatchObject({ cambios: { scop: 3.34 } });
    expect(con(e, { scop: 3.34 }).veredicto).toBe("ok");
    // Centralizada (51 viviendas), el factor 0,80 la baja de 5000: vuelve al 60 %.
    expect(detalle(con(e, { produccion: "centralizada" }), "demanda")).toMatchObject({ fc: 0.8, exigida_pct: 60 });
  });

  it("solar térmica: la fracción exigida como objetivo, o la dada con su apoyo", () => {
    const j = caso("plurifamiliar_locales", { sistema: "solar" });
    expect(detalle(j, "contribucion")).toMatchObject({ fraccionSupuesta: true, renovable_pct: 60 });
    expect(avisos(j)).toContain("fraccion");
    expect(avisos(j)).not.toContain("scop");
    expect(caso("plurifamiliar_locales", { sistema: "solar", fraccionSolar_pct: 50 }).veredicto).toBe("fail");
    const bdc = caso("plurifamiliar_locales", { sistema: "solar", fraccionSolar_pct: 50, apoyo: "bomba_calor", scop: 3 });
    expect(detalle(bdc, "contribucion")!.renovable_pct).toBeCloseTo(83.3, 1);
    expect(detalle(caso("plurifamiliar_locales", { sistema: "solar", fraccionSolar_pct: 30, apoyo: "biomasa" }), "contribucion")!.renovable_pct).toBeCloseTo(94.7, 1);
  });

  it("biomasa (pellets, 92,4 %) y red urbana (sin su fracción no cuenta)", () => {
    expect(detalle(caso("plurifamiliar_locales", { sistema: "biomasa" }), "contribucion")!.renovable_pct).toBe(92.4);
    const red = caso("plurifamiliar_locales", { sistema: "red" });
    expect(red.veredicto).toBe("fail");
    expect(he4.textoIncumplimiento(red.elementos.find((e) => e.id === "contribucion")!)!.titulo).toMatch(/fracción renovable de la red/);
    expect(caso("plurifamiliar_locales", { sistema: "red", renovableRed_pct: 80 }).veredicto).toBe("ok");
  });

  it("los cuatro casos dan memoria con la tabla mensual, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      const e = edificioDeCaso(c);
      const j = con(e);
      const dibujo = he4.dibujo(j, e);
      const ficha = he4.ficha(j, { estado: he4EstadoDefaults, edificio: e, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB, c).toBe("DB-HE (consolidado 14-jun-2022)");
      expect(ficha.verificaciones.some((v) => v.concepto === "Contribución renovable al ACS"), c).toBe(true);
      const m = he4.memoria(j);
      expect(m.tabla!.filas, c).toHaveLength(13);
      expect(textoPlanoMemoria(m), c).toMatch(/Anejo G/);
      // Cada elemento tiene su etiqueta en el dibujo y su franja.
      for (const el of j.elementos) {
        expect(dibujo.etiquetas.some((x) => x.elementoId === el.id), `${c} ${el.id}`).toBe(true);
        expect(he4.franja(el, j, "ok").titulo, `${c} ${el.id}`).toBe(el.nombre);
      }
    }
  });

  it("el dibujo pone la producción donde va", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const iconos = (estado: Partial<He4Estado>) => he4.dibujo(con(e, estado), e).marcas.flatMap((m) => (m.tipo === "icono" && m.elementoId === "contribucion" ? [m.icono] : []));
    expect(iconos({}).every((i) => i === "bomba_calor")).toBe(true);
    expect(iconos({}).length).toBeGreaterThan(1); // una por planta de viviendas dibujada
    expect(iconos({ produccion: "centralizada" })).toEqual(["bomba_calor"]);
    expect(iconos({ sistema: "solar" })).toEqual(["captador", "captador", "caldera"]);
    expect(iconos({ sistema: "biomasa" })).toEqual(["caldera"]);
  });
});
