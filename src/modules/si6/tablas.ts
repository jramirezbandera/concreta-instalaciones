// =============================================================================
// DB-SI, SI 6 — Resistencia al fuego de la estructura (feature-19): tablas 3.1 y
// 3.2 y las del Anejo C para hormigón armado. Verificadas en la imagen de
// `research/pdf/DBSI.pdf`, pp. 39 y 57–61: research/verificacion-si4-si6.md,
// bloques C4 y C5. Solo datos y su lectura directa.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SI } from "../si/tablas";

/** Columnas de la tabla 3.1: sótano · h ≤ 15 · h ≤ 28 · h > 28 (h, la del EDIFICIO). */
type Columnas = readonly [number, number, number | null, number | null];

/**
 * SI 6 ap. 3 pto 1, tabla 3.1 — R suficiente de los elementos estructurales
 * [min], por el uso del sector. La R de un suelo que separa sectores es la del
 * sector INFERIOR (nota 1). «Residencial» es la fila de Residencial Vivienda,
 * Residencial Público, Docente y Administrativo; «comercial», la de Comercial,
 * Pública concurrencia y Hospitalario. La unifamiliar no tiene valor por encima de
 * 15 m («–»).
 */
export const R_TABLA_3_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 pto 1", tabla: "Tabla 3.1" },
  {
    viviendaUnifamiliar: [30, 30, null, null] as Columnas,
    residencial: [120, 60, 90, 120] as Columnas,
    comercial: [120, 90, 120, 180] as Columnas,
    /** Nota (3): comercial en sótano, R 180 si la altura de evacuación del edificio excede de 28 m. */
    comercialSotanoSiHMas28: 180,
    /** Aparcamiento de uso exclusivo o situado sobre otro uso: una casilla para todas las columnas. */
    aparcamientoExclusivoOSobre: 90,
    /** Aparcamiento situado bajo un uso distinto (su estructura sostiene otro uso). */
    aparcamientoBajoOtroUso: 120,
  } as const,
);

/** SI 6 ap. 3 pto 1, tabla 3.2 — zonas de riesgo especial: nunca menos que la estructura de la planta (nota 1). */
export const R_TABLA_3_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 pto 1", tabla: "Tabla 3.2" },
  { bajo: 90, medio: 120, alto: 180, bajoCubiertaNoEvacuable: 30 } as const,
);

/** SI 6 ap. 3 ptos 2 y 3: cubiertas ligeras y escaleras. */
export const SI6_OTRAS = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 ptos 2 y 3" },
  {
    /** Cubierta ligera no prevista para evacuación, a no más de 28 m sobre la rasante: R 30 si su fallo no compromete nada. */
    cubiertaLigeraR: 30,
    cubiertaLigeraAlturaMax_m: 28,
    cubiertaLigeraCargaMax_kN_m2: 1,
    /** Elementos estructurales contenidos en una escalera protegida o pasillo protegido. */
    escaleraProtegidaR: 30,
  } as const,
);

/** Clases R de las tablas del Anejo C. */
export type ClaseR = 30 | 60 | 90 | 120 | 180 | 240;
export const CLASES_R: readonly ClaseR[] = [30, 60, 90, 120, 180, 240];

/** Anejo C, C.2.2, tabla C.2 — soportes y muros: [b_mín, a_m] en mm. */
export const SOPORTES_C2 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.2", tabla: "Tabla C.2" },
  {
    30: { soporte: [150, 15], muroUnaCara: [100, 15], muroDosCaras: [120, 15] },
    60: { soporte: [200, 20], muroUnaCara: [120, 15], muroDosCaras: [140, 15] },
    90: { soporte: [250, 30], muroUnaCara: [140, 20], muroDosCaras: [160, 25] },
    120: { soporte: [250, 40], muroUnaCara: [160, 25], muroDosCaras: [180, 35] },
    180: { soporte: [350, 45], muroUnaCara: [200, 40], muroDosCaras: [250, 45] },
    240: { soporte: [400, 50], muroUnaCara: [250, 50], muroDosCaras: [300, 50] },
    /** Nota (2): los soportes hechos en obra, 250 mm como mínimo (por la Instrucción EHE que cita el DB). */
    soporteEnObraMin_mm: 250,
  } as const,
);

/** Anejo C, C.2.3.1, tabla C.3 — vigas con tres caras expuestas: opciones [b_mín, a_m] y ancho de alma [mm]. */
export const VIGAS_C3 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.1", tabla: "Tabla C.3" },
  {
    30: { opciones: [[80, 20], [120, 15], [200, 10]], alma: 80 },
    60: { opciones: [[100, 30], [150, 25], [200, 20]], alma: 100 },
    90: { opciones: [[150, 40], [200, 35], [250, 30], [400, 25]], alma: 100 },
    120: { opciones: [[200, 50], [250, 45], [300, 40], [500, 35]], alma: 120 },
    180: { opciones: [[300, 75], [350, 65], [400, 60], [600, 50]], alma: 140 },
    240: { opciones: [[400, 75], [500, 70], [700, 60]], alma: 160 },
  } as const,
);

/** Anejo C, C.2.3.3, tabla C.4 — losas macizas: h_mín (solo si compartimentan) y a_m [mm]. */
export const LOSAS_C4 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.3", tabla: "Tabla C.4" },
  {
    30: { hmin: 60, unaDireccion: 10, dosDireccionesHasta1_5: 10, dosDirecciones1_5a2: 10 },
    60: { hmin: 80, unaDireccion: 20, dosDireccionesHasta1_5: 10, dosDirecciones1_5a2: 20 },
    90: { hmin: 100, unaDireccion: 25, dosDireccionesHasta1_5: 15, dosDirecciones1_5a2: 25 },
    120: { hmin: 120, unaDireccion: 35, dosDireccionesHasta1_5: 20, dosDirecciones1_5a2: 30 },
    180: { hmin: 150, unaDireccion: 50, dosDireccionesHasta1_5: 30, dosDirecciones1_5a2: 40 },
    240: { hmin: 175, unaDireccion: 60, dosDireccionesHasta1_5: 50, dosDirecciones1_5a2: 50 },
  } as const,
);

/** Anejo C, C.2.3.4, tabla C.5 — forjados bidireccionales: opciones [b_mín de nervio, a_m] y h_mín [mm]. */
export const BIDIRECCIONALES_C5 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.4", tabla: "Tabla C.5" },
  {
    30: { opciones: [[80, 20], [120, 15], [200, 10]], hmin: 60 },
    60: { opciones: [[100, 30], [150, 25], [200, 20]], hmin: 80 },
    90: { opciones: [[120, 40], [200, 30], [250, 25]], hmin: 100 },
    120: { opciones: [[160, 50], [250, 40], [300, 35]], hmin: 120 },
    180: { opciones: [[200, 70], [300, 60], [400, 55]], hmin: 150 },
    240: { opciones: [[250, 90], [350, 75], [500, 70]], hmin: 175 },
  } as const,
);

/** Anejo C, C.2.3.5 y C.2.4 — forjados unidireccionales y revestimientos. */
export const HORMIGON_REGLAS = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.5 y C.2.4 pto 2" },
  {
    /** Con entrevigado cerámico o de hormigón y revestimiento inferior: la a_m de las losas (C.4) hasta R 120. */
    unidireccionalComoLosaHastaR: 120,
    /** Sin revestimiento inferior o por encima de R 120: los nervios como vigas de la C.3; la bovedilla cerámica cuenta el doble. */
    bovedillaCeramicaFactor: 2,
    /** El guarnecido de yeso equivale a 1,8 veces su espesor de hormigón (en techos, proyectado hasta R 120). */
    yesoFactor: 1.8,
    /** Desde R 90, los negativos de forjados continuos hasta el 33 % del tramo con el 25 % de la cuantía. */
    negativosDesdeR: 90,
  } as const,
);
