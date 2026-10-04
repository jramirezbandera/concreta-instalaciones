// =============================================================================
// DB-HS1 — Ficha justificativa (feature-17). Transforma la justificación en el
// `FichaData` que pinta la plantilla ÚNICA `renderFicha`. Función PURA.
//
// Los datos de partida siguen la ficha habitual de HS 1: presencia de agua y Ks
// para muros y suelos; zona pluviométrica, altura de coronación, zona eólica,
// entorno y exposición para las fachadas. Cada dato declara su origen; los
// supuestos y los criterios de proyecto (no CTE) se rotulan como tales.
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { CitaNormativa, FichaData, FilaDato, FilaVerificacion } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { codigos } from "./condiciones";
import type { Hs1Estado } from "./estado";
import type { ElementoHs1, JustificacionHs1 } from "./justificacion";
import { memoriaHs1 } from "./memoria";
import { ESPESOR_SUELO_CRITERIO_m } from "./partes";
import { HS1_PDF_SVG_ID } from "./svg-meta";
import {
  CONDICIONES_FACHADA_TABLA_2_7,
  CONDICIONES_MURO_TABLA_2_2,
  CONDICIONES_SUELO_TABLA_2_4,
  EXPOSICION_VIENTO_TABLA_2_6,
  GRADO_FACHADAS_TABLA_2_5,
  GRADO_MUROS_TABLA_2_1,
  GRADO_SUELOS_TABLA_2_3,
  PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10,
  PENDIENTES_CUBIERTA_PLANA_TABLA_2_9,
  TUBOS_DRENAJE_TABLA_3_1,
} from "./tablas";
import { NOMBRE_KS, resultadoLista, solucionCubierta, solucionMuro, solucionSuelo, textoAviso, textoFreatico } from "./textos";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_DECISION = "Decisión del proyectista";
const ORIGEN_GEOTECNICO = "Estudio geotécnico (datos de la obra)";
const SUPUESTO = "Supuesto del lado de la seguridad (falta el dato)";

function limite(el: ElementoHs1): string {
  const d = el.detalle;
  switch (d.clase) {
    case "terreno":
      return "—";
    case "muro":
    case "suelo":
    case "fachada":
      return `grado ${d.grado}`;
    case "cubierta":
      return "ap. 2.4.2";
    case "dren":
      return `Ø ≥ ${d.dn_mm} mm`;
    case "canaletas":
      return `1 cada ${d.m2PorSumidero} m²`;
    case "bombeo":
      return "2 bombas · tabla 3.4";
  }
}

export interface OpcionesFichaHs1 {
  estado: Hs1Estado;
  edificio: Edificio;
  revisados: readonly string[];
  svg: { nativeW: number; nativeH: number };
}

export function toFichaData(j: JustificacionHs1, o: OpcionesFichaHs1): FichaData {
  const hay = (clase: string) => j.elementos.some((e) => e.detalle.clase === clase);
  const muro = j.elementos.find((e) => e.detalle.clase === "muro");
  const terreno = j.elementos.find((e) => e.detalle.clase === "terreno");
  const fachada = j.elementos.find((e) => e.detalle.clase === "fachada");

  const normativa: CitaNormativa[] = [citaDe(GRADO_SUELOS_TABLA_2_3.procedencia), citaDe(CONDICIONES_SUELO_TABLA_2_4.procedencia)];
  if (muro) normativa.unshift(citaDe(GRADO_MUROS_TABLA_2_1.procedencia), citaDe(CONDICIONES_MURO_TABLA_2_2.procedencia));
  normativa.push(
    citaDe(GRADO_FACHADAS_TABLA_2_5.procedencia),
    citaDe(EXPOSICION_VIENTO_TABLA_2_6.procedencia),
    citaDe(CONDICIONES_FACHADA_TABLA_2_7.procedencia),
  );
  if (j.cubierta.pendiente) {
    normativa.push(
      citaDe(j.cubierta.plana ? PENDIENTES_CUBIERTA_PLANA_TABLA_2_9.procedencia : PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10.procedencia),
    );
  }
  if (hay("dren")) normativa.push(citaDe(TUBOS_DRENAJE_TABLA_3_1.procedencia));

  const datosPartida: FilaDato[] = [{ concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO }];
  if (terreno && terreno.detalle.clase === "terreno") {
    const t = terreno.detalle;
    datosPartida.push(
      {
        concepto: "Nivel freático (medio anual)",
        valor: t.presencia.supuesto ? "Sin indicar" : textoFreatico(t.freatico),
        origen: t.presencia.supuesto ? SUPUESTO : ORIGEN_GEOTECNICO,
      },
      {
        concepto: "Presencia de agua",
        valor: `${t.presencia.valor} (cara inferior del suelo a ${fmt(t.caraInferior_m, "m", 2)})`,
        origen: t.presencia.supuesto ? SUPUESTO : "HS 1 · ap. 2.1.1",
      },
      { concepto: "Coeficiente de permeabilidad", valor: NOMBRE_KS[t.ks.valor], origen: t.ks.supuesto ? SUPUESTO : ORIGEN_GEOTECNICO },
    );
  }
  if (fachada && fachada.detalle.clase === "fachada") {
    const f = fachada.detalle;
    datosPartida.push(
      { concepto: "Zona pluviométrica de promedios", valor: f.zona.valor, origen: f.zona.supuesto ? SUPUESTO : "Figura 2.4 (dato del proyectista)" },
      { concepto: "Altura de coronación", valor: fmt(f.altura_m, "m", 1), origen: "El edificio (forjado de cubierta, criterio)" },
      f.eolica.supuesto && !f.influyen.includes("eolica")
        ? { concepto: "Zona eólica", valor: "Sin indicar", origen: "No influye en la tabla 2.6 con esta altura" }
        : { concepto: "Zona eólica", valor: f.eolica.valor, origen: f.eolica.supuesto ? SUPUESTO : "Figura 2.5 (dato del proyectista)" },
      {
        concepto: "Clase del entorno",
        valor: f.terrenoTipo ? `${f.entorno.valor} (terreno tipo ${f.terrenoTipo})` : f.entorno.valor,
        origen: f.entorno.supuesto ? SUPUESTO : "DB-SE (dato del proyectista)",
      },
      { concepto: "Grado de exposición al viento", valor: f.exposicion, origen: "HS 1 · tabla 2.6" },
    );
  }
  const d = j.decisiones;
  if (muro) datosPartida.push({ concepto: "Muro", valor: solucionMuro(d.muroTipo, d.muroImper), origen: ORIGEN_DECISION });
  datosPartida.push(
    { concepto: "Suelo", valor: solucionSuelo(d.sueloTipo, d.sueloIntervencion), origen: ORIGEN_DECISION },
    {
      concepto: "Fachada",
      valor: `${d.fachadaRevestimiento === "con" ? "Con" : "Sin"} revestimiento exterior · ${d.fachadaHojas === "una" ? "una hoja" : "dos hojas"}`,
      origen: ORIGEN_DECISION,
    },
    { concepto: "Cubierta", valor: solucionCubierta(j.cubierta), origen: ORIGEN_DECISION },
  );

  const verificaciones: FilaVerificacion[] = j.elementos.map((el) => ({
    concepto: el.nombre,
    valor: resultadoLista(el),
    limite: limite(el),
    estado: VEREDICTO_FICHA[el.veredicto],
    referencia: el.cita[0] ?? "DB-HS1",
  }));

  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    return `${t.titulo} ${t.detalle} — ${o.revisados.includes(a.id) ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  observaciones.push(
    "La zona pluviométrica, la zona eólica y el terreno tipo los lee el proyectista en las figuras 2.4 y 2.5 del DB y en el DB-SE; la herramienta no contiene ninguna relación por municipio.",
    `Criterio: la cara inferior del suelo en contacto con el terreno se toma ${fmt(ESPESOR_SUELO_CRITERIO_m * 100, "cm", 0)} por debajo de la cota del suelo; la altura de coronación, en la cara superior del forjado de cubierta.`,
    "Interpretación: las filas de la tabla 2.6 se leen como intervalos (hasta 15 m, de 15 a 40 m y de 40 a 100 m).",
  );
  if (j.elementos.some((e) => e.detalle.clase === "suelo" && e.detalle.sinMuro)) {
    observaciones.push(
      "Sin muros en contacto con el terreno, el suelo se justifica con el bloque de muros flexorresistentes o de gravedad de la tabla 2.4 (comentario del Ministerio al ap. 2.2.1, no reglamentario).",
    );
  }
  if (hay("canaletas") || hay("bombeo")) {
    observaciones.push("Criterio: el perímetro del muro es el de una planta cuadrada de la superficie útil del sótano.");
  }
  // Las dos casillas de la tabla 2.4 que difieren de sus vecinas (posible errata del DB).
  for (const e of j.elementos) {
    const s = e.detalle;
    if (s.clase !== "suelo" || s.condiciones === null || s.intervencion !== "sin_intervencion") continue;
    const rara =
      (s.bloque === "flexorresistente_o_gravedad" && s.tipo === "placa" && s.grado === 3) ||
      (s.bloque === "pantalla" && s.tipo === "solera" && s.grado === 4);
    if (rara) {
      observaciones.push(
        `${e.nombre}: las condiciones ${codigos(s.condiciones)} son las de la tabla 2.4 tal como está publicada; difieren de las filas vecinas y podrían ser una errata del DB.`,
      );
    }
  }

  return {
    titulo: "HS1 — Protección frente a la humedad",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS1 (consolidado 14-06-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoriaHs1(j).parrafos.map(textoParrafo),
    svg: {
      elementId: HS1_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: "Sección del edificio: grado de impermeabilidad y condiciones de muros, suelos, fachadas y cubierta.",
    },
    inputs: { estado: o.estado, edificio: o.edificio },
    slug: "hs1-humedad",
  };
}
