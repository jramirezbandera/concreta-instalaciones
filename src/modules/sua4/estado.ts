// =============================================================================
// DB-SUA, SUA 4 — Lo que guarda el módulo (feature-20): si el garaje de la
// unifamiliar lleva alumbrado de emergencia y el tipo de instalación. Cada
// decisión se guarda como «habitual» mientras coincida con lo habitual. Solo
// tipos y valores.
//
// Lo habitual (criterio, research/verificacion-sua2-sua5.md S11 y E4.5): el
// garaje integrado en la unifamiliar es local de riesgo especial bajo (SI 1) y,
// en lectura literal de SUA 4 ap. 2.1 d), lleva una luminaria de emergencia junto
// a su salida; la instalación, con luminarias autónomas.
// =============================================================================

export type EmergenciaGaraje = "si" | "no";
export type TipoInstalacion = "autonomas" | "centralizada";

export type Opcion<T> = T | "habitual";

export type Sua4Estado = {
  garajeVivienda: Opcion<EmergenciaGaraje>;
  instalacion: Opcion<TipoInstalacion>;
};

export interface DecisionesSua4 {
  garajeVivienda: EmergenciaGaraje;
  instalacion: TipoInstalacion;
}

export const sua4EstadoDefaults: Sua4Estado = { garajeVivienda: "habitual", instalacion: "habitual" };

export const HABITUALES_SUA4: DecisionesSua4 = { garajeVivienda: "si", instalacion: "autonomas" };

export function resolverSua4(e: Sua4Estado): DecisionesSua4 {
  return {
    garajeVivienda: e.garajeVivienda === "habitual" || e.garajeVivienda === undefined ? HABITUALES_SUA4.garajeVivienda : e.garajeVivienda,
    instalacion: e.instalacion === "habitual" || e.instalacion === undefined ? HABITUALES_SUA4.instalacion : e.instalacion,
  };
}
