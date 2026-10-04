/**
 * Leer un PDF en el navegador con pdf.js: el texto de cada página y, si el
 * informe está escaneado, algunas páginas como imágenes JPEG. Sin React y sin
 * red: el PDF no sale del navegador; lo que viaja al proveedor de IA es el
 * texto (o las imágenes) que decide quien llama.
 *
 * pdf.js se carga con dynamic import para que quede en el chunk
 * `pdfjs-vendor` (ver vite.config.ts), fuera del arranque y del precache. El
 * worker va como asset propio (`?url`): sin él pdf.js parsea en el hilo
 * principal y la pestaña se congela con un informe de 200 páginas.
 *
 * La URL del worker también se pide con `import()` (Concreta la importaba
 * arriba): ese módulo vive en node_modules/pdfjs-dist, rolldown lo mete en
 * `pdfjs-vendor`, y un import estático hacía que quien importase este fichero
 * arrastrase pdf.js entero. Así se puede importar `leerPdf` sin pagarlo hasta
 * abrir un PDF (feature-13).
 *
 * `textoDeItems` y `extraerTextos` valen también en Node (el test en vivo
 * contra informes reales carga la build `legacy` de pdf.js y las reutiliza).
 */

import type { PDFDocumentProxy } from "pdfjs-dist";
import type { AiImageAttachment } from "./types";

/** Por encima de esto no se intenta ni abrir: un geotécnico normal son 5-25 MB. */
export const MAX_PDF_BYTES = 80 * 1024 * 1024;
/** Lado mayor de las páginas que se mandan como imagen; el texto de un informe se lee bien a 1600 px. */
export const MAX_LADO_PX = 1600;

export interface PaginaTexto {
  /** Número de página, desde 1. */
  n: number;
  texto: string;
}

export interface PdfAbierto {
  nombre: string;
  bytes: number;
  paginas: number;
  textos: PaginaTexto[];
  /** Las páginas pedidas (desde 1) como JPEG base64, para el informe escaneado. */
  imagenes: (numeros: number[]) => Promise<AiImageAttachment[]>;
  /** Libera el documento. */
  cerrar: () => void;
}

/** Sí cuando el fichero es un PDF: por tipo o, si el navegador no lo sabe, por extensión. */
export const esPdf = (file: { type: string; name: string }): boolean =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

/** Los trozos de texto de una página de pdf.js, en una cadena: espacio entre trozos y salto donde pdf.js lo marca. */
export function textoDeItems(
  items: readonly { str?: string; hasEOL?: boolean }[],
): string {
  let out = "";
  for (const it of items) {
    if (typeof it.str !== "string") continue;
    out += it.str;
    out += it.hasEOL ? "\n" : " ";
  }
  return out;
}

/** Un trozo de texto de pdf.js con su posición (`transform` = [a, b, c, d, x, y]). */
export interface ItemPosicionado {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
  width?: number;
  height?: number;
}

/**
 * Los trozos de una página recompuestos en LÍNEAS por su posición: se juntan los
 * que comparten renglón (misma altura de línea base, con tolerancia), cada
 * renglón de izquierda a derecha y los renglones de arriba abajo. Entre dos
 * trozos de un mismo renglón separados por un hueco ancho va « | », que es como
 * se lee una columna.
 *
 * Existe por los PDF de planos (feature-13): el CAD exporta cada celda de una
 * tabla como un texto suelto, en el orden en que se dibujó, y el flujo de
 * `textoDeItems` deja «Salón» a veinte líneas de su «25,30». Un informe de texto
 * corrido sale igual por las dos vías. Los trozos sin posición (o girados, que
 * en un plano son cotas y rótulos) van al final, en su orden.
 */
export function textoEnLineas(items: readonly ItemPosicionado[]): string {
  interface Trozo {
    str: string;
    x: number;
    y: number;
    fin: number;
    alto: number;
  }
  const trozos: Trozo[] = [];
  const sueltos: string[] = [];
  for (const it of items) {
    if (typeof it.str !== "string" || it.str.trim() === "") continue;
    const t = it.transform;
    const girado = t !== undefined && Math.abs(t[1] ?? 0) > Math.abs(t[0] ?? 0);
    if (!t || t.length < 6 || girado) {
      sueltos.push(it.str.trim());
      continue;
    }
    const alto = Math.abs(it.height ?? 0) || Math.abs(t[3] ?? 0) || 10;
    const x = t[4] ?? 0;
    trozos.push({ str: it.str, x, y: t[5] ?? 0, fin: x + Math.max(0, it.width ?? 0), alto });
  }
  // Renglones: de arriba abajo (en PDF la y crece hacia arriba).
  trozos.sort((a, b) => b.y - a.y || a.x - b.x);
  const renglones: Trozo[][] = [];
  for (const t of trozos) {
    const ultimo = renglones[renglones.length - 1];
    const ref = ultimo?.[0];
    if (ref && Math.abs(ref.y - t.y) <= Math.max(ref.alto, t.alto) * 0.5) ultimo.push(t);
    else renglones.push([t]);
  }
  const lineas = renglones.map((r) => {
    r.sort((a, b) => a.x - b.x);
    let linea = "";
    let finAnterior = Number.NEGATIVE_INFINITY;
    for (const t of r) {
      const hueco = t.x - finAnterior;
      if (linea !== "") linea += hueco > t.alto * 1.5 ? " | " : hueco > t.alto * 0.15 ? " " : "";
      linea += t.str.trim();
      finAnterior = Math.max(finAnterior, t.fin);
    }
    return linea;
  });
  return [...lineas, ...sueltos].join("\n");
}

/** Cómo se saca el texto: en el orden del documento, o recompuesto en líneas por posición. */
export type ModoTexto = "flujo" | "lineas";

/** El texto de cada página del documento, en orden. */
export async function extraerTextos(
  doc: PDFDocumentProxy,
  modo: ModoTexto = "flujo",
): Promise<PaginaTexto[]> {
  const out: PaginaTexto[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const contenido = await page.getTextContent();
    const items = contenido.items as readonly ItemPosicionado[];
    out.push({ n, texto: modo === "lineas" ? textoEnLineas(items) : textoDeItems(items) });
    page.cleanup();
  }
  return out;
}

interface Abierto {
  doc: PDFDocumentProxy;
  /** Lo que libera el documento y su worker: en pdf.js 6 se destruye la tarea de carga, no el documento. */
  cerrar: () => void;
}

async function abrir(file: File): Promise<Abierto> {
  const [pdfjs, { default: workerUrl }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const data = new Uint8Array(await file.arrayBuffer());
  const tarea = pdfjs.getDocument({ data });
  const doc = await tarea.promise;
  return {
    doc,
    cerrar: () => {
      void tarea.destroy();
    },
  };
}

/**
 * Abre el PDF y saca el texto de todas sus páginas. Lanza con un mensaje
 * legible si no es un PDF, si pesa demasiado o si pdf.js no puede con él
 * (cifrado, corrupto).
 */
export async function leerPdf(
  file: File,
  modo: ModoTexto = "flujo",
): Promise<PdfAbierto> {
  if (!esPdf(file)) throw new Error("El fichero no es un PDF.");
  if (file.size > MAX_PDF_BYTES)
    throw new Error(
      `El PDF pesa ${(file.size / 1024 / 1024).toFixed(0)} MB; el máximo son ${MAX_PDF_BYTES / 1024 / 1024} MB.`,
    );
  let abierto: Abierto;
  try {
    abierto = await abrir(file);
  } catch (err) {
    const detalle =
      err instanceof Error && err.name === "PasswordException"
        ? "está protegido con contraseña"
        : "no se ha podido abrir (¿está dañado?)";
    throw new Error(`El PDF ${detalle}.`);
  }
  const { doc, cerrar } = abierto;
  const textos = await extraerTextos(doc, modo);
  return {
    nombre: file.name,
    bytes: file.size,
    paginas: doc.numPages,
    textos,
    imagenes: (numeros) => renderizar(doc, numeros),
    cerrar,
  };
}

/** Las páginas pedidas como JPEG (calidad 0,8, lado mayor `MAX_LADO_PX`), en el orden pedido. */
async function renderizar(
  doc: PDFDocumentProxy,
  numeros: number[],
): Promise<AiImageAttachment[]> {
  const out: AiImageAttachment[] = [];
  for (const n of numeros) {
    if (n < 1 || n > doc.numPages) continue;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2, MAX_LADO_PX / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    out.push({
      data: dataUrl.slice(dataUrl.indexOf(",") + 1),
      mediaType: "image/jpeg",
    });
    page.cleanup();
  }
  return out;
}
