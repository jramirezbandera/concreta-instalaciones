import { describe, it, expect } from "vitest";
import { CONDICIONES_FACHADA, CONDICIONES_MURO, CONDICIONES_SUELO } from "../condiciones";
import { IMPERMEABILIZACIONES_MURO, INTERVENCIONES_TERRENO, TIPOS_MURO, TIPOS_SUELO } from "../decisiones";
import {
  CONDICIONES_FACHADA_TABLA_2_7,
  CONDICIONES_MURO_TABLA_2_2,
  CONDICIONES_SUELO_TABLA_2_4,
  casillaMuro,
  casillaSuelo,
  entornoDe,
  exposicionViento,
  GRADOS,
  gradoFachada,
  gradoMuro,
  gradoSuelo,
  maxSotanosMuro,
  opcionesFachada,
  orificiosDrenaje,
  tuboDrenaje,
  type Exposicion,
} from "../tablas";
import { CLASES_KS, TERRENOS_TIPO, ZONAS_EOLICAS, ZONAS_PLUVIOMETRICAS_HS1, type PresenciaAgua } from "../tipos";

// =============================================================================
// HS1 (feature-17) — Las tablas del DB, casilla a casilla como en
// research/verificacion-hs1.md, y sus propiedades. OJO: las filas de las tablas
// 2.2 y 2.4 NO se acumulan, así que no hay propiedades de inclusión entre filas.
// =============================================================================

const PRESENCIAS: PresenciaAgua[] = ["baja", "media", "alta"];
const EXPOSICIONES: Exposicion[] = ["V3", "V2", "V1"]; // de menos a más expuesta

describe("grados de muros y suelos (tablas 2.1 y 2.3)", () => {
  it("lee las casillas", () => {
    expect(gradoMuro("alta", "alto")).toBe(5);
    expect(gradoMuro("alta", "bajo")).toBe(4);
    expect(gradoMuro("media", "alto")).toBe(3);
    expect(gradoMuro("media", "medio")).toBe(2);
    expect(gradoSuelo("alta", "medio")).toBe(5);
    expect(gradoSuelo("media", "bajo")).toBe(3);
    expect(gradoSuelo("baja", "alto")).toBe(2);
    expect(gradoSuelo("baja", "bajo")).toBe(1);
  });

  it("más presencia de agua o más Ks nunca bajan el grado", () => {
    // CLASES_KS va de más a menos permeable.
    for (const f of [gradoMuro, gradoSuelo]) {
      for (let p = 1; p < PRESENCIAS.length; p++) {
        for (const k of CLASES_KS) expect(f(PRESENCIAS[p], k)).toBeGreaterThanOrEqual(f(PRESENCIAS[p - 1], k));
      }
      for (const p of PRESENCIAS) {
        for (let k = 1; k < CLASES_KS.length; k++) expect(f(p, CLASES_KS[k - 1])).toBeGreaterThanOrEqual(f(p, CLASES_KS[k]));
      }
    }
  });

  it("con presencia baja, Ks no cambia el muro y sí el suelo", () => {
    expect(new Set(CLASES_KS.map((k) => gradoMuro("baja", k)))).toEqual(new Set([1]));
    expect(new Set(CLASES_KS.map((k) => gradoSuelo("baja", k)))).toEqual(new Set([2, 1]));
  });
});

describe("condiciones de muro (tabla 2.2)", () => {
  it("cuatro casillas sombreadas y una en blanco", () => {
    const casillas = TIPOS_MURO.flatMap((t) => IMPERMEABILIZACIONES_MURO.flatMap((i) => GRADOS.map((g) => casillaMuro(t, i, g))));
    expect(casillas.filter((c) => c === null)).toHaveLength(4);
    expect(casillas.filter((c) => c !== null && c.length === 0)).toHaveLength(1);
    expect(casillaMuro("gravedad", "interior", 4)).toBeNull();
    expect(casillaMuro("flexorresistente", "interior", 5)).toBeNull();
    expect(casillaMuro("pantalla", "parcialmente_estanco", 1)).toEqual([]);
  });

  it("las casillas que se leen en la verificación", () => {
    expect(casillaMuro("flexorresistente", "exterior", 1)).toEqual(["I2", "I3", "D1", "D5"]);
    expect(casillaMuro("gravedad", "interior", 2)).toEqual(["C3", "I1", "D1", "D3"]);
    expect(casillaMuro("flexorresistente", "exterior", 5)).toEqual(["I1", "I3", "D1", "D2", "D3"]);
    expect(casillaMuro("pantalla", "exterior", 3)).toEqual(["C2", "I1"]);
    expect(casillaMuro("gravedad", "parcialmente_estanco", 5)).toEqual(["D4", "V1"]);
  });

  it("las notas del número de sótanos", () => {
    expect(maxSotanosMuro("gravedad", "interior", 2)).toBe(3);
    expect(maxSotanosMuro("flexorresistente", "interior", 3)).toBe(2);
    expect(maxSotanosMuro("flexorresistente", "interior", 2)).toBeNull();
    expect(maxSotanosMuro("gravedad", "parcialmente_estanco", 5)).toBe(1);
    expect(CONDICIONES_MURO_TABLA_2_2.datos.notas).toHaveLength(4);
  });
});

describe("condiciones de suelo (tabla 2.4)", () => {
  const todas = (bloque: "flexorresistente_o_gravedad" | "pantalla") =>
    TIPOS_SUELO.flatMap((t) => INTERVENCIONES_TERRENO.flatMap((i) => GRADOS.map((g) => casillaSuelo(bloque, t, i, g))));

  it("sombreadas y en blanco de cada bloque", () => {
    expect(todas("flexorresistente_o_gravedad").filter((c) => c === null)).toHaveLength(3);
    expect(todas("flexorresistente_o_gravedad").filter((c) => c !== null && c.length === 0)).toHaveLength(5);
    expect(todas("pantalla").filter((c) => c === null)).toHaveLength(1);
    expect(todas("pantalla").filter((c) => c !== null && c.length === 0)).toHaveLength(7);
    expect(casillaSuelo("flexorresistente_o_gravedad", "solera", "sin_intervencion", 5)).toBeNull();
    expect(casillaSuelo("pantalla", "solera", "sin_intervencion", 5)).not.toBeNull();
  });

  it("las casillas raras se copian tal cual (posible errata del DB)", () => {
    expect(casillaSuelo("flexorresistente_o_gravedad", "placa", "sin_intervencion", 3)).toEqual(["C1", "C2", "I2", "D1", "D2", "S1", "S2", "S3"]);
    expect(casillaSuelo("pantalla", "solera", "sin_intervencion", 4)).toEqual(["C1", "C3", "I1", "D2", "D3", "P1", "S2", "S3"]);
  });

  it("las habituales de la verificación", () => {
    expect(casillaSuelo("flexorresistente_o_gravedad", "solera", "sin_intervencion", 2)).toEqual(["C2", "C3", "D1"]);
    expect(casillaSuelo("flexorresistente_o_gravedad", "solera", "sub_base", 1)).toEqual([]);
    expect(casillaSuelo("flexorresistente_o_gravedad", "elevado", "sin_intervencion", 1)).toEqual(["V1"]);
  });
});

describe("fachadas (tablas 2.5, 2.6 y 2.7)", () => {
  it("lee las casillas", () => {
    expect(gradoFachada("V3", "IV")).toBe(2);
    expect(gradoFachada("V1", "III")).toBe(4);
    expect(exposicionViento(13, "E1", "A")).toBe("V3");
    expect(exposicionViento(13, "E0", "C")).toBe("V2");
    expect(exposicionViento(30, "E0", "C")).toBe("V1");
    expect(exposicionViento(60, "E1", "A")).toBe("V2");
    expect(entornoDe("III")).toBe("E0");
    expect(entornoDe("IV")).toBe("E1");
  });

  it("entre 15 y 16 m es la fila de 16 a 40 (intervalos, nunca fuera de tabla)", () => {
    expect(exposicionViento(15, "E0", "C")).toBe("V2");
    expect(exposicionViento(15.5, "E0", "C")).toBe("V1");
  });

  it("más altura, entorno E0 o más viento nunca bajan la exposición; más lluvia o más exposición, el grado", () => {
    const rango = (e: Exposicion) => EXPOSICIONES.indexOf(e);
    const alturas = [5, 15, 15.1, 30, 40, 40.1, 80, 100];
    for (const z of ZONAS_EOLICAS) {
      for (let i = 1; i < alturas.length; i++) {
        for (const ent of ["E0", "E1"] as const) {
          expect(rango(exposicionViento(alturas[i], ent, z))).toBeGreaterThanOrEqual(rango(exposicionViento(alturas[i - 1], ent, z)));
        }
      }
    }
    for (const h of alturas) {
      for (const z of ZONAS_EOLICAS) expect(rango(exposicionViento(h, "E0", z))).toBeGreaterThanOrEqual(rango(exposicionViento(h, "E1", z)));
      for (const ent of ["E0", "E1"] as const) {
        for (let k = 1; k < ZONAS_EOLICAS.length; k++) {
          expect(rango(exposicionViento(h, ent, ZONAS_EOLICAS[k]))).toBeGreaterThanOrEqual(rango(exposicionViento(h, ent, ZONAS_EOLICAS[k - 1])));
        }
      }
    }
    for (const e of EXPOSICIONES) {
      for (let k = 1; k < ZONAS_PLUVIOMETRICAS_HS1.length; k++) {
        expect(gradoFachada(e, ZONAS_PLUVIOMETRICAS_HS1[k - 1])).toBeGreaterThanOrEqual(gradoFachada(e, ZONAS_PLUVIOMETRICAS_HS1[k]));
      }
    }
    for (const z of ZONAS_PLUVIOMETRICAS_HS1) {
      for (let k = 1; k < EXPOSICIONES.length; k++) expect(gradoFachada(EXPOSICIONES[k], z)).toBeGreaterThanOrEqual(gradoFachada(EXPOSICIONES[k - 1], z));
    }
  });

  it("con 15 m o menos la zona eólica no influye", () => {
    for (const t of TERRENOS_TIPO) {
      expect(new Set(ZONAS_EOLICAS.map((z) => exposicionViento(12, entornoDe(t), z))).size).toBe(1);
    }
  });

  it("todas las casillas tienen alguna combinación; la nota de la hoja única va en opciones con C1", () => {
    for (const col of ["con_revestimiento", "sin_revestimiento"] as const) {
      for (const g of GRADOS) expect(opcionesFachada(col, g).length).toBeGreaterThan(0);
    }
    for (const n of CONDICIONES_FACHADA_TABLA_2_7.datos.nota1) {
      expect(opcionesFachada(n.columna, n.grado)[n.opcion]).toMatchObject({ nota1: true });
      expect(opcionesFachada(n.columna, n.grado)[n.opcion].codigos).toContain("C1");
    }
    expect(opcionesFachada("con_revestimiento", 3).map((o) => o.codigos.join("+"))).toEqual(["R1+B1+C1", "R1+C2"]);
    expect(opcionesFachada("sin_revestimiento", 5).map((o) => o.codigos.join("+"))).toEqual(["B3+C1"]);
  });
});

describe("cada código tiene su texto, en su tabla", () => {
  it("muros, suelos y fachadas", () => {
    const codigosDe = (x: unknown): string[] =>
      Array.isArray(x) ? x.flatMap(codigosDe) : x && typeof x === "object" ? Object.values(x).flatMap(codigosDe) : typeof x === "string" ? [x] : [];
    for (const c of new Set(codigosDe(CONDICIONES_MURO_TABLA_2_2.datos.casillas))) expect(CONDICIONES_MURO[c], c).toBeDefined();
    for (const c of new Set(codigosDe(CONDICIONES_SUELO_TABLA_2_4.datos))) expect(CONDICIONES_SUELO[c], c).toBeDefined();
    for (const c of new Set(codigosDe([CONDICIONES_FACHADA_TABLA_2_7.datos.con_revestimiento, CONDICIONES_FACHADA_TABLA_2_7.datos.sin_revestimiento]))) {
      expect(CONDICIONES_FACHADA[c], c).toBeDefined();
    }
  });
});

describe("dimensionado (tablas 3.1 y 3.2)", () => {
  it("tubos de drenaje por grado y sus orificios", () => {
    expect(tuboDrenaje(2)).toMatchObject({ dnBajoSuelo_mm: 125, dnPerimetroMuro_mm: 150, pendienteMin_permil: 3 });
    expect(tuboDrenaje(5)).toMatchObject({ dnBajoSuelo_mm: 200, dnPerimetroMuro_mm: 250, pendienteMin_permil: 8 });
    expect(orificiosDrenaje(250)).toBe(17);
    expect(orificiosDrenaje(125)).toBe(10);
  });
});
