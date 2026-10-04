// =============================================================================
// DB-SI, SI 6 — Lo que guarda el módulo (feature-19): cómo es la estructura, que
// El edificio no describe. Cada decisión se guarda como «habitual» mientras
// coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-si4-si6.md K8): hormigón armado,
// forjado unidireccional de viguetas y bovedillas con el techo guarnecido en las
// plantas habitables, y el techo del garaje sin revestir.
// =============================================================================

export type MaterialEstructura = "hormigon" | "acero" | "madera";
export type TipoForjado = "unidireccional" | "reticular" | "losa";
export type TechoGaraje = "sin_revestir" | "revestido";

export type Opcion<T> = T | "habitual";

export type Si6Estado = {
  material: Opcion<MaterialEstructura>;
  forjado: Opcion<TipoForjado>;
  techoGaraje: Opcion<TechoGaraje>;
};

export interface DecisionesSi6 {
  material: MaterialEstructura;
  forjado: TipoForjado;
  techoGaraje: TechoGaraje;
}

export const HABITUALES_SI6: DecisionesSi6 = { material: "hormigon", forjado: "unidireccional", techoGaraje: "sin_revestir" };

export const si6EstadoDefaults: Si6Estado = { material: "habitual", forjado: "habitual", techoGaraje: "habitual" };

export function resolverSi6(e: Si6Estado): DecisionesSi6 {
  const v = <K extends keyof DecisionesSi6>(k: K): DecisionesSi6[K] =>
    (e[k] === "habitual" || e[k] === undefined ? HABITUALES_SI6[k] : e[k]) as DecisionesSi6[K];
  return { material: v("material"), forjado: v("forjado"), techoGaraje: v("techoGaraje") };
}
