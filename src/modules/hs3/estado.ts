// =============================================================================
// DB-HS3 — Lo que guarda el módulo en el expediente (feature-15, HS3).
//
// Desde la v4 la ventilación se deduce de El edificio: el estado son las
// decisiones del proyectista y la zona térmica (heredada de la obra, Tabla 4.4),
// que solo cuenta con la ventilación híbrida. Las estancias tecleadas de la v1 ya
// no se usan. Solo tipos y valores por defecto.
// =============================================================================

import { DECISIONES_HS3_POR_DEFECTO, type DecisionesHs3 } from "./red";
import type { ZonaTermica } from "./tablas";

export interface Hs3Estado extends DecisionesHs3 {
  /** Zona térmica (Tabla 4.4): la hereda de la obra. */
  zonaTermica: ZonaTermica;
}

export const hs3EstadoDefaults: Hs3Estado = {
  ...DECISIONES_HS3_POR_DEFECTO,
  zonaTermica: "X",
};
