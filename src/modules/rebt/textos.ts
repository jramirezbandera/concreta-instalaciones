// =============================================================================
// REBT — Textos (feature-23): la frase de la cabecera, «Qué entra», la franja de
// cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que no
// cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista } from "../sua/colocar";
import type { DetalleRebt, ElementoRebt, JustificacionRebt, MotivoElevada, ViviendaRebt } from "./justificacion";
import {
  CONTADORES_REBT,
  CRITERIOS_REBT,
  GARAJES_REBT,
  GRADO_REBT,
  LOCALES_REBT,
  potenciaAscensorHabitual,
  PROYECTO_REBT,
  RECARGA_REBT,
} from "./tablas";

const G = GRADO_REBT.datos;

/** «9200 W», «14.490 W». */
export function W(v: number): string {
  return `${Math.round(v).toLocaleString("es-ES")} W`;
}

/** «98,7 kW». */
export function kW(v_W: number): string {
  return `${(v_W / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kW`;
}

/** Un número con coma: «5,4», «0,3». */
export function num(v: number, dec = 2): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: dec });
}

/** «420 m²». */
export function m2(v: number): string {
  return `${Math.round(v).toLocaleString("es-ES")} m²`;
}

export const NOMBRE_GRADO = { basica: "básica", elevada: "elevada" } as const;

const NOMBRE_MOTIVO: Record<MotivoElevada, string> = {
  superficie: `más de ${G.superficieElevadaMasDe_m2} m² útiles`,
  equipos: "climatización eléctrica u otros equipos",
  recarga: "recarga del vehículo eléctrico",
};

/** «por más de 160 m² útiles y la recarga del vehículo eléctrico». */
export function textoMotivos(v: ViviendaRebt): string {
  return v.motivos.length > 0 ? `por ${lista(v.motivos.map((m) => NOMBRE_MOTIVO[m]))}` : "sin climatización eléctrica ni más de 160 m²";
}

function det(el: ElementoSi<unknown>): DetalleRebt {
  return (el as ElementoRebt).detalle;
}

function buscar<C extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: C): Extract<DetalleRebt, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleRebt, { clase: C }>) : null;
}

/** «6 viviendas elevadas», «3 básicas y 3 elevadas». */
function gradosViviendas(j: JustificacionRebt): string {
  const n = (g: "basica" | "elevada") => j.viviendas.filter((v) => v.grado === g).reduce((a, v) => a + v.cantidad, 0);
  const b = n("basica");
  const e = n("elevada");
  const total = b + e;
  if (b === 0) return `${total} vivienda${total === 1 ? "" : "s"} de electrificación elevada`;
  if (e === 0) return `${total} vivienda${total === 1 ? "" : "s"} de electrificación básica`;
  return `${total} viviendas, ${b} de electrificación básica y ${e} elevada${e === 1 ? "" : "s"}`;
}

const UBICACION = { cpm: "caja de protección y medida", armario: "armario", local: "local" } as const;

/** «6 viviendas», «1 de servicios generales», «2 módulos de reserva para la recarga». */
export function textoDesglose(x: { que: string; n: number }): string {
  switch (x.que) {
    case "servicios generales":
      return `${x.n} de servicios generales`;
    case "reserva para la recarga":
      return `${x.n} módulo${x.n === 1 ? "" : "s"} de reserva para la recarga`;
    case "recarga colectiva":
      return `${x.n} principal de la recarga colectiva`;
    default:
      return `${x.n} ${x.que}`;
  }
}

/** «en armario», «en un local», «en la caja de protección y medida». */
export function textoUbicacion(d: Extract<DetalleRebt, { clase: "contadores" }>): string {
  return d.ubicacion === "cpm" ? "en la caja de protección y medida" : d.ubicacion === "local" ? "en un local" : "en un armario";
}

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseRebt(j: JustificacionRebt): string {
  const t = buscar(j, "total")!;
  const c = buscar(j, "contadores")!;
  const doc = buscar(j, "documentacion")!;
  if (j.unifamiliar) {
    const v = j.viviendas[0];
    if (!v) return `Vivienda sin tipo en El edificio: ${W(t.p_W)}.`;
    return `Vivienda de electrificación ${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}: ${W(v.potencia_W)}, IGA de ${v.iga_A} A. ${doc.proyecto ? "Proyecto" : "Memoria técnica de diseño"}.`;
  }
  const quien = j.clasificacion === "oficinas" ? "Edificio de oficinas" : gradosViviendas(j);
  if (c.exigeLocal && c.cuarto === null) {
    return `${quien}: ${kW(t.p_W)} de carga total. Con ${c.n} contadores hace falta un local de contadores, y El edificio no lo tiene.`;
  }
  if (!c.plantaOk) return `${quien}: ${kW(t.p_W)} de carga total. El local de contadores no está en la planta baja ni en el primer sótano.`;
  return `${quien}: ${kW(t.p_W)} de carga total, ${c.n} contadores ${textoUbicacion(c)} y ${doc.proyecto ? (doc.soloAparcamiento ? "proyecto del aparcamiento" : "proyecto") : "memoria técnica de diseño"}.`;
}

export function metricasRebt(j: JustificacionRebt): string {
  const t = buscar(j, "total")!;
  const c = buscar(j, "contadores")!;
  const doc = buscar(j, "documentacion")!;
  const partes = [`P = ${kW(t.p_W)}`];
  if (!j.unifamiliar) {
    const vv = buscar(j, "viviendas");
    if (vv) partes.push(`${vv.n} viv. × coef. ${num(vv.coeficiente, 1)}`);
    partes.push(`${c.n} contadores`);
  } else {
    partes.push(`I = ${num(t.i_A, 1)} A`);
  }
  partes.push(doc.proyecto ? "proyecto" : "MTD");
  return partes.join(" · ");
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraRebt(j: JustificacionRebt, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  if (j.viviendas.length > 0) {
    const n = j.viviendas.reduce((a, v) => a + v.cantidad, 0);
    const v0 = j.viviendas[0];
    const unGrado = j.viviendas.every((v) => v.grado === v0.grado);
    filas.push({
      id: "viviendas",
      titulo: j.unifamiliar ? "Vivienda" : "Viviendas",
      detalle: j.unifamiliar ? `${m2(v0.superficie_m2)} útiles` : `${n} · ${j.viviendas.map((v) => `${v.cantidad} ${v.nombre} (${m2(v.superficie_m2)})`).join(" · ")}`,
      trato: unGrado ? `${NOMBRE_GRADO[v0.grado]} · ${W(v0.potencia_W)}` : "básica y elevada",
      estado: trato(estados[`vivienda-${v0.tipoId}`]),
      elementoId: `vivienda-${v0.tipoId}`,
    });
  }
  const s = buscar(j, "servicios");
  if (s) {
    const que = [...(s.alumbrado.length > 0 ? ["alumbrado común"] : []), ...(s.ascensor ? ["ascensor"] : []), ...(s.otros_kW > 0 ? ["otros"] : [])];
    filas.push({ id: "servicios", titulo: "Servicios generales", detalle: que.length > 0 ? lista(que) : "sin zonas comunes", trato: kW(s.p_W), estado: trato(estados.servicios), elementoId: "servicios" });
  }
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase !== "local") continue;
    filas.push({
      id: el.id,
      titulo: d.uso === "oficinas" ? "Oficinas" : "Local",
      detalle: `${d.locales > 1 ? `${d.locales} × ` : ""}${m2(d.m2)} · ${d.plantas}`,
      trato: kW(d.p_W),
      estado: d.uso === "local_sin_uso" ? "pv" : trato(estados[el.id]),
      elementoId: el.id,
    });
  }
  const g = buscar(j, "garaje");
  if (g) {
    filas.push({
      id: "garaje",
      titulo: "Garaje",
      detalle: `${m2(g.m2)} · ${g.plazas} plazas · ventilación ${g.ventilacion} (HS 3)`,
      trato: kW(g.p_W),
      estado: trato(estados.garaje),
      elementoId: "garaje",
    });
  }
  const rc = buscar(j, "recarga");
  if (rc) {
    filas.push({
      id: "recarga",
      titulo: "Recarga del VE",
      detalle: rc.ambito === "otros" ? `${rc.estaciones} estación${rc.estaciones === 1 ? "" : "es"} (HE 6) × ${W(rc.porEstacion_W)}` : `${num(rc.plazasPrevision, 1)} plazas × 3680 W`,
      trato: rc.factor < 1 ? `${kW(rc.p_W)} (× ${num(rc.factor, 1)})` : kW(rc.p_W),
      estado: trato(estados.recarga),
      elementoId: "recarga",
    });
  }
  return filas;
}

export function piezasRebt(j: JustificacionRebt): { texto: string; acento: boolean }[] {
  const t = buscar(j, "total")!;
  const c = buscar(j, "contadores")!;
  const piezas = [{ texto: kW(t.p_W), acento: false }];
  if (j.viviendas.length > 0) piezas.push({ texto: j.viviendas.every((v) => v.grado === "elevada") ? "elevada" : j.viviendas.every((v) => v.grado === "basica") ? "básica" : "básica y elevada", acento: false });
  if (!j.unifamiliar) piezas.push({ texto: `contadores en ${UBICACION[c.ubicacion]}`, acento: c.ubicacion !== "cpm" && (!c.plantaOk || (c.exigeLocal && !c.cuarto)) });
  return piezas;
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaRebt(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "vivienda":
      return `${NOMBRE_GRADO[d.vivienda.grado]} · ${kW(d.vivienda.potencia_W)}`;
    case "viviendas":
      return `P1 ${kW(d.p_W)}`;
    case "servicios":
      return `SG ${kW(d.p_W)}`;
    case "local":
      return kW(d.p_W);
    case "garaje":
      return kW(d.p_W);
    case "recarga":
      return `VE ${kW(d.p_W)}`;
    case "total":
      return `P ${kW(d.p_W)}`;
    case "contadores":
      return `${d.n} contador${d.n === 1 ? "" : "es"}`;
    case "documentacion":
      return d.proyecto ? "proyecto" : "MTD";
  }
}

export function resultadoListaRebt(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "vivienda": {
      const v = d.vivienda;
      return `${m2(v.superficie_m2)}, ${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}: ${W(v.potencia_W)} (IGA ${v.iga_A} A)${d.unifamiliar ? "" : ` × ${v.cantidad}`}`;
    }
    case "viviendas":
      return `${d.n} viviendas, media de ${W(d.media_W)} × ${num(d.coeficiente, 1)} = ${kW(d.p_W)}`;
    case "servicios": {
      const partes = [
        ...(d.ascensor ? [`ascensor ${num(d.ascensor.kW, 1)} kW`] : []),
        ...(d.alumbrado.length > 0 ? [`alumbrado ${W(d.alumbrado.reduce((a, x) => a + x.W, 0))}`] : []),
        ...(d.otros_kW > 0 ? [`otros ${num(d.otros_kW, 1)} kW`] : []),
      ];
      return `${partes.length > 0 ? partes.join(" + ") : "nada"} = ${kW(d.p_W)}`;
    }
    case "local":
      return `${d.locales > 1 ? `${d.locales} × ` : ""}${m2(d.m2)} × ${LOCALES_REBT.datos.W_m2} W/m²${d.minimo ? `, mínimo ${W(LOCALES_REBT.datos.minimoLocal_W)}` : ""} = ${kW(d.p_W)}`;
    case "garaje":
      return d.estudiada_kW !== null
        ? `estudiada (con el control de humo): ${kW(d.p_W)}, no menos de ${d.W_m2} W/m²`
        : `${m2(d.m2)} × ${d.W_m2} W/m² (ventilación ${d.ventilacion})${d.minimo ? `, mínimo ${W(GARAJES_REBT.datos.minimo_W)}` : ""} = ${kW(d.p_W)}`;
    case "recarga":
      return d.ambito === "otros"
        ? `${d.estaciones} estación${d.estaciones === 1 ? "" : "es"} (HE 6) × ${W(d.porEstacion_W)} = ${kW(d.p_W)}`
        : `3680 W × ${num(d.plazasPrevision, 2)} plazas = ${kW(d.p5_W)} × ${num(d.factor, 1)} ${d.spl === "con_spl" ? "(colectivo con SPL)" : "(sin SPL)"} = ${kW(d.p_W)}`;
    case "total":
      return `${d.partes.map((x) => kW(x.p_W)).join(" + ")} = ${kW(d.p_W)} (${num(d.i_A, 1)} A${d.trifasica ? " a 400 V" : " a 230 V"})`;
    case "contadores":
      return `${lista(d.desglose.map(textoDesglose))}: ${d.n} contador${d.n === 1 ? "" : "es"} ${textoUbicacion(d)}${d.cuarto ? ` (${d.cuarto.plantas})` : ""}`;
    case "documentacion":
      return d.proyecto
        ? `Proyecto${d.soloAparcamiento ? " del aparcamiento" : ""} (grupo ${lista(d.grupos.map((g) => g.grupo))} de la ITC-BT-04)`
        : "Memoria técnica de diseño (ITC-BT-04 ap. 4)";
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaRebt(el: ElementoSi<unknown>, j: JustificacionRebt, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "vivienda": {
      const v = d.vivienda;
      return {
        clase: "Grado de electrificación · ITC-BT-10 ap. 2",
        titulo: el.nombre,
        valor: W(v.potencia_W).replace(" W", ""),
        unidad: `W · electrificación ${NOMBRE_GRADO[v.grado]}`,
        estado,
        manda: `La potencia a prever no es inferior a ${W(G.basica_W)} a 230 V en cada vivienda, ni a ${W(G.elevada_W)} con electrificación elevada: con previsión de calefacción eléctrica o aire acondicionado, con más de ${G.superficieElevadaMasDe_m2} m² útiles o con recarga del vehículo eléctrico en la unifamiliar. Se corresponde con el interruptor general automático.`,
        nota: v.motivos.includes("recarga") ? "Vivienda unifamiliar con garaje: lleva el circuito C13 para la recarga del vehículo eléctrico (ITC-BT-52 ap. 3.1)." : undefined,
        filas: [
          { k: "Superficie útil", v: m2(v.superficie_m2) },
          { k: "Grado", v: `${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}` },
          { k: "Potencia · IGA", v: `${W(v.potencia_W)} · ${v.iga_A} A` },
          ...(j.unifamiliar ? [] : [{ k: "Viviendas de este tipo", v: String(v.cantidad) }]),
        ],
        cita: "ITC-BT-10 ap. 2.1 y 2.2 · ITC-BT-25 ap. 2.3",
      };
    }
    case "viviendas":
      return {
        clase: "Conjunto de viviendas · ap. 3.1",
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: "kW",
        estado,
        manda: "La media aritmética de las potencias previstas en cada vivienda por el coeficiente de simultaneidad de la tabla 1, según el número de viviendas.",
        filas: [
          { k: "Viviendas", v: String(d.n) },
          { k: "Media", v: W(d.media_W) },
          { k: "Coeficiente (tabla 1)", v: num(d.coeficiente, 1) },
          { k: "Carga", v: `${W(d.media_W)} × ${num(d.coeficiente, 1)} = ${kW(d.p_W)}` },
        ],
        cita: "ITC-BT-10 ap. 3.1, tabla 1",
      };
    case "servicios":
      return {
        clase: "Servicios generales · ap. 3.2",
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: "kW · simultaneidad 1",
        estado,
        manda: "La suma de ascensores, centrales de calor y frío, grupos de presión, alumbrado de portal, escalera y espacios comunes y demás servicio eléctrico general del edificio, sin reducción por simultaneidad.",
        nota: `Ascensor y alumbrado con las cifras orientativas de la Guía BT-10 (el alumbrado, las de fluorescencia, criterio para el LED).${d.otrosIndicados ? "" : " Faltan los demás servicios (grupo de presión, central térmica, telecomunicaciones…)."}`,
        filas: [
          ...(d.ascensor ? [{ k: "Ascensor", v: `${num(d.ascensor.kW, 1)} kW${d.ascensor.kWSupuesta ? ` (${CRITERIOS_REBT.datos.ascensorHabitual}, supuesta)` : ""}` }] : []),
          ...d.alumbrado.map((a) => ({ k: a.que, v: `${m2(a.m2)} × ${a.W_m2} W/m² = ${W(a.W)}` })),
          { k: "Otros", v: d.otrosIndicados ? `${num(d.otros_kW, 1)} kW` : "sin indicar" },
        ],
        cita: "ITC-BT-10 ap. 3.2 · Guía BT-10, tabla A",
      };
    case "local":
      return {
        clase: `${d.uso === "oficinas" ? "Oficinas" : "Locales"} · ap. ${j.clasificacion === "oficinas" ? "4.1" : "3.3"}`,
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: "kW · simultaneidad 1",
        estado,
        manda: `Un mínimo de ${LOCALES_REBT.datos.W_m2} W por metro cuadrado y planta, con un mínimo por local de ${W(LOCALES_REBT.datos.minimoLocal_W)} a 230 V.`,
        nota:
          d.uso === "local_sin_uso"
            ? "Local sin actividad: se deja prevista la carga mínima; con su actividad se prevé la que pida."
            : "Sobre la superficie útil de El edificio: la ITC no precisa útil o construida (criterio).",
        filas: [
          { k: "Superficie", v: `${m2(d.m2)}${d.locales > 1 ? ` en cada una de ${d.locales} plantas` : ""}` },
          { k: "Por local", v: `${d.minimo ? `mínimo ${W(LOCALES_REBT.datos.minimoLocal_W)}` : `${m2(d.m2)} × ${LOCALES_REBT.datos.W_m2} W/m² = ${W(d.porLocal_W)}`}` },
          { k: "Carga", v: kW(d.p_W) },
        ],
        cita: `ITC-BT-10 ap. ${j.clasificacion === "oficinas" ? "4.1" : "3.3"}`,
      };
    case "garaje":
      return {
        clase: "Garaje · ap. 3.4",
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: "kW · simultaneidad 1",
        estado,
        manda: `${GARAJES_REBT.datos.natural_W_m2} W por metro cuadrado y planta con ventilación natural y ${GARAJES_REBT.datos.forzada_W_m2} W con forzada, con un mínimo de ${W(GARAJES_REBT.datos.minimo_W)}.`,
        nota: d.humo
          ? "Es un aparcamiento no abierto que controla el humo del incendio con ventilación mecánica (SI 3 ap. 8): su carga se estudia de forma específica, con los ventiladores, y no baja de los 20 W/m²."
          : `La ventilación es la de HS 3${d.deHs3 ? "" : " (la habitual)"}.`,
        filas: [
          { k: "Superficie", v: m2(d.m2) },
          { k: "Plazas", v: String(d.plazas) },
          { k: "Ventilación", v: `${d.ventilacion} · ${d.W_m2} W/m²` },
          ...(d.humo ? [{ k: "Estudiada", v: d.estudiada_kW !== null ? `${num(d.estudiada_kW, 1)} kW` : "sin indicar" }] : []),
          {
            k: "Carga",
            v: d.minimo ? `mínimo ${W(GARAJES_REBT.datos.minimo_W)}` : d.estudiada_kW !== null && d.estudiada_kW * 1000 >= d.m2 * d.W_m2 ? `la estudiada, ${kW(d.p_W)}` : `${m2(d.m2)} × ${d.W_m2} = ${kW(d.p_W)}`,
          },
        ],
        cita: "ITC-BT-10 ap. 3.4",
      };
    case "recarga":
      if (d.ambito === "otros") {
        return {
          clase: "Recarga del vehículo eléctrico · HE 6",
          titulo: el.nombre,
          valor: kW(d.p_W).replace(" kW", ""),
          unidad: "kW · × 1,0",
          estado,
          manda: `El ap. 5.2 de la ITC-BT-10 es solo de viviendas. En otros usos se prevén las estaciones que se instalan por el DB-HE (HE 6 ap. 3: una por cada 40 plazas o fracción, con más de 10 plazas), a ${W(d.porEstacion_W)} cada una, la potencia de su estación, con un factor de 1,0.`,
          nota: "Si las estaciones son de más potencia, se prevé la suya.",
          filas: [
            { k: "Plazas del garaje", v: String(d.plazas) },
            { k: "Estaciones (HE 6)", v: String(d.estaciones) },
            { k: "Carga", v: `${d.estaciones} × ${W(d.porEstacion_W)} = ${kW(d.p_W)}` },
          ],
          cita: "DB-HE · HE 6 ap. 3 · ITC-BT-52 ap. 4",
        };
      }
      return {
        clase: "Recarga del vehículo eléctrico · ap. 5.2",
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: `kW · × ${num(d.factor, 1)}`,
        estado,
        manda: `${W(RECARGA_REBT.datos.porPlaza_W)} por el 10 % de las plazas construidas, sin redondear, con un factor de simultaneidad con el resto del edificio de ${num(RECARGA_REBT.datos.factorColectivoConSpl, 1)} en el esquema colectivo con el sistema de protección de la línea general de alimentación (SPL), y de ${num(RECARGA_REBT.datos.factorSinSpl, 1)} sin él o con cualquier otro esquema.`,
        nota: `${d.indicadas ? "" : "Con el 10 % de las plazas, el mínimo reglamentario; el proyectista puede prever más. "}La Guía BT-52 (Anexo 2) recomienda, con la conducción de cables a todas las plazas (HE 6), prever ${kW(d.anexo2_W)}: recomendación, no exigencia.`,
        filas: [
          { k: "Plazas del garaje", v: String(d.plazas) },
          { k: "Plazas con previsión", v: num(d.plazasPrevision, 2) },
          { k: "P5", v: `${num(d.plazasPrevision, 2)} × ${W(RECARGA_REBT.datos.porPlaza_W)} = ${kW(d.p5_W)}` },
          { k: d.spl === "con_spl" ? "Colectivo con SPL" : "Sin SPL", v: `× ${num(d.factor, 1)} = ${kW(d.p_W)}` },
          { k: "Guía BT-52, Anexo 2", v: `${kW(d.anexo2_W)} (información)` },
        ],
        cita: "ITC-BT-10 ap. 5.2 · ITC-BT-52 ap. 4",
      };
    case "total":
      return {
        clase: `Carga total · ap. ${d.clasificacion === "oficinas" ? "4" : "3"} y 6`,
        titulo: el.nombre,
        valor: kW(d.p_W).replace(" kW", ""),
        unidad: `kW · ${num(d.i_A, 1)} A`,
        estado,
        manda:
          d.clasificacion === "unifamiliar"
            ? "La de la vivienda: con ella se calcula la derivación individual y la acometida."
            : "La suma de las viviendas, los servicios generales, los locales y oficinas, el garaje y la recarga: con ella se calculan la acometida y las instalaciones de enlace.",
        nota: d.trifasica
          ? `Intensidad trifásica a ${CRITERIOS_REBT.datos.tensionTrifasica_V} V con cos φ = ${num(CRITERIOS_REBT.datos.cosPhi, 1)}: el REBT no fija el factor de potencia (criterio).`
          : `Intensidad monofásica a ${G.tension_V} V: la distribuidora da monofásico hasta ${W(G.monofasicoMax_W)} (ap. 7).`,
        filas: d.partes.map((x) => ({ k: x.que, v: kW(x.p_W) })),
        cita: `ITC-BT-10 ap. ${d.clasificacion === "oficinas" ? "4" : "3"} y 6`,
      };
    case "contadores":
      return {
        clase: "Contadores · ITC-BT-16",
        titulo: el.nombre,
        valor: String(d.n),
        unidad: `contador${d.n === 1 ? "" : "es"} · ${UBICACION[d.ubicacion]}`,
        estado,
        manda:
          d.ubicacion === "cpm"
            ? "Un único usuario: caja de protección y medida, con los fusibles, el contador y la discriminación horaria bajo una misma envolvente."
            : `Concentrados en armario o en local, en la planta baja, el entresuelo o el primer sótano; con más de ${CONTADORES_REBT.datos.localSiMasDe} contadores, en un local exclusivo.`,
        nota: [
          d.cuarto ? `Local de contadores de El edificio en ${d.cuarto.plantas}, exclusivo: no puede ser a la vez cuarto de calderas, de contadores de agua o de telecomunicaciones.` : d.ubicacion === "armario" ? "En un armario de la zona común de la entrada (PF 30, con pasillo de 1,5 m delante)." : "",
          d.desglose.some((x) => x.que === "reserva para la recarga")
            ? "Cuenta los módulos de reserva para la recarga (ITC-BT-52 ap. 3.2 b: el 20 % de las plazas no asociadas a una vivienda, suponiendo una por vivienda; al menos uno), del lado de exigir local (criterio)."
            : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined,
        filas: d.desglose.map((x) => ({ k: x.que.charAt(0).toUpperCase() + x.que.slice(1), v: String(x.n) })),
        cita: d.ubicacion === "cpm" ? "ITC-BT-16 ap. 2.1" : "ITC-BT-16 ap. 2.2",
      };
    case "documentacion":
      return {
        clase: "Documentación · ITC-BT-04",
        titulo: el.nombre,
        valor: d.proyecto ? "Proyecto" : "MTD",
        unidad: d.soloAparcamiento ? "del aparcamiento; el resto, MTD" : d.proyecto ? "técnico titulado competente" : "memoria técnica de diseño",
        estado,
        manda: `Precisan proyecto, entre otras, las instalaciones de edificios de viviendas, locales y oficinas de más de ${PROYECTO_REBT.datos.edificioMasDe_kW} kW por caja general de protección, las de viviendas unifamiliares de más de ${PROYECTO_REBT.datos.unifamiliarMasDe_kW} kW, las de aparcamientos con ventilación forzada o con natural de más de ${PROYECTO_REBT.datos.garajeNaturalMasDe_plazas} plazas y las de recarga de más de ${PROYECTO_REBT.datos.recargaMasDe_kW} kW. Las demás, memoria técnica de diseño.`,
        nota: d.soloAparcamiento ? "El grupo del aparcamiento pide proyecto para su instalación; muchas comunidades autónomas tramitan un único proyecto del edificio." : undefined,
        filas: d.grupos.length > 0 ? d.grupos.map((g) => ({ k: `Grupo ${g.grupo}`, v: g.motivo })) : [{ k: "Ningún grupo", v: "memoria técnica de diseño" }],
        cita: "ITC-BT-04 ap. 3.1 y 4",
      };
  }
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoRebt(a: Aviso): TextoSi {
  switch (a.id) {
    case "servicios": {
      const falta = [...(a.datos.ascensor ? ["la potencia del ascensor"] : []), ...(a.datos.otros ? ["los demás servicios generales"] : [])];
      return {
        titulo: `Indica ${lista(falta)}.`,
        detalle: `${a.datos.ascensor ? `Sin la del ascensor se toman ${num(potenciaAscensorHabitual(), 1)} kW (${CRITERIOS_REBT.datos.ascensorHabitual} de la Guía BT-10: 630 kg, 1 m/s; la cabina de un ascensor accesible pide al menos 450 kg, y la tabla pasa de 400 a 630). ` : ""}${a.datos.otros ? "Suma lo que se conozca del grupo de presión, la central térmica, la ventilación, las telecomunicaciones o el alumbrado de los trasteros: sin ello, la carga se queda corta." : ""}`,
      };
    }
    case "ascensor-supuesto":
      return {
        titulo: "El ascensor no está indicado en El edificio.",
        detalle: "Se cuenta el que exige SUA 9. Indica si lo hay o no en El edificio, en la zona Portal y escalera.",
      };
    case "acs-central":
      return {
        titulo: "La producción de ACS es centralizada (HE 4).",
        detalle: "La central de ACS es parte de los servicios generales: suma su potencia eléctrica (la de la bomba de calor y sus bombas) en «otros».",
      };
    case "humo":
      return {
        titulo: "Indica la potencia del garaje con su control de humo.",
        detalle:
          "Es un aparcamiento no abierto que extrae el humo del incendio con ventiladores (SI 3 ap. 8: 150 l/s por plaza, F300 60): la ITC-BT-10 ap. 3.4 pide estudiar su carga de forma específica. Mientras, 20 W/m², que no cubren los ventiladores.",
      };
    case "garaje-oficinas":
      return {
        titulo: "El garaje de un edificio de oficinas, por analogía.",
        detalle: "El ap. 4 de la ITC-BT-10 no da cifra para el garaje: se toman las del ap. 3.4 (criterio). La recarga, por las estaciones del HE 6.",
      };
    case "centro-transformacion":
      return {
        titulo: "Más de 100 kW: reserva un local para el centro de transformación.",
        detalle:
          "En suelo urbanizado, si la potencia solicitada pasa de 100 kW, el solicitante debe reservar a la distribuidora un local cerrado y adaptado, con fácil acceso desde la vía pública y solo para el centro de transformación (RD 1048/2013, art. 26.1, al que remite el art. 13 del REBT). Si la distribuidora no lo usa en seis meses desde que se le pone a disposición, la obligación decae (art. 26.2). Coordínalo con ella.",
      };
    case "plantas":
      return {
        titulo: "Edificio de más de 12 plantas.",
        detalle: "Los contadores pueden concentrarse por plantas intermedias (cada concentración, con los de 6 o más plantas): no se comprueba aquí.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoRebt(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase !== "contadores") return null;
  if (d.exigeLocal && !d.cuarto) {
    return {
      titulo: "Falta el local de contadores.",
      detalle: `Con ${d.n} contadores, más de ${CONTADORES_REBT.datos.localSiMasDe}, la concentración va en un local exclusivo (ITC-BT-16 ap. 2.2). Añade en El edificio un cuarto de instalaciones de «contadores de electricidad» en la planta baja o el primer sótano.`,
    };
  }
  return {
    titulo: "El local de contadores no está en su planta.",
    detalle: `Está en ${d.cuarto?.plantas ?? "otra planta"}: en un edificio de hasta 12 plantas va en la planta baja, el entresuelo o el primer sótano (ITC-BT-16 ap. 2.2).`,
  };
}

export function describirDibujoRebt(j: JustificacionRebt): string {
  const t = buscar(j, "total")!;
  return j.unifamiliar
    ? `Sección de la vivienda con su grado de electrificación: ${W(t.p_W)}.`
    : `Sección del edificio con la previsión de cargas de cada zona: ${kW(t.p_W)} en total.`;
}
