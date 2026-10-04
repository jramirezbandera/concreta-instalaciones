// =============================================================================
// DB-SI — Lo que las decisiones de las secciones SI escriben en El edificio
// (feature-19): los datos del DB-SI que viven en sus zonas (la superficie
// construida, qué es un cuarto de instalaciones, su potencia, el uso del local
// sin uso). PURO: devuelve un edificio nuevo.
// =============================================================================

import type { Edificio, Zona } from "../../lib/edificio/tipos";

type DatosSiZona = Pick<Zona, "superficieConstruida_m2" | "cuarto" | "potencia_kW" | "usoPrevisto">;

/** Cambia los datos del DB-SI de una zona; un `undefined` los quita. */
export function cambiarZonaSi(e: Edificio, zonaId: string, cambio: Partial<DatosSiZona>): Edificio {
  return {
    ...e,
    grupos: e.grupos.map((g) => ({
      ...g,
      zonas: g.zonas.map((z) => {
        if (z.id !== zonaId) return z;
        const nueva: Zona = { ...z, ...cambio };
        for (const k of Object.keys(cambio) as (keyof DatosSiZona)[]) {
          if (cambio[k] === undefined) delete nueva[k];
        }
        return nueva;
      }),
    })),
  };
}
