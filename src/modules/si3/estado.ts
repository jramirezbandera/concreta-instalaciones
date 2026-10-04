// =============================================================================
// DB-SI, SI 3 — Lo que guarda el módulo (feature-19): lo que El edificio no
// dice de la evacuación: cómo es la escalera, su anchura, los recorridos más
// largos que el proyectista mide en planta y cómo se ventila el garaje. Las
// decisiones con «lo habitual» se guardan como «habitual»; los recorridos son
// cifras medidas (null: sin medir).
//
// Lo habitual (criterio, research/verificacion-si3.md C2–C4): la escalera que
// permite la tabla 5.1 con menos protección; 1,00 m de anchura (a confirmar con
// DB SUA 1); el garaje bajo rasante, con ventilación mecánica.
// =============================================================================

import type { ProteccionEscalera } from "./tablas";

export type VentilacionGaraje = "mecanica" | "natural";

export type Opcion<T> = T | "habitual";

export type Si3Estado = {
  escalera: Opcion<ProteccionEscalera>;
  anchuraEscalera_m: Opcion<number>;
  /** Recorrido más largo de las plantas de viviendas u oficinas [m], medido en planta. */
  recorrido_m: number | null;
  /** Recorrido más largo del garaje [m], medido en planta. */
  recorridoGaraje_m: number | null;
  ventilacionGaraje: Opcion<VentilacionGaraje>;
};

export interface DecisionesSi3 {
  escalera: ProteccionEscalera;
  anchuraEscalera_m: number;
  ventilacionGaraje: VentilacionGaraje;
}

export const ANCHURA_ESCALERA_HABITUAL_m = 1.0;

export const si3EstadoDefaults: Si3Estado = {
  escalera: "habitual",
  anchuraEscalera_m: "habitual",
  recorrido_m: null,
  recorridoGaraje_m: null,
  ventilacionGaraje: "habitual",
};

export function resolverSi3(e: Si3Estado, habituales: DecisionesSi3): DecisionesSi3 {
  const v = <K extends keyof DecisionesSi3>(k: K): DecisionesSi3[K] =>
    (e[k] === "habitual" || e[k] === undefined ? habituales[k] : e[k]) as DecisionesSi3[K];
  return { escalera: v("escalera"), anchuraEscalera_m: v("anchuraEscalera_m"), ventilacionGaraje: v("ventilacionGaraje") };
}
