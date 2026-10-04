// =============================================================================
// DB-SUA, SUA 3 — Aprisionamiento (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION } from "../sua/ficha";
import { dibujoSua3 } from "./dibujo";
import { sua3EstadoDefaults, type Sua3Estado } from "./estado";
import { justificarSua3, type ElementoSua3, type JustificacionSua3 } from "./justificacion";
import { memoriaSua3 } from "./memoria";
import { APRISIONAMIENTO_SUA3, ASEO_ACCESIBLE_ANEJO_A } from "./tablas";
import {
  describirDibujoSua3,
  franjaSua3,
  fraseSua3,
  metricasSua3,
  piezasSua3,
  queEntraSua3,
  resultadoListaSua3,
  textoAvisoSua3,
  textoEtiquetaSua3,
  textoIncumplimientoSua3,
} from "./textos";

export const SUA3_PDF_SVG_ID = "sua3-svg-pdf";

const T = APRISIONAMIENTO_SUA3.datos;

function limite(el: ElementoSua3): string {
  const d = el.detalle;
  switch (d.clase) {
    case "bloqueo":
      return "desbloqueo desde el exterior";
    case "llamada":
      return d.publico ? "llamada de asistencia" : "solo en uso público";
    case "fuerza":
      return `≤ ${T.fuerzaApertura_puertasSalida_maxN} N · accesible ≤ ${T.fuerzaApertura_itinerarioAccesible_maxN} N (EI ≤ ${T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN} N)`;
  }
}

export const sua3: DefinicionSi<Sua3Estado, JustificacionSua3> = {
  key: "sua3",
  db: "DB-SUA",
  defaults: sua3EstadoDefaults,
  sujeto: "Aprisionamiento",
  justificar: justificarSua3,
  frase: fraseSua3,
  metricas: metricasSua3,
  queEntra: queEntraSua3,
  piezas: piezasSua3,
  franja: franjaSua3,
  etiqueta: textoEtiquetaSua3,
  resultadoLista: resultadoListaSua3,
  textoAviso: textoAvisoSua3,
  textoIncumplimiento: textoIncumplimientoSua3,
  tituloDibujo: "Recintos y puertas de salida",
  pistaDibujo: "Pulsa una puerta, el aseo o la salida para ver su condición.",
  dibujo: dibujoSua3,
  describirDibujo: describirDibujoSua3,
  seleccionInicial: (j) => j.elementos[0]?.id ?? null,
  memoria: memoriaSua3,
  ficha: (j, o) => {
    const d = j.decisiones;
    const h = j.habituales;
    const datosPartida: FilaDato[] = [];
    if (j.elementos.some((e) => e.id === "bloqueo")) {
      datosPartida.push({ concepto: "Baños y aseos", valor: d.pestillos === "desbloqueo" ? "con condena y desbloqueo desde el exterior" : "sin pestillo", origen: d.pestillos === h.pestillos ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    if (j.oficinas) {
      datosPartida.push({ concepto: "Aseo accesible en zona de uso público", valor: d.aseoPublico === "si" ? "Sí" : "No", origen: d.aseoPublico === h.aseoPublico ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    return fichaSua(j, {
      titulo: "SUA 3 — Aprisionamiento",
      slug: "sua3-aprisionamiento",
      normativa: [citaDe(APRISIONAMIENTO_SUA3.procedencia), citaDe(ASEO_ACCESIBLE_ANEJO_A.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSua3),
      valor: textoEtiquetaSua3,
      textoAviso: textoAvisoSua3,
      observaciones: [
        "Interpretación: la excepción de los baños y aseos de viviendas alcanza solo a la iluminación; si tienen pestillo, también llevan desbloqueo desde el exterior.",
        "Criterio: son puertas de salida la del portal, las de la escalera y los vestíbulos de independencia, las salidas del garaje, la de entrada a las oficinas y la de cada vivienda.",
        "Las puertas del itinerario accesible y su dotación las fija SUA 9; el giro de Ø 1,50 m del aseo accesible es del Anejo A, no de SUA 3.",
      ],
      memoria: memoriaSua3(j),
      caption: "Sección del edificio con los recintos con bloqueo interior y las puertas de salida.",
      pdfSvgId: SUA3_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA3_PDF_SVG_ID,
};
