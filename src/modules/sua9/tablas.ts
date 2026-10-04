// =============================================================================
// DB-SUA, SUA 9 — Accesibilidad (feature-20). Cifras verificadas en la imagen de
// `research/pdf/DBSUA.pdf`, pp. 31–41 (SUA 9 y Anejo A), y la tabla corregida de
// la cabina en la imagen de `research/pdf/DccSUA.pdf`, p. 62 (comentario, no
// reglamentario): research/verificacion-sua9.md, bloques D1 a D8. Los umbrales
// del ascensor (más de dos plantas, más de 12 viviendas, más de 200 m²) son los
// comunes de `sua/tablas.ts`. Solo datos y las dos cuentas «o fracción».
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/** Comentarios del Ministerio (DccSUA, 15-jul-2024): NO reglamentarios; la ficha los rotula así. */
export const PROC_DCC = {
  db: "DB-SUA con comentarios",
  edicion: "comentarios 15-jul-2024 (no reglamentario)",
  fecha: "2024-07-15",
  fuente: "codigotecnico.org · DccSUA.pdf",
} as const;

/** Rótulo de lo que sale de un comentario. */
export const COMENTARIO = "comentario del Ministerio, no reglamentario";

/**
 * SUA 9 ap. 1.1.2 pto 2, 2.º párrafo: en otros usos, ascensor (o rampa) a las
 * plantas con zonas de uso público de más de 100 m² útiles o con elementos
 * accesibles (plazas de aparcamiento accesibles…). D3.13.
 */
export const SUA9_OTROS_USOS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.1.2 pto 2" },
  { usoPublicoPorPlantaMasDe_m2: 100 } as const,
);

// ── Anejo A, «Ascensor accesible»: dimensiones mínimas de la cabina [m] ──────

export type PuertasCabina = "una_o_enfrentadas" | "en_angulo";
/**
 * Columna de la tabla. En Residencial Vivienda la da si hay viviendas accesibles
 * para usuarios de silla de ruedas; en otros edificios, la superficie útil en
 * plantas distintas a las de acceso (≤ / > 1 000 m²). D7.1.2, D7.1.3.
 */
export type ColumnaCabina = "sin_accesibles_o_hasta_1000" | "con_accesibles_o_mas_1000";
export interface Cabina {
  anchura_m: number;
  fondo_m: number;
}

/** Texto del DB (UNE-EN 81-70:2004). */
export const CABINA_DB = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Ascensor accesible»" },
  {
    norma: "UNE-EN 81-70:2004",
    umbralOtrosEdificios_m2: 1000,
    filas: {
      una_o_enfrentadas: {
        sin_accesibles_o_hasta_1000: [{ anchura_m: 1.0, fondo_m: 1.25 }],
        con_accesibles_o_mas_1000: [{ anchura_m: 1.1, fondo_m: 1.4 }],
      },
      en_angulo: {
        sin_accesibles_o_hasta_1000: [{ anchura_m: 1.4, fondo_m: 1.4 }],
        con_accesibles_o_mas_1000: [{ anchura_m: 1.4, fondo_m: 1.4 }],
      },
    } satisfies Record<PuertasCabina, Record<ColumnaCabina, readonly Cabina[]>>,
  },
);

/**
 * Tabla corregida que el Ministerio declara aplicable desde el 21-02-2025, con la
 * UNE-EN 81-70:2022+A1 (DccSUA p. 62). COMENTARIO, NO REGLAMENTARIO. Criterio K6:
 * es el límite con el que se comprueba; la del DB se muestra al lado. Varias
 * medidas en una casilla: vale cualquiera.
 */
export const CABINA_CORREGIDA = tablaCTE(
  { ...PROC_DCC, articulo: "Anejo A, «Ascensor accesible», comentario «Versión de la norma EN 81-70…»" },
  {
    norma: "UNE-EN 81-70:2022+A1",
    desde: "21-02-2025",
    filas: {
      una_o_enfrentadas: {
        sin_accesibles_o_hasta_1000: [{ anchura_m: 1.0, fondo_m: 1.3 }],
        con_accesibles_o_mas_1000: [{ anchura_m: 1.1, fondo_m: 1.4 }],
      },
      en_angulo: {
        sin_accesibles_o_hasta_1000: [
          { anchura_m: 1.4, fondo_m: 1.6 },
          { anchura_m: 1.6, fondo_m: 1.4 },
        ],
        con_accesibles_o_mas_1000: [
          { anchura_m: 1.4, fondo_m: 1.6 },
          { anchura_m: 1.6, fondo_m: 1.4 },
        ],
      },
    } satisfies Record<PuertasCabina, Record<ColumnaCabina, readonly Cabina[]>>,
  },
);

// ── Anejo A, «Itinerario accesible» ───────────────────────────────────────────

export const ITINERARIO_ACCESIBLE = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Itinerario accesible»" },
  {
    /** Ø libre de obstáculos en el portal, al fondo de pasillos de más de 10 m y frente al ascensor o su previsión. */
    giro_m: 1.5,
    pasilloFondoGiroMasDe_m: 10,
    pasillo_m: 1.2,
    /** «En zonas comunes de edificios de uso Residencial Vivienda se admite 1,10 m» (nuevos y existentes, D7.2.1). */
    pasilloZonasComunesVivienda_m: 1.1,
    estrechamiento: { anchura_m: 1.0, longitudMax_m: 0.5, separacion_m: 0.65 },
    puerta: {
      pasoMarco_m: 0.8,
      /** En el ángulo de MÁXIMA apertura, reducida por el grosor de la hoja (D7.2.2). */
      pasoMaximaApertura_m: 0.78,
      mecanismo_m: { min: 0.8, max: 1.2 },
      libreBarrido_m: 1.2,
      mecanismoARincon_m: 0.3,
      /** Solo las puertas de salida (D7.2.3). */
      fuerzaSalida_N: 25,
      fuerzaSalidaResistenteFuego_N: 65,
    },
    pendienteMarcha_pct: 4,
    pendienteTransversal_pct: 2,
  } as const,
);

// ── SUA 9 ap. 1.2.8 y Anejo A, «Mecanismos accesibles» ────────────────────────

export const MECANISMOS_ACCESIBLES = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.2.8; Anejo A, «Mecanismos accesibles»" },
  {
    mando_cm: { min: 80, max: 120 },
    tomas_cm: { min: 40, max: 120 },
    /** 35 cm, no 40 (D7.3.2). */
    aRincon_cm: 35,
  } as const,
);

// ── SUA 9 ap. 1.2.3 y Anejo A, «Plaza de aparcamiento accesible» ─────────────

export const PLAZAS_ACCESIBLES = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.2.3; Anejo A, «Plaza de aparcamiento accesible»" },
  {
    /** Residencial Vivienda: una por vivienda accesible para silla de ruedas, sin umbral de superficie. */
    porViviendaAccesible: 1,
    /** Otros usos: solo con aparcamiento propio de más de 100 m² construidos. */
    otrosUsosConstruidaMasDe_m2: 100,
    /** c) Cualquier otro uso (Administrativo): una cada 50 o fracción hasta 200, y una más cada 100 adicionales o fracción. */
    otros: { unaCada: 50, hasta: 200, despuesUnaCada: 100 },
    aproximacionLateral_m: 1.2,
    aproximacionTrasera_m: 3.0,
  } as const,
);

/** 1.2.3 c), «o fracción» = hacia arriba (D5.7): ⌈N/50⌉ hasta 200; después, una más cada 100 o fracción. */
export function plazasAccesiblesOtrosUsos(plazas: number): number {
  const { unaCada, hasta, despuesUnaCada } = PLAZAS_ACCESIBLES.datos.otros;
  const n = Math.max(0, Math.trunc(plazas));
  if (n <= hasta) return Math.ceil(n / unaCada);
  return Math.ceil(hasta / unaCada) + Math.ceil((n - hasta) / despuesUnaCada);
}

// ── SUA 9 ap. 1.2.6, 1.2.7 ────────────────────────────────────────────────────

export const ASEOS_ACCESIBLES = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.2.6" },
  { unoCadaInodoros: 10 } as const,
);

/** «Un aseo accesible por cada 10 unidades o fracción de inodoros instalados». */
export function aseosAccesiblesExigidos(inodoros: number): number {
  return Math.ceil(Math.max(0, inodoros) / ASEOS_ACCESIBLES.datos.unoCadaInodoros);
}

/**
 * Comentario «Aseo accesible en centros de trabajo pequeños» (DccSUA p. 57, D5.12):
 * no hace falta que sea accesible si la zona de uso privado exclusiva de
 * trabajadores no excede de 100 m² útiles, no hay más de 10 trabajadores y el aseo
 * es solo para ellos. Criterio K8.
 */
export const ASEO_CENTRO_PEQUENO = tablaCTE(
  { ...PROC_DCC, articulo: "SUA 9 ap. 1.2.6, comentario «Aseo accesible en centros de trabajo pequeños»" },
  { utilPrivadaMax_m2: 100, trabajadoresMax: 10 } as const,
);

/** Anejo A, «Servicios higiénicos accesibles»: lo que se cita del aseo accesible (D7.6). */
export const ASEO_ACCESIBLE = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Servicios higiénicos accesibles»" },
  {
    giro_m: 1.5,
    transferenciaInodoro_cm: 80,
    /** Fondo hasta el borde frontal del inodoro. El comentario admite 65 cm (DccSUA p. 69), no el DB. */
    fondoInodoro_cm: 75,
    asientoInodoro_cm: { min: 45, max: 50 },
    lavaboLibre_cm: { alto: 70, fondo: 50 },
    lavaboMax_cm: 85,
  } as const,
);

export const PUNTO_ATENCION = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.2.7; Anejo A, «Punto de atención accesible»" },
  { plano_m: 0.8, alturaMax_m: 0.85, libreInferior_cm: { alto: 70, ancho: 80, fondo: 50 } } as const,
);

// ── SUA 9 ap. 2: tabla 2.1 y ap. 2.2 ──────────────────────────────────────────

export const SENALIZACION = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 2", tabla: "Tabla 2.1" },
  {
    sia: "UNE 41501:2002",
    /** Número de planta en Braille y arábigo en alto relieve, en la jamba derecha en sentido salida. */
    brailleAscensor_m: { min: 0.8, max: 1.2 },
    /** Pictogramas de sexo de los aseos de uso general, a la derecha de la puerta. */
    pictogramas_m: { min: 0.8, max: 1.2 },
  } as const,
);

// ── Anejo A, «Vivienda accesible» ─────────────────────────────────────────────

export const VIVIENDA_ACCESIBLE = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Vivienda accesible para usuarios de silla de ruedas»" },
  {
    pasillo_m: 1.1,
    giro_m: 1.5,
    transferenciaCama_m: 0.9,
    pasoPiesCama_m: 0.9,
    encimeraMax_cm: 85,
    libreFregadero_cm: { alto: 70, ancho: 80, fondo: 60 },
    transferenciaInodoroDucha_cm: 80,
    asientoInodoro_cm: { min: 45, max: 50 },
    pendienteDucha_pct: 2,
    giroTerraza_m: 1.2,
    resaltoTerrazaMax_cm: 5,
  } as const,
);

/** SUA 9 ap. 1.2.1, 1.2.5: sin cifras; la cita para la ficha. */
export const SUA9_DOTACION = tablaCTE({ ...PROC_SUA, articulo: "SUA 9 ap. 1.2" }, {} as const);
