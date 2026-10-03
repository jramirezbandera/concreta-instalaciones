// =============================================================================
// resumen — feature-6 T5.3: resumen del resultado de HS3 para la banda de
// veredicto de la cabecera (ModuleLayout). Extrae LITERALMENTE el contenido de la antigua
// banda inline de ui.tsx (sujeto + categoría de dormitorios + métricas de
// caudales) para que la migración al shell no cambie ni una letra de lo que ve
// el usuario.
//
// Lib PURA (cero React/DOM): misma entrada → mismo output. No lleva `cita`
// porque la banda inline anterior no mostraba cita alguna — la cabecera de
// ModuleLayout cae entonces en su default (la edición del DB del registry).
// =============================================================================

import type { ResumenVeredicto } from "../../components/justificacion/ModuleLayout";
import { fmt } from "../../lib/units/format";
import type { HS3Result } from "./calc";

/**
 * Resumen para la banda del shell. Paridad total con la banda inline anterior:
 * "Ventilación de la vivienda (cat. 3+) — CUMPLE (extracción 33 l/s ·
 * admisión 33 l/s)".
 */
export function resumenHs3(r: HS3Result): ResumenVeredicto {
  return {
    veredicto: r.veredictoGlobal,
    sujeto: "Ventilación de la vivienda",
    contexto: `cat. ${r.categoriaDormitorios}`,
    metricas:
      `extracción ${fmt(r.totalExtraccion_l_s, "l/s")} · admisión ` +
      `${fmt(r.totalAdmision_l_s, "l/s")}`,
  };
}
