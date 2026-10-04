// =============================================================================
// DB-HS 2 — Lo que guarda el módulo (feature-21): cómo recoge el municipio cada
// fracción, los periodos y contenedores de la recogida puerta a puerta, cuántos
// dormitorios dobles tiene cada vivienda tipo, dónde va el almacén o la reserva
// y la superficie que se le da. Cada decisión se guarda como «habitual»
// mientras coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-hs2.md «Criterios de proyecto»):
// contenedores de calle de superficie para todo (solo espacio de reserva), el
// dormitorio principal doble y los demás sencillos, la reserva en la planta baja
// (en la parcela, en la unifamiliar) y con la superficie justa que exige el DB.
// =============================================================================

import { FRACCIONES, SUPUESTOS_A2_HS2, type CapacidadContenedor, type Fraccion } from "./tablas";

/**
 * Cómo se recoge una fracción: contenedores de calle de superficie (espacio de
 * reserva), puerta a puerta (almacén de contenedores de edificio) u otro sistema
 * (contenedores soterrados o recogida neumática: ni almacén ni reserva).
 */
export type ModoFraccion = "calle" | "puerta" | "otro";
/** La decisión: todas igual o fracción a fracción. */
export type Recogida = "calle" | "puerta" | "fraccion";
export type Ubicacion = "planta_baja" | "sotano" | "exterior";

export type Opcion<T> = T | "habitual";

export type Hs2Estado = {
  recogida: Opcion<Recogida>;
  /** Con «fraccion»: el modo de cada una (las que falten, contenedor de calle). */
  modos: Partial<Record<Fraccion, ModoFraccion>>;
  /** Periodo de recogida puerta a puerta [días]; sin él, el de la tabla A.2. */
  periodos: Partial<Record<Fraccion, number>>;
  /** Contenedor de edificio que exige el servicio [l]; sin él, el de la tabla A.2 (330 l). */
  contenedores: Partial<Record<Fraccion, CapacidadContenedor>>;
  /** Dormitorios dobles de cada vivienda tipo (por id); sin él, uno (el principal). */
  dobles: Partial<Record<string, number>>;
  ubicacion: Opcion<Ubicacion>;
  /**
   * Superficie útil que se da al almacén y a la reserva [m²]; null = la que exige
   * el DB. El cuarto «almacén de residuos» de El edificio manda sobre ellas.
   */
  superficieAlmacen_m2: number | null;
  superficieReserva_m2: number | null;
};

export const hs2EstadoDefaults: Hs2Estado = {
  recogida: "habitual",
  modos: {},
  periodos: {},
  contenedores: {},
  dobles: {},
  ubicacion: "habitual",
  superficieAlmacen_m2: null,
  superficieReserva_m2: null,
};

export interface DecisionesHs2 {
  recogida: Recogida;
  ubicacion: Ubicacion;
}

export function habitualesHs2(unifamiliar: boolean): DecisionesHs2 {
  return { recogida: "calle", ubicacion: unifamiliar ? "exterior" : "planta_baja" };
}

export function resolverHs2(e: Hs2Estado, h: DecisionesHs2): DecisionesHs2 {
  return {
    recogida: e.recogida === "habitual" || e.recogida === undefined ? h.recogida : e.recogida,
    ubicacion: e.ubicacion === "habitual" || e.ubicacion === undefined ? h.ubicacion : e.ubicacion,
  };
}

/** El modo de cada fracción con la decisión resuelta. */
export function modosDe(recogida: Recogida, modos: Hs2Estado["modos"] | undefined): Record<Fraccion, ModoFraccion> {
  const out = {} as Record<Fraccion, ModoFraccion>;
  for (const f of FRACCIONES) out[f] = recogida === "fraccion" ? (modos?.[f] ?? "calle") : recogida;
  return out;
}

/** Periodo y contenedor de una fracción puerta a puerta, y si se suponen (tabla A.2). */
export function recogidaPuerta(e: Hs2Estado, f: Fraccion): { tf: number; contenedor: CapacidadContenedor; supuesto: boolean } {
  const A = SUPUESTOS_A2_HS2.datos;
  const tf = e.periodos?.[f];
  const c = e.contenedores?.[f];
  const tfValido = tf !== undefined && Number.isFinite(tf) && tf > 0;
  return {
    tf: tfValido ? tf : A.tf[f],
    contenedor: c ?? A.contenedor,
    supuesto: !tfValido || c === undefined,
  };
}
