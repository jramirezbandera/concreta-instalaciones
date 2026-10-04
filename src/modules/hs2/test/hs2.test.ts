import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { aplicabilidadBase, atributosDe } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { hs2 } from "../definicion";
import { hs2EstadoDefaults, type Hs2Estado } from "../estado";
import { justificarHs2, type DetalleHs2, type JustificacionHs2 } from "../justificacion";
import {
  ALMACEN_HS2,
  arriba2,
  capacidadInmediato,
  FRACCIONES,
  RESERVA_HS2,
  superficieAlmacen,
  superficieReserva,
  SUPUESTOS_A2_HS2,
} from "../tablas";

// =============================================================================
// HS 2 · Recogida y evacuación de residuos (feature-21). Cifras y ejemplos:
// research/verificacion-hs2.md (B2, B6 y «Criterios de proyecto»).
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
const dg = demo.datosGenerales;
const con = (edificio: Edificio, estado: Partial<Hs2Estado> = {}) => justificarHs2({ ...hs2EstadoDefaults, ...estado }, { edificio, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Hs2Estado> = {}) => con(edificioDeCaso(c), estado);
const detalle = <C extends DetalleHs2["clase"]>(j: JustificacionHs2, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleHs2, { clase: C }> | undefined;

/** El caso «Plurifamiliar con locales» con un cuarto de residuos de `m2` en el sótano. */
function conCuarto(m2: number): Edificio {
  const e = edificioDeCaso("plurifamiliar_locales");
  const s1 = e.grupos.find((g) => g.nivelInicial === -1)!;
  s1.zonas.push({ id: "zr", uso: "instalaciones", cuarto: "residuos", superficieUtil_m2: m2 });
  return e;
}

describe("HS2 · las cuentas del DB", () => {
  it("Ff de la tabla 2.2 es Tf·Gf·Cf con los valores de la tabla A.2", () => {
    const A = SUPUESTOS_A2_HS2.datos;
    const T = ALMACEN_HS2.datos;
    for (const f of FRACCIONES) {
      expect(A.tf[f] * T.gf[f] * T.cf[A.contenedor], f).toBeCloseTo(RESERVA_HS2.datos.ff[f], 3);
    }
  });

  it("con las cinco fracciones, SR = 0,268·P (con Mf = 4 en «varios» y sin el 0,8)", () => {
    expect(superficieReserva(1, FRACCIONES)).toBeCloseTo(0.268, 9);
    expect(superficieReserva(4, FRACCIONES)).toBeCloseTo(1.072, 9);
    expect(arriba2(superficieReserva(4, FRACCIONES))).toBe(1.08);
    expect(arriba2(superficieReserva(40, FRACCIONES))).toBe(10.72);
  });

  it("S = 0,8·P·Σ(Tf·Gf·Cf·Mf): con los valores de la tabla A.2, 0,8 × la reserva exacta", () => {
    const A = SUPUESTOS_A2_HS2.datos;
    const s = superficieAlmacen(21, FRACCIONES.map((f) => ({ f, tf: A.tf[f], contenedor: A.contenedor })));
    expect(s).toBeCloseTo(0.8 * 21 * 0.268236, 6);
    expect(arriba2(s)).toBe(4.51);
    // Un contenedor menor ocupa más por litro: Cf de 120 l = 0,0050.
    expect(superficieAlmacen(10, [{ f: "envases", tf: 2, contenedor: 120 }])).toBeCloseTo(0.8 * 10 * 2 * 8.4 * 0.005, 9);
  });

  it("el redondeo hacia arriba no se come la coma flotante", () => {
    expect(arriba2(5.628)).toBe(5.63);
    expect(arriba2(6.7)).toBe(6.7);
    expect(arriba2(0.1 + 0.2)).toBe(0.3);
  });

  it("almacenamiento inmediato: C = CA·Pv, con 45 dm³ como mínimo por fracción", () => {
    expect(capacidadInmediato("papel", 5)).toEqual({ calculada_dm3: 54.25, exigida_dm3: 54.25 });
    expect(capacidadInmediato("envases", 5)).toEqual({ calculada_dm3: 39, exigida_dm3: 45 });
    expect(capacidadInmediato("varios", 5).exigida_dm3).toBe(52.5);
    expect(capacidadInmediato("vidrio", 2).exigida_dm3).toBe(45);
  });
});

describe("HS2 · con El edificio", () => {
  it("el Demo: P = 21 (A con un doble, B sin más dobles), solo espacio de reserva de 5,63 m² en la planta baja", () => {
    const j = con(demo.edificio);
    expect(j.p).toBe(21);
    expect(j.viviendas.map((v) => [v.nombre, v.cantidad, v.pv])).toEqual([
      ["A", 3, 4],
      ["B", 3, 3],
    ]);
    expect(detalle(j, "reserva")).toMatchObject({ exigida_m2: 5.63, dada_m2: 5.63, origen: "exigida" });
    expect(detalle(j, "almacen")).toBeUndefined();
    expect(detalle(j, "caracteristicas")).toBeUndefined();
    expect(detalle(j, "recorrido")).toMatchObject({ ubicacion: "planta_baja", espacio: "reserva" });
    expect(j.avisos.map((a) => a.id)).toEqual(["recogida", "dobles"]);
    expect(j.veredicto).toBe("ok");
  });

  it("los cuatro casos", () => {
    expect(caso("plurifamiliar").p).toBe(25);
    expect(detalle(caso("plurifamiliar"), "reserva")!.exigida_m2).toBe(6.7);
    const u = caso("unifamiliar");
    expect(u).toMatchObject({ p: 5, unifamiliar: true });
    expect(detalle(u, "reserva")!.exigida_m2).toBe(1.34);
    expect(detalle(u, "recorrido")!.ubicacion).toBe("exterior");
    // Con solo espacio de reserva, la unifamiliar guarda las cinco fracciones en casa (ap. 2.3 pto 2).
    expect(detalle(u, "inmediato")!.enAlmacen).toEqual([]);
    const o = caso("oficinas");
    expect(o).toMatchObject({ residencial: false, elementos: [], veredicto: "ok" });
  });

  it("sin viviendas, HS 2 no aplica: estudio específico", () => {
    const a = aplicabilidadBase(atributosDe(dg, edificioDeCaso("oficinas")));
    expect(a.hs2.aplicabilidad).toBe("no_aplica");
    expect(a.hs2.nota).toMatch(/estudio específico/);
    expect(aplicabilidadBase(atributosDe(dg, edificioDeCaso("unifamiliar"))).hs2.aplicabilidad).toBe("aplica");
  });

  it("los dormitorios dobles indicados: suben P y quitan el aviso", () => {
    const j = con(demo.edificio, { dobles: { A: 3, B: 2 } });
    expect(j.viviendas.map((v) => v.pv)).toEqual([6, 4]);
    expect(j.p).toBe(30);
    expect(j.avisos.map((a) => a.id)).toEqual(["recogida"]);
    // No más dobles que dormitorios.
    expect(con(demo.edificio, { dobles: { A: 9 } }).viviendas[0].dobles).toBe(3);
  });

  it("un estudio sin dormitorio cuenta Pv = 2 (criterio)", () => {
    const e = edificioDeCaso("plurifamiliar");
    const a = e.unidades.find((u) => u.id === "A")!;
    if (a.clase === "vivienda") a.dormitorios = 0;
    expect(con(e).viviendas.find((v) => v.tipoId === "A")!.pv).toBe(2);
  });

  it("puerta a puerta: almacén con la tabla A.2 supuesta, sus características y la dispensa de papel y vidrio en la unifamiliar", () => {
    const j = caso("plurifamiliar", { recogida: "puerta" });
    expect(detalle(j, "reserva")).toBeUndefined();
    expect(detalle(j, "almacen")).toMatchObject({ exigida_m2: arriba2(0.8 * 25 * 0.268236), origen: "exigida" });
    expect(j.avisos.map((a) => a.id)).toEqual(["dobles", "periodos"]);
    const c = detalle(j, "caracteristicas")!;
    expect(c.ventilacion_l_s).toBeCloseTo(10 * c.s_m2, 1);
    expect(detalle(caso("unifamiliar", { recogida: "puerta" }), "inmediato")!.enAlmacen).toEqual(["papel", "vidrio"]);
    // Con los datos del servicio, sin aviso de periodos.
    const todos = Object.fromEntries(FRACCIONES.map((f) => [f, 2]));
    const conts = Object.fromEntries(FRACCIONES.map((f) => [f, 240]));
    expect(caso("plurifamiliar", { recogida: "puerta", periodos: todos, contenedores: conts }).avisos.map((a) => a.id)).not.toContain("periodos");
  });

  it("por fracción: almacén y reserva a la vez; soterrados o neumática, ni uno ni otro", () => {
    const j = caso("plurifamiliar", { recogida: "fraccion", modos: { organica: "puerta", varios: "puerta" } });
    expect(detalle(j, "almacen")!.fracciones.map((x) => x.f)).toEqual(["organica", "varios"]);
    expect(detalle(j, "reserva")!.fracciones).toEqual(["papel", "envases", "vidrio"]);
    expect(detalle(j, "recorrido")!.espacio).toBe("ambos");
    const otro = Object.fromEntries(FRACCIONES.map((f) => [f, "otro"]));
    const n = caso("plurifamiliar", { recogida: "fraccion", modos: otro });
    expect(n.elementos.map((e) => e.id)).toEqual(["ocupantes", "inmediato-A", "inmediato-B"]);
  });

  it("la superficie indicada que se queda corta no cumple, y el arreglo vuelve a la exigida", () => {
    const j = caso("plurifamiliar", { superficieReserva_m2: 5 });
    const r = j.elementos.find((e) => e.id === "reserva")!;
    expect(r.veredicto).toBe("fail");
    expect(j.veredicto).toBe("fail");
    expect(hs2.textoIncumplimiento(r)!.titulo).toBe("El espacio de reserva se queda corto.");
    expect(hs2.arreglo!(r, j)).toMatchObject({ cambios: { superficieReserva_m2: null } });
  });

  it("el cuarto de residuos de El edificio manda: su superficie y su planta (el sótano, con aviso)", () => {
    const corto = con(conCuarto(4));
    expect(detalle(corto, "reserva")).toMatchObject({ dada_m2: 4, origen: "edificio", exigida_m2: 5.63 });
    expect(corto.decisiones.ubicacion).toBe("sotano");
    expect(corto.avisos.map((a) => a.id)).toContain("sotano");
    const r = corto.elementos.find((e) => e.id === "reserva")!;
    const arreglo = hs2.arreglo!(r, corto)!;
    const ampliado = arreglo.edificio!(conCuarto(4));
    expect(detalle(con(ampliado), "reserva")).toMatchObject({ dada_m2: 5.63, origen: "edificio" });
    expect(con(ampliado).veredicto).toBe("ok");
  });

  it("los cuatro casos dan memoria, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      const e = edificioDeCaso(c);
      const j = con(e);
      const memoria = textoPlanoMemoria(hs2.memoria(j));
      const dibujo = hs2.dibujo(j, e);
      const ficha = hs2.ficha(j, { estado: hs2EstadoDefaults, edificio: e, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB, c).toBe("DB-HS (consolidado 14-jun-2022)");
      if (c === "oficinas") {
        expect(memoria).toMatch(/estudio específico/);
        continue;
      }
      expect(memoria, c).toMatch(/P = \d+/);
      expect(memoria, c).toMatch(/espacio de reserva/);
      expect(memoria, c).toMatch(/45 dm³/);
      expect(dibujo.etiquetas.map((x) => x.elementoId), c).toEqual(expect.arrayContaining(["ocupantes", "reserva", "recorrido"]));
      expect(dibujo.marcas.some((m) => m.tipo === "icono" && m.icono === "contenedor" && m.elementoId === "reserva"), c).toBe(true);
      // Cada elemento tiene su etiqueta en el dibujo y su franja.
      for (const el of j.elementos) {
        expect(dibujo.etiquetas.some((x) => x.elementoId === el.id), `${c} ${el.id}`).toBe(true);
        expect(hs2.franja(el, j, "ok").cita, el.id).toMatch(/HS 2/);
      }
    }
    expect(textoPlanoMemoria(hs2.memoria(caso("plurifamiliar_locales")))).toMatch(/locales con otros usos se justificarán mediante un estudio específico/);
    expect(textoPlanoMemoria(hs2.memoria(caso("plurifamiliar", { recogida: "puerta" })))).toMatch(/tabla 3\.1/);
  });
});
