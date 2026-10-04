import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { derivarContexto, PROC_ALTURA_EVACUACION } from "../derivar";
import { PROVINCIAS, severidadInviernoDe } from "../../../data/zonasClimaticasHE";
import { edificioDeCaso } from "../../edificio/casos";
import { setAltura, setRepeticiones } from "../../edificio/editar";
import type { Edificio } from "../../edificio/tipos";

// =============================================================================
// derivarContexto — feature-6 T2.1, feature-12. Tests en dos capas (cf.
// hs6/test/calc.test.ts):
//   1) CASOS CONCRETOS verificables contra las tablas oficiales (Anejo B / 4.4).
//   2) PROPERTY-BASED (@fast-check/vitest, test.prop) de los invariantes:
//      nunca-null en el dominio válido, determinismo, monotonía de severidad de
//      invierno con la altitud y monotonía de la altura de evacuación en plantas.
// Las cotas y el resto de lo que sale del edificio se prueban en
// `lib/edificio/test/derivar.test.ts`; aquí solo su paso al contexto.
// =============================================================================

/** Edificio de N plantas sobre rasante de 3 m, sin sótano. */
function edificioDePlantas(n: number): Edificio {
  const base = edificioDeCaso("plurifamiliar");
  // P1–P3 × 3 sobre PB: el grupo de arriba pasa a tener n − 1 plantas.
  const sinSotano: Edificio = { ...base, grupos: base.grupos.filter((g) => g.nivelInicial >= 0) };
  if (n === 1) return { ...sinSotano, grupos: sinSotano.grupos.filter((g) => g.nivelInicial === 0) };
  return setRepeticiones(sinSotano, sinSotano.grupos[0].id, n - 1);
}

const PLURI = edificioDeCaso("plurifamiliar");

// -----------------------------------------------------------------------------
// CASOS CONCRETOS
// -----------------------------------------------------------------------------

describe("derivarContexto — casos concretos", () => {
  it("Cáceres a 459 m → zona climática C4 (Anejo B) y zona térmica Z (Tabla 4.4)", () => {
    const ctx = derivarContexto({ provincia: "Cáceres", altitud_m: 459 }, PLURI);
    expect(ctx).not.toBeNull();
    expect(ctx!.zonaClimatica.valor).toBe("C4");
    expect(ctx!.zonaClimatica.procedencia).toContain("Anejo B");
    expect(ctx!.zonaTermicaHS3.valor).toBe("Z");
    expect(ctx!.zonaTermicaHS3.procedencia).toContain("Tabla 4.4");
  });

  it("plurifamiliar (PB + P1–P3 de 3 m) → altura de evacuación 9 m, de El edificio", () => {
    const ctx = derivarContexto({ provincia: "Cáceres", altitud_m: 459 }, PLURI);
    expect(ctx!.alturaEvacuacion_m.valor).toBe(9);
    expect(ctx!.alturaEvacuacion_m.procedencia).toBe(PROC_ALTURA_EVACUACION);
  });

  it("con locales (PB de 4 m) → 10 m: la altura de la última planta no cuenta, la de la PB sí", () => {
    const ctx = derivarContexto(
      { provincia: "Cáceres", altitud_m: 459 },
      edificioDeCaso("plurifamiliar_locales"),
    );
    expect(ctx!.alturaEvacuacion_m.valor).toBe(10);
  });

  it("residuos flotantes: 4 plantas de 3,30 → 9,9 exacto, no 9,899999…", () => {
    let e = edificioDePlantas(4);
    for (const g of e.grupos) e = setAltura(e, g.id, 3.3);
    expect(derivarContexto({ provincia: "Madrid", altitud_m: 657 }, e)!.alturaEvacuacion_m.valor).toBe(9.9);
  });

  it("el contexto lleva el resumen del edificio (lo heredan los módulos)", () => {
    const ctx = derivarContexto({ provincia: "Madrid", altitud_m: 657 }, PLURI);
    expect(ctx!.edificio.plantasSobreRasante).toBe(4);
    expect(ctx!.edificio.plantasBajoRasante).toBe(1);
    expect(ctx!.edificio.numViviendas).toBe(7);
  });

  it("Madrid a 657 m → zona climática D3", () => {
    const ctx = derivarContexto({ provincia: "Madrid", altitud_m: 657 }, PLURI);
    expect(ctx!.zonaClimatica.valor).toBe("D3");
  });

  it("una planta sobre rasante → altura de evacuación 0 m", () => {
    const ctx = derivarContexto({ provincia: "Madrid", altitud_m: 657 }, edificioDePlantas(1));
    expect(ctx!.alturaEvacuacion_m.valor).toBe(0);
  });

  it("provincia desconocida → null (el formulario valida contra PROVINCIAS)", () => {
    expect(derivarContexto({ provincia: "Narnia", altitud_m: 100 }, PLURI)).toBeNull();
  });

  it("Ceuta por encima de 800 m (sin fila en la 4.4) → NO null: satura en el tramo ≤ 800 m y lo declara", () => {
    const ctx = derivarContexto({ provincia: "Ceuta", altitud_m: 900 }, PLURI);
    expect(ctx).not.toBeNull();
    expect(ctx!.zonaTermicaHS3.valor).toBe("Z"); // fila de Ceuta, tramo ≤ 800 m
    expect(ctx!.zonaTermicaHS3.procedencia).toContain("≤ 800");
  });
});

// -----------------------------------------------------------------------------
// PROPERTY-BASED — invariantes del contexto derivado
// -----------------------------------------------------------------------------

const arbProvincia = fc.constantFrom(...PROVINCIAS);
const arbAltitud = fc.integer({ min: 0, max: 3500 });
const arbPlantas = fc.integer({ min: 1, max: 30 });

describe("derivarContexto — invariantes (property-based)", () => {
  // (1) TOTALIDAD en el dominio válido: para toda provincia reconocida y altitud
  //     entera ∈ [0, 3500], NUNCA null y ambas zonificaciones presentes con
  //     procedencia no vacía.
  test.prop([arbProvincia, arbAltitud])(
    "provincia ∈ PROVINCIAS + altitud ∈ [0, 3500] ⇒ nunca null, con ambas zonificaciones",
    (provincia, altitud_m) => {
      const ctx = derivarContexto({ provincia, altitud_m }, PLURI);
      expect(ctx).not.toBeNull();
      expect(ctx!.zonaClimatica.valor.length).toBeGreaterThan(0);
      expect(ctx!.zonaClimatica.procedencia.length).toBeGreaterThan(0);
      expect(["W", "X", "Y", "Z"]).toContain(ctx!.zonaTermicaHS3.valor);
      expect(ctx!.zonaTermicaHS3.procedencia.length).toBeGreaterThan(0);
      // La zona climática empieza por una letra de invierno válida (α..E).
      expect(severidadInviernoDe(ctx!.zonaClimatica.valor)).toBeGreaterThanOrEqual(0);
    },
  );

  // (2) DETERMINISMO: mismo input → mismo output (dos llamadas idénticas).
  test.prop([arbProvincia, arbAltitud])(
    "determinista: dos llamadas con el mismo input devuelven lo mismo",
    (provincia, altitud_m) => {
      const dg = { provincia, altitud_m };
      expect(derivarContexto(dg, PLURI)).toEqual(derivarContexto(dg, PLURI));
    },
  );

  // (3) MONOTONÍA DE INVIERNO (estructura de la tabla a-Anejo B): en una misma
  //     provincia, a MAYOR altitud la severidad de invierno (α<A<…<E) nunca
  //     decrece.
  test.prop([arbProvincia, arbAltitud, arbAltitud])(
    "a mayor altitud, la severidad de invierno nunca decrece (misma provincia)",
    (provincia, h1, h2) => {
      const [hBaja, hAlta] = h1 <= h2 ? [h1, h2] : [h2, h1];
      const ctxBaja = derivarContexto({ provincia, altitud_m: hBaja }, PLURI);
      const ctxAlta = derivarContexto({ provincia, altitud_m: hAlta }, PLURI);
      expect(severidadInviernoDe(ctxAlta!.zonaClimatica.valor)).toBeGreaterThanOrEqual(
        severidadInviernoDe(ctxBaja!.zonaClimatica.valor),
      );
    },
  );

  // (4) ALTURA DE EVACUACIÓN: 0 m con 1 planta, monótona no decreciente en el
  //     número de plantas, y exactamente (plantas − 1) × 3 con plantas de 3 m.
  test.prop([arbProvincia, arbAltitud, arbPlantas])(
    "altura de evacuación: 0 para 1 planta y monótona no decreciente en plantas",
    (provincia, altitud_m, plantas) => {
      const con = (p: number) =>
        derivarContexto({ provincia, altitud_m }, edificioDePlantas(p))!.alturaEvacuacion_m.valor;
      expect(con(1)).toBe(0);
      expect(con(plantas + 1)).toBeGreaterThanOrEqual(con(plantas));
      expect(con(plantas)).toBe((plantas - 1) * 3);
    },
  );
});
