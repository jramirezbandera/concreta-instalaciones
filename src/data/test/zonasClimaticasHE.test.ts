import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  ZONAS_CLIMATICAS_ANEJO_B,
  PROVINCIAS,
  LETRAS_INVIERNO,
  severidadInviernoDe,
  zonaClimaticaDe,
  zonaTermicaHS3De,
} from "../zonasClimaticasHE";
import { ZONAS_TERMICAS_TABLA_4_4, type ZonaProvincia } from "../../modules/hs3/tablas";
import { AGUA_FRIA_ANEJO_G } from "../aguaFriaHE";

// =============================================================================
// Tabla a-Anejo B (DB-HE 2019, consolidado 14-jun-2022) — tests de la T1.1 de
// feature-6 (SPEC §6, disciplina de verificación normativa):
//   1) INTEGRIDAD: 52 provincias, claves IDÉNTICAS a las de la Tabla 4.4 del
//      DB-HS3 (para poder cruzar zona climática HE ↔ zona térmica HS3).
//   2) SPOT-CHECKS de capitales contra la fuente verificada celda a celda.
//   3) zonaClimaticaDe: determinismo, null en desconocida, MONOTONÍA de
//      invierno con la altitud (α < A < B < C < D < E: a mayor altitud la
//      zona nunca es "más cálida").
//   4) zonaTermicaHS3De: coherente con aplicar hasta800/mas800 de la 4.4.
//   5) TRAMOS: altitudMin_m estrictamente crecientes y primer tramo = 0.
// Sin Date.now/Math.random: datos y resolutores puros y deterministas.
// =============================================================================

const PROVS = ZONAS_CLIMATICAS_ANEJO_B.datos.provincias;

// -----------------------------------------------------------------------------
// 1) Integridad del conjunto de provincias.
// -----------------------------------------------------------------------------

describe("ZONAS_CLIMATICAS_ANEJO_B — integridad (52 provincias, claves = Tabla 4.4)", () => {
  it("contiene exactamente 52 provincias/ciudades autónomas", () => {
    expect(Object.keys(PROVS)).toHaveLength(52);
    expect(PROVINCIAS).toHaveLength(52);
  });

  it("las claves son IDÉNTICAS a las de ZONAS_TERMICAS_TABLA_4_4 (hs3)", () => {
    const clavesHE = [...Object.keys(PROVS)].sort();
    const clavesHS3 = [...Object.keys(ZONAS_TERMICAS_TABLA_4_4.datos.provincias)].sort();
    expect(clavesHE).toEqual(clavesHS3);
  });

  it("PROVINCIAS está en orden alfabético (colación española) y sin duplicados", () => {
    const reordenada = [...PROVINCIAS].sort((a, b) => a.localeCompare(b, "es"));
    expect([...PROVINCIAS]).toEqual(reordenada);
    expect(new Set(PROVINCIAS).size).toBe(52);
  });

  it("la procedencia identifica el Anejo B del DB-HE 2019 consolidado", () => {
    const q = ZONAS_CLIMATICAS_ANEJO_B.procedencia;
    expect(q.db).toBe("DB-HE");
    expect(q.tabla).toBe("Tabla a-Anejo B");
    expect(q.edicion).toContain("2019");
    expect(q.fecha).toBe("2022-06-14");
    // La fuente declara la verificación (no un PENDIENTE).
    expect(q.fuente).toMatch(/VERIFICADA/);
  });
});

// -----------------------------------------------------------------------------
// 2) Spot-checks de capitales, contrastados celda a celda con el PDF oficial.
// -----------------------------------------------------------------------------

describe("ZONAS_CLIMATICAS_ANEJO_B — spot-checks de capitales (fuente oficial)", () => {
  it.each([
    ["Madrid", "D3"],
    ["Cádiz", "A3"],
    ["Cáceres", "C4"],
    ["Burgos", "E1"],
    ["Sevilla", "B4"],
    // Cambios 2019 confirmados en el PDF (guardas frente a regresión a 2013):
    ["Huelva", "A4"], // antes B4 en el derogado DB-HE 2013
    ["Asturias", "D1"], // Oviedo, antes C1
    ["Las Palmas", "α3"], // la ed. 2019 introduce la letra α en Canarias
    ["Santa Cruz de Tenerife", "α3"],
    ["Cuenca", "D2"],
  ])("capital de %s → zona %s", (provincia, zona) => {
    expect(PROVS[provincia].zonaCapital).toBe(zona);
  });

  it("tramos literales de Madrid (fila completa del PDF)", () => {
    expect(PROVS["Madrid"].tramos).toEqual([
      { altitudMin_m: 0, zona: "C3" },
      { altitudMin_m: 501, zona: "D3" },
      { altitudMin_m: 951, zona: "D2" },
      { altitudMin_m: 1001, zona: "E1" },
    ]);
  });

  it("filas de una sola zona: León (E1), Ceuta (B3) y Melilla (A3)", () => {
    expect(PROVS["León"].tramos).toEqual([{ altitudMin_m: 0, zona: "E1" }]);
    expect(PROVS["Ceuta"].tramos).toEqual([{ altitudMin_m: 0, zona: "B3" }]);
    expect(PROVS["Melilla"].tramos).toEqual([{ altitudMin_m: 0, zona: "A3" }]);
  });

  it("la altitud de la capital es la de la tabla a-Anejo G del mismo DB (feature-22), en las 52", () => {
    for (const provincia of PROVINCIAS) {
      expect(PROVS[provincia].altitudCapital_m, provincia).toBe(AGUA_FRIA_ANEJO_G.datos.provincias[provincia].altitud_m);
    }
    // Las dos capitales que cambiaban de zona con las altitudes orientativas de antes.
    expect(PROVS["Toledo"]).toMatchObject({ altitudCapital_m: 629, zonaCapital: "D3" }); // antes 445 m, C4
    expect(PROVS["Zaragoza"]).toMatchObject({ altitudCapital_m: 199, zonaCapital: "C3" }); // antes 207 m, D3
  });

  it("zonaCapital es coherente con aplicar los tramos a altitudCapital_m", () => {
    for (const provincia of PROVINCIAS) {
      const e = PROVS[provincia];
      expect(zonaClimaticaDe(provincia, e.altitudCapital_m)?.zona).toBe(e.zonaCapital);
    }
  });
});

// -----------------------------------------------------------------------------
// 3) zonaClimaticaDe — determinismo, dominio y monotonía de invierno.
// -----------------------------------------------------------------------------

/** Provincia arbitraria del conjunto real (determinista por semilla fast-check). */
const arbProvincia: fc.Arbitrary<string> = fc.constantFrom(...PROVINCIAS);

/** Altitud plausible [m] (0..2500 cubre todos los tramos de la tabla). */
const arbAltitud: fc.Arbitrary<number> = fc.double({
  min: 0,
  max: 2500,
  noNaN: true,
  noDefaultInfinity: true,
});

describe("zonaClimaticaDe — resolutor del Anejo B", () => {
  it("provincia desconocida o altitud no finita → null", () => {
    expect(zonaClimaticaDe("Mordor", 100)).toBeNull();
    expect(zonaClimaticaDe("", 100)).toBeNull();
    expect(zonaClimaticaDe("Madrid", Number.NaN)).toBeNull();
    expect(zonaClimaticaDe("Madrid", Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("resultado con zona bien formada y procedencia citando el Anejo B", () => {
    const r = zonaClimaticaDe("Madrid", 657);
    expect(r).not.toBeNull();
    expect(r?.zona).toBe("D3");
    expect(r?.procedencia).toMatch(/Anejo B/);
  });

  test.prop([arbProvincia, arbAltitud])(
    "determinista: mismo input → mismo output (10 llamadas)",
    (provincia, altitud) => {
      const primero = zonaClimaticaDe(provincia, altitud);
      for (let i = 0; i < 10; i++) {
        expect(zonaClimaticaDe(provincia, altitud)).toEqual(primero);
      }
    },
  );

  test.prop([arbProvincia, arbAltitud])(
    "la zona resuelta existe y es sintácticamente válida (letra invierno + 1..4)",
    (provincia, altitud) => {
      const r = zonaClimaticaDe(provincia, altitud);
      expect(r).not.toBeNull();
      expect(r!.zona).toMatch(/^(α|[A-E])[1-4]$/u);
      expect(severidadInviernoDe(r!.zona)).toBeGreaterThanOrEqual(0);
    },
  );

  // MONOTONÍA: a mayor altitud la zona nunca es "más cálida" en invierno
  // (orden de severidad α < A < B < C < D < E comparando la letra).
  test.prop([arbProvincia, arbAltitud, arbAltitud])(
    "monotonía de invierno: h1 ≤ h2 ⇒ severidad(h1) ≤ severidad(h2)",
    (provincia, a, b) => {
      const [h1, h2] = a <= b ? [a, b] : [b, a];
      const z1 = zonaClimaticaDe(provincia, h1)!.zona;
      const z2 = zonaClimaticaDe(provincia, h2)!.zona;
      expect(severidadInviernoDe(z1)).toBeLessThanOrEqual(severidadInviernoDe(z2));
    },
  );

  it("orden de severidad de invierno declarado: α < A < B < C < D < E", () => {
    expect(LETRAS_INVIERNO).toEqual(["α", "A", "B", "C", "D", "E"]);
    expect(severidadInviernoDe("α3")).toBeLessThan(severidadInviernoDe("A4"));
    expect(severidadInviernoDe("A4")).toBeLessThan(severidadInviernoDe("E1"));
  });
});

// -----------------------------------------------------------------------------
// 4) zonaTermicaHS3De — wrapper coherente con la Tabla 4.4 (sin duplicar datos).
// -----------------------------------------------------------------------------

describe("zonaTermicaHS3De — coherencia con ZONAS_TERMICAS_TABLA_4_4", () => {
  const provinciasHS3 = ZONAS_TERMICAS_TABLA_4_4.datos.provincias as Record<
    string,
    ZonaProvincia
  >;

  it("provincia desconocida o altitud no finita → null", () => {
    expect(zonaTermicaHS3De("Mordor", 100)).toBeNull();
    expect(zonaTermicaHS3De("Madrid", Number.NaN)).toBeNull();
  });

  it("para toda provincia y altitudes de contorno, coincide con hasta800/mas800", () => {
    for (const provincia of PROVINCIAS) {
      const fila = provinciasHS3[provincia];
      for (const altitud of [0, 400, 799, 800, 801, 1200]) {
        const esperado = altitud <= 800 ? fila.hasta800 : fila.mas800;
        const r = zonaTermicaHS3De(provincia, altitud);
        if (esperado === null) {
          expect(r).toBeNull(); // Ceuta/Melilla > 800 m: combinación no aplicable
        } else {
          expect(r?.zona).toBe(esperado);
          expect(r?.procedencia).toMatch(/Tabla 4\.4/);
        }
      }
    }
  });

  test.prop([arbProvincia, arbAltitud])(
    "propiedad: resultado = aplicar el corte ≤800 / >800 de la 4.4",
    (provincia, altitud) => {
      const fila = provinciasHS3[provincia];
      const esperado = altitud <= 800 ? fila.hasta800 : fila.mas800;
      const r = zonaTermicaHS3De(provincia, altitud);
      expect(r?.zona ?? null).toEqual(esperado);
    },
  );
});

// -----------------------------------------------------------------------------
// 5) Estructura de los tramos.
// -----------------------------------------------------------------------------

describe("ZONAS_CLIMATICAS_ANEJO_B — estructura de los tramos", () => {
  it("cada provincia: primer tramo en 0 y altitudMin_m ESTRICTAMENTE crecientes", () => {
    for (const provincia of PROVINCIAS) {
      const { tramos } = PROVS[provincia];
      expect(tramos.length).toBeGreaterThanOrEqual(1);
      expect(tramos[0].altitudMin_m).toBe(0);
      for (let i = 1; i < tramos.length; i++) {
        expect(tramos[i].altitudMin_m).toBeGreaterThan(tramos[i - 1].altitudMin_m);
      }
    }
  });

  it("cada tramo tiene zona bien formada y altitud de capital plausible", () => {
    for (const provincia of PROVINCIAS) {
      const e = PROVS[provincia];
      expect(e.capital.length).toBeGreaterThan(0);
      expect(e.altitudCapital_m).toBeGreaterThanOrEqual(0);
      expect(e.altitudCapital_m).toBeLessThan(1500); // ninguna capital supera 1500 m
      for (const t of e.tramos) {
        expect(t.zona).toMatch(/^(α|[A-E])[1-4]$/u);
      }
    }
  });

  it("los tramos de cada provincia son monótonos en severidad de invierno", () => {
    // Refleja la estructura de la tabla oficial: al subir de tramo la letra de
    // invierno nunca decrece (comprobado también celda a celda en el PDF).
    for (const provincia of PROVINCIAS) {
      const { tramos } = PROVS[provincia];
      for (let i = 1; i < tramos.length; i++) {
        expect(severidadInviernoDe(tramos[i].zona)).toBeGreaterThanOrEqual(
          severidadInviernoDe(tramos[i - 1].zona),
        );
      }
    }
  });
});
