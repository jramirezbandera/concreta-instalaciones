// =============================================================================
// DB-HE 6 — Dotaciones mínimas para la infraestructura de recarga de vehículos
// eléctricos (feature-24): lo que la sección aporta a la pantalla común (la de
// SI, SUA, HS 2, HE 4/HE 5 y REBT), a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../si/ficha";
import { dibujoHe6 } from "./dibujo";
import { he6EstadoDefaults, type He6Estado } from "./estado";
import { justificarHe6, type ElementoHe6, type JustificacionHe6 } from "./justificacion";
import { memoriaHe6 } from "./memoria";
import { AMBITO_HE6, DOTACION_HE6, EDICION_HE6 } from "./tablas";
import {
  describirDibujoHe6,
  estaciones,
  franjaHe6,
  fraseHe6,
  metricasHe6,
  piezasHe6,
  plazas,
  queEntraHe6,
  resultadoListaHe6,
  textoAvisoHe6,
  textoEtiquetaHe6,
  textoIncumplimientoHe6,
} from "./textos";

export const HE6_PDF_SVG_ID = "he6-svg-pdf";

function limite(el: ElementoHe6): string {
  const d = el.detalle;
  switch (d.clase) {
    case "plazas":
      return d.uso === "otros" ? `> ${AMBITO_HE6.datos.excluidoHastaPlazas} para aplicar` : "> 0 para aplicar";
    case "conduccion":
      return `≥ ${d.exigidas} (${d.uso === "residencial" ? "100 %" : "20 %"})`;
    case "estaciones":
      return `≥ ${d.minimo}`;
    case "esquema":
    case "estacion":
      return "se declara";
  }
}

export const he6: DefinicionSi<He6Estado, JustificacionHe6> = {
  key: "he6",
  db: "DB-HE",
  defaults: he6EstadoDefaults,
  sujeto: "Recarga del vehículo eléctrico",
  justificar: justificarHe6,
  frase: fraseHe6,
  metricas: metricasHe6,
  queEntra: queEntraHe6,
  piezas: piezasHe6,
  franja: franjaHe6,
  etiqueta: textoEtiquetaHe6,
  resultadoLista: resultadoListaHe6,
  textoAviso: textoAvisoHe6,
  textoIncumplimiento: textoIncumplimientoHe6,
  arreglo: (el) => {
    const d = (el as ElementoHe6).detalle;
    if (el.veredicto !== "fail") return null;
    if (d.clase === "conduccion") return { etiqueta: `Conducción hasta ${plazas(d.exigidas)}`, cambios: { plazasConduccion: null } };
    if (d.clase === "estaciones") return { etiqueta: `Instalar ${estaciones(d.minimo)}`, cambios: { estaciones: null } };
    return null;
  },
  avisosADatos: new Set(["existente"]),
  avisosAEdificio: new Set(["plazas-garaje"]),
  tituloDibujo: "Aparcamiento, conducción de cables y estaciones de recarga",
  pistaDibujo: "Pulsa el garaje o las cifras para ver la dotación.",
  dibujo: dibujoHe6,
  describirDibujo: describirDibujoHe6,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.aplica ? "conduccion" : "plazas"),
  memoria: memoriaHe6,
  ficha: (j, o): FichaData => {
    const pz = j.elementos.find((e) => e.id === "plazas")?.detalle;
    const datosPartida: FilaDato[] = [];
    if (pz && pz.clase === "plazas") {
      datosPartida.push({ concepto: "Plazas interiores", valor: plazas(pz.interiores), origen: ORIGEN_EDIFICIO });
      if (pz.exteriores > 0) datosPartida.push({ concepto: pz.parcela ? "Plaza en la parcela" : "Plazas exteriores adscritas", valor: plazas(pz.exteriores), origen: pz.parcela ? "REBT" : ORIGEN_DECISION });
      datosPartida.push({ concepto: "Uso para la dotación", valor: pz.uso === "residencial" ? "Residencial privado" : "Distinto del residencial privado", origen: ORIGEN_EDIFICIO });
    }
    const est = j.elementos.find((e) => e.id === "estaciones")?.detalle;
    if (est && est.clase === "estaciones") {
      datosPartida.push({ concepto: "Plazas accesibles", valor: String(est.accesibles), origen: est.accesiblesSua ? "SUA 9 ap. 1.2.3" : ORIGEN_DECISION });
      if (est.age) datosPartida.push({ concepto: "Titularidad", valor: "Administración General del Estado", origen: ORIGEN_DECISION });
    }
    const esq = j.elementos.find((e) => e.id === "esquema")?.detalle;
    if (esq && esq.clase === "esquema") datosPartida.push({ concepto: "Esquema de conexión", valor: esq.subesquema, origen: esq.habitual && !esq.unifamiliar ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    const observaciones = [
      "Sección HE 6 introducida por el RD 450/2022 (BOE 15-06-2022). La infraestructura cumple el REBT y su ITC-BT-52 (ap. 2); la previsión de cargas se justifica en el apartado del REBT.",
    ];
    if (est && est.clase === "estaciones" && est.porAccesibles > 0) {
      observaciones.push(`Estaciones en plazas accesibles: una por cada ${DOTACION_HE6.datos.accesiblesPorEstacion}, por exceso (el DB no dice «o fracción»; criterio). Sus tomas, a 80–120 cm, con contraste cromático y a 35 cm o más de los rincones (DB-SUA, Anejo A).`);
    }
    if (j.elementos.some((e) => e.id === "estacion")) observaciones.push("El tipo y la potencia de la estación son decisión de proyecto: el HE 6 no los fija.");
    return fichaSi(j, {
      titulo: "HE 6 — Recarga del vehículo eléctrico",
      slug: "he6-recarga",
      normativa: [citaDe(AMBITO_HE6.procedencia), citaDe(DOTACION_HE6.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHe6),
      valor: textoEtiquetaHe6,
      textoAviso: textoAvisoHe6,
      observaciones,
      edicionDB: EDICION_HE6,
      db: "DB-HE",
      memoria: memoriaHe6(j),
      caption: "Sección del edificio con el aparcamiento, la conducción de cables y las estaciones de recarga.",
      pdfSvgId: HE6_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HE6_PDF_SVG_ID,
};
