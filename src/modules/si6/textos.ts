// =============================================================================
// DB-SI, SI 6 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada planta y de las dimensiones del Anejo C, las etiquetas y los
// avisos. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { USOS } from "../../lib/edificio/usos";
import type { TextoSi } from "../si/definicion";
import { textoColumna } from "../si/textos";
import type { ElementoSi } from "../si/tipos";
import type { TipoForjado } from "./estado";
import type { DetalleSi6, ElementoSi6, JustificacionSi6, MotivoR, RZona } from "./justificacion";
import { BIDIRECCIONALES_C5, LOSAS_C4, SOPORTES_C2, VIGAS_C3, type ClaseR } from "./tablas";

function det(el: ElementoSi<unknown>): DetalleSi6 {
  return (el as ElementoSi6).detalle;
}

export const NOMBRE_MOTIVO: Record<MotivoR, string> = {
  residencial: "uso Residencial Vivienda",
  unifamiliar: "vivienda unifamiliar",
  comercial: "uso Comercial",
  aparcamiento_bajo: "garaje situado bajo otro uso",
  aparcamiento: "garaje de uso exclusivo o sobre otro uso",
  riesgo: "local de riesgo especial",
};

export const NOMBRE_FORJADO: Record<TipoForjado, string> = {
  unidireccional: "unidireccional de viguetas y bovedillas",
  reticular: "reticular (bidireccional)",
  losa: "losa maciza",
};

/** «uso Residencial Vivienda, h ≤ 15 m», «local de riesgo especial bajo». */
export function porQueR(r: RZona, h_m: number): string {
  if (r.motivo === "riesgo") return `local de riesgo especial ${r.local?.clase ?? ""} (tabla 3.2), nunca menos que su planta`;
  if (r.motivo === "aparcamiento_bajo" || r.motivo === "aparcamiento") return NOMBRE_MOTIVO[r.motivo];
  return `${NOMBRE_MOTIVO[r.motivo]}${r.supuesto ? " (supuesto)" : ""}, ${textoColumna(r.zona.bajoRasante, h_m)}`;
}

function clase(r: number): ClaseR {
  return ([30, 60, 90, 120, 180, 240] as const).find((c) => c >= r) ?? 240;
}

/** «200/20» (b_mín / a_m en mm). */
function ba(par: readonly [number, number] | readonly number[]): string {
  return `${par[0]}/${par[1]}`;
}

/** Lo que pide el Anejo C para un forjado de cierto tipo y una R. */
export function textoForjado(tipo: TipoForjado, r: number, sinRevestir: boolean): string {
  const k = clase(r);
  if (tipo === "losa") return `losa h ≥ ${LOSAS_C4.datos[k].hmin} mm, a ≥ ${LOSAS_C4.datos[k].unaDireccion} mm`;
  if (tipo === "reticular") {
    const t = BIDIRECCIONALES_C5.datos[k];
    return `nervio b/a ${t.opciones.map(ba).join(" · ")} mm, h ≥ ${t.hmin} mm`;
  }
  if (sinRevestir || r > 120) {
    const t = VIGAS_C3.datos[k];
    return `nervios como vigas: alma ≥ ${t.alma} mm, b/a ${ba(t.opciones[0])} mm (bovedilla cerámica ×2)`;
  }
  return `a ≥ ${LOSAS_C4.datos[k].unaDireccion} mm, con bovedilla y techo revestido`;
}

/** «soportes ≥ 250 mm, a ≥ 40 mm». */
export function textoSoporte(r: number): string {
  const s = SOPORTES_C2.datos[clase(r)].soporte;
  const min = Math.max(s[0], SOPORTES_C2.datos.soporteEnObraMin_mm);
  return `soportes ≥ ${min} mm, a ≥ ${s[1]} mm`;
}

// -----------------------------------------------------------------------------
// La cabecera
// -----------------------------------------------------------------------------

export function fraseSi6(j: JustificacionSi6): string {
  const plantas = j.elementos.flatMap((el) => (el.detalle.clase === "planta" ? [el.detalle] : []));
  const partes = plantas.map((p) => `R ${p.R} en ${p.plantas}${p.manda.motivo === "residencial" || p.manda.motivo === "unifamiliar" ? "" : ` (${p.manda.motivo === "riesgo" ? "local de riesgo" : p.manda.motivo === "comercial" ? "local" : "garaje"})`}`);
  return `La estructura necesita ${listaY(partes)}.`;
}

export function metricasSi6(j: JustificacionSi6): string {
  const Rs = [...new Set(j.plantas.map((p) => p.R))].sort((a, b) => a - b);
  return Rs.map((r) => `R ${r}`).join(" · ");
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

export function queEntraSi6(j: JustificacionSi6, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  return j.elementos.map((el) => {
    const d = el.detalle;
    if (d.clase === "planta") {
      const usos = [...new Set(d.zonas.map((z) => USOS[z.zona.uso].etiqueta))];
      return { id: el.id, titulo: d.plantas, detalle: usos.join(", "), trato: `R ${d.R}`, estado: trato(estados[el.id]), elementoId: el.id };
    }
    return { id: el.id, titulo: el.nombre, detalle: d.clase === "hormigon" ? "dimensiones del Anejo C" : "se justifica aparte", trato: "valor" in el.valor ? "" : el.valor.texto, estado: trato(estados[el.id]), elementoId: el.id };
  });
}

export function textoEtiquetaSi6(el: ElementoSi<unknown>): string {
  const d = det(el);
  if (d.clase === "planta") return `R ${d.R}`;
  if (d.clase === "hormigon") return `Anejo C`;
  return d.material === "acero" ? "acero · Anejo D" : "madera · Anejo E";
}

export function resultadoListaSi6(el: ElementoSi<unknown>): string {
  const d = det(el);
  if (d.clase === "planta") return `R ${d.R} · ${NOMBRE_MOTIVO[d.manda.motivo]}`;
  if (d.clase === "hormigon") return d.Rs.map((r) => `R ${r}: ${textoSoporte(r)}`).join(" · ");
  return `R ${d.Rs.join(", ")}: se justifica con el ${d.material === "acero" ? "Anejo D" : "Anejo E"} o por ensayo`;
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSi6(el: ElementoSi<unknown>, j: JustificacionSi6, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  const h = j.comp.h_m;
  if (d.clase === "planta") {
    const m = d.manda;
    return {
      clase: `Estructura · ${m.motivo === "riesgo" ? "tabla 3.2" : "tabla 3.1"}`,
      titulo: el.nombre,
      valor: `R ${d.R}`,
      unidad: "soportes y forjado de techo",
      estado,
      manda: `Manda ${porQueR(m, h)}${m.zona.uso === "local_sin_uso" && m.supuesto ? ": el local sin actividad se trata como Comercial para no condicionar su uso futuro" : ""}. El forjado de techo lleva la R del sector que tiene debajo, que es esta planta.`,
      filas: d.zonas.map((z) => ({ k: `${USOS[z.zona.uso].etiqueta}`, v: `R ${z.R} · ${z.motivo === "riesgo" ? `riesgo ${z.local?.clase}` : NOMBRE_MOTIVO[z.motivo]}` })),
      cita: "DB-SI · SI 6 ap. 3 · tablas 3.1 y 3.2",
    };
  }
  if (d.clase === "hormigon") {
    const dec = j.decisiones;
    return {
      clase: "Hormigón armado · Anejo C",
      titulo: "Dimensiones mínimas",
      valor: `R ${d.Rs[d.Rs.length - 1]}`,
      unidad: "la mayor",
      estado,
      manda: `Las tablas del Anejo C dan, para cada R, la dimensión mínima b y la distancia mínima equivalente al eje de las armaduras a. Forjado ${NOMBRE_FORJADO[dec.forjado]}${d.garaje ? `; techo del garaje ${dec.techoGaraje === "sin_revestir" ? "sin revestir" : "revestido"}` : ""}.`,
      nota: "Desde R 90, los negativos de los forjados continuos se prolongan hasta el 33 % del tramo con el 25 % de la cuantía. El guarnecido de yeso cuenta 1,8 veces su espesor; el mortero de cemento, nada.",
      filas: d.Rs.flatMap((r) => {
        const enGaraje = d.garaje && j.plantas.some((p) => p.R === r && p.zonas.some((z) => z.zona.uso === "garaje"));
        return [
          { k: `R ${r} · soportes`, v: textoSoporte(r).replace("soportes ", "") },
          { k: `R ${r} · vigas (b/a)`, v: VIGAS_C3.datos[clase(r)].opciones.map(ba).join(" · ") },
          { k: `R ${r} · forjado`, v: textoForjado(dec.forjado, r, enGaraje && dec.techoGaraje === "sin_revestir") },
        ];
      }),
      cita: "DB-SI · SI 6 · Anejo C, tablas C.2 a C.5",
    };
  }
  return {
    clase: "Estructura",
    titulo: el.nombre,
    valor: d.material === "acero" ? "Anejo D" : "Anejo E",
    estado,
    manda: `La herramienta da la R exigida (${d.Rs.map((r) => `R ${r}`).join(", ")}); la de una estructura de ${d.material} se justifica con el ${d.material === "acero" ? "Anejo D" : "Anejo E"}, con protección o por ensayo.`,
    filas: d.Rs.map((r) => ({ k: `R ${r}`, v: "a justificar" })),
    cita: `DB-SI · SI 6 · ${d.material === "acero" ? "Anejo D" : "Anejo E"}`,
  };
}

export function textoAvisoSi6(a: Aviso): TextoSi {
  switch (a.id) {
    case "sector-sotano":
      return {
        titulo: "El sector de las viviendas baja al sótano.",
        detalle:
          "La tabla da R de sótano a las plantas bajo rasante y la de su altura a las demás. Un comentario del Ministerio (no reglamentario) pide la R de sótano en todo el sector; para evitarlo, el sótano puede ser un sector propio.",
      };
    case "unifamiliar-alta":
      return {
        titulo: "La tabla no da valor para una unifamiliar de más de 15 m.",
        detalle: "Se ha tomado la fila de Residencial Vivienda. Revísalo.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function describirDibujoSi6(j: JustificacionSi6): string {
  return `Sección del edificio con la resistencia al fuego que necesita la estructura de cada planta: ${fraseSi6(j).replace(/^La estructura necesita /, "").replace(/\.$/, "")}.`;
}

/** Las piezas de la fila de La obra: las R que aparecen. */
export function piezasSi6(j: JustificacionSi6): { texto: string; acento: boolean }[] {
  return [...new Set(j.plantas.map((p) => p.R))].sort((a, b) => a - b).map((r) => ({ texto: `R ${r}`, acento: false }));
}
