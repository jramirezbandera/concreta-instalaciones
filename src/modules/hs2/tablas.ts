// =============================================================================
// DB-HS 2 — Recogida y evacuación de residuos (feature-21). Tablas y valores
// normativos como DATOS versionados con procedencia (SPEC §4/§11). Aquí SOLO
// datos y fórmulas puras; la justificación vive en `justificacion.ts`.
//
// EDICIÓN: DB-HS consolidado de 14-06-2022 (el mismo PDF que HS 1). HS 2 no la
// tocan la Orden FOM/588/2017 (HS 3) ni el RD 450/2022 (HS 4).
//
// VERIFICACIÓN (research/verificacion-hs2.md): toda cifra cotejada en la imagen
// de las pp. 52–62 de research/pdf/DBHS.pdf. Lo que hay que saber al leerlas:
//   - P cuenta los dormitorios: sencillos + 2 × dobles (ap. 2.1.2.1);
//   - la 2.1 lleva el 0,8 y la 2.2 no; las dos llevan Mf (4 en «varios»);
//   - Ff de la tabla 2.2 es Tf·Gf·Cf con los valores de la tabla A.2 (periodos
//     7, 2, 1, 7, 7 días y contenedor de 330 l): son también los que se suponen
//     para un almacén puerta a puerta sin datos del servicio de recogida.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HS2 = {
  db: "DB-HS2",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 2 (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HS2 = "DB-HS (consolidado 14-jun-2022)";

/** Las cinco fracciones de los residuos ordinarios, en el orden del ap. 2.1.2.1. */
export type Fraccion = "papel" | "envases" | "organica" | "vidrio" | "varios";
export const FRACCIONES: readonly Fraccion[] = ["papel", "envases", "organica", "vidrio", "varios"];

export const NOMBRE_FRACCION: Record<Fraccion, string> = {
  papel: "Papel / cartón",
  envases: "Envases ligeros",
  organica: "Materia orgánica",
  vidrio: "Vidrio",
  varios: "Varios",
};

/** Capacidades de contenedor de edificio de la tabla 2.1 [l]. */
export type CapacidadContenedor = 120 | 240 | 330 | 600 | 800 | 1100;
export const CAPACIDADES: readonly CapacidadContenedor[] = [120, 240, 330, 600, 800, 1100];

/** ap. 2.1.2.1: superficie útil del almacén, S = 0,8·P·Σ(Tf·Gf·Cf·Mf). */
export const ALMACEN_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 2.1.2.1", tabla: "Tabla 2.1" },
  {
    factor: 0.8,
    /** Gf [dm³/(persona·día)]. */
    gf: { papel: 1.55, envases: 8.4, organica: 1.5, vidrio: 0.48, varios: 1.5 } satisfies Record<Fraccion, number>,
    /** Tabla 2.1, Cf [m²/l] por capacidad del contenedor de edificio. */
    cf: { 120: 0.005, 240: 0.0042, 330: 0.0036, 600: 0.0033, 800: 0.003, 1100: 0.0027 } satisfies Record<CapacidadContenedor, number>,
    /** Tabla A.1: superficie de almacenamiento y maniobra de cada contenedor [m²] (Cf = SC/CC). */
    sc: { 120: 0.6, 240: 1.0, 330: 1.2, 600: 2.0, 800: 2.4, 1100: 3.0 } satisfies Record<CapacidadContenedor, number>,
    /** Mf: 4 en «varios», 1 en las demás (no todos separan). */
    mf: { papel: 1, envases: 1, organica: 1, vidrio: 1, varios: 4 } satisfies Record<Fraccion, number>,
  } as const,
);

/** ap. 2.1.2.2: superficie del espacio de reserva, SR = P·Σ(Ff·Mf). */
export const RESERVA_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 2.1.2.2", tabla: "Tabla 2.2" },
  {
    /** Ff [m²/persona]. */
    ff: { papel: 0.039, envases: 0.06, organica: 0.005, vidrio: 0.012, varios: 0.038 } satisfies Record<Fraccion, number>,
  } as const,
);

/**
 * Apéndice A, tabla A.2: los periodos de recogida y el contenedor con los que se
 * obtiene Ff «a falta de datos reales». Se suponen para el almacén puerta a puerta.
 */
export const SUPUESTOS_A2_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "Apéndice A, «Factor de fracción»", tabla: "Tabla A.2" },
  {
    tf: { papel: 7, envases: 2, organica: 1, vidrio: 7, varios: 7 } satisfies Record<Fraccion, number>,
    contenedor: 330 as CapacidadContenedor,
  } as const,
);

/** ap. 2.1.1: situación del almacén y del espacio de reserva, y recorrido hasta el punto de recogida. */
export const SITUACION_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 2.1.1 ptos 1 y 2" },
  {
    /** Fuera del edificio: a menos de 25 m (estricto) de su acceso. */
    distanciaAccesoMenorQue_m: 25,
    anchuraLibre_m: 1.2,
    estrechamiento_minAnchura_m: 1.0,
    estrechamiento_maxLongitud_m: 0.45,
    pendienteMax_pct: 12,
  } as const,
);

/** ap. 2.1.3: otras características del almacén de contenedores. */
export const CARACTERISTICAS_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 2.1.3 pto 1" },
  {
    temperaturaMax_C: 30,
    iluminacion_lux: 100,
    alturaIluminacion_m: 1,
    enchufe: "base de enchufe fija 16 A 2p+T según UNE 20315:2017",
  } as const,
);

/** ap. 2.3: espacios de almacenamiento inmediato en las viviendas, C = CA·Pv. */
export const INMEDIATO_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 2.3", tabla: "Tabla 2.3" },
  {
    /** CA [dm³/persona]. */
    ca: { papel: 10.85, envases: 7.8, organica: 3.0, vidrio: 3.36, varios: 10.5 } satisfies Record<Fraccion, number>,
    /** pto 4: superficie en planta mínima de cada fracción [cm] y capacidad mínima [dm³]. */
    planta_cm: 30,
    capacidadMin_dm3: 45,
    /** pto 6: el punto más alto, a 1,20 m como máximo del suelo. */
    alturaMax_m: 1.2,
    /** pto 7: acabado impermeable y lavable a menos de 30 cm. */
    acabado_cm: 30,
  } as const,
);

/** ap. 3.1, tabla 3.1: mantenimiento del almacén de contenedores. */
export const MANTENIMIENTO_HS2 = tablaCTE(
  { ...PROC_HS2, articulo: "ap. 3.1", tabla: "Tabla 3.1" },
  [
    { operacion: "Limpieza de los contenedores", periodo: "3 días" },
    { operacion: "Desinfección de los contenedores", periodo: "1,5 meses" },
    { operacion: "Limpieza del suelo del almacén", periodo: "1 día" },
    { operacion: "Lavado con manguera del suelo del almacén", periodo: "2 semanas" },
    { operacion: "Limpieza de las paredes, puertas, ventanas, etc.", periodo: "4 semanas" },
    { operacion: "Limpieza general de las paredes y techos del almacén, incluidos los elementos del sistema de ventilación, las luminarias, etc.", periodo: "6 meses" },
    { operacion: "Desinfección, desinsectación y desratización del almacén de contenedores", periodo: "1,5 meses" },
  ] as const,
);

// ── Fórmulas ─────────────────────────────────────────────────────────────────

/** Redondeo hacia arriba a centésimas, sin el ruido de la coma flotante. */
export function arriba2(v: number): number {
  return Math.ceil(Math.round(v * 1e6) / 1e4) / 100;
}

/** Un sumando de la fórmula 2.1: Tf·Gf·Cf·Mf de una fracción [m²/persona]. */
export function sumandoAlmacen(f: Fraccion, tf: number, contenedor: CapacidadContenedor): number {
  const T = ALMACEN_HS2.datos;
  return tf * T.gf[f] * T.cf[contenedor] * T.mf[f];
}

/** Fórmula 2.1: S = 0,8·P·Σ(Tf·Gf·Cf·Mf) [m²], sin redondear. */
export function superficieAlmacen(p: number, fracciones: readonly { f: Fraccion; tf: number; contenedor: CapacidadContenedor }[]): number {
  return ALMACEN_HS2.datos.factor * p * fracciones.reduce((a, x) => a + sumandoAlmacen(x.f, x.tf, x.contenedor), 0);
}

/** Fórmula 2.2: SR = P·Σ(Ff·Mf) [m²], sin redondear. */
export function superficieReserva(p: number, fracciones: readonly Fraccion[]): number {
  const ff = RESERVA_HS2.datos.ff;
  const mf = ALMACEN_HS2.datos.mf;
  return p * fracciones.reduce((a, f) => a + ff[f] * mf[f], 0);
}

/** Fórmula 2.3 con el mínimo del pto 4: capacidad de una fracción en la vivienda [dm³]. */
export function capacidadInmediato(f: Fraccion, pv: number): { calculada_dm3: number; exigida_dm3: number } {
  const T = INMEDIATO_HS2.datos;
  const calculada_dm3 = Math.round(T.ca[f] * pv * 100) / 100;
  return { calculada_dm3, exigida_dm3: Math.max(calculada_dm3, T.capacidadMin_dm3) };
}
