// =============================================================================
// DB-HE1 — «Qué entra» (feature-15, HE1): la zona climática, la envolvente y sus
// cerramientos con su U frente al límite, en filas listas para `QueEntra`.
// Pulsar un cerramiento cambia el dibujo. PURA.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { cerramientoDe, rolesDe, type JustificacionHe1 } from "./justificacion";
import { composicionCorta, descripcionEnvolvente, lugar } from "./textos";

function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

export function filasQueEntraHe1(
  j: JustificacionHe1,
  zonaCompleta: string | null,
  estados: Record<string, EstadoPresentacion>,
): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [
    {
      id: "zona",
      titulo: "Zona climática",
      detalle: lugar(j) || "La obra sin emplazamiento",
      trato: zonaCompleta ?? j.zona,
      estado: "normal",
    },
    {
      id: "envolvente",
      titulo: "Envolvente",
      detalle: descripcionEnvolvente(j),
      trato: `${rolesDe(j.propuesta).length} cerramientos`,
      estado: "normal",
    },
  ];
  for (const rol of rolesDe(j.propuesta)) {
    const el = cerramientoDe(j, rol);
    const r = el.detalle.r;
    filas.push({
      id: rol,
      titulo: el.nombre,
      detalle: composicionCorta(j, rol),
      trato: `${n2(r.u_W_m2K)} / ${r.ulim_W_m2K === null ? "—" : n2(r.ulim_W_m2K)}`,
      estado: estados[rol] === "ko" ? "ko" : "normal",
      elementoId: rol,
    });
  }
  return filas;
}
