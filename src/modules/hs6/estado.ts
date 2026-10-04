// =============================================================================
// DB-HS6 — Lo que guarda el módulo en el expediente (feature-15, HS6).
//
// Desde la v4 la protección se deduce de El edificio: el estado son las
// decisiones del proyectista y la zona de radón y el municipio, heredados de la
// obra (la zona la consulta el proyectista en el Apéndice B). Las soluciones
// tecleadas de la v1 ya no se usan. Solo tipos y valores por defecto.
// =============================================================================

import { DECISIONES_HS6_POR_DEFECTO, type DecisionesHs6 } from "./proteccion";
import type { ZonaRadon } from "./tablas";

export interface Hs6Estado extends DecisionesHs6 {
  /** Zona de radón (Apéndice B): la hereda de la obra. */
  zona: ZonaRadon;
  /** Municipio, para la ficha (heredado). */
  municipio: string;
}

export const hs6EstadoDefaults: Hs6Estado = {
  ...DECISIONES_HS6_POR_DEFECTO,
  zona: "II",
  municipio: "",
};
