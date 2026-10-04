import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { cambiarAscensor } from "../../sua/editar";
import { sua1 } from "../definicion";
import { sua1EstadoDefaults, type Sua1Estado } from "../estado";
import { huellaHabitual, justificarSua1, peldanosDe, type DetalleEscalera, type JustificacionSua1 } from "../justificacion";
import {
  alturaBarreraMin_m,
  alturaTramoMax_m,
  contrahuellaMax_cm,
  pasamanosAmbosLados,
  pendienteAccesibleMax_pct,
  SUA1_ANCHURA_TABLA_4_1,
  SUA1_CLASE_EXIGIBLE,
  SUA1_ESCALERA_GENERAL,
  SUA1_ESCALERA_RESTRINGIDA,
  SUA1_RAMPAS,
} from "../tablas";

// =============================================================================
// SUA 1 · Riesgo de caídas (feature-20). Cifras: research/verificacion-sua1.md,
// bloques A1 a A6.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const conEdificio = (edificio: Edificio, estado: Partial<Sua1Estado> = {}) =>
  justificarSua1({ ...sua1EstadoDefaults, ...estado }, { edificio, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Sua1Estado> = {}) => conEdificio(edificioDeCaso(c), estado);
const el = (j: JustificacionSua1, id: string) => j.elementos.find((e) => e.id === id)!;
const esc = (j: JustificacionSua1, id: string) => el(j, id).detalle as DetalleEscalera;

/** Un edificio de un caso con otras alturas de planta. */
function conAlturas(c: CasoEdificio, alturas: Record<string, number>): Edificio {
  const e = edificioDeCaso(c);
  return { ...e, grupos: e.grupos.map((g) => (alturas[g.id] !== undefined ? { ...g, altura_m: alturas[g.id] } : g)) };
}

describe("SUA1 · tablas", () => {
  it("las casillas clave", () => {
    expect(SUA1_ESCALERA_GENERAL.datos).toMatchObject({ huellaMin_cm: 28, contrahuellaMin_cm: 13, relacionMin_cm: 54, relacionMax_cm: 70, peldanosMinPorTramo: 3 });
    expect(SUA1_ESCALERA_RESTRINGIDA.datos).toEqual({ anchuraMin_m: 0.8, contrahuellaMax_cm: 20, huellaMin_cm: 22 });
    expect(SUA1_ANCHURA_TABLA_4_1.datos.residencialVivienda).toEqual([1, 1, 1, 1]);
    expect(SUA1_ANCHURA_TABLA_4_1.datos.casosRestantes).toEqual([0.8, 0.9, 1, 1]);
    expect(SUA1_CLASE_EXIGIBLE.datos.interiorHumedo).toEqual({ menor6: 2, mayor6oEscalera: 3 });
    expect(SUA1_RAMPAS.datos.aparcamientoMixta_pct).toBe(16);
  });

  it("barreras: más de 55 cm; hasta 6 m incluidos, 0,90; por encima, 1,10", () => {
    expect([0.55, 0.56, 6, 6.01].map(alturaBarreraMin_m)).toEqual([null, 0.9, 0.9, 1.1]);
  });

  it("escalera de uso general: 18,5 / 3,20 solo con ascensor y en uso privado", () => {
    expect(contrahuellaMax_cm(false, true)).toBe(18.5);
    expect(contrahuellaMax_cm(true, true)).toBe(17.5);
    expect(contrahuellaMax_cm(false, false)).toBe(17.5);
    expect(alturaTramoMax_m(false, true)).toBe(3.2);
    expect(alturaTramoMax_m(false, false)).toBe(2.25);
  });

  it("pasamanos en ambos lados: anchura que excede de 1,20 m o sin ascensor", () => {
    expect(pasamanosAmbosLados(1.2, true)).toBe(false);
    expect(pasamanosAmbosLados(1.21, true)).toBe(true);
    expect(pasamanosAmbosLados(1, false)).toBe(true);
  });

  it("rampa accesible: 10 % por debajo de 3 m, 8 % por debajo de 6 m, 6 % en el resto", () => {
    expect([2.99, 3, 5.99, 6].map(pendienteAccesibleMax_pct)).toEqual([10, 8, 8, 6]);
  });

  it("peldaños y huella habitual", () => {
    expect(peldanosDe(3, 17.5)).toBe(18);
    expect(peldanosDe(3.15, 17.5)).toBe(18); // 315 / 17,5 = 18 justos, sin error de coma flotante
    expect(peldanosDe(2.8, 18.5)).toBe(16);
    expect(huellaHabitual(300 / 18)).toBe(29.5);
    expect(huellaHabitual(400 / 23)).toBe(28);
  });
});

describe("SUA1 · los cuatro casos con lo habitual", () => {
  it("unifamiliar: escalera interior de uso restringido y barreras de la P1; sin ascensor ni limpieza", () => {
    const j = caso("unifamiliar");
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => e.id)).toEqual(["escalera-interior", "barreras-baja"]);
    const d = esc(j, "escalera-interior");
    expect(d).toMatchObject({ restringida: true, anchura_m: 0.9, huella_cm: 27, pasamanos: null });
    expect(d.porPlanta[0]).toMatchObject({ peldanos: 16, c_cm: 17.5 });
    expect(j.contexto).toMatchObject({ general: false, acceso: false, limpieza: false });
  });

  it("plurifamiliar: escalera común y del garaje con ascensor (supuesto), huella 29,5, sin aviso", () => {
    const j = caso("plurifamiliar");
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => e.id)).toEqual(["escalera-comun", "escalera-garaje", "barreras-baja", "barreras-alta", "rampa-garaje", "limpieza"]);
    const c = esc(j, "escalera-comun");
    expect(c.cMayor_cm).toBeCloseTo(16.667, 3);
    expect(c).toMatchObject({ huella_cm: 29.5, tramos: 2, cMax_cm: 18.5, tramoMax_m: 3.2, pasamanos: "uno", tabica: true, peldanosMinTramo: null });
    expect(esc(j, "escalera-garaje").tabica).toBe(true);
    expect(j.avisos).toEqual([]);
    // La P2, con el suelo a 6,00 m justos, va con las de 0,90 (no excede de 6 m).
    expect(el(j, "barreras-baja").detalle).toMatchObject({ plantas: "P1–P2", min_m: 0.9 });
    expect(el(j, "barreras-alta").detalle).toMatchObject({ plantas: "P3", min_m: 1.1 });
    expect(el(j, "limpieza").detalle).toMatchObject({ plantas: "P2–P3" });
    expect(el(j, "rampa-garaje").veredicto).toBe("dato");
  });

  it("plurifamiliar con locales: PB de 4 m, contrahuellas de 16,67 a 17,39 (0,72 cm de diferencia)", () => {
    const j = caso("plurifamiliar_locales");
    const c = esc(j, "escalera-comun");
    expect(c.variacion_cm).toBeCloseTo(0.725, 2);
    expect(c.huella_cm).toBe(28);
    expect(c.fallos).toEqual([]);
    expect(el(j, "limpieza").detalle).toMatchObject({ plantas: "P1–P3" });
  });

  it("oficinas: resbaladicidad, 3 peldaños por tramo y anchura de 1,00 (nota 2); sin limpieza", () => {
    const j = caso("oficinas");
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => e.id)).toContain("resbaladicidad");
    expect(j.elementos.map((e) => e.id)).not.toContain("limpieza");
    expect(esc(j, "escalera-comun")).toMatchObject({ peldanosMinTramo: 3, anchuraMin_m: 1, residencial: false, tabica: false });
  });
});

describe("SUA1 · lo que no cumple y su arreglo", () => {
  it("barrera de 0,89 m hasta 6 m: no cumple; 0,90 sí", () => {
    const mal = caso("plurifamiliar", { barreraBaja_m: 0.89 });
    const b = el(mal, "barreras-baja");
    expect(b.veredicto).toBe("fail");
    expect(sua1.arreglo!(b, mal)!.cambios).toEqual({ barreraBaja_m: "habitual" });
    expect(el(caso("plurifamiliar", { barreraBaja_m: 0.9 }), "barreras-baja").veredicto).toBe("ok");
    expect(el(caso("plurifamiliar", { barreraAlta_m: 1.09 }), "barreras-alta").veredicto).toBe("fail");
  });

  it("huella, anchura y 2C + H en sus bordes", () => {
    expect(esc(caso("plurifamiliar", { huella_cm: 28 }), "escalera-comun").fallos).toEqual([]);
    expect(esc(caso("plurifamiliar", { huella_cm: 27.5 }), "escalera-comun").fallos).toEqual(["huella"]);
    expect(esc(caso("plurifamiliar", { anchura_m: 0.99 }), "escalera-comun").fallos).toEqual(["anchura"]);
    // 2 · 16,67 + 36,6 = 69,93 ≤ 70; con 36,7 se pasa.
    expect(esc(caso("plurifamiliar", { huella_cm: 36.6 }), "escalera-comun").fallos).toEqual([]);
    const j = caso("plurifamiliar", { huella_cm: 36.7 });
    expect(esc(j, "escalera-comun").fallos).toEqual(["relacion"]);
    expect(sua1.arreglo!(el(j, "escalera-comun"), j)!.cambios).toEqual({ huella_cm: "habitual" });
  });

  it("un tramo por planta sin ascensor: 3,00 m > 2,25 m; el arreglo vuelve a los tramos habituales", () => {
    const j = conEdificio(cambiarAscensor(edificioDeCaso("plurifamiliar"), false), { tramos: 1 });
    const c = esc(j, "escalera-comun");
    expect(c).toMatchObject({ cMax_cm: 17.5, tramoMax_m: 2.25, pasamanos: "ambos", prolongacion: true });
    expect(c.fallos).toEqual(["tramo"]);
    expect(sua1.arreglo!(el(j, "escalera-comun"), j)!.cambios).toEqual({ tramos: "habitual" });
  });

  it("la contrahuella no varía más de 1 cm entre plantas", () => {
    // PB de 2,63 m (16 peldaños de 16,44) y plantas de 3,50 m (20 de 17,50): 1,06 cm.
    const j = conEdificio(conAlturas("plurifamiliar", { g1: 3.5, g2: 2.63 }));
    const c = esc(j, "escalera-comun");
    expect(c.variacion_cm).toBeCloseTo(1.06, 2);
    expect(c.fallos).toContain("variacion");
    expect(sua1.textoIncumplimiento(el(j, "escalera-comun"))!.detalle).toMatch(/más de 1 cm/);
  });

  it("rampa del garaje con peatones: 16 % cumple, 16,1 % no", () => {
    expect(el(caso("plurifamiliar", { rampaGaraje: "peatones" }), "rampa-garaje").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { rampaGaraje: "peatones", pendienteGaraje_pct: 16.1 });
    expect(el(j, "rampa-garaje").veredicto).toBe("fail");
    expect(sua1.arreglo!(el(j, "rampa-garaje"), j)!.cambios).toEqual({ pendienteGaraje_pct: 16 });
  });

  it("rampa de acceso: el límite cambia con la longitud del tramo y el tramo no pasa de 9 m", () => {
    expect(el(caso("plurifamiliar", { acceso: "rampa", rampaLongitud_m: 2.99, rampaPendiente_pct: 10 }), "rampa-acceso").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { acceso: "rampa", rampaLongitud_m: 3, rampaPendiente_pct: 10 });
    expect(el(j, "rampa-acceso").veredicto).toBe("fail");
    expect(sua1.arreglo!(el(j, "rampa-acceso"), j)!.cambios).toEqual({ rampaPendiente_pct: 8 });
    expect(el(caso("plurifamiliar", { acceso: "rampa", rampaLongitud_m: 9.5, rampaPendiente_pct: 6 }), "rampa-acceso").detalle).toMatchObject({ fallos: ["longitud"] });
    expect(caso("unifamiliar", { acceso: "rampa" }).elementos.map((e) => e.id)).not.toContain("rampa-acceso");
  });

  it("oficinas con uso público: 17,5 cm y 2,25 m aunque haya ascensor; esfera de 15 cm", () => {
    const j = caso("oficinas", { usoPublico: "si" });
    expect(esc(j, "escalera-comun")).toMatchObject({ usoPublico: true, cMax_cm: 17.5, tramoMax_m: 2.25, prolongacion: true });
    expect(esc(j, "escalera-garaje").usoPublico).toBe(false);
    expect(el(j, "barreras-baja").detalle).toMatchObject({ esfera_cm: 15 });
  });

  it("escalera interior: anchura de 0,79 m no cumple", () => {
    const j = caso("unifamiliar", { interiorAnchura_m: 0.79 });
    expect(esc(j, "escalera-interior").fallos).toEqual(["anchura"]);
    expect(sua1.arreglo!(el(j, "escalera-interior"), j)!.cambios).toEqual({ interiorAnchura_m: "habitual" });
  });

  it("cubierta transitable: barrera perimetral por su cota", () => {
    const e = edificioDeCaso("plurifamiliar");
    const j = conEdificio({ ...e, cubierta: { ...e.cubierta, tipo: "plana_transitable" } });
    expect(el(j, "barreras-cubierta").detalle).toMatchObject({ cotaMax_m: 12, min_m: 1.1, altura_m: 1.1 });
    expect(textoPlanoMemoria(sua1.memoria(j))).toMatch(/cubierta transitable/);
  });
});

describe("SUA1 · el ascensor supuesto", () => {
  it("se avisa solo si cambia el resultado: una PB de 4,60 m pide 3 tramos sin ascensor", () => {
    const e = conAlturas("plurifamiliar", { g2: 4.6 });
    const j = conEdificio(e);
    expect(j.contexto.ascensor).toEqual({ valor: true, supuesto: true });
    expect(j.avisos.map((a) => a.id)).toEqual(["ascensor-supuesto"]);
    expect(sua1.avisosAEdificio!.has("ascensor-supuesto")).toBe(true);
    expect(sua1.textoAviso(j.avisos[0]).titulo).toMatch(/ascensor/);
    // Indicado, no se avisa.
    expect(conEdificio(cambiarAscensor(e, true)).avisos).toEqual([]);
    // Sin ascensor, los tramos habituales pasan a 3 y cumple.
    const sin = conEdificio(cambiarAscensor(e, false));
    expect(esc(sin, "escalera-comun")).toMatchObject({ tramos: 3, fallos: [] });
  });
});

describe("SUA1 · memoria, ficha y dibujo", () => {
  it("los cuatro casos", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const edificio = edificioDeCaso(c);
      const j = caso(c);
      const texto = textoPlanoMemoria(sua1.memoria(j));
      expect(texto).toMatch(/SUA 1-3\.2\.1/);
      expect(texto).toMatch(c === "oficinas" ? /clase 1/ : /no se exige clase de resbaladicidad/);
      const dibujo = sua1.dibujo(j, edificio);
      expect(new Set(dibujo.etiquetas.map((e) => e.elementoId))).toEqual(new Set(j.elementos.map((e) => e.id)));
      expect(dibujo.marcas.some((m) => m.tipo === "linea" && m.elementoId?.startsWith("escalera-"))).toBe(true);
      const ficha = sua1.ficha(j, { estado: sua1EstadoDefaults, edificio, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(ficha.verificaciones).toHaveLength(j.elementos.length);
      expect(sua1.frase(j)).toMatch(/Cumple SUA 1/);
      expect(sua1.describirDibujo(j).length).toBeGreaterThan(20);
      expect(sua1.queEntra(j, {})).toHaveLength(j.elementos.length);
    }
  });

  it("lo que no cumple va a la frase", () => {
    const j = caso("plurifamiliar", { barreraAlta_m: 1 });
    expect(j.veredicto).toBe("fail");
    expect(sua1.frase(j)).toMatch(/barrera baja/);
  });
});
