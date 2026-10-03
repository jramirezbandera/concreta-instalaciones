import type { ReactNode } from "react";
import type { Veredicto } from "../../lib/proyecto/tipos";

// =============================================================================
// Tipos del outliner (feature-7 §A) — treegrid genérico y agnóstico del dominio.
//
// El componente recibe la PROYECCIÓN PLANA Y ORDENADA del árbol (filas con
// `depth`) y devuelve INTENCIONES (onAdd/onNest/onUnnest/onRemove/onSelect/
// onHover). La semántica del árbol (`parentId`, ciclos, quién puede colgar de
// quién) vive en el módulo que lo usa; el outliner no conoce `parentId`.
// =============================================================================

/** Columna del treegrid. `width` es CSS (p.ej. "80px", "40%"). */
export interface OutlinerColumna {
  key: string;
  header: string;
  align?: "left" | "right";
  width?: string;
}

/** Celda de una fila, alineada posicionalmente con `columnas`. */
export type OutlinerCelda =
  | { tipo: "texto"; valor: string; dim?: boolean; mono?: boolean }
  // icono + texto, nunca solo color; `extra` añade marcadores textuales junto al
  // estado ("◆ crítico", "v fuera de rango"…) en el mismo canal multicolor+texto.
  | { tipo: "estado"; veredicto: Veredicto; extra?: string }
  | { tipo: "nombre"; valor: string; onChange(v: string): void } // editable inline
  | {
      tipo: "numero";
      valor: number | undefined;
      onChange(v: number): void;
      min?: number;
      step?: number;
      unidad?: string;
    }
  | {
      tipo: "select";
      valor: string;
      opciones: { value: string; label: string }[];
      onChange(v: string): void;
    };

/** Fila del treegrid (proyección plana: el orden del array ES el orden visual). */
export interface OutlinerFila {
  id: string;
  depth: number;
  /** "tramo" | "aparato" — estilo (aparatos en tono dim). */
  kind: string;
  /** ¿Responde a Tab/Shift-Tab? (si no, Tab sigue el flujo normal del navegador). */
  anidable: boolean;
  borrable: boolean;
  /** Alineadas con `columnas`. */
  celdas: OutlinerCelda[];
}

export interface OutlinerProps {
  columnas: OutlinerColumna[];
  filas: OutlinerFila[];
  selectedId: string | null;
  onSelect(id: string | null): void;
  onHover?(id: string | null): void;
  /** Enter / botón "+ Añadir". `afterId = null` → añadir al final/raíz. */
  onAdd(afterId: string | null): void;
  /** Tab con fila `anidable`. */
  onNest(id: string): void;
  /** Shift-Tab con fila `anidable`. */
  onUnnest(id: string): void;
  /** Botón papelera / tecla Supr con fila seleccionada `borrable`. */
  onRemove(id: string): void;
  /** Texto del enlace de añadir, p.ej. "+ Añadir tramo". */
  etiquetaAdd: string;
  /** Presets u otras acciones, a la derecha del footer. */
  toolbar?: ReactNode;
}
