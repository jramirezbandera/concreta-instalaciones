// =============================================================================
// REBT — Lo que guarda el módulo (feature-23): lo que El edificio no describe
// y decide la previsión de cargas. El grado de electrificación de las viviendas
// (por superficie, o elevada en todas por la climatización eléctrica u otros
// equipos), la potencia del ascensor y de los demás servicios generales y, si
// hay garaje comunitario, la recarga del vehículo eléctrico (con o sin SPL, y
// cuántas plazas); en la unifamiliar sin garaje, si tiene plaza en la parcela, y
// en el garaje que controla el humo con ventiladores, su potencia. La ventilación
// del garaje es la de HS 3. Cada decisión se guarda como «habitual» mientras
// coincida con lo habitual. Solo tipos.
//
// Lo habitual (criterio, research/verificacion-rebt.md «Decisiones de
// producto»): las viviendas, elevadas (climatización eléctrica), y la recarga
// sin SPL (factor 1,0, lo del lado de la seguridad).
// =============================================================================

/**
 * El grado de las viviendas: `superficie`, básica salvo con más de 160 m² o con
 * recarga en la unifamiliar; `elevada`, todas, por la calefacción eléctrica o
 * el aire acondicionado (o la secadora o la automatización) que se prevén.
 */
export type Electrificacion = "superficie" | "elevada";
/**
 * Recarga del vehículo eléctrico en el garaje comunitario: esquema colectivo con
 * el sistema de protección de la línea general de alimentación (SPL, factor 0,3),
 * o sin él (1,0, válido para cualquier esquema de la ITC-BT-52).
 */
export type Spl = "con_spl" | "sin_spl";

export type Opcion<T> = T | "habitual";

export type RebtEstado = {
  electrificacion: Opcion<Electrificacion>;
  /** Potencia del ascensor [kW]; null = la de la Guía BT-10 para el tipo habitual (supuesta). */
  ascensor_kW: number | null;
  /** Otros servicios generales [kW]: grupo de presión, central térmica, telecomunicaciones…; null = sin indicar. */
  otrosServicios_kW: number | null;
  spl: Opcion<Spl>;
  /** Plazas con previsión de recarga; null = el 10 % de las plazas (el mínimo del ap. 5.2). */
  plazasRecarga: number | null;
  /** Unifamiliar sin garaje: tiene plaza o zona prevista para un vehículo en la parcela (ITC-BT-52 ap. 3.1). */
  plazaParcela: boolean;
  /** Potencia del garaje con control de humo mecánico [kW] (ventiladores, alumbrado…); null = sin estudiar. */
  garaje_kW: number | null;
};

export const rebtEstadoDefaults: RebtEstado = {
  electrificacion: "habitual",
  ascensor_kW: null,
  otrosServicios_kW: null,
  spl: "habitual",
  plazasRecarga: null,
  plazaParcela: false,
  garaje_kW: null,
};

export interface DecisionesRebt {
  electrificacion: Electrificacion;
  spl: Spl;
}

export const HABITUALES_REBT: DecisionesRebt = { electrificacion: "elevada", spl: "sin_spl" };

function resolver<T>(v: Opcion<T> | undefined, h: T): T {
  return v === "habitual" || v === undefined ? h : v;
}

export function resolverRebt(e: RebtEstado): DecisionesRebt {
  return {
    electrificacion: resolver(e.electrificacion, HABITUALES_REBT.electrificacion),
    spl: resolver(e.spl, HABITUALES_REBT.spl),
  };
}

/** Un número válido y no negativo, o null. */
export function noNegativo(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v >= 0 ? v : null;
}
