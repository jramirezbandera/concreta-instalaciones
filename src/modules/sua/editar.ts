// =============================================================================
// DB-SUA — Lo que las decisiones de las secciones SUA escriben en El edificio
// (feature-20): si tiene ascensor. PURO: devuelve un edificio nuevo.
// =============================================================================

import type { Edificio } from "../../lib/edificio/tipos";

/** Indica si hay ascensor; `undefined` lo quita (vuelve a suponerse). */
export function cambiarAscensor(e: Edificio, hay: boolean | undefined): Edificio {
  const nuevo: Edificio = { ...e, ascensor: hay };
  if (hay === undefined) delete nuevo.ascensor;
  return nuevo;
}
