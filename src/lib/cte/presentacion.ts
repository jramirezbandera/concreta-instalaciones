// =============================================================================
// Presentación del contrato de resultado (feature-14 §H): lo que la cáscara
// común (franja, etiquetas, lista, memoria) necesita para pintar un elemento,
// ya redactado por la capa de textos de cada módulo. Solo tipos y constantes.
// =============================================================================

/**
 * ok · rv (por revisar) · ko (no cumple) · pv (previsto) · in (criterio) ·
 * dt (dato de partida) · fu (fuera de alcance). Los tres últimos se pintan igual.
 */
export type EstadoPresentacion = "ok" | "rv" | "ko" | "pv" | "in" | "dt" | "fu";

export const TEXTO_ESTADO: Record<EstadoPresentacion, string> = {
  ok: "cumple",
  rv: "por revisar",
  ko: "no cumple",
  pv: "previsto",
  in: "criterio",
  dt: "dato",
  fu: "fuera",
};

/** Lo seleccionado, para la franja bajo el dibujo. */
export interface DetalleElemento {
  /** Rótulo pequeño: «Colector · residuales». */
  clase: string;
  titulo: string;
  /** La cifra grande: «Ø110». */
  valor: string;
  /** Lo que acompaña a la cifra: «al 2 %», «3 plantas». */
  unidad?: string;
  estado: EstadoPresentacion;
  /** Lo que decide el valor, en una o dos frases. */
  manda: string;
  nota?: string;
  /** Las cuentas: «Recibe · 135 UD». */
  filas: { k: string; v: string }[];
  /** Capacidad usada, de 0 a 1. */
  uso?: number;
  /** «HS 5 · tabla 4.5». */
  cita: string;
}

/** Un trozo de párrafo de la memoria: texto, o una cifra que se resalta. */
export type Trozo = string | { v: string };

/** La memoria redactada de una justificación. */
export interface MemoriaDoc {
  titulo: string;
  /** «DB-HS 5». */
  norma: string;
  parrafos: Trozo[][];
  tabla?: { cabecera: string[]; filas: string[][] };
  /** La línea de fuentes del pie. */
  fuente: string;
}
