// =============================================================================
// DB-HS 2 — Recogida y evacuación de residuos (feature-21): lo que la sección
// aporta a la pantalla común (la de SI y SUA), a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import { setSuperficie } from "../../lib/edificio/editar";
import type { FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSi, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../si/ficha";
import { dibujoHs2 } from "./dibujo";
import { hs2EstadoDefaults, type Hs2Estado } from "./estado";
import { justificarHs2, type ElementoHs2, type JustificacionHs2 } from "./justificacion";
import { memoriaHs2 } from "./memoria";
import {
  ALMACEN_HS2,
  CARACTERISTICAS_HS2,
  EDICION_HS2,
  FRACCIONES,
  INMEDIATO_HS2,
  MANTENIMIENTO_HS2,
  NOMBRE_FRACCION,
  RESERVA_HS2,
  SITUACION_HS2,
  SUPUESTOS_A2_HS2,
} from "./tablas";
import {
  describirDibujoHs2,
  dm3,
  franjaHs2,
  fraseHs2,
  m2,
  metricasHs2,
  NOMBRE_UBICACION,
  piezasHs2,
  queEntraHs2,
  resultadoListaHs2,
  textoAvisoHs2,
  textoEtiquetaHs2,
  textoIncumplimientoHs2,
  textoVivienda,
} from "./textos";

export const HS2_PDF_SVG_ID = "hs2-svg-pdf";

const NOMBRE_MODO = { calle: "contenedores de calle de superficie", puerta: "puerta a puerta", otro: "contenedores soterrados o recogida neumática" } as const;
const CORTO_MODO = { calle: "calle", puerta: "puerta a puerta", otro: "otro" } as const;
const ORIGEN_COMENTARIO = "Comentario del Ministerio (no reglamentario)";

function limite(el: ElementoHs2): string {
  const d = el.detalle;
  switch (d.clase) {
    case "ocupantes":
      return "sencillos + 2 × dobles";
    case "almacen":
      return `≥ ${m2(d.exigida_m2)}`;
    case "reserva":
      return `≥ ${m2(d.exigida_m2)}`;
    case "recorrido":
      return `${d.ubicacion === "exterior" ? `< ${SITUACION_HS2.datos.distanciaAccesoMenorQue_m} m del acceso · ` : ""}≥ 1,20 m · ≤ ${SITUACION_HS2.datos.pendienteMax_pct} % · sin escalones`;
    case "caracteristicas":
      return `≤ ${CARACTERISTICAS_HS2.datos.temperaturaMax_C} °C · ≥ ${CARACTERISTICAS_HS2.datos.iluminacion_lux} lux`;
    case "inmediato":
      return `C = CA·Pv · ≥ ${INMEDIATO_HS2.datos.capacidadMin_dm3} dm³`;
  }
}

export const hs2: DefinicionSi<Hs2Estado, JustificacionHs2> = {
  key: "hs2",
  db: "DB-HS",
  defaults: hs2EstadoDefaults,
  sujeto: "Recogida y evacuación de residuos",
  justificar: justificarHs2,
  frase: fraseHs2,
  metricas: metricasHs2,
  queEntra: queEntraHs2,
  piezas: piezasHs2,
  franja: franjaHs2,
  etiqueta: textoEtiquetaHs2,
  resultadoLista: resultadoListaHs2,
  textoAviso: textoAvisoHs2,
  textoIncumplimiento: textoIncumplimientoHs2,
  arreglo: (el, j) => {
    const d = (el as ElementoHs2).detalle;
    if (el.veredicto !== "fail" || (d.clase !== "almacen" && d.clase !== "reserva")) return null;
    if (d.origen === "edificio" && j.cuarto) {
      const id = j.cuarto.zonaId;
      return { etiqueta: `Ampliar el cuarto a ${m2(d.exigida_m2)}`, cambios: {}, edificio: (e) => setSuperficie(e, id, d.exigida_m2) };
    }
    return {
      etiqueta: `Dar ${m2(d.exigida_m2)}`,
      cambios: d.clase === "almacen" ? { superficieAlmacen_m2: null } : { superficieReserva_m2: null },
    };
  },
  tituloDibujo: "Almacén, reserva y recorrido hasta la calle",
  pistaDibujo: "Pulsa el contenedor, el camión o una vivienda para ver su condición.",
  dibujo: dibujoHs2,
  describirDibujo: describirDibujoHs2,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos.find((e) => e.id === "almacen" || e.id === "reserva")?.id ?? j.elementos[0]?.id ?? null,
  memoria: memoriaHs2,
  ficha: (j, o): FichaData => {
    const datosPartida: FilaDato[] = [];
    const supuestaRecogida = o.estado.recogida === "habitual" || o.estado.recogida === undefined;
    const modos = new Set(FRACCIONES.map((f) => j.modos[f]));
    datosPartida.push({
      concepto: "Recogida de residuos",
      valor:
        modos.size === 1
          ? NOMBRE_MODO[j.modos.papel]
          : FRACCIONES.map((f) => `${NOMBRE_FRACCION[f].split(" ")[0].toLowerCase()}: ${CORTO_MODO[j.modos[f]]}`).join(" · "),
      origen: supuestaRecogida ? ORIGEN_SUPUESTO : ORIGEN_DECISION,
    });
    for (const v of j.viviendas) {
      datosPartida.push({
        concepto: j.unifamiliar ? "Vivienda" : `Vivienda tipo ${v.nombre} (${v.cantidad})`,
        valor: textoVivienda(v),
        origen: v.dormitorios === 0 ? ORIGEN_CRITERIO : v.doblesSupuestos && v.dormitorios > 1 ? ORIGEN_COMENTARIO : ORIGEN_EDIFICIO,
      });
    }
    const conEspacio = j.elementos.some((e) => e.id === "recorrido");
    if (conEspacio) {
      datosPartida.push({
        concepto: "Ubicación del almacén o la reserva",
        valor: NOMBRE_UBICACION[j.decisiones.ubicacion],
        origen: j.cuarto ? ORIGEN_EDIFICIO : j.decisiones.ubicacion === j.habituales.ubicacion ? ORIGEN_CRITERIO : ORIGEN_DECISION,
      });
    }
    const inmediatos = j.elementos.flatMap((e) => (e.detalle.clase === "inmediato" ? [e.detalle] : []));
    const observaciones = [
      `Almacenamiento inmediato por vivienda: ${inmediatos.map((d) => `${j.unifamiliar ? "la vivienda" : `tipo ${d.vivienda.nombre}`} (Pv ${d.vivienda.pv}): ${d.capacidades.map((c) => `${NOMBRE_FRACCION[c.f].toLowerCase()} ${dm3(c.exigida_dm3)}`).join(", ")}`).join("; ")}.`,
      `Sin datos del servicio, los periodos y contenedores puerta a puerta son los de la tabla A.2 del DB (contenedor de ${SUPUESTOS_A2_HS2.datos.contenedor} l).`,
      "Sin indicar los dormitorios dobles, el principal es doble y los demás sencillos (comentario del Ministerio, no reglamentario); un estudio sin dormitorio cuenta Pv = 2 (criterio).",
      "No se dispone instalación de traslado por bajantes (ap. 2.2).",
    ];
    if (j.elementos.some((e) => e.id === "caracteristicas")) {
      observaciones.push(`Mantenimiento del almacén (tabla 3.1): ${MANTENIMIENTO_HS2.datos.map((m) => `${m.operacion.toLowerCase()}, cada ${m.periodo}`).join("; ")}.`);
    }
    return fichaSi(j, {
      titulo: "HS 2 — Recogida de residuos",
      slug: "hs2-residuos",
      normativa: [citaDe(ALMACEN_HS2.procedencia), citaDe(RESERVA_HS2.procedencia), citaDe(SITUACION_HS2.procedencia), citaDe(INMEDIATO_HS2.procedencia)],
      datosPartida,
      limite: (el) => limite(el as ElementoHs2),
      valor: textoEtiquetaHs2,
      textoAviso: textoAvisoHs2,
      observaciones,
      edicionDB: EDICION_HS2,
      db: "DB-HS",
      memoria: memoriaHs2(j),
      caption: "Sección del edificio con el almacén o el espacio de reserva, el recorrido hasta el punto de recogida y el almacenamiento inmediato de las viviendas.",
      pdfSvgId: HS2_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: HS2_PDF_SVG_ID,
};
