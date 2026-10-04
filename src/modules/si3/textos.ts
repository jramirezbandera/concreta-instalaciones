// =============================================================================
// DB-SI, SI 3 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas, los avisos, lo que no cumple y la
// memoria. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion, MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { USOS } from "../../lib/edificio/usos";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { DetalleSi3, ElementoSi3, JustificacionSi3 } from "./justificacion";
import { HUMO_SI3, SALIDAS_TABLA_3_1, type ProteccionEscalera } from "./tablas";

const H = HUMO_SI3.datos;

function det(el: ElementoSi<unknown>): DetalleSi3 {
  return (el as ElementoSi3).detalle;
}

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

export const NOMBRE_ESCALERA: Record<ProteccionEscalera, string> = {
  no_protegida: "no protegida",
  compartimentada: "compartimentada",
  protegida: "protegida",
  especialmente_protegida: "especialmente protegida",
};

function personas(n: number): string {
  return `${n} ${n === 1 ? "persona" : "personas"}`;
}

/** «desde la puerta de la vivienda más alejada hasta la salida del edificio». */
export function tramoRecorrido(d: Extract<DetalleSi3, { clase: "salidas" }>): string {
  return `desde la puerta ${d.residencial ? "de la vivienda" : "del recinto"} más alejada hasta ${d.hastaEdificio ? "la salida del edificio, bajando por la escalera" : "la escalera (salida de planta)"}`;
}

// -----------------------------------------------------------------------------
// La cabecera
// -----------------------------------------------------------------------------

export function fraseSi3(j: JustificacionSi3): string {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  if (oc.unifamiliar) return "Vivienda unifamiliar: su interior no es origen de evacuación, así que no hay recorridos que limitar ni escaleras que proteger.";
  const partes: string[] = [`${personas(oc.total)}`];
  const esc = j.elementos.find((e) => e.id === "escalera")?.detalle;
  if (esc && esc.clase === "escalera") partes.push(`escalera ${NOMBRE_ESCALERA[esc.proteccion]} de ${m(esc.anchura_m)}`);
  const sal = j.elementos.find((e) => e.id === "salidas")?.detalle;
  if (sal && sal.clase === "salidas") partes.push(`una salida por planta con recorridos ${sal.recorrido_m !== null ? `de ${m(sal.recorrido_m, 1)}` : `de hasta ${sal.limite_m} m`}`);
  if (j.conGaraje) partes.push("el garaje, por escalera especialmente protegida");
  const fallo = j.veredicto === "fail" ? " Hay algo que no cumple." : "";
  return `${partes.join("; ")}.${fallo}`;
}

export function metricasSi3(j: JustificacionSi3): string {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  return `${personas(oc.total)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : "normal";
}

export function queEntraSi3(j: JustificacionSi3, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  for (const o of oc.zonas.filter((x) => x.total > 0)) {
    filas.push({
      id: `oc-${o.zona.id}`,
      titulo: USOS[o.zona.uso].etiqueta,
      detalle: `${o.zona.plantas} · ${fmt(o.zona.util_m2, "m²", 0)}${o.densidad_m2 ? ` · ${o.densidad_m2} m²/persona` : ""}`,
      trato: personas(o.total),
      estado: o.zona.uso === "local_sin_uso" ? "pv" : "normal",
      elementoId: "ocupacion",
    });
  }
  for (const el of j.elementos) {
    if (el.id === "salidas" || el.id === "garaje" || el.id === "escalera") {
      filas.push({ id: el.id, titulo: el.nombre, detalle: resultadoListaSi3(el).split(" · ")[0], trato: textoEtiquetaSi3(el), estado: trato(estados[el.id]), elementoId: el.id });
    }
  }
  return filas;
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function textoEtiquetaSi3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupacion":
      return d.unifamiliar ? "sin orígenes" : personas(d.total);
    case "salidas":
      return d.recorrido_m !== null ? `recorrido ${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `recorrido ≤ ${d.limite_m} m`;
    case "garaje":
      return d.recorrido_m !== null ? `garaje ${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `garaje ≤ ${d.limite_m} m`;
    case "escalera":
      return `${NOMBRE_ESCALERA[d.proteccion]} · ${m(d.anchura_m)}`;
    case "escalera_garaje":
      return "esp. protegida + vestíbulo";
    case "puertas":
      return `salida ≥ ${m(d.anchura_m)}`;
    case "senalizacion":
      return d.residencial ? "sin rótulo SALIDA" : "señales SALIDA";
    case "humo":
      return d.ventilacion === "mecanica" ? `extracción ${fmt(d.extraccion_l_s, "l/s", 0)}` : "ventilación natural";
    case "discapacidad":
      return d.exige ? "zona de refugio" : "salida accesible";
    case "unifamiliar":
      return "sin recorridos";
    case "local":
      return "salidas propias";
  }
}

export function resultadoListaSi3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupacion":
      return d.unifamiliar ? "interior de vivienda: no es origen de evacuación" : `${personas(d.total)} (sin el local)`;
    case "salidas":
      return `una salida de planta · ${d.plantaMayor}: ${personas(d.pPlanta)} ≤ 100 · ${d.residencial ? `edificio ${d.pSalida} ≤ 500 · ` : ""}h ${m(d.h_m)} ≤ 28 m · recorrido ${d.recorrido_m !== null ? m(d.recorrido_m, 1) : "sin medir"} ≤ ${d.limite_m} m`;
    case "garaje":
      return `una salida · ${personas(d.pPlanta)} ≤ 100 · recorrido ${d.recorrido_m !== null ? m(d.recorrido_m, 1) : "sin medir"} ≤ ${d.limite_m} m · ascendente ${m(d.hAsc_m)} ≤ 10 m`;
    case "escalera":
      return `${NOMBRE_ESCALERA[d.proteccion]} (la tabla 5.1 admite ${NOMBRE_ESCALERA[d.exigida]} con h ${m(d.h_m)}) · ${personas(d.p)} ≤ ${d.capacidad}`;
    case "escalera_garaje":
      return `especialmente protegida, con vestíbulo de independencia en cada acceso · ${personas(d.p)} ≤ ${d.capacidad}`;
    case "puertas":
      return `A ≥ P/200 ≥ 0,80 m → ${m(d.anchura_m)} · ${d.sentidoEvacuacion ? "abre hacia fuera" : "abatible de eje vertical"}`;
    case "senalizacion":
      return d.residencial ? `viviendas sin rótulo «SALIDA»; flechas y la escalera que baja al sótano${d.garaje ? "; el garaje, señalizado" : ""}` : "salidas y recorridos señalizados (UNE 23034)";
    case "humo":
      return d.ventilacion === "mecanica"
        ? `ventilación mecánica de HS 3 que extrae ${fmt(d.extraccion_l_s, "l/s", 0)} (150 l/plaza) con aportación ≤ ${fmt(d.aportacion_l_s, "l/s", 0)}, por detección`
        : "ventilación natural conforme a HS 3";
    case "discapacidad":
      return d.exige ? `zona de refugio o sector alternativo (${d.motivo})` : "no se exige zona de refugio; itinerario accesible en la planta de salida";
    case "unifamiliar":
      return d.garaje ? "sin recorridos; el garaje, ≤ 25 m hasta su salida" : "sin recorridos de evacuación";
    case "local":
      return `asimilado a Comercial (${personas(d.p)}): salidas independientes del portal`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSi3(el: ElementoSi<unknown>, _j: JustificacionSi3, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  const T = SALIDAS_TABLA_3_1.datos.unaSalida;
  switch (d.clase) {
    case "ocupacion":
      return {
        clase: "Ocupación · tabla 2.1",
        titulo: el.nombre,
        valor: d.unifamiliar ? "—" : String(d.total),
        unidad: d.unifamiliar ? "unifamiliar" : "personas",
        estado,
        manda: d.unifamiliar
          ? "El interior de una vivienda no es origen de evacuación: la ocupación de la unifamiliar es un dato, sin consecuencias en SI 3."
          : "Superficie útil de cada zona entre su densidad, por exceso. El portal y la escalera no añaden ocupación; los trasteros y los cuartos de instalaciones, nula. El local, asimilado a Comercial, sale por sus propias salidas.",
        filas: d.zonas
          .filter((o) => o.densidad_m2 !== null)
          .map((o) => ({ k: `${USOS[o.zona.uso].etiqueta} · ${o.zona.plantas}`, v: `${fmt(o.zona.util_m2, "m²", 0)} / ${o.densidad_m2} = ${o.porPlanta}${o.zona.repeticiones > 1 ? ` × ${o.zona.repeticiones}` : ""}` })),
        cita: "DB-SI · SI 3 ap. 2 · tabla 2.1",
      };
    case "salidas":
      return {
        clase: "Salidas y recorridos · tabla 3.1",
        titulo: el.nombre,
        valor: d.recorrido_m !== null ? fmt(d.recorrido_m, undefined, 1) : `≤ ${d.limite_m}`,
        unidad: d.recorrido_m !== null ? `m de ${d.limite_m} m` : "m (sin medir)",
        estado,
        manda: `Una sola salida de planta vale si se cumplen a la vez la ocupación, la altura y el recorrido. El recorrido se mide ${tramoRecorrido(d)}, sobre el eje.${d.hastaEdificio ? " Una escalera no protegida ni compartimentada no es salida de planta." : ""}`,
        filas: [
          { k: `Ocupación de la planta (${d.plantaMayor})`, v: `${d.pPlanta} ≤ ${T.ocupacionMax}` },
          ...(d.residencial ? [{ k: "Salida del edificio de viviendas", v: `${d.pSalida} ≤ ${T.ocupacionEdificioViviendasMax}` }] : []),
          { k: "Altura de evacuación", v: `${m(d.h_m)} ≤ ${T.alturaDescendenteMax_m} m` },
          { k: "Recorrido", v: d.recorrido_m !== null ? `${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `sin medir · límite ${d.limite_m} m` },
        ],
        uso: d.recorrido_m !== null ? d.recorrido_m / d.limite_m : undefined,
        cita: "DB-SI · SI 3 ap. 3 · tabla 3.1 · Anejo SI A",
      };
    case "garaje":
      return {
        clase: "Salidas y recorridos · uso Aparcamiento",
        titulo: el.nombre,
        valor: d.recorrido_m !== null ? fmt(d.recorrido_m, undefined, 1) : `≤ ${d.limite_m}`,
        unidad: d.recorrido_m !== null ? `m de ${d.limite_m} m` : "m (sin medir)",
        estado,
        manda: "En uso Aparcamiento una salida vale con 35 m de recorrido desde el punto más alejado hasta la puerta del vestíbulo de la escalera, medidos por las calles de circulación.",
        filas: [
          { k: "Ocupación (40 m²/persona)", v: `${d.pPlanta} ≤ ${T.ocupacionMax}` },
          { k: "Recorrido", v: d.recorrido_m !== null ? `${m(d.recorrido_m, 1)} ≤ ${d.limite_m} m` : `sin medir · límite ${d.limite_m} m` },
          { k: "Altura ascendente", v: `${m(d.hAsc_m)} ≤ ${T.alturaAscendenteMax_m} m` },
        ],
        uso: d.recorrido_m !== null ? d.recorrido_m / d.limite_m : undefined,
        cita: "DB-SI · SI 3 · tabla 3.1",
      };
    case "escalera":
      return {
        clase: "Escalera · tablas 5.1 y 4.2",
        titulo: el.nombre,
        valor: NOMBRE_ESCALERA[d.proteccion],
        unidad: `${m(d.anchura_m)} de anchura`,
        estado,
        manda: `Con una altura de evacuación de ${m(d.h_m)}, la tabla 5.1 admite una escalera ${NOMBRE_ESCALERA[d.exigida]}${d.exigida === "no_protegida" ? " (o con más protección)" : ""}. Su anchura da capacidad para ${d.capacidad} personas; la mínima la fija el DB SUA 1, tabla 4.1 (1,00 m, criterio a confirmar).`,
        filas: [
          { k: "Protección", v: `${NOMBRE_ESCALERA[d.proteccion]} (admite ${NOMBRE_ESCALERA[d.exigida]})` },
          { k: "Ocupantes que la usan", v: `${d.p} en ${d.plantas} plantas` },
          { k: "Capacidad", v: `${d.capacidad} personas` },
          ...(d.proteccion === "protegida" || d.proteccion === "especialmente_protegida"
            ? [{ k: "Recinto", v: "EI 120 · puertas EI2 60-C5 · ventilación 1 m² por planta" }]
            : d.proteccion === "compartimentada"
              ? [{ k: "Recinto", v: "compartimentado como los sectores" }]
              : []),
        ],
        uso: d.capacidad > 0 ? d.p / d.capacidad : undefined,
        cita: "DB-SI · SI 3 ap. 4 y 5 · tablas 4.1, 4.2 y 5.1",
      };
    case "escalera_garaje":
      return {
        clase: "Escalera · tabla 5.1, Aparcamiento",
        titulo: el.nombre,
        valor: "Esp. protegida",
        unidad: "con vestíbulo de independencia",
        estado,
        manda: "En uso Aparcamiento solo se admite la escalera especialmente protegida: un vestíbulo de independencia en cada acceso desde el garaje. Puede ser la escalera común: en la planta de salida no necesita vestíbulo.",
        filas: [
          { k: "Ocupantes del garaje", v: `${d.p} ≤ ${d.capacidad}` },
          { k: "Altura que salva", v: m(d.hAsc_m) },
          { k: "Vestíbulo", v: "paredes EI 120, dos puertas EI2 30-C5" },
        ],
        cita: "DB-SI · SI 3 tabla 5.1 · SI 1 tabla 1.1",
      };
    case "puertas":
      return {
        clase: "Puertas · tabla 4.1 y ap. 6",
        titulo: el.nombre,
        valor: fmt(d.anchura_m, undefined, 2),
        unidad: "m de paso",
        estado,
        manda: `A ≥ P/200 ≥ 0,80 m para las ${d.pSalida} personas que salen por ella; hojas de 0,60 a 1,23 m, abatibles de eje vertical y sin llave desde dentro.${d.sentidoEvacuacion ? " Abre en el sentido de la evacuación." : ""}`,
        filas: [
          { k: "Personas", v: String(d.pSalida) },
          { k: "Anchura", v: m(d.anchura_m) },
          { k: "Sentido de apertura", v: d.sentidoEvacuacion ? "hacia fuera" : "libre" },
          ...(d.garaje ? [{ k: "Puertas del garaje", v: "sin bloqueo; el portón no vale como salida" }] : []),
        ],
        cita: "DB-SI · SI 3 · tabla 4.1 · ap. 6",
      };
    case "senalizacion":
      return {
        clase: "Señalización · ap. 7",
        titulo: el.nombre,
        valor: d.residencial ? "Sin «SALIDA»" : "UNE 23034",
        estado,
        manda: d.residencial
          ? "En uso Residencial Vivienda no se exige el rótulo «SALIDA», pero sí las flechas donde la salida no se vea y la señal en la escalera que en la planta de salida sigue hacia el sótano."
          : "Salidas de recinto, planta y edificio con su rótulo, y flechas visibles desde todo origen de evacuación que no vea la salida.",
        filas: [
          { k: "Norma", v: "UNE 23034:1988" },
          { k: "Fotoluminiscentes", v: "UNE 23035-1, -2 y -4" },
          ...(d.garaje ? [{ k: "Garaje", v: "salidas y recorridos señalizados (criterio)" }] : []),
        ],
        cita: "DB-SI · SI 3 ap. 7",
      };
    case "humo":
      return {
        clase: "Control del humo · ap. 8",
        titulo: el.nombre,
        valor: d.ventilacion === "mecanica" ? fmt(d.extraccion_l_s, undefined, 0) : "Natural",
        unidad: d.ventilacion === "mecanica" ? "l/s de extracción" : "HS 3",
        estado,
        manda: "Un garaje bajo rasante no es aparcamiento abierto y necesita control del humo. Vale la ventilación de HS 3; si es mecánica, con estas condiciones adicionales.",
        filas:
          d.ventilacion === "mecanica"
            ? [
                { k: "Extracción", v: `${fmt(d.extraccion_l_s, "l/s", 0)} (${H.extraccion_l_s_plaza} l/s por plaza)` },
                { k: "Aportación máxima", v: `${fmt(d.aportacion_l_s, "l/s", 0)} (${H.aportacionMax_l_s_plaza} l/s por plaza)` },
                { k: "Activación", v: "automática, por detección de incendio" },
                { k: "Ventiladores", v: H.ventiladores },
                { k: "Conductos", v: `${H.conductos} (${H.conductosEntreSectores} entre sectores)` },
                { k: "Compuertas E300 60 junto al suelo", v: d.compuertas ? "sí: la planta pasa de 4 m" : "no: la planta no pasa de 4 m" },
              ]
            : [{ k: "Ventilación natural", v: "conforme a HS 3, sin condiciones adicionales" }],
        cita: "DB-SI · SI 3 ap. 8 · DB-HS 3",
      };
    case "discapacidad":
      return {
        clase: "Personas con discapacidad · ap. 9",
        titulo: el.nombre,
        valor: d.exige ? "Se exige" : "No",
        unidad: d.exige ? "zona de refugio" : "se exige zona de refugio",
        estado,
        manda: d.exige
          ? `Por ${d.motivo}, las plantas sin salida accesible del edificio tienen paso a un sector alternativo o una zona de refugio (una plaza de silla de ruedas por cada 100 ocupantes).`
          : "Con viviendas de hasta 28 m (14 m en oficinas) y plantas de garaje de hasta 1.500 m² no se exige. La planta de salida sí tiene un itinerario accesible hasta una salida accesible (DB SUA 9).",
        filas: [{ k: "Planta de salida", v: "itinerario accesible hasta una salida accesible" }],
        cita: "DB-SI · SI 3 ap. 9",
      };
    case "unifamiliar":
      return {
        clase: "Evacuación · Anejo SI A",
        titulo: el.nombre,
        valor: "No hay",
        estado,
        manda: "El interior de una vivienda no es origen de evacuación: no hay recorridos que limitar ni escaleras que proteger. La vivienda no puede salir solo a través de su garaje, que es local de riesgo especial.",
        filas: d.garaje
          ? [
              { k: "Recorrido dentro del garaje", v: "≤ 25 m hasta su salida" },
              { k: "Puerta a la vivienda", v: "EI2 45-C5, ≥ 0,80 m" },
              { k: "Portón", v: "con puerta peatonal abatible de ≥ 0,80 m" },
            ]
          : [],
        cita: "DB-SI · Anejo SI A · SI 1 tabla 2.2",
      };
    case "local":
      return {
        clase: "Previsto · ap. 1",
        titulo: `Local sin uso · ${d.zona.plantas}`,
        valor: "Salidas propias",
        estado,
        manda: "Asimilado a Comercial, sus salidas y recorridos hasta la calle son independientes de las zonas comunes del edificio. Se justificará con su actividad.",
        filas: [{ k: "Ocupación (2 m²/persona)", v: personas(d.p) }],
        cita: "DB-SI · SI 3 ap. 1",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSi3(a: Aviso): TextoSi {
  switch (a.id) {
    case "recorrido":
      return {
        titulo: "Falta medir el recorrido más largo.",
        detalle: `La herramienta no mide planos. Mídelo ${a.datos.hastaEdificio ? "desde la puerta de la vivienda más alejada hasta la salida del edificio (la escalera no protegida no es salida de planta)" : "desde la puerta más alejada hasta la escalera"} y anótalo en las decisiones: el límite es ${a.datos.limite_m} m.`,
      };
    case "recorrido-garaje":
      return {
        titulo: "Falta medir el recorrido del garaje.",
        detalle: `Desde el punto más alejado hasta la puerta del vestíbulo de la escalera, por las calles de circulación: el límite es ${a.datos.limite_m} m.`,
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSi3(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "salidas") {
    const que = d.fallos.map((f) =>
      f === "ocupacion" ? `${d.plantaMayor} tiene ${d.pPlanta} ocupantes (más de 100)` : f === "ocupacion_edificio" ? `salen ${d.pSalida} personas por el portal (más de 500)` : f === "altura" ? `la altura de evacuación pasa de 28 m` : `el recorrido mide ${m(d.recorrido_m ?? 0, 1)} (más de ${d.limite_m} m)`,
    );
    return {
      titulo: "Una sola salida de planta no basta.",
      detalle: `${listaY(que)}.${d.fallos.includes("recorrido") && d.hastaEdificio ? " Con la escalera compartimentada o protegida, el recorrido acaba en ella." : d.fallos.includes("altura") ? " Hacen falta dos salidas de planta a dos escaleras: fuera de lo que justifica la herramienta." : ""}`,
    };
  }
  if (d.clase === "garaje") {
    return { titulo: "Una sola salida del garaje no basta.", detalle: d.fallos.includes("recorrido") ? `El recorrido mide ${m(d.recorrido_m ?? 0, 1)}, más de 35 m: hace falta otra salida.` : "La ocupación o la altura ascendente exceden de lo que admite una salida." };
  }
  if (d.clase === "escalera") {
    return {
      titulo: `La escalera ${NOMBRE_ESCALERA[d.proteccion]} no vale.`,
      detalle: d.capacidad < d.p ? `Su anchura da para ${d.capacidad} personas y la usan ${d.p}.` : `Con ${m(d.h_m)} de altura de evacuación la tabla 5.1 pide, al menos, una escalera ${NOMBRE_ESCALERA[d.exigida]}.`,
    };
  }
  return null;
}

export function describirDibujoSi3(j: JustificacionSi3): string {
  return `Sección del edificio con la escalera y los recorridos de evacuación: ${fraseSi3(j).replace(/\.$/, "")}.`;
}

// -----------------------------------------------------------------------------
// La memoria
// -----------------------------------------------------------------------------

export function memoriaSi3(j: JustificacionSi3): MemoriaDoc {
  const parrafos: Trozo[][] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    switch (d.clase) {
      case "ocupacion":
        if (d.unifamiliar) {
          parrafos.push(["El edificio es una vivienda unifamiliar. El interior de una vivienda no es origen de evacuación (Anejo SI A), por lo que no hay recorridos de evacuación que limitar ni escaleras que proteger conforme a SI 3."]);
        } else {
          parrafos.push([
            "La ocupación se calcula con las densidades de la tabla 2.1 sobre la superficie útil de cada zona: ",
            listaY(d.zonas.filter((o) => o.densidad_m2 !== null && o.zona.uso !== "local_sin_uso").map((o) => `${USOS[o.zona.uso].etiqueta.toLowerCase()} (${o.zona.plantas}), ${o.total} personas a ${o.densidad_m2} m²/persona`)),
            "; en total, ",
            { v: personas(d.total) },
            ". Los trasteros de las viviendas y los cuartos de instalaciones son zonas de ocupación nula, y el portal y la escalera no aportan ocupación propia. Las ocupaciones y usos previstos son únicamente los característicos de la actividad (tabla 2.1, nota 1).",
          ]);
        }
        break;
      case "salidas":
        parrafos.push([
          `Cada planta dispone de una única salida de planta (tabla 3.1): su ocupación no excede de 100 personas (la mayor, ${d.plantaMayor}, ${d.pPlanta})${d.residencial ? `, la de la salida del edificio de viviendas no excede de 500 (${d.pSalida})` : ""}, la altura de evacuación (${m(d.h_m)}) no excede de 28 m y el recorrido más desfavorable, medido ${tramoRecorrido(d)}, `,
          { v: d.recorrido_m !== null ? `es de ${m(d.recorrido_m, 1)}` : `no excede de ${d.limite_m} m` },
          d.recorrido_m !== null ? `, no mayor que ${d.limite_m} m.` : ".",
        ]);
        break;
      case "garaje":
        parrafos.push([
          `El garaje, de uso Aparcamiento, dispone de una salida de planta: su ocupación (${d.pPlanta} personas) no excede de 100, la altura de evacuación ascendente (${m(d.hAsc_m)}) no excede de 10 m y el recorrido desde el punto más alejado hasta la puerta del vestíbulo de la escalera `,
          { v: d.recorrido_m !== null ? `es de ${m(d.recorrido_m, 1)}` : `no excede de ${d.limite_m} m` },
          ".",
        ]);
        break;
      case "escalera":
        parrafos.push([
          `La escalera es `,
          { v: NOMBRE_ESCALERA[d.proteccion] },
          `, lo que admite la tabla 5.1 para una altura de evacuación de ${m(d.h_m)} en uso Residencial Vivienda. Con una anchura de ${m(d.anchura_m)} tiene capacidad para ${d.capacidad} personas (tablas 4.1 y 4.2), más que las ${d.p} que la usan; la anchura mínima es la del DB SUA 1, tabla 4.1.`,
        ]);
        break;
      case "escalera_garaje":
        parrafos.push([
          "La escalera que sirve al garaje es especialmente protegida, con vestíbulo de independencia (paredes EI 120 y dos puertas EI2 30-C5) en cada acceso desde el garaje, como exige la tabla 5.1 para el uso Aparcamiento.",
        ]);
        break;
      case "puertas":
        parrafos.push([
          `La puerta de salida del edificio, para ${d.pSalida} personas, tiene una anchura de paso de al menos `,
          { v: m(d.anchura_m) },
          ` (A ≥ P/200 ≥ 0,80 m), con hojas de entre 0,60 y 1,23 m, abatible de eje vertical y con apertura sin llave desde el lado de la evacuación${d.sentidoEvacuacion ? "; abre en el sentido de la evacuación" : ""} (SI 3, tabla 4.1 y ap. 6).${d.garaje ? " Las puertas de salida del garaje no tienen bloqueo y el portón de vehículos no se considera salida." : ""}`,
        ]);
        break;
      case "senalizacion":
        parrafos.push([
          d.residencial
            ? `En uso Residencial Vivienda no se exige el rótulo «SALIDA»; se señalizan los recorridos donde la salida no es visible y la escalera que, en la planta de salida, continúa hacia el sótano${d.garaje ? ", y las salidas y recorridos del garaje" : ""}, con señales conformes a UNE 23034:1988 visibles aunque falle el alumbrado normal (SI 3, ap. 7).`
            : "Las salidas y los recorridos se señalizan con señales conformes a UNE 23034:1988, visibles aunque falle el alumbrado normal (SI 3, ap. 7).",
        ]);
        break;
      case "humo":
        parrafos.push(
          d.ventilacion === "mecanica"
            ? [
                "El garaje, que no tiene la consideración de aparcamiento abierto, dispone de control del humo mediante el sistema de ventilación mecánica de HS 3, capaz de extraer ",
                { v: fmt(d.extraccion_l_s, "l/s", 0) },
                ` (${H.extraccion_l_s_plaza} l/s por plaza) con una aportación máxima de ${fmt(d.aportacion_l_s, "l/s", 0)}, activado automáticamente por una instalación de detección de incendio, con ventiladores ${H.ventiladores} y conductos ${H.conductos} (${H.conductosEntreSectores} si atraviesan sectores)${d.compuertas ? " y compuertas automáticas E300 60 en las aberturas de extracción junto al suelo" : ""} (SI 3, ap. 8).`,
              ]
            : ["El garaje dispone de control del humo mediante ventilación natural conforme al DB HS 3 (SI 3, ap. 8)."],
        );
        break;
      case "discapacidad":
        parrafos.push([
          d.exige
            ? `Por ${d.motivo}, las plantas sin salida accesible disponen de paso a un sector alternativo o de zona de refugio (SI 3, ap. 9).`
            : "No se exigen zonas de refugio (altura de evacuación no mayor que 28 m en uso Residencial Vivienda); la planta de salida dispone de un itinerario accesible hasta una salida del edificio accesible (SI 3, ap. 9).",
        ]);
        break;
      case "local":
        parrafos.push(["El local sin actividad, asimilado a uso Comercial, tiene sus salidas y recorridos independientes de las zonas comunes del edificio; se justificará en el proyecto de su actividad (SI 3, ap. 1)."]);
        break;
      default:
        break;
    }
  }
  return {
    titulo: "Evacuación de ocupantes",
    norma: "DB-SI 3",
    parrafos,
    fuente: ["DB-SI · SI 3 (consolidado 4-mar-2025)", "tablas 2.1, 3.1, 4.1, 4.2 y 5.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}

/** Las piezas de la fila de La obra. */
export function piezasSi3(j: JustificacionSi3): { texto: string; acento: boolean }[] {
  const oc = j.elementos[0].detalle as Extract<DetalleSi3, { clase: "ocupacion" }>;
  if (oc.unifamiliar) return [{ texto: "sin recorridos", acento: false }];
  const out: { texto: string; acento: boolean }[] = [{ texto: personas(oc.total), acento: false }];
  const esc = j.elementos.find((e) => e.id === "escalera")?.detalle;
  if (esc && esc.clase === "escalera") out.push({ texto: `escalera ${NOMBRE_ESCALERA[esc.proteccion]}`, acento: false });
  if (j.conGaraje) out.push({ texto: "garaje · esp. protegida", acento: true });
  if (j.elementos.some((e) => e.detalle.clase === "local")) out.push({ texto: "local · salidas propias", acento: true });
  return out;
}
