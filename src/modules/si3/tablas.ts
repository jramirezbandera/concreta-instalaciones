// =============================================================================
// DB-SI, SI 3 — Evacuación de ocupantes (feature-19): las tablas 2.1 (las filas
// que se usan), 3.1, 4.1, 4.2 y 5.1 y las cifras de los ap. 6 a 9. Verificadas
// en la imagen de `research/pdf/DBSI.pdf`, pp. 22–31: research/verificacion-si3.md.
// Solo datos y su lectura directa.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SI } from "../si/tablas";

/** SI 3 ap. 2.1, tabla 2.1 — densidades [m² útiles por persona] de las zonas que no tiene `DENSIDADES_SI3`. */
export const DENSIDADES_EXTRA = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 2.1", tabla: "Tabla 2.1" },
  {
    /** Comercial, áreas de ventas en plantas de sótano, baja y entreplanta: el local asimilado (criterio C6). */
    comercialBaja: 2,
    comercialOtras: 3,
  } as const,
);

/** SI 3 ap. 3, tabla 3.1 — número de salidas y longitud de los recorridos. */
export const SALIDAS_TABLA_3_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 3", tabla: "Tabla 3.1" },
  {
    unaSalida: {
      ocupacionMax: 100,
      /** Salida de un edificio de viviendas: 500 personas en el conjunto del edificio. */
      ocupacionEdificioViviendasMax: 500,
      /** Zonas que suben más de 2 m hasta una salida de planta. */
      ocupacionAscendenteMax: 50,
      recorridoMax_m: 25,
      recorridoAparcamiento_m: 35,
      alturaDescendenteMax_m: 28,
      alturaAscendenteMax_m: 10,
    },
    variasSalidas: {
      recorridoMax_m: 50,
      /** Zonas en que se prevé que los ocupantes duerman (criterio C9 para viviendas). */
      recorridoDuermen_m: 35,
    },
    /** Nota (1): +25 % con instalación automática de extinción. */
    incrementoExtincion: 0.25,
  } as const,
);

/** SI 3 ap. 4.2, tabla 4.1 — dimensionado de los elementos de la evacuación. */
export const DIMENSIONADO_TABLA_4_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 4.2", tabla: "Tabla 4.1" },
  {
    /** Puertas y pasos: A ≥ P/200 ≥ 0,80 m; hojas de 0,60 a 1,23 m. */
    puertaDivisor: 200,
    puertaMin_m: 0.8,
    hojaMin_m: 0.6,
    hojaMax_m: 1.23,
    /** Pasillos y rampas: A ≥ P/200 ≥ 1,00 m. */
    pasilloMin_m: 1.0,
    /** Escaleras no protegidas: descendente A ≥ P/160; ascendente A ≥ P/(160 − 10h). */
    escaleraDescendenteDivisor: 160,
    /** Nota (9): la anchura mínima de las escaleras, la de DB SUA 1-4.2.2, tabla 4.1. */
  } as const,
);

/**
 * SI 3 ap. 4.2, tabla 4.2 — capacidad de las escaleras por su anchura [personas].
 * Columnas: no protegida descendente = 160·A; protegida con n plantas = 160·A + n·k
 * (k, la columna «cada planta más»): exacto en todas las casillas (verificación
 * B4.3.4). La protegida vale para escaleras de doble tramo y anchura constante (nota 1).
 */
export const CAPACIDAD_TABLA_4_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 4.2", tabla: "Tabla 4.2" },
  {
    anchuras_m: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4],
    porPlanta: [32, 36, 41, 47, 52, 58, 64, 71, 77, 84, 92, 99, 107, 115, 123],
  } as const,
);

export type ProteccionEscalera = "no_protegida" | "compartimentada" | "protegida" | "especialmente_protegida";

/** SI 3 ap. 5, tabla 5.1 — altura de evacuación máxima de cada protección, en descendente [m] (null: siempre). */
export const PROTECCION_TABLA_5_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 5", tabla: "Tabla 5.1" },
  {
    /** Residencial Vivienda y Administrativo. */
    residencial: { noProtegida_m: 14, protegida_m: 28 },
    comercial: { noProtegida_m: 10, protegida_m: 20 },
    /** Aparcamiento: no protegida y protegida «No se admite», descendente y ascendente. */
    aparcamientoSoloEspecialmente: true,
  } as const,
);

/** SI 3 ap. 6: puertas de salida. */
export const PUERTAS_SI3 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 6 ptos 1 a 3" },
  {
    /** Abren en el sentido de la evacuación: más de 200 personas en Residencial Vivienda, 100 en los demás, o más de 50 del recinto. */
    sentidoViviendas: 200,
    sentidoOtros: 100,
    sentidoRecinto: 50,
  } as const,
);

/** SI 3 ap. 8: control del humo en aparcamientos no abiertos con ventilación mecánica. */
export const HUMO_SI3 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 8 pto 2" },
  {
    extraccion_l_s_plaza: 150,
    aportacionMax_l_s_plaza: 120,
    /** Compuertas E300 60 en las aberturas de extracción junto al suelo si la planta excede de 4 m. */
    alturaCompuertas_m: 4,
    ventiladores: "F300 60",
    conductos: "E300 60",
    conductosEntreSectores: "EI 60",
  } as const,
);

/** SI 3 ap. 9: evacuación de personas con discapacidad. */
export const DISCAPACIDAD_SI3 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3 ap. 9" },
  {
    residencialH_m: 28,
    administrativoH_m: 14,
    plantaAparcamiento_m2: 1500,
    sillaCada: 100,
  } as const,
);

/** Capacidad de una escalera protegida de anchura A que sirve a n plantas (tabla 4.2, por la fila de A o la inmediata inferior). */
export function capacidadProtegida(a_m: number, plantas: number): number {
  const t = CAPACIDAD_TABLA_4_2.datos;
  let i = 0;
  for (let k = 0; k < t.anchuras_m.length; k++) if (t.anchuras_m[k] <= a_m + 1e-9) i = k;
  return Math.floor(160 * t.anchuras_m[i] + plantas * t.porPlanta[i]);
}
