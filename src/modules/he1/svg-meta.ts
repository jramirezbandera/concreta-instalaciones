// DB-HE1 — Metadatos + geometría NO-COMPONENTE del render SVG (sin JSX). Separado
// de `svg.tsx` para que ese archivo exporte SOLO componentes React (regla
// `react-refresh/only-export-components`): aquí viven el id del clon PDF, las
// constantes de layout, la geometría 100% DETERMINISTA (sin Math.random, sin
// Date) y `he1NativeSize`. Lo consumen el render (`svg.tsx`), la ficha PDF
// (`./ficha.ts`) y la pantalla (`./ui.tsx`) sin arrastrar JSX. ÚNICA fuente de
// verdad de las medidas: el render importa de aquí para no divergir.
//
// FORMA POR-ELEMENTO (cf. HS3, NO árbol): cada cerramiento es una FILA apilada
// verticalmente. Dentro de la fila hay tres paneles en una rejilla fija:
//   ┌──────────────────────────┬───────────────────────────┐
//   │  SECCIÓN del muro por     │  BARRA U vs límite         │
//   │  capas (interior→exterior)├───────────────────────────┤
//   │                           │  DIAGRAMA de Glaser        │
//   └──────────────────────────┴───────────────────────────┘
// El bbox de cada panel se calcula aquí; `he1NativeSize` reproduce EXACTAMENTE
// el viewBox que `He1SVG` pinta vía `fitViewBox`, de modo que `scale = CW/nativeW`
// del raster PDF no deforme nada.
//
// feature-8 (ampliación RETRO-COMPATIBLE): además del layout multi (arriba),
// existe el MODO "UNO" — un único cerramiento con los tres paneles apilados en
// VERTICAL para el aside de 380 px (`calcularLayoutUno` / `he1NativeSizeUno` /
// `UNO_W`/`UNO_GAP`/`UNO_CONTENT_H`). Solo pantalla: el PDF sigue usando el
// layout multi congelado.

import type { SvgMode } from "../../lib/svg/helpers";
import type { HE1Result, ResultadoCerramientoHE1 } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Se exporta aquí
// (única fuente de verdad) para que toFichaData/renderFicha lo importen sin
// duplicar el literal. CONGELADO (Fase 3): debe ser EXACTAMENTE "he1-svg-pdf".
//
// CONTRATO AMPLIADO (feature-8, RETRO-COMPATIBLE): el id y la firma de
// `he1NativeSize` siguen CONGELADOS (la ficha PDF no cambia: el clon en
// mode="pdf" pinta TODOS los cerramientos como siempre). Se AÑADEN, solo para
// pantalla, el layout "uno" (un único cerramiento con sus tres paneles apilados
// en vertical para el aside de 380 px del patrón feature-7) vía
// `calcularLayoutUno` y `he1NativeSizeUno`, que la UI usa para dimensionar el
// alto del esquema cuando pasa `soloCerramientoId` a `He1SVG`.
export const HE1_PDF_SVG_ID = "he1-svg-pdf";

// -----------------------------------------------------------------------------
// Constantes de layout (en unidades del dominio, mm-ish). ÚNICA fuente de verdad
// compartida por el render (`He1SVG`, vía import) y por `he1NativeSize`. La
// rejilla arranca en (0,0); el bbox es siempre [0,0]→(contentW, contentH).
// -----------------------------------------------------------------------------
export const VB_PAD = 12; // padding de fitViewBox (única fuente de verdad)
export const BANDA_TOTALES = 18; // franja inferior para la línea de veredicto global

// -----------------------------------------------------------------------------
// Render RESPONSIVE (fix legibilidad D1). Por debajo de este ancho de render en
// px CSS (móvil ~360–390 px) las microetiquetas densas de la sección (espesor,
// λ/R) y de los ejes del Glaser encogen al escalar el viewBox y quedan
// ILEGIBLES. En "compacto" el SVG se reduce a ESQUEMA legible (formas + resaltado
// crítico multicanal + títulos + cifras grandes) y oculta esas microetiquetas;
// los datos finos NO se pierden (están en la tabla de la pestaña "Resultado").
// CRITERIO: solo aplica en pantalla; el clon PDF se rasteriza a `nativeW` (grande)
// y debe llevar SIEMPRE todo el detalle, así que nunca es compacto.
export const COMPACT_WIDTH = 520; // umbral de ancho de render (px CSS) para compacto

/** ¿Render compacto? Solo en pantalla y por debajo del umbral. PDF nunca. */
export function esCompacto(mode: SvgMode, width: number): boolean {
  return mode === "screen" && width < COMPACT_WIDTH;
}

// Fila por cerramiento.
export const ROW_GAP = 24; // separación vertical entre cerramientos apilados
export const ROW_TITLE_H = 14; // alto del título de la fila (nombre del cerramiento)
export const PANEL_GAP = 18; // separación horizontal entre columna izquierda y derecha

// Panel SECCIÓN (columna izquierda): franja de capas + ejes interior/exterior.
export const SEC_W = 240; // ancho total del dibujo de la sección
export const SEC_BODY_H = 90; // alto de la franja de capas (rectángulos)
export const SEC_LABEL_H = 40; // alto reservado bajo la franja para etiquetas de capa
export const SEC_AXIS_H = 12; // alto reservado arriba para las marcas interior/exterior
export const SEC_MIN_CAPA_W = 16; // ancho mínimo legible de una capa estrecha (lámina)

// Panel derecho (BARRA U arriba + GLASER abajo): misma anchura, dos sub-paneles.
export const RIGHT_W = 220;
export const UBAR_H = 56; // alto del sub-panel de la barra U vs límite
export const SUBPANEL_GAP = 16; // separación vertical entre barra U y Glaser
export const GLASER_H = 96; // alto del sub-panel del diagrama de Glaser

// Alto total del cuerpo de una fila (lo más alto de las dos columnas).
const SEC_TOTAL_H = SEC_AXIS_H + SEC_BODY_H + SEC_LABEL_H;
const RIGHT_TOTAL_H = UBAR_H + SUBPANEL_GAP + GLASER_H;
export const ROW_BODY_H = Math.max(SEC_TOTAL_H, RIGHT_TOTAL_H);
export const ROW_H = ROW_TITLE_H + ROW_BODY_H; // alto de una fila completa

// Ancho de contenido (las dos columnas + su separación).
export const CONTENT_W = SEC_W + PANEL_GAP + RIGHT_W;

// -----------------------------------------------------------------------------
// Geometría DETERMINISTA por cerramiento. Se calcula una vez y la consumen tanto
// `He1SVG` (para pintar) como `he1NativeSize` (para el tamaño nativo del viewBox
// del raster PDF), de modo que `scale = CW/nativeW` no deforme nada.
// -----------------------------------------------------------------------------

/** Rectángulo de una capa de la sección (en unidades del dominio). */
export interface CapaGeom {
  /** Índice de la capa en el cerramiento (de interior a exterior). */
  i: number;
  /** Esquina superior izquierda y dimensiones del rectángulo. */
  x: number;
  w: number;
  /** Centro X del rectángulo (para anclar etiquetas). */
  cx: number;
}

/** Geometría de la sección por capas de un cerramiento. */
export interface SeccionGeom {
  /** Origen (esquina sup-izq) del dibujo de la sección, relativo a la fila. */
  x0: number;
  y0: number;
  /** Banda de capas (rectángulos) y su altura. */
  bodyY: number;
  bodyH: number;
  capas: CapaGeom[];
}

/** Geometría del cerramiento (fila completa: título + sección + barra U + Glaser). */
export interface CerramientoGeom {
  cer: ResultadoCerramientoHE1;
  /** Y de la esquina superior de la fila. */
  rowY: number;
  /** Y del cuerpo (debajo del título). */
  bodyY: number;
  seccion: SeccionGeom;
  /** Origen del sub-panel de la barra U (esquina sup-izq). */
  ubar: { x: number; y: number; w: number; h: number };
  /** Origen del sub-panel del diagrama de Glaser. */
  glaser: { x: number; y: number; w: number; h: number };
}

export interface He1Layout {
  filas: CerramientoGeom[];
  contentW: number;
  contentH: number;
}

/**
 * Calcula los anchos de las capas de la sección a escala del espesor, con un
 * ancho MÍNIMO legible para capas muy finas (láminas/barreras). Función pura.
 * Devuelve la lista de geometrías de capa relativa al origen X de la sección.
 */
function distribuirCapas(cer: ResultadoCerramientoHE1, x0: number, anchoUtil: number): CapaGeom[] {
  const n = cer.capas.length;
  if (n === 0) return [];

  // Anchos brutos proporcionales al espesor; un suelo mínimo para legibilidad.
  const espesores = cer.capas.map((c) => (Number.isFinite(c.espesor_m) && c.espesor_m > 0 ? c.espesor_m : 0));
  const sumaEsp = espesores.reduce((a, b) => a + b, 0);

  // Ancho disponible tras reservar el mínimo de cada capa: lo reparte por espesor.
  const minTotal = n * SEC_MIN_CAPA_W;
  const flexible = Math.max(0, anchoUtil - minTotal);

  const anchos = espesores.map((e) => {
    const proporcional = sumaEsp > 0 ? (e / sumaEsp) * flexible : flexible / n;
    return SEC_MIN_CAPA_W + proporcional;
  });

  const capas: CapaGeom[] = [];
  let x = x0;
  for (let i = 0; i < n; i++) {
    const w = anchos[i];
    capas.push({ i, x, w, cx: x + w / 2 });
    x += w;
  }
  return capas;
}

/**
 * Geometría completa del módulo HE1, 100% determinista a partir del resultado.
 * Función pura compartida por el render y por `he1NativeSize`. Los cerramientos
 * se apilan verticalmente (como HS3 apila estancias).
 */
export function calcularLayout(result: HE1Result): He1Layout {
  const filas: CerramientoGeom[] = [];
  let y = 0;

  for (const cer of result.porCerramiento) {
    const rowY = y;
    const bodyY = rowY + ROW_TITLE_H;

    // --- Panel SECCIÓN (columna izquierda) -----------------------------------
    const secX0 = 0;
    const secBodyY = bodyY + SEC_AXIS_H;
    const capas = distribuirCapas(cer, secX0, SEC_W);
    const seccion: SeccionGeom = {
      x0: secX0,
      y0: bodyY,
      bodyY: secBodyY,
      bodyH: SEC_BODY_H,
      capas,
    };

    // --- Panel derecho: barra U (arriba) + Glaser (abajo) --------------------
    const rightX = SEC_W + PANEL_GAP;
    const ubar = { x: rightX, y: bodyY, w: RIGHT_W, h: UBAR_H };
    const glaser = {
      x: rightX,
      y: bodyY + UBAR_H + SUBPANEL_GAP,
      w: RIGHT_W,
      h: GLASER_H,
    };

    filas.push({ cer, rowY, bodyY, seccion, ubar, glaser });
    y += ROW_H + ROW_GAP;
  }

  // Quitar el último ROW_GAP sobrante (no hay fila después de la última).
  const contentH = filas.length > 0 ? y - ROW_GAP : 0;
  const contentW = CONTENT_W;

  return { filas, contentW, contentH };
}

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por la ficha PDF
// para `scale = CW / nativeW` del raster). Reproduce EXACTAMENTE lo que `He1SVG`
// calcula vía `fitViewBox(esquinas, VB_PAD)` + BANDA_TOTALES, derivado del layout
// del resultado. La rejilla arranca en (0,0). CONGELADO (Fase 3): firma estable
// (feature-8 la mantiene intacta; el modo "uno" tiene su propio helper abajo).
// -----------------------------------------------------------------------------
export function he1NativeSize(result: HE1Result): { nativeW: number; nativeH: number } {
  const { contentW, contentH } = calcularLayout(result);
  return {
    nativeW: contentW + 2 * VB_PAD,
    nativeH: contentH + 2 * VB_PAD + BANDA_TOTALES,
  };
}

// =============================================================================
// MODO "UNO" (feature-8, SOLO PANTALLA): un único cerramiento con sus TRES
// paneles APILADOS EN VERTICAL (sección arriba → barra U → Glaser abajo),
// pensado para el aside de ~350 px de ancho del patrón feature-7. El modo "pdf"
// NUNCA usa este layout (la ficha sigue pintando todos los cerramientos con
// `calcularLayout`/`he1NativeSize`). Ampliación RETRO-COMPATIBLE del contrato.
// =============================================================================

// Ancho de la columna única del modo uno. Menor que SEC_W para que, al escalar
// el viewBox a ~350 px CSS, los cuerpos de texto queden legibles (escala ~1,6×).
export const UNO_W = 190;
// Separación vertical entre los tres paneles apilados.
export const UNO_GAP = 14;
// Alto total del contenido del modo uno (título + sección + barra U + Glaser).
// CONSTANTE: los paneles tienen alto fijo, así que no depende del cerramiento.
export const UNO_CONTENT_H =
  ROW_TITLE_H + SEC_TOTAL_H + UNO_GAP + UBAR_H + UNO_GAP + GLASER_H;

/**
 * Geometría del modo uno: la fila (CerramientoGeom) del cerramiento pedido con
 * los tres paneles apilados en vertical, arrancando en (0,0). Devuelve `null`
 * si el cerramiento no existe en el resultado (la UI puede pasar una selección
 * obsoleta durante un render intermedio). Función PURA y determinista.
 */
export function calcularLayoutUno(
  result: HE1Result,
  cerramientoId: string,
): CerramientoGeom | null {
  const cer = result.porCerramiento.find((c) => c.id === cerramientoId);
  if (cer === undefined) return null;

  const rowY = 0;
  const bodyY = rowY + ROW_TITLE_H;

  // Panel SECCIÓN (arriba), a todo el ancho de la columna única.
  const seccion: SeccionGeom = {
    x0: 0,
    y0: bodyY,
    bodyY: bodyY + SEC_AXIS_H,
    bodyH: SEC_BODY_H,
    capas: distribuirCapas(cer, 0, UNO_W),
  };

  // Barra U (centro) y Glaser (abajo), apilados bajo la sección.
  const yUbar = bodyY + SEC_TOTAL_H + UNO_GAP;
  const ubar = { x: 0, y: yUbar, w: UNO_W, h: UBAR_H };
  const glaser = { x: 0, y: yUbar + UBAR_H + UNO_GAP, w: UNO_W, h: GLASER_H };

  return { cer, rowY, bodyY, seccion, ubar, glaser };
}

/**
 * Tamaño nativo del viewBox del modo uno (lo consume la UI para dimensionar el
 * alto del esquema del aside, igual que hace con `he1NativeSize` en multi).
 * El contenido es de alto FIJO (paneles de alto constante): los argumentos se
 * conservan por paridad de firma con `he1NativeSize` y estabilidad futura.
 */
export function he1NativeSizeUno(
  _result: HE1Result,
  _cerramientoId: string,
): { nativeW: number; nativeH: number } {
  return {
    nativeW: UNO_W + 2 * VB_PAD,
    nativeH: UNO_CONTENT_H + 2 * VB_PAD,
  };
}
