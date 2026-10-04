// =============================================================================
// DB-HS1 — Tipos de dominio (feature-17). Los datos de la obra que lee el
// proyectista (figuras 2.4 y 2.5, terreno tipo del DB-SE y estudio geotécnico) y
// las clases que salen de ellos. Solo tipos y constantes: cero lógica.
//
// Van aparte de `tablas.ts` porque los importa el modelo del expediente
// (`lib/proyecto/tipos.ts`), como la zona de radón de HS6.
// =============================================================================

/** Zona pluviométrica de promedios (HS 1 · figura 2.4): de I (más lluvia) a V. */
export type ZonaPluviometricaHs1 = "I" | "II" | "III" | "IV" | "V";
export const ZONAS_PLUVIOMETRICAS_HS1: readonly ZonaPluviometricaHs1[] = ["I", "II", "III", "IV", "V"];

/** Zona eólica (HS 1 · figura 2.5). */
export type ZonaEolica = "A" | "B" | "C";
export const ZONAS_EOLICAS: readonly ZonaEolica[] = ["A", "B", "C"];

/**
 * Terreno tipo del DB-SE (I a V), que da la clase del entorno de HS 1 · 2.3.1:
 * E0 con terreno tipo I, II o III; E1 en los demás casos.
 */
export type TerrenoTipo = "I" | "II" | "III" | "IV" | "V";
export const TERRENOS_TIPO: readonly TerrenoTipo[] = ["I", "II", "III", "IV", "V"];

export type ClaseEntorno = "E0" | "E1";

/**
 * Coeficiente de permeabilidad del terreno, por las columnas de la tabla 2.1:
 *   - `alto`:  Ks ≥ 10⁻² cm/s;
 *   - `medio`: 10⁻⁵ < Ks < 10⁻² cm/s;
 *   - `bajo`:  Ks ≤ 10⁻⁵ cm/s.
 * La tabla 2.3 (suelos) solo distingue Ks > 10⁻⁵ (alto y medio) de Ks ≤ 10⁻⁵.
 */
export type ClaseKs = "alto" | "medio" | "bajo";
export const CLASES_KS: readonly ClaseKs[] = ["alto", "medio", "bajo"];

/**
 * Nivel freático del estudio geotécnico (valor medio anual, medido desde la
 * superficie del terreno): no detectado —con la profundidad que alcanzó el
 * reconocimiento, si se sabe—, o su profundidad [m, positiva].
 */
export type NivelFreatico =
  | { tipo: "no_detectado"; reconocimiento_m?: number }
  | { tipo: "profundidad"; profundidad_m: number };

/** Presencia de agua (HS 1 · 2.1.1 pto 2). */
export type PresenciaAgua = "baja" | "media" | "alta";
