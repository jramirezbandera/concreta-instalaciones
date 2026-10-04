// =============================================================================
// DB-SUA, SUA 7 — Seguridad frente al riesgo causado por vehículos en movimiento
// (feature-20). Cifras verificadas en la imagen de `research/pdf/DBSUA.pdf`,
// pp. 27 y 39: research/verificacion-sua6-sua8.md, bloques A y C2. El umbral del
// uso Aparcamiento (> 100 m² construidos) es común: `sua/tablas.ts`. Solo datos.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/**
 * Ap. 1: zonas de uso Aparcamiento (lo que excluye a los garajes de una vivienda
 * unifamiliar) y vías de circulación de vehículos existentes en los edificios.
 */
export const SUA7_AMBITO = tablaCTE({ ...PROC_SUA, articulo: "SUA 7 ap. 1" }, {
  ramas: ["zonas de uso Aparcamiento", "vías de circulación de vehículos existentes en los edificios"],
  excluye: "los garajes de una vivienda unifamiliar",
} as const);

/**
 * Ap. 2 pto 1: las zonas de uso Aparcamiento disponen en su incorporación al
 * exterior de un espacio de acceso y espera de 4,5 m de profundidad como mínimo
 * y una pendiente del 5 % como máximo.
 */
export const SUA7_ESPERA = tablaCTE({ ...PROC_SUA, articulo: "SUA 7 ap. 2 pto 1" }, { fondoMin_m: 4.5, pendienteMax_pct: 5 } as const);

/**
 * Ap. 2 pto 2: todo recorrido para peatones previsto por una rampa para vehículos
 * (salvo el solo de emergencia): 80 cm de anchura como mínimo, protegido por una
 * barrera de 80 cm de altura como mínimo o por pavimento a un nivel más elevado
 * (desnivel según SUA 1 ap. 3.1).
 */
export const SUA7_PEATONES = tablaCTE({ ...PROC_SUA, articulo: "SUA 7 ap. 2 pto 2" }, { anchuraMin_m: 0.8, barreraMin_m: 0.8 } as const);

/**
 * Ap. 3: en PLANTAS de Aparcamiento con capacidad mayor que 200 vehículos o
 * superficie mayor que 5000 m² (estrictos), itinerarios peatonales de zonas de
 * uso público identificados; desnivel de más de 55 cm protegido; barreras a
 * 1,20 m de las puertas y de 80 cm de altura.
 */
export const SUA7_ITINERARIOS = tablaCTE({ ...PROC_SUA, articulo: "SUA 7 ap. 3" }, {
  plazasMayorQue: 200,
  superficieMayorQue_m2: 5000,
  desnivelExcede_m: 0.55,
  barreraPuertasDistancia_m: 1.2,
  barreraPuertasAltura_m: 0.8,
} as const);

/**
 * Ap. 4: señalización conforme al código de la circulación (sentido y salidas,
 * velocidad máxima de 20 km/h, zonas de tránsito y paso de peatones) y, en los
 * accesos de vehículos a viales exteriores desde establecimientos de uso
 * Aparcamiento, dispositivos que alerten al conductor de la presencia de peatones.
 */
export const SUA7_SENALIZACION = tablaCTE({ ...PROC_SUA, articulo: "SUA 7 ap. 4" }, { velocidadMax_km_h: 20 } as const);

/**
 * Comentarios del Ministerio (DB-SUA con comentarios, 15-jul-2024), NO
 * reglamentarios: el espacio de espera no hace falta si la incorporación es
 * descendente (p. 46); dispositivos de alerta: espejos, detectores de
 * movimiento, indicadores luminosos de presencia (p. 47).
 */
export const COMENTARIO_SUA7 = "comentario del Ministerio, no reglamentario";
