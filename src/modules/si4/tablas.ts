// =============================================================================
// DB-SI, SI 4 — Instalaciones de protección contra incendios (feature-19): la
// tabla 1.1 en las filas que se dan en estos edificios. Verificada en la imagen
// de `research/pdf/DBSI.pdf`, pp. 32–35: research/verificacion-si4-si6.md,
// bloque C1. Superficies CONSTRUIDAS; «excede de» es estricto y «comprendida
// entre A y B» incluye A (interpretación C1.6). Solo datos.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SI } from "../si/tablas";

export const DOTACION_TABLA_1_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 4 ap. 1", tabla: "Tabla 1.1" },
  {
    enGeneral: {
      /** Extintor 21A-113B a 15 m de recorrido en cada planta desde todo origen de evacuación, y en las zonas de riesgo especial (nota 1). */
      extintorEficacia: "21A-113B",
      extintorRecorrido_m: 15,
      /** Ascensor de emergencia en las plantas con altura de evacuación mayor que 28 m. */
      ascensorEmergenciaH_m: 28,
      /** Hidrantes si la altura de evacuación descendente excede de 28 m o la ascendente de 6 m. */
      hidrantesHDescendente_m: 28,
      hidrantesHAscendente_m: 6,
      /** Extinción automática en todo edificio de más de 80 m de altura de evacuación. */
      extincionH_m: 80,
    },
    residencialVivienda: {
      columnaSecaH_m: 24,
      /** Sistema de detección y de alarma. */
      deteccionAlarmaH_m: 50,
      hidrantesDesde_m2: 5000,
    },
    administrativo: {
      bieS_m2: 2000,
      columnaSecaH_m: 24,
      alarmaS_m2: 1000,
      /** Detección en zonas de riesgo alto si excede de 2.000 m²; en todo el edificio si excede de 5.000 m². */
      deteccionRiesgoAltoS_m2: 2000,
      deteccionTodoS_m2: 5000,
      hidrantesDesde_m2: 5000,
    },
    aparcamiento: {
      bieS_m2: 500,
      /** Más de tres plantas bajo rasante (máxima diferencia de cotas, comentario) o más de cuatro sobre rasante. */
      columnaSecaPlantasBajo: 3,
      columnaSecaPlantasSobre: 4,
      deteccionS_m2: 500,
      hidrantesDesde_m2: 1000,
    },
    /** Hidrantes: uno hasta 10.000 m² y uno más por cada 10.000 m² adicionales o fracción. */
    hidrantesPrimeroHasta_m2: 10000,
    hidrantesUnoMasCada_m2: 10000,
    /** Nota (3): cuentan los hidrantes de la vía pública a menos de 100 m de la fachada accesible. */
    hidrantePublicoMax_m: 100,
    /** Notas (2) y (7): BIE de 25 mm (en riesgo alto, 45 mm salvo en Residencial Vivienda). */
    bie_mm: 25,
  } as const,
);

/** Número de hidrantes para una superficie construida. */
export function numeroHidrantes(s_m2: number): number {
  const t = DOTACION_TABLA_1_1.datos;
  return 1 + Math.max(0, Math.ceil((s_m2 - t.hidrantesPrimeroHasta_m2) / t.hidrantesUnoMasCada_m2));
}

/** SI 4 ap. 2: la señalización de las instalaciones manuales remite al RIPCI. */
export const SENALIZACION_SI4 = tablaCTE(
  { ...PROC_SI, articulo: "SI 4 ap. 2 pto 1" },
  { remiteA: "Reglamento de instalaciones de protección contra incendios (RD 513/2017)" } as const,
);
