import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { sua2 } from "../definicion";
import { sua2EstadoDefaults, type Sua2Estado } from "../estado";
import { justificarSua2 } from "../justificacion";
import { ALTURAS_SUA2_1_1, filaVidrioSua2, VIDRIOS_SUA2_TABLA_1_1 } from "../tablas";

// =============================================================================
// SUA 2 · Impacto y atrapamiento (feature-20). Cifras:
// research/verificacion-sua2-sua5.md, bloques B1 y B2.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const CASOS = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const;
const con = (edificio: Edificio, estado: Partial<Sua2Estado> = {}) => justificarSua2({ ...sua2EstadoDefaults, ...estado }, { edificio, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Sua2Estado> = {}) => con(edificioDeCaso(c), estado);
const ids = (c: CasoEdificio) => caso(c).elementos.map((e) => e.id);

describe("SUA2 · tablas", () => {
  it("alturas de ap. 1.1 y casillas de la tabla 1.1", () => {
    expect(ALTURAS_SUA2_1_1.datos).toMatchObject({ alturaLibrePaso_usoRestringido_m: 2.1, alturaLibrePaso_resto_m: 2.2, alturaLibreUmbralPuertas_m: 2 });
    const f = VIDRIOS_SUA2_TABLA_1_1.datos.filas;
    expect(f.mayor12).toMatchObject({ X: "cualquiera", Y: "B o C", Z: "1" });
    expect(f.entre055y12).toMatchObject({ X: "cualquiera", Y: "B o C", Z: "1 ó 2" });
    expect(f.menor055).toMatchObject({ X: "1, 2 ó 3", Y: "B o C", Z: "cualquiera" });
  });

  it("filas: «menor que» y «mayor que» estrictos; 0,55 y 12 m justos, «comprendida entre»", () => {
    expect([0, 0.54, 0.55, 3, 12, 12.01].map(filaVidrioSua2)).toEqual(["menor055", "menor055", "entre055y12", "entre055y12", "entre055y12", "mayor12"]);
  });
});

describe("SUA2 · justificación", () => {
  it("unifamiliar: solo 2,10 m, sin barrido de puertas ni señalización de vidrios", () => {
    const j = caso("unifamiliar");
    expect(j.clases).toEqual(["vivienda"]);
    expect(ids("unifamiliar")).toEqual(
      expect.arrayContaining(["altura-vivienda", "automaticas", "vidrios-menor055", "vidrios-entre055y12", "mamparas", "atrapamiento"]),
    );
    expect(ids("unifamiliar")).not.toContain("puertas");
    expect(ids("unifamiliar")).not.toContain("senalizacion");
    expect(j.elementos.find((e) => e.id === "altura-vivienda")!.limite).toEqual({ valor: 2.1, unidad: "m" });
    expect(j.veredicto).toBe("ok");
  });

  it("plurifamiliar: zonas comunes y garaje a 2,20 m; P1–P3 en la fila 0,55–12 m", () => {
    const j = caso("plurifamiliar");
    expect(j.clases).toEqual(["vivienda", "comun", "garaje"]);
    const v = j.elementos.find((e) => e.id === "vidrios-entre055y12")!.detalle;
    expect(v.clase === "vidrios" && v.plantas.map((p) => p.etiqueta)).toEqual(["P3", "P2", "P1"]);
    expect(ids("plurifamiliar")).toEqual(expect.arrayContaining(["puertas", "senalizacion"]));
    expect(j.veredicto).toBe("ok");
  });

  it("con locales y oficinas: el local se deja previsto; las oficinas a 2,20 m", () => {
    expect(caso("plurifamiliar_locales").elementos.find((e) => e.id.startsWith("local-"))!.veredicto).toBe("previsto");
    const o = caso("oficinas");
    expect(o.clases).toEqual(["comun", "garaje", "oficinas"]);
    expect(o.elementos.find((e) => e.id === "altura-oficinas")!.limite).toEqual({ valor: 2.2, unidad: "m" });
  });

  it("más de 12 m: la planta P5 (cota 15 m) va a la fila de más de 12 m; la P4 (12 m justos), no", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.grupos[0].repeticiones = 5;
    const j = con(e);
    const fila = (id: string) => j.elementos.find((x) => x.id === id)?.detalle;
    const mayor = fila("vidrios-mayor12");
    expect(mayor?.clase === "vidrios" && mayor.plantas.map((p) => p.etiqueta)).toEqual(["P5"]);
    const entre = fila("vidrios-entre055y12");
    expect(entre?.clase === "vidrios" && entre.plantas.map((p) => p.cota_m)).toContain(12);
    // Con plantas iguales comprimidas en una banda, cada fila sigue teniendo su etiqueta.
    const dibujo = sua2.dibujo(j, e);
    expect(dibujo.bandas.length).toBe(1);
    expect(dibujo.etiquetas.map((x) => x.elementoId).sort()).toEqual(j.elementos.map((x) => x.id).sort());
  });

  it("altura: «como mínimo», la igualdad cumple", () => {
    expect(caso("plurifamiliar", { alturaVivienda_m: 2.1 }).elementos.find((e) => e.id === "altura-vivienda")!.veredicto).toBe("ok");
    expect(caso("plurifamiliar", { alturaVivienda_m: 2.09 }).elementos.find((e) => e.id === "altura-vivienda")!.veredicto).toBe("fail");
    const j = caso("plurifamiliar", { alturaGaraje_m: 2.15 });
    const el = j.elementos.find((e) => e.id === "altura-garaje")!;
    expect(el.veredicto).toBe("fail");
    expect(sua2.arreglo!(el, j)).toEqual({ etiqueta: "Volver a 2,20 m", cambios: { alturaGaraje_m: "habitual" } });
    expect(sua2.frase(j)).toMatch(/2,15 m, menor que los 2,20 m/);
  });

  it("puertas que barren el pasillo: no cumple, y el arreglo vuelve a lo habitual", () => {
    const j = caso("plurifamiliar", { puertas: "invaden" });
    const el = j.elementos.find((e) => e.id === "puertas")!;
    expect(el.veredicto).toBe("fail");
    expect(sua2.arreglo!(el, j)).toEqual({ etiqueta: "Que no barran el pasillo", cambios: { puertas: "habitual" } });
    expect(caso("plurifamiliar", { puertas: "pasillo_ancho" }).veredicto).toBe("ok");
  });

  it("aviso del garaje: sale con la altura supuesta, no si se indica", () => {
    expect(caso("plurifamiliar").avisos.map((a) => a.id)).toContain("garaje-altura");
    expect(caso("plurifamiliar", { alturaGaraje_m: 2.3 }).avisos).toHaveLength(0);
    expect(caso("unifamiliar").avisos).toHaveLength(0);
  });
});

describe("SUA2 · memoria, ficha y dibujo", () => {
  it("los cuatro casos", () => {
    for (const c of CASOS) {
      const j = caso(c);
      const texto = textoPlanoMemoria(sua2.memoria(j));
      expect(texto).toMatch(/altura libre de paso/);
      expect(texto).toMatch(/UNE-EN 12600:2003/);
      if (c === "unifamiliar") expect(texto).toMatch(/no se aplica al interior de las viviendas/);
      const dibujo = sua2.dibujo(j, edificioDeCaso(c));
      // Cada elemento tiene su etiqueta pulsable.
      expect(dibujo.etiquetas.map((e) => e.elementoId).sort()).toEqual(j.elementos.map((e) => e.id).sort());
      const ficha = sua2.ficha(j, { estado: sua2EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(ficha.verificaciones).toHaveLength(j.elementos.length);
      expect(sua2.frase(j).length).toBeGreaterThan(20);
    }
  });
});
