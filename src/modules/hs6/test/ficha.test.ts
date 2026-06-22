import { describe, it, expect } from "vitest";
import { calcHS6, hs6Defaults, type HS6Inputs } from "../calc";
import { toFichaData } from "../ficha";
import {
  NIVEL_REFERENCIA_RADON,
  REQUISITOS_POR_ZONA,
  AMBITO_APLICACION,
} from "../tablas";
import { HS6_PDF_SVG_ID, hs6NativeSize } from "../svg-meta";

// =============================================================================
// HS6 — ficha justificativa (transformación PURA inputs+result → FichaData).
// Blinda los innegociables de §8 (trazabilidad: edición RD 732/2019 + artículo /
// Apéndice B, ORIGEN de cada dato, REFERENCIA de cada verificación) y los
// disclosures del módulo (vía por cálculo DIFERIDA, umbrales PENDIENTES de
// auditoría literal, sin exigencia fuera de ámbito). La ficha NO recomputa
// veredicto ni cifras: solo transforma y propaga el `result` del motor.
//
// Snapshot commiteado de los defaults (CUMPLE) + asserts explícitos de
// trazabilidad que no deben perderse en el diff del snapshot, y un escenario
// NO CUMPLE (Zona II sin barrera).
// =============================================================================

// --- Inputs de referencia ----------------------------------------------------

/** Defaults: sótano habitable en Zona II, barrera lámina-tipo + cámara natural → CUMPLE. */
const defaults: HS6Inputs = hs6Defaults;

/**
 * Zona II con SOLO un espacio de contención (sin barrera): la barrera es
 * obligatoria en Zona II ⇒ NO CUMPLE (combinación insuficiente). Reusa el patrón
 * del escenario "Zona II SIN barrera" de calc.test.ts.
 */
const zonaIISinBarrera: HS6Inputs = {
  zona: "II",
  localHabitableEnContactoConTerreno: true,
  soluciones: [
    {
      tipo: "espacio_contencion",
      id: "solo-camara",
      nombre: "Espacio de contención (cámara, ventilación natural)",
      ventilacion: "natural",
      perimetro_m: 30,
      areaAberturas_cm2: 400, // ≥ 10 · 30 = 300 cm² → la cámara en sí es válida
      alturaCamara_mm: 80,
    },
  ],
};

const fichaDefaults = () => toFichaData(defaults, calcHS6(defaults));
const fichaSinBarrera = () => toFichaData(zonaIISinBarrera, calcHS6(zonaIISinBarrera));

/** Texto plano de todas las observaciones, para buscar disclosures sin acoplar al índice. */
const observacionesTexto = (f: ReturnType<typeof toFichaData>): string =>
  (f.observaciones ?? []).join("\n");

// =============================================================================
// SNAPSHOT (SPEC §5) — commiteado y revisado en PR. Determinismo aparte.
// =============================================================================

describe("toFichaData HS6 — snapshot (SPEC §5)", () => {
  it("defaults (Zona II, sótano habitable: barrera + cámara → CUMPLE)", () => {
    expect(fichaDefaults()).toMatchSnapshot();
  });
});

// =============================================================================
// ESTRUCTURA / TRAZABILIDAD — asserts explícitos (independientes del snapshot).
// =============================================================================

describe("toFichaData HS6 — estructura y trazabilidad", () => {
  it("produce una FichaData con datos de partida y verificaciones", () => {
    const f = fichaDefaults();
    expect(f.titulo).toBe("HS6 — Protección frente al radón");
    expect(f.slug).toBe("hs6-radon");
    expect(f.veredictoGlobal).toBe("ok"); // los defaults CUMPLEN
    expect(f.datosPartida.length).toBeGreaterThan(0);
    expect(f.verificaciones.length).toBeGreaterThan(0);
    expect((f.observaciones ?? []).length).toBeGreaterThan(0);
  });

  it("cada dato de partida declara su ORIGEN (trazabilidad §8)", () => {
    const f = fichaDefaults();
    for (const d of f.datosPartida) {
      expect(d.origen).toBeDefined();
      expect(typeof d.origen).toBe("string");
      expect(d.origen.length).toBeGreaterThan(0);
    }
  });

  it("cada verificación cita su REFERENCIA normativa (trazabilidad §8)", () => {
    const f = fichaDefaults();
    for (const v of f.verificaciones) {
      expect(v.referencia).toBeDefined();
      expect(typeof v.referencia).toBe("string");
      expect(v.referencia.length).toBeGreaterThan(0);
    }
  });

  it("normativa[] cita DB-HS6 edición RD 732/2019 con art. 2 / art. 1 / art. 3.1 / Apéndice B", () => {
    const f = fichaDefaults();
    // Edición del DB en cabecera de la ficha.
    expect(f.edicionDB).toMatch(/RD 732\/2019/);

    // Todas las citas son del DB-HS6 con la edición RD 732/2019.
    const dbHs6 = f.normativa.filter((c) => c.db === "DB-HS6");
    expect(dbHs6.length).toBeGreaterThan(0);
    for (const c of dbHs6) expect(c.edicion).toBe(NIVEL_REFERENCIA_RADON.procedencia.edicion);
    expect(NIVEL_REFERENCIA_RADON.procedencia.edicion).toBe("RD 732/2019");

    // Los artículos clave están citados (vía la procedencia REAL de las tablas).
    const articulos = f.normativa.map((c) => c.articulo);
    expect(articulos).toContain(NIVEL_REFERENCIA_RADON.procedencia.articulo); // art. 2
    expect(articulos).toContain(AMBITO_APLICACION.procedencia.articulo); // art. 1
    expect(articulos).toContain(REQUISITOS_POR_ZONA.procedencia.articulo); // art. 3.1
    expect(articulos.some((a) => /Ap[ée]ndice B/.test(a ?? ""))).toBe(true);
  });

  it("declara el nivel de referencia 300 Bq/m³ como límite (art. 2)", () => {
    const f = fichaDefaults();
    const fila = f.verificaciones.find((v) => /nivel de referencia/i.test(v.concepto));
    expect(fila).toBeDefined();
    // El límite proviene de la tabla (no cifra suelta).
    expect(fila!.limite).toContain(String(NIVEL_REFERENCIA_RADON.datos.concentracionMax_Bq_m3));
    expect(fila!.valor).toContain(String(NIVEL_REFERENCIA_RADON.datos.concentracionMax_Bq_m3));
  });

  it("declara los disclosures: vía por cálculo DIFERIDA y umbrales PENDIENTES", () => {
    const obs = observacionesTexto(fichaDefaults());
    // Vía por cálculo (E < Elim, Nivel B) fuera del predimensionado.
    expect(obs).toMatch(/E\s*<\s*Elim|Nivel B/);
    expect(obs).toMatch(/no eval[úu]a|fuera del m[óo]dulo|DIFERIDA/i);
    // Umbrales de la vía simplificada pendientes de auditoría literal del PDF.
    expect(obs).toMatch(/PENDIENTES?|pendiente/);
    expect(obs).toMatch(/verificaci[óo]n literal|auditor[íi]a literal/i);
  });

  it("svg de la ficha apunta al clon PDF (HS6_PDF_SVG_ID) con tamaño nativo de svg-meta", () => {
    const f = fichaDefaults();
    const r = calcHS6(defaults);
    const { nativeW, nativeH } = hs6NativeSize(r);
    expect(f.svg).toBeDefined();
    expect(f.svg!.elementId).toBe(HS6_PDF_SVG_ID);
    // nativeW/H salen EXACTAMENTE de svg-meta.ts (única fuente de verdad).
    expect(f.svg!.nativeW).toBe(nativeW);
    expect(f.svg!.nativeH).toBe(nativeH);
    expect(f.svg!.nativeW).toBeGreaterThan(0);
    expect(f.svg!.nativeH).toBeGreaterThan(0);
  });

  it("veredictoGlobal de la ficha = el del motor (NO se recomputa)", () => {
    const r = calcHS6(defaults);
    const f = toFichaData(defaults, r);
    expect(f.veredictoGlobal).toBe(r.veredictoGlobal);
    expect(f.veredictoGlobal).toBe("ok");
  });
});

// =============================================================================
// ESCENARIO NO CUMPLE — Zona II sin barrera (barrera obligatoria).
// =============================================================================

describe("toFichaData HS6 — Zona II sin barrera (NO CUMPLE)", () => {
  it("la ficha refleja el veredicto fail y la combinación insuficiente del motor", () => {
    const r = calcHS6(zonaIISinBarrera);
    const f = fichaSinBarrera();

    // Sanidad del escenario: el motor falla por barrera obligatoria ausente.
    expect(r.aplica).toBe(true);
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");

    // La ficha propaga el veredicto fail (no se recomputa).
    expect(f.veredictoGlobal).toBe("fail");
    expect(f.veredictoGlobal).toBe(r.veredictoGlobal);

    // La verificación de combinación refleja insuficiencia (estado fail).
    const filaCombo = f.verificaciones.find((v) => /combinaci[óo]n suficiente/i.test(v.concepto));
    expect(filaCombo).toBeDefined();
    expect(filaCombo!.estado).toBe("fail");
    // El nº de medidas válidas y el exigido coinciden con el motor.
    expect(filaCombo!.valor).toContain(String(r.nMedidasValidas));
    expect(filaCombo!.limite).toContain(String(r.nMedidasMin));

    // Hay constancia del fallo de barrera obligatoria en observaciones (warnings).
    expect(observacionesTexto(f)).toMatch(/barrera/i);
  });

  it("trazabilidad intacta en el caso NO CUMPLE (origen + referencia)", () => {
    const f = fichaSinBarrera();
    expect(f.datosPartida.length).toBeGreaterThan(0);
    expect(f.verificaciones.length).toBeGreaterThan(0);
    for (const d of f.datosPartida) expect(d.origen.length).toBeGreaterThan(0);
    for (const v of f.verificaciones) expect(v.referencia.length).toBeGreaterThan(0);
    expect(f.svg!.elementId).toBe(HS6_PDF_SVG_ID);
  });
});

// =============================================================================
// DETERMINISMO — misma entrada → mismo FichaData (sin Date/random).
// =============================================================================

describe("toFichaData HS6 — determinismo", () => {
  it("misma entrada → mismo FichaData (defaults / sin barrera)", () => {
    expect(toFichaData(defaults, calcHS6(defaults))).toEqual(
      toFichaData(defaults, calcHS6(defaults)),
    );
    expect(toFichaData(zonaIISinBarrera, calcHS6(zonaIISinBarrera))).toEqual(
      toFichaData(zonaIISinBarrera, calcHS6(zonaIISinBarrera)),
    );
  });
});
