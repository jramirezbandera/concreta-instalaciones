// =============================================================================
// Los materiales de las capas del catálogo común (feature-26), con su dato
// térmico y su µ del Catálogo de Elementos Constructivos del CTE (CEC, v6.3,
// marzo 2010).
//
// VERIFICACIÓN: research/verificacion-cerramientos-cec.md, bloque A.1 y B.3.5,
// todo leído en la imagen del CEC (pp. 19 a 28).
//
// Cada material da UNA fuente térmica:
//   - «R»: la resistencia de la pieza entera, como la tabula el CEC para las
//     fábricas (3.17). No se reparte en un λ (K-CER.5);
//   - «lambda»: morteros, yesos, placa de yeso y aislantes;
//   - «camara»: la cámara de aire sin ventilar, cuya R da la Tabla 2 del DA
//     DB-HE/1 según su espesor y la dirección del flujo (la resuelve HE1, K-CER.8);
//   - «fuera»: lo que el CEC no cuenta, la cámara muy ventilada y lo que queda
//     por fuera de ella (K-CER.9).
//
// Criterios (no los fija el CEC):
//   - K-CER.5: las fábricas, al G más bajo de su tabla (LP de ½ pie con
//     40 ≤ G ≤ 60, 0,18);
//   - K-CER.6: el λ de los aislantes es orientativo y se sustituye por el del
//     fabricante; la lana mineral se toma hidrófila;
//   - K-CER.13: el bloque de hormigón, de áridos densos.
// =============================================================================

export type FuenteTermica =
  | { tipo: "lambda"; lambda_W_mK: number }
  | { tipo: "R"; R_m2K_W: number }
  | { tipo: "camara" }
  | { tipo: "fuera" };

/** Cómo se dibuja la capa en la sección. */
export type Aspecto = "mortero" | "yeso" | "ladrillo" | "bloque" | "aislante" | "camara" | "aplacado";

export interface MaterialCEC {
  nombre: string;
  termico: FuenteTermica;
  /** µ del CEC; en un rango, el valor que se toma. */
  mu: number;
  /** El rango del CEC, si lo da. */
  muRango?: readonly [number, number];
  aspecto: Aspecto;
  /** Página del CEC. */
  pagina?: number;
  /** El aislante absorbe agua (DB-HS1, condiciones B). */
  hidrofilo?: boolean;
}

export const MATERIALES_CEC = {
  // ── Morteros y yesos ──────────────────────────────────────────────────────
  // Revoco o enfoscado de cemento, ρ 1 900 kg/m³ (3.5, nota 1).
  mortero: { nombre: "Mortero de cemento", termico: { tipo: "lambda", lambda_W_mK: 1.3 }, mu: 10, aspecto: "mortero", pagina: 19 },
  // Enlucido de yeso, 1 000 ≤ ρ ≤ 1 300 (3.7).
  enlucido: { nombre: "Enlucido de yeso", termico: { tipo: "lambda", lambda_W_mK: 0.57 }, mu: 6, aspecto: "yeso", pagina: 20 },
  // Placa de yeso laminado, con el papel (3.6.2, nota 1).
  pyl: { nombre: "Placa de yeso laminado", termico: { tipo: "lambda", lambda_W_mK: 0.25 }, mu: 4, aspecto: "yeso", pagina: 20 },

  // ── Fábricas (3.17): R de la pieza con su mortero ─────────────────────────
  lp_medio_pie: { nombre: "½ pie de ladrillo perforado", termico: { tipo: "R", R_m2K_W: 0.18 }, mu: 10, aspecto: "ladrillo", pagina: 26 },
  lp_un_pie: { nombre: "1 pie de ladrillo perforado", termico: { tipo: "R", R_m2K_W: 0.35 }, mu: 10, aspecto: "ladrillo", pagina: 26 },
  lhd: { nombre: "Tabique de ladrillo hueco doble", termico: { tipo: "R", R_m2K_W: 0.16 }, mu: 10, aspecto: "ladrillo", pagina: 26 },
  bh_ad_140: { nombre: "Bloque de hormigón de áridos densos", termico: { tipo: "R", R_m2K_W: 0.19 }, mu: 10, aspecto: "bloque", pagina: 28 },

  // ── Cámaras ───────────────────────────────────────────────────────────────
  camara: { nombre: "Cámara de aire sin ventilar", termico: { tipo: "camara" }, mu: 1, aspecto: "camara" },
  // «Separación de 10 mm» entre la hoja principal y un trasdosado (leyenda p. 59).
  separacion: { nombre: "Separación de 10 mm", termico: { tipo: "camara" }, mu: 1, aspecto: "camara", pagina: 59 },
  camara_ventilada: { nombre: "Cámara de aire ventilada", termico: { tipo: "fuera" }, mu: 0, aspecto: "camara" },

  // ── Revestimientos que no cuentan ─────────────────────────────────────────
  aplacado: { nombre: "Aplacado", termico: { tipo: "fuera" }, mu: 0, aspecto: "aplacado" },

  // ── Aislantes (3.8.1, p. 21): λ orientativo (K-CER.6) ─────────────────────
  // XPS: el CEC da 0,039 a 0,029 y µ 100 a 220; se queda el 0,034 de HE1.
  xps: { nombre: "XPS", termico: { tipo: "lambda", lambda_W_mK: 0.034 }, mu: 150, muRango: [100, 220], aspecto: "aislante", pagina: 21 },
  // EPS: el «valor recomendado» del CEC (nota 1); µ 20 a 100.
  eps: { nombre: "EPS", termico: { tipo: "lambda", lambda_W_mK: 0.039 }, mu: 60, muRango: [20, 100], aspecto: "aislante", pagina: 21 },
  // Lana mineral: el CEC da 0,050 a 0,031; se queda el 0,035 de HE1.
  lana_mineral: { nombre: "Lana mineral", termico: { tipo: "lambda", lambda_W_mK: 0.035 }, mu: 1, aspecto: "aislante", pagina: 21, hidrofilo: true },
} as const satisfies Record<string, MaterialCEC>;

export type ClaveMaterial = keyof typeof MATERIALES_CEC;
export type ClaveAislante = "xps" | "eps" | "lana_mineral";

export function materialCEC(k: ClaveMaterial): MaterialCEC {
  return MATERIALES_CEC[k];
}
