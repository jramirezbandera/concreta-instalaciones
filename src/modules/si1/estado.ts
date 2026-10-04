// =============================================================================
// DB-SI, SI 1 — Lo que guarda el módulo (feature-19): nada propio. Lo que decide
// el proyectista en SI 1 (qué es cada cuarto de instalaciones, el uso del local
// sin uso, la superficie construida) es un dato del edificio que usan también
// SI 2, SI 4 y SI 6, así que se guarda en las zonas de El edificio.
// =============================================================================

export type Si1Estado = Record<string, unknown>;

export const si1EstadoDefaults: Si1Estado = {};
