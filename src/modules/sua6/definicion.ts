// =============================================================================
// DB-SUA, SUA 6 — Ahogamiento (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../sua/ficha";
import { dibujoSua6 } from "./dibujo";
import { esHabitualSua6, sua6EstadoDefaults, type Sua6Estado } from "./estado";
import { justificarSua6, type ElementoSua6, type JustificacionSua6 } from "./justificacion";
import { memoriaSua6 } from "./memoria";
import { SUA6_AMBITO, SUA6_ANDEN, SUA6_BARRERA, SUA6_ESCALERAS, SUA6_POZOS, SUA6_VASO } from "./tablas";
import {
  describirDibujoSua6,
  franjaSua6,
  fraseSua6,
  limiteSua6,
  m,
  metricasSua6,
  metros,
  NOMBRE_ESCALERAS,
  NOMBRE_VASOS,
  piezasSua6,
  queEntraSua6,
  resultadoListaSua6,
  textoAvisoSua6,
  textoEtiquetaSua6,
  textoIncumplimientoSua6,
} from "./textos";

export const SUA6_PDF_SVG_ID = "sua6-svg-pdf";

/** El cambio de decisiones que arregla lo que no cumple: volver a lo habitual. */
function arregloSua6(el: ElementoSua6): { etiqueta: string; cambios: Partial<Sua6Estado> } | null {
  if (el.veredicto !== "fail") return null;
  const d = el.detalle;
  switch (d.clase) {
    case "acceso":
      return { etiqueta: "Barrera de 1,20 m", cambios: { barrera_m: "habitual" } };
    case "profundidad":
      return {
        etiqueta: "Profundidades habituales",
        cambios: { ...(d.maxCumple ? {} : { profMax_m: "habitual" }), ...(d.someraCumple ? {} : { profMin_m: "habitual" }) },
      };
    case "infantil":
      return { etiqueta: "Vaso infantil de 0,40 m", cambios: { profInfantil_m: "habitual" } };
    case "anden":
      return { etiqueta: "Andén de 1,50 m", cambios: { anden_m: "habitual" } };
    case "escaleras":
      return { etiqueta: "Escaleras a 12 m", cambios: { separacion_m: "habitual" } };
    default:
      return null;
  }
}

export const sua6: DefinicionSi<Sua6Estado, JustificacionSua6> = {
  key: "sua6",
  db: "DB-SUA",
  defaults: sua6EstadoDefaults,
  sujeto: "Ahogamiento",
  justificar: justificarSua6,
  frase: fraseSua6,
  metricas: metricasSua6,
  queEntra: queEntraSua6,
  piezas: piezasSua6,
  franja: franjaSua6,
  etiqueta: textoEtiquetaSua6,
  resultadoLista: resultadoListaSua6,
  textoAviso: textoAvisoSua6,
  textoIncumplimiento: textoIncumplimientoSua6,
  arreglo: (el) => arregloSua6(el as ElementoSua6),
  tituloDibujo: "La piscina",
  pistaDibujo: "Pulsa la barrera, el andén, el vaso o las escaleras para ver lo que se exige.",
  dibujo: dibujoSua6,
  describirDibujo: describirDibujoSua6,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.aplica ? "acceso" : "ambito"),
  memoria: memoriaSua6,
  ficha: (j, o) => {
    const d = j.decisiones;
    const origen = (...k: (keyof Sua6Estado)[]) => (k.every((x) => esHabitualSua6(o.estado, x)) ? ORIGEN_CRITERIO : ORIGEN_DECISION);
    const datosPartida: FilaDato[] = [
      {
        concepto: "Piscina",
        valor: j.motivo === "sin_piscina" ? "no hay" : j.motivo === "unifamiliar" ? "de una vivienda unifamiliar" : "comunitaria, de uso colectivo",
        origen: j.motivo === "unifamiliar" ? ORIGEN_EDIFICIO : "Datos de la obra",
      },
    ];
    if (j.aplica) {
      datosPartida.push(
        { concepto: "Acceso de niños a la zona de baño", valor: d.acceso === "barrera" ? `no controlado: barrera de ${m(d.barrera_m)}` : "controlado", origen: origen("acceso", "barrera_m") },
        { concepto: "Vasos", valor: NOMBRE_VASOS[d.vasos], origen: origen("vasos") },
      );
      if (d.vasos !== "infantil") datosPartida.push({ concepto: "Profundidad del vaso de recreo", valor: `de ${m(d.profMin_m)} a ${m(d.profMax_m)}`, origen: origen("profMin_m", "profMax_m") });
      if (d.vasos !== "recreo") datosPartida.push({ concepto: "Profundidad del vaso infantil", valor: m(d.profInfantil_m), origen: origen("profInfantil_m") });
      datosPartida.push({ concepto: "Andén", valor: d.anden === "si" ? m(d.anden_m) : "no hay", origen: origen("anden", "anden_m") });
      if (d.vasos !== "infantil") {
        datosPartida.push({ concepto: "Escaleras", valor: `${NOMBRE_ESCALERAS[d.escaleras]}, a ${metros(d.separacion_m)} como mucho`, origen: origen("escaleras", "separacion_m") });
      }
    }
    datosPartida.push({ concepto: "Pozos, depósitos o conducciones abiertas accesibles", valor: d.pozos === "si" ? "sí" : "no", origen: origen("pozos") });
    return fichaSua(j, {
      titulo: "SUA 6 — Ahogamiento",
      slug: "sua6-ahogamiento",
      normativa: j.aplica
        ? [citaDe(SUA6_AMBITO.procedencia), citaDe(SUA6_BARRERA.procedencia), citaDe(SUA6_VASO.procedencia), citaDe(SUA6_ANDEN.procedencia), citaDe(SUA6_ESCALERAS.procedencia), citaDe(SUA6_POZOS.procedencia)]
        : [citaDe(SUA6_AMBITO.procedencia), citaDe(SUA6_POZOS.procedencia)],
      datosPartida,
      limite: limiteSua6,
      valor: textoEtiquetaSua6,
      textoAviso: textoAvisoSua6,
      observaciones: [
        ...(j.aplica
          ? [
              "Interpretación: la piscina comunitaria de un edificio de viviendas es de uso colectivo a efectos del DB-SUA (respaldado por un comentario del Ministerio, no reglamentario). La clasificación sanitaria del RD 742/2013 es otra.",
              "La piscina no está descrita en El edificio: las profundidades, el andén y las escaleras son decisiones del proyectista, con lo habitual como criterio de proyecto.",
            ]
          : []),
        "Interpretación: el apartado 2 (pozos y depósitos) no se limita a las piscinas y se declara en todo caso.",
      ],
      memoria: memoriaSua6(j),
      caption: j.aplica ? "Sección del edificio con el vaso de la piscina, la barrera, el andén y las profundidades." : "Sección del edificio.",
      pdfSvgId: SUA6_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA6_PDF_SVG_ID,
};
