// =============================================================================
// Cifras que El edificio deduce de otras normas (feature-12 §E). Verificadas el
// 2026-10-03 contra el texto oficial: ver `research/verificacion-edificio-usos.md`
// (bloques A, B y E). Solo lo que allí figura como «se puede mostrar».
// =============================================================================

import { tablaCTE } from "../cte/tabla";

const PROC_SI = {
  db: "DB-SI",
  edicion: "consolidado 4-mar-2025 (RD 164/2025)",
  fecha: "2025-03-04",
  fuente: "codigotecnico.org",
} as const;

/**
 * DB-SI, SI 3, ap. 2.1, Tabla 2.1 — densidades de ocupación [m² útiles por
 * persona], aplicadas a la superficie útil de cada zona. Ocupación nula: zonas
 * accesibles solo a efectos de mantenimiento (fila «Cualquiera») y trasteros de
 * vivienda (Anejo SI A). Un local sin uso definido no tiene densidad: el DB
 * remite al uso «más asimilable».
 */
export const DENSIDADES_SI3 = tablaCTE(
  { ...PROC_SI, articulo: "SI 3, ap. 2.1", tabla: "Tabla 2.1" },
  {
    residencialVivienda: 20,
    administrativoOficinas: 10,
    /** Vestíbulos generales y zonas de uso público, en uso Administrativo. */
    administrativoVestibulos: 2,
    /** Aparcamiento vinculado a una actividad sujeta a horarios (oficina, comercio…). */
    aparcamientoConHorario: 15,
    aparcamientoOtros: 40,
  } as const,
);

/**
 * REBT, ITC-BT-10 — previsión de cargas. Vivienda: electrificación básica
 * 5 750 W o elevada 9 200 W a 230 V (ap. 2.2); es elevada, entre otros casos,
 * con superficie útil > 160 m², calefacción eléctrica o aire acondicionado
 * (ap. 2.1.2). Locales comerciales y oficinas: 100 W por m² y planta, mínimo
 * 3 450 W por local, simultaneidad 1 (ap. 3.3 y 4.1). La ITC no dice si la
 * superficie es útil o construida: la UI lo declara como criterio.
 */
export const PREVISION_ITC_BT_10 = tablaCTE(
  {
    db: "REBT ITC-BT-10",
    edicion: "RD 842/2002, consolidado 03-09-2025",
    fecha: "2025-09-03",
    fuente: "boe.es",
    articulo: "ap. 2.1, 2.2, 3.3 y 4.1",
  },
  {
    electrificacionBasica_W: 5750,
    electrificacionElevada_W: 9200,
    superficieElevada_m2: 160,
    localesOficinas_W_m2: 100,
    minimoLocal_W: 3450,
  } as const,
);

/**
 * RITE, IT 1.1.4.2.2 e IT 1.1.4.2.3.1, método A, Tabla 1.4.2.1 — caudal mínimo
 * de aire exterior por persona [dm³/s]: oficinas IDA 2, comercio IDA 3
 * (actividad ~1,2 met, sin fumadores).
 */
export const AIRE_EXTERIOR_RITE = tablaCTE(
  {
    db: "RITE",
    edicion: "RD 1027/2007, consolidado 02-08-2022",
    fecha: "2022-08-02",
    fuente: "boe.es",
    articulo: "IT 1.1.4.2.3.1, método A",
    tabla: "Tabla 1.4.2.1",
  },
  { ida2_dm3_s_persona: 12.5, ida3_dm3_s_persona: 8 } as const,
);
