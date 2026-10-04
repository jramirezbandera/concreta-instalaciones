// =============================================================================
// Generadores desde El edificio (feature-12). Adaptador fino sobre el núcleo de
// `./viviendas.ts`: saca las viviendas tipo y el reparto por planta física de
// las zonas «viviendas» del edificio, y llama al generador de cada módulo.
//
//   - Plurifamiliar: una entrada de reparto por planta física con viviendas
//     (un grupo «P1–P3 × 3» da P1, P2 y P3). La PB entra si tiene viviendas.
//   - Unifamiliar: sin reparto, la vivienda tipo de la casa (la primera). El
//     núcleo lo trata como el caso degenerado de una vivienda en una planta.
//   - Oficinas, locales, garaje…: no generan red todavía (fases 4 y 5).
//
// Puro y determinista, como el núcleo.
// =============================================================================

import { plantasDe, resumenEdificio } from "../derivar";
import type { Edificio, ViviendaTipo } from "../tipos";
import {
  generarHs3Reparto,
  generarHs4Reparto,
  generarHs5Reparto,
  type GeneracionHs3,
  type RepartoPlanta,
} from "./viviendas";

export type { GeneracionHs3 } from "./viviendas";

/** Viviendas tipo definidas en el edificio (en su orden). */
export function viviendasTipoDe(e: Edificio): ViviendaTipo[] {
  return e.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda");
}

/**
 * Viviendas tipo y reparto por planta física que leen los generadores. En la
 * unifamiliar el reparto es `undefined` y solo cuenta la primera vivienda tipo.
 */
export function entradaGeneradores(e: Edificio): {
  vts: ViviendaTipo[];
  reparto: RepartoPlanta[] | undefined;
} {
  const vts = viviendasTipoDe(e);
  if (resumenEdificio(e).esUnifamiliar) {
    return { vts: vts.slice(0, 1), reparto: undefined };
  }
  const ids = new Set(vts.map((v) => v.id));
  const reparto: RepartoPlanta[] = [];
  for (const p of [...plantasDe(e)].reverse()) {
    const viviendas = p.zonas
      .filter((z) => z.uso === "viviendas")
      .flatMap((z) => z.unidades ?? [])
      .filter((u) => ids.has(u.tipoId) && u.cantidad > 0)
      .map((u) => ({ tipoId: u.tipoId, cantidad: u.cantidad }));
    if (viviendas.length > 0) reparto.push({ nivel: p.nivel, viviendas });
  }
  // Sin viviendas colocadas no hay nada que generar. Ojo: el núcleo trata un
  // reparto vacío como la unifamiliar, así que también se vacían los tipos.
  return reparto.length > 0 ? { vts, reparto } : { vts: [], reparto: [] };
}

/** ¿Hay algo que generar? (al menos una vivienda colocada, o la unifamiliar). */
export function puedeGenerarRedes(e: Edificio): boolean {
  return entradaGeneradores(e).vts.length > 0;
}

export function generarHs5(e: Edificio): ReturnType<typeof generarHs5Reparto> {
  const { vts, reparto } = entradaGeneradores(e);
  return generarHs5Reparto(vts, reparto);
}

export function generarHs4(e: Edificio): ReturnType<typeof generarHs4Reparto> {
  const { vts, reparto } = entradaGeneradores(e);
  return generarHs4Reparto(vts, reparto);
}

export function generarHs3(e: Edificio): GeneracionHs3 {
  const { vts, reparto } = entradaGeneradores(e);
  return generarHs3Reparto(vts, reparto);
}
