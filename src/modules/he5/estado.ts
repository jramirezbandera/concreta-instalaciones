// =============================================================================
// DB-HE 5 — Lo que guarda el módulo (feature-22): la cubierta no transitable que
// cuenta para P2 (la de El edificio si no se dice) y la potencia que se instala
// (la mínima si no se dice). La superficie construida se guarda en las zonas de
// El edificio (como en SI) y los captadores solares, en HE 4. Solo tipos.
// =============================================================================

export type He5Estado = {
  /** Superficie de cubierta no transitable o accesible solo para conservación, Sc [m²]; null = la de El edificio. */
  cubiertaNoTransitable_m2: number | null;
  /** Potencia de generación que se instala [kW]; null = la mínima exigida. */
  potencia_kW: number | null;
};

export const he5EstadoDefaults: He5Estado = {
  cubiertaNoTransitable_m2: null,
  potencia_kW: null,
};
