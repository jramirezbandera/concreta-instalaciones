// =============================================================================
// DB-HS6 — «Protección frente a la exposición al radón». Tablas y valores
// normativos como DATOS versionados con procedencia (SPEC §4/§11, trazabilidad
// innegociable). Nunca hardcodear cifras sueltas en la lógica: cada cifra va
// envuelta en `tablaCTE()` con su `ProcedenciaCTE`, que alimenta la cita legal de
// la ficha. El CÁLCULO vive en calc.ts y proteccion.ts; aquí, SOLO datos y
// helpers de lookup puros.
//
// EDICIÓN: la Sección HS 6 la introduce el RD 732/2019 (BOE 27-12-2019); el texto
// vigente es el DB-HS consolidado de 14-06-2022. Que el RD 450/2022 no la tocara
// está pendiente de confirmar en la versión con marcas (DcmHS.pdf).
//
// VERIFICACIÓN (research/verificacion-hs6-v4.md, feature-15): el literal se leyó
// en una transcripción del consolidado de 2022; el cotejo con el PDF oficial
// queda pendiente (falta poppler en la máquina). Lo que cambió respecto a la v1:
//   - citas «ap.» y al punto: exigencia por zona, ap. 3 pto 1 a) y b); barrera,
//     ap. 3.1; espacio de contención, ap. 3.2; despresurización, ap. 3.3;
//   - la lámina tipo exige un coeficiente de difusión ESTRICTAMENTE menor que
//     1e-11 m²/s;
//   - la altura de 5 cm de la cámara solo vale para la que se añade a un edificio
//     EXISTENTE (ap. 3.2 pto 6), no para obra nueva;
//   - las 0,1 ren/h son el caudal por defecto del ap. 3.1.2 (cálculo de la
//     barrera), no una exigencia de la cámara: se retiran;
//   - un local no habitable (el garaje) puede ser el espacio de contención y su
//     ventilación de HS 3 o del RITE se considera suficiente (ap. 3.2 ptos 1 y 5);
//   - el geotextil de la despresurización es un ejemplo, no un requisito.
//
// DIFERIDO: el cálculo de la barrera por difusión (E < Elim, ap. 3.1.2), hasta
// cotejar sus constantes con el PDF.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

// -----------------------------------------------------------------------------
// TIPOS DE DOMINIO BASE
// -----------------------------------------------------------------------------

/**
 * Zona de radón del municipio (Apéndice B): un DATO que consulta el proyectista.
 *   - `"I"`: barrera de protección o, alternativamente, cámara de aire ventilada;
 *   - `"II"`: barrera de protección junto con un sistema adicional (espacio de
 *     contención ventilado o despresurización del terreno);
 *   - `"sin_exigencia"`: municipio no incluido en el Apéndice B; la HS 6 no se
 *     aplica (ap. 1 pto 1).
 */
export type ZonaRadon = "I" | "II" | "sin_exigencia";

/** Soluciones de protección (ap. 3.1, 3.2 y 3.3). */
export type TipoSolucionHS6 = "barrera" | "espacio_contencion" | "despresurizacion";

/**
 * Ventilación de una cámara de contención:
 *   - `natural`: aberturas de al menos 10 cm² por metro (ap. 3.2 ptos 3 y 4);
 *   - `mecanica`: la HS 6 no fija caudal; aberturas según la cámara, admisión lejos
 *     de la extracción y bocas de expulsión según DB-HS 3 ap. 3.2.1 (ap. 3.2 pto 8).
 */
export type TipoVentilacionContencion = "natural" | "mecanica";

/**
 * Vía de justificación de la barrera:
 *   - `lamina_tipo`: lámina de espesor ≥ 2 mm y coeficiente de difusión del radón
 *     < 1e-11 m²/s (estricto), sin cálculo (ap. 3.1.1);
 *   - `calculo`: E < Elim (ap. 3.1.2). DIFERIDA hasta cotejar sus constantes.
 */
export type ViaJustificacionBarrera = "lamina_tipo" | "calculo";

/** Procedencia base de la HS 6. */
const PROC_HS6 = {
  db: "DB-HS6",
  edicion: "RD 732/2019 · consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente:
    "codigotecnico.org · DBHS.pdf, Sección HS 6 (literal leído en transcripción; cotejo PDF pendiente) · BOE-A-2019-18528",
} as const;

// =============================================================================
// Nivel de referencia (ap. 2 pto 1)
// =============================================================================

export const NIVEL_REFERENCIA_RADON = tablaCTE(
  { ...PROC_HS6, articulo: "ap. 2 pto 1" },
  {
    /**
     * Promedio anual de concentración de radón en los locales habitables [Bq/m³]:
     * el nivel de referencia es el valor «por encima del cual» no se admite
     * (Apéndice A).
     */
    concentracionMax_Bq_m3: 300,
  } as const,
);

// =============================================================================
// Ámbito (ap. 1 ptos 1 y 2; Apéndice A)
// =============================================================================

export const AMBITO_APLICACION = tablaCTE(
  { ...PROC_HS6, articulo: "ap. 1 ptos 1 y 2; Apéndice A" },
  {
    descripcion:
      "Edificios en municipios del Apéndice B: obra nueva e intervenciones (ap. 1 pto 1). No se aplica a " +
      "locales no habitables —garajes, trasteros y cuartos técnicos— (pto 2 a; Apéndice A) ni a locales " +
      "habitables separados de forma efectiva del terreno por espacios abiertos intermedios con ventilación " +
      "análoga a la del ambiente exterior (pto 2 b). Un local no habitable cerrado interpuesto no exime: puede " +
      "ser el espacio de contención (ap. 3.2 ptos 1 y 5).",
    noHabitables: ["garajes", "trasteros", "cuartos técnicos"] as const,
    exencionEspacioAbierto: true,
    noHabitableCerradoExime: false,
  } as const,
);

// =============================================================================
// Qué exige cada zona (ap. 3 pto 1 a) y b))
// =============================================================================

export interface RequisitoZona {
  /** `true` ⇒ la barrera de protección es OBLIGATORIA (zona II). */
  readonly barreraObligatoria: boolean;
  /** Nº mínimo de medidas, la barrera incluida: zona I → 1; zona II → 2. */
  readonly nMedidasMin: number;
  /**
   * Zona I: la única medida puede ser la barrera o el espacio de contención.
   * Zona II: la adicional, el espacio de contención o la despresurización.
   */
  readonly medidasAdmitidas: readonly TipoSolucionHS6[];
  readonly descripcion: string;
}

export const REQUISITOS_POR_ZONA = tablaCTE(
  { ...PROC_HS6, articulo: "ap. 3 pto 1 a) y b)" },
  {
    requisito: {
      I: {
        barreraObligatoria: false,
        nMedidasMin: 1,
        medidasAdmitidas: ["barrera", "espacio_contencion"],
        descripcion:
          "Zona I: barrera de protección (ap. 3.1) o, alternativamente, cámara de aire ventilada según el ap. 3.2 " +
          "y separada de los locales habitables por un cerramiento sin grietas, fisuras ni discontinuidades (ap. 3 pto 1 a).",
      },
      II: {
        barreraObligatoria: true,
        nMedidasMin: 2,
        medidasAdmitidas: ["espacio_contencion", "despresurizacion"],
        descripcion:
          "Zona II: barrera de protección (ap. 3.1) junto con un sistema adicional: espacio de contención " +
          "ventilado (ap. 3.2) o despresurización del terreno (ap. 3.3) (ap. 3 pto 1 b).",
      },
      sin_exigencia: {
        barreraObligatoria: false,
        nMedidasMin: 0,
        medidasAdmitidas: [],
        descripcion: "Municipio no incluido en el Apéndice B: la Sección HS 6 no se aplica (ap. 1 pto 1).",
      },
    } satisfies Record<ZonaRadon, RequisitoZona>,
    /** Encabezado del ap. 3 pto 1: se admiten otras soluciones de protección análoga o superior. */
    alternativaEquivalente: "u otras que proporcionen un nivel de protección análogo o superior",
    /** En zona I, la alternativa literal es una «cámara de aire»; un local no habitable entra por la vía equivalente. */
    zonaICamaraLiteral: true,
  },
);

// =============================================================================
// Soluciones (ap. 3.1, 3.2 y 3.3; ap. 5.1)
// =============================================================================

export const PARAMETROS_SOLUCIONES = tablaCTE(
  { ...PROC_HS6, articulo: "ap. 3.1.1 ptos 2 y 3; ap. 3.2 ptos 1-5 y 8; ap. 3.3; ap. 5.1" },
  {
    /** Barrera de protección: lámina tipo, sin cálculo (ap. 3.1.1). */
    barrera: {
      /** Coeficiente de difusión del radón: estrictamente MENOR que este valor [m²/s]. */
      coefDifusionLimite_m2_s: 1e-11,
      comparacionCoef: "<" as const,
      /** Espesor mínimo de la lámina [mm] (≥). */
      espesorMin_mm: 2,
      /** Solo para barreras de tipo lámina. */
      soloTipoLamina: true,
      /** Características de la barrera (ap. 3.1.1 pto 3 a–e). */
      caracteristicas: [
        "continuidad: juntas y encuentros sellados",
        "encuentros con los elementos que la interrumpan, sellados",
        "puertas que la interrumpan: estancas y con cierre automático",
        "sin fisuras que permitan el paso del radón por convección",
        "durabilidad adecuada a la vida útil del edificio",
      ] as const,
      /** Se prolonga 20 cm por encima del terreno exterior (ap. 5.1.1 pto 6). */
      prolongacionSobreTerrenoExterior_cm: 20,
    },
    /** Espacio de contención ventilado (ap. 3.2). */
    espacioContencion: {
      /** Cámara o local no habitable (ap. 3.2 pto 1). */
      tipos: ["camara_horizontal", "camara_vertical", "local_no_habitable"] as const,
      /** Aberturas de al menos 10 cm² por metro de perímetro (horizontal) o lineal (vertical). */
      areaAberturasMin_cm2_ml: 10,
      /** Con aberturas en todas las fachadas, salvo que la cámara tenga menos de 100 m². */
      superficieUnaFachada_m2: 100,
      /** Ningún punto de la cámara a más de 10 m de una abertura. */
      distanciaMaxAAbertura_m: 10,
      /** Local no habitable: su ventilación de DB-HS 3 o del RITE se considera suficiente (pto 5). */
      ventilacionLocalNoHabitable: "DB-HS 3 (Tabla 2.2) o RITE, según corresponda — se considera suficiente",
      /** Ventilación mecánica: bocas de expulsión según DB-HS 3 ap. 3.2.1 (pto 8). */
      remisionBocasExpulsion: "DB-HS 3 ap. 3.2.1 (en la cámara, la cubierta es opcional)",
    },
    /** Despresurización del terreno (ap. 3.3 y 5.1.4). */
    despresurizacion: {
      descripcion:
        "Red de elementos de captación (arquetas o tubos perforados) en una capa de relleno granular bajo el " +
        "edificio, conectada a un conducto de extracción y a un sistema de extracción mecánica (ap. 3.3 pto 1). " +
        "Bocas de expulsión según DB-HS 3 ap. 3.2.1 (pto 2).",
      elementosObligatorios: ["captacion_en_relleno", "conducto_extraccion", "extraccion_mecanica"] as const,
      /** El geotextil es un ejemplo de protección del relleno (ap. 5.1.4), no un requisito. */
      geotextilObligatorio: false,
    },
  },
);

// =============================================================================
// HELPERS DE LOOKUP
// =============================================================================

export function nivelReferenciaRadon_Bq_m3(): number {
  return NIVEL_REFERENCIA_RADON.datos.concentracionMax_Bq_m3;
}

export function requisitoDeZona(zona: ZonaRadon): RequisitoZona {
  return REQUISITOS_POR_ZONA.datos.requisito[zona];
}

/** Parámetros de la barrera lámina tipo (ap. 3.1.1). */
export function parametrosBarrera(): { coefDifusionLimite_m2_s: number; espesorMin_mm: number } {
  const b = PARAMETROS_SOLUCIONES.datos.barrera;
  return { coefDifusionLimite_m2_s: b.coefDifusionLimite_m2_s, espesorMin_mm: b.espesorMin_mm };
}

/** Parámetros del espacio de contención ventilado (ap. 3.2). */
export function parametrosEspacioContencion(): {
  areaAberturasMin_cm2_ml: number;
  distanciaMaxAAbertura_m: number;
  remisionBocasExpulsion: string;
  ventilacionLocalNoHabitable: string;
} {
  const e = PARAMETROS_SOLUCIONES.datos.espacioContencion;
  return {
    areaAberturasMin_cm2_ml: e.areaAberturasMin_cm2_ml,
    distanciaMaxAAbertura_m: e.distanciaMaxAAbertura_m,
    remisionBocasExpulsion: e.remisionBocasExpulsion,
    ventilacionLocalNoHabitable: e.ventilacionLocalNoHabitable,
  };
}
