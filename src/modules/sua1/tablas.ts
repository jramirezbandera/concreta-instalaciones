// =============================================================================
// DB-SUA, SUA 1 — Seguridad frente al riesgo de caídas (feature-20). Cifras
// verificadas en la imagen de `research/pdf/DBSUA.pdf`, pp. 8–16 y 35–40:
// research/verificacion-sua1.md, bloques A1 a A5. Solo datos y los límites que
// salen de ellos; lo que es criterio de proyecto va al final, fuera de `tablaCTE`.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { Intervalo } from "../si/tablas";
import { PROC_SUA } from "../sua/tablas";

// ---------------------------------------------------------------------------
// Ap. 1 — Resbaladicidad de los suelos
// ---------------------------------------------------------------------------

/**
 * Usos con clase exigible (lista CERRADA, ap. 1 pto 1): Residencial Vivienda y
 * Aparcamiento NO están (A1.2). Se excluyen las zonas de ocupación nula.
 */
export const SUA1_USOS_RESBALADICIDAD = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 1" },
  {
    usos: ["residencial_publico", "sanitario", "docente", "comercial", "administrativo", "publica_concurrencia"],
    excluyeOcupacionNula: true,
  } as const,
);

/** Tabla 1.1 — Clase según Rd (valor PTV, UNE 41901:2017 EX). */
export const SUA1_CLASES_RD = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 2", tabla: "Tabla 1.1" }, [
  { clase: 0, rd: { le: 15 } },
  { clase: 1, rd: { gt: 15, le: 35 } },
  { clase: 2, rd: { gt: 35, le: 45 } },
  { clase: 3, rd: { gt: 45 } },
] as const satisfies readonly { clase: 0 | 1 | 2 | 3; rd: Intervalo }[]);

/**
 * Tabla 1.2 — Clase exigible «como mínimo». Pendiente «menor que el 6 %» /
 * «igual o mayor que el 6 % y escaleras».
 */
export const SUA1_CLASE_EXIGIBLE = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 3", tabla: "Tabla 1.2" }, {
  umbralPendiente_pct: 6,
  interiorSeco: { menor6: 1, mayor6oEscalera: 2 },
  interiorHumedo: { menor6: 2, mayor6oEscalera: 3 },
  exterior: 3,
} as const);

// ---------------------------------------------------------------------------
// Ap. 2 — Discontinuidades (no en uso restringido ni en exteriores)
// ---------------------------------------------------------------------------

export const SUA1_DISCONTINUIDADES = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 2 ptos 1 a 3" }, {
  resaltoJuntaMax_mm: 4,
  salientePuntualMax_mm: 12,
  salienteConAngulo_mm: 6,
  anguloSalienteMax_grados: 45,
  desnivelConPendiente_cm: 5,
  pendienteDesnivelMax_pct: 25,
  esferaPerforacion_cm: 1.5,
  barreraDelimitacionMin_cm: 80,
} as const);

// ---------------------------------------------------------------------------
// Ap. 3 — Desniveles y barreras de protección
// ---------------------------------------------------------------------------

export const SUA1_BARRERAS = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 3.1, 3.2.1 y 3.2.3", tabla: "Figuras 3.1 y 3.2" }, {
  /** Hay barrera si la diferencia de cota es MAYOR que 55 cm. */
  desnivelConBarrera_m: 0.55,
  /** 0,90 m si la diferencia de cota «no exceda de 6 m»; 1,10 m en el resto. */
  alturaHasta6m_m: 0.9,
  alturaMasDe6m_m: 1.1,
  umbralCota_m: 6,
  /** Huecos de escalera de anchura MENOR que 40 cm: 0,90 m sea cual sea la caída. */
  huecoEscaleraEstrecho_cm: 40,
  alturaHuecoEstrecho_m: 0.9,
  /** 3.2.3, cualquier zona de Residencial Vivienda: no escalables y esfera de 10 cm. */
  franjaSinApoyos_cm: [30, 50],
  salienteMaxFranja1_cm: 5,
  franjaSinSalientes_cm: [50, 80],
  fondoMaxFranja2_cm: 15,
  esferaVivienda_cm: 10,
  limiteInferiorBarandillaMax_cm: 5,
  /** Zonas de uso público de otros usos (oficinas): solo la condición b), con 15 cm. */
  esferaOtrosUsosPublico_cm: 15,
  /** 3.1 pto 2: solo uso público, desniveles ≤ 55 cm, diferenciación desde 25 cm del borde. */
  senalizacionUsoPublico_cm: 25,
} as const);

// ---------------------------------------------------------------------------
// Ap. 4.1 — Escaleras de uso restringido
// ---------------------------------------------------------------------------

export const SUA1_ESCALERA_RESTRINGIDA = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 4.1", tabla: "Figura 4.1" }, {
  anchuraMin_m: 0.8,
  contrahuellaMax_cm: 20,
  huellaMin_cm: 22,
} as const);

// ---------------------------------------------------------------------------
// Ap. 4.2 — Escaleras de uso general
// ---------------------------------------------------------------------------

export const SUA1_ESCALERA_GENERAL = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 4.2.1 a 4.2.4" }, {
  huellaMin_cm: 28,
  contrahuellaMin_cm: 13,
  /** 18,5 con ascensor como alternativa y fuera de uso público; 17,5 en los demás casos. */
  contrahuellaMaxConAscensor_cm: 18.5,
  contrahuellaMax_cm: 17.5,
  relacionMin_cm: 54,
  relacionMax_cm: 70,
  tabicaInclinacionMax_grados: 15,
  peldanosMinPorTramo: 3,
  alturaTramoMaxConAscensor_m: 3.2,
  alturaTramoMax_m: 2.25,
  /** «±1 cm» entre tramos de plantas diferentes. */
  variacionContrahuellaMax_cm: 1,
  pasamanosVueloSinDescontar_cm: 12,
  mesetaLongitudMin_m: 1,
  /** Pasamanos si salva más de 55 cm; en ambos lados si la anchura libre excede de 1,20 m o sin ascensor. */
  pasamanosSiSalvaMasDe_m: 0.55,
  pasamanosAmbosLadosSiAnchuraMasDe_m: 1.2,
  pasamanosProlongacion_cm: 30,
  pasamanosAltura_cm: [90, 110],
  pasamanosSeparacionMin_cm: 4,
} as const);

/**
 * Tabla 4.1 — Anchura útil mínima [m], por número de personas: ≤ 25 | ≤ 50 |
 * ≤ 100 | > 100. Solo las filas que se dan en nuestros edificios.
 */
export const SUA1_ANCHURA_TABLA_4_1 = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 4.2.2 pto 4", tabla: "Tabla 4.1" }, {
  /** «Residencial Vivienda, incluso escalera de comunicación con aparcamiento»: casilla única. */
  residencialVivienda: [1.0, 1.0, 1.0, 1.0],
  /** «Casos restantes» (Administrativo). */
  casosRestantes: [0.8, 0.9, 1.0, 1.0],
  /** Nota (2): «Excepto cuando la escalera comunique con una zona accesible, cuyo ancho será de 1,00 m como mínimo.» */
  comunicaZonaAccesible: 1.0,
} as const);

// ---------------------------------------------------------------------------
// Ap. 4.3 — Rampas
// ---------------------------------------------------------------------------

export const SUA1_RAMPAS = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 4.3" }, {
  /** Más del 4 %: rampa. */
  esRampaMasDe_pct: 4,
  pendienteGeneral_pct: 12,
  /** Itinerario accesible, por longitud del tramo en proyección horizontal. */
  accesible: [
    { longitudMenorQue_m: 3, max_pct: 10 },
    { longitudMenorQue_m: 6, max_pct: 8 },
    { longitudMenorQue_m: Infinity, max_pct: 6 },
  ],
  pendienteTransversalAccesible_pct: 2,
  /** Vehículos en aparcamientos también previstas para personas, fuera de itinerario accesible. */
  aparcamientoMixta_pct: 16,
  tramoMaxGeneral_m: 15,
  tramoMaxAccesible_m: 9,
  anchuraAccesibleMin_m: 1.2,
  horizontalExtremosAccesible_m: 1.2,
  mesetaIntermediaAccesible_m: 1.5,
  /** Accesible: pasamanos continuo en ambos lados si la pendiente es ≥ 6 % y salva más de 18,5 cm. */
  pasamanosAmbosPendiente_pct: 6,
  pasamanosAmbosDesnivel_cm: 18.5,
  zocaloMin_cm: 10,
  prolongacionSiTramoMasDe_m: 3,
  prolongacion_cm: 30,
  pasamanosAltura_cm: [90, 110],
  pasamanosSegundoAltura_cm: [65, 75],
} as const);

// ---------------------------------------------------------------------------
// Ap. 5 — Limpieza de los acristalamientos exteriores (solo Residencial Vivienda)
// ---------------------------------------------------------------------------

export const SUA1_LIMPIEZA = tablaCTE({ ...PROC_SUA, articulo: "SUA 1 ap. 5", tabla: "Figura 5.1" }, {
  /** Acristalamientos con vidrio transparente a más de 6 m sobre la rasante exterior. */
  alturaSobreRasanteMasDe_m: 6,
  radioAlcance_m: 0.85,
  alturaMaxPuntoBorde_m: 1.3,
} as const);

// ---------------------------------------------------------------------------
// Los límites que salen de las tablas
// ---------------------------------------------------------------------------

/** Altura mínima de barrera [m] para una diferencia de cota (3.2.1); null si no hace falta (≤ 55 cm). */
export function alturaBarreraMin_m(difCota_m: number): number | null {
  const B = SUA1_BARRERAS.datos;
  if (difCota_m <= B.desnivelConBarrera_m) return null;
  return difCota_m <= B.umbralCota_m ? B.alturaHasta6m_m : B.alturaMasDe6m_m;
}

/** Contrahuella máxima de una escalera de uso general [cm] (4.2.1). */
export function contrahuellaMax_cm(usoPublico: boolean, ascensor: boolean): number {
  const E = SUA1_ESCALERA_GENERAL.datos;
  return !usoPublico && ascensor ? E.contrahuellaMaxConAscensor_cm : E.contrahuellaMax_cm;
}

/** Altura máxima que salva un tramo [m] (4.2.2 pto 1). */
export function alturaTramoMax_m(usoPublico: boolean, ascensor: boolean): number {
  const E = SUA1_ESCALERA_GENERAL.datos;
  return !usoPublico && ascensor ? E.alturaTramoMaxConAscensor_m : E.alturaTramoMax_m;
}

/** Pasamanos en ambos lados (4.2.4 pto 1). */
export function pasamanosAmbosLados(anchura_m: number, ascensor: boolean): boolean {
  return anchura_m > SUA1_ESCALERA_GENERAL.datos.pasamanosAmbosLadosSiAnchuraMasDe_m || !ascensor;
}

/** Pendiente máxima de una rampa de itinerario accesible por la longitud del tramo [%] (4.3.1 a). */
export function pendienteAccesibleMax_pct(longitud_m: number): number {
  return SUA1_RAMPAS.datos.accesible.find((f) => longitud_m < f.longitudMenorQue_m)!.max_pct;
}

// ---------------------------------------------------------------------------
// CRITERIOS de proyecto (no CTE): fuera de tablaCTE para que la ficha no los
// cite como DB. research/verificacion-sua1.md, K1 a K12 y A6.
// ---------------------------------------------------------------------------

export const CRITERIOS_SUA1 = {
  /** K2: contrahuella con que se cuentan los peldaños de la escalera de uso general (cumple con y sin ascensor). */
  contrahuellaCalculo_cm: 17.5,
  /** E11: ídem en la escalera interior de la vivienda. */
  contrahuellaCalculoInterior_cm: 18.5,
  /** K3: huella que da 2C + H más cercano a 63 cm, a medio centímetro. */
  objetivo2CmasH_cm: 63,
  /** K4: tramos por planta (ida y vuelta). */
  tramosPorPlanta: 2,
  /** E7: anchura útil de la escalera común. */
  anchuraEscaleraComun_m: 1.0,
  /** E11: escalera interior. */
  anchuraEscaleraInterior_m: 0.9,
  huellaInterior_cm: 27,
  /** K6: barreras de 1,10 m en todas las plantas y en la cubierta transitable. */
  alturaBarrera_m: 1.1,
  /** E15: pendiente de la rampa del garaje si es también peatonal. */
  pendienteRampaGaraje_pct: 16,
  /** E16: rampa de acceso de menos de 6 m al 8 %. */
  rampaAccesoLongitud_m: 4,
  rampaAccesoPendiente_pct: 8,
  /** K10: un acristalamiento llega a la cota del suelo más el dintel típico. */
  dintelTipico_m: 2.2,
} as const;
