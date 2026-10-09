// =============================================================================
// El párrafo de alcance de una justificación que se justifica (feature-27,
// paso 7). PURO. En una obra existente, lo que la memoria, el anejo y la ficha
// dicen antes del cálculo: a qué se aplica («a lo intervenido»), con qué
// flexibilidad, o que se aplica al edificio entero por un cambio de uso
// característico. En obra nueva no hay nada que decir.
// =============================================================================

import type { FichaData } from "../pdf/renderFicha";
import { aplicabilidadEfectiva } from "../proyecto/aplicabilidad";
import type { JustificacionKey, Proyecto } from "../proyecto/tipos";

export interface NotaAlcance {
  parrafo: string;
  cita?: string;
}

/**
 * El párrafo de alcance, si lo hay. No lo hay en las que no aplican o son
 * externas (tienen su propio apartado), en obra nueva sin forzar, ni mientras el
 * asistente de alcance está sin responder (la nota «pendiente» no va a la memoria).
 */
export function notaAlcance(p: Proyecto, key: JustificacionKey): NotaAlcance | null {
  const ap = aplicabilidadEfectiva(p, key);
  if (ap.aplicabilidad === "no_aplica" || ap.aplicabilidad === "externo" || !ap.nota) return null;
  if (!ap.forzada && (p.datosGenerales.intervencion === "obra_nueva" || !p.datosGenerales.alcance)) return null;
  return { parrafo: ap.nota, ...(ap.cita ? { cita: ap.cita } : {}) };
}

/** La ficha con el párrafo de alcance delante de sus observaciones. */
export function fichaConAlcance<T extends Pick<FichaData, "observaciones">>(data: T, p: Proyecto, key: JustificacionKey): T {
  const n = notaAlcance(p, key);
  if (!n) return data;
  return { ...data, observaciones: [`Alcance: ${n.parrafo}`, ...(data.observaciones ?? [])] };
}
