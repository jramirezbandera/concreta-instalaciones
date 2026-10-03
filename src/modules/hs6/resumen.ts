// =============================================================================
// resumen — feature-6 T5.2: resumen del resultado de HS6 para la banda de
// veredicto de la cabecera (ModuleLayout). Extrae LITERALMENTE el contenido de la antigua
// banda inline de ui.tsx (sujeto + zona entre paréntesis + métricas de medidas
// válidas / "sin exigencia HS6") para que la migración al shell no cambie ni
// una letra de lo que ve el usuario.
//
// Lib PURA (cero React/DOM): misma entrada → mismo output. No lleva `cita`
// porque la banda inline anterior no mostraba cita alguna — la cabecera de
// ModuleLayout cae entonces en su default (la edición del DB del registry).
// =============================================================================

import type { ResumenVeredicto } from "../../components/justificacion/ModuleLayout";
import type { HS6Result } from "./calc";

/**
 * Resumen para la banda del shell. Paridad total con la banda inline anterior:
 * "Protección frente al radón (zona II) — CUMPLE (2 de 2 medida(s) válida(s) ·
 * barrera obligatoria)"; si HS6 no exige medidas (fuera de ámbito o zona sin
 * clasificar), la métrica es "sin exigencia HS6" — exactamente como el JSX.
 */
export function resumenHs6(r: HS6Result): ResumenVeredicto {
  return {
    veredicto: r.veredictoGlobal,
    sujeto: "Protección frente al radón",
    contexto: `zona ${r.zona}`,
    metricas: r.aplica
      ? `${r.nMedidasValidas} de ${r.nMedidasMin} medida(s) válida(s)${
          r.barreraObligatoria ? " · barrera obligatoria" : ""
        }`
      : "sin exigencia HS6",
  };
}
