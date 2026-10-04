// =============================================================================
// DB-SI, SI 4 — Instalaciones de protección contra incendios (feature-19): lo
// que la sección aporta a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { si4EstadoDefaults, type Si4Estado } from "./estado";
import { dibujoSi4 } from "./dibujo";
import { justificarSi4, type ElementoSi4, type JustificacionSi4 } from "./justificacion";
import { memoriaSi4 } from "./memoria";
import { DOTACION_TABLA_1_1, SENALIZACION_SI4 } from "./tablas";
import {
  describirDibujoSi4,
  franjaSi4,
  fraseSi4,
  metricasSi4,
  piezasSi4,
  queEntraSi4,
  resultadoListaSi4,
  textoAvisoSi4,
  textoEtiquetaSi4,
} from "./textos";

export const SI4_PDF_SVG_ID = "si4-svg-pdf";

function limite(el: ElementoSi4): string {
  const d = el.detalle;
  switch (d.clase) {
    case "extintores":
      return "15 m de recorrido";
    case "dotacion":
    case "hidrantes":
      return "tabla 1.1";
    case "local":
      return "previsto";
    case "senalizacion":
      return "RD 513/2017";
  }
}

export const si4: DefinicionSi<Si4Estado, JustificacionSi4> = {
  key: "si4",
  defaults: si4EstadoDefaults,
  sujeto: "Instalaciones de protección contra incendios",
  justificar: justificarSi4,
  frase: fraseSi4,
  metricas: metricasSi4,
  queEntra: queEntraSi4,
  piezas: piezasSi4,
  franja: franjaSi4,
  etiqueta: textoEtiquetaSi4,
  resultadoLista: resultadoListaSi4,
  textoAviso: textoAvisoSi4,
  textoIncumplimiento: () => null,
  tituloDibujo: "Las instalaciones",
  pistaDibujo: "Pulsa un icono para ver qué regla de la tabla 1.1 lo pide (o por qué no).",
  dibujo: dibujoSi4,
  describirDibujo: describirDibujoSi4,
  seleccionInicial: () => "extintores",
  memoria: memoriaSi4,
  ficha: (j, o) => {
    const e = j.comp.edificio;
    const datosPartida: FilaDato[] = [
      { concepto: "Altura de evacuación descendente", valor: fmt(e.alturaEvacuacion_m, "m", 2), origen: ORIGEN_EDIFICIO },
      { concepto: "Altura de evacuación ascendente", valor: fmt(e.alturaAscendente_m, "m", 2), origen: ORIGEN_EDIFICIO },
      { concepto: "Hidrante público a menos de 100 m", valor: j.decisiones.hidrantePublico === "si" ? "Sí" : "No", origen: ORIGEN_DECISION },
    ];
    if (j.comp.riesgo.aparcamiento) {
      const g = j.comp.riesgo.aparcamiento;
      datosPartida.push({ concepto: "Superficie construida del garaje", valor: `${fmt(g.construida_m2, "m²", 0)}${g.zonas.some((z) => z.construida.supuesto) ? " (útil × 1,20, criterio)" : ""}`, origen: ORIGEN_EDIFICIO });
    }
    return fichaSi(j, {
      titulo: "SI 4 — Instalaciones de protección contra incendios",
      slug: "si4-instalaciones",
      normativa: [citaDe(DOTACION_TABLA_1_1.procedencia), citaDe(SENALIZACION_SI4.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSi4),
      valor: textoEtiquetaSi4,
      textoAviso: textoAvisoSi4,
      observaciones: [
        "El garaje y el resto del edificio se dotan por separado (comentario del Ministerio, no reglamentario).",
        "Interpretación: «comprendida entre A y B» incluye A; «excede de» es estricto.",
        "Los extintores se sitúan en planta; la herramienta cuenta uno por planta con orígenes de evacuación y uno por planta con locales de riesgo especial.",
      ],
      memoria: memoriaSi4(j),
      caption: "Sección del edificio con las instalaciones de protección contra incendios.",
      pdfSvgId: SI4_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI4_PDF_SVG_ID,
};
