// renderFicha — plantilla ÚNICA de ficha justificativa CTE para todos los módulos.
//
// Mejora sobre "Concreta estructura" (que tenía un renderer por módulo): aquí los
// módulos SOLO producen un objeto `FichaData`; esta función lo pinta. Construida
// SOBRE los helpers probados de ./utils (drawHeader, drawTable, drawFootersAllPages,
// embedSvgAsImage, inputsFingerprint). Cumple el innegociable de TRAZABILIDAD del
// SPEC §8: cita DB + artículo/tabla + EDICIÓN, origen de cada dato, veredicto
// CUMPLE/NO CUMPLE y sello motor+edición en cada pie.

import jsPDF from "jspdf";
import {
  PAGE_W,
  setGray,
  pdfStr,
  drawHeader,
  drawFootersAllPages,
  drawTable,
  ensureSpace,
  embedSvgAsImage,
  inputsFingerprint,
  STATUS_LABEL,
  type PdfResult,
} from "./utils";

const M = 18; // margen del módulo (mm)
const CW = PAGE_W - 2 * M;

export type Veredicto = "ok" | "warn" | "fail" | "neutral";

/** Una fila de "Datos de partida" — cada dato declara su ORIGEN (trazabilidad). */
export interface FilaDato {
  /** Magnitud, p.ej. "Caudal de cocción". */
  concepto: string;
  /** Valor formateado con unidad, p.ej. "50 l/s". */
  valor: string;
  /** Origen del dato: input usuario, tabla DB, norma UNE, dato climático… */
  origen: string;
}

/** Una fila de "Verificación" — comparación contra el límite normativo. */
export interface FilaVerificacion {
  concepto: string;
  /** Valor obtenido (formateado con unidad). */
  valor: string;
  /** Límite/exigencia normativa (formateado con unidad). */
  limite: string;
  estado: Veredicto;
  /** Artículo/tabla del DB que fija el límite. */
  referencia: string;
}

/** Cita normativa con EDICIÓN del DB (los DB se modifican — innegociable citarla). */
export interface CitaNormativa {
  /** Documento básico, p.ej. "DB-HS3". */
  db: string;
  /** Exigencia/sección, p.ej. "Calidad del aire interior". */
  exigencia?: string;
  /** Artículo/tabla concretos, p.ej. "Tabla 2.1". */
  articulo?: string;
  /** Edición/fecha vigente, p.ej. "FOM/588/2017" o "2019, consolidado 14-jun-2022". */
  edicion: string;
}

export interface FichaData {
  /** Título de la ficha, p.ej. "HS3 — Ventilación". */
  titulo: string;
  /** Versión del motor de cálculo (sello legal). */
  engineVersion: string;
  /** Edición del DB para el pie/sello (resumen, p.ej. "DB-HS3 FOM/588/2017"). */
  edicionDB: string;
  /** Identificación del proyecto (opcional; render "Sin especificar" si falta). */
  proyecto?: string;
  expediente?: string;
  autor?: string;
  fechaProyecto?: string;
  /** Citas normativas de referencia. */
  normativa: CitaNormativa[];
  /** Datos de partida con origen. */
  datosPartida: FilaDato[];
  /** Verificaciones con veredicto. */
  verificaciones: FilaVerificacion[];
  /** Veredicto global. */
  veredictoGlobal: Veredicto;
  /** Observaciones (texto libre, una entrada por párrafo). */
  observaciones?: string[];
  /**
   * Datos para incrustar el diagrama SVG (opcional). `elementId` apunta al
   * clon oculto del SVG en modo 'pdf' del módulo. `nativeW/H` = viewBox del SVG.
   */
  svg?: { elementId: string; nativeW: number; nativeH: number; caption?: string };
  /** Para el nombre de archivo + fingerprint de procedencia. */
  inputs: unknown;
  /** Slug para el nombre de archivo, p.ej. "hs3-ventilacion". */
  slug: string;
}

function sectionTitle(doc: jsPDF, label: string, y: number): number {
  setGray(doc, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(pdfStr(label), M, y);
  return y + 4;
}

export async function renderFicha(data: FichaData): Promise<PdfResult> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const hash = inputsFingerprint(data.inputs);

  // ── 1. Cabecera (identificación + sello) ─────────────────────────────────
  const { contentY } = drawHeader(
    doc,
    {
      title: `Concreta Instalaciones — ${data.titulo}`,
      engineVersion: data.engineVersion,
      inputsHash: hash,
      proyecto: data.proyecto,
      expediente: data.expediente,
      autor: data.autor,
      fechaProyecto: data.fechaProyecto,
    },
    M,
  );
  let y = contentY;

  // ── 2. Normativa de referencia (con edición) ─────────────────────────────
  y = sectionTitle(doc, "NORMATIVA DE REFERENCIA", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (const c of data.normativa) {
    const partes = [c.db, c.exigencia, c.articulo].filter(Boolean).join(" · ");
    setGray(doc, 60);
    y = ensureSpace(doc, y, 4.5, M);
    doc.text(pdfStr(`${partes}  —  edición ${c.edicion}`), M, y);
    y += 4.5;
  }
  y += 2;

  // ── 3. Datos de partida (con origen) ─────────────────────────────────────
  y = sectionTitle(doc, "DATOS DE PARTIDA", y);
  y = drawTable<FilaDato>(doc, {
    x: M,
    y,
    M,
    cols: [
      { key: "concepto", label: "Concepto", w: CW * 0.4 },
      { key: "valor", label: "Valor", w: CW * 0.25, align: "right" },
      { key: "origen", label: "Origen", w: CW * 0.35 },
    ],
    rows: data.datosPartida,
  });
  y += 4;

  // ── 4. SVG (diagrama, rasterizado Acrobat-safe) ──────────────────────────
  if (data.svg) {
    const container = document.getElementById(data.svg.elementId);
    const svgEl = container?.querySelector("svg") as SVGSVGElement | null;
    if (svgEl) {
      const scale = CW / data.svg.nativeW;
      const rendH = data.svg.nativeH * scale;
      const CAPTION_H = data.svg.caption ? 4 : 0;
      y = ensureSpace(doc, y, rendH + 2 + CAPTION_H, M);
      const ok = await embedSvgAsImage(doc, svgEl, { x: M, y, width: CW, height: rendH });
      if (ok) {
        y += rendH + 2;
        if (data.svg.caption) {
          setGray(doc, 140);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.text(pdfStr(data.svg.caption), PAGE_W / 2, y, { align: "center" });
          y += CAPTION_H;
        }
      } else {
        // Placeholder visible si el render falla (mejor que un hueco silencioso).
        setGray(doc, 235);
        doc.rect(M, y, CW, 30, "F");
        setGray(doc, 120);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("Diagrama no disponible en esta versión del PDF", PAGE_W / 2, y + 17, {
          align: "center",
        });
        y += 32;
      }
      y += 2;
    }
  }

  // ── 5. Verificación (con veredicto por fila) ─────────────────────────────
  y = sectionTitle(doc, "VERIFICACIÓN", y);
  y = drawTable<FilaVerificacion>(doc, {
    x: M,
    y,
    M,
    cols: [
      { key: "concepto", label: "Verificación", w: CW * 0.34 },
      { key: "valor", label: "Valor", w: CW * 0.16, align: "right" },
      { key: "limite", label: "Límite", w: CW * 0.16, align: "right" },
      {
        key: "estado",
        label: "Estado",
        w: CW * 0.16,
        align: "center",
        render: (r) => STATUS_LABEL[r.estado] ?? r.estado,
        color: (r) => (r.estado === "fail" ? 0 : r.estado === "warn" ? 40 : 60),
        bold: () => true,
      },
      { key: "referencia", label: "Ref.", w: CW * 0.18 },
    ],
    rows: data.verificaciones,
  });
  y += 4;

  // ── 6. Veredicto global ──────────────────────────────────────────────────
  y = ensureSpace(doc, y, 14, M);
  doc.setFillColor(235, 235, 235);
  doc.rect(M, y - 4, CW, 10, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(M, y - 4, CW, 10, "S");
  const st = data.veredictoGlobal;
  setGray(doc, st === "fail" ? 20 : st === "warn" ? 40 : 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`VEREDICTO GLOBAL: ${STATUS_LABEL[st] ?? st}`, PAGE_W / 2, y + 2.5, { align: "center" });
  y += 12;

  // ── 7. Observaciones ─────────────────────────────────────────────────────
  if (data.observaciones?.length) {
    y = sectionTitle(doc, "OBSERVACIONES", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setGray(doc, 80);
    for (const obs of data.observaciones) {
      const lines = doc.splitTextToSize(pdfStr(obs), CW) as string[];
      for (const ln of lines) {
        y = ensureSpace(doc, y, 4, M);
        doc.text(ln, M, y);
        y += 4;
      }
      y += 1.5;
    }
  }

  // ── 8. Pie legal en TODAS las páginas (motor + edición DB) ───────────────
  drawFootersAllPages(
    doc,
    { engineVersion: data.engineVersion, proyecto: data.proyecto ?? data.edicionDB },
    M,
  );

  const filename = `concreta-${data.slug}-${hash}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, filename, pageCount: doc.getNumberOfPages() };
}
