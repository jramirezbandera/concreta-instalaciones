import { describe, it, expect } from "vitest";
import { crearProyectoDemo, DEMO_ID, DEMO_NOMBRE } from "../demo";
import { justificarHs3 } from "../../../modules/hs3/justificacion";
import type { Hs3Estado } from "../../../modules/hs3/estado";
import { hs5EstadoDefaults } from "../../../modules/hs5/estado";
import { justificarHs4 } from "../../../modules/hs4/justificacion";
import type { Hs4Estado } from "../../../modules/hs4/estado";
import { justificarHs5 } from "../../../modules/hs5/justificacion";
import type { Hs5Estado } from "../../../modules/hs5/estado";
import { justificarHs6 } from "../../../modules/hs6/justificacion";
import type { Hs6Estado } from "../../../modules/hs6/estado";
import { justificarHe1 } from "../../../modules/he1/justificacion";
import type { He1Estado } from "../../../modules/he1/estado";
import { zonaClimaticaDe, zonaTermicaHS3De } from "../../../data/zonasClimaticasHE";
import type { JustificacionKey } from "../tipos";
import { edificioDeCaso } from "../../edificio/casos";
import { resumenEdificio } from "../../edificio/derivar";

// =============================================================================
// crearProyectoDemo — feature-6 T2.6. Tres invariantes:
//   1) DETERMINISMO TOTAL: mismo nowIso → proyectos deep-equal (nada de
//      Date.now/Math.random escondidos).
//   2) COHERENCIA POR CONSTRUCCIÓN: el veredicto cacheado de cada justificación
//      coincide con re-ejecutar SU motor sobre SUS inputs sembrados.
//   3) EL DEMO SE VE BIEN: los 5 veredictos son "ok" o "warn" (verde/ámbar) —
//      el cache nunca se falsea, se ajustan los inputs si hiciera falta.
// =============================================================================

const NOW = "2026-08-22T10:00:00.000Z";

/** Las 5 justificaciones shipped que el Demo siembra. */
const CLAVES_DEMO = ["hs3", "hs4", "hs5", "hs6", "he1"] as const satisfies readonly JustificacionKey[];

describe("crearProyectoDemo — determinismo", () => {
  it("dos llamadas con el mismo nowIso producen proyectos deep-equal", () => {
    const a = crearProyectoDemo(NOW);
    const b = crearProyectoDemo(NOW);
    expect(a).toStrictEqual(b);
  });

  it("nowIso se inyecta tal cual en creado y modificado (sin Date.now)", () => {
    const otro = "1999-12-31T23:59:59.000Z";
    const p = crearProyectoDemo(otro);
    expect(p.creado).toBe(otro);
    expect(p.modificado).toBe(otro);
  });

  it("cada llamada devuelve objetos frescos: mutar un Demo no contamina otro ni los defaults", () => {
    const a = crearProyectoDemo(NOW);
    const b = crearProyectoDemo(NOW);
    const tramosA = (a.justificaciones.hs5!.inputs as unknown as Hs5Estado).tramos;
    tramosA.pop();
    tramosA[0]!.pendiente_pct = 999;
    expect((b.justificaciones.hs5!.inputs as unknown as Hs5Estado).tramos).toHaveLength(hs5EstadoDefaults.tramos.length);
    expect(hs5EstadoDefaults.tramos[0]!.pendiente_pct).not.toBe(999);
  });
});

describe("crearProyectoDemo — coherencia cache ↔ motor (por construcción)", () => {
  const p = crearProyectoDemo(NOW);

  it("hs3: el veredicto cacheado coincide con re-justificar desde El edificio (feature-15)", () => {
    const j = p.justificaciones.hs3!;
    const r = justificarHs3(j.inputs as unknown as Hs3Estado, p.edificio);
    expect(r.veredicto).toBe("ok");
    expect(r.avisos).toEqual([]);
    expect(j.resultadoCache!.veredicto).toBe("ok");
  });

  it("hs4: el veredicto cacheado coincide con re-justificar desde El edificio (feature-15)", () => {
    const j = p.justificaciones.hs4!;
    const estado = j.inputs as unknown as Hs4Estado;
    expect(estado.red).toBe("edificio");
    const r = justificarHs4(estado, p.edificio, { presionAcometida_kPa: p.datosGenerales.presionAcometida_kPa });
    // Cumple, con la presión de la red sin confirmar → «warn».
    expect(r.veredicto).toBe("ok");
    expect(r.avisos.map((a) => a.id)).toEqual(["presion-red-supuesta"]);
    expect(j.resultadoCache!.veredicto).toBe("warn");
  });

  it("hs5: el veredicto cacheado coincide con re-justificar desde El edificio (feature-14)", () => {
    const j = p.justificaciones.hs5!;
    const estado = j.inputs as unknown as Hs5Estado;
    expect(estado.red).toBe("edificio");
    const r = justificarHs5(estado, p.edificio, {
      pluviometria: p.datosGenerales.pluviometria,
      cotaAlcantarillado_m: p.datosGenerales.cotaAlcantarillado_m,
    });
    // Cumple, con avisos sin revisar (garaje por bombeo y lluvia supuesta) → «warn».
    expect(r.veredicto).toBe("ok");
    expect(r.avisos.map((a) => a.id)).toEqual(["garaje-s1-bombeo", "pluviometria-supuesta"]);
    expect(j.resultadoCache!.veredicto).toBe("warn");
  });

  it("hs6: el veredicto cacheado coincide con re-justificar desde El edificio (feature-15)", () => {
    const j = p.justificaciones.hs6!;
    const r = justificarHs6(j.inputs as unknown as Hs6Estado, p.edificio);
    // Cumple, con el núcleo que baja al garaje sin revisar → «warn».
    expect(r.veredicto).toBe("ok");
    expect(r.avisos.map((a) => a.id)).toEqual(["nucleo-garaje"]);
    expect(j.resultadoCache!.veredicto).toBe("warn");
  });

  it("he1: el veredicto cacheado coincide con re-justificar desde El edificio (feature-15)", () => {
    const j = p.justificaciones.he1!;
    const dg = p.datosGenerales;
    const r = justificarHe1(j.inputs as unknown as He1Estado, p.edificio, { provincia: dg.provincia, altitud_m: dg.altitud_m, municipio: dg.municipio });
    // Cumple sin nada por revisar: la envolvente propuesta y el clima de Cáceres.
    expect(r.veredicto).toBe("ok");
    expect(r.avisos).toEqual([]);
    expect(j.resultadoCache!.veredicto).toBe("ok");
  });

  it("los 5 veredictos cacheados son 'ok' o 'warn' (el Demo se ve en verde/ámbar)", () => {
    for (const clave of CLAVES_DEMO) {
      const j = p.justificaciones[clave]!;
      expect(["ok", "warn"], `veredicto de ${clave}`).toContain(j.resultadoCache!.veredicto);
    }
  });

  it("las 5 justificaciones llevan schemaVersion '1'", () => {
    for (const clave of CLAVES_DEMO) {
      expect(p.justificaciones[clave]!.schemaVersion, `schemaVersion de ${clave}`).toBe("1");
    }
  });
});

describe("crearProyectoDemo — datos generales y campos heredados materializados", () => {
  const p = crearProyectoDemo(NOW);

  it("identidad del Demo: id fijo 'demo' y nombre visible", () => {
    expect(p.id).toBe(DEMO_ID);
    expect(p.id).toBe("demo");
    expect(p.nombre).toBe(DEMO_NOMBRE);
    expect(p.nombre).toBe("Demo — Vivienda C/ Mayor 12");
  });

  it("datosGenerales (spot-check): Cáceres, zona de radón II, 250 kPa", () => {
    const dg = p.datosGenerales;
    expect(dg.municipio).toBe("Cáceres");
    expect(dg.provincia).toBe("Cáceres");
    expect(dg.altitud_m).toBe(459);
    expect(dg.zonaRadon).toBe("II");
    expect(dg.presionAcometida_kPa).toBe(250);
  });

  it("el edificio es el caso «Plurifamiliar con locales» (feature-12)", () => {
    expect(p.edificio).toEqual(edificioDeCaso("plurifamiliar_locales"));
    const r = resumenEdificio(p.edificio);
    expect(r.plantasSobreRasante).toBe(4);
    expect(r.plantasBajoRasante).toBe(1);
    expect(r.numViviendas).toBe(6);
    expect(r.tieneLocalPB).toBe(true);
    expect(r.tieneGaraje).toBe(true);
  });

  it("hs3: zonaTermica sembrada = la de la Tabla 4.4 para Cáceres a 459 m (no de memoria)", () => {
    const inputs = p.justificaciones.hs3!.inputs as unknown as Hs3Estado;
    expect(inputs.zonaTermica).toBe(zonaTermicaHS3De("Cáceres", 459)!.zona);
  });

  it("he1: zonaClimatica sembrada = LETRA de la zona del Anejo B para Cáceres a 459 m", () => {
    const inputs = p.justificaciones.he1!.inputs as unknown as He1Estado;
    const zonaAnejoB = zonaClimaticaDe("Cáceres", 459)!.zona; // "C4"
    expect(inputs.zonaClimatica).toBe(zonaAnejoB.charAt(0));
    expect(inputs.zonaClimatica).toBe("C");
  });

  it("hs4/hs5/hs6: campos heredados materializados coherentes con el proyecto", () => {
    // HS4 lee la presión de los datos de la obra (feature-15), no de sus inputs.
    expect(p.datosGenerales.presionAcometida_kPa).toBe(250);
    expect((p.justificaciones.hs4!.inputs as unknown as Hs4Estado).red).toBe("edificio");

    const hs5 = p.justificaciones.hs5!.inputs as unknown as Hs5Estado;
    expect(hs5.uso).toBe("privado");
    expect(hs5.numPlantas).toBe(4);
    expect(hs5.cubiertaTransitable).toBe(false);

    const hs6 = p.justificaciones.hs6!.inputs as unknown as Hs6Estado;
    expect(hs6.municipio).toBe("Cáceres");
    expect(hs6.zona).toBe("II");
  });
});
