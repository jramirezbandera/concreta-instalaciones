// =============================================================================
// DB-HE 4 — Contribución mínima de energía renovable para cubrir la demanda de
// agua caliente sanitaria (feature-22): lo que la sección aporta a la pantalla
// común (la de SI, SUA y HS 2), a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import { dibujoHe4 } from "./dibujo";
import { he4EstadoDefaults, type He4Estado } from "./estado";
import { justificarHe4, type ElementoHe4, type JustificacionHe4 } from "./justificacion";
import { memoriaHe4 } from "./memoria";
import { AGUA_FRIA_HE4, AMBITO_HE4, CONTRIBUCION_HE4, DEMANDA_VIVIENDA_HE4, EDICION_HE4 } from "./tablas";
import {
  describirDibujoHe4,
  franjaHe4,
  fraseHe4,
  kWh,
  ld,
  metricasHe4,
  num,
  pct,
  piezasHe4,
  queEntraHe4,
  resultadoListaHe4,
  textoAvisoHe4,
  textoEtiquetaHe4,
  textoIncumplimientoHe4,
  textoSistema,
  textoVivienda,
} from "./textos";

export const HE4_PDF_SVG_ID = "he4-svg-pdf";

function limite(el: ElementoHe4): string {
  const d = el.detalle;
  switch (d.clase) {
    case "vivienda":
      return `${DEMANDA_VIVIENDA_HE4.datos.litrosPersonaDia} l/día·persona`;
    case "oficinas":
      return "tabla c-Anejo F";
    case "demanda":
      return `> ${ld(AMBITO_HE4.datos.demandaMayorQue_l_d)} para aplicar`;
    case "energia":
      return "Anejo G";
    case "contribucion":
      return `≥ ${pct(d.exigida_pct)}`;
  }
}

export const he4: DefinicionSi<He4Estado, JustificacionHe4> = {
  key: "he4",
  db: "DB-HE",
  defaults: he4EstadoDefaults,
  sujeto: "Agua caliente sanitaria renovable",
  justificar: justificarHe4,
  frase: fraseHe4,
  metricas: metricasHe4,
  queEntra: queEntraHe4,
  piezas: piezasHe4,
  franja: franjaHe4,
  etiqueta: textoEtiquetaHe4,
  resultadoLista: resultadoListaHe4,
  textoAviso: textoAvisoHe4,
  textoIncumplimiento: textoIncumplimientoHe4,
  arreglo: (el) => {
    const d = (el as ElementoHe4).detalle;
    if (el.veredicto !== "fail" || d.clase !== "contribucion") return null;
    // Una bomba de calor con el SCOPdhw que llega justo a lo exigido.
    const scop = Math.ceil((1 / (1 - d.exigida_pct / 100)) * 100) / 100;
    if (d.sistema === "bomba_calor") return { etiqueta: `SCOPdhw ${num(scop)}`, cambios: { scop } };
    return null;
  },
  avisosADatos: new Set(["provincia"]),
  tituloDibujo: "Demanda de ACS y producción renovable",
  pistaDibujo: "Pulsa una vivienda, el equipo o una cifra para ver su cuenta.",
  dibujo: dibujoHe4,
  describirDibujo: describirDibujoHe4,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.aplica ? "contribucion" : "demanda"),
  memoria: memoriaHe4,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [];
    for (const v of j.viviendas) {
      datosPartida.push({
        concepto: j.unifamiliar ? "Vivienda" : `Vivienda tipo ${v.nombre} (${v.cantidad})`,
        valor: textoVivienda(v),
        origen: v.dormitorios === 0 ? ORIGEN_CRITERIO : ORIGEN_EDIFICIO,
      });
    }
    const of = j.elementos.find((e) => e.id === "oficinas")?.detalle;
    if (of && of.clase === "oficinas") {
      datosPartida.push({ concepto: "Ocupantes de las oficinas", valor: String(of.ocupantes), origen: of.supuestos ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    if (j.plurifamiliar) {
      datosPartida.push({
        concepto: "Producción de ACS",
        valor: j.decisiones.produccion === "centralizada" ? "Centralizada" : "Individual en cada vivienda",
        origen: o.estado.produccion === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION,
      });
    }
    const en = j.elementos.find((e) => e.id === "energia")?.detalle;
    if (en && en.clase === "energia") {
      datosPartida.push({ concepto: "Agua fría de red", valor: `${en.capital}${en.az !== 0 ? ` (Δ altitud ${en.az} m)` : ""}`, origen: "Datos de la obra · DB-HE Anejo G" });
      datosPartida.push({ concepto: "Pérdidas de distribución, acumulación y recirculación", valor: pct(en.perdidas_pct), origen: en.perdidasSupuestas ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    const c = j.elementos.find((e) => e.id === "contribucion")?.detalle;
    if (c && c.clase === "contribucion") {
      datosPartida.push({
        concepto: "Sistema de producción",
        valor: textoSistema(c),
        origen: c.scopSupuesto && (c.sistema === "bomba_calor" || c.apoyo === "bomba_calor") ? ORIGEN_SUPUESTO : c.sistema === "solar" && c.fraccionSupuesta ? ORIGEN_SUPUESTO : ORIGEN_DECISION,
      });
    }
    const observaciones = [
      `Bomba de calor: renovable = Qusable·(1 − 1/SCOP), con SCOPdhw ≥ ${num(CONTRIBUCION_HE4.datos.scopMinElectrica)} a ${CONTRIBUCION_HE4.datos.temperaturaPreparacionMin_C} °C o más (ap. 3.1 pto 4 y comentario del Ministerio).`,
      "La exigencia es del edificio entero, aunque la producción sea individual (comentario del Ministerio).",
    ];
    if (en && en.clase === "energia") observaciones.push(`Demanda energética anual: ${kWh(en.total_kWh)} (tabla mensual en la memoria).`);
    return fichaSi(j, {
      titulo: "HE 4 — ACS renovable",
      slug: "he4-acs",
      normativa: [citaDe(AMBITO_HE4.procedencia), citaDe(CONTRIBUCION_HE4.procedencia), citaDe(DEMANDA_VIVIENDA_HE4.procedencia), citaDe(AGUA_FRIA_HE4.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHe4),
      valor: textoEtiquetaHe4,
      textoAviso: textoAvisoHe4,
      observaciones,
      edicionDB: EDICION_HE4,
      db: "DB-HE",
      memoria: memoriaHe4(j),
      caption: "Sección del edificio con la demanda de ACS de cada vivienda y la producción renovable.",
      pdfSvgId: HE4_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HE4_PDF_SVG_ID,
};
