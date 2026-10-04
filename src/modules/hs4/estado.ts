// =============================================================================
// DB-HS4 — Lo que guarda el módulo en el expediente (feature-15, HS4).
//
// La red de agua fría de siempre (`HS4Inputs`: tramos, aparatos, criterio K y
// pérdidas localizadas) más las decisiones de la v4 y el modo:
//   - `red: "edificio"`: la red se deduce de El edificio cada vez (los tramos y
//     aparatos guardados no se usan);
//   - `red: "manual"`: «Ajustar a mano»; manda la tabla de tramos guardada.
// La presión de la red NO se guarda aquí: es un dato de la obra
// (`DatosGenerales.presionAcometida_kPa`), que la decisión 1 edita allí.
// Solo tipos y valores por defecto.
// =============================================================================

import { hs4Defaults, type HS4Inputs } from "./calc";
import { DECISIONES_HS4_POR_DEFECTO, type DecisionesHs4 } from "./red";

export type ModoRedHs4 = "edificio" | "manual";

export interface Hs4Estado extends HS4Inputs, DecisionesHs4 {
  red: ModoRedHs4;
}

export const hs4EstadoDefaults: Hs4Estado = {
  ...hs4Defaults,
  ...DECISIONES_HS4_POR_DEFECTO,
  red: "edificio",
};
