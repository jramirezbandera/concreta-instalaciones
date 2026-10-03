// =============================================================================
// resumen — feature-6 T5.1: resumen del resultado de HS5 para la banda de
// veredicto del ModuleShell. Extrae LITERALMENTE el contenido de la antigua
// banda inline de ui.tsx (sujeto + contexto de uso + métricas de UD/Ø) para que
// la migración al shell no cambie ni una letra de lo que ve el usuario.
//
// Lib PURA (cero React/DOM): misma entrada → mismo output. No lleva `cita`
// porque la banda inline anterior no mostraba cita alguna — la BandaVeredicto
// del shell cae entonces en su default (la edición del DB del registry).
// =============================================================================

import type { ResumenVeredicto } from "../../components/justificacion/ModuleShell";
import { fmt } from "../../lib/units/format";
import type { HS5Result, TipoTramo } from "./calc";

/** Ø del mayor tramo de un tipo (mm) o `null` si no hay / no dimensiona. */
export function diametroDe(result: HS5Result, tipo: TipoTramo): number | null {
  const ds = result.porTramo
    .filter((t) => t.tipo === tipo && t.diametro_mm != null)
    .map((t) => t.diametro_mm as number);
  return ds.length ? Math.max(...ds) : null;
}

/**
 * Resumen para la banda del shell. Paridad total con la banda inline anterior:
 * "Red de evacuación (uso privado) — CUMPLE (24 UD totales · bajante Ø90 mm ·
 * colector Ø110 mm)".
 */
export function resumenHs5(r: HS5Result): ResumenVeredicto {
  const dBajante = diametroDe(r, "bajante");
  const dColector = diametroDe(r, "colector");
  return {
    veredicto: r.veredictoGlobal,
    sujeto: "Red de evacuación",
    contexto: r.uso === "privado" ? "uso privado" : "uso público",
    metricas:
      `${fmt(r.udTotales, "UD")} totales · bajante ` +
      `${dBajante == null ? "Ø —" : `Ø${fmt(dBajante, "mm", 0)}`} · colector ` +
      `${dColector == null ? "Ø —" : `Ø${fmt(dColector, "mm", 0)}`}`,
  };
}
