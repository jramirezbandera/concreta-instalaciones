// =============================================================================
// DB-HE Sección HE1 — "Condiciones para el control de la demanda energética".
// Predimensionado de la envolvente térmica: límites de transmitancia (Ulim),
// resistencias superficiales, condensaciones (superficial + intersticial Glaser)
// y puentes térmicos. Tablas y valores normativos como DATOS versionados con
// procedencia (SPEC §4/§11, trazabilidad innegociable).
//
// EDICIÓN VIGENTE ÚNICA para todo el módulo: DB-HE edición 2019 (introducida por
// RD 732/2019, BOE 27/12/2019), TEXTO CONSOLIDADO 14-jun-2022 (incorpora
// RD 450/2022 y corrección de errores BOE 02/02/2023). NO mezclar con DB-HE 2009
// ni con borradores 2018. El procedimiento de condensaciones y los ψ NO viven en
// el cuerpo del DB-HE sino en sus Documentos de Apoyo:
//   - DA DB-HE/1 "Cálculo de parámetros característicos de la envolvente" → U, Rsi/Rse, λ.
//   - DA DB-HE/2 "Comprobación de limitación de condensaciones…" → fRsi, fRsi,min, Glaser, Psat.
//   - DA DB-HE/3 "Puentes térmicos" → ψ lineales (§5 leído; Ψe/Ψi PARAMÉTRICOS por
//     Umuro; rangos REPRESENTATIVOS informativos, esquinas verificadas §5.9).
//   - Catálogo de Elementos Constructivos del CTE (CEC) → λ y µ de materiales (orientativo).
//
// Cada cifra va envuelta en `tablaCTE()` con su `ProcedenciaCTE`. Nunca hardcodear
// cifras sueltas en la lógica: la procedencia alimenta la cita legal de la ficha
// (renderFicha → CitaNormativa). El CÁLCULO en sí (U, Glaser, Psat…) vive en
// calc.ts (Fase 2); aquí viven SOLO los datos y los helpers de lookup puros.
//
// Unidades canónicas (src/lib/units/types.ts): W/m²K (transmitancia U y Ulim),
// m²K/W (resistencias térmicas R, Rsi, Rse), W/(m·K) (conductividad λ y
// transmitancia lineal ψ), mm (espesores), Pa (presión de vapor), °C
// (temperaturas), % (humedad relativa). Los campos llevan SUFIJO DE UNIDAD en su
// nombre para que el compilador impida mezclar unidades. (λ y ψ usan el sufijo
// `_W_mK` por legibilidad en identificador; la unidad canónica es W/(m·K).)
//
// SEPARACIÓN exigencia / criterio / pendiente (igual espíritu que hs4/tablas.ts):
//   - EXIGENCIA CTE (valores duros, confianza alta): Ulim 3.1.1.a, Rsi/Rse DA/1,
//     fRsi,min Tabla 1 DA/2, Rsi=0,25 fijo de condensación, coeficientes de Magnus.
//   - CRITERIO / ORIENTATIVO (NO exigencia numérica, sustituible por dato de
//     fabricante): λ de referencia (CEC), µ de referencia (CEC). Etiquetados.
//   - REPRESENTATIVO / INFORMATIVO (NO cerrar como `as const`): ψ de puentes
//     térmicos (DA DB-HE/3 §5, leído; Ψe paramétricos por Umuro). Esquinas con
//     signo/rango verificado (§5.9); resto, rangos representativos (rejilla
//     paramétrica fina = refinamiento futuro). Nunca contaminan el veredicto.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { ProcedenciaCTE } from "../../lib/cte/tabla";

// -----------------------------------------------------------------------------
// TIPOS DE DOMINIO BASE (exportados para calc.ts, svg.ts, ficha.ts, ui).
// -----------------------------------------------------------------------------

/**
 * Zona climática de INVIERNO (la letra de invierno de la zona del municipio,
 * Apéndice B del DB-HE). Indexa las columnas de la Tabla 3.1.1.a (Ulim) y de la
 * Tabla 1 de fRsi,min. Es un INPUT del motor con origen "dato climático": NO se
 * calcula aquí. El literal "α" (alfa, zona de Canarias) es válido como string
 * literal en TS.
 */
export type ZonaClimatica = "α" | "A" | "B" | "C" | "D" | "E";

/**
 * Tipo de elemento de la envolvente a efectos de la Tabla 3.1.1.a-HE1 (Ulim).
 * FUENTE DE VERDAD de los elementos del módulo. Símbolos del DB entre paréntesis:
 *   - `muro_suelo_exterior`              → UM, US (comparten fila, mismo Ulim).
 *   - `cubierta_exterior`                → UC.
 *   - `contacto_no_habitable_terreno`    → UT (espacios no habitables o terreno).
 *   - `hueco`                            → UH (marco + vidrio + cajón de persiana).
 *   - `puerta`                           → puerta con superficie semitransparente ≤ 50 %.
 *   - `medianeria`                       → UMD (medianerías/particiones de la envolvente
 *                                          térmica). COMPARTE FILA con UT: mismos valores
 *                                          (verificado DBHE p.16). Se compara como un
 *                                          elemento normal (ok/fail), NO "no aplica".
 */
export type TipoElementoEnvolvente =
  | "muro_suelo_exterior"
  | "cubierta_exterior"
  | "contacto_no_habitable_terreno"
  | "hueco"
  | "puerta"
  | "medianeria";

/**
 * Además de la envolvente, las PARTICIONES INTERIORES entre unidades de uso
 * (HE1 ap. 3.2, Tabla 3.2-HE1, feature-15): el forjado entre las viviendas y un
 * local tratado como otra unidad de uso. Su Ulim depende de la relación y la
 * orientación (`ParticionInput` en calc.ts), no de la Tabla 3.1.1.a.
 */
export type TipoElemento = TipoElementoEnvolvente | "particion_interior";

/** Relación entre las unidades que separa una partición interior (Tabla 3.2-HE1). */
export type RelacionParticion = "mismo_uso" | "distinto_uso" | "zona_comun";
/** Orientación de una partición interior (Tabla 3.2-HE1). */
export type OrientacionParticion = "horizontal" | "vertical";

/**
 * Sentido del flujo de calor a través del cerramiento, que selecciona Rsi/Rse
 * (DA DB-HE/1, Tabla 1) y se usa en el perfil de temperaturas del método Glaser.
 * En régimen de calefacción: muro vertical → `horizontal`; cubierta/techo (calor
 * sube) → `ascendente`; suelo (calor baja) → `descendente`.
 */
export type DireccionFlujo = "horizontal" | "ascendente" | "descendente";

/**
 * Clase de higrometría del espacio interior (DA DB-HE/2 §2.2.2). Determina
 * fRsi,min y la HR interior de cálculo:
 *   - `clase_3_o_inferior` → oficinas, tiendas, almacenes y todos los espacios de
 *      uso residencial (default de predimensionado de vivienda). HR 55 %.
 *   - `clase_4`            → «cocinas, pabellones deportivos, duchas colectivas u
 *      otros de uso similar». HR 62 %.
 *   - `clase_5`            → «lavanderías, restaurantes y piscinas». HR 70 %.
 */
export type ClaseHigrometria = "clase_3_o_inferior" | "clase_4" | "clase_5";

// =============================================================================
// BLOQUE 1 — Ulim, valores LÍMITE de transmitancia térmica [W/m²K].
// DB-HE1, ap. 3.1.1, Tabla 3.1.1.a-HE1. Edición 2019 (RD 732/2019), consolidado
// 14-jun-2022. CONFIANZA ALTA (verificación inversa con pdftotext del PDF oficial
// + Guía de aplicación DB-HE 2019, celda a celda; A1-23 REFUTÓ la afirmación
// original errónea — ver correcciones abajo).
//
// Columnas = zona climática de INVIERNO (α/A/B/C/D/E). Valores en W/m²K.
//
// CORRECCIONES APLICADAS (A1-23, frente a la investigación original errónea):
//  (1) Los huecos (UH) NO se limitan a 5,7. La serie 3,2 / 2,7 / 2,3 / 2,1 / 1,8
//      / 1,80 es de HUECOS. El 5,7 es de PUERTAS (valor único, todas las zonas).
//  (2) Las medianerías/particiones de la envolvente (UMD) COMPARTEN FILA con UT y
//      llevan SUS MISMOS valores: 0,90 / 0,80 / 0,75 / 0,70 / 0,65 / 0,59
//      (verificado celda a celda en la imagen p.16 del DBHE — la fila agrupa
//      «… en contacto con espacios no habitables o con el terreno (UT) /
//      Medianerías o particiones interiores pertenecientes a la envolvente térmica
//      (UMD)»). El motor compara U vs Ulim como un elemento NORMAL (ok/fail).
//  (3) UT (contacto con no habitables o terreno) = 0,90 / 0,80 / 0,75 / 0,70 /
//      0,65 / 0,59. UMD comparte exactamente estos valores.
//
// VEREDICTO (criterio normativo para el motor, no código aquí):
//   CUMPLE ⟺ U_elemento ≤ Ulim(zona, tipo) ; NO CUMPLE ⟺ U > Ulim.
//   Puertas: comparar contra 5,7 único (no indexar por zona). Medianerías (UMD):
//   comparar contra su Ulim (= UT), como cualquier otro elemento.
//
// PENDIENTE (§10): reverificación visual final del PDF maquetado al cerrar HE1.
// =============================================================================

/** Procedencia base de las exigencias del cuerpo del DB-HE Sección HE1. */
const PROC_HE1 = {
  db: "DB-HE1",
  edicion: "2019 (RD 732/2019)",
  /** Texto consolidado 14-jun-2022 (incorpora RD 450/2022 y corr. errores 02/02/2023). */
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DB-HE · Sección HE1",
} as const;

/**
 * Fila de la Tabla 3.1.1.a-HE1: Ulim [W/m²K] por zona climática de invierno.
 * Para puertas, el valor es el mismo 5,7 en todas las zonas; las medianerías (UMD)
 * comparten fila con UT (mismos valores, verificado DBHE p.16). El tipo admite
 * `null` de forma DEFENSIVA (contrato histórico), pero hoy NINGÚN elemento de esta
 * tabla devuelve null: todas las filas tienen Ulim numérica.
 */
export interface FilaUlim {
  /** Ulim en zona α (Canarias) [W/m²K]. */
  readonly "α": number | null;
  /** Ulim en zona A [W/m²K]. */
  readonly A: number | null;
  /** Ulim en zona B [W/m²K]. */
  readonly B: number | null;
  /** Ulim en zona C [W/m²K]. */
  readonly C: number | null;
  /** Ulim en zona D [W/m²K]. */
  readonly D: number | null;
  /** Ulim en zona E [W/m²K]. */
  readonly E: number | null;
}

export const ULIM_TABLA_3_1_1_a = tablaCTE(
  { ...PROC_HE1, articulo: "ap. 3.1.1", tabla: "Tabla 3.1.1.a-HE1" },
  {
    /** Ulim [W/m²K] por tipo de elemento × zona. Hoy todas las filas son numéricas. */
    ulim_W_m2K: {
      // UM, US — muros y suelos en contacto con el aire exterior.
      muro_suelo_exterior: { "α": 0.8, A: 0.7, B: 0.56, C: 0.49, D: 0.41, E: 0.37 },
      // UC — cubiertas en contacto con el aire exterior.
      cubierta_exterior: { "α": 0.55, A: 0.5, B: 0.44, C: 0.4, D: 0.35, E: 0.33 },
      // UT — muros/suelos/cubiertas en contacto con espacios no habitables o terreno.
      contacto_no_habitable_terreno: {
        "α": 0.9,
        A: 0.8,
        B: 0.75,
        C: 0.7,
        D: 0.65,
        E: 0.59,
      },
      // UH — huecos (marco + vidrio + cajón de persiana). NO 5,7 (eso es puerta).
      hueco: { "α": 3.2, A: 2.7, B: 2.3, C: 2.1, D: 1.8, E: 1.8 },
      // Puerta con superficie semitransparente ≤ 50 %: 5,7 único en todas las zonas.
      puerta: { "α": 5.7, A: 5.7, B: 5.7, C: 5.7, D: 5.7, E: 5.7 },
      // UMD — medianerías/particiones de la envolvente térmica: COMPARTEN FILA con
      // UT (mismos valores, verificado DBHE p.16). Se compara como elemento normal.
      medianeria: { "α": 0.9, A: 0.8, B: 0.75, C: 0.7, D: 0.65, E: 0.59 },
    } satisfies Record<TipoElementoEnvolvente, FilaUlim>,
    /** Nota (*) de la tabla (verificación v4, research/verificacion-he1-v4.md §1.5). */
    notaEscaparate: {
      texto:
        "Los huecos con uso de escaparate en unidades de uso con actividad comercial pueden incrementar el valor de UH en un 50%.",
      factorUH: 1.5,
    },
  },
);

// =============================================================================
// BLOQUE 1b — Tabla 3.2-HE1: Ulim de las PARTICIONES INTERIORES [W/m²K]
// (HE1 ap. 3.2 «Limitación de descompensaciones»). Aplica a cualquier uso (Guía
// §HE1 4.6). Verificada en la v4 (research/verificacion-he1-v4.md §2, DB p. 18):
// «distinto uso» y «con zonas comunes» comparten fila, horizontales y verticales.
// =============================================================================

export const ULIM_PARTICIONES_TABLA_3_2 = tablaCTE(
  { ...PROC_HE1, articulo: "ap. 3.2", tabla: "Tabla 3.2-HE1" },
  {
    ulim_W_m2K: {
      mismo_uso_horizontal: { "α": 1.9, A: 1.8, B: 1.55, C: 1.35, D: 1.2, E: 1.0 },
      mismo_uso_vertical: { "α": 1.4, A: 1.4, B: 1.2, C: 1.2, D: 1.2, E: 1.0 },
      distinto_uso_o_zona_comun: { "α": 1.35, A: 1.25, B: 1.1, C: 0.95, D: 0.85, E: 0.7 },
    },
  },
);

// =============================================================================
// BLOQUE 2 — Resistencias térmicas superficiales Rsi / Rse [m²K/W].
// DA DB-HE/1 "Cálculo de parámetros característicos de la envolvente", ec. (2),
// Tabla 1 (contacto con aire exterior) y Tabla 6 (particiones interiores /
// contacto con espacios no habitables). CONFIANZA ALTA (A1-24, pdftotext literal).
//
// Fórmula que las usa (en calc.ts): U = 1 / RT, con RT = Rsi + ΣRi + Rse y
// Ri(capa) = espesor_m / λ_W_mK [m²K/W].
//
// Tabla 1 (EXTERIOR): la cara interior depende del flujo; Rse exterior = 0,04
// en los tres casos.
// Tabla 6 (INTERIORES / no habitable): AMBAS caras son interiores (Rsi = Rse por
// dirección de flujo). Para contacto con el TERRENO el DA da un cálculo específico
// (resistencia del terreno) fuera del predimensionado simple por capas: usar
// Tabla 1 / Tabla 6 según el caso por defecto de la app.
//
// ⚠️ ATENCIÓN: este Rsi (0,13 / 0,10 / 0,17) es el de transmitancia U y del perfil
// de temperaturas de Glaser. NO confundir con el Rsi = 0,25 FIJO de la
// comprobación de condensación superficial (ver BLOQUE 5 / RSI_CONDENSACION).
// =============================================================================

/** Procedencia base de los Documentos de Apoyo DA DB-HE/1. */
const PROC_DA_HE1 = {
  db: "DA DB-HE/1",
  edicion: "enero 2020 (sustituye a feb. 2015)",
  fecha: "2020-01",
  fuente:
    "codigotecnico.org · DA DB-HE/1 Cálculo de parámetros característicos de la envolvente (sin valor reglamentario)",
} as const;

/** Par Rsi/Rse [m²K/W] para una dirección de flujo. */
export interface ResistenciasSuperficiales {
  /** Resistencia térmica superficial interior [m²K/W]. */
  readonly rsi_m2K_W: number;
  /** Resistencia térmica superficial exterior [m²K/W]. */
  readonly rse_m2K_W: number;
}

export const RESISTENCIAS_SUPERFICIALES = tablaCTE(
  {
    ...PROC_DA_HE1,
    articulo: "ec. (2)",
    tabla: "Tabla 1 (exterior) · Tabla 6 (interiores / no habitable)",
  },
  {
    /**
     * Tabla 1 — cerramientos en contacto con el aire EXTERIOR [m²K/W].
     * Rse = 0,04 en los tres flujos.
     */
    exterior: {
      horizontal: { rsi_m2K_W: 0.13, rse_m2K_W: 0.04 }, // muro vertical / ±60° con la horizontal
      ascendente: { rsi_m2K_W: 0.1, rse_m2K_W: 0.04 }, // cubierta / techo (calor sube)
      descendente: { rsi_m2K_W: 0.17, rse_m2K_W: 0.04 }, // suelo (calor baja)
    } satisfies Record<DireccionFlujo, ResistenciasSuperficiales>,
    /**
     * Tabla 6 — particiones INTERIORES y contacto con espacios NO habitables
     * [m²K/W]. Ambas caras interiores (Rsi = Rse por dirección de flujo).
     */
    interior: {
      horizontal: { rsi_m2K_W: 0.13, rse_m2K_W: 0.13 },
      ascendente: { rsi_m2K_W: 0.1, rse_m2K_W: 0.1 },
      descendente: { rsi_m2K_W: 0.17, rse_m2K_W: 0.17 },
    } satisfies Record<DireccionFlujo, ResistenciasSuperficiales>,
  },
);

// =============================================================================
// BLOQUE 3 — λ de referencia [W/(m·K)] de materiales habituales.
// 🟡 NO ES EXIGENCIA DEL CTE. Valores ORIENTATIVOS, criterio de PREDIMENSIONADO,
// para montar cerramientos de ejemplo realistas. La fuente reglada es el Catálogo
// de Elementos Constructivos del CTE (CEC) y el DA DB-HE/1; en proyecto real, λ se
// toma del marcado CE / DIT / ficha técnica del fabricante (declaración de
// prestaciones), que PREVALECE. En la UI deben presentarse como valores POR
// DEFECTO EDITABLES con la etiqueta "orientativo (CEC del CTE) — sustituir por λ
// del fabricante en proyecto". El λ que use el usuario es un INPUT con origen
// declarado. (Mismo estatus que los modelos no-DB de hs4: COEF/criterio externo.)
//
// CONFIANZA MEDIA (orientativo por naturaleza; rangos del catálogo y literatura
// técnica habitual). NO usar como veredicto de cumplimiento de un producto concreto.
//
// La R de la CÁMARA DE AIRE sin ventilar va APARTE (R, no λ): es una resistencia
// [m²K/W], no una conductividad. Ver `CAMARA_AIRE_SIN_VENTILAR_R`.
// =============================================================================

/** Procedencia del λ orientativo (CEC) — criterio de predimensionado, NO exigencia. */
const PROC_LAMBDA_REF: ProcedenciaCTE = {
  db: "Catálogo de Elementos Constructivos del CTE (CEC)",
  edicion: "CEC (valores de diseño) · coherente con DA DB-HE/1 y UNE-EN ISO 10456",
  articulo:
    "valores λ de diseño orientativos — sustituibles por λ del fabricante (marcado CE/DIT)",
  fuente: "codigotecnico.org · Catálogo de Elementos Constructivos del CTE",
};

/**
 * Materiales con λ orientativo tabulado. Lista NO cerrada por naturaleza (el
 * usuario puede declarar otros); es un conjunto de referencia de predimensionado.
 */
export type MaterialReferencia =
  | "hormigon_armado"
  | "hormigon_masa_aridos_densos"
  | "mortero_cemento"
  | "mortero_cemento_denso"
  | "enlucido_yeso"
  | "placa_yeso_laminado"
  | "ladrillo_ceramico_perforado"
  | "ladrillo_ceramico_hueco"
  | "ladrillo_ceramico_macizo"
  | "bloque_hormigon"
  | "baldosa_ceramica_gres"
  | "madera_densidad_media"
  | "eps"
  | "xps"
  | "lana_mineral"
  | "pur_pir"
  | "betun_lamina_asfaltica";

/** Fila de λ orientativo de un material. */
export interface FilaLambda {
  /** Conductividad térmica de diseño orientativa λ [W/(m·K)]. */
  readonly lambda_W_mK: number;
  /** Nombre legible para UI/ficha. */
  readonly descripcion: string;
  /** Nota técnica (rango de catálogo, uso habitual…). */
  readonly nota?: string;
}

export const LAMBDA_REFERENCIA = tablaCTE(PROC_LAMBDA_REF, {
  /** λ orientativo [W/(m·K)]. NO exigencia — sustituible por λ del fabricante. */
  lambda_W_mK: {
    hormigon_armado: {
      lambda_W_mK: 2.3,
      descripcion: "Hormigón armado (2300–2500 kg/m³)",
      nota: "estructural; conductor (no aísla)",
    },
    hormigon_masa_aridos_densos: {
      lambda_W_mK: 1.65,
      descripcion: "Hormigón en masa / áridos densos",
    },
    mortero_cemento: {
      lambda_W_mK: 1.3,
      descripcion: "Mortero de cemento / enfoscado (1525–1800 kg/m³)",
      nota: "revoco/enfoscado",
    },
    mortero_cemento_denso: {
      lambda_W_mK: 1.8,
      descripcion: "Mortero de cemento denso (>2000 kg/m³)",
    },
    enlucido_yeso: {
      lambda_W_mK: 0.57,
      descripcion: "Enlucido de yeso (1000–1300 kg/m³)",
      nota: "guarnecido/enlucido",
    },
    placa_yeso_laminado: {
      lambda_W_mK: 0.25,
      descripcion: "Placa de yeso laminado PYL / cartón-yeso (≈900 kg/m³)",
      nota: "trasdosados",
    },
    ladrillo_ceramico_perforado: {
      lambda_W_mK: 0.49,
      descripcion: "Ladrillo cerámico perforado (LP)",
      nota: "fábrica de ½ pie habitual",
    },
    ladrillo_ceramico_hueco: {
      lambda_W_mK: 0.32,
      descripcion: "Ladrillo cerámico hueco (LH)",
      nota: "tabiquería",
    },
    ladrillo_ceramico_macizo: {
      lambda_W_mK: 0.87,
      descripcion: "Ladrillo cerámico macizo",
      nota: "fábrica vista pesada",
    },
    bloque_hormigon: {
      lambda_W_mK: 1.0,
      descripcion: "Bloque de hormigón convencional",
      nota: "según geometría/relleno",
    },
    baldosa_ceramica_gres: {
      lambda_W_mK: 1.0,
      descripcion: "Baldosa cerámica / gres",
      nota: "acabados de suelo",
    },
    madera_densidad_media: {
      lambda_W_mK: 0.18,
      descripcion: "Madera de densidad media (frondosa ligera/conífera)",
      nota: "carpintería/estructura ligera",
    },
    eps: {
      lambda_W_mK: 0.037,
      descripcion: "EPS — poliestireno expandido",
      nota: "rango catálogo 0,029–0,046",
    },
    xps: {
      lambda_W_mK: 0.034,
      descripcion: "XPS — poliestireno extruido",
      nota: "rango 0,033–0,036",
    },
    lana_mineral: {
      lambda_W_mK: 0.035,
      descripcion: "Lana mineral (MW: roca / vidrio)",
      nota: "rango 0,031–0,050",
    },
    pur_pir: {
      lambda_W_mK: 0.028,
      descripcion: "PUR / PIR — espuma de poliuretano",
      nota: "rango 0,022–0,040 (proyectado/plancha)",
    },
    betun_lamina_asfaltica: {
      lambda_W_mK: 0.23,
      descripcion: "Betún / lámina impermeabilizante asfáltica",
      nota: "espesor pequeño, R despreciable",
    },
  } satisfies Record<MaterialReferencia, FilaLambda>,
});

// -----------------------------------------------------------------------------
// Cámara de aire sin ventilar — RESISTENCIA térmica R [m²K/W] (NO λ).
// DA DB-HE/1, Tabla 2 ("cámaras de aire sin ventilar"). VERIFICADA por texto. La
// tabla da R por ESPESOR `e` de la cámara y por ORIENTACIÓN de la misma:
//   - e = 1 cm:  cámara horizontal 0,15 · cámara vertical 0,15
//   - e = 2 cm:  cámara horizontal 0,16 · cámara vertical 0,17
//   - e ≥ 5 cm:  cámara horizontal 0,16 · cámara vertical 0,18
// «cámara VERTICAL» ⇒ flujo de calor HORIZONTAL (muro); «cámara HORIZONTAL» ⇒
// flujo de calor VERTICAL (techo/suelo: ascendente o descendente).
//
// Las cámaras VENTILADAS / muy ventiladas se tratan distinto (no se considera la
// cámara ni las capas exteriores a ella): fuera del predimensionado simple por capas.
// -----------------------------------------------------------------------------

export const CAMARA_AIRE_SIN_VENTILAR_R = tablaCTE(
  {
    ...PROC_DA_HE1,
    articulo: "Resistencia térmica de cámaras de aire sin ventilar",
    tabla: "Tabla 2",
  },
  {
    /**
     * Resistencia [m²K/W] de la cámara sin ventilar por dirección del flujo de
     * calor (e ≥ 2 cm, rango estable). Mapeo verificado (DA DB-HE/1, Tabla 2):
     *   - `horizontal` (muro) → cámara VERTICAL → 0,18 (e≥5 cm).
     *   - `ascendente`/`descendente` (techo/suelo) → cámara HORIZONTAL → 0,16.
     */
    r_m2K_W: {
      horizontal: 0.18,
      ascendente: 0.16,
      descendente: 0.16,
    } satisfies Record<DireccionFlujo, number>,
    /** Cifra de predimensionado para cámara ≈ 20–50 mm [m²K/W] (centro del rango). */
    rTipico_m2K_W: 0.17,
    /**
     * La Tabla 2 completa: R [m²K/W] por espesor (1, 2 y 5 cm) y orientación de la
     * cámara; «los valores intermedios se pueden obtener por interpolación lineal».
     * Más de 5 cm: se toma el de 5 cm (extrapolación, criterio).
     */
    porEspesor: {
      espesores_m: [0.01, 0.02, 0.05],
      vertical: [0.15, 0.17, 0.18],
      horizontal: [0.15, 0.16, 0.16],
    },
  },
);

// =============================================================================
// BLOQUE 4 — fRsi,min. DA DB-HE/2 §4.1.1, Tabla 1. COMPROBACIÓN COMPLEMENTARIA
// (DA DB-HE/2, oct. 2013): el DB-HE 2019 solo cuantifica la condensación
// intersticial (ap. 3.3); la superficial es un procedimiento del DA (verificación
// v4, §6.3). Factor de temperatura de la superficie interior mínimo por clase de
// higrometría (filas) × zona climática de invierno (columnas). CONFIANZA ALTA.
// No se aplica a los huecos ni a los elementos en contacto con el terreno o con
// no habitables de escasa producción de vapor (DA/2 §4.1.1; §6 de la verificación).
//
// VEREDICTO (criterio del motor, no código aquí):
//   CUMPLE ⟺ fRsi ≥ fRsi,min ; NO CUMPLE ⟺ fRsi < fRsi,min.
//   Equivalente sobre U: U_max_fRsi = (1 − fRsi,min) / 0,25 → el cerramiento no
//   debe superar esa U. El motor puede mostrar el MÁS restrictivo entre Ulim
//   (Tabla 3.1.1.a) y U_max_fRsi.
//
// COLUMNAS CONFIRMADAS (verificado por texto del DA DB-HE/2, Tabla 1): son 6
// columnas α / A / B / C / D / E, SIN desdoble de C en C1/C2. La serie de la clase
// 4 (0,56 / 0,66 / 0,66 / 0,69 / 0,75 / 0,78) corresponde a esas 6 columnas, con
// α=0,56. La columna α (Canarias) tiene su propio valor (NO se mapea a A).
// =============================================================================

/** Procedencia base del Documento de Apoyo DA DB-HE/2 (condensaciones). */
const PROC_DA_HE2 = {
  db: "DA DB-HE/2",
  edicion: "octubre 2013",
  fecha: "2013-10",
  fuente: "codigotecnico.org · DA DB-HE/2 Condensaciones (procedimiento de apoyo)",
} as const;

/**
 * fRsi,min por zona climática (adimensional, 0..1). 6 columnas confirmadas
 * α / A / B / C / D / E (verificado DA DB-HE/2, Tabla 1; sin desdoble C1/C2).
 */
export interface FilaFRsiMin {
  readonly "α": number;
  readonly A: number;
  readonly B: number;
  readonly C: number;
  readonly D: number;
  readonly E: number;
}

export const FRSI_MIN_TABLA_1 = tablaCTE(
  {
    ...PROC_DA_HE2,
    articulo: "§4.1.1 (comprobación complementaria)",
    tabla: "Tabla 1 (fRsi,min)",
  },
  {
    /** fRsi,min (adimensional) por clase de higrometría × zona (columnas α–E). */
    fRsiMin: {
      clase_5: { "α": 0.7, A: 0.8, B: 0.8, C: 0.8, D: 0.9, E: 0.9 },
      clase_4: { "α": 0.56, A: 0.66, B: 0.66, C: 0.69, D: 0.75, E: 0.78 },
      clase_3_o_inferior: { "α": 0.42, A: 0.5, B: 0.52, C: 0.56, D: 0.61, E: 0.64 },
    } satisfies Record<ClaseHigrometria, FilaFRsiMin>,
  },
);

// =============================================================================
// BLOQUE 5 — Rsi FIJO de la comprobación de condensación superficial.
// DA DB-HE/2: fRsi = 1 − U · 0,25.
//
// ⚠️⚠️ ERROR CLÁSICO A EVITAR: este Rsi = 0,25 m²K/W es EXCLUSIVO de la
// comprobación de condensación superficial (caso desfavorable: mueble adosado,
// cortina…). NO es el Rsi = 0,13/0,10/0,17 de la Tabla 1 del DA DB-HE/1 (ese se
// usa para calcular U y el perfil de temperaturas de Glaser). Son DOS Rsi
// distintos: el motor debe usar 0,25 SOLO en la fórmula de fRsi. CONFIANZA ALTA.
// =============================================================================

export const RSI_CONDENSACION = tablaCTE(
  {
    ...PROC_DA_HE2,
    articulo: "§4.1.2 ec. [9]",
    tabla: "ec. fRsi = 1 − U·0,25",
  },
  {
    /**
     * Rsi FIJO de la comprobación de fRsi [m²K/W]. DISTINTO del Rsi de
     * transmitancia (BLOQUE 2). Usar SOLO en fRsi = 1 − U·Rsi.
     */
    rsiCondensacion_m2K_W: 0.25,
  } as const,
);

/**
 * Atajo a la constante numérica del Rsi fijo de condensación [m²K/W]. El valor
 * canónico vive en `RSI_CONDENSACION` (con su procedencia citable); esta
 * re-exportación es para legibilidad en calc.ts. NO duplicar la cifra: deriva de
 * la tabla.
 */
export const RSI_CONDENSACION_m2K_W: number =
  RSI_CONDENSACION.datos.rsiCondensacion_m2K_W;

// =============================================================================
// BLOQUE 6 — Coeficientes de la curva de saturación de Magnus.
// DA DB-HE/2, ecuaciones [3] (θ ≥ 0 °C) y [4] (θ < 0 °C). Psat(θ) en Pa, θ en °C:
//
//   θ ≥ 0:  Psat = 610,5 · exp( 17,269 · θ / (237,3 + θ) )   // ec. [3]
//   θ < 0:  Psat = 610,5 · exp( 21,875 · θ / (265,5 + θ) )   // ec. [4]
//
// Como es una fórmula con coeficientes, se versionan los COEFICIENTES como datos
// (con procedencia); el cálculo `psat(θ)` vive en calc.ts (función pura). Así no
// hay cifras de Magnus dispersas en la lógica. CONFIANZA ALTA (coeficientes
// confirmados como ec. [3]/[4] del DA DB-HE/2 por varias fuentes; coinciden con la
// fórmula de Magnus estándar).
// =============================================================================

export const PSAT_MAGNUS = tablaCTE(
  {
    ...PROC_DA_HE2,
    articulo: "Presión de vapor de saturación",
    tabla: "ec. [3] y [4]",
  },
  {
    /** Factor preexponencial común [Pa]. */
    p0_Pa: 610.5,
    /** Rama positiva (θ ≥ 0 °C), ec. [3]: a/(b+θ). */
    positiva: { a: 17.269, b_C: 237.3 },
    /** Rama negativa (θ < 0 °C), ec. [4]: a/(b+θ). */
    negativa: { a: 21.875, b_C: 265.5 },
  } as const,
);

// =============================================================================
// BLOQUE 7 — µ de referencia: factor de resistencia a la difusión del vapor.
// 🟡 CRITERIO DE PREDIMENSIONADO, NO exigencia numérica. Rangos genéricos del
// Catálogo de Elementos Constructivos del CTE (CEC); en proyecto real prevalece el
// µ (o el Sd declarado) de la ficha técnica del producto. Usado en Glaser:
// Sd = µ · e [m] (µ adimensional, e en m). CONFIANZA MEDIA (rangos genéricos).
//
// Se modela como valor de referencia (centro del rango) + rango informativo. La
// barrera de vapor / lámina impermeabilizante NO se modela por µ: se usa su Sd
// declarado (campo `sdDeclarado` true → el motor pide el Sd del producto).
// Etiquetar en ficha: "valor de referencia CEC; en proyecto usar µ/Sd del producto".
// =============================================================================

/** Procedencia del µ orientativo (CEC) — criterio de predimensionado, NO exigencia. */
const PROC_MU_REF: ProcedenciaCTE = {
  db: "Catálogo de Elementos Constructivos del CTE (CEC)",
  edicion: "CEC vigente · coherente con UNE-EN ISO 10456",
  articulo:
    "Propiedades higrotérmicas (µ) — valores de referencia, sustituibles por el µ/Sd del fabricante",
  fuente: "codigotecnico.org · Catálogo de Elementos Constructivos del CTE",
};

/**
 * Materiales con µ de referencia tabulado (para Glaser). Conjunto de referencia
 * de predimensionado; el usuario puede declarar otros.
 */
export type MaterialDifusion =
  | "camara_aire_sin_ventilar"
  | "lana_mineral"
  | "hormigon_armado"
  | "mortero_cemento"
  | "ladrillo_ceramico"
  | "ladrillo_macizo"
  | "placa_yeso_laminado"
  | "eps"
  | "xps"
  | "pur_pir"
  | "madera"
  | "corcho"
  | "barrera_vapor";

/**
 * Fila de µ de referencia. `mu` = valor central orientativo (adimensional);
 * `muMin`/`muMax` documentan el rango del CEC. `sdDeclarado: true` ⇒ el material
 * (barrera de vapor) NO se modela por µ: usar el Sd declarado del producto.
 */
export interface FilaMu {
  /** Factor de resistencia a la difusión del vapor µ (adimensional), valor central. */
  readonly mu: number;
  /** Extremo inferior del rango CEC (adimensional). */
  readonly muMin?: number;
  /** Extremo superior del rango CEC (adimensional). */
  readonly muMax?: number;
  /** Nombre legible para UI/ficha. */
  readonly descripcion: string;
  /** `true` ⇒ usar Sd declarado del producto, no µ (barreras de vapor/láminas). */
  readonly sdDeclarado?: boolean;
  /** Nota técnica. */
  readonly nota?: string;
}

export const MU_REFERENCIA = tablaCTE(PROC_MU_REF, {
  /** µ de referencia (adimensional). Orientativo — sustituible por µ/Sd del fabricante. */
  mu: {
    camara_aire_sin_ventilar: {
      mu: 1,
      descripcion: "Cámara de aire sin ventilar",
      nota: "ventilada → no resistente (se considera exterior)",
    },
    lana_mineral: {
      mu: 1,
      descripcion: "Lana mineral (MW)",
      nota: "muy permeable al vapor",
    },
    hormigon_armado: {
      mu: 95,
      muMin: 70,
      muMax: 120,
      descripcion: "Hormigón armado",
      nota: "según densidad",
    },
    mortero_cemento: {
      mu: 10,
      descripcion: "Mortero de cemento / enfoscado",
    },
    ladrillo_ceramico: {
      mu: 10,
      descripcion: "Ladrillo cerámico perforado / hueco",
    },
    ladrillo_macizo: {
      mu: 10,
      descripcion: "Ladrillo cerámico macizo",
    },
    placa_yeso_laminado: {
      mu: 8,
      muMin: 6,
      muMax: 10,
      descripcion: "Placa de yeso laminado / yeso",
    },
    eps: {
      mu: 60,
      muMin: 20,
      muMax: 100,
      descripcion: "EPS — poliestireno expandido",
    },
    xps: {
      mu: 150,
      muMin: 100,
      muMax: 2200,
      descripcion: "XPS — poliestireno extruido",
      nota: "alta resistencia al vapor (barrera intrínseca)",
    },
    pur_pir: {
      mu: 60,
      muMin: 20,
      muMax: 150,
      descripcion: "PUR / PIR — poliuretano",
    },
    madera: {
      mu: 35,
      muMin: 20,
      muMax: 50,
      descripcion: "Madera",
      nota: "según especie/densidad",
    },
    corcho: {
      mu: 7,
      muMin: 5,
      muMax: 10,
      descripcion: "Corcho",
    },
    barrera_vapor: {
      mu: 0, // No aplicar: usar Sd declarado del producto.
      sdDeclarado: true,
      descripcion: "Lámina impermeabilizante / barrera de vapor",
      nota: "µ muy alto / Sd≈∞ — usar el Sd declarado del producto, no µ",
    },
  } satisfies Record<MaterialDifusion, FilaMu>,
});

// =============================================================================
// BLOQUE 8 — Condiciones interiores de cálculo por defecto. DA DB-HE/2.
// θi = 20 °C; HR interior por clase de higrometría (55 / 62 / 70 %). CONFIANZA ALTA.
//
// ⚠️ θe / φe de ENERO salen del DA DB-HE/2, Apéndice C, Tabla C.1 (capital de la
// provincia, con la corrección por altitud del §2.1): `CLIMA_TABLA_C1` más abajo.
// El motor los recibe como entrada. Sin dato, NO hay un valor típico del DA: el
// motor usa una cota del lado seguro (0 °C y 100 %) y avisa (verificación v4 §8.5).
// =============================================================================

export const CONDICIONES_DEFECTO = tablaCTE(
  {
    ...PROC_DA_HE2,
    articulo: "Condiciones interiores de cálculo / clases de higrometría",
  },
  {
    /** Temperatura interior de cálculo [°C]. */
    tempInterior_C: 20,
    /** HR interior por clase de higrometría a 20 °C [%]. */
    hrInterior_pct: {
      clase_3_o_inferior: 55,
      clase_4: 62,
      clase_5: 70,
    } satisfies Record<ClaseHigrometria, number>,
    /**
     * Cota del lado seguro SOLO si no hay dato climático: 0 °C y aire exterior
     * saturado. No es un valor del DA (no lo da): el motor avisa y pide el dato.
     */
    sinDatoExterior: { temp_C: 0, hr_pct: 100 },
  } as const,
);

// =============================================================================
// BLOQUE 9 — ψ de PUENTES TÉRMICOS lineales [W/(m·K)]. DA DB-HE/3 (enero 2014), §5
// "Atlas de puentes térmicos".
//
// El DA DB-HE/3 §5 SÍ HA SIDO LEÍDO. Da ψ PARAMÉTRICOS: Ψe (dimensiones EXTERIORES)
// y Ψi (interiores) en FUNCIÓN de la transmitancia del muro Umuro y del detalle
// constructivo (no son escalares únicos). El motor trabaja en convenio de
// dimensiones EXTERIORES → usa Ψe. Los valores de abajo son RANGOS REPRESENTATIVOS
// (Ψe) para PREDIMENSIONADO, INFORMATIVOS: el H_PT que producen NUNCA contamina el
// estado/veredicto. Mismo espíritu que las etiquetas no-DB de hs4 (criterio, no
// exigencia numérica cerrada).
//
// VERIFICADO CELDA A CELDA (Atlas §5.9, según Umuro): solo los SIGNOS y rangos de
// las ESQUINAS:
//  - `esquina_saliente`: Ψe NEGATIVO (la esquina saliente "alarga" la superficie
//    exterior → menos pérdida por ml en dimensiones exteriores). Atlas grupo 1
//    (Umuro 0,73→0,24): Ψe ≈ −0,24, −0,15, −0,11, −0,10, −0,10 → rango [−0,24, −0,10].
//    (El Ψi correspondiente sería +0,05..+0,11.)
//  - `esquina_entrante`: Ψe POSITIVO (signo opuesto). Atlas grupo 2: Ψe ≈ +0,18,
//    +0,12, +0,09, +0,08 → rango [+0,08, +0,18].
//
// El RESTO de encuentros (frente_forjado, fachada_cubierta, fachada_solera_terreno,
// contorno_hueco, pilares, particion_interior_fachada) conservan rangos
// REPRESENTATIVOS (convenio exteriores, Ψe) para predimensionado; sus rejillas
// numéricas paramétricas por Umuro/aislamiento NO se han transcrito celda a celda:
// queda como REFINAMIENTO FUTURO (transcripción paramétrica fina), NO escalar cerrado.
//
// Lo que SÍ es exigencia (verificado, A1-26): el DB-HE ap. 4.1.d) obliga a
// CARACTERIZAR los puentes térmicos; el cálculo de ψ se remite al DA DB-HE/3. El
// método global Klim (Tablas 3.1.1.b/c-HE1) ya engloba su efecto → alternativa NO
// bloqueante. La integración en pérdidas: H_PT = Σ (ψ_j · L_j) [W/K].
//
// Límites máximos de ψ reportados por fuentes secundarias (≤ 1,0 W/(m·K) en frentes
// de forjado/fachada-cubierta; ≤ 0,5 en contornos de hueco) NO están confirmados
// contra el DA DB-HE/3 (podrían ser de programas de certificación): ORIENTATIVOS
// (campo `limiteMax_W_mK?`, informativo).
// =============================================================================

/**
 * Procedencia extendida para datos PENDIENTES de verificación literal contra el
 * PDF maquetado. `pendienteVerificacionPDF: true` deja constancia explícita para
 * que la ficha NO los cite como cifra cerrada del CTE.
 */
export interface ProcedenciaPendiente extends ProcedenciaCTE {
  /** Naturaleza del dato (orientativo / no verificado). */
  naturaleza: string;
  /** `true` ⇒ las cifras NO están verificadas celda a celda contra el PDF maquetado. */
  pendienteVerificacionPDF: true;
}

/**
 * Tipos de encuentro (puente térmico lineal) del DA DB-HE/3 §5. La lista NO está
 * cerrada por naturaleza (el DA tabula ψ paramétricamente por Umuro/detalle).
 */
export type TipoEncuentroPT =
  | "frente_forjado"
  | "fachada_cubierta"
  | "fachada_solera_terreno"
  | "esquina_saliente"
  | "esquina_entrante"
  | "contorno_hueco"
  | "pilar_en_fachada"
  | "pilar_en_esquina"
  | "particion_interior_fachada";

/**
 * Valor ψ = Ψe (dimensiones exteriores) REPRESENTATIVO de un encuentro. `psi_W_mK`
 * es un valor central de predimensionado dentro de `psiMin_W_mK..psiMax_W_mK`
 * (puede ser negativo: esquinas salientes). NO es exigencia: el ψ real es
 * paramétrico (Umuro, continuidad del aislante, frente de forjado aislado o no…).
 * `limiteMax_W_mK` es un límite reportado NO confirmado.
 */
export interface FilaPsi {
  /** ψ orientativo central [W/(m·K)] para predimensionado. */
  readonly psi_W_mK: number;
  /** Extremo inferior del rango orientativo [W/(m·K)] (puede ser negativo). */
  readonly psiMin_W_mK: number;
  /** Extremo superior del rango orientativo [W/(m·K)]. */
  readonly psiMax_W_mK: number;
  /** Nombre legible para UI/ficha. */
  readonly descripcion: string;
  /** Límite máximo reportado [W/(m·K)] — NO confirmado contra el DA (informativo). */
  readonly limiteMax_W_mK?: number;
  /** Nota técnica / condición de mejora. */
  readonly nota?: string;
}

/**
 * ψ de puentes térmicos — DATOS ABIERTOS, RANGOS REPRESENTATIVOS de Ψe (dimensiones
 * exteriores) del DA DB-HE/3 §5 (leído). Esquinas con signo/rango verificado (§5.9);
 * resto, representativo (rejilla paramétrica fina = refinamiento futuro).
 * Deliberadamente SIN `as const` (no es fuente de verdad cerrada). El tipo de los
 * datos se anota explícitamente para mantener TS estricto.
 */
export const PSI_PUENTES_TERMICOS_DA_DB_HE_3: {
  procedencia: ProcedenciaPendiente;
  datos: { psi: Record<TipoEncuentroPT, FilaPsi>; pendienteVerificacionPDF: true };
} = {
  procedencia: {
    db: "DA DB-HE/3",
    edicion: "enero 2014 (asociado a DB-HE)",
    fecha: "2014-01-01",
    articulo: "§5 Atlas de puentes térmicos (transmitancia térmica lineal ψ)",
    tabla: "Atlas §5 — Ψe/Ψi PARAMÉTRICOS por Umuro (esquinas verificadas §5.9)",
    fuente: "codigotecnico.org · DA DB-HE/3 Puentes térmicos",
    naturaleza:
      "RANGOS REPRESENTATIVOS de Ψe (dimensiones exteriores) para predimensionado, " +
      "INFORMATIVOS (no contaminan veredicto). El DA da ψ paramétricos por Umuro: " +
      "esquinas con signo/rango verificado (§5.9); resto, transcripción paramétrica " +
      "fina como refinamiento futuro.",
    pendienteVerificacionPDF: true,
  },
  datos: {
    /**
     * ψ = Ψe (dimensiones exteriores), RANGOS REPRESENTATIVOS para predimensionado,
     * INFORMATIVOS. Esquinas con signo/rango VERIFICADO (Atlas §5.9); resto,
     * representativo (transcripción paramétrica fina = refinamiento futuro).
     */
    psi: {
      frente_forjado: {
        psi_W_mK: 0.5,
        psiMin_W_mK: 0.2,
        psiMax_W_mK: 0.8,
        descripcion: "Frente de forjado (entre pisos)",
        nota: "≤ ~0,1 si aislamiento continuo por el exterior",
      },
      fachada_cubierta: {
        psi_W_mK: 0.6,
        psiMin_W_mK: 0.2,
        psiMax_W_mK: 1.0,
        descripcion: "Encuentro fachada–cubierta",
        limiteMax_W_mK: 1.0,
        nota: "hasta ~1,0 en caso desfavorable",
      },
      fachada_solera_terreno: {
        psi_W_mK: 0.4,
        psiMin_W_mK: 0.1,
        psiMax_W_mK: 0.8,
        descripcion: "Encuentro fachada–solera / forjado en contacto con terreno",
        nota: "variable según detalle",
      },
      esquina_saliente: {
        psi_W_mK: -0.15,
        psiMin_W_mK: -0.24,
        psiMax_W_mK: -0.1,
        descripcion: "Esquina saliente (vertical)",
        nota: "Ψe; geométrico, NEGATIVO en dimensiones exteriores (Atlas §5.9, grupo 1; Ψi ≈ +0,05..+0,11)",
      },
      esquina_entrante: {
        psi_W_mK: 0.12,
        psiMin_W_mK: 0.08,
        psiMax_W_mK: 0.18,
        descripcion: "Esquina entrante",
        nota: "Ψe POSITIVO en dimensiones exteriores (signo opuesto a la saliente; Atlas §5.9, grupo 2)",
      },
      contorno_hueco: {
        psi_W_mK: 0.15,
        psiMin_W_mK: 0.05,
        psiMax_W_mK: 0.3,
        descripcion: "Contorno de hueco (jamba / dintel / alféizar)",
        limiteMax_W_mK: 0.5,
        nota: "≤ ~0,5 límite reportado (no confirmado)",
      },
      pilar_en_fachada: {
        psi_W_mK: 0.3,
        psiMin_W_mK: 0.1,
        psiMax_W_mK: 0.6,
        descripcion: "Pilar integrado en fachada",
        nota: "según U del muro y aislamiento del pilar",
      },
      pilar_en_esquina: {
        psi_W_mK: 0.4,
        psiMin_W_mK: 0.1,
        psiMax_W_mK: 0.8,
        descripcion: "Pilar en esquina",
        nota: "según detalle",
      },
      particion_interior_fachada: {
        psi_W_mK: 0.1,
        psiMin_W_mK: 0.0,
        psiMax_W_mK: 0.3,
        descripcion: "Partición interior con fachada",
        nota: "bajo",
      },
    },
    pendienteVerificacionPDF: true,
  },
};

// =============================================================================
// BLOQUE 10 — Huecos (feature-15, verificación v4 §4-§5).
// UH por la ec. (10) del DA DB-HE/1 (enero 2020), con la transmitancia lineal Ψ de
// la junta vidrio-marco de su Tabla 10. Ug y Uf orientativos del Catálogo de
// Elementos Constructivos (CEC v6.3, borrador, sin carácter reglamentario): son
// valores por defecto EDITABLES — en proyecto, los declarados por el fabricante
// (HE1 ap. 5.1 párr. 5).
// =============================================================================

export const PSI_HUECO_TABLA_10 = tablaCTE(
  { ...PROC_DA_HE1, articulo: "§2.1.4.1 ec. (10)", tabla: "Tabla 10" },
  {
    /** Ψ [W/(m·K)]: [separador convencional, separador de prestaciones térmicas mejoradas]. */
    psi_W_mK: {
      madera_plastico: { simple: [0, 0], doble_o_triple: [0.06, 0.05], doble_be_o_triple_2be: [0.08, 0.06] },
      metalico_con_rpt: { simple: [0, 0], doble_o_triple: [0.08, 0.06], doble_be_o_triple_2be: [0.11, 0.08] },
      metalico_sin_rpt: { simple: [0, 0], doble_o_triple: [0.02, 0.01], doble_be_o_triple_2be: [0.05, 0.04] },
    },
  },
);

const PROC_CEC_HUECOS: ProcedenciaCTE = {
  db: "Catálogo de Elementos Constructivos del CTE (CEC)",
  edicion: "v6.3 (marzo 2010, borrador)",
  articulo: "§3.15.2 Acristalamientos · §3.16 Marcos — orientativo, sustituir por el valor del fabricante",
  fuente: "CEC v6.3 · sin carácter reglamentario (DB-HE Intro III)",
};

export const UG_REFERENCIA_CEC = tablaCTE(
  { ...PROC_CEC_HUECOS, tabla: "UH,v vertical, 4-cámara-4" },
  {
    /** Ug [W/m²K] de un doble 4/16/4 vertical (cámara de 15-20 mm). */
    doble_4_16_4: { normal: 2.7, be_0_1: 1.8, be_0_03: 1.6, be_menor_0_03: 1.4 },
  },
);

export const UF_REFERENCIA_CEC = tablaCTE(
  { ...PROC_CEC_HUECOS, tabla: "Marcos (vertical)" },
  {
    /** Uf [W/m²K], marco vertical. */
    uf_W_m2K: {
      metalico_sin_rpt: 5.7,
      metalico_rpt_4_12mm: 4.0,
      metalico_rpt_mayor_12mm: 3.2,
      madera_700kg_m3: 2.2,
      madera_500kg_m3: 2.0,
      pvc_dos_camaras: 2.2,
      pvc_tres_camaras: 1.8,
    },
    /** Fracción de marco por defecto: DB-HE Anejo A (control solar, «de forma simplificada»). */
    fraccionMarcoDefecto: 0.25,
  },
);

// =============================================================================
// BLOQUE 11 — Clima de enero (feature-15, verificación v4 §8 y §5.B7-B8).
// DA DB-HE/2 Apéndice C, Tabla C.1: temperatura y humedad medias mensuales de las
// capitales de provincia. Para otra localidad más alta que la capital: −1 °C por
// cada 100 m, con la misma humedad absoluta (§2.1, ec. [1]-[2]); si está más
// baja, los datos de la capital. La altitud de la capital no la da el DA: se toma
// la de la Tabla a-Anejo G del DB-HE (criterio).
// Claves = las provincias de `data/zonasClimaticasHE.ts`.
// =============================================================================

export const CLIMA_TABLA_C1 = tablaCTE(
  {
    ...PROC_DA_HE2,
    articulo: "§2.1 y §4.2.1",
    tabla: "Apéndice C, Tabla C.1",
  },
  {
    /** T [°C] y HR [%] medias de enero a diciembre. */
    capitales: {
      "Álava": { T: [4.6, 6.0, 7.2, 9.2, 12.4, 15.6, 18.3, 18.5, 16.5, 12.7, 7.5, 5.0], HR: [83, 78, 72, 71, 71, 71, 69, 70, 70, 74, 81, 83] },
      "Albacete": { T: [5.0, 6.3, 8.5, 10.9, 15.3, 20.0, 24.0, 23.7, 20.0, 14.1, 8.5, 5.3], HR: [78, 70, 62, 60, 54, 50, 44, 50, 58, 70, 77, 79] },
      "Alicante": { T: [11.6, 12.4, 13.8, 15.7, 18.6, 22.2, 25.0, 25.5, 23.2, 19.1, 15.0, 12.1], HR: [67, 65, 63, 65, 65, 65, 64, 68, 69, 70, 69, 68] },
      "Almería": { T: [12.4, 13.0, 14.4, 16.1, 18.7, 22.3, 25.5, 26.0, 24.1, 20.1, 16.2, 13.3], HR: [70, 68, 66, 65, 67, 65, 64, 66, 66, 69, 70, 69] },
      "Asturias": { T: [7.5, 8.5, 9.5, 10.3, 12.8, 15.8, 18.0, 18.3, 17.4, 14.0, 10.4, 8.7], HR: [77, 75, 74, 77, 79, 80, 80, 80, 78, 78, 78, 76] },
      "Ávila": { T: [3.1, 4.0, 5.6, 7.6, 11.5, 16.0, 19.9, 19.4, 16.5, 11.2, 6.0, 3.4], HR: [75, 70, 62, 61, 55, 50, 39, 40, 50, 65, 73, 77] },
      "Badajoz": { T: [8.7, 10.1, 12.0, 14.2, 17.9, 22.3, 25.3, 25.0, 22.6, 17.4, 12.1, 9.0], HR: [80, 76, 69, 66, 60, 55, 50, 50, 57, 68, 77, 82] },
      "Baleares": { T: [11.6, 11.8, 12.9, 14.7, 17.6, 21.8, 24.6, 25.3, 23.5, 20.0, 15.6, 13.0], HR: [71, 69, 68, 67, 69, 69, 67, 71, 73, 72, 72, 71] },
      "Barcelona": { T: [8.8, 9.5, 11.1, 12.8, 16.0, 19.7, 22.9, 23.0, 21.0, 17.1, 12.5, 9.6], HR: [73, 70, 70, 70, 72, 70, 69, 72, 74, 74, 74, 71] },
      "Burgos": { T: [2.6, 3.9, 5.7, 7.6, 11.2, 15.0, 18.4, 18.3, 15.8, 11.1, 5.8, 3.2], HR: [86, 80, 73, 72, 69, 67, 61, 62, 67, 76, 83, 86] },
      "Cáceres": { T: [7.8, 9.3, 11.7, 13.0, 16.6, 22.3, 26.1, 25.4, 23.6, 17.4, 12.0, 8.8], HR: [78, 73, 63, 60, 55, 44, 37, 39, 49, 65, 76, 80] },
      "Cádiz": { T: [12.8, 13.5, 14.7, 16.2, 18.7, 21.5, 24.0, 24.5, 23.5, 20.1, 16.1, 13.3], HR: [77, 75, 70, 71, 71, 70, 69, 69, 70, 73, 76, 77] },
      "Cantabria": { T: [9.7, 10.3, 10.8, 11.9, 14.3, 17.0, 19.3, 19.5, 18.5, 16.1, 12.5, 10.5], HR: [71, 71, 71, 74, 75, 77, 77, 78, 77, 75, 73, 72] },
      "Castellón": { T: [10.1, 11.1, 12.7, 14.2, 17.2, 21.3, 24.1, 24.5, 22.3, 18.3, 13.5, 11.2], HR: [68, 66, 64, 66, 67, 66, 66, 69, 71, 71, 73, 69] },
      "Ceuta": { T: [11.5, 11.6, 12.6, 13.9, 16.3, 18.8, 21.7, 22.2, 20.2, 17.7, 14.1, 12.1], HR: [87, 87, 88, 87, 87, 87, 87, 87, 89, 89, 88, 88] },
      "Ciudad Real": { T: [5.7, 7.2, 9.6, 11.9, 16.0, 20.8, 25.0, 24.7, 21.0, 14.8, 9.1, 5.9], HR: [80, 74, 66, 65, 59, 54, 47, 48, 57, 68, 78, 82] },
      "Córdoba": { T: [9.5, 10.9, 13.1, 15.2, 19.2, 23.1, 26.9, 26.7, 23.7, 18.4, 12.9, 9.7], HR: [80, 75, 67, 65, 58, 53, 46, 49, 55, 67, 76, 80] },
      "A Coruña": { T: [10.2, 10.5, 11.3, 12.1, 14.1, 16.4, 18.4, 18.9, 18.1, 15.7, 12.7, 10.9], HR: [77, 76, 74, 76, 78, 79, 79, 79, 79, 79, 79, 78] },
      "Cuenca": { T: [4.2, 5.2, 7.4, 9.6, 13.6, 18.2, 22.4, 22.1, 18.6, 12.9, 7.6, 4.8], HR: [78, 73, 64, 62, 58, 54, 44, 46, 56, 68, 76, 79] },
      "Girona": { T: [6.8, 7.9, 9.8, 11.6, 15.4, 19.4, 22.8, 22.4, 19.9, 15.2, 10.2, 7.7], HR: [77, 73, 71, 71, 70, 67, 62, 68, 72, 76, 77, 75] },
      "Granada": { T: [6.5, 8.4, 10.5, 12.4, 16.3, 21.1, 24.3, 24.1, 21.1, 15.4, 10.6, 7.4], HR: [76, 71, 64, 61, 56, 49, 42, 42, 53, 62, 73, 77] },
      "Guadalajara": { T: [5.5, 6.8, 8.8, 11.6, 15.3, 19.8, 23.5, 22.8, 19.5, 14.1, 9.0, 5.9], HR: [80, 76, 69, 68, 67, 62, 53, 54, 61, 72, 79, 81] },
      "Guipúzcoa": { T: [7.9, 8.5, 9.4, 10.7, 13.5, 16.1, 18.4, 18.7, 18.0, 15.2, 10.9, 8.6], HR: [76, 74, 74, 79, 79, 82, 82, 83, 79, 76, 76, 76] },
      "Huelva": { T: [12.2, 12.8, 14.4, 16.5, 19.2, 22.2, 25.3, 25.7, 23.7, 20.0, 15.4, 12.5], HR: [76, 72, 66, 63, 60, 59, 54, 54, 60, 67, 72, 75] },
      "Huesca": { T: [4.7, 6.7, 9.0, 11.3, 15.3, 19.5, 23.3, 22.7, 19.7, 14.6, 8.7, 5.3], HR: [80, 73, 64, 63, 60, 56, 48, 53, 61, 70, 78, 81] },
      "Jaén": { T: [8.7, 9.9, 12.0, 14.3, 18.5, 23.1, 27.2, 27.1, 23.6, 17.6, 12.2, 8.7], HR: [77, 72, 67, 64, 59, 53, 44, 45, 55, 67, 75, 77] },
      "León": { T: [3.1, 4.4, 6.6, 8.6, 12.1, 16.4, 19.7, 19.1, 16.7, 11.7, 6.8, 3.8], HR: [81, 75, 66, 63, 60, 57, 52, 53, 60, 72, 78, 81] },
      "Lleida": { T: [5.5, 7.8, 10.3, 13.0, 17.1, 21.2, 24.6, 24.0, 21.1, 15.7, 9.2, 5.8], HR: [81, 69, 61, 56, 55, 54, 47, 54, 62, 70, 77, 82] },
      "La Rioja": { T: [5.8, 7.3, 9.4, 11.5, 15.1, 19.0, 22.2, 21.8, 19.2, 14.4, 9.1, 6.3], HR: [75, 68, 62, 61, 59, 56, 55, 56, 61, 69, 73, 76] },
      "Lugo": { T: [5.8, 6.5, 7.8, 9.5, 11.7, 14.9, 17.2, 17.5, 16.0, 12.5, 8.6, 6.3], HR: [85, 81, 77, 77, 76, 76, 75, 75, 77, 82, 84, 85] },
      "Madrid": { T: [6.2, 7.4, 9.9, 12.2, 16.0, 20.7, 24.4, 23.9, 20.5, 14.7, 9.4, 6.4], HR: [71, 66, 56, 55, 51, 46, 37, 39, 50, 63, 70, 73] },
      "Málaga": { T: [12.2, 12.8, 14.0, 15.8, 18.7, 22.1, 24.7, 25.3, 23.1, 19.1, 15.1, 12.6], HR: [71, 70, 66, 65, 61, 59, 60, 63, 65, 70, 72, 72] },
      "Melilla": { T: [13.2, 13.8, 14.6, 15.9, 18.3, 21.5, 24.4, 25.3, 23.5, 20.0, 16.6, 14.1], HR: [72, 72, 71, 70, 69, 68, 67, 68, 72, 75, 74, 73] },
      "Murcia": { T: [10.6, 11.4, 12.6, 14.5, 17.4, 21.0, 23.9, 24.6, 22.5, 18.7, 14.3, 11.3], HR: [72, 69, 69, 68, 70, 71, 72, 74, 73, 73, 73, 73] },
      "Navarra": { T: [4.5, 6.5, 8.0, 9.9, 13.3, 17.3, 20.5, 20.3, 18.2, 13.7, 8.3, 5.7], HR: [80, 73, 68, 66, 66, 62, 58, 61, 61, 68, 76, 79] },
      "Ourense": { T: [7.4, 9.3, 10.7, 12.4, 15.3, 19.3, 21.9, 21.7, 19.8, 15.0, 10.6, 8.2], HR: [83, 75, 69, 70, 67, 64, 61, 62, 64, 73, 83, 84] },
      "Palencia": { T: [4.1, 5.6, 7.5, 9.5, 13.0, 17.2, 20.7, 20.3, 17.9, 13.0, 7.6, 4.4], HR: [84, 77, 71, 70, 67, 64, 58, 59, 63, 73, 80, 85] },
      "Las Palmas": { T: [17.5, 17.6, 18.3, 18.7, 19.9, 21.4, 23.2, 24.0, 23.9, 22.5, 20.4, 18.3], HR: [68, 67, 65, 66, 65, 67, 66, 67, 69, 70, 70, 68] },
      "Pontevedra": { T: [9.9, 10.7, 11.9, 13.6, 15.4, 18.8, 20.7, 20.5, 19.1, 16.1, 12.6, 10.3], HR: [74, 73, 69, 67, 68, 66, 65, 65, 69, 72, 73, 74] },
      "Salamanca": { T: [3.7, 5.3, 7.3, 9.6, 13.4, 17.8, 21.0, 20.3, 17.5, 12.3, 7.0, 4.1], HR: [85, 78, 69, 66, 62, 58, 50, 53, 62, 74, 82, 86] },
      "Santa Cruz de Tenerife": { T: [17.9, 18.0, 18.6, 19.1, 20.5, 22.2, 24.6, 25.1, 24.4, 22.4, 20.7, 18.8], HR: [66, 66, 62, 61, 60, 59, 56, 58, 63, 65, 67, 66] },
      "Segovia": { T: [4.1, 5.2, 7.1, 9.1, 13.1, 17.7, 21.6, 21.2, 17.9, 12.6, 7.3, 4.3], HR: [75, 71, 65, 65, 61, 55, 47, 49, 55, 65, 73, 78] },
      "Sevilla": { T: [10.7, 11.9, 14.0, 16.0, 19.6, 23.4, 26.8, 26.8, 24.4, 19.5, 14.3, 11.1], HR: [79, 75, 68, 65, 59, 56, 51, 52, 58, 67, 76, 79] },
      "Soria": { T: [2.9, 4.0, 5.8, 8.0, 11.8, 16.1, 19.9, 19.5, 16.5, 11.3, 6.1, 3.4], HR: [77, 73, 68, 67, 64, 60, 53, 54, 60, 70, 76, 78] },
      "Tarragona": { T: [10.0, 11.3, 13.1, 15.3, 18.4, 22.2, 25.3, 25.3, 22.7, 18.4, 13.5, 10.7], HR: [66, 63, 59, 59, 61, 60, 59, 62, 67, 70, 68, 66] },
      "Teruel": { T: [3.8, 4.8, 6.8, 9.3, 12.6, 17.5, 21.3, 20.6, 17.9, 12.1, 7.0, 4.5], HR: [72, 67, 60, 60, 60, 55, 50, 54, 59, 66, 71, 76] },
      "Toledo": { T: [6.1, 8.1, 10.9, 12.8, 16.8, 22.5, 26.5, 25.7, 22.6, 16.2, 10.7, 7.1], HR: [78, 72, 59, 62, 55, 47, 43, 45, 54, 68, 77, 81] },
      "Valencia": { T: [10.4, 11.4, 12.6, 14.5, 17.4, 21.1, 24.0, 24.5, 22.3, 18.3, 13.7, 10.9], HR: [63, 61, 60, 62, 64, 66, 67, 69, 68, 67, 66, 64] },
      "Valladolid": { T: [4.1, 6.1, 8.1, 9.9, 13.3, 18.0, 21.5, 21.3, 18.6, 12.9, 7.6, 4.8], HR: [82, 72, 62, 61, 57, 52, 44, 46, 53, 67, 77, 83] },
      "Vizcaya": { T: [8.9, 9.6, 10.4, 11.8, 14.6, 17.4, 19.7, 19.8, 18.8, 16.0, 11.8, 9.5], HR: [73, 70, 70, 72, 71, 72, 73, 75, 74, 74, 74, 74] },
      "Zamora": { T: [4.3, 6.3, 8.3, 10.5, 14.0, 18.5, 21.8, 21.3, 18.7, 13.4, 8.1, 4.9], HR: [83, 75, 65, 63, 59, 54, 47, 50, 58, 70, 79, 83] },
      "Zaragoza": { T: [6.2, 8.0, 10.3, 12.8, 16.8, 21.0, 24.3, 23.8, 20.7, 15.4, 9.7, 6.5], HR: [76, 69, 60, 59, 55, 52, 48, 54, 61, 70, 75, 77] },
    } as Record<string, { T: readonly number[]; HR: readonly number[] }>,
  },
);

export const ALTITUD_CAPITAL_ANEJO_G = tablaCTE(
  {
    db: "DB-HE",
    edicion: "2019 (RD 732/2019)",
    fecha: "2022-06-14",
    articulo: "Anejo G",
    tabla: "Tabla a-Anejo G (columna Altitud)",
    fuente: "codigotecnico.org · DB-HE p. 54 — altitud de referencia de la capital (criterio: el DA/2 no la fija)",
  },
  {
    altitud_m: {
      "Álava": 540, "Albacete": 686, "Alicante": 8, "Almería": 16, "Asturias": 232, "Ávila": 1131, "Badajoz": 186,
      "Baleares": 15, "Barcelona": 12, "Burgos": 929, "Cáceres": 459, "Cádiz": 14, "Cantabria": 11, "Castellón": 27,
      "Ceuta": 40, "Ciudad Real": 628, "Córdoba": 106, "A Coruña": 26, "Cuenca": 999, "Girona": 70, "Granada": 683,
      "Guadalajara": 685, "Guipúzcoa": 12, "Huelva": 30, "Huesca": 488, "Jaén": 568, "León": 838, "Lleida": 182,
      "La Rioja": 385, "Lugo": 454, "Madrid": 655, "Málaga": 11, "Melilla": 15, "Murcia": 39, "Navarra": 490,
      "Ourense": 139, "Palencia": 734, "Las Palmas": 13, "Pontevedra": 27, "Salamanca": 800,
      "Santa Cruz de Tenerife": 5, "Segovia": 1002, "Sevilla": 11, "Soria": 1063, "Tarragona": 69, "Teruel": 912,
      "Toledo": 629, "Valencia": 13, "Valladolid": 698, "Vizcaya": 6, "Zamora": 649, "Zaragoza": 199,
    } as Record<string, number>,
  },
);

// =============================================================================
// HELPERS DE LOOKUP — puros, deterministas. Todas las cifras salen de las tablas
// anteriores. El motor (Fase 2) consume estos helpers; no replica cifras.
// =============================================================================

/**
 * Ulim [W/m²K] de un elemento en una zona climática (Tabla 3.1.1.a-HE1). Todas las
 * filas de la tabla son numéricas (la medianería UMD comparte fila con UT). El tipo
 * de retorno admite `null` de forma DEFENSIVA (contrato histórico): si alguna vez se
 * añadiera una fila sin límite, el motor lo trataría como "no aplica".
 */
export function ulimDe(tipo: TipoElemento, zona: ZonaClimatica): number | null {
  // Las particiones interiores no están en la Tabla 3.1.1.a: su límite, con
  // `ulimParticionDe` (Tabla 3.2), lo pone el motor.
  if (tipo === "particion_interior") return null;
  return ULIM_TABLA_3_1_1_a.datos.ulim_W_m2K[tipo][zona];
}

/** Ulim de una partición interior [W/m²K] (Tabla 3.2-HE1). */
export function ulimParticionDe(
  relacion: RelacionParticion,
  orientacion: OrientacionParticion,
  zona: ZonaClimatica,
): number {
  const t = ULIM_PARTICIONES_TABLA_3_2.datos.ulim_W_m2K;
  if (relacion !== "mismo_uso") return t.distinto_uso_o_zona_comun[zona];
  return orientacion === "horizontal" ? t.mismo_uso_horizontal[zona] : t.mismo_uso_vertical[zona];
}

/**
 * R de una cámara de aire sin ventilar [m²K/W] por su espesor, interpolando en la
 * Tabla 2 del DA DB-HE/1. `flujo` horizontal ⇒ cámara vertical (muro).
 */
export function rCamaraDe(espesor_m: number, flujo: DireccionFlujo): number {
  const t = CAMARA_AIRE_SIN_VENTILAR_R.datos.porEspesor;
  const fila = flujo === "horizontal" ? t.vertical : t.horizontal;
  const xs = t.espesores_m;
  if (espesor_m <= xs[0]) return fila[0];
  for (let i = 1; i < xs.length; i++) {
    if (espesor_m <= xs[i]) {
      const f = (espesor_m - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return fila[i - 1] + f * (fila[i] - fila[i - 1]);
    }
  }
  return fila[fila.length - 1];
}

/**
 * Condiciones exteriores de enero de un emplazamiento (DA DB-HE/2 §2.1): las de la
 * capital de la provincia (Tabla C.1) y, si el emplazamiento está más alto, −1 °C
 * por cada 100 m con la misma humedad absoluta. `null` si la provincia no está.
 */
export function climaEneroDe(
  provincia: string,
  altitud_m: number,
): { temp_C: number; hr_pct: number; altitudCapital_m: number; corregido: boolean } | null {
  const c = CLIMA_TABLA_C1.datos.capitales[provincia];
  const hCap = ALTITUD_CAPITAL_ANEJO_G.datos.altitud_m[provincia];
  if (c === undefined || hCap === undefined) return null;
  const t0 = c.T[0];
  const hr0 = c.HR[0];
  if (!Number.isFinite(altitud_m) || altitud_m <= hCap) return { temp_C: t0, hr_pct: hr0, altitudCapital_m: hCap, corregido: false };
  const t = t0 - (altitud_m - hCap) / 100;
  const m = PSAT_MAGNUS.datos;
  const psat = (th: number) => {
    const r = th >= 0 ? m.positiva : m.negativa;
    return m.p0_Pa * Math.exp((r.a * th) / (r.b_C + th));
  };
  const pe = (hr0 / 100) * psat(t0);
  return { temp_C: t, hr_pct: Math.min(100, (100 * pe) / psat(t)), altitudCapital_m: hCap, corregido: true };
}

/** Ψ de la junta vidrio-marco [W/(m·K)] (DA DB-HE/1, Tabla 10). */
export function psiHuecoDe(
  marco: keyof typeof PSI_HUECO_TABLA_10.datos.psi_W_mK,
  vidrio: "simple" | "doble_o_triple" | "doble_be_o_triple_2be",
  separadorMejorado: boolean,
): number {
  return PSI_HUECO_TABLA_10.datos.psi_W_mK[marco][vidrio][separadorMejorado ? 1 : 0];
}

/**
 * Rsi/Rse [m²K/W] según la dirección del flujo (DA DB-HE/1). `interior = true`
 * usa la Tabla 6 (particiones interiores / contacto con espacios no habitables,
 * ambas caras interiores); por defecto usa la Tabla 1 (contacto con aire exterior).
 */
export function rsiRseDe(
  flujo: DireccionFlujo,
  interior = false,
): ResistenciasSuperficiales {
  const tabla = interior
    ? RESISTENCIAS_SUPERFICIALES.datos.interior
    : RESISTENCIAS_SUPERFICIALES.datos.exterior;
  return tabla[flujo];
}

/**
 * λ orientativo [W/(m·K)] de un material de referencia (CEC). ORIENTATIVO, NO
 * exigencia: sustituible por el λ del fabricante.
 */
export function lambdaDe(material: MaterialReferencia): number {
  return LAMBDA_REFERENCIA.datos.lambda_W_mK[material].lambda_W_mK;
}

/**
 * fRsi,min EXIGIDO (DA DB-HE/2, Tabla 1) por clase de higrometría y zona. Indexa
 * directamente las 6 columnas reales α / A / B / C / D / E (la zona α tiene su
 * propio valor, verificado; ya NO se mapea a A).
 */
export function fRsiMinDe(clase: ClaseHigrometria, zona: ZonaClimatica): number {
  return FRSI_MIN_TABLA_1.datos.fRsiMin[clase][zona];
}

/**
 * µ de referencia (adimensional) de un material para el método Glaser. ORIENTATIVO
 * (CEC). Para barreras de vapor (`sdDeclarado`) NO usar µ: usar el Sd del producto;
 * el helper devuelve el valor central de la fila (que para barrera es 0 → señal de
 * "usar Sd declarado").
 */
export function muDe(material: MaterialDifusion): number {
  return MU_REFERENCIA.datos.mu[material].mu;
}

/**
 * Fila ψ = Ψe REPRESENTATIVA de un encuentro (DA DB-HE/3 §5). Valor de
 * predimensionado, INFORMATIVO, NO exigencia ni cifra cerrada del CTE (el ψ real es
 * paramétrico por Umuro). No contamina el veredicto.
 */
export function psiDe(tipoEncuentro: TipoEncuentroPT): FilaPsi {
  return PSI_PUENTES_TERMICOS_DA_DB_HE_3.datos.psi[tipoEncuentro];
}
