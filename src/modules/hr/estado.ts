// =============================================================================
// DB-HR — Lo que guarda el módulo (feature-25): las soluciones constructivas que
// El edificio no describe. La fachada, la ventana, la cubierta y el forjado se
// eligen en El edificio (feature-26, `edificio.cerramientos`): HR los lee de
// allí, y sus valores propios se guardan en esa misma elección. Cada una es una solución del Catálogo (`catalogo.ts`)
// con, si el proyectista quiere, sus valores propios (los de su ensayo o su
// fabricante). Solo tipos y valores por defecto.
//
// Lo habitual (criterio, research/verificacion-hr.md y verificacion-hr-cec.md):
// tabiquería de LHD con bandas elásticas; entre viviendas, la de dos hojas de
// ½ pie y LH con bandas (P3.2, tipo 2), que cumple la tabla 3.2 con fábrica sin
// trasdosado; hacia un recinto de actividad o de instalaciones, hormigón de
// 16 cm con trasdosado autoportante; suelo flotante de mortero sobre
// polietileno; techo suspendido con lana en el local o el garaje; caja de
// persiana CP1.
// =============================================================================

import type { Capialzado } from "../../lib/constructivo/catalogo";
import type { Eleccion, ParametroAcustico } from "../../lib/constructivo/tipos";

export type { Eleccion };

/** Un valor propio que sustituye al del Catálogo. */
export type ParametroHr = ParametroAcustico;

export type ModoAscensor = "hueco" | "cuarto";

export type HrEstado = {
  /**
   * Qué linda con qué (K-HR.16), por la clave de cada colindancia deducida de El
   * edificio (`edificio.ts`): false, no linda; sin clave, se supone que sí.
   */
  colindancias: Record<string, boolean>;
  /** Valores medios del Catálogo en lugar de los mínimos (K-CEC.1). */
  medios: boolean;
  tabiqueria: Eleccion;
  /** La tabiquería de fábrica: con apoyo directo o con bandas elásticas (o sobre el suelo flotante). */
  apoyo: "directo" | "bandas";
  /** Entre unidades de uso y con la zona común (tabla 3.2 sin paréntesis). */
  separacion: Eleccion;
  trasdosado: Eleccion | null;
  unaCara: boolean;
  /** Con un recinto de actividad o de instalaciones (tabla 3.2 entre paréntesis). */
  separacionActividad: Eleccion;
  trasdosadoActividad: Eleccion | null;
  unaCaraActividad: boolean;
  suelo: Eleccion;
  /** Techo suspendido entre viviendas (en la de abajo). */
  techo: Eleccion | null;
  /** Techo suspendido en el local, el garaje, el cuarto o el portal bajo las viviendas. */
  techoBajo: Eleccion | null;
  /** La fachada del recinto más desfavorable no está expuesta (patio cerrado, entorno tranquilo): Ld − 10. */
  noExpuesta: boolean;
  capialzado: Capialzado;
  /** % de huecos del dormitorio y de la estancia más desfavorables; null = supuesto. */
  huecosDormitorio: number | null;
  huecosEstancia: number | null;
  medianeria: Eleccion;
  /** La puerta de entrada de la vivienda abre a un vestíbulo (habitable) o a una estancia (protegido). */
  puertaAbre: "vestibulo" | "estancia";
  /** RA de la puerta de entrada; null = se declara el exigido. */
  puertaRA: number | null;
  /** Maquinaria del ascensor: en el hueco o en un cuarto; null = la de El edificio. */
  ascensor: ModoAscensor | null;
  /** Adosada: estructura compartida con las vecinas o independiente (Anejo I). */
  estructura: "compartida" | "independiente";
  /** Adosada con estructura independiente: cada una de las dos hojas. */
  hojaAdosada: Eleccion;
};

export const HUECOS_SUPUESTOS = { dormitorio: 20, estancia: 30 } as const;

export const hrEstadoDefaults: HrEstado = {
  colindancias: {},
  medios: false,
  tabiqueria: { id: "tab-lhd70-yeso" },
  apoyo: "bandas",
  separacion: { id: "sv2-lp115-lh-bandas" },
  trasdosado: null,
  unaCara: false,
  separacionActividad: { id: "sv-ha160" },
  trasdosadoActividad: { id: "tr-autoportante-pyl-lm" },
  unaCaraActividad: false,
  suelo: { id: "sf-mortero-per5" },
  techo: null,
  techoBajo: { id: "ts-pyl15-lm50-c100" },
  noExpuesta: false,
  capialzado: "cp1",
  huecosDormitorio: null,
  huecosEstancia: null,
  medianeria: { id: "sv-lp240-yeso" },
  puertaAbre: "vestibulo",
  puertaRA: null,
  ascensor: null,
  estructura: "compartida",
  hojaAdosada: { id: "sv-lp240-yeso" },
};

/** Un número válido y no negativo, o null. */
export function numero(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v >= 0 ? v : null;
}

/** Un valor propio de una elección, si lo hay. */
export function propio(e: Eleccion | null | undefined, k: ParametroHr): number | null {
  return numero(e?.valores?.[k]);
}

/** La elección tiene algún valor propio. */
export function conValoresPropios(e: Eleccion | null | undefined): boolean {
  return !!e?.valores && Object.values(e.valores).some((x) => numero(x) !== null);
}
