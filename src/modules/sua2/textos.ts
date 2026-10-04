// =============================================================================
// DB-SUA, SUA 2 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista, metros } from "../sua/colocar";
import type { ClaseAltura } from "./estado";
import type { DetalleSua2, ElementoSua2, JustificacionSua2, PlantaVidrio } from "./justificacion";
import {
  ALTURAS_SUA2_1_1,
  ATRAPAMIENTO_SUA2_2,
  PUERTAS_SUA2_1_2,
  SENALIZACION_VIDRIOS_SUA2_1_4,
  VIDRIOS_SUA2_TABLA_1_1,
  type FilaVidrioSua2,
} from "./tablas";

const A = ALTURAS_SUA2_1_1.datos;
const V = VIDRIOS_SUA2_TABLA_1_1.datos;
const SEN = SENALIZACION_VIDRIOS_SUA2_1_4.datos;
const PASILLO = PUERTAS_SUA2_1_2.datos.pasilloBarrido_anchuraMenorQue_m;

export function nombreGrupo(g: ClaseAltura, unifamiliar: boolean): string {
  switch (g) {
    case "vivienda":
      return unifamiliar ? "Interior de la vivienda" : "Interior de las viviendas";
    case "comun":
      return "Zonas comunes";
    case "garaje":
      return "Garaje";
    case "oficinas":
      return "Oficinas";
  }
}

/** «en el interior de las viviendas», «en el garaje»… */
function enGrupo(g: ClaseAltura, unifamiliar: boolean): string {
  switch (g) {
    case "vivienda":
      return unifamiliar ? "en el interior de la vivienda y su garaje" : "en el interior de las viviendas";
    case "comun":
      return "en las zonas comunes";
    case "garaje":
      return "en el garaje";
    case "oficinas":
      return "en las oficinas";
  }
}

export const FILA_CORTA: Record<FilaVidrioSua2, string> = {
  menor055: "< 0,55 m",
  entre055y12: "0,55–12 m",
  mayor12: "> 12 m",
};

/** El parámetro que distingue la fila, para la etiqueta del dibujo. */
const FILA_ETIQUETA: Record<FilaVidrioSua2, string> = {
  menor055: "vidrio X 1, 2 ó 3",
  entre055y12: "vidrio Z 1 ó 2",
  mayor12: "vidrio Z 1",
};

/** «X 1, 2 ó 3 · Y B o C · Z cualquiera». */
export function literalFila(f: FilaVidrioSua2): string {
  const c = V.filas[f];
  return `X ${c.X} · Y ${c.Y} · Z ${c.Z}`;
}

/** «PB, P1–P3» a partir de las plantas, agrupando las consecutivas. */
export function plantasVidrio(pl: readonly PlantaVidrio[]): string {
  if (pl.length === 0) return "";
  const orden = [...pl].sort((a, b) => a.nivel - b.nivel);
  const tramos: PlantaVidrio[][] = [];
  for (const p of orden) {
    const t = tramos[tramos.length - 1];
    if (t && t[t.length - 1].nivel === p.nivel - 1) t.push(p);
    else tramos.push([p]);
  }
  return tramos.map((t) => (t.length === 1 ? t[0].etiqueta : `${t[0].etiqueta}–${t[t.length - 1].etiqueta}`)).join(", ");
}

function det(el: ElementoSi<unknown>): DetalleSua2 {
  return (el as ElementoSua2).detalle;
}

type DetalleAltura = Extract<DetalleSua2, { clase: "altura" }>;

function alturas(j: JustificacionSua2): DetalleAltura[] {
  return j.elementos.flatMap((x) => (x.detalle.clase === "altura" ? [x.detalle] : []));
}

/** La fila más exigente presente (la de mayor diferencia de cota). */
function peorFila(j: JustificacionSua2): FilaVidrioSua2 {
  const filas = j.elementos.flatMap((x) => (x.detalle.clase === "vidrios" && x.detalle.plantas.length > 0 ? [x.detalle.fila] : []));
  return filas.includes("mayor12") ? "mayor12" : filas.includes("entre055y12") ? "entre055y12" : "menor055";
}

export function fraseSua2(j: JustificacionSua2): string {
  const fallo = j.elementos.find((x) => x.veredicto === "fail");
  if (fallo) {
    const d = fallo.detalle;
    if (d.clase === "altura") {
      return `La altura libre de paso ${enGrupo(d.grupo, d.unifamiliar)} es de ${metros(d.valor_m)}, menor que los ${metros(d.limite_m)} exigidos.`;
    }
    if (d.clase === "puertas") return `Las puertas de los recintos barren pasillos comunes de menos de ${metros(PASILLO)}: tienen que abrir sin invadirlos.`;
  }
  const partes = alturas(j).map((d) => `${metros(d.valor_m)} ${enGrupo(d.grupo, d.unifamiliar)}`);
  const altura = partes.length > 0 ? `Altura libre de paso de ${lista(partes)}` : "Sin zonas de circulación";
  return `${altura}; vidrios con la clasificación de la tabla 1.1 según la cota de cada planta.`;
}

export function metricasSua2(j: JustificacionSua2): string {
  const v = alturas(j).map((d) => metros(d.valor_m).replace(" m", ""));
  return `h libre ${v.join(" / ")} m · ${FILA_ETIQUETA[peorFila(j)]}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : e === "pv" ? "pv" : "normal";
}

export function queEntraSua2(j: JustificacionSua2, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "altura") {
      filas.push({
        id: el.id,
        titulo: nombreGrupo(d.grupo, d.unifamiliar),
        detalle: `${d.plantas} · planta de ${metros(d.alturaPlanta_m)}`,
        trato: `≥ ${metros(d.limite_m)}`,
        estado: trato(estados[el.id]),
        elementoId: el.id,
      });
    } else if (d.clase === "vidrios" && d.plantas.length > 0) {
      filas.push({
        id: el.id,
        titulo: "Vidrios de fachada",
        detalle: `${plantasVidrio(d.plantas)} · Δ ${FILA_CORTA[d.fila]}`,
        trato: FILA_ETIQUETA[d.fila].replace("vidrio ", ""),
        estado: trato(estados[el.id]),
        elementoId: el.id,
      });
    } else if (d.clase === "local") {
      filas.push({ id: el.id, titulo: "Local sin uso", detalle: d.zona.plantas, trato: "con su actividad", estado: "pv", elementoId: el.id });
    }
  }
  return filas;
}

export function textoEtiquetaSua2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return `h libre ${metros(d.valor_m)}`;
    case "salientes":
      return `vuelos ≥ ${metros(A.alturaVuelosFachada_m)}`;
    case "puertas":
      return d.barrido === "invaden" ? "barren el pasillo" : "no barren el pasillo";
    case "automaticas":
      return "marcado CE";
    case "vidrios":
      return FILA_ETIQUETA[d.fila];
    case "mamparas":
      return "laminado o templado";
    case "senalizacion":
      return "señalizar vidrios";
    case "atrapamiento":
      return `corredera ≥ ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm`;
    case "local":
      return "con su actividad";
  }
}

export function resultadoListaSua2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return `${metros(d.valor_m)}${d.indicada ? "" : " (lo habitual)"} · mínimo ${metros(d.limite_m)}`;
    case "salientes":
      return `vuelos de fachada ≥ ${metros(A.alturaVuelosFachada_m)} · salientes ≤ ${A.salientesParedes.vueloMax_cm} cm`;
    case "puertas":
      return d.barrido === "invaden" ? `barren pasillos de < ${metros(PASILLO)}` : d.barrido === "pasillo_ancho" ? "pasillos de más de 2,50 m: no invaden la anchura de SI 3" : "no barren el pasillo";
    case "automaticas":
      return "reglamentación específica, marcado CE y dispositivos de protección";
    case "vidrios":
      return `${d.plantas.length > 0 ? `${plantasVidrio(d.plantas)}${d.interiores ? " e interiores" : ""}` : "interiores"} · ${literalFila(d.fila)}`;
    case "mamparas":
      return `laminado o templado, impacto de nivel ${V.puertasDuchasBaneras.nivelImpactoSinRotura} sin rotura`;
    case "senalizacion":
      return `${lista(d.donde)} · franjas a 0,85–1,10 y 1,50–1,70 m`;
    case "atrapamiento":
      return `holgura ≥ ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm · automáticos con dispositivos de protección`;
    case "local":
      return "se justificará con el proyecto de su actividad";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSua2(el: ElementoSi<unknown>, _j: JustificacionSua2, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return {
        clase: "Impacto con elementos fijos · ap. 1.1",
        titulo: el.nombre,
        valor: metros(d.valor_m).replace(" m", ""),
        unidad: "m",
        estado,
        manda:
          d.grupo === "vivienda"
            ? `El interior de una vivienda es de uso restringido: altura libre de ${metros(d.limite_m)} como mínimo en sus zonas de circulación (pasillos, vestíbulos, distribuidores).`
            : `Fuera del uso restringido, ${metros(d.limite_m)} como mínimo en las zonas de circulación, bajo vigas, conductos, bandejas y rociadores.`,
        nota:
          d.valor_m < d.limite_m
            ? d.alturaPlanta_m < d.limite_m
              ? `La altura de planta, ${metros(d.alturaPlanta_m)}, no deja la altura libre exigida.`
              : "Sube la altura libre bajo el elemento más bajo, o rebaja el falso techo."
            : d.indicada
              ? undefined
              : "Lo habitual: indica la altura libre real si es otra.",
        filas: [
          { k: "Plantas", v: d.plantas },
          { k: "Altura de planta (suelo a suelo)", v: metros(d.alturaPlanta_m) },
          { k: "Altura libre", v: `${metros(d.valor_m)}${d.indicada ? "" : " (lo habitual)"}` },
          { k: "Mínimo", v: metros(d.limite_m) },
          { k: "Umbrales de las puertas", v: `≥ ${metros(A.alturaLibreUmbralPuertas_m)}` },
        ],
        cita: "DB-SUA · SUA 2 ap. 1.1 pto 1",
      };
    case "salientes":
      return {
        clase: "Impacto con elementos fijos · ap. 1.1",
        titulo: el.nombre,
        valor: `≥ ${metros(A.alturaVuelosFachada_m).replace(" m", "")}`,
        unidad: "m",
        estado,
        manda: `Lo que sobresale de las fachadas sobre zonas de circulación, a ${metros(A.alturaVuelosFachada_m)} como mínimo. En las paredes, nada que no arranque del suelo y vuele más de ${A.salientesParedes.vueloMax_cm} cm entre ${metros(A.salientesParedes.desde_m)} y ${metros(A.salientesParedes.hasta_m)} de altura.`,
        nota: "Los volados de menos de 2 m de altura (el hueco bajo la escalera) se cierran con un elemento fijo detectable con bastón.",
        filas: [
          { k: "Vuelos de fachada", v: `≥ ${metros(A.alturaVuelosFachada_m)}` },
          { k: "Salientes en paredes", v: `≤ ${A.salientesParedes.vueloMax_cm} cm entre ${metros(A.salientesParedes.desde_m)} y ${metros(A.salientesParedes.hasta_m)}` },
          { k: "Volados a proteger", v: `altura < ${metros(A.voladosAProteger_alturaMenorQue_m)}` },
        ],
        cita: "DB-SUA · SUA 2 ap. 1.1 ptos 2 a 4",
      };
    case "puertas":
      return {
        clase: "Impacto con elementos practicables · ap. 1.2",
        titulo: el.nombre,
        valor: d.barrido === "invaden" ? "Invaden" : "No invaden",
        estado,
        manda: `Fuera del uso restringido, las puertas de los recintos que no son de ocupación nula, en el lateral de pasillos de menos de ${metros(PASILLO)}, abren sin que su hoja barra el pasillo. En pasillos más anchos, no invaden la anchura exigida por SI 3 ap. 4.`,
        nota:
          d.barrido === "invaden"
            ? "Haz que abran hacia dentro del recinto o retranquéalas en una hornacina."
            : "Las puertas de trasteros y cuartos de instalaciones (ocupación nula) y las del ascensor no cuentan. Un pasillo de 2,50 m justos se trata como de menos (criterio).",
        filas: [
          { k: "Dónde", v: lista(d.donde) },
          { k: "Puertas de las viviendas", v: "abren hacia el interior" },
          { k: "Vaivén", v: `parte transparente de ${metros(PUERTAS_SUA2_1_2.datos.vaivenTransparente.desde_m)} a ${metros(PUERTAS_SUA2_1_2.datos.vaivenTransparente.hasta_m)}` },
        ],
        cita: "DB-SUA · SUA 2 ap. 1.2 ptos 1 y 2 · figura 1.1",
      };
    case "automaticas":
      return {
        clase: "Elementos practicables y atrapamiento",
        titulo: el.nombre,
        valor: "Marcado CE",
        estado,
        manda: "Las puertas de garaje, portones y puertas peatonales automáticas cumplen su reglamentación específica y tienen marcado CE; sus elementos de apertura y cierre automáticos llevan dispositivos de protección adecuados al accionamiento.",
        nota: "Las normas UNE-EN 13241, UNE-EN 12635 y UNE-EN 16005 las cita el comentario del Ministerio, no el articulado.",
        filas: [{ k: "Puerta", v: d.garajeVivienda ? "la del garaje de la vivienda" : "la del garaje y las automáticas" }],
        cita: "DB-SUA · SUA 2 ap. 1.2 ptos 3 y 4 · ap. 2 pto 2",
      };
    case "vidrios": {
      const c = V.filas[d.fila];
      return {
        clase: "Impacto con elementos frágiles · tabla 1.1",
        titulo: el.nombre,
        valor: FILA_ETIQUETA[d.fila].replace("vidrio ", ""),
        unidad: `Δ ${FILA_CORTA[d.fila]}`,
        estado,
        manda: `Los vidrios de las áreas con riesgo de impacto sin barrera de protección conforme a SUA 1 ap. 3.2 tienen la clasificación X(Y)Z de ${V.norma} de la fila «${c.diferenciaCotas.toLowerCase()}» de la tabla 1.1.`,
        nota:
          d.fila === "menor055"
            ? "La diferencia de cota de una balconera con balcón donde cabe una persona es la del suelo del balcón: esta fila (comentario del Ministerio)."
            : "La diferencia de cota es la del suelo de la planta sobre la rasante (interpretación). Con barandilla conforme a SUA 1 delante del vidrio no se exige.",
        filas: [
          ...d.plantas.map((p) => ({ k: `${p.etiqueta}`, v: `Δ ${metros(p.cota_m)}` })),
          ...(d.interiores ? [{ k: "Vidrios interiores", v: "sin desnivel" }] : []),
          { k: "X · Y · Z", v: `${c.X} · ${c.Y} · ${c.Z}` },
          { k: "Áreas con riesgo", v: `puertas hasta ${metros(V.areasRiesgo.puertas.hasta_m)} (+${metros(V.areasRiesgo.puertas.margenLateralCadaLado_m)} a cada lado); paños fijos hasta ${metros(V.areasRiesgo.panosFijos.hasta_m)}` },
          { k: "Excluidos", v: `vidrios de mayor dimensión ≤ ${metros(V.excluidosMayorDimensionHasta_m)}` },
        ],
        cita: "DB-SUA · SUA 2 ap. 1.3 ptos 1 y 2 · tabla 1.1",
      };
    }
    case "mamparas":
      return {
        clase: "Impacto con elementos frágiles · ap. 1.3",
        titulo: el.nombre,
        valor: "Nivel 3",
        unidad: "sin rotura",
        estado,
        manda: `Las partes vidriadas de las puertas y de los cerramientos de duchas y bañeras son laminadas o templadas y resisten sin rotura un impacto de nivel ${V.puertasDuchasBaneras.nivelImpactoSinRotura} (${V.norma}).`,
        nota: d.viviendas ? "Se aplica también dentro de las viviendas: el DB no las exceptúa." : undefined,
        filas: [{ k: "Vidrio", v: "laminado o templado" }],
        cita: "DB-SUA · SUA 2 ap. 1.3 pto 3",
      };
    case "senalizacion":
      return {
        clase: "Elementos insuficientemente perceptibles · ap. 1.4",
        titulo: el.nombre,
        valor: "2 franjas",
        estado,
        manda: `Las grandes superficies acristaladas que se puedan confundir con puertas o aberturas, y las puertas de vidrio sin cerco ni tirador, llevan en toda su longitud señalización contrastada entre ${metros(SEN.franjaInferior.desde_m)} y ${metros(SEN.franjaInferior.hasta_m)} y entre ${metros(SEN.franjaSuperior.desde_m)} y ${metros(SEN.franjaSuperior.hasta_m)} de altura.`,
        nota: `No hace falta con montantes a ${metros(SEN.exentoMontantesSeparacionMax_m)} como máximo o con un travesaño en la franja inferior. No se aplica al interior de las viviendas.`,
        filas: [
          { k: "Dónde", v: lista(d.donde) },
          { k: "Franja inferior", v: `${metros(SEN.franjaInferior.desde_m)} – ${metros(SEN.franjaInferior.hasta_m)}` },
          { k: "Franja superior", v: `${metros(SEN.franjaSuperior.desde_m)} – ${metros(SEN.franjaSuperior.hasta_m)}` },
        ],
        cita: "DB-SUA · SUA 2 ap. 1.4",
      };
    case "atrapamiento":
      return {
        clase: "Atrapamiento · ap. 2",
        titulo: el.nombre,
        valor: `≥ ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm}`,
        unidad: "cm",
        estado,
        manda: `Una puerta corredera manual, con sus mecanismos, deja al menos ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm hasta el objeto fijo más próximo. Los elementos de apertura y cierre automáticos llevan dispositivos de protección adecuados al accionamiento.`,
        nota: "Se aplica también a las correderas de las viviendas.",
        filas: [{ k: "Distancia a (figura 2.1)", v: `≥ ${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm` }],
        cita: "DB-SUA · SUA 2 ap. 2 · figura 2.1",
      };
    case "local":
      return {
        clase: "Local sin uso",
        titulo: el.nombre,
        valor: "Previsto",
        estado,
        manda: "El local sin uso justificará SUA 2 con el proyecto de su actividad.",
        filas: [{ k: "Plantas", v: d.zona.plantas }],
        cita: "DB-SUA · SUA 2",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSua2(a: Aviso): TextoSi {
  switch (a.id) {
    case "garaje-altura":
      return {
        titulo: "Comprueba la altura libre del garaje.",
        detalle: "Se ha tomado 2,20 m, justo el mínimo. Es lo que más suele fallar: mídela bajo vigas, conductos de ventilación y rociadores, e indícala.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua2(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "altura") {
    return {
      titulo: `Falta altura libre ${enGrupo(d.grupo, d.unifamiliar)}.`,
      detalle: `Tiene ${metros(d.valor_m)} y el mínimo es ${metros(d.limite_m)}.`,
    };
  }
  if (d.clase === "puertas") {
    return {
      titulo: "Las puertas barren el pasillo común.",
      detalle: `En pasillos de menos de ${metros(PASILLO)} el barrido de la hoja no puede invadir el pasillo.`,
    };
  }
  return null;
}

export function describirDibujoSua2(j: JustificacionSua2): string {
  const a = alturas(j)
    .map((d) => `${metros(d.valor_m)} ${enGrupo(d.grupo, d.unifamiliar)}`)
    .join(", ");
  return `Sección del edificio con la altura libre de paso de cada zona (${a}) y, en la fachada, la diferencia de cota de cada planta con la clasificación de sus vidrios.`;
}

/** Las piezas de la fila de La obra. */
export function piezasSua2(j: JustificacionSua2): { texto: string; acento: boolean }[] {
  const fallo = j.elementos.some((x) => x.veredicto === "fail");
  const min = Math.min(...alturas(j).map((d) => d.valor_m));
  return [
    { texto: Number.isFinite(min) ? `h libre ≥ ${metros(min)}` : "sin zonas", acento: fallo },
    { texto: FILA_ETIQUETA[peorFila(j)], acento: false },
  ];
}
