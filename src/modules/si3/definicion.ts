// =============================================================================
// DB-SI, SI 3 — Evacuación de ocupantes (feature-19): lo que la sección aporta a
// la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { si3EstadoDefaults, type Si3Estado } from "./estado";
import { dibujoSi3 } from "./dibujo";
import { justificarSi3, type ElementoSi3, type JustificacionSi3 } from "./justificacion";
import { CAPACIDAD_TABLA_4_2, DIMENSIONADO_TABLA_4_1, PROTECCION_TABLA_5_1, SALIDAS_TABLA_3_1 } from "./tablas";
import {
  describirDibujoSi3,
  franjaSi3,
  fraseSi3,
  memoriaSi3,
  metricasSi3,
  NOMBRE_ESCALERA,
  piezasSi3,
  queEntraSi3,
  resultadoListaSi3,
  textoAvisoSi3,
  textoEtiquetaSi3,
  textoIncumplimientoSi3,
} from "./textos";

export const SI3_PDF_SVG_ID = "si3-svg-pdf";

function limite(el: ElementoSi3): string {
  const d = el.detalle;
  switch (d.clase) {
    case "salidas":
    case "garaje":
      return `≤ ${d.limite_m} m · tabla 3.1`;
    case "escalera":
      return `tabla 5.1: ${NOMBRE_ESCALERA[d.exigida]}`;
    case "escalera_garaje":
      return "especialmente protegida";
    case "puertas":
      return "A ≥ P/200 ≥ 0,80 m";
    case "humo":
      return "ap. 8";
    case "discapacidad":
      return "ap. 9";
    default:
      return "—";
  }
}

export const si3: DefinicionSi<Si3Estado, JustificacionSi3> = {
  key: "si3",
  defaults: si3EstadoDefaults,
  sujeto: "Evacuación de ocupantes",
  justificar: justificarSi3,
  frase: fraseSi3,
  metricas: metricasSi3,
  queEntra: queEntraSi3,
  piezas: piezasSi3,
  franja: franjaSi3,
  etiqueta: textoEtiquetaSi3,
  resultadoLista: resultadoListaSi3,
  textoAviso: textoAvisoSi3,
  textoIncumplimiento: textoIncumplimientoSi3,
  arreglo: (el, j) => {
    const d = (el as ElementoSi3).detalle;
    return el.veredicto === "fail" && d.clase === "escalera" && d.proteccion !== j.habituales.escalera ? { etiqueta: "Volver a lo habitual", cambios: { escalera: "habitual" } } : null;
  },
  tituloDibujo: "La evacuación",
  pistaDibujo: "Pulsa la escalera, una flecha o la salida para ver qué pide el DB. Las flechas son los recorridos de evacuación.",
  dibujo: dibujoSi3,
  describirDibujo: describirDibujoSi3,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.elementos.some((e) => e.id === "salidas") ? "salidas" : "ocupacion"),
  memoria: memoriaSi3,
  ficha: (j, o) => {
    const d = j.decisiones;
    const datosPartida: FilaDato[] = [{ concepto: "Altura de evacuación descendente", valor: fmt(j.comp.h_m, "m", 2), origen: ORIGEN_EDIFICIO }];
    if (j.conEscalera) {
      datosPartida.push(
        { concepto: "Escalera", valor: NOMBRE_ESCALERA[d.escalera], origen: ORIGEN_DECISION },
        { concepto: "Anchura de la escalera", valor: fmt(d.anchuraEscalera_m, "m", 2), origen: ORIGEN_DECISION },
      );
    }
    if (!j.comp.edificio.resumen.esUnifamiliar) {
      datosPartida.push({ concepto: "Recorrido más largo de las plantas", valor: o.estado.recorrido_m !== null ? fmt(o.estado.recorrido_m, "m", 1) : "Sin medir", origen: o.estado.recorrido_m !== null ? "Medido por el proyectista" : ORIGEN_CRITERIO });
    }
    if (j.conGaraje) {
      datosPartida.push(
        { concepto: "Recorrido más largo del garaje", valor: o.estado.recorridoGaraje_m !== null ? fmt(o.estado.recorridoGaraje_m, "m", 1) : "Sin medir", origen: o.estado.recorridoGaraje_m !== null ? "Medido por el proyectista" : ORIGEN_CRITERIO },
        { concepto: "Ventilación del garaje", valor: d.ventilacionGaraje === "mecanica" ? "Mecánica" : "Natural", origen: ORIGEN_DECISION },
      );
    }
    return fichaSi(j, {
      titulo: "SI 3 — Evacuación de ocupantes",
      slug: "si3-evacuacion",
      normativa: [citaDe(SALIDAS_TABLA_3_1.procedencia), citaDe(DIMENSIONADO_TABLA_4_1.procedencia), citaDe(CAPACIDAD_TABLA_4_2.procedencia), citaDe(PROTECCION_TABLA_5_1.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSi3),
      valor: textoEtiquetaSi3,
      textoAviso: textoAvisoSi3,
      observaciones: [
        "Interpretación: el recorrido de evacuación empieza en la puerta de la vivienda (su interior no es origen de evacuación) y, con escalera no protegida ni compartimentada, sigue por ella hasta la salida del edificio.",
        "Criterio: la anchura mínima de la escalera la fija el DB SUA 1, tabla 4.1; 1,00 m se toma como habitual hasta comprobarlo.",
        "Criterio: el local sin actividad se asimila a Comercial (salidas propias, 2 m²/persona); la ocupación del garaje se suma a la de las viviendas en la salida del edificio.",
      ],
      memoria: memoriaSi3(j),
      caption: "Sección del edificio con la escalera, los recorridos de evacuación y la salida.",
      pdfSvgId: SI3_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI3_PDF_SVG_ID,
};
