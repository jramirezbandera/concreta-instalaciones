// Piezas de presentación de El edificio que comparten la sección y el editor
// (feature-12). Fuera de los componentes para que el fast refresh funcione.

import type { ClaseFachada, SolFachada, SolForjado, SolVentana } from "../../lib/constructivo/catalogo";
import { MATERIALES_CEC } from "../../lib/constructivo/materiales";
import { viviendasEnZona } from "../../lib/edificio/derivar";
import type { Edificio, TipoCubierta, Zona } from "../../lib/edificio/tipos";

/** Lo seleccionado en la sección: se edita en la columna izquierda. */
export type Seleccion =
  | { tipo: "grupo"; id: string }
  | { tipo: "zona"; id: string }
  | { tipo: "unidad"; id: string }
  | { tipo: "cubierta" }
  | { tipo: "cerramientos" };

export const ETIQUETA_CUBIERTA: Record<TipoCubierta, string> = {
  plana_no_transitable: "Cubierta plana",
  plana_transitable: "Cubierta plana transitable",
  inclinada: "Cubierta inclinada",
};

/** La línea pequeña de cada zona: «2 por planta · A · B», «14 plazas»… */
export function detalleZona(e: Edificio, z: Zona): string {
  switch (z.uso) {
    case "viviendas": {
      const n = viviendasEnZona(e, z);
      const tipos = (z.unidades ?? [])
        .filter((u) => u.cantidad > 0)
        .map((u) => {
          const t = e.unidades.find((x) => x.id === u.tipoId);
          const nombre = t?.nombre ?? u.tipoId;
          return u.cantidad > 1 ? `${nombre} ×${u.cantidad}` : nombre;
        });
      return n === 0 ? "sin viviendas asignadas" : [`${n} por planta`, ...tipos].join(" · ");
    }
    case "vivienda_unifamiliar":
      return z.nota ?? "la vivienda";
    case "local_sin_uso":
      return "actividad por definir";
    case "oficinas": {
      const n = (z.unidades ?? []).reduce((a, u) => a + Math.max(0, u.cantidad), 0);
      return n === 1 ? "1 núcleo de aseos" : `${n} núcleos de aseos`;
    }
    case "garaje":
      return `${z.plazas ?? 0} plazas`;
    case "garaje_privado":
      return "de la vivienda";
    case "trasteros":
      return `${z.numero ?? 0} trasteros`;
    case "instalaciones":
      return z.nota ?? "cuarto técnico";
    case "vestibulo":
      return "acceso";
    case "zona_comun":
      return "zona común";
  }
}

// ── Cerramientos (feature-26) ───────────────────────────────────────────────

export const CLASE_FACHADA: Record<ClaseFachada, string> = {
  dos_hojas: "dos hojas",
  una_hoja: "una hoja con SATE",
  ventilada: "ventilada sobre una hoja",
  ligera: "ligera",
};

const n2 = (x: number) => x.toFixed(2).replace(".", ",");

export function lineaFachada(f: SolFachada): string {
  return `${CLASE_FACHADA[f.clase]} · ${MATERIALES_CEC[f.aislante].nombre} · CEC ${f.codigo}, p. ${f.pagina}`;
}

export function lineaVentana(v: SolVentana): string {
  return `RA,tr ${v.RAtr} dBA · CEC ${v.codigo}, p. ${v.pagina}`;
}

export function lineaForjado(f: SolForjado): string {
  return `m ${f.m} kg/m² · R ${n2(f.R)} m²K/W · CEC ${f.codigo}, p. ${f.pagina}`;
}
