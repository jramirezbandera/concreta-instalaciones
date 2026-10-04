// =============================================================================
// DB-SI, SI 2 — Propagación exterior (feature-19): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION } from "../si/ficha";
import { si2EstadoDefaults, type Si2Estado } from "./estado";
import { dibujoSi2 } from "./dibujo";
import { justificarSi2, type ElementoSi2, type JustificacionSi2 } from "./justificacion";
import { CUBIERTAS_SI2, FACHADAS_SI2 } from "./tablas";
import {
  describirDibujoSi2,
  franjaSi2,
  fraseSi2,
  memoriaSi2,
  metricasSi2,
  piezasSi2,
  queEntraSi2,
  resultadoListaSi2,
  textoAvisoSi2,
  textoEtiquetaSi2,
} from "./textos";

export const SI2_PDF_SVG_ID = "si2-svg-pdf";

function limite(el: ElementoSi2): string {
  switch (el.detalle.clase) {
    case "medianeras":
      return "EI 120";
    case "vertical":
      return "EI 60 · 1 m";
    case "horizontal":
      return "tabla α–d";
    case "reaccion":
      return "por altura de fachada";
    case "cubierta":
      return "ap. 2";
  }
}

export const si2: DefinicionSi<Si2Estado, JustificacionSi2> = {
  key: "si2",
  defaults: si2EstadoDefaults,
  sujeto: "Propagación exterior",
  justificar: justificarSi2,
  frase: fraseSi2,
  metricas: metricasSi2,
  queEntra: queEntraSi2,
  piezas: piezasSi2,
  franja: franjaSi2,
  etiqueta: textoEtiquetaSi2,
  resultadoLista: resultadoListaSi2,
  textoAviso: textoAvisoSi2,
  textoIncumplimiento: () => null,
  tituloDibujo: "Fachadas y cubierta",
  pistaDibujo: "Pulsa la medianera, las franjas de fachada o la cubierta para ver qué pide el DB.",
  dibujo: dibujoSi2,
  describirDibujo: describirDibujoSi2,
  seleccionInicial: (j) => (j.elementos.some((e) => e.id === "vertical") ? "vertical" : "reaccion"),
  memoria: memoriaSi2,
  ficha: (j, o) => {
    const d = j.decisiones;
    const datosPartida: FilaDato[] = [
      { concepto: "Altura total de la fachada", valor: `${fmt(j.altura_m, "m", 2)} (hasta el forjado de cubierta)`, origen: ORIGEN_CRITERIO },
      { concepto: "Medianeras", valor: d.medianeras === "si" ? "Entre medianeras" : "Edificio aislado", origen: ORIGEN_DECISION },
      { concepto: "Fachada ventilada", valor: d.ventilada === "si" ? "Sí" : "No", origen: ORIGEN_DECISION },
      { concepto: "Arranque de la fachada", valor: d.arranque === "publico" ? "Accesible al público" : "No accesible al público", origen: ORIGEN_DECISION },
    ];
    if (j.elementos.some((e) => e.id === "horizontal")) {
      datosPartida.push({ concepto: "Fachadas de sectores distintos", valor: d.encuentro === "plano" ? "En un mismo plano (180°)" : d.encuentro === "esquina" ? "En esquina (90°)" : "Enfrentadas (0°)", origen: ORIGEN_DECISION });
    }
    return fichaSi(j, {
      titulo: "SI 2 — Propagación exterior",
      slug: "si2-propagacion-exterior",
      normativa: [citaDe(FACHADAS_SI2.procedencia), citaDe(CUBIERTAS_SI2.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSi2),
      valor: textoEtiquetaSi2,
      textoAviso: textoAvisoSi2,
      observaciones: [
        "Criterio: la altura total de la fachada se toma hasta el forjado de cubierta; el DB no la define y no es la altura de evacuación.",
        "Las franjas de fachada se exigen entre sectores distintos (los de SI 1), no entre viviendas de un mismo sector.",
      ],
      memoria: memoriaSi2(j),
      caption: "Sección del edificio con las medianeras, las franjas de fachada entre sectores y la cubierta.",
      pdfSvgId: SI2_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI2_PDF_SVG_ID,
};
