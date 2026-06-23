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
  // Modo avanzado: el diagrama es la red colectiva (árbol), con su propio tamaño.
  if (result.red) return hs3RedNativeSize(result.red);
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

// -----------------------------------------------------------------------------
// Geometría de la RED colectiva (modo avanzado): columnas verticales, una por
// colectivo. ÚNICA fuente de verdad del tamaño: `RedDiagram` (en svg.tsx) importa
// estas constantes y autoencuadra con `fitViewBox(esquinas, R_PAD)`, que produce
// EXACTAMENTE el bbox cerrado de `hs3RedNativeSize`. Así el raster PDF no deforma.
// -----------------------------------------------------------------------------
export const R_ORIGIN_X = 14;
export const R_ORIGIN_Y = 16;
export const R_COL_W = 86; // paso horizontal entre columnas (con R_GAP_X)
export const R_GAP_X = 30;
export const R_NODE_W = 84; // ancho de la caja-nodo
export const R_NODE_H = 36; // alto de la caja-nodo
export const R_GAP_Y = 16; // separación vertical entre nodos
export const R_PAD = 10; // padding de fitViewBox

/** Tamaño nativo del viewBox de la red (bbox de las cajas-nodo + R_PAD). */
export function hs3RedNativeSize(red: NonNullable<HS3Result["red"]>): {
  nativeW: number;
  nativeH: number;
} {
  const J = red.colectivos.length;
  const maxNodos = red.colectivos.reduce((m, c) => Math.max(m, c.tramos.length), 0);
  // Red degenerada (sin colectivos): caja única de respaldo (igual que RedDiagram).
  const contentW = J >= 1 ? (J - 1) * (R_COL_W + R_GAP_X) + R_NODE_W : R_NODE_W;
  const contentH =
    maxNodos >= 1 ? (maxNodos - 1) * (R_NODE_H + R_GAP_Y) + R_NODE_H : R_NODE_H;
  return { nativeW: contentW + 2 * R_PAD, nativeH: contentH + 2 * R_PAD };
}
