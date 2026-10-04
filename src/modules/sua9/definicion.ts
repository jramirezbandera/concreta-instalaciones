// =============================================================================
// DB-SUA, SUA 9 — Accesibilidad (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { cambiarAscensor } from "../sua/editar";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../sua/ficha";
import { SUA9_ENTRE_PLANTAS } from "../sua/tablas";
import { dibujoSua9 } from "./dibujo";
import { sua9EstadoDefaults, type Sua9Estado } from "./estado";
import { dim, justificarSua9, TEXTO_ACCESO, type ElementoSua9, type JustificacionSua9 } from "./justificacion";
import { memoriaSua9 } from "./memoria";
import {
  ASEOS_ACCESIBLES,
  CABINA_CORREGIDA,
  CABINA_DB,
  ITINERARIO_ACCESIBLE,
  MECANISMOS_ACCESIBLES,
  PLAZAS_ACCESIBLES,
  SENALIZACION,
  SUA9_DOTACION,
  VIVIENDA_ACCESIBLE,
} from "./tablas";
import {
  describirDibujoSua9,
  franjaSua9,
  fraseSua9,
  m,
  metricasSua9,
  NOMBRE_PUERTAS,
  piezasSua9,
  queEntraSua9,
  resultadoListaSua9,
  textoAvisoSua9,
  textoCabinas,
  textoEtiquetaSua9,
  textoIncumplimientoSua9,
} from "./textos";

export const SUA9_PDF_SVG_ID = "sua9-svg-pdf";

const T = SUA9_ENTRE_PLANTAS.datos;

function limite(el: ElementoSua9): string {
  const d = el.detalle;
  switch (d.clase) {
    case "ambito":
      return "solo viviendas que deban ser accesibles";
    case "vivienda_accesible":
      return "definición del Anejo A";
    case "exterior":
      return `sin escalones · ≤ ${ITINERARIO_ACCESIBLE.datos.pendienteMarcha_pct} % / ≤ ${ITINERARIO_ACCESIBLE.datos.pendienteTransversal_pct} %`;
    case "ascensor":
      return d.residencial ? `> ${T.plantasASalvarMasDe} plantas o > ${T.viviendasSinEntradaMasDe} viviendas` : `> ${T.plantasASalvarMasDe} plantas o > ${T.utilSinEntradaMasDe_m2} m²`;
    case "cabina":
      return `≥ ${textoCabinas(d.minimo)} m (DB: ${textoCabinas(d.minimoDb)} m)`;
    case "plantas":
      return `pasillo ≥ ${m(d.minimo_m)} · puertas ≥ ${m(ITINERARIO_ACCESIBLE.datos.puerta.pasoMarco_m)}`;
    case "viviendas":
      return "reglamentación aplicable";
    case "plazas":
      return d.residencial ? "1 por vivienda accesible" : `1 cada ${PLAZAS_ACCESIBLES.datos.otros.unaCada} o fracción`;
    case "piscina":
      return "grúa si hay viviendas accesibles";
    case "aseos":
      return `1 cada ${ASEOS_ACCESIBLES.datos.unoCadaInodoros} inodoros o fracción`;
    case "atencion":
      return "punto de atención o de llamada";
    case "mecanismos":
      return `${MECANISMOS_ACCESIBLES.datos.mando_cm.min}–${MECANISMOS_ACCESIBLES.datos.mando_cm.max} cm · ≥ ${MECANISMOS_ACCESIBLES.datos.aRincon_cm} cm`;
    case "senalizacion":
      return "tabla 2.1";
    case "local":
      return "proyecto de la actividad";
  }
}

export const sua9: DefinicionSi<Sua9Estado, JustificacionSua9> = {
  key: "sua9",
  db: "DB-SUA",
  defaults: sua9EstadoDefaults,
  sujeto: "Accesibilidad",
  justificar: justificarSua9,
  frase: fraseSua9,
  metricas: metricasSua9,
  queEntra: queEntraSua9,
  piezas: piezasSua9,
  franja: franjaSua9,
  etiqueta: textoEtiquetaSua9,
  resultadoLista: resultadoListaSua9,
  textoAviso: textoAvisoSua9,
  textoIncumplimiento: textoIncumplimientoSua9,
  arreglo: (el) => {
    if (el.veredicto !== "fail") return null;
    const d = (el as ElementoSua9).detalle;
    switch (d.clase) {
      case "exterior":
        return { etiqueta: "Rampa accesible en la parcela", cambios: { entrada: "rampa" } };
      case "cabina":
        return { etiqueta: "Cabina mínima de la tabla", cambios: { cabinaAncho_m: null, cabinaFondo_m: null } };
      case "plantas":
        return { etiqueta: `Pasillos de ${m(d.minimo_m)}`, cambios: { pasillo_m: d.minimo_m } };
      case "ascensor":
        // El ascensor es un dato de El edificio: el arreglo lo escribe allí.
        return { etiqueta: "Disponer ascensor accesible", cambios: {}, edificio: (e) => cambiarAscensor(e, true) };
      default:
        // Las plazas accesibles dependen del garaje de El edificio.
        return null;
    }
  },
  avisosAEdificio: new Set(["construida-garaje", "sin-aseos"]),
  tituloDibujo: "El itinerario accesible",
  pistaDibujo: "Pulsa la entrada, el ascensor, el itinerario o las plazas para ver qué se exige.",
  dibujo: dibujoSua9,
  describirDibujo: describirDibujoSua9,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.unifamiliar ? j.elementos[0]?.id ?? null : "ascensor"),
  memoria: memoriaSua9,
  ficha: (j, o) => {
    const d = j.decisiones;
    const datosPartida: FilaDato[] = [];
    if (j.unifamiliar) {
      datosPartida.push({
        concepto: "La vivienda debe ser accesible",
        valor: d.unifamiliar === "no" ? "No" : d.unifamiliar === "silla" ? "Para usuarios de silla de ruedas" : "Para personas con discapacidad auditiva",
        origen: o.estado.unifamiliar === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION,
      });
    } else {
      const a = j.elementos.find((e) => e.detalle.clase === "ascensor")!.detalle as Extract<ElementoSua9["detalle"], { clase: "ascensor" }>;
      datosPartida.push(
        { concepto: "Entrada principal accesible", valor: `Planta baja, ${TEXTO_ACCESO[d.entrada]}`, origen: o.estado.entrada === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION },
        { concepto: "Plantas a salvar desde la entrada", valor: String(a.plantasASalvar), origen: ORIGEN_EDIFICIO },
        a.residencial
          ? { concepto: "Viviendas en plantas sin entrada accesible", valor: String(a.viviendasSinEntrada), origen: ORIGEN_EDIFICIO }
          : { concepto: "Superficie útil en plantas sin entrada accesible", valor: `${a.utilSinEntrada_m2} m²`, origen: ORIGEN_EDIFICIO },
        { concepto: "Ascensor", valor: a.hay ? "Sí" : "No", origen: a.supuesto ? ORIGEN_SUPUESTO : ORIGEN_EDIFICIO },
      );
      if (j.residencial) {
        datosPartida.push({
          concepto: "Viviendas accesibles (silla de ruedas + auditiva)",
          valor: `${j.viviendas.sr} + ${j.viviendas.auditiva} de ${j.viviendas.total}`,
          origen: j.viviendas.sr + j.viviendas.auditiva === 0 ? ORIGEN_SUPUESTO : ORIGEN_DECISION,
        });
      }
      if (j.cabina) {
        datosPartida.push({
          concepto: "Cabina del ascensor",
          valor: `${dim(j.cabina.ancho_m)} × ${dim(j.cabina.fondo_m)} m, ${NOMBRE_PUERTAS[d.puertasCabina]}`,
          origen: j.cabina.indicada ? ORIGEN_DECISION : ORIGEN_CRITERIO,
        });
      }
      if (j.pasillo) {
        datosPartida.push({
          concepto: "Anchura libre de los pasillos del itinerario",
          valor: j.pasillo.valor_m !== null ? m(j.pasillo.valor_m) : `≥ ${m(j.pasillo.minimo_m)} (sin medir)`,
          origen: j.pasillo.valor_m !== null ? ORIGEN_DECISION : ORIGEN_CRITERIO,
        });
      }
      if (j.cubiertaTransitable) {
        datosPartida.push({ concepto: "Cubierta transitable", valor: d.cubierta === "nula" ? "Tendedero o instalaciones (ocupación nula)" : "Zona comunitaria", origen: o.estado.cubierta === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION });
      }
      if (j.oficinas) {
        datosPartida.push({ concepto: "Atención al público con mostrador fijo", valor: d.atencionPublico === "si" ? "Sí" : "No", origen: o.estado.atencionPublico === "habitual" ? ORIGEN_CRITERIO : ORIGEN_DECISION });
      }
    }
    const normativa = j.unifamiliar
      ? [citaDe(SUA9_DOTACION.procedencia), citaDe(VIVIENDA_ACCESIBLE.procedencia)]
      : [
          citaDe(SUA9_ENTRE_PLANTAS.procedencia),
          citaDe(ITINERARIO_ACCESIBLE.procedencia),
          citaDe(CABINA_DB.procedencia),
          citaDe(CABINA_CORREGIDA.procedencia),
          citaDe(PLAZAS_ACCESIBLES.procedencia),
          citaDe(MECANISMOS_ACCESIBLES.procedencia),
          citaDe(SENALIZACION.procedencia),
        ];
    const observaciones = j.unifamiliar
      ? ["Interpretación: toda la parcela de la unifamiliar es zona exterior privativa y su garaje es interior de la vivienda (SUA 9 ap. 1 pto 2 y Anejo A)."]
      : [
          "Interpretación: las plantas se cuentan en cada sentido desde la planta de la entrada principal accesible, sin sumar las de arriba y las de abajo; el garaje cuenta como zona comunitaria y las plantas solo de trasteros o instalaciones, no (comentarios del Ministerio, no reglamentarios).",
          "Criterio de proyecto: la entrada principal accesible está en la planta baja.",
          `Criterio de proyecto: la cabina se comprueba con la tabla corregida por la ${CABINA_CORREGIDA.datos.norma}, que el Ministerio declara aplicable desde el ${CABINA_CORREGIDA.datos.desde} (comentario, no reglamentario); se cita al lado la del texto del DB.`,
          ...(j.residencial ? ["El DB no fija el número de viviendas accesibles: lo fija la reglamentación aplicable (normativa autonómica; RDL 1/2013, art. 32, en vivienda protegida o de promoción pública)."] : []),
        ];
    return fichaSua(j, {
      titulo: "SUA 9 — Accesibilidad",
      slug: "sua9-accesibilidad",
      normativa,
      datosPartida,
      limite: (el) => limite(el as ElementoSua9),
      valor: textoEtiquetaSua9,
      textoAviso: textoAvisoSua9,
      observaciones,
      memoria: memoriaSua9(j),
      caption: j.unifamiliar
        ? "Sección de la vivienda unifamiliar."
        : "Sección del edificio con el itinerario accesible desde la vía pública, el ascensor accesible o su previsión y las plazas accesibles.",
      pdfSvgId: SUA9_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA9_PDF_SVG_ID,
};
