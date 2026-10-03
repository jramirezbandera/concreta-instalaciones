import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  derivarContexto,
  reconciliarAlturas,
  PROC_ALTURA_EVACUACION,
  PROC_ALTURA_EVACUACION_DECLARADA,
} from "../derivar";
import { PROVINCIAS, severidadInviernoDe } from "../../../data/zonasClimaticasHE";

// =============================================================================
// derivarContexto — feature-6 T2.1. Tests en dos capas (cf. hs6/test/calc.test.ts):
//   1) CASOS CONCRETOS verificables contra las tablas oficiales (Anejo B / 4.4).
//   2) PROPERTY-BASED (@fast-check/vitest, test.prop) de los invariantes:
//      nunca-null en el dominio válido, determinismo, monotonía de severidad de
//      invierno con la altitud y monotonía de la altura de evacuación en plantas.
// =============================================================================

// -----------------------------------------------------------------------------
// CASOS CONCRETOS
// -----------------------------------------------------------------------------

describe("derivarContexto — casos concretos", () => {
  it("Cáceres a 459 m → zona climática C4 (Anejo B) y zona térmica Z (Tabla 4.4)", () => {
    const ctx = derivarContexto({ provincia: "Cáceres", altitud_m: 459, plantasSobreRasante: 2 });
    expect(ctx).not.toBeNull();
    expect(ctx!.zonaClimatica.valor).toBe("C4");
    expect(ctx!.zonaClimatica.procedencia).toContain("Anejo B");
    expect(ctx!.zonaTermicaHS3.valor).toBe("Z");
    expect(ctx!.zonaTermicaHS3.procedencia).toContain("Tabla 4.4");
  });

  it("Cáceres con 4 plantas sobre rasante → altura de evacuación 9 m (estimación 3 m/planta)", () => {
    const ctx = derivarContexto({ provincia: "Cáceres", altitud_m: 459, plantasSobreRasante: 4 });
    expect(ctx).not.toBeNull();
    expect(ctx!.alturaEvacuacion_m.valor).toBe(9);
    expect(ctx!.alturaEvacuacion_m.procedencia).toBe(PROC_ALTURA_EVACUACION);
  });

  it("Madrid a 657 m → zona climática D3", () => {
    const ctx = derivarContexto({ provincia: "Madrid", altitud_m: 657, plantasSobreRasante: 1 });
    expect(ctx).not.toBeNull();
    expect(ctx!.zonaClimatica.valor).toBe("D3");
  });

  it("una planta sobre rasante → altura de evacuación 0 m", () => {
    const ctx = derivarContexto({ provincia: "Madrid", altitud_m: 657, plantasSobreRasante: 1 });
    expect(ctx!.alturaEvacuacion_m.valor).toBe(0);
  });

  it("provincia desconocida → null (el formulario valida contra PROVINCIAS)", () => {
    expect(
      derivarContexto({ provincia: "Narnia", altitud_m: 100, plantasSobreRasante: 2 }),
    ).toBeNull();
  });

  it("Ceuta por encima de 800 m (sin fila en la 4.4) → NO null: satura en el tramo ≤ 800 m y lo declara", () => {
    const ctx = derivarContexto({ provincia: "Ceuta", altitud_m: 900, plantasSobreRasante: 2 });
    expect(ctx).not.toBeNull();
    expect(ctx!.zonaTermicaHS3.valor).toBe("Z"); // fila de Ceuta, tramo ≤ 800 m
    expect(ctx!.zonaTermicaHS3.procedencia).toContain("≤ 800");
  });
});

// -----------------------------------------------------------------------------
// ALTURAS DECLARADAS (feature-10)
// -----------------------------------------------------------------------------

describe("derivarContexto — alturas por planta declaradas (feature-10)", () => {
  it("PB 4,20 + tipo 3,00 en 3 plantas → evacuación 7,20 (cota del suelo de la última: su altura no cuenta)", () => {
    const ctx = derivarContexto({
      provincia: "Madrid",
      altitud_m: 657,
      plantasSobreRasante: 3,
      alturasPlantas_m: { sobre: [4.2, 3, 3], bajo: [] },
    });
    expect(ctx!.alturaEvacuacion_m.valor).toBe(7.2);
    expect(ctx!.alturaEvacuacion_m.procedencia).toBe(PROC_ALTURA_EVACUACION_DECLARADA);
  });

  it("residuos flotantes: 4 plantas de 3,30 → 9,9 exacto, no 9,899999…", () => {
    const ctx = derivarContexto({
      provincia: "Madrid",
      altitud_m: 657,
      plantasSobreRasante: 4,
      alturasPlantas_m: { sobre: [3.3, 3.3, 3.3, 3.3], bajo: [] },
    });
    expect(ctx!.alturaEvacuacion_m.valor).toBe(9.9);
  });

  it("desfase con el contador: 4 plantas y solo 2 alturas → completa a 3 m y LO DECLARA", () => {
    const ctx = derivarContexto({
      provincia: "Madrid",
      altitud_m: 657,
      plantasSobreRasante: 4,
      alturasPlantas_m: { sobre: [4.2, 3.3], bajo: [] },
    });
    expect(ctx!.alturaEvacuacion_m.valor).toBe(10.5); // 4,2 + 3,3 + 3
    expect(ctx!.alturaEvacuacion_m.procedencia).toContain("sin altura declarada");
  });

  it("los sótanos no intervienen en la evacuación descendente", () => {
    const con = derivarContexto({
      provincia: "Madrid",
      altitud_m: 657,
      plantasSobreRasante: 2,
      alturasPlantas_m: { sobre: [4.2, 3], bajo: [3.3, 3.3] },
    });
    const sin = derivarContexto({
      provincia: "Madrid",
      altitud_m: 657,
      plantasSobreRasante: 2,
      alturasPlantas_m: { sobre: [4.2, 3], bajo: [] },
    });
    expect(con!.alturaEvacuacion_m).toEqual(sin!.alturaEvacuacion_m);
  });

  // Equivalencia con la estimación: todas las alturas a 3 ⇒ mismo valor que la
  // regla de 3 m/planta (solo cambia la procedencia, que declara la fuente).
  test.prop([fc.constantFrom(...PROVINCIAS), fc.integer({ min: 0, max: 3500 }), fc.integer({ min: 1, max: 30 })])(
    "con todas las alturas a 3 m, el valor coincide con la estimación",
    (provincia, altitud_m, plantas) => {
      const declarado = derivarContexto({
        provincia,
        altitud_m,
        plantasSobreRasante: plantas,
        alturasPlantas_m: { sobre: Array.from({ length: plantas }, () => 3), bajo: [] },
      })!.alturaEvacuacion_m;
      const estimado = derivarContexto({
        provincia,
        altitud_m,
        plantasSobreRasante: plantas,
      })!.alturaEvacuacion_m;
      expect(declarado.valor).toBe(estimado.valor);
      expect(declarado.procedencia).toBe(PROC_ALTURA_EVACUACION_DECLARADA);
      expect(estimado.procedencia).toBe(PROC_ALTURA_EVACUACION);
    },
  );
});

describe("reconciliarAlturas — los contadores mandan sobre las longitudes", () => {
  it("sin previas → punto de partida a 3,00", () => {
    expect(reconciliarAlturas(undefined, 2, 1)).toEqual({ sobre: [3, 3], bajo: [3] });
  });

  it("conserva las existentes TAL CUAL, completa a 3 y recorta", () => {
    const previas = { sobre: [4.2, 3.1, 2.8], bajo: [3.3] };
    expect(reconciliarAlturas(previas, 4, 0)).toEqual({
      sobre: [4.2, 3.1, 2.8, 3],
      bajo: [],
    });
  });

  it("no muta las previas (el formulario es inmutable)", () => {
    const previas = { sobre: [4.2], bajo: [] };
    reconciliarAlturas(previas, 3, 2);
    expect(previas).toEqual({ sobre: [4.2], bajo: [] });
  });
});

// -----------------------------------------------------------------------------
// GENERADORES fast-check
// -----------------------------------------------------------------------------

const arbProvincia: fc.Arbitrary<string> = fc.constantFrom(...PROVINCIAS);
const arbAltitud: fc.Arbitrary<number> = fc.integer({ min: 0, max: 3500 });
const arbPlantas: fc.Arbitrary<number> = fc.integer({ min: 1, max: 30 });

// -----------------------------------------------------------------------------
// PROPERTY-BASED — invariantes del contexto derivado
// -----------------------------------------------------------------------------

describe("derivarContexto — invariantes (property-based)", () => {
  // (1) TOTALIDAD en el dominio válido: para toda provincia reconocida y altitud
  //     entera ∈ [0, 3500], NUNCA null y ambas zonificaciones presentes con
  //     procedencia no vacía.
  test.prop([arbProvincia, arbAltitud, arbPlantas])(
    "provincia ∈ PROVINCIAS + altitud ∈ [0, 3500] ⇒ nunca null, con ambas zonificaciones",
    (provincia, altitud_m, plantasSobreRasante) => {
      const ctx = derivarContexto({ provincia, altitud_m, plantasSobreRasante });
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
  test.prop([arbProvincia, arbAltitud, arbPlantas])(
    "determinista: dos llamadas con el mismo input devuelven lo mismo",
    (provincia, altitud_m, plantasSobreRasante) => {
      const dg = { provincia, altitud_m, plantasSobreRasante };
      expect(derivarContexto(dg)).toEqual(derivarContexto(dg));
    },
  );

  // (3) MONOTONÍA DE INVIERNO (estructura de la tabla a-Anejo B): en una misma
  //     provincia, a MAYOR altitud la severidad de invierno (α<A<…<E) nunca
  //     decrece.
  test.prop([arbProvincia, arbAltitud, arbAltitud])(
    "a mayor altitud, la severidad de invierno nunca decrece (misma provincia)",
    (provincia, h1, h2) => {
      const [hBaja, hAlta] = h1 <= h2 ? [h1, h2] : [h2, h1];
      const ctxBaja = derivarContexto({ provincia, altitud_m: hBaja, plantasSobreRasante: 1 });
      const ctxAlta = derivarContexto({ provincia, altitud_m: hAlta, plantasSobreRasante: 1 });
      expect(severidadInviernoDe(ctxAlta!.zonaClimatica.valor)).toBeGreaterThanOrEqual(
        severidadInviernoDe(ctxBaja!.zonaClimatica.valor),
      );
    },
  );

  // (4) ALTURA DE EVACUACIÓN: 0 m con 1 planta, monótona no decreciente en el
  //     número de plantas, y exactamente (plantas − 1) × 3 en el dominio válido.
  test.prop([arbProvincia, arbAltitud, arbPlantas])(
    "altura de evacuación: 0 para 1 planta y monótona no decreciente en plantas",
    (provincia, altitud_m, plantas) => {
      const con = (p: number) =>
        derivarContexto({ provincia, altitud_m, plantasSobreRasante: p })!.alturaEvacuacion_m.valor;
      expect(con(1)).toBe(0);
      expect(con(plantas + 1)).toBeGreaterThanOrEqual(con(plantas));
      expect(con(plantas)).toBe((plantas - 1) * 3);
    },
  );
});
