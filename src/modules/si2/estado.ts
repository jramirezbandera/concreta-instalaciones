// =============================================================================
// DB-SI, SI 2 — Lo que guarda el módulo (feature-19): cómo es el exterior del
// edificio, que El edificio no describe. Cada decisión se guarda como
// «habitual» mientras coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (criterio): la plurifamiliar y las oficinas, entre medianeras; la
// unifamiliar, aislada; las fachadas de sectores distintos en un mismo plano; sin
// fachada ventilada; y el arranque de la fachada a la acera, accesible al público.
// =============================================================================

export type Medianeras = "si" | "no";
/** Ángulo entre las fachadas de dos sectores: en un mismo plano (180°), en esquina (90°), enfrentadas (0°). */
export type Encuentro = "plano" | "esquina" | "enfrentadas";
export type FachadaVentilada = "no" | "si";
export type Arranque = "publico" | "privado";

export type Opcion<T> = T | "habitual";

export type Si2Estado = {
  medianeras: Opcion<Medianeras>;
  encuentro: Opcion<Encuentro>;
  ventilada: Opcion<FachadaVentilada>;
  arranque: Opcion<Arranque>;
};

export interface DecisionesSi2 {
  medianeras: Medianeras;
  encuentro: Encuentro;
  ventilada: FachadaVentilada;
  arranque: Arranque;
}

export const ANGULO_ENCUENTRO: Record<Encuentro, number> = { plano: 180, esquina: 90, enfrentadas: 0 };

export const si2EstadoDefaults: Si2Estado = { medianeras: "habitual", encuentro: "habitual", ventilada: "habitual", arranque: "habitual" };

export function habitualesSi2(unifamiliar: boolean): DecisionesSi2 {
  return { medianeras: unifamiliar ? "no" : "si", encuentro: "plano", ventilada: "no", arranque: "publico" };
}

export function resolverSi2(e: Si2Estado, unifamiliar: boolean): DecisionesSi2 {
  const h = habitualesSi2(unifamiliar);
  const v = <K extends keyof DecisionesSi2>(k: K): DecisionesSi2[K] => (e[k] === "habitual" || e[k] === undefined ? h[k] : e[k]) as DecisionesSi2[K];
  return { medianeras: v("medianeras"), encuentro: v("encuentro"), ventilada: v("ventilada"), arranque: v("arranque") };
}
