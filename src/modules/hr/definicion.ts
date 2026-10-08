// =============================================================================
// DB-HR — Protección frente al ruido, opción simplificada (feature-25): lo que la
// sección aporta a la pantalla común (la de SI, SUA, HS 2, HE 4/5/6 y REBT), a La
// obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import { solucionDe } from "../../lib/constructivo/catalogo";
import { cerramientosDe } from "../../lib/constructivo/cerramientos";
import { designacion, NOMBRE_CERRAMIENTO } from "../../lib/constructivo/textos";
import type { Edificio } from "../../lib/edificio/tipos";
import { dibujoHr } from "./dibujo";
import { hrEstadoDefaults, type HrEstado } from "./estado";
import { justificarHr, type ElementoHr, type JustificacionHr, type SolucionUsada } from "./justificacion";
import { memoriaHr } from "./memoria";
import { EDICION_HR, EXTERIOR_HR, FACHADAS_HR, HORIZONTALES_HR, TABIQUERIA_HR, VERTICALES_HR } from "./tablas";
import {
  dBA,
  describirDibujoHr,
  franjaHr,
  fraseHr,
  metricasHr,
  piezasHr,
  queEntraHr,
  resultadoListaHr,
  TABIQUERIA,
  textoAvisoHr,
  textoEtiquetaHr,
  textoIncumplimientoHr,
} from "./textos";

export const HR_PDF_SVG_ID = "hr-svg-pdf";

/**
 * Los cerramientos de El edificio que comprueba HR, con el mismo nombre que en
 * HE1 y HS1 (feature-26). La planta baja, solo si se comprueba aparte.
 */
function filasCerramientos(j: JustificacionHr, edificio: Edificio): FilaDato[] {
  const fila = (concepto: string, s: Pick<SolucionUsada, "nombre" | "codigo" | "pagina"> & { propios?: boolean }): FilaDato => ({
    concepto,
    valor: designacion(s),
    origen: s.propios ? `${ORIGEN_EDIFICIO} · valores propios` : ORIGEN_EDIFICIO,
  });
  const filas: FilaDato[] = [];
  const vistas = new Set<boolean>();
  let forjado: SolucionUsada | null = null;
  for (const el of j.elementos) {
    const d = el.detalle;
    if ((d.clase === "horizontal" || d.clase === "forjado-adosada") && !forjado) forjado = d.forjado;
    if (d.clase !== "exterior") continue;
    if (d.recinto === "cubierta") {
      filas.push(fila(NOMBRE_CERRAMIENTO.cubierta, d.ciega));
      continue;
    }
    const pb = el.id.endsWith("-pb");
    if (vistas.has(pb)) continue;
    vistas.add(pb);
    filas.push(fila(pb ? NOMBRE_CERRAMIENTO.fachadaPB : NOMBRE_CERRAMIENTO.fachada, d.ciega));
    if (d.hueco) filas.push(fila(pb ? NOMBRE_CERRAMIENTO.ventanaPB : NOMBRE_CERRAMIENTO.ventana, d.hueco));
  }
  // Sin separaciones horizontales, el forjado solo cuenta para la cubierta (K-CER.10).
  if (forjado) filas.push(fila(NOMBRE_CERRAMIENTO.forjado, forjado));
  else if (j.elementos.some((e) => e.id === "cubierta")) filas.push(fila(NOMBRE_CERRAMIENTO.forjado, cerramientosDe(edificio).forjado.sol));
  return filas;
}

function limite(el: ElementoHr): string {
  const d = el.detalle;
  switch (d.clase) {
    case "tabiqueria":
      return `${d.exigeM !== null ? `m ≥ ${d.exigeM} · ` : ""}RA ≥ ${d.exigeRA} dBA`;
    case "vertical":
      return d.r.fila ? `fila ${d.r.fila.m}/${d.r.fila.RA}${d.r.dRAExigido !== null ? ` · ΔRA ≥ ${d.r.dRAExigido}` : ""}` : "sin fila";
    case "horizontal":
      return d.r.fila ? `${d.r.dLwExigido !== null ? `ΔLw ≥ ${d.r.dLwExigido}` : ""}${d.r.comb ? ` · ΔRA ≥ ${d.r.comb.sf}/${d.r.comb.ts}` : ""}`.replace(/^ · /, "") : "sin fila";
    case "puerta":
      return `RA ≥ ${d.exige} dBA`;
    case "ascensor":
      return d.modo === "hueco" ? "tabla 3.2 (paréntesis)" : "RA > 50 dBA";
    case "medianeria":
    case "adosada":
      return `RA ≥ ${d.exige} dBA`;
    case "forjado-adosada":
      return d.r.fila ? `ΔLw ≥ ${d.r.dLwExigido} · ΔRA ≥ ${d.r.dRAExigido}` : "sin fila";
    case "exterior":
      return d.recinto === "cubierta" ? `RA,tr ≥ ${d.r.ciegaExigida ?? "—"} dBA` : `hueco RA,tr ≥ ${d.r.huecoExigido ?? "—"} dBA`;
    case "instalaciones":
      return "se declaran";
  }
}

export const hr: DefinicionSi<HrEstado, JustificacionHr> = {
  key: "hr",
  db: "DB-HR",
  defaults: hrEstadoDefaults,
  sujeto: "Protección frente al ruido",
  justificar: (estado, p) => justificarHr(estado, p),
  frase: fraseHr,
  metricas: metricasHr,
  queEntra: queEntraHr,
  piezas: piezasHr,
  franja: franjaHr,
  etiqueta: textoEtiquetaHr,
  resultadoLista: resultadoListaHr,
  textoAviso: textoAvisoHr,
  textoIncumplimiento: textoIncumplimientoHr,
  arreglo: (el, j) => {
    if (el.veredicto !== "fail" || j.medios) return null;
    // Lo único que se arregla sin elegir otra solución: los valores medios del Catálogo, si bastan.
    return j.avisos.some((a) => a.id === "medios") ? { etiqueta: "Usar los valores medios del Catálogo", cambios: { medios: true } } : null;
  },
  avisosADatos: new Set(["ld", "existente"]),
  tituloDibujo: "Separaciones, fachada y cubierta",
  pistaDibujo: "Pulsa una línea o una cifra para ver su solución.",
  dibujo: dibujoHr,
  describirDibujo: describirDibujoHr,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.elementos.some((e) => e.id === "separacion") ? "separacion" : "fachada-dormitorios"),
  memoria: memoriaHr,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [
      { concepto: "Índice de ruido día de la zona", valor: `Ld = ${dBA(j.ld.valor)}`, origen: j.ld.supuesto ? ORIGEN_SUPUESTO : "Datos de la obra" },
      { concepto: "Ruido exterior dominante", valor: j.ld.aeronaves ? "Aeronaves (+ 4 dBA)" : "Tráfico", origen: "Datos de la obra" },
      {
        concepto: "Tipología",
        valor: { plurifamiliar: "Edificio de viviendas", aislada: "Vivienda unifamiliar aislada", adosada: "Vivienda unifamiliar adosada (Anejo I)", otros: "Edificio sin viviendas" }[j.tipologia],
        origen: ORIGEN_EDIFICIO,
      },
      { concepto: "Tabiquería", valor: `${designacion(solucionDe("tabiqueria", o.estado.tabiqueria.id))} · ${TABIQUERIA[j.tabiqueria]}`, origen: ORIGEN_DECISION },
      { concepto: "Valores del Catálogo", valor: j.medios ? "Medios" : "Mínimos", origen: ORIGEN_CRITERIO },
      ...filasCerramientos(j, o.edificio),
    ];
    if (j.separaciones.medianeras) datosPartida.push({ concepto: "Medianeras", valor: "Sí", origen: "SI 2" });
    const observaciones = [
      "Opción simplificada (DB-HR ap. 3.1.2). Valores del Catálogo de Elementos Constructivos del CTE (CEC, versión de marzo de 2010, no reglamentario): con garantía legal para las soluciones hechas en obra y orientativos para los productos industriales, que se exigirán con su ensayo en el pliego.",
      "Criterios de proyecto (no son exigencia del CTE): en cada celda de las tablas 3.2 y 3.3 basta con cumplir una de sus alternativas con sus notas; lo que comparte planta con las viviendas se supone colindante y lo de la planta de abajo, debajo, salvo lo que el proyecto indica que no linda; la caja de persiana se suma a la ventana con la expresión G.1 del Anejo G.",
      "El edificio es de uso residencial privado: no se le aplican los valores límite de tiempo de reverberación (ap. 2.2).",
    ];
    if (j.tipologia === "otros") observaciones.pop();
    return fichaSi(j, {
      titulo: "HR — Protección frente al ruido",
      slug: "hr-ruido",
      normativa: [citaDe(EXTERIOR_HR.procedencia), citaDe(TABIQUERIA_HR.procedencia), citaDe(VERTICALES_HR.procedencia), citaDe(HORIZONTALES_HR.procedencia), citaDe(FACHADAS_HR.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHr),
      valor: textoEtiquetaHr,
      textoAviso: textoAvisoHr,
      observaciones,
      edicionDB: EDICION_HR,
      db: "DB-HR",
      memoria: memoriaHr(j),
      caption: "Sección del edificio con las separaciones entre viviendas y con otros recintos, la fachada y la cubierta.",
      pdfSvgId: HR_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HR_PDF_SVG_ID,
};
