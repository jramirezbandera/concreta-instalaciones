// =============================================================================
// DB-HS3 — Ficha justificativa (feature-15). Transforma la JUSTIFICACIÓN (la
// ventilación deducida de El edificio, verificada por el motor) en el
// `FichaData` que pinta la plantilla ÚNICA `renderFicha`. Función PURA.
//
// Trazabilidad (SPEC §4/§8): cada dato declara su ORIGEN y cada verificación
// cita su apartado. Los criterios que no son CTE (reparto del equilibrado, Ø de
// la serie, trasteros con el garaje, pares de aberturas redondeados) se rotulan
// como tales.
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { CitaNormativa, FichaData, FilaDato, FilaVerificacion } from "../../lib/pdf/renderFicha";
import { ENGINE_VERSION } from "../../lib/version";
import type { Hs3Estado } from "./estado";
import type { ElementoHs3, JustificacionHs3 } from "./justificacion";
import { memoriaHs3 } from "./memoria";
import { HS3_PDF_SVG_ID } from "./svg-meta";
import {
  AREA_EFECTIVA_ABERTURAS,
  CAUDALES_LOCALES_HABITABLES,
  CAUDALES_NO_HABITABLES,
  COCCION_MIN,
  GARAJE_HS3,
  HIBRIDA_CONDUCTOS,
  SECCION_CONDUCTO_MECANICA,
  SECCION_CONDUCTO_TABLA_4_2,
  TIRO_TABLA_4_3,
  TRASTEROS_HS3,
  VIVIENDA_DISENO,
} from "./tablas";
import { resultadoLista, textoAviso } from "./textos";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_DECISION = "Decisión del proyectista";
const ORIGEN_CRITERIO = "Criterio de proyecto (no CTE)";

function limite(el: ElementoHs3): string {
  const det = el.detalle;
  switch (det.clase) {
    case "local":
      return `≥ ${det.local.minimo_l_s.toString().replace(".", ",")} l/s`;
    case "campana":
      return `≥ ${COCCION_MIN.datos.caudalMin_l_s} l/s`;
    case "paso":
      return `≥ ${AREA_EFECTIVA_ABERTURAS.datos.pasoMin_cm2} cm² y 8·qvp`;
    case "equilibrio":
      return "entra = sale";
    case "conductos":
      return det.sistema === "mecanica" ? "S ≥ 2,5·qvt" : "Tabla 4.2";
    case "garaje":
      return "120 l/s por plaza";
    case "aberturas_garaje":
      return det.sistema === "mecanica" ? "1 + 1 por 100 m²" : "8·qv por fachada";
    case "co":
      return "> 5 plazas o > 100 m²";
    case "trasteros":
      return "0,7 l/s·m²";
  }
}

export interface OpcionesFichaHs3 {
  estado: Hs3Estado;
  edificio: Edificio;
  revisados: readonly string[];
  svg: { nativeW: number; nativeH: number };
}

export function toFichaData(j: JustificacionHs3, o: OpcionesFichaHs3): FichaData {
  const d = j.red.decisiones;
  const hayViviendas = j.red.tipos.length > 0;

  const normativa: CitaNormativa[] = [];
  if (hayViviendas) {
    normativa.push(
      citaDe(VIVIENDA_DISENO.procedencia),
      citaDe(CAUDALES_LOCALES_HABITABLES.procedencia),
      citaDe(COCCION_MIN.procedencia),
      citaDe(AREA_EFECTIVA_ABERTURAS.procedencia),
    );
    if (d.sistema === "mecanica") normativa.push(citaDe(SECCION_CONDUCTO_MECANICA.procedencia));
    else {
      normativa.push(
        citaDe(SECCION_CONDUCTO_TABLA_4_2.procedencia),
        citaDe(TIRO_TABLA_4_3.procedencia),
        citaDe(HIBRIDA_CONDUCTOS.procedencia),
      );
    }
  }
  if (j.red.garajes.length > 0 || j.red.trasteros.length > 0) normativa.push(citaDe(CAUDALES_NO_HABITABLES.procedencia));
  if (j.red.garajes.length > 0) normativa.push(citaDe(GARAJE_HS3.procedencia));
  if (j.red.trasteros.length > 0) normativa.push(citaDe(TRASTEROS_HS3.procedencia));

  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
  ];
  if (hayViviendas) {
    datosPartida.push(
      { concepto: "Sistema de las viviendas", valor: d.sistema === "mecanica" ? "Mecánico" : "Híbrido", origen: ORIGEN_DECISION },
      {
        concepto: "Admisión",
        valor: d.admision === "aireadores" ? "Aireadores en la carpintería" : "Aberturas en fachada",
        origen: ORIGEN_DECISION,
      },
      {
        concepto: "Equilibrado",
        valor: d.equilibrado === "proporcional" ? "En proporción a la tabla 2.1" : "Al salón (a la cocina si sobra admisión)",
        origen: `${ORIGEN_DECISION} · ${ORIGEN_CRITERIO}`,
      },
    );
    if (d.sistema === "hibrida") datosPartida.push({ concepto: "Zona térmica (tabla 4.4)", valor: j.zona, origen: "Datos de la obra" });
    for (const t of j.red.tipos) {
      datosPartida.push({
        concepto: j.red.unifamiliar ? "Vivienda" : `Vivienda tipo ${t.nombre}`,
        valor: `${t.dormitorios} dorm. · ${t.locales.filter((l) => l.humedo).length} húmedos · ${t.viviendas} ud.`,
        origen: ORIGEN_EDIFICIO,
      });
    }
  }
  for (const g of j.red.garajes) {
    datosPartida.push(
      { concepto: "Garaje", valor: `${g.plazas} plazas · ${Math.round(g.superficie_m2)} m²`, origen: ORIGEN_EDIFICIO },
      { concepto: "Ventilación del garaje", valor: d.garaje === "mecanica" ? "Mecánica" : "Natural", origen: ORIGEN_DECISION },
    );
  }
  for (const t of j.red.trasteros) {
    datosPartida.push({ concepto: "Trasteros", valor: `${Math.round(t.superficie_m2)} m²`, origen: ORIGEN_EDIFICIO });
  }

  const verificaciones: FilaVerificacion[] = j.elementos.map((el) => {
    const parte = j.partes.find((p) => p.id === el.parte);
    const prefijo = parte && j.partes.length > 1 && el.parte !== "garaje" && !j.red.unifamiliar ? `${parte.nombre.split(" · ")[0]} · ` : "";
    return {
      concepto: `${prefijo}${el.nombre}`,
      valor: resultadoLista(el),
      limite: limite(el),
      estado: VEREDICTO_FICHA[el.veredicto],
      referencia: el.cita[0] ?? "DB-HS3",
    };
  });

  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    return `${t.titulo} ${t.detalle} — ${o.revisados.includes(a.id) ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  if (hayViviendas) {
    observaciones.push(
      "Criterio: el mínimo total de los húmedos se reparte a partes iguales, y lo que falta para equilibrar, " +
        (d.equilibrado === "proporcional"
          ? "en proporción a la tabla 2.1 (comentario del Ministerio al ap. 3.1.1)."
          : "se suma al salón (a la cocina si sobra admisión)."),
      "Criterio: un conducto colectivo por local húmedo y vertical, que recoge ese local en todas las plantas.",
    );
    if (d.sistema === "mecanica") {
      observaciones.push("Criterio: el Ø de cada conducto es el circular de la serie que cubre la sección S ≥ 2,5·qvt (fórmula 4.1).");
    }
  }
  if (j.red.garajes.length > 0 && d.garaje === "mecanica") {
    observaciones.push("Criterio: los pares de aberturas del garaje se redondean al entero superior de la superficie entre 100 m².");
  }
  if (j.red.trasteros.some((t) => t.conGarajeId)) {
    observaciones.push("Criterio: los trasteros en el recinto del garaje mecánico ventilan con él y su caudal se suma al del garaje.");
  }
  if (j.red.rite.locales > 0 || j.red.rite.oficinas > 0) {
    observaciones.push("Los locales sin uso y las oficinas quedan fuera del ámbito del HS 3: su ventilación se justifica con el RITE (IT 1.1.4.2).");
  }

  return {
    titulo: "HS3 — Calidad del aire interior (ventilación)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS3 (consolidado 14-06-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoriaHs3(j).parrafos.map(textoParrafo),
    svg: {
      elementId: HS3_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: hayViviendas
        ? `Planta esquemática de la ${j.partes[0]?.nombre.toLowerCase() ?? "vivienda"}: el aire entra por los secos y sale por los húmedos.`
        : "El garaje: extracción, aberturas y detección de monóxido.",
    },
    inputs: { estado: o.estado, edificio: o.edificio },
    slug: "hs3-ventilacion",
  };
}
