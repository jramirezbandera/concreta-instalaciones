// DB-HS3 — Metadatos NO-COMPONENTE del render SVG (sin JSX). Separado de `svg.tsx`
// para que ese archivo exporte SOLO componentes React (regla
// `react-refresh/only-export-components`): aquí viven la constante del id del
// clon PDF y la función del tamaño nativo del viewBox, que consumen la ficha PDF
// (./ficha.ts) y la pantalla (./ui.tsx) sin arrastrar JSX.
//
// La geometría de la rejilla (COLS/BOX_*/GAP_*/VB_PAD/BANDA_TOTALES) se duplica
// aquí como ÚNICA fuente de verdad del TAMAÑO nativo; `svg.tsx` importa de aquí
// esas constantes para pintar, de modo que `hs3NativeSize` y `HS3SVG` no puedan
// divergir.

import type { HS3Result } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Única fuente de
// verdad: lo importan ./ficha.ts (toFichaData) y ./ui.tsx (montaje del clon).
export const HS3_PDF_SVG_ID = "hs3-svg-pdf";

// -----------------------------------------------------------------------------
// Geometría de la rejilla (en unidades del dominio, mm-ish). ÚNICA fuente de
// verdad compartida por el render (`HS3SVG`, vía import) y por `hs3NativeSize`.
// La rejilla arranca en (0,0), así que el bbox es siempre [0,0]→(contentW, contentH).
// -----------------------------------------------------------------------------
export const COLS = 3;
export const BOX_W = 60; // ancho de caja
export const BOX_H = 42; // alto de caja
export const GAP_X = 18; // separación horizontal (deja sitio a las flechas de flujo)
export const GAP_Y = 22; // separación vertical
export const ORIGIN_X = 0;
export const ORIGIN_Y = 0;
export const VB_PAD = 10; // padding de fitViewBox (única fuente de verdad)
export const BANDA_TOTALES = 16; // franja inferior para la línea de totales

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por ./ficha.ts
// para `scale = CW / nativeW` del raster PDF). Reproduce EXACTAMENTE lo que
// `HS3SVG` calcula vía `fitViewBox(esquinas, VB_PAD)` + BANDA_TOTALES, derivado
// del nº de estancias del resultado. La rejilla arranca en (0,0), así que el
// bbox es siempre [0,0]→(contentW, contentH).
// -----------------------------------------------------------------------------
export function hs3NativeSize(result: HS3Result): { nativeW: number; nativeH: number } {
  const n = Math.max(1, result.porEstancia.length);
  const cols = Math.min(COLS, n);
  const rows = Math.ceil(n / COLS);
  const contentW = cols * BOX_W + (cols - 1) * GAP_X;
  const contentH = rows * BOX_H + (rows - 1) * GAP_Y;
  return {
    nativeW: contentW + 2 * VB_PAD,
    nativeH: contentH + 2 * VB_PAD + BANDA_TOTALES,
  };
}
