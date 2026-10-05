// =============================================================================
// DB-HE 5 — Generación mínima de energía eléctrica procedente de fuentes
// renovables (feature-22): lo que la sección aporta a la pantalla común (la de
// SI, SUA y HS 2), a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import { dibujoHe5 } from "./dibujo";
import { he5EstadoDefaults, type He5Estado } from "./estado";
import { justificarHe5, type ElementoHe5, type JustificacionHe5 } from "./justificacion";
import { memoriaHe5 } from "./memoria";
import { AMBITO_HE5, EDICION_HE5, POTENCIA_HE5 } from "./tablas";
import {
  describirDibujoHe5,
  franjaHe5,
  fraseHe5,
  kW,
  m2,
  metricasHe5,
  piezasHe5,
  queEntraHe5,
  resultadoListaHe5,
  textoAvisoHe5,
  textoEtiquetaHe5,
  textoIncumplimientoHe5,
} from "./textos";

export const HE5_PDF_SVG_ID = "he5-svg-pdf";

function limite(el: ElementoHe5): string {
  const d = el.detalle;
  switch (d.clase) {
    case "superficie":
      return `> ${m2(AMBITO_HE5.datos.superficieMayorQue_m2)} para aplicar`;
    case "p1":
      return "Fpr;el·S";
    case "p2":
      return "0,1·(0,5·Sc − Soc)";
    case "potencia":
      return `≥ ${kW(d.pmin_kW)}`;
  }
}

export const he5: DefinicionSi<He5Estado, JustificacionHe5> = {
  key: "he5",
  db: "DB-HE",
  defaults: he5EstadoDefaults,
  sujeto: "Generación eléctrica renovable",
  justificar: justificarHe5,
  frase: fraseHe5,
  metricas: metricasHe5,
  queEntra: queEntraHe5,
  piezas: piezasHe5,
  franja: franjaHe5,
  etiqueta: textoEtiquetaHe5,
  resultadoLista: resultadoListaHe5,
  textoAviso: textoAvisoHe5,
  textoIncumplimiento: textoIncumplimientoHe5,
  arreglo: (el) => {
    const d = (el as ElementoHe5).detalle;
    if (el.veredicto !== "fail" || d.clase !== "potencia") return null;
    return { etiqueta: `Instalar ${kW(d.pmin_kW)}`, cambios: { potencia_kW: null } };
  },
  tituloDibujo: "Superficie construida, cubierta y generación renovable",
  pistaDibujo: "Pulsa una zona, la cubierta o los paneles para ver su cifra.",
  dibujo: dibujoHe5,
  describirDibujo: describirDibujoHe5,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.aplica ? "potencia" : "superficie"),
  memoria: memoriaHe5,
  ficha: (j, o): FichaData => {
    const s = j.superficies;
    const datosPartida: FilaDato[] = [
      { concepto: "Superficie construida, con el garaje", valor: m2(s.s_m2), origen: s.supuesta ? `${ORIGEN_EDIFICIO} (útil × 1,20 en parte)` : ORIGEN_EDIFICIO },
    ];
    if (j.mixto) {
      datosPartida.push({ concepto: "Residencial privado · otros usos", valor: `${m2(s.residencial_m2)} · ${m2(s.resto_m2)}`, origen: ORIGEN_CRITERIO });
    }
    const p2 = j.elementos.find((e) => e.id === "p2")?.detalle;
    if (p2 && p2.clase === "p2") {
      datosPartida.push({
        concepto: "Cubierta no transitable, Sc",
        valor: m2(p2.sc_m2),
        origen: p2.origenSc === "indicada" ? ORIGEN_DECISION : ORIGEN_EDIFICIO,
      });
      datosPartida.push({
        concepto: "Captadores solares térmicos, Soc",
        valor: m2(p2.captadores.soc_m2),
        origen: p2.captadores.supuesto ? ORIGEN_SUPUESTO : p2.captadores.solar ? "HE 4" : ORIGEN_EDIFICIO,
      });
    }
    const pot = j.elementos.find((e) => e.id === "potencia")?.detalle;
    if (pot && pot.clase === "potencia") {
      datosPartida.push({ concepto: "Potencia instalada", valor: kW(pot.instalada_kW), origen: pot.minima ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    const F = POTENCIA_HE5.datos.fprEl;
    const observaciones = [
      `Fpr;el = ${String(F.residencialPrivado).replace(".", ",")} kW/m² en uso residencial privado y ${String(F.resto).replace(".", ",")} kW/m² en el resto de usos.`,
      "La superficie construida incluye la de las zonas de aparcamiento en el interior del edificio y excluye las zonas exteriores comunes (ap. 1).",
    ];
    if (j.mixto) observaciones.push("Edificio con viviendas y otros usos: cada parte con su factor; lo común, los trasteros y el garaje, con el residencial (criterio).");
    return fichaSi(j, {
      titulo: "HE 5 — Generación renovable",
      slug: "he5-generacion",
      normativa: [citaDe(AMBITO_HE5.procedencia), citaDe(POTENCIA_HE5.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHe5),
      valor: textoEtiquetaHe5,
      textoAviso: textoAvisoHe5,
      observaciones,
      edicionDB: EDICION_HE5,
      db: "DB-HE",
      memoria: memoriaHe5(j),
      caption: "Sección del edificio con la superficie construida, la cubierta no transitable y la generación renovable.",
      pdfSvgId: HE5_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HE5_PDF_SVG_ID,
};
