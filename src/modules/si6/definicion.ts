// =============================================================================
// DB-SI, SI 6 — Resistencia al fuego de la estructura (feature-19): lo que la
// sección aporta a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { si6EstadoDefaults, type Si6Estado } from "./estado";
import { dibujoSi6 } from "./dibujo";
import { justificarSi6, type ElementoSi6, type JustificacionSi6 } from "./justificacion";
import { memoriaSi6 } from "./memoria";
import { BIDIRECCIONALES_C5, LOSAS_C4, R_TABLA_3_1, R_TABLA_3_2, SOPORTES_C2, VIGAS_C3 } from "./tablas";
import {
  describirDibujoSi6,
  franjaSi6,
  fraseSi6,
  metricasSi6,
  NOMBRE_FORJADO,
  piezasSi6,
  queEntraSi6,
  resultadoListaSi6,
  textoAvisoSi6,
  textoEtiquetaSi6,
} from "./textos";

export const SI6_PDF_SVG_ID = "si6-svg-pdf";

function limite(el: ElementoSi6): string {
  const d = el.detalle;
  if (d.clase === "planta") return `R ${d.R} · ${d.manda.motivo === "riesgo" ? "tabla 3.2" : "tabla 3.1"}`;
  return d.clase === "hormigon" ? "tablas C.2 a C.5" : "Anejo D o E";
}

export const si6: DefinicionSi<Si6Estado, JustificacionSi6> = {
  key: "si6",
  defaults: si6EstadoDefaults,
  sujeto: "Resistencia al fuego de la estructura",
  justificar: justificarSi6,
  frase: fraseSi6,
  metricas: metricasSi6,
  queEntra: queEntraSi6,
  piezas: piezasSi6,
  franja: franjaSi6,
  etiqueta: textoEtiquetaSi6,
  resultadoLista: resultadoListaSi6,
  textoAviso: textoAvisoSi6,
  textoIncumplimiento: () => null,
  tituloDibujo: "La estructura",
  pistaDibujo: "Pulsa una planta, un soporte o un forjado para ver la R que necesita y por qué.",
  dibujo: dibujoSi6,
  describirDibujo: describirDibujoSi6,
  seleccionInicial: (j) => {
    const plantas = j.elementos.filter((e) => e.detalle.clase === "planta");
    return plantas.reduce((a, b) => ((b.detalle as { R: number }).R > (a.detalle as { R: number }).R ? b : a), plantas[0])?.id ?? null;
  },
  memoria: memoriaSi6,
  ficha: (j, o) => {
    const d = j.decisiones;
    const datosPartida: FilaDato[] = [
      { concepto: "Altura de evacuación del edificio", valor: fmt(j.comp.h_m, "m", 2), origen: ORIGEN_EDIFICIO },
      { concepto: "Material de la estructura", valor: d.material === "hormigon" ? "Hormigón armado" : d.material === "acero" ? "Acero" : "Madera", origen: ORIGEN_DECISION },
    ];
    if (d.material === "hormigon") {
      datosPartida.push({ concepto: "Forjado", valor: NOMBRE_FORJADO[d.forjado], origen: ORIGEN_DECISION });
      if (j.comp.sectores.some((s) => s.uso === "aparcamiento")) {
        datosPartida.push({ concepto: "Techo del garaje", valor: d.techoGaraje === "sin_revestir" ? "Sin revestir" : "Revestido", origen: ORIGEN_DECISION });
      }
    }
    const normativa = [citaDe(R_TABLA_3_1.procedencia), citaDe(R_TABLA_3_2.procedencia)];
    if (d.material === "hormigon") {
      normativa.push(citaDe(SOPORTES_C2.procedencia), citaDe(VIGAS_C3.procedencia), citaDe(d.forjado === "reticular" ? BIDIRECCIONALES_C5.procedencia : LOSAS_C4.procedencia));
    }
    return fichaSi(j, {
      titulo: "SI 6 — Resistencia al fuego de la estructura",
      slug: "si6-estructura",
      normativa,
      datosPartida,
      limite: (el) => limite(el as ElementoSi6),
      valor: textoEtiquetaSi6,
      textoAviso: textoAvisoSi6,
      observaciones: [
        "La R de cada planta vale para sus soportes y para el forjado de techo, que es el suelo de la planta de encima: la R de un suelo es la del sector que tiene debajo (tabla 3.1, nota 1).",
        "Interpretación: la columna de la tabla 3.1 depende de la altura de evacuación del edificio, no de la de la planta.",
        "Criterio: el local sin actividad se trata como Comercial para no condicionar su uso futuro.",
      ],
      memoria: memoriaSi6(j),
      caption: "Sección del edificio con la resistencia al fuego de la estructura de cada planta.",
      pdfSvgId: SI6_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SI6_PDF_SVG_ID,
};
