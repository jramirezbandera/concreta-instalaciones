// =============================================================================
// DB-SUA, SUA 2 — Lo que guarda el módulo (feature-20): la altura libre de paso
// de cada clase de zona y cómo abren las puertas a los pasillos comunes. Cada
// decisión se guarda como «habitual» mientras coincida con lo habitual. Solo
// tipos y valores.
//
// Lo habitual (criterio, research/verificacion-sua2-sua5.md E2.2 y E2.6): altura
// libre de 2,40 m en la vivienda (falso techo de pasillo), 2,50 m en las zonas
// comunes y en las oficinas, y 2,20 m bajo el elemento más bajo del garaje; las
// puertas de los recintos abren hacia dentro y no barren el pasillo.
// =============================================================================

/** Clases de zona por su altura libre exigida. */
export type ClaseAltura = "vivienda" | "comun" | "garaje" | "oficinas";

/** Cómo abren las puertas de los recintos que dan a pasillos y rellanos comunes. */
export type BarridoPuertas = "no_invaden" | "pasillo_ancho" | "invaden";

export type Opcion<T> = T | "habitual";

export type Sua2Estado = {
  alturaVivienda_m: Opcion<number>;
  alturaComun_m: Opcion<number>;
  alturaGaraje_m: Opcion<number>;
  alturaOficinas_m: Opcion<number>;
  puertas: Opcion<BarridoPuertas>;
};

export const CLAVE_ALTURA = {
  vivienda: "alturaVivienda_m",
  comun: "alturaComun_m",
  garaje: "alturaGaraje_m",
  oficinas: "alturaOficinas_m",
} as const satisfies Record<ClaseAltura, keyof Sua2Estado>;

export const sua2EstadoDefaults: Sua2Estado = {
  alturaVivienda_m: "habitual",
  alturaComun_m: "habitual",
  alturaGaraje_m: "habitual",
  alturaOficinas_m: "habitual",
  puertas: "habitual",
};

/**
 * Altura libre habitual en las zonas de circulación [m]: CRITERIO de proyecto,
 * no exigencia. La de las oficinas (2,50 m, con falso techo) es criterio de esta
 * herramienta; la verificación da las otras tres (E2.2).
 */
export const ALTURA_LIBRE_HABITUAL_m: Record<ClaseAltura, number> = {
  vivienda: 2.4,
  comun: 2.5,
  garaje: 2.2,
  oficinas: 2.5,
};

export const PUERTAS_HABITUAL: BarridoPuertas = "no_invaden";
