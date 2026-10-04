// =============================================================================
// DB-HS6 — Ficha justificativa (feature-15). Transforma la JUSTIFICACIÓN (la
// protección deducida de El edificio) en el `FichaData` que pinta la plantilla
// ÚNICA `renderFicha`. Función PURA.
//
// Trazabilidad (SPEC §4/§8): cada dato declara su ORIGEN y cada verificación
// cita su apartado. La zona es un dato del proyectista (Apéndice B); los
// criterios que no son CTE (huella por superficie útil, perímetro de la cámara,
// el núcleo supuesto, el garaje como protección análoga en zona I) se rotulan.
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { CitaNormativa, FichaData, FilaDato, FilaVerificacion } from "../../lib/pdf/renderFicha";
import { ENGINE_VERSION } from "../../lib/version";
import type { Hs6Estado } from "./estado";
import type { ElementoHs6, JustificacionHs6 } from "./justificacion";
import { memoriaHs6 } from "./memoria";
import { HS6_PDF_SVG_ID } from "./svg-meta";
import { AMBITO_APLICACION, NIVEL_REFERENCIA_RADON, PARAMETROS_SOLUCIONES, REQUISITOS_POR_ZONA } from "./tablas";
import { resultadoLista, textoAviso } from "./textos";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_DECISION = "Decisión del proyectista";
const ORIGEN_ZONA = "Apéndice B del DB-HS (dato del proyectista)";

function limite(el: ElementoHs6): string {
  const det = el.detalle;
  switch (det.clase) {
    case "zona":
      return "—";
    case "barrera":
      return det.via === "calculo" ? "E < Elim" : `≥ ${det.espesorMin_mm} mm · < 10⁻¹¹ m²/s`;
    case "contencion_garaje":
      return "ventilación HS 3";
    case "camara":
      return "10 cm²/m de perímetro";
    case "despresurizacion":
      return "captación + extracción";
    case "nucleo":
      return "sin discontinuidades";
    case "no_tocan":
      return "—";
  }
}

export interface OpcionesFichaHs6 {
  estado: Hs6Estado;
  edificio: Edificio;
  revisados: readonly string[];
  svg: { nativeW: number; nativeH: number };
}

export function toFichaData(j: JustificacionHs6, o: OpcionesFichaHs6): FichaData {
  const pr = j.proteccion;
  const d = pr.decisiones;
  const hay = (id: string) => j.elementos.some((e) => e.id === id);

  const normativa: CitaNormativa[] = [
    citaDe(AMBITO_APLICACION.procedencia),
    citaDe(NIVEL_REFERENCIA_RADON.procedencia),
  ];
  if (pr.zona !== "sin_exigencia") normativa.push(citaDe(REQUISITOS_POR_ZONA.procedencia));
  if (pr.aplica) normativa.push(citaDe(PARAMETROS_SOLUCIONES.procedencia));

  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
    { concepto: "Municipio", valor: j.municipio || "—", origen: "Datos de la obra" },
    {
      concepto: "Zona de radón",
      valor: pr.zona === "sin_exigencia" ? "No figura en el Apéndice B" : `Zona ${pr.zona}`,
      origen: ORIGEN_ZONA,
    },
  ];
  if (pr.aplica) {
    if (hay("barrera") && pr.sobreNoHabitable) {
      datosPartida.push({
        concepto: `Barrera bajo el ${pr.sobreNoHabitable.conGaraje ? "garaje" : "sótano"}`,
        valor: d.posicionBarrera === "solera" ? "Bajo la solera y en los muros" : "En el forjado de planta baja",
        origen: ORIGEN_DECISION,
      });
    }
    if (pr.sobreTerreno.length > 0 || pr.zona === "I") {
      datosPartida.push({
        concepto: pr.zona === "I" ? "Medida" : "Medida adicional bajo lo que apoya en el terreno",
        valor:
          d.medidaTerreno === "barrera"
            ? "Barrera de protección"
            : d.medidaTerreno === "camara"
              ? "Cámara de aire ventilada"
              : "Despresurización del terreno",
        origen: ORIGEN_DECISION,
      });
    }
    if (hay("barrera")) {
      datosPartida.push({
        concepto: "Justificación de la barrera",
        valor: d.viaBarrera === "lamina_tipo" ? "Lámina tipo (sin cálculo)" : "Por cálculo, en documento aparte",
        origen: ORIGEN_DECISION,
      });
    }
  }

  const verificaciones: FilaVerificacion[] = j.elementos.map((el) => ({
    concepto: el.nombre,
    valor: el.detalle.clase === "barrera" ? (el.detalle.via === "calculo" ? "por cálculo, aparte" : "lámina tipo") : resultadoLista(el),
    limite: limite(el),
    estado: VEREDICTO_FICHA[el.veredicto],
    referencia: el.cita[0] ?? "DB-HS6",
  }));

  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    return `${t.titulo} ${t.detalle} — ${o.revisados.includes(a.id) ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  observaciones.push(
    "La zona de radón la fija el proyectista consultando el Apéndice B del DB-HS; la herramienta no contiene el listado de municipios.",
  );
  if (pr.aplica) {
    observaciones.push(
      "Criterio: lo habitable de la planta baja que excede la superficie útil del sótano se considera apoyado en el terreno.",
    );
    if (hay("camara")) {
      observaciones.push(
        `Criterio: las aberturas de la cámara se calculan con el perímetro de una planta cuadrada de la misma superficie; ningún punto a más de ${PARAMETROS_SOLUCIONES.datos.espacioContencion.distanciaMaxAAbertura_m} m de una abertura.`,
      );
    }
    if (hay("contencion-garaje") && pr.zona === "I") {
      observaciones.push(
        "Criterio: en zona I el garaje ventilado se toma como protección análoga a la cámara de aire (el DB no lo prevé expresamente).",
      );
    }
    if (hay("barrera") && d.viaBarrera === "lamina_tipo") {
      observaciones.push(
        "La barrera se especifica por las condiciones de la lámina tipo; el producto concreto lo elige el proyectista con su coeficiente de difusión declarado.",
      );
    }
    if (hay("barrera") && d.viaBarrera === "calculo") {
      observaciones.push("La barrera por cálculo (ap. 3.1.2) no se verifica en esta ficha: se adjunta su justificación.");
    }
  }

  return {
    titulo: "HS6 — Protección frente al radón",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS6 (consolidado 14-06-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoriaHs6(j).parrafos.map(textoParrafo),
    svg: {
      elementId: HS6_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: "Sección por lo que toca el terreno: la barrera y el espacio de contención frente al radón que sube del terreno.",
    },
    inputs: { estado: o.estado, edificio: o.edificio },
    slug: "hs6-radon",
  };
}
