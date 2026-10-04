// =============================================================================
// DB-SUA, SUA 2 — Impacto y atrapamiento (feature-20): lo que la sección aporta
// a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO } from "../sua/ficha";
import { metros } from "../sua/colocar";
import { dibujoSua2 } from "./dibujo";
import { CLAVE_ALTURA, sua2EstadoDefaults, type Sua2Estado } from "./estado";
import { justificarSua2, type ElementoSua2, type JustificacionSua2 } from "./justificacion";
import { memoriaSua2 } from "./memoria";
import { ALTURAS_SUA2_1_1, ATRAPAMIENTO_SUA2_2, PUERTAS_SUA2_1_2, SENALIZACION_VIDRIOS_SUA2_1_4, VIDRIOS_SUA2_TABLA_1_1 } from "./tablas";
import {
  describirDibujoSua2,
  FILA_CORTA,
  franjaSua2,
  fraseSua2,
  literalFila,
  metricasSua2,
  nombreGrupo,
  piezasSua2,
  queEntraSua2,
  resultadoListaSua2,
  textoAvisoSua2,
  textoEtiquetaSua2,
  textoIncumplimientoSua2,
} from "./textos";

export const SUA2_PDF_SVG_ID = "sua2-svg-pdf";

function limite(el: ElementoSua2): string {
  const d = el.detalle;
  switch (d.clase) {
    case "altura":
      return `≥ ${metros(d.limite_m)}`;
    case "salientes":
      return "vuelos ≥ 2,20 m · salientes ≤ 15 cm";
    case "puertas":
      return "sin barrer pasillos de < 2,50 m";
    case "automaticas":
      return "marcado CE";
    case "vidrios":
      return literalFila(d.fila);
    case "mamparas":
      return "nivel 3 sin rotura";
    case "senalizacion":
      return "0,85–1,10 y 1,50–1,70 m";
    case "atrapamiento":
      return "a ≥ 20 cm";
    case "local":
      return "—";
  }
}

const BARRIDO: Record<string, string> = {
  no_invaden: "no barren el pasillo",
  pasillo_ancho: "pasillos de más de 2,50 m",
  invaden: "barren el pasillo",
};

export const sua2: DefinicionSi<Sua2Estado, JustificacionSua2> = {
  key: "sua2",
  db: "DB-SUA",
  defaults: sua2EstadoDefaults,
  sujeto: "Impacto y atrapamiento",
  justificar: justificarSua2,
  frase: fraseSua2,
  metricas: metricasSua2,
  queEntra: queEntraSua2,
  piezas: piezasSua2,
  franja: franjaSua2,
  etiqueta: textoEtiquetaSua2,
  resultadoLista: resultadoListaSua2,
  textoAviso: textoAvisoSua2,
  textoIncumplimiento: textoIncumplimientoSua2,
  arreglo: (el, j) => {
    if (el.veredicto !== "fail") return null;
    const d = (el as ElementoSua2).detalle;
    if (d.clase === "puertas") return { etiqueta: "Que no barran el pasillo", cambios: { puertas: "habitual" } };
    // Lo habitual solo arregla la altura si la planta la deja.
    if (d.clase === "altura" && j.habituales.alturas[d.grupo] >= d.limite_m) {
      return { etiqueta: `Volver a ${metros(j.habituales.alturas[d.grupo])}`, cambios: { [CLAVE_ALTURA[d.grupo]]: "habitual" } as Partial<Sua2Estado> };
    }
    return null;
  },
  tituloDibujo: "Altura libre y vidrios",
  pistaDibujo: "Pulsa una zona, una puerta o el vidrio de una planta para ver su condición.",
  dibujo: dibujoSua2,
  describirDibujo: describirDibujoSua2,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? j.elementos[0]?.id ?? null,
  memoria: memoriaSua2,
  ficha: (j, o) => {
    const datosPartida: FilaDato[] = [];
    for (const el of j.elementos) {
      const d = el.detalle;
      if (d.clase === "altura") {
        datosPartida.push({
          concepto: `Altura libre de paso · ${nombreGrupo(d.grupo, d.unifamiliar).toLowerCase()}`,
          valor: metros(d.valor_m),
          origen: d.indicada ? ORIGEN_DECISION : ORIGEN_CRITERIO,
        });
      }
      if (d.clase === "vidrios" && d.plantas.length > 0) {
        datosPartida.push({ concepto: `Diferencia de cota de los vidrios · ${d.plantas.map((p) => p.etiqueta).join(", ")}`, valor: FILA_CORTA[d.fila], origen: ORIGEN_EDIFICIO });
      }
    }
    if (j.conPasillos) {
      datosPartida.push({ concepto: "Puertas a pasillos comunes", valor: BARRIDO[j.decisiones.puertas], origen: j.decisiones.puertas === j.habituales.puertas ? ORIGEN_CRITERIO : ORIGEN_DECISION });
    }
    return fichaSua(j, {
      titulo: "SUA 2 — Impacto y atrapamiento",
      slug: "sua2-impacto",
      normativa: [
        citaDe(ALTURAS_SUA2_1_1.procedencia),
        citaDe(PUERTAS_SUA2_1_2.procedencia),
        citaDe(VIDRIOS_SUA2_TABLA_1_1.procedencia),
        citaDe(SENALIZACION_VIDRIOS_SUA2_1_4.procedencia),
        citaDe(ATRAPAMIENTO_SUA2_2.procedencia),
      ],
      datosPartida,
      limite: (el) => limite(el as ElementoSua2),
      valor: textoEtiquetaSua2,
      textoAviso: textoAvisoSua2,
      observaciones: [
        "Interpretación: el interior de las viviendas y el garaje de la unifamiliar son de uso restringido (2,10 m); las zonas comunes, el garaje comunitario, los pasillos de trasteros y las oficinas, no (2,20 m).",
        "Interpretación: la diferencia de cota de los vidrios de fachada es la cota del suelo de cada planta sobre la rasante; los límites 0,55 m y 12 m justos van a la fila «comprendida entre».",
        "Criterio: un pasillo de 2,50 m justos se trata como de menos de 2,50 m.",
        "Criterio: las oficinas se consideran de uso general (no restringido) mientras no se declare que tienen 10 usuarios habituales como máximo y no reciben público.",
        "El significado de los parámetros X, Y y Z lo da UNE-EN 12600:2003; la clasificación de cada vidrio la declara el fabricante.",
      ],
      memoria: memoriaSua2(j),
      caption: "Sección del edificio con la altura libre de paso de cada zona y la clasificación de los vidrios de cada planta.",
      pdfSvgId: SUA2_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA2_PDF_SVG_ID,
};
