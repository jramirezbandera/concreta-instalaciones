// =============================================================================
// DB-HE 4 — Contribución mínima de energía renovable para cubrir la demanda de
// agua caliente sanitaria (feature-22). Valores normativos como DATOS
// versionados con procedencia (SPEC §4/§11). Aquí SOLO datos y fórmulas puras;
// la justificación vive en `justificacion.ts`.
//
// EDICIÓN: DB-HE consolidado de 14-06-2022 (DB-HE 2019 con el RD 450/2022).
//
// VERIFICACIÓN (research/verificacion-he4-he5.md): cotejado en la imagen de las
// pp. 28–30 (HE 4) y 52–55 (Anejos F y G, la tabla del agua fría casilla a
// casilla a 300 ppp) de research/pdf/DBHE.pdf, con los comentarios de DccHE.pdf
// y los ejemplos de la Guía de aplicación del DB-HE 2019. Lo que hay que saber:
//   - la exigencia es del edificio entero, aunque la producción sea individual;
//   - el factor de centralización solo reduce la demanda de una producción
//     centralizada que sirve a varias viviendas (comentario del Ministerio);
//   - la bomba de calor aporta Qusable·(1 − 1/SCOP) de renovable, y solo con
//     SCOPdhw ≥ 2,5 (eléctrica); la solar térmica, toda su producción útil; la
//     biomasa y las redes urbanas, la fracción fep,ren/fep,tot.
// =============================================================================

import { AGUA_FRIA_ANEJO_G, type AguaFriaCapital } from "../../data/aguaFriaHE";
import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HE4 = {
  db: "DB-HE4",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHE.pdf, Sección HE 4 y Anejos F y G (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HE4 = "DB-HE (consolidado 14-jun-2022)";

/** ap. 1 pto 1 a): edificios nuevos con una demanda de ACS superior a 100 l/d (Anejo F). */
export const AMBITO_HE4 = tablaCTE(
  { ...PROC_HE4, articulo: "ap. 1 pto 1 a)" },
  { demandaMayorQue_l_d: 100 } as const,
);

/**
 * ap. 3.1: contribución renovable mínima, el 70 % de la demanda energética anual
 * (con las pérdidas), que puede bajar al 60 % con una demanda de ACS inferior a
 * 5000 l/d. ap. 3.1 pto 4: SCOPdhw mínimo de la bomba de calor.
 */
export const CONTRIBUCION_HE4 = tablaCTE(
  { ...PROC_HE4, articulo: "ap. 3.1 ptos 1 y 4" },
  {
    general_pct: 70,
    reducida_pct: 60,
    reducidaSiDemandaMenorQue_l_d: 5000,
    scopMinElectrica: 2.5,
    scopMinTermica: 1.15,
    temperaturaPreparacionMin_C: 45,
  } as const,
);

/** Anejo F pto 1: 28 l/día·persona a 60 °C en uso residencial privado. */
export const DEMANDA_VIVIENDA_HE4 = tablaCTE(
  { ...PROC_HE4, articulo: "Anejo F pto 1", tabla: "Tablas a y b-Anejo F" },
  {
    litrosPersonaDia: 28,
    temperaturaReferencia_C: 60,
    /** Tabla a: personas por número de dormitorios (1 a 6); con más de 6, `masDe6`. */
    personas: { 1: 1.5, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6 } as Record<number, number>,
    masDe6: 7,
    /** Tabla b: factor de centralización por número de viviendas (hasta N inclusive). */
    centralizacion: [
      { hasta: 3, factor: 1 },
      { hasta: 10, factor: 0.95 },
      { hasta: 20, factor: 0.9 },
      { hasta: 50, factor: 0.85 },
      { hasta: 75, factor: 0.8 },
      { hasta: 100, factor: 0.75 },
      { hasta: Infinity, factor: 0.7 },
    ],
  } as const,
);

/** Anejo F pto 2, tabla c: demanda orientativa en usos distintos del residencial privado. */
export const DEMANDA_OTROS_HE4 = tablaCTE(
  { ...PROC_HE4, articulo: "Anejo F pto 2", tabla: "Tabla c-Anejo F" },
  { oficinas_l_persona_dia: 2 } as const,
);

/**
 * Fracción renovable (fep,ren / fep,tot, perímetro próximo) de la biomasa sólida:
 * la de los pellets del ejemplo de la Guía de aplicación del DB-HE 2019 (HE4,
 * «Ejemplos de cálculo», caso 2): 1,028 / 1,113.
 */
export const FRACCION_RENOVABLE_HE4 = tablaCTE(
  {
    db: "Guía de aplicación DB-HE 2019",
    edicion: "Ministerio de Transportes, Movilidad y Agenda Urbana",
    articulo: "HE4, ejemplos de cálculo de la aportación renovable, caso 2",
    fuente: "codigotecnico.org · Guia_aplicacion_DBHE2019.pdf p. 65 (cotejado en imagen)",
  },
  { biomasa: 1.028 / 1.113, fepRenBiomasa: 1.028, fepTotBiomasa: 1.113 } as const,
);

/**
 * CRITERIOS de proyecto, no cifras del CTE (research/verificacion-he4-he5.md):
 *   - el calor específico del agua por litro, 4,186 kJ/(kg·K) × 1 kg/l / 3,6 =
 *     1,1628 Wh/(l·K) (física; la Guía escribe DACS = V·c·ρ·(60 − Tred) sin cifras;
 *     K-HE4.8);
 *   - las pérdidas de distribución, acumulación y recirculación cuando el
 *     proyectista no las da: el DB pide que las calcule él (UNE-EN 15316-3 y -5).
 *     Hipótesis del producto, sin fuente normativa (K-HE4.7): 10 % sin
 *     recirculación (producción individual) y 20 % con ella (centralizada);
 *   - por debajo de 2 °C de agua fría corregida se avisa (K-HE4.9).
 */
export const CRITERIOS_HE4 = tablaCTE(
  { db: "Criterio de proyecto", edicion: "feature-22", fuente: "research/verificacion-he4-he5.md" },
  { calorEspecifico_Wh_lK: 1.1628, perdidasSinRecirculacion_pct: 10, perdidasConRecirculacion_pct: 20, aguaFriaMin_C: 2 } as const,
);

/** Meses del año, en el orden de la tabla a-Anejo G. */
export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
/** Días de cada mes (año no bisiesto). */
export const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export type { AguaFriaCapital } from "../../data/aguaFriaHE";

/** Anejo G, tabla a: la tabla compartida (`src/data/aguaFriaHE.ts`), con la cita de HE 4. */
export const AGUA_FRIA_HE4 = AGUA_FRIA_ANEJO_G;

/**
 * Anejo G pto 2: fuera de la capital, TAFY = TAFCP − B·Az, con B = 0,0066 de
 * octubre a marzo y 0,0033 de abril a septiembre, y Az = altitud de la localidad
 * − altitud de la capital.
 */
export const CORRECCION_ALTITUD_HE4 = tablaCTE(
  { ...PROC_HE4, articulo: "Anejo G pto 2" },
  { bInvierno: 0.0066, bVerano: 0.0033, mesesVerano: [3, 4, 5, 6, 7, 8] as readonly number[] } as const,
);

// ── Fórmulas ─────────────────────────────────────────────────────────────────

/** Personas de una vivienda por sus dormitorios (tabla a-Anejo F); el estudio cuenta como uno (criterio). */
export function personasVivienda(dormitorios: number): number {
  const T = DEMANDA_VIVIENDA_HE4.datos;
  const d = Math.max(1, Math.trunc(dormitorios));
  return d > 6 ? T.masDe6 : T.personas[d];
}

/** Factor de centralización de la tabla b-Anejo F para N viviendas. */
export function factorCentralizacion(n: number): number {
  return DEMANDA_VIVIENDA_HE4.datos.centralizacion.find((f) => n <= f.hasta)!.factor;
}

/** Contribución renovable mínima [%] para una demanda de ACS [l/d]. */
export function contribucionMinima(demanda_l_d: number): number {
  const C = CONTRIBUCION_HE4.datos;
  return demanda_l_d < C.reducidaSiDemandaMenorQue_l_d ? C.reducida_pct : C.general_pct;
}

/** Temperatura del agua fría de cada mes en la localidad (Anejo G pto 2) [°C]. */
export function aguaFria(capital: AguaFriaCapital, altitud_m: number): number[] {
  const B = CORRECCION_ALTITUD_HE4.datos;
  const az = Number.isFinite(altitud_m) ? altitud_m - capital.altitud_m : 0;
  return capital.t.map((t, i) => t - (B.mesesVerano.includes(i) ? B.bVerano : B.bInvierno) * az);
}
