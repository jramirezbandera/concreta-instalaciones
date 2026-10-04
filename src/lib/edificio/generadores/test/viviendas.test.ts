import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  generarHs3Reparto as generarHs3,
  generarHs4Reparto as generarHs4,
  generarHs5Reparto as generarHs5,
  type RepartoPlanta,
  type ViviendaTipo,
} from "../viviendas";
import type { Veredicto } from "../../../proyecto/tipos";
import { validarArbol, type NodoArbol } from "../../../cte/grafo";
import { calcHS5, hs5Defaults } from "../../../../modules/hs5/calc";
import { calcHS4, hs4Defaults } from "../../../../modules/hs4/calc";
import { calcHS3, esHumedo, hs3Defaults } from "../../../../modules/hs3/calc";
import { CAUDALES_LOCALES_HABITABLES, COCCION_MIN } from "../../../../modules/hs3/tablas";

// =============================================================================
// VIVIENDA TIPO — generadores de red por módulo (feature-8 §C). "La herramienta
// propone, el proyectista dispone": estos tests verifican que lo PROPUESTO es
// determinista, estructuralmente sano y —sobre todo— CALCULABLE por los motores
// reales. Tres capas (patrón de derivar.test.ts / hs5/test/calc.test.ts):
//
//   1) CASOS CONCRETOS: estructura, ids y nombres estables de cada generador.
//   2) INVARIANTES (property-based, @fast-check/vitest): determinismo, unicidad
//      de ids, integridad referencial (árbol válido vía `validarArbol`, sin
//      referencias colgantes) y proporcionalidad con el reparto.
//   3) INTEGRACIÓN con los MOTORES REALES (calcHS3/calcHS4/calcHS5): el motor no
//      lanza, el árbol es válido y el veredicto global es un `Veredicto`. Es lo
//      único que demuestra de verdad que el generador propone redes calculables.
//
// Aquí NO se verifica ninguna cifra normativa (eso es de los tests de motor y de
// tablas): se verifica la ESTRUCTURA de la propuesta y su compatibilidad con el
// contrato de entrada de cada motor.
// =============================================================================

// -----------------------------------------------------------------------------
// FIXTURES Y UTILIDADES
// -----------------------------------------------------------------------------

const T2: ViviendaTipo = { id: "t2", nombre: "T2", dormitorios: 2, banos: 1, aseos: 0 };
const T3: ViviendaTipo = { id: "t3", nombre: "T3", dormitorios: 3, banos: 2, aseos: 1 };

const VEREDICTOS: readonly Veredicto[] = ["ok", "warn", "fail", "neutral"];

/** Cuartos húmedos de una vivienda tipo: baños + aseos + LA cocina (siempre 1). */
const cuartosDe = (vt: ViviendaTipo): number => vt.banos + vt.aseos + 1;

/** Aparatos HS5 por vivienda: baño y aseo entran AGRUPADOS (1 c/u); cocina, 3. */
const aparatosHs5De = (vt: ViviendaTipo): number => vt.banos + vt.aseos + 3;

/** Aparatos HS4 por vivienda (Tabla 2.1, sin agrupados): baño 4, aseo 3, cocina 3. */
const aparatosHs4De = (vt: ViviendaTipo): number => 4 * vt.banos + 3 * vt.aseos + 3;

/** Estancias HS3 por vivienda: dormitorios + salón + cuartos húmedos. */
const estanciasDe = (vt: ViviendaTipo): number => vt.dormitorios + 1 + cuartosDe(vt);

const idsDe = (xs: readonly { id: string }[]): string[] => xs.map((x) => x.id);

/** Falla si hay ids repetidos en la colección (mensaje con los duplicados). */
function esperaIdsUnicos(xs: readonly { id: string }[], etiqueta: string): void {
  const vistos = new Set<string>();
  const repes: string[] = [];
  for (const id of idsDe(xs)) {
    if (vistos.has(id)) repes.push(id);
    vistos.add(id);
  }
  expect(repes, `ids duplicados en ${etiqueta}`).toEqual([]);
  expect(vistos.size, `nº de ids únicos en ${etiqueta}`).toBe(xs.length);
}

/**
 * Integridad referencial de una red de tramos + aparatos, compartida por HS4/HS5:
 * todo `parentId` no nulo apunta a un tramo existente, todo `aparato.tramoId`
 * apunta a un tramo existente y el grafo es un ÁRBOL VÁLIDO según el kernel
 * (`arbolValido === true`: sin duplicados, ciclos, huérfanos ni multi-raíz).
 */
function esperaRedIntegra(
  tramos: readonly (NodoArbol & { id: string })[],
  aparatos: readonly { id: string; tramoId: string }[],
  etiqueta: string,
): void {
  esperaIdsUnicos(tramos, `${etiqueta}.tramos`);
  esperaIdsUnicos(aparatos, `${etiqueta}.aparatos`);

  const idsTramos = new Set(idsDe(tramos));
  for (const t of tramos) {
    if (t.parentId !== null) {
      expect(idsTramos.has(t.parentId), `${etiqueta}: padre "${t.parentId}" de "${t.id}"`).toBe(
        true,
      );
    }
  }
  for (const a of aparatos) {
    expect(idsTramos.has(a.tramoId), `${etiqueta}: tramo "${a.tramoId}" del aparato "${a.id}"`).toBe(
      true,
    );
  }

  const arbol = validarArbol(tramos);
  expect(arbol.warnings, `${etiqueta}: avisos del kernel de grafo`).toEqual([]);
  expect(arbol.arbolValido, `${etiqueta}: el grafo de tramos es un árbol válido`).toBe(true);
  expect(arbol.raices.length, `${etiqueta}: raíz única`).toBe(1);
}

/**
 * Construye un reparto a partir de una matriz `[planta][tipo] = cantidad`, con
 * niveles 0..n−1 (plantas contiguas). Los tipos son T2 y T3, en ese orden.
 */
function repartoDe(matriz: readonly (readonly [number, number])[]): RepartoPlanta[] {
  return matriz.map((fila, nivel) => ({
    nivel,
    viviendas: [
      { tipoId: T2.id, cantidad: fila[0] },
      { tipoId: T3.id, cantidad: fila[1] },
    ],
  }));
}

/** Viviendas efectivas de una matriz de reparto, por tipo. */
const totalesDe = (matriz: readonly (readonly [number, number])[]) => ({
  t2: matriz.reduce((a, f) => a + f[0], 0),
  t3: matriz.reduce((a, f) => a + f[1], 0),
  /** Niveles que realmente alojan alguna vivienda (los vacíos no generan nada). */
  niveles: matriz.filter((f) => f[0] + f[1] > 0).length,
});

// Generador fast-check: 1..4 plantas × 0..3 viviendas de cada uno de los 2 tipos.
const arbMatriz = fc.array(
  fc.tuple(fc.integer({ min: 0, max: 3 }), fc.integer({ min: 0, max: 3 })),
  { minLength: 1, maxLength: 4 },
);
// Variante pequeña para los tests que ejecutan los tres motores (más costosos).
const arbMatrizPequena = fc.array(
  fc.tuple(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 2 })),
  { minLength: 1, maxLength: 3 },
);

const VTS = [T2, T3];

// =============================================================================
// 1. DETERMINISMO (SPEC §4: mismo input → mismo output, sin Date.now/Math.random)
// =============================================================================

describe("generadores — determinismo", () => {
  const reparto = repartoDe([
    [1, 1],
    [2, 0],
  ]);

  it("generarHs5 es determinista (igualdad profunda entre dos llamadas)", () => {
    expect(generarHs5(VTS, reparto)).toEqual(generarHs5(VTS, reparto));
  });

  it("generarHs4 es determinista (igualdad profunda entre dos llamadas)", () => {
    expect(generarHs4(VTS, reparto)).toEqual(generarHs4(VTS, reparto));
  });

  it("generarHs3 es determinista (igualdad profunda entre dos llamadas)", () => {
    expect(generarHs3(VTS, reparto)).toEqual(generarHs3(VTS, reparto));
  });

  it("el resultado depende del VALOR de la entrada, no de su identidad", () => {
    // Copias estructurales independientes (mismo valor, otros objetos): los ids
    // y nombres se derivan de la posición, jamás de referencias ni contadores.
    const copiaVts = VTS.map((v) => ({ ...v }));
    const copiaReparto = reparto.map((p) => ({
      nivel: p.nivel,
      viviendas: p.viviendas.map((v) => ({ ...v })),
    }));
    expect(generarHs5(copiaVts, copiaReparto)).toEqual(generarHs5(VTS, reparto));
    expect(generarHs4(copiaVts, copiaReparto)).toEqual(generarHs4(VTS, reparto));
    expect(generarHs3(copiaVts, copiaReparto)).toEqual(generarHs3(VTS, reparto));
  });

  test.prop([arbMatriz])(
    "determinista para cualquier reparto de 1..4 plantas × 0..3 viviendas por tipo",
    (matriz) => {
      const rep = repartoDe(matriz);
      expect(generarHs5(VTS, rep)).toEqual(generarHs5(VTS, rep));
      expect(generarHs4(VTS, rep)).toEqual(generarHs4(VTS, rep));
      expect(generarHs3(VTS, rep)).toEqual(generarHs3(VTS, rep));
    },
  );
});

// =============================================================================
// 2. HS5 — estructura de la red de saneamiento propuesta
// =============================================================================

describe("generarHs5 — estructura de la propuesta", () => {
  it("colector raíz → bajante → un ramal por cuarto húmedo, con ids/nombres estables", () => {
    const { tramos, aparatos } = generarHs5([T2], repartoDe([[1, 0], [1, 0]]));

    expect(idsDe(tramos)).toEqual([
      "colector",
      "bajante",
      "p0-t2-bano",
      "p0-t2-cocina",
      "p1-t2-bano",
      "p1-t2-cocina",
    ]);
    expect(tramos[0]).toMatchObject({ tipo: "colector", parentId: null });
    expect(tramos[1]).toMatchObject({ tipo: "bajante", parentId: "colector" });
    // Los ramales cuelgan TODOS de la bajante única.
    for (const ramal of tramos.slice(2)) {
      expect(ramal).toMatchObject({ tipo: "ramal", parentId: "bajante" });
    }
    // Nombre legible con la posición delante (planta · tipo · elemento).
    expect(tramos[2].nombre).toBe("P0 · T2 · Ramal baño");
    expect(tramos[3].nombre).toBe("P0 · T2 · Ramal cocina");

    // Baño AGRUPADO (Tabla 4.1) + cocina desglosada en 3 aparatos.
    expect(aparatos.filter((a) => a.tramoId === "p0-t2-bano").map((a) => a.tipo)).toEqual([
      "cuarto_bano_cisterna",
    ]);
    expect(aparatos.filter((a) => a.tramoId === "p0-t2-cocina").map((a) => a.tipo)).toEqual([
      "fregadero_cocina",
      "lavavajillas",
      "lavadora",
    ]);
  });

  it("varias viviendas del mismo tipo en una planta ⇒ letra de instancia (a, b, …)", () => {
    const { tramos } = generarHs5([T2], repartoDe([[2, 0]]));
    expect(idsDe(tramos)).toEqual([
      "colector",
      "bajante",
      "p0-t2a-bano",
      "p0-t2a-cocina",
      "p0-t2b-bano",
      "p0-t2b-cocina",
    ]);
    expect(tramos[4].nombre).toBe("P0 · T2b · Ramal baño");
  });

  it("varios baños en la vivienda ⇒ ramales indexados (bano-1 / bano-2) y aseo", () => {
    const { tramos } = generarHs5([T3], repartoDe([[0, 1]]));
    expect(idsDe(tramos).slice(2)).toEqual([
      "p0-t3-bano-1",
      "p0-t3-bano-2",
      "p0-t3-aseo",
      "p0-t3-cocina",
    ]);
  });

  it("ids únicos e integridad referencial (árbol válido de raíz única)", () => {
    const { tramos, aparatos } = generarHs5(
      VTS,
      repartoDe([
        [2, 1],
        [1, 2],
        [0, 0],
        [1, 1],
      ]),
    );
    esperaRedIntegra(tramos, aparatos, "hs5");
  });

  test.prop([arbMatriz])("ids únicos y árbol válido para cualquier reparto", (matriz) => {
    const { tramos, aparatos } = generarHs5(VTS, repartoDe(matriz));
    fc.pre(tramos.length > 0);
    esperaRedIntegra(tramos, aparatos, "hs5");
  });
});

// =============================================================================
// 3. HS4 — estructura de la red de suministro propuesta
// =============================================================================

describe("generarHs4 — estructura de la propuesta", () => {
  it("acometida → alimentación → montante por niveles → derivaciones de vivienda", () => {
    const { tramos, aparatos } = generarHs4([T2], repartoDe([[1, 0], [1, 0]]));

    expect(idsDe(tramos).slice(0, 4)).toEqual([
      "acometida",
      "alimentacion",
      "montante-p0",
      "montante-p1",
    ]);
    expect(tramos[0]).toMatchObject({ tipo: "acometida", parentId: null });
    expect(tramos[1]).toMatchObject({ tipo: "tubo_alimentacion", parentId: "acometida" });
    // El montante se encadena nivel a nivel; cada segmento sube su diferencia
    // de plantas (criterio geométrico de proyecto, 3 m/planta).
    expect(tramos[2]).toMatchObject({ parentId: "alimentacion", tipo: "columna_montante" });
    expect(tramos[2].altura_m).toBeUndefined(); // el primer segmento no sube
    expect(tramos[3]).toMatchObject({ parentId: "montante-p0", altura_m: 3, longitud_m: 3 });

    // Cada vivienda: derivación particular colgada de SU nivel del montante.
    const deriv = tramos.filter((t) => t.id.endsWith("deriv-particular"));
    expect(idsDe(deriv)).toEqual(["p0-t2-deriv-particular", "p1-t2-deriv-particular"]);
    expect(deriv[1]).toMatchObject({ parentId: "montante-p1", tipo: "derivacion_particular" });
    expect(deriv[0].nombre).toBe("P0 · T2 · Derivación particular");

    // Tabla 2.1 de HS4: sin agrupados, un aparato (y su derivación) por elemento.
    expect(aparatos.filter((a) => a.id.startsWith("p0-t2-bano")).map((a) => a.tipo)).toEqual([
      "lavabo",
      "inodoro_cisterna",
      "banera_ge_140",
      "bide",
    ]);
    for (const a of aparatos) expect(a.tramoId).toBe(`d-${a.id}`);
  });

  it("ids únicos e integridad referencial (árbol válido de raíz única)", () => {
    const { tramos, aparatos } = generarHs4(
      VTS,
      repartoDe([
        [2, 1],
        [1, 2],
        [0, 0],
        [1, 1],
      ]),
    );
    esperaRedIntegra(tramos, aparatos, "hs4");
  });

  test.prop([arbMatriz])("ids únicos y árbol válido para cualquier reparto", (matriz) => {
    const { tramos, aparatos } = generarHs4(VTS, repartoDe(matriz));
    fc.pre(tramos.length > 0);
    esperaRedIntegra(tramos, aparatos, "hs4");
  });
});

// =============================================================================
// 4. HS3 — vertical tipo (semántica multiplanta del kernel, sin doble conteo)
// =============================================================================

describe("generarHs3 — vertical tipo en colectiva", () => {
  const gen = generarHs3(VTS, repartoDe([[1, 1], [2, 0]]));

  it("usa la vivienda MÁS desfavorable (más dormitorios) para toda la vertical", () => {
    // T3 (3 dormitorios) manda sobre T2 aunque el reparto mezcle ambas.
    expect(gen.numDormitorios).toBe(T3.dormitorios);
    expect(gen.estancias.length).toBe(2 * estanciasDe(T3)); // una instancia por nivel
  });

  it("modo avanzado con un colectivo por cuarto húmedo y una planta por nivel", () => {
    expect(gen.modoConducto).toBe("avanzado");
    expect(idsDe(gen.redColectivos ?? [])).toEqual([
      "col-bano-1",
      "col-bano-2",
      "col-aseo",
      "col-cocina",
    ]);
    for (const col of gen.redColectivos ?? []) {
      expect(col.plantas.map((p) => p.nivel)).toEqual([0, 1]);
      for (const p of col.plantas) expect(p.estanciasIds.length).toBe(1);
    }
    // Nº de plantas del conducto = span de niveles (Tabla 4.3: ambas incluidas).
    expect(gen.numPlantasConducto).toBe(2);
  });

  it("ids únicos de estancias y de colectivos", () => {
    esperaIdsUnicos(gen.estancias, "hs3.estancias");
    esperaIdsUnicos(gen.redColectivos ?? [], "hs3.redColectivos");
  });

  it("cada estancia referenciada por la red existe, es HÚMEDA y se referencia UNA sola vez", () => {
    const porId = new Map(gen.estancias.map((e) => [e.id, e]));
    const veces = new Map<string, number>();
    for (const col of gen.redColectivos ?? []) {
      for (const planta of col.plantas) {
        for (const eid of planta.estanciasIds) {
          const e = porId.get(eid);
          expect(e, `la red referencia la estancia "${eid}"`).toBeDefined();
          expect(esHumedo(e!.tipo), `"${eid}" (${e!.tipo}) es un local húmedo`).toBe(true);
          veces.set(eid, (veces.get(eid) ?? 0) + 1);
        }
      }
    }
    // Doble conteo = bloqueo duro del motor: ninguna estancia puede aparecer 2 veces.
    expect([...veces.values()].filter((n) => n > 1)).toEqual([]);
    // Y TODAS las húmedas están asignadas (reconciliación exacta del qvt).
    const humedas = gen.estancias.filter((e) => esHumedo(e.tipo));
    expect(veces.size).toBe(humedas.length);
  });

  test.prop([arbMatriz])(
    "invariantes de la vertical tipo para cualquier reparto (existencia + húmedas + sin doble conteo)",
    (matriz) => {
      const g = generarHs3(VTS, repartoDe(matriz));
      fc.pre(g.estancias.length > 0);
      esperaIdsUnicos(g.estancias, "hs3.estancias");
      esperaIdsUnicos(g.redColectivos ?? [], "hs3.redColectivos");

      const porId = new Map(g.estancias.map((e) => [e.id, e]));
      const veces = new Map<string, number>();
      for (const col of g.redColectivos ?? []) {
        expect(col.plantas.length).toBeGreaterThan(0);
        for (const planta of col.plantas) {
          expect(Number.isInteger(planta.nivel)).toBe(true);
          for (const eid of planta.estanciasIds) {
            const e = porId.get(eid);
            expect(e).toBeDefined();
            expect(esHumedo(e!.tipo)).toBe(true);
            veces.set(eid, (veces.get(eid) ?? 0) + 1);
          }
        }
      }
      expect([...veces.values()].filter((n) => n > 1)).toEqual([]);
      expect(veces.size).toBe(g.estancias.filter((e) => esHumedo(e.tipo)).length);
    },
  );
});

// =============================================================================
// 5. CASO UNIFAMILIAR (reparto `undefined`) y casos degenerados
// =============================================================================

describe("caso unifamiliar (sin reparto) y casos degenerados", () => {
  it("HS5: una sola vivienda —la primera de la lista— con ids sin prefijo de posición", () => {
    const { tramos, aparatos } = generarHs5(VTS, undefined);
    expect(idsDe(tramos)).toEqual(["colector", "bajante", "bano", "cocina"]); // T2, no T3
    expect(tramos[2].nombre).toBe("Ramal baño"); // sin "P0 · T2 · "
    expect(aparatos.length).toBe(aparatosHs5De(T2));
    esperaRedIntegra(tramos, aparatos, "hs5 unifamiliar");
  });

  it("HS4: montante único sin sufijo de planta y una sola derivación particular", () => {
    const { tramos, aparatos } = generarHs4(VTS, undefined);
    expect(idsDe(tramos).slice(0, 4)).toEqual([
      "acometida",
      "alimentacion",
      "montante",
      "deriv-particular",
    ]);
    expect(tramos[2].nombre).toBe("Montante");
    expect(aparatos.length).toBe(aparatosHs4De(T2));
    esperaRedIntegra(tramos, aparatos, "hs4 unifamiliar");
  });

  it("HS3: modo RÁPIDO, sin redColectivos, 1 planta y sin notas", () => {
    const gen = generarHs3(VTS, undefined);
    expect(gen.modoConducto).toBe("rapido");
    expect(gen.redColectivos).toBeUndefined();
    expect(gen.numPlantasConducto).toBe(1);
    expect(gen.notas).toEqual([]);
    expect(gen.numDormitorios).toBe(T2.dormitorios); // la PRIMERA, no la peor
    expect(idsDe(gen.estancias)).toEqual(["dorm-principal", "dorm-2", "salon", "bano", "cocina"]);
  });

  it("un reparto vacío equivale a unifamiliar (misma propuesta que sin reparto)", () => {
    expect(generarHs5(VTS, [])).toEqual(generarHs5(VTS, undefined));
    expect(generarHs4(VTS, [])).toEqual(generarHs4(VTS, undefined));
    expect(generarHs3(VTS, [])).toEqual(generarHs3(VTS, undefined));
  });

  it("sin viviendas tipo: propuesta vacía y nota explicativa en HS3", () => {
    expect(generarHs5([], undefined)).toEqual({ tramos: [], aparatos: [] });
    expect(generarHs4([], undefined)).toEqual({ tramos: [], aparatos: [] });
    const gen = generarHs3([], undefined);
    expect(gen.estancias).toEqual([]);
    expect(gen.modoConducto).toBe("rapido");
    expect(gen.redColectivos).toBeUndefined();
    expect(gen.notas.join(" ")).toContain("Define al menos una vivienda tipo");
  });

  it("un reparto que solo referencia tipos inexistentes se trata como reparto vacío", () => {
    const fantasma: RepartoPlanta[] = [{ nivel: 0, viviendas: [{ tipoId: "no-existe", cantidad: 2 }] }];
    expect(generarHs5(VTS, fantasma)).toEqual({ tramos: [], aparatos: [] });
    expect(generarHs3(VTS, fantasma).notas.join(" ")).toContain("Define al menos una vivienda tipo");
  });
});

// =============================================================================
// 6. PROPORCIONALIDAD: la propuesta crece con Σ(cantidad) del reparto
// =============================================================================

describe("proporcionalidad con el reparto (property-based)", () => {
  // (a) IGUALDAD EXACTA: el generador replica la vivienda tipo una vez por
  //     instancia del reparto, así que los recuentos son función lineal exacta
  //     de Σ(cantidad) por tipo.
  test.prop([arbMatriz])("HS5: nº de ramales y de aparatos = Σ(cantidad) × composición", (matriz) => {
    const { tramos, aparatos } = generarHs5(VTS, repartoDe(matriz));
    const { t2, t3 } = totalesDe(matriz);
    if (t2 + t3 === 0) {
      expect(tramos).toEqual([]);
      expect(aparatos).toEqual([]);
      return;
    }
    // 2 troncales (colector + bajante) + un ramal por cuarto húmedo.
    expect(tramos.length).toBe(2 + t2 * cuartosDe(T2) + t3 * cuartosDe(T3));
    expect(tramos.filter((t) => t.tipo === "ramal").length).toBe(
      t2 * cuartosDe(T2) + t3 * cuartosDe(T3),
    );
    expect(aparatos.length).toBe(t2 * aparatosHs5De(T2) + t3 * aparatosHs5De(T3));
  });

  test.prop([arbMatriz])(
    "HS4: nº de derivaciones y de aparatos = Σ(cantidad) × composición (+ montante por nivel)",
    (matriz) => {
      const { tramos, aparatos } = generarHs4(VTS, repartoDe(matriz));
      const { t2, t3, niveles } = totalesDe(matriz);
      if (t2 + t3 === 0) {
        expect(tramos).toEqual([]);
        expect(aparatos).toEqual([]);
        return;
      }
      const nAparatos = t2 * aparatosHs4De(T2) + t3 * aparatosHs4De(T3);
      expect(aparatos.length).toBe(nAparatos);
      // Un tramo por aparato (derivación individual) + una particular por vivienda.
      expect(tramos.filter((t) => t.tipo === "derivacion_aparato").length).toBe(nAparatos);
      expect(tramos.filter((t) => t.tipo === "derivacion_particular").length).toBe(t2 + t3);
      // Montante segmentado: exactamente un segmento por nivel con viviendas.
      expect(tramos.filter((t) => t.tipo === "columna_montante").length).toBe(niveles);
      expect(tramos.length).toBe(2 + niveles + (t2 + t3) + nAparatos);
    },
  );

  test.prop([arbMatriz])(
    "HS3: nº de estancias = niveles × vivienda tipo; colectivos = cuartos húmedos",
    (matriz) => {
      const g = generarHs3(VTS, repartoDe(matriz));
      const { t2, t3, niveles } = totalesDe(matriz);
      if (t2 + t3 === 0) {
        expect(g.estancias).toEqual([]);
        return;
      }
      // La vertical tipo replica la vivienda MÁS desfavorable por nivel (no por
      // vivienda): es la única representación sin doble conteo.
      const vt = t3 > 0 ? T3 : T2;
      expect(g.estancias.length).toBe(niveles * estanciasDe(vt));
      expect((g.redColectivos ?? []).length).toBe(cuartosDe(vt));
      for (const col of g.redColectivos ?? []) expect(col.plantas.length).toBe(niveles);
    },
  );

  // (b) MONOTONÍA: si un reparto domina a otro celda a celda, la propuesta nunca
  //     encoge; y si además crece en alguna celda, crece estrictamente.
  test.prop([arbMatriz, arbMatriz])(
    "añadir viviendas al reparto nunca reduce ramales/derivaciones/aparatos",
    (matriz, incrementos) => {
      const base = matriz.map((f) => [f[0], f[1]] as [number, number]);
      const mayor = base.map(
        (f, i) =>
          [
            f[0] + (incrementos[i]?.[0] ?? 0),
            f[1] + (incrementos[i]?.[1] ?? 0),
          ] as [number, number],
      );
      const crece =
        totalesDe(mayor).t2 + totalesDe(mayor).t3 > totalesDe(base).t2 + totalesDe(base).t3;

      const hs5Base = generarHs5(VTS, repartoDe(base));
      const hs5Mayor = generarHs5(VTS, repartoDe(mayor));
      const hs4Base = generarHs4(VTS, repartoDe(base));
      const hs4Mayor = generarHs4(VTS, repartoDe(mayor));

      expect(hs5Mayor.aparatos.length).toBeGreaterThanOrEqual(hs5Base.aparatos.length);
      expect(hs5Mayor.tramos.length).toBeGreaterThanOrEqual(hs5Base.tramos.length);
      expect(hs4Mayor.aparatos.length).toBeGreaterThanOrEqual(hs4Base.aparatos.length);
      expect(hs4Mayor.tramos.length).toBeGreaterThanOrEqual(hs4Base.tramos.length);
      if (crece) {
        expect(hs5Mayor.aparatos.length).toBeGreaterThan(hs5Base.aparatos.length);
        expect(hs4Mayor.aparatos.length).toBeGreaterThan(hs4Base.aparatos.length);
      }
    },
  );
});

// =============================================================================
// 7. INTEGRACIÓN CON LOS MOTORES REALES
//    Lo generado se mezcla con los `*Defaults` (lo que el generador no propone)
//    y se pasa al motor: no lanza, el árbol es válido y el veredicto es un
//    `Veredicto` legítimo. Esto es lo que demuestra que la propuesta es
//    CALCULABLE (y no solo bien formada).
// =============================================================================

/** Ejecuta los tres motores sobre la propuesta de un reparto dado. */
function calcularTodo(vts: ViviendaTipo[], reparto: RepartoPlanta[] | undefined, numPlantas: number) {
  const hs5 = calcHS5({ ...hs5Defaults, numPlantas, ...generarHs5(vts, reparto) });
  const hs4 = calcHS4({ ...hs4Defaults, ...generarHs4(vts, reparto) });
  const { notas: _notas, numPlantasConducto, ...restoHs3 } = generarHs3(vts, reparto);
  const hs3 = calcHS3({ ...hs3Defaults, ...restoHs3, numPlantasConducto });
  return { hs3, hs4, hs5 };
}

describe("integración con los motores reales", () => {
  it("unifamiliar: los tres motores calculan la propuesta sin lanzar y CUMPLEN", () => {
    const { hs3, hs4, hs5 } = calcularTodo([T2], undefined, 1);

    expect(hs5.arbolValido).toBe(true);
    expect(hs5.porAparato.length).toBe(aparatosHs5De(T2));
    expect(hs5.veredictoGlobal).toBe("ok");

    expect(hs4.arbolValido).toBe(true);
    expect(hs4.porAparato.length).toBe(aparatosHs4De(T2));
    expect(VEREDICTOS).toContain(hs4.veredictoGlobal);

    // HS3 nace CUMPLIENDO: los caudales propuestos salen de la Tabla 2.1 y el
    // balance admisión/extracción se iguala al mayor por construcción.
    expect(hs3.veredictoGlobal).toBe("ok");
    expect(hs3.balanceOk).toBe(true);
    expect(hs3.humedosTotalOk).toBe(true);
    expect(hs3.red).toBeUndefined(); // modo rápido
  });

  it("colectiva 3 plantas × 2 viviendas: redes calculables y red HS3 válida", () => {
    const reparto = repartoDe([
      [1, 1],
      [1, 1],
      [1, 1],
    ]);
    const { hs3, hs4, hs5 } = calcularTodo(VTS, reparto, 3);

    expect(hs5.arbolValido).toBe(true);
    // 2 troncales + 3 plantas × (cuartos de T2 + cuartos de T3).
    expect(hs5.porTramo.length).toBe(2 + 3 * (cuartosDe(T2) + cuartosDe(T3)));
    expect(VEREDICTOS).toContain(hs5.veredictoGlobal);

    expect(hs4.arbolValido).toBe(true);
    expect(VEREDICTOS).toContain(hs4.veredictoGlobal);

    // Modo red: sin bloqueos (ni doble conteo, ni estancias inexistentes) y con
    // reconciliación exacta del qvt (la red evacúa TODA la extracción húmeda).
    expect(hs3.red).toBeDefined();
    expect(hs3.red!.estadoRed.bloqueos).toEqual([]);
    expect(hs3.red!.estadoRed.valida).toBe(true);
    expect(hs3.red!.qvtRedTotal_l_s).toBeCloseTo(hs3.totalExtraccion_l_s, 9);
    expect(hs3.veredictoGlobal).toBe("ok");
    for (const col of hs3.red!.colectivos) expect(col.plantasServidas).toBe(3);
  });

  test.prop([arbMatrizPequena], { numRuns: 30 })(
    "cualquier reparto ⇒ los motores no lanzan, el árbol es válido y el veredicto es legítimo",
    (matriz) => {
      const reparto = repartoDe(matriz);
      const { niveles, t2, t3 } = totalesDe(matriz);
      fc.pre(t2 + t3 > 0);
      const { hs3, hs4, hs5 } = calcularTodo(VTS, reparto, Math.max(1, niveles));

      // HS5 / HS4: la red propuesta es un árbol válido para el kernel del motor.
      expect(hs5.arbolValido).toBe(true);
      expect(hs5.warnings.filter((w) => w.includes("árbol"))).toEqual([]);
      expect(VEREDICTOS).toContain(hs5.veredictoGlobal);
      expect(hs4.arbolValido).toBe(true);
      expect(VEREDICTOS).toContain(hs4.veredictoGlobal);

      // HS3: red sin bloqueos y qvt reconciliado con el total de húmedos.
      expect(hs3.red).toBeDefined();
      expect(hs3.red!.estadoRed.bloqueos).toEqual([]);
      expect(hs3.red!.qvtRedTotal_l_s).toBeCloseTo(hs3.totalExtraccion_l_s, 9);
      // Y la propuesta de HS3 nace cumpliendo (mínimos de la Tabla 2.1 + balance).
      expect(hs3.veredictoGlobal).toBe("ok");
    },
  );

  test.prop([arbMatrizPequena], { numRuns: 30 })(
    "HS5: cada aparato generado se dimensiona (UD conocidas) y ningún tramo queda huérfano",
    (matriz) => {
      const { t2, t3 } = totalesDe(matriz);
      fc.pre(t2 + t3 > 0);
      const r = calcHS5({ ...hs5Defaults, ...generarHs5(VTS, repartoDe(matriz)) });
      // Ningún aparato "no contemplado" (fail por tipo desconocido en el uso).
      expect(r.porAparato.filter((a) => !a.cumple)).toEqual([]);
      expect(r.udTotales).toBeGreaterThan(0);
      const idsTramo = new Set(r.porTramo.map((t) => t.id));
      for (const a of r.porAparato) expect(idsTramo.has(a.tramoId)).toBe(true);
    },
  );
});

// =============================================================================
// 8. NOTAS DE HONESTIDAD DE HS3 (la limitación se documenta, no se esconde)
// =============================================================================

describe("generarHs3 — notas", () => {
  it("colectiva simple: declara la vivienda usada y el alcance de las verificaciones agregadas", () => {
    const notas = generarHs3([T2], repartoDe([[1, 0], [1, 0]])).notas;
    expect(notas.length).toBe(2);
    expect(notas[0]).toContain("Vertical tipo generada con la vivienda más desfavorable");
    expect(notas[0]).toContain('"T2"');
    expect(notas[1]).toContain("suman toda la vertical");
  });

  it("varias viviendas en una misma planta ⇒ nota de vertical única ('duplica colectivos')", () => {
    const notas = generarHs3([T2], repartoDe([[2, 0]])).notas;
    expect(notas.some((n) => n.includes("Duplica los colectivos"))).toBe(true);
    expect(notas.some((n) => n.includes("doble conteo"))).toBe(true);
  });

  it("una vivienda por planta ⇒ NO se emite la nota de vertical única", () => {
    const notas = generarHs3(VTS, repartoDe([[1, 0], [0, 1]])).notas;
    expect(notas.some((n) => n.includes("Duplica los colectivos"))).toBe(false);
  });

  it("reparto con varios tipos ⇒ nota de que manda el más desfavorable", () => {
    const notas = generarHs3(VTS, repartoDe([[1, 1]])).notas;
    expect(notas.some((n) => n.includes("mezcla varios tipos de vivienda"))).toBe(true);
    expect(notas.some((n) => n.includes('"T3"'))).toBe(true);
  });

  test.prop([arbMatriz])("toda nota es texto no vacío en español (apta para la UI)", (matriz) => {
    for (const n of generarHs3(VTS, repartoDe(matriz)).notas) {
      expect(typeof n).toBe("string");
      expect(n.trim().length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// 9. CAUDALES DE HS3: la propuesta nace de la Tabla 2.1 / COCCION_MIN
//    (no se comprueban cifras "a mano": se contrastan contra las TABLAS).
// =============================================================================

describe("generarHs3 — caudales propuestos con procedencia de tabla", () => {
  const t21 = CAUDALES_LOCALES_HABITABLES.datos;

  it("cada estancia arranca en su mínimo de la Tabla 2.1 y la cocina lleva cocción independiente", () => {
    const gen = generarHs3([T3], undefined); // T3: 3 dormitorios → categoría "3+"
    const porId = new Map(gen.estancias.map((e) => [e.id, e]));

    expect(porId.get("dorm-principal")!.caudalPropuesto_l_s).toBe(t21.dormitorioPrincipal["3+"]);
    expect(porId.get("dorm-2")!.caudalPropuesto_l_s).toBe(t21.restoDormitorios["3+"]);
    // El salón absorbe el déficit de admisión del equilibrado ⇒ ≥ su mínimo.
    expect(porId.get("salon")!.caudalPropuesto_l_s).toBeGreaterThanOrEqual(
      t21.salasEstarComedores["3+"]!,
    );

    // Húmedos: ≥ mínimo POR LOCAL y, en conjunto, ≥ mínimo TOTAL de vivienda.
    const humedas = gen.estancias.filter((e) => esHumedo(e.tipo));
    expect(humedas.length).toBe(cuartosDe(T3));
    for (const h of humedas) {
      expect(h.caudalPropuesto_l_s).toBeGreaterThanOrEqual(t21.humedosPorLocal["3+"]!);
    }
    expect(humedas.reduce((a, h) => a + h.caudalPropuesto_l_s, 0)).toBeGreaterThanOrEqual(
      t21.humedosTotalVivienda["3+"]!,
    );

    // Cocción: extracción INDEPENDIENTE, solo en la cocina y al mínimo del DB.
    const cocina = porId.get("cocina")!;
    expect(cocina.esCoccion).toBe(true);
    expect(cocina.caudalCoccion_l_s).toBe(COCCION_MIN.datos.caudalMin_l_s);
    expect(gen.estancias.filter((e) => e.esCoccion).length).toBe(1);
  });

  test.prop([arbMatriz])("admisión y extracción nacen equilibradas en cada nivel", (matriz) => {
    const g = generarHs3(VTS, repartoDe(matriz));
    fc.pre(g.estancias.length > 0);
    const adm = g.estancias
      .filter((e) => !esHumedo(e.tipo))
      .reduce((a, e) => a + e.caudalPropuesto_l_s, 0);
    const ext = g.estancias
      .filter((e) => esHumedo(e.tipo))
      .reduce((a, e) => a + e.caudalPropuesto_l_s, 0);
    expect(adm).toBeCloseTo(ext, 9);
  });
});

// =============================================================================
// 10. SANEAMIENTO DE ENTRADAS HOSTILES (estado persistido corrupto / editado a
//     mano): el generador nunca produce una red rota ni ids inventados.
// =============================================================================

describe("generadores — saneamiento determinista de entradas hostiles", () => {
  it("niveles no finitos se ignoran y los fraccionarios se truncan", () => {
    const reparto: RepartoPlanta[] = [
      { nivel: Number.NaN, viviendas: [{ tipoId: T2.id, cantidad: 5 }] },
      { nivel: 2.7, viviendas: [{ tipoId: T2.id, cantidad: 1 }] },
    ];
    const { tramos } = generarHs5(VTS, reparto);
    expect(idsDe(tramos)).toEqual(["colector", "bajante", "p2-t2-bano", "p2-t2-cocina"]);
  });

  it("cantidades ≤ 0 o no finitas se descartan; las fraccionarias se truncan", () => {
    const reparto: RepartoPlanta[] = [
      {
        nivel: 0,
        viviendas: [
          { tipoId: T2.id, cantidad: 0 },
          { tipoId: T3.id, cantidad: -3 },
        ],
      },
      { nivel: 1, viviendas: [{ tipoId: T2.id, cantidad: 1.9 }] },
    ];
    const { tramos } = generarHs5(VTS, reparto);
    expect(idsDe(tramos)).toEqual(["colector", "bajante", "p1-t2-bano", "p1-t2-cocina"]);
  });

  it("dos entradas del mismo nivel se FUSIONAN sumando cantidades (letras a/b)", () => {
    const reparto: RepartoPlanta[] = [
      { nivel: 0, viviendas: [{ tipoId: T2.id, cantidad: 1 }] },
      { nivel: 0, viviendas: [{ tipoId: T2.id, cantidad: 1 }] },
    ];
    const { tramos } = generarHs5(VTS, reparto);
    expect(idsDe(tramos).slice(2)).toEqual([
      "p0-t2a-bano",
      "p0-t2a-cocina",
      "p0-t2b-bano",
      "p0-t2b-cocina",
    ]);
  });

  it("recuentos negativos/fraccionarios de la vivienda tipo se sanean (y la cocina no falta)", () => {
    const rara: ViviendaTipo = {
      id: "raro",
      nombre: "Raro",
      dormitorios: -2,
      banos: Number.NaN,
      aseos: 1.7,
    };
    const { tramos, aparatos } = generarHs5([rara], undefined);
    expect(idsDe(tramos)).toEqual(["colector", "bajante", "aseo", "cocina"]);
    esperaRedIntegra(tramos, aparatos, "hs5 saneado");

    const { notas: _notas, numPlantasConducto, ...gen } = generarHs3([rara], undefined);
    expect(gen.numDormitorios).toBe(0);
    expect(idsDe(gen.estancias)).toEqual(["salon", "aseo", "cocina"]);
    for (const e of gen.estancias) expect(Number.isFinite(e.caudalPropuesto_l_s)).toBe(true);
    // Y el motor sigue calculando (y cumpliendo) sobre la propuesta saneada.
    const r = calcHS3({ ...hs3Defaults, ...gen, numPlantasConducto });
    expect(r.veredictoGlobal).toBe("ok");
  });

  it("ids de vivienda tipo duplicados: gana la PRIMERA aparición en LOS TRES generadores", () => {
    // Un id repetido (solo alcanzable con un `.json` importado/editado a mano)
    // ensombrece a la segunda: el reparto coloca la primera, así que HS3 debe
    // dimensionar esa misma vertical y no la homónima (coherencia HS3↔HS4/HS5).
    const bis: ViviendaTipo = { ...T3, id: T2.id, nombre: "T2 bis" };
    const vts = [T2, bis];
    const reparto = repartoDe([[1, 0]]);

    const gen = generarHs3(vts, reparto);
    expect(gen.numDormitorios).toBe(T2.dormitorios);
    expect(gen.estancias.filter((e) => esHumedo(e.tipo)).length).toBe(cuartosDe(T2));
    expect((gen.redColectivos ?? []).length).toBe(cuartosDe(T2));
    expect(gen.notas.some((n) => n.includes("mezcla varios tipos"))).toBe(false);
    // HS5/HS4 colocan la misma vivienda (mismos cuartos húmedos).
    expect(generarHs5(vts, reparto).aparatos.length).toBe(aparatosHs5De(T2));
    expect(generarHs4(vts, reparto).aparatos.length).toBe(aparatosHs4De(T2));
  });

  it("ids distintos que colisionan al slugificar no producen tramos duplicados", () => {
    const a: ViviendaTipo = { id: "T 2", nombre: "T2", dormitorios: 2, banos: 1, aseos: 0 };
    const b: ViviendaTipo = { id: "T-2", nombre: "T2", dormitorios: 2, banos: 1, aseos: 0 };
    const reparto: RepartoPlanta[] = [
      {
        nivel: 0,
        viviendas: [
          { tipoId: a.id, cantidad: 1 },
          { tipoId: b.id, cantidad: 1 },
        ],
      },
    ];
    const { tramos, aparatos } = generarHs5([a, b], reparto);
    esperaRedIntegra(tramos, aparatos, "hs5 slugs colisionados");
    expect(tramos.length).toBe(2 + 2 * cuartosDe(a));
  });
});
