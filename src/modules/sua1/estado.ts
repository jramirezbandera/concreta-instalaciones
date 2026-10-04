// =============================================================================
// DB-SUA, SUA 1 — Lo que guarda el módulo (feature-20): las decisiones del
// proyectista que El edificio no describe (cómo es la escalera, la altura de las
// barreras, las rampas, la carpintería…). Cada una se guarda como «habitual»
// mientras coincida con lo habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-sua1.md A6 y K1 a K12): escalera
// común de 1,00 m, con la huella que da 2C + H ≈ 63 cm y dos tramos por planta,
// ojo estrecho; escalera interior de 0,90 m y huella de 27 cm; barreras de
// 1,10 m en todas las plantas; rampa del garaje solo para vehículos (el peatón
// va por la escalera); portal a cota de la calle; oficinas sin uso público; hojas
// practicables. El ascensor no se decide aquí: es de SUA 9 y El edificio.
// =============================================================================

import { CRITERIOS_SUA1 } from "./tablas";

export type Opcion<T> = T | "habitual";
export type Tramos = 1 | 2 | 3 | 4;
/** Ojo de la escalera: menor que 40 cm (estrecho) o no. */
export type Ojo = "estrecho" | "ancho";
export type RampaGaraje = "vehiculos" | "peatones";
export type Acceso = "cota" | "rampa";
export type SiNo = "si" | "no";
/** Practicables o desmontables (fuera del ap. 5) o con partes fijas (condiciones a y b). */
export type Carpinteria = "practicable" | "fijos";

export type Sua1Estado = {
  /** Escalera común y del garaje. */
  anchura_m: Opcion<number>;
  huella_cm: Opcion<number>;
  tramos: Opcion<Tramos>;
  ojo: Opcion<Ojo>;
  /** Escalera interior de la vivienda. */
  interiorAnchura_m: Opcion<number>;
  interiorHuella_cm: Opcion<number>;
  /** Barreras donde la diferencia de cota no excede de 6 m y donde excede. */
  barreraBaja_m: Opcion<number>;
  barreraAlta_m: Opcion<number>;
  rampaGaraje: Opcion<RampaGaraje>;
  pendienteGaraje_pct: Opcion<number>;
  acceso: Opcion<Acceso>;
  rampaLongitud_m: Opcion<number>;
  rampaPendiente_pct: Opcion<number>;
  /** Oficinas con zonas de uso público (atención al público, salas de visitas). */
  usoPublico: Opcion<SiNo>;
  carpinteria: Opcion<Carpinteria>;
};

export interface DecisionesSua1 {
  anchura_m: number;
  huella_cm: number;
  tramos: Tramos;
  ojo: Ojo;
  interiorAnchura_m: number;
  interiorHuella_cm: number;
  barreraBaja_m: number;
  barreraAlta_m: number;
  rampaGaraje: RampaGaraje;
  pendienteGaraje_pct: number;
  acceso: Acceso;
  rampaLongitud_m: number;
  rampaPendiente_pct: number;
  usoPublico: SiNo;
  carpinteria: Carpinteria;
}

export const sua1EstadoDefaults: Sua1Estado = {
  anchura_m: "habitual",
  huella_cm: "habitual",
  tramos: "habitual",
  ojo: "habitual",
  interiorAnchura_m: "habitual",
  interiorHuella_cm: "habitual",
  barreraBaja_m: "habitual",
  barreraAlta_m: "habitual",
  rampaGaraje: "habitual",
  pendienteGaraje_pct: "habitual",
  acceso: "habitual",
  rampaLongitud_m: "habitual",
  rampaPendiente_pct: "habitual",
  usoPublico: "habitual",
  carpinteria: "habitual",
};

const K = CRITERIOS_SUA1;

/** Lo habitual que no depende del edificio; la huella y los tramos los calcula la justificación. */
export function habitualesFijos(): Omit<DecisionesSua1, "huella_cm" | "tramos"> {
  return {
    anchura_m: K.anchuraEscaleraComun_m,
    ojo: "estrecho",
    interiorAnchura_m: K.anchuraEscaleraInterior_m,
    interiorHuella_cm: K.huellaInterior_cm,
    barreraBaja_m: K.alturaBarrera_m,
    barreraAlta_m: K.alturaBarrera_m,
    rampaGaraje: "vehiculos",
    pendienteGaraje_pct: K.pendienteRampaGaraje_pct,
    acceso: "cota",
    rampaLongitud_m: K.rampaAccesoLongitud_m,
    rampaPendiente_pct: K.rampaAccesoPendiente_pct,
    usoPublico: "no",
    carpinteria: "practicable",
  };
}

/** Las decisiones: lo guardado o, si es «habitual» (o falta), lo habitual. */
export function resolverSua1(e: Sua1Estado, h: DecisionesSua1): DecisionesSua1 {
  const v = <K extends keyof DecisionesSua1>(k: K): DecisionesSua1[K] => {
    const x = e[k];
    return (x === "habitual" || x === undefined || x === null ? h[k] : x) as DecisionesSua1[K];
  };
  return {
    anchura_m: v("anchura_m"),
    huella_cm: v("huella_cm"),
    tramos: v("tramos"),
    ojo: v("ojo"),
    interiorAnchura_m: v("interiorAnchura_m"),
    interiorHuella_cm: v("interiorHuella_cm"),
    barreraBaja_m: v("barreraBaja_m"),
    barreraAlta_m: v("barreraAlta_m"),
    rampaGaraje: v("rampaGaraje"),
    pendienteGaraje_pct: v("pendienteGaraje_pct"),
    acceso: v("acceso"),
    rampaLongitud_m: v("rampaLongitud_m"),
    rampaPendiente_pct: v("rampaPendiente_pct"),
    usoPublico: v("usoPublico"),
    carpinteria: v("carpinteria"),
  };
}
