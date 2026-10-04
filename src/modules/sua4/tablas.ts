// =============================================================================
// DB-SUA, SUA 4 — Seguridad frente al riesgo causado por iluminación inadecuada
// (feature-20). Cifras verificadas en la imagen de `research/pdf/DBSUA.pdf`,
// pp. 21–22: research/verificacion-sua2-sua5.md, bloques B4 y B5. En el texto
// vigente NO hay «tabla 1.1» en SUA 4: las iluminancias van en un párrafo (B4.2).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/** SUA 4 ap. 1 pto 1 (p. 21). Iluminancia mínima medida a nivel del suelo. */
export const ALUMBRADO_NORMAL_SUA4_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 1 pto 1" },
  {
    exterior_lx: 20,
    interior_lx: 100,
    /** «aparcamientos interiores»; comentario (no reglamentario): en toda la superficie, plazas incluidas. */
    aparcamientoInterior_lx: 50,
    /** Factor de uniformidad media mínimo (comentario: Emin/Emed). */
    uniformidadMediaMin: 0.4,
  } as const,
);

export type LetraEmergencia = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

/** SUA 4 ap. 2.1 pto 1 (p. 21). Lista literal; «mayor que» y «exceda de», estrictos. */
export const DOTACION_EMERGENCIA_SUA4_2_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.1 pto 1" },
  {
    a: { literal: "Todo recinto cuya ocupación sea mayor que 100 personas", ocupacionMayorQue: 100 },
    b: {
      literal:
        "Los recorridos desde todo origen de evacuación hasta el espacio exterior seguro y hasta las zonas de refugio, incluidas las propias zonas de refugio, según definiciones en el Anejo A de DB SI",
    },
    c: {
      literal:
        "Los aparcamientos cerrados o cubiertos cuya superficie construida exceda de 100 m², incluidos los pasillos y las escaleras que conduzcan hasta el exterior o hasta las zonas generales del edificio",
      construidaMayorQue_m2: 100,
    },
    d: { literal: "Los locales que alberguen equipos generales de las instalaciones de protección contra incendios y los de riesgo especial, indicados en DB-SI 1" },
    e: { literal: "Los aseos generales de planta en edificios de uso público" },
    f: { literal: "Los lugares en los que se ubican cuadros de distribución o de accionamiento de la instalación de alumbrado de las zonas antes citadas" },
    g: { literal: "Las señales de seguridad" },
    h: { literal: "Los itinerarios accesibles" },
  } as const,
);

/** SUA 4 ap. 2.2 pto 1 (pp. 21–22). */
export const LUMINARIAS_EMERGENCIA_SUA4_2_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.2 pto 1" },
  {
    alturaMinimaSobreSuelo_m: 2,
    puntosMinimos: [
      "en las puertas existentes en los recorridos de evacuación",
      "en las escaleras, de modo que cada tramo de escaleras reciba iluminación directa",
      "en cualquier otro cambio de nivel",
      "en los cambios de dirección y en las intersecciones de pasillos",
    ],
  } as const,
);

/** SUA 4 ap. 2.3 (p. 22). */
export const INSTALACION_EMERGENCIA_SUA4_2_3 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.3 ptos 1 a 3" },
  {
    /** pto 1. Fallo = tensión POR DEBAJO de esta fracción de la nominal. */
    falloTensionPorDebajoDe: 0.7,
    /** pto 2. Vías de evacuación: al menos el 50 % a los 5 s y el 100 % a los 60 s. */
    respuesta: { a5s: 0.5, a60s: 1 },
    /** pto 3. Autonomía mínima [h]. */
    autonomiaMin_h: 1,
    /** pto 3 a). Vías de anchura ≤ 2 m; más anchas, en bandas de 2 m como máximo. */
    viaEvacuacion: { anchuraMax_m: 2, ejeCentralMin_lx: 1, bandaCentralMin_lx: 0.5 },
    /** pto 3 b). Equipos de seguridad, PCI de uso manual y cuadros de distribución del alumbrado [lx]. */
    equiposYCuadrosMin_lx: 5,
    /** pto 3 c). Emax/Emin a lo largo de la línea central: no mayor que 40:1. */
    relacionMaxMinEjeMax: 40,
    /** pto 3 e). Índice de rendimiento cromático mínimo. */
    raMin: 40,
  } as const,
);

/** SUA 4 ap. 2.4 (p. 22). Señales de evacuación, de medios manuales de PCI y de primeros auxilios. */
export const SENALES_SUA4_2_4 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.4 pto 1" },
  {
    luminanciaColorSeguridadMin_cd_m2: 2,
    relacionMaxMinMax: 10,
    /** c) 5:1 ≤ L_blanca / L_color ≤ 15:1. El «>10» que sigue a L_color en el texto NO se usa (B5.24). */
    relacionBlancoColor: { min: 5, max: 15 },
    respuesta: { a5s: 0.5, a60s: 1 },
  } as const,
);
