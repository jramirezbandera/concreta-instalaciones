// =============================================================================
// DB-HS4 — «Qué entra» (feature-15, HS4): las partes de El edificio que toca el
// suministro de agua y cómo las trata, en filas listas para `QueEntra`. PURA.
// =============================================================================

import type { FilaQueEntra, TratoQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { JustificacionHs4 } from "./justificacion";
import type { UnidadHs4 } from "./red";

function rango(niveles: number[]): string {
  if (niveles.length === 0) return "";
  const a = Math.min(...niveles);
  const b = Math.max(...niveles);
  return a === b ? etiquetaNivel(a) : `${etiquetaNivel(a)}–${etiquetaNivel(b)}`;
}

function tratoDe(e: EstadoPresentacion | undefined): TratoQueEntra {
  if (e === "ko") return "ko";
  if (e === "rv") return "rv";
  if (e === "pv") return "pv";
  return "normal";
}

function peorEstado(es: (EstadoPresentacion | undefined)[]): EstadoPresentacion | undefined {
  if (es.includes("ko")) return "ko";
  if (es.includes("rv")) return "rv";
  return es.find((e) => e !== undefined);
}

/** «A 11 aparatos · B 10», por tipo. */
function aparatosPorTipo(us: UnidadHs4[]): string {
  const vistos = new Map<string, UnidadHs4>();
  for (const u of us) if (!vistos.has(u.tipoId)) vistos.set(u.tipoId, u);
  const xs = [...vistos.values()];
  if (xs.length === 1) return `${xs[0].numAparatos} aparatos cada una`;
  return xs.map((u) => `${u.nombreTipo} ${u.numAparatos}`).join(" · ") + " ap.";
}

export function filasQueEntraHs4(j: JustificacionHs4, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const red = j.red;
  const viviendas = red.unidades.filter((u) => u.clase === "vivienda");
  const oficinas = red.unidades.filter((u) => u.clase === "oficinas");
  const presiones = j.elementos.filter((e) => e.detalle.clase === "planta");
  const critico = presiones.find((e) => e.detalle.clase === "planta" && e.detalle.critico) ?? presiones[0];
  const enNiveles = (us: UnidadHs4[]) => new Set(us.flatMap((u) => u.cuartos.map((c) => c.nivel)));

  if (viviendas.length > 0) {
    const ns = enNiveles(viviendas);
    const ids = presiones.filter((e) => e.detalle.clase === "planta" && e.detalle.nivel !== null && ns.has(e.detalle.nivel)).map((e) => e.id);
    const estado = peorEstado(ids.map((id) => estados[id]));
    filas.push({
      id: "viviendas",
      titulo: red.unifamiliar ? "Vivienda" : "Viviendas",
      detalle: red.unifamiliar
        ? `${rango([...ns])} · ${viviendas[0].numAparatos} aparatos`
        : `${rango([...ns])} · ${viviendas.length} · ${aparatosPorTipo(viviendas)}`,
      trato: j.modo === "manual" ? "a mano" : estado === "ko" ? "no cumple" : "se calcula",
      estado: j.modo === "manual" ? "out" : tratoDe(estado),
      elementoId: ids.includes(critico?.id ?? "") ? critico?.id : ids[0],
    });
  }
  if (oficinas.length > 0) {
    const ns = enNiveles(oficinas);
    const ids = presiones.filter((e) => e.detalle.clase === "planta" && e.detalle.nivel !== null && ns.has(e.detalle.nivel)).map((e) => e.id);
    const estado = peorEstado(ids.map((id) => estados[id]));
    filas.push({
      id: "oficinas",
      titulo: "Oficinas",
      detalle: `${rango([...ns])} · ${oficinas.length} ${oficinas.length === 1 ? "planta" : "plantas"} · aseos`,
      trato: j.modo === "manual" ? "a mano" : estado === "ko" ? "no cumple" : "se calcula",
      estado: j.modo === "manual" ? "out" : tratoDe(estado),
      elementoId: ids[0],
    });
  }
  if (red.oficinasSinNucleos) {
    filas.push({ id: "oficinas-sin", titulo: "Oficinas", detalle: "sin núcleos de aseos", trato: "sin consumo", estado: "out" });
  }
  for (const el of j.elementos) {
    if (el.detalle.clase !== "local") continue;
    const l = el.detalle.local;
    filas.push({
      id: el.id,
      titulo: l.numero > 1 ? "Locales" : "Local",
      detalle: `${etiquetaNivel(l.nivel)} · sin uso definido`,
      trato: "previsto",
      estado: "pv",
      elementoId: el.id,
    });
  }
  if (j.resultado) {
    const e = estados["presion-red"];
    filas.push({
      id: "acometida",
      titulo: "Acometida",
      detalle: j.presionSinDato ? `red · ${fmt(j.presionRed_kPa, "kPa", 0)} sin dato` : `red · ${fmt(j.presionRed_kPa, "kPa", 0)}`,
      trato: j.presionSinDato ? "sin dato" : e === "rv" ? "supuesta" : "confirmada",
      estado: e === "rv" || j.presionSinDato ? "rv" : "normal",
      elementoId: "presion-red",
    });
  }
  if (red.grifosGaraje > 0 && j.modo !== "manual") {
    // Los grifos van con la vivienda (unifamiliar) o con los servicios comunes.
    const ns = new Set(
      red.unidades.flatMap((u) => u.cuartos.filter((g) => g.cuartos.some((c) => c.clase === "garaje")).map((g) => g.nivel)),
    );
    const ids = presiones.filter((e) => e.detalle.clase === "planta" && e.detalle.nivel !== null && ns.has(e.detalle.nivel)).map((e) => e.id);
    const estado = peorEstado(ids.map((id) => estados[id]));
    const n = red.grifosGaraje;
    filas.push({
      id: "garaje",
      titulo: "Garaje",
      detalle: `${rango([...ns])} · ${n === 1 ? "1 grifo" : `${n} grifos`} de baldeo`,
      trato: estado === "ko" ? "no cumple" : "se calcula",
      estado: tratoDe(estado),
      elementoId: ids[0],
    });
  } else if (red.garaje) {
    filas.push({ id: "garaje", titulo: "Garaje", detalle: "sin puntos de consumo", trato: "no aplica", estado: "out" });
  }
  return filas;
}
