// =============================================================================
// DB-HS6 — "Protección frente al radón". Tablas y valores normativos como DATOS
// versionados con procedencia (SPEC §4/§11, trazabilidad innegociable). Nunca
// hardcodear cifras sueltas en la lógica: cada cifra va envuelta en `tablaCTE()`
// con su `ProcedenciaCTE`, que alimenta la cita legal de la ficha (renderFicha →
// CitaNormativa). El CÁLCULO vive en calc.ts (función pura); aquí viven SOLO los
// datos y los helpers de lookup puros.
//
// EDICIÓN VIGENTE ÚNICA para todo el módulo: DB-HS6 introducido por RD 732/2019,
// BOE núm. 311 de 27-12-2019 (BOE-A-2019-18528), SIN modificaciones posteriores.
// Fecha de referencia: "2019-12-27". NO mezclar con borradores previos.
//
// MODELO NORMATIVO (Nivel A — clasificación + adecuación de soluciones a la zona +
// checklist cualitativo + checks geométricos; cf. HE1 por-elemento, NO red/grafo):
//   - Exigencia (art. 2): concentración media anual de radón en locales habitables
//     ≤ 300 Bq/m³ (NIVEL DE REFERENCIA). CONFIANZA ALTA.
//   - Zonas (Apéndice B): I (potencial medio) / II (potencial alto) / sin clasificar
//     (sin exigencia). La ZONA es INPUT del usuario (no se embebe el listado de
//     municipios del Apéndice B; el proyectista lo consulta). CONFIANZA ALTA.
//   - Niveles de protección (art. 3.1): Zona I → UNA medida (barrera O espacio de
//     contención ventilado). Zona II → barrera OBLIGATORIA + UNA medida adicional
//     (espacio de contención ventilado O despresurización del terreno). Estructura
//     CONFIANZA ALTA; numeración fina de apartados PENDIENTE de verificación literal.
//   - Soluciones (art. 3.2 / 3.3): parámetros cuantitativos de la vía simplificada
//     (lámina-tipo ≤ 1e-11 m²/s y ≥ 2 mm; ventilación natural ≥ 10 cm²/ml; altura
//     mínima de cámara 5 cm). CONFIANZA MEDIA-ALTA — PENDIENTE de verificación
//     literal contra el PDF maquetado (precedente del proyecto: HS4/HS5 se
//     verificaron por triangulación antes de la auditoría literal con pdftotext).
//
// DIFERIDO (NO en estas tablas ni en calc.ts): el sub-cálculo cuantitativo de la
// barrera por difusión (E < Elim, "Nivel B"). La fórmula de E DIVERGE entre fuentes
// y NO está verificada literalmente → no se transcribe ningún coeficiente aquí.
//
// Unidades canónicas (src/lib/units/types.ts): Bq/m³ (concentración de radón),
// m²/s (coeficiente de difusión del radón en la lámina), mm (espesor de lámina /
// altura de cámara), cm² (área de aberturas), cm²/ml (= cm² por metro lineal de
// perímetro, criterio geométrico de ventilación natural), m (perímetro), ren/h
// (renovaciones por hora). Los campos llevan SUFIJO DE UNIDAD en su nombre.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { ProcedenciaCTE } from "../../lib/cte/tabla";

// -----------------------------------------------------------------------------
// TIPOS DE DOMINIO BASE (exportados para calc.ts, svg.ts, ficha.ts, ui).
// -----------------------------------------------------------------------------

/**
 * Zona de radón del edificio según su municipio (Apéndice B del DB-HS6). Es un
 * INPUT del usuario (origen "Apéndice B, consultado por el proyectista"): NO se
 * calcula aquí ni se embebe el listado de municipios.
 *   - `"I"`  → potencial medio: exige UNA medida.
 *   - `"II"` → potencial alto: exige barrera OBLIGATORIA + UNA medida adicional.
 *   - `"sin_exigencia"` → municipio no clasificado en Apéndice B → HS6 no exige
 *     medidas (el módulo emite veredicto OK "sin exigencia").
 */
export type ZonaRadon = "I" | "II" | "sin_exigencia";

/**
 * Tipo de solución de protección frente al radón que el usuario puede declarar
 * (art. 3.2 / 3.3). FUENTE DE VERDAD de las soluciones del módulo:
 *   - `barrera`                → barrera de protección (lámina/membrana sellada).
 *   - `espacio_contencion`     → espacio de contención (cámara) ventilado.
 *   - `despresurizacion`       → despresurización del terreno (red de captación +
 *                                extracción mecánica). Solo válida como medida
 *                                ADICIONAL en Zona II (no como medida única).
 */
export type TipoSolucionHS6 = "barrera" | "espacio_contencion" | "despresurizacion";

/**
 * Tipo de ventilación del espacio de contención (art. 3.2):
 *   - `natural`  → se verifica por el criterio geométrico de área de aberturas
 *                  (≥ 10 cm² por metro lineal de perímetro de la cámara).
 *   - `mecanica` → remite a DB-HS3 §3.2.1 (caudal de ventilación). En este módulo
 *                  se acepta como cualitativamente presente (el dimensionado del
 *                  caudal vive en HS3); informa al usuario de la remisión.
 */
export type TipoVentilacionContencion = "natural" | "mecanica";

/**
 * Vía de justificación de la barrera de protección:
 *   - `lamina_tipo` → "solución que se considera adecuada": lámina con coeficiente
 *                     de difusión del radón ≤ 1e-11 m²/s y espesor ≥ 2 mm (vía
 *                     simplificada cuantitativa cubierta por este módulo).
 *   - `calculo`     → justificación por cálculo de difusión (E < Elim, "Nivel B").
 *                     DIFERIDO: NO soportado por el motor actual (la fórmula de E
 *                     diverge entre fuentes y no está verificada literalmente). El
 *                     motor lo marca como pendiente, no lo evalúa.
 */
export type ViaJustificacionBarrera = "lamina_tipo" | "calculo";

// =============================================================================
// BLOQUE 1 — NIVEL DE REFERENCIA de concentración de radón. DB-HS6, art. 2.
// Concentración media anual de radón en locales habitables ≤ 300 Bq/m³.
// EXIGENCIA. CONFIANZA ALTA.
//
// El motor de Nivel A NO calcula la concentración resultante (eso exigiría un
// modelo de transporte de radón fuera del predimensionado simplificado): el nivel
// de referencia es el VALOR LÍMITE citable en la ficha y el ancla de la exigencia.
// =============================================================================

/** Procedencia base de las exigencias del cuerpo del DB-HS6. */
const PROC_HS6 = {
  db: "DB-HS6",
  edicion: "RD 732/2019",
  /** BOE núm. 311 de 27-12-2019 (BOE-A-2019-18528), sin modificaciones posteriores. */
  fecha: "2019-12-27",
  fuente: "codigotecnico.org / BOE-A-2019-18528",
} as const;

export const NIVEL_REFERENCIA_RADON = tablaCTE(
  { ...PROC_HS6, articulo: "art. 2 (Caracterización y cuantificación de la exigencia)" },
  {
    /**
     * Concentración media anual de radón MÁXIMA admisible en locales habitables
     * [Bq/m³]. Nivel de referencia del DB-HS6. CONFIANZA ALTA.
     */
    concentracionMax_Bq_m3: 300,
  } as const,
);

// =============================================================================
// BLOQUE 2 — ÁMBITO de aplicación. DB-HS6, art. 1.
// HS6 aplica a locales HABITABLES en CONTACTO CON EL TERRENO (plantas bajas,
// sótanos, semisótanos). Si el local no es habitable, o no está en contacto con el
// terreno (p.ej. hay una planta no habitable interpuesta), HS6 NO exige medidas.
// EXIGENCIA (condición de aplicabilidad). CONFIANZA ALTA.
//
// El ámbito se modela como un booleano de entrada
// (`localHabitableEnContactoConTerreno`); aquí solo se versiona el texto/criterio
// para la cita de la ficha (no hay cifras).
// =============================================================================

export const AMBITO_APLICACION = tablaCTE(
  { ...PROC_HS6, articulo: "art. 1 (Ámbito de aplicación)" },
  {
    /**
     * Descripción del ámbito (para la ficha). HS6 aplica solo a locales habitables
     * en contacto con el terreno; en otro caso no exige medidas.
     */
    descripcion:
      "Locales habitables en contacto con el terreno (plantas bajas, sótanos y " +
      "semisótanos). Si el local no es habitable o no está en contacto con el " +
      "terreno (p.ej. planta no habitable interpuesta), HS6 no exige medidas.",
  } as const,
);

// =============================================================================
// BLOQUE 3 — NIVELES DE PROTECCIÓN exigidos por zona. DB-HS6, art. 3.1.
// Estructura de la exigencia: qué combinación de medidas admite cada zona.
// CONFIANZA ALTA en la ESTRUCTURA; la numeración fina de apartados (3.1.x) está
// PENDIENTE de verificación literal contra el PDF maquetado.
//
//   - Zona I:  UNA medida → barrera de protección O espacio de contención ventilado.
//   - Zona II: barrera de protección OBLIGATORIA + UNA medida adicional →
//              (espacio de contención ventilado O despresurización del terreno).
//
// El motor (calc.ts) consume esta estructura para decidir si la combinación de
// soluciones PROPUESTA por el usuario es SUFICIENTE para la zona. No hay cifras
// numéricas en este bloque (es estructural).
// =============================================================================

/** Requisitos de protección de una zona de radón (estructura del art. 3.1). */
export interface RequisitoZona {
  /** `true` ⇒ la barrera de protección es OBLIGATORIA (Zona II). */
  readonly barreraObligatoria: boolean;
  /**
   * Nº MÍNIMO de medidas exigidas en total (incluida la barrera si es obligatoria).
   * Zona I → 1 ; Zona II → 2 (barrera + 1 adicional).
   */
  readonly nMedidasMin: number;
  /**
   * Soluciones que cuentan como la medida ADICIONAL admitida (más allá de la
   * barrera). Zona I → cualquiera de {barrera, espacio_contencion} cuenta como la
   * única medida; Zona II → la adicional debe ser {espacio_contencion,
   * despresurizacion}. La despresurización NUNCA es medida única (solo adicional).
   */
  readonly medidasAdmitidas: readonly TipoSolucionHS6[];
  /** Texto legible del nivel de protección para la ficha. */
  readonly descripcion: string;
}

export const REQUISITOS_POR_ZONA = tablaCTE(
  {
    ...PROC_HS6,
    articulo: "art. 3.1 (Niveles de protección frente al radón)",
    // ESTRUCTURA verificada (Fase 1); numeración fina de apartados pendiente.
    fuente:
      "codigotecnico.org / BOE-A-2019-18528 — estructura art. 3.1 (numeración fina " +
      "de apartados PENDIENTE de verificación literal PDF maquetado)",
  },
  {
    /** Requisitos por zona. La zona "sin_exigencia" no exige medidas (0 medidas). */
    requisito: {
      // Zona I: UNA medida, barrera O espacio de contención ventilado. La
      // despresurización por sí sola NO es admitida como medida única.
      I: {
        barreraObligatoria: false,
        nMedidasMin: 1,
        medidasAdmitidas: ["barrera", "espacio_contencion"],
        descripcion:
          "Zona I (potencial medio): una medida — barrera de protección O espacio " +
          "de contención ventilado.",
      },
      // Zona II: barrera OBLIGATORIA + UNA medida adicional (espacio de contención
      // ventilado O despresurización del terreno).
      II: {
        barreraObligatoria: true,
        nMedidasMin: 2,
        medidasAdmitidas: ["espacio_contencion", "despresurizacion"],
        descripcion:
          "Zona II (potencial alto): barrera de protección OBLIGATORIA + una medida " +
          "adicional (espacio de contención ventilado O despresurización del terreno).",
      },
      // Sin clasificar en Apéndice B: HS6 no exige medidas.
      sin_exigencia: {
        barreraObligatoria: false,
        nMedidasMin: 0,
        medidasAdmitidas: [],
        descripcion:
          "Municipio no clasificado en el Apéndice B: HS6 no exige medidas de " +
          "protección frente al radón.",
      },
    } satisfies Record<ZonaRadon, RequisitoZona>,
  },
);

// =============================================================================
// BLOQUE 4 — PARÁMETROS de las soluciones (vía simplificada). DB-HS6, art. 3.2/3.3.
// Umbrales cuantitativos de la "solución que se considera adecuada":
//   - Barrera lámina-tipo: coef. de difusión del radón ≤ 1e-11 m²/s y espesor ≥ 2 mm.
//   - Espacio de contención ventilado NATURAL: área de aberturas ≥ 10 cm² por metro
//     lineal de perímetro de la cámara; altura mínima de cámara ≈ 5 cm.
//   - Renovaciones por hora de referencia de la cámara: 0,1 ren/h (por defecto).
//
// CONFIANZA MEDIA-ALTA — PENDIENTE de verificación literal contra el PDF maquetado.
// Precedente del proyecto (HS4/HS5): valores transcritos por triangulación y
// re-auditados con pdftotext antes de cerrar el módulo. Marcado en `fuente`.
// =============================================================================

/** Procedencia de los parámetros de soluciones (pendientes de verificación literal). */
const PROC_HS6_SOLUCIONES: ProcedenciaCTE = {
  ...PROC_HS6,
  articulo: "art. 3.2 / 3.3 (Barrera de protección · Espacio de contención · Despresurización)",
  fuente:
    "codigotecnico.org / BOE-A-2019-18528 — valores de la vía simplificada PENDIENTES " +
    "de verificación literal PDF maquetado (transcripción por triangulación; precedente HS4/HS5)",
};

export const PARAMETROS_SOLUCIONES = tablaCTE(PROC_HS6_SOLUCIONES, {
  /**
   * Barrera de protección — vía simplificada "lámina-tipo" (art. 3.2). La lámina
   * se considera adecuada si su coeficiente de difusión del radón ≤ umbral Y su
   * espesor ≥ mínimo. CONFIANZA MEDIA-ALTA (pendiente verificación literal).
   */
  barrera: {
    /** Coeficiente de difusión del radón MÁXIMO de la lámina-tipo [m²/s]. */
    coefDifusionMax_m2_s: 1e-11,
    /** Espesor MÍNIMO de la lámina-tipo [mm]. */
    espesorMin_mm: 2,
  },
  /**
   * Espacio de contención ventilado (art. 3.2). Para ventilación NATURAL, el área
   * total de aberturas debe alcanzar el criterio geométrico por metro lineal de
   * perímetro de la cámara. Para ventilación MECÁNICA, el dimensionado del caudal
   * remite a DB-HS3 §3.2.1 (fuera de este módulo). CONFIANZA MEDIA-ALTA.
   */
  espacioContencion: {
    /**
     * Área de aberturas MÍNIMA por metro lineal de perímetro de la cámara, para
     * ventilación natural [cm²/ml = cm² por metro lineal]. Criterio geométrico.
     */
    areaAberturasMin_cm2_ml: 10,
    /** Altura LIBRE mínima de la cámara de contención [mm]. */
    alturaMinCamara_mm: 50,
    /** Renovaciones por hora de referencia de la cámara (por defecto) [ren/h]. */
    renovacionesRef_ren_h: 0.1,
    /** Norma a la que remite la ventilación MECÁNICA del espacio de contención. */
    remisionMecanica: "DB-HS3 §3.2.1",
  },
  /**
   * Despresurización del terreno (art. 3.3) — solución CUALITATIVA: red de captación
   * en relleno granular + extracción mecánica + geotextil. No hay umbral numérico
   * (se evalúa por presencia de los elementos). CONFIANZA ALTA (cualitativo).
   */
  despresurizacion: {
    descripcion:
      "Red de captación embebida en relleno de áridos (grava) bajo la solera, " +
      "conectada a un sistema de extracción mecánica, con geotextil de separación.",
  },
} as const);

// =============================================================================
// HELPERS DE LOOKUP — puros, deterministas. Todas las cifras salen de las tablas
// anteriores. El motor (calc.ts) consume estos helpers; no replica cifras.
// =============================================================================

/** Concentración de radón máxima admisible [Bq/m³] (art. 2). */
export function nivelReferenciaRadon_Bq_m3(): number {
  return NIVEL_REFERENCIA_RADON.datos.concentracionMax_Bq_m3;
}

/** Requisitos de protección de una zona de radón (art. 3.1). */
export function requisitoDeZona(zona: ZonaRadon): RequisitoZona {
  return REQUISITOS_POR_ZONA.datos.requisito[zona];
}

/** Parámetros cuantitativos de la barrera lámina-tipo (art. 3.2). */
export function parametrosBarrera(): {
  coefDifusionMax_m2_s: number;
  espesorMin_mm: number;
} {
  return PARAMETROS_SOLUCIONES.datos.barrera;
}

/** Parámetros del espacio de contención ventilado (art. 3.2). */
export function parametrosEspacioContencion(): {
  areaAberturasMin_cm2_ml: number;
  alturaMinCamara_mm: number;
  renovacionesRef_ren_h: number;
  remisionMecanica: string;
} {
  return PARAMETROS_SOLUCIONES.datos.espacioContencion;
}
