// =============================================================================
// DB-SUA, SUA 6 — Seguridad frente al riesgo de ahogamiento (feature-20). Cifras
// verificadas en la imagen de `research/pdf/DBSUA.pdf`, pp. 25–26:
// research/verificacion-sua6-sua8.md, bloques A y C1. Solo datos.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/**
 * Ap. 1 pto 1: piscinas de uso colectivo, salvo las destinadas exclusivamente a
 * competición o a enseñanza. Quedan excluidas las de viviendas unifamiliares, los
 * baños termales y los centros de hidroterapia o de uso exclusivamente médico.
 * El ap. 2 (pozos y depósitos) no se limita a las piscinas (A.5, interpretación).
 */
export const SUA6_AMBITO = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 1 pto 1" }, {
  aplicaA: "piscinas de uso colectivo",
  salvo: ["destinadas exclusivamente a competición", "destinadas exclusivamente a enseñanza"],
  excluidas: ["piscinas de viviendas unifamiliares", "baños termales", "centros de tratamiento de hidroterapia", "otros dedicados a usos exclusivamente médicos"],
} as const);

/**
 * Ap. 1.1: si el acceso de niños a la zona de baño no está controlado, barreras
 * que impidan el acceso al vaso salvo por los puntos previstos (con cierre y
 * bloqueo): altura mínima 1,20 m, 0,5 kN/m en el borde superior y las
 * condiciones constructivas de SUA 1 ap. 3.2.3.
 */
export const SUA6_BARRERA = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 1.1" }, {
  alturaMin_m: 1.2,
  fuerza_kN_m: 0.5,
  constructivas: "SUA 1 ap. 3.2.3",
} as const);

/**
 * Ap. 1.2: el vaso.
 *   - 1.2.1: infantiles ≤ 0,50 m; el resto ≤ 3 m y con zonas de profundidad
 *     MENOR que 1,40 m (estricto); se señalizan los puntos donde se SUPERE 1,40 m
 *     y la máxima y la mínima, al menos en las paredes del vaso y en el andén;
 *   - 1.2.2: pendientes máximas: infantiles 6 %; recreo o polivalentes 10 % hasta
 *     1,40 m de profundidad y 35 % en el resto;
 *   - 1.2.4: fondo de clase 3 donde la profundidad NO EXCEDA de 1,50 m (≤ 1,50,
 *     no 1,40); revestimiento interior de color claro.
 */
export const SUA6_VASO = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 1.2" }, {
  infantilMax_m: 0.5,
  restoMax_m: 3,
  zonaSomeraMenorQue_m: 1.4,
  senalizarSiSupera_m: 1.4,
  pendienteInfantil_pct: 6,
  pendienteHasta140_pct: 10,
  pendienteResto_pct: 35,
  claseFondo: 3,
  fondoHasta_m: 1.5,
} as const);

/** Ap. 1.3: andén o playa que circunda el vaso: clase 3, anchura mínima 1,20 m, sin encharcamiento. */
export const SUA6_ANDEN = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 1.3" }, { clase: 3, anchuraMin_m: 1.2 } as const);

/**
 * Ap. 1.4: excepto en las piscinas infantiles, las escaleras alcanzan una
 * profundidad bajo el agua de 1 m como mínimo, o bien hasta 30 cm por encima del
 * suelo del vaso; junto a los ángulos y en los cambios de pendiente, a no más de
 * 15 m entre ellas (≤ 15).
 */
export const SUA6_ESCALERAS = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 1.4" }, {
  bajoAguaMin_m: 1,
  sobreFondo_m: 0.3,
  separacionMax_m: 15,
} as const);

/** Ap. 2: pozos, depósitos o conducciones abiertas accesibles con riesgo de ahogamiento (sin cifras). */
export const SUA6_POZOS = tablaCTE({ ...PROC_SUA, articulo: "SUA 6 ap. 2" }, {
  literal:
    "Los pozos, depósitos, o conducciones abiertas que sean accesibles a personas y presenten riesgo de ahogamiento estarán equipados con sistemas de protección, tales como tapas o rejillas, con la suficiente rigidez y resistencia, así como con cierres que impidan su apertura por personal no autorizado.",
} as const);

/**
 * Comentarios del Ministerio (DB-SUA con comentarios, 15-jul-2024): NO son
 * reglamentarios y se rotulan así.
 *   - la piscina de uso colectivo en uso Residencial Vivienda (p. 43);
 *   - el acceso controlado: elementos físicos interpuestos entre las zonas comunes
 *     de uso habitual y el vaso (pp. 43–44);
 *   - el andén se regula cuando existe, pero no es obligatorio (p. 44).
 */
export const COMENTARIO_SUA6 = "comentario del Ministerio, no reglamentario";
