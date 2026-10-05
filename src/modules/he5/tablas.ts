// =============================================================================
// DB-HE 5 — Generación mínima de energía eléctrica procedente de fuentes
// renovables (feature-22). Valores normativos como DATOS versionados con
// procedencia (SPEC §4/§11). Aquí SOLO datos y fórmulas puras; la justificación
// vive en `justificacion.ts`.
//
// EDICIÓN: DB-HE consolidado de 14-06-2022 (RD 450/2022): la sección se aplica
// ya a cualquier uso, también al residencial privado, desde 1.000 m² construidos.
//
// VERIFICACIÓN (research/verificacion-he4-he5.md): cotejado en la imagen de las
// pp. 31–32 de research/pdf/DBHE.pdf y los comentarios de DccHE.pdf pp. 35–36.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HE5 = {
  db: "DB-HE5",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHE.pdf, Sección HE 5 (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HE5 = "DB-HE (consolidado 14-jun-2022)";

/**
 * ap. 1: edificios de nueva construcción que superen los 1.000 m² construidos
 * (estricto). La superficie incluye el aparcamiento interior y excluye las zonas
 * exteriores comunes.
 */
export const AMBITO_HE5 = tablaCTE(
  { ...PROC_HE5, articulo: "ap. 1 pto 1" },
  { superficieMayorQue_m2: 1000 } as const,
);

/**
 * ap. 3 pto 1: Pmin = menor de P1 = Fpr;el·S y P2 = 0,1·(0,5·Sc − Soc) [kW].
 * Fpr;el: 0,005 kW/m² en uso residencial privado y 0,010 en el resto.
 */
export const POTENCIA_HE5 = tablaCTE(
  { ...PROC_HE5, articulo: "ap. 3 pto 1" },
  {
    fprEl: { residencialPrivado: 0.005, resto: 0.01 },
    /** P2 = factor·(fraccionCubierta·Sc − Soc). */
    factorCubierta: 0.1,
    fraccionCubierta: 0.5,
  } as const,
);

/** P1 = Σ Fpr;el·S de cada uso [kW], sin redondear. */
export function potenciaP1(residencial_m2: number, resto_m2: number): number {
  const f = POTENCIA_HE5.datos.fprEl;
  return f.residencialPrivado * residencial_m2 + f.resto * resto_m2;
}

/** P2 = 0,1·(0,5·Sc − Soc) [kW], sin redondear (puede salir negativa). */
export function potenciaP2(sc_m2: number, soc_m2: number): number {
  const P = POTENCIA_HE5.datos;
  return P.factorCubierta * (P.fraccionCubierta * sc_m2 - soc_m2);
}

/** Redondeo hacia arriba a centésimas, sin el ruido de la coma flotante. */
export function arriba2(v: number): number {
  return Math.ceil(Math.round(v * 1e6) / 1e4) / 100;
}
