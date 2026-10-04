// =============================================================================
// Del plan a un documento de la librería `docx` (feature-16 §F). Traduce; no
// decide: los anchos, el troceo de tablas y los estilos ya están en `plan.ts`.
//
// Port de `src/lib/docx/render.ts` de Concreta, con sus tres decisiones:
//   1. La tipografía del estudio, medida sobre sus memorias entregadas: Arial,
//      cuerpo 10 pt, títulos en negrita y NEGRO (14, 12 y 11 pt) y tablas a 8 pt.
//      Se usan los estilos integrados (Heading1..3, Caption, TableGrid): el
//      índice automático funciona y, al pegar con «Combinar formato», Word
//      adopta la plantilla de destino.
//   2. A4 vertical explícito (sin `sectPr`, Word en-US abre en Letter).
//   3. Una sola sección.
//
// Se carga bajo demanda: la librería no entra en el bundle de La obra.
// =============================================================================

import {
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { BloqueMemoria } from "../obra/memoria";
import { planificarDocx, type BloquePlan, type EstiloParrafo, type FilaPlan } from "./plan";

/** A4 vertical en twips (1/1440") y márgenes de 2 cm. */
const A4 = { width: 11906, height: 16838 };
const MARGEN = 1134;

const FUENTE = "Arial";
const CUERPO = 20; // 10 pt (OOXML cuenta en medios puntos)
const TABLA = 16; // 8 pt
const NEGRO = "000000";
const GRIS_CABECERA = "EFEFEF";
const MARGEN_CELDA = { top: 40, bottom: 40, left: 70, right: 70 };

const ESTILOS = {
  default: {
    document: {
      run: { font: FUENTE, size: CUERPO, color: NEGRO },
      paragraph: { spacing: { after: 120 } },
    },
    heading1: {
      run: { font: FUENTE, size: 28, bold: true, color: NEGRO },
      paragraph: { spacing: { before: 280, after: 140 } },
    },
    heading2: {
      run: { font: FUENTE, size: 24, bold: true, color: NEGRO },
      paragraph: { spacing: { before: 240, after: 120 } },
    },
    heading3: {
      run: { font: FUENTE, size: 22, bold: true, color: NEGRO },
      paragraph: { spacing: { before: 200, after: 100 } },
    },
  },
  paragraphStyles: [
    {
      // El `Caption` integrado de Word es azul y cursiva; las fuentes y las
      // citas van negras, a 8 pt.
      id: "Caption",
      name: "Caption",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FUENTE, size: TABLA, color: NEGRO, italics: false },
      paragraph: { spacing: { before: 0, after: 60 } },
    },
  ],
};

const NIVEL = {
  Heading1: HeadingLevel.HEADING_1,
  Heading2: HeadingLevel.HEADING_2,
  Heading3: HeadingLevel.HEADING_3,
} as const;

function parrafo(estilo: EstiloParrafo, texto: string): Paragraph {
  if (estilo === "Heading1" || estilo === "Heading2" || estilo === "Heading3") {
    return new Paragraph({ heading: NIVEL[estilo], text: texto });
  }
  if (estilo === "Caption") return new Paragraph({ style: "Caption", text: texto });
  if (estilo === "Pendiente") return new Paragraph({ children: [new TextRun({ text: texto, bold: true })] });
  return new Paragraph({ text: texto });
}

/** Una celda: Word exige al menos un párrafo, y dentro de la tabla sin espacio debajo. */
function celda(texto: string, negrita: boolean, ancho: number, cabecera: boolean): TableCell {
  return new TableCell({
    width: { size: ancho, type: WidthType.PERCENTAGE },
    shading: cabecera ? { type: ShadingType.CLEAR, color: "auto", fill: GRIS_CABECERA } : undefined,
    margins: MARGEN_CELDA,
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: texto, bold: negrita, size: TABLA })],
      }),
    ],
  });
}

function fila(f: FilaPlan, anchos: number[]): TableRow {
  return new TableRow({
    children: f.celdas.map((c, j) => celda(c.texto, c.negrita, anchos[j], f.cabecera)),
    // La cabecera se repite en cada página y ninguna fila se parte.
    tableHeader: f.cabecera,
    cantSplit: true,
  });
}

function tabla(b: Extract<BloquePlan, { tipo: "tabla" }>): Table {
  return new Table({
    rows: b.filas.map((f) => fila(f, b.anchos)),
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    style: "TableGrid",
    margins: { marginUnitType: WidthType.DXA, ...MARGEN_CELDA },
  });
}

export function documentoMemoria(bloques: BloqueMemoria[], proyecto: string): Document {
  const plan = planificarDocx(bloques);
  const children: (Paragraph | Table)[] = [];
  for (const b of plan.bloques) {
    if (b.tipo === "parrafo") {
      children.push(parrafo(b.estilo, b.texto));
      continue;
    }
    children.push(tabla(b));
    // Word pega dos tablas consecutivas si no hay nada en medio.
    children.push(new Paragraph({ text: "" }));
  }
  return new Document({
    styles: ESTILOS,
    title: plan.titulo,
    subject: `Justificación del CTE · ${proyecto}`,
    creator: "Concreta Instalaciones",
    lastModifiedBy: "Concreta Instalaciones",
    description: "Memoria CTE redactada a partir del cálculo con Concreta Instalaciones",
    keywords: "CTE, DB-HS, DB-HE, memoria justificativa, instalaciones",
    sections: [
      {
        properties: {
          page: {
            size: { width: A4.width, height: A4.height, orientation: PageOrientation.PORTRAIT },
            margin: { top: MARGEN, right: MARGEN, bottom: MARGEN, left: MARGEN },
          },
        },
        children,
      },
    ],
  });
}

/** El .docx de la memoria, como blob. */
export async function memoriaDocx(bloques: BloqueMemoria[], proyecto: string): Promise<Blob> {
  return Packer.toBlob(documentoMemoria(bloques, proyecto));
}
