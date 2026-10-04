// =============================================================================
// DB-HS5 — Evacuación de aguas (saneamiento). MOTOR DE CÁLCULO.
//
// Función PURA y DETERMINISTA (SPEC §4): `calcHS5(inputs): HS5Result`, sin
// React/DOM, sin Date.now/Math.random. Mismo input → mismo output (requisito de
// snapshots). Opera en IEEE-754 doble SIN redondear: el redondeo es solo de
// presentación (vive en la UI/ficha, no aquí). Ids deterministas.
//
// Todas las cifras normativas provienen de ./tablas.ts (envueltas en TablaCTE
// con procedencia). Nunca se hardcodean cifras dispersas en esta lógica.
//
// TOPOLOGÍA = árbol de red explícito: la entrada es un grafo de tramos
// (derivación de aparato → ramal colector → bajante → colector horizontal) con
// conexiones padre/hijo. El motor valida que sea un árbol (sin ciclos), acumula
// UD aguas abajo por recorrido topológico, dimensiona cada tramo por su tabla,
// comprueba la monotonía de Ø y dimensiona la ventilación de red (primaria /
// secundaria / terciaria). Salida por-tramo pensada para alimentar UI/SVG/ficha.
//
// Unidades canónicas (src/lib/units/types.ts): UD, mm, %, m, dm³/s, Pa. Los
// campos llevan SUFIJO DE UNIDAD en su nombre.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import { acumularAguasAbajo, peor, validarArbol } from "../../lib/cte/grafo";
import {
  BAJANTES_TABLA_4_4,
  capacidadAPendiente,
  COLECTORES_TABLA_4_5,
  DIAMETROS_VENT_4_10,
  RAMALES_COLECTORES_TABLA_4_3,
  seleccionarDiametroPorPendiente,
  SIFONES,
  UD_APARATOS_TABLA_4_1,
  VENT_PRIMARIA,
  VENT_SECUNDARIA,
  VENT_SECUNDARIA_ALTERNAS_TABLA_4_10,
  VENT_SECUNDARIA_CADA_PLANTA_TABLA_4_11,
  VENT_TERCIARIA,
  VENT_TERCIARIA_TABLA_4_12,
  type FilaAparato4_1,
  type FilaBajante4_4,
  type TipoAparato,
  type UsoAparato,
} from "./tablas";

/** Aparatos de la Tabla 4.1 con el tipo de fila ensanchado (incluye `agrupado`). */
const APARATOS_4_1 = UD_APARATOS_TABLA_4_1.datos.aparatos as Readonly<
  Record<TipoAparato, FilaAparato4_1>
>;

// -----------------------------------------------------------------------------
// MODELO DE ENTRADA — árbol de red explícito.
// -----------------------------------------------------------------------------

/** Tipo de tramo de la red de evacuación. */
export type TipoTramo = "ramal" | "bajante" | "colector";

/** Disposición de un colector horizontal (fija su pendiente mínima). */
export type DisposicionColector = "colgado" | "enterrado";

/** Un aparato sanitario conectado a un tramo (cuelga de un `ramal`). */
export interface AparatoInput {
  /** Identificador estable (lo consume el SVG / la ficha). */
  id: string;
  /** Nombre legible dado por el usuario (feature-7). El motor NO lo lee. */
  nombre?: string;
  /** Tipo de aparato de la Tabla 4.1 (incluye "cuartos" agrupados). */
  tipo: TipoAparato;
  /** Id del tramo (normalmente un `ramal`) al que descarga el aparato. */
  tramoId: string;
  /**
   * Uso de la Tabla 4.1 de ESTE aparato (feature-14): los aseos de unas
   * oficinas son de uso público aunque el edificio tenga viviendas. Sin él,
   * el uso de la red (`HS5Inputs.uso`).
   */
  uso?: UsoAparato;
  /**
   * Longitud de la derivación individual [m]. El Ø de la Tabla 4.1 es válido
   * para ≤ 1,5 m; por encima el motor emite una bandera de aviso (no bloquea).
   */
  longitudDerivacion_m?: number;
}

/** Un tramo de la red (ramal colector / bajante / colector horizontal). */
export interface TramoInput {
  /** Identificador estable (lo consume el SVG para dibujar el árbol). */
  id: string;
  /** Nombre legible dado por el usuario (feature-7). El motor NO lo lee. */
  nombre?: string;
  tipo: TipoTramo;
  /** Id del tramo padre (aguas abajo) o `null` si es la raíz (acometida). */
  parentId: string | null;
  /**
   * Pendiente del tramo [%] — aplica a `ramal` (2-4%; 1% sólo desde Ø90) y a
   * `colector`. Ignorada en `bajante` (vertical). Por defecto 2%.
   */
  pendiente_pct?: number;
  /** Disposición del colector horizontal (fija su pendiente mínima). */
  disposicion?: DisposicionColector;
  /**
   * Longitud del tramo [m]. En ramales, dispara la ventilación terciaria si
   * supera el umbral del DB (> 5 m).
   */
  longitud_m?: number;
  /**
   * Altura de ESTA bajante en plantas (Tabla 4.4, columnas «hasta 3 / más de 3
   * plantas»), feature-14. Las bajantes de un edificio no tienen por qué servir
   * todas las plantas. Sin él, `HS5Inputs.numPlantas`. Solo en `bajante`.
   */
  plantas?: number;
  /**
   * Plantas que ATRAVIESA la bajante hasta el colector (≥ `plantas`). El DB no
   * define la «altura de bajante» de la Tabla 4.4: si las plantas servidas y las
   * atravesadas caen a lados distintos del umbral de 3, se entra con las dos
   * columnas y se toma lo más desfavorable (criterio, verificación de
   * feature-14 §D1). Sin él, las servidas.
   */
  plantasAtravesadas?: number;
}

export interface HS5Inputs {
  /** Uso de la instalación: vivienda (privado) o no residencial (público). */
  uso: UsoAparato;
  /** Nº de plantas del edificio servidas por las bajantes (ventilación de red). */
  numPlantas: number;
  /** Cubierta transitable (afecta a la prolongación de la ventilación primaria). */
  cubiertaTransitable: boolean;
  /**
   * El proyectista dispone ventilación secundaria aunque no sea obligatoria
   * (feature-14). Con 7 plantas o más lo es siempre.
   */
  ventilacionSecundaria?: boolean;
  /** Aparatos sanitarios y el tramo al que descarga cada uno. */
  aparatos: AparatoInput[];
  /** Tramos de la red con sus conexiones padre/hijo (grafo = árbol). */
  tramos: TramoInput[];
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO
// -----------------------------------------------------------------------------

/** Resultado por tramo dimensionado: alimenta el SVG (árbol) y la ficha. */
export interface ResultadoTramo {
  id: string;
  tipo: TipoTramo;
  /** Id del tramo padre (aguas abajo), para que el SVG dibuje el árbol. */
  parentId: string | null;
  /** Ids de los hijos (aguas arriba), en orden de entrada. */
  childrenIds: string[];
  /** UD acumuladas aguas abajo en este tramo (suma de todo lo que vierte). */
  udAcumuladas: number;
  /** Pendiente efectiva usada en el dimensionado [%] (0 en bajante). */
  pendiente_pct: number;
  /** Ø resultante del tramo [mm] (`null` si no se pudo dimensionar). */
  diametro_mm: number | null;
  /**
   * Ø mínimo impuesto por lo que vierte al tramo [mm]: el mayor Ø de los tramos
   * hijos y del desagüe de los aparatos que descargan directamente en él (Tabla
   * 4.1: el inodoro exige Ø100). El Ø no disminuye en el sentido del flujo.
   */
  diametroMinPorAguasArriba_mm: number;
  /** Capacidad en UD del Ø final del tramo a su pendiente (`null` si N/A). */
  capacidad_ud: number | null;
  cumple: boolean;
  estado: Veredicto;
  /** Motivo/justificación de la base de cálculo (cita de tabla). */
  motivo: string;
  // ── Explicación en datos (contrato de REDISENO-V4 §3.2, feature-14) ────────
  /** Ø que da la tabla por unidades, antes de los mínimos de aguas arriba. */
  diametroPorCapacidad_mm: number | null;
  /** Qué sube el Ø por encima del de la tabla (`null` si no se sube). */
  elevadoPor: ElevacionDiametro | null;
  /** Ø tabulado inmediatamente menor que el final, con lo que admitiría. */
  alternativa: { diametro_mm: number; capacidad_ud: number | null } | null;
  /** Solo en bajantes: las dos comprobaciones de la Tabla 4.4. */
  bajante: DetalleBajante | null;
}

/**
 * Por qué un tramo tiene más Ø del que pide la tabla:
 *   - `aparato`: le vierte directamente un aparato con ese desagüe (Tabla 4.1);
 *   - `aguas_arriba`: un tramo que le vierte es mayor. Si ese tramo, a su vez,
 *     lo tiene por un aparato, `aparato` dice cuál (el inodoro que sube el
 *     ramal sube también la bajante).
 */
export type ElevacionDiametro =
  | { causa: "aparato"; aparato: TipoAparato; diametroMin_mm: number }
  | { causa: "aguas_arriba"; tramos: string[]; diametroMin_mm: number; aparato: TipoAparato | null };

/**
 * Columna de la Tabla 4.4 con que se dimensiona una bajante: «hasta 3» o «más
 * de 3 plantas» o, si su altura es ambigua, la envolvente de las dos.
 */
export type ColumnaTabla44 = "hasta3" | "mas3" | "envolvente";

/** Las dos comprobaciones de una bajante (Tabla 4.4). */
export interface DetalleBajante {
  /** Plantas que desaguan en la bajante. */
  plantas: number;
  /** Plantas que atraviesa hasta el colector. */
  plantasAtravesadas: number;
  /** Columna con que se ha entrado en la tabla. */
  columna: ColumnaTabla44;
  /** UD del ramal más cargado que acomete a la bajante. */
  udMaxRamal: number;
  /** Ø por las UD totales y su capacidad. */
  porTotal: { diametro_mm: number; capacidad_ud: number } | null;
  /** Ø por las UD del ramal más cargado y su capacidad de ramal. */
  porRamal: { diametro_mm: number; capacidad_ud: number } | null;
}

/** Resultado por aparato (Tabla 4.1): UD y Ø mín. del sifón/derivación. */
export interface ResultadoAparato {
  id: string;
  tipo: TipoAparato;
  tramoId: string;
  /** UD del aparato según uso (privado/público). */
  ud: number;
  /** Ø mín. del sifón/derivación individual [mm] (`null` si no contemplado). */
  diametroMin_mm: number | null;
  /** `true` si es un "cuarto" agrupado (no se desglosa). */
  agrupado: boolean;
  cumple: boolean;
  estado: Veredicto;
}

/** Modo de ventilación secundaria elegido según nº de plantas. */
export type ModoVentSecundaria = "no_requerida" | "alternas" | "cada_planta";

/** Sub-resultado del dimensionado de la ventilación de red (primaria/sec/terc). */
export interface ResultadoVentilacion {
  /** Ventilación primaria (prolongación de la bajante sobre cubierta). */
  primaria: {
    /** `true` si la primaria basta por sí sola (< 7 plantas). */
    suficienteSola: boolean;
    /** Prolongación mínima sobre cubierta exigida [m]. */
    prolongacionMin_m: number;
    estado: Veredicto;
    aviso: string;
  };
  /** Ventilación secundaria (columna paralela a la bajante). */
  secundaria: {
    modo: ModoVentSecundaria;
    /** Ø de la columna de ventilación dimensionado [mm] (`null` si no requerida). */
    diametroColumna_mm: number | null;
    /**
     * Longitud de la columna con que se ha entrado en la Tabla 4.10 [m]: la
     * altura de las plantas a 3 m cada una (criterio, el motor no conoce el
     * trazado). `null` si no se ha usado la tabla.
     */
    longitudSupuesta_m: number | null;
    estado: Veredicto;
    aviso: string;
  };
  /** Ventilación terciaria (de ramales largos). */
  terciaria: {
    /** `true` si es obligatoria (ramales > 5 m o > 14 plantas). */
    obligatoria: boolean;
    /** Ids de los ramales que la disparan por longitud. */
    ramalesAfectados: string[];
    estado: Veredicto;
    aviso: string;
  };
  /** Veredicto agregado de la ventilación (dimensionado → `neutral`). */
  estado: Veredicto;
}

export interface HS5Result {
  uso: UsoAparato;
  numPlantas: number;
  /** `true` si el grafo de tramos es un árbol válido (sin ciclos ni huérfanos). */
  arbolValido: boolean;
  /** Verificación por aparato (Tabla 4.1). */
  porAparato: ResultadoAparato[];
  /** Tramos dimensionados, en orden topológico (hojas → raíz). */
  porTramo: ResultadoTramo[];
  /** UD totales que llegan a los tramos raíz (acometida). */
  udTotales: number;
  /** Ventilación de red (primaria / secundaria / terciaria). */
  ventilacion: ResultadoVentilacion;
  /** Peor veredicto de las verificaciones REALES (la ventilación es neutral). */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos (mensajes en español, sin Zod). */
  warnings: string[];
}

// -----------------------------------------------------------------------------
// DEFAULTS — vivienda realista (uso privado): baño completo + aseo + cocina.
//   El baño completo (lavabo+inodoro+bañera+bidé) y el aseo (lavabo+inodoro+
//   ducha) entran como "cuartos" agrupados de la Tabla 4.1 (no se desglosan).
//   La cocina lleva fregadero + lavavajillas + lavadora.
//   Topología: cada estancia tiene su ramal → bajante única → colector enterrado.
// -----------------------------------------------------------------------------
export const hs5Defaults: HS5Inputs = {
  uso: "privado",
  numPlantas: 1,
  cubiertaTransitable: false,
  aparatos: [
    { id: "bano-completo", tipo: "cuarto_bano_cisterna", tramoId: "ramal-bano" },
    { id: "aseo", tipo: "cuarto_aseo_cisterna", tramoId: "ramal-aseo" },
    { id: "fregadero", tipo: "fregadero_cocina", tramoId: "ramal-cocina" },
    { id: "lavavajillas", tipo: "lavavajillas", tramoId: "ramal-cocina" },
    { id: "lavadora", tipo: "lavadora", tramoId: "ramal-cocina" },
  ],
  tramos: [
    { id: "ramal-bano", tipo: "ramal", parentId: "bajante", pendiente_pct: 2, longitud_m: 2 },
    { id: "ramal-aseo", tipo: "ramal", parentId: "bajante", pendiente_pct: 2, longitud_m: 2 },
    { id: "ramal-cocina", tipo: "ramal", parentId: "bajante", pendiente_pct: 2, longitud_m: 3 },
    { id: "bajante", tipo: "bajante", parentId: "colector" },
    { id: "colector", tipo: "colector", parentId: null, pendiente_pct: 2, disposicion: "enterrado" },
  ],
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/** UD de un aparato según uso (privado/público). `null` = no contemplado. */
export function udDeAparato(tipo: TipoAparato, uso: UsoAparato): number | null {
  const fila = APARATOS_4_1[tipo];
  return uso === "privado" ? fila.ud_privado : fila.ud_publico;
}

/**
 * Altura por planta con que se estima la longitud de la columna de ventilación
 * secundaria para la Tabla 4.10 [m]. CRITERIO de predimensionado, no cifra del
 * DB: el motor no conoce el trazado real.
 */
const ALTURA_PLANTA_VENT_M = 3;

/** Pendiente por defecto de un tramo según su tipo. */
function pendienteEfectiva(t: TramoInput): number {
  if (t.tipo === "bajante") return 0; // vertical
  if (Number.isFinite(t.pendiente_pct) && (t.pendiente_pct as number) > 0) {
    return t.pendiente_pct as number;
  }
  return 2; // 2 % por defecto (ramales/colectores)
}

/** Altura de una bajante en plantas: la suya si la trae, si no la de la red (≥ 1). */
function plantasDeTramo(t: TramoInput, numPlantas: number): number {
  const p = t.tipo === "bajante" && t.plantas !== undefined ? t.plantas : numPlantas;
  return Number.isFinite(p) ? Math.max(1, Math.trunc(p)) : 1;
}

/** Plantas que atraviesa una bajante (≥ las que sirve). */
function plantasAtravesadasDe(t: TramoInput, servidas: number): number {
  const a = t.plantasAtravesadas;
  return a !== undefined && Number.isFinite(a) ? Math.max(servidas, Math.trunc(a)) : servidas;
}

/** Columna de la Tabla 4.4: la de su altura o, si es ambigua, la envolvente. */
function columnaTabla44(servidas: number, atravesadas: number): ColumnaTabla44 {
  const umbral = BAJANTES_TABLA_4_4.datos.umbralPlantas;
  const a = servidas > umbral;
  const b = atravesadas > umbral;
  if (a !== b) return "envolvente";
  return a ? "mas3" : "hasta3";
}

/** Capacidad de una fila de la Tabla 4.4 en una columna (bajante o ramal). */
function capacidadTabla44(f: FilaBajante4_4, columna: ColumnaTabla44, modo: "bajante" | "ramal"): number {
  const h = modo === "bajante" ? f.bajanteHasta3 : f.ramalHasta3;
  const m = modo === "bajante" ? f.bajanteMas3 : f.ramalMas3;
  return columna === "hasta3" ? h : columna === "mas3" ? m : Math.min(h, m);
}

/**
 * Elevación por un tramo de aguas arriba: los hijos que alcanzan el Ø mínimo y,
 * si alguno lo tiene a su vez por un aparato, ese aparato (el inodoro que sube
 * el ramal es también el que sube la bajante).
 */
function elevacionAguasArriba(
  hijos: readonly string[],
  resultados: ReadonlyMap<string, ResultadoTramo>,
  diametroMin_mm: number,
): ElevacionDiametro {
  const mayores = hijos
    .map((c) => resultados.get(c))
    .filter((r): r is ResultadoTramo => r !== undefined && r.diametro_mm === diametroMin_mm);
  let aparato: TipoAparato | null = null;
  for (const r of mayores) {
    if (r.elevadoPor?.aparato) {
      aparato = r.elevadoPor.aparato;
      break;
    }
  }
  return { causa: "aguas_arriba", tramos: mayores.map((r) => r.id), diametroMin_mm, aparato };
}

/**
 * Ø tabulado inmediatamente menor que `diametro_mm` en la tabla del tramo, con
 * lo que admitiría (a su pendiente o en su columna). `null` si es el menor.
 */
function diametroAnterior(
  t: TramoInput,
  diametro_mm: number,
  pendiente_pct: number,
  columna: ColumnaTabla44,
): { diametro_mm: number; capacidad_ud: number | null } | null {
  if (t.tipo === "bajante") {
    const menores = BAJANTES_TABLA_4_4.datos.filas.filter((f) => f.diametro_mm < diametro_mm);
    const f = menores[menores.length - 1];
    return f ? { diametro_mm: f.diametro_mm, capacidad_ud: capacidadTabla44(f, columna, "bajante") } : null;
  }
  const filas =
    t.tipo === "ramal" ? RAMALES_COLECTORES_TABLA_4_3.datos.filas : COLECTORES_TABLA_4_5.datos.filas;
  const menores = filas.filter((f) => f.diametro_mm < diametro_mm);
  const f = menores[menores.length - 1];
  return f ? { diametro_mm: f.diametro_mm, capacidad_ud: capacidadAPendiente(f, pendiente_pct) } : null;
}

// -----------------------------------------------------------------------------
// MOTOR
// -----------------------------------------------------------------------------

export function calcHS5(inp: HS5Inputs): HS5Result {
  const warnings: string[] = [];

  // ===========================================================================
  // 1. Validación del grafo y construcción del árbol (kernel compartido).
  //    Regla estricta: una sola raíz (el colector/acometida). El árbol queda
  //    `arbolValido=false` ante id duplicado, ciclo, huérfano o multi-raíz.
  // ===========================================================================
  const tramoPorId = new Map<string, TramoInput>();
  for (const t of inp.tramos) {
    if (!tramoPorId.has(t.id)) tramoPorId.set(t.id, t);
  }

  const arbol = validarArbol(inp.tramos);
  const { childrenIds, orden } = arbol;
  const arbolValido = arbol.arbolValido;
  warnings.push(...arbol.warnings);

  // ===========================================================================
  // 2. UD por aparato (Tabla 4.1) y agregación de UD propias a cada tramo.
  // ===========================================================================
  const t41 = UD_APARATOS_TABLA_4_1.datos;
  const porAparato: ResultadoAparato[] = [];
  /** UD que cada aparato vierte directamente a su tramo. */
  const udPropiaTramo = new Map<string, number>();
  for (const id of tramoPorId.keys()) udPropiaTramo.set(id, 0);
  /** Mayor Ø mínimo de desagüe (Tabla 4.1) de los aparatos que vierten a cada tramo. */
  const diametroMinAparatosTramo = new Map<string, number>();
  /** El aparato que fija ese Ø mínimo (el primero, en orden de entrada). */
  const aparatoMinTramo = new Map<string, TipoAparato>();
  /** UD del aparato más cargado que vierte DIRECTAMENTE a cada tramo. */
  const udMaxAparatoTramo = new Map<string, number>();

  let veredictoAparatos: Veredicto = "neutral";

  for (const ap of inp.aparatos) {
    const fila = APARATOS_4_1[ap.tipo];
    const uso = ap.uso ?? inp.uso;
    const udRaw = udDeAparato(ap.tipo, uso);
    const diametroMin_mm =
      uso === "privado" ? fila.diametroMin_mm_privado : fila.diametroMin_mm_publico;

    let cumple = true;
    let estado: Veredicto = "ok";
    if (udRaw === null) {
      // El aparato no está contemplado para este uso: no aporta UD y avisa.
      cumple = false;
      estado = "fail";
      warnings.push(
        `El aparato "${ap.id}" (${ap.tipo}) no está contemplado para uso ${uso} (Tabla 4.1).`,
      );
    }
    const ud = udRaw ?? 0;

    // Aviso (no bloqueo) si la derivación individual supera 1,5 m.
    if (
      ap.longitudDerivacion_m !== undefined &&
      Number.isFinite(ap.longitudDerivacion_m) &&
      ap.longitudDerivacion_m > t41.longitudMaxDerivacion_m
    ) {
      warnings.push(
        `La derivación individual de "${ap.id}" (${ap.longitudDerivacion_m} m) supera ${t41.longitudMaxDerivacion_m} m: el Ø de la Tabla 4.1 puede no ser válido.`,
      );
    }

    if (!udPropiaTramo.has(ap.tramoId)) {
      warnings.push(`El aparato "${ap.id}" descarga a un tramo inexistente "${ap.tramoId}".`);
      cumple = false;
      estado = peor(estado, "fail");
    } else {
      udPropiaTramo.set(ap.tramoId, udPropiaTramo.get(ap.tramoId)! + ud);
      if (diametroMin_mm != null && diametroMin_mm > (diametroMinAparatosTramo.get(ap.tramoId) ?? 0)) {
        diametroMinAparatosTramo.set(ap.tramoId, diametroMin_mm);
        aparatoMinTramo.set(ap.tramoId, ap.tipo);
      }
      if (ud > (udMaxAparatoTramo.get(ap.tramoId) ?? 0)) udMaxAparatoTramo.set(ap.tramoId, ud);
    }

    veredictoAparatos = peor(veredictoAparatos, estado);
    porAparato.push({
      id: ap.id,
      tipo: ap.tipo,
      tramoId: ap.tramoId,
      ud,
      diametroMin_mm,
      agrupado: !!fila.agrupado,
      cumple,
      estado,
    });
  }

  // ===========================================================================
  // 3. UD acumuladas aguas abajo (recorrido topológico: hojas → raíz).
  //    El `orden` post-orden y los hijos vienen del kernel (determinista). La
  //    acumulación es la suma genérica parametrizada por las UD propias del tramo.
  // ===========================================================================
  const udAcum = acumularAguasAbajo(orden, childrenIds, (id) => udPropiaTramo.get(id) ?? 0);

  // ===========================================================================
  // 4. Dimensionado por tramo + Ø no decreciente en el sentido del flujo.
  //    Se recorre en post-orden: los hijos ya están dimensionados. El mínimo
  //    sale de los hijos y del desagüe de los aparatos que vierten al tramo
  //    (Tabla 4.1), y se lleva al primer Ø tabulado que lo alcanza.
  // ===========================================================================
  const resultadoPorId = new Map<string, ResultadoTramo>();
  let veredictoTramos: Veredicto = "neutral";

  for (const id of orden) {
    const t = tramoPorId.get(id)!;
    const ud = udAcum.get(id) ?? 0;
    const pendiente_pct = pendienteEfectiva(t);
    const plantas = plantasDeTramo(t, inp.numPlantas);
    const atravesadas = plantasAtravesadasDe(t, plantas);
    const columna = columnaTabla44(plantas, atravesadas);

    let diametroMinPorHijos_mm = 0;
    /** UD del ramal más cargado que acomete (solo cuenta en bajantes). */
    let udMaxRamal = udMaxAparatoTramo.get(id) ?? 0;
    for (const c of childrenIds.get(id) ?? []) {
      const rc = resultadoPorId.get(c);
      if (rc?.diametro_mm != null) {
        diametroMinPorHijos_mm = Math.max(diametroMinPorHijos_mm, rc.diametro_mm);
      }
      if (rc && rc.tipo !== "bajante") udMaxRamal = Math.max(udMaxRamal, rc.udAcumuladas);
    }
    const diametroMinPorAparatos_mm = diametroMinAparatosTramo.get(id) ?? 0;
    const diametroMinPorAguasArriba_mm = Math.max(diametroMinPorHijos_mm, diametroMinPorAparatos_mm);

    const dim = dimensionarTramo(t, ud, pendiente_pct, { plantas, atravesadas, columna }, udMaxRamal, warnings);

    // Si la tabla da un Ø menor que el mínimo de aguas arriba, se eleva al
    // primer Ø tabulado que lo alcanza (Ø100 de un inodoro → Ø110).
    let diametro_mm = dim.diametro_mm;
    let capacidad_ud = dim.capacidad_ud;
    let motivo = dim.motivo;
    let elevadoPor: ElevacionDiametro | null = null;
    if (diametroMinPorAguasArriba_mm > 0 && (diametro_mm == null || diametro_mm < diametroMinPorAguasArriba_mm)) {
      const elevado = elevarADiametroTabulado(t, diametroMinPorAguasArriba_mm, pendiente_pct, columna);
      const porAparato = diametroMinPorAparatos_mm >= diametroMinPorHijos_mm;
      if (dim.diametro_mm != null) {
        diametro_mm = elevado.diametro_mm;
        capacidad_ud = elevado.capacidad_ud;
        motivo += porAparato
          ? ` · Ø elevado a ${diametro_mm} mm: le vierte un aparato con desagüe Ø${diametroMinPorAparatos_mm} (Tabla 4.1) y el Ø no disminuye en el sentido del flujo.`
          : ` · Ø elevado a ${diametro_mm} mm por monotonía aguas abajo.`;
        elevadoPor = porAparato
          ? { causa: "aparato", aparato: aparatoMinTramo.get(id)!, diametroMin_mm: diametroMinPorAparatos_mm }
          : elevacionAguasArriba(childrenIds.get(id) ?? [], resultadoPorId, diametroMinPorHijos_mm);
      } else {
        // No se pudo dimensionar por capacidad, pero al menos respeta aguas arriba.
        diametro_mm = elevado.diametro_mm;
      }
    }

    const estado = dim.estado;
    veredictoTramos = peor(veredictoTramos, estado);

    resultadoPorId.set(id, {
      id,
      tipo: t.tipo,
      parentId: t.parentId,
      childrenIds: [...(childrenIds.get(id) ?? [])],
      udAcumuladas: ud,
      pendiente_pct,
      diametro_mm,
      diametroMinPorAguasArriba_mm,
      capacidad_ud,
      cumple: dim.cumple,
      estado,
      motivo,
      diametroPorCapacidad_mm: dim.diametro_mm,
      elevadoPor,
      alternativa: diametro_mm == null ? null : diametroAnterior(t, diametro_mm, pendiente_pct, columna),
      bajante: dim.bajante ?? null,
    });
  }

  const porTramo: ResultadoTramo[] = orden.map((id) => resultadoPorId.get(id)!);
  const udTotales = inp.tramos
    .filter((t) => t.parentId === null)
    .reduce((acc, t) => acc + (udAcum.get(t.id) ?? 0), 0);

  // ===========================================================================
  // 5. Ventilación de red (primaria / secundaria / terciaria).
  // ===========================================================================
  const ventilacion = dimensionarVentilacion(inp, porTramo, warnings);

  // ===========================================================================
  // 6. Veredicto global: peor de las verificaciones REALES.
  //    La ventilación es dimensionado (`neutral`): no degrada el global.
  // ===========================================================================
  let veredictoGlobal: Veredicto = "ok";
  if (!arbolValido) veredictoGlobal = peor(veredictoGlobal, "fail");
  veredictoGlobal = peor(veredictoGlobal, veredictoAparatos);
  veredictoGlobal = peor(veredictoGlobal, veredictoTramos);

  return {
    uso: inp.uso,
    numPlantas: inp.numPlantas,
    arbolValido,
    porAparato,
    porTramo,
    udTotales,
    ventilacion,
    veredictoGlobal,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Dimensionado de un tramo por su tabla (4.3 ramal / 4.4 bajante / 4.5 colector).
// Devuelve el Ø de tabla (antes de aplicar la monotonía aguas abajo).
// -----------------------------------------------------------------------------
interface DimTramo {
  diametro_mm: number | null;
  capacidad_ud: number | null;
  cumple: boolean;
  estado: Veredicto;
  motivo: string;
  bajante?: DetalleBajante;
}

function dimensionarTramo(
  t: TramoInput,
  ud: number,
  pendiente_pct: number,
  altura: { plantas: number; atravesadas: number; columna: ColumnaTabla44 },
  udMaxRamal: number,
  warnings: string[],
): DimTramo {
  switch (t.tipo) {
    case "ramal":
      return dimensionarRamal(t, ud, pendiente_pct, warnings);
    case "bajante":
      return dimensionarBajante(t, ud, altura, udMaxRamal, warnings);
    case "colector":
      return dimensionarColector(t, ud, pendiente_pct, warnings);
  }
}

/**
 * Primer Ø de la tabla del tramo (4.3 / 4.4 / 4.5) que alcanza `minimo_mm`, con
 * su capacidad. Si ninguno lo alcanza se devuelve el propio mínimo sin capacidad.
 */
function elevarADiametroTabulado(
  t: TramoInput,
  minimo_mm: number,
  pendiente_pct: number,
  columna: ColumnaTabla44,
): { diametro_mm: number; capacidad_ud: number | null } {
  if (t.tipo === "bajante") {
    const fila = BAJANTES_TABLA_4_4.datos.filas.find((f) => f.diametro_mm >= minimo_mm);
    if (!fila) return { diametro_mm: minimo_mm, capacidad_ud: null };
    return { diametro_mm: fila.diametro_mm, capacidad_ud: capacidadTabla44(fila, columna, "bajante") };
  }
  const filas =
    t.tipo === "ramal" ? RAMALES_COLECTORES_TABLA_4_3.datos.filas : COLECTORES_TABLA_4_5.datos.filas;
  const fila = filas.find((f) => f.diametro_mm >= minimo_mm);
  if (!fila) return { diametro_mm: minimo_mm, capacidad_ud: null };
  return { diametro_mm: fila.diametro_mm, capacidad_ud: capacidadAPendiente(fila, pendiente_pct) };
}

/** Ramal colector entre aparatos y bajante (Tabla 4.3). */
function dimensionarRamal(
  t: TramoInput,
  ud: number,
  pendiente_pct: number,
  warnings: string[],
): DimTramo {
  const filas = RAMALES_COLECTORES_TABLA_4_3.datos.filas;
  if (pendiente_pct < 2 && pendiente_pct >= 1) {
    // Pendiente 1 % sólo admitida desde Ø90: el lookup ya lo refleja (p1 null
    // por debajo de Ø90). Aviso informativo.
    warnings.push(
      `Ramal "${t.id}" con pendiente ${pendiente_pct} %: la pendiente 1 % sólo se admite desde Ø90 (Tabla 4.3).`,
    );
  }
  const sel = seleccionarDiametroPorPendiente(filas, ud, pendiente_pct);
  if (sel === null) {
    warnings.push(
      `Ramal "${t.id}" con ${ud} UD a ${pendiente_pct} % excede la capacidad de la Tabla 4.3: no se pudo dimensionar.`,
    );
    return {
      diametro_mm: null,
      capacidad_ud: null,
      cumple: false,
      estado: "fail",
      motivo: `Ramal: ${ud} UD a ${pendiente_pct} % sin Ø admisible en Tabla 4.3.`,
    };
  }
  return {
    diametro_mm: sel.diametro_mm,
    capacidad_ud: sel.capacidad_ud,
    cumple: true,
    estado: "ok",
    motivo: `Ramal colector (Tabla 4.3): ${ud} UD a ${pendiente_pct} % → Ø${sel.diametro_mm} (cap. ${sel.capacidad_ud} UD).`,
  };
}

/**
 * Bajante (Tabla 4.4): el Ø es el MAYOR de los dos obtenidos por (UD total en la
 * bajante) y (UD máx en un solo ramal de planta), según su altura en plantas.
 * `udMaxRamal` es la medida: las UD del ramal (o aparato) más cargado que
 * acomete a la bajante (feature-14; antes se estimaba como UD total / plantas).
 */
function dimensionarBajante(
  t: TramoInput,
  ud: number,
  altura: { plantas: number; atravesadas: number; columna: ColumnaTabla44 },
  udMaxRamal: number,
  warnings: string[],
): DimTramo {
  const filas = BAJANTES_TABLA_4_4.datos.filas;
  const { plantas, atravesadas, columna } = altura;

  // Ø por UD total en la bajante.
  const porBajante = primerDiametroBajante(filas, ud, columna, "bajante");
  // Ø por UD máx en un ramal de planta.
  const porRamal = primerDiametroBajante(filas, udMaxRamal, columna, "ramal");
  const bajante: DetalleBajante = {
    plantas,
    plantasAtravesadas: atravesadas,
    columna,
    udMaxRamal,
    porTotal: porBajante,
    porRamal,
  };

  if (porBajante === null || porRamal === null) {
    warnings.push(
      `Bajante "${t.id}" con ${ud} UD (${plantas} plantas) excede la Tabla 4.4: no se pudo dimensionar.`,
    );
    return {
      diametro_mm: null,
      capacidad_ud: null,
      cumple: false,
      estado: "fail",
      motivo: `Bajante: ${ud} UD (${plantas} plantas) sin Ø admisible en Tabla 4.4.`,
      bajante,
    };
  }

  // El Ø de la bajante = el MAYOR de los dos.
  const diametro_mm = Math.max(porBajante.diametro_mm, porRamal.diametro_mm);
  const filaElegida = filas.find((f) => f.diametro_mm === diametro_mm)!;
  const capacidad_ud = capacidadTabla44(filaElegida, columna, "bajante");

  return {
    diametro_mm,
    capacidad_ud,
    cumple: true,
    estado: "ok",
    motivo:
      `Bajante (Tabla 4.4): mayor de Ø por UD total (${porBajante.diametro_mm}) y ` +
      `Ø por UD/ramal de planta (${porRamal.diametro_mm}) con ${plantas} planta(s) → Ø${diametro_mm}.`,
    bajante,
  };
}

/** Primer Ø de la Tabla 4.4 cuya capacidad (bajante o ramal) cubre `ud`. */
function primerDiametroBajante(
  filas: readonly FilaBajante4_4[],
  ud: number,
  columna: ColumnaTabla44,
  modo: "bajante" | "ramal",
): { diametro_mm: number; capacidad_ud: number } | null {
  for (const f of filas) {
    const cap = capacidadTabla44(f, columna, modo);
    if (ud <= cap) return { diametro_mm: f.diametro_mm, capacidad_ud: cap };
  }
  return null;
}

/** Colector horizontal (Tabla 4.5) con su pendiente mínima por disposición. */
function dimensionarColector(
  t: TramoInput,
  ud: number,
  pendiente_pct: number,
  warnings: string[],
): DimTramo {
  const tabla = COLECTORES_TABLA_4_5.datos;
  const disposicion: DisposicionColector = t.disposicion ?? "enterrado";
  const pendienteMin =
    disposicion === "colgado" ? tabla.pendienteMinColgado_pct : tabla.pendienteMinEnterrado_pct;
  if (pendiente_pct < pendienteMin) {
    warnings.push(
      `Colector "${t.id}" (${disposicion}) con pendiente ${pendiente_pct} % por debajo del mínimo ${pendienteMin} % (Tabla 4.5).`,
    );
  }
  const sel = seleccionarDiametroPorPendiente(tabla.filas, ud, pendiente_pct);
  if (sel === null) {
    warnings.push(
      `Colector "${t.id}" con ${ud} UD a ${pendiente_pct} % excede la capacidad de la Tabla 4.5: no se pudo dimensionar.`,
    );
    return {
      diametro_mm: null,
      capacidad_ud: null,
      cumple: false,
      estado: "fail",
      motivo: `Colector: ${ud} UD a ${pendiente_pct} % sin Ø admisible en Tabla 4.5.`,
    };
  }
  return {
    diametro_mm: sel.diametro_mm,
    capacidad_ud: sel.capacidad_ud,
    cumple: true,
    estado: "ok",
    motivo: `Colector horizontal ${disposicion} (Tabla 4.5): ${ud} UD a ${pendiente_pct} % → Ø${sel.diametro_mm} (cap. ${sel.capacidad_ud} UD).`,
  };
}

// -----------------------------------------------------------------------------
// Ventilación de red — dimensionado (resultado neutral, no degrada el global).
// -----------------------------------------------------------------------------
function dimensionarVentilacion(
  inp: HS5Inputs,
  porTramo: ResultadoTramo[],
  warnings: string[],
): ResultadoVentilacion {
  const numPlantas = Math.max(1, Math.trunc(inp.numPlantas));
  const vp = VENT_PRIMARIA.datos;
  const vs = VENT_SECUNDARIA.datos;
  const vt = VENT_TERCIARIA.datos;
  const t411 = VENT_SECUNDARIA_CADA_PLANTA_TABLA_4_11.datos;

  // Ø de la bajante de mayor diámetro (referencia para la columna de ventilación)
  // y las UD de la más cargada de ese Ø (escalón de la Tabla 4.10).
  const bajantes = porTramo.filter((r) => r.tipo === "bajante" && r.diametro_mm != null);
  const diametroBajante_mm = bajantes.reduce((mx, r) => Math.max(mx, r.diametro_mm as number), 0);
  const udBajante = bajantes
    .filter((r) => r.diametro_mm === diametroBajante_mm)
    .reduce((mx, r) => Math.max(mx, r.udAcumuladas), 0);

  // --- Primaria -----------------------------------------------------------
  const suficienteSola = numPlantas < vp.maxPlantasSolo;
  const prolongacionMin_m = inp.cubiertaTransitable
    ? vp.prolongacionTransitableMin_m
    : vp.prolongacionNoTransitableMin_m;
  const primaria = {
    suficienteSola,
    prolongacionMin_m,
    estado: "neutral" as Veredicto,
    aviso:
      `Ventilación primaria = prolongación de la bajante (Ø${diametroBajante_mm || "?"} mm) ` +
      `≥ ${prolongacionMin_m} m sobre cubierta ${inp.cubiertaTransitable ? "transitable" : "no transitable"}` +
      (suficienteSola
        ? ` (suficiente por sí sola, < ${vp.maxPlantasSolo} plantas).`
        : ` (se requiere además ventilación secundaria, ≥ ${vp.maxPlantasSolo} plantas).`),
  };

  // --- Secundaria ---------------------------------------------------------
  let modo: ModoVentSecundaria = "no_requerida";
  let diametroColumna_mm: number | null = null;
  let longitudSupuesta_m: number | null = null;
  let avisoSec: string;
  if (numPlantas >= vs.minPlantasObligatoria || inp.ventilacionSecundaria === true) {
    modo = numPlantas < vs.umbralCadaPlanta ? "alternas" : "cada_planta";
    if (modo === "cada_planta") {
      // Tabla 4.11: Ø columna por Ø de bajante.
      diametroColumna_mm = t411.porDiametroBajante[diametroBajante_mm] ?? null;
      if (diametroColumna_mm === null && diametroBajante_mm > 0) {
        warnings.push(
          `Ventilación secundaria (cada planta): Ø de bajante ${diametroBajante_mm} mm no tabulado en la Tabla 4.11.`,
        );
      }
    } else {
      // Plantas alternas (ap. 4.4.2 ptos 4 y 5): el Ø sale de la Tabla 4.10 por
      // Ø de bajante, escalón de UD (el primero ≥, sin interpolar) y longitud
      // efectiva, y además debe ser ≥ ½ Ø de la bajante. Nunca ½ Ø a secas
      // (verificación de feature-14 §E1: «Ø55» no es un Ø de la tabla).
      longitudSupuesta_m = numPlantas * ALTURA_PLANTA_VENT_M;
      const fila = VENT_SECUNDARIA_ALTERNAS_TABLA_4_10.datos.filas.find(
        (f) => f.diametroBajante_mm === diametroBajante_mm && f.udEscalon >= udBajante,
      );
      const minimo = diametroBajante_mm * vs.fraccionMinDiametroBajante;
      const L = longitudSupuesta_m;
      diametroColumna_mm =
        (fila &&
          DIAMETROS_VENT_4_10.find(
            (d) => d >= minimo && fila.longitudMax_m[d] !== undefined && fila.longitudMax_m[d] >= L,
          )) ??
        null;
      if (diametroColumna_mm === null && diametroBajante_mm > 0) {
        warnings.push(
          `Ventilación secundaria (plantas alternas): bajante Ø${diametroBajante_mm} con ${udBajante} UD y ${L} m fuera de la Tabla 4.10.`,
        );
      }
    }
    avisoSec =
      `Ventilación secundaria ${numPlantas >= vs.minPlantasObligatoria ? "obligatoria" : "dispuesta por el proyectista"} (${numPlantas} ${numPlantas >= vs.minPlantasObligatoria ? "≥" : "<"} ${vs.minPlantasObligatoria} plantas), ` +
      `conexiones ${modo === "alternas" ? "en plantas alternas (Tabla 4.10)" : "en cada planta (Tabla 4.11)"}; ` +
      `Ø columna ${diametroColumna_mm ?? "?"} mm (≥ ½ Ø bajante ${diametroBajante_mm} mm).`;
  } else {
    avisoSec = `Ventilación secundaria no requerida (< ${vs.minPlantasObligatoria} plantas).`;
  }
  const secundaria = {
    modo,
    diametroColumna_mm,
    longitudSupuesta_m,
    estado: "neutral" as Veredicto,
    aviso: avisoSec,
  };

  // --- Terciaria ----------------------------------------------------------
  const ramalesAfectados = porTramo
    .filter((r) => r.tipo === "ramal")
    .filter((r) => {
      const t = inp.tramos.find((x) => x.id === r.id);
      return (
        t?.longitud_m !== undefined &&
        Number.isFinite(t.longitud_m) &&
        (t.longitud_m as number) > vt.longitudRamalObligatoria_m
      );
    })
    .map((r) => r.id);
  const obligatoria = ramalesAfectados.length > 0 || numPlantas > vt.maxPlantasSinTerciaria;
  const terciaria = {
    obligatoria,
    ramalesAfectados,
    estado: "neutral" as Veredicto,
    aviso: obligatoria
      ? `Ventilación terciaria obligatoria (ramales > ${vt.longitudRamalObligatoria_m} m o > ${vt.maxPlantasSinTerciaria} plantas); long. máx por Tabla 4.12.`
      : `Ventilación terciaria no requerida (ramales ≤ ${vt.longitudRamalObligatoria_m} m y ≤ ${vt.maxPlantasSinTerciaria} plantas).`,
  };

  // Nota: SIFONES y las tablas 4.10/4.12 quedan disponibles para verificaciones
  // de detalle (cierre hidráulico, longitud efectiva) que la UI puede activar.
  void SIFONES;
  void VENT_TERCIARIA_TABLA_4_12;

  return {
    primaria,
    secundaria,
    terciaria,
    estado: "neutral",
  };
}
