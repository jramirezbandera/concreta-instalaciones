// =============================================================================
// DB-HS5 — Evacuación de aguas (saneamiento). Tablas y valores normativos como
// DATOS versionados con procedencia (SPEC §4/§11, trazabilidad innegociable).
//
// Edición: DB-HS Sección HS5, edición 2009 (no modificada). Cada cifra va
// envuelta en `tablaCTE()` con su `ProcedenciaCTE`. Nunca hardcodear cifras
// sueltas en la lógica: la procedencia alimenta la cita legal de la ficha.
//
// Fuente primaria de valores: research Fase 0 del feature-2 (datos VERIFICADOS).
// Todas las tablas reproducen literalmente el DB-HS5-2009 (codigotecnico.org).
//
// Unidades canónicas (src/lib/units/types.ts): UD (unidades de desagüe),
// mm (diámetros), % (pendientes), m (longitudes), dm³/s (desagües continuos),
// Pa (presiones). Los campos llevan SUFIJO DE UNIDAD en su nombre.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

/** Procedencia base común a todo el DB-HS5 edición 2009 (no modificada). */
const PROC_HS5 = {
  db: "DB-HS5",
  edicion: "2009",
  /** Fecha de la edición 2009 del DB-HS (Orden VIV/984/2009, BOE 23/04/2009). */
  fecha: "2009-04-23",
  fuente: "codigotecnico.org · DB-HS Sección HS5",
} as const;

/** Diámetros nominales [mm] usados por las tablas de dimensionado del DB-HS5. */
export type Diametro_mm = number;

/** Pendiente admitida en ramales/colectores [%] (1, 2 o 4). */
export type Pendiente_pct = 1 | 2 | 4;

// -----------------------------------------------------------------------------
// Tabla 4.1 — Unidades de desagüe (UD) y Ø mínimo del sifón y la derivación
// individual, por tipo de aparato y uso (privado / público). [VERIFICADO]
//
// `null` = el aparato no está contemplado para ese uso (no se desglosa ni se
// suma con sus componentes). Los "cuartos" agrupados son sólo de uso PRIVADO y
// entran como un único valor (no se desglosan en sus aparatos).
//
// NOTAS del DB citadas en la procedencia:
//  - Ducha = 2/3 UD (NO 3/6).
//  - Urinario en batería: 3,5 UD sin Ø prescrito.
//  - Fuente para beber: 0,5 UD. (Los UD NO se redondean antes de sumar.)
//  - El Ø de tabla es válido para derivaciones de longitud ≤ 1,5 m; por encima,
//    el motor emite una bandera de aviso (no bloquea).
// -----------------------------------------------------------------------------

/** Tipos de aparato sanitario de la Tabla 4.1 (incluye los "cuartos" agrupados). */
export type TipoAparato =
  | "lavabo"
  | "bide"
  | "ducha"
  | "banera"
  | "inodoro_cisterna"
  | "inodoro_fluxometro"
  | "urinario_pedestal"
  | "urinario_suspendido"
  | "urinario_bateria"
  | "fregadero_cocina"
  | "fregadero_lab_restaurante"
  | "lavadero"
  | "vertedero"
  | "fuente_beber"
  | "sumidero_sifonico"
  | "lavavajillas"
  | "lavadora"
  | "cuarto_bano_cisterna"
  | "cuarto_bano_fluxometro"
  | "cuarto_aseo_cisterna"
  | "cuarto_aseo_fluxometro";

/** Uso del aparato/red: vivienda (privado) o no residencial (público). */
export type UsoAparato = "privado" | "publico";

/**
 * Fila de la Tabla 4.1: UD y Ø mínimo del sifón/derivación por uso.
 * `null` = no contemplado para ese uso.
 */
export interface FilaAparato4_1 {
  readonly ud_privado: number | null;
  readonly ud_publico: number | null;
  readonly diametroMin_mm_privado: number | null;
  readonly diametroMin_mm_publico: number | null;
  /** `true` si es un "cuarto" agrupado (sólo privado, no se desglosa). */
  readonly agrupado?: boolean;
}

export const UD_APARATOS_TABLA_4_1 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.1.1", tabla: "Tabla 4.1" },
  {
    aparatos: {
      lavabo: { ud_privado: 1, ud_publico: 2, diametroMin_mm_privado: 32, diametroMin_mm_publico: 40 },
      bide: { ud_privado: 2, ud_publico: 3, diametroMin_mm_privado: 32, diametroMin_mm_publico: 40 },
      ducha: { ud_privado: 2, ud_publico: 3, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      banera: { ud_privado: 3, ud_publico: 4, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      inodoro_cisterna: { ud_privado: 4, ud_publico: 5, diametroMin_mm_privado: 100, diametroMin_mm_publico: 100 },
      inodoro_fluxometro: { ud_privado: 8, ud_publico: 10, diametroMin_mm_privado: 100, diametroMin_mm_publico: 100 },
      urinario_pedestal: { ud_privado: null, ud_publico: 4, diametroMin_mm_privado: null, diametroMin_mm_publico: 50 },
      urinario_suspendido: { ud_privado: null, ud_publico: 2, diametroMin_mm_privado: null, diametroMin_mm_publico: 40 },
      urinario_bateria: { ud_privado: null, ud_publico: 3.5, diametroMin_mm_privado: null, diametroMin_mm_publico: null },
      fregadero_cocina: { ud_privado: 3, ud_publico: 6, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      fregadero_lab_restaurante: { ud_privado: null, ud_publico: 2, diametroMin_mm_privado: null, diametroMin_mm_publico: 40 },
      lavadero: { ud_privado: 3, ud_publico: null, diametroMin_mm_privado: 40, diametroMin_mm_publico: null },
      vertedero: { ud_privado: null, ud_publico: 8, diametroMin_mm_privado: null, diametroMin_mm_publico: 100 },
      fuente_beber: { ud_privado: null, ud_publico: 0.5, diametroMin_mm_privado: null, diametroMin_mm_publico: 25 },
      sumidero_sifonico: { ud_privado: 1, ud_publico: 3, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      lavavajillas: { ud_privado: 3, ud_publico: 6, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      lavadora: { ud_privado: 3, ud_publico: 6, diametroMin_mm_privado: 40, diametroMin_mm_publico: 50 },
      // Agrupados (sólo uso privado, NO se desglosan ni se suman con componentes).
      cuarto_bano_cisterna: { ud_privado: 7, ud_publico: null, diametroMin_mm_privado: 100, diametroMin_mm_publico: null, agrupado: true },
      cuarto_bano_fluxometro: { ud_privado: 8, ud_publico: null, diametroMin_mm_privado: 100, diametroMin_mm_publico: null, agrupado: true },
      cuarto_aseo_cisterna: { ud_privado: 6, ud_publico: null, diametroMin_mm_privado: 100, diametroMin_mm_publico: null, agrupado: true },
      cuarto_aseo_fluxometro: { ud_privado: 8, ud_publico: null, diametroMin_mm_privado: 100, diametroMin_mm_publico: null, agrupado: true },
    } satisfies Record<TipoAparato, FilaAparato4_1>,
    /** Longitud máxima de derivación individual para la que vale el Ø de tabla. */
    longitudMaxDerivacion_m: 1.5,
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.2 — UD de aparatos no incluidos en la 4.1, por Ø de su desagüe [mm].
// [VERIFICADO]  Además: desagües continuos → 1 UD por cada 0,03 dm³/s.
// -----------------------------------------------------------------------------
export const UD_POR_DIAMETRO_TABLA_4_2 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.1.1 pto 5", tabla: "Tabla 4.2" },
  {
    /** Ø de desagüe [mm] → UD asignadas. */
    porDiametro: { 32: 1, 40: 2, 50: 3, 60: 4, 80: 5, 100: 6 } as Readonly<Record<number, number>>,
  },
);

/** Desagües continuos: 1 UD por cada 0,03 dm³/s (ap. 4.1.1.1 pto 2). */
export const UD_DESAGUE_CONTINUO = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.1.1 pto 2" },
  { caudalPorUD_dm3_s: 0.03 } as const,
);

// -----------------------------------------------------------------------------
// Tabla 4.3 — Ramales colectores entre aparatos sanitarios y bajante. [VERIF]
// UD máximas admisibles por pendiente (1% / 2% / 4%) para cada Ø [mm].
// `null` = ese Ø no se admite a esa pendiente. (Pendiente 1% sólo desde Ø90.)
// El motor elige el MENOR Ø cuya UD máx (a la pendiente del tramo) ≥ UD del tramo.
// -----------------------------------------------------------------------------

/** Fila de una tabla de capacidad por pendiente: UD máx a 1%/2%/4%. `null` = no admitido. */
export interface FilaPendiente {
  readonly diametro_mm: number;
  /** UD máx por pendiente; `null` = no admitido a esa pendiente. */
  readonly p1: number | null;
  readonly p2: number | null;
  readonly p4: number | null;
}

export const RAMALES_COLECTORES_TABLA_4_3 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.1.3", tabla: "Tabla 4.3" },
  {
    /** Ordenada por Ø ascendente: el motor toma el primer Ø que cubre la UD. */
    filas: [
      { diametro_mm: 32, p1: null, p2: 1, p4: 1 },
      { diametro_mm: 40, p1: null, p2: 2, p4: 3 },
      { diametro_mm: 50, p1: null, p2: 6, p4: 8 },
      { diametro_mm: 63, p1: null, p2: 11, p4: 14 },
      { diametro_mm: 75, p1: null, p2: 21, p4: 28 },
      { diametro_mm: 90, p1: 47, p2: 60, p4: 75 },
      { diametro_mm: 110, p1: 123, p2: 151, p4: 181 },
      { diametro_mm: 125, p1: 180, p2: 234, p4: 280 },
      { diametro_mm: 160, p1: 438, p2: 582, p4: 800 },
      { diametro_mm: 200, p1: 870, p2: 1150, p4: 1680 },
    ] satisfies readonly FilaPendiente[],
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.4 — Bajantes de aguas residuales. [VERIFICADO]
// Por cada Ø [mm]: UD máx en la bajante (≤3 plantas / >3 plantas) y UD máx en un
// ramal de una planta (≤3 plantas / >3 plantas).
//
// SELECCIÓN (literal, citar en ficha): el Ø de la bajante es el MAYOR de los dos
// Ø obtenidos por (UD total en la bajante) y (UD máx en un solo ramal de planta),
// según el nº de plantas. Reglas físicas (literal): agua ≤ 1/3 de la sección;
// sobrepresión/depresión ≤ ±250 Pa. Desviaciones <45° sin cambio de Ø; >45° el
// tramo desviado se dimensiona como colector al 4%.
// -----------------------------------------------------------------------------

/** Fila de la Tabla 4.4: capacidades de la bajante y del ramal por nº de plantas. */
export interface FilaBajante4_4 {
  readonly diametro_mm: number;
  /** UD máx en la bajante con ≤ 3 plantas. */
  readonly bajanteHasta3: number;
  /** UD máx en la bajante con > 3 plantas. */
  readonly bajanteMas3: number;
  /** UD máx en un ramal por planta con ≤ 3 plantas. */
  readonly ramalHasta3: number;
  /** UD máx en un ramal por planta con > 3 plantas. */
  readonly ramalMas3: number;
}

export const BAJANTES_TABLA_4_4 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.2", tabla: "Tabla 4.4" },
  {
    /** Umbral de nº de plantas que separa las columnas ≤3 / >3. */
    umbralPlantas: 3,
    /** Reglas físicas (citables): llenado máx y sobrepresión admisible. */
    llenadoMaxFraccion: 1 / 3,
    sobrepresionMax_Pa: 250,
    filas: [
      { diametro_mm: 50, bajanteHasta3: 10, bajanteMas3: 25, ramalHasta3: 6, ramalMas3: 6 },
      { diametro_mm: 63, bajanteHasta3: 19, bajanteMas3: 38, ramalHasta3: 11, ramalMas3: 9 },
      { diametro_mm: 75, bajanteHasta3: 27, bajanteMas3: 53, ramalHasta3: 21, ramalMas3: 13 },
      { diametro_mm: 90, bajanteHasta3: 135, bajanteMas3: 280, ramalHasta3: 70, ramalMas3: 53 },
      { diametro_mm: 110, bajanteHasta3: 360, bajanteMas3: 740, ramalHasta3: 181, ramalMas3: 134 },
      { diametro_mm: 125, bajanteHasta3: 540, bajanteMas3: 1100, ramalHasta3: 280, ramalMas3: 200 },
      { diametro_mm: 160, bajanteHasta3: 1208, bajanteMas3: 2240, ramalHasta3: 1120, ramalMas3: 400 },
      { diametro_mm: 200, bajanteHasta3: 2200, bajanteMas3: 3600, ramalHasta3: 1680, ramalMas3: 600 },
      { diametro_mm: 250, bajanteHasta3: 3800, bajanteMas3: 5600, ramalHasta3: 2500, ramalMas3: 1000 },
      { diametro_mm: 315, bajanteHasta3: 6000, bajanteMas3: 9240, ramalHasta3: 4320, ramalMas3: 1650 },
    ] satisfies readonly FilaBajante4_4[],
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.5 — Colectores horizontales de aguas residuales. [VERIFICADO]
// UD máx por pendiente (1% / 2% / 4%) para cada Ø [mm]. `null` = no admitido.
// Regla (literal): colectores a MEDIA sección, máx 3/4 de sección. Pendientes
// mínimas: colgado ≥ 1 %, enterrado ≥ 2 %.
// -----------------------------------------------------------------------------
export const COLECTORES_TABLA_4_5 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.1.3", tabla: "Tabla 4.5" },
  {
    /** Pendiente mínima [%] de colector según disposición. */
    pendienteMinColgado_pct: 1,
    pendienteMinEnterrado_pct: 2,
    filas: [
      { diametro_mm: 50, p1: null, p2: 20, p4: 25 },
      { diametro_mm: 63, p1: null, p2: 24, p4: 29 },
      { diametro_mm: 75, p1: null, p2: 38, p4: 57 },
      { diametro_mm: 90, p1: 96, p2: 130, p4: 160 },
      { diametro_mm: 110, p1: 264, p2: 321, p4: 382 },
      { diametro_mm: 125, p1: 390, p2: 480, p4: 580 },
      { diametro_mm: 160, p1: 880, p2: 1056, p4: 1300 },
      { diametro_mm: 200, p1: 1600, p2: 1920, p4: 2300 },
      { diametro_mm: 250, p1: 2900, p2: 3500, p4: 4200 },
      { diametro_mm: 315, p1: 5710, p2: 6920, p4: 8290 },
      { diametro_mm: 350, p1: 8300, p2: 10000, p4: 12000 },
    ] satisfies readonly FilaPendiente[],
  },
);

// -----------------------------------------------------------------------------
// Sifones / cierre hidráulico — ap. 3.3.1.1 / 4.1.1.2. [VERIFICADO]
// -----------------------------------------------------------------------------
export const SIFONES = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.1.1 / 4.1.1.2" },
  {
    cierreContinuoMin_mm: 50,
    cierreDiscontinuoMin_mm: 70,
    cierreMax_mm: 100,
    /** Distancia máx de la corona del sifón bajo la válvula de desagüe. */
    coronaBajoValvulaMax_mm: 600,
    /** Cierre residual por debajo del cual el sifón no es admisible. */
    cierreResidualMin_mm: 25,
    // Bote sifónico:
    boteDiametroMin_mm: 110,
    boteSalidaMin_mm: 50,
    boteEntradaMin_mm: 20,
    /** Distancia máx del bote sifónico a la bajante. */
    boteDistanciaBajanteMax_m: 2.0,
  } as const,
);

// =============================================================================
// VENTILACIÓN DE LA RED DE EVACUACIÓN — ap. 3.3.3 / 4.4.
// =============================================================================

// -----------------------------------------------------------------------------
// Ventilación PRIMARIA — ap. 3.3.3.1 / 4.4.1. [VERIFICADO]
// Suficiente por sí sola si el edificio tiene < 7 plantas (o < 11 si la bajante
// está sobredimensionada y los ramales miden < 5 m). Ø primaria = Ø bajante.
// -----------------------------------------------------------------------------
export const VENT_PRIMARIA = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.3.1 / 4.4.1" },
  {
    /** Nº de plantas por debajo del cual la primaria basta por sí sola. */
    maxPlantasSolo: 7,
    /** Idem si la bajante está sobredimensionada y los ramales < 5 m. */
    maxPlantasSoloSobredimensionada: 11,
    longitudRamalParaSobredim_m: 5,
    /** Prolongación mín. sobre cubierta no transitable / transitable [m]. */
    prolongacionNoTransitableMin_m: 1.3,
    prolongacionTransitableMin_m: 2.0,
    /** Separaciones de la salida. */
    separacionTomaAireMin_m: 6,
    separacionHuecosHabitablesMin_m: 0.5,
  } as const,
);

// -----------------------------------------------------------------------------
// Ventilación SECUNDARIA — ap. 3.3.3.2 / 4.4.2. [VERIFICADO]
// Obligatoria en edificios ≥ 7 plantas. Conexiones en plantas alternas si < 15
// plantas (Tabla 4.10), en cada planta si ≥ 15 (Tabla 4.11). Ø columna ≥ ½ Ø
// bajante.
// -----------------------------------------------------------------------------
export const VENT_SECUNDARIA = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.3.2 / 4.4.2" },
  {
    /** A partir de este nº de plantas, la secundaria es obligatoria. */
    minPlantasObligatoria: 7,
    /** < este nº → conexiones en plantas alternas (4.10); ≥ → cada planta (4.11). */
    umbralCadaPlanta: 15,
    /** Ø de la columna de ventilación ≥ esta fracción del Ø de la bajante. */
    fraccionMinDiametroBajante: 0.5,
  } as const,
);

// -----------------------------------------------------------------------------
// Tabla 4.10 — Ventilación secundaria con conexiones en plantas ALTERNAS.
// [VERIFICADO]  Máxima longitud efectiva [m] de la columna de ventilación, en
// función de (Ø bajante, UD de escalón) y del Ø de la columna de ventilación.
// Celda ausente = combinación NO válida. Columnas: Ø ventilación [mm].
// -----------------------------------------------------------------------------

/** Columnas de Ø de ventilación de la Tabla 4.10 [mm]. */
export const DIAMETROS_VENT_4_10 = [32, 40, 50, 63, 65, 80, 100, 125, 150, 200] as const;

/** Fila de la Tabla 4.10: longitud efectiva máx [m] por Ø de ventilación. */
export interface FilaVent4_10 {
  readonly diametroBajante_mm: number;
  readonly udEscalon: number;
  /** Ø ventilación [mm] → longitud efectiva máx [m]. Ausente = no válido. */
  readonly longitudMax_m: Readonly<Record<number, number>>;
}

export const VENT_SECUNDARIA_ALTERNAS_TABLA_4_10 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.4.2", tabla: "Tabla 4.10" },
  {
    filas: [
      { diametroBajante_mm: 32, udEscalon: 2, longitudMax_m: { 32: 9 } },
      { diametroBajante_mm: 40, udEscalon: 8, longitudMax_m: { 32: 15, 40: 45 } },
      { diametroBajante_mm: 50, udEscalon: 10, longitudMax_m: { 32: 9, 40: 30 } },
      { diametroBajante_mm: 50, udEscalon: 24, longitudMax_m: { 32: 7, 40: 14, 50: 40 } },
      { diametroBajante_mm: 63, udEscalon: 19, longitudMax_m: { 40: 13, 50: 38, 63: 100 } },
      { diametroBajante_mm: 63, udEscalon: 40, longitudMax_m: { 40: 10, 50: 32, 63: 90 } },
      { diametroBajante_mm: 75, udEscalon: 27, longitudMax_m: { 40: 10, 50: 25, 63: 68, 65: 130 } },
      { diametroBajante_mm: 75, udEscalon: 54, longitudMax_m: { 40: 8, 50: 20, 63: 63, 65: 120 } },
      { diametroBajante_mm: 90, udEscalon: 65, longitudMax_m: { 50: 14, 63: 30, 65: 93, 80: 175 } },
      { diametroBajante_mm: 90, udEscalon: 153, longitudMax_m: { 50: 12, 63: 26, 65: 58, 80: 145 } },
      { diametroBajante_mm: 110, udEscalon: 180, longitudMax_m: { 63: 15, 65: 56, 80: 97, 100: 290 } },
      { diametroBajante_mm: 110, udEscalon: 360, longitudMax_m: { 63: 10, 65: 51, 80: 79, 100: 270 } },
      { diametroBajante_mm: 110, udEscalon: 740, longitudMax_m: { 63: 8, 65: 48, 80: 73, 100: 220 } },
      { diametroBajante_mm: 125, udEscalon: 300, longitudMax_m: { 63: 6, 65: 45, 80: 65, 100: 100, 125: 300 } },
      { diametroBajante_mm: 125, udEscalon: 540, longitudMax_m: { 65: 42, 80: 57, 100: 85, 125: 250 } },
      { diametroBajante_mm: 125, udEscalon: 1100, longitudMax_m: { 65: 40, 80: 47, 100: 70, 125: 210 } },
      { diametroBajante_mm: 160, udEscalon: 696, longitudMax_m: { 80: 32, 100: 47, 125: 100, 150: 340 } },
      { diametroBajante_mm: 160, udEscalon: 1048, longitudMax_m: { 80: 31, 100: 40, 125: 90, 150: 310 } },
      { diametroBajante_mm: 160, udEscalon: 1960, longitudMax_m: { 80: 25, 100: 34, 125: 60, 150: 220 } },
      { diametroBajante_mm: 200, udEscalon: 1000, longitudMax_m: { 100: 28, 125: 37, 150: 202, 200: 380 } },
      { diametroBajante_mm: 200, udEscalon: 1400, longitudMax_m: { 100: 25, 125: 30, 150: 185, 200: 360 } },
      { diametroBajante_mm: 200, udEscalon: 2200, longitudMax_m: { 100: 19, 125: 22, 150: 157, 200: 330 } },
      { diametroBajante_mm: 200, udEscalon: 3600, longitudMax_m: { 100: 18, 125: 20, 150: 150, 200: 250 } },
      { diametroBajante_mm: 250, udEscalon: 2500, longitudMax_m: { 100: 10, 125: 18, 150: 75, 200: 150 } },
      { diametroBajante_mm: 250, udEscalon: 3800, longitudMax_m: { 125: 16, 150: 40, 200: 105 } },
      { diametroBajante_mm: 250, udEscalon: 5600, longitudMax_m: { 125: 14, 150: 25, 200: 75 } },
      { diametroBajante_mm: 315, udEscalon: 4450, longitudMax_m: { 125: 7, 150: 8, 200: 15 } },
      { diametroBajante_mm: 315, udEscalon: 6508, longitudMax_m: { 125: 6, 150: 7, 200: 12 } },
      { diametroBajante_mm: 315, udEscalon: 9046, longitudMax_m: { 125: 5, 150: 6, 200: 10 } },
    ] satisfies readonly FilaVent4_10[],
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.11 — Ventilación secundaria con conexión en CADA planta. [VERIFICADO]
// Ø de la bajante [mm] → Ø de la columna de ventilación [mm].
// -----------------------------------------------------------------------------
export const VENT_SECUNDARIA_CADA_PLANTA_TABLA_4_11 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.4.2", tabla: "Tabla 4.11" },
  {
    /** Ø bajante [mm] → Ø columna de ventilación [mm]. */
    porDiametroBajante: {
      40: 32, 50: 32, 63: 40, 75: 40, 90: 50, 110: 63, 125: 75, 160: 90, 200: 110, 250: 125, 315: 160,
    } as Readonly<Record<number, number>>,
  },
);

// -----------------------------------------------------------------------------
// Ventilación TERCIARIA — ap. 3.3.3.3 / 4.4.3. [VERIFICADO]
// Obligatoria si los ramales miden > 5 m o el edificio tiene > 14 plantas.
// OJO: la regla "Ø terciaria ≥ ½ Ø ramal" NO existe; va por la Tabla 4.12.
// -----------------------------------------------------------------------------
export const VENT_TERCIARIA = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.3.3 / 4.4.3" },
  {
    /** Longitud de ramal por encima de la cual la terciaria es obligatoria. */
    longitudRamalObligatoria_m: 5,
    /** Nº de plantas por encima del cual la terciaria es obligatoria. */
    maxPlantasSinTerciaria: 14,
  } as const,
);

// -----------------------------------------------------------------------------
// Tabla 4.12 — Ventilación terciaria de ramales. [VERIFICADO]
// Máxima longitud [m] del ramal de ventilación según (Ø ramal de desagüe,
// pendiente %) y Ø del ramal de ventilación. ">300" se modela como Infinity.
// Columnas: Ø ramal ventilación [mm]. Celda ausente = no válido.
// -----------------------------------------------------------------------------

/** Columnas de Ø de ramal de ventilación de la Tabla 4.12 [mm]. */
export const DIAMETROS_VENT_4_12 = [32, 40, 50, 65, 80] as const;

/** Fila de la Tabla 4.12: long. máx [m] por Ø de ramal de ventilación. */
export interface FilaVent4_12 {
  readonly diametroRamal_mm: number;
  readonly pendiente_pct: number;
  /** Ø ventilación [mm] → longitud máx [m] (Infinity = ">300"). Ausente = no válido. */
  readonly longitudMax_m: Readonly<Record<number, number>>;
}

export const VENT_TERCIARIA_TABLA_4_12 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.4.3", tabla: "Tabla 4.12" },
  {
    filas: [
      { diametroRamal_mm: 32, pendiente_pct: 2, longitudMax_m: { 32: Infinity } },
      { diametroRamal_mm: 40, pendiente_pct: 2, longitudMax_m: { 32: Infinity, 40: Infinity } },
      { diametroRamal_mm: 50, pendiente_pct: 1, longitudMax_m: { 32: Infinity, 40: Infinity, 50: Infinity } },
      { diametroRamal_mm: 50, pendiente_pct: 2, longitudMax_m: { 32: Infinity, 40: Infinity, 50: Infinity } },
      { diametroRamal_mm: 65, pendiente_pct: 1, longitudMax_m: { 32: 300, 40: Infinity, 50: Infinity, 65: Infinity } },
      { diametroRamal_mm: 65, pendiente_pct: 2, longitudMax_m: { 32: 250, 40: Infinity, 50: Infinity, 65: Infinity } },
      { diametroRamal_mm: 80, pendiente_pct: 1, longitudMax_m: { 32: 200, 40: 300, 50: Infinity, 65: Infinity, 80: Infinity } },
      { diametroRamal_mm: 80, pendiente_pct: 2, longitudMax_m: { 32: 100, 40: 215, 50: Infinity, 65: Infinity, 80: Infinity } },
      { diametroRamal_mm: 100, pendiente_pct: 1, longitudMax_m: { 32: 40, 40: 110, 50: 300, 65: Infinity, 80: Infinity } },
      { diametroRamal_mm: 100, pendiente_pct: 2, longitudMax_m: { 32: 20, 40: 44, 50: 180, 65: Infinity, 80: Infinity } },
      { diametroRamal_mm: 125, pendiente_pct: 1, longitudMax_m: { 40: 28, 50: 107, 65: 255, 80: Infinity } },
      { diametroRamal_mm: 125, pendiente_pct: 2, longitudMax_m: { 40: 15, 50: 48, 65: 125, 80: Infinity } },
      { diametroRamal_mm: 150, pendiente_pct: 1, longitudMax_m: { 40: 37, 50: 96, 65: Infinity, 80: Infinity } },
      { diametroRamal_mm: 150, pendiente_pct: 2, longitudMax_m: { 40: 18, 50: 47, 65: Infinity, 80: Infinity } },
    ] satisfies readonly FilaVent4_12[],
  },
);

// -----------------------------------------------------------------------------
// Válvulas de aireación (alternativa a la ventilación secundaria) — ap. 3.3.3.4.
// [VERIFICADO]  1 válvula si ≤ 5 plantas; 1 cada 4 plantas si más.
// -----------------------------------------------------------------------------
export const VALVULAS_AIREACION = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.3.4" },
  {
    maxPlantasUnaValvula: 5,
    plantasPorValvulaSiMas: 4,
  } as const,
);

// =============================================================================
// HELPERS DE LOOKUP — todas las cifras salen de las tablas anteriores.
// =============================================================================

/**
 * UD máx de una FilaPendiente para una pendiente dada [%] (1/2/4).
 * Pendientes no tabuladas se mapean al tramo aplicable (p.ej. 3% usa 2%).
 */
export function capacidadAPendiente(fila: FilaPendiente, pendiente_pct: number): number | null {
  if (pendiente_pct >= 4) return fila.p4;
  if (pendiente_pct >= 2) return fila.p2;
  if (pendiente_pct >= 1) return fila.p1;
  // < 1 %: por debajo de la pendiente mínima tabulada; sin capacidad.
  return null;
}

/**
 * Selecciona el MENOR Ø de una tabla de capacidad por pendiente cuya UD máx (a
 * la pendiente dada) cubra `ud`. Devuelve `null` si ninguna fila lo cubre.
 */
export function seleccionarDiametroPorPendiente(
  filas: readonly FilaPendiente[],
  ud: number,
  pendiente_pct: number,
): { diametro_mm: number; capacidad_ud: number } | null {
  for (const f of filas) {
    const cap = capacidadAPendiente(f, pendiente_pct);
    if (cap !== null && ud <= cap) {
      return { diametro_mm: f.diametro_mm, capacidad_ud: cap };
    }
  }
  return null;
}
