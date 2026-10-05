import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { aplicabilidadBase, atributosDe } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { he5 } from "../definicion";
import { he5EstadoDefaults, type He5Estado } from "../estado";
import { justificarHe5, type DetalleHe5, type JustificacionHe5 } from "../justificacion";
import { potenciaP1, potenciaP2 } from "../tablas";

// =============================================================================
// HE 5 · Generación mínima de energía eléctrica renovable (feature-22). Cifras y
// criterios: research/verificacion-he4-he5.md (bloques H–K y K-HE5).
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
const dg = demo.datosGenerales;
const con = (edificio: Edificio, estado: Partial<He5Estado> = {}, justificaciones: Proyecto["justificaciones"] = {}) =>
  justificarHe5({ ...he5EstadoDefaults, ...estado }, { edificio, datosGenerales: dg, justificaciones });
const caso = (c: CasoEdificio, estado: Partial<He5Estado> = {}) => con(edificioDeCaso(c), estado);
const detalle = <C extends DetalleHe5["clase"]>(j: JustificacionHe5, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleHe5, { clase: C }> | undefined;
const avisos = (j: JustificacionHe5) => j.avisos.map((a) => a.id);

/** Todas las zonas con su superficie construida = útil × `f` (indicada). */
function conConstruida(e: Edificio, f = 1.2): Edificio {
  for (const g of e.grupos) for (const z of g.zonas) z.superficieConstruida_m2 = Math.round(z.superficieUtil_m2 * f);
  return e;
}

describe("HE5 · las fórmulas del DB", () => {
  it("P1 = Fpr;el·S con 0,005 en residencial privado y 0,010 en el resto; P2 = 0,1·(0,5·Sc − Soc)", () => {
    expect(potenciaP1(1000, 0)).toBeCloseTo(5, 12);
    expect(potenciaP1(0, 1000)).toBeCloseTo(10, 12);
    expect(potenciaP1(1176, 192)).toBeCloseTo(7.8, 12);
    expect(potenciaP2(210, 0)).toBeCloseTo(10.5, 12);
    expect(potenciaP2(210, 30)).toBeCloseTo(7.5, 12);
    expect(potenciaP2(100, 60)).toBeLessThan(0);
  });
});

describe("HE5 · con El edificio", () => {
  it("los cuatro casos: la unifamiliar no llega a 1000 m²; los demás, sí (con el garaje)", () => {
    expect(caso("unifamiliar")).toMatchObject({ aplica: false });
    expect(caso("unifamiliar").elementos.map((e) => e.id)).toEqual(["superficie"]);
    expect(aplicabilidadBase(atributosDe(dg, edificioDeCaso("unifamiliar"))).he5.aplicabilidad).toBe("no_aplica");
    for (const c of ["plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      expect(caso(c).aplica, c).toBe(true);
      expect(aplicabilidadBase(atributosDe(dg, edificioDeCaso(c))).he5.aplicabilidad, c).toBe("aplica");
    }
    const s = detalle(caso("plurifamiliar"), "superficie")!;
    expect(s).toMatchObject({ s_m2: 1370, util_m2: 1140, supuesta: true });
    expect(s.garaje_m2).toBe(552);
  });

  it("plurifamiliar: P1 manda (6,85 kW frente a P2 = 10,50 kW) y se instala la mínima", () => {
    const j = caso("plurifamiliar");
    expect(detalle(j, "potencia")).toMatchObject({ p1_kW: 6.85, p2_kW: 10.5, pmin_kW: 6.85, manda: "p1", instalada_kW: 6.85, minima: true });
    expect(j.veredicto).toBe("ok");
    // La construida supuesta cambia P1: aviso. Indicada, no.
    expect(avisos(j)).toContain("construida");
    expect(avisos(con(conConstruida(edificioDeCaso("plurifamiliar"))))).not.toContain("construida");
  });

  it("edificio mixto: cada uso con su factor, el local a 0,010, y aviso de criterio", () => {
    const j = caso("plurifamiliar_locales");
    expect(detalle(j, "p1")).toMatchObject({ residencial_m2: 1176, resto_m2: 192, p1_kW: 7.8 });
    expect(j.mixto).toBe(true);
    expect(avisos(j)).toContain("mixto");
    expect(avisos(caso("oficinas"))).not.toContain("mixto");
    expect(detalle(caso("oficinas"), "p1")).toMatchObject({ resto_m2: 1440, p1_kW: 14.4 });
  });

  it("con poca cubierta manda P2; los captadores solares de HE 4 la reducen", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.cubierta.superficie_m2 = 100;
    expect(detalle(con(e), "potencia")).toMatchObject({ p2_kW: 5, pmin_kW: 5, manda: "p2" });
    const solar = con(e, {}, { he4: { inputs: { sistema: "solar", captadores_m2: 20 } } });
    expect(solar.captadores).toEqual({ solar: true, soc_m2: 20, supuesto: false });
    expect(detalle(solar, "potencia")).toMatchObject({ p2_kW: 3, pmin_kW: 3 });
    // Solar sin la superficie de captadores: se cuentan 0 y se avisa (P2 manda).
    const sinDar = con(e, {}, { he4: { inputs: { sistema: "solar" } } });
    expect(sinDar.captadores).toEqual({ solar: true, soc_m2: 0, supuesto: true });
    expect(avisos(sinDar)).toContain("captadores");
    // Con bomba de calor no hay captadores aunque quede una cifra guardada.
    expect(con(e, {}, { he4: { inputs: { captadores_m2: 20 } } }).captadores.soc_m2).toBe(0);
  });

  it("cubierta transitable: Sc = 0, P2 nula y Pmin = 0 (lectura literal), con aviso", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.cubierta.tipo = "plana_transitable";
    const j = con(e);
    expect(detalle(j, "potencia")).toMatchObject({ p2_kW: 0, pmin_kW: 0 });
    expect(avisos(j)).toContain("transitable");
    expect(he5.frase(j)).toMatch(/no se deriva potencia mínima/);
    // Una parte solo para conservación, indicada, cuenta.
    expect(detalle(con(e, { cubiertaNoTransitable_m2: 60 }), "potencia")).toMatchObject({ p2_kW: 3, pmin_kW: 3 });
  });

  it("menos potencia de la mínima no cumple, y el arreglo vuelve a la mínima", () => {
    const j = caso("plurifamiliar", { potencia_kW: 5 });
    const el = j.elementos.find((e) => e.id === "potencia")!;
    expect(el.veredicto).toBe("fail");
    expect(he5.textoIncumplimiento(el)!.titulo).toMatch(/no llega a la mínima/);
    expect(he5.arreglo!(el, j)).toMatchObject({ cambios: { potencia_kW: null } });
    expect(textoPlanoMemoria(he5.memoria(j))).toMatch(/NO CUMPLE/);
    expect(caso("plurifamiliar", { potencia_kW: 8 }).veredicto).toBe("ok");
  });

  it("los cuatro casos dan memoria, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      const e = edificioDeCaso(c);
      const j = con(e);
      const dibujo = he5.dibujo(j, e);
      const ficha = he5.ficha(j, { estado: he5EstadoDefaults, edificio: e, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB, c).toBe("DB-HE (consolidado 14-jun-2022)");
      expect(textoPlanoMemoria(he5.memoria(j)), c).toMatch(/HE 5/);
      for (const el of j.elementos) {
        expect(dibujo.etiquetas.some((x) => x.elementoId === el.id), `${c} ${el.id}`).toBe(true);
        expect(he5.franja(el, j, "ok").titulo, `${c} ${el.id}`).toBe(el.nombre);
      }
      if (j.aplica) expect(dibujo.marcas.some((m) => m.tipo === "icono" && m.icono === "fotovoltaica"), c).toBe(true);
    }
  });
});
