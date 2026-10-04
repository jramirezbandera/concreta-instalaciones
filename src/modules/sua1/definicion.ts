// =============================================================================
// DB-SUA, SUA 1 — Riesgo de caídas (feature-20): lo que la sección aporta a la
// pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../sua/ficha";
import { dibujoSua1 } from "./dibujo";
import { sua1EstadoDefaults, type Sua1Estado } from "./estado";
import { justificarSua1, type ElementoSua1, type JustificacionSua1 } from "./justificacion";
import { memoriaSua1 } from "./memoria";
import {
  SUA1_ANCHURA_TABLA_4_1,
  SUA1_BARRERAS,
  SUA1_CLASE_EXIGIBLE,
  SUA1_DISCONTINUIDADES,
  SUA1_ESCALERA_GENERAL,
  SUA1_ESCALERA_RESTRINGIDA,
  SUA1_LIMPIEZA,
  SUA1_RAMPAS,
} from "./tablas";
import {
  arregloSua1,
  cm,
  describirDibujoSua1,
  escaleras,
  franjaSua1,
  fraseSua1,
  m,
  metricasSua1,
  pct,
  piezasSua1,
  queEntraSua1,
  resultadoListaSua1,
  textoAvisoSua1,
  textoEtiquetaSua1,
  textoIncumplimientoSua1,
} from "./textos";

export const SUA1_PDF_SVG_ID = "sua1-svg-pdf";

function limite(el: ElementoSua1): string {
  const d = el.detalle;
  switch (d.clase) {
    case "escalera":
      return d.restringida
        ? `C ≤ ${cm(d.cMax_cm, 0)} · H ≥ ${cm(SUA1_ESCALERA_RESTRINGIDA.datos.huellaMin_cm, 0)} · ≥ ${m(d.anchuraMin_m)}`
        : `C ${fmt(d.cMin_cm ?? 0, undefined, 0)}–${cm(d.cMax_cm)} · H ≥ ${cm(SUA1_ESCALERA_GENERAL.datos.huellaMin_cm, 0)} · 2C+H ${SUA1_ESCALERA_GENERAL.datos.relacionMin_cm}–${SUA1_ESCALERA_GENERAL.datos.relacionMax_cm} · tramo ≤ ${m(d.tramoMax_m ?? 0)}`;
    case "barreras":
      return `≥ ${m(d.min_m)}`;
    case "rampa_garaje":
      return d.peatonal ? `≤ ${pct(d.max_pct)}` : "fuera de 4.3";
    case "rampa_acceso":
      return `≤ ${pct(d.max_pct)} · tramo ≤ ${m(d.tramoMax_m)}`;
    case "resbaladicidad":
      return "tabla 1.2";
    case "limpieza":
      return "≤ 0,85 m desde el interior";
  }
}

export const sua1: DefinicionSi<Sua1Estado, JustificacionSua1> = {
  key: "sua1",
  db: "DB-SUA",
  defaults: sua1EstadoDefaults,
  sujeto: "Riesgo de caídas",
  justificar: justificarSua1,
  frase: fraseSua1,
  metricas: metricasSua1,
  queEntra: queEntraSua1,
  piezas: piezasSua1,
  franja: franjaSua1,
  etiqueta: textoEtiquetaSua1,
  resultadoLista: resultadoListaSua1,
  textoAviso: textoAvisoSua1,
  textoIncumplimiento: textoIncumplimientoSua1,
  arreglo: arregloSua1,
  avisosAEdificio: new Set(["ascensor-supuesto"]),
  tituloDibujo: "Escaleras, barreras y rampas",
  pistaDibujo: "Pulsa una escalera, una barrera o una rampa para ver sus cifras.",
  dibujo: dibujoSua1,
  describirDibujo: describirDibujoSua1,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos[0]?.id ?? null,
  memoria: memoriaSua1,
  ficha: (j, o) => {
    const d = j.decisiones;
    const c = j.contexto;
    const xs = escaleras(j);
    const datosPartida: FilaDato[] = [];
    if (c.general) {
      datosPartida.push({
        concepto: "Ascensor como alternativa a la escalera",
        valor: c.ascensor.valor ? "sí, llega a todas las plantas" : "no",
        origen: c.ascensor.supuesto ? ORIGEN_SUPUESTO : ORIGEN_EDIFICIO,
      });
    }
    for (const x of xs) {
      datosPartida.push({
        concepto: `Alturas de planta (${x.tipo === "interior" ? "escalera interior" : x.tipo === "comun" ? "escalera común" : "escalera del garaje"})`,
        valor: x.porPlanta.map((t) => `${t.etiqueta} ${m(t.h_m)}`).join(" · "),
        origen: ORIGEN_EDIFICIO,
      });
    }
    if (xs.length > 0) {
      datosPartida.push({
        concepto: "Peldaños por planta: n = ⌈h / C⌉, C = h / n",
        valor: xs.map((x) => `${cm(x.cCalculo_cm)} (${x.tipo})`).join(" · "),
        origen: ORIGEN_CRITERIO,
      });
    }
    if (c.general) {
      datosPartida.push(
        { concepto: "Escalera común: anchura útil y huella", valor: `${m(d.anchura_m)} · ${cm(d.huella_cm)}`, origen: d.anchura_m === j.habituales.anchura_m && d.huella_cm === j.habituales.huella_cm ? ORIGEN_CRITERIO : ORIGEN_DECISION },
        { concepto: "Escalera común: tramos por planta y ojo", valor: `${d.tramos} · ${d.ojo === "estrecho" ? "< 40 cm" : "≥ 40 cm"}`, origen: ORIGEN_DECISION },
      );
    }
    if (c.interior) {
      datosPartida.push({ concepto: "Escalera interior: anchura y huella", valor: `${m(d.interiorAnchura_m)} · ${cm(d.interiorHuella_cm)}`, origen: ORIGEN_DECISION });
    }
    if (c.barrerasBajas || c.barrerasAltas) {
      datosPartida.push({
        concepto: "Altura de las barreras (hasta 6 m / más de 6 m)",
        valor: `${c.barrerasBajas ? m(d.barreraBaja_m) : "—"} / ${c.barrerasAltas ? m(d.barreraAlta_m) : "—"}`,
        origen: d.barreraBaja_m === j.habituales.barreraBaja_m && d.barreraAlta_m === j.habituales.barreraAlta_m ? ORIGEN_CRITERIO : ORIGEN_DECISION,
      });
    }
    if (c.rampaGaraje) {
      datosPartida.push({ concepto: "Rampa del garaje", valor: d.rampaGaraje === "peatones" ? `vehículos y personas, ${pct(d.pendienteGaraje_pct)}` : "solo vehículos", origen: ORIGEN_DECISION });
    }
    if (c.acceso) {
      datosPartida.push({ concepto: "Acceso al edificio", valor: d.acceso === "rampa" ? `rampa de ${m(d.rampaLongitud_m)} al ${pct(d.rampaPendiente_pct)}` : "a cota de la acera", origen: ORIGEN_DECISION });
    }
    if (c.oficinas) datosPartida.push({ concepto: "Oficinas con zonas de uso público", valor: d.usoPublico === "si" ? "sí" : "no", origen: ORIGEN_DECISION });
    if (c.limpieza) datosPartida.push({ concepto: "Carpintería a más de 6 m", valor: d.carpinteria === "practicable" ? "practicable o desmontable" : "con fijos", origen: ORIGEN_DECISION });

    return fichaSua(j, {
      titulo: "SUA 1 — Riesgo de caídas",
      slug: "sua1-caidas",
      normativa: [
        citaDe(SUA1_CLASE_EXIGIBLE.procedencia),
        citaDe(SUA1_DISCONTINUIDADES.procedencia),
        citaDe(SUA1_BARRERAS.procedencia),
        citaDe(SUA1_ESCALERA_RESTRINGIDA.procedencia),
        citaDe(SUA1_ESCALERA_GENERAL.procedencia),
        citaDe(SUA1_ANCHURA_TABLA_4_1.procedencia),
        citaDe(SUA1_RAMPAS.procedencia),
        citaDe(SUA1_LIMPIEZA.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoSua1),
      valor: textoEtiquetaSua1,
      textoAviso: textoAvisoSua1,
      observaciones: [
        "Criterio: los peldaños se cuentan con una contrahuella de cálculo de 17,5 cm (18,5 cm en la escalera interior): n = ⌈h / C⌉ y C = h / n, con h la altura de la planta.",
        "Interpretación: la variación de ±1 cm de la contrahuella se comprueba entre cualquier par de plantas de la misma escalera.",
        "Interpretación: la diferencia de cota de cada planta es la de su suelo sobre la rasante exterior; hasta 6 m incluidos, barrera de 0,90 m como mínimo.",
        "Interpretación: si hay ascensor, llega a todas las plantas, también al garaje.",
        "Interpretación: la escalera de las oficinas llega a la planta de entrada, zona accesible: 1,00 m como mínimo (nota 2 de la tabla 4.1).",
        ...(c.limpieza ? ["Criterio: el ap. 5 se aplica a las plantas de vivienda cuyo suelo más 2,20 m de dintel queda a más de 6 m sobre la rasante."] : []),
      ],
      memoria: memoriaSua1(j),
      caption: "Sección del edificio con las escaleras, las barreras de cada planta y las rampas.",
      pdfSvgId: SUA1_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA1_PDF_SVG_ID,
};
