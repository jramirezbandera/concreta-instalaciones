// =============================================================================
// DB-SI, SI 1 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { cuantos, listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TipoCuarto } from "../../lib/edificio/tipos";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { LocalRiesgo } from "../si/riesgo";
import type { SectorSi } from "../si/sectores";
import { CONDICIONES_RIESGO_TABLA_2_2, REACCION_TABLA_4_1, SECTORES_TABLA_1_1, VESTIBULO_INDEPENDENCIA } from "../si/tablas";
import { construida, m2, NOMBRE_USO_SECTOR, textoColumna } from "../si/textos";
import type { ElementoSi } from "../si/tipos";
import type { DetalleSi1, ElementoSi1, JustificacionSi1 } from "./justificacion";

const T11 = SECTORES_TABLA_1_1.datos;
const R41 = REACCION_TABLA_4_1.datos;

function det(el: ElementoSi<unknown>): DetalleSi1 {
  return (el as ElementoSi1).detalle;
}

export const NOMBRE_CUARTO: Record<TipoCuarto, string> = {
  contadores_electricidad: "Contadores de electricidad",
  telecomunicaciones: "Telecomunicaciones (RITI/RITS)",
  sala_maquinas: "Sala de máquinas (RITE)",
  calderas: "Sala de calderas",
  ascensor: "Maquinaria del ascensor",
  grupo_electrogeno: "Grupo electrógeno",
  residuos: "Cuarto de basuras",
  agua: "Agua (grupo de presión, aljibe, contadores)",
  otro: "Otro, sin riesgo especial",
};

/** Por qué un local es de riesgo especial, en una línea: «contadores de electricidad, en todo caso». */
export function porQueLocal(l: LocalRiesgo): string {
  switch (l.tipo) {
    case "sin_tipo":
      return "cuarto sin tipo: riesgo bajo provisional";
    case "trasteros":
      return `trasteros de ${m2(l.s_m2 ?? 0)} construidos (tabla 2.1: bajo de 50 a 100 m², medio hasta 500, alto por encima)`;
    case "residuos":
      return `almacén de residuos de ${m2(l.s_m2 ?? 0)} construidos (bajo de 5 a 15 m², medio hasta 30, alto por encima)`;
    case "calderas":
      return l.p_kW !== undefined ? `sala de calderas de ${fmt(l.p_kW, "kW", 0)} (bajo de 70 a 200 kW, medio hasta 600, alto por encima)` : "sala de calderas sin potencia: riesgo bajo provisional";
    case "garaje":
      return `garaje de ${m2(l.s_m2 ?? 0)} construidos, no más de 100 m²: riesgo bajo en todo caso`;
    case "garaje_unifamiliar":
      return "garaje de una vivienda unifamiliar: riesgo bajo en todo caso, sea cual sea su superficie";
    case "telecomunicaciones":
      return "RITI/RITS: riesgo bajo según un comentario del Ministerio (no tiene fila en la tabla)";
    default:
      return `${NOMBRE_CUARTO[l.tipo].toLowerCase()}: riesgo bajo en todo caso`;
  }
}

function textoSector(s: SectorSi): string {
  if (s.uso === "aparcamiento") return "uso Aparcamiento";
  return `uso ${NOMBRE_USO_SECTOR[s.uso]}${s.usoSupuesto ? " (supuesto)" : ""}`;
}

// -----------------------------------------------------------------------------
// La cabecera
// -----------------------------------------------------------------------------

export function fraseSi1(j: JustificacionSi1): string {
  const c = j.comp;
  const p = j.elementos[0].detalle as Extract<DetalleSi1, { clase: "principal" }>;
  const partes: string[] = [];
  const sp = c.principal;
  if (p.unifamiliar) {
    partes.push("La vivienda es un único sector");
  } else if (sp.porPlantas) {
    partes.push(`${p.sector.uso === "administrativo" ? "Las oficinas" : "Las viviendas"} se sectorizan por plantas (${m2(sp.superficie.construida_m2)} en total)`);
  } else {
    partes.push(`${p.sector.uso === "administrativo" ? "Las oficinas forman" : "Las viviendas forman"} un sector de ${m2(sp.superficie.construida_m2)}`);
  }
  const otros = j.elementos.flatMap((el) => (el.detalle.clase === "sector" ? [el] : []));
  if (otros.length > 0) {
    partes.push(
      `${listaY(otros.map((el) => `el ${el.nombre.toLowerCase()} (EI ${(el.detalle as Extract<DetalleSi1, { clase: "sector" }>).limite.ei})`))} ${otros.length > 1 ? "son sectores propios" : "es sector propio"}`,
    );
  }
  const locales = c.riesgo.locales;
  if (locales.length > 0) {
    const n = locales.length;
    const clases = [...new Set(locales.map((l) => l.clase))];
    partes.push(`${cuantos(n, "local", "locales")} de riesgo especial ${clases.length === 1 ? clases[0] : listaY(clases)}`);
  }
  const fallo = j.veredicto === "fail" ? " Hay un sector que excede de 2.500 m²." : "";
  return `${partes.join("; ")}.${fallo}`;
}

export function metricasSi1(j: JustificacionSi1): string {
  const c = j.comp;
  return `${cuantos(c.sectores.length, "sector", "sectores")} · ${cuantos(c.riesgo.locales.length, "local", "locales")} de riesgo especial`;
}

// -----------------------------------------------------------------------------
// Qué entra
// -----------------------------------------------------------------------------

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraSi1(j: JustificacionSi1, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const estado = trato(estados[el.id]);
    switch (d.clase) {
      case "principal":
        filas.push({
          id: el.id,
          titulo: el.nombre,
          detalle: d.sector.porPlantas ? "sector por plantas" : `${m2(d.sector.superficie.construida_m2)} construidos`,
          trato: d.sector.porPlantas ? `planta mayor ${m2(d.sector.plantaMayor?.construida_m2 ?? 0)}` : "≤ 2.500 m²",
          estado,
          elementoId: el.id,
        });
        break;
      case "sector":
        filas.push({
          id: el.id,
          titulo: el.nombre,
          detalle: `sector propio · ${textoSector(d.sector)}`,
          trato: `EI ${d.limite.ei}${d.limite.vestibulo ? " · vestíbulo" : ""}`,
          estado,
          elementoId: el.id,
        });
        break;
      case "exenta":
        filas.push({ id: el.id, titulo: el.nombre, detalle: "Administrativo de 500 m² o menos", trato: "no es sector", estado, elementoId: el.id });
        break;
      case "local":
        filas.push({
          id: el.id,
          titulo: el.nombre,
          detalle: `${d.local.zona.plantas} · local de riesgo especial`,
          trato: `riesgo ${d.local.clase} · EI ${d.condiciones.EI}`,
          estado,
          elementoId: el.id,
        });
        break;
      case "no_local":
        filas.push({ id: el.id, titulo: el.nombre, detalle: d.zona.plantas, trato: "no es local de riesgo", estado, elementoId: el.id });
        break;
      default:
        break;
    }
  }
  return filas;
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function textoEtiquetaSi1(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "principal":
      return d.sector.porPlantas ? `por plantas · ${m2(d.sector.plantaMayor?.construida_m2 ?? 0)}` : `sector · ${m2(d.sector.superficie.construida_m2)}`;
    case "sector":
      return `EI ${d.limite.ei}${d.limite.vestibulo ? " · vestíbulo" : ""}`;
    case "exenta":
      return "no es sector";
    case "entre_viviendas":
      return `entre viviendas EI ${d.ei}`;
    case "local":
      return `riesgo ${d.local.clase} · EI ${d.condiciones.EI}`;
    case "no_local":
      return "sin riesgo especial";
    case "reaccion":
      return "C-s2,d0 · EFL";
  }
}

export function resultadoListaSi1(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "principal": {
      const s = d.sector;
      if (s.porPlantas && s.plantaMayor) return `por plantas · la mayor (${s.plantaMayor.etiqueta}) ${construida(s.plantaMayor.construida_m2, s.plantaMayor.supuesta)} ≤ 2.500 m²`;
      return `${construida(s.superficie.construida_m2, s.superficie.supuesta)} ${el.veredicto === "fail" ? ">" : "≤"} 2.500 m²`;
    }
    case "sector": {
      const l = d.limite;
      return `${textoSector(d.sector)} · paredes EI ${l.ei}${l.techo ? ` · techo REI ${l.ei}` : ""} · ${l.vestibulo ? `vestíbulo con 2 puertas EI2 ${l.puerta_EI2}-C5` : `puertas EI2 ${l.puerta_EI2}-C5`}`;
    }
    case "exenta":
      return `${construida(d.exenta.zona.construida.valor * d.exenta.zona.repeticiones, d.exenta.zona.construida.supuesto)} ≤ 500 m²: no precisa ser sector`;
    case "entre_viviendas":
      return `paredes y forjados entre viviendas EI ${d.ei}`;
    case "local": {
      const k = d.condiciones;
      return `riesgo ${d.local.clase} · R ${k.R} · EI ${k.EI} · ${k.vestibulo ? `vestíbulo, 2 puertas EI2 ${k.puerta_EI2}-C5` : `puerta EI2 ${k.puerta_EI2}-C5`}`;
    }
    case "no_local":
      return d.motivo === "trasteros" ? `${construida(d.zona.construida.valor, d.zona.construida.supuesto)} ≤ 50 m²: no es local de riesgo especial` : "no es local de riesgo especial";
    case "reaccion":
      return `zonas ocupables C-s2,d0 / EFL${d.garaje || d.locales > 0 ? " · garaje y locales de riesgo B-s1,d0 / BFL-s1" : ""}`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSi1(el: ElementoSi<unknown>, j: JustificacionSi1, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  const h = j.comp.h_m;
  switch (d.clase) {
    case "principal": {
      const s = d.sector;
      const medida = s.porPlantas && s.plantaMayor ? s.plantaMayor : s.superficie;
      const zonas = [...new Set(s.zonas.map((z) => z.zona.uso))].length;
      return {
        clase: "Sector de incendio · tabla 1.1",
        titulo: el.nombre,
        valor: fmt(medida.construida_m2, undefined, 0),
        unidad: s.porPlantas ? `m² construidos en ${s.plantaMayor?.etiqueta}` : "m² construidos",
        estado,
        manda: d.unifamiliar
          ? "Una vivienda unifamiliar nunca tiene sectores en su interior: es uno solo, como uso Residencial Vivienda. Sus locales de riesgo especial (el garaje) se compartimentan con la tabla 2.2."
          : s.porPlantas
            ? `Pasa de ${m2(T11.sectorMax_m2)}: cada planta es un sector, con forjados y escalera que mantienen la compartimentación (escalera protegida o compartimentada, SI 3).`
            : `La superficie construida de todo sector de uso ${NOMBRE_USO_SECTOR[s.uso]} no debe exceder de ${m2(T11.sectorMax_m2)}. Los locales de riesgo especial que contiene no cuentan.`,
        nota: medida.supuesta ? "Superficie construida supuesta: la útil × 1,20 (criterio), mientras no se indique." : undefined,
        filas: [
          { k: "Superficie útil", v: m2(s.superficie.util_m2) },
          { k: "Superficie construida", v: construida(s.superficie.construida_m2, s.superficie.supuesta) },
          ...(s.porPlantas && s.plantaMayor ? [{ k: `Planta mayor (${s.plantaMayor.etiqueta})`, v: construida(s.plantaMayor.construida_m2, s.plantaMayor.supuesta) }] : []),
          { k: "Máximo por sector", v: m2(T11.sectorMax_m2) },
          { k: "Zonas", v: `${zonas} usos de El edificio · ${s.niveles.length} plantas` },
        ],
        uso: medida.construida_m2 / T11.sectorMax_m2,
        cita: "DB-SI · SI 1 ap. 1 · tabla 1.1",
      };
    }
    case "sector": {
      const s = d.sector;
      const l = d.limite;
      const V = VESTIBULO_INDEPENDENCIA.datos;
      return {
        clase: `Sector de incendio · ${textoSector(s)}`,
        titulo: el.nombre,
        valor: `EI ${l.ei}`,
        unidad: "paredes y techos",
        estado,
        manda:
          s.uso === "aparcamiento"
            ? `Con más de 100 m² construidos el garaje es uso Aparcamiento: sector propio en un edificio con otros usos, y toda comunicación con ellos, por vestíbulo de independencia. La tabla 1.2 le pide EI ${l.ei} en cualquier altura.`
            : s.usoSupuesto
              ? `Un local sin actividad es una obra inacabada. Se le aplica el uso Comercial, el más exigente: es sector propio con cualquier superficie, y la tabla 1.2 pide la mayor resistencia de los dos usos (${textoColumna(s.bajoRasante, h)}).`
              : `Es sector propio y lo separa la mayor resistencia de la tabla 1.2 de los dos usos (${textoColumna(s.bajoRasante, h)}).`,
        filas: [
          { k: "Superficie construida", v: construida(s.superficie.construida_m2, s.superficie.supuesta) },
          { k: "Paredes", v: `EI ${l.ei}` },
          ...(l.techo ? [{ k: "Techo (forjado con lo de encima)", v: `REI ${l.ei}` }] : []),
          l.vestibulo
            ? { k: "Comunicación", v: `vestíbulo de independencia: paredes EI ${V.paredes_EI} y dos puertas EI2 ${l.puerta_EI2}-C5` }
            : { k: "Puerta de paso, si la hay", v: `EI2 ${l.puerta_EI2}-C5` },
          ...(s.uso === "aparcamiento" ? [{ k: "Ascensor que llega al garaje", v: "con vestíbulo de independencia" }] : []),
        ],
        cita: "DB-SI · SI 1 · tablas 1.1 y 1.2 · Anejo SI A",
      };
    }
    case "exenta": {
      const z = d.exenta.zona;
      return {
        clase: "Sector de incendio · tabla 1.1",
        titulo: el.nombre,
        valor: "No es sector",
        estado,
        manda:
          d.exenta.motivo === "establecimiento"
            ? "En un edificio de viviendas, un establecimiento Administrativo de 500 m² construidos o menos no precisa constituir un sector propio."
            : "Unas oficinas dentro de un edificio de viviendas son sector propio solo si exceden de 500 m² construidos.",
        filas: [
          { k: "Superficie construida", v: construida(z.construida.valor * z.repeticiones, z.construida.supuesto) },
          { k: "Umbral", v: "500 m²" },
        ],
        cita: "DB-SI · SI 1 · tabla 1.1",
      };
    }
    case "entre_viviendas":
      return {
        clase: "Compartimentación · tabla 1.1",
        titulo: el.nombre,
        valor: `EI ${d.ei}`,
        estado,
        manda: "Los elementos que separan viviendas entre sí, paredes y forjados, deben ser al menos EI 60. No es exigencia de la puerta de entrada a la vivienda ni de la pared con la zona común.",
        filas: [
          { k: "Viviendas", v: String(d.viviendas) },
          { k: "Separación", v: `EI ${d.ei}` },
        ],
        cita: "DB-SI · SI 1 · tabla 1.1 (Residencial Vivienda)",
      };
    case "local": {
      const l = d.local;
      const k = d.condiciones;
      const t22 = CONDICIONES_RIESGO_TABLA_2_2.datos[l.clase];
      return {
        clase: `Local de riesgo especial ${l.clase} · tabla 2.1`,
        titulo: `${el.nombre} · ${l.zona.plantas}`,
        valor: `EI ${k.EI}`,
        unidad: `riesgo ${l.clase}`,
        estado,
        manda: `${porQueLocal(l).charAt(0).toUpperCase()}${porQueLocal(l).slice(1)}.${k.subePorNota2 ? ` La tabla 2.2 pide EI ${t22.EI} y R ${t22.R}, pero nunca menos que los sectores del uso al que sirve (nota 2): ${textoColumna(l.zona.bajoRasante, h)}, ${k.EI}.` : ""}`,
        filas: [
          { k: "Estructura", v: `R ${k.R}` },
          { k: "Paredes y techo", v: `EI ${k.EI}` },
          { k: "Vestíbulo de independencia", v: k.vestibulo ? "sí" : "no" },
          { k: "Puertas", v: k.puertas === 2 ? `2 × EI2 ${k.puerta_EI2}-C5` : `EI2 ${k.puerta_EI2}-C5` },
          { k: "Recorrido hasta su salida", v: `≤ ${fmt(k.recorrido_m, "m", 0)}` },
          { k: "Revestimientos", v: `${R41.aparcamientosRiesgo.techosParedes} · ${R41.aparcamientosRiesgo.suelos}` },
        ],
        cita: "DB-SI · SI 1 ap. 2 · tablas 2.1 y 2.2",
      };
    }
    case "no_local":
      return {
        clase: "Local de riesgo especial · tabla 2.1",
        titulo: `${el.nombre} · ${d.zona.plantas}`,
        valor: "No",
        unidad: "es local de riesgo especial",
        estado,
        manda:
          d.motivo === "trasteros"
            ? "Los trasteros de las viviendas son local de riesgo especial a partir de 50 m² construidos (suma de los trasteros, sin pasillos)."
            : d.zona.zona.cuarto === "agua"
              ? "Los cuartos de agua (grupo de presión, aljibe, contadores) no son local de riesgo especial (comentario del Ministerio)."
              : d.zona.zona.cuarto === "calderas"
                ? "Una sala de calderas solo es local de riesgo especial si su potencia útil nominal excede de 70 kW."
                : d.zona.zona.cuarto === "residuos"
                  ? "Un almacén de residuos solo es local de riesgo especial si excede de 5 m² construidos."
                  : "Este cuarto no tiene fila en la tabla 2.1.",
        filas: [{ k: "Superficie construida", v: construida(d.zona.construida.valor, d.zona.construida.supuesto) }],
        cita: "DB-SI · SI 1 · tabla 2.1",
      };
    case "reaccion":
      return {
        clase: "Reacción al fuego · tabla 4.1",
        titulo: el.nombre,
        valor: R41.zonasOcupables.techosParedes,
        unidad: `paredes y techos · suelos ${R41.zonasOcupables.suelos}`,
        estado,
        manda: `Revestimientos que superen el ${R41.umbral_pct} % de paredes, techos o suelos de cada recinto. ${d.unifamiliar ? "El interior de la vivienda queda fuera." : "El interior de las viviendas queda fuera."}`,
        filas: [
          { k: "Zonas ocupables (portal, pasillos, escalera no protegida, oficinas, local)", v: `${R41.zonasOcupables.techosParedes} · ${R41.zonasOcupables.suelos}` },
          { k: "Escaleras y pasillos protegidos", v: `${R41.protegidos.techosParedes} · ${R41.protegidos.suelos}` },
          ...(d.garaje || d.locales > 0 ? [{ k: "Garaje y locales de riesgo especial", v: `${R41.aparcamientosRiesgo.techosParedes} · ${R41.aparcamientosRiesgo.suelos}` }] : []),
          { k: "Espacios ocultos no estancos", v: `${R41.espaciosOcultos.techosParedes} · ${R41.espaciosOcultos.suelos}` },
        ],
        cita: "DB-SI · SI 1 ap. 4 · tabla 4.1",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSi1(a: Aviso): TextoSi {
  const [tipo] = a.id.split("-");
  switch (tipo) {
    case "cuarto":
      return {
        titulo: "Un cuarto de instalaciones no dice qué es.",
        detalle: "Se ha tratado como local de riesgo especial bajo, lo más frecuente (contadores, ascensor, sala de máquinas). Indícalo en las decisiones: los cuartos de agua no son local de riesgo.",
      };
    case "potencia":
      return { titulo: "Falta la potencia de la sala de calderas.", detalle: "Se ha tratado como riesgo bajo. Con 70 kW o menos no es local de riesgo especial; por encima de 200 kW, riesgo medio." };
    case "construida":
      return {
        titulo: "La superficie construida decide aquí.",
        detalle: "Se ha supuesto la útil × 1,20 (criterio), del lado de la seguridad, y con la útil saldría otra cosa. Indica la superficie construida en las decisiones.",
      };
    case "uso":
      return {
        titulo: "El local sin uso se ha tratado como Comercial.",
        detalle: "Es lo más exigente: sector propio y la mayor resistencia de la tabla 1.2. Si va a ser una oficina, indícalo en las decisiones.",
      };
    case "por":
      return {
        titulo: "Las viviendas se sectorizan por plantas.",
        detalle: "Pasan de 2.500 m² construidos: cada planta es un sector, los forjados mantienen la compartimentación y la escalera tiene que ser protegida o compartimentada (SI 3).",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSi1(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "principal") {
    const s = d.sector;
    return {
      titulo: `${el.nombre}: el sector excede de 2.500 m².`,
      detalle: s.porPlantas
        ? `Incluso por plantas, ${s.plantaMayor?.etiqueta} tiene ${m2(s.plantaMayor?.construida_m2 ?? 0)} construidos: hay que dividir la planta o proteger el sector con extinción automática (duplica el límite).`
        : `Tiene ${m2(s.superficie.construida_m2)} construidos. Hay que dividirlo en sectores o protegerlo con extinción automática, que duplica el límite.`,
    };
  }
  if (d.clase === "sector") {
    return { titulo: `${el.nombre}: el sector excede de 2.500 m².`, detalle: `Tiene ${m2(d.sector.superficie.construida_m2)} construidos.` };
  }
  return null;
}

export function describirDibujoSi1(j: JustificacionSi1): string {
  const c = j.comp;
  const sectores = c.sectores.map((s) => (s.principal ? "el principal" : s.id === "garaje" ? "el garaje" : "el local")).join(", ");
  return `Sección del edificio con los sectores de incendio (${sectores}), lo que los separa y ${cuantos(c.riesgo.locales.length, "local", "locales")} de riesgo especial rayados.`;
}

/** Las piezas de la fila de La obra: los sectores y los locales de riesgo. */
export function piezasSi1(j: JustificacionSi1): { texto: string; acento: boolean }[] {
  const c = j.comp;
  const p = j.elementos[0].detalle as Extract<DetalleSi1, { clase: "principal" }>;
  const out: { texto: string; acento: boolean }[] = [];
  out.push({ texto: p.unifamiliar ? "la vivienda" : c.principal.uso === "administrativo" ? "oficinas" : `${p.viviendas} viviendas`, acento: false });
  for (const s of c.sectores.filter((x) => !x.principal)) {
    out.push({ texto: `${s.id === "garaje" ? "garaje" : s.id === "oficinas" ? "oficinas" : s.id === "viviendas" ? "viviendas" : "local"} · sector propio`, acento: true });
  }
  const n = c.riesgo.locales.length;
  if (n > 0) out.push({ texto: n === 1 ? "1 local de riesgo" : `${n} locales de riesgo`, acento: true });
  return out;
}
