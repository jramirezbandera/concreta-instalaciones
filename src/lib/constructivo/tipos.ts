// =============================================================================
// Los cerramientos del proyecto (feature-26): lo que se guarda en El edificio.
// Solo tipos y constantes, sin lógica (`cerramientos.ts`), para que el modelo
// del edificio los importe sin ciclos.
// =============================================================================

/** Un valor propio que sustituye al del Catálogo (los acústicos de HR). */
export type ParametroAcustico = "m" | "RA" | "dRA" | "dLw" | "RAtr";

/** Una solución elegida: la del Catálogo y, si se dan, valores propios. */
export interface Eleccion {
  id: string;
  valores?: Partial<Record<ParametroAcustico, number>>;
}

/**
 * El marco de la ventana: los siete del 3.16 del CEC, con las claves de su Uf
 * vertical (`UF_REFERENCIA_CEC` de HE1). Lo lee HE1; no cambia el RA,tr.
 */
export type Marco =
  | "pvc_tres_camaras"
  | "pvc_dos_camaras"
  | "madera_500kg_m3"
  | "madera_700kg_m3"
  | "metalico_rpt_mayor_12mm"
  | "metalico_rpt_4_12mm"
  | "metalico_sin_rpt";

/** La familia del marco en la Tabla 10 del DA DB-HE/1 (Ψ de la junta vidrio-marco). */
export type FamiliaPsi = "madera_plastico" | "metalico_con_rpt" | "metalico_sin_rpt";

export const MARCOS: Record<Marco, { nombre: string; familiaPsi: FamiliaPsi }> = {
  pvc_tres_camaras: { nombre: "PVC de tres cámaras", familiaPsi: "madera_plastico" },
  pvc_dos_camaras: { nombre: "PVC de dos cámaras", familiaPsi: "madera_plastico" },
  madera_500kg_m3: { nombre: "Madera de 500 kg/m³", familiaPsi: "madera_plastico" },
  madera_700kg_m3: { nombre: "Madera de 700 kg/m³", familiaPsi: "madera_plastico" },
  metalico_rpt_mayor_12mm: { nombre: "Metálico con RPT de más de 12 mm", familiaPsi: "metalico_con_rpt" },
  metalico_rpt_4_12mm: { nombre: "Metálico con RPT de 4 a 12 mm", familiaPsi: "metalico_con_rpt" },
  metalico_sin_rpt: { nombre: "Metálico sin RPT", familiaPsi: "metalico_sin_rpt" },
};

export type EleccionVentana = Eleccion & { marco: Marco };

/**
 * Los tipos de cerramiento del edificio. Lo normal es uno para todo el edificio
 * y, como mucho, la planta baja distinta (K-CER.1: la planta 0).
 */
export interface Cerramientos {
  /** La fachada general. */
  fachada: Eleccion;
  /** La de la planta baja; null = la misma. */
  fachadaPB: Eleccion | null;
  ventana: EleccionVentana;
  /** La de la planta baja; null = la misma. */
  ventanaPB: EleccionVentana | null;
  /** El paquete de cubierta; null = el habitual del tipo de cubierta. */
  cubierta: Eleccion | null;
  /**
   * La posición del aislante en la cubierta plana: el CEC da sus cubiertas
   * convencionales o invertidas (C 2.3, solo invertida; C 6.3, solo
   * convencional). Sin dar, invertida.
   */
  aislanteCubierta?: "invertida" | "convencional";
  /** El forjado de todas las plantas (y el soporte de la cubierta, K-CER.10). */
  forjado: Eleccion;
}
