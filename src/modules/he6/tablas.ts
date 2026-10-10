// =============================================================================
// DB-HE 6 — Dotaciones mínimas para la infraestructura de recarga de vehículos
// eléctricos (feature-24). Valores normativos como DATOS versionados con
// procedencia (SPEC §4/§11). Aquí SOLO datos y funciones puras; la
// justificación vive en `justificacion.ts`.
//
// EDICIÓN: la sección HE 6 la introdujo el RD 450/2022 (BOE 15-06-2022); se
// cita el consolidado de 14-06-2022 con la corrección de errores de 02-02-2023
// (solo cursivas, ninguna cifra).
//
// VERIFICACIÓN (research/verificacion-he6.md): cotejado en la imagen de las
// pp. 33–34 de research/pdf/DBHE.pdf y el comentario de DccHE.pdf p. 38. Lo que
// hay que saber:
//   - la exclusión de 10 plazas o menos es de los EDIFICIOS de uso distinto del
//     residencial privado, y cuenta todas las plazas, interiores y exteriores
//     adscritas (no el «uso Aparcamiento» del DB-SI);
//   - el 20 % se redondea por exceso: ⌈N/5⌉, no Math.ceil(0,2·N) (0,2·15 =
//     3,0000000000000004);
//   - la Administración General del Estado SUSTITUYE el 1/40 por 1/20;
//   - las estaciones de las plazas accesibles cuentan DENTRO del total.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_HE6 = {
  db: "DB-HE6",
  edicion: "Consolidado 14-06-2022 (sección introducida por el RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHE.pdf, Sección HE 6 (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_HE6 = "DB-HE (consolidado 14-jun-2022)";

/**
 * ap. 1 pto 2 a): se excluyen los edificios de uso distinto del residencial
 * privado con 10 plazas o menos. Sin plazas, la sección no se aplica (ap. 1 pto 1).
 */
export const AMBITO_HE6 = tablaCTE(
  { ...PROC_HE6, articulo: "ap. 1 ptos 1 y 2 a)" },
  { excluidoHastaPlazas: 10 } as const,
);

/**
 * ap. 3: residencial privado, conducción de cables para el 100 % de las plazas;
 * otros usos, para al menos el 20 % (una de cada 5) y una estación de recarga
 * por cada 40 plazas o fracción (20 si el edificio es de la Administración
 * General del Estado), y una por cada 5 plazas accesibles, que computan.
 */
export const DOTACION_HE6 = tablaCTE(
  { ...PROC_HE6, articulo: "ap. 3 ptos 1, 2 y 3" },
  {
    /** Otros usos: una plaza de cada 5 (el 20 %), por exceso. */
    conduccionUnaDeCada: 5,
    plazasPorEstacion: 40,
    plazasPorEstacionAge: 20,
    /** El DB no dice «o fracción»: se toma por exceso (criterio K-HE6.4). */
    accesiblesPorEstacion: 5,
  } as const,
);

/**
 * La estación de recarga que se supone (criterio K-HE6.9, research/verificacion-he6.md
 * F.8): punto de recarga tipo SAVE, modo 3, base tipo 2, monofásico a 230 V y
 * 16 A, 3 680 W, la unidad de la ITC-BT-10 ap. 5.2 y de la tabla 1 de la
 * ITC-BT-52. Las otras dos, escalones de la misma tabla. El HE 6 no fija ni el
 * tipo ni la potencia: solo pide declararlos (ap. 4 d).
 */
export const ESTACIONES_HE6 = tablaCTE(
  { db: "Criterio de proyecto", edicion: "Concreta Memorias", articulo: "ITC-BT-52 ap. 5.4 y tabla 1" },
  {
    habitual_W: 3680,
    opciones: [
      { potencia_W: 3680, texto: "monofásico, 230 V y 16 A" },
      { potencia_W: 7360, texto: "monofásico, 230 V y 32 A" },
      { potencia_W: 11085, texto: "trifásico, 400 V y 16 A" },
    ],
  } as const,
);

/** Otros usos: plazas con conducción mínimas, ⌈N/5⌉. */
export function conduccionMinima(plazas: number): number {
  return Math.ceil(Math.max(0, plazas) / DOTACION_HE6.datos.conduccionUnaDeCada);
}

/** Otros usos: estaciones por plazas, ⌈N/40⌉ (⌈N/20⌉ de la Administración General del Estado). */
export function estacionesPorPlazas(plazas: number, age: boolean): number {
  const D = DOTACION_HE6.datos;
  return Math.ceil(Math.max(0, plazas) / (age ? D.plazasPorEstacionAge : D.plazasPorEstacion));
}

/** Estaciones en plazas accesibles, ⌈Nacc/5⌉ (criterio: por exceso). */
export function estacionesAccesibles(accesibles: number): number {
  return Math.ceil(Math.max(0, accesibles) / DOTACION_HE6.datos.accesiblesPorEstacion);
}
