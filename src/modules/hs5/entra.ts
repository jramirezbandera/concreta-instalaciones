// =============================================================================
// DB-HS5 — «Qué entra» (feature-14 §H): las partes de El edificio que toca la
// evacuación y cómo las trata, en filas listas para `QueEntra`. PURA.
// =============================================================================

import type { FilaQueEntra, TratoQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { etiquetaNivel, formatoCota, resumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { fmt } from "../../lib/units/format";
import type { JustificacionHs5 } from "./justificacion";
import type { VerticalHs5 } from "./red";

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

/** El peor estado de varios elementos. */
function peorEstado(es: (EstadoPresentacion | undefined)[]): EstadoPresentacion | undefined {
  if (es.includes("ko")) return "ko";
  if (es.includes("rv")) return "rv";
  return es.find((e) => e !== undefined);
}

function tiposUd(vs: VerticalHs5[]): string {
  const vistos = new Map<string, VerticalHs5>();
  for (const v of vs) if (!vistos.has(v.tipoId)) vistos.set(v.tipoId, v);
  return [...vistos.values()].map((v) => `${v.nombre} ${fmt(v.udUnidad, "UD")}`).join(" · ");
}

const SIN_APARATOS: Partial<Record<UsoZona, string>> = {
  zona_comun: "portal",
  vestibulo: "vestíbulo",
  trasteros: "trasteros",
  instalaciones: "instalaciones",
};

export function filasQueEntra(
  j: JustificacionHs5,
  edificio: Edificio,
  estados: Record<string, EstadoPresentacion>,
): { filas: FilaQueEntra[]; sinAparatos: string | null } {
  const filas: FilaQueEntra[] = [];
  const r = resumenEdificio(edificio);
  const viviendas = j.red.verticales.filter((v) => v.clase === "vivienda");
  const nucleos = j.red.verticales.filter((v) => v.clase === "nucleo_aseos");
  const idsBajantes = (vs: VerticalHs5[]) => vs.flatMap((v) => v.bajantes.flatMap((b) => (b.id ? [b.id] : [])));

  if (viviendas.length > 0) {
    const ids = idsBajantes(viviendas);
    const estado = peorEstado(ids.map((id) => estados[id]));
    filas.push({
      id: "viviendas",
      titulo: r.esUnifamiliar ? "Vivienda" : "Viviendas",
      detalle: r.esUnifamiliar
        ? `${rango(viviendas.flatMap((v) => v.niveles))} · ${fmt(viviendas[0].udUnidad, "UD")}`
        : `${rango(viviendas.flatMap((v) => v.niveles))} · ${r.numViviendas} · ${tiposUd(viviendas)}`,
      trato: j.modo === "manual" ? "a mano" : estado === "ko" ? "no cumple" : "se calcula",
      estado: j.modo === "manual" ? "out" : tratoDe(estado),
      elementoId: ids[0] ?? j.red.colectorId ?? undefined,
    });
  }
  if (nucleos.length > 0) {
    const ids = idsBajantes(nucleos);
    const estado = peorEstado(ids.map((id) => estados[id]));
    const n = nucleos.reduce((s, v) => s + v.instancias * v.niveles.length, 0);
    filas.push({
      id: "nucleos",
      titulo: "Aseos de oficinas",
      detalle: `${rango(nucleos.flatMap((v) => v.niveles))} · ${n} ${n === 1 ? "núcleo" : "núcleos"} · ${tiposUd(nucleos)}`,
      trato: j.modo === "manual" ? "a mano" : estado === "ko" ? "no cumple" : "se calcula",
      estado: j.modo === "manual" ? "out" : tratoDe(estado),
      elementoId: ids[0],
    });
  }
  if (j.red.oficinasSinNucleos) {
    filas.push({ id: "oficinas", titulo: "Oficinas", detalle: "sin núcleos de aseos", trato: "sin red", estado: "out" });
  }
  for (const el of j.elementos) {
    const det = el.detalle;
    if (det.clase === "local") {
      filas.push({
        id: el.id,
        titulo: det.local.numero > 1 ? "Locales" : "Local",
        detalle: `${etiquetaNivel(det.local.nivel)} · sin uso definido`,
        trato: "previsión",
        estado: "pv",
        elementoId: el.id,
      });
    }
    if (det.clase === "garaje") {
      const g = det.garaje;
      filas.push({
        id: el.id,
        titulo: "Garaje",
        detalle: [etiquetaNivel(g.nivel), g.plazas > 0 ? `${g.plazas} plazas` : null, formatoCota(g.cota_m)]
          .filter(Boolean)
          .join(" · "),
        trato: det.bombeo ? "bombeo" : "gravedad",
        estado: tratoDe(estados[el.id]),
        elementoId: el.id,
      });
    }
  }
  if (j.pluviales) {
    const i = j.intensidad;
    filas.push({
      id: "cubierta",
      titulo: "Cubierta",
      detalle: `${fmt(j.pluviales.superficie_m2, "m²", 0)} · ${fmt(i.valor_mm_h, "mm/h", 0)}${i.supuesta ? " supuesta" : ""}`,
      trato: "pluviales",
      estado: tratoDe(peorEstado([estados["pluviales-bajantes"], estados["pluviales-colector"]])),
      elementoId: "pluviales-bajantes",
    });
  }

  // Lo que no tiene aparatos: se dice, para que se vea que no se ha olvidado.
  const usos = new Set(edificio.grupos.flatMap((g) => g.zonas.map((z) => z.uso)));
  const sin = [...usos].map((u) => SIN_APARATOS[u]).filter((x): x is string => !!x);
  const lista = sin.length <= 1 ? (sin[0] ?? "") : `${sin.slice(0, -1).join(", ")} y ${sin[sin.length - 1]}`;
  const sinAparatos = lista === "" ? null : `${lista.charAt(0).toUpperCase()}${lista.slice(1)}: sin aparatos que evacuar.`;
  return { filas, sinAparatos };
}
