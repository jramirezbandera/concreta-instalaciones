import { describe, it, expect } from "vitest";
import { fc } from "@fast-check/vitest";
import {
  calcHE1,
  he1Defaults,
  type CapaInput,
  type CerramientoInput,
  type HE1Inputs,
  type HE1Result,
  type ResultadoCerramientoHE1,
} from "../calc";
import {
  fRsiMinDe,
  ulimDe,
  type DireccionFlujo,
  type TipoElemento,
  type ZonaClimatica,
} from "../tablas";

// =============================================================================
// HE1 — motor determinista (envolvente térmica). Tests de la Definición de Hecho
// de feature-4 (SPEC §5):
//   1) SNAPSHOTS commiteados y revisables en PR (toMatchInlineSnapshot), sobre
//      subconjuntos relevantes del resultado (el objeto completo es enorme).
//   2) PROPERTY-BASED de los 3 invariantes normativos de la DoD:
//      (a) U decrece (no crece) al añadir aislante.
//      (b) U se compara con la Ulim CORRECTA de la zona (cumpleU coherente).
//      (c) Sin aumento de condensación intersticial al reforzar la barrera de
//          vapor (monotonía del binario de Glaser de enero).
//
// Imports calcados de src/modules/hs4/test/calc.test.ts: "vitest" + el `fc` de
// "@fast-check/vitest". Los invariantes se ejecutan con `fc.assert(fc.property(…))`
// dentro de `it()` (el chainable `test.prop` de @fast-check/vitest 0.2.4 no es
// compatible con Vitest 4.1 — rompe TODA suite que lo usa con "reading 'config'";
// `fc.assert`/`fc.property` es la API estable y portable de fast-check y deja la
// suite en verde). calcHE1 es PURA → sin flakiness.
// =============================================================================

// -----------------------------------------------------------------------------
// HELPERS DE ASERCIÓN — proyectan el resultado a un subconjunto legible para los
// snapshots (u/ulim/cumpleU/fRsi/cumpleFRsi/glaser/estado), evitando volcar el
// objeto completo (capas, arrays de Glaser, motivos largos) en el inline.
// -----------------------------------------------------------------------------

/** Redondeo de PRESENTACIÓN (no del motor): estabiliza los snapshots. */
function round(x: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round(x * f) / f;
}

/** Resumen por cerramiento: las magnitudes de veredicto que fija el snapshot. */
function resumenCerramiento(c: ResultadoCerramientoHE1) {
  return {
    id: c.id,
    tipoElemento: c.tipoElemento,
    // Redondeo SOLO de presentación (el motor opera sin redondear): hace el
    // snapshot estable frente a ruido IEEE-754 sin tocar la lógica del motor.
    u_W_m2K: round(c.u_W_m2K, 4),
    ulim_W_m2K: c.ulim_W_m2K,
    cumpleU: c.cumpleU,
    fRsi: round(c.fRsi, 4),
    fRsiMin: c.fRsiMin,
    cumpleFRsi: c.cumpleFRsi,
    condensaIntersticial: c.glaser.condensaIntersticial,
    estado: c.estado,
  };
}

/** Resumen global del resultado: zona + veredicto + resumen por cerramiento. */
function resumen(r: HE1Result) {
  return {
    zonaClimatica: r.zonaClimatica,
    veredictoGlobal: r.veredictoGlobal,
    porCerramiento: r.porCerramiento.map(resumenCerramiento),
  };
}

// -----------------------------------------------------------------------------
// INPUTS DE REFERENCIA PARA LOS SNAPSHOTS
// -----------------------------------------------------------------------------

/** Un muro simple (LP + XPS), parametrizado por zona, reutilizable. */
function muroSimple(zona: ZonaClimatica): HE1Inputs {
  return {
    zonaClimatica: zona,
    claseHigrometria: "clase_3_o_inferior",
    tempExteriorEnero_C: 5,
    hrExterior_pct: 85,
    cerramientos: [
      {
        id: "muro",
        nombre: "Muro simple (LP + XPS)",
        tipoElemento: "muro_suelo_exterior",
        direccionFlujo: "horizontal",
        capas: [
          { id: "lp", nombre: "Ladrillo perforado", material: "ladrillo_ceramico_perforado", materialDifusion: "ladrillo_ceramico", espesor_m: 0.115 },
          { id: "xps", nombre: "Aislante XPS", material: "xps", espesor_m: 0.06 },
        ],
      },
    ],
  };
}

/**
 * Medianería (UMD): comparte fila con UT en la Tabla 3.1.1.a (mismos valores,
 * verificado DBHE p.16) → tiene Ulim real (zona D = 0,65) y produce veredicto
 * ok/fail como cualquier elemento (ya NO "no aplica").
 */
const medianeria: HE1Inputs = {
  zonaClimatica: "D",
  claseHigrometria: "clase_3_o_inferior",
  tempExteriorEnero_C: 5,
  hrExterior_pct: 85,
  cerramientos: [
    {
      id: "med",
      nombre: "Medianería con vivienda contigua",
      tipoElemento: "medianeria",
      direccionFlujo: "horizontal",
      capas: [
        { id: "lh", nombre: "Tabicón LH", material: "ladrillo_ceramico_hueco", materialDifusion: "ladrillo_ceramico", espesor_m: 0.1 },
        { id: "ais", nombre: "Lana mineral", material: "lana_mineral", espesor_m: 0.04 },
      ],
    },
  ],
};

/**
 * Caso de condensación intersticial (Glaser, enero) que NO falla ni U ni fRsi:
 * aislante por el INTERIOR (lana mineral, muy permeable al vapor) sobre fábrica/
 * acabado exterior, en clima frío (zona E, θe = −5 °C) y alta higrometría (clase
 * 5, HR 70 %). El aislante interior deja pasar el vapor pero enfría el plano tras
 * él; allí Pvapor ≥ Psat y condensa. Como U y fRsi siguen cumpliendo, el peor
 * veredicto del cerramiento es 'warn' (REVISAR balance anual, DA DB-HE/2), NUNCA
 * 'fail' tajante: precisamente el comportamiento que exige la DoD.
 */
const condensaEnero: HE1Inputs = {
  zonaClimatica: "E",
  claseHigrometria: "clase_5",
  tempInterior_C: 20,
  hrInterior_pct: 70,
  tempExteriorEnero_C: -5,
  hrExterior_pct: 90,
  cerramientos: [
    {
      id: "muro-frio",
      nombre: "Muro con aislante por el interior (lana, sin barrera de vapor)",
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [
        // Enlucido permeable + lana interior (muy permeable) + acabado exterior:
        // el vapor pasa hasta el plano frío tras la lana, donde condensa.
        { id: "yeso", nombre: "Enlucido de yeso", lambda_W_mK: 0.57, mu: 6, espesor_m: 0.015 },
        { id: "lana", nombre: "Lana mineral (interior, muy permeable)", lambda_W_mK: 0.035, mu: 1, espesor_m: 0.1 },
        { id: "mort", nombre: "Mortero exterior", lambda_W_mK: 1.3, mu: 10, espesor_m: 0.02 },
      ],
    },
  ],
};

// =============================================================================
// SNAPSHOTS (SPEC §5) — commiteados, revisables en PR. Subconjuntos relevantes.
// =============================================================================

describe("calcHE1 — snapshots (SPEC §5)", () => {
  it("caso de referencia (he1Defaults, vivienda zona D → CUMPLE)", () => {
    const r = calcHE1(he1Defaults);
    expect(resumen(r)).toMatchInlineSnapshot(`
      {
        "porCerramiento": [
          {
            "condensaIntersticial": false,
            "cumpleFRsi": true,
            "cumpleU": true,
            "estado": "ok",
            "fRsi": 0.9041,
            "fRsiMin": 0.61,
            "id": "muro-fachada",
            "tipoElemento": "muro_suelo_exterior",
            "u_W_m2K": 0.3837,
            "ulim_W_m2K": 0.41,
          },
          {
            "condensaIntersticial": false,
            "cumpleFRsi": true,
            "cumpleU": true,
            "estado": "ok",
            "fRsi": 0.9234,
            "fRsiMin": 0.61,
            "id": "cubierta-plana",
            "tipoElemento": "cubierta_exterior",
            "u_W_m2K": 0.3064,
            "ulim_W_m2K": 0.35,
          },
          {
            "condensaIntersticial": false,
            "cumpleFRsi": true,
            "cumpleU": true,
            "estado": "ok",
            "fRsi": 0.65,
            "fRsiMin": 0.61,
            "id": "ventana-salon",
            "tipoElemento": "hueco",
            "u_W_m2K": 1.4,
            "ulim_W_m2K": 1.8,
          },
        ],
        "veredictoGlobal": "ok",
        "zonaClimatica": "D",
      }
    `);
    // Asserts legibles e independientes del snapshot del comportamiento clave.
    expect(r.zonaClimatica).toBe("D");
    expect(r.veredictoGlobal).toBe("ok");
    // Los tres cerramientos cumplen U y fRsi y no condensan en enero.
    for (const c of r.porCerramiento) {
      expect(c.cumpleU).toBe(true);
      expect(c.cumpleFRsi).toBe(true);
      expect(c.glaser.condensaIntersticial).toBe(false);
    }
  });

  it("mismo muro en zona α vs zona E → la Ulim aplicada cambia con la zona", () => {
    const alfa = calcHE1(muroSimple("α"));
    const este = calcHE1(muroSimple("E"));
    expect({ alfa: resumen(alfa), este: resumen(este) }).toMatchInlineSnapshot(`
      {
        "alfa": {
          "porCerramiento": [
            {
              "condensaIntersticial": false,
              "cumpleFRsi": true,
              "cumpleU": true,
              "estado": "ok",
              "fRsi": 0.8848,
              "fRsiMin": 0.42,
              "id": "muro",
              "tipoElemento": "muro_suelo_exterior",
              "u_W_m2K": 0.461,
              "ulim_W_m2K": 0.8,
            },
          ],
          "veredictoGlobal": "ok",
          "zonaClimatica": "α",
        },
        "este": {
          "porCerramiento": [
            {
              "condensaIntersticial": false,
              "cumpleFRsi": true,
              "cumpleU": false,
              "estado": "fail",
              "fRsi": 0.8848,
              "fRsiMin": 0.64,
              "id": "muro",
              "tipoElemento": "muro_suelo_exterior",
              "u_W_m2K": 0.461,
              "ulim_W_m2K": 0.37,
            },
          ],
          "veredictoGlobal": "fail",
          "zonaClimatica": "E",
        },
      }
    `);

    const muroAlfa = alfa.porCerramiento[0];
    const muroE = este.porCerramiento[0];
    // La U es idéntica (mismo muro); lo que cambia es la Ulim de la zona.
    expect(muroAlfa.u_W_m2K).toBeCloseTo(muroE.u_W_m2K, 12);
    expect(muroAlfa.ulim_W_m2K).toBe(ulimDe("muro_suelo_exterior", "α")); // 0,80
    expect(muroE.ulim_W_m2K).toBe(ulimDe("muro_suelo_exterior", "E")); // 0,37
    expect(muroAlfa.ulim_W_m2K).toBeGreaterThan(muroE.ulim_W_m2K as number);
    // fRsi,min en zona α usa su columna REAL (clase 3 → 0,42), NO la de A (0,50).
    expect(muroAlfa.fRsiMin).toBe(0.42);
    expect(muroE.fRsiMin).toBe(0.64);
  });

  it("medianería (UMD) → tiene Ulim real (= UT, zona D = 0,65) y produce veredicto U", () => {
    const r = calcHE1(medianeria);
    expect(resumen(r)).toMatchInlineSnapshot(`
      {
        "porCerramiento": [
          {
            "condensaIntersticial": false,
            "cumpleFRsi": true,
            "cumpleU": true,
            "estado": "ok",
            "fRsi": 0.8462,
            "fRsiMin": 0.61,
            "id": "med",
            "tipoElemento": "medianeria",
            "u_W_m2K": 0.6152,
            "ulim_W_m2K": 0.65,
          },
        ],
        "veredictoGlobal": "ok",
        "zonaClimatica": "D",
      }
    `);
    const med = r.porCerramiento[0];
    // UMD comparte fila con UT: Ulim NUMÉRICA (0,65 en zona D), NO null.
    expect(med.ulim_W_m2K).toBe(0.65);
    expect(med.ulim_W_m2K).toBe(ulimDe("medianeria", "D"));
    expect(med.ulim_W_m2K).toBe(ulimDe("contacto_no_habitable_terreno", "D"));
    // Hay margen real (Ulim − U) y un veredicto de transmitancia (no neutral).
    expect(med.margenU).not.toBeNull();
    expect(med.margenU).toBeCloseTo(0.65 - med.u_W_m2K, 12);
    // cumpleU coherente con U ≤ Ulim; el estado SÍ refleja la comparación de U.
    expect(med.cumpleU).toBe(med.u_W_m2K <= 0.65);
    expect(med.estado).not.toBe("neutral");
  });

  it("condensación intersticial (Glaser enero) → condensaIntersticial=true ⇒ estado 'warn' (no fail)", () => {
    const r = calcHE1(condensaEnero);
    expect(resumen(r)).toMatchInlineSnapshot(`
      {
        "porCerramiento": [
          {
            "condensaIntersticial": true,
            "cumpleFRsi": true,
            "cumpleU": true,
            "estado": "warn",
            "fRsi": 0.9185,
            "fRsiMin": 0.9,
            "id": "muro-frio",
            "tipoElemento": "muro_suelo_exterior",
            "u_W_m2K": 0.3259,
            "ulim_W_m2K": 0.37,
          },
        ],
        "veredictoGlobal": "warn",
        "zonaClimatica": "E",
      }
    `);
    const muro = r.porCerramiento[0];
    // Hay condensación intersticial en enero (en un plano INTERIOR, no en la cara)…
    expect(muro.glaser.condensaIntersticial).toBe(true);
    expect(muro.glaser.condensa.some((b) => b)).toBe(true);
    // …y U y fRsi SÍ cumplen: así se demuestra que es la condensación (no U/fRsi)
    // la que marca el estado del cerramiento.
    expect(muro.cumpleU).toBe(true);
    expect(muro.cumpleFRsi).toBe(true);
    // El predimensionado por mes desfavorable NO es un NO CUMPLE tajante: el peor
    // veredicto del cerramiento es 'warn' (REVISAR), no 'fail'.
    expect(muro.estado).toBe("warn");
    // El motor emite el aviso de REVISAR el balance anual (DA DB-HE/2).
    expect(r.warnings.some((w) => /condensaci[óo]n intersticial/i.test(w))).toBe(true);
  });
});

// =============================================================================
// HELPERS DE TABLA (lookup) — cifras VERIFICADAS celda a celda contra el PDF.
// =============================================================================

describe("tablas HE1 — lookup verificado", () => {
  it("ulimDe('medianeria', 'D') === 0.65 (UMD comparte fila con UT)", () => {
    expect(ulimDe("medianeria", "D")).toBe(0.65);
    // En TODA zona, UMD = UT (misma fila de la Tabla 3.1.1.a, verificado p.16).
    for (const z of ["α", "A", "B", "C", "D", "E"] as ZonaClimatica[]) {
      expect(ulimDe("medianeria", z)).toBe(ulimDe("contacto_no_habitable_terreno", z));
      expect(ulimDe("medianeria", z)).not.toBeNull();
    }
  });

  it("fRsiMinDe('clase_3_o_inferior', 'α') === 0.42 (columna α real, no la de A)", () => {
    expect(fRsiMinDe("clase_3_o_inferior", "α")).toBe(0.42);
    // La columna α tiene valor propio en cada clase (verificado DA DB-HE/2, Tabla 1).
    expect(fRsiMinDe("clase_4", "α")).toBe(0.56);
    expect(fRsiMinDe("clase_5", "α")).toBe(0.7);
    // Y NO coincide con la columna A (que sigue intacta).
    expect(fRsiMinDe("clase_3_o_inferior", "α")).not.toBe(
      fRsiMinDe("clase_3_o_inferior", "A"),
    );
  });
});

// =============================================================================
// DETERMINISMO (SPEC §4) — calcHE1 es pura: mismo input → mismo output.
// =============================================================================

describe("calcHE1 — determinismo (sin Date/random)", () => {
  it("mismo input → mismo output (defaults / medianería / condensación)", () => {
    expect(calcHE1(he1Defaults)).toEqual(calcHE1(he1Defaults));
    expect(calcHE1(medianeria)).toEqual(calcHE1(medianeria));
    expect(calcHE1(condensaEnero)).toEqual(calcHE1(condensaEnero));
    expect(calcHE1(muroSimple("D"))).toEqual(calcHE1(muroSimple("D")));
  });
});

// =============================================================================
// GENERADORES fast-check (calcados del estilo de hs4/test/calc.test.ts)
// =============================================================================

/**
 * Tipos de elemento (subconjunto). Todos tienen hoy Ulim numérica, incl. la
 * medianería (UMD comparte fila con UT). Se omite la medianería aquí solo por
 * no duplicar cobertura con `arbTipoElemento`.
 */
const arbTipoConUlim: fc.Arbitrary<TipoElemento> = fc.constantFrom(
  "muro_suelo_exterior",
  "cubierta_exterior",
  "contacto_no_habitable_terreno",
  "hueco",
  "puerta",
);

/** Todos los tipos, incluida la medianería (UMD: Ulim numérica = UT). */
const arbTipoElemento: fc.Arbitrary<TipoElemento> = fc.constantFrom(
  "muro_suelo_exterior",
  "cubierta_exterior",
  "contacto_no_habitable_terreno",
  "hueco",
  "puerta",
  "medianeria",
);

const arbZona: fc.Arbitrary<ZonaClimatica> = fc.constantFrom("α", "A", "B", "C", "D", "E");

const arbFlujo: fc.Arbitrary<DireccionFlujo> = fc.constantFrom(
  "horizontal",
  "ascendente",
  "descendente",
);

/** λ plausible de un material masivo [W/(m·K)] (no aislante). */
const arbLambda: fc.Arbitrary<number> = fc.double({
  min: 0.2,
  max: 2.5,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Espesor de capa plausible [m] (capa real, no degenerada). */
const arbEspesor: fc.Arbitrary<number> = fc.double({
  min: 0.01,
  max: 0.5,
  noNaN: true,
  noDefaultInfinity: true,
});

/**
 * Cerramiento de una sola capa masiva (e/λ) sin barrera de vapor, para aislar el
 * efecto de añadir aislante / cambiar la zona.
 */
function cerramientoBase(
  tipo: TipoElemento,
  flujo: DireccionFlujo,
  lambda_W_mK: number,
  espesor_m: number,
): CerramientoInput {
  return {
    id: "base",
    nombre: "Cerramiento base",
    tipoElemento: tipo,
    direccionFlujo: flujo,
    capas: [{ id: "masa", nombre: "Capa masiva", lambda_W_mK, espesor_m, mu: 10 }],
  };
}

function inputs1Cerramiento(cer: CerramientoInput, zona: ZonaClimatica): HE1Inputs {
  return {
    zonaClimatica: zona,
    claseHigrometria: "clase_3_o_inferior",
    tempExteriorEnero_C: 5,
    hrExterior_pct: 85,
    cerramientos: [cer],
  };
}

// =============================================================================
// PROPERTY-BASED (invariantes normativos de la DoD)
// =============================================================================

describe("calcHE1 — invariantes (property-based)", () => {
  // (a) INVARIANTE DoD: U decrece (no crece) al AÑADIR AISLANTE. Dado un
  //     cerramiento, intercalar una capa de aislante (λ bajo, e>0) AUMENTA la
  //     resistencia térmica total ⇒ U_resultante ≤ U_original.
  it("añadir una capa de aislante nunca aumenta U (U' ≤ U)", () => {
    fc.assert(
      fc.property(
        arbTipoConUlim,
        arbFlujo,
        arbLambda,
        arbEspesor,
        // Aislante: λ bajo (0,02–0,06) y espesor > 0.
        fc.double({ min: 0.02, max: 0.06, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.01, max: 0.2, noNaN: true, noDefaultInfinity: true }),
        arbZona,
        (tipo, flujo, lambdaBase, espesorBase, lambdaAis, espesorAis, zona) => {
          const base = cerramientoBase(tipo, flujo, lambdaBase, espesorBase);
          const conAislante: CerramientoInput = {
            ...base,
            capas: [
              ...base.capas,
              { id: "aislante", nombre: "Aislante añadido", lambda_W_mK: lambdaAis, espesor_m: espesorAis, mu: 60 },
            ],
          };
          const uSin = calcHE1(inputs1Cerramiento(base, zona)).porCerramiento[0].u_W_m2K;
          const uCon = calcHE1(inputs1Cerramiento(conAislante, zona)).porCerramiento[0].u_W_m2K;
          // Monotonía: más aislante ⇒ U no mayor (tolerancia IEEE-754).
          expect(uCon).toBeLessThanOrEqual(uSin + 1e-12);
        },
      ),
    );
  });

  // (b) INVARIANTE DoD: U se compara con la Ulim CORRECTA de la zona/tipo. El
  //     ulim_W_m2K del resultado coincide con ulimDe(tipo, zona); cuando NO es
  //     null (hoy todos los tipos, incl. medianería UMD), cumpleU ⟺ (U ≤ Ulim).
  //     La rama null es defensiva (ningún tipo la dispara con las tablas actuales).
  it("ulim_W_m2K = ulimDe(tipo, zona) y cumpleU coherente con U ≤ Ulim", () => {
    fc.assert(
      fc.property(arbTipoElemento, arbZona, arbFlujo, arbLambda, arbEspesor, (tipo, zona, flujo, lambda, espesor) => {
        const cer = cerramientoBase(tipo, flujo, lambda, espesor);
        const r = calcHE1(inputs1Cerramiento(cer, zona)).porCerramiento[0];
        const ulimEsperada = ulimDe(tipo, zona);
        // La Ulim aplicada es EXACTAMENTE la de la tabla para esa zona/tipo.
        expect(r.ulim_W_m2K).toBe(ulimEsperada);
        if (ulimEsperada === null) {
          // Rama defensiva (sin tipo que la dispare hoy): no aplica → true/null.
          expect(r.cumpleU).toBe(true);
          expect(r.margenU).toBeNull();
        } else {
          // cumpleU ⟺ U ≤ Ulim, y el margen es Ulim − U.
          expect(r.cumpleU).toBe(r.u_W_m2K <= ulimEsperada);
          expect(r.margenU).toBeCloseTo(ulimEsperada - r.u_W_m2K, 12);
        }
      }),
    );
  });

  // (b-ter) La medianería (UMD) produce veredicto REAL de transmitancia: su Ulim
  //         es la de UT (no null) y cumpleU/margen se calculan como en cualquier
  //         elemento (verificado DBHE p.16: UMD comparte fila con UT).
  it("medianería produce veredicto real: Ulim = UT y cumpleU coherente", () => {
    fc.assert(
      fc.property(arbZona, arbFlujo, arbLambda, arbEspesor, (zona, flujo, lambda, espesor) => {
        const cer = cerramientoBase("medianeria", flujo, lambda, espesor);
        const r = calcHE1(inputs1Cerramiento(cer, zona)).porCerramiento[0];
        const ulimUMD = ulimDe("medianeria", zona);
        const ulimUT = ulimDe("contacto_no_habitable_terreno", zona);
        // UMD comparte fila (mismos valores) con UT y NO es null.
        expect(ulimUMD).not.toBeNull();
        expect(ulimUMD).toBe(ulimUT);
        expect(r.ulim_W_m2K).toBe(ulimUMD);
        expect(r.margenU).not.toBeNull();
        expect(r.cumpleU).toBe(r.u_W_m2K <= (ulimUMD as number));
      }),
    );
  });

  // (b-bis) Cambiar SOLO la zona NO cambia U (mismo muro), pero sí la Ulim: la
  //         comparación usa la Ulim de la zona, no una fija.
  it("misma capa, distinta zona ⇒ misma U pero Ulim según zona", () => {
    fc.assert(
      fc.property(arbZona, arbZona, arbFlujo, arbLambda, arbEspesor, (z1, z2, flujo, lambda, espesor) => {
        const cer = cerramientoBase("muro_suelo_exterior", flujo, lambda, espesor);
        const r1 = calcHE1(inputs1Cerramiento(cer, z1)).porCerramiento[0];
        const r2 = calcHE1(inputs1Cerramiento(cer, z2)).porCerramiento[0];
        // La U solo depende de las capas + flujo, no de la zona.
        expect(r1.u_W_m2K).toBeCloseTo(r2.u_W_m2K, 12);
        // Y la Ulim aplicada es la de cada zona (puede coincidir si z1===z2).
        expect(r1.ulim_W_m2K).toBe(ulimDe("muro_suelo_exterior", z1));
        expect(r2.ulim_W_m2K).toBe(ulimDe("muro_suelo_exterior", z2));
      }),
    );
  });

  // (c) INVARIANTE DoD (condensación intersticial): REFORZAR la barrera de vapor
  //     (subir el Sd de la cara caliente / interior) NO aumenta la condensación
  //     intersticial. Monotonía del binario de Glaser de enero: condensaIntersticial
  //     no pasa de false→true al aumentar Sd interior (más Sd interior ⇒ menos
  //     presión de vapor en el plano frío ⇒ menos riesgo).
  it("reforzar la barrera de vapor (más Sd interior) no introduce condensación intersticial", () => {
    fc.assert(
      fc.property(
        arbFlujo,
        arbLambda,
        arbEspesor,
        // Aislante exterior (genera el plano frío donde puede condensar).
        fc.double({ min: 0.02, max: 0.06, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.04, max: 0.2, noNaN: true, noDefaultInfinity: true }),
        // Sd de la barrera interior, y su incremento al "reforzarla".
        fc.double({ min: 0, max: 2, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
        (flujo, lambdaMasa, espesorMasa, lambdaAis, espesorAis, sdBarrera, sdExtra) => {
          // Muro frío de enero: barrera interior + fábrica + aislante exterior.
          const capasCon = (sdBV: number): CapaInput[] => [
            // Barrera de vapor en la cara CALIENTE (interior): Sd declarado.
            { id: "barrera", nombre: "Barrera de vapor (interior)", espesor_m: 0.001, lambda_W_mK: 0.2, sd_m: sdBV },
            { id: "masa", nombre: "Fábrica", lambda_W_mK: lambdaMasa, espesor_m: espesorMasa, mu: 10 },
            { id: "aislante", nombre: "Aislante exterior", lambda_W_mK: lambdaAis, espesor_m: espesorAis, mu: 1 },
          ];
          const cerOf = (sdBV: number): CerramientoInput => ({
            id: "muro",
            nombre: "Muro con barrera de vapor",
            tipoElemento: "muro_suelo_exterior",
            direccionFlujo: flujo,
            capas: capasCon(sdBV),
          });
          // Clima frío de enero + higrometría alta para que el riesgo sea real.
          const inp = (sdBV: number): HE1Inputs => ({
            zonaClimatica: "E",
            claseHigrometria: "clase_5",
            tempInterior_C: 20,
            hrInterior_pct: 70,
            tempExteriorEnero_C: -5,
            hrExterior_pct: 90,
            cerramientos: [cerOf(sdBV)],
          });
          const debil = calcHE1(inp(sdBarrera)).porCerramiento[0].glaser.condensaIntersticial;
          const fuerte = calcHE1(inp(sdBarrera + sdExtra)).porCerramiento[0].glaser.condensaIntersticial;
          // Monotonía: si la barrera débil NO condensa, la reforzada tampoco puede
          // empezar a condensar. (false→true PROHIBIDO al subir el Sd interior.)
          if (!debil) {
            expect(fuerte).toBe(false);
          }
        },
      ),
    );
  });

  // (c-bis) Con HR interior MUY baja no hay condensación intersticial: la presión
  //     de vapor interior queda muy por debajo de la saturación en todo el muro.
  it("HR interior muy baja ⇒ sin condensación intersticial", () => {
    fc.assert(
      fc.property(arbFlujo, arbLambda, arbEspesor, arbZona, (flujo, lambda, espesor, zona) => {
        const cer = cerramientoBase("muro_suelo_exterior", flujo, lambda, espesor);
        const r = calcHE1({
          zonaClimatica: zona,
          claseHigrometria: "clase_3_o_inferior",
          tempInterior_C: 20,
          hrInterior_pct: 5, // ambiente interior extremadamente seco
          tempExteriorEnero_C: 5,
          hrExterior_pct: 50,
          cerramientos: [cer],
        }).porCerramiento[0];
        expect(r.glaser.condensaIntersticial).toBe(false);
      }),
    );
  });

  // PUREZA general sobre cerramientos arbitrarios (mismo input → mismo output).
  it("determinista: mismo input → mismo output", () => {
    fc.assert(
      fc.property(arbTipoElemento, arbZona, arbFlujo, arbLambda, arbEspesor, (tipo, zona, flujo, lambda, espesor) => {
        const inp = inputs1Cerramiento(cerramientoBase(tipo, flujo, lambda, espesor), zona);
        expect(calcHE1(inp)).toEqual(calcHE1(inp));
      }),
    );
  });
});

// =============================================================================
// GUARDAS — entradas degeneradas (espesor 0, sin capas, sin cerramientos): el
// motor no lanza y produce resultados coherentes (sin NaN; veredicto neutral).
// =============================================================================

describe("calcHE1 — guardas de entradas degeneradas", () => {
  it("cerramiento sin capas: RT = Rsi + Rse, U finita, no lanza", () => {
    const cer: CerramientoInput = {
      id: "vacio",
      nombre: "Cerramiento sin capas",
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [],
    };
    const r = calcHE1(inputs1Cerramiento(cer, "D")).porCerramiento[0];
    expect(Number.isFinite(r.rt_m2K_W)).toBe(true);
    expect(r.rt_m2K_W).toBeGreaterThan(0);
    expect(Number.isFinite(r.u_W_m2K)).toBe(true);
    // Glaser sobre un muro sin capas: 1 sola interfaz (cara interior), sin NaN.
    expect(r.glaser.posicionSd).toHaveLength(1);
    expect(Number.isNaN(r.glaser.temperatura_C[0])).toBe(false);
    expect(typeof r.glaser.condensaIntersticial).toBe("boolean");
  });

  it("capa de espesor 0: aporta R=0, no lanza, U coherente (sin NaN)", () => {
    const cer: CerramientoInput = {
      id: "e0",
      nombre: "Capa de espesor cero",
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [{ id: "nula", lambda_W_mK: 1, espesor_m: 0, mu: 10 }],
    };
    const r = calcHE1(inputs1Cerramiento(cer, "D")).porCerramiento[0];
    expect(r.capas[0].resistencia_m2K_W).toBe(0);
    expect(Number.isFinite(r.u_W_m2K)).toBe(true);
    expect(Number.isNaN(r.u_W_m2K)).toBe(false);
  });

  it("envolvente sin cerramientos: veredicto neutral, sin cerramientos", () => {
    const r = calcHE1({
      zonaClimatica: "D",
      claseHigrometria: "clase_3_o_inferior",
      tempExteriorEnero_C: 5,
      hrExterior_pct: 85,
      cerramientos: [],
    });
    expect(r.porCerramiento).toEqual([]);
    expect(r.veredictoGlobal).toBe("neutral");
  });
});
