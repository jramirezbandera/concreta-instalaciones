import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  calcHS4,
  hs4Defaults,
  SERIE_DIAMETROS_COMERCIALES_mm,
  type AparatoInputHS4,
  type CriterioK,
  type HS4Inputs,
  type TramoInputHS4,
} from "../calc";
import { rangoVelocidad, type MaterialTuberia, type TipoAparatoHS4 } from "../tablas";

// =============================================================================
// HS4 — motor determinista (fontanería). Snapshots commiteados (SPEC §5) +
// property-based de invariantes normativos (@fast-check/vitest).
//
// Estructura calcada de src/modules/hs5/test/calc.test.ts: snapshots inline
// (revisables en PR) para los escenarios representativos, bloques describe/it
// para los casos borde y test.prop para los invariantes.
// =============================================================================

// --- Inputs de referencia para los snapshots --------------------------------

/** Vivienda realista (defaults): baño + aseo + cocina, acometida 250 kPa. */
const vivienda: HS4Inputs = hs4Defaults;

/**
 * Acometida de baja presión (120 kPa) en la MISMA red de los defaults: las
 * pérdidas + la cota de 3 m del montante dejan el punto crítico por debajo de la
 * mínima exigida ⇒ debe activar el grupo de presión (ap. 4.5).
 */
const acometidaBaja: HS4Inputs = {
  ...hs4Defaults,
  presionAcometida_kPa: 120,
};

/**
 * Red mínima con UN solo aparato (K = 1): la fórmula UNE 149201 no aplica
 * (n < 2). El lavabo cuelga de su derivación → derivación particular →
 * acometida. Material termoplástico.
 */
const unSoloAparato: HS4Inputs = {
  presionAcometida_kPa: 300,
  criterioK: "une149201",
  aparatos: [{ id: "lavabo", tipo: "lavabo", tramoId: "d-lavabo" }],
  tramos: [
    {
      id: "d-lavabo",
      tipo: "derivacion_aparato",
      parentId: "alimentacion",
      material: "termoplastico_multicapa",
      longitud_m: 2,
    },
    {
      id: "alimentacion",
      tipo: "tubo_alimentacion",
      parentId: "acometida",
      material: "termoplastico_multicapa",
      longitud_m: 4,
    },
    {
      id: "acometida",
      tipo: "acometida",
      parentId: null,
      material: "termoplastico_multicapa",
      longitud_m: 3,
    },
  ],
};

/**
 * Red con MUCHOS aparatos (24 lavabos) sobre un mismo ramal: dispara la
 * simultaneidad K (K = 1/√(n−1) con n grande ⇒ K pequeño). Material metálico,
 * para contrastar el rango de velocidad frente al termoplástico de los defaults.
 */
const muchosAparatos: HS4Inputs = {
  presionAcometida_kPa: 400,
  criterioK: "une149201",
  aparatos: Array.from({ length: 24 }, (_, i) => ({
    id: `lav-${i}`,
    tipo: "lavabo" as const,
    tramoId: "d-lavabos",
  })),
  tramos: [
    {
      id: "d-lavabos",
      tipo: "derivacion_aparato",
      parentId: "ramal",
      material: "metalica",
      longitud_m: 2,
    },
    {
      id: "ramal",
      tipo: "derivacion_particular",
      parentId: "alimentacion",
      material: "metalica",
      longitud_m: 5,
    },
    {
      id: "alimentacion",
      tipo: "tubo_alimentacion",
      parentId: "acometida",
      material: "metalica",
      longitud_m: 6,
    },
    { id: "acometida", tipo: "acometida", parentId: null, material: "metalica", longitud_m: 3 },
  ],
};

// =============================================================================
// SNAPSHOTS (SPEC §5) — commiteados y revisados en PR. Determinismo verificado
// aparte. Se usa snapshot inline para que el diff sea legible en la revisión.
// =============================================================================

describe("calcHS4 — snapshots (SPEC §5)", () => {
  it("vivienda realista (defaults, acometida 250 kPa → CUMPLE)", () => {
    expect(calcHS4(vivienda)).toMatchSnapshot();
  });

  it("acometida baja (120 kPa) → grupo de presión necesario", () => {
    const r = calcHS4(acometidaBaja);
    expect(r).toMatchSnapshot();
    // Asserts legibles (independientes del snapshot) del comportamiento clave.
    expect(r.grupoPresionNecesario).toBe(true);
    expect(r.presionCritica_kPa).toBeLessThan(100); // < mín. grifo común (Tabla PRESIONES)
  });

  it("un solo aparato (K = 1, la fórmula UNE 149201 no aplica)", () => {
    const r = calcHS4(unSoloAparato);
    expect(r).toMatchSnapshot();
    // n = 1 ⇒ K = 1 en todos los tramos.
    for (const t of r.porTramo) expect(t.k).toBe(1);
  });

  it("muchos aparatos (24) → K de simultaneidad pequeño", () => {
    const r = calcHS4(muchosAparatos);
    expect(r).toMatchSnapshot();
    const ramal = r.porTramo.find((t) => t.id === "ramal")!;
    expect(ramal.numAparatos).toBe(24);
    // K = 1/√(24−1) ≈ 0.2085 < 1.
    expect(ramal.k).toBeLessThan(1);
    expect(ramal.k).toBeGreaterThan(0);
    // El caudal de cálculo es menor que el acumulado por efecto de K.
    expect(ramal.caudalCalculo_dm3_s).toBeLessThan(ramal.caudalAcumulado_dm3_s);
  });
});

describe("calcHS4 — determinismo (sin Date/random)", () => {
  it("mismo input → mismo output (defaults / baja / muchos)", () => {
    expect(calcHS4(vivienda)).toEqual(calcHS4(vivienda));
    expect(calcHS4(acometidaBaja)).toEqual(calcHS4(acometidaBaja));
    expect(calcHS4(muchosAparatos)).toEqual(calcHS4(muchosAparatos));
    expect(calcHS4(unSoloAparato)).toEqual(calcHS4(unSoloAparato));
  });
});

// =============================================================================
// REGRESIÓN OV-4 — criticidad por DÉFICIT, no por presión absoluta.
//
// Dos ramas independientes desde la acometida (140 kPa):
//  - Rama GRIFO: con cota de subida (≈ −19,6 kPa) ⇒ residual ≈ 120 kPa, mínima
//    exigida 100 ⇒ MARGEN +20 (CUMPLE).
//  - Rama FLUXOR: casi sin pérdidas ⇒ residual ≈ 140 kPa, mínima exigida 150 ⇒
//    DÉFICIT −10 (NO CUMPLE).
// El grifo "gana" por presión ABSOLUTA (120 < 140), pero el FLUXOR es el de peor
// margen. El motor debe: veredicto NO CUMPLE (fail), grupoPresionNecesario=true,
// y punto crítico = el fluxor (no el grifo). Antes (bug OV-4) elegía el grifo y
// concluía "grupo no necesario" dejando incumplir el fluxor.
// =============================================================================

describe("calcHS4 — regresión OV-4 (criticidad por déficit)", () => {
  const grifoVsFluxor: HS4Inputs = {
    presionAcometida_kPa: 140,
    criterioK: "sin_simultaneidad",
    aparatos: [
      // Grifo común (mín. 100): residual ~120 por la cota → margen +20.
      { id: "ap-grifo", tipo: "grifo_aislado", tramoId: "d-grifo" },
      // Fluxor (mín. 150): residual ~140 → déficit −10.
      { id: "ap-fluxor", tipo: "inodoro_fluxor", tramoId: "d-fluxor" },
    ],
    tramos: [
      // Rama del grifo: sube 2 m (cota ≈ 19,6 kPa) → menor presión absoluta.
      {
        id: "d-grifo",
        tipo: "derivacion_aparato",
        parentId: "acometida",
        material: "metalica",
        longitud_m: 0.01,
        altura_m: 2,
      },
      // Rama del fluxor: prácticamente sin pérdidas (Ø grande por el fluxor).
      {
        id: "d-fluxor",
        tipo: "derivacion_aparato",
        parentId: "acometida",
        material: "metalica",
        longitud_m: 0.01,
        altura_m: 0,
      },
      { id: "acometida", tipo: "acometida", parentId: null, material: "metalica", longitud_m: 0.01 },
    ],
  };

  it("el fluxor (déficit) es crítico aunque el grifo tenga MENOR presión absoluta", () => {
    const r = calcHS4(grifoVsFluxor);
    const resById = new Map(r.porTramo.map((t) => [t.id, t.presionResidual_kPa]));
    const presionGrifo = resById.get("d-grifo")!;
    const presionFluxor = resById.get("d-fluxor")!;

    // El grifo tiene MENOR presión absoluta (por la cota) que el fluxor.
    expect(presionGrifo).toBeLessThan(presionFluxor);
    // El grifo CUMPLE (≥ 100) y el fluxor NO (< 150).
    expect(presionGrifo).toBeGreaterThanOrEqual(100);
    expect(presionFluxor).toBeLessThan(150);

    // Criticidad por DÉFICIT: el punto crítico es el FLUXOR (margen −10), no el
    // grifo (margen +20), pese a tener el grifo menor presión absoluta.
    expect(r.puntoCriticoId).toBe("ap-fluxor");
    expect(r.presionCritica_kPa).toBeCloseTo(presionFluxor, 9);

    // Veredicto NO CUMPLE y grupo de presión necesario (lo exige el fluxor).
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.grupoPresionNecesario).toBe(true);

    // El aparato fluxor está marcado como incumplimiento; el grifo cumple.
    expect(r.porAparato.find((a) => a.id === "ap-fluxor")!.cumple).toBe(false);
    expect(r.porAparato.find((a) => a.id === "ap-grifo")!.cumple).toBe(true);
  });
});

// =============================================================================
// CASOS BORDE
// =============================================================================

describe("calcHS4 — casos borde", () => {
  it("red vacía: no lanza, árbol válido trivial, presión crítica = acometida", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "sin_simultaneidad",
      aparatos: [],
      tramos: [],
    });
    expect(r.arbolValido).toBe(true);
    expect(r.porAparato).toEqual([]);
    expect(r.porTramo).toEqual([]);
    expect(r.caudalTotal_dm3_s).toBe(0);
    expect(r.puntoCriticoId).toBeNull();
    // Sin aparatos: la presión crítica es la de la acometida (no Infinity).
    expect(r.presionCritica_kPa).toBe(250);
    expect(r.grupoPresionNecesario).toBe(false);
  });

  it("grafo con CICLO: arbolValido=false + warning, sin excepción", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "une149201",
      aparatos: [{ id: "ap", tipo: "lavabo", tramoId: "a" }],
      tramos: [
        { id: "a", tipo: "derivacion_aparato", parentId: "b" },
        { id: "b", tipo: "derivacion_particular", parentId: "a" },
      ],
    });
    expect(r.arbolValido).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.warnings.some((w) => /[Cc]iclo/.test(w))).toBe(true);
  });

  it("aparato HUÉRFANO (tramo inexistente): warning + fail, sin excepción", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "une149201",
      aparatos: [{ id: "ap", tipo: "lavabo", tramoId: "no-existe" }],
      tramos: [{ id: "acometida", tipo: "acometida", parentId: null }],
    });
    expect(r.arbolValido).toBe(true); // el grafo de tramos sí es árbol
    const ap = r.porAparato.find((a) => a.id === "ap")!;
    expect(ap.cumple).toBe(false);
    expect(ap.estado).toBe("fail");
    expect(r.warnings.some((w) => w.includes("no-existe"))).toBe(true);
  });

  it("tramo HUÉRFANO (padre inexistente): arbolValido=false + fail, no lanza", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "sin_simultaneidad",
      aparatos: [],
      tramos: [{ id: "t", tipo: "columna_montante", parentId: "fantasma" }],
    });
    expect(r.warnings.some((w) => w.includes("fantasma"))).toBe(true);
    // Endurecido (OV-ARCH): el huérfano invalida el árbol (no solo warning).
    expect(r.arbolValido).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    // No debe haber lanzado: el resultado existe y es coherente.
    expect(r.porTramo).toHaveLength(1);
  });

  it("tramo DUPLICADO: arbolValido=false + fail", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "sin_simultaneidad",
      aparatos: [],
      tramos: [
        { id: "acometida", tipo: "acometida", parentId: null },
        { id: "acometida", tipo: "acometida", parentId: null },
      ],
    });
    expect(r.arbolValido).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.warnings.some((w) => /[Dd]uplicad/.test(w))).toBe(true);
  });

  it("MÚLTIPLES RAÍCES (dos tramos con parentId null): arbolValido=false + fail", () => {
    const r = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "sin_simultaneidad",
      aparatos: [],
      tramos: [
        { id: "acometida-a", tipo: "acometida", parentId: null },
        { id: "acometida-b", tipo: "acometida", parentId: null },
      ],
    });
    // HS4 exige raíz única (la acometida): dos raíces invalidan el árbol.
    expect(r.arbolValido).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.warnings.some((w) => /raíces/.test(w))).toBe(true);
  });
});

// =============================================================================
// PROPERTY-BASED (invariantes normativos del feature-3, @fast-check/vitest)
// =============================================================================

const arbAparato: fc.Arbitrary<TipoAparatoHS4> = fc.constantFrom(
  "lavabo",
  "ducha",
  "banera_ge_140",
  "bide",
  "inodoro_cisterna",
  "fregadero_domestico",
  "lavavajillas_domestico",
  "lavadora_domestica",
);

const arbMaterial: fc.Arbitrary<MaterialTuberia> = fc.constantFrom(
  "metalica",
  "termoplastico_multicapa",
);

const arbCriterioK: fc.Arbitrary<CriterioK> = fc.constantFrom("une149201", "sin_simultaneidad");

/**
 * Construye una red lineal: derivación de aparato → derivación particular →
 * columna/montante → tubo de alimentación → acometida, con todos los aparatos
 * colgando de la derivación. Árbol válido por construcción.
 */
function redLineal(
  aparatos: AparatoInputHS4[],
  material: MaterialTuberia = "metalica",
  altura_m = 0,
): HS4Inputs {
  const tramos: TramoInputHS4[] = [
    { id: "d-ap", tipo: "derivacion_aparato", parentId: "ramal", material, longitud_m: 2 },
    { id: "ramal", tipo: "derivacion_particular", parentId: "montante", material, longitud_m: 4 },
    { id: "montante", tipo: "columna_montante", parentId: "alim", material, longitud_m: 5, altura_m },
    { id: "alim", tipo: "tubo_alimentacion", parentId: "acometida", material, longitud_m: 5 },
    { id: "acometida", tipo: "acometida", parentId: null, material, longitud_m: 3 },
  ];
  return { presionAcometida_kPa: 300, criterioK: "sin_simultaneidad", aparatos, tramos };
}

const mkAparatos = (tipos: TipoAparatoHS4[]): AparatoInputHS4[] =>
  tipos.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "d-ap" }));

describe("calcHS4 — invariantes (property-based)", () => {
  // (1) Monotonía del caudal respecto al nº de aparatos: añadir un aparato NUNCA
  //     reduce el caudal acumulado ni el de cálculo en los tramos aguas abajo.
  //     Se usa "sin_simultaneidad" (K=1) para aislar la monotonía del caudal
  //     acumulado, y se comprueba además con criterio K que el acumulado crece.
  test.prop([
    fc.array(arbAparato, { minLength: 0, maxLength: 8 }),
    arbAparato,
  ])("añadir un aparato nunca reduce el caudal acumulado aguas abajo", (tipos, extra) => {
    const sin = calcHS4(redLineal(mkAparatos(tipos)));
    const con = calcHS4(redLineal(mkAparatos([...tipos, extra])));
    const acomSin = sin.porTramo.find((t) => t.id === "acometida")!;
    const acomCon = con.porTramo.find((t) => t.id === "acometida")!;
    // Caudal acumulado (suma de Tabla 2.1) es monótono no decreciente.
    expect(acomCon.caudalAcumulado_dm3_s).toBeGreaterThanOrEqual(acomSin.caudalAcumulado_dm3_s);
    // Sin simultaneidad (K=1) el caudal de cálculo también lo es.
    expect(acomCon.caudalCalculo_dm3_s).toBeGreaterThanOrEqual(acomSin.caudalCalculo_dm3_s);
  });

  // (1b) El caudal total que llega a la acometida = caudal de cálculo de la raíz.
  test.prop([fc.array(arbAparato, { minLength: 1, maxLength: 8 }), arbCriterioK])(
    "el caudal total = caudal de cálculo del tramo raíz",
    (tipos, criterioK) => {
      const inp = { ...redLineal(mkAparatos(tipos)), criterioK };
      const r = calcHS4(inp);
      const acom = r.porTramo.find((t) => t.id === "acometida")!;
      expect(r.caudalTotal_dm3_s).toBeCloseTo(acom.caudalCalculo_dm3_s, 10);
    },
  );

  // (2) Velocidad dentro de rango por material cuando el tramo es 'ok'; y
  //     correspondencia: fuera de rango ⇒ NO puede ser 'ok' (debe ser warn/fail).
  test.prop([
    fc.array(arbAparato, { minLength: 1, maxLength: 8 }),
    arbMaterial,
    arbCriterioK,
  ])(
    "tramo 'ok' con caudal>0 ⇒ velocidad en rango del material; fuera de rango ⇒ no 'ok'",
    (tipos, material, criterioK) => {
      const inp = { ...redLineal(mkAparatos(tipos), material), criterioK };
      const r = calcHS4(inp);
      for (const t of r.porTramo) {
        if (t.velocidad_m_s == null || t.caudalCalculo_dm3_s <= 0) continue;
        const { min_m_s, max_m_s } = rangoVelocidad(t.material);
        const enRango = t.velocidad_m_s >= min_m_s && t.velocidad_m_s <= max_m_s;
        if (t.estado === "ok") {
          // Si el motor dice 'ok', la velocidad ha de estar en rango.
          expect(enRango).toBe(true);
        }
        if (!enRango) {
          // Y si la velocidad cae fuera de rango, el motor NO puede decir 'ok'.
          expect(t.estado).not.toBe("ok");
        }
      }
    },
  );

  // (3) Criticidad por DÉFICIT (OV-4): el punto crítico es el de MENOR MARGEN
  //     (presión residual − mínima exigida), NO el de menor presión absoluta. Y
  //     la presión crítica reportada ≤ acometida, y es la residual de ESE punto.
  test.prop([
    fc.array(arbAparato, { minLength: 1, maxLength: 8 }),
    arbMaterial,
    fc.integer({ min: 100, max: 500 }),
    fc.integer({ min: 0, max: 5 }),
    arbCriterioK,
  ])(
    "punto crítico = menor margen (déficit); presionCritica ≤ acometida y = residual de ese punto",
    (tipos, material, presion, altura, criterioK) => {
      const inp = {
        ...redLineal(mkAparatos(tipos), material, altura),
        presionAcometida_kPa: presion,
        criterioK,
      };
      const r = calcHS4(inp);
      expect(r.presionCritica_kPa).toBeLessThanOrEqual(r.presionAcometida_kPa + 1e-9);

      const resById = new Map(r.porTramo.map((t) => [t.id, t.presionResidual_kPa]));
      // Margen de cada punto de consumo (residual − mínima exigida).
      const margenes = r.porAparato
        .map((ap) => {
          const pr = resById.get(ap.tramoId);
          return pr == null ? null : { id: ap.id, residual: pr, margen: pr - ap.presionMinExigida_kPa };
        })
        .filter((x): x is { id: string; residual: number; margen: number } => x !== null);
      if (margenes.length === 0) return;

      const peorMargen = Math.min(...margenes.map((m) => m.margen));
      // El punto crítico reportado debe ser uno de los de peor margen.
      const apCrit = margenes.find((m) => m.id === r.puntoCriticoId)!;
      expect(apCrit.margen).toBeCloseTo(peorMargen, 9);
      // La presión crítica reportada = residual de ESE punto (no el mínimo abs).
      expect(r.presionCritica_kPa).toBeCloseTo(apCrit.residual, 9);
    },
  );

  // (4) Monotonía de Ø aguas abajo: el Ø de un tramo ≥ máx Ø de sus hijos.
  test.prop([
    fc.array(arbAparato, { minLength: 1, maxLength: 8 }),
    arbMaterial,
    arbCriterioK,
  ])("Ø no decreciente en el sentido del flujo (cada tramo ≥ sus hijos)", (tipos, material, criterioK) => {
    const inp = { ...redLineal(mkAparatos(tipos), material), criterioK };
    const r = calcHS4(inp);
    const byId = new Map(r.porTramo.map((t) => [t.id, t]));
    for (const tramo of r.porTramo) {
      if (tramo.diametro_mm == null) continue;
      for (const c of tramo.childrenIds) {
        const hijo = byId.get(c);
        if (hijo?.diametro_mm != null) {
          expect(tramo.diametro_mm).toBeGreaterThanOrEqual(hijo.diametro_mm);
        }
      }
    }
  });

  // (4b) Todo Ø dimensionado pertenece a la serie comercial.
  test.prop([fc.array(arbAparato, { minLength: 1, maxLength: 8 }), arbMaterial])(
    "todo Ø dimensionado pertenece a la serie comercial",
    (tipos, material) => {
      const r = calcHS4(redLineal(mkAparatos(tipos), material));
      for (const t of r.porTramo) {
        if (t.diametro_mm != null) {
          expect(SERIE_DIAMETROS_COMERCIALES_mm).toContain(t.diametro_mm);
        }
      }
    },
  );

  // (5) Grupo de presión coherente (OV-4): necesario ⟺ ALGÚN punto de consumo
  //     tiene déficit (residual < su mínima exigida), no solo el "crítico".
  test.prop([
    fc.array(arbAparato, { minLength: 1, maxLength: 8 }),
    arbMaterial,
    fc.integer({ min: 50, max: 500 }),
    fc.integer({ min: 0, max: 8 }),
    arbCriterioK,
  ])(
    "grupoPresionNecesario ⟺ algún punto de consumo con déficit (residual < mínima exigida)",
    (tipos, material, presion, altura, criterioK) => {
      const inp = {
        ...redLineal(mkAparatos(tipos), material, altura),
        presionAcometida_kPa: presion,
        criterioK,
      };
      const r = calcHS4(inp);
      const resById = new Map(r.porTramo.map((t) => [t.id, t.presionResidual_kPa]));
      const algunDeficit = r.porAparato.some((ap) => {
        const pr = resById.get(ap.tramoId);
        return pr != null && pr < ap.presionMinExigida_kPa;
      });
      expect(r.grupoPresionNecesario).toBe(algunDeficit);
    },
  );

  // (6) K acotado en (0,1] y monótono no creciente respecto a n: más aparatos
  //     (con criterio UNE 149201) ⇒ K no mayor.
  test.prop([fc.array(arbAparato, { minLength: 0, maxLength: 8 }), arbAparato])(
    "K ∈ (0,1] y no crece al añadir aparatos (UNE 149201)",
    (tipos, extra) => {
      const kDe = (lista: TipoAparatoHS4[]) => {
        const r = calcHS4({ ...redLineal(mkAparatos(lista)), criterioK: "une149201" });
        return r.porTramo.find((t) => t.id === "acometida")!.k;
      };
      const kSin = kDe(tipos);
      const kCon = kDe([...tipos, extra]);
      for (const k of [kSin, kCon]) {
        expect(k).toBeGreaterThan(0);
        expect(k).toBeLessThanOrEqual(1);
      }
      expect(kCon).toBeLessThanOrEqual(kSin + 1e-12);
    },
  );

  // (7) Determinismo general sobre redes arbitrarias.
  test.prop([
    fc.array(arbAparato, { minLength: 0, maxLength: 8 }),
    arbMaterial,
    arbCriterioK,
    fc.integer({ min: 50, max: 500 }),
  ])("determinista: mismo input → mismo output", (tipos, material, criterioK, presion) => {
    const inp = {
      ...redLineal(mkAparatos(tipos), material),
      criterioK,
      presionAcometida_kPa: presion,
    };
    expect(calcHS4(inp)).toEqual(calcHS4(inp));
  });
});
