// =============================================================================
// DB-SI — Redacción común de las seis secciones (feature-19): nombres de los
// usos, de las superficies y de las columnas de altura. PURAS, en español.
// =============================================================================

import { fmt } from "../../lib/units/format";
import type { UsoSector } from "./sectores";

export const NOMBRE_USO_SECTOR: Record<UsoSector, string> = {
  residencial: "Residencial Vivienda",
  administrativo: "Administrativo",
  comercial: "Comercial",
  aparcamiento: "Aparcamiento",
};

/** «655 m²». */
export function m2(v: number): string {
  return fmt(v, "m²", 0);
}

/** «655 m² (supuestos)» o «655 m²». */
export function construida(v: number, supuesta: boolean): string {
  return `${m2(v)}${supuesta ? " (supuestos)" : ""}`;
}

/** La columna de altura de las tablas 1.2 (SI 1) y 3.1 (SI 6). */
export function textoColumna(bajoRasante: boolean, h_m: number): string {
  if (bajoRasante) return "planta bajo rasante";
  if (h_m <= 15) return "h ≤ 15 m";
  if (h_m <= 28) return "15 < h ≤ 28 m";
  return "h > 28 m";
}

