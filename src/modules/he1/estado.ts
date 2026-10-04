// =============================================================================
// DB-HE1 — Lo que guarda el módulo en el expediente (feature-15, HE1).
//
// Desde la v4 la envolvente se deduce de El edificio: el estado son las
// decisiones del proyectista y la zona climática de invierno, heredada de La obra
// (la letra de la zona del Anejo B). Los cerramientos tecleados de la v1 ya no se
// usan. Solo tipos y valores por defecto.
// =============================================================================

import { DECISIONES_HE1_POR_DEFECTO, type DecisionesHe1 } from "./envolvente";
import type { ZonaClimatica } from "./tablas";

export interface He1Estado extends DecisionesHe1 {
  /** Zona climática de invierno (letra del Anejo B): la hereda de la obra. */
  zonaClimatica: ZonaClimatica;
}

export const he1EstadoDefaults: He1Estado = {
  ...DECISIONES_HE1_POR_DEFECTO,
  zonaClimatica: "C",
};
