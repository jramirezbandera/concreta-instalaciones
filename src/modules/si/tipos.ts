// =============================================================================
// DB-SI — Tipos comunes de las seis secciones (feature-19). Cada sección (SI 1 a
// SI 6) es una pantalla propia con el patrón v4, pero todas leen el mismo
// edificio con los mismos ojos: el uso del DB-SI de cada zona, su superficie
// construida, los sectores de incendio y los locales de riesgo especial
// (`edificio.ts`). Solo tipos: cero lógica.
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";

export type ClaveSi = "si1" | "si2" | "si3" | "si4" | "si5" | "si6";

/** Un elemento de una justificación SI: el contrato común con su nombre y su detalle. */
export interface ElementoSi<D> extends ElementoResultado {
  nombre: string;
  detalle: D;
}

/** Lo que tienen en común las seis justificaciones. */
export interface JustificacionSiBase {
  elementos: ElementoSi<unknown>[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

/** Un dato con si se ha supuesto. */
export interface DatoSi<T> {
  valor: T;
  supuesto: boolean;
}
