// =============================================================================
// DB-SI, SI 5 — Intervención de los bomberos (feature-19): lo que la sección
// aporta a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { si5EstadoDefaults, type Si5Estado } from "./estado";
import { dibujoSi5 } from "./dibujo";
import { justificarSi5, type ElementoSi5, type JustificacionSi5 } from "./justificacion";
import { memoriaSi5 } from "./memoria";
import { SI5_APROXIMACION, SI5_ENTORNO, SI5_FACHADA } from "./tablas";
import {
  describirDibujoSi5,
  franjaSi5,
  fraseSi5,
  metricasSi5,
  NOMBRE_MANIOBRA,
  NOMBRE_REJAS,
  piezasSi5,
  queEntraSi5,
  resultadoListaSi5,
  textoAvisoSi5,
  textoEtiquetaSi5,
  textoIncumplimientoSi5,
} from "./textos";

export const SI5_PDF_SVG_ID = "si5-svg-pdf";

function limite(el: ElementoSi5): string {
  const d = el.detalle;
  switch (d.clase) {
    case "altura":
      return "> 9 m para exigir";
    case "maniobra":
      return d.exige ? `≤ ${fmt(d.separacionMax_m, "m", 0)} a fachada` : "—";
    case "vial":
      return "3,5 m · 4,5 m · 20 kN/m²";
    case "fachada":
      return "0,80 × 1,20 m · alféizar ≤ 1,20 m";
    case "forestal":
      return "franja 25 m";
  }
}

export const si5: DefinicionSi<Si5Estado, JustificacionSi5> = {
  key: "si5",
  defaults: si5EstadoDefaults,
  sujeto: "Intervención de los bomberos",
  justificar: justificarSi5,
  frase: fraseSi5,
  metricas: metricasSi5,
  queEntra: queEntraSi5,
  piezas: piezasSi5,
  franja: franjaSi5,
  etiqueta: textoEtiquetaSi5,
  resultadoLista: resultadoListaSi5,
  textoAviso: textoAvisoSi5,
  textoIncumplimiento: textoIncumplimientoSi5,
  arreglo: (el) => (el.veredicto === "fail" && el.id === "fachada" ? { etiqueta: "Rejas solo hasta 9 m", cambios: { rejas: "habitual" } } : null),
  tituloDibujo: "El entorno",
  pistaDibujo: "Pulsa el camión, la fachada o la altura para ver qué pide el DB.",
  dibujo: dibujoSi5,
  describirDibujo: describirDibujoSi5,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.exige ? "maniobra" : "altura"),
  memoria: memoriaSi5,
  ficha: (j, o) => {
    const d = j.decisiones;
    const datosPartida: FilaDato[] = [
      {
        concepto: "Altura de evacuación descendente",
        valor: j.elementos[0].detalle.clase === "altura" && j.elementos[0].detalle.unifamiliar ? "Vivienda unifamiliar (sin orígenes de evacuación)" : fmt(j.h_m, "m", 2),
        origen: ORIGEN_EDIFICIO,
      },
    ];
    if (j.exige) {
      datosPartida.push(
        { concepto: "Espacio de maniobra", valor: NOMBRE_MANIOBRA[d.maniobra], origen: ORIGEN_DECISION },
        { concepto: "Elementos de seguridad en los huecos", valor: NOMBRE_REJAS[d.rejas], origen: ORIGEN_DECISION },
      );
    }
    datosPartida.push({ concepto: "Linda con un área forestal", valor: d.forestal === "si" ? "Sí" : "No", origen: ORIGEN_DECISION });
    return fichaSi(j, {
      titulo: "SI 5 — Intervención de los bomberos",
      slug: "si5-bomberos",
      normativa: [citaDe(SI5_APROXIMACION.procedencia), citaDe(SI5_ENTORNO.procedencia), citaDe(SI5_FACHADA.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSi5),
      valor: textoEtiquetaSi5,
      textoAviso: textoAvisoSi5,
      observaciones: [
        "La altura de evacuación se toma desde la planta baja, a cota ±0,00, que se supone la de la salida del edificio.",
        "Interpretación: el vial de aproximación (ap. 1.1) y la accesibilidad por fachada (ap. 2) se exigen junto con el espacio de maniobra del ap. 1.2.",
        "La vía pública existente no forma parte del proyecto de edificación: sus condiciones se describen, no se le exigen (DB-SI, Introducción II).",
      ],
      memoria: memoriaSi5(j),
      caption: "Sección del edificio con el espacio de maniobra, el vial y los huecos de la fachada accesible.",
      pdfSvgId: SI5_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI5_PDF_SVG_ID,
};
