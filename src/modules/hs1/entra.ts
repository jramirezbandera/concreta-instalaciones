// =============================================================================
// DB-HS1 — «Qué entra» (feature-17): las partes de la envolvente que salen de El
// edificio y el grado de cada una, en filas listas para `QueEntra`. PURA.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { etiquetaNivel, formatoCota } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { JustificacionHs1 } from "./justificacion";
import { textoFreatico } from "./textos";

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

const NOMBRE_CUBIERTA = {
  plana_transitable: "plana transitable",
  plana_no_transitable: "plana no transitable",
  inclinada: "inclinada",
} as const;

export function filasQueEntraHs1(j: JustificacionHs1, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    switch (d.clase) {
      case "terreno":
        filas.push({
          id: "terreno",
          titulo: "Terreno",
          detalle: `freático ${textoFreatico(d.freatico)}`,
          trato: `presencia ${d.presencia.valor}`,
          estado: trato(estados.terreno),
          elementoId: "terreno",
        });
        break;
      case "muro": {
        const s = j.partes.sotanos!;
        filas.push({
          id: "muro",
          titulo: el.nombre,
          detalle: `${s.niveles.map(etiquetaNivel).join("–")} · ${fmt(d.alturaEnterrada_m, "m", 1)} enterrados`,
          trato: `grado ${d.grado}`,
          estado: trato(estados.muro),
          elementoId: "muro",
        });
        break;
      }
      case "suelo":
        filas.push({
          id: el.id,
          titulo: el.nombre,
          detalle: `${etiquetaNivel(d.suelo.nivel)} · ${formatoCota(d.suelo.cota_m)} · ${fmt(d.suelo.superficie_m2, "m²", 0)}`,
          trato: `grado ${d.grado}`,
          estado: trato(estados[el.id]),
          elementoId: el.id,
        });
        break;
      case "fachada":
        filas.push({
          id: "fachada",
          titulo: "Fachadas",
          detalle: `${fmt(d.altura_m, "m", 1)} de coronación · ${d.exposicion}`,
          trato: `grado ${d.grado}`,
          estado: trato(estados.fachada),
          elementoId: "fachada",
        });
        break;
      case "cubierta":
        filas.push({
          id: "cubierta",
          titulo: "Cubierta",
          detalle: `${NOMBRE_CUBIERTA[d.cubierta.tipo]} · ${fmt(j.partes.cubierta.superficie_m2, "m²", 0)}`,
          // Lo que se le exige es la pendiente: el grado es único.
          trato: d.cubierta.pendiente
            ? d.cubierta.pendiente.estricta
              ? `> ${d.cubierta.pendiente.min_pct} %`
              : `${d.cubierta.pendiente.min_pct}–${d.cubierta.pendiente.max_pct} %`
            : "grado único",
          estado: trato(estados.cubierta),
          elementoId: "cubierta",
        });
        break;
      default:
        break;
    }
  }
  return filas;
}
