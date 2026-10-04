// =============================================================================
// DB-SUA, SUA 3 — Lo que guarda el módulo (feature-20): si los baños y aseos
// tienen pestillo y, en las oficinas, si el aseo accesible está en una zona de
// uso público. Cada decisión se guarda como «habitual» mientras coincida con lo
// habitual. Solo tipos y valores.
//
// Lo habitual (criterio, research/verificacion-sua2-sua5.md E3.1 y E3.3): los
// baños y aseos tienen condena con desbloqueo desde el exterior; en unas oficinas,
// las salas de reuniones reciben a personas externas (uso público, comentario
// D4a), así que el aseo accesible lleva llamada de asistencia.
// =============================================================================

export type Pestillos = "desbloqueo" | "sin_pestillo";
export type AseoPublico = "si" | "no";

export type Opcion<T> = T | "habitual";

export type Sua3Estado = {
  pestillos: Opcion<Pestillos>;
  aseoPublico: Opcion<AseoPublico>;
};

export interface DecisionesSua3 {
  pestillos: Pestillos;
  aseoPublico: AseoPublico;
}

export const sua3EstadoDefaults: Sua3Estado = {
  pestillos: "habitual",
  aseoPublico: "habitual",
};

export const HABITUALES_SUA3: DecisionesSua3 = { pestillos: "desbloqueo", aseoPublico: "si" };

export function resolverSua3(e: Sua3Estado): DecisionesSua3 {
  return {
    pestillos: e.pestillos === "habitual" || e.pestillos === undefined ? HABITUALES_SUA3.pestillos : e.pestillos,
    aseoPublico: e.aseoPublico === "habitual" || e.aseoPublico === undefined ? HABITUALES_SUA3.aseoPublico : e.aseoPublico,
  };
}
