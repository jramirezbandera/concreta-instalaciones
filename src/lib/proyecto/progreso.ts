import type {
  EstadoJustificacion,
  JustificacionEnProyecto,
  JustificacionKey,
  Progreso,
  Proyecto,
} from "./tipos";
import { aplicabilidadEfectiva } from "./aplicabilidad";
import { justificacionRegistry } from "../../data/justificacionRegistry";

// =============================================================================
// Progreso derivado de una justificación (feature-6 §A, UX-RECONCEPT §3).
// El progreso NUNCA se marca a mano: se deriva de lo que el proyecto persiste
// (inputs guardados + cache del último veredicto del motor). Lib pura: sin
// React/DOM, sin Date.now, sin localStorage.
// =============================================================================

/**
 * Deriva el progreso de una justificación a partir de su estado persistido:
 *   - sin entrada, sin `inputs` o `inputs` vacío → `sin_iniciar`
 *   - `inputs` guardados sin veredicto cacheado, o veredicto `neutral` → `en_curso`
 *   - veredicto `ok`/`warn` → `cumple` (el matiz warn lo tinta el chip con el
 *     veredicto crudo, ver `EstadoJustificacion.veredicto`)
 *   - veredicto `fail` → `no_cumple`
 */
export function progresoDe(j: JustificacionEnProyecto | undefined): Progreso {
  if (!j?.inputs || Object.keys(j.inputs).length === 0) return "sin_iniciar";
  const veredicto = j.resultadoCache?.veredicto;
  if (veredicto === undefined || veredicto === "neutral") return "en_curso";
  return veredicto === "fail" ? "no_cumple" : "cumple";
}

/**
 * Estado computado de una justificación para la checklist del dashboard:
 * combina las dos dimensiones ortogonales (§3) — `aplicabilidadEfectiva`
 * (base + forzado del proyectista) × `progresoDe` — y propaga el veredicto
 * CRUDO del cache cuando el progreso es concluyente (`cumple`/`no_cumple`),
 * para que el chip pueda distinguir `ok` de `warn`.
 */
export function estadoDe(p: Proyecto, key: JustificacionKey): EstadoJustificacion {
  const ap = aplicabilidadEfectiva(p, key);
  const j = p.justificaciones[key];
  const progreso = progresoDe(j);
  const concluyente = progreso === "cumple" || progreso === "no_cumple";
  return {
    aplicabilidad: ap.aplicabilidad,
    forzada: ap.forzada,
    ...(ap.nota !== undefined ? { nota: ap.nota } : {}),
    ...(ap.cita !== undefined ? { cita: ap.cita } : {}),
    progreso,
    ...(concluyente ? { veredicto: j?.resultadoCache?.veredicto } : {}),
  };
}

/** Recuento del expediente para la tarjeta Anejo del dashboard (feature-6 §D). */
export interface ResumenProyecto {
  /** Justificaciones exigibles: aplicabilidad ∈ {aplica, aplica_reformado, aplica_flexibilidad}. */
  aplicables: number;
  /** Desglose de progreso SOLO sobre las aplicables. */
  cumplen: number;
  noCumplen: number;
  enCurso: number;
  sinIniciar: number;
  /** Fuera de ámbito (grupo "No aplicables" de la checklist). */
  noAplica: number;
  /** Justificadas con otra herramienta (HULC, Concreta estructura). */
  externas: number;
}

/**
 * Claves de justificación reales del expediente: el registry es la fuente de
 * verdad (feature-6 §C), excluyendo entradas solo-desarrollo (`dev`, smoke).
 */
function clavesJustificacion(): JustificacionKey[] {
  return justificacionRegistry
    .filter((e) => !e.dev)
    .map((e) => e.key as JustificacionKey);
}

/**
 * Resumen del proyecto sobre TODAS las justificaciones del mapa de cobertura.
 * `no_aplica` y `externo` no cuentan como aplicables ni entran en el desglose
 * de progreso (una `no_aplica` con inputs guardados sigue sin contar).
 */
export function resumenProyecto(p: Proyecto): ResumenProyecto {
  const r: ResumenProyecto = {
    aplicables: 0, cumplen: 0, noCumplen: 0, enCurso: 0, sinIniciar: 0,
    noAplica: 0, externas: 0,
  };
  for (const key of clavesJustificacion()) {
    const estado = estadoDe(p, key);
    if (estado.aplicabilidad === "no_aplica") { r.noAplica++; continue; }
    if (estado.aplicabilidad === "externo") { r.externas++; continue; }
    r.aplicables++;
    switch (estado.progreso) {
      case "cumple": r.cumplen++; break;
      case "no_cumple": r.noCumplen++; break;
      case "en_curso": r.enCurso++; break;
      case "sin_iniciar": r.sinIniciar++; break;
    }
  }
  return r;
}
