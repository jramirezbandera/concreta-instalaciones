// =============================================================================
// DB-SI, SI 2 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas, los avisos y la memoria. PURAS.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion, MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { TextoSi } from "../si/definicion";
import type { SectorSi } from "../si/sectores";
import type { ElementoSi } from "../si/tipos";
import type { DetalleSi2, ElementoSi2, Encuentro, JustificacionSi2 } from "./justificacion";
import { CUBIERTAS_SI2, FACHADAS_SI2 } from "./tablas";

const F = FACHADAS_SI2.datos;
const C = CUBIERTAS_SI2.datos;

function det(el: ElementoSi<unknown>): DetalleSi2 {
  return (el as ElementoSi2).detalle;
}

function m(v: number): string {
  return fmt(v, "m", 2);
}

function nombreSector(s: SectorSi, unifamiliar: boolean): string {
  if (s.principal) return unifamiliar ? "la vivienda" : s.uso === "administrativo" ? "las oficinas" : "las viviendas";
  if (s.id === "garaje") return "el garaje";
  if (s.id === "oficinas") return "las oficinas";
  if (s.id === "viviendas") return "las viviendas";
  return "el local";
}

function textoEncuentro(x: Encuentro, unifamiliar: boolean): string {
  return `${x.donde} (${nombreSector(x.entre[0], unifamiliar)} y ${nombreSector(x.entre[1], unifamiliar)})`;
}

export function fraseSi2(j: JustificacionSi2): string {
  const partes: string[] = [];
  const med = j.elementos.find((e) => e.id === "medianeras")!.detalle as Extract<DetalleSi2, { clase: "medianeras" }>;
  partes.push(med.tiene ? `Medianeras EI ${F.medianeria_EI}` : "Sin medianeras");
  if (j.elementos.some((e) => e.id === "vertical")) partes.push(`franja de 1 m EI 60 entre sectores`);
  const hor = j.elementos.find((e) => e.id === "horizontal")?.detalle;
  if (hor && hor.clase === "horizontal") partes.push(`huecos de sectores distintos a ${m(hor.d_m)}`);
  const r = j.elementos.find((e) => e.id === "reaccion")!.detalle as Extract<DetalleSi2, { clase: "reaccion" }>;
  partes.push(`fachada de ${m(r.altura_m)}: ${r.sistemas}`);
  return `${partes.join("; ")}.`;
}

export function metricasSi2(j: JustificacionSi2): string {
  return `fachada ${m(j.altura_m)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraSi2(j: JustificacionSi2, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const uni = j.comp.edificio.resumen.esUnifamiliar;
  return j.elementos.map((el) => {
    const d = el.detalle;
    const detalle =
      d.clase === "medianeras"
        ? d.tiene ? "entre medianeras" : "edificio aislado"
        : d.clase === "vertical"
          ? d.encuentros.length > 0 ? listaY(d.encuentros.map((x) => x.donde)) : "entre plantas"
          : d.clase === "horizontal"
            ? listaY(d.encuentros.map((x) => textoEncuentro(x, uni)))
            : d.clase === "reaccion"
              ? `${m(d.altura_m)} de altura`
              : "encuentros y acabado";
    return { id: el.id, titulo: el.nombre, detalle, trato: textoEtiquetaSi2(el), estado: trato(estados[el.id]), elementoId: el.id };
  });
}

export function textoEtiquetaSi2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "medianeras":
      return d.tiene ? `medianera EI ${F.medianeria_EI}` : "sin medianeras";
    case "vertical":
      return "franja 1 m EI 60";
    case "horizontal":
      return `huecos a ≥ ${m(d.d_m)}`;
    case "reaccion":
      return d.sistemas;
    case "cubierta":
      return d.medianeras ? "REI 60 · 0,50 m" : C.broof;
  }
}

export function resultadoListaSi2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "medianeras":
      return d.tiene ? `elementos separadores de otro edificio EI ${F.medianeria_EI}` : "el edificio no tiene medianerías";
    case "vertical":
      return `fachada EI ${F.franja_EI} en una franja de ${m(F.franjaAltura_m)} entre sectores${d.porPlantas ? " (y entre plantas)" : ""}`;
    case "horizontal":
      return `puntos no EI 60 de sectores distintos a ≥ ${m(d.d_m)} (α = ${d.alfa}°)`;
    case "reaccion":
      return `sistemas de fachada ${d.sistemas}${d.aislante ? ` · aislante en cámara ${d.aislante}` : ""}${d.arranque ? ` · ${F.arranqueClase} hasta ${m(F.arranqueHasta_m)}` : ""}`;
    case "cubierta":
      return `${d.medianeras ? `REI ${C.franja_REI} en ${m(C.franjaColindante_m)} junto al colindante · ` : ""}${C.broof} a menos de ${fmt(C.broofDistancia_m, "m", 0)} de fachadas no EI 60`;
  }
}

export function franjaSi2(el: ElementoSi<unknown>, j: JustificacionSi2, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  const uni = j.comp.edificio.resumen.esUnifamiliar;
  switch (d.clase) {
    case "medianeras":
      return {
        clase: "Medianerías · ap. 1 pto 1",
        titulo: el.nombre,
        valor: d.tiene ? `EI ${F.medianeria_EI}` : "No tiene",
        estado,
        manda: d.tiene
          ? "Los elementos verticales que separan el edificio de otro deben ser al menos EI 120, con cualquier altura."
          : "El edificio es aislado: no hay elementos separadores de otro edificio. Las unifamiliares adosadas de un mismo proyecto no son medianería entre sí: basta EI 60 entre viviendas.",
        filas: [{ k: "Separación con otro edificio", v: d.tiene ? `EI ${F.medianeria_EI}` : "—" }],
        cita: "DB-SI · SI 2 ap. 1 pto 1",
      };
    case "vertical":
      return {
        clase: "Fachadas · ap. 1 pto 3",
        titulo: el.nombre,
        valor: `EI ${F.franja_EI}`,
        unidad: `en ${m(F.franjaAltura_m)} de altura`,
        estado,
        manda: "Donde un sector queda encima de otro, la fachada es EI 60 en una franja de 1 m de altura, medida sobre su plano, o menos lo que vuele un saliente que impida el paso de las llamas.",
        filas: [
          ...d.encuentros.map((x) => ({ k: x.donde, v: `${nombreSector(x.entre[0], uni)} / ${nombreSector(x.entre[1], uni)}` })),
          ...(d.porPlantas ? [{ k: "Sectores por plantas", v: "en cada forjado entre plantas" }] : []),
        ],
        cita: "DB-SI · SI 2 ap. 1 pto 3",
      };
    case "horizontal":
      return {
        clase: "Fachadas · ap. 1 pto 2",
        titulo: el.nombre,
        valor: fmt(d.d_m, undefined, 2),
        unidad: `m entre huecos (α = ${d.alfa}°)`,
        estado,
        manda: "Los puntos de fachada que no son al menos EI 60, de sectores distintos en una misma planta, se separan la distancia d que da el ángulo entre sus fachadas: 0,50 m en un mismo plano y 2,00 m en esquina.",
        filas: [...d.encuentros.map((x) => ({ k: x.donde, v: textoEncuentro(x, uni) })), { k: "Ángulo α", v: `${d.alfa}°` }, { k: "Distancia d", v: m(d.d_m) }],
        cita: "DB-SI · SI 2 ap. 1 pto 2",
      };
    case "reaccion":
      return {
        clase: "Reacción al fuego · ap. 1 ptos 4 a 6",
        titulo: el.nombre,
        valor: d.sistemas,
        unidad: "sistemas de fachada",
        estado,
        manda: `Por la altura total de la fachada (${m(d.altura_m)}, hasta la coronación): ${d.sistemas} en los sistemas que ocupen más del 10 % de su superficie, incluidas las capas interiores no protegidas por una capa EI 30.`,
        filas: [
          { k: "Altura de la fachada", v: m(d.altura_m) },
          { k: "Sistemas de fachada", v: d.sistemas },
          { k: "Aislante en cámara ventilada", v: d.aislante ?? "no hay cámara ventilada" },
          { k: "Arranque accesible al público", v: d.arranque ? `${F.arranqueClase} hasta ${m(F.arranqueHasta_m)}` : "no se exige" },
        ],
        cita: "DB-SI · SI 2 ap. 1 ptos 4, 5 y 6",
      };
    case "cubierta":
      return {
        clase: "Cubiertas · ap. 2",
        titulo: el.nombre,
        valor: d.medianeras ? `REI ${C.franja_REI}` : C.broof,
        unidad: d.medianeras ? `en ${m(C.franjaColindante_m)} junto al colindante` : "junto a fachadas",
        estado,
        manda: d.medianeras
          ? `La cubierta es REI 60 en una franja de 0,50 m desde el edificio colindante, o la medianería se prolonga 0,60 m por encima de su acabado.`
          : "Sin medianeras ni sectores que lleguen a la cubierta, no hay franjas que disponer.",
        filas: [
          ...(d.medianeras ? [{ k: "Junto al colindante", v: `REI ${C.franja_REI} en ${m(C.franjaColindante_m)} o prolongar ${m(C.prolongacion_m)}` }] : []),
          { k: "Sobre elementos entre sectores", v: `REI ${C.franja_REI} en ${m(C.franjaSector_m)}` },
          { k: `A menos de ${fmt(C.broofDistancia_m, "m", 0)} de fachadas no EI 60`, v: C.broof },
        ],
        cita: "DB-SI · SI 2 ap. 2",
      };
  }
}

export function textoAvisoSi2(a: Aviso): TextoSi {
  if (a.id === "peto") {
    return {
      titulo: "Un peto puede cambiar la clase de la fachada.",
      detalle: "La altura se ha tomado hasta el forjado de cubierta; con un peto de 1,10 m la fachada pasaría de un umbral (10, 18 o 28 m). Revisa la altura total.",
    };
  }
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function describirDibujoSi2(j: JustificacionSi2): string {
  return `Sección del edificio con las medianeras, las franjas de fachada entre sectores y la cubierta: ${fraseSi2(j).replace(/\.$/, "")}.`;
}

// -----------------------------------------------------------------------------
// La memoria
// -----------------------------------------------------------------------------

export function memoriaSi2(j: JustificacionSi2): MemoriaDoc {
  const uni = j.comp.edificio.resumen.esUnifamiliar;
  const parrafos: Trozo[][] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "medianeras") {
      parrafos.push(d.tiene ? ["Los elementos verticales separadores de otros edificios son al menos ", { v: `EI ${F.medianeria_EI}` }, " (SI 2, ap. 1 pto 1)."] : ["El edificio no tiene medianerías con otros edificios."]);
    }
    if (d.clase === "vertical") {
      parrafos.push([
        "Para limitar el riesgo de propagación vertical entre sectores, la fachada es al menos ",
        { v: `EI ${F.franja_EI}` },
        ` en una franja de ${m(F.franjaAltura_m)} de altura, reducida en la dimensión de los salientes aptos para impedir el paso de las llamas, en ${listaY([...d.encuentros.map((x) => textoEncuentro(x, uni)), ...(d.porPlantas ? ["cada forjado entre plantas de viviendas"] : [])])} (SI 2, ap. 1 pto 3).`,
      ]);
    }
    if (d.clase === "horizontal") {
      parrafos.push([
        `Los puntos de fachada que no son al menos EI 60 de sectores distintos en una misma planta (${listaY(d.encuentros.map((x) => textoEncuentro(x, uni)))}) están separados al menos `,
        { v: m(d.d_m) },
        `, para fachadas que forman un ángulo de ${d.alfa}° (SI 2, ap. 1 pto 2).`,
      ]);
    }
    if (d.clase === "reaccion") {
      const p: Trozo[] = [`Con una altura total de fachada de ${m(d.altura_m)}, los sistemas constructivos que ocupan más del 10 % de su superficie son de clase `, { v: d.sistemas }];
      if (d.aislante) p.push(`, y el aislamiento de la cámara ventilada, ${d.aislante}, con barreras E 30 en los forjados entre sectores`);
      if (d.arranque) p.push(`; en el arranque, accesible al público, ${F.arranqueClase} hasta ${m(F.arranqueHasta_m)} de altura`);
      p.push(" (SI 2, ap. 1 ptos 4 a 6).");
      parrafos.push(p);
    }
    if (d.clase === "cubierta") {
      parrafos.push([
        d.medianeras
          ? `La cubierta tiene una resistencia REI ${C.franja_REI} en una franja de ${m(C.franjaColindante_m)} medida desde el edificio colindante. `
          : "",
        `Los materiales que ocupan más del 10 % del acabado exterior de las zonas de cubierta situadas a menos de ${fmt(C.broofDistancia_m, "m", 0)} de fachadas no EI 60 son de clase ${C.broof} (SI 2, ap. 2).`,
      ]);
    }
  }
  return {
    titulo: "Propagación exterior",
    norma: "DB-SI 2",
    parrafos,
    fuente: ["DB-SI · SI 2 (consolidado 4-mar-2025)", "ap. 1 y 2", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}

/** Las piezas de la fila de La obra. */
export function piezasSi2(j: JustificacionSi2): { texto: string; acento: boolean }[] {
  const out: { texto: string; acento: boolean }[] = [];
  const med = j.elementos.find((e) => e.id === "medianeras")?.detalle;
  if (med && med.clase === "medianeras" && med.tiene) out.push({ texto: "medianeras", acento: false });
  if (j.elementos.some((e) => e.id === "vertical" || e.id === "horizontal")) out.push({ texto: "franjas entre sectores", acento: true });
  out.push({ texto: "fachada", acento: false }, { texto: "cubierta", acento: false });
  return out;
}
