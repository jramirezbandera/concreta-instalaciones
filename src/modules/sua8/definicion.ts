// =============================================================================
// DB-SUA, SUA 8 — Acción del rayo (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../sua/ficha";
import { dibujoSua8 } from "./dibujo";
import { sua8EstadoDefaults, type Sua8Estado } from "./estado";
import { justificarSua8, type ElementoSua8, type JustificacionSua8 } from "./justificacion";
import { memoriaSua8 } from "./memoria";
import { SUA8_ANEJO_B, SUA8_C1, SUA8_C2, SUA8_NG, SUA8_NIVELES } from "./tablas";
import {
  describirDibujoSua8,
  franjaSua8,
  fraseSua8,
  metricasSua8,
  NOMBRE_CONTENIDO,
  NOMBRE_ENTORNO,
  NOMBRE_ESPECIAL,
  NOMBRE_MATERIAL,
  piezasSua8,
  queEntraSua8,
  resultadoListaSua8,
  textoAvisoSua8,
  textoEtiquetaSua8,
  textoIncumplimientoSua8,
  textoSistema,
} from "./textos";

export const SUA8_PDF_SVG_ID = "sua8-svg-pdf";

function limite(el: ElementoSua8): string {
  const d = el.detalle;
  switch (d.clase) {
    case "altura":
      return "franja a 3H";
    case "ne":
      return "—";
    case "na":
      return "—";
    case "proteccion":
      return "Ne ≤ Na o E < 0,80";
    case "sistema":
      return textoSistema(d.nivel);
  }
}

export const sua8: DefinicionSi<Sua8Estado, JustificacionSua8> = {
  key: "sua8",
  db: "DB-SUA",
  defaults: sua8EstadoDefaults,
  sujeto: "Acción del rayo",
  justificar: justificarSua8,
  frase: fraseSua8,
  metricas: metricasSua8,
  queEntra: queEntraSua8,
  piezas: piezasSua8,
  franja: franjaSua8,
  etiqueta: textoEtiquetaSua8,
  resultadoLista: resultadoListaSua8,
  textoAviso: textoAvisoSua8,
  textoIncumplimiento: textoIncumplimientoSua8,
  arreglo: (el) => (el.veredicto === "fail" && el.id === "proteccion" ? { etiqueta: "Proyectar la instalación", cambios: { instalacion: "habitual" } } : null),
  avisosADatos: new Set(["ng-supuesto"]),
  tituloDibujo: "La superficie de captura",
  pistaDibujo: "Pulsa la altura, Ne, Na o el rayo para ver las cuentas.",
  dibujo: dibujoSua8,
  describirDibujo: describirDibujoSua8,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? "proteccion",
  memoria: memoriaSua8,
  ficha: (j, o) => {
    const d = j.decisiones;
    const ne = j.elementos.find((e) => e.detalle.clase === "ne")!.detalle as Extract<ElementoSua8["detalle"], { clase: "ne" }>;
    const datosPartida: FilaDato[] = [
      { concepto: "Altura del edificio H", valor: fmt(j.h_m, "m", 2), origen: ORIGEN_EDIFICIO },
      {
        concepto: "Dimensiones de la planta",
        valor: `${fmt(j.planta.largo_m, "m", 1)} × ${fmt(j.planta.ancho_m, "m", 1)}`,
        origen: j.planta.supuesta ? ORIGEN_SUPUESTO : ORIGEN_DECISION,
      },
      { concepto: "Remate sobre la cubierta", valor: fmt(d.remate_m, "m", 2), origen: ORIGEN_CRITERIO },
      { concepto: "Densidad de impactos Ng (figura 1.1)", valor: fmt(ne.ng, "impactos/año·km²", 2), origen: ne.ngSupuesto ? ORIGEN_SUPUESTO : "Datos de la obra" },
      { concepto: "Entorno (C1)", valor: NOMBRE_ENTORNO[d.entorno], origen: ORIGEN_DECISION },
      { concepto: "Estructura y cubierta (C2)", valor: `estructura ${NOMBRE_MATERIAL[d.estructura]}, cubierta ${NOMBRE_MATERIAL[d.cubierta]}`, origen: ORIGEN_DECISION },
      { concepto: "Contenido (C3)", valor: NOMBRE_CONTENIDO[d.contenido], origen: ORIGEN_DECISION },
      { concepto: "Uso especial (C5, ap. 1 pto 2)", valor: NOMBRE_ESPECIAL[d.especial], origen: ORIGEN_DECISION },
    ];
    return fichaSua(j, {
      titulo: "SUA 8 — Acción del rayo",
      slug: "sua8-rayo",
      normativa: [citaDe(SUA8_NG.procedencia), citaDe(SUA8_C1.procedencia), citaDe(SUA8_C2.procedencia), citaDe(SUA8_NIVELES.procedencia), citaDe(SUA8_ANEJO_B.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoSua8),
      valor: textoEtiquetaSua8,
      textoAviso: textoAvisoSua8,
      observaciones: [
        "Interpretación: la superficie de captura de una planta rectangular con altura uniforme es Ae = L·B + 6H(L+B) + 9πH²; con una planta en L o en U queda del lado de la seguridad.",
        "Interpretación: H es la altura máxima del edificio sobre la rasante, con el remate de la cubierta.",
        "Ng se lee en el mapa de la figura 1.1 para el municipio de la obra: el mapa no da un valor por provincia.",
      ],
      memoria: memoriaSua8(j),
      caption: "Sección del edificio con la superficie de captura y la instalación de protección contra el rayo.",
      pdfSvgId: SUA8_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA8_PDF_SVG_ID,
};
