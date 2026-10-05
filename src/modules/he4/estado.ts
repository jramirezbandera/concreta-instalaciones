// =============================================================================
// DB-HE 4 — Lo que guarda el módulo (feature-22): con qué se produce el ACS (y,
// según el sistema, el SCOPdhw de la bomba de calor, la fracción solar y el
// apoyo, o el porcentaje renovable de la red urbana), si la producción es
// individual o centralizada, los ocupantes de las oficinas y las pérdidas
// térmicas. Cada decisión se guarda como «habitual» mientras coincida con lo
// habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-he4-he5.md «Decisiones de
// producto»): bomba de calor, producción individual en cada vivienda (como la
// decisión «Agua caliente» de HS 4) y, con solar, apoyo convencional.
// =============================================================================

/**
 * Cómo se produce el ACS: bomba de calor (aerotermia o geotermia), solar térmica
 * con un apoyo, caldera de biomasa o conexión a una red urbana de calor.
 */
export type Sistema = "bomba_calor" | "solar" | "biomasa" | "red";
/** El apoyo de la solar térmica: caldera o termo (no renovable), bomba de calor o biomasa. */
export type Apoyo = "convencional" | "bomba_calor" | "biomasa";
export type Produccion = "individual" | "centralizada";

export type Opcion<T> = T | "habitual";

export type He4Estado = {
  sistema: Opcion<Sistema>;
  produccion: Opcion<Produccion>;
  /** SCOPdhw de la bomba de calor (sistema o apoyo); null = el mínimo del ap. 3.1 pto 4, supuesto. */
  scop: number | null;
  /** Fracción solar anual del cálculo de la instalación [%]; null = la contribución exigida (objetivo). */
  fraccionSolar_pct: number | null;
  apoyo: Opcion<Apoyo>;
  /** Superficie de captadores solares térmicos en la cubierta [m²]: la lee HE 5 (Soc). */
  captadores_m2: number | null;
  /** Parte renovable de la energía de la red urbana [%] (fep,ren / fep,tot de la red). */
  renovableRed_pct: number | null;
  /** Ocupantes de las oficinas; null = uno por cada 10 m² útiles (SI 3, criterio). */
  ocupantesOficinas: number | null;
  /** Pérdidas de distribución, acumulación y recirculación [% de la demanda]; null = las del criterio. */
  perdidas_pct: number | null;
};

export const he4EstadoDefaults: He4Estado = {
  sistema: "habitual",
  produccion: "habitual",
  scop: null,
  fraccionSolar_pct: null,
  apoyo: "habitual",
  captadores_m2: null,
  renovableRed_pct: null,
  ocupantesOficinas: null,
  perdidas_pct: null,
};

export interface DecisionesHe4 {
  sistema: Sistema;
  produccion: Produccion;
  apoyo: Apoyo;
}

export const HABITUALES_HE4: DecisionesHe4 = { sistema: "bomba_calor", produccion: "individual", apoyo: "convencional" };

function resolver<T>(v: Opcion<T> | undefined, h: T): T {
  return v === "habitual" || v === undefined ? h : v;
}

export function resolverHe4(e: He4Estado): DecisionesHe4 {
  return {
    sistema: resolver(e.sistema, HABITUALES_HE4.sistema),
    produccion: resolver(e.produccion, HABITUALES_HE4.produccion),
    apoyo: resolver(e.apoyo, HABITUALES_HE4.apoyo),
  };
}

/** Un número válido y positivo, o null. */
export function positivo(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v > 0 ? v : null;
}
