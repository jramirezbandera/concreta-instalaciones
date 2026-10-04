// =============================================================================
// DB-SUA, SUA 4 — Iluminación (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../sua/ficha";
import { dibujoSua4 } from "./dibujo";
import { sua4EstadoDefaults, type Sua4Estado } from "./estado";
import { justificarSua4, type ElementoSua4, type JustificacionSua4 } from "./justificacion";
import { memoriaSua4 } from "./memoria";
import {
  ALUMBRADO_NORMAL_SUA4_1,
  DOTACION_EMERGENCIA_SUA4_2_1,
  INSTALACION_EMERGENCIA_SUA4_2_3,
  LUMINARIAS_EMERGENCIA_SUA4_2_2,
  SENALES_SUA4_2_4,
} from "./tablas";
import {
  describirDibujoSua4,
  franjaSua4,
  fraseSua4,
  metricasSua4,
  piezasSua4,
  queEntraSua4,
  resultadoListaSua4,
  textoAvisoSua4,
  textoEtiquetaSua4,
  textoIncumplimientoSua4,
} from "./textos";

export const SUA4_PDF_SVG_ID = "sua4-svg-pdf";

const N = ALUMBRADO_NORMAL_SUA4_1.datos;
const I = INSTALACION_EMERGENCIA_SUA4_2_3.datos;

function limite(el: ElementoSua4): string {
  const d = el.detalle;
  switch (d.clase) {
    case "normal":
      return `≥ ${d.lux} lx · U ≥ ${Math.round(N.uniformidadMediaMin * 100)} %`;
    case "recorridos":
      return "ap. 2.1 b)";
    case "garaje":
      return `ap. 2.1 ${d.letra})`;
    case "locales":
      return "ap. 2.1 d)";
    case "cuadros":
      return `≥ ${I.equiposYCuadrosMin_lx} lx`;
    case "senales":
      return `≥ ${SENALES_SUA4_2_4.datos.luminanciaColorSeguridadMin_cd_m2} cd/m²`;
    case "luminarias":
      return `≥ ${LUMINARIAS_EMERGENCIA_SUA4_2_2.datos.alturaMinimaSobreSuelo_m} m`;
    case "instalacion":
      return `≥ ${I.autonomiaMin_h} h · ${I.viaEvacuacion.ejeCentralMin_lx} lx en el eje`;
    case "sin_emergencia":
      return "ap. 2.1";
    case "local":
      return "—";
  }
}

export const sua4: DefinicionSi<Sua4Estado, JustificacionSua4> = {
  key: "sua4",
  db: "DB-SUA",
  defaults: sua4EstadoDefaults,
  sujeto: "Iluminación",
  justificar: justificarSua4,
  frase: fraseSua4,
  metricas: metricasSua4,
  queEntra: queEntraSua4,
  piezas: piezasSua4,
  franja: franjaSua4,
  etiqueta: textoEtiquetaSua4,
  resultadoLista: resultadoListaSua4,
  textoAviso: textoAvisoSua4,
  textoIncumplimiento: textoIncumplimientoSua4,
  avisosAEdificio: new Set(["cuarto-sin-tipo"]),
  tituloDibujo: "Alumbrado normal y de emergencia",
  pistaDibujo: "Pulsa una zona o una luminaria para ver su alumbrado.",
  dibujo: dibujoSua4,
  describirDibujo: describirDibujoSua4,
  seleccionInicial: (j) => j.elementos.find((e) => e.id === "emergencia-recorridos" || e.id === "emergencia-garaje")?.id ?? j.elementos[0]?.id ?? null,
  memoria: memoriaSua4,
  ficha: (j, o) => {
    const d = j.decisiones;
    const h = j.habituales;
    const datosPartida: FilaDato[] = [];
    const g = j.elementos.find((e) => e.detalle.clase === "garaje")?.detalle;
    if (g && g.clase === "garaje") {
      datosPartida.push({ concepto: "Superficie construida del garaje", valor: `${g.construida_m2} m²`, origen: g.supuesta ? ORIGEN_SUPUESTO : ORIGEN_EDIFICIO });
      if (g.unifamiliar) {
        datosPartida.push({ concepto: "Emergencia en el garaje de la vivienda", valor: d.garajeVivienda === "si" ? "Sí" : "No", origen: d.garajeVivienda === h.garajeVivienda ? ORIGEN_CRITERIO : ORIGEN_DECISION });
      }
    }
    if (j.conEmergencia) {
      datosPartida.push({ concepto: "Instalación de emergencia", valor: d.instalacion === "autonomas" ? "luminarias autónomas" : "sistema centralizado", origen: d.instalacion === h.instalacion ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    return fichaSua(j, {
      titulo: "SUA 4 — Iluminación",
      slug: "sua4-iluminacion",
      normativa: [
        citaDe(ALUMBRADO_NORMAL_SUA4_1.procedencia),
        citaDe(DOTACION_EMERGENCIA_SUA4_2_1.procedencia),
        citaDe(LUMINARIAS_EMERGENCIA_SUA4_2_2.procedencia),
        citaDe(INSTALACION_EMERGENCIA_SUA4_2_3.procedencia),
        citaDe(SENALES_SUA4_2_4.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoSua4),
      valor: textoEtiquetaSua4,
      textoAviso: textoAvisoSua4,
      observaciones: [
        "Criterio: el alumbrado normal no se comprueba dentro de las viviendas; el DB no las excluye y la memoria lo declara.",
        "Interpretación: los orígenes de evacuación son los del Anejo SI A, como en SI 3 y SI 4: no lo es el interior de las viviendas; en una plurifamiliar, el recorrido empieza en la puerta de cada vivienda.",
        "Los locales de riesgo especial son los de SI 1 (tabla 2.1). El garaje integrado en una unifamiliar lo es en todo caso: su alumbrado de emergencia es una lectura literal de 2.1 d), sin comentario del Ministerio.",
        "Criterio: el pasillo de una zona de trasteros de 50 m² o menos y los aseos generales de planta de las oficinas llevan alumbrado de emergencia.",
        "La herramienta no calcula iluminancias: el cálculo se hace con reflexión nula en paredes y techos y el factor de mantenimiento del fabricante.",
      ],
      memoria: memoriaSua4(j),
      caption: "Sección del edificio con la iluminancia del alumbrado normal de cada zona y las zonas con alumbrado de emergencia.",
      pdfSvgId: SUA4_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA4_PDF_SVG_ID,
};
