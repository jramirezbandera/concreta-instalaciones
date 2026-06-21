import type { FichaData } from "../../lib/pdf/renderFicha";
import { citaDe } from "../../lib/cte/tabla";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { SmokeInputs, SmokeResult } from "./calc";
import { COCCION_MIN } from "./tablas";

export const SMOKE_PDF_SVG_ID = "_smoke-svg-pdf";

/** Convierte (inputs, result) en el FichaData que renderFicha pinta. */
export function toFichaData(inp: SmokeInputs, result: SmokeResult): FichaData {
  return {
    titulo: "Demo cimientos — Extracción de cocción (DB-HS3)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS3 (FOM/588/2017)",
    normativa: [citaDe(COCCION_MIN.procedencia)],
    datosPartida: [
      {
        concepto: "Caudal de extracción propuesto",
        valor: fmt(inp.caudalPropuesto_l_s, "l/s"),
        origen: "Entrada del usuario",
      },
      {
        concepto: "Nº de locales húmedos servidos",
        valor: String(inp.numLocales),
        origen: "Entrada del usuario",
      },
      {
        concepto: "Caudal mínimo de cocción",
        valor: fmt(result.caudalRequerido_l_s, "l/s"),
        origen: `${COCCION_MIN.procedencia.db} ${COCCION_MIN.procedencia.articulo}`,
      },
    ],
    verificaciones: [
      {
        concepto: "Extracción independiente de cocción",
        valor: fmt(result.caudalPropuesto_l_s, "l/s"),
        limite: `≥ ${fmt(result.caudalRequerido_l_s, "l/s")}`,
        estado: result.estado,
        referencia: `${COCCION_MIN.procedencia.db} ${COCCION_MIN.procedencia.articulo}`,
      },
    ],
    veredictoGlobal: result.estado,
    observaciones: [
      "Ficha de demostración generada por el módulo de humo (feature-0). No sustituye al cálculo de un módulo CTE real.",
      ...result.warnings,
    ],
    svg: {
      elementId: SMOKE_PDF_SVG_ID,
      nativeW: 120,
      nativeH: 90,
      caption: "Esquema de extracción de cocción",
    },
    inputs: inp,
    slug: "demo-cimientos",
  };
}
