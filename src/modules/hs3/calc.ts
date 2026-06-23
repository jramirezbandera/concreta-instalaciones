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
import { acumularAguasAbajo, peor, validarArbol, type NodoArbol } from "../../lib/cte/grafo";
import type { CeldaSeccion4_2, ConductoSeccion, ZonaTermica } from "./tablas";
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

/** Modo de dimensionado del conducto de extracción. */
export type ModoConducto = "rapido" | "avanzado";

/**
 * Una planta que vierte en un conducto colectivo (modo avanzado). `nivel` es un
 * índice de planta ENTERO; el span del colectivo (Tabla 4.3) = max−min+1 sobre
 * los `nivel` de sus plantas. Agrupa las estancias húmedas que descargan en ella.
 */
export interface PlantaColectivo {
  /**
   * Índice de PLANTA FÍSICA del edificio (entero; p.ej. 0 = baja, 1, 2…), NO un
   * ordinal de las plantas conectadas. El span de la Tabla 4.3 es max−min+1
   * (DB-HS3 ap. 4.2.1: "número de plantas entre la más baja que vierte y la
   * última, AMBAS INCLUIDAS"): las plantas intermedias que NO vierten también
   * cuentan para la clase de tiro, así que sus niveles deben corresponder a
   * plantas físicas reales (no reindexar saltando las que no vierten).
   */
  nivel: number;
  /**
   * Ids de estancias HÚMEDAS (de `estancias`) cuya extracción GENERAL vierte en
   * esta planta. El qvt propio de la planta = Σ de sus extracciones generales
   * (la cocción NO cuenta, igual que en el modo rápido).
   */
  estanciasIds: string[];
}

/**
 * Un conducto colectivo vertical (modo avanzado): pila de plantas que vierten
 * hacia una boca de cubierta. El árbol de tramos se DERIVA de esta estructura
 * (estados ilegales —huérfano, ciclo, doble conteo— son irrepresentables).
 */
export interface Colectivo {
  /** Identificador estable (lo consumen el SVG y la ficha). */
  id: string;
  /** Plantas que vierten en este colectivo (el motor las ordena por `nivel`). */
  plantas: PlantaColectivo[];
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
   * (Tabla 4.3). Se satura en 8 ("8 o más"). Solo modo rápido.
   */
  numPlantasConducto: number;
  /**
   * Modo de dimensionado del conducto. Por defecto `"rapido"` (tubo agregado,
   * comportamiento histórico). `"avanzado"` usa `redColectivos`. El modo lo fija
   * ESTE campo, NUNCA la presencia de `redColectivos`: así un estado persistido
   * malformado no puede conmutar de modo por sorpresa.
   */
  modoConducto?: ModoConducto;
  /** Red de conductos colectivos (modo avanzado). Ignorada en modo rápido. */
  redColectivos?: Colectivo[];
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

  // Red colectiva (modo avanzado) — AUSENTE en modo rápido (no altera sus
  // snapshots). Dimensionado por tramo + estado de validez de la red.
  red?: ResultadoRed;

  // No ocupación (informativo) ----------------------------------------------
  /** 1,5 l/s × nº de locales habitables [l/s]. */
  noOcupacion_l_s: number;

  /** Peor veredicto de las verificaciones REALES (el conducto NO cuenta). */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos (mensajes en español, sin Zod). */
  warnings: string[];
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO — MODO RED (avanzado)
// -----------------------------------------------------------------------------

/** Dimensionado de un tramo del árbol derivado de un colectivo (modo red). */
export interface ResultadoTramoRed {
  /** Id del nodo en el árbol derivado (`<colectivoId>:boca` o `:<nivel>`). */
  id: string;
  parentId: string | null;
  childrenIds: string[];
  /** Colectivo al que pertenece el tramo. */
  colectivoId: string;
  /** Nivel de planta; `null` en el nodo boca/raíz del colectivo. */
  nivel: number | null;
  /** Caudal acumulado aguas arriba hacia la boca [l/s]. */
  qvtAcum_l_s: number;
  /** Clase de tiro del colectivo (constante a lo largo del tubo). */
  claseTiro: ClaseTiro;
  /** Sección mínima exigida (Tabla 4.2) para este tramo [cm²]. */
  seccionRequerida_cm2: number;
  /** Desglose nº × sección de la celda elegida. */
  conductos: ConductoSeccion[];
  /** Tramo dimensionante de SU colectivo (mayor sección exigida). */
  esDimensionante: boolean;
  /** Tramo que MANDA en toda la red (◆): el dimensionante más exigido. */
  esManda: boolean;
  /** Veredicto del tramo: `neutral` (es dimensionado, no cumple/incumple). */
  estado: Veredicto;
}

/** Resultado por colectivo (modo red). */
export interface ResultadoColectivo {
  id: string;
  /** Span de plantas servidas = max(nivel) − min(nivel) + 1 (la boca no cuenta). */
  plantasServidas: number;
  /** Clase de tiro del colectivo (Tabla 4.3, por span + zona). */
  claseTiro: ClaseTiro;
  /** Caudal total que evacúa el colectivo (qvt acumulado en la boca) [l/s]. */
  qvtBoca_l_s: number;
  /** Tramos del colectivo, en orden topológico (hojas → boca). */
  tramos: ResultadoTramoRed[];
}

/**
 * Validez de la red colectiva. Los `bloqueos` son ERRORES DUROS (red vacía,
 * colectivo sin estancias, nivel no entero…) que impiden exportar la ficha; van
 * en su PROPIO canal, no en `warnings`, y NO degradan `veredictoGlobal`
 * (normativo). Coherente con el patrón `arbolValido` de HS4/HS5.
 */
export interface EstadoRed {
  /** `true` si la red es dimensionable (sin bloqueos). */
  valida: boolean;
  /** Errores duros que bloquean la exportación de la ficha. */
  bloqueos: string[];
}

/** Sub-resultado del modo red (presente solo en modo avanzado). */
export interface ResultadoRed {
  colectivos: ResultadoColectivo[];
  estadoRed: EstadoRed;
  /** qvt total de la red = Σ extracción general de los húmedos asignados [l/s]. */
  qvtRedTotal_l_s: number;
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

/** `true` si la estancia es un local húmedo (extracción): cocina, baño o aseo. */
export const esHumedo = (tipo: TipoEstancia): boolean => HUMEDOS.has(tipo);

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
  // Se calcula siempre (modo rápido). El modo avanzado lo conserva pero la UI
  // muestra la red; no degrada el veredicto (es dimensionado).
  const conducto = calcularConducto(
    totalExtraccion_l_s,
    inp.numPlantasConducto,
    inp.zonaTermica,
    warnings,
  );

  // --- Modo red (avanzado): dimensionado de la red colectiva multiplanta -----
  let red: ResultadoRed | undefined;
  if (inp.modoConducto === "avanzado") {
    red = calcularRed(inp.redColectivos ?? [], inp.estancias, inp.zonaTermica);
    // Reconciliación: la red debe evacuar TODA la extracción general húmeda.
    const dif = totalExtraccion_l_s - red.qvtRedTotal_l_s;
    if (red.estadoRed.valida && Math.abs(dif) > 1e-9) {
      warnings.push(
        dif > 0
          ? `La red colectiva evacúa ${red.qvtRedTotal_l_s} l/s pero el total de extracción de húmedos es ${totalExtraccion_l_s} l/s: hay húmedos sin asignar a ningún colectivo.`
          : `La red colectiva evacúa ${red.qvtRedTotal_l_s} l/s, más que el total verificado de húmedos (${totalExtraccion_l_s} l/s): revisa las asignaciones.`,
      );
    }
    // Aviso de plantas salteadas: la clase de tiro cuenta el span "ambas
    // incluidas" (DB-HS3 ap. 4.2.1), así que un hueco de niveles infla la clase.
    // Informativo (es legal y conservador): que el proyectista confirme que las
    // plantas intermedias existen físicamente (premisa de `PlantaColectivo.nivel`).
    if (red.estadoRed.valida) {
      for (const col of inp.redColectivos ?? []) {
        const niveles = col.plantas.map((p) => p.nivel).filter((n) => Number.isInteger(n));
        const distintos = new Set(niveles);
        if (distintos.size >= 2) {
          const lo = Math.min(...niveles);
          const hi = Math.max(...niveles);
          if (hi - lo + 1 > distintos.size) {
            warnings.push(
              `Colectivo "${col.id}": plantas salteadas (niveles ${lo}–${hi} con huecos). La clase de tiro cuenta el span completo (DB-HS3 ap. 4.2.1, "ambas incluidas"); confirma que las plantas intermedias existen físicamente.`,
            );
          }
        }
      }
    }
  }

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
    // `red` solo presente en modo avanzado: en modo rápido no se añade la clave
    // (mantiene los snapshots de modo rápido byte-idénticos).
    ...(red ? { red } : {}),
    noOcupacion_l_s,
    veredictoGlobal,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Selección de sección de la Tabla 4.2 — helper PURO compartido por el modo
// rápido (`calcularConducto`) y el modo red (dimensionado por tramo). Elige el
// primer tramo de caudal cuyo `qvtMax_l_s` ≥ qvt (o el último, sin tope, con
// `fueraDeRango=true` si qvt supera el último límite). NO empuja warnings: el
// llamante decide el mensaje (difiere entre modo rápido y modo red).
// -----------------------------------------------------------------------------
export function seccionPorTramo(
  qvt_l_s: number,
  claseTiro: ClaseTiro,
): { celda: CeldaSeccion4_2; fueraDeRango: boolean; ultimoTope: number | null } {
  const tramos = SECCION_CONDUCTO_TABLA_4_2.datos.tramos;
  let tramoElegido = tramos[tramos.length - 1];
  for (const tr of tramos) {
    if (tr.qvtMax_l_s !== null && qvt_l_s <= tr.qvtMax_l_s) {
      tramoElegido = tr;
      break;
    }
  }
  const ultimoTope = tramos[tramos.length - 1].qvtMax_l_s;
  const fueraDeRango = ultimoTope !== null && qvt_l_s > ultimoTope;
  return { celda: tramoElegido.secciones[claseTiro], fueraDeRango, ultimoTope };
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

  // Sección requerida (Tabla 4.2), vía el helper compartido con el modo red.
  const { celda, fueraDeRango, ultimoTope } = seccionPorTramo(qvt_l_s, claseTiro);
  if (fueraDeRango) {
    warnings.push(
      `El caudal total de extracción (${qvt_l_s} l/s) supera el último tramo de la Tabla 4.2 (${ultimoTope} l/s): sección extrapolada del último tramo.`,
    );
  }

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

// -----------------------------------------------------------------------------
// MODO RED (avanzado) — dimensionado del conducto colectivo multiplanta.
//
// De cada `Colectivo` se DERIVA un árbol de tramos; el modelo estructurado hace
// IRREPRESENTABLES los estados ilegales (huérfano, ciclo, árbol roto):
//
//        boca (raíz, qvt = Σ todas las plantas)   ← tramo más cargado = «manda»
//          │
//        planta nivel N   (qvt = N + inferiores)
//          │
//        planta nivel …
//          │
//        planta nivel 0   (hoja, qvt = solo su planta)
//
// El caudal se acumula AGUAS ARRIBA hacia la boca (`acumularAguasAbajo`, raíz =
// boca): un tramo transporta la extracción de su planta + la de las inferiores.
// La clase de tiro es ÚNICA por colectivo (span de plantas = max−min+1, Tabla
// 4.3); la sección se dimensiona por tramo con su qvt acumulado (Tabla 4.2, vía
// `seccionPorTramo`, compartido con el modo rápido).
//
// La COCCIÓN nunca entra: el qvt propio de una planta es Σ de la extracción
// GENERAL (`caudalPropuesto_l_s`) de sus húmedos, jamás `caudalCoccion_l_s`.
//
// Los errores duros (red vacía, colectivo sin estancias, nivel no entero, doble
// asignación, estancia inexistente) van en `estadoRed.bloqueos` (canal propio,
// NO `warnings`) y NO degradan `veredictoGlobal`.
// -----------------------------------------------------------------------------
function calcularRed(
  colectivos: readonly Colectivo[],
  estancias: readonly Estancia[],
  zona: ZonaTermica,
): ResultadoRed {
  const bloqueos: string[] = [];
  const porId = new Map(estancias.map((e) => [e.id, e]));

  // --- Validación estructural (errores duros) -------------------------------
  if (colectivos.length === 0) {
    bloqueos.push("La red colectiva no tiene ningún colectivo definido.");
  }
  // Recuento de asignaciones para detectar doble conteo de una misma estancia.
  const asignaciones = new Map<string, number>();
  for (const col of colectivos) {
    if (col.plantas.length === 0) {
      bloqueos.push(`El colectivo "${col.id}" no tiene plantas.`);
    }
    let recogeAlguna = false;
    for (const p of col.plantas) {
      if (!Number.isInteger(p.nivel)) {
        bloqueos.push(
          `El colectivo "${col.id}" tiene una planta con nivel no entero (${p.nivel}).`,
        );
      }
      for (const eid of p.estanciasIds) {
        asignaciones.set(eid, (asignaciones.get(eid) ?? 0) + 1);
        if (porId.has(eid)) recogeAlguna = true;
      }
    }
    if (col.plantas.length > 0 && !recogeAlguna) {
      bloqueos.push(`El colectivo "${col.id}" no recoge ninguna estancia existente.`);
    }
  }
  for (const [eid, n] of asignaciones) {
    if (!porId.has(eid)) {
      bloqueos.push(`La red referencia una estancia inexistente "${eid}".`);
    } else if (n > 1) {
      bloqueos.push(`La estancia "${eid}" está asignada a ${n} plantas (doble conteo).`);
    }
  }

  // qvt propio de una planta = Σ extracción GENERAL de sus húmedos (sin cocción).
  const qvtPlanta = (p: PlantaColectivo): number =>
    p.estanciasIds.reduce((acc, eid) => {
      const e = porId.get(eid);
      return acc + (e && esHumedo(e.tipo) ? e.caudalPropuesto_l_s : 0);
    }, 0);

  const colectivosOut: ResultadoColectivo[] = [];
  let qvtRedTotal = 0;

  for (const col of colectivos) {
    if (col.plantas.length === 0) continue;

    // Plantas por nivel ascendente: la más alta cuelga de la boca; cada planta
    // cuelga de la de encima (cadena hacia la raíz).
    const plantas = [...col.plantas].sort((a, b) => a.nivel - b.nivel);
    const bocaId = `${col.id}:boca`;
    const nodoId = (nivel: number) => `${col.id}:${nivel}`;

    const nodos: NodoArbol[] = [{ id: bocaId, parentId: null }];
    plantas.forEach((p, k) => {
      const parent = k < plantas.length - 1 ? nodoId(plantas[k + 1].nivel) : bocaId;
      nodos.push({ id: nodoId(p.nivel), parentId: parent });
    });

    const { childrenIds, orden, arbolValido } = validarArbol(nodos);
    if (!arbolValido) {
      // Defensivo: la derivación siempre da un árbol válido (niveles únicos por
      // construcción del editor). Si no, es un bug; se bloquea por seguridad.
      bloqueos.push(`No se pudo derivar un árbol válido del colectivo "${col.id}".`);
    }

    const qvtPropio = new Map<string, number>([[bocaId, 0]]);
    for (const p of plantas) qvtPropio.set(nodoId(p.nivel), qvtPlanta(p));
    const qvtAcum = acumularAguasAbajo(orden, childrenIds, (id) => qvtPropio.get(id) ?? 0);

    // Clase de tiro (Tabla 4.3): span de plantas = max−min+1 (la boca no cuenta).
    const niveles = plantas.map((p) => p.nivel);
    const span = Math.max(...niveles) - Math.min(...niveles) + 1;
    const claseTiro = claseTiroDe(span, zona);

    // Sección por tramo (incluida la boca: es el más cargado → dimensionante).
    const seccion = new Map<string, { area: number; conductos: ConductoSeccion[] }>();
    for (const id of orden) {
      const { celda } = seccionPorTramo(qvtAcum.get(id) ?? 0, claseTiro);
      seccion.set(id, { area: celda.area_cm2, conductos: celda.conductos.map((cc) => ({ ...cc })) });
    }
    let maxArea = -1;
    for (const id of orden) maxArea = Math.max(maxArea, seccion.get(id)!.area);

    const parentDe = new Map(nodos.map((n) => [n.id, n.parentId]));
    const nivelDe = new Map(plantas.map((p) => [nodoId(p.nivel), p.nivel]));

    const tramos: ResultadoTramoRed[] = orden.map((id) => {
      const sec = seccion.get(id)!;
      return {
        id,
        parentId: parentDe.get(id) ?? null,
        childrenIds: [...(childrenIds.get(id) ?? [])],
        colectivoId: col.id,
        nivel: id === bocaId ? null : (nivelDe.get(id) ?? null),
        qvtAcum_l_s: qvtAcum.get(id) ?? 0,
        claseTiro,
        seccionRequerida_cm2: sec.area,
        conductos: sec.conductos,
        esDimensionante: sec.area === maxArea,
        esManda: false, // se fija globalmente más abajo
        estado: "neutral" as Veredicto,
      };
    });

    const qvtBoca = qvtAcum.get(bocaId) ?? 0;
    qvtRedTotal += qvtBoca;
    colectivosOut.push({
      id: col.id,
      plantasServidas: span,
      claseTiro,
      qvtBoca_l_s: qvtBoca,
      tramos,
    });
  }

  // Tramo que MANDA en toda la red = mayor sección entre los dimensionantes.
  // En empate de sección preferimos el ÚLTIMO en orden topológico (la boca, que
  // va al final del `orden` post-orden) usando `>=`: en el caso trivial de 1
  // planta —donde boca y planta cargan lo mismo— el ◆ cae en la boca, no en la
  // planta. Sigue habiendo exactamente un tramo con `esManda`.
  let mandaArea = -1;
  let mandaRef: ResultadoTramoRed | null = null;
  for (const c of colectivosOut) {
    for (const t of c.tramos) {
      if (t.esDimensionante && t.seccionRequerida_cm2 >= mandaArea) {
        mandaArea = t.seccionRequerida_cm2;
        mandaRef = t;
      }
    }
  }
  if (mandaRef) mandaRef.esManda = true;

  return {
    colectivos: colectivosOut,
    estadoRed: { valida: bloqueos.length === 0, bloqueos },
    qvtRedTotal_l_s: qvtRedTotal,
  };
}
