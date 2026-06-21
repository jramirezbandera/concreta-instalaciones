// =============================================================================
// DB-HS3 — Calidad del aire interior. Tablas y valores normativos como DATOS
// versionados con procedencia (SPEC §4/§11, trazabilidad innegociable).
//
// Edición vigente: Orden FOM/588/2017, consolidada por RD 732/2019.
// Cada cifra va envuelta en `tablaCTE()` con su `ProcedenciaCTE`. Nunca
// hardcodear cifras sueltas: la procedencia alimenta la cita legal de la ficha.
//
// Fuente primaria de valores: research/area-1-calculo-cte-tier1.md (A1-02..A1-07)
// y research/verif-area-1.md (todos VERIFICADOS con confianza alta, salvo donde
// se indique). Las tablas marcadas PENDIENTE no se inventan (ver TIRO_TABLA_4_3).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

/** Procedencia base común a todo el DB-HS3 vigente (FOM/588/2017 + RD 732/2019). */
const PROC_HS3 = {
  db: "DB-HS3",
  edicion: "FOM/588/2017",
  /** Fecha del RD 732/2019 que consolida (BOE 27/12/2019). */
  fecha: "2019-12-24",
  fuente: "codigotecnico.org",
} as const;

// -----------------------------------------------------------------------------
// Tabla 2.1 — Caudales mínimos para ventilación de caudal CONSTANTE en locales
// habitables [l/s]. [A1-02, VERIFICADO alta, verif líneas 23-32]
//
// ATENCIÓN: es la tabla 2.1 de la versión VIGENTE (post-FOM/588/2017),
// "Caudales mínimos para ventilación de caudal constante en locales habitables".
// NO confundir con la tabla 2.1 de HS3-2009 ("Caudales de ventilación mínimos
// exigidos"), que es distinta. (IDR/research, "Contexto de versiones").
//
// Indexado por número de dormitorios de la vivienda en tres categorías:
//   "0-1" → 0 o 1 dormitorio · "2" → 2 dormitorios · "3+" → 3 o más dormitorios.
// `null` = no aplica esa fila para esa categoría (p.ej. "resto de dormitorios"
// no existe en viviendas de 0-1 dormitorio).
//
// Notas de la tabla (literal research A1-02):
//  (1) En locales secos de uso multiuso se toma el caudal del uso de mayor caudal.
//  (2) Si un local tiene zona seca y zona húmeda, cada zona se dota de su caudal.
//  (3) "Salas de estar y comedores" incluye otros locales de uso similar
//      (salas de juego, despachos, etc.).
// -----------------------------------------------------------------------------

/** Categorías de nº de dormitorios usadas para indexar la tabla 2.1. */
export type CategoriaDormitorios = "0-1" | "2" | "3+";

/** Una fila de la tabla 2.1: caudal [l/s] por categoría de dormitorios. */
export type FilaCaudal2_1 = Readonly<Record<CategoriaDormitorios, number | null>>;

export const CAUDALES_LOCALES_HABITABLES = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 2", tabla: "Tabla 2.1" },
  {
    /** Dormitorio principal: 8 / 8 / 8 l/s. */
    dormitorioPrincipal: { "0-1": 8, "2": 8, "3+": 8 },
    /** Resto de dormitorios: — / 4 / 4 l/s (no aplica en 0-1 dormitorio). */
    restoDormitorios: { "0-1": null, "2": 4, "3+": 4 },
    /** Salas de estar y comedores: 6 / 8 / 10 l/s. */
    salasEstarComedores: { "0-1": 6, "2": 8, "3+": 10 },
    /** Locales húmedos — mínimo TOTAL por vivienda: 12 / 24 / 33 l/s. */
    humedosTotalVivienda: { "0-1": 12, "2": 24, "3+": 33 },
    /** Locales húmedos — mínimo POR LOCAL: 6 / 7 / 8 l/s. */
    humedosPorLocal: { "0-1": 6, "2": 7, "3+": 8 },
  } satisfies Record<string, FilaCaudal2_1>,
);

// -----------------------------------------------------------------------------
// Cocción — extracción adicional independiente de la ventilación general.
// 50 l/s. [A1-03, VERIFICADO alta]
// "Se dispone de un sistema en la zona de cocción que permita extraer un caudal
//  mínimo de 50 l/s", independiente de la ventilación general. Es ADICIONAL al
// caudal del local cocina (que cuenta como local húmedo en la tabla 2.1).
//
// Replicado aquí (idéntico a COCCION_MIN de modules/_smoke/tablas.ts) para que
// el módulo HS3 sea autocontenido; se reexporta también para conveniencia.
// -----------------------------------------------------------------------------
export const COCCION_MIN = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 2, pto 4" },
  { caudalMin_l_s: 50 } as const,
);

// -----------------------------------------------------------------------------
// No ocupación — caudal mínimo a garantizar en periodos de no ocupación.
// 1,5 l/s por local habitable. [A1-04, VERIFICADO alta]
// -----------------------------------------------------------------------------
export const NO_OCUPACION_MIN = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 2, pto 2" },
  { caudalMin_l_s_por_local: 1.5 } as const,
);

// -----------------------------------------------------------------------------
// Tabla 2.2 — Caudales mínimos en locales NO habitables. [A1-05, VERIFICADO alta]
// (No pedida explícitamente en la tarea, pero verificada y necesaria para el
//  motor cuando dimensione trasteros / residuos / garajes. Se incluye por
//  completitud de trazabilidad.)
//   Trasteros y sus zonas comunes: 0,7 l/s por m² útil.
//   Almacenes de residuos:        10  l/s por m² útil.
//   Aparcamientos y garajes:      120 l/s por plaza.
// -----------------------------------------------------------------------------
export const CAUDALES_NO_HABITABLES = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 2", tabla: "Tabla 2.2" },
  {
    trasteros_l_s_m2: 0.7,
    almacenResiduos_l_s_m2: 10,
    aparcamiento_l_s_plaza: 120,
  } as const,
);

// -----------------------------------------------------------------------------
// Tabla 4.1 — Área efectiva de las aberturas de ventilación de un local [cm²].
// [A1-06, VERIFICADO alta]
//
// El área efectiva (cm²) se obtiene a partir de qv, el caudal de ventilación
// mínimo exigido del local [l/s] (de las tablas 2.1/2.2):
//   - Aberturas de admisión:    4·qv   (o 4·qva con caudales equilibrados)
//   - Aberturas de extracción:  4·qv   (o 4·qve)
//   - Aberturas de paso:        máx(70, 8·qvp)   → mínimo 70 cm²
//   - Aberturas mixtas:         8·qv
// Donde el "equilibrado de caudales" iguala admisión y extracción al mayor de
// los dos cuando no coinciden (anejo de términos del DB).
//
// Se modelan los COEFICIENTES y el MÍNIMO de paso como datos versionados; el
// motor aplica `area = coef * qv` (y el máx con `pasoMin_cm2` para el paso).
// -----------------------------------------------------------------------------
export const AREA_EFECTIVA_ABERTURAS = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 4", tabla: "Tabla 4.1" },
  {
    /** Coeficiente de admisión: área [cm²] = 4 · qv. */
    admision_coef: 4,
    /** Coeficiente de extracción: área [cm²] = 4 · qv. */
    extraccion_coef: 4,
    /** Aberturas de paso: área [cm²] = máx(pasoMin_cm2, paso_coef · qvp). */
    paso_coef: 8,
    /** Mínimo absoluto del área de paso [cm²]. */
    pasoMin_cm2: 70,
    /** Aberturas mixtas: área [cm²] = 8 · qv. */
    mixtas_coef: 8,
  } as const,
);

// =============================================================================
// CONDUCTOS DE EXTRACCIÓN — apartado 4.2.1 / 4.4. Tablas 4.2, 4.3 y 4.4.
// [A1-07]. Estado de verificación de las tres tablas (todas VERIFICADAS, alta):
//   - Tabla 4.2 (secciones): leída del PDF oficial (pdftotext -table) y
//     coincidente con Normatia.
//   - Tabla 4.4 (zonas térmicas por provincia/altitud): Normatia (literal).
//   - Tabla 4.3 (clase de tiro nº plantas × zona): transcrita del PDF oficial
//     (codigotecnico.org) rasterizado con pdf.js; la escalera de celdas
//     combinadas se reconstruyó por detección de líneas y se validó por
//     monotonía 2D y por superposición sobre la imagen original. Ver
//     TIRO_TABLA_4_3 (matriz completa, verificadaCompleta: true).
//
// Procedimiento del DB (4.2.1): la sección de cada tramo del conducto de
// extracción es como mínimo la de la Tabla 4.2, en función de:
//   (a) qvt [l/s] = suma de caudales de las aberturas de extracción que vierten
//       al tramo, y
//   (b) la clase de tiro (T-1..T-4) de la Tabla 4.3, según el nº de plantas
//       entre la más baja que vierte al conducto y la última (ambas incluidas)
//       y la zona térmica del edificio (Tabla 4.4).
// =============================================================================

/** Clase de tiro térmico del conducto de extracción (Tabla 4.3). */
export type ClaseTiro = "T-1" | "T-2" | "T-3" | "T-4";

/** Zona térmica del edificio (Tabla 4.4). W = más frío … Z = más cálido. */
export type ZonaTermica = "W" | "X" | "Y" | "Z";

// -----------------------------------------------------------------------------
// Tabla 4.2 — Sección del conducto de extracción [cm²].
// VERIFICADA contra Normatia (reproducción literal de la tabla oficial) y
// coherente con el detalle del documento "con comentarios" (mínimo 225 cm²,
// máximo 1×900 cm²). Confianza: alta.
//
// Cada celda es la sección NOMINAL del conducto, expresada como nº de conductos
// × sección unitaria [cm²]. Se modela como `area_cm2` (área total = Σ n·s) más
// el desglose `conductos` para trazabilidad de la geometría.
//
// Filas = tramo de caudal qvt [l/s]; columnas = clase de tiro T-1..T-4.
//   qvt ≤ 100       : T-1 1×225 · T-2 1×400 · T-3 1×625 · T-4 1×625
//   100 < qvt ≤ 300 : T-1 1×400 · T-2 1×625 · T-3 1×625 · T-4 1×900
//   300 < qvt ≤ 500 : T-1 1×625 · T-2 1×900 · T-3 1×900 · T-4 2×900
//   500 < qvt ≤ 750 : T-1 1×625 · T-2 1×900 · T-3 1×900+1×625 · T-4 3×900
//   750 < qvt ≤1000 : T-1 1×900 · T-2 1×900+1×625 · T-3 2×900 · T-4 3×900+1×625
// -----------------------------------------------------------------------------

/** Un conducto: `n` ramales de `seccion_cm2` cada uno. */
export interface ConductoSeccion {
  readonly n: number;
  readonly seccion_cm2: number;
}

/** Celda de la tabla 4.2: desglose de conductos + área total [cm²]. */
export interface CeldaSeccion4_2 {
  /** Desglose nº × sección (geometría nominal del DB). */
  readonly conductos: readonly ConductoSeccion[];
  /** Área total = Σ n·s [cm²] (lo que el motor compara contra el requerido). */
  readonly area_cm2: number;
}

/** Tramo de caudal de la tabla 4.2, con su límite superior inclusivo [l/s]. */
export interface TramoCaudal4_2 {
  /** Límite superior inclusivo del tramo qvt [l/s]. `null` = sin tope (>750). */
  readonly qvtMax_l_s: number | null;
  readonly secciones: Readonly<Record<ClaseTiro, CeldaSeccion4_2>>;
}

const c = (...conductos: ConductoSeccion[]): CeldaSeccion4_2 => ({
  conductos,
  area_cm2: conductos.reduce((acc, x) => acc + x.n * x.seccion_cm2, 0),
});

export const SECCION_CONDUCTO_TABLA_4_2 = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 4.4", tabla: "Tabla 4.2" },
  {
    /**
     * Tramos ORDENADOS por `qvtMax_l_s` ascendente. El motor selecciona el
     * primer tramo cuyo `qvtMax_l_s` sea ≥ qvt (o el último, sin tope).
     */
    tramos: [
      {
        qvtMax_l_s: 100,
        secciones: {
          "T-1": c({ n: 1, seccion_cm2: 225 }),
          "T-2": c({ n: 1, seccion_cm2: 400 }),
          "T-3": c({ n: 1, seccion_cm2: 625 }),
          "T-4": c({ n: 1, seccion_cm2: 625 }),
        },
      },
      {
        qvtMax_l_s: 300,
        secciones: {
          "T-1": c({ n: 1, seccion_cm2: 400 }),
          "T-2": c({ n: 1, seccion_cm2: 625 }),
          "T-3": c({ n: 1, seccion_cm2: 625 }),
          "T-4": c({ n: 1, seccion_cm2: 900 }),
        },
      },
      {
        qvtMax_l_s: 500,
        secciones: {
          "T-1": c({ n: 1, seccion_cm2: 625 }),
          "T-2": c({ n: 1, seccion_cm2: 900 }),
          "T-3": c({ n: 1, seccion_cm2: 900 }),
          "T-4": c({ n: 2, seccion_cm2: 900 }),
        },
      },
      {
        qvtMax_l_s: 750,
        secciones: {
          "T-1": c({ n: 1, seccion_cm2: 625 }),
          "T-2": c({ n: 1, seccion_cm2: 900 }),
          "T-3": c({ n: 1, seccion_cm2: 900 }, { n: 1, seccion_cm2: 625 }),
          "T-4": c({ n: 3, seccion_cm2: 900 }),
        },
      },
      {
        qvtMax_l_s: 1000,
        secciones: {
          "T-1": c({ n: 1, seccion_cm2: 900 }),
          "T-2": c({ n: 1, seccion_cm2: 900 }, { n: 1, seccion_cm2: 625 }),
          "T-3": c({ n: 2, seccion_cm2: 900 }),
          "T-4": c({ n: 3, seccion_cm2: 900 }, { n: 1, seccion_cm2: 625 }),
        },
      },
    ] as readonly TramoCaudal4_2[],
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.4 — Zonas térmicas por provincia y altitud. VERIFICADA (Normatia).
// La zona térmica (W/X/Y/Z) clasifica el clima por temperatura media (Tm):
//   W: Tm ≤ 14 °C · X: 14 < Tm ≤ 16 · Y: 16 < Tm ≤ 18 · Z: Tm > 18.
// Para cada provincia se da la zona en dos rangos de altitud: ≤ 800 m / > 800 m.
// `null` = combinación no aplicable (Ceuta/Melilla > 800 m).
//
// Se incluye como dato versionado para que el motor pueda resolver la zona a
// partir de provincia + altitud y encadenar con la clase de tiro (Tabla 4.3).
// -----------------------------------------------------------------------------

/** Zona térmica de una provincia para los dos rangos de altitud de la 4.4. */
export interface ZonaProvincia {
  /** Zona si altitud ≤ 800 m. */
  readonly hasta800: ZonaTermica;
  /** Zona si altitud > 800 m (`null` si no aplica). */
  readonly mas800: ZonaTermica | null;
}

export const ZONAS_TERMICAS_TABLA_4_4 = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 4.4", tabla: "Tabla 4.4" },
  {
    /** Umbrales de temperatura media (Tm, °C) que definen cada zona. */
    umbralesTm: { W: "Tm<=14", X: "14<Tm<=16", Y: "16<Tm<=18", Z: "Tm>18" },
    /** Provincia → zona por rango de altitud (≤800 m / >800 m). */
    provincias: {
      "Álava": { hasta800: "W", mas800: "W" },
      "Albacete": { hasta800: "X", mas800: "W" },
      "Alicante": { hasta800: "Z", mas800: "Y" },
      "Almería": { hasta800: "Z", mas800: "Y" },
      "Asturias": { hasta800: "X", mas800: "W" },
      "Ávila": { hasta800: "W", mas800: "W" },
      "Badajoz": { hasta800: "Z", mas800: "Y" },
      "Baleares": { hasta800: "Z", mas800: "Y" },
      "Barcelona": { hasta800: "Z", mas800: "Y" },
      "Burgos": { hasta800: "W", mas800: "W" },
      "Cáceres": { hasta800: "Z", mas800: "Y" },
      "Cádiz": { hasta800: "Z", mas800: "Y" },
      "Cantabria": { hasta800: "X", mas800: "W" },
      "Castellón": { hasta800: "Z", mas800: "Y" },
      "Ceuta": { hasta800: "Z", mas800: null },
      "Ciudad Real": { hasta800: "Y", mas800: "X" },
      "Córdoba": { hasta800: "Z", mas800: "Y" },
      "A Coruña": { hasta800: "X", mas800: "W" },
      "Cuenca": { hasta800: "W", mas800: "W" },
      "Girona": { hasta800: "Y", mas800: "X" },
      "Granada": { hasta800: "Y", mas800: "X" },
      "Guadalajara": { hasta800: "X", mas800: "W" },
      "Guipúzcoa": { hasta800: "X", mas800: "W" },
      "Huelva": { hasta800: "Z", mas800: "Y" },
      "Huesca": { hasta800: "X", mas800: "W" },
      "Jaén": { hasta800: "Z", mas800: "Y" },
      "Las Palmas": { hasta800: "Z", mas800: "Y" },
      "León": { hasta800: "W", mas800: "W" },
      "Lleida": { hasta800: "Y", mas800: "X" },
      "Lugo": { hasta800: "W", mas800: "W" },
      "Madrid": { hasta800: "X", mas800: "W" },
      "Málaga": { hasta800: "Z", mas800: "Y" },
      "Melilla": { hasta800: "Z", mas800: null },
      "Murcia": { hasta800: "Z", mas800: "Y" },
      "Navarra": { hasta800: "X", mas800: "W" },
      "Ourense": { hasta800: "X", mas800: "W" },
      "Palencia": { hasta800: "W", mas800: "W" },
      "Pontevedra": { hasta800: "Y", mas800: "X" },
      "La Rioja": { hasta800: "Z", mas800: "Y" },
      "Salamanca": { hasta800: "Y", mas800: "X" },
      "Segovia": { hasta800: "W", mas800: "W" },
      "Sevilla": { hasta800: "Z", mas800: "Y" },
      "Soria": { hasta800: "W", mas800: "W" },
      "Santa Cruz de Tenerife": { hasta800: "X", mas800: "W" },
      "Tarragona": { hasta800: "Y", mas800: "X" },
      "Teruel": { hasta800: "W", mas800: "W" },
      "Toledo": { hasta800: "Y", mas800: "X" },
      "Valencia": { hasta800: "Z", mas800: "Y" },
      "Valladolid": { hasta800: "W", mas800: "W" },
      "Vizcaya": { hasta800: "X", mas800: "W" },
      "Zamora": { hasta800: "X", mas800: "W" },
      "Zaragoza": { hasta800: "Y", mas800: "X" },
    } satisfies Record<string, ZonaProvincia>,
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.3 — Clase de tiro. *** VERIFICADA CELDA A CELDA (confianza alta) ***
//
// Estructura: matriz [nº de plantas existentes entre la más baja que vierte al
// conducto y la última, ambas incluidas] × [zona térmica W/X/Y/Z] → clase de
// tiro T-1..T-4. (T-1 = mayor tiro térmico/sección menor … T-4 = menor
// tiro/sección mayor.)
//
// PROCEDENCIA DE LA VERIFICACIÓN: leída del PDF oficial maquetado de
// codigotecnico.org (Documento Básico HS Salubridad, HS3, ap. 4.2.1, "Tabla 4.3
// Clases de tiro", p. 71), rasterizado con pdf.js y transcrito a partir del
// contorno de la escalera de celdas combinadas. La transcripción se validó por
// (a) reconstrucción de las celdas vía detección de líneas (horizontales y
// verticales) del gráfico, (b) MONOTONÍA 2D perfecta (la clase no aumenta al
// crecer el nº de plantas ni al enfriarse la zona, W→Z), y (c) superposición de
// la matriz sobre la imagen original, comprobando que cada valor cae en su
// región. Las tres plantas superiores (1/2/3) coinciden además con la lectura
// previa de "última/penúltima/antepenúltima".
//
// MATRIZ (filas = nº de plantas 1..8; "8" = "8 o más"; columnas = zona):
//   plantas  W    X    Y    Z
//      1    T-3  T-3  T-4  T-4
//      2    T-2  T-3  T-3  T-4
//      3    T-2  T-2  T-3  T-3
//      4    T-2  T-2  T-2  T-3
//      5    T-1  T-2  T-2  T-3
//      6    T-1  T-1  T-2  T-3
//      7    T-1  T-1  T-1  T-2
//     ≥8    T-1  T-1  T-1  T-1
// -----------------------------------------------------------------------------

/** Fila de la 4.3: clase de tiro por zona para un nº de plantas. */
export type FilaTiro4_3 = Readonly<Record<ZonaTermica, ClaseTiro>>;

/** Nº de plantas tope de la tabla 4.3; a partir de aquí la clase es constante. */
export const MAX_PLANTAS_TABLA_4_3 = 8;

export const TIRO_TABLA_4_3 = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 4.2.1", tabla: "Tabla 4.3" },
  {
    /** `true`: matriz verificada celda a celda contra el PDF oficial. */
    verificadaCompleta: true,
    /**
     * Matriz completa nº de plantas (1..8, "8" = 8 o más) × zona térmica.
     * El motor satura el nº de plantas en MAX_PLANTAS_TABLA_4_3 antes de indexar.
     */
    matriz: {
      1: { W: "T-3", X: "T-3", Y: "T-4", Z: "T-4" },
      2: { W: "T-2", X: "T-3", Y: "T-3", Z: "T-4" },
      3: { W: "T-2", X: "T-2", Y: "T-3", Z: "T-3" },
      4: { W: "T-2", X: "T-2", Y: "T-2", Z: "T-3" },
      5: { W: "T-1", X: "T-2", Y: "T-2", Z: "T-3" },
      6: { W: "T-1", X: "T-1", Y: "T-2", Z: "T-3" },
      7: { W: "T-1", X: "T-1", Y: "T-1", Z: "T-2" },
      8: { W: "T-1", X: "T-1", Y: "T-1", Z: "T-1" },
    } satisfies Record<number, FilaTiro4_3>,
  } as const,
);

/**
 * Clase de tiro de la Tabla 4.3 para un nº de plantas (≥1) y una zona térmica.
 * Satura el nº de plantas en [1, MAX_PLANTAS_TABLA_4_3].
 */
export function claseTiroDe(numPlantas: number, zona: ZonaTermica): ClaseTiro {
  const n = Math.min(Math.max(Math.trunc(numPlantas), 1), MAX_PLANTAS_TABLA_4_3);
  const matriz = TIRO_TABLA_4_3.datos.matriz as Readonly<Record<number, FilaTiro4_3>>;
  return matriz[n][zona];
}
