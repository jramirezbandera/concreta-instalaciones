import { describe, it, expect } from "vitest";
import { crearProyectoDemo, DEMO_ID, DEMO_NOMBRE } from "../demo";
import { calcHS3, hs3Defaults } from "../../../modules/hs3/calc";
import { calcHS4 } from "../../../modules/hs4/calc";
import { calcHS5 } from "../../../modules/hs5/calc";
import { calcHS6 } from "../../../modules/hs6/calc";
import { calcHE1 } from "../../../modules/he1/calc";
import type { HS3Inputs } from "../../../modules/hs3/calc";
import type { HS4Inputs } from "../../../modules/hs4/calc";
import type { HS5Inputs } from "../../../modules/hs5/calc";
import type { HS6Inputs } from "../../../modules/hs6/calc";
import type { HE1Inputs } from "../../../modules/he1/calc";
import { zonaClimaticaDe, zonaTermicaHS3De } from "../../../data/zonasClimaticasHE";
import type { JustificacionKey } from "../tipos";

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
    const estanciasA = (a.justificaciones.hs3!.inputs as unknown as HS3Inputs).estancias;
    estanciasA.pop();
    estanciasA[0]!.caudalPropuesto_l_s = 999;
    expect((b.justificaciones.hs3!.inputs as unknown as HS3Inputs).estancias).toHaveLength(
      hs3Defaults.estancias.length,
    );
    expect(hs3Defaults.estancias[0]!.caudalPropuesto_l_s).not.toBe(999);
  });
});

describe("crearProyectoDemo — coherencia cache ↔ motor (por construcción)", () => {
  const p = crearProyectoDemo(NOW);

  it("hs3: el veredicto cacheado coincide con re-ejecutar calcHS3 sobre los inputs sembrados", () => {
    const j = p.justificaciones.hs3!;
    expect(j.resultadoCache!.veredicto).toBe(calcHS3(j.inputs as unknown as HS3Inputs).veredictoGlobal);
  });

  it("hs4: el veredicto cacheado coincide con re-ejecutar calcHS4 sobre los inputs sembrados", () => {
    const j = p.justificaciones.hs4!;
    expect(j.resultadoCache!.veredicto).toBe(calcHS4(j.inputs as unknown as HS4Inputs).veredictoGlobal);
  });

  it("hs5: el veredicto cacheado coincide con re-ejecutar calcHS5 sobre los inputs sembrados", () => {
    const j = p.justificaciones.hs5!;
    expect(j.resultadoCache!.veredicto).toBe(calcHS5(j.inputs as unknown as HS5Inputs).veredictoGlobal);
  });

  it("hs6: el veredicto cacheado coincide con re-ejecutar calcHS6 sobre los inputs sembrados", () => {
    const j = p.justificaciones.hs6!;
    expect(j.resultadoCache!.veredicto).toBe(calcHS6(j.inputs as unknown as HS6Inputs).veredictoGlobal);
  });

  it("he1: el veredicto cacheado coincide con re-ejecutar calcHE1 sobre los inputs sembrados", () => {
    const j = p.justificaciones.he1!;
    expect(j.resultadoCache!.veredicto).toBe(calcHE1(j.inputs as unknown as HE1Inputs).veredictoGlobal);
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

  it("datosGenerales (spot-check): Cáceres, 4 plantas sobre rasante, zona de radón II", () => {
    const dg = p.datosGenerales;
    expect(dg.municipio).toBe("Cáceres");
    expect(dg.provincia).toBe("Cáceres");
    expect(dg.altitud_m).toBe(459);
    expect(dg.uso).toBe("vivienda_colectiva");
    expect(dg.plantasSobreRasante).toBe(4);
    expect(dg.plantasBajoRasante).toBe(1);
    expect(dg.zonaRadon).toBe("II");
    expect(dg.presionAcometida_kPa).toBe(250);
  });

  it("hs3: zonaTermica sembrada = la de la Tabla 4.4 para Cáceres a 459 m (no de memoria)", () => {
    const inputs = p.justificaciones.hs3!.inputs as unknown as HS3Inputs;
    expect(inputs.zonaTermica).toBe(zonaTermicaHS3De("Cáceres", 459)!.zona);
  });

  it("he1: zonaClimatica sembrada = LETRA de la zona del Anejo B para Cáceres a 459 m", () => {
    const inputs = p.justificaciones.he1!.inputs as unknown as HE1Inputs;
    const zonaAnejoB = zonaClimaticaDe("Cáceres", 459)!.zona; // "C4"
    expect(inputs.zonaClimatica).toBe(zonaAnejoB.charAt(0));
    expect(inputs.zonaClimatica).toBe("C");
  });

  it("hs4/hs5/hs6: campos heredados materializados coherentes con el proyecto", () => {
    const hs4 = p.justificaciones.hs4!.inputs as unknown as HS4Inputs;
    expect(hs4.presionAcometida_kPa).toBe(250);

    const hs5 = p.justificaciones.hs5!.inputs as unknown as HS5Inputs;
    expect(hs5.uso).toBe("privado");
    expect(hs5.numPlantas).toBe(4);
    expect(hs5.cubiertaTransitable).toBe(false);

    const hs6 = p.justificaciones.hs6!.inputs as unknown as HS6Inputs;
    expect(hs6.municipio).toBe("Cáceres");
    expect(hs6.zona).toBe("II");
  });
});
