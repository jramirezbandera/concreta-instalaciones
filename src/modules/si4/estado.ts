// =============================================================================
// DB-SI, SI 4 — Lo que guarda el módulo (feature-19): si hay un hidrante público
// a menos de 100 m de la fachada accesible, que El edificio no sabe. Lo demás
// sale del edificio (la superficie construida, si decide algo, se indica en sus
// zonas). Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-si4-si6.md K12): en suelo urbano
// hay un hidrante público cerca, que cuenta para la dotación (nota 3).
// =============================================================================

export type HidrantePublico = "si" | "no";

export type Opcion<T> = T | "habitual";

export type Si4Estado = {
  hidrantePublico: Opcion<HidrantePublico>;
};

export interface DecisionesSi4 {
  hidrantePublico: HidrantePublico;
}

export const HABITUALES_SI4: DecisionesSi4 = { hidrantePublico: "si" };

export const si4EstadoDefaults: Si4Estado = { hidrantePublico: "habitual" };

export function resolverSi4(e: Si4Estado): DecisionesSi4 {
  return { hidrantePublico: e.hidrantePublico === "habitual" || e.hidrantePublico === undefined ? HABITUALES_SI4.hidrantePublico : e.hidrantePublico };
}
