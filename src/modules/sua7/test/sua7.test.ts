import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { sua7 } from "../definicion";
import { sua7EstadoDefaults, type Sua7Estado } from "../estado";
import { justificarSua7, type ElementoSua7 } from "../justificacion";
import { SUA7_ESPERA, SUA7_ITINERARIOS, SUA7_PEATONES, SUA7_SENALIZACION } from "../tablas";

// =============================================================================
// SUA 7 · Vehículos en movimiento (feature-20). Cifras:
// research/verificacion-sua6-sua8.md, bloques A y C2.
// =============================================================================

const base = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const CASOS: CasoEdificio[] = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"];
const con = (edificio: Edificio, estado: Partial<Sua7Estado> = {}) => justificarSua7({ ...sua7EstadoDefaults, ...estado }, { edificio, datosGenerales: base });
const caso = (c: CasoEdificio, estado: Partial<Sua7Estado> = {}) => con(edificioDeCaso(c), estado);
const el = (j: { elementos: ElementoSua7[] }, id: string) => j.elementos.find((e) => e.id === id)!;

/** La plurifamiliar con el garaje cambiado. */
function conGaraje(cambio: Record<string, unknown>): Edificio {
  const e = edificioDeCaso("plurifamiliar");
  for (const g of e.grupos) g.zonas = g.zonas.map((z) => (z.uso === "garaje" ? { ...z, ...cambio } : z));
  return e;
}

/** La plurifamiliar sin el sótano (ni garaje). */
function sinGaraje(): Edificio {
  const e = edificioDeCaso("plurifamiliar");
  return { ...e, grupos: e.grupos.filter((g) => g.nivelInicial >= 0) };
}

/** El garaje en la planta baja, sin rampa. */
function garajeEnPB(): Edificio {
  const e = sinGaraje();
  const pb = e.grupos.find((g) => g.nivelInicial === 0)!;
  pb.zonas = [...pb.zonas, { id: "zg", uso: "garaje", superficieUtil_m2: 200, plazas: 8 }];
  return e;
}

describe("SUA7 · tablas", () => {
  it("las cifras del DB", () => {
    expect(SUA7_ESPERA.datos).toEqual({ fondoMin_m: 4.5, pendienteMax_pct: 5 });
    expect(SUA7_PEATONES.datos).toEqual({ anchuraMin_m: 0.8, barreraMin_m: 0.8 });
    expect(SUA7_ITINERARIOS.datos).toMatchObject({ plazasMayorQue: 200, superficieMayorQue_m2: 5000, desnivelExcede_m: 0.55 });
    expect(SUA7_SENALIZACION.datos.velocidadMax_km_h).toBe(20);
    expect(SUA7_ESPERA.procedencia).toMatchObject({ db: "DB-SUA", articulo: "SUA 7 ap. 2 pto 1" });
  });
});

describe("SUA7 · ámbito", () => {
  it("unifamiliar: excluida, un solo elemento", () => {
    const j = caso("unifamiliar");
    expect(j.motivo).toBe("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["ambito"]);
    expect(j.garaje).toBeNull();
  });

  it("sin garaje: un solo elemento", () => {
    const j = con(sinGaraje());
    expect(j.motivo).toBe("sin_garaje");
    expect(j.elementos.map((e) => e.id)).toEqual(["ambito"]);
    expect(j.veredicto).toBe("ok");
  });

  it("plurifamiliar y oficinas: uso Aparcamiento, todo con lo habitual", () => {
    for (const c of ["plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const j = caso(c);
      expect(j.motivo).toBe("aparcamiento");
      expect(j.rampa).toBe(true);
      expect(j.veredicto).toBe("ok");
      expect(j.avisos).toEqual([]);
      expect(j.elementos.map((e) => e.id)).toEqual(["ambito", "espera", "peatones", "itinerarios", "senalizacion", "alerta"]);
      expect(j.decisiones).toMatchObject({ salida: "ascendente", fondo_m: 5, pendiente_pct: 4, peatones: "no", alerta: "espejo_luminoso" });
    }
  });

  it("el ap. 3 no se aplica, con las cifras por planta", () => {
    const j = caso("plurifamiliar");
    expect(el(j, "itinerarios").detalle).toMatchObject({ plazasPlanta: 16, superficiePlanta_m2: 552, supera: false });
  });
});

describe("SUA7 · uso Aparcamiento: más de 100 m² construidos (estricto)", () => {
  it("100 m² construidos: solo vías (2.2 y 4.1); 101: uso Aparcamiento", () => {
    const vias = con(conGaraje({ superficieUtil_m2: 90, superficieConstruida_m2: 100 }));
    expect(vias.motivo).toBe("vias");
    expect(vias.elementos.map((e) => e.id)).toEqual(["ambito", "peatones", "senalizacion"]);
    expect(con(conGaraje({ superficieUtil_m2: 90, superficieConstruida_m2: 101 })).motivo).toBe("aparcamiento");
  });

  it("se avisa de la construida supuesta solo si cambia el uso", () => {
    // Útil 90 → construida supuesta 108: con la útil no sería uso Aparcamiento.
    const depende = con(conGaraje({ superficieUtil_m2: 90 }));
    expect(depende.motivo).toBe("aparcamiento");
    expect(depende.avisos.map((a) => a.id)).toEqual(["construida-supuesta"]);
    expect(sua7.avisosAEdificio?.has("construida-supuesta")).toBe(true);
    // Útil 50 → 60: no lo es de ninguna forma.
    expect(con(conGaraje({ superficieUtil_m2: 50 })).avisos).toEqual([]);
  });
});

describe("SUA7 · bordes de los umbrales", () => {
  it("espacio de espera: fondo ≥ 4,50 m y pendiente ≤ 5 %", () => {
    expect(el(caso("plurifamiliar", { fondo_m: 4.5, pendiente_pct: 5 }), "espera").veredicto).toBe("ok");
    expect(el(caso("plurifamiliar", { fondo_m: 4.49 }), "espera").veredicto).toBe("fail");
    const j = caso("plurifamiliar", { pendiente_pct: 5.1 });
    expect(el(j, "espera")).toMatchObject({ veredicto: "fail", detalle: { pendienteCumple: false } });
    expect(sua7.arreglo!(el(j, "espera"), j)).toEqual({ etiqueta: "Espera de 5 m al 4 %", cambios: { fondo_m: "habitual", pendiente_pct: "habitual" } });
  });

  it("salida descendente: no exigible, con aviso", () => {
    const j = caso("plurifamiliar", { salida: "descendente", fondo_m: 2 });
    expect(el(j, "espera").veredicto).toBe("dato");
    expect(j.veredicto).toBe("ok");
    expect(j.avisos.map((a) => a.id)).toEqual(["salida-descendente"]);
  });

  it("paso de peatones por la rampa ≥ 0,80 m", () => {
    expect(el(caso("plurifamiliar", { peatones: "rampa", anchuraPeatones_m: 0.8 }), "peatones").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { peatones: "rampa", anchuraPeatones_m: 0.79 });
    expect(el(j, "peatones").veredicto).toBe("fail");
    expect(sua7.textoIncumplimiento(el(j, "peatones"))?.titulo).toMatch(/estrecho/);
  });

  it("más de 200 plazas en una planta: se avisa del ap. 3", () => {
    expect(caso("plurifamiliar").avisos).toEqual([]);
    const j = con(conGaraje({ plazas: 201 }));
    expect(el(j, "itinerarios").detalle).toMatchObject({ supera: true });
    expect(j.avisos.map((a) => a.id)).toContain("planta-grande");
  });

  it("garaje en la planta baja: sin rampa y salida a nivel, llana", () => {
    const j = con(garajeEnPB());
    expect(j.motivo).toBe("aparcamiento");
    expect(j.rampa).toBe(false);
    expect(j.decisiones).toMatchObject({ salida: "nivel", pendiente_pct: 0 });
    expect(el(j, "peatones").veredicto).toBe("dato");
    expect(j.veredicto).toBe("ok");
  });
});

describe("SUA7 · memoria, ficha y dibujo", () => {
  const edificios: [string, Edificio][] = [
    ...CASOS.map((c) => [c, edificioDeCaso(c)] as [string, Edificio]),
    ["sin garaje", sinGaraje()],
    ["garaje en PB", garajeEnPB()],
    ["solo vías", conGaraje({ superficieUtil_m2: 60 })],
  ];

  it("todos los casos", () => {
    for (const [, e] of edificios) {
      const j = con(e);
      const texto = textoPlanoMemoria(sua7.memoria(j));
      expect(texto).toMatch(/SUA 7/);
      if (j.motivo === "aparcamiento") expect(texto).toMatch(/20 km\/h/);
      const dibujo = sua7.dibujo(j, e);
      const ids = dibujo.etiquetas.map((x) => x.elementoId);
      for (const x of j.elementos) expect(ids).toContain(x.id);
      expect(dibujo.etiquetas.every((x) => x.y > 0 && x.x > 0 && x.x < dibujo.ancho)).toBe(true);
      const ficha = sua7.ficha(j, { estado: sua7EstadoDefaults, edificio: e, revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(ficha.verificaciones.length).toBe(j.elementos.length);
      expect(sua7.frase(j).length).toBeGreaterThan(20);
      for (const x of j.elementos) {
        expect(sua7.franja(x, j, "ok").cita).toMatch(/SUA/);
        expect(sua7.resultadoLista(x).length).toBeGreaterThan(0);
      }
    }
  });

  it("el dibujo lleva la rampa, el coche en la espera y la calle", () => {
    const j = caso("plurifamiliar");
    const dibujo = sua7.dibujo(j, edificioDeCaso("plurifamiliar"));
    expect(dibujo.ancho).toBeGreaterThan(640);
    const coche = dibujo.marcas.find((x) => x.key === "coche");
    expect(coche).toMatchObject({ tipo: "icono", icono: "coche", elementoId: "espera" });
    expect(dibujo.marcas.map((x) => x.key)).toEqual(expect.arrayContaining(["rampa", "espera", "calle", "alerta", "peatones-escalera"]));
  });

  it("la memoria dice las cifras de El edificio", () => {
    const texto = textoPlanoMemoria(sua7.memoria(caso("plurifamiliar")));
    expect(texto).toMatch(/16 plazas/);
    expect(texto).toMatch(/5,00 m/);
    expect(texto).toMatch(/no le es de aplicación el apartado 3/);
    expect(texto).toMatch(/núcleo de escalera que comunica las plantas S1/);
  });
});
