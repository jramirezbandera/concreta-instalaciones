import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { aplicabilidadBase, atributosDe } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { rebtEstadoDefaults } from "../../rebt/estado";
import { justificarRebt, type DetalleRebt, type JustificacionRebt } from "../../rebt/justificacion";
import { he6 } from "../definicion";
import { he6EstadoDefaults, type He6Estado } from "../estado";
import { justificarHe6, type DetalleHe6, type JustificacionHe6 } from "../justificacion";
import { conduccionMinima, estacionesAccesibles, estacionesPorPlazas } from "../tablas";

// =============================================================================
// DB-HE 6 · Dotaciones mínimas para la recarga de vehículos eléctricos
// (feature-24). Cifras y criterios: research/verificacion-he6.md (los ejemplos
// son los de su bloque C).
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
const dg = demo.datosGenerales;
type Justs = Proyecto["justificaciones"];
const con = (edificio: Edificio, estado: Partial<He6Estado> = {}, justificaciones: Justs = {}) =>
  justificarHe6({ ...he6EstadoDefaults, ...estado }, { edificio, datosGenerales: dg, justificaciones });
const detalle = <C extends DetalleHe6["clase"]>(j: JustificacionHe6, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleHe6, { clase: C }> | undefined;
const avisos = (j: JustificacionHe6) => j.avisos.map((a) => a.id);
const he6Guardado = (estado: Partial<He6Estado>): Justs => ({ he6: { inputs: estado } }) as unknown as Justs;

/** Las oficinas con `n` plazas en el garaje (de 300 m² útiles: uso Aparcamiento). */
function oficinas(n: number): Edificio {
  const e = edificioDeCaso("oficinas");
  e.grupos[2].zonas[0].plazas = n;
  return e;
}

/** La unifamiliar sin su garaje. */
function unifamiliarSinGaraje(): Edificio {
  const e = edificioDeCaso("unifamiliar");
  for (const g of e.grupos) g.zonas = g.zonas.filter((z) => z.uso !== "garaje_privado");
  e.grupos = e.grupos.filter((g) => g.zonas.length > 0);
  return e;
}

describe("HE 6 · las tablas", () => {
  it("el 20 % por exceso, sin el error de la coma flotante: 15 plazas → 3, no 4", () => {
    expect([10, 11, 15, 40, 41, 50, 250].map(conduccionMinima)).toEqual([2, 3, 3, 8, 9, 10, 50]);
  });

  it("una estación por cada 40 plazas o fracción; 20 en la Administración General del Estado", () => {
    expect([11, 40, 41, 250].map((n) => estacionesPorPlazas(n, false))).toEqual([1, 1, 2, 7]);
    expect(estacionesPorPlazas(50, true)).toBe(3);
  });

  it("una por cada 5 plazas accesibles, por exceso (criterio)", () => {
    expect([0, 1, 5, 6, 12].map(estacionesAccesibles)).toEqual([0, 1, 1, 2, 3]);
  });
});

describe("HE 6 · otros usos", () => {
  it("10 plazas o menos en un edificio sin viviendas: excluido", () => {
    const j = con(oficinas(10));
    expect(j.aplica).toBe(false);
    expect(detalle(j, "plazas")).toMatchObject({ plazas: 10, excluido: true });
    expect(he6.frase(j)).toBe("10 plazas en un edificio sin viviendas, 10 o menos: HE 6 no se aplica.");
  });

  it("los ejemplos de la verificación: conducción ⌈N/5⌉ y estaciones ⌈N/40⌉", () => {
    for (const [n, cond, est] of [
      [11, 3, 1],
      [15, 3, 1],
      [41, 9, 2],
      [250, 50, 7],
    ] as const) {
      const j = con(oficinas(n));
      expect(detalle(j, "conduccion"), `${n}`).toMatchObject({ exigidas: cond, previstas: cond, minimas: true });
      expect(detalle(j, "estaciones"), `${n}`).toMatchObject({ minimo: est, instaladas: est });
      expect(j.veredicto).toBe("ok");
    }
    // 250 plazas: 5 accesibles de SUA 9, una estación en ellas, dentro de las 7.
    expect(detalle(con(oficinas(250)), "estaciones")).toMatchObject({ accesibles: 5, accesiblesSua: true, porAccesibles: 1, minimo: 7 });
  });

  it("la Administración General del Estado sustituye el 1/40 por 1/20", () => {
    expect(detalle(con(oficinas(50), { age: true }), "estaciones")).toMatchObject({ porPlazas: 3, minimo: 3 });
  });

  it("las plazas accesibles indicadas suben el mínimo y avisan del redondeo", () => {
    const j = con(oficinas(40), { plazasAccesibles: 12 });
    expect(detalle(j, "estaciones")).toMatchObject({ porPlazas: 1, accesibles: 12, accesiblesSua: false, porAccesibles: 3, minimo: 3 });
    expect(avisos(j)).toContain("accesibles");
    expect(avisos(con(oficinas(40), { plazasAccesibles: 10 }))).not.toContain("accesibles"); // grupos completos
  });

  it("las plazas exteriores cuentan para el ámbito y la dotación", () => {
    const j = con(oficinas(8), { plazasExteriores: 30 });
    expect(detalle(j, "plazas")).toMatchObject({ interiores: 8, exteriores: 30, plazas: 38, aplica: true });
    expect(detalle(j, "conduccion")!.exigidas).toBe(8);
  });

  it("menos estaciones o conducción de las exigidas no cumple; las plazas con estación cuentan como conducción", () => {
    const j = con(oficinas(50), { estaciones: 1, plazasConduccion: 5 });
    expect(j.veredicto).toBe("fail");
    expect(he6.textoIncumplimiento(j.elementos.find((e) => e.id === "estaciones")!)!.titulo).toBe("Faltan estaciones de recarga.");
    expect(he6.arreglo!(j.elementos.find((e) => e.id === "conduccion")!, j)).toEqual({ etiqueta: "Conducción hasta 10 plazas", cambios: { plazasConduccion: null } });
    expect(detalle(con(oficinas(50), { estaciones: 12, plazasConduccion: 0 }), "conduccion")).toMatchObject({ previstas: 12, exigidas: 10 });
  });

  it("el esquema habitual es el de circuitos adicionales (4b) y la estación, 3,68 kW", () => {
    const j = con(oficinas(50));
    expect(detalle(j, "esquema")).toMatchObject({ esquema: "4", subesquema: "4b", habitual: true });
    expect(detalle(j, "estacion")).toMatchObject({ potencia_W: 3680, estaciones: 2 });
    expect(detalle(con(oficinas(50), { potenciaEstacion_W: 7360 }), "estacion")!.potencia_W).toBe(7360);
    expect(detalle(con(oficinas(50), { potenciaEstacion_W: 5000 }), "estacion")!.potencia_W).toBe(3680); // fuera de las opciones
  });
});

describe("HE 6 · residencial privado", () => {
  it("el edificio de viviendas: conducción en todas las plazas y ninguna estación", () => {
    const j = con(edificioDeCaso("plurifamiliar"));
    expect(detalle(j, "conduccion")).toMatchObject({ uso: "residencial", plazas: 16, exigidas: 16, previstas: 16 });
    expect(detalle(j, "estaciones")).toBeUndefined();
    expect(detalle(j, "estacion")).toBeUndefined();
    expect(detalle(j, "esquema")).toMatchObject({ subesquema: "1a", habitual: true });
    expect(he6.frase(j)).toBe("16 plazas: conducción de cables hasta todas; ninguna estación exigida.");
  });

  it("menos del 100 % no cumple", () => {
    const j = con(edificioDeCaso("plurifamiliar"), { plazasConduccion: 10 });
    expect(j.veredicto).toBe("fail");
    expect(he6.frase(j)).toBe("16 plazas: la conducción de cables llega a 10, y debe llegar a todas.");
  });

  it("con locales: el criterio del uso característico, con aviso", () => {
    expect(avisos(con(edificioDeCaso("plurifamiliar_locales")))).toContain("mixto");
  });

  it("la unifamiliar con garaje lo cumple con el circuito C13, esquema 4a", () => {
    const j = con(edificioDeCaso("unifamiliar"));
    expect(detalle(j, "conduccion")).toMatchObject({ porC13: true, plazas: 1, previstas: 1 });
    expect(detalle(j, "esquema")).toMatchObject({ subesquema: "4a", unifamiliar: true });
    expect(detalle(con(edificioDeCaso("unifamiliar"), { esquema: "1" }), "esquema")!.esquema).toBe("4"); // obligado
  });

  it("la unifamiliar sin garaje: la plaza en la parcela de REBT", () => {
    const e = unifamiliarSinGaraje();
    expect(con(e).aplica).toBe(false);
    const j = con(e, {}, { rebt: { inputs: { ...rebtEstadoDefaults, plazaParcela: true } } } as unknown as Justs);
    expect(detalle(j, "plazas")).toMatchObject({ interiores: 0, exteriores: 1, parcela: true, aplica: true });
  });

  it("un edificio existente avisa de que se calcula obra nueva", () => {
    const j = justificarHe6(he6EstadoDefaults, { edificio: edificioDeCaso("plurifamiliar"), datosGenerales: { ...dg, intervencion: "reforma" }, justificaciones: {} });
    expect(avisos(j)).toContain("existente");
  });
});

describe("HE 6 · REBT lee las estaciones, su potencia y el esquema", () => {
  const recarga = (j: JustificacionRebt) => j.elementos.find((e) => e.id === "recarga")?.detalle as Extract<DetalleRebt, { clase: "recarga" }> | undefined;
  const rebt = (edificio: Edificio, justificaciones: Justs = {}, spl: "con_spl" | "sin_spl" | "habitual" = "habitual") =>
    justificarRebt({ ...rebtEstadoDefaults, spl }, { edificio, datosGenerales: dg, justificaciones });

  it("en oficinas, las estaciones instaladas por la potencia de su estación", () => {
    expect(recarga(rebt(oficinas(50)))).toMatchObject({ estaciones: 2, porEstacion_W: 3680, p_W: 7360 });
    expect(recarga(rebt(oficinas(50), he6Guardado({ estaciones: 3, potenciaEstacion_W: 7360 })))).toMatchObject({ estaciones: 3, porEstacion_W: 7360, p_W: 22080 });
    // Con las exteriores, el garaje de 10 plazas deja de estar excluido.
    expect(recarga(rebt(oficinas(10), he6Guardado({ plazasExteriores: 5 })))).toMatchObject({ plazas: 15, estaciones: 1 });
  });

  it("el SPL solo con el esquema colectivo de HE 6", () => {
    expect(recarga(rebt(edificioDeCaso("plurifamiliar"), {}, "con_spl"))).toMatchObject({ colectivo: true, spl: "con_spl", factor: 0.3 });
    expect(recarga(rebt(edificioDeCaso("plurifamiliar"), he6Guardado({ esquema: "2" }), "con_spl"))).toMatchObject({ colectivo: false, spl: "sin_spl", factor: 1 });
  });
});

describe("HE 6 · aplicabilidad", () => {
  it("sin aparcamiento o con 10 plazas sin viviendas no aplica; con viviendas y garaje, sí", () => {
    const base = (e: Edificio, j?: Justs) => aplicabilidadBase(atributosDe(dg, e, undefined, j)).he6;
    expect(base(unifamiliarSinGaraje())).toMatchObject({ aplicabilidad: "no_aplica", cita: "DB-HE 6, ámbito de aplicación" });
    expect(base(oficinas(10)).nota).toMatch(/10 plazas o menos/);
    expect(base(oficinas(10), he6Guardado({ plazasExteriores: 1 })).aplicabilidad).toBe("aplica");
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales"] as CasoEdificio[]) {
      expect(base(edificioDeCaso(c)).aplicabilidad, c).toBe("aplica");
    }
  });
});

describe("HE 6 · textos, memoria, ficha y dibujo", () => {
  it("los cuatro casos dan memoria, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      const e = c === "oficinas" ? oficinas(50) : edificioDeCaso(c);
      const j = con(e, c === "oficinas" ? { plazasAccesibles: 12 } : {});
      const dibujo = he6.dibujo(j, e);
      const ficha = he6.ficha(j, { estado: he6EstadoDefaults, edificio: e, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB, c).toBe("DB-HE (consolidado 14-jun-2022)");
      expect(textoPlanoMemoria(he6.memoria(j)), c).toMatch(/HE 6/);
      for (const el of j.elementos) {
        expect(dibujo.etiquetas.some((x) => x.elementoId === el.id), `${c} ${el.id}`).toBe(true);
        expect(he6.franja(el, j, "ok").titulo, `${c} ${el.id}`).toBe(el.nombre);
        expect(he6.resultadoLista(el).length, `${c} ${el.id}`).toBeGreaterThan(0);
      }
      for (const a of j.avisos) expect(he6.textoAviso(a).detalle.length, `${c} ${a.id}`).toBeGreaterThan(0);
    }
  });

  it("la memoria de oficinas da los cuatro contenidos del ap. 4", () => {
    const texto = textoPlanoMemoria(he6.memoria(con(oficinas(50), { plazasAccesibles: 12 })));
    expect(texto).toMatch(/a\) Esquema de conexión utilizado para el dimensionado: esquema 4b/);
    expect(texto).toMatch(/b\) .*10 plazas, el 20 %/);
    expect(texto).toMatch(/c\) Estaciones de recarga instaladas: 3 estaciones\. El mínimo es de 3 estaciones/);
    expect(texto).toMatch(/d\) Tipo de estación: .*monofásico, 230 V y 16 A, 3,68 kW/);
  });
});
