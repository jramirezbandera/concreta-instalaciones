// =============================================================================
// DB-HS4 — Suministro de agua (fontanería). MOTOR DE CÁLCULO.
//
// Función PURA y DETERMINISTA (SPEC §4): `calcHS4(inputs): HS4Result`, sin
// React/DOM, sin Date.now/Math.random. Mismo input → mismo output (requisito de
// snapshots). Opera en IEEE-754 doble SIN redondear: el redondeo es solo de
// presentación (vive en la UI/ficha, no aquí). Ids deterministas.
//
// Todas las cifras normativas provienen de ./tablas.ts (envueltas en TablaCTE
// con procedencia). Nunca se hardcodean cifras dispersas en esta lógica.
//
// TOPOLOGÍA = árbol de red de AGUA FRÍA (AF) explícito (misma forma que HS5): la
// entrada es un grafo de tramos (derivación de aparato → ramal/derivación
// particular → columna/montante → tubo de alimentación → acometida) con
// conexiones padre/hijo. El motor valida que sea un árbol (sin ciclos ni
// huérfanos), acumula CAUDAL INSTANTÁNEO aguas abajo por recorrido topológico,
// aplica el coeficiente de simultaneidad K, dimensiona el Ø de cada tramo por
// velocidad de cálculo + mínimos de tabla, comprueba la monotonía de Ø, calcula
// la pérdida de carga y la presión residual a lo largo del recorrido, e
// identifica el punto/tramo crítico. Salida por-tramo pensada para alimentar
// UI/SVG/ficha.
//
// HIDRÁULICA en lugar de UD (cf. HS5):
//   Q teórico → Ø = sqrt(4·Q / (π·v))  →  Ø comercial ≥ teórico (y ≥ mínimos
//   Tabla 4.2/4.3) → velocidad real v = 4·Q / (π·Ø²) → pérdida J·L + localizadas
//   → presión residual = P_acometida − Σ pérdidas − ρ·g·Δh.
//
// Unidades canónicas (src/lib/units/types.ts): dm³/s (caudal), mm (Ø), m/s
// (velocidad), kPa (presión), m (longitud/cota). Los campos llevan SUFIJO DE
// UNIDAD en su nombre.
//
// =============================================================================
// CONTRATO DE INTEGRACIÓN con svg.tsx y ficha.ts (Fase 3, EN PARALELO):
//
//  - `svg.tsx` EXPORTARÁ, como ÚNICA fuente de verdad:
//        export const HS4_PDF_SVG_ID = "hs4-svg-pdf";
//        export function hs4NativeSize(
//          result: HS4Result,
//        ): { nativeW: number; nativeH: number };
//    El literal del id es EXACTAMENTE  "hs4-svg-pdf"  (alineado con el patrón
//    "hs5-svg-pdf"). ui.tsx montará el clon oculto del HS4SVG (modo 'pdf') con
//    ESE mismo id; renderFicha lo busca en el DOM por ese id.
//
//  - `ficha.ts` IMPORTARÁ ambos desde "./svg":
//        import { HS4_PDF_SVG_ID, hs4NativeSize } from "./svg";
//    NO los redefine: evita deriva entre el raster del SVG y el `scale` del PDF.
//
//  - El SVG consume de cada `ResultadoTramoHS4`: `id`, `parentId`, `childrenIds`
//    (para dibujar el árbol), `diametro_mm`, `caudalCalculo_dm3_s`,
//    `velocidad_m_s`, `presionResidual_kPa` (etiquetas por tramo) y `esCritico`
//    (pinta el recorrido crítico en ROJO — render multicanal). `estado` da el
//    color del veredicto por tramo.
//
//  - CONGELADO: `HS4Inputs`, `HS4Result` y los nombres/tipos exportados de este
//    archivo NO cambian tras esta fase. Las 3 tareas paralelas de la Fase 3
//    (svg, ficha, tests) dependen de este contrato.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import { acumularAguasAbajo, peor, validarArbol } from "../../lib/cte/grafo";
import {
  ALIMENTACION_TABLA_4_3,
  PERDIDAS_LOCALIZADAS,
  PRESIONES,
  SIMULTANEIDAD_K,
  caudalInstantaneo,
  diametroAlimentacion_mm,
  filaDerivacion,
  presionMinExigida_kPa,
  rangoVelocidad,
  type MaterialTuberia,
  type TipoAparatoHS4,
  type TramoAlimentacionHS4,
} from "./tablas";

// -----------------------------------------------------------------------------
// SERIE DE DIÁMETROS COMERCIALES [mm].
//
// NO es una tabla del DB-HS4: es una serie comercial ORIENTATIVA de
// predimensionado (diámetros interiores aproximados habituales en cobre /
// multicapa / PB). El motor selecciona el primer Ø ≥ al teórico. La cifra
// normativa que SÍ vincula es el Ø MÍNIMO por tabla (4.2 derivaciones / 4.3
// alimentación), que se aplica como cota inferior aparte. Se documenta como dato
// para que la ficha pueda citarlo como criterio de proyecto (no como exigencia).
// -----------------------------------------------------------------------------
export const SERIE_DIAMETROS_COMERCIALES_mm: readonly number[] = [
  12, 16, 20, 25, 32, 40, 50, 63, 75, 90, 110,
] as const;

// -----------------------------------------------------------------------------
// MODELO DE PÉRDIDA DE CARGA (predimensionado, DOCUMENTADO — NO es del DB).
//
// Pérdida unitaria longitudinal por una expresión explícita de predimensionado
// de mesa, monótona en v y decreciente en Ø:
//
//   J [kPa/m] = COEF_PERDIDA · v^1.75 / Ø_mm^1.25
//
// con v en m/s y Ø_mm el diámetro interior en MILÍMETROS. Es una simplificación
// tipo Flamant/Hazen-Williams (exponentes ≈ 1.75 / -1.25) suficiente para
// predimensionado; NO sustituye un cálculo de detalle (Darcy-Weisbach con f de
// Colebrook). COEF_PERDIDA está calibrado para dar pérdidas del orden de
// magnitud usual en fontanería doméstica (~0.1–0.5 kPa/m a v≈1 m/s, Ø≈20 mm).
// Se etiqueta SIEMPRE como modelo de predimensionado en `motivo`/warnings.
//
//   Pérdida longitudinal del tramo  = J · L
//   Pérdida localizada              = fracción · (J · L)   [PERDIDAS_LOCALIZADAS]
//   Pérdida por cota geométrica     = ρ·g·Δh ≈ 9.81 kPa por metro de altura
//
// La pérdida por cota sólo se aplica a tramos que SUBEN (Δaltura > 0) según la
// cota del tramo respecto a su padre.
// -----------------------------------------------------------------------------
/**
 * Coeficiente del modelo de pérdida unitaria de predimensionado, calibrado para
 * Ø en mm: J = COEF · v^1.75 / Ø_mm^1.25. Con v=1 m/s y Ø=20 mm (Ø^1.25≈42.3)
 * da J≈0.30 kPa/m, orden de magnitud realista en fontanería doméstica.
 */
const COEF_PERDIDA = 12.7;
/** Exponente de la velocidad en el modelo de pérdida unitaria. */
const EXP_VELOCIDAD = 1.75;
/** Exponente (negativo) del diámetro en el modelo de pérdida unitaria. */
const EXP_DIAMETRO = 1.25;
/** Presión hidrostática por metro de columna de agua [kPa/m] (ρ·g, agua a 4 °C). */
const KPA_POR_METRO_ALTURA = 9.81;

// -----------------------------------------------------------------------------
// MODELO DE ENTRADA — árbol de red explícito (misma forma que HS5).
// -----------------------------------------------------------------------------

/**
 * Tipo de tramo de la red de suministro. `derivacion_aparato` es la derivación
 * individual a un aparato (Ø mín. Tabla 4.2); el resto son tramos de
 * alimentación (Ø mín. Tabla 4.3).
 */
export type TipoTramoHS4 =
  | "derivacion_aparato"
  | "derivacion_particular"
  | "columna_montante"
  | "tubo_alimentacion"
  | "acometida";

/**
 * Criterio de simultaneidad K elegido (ENTRADA).
 *  - "une149201": K = 1/√(n−1)  (UNE 149201 — CRITERIO EXTERNO, no exigencia CTE).
 *  - "sin_simultaneidad": K = 1 (suma directa de caudales instantáneos).
 */
export type CriterioK = "une149201" | "sin_simultaneidad";

/** Un aparato sanitario conectado a un tramo (cuelga de una `derivacion_aparato`). */
export interface AparatoInputHS4 {
  /** Identificador estable (lo consume el SVG / la ficha). */
  id: string;
  /** Tipo de aparato de la Tabla 2.1 (fuente de verdad de aparatos). */
  tipo: TipoAparatoHS4;
  /** Id del tramo (normalmente una `derivacion_aparato`) al que se conecta. */
  tramoId: string;
  /**
   * El punto de consumo exige presión de fluxor/calentador (150 kPa) en vez de
   * grifo común (100 kPa). Por defecto se deriva del tipo (inodoro_fluxor,
   * urinario_temporizado ⇒ fluxor); este campo lo fuerza si se indica.
   */
  esFluxorOCalentador?: boolean;
}

/** Un tramo de la red de suministro (derivación / columna / alimentación / acometida). */
export interface TramoInputHS4 {
  /** Identificador estable (lo consume el SVG para dibujar el árbol). */
  id: string;
  tipo: TipoTramoHS4;
  /** Id del tramo padre (aguas abajo, hacia la acometida) o `null` si es la raíz. */
  parentId: string | null;
  /** Material de la tubería (fija el rango de velocidad admisible). Por defecto "metalica". */
  material?: MaterialTuberia;
  /** Longitud del tramo [m] (para la pérdida longitudinal). Por defecto 1 m. */
  longitud_m?: number;
  /**
   * Cota/altura del tramo respecto a su padre [m]. Positiva si SUBE (resta
   * presión hidrostática). Por defecto 0.
   */
  altura_m?: number;
  /**
   * Sólo en tramos de alimentación: tipo de tramo de la Tabla 4.3 para el Ø
   * mínimo. Si se omite, se infiere del `tipo` (ver `tramoAlimentacionDe`).
   */
  tramoAlimentacion?: TramoAlimentacionHS4;
}

export interface HS4Inputs {
  /** Aparatos sanitarios y el tramo al que se conecta cada uno (red de AF). */
  aparatos: AparatoInputHS4[];
  /** Tramos de la red con sus conexiones padre/hijo (grafo = árbol). */
  tramos: TramoInputHS4[];
  /** Presión disponible en la acometida (entrada de la red) [kPa]. */
  presionAcometida_kPa: number;
  /**
   * Criterio de simultaneidad K. "une149201" (K=1/√(n−1)) es CRITERIO EXTERNO,
   * NO exigencia CTE; "sin_simultaneidad" usa K=1.
   */
  criterioK: CriterioK;
  /**
   * Fracción de pérdidas localizadas sobre las longitudinales [0..1]. Si se
   * omite, se usa el valor medio del rango de `PERDIDAS_LOCALIZADAS` (20–30 %).
   */
  fraccionPerdidasLocalizadas?: number;
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO
// -----------------------------------------------------------------------------

/** Resultado por aparato (Tabla 2.1): caudal instantáneo de AF y Ø mín. derivación. */
export interface ResultadoAparatoHS4 {
  id: string;
  tipo: TipoAparatoHS4;
  tramoId: string;
  /** Caudal instantáneo de AF del aparato [dm³/s] (Tabla 2.1). */
  caudalInstantaneo_dm3_s: number;
  /** Ø mín. de la derivación individual [mm] (Tabla 4.2); `null` si no tabulado. */
  diametroMinDerivacion_mm: number | null;
  /** Punto de consumo que exige presión de fluxor/calentador (150 kPa). */
  esFluxorOCalentador: boolean;
  /** Presión mínima exigida en el punto de consumo [kPa] (100 / 150). */
  presionMinExigida_kPa: number;
  cumple: boolean;
  estado: Veredicto;
}

/** Resultado por tramo dimensionado: alimenta el SVG (árbol) y la ficha. */
export interface ResultadoTramoHS4 {
  id: string;
  tipo: TipoTramoHS4;
  /** Id del tramo padre (aguas abajo), para que el SVG dibuje el árbol. */
  parentId: string | null;
  /** Ids de los hijos (aguas arriba), en orden de entrada. */
  childrenIds: string[];
  /** Material efectivo de la tubería. */
  material: MaterialTuberia;
  /** Longitud efectiva del tramo [m]. */
  longitud_m: number;
  /** Cota/altura efectiva respecto al padre [m] (positiva si sube). */
  altura_m: number;
  /** Nº de aparatos servidos aguas arriba por este tramo. */
  numAparatos: number;
  /** Caudal instantáneo acumulado aguas arriba (suma de Tabla 2.1) [dm³/s]. */
  caudalAcumulado_dm3_s: number;
  /** Coeficiente de simultaneidad aplicado al tramo (∈ (0,1]). */
  k: number;
  /** Caudal de cálculo del tramo = caudal acumulado × K [dm³/s]. */
  caudalCalculo_dm3_s: number;
  /** Ø comercial resultante del tramo [mm] (`null` si no se pudo dimensionar). */
  diametro_mm: number | null;
  /** Ø teórico por velocidad antes de redondear a serie/mínimos [mm]. */
  diametroTeorico_mm: number;
  /** Ø mínimo impuesto por tabla (4.2 derivación / 4.3 alimentación) [mm]. */
  diametroMinPorTabla_mm: number;
  /** Ø mínimo impuesto por la monotonía (≥ máx Ø de los hijos) [mm]. */
  diametroMinPorAguasArriba_mm: number;
  /** Velocidad real con el Ø elegido [m/s] (`null` si no hay caudal/Ø). */
  velocidad_m_s: number | null;
  /** Pérdida de carga del tramo (longitudinal + localizada + cota) [kPa]. */
  perdida_kPa: number;
  /** Presión residual a la salida (aguas arriba) de este tramo [kPa]. */
  presionResidual_kPa: number;
  /** `true` si el tramo pertenece al recorrido crítico (lo pinta el SVG en rojo). */
  esCritico: boolean;
  /**
   * `true` si la velocidad cae fuera del rango recomendado del material (ap. 4.2
   * d). Es señal de buena práctica (informe), NO incumplimiento prestacional del
   * CTE: NO contamina `cumple`/`estado` (se reporta como `warn` informativo).
   */
  velocidadFueraDeRango: boolean;
  /**
   * `true` si el Ø requerido SUPERA el mayor Ø de la serie comercial (110 mm): el
   * tramo NO tiene un Ø válido de la serie (OV-6). Degrada `estado` a `warn`.
   */
  diametroFueraDeSerie: boolean;
  cumple: boolean;
  estado: Veredicto;
  /** Motivo/justificación de la base de cálculo (cita de tabla / modelo). */
  motivo: string;
}

export interface HS4Result {
  /**
   * `true` si el grafo de tramos es un árbol válido. Endurecido (kernel): es
   * `false` ante id duplicado, ciclo, huérfano (padre inexistente) o más de una
   * raíz (HS4 exige raíz única = acometida).
   */
  arbolValido: boolean;
  /** Criterio de simultaneidad usado. */
  criterioK: CriterioK;
  /**
   * `true` si K se ha calculado por la fórmula UNE 149201 (1/√(n−1)). DEJA
   * CONSTANCIA de que K es CRITERIO EXTERNO, NO exigencia del DB-HS4.
   */
  kEsCriterioExterno: boolean;
  /** Norma de procedencia del criterio K (p.ej. "UNE 149201"); `null` si K=1. */
  normaCriterioK: string | null;
  /** Presión disponible en la acometida [kPa]. */
  presionAcometida_kPa: number;
  /** Verificación por aparato (Tabla 2.1 / 4.2). */
  porAparato: ResultadoAparatoHS4[];
  /** Tramos dimensionados, en orden topológico (hojas → raíz). */
  porTramo: ResultadoTramoHS4[];
  /** Caudal de cálculo total que llega a la acometida [dm³/s]. */
  caudalTotal_dm3_s: number;
  /**
   * Presión residual del punto de consumo de PEOR MARGEN [kPa]. El "más
   * desfavorable" se elige por DÉFICIT (presionResidual − presionMinExigida más
   * negativo), no por presión absoluta (OV-4).
   */
  presionCritica_kPa: number;
  /** Id del aparato en el punto crítico (peor margen); `null` si no hay aparatos. */
  puntoCriticoId: string | null;
  /**
   * `true` si CUALQUIER punto de consumo presenta déficit (presión residual <
   * su mínima exigida) ⇒ se requiere grupo de presión (ap. 4.5). No depende solo
   * del punto reportado como crítico (OV-4).
   */
  grupoPresionNecesario: boolean;
  /** Peor veredicto de las verificaciones (presión, velocidad, dimensionado). */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos (mensajes en español, sin Zod). */
  warnings: string[];
}

// -----------------------------------------------------------------------------
// DEFAULTS — vivienda realista (baño completo + aseo + cocina), análogo a
// hs5Defaults. Material multicapa, presión de acometida 250 kPa → caso CUMPLE.
// Topología: cada aparato → su derivación → derivación particular de la vivienda
// → columna/montante → tubo de alimentación → acometida.
// -----------------------------------------------------------------------------
export const hs4Defaults: HS4Inputs = {
  presionAcometida_kPa: 250,
  criterioK: "une149201",
  aparatos: [
    // Baño completo.
    { id: "bano-lavabo", tipo: "lavabo", tramoId: "d-bano-lavabo" },
    { id: "bano-inodoro", tipo: "inodoro_cisterna", tramoId: "d-bano-inodoro" },
    { id: "bano-banera", tipo: "banera_ge_140", tramoId: "d-bano-banera" },
    { id: "bano-bide", tipo: "bide", tramoId: "d-bano-bide" },
    // Aseo.
    { id: "aseo-lavabo", tipo: "lavabo", tramoId: "d-aseo-lavabo" },
    { id: "aseo-inodoro", tipo: "inodoro_cisterna", tramoId: "d-aseo-inodoro" },
    { id: "aseo-ducha", tipo: "ducha", tramoId: "d-aseo-ducha" },
    // Cocina.
    { id: "coc-fregadero", tipo: "fregadero_domestico", tramoId: "d-coc-fregadero" },
    { id: "coc-lavavajillas", tipo: "lavavajillas_domestico", tramoId: "d-coc-lavavajillas" },
    { id: "coc-lavadora", tipo: "lavadora_domestica", tramoId: "d-coc-lavadora" },
  ],
  tramos: [
    // Derivaciones individuales a cada aparato (cuelgan del cuarto húmedo).
    { id: "d-bano-lavabo", tipo: "derivacion_aparato", parentId: "ramal-bano", material: "termoplastico_multicapa", longitud_m: 1.5 },
    { id: "d-bano-inodoro", tipo: "derivacion_aparato", parentId: "ramal-bano", material: "termoplastico_multicapa", longitud_m: 1.5 },
    { id: "d-bano-banera", tipo: "derivacion_aparato", parentId: "ramal-bano", material: "termoplastico_multicapa", longitud_m: 2 },
    { id: "d-bano-bide", tipo: "derivacion_aparato", parentId: "ramal-bano", material: "termoplastico_multicapa", longitud_m: 1.5 },
    { id: "d-aseo-lavabo", tipo: "derivacion_aparato", parentId: "ramal-aseo", material: "termoplastico_multicapa", longitud_m: 1.5 },
    { id: "d-aseo-inodoro", tipo: "derivacion_aparato", parentId: "ramal-aseo", material: "termoplastico_multicapa", longitud_m: 1.5 },
    { id: "d-aseo-ducha", tipo: "derivacion_aparato", parentId: "ramal-aseo", material: "termoplastico_multicapa", longitud_m: 2 },
    { id: "d-coc-fregadero", tipo: "derivacion_aparato", parentId: "ramal-cocina", material: "termoplastico_multicapa", longitud_m: 2 },
    { id: "d-coc-lavavajillas", tipo: "derivacion_aparato", parentId: "ramal-cocina", material: "termoplastico_multicapa", longitud_m: 2 },
    { id: "d-coc-lavadora", tipo: "derivacion_aparato", parentId: "ramal-cocina", material: "termoplastico_multicapa", longitud_m: 2 },
    // Cuartos húmedos → derivación particular de la vivienda.
    { id: "ramal-bano", tipo: "derivacion_particular", parentId: "deriv-particular", tramoAlimentacion: "cuarto_humedo_privado", material: "termoplastico_multicapa", longitud_m: 3 },
    { id: "ramal-aseo", tipo: "derivacion_particular", parentId: "deriv-particular", tramoAlimentacion: "cuarto_humedo_privado", material: "termoplastico_multicapa", longitud_m: 3 },
    { id: "ramal-cocina", tipo: "derivacion_particular", parentId: "deriv-particular", tramoAlimentacion: "cuarto_humedo_privado", material: "termoplastico_multicapa", longitud_m: 4 },
    // Derivación particular → columna/montante → tubo de alimentación → acometida.
    { id: "deriv-particular", tipo: "derivacion_particular", parentId: "montante", tramoAlimentacion: "derivacion_particular", material: "metalica", longitud_m: 4 },
    { id: "montante", tipo: "columna_montante", parentId: "alimentacion", tramoAlimentacion: "columna_montante", material: "metalica", longitud_m: 6, altura_m: 3 },
    { id: "alimentacion", tipo: "tubo_alimentacion", parentId: "acometida", tramoAlimentacion: "distribuidor_principal", material: "metalica", longitud_m: 5 },
    { id: "acometida", tipo: "acometida", parentId: null, tramoAlimentacion: "distribuidor_principal", material: "metalica", longitud_m: 3 },
  ],
};

// -----------------------------------------------------------------------------
// HELPERS PUROS
// -----------------------------------------------------------------------------

/** Aparatos cuyo punto de consumo exige presión de fluxor por defecto. */
const APARATOS_FLUXOR: ReadonlySet<TipoAparatoHS4> = new Set<TipoAparatoHS4>([
  "inodoro_fluxor",
  "urinario_temporizado",
]);

/** ¿El aparato exige presión de fluxor/calentador (150 kPa)? */
function aparatoEsFluxor(ap: AparatoInputHS4): boolean {
  return ap.esFluxorOCalentador ?? APARATOS_FLUXOR.has(ap.tipo);
}

/** Material efectivo de un tramo (por defecto metálica). */
function materialDe(t: TramoInputHS4): MaterialTuberia {
  return t.material ?? "metalica";
}

/** Longitud efectiva de un tramo [m] (por defecto 1 m). */
function longitudDe(t: TramoInputHS4): number {
  return Number.isFinite(t.longitud_m) && (t.longitud_m as number) >= 0
    ? (t.longitud_m as number)
    : 1;
}

/** Cota/altura efectiva de un tramo respecto al padre [m] (por defecto 0). */
function alturaDe(t: TramoInputHS4): number {
  return Number.isFinite(t.altura_m) ? (t.altura_m as number) : 0;
}

/**
 * Tramo de la Tabla 4.3 a usar para el Ø mínimo de un tramo de alimentación.
 * Usa el campo explícito si lo hay; si no, lo infiere del `tipo`.
 */
function tramoAlimentacionDe(t: TramoInputHS4): TramoAlimentacionHS4 {
  if (t.tramoAlimentacion) return t.tramoAlimentacion;
  switch (t.tipo) {
    case "derivacion_particular":
      return "derivacion_particular";
    case "columna_montante":
      return "columna_montante";
    case "tubo_alimentacion":
    case "acometida":
      return "distribuidor_principal";
    case "derivacion_aparato":
      // No aplica (las derivaciones usan la Tabla 4.2); valor de relleno seguro.
      return "cuarto_humedo_privado";
  }
}

/**
 * Coeficiente de simultaneidad K para `n` aparatos según el criterio.
 *  - "sin_simultaneidad" ⇒ K = 1.
 *  - "une149201" ⇒ K = 1/√(n−1), con guardas: n ≤ 1 ⇒ K = 1; K acotado a (0,1].
 */
function coeficienteK(n: number, criterio: CriterioK): number {
  if (criterio === "sin_simultaneidad") return 1;
  const nAplicable = SIMULTANEIDAD_K.datos.nMinAplicable; // 2
  if (n < nAplicable) return 1; // n ≤ 1: la fórmula no aplica.
  const k = 1 / Math.sqrt(n - 1);
  // Acotar a (0,1]: con n=2 ⇒ k=1; n grande ⇒ k→0 (nunca 0 exacto ni negativo).
  return Math.min(1, Math.max(Number.MIN_VALUE, k));
}

/**
 * Ø teórico [mm] para un caudal `Q_dm3_s` a una velocidad de cálculo
 * `v_m_s`: Ø = sqrt(4·Q / (π·v)). Q se convierte de dm³/s a m³/s (÷1000) y el
 * resultado de m a mm (×1000). Devuelve 0 si Q = 0.
 */
function diametroTeorico_mm(Q_dm3_s: number, v_m_s: number): number {
  if (Q_dm3_s <= 0 || v_m_s <= 0) return 0;
  const Q_m3_s = Q_dm3_s / 1000;
  const area_m2 = Q_m3_s / v_m_s; // A = Q / v
  const d_m = Math.sqrt((4 * area_m2) / Math.PI);
  return d_m * 1000;
}

/** Mayor Ø de la serie comercial [mm]. */
const SERIE_MAX_mm = SERIE_DIAMETROS_COMERCIALES_mm[SERIE_DIAMETROS_COMERCIALES_mm.length - 1];

/**
 * Selección del Ø comercial para un Ø mínimo requerido `dMin_mm`. Devuelve el
 * primer Ø de la serie ≥ requerido y `fueraDeSerie=false`. Si el requerido SUPERA
 * el mayor Ø de la serie (110 mm), devuelve ese máximo pero con `fueraDeSerie=true`
 * para que el tramo NO aparente un Ø válido (OV-6): el motor lo marca y avisa.
 */
function diametroComercial_mm(dMin_mm: number): { diametro_mm: number; fueraDeSerie: boolean } {
  for (const d of SERIE_DIAMETROS_COMERCIALES_mm) {
    if (d >= dMin_mm) return { diametro_mm: d, fueraDeSerie: false };
  }
  return { diametro_mm: SERIE_MAX_mm, fueraDeSerie: true };
}

/**
 * Velocidad real [m/s] del caudal `Q_dm3_s` por un Ø `d_mm`:
 * v = 4·Q / (π·Ø²). Devuelve 0 si Q = 0 o Ø = 0.
 */
function velocidadReal_m_s(Q_dm3_s: number, d_mm: number): number {
  if (Q_dm3_s <= 0 || d_mm <= 0) return 0;
  const Q_m3_s = Q_dm3_s / 1000;
  const d_m = d_mm / 1000;
  const area_m2 = (Math.PI * d_m * d_m) / 4;
  return Q_m3_s / area_m2;
}

/**
 * Pérdida unitaria longitudinal [kPa/m] del modelo de predimensionado:
 *   J = COEF_PERDIDA · v^EXP_VELOCIDAD / Ø_mm^EXP_DIAMETRO
 * (v en m/s, Ø_mm en milímetros). Documentado: NO es del DB-HS4.
 */
function perdidaUnitaria_kPa_m(v_m_s: number, d_mm: number): number {
  if (v_m_s <= 0 || d_mm <= 0) return 0;
  return (COEF_PERDIDA * Math.pow(v_m_s, EXP_VELOCIDAD)) / Math.pow(d_mm, EXP_DIAMETRO);
}

// -----------------------------------------------------------------------------
// MOTOR
// -----------------------------------------------------------------------------

export function calcHS4(inp: HS4Inputs): HS4Result {
  const warnings: string[] = [];

  // ===========================================================================
  // 1. Validación del grafo y construcción del árbol (kernel compartido).
  //    Regla estricta para HS4: una sola raíz = la acometida. El árbol queda
  //    `arbolValido=false` ante id duplicado, ciclo, huérfano o multi-raíz.
  // ===========================================================================
  const tramoPorId = new Map<string, TramoInputHS4>();
  for (const t of inp.tramos) {
    if (!tramoPorId.has(t.id)) tramoPorId.set(t.id, t);
  }

  const arbol = validarArbol(inp.tramos);
  const { childrenIds, orden } = arbol;
  const arbolValido = arbol.arbolValido;
  warnings.push(...arbol.warnings);

  // ===========================================================================
  // 2. Caudal instantáneo por aparato (Tabla 2.1, AF) y agregación al tramo.
  // ===========================================================================
  const porAparato: ResultadoAparatoHS4[] = [];
  /** Caudal instantáneo AF que cada aparato aporta directamente a su tramo. */
  const caudalPropioTramo = new Map<string, number>();
  /** Nº de aparatos que descargan directamente a cada tramo. */
  const aparatosPropiosTramo = new Map<string, number>();
  for (const id of tramoPorId.keys()) {
    caudalPropioTramo.set(id, 0);
    aparatosPropiosTramo.set(id, 0);
  }

  let veredictoAparatos: Veredicto = "neutral";

  for (const ap of inp.aparatos) {
    const fila = caudalInstantaneo(ap.tipo);
    const q_dm3_s = fila.af_dm3_s;
    const esFluxor = aparatoEsFluxor(ap);
    const pMin = presionMinExigida_kPa(esFluxor);
    const diametroMinDerivacion_mm = filaDerivacion(ap.tipo)?.diametro_mm ?? null;

    let cumple = true;
    let estado: Veredicto = "ok";

    if (!caudalPropioTramo.has(ap.tramoId)) {
      warnings.push(`El aparato "${ap.id}" se conecta a un tramo inexistente "${ap.tramoId}".`);
      cumple = false;
      estado = "fail";
    } else {
      caudalPropioTramo.set(ap.tramoId, caudalPropioTramo.get(ap.tramoId)! + q_dm3_s);
      aparatosPropiosTramo.set(ap.tramoId, aparatosPropiosTramo.get(ap.tramoId)! + 1);
    }

    veredictoAparatos = peor(veredictoAparatos, estado);
    porAparato.push({
      id: ap.id,
      tipo: ap.tipo,
      tramoId: ap.tramoId,
      caudalInstantaneo_dm3_s: q_dm3_s,
      diametroMinDerivacion_mm,
      esFluxorOCalentador: esFluxor,
      presionMinExigida_kPa: pMin,
      cumple,
      estado,
    });
  }

  // OV-5: la Tabla 4.2 da el Ø de la derivación INDIVIDUAL (por aparato). Si más
  // de un aparato cuelga del mismo tramo `derivacion_aparato`, se avisa (no
  // bloquea): el Ø de derivación individual aplica por aparato, no por grupo.
  for (const id of aparatosPropiosTramo.keys()) {
    const t = tramoPorId.get(id);
    if (t?.tipo === "derivacion_aparato" && (aparatosPropiosTramo.get(id) ?? 0) > 1) {
      warnings.push(
        `Tramo "${id}" (derivación de aparato): ${aparatosPropiosTramo.get(id)} aparatos sobre la ` +
          `misma derivación; la Tabla 4.2 es por derivación INDIVIDUAL (revisar Ø por aparato).`,
      );
    }
  }

  // ===========================================================================
  // 3. Acumulación aguas abajo (post-orden del kernel: hojas → raíz). El caudal
  //    instantáneo y el nº de aparatos servidos se suman con la primitiva
  //    genérica `acumularAguasAbajo`, parametrizada por el valor propio de cada
  //    tramo (caudal propio / aparatos propios).
  // ===========================================================================
  const caudalAcum = acumularAguasAbajo(orden, childrenIds, (id) => caudalPropioTramo.get(id) ?? 0);
  const numAparatosAcum = acumularAguasAbajo(
    orden,
    childrenIds,
    (id) => aparatosPropiosTramo.get(id) ?? 0,
  );

  // ===========================================================================
  // 4. Dimensionado por tramo: Q de cálculo (×K) → Ø teórico → Ø comercial
  //    (≥ mínimos de tabla y monotonía) → velocidad real.
  // ===========================================================================
  const normaK = inp.criterioK === "une149201" ? SIMULTANEIDAD_K.datos.procedencia.norma ?? null : null;
  const kEsCriterioExterno = inp.criterioK === "une149201";
  if (kEsCriterioExterno) {
    warnings.push(
      `Coeficiente de simultaneidad K = 1/√(n−1): CRITERIO EXTERNO (${normaK ?? "UNE 149201"}), ` +
        `NO exigencia del DB-HS4 (el DB remite a "un criterio adecuado").`,
    );
  }

  const fraccionLocalizadas = resolverFraccionLocalizadas(inp, warnings);

  const resultadoPorId = new Map<string, ResultadoTramoHS4>();
  let veredictoTramos: Veredicto = "neutral";

  for (const id of orden) {
    const t = tramoPorId.get(id)!;
    const material = materialDe(t);
    const longitud_m = longitudDe(t);
    const altura_m = alturaDe(t);
    const numAparatos = numAparatosAcum.get(id) ?? 0;
    const caudalAcumulado_dm3_s = caudalAcum.get(id) ?? 0;

    const k = coeficienteK(numAparatos, inp.criterioK);
    const caudalCalculo_dm3_s = caudalAcumulado_dm3_s * k;

    const rango = rangoVelocidad(material);
    // Velocidad de cálculo para dimensionar: punto medio del rango admisible
    // (criterio de predimensionado documentado; no es cifra del DB).
    const vCalculo_m_s = (rango.min_m_s + rango.max_m_s) / 2;
    const dTeorico_mm = diametroTeorico_mm(caudalCalculo_dm3_s, vCalculo_m_s);

    // Ø mínimo por tabla (4.2 derivación / 4.3 alimentación).
    let diametroMinPorTabla_mm = 0;
    let citaMin = "";
    if (t.tipo === "derivacion_aparato") {
      // El Ø mín. de la derivación lo fija el aparato (Tabla 4.2): el mayor de
      // los aparatos que cuelgan directamente de este tramo.
      let dMin = 0;
      for (const ap of inp.aparatos) {
        if (ap.tramoId !== id) continue;
        const dDer = filaDerivacion(ap.tipo)?.diametro_mm;
        if (dDer != null) dMin = Math.max(dMin, dDer);
      }
      diametroMinPorTabla_mm = dMin;
      citaMin = dMin > 0 ? `Ø mín. ${dMin} mm (Tabla 4.2)` : "sin Ø mín. tabulado (Tabla 4.2)";
    } else {
      const tramoAlim = tramoAlimentacionDe(t);
      diametroMinPorTabla_mm = diametroAlimentacion_mm(tramoAlim);
      const desc = ALIMENTACION_TABLA_4_3.datos.tramos[tramoAlim].descripcion;
      citaMin = `Ø mín. ${diametroMinPorTabla_mm} mm (Tabla 4.3 · ${desc})`;
    }

    // Ø mínimo por monotonía (no decreciente aguas abajo).
    let diametroMinPorAguasArriba_mm = 0;
    for (const c of childrenIds.get(id) ?? []) {
      const rc = resultadoPorId.get(c);
      if (rc?.diametro_mm != null) {
        diametroMinPorAguasArriba_mm = Math.max(diametroMinPorAguasArriba_mm, rc.diametro_mm);
      }
    }

    // Ø comercial = primer Ø de serie ≥ max(teórico, mín. tabla, mín. monotonía).
    // Si el requerido supera el mayor Ø de la serie (110 mm), el helper lo marca
    // como fueraDeSerie (OV-6): el tramo NO aparenta un Ø válido.
    const dMinTotal = Math.max(dTeorico_mm, diametroMinPorTabla_mm, diametroMinPorAguasArriba_mm);
    const seleccion = dMinTotal > 0 ? diametroComercial_mm(dMinTotal) : null;
    const diametro_mm = seleccion?.diametro_mm ?? null;
    const diametroFueraDeSerie = seleccion?.fueraDeSerie ?? false;

    // Velocidad real con el Ø elegido y verificación de rango por material.
    const velocidad_m_s =
      diametro_mm != null ? velocidadReal_m_s(caudalCalculo_dm3_s, diametro_mm) : null;

    // El `cumple` del tramo refleja solo el dimensionado estructural. La
    // velocidad fuera de rango (ap. 4.2 d) y el Ø fuera de serie son señales de
    // buena práctica → `warn`, NO incumplimiento prestacional: no bajan `cumple`.
    const cumple = true;
    let estado: Veredicto = "ok";
    let motivoVel = "";

    // --- OV-6: Ø fuera de la serie comercial → warn explícito + aviso. ---------
    if (diametroFueraDeSerie) {
      estado = peor(estado, "warn");
      motivoVel += ` · Ø requerido ${dMinTotal.toFixed(1)} mm fuera de la serie comercial (> ${SERIE_MAX_mm} mm)`;
      warnings.push(
        `Tramo "${id}": Ø requerido (${dMinTotal.toFixed(1)} mm) fuera de la serie comercial ` +
          `(> ${SERIE_MAX_mm} mm): no hay Ø de serie que lo cubra (predimensionado).`,
      );
    }

    // --- T3: velocidad fuera de rango. El intervalo (0,50–2,00 metálicas /
    //     0,50–3,50 m/s termoplásticas) es CRITERIO DE ELECCIÓN / buena práctica
    //     (DB-HS4 ap. 4.2 d), NO límite prestacional del CTE. Por tanto, salir
    //     del rango (por arriba o por abajo) deja `cumple=true` y `estado=warn`
    //     (NUNCA `fail`): el fail se reserva a la presión (ap. 2.1.3). La señal
    //     "fuera de rango" se conserva aparte en `velocidadFueraDeRango`.
    let velocidadFueraDeRango = false;
    if (velocidad_m_s != null && caudalCalculo_dm3_s > 0) {
      const sobre = velocidad_m_s > rango.max_m_s;
      const bajo = velocidad_m_s < rango.min_m_s;
      if (sobre || bajo) {
        velocidadFueraDeRango = true;
        estado = peor(estado, "warn"); // warn, NO fail; cumple permanece true.
        const limite = sobre
          ? `por encima del máximo ${rango.max_m_s} m/s`
          : `por debajo del mínimo ${rango.min_m_s} m/s`;
        motivoVel += ` · v=${velocidad_m_s.toFixed(2)} m/s fuera del rango [${rango.min_m_s}, ${rango.max_m_s}] (${material})`;
        warnings.push(
          `Velocidad ${velocidad_m_s.toFixed(2)} m/s fuera del rango recomendado DB-HS4 ap. 4.2 d) ` +
            `(tramo "${id}", ${material}: ${limite}); buena práctica, no exigencia prestacional del CTE.` +
            (sobre && velocidad_m_s >= 2 ? " Considerar antivibratorios (v ≥ 2 m/s)." : ""),
        );
      } else {
        motivoVel += ` · v=${velocidad_m_s.toFixed(2)} m/s en rango [${rango.min_m_s}, ${rango.max_m_s}] (${material})`;
      }
    }

    // Pérdida de carga del tramo (modelo de predimensionado, ver cabecera).
    const v = velocidad_m_s ?? 0;
    const j_kPa_m = perdidaUnitaria_kPa_m(v, diametro_mm ?? 0);
    const perdidaLongitudinal_kPa = j_kPa_m * longitud_m;
    const perdidaLocalizada_kPa = perdidaLongitudinal_kPa * fraccionLocalizadas;
    const perdidaCota_kPa = altura_m > 0 ? altura_m * KPA_POR_METRO_ALTURA : 0;
    const perdida_kPa = perdidaLongitudinal_kPa + perdidaLocalizada_kPa + perdidaCota_kPa;

    const motivo =
      `${citaMin} · Q_cálc=${caudalCalculo_dm3_s.toFixed(3)} dm³/s ` +
      `(=${caudalAcumulado_dm3_s.toFixed(3)}×K${k.toFixed(3)}, n=${numAparatos}) ` +
      `→ Ø teórico ${dTeorico_mm.toFixed(1)} mm → Ø comercial ${diametro_mm ?? "?"} mm` +
      motivoVel +
      ` · pérdida ${perdida_kPa.toFixed(2)} kPa (long.+${(fraccionLocalizadas * 100).toFixed(0)}% local.` +
      (perdidaCota_kPa > 0 ? `+cota ${altura_m} m` : "") +
      `; modelo predimensionado).`;

    veredictoTramos = peor(veredictoTramos, estado);

    resultadoPorId.set(id, {
      id,
      tipo: t.tipo,
      parentId: t.parentId,
      childrenIds: [...(childrenIds.get(id) ?? [])],
      material,
      longitud_m,
      altura_m,
      numAparatos,
      caudalAcumulado_dm3_s,
      k,
      caudalCalculo_dm3_s,
      diametro_mm,
      diametroTeorico_mm: dTeorico_mm,
      diametroMinPorTabla_mm,
      diametroMinPorAguasArriba_mm,
      velocidad_m_s,
      perdida_kPa,
      // Presión residual se calcula en el paso 5 (recorrido raíz → hojas).
      presionResidual_kPa: 0,
      esCritico: false,
      velocidadFueraDeRango,
      diametroFueraDeSerie,
      cumple,
      estado,
      motivo,
    });
  }

  // ===========================================================================
  // 5. Presión residual: recorrido desde la acometida (raíz) hacia las hojas.
  //    Presión a la salida (aguas arriba) de un tramo = presión de su padre
  //    (o de la acometida si es raíz) − pérdida del tramo.
  // ===========================================================================
  const presionResidual = new Map<string, number>();
  // Pre-orden (raíz → hojas): inverso del post-orden filtrado a alcanzables.
  for (let i = orden.length - 1; i >= 0; i--) {
    const id = orden[i];
    const r = resultadoPorId.get(id)!;
    const presionEntrada =
      r.parentId === null
        ? inp.presionAcometida_kPa
        : presionResidual.get(r.parentId) ?? inp.presionAcometida_kPa;
    const pr = presionEntrada - r.perdida_kPa;
    presionResidual.set(id, pr);
    r.presionResidual_kPa = pr;
  }

  // ===========================================================================
  // 6. Punto crítico por DÉFICIT (OV-4): el punto de consumo más desfavorable es
  //    el de MENOR MARGEN (déficit = presionResidual − presionMinExigida más
  //    negativo), NO el de menor presión absoluta. Así un fluxor con presión
  //    alta pero mínima exigida mayor (déficit negativo) "gana" a un grifo con
  //    presión baja pero margen positivo. Se reporta `presionCritica_kPa` como
  //    la presión residual de ESE punto (el de peor margen). Verificación de
  //    presión por punto de consumo (mín. exigida / máx. de servicio).
  // ===========================================================================
  const pMax = PRESIONES.datos.presionMaxConsumo_kPa;
  let puntoCriticoId: string | null = null;
  let presionCritica_kPa = Number.POSITIVE_INFINITY;
  let aparatoCriticoTramoId: string | null = null;
  let margenCritico_kPa = Number.POSITIVE_INFINITY;
  /** Algún punto de consumo con déficit (presión residual < mínima exigida). */
  let hayDeficit = false;

  let veredictoPresion: Veredicto = "neutral";
  const aparatoPorId = new Map<string, ResultadoAparatoHS4>();
  for (const ra of porAparato) aparatoPorId.set(ra.id, ra);

  for (const ra of porAparato) {
    const r = resultadoPorId.get(ra.tramoId);
    const presion = r ? r.presionResidual_kPa : inp.presionAcometida_kPa;
    const margen = presion - ra.presionMinExigida_kPa; // déficit si < 0

    // El punto más desfavorable = MENOR margen (déficit más negativo). Empates:
    // gana el primero en el orden de entrada (determinista).
    if (margen < margenCritico_kPa) {
      margenCritico_kPa = margen;
      presionCritica_kPa = presion;
      puntoCriticoId = ra.id;
      aparatoCriticoTramoId = ra.tramoId;
    }

    // Verificación de presión en el punto de consumo.
    if (presion < ra.presionMinExigida_kPa) {
      hayDeficit = true;
      veredictoPresion = peor(veredictoPresion, "fail");
      ra.cumple = false;
      ra.estado = peor(ra.estado, "fail");
      warnings.push(
        `Punto de consumo "${ra.id}": presión residual ${presion.toFixed(1)} kPa < mínima exigida ` +
          `${ra.presionMinExigida_kPa} kPa (ap. 2.1.3${ra.esFluxorOCalentador ? ", fluxor/calentador" : ""}).`,
      );
    } else if (presion > pMax) {
      veredictoPresion = peor(veredictoPresion, "warn");
      ra.estado = peor(ra.estado, "warn");
      warnings.push(
        `Punto de consumo "${ra.id}": presión residual ${presion.toFixed(1)} kPa > máxima ` +
          `${pMax} kPa (ap. 2.1.3): requiere válvula reductora de presión.`,
      );
    } else {
      veredictoPresion = peor(veredictoPresion, "ok");
    }
  }

  if (puntoCriticoId === null) {
    // Sin aparatos: la presión crítica es la de la acometida.
    presionCritica_kPa = inp.presionAcometida_kPa;
  }

  // ===========================================================================
  // 7. Marcar el recorrido crítico (derivación del aparato crítico → acometida).
  // ===========================================================================
  if (aparatoCriticoTramoId !== null) {
    let cur: string | null = aparatoCriticoTramoId;
    const guard = new Set<string>();
    while (cur !== null && !guard.has(cur)) {
      guard.add(cur);
      const r = resultadoPorId.get(cur);
      if (!r) break;
      r.esCritico = true;
      cur = r.parentId;
    }
  }

  // ===========================================================================
  // 8. Grupo de presión (OV-4): necesario si CUALQUIER punto de consumo tiene
  //    déficit (presión residual < su mínima exigida), no solo el "crítico"
  //    reportado. El veredicto global ya marca fail por aparato; aquí se asegura
  //    la coherencia del flag con todos los puntos (ap. 4.5).
  // ===========================================================================
  const grupoPresionNecesario = hayDeficit;
  if (grupoPresionNecesario && puntoCriticoId !== null) {
    const apCrit = aparatoPorId.get(puntoCriticoId);
    const minExigida = apCrit?.presionMinExigida_kPa ?? PRESIONES.datos.presionMinGrifosComunes_kPa;
    warnings.push(
      `Grupo de presión NECESARIO (ap. 4.5): el punto de peor margen "${puntoCriticoId}" ` +
        `(${presionCritica_kPa.toFixed(1)} kPa) no alcanza su mínima exigida ${minExigida} kPa ` +
        `(o algún otro punto de consumo presenta déficit).`,
    );
  }

  // ===========================================================================
  // 9. Veredicto global: peor de todas las verificaciones reales.
  // ===========================================================================
  const porTramo: ResultadoTramoHS4[] = orden.map((id) => resultadoPorId.get(id)!);
  const caudalTotal_dm3_s = inp.tramos
    .filter((t) => t.parentId === null)
    .reduce((acc, t) => acc + (resultadoPorId.get(t.id)?.caudalCalculo_dm3_s ?? 0), 0);

  let veredictoGlobal: Veredicto = "ok";
  if (!arbolValido) veredictoGlobal = peor(veredictoGlobal, "fail");
  veredictoGlobal = peor(veredictoGlobal, veredictoAparatos);
  veredictoGlobal = peor(veredictoGlobal, veredictoTramos);
  veredictoGlobal = peor(veredictoGlobal, veredictoPresion);

  return {
    arbolValido,
    criterioK: inp.criterioK,
    kEsCriterioExterno,
    normaCriterioK: normaK,
    presionAcometida_kPa: inp.presionAcometida_kPa,
    porAparato,
    porTramo,
    caudalTotal_dm3_s,
    presionCritica_kPa,
    puntoCriticoId,
    grupoPresionNecesario,
    veredictoGlobal,
    warnings,
  };
}

/**
 * Fracción de pérdidas localizadas [0..1]. Si el input la da y es válida se usa;
 * si no, el valor MEDIO del rango de buena práctica (20–30 % ⇒ 0.25).
 */
function resolverFraccionLocalizadas(inp: HS4Inputs, warnings: string[]): number {
  const min = PERDIDAS_LOCALIZADAS.datos.fraccionLongitudinalesMin_pct / 100;
  const max = PERDIDAS_LOCALIZADAS.datos.fraccionLongitudinalesMax_pct / 100;
  const medio = (min + max) / 2;
  const f = inp.fraccionPerdidasLocalizadas;
  if (f === undefined) return medio;
  if (!Number.isFinite(f) || f < 0) {
    warnings.push(
      `Fracción de pérdidas localizadas inválida (${String(f)}): se usa el valor medio ` +
        `${(medio * 100).toFixed(0)} % (buena práctica 20–30 %, no DB).`,
    );
    return medio;
  }
  return f;
}
