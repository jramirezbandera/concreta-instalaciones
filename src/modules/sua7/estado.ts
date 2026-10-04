// =============================================================================
// DB-SUA, SUA 7 — Lo que guarda el módulo (feature-20): las decisiones sobre el
// garaje que El edificio no describe: cómo sale a la calle y su espacio de
// espera, si hay peatones por la rampa y el dispositivo de alerta. Cada una se
// guarda como «habitual» mientras coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (CRITERIO de proyecto, no exigencia del CTE; research/
// verificacion-sua6-sua8.md, entradas mínimas de C2 y K5, K6): la salida sube
// desde el sótano (o es a nivel si el garaje está en la planta baja), espacio de
// espera de 5 m al 4 % (llano si es a nivel), el acceso peatonal por el núcleo de
// escalera y no por la rampa, y un espejo con señal luminosa en la salida.
// =============================================================================

export type Salida = "ascendente" | "nivel" | "descendente";
/** «no»: el acceso peatonal es por la escalera del edificio; «rampa»: hay un paso de peatones por la rampa. */
export type Peatones = "no" | "rampa";
export type Proteccion = "barrera" | "acera";
export type Alerta = "espejo_luminoso" | "espejo" | "detector";

export type Opcion<T> = T | "habitual";

export type Sua7Estado = {
  salida: Opcion<Salida>;
  /** Fondo del espacio de acceso y espera [m]. */
  fondo_m: Opcion<number>;
  /** Pendiente del espacio de acceso y espera [%]. */
  pendiente_pct: Opcion<number>;
  peatones: Opcion<Peatones>;
  /** Anchura del paso de peatones por la rampa [m]. */
  anchuraPeatones_m: Opcion<number>;
  proteccion: Opcion<Proteccion>;
  alerta: Opcion<Alerta>;
};

export interface DecisionesSua7 {
  salida: Salida;
  fondo_m: number;
  pendiente_pct: number;
  peatones: Peatones;
  anchuraPeatones_m: number;
  proteccion: Proteccion;
  alerta: Alerta;
}

export const sua7EstadoDefaults: Sua7Estado = {
  salida: "habitual",
  fondo_m: "habitual",
  pendiente_pct: "habitual",
  peatones: "habitual",
  anchuraPeatones_m: "habitual",
  proteccion: "habitual",
  alerta: "habitual",
};

/** Fondo y pendiente habituales del espacio de espera (criterio). */
export const FONDO_HABITUAL_M = 5;
export const PENDIENTE_HABITUAL_PCT = 4;
/** Anchura habitual del paso de peatones por la rampa, si lo hay (criterio). */
export const ANCHURA_PEATONES_HABITUAL_M = 1;

/**
 * Lo habitual con el garaje: la salida sube si está bajo rasante, baja si está
 * en plantas altas y es a nivel en la planta baja. La pendiente habitual depende
 * de la salida elegida (a nivel, llano).
 */
export function habitualesSua7(salidaHabitual: Salida, salida: Salida): DecisionesSua7 {
  return {
    salida: salidaHabitual,
    fondo_m: FONDO_HABITUAL_M,
    pendiente_pct: salida === "nivel" ? 0 : PENDIENTE_HABITUAL_PCT,
    peatones: "no",
    anchuraPeatones_m: ANCHURA_PEATONES_HABITUAL_M,
    proteccion: "barrera",
    alerta: "espejo_luminoso",
  };
}

export function resolverSua7(e: Sua7Estado, h: DecisionesSua7): DecisionesSua7 {
  const v = <K extends keyof DecisionesSua7>(k: K): DecisionesSua7[K] =>
    (e[k] === "habitual" || e[k] === undefined ? h[k] : e[k]) as DecisionesSua7[K];
  return {
    salida: v("salida"),
    fondo_m: v("fondo_m"),
    pendiente_pct: v("pendiente_pct"),
    peatones: v("peatones"),
    anchuraPeatones_m: v("anchuraPeatones_m"),
    proteccion: v("proteccion"),
    alerta: v("alerta"),
  };
}

export function esHabitualSua7(e: Sua7Estado, k: keyof Sua7Estado): boolean {
  return e[k] === "habitual" || e[k] === undefined;
}
