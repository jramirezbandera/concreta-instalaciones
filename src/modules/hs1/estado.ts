// =============================================================================
// DB-HS1 — Lo que guarda el módulo en el expediente (feature-17): solo las
// decisiones del proyectista. Lo demás sale de El edificio y de los datos de la
// obra (clima y terreno). Solo tipos y valores por defecto.
// =============================================================================

import { DECISIONES_HS1_POR_DEFECTO, type DecisionesHs1 } from "./decisiones";

export type Hs1Estado = DecisionesHs1;

export const hs1EstadoDefaults: Hs1Estado = { ...DECISIONES_HS1_POR_DEFECTO };
