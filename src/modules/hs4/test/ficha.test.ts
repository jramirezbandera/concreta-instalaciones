import { describe, it, expect } from "vitest";
import { calcHS4, hs4Defaults, type HS4Inputs } from "../calc";
import { toFichaData } from "../ficha";
import { fmt } from "../../../lib/units/format";
import {
  CAUDAL_INSTANTANEO_TABLA_2_1,
  DERIVACIONES_TABLA_4_2,
  ALIMENTACION_TABLA_4_3,
  PRESIONES,
} from "../tablas";
import { HS4_PDF_SVG_ID } from "../svg-meta";

// =============================================================================
// HS4 — ficha justificativa (transformación PURA inputs+result → FichaData).
// Cierra la cobertura del eng review (TEST-1, T5a): snapshot commiteado de un
// escenario que CUMPLE y de uno de grupo de presión + asserts EXPLÍCITOS de
// trazabilidad/disclosure que no deben perderse en el diff del snapshot.
//
// La ficha NO recomputa veredicto ni cifras: solo transforma. Estos tests
// blindan los innegociables de §8 (trazabilidad: edición + tabla/artículo,
// origen de cada dato, criterios externos etiquetados) y los disclosures
// ARCH-1 (presión orientativa), ARCH-2 (ACS no dimensionada) y OV-7 (serie de Ø
// como criterio de proyecto), surfaceados por la ficha.
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Vivienda realista (defaults): baño + aseo + cocina, acometida 250 kPa → CUMPLE. */
const vivienda: HS4Inputs = hs4Defaults;

/**
 * Misma red de los defaults con acometida de baja presión (120 kPa): las
 * pérdidas + la cota de 3 m del montante dejan el punto crítico por debajo de la
 * mínima exigida ⇒ fuerza `grupoPresionNecesario` (déficit). Reusa el patrón del
 * escenario "acometidaBaja" de calc.test.ts.
 */
const acometidaBaja: HS4Inputs = {
  ...hs4Defaults,
  presionAcometida_kPa: 120,
};

const fichaVivienda = () => toFichaData(vivienda, calcHS4(vivienda));
const fichaBaja = () => toFichaData(acometidaBaja, calcHS4(acometidaBaja));

// Texto plano de todas las observaciones, para buscar disclosures sin acoplar el
// test a su orden/índice concreto dentro del array.
const observacionesTexto = (f: ReturnType<typeof toFichaData>): string =>
  (f.observaciones ?? []).join("\n");

// =============================================================================
// SNAPSHOTS (SPEC §5) — commiteados y revisados en PR. Determinismo aparte.
// =============================================================================

describe("toFichaData HS4 — snapshots (SPEC §5)", () => {
  it("vivienda realista (defaults, 250 kPa → CUMPLE)", () => {
    expect(fichaVivienda()).toMatchSnapshot();
  });

  it("acometida baja (120 kPa → grupo de presión necesario)", () => {
    expect(fichaBaja()).toMatchSnapshot();
  });
});

// =============================================================================
// TRAZABILIDAD / DISCLOSURES — asserts explícitos (independientes del snapshot).
// =============================================================================

describe("toFichaData HS4 — trazabilidad y disclosures", () => {
  it("declara presión ORIENTATIVA / predimensionado (ARCH-1)", () => {
    const f = fichaVivienda();
    const obs = observacionesTexto(f);
    // La presión es una estimación de predimensionado (modelo simplificado).
    expect(obs).toMatch(/orientativ/i);
    expect(obs).toMatch(/predimensionado/i);
    // La advertencia va también JUNTO al dato (concepto/valor), no solo en obs.
    const conceptos = f.verificaciones.map((v) => v.concepto).join("\n");
    const valores = f.verificaciones.map((v) => v.valor).join("\n");
    expect(`${conceptos}\n${valores}`).toMatch(/predimensionado|orientativa/i);
  });

  it("declara ACS no dimensionada / solo agua fría (ARCH-2)", () => {
    const f = fichaVivienda();
    // Dato de partida de cabecera: alcance = solo agua fría.
    const alcance = f.datosPartida.find((d) => /alcance/i.test(d.concepto));
    expect(alcance).toBeDefined();
    expect(alcance!.valor).toMatch(/agua fr[íi]a|AF/i);
    // Y una observación que declara que la red de ACS NO se dimensiona.
    expect(observacionesTexto(f)).toMatch(/ACS[\s\S]*no se dimensiona|no se dimensiona[\s\S]*ACS/i);
  });

  it("declara la serie de Ø comerciales como CRITERIO DE PROYECTO, no exigencia CTE (OV-7)", () => {
    const f = fichaVivienda();
    // Observación que la etiqueta como criterio de proyecto / no exigencia CTE.
    expect(observacionesTexto(f)).toMatch(/serie de Ø comerciales|di[áa]metros? (comercial|de Ø)/i);
    expect(observacionesTexto(f)).toMatch(/criterio de proyecto|no exigencia (del CTE|CTE)/i);
    // El origen del Ø en las verificaciones por tramo cita la serie como tal.
    const refsTramo = f.verificaciones
      .filter((v) => /tramo|deriv|montante|alimentaci|acometida|columna/i.test(v.concepto))
      .map((v) => v.referencia)
      .join("\n");
    expect(refsTramo).toMatch(/serie de Ø comerciales[\s\S]*criterio de proyecto/i);
  });

  it("normativa[] cita DB-HS4 edición 2009 con tablas 2.1 / 4.2 / 4.3 + ap. 2.1.3", () => {
    const f = fichaVivienda();
    // Edición del DB en cabecera de la ficha.
    expect(f.edicionDB).toMatch(/2009/);

    // Todas las citas vinculantes del DB-HS4 son de la edición 2009.
    const dbHs4 = f.normativa.filter((c) => c.db === "DB-HS4");
    expect(dbHs4.length).toBeGreaterThan(0);
    for (const c of dbHs4) expect(c.edicion).toBe("2009");

    // Las tablas 2.1 / 4.2 / 4.3 y el ap. 2.1.3 (presiones) están citados.
    const articulos = f.normativa.map((c) => c.articulo);
    expect(articulos).toContain("Tabla 2.1");
    expect(articulos).toContain("Tabla 4.2");
    expect(articulos).toContain("Tabla 4.3");
    expect(articulos).toContain("ap. 2.1.3");

    // Coherencia con la procedencia REAL de las tablas (no cifras sueltas).
    expect(f.normativa.some((c) => c.articulo === CAUDAL_INSTANTANEO_TABLA_2_1.procedencia.tabla)).toBe(true);
    expect(f.normativa.some((c) => c.articulo === DERIVACIONES_TABLA_4_2.procedencia.tabla)).toBe(true);
    expect(f.normativa.some((c) => c.articulo === ALIMENTACION_TABLA_4_3.procedencia.tabla)).toBe(true);
    expect(f.normativa.some((c) => c.articulo === PRESIONES.procedencia.articulo)).toBe(true);
  });

  it("K aparece etiquetado como UNE 149201 / criterio externo (no exigencia CTE)", () => {
    const f = fichaVivienda();
    // En las citas normativas: la entrada de K declara su norma y naturaleza.
    const citaK = f.normativa.find((c) => /UNE 149201/.test(c.exigencia ?? ""));
    expect(citaK).toBeDefined();
    expect(citaK!.exigencia).toMatch(/criterio externo/i);
    expect(citaK!.exigencia).toMatch(/no exigencia (del )?CTE/i);

    // En los datos de partida: el criterio de simultaneidad y su origen.
    const dato = f.datosPartida.find((d) => /simultaneidad/i.test(d.concepto));
    expect(dato).toBeDefined();
    expect(dato!.valor).toMatch(/UNE 149201/);
    expect(dato!.origen).toMatch(/UNE 149201/);
    expect(dato!.origen).toMatch(/criterio externo/i);

    // En observaciones: criterios externos (K) explícitamente fuera del DB-HS4.
    expect(observacionesTexto(f)).toMatch(/UNE 149201/);
    expect(observacionesTexto(f)).toMatch(/criterios? externos? al DB-HS4|no exigencias? CTE/i);
  });

  it("veredictoGlobal de la ficha = el del motor (NO se recomputa)", () => {
    const r = calcHS4(vivienda);
    const f = toFichaData(vivienda, r);
    expect(f.veredictoGlobal).toBe(r.veredictoGlobal);
    expect(f.veredictoGlobal).toBe("ok"); // los defaults CUMPLEN

    const rb = calcHS4(acometidaBaja);
    const fb = toFichaData(acometidaBaja, rb);
    expect(fb.veredictoGlobal).toBe(rb.veredictoGlobal);
    expect(fb.veredictoGlobal).toBe("fail"); // la baja NO cumple
  });

  it("svg de la ficha apunta al clon PDF (HS4_PDF_SVG_ID) con tamaño nativo > 0", () => {
    const f = fichaVivienda();
    expect(f.svg).toBeDefined();
    expect(f.svg!.elementId).toBe(HS4_PDF_SVG_ID);
    expect(f.svg!.nativeW).toBeGreaterThan(0);
    expect(f.svg!.nativeH).toBeGreaterThan(0);
  });
});

// =============================================================================
// ESCENARIO DE GRUPO DE PRESIÓN — la ficha refleja el déficit del motor.
// =============================================================================

describe("toFichaData HS4 — escenario de grupo de presión (120 kPa)", () => {
  it("la ficha refleja grupoPresionNecesario y el punto crítico del motor", () => {
    const r = calcHS4(acometidaBaja);
    const f = toFichaData(acometidaBaja, r);

    // Sanidad del escenario: el motor exige grupo de presión y hay punto crítico.
    expect(r.grupoPresionNecesario).toBe(true);
    expect(r.puntoCriticoId).not.toBeNull();

    // Fila de grupo de presión: "Necesario" y veredicto fail (lo decide el motor).
    const filaGrupo = f.verificaciones.find((v) => /grupo de presi[óo]n/i.test(v.concepto));
    expect(filaGrupo).toBeDefined();
    expect(filaGrupo!.valor).toMatch(/Necesario/);
    expect(filaGrupo!.estado).toBe("fail");

    // Fila del punto crítico: nombra el aparato crítico del motor y propaga su estado.
    const apCritico = r.porAparato.find((a) => a.id === r.puntoCriticoId)!;
    const filaCritico = f.verificaciones.find((v) => /punto cr[íi]tico/i.test(v.concepto));
    expect(filaCritico).toBeDefined();
    expect(filaCritico!.concepto).toContain(r.puntoCriticoId!);
    expect(filaCritico!.estado).toBe(apCritico.estado);
    // El valor muestra la presión crítica del motor (mismo formato es-ES que la
    // ficha: `fmt(presionCritica_kPa, "kPa")`), marcada como orientativa.
    expect(filaCritico!.valor).toContain(fmt(r.presionCritica_kPa, "kPa"));
    expect(filaCritico!.valor).toMatch(/orientativa/i);
  });

  it("escenario CUMPLE (defaults): grupo de presión NO necesario y veredicto ok", () => {
    const r = calcHS4(vivienda);
    const f = toFichaData(vivienda, r);
    expect(r.grupoPresionNecesario).toBe(false);
    const filaGrupo = f.verificaciones.find((v) => /grupo de presi[óo]n/i.test(v.concepto));
    expect(filaGrupo!.valor).toMatch(/No necesario/);
    expect(filaGrupo!.estado).toBe("ok");
  });
});

// =============================================================================
// DETERMINISMO — misma entrada → mismo FichaData (sin Date/random).
// =============================================================================

describe("toFichaData HS4 — determinismo", () => {
  it("misma entrada → mismo FichaData (defaults / baja)", () => {
    expect(toFichaData(vivienda, calcHS4(vivienda))).toEqual(
      toFichaData(vivienda, calcHS4(vivienda)),
    );
    expect(toFichaData(acometidaBaja, calcHS4(acometidaBaja))).toEqual(
      toFichaData(acometidaBaja, calcHS4(acometidaBaja)),
    );
  });
});
