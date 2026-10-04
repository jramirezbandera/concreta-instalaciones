// =============================================================================
// DB-SUA — La ficha común de las secciones SUA (feature-20): la del DB-SI
// (`fichaSi`), con la edición y las citas del DB-SUA. PURA.
// =============================================================================

import type { FichaData } from "../../lib/pdf/renderFicha";
import { fichaSi, type PiezasFichaSi } from "../si/ficha";
import type { JustificacionSiBase } from "../si/tipos";
import { EDICION_SUA } from "./tablas";

export { ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";

export function fichaSua<E>(j: JustificacionSiBase, p: Omit<PiezasFichaSi<E>, "edicionDB" | "db">): FichaData {
  return fichaSi(j, { ...p, edicionDB: EDICION_SUA, db: "DB-SUA" });
}
