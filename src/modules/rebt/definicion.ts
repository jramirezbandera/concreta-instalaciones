// =============================================================================
// REBT — Grado de electrificación y previsión de cargas (feature-23): lo que el
// módulo aporta a la pantalla común (la de SI, SUA, HS 2 y HE 4/5), a La obra y
// al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import { cambiarZonaSi } from "../si/editar";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import { dibujoRebt } from "./dibujo";
import { rebtEstadoDefaults, type RebtEstado } from "./estado";
import { justificarRebt, type ElementoRebt, type JustificacionRebt } from "./justificacion";
import { memoriaRebt } from "./memoria";
import { CONTADORES_REBT, CRITERIOS_REBT, EDICION_REBT, GARAJES_REBT, GRADO_REBT, LOCALES_REBT, PROYECTO_REBT, RECARGA_REBT, SIMULTANEIDAD_REBT } from "./tablas";
import {
  describirDibujoRebt,
  franjaRebt,
  fraseRebt,
  kW,
  m2,
  metricasRebt,
  NOMBRE_GRADO,
  num,
  piezasRebt,
  queEntraRebt,
  resultadoListaRebt,
  textoAvisoRebt,
  textoEtiquetaRebt,
  textoIncumplimientoRebt,
  textoMotivos,
  W,
} from "./textos";

export const REBT_PDF_SVG_ID = "rebt-svg-pdf";

/** El REBT no es el CTE: el criterio se rotula frente a su propio reglamento. */
const ORIGEN_CRITERIO = "Criterio de proyecto (no es exigencia del REBT)";

function limite(el: ElementoRebt): string {
  const d = el.detalle;
  switch (d.clase) {
    case "vivienda":
      return `≥ ${W(d.vivienda.grado === "elevada" ? GRADO_REBT.datos.elevada_W : GRADO_REBT.datos.basica_W)}`;
    case "viviendas":
      return "tabla 1";
    case "servicios":
      return "simultaneidad 1";
    case "local":
      return `${LOCALES_REBT.datos.W_m2} W/m², mín. ${W(LOCALES_REBT.datos.minimoLocal_W)}`;
    case "garaje":
      return `${d.W_m2} W/m², mín. ${W(GARAJES_REBT.datos.minimo_W)}`;
    case "recarga":
      return d.ambito === "otros" ? "1 estación por 40 plazas (HE 6)" : `3680 W × 10 % plazas × ${num(d.factor, 1)}`;
    case "total":
      return "ap. 6";
    case "contadores":
      return d.ubicacion === "cpm" ? "un usuario: CPM" : `local si > ${CONTADORES_REBT.datos.localSiMasDe}`;
    case "documentacion":
      return "ITC-BT-04";
  }
}

export const rebt: DefinicionSi<RebtEstado, JustificacionRebt> = {
  key: "rebt",
  db: "REBT",
  defaults: rebtEstadoDefaults,
  sujeto: "Previsión de cargas",
  justificar: justificarRebt,
  frase: fraseRebt,
  metricas: metricasRebt,
  queEntra: queEntraRebt,
  piezas: piezasRebt,
  franja: franjaRebt,
  etiqueta: textoEtiquetaRebt,
  resultadoLista: resultadoListaRebt,
  textoAviso: textoAvisoRebt,
  textoIncumplimiento: textoIncumplimientoRebt,
  arreglo: (el) => {
    const d = (el as ElementoRebt).detalle;
    if (el.veredicto !== "fail" || d.clase !== "contadores" || d.cuarto || !d.candidato) return null;
    // El cuarto de instalaciones sin tipo de la PB o el primer sótano pasa a ser el de contadores.
    const { zonaId, plantas } = d.candidato;
    return { etiqueta: `Contadores en el cuarto de ${plantas}`, cambios: {}, edificio: (e) => cambiarZonaSi(e, zonaId, { cuarto: "contadores_electricidad" }) };
  },
  avisosAEdificio: new Set(["ascensor-supuesto"]),
  tituloDibujo: "Previsión de cargas del edificio",
  pistaDibujo: "Pulsa una vivienda, una zona o una cifra para ver su cuenta.",
  dibujo: dibujoRebt,
  describirDibujo: describirDibujoRebt,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? "total",
  memoria: memoriaRebt,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [];
    for (const v of j.viviendas) {
      datosPartida.push({
        concepto: j.unifamiliar ? "Vivienda" : `Vivienda tipo ${v.nombre} (${v.cantidad})`,
        valor: `${m2(v.superficie_m2)} útiles · ${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}`,
        origen: v.motivos.includes("equipos") ? (o.estado.electrificacion === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION) : ORIGEN_EDIFICIO,
      });
    }
    const s = j.elementos.find((e) => e.id === "servicios")?.detalle;
    if (s && s.clase === "servicios") {
      if (s.ascensor) datosPartida.push({ concepto: "Ascensor", valor: `${num(s.ascensor.kW, 1)} kW`, origen: s.ascensor.kWSupuesta ? ORIGEN_SUPUESTO : ORIGEN_DECISION });
      datosPartida.push({ concepto: "Otros servicios generales", valor: s.otrosIndicados ? `${num(s.otros_kW, 1)} kW` : "sin indicar", origen: s.otrosIndicados ? ORIGEN_DECISION : ORIGEN_SUPUESTO });
    }
    const g = j.elementos.find((e) => e.id === "garaje")?.detalle;
    if (g && g.clase === "garaje") {
      datosPartida.push({ concepto: "Ventilación del garaje", valor: g.ventilacion === "forzada" ? "Forzada" : "Natural", origen: "DB-HS 3 (decisión del módulo)" });
      if (g.humo) {
        datosPartida.push({
          concepto: "Potencia del garaje con control de humo",
          valor: g.estudiada_kW !== null ? `${num(g.estudiada_kW, 1)} kW` : "sin estudiar",
          origen: g.estudiada_kW !== null ? ORIGEN_DECISION : ORIGEN_SUPUESTO,
        });
      }
    }
    if (j.unifamiliar && o.estado.plazaParcela) datosPartida.push({ concepto: "Plaza para un vehículo en la parcela", valor: "Sí: circuito C13", origen: ORIGEN_DECISION });
    const rc = j.elementos.find((e) => e.id === "recarga")?.detalle;
    if (rc && rc.clase === "recarga") {
      datosPartida.push(
        rc.ambito === "otros"
          ? { concepto: "Recarga del vehículo eléctrico", valor: `${rc.estaciones} estaciones (HE 6) · × 1,0`, origen: "DB-HE 6 ap. 3" }
          : {
              concepto: "Recarga del vehículo eléctrico",
              valor: `${num(rc.plazasPrevision, 2)} plazas · ${rc.spl === "con_spl" ? "colectivo con SPL (× 0,3)" : "sin SPL (× 1,0)"}`,
              origen: o.estado.spl === "habitual" && o.estado.plazasRecarga === null ? ORIGEN_CRITERIO : ORIGEN_DECISION,
            },
      );
    }
    const t = j.elementos.find((e) => e.id === "total")?.detalle;
    const observaciones = [
      "Las potencias de la ITC-BT-10 son mínimas: con una demanda real conocida mayor, se prevé esta (ap. 4 y 5.2; Guía técnica BT-10).",
      `Ascensor y alumbrado común con las cifras orientativas de la Guía técnica BT-10 (sep-03, tabla A; alumbrado con las de fluorescencia, criterio para el LED). Intensidad con cos φ = ${num(CRITERIOS_REBT.datos.cosPhi, 1)}: el REBT no fija el factor de potencia (criterio).`,
      "Superficies útiles de El edificio para locales, oficinas y garaje: la ITC-BT-10 dice «por metro cuadrado y planta» sin precisar (criterio; el modelo de memoria técnica de diseño de la Guía BT-04 pide la útil).",
    ];
    if (rc && rc.clase === "recarga" && rc.ambito === "viviendas") {
      observaciones.push(`Guía técnica BT-52 (sept-2024), Anexo 2: con la conducción de cables a todas las plazas (HE 6) recomienda prever ${kW(rc.anexo2_W)} para la recarga. Es una recomendación, no una exigencia: no se suma.`);
    }
    if (t && t.clase === "total") observaciones.push(`Carga total: ${kW(t.p_W)}, ${num(t.i_A, 1)} A (tabla de la previsión en la memoria).`);
    return fichaSi(j, {
      titulo: "REBT — Previsión de cargas",
      slug: "rebt-prevision",
      normativa: [
        citaDe(GRADO_REBT.procedencia),
        citaDe(SIMULTANEIDAD_REBT.procedencia),
        citaDe(RECARGA_REBT.procedencia),
        citaDe(CONTADORES_REBT.procedencia),
        citaDe(PROYECTO_REBT.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoRebt),
      valor: textoEtiquetaRebt,
      textoAviso: textoAvisoRebt,
      observaciones,
      edicionDB: EDICION_REBT,
      db: "REBT",
      memoria: memoriaRebt(j),
      caption: "Sección del edificio con la previsión de cargas de cada zona, los contadores y la carga total.",
      pdfSvgId: REBT_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: REBT_PDF_SVG_ID,
};
