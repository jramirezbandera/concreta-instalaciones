// =============================================================================
// DB-SUA, SUA 4 — La justificación (feature-20): el alumbrado normal de las zonas
// de circulación (100 lux en el interior, 50 en el aparcamiento) y qué zonas
// llevan alumbrado de emergencia, deducidas de El edificio, con la posición de
// las luminarias, las características de la instalación y las señales. PURA y
// DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua2-sua5.md, bloques B4 y B5):
//   - el alumbrado normal no se comprueba dentro de las viviendas (el DB no lo
//     excluye: criterio S10, va a la memoria sin bloquear);
//   - los orígenes de evacuación, como en SI 4: no hay en el interior de las
//     viviendas (sí en el rellano de cada planta de una plurifamiliar); las zonas
//     de ocupación nula solo si exceden de 50 m² (Anejo SI A);
//   - los locales de riesgo especial son los de SI 1 (`si/riesgo.ts`), sin
//     rehacer la clasificación; el garaje de la unifamiliar es uno de ellos y, en
//     lectura literal de 2.1 d), lleva emergencia (criterio S11, decisión);
//   - un cuarto sin tipo se supone de riesgo especial (como en SI 1) y se avisa:
//     cambia el resultado;
//   - el pasillo de una zona de trasteros de 50 m² o menos lleva emergencia por
//     criterio (S12); los aseos generales de las oficinas, también (S13);
//   - el local sin uso se justificará con su actividad (S14).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { DENSIDADES_SI3 } from "../../lib/edificio/tablas";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import { clasificarRiesgo, type LocalRiesgo } from "../si/riesgo";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type ZonaSua } from "../sua/edificio";
import { HABITUALES_SUA4, resolverSua4, type DecisionesSua4, type Sua4Estado } from "./estado";
import {
  ALUMBRADO_NORMAL_SUA4_1,
  DOTACION_EMERGENCIA_SUA4_2_1,
  INSTALACION_EMERGENCIA_SUA4_2_3,
  LUMINARIAS_EMERGENCIA_SUA4_2_2,
  SENALES_SUA4_2_4,
  type LetraEmergencia,
} from "./tablas";

export type DetalleSua4 =
  | { clase: "normal"; tipo: "interior" | "aparcamiento"; lux: number; zonas: ZonaSua[] }
  | {
      clase: "recorridos";
      letras: LetraEmergencia[];
      residencial: boolean;
      /** Zonas con orígenes de evacuación y las que forman su recorrido. */
      zonas: ZonaSua[];
      /** La escalera común, si la hay: «S1–P3». */
      escalera: string | null;
      /** Pasillo de trasteros de 50 m² o menos: por criterio (S12). */
      trasterosCriterio: ZonaSua[];
      /** Recintos de más de 100 personas (a). */
      recintosMas100: { zona: ZonaSua; personas: number }[];
      /** Aseos generales de planta de las oficinas (e, criterio S13). */
      aseosOficinas: boolean;
      /** Itinerario accesible (h): «portal, ascensor y rellanos». */
      accesible: string;
    }
  | {
      clase: "garaje";
      letra: "c" | "d";
      unifamiliar: boolean;
      /** Lleva emergencia (en la unifamiliar, la decisión). */
      dispone: boolean;
      construida_m2: number;
      supuesta: boolean;
      zonas: ZonaSua[];
      escalera: string | null;
    }
  | { clase: "locales"; locales: LocalRiesgo[] }
  | { clase: "cuadros" }
  | { clase: "senales"; unifamiliar: boolean }
  | { clase: "luminarias"; escalera: boolean }
  | { clase: "instalacion"; tipo: DecisionesSua4["instalacion"] }
  | { clase: "sin_emergencia" }
  | { clase: "local"; zona: ZonaSua };

export type ElementoSua4 = ElementoSi<DetalleSua4>;

export interface JustificacionSua4 extends JustificacionSiBase {
  elementos: ElementoSua4[];
  decisiones: DecisionesSua4;
  habituales: DecisionesSua4;
  unifamiliar: boolean;
  residencial: boolean;
  /** Hay un garaje en la unifamiliar (decisión 1). */
  garajeVivienda: boolean;
  /** Hay alumbrado de emergencia en algún sitio (decisión 2). */
  conEmergencia: boolean;
  /** Zonas que lleva cada elemento de emergencia: para el dibujo. */
  emergenciaDe: Record<string, string>;
  /** Iluminancia de cada zona con alumbrado normal comprobado [lx]. */
  luxDe: Record<string, number>;
}

/**
 * ¿Tiene la zona orígenes de evacuación? (Anejo SI A). La misma regla que SI 4
 * (`si4/justificacion.ts`, `conOrigenes`): el rellano de cada planta de una
 * plurifamiliar sí, el interior de una vivienda no, la ocupación nula solo de
 * más de 50 m².
 */
export function conOrigenes(z: ZonaSua): boolean {
  if (z.uso === "viviendas") return true;
  if (z.uso === "vivienda_unifamiliar" || z.uso === "garaje_privado" || z.uso === "local_sin_uso") return false;
  if (z.ocupacionNula) return z.util_m2 > 50;
  return true;
}

const D = DOTACION_EMERGENCIA_SUA4_2_1.datos;
const L = ALUMBRADO_NORMAL_SUA4_1.datos;

export function justificarSua4(estado: Sua4Estado, p: ProyectoSi): JustificacionSua4 {
  const e = edificioSua(p.edificio);
  const riesgo = clasificarRiesgo(edificioSi(p.edificio));
  const d = resolverSua4(estado);
  const unifamiliar = e.unifamiliar;
  const elementos: ElementoSua4[] = [];
  const avisos: Aviso[] = [];
  const emergenciaDe: Record<string, string> = {};
  const luxDe: Record<string, number> = {};

  // ── Alumbrado normal (no en el interior de las viviendas) ─────────────────
  const interiores = e.zonas.filter((z) => z.clase === "comun" || z.clase === "oficinas" || z.uso === "trasteros");
  if (interiores.length > 0) {
    for (const z of interiores) luxDe[z.id] = L.interior_lx;
    elementos.push({
      id: "normal-interior",
      nombre: "Alumbrado normal en zonas interiores",
      tipo: "alumbrado",
      veredicto: "ok",
      valor: { valor: L.interior_lx, unidad: "lx" },
      limite: { valor: L.interior_lx, unidad: "lx" },
      manda: { tipo: "decision_proyectista", decision: "alumbrado normal" },
      cita: ["SUA 4 · ap. 1 pto 1"],
      detalle: { clase: "normal", tipo: "interior", lux: L.interior_lx, zonas: interiores },
    });
  }
  const garajes = e.zonas.filter((z) => z.clase === "garaje");
  if (garajes.length > 0) {
    for (const z of garajes) luxDe[z.id] = L.aparcamientoInterior_lx;
    elementos.push({
      id: "normal-garaje",
      nombre: "Alumbrado normal en el aparcamiento",
      tipo: "alumbrado",
      veredicto: "ok",
      valor: { valor: L.aparcamientoInterior_lx, unidad: "lx" },
      limite: { valor: L.aparcamientoInterior_lx, unidad: "lx" },
      manda: { tipo: "decision_proyectista", decision: "alumbrado normal" },
      cita: ["SUA 4 · ap. 1 pto 1"],
      detalle: { clase: "normal", tipo: "aparcamiento", lux: L.aparcamientoInterior_lx, zonas: garajes },
    });
  }

  // ── Emergencia: los locales de riesgo especial de SI 1 (sin los garajes) ──
  const locales = riesgo.locales.filter((l) => l.tipo !== "garaje" && l.tipo !== "garaje_unifamiliar");
  const enLocal = new Set(locales.map((l) => l.zona.id));

  // ── Emergencia: recorridos desde todo origen de evacuación (b) ────────────
  const comun = e.escaleras.find((x) => x.tipo === "comun");
  const recorrido = e.zonas.filter((z) => z.clase !== "garaje" && !enLocal.has(z.id) && conOrigenes(z));
  const trasterosCriterio = e.zonas.filter((z) => z.uso === "trasteros" && !enLocal.has(z.id) && !conOrigenes(z) && e.residencial);
  if (recorrido.length > 0 || trasterosCriterio.length > 0) {
    const letras: LetraEmergencia[] = ["b"];
    const recintosMas100: { zona: ZonaSua; personas: number }[] = [];
    for (const z of e.zonas) {
      const densidad = z.uso === "oficinas" ? DENSIDADES_SI3.datos.administrativoOficinas : z.uso === "vestibulo" && !e.residencial ? DENSIDADES_SI3.datos.administrativoVestibulos : null;
      if (densidad === null) continue;
      // Interpretación: la zona es un solo recinto (lado de la seguridad).
      const personas = Math.ceil(z.util_m2 / densidad);
      if (personas > D.a.ocupacionMayorQue) recintosMas100.push({ zona: z, personas });
    }
    if (recintosMas100.length > 0) letras.unshift("a");
    const aseosOficinas = e.zonas.some((z) => z.clase === "oficinas");
    if (aseosOficinas) letras.push("e");
    letras.push("h");
    const accesible = e.residencial
      ? e.ascensor.hay.valor
        ? "el portal, el ascensor y los rellanos hasta cada vivienda"
        : "el portal hasta las viviendas a las que se llega sin escalones"
      : e.ascensor.hay.valor
        ? "el vestíbulo, el ascensor y los pasillos de las oficinas"
        : "el vestíbulo y los pasillos de las oficinas";
    for (const z of [...recorrido, ...trasterosCriterio]) emergenciaDe[z.id] = "emergencia-recorridos";
    elementos.push({
      id: "emergencia-recorridos",
      nombre: "Emergencia en los recorridos de evacuación",
      tipo: "emergencia",
      veredicto: "ok",
      valor: { texto: "alumbrado de emergencia" },
      manda: { tipo: "decision_proyectista", decision: "dotación" },
      cita: ["SUA 4 · ap. 2.1 b)", "Anejo SI A · origen de evacuación"],
      detalle: {
        clase: "recorridos",
        letras,
        residencial: e.residencial,
        zonas: recorrido,
        escalera: comun ? comun.plantas : null,
        trasterosCriterio,
        recintosMas100,
        aseosOficinas,
        accesible,
      },
    });
  }

  // ── Emergencia: el garaje ─────────────────────────────────────────────────
  if (e.garaje) {
    const g = e.garaje;
    const esc = e.escaleras.find((x) => x.tipo === "garaje");
    for (const z of g.zonas) emergenciaDe[z.id] = "emergencia-garaje";
    elementos.push({
      id: "emergencia-garaje",
      nombre: "Emergencia en el aparcamiento",
      tipo: "emergencia",
      veredicto: "ok",
      valor: { texto: g.usoAparcamiento ? "aparcamiento > 100 m²" : "riesgo especial bajo" },
      manda: { tipo: "decision_proyectista", decision: "dotación" },
      cita: [g.usoAparcamiento ? "SUA 4 · ap. 2.1 c)" : "SUA 4 · ap. 2.1 d)", "SI 1 · tabla 2.1"],
      detalle: {
        clase: "garaje",
        letra: g.usoAparcamiento ? "c" : "d",
        unifamiliar: false,
        dispone: true,
        construida_m2: g.construida_m2,
        supuesta: g.supuesta,
        zonas: g.zonas,
        escalera: esc ? esc.plantas : null,
      },
    });
  }
  const zonasGarajeVivienda = e.zonas.filter((z) => z.clase === "garaje_vivienda");
  const garajeVivienda = zonasGarajeVivienda.length > 0;
  if (garajeVivienda) {
    const dispone = d.garajeVivienda === "si";
    if (dispone) for (const z of zonasGarajeVivienda) emergenciaDe[z.id] = "emergencia-garaje";
    else avisos.push({ id: "garaje-vivienda-sin", tipo: "caso_especial", elementoId: "emergencia-garaje", datos: {} });
    const s = zonasGarajeVivienda.reduce((a, z) => a + z.construida.valor * z.repeticiones, 0);
    elementos.push({
      id: "emergencia-garaje",
      nombre: "Emergencia en el garaje de la vivienda",
      tipo: "emergencia",
      veredicto: "ok",
      valor: { texto: dispone ? "una luminaria junto a la salida" : "no se dispone" },
      manda: { tipo: "decision_proyectista", decision: "garaje de la unifamiliar" },
      cita: ["SUA 4 · ap. 2.1 d)", "SI 1 · tabla 2.1"],
      detalle: { clase: "garaje", letra: "d", unifamiliar: true, dispone, construida_m2: Math.round(s), supuesta: zonasGarajeVivienda.some((z) => z.construida.supuesto), zonas: zonasGarajeVivienda, escalera: null },
    });
  }

  // ── Emergencia: locales de riesgo especial (d) ────────────────────────────
  if (locales.length > 0) {
    for (const l of locales) emergenciaDe[l.zona.id] = "emergencia-locales";
    elementos.push({
      id: "emergencia-locales",
      nombre: "Emergencia en los locales de riesgo especial",
      tipo: "emergencia",
      veredicto: "ok",
      valor: { valor: locales.length, unidad: locales.length === 1 ? "local" : "locales" },
      manda: { tipo: "decision_proyectista", decision: "dotación" },
      cita: ["SUA 4 · ap. 2.1 d)", "SI 1 · tabla 2.1"],
      detalle: { clase: "locales", locales },
    });
    // Un cuarto sin tipo se supone de riesgo especial (SI 1). Se avisa solo si
    // cambia el resultado: sin ser local de riesgo, uno de 50 m² o menos no es
    // origen de evacuación y no llevaría emergencia.
    const sinTipo = locales.filter((x) => x.supuesto === "tipo" && x.zona.util_m2 <= 50);
    if (sinTipo.length > 0) {
      avisos.push({ id: "cuarto-sin-tipo", tipo: "supuesto", elementoId: "emergencia-locales", datos: { plantas: sinTipo.map((l) => l.zona.plantas).join(", ") } });
    }
  }

  // ── Lo común a toda la instalación de emergencia ─────────────────────────
  const conEmergencia = Object.keys(emergenciaDe).length > 0;
  if (conEmergencia) {
    if (!unifamiliar) {
      elementos.push({
        id: "emergencia-cuadros",
        nombre: "Cuadros de alumbrado",
        tipo: "emergencia",
        veredicto: "ok",
        valor: { valor: INSTALACION_EMERGENCIA_SUA4_2_3.datos.equiposYCuadrosMin_lx, unidad: "lx" },
        manda: { tipo: "decision_proyectista", decision: "dotación" },
        cita: ["SUA 4 · ap. 2.1 f)", "SUA 4 · ap. 2.3 pto 3 b)"],
        detalle: { clase: "cuadros" },
      });
    }
    elementos.push(
      {
        id: "emergencia-senales",
        nombre: "Señales de seguridad",
        tipo: "emergencia",
        veredicto: "ok",
        valor: { valor: SENALES_SUA4_2_4.datos.luminanciaColorSeguridadMin_cd_m2, unidad: "cd/m²" },
        manda: { tipo: "decision_proyectista", decision: "señales" },
        cita: ["SUA 4 · ap. 2.1 g)", "SUA 4 · ap. 2.4"],
        detalle: { clase: "senales", unifamiliar },
      },
      {
        id: "emergencia-luminarias",
        nombre: "Posición de las luminarias",
        tipo: "emergencia",
        veredicto: "ok",
        valor: { valor: LUMINARIAS_EMERGENCIA_SUA4_2_2.datos.alturaMinimaSobreSuelo_m, unidad: "m" },
        manda: { tipo: "decision_proyectista", decision: "posición" },
        cita: ["SUA 4 · ap. 2.2"],
        detalle: { clase: "luminarias", escalera: e.escaleras.some((x) => x.tipo !== "interior") },
      },
      {
        id: "emergencia-instalacion",
        nombre: "Instalación de alumbrado de emergencia",
        tipo: "emergencia",
        veredicto: "ok",
        valor: { valor: INSTALACION_EMERGENCIA_SUA4_2_3.datos.autonomiaMin_h, unidad: "h" },
        manda: { tipo: "decision_proyectista", decision: "instalación" },
        cita: ["SUA 4 · ap. 2.3"],
        detalle: { clase: "instalacion", tipo: d.instalacion },
      },
    );
  } else if (!garajeVivienda) {
    // Con el garaje de la vivienda sin emergencia, ya lo dice su elemento.
    elementos.push({
      id: "emergencia",
      nombre: "Alumbrado de emergencia",
      tipo: "emergencia",
      veredicto: "dato",
      valor: { texto: "no se exige" },
      manda: { tipo: "decision_proyectista", decision: "dotación" },
      cita: ["SUA 4 · ap. 2.1", "Anejo SI A · origen de evacuación"],
      detalle: { clase: "sin_emergencia" },
    });
  }

  // ── El local sin uso ──────────────────────────────────────────────────────
  for (const z of e.zonas.filter((x) => x.clase === "local")) {
    elementos.push({
      id: `local-${z.id}`,
      nombre: `Local sin uso (${z.plantas})`,
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "con su actividad" },
      manda: { tipo: "decision_proyectista", decision: "previsión" },
      cita: ["SUA 4"],
      detalle: { clase: "local", zona: z },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    elementos,
    avisos,
    veredicto,
    decisiones: d,
    habituales: HABITUALES_SUA4,
    unifamiliar,
    residencial: e.residencial,
    garajeVivienda,
    conEmergencia,
    emergenciaDe,
    luxDe,
  };
}
