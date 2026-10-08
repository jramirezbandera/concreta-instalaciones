// =============================================================================
// Cómo se nombra un cerramiento en las fichas y las memorias (feature-26, paso
// 6): con su nombre, su código y su página del CEC, el mismo en HE1, HR y HS1.
// PURA.
// =============================================================================

import type { Solucion } from "./catalogo";

type Citable = Pick<Solucion, "nombre" | "codigo" | "pagina">;

/** «CEC F 3.2, p. 59». */
export function citaCec(s: Pick<Solucion, "codigo" | "pagina">): string {
  return `CEC ${s.codigo}, p. ${s.pagina}`;
}

/** «Enfoscado + LP ½ pie + cámara + aislante + LHD 7 + enlucido (CEC F 3.2, p. 59)». */
export function designacion(s: Citable): string {
  return `${s.nombre} (${citaCec(s)})`;
}

/** Un nombre en mitad de una frase: «enfoscado + LP ½ pie…», pero «LP ½ pie…», «SATE…» y «PYL 15…». */
export function enFrase(t: string): string {
  return /^\p{Lu}\p{Ll}/u.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}

/** La designación en mitad de una frase. */
export function designacionEnFrase(s: Citable): string {
  return enFrase(designacion(s));
}

/** Cómo se llama cada cerramiento de El edificio en las fichas de los tres DB. */
export const NOMBRE_CERRAMIENTO = {
  fachada: "Fachada",
  fachadaPB: "Fachada de la planta baja",
  ventana: "Ventanas",
  ventanaPB: "Ventanas de la planta baja",
  cubierta: "Cubierta",
  forjado: "Forjados",
} as const;
