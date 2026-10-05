// =============================================================================
// DB-HE 6 — Lo que guarda el módulo (feature-24): lo que El edificio no
// describe. Las plazas exteriores adscritas al edificio (las interiores son las
// de sus garajes; la plaza en la parcela de la unifamiliar, la de REBT), si es
// de la Administración General del Estado, las plazas accesibles si son más de
// las que pide SUA 9, las plazas con conducción y las estaciones que se
// instalan (las mínimas si no se dice), el esquema de conexión de la ITC-BT-52
// (lo lee también REBT) y la potencia de cada estación. Solo tipos.
//
// Lo habitual (criterio, research/verificacion-he6.md K-HE6.8 y K-HE6.9): el
// esquema colectivo (1a) en un edificio de viviendas, el de circuitos
// adicionales en el resto (4b, del cuadro del garaje; 4a en la unifamiliar), y
// estaciones de 3 680 W.
// =============================================================================

/**
 * Esquema de conexión de la ITC-BT-52 ap. 3: 1, colectivo o troncal con un
 * contador principal; 2, individual con un contador común para la vivienda y la
 * estación; 3, individual con un contador para cada estación; 4, con circuitos
 * adicionales para la recarga.
 */
export type Esquema = "1" | "2" | "3" | "4";

export type He6Estado = {
  /** Plazas exteriores adscritas al edificio, de automóvil (no en la unifamiliar). */
  plazasExteriores: number;
  /** El edificio es de la Administración General del Estado o de sus organismos (una estación cada 20). */
  age: boolean;
  /** Plazas accesibles; null = las que pide SUA 9. */
  plazasAccesibles: number | null;
  /** Plazas con sistema de conducción de cables; null = las mínimas. */
  plazasConduccion: number | null;
  /** Estaciones de recarga instaladas; null = las mínimas. */
  estaciones: number | null;
  /** Esquema de conexión; «habitual» = el del uso. */
  esquema: Esquema | "habitual";
  /** Potencia de cada estación [W]. */
  potenciaEstacion_W: number;
};

export const he6EstadoDefaults: He6Estado = {
  plazasExteriores: 0,
  age: false,
  plazasAccesibles: null,
  plazasConduccion: null,
  estaciones: null,
  esquema: "habitual",
  potenciaEstacion_W: 3680,
};

/** El esquema habitual: colectivo con viviendas en propiedad horizontal; circuitos adicionales en el resto. */
export function esquemaHabitual(residencial: boolean, unifamiliar: boolean): Esquema {
  return residencial && !unifamiliar ? "1" : "4";
}

/** El esquema que vale: la unifamiliar lleva el circuito C13, esquema 4a (ITC-BT-52 ap. 3.1). */
export function resolverEsquema(e: Partial<He6Estado> | undefined, residencial: boolean, unifamiliar: boolean): Esquema {
  if (unifamiliar) return "4";
  const v = e?.esquema;
  return v === undefined || v === "habitual" ? esquemaHabitual(residencial, unifamiliar) : v;
}

/** Un entero válido y no negativo, o null. */
export function entero(v: number | null | undefined): number | null {
  return v !== null && v !== undefined && Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
}
