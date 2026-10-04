// =============================================================================
// La memoria CTE en PDF (feature-16 §F). Los mismos bloques que el Word
// (`bloquesMemoria`), maquetados con jsPDF: A4, márgenes del anejo, tablas con
// `drawTable` y el pie legal (motor y página) en todas las hojas. No llama a
// Date: la fecha llega formateada dentro de los bloques.
// =============================================================================

import jsPDF from "jspdf";
import { repartirAnchos } from "../docx/plan";
import { nombreArchivoMemoria, type BloqueMemoria } from "../obra/memoria";
import { ENGINE_VERSION } from "../version";
import {
  drawFootersAllPages,
  drawTable,
  ensureSpace,
  FOOTER_RESERVE,
  PAGE_H,
  PAGE_W,
  pdfStr,
  setGray,
  type PdfResult,
  type TableCol,
} from "./utils";

const M = 18;
const CW = PAGE_W - 2 * M;
const MAX_Y = PAGE_H - M - FOOTER_RESERVE;

interface Estilo {
  size: number;
  bold: boolean;
  gray: number;
  /** Interlineado [mm]. */
  lh: number;
  antes: number;
  despues: number;
}

const ESTILOS: Record<"h1" | "h2" | "h3" | "parrafo" | "nota" | "pendiente", Estilo> = {
  h1: { size: 15, bold: true, gray: 15, lh: 6.5, antes: 0, despues: 2 },
  h2: { size: 11.5, bold: true, gray: 20, lh: 5.2, antes: 5, despues: 1.5 },
  h3: { size: 10, bold: true, gray: 30, lh: 4.6, antes: 3.5, despues: 1 },
  parrafo: { size: 9.5, bold: false, gray: 40, lh: 4.4, antes: 0, despues: 2.2 },
  nota: { size: 7.5, bold: false, gray: 110, lh: 3.4, antes: 0, despues: 2.2 },
  pendiente: { size: 9.5, bold: true, gray: 30, lh: 4.4, antes: 0, despues: 2.2 },
};

/** Escribe un texto con salto de línea y de página. Devuelve la y siguiente. */
function texto(doc: jsPDF, t: string, y: number, e: Estilo): number {
  doc.setFont("helvetica", e.bold ? "bold" : "normal");
  doc.setFontSize(e.size);
  setGray(doc, e.gray);
  const lineas = doc.splitTextToSize(pdfStr(t), CW) as string[];
  y += e.antes;
  // Un título no se queda solo al pie: pide sitio para dos líneas más.
  y = ensureSpace(doc, y, e.lh * (e.bold ? lineas.length + 2 : 1), M);
  for (const l of lineas) {
    if (y > MAX_Y) y = ensureSpace(doc, y, e.lh, M);
    doc.text(l, M, y);
    y += e.lh;
  }
  return y + e.despues;
}

function tabla(doc: jsPDF, cabecera: string[], filas: string[][], y: number): number {
  const pesos = cabecera.map((c, j) => Math.min(40, filas.reduce((m, f) => Math.max(m, (f[j] ?? "").length), c.length)));
  const anchos = repartirAnchos(pesos);
  const cols: TableCol<string[]>[] = cabecera.map((label, j) => ({
    key: String(j),
    label,
    w: (CW * anchos[j]) / 100,
    align: j === 0 ? "left" : "right",
    render: (f) => f[j] ?? "",
  }));
  y = ensureSpace(doc, y, 15, M);
  return drawTable(doc, { x: M, y, cols, rows: filas, M }) + 2;
}

/** El documento jsPDF de la memoria (separado de la URL para poder leerlo en los tests). */
export function componerMemoriaPdf(bloques: BloqueMemoria[], proyecto: string): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = M + 6;
  for (const b of bloques) {
    switch (b.tipo) {
      case "titulo":
        y = texto(doc, b.texto, y, b.nivel === 1 ? ESTILOS.h1 : b.nivel === 2 ? ESTILOS.h2 : ESTILOS.h3);
        if (b.nivel === 2) {
          setGray(doc, 200);
          doc.setLineWidth(0.2);
          doc.line(M, y - 2.6, M + CW, y - 2.6);
          y += 1;
        }
        break;
      case "parrafo":
        y = texto(doc, b.texto, y, ESTILOS.parrafo);
        break;
      case "nota":
        y = texto(doc, b.texto, y, ESTILOS.nota);
        break;
      case "pendiente":
        y = texto(doc, b.texto, y, ESTILOS.pendiente);
        break;
      case "tabla":
        y = tabla(doc, b.cabecera, b.filas, y);
        break;
    }
  }
  drawFootersAllPages(doc, { engineVersion: ENGINE_VERSION, proyecto }, M);
  return doc;
}

export function renderMemoriaPdf(bloques: BloqueMemoria[], proyecto: string): PdfResult {
  const doc = componerMemoriaPdf(bloques, proyecto);
  const blob = doc.output("blob");
  return {
    blobUrl: URL.createObjectURL(blob),
    filename: nombreArchivoMemoria(proyecto, "pdf"),
    pageCount: doc.getNumberOfPages(),
  };
}
