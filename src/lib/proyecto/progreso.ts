import type { EstadoJustificacion, JustificacionKey, Progreso, Proyecto } from "./tipos";
import { evaluarExpediente, type EstadoObra } from "../obra/evaluar";

// =============================================================================
// Progreso derivado de una justificación (feature-6 §A, UX-RECONCEPT §3).
// El progreso NUNCA se marca a mano: se deriva. Desde feature-16 se CALCULA con
// el motor de cada módulo sobre el expediente (`evaluarExpediente`), en vez de
// leer el último veredicto que dejaba el módulo al abrirse: así no se queda
// viejo cuando cambia El edificio. Lib pura: sin React/DOM, sin Date.now, sin
// localStorage.
// =============================================================================

/** Progreso de cada estado de La obra (solo cuenta para las que aplican). */
const PROGRESO: Record<EstadoObra, Progreso> = {
  cumple: "cumple",
  revisar: "cumple",
  no_cumple: "no_cumple",
  sin_datos: "sin_iniciar",
  error: "en_curso",
  no_aplica: "sin_iniciar",
  externo: "sin_iniciar",
  pronto: "sin_iniciar",
};

/**
 * Estado computado de una justificación: las dos dimensiones ortogonales (§3)
 * — aplicabilidad efectiva (base + forzado del proyectista) × progreso — y el
 * veredicto cuando el progreso es concluyente (`ok`, o `warn` si cumple con
 * avisos sin revisar; `fail`).
 */
export function estadoDe(p: Proyecto, key: JustificacionKey): EstadoJustificacion {
  const ev = evaluarExpediente(p).porClave[key];
  if (!ev) return { aplicabilidad: "aplica", forzada: false, progreso: "sin_iniciar" };
  const progreso = PROGRESO[ev.estado];
  const concluyente = progreso === "cumple" || progreso === "no_cumple";
  return {
    aplicabilidad: ev.aplicabilidad,
    forzada: ev.forzada,
    ...(ev.nota !== undefined ? { nota: ev.nota } : {}),
    ...(ev.cita !== undefined ? { cita: ev.cita } : {}),
    progreso,
    ...(concluyente && ev.veredicto !== undefined ? { veredicto: ev.veredicto } : {}),
  };
}

/** Recuento del expediente (feature-6 §D). */
export interface ResumenProyecto {
  /** Justificaciones exigibles: aplicabilidad ∈ {aplica, aplica_reformado, aplica_flexibilidad}. */
  aplicables: number;
  /** Desglose de progreso SOLO sobre las aplicables. */
  cumplen: number;
  noCumplen: number;
  enCurso: number;
  sinIniciar: number;
  /** Fuera de ámbito. */
  noAplica: number;
  /** Justificadas con otra herramienta (HULC, Concreta estructura). */
  externas: number;
}

/**
 * Resumen del proyecto sobre TODAS las justificaciones del mapa de cobertura.
 * `no_aplica` y `externo` no cuentan como aplicables ni entran en el desglose
 * de progreso.
 */
export function resumenProyecto(p: Proyecto): ResumenProyecto {
  const r: ResumenProyecto = {
    aplicables: 0, cumplen: 0, noCumplen: 0, enCurso: 0, sinIniciar: 0,
    noAplica: 0, externas: 0,
  };
  for (const ev of evaluarExpediente(p).justificaciones) {
    if (ev.aplicabilidad === "no_aplica") { r.noAplica++; continue; }
    if (ev.aplicabilidad === "externo") { r.externas++; continue; }
    r.aplicables++;
    switch (PROGRESO[ev.estado]) {
      case "cumple": r.cumplen++; break;
      case "no_cumple": r.noCumplen++; break;
      case "en_curso": r.enCurso++; break;
      case "sin_iniciar": r.sinIniciar++; break;
    }
  }
  return r;
}
