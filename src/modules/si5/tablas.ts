// =============================================================================
// DB-SI, SI 5 — Intervención de los bomberos (feature-19). Cifras verificadas en
// la imagen de `research/pdf/DBSI.pdf`, pp. 36–37: research/verificacion-si4-si6.md,
// bloque C3. Solo datos.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SI } from "../si/tablas";

/** SI 5 ap. 1.1: viales de aproximación a los espacios de maniobra del ap. 1.2. */
export const SI5_APROXIMACION = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 1.1 ptos 1 y 2" },
  {
    anchuraLibreMin_m: 3.5,
    galiboMin_m: 4.5,
    capacidadPortante_kN_m2: 20,
    /** Tramos curvos: corona circular de radios mínimos 5,30 y 12,50 m, 7,20 m libres. */
    curva: { radioMin1_m: 5.3, radioMin2_m: 12.5, anchuraLibre_m: 7.2 },
  } as const,
);

/** SI 5 ap. 1.2: entorno de los edificios. */
export const SI5_ENTORNO = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 1.2 ptos 1 a 6" },
  {
    /** Se exige si la altura de evacuación DESCENDENTE es mayor que 9 m (estricto: 9,00 m no). */
    umbralHDescendente_m: 9,
    anchuraLibreMin_m: 5,
    /** Separación máxima del vehículo a la fachada: h ≤ 15 → 23 m; 15 < h ≤ 20 → 18 m; h > 20 → 10 m. */
    separacionMaxFachada: [
      { hastaH_m: 15, max_m: 23 },
      { hastaH_m: 20, max_m: 18 },
      { hastaH_m: Number.POSITIVE_INFINITY, max_m: 10 },
    ],
    distanciaMaxAccesos_m: 30,
    pendienteMax_pct: 10,
    punzonamiento: { carga_kN: 100, diametro_cm: 20 },
    /** Tapas de registro de servicios públicos mayores que 0,15 × 0,15 m: UNE-EN 124:2015. */
    tapasRegistroMayorQue_m: 0.15,
    /** Pto 4: el equipo de bombeo, a menos de 18 m de cada toma de la columna seca. */
    columnaSecaBombeoMax_m: 18,
    /** Pto 5: vías sin salida de más de 20 m, espacio para maniobrar. */
    viaSinSalidaMasDe_m: 20,
    /** Pto 6: zonas limítrofes o interiores a áreas forestales. */
    forestal: { franja_m: 25, caminoPerimetral_m: 5, fondoSacoRadio_m: 12.5 },
  } as const,
);

/** SI 5 ap. 2: accesibilidad por fachada (las fachadas del ap. 1.2). */
export const SI5_FACHADA = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 2 pto 1" },
  {
    alfeizarMax_m: 1.2,
    huecoMin_m: { horizontal: 0.8, vertical: 1.2 },
    separacionEjesMax_m: 25,
    /** Elementos de seguridad (rejas) solo en los huecos de plantas con altura de evacuación ≤ 9 m. */
    elementosSeguridadHastaH_m: 9,
  } as const,
);

/** Separación máxima del vehículo de bomberos a la fachada para una altura de evacuación. */
export function separacionMaxFachada(h_m: number): number {
  const filas = SI5_ENTORNO.datos.separacionMaxFachada;
  return (filas.find((f) => h_m <= f.hastaH_m) ?? filas[filas.length - 1]).max_m;
}
