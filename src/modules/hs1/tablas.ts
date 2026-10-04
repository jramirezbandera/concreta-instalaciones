// =============================================================================
// DB-HS1 — «Protección frente a la humedad». Tablas y valores normativos como
// DATOS versionados con procedencia (SPEC §4/§11): cada cifra va envuelta en
// `tablaCTE()`, que alimenta la cita de la ficha. Aquí SOLO datos y lecturas
// puras; la justificación vive en `justificacion.ts`.
//
// EDICIÓN: DB-HS consolidado de 14-06-2022. HS 1 no la modifican la Orden
// FOM/588/2017 (solo HS 3) ni el RD 450/2022 (solo HS 4); el RD 732/2019 añade
// HS 6 y actualiza referencias normativas del DB-HS.
//
// VERIFICACIÓN (research/verificacion-hs1.md, feature-17): todas las tablas se
// cotejaron casilla a casilla contra la imagen de cada página del PDF oficial
// (research/pdf/DBHS.pdf), y coinciden con el texto extraído del PDF y con el del
// DB comentado por el Ministerio (12-02-2025). Lo que hay que saber al leerlas:
//   - casilla sombreada (no aceptable) = `null`; casilla en blanco (sin
//     condición) = `[]`;
//   - las filas «≤ g» de las tablas 2.2 y 2.4 NO se acumulan: una fila no
//     contiene las condiciones de la anterior;
//   - los códigos son PROPIOS de cada tabla: D4 de muro son canaletas y D4 de
//     suelo, un pozo cada 800 m². Por eso hay un diccionario por elemento;
//   - la regla de sustitución (un número mayor sustituye al menor del mismo
//     bloque) es SOLO de fachadas (ap. 2.3.2 pto 2);
//   - dos casillas de la tabla 2.4 parecen erratas (placa sin intervención ≤3 sin
//     C3; pantalla · solera sin intervención ≤4 sin C2 ni D1): están igual en el
//     DB de 2022 y en el comentado de 2025, y se copian tal cual.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { ImpermeabilizacionMuro, IntervencionTerreno, TipoMuro, TipoSuelo } from "./decisiones";
import type { ClaseEntorno, PresenciaAgua, TerrenoTipo, ZonaEolica, ZonaPluviometricaHs1 } from "./tipos";

const PROC_HS1 = {
  db: "DB-HS1",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 1 (tablas cotejadas casilla a casilla en imagen)",
} as const;

export type Grado = 1 | 2 | 3 | 4 | 5;
export const GRADOS: readonly Grado[] = [1, 2, 3, 4, 5];
/** Índice 0..4 = filas «≤1» … «≤5». */
export type PorGrado<T> = readonly [T, T, T, T, T];
/** `null` = casilla sombreada (no aceptable); `[]` = casilla en blanco (sin condición). */
export type Casilla = readonly string[] | null;
export type Exposicion = "V1" | "V2" | "V3";

// =============================================================================
// Presencia de agua y grado de los muros (ap. 2.1.1, tabla 2.1)
// =============================================================================

/**
 * ap. 2.1.1 pto 2 y Apéndice A. Δ = profundidad de la cara inferior del suelo −
 * profundidad del nivel freático [m]: baja Δ < 0; media 0 ≤ Δ < 2; alta Δ ≥ 2. El
 * nivel freático es el valor medio anual, medido desde la superficie del terreno.
 */
export const PRESENCIA_AGUA = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.1 pto 2; Apéndice A (nivel freático)" },
  { umbralMedia_m: 0, umbralAlta_m: 2 } as const,
);

/** Tabla 2.1. Columnas de Ks [cm/s]: alto ≥ 10⁻² · medio 10⁻⁵ < Ks < 10⁻² · bajo ≤ 10⁻⁵. */
export const GRADO_MUROS_TABLA_2_1 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.1 pto 1", tabla: "Tabla 2.1" },
  {
    alta: { alto: 5, medio: 5, bajo: 4 },
    media: { alto: 3, medio: 2, bajo: 2 },
    baja: { alto: 1, medio: 1, bajo: 1 },
  } as const satisfies Record<PresenciaAgua, Record<"alto" | "medio" | "bajo", Grado>>,
);

// =============================================================================
// Condiciones de las soluciones de muro (ap. 2.1.2, tabla 2.2)
// =============================================================================

export const CONDICIONES_MURO_TABLA_2_2 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.2 ptos 1 y 2", tabla: "Tabla 2.2" },
  {
    casillas: {
      gravedad: {
        interior: [["I2", "D1", "D5"], ["C3", "I1", "D1", "D3"], ["C3", "I1", "D1", "D3"], null, null],
        exterior: [
          ["I2", "I3", "D1", "D5"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D2", "D3"],
        ],
        parcialmente_estanco: [["V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
      flexorresistente: {
        interior: [["C1", "I2", "D1", "D5"], ["C1", "C3", "I1", "D1", "D3"], ["C1", "C3", "I1", "D1", "D3"], null, null],
        exterior: [
          ["I2", "I3", "D1", "D5"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D3"],
          ["I1", "I3", "D1", "D2", "D3"],
        ],
        parcialmente_estanco: [["V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
      pantalla: {
        interior: [["C2", "I2", "D1", "D5"], ["C1", "C2", "I1"], ["C1", "C2", "I1"], ["C1", "C2", "I1"], ["C1", "C2", "I1"]],
        exterior: [["C2", "I2", "D1", "D5"], ["C2", "I1"], ["C2", "I1"], ["C2", "I1"], ["C2", "I1"]],
        // ≤1: la única casilla en blanco de la tabla.
        parcialmente_estanco: [[], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
    } satisfies Record<TipoMuro, Record<ImpermeabilizacionMuro, PorGrado<Casilla>>>,
    /** Notas del pie: la casilla NO es aceptable con más sótanos que `maxSotanos`. */
    notas: [
      { muro: "gravedad", imp: "interior", grado: 2, maxSotanos: 3 },
      { muro: "gravedad", imp: "interior", grado: 3, maxSotanos: 3 },
      { muro: "flexorresistente", imp: "interior", grado: 3, maxSotanos: 2 },
      { muro: "gravedad", imp: "parcialmente_estanco", grado: 5, maxSotanos: 1 },
    ] as const satisfies readonly { muro: TipoMuro; imp: ImpermeabilizacionMuro; grado: Grado; maxSotanos: number }[],
  } as const,
);

// =============================================================================
// Grado y condiciones de los suelos (ap. 2.2, tablas 2.3 y 2.4)
// =============================================================================

/** Tabla 2.3. Columnas [cm/s]: Ks > 10⁻⁵ (clases alto y medio) · Ks ≤ 10⁻⁵ (bajo). */
export const GRADO_SUELOS_TABLA_2_3 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.2.1 pto 1", tabla: "Tabla 2.3" },
  {
    alta: { mayor: 5, menorIgual: 4 },
    media: { mayor: 4, menorIgual: 3 },
    baja: { mayor: 2, menorIgual: 1 },
  } as const satisfies Record<PresenciaAgua, Record<"mayor" | "menorIgual", Grado>>,
);

/**
 * Bloque de la tabla 2.4 según el muro. Sin muro en contacto con el terreno (planta
 * baja sin sótano): «flexorresistente o de gravedad» (comentario del Ministerio a
 * 2.2.1, DB comentado p. 16; no reglamentario).
 */
export type BloqueMuroSuelo = "flexorresistente_o_gravedad" | "pantalla";

export const CONDICIONES_SUELO_TABLA_2_4 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.2.2 ptos 1 y 2", tabla: "Tabla 2.4" },
  {
    flexorresistente_o_gravedad: {
      elevado: {
        sub_base: [[], ["C2"], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1", "D3"]],
        inyecciones: [[], [], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1", "D4"], ["I2", "P1", "S1", "S3", "V1", "D3"]],
        sin_intervencion: [["V1"], ["V1"], ["I2", "S1", "S3", "V1", "D3", "D4"], null, null],
      },
      solera: {
        sub_base: [
          [],
          ["C2", "C3"],
          ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"],
          ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"],
          ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"],
        ],
        inyecciones: [
          ["D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"],
          ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"],
          ["C2", "C3", "I1", "I2", "D1", "D2", "P1", "P2", "S1", "S2", "S3"],
        ],
        sin_intervencion: [
          ["C2", "C3", "D1"],
          ["C2", "C3", "D1"],
          ["C2", "C3", "I2", "D1", "D2", "C1", "S1", "S2", "S3"],
          ["C1", "C2", "C3", "I1", "I2", "D1", "D2", "D3", "D4", "P1", "P2", "S1", "S2", "S3"],
          null,
        ],
      },
      placa: {
        sub_base: [
          [],
          ["C2", "C3"],
          ["C2", "C3", "I2", "D1", "D2", "C1", "S1", "S2", "S3"],
          ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"],
          ["C2", "C3", "D1", "D2", "I2", "P2", "S1", "S2", "S3"],
        ],
        inyecciones: [
          ["D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"],
          ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"],
          ["C2", "C3", "I1", "I2", "D1", "D2", "P1", "P2", "S1", "S2", "S3"],
        ],
        // ≤3 sin C3: literal en el DB de 2022 y en el comentado de 2025 (posible errata). No se corrige.
        sin_intervencion: [
          ["C2", "C3", "D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "I2", "D1", "D2", "S1", "S2", "S3"],
          ["C1", "C2", "C3", "D1", "D2", "D3", "D4", "I1", "I2", "P1", "P2", "S1", "S2", "S3"],
          ["C1", "C2", "C3", "I1", "I2", "D1", "D2", "D3", "D4", "P1", "P2", "S1", "S2", "S3"],
        ],
      },
    },
    pantalla: {
      elevado: {
        sub_base: [[], [], ["S3", "V1"], ["S3", "V1"], ["S3", "V1"]],
        inyecciones: [[], [], ["S3", "V1"], ["D4", "S3", "V1"], ["D3", "D4", "S3", "V1"]],
        sin_intervencion: [["V1"], ["V1"], ["S3", "V1"], ["D3", "D4", "S3", "V1"], null],
      },
      solera: {
        sub_base: [[], ["C2", "C3"], ["C1", "C2", "C3", "D1", "P2", "S2", "S3"], ["C2", "C3", "D1", "S2", "S3"], ["C2", "C3", "D1", "P2", "S2", "S3"]],
        inyecciones: [
          ["D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "D1", "P2", "S2", "S3"],
          ["C2", "C3", "D1", "S2", "S3"],
          ["C2", "C3", "D1", "P2", "S2", "S3"],
        ],
        // ≤4 sin C2 ni D1: literal en el DB de 2022 y en el comentado de 2025 (posible errata). No se corrige.
        sin_intervencion: [
          ["C2", "C3", "D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "D1", "D4", "P2", "S2", "S3"],
          ["C1", "C3", "I1", "D2", "D3", "P1", "S2", "S3"],
          ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "P2", "S2", "S3"],
        ],
      },
      placa: {
        sub_base: [[], ["C2", "C3"], ["C1", "C2", "C3", "D1", "D2", "D4", "P2", "S2", "S3"], ["C2", "C3", "S2", "S3"], ["C2", "C3", "P2", "S2", "S3"]],
        inyecciones: [
          [],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "D1", "D2", "P2", "S2", "S3"],
          ["C2", "C3", "D1", "D2", "S2", "S3"],
          ["C2", "C3", "D1", "D2", "P2", "S2", "S3"],
        ],
        sin_intervencion: [
          ["C2", "C3", "D1"],
          ["C2", "C3", "D1"],
          ["C1", "C2", "C3", "D1", "D2", "D3", "D4", "P2", "S2", "S3"],
          ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "S2", "S3"],
          ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "P2", "S2", "S3"],
        ],
      },
    },
  } as const satisfies Record<BloqueMuroSuelo, Record<TipoSuelo, Record<IntervencionTerreno, PorGrado<Casilla>>>>,
);

/** Apéndice A, «Suelo elevado»: (sup. de contacto con el terreno + sup. de apoyo) / sup. del suelo < 1/7. */
export const SUELO_ELEVADO = tablaCTE({ ...PROC_HS1, articulo: "ap. 1.1 pto 1; Apéndice A (suelo elevado)" }, {
  relacionMax: "1/7",
} as const);

// =============================================================================
// Fachadas (ap. 2.3, tablas 2.5, 2.6 y 2.7)
// =============================================================================

/** Tabla 2.5: filas = exposición al viento; columnas = zona pluviométrica de promedios. */
export const GRADO_FACHADAS_TABLA_2_5 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.1 pto 1 a)", tabla: "Tabla 2.5" },
  {
    V1: { I: 5, II: 5, III: 4, IV: 3, V: 2 },
    V2: { I: 5, II: 4, III: 3, IV: 3, V: 2 },
    V3: { I: 5, II: 4, III: 3, IV: 2, V: 1 },
  } as const satisfies Record<Exposicion, Record<ZonaPluviometricaHs1, Grado>>,
);

/**
 * Tabla 2.6. Filas del DB: «≤15», «16 - 40», «41 – 100 (1)», leídas como los
 * intervalos (0,15], (15,40], (40,100] (interpretación: nunca «fuera de tabla»
 * entre 15 y 16 m). Más de 100 m o un desnivel muy pronunciado: DB SE-AE.
 */
export const EXPOSICION_VIENTO_TABLA_2_6 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.1 pto 1 b)", tabla: "Tabla 2.6" },
  {
    filas: [
      { rotulo: "≤ 15 m", hasta_m: 15, E1: { A: "V3", B: "V3", C: "V3" }, E0: { A: "V2", B: "V2", C: "V2" } },
      { rotulo: "16–40 m", hasta_m: 40, E1: { A: "V3", B: "V2", C: "V2" }, E0: { A: "V2", B: "V2", C: "V1" } },
      { rotulo: "41–100 m", hasta_m: 100, E1: { A: "V2", B: "V2", C: "V2" }, E0: { A: "V1", B: "V1", C: "V1" } },
    ],
    alturaMaxTabla_m: 100,
    /** ap. 2.3.1 b): E0 con terreno tipo I, II o III; E1 en los demás casos. */
    entornoPorTerreno: { I: "E0", II: "E0", III: "E0", IV: "E1", V: "E1" } as const satisfies Record<TerrenoTipo, ClaseEntorno>,
  } as const,
);

export type ColumnaFachada = "con_revestimiento" | "sin_revestimiento";

/**
 * Tabla 2.7: cada casilla es una lista de OPCIONES y cada opción, una lista de
 * condiciones. «Con revestimiento», filas ≤1 y ≤2: una sola casilla «R1+C1(1)»,
 * repetida aquí en las dos.
 */
export const CONDICIONES_FACHADA_TABLA_2_7 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.2 ptos 1 y 2", tabla: "Tabla 2.7" },
  {
    con_revestimiento: [
      [["R1", "C1"]],
      [["R1", "C1"]],
      [
        ["R1", "B1", "C1"],
        ["R1", "C2"],
      ],
      [
        ["R1", "B2", "C1"],
        ["R1", "B1", "C2"],
        ["R2", "C1"],
      ],
      [
        ["R3", "C1"],
        ["B3", "C1"],
        ["R1", "B2", "C2"],
        ["R2", "B1", "C1"],
      ],
    ],
    sin_revestimiento: [
      [["C1", "J1", "N1"]],
      [
        ["B1", "C1", "J1", "N1"],
        ["C2", "H1", "J1", "N1"],
        ["C2", "J2", "N2"],
        ["C1", "H1", "J2", "N2"],
      ],
      [
        ["B2", "C1", "J1", "N1"],
        ["B1", "C2", "H1", "J1", "N1"],
        ["B1", "C2", "J2", "N2"],
        ["B1", "C1", "H1", "J2", "N2"],
      ],
      [
        ["B2", "C2", "H1", "J1", "N1"],
        ["B2", "C2", "J2", "N2"],
        ["B2", "C1", "H1", "J2", "N2"],
      ],
      [["B3", "C1"]],
    ],
    /** Nota (1) «Cuando la fachada sea de una sóla hoja, debe utilizarse C2.»: dónde va la llamada. */
    nota1: [
      { columna: "con_revestimiento", grado: 1, opcion: 0 },
      { columna: "con_revestimiento", grado: 2, opcion: 0 },
      { columna: "con_revestimiento", grado: 4, opcion: 2 },
      { columna: "sin_revestimiento", grado: 1, opcion: 0 },
      { columna: "sin_revestimiento", grado: 2, opcion: 3 },
    ] as const satisfies readonly { columna: ColumnaFachada; grado: Grado; opcion: number }[],
  } as const satisfies {
    con_revestimiento: PorGrado<readonly (readonly string[])[]>;
    sin_revestimiento: PorGrado<readonly (readonly string[])[]>;
    nota1: unknown;
  },
);

/**
 * ap. 2.3.2 pto 2 (SOLO fachadas): en cada bloque, un número mayor es una
 * prestación mejor y sustituye a los de número menor. El máximo de cada bloque.
 */
export const SUSTITUCION_FACHADA = tablaCTE({ ...PROC_HS1, articulo: "ap. 2.3.2 pto 2" }, {
  R: 3,
  B: 3,
  C: 2,
  H: 1,
  J: 2,
  N: 2,
} as const);

/** ap. 2.3.3.6 pto 1: con grado 5 y carpintería retranqueada, precerco y barrera en las jambas. */
export const CARPINTERIA_GRADO_5 = tablaCTE({ ...PROC_HS1, articulo: "ap. 2.3.3.6 pto 1" }, {
  grado: 5,
  barreraJambasHaciaInterior_cm: 10,
} as const);

// =============================================================================
// Cubiertas (ap. 2.4, tablas 2.9 y 2.10)
// =============================================================================

/** Protección de una cubierta plana (tabla 2.9). */
export type ProteccionPlana =
  | "solado_fijo"
  | "solado_flotante"
  | "capa_rodadura"
  | "grava"
  | "lamina_autoprotegida"
  | "tierra_vegetal";

/** Tabla 2.9: intervalos cerrados («incluida dentro de los intervalos»). */
export const PENDIENTES_CUBIERTA_PLANA_TABLA_2_9 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.1 pto 3", tabla: "Tabla 2.9" },
  {
    solado_fijo: { uso: "Transitable para peatones", min_pct: 1, max_pct: 5, sinMaximoEnRampas: true },
    solado_flotante: { uso: "Transitable para peatones", min_pct: 1, max_pct: 5, sinMaximoEnRampas: false },
    capa_rodadura: { uso: "Transitable para vehículos", min_pct: 1, max_pct: 5, sinMaximoEnRampas: true },
    grava: { uso: "No transitable", min_pct: 1, max_pct: 5, sinMaximoEnRampas: false },
    lamina_autoprotegida: { uso: "No transitable", min_pct: 1, max_pct: 15, sinMaximoEnRampas: false },
    tierra_vegetal: { uso: "Ajardinada", min_pct: 1, max_pct: 5, sinMaximoEnRampas: false },
  } as const satisfies Record<ProteccionPlana, { uso: string; min_pct: number; max_pct: number; sinMaximoEnRampas: boolean }>,
);

/**
 * Tabla 2.10. Solo obliga en cubiertas inclinadas SIN capa de impermeabilización,
 * y el texto pide una pendiente «mayor que» la de la tabla. No incluye la fila
 * «Bituminosas» del DB comentado de 2025: no está en el consolidado de 2022.
 */
export const PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.1 pto 4", tabla: "Tabla 2.10" },
  {
    filas: [
      { grupo: "Teja", pieza: "Teja curva", min_pct: 32, nota3: true },
      { grupo: "Teja", pieza: "Teja mixta y plana monocanal", min_pct: 30, nota3: true },
      { grupo: "Teja", pieza: "Teja plana marsellesa o alicantina", min_pct: 40, nota3: true },
      { grupo: "Teja", pieza: "Teja plana con encaje", min_pct: 50, nota3: true },
      { grupo: "Pizarra", pieza: "Pizarra", min_pct: 60, nota3: false },
      { grupo: "Cinc", pieza: "Cinc", min_pct: 10, nota3: false },
      { grupo: "Fibrocemento", pieza: "Placas simétricas de onda grande", min_pct: 10, nota3: false },
      { grupo: "Fibrocemento", pieza: "Placas asimétricas de nervadura grande", min_pct: 10, nota3: false },
      { grupo: "Fibrocemento", pieza: "Placas asimétricas de nervadura media", min_pct: 25, nota3: false },
      { grupo: "Sintéticos", pieza: "Perfiles de ondulado grande", min_pct: 10, nota3: false },
      { grupo: "Sintéticos", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "Sintéticos", pieza: "Perfiles de grecado grande", min_pct: 5, nota3: false },
      { grupo: "Sintéticos", pieza: "Perfiles de grecado medio", min_pct: 8, nota3: false },
      { grupo: "Sintéticos", pieza: "Perfiles nervados", min_pct: 10, nota3: false },
      { grupo: "Galvanizados", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "Galvanizados", pieza: "Perfiles de grecado o nervado grande", min_pct: 5, nota3: false },
      { grupo: "Galvanizados", pieza: "Perfiles de grecado o nervado medio", min_pct: 8, nota3: false },
      { grupo: "Galvanizados", pieza: "Perfiles de nervado pequeño", min_pct: 10, nota3: false },
      { grupo: "Galvanizados", pieza: "Paneles", min_pct: 5, nota3: false },
      { grupo: "Aleaciones ligeras", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "Aleaciones ligeras", pieza: "Perfiles de nervado medio", min_pct: 5, nota3: false },
    ],
    /** Nota (3), a las tejas: válidas para faldones menores de 6,5 m; si no, UNE 127100 / UNE 136020. */
    faldonMaxNota3_m: 6.5,
  } as const,
);

/** ap. 2.4.3: cifras de los componentes que cita la memoria. */
export const COMPONENTES_CUBIERTA = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.3; 2.4.3.4; 2.4.3.5.1; 2.4.4.2.9 pto 2" },
  {
    /** Grava suelta solo con pendiente < 5 %; 16–32 mm; capa ≥ 5 cm. */
    gravaSueltaPendienteMax_pct: 5,
    gravaTamano_mm: [16, 32],
    gravaEspesorMin_cm: 5,
    /** 3 < Ss/Ac < 30 [cm²/m²]. */
    camaraVentilada: { relacionMin: 3, relacionMax: 30 },
    canalonInclinadaPendienteMin_pct: 1,
  } as const,
);

// =============================================================================
// Dimensionado (ap. 3, tablas 3.1 a 3.4)
// =============================================================================

/**
 * Tabla 3.1. Pendientes en ‰. El grado es el del muro (2.1.1) para los drenes del
 * muro y el del suelo (2.2.1) para los del suelo (nota 1).
 */
export const TUBOS_DRENAJE_TABLA_3_1 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.1 pto 1", tabla: "Tabla 3.1" },
  {
    filas: [
      { grado: 1, pendienteMin_permil: 3, pendienteMax_permil: 14, dnBajoSuelo_mm: 125, dnPerimetroMuro_mm: 150 },
      { grado: 2, pendienteMin_permil: 3, pendienteMax_permil: 14, dnBajoSuelo_mm: 125, dnPerimetroMuro_mm: 150 },
      { grado: 3, pendienteMin_permil: 5, pendienteMax_permil: 14, dnBajoSuelo_mm: 150, dnPerimetroMuro_mm: 200 },
      { grado: 4, pendienteMin_permil: 5, pendienteMax_permil: 14, dnBajoSuelo_mm: 150, dnPerimetroMuro_mm: 200 },
      { grado: 5, pendienteMin_permil: 8, pendienteMax_permil: 14, dnBajoSuelo_mm: 200, dnPerimetroMuro_mm: 250 },
    ],
  } as const,
);

/** Tabla 3.2: superficie mínima de orificios por metro de tubo. */
export const ORIFICIOS_DRENAJE_TABLA_3_2 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.1 pto 2", tabla: "Tabla 3.2" },
  {
    filas: [
      { dn_mm: 125, orificiosMin_cm2_m: 10 },
      { dn_mm: 150, orificiosMin_cm2_m: 10 },
      { dn_mm: 200, orificiosMin_cm2_m: 12 },
      { dn_mm: 250, orificiosMin_cm2_m: 17 },
    ],
  } as const,
);

/** Tabla 3.3 (muro D4: canaletas de los muros parcialmente estancos). Pendientes en %. */
export const CANALETAS_TABLA_3_3 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.2 ptos 1 y 2", tabla: "Tabla 3.3" },
  {
    sumideroDiametroMin_mm: 110,
    filas: [
      { grado: 1, pendienteMin_pct: 5, pendienteMax_pct: 14, m2MuroPorSumidero: 25 },
      { grado: 2, pendienteMin_pct: 5, pendienteMax_pct: 14, m2MuroPorSumidero: 25 },
      { grado: 3, pendienteMin_pct: 8, pendienteMax_pct: 14, m2MuroPorSumidero: 20 },
      { grado: 4, pendienteMin_pct: 8, pendienteMax_pct: 14, m2MuroPorSumidero: 20 },
      { grado: 5, pendienteMin_pct: 12, pendienteMax_pct: 14, m2MuroPorSumidero: 15 },
    ],
  } as const,
);

/** Tabla 3.4. Cada bomba, para el caudal TOTAL (ap. 3.3 pto 1). Más de 3,1 l/s: segunda cámara. */
export const CAMARAS_BOMBEO_TABLA_3_4 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.3 ptos 1 y 2", tabla: "Tabla 3.4" },
  {
    filas: [
      { caudal_l_s: 0.15, volumen_m3: 2.4 },
      { caudal_l_s: 0.31, volumen_m3: 2.85 },
      { caudal_l_s: 0.46, volumen_m3: 3.6 },
      { caudal_l_s: 0.61, volumen_m3: 3.9 },
      { caudal_l_s: 0.76, volumen_m3: 4.5 },
      { caudal_l_s: 1.15, volumen_m3: 5.7 },
      { caudal_l_s: 1.53, volumen_m3: 9.6 },
      { caudal_l_s: 1.91, volumen_m3: 10.8 },
      { caudal_l_s: 2.3, volumen_m3: 15 },
      { caudal_l_s: 3.1, volumen_m3: 20 },
    ],
    bombasPorCamara: 2,
  } as const,
);

// =============================================================================
// Lecturas puras
// =============================================================================

export function gradoMuro(presencia: PresenciaAgua, ks: "alto" | "medio" | "bajo"): Grado {
  return GRADO_MUROS_TABLA_2_1.datos[presencia][ks];
}

export function gradoSuelo(presencia: PresenciaAgua, ks: "alto" | "medio" | "bajo"): Grado {
  return GRADO_SUELOS_TABLA_2_3.datos[presencia][ks === "bajo" ? "menorIgual" : "mayor"];
}

/** El entorno del terreno tipo (ap. 2.3.1 b). */
export function entornoDe(t: TerrenoTipo): ClaseEntorno {
  return EXPOSICION_VIENTO_TABLA_2_6.datos.entornoPorTerreno[t];
}

/** Fila de la tabla 2.6 para una altura (null: más de 100 m, fuera de tabla). */
export function filaExposicion(altura_m: number): (typeof EXPOSICION_VIENTO_TABLA_2_6.datos.filas)[number] | null {
  return EXPOSICION_VIENTO_TABLA_2_6.datos.filas.find((f) => altura_m <= f.hasta_m) ?? null;
}

/** Tabla 2.6. Por encima de 100 m se toma la última fila (y se avisa: DB SE-AE). */
export function exposicionViento(altura_m: number, entorno: ClaseEntorno, zona: ZonaEolica): Exposicion {
  const filas = EXPOSICION_VIENTO_TABLA_2_6.datos.filas;
  const f = filaExposicion(altura_m) ?? filas[filas.length - 1];
  return f[entorno][zona];
}

export function gradoFachada(exposicion: Exposicion, zona: ZonaPluviometricaHs1): Grado {
  return GRADO_FACHADAS_TABLA_2_5.datos[exposicion][zona];
}

export function casillaMuro(tipo: TipoMuro, imp: ImpermeabilizacionMuro, grado: Grado): Casilla {
  return CONDICIONES_MURO_TABLA_2_2.datos.casillas[tipo][imp][grado - 1];
}

/** El máximo de sótanos que admite la casilla (nota del pie), o null si no lleva nota. */
export function maxSotanosMuro(tipo: TipoMuro, imp: ImpermeabilizacionMuro, grado: Grado): number | null {
  return CONDICIONES_MURO_TABLA_2_2.datos.notas.find((n) => n.muro === tipo && n.imp === imp && n.grado === grado)?.maxSotanos ?? null;
}

export function bloqueSuelo(muro: TipoMuro | null): BloqueMuroSuelo {
  return muro === "pantalla" ? "pantalla" : "flexorresistente_o_gravedad";
}

export function casillaSuelo(bloque: BloqueMuroSuelo, tipo: TipoSuelo, intervencion: IntervencionTerreno, grado: Grado): Casilla {
  return CONDICIONES_SUELO_TABLA_2_4.datos[bloque][tipo][intervencion][grado - 1];
}

/** Las opciones de la casilla de la tabla 2.7, con la nota de la hoja única ya marcada. */
export function opcionesFachada(columna: ColumnaFachada, grado: Grado): { codigos: readonly string[]; nota1: boolean }[] {
  const d = CONDICIONES_FACHADA_TABLA_2_7.datos;
  return d[columna][grado - 1].map((codigos, i) => ({
    codigos,
    nota1: d.nota1.some((n) => n.columna === columna && n.grado === grado && n.opcion === i),
  }));
}

/** Con la nota (1) en una fachada de una sola hoja, C1 pasa a C2. */
export function aplicarHojaUnica(codigos: readonly string[]): string[] {
  return codigos.map((c) => (c === "C1" ? "C2" : c));
}

/** Tabla 3.1 por grado. */
export function tuboDrenaje(grado: Grado): (typeof TUBOS_DRENAJE_TABLA_3_1.datos.filas)[number] {
  return TUBOS_DRENAJE_TABLA_3_1.datos.filas[grado - 1];
}

/** Tabla 3.2 por Ø nominal. */
export function orificiosDrenaje(dn_mm: number): number {
  return ORIFICIOS_DRENAJE_TABLA_3_2.datos.filas.find((f) => f.dn_mm === dn_mm)?.orificiosMin_cm2_m ?? 0;
}

export function canaletas(grado: Grado): (typeof CANALETAS_TABLA_3_3.datos.filas)[number] {
  return CANALETAS_TABLA_3_3.datos.filas[grado - 1];
}
