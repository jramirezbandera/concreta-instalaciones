// =============================================================================
// DB-SI, SI 1 — Propagación interior (feature-19): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import {
  CONDICIONES_RIESGO_TABLA_2_2,
  LOCALES_RIESGO_TABLA_2_1,
  REACCION_TABLA_4_1,
  RESISTENCIA_SECTORES_TABLA_1_2,
  SECTORES_TABLA_1_1,
} from "../si/tablas";
import { si1EstadoDefaults, type Si1Estado } from "./estado";
import { dibujoSi1 } from "./dibujo";
import { justificarSi1, type ElementoSi1, type JustificacionSi1 } from "./justificacion";
import { memoriaSi1 } from "./memoria";
import {
  describirDibujoSi1,
  franjaSi1,
  fraseSi1,
  metricasSi1,
  NOMBRE_CUARTO,
  piezasSi1,
  queEntraSi1,
  resultadoListaSi1,
  textoAvisoSi1,
  textoEtiquetaSi1,
  textoIncumplimientoSi1,
} from "./textos";

export const SI1_PDF_SVG_ID = "si1-svg-pdf";

function limite(el: ElementoSi1): string {
  const d = el.detalle;
  switch (d.clase) {
    case "principal":
      return "≤ 2.500 m²";
    case "sector":
      return `EI ${d.limite.ei} · tabla 1.2`;
    case "exenta":
      return "≤ 500 m²";
    case "entre_viviendas":
      return "EI 60";
    case "local":
      return `tabla 2.2 · riesgo ${d.local.clase}`;
    case "no_local":
      return "tabla 2.1";
    case "reaccion":
      return "tabla 4.1";
  }
}

export const si1: DefinicionSi<Si1Estado, JustificacionSi1> = {
  key: "si1",
  defaults: si1EstadoDefaults,
  sujeto: "Propagación interior",
  justificar: justificarSi1,
  frase: fraseSi1,
  metricas: metricasSi1,
  queEntra: queEntraSi1,
  piezas: piezasSi1,
  franja: franjaSi1,
  etiqueta: textoEtiquetaSi1,
  resultadoLista: resultadoListaSi1,
  textoAviso: textoAvisoSi1,
  textoIncumplimiento: textoIncumplimientoSi1,
  tituloDibujo: "Los sectores",
  pistaDibujo: "Pulsa una zona para ver su sector o su local de riesgo. Las líneas gruesas separan sectores; el rayado, locales de riesgo especial.",
  dibujo: dibujoSi1,
  describirDibujo: describirDibujoSi1,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos.find((e) => e.id !== "sector-principal" && e.detalle.clase === "sector")?.id ?? "sector-principal",
  memoria: memoriaSi1,
  ficha: (j, o) => {
    const c = j.comp;
    const datosPartida: FilaDato[] = [
      { concepto: "Altura de evacuación del edificio", valor: fmt(c.h_m, "m", 2), origen: ORIGEN_EDIFICIO },
      {
        concepto: "Superficie construida",
        valor: c.sectores.some((s) => s.superficie.supuesta) ? "La indicada en El edificio o, si falta, la útil × 1,20" : "La indicada en El edificio",
        origen: c.sectores.some((s) => s.superficie.supuesta) ? ORIGEN_CRITERIO : ORIGEN_EDIFICIO,
      },
    ];
    for (const z of c.edificio.zonas) {
      if (z.uso === "instalaciones") {
        datosPartida.push({
          concepto: `Cuarto de instalaciones (${z.plantas})`,
          valor: z.zona.cuarto ? `${NOMBRE_CUARTO[z.zona.cuarto]}${z.zona.cuarto === "calderas" && z.zona.potencia_kW ? `, ${fmt(z.zona.potencia_kW, "kW", 0)}` : ""}` : "Sin definir: riesgo bajo provisional",
          origen: z.zona.cuarto ? ORIGEN_EDIFICIO : ORIGEN_SUPUESTO,
        });
      }
      if (z.uso === "local_sin_uso") {
        datosPartida.push({
          concepto: `Local sin uso (${z.plantas})`,
          valor: z.zona.usoPrevisto === "administrativo" ? "Asimilado a Administrativo" : "Asimilado a Comercial",
          origen: z.zona.usoPrevisto ? ORIGEN_EDIFICIO : ORIGEN_SUPUESTO,
        });
      }
    }
    return fichaSi(j, {
      titulo: "SI 1 — Propagación interior",
      slug: "si1-propagacion-interior",
      normativa: [
        citaDe(SECTORES_TABLA_1_1.procedencia),
        citaDe(RESISTENCIA_SECTORES_TABLA_1_2.procedencia),
        citaDe(LOCALES_RIESGO_TABLA_2_1.procedencia),
        citaDe(CONDICIONES_RIESGO_TABLA_2_2.procedencia),
        citaDe(REACCION_TABLA_4_1.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoSi1),
      valor: textoEtiquetaSi1,
      textoAviso: textoAvisoSi1,
      observaciones: [
        "Criterio: la superficie construida que no se indica se supone igual a la útil × 1,20; el DB-SI no da relación entre las dos. Solo se pide cuando cambia el resultado.",
        "Criterio: un elemento que separa sectores de usos distintos toma la mayor resistencia de las dos filas de la tabla 1.2 (cada sector la cumple con el fuego en su interior).",
        "Criterio: un local sin actividad se trata como Comercial, el uso más exigente; un comentario del Ministerio lo considera obra inacabada, que justificará su uso al terminarse.",
        "Los RITI/RITS no tienen fila en la tabla 2.1; se tratan como local de riesgo especial bajo por un comentario del Ministerio (no reglamentario).",
      ],
      memoria: memoriaSi1(j),
      caption: "Sección del edificio con los sectores de incendio, sus separaciones y los locales de riesgo especial.",
      pdfSvgId: SI1_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI1_PDF_SVG_ID,
};
