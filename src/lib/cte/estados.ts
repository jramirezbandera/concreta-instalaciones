// =============================================================================
// Estados de presentación y avisos revisables (feature-15 §A): lo que HS5 tenía
// dentro de su pantalla y repiten HS4, HS3, HS6 y HE1. PURO.
//
//   - un elemento se pinta con su veredicto, salvo que tenga un aviso sin
//     revisar, que lo deja «por revisar» (si no falla);
//   - una justificación que cumple con avisos sin revisar se cachea como «warn»
//     (la barra lateral enseña «!» y la cabecera, «N cosas por revisar»).
// =============================================================================

import type { Veredicto } from "../pdf/renderFicha";
import type { EstadoPresentacion } from "./presentacion";
import type { Aviso, ElementoResultado, VeredictoElemento } from "./resultado";

/** Cómo va un elemento a la tabla de verificación de la ficha. */
export const VEREDICTO_FICHA: Record<VeredictoElemento, Veredicto> = {
  ok: "ok",
  fail: "fail",
  previsto: "neutral",
  criterio: "neutral",
  dato: "neutral",
  fuera: "neutral",
};

/** Estado con que se pinta un elemento. */
export function estadoElemento(
  el: Pick<ElementoResultado, "id" | "veredicto">,
  conAvisoPendiente: ReadonlySet<string>,
): EstadoPresentacion {
  if (el.veredicto === "fail") return "ko";
  if (conAvisoPendiente.has(el.id)) return "rv";
  if (el.veredicto === "previsto") return "pv";
  if (el.veredicto === "criterio") return "in";
  if (el.veredicto === "dato") return "dt";
  if (el.veredicto === "fuera") return "fu";
  return "ok";
}

/** Los avisos que el proyectista no ha marcado como revisados. */
export function avisosPendientes(avisos: readonly Aviso[], revisados: readonly string[]): Aviso[] {
  return avisos.filter((a) => !revisados.includes(a.id));
}

/** Ids de los elementos con algún aviso sin revisar. */
export function elementosConAvisoPendiente(avisos: readonly Aviso[], revisados: readonly string[]): Set<string> {
  return new Set(avisosPendientes(avisos, revisados).flatMap((a) => (a.elementoId ? [a.elementoId] : [])));
}

/** El estado de cada elemento, por id. */
export function estadosElementos(
  elementos: readonly Pick<ElementoResultado, "id" | "veredicto">[],
  avisos: readonly Aviso[],
  revisados: readonly string[],
): Record<string, EstadoPresentacion> {
  const pendientes = elementosConAvisoPendiente(avisos, revisados);
  return Object.fromEntries(elementos.map((el) => [el.id, estadoElemento(el, pendientes)]));
}

/** Cumple con avisos sin revisar → «warn»; lo demás, tal cual. */
export function veredictoConRevision(veredicto: Veredicto, pendientes: number): Veredicto {
  if (veredicto === "fail") return "fail";
  return pendientes > 0 ? "warn" : veredicto;
}
