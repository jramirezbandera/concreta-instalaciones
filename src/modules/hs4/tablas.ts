// =============================================================================
// DB-HS4 — Suministro de agua (fontanería). Tablas y valores normativos como
// DATOS versionados con procedencia (SPEC §4/§11, trazabilidad innegociable).
//
// Edición: DB-HS Sección HS4, edición 2009 (Orden VIV/984/2009, BOE 23/04/2009;
// la Sección HS4 no ha sido modificada después). Cada cifra va envuelta en
// `tablaCTE()` con su `ProcedenciaCTE`. Nunca hardcodear cifras sueltas en la
// lógica: la procedencia alimenta la cita legal de la ficha.
//
// Fuente primaria de valores: research Fase 0 del feature-3 (datos VERIFICADOS
// por triangulación de fuentes oficiales; la auditoría literal celda a celda del
// PDF queda pendiente — ver banderas [VERIFICADO Fase 0 …]).
//
// Unidades canónicas (src/lib/units/types.ts): dm³/s (caudal instantáneo de
// agua), mm (diámetros), kPa (presiones), m/s (velocidades), °C (temperatura
// ACS). Los campos llevan SUFIJO DE UNIDAD en su nombre para que el compilador
// impida mezclar unidades.
//
// AVISOS DE PROCEDENCIA que la ficha DEBE respetar:
//  - (A1-08) Corrección/adición de la corrección de errores del DB-HS (BOE,
//    25/01/2008): se señalan en comentario las celdas tocadas.
//  - El coeficiente de simultaneidad K NO es exigencia del DB-HS4 (el DB remite
//    a "un criterio adecuado"); la fórmula K = 1/√(n−1) procede de UNE 149201.
//    Se modela con procedencia APARTE (criterio externo, no exigencia CTE).
//  - La estimación "pérdidas localizadas ≈ 20–30 % de las longitudinales" NO es
//    cifra del DB: es heurística de buena práctica (procedencia aparte).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { ProcedenciaCTE } from "../../lib/cte/tabla";

/** Procedencia base común a todo el DB-HS4 edición 2009 (no modificada). */
const PROC_HS4 = {
  db: "DB-HS4",
  edicion: "2009",
  /** Orden VIV/984/2009, BOE 23/04/2009. HS4 no modificada después. */
  fecha: "2009-04-23",
  fuente: "codigotecnico.org · DB-HS Sección HS4",
} as const;

/** Diámetros nominales [mm] usados por las tablas de dimensionado del DB-HS4. */
export type Diametro_mm = number;

// -----------------------------------------------------------------------------
// Tabla 2.1 — Caudal instantáneo mínimo por aparato (agua fría AF / ACS) [dm³/s].
// [VERIFICADO Fase 0 — triangulación de fuentes oficiales, auditoría literal de
// PDF pendiente]  ap. 2.1.3.
//
// `acs: null` = el aparato NO tiene toma de ACS (guion "-" en el DB).
//
// CELDAS TOCADAS POR LA CORRECCIÓN DE ERRORES (A1-08), señaladas in situ:
//  (1) `lavamanos` es una FILA AÑADIDA por A1-08 (no estaba en el texto original).
//  (2) `fregadero_no_domestico` → ACS corregido a 0.20 dm³/s por A1-08.
// -----------------------------------------------------------------------------

/**
 * Tipos de aparato del DB-HS4 (Tabla 2.1). Es la FUENTE DE VERDAD de los
 * aparatos del módulo: el resto de tablas referencian un subconjunto de estas
 * claves.
 */
export type TipoAparatoHS4 =
  | "lavamanos"
  | "lavabo"
  | "ducha"
  | "banera_ge_140"
  | "banera_lt_140"
  | "bide"
  | "inodoro_cisterna"
  | "inodoro_fluxor"
  | "urinario_temporizado"
  | "urinario_cisterna"
  | "fregadero_domestico"
  | "fregadero_no_domestico"
  | "lavavajillas_domestico"
  | "lavavajillas_industrial"
  | "lavadero"
  | "lavadora_domestica"
  | "lavadora_industrial"
  | "grifo_aislado"
  | "grifo_garaje"
  | "vertedero";

/**
 * Fila de la Tabla 2.1: caudal instantáneo mínimo de AF y ACS [dm³/s].
 * `acs_dm3_s = null` ⇒ el aparato no tiene toma de ACS.
 */
export interface FilaCaudal2_1 {
  /** Caudal instantáneo mínimo de agua fría [dm³/s]. */
  readonly af_dm3_s: number;
  /** Caudal instantáneo mínimo de ACS [dm³/s]; `null` si no hay toma de ACS. */
  readonly acs_dm3_s: number | null;
}

export const CAUDAL_INSTANTANEO_TABLA_2_1 = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 2.1.3", tabla: "Tabla 2.1" },
  {
    aparatos: {
      lavamanos: { af_dm3_s: 0.05, acs_dm3_s: 0.03 }, // [A1-08] FILA AÑADIDA por la corrección de errores.
      lavabo: { af_dm3_s: 0.1, acs_dm3_s: 0.065 },
      ducha: { af_dm3_s: 0.2, acs_dm3_s: 0.1 },
      banera_ge_140: { af_dm3_s: 0.3, acs_dm3_s: 0.2 },
      banera_lt_140: { af_dm3_s: 0.2, acs_dm3_s: 0.15 },
      bide: { af_dm3_s: 0.1, acs_dm3_s: 0.065 },
      inodoro_cisterna: { af_dm3_s: 0.1, acs_dm3_s: null },
      inodoro_fluxor: { af_dm3_s: 1.25, acs_dm3_s: null },
      urinario_temporizado: { af_dm3_s: 0.15, acs_dm3_s: null },
      urinario_cisterna: { af_dm3_s: 0.04, acs_dm3_s: null },
      fregadero_domestico: { af_dm3_s: 0.2, acs_dm3_s: 0.1 },
      fregadero_no_domestico: { af_dm3_s: 0.3, acs_dm3_s: 0.2 }, // [A1-08] ACS corregido a 0.20.
      lavavajillas_domestico: { af_dm3_s: 0.15, acs_dm3_s: 0.1 },
      lavavajillas_industrial: { af_dm3_s: 0.25, acs_dm3_s: 0.2 },
      lavadero: { af_dm3_s: 0.2, acs_dm3_s: 0.1 },
      lavadora_domestica: { af_dm3_s: 0.2, acs_dm3_s: 0.15 },
      lavadora_industrial: { af_dm3_s: 0.6, acs_dm3_s: 0.4 },
      grifo_aislado: { af_dm3_s: 0.15, acs_dm3_s: 0.1 },
      grifo_garaje: { af_dm3_s: 0.2, acs_dm3_s: null },
      vertedero: { af_dm3_s: 0.2, acs_dm3_s: null },
    } satisfies Record<TipoAparatoHS4, FilaCaudal2_1>,
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.2 — Ø mínimos de las DERIVACIONES a los aparatos. [VERIFICADO Fase 0 —
// triangulación de fuentes oficiales, auditoría literal de PDF pendiente]
// ap. 4.3.
//
// Ø de cálculo = columna de cobre/plástico [mm]. El Ø de acero (pulgadas) se
// guarda como dato secundario INFORMATIVO (string). No todos los aparatos de la
// 2.1 aparecen aquí (p.ej. grifos aislados/garaje, lavadero): el lookup devuelve
// `null` para los no tabulados.
//
// CASO ESPECIAL `inodoro_fluxor`: el DB da un RANGO 25–40 mm. Modelamos el
// MÍNIMO (25) como `diametro_mm` y exponemos `diametroMax_mm: 40`.
//   [rango, verificar contra PDF]
// -----------------------------------------------------------------------------

/**
 * Fila de la Tabla 4.2: Ø mínimo de la derivación al aparato.
 * `acero_pulgadas` es dato informativo (no se usa en cálculo).
 * `diametroMax_mm` sólo está presente en aparatos cuyo Ø se da como rango.
 */
export interface FilaDerivacion4_2 {
  /** Ø mínimo de cálculo (cobre/plástico) [mm]. */
  readonly diametro_mm: number;
  /** Ø de acero equivalente (pulgadas), informativo. */
  readonly acero_pulgadas: string;
  /** Extremo superior del rango [mm], sólo si el DB da rango (p.ej. fluxor). */
  readonly diametroMax_mm?: number;
}

export const DERIVACIONES_TABLA_4_2 = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 4.3", tabla: "Tabla 4.2" },
  {
    /**
     * Subconjunto de `TipoAparatoHS4` tabulado en la 4.2. Los aparatos ausentes
     * (grifo_aislado, grifo_garaje, lavadero, urinario_cisterna no listado, etc.)
     * NO tienen Ø de derivación prescrito en esta tabla.
     */
    aparatos: {
      lavamanos: { diametro_mm: 12, acero_pulgadas: "½" },
      lavabo: { diametro_mm: 12, acero_pulgadas: "½" },
      bide: { diametro_mm: 12, acero_pulgadas: "½" },
      ducha: { diametro_mm: 12, acero_pulgadas: "½" },
      banera_lt_140: { diametro_mm: 20, acero_pulgadas: "¾" },
      banera_ge_140: { diametro_mm: 20, acero_pulgadas: "¾" },
      inodoro_cisterna: { diametro_mm: 12, acero_pulgadas: "½" },
      // [rango, verificar contra PDF] El DB da 25–40 mm para inodoro con fluxor:
      // usamos 25 como mínimo de cálculo y 40 como extremo superior del rango.
      inodoro_fluxor: {
        diametro_mm: 25,
        acero_pulgadas: "1",
        diametroMax_mm: 40,
      },
      urinario_temporizado: { diametro_mm: 12, acero_pulgadas: "½" },
      urinario_cisterna: { diametro_mm: 12, acero_pulgadas: "½" },
      fregadero_domestico: { diametro_mm: 12, acero_pulgadas: "½" },
      fregadero_no_domestico: { diametro_mm: 20, acero_pulgadas: "¾" },
      lavavajillas_domestico: { diametro_mm: 12, acero_pulgadas: "½" },
      lavavajillas_industrial: { diametro_mm: 20, acero_pulgadas: "¾" },
      lavadora_domestica: { diametro_mm: 20, acero_pulgadas: "¾" },
      lavadora_industrial: { diametro_mm: 25, acero_pulgadas: "1" },
      vertedero: { diametro_mm: 20, acero_pulgadas: "¾" },
    } satisfies Partial<Record<TipoAparatoHS4, FilaDerivacion4_2>>,
  },
);

// -----------------------------------------------------------------------------
// Tabla 4.3 — Ø mínimos de los tramos de ALIMENTACIÓN. [VERIFICADO Fase 0 —
// triangulación de fuentes oficiales, auditoría literal de PDF pendiente]
// ap. 4.3.  Ø de cálculo = cobre/plástico [mm]; acero (pulgadas) informativo.
// -----------------------------------------------------------------------------

/** Tramos de alimentación tabulados en la Tabla 4.3. */
export type TramoAlimentacionHS4 =
  | "cuarto_humedo_privado"
  | "derivacion_particular"
  | "columna_montante"
  | "distribuidor_principal"
  | "climatizacion_lt_50kw"
  | "climatizacion_50_250kw"
  | "climatizacion_250_500kw"
  | "climatizacion_gt_500kw";

/** Fila de la Tabla 4.3: Ø mínimo del tramo de alimentación. */
export interface FilaAlimentacion4_3 {
  /** Etiqueta legible del tramo (para ficha/UI). */
  readonly descripcion: string;
  /** Ø mínimo de cálculo (cobre/plástico) [mm]. */
  readonly diametro_mm: number;
  /** Ø de acero equivalente (pulgadas), informativo. */
  readonly acero_pulgadas: string;
}

export const ALIMENTACION_TABLA_4_3 = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 4.3", tabla: "Tabla 4.3" },
  {
    tramos: {
      cuarto_humedo_privado: {
        descripcion: "Cuarto húmedo privado (baño/aseo/cocina)",
        diametro_mm: 20,
        acero_pulgadas: "¾",
      },
      derivacion_particular: {
        descripcion: "Derivación particular (vivienda/apartamento/local)",
        diametro_mm: 20,
        acero_pulgadas: "¾",
      },
      columna_montante: {
        descripcion: "Columna (montante o descendente)",
        diametro_mm: 20,
        acero_pulgadas: "¾",
      },
      distribuidor_principal: {
        descripcion: "Distribuidor principal",
        diametro_mm: 25,
        acero_pulgadas: "1",
      },
      climatizacion_lt_50kw: {
        descripcion: "Climatización < 50 kW",
        diametro_mm: 12,
        acero_pulgadas: "½",
      },
      climatizacion_50_250kw: {
        descripcion: "Climatización 50–250 kW",
        diametro_mm: 20,
        acero_pulgadas: "¾",
      },
      climatizacion_250_500kw: {
        descripcion: "Climatización 250–500 kW",
        diametro_mm: 25,
        acero_pulgadas: "1",
      },
      climatizacion_gt_500kw: {
        descripcion: "Climatización > 500 kW",
        diametro_mm: 32,
        acero_pulgadas: "1¼",
      },
    } satisfies Record<TramoAlimentacionHS4, FilaAlimentacion4_3>,
  },
);

// -----------------------------------------------------------------------------
// Velocidades de cálculo — ap. 4.2 d). [VERIFICADO Fase 0 — triangulación de
// fuentes oficiales, auditoría literal de PDF pendiente]
// Rango RECOMENDADO [m/s] según el material de la tubería.
//
// DICTAMEN normativo (cte-normativa, DB-HS4 2009): este intervalo de velocidad
// (0,50–2,00 metálicas / 0,50–3,50 m/s termoplásticas) es CRITERIO DE ELECCIÓN /
// buena práctica del paso d) del ap. 4.2, NO un límite prestacional del CTE.
// Salir del rango NO incumple (no degrada a `fail`): el motor lo trata como
// `warn` informativo. El numeral "4.2.1.3" NO existe en el DB-HS4: la velocidad
// se fija en el paso d) del ap. 4.2.
// -----------------------------------------------------------------------------

/** Material de la tubería a efectos del rango de velocidad admisible. */
export type MaterialTuberia = "metalica" | "termoplastico_multicapa";

/** Rango de velocidad admisible [m/s] (mínimo y máximo). */
export interface RangoVelocidad {
  readonly min_m_s: number;
  readonly max_m_s: number;
}

export const VELOCIDADES_CALCULO = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 4.2 d)" },
  {
    porMaterial: {
      metalica: { min_m_s: 0.5, max_m_s: 2.0 },
      termoplastico_multicapa: { min_m_s: 0.5, max_m_s: 3.5 },
    } satisfies Record<MaterialTuberia, RangoVelocidad>,
  },
);

// -----------------------------------------------------------------------------
// Presiones — ap. 2.1.3. Temperatura de ACS — ap. 2.3.
// [VERIFICADO Fase 0 — triangulación de fuentes oficiales, auditoría literal de
// PDF pendiente]
//
//  - Presión mínima en grifos comunes: 100 kPa.
//  - Presión mínima en fluxores y calentadores: 150 kPa.
//  - Presión máxima en cualquier punto de consumo: 500 kPa.
//  - Temperatura de ACS en los puntos de consumo: 50–65 °C.
// -----------------------------------------------------------------------------
export const PRESIONES = tablaCTE({ ...PROC_HS4, articulo: "ap. 2.1.3" }, {
  presionMinGrifosComunes_kPa: 100,
  presionMinFluxorCalentador_kPa: 150,
  presionMaxConsumo_kPa: 500,
} as const);

export const TEMPERATURA_ACS = tablaCTE({ ...PROC_HS4, articulo: "ap. 2.3" }, {
  /** Temperatura de preparación/consumo de ACS en los puntos de consumo [°C]. */
  consumoMin_C: 50,
  consumoMax_C: 65,
} as const);

// =============================================================================
// CRITERIOS EXTERNOS — NO son exigencia del DB-HS4. Se modelan con procedencia
// APARTE y se etiquetan explícitamente para que la ficha NO los cite como CTE.
// =============================================================================

/** Procedencia de un criterio de cálculo que NO emana del DB-HS4. */
export interface ProcedenciaCriterioExterno extends ProcedenciaCTE {
  /** Norma/origen del criterio (p.ej. "UNE 149201"). */
  norma?: string;
  /** Etiqueta de naturaleza, para que la ficha lo distinga del CTE. */
  naturaleza: string;
  /** `false` deja constancia de que el DB NO prescribe una fórmula concreta. */
  prescribeFormulaCTE: false;
  /** Cita literal del DB que delega el criterio (cuando aplique). */
  textoCTE?: string;
}

// -----------------------------------------------------------------------------
// Coeficiente de simultaneidad K — ap. 4.2.1.
// EL DB-HS4 NO PRESCRIBE FÓRMULA: remite a "un coeficiente de simultaneidad de
// acuerdo con un criterio adecuado". La fórmula clásica K = 1/√(n−1) procede de
// UNE 149201 → CRITERIO EXTERNO, NO exigencia CTE.
//
// `n` = nº de aparatos (suministros) del tramo. Para n < 2 la fórmula no aplica
// (división por cero / raíz de 0); el motor (Fase 2) decidirá K = 1 en ese caso.
// -----------------------------------------------------------------------------
export const SIMULTANEIDAD_K = tablaCTE<{
  procedencia: ProcedenciaCriterioExterno;
  /** Nº mínimo de aparatos para el que la fórmula 1/√(n−1) es aplicable. */
  nMinAplicable: number;
  /** Documentación de la fórmula (no se evalúa aquí; vive en el motor). */
  formula: string;
}>(
  {
    db: "DB-HS4",
    edicion: "2009",
    articulo: "ap. 4.2.1",
    fuente: "UNE 149201",
  },
  {
    procedencia: {
      db: "DB-HS4",
      edicion: "2009",
      articulo: "ap. 4.2.1",
      norma: "UNE 149201",
      naturaleza: "criterio externo — no exigencia CTE",
      prescribeFormulaCTE: false,
      textoCTE:
        "…coeficiente de simultaneidad de acuerdo con un criterio adecuado.",
      fuente: "UNE 149201",
    },
    nMinAplicable: 2,
    formula: "K = 1 / sqrt(n - 1)  (UNE 149201; n = nº de aparatos)",
  },
);

// -----------------------------------------------------------------------------
// Heurística de pérdidas LOCALIZADAS — ap. 4.2 / 4.5 (grupo de presión).
// La estimación "localizadas ≈ 20–30 % de las longitudinales" NO ES CIFRA DEL
// DB: es buena práctica de cálculo. Se modela como heurística con su rango.
//
// Criterio de grupo de presión (citable, esto SÍ es del DB): es necesario si la
// presión disponible en el punto de consumo más desfavorable, descontadas las
// pérdidas, es menor que la presión mínima exigida (ver `PRESIONES`).
// -----------------------------------------------------------------------------
export const PERDIDAS_LOCALIZADAS = tablaCTE<{
  procedencia: ProcedenciaCriterioExterno;
  /** Fracción mínima de las pérdidas longitudinales [%]. */
  fraccionLongitudinalesMin_pct: number;
  /** Fracción máxima de las pérdidas longitudinales [%]. */
  fraccionLongitudinalesMax_pct: number;
}>(
  {
    db: "DB-HS4",
    edicion: "2009",
    articulo: "ap. 4.2 / 4.5",
    fuente: "buena práctica de cálculo (no DB)",
  },
  {
    procedencia: {
      db: "DB-HS4",
      edicion: "2009",
      articulo: "ap. 4.2 / 4.5",
      naturaleza: "buena práctica — no exigencia CTE",
      prescribeFormulaCTE: false,
      fuente: "buena práctica de cálculo (no DB)",
    },
    fraccionLongitudinalesMin_pct: 20,
    fraccionLongitudinalesMax_pct: 30,
  },
);

// =============================================================================
// HELPERS DE LOOKUP — puros, deterministas. Todas las cifras salen de las
// tablas anteriores. El motor (Fase 2) consume estos helpers; no replica cifras.
// =============================================================================

/**
 * Caudal instantáneo mínimo de AF y ACS [dm³/s] de un aparato (Tabla 2.1).
 * `acs_dm3_s = null` ⇒ el aparato no tiene toma de ACS.
 */
export function caudalInstantaneo(tipo: TipoAparatoHS4): FilaCaudal2_1 {
  return CAUDAL_INSTANTANEO_TABLA_2_1.datos.aparatos[tipo];
}

/**
 * Vista de la 4.2 como mapa PARCIAL (no todos los aparatos están tabulados).
 * El `tablaCTE<const T>` infiere sólo las claves presentes; este alias permite
 * indexar con cualquier `TipoAparatoHS4` y obtener `undefined` si falta.
 */
const DERIVACIONES_4_2: Partial<Record<TipoAparatoHS4, FilaDerivacion4_2>> =
  DERIVACIONES_TABLA_4_2.datos.aparatos;

/**
 * Ø mínimo de la derivación al aparato [mm] (Tabla 4.2, columna cobre/plástico).
 * Devuelve `null` si el aparato no está tabulado en la 4.2.
 */
export function diametroDerivacion_mm(tipo: TipoAparatoHS4): number | null {
  const fila = DERIVACIONES_4_2[tipo];
  return fila ? fila.diametro_mm : null;
}

/**
 * Fila completa de la derivación (Ø, acero, posible rango máx). `null` si el
 * aparato no está tabulado en la 4.2.
 */
export function filaDerivacion(tipo: TipoAparatoHS4): FilaDerivacion4_2 | null {
  return DERIVACIONES_4_2[tipo] ?? null;
}

/** Ø mínimo del tramo de alimentación [mm] (Tabla 4.3). */
export function diametroAlimentacion_mm(tramo: TramoAlimentacionHS4): number {
  return ALIMENTACION_TABLA_4_3.datos.tramos[tramo].diametro_mm;
}

/** Rango de velocidad recomendado [m/s] según el material (ap. 4.2 d), buena práctica). */
export function rangoVelocidad(material: MaterialTuberia): RangoVelocidad {
  return VELOCIDADES_CALCULO.datos.porMaterial[material];
}

/**
 * Presión mínima exigida [kPa] en el punto de consumo según necesite fluxor o
 * calentador (150) o sea un grifo común (100) — ap. 2.1.3.
 */
export function presionMinExigida_kPa(esFluxorOCalentador: boolean): number {
  return esFluxorOCalentador
    ? PRESIONES.datos.presionMinFluxorCalentador_kPa
    : PRESIONES.datos.presionMinGrifosComunes_kPa;
}
