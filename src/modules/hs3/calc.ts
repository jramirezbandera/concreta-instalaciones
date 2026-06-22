// =============================================================================
// DB-HS3 — Ventilación / calidad del aire interior. MOTOR DE CÁLCULO.
//
// Función PURA y DETERMINISTA (SPEC §4): `calcHS3(inputs): HS3Result`, sin
// React/DOM, sin Date.now/Math.random. Mismo input → mismo output (requisito de
// snapshots). Opera en IEEE-754 doble SIN redondear: el redondeo es solo de
// presentación (vive en la UI/ficha, no aquí).
//
// Todas las cifras normativas provienen de ./tablas.ts (envueltas en TablaCTE
// con procedencia). Nunca se hardcodean cifras dispersas en esta lógica.
//
// Unidades canónicas (src/lib/units/types.ts): caudales en l/s, áreas en cm².
// Los campos llevan SUFIJO DE UNIDAD en su nombre.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import { peor } from "../../lib/cte/grafo";
import type { ConductoSeccion, ZonaTermica } from "./tablas";
import {
  AREA_EFECTIVA_ABERTURAS,
  CAUDALES_LOCALES_HABITABLES,
  claseTiroDe,
  COCCION_MIN,
  NO_OCUPACION_MIN,
  SECCION_CONDUCTO_TABLA_4_2,
  type CategoriaDormitorios,
  type ClaseTiro,
} from "./tablas";

// -----------------------------------------------------------------------------
// MODELO DE ENTRADA
// -----------------------------------------------------------------------------

/** Tipos de estancia que el motor sabe clasificar (seco vs húmedo). */
export type TipoEstancia =
  | "dorm_principal"
  | "dormitorio"
  | "salon_comedor"
  | "cocina"
  | "bano"
  | "aseo";

/** Una estancia de la vivienda con su caudal de diseño propuesto. */
export interface Estancia {
  /** Identificador estable (lo consume el SVG / la ficha para el checker). */
  id: string;
  tipo: TipoEstancia;
  /**
   * Caudal de ventilación GENERAL que propone el proyectista [l/s]. En locales
   * húmedos es la extracción de ventilación general (verifica Tabla 2.1 y suma
   * a húmedos/qvt); en secos, la admisión.
   */
  caudalPropuesto_l_s: number;
  /** Marca una zona de cocción que exige extracción independiente de 50 l/s. */
  esCoccion?: boolean;
  /**
   * Caudal de extracción de COCCIÓN [l/s], INDEPENDIENTE de la ventilación
   * general (DB-HS3 ap. 2, pto 4). Solo aplica si `esCoccion`. NO se suma a
   * húmedos/qvt: la cocción se verifica aparte (≥ 50 l/s) y no cuenta como
   * ventilación general (evita falsos CUMPLE en el mínimo de húmedos).
   */
  caudalCoccion_l_s?: number;
}

export interface HS3Inputs {
  /** Nº de dormitorios de la vivienda → deriva la CategoriaDormitorios. */
  numDormitorios: number;
  /** Lista dinámica de estancias. */
  estancias: Estancia[];
  /** Zona térmica del edificio (Tabla 4.4), entrada directa W/X/Y/Z. */
  zonaTermica: ZonaTermica;
  /**
   * Nº de plantas existentes entre la más baja que vierte al conducto y la
   * última (ambas incluidas). Junto con la zona térmica fija la clase de tiro
   * (Tabla 4.3). Se satura en 8 ("8 o más").
   */
  numPlantasConducto: number;
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO
// -----------------------------------------------------------------------------

/** Tipo de abertura dimensionada para una estancia (admisión o extracción). */
export type TipoAbertura = "admision" | "extraccion";

/** Resultado por estancia: lo consume el checker del SVG y la ficha. */
export interface ResultadoEstancia {
  id: string;
  tipo: TipoEstancia;
  /** Local seco (admisión) o húmedo (extracción). */
  esHumedo: boolean;
  caudalPropuesto_l_s: number;
  /** Caudal mínimo exigido por la Tabla 2.1 [l/s]. */
  caudalRequerido_l_s: number;
  cumple: boolean;
  estado: Veredicto;
  /** Área efectiva de la abertura (Tabla 4.1) sobre el caudal REQUERIDO [cm²]. */
  areaAbertura_cm2: number;
  tipoAbertura: TipoAbertura;
  /** Para zonas de cocción: extracción independiente ≥ 50 l/s. */
  esCoccion: boolean;
  /** Caudal de cocción propuesto [l/s]; `null` si no es de cocción. */
  caudalCoccion_l_s: number | null;
  /** `null` si la estancia no es de cocción. */
  cumpleCoccion: boolean | null;
}

/** Sub-resultado del dimensionado del conducto de extracción (Tablas 4.2/4.3). */
export interface ResultadoConducto {
  /** Caudal total de extracción de la vivienda (suma de húmedos) [l/s]. */
  qvt_l_s: number;
  /** Clase de tiro (Tabla 4.3, verificada) según nº de plantas y zona. */
  claseTiro: ClaseTiro;
  /** Sección mínima exigida (Tabla 4.2) [cm²]. */
  seccionRequerida_cm2: number;
  /** Desglose nº × sección de la celda elegida de la Tabla 4.2. */
  conductos: ConductoSeccion[];
  /** `true`: clase de tiro obtenida de la Tabla 4.3 verificada celda a celda. */
  conductoVerificado: boolean;
  /**
   * Veredicto del conducto: `neutral`. Es un resultado de DIMENSIONADO (la
   * sección mínima exigida), no una verificación contra un valor propuesto por
   * el usuario, por lo que no aporta cumple/incumple al veredicto global.
   */
  estado: Veredicto;
  /** Nota descriptiva de la base de cálculo (clase de tiro · nº plantas · zona). */
  aviso: string;
}

export interface HS3Result {
  /** Categoría derivada de numDormitorios (índice de la Tabla 2.1). */
  categoriaDormitorios: CategoriaDormitorios;
  /** Verificación por estancia (admisión/extracción + aberturas). */
  porEstancia: ResultadoEstancia[];

  // Balance admisión / extracción ------------------------------------------
  /** Suma de caudales de admisión (locales secos) [l/s]. */
  totalAdmision_l_s: number;
  /** Suma de caudales de extracción (locales húmedos) [l/s]. */
  totalExtraccion_l_s: number;
  /** Caudal equilibrado = mayor de admisión/extracción [l/s]. */
  caudalEquilibrado_l_s: number;
  /** `true` si admisión y extracción ya están equilibradas (iguales). */
  balanceOk: boolean;
  estadoBalance: Veredicto;

  // Húmedos: verificación TOTAL de la vivienda ------------------------------
  humedosTotalRequerido_l_s: number;
  humedosTotalPropuesto_l_s: number;
  humedosTotalOk: boolean;
  estadoHumedosTotal: Veredicto;

  // Aberturas de paso (mínimo 70 cm²) ---------------------------------------
  /** Área de abertura de paso por estancia seca (máx(70, 8·qvp)) [cm²]. */
  areaPaso_cm2: number;

  // Conducto de extracción (informativo, bajo gate de la 4.3) ---------------
  conducto: ResultadoConducto;

  // No ocupación (informativo) ----------------------------------------------
  /** 1,5 l/s × nº de locales habitables [l/s]. */
  noOcupacion_l_s: number;

  /** Peor veredicto de las verificaciones REALES (el conducto NO cuenta). */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos (mensajes en español, sin Zod). */
  warnings: string[];
}

// -----------------------------------------------------------------------------
// DEFAULTS — vivienda ejemplo de 2 dormitorios (categoría "2").
//   dorm. principal 8 · 1 dormitorio 4 · salón 8 · cocina (general 16 +
//   cocción 50) · baño 8.
// Húmedos GENERAL = cocina 16 + baño 8 = 24 ≥ 24 (mín. vivienda) y cada uno ≥ 7.
// Cocción 50 ≥ 50 se verifica APARTE (no cuenta en húmedos/qvt). El conducto
// dimensiona con qvt = 24 (extracción general), no con el aire de cocción.
// -----------------------------------------------------------------------------

export const hs3Defaults: HS3Inputs = {
  numDormitorios: 2,
  estancias: [
    { id: "dorm-pral", tipo: "dorm_principal", caudalPropuesto_l_s: 8 },
    { id: "dorm-1", tipo: "dormitorio", caudalPropuesto_l_s: 4 },
    { id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 8 },
    // La cocina lleva DOS caudales: extracción general 16 l/s (local húmedo,
    // Tabla 2.1) y cocción 50 l/s independiente (verificación aparte).
    {
      id: "cocina",
      tipo: "cocina",
      caudalPropuesto_l_s: 16,
      esCoccion: true,
      caudalCoccion_l_s: 50,
    },
    { id: "bano", tipo: "bano", caudalPropuesto_l_s: 8 },
  ],
  zonaTermica: "X",
  numPlantasConducto: 1,
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/** Locales húmedos según la Tabla 2.1 (zonas de extracción de la vivienda). */
const HUMEDOS: ReadonlySet<TipoEstancia> = new Set<TipoEstancia>([
  "cocina",
  "bano",
  "aseo",
]);

const esHumedo = (tipo: TipoEstancia): boolean => HUMEDOS.has(tipo);

/** numDormitorios → categoría de la Tabla 2.1. */
export function categoriaDeDormitorios(numDormitorios: number): CategoriaDormitorios {
  if (numDormitorios <= 1) return "0-1";
  if (numDormitorios === 2) return "2";
  return "3+";
}

/**
 * Caudal REQUERIDO de un local SECO según su tipo y la categoría (Tabla 2.1).
 * Devuelve `null` cuando la fila no aplica (p.ej. resto de dormitorios en 0-1).
 */
function caudalSecoRequerido(
  tipo: TipoEstancia,
  cat: CategoriaDormitorios,
): number | null {
  const t = CAUDALES_LOCALES_HABITABLES.datos;
  switch (tipo) {
    case "dorm_principal":
      return t.dormitorioPrincipal[cat];
    case "dormitorio":
      return t.restoDormitorios[cat];
    case "salon_comedor":
      return t.salasEstarComedores[cat];
    default:
      return null; // los húmedos no usan esta tabla por tipo de estancia seca
  }
}

// -----------------------------------------------------------------------------
// MOTOR
// -----------------------------------------------------------------------------

export function calcHS3(inp: HS3Inputs): HS3Result {
  const warnings: string[] = [];
  const cat = categoriaDeDormitorios(inp.numDormitorios);
  const tabla21 = CAUDALES_LOCALES_HABITABLES.datos;
  const t41 = AREA_EFECTIVA_ABERTURAS.datos;

  if (!Number.isFinite(inp.numDormitorios) || inp.numDormitorios < 0) {
    warnings.push("Número de dormitorios inválido (negativo o no finito): revisa la entrada.");
  }

  const humedosPorLocal_l_s = tabla21.humedosPorLocal[cat] ?? 0;

  const porEstancia: ResultadoEstancia[] = [];

  let totalAdmision_l_s = 0; // suma de secos
  let totalExtraccion_l_s = 0; // suma de húmedos
  let humedosTotalPropuesto_l_s = 0;

  let veredictoEstancias: Veredicto = "neutral";
  let veredictoHumedosLocal: Veredicto = "neutral";
  let veredictoCoccion: Veredicto = "neutral";

  for (const e of inp.estancias) {
    // Guard de saneamiento: un caudal no finito (NaN/Infinity, p.ej. inyectado
    // por una URL corrupta) se trata como 0 con aviso, para no propagar NaN a
    // las sumas, áreas y al SVG/ficha. Los guards de rango usan ya el saneado.
    let q = e.caudalPropuesto_l_s;
    if (!Number.isFinite(q)) {
      warnings.push(`Caudal no válido en "${e.id}": se usa 0.`);
      q = 0;
    } else if (q < 0) {
      warnings.push(`Caudal negativo en "${e.id}" (${q} l/s): revisa la entrada.`);
    } else if (q > 500) {
      warnings.push(`Caudal inusualmente alto en "${e.id}" (${q} l/s): revisa la entrada.`);
    }

    const humedo = esHumedo(e.tipo);

    // --- caudal requerido ---------------------------------------------------
    let caudalRequerido_l_s: number;
    if (humedo) {
      // Verificación POR LOCAL húmedo (Tabla 2.1: humedosPorLocal).
      caudalRequerido_l_s = humedosPorLocal_l_s;
    } else {
      const req = caudalSecoRequerido(e.tipo, cat);
      if (req === null) {
        // Fila no aplicable (p.ej. resto de dormitorios en vivienda 0-1):
        // no impone mínimo → caudal 0 con aviso informativo.
        caudalRequerido_l_s = 0;
        warnings.push(
          `La estancia "${e.id}" (${e.tipo}) no aplica en una vivienda de categoría "${cat}" (Tabla 2.1): sin mínimo exigible.`,
        );
      } else {
        caudalRequerido_l_s = req;
      }
    }

    const cumple = q >= caudalRequerido_l_s;
    const estado: Veredicto = cumple ? "ok" : "fail";

    // --- aberturas (Tabla 4.1) sobre el caudal REQUERIDO --------------------
    // DECISIÓN DE DISEÑO: se dimensiona con el caudal REQUERIDO (mínimo
    // normativo), no con el propuesto, porque el área efectiva de la abertura
    // se calcula a partir de "qv, el caudal de ventilación mínimo exigido del
    // local" (literal Tabla 4.1 / ap. 4). El propuesto solo se usa para el
    // veredicto de cumplimiento, no para dimensionar geometría.
    const tipoAbertura: TipoAbertura = humedo ? "extraccion" : "admision";
    const coef = humedo ? t41.extraccion_coef : t41.admision_coef;
    const areaAbertura_cm2 = coef * caudalRequerido_l_s;

    // --- cocción (extracción independiente ≥ 50 l/s) ------------------------
    // Usa su PROPIO caudal (caudalCoccion_l_s), INDEPENDIENTE del general: el
    // aire de cocción no cuenta como ventilación general (no se suma a húmedos
    // ni a qvt). Esto evita falsos CUMPLE en el mínimo de húmedos de vivienda.
    let cumpleCoccion: boolean | null = null;
    let caudalCoccion_l_s: number | null = null;
    if (e.esCoccion) {
      let qc = e.caudalCoccion_l_s ?? 0;
      if (!Number.isFinite(qc)) {
        warnings.push(`Caudal de cocción no válido en "${e.id}": se usa 0.`);
        qc = 0;
      }
      caudalCoccion_l_s = qc;
      cumpleCoccion = qc >= COCCION_MIN.datos.caudalMin_l_s;
      veredictoCoccion = peor(veredictoCoccion, cumpleCoccion ? "ok" : "fail");
      if (!cumpleCoccion) {
        warnings.push(
          `La zona de cocción "${e.id}" no alcanza la extracción independiente mínima de ${COCCION_MIN.datos.caudalMin_l_s} l/s.`,
        );
      }
    }

    // --- agregados (solo ventilación GENERAL; la cocción va aparte) ----------
    if (humedo) {
      totalExtraccion_l_s += q;
      humedosTotalPropuesto_l_s += q;
      veredictoHumedosLocal = peor(veredictoHumedosLocal, estado);
    } else {
      totalAdmision_l_s += q;
      veredictoEstancias = peor(veredictoEstancias, estado);
    }

    porEstancia.push({
      id: e.id,
      tipo: e.tipo,
      esHumedo: humedo,
      caudalPropuesto_l_s: q,
      caudalRequerido_l_s,
      cumple,
      estado,
      areaAbertura_cm2,
      tipoAbertura,
      esCoccion: !!e.esCoccion,
      caudalCoccion_l_s,
      cumpleCoccion,
    });
  }

  // --- Húmedos: verificación TOTAL de la vivienda (Tabla 2.1) --------------
  const humedosTotalRequerido_l_s = tabla21.humedosTotalVivienda[cat] ?? 0;
  const humedosTotalOk = humedosTotalPropuesto_l_s >= humedosTotalRequerido_l_s;
  const estadoHumedosTotal: Veredicto = humedosTotalOk ? "ok" : "fail";
  if (!humedosTotalOk) {
    warnings.push(
      `La extracción total de húmedos (${humedosTotalPropuesto_l_s} l/s) no alcanza el mínimo de vivienda (${humedosTotalRequerido_l_s} l/s) para categoría "${cat}".`,
    );
  }

  // --- Balance admisión / extracción --------------------------------------
  // Equilibrado = igualar al MAYOR de los dos (anejo de términos del DB).
  const caudalEquilibrado_l_s = Math.max(totalAdmision_l_s, totalExtraccion_l_s);
  // Tolerancia para no marcar desequilibrio espúrio por epsilon de IEEE-754 con
  // caudales decimales (coherente con el toBeCloseTo del resto de invariantes).
  const balanceOk = Math.abs(totalAdmision_l_s - totalExtraccion_l_s) < 1e-9;
  // El desequilibrio NO es un incumplimiento (se corrige equilibrando):
  // se reporta como `warn` informativo, no como `fail`.
  const estadoBalance: Veredicto = balanceOk ? "ok" : "warn";
  if (!balanceOk) {
    warnings.push(
      `Admisión (${totalAdmision_l_s} l/s) y extracción (${totalExtraccion_l_s} l/s) no están equilibradas; se equilibran al mayor (${caudalEquilibrado_l_s} l/s).`,
    );
  }

  // --- Aberturas de paso (Tabla 4.1: máx(70, 8·qvp)) -----------------------
  // El caudal de paso qvp se toma del mayor de admisión/extracción equilibrado
  // (caudal que atraviesa las puertas entre zona seca y húmeda).
  const areaPaso_cm2 = Math.max(
    t41.pasoMin_cm2,
    t41.paso_coef * caudalEquilibrado_l_s,
  );

  // --- Conducto de extracción (SIMPLIFICADO, Tablas 4.2/4.3 verificadas) ---
  const conducto = calcularConducto(
    totalExtraccion_l_s,
    inp.numPlantasConducto,
    inp.zonaTermica,
    warnings,
  );

  // --- No ocupación (informativo) -----------------------------------------
  const numLocalesHabitables = inp.estancias.length;
  const noOcupacion_l_s =
    NO_OCUPACION_MIN.datos.caudalMin_l_s_por_local * numLocalesHabitables;

  // --- Veredicto global: peor de las verificaciones REALES -----------------
  // El conducto NO entra (es un resultado de dimensionado, `neutral`).
  let veredictoGlobal: Veredicto = "ok";
  veredictoGlobal = peor(veredictoGlobal, veredictoEstancias);
  veredictoGlobal = peor(veredictoGlobal, veredictoHumedosLocal);
  veredictoGlobal = peor(veredictoGlobal, estadoHumedosTotal);
  veredictoGlobal = peor(veredictoGlobal, veredictoCoccion);
  veredictoGlobal = peor(veredictoGlobal, estadoBalance);

  return {
    categoriaDormitorios: cat,
    porEstancia,
    totalAdmision_l_s,
    totalExtraccion_l_s,
    caudalEquilibrado_l_s,
    balanceOk,
    estadoBalance,
    humedosTotalRequerido_l_s,
    humedosTotalPropuesto_l_s,
    humedosTotalOk,
    estadoHumedosTotal,
    areaPaso_cm2,
    conducto,
    noOcupacion_l_s,
    veredictoGlobal,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Conducto de extracción — sub-cálculo SIMPLIFICADO (Tablas 4.2/4.3 verificadas).
//
// Encadenamiento del DB (ap. 4.2.1): (nº de plantas entre la más baja que vierte
// al conducto y la última + zona térmica) → clase de tiro (Tabla 4.3) → sección
// mínima del conducto por tramo de caudal qvt (Tabla 4.2). Es un resultado de
// DIMENSIONADO (sección mínima exigida), por eso su veredicto es `neutral` y no
// entra en el veredicto global (no hay un valor propuesto por el usuario contra
// el que verificar cumple/incumple).
// -----------------------------------------------------------------------------
function calcularConducto(
  qvt_l_s: number,
  numPlantasConducto: number,
  zonaTermica: ZonaTermica,
  warnings: string[],
): ResultadoConducto {
  // Clase de tiro de la Tabla 4.3 (verificada) según nº de plantas y zona.
  const claseTiro: ClaseTiro = claseTiroDe(numPlantasConducto, zonaTermica);

  if (numPlantasConducto < 1) {
    warnings.push(
      `Nº de plantas del conducto (${numPlantasConducto}) inválido: se usa el mínimo (1 planta) para la clase de tiro.`,
    );
  }

  // Sección requerida: primer tramo de la Tabla 4.2 cuyo qvtMax ≥ qvt
  // (o el último, sin tope, con aviso de fuera de rango si qvt supera 1000).
  const tramos = SECCION_CONDUCTO_TABLA_4_2.datos.tramos;
  let tramoElegido = tramos[tramos.length - 1];
  for (const tr of tramos) {
    if (tr.qvtMax_l_s !== null && qvt_l_s <= tr.qvtMax_l_s) {
      tramoElegido = tr;
      break;
    }
  }
  const ultimoTope = tramos[tramos.length - 1].qvtMax_l_s;
  if (ultimoTope !== null && qvt_l_s > ultimoTope) {
    warnings.push(
      `El caudal total de extracción (${qvt_l_s} l/s) supera el último tramo de la Tabla 4.2 (${ultimoTope} l/s): sección extrapolada del último tramo.`,
    );
  }

  const celda = tramoElegido.secciones[claseTiro];

  const nPlantasSat = Math.min(Math.max(Math.trunc(numPlantasConducto), 1), 8);
  const aviso =
    `Sección mínima exigida (Tabla 4.2) para clase de tiro ${claseTiro} ` +
    `(${nPlantasSat === 8 ? "≥8" : nPlantasSat} planta${nPlantasSat === 1 ? "" : "s"}, zona ${zonaTermica}).`;

  return {
    qvt_l_s,
    claseTiro,
    seccionRequerida_cm2: celda.area_cm2,
    conductos: celda.conductos.map((cc) => ({ ...cc })),
    conductoVerificado: true,
    estado: "neutral",
    aviso,
  };
}
