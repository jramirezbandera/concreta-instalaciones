// DB-HS4 — Metadatos + geometría NO-COMPONENTE del render SVG (sin JSX). Separado
// de `svg.tsx` para que ese archivo exporte SOLO componentes React (regla
// `react-refresh/only-export-components`): aquí viven el id del clon PDF, las
// constantes de layout, la estructura geométrica del árbol (`calcularArbol`,
// función PURA) y `hs4NativeSize`. Lo consumen el render (`svg.tsx`), la ficha PDF
// (`./ficha.ts`) y la pantalla (`./ui.tsx`) sin arrastrar JSX. ÚNICA fuente de
// verdad de las medidas: el render importa de aquí para no divergir.

import type { HS4Result, ResultadoTramoHS4 } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Se exporta aquí
// (única fuente de verdad) para que toFichaData/renderFicha lo importen sin
// duplicar el literal. CONGELADO (Fase 2): debe ser EXACTAMENTE "hs4-svg-pdf".
export const HS4_PDF_SVG_ID = "hs4-svg-pdf";

// -----------------------------------------------------------------------------
// Layout determinista (sin Math.random, sin Date): diagrama jerárquico en
// columna. El árbol fluye aguas abajo de las hojas (derivaciones a aparato, en
// lo alto) hacia la raíz (acometida, en la base):
//   • profundidad (depth) = distancia a la raíz → fija la FILA (y). La raíz
//     (acometida) va en la base; cuanto más aguas arriba, más alto.
//   • orden de hojas (recorrido estable de hermanos) → fija la COLUMNA (x). Cada
//     padre se centra sobre el rango de columnas de sus hijos.
// La rejilla arranca en (0,0); el bbox es siempre [0,0]→(contentW, contentH).
// -----------------------------------------------------------------------------
export const COL_W = 88; // ancho de columna (separación horizontal entre hojas)
export const ROW_H = 70; // alto de fila (separación vertical entre niveles)
export const NODE_W = 78; // ancho útil de la caja de etiquetas de un tramo
export const VB_PAD = 12; // padding de fitViewBox (única fuente de verdad)
export const BANDA_TOTALES = 18; // franja inferior para la línea de totales

// Geometría de la caja-tramo (relativa al centro `cy` del nodo), única fuente de
// verdad compartida por `CajaTramo`, `Conexion` y el encuadre del viewBox.
export const NODE_TOP_DY = -ROW_H / 2 + 4; // borde superior de la caja respecto a cy
export const NODE_BOX_H = 46; // alto del recuadro de etiquetas
export const NODE_BOT_DY = NODE_TOP_DY + NODE_BOX_H; // borde inferior respecto a cy

// -----------------------------------------------------------------------------
// Estructura geométrica del árbol, derivada SOLO del resultado (determinista).
// Se calcula una vez y la consumen tanto `HS4SVG` (para pintar) como
// `hs4NativeSize` (para el tamaño nativo del viewBox del raster PDF), de modo
// que `scale = CW / nativeW` no deforme nada.
// -----------------------------------------------------------------------------
export interface Nodo {
  t: ResultadoTramoHS4;
  depth: number; // distancia a la raíz (0 = raíz/acometida)
  col: number; // columna (índice de hoja o media de hijos)
  cx: number; // centro x en unidades del dominio
  cy: number; // centro y en unidades del dominio
}

export interface ArbolGeom {
  nodos: Nodo[];
  porId: Map<string, Nodo>;
  maxDepth: number;
  nCols: number;
  contentW: number;
  contentH: number;
}

/**
 * Calcula la geometría del árbol de tramos de forma 100% determinista a partir
 * del resultado. Función pura compartida por el render y por `hs4NativeSize`.
 * Topología por `parentId`/`childrenIds` (mismo patrón que HS5).
 */
export function calcularArbol(result: HS4Result): ArbolGeom {
  const tramos = result.porTramo;
  const porTramoId = new Map<string, ResultadoTramoHS4>();
  for (const t of tramos) porTramoId.set(t.id, t);

  // Raíces = tramos sin padre (o cuyo padre no existe en el resultado).
  const raices = tramos.filter((t) => t.parentId === null || !porTramoId.has(t.parentId));

  // Profundidad (distancia a la raíz) por recorrido descendente desde cada raíz.
  const depthPorId = new Map<string, number>();
  const asignarDepth = (id: string, depth: number, visto: Set<string>) => {
    if (visto.has(id)) return; // corta ciclos (el motor ya los marca)
    visto.add(id);
    depthPorId.set(id, depth);
    const t = porTramoId.get(id);
    if (!t) return;
    for (const c of t.childrenIds) {
      if (porTramoId.has(c)) asignarDepth(c, depth + 1, visto);
    }
  };
  for (const r of raices) asignarDepth(r.id, 0, new Set());
  // Tramos no alcanzables (p.ej. por ciclo): profundidad 0 para no perderlos.
  for (const t of tramos) if (!depthPorId.has(t.id)) depthPorId.set(t.id, 0);

  const maxDepth = tramos.reduce((mx, t) => Math.max(mx, depthPorId.get(t.id) ?? 0), 0);

  // Columna: recorrido en orden de las hojas (asigna columnas crecientes); cada
  // padre se centra sobre el rango de columnas de sus hijos. Determinista por el
  // orden estable de `childrenIds`.
  const colPorId = new Map<string, number>();
  let proximaHoja = 0;
  const asignarCol = (id: string, visto: Set<string>): number => {
    if (visto.has(id)) return colPorId.get(id) ?? proximaHoja;
    visto.add(id);
    const t = porTramoId.get(id);
    const hijos = (t?.childrenIds ?? []).filter((c) => porTramoId.has(c));
    let col: number;
    if (hijos.length === 0) {
      col = proximaHoja;
      proximaHoja += 1;
    } else {
      const cols = hijos.map((c) => asignarCol(c, visto));
      col = (Math.min(...cols) + Math.max(...cols)) / 2;
    }
    colPorId.set(id, col);
    return col;
  };
  for (const r of raices) asignarCol(r.id, new Set());
  for (const t of tramos) if (!colPorId.has(t.id)) asignarCol(t.id, new Set());

  const nCols = Math.max(1, proximaHoja);

  // y por profundidad: la raíz (depth 0) en la base, las hojas arriba.
  const nodos: Nodo[] = tramos.map((t) => {
    const depth = depthPorId.get(t.id) ?? 0;
    const col = colPorId.get(t.id) ?? 0;
    const cx = col * COL_W + NODE_W / 2;
    const cy = (maxDepth - depth) * ROW_H + ROW_H / 2;
    return { t, depth, col, cx, cy };
  });

  const porId = new Map<string, Nodo>();
  for (const nd of nodos) porId.set(nd.t.id, nd);

  const contentW = (nCols - 1) * COL_W + NODE_W;
  const contentH = (maxDepth + 1) * ROW_H;

  return { nodos, porId, maxDepth, nCols, contentW, contentH };
}

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por la ficha PDF
// para `scale = CW / nativeW` del raster). Reproduce EXACTAMENTE lo que `HS4SVG`
// calcula vía `fitViewBox(esquinas, VB_PAD)` + BANDA_TOTALES, derivado del árbol
// del resultado. La rejilla arranca en (0,0). CONGELADO (Fase 2): firma estable.
// -----------------------------------------------------------------------------
export function hs4NativeSize(result: HS4Result): { nativeW: number; nativeH: number } {
  const { contentW, contentH } = calcularArbol(result);
  return {
    nativeW: contentW + 2 * VB_PAD,
    nativeH: contentH + 2 * VB_PAD + BANDA_TOTALES,
  };
}
