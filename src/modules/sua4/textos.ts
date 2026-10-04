// =============================================================================
// DB-SUA, SUA 4 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos.
// Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { nombreLocal } from "../si1/justificacion";
import { lista, metros } from "../sua/colocar";
import type { DetalleSua4, ElementoSua4, JustificacionSua4 } from "./justificacion";
import {
  ALUMBRADO_NORMAL_SUA4_1,
  DOTACION_EMERGENCIA_SUA4_2_1,
  INSTALACION_EMERGENCIA_SUA4_2_3,
  LUMINARIAS_EMERGENCIA_SUA4_2_2,
  SENALES_SUA4_2_4,
} from "./tablas";

const N = ALUMBRADO_NORMAL_SUA4_1.datos;
const D = DOTACION_EMERGENCIA_SUA4_2_1.datos;
const I = INSTALACION_EMERGENCIA_SUA4_2_3.datos;
const LU = LUMINARIAS_EMERGENCIA_SUA4_2_2.datos;
const SE = SENALES_SUA4_2_4.datos;

/** «0,5» */
function num(v: number): string {
  return v.toLocaleString("es-ES");
}
const pc = (f: number) => `${Math.round(f * 100)} %`;

function det(el: ElementoSi<unknown>): DetalleSua4 {
  return (el as ElementoSua4).detalle;
}

type Recorridos = Extract<DetalleSua4, { clase: "recorridos" }>;

/** Lo que forma el recorrido de evacuación, en palabras. */
export function zonasRecorrido(d: Recorridos): string[] {
  const partes: string[] = [];
  if (d.residencial) {
    partes.push("los rellanos de cada planta");
    if (d.escalera) partes.push(`la escalera común (${d.escalera})`);
    partes.push("el portal");
  } else {
    if (d.zonas.some((z) => z.uso === "vestibulo" || z.uso === "zona_comun")) partes.push("el vestíbulo");
    if (d.zonas.some((z) => z.uso === "oficinas")) partes.push("los pasillos y zonas abiertas de las oficinas");
    if (d.escalera) partes.push(`la escalera (${d.escalera})`);
  }
  if (d.zonas.some((z) => z.uso === "trasteros") || d.trasterosCriterio.length > 0) partes.push("el pasillo de los trasteros");
  if (d.zonas.some((z) => z.uso === "instalaciones")) partes.push("los cuartos de instalaciones de más de 50 m²");
  return partes;
}

function garaje(j: JustificacionSua4): Extract<DetalleSua4, { clase: "garaje" }> | null {
  const d = j.elementos.find((x) => x.detalle.clase === "garaje")?.detalle;
  return d && d.clase === "garaje" ? d : null;
}

export function fraseSua4(j: JustificacionSua4): string {
  const lux = [
    j.elementos.some((x) => x.id === "normal-interior") ? `${N.interior_lx} lux en las zonas comunes` : null,
    j.elementos.some((x) => x.id === "normal-garaje") ? `${N.aparcamientoInterior_lx} lux en el aparcamiento` : null,
  ].filter((x): x is string => x !== null);
  if (!j.conEmergencia) {
    const g = garaje(j);
    return g ? "El garaje de la vivienda queda sin alumbrado de emergencia, que la lectura literal de SUA 4 le exige." : "Vivienda unifamiliar: su interior no es origen de evacuación y no necesita alumbrado de emergencia.";
  }
  const donde: string[] = [];
  if (j.elementos.some((x) => x.id === "emergencia-recorridos")) donde.push("los recorridos de evacuación");
  if (garaje(j)?.dispone) donde.push(j.unifamiliar ? "el garaje de la vivienda" : "el garaje");
  if (j.elementos.some((x) => x.id === "emergencia-locales")) donde.push("los locales de riesgo especial");
  const normal = lux.length > 0 ? `Alumbrado normal de ${lista(lux)}; ` : "";
  const eje = j.elementos.some((x) => x.id === "emergencia-recorridos") ? `, con ${num(I.viaEvacuacion.ejeCentralMin_lx)} lux en el eje de los recorridos,` : "";
  const t = `${normal}alumbrado de emergencia en ${lista(donde)}${eje} durante ${I.autonomiaMin_h} h.`;
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
}

export function metricasSua4(j: JustificacionSua4): string {
  const partes: string[] = [];
  if (j.elementos.some((x) => x.id === "normal-interior")) partes.push(`${N.interior_lx} lx`);
  if (j.elementos.some((x) => x.id === "normal-garaje")) partes.push(`${N.aparcamientoInterior_lx} lx garaje`);
  partes.push(j.conEmergencia ? `emergencia ${num(I.viaEvacuacion.ejeCentralMin_lx)} lx · ${I.autonomiaMin_h} h` : "sin emergencia");
  return partes.join(" · ");
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraSua4(j: JustificacionSua4, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const fila = (titulo: string, detalle: string, t: string) => filas.push({ id: el.id, titulo, detalle, trato: t, estado: trato(estados[el.id]), elementoId: el.id });
    switch (d.clase) {
      case "normal":
        fila(d.tipo === "interior" ? "Zonas interiores" : "Aparcamiento", lista([...new Set(d.zonas.map((z) => z.plantas))]), `${d.lux} lx`);
        break;
      case "recorridos":
        fila("Recorridos de evacuación", lista(zonasRecorrido(d)), "emergencia");
        break;
      case "garaje":
        fila(d.unifamiliar ? "Garaje de la vivienda" : "Garaje", `${d.construida_m2} m² construidos${d.supuesta ? " (supuestos)" : ""}`, d.dispone ? "emergencia" : "sin emergencia");
        break;
      case "locales":
        fila("Locales de riesgo especial", lista(d.locales.map((l) => `${nombreLocal(l).toLowerCase()} (${l.zona.plantas})`)), "emergencia");
        break;
      case "sin_emergencia":
        fila("Alumbrado de emergencia", "sin orígenes de evacuación", "no se exige");
        break;
      case "local":
        fila("Local sin uso", d.zona.plantas, "con su actividad");
        break;
      default:
        break;
    }
  }
  return filas;
}

export function textoEtiquetaSua4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "normal":
      return `${d.lux} lx · U ${pc(N.uniformidadMediaMin)}`;
    case "recorridos":
      return `emergencia ${num(I.viaEvacuacion.ejeCentralMin_lx)} lx`;
    case "garaje":
      return d.dispone ? `emergencia · ${d.letra})` : "sin emergencia";
    case "locales":
      return `emergencia · ${d.locales.length} ${d.locales.length === 1 ? "local" : "locales"}`;
    case "cuadros":
      return `cuadros ${I.equiposYCuadrosMin_lx} lx`;
    case "senales":
      return `señales ≥ ${SE.luminanciaColorSeguridadMin_cd_m2} cd/m²`;
    case "luminarias":
      return `luminarias ≥ ${metros(LU.alturaMinimaSobreSuelo_m)}`;
    case "instalacion":
      return `${I.autonomiaMin_h} h · ${d.tipo === "autonomas" ? "autónomas" : "centralizada"}`;
    case "sin_emergencia":
      return "no se exige";
    case "local":
      return "con su actividad";
  }
}

export function resultadoListaSua4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "normal":
      return d.tipo === "interior"
        ? `≥ ${N.interior_lx} lx a nivel del suelo · uniformidad ≥ ${pc(N.uniformidadMediaMin)}`
        : `≥ ${N.aparcamientoInterior_lx} lx en toda la superficie · uniformidad ≥ ${pc(N.uniformidadMediaMin)}`;
    case "recorridos":
      return `${lista(zonasRecorrido(d))} · letras ${d.letras.join(", ")}`;
    case "garaje":
      return d.dispone ? `${d.letra === "c" ? "aparcamiento de más de 100 m² construidos (c)" : "local de riesgo especial bajo (d)"}${d.escalera ? `, con su escalera` : ""}` : "no se dispone (lectura literal: d)";
    case "locales":
      return lista(d.locales.map((l) => `${nombreLocal(l).toLowerCase()} (${l.zona.plantas}, riesgo ${l.clase}${l.supuesto ? ", supuesto" : ""})`));
    case "cuadros":
      return `donde están los cuadros de alumbrado de las zonas con emergencia · ≥ ${I.equiposYCuadrosMin_lx} lx`;
    case "senales":
      return `≥ ${SE.luminanciaColorSeguridadMin_cd_m2} cd/m² · máx/mín ≤ ${SE.relacionMaxMinMax}:1 · blanco/color ${SE.relacionBlancoColor.min}:1 a ${SE.relacionBlancoColor.max}:1`;
    case "luminarias":
      return `a ≥ ${metros(LU.alturaMinimaSobreSuelo_m)} · en cada puerta de salida, escaleras, cambios de nivel y de dirección`;
    case "instalacion":
      return `${num(I.viaEvacuacion.ejeCentralMin_lx)} lx en el eje · ${num(I.viaEvacuacion.bandaCentralMin_lx)} lx en la banda central · ${I.equiposYCuadrosMin_lx} lx en equipos · ${I.relacionMaxMinEjeMax}:1 · Ra ≥ ${I.raMin} · ${I.autonomiaMin_h} h`;
    case "sin_emergencia":
      return "el interior de la vivienda no es origen de evacuación";
    case "local":
      return "se justificará con el proyecto de su actividad";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSua4(el: ElementoSi<unknown>, _j: JustificacionSua4, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "normal":
      return {
        clase: "Alumbrado normal · ap. 1",
        titulo: el.nombre,
        valor: `≥ ${d.lux}`,
        unidad: "lx",
        estado,
        manda: `Cada zona de circulación tiene una instalación capaz de dar ${N.interior_lx} lux en las zonas interiores, ${N.aparcamientoInterior_lx} lux en los aparcamientos interiores y ${N.exterior_lx} lux en las exteriores, medidos a nivel del suelo, con un factor de uniformidad media del ${pc(N.uniformidadMediaMin)} como mínimo.`,
        nota:
          d.tipo === "aparcamiento"
            ? "Los 50 lux, en toda la superficie, plazas incluidas (comentario del Ministerio, no reglamentario)."
            : "Dentro de las viviendas el DB no lo excluye: los puntos de luz de pasillos y distribuidores permiten alcanzar 100 lux (criterio, no se comprueba).",
        filas: [
          { k: "Zonas", v: lista([...new Set(d.zonas.map((z) => z.plantas))]) },
          { k: "Iluminancia mínima", v: `${d.lux} lx a nivel del suelo` },
          { k: "Uniformidad media (Emin/Emed)", v: `≥ ${pc(N.uniformidadMediaMin)}` },
          { k: "Detectores de presencia", v: "admitidos (comentario del Ministerio)" },
        ],
        cita: "DB-SUA · SUA 4 ap. 1 pto 1",
      };
    case "recorridos":
      return {
        clase: "Dotación · ap. 2.1 b)",
        titulo: el.nombre,
        valor: "Sí",
        unidad: `letras ${d.letras.join(", ")}`,
        estado,
        manda: `${D.b.literal}. En una plurifamiliar el primer origen está en la puerta de cada vivienda: el recorrido sigue por el rellano y la escalera hasta la calle.`,
        nota:
          d.trasterosCriterio.length > 0
            ? "El pasillo de una zona de trasteros de 50 m² o menos no es, en sentido literal, origen de evacuación: lleva emergencia por criterio."
            : "Si el espacio exterior seguro está más allá del portal, el recorrido exterior por la parcela también lleva emergencia (comentario del Ministerio).",
        filas: [
          { k: "Recorrido (b)", v: lista(zonasRecorrido(d)) },
          { k: "Itinerario accesible (h)", v: d.accesible },
          ...(d.recintosMas100.length > 0 ? [{ k: `Recintos de más de ${D.a.ocupacionMayorQue} personas (a)`, v: lista(d.recintosMas100.map((r) => `${r.zona.plantas}: ${r.personas} personas`)) }] : []),
          ...(d.aseosOficinas ? [{ k: "Aseos generales de planta (e)", v: "los de las oficinas (criterio)" }] : []),
        ],
        cita: "DB-SUA · SUA 4 ap. 2.1",
      };
    case "garaje":
      return {
        clase: `Dotación · ap. 2.1 ${d.letra})`,
        titulo: el.nombre,
        valor: d.dispone ? "Sí" : "No",
        unidad: d.unifamiliar ? "riesgo especial bajo" : d.letra === "c" ? "> 100 m² construidos" : "riesgo especial bajo",
        estado,
        manda: d.unifamiliar
          ? "El garaje integrado en una vivienda unifamiliar es local de riesgo especial bajo en todo caso (SI 1, tabla 2.1), y 2.1 d) exige emergencia en los locales de riesgo especial. En lectura literal, una luminaria junto a su puerta de salida."
          : d.letra === "c"
            ? `${D.c.literal}.`
            : "Un garaje de 100 m² construidos o menos es local de riesgo especial bajo (SI 1, tabla 2.1): lleva emergencia por 2.1 d), y sus puntos son origen de evacuación.",
        nota: d.unifamiliar
          ? d.dispone
            ? "Lectura literal del DB, sin comentario del Ministerio: es una decisión."
            : "No se dispone: la lectura literal de 2.1 d) lo pediría."
          : "Los 50 lux de alumbrado normal se dan en toda la superficie.",
        filas: [
          { k: "Superficie construida", v: `${d.construida_m2} m²${d.supuesta ? " (útil × 1,20, criterio)" : ""}` },
          ...(d.escalera ? [{ k: "Escalera hasta el exterior", v: d.escalera }] : []),
          { k: "Luminarias", v: d.unifamiliar ? "junto a la puerta de salida" : "en las calles, los pasillos peatonales y la escalera" },
        ],
        cita: `DB-SUA · SUA 4 ap. 2.1 ${d.letra}) · DB-SI · SI 1 tabla 2.1`,
      };
    case "locales":
      return {
        clase: "Dotación · ap. 2.1 d)",
        titulo: el.nombre,
        valor: String(d.locales.length),
        unidad: d.locales.length === 1 ? "local" : "locales",
        estado,
        manda: `${D.d.literal}. Son los locales de riesgo especial de SI 1.`,
        nota: d.locales.some((l) => l.supuesto === "tipo") ? "Un cuarto sin tipo se supone de riesgo especial, como en SI 1. Indica su tipo en El edificio." : undefined,
        filas: d.locales.map((l) => ({ k: `${nombreLocal(l)} (${l.zona.plantas})`, v: `riesgo ${l.clase}${l.supuesto ? " (supuesto)" : ""}` })),
        cita: "DB-SUA · SUA 4 ap. 2.1 d) · DB-SI · SI 1 tabla 2.1",
      };
    case "cuadros":
      return {
        clase: "Dotación · ap. 2.1 f)",
        titulo: el.nombre,
        valor: `≥ ${I.equiposYCuadrosMin_lx}`,
        unidad: "lx",
        estado,
        manda: `${D.f.literal}. Allí, y donde estén los equipos de seguridad y las instalaciones de protección contra incendios de uso manual, ${I.equiposYCuadrosMin_lx} lux como mínimo.`,
        filas: [{ k: "Cuadros", v: "los de alumbrado de las zonas comunes y del garaje" }],
        cita: "DB-SUA · SUA 4 ap. 2.1 f) · ap. 2.3 pto 3 b)",
      };
    case "senales":
      return {
        clase: "Señales de seguridad · ap. 2.4",
        titulo: el.nombre,
        valor: `≥ ${SE.luminanciaColorSeguridadMin_cd_m2}`,
        unidad: "cd/m²",
        estado,
        manda: "Las señales de evacuación, las de los medios manuales de protección contra incendios y las de primeros auxilios están iluminadas.",
        nota: d.unifamiliar ? "En la vivienda, la señal del extintor del garaje." : "En Residencial Vivienda no se exige el rótulo «SALIDA» (SI 3); sí las señales del garaje, de dirección y de los extintores.",
        filas: [
          { k: "Luminancia del color de seguridad", v: `≥ ${SE.luminanciaColorSeguridadMin_cd_m2} cd/m²` },
          { k: "Lmax/Lmin", v: `≤ ${SE.relacionMaxMinMax}:1` },
          { k: "Lblanca/Lcolor", v: `entre ${SE.relacionBlancoColor.min}:1 y ${SE.relacionBlancoColor.max}:1` },
          { k: "Respuesta", v: `${pc(SE.respuesta.a5s)} a los 5 s · ${pc(SE.respuesta.a60s)} a los 60 s` },
        ],
        cita: "DB-SUA · SUA 4 ap. 2.1 g) · ap. 2.4",
      };
    case "luminarias":
      return {
        clase: "Posición · ap. 2.2",
        titulo: el.nombre,
        valor: `≥ ${metros(LU.alturaMinimaSobreSuelo_m).replace(" m", "")}`,
        unidad: "m del suelo",
        estado,
        manda: `A ${metros(LU.alturaMinimaSobreSuelo_m)} del suelo como mínimo; una en cada puerta de salida y donde haya que destacar un peligro o un equipo de seguridad.`,
        filas: LU.puntosMinimos.map((t, i) => ({ k: `Punto ${i + 1}`, v: t })),
        cita: "DB-SUA · SUA 4 ap. 2.2",
      };
    case "instalacion":
      return {
        clase: "Instalación · ap. 2.3",
        titulo: el.nombre,
        valor: String(I.autonomiaMin_h),
        unidad: "h",
        estado,
        manda: `Fija, con fuente propia de energía y entrada automática cuando la tensión baja del ${pc(I.falloTensionPorDebajoDe)} de la nominal. Los niveles se calculan con reflexión nula en paredes y techos y con un factor de mantenimiento.`,
        nota: d.tipo === "autonomas" ? "Con luminarias autónomas: el DB no lo exige, también vale un sistema centralizado." : "Con sistema centralizado: también es fuente propia.",
        filas: [
          { k: "Eje de la vía (≤ 2 m de ancho)", v: `≥ ${num(I.viaEvacuacion.ejeCentralMin_lx)} lx` },
          { k: "Banda central (½ del ancho)", v: `≥ ${num(I.viaEvacuacion.bandaCentralMin_lx)} lx` },
          { k: "Equipos, PCI manual y cuadros", v: `≥ ${I.equiposYCuadrosMin_lx} lx` },
          { k: "Emax/Emin en el eje", v: `≤ ${I.relacionMaxMinEjeMax}:1` },
          { k: "Rendimiento de color", v: `Ra ≥ ${I.raMin}` },
          { k: "Respuesta", v: `${pc(I.respuesta.a5s)} a los 5 s · ${pc(I.respuesta.a60s)} a los 60 s` },
          { k: "Autonomía", v: `≥ ${I.autonomiaMin_h} h` },
        ],
        cita: "DB-SUA · SUA 4 ap. 2.3",
      };
    case "sin_emergencia":
      return {
        clase: "Dotación · ap. 2.1",
        titulo: el.nombre,
        valor: "No se exige",
        estado,
        manda: "El interior de una vivienda no es origen de evacuación (Anejo SI A), y no hay ninguna de las zonas ni de los elementos de la lista de 2.1.",
        filas: [{ k: "Orígenes de evacuación", v: "ninguno" }],
        cita: "DB-SUA · SUA 4 ap. 2.1",
      };
    case "local":
      return {
        clase: "Local sin uso",
        titulo: el.nombre,
        valor: "Previsto",
        estado,
        manda: "El local sin uso justificará SUA 4 con el proyecto de su actividad. Se deja previsto el alumbrado de emergencia del recorrido de su salida.",
        filas: [{ k: "Plantas", v: d.zona.plantas }],
        cita: "DB-SUA · SUA 4",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos
// -----------------------------------------------------------------------------

export function textoAvisoSua4(a: Aviso): TextoSi {
  switch (a.id) {
    case "cuarto-sin-tipo":
      return {
        titulo: "Un cuarto de instalaciones sin tipo se supone de riesgo especial.",
        detalle: `El de ${String(a.datos.plantas ?? "")} lleva alumbrado de emergencia por ser local de riesgo especial; si no lo es, no lo necesita. Indica su tipo en El edificio.`,
      };
    case "garaje-vivienda-sin":
      return {
        titulo: "El garaje de la vivienda queda sin alumbrado de emergencia.",
        detalle: "Es local de riesgo especial bajo (SI 1) y la lectura literal de SUA 4 ap. 2.1 d) se lo exige. Justifica en la memoria por qué no se dispone.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua4(): TextoSi | null {
  return null;
}

export function describirDibujoSua4(j: JustificacionSua4): string {
  return j.conEmergencia
    ? "Sección del edificio con las zonas teñidas por la iluminancia de su alumbrado normal y una luminaria en cada zona con alumbrado de emergencia."
    : "Sección de la vivienda: sin zonas con alumbrado de emergencia.";
}

export function piezasSua4(j: JustificacionSua4): { texto: string; acento: boolean }[] {
  const p: { texto: string; acento: boolean }[] = [];
  if (j.elementos.some((x) => x.id === "normal-interior")) p.push({ texto: `${N.interior_lx} lx`, acento: false });
  p.push({ texto: j.conEmergencia ? "emergencia" : "sin emergencia", acento: j.avisos.some((a) => a.id === "garaje-vivienda-sin") });
  return p;
}
