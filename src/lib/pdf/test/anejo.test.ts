import { describe, it, expect } from "vitest";
import jsPDF from "jspdf";
import { renderAnejo, estadoLegible, type EntradaAnejo } from "../anejo";
import { renderFicha, renderFichaEnDoc, type FichaData } from "../renderFicha";
import type {
  ContextoDerivado,
  DatosGenerales,
  EstadoJustificacion,
  JustificacionKey,
  Proyecto,
} from "../../proyecto/tipos";

// =============================================================================
// renderAnejo (feature-8 §D) — composición del anejo del proyecto en jsdom.
//
// Las FichaData sintéticas NO llevan `svg`: el raster (embedSvgAsImage) usa
// Image+canvas y no corre en jsdom — la ruta sin diagrama es válida y es la
// que ejercitan estos tests. jsPDF no expone el texto pintado de forma cómoda,
// así que se asierta sobre la ESTRUCTURA: nº de páginas, blobUrl, filename y
// la monotonía de las páginas iniciales registradas para el índice.
// =============================================================================

// --- Fixtures ----------------------------------------------------------------

/** FichaData mínima (sin svg — jsdom) con identificación de proyecto. */
function fichaMin(slug: string, titulo: string): FichaData {
  return {
    titulo,
    engineVersion: "0.0.0-test",
    edicionDB: "DB-TEST (2026)",
    proyecto: "Vivienda Ñandú nº 3",
    normativa: [{ db: "DB-TEST", exigencia: "Exigencia", articulo: "Tabla 1.1", edicion: "2026" }],
    datosPartida: [{ concepto: "Dato de partida", valor: "1 u", origen: "input usuario (test)" }],
    verificaciones: [
      { concepto: "Comprobación", valor: "1", limite: "≤ 2", estado: "ok", referencia: "Tabla 1.1" },
    ],
    veredictoGlobal: "ok",
    observaciones: ["Observación de prueba con acentos: instalación, ñ."],
    inputs: { a: 1, slug },
    slug,
  };
}

const datosGenerales: DatosGenerales = {
  municipio: "Málaga",
  provincia: "Málaga",
  altitud_m: 10,
  uso: "vivienda_unifamiliar",
  intervencion: "obra_nueva",
  plantasSobreRasante: 2,
  plantasBajoRasante: 0,
  tipoCubierta: "inclinada",
  numViviendas: 1,
  tieneGaraje: false,
  tieneTrasteros: false,
  tienePiscina: false,
  tieneLocalPB: false,
  zonaRadon: "I",
};

const derivados: ContextoDerivado = {
  zonaClimatica: { valor: "A3", procedencia: "DB-HE Anejo B, Tabla a-Anejo B" },
  zonaTermicaHS3: { valor: "W", procedencia: "DB-HS3, Tabla 4.4" },
  alturaEvacuacion_m: { valor: 3, procedencia: "Estimación 3 m/planta (revisable)" },
};

const proyecto: Proyecto = {
  id: "p-test",
  nombre: "Vivienda Ñandú nº 3",
  creado: "2026-01-01T00:00:00.000Z",
  modificado: "2026-02-01T00:00:00.000Z",
  datosGenerales,
  justificaciones: {
    // Externa CON referencia aportada (la otra, dbse, queda sin referencia).
    he0he1_global: { refExterna: "Expediente HULC 2026-001" },
  },
};

/** Atajo para construir estados computados sintéticos. */
function estado(parcial: Partial<EstadoJustificacion>): EstadoJustificacion {
  return { aplicabilidad: "aplica", forzada: false, progreso: "sin_iniciar", ...parcial };
}

/** Entrada sintética: 2 fichas (a propósito en orden INVERSO al registry), un
 *  no_aplica con nota+cita, dos externas (con y sin refExterna) y pendientes
 *  (hs3 shipped sin ficha + si1 no shipped). */
function entradaBase(): EntradaAnejo {
  return {
    proyecto,
    derivados,
    fecha: "1 de febrero de 2026",
    estados: [
      { key: "hs3", estado: estado({ progreso: "sin_iniciar" }) },
      { key: "hs4", estado: estado({ progreso: "cumple", veredicto: "ok" }) },
      { key: "hs6", estado: estado({ progreso: "cumple", veredicto: "ok" }) },
      { key: "si1", estado: estado({ progreso: "sin_iniciar" }) },
      {
        key: "sua6",
        estado: estado({
          aplicabilidad: "no_aplica",
          nota: "SUA 6: no es de aplicación — el edificio no dispone de piscina de uso colectivo.",
          cita: "DB-SUA 6, ámbito de aplicación",
        }),
      },
      { key: "he0he1_global", estado: estado({ aplicabilidad: "externo" }) },
      { key: "dbse", estado: estado({ aplicabilidad: "externo" }) },
    ],
    fichas: [
      { key: "hs6", data: fichaMin("hs6-radon", "HS6 — Protección frente al radón") },
      { key: "hs4", data: fichaMin("hs4-suministro", "HS4 — Suministro de agua") },
    ],
  };
}

// =============================================================================
// Estructura del anejo
// =============================================================================

describe("renderAnejo — estructura", () => {
  it("no lanza y devuelve PdfResult con blobUrl y pageCount ≥ portada + índice + fichas", async () => {
    const r = await renderAnejo(entradaBase());
    expect(r.blobUrl).toBeTruthy();
    expect(typeof r.blobUrl).toBe("string");
    // Portada (1) + índice (1) + 2 fichas (≥1 pág. cada una) + secciones finales.
    expect(r.pageCount).toBeGreaterThanOrEqual(1 + 1 + 2);
    // Con las secciones finales (no-aplicables/externas/pendientes) en página propia.
    expect(r.pageCount).toBeGreaterThanOrEqual(5);
  });

  it("las páginas iniciales de las fichas crecen monótonas y empiezan tras el índice", async () => {
    const r = await renderAnejo(entradaBase());
    expect(r.paginasFichas).toHaveLength(2);
    // Las fichas se ordenan según el registry: hs4 antes que hs6 (aunque la
    // entrada las traiga invertidas).
    expect(r.paginasFichas.map((p) => p.key)).toEqual(["hs4", "hs6"]);
    // Página 1 = portada, página 2 = índice reservado ⇒ primera ficha en la 3.
    expect(r.paginasFichas[0].pagina).toBe(3);
    for (let i = 1; i < r.paginasFichas.length; i++) {
      expect(r.paginasFichas[i].pagina).toBeGreaterThan(r.paginasFichas[i - 1].pagina);
    }
  });

  it("filename: concreta-anejo-<slug-nombre>-<fingerprint>.pdf (slug ASCII sin diacríticos)", async () => {
    const r = await renderAnejo(entradaBase());
    // "Vivienda Ñandú nº 3" → "vivienda-nandu-n-3" (ñ→n, ú→u, º fuera).
    expect(r.filename).toMatch(/^concreta-anejo-vivienda-nandu-n-3-[0-9a-f]{8}\.pdf$/);
  });

  it("es determinista: misma entrada ⇒ mismo filename y mismo nº de páginas", async () => {
    const a = await renderAnejo(entradaBase());
    const b = await renderAnejo(entradaBase());
    expect(a.filename).toBe(b.filename);
    expect(a.pageCount).toBe(b.pageCount);
    expect(a.paginasFichas).toEqual(b.paginasFichas);
  });

  it("sin fichas: sigue produciendo portada + índice + secciones finales", async () => {
    const entrada = { ...entradaBase(), fichas: [] };
    const r = await renderAnejo(entrada);
    expect(r.paginasFichas).toEqual([]);
    // Portada + índice + página de secciones (las fichas pendientes se listan).
    expect(r.pageCount).toBeGreaterThanOrEqual(3);
  });
});

// =============================================================================
// Estado legible del índice
// =============================================================================

describe("estadoLegible", () => {
  it("la aplicabilidad manda; si es exigible, manda el progreso", () => {
    expect(estadoLegible(estado({ aplicabilidad: "no_aplica" }))).toBe("No aplica");
    expect(estadoLegible(estado({ aplicabilidad: "externo" }))).toBe("Externa");
    expect(estadoLegible(estado({ progreso: "cumple" }))).toBe("Cumple");
    expect(estadoLegible(estado({ progreso: "no_cumple" }))).toBe("No cumple");
    expect(estadoLegible(estado({ progreso: "en_curso" }))).toBe("En curso");
    expect(estadoLegible(estado({ progreso: "sin_iniciar" }))).toBe("Pendiente");
    // no_aplica con progreso guardado: sigue siendo "No aplica" (fuera de ámbito).
    expect(estadoLegible(estado({ aplicabilidad: "no_aplica", progreso: "cumple" }))).toBe(
      "No aplica",
    );
  });
});

// =============================================================================
// Refactor renderFicha / renderFichaEnDoc — sin cambio de comportamiento
// =============================================================================

describe("renderFicha (wrapper) y renderFichaEnDoc", () => {
  it("renderFicha: FichaData mínima ⇒ 1 página, blobUrl y filename con fingerprint", async () => {
    const r = await renderFicha(fichaMin("test-min", "TEST — Ficha mínima"));
    expect(r.pageCount).toBe(1);
    expect(r.blobUrl).toBeTruthy();
    expect(r.filename).toMatch(/^concreta-test-min-[0-9a-f]{8}\.pdf$/);
  });

  it("renderFichaEnDoc aprovecha la página vacía de un doc recién creado", async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await renderFichaEnDoc(doc, fichaMin("test-min", "TEST — Ficha mínima"));
    expect(doc.getNumberOfPages()).toBe(1);
  });

  it("renderFichaEnDoc abre página nueva si la actual ya tiene contenido", async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.text("contenido previo", 20, 20);
    await renderFichaEnDoc(doc, fichaMin("test-min", "TEST — Ficha mínima"));
    expect(doc.getNumberOfPages()).toBe(2);
  });

  it("dos fichas seguidas en el mismo doc: cada una empieza en página propia", async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await renderFichaEnDoc(doc, fichaMin("f1", "TEST — Ficha 1"));
    const trasPrimera = doc.getNumberOfPages();
    await renderFichaEnDoc(doc, fichaMin("f2", "TEST — Ficha 2"));
    expect(doc.getNumberOfPages()).toBe(trasPrimera + 1);
  });
});

// =============================================================================
// Sanidad de tipos de la entrada (claves reales del registry)
// =============================================================================

describe("EntradaAnejo — claves", () => {
  it("acepta cualquier JustificacionKey del expediente en estados/fichas", async () => {
    const keys: JustificacionKey[] = ["hs3", "sua6", "he0he1_global", "dbse"];
    const entrada: EntradaAnejo = {
      ...entradaBase(),
      estados: keys.map((key) => ({ key, estado: estado({}) })),
      fichas: [],
    };
    const r = await renderAnejo(entrada);
    expect(r.pageCount).toBeGreaterThanOrEqual(3);
  });
});
