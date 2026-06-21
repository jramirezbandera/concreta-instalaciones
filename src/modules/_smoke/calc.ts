import type { Veredicto } from "../../lib/pdf/renderFicha";
import { COCCION_MIN } from "./tablas";

// Motor del módulo de humo. Función PURA y DETERMINISTA (sin React/DOM, sin
// Date.now/Math.random): demuestra el contrato del SPEC §4 que seguirán HS3/5/4/HE1.
// Regla de ejemplo (real): la extracción de cocción debe ser >= 50 l/s [DB-HS3].

export interface SmokeInputs {
  /** Caudal de extracción propuesto por el usuario (l/s). */
  caudalPropuesto_l_s: number;
  /** Nº de locales húmedos servidos (solo para mostrar agregados). */
  numLocales: number;
}

export const smokeDefaults: SmokeInputs = {
  caudalPropuesto_l_s: 50,
  numLocales: 1,
};

export interface SmokeResult {
  caudalRequerido_l_s: number;
  caudalPropuesto_l_s: number;
  /** propuesto − requerido (l/s). */
  margen_l_s: number;
  cumple: boolean;
  estado: Veredicto;
  /** Avisos de rango/normativos (patrón de validación del SPEC, sin Zod). */
  warnings: string[];
}

export function calcSmoke(inp: SmokeInputs): SmokeResult {
  const caudalRequerido_l_s = COCCION_MIN.datos.caudalMin_l_s;
  const margen_l_s = inp.caudalPropuesto_l_s - caudalRequerido_l_s;
  const cumple = inp.caudalPropuesto_l_s >= caudalRequerido_l_s;

  const warnings: string[] = [];
  if (!cumple) {
    warnings.push(
      `El caudal propuesto (${inp.caudalPropuesto_l_s} l/s) no alcanza el mínimo de cocción (${caudalRequerido_l_s} l/s).`,
    );
  }
  if (inp.caudalPropuesto_l_s > 500) {
    warnings.push("Caudal inusualmente alto: revisa la entrada.");
  }

  const estado: Veredicto = cumple ? "ok" : "fail";

  return {
    caudalRequerido_l_s,
    caudalPropuesto_l_s: inp.caudalPropuesto_l_s,
    margen_l_s,
    cumple,
    estado,
    warnings,
  };
}
