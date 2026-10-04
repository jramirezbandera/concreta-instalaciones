// =============================================================================
// DB-SI, SI 5 — Lo que guarda el módulo (feature-19): las decisiones del
// proyectista sobre el entorno, que El edificio no describe. Cada una se guarda
// como «habitual» mientras coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-si4-si6.md K6 y K7): el espacio
// de maniobra es la calle a la que da el portal; las rejas, solo en las plantas
// de abajo; el edificio no linda con zonas forestales.
// =============================================================================

/** Dónde maniobran los bomberos. La calle pública no forma parte del proyecto (Introducción II). */
export type EspacioManiobra = "calle" | "calle_no_cumple" | "propio";
/** Elementos de seguridad (rejas) en los huecos de la fachada accesible. */
export type RejasFachada = "sin" | "hasta9" | "todas";
export type Forestal = "no" | "si";

export type Opcion<T> = T | "habitual";

export type Si5Estado = {
  maniobra: Opcion<EspacioManiobra>;
  rejas: Opcion<RejasFachada>;
  forestal: Opcion<Forestal>;
};

export interface DecisionesSi5 {
  maniobra: EspacioManiobra;
  rejas: RejasFachada;
  forestal: Forestal;
}

export const HABITUALES_SI5: DecisionesSi5 = { maniobra: "calle", rejas: "hasta9", forestal: "no" };

export const si5EstadoDefaults: Si5Estado = { maniobra: "habitual", rejas: "habitual", forestal: "habitual" };

export function resolverSi5(e: Si5Estado): DecisionesSi5 {
  const v = <K extends keyof DecisionesSi5>(k: K): DecisionesSi5[K] =>
    (e[k] === "habitual" || e[k] === undefined ? HABITUALES_SI5[k] : e[k]) as DecisionesSi5[K];
  return { maniobra: v("maniobra"), rejas: v("rejas"), forestal: v("forestal") };
}
