// =============================================================================
// resumen — feature-6 T5.5: resumen del resultado de HE1 para la banda de
// veredicto del ModuleShell. Extrae LITERALMENTE el contenido de la antigua
// banda inline de ui.tsx (sujeto + zona climática + nº de cerramientos + θe de
// enero) para que la migración al shell no cambie ni una letra de lo que ve el
// usuario.
//
// Lib PURA (cero React/DOM): misma entrada → mismo output. No lleva `cita`
// porque la banda inline anterior no mostraba cita alguna — la BandaVeredicto
// del shell cae entonces en su default (la edición del DB del registry).
// =============================================================================

import type { ResumenVeredicto } from "../../components/justificacion/ModuleShell";
import { fmt } from "../../lib/units/format";
import type { HE1Result } from "./calc";

/**
 * Resumen para la banda del shell. Paridad total con la banda inline anterior:
 * "Envolvente térmica (zona C) — CUMPLE (3 cerramientos · θe 5 °C enero)".
 */
export function resumenHe1(r: HE1Result): ResumenVeredicto {
  const n = r.porCerramiento.length;
  return {
    veredicto: r.veredictoGlobal,
    sujeto: "Envolvente térmica",
    contexto: `zona ${r.zonaClimatica}`,
    metricas:
      `${n} ${n === 1 ? "cerramiento" : "cerramientos"} · θe ` +
      `${fmt(r.tempExteriorEnero_C, "°C", 0)} enero`,
  };
}
