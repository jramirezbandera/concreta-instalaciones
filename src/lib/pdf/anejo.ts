// renderAnejo — el ANEJO del proyecto (feature-8 §D, UX-RECONCEPT §8): UN solo
// PDF listo para la memoria con portada + índice + fichas de las justificaciones
// aplicables trabajadas + no-aplicables con párrafo y cita + externas con su
// referencia + pendientes listados con honestidad.
//
// Capa PURA de composición PDF: no sabe de React ni de localStorage, no llama a
// Date.now (la fecha llega YA formateada en `EntradaAnejo.fecha`) y no ejecuta
// motores — recibe los `FichaData` ya producidos por cada módulo y los estados
// ya computados (aplicabilidad × progreso). Reutiliza `renderFichaEnDoc` (la
// plantilla única de ficha) y los helpers vendorizados de ./utils; el sellado
// del pie legal (`drawFootersAllPages`) es GLOBAL y se hace aquí, una sola vez,
// con el documento completo.

import jsPDF from "jspdf";
import {
  PAGE_W,
  PAGE_H,
  FOOTER_RESERVE,
  setGray,
  pdfStr,
  drawFootersAllPages,
  ensureSpace,
  inputsFingerprint,
  type PdfResult,
} from "./utils";
import { renderFichaEnDoc, type FichaData } from "./renderFicha";
import type {
  ContextoDerivado,
  EstadoJustificacion,
  Intervencion,
  JustificacionKey,
  Proyecto,
  ZonaRadon,
} from "../proyecto/tipos";
import { etiquetaEdificio, procedenciaEdificio } from "../edificio/derivar";
import { justificacionRegistry, type JustificacionEntry } from "../../data/justificacionRegistry";
import { ENGINE_VERSION } from "../version";

const M = 18; // margen del anejo (mm) — el mismo que renderFicha
const CW = PAGE_W - 2 * M;
/** Límite inferior útil de una página (por encima de la banda del pie). */
const MAX_Y = PAGE_H - M - FOOTER_RESERVE;

// ─────────────────────────────────────────────────────────────────────────────
// Entrada y resultado
// ─────────────────────────────────────────────────────────────────────────────

export interface EntradaAnejo {
  proyecto: Proyecto;
  derivados: ContextoDerivado;
  /**
   * Fecha del proyecto YA FORMATEADA (es-ES) por quien llama — esta capa no
   * llama a Date.now ni formatea fechas (típicamente `proyecto.modificado`
   * pasada por `toLocaleDateString("es-ES")` en la UI).
   */
  fecha: string;
  /** Estado computado por justificación (aplicabilidad×progreso), en el orden del registry. */
  estados: { key: JustificacionKey; estado: EstadoJustificacion }[];
  /** Fichas listas de las justificaciones que se calculan (ya con proyecto/fecha/observaciones). */
  fichas: { key: JustificacionKey; data: FichaData }[];
}

/**
 * Resultado del anejo: el `PdfResult` estándar del modal de preview MÁS la
 * página inicial de cada ficha (la que imprime el índice) — expuesta para que
 * los tests validen la monotonía sin re-parsear el PDF.
 */
export interface AnejoResult extends PdfResult {
  paginasFichas: { key: JustificacionKey; pagina: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Etiquetas legibles (es-ES)
// ─────────────────────────────────────────────────────────────────────────────

const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

const ZONA_RADON_LABEL: Record<ZonaRadon, string> = {
  I: "Zona I",
  II: "Zona II",
  sin_exigencia: "Sin exigencia",
};

/**
 * Estado legible de una justificación para el índice del anejo: la
 * aplicabilidad manda (No aplica / Externa) y, si es exigible, el progreso
 * derivado (Cumple / No cumple / En curso / Pendiente).
 */
export function estadoLegible(e: EstadoJustificacion): string {
  if (e.aplicabilidad === "no_aplica") return "No aplica";
  if (e.aplicabilidad === "externo") return "Externa";
  switch (e.progreso) {
    case "cumple":
      return "Cumple";
    case "no_cumple":
      return "No cumple";
    case "en_curso":
      return "En curso";
    default:
      return "Pendiente";
  }
}

/** Slug ASCII del nombre del proyecto para el nombre de archivo. */
function slugNombre(nombre: string): string {
  const slug = nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // fuera diacríticos combinantes (á→a, ñ→n)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "proyecto";
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloques de dibujo
// ─────────────────────────────────────────────────────────────────────────────

/** Título de sección de los bloques finales (no-aplicables/externas/pendientes). */
function tituloSeccion(doc: jsPDF, label: string, y: number): number {
  y = ensureSpace(doc, y, 12, M);
  setGray(doc, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(pdfStr(label), M, y);
  setGray(doc, 200);
  doc.setLineWidth(0.3);
  doc.line(M, y + 1.5, PAGE_W - M, y + 1.5);
  return y + 7;
}

/** Párrafo multi-línea con salto de página predictivo. Devuelve la nueva y. */
function parrafo(
  doc: jsPDF,
  texto: string,
  y: number,
  opts?: { size?: number; gray?: number; italic?: boolean; indent?: number },
): number {
  const size = opts?.size ?? 8;
  const indent = opts?.indent ?? 0;
  doc.setFont("helvetica", opts?.italic ? "italic" : "normal");
  doc.setFontSize(size);
  setGray(doc, opts?.gray ?? 70);
  const lines = doc.splitTextToSize(pdfStr(texto), CW - indent) as string[];
  for (const ln of lines) {
    y = ensureSpace(doc, y, 4, M);
    // ensureSpace puede haber cambiado de página: restaurar el estilo.
    doc.setFont("helvetica", opts?.italic ? "italic" : "normal");
    doc.setFontSize(size);
    setGray(doc, opts?.gray ?? 70);
    doc.text(ln, M + indent, y);
    y += 4;
  }
  return y;
}

/** Portada del anejo (página 1). */
function drawPortada(doc: jsPDF, entrada: EntradaAnejo, fingerprint: string): void {
  const { proyecto, derivados, fecha } = entrada;
  const dg = proyecto.datosGenerales;
  const cx = PAGE_W / 2;

  // Marca discreta arriba.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setGray(doc, 140);
  doc.text("CONCRETA INSTALACIONES", cx, 40, { align: "center" });

  // Título del documento.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setGray(doc, 20);
  doc.text(pdfStr("Anejo de justificación del CTE"), cx, 62, { align: "center" });

  // Nombre del proyecto + localización + uso · intervención.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setGray(doc, 40);
  doc.text(pdfStr(proyecto.nombre), cx, 80, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setGray(doc, 90);
  doc.text(pdfStr(`${dg.municipio} · ${dg.provincia}`), cx, 88, { align: "center" });
  doc.text(
    pdfStr(`${etiquetaEdificio(derivados.edificio)} · ${INTERVENCION_LABEL[dg.intervencion]}`),
    cx,
    94,
    { align: "center" },
  );

  // Bloque de datos derivados CON PROCEDENCIA (trazabilidad hasta la portada).
  const filas: { etiqueta: string; valor: string; procedencia: string }[] = [
    {
      etiqueta: "Zona climática",
      valor: derivados.zonaClimatica.valor,
      procedencia: derivados.zonaClimatica.procedencia,
    },
    {
      etiqueta: "Zona de radón",
      valor: ZONA_RADON_LABEL[dg.zonaRadon],
      procedencia: "Apéndice B del DB-HS6 (entrada del proyectista)",
    },
    {
      etiqueta: "Altura de evacuación",
      valor: `${String(derivados.alturaEvacuacion_m.valor).replace(".", ",")} m`,
      procedencia: derivados.alturaEvacuacion_m.procedencia,
    },
    {
      // Trazabilidad del edificio (feature-13): leído del cuadro o tecleado.
      etiqueta: "Superficie útil",
      valor: `${derivados.edificio.superficieUtilTotal_m2.toLocaleString("es-ES", { maximumFractionDigits: 2 })} m²`,
      procedencia: procedenciaEdificio(proyecto.edificio),
    },
  ];
  let y = 116;
  setGray(doc, 200);
  doc.setLineWidth(0.3);
  doc.line(M + 20, y - 8, PAGE_W - M - 20, y - 8);
  for (const f of filas) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setGray(doc, 60);
    doc.text(pdfStr(`${f.etiqueta}:  ${f.valor}`), cx, y, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setGray(doc, 130);
    // La procedencia del edificio lleva el nombre del fichero aportado, que
    // puede ser largo: se parte en líneas en vez de salirse de la página.
    const lineas = doc.splitTextToSize(pdfStr(f.procedencia), CW - 40) as string[];
    lineas.forEach((ln, k) => doc.text(ln, cx, y + 3.8 + k * 3.2, { align: "center" }));
    y += 12 + (lineas.length - 1) * 3.2;
  }
  setGray(doc, 200);
  doc.line(M + 20, y - 5, PAGE_W - M - 20, y - 5);

  // Fecha del proyecto (formateada por quien llama — sin Date.now aquí).
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setGray(doc, 90);
  doc.text(pdfStr(fecha), cx, y + 8, { align: "center" });

  // Sello de generación: motor + fingerprint del PROYECTO completo. No
  // sustituye a la firma del técnico — es procedencia verificable (SPEC §4).
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setGray(doc, 140);
  doc.text(
    pdfStr(`Motor v${ENGINE_VERSION}  ·  Proyecto ${fingerprint}`),
    cx,
    PAGE_H - 30,
    { align: "center" },
  );
  doc.setFontSize(7);
  doc.text(
    pdfStr("Documento generado con Concreta Instalaciones — no sustituye a la firma del técnico."),
    cx,
    PAGE_H - 25,
    { align: "center" },
  );
}

/** Fila del índice ya resuelta (grupo o justificación). */
interface FilaIndice {
  tipo: "grupo" | "entrada";
  texto: string;
  estado?: string;
  pagina?: number;
}

/**
 * Rellena la página del índice (reservada tras la portada). El índice vive en
 * UNA sola página: con el registry actual (~25 justificaciones + ~7 grupos)
 * caben de sobra (~40 filas útiles); si el registry creciera por encima, las
 * filas restantes se truncan con "…" — LÍMITE DOCUMENTADO: índice de 1 página.
 */
function drawIndice(
  doc: jsPDF,
  pagina: number,
  entrada: EntradaAnejo,
  paginas: Map<JustificacionKey, number>,
): void {
  doc.setPage(pagina);

  // Filas: grupos del registry (sin entradas dev) en orden de declaración.
  const estadoDe = new Map(entrada.estados.map((e) => [e.key, e.estado]));
  const filas: FilaIndice[] = [];
  let grupoActual = "";
  for (const j of justificacionRegistry) {
    if (j.dev) continue;
    if (j.grupo !== grupoActual) {
      grupoActual = j.grupo;
      filas.push({ tipo: "grupo", texto: j.grupo });
    }
    const key = j.key as JustificacionKey;
    const estado = estadoDe.get(key);
    filas.push({
      tipo: "entrada",
      texto: `${j.codigo} · ${j.label}`,
      estado: estado ? estadoLegible(estado) : "—",
      ...(paginas.has(key) ? { pagina: paginas.get(key) } : {}),
    });
  }

  // Cabecera de la página del índice ("ÍNDICE" ya se pintó al reservarla).
  let y = 34;
  const ROW_H = 5.2;
  const GRUPO_EXTRA = 2.5; // aire antes de cada grupo
  const wPag = 14;
  const wEstado = 26;
  const xEstado = PAGE_W - M - wPag - wEstado;
  const xPag = PAGE_W - M;

  // Cabecera de columnas.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setGray(doc, 120);
  doc.text("ESTADO", xEstado + wEstado, y, { align: "right" });
  doc.text(pdfStr("PÁG."), xPag, y, { align: "right" });
  y += 4;

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i];
    const alto = f.tipo === "grupo" ? ROW_H + GRUPO_EXTRA : ROW_H;
    // Truncado honesto si el registry desbordara la página reservada.
    if (y + alto > MAX_Y) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      setGray(doc, 120);
      doc.text(pdfStr("… (índice truncado — consulte el orden de fichas del documento)"), M, y);
      break;
    }
    if (f.tipo === "grupo") {
      y += GRUPO_EXTRA;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      setGray(doc, 30);
      doc.text(pdfStr(f.texto), M, y);
      y += ROW_H;
      continue;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setGray(doc, 70);
    doc.text(pdfStr(f.texto), M + 4, y);
    doc.text(pdfStr(f.estado ?? "—"), xEstado + wEstado, y, { align: "right" });
    if (f.pagina !== undefined) {
      doc.setFont("helvetica", "bold");
      setGray(doc, 40);
      doc.text(String(f.pagina), xPag, y, { align: "right" });
    }
    y += ROW_H;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// renderAnejo
// ─────────────────────────────────────────────────────────────────────────────

export async function renderAnejo(entrada: EntradaAnejo): Promise<AnejoResult> {
  const { proyecto, estados, fichas } = entrada;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const fingerprint = inputsFingerprint(proyecto);
  const registry = new Map<JustificacionKey, JustificacionEntry>(
    justificacionRegistry
      .filter((j) => !j.dev)
      .map((j) => [j.key as JustificacionKey, j]),
  );

  // ── 1. Portada (página 1) ────────────────────────────────────────────────
  drawPortada(doc, entrada, fingerprint);

  // ── 2. Índice: página RESERVADA tras la portada ──────────────────────────
  // Se pinta ya el título para que la página no quede vacía (además de reservar
  // el hueco, evita que `renderFichaEnDoc` — que aprovecha páginas vacías —
  // pinte la primera ficha encima). El contenido se rellena al final, cuando
  // las páginas iniciales de cada ficha ya son conocidas.
  doc.addPage();
  const PAGINA_INDICE = doc.getNumberOfPages(); // 2
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setGray(doc, 20);
  doc.text(pdfStr("Índice"), M, 24);

  // ── 3. Fichas (orden del registry), registrando su página inicial ────────
  // `renderFichaEnDoc` SIEMPRE abre página nueva aquí (la del índice ya tiene
  // contenido), así que la página inicial es la siguiente a las existentes.
  const ordenRegistry = [...registry.keys()];
  const fichasOrdenadas = [...fichas].sort(
    (a, b) => ordenRegistry.indexOf(a.key) - ordenRegistry.indexOf(b.key),
  );
  const paginasFichas = new Map<JustificacionKey, number>();
  for (const f of fichasOrdenadas) {
    const paginaInicial = doc.getNumberOfPages() + 1;
    await renderFichaEnDoc(doc, f.data);
    paginasFichas.set(f.key, paginaInicial);
  }

  // ── 4–6. Secciones finales (en página nueva, fluyen con ensureSpace) ─────
  doc.addPage();
  let y = 24;

  // 4. No aplicables: párrafo redactado + cita (material de aplicabilidad.ts).
  y = tituloSeccion(doc, "JUSTIFICACIONES NO APLICABLES", y);
  const noAplicables = estados.filter((e) => e.estado.aplicabilidad === "no_aplica");
  if (noAplicables.length === 0) {
    y = parrafo(doc, "Ninguna.", y, { italic: true, gray: 120 });
  }
  for (const { key, estado } of noAplicables) {
    const entry = registry.get(key);
    y = ensureSpace(doc, y, 10, M);
    y = parrafo(doc, `${entry?.codigo ?? key} · ${entry?.label ?? ""}`, y, {
      size: 9,
      gray: 40,
    });
    // El párrafo REDACTADO listo para la memoria (el moat: no escribirlo a mano).
    y = parrafo(
      doc,
      estado.nota ?? "No es de aplicación (aplicabilidad declarada por el proyectista).",
      y,
      { indent: 4 },
    );
    if (estado.cita) {
      y = parrafo(doc, `Cita: ${estado.cita}`, y, { size: 7, gray: 130, indent: 4 });
    }
    y += 3;
  }
  y += 4;

  // 5. Externas: destino del registry + referencia aportada en el proyecto.
  y = tituloSeccion(doc, "JUSTIFICACIONES EXTERNAS", y);
  const externas = estados.filter((e) => e.estado.aplicabilidad === "externo");
  if (externas.length === 0) {
    y = parrafo(doc, "Ninguna.", y, { italic: true, gray: 120 });
  }
  for (const { key } of externas) {
    const entry = registry.get(key);
    const destino = entry?.externo?.destino ?? "herramienta externa";
    const refExterna = proyecto.justificaciones[key]?.refExterna;
    y = ensureSpace(doc, y, 10, M);
    y = parrafo(
      doc,
      `${entry?.codigo ?? key} · ${entry?.label ?? ""} — se justifica con ${destino}.`,
      y,
      { size: 9, gray: 40 },
    );
    y = parrafo(
      doc,
      refExterna ? `Referencia: ${refExterna}` : "Sin referencia aportada.",
      y,
      { indent: 4, gray: refExterna ? 70 : 120, italic: !refExterna },
    );
    y += 3;
  }
  y += 4;

  // 6. Pendientes: aplicables SIN ficha en este anejo — lista honesta (incluye
  // las no disponibles aún en la herramienta, "Próximamente").
  y = tituloSeccion(doc, "PENDIENTES DE JUSTIFICAR", y);
  const pendientes = estados.filter(
    (e) =>
      (e.estado.aplicabilidad === "aplica" ||
        e.estado.aplicabilidad === "aplica_reformado" ||
        e.estado.aplicabilidad === "aplica_flexibilidad") &&
      !paginasFichas.has(e.key),
  );
  if (pendientes.length === 0) {
    y = parrafo(doc, "Ninguna.", y, { italic: true, gray: 120 });
  }
  for (const { key } of pendientes) {
    const entry = registry.get(key);
    const motivo = entry?.shipped
      ? "pendiente de justificar en la herramienta"
      : "módulo disponible próximamente en la herramienta";
    y = ensureSpace(doc, y, 5, M);
    y = parrafo(doc, `${entry?.codigo ?? key} · ${entry?.label ?? ""} — ${motivo}.`, y, {
      size: 9,
      gray: 60,
    });
  }
  if (pendientes.length > 0) {
    y += 2;
    parrafo(
      doc,
      "Las justificaciones anteriores son exigibles al proyecto y deberán " +
        "incorporarse a la memoria antes del visado.",
      y,
      { size: 7.5, gray: 120, italic: true },
    );
  }

  // ── 2 (bis). Rellenar el índice con las páginas ya conocidas ─────────────
  drawIndice(doc, PAGINA_INDICE, entrada, paginasFichas);

  // ── Pie legal en TODAS las páginas (motor + proyecto + pág. i/N) ─────────
  drawFootersAllPages(doc, { engineVersion: ENGINE_VERSION, proyecto: proyecto.nombre }, M);

  const filename = `concreta-anejo-${slugNombre(proyecto.nombre)}-${fingerprint}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return {
    blobUrl,
    filename,
    pageCount: doc.getNumberOfPages(),
    paginasFichas: fichasOrdenadas.map((f) => ({
      key: f.key,
      pagina: paginasFichas.get(f.key) ?? 0,
    })),
  };
}
