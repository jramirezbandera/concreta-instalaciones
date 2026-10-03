// =============================================================================
// resumen — feature-6 T5.4: resumen del resultado de HS4 para la banda de
// veredicto de la cabecera (ModuleLayout). Extrae LITERALMENTE el contenido de la antigua
// banda inline de ui.tsx (sujeto + contexto "agua fría" + métricas de caudal y
// presión crítica) para que la migración al shell no cambie ni una letra de lo
// que ve el usuario.
//
// Lib PURA (cero React/DOM): misma entrada → mismo output. No lleva `cita`
// porque la banda inline anterior no mostraba cita alguna — la cabecera de
// ModuleLayout cae entonces en su default (la edición del DB del registry).
// =============================================================================

import type { ResumenVeredicto } from "../../components/justificacion/ModuleLayout";
import { fmt } from "../../lib/units/format";
import type { HS4Result } from "./calc";

/**
 * Presión mínima exigida en el punto de consumo crítico [kPa] o `null` si no
 * hay punto crítico. Misma lectura que hacía la banda inline (el motor ya la
 * calcula por aparato; aquí solo se lee la del crítico).
 */
export function presionMinCritico(result: HS4Result): number | null {
  const apCritico =
    result.puntoCriticoId != null
      ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
      : undefined;
  return apCritico?.presionMinExigida_kPa ?? null;
}

/**
 * Resumen para la banda del shell. Paridad total con la banda inline anterior:
 * "Red de suministro (agua fría) — CUMPLE (0,52 dm³/s de cálculo · P crítica
 * 180 kPa / 100 kPa mín.)" — con el sufijo "· grupo de presión necesario"
 * cuando el motor lo marca, igual que la banda antigua.
 */
export function resumenHs4(r: HS4Result): ResumenVeredicto {
  const pMin = presionMinCritico(r);
  return {
    veredicto: r.veredictoGlobal,
    sujeto: "Red de suministro",
    contexto: "agua fría",
    metricas:
      `${fmt(r.caudalTotal_dm3_s, "dm³/s", 2)} de cálculo · P crítica ` +
      `${fmt(r.presionCritica_kPa, "kPa", 0)}` +
      `${pMin != null ? ` / ${fmt(pMin, "kPa", 0)} mín.` : ""}` +
      `${r.grupoPresionNecesario ? " · grupo de presión necesario" : ""}`,
  };
}
