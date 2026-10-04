// =============================================================================
// DB-SI, SI 4 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada instalación con las reglas de la tabla 1.1 que se han mirado,
// las etiquetas y los avisos. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { USOS } from "../../lib/edificio/usos";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { DetalleSi4, ElementoSi4, JustificacionSi4 } from "./justificacion";
import { DOTACION_TABLA_1_1 } from "./tablas";

const T = DOTACION_TABLA_1_1.datos;

function det(el: ElementoSi<unknown>): DetalleSi4 {
  return (el as ElementoSi4).detalle;
}

/** Las instalaciones que se exigen, para la frase: «extintores, BIE en el garaje y detección». */
function exigidas(j: JustificacionSi4): string[] {
  return j.elementos.flatMap((el) => {
    const d = el.detalle;
    if (d.clase === "dotacion" && d.exige) return [el.nombre.toLowerCase()];
    if (d.clase === "dotacion" && d.nota) return ["detección en el garaje para su ventilación (SI 3)"];
    if (d.clase === "hidrantes" && d.exige) return [d.publico ? "hidrante (el público cuenta)" : "hidrante"];
    return [];
  });
}

export function fraseSi4(j: JustificacionSi4): string {
  const ext = j.elementos.find((e) => e.id === "extintores")!.detalle as Extract<DetalleSi4, { clase: "extintores" }>;
  const mas = exigidas(j);
  const extintores =
    ext.total === 0
      ? "No hacen falta extintores (el interior de una vivienda no es origen de evacuación)"
      : `${ext.total} ${ext.total === 1 ? "extintor" : "extintores"} 21A-113B como mínimo`;
  return `${extintores}${mas.length > 0 ? `; además, ${listaY(mas)}` : "; no se exigen BIE, columna seca, detección ni hidrantes"}.`;
}

export function metricasSi4(j: JustificacionSi4): string {
  const ext = j.elementos.find((e) => e.id === "extintores")!.detalle as Extract<DetalleSi4, { clase: "extintores" }>;
  return `${ext.total} extintores · ${exigidas(j).length} instalaciones más`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraSi4(j: JustificacionSi4, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "extintores") {
      filas.push({ id: el.id, titulo: "Extintores", detalle: d.plantas.length > 0 ? `${d.plantas.length} plantas con orígenes de evacuación` : "sin orígenes de evacuación", trato: `${d.total}`, estado: trato(estados[el.id]), elementoId: el.id });
    } else if (d.clase === "dotacion" || d.clase === "hidrantes") {
      filas.push({ id: el.id, titulo: el.nombre, detalle: d.exige ? "se exige" : "no se exige", trato: textoEtiquetaSi4(el), estado: trato(estados[el.id]), elementoId: el.id });
    } else if (d.clase === "local") {
      filas.push({ id: el.id, titulo: "Local sin uso", detalle: d.zona.plantas, trato: "con su actividad", estado: "pv", elementoId: el.id });
    }
  }
  return filas;
}

export function textoEtiquetaSi4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "extintores":
      return d.total > 0 ? `${d.total} extintores` : "sin extintores";
    case "dotacion":
      return d.exige ? (d.inst === "bie" ? "BIE 25 mm" : el.nombre.toLowerCase()) : d.nota ? "detección (SI 3)" : `sin ${el.nombre.toLowerCase()}`;
    case "hidrantes":
      return d.exige ? (d.publico ? "hidrante público" : `${d.numero} hidrante${d.numero > 1 ? "s" : ""}`) : "sin hidrantes";
    case "local":
      return "local: con su actividad";
    case "senalizacion":
      return "señales RIPCI";
  }
}

export function resultadoListaSi4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "extintores":
      return d.total > 0
        ? `${d.total} × 21A-113B: uno por planta con orígenes de evacuación (${listaY(d.plantas.map((p) => p.etiqueta))})${d.locales.length > 0 ? " y junto a los locales de riesgo" : ""}`
        : "ninguno: no hay orígenes de evacuación";
    case "dotacion":
      return d.exige ? `se exige: ${d.reglas.filter((r) => r.exige).map((r) => r.regla).join("; ")}` : d.nota ?? `no se exige (${d.reglas.map((r) => `${r.regla}: ${r.valor}`).join("; ")})`;
    case "hidrantes":
      return d.exige
        ? `${d.numero} hidrante${d.numero > 1 ? "s" : ""}${d.publico ? ": cuenta el público a menos de 100 m de la fachada accesible" : " del proyecto"}`
        : "no se exigen";
    case "local":
      return "se dotará conforme a su actividad (obra inacabada)";
    case "senalizacion":
      return "medios manuales señalizados según el RIPCI";
  }
}

export function franjaSi4(el: ElementoSi<unknown>, _j: JustificacionSi4, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "extintores":
      return {
        clase: "Dotación · tabla 1.1, en general",
        titulo: "Extintores portátiles",
        valor: String(d.total),
        unidad: "extintores 21A-113B",
        estado,
        manda: d.unifamiliar
          ? "El interior de una vivienda no es origen de evacuación: la unifamiliar no lleva extintores por la regla de los 15 m. Su garaje, local de riesgo especial, sí: uno junto a su puerta."
          : `Uno a ${T.enGeneral.extintorRecorrido_m} m de recorrido como máximo desde todo origen de evacuación de cada planta, y uno fuera de cada local de riesgo especial, junto a su puerta, que puede servir a varios. Se colocan en planta.`,
        filas: [
          ...d.plantas.map((p) => ({ k: p.etiqueta, v: `${listaY([...new Set(p.zonas.map((z) => USOS[z.uso].etiqueta.toLowerCase()))])}` })),
          ...(d.locales.length > 0 ? [{ k: "Locales de riesgo", v: `${d.locales.length}: uno junto a la puerta (≤ 15 m dentro)` }] : []),
          { k: "Altura de colocación (RIPCI)", v: "parte superior a 80–120 cm" },
        ],
        cita: "DB-SI · SI 4 · tabla 1.1 y nota (1)",
      };
    case "dotacion":
      return {
        clase: "Dotación · tabla 1.1",
        titulo: el.nombre,
        valor: d.exige ? "Se exige" : d.nota ? "Por SI 3" : "No",
        unidad: d.exige ? d.reglas.filter((r) => r.exige).map((r) => r.donde).join(" · ") : d.nota ? "en el garaje" : "se exige",
        estado,
        manda: d.exige
          ? `Lo pide ${d.reglas.filter((r) => r.exige).map((r) => r.regla.toLowerCase()).join(" y ")}.${d.inst === "bie" ? " Equipos de 25 mm." : ""}${d.inst === "columna" ? " El municipio puede sustituirla por BIE (nota 5)." : ""}`
          : d.nota ?? "Ninguna regla de la tabla 1.1 la pide en este edificio.",
        filas: d.reglas.map((r) => ({ k: r.regla, v: `${r.valor} → ${r.exige ? "sí" : "no"}` })),
        cita: "DB-SI · SI 4 · tabla 1.1",
      };
    case "hidrantes":
      return {
        clase: "Dotación · tabla 1.1",
        titulo: "Hidrantes exteriores",
        valor: d.exige ? String(d.numero) : "No",
        unidad: d.exige ? "hidrantes" : "se exigen",
        estado,
        manda: d.exige
          ? `Uno hasta 10.000 m² construidos y uno más por cada 10.000 m² o fracción. ${d.publico ? "Cuenta el hidrante de la vía pública a menos de 100 m de la fachada accesible (nota 3)." : "El proyecto lo dispone; puede conectarse a la red pública."}`
          : "Ni la altura de evacuación ni la superficie construida llegan a los umbrales.",
        filas: d.reglas.map((r) => ({ k: r.regla, v: `${r.valor} → ${r.exige ? "sí" : "no"}` })),
        cita: "DB-SI · SI 4 · tabla 1.1 y nota (3)",
      };
    case "local":
      return {
        clase: "Previsto",
        titulo: `Local sin uso · ${d.zona.plantas}`,
        valor: "Con su actividad",
        estado,
        manda: "Un local sin actividad es, a efectos del CTE, una obra inacabada: su dotación se justificará en el proyecto de su actividad, con el uso que tenga.",
        filas: [{ k: "Ahora", v: "se deja previsto" }],
        cita: "DB-SI · SI 4 · comentario del Ministerio (no reglamentario)",
      };
    case "senalizacion":
      return {
        clase: "Señalización · ap. 2",
        titulo: "Señalización de las instalaciones manuales",
        valor: "RIPCI",
        estado,
        manda: "Los extintores, las BIE y los pulsadores se señalizan según el Reglamento de instalaciones de protección contra incendios (RD 513/2017, Anexo I, sección 2.ª).",
        filas: [
          { k: "Señales", v: "UNE 23033-1" },
          { k: "Fotoluminiscentes", v: "UNE 23035-4" },
        ],
        cita: "DB-SI · SI 4 ap. 2 · RD 513/2017",
      };
  }
}

export function textoAvisoSi4(a: Aviso): TextoSi {
  if (a.id.startsWith("construida-")) {
    const que = listaY([...new Set((a.datos.que as string[] | undefined) ?? [])]);
    return {
      titulo: `La superficie construida ${a.datos.donde === "garaje" ? "del garaje" : "del edificio"} decide ${que || "una instalación"}.`,
      detalle: "Se ha supuesto la útil × 1,20 (criterio), del lado de la seguridad, y con la útil saldría otra cosa. Indica la superficie construida en las decisiones.",
    };
  }
  return { titulo: "Revisa este punto.", detalle: "" };
}

export function describirDibujoSi4(j: JustificacionSi4): string {
  return `Sección del edificio con las instalaciones de protección contra incendios: ${fraseSi4(j).replace(/\.$/, "")}.`;
}

/** Las piezas de la fila de La obra: las instalaciones que se exigen. */
export function piezasSi4(j: JustificacionSi4): { texto: string; acento: boolean }[] {
  const out: { texto: string; acento: boolean }[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "extintores" && d.total > 0) out.push({ texto: "extintores", acento: false });
    if (d.clase === "dotacion" && d.exige) out.push({ texto: d.inst === "bie" ? "BIE" : el.nombre.toLowerCase(), acento: true });
    if (d.clase === "hidrantes" && d.exige) out.push({ texto: "hidrante", acento: true });
    if (d.clase === "local") out.push({ texto: "local · previsto", acento: true });
  }
  return out;
}
