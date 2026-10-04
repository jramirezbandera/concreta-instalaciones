// =============================================================================
// DB-SI, SI 2 — Propagación exterior (feature-19): medianerías, fachadas y
// cubiertas. Verificado en la imagen de `research/pdf/DBSI.pdf`, pp. 19–21:
// research/verificacion-si1-si2.md, bloques A7 y A8. Solo datos.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SI } from "../si/tablas";

export const FACHADAS_SI2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 2 ap. 1 ptos 1 a 6" },
  {
    /** Pto 1: los elementos verticales separadores de otro edificio, al menos EI 120. */
    medianeria_EI: 120,
    /** Pto 2: distancia d entre puntos de fachada no EI 60 de sectores distintos, según el ángulo α entre fachadas (interpolación lineal). */
    alfa_grados: [0, 45, 60, 90, 135, 180],
    d_m: [3.0, 2.75, 2.5, 2.0, 1.25, 0.5],
    /** Pto 3: franja vertical EI 60 de 1 m como mínimo entre sectores (menos lo que vuele un saliente apto). */
    franja_EI: 60,
    franjaAltura_m: 1.0,
    /** Pto 4: sistemas constructivos de fachada que ocupen más del 10 % de su superficie, por la altura TOTAL de la fachada. */
    reaccionSistemas: [
      { hasta_m: 10, clase: "D-s3,d0" },
      { hasta_m: 18, clase: "C-s3,d0" },
      { hasta_m: Number.POSITIVE_INFINITY, clase: "B-s3,d0" },
    ],
    /** Pto 5: aislamiento en cámaras ventiladas; barreras E 30 en los forjados entre sectores. */
    reaccionAislamientoCamara: [
      { hasta_m: 10, clase: "D-s3,d0" },
      { hasta_m: 28, clase: "B-s3,d0" },
      { hasta_m: Number.POSITIVE_INFINITY, clase: "A2-s3,d0" },
    ],
    /** Pto 6: fachadas de hasta 18 m con arranque accesible al público: B-s3,d0 hasta 3,5 m como mínimo. */
    arranqueFachadaMax_m: 18,
    arranqueClase: "B-s3,d0",
    arranqueHasta_m: 3.5,
  } as const,
);

export const CUBIERTAS_SI2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 2 ap. 2 ptos 1 a 3" },
  {
    /** Pto 1: REI 60 en 0,50 m desde el edificio colindante y en 1,00 m sobre el encuentro con elementos compartimentadores de sectores o de locales de riesgo alto; o prolongarlos 0,60 m. */
    franja_REI: 60,
    franjaColindante_m: 0.5,
    franjaSector_m: 1.0,
    prolongacion_m: 0.6,
    /** Pto 3: BROOF(t1) en los materiales de más del 10 % de las zonas a menos de 5 m de fachadas no EI 60. */
    broof: "BROOF(t1)",
    broofDistancia_m: 5,
  } as const,
);

/** Distancia mínima entre huecos de sectores distintos para un ángulo entre fachadas [°]. */
export function distanciaAngulo(alfa: number): number {
  const t = FACHADAS_SI2.datos;
  const a = Math.max(0, Math.min(180, alfa));
  for (let i = 1; i < t.alfa_grados.length; i++) {
    const a0 = t.alfa_grados[i - 1];
    const a1 = t.alfa_grados[i];
    if (a <= a1) return t.d_m[i - 1] + ((a - a0) / (a1 - a0)) * (t.d_m[i] - t.d_m[i - 1]);
  }
  return t.d_m[t.d_m.length - 1];
}

/** La clase de una lista por altura de fachada. */
export function claseFachada(lista: readonly { hasta_m: number; clase: string }[], altura_m: number): string {
  return (lista.find((x) => altura_m <= x.hasta_m) ?? lista[lista.length - 1]).clase;
}
