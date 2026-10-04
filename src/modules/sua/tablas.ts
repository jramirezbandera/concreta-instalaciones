// =============================================================================
// DB-SUA — La procedencia común y los umbrales que comparten varias secciones
// (feature-20). Lo que solo usa una sección va en su carpeta (`sua8/tablas.ts`…).
// Verificación: research/verificacion-sua1.md, research/verificacion-sua2-sua5.md,
// research/verificacion-sua6-sua8.md y research/verificacion-sua9.md.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

/**
 * DB-SUA vigente: consolidado de 14-jun-2022 (RD 450/2022). Todas las cifras se
 * cotejaron en la imagen de `research/pdf/DBSUA.pdf`; los comentarios del
 * Ministerio (`DccSUA.pdf`, 15-jul-2024) no son reglamentarios y se rotulan así.
 */
export const PROC_SUA = {
  db: "DB-SUA",
  edicion: "consolidado 14-jun-2022 (RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org",
} as const;

/** Lo que va al pie de la ficha de cada sección. */
export const EDICION_SUA = "DB-SUA (consolidado 14-jun-2022)";

/**
 * Anejo A, «Uso Aparcamiento»: superficie CONSTRUIDA que exceda de 100 m²
 * (estricto). Excluye los garajes de una vivienda unifamiliar, cualquiera que
 * sea su superficie. research/verificacion-sua6-sua8.md A.8.
 */
export const SUA_USO_APARCAMIENTO = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Uso Aparcamiento»" },
  { construidaMayorQue_m2: 100 } as const,
);

/**
 * SUA 9 ap. 1.1.2: cuándo hace falta ascensor (o rampa) accesible. Residencial
 * Vivienda: más de dos plantas que salvar desde la entrada principal accesible
 * hasta alguna vivienda o zona comunitaria, o más de 12 viviendas en plantas sin
 * entrada accesible; si no, previsión dimensional y estructural. Otros usos: más
 * de dos plantas, o más de 200 m² útiles (sin ocupación nula) en plantas sin
 * entrada accesible; sin previsión. research/verificacion-sua9.md D3.
 */
export const SUA9_ENTRE_PLANTAS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 9 ap. 1.1.2" },
  {
    plantasASalvarMasDe: 2,
    viviendasSinEntradaMasDe: 12,
    utilSinEntradaMasDe_m2: 200,
  } as const,
);
