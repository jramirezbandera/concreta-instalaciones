// =============================================================================
// DB-HR — Protección frente al ruido, opción simplificada (feature-25). Valores
// normativos como DATOS versionados con procedencia (SPEC §4/§11). Aquí SOLO
// datos y funciones puras de lectura de tabla; la justificación vive en
// `justificacion.ts` y las soluciones del Catálogo, en `catalogo.ts`.
//
// EDICIÓN: texto consolidado de 20-12-2019 (última modificación, RD 732/2019).
//
// VERIFICACIÓN (research/verificacion-hr.md): las tablas 2.1, 3.1, 3.2, 3.3, 3.4
// e I.1 se han transcrito de la IMAGEN de research/pdf/DBHR.pdf (pp. 9, 14, 17,
// 20–23, 71); el texto extraído sale desordenado. Lo que hay que saber:
//   - en cada celda de las tablas 3.2 y 3.3 hay una o varias ALTERNATIVAS; basta
//     con cumplir una, con sus notas (K-HR.11);
//   - en la tabla 3.2, sin nota 11, 12 o 13, el forjado debe pesar 300 kg/m² o
//     más (3.1.2.3.4 pto 5);
//   - las combinaciones ⁽⁷⁾ de la tabla 3.3 son para garajes, y en un garaje
//     valen además las demás entre paréntesis (Guía V.03, figura 2.1.4.11, R.1);
//   - la llamada «0(» del forjado de 500 kg/m² no se lee entera: se toma 0 (P2).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HR = {
  db: "DB-HR",
  edicion: "Consolidado 20-12-2019 (RD 732/2019)",
  fecha: "2019-12-20",
  fuente: "codigotecnico.org · DBHR.pdf (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HR = "DB-HR (consolidado 20-dic-2019)";

// ── Valores límite (ap. 2.1) que se leen como un RA de elemento ─────────────

/**
 * Los valores que la opción simplificada convierte en un RA de elemento: la
 * tabiquería (2.1.1 a.i), las puertas (3.1.2.3.4 pto 4), el cerramiento con
 * puerta (2.1.1 a.ii), la medianería (3.1.2.4) y el recinto del ascensor
 * (3.3.3.5: «mayor que» 50, estricto). Anejo I.1.2: las dos hojas de la adosada
 * con estructura independiente.
 */
export const LIMITES_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 2.1.1, 3.1.2.3.4 pto 4, 3.1.2.4, 3.3.3.5 y Anejo I" },
  {
    tabiqueriaRA: 33,
    puertaProtegidoRA: 30,
    puertaHabitableRA: 20,
    cerramientoConPuertaRA: 50,
    medianeriaRA: 45,
    ascensorRA: 50,
    hojaAdosadaRA: 45,
    /** Trasdosado por una sola cara: + 4 dBA a la mejora de la tabla 3.2 (pto 2). */
    trasdosadoUnaCara: 4,
    /** Forjado con el que vale la tabla 3.2 sin notas (pto 5). */
    forjadoPorDefecto: 300,
  } as const,
);

// ── Tabla 2.1: D2m,nT,Atr frente al exterior ────────────────────────────────

/**
 * Tabla 2.1, uso residencial: filas Ld ≤ 60 · 60 < Ld ≤ 65 · 65 < Ld ≤ 70 ·
 * 70 < Ld ≤ 75 · Ld > 75. Sin datos oficiales, 60 dBA en áreas de predominio
 * residencial; fachada no expuesta, Ld − 10 (no con aeronaves); aeronaves, + 4
 * al D2m,nT,Atr.
 */
export const EXTERIOR_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 2.1.1 a) iv", tabla: "Tabla 2.1" },
  {
    hasta: [60, 65, 70, 75] as readonly number[],
    dormitorios: [30, 32, 37, 42, 47] as readonly number[],
    estancias: [30, 30, 32, 37, 42] as readonly number[],
    /** Cultural, sanitario, docente y administrativo: estancias (despachos, salas). */
    administrativo: [30, 32, 37, 42, 47] as readonly number[],
    ldSinDatos: 60,
    noExpuesta: 10,
    aeronaves: 4,
  } as const,
);

/** El D2m,nT,Atr exigido a un recinto protegido. */
export function exigenciaExterior(ld: number, recinto: "dormitorios" | "estancias" | "administrativo", aeronaves: boolean, noExpuesta: boolean): { ld: number; D: number } {
  const T = EXTERIOR_HR.datos;
  const efectivo = noExpuesta && !aeronaves ? ld - T.noExpuesta : ld;
  const i = T.hasta.findIndex((h) => efectivo <= h);
  const fila = i === -1 ? T.hasta.length : i;
  return { ld: efectivo, D: T[recinto][fila] + (aeronaves ? T.aeronaves : 0) };
}

// ── Tabla 3.1: tabiquería ────────────────────────────────────────────────────

/** Tipo de tabiquería: fábrica con apoyo directo, con bandas elásticas (o sobre el suelo flotante) o entramado. */
export type TipoTabiqueria = "apoyo" | "bandas" | "entramado";

export const TABIQUERIA_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.3.3", tabla: "Tabla 3.1" },
  {
    apoyo: { m: 70, RA: 35 },
    bandas: { m: 65, RA: 33 },
    entramado: { m: 25, RA: 43 },
  } as const,
);

// ── Tabla 3.2: elementos de separación verticales ───────────────────────────

/**
 * Una alternativa de una celda: la mejora del trasdosado (null, «–»: no lo
 * necesita, o el tipo 3, que no lleva), si va entre paréntesis (recinto de
 * instalaciones o de actividad) y sus notas.
 */
export interface AltVertical {
  dRA: number | null;
  paren: boolean;
  notas: readonly number[];
}

export interface FilaVertical {
  tipo: 1 | 2 | 3;
  m: number;
  RA: number;
  /** Notas de la fila (en m y RA). */
  notas: readonly number[];
  /** Por columna de tabiquería; null = casilla sombreada (inadecuada). */
  fabrica: readonly AltVertical[] | null;
  entramado: readonly AltVertical[] | null;
}

const a = (dRA: number | null, notas: number[] = [], paren = false): AltVertical => ({ dRA, paren, notas });
const p = (dRA: number | null, notas: number[] = []): AltVertical => a(dRA, notas, true);

export const VERTICALES_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.3.4", tabla: "Tabla 3.2" },
  {
    filas: [
      { tipo: 1, m: 67, RA: 33, notas: [], fabrica: null, entramado: [a(16, [8, 11])] },
      { tipo: 1, m: 120, RA: 38, notas: [], fabrica: null, entramado: [a(14, [8, 11])] },
      { tipo: 1, m: 150, RA: 41, notas: [7], fabrica: [a(16, [8])], entramado: [a(13, [11])] },
      { tipo: 1, m: 180, RA: 45, notas: [], fabrica: [a(13)], entramado: [a(9, [11]), p(12, [11])] },
      { tipo: 1, m: 200, RA: 46, notas: [], fabrica: [a(11, [11])], entramado: [a(10, [13]), p(10, [11])] },
      { tipo: 1, m: 250, RA: 51, notas: [], fabrica: [a(6, [13])], entramado: [a(4, [13]), p(8, [13])] },
      { tipo: 1, m: 300, RA: 52, notas: [], fabrica: [a(3, [13]), a(8), p(9)], entramado: [a(3, [13]), p(8, [13])] },
      { tipo: 1, m: 300, RA: 55, notas: [7], fabrica: [a(null)], entramado: [a(null)] },
      { tipo: 1, m: 350, RA: 55, notas: [], fabrica: [a(5, [13]), p(8, [11])], entramado: [a(0, [13]), p(6, [13])] },
      { tipo: 1, m: 400, RA: 57, notas: [], fabrica: [a(0, [13]), a(2, [13]), p(6, [13])], entramado: [a(0, [13]), p(6, [13])] },
      { tipo: 2, m: 130, RA: 54, notas: [5], fabrica: [a(null)], entramado: [a(null)] },
      { tipo: 2, m: 170, RA: 54, notas: [5], fabrica: [a(null)], entramado: [a(null)] },
      { tipo: 2, m: 200, RA: 61, notas: [6], fabrica: [p(null)], entramado: [p(null)] },
      // El tipo 3 no lleva trasdosado: sus casillas sombreadas no lo admiten.
      { tipo: 3, m: 44, RA: 58, notas: [12], fabrica: [a(null)], entramado: [a(null)] },
      { tipo: 3, m: 52, RA: 64, notas: [9], fabrica: [p(null)], entramado: [p(null)] },
      { tipo: 3, m: 60, RA: 68, notas: [10], fabrica: [p(null)], entramado: [p(null)] },
    ] as readonly FilaVertical[],
  } as const,
);

/** Lo que piden las notas de la tabla 3.2 al forjado y a sus revestimientos. */
export const NOTAS_VERTICALES_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.3.4", tabla: "Tabla 3.2, notas (9)–(13)" },
  {
    n9: { sueloDRA: 6, techoInterior: 6, techoPesada: 12 },
    n10: { forjadoMasDe: 400 },
    n11: { forjado: 250, sueloDRA: 4 },
    n12: { forjado: 200, sueloDRA: 10, techoDRA: 6 },
    n13: { forjado: 175 },
  } as const,
);

/** Las condiciones de la fachada a la que acomete el elemento (3.1.2.3.4 pto 7). */
export const FLANCOS_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.3.4 pto 7 y tabla 3.3 nota (6)" },
  {
    unaHoja: { m: 135, RA: 42 },
    exteriorDosHojasTipo1: { m: 130 },
    interiorEntramado: { m: 26, RA: 43 },
    tipo2Separador: 170,
    tipo2Fachada: { m: 225, RA: 50 },
    exteriorEntramado: { m: 145, RA: 45 },
  } as const,
);

// ── Tabla 3.3: elementos de separación horizontales ─────────────────────────

/** Una combinación de suelo flotante y techo suspendido (ΔRA de cada uno); `garaje`, la ⁽⁷⁾. */
export interface Combinacion {
  sf: number;
  ts: number;
  garaje?: boolean;
}

export interface CeldaHorizontal {
  dLw: number;
  combinaciones: readonly Combinacion[];
}

/** Columna de tabiquería: fábrica con apoyo directo, con bandas (o sobre el suelo flotante), entramado con fachada 1H o 2H. */
export type ColumnaHorizontal = "AD" | "BE" | "ENT1H" | "ENT2H";

export interface FilaHorizontal {
  m: number;
  RA: number;
  /** Nota (4): con entrevigado de EPS, ΔLw + 4 dB. */
  eps: boolean;
  /** Fila normal y fila entre paréntesis; null = sombreada. */
  normal: Record<ColumnaHorizontal, CeldaHorizontal | null>;
  paren: Record<ColumnaHorizontal, CeldaHorizontal | null>;
}

const c = (dLw: number, ...combinaciones: [number, number, ("g" | undefined)?][]): CeldaHorizontal => ({
  dLw,
  combinaciones: combinaciones.map(([sf, ts, g]) => (g ? { sf, ts, garaje: true } : { sf, ts })),
});

export const HORIZONTALES_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.3.5", tabla: "Tabla 3.3" },
  {
    filas: [
      {
        m: 175, RA: 44, eps: false,
        normal: { AD: null, BE: c(26, [3, 15], [15, 4]), ENT2H: c(26, [0, 8], [2, 7], [6, 5], [7, 1], [8, 0]), ENT1H: c(26, [4, 15], [9, 12], [14, 5], [15, 4], [19, 3]) },
        paren: { AD: null, BE: null, ENT2H: c(31, [4, 15], [9, 10], [14, 5], [15, 4], [17, 1], [18, 0]), ENT1H: null },
      },
      {
        m: 200, RA: 45, eps: false,
        normal: { AD: null, BE: c(25, [2, 15], [8, 5], [15, 2]), ENT2H: c(24, [0, 7], [2, 6], [4, 5], [6, 1], [7, 0]), ENT1H: c(24, [2, 15], [9, 5], [15, 2]) },
        paren: { AD: null, BE: c(30, [14, 15], [15, 14], [19, 11]), ENT2H: c(29, [1, 15], [2, 14], [9, 7], [11, 5], [16, 0]), ENT1H: null },
      },
      {
        m: 225, RA: 47, eps: false,
        normal: { AD: null, BE: c(24, [0, 15], [2, 8], [5, 5], [15, 1], [17, 0]), ENT2H: c(23, [0, 4], [2, 3], [4, 0]), ENT1H: c(23, [0, 15], [2, 8], [5, 5], [9, 2], [14, 1], [15, 0]) },
        paren: { AD: null, BE: c(29, [9, 15], [15, 9], [19, 7]), ENT2H: c(28, [0, 13], [2, 11], [8, 5], [9, 4], [12, 1], [13, 0]), ENT1H: null },
      },
      {
        m: 250, RA: 49, eps: false,
        normal: { AD: null, BE: c(22, [0, 10], [2, 5], [9, 0]), ENT2H: c(21, [0, 2], [2, 0]), ENT1H: c(21, [0, 9], [2, 5], [9, 0]) },
        paren: { AD: null, BE: c(27, [6, 15], [9, 10]), ENT2H: c(26, [0, 11], [2, 9], [6, 5], [9, 2], [11, 0]), ENT1H: null },
      },
      {
        m: 300, RA: 52, eps: true,
        normal: { AD: c(18, [3, 15], [8, 5], [9, 4]), BE: c(16, [0, 4], [2, 1], [4, 0]), ENT2H: c(16, [0, 0]), ENT1H: c(16, [0, 2], [2, 0]) },
        paren: { AD: null, BE: c(21, [3, 15], [7, 6], [8, 5], [9, 4]), ENT2H: c(21, [0, 5], [2, 4], [5, 0], [10, 0, "g"]), ENT1H: c(21, [7, 15], [9, 11]) },
      },
      {
        m: 350, RA: 54, eps: true,
        normal: { AD: c(16, [0, 12], [1, 8], [2, 5], [8, 1], [12, 0]), BE: c(15, [0, 0]), ENT2H: c(14, [0, 0], [0, 5], [5, 0]), ENT1H: c(14, [0, 0], [0, 5], [5, 0]) },
        paren: { AD: null, BE: c(19, [1, 11], [4, 5], [5, 4], [8, 2]), ENT2H: c(19, [0, 3], [2, 2], [3, 0], [8, 0, "g"]), ENT1H: c(19, [5, 7], [7, 5], [8, 4]) },
      },
      {
        m: 400, RA: 57, eps: true,
        normal: { AD: c(14, [0, 2], [2, 0], [9, 2], [5, 5], [2, 15]), BE: c(12, [0, 0]), ENT2H: c(11, [0, 0]), ENT1H: c(11, [0, 0]) },
        paren: {
          AD: null,
          BE: c(17, [0, 6], [4, 1], [6, 0], [10, 0, "g"]),
          ENT2H: c(16, [0, 0], [5, 0, "g"]),
          ENT1H: c(16, [0, 9], [1, 7], [4, 3], [6, 1], [8, 0], [9, 0, "g"]),
        },
      },
      {
        m: 450, RA: 58, eps: false,
        normal: { AD: c(12, [0, 0], [0, 4], [5, 0]), BE: c(10, [0, 0]), ENT2H: c(10, [0, 0]), ENT1H: c(10, [0, 0]) },
        // La (7 ; 0)⁽⁷⁾ de ENT 1H queda en la cabecera de la p. 22: es de esta fila (INTERPRETACIÓN, H).
        paren: { AD: null, BE: c(15, [0, 3], [3, 0], [6, 0, "g"]), ENT2H: c(15, [0, 0], [4, 0, "g"]), ENT1H: c(15, [0, 4], [3, 2], [4, 0], [7, 0, "g"]) },
      },
      {
        m: 500, RA: 60, eps: false,
        normal: { AD: c(12, [0, 0]), BE: c(10, [0, 0]), ENT2H: c(9, [0, 0]), ENT1H: c(9, [0, 0]) },
        paren: { AD: c(17, [4, 7], [5, 5]), BE: c(15, [0, 0], [3, 0, "g"]), ENT2H: c(14, [0, 0], [1, 0, "g"]), ENT1H: c(14, [0, 1], [1, 0], [3, 0, "g"]) },
      },
    ] as readonly FilaHorizontal[],
    /** Nota (4). */
    epsDLw: 4,
  } as const,
);

// ── Tabla I.1: adosadas con la estructura horizontal compartida ─────────────

export interface FilaAdosada {
  m: number;
  RA: number;
  eps: boolean;
  /** ΔLw y ΔRA del suelo flotante por tipo del elemento de separación vertical. */
  porTipo: Record<1 | 2 | 3, { dLw: number; dRA: number }>;
}

export const ADOSADAS_HR = tablaCTE(
  { ...PROC_HR, articulo: "Anejo I, I.1.3", tabla: "Tabla I.1" },
  {
    filas: [
      { m: 175, RA: 44, eps: false, porTipo: { 1: { dLw: 14, dRA: 10 }, 2: { dLw: 22, dRA: 10 }, 3: { dLw: 23, dRA: 10 } } },
      { m: 200, RA: 45, eps: false, porTipo: { 1: { dLw: 13, dRA: 10 }, 2: { dLw: 20, dRA: 10 }, 3: { dLw: 21, dRA: 10 } } },
      { m: 225, RA: 47, eps: false, porTipo: { 1: { dLw: 13, dRA: 10 }, 2: { dLw: 19, dRA: 10 }, 3: { dLw: 20, dRA: 10 } } },
      { m: 250, RA: 49, eps: true, porTipo: { 1: { dLw: 8, dRA: 10 }, 2: { dLw: 13, dRA: 10 }, 3: { dLw: 14, dRA: 10 } } },
      { m: 300, RA: 52, eps: true, porTipo: { 1: { dLw: 9, dRA: 0 }, 2: { dLw: 11, dRA: 0 }, 3: { dLw: 12, dRA: 0 } } },
    ] as readonly FilaAdosada[],
    epsDLw: 4,
  } as const,
);

// ── Tabla 3.4: fachadas, cubiertas y suelos en contacto con el aire exterior ─

export interface NivelFachada {
  D: number;
  /** Parte ciega sin huecos (100 %) y huecos de 81 a 100 %: la misma casilla. */
  ciega100: number;
  /** [parte ciega, hueco hasta 15 %, 16–30, 31–60, 61–80]. */
  filas: readonly (readonly [number, number, number, number, number])[];
}

export const FACHADAS_HR = tablaCTE(
  { ...PROC_HR, articulo: "ap. 3.1.2.5", tabla: "Tabla 3.4" },
  {
    niveles: [
      { D: 30, ciega100: 33, filas: [[35, 26, 29, 31, 32], [40, 25, 28, 30, 31], [45, 25, 28, 30, 31]] },
      { D: 32, ciega100: 35, filas: [[35, 30, 32, 34, 34], [40, 27, 30, 32, 34], [45, 26, 29, 32, 33]] },
      { D: 34, ciega100: 36, filas: [[40, 30, 33, 35, 36], [45, 29, 32, 34, 36], [50, 28, 31, 34, 35]] },
      { D: 36, ciega100: 38, filas: [[40, 33, 35, 37, 38], [45, 31, 34, 36, 37], [50, 30, 33, 36, 37]] },
      { D: 37, ciega100: 39, filas: [[40, 35, 37, 39, 39], [45, 32, 35, 37, 38], [50, 31, 34, 37, 38]] },
      { D: 41, ciega100: 43, filas: [[45, 39, 40, 42, 43], [50, 36, 39, 41, 42], [55, 35, 38, 41, 42]] },
      { D: 42, ciega100: 44, filas: [[50, 37, 40, 42, 43], [55, 36, 39, 42, 43], [60, 36, 39, 42, 43]] },
      { D: 46, ciega100: 48, filas: [[50, 43, 45, 47, 48], [55, 41, 44, 46, 47], [60, 40, 43, 46, 47]] },
      { D: 47, ciega100: 49, filas: [[55, 42, 45, 47, 48], [60, 41, 44, 47, 48]] },
      { D: 51, ciega100: 53, filas: [[55, 48, 50, 52, 53], [60, 46, 49, 51, 52]] },
    ] as readonly NivelFachada[],
    /** Límite superior de cada tramo de huecos [%] (K-HR.9: inclusivos). */
    tramos: [15, 30, 60, 80] as readonly number[],
  } as const,
);

export const TRAMOS_HUECOS = ["hasta 15 %", "de 16 a 30 %", "de 31 a 60 %", "de 61 a 80 %", "de 81 a 100 %"] as const;

/** Tramo de huecos (0–4) de la tabla 3.4. */
export function tramoHuecos(pct: number): number {
  const i = FACHADAS_HR.datos.tramos.findIndex((t) => pct <= t);
  return i === -1 ? 4 : i;
}

/** El nivel de la tabla 3.4 para un D2m,nT,Atr: el suyo o el superior más próximo (K-HR.8). */
export function nivelFachada(D: number): NivelFachada | null {
  return FACHADAS_HR.datos.niveles.find((n) => n.D >= D) ?? null;
}

/**
 * Lo que la tabla 3.4 pide al hueco con una parte ciega dada (K-HR.10): la fila
 * de mayor parte ciega que no supere la del proyecto. null si la parte ciega no
 * llega a ninguna fila (la tabla no da solución).
 */
export function exigenciaHueco(n: NivelFachada, ciegaRAtr: number, pct: number): { fila: number; ciegaFila: number; hueco: number } | null {
  const t = tramoHuecos(pct);
  if (t === 4) return { fila: -1, ciegaFila: 0, hueco: n.ciega100 };
  for (let i = n.filas.length - 1; i >= 0; i--) {
    const f = n.filas[i];
    if (f[0] <= ciegaRAtr) return { fila: i, ciegaFila: f[0], hueco: f[1 + t] };
  }
  return null;
}

/** Suma energética de dos partes de un hueco (Anejo G, G.1; aplicada a RA,tr como criterio K-CEC.8). */
export function mixto(partes: readonly { fraccion: number; R: number }[]): number {
  const s = partes.reduce((acc, x) => acc + x.fraccion * Math.pow(10, -x.R / 10), 0);
  return Math.round(-10 * Math.log10(s) * 10) / 10;
}
