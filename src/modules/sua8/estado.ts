// =============================================================================
// DB-SUA, SUA 8 — Lo que guarda el módulo (feature-20): las decisiones del
// proyectista que El edificio no describe (la planta, el remate, el entorno, los
// materiales, el contenido y el uso especial) y si se proyecta la instalación.
// Cada una se guarda como «habitual» mientras coincida con lo habitual. Solo
// tipos y valores.
//
// Lo habitual (criterio, research/verificacion-sua6-sua8.md C5 y K8–K10): planta
// cuadrada con la superficie de la cubierta (se avisa si importa), remate según
// la cubierta, edificio próximo a otros (plurifamiliar y oficinas) o aislado
// (unifamiliar), estructura y cubierta de hormigón, contenido no inflamable,
// ningún uso especial y la instalación solo cuando es obligatoria.
// =============================================================================

import type { TipoCubierta } from "../../lib/edificio/tipos";
import type { EntornoC1, MaterialC2 } from "./tablas";

export type Contenido = "otros" | "inflamable";
/** Servicio imprescindible (C5 = 5) o sustancias peligrosas (ap. 1 pto 2: siempre nivel 1). */
export type UsoEspecial = "ninguno" | "servicio" | "peligrosas";
export type Instalacion = "si" | "no";

export type Opcion<T> = T | "habitual";

export type Sua8Estado = {
  /** Dimensiones de la planta [m]; null = se supone cuadrada con la superficie de la cubierta. */
  largo_m: number | null;
  ancho_m: number | null;
  /** Lo que sobresale por encima del forjado de cubierta (peto, cumbrera, casetón) [m]. */
  remate_m: Opcion<number>;
  entorno: Opcion<EntornoC1>;
  estructura: Opcion<MaterialC2>;
  cubierta: Opcion<MaterialC2>;
  contenido: Opcion<Contenido>;
  especial: Opcion<UsoEspecial>;
  /** «habitual»: la instalación se proyecta si es obligatoria. */
  instalacion: Opcion<Instalacion>;
};

export interface DecisionesSua8 {
  remate_m: number;
  entorno: EntornoC1;
  estructura: MaterialC2;
  cubierta: MaterialC2;
  contenido: Contenido;
  especial: UsoEspecial;
  instalacion: Instalacion;
}

export const sua8EstadoDefaults: Sua8Estado = {
  largo_m: null,
  ancho_m: null,
  remate_m: "habitual",
  entorno: "habitual",
  estructura: "habitual",
  cubierta: "habitual",
  contenido: "habitual",
  especial: "habitual",
  instalacion: "habitual",
};

/** Remate habitual sobre el forjado de cubierta [m] (criterio). */
export const REMATE_HABITUAL: Record<TipoCubierta, number> = {
  plana_transitable: 1.1,
  plana_no_transitable: 0.5,
  inclinada: 1.5,
};

/** Lo habitual, con el edificio y con lo que exige el cálculo. */
export function habitualesSua8(cubierta: TipoCubierta, unifamiliar: boolean, obligatoria: boolean): DecisionesSua8 {
  return {
    remate_m: REMATE_HABITUAL[cubierta],
    entorno: unifamiliar ? "aislado" : "proximo",
    estructura: "hormigon",
    cubierta: "hormigon",
    contenido: "otros",
    especial: "ninguno",
    instalacion: obligatoria ? "si" : "no",
  };
}

/** Las decisiones sin la instalación, que depende del resultado. */
export function resolverSua8(e: Sua8Estado, h: DecisionesSua8): Omit<DecisionesSua8, "instalacion"> {
  const v = <K extends Exclude<keyof DecisionesSua8, "instalacion">>(k: K): DecisionesSua8[K] =>
    (e[k] === "habitual" || e[k] === undefined ? h[k] : e[k]) as DecisionesSua8[K];
  return {
    remate_m: v("remate_m"),
    entorno: v("entorno"),
    estructura: v("estructura"),
    cubierta: v("cubierta"),
    contenido: v("contenido"),
    especial: v("especial"),
  };
}
