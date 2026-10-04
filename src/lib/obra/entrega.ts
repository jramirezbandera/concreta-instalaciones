// =============================================================================
// «Antes de entregar» y el recuento de los entregables (feature-16 §C y §D).
// PURO.
//
// Antes de entregar: lo que no cumple primero y después los avisos sin
// revisar, cada uno con el código de su módulo y su texto, tal como los
// redacta el módulo. Los entregables cuentan lo que está listo: lo que no
// cumple no se da por bueno.
// =============================================================================

import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, type EvaluacionJustificacion } from "./evaluar";

export interface PendienteEntrega {
  /** Estable: `<clave>:<id>`. */
  id: string;
  key: JustificacionKey;
  codigo: string;
  /** Subruta del módulo, para ir a verlo. */
  ruta?: string;
  /** `no_cumple` va en rojo; `revisar`, en ámbar. */
  tipo: "no_cumple" | "revisar";
  titulo: string;
  detalle: string;
  elementoId?: string;
}

/** Lo que queda por mirar antes de entregar: lo que no cumple y luego los avisos. */
export function antesDeEntregar(p: Proyecto): PendienteEntrega[] {
  const evs = evaluarExpediente(p).justificaciones;
  const base = (ev: EvaluacionJustificacion) => ({
    key: ev.key,
    codigo: ev.entrada.codigo,
    ...(ev.entrada.route ? { ruta: ev.entrada.route } : {}),
  });
  const fallos = evs.flatMap((ev) =>
    ev.incumplimientos.map(
      (i): PendienteEntrega => ({ id: `${ev.key}:${i.id}`, ...base(ev), tipo: "no_cumple", titulo: i.titulo, detalle: i.detalle, ...(i.elementoId ? { elementoId: i.elementoId } : {}) }),
    ),
  );
  const avisos = evs.flatMap((ev) =>
    ev.avisos.map(
      (a): PendienteEntrega => ({ id: `${ev.key}:${a.id}`, ...base(ev), tipo: "revisar", titulo: a.titulo, detalle: a.detalle, ...(a.elementoId ? { elementoId: a.elementoId } : {}) }),
    ),
  );
  return [...fallos, ...avisos];
}

/** Recuento de un entregable: cuántas piezas están listas y cuáles no cumplen. */
export interface RecuentoEntregable {
  listos: number;
  total: number;
  /** Códigos de lo que no cumple (o no calcula): «HE1». */
  noCumplen: string[];
}

export interface Entregables {
  /** Memoria CTE: los módulos que aplican más los «no aplica» con su párrafo. */
  memoria: RecuentoEntregable;
  /** Fichas del anejo: una por módulo calculado. */
  fichas: RecuentoEntregable;
  /** Esquemas para el plano (DXF): saneamiento (HS5) y fontanería (HS4). */
  esquemas: RecuentoEntregable & { claves: JustificacionKey[] };
}

/** Los módulos con esquema para el plano, en el orden en que se entregan. */
export const CLAVES_ESQUEMA: readonly JustificacionKey[] = ["hs5", "hs4"];

const CALCULADA = new Set(["cumple", "revisar", "no_cumple", "error"]);
const LISTA = new Set(["cumple", "revisar"]);

function recuento(evs: EvaluacionJustificacion[]): RecuentoEntregable {
  return {
    listos: evs.filter((ev) => LISTA.has(ev.estado) || ev.estado === "no_aplica").length,
    total: evs.length,
    noCumplen: evs.filter((ev) => ev.estado === "no_cumple" || ev.estado === "error").map((ev) => ev.entrada.codigo),
  };
}

export function entregables(p: Proyecto): Entregables {
  const evs = evaluarExpediente(p).justificaciones;
  const calculadas = evs.filter((ev) => CALCULADA.has(ev.estado));
  const esquemas = CLAVES_ESQUEMA.flatMap((k) => calculadas.filter((ev) => ev.key === k));
  return {
    memoria: recuento(evs.filter((ev) => CALCULADA.has(ev.estado) || ev.estado === "no_aplica")),
    fichas: recuento(calculadas),
    esquemas: { ...recuento(esquemas), claves: esquemas.filter((ev) => LISTA.has(ev.estado)).map((ev) => ev.key) },
  };
}
