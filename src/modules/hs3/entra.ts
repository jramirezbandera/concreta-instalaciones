// =============================================================================
// DB-HS3 — «Qué entra» (feature-15, HS3): las partes de El edificio que toca la
// ventilación y cómo las trata, en filas listas para `QueEntra`. PURA.
// =============================================================================

import type { FilaQueEntra, TratoQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { etiquetaNivel, plantasDe } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import { fmt } from "../../lib/units/format";
import { parteDeTipo, type JustificacionHs3 } from "./justificacion";

function tratoDe(es: (EstadoPresentacion | undefined)[]): TratoQueEntra {
  if (es.includes("ko")) return "ko";
  if (es.includes("rv")) return "rv";
  return "normal";
}

/**
 * Filas de «Qué entra». Cada fila lleva la parte del dibujo a la que lleva y el
 * elemento que selecciona.
 */
export function filasQueEntraHs3(
  j: JustificacionHs3,
  edificio: Edificio,
  estados: Record<string, EstadoPresentacion>,
): (FilaQueEntra & { parte?: string })[] {
  const filas: (FilaQueEntra & { parte?: string })[] = [];
  const red = j.red;
  for (const t of red.tipos) {
    const parte = parteDeTipo(t);
    const ids = j.elementos.filter((e) => e.parte === parte).map((e) => e.id);
    const trato = tratoDe(ids.map((id) => estados[id]));
    const salon = j.elementos.find((e) => e.parte === parte && e.detalle.clase === "local" && e.detalle.local.id === "salon");
    filas.push({
      id: `tipo-${parte}`,
      titulo: red.unifamiliar ? "Vivienda" : `Viviendas ${t.nombre}`,
      detalle: red.unifamiliar
        ? `T${t.dormitorios} · ${t.locales.length} locales`
        : `T${t.dormitorios} · ${t.viviendas} ${t.viviendas === 1 ? "vivienda" : "viviendas"}`,
      trato: trato === "ko" ? "no cumple" : "se calcula",
      estado: trato,
      elementoId: salon?.id ?? ids[0],
      parte,
    });
  }
  for (const g of red.garajes) {
    filas.push({
      id: g.id,
      titulo: "Garaje",
      detalle: `${etiquetaNivel(g.nivel)} · ${g.plazas} ${g.plazas === 1 ? "plaza" : "plazas"}`,
      trato: `${fmt(g.caudal_l_s, undefined, 0)} l/s`,
      estado: tratoDe([estados[g.id], estados[`${g.id}-aberturas`], estados[`${g.id}-co`]]),
      elementoId: g.id,
      parte: "garaje",
    });
  }
  for (const t of red.trasteros) {
    filas.push({
      id: t.id,
      titulo: "Trasteros",
      detalle: `${etiquetaNivel(t.nivel)} · ${fmt(t.superficie_m2, "m²", 0)}`,
      trato: `${fmt(t.caudal_l_s, undefined, Math.abs(t.caudal_l_s - Math.round(t.caudal_l_s)) < 0.05 ? 0 : 1)} l/s`,
      estado: tratoDe([estados[t.id]]),
      elementoId: t.id,
      parte: "garaje",
    });
  }
  // Lo que va por el RITE: se dice, para que se vea que no se ha olvidado.
  const plantas = plantasDe(edificio);
  const nivelesDe = (uso: string) =>
    [...new Set(plantas.filter((p) => p.zonas.some((z) => z.uso === uso)).map((p) => p.nivel))].sort((a, b) => a - b);
  const locales = nivelesDe("local_sin_uso");
  if (locales.length > 0) {
    filas.push({
      id: "local",
      titulo: "Local",
      detalle: `${locales.map(etiquetaNivel).join(", ")} · sin uso definido`,
      trato: "RITE",
      estado: "out",
    });
  }
  const oficinas = nivelesDe("oficinas");
  if (oficinas.length > 0) {
    filas.push({
      id: "oficinas",
      titulo: "Oficinas",
      detalle: oficinas.length > 1 ? `${etiquetaNivel(oficinas[0])}–${etiquetaNivel(oficinas[oficinas.length - 1])}` : etiquetaNivel(oficinas[0]),
      trato: "RITE",
      estado: "out",
    });
  }
  if (!red.conViviendas && plantas.some((p) => p.zonas.some((z) => z.uso === "trasteros"))) {
    filas.push({ id: "trasteros-rite", titulo: "Trasteros", detalle: "sin viviendas en el edificio", trato: "RITE", estado: "out" });
  }
  return filas;
}
