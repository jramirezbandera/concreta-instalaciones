// =============================================================================
// DB-SUA, SUA 2 — Seguridad frente al riesgo de impacto o de atrapamiento
// (feature-20). Cifras verificadas en la imagen de `research/pdf/DBSUA.pdf`,
// pp. 17–19: research/verificacion-sua2-sua5.md, bloques B1 y B2. Solo datos y
// la fila de la tabla 1.1. Lo habitual (criterio) va aparte, fuera de `tablaCTE`.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/** SUA 2 ap. 1.1 — Impacto con elementos fijos (p. 17). «Como mínimo» → ≥. */
export const ALTURAS_SUA2_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.1 ptos 1 a 4" },
  {
    /** pto 1. Uso restringido: interior de viviendas (y el garaje de la unifamiliar, INTERPRETACIÓN B1.6). */
    alturaLibrePaso_usoRestringido_m: 2.1,
    /** pto 1. Resto, incluidas TODAS las zonas comunes y el garaje comunitario (B1.5). */
    alturaLibrePaso_resto_m: 2.2,
    /** pto 1. Umbrales de puertas. */
    alturaLibreUmbralPuertas_m: 2.0,
    /** pto 2. Elementos fijos que sobresalen de fachadas sobre zonas de circulación. */
    alturaVuelosFachada_m: 2.2,
    /** pto 3. Prohibido: saliente que no arranca del suelo y vuela MÁS DE vueloMax (estricto) entre desde y hasta. */
    salientesParedes: { vueloMax_cm: 15, desde_m: 0.15, hasta_m: 2.2 },
    /** pto 4. Volados de altura MENOR QUE este valor (estricto): restringir el acceso con elementos fijos detectables con bastón. */
    voladosAProteger_alturaMenorQue_m: 2.0,
  } as const,
);

/** SUA 2 ap. 1.2 — Impacto con elementos practicables (p. 17). */
export const PUERTAS_SUA2_1_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.2 ptos 1 a 4", tabla: "Figura 1.1" },
  {
    /** pto 1. Pasillo de anchura MENOR QUE este valor: el barrido no invade el pasillo.
     *  Excepto uso restringido y puertas de recintos de ocupación nula. 2,50 m justos: criterio S1 (como <). */
    pasilloBarrido_anchuraMenorQue_m: 2.5,
    /** pto 2. Vaivén entre zonas de circulación: parte transparente o translúcida que cubra AL MENOS este tramo. */
    vaivenTransparente: { desde_m: 0.7, hasta_m: 1.5 },
    /** ptos 3 y 4. Garaje, portones y peatonales automáticas: reglamentación específica + marcado CE.
     *  (Las UNE-EN 13241 / 12635 / 16005 están SOLO en el comentario del Ministerio.) */
    marcadoCE: true,
  } as const,
);

export type FilaVidrioSua2 = "mayor12" | "entre055y12" | "menor055";

/**
 * SUA 2 ap. 1.3 — Tabla 1.1 «Valor de los parámetros X(Y)Z en función de la
 * diferencia de cota» (p. 18). Clasificación según UNE-EN 12600:2003. El
 * significado de X, Y y Z NO se ha verificado (B1.35): se muestra literal.
 */
export const VIDRIOS_SUA2_TABLA_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.3", tabla: "Tabla 1.1" },
  {
    filas: {
      mayor12: { diferenciaCotas: "Mayor que 12 m", X: "cualquiera", Y: "B o C", Z: "1" },
      entre055y12: { diferenciaCotas: "Comprendida entre 0,55 m y 12 m", X: "cualquiera", Y: "B o C", Z: "1 ó 2" },
      menor055: { diferenciaCotas: "Menor que 0,55 m", X: "1, 2 ó 3", Y: "B o C", Z: "cualquiera" },
    },
    /** Límites de las filas [m]: «mayor que» y «menor que», estrictos. */
    limites_m: { menorQue: 0.55, mayorQue: 12 },
    norma: "UNE-EN 12600:2003",
    /** pto 1. Excluidos los vidrios cuya mayor dimensión NO EXCEDA de este valor (≤). */
    excluidosMayorDimensionHasta_m: 0.3,
    /** pto 2. Áreas con riesgo de impacto (figura 1.2). */
    areasRiesgo: {
      puertas: { hasta_m: 1.5, margenLateralCadaLado_m: 0.3 },
      panosFijos: { hasta_m: 0.9 },
    },
    /** pto 3. Partes vidriadas de puertas y cerramientos de duchas y bañeras: laminado o templado,
     *  sin rotura con un impacto de nivel 3. Sin excepción para viviendas (B1.32). */
    puertasDuchasBaneras: { nivelImpactoSinRotura: 3 },
  } as const,
);

/**
 * Fila de la tabla 1.1 por la diferencia de cota. «Mayor que» y «menor que»,
 * estrictos (literal); 0,55 y 12 m justos van a «comprendida entre»
 * (INTERPRETACIÓN B1.29).
 */
export function filaVidrioSua2(diferenciaCotas_m: number): FilaVidrioSua2 {
  const L = VIDRIOS_SUA2_TABLA_1_1.datos.limites_m;
  if (diferenciaCotas_m > L.mayorQue) return "mayor12";
  if (diferenciaCotas_m < L.menorQue) return "menor055";
  return "entre055y12";
}

/** SUA 2 ap. 1.4 — Elementos insuficientemente perceptibles (p. 18). Excluye el interior de viviendas. */
export const SENALIZACION_VIDRIOS_SUA2_1_4 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.4 ptos 1 y 2" },
  {
    franjaInferior: { desde_m: 0.85, hasta_m: 1.1 },
    franjaSuperior: { desde_m: 1.5, hasta_m: 1.7 },
    /** No hace falta con montantes separados COMO MÁXIMO este valor, o con un travesaño en la franja inferior. */
    exentoMontantesSeparacionMax_m: 0.6,
  } as const,
);

/** SUA 2 ap. 2 — Atrapamiento (p. 19). */
export const ATRAPAMIENTO_SUA2_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 2 ptos 1 y 2", tabla: "Figura 2.1" },
  {
    /** pto 1. Corredera manual: distancia a ≥ 20 cm hasta el objeto fijo más próximo. */
    correderaManual_holguraMin_cm: 20,
  } as const,
);
