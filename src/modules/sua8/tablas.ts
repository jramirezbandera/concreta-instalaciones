// =============================================================================
// DB-SUA, SUA 8 — Seguridad frente al riesgo causado por la acción del rayo
// (feature-20). Cifras verificadas en la imagen de `research/pdf/DBSUA.pdf`,
// pp. 28–30 y 42–46: research/verificacion-sua6-sua8.md, bloques C3 a C5.
// Solo datos y las tres fórmulas del DB.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/**
 * Figura 1.1: las cifras que aparecen en el mapa de densidad de impactos sobre
 * el terreno Ng [impactos/año·km²]. No hay 3,50 ni 4,50. El mapa no permite dar
 * un valor por provincia (C3.15): lo lee el proyectista para su municipio.
 */
export const SUA8_NG = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 3", tabla: "Figura 1.1" }, [
  0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6,
] as const);

export type ValorNg = (typeof SUA8_NG.datos)[number];

/** Sin Ng se supone el mayor del mapa (lado de la seguridad) y se avisa solo si cambia algo. */
export const NG_SUPUESTO: ValorNg = 6;

export type EntornoC1 = "proximo" | "rodeado_bajos" | "aislado" | "colina";

/** Tabla 1.1: coeficiente relacionado con el entorno. */
export const SUA8_C1 = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 3", tabla: "Tabla 1.1" }, {
  proximo: 0.5,
  rodeado_bajos: 0.75,
  aislado: 1,
  colina: 2,
} as const satisfies Record<EntornoC1, number>);

export type MaterialC2 = "metalica" | "hormigon" | "madera";

/**
 * Tabla 1.2: coeficiente en función del tipo de construcción, [estructura][cubierta].
 * La columna es el material de la ESTRUCTURA de la cubierta; un muro de fábrica
 * se asimila al hormigón (comentarios del Ministerio, no reglamentarios).
 */
export const SUA8_C2 = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.2" }, {
  metalica: { metalica: 0.5, hormigon: 1, madera: 2 },
  hormigon: { metalica: 1, hormigon: 1, madera: 2.5 },
  madera: { metalica: 2, hormigon: 2.5, madera: 3 },
} as const satisfies Record<MaterialC2, Record<MaterialC2, number>>);

/** Tabla 1.3: contenido del edificio. */
export const SUA8_C3 = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.3" }, { inflamable: 3, otros: 1 } as const);

/** Tabla 1.4: uso del edificio. Viviendas, oficinas y garaje: «resto de edificios». */
export const SUA8_C4 = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.4" }, {
  noOcupado: 0.5,
  publicaConcurrenciaSanitarioComercialDocente: 3,
  resto: 1,
} as const);

/** Tabla 1.5: necesidad de continuidad en las actividades. */
export const SUA8_C5 = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.5" }, {
  servicioImprescindible: 5,
  resto: 1,
} as const);

/** Ap. 1 pto 2: sustancias peligrosas o altura mayor que 43 m → siempre E ≥ 0,98. */
export const SUA8_SIEMPRE = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 2" }, { alturaMayorQue_m: 43, eficienciaMin: 0.98 } as const);

export type NivelProteccion = 1 | 2 | 3 | 4;

/** Tabla 2.1: límite inferior incluido. Nivel 4: no obligatoria (nota 1). */
export const SUA8_NIVELES = tablaCTE({ ...PROC_SUA, articulo: "SUA 8 ap. 2", tabla: "Tabla 2.1" }, [
  { nivel: 1, eMin: 0.98 },
  { nivel: 2, eMin: 0.95 },
  { nivel: 3, eMin: 0.8 },
  { nivel: 4, eMin: 0 },
] as const satisfies readonly { nivel: NivelProteccion; eMin: number }[]);

/** Anejo B, tablas B.2 a B.5, por nivel de protección. */
export const SUA8_ANEJO_B = tablaCTE({ ...PROC_SUA, articulo: "Anejo B", tabla: "Tablas B.2 a B.5" }, {
  radioEsfera_m: { 1: 20, 2: 30, 3: 45, 4: 60 },
  reticula_m: { 1: 5, 2: 10, 3: 15, 4: 20 },
  distanciaD_m: { 1: 20, 2: 30, 3: 45, 4: 60 },
  bajantesMalla_m: { 1: 10, 2: 15, 3: 20, 4: 25 },
  /** B.1.2: dos derivadores como mínimo si la estructura excede de 28 m. */
  dosBajantesSiAlturaMayorQue_m: 28,
  /** B.1.2 pto 3: conexiones equipotenciales cada 20 m. */
  equipotencialesCada_m: 20,
} as const satisfies Record<string, unknown>);

/**
 * Ae de una planta rectangular L × B con altura H uniforme: la franja a 3H del
 * perímetro (definición de Ae, SUA 8 ap. 1 pto 3). INTERPRETACIÓN geométrica:
 * exacta para una planta convexa, del lado de la seguridad para una en L o en U.
 */
export function areaCaptura(L: number, B: number, H: number): number {
  return L * B + 6 * H * (L + B) + 9 * Math.PI * H * H;
}

/** (1.1) Ne = Ng·Ae·C1·10⁻⁶ [impactos/año]. */
export function frecuenciaEsperada(ng: number, ae_m2: number, c1: number): number {
  return ng * ae_m2 * c1 * 1e-6;
}

/** (1.2) Na = 5,5/(C2·C3·C4·C5)·10⁻³ [impactos/año]. */
export function riesgoAdmisible(c2: number, c3: number, c4: number, c5: number): number {
  return (5.5 / (c2 * c3 * c4 * c5)) * 1e-3;
}

/** (2.1) E = 1 − Na/Ne, sin redondear. */
export function eficiencia(na: number, ne: number): number {
  return 1 - na / ne;
}

/** Nivel de protección de una eficiencia (tabla 2.1). */
export function nivelDe(e: number): NivelProteccion {
  return (SUA8_NIVELES.datos.find((n) => e >= n.eMin) ?? SUA8_NIVELES.datos[3]).nivel;
}
