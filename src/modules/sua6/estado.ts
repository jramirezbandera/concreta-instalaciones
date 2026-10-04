// =============================================================================
// DB-SUA, SUA 6 — Lo que guarda el módulo (feature-20): las decisiones sobre la
// piscina comunitaria, que El edificio no describe (solo sabe si la hay), y sobre
// los pozos y depósitos. Cada una se guarda como «habitual» mientras coincida con
// lo habitual. Solo tipos y valores.
//
// Lo habitual (CRITERIO de proyecto, no exigencia del CTE; research/
// verificacion-sua6-sua8.md, entradas mínimas de C1 y K1, K2): acceso de niños
// no controlado, con barrera de 1,20 m; un vaso de recreo de 1,10 a 1,90 m;
// andén de 1,50 m; escaleras hasta 1 m bajo el agua, a 12 m como mucho entre
// ellas; ningún pozo ni depósito accesible.
// =============================================================================

/** «barrera»: el acceso de niños no está controlado y hay barrera; «controlado»: recinto o puertas cerrados fuera de uso. */
export type Acceso = "barrera" | "controlado";
export type Vasos = "recreo" | "infantil" | "ambos";
export type Anden = "si" | "no";
/** Hasta dónde llegan las escaleras: 1 m bajo el agua, o hasta 30 cm del fondo. */
export type Escaleras = "un_metro" | "fondo";
export type Pozos = "no" | "si";

export type Opcion<T> = T | "habitual";

export type Sua6Estado = {
  acceso: Opcion<Acceso>;
  /** Altura de la barrera [m]. */
  barrera_m: Opcion<number>;
  vasos: Opcion<Vasos>;
  /** Profundidades del vaso de recreo [m]. */
  profMin_m: Opcion<number>;
  profMax_m: Opcion<number>;
  /** Profundidad máxima del vaso infantil [m]. */
  profInfantil_m: Opcion<number>;
  anden: Opcion<Anden>;
  anden_m: Opcion<number>;
  escaleras: Opcion<Escaleras>;
  /** Separación máxima entre escaleras [m]. */
  separacion_m: Opcion<number>;
  pozos: Opcion<Pozos>;
};

export interface DecisionesSua6 {
  acceso: Acceso;
  barrera_m: number;
  vasos: Vasos;
  profMin_m: number;
  profMax_m: number;
  profInfantil_m: number;
  anden: Anden;
  anden_m: number;
  escaleras: Escaleras;
  separacion_m: number;
  pozos: Pozos;
}

export const sua6EstadoDefaults: Sua6Estado = {
  acceso: "habitual",
  barrera_m: "habitual",
  vasos: "habitual",
  profMin_m: "habitual",
  profMax_m: "habitual",
  profInfantil_m: "habitual",
  anden: "habitual",
  anden_m: "habitual",
  escaleras: "habitual",
  separacion_m: "habitual",
  pozos: "habitual",
};

/** Lo habitual: CRITERIO de proyecto (no es exigencia del CTE). No depende del edificio. */
export const HABITUAL_SUA6: DecisionesSua6 = {
  acceso: "barrera",
  barrera_m: 1.2,
  vasos: "recreo",
  profMin_m: 1.1,
  profMax_m: 1.9,
  profInfantil_m: 0.4,
  anden: "si",
  anden_m: 1.5,
  escaleras: "un_metro",
  separacion_m: 12,
  pozos: "no",
};

export function resolverSua6(e: Sua6Estado, h: DecisionesSua6): DecisionesSua6 {
  const v = <K extends keyof DecisionesSua6>(k: K): DecisionesSua6[K] =>
    (e[k] === "habitual" || e[k] === undefined ? h[k] : e[k]) as DecisionesSua6[K];
  return {
    acceso: v("acceso"),
    barrera_m: v("barrera_m"),
    vasos: v("vasos"),
    profMin_m: v("profMin_m"),
    profMax_m: v("profMax_m"),
    profInfantil_m: v("profInfantil_m"),
    anden: v("anden"),
    anden_m: v("anden_m"),
    escaleras: v("escaleras"),
    separacion_m: v("separacion_m"),
    pozos: v("pozos"),
  };
}

/** Si la decisión guardada está en lo habitual (para rotular el origen en la ficha). */
export function esHabitualSua6(e: Sua6Estado, k: keyof Sua6Estado): boolean {
  return e[k] === "habitual" || e[k] === undefined;
}
