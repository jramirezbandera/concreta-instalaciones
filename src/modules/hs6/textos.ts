// =============================================================================
// DB-HS6 — Textos de la justificación (feature-15, HS6): la frase de la
// cabecera, «lo que manda» y las cuentas de la franja, las etiquetas del dibujo y
// la lista, y el texto del aviso del núcleo. Funciones PURAS.
// =============================================================================

import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY, mayuscula } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { ElementoHs6, JustificacionHs6 } from "./justificacion";
import { nombresUsos, rangoNiveles, type SobreTerreno } from "./proteccion";
import { PARAMETROS_SOLUCIONES } from "./tablas";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

const DIFUSION = "10⁻¹¹ m²/s";

/** «la vivienda», «el portal y el local». */
function conArticulo(usos: string): string {
  return usos
    .split(/, | y /)
    .map((u) => `${u === "vivienda" || u === "viviendas" || u === "oficinas" ? (u.endsWith("s") ? "las" : "la") : "el"} ${u}`)
    .reduce((acc, x, i, arr) => (i === 0 ? x : i === arr.length - 1 ? `${acc} y ${x}` : `${acc}, ${x}`), "");
}

/** «bajo la vivienda, que apoya en el terreno», «bajo la parte del local sin sótano». */
function dondeTerreno(ts: SobreTerreno[]): string {
  return listaY(
    ts.map((t) =>
      t.nivel < 0
        ? `en el sótano habitable (${nombresUsos(t.usos)})`
        : t.parcial
          ? `bajo la parte de la planta baja sin sótano (${n0(t.superficie_m2)} m²)`
          : `bajo ${conArticulo(nombresUsos(t.usos))}, que apoya en el terreno`,
    ),
  );
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function valorCorto(el: ElementoHs6): string {
  if ("texto" in el.valor) return el.valor.texto;
  return el.detalle.clase === "barrera" ? `≥ ${n0(el.valor.valor)}` : n0(el.valor.valor);
}

export function textoEtiqueta(el: ElementoHs6): string {
  switch (el.detalle.clase) {
    case "zona":
      return `zona ${valorCorto(el)}`;
    case "barrera":
      return "Barrera";
    case "contencion_garaje":
      return "Contención";
    case "camara":
      return "Cámara ventilada";
    case "despresurizacion":
      return "Despresurización";
    case "nucleo":
      return "Núcleo";
    case "no_tocan":
      return "Sin contacto";
  }
}

export function resultadoLista(el: ElementoHs6): string {
  const det = el.detalle;
  switch (det.clase) {
    case "zona":
      return det.zona === "sin_exigencia" ? "no se aplica" : `${det.zona}${det.municipio ? ` · ${det.municipio}` : ""}`;
    case "barrera":
      return det.via === "calculo" ? "por cálculo, aparte" : `≥ ${n0(det.espesorMin_mm)} mm · < ${DIFUSION}`;
    case "contencion_garaje":
      return det.criterio ? "ventilado · criterio" : "ventilado (HS 3)";
    case "camara":
      return `${n0(det.aberturas_cm2)} cm² de aberturas`;
    case "despresurizacion":
      return "captación + extracción";
    case "nucleo":
      return "continuidad";
    case "no_tocan":
      return `${rangoNiveles(det.niveles)} · sin contacto`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaDe(el: ElementoHs6, j: JustificacionHs6, estado: EstadoPresentacion): DetalleElemento {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  const pr = j.proteccion;
  const pb = PARAMETROS_SOLUCIONES.datos.barrera;

  switch (det.clase) {
    case "zona":
      return {
        ...base,
        clase: "Punto de partida",
        unidad: det.municipio || undefined,
        manda:
          det.zona === "II"
            ? "El municipio. En zona II se exige barrera de protección y, además, espacio de contención ventilado o despresurización del terreno."
            : det.zona === "I"
              ? "El municipio. En zona I se exige barrera de protección o, alternativamente, una cámara de aire ventilada."
              : "El municipio no está en el Apéndice B: la Sección HS 6 no se aplica.",
        nota: "La zona es un dato de la obra: el proyectista la consulta en el Apéndice B del DB-HS.",
        filas: [
          { k: "Nivel de referencia", v: `${n0(det.nivelReferencia_Bq_m3)} Bq/m³ · media anual` },
          { k: "Medidas", v: det.zona === "II" ? "barrera + 1" : det.zona === "I" ? "1" : "ninguna" },
        ],
      };

    case "barrera": {
      const titulos: Record<(typeof det.donde)[number], string> = {
        solera_sotano: "bajo la solera y en los muros del sótano",
        forjado_pb: "en el forjado de la planta baja",
        terreno: "bajo lo que apoya en el terreno",
        sotano_habitable: "en la solera y los muros del sótano habitable",
      };
      const titulo = `Lámina ${listaY(det.donde.map((d) => titulos[d]))}`;
      if (det.via === "calculo") {
        return {
          ...base,
          clase: "Barrera de protección",
          titulo,
          manda: "Por cálculo: la exhalación de radón a través de la barrera, menor que la límite (E < Elim, ap. 3.1.2). Se justifica aparte.",
          filas: [{ k: "Vía", v: "cálculo de difusión" }],
        };
      }
      return {
        ...base,
        clase: "Barrera de protección",
        titulo,
        unidad: "mm",
        manda: `La lámina tipo: con al menos ${n0(det.espesorMin_mm)} mm y un coeficiente de difusión del radón menor que ${DIFUSION} vale sin cálculo.`,
        nota: pr.sobreNoHabitable
          ? "El DB no fija la posición: solo que quede entre el terreno y lo habitable."
          : "Se prolonga 20 cm por encima del terreno exterior.",
        filas: [
          { k: "Espesor", v: `≥ ${n0(det.espesorMin_mm)} mm` },
          { k: "Difusión del radón", v: `< ${DIFUSION}` },
          { k: "Juntas, encuentros y pasos", v: "sellados" },
          { k: "Puertas que la interrumpan", v: "estancas · cierre automático" },
          { k: "Sobre el terreno exterior", v: `+${pb.prolongacionSobreTerrenoExterior_cm} cm` },
        ],
      };
    }

    case "contencion_garaje": {
      const p = det.parte;
      return {
        ...base,
        clase: "Espacio de contención",
        titulo: p.conGaraje ? "El garaje ventilado" : "El sótano ventilado",
        unidad: "no habitable",
        manda: det.criterio
          ? "En zona I el DB habla de una cámara de aire: el garaje ventilado entra como protección análoga (criterio de proyecto)."
          : "Un local no habitable puede ser el espacio de contención, y basta con la ventilación que ya le pide HS 3.",
        filas: [
          { k: "Ventilación", v: p.conGaraje ? "la del garaje (HS 3)" : "la de HS 3 (Tabla 2.2)" },
          { k: "Protege", v: nombresUsos(p.usosProtegidos) },
          { k: "Superficie protegida", v: `${n0(p.superficie_m2)} m²` },
        ],
      };
    }

    case "camara": {
      const s = det.partes.reduce((a, t) => a + t.superficie_m2, 0);
      const per = det.partes.reduce((a, t) => a + t.perimetro_m, 0);
      return {
        ...base,
        clase: "Espacio de contención",
        titulo: "Forjado sanitario con cámara ventilada",
        unidad: "cm² de aberturas",
        manda: `La superficie: 10 cm² de aberturas por metro de perímetro; ${n0(per)} m para ${n0(s)} m².`,
        nota: "El perímetro es el de una planta cuadrada de la misma superficie (criterio); la barrera va encima del forjado.",
        filas: [
          { k: "Superficie", v: `${n0(s)} m²` },
          { k: "Perímetro", v: `${n0(per)} m` },
          { k: "Aberturas", v: "en todas las fachadas" },
          { k: "Ningún punto a más de", v: `${n0(det.distanciaMax_m)} m de una` },
        ],
      };
    }

    case "despresurizacion":
      return {
        ...base,
        clase: "Sistema adicional",
        titulo: "Despresurización del terreno",
        manda: "Una red de captación en el relleno bajo el edificio, conectada a un conducto con extracción mecánica.",
        filas: [
          { k: "Captación", v: "arquetas o tubos perforados" },
          { k: "En", v: "relleno granular bajo la solera" },
          { k: "Extracción", v: "mecánica · bocas según HS 3" },
          { k: "Geotextil", v: "si la solera se vierte encima" },
        ],
      };

    case "nucleo":
      return {
        ...base,
        clase: estado === "rv" ? "Por revisar" : "Revisado",
        unidad: "S1 ↔ PB",
        manda:
          "La continuidad. El DB pide un cerramiento sin discontinuidades entre el garaje y los locales habitables, pero no dice cómo tratar los núcleos que los comunican.",
        filas: [
          { k: "Propuesta", v: "vestíbulo con puertas de cierre" },
          { k: "Puertas", v: "estancas · cierre automático" },
          { k: "Pasos de instalaciones", v: "sellados" },
        ],
      };

    case "no_tocan":
      return {
        ...base,
        clase: "Fuera de alcance",
        titulo: mayuscula(nombresUsos(det.usos)),
        valor: rangoNiveles(det.niveles),
        manda: "Están en plantas altas, sin contacto con el terreno: no necesitan medidas propias.",
        filas: [{ k: "Contacto con el terreno", v: "ninguno" }],
      };
  }
}

// -----------------------------------------------------------------------------
// La frase, las métricas y el aviso
// -----------------------------------------------------------------------------

export function fraseHs6(j: JustificacionHs6): string {
  const pr = j.proteccion;
  const quien = j.municipio || "La obra";
  if (pr.zona === "sin_exigencia") return `${j.municipio || "El municipio"} no está en el Apéndice B: la Sección HS 6 no se aplica.`;
  if (!pr.aplica) return `${quien} está en zona ${pr.zona}, pero nada habitable toca el terreno ni un sótano: la HS 6 no pide medidas.`;
  const d = pr.decisiones;
  const partes: string[] = [];
  const conGaraje = j.elementos.some((e) => e.id === "contencion-garaje");
  const camara = j.elementos.some((e) => e.id === "camara");
  const despr = j.elementos.some((e) => e.id === "despresurizacion");
  if (pr.zona === "II") {
    partes.push(
      `${quien} está en zona II: barrera de protección y, además, ${despr && !conGaraje && !camara ? "despresurización del terreno" : "un espacio de contención ventilado"}.`,
    );
  } else {
    partes.push(
      `${quien} está en zona I: ${d.medidaTerreno === "barrera" ? "basta la barrera de protección" : "basta una cámara de aire ventilada"}.`,
    );
  }
  if (conGaraje && pr.sobreNoHabitable) {
    partes.push(
      `Bajo ${conArticulo(nombresUsos(pr.sobreNoHabitable.usosProtegidos))}, ese espacio es el propio ${pr.sobreNoHabitable.conGaraje ? "garaje" : "sótano"}.`,
    );
  }
  if (camara) partes.push(`${mayuscula(dondeTerreno(pr.sobreTerreno))}, un forjado sanitario con cámara ventilada.`);
  if (despr) partes.push(`${mayuscula(dondeTerreno(pr.sobreTerreno))}, una red de captación con extracción mecánica.`);
  return partes.join(" ");
}

export function metricasHs6(j: JustificacionHs6): string {
  const pr = j.proteccion;
  if (pr.zona === "sin_exigencia") return "sin exigencia";
  const corto: Record<string, string> = {
    barrera: "barrera",
    "contencion-garaje": pr.sobreNoHabitable?.conGaraje ? "garaje ventilado" : "sótano ventilado",
    camara: "cámara ventilada",
    despresurizacion: "despresurización",
  };
  const medidas = j.elementos.flatMap((e) => (corto[e.id] ? [corto[e.id]] : []));
  return [`zona ${pr.zona}`, ...medidas].join(" · ");
}

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

export function textoAviso(a: Aviso): TextoAviso {
  if (a.id === "nucleo-garaje") {
    return {
      titulo: "La escalera y el ascensor bajan al garaje.",
      detalle:
        "El DB pide un cerramiento sin discontinuidades entre el garaje y los locales habitables, pero no dice cómo resolver los núcleos. Se propone vestíbulo con puertas estancas de cierre automático y pasos de instalaciones sellados.",
    };
  }
  return { titulo: "Revisa la protección.", detalle: String(a.datos.texto ?? "") };
}

export function describirSeccionHs6(j: JustificacionHs6): string {
  return [
    "Sección por lo que toca el terreno: el radón sube del terreno y la barrera y el espacio de contención lo detienen.",
    fraseHs6(j),
    ...j.elementos.map((e) => `${e.nombre}: ${resultadoLista(e)}.`),
  ].join(" ");
}
