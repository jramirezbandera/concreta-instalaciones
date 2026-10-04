// =============================================================================
// DB-SI, SI 3 — Evacuación de ocupantes (feature-19): la ocupación de cada zona
// (tabla 2.1), las salidas de planta y la longitud de los recorridos (tabla 3.1),
// la protección y la capacidad de las escaleras (tablas 5.1, 4.1 y 4.2), las
// puertas, la señalización, el control del humo del garaje y la evacuación de
// personas con discapacidad. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-si3.md):
//   - el recorrido empieza en la puerta de la vivienda (su interior no es origen
//     de evacuación): la unifamiliar no tiene recorridos;
//   - una escalera no protegida ni compartimentada no es salida de planta: el
//     recorrido sigue por ella hasta la salida del edificio (B3.18);
//   - una sola salida exige a la vez ocupación, recorrido y altura (tabla 3.1);
//   - la escalera del garaje es siempre especialmente protegida (tabla 5.1);
//   - el garaje bajo rasante no es aparcamiento abierto: control de humo (ap. 8);
//   - el local sin uso, asimilado a Comercial, tiene salidas propias (ap. 1).
// El recorrido no se estima: sin medirlo, se dice el límite y se avisa (C1).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { DENSIDADES_SI3 } from "../../lib/edificio/tablas";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi, type EdificioSi, type ZonaSi } from "../si/edificio";
import { compartimentar, type Compartimentacion } from "../si/sectores";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { ANCHURA_ESCALERA_HABITUAL_m, resolverSi3, type DecisionesSi3, type Si3Estado } from "./estado";
import {
  capacidadProtegida,
  DENSIDADES_EXTRA,
  DIMENSIONADO_TABLA_4_1,
  DISCAPACIDAD_SI3,
  HUMO_SI3,
  PROTECCION_TABLA_5_1,
  PUERTAS_SI3,
  SALIDAS_TABLA_3_1,
  type ProteccionEscalera,
} from "./tablas";

/** Ocupación de una zona en cada planta y para todo el grupo. */
export interface OcupacionZona {
  zona: ZonaSi;
  densidad_m2: number | null;
  porPlanta: number;
  total: number;
}

export type DetalleSi3 =
  | { clase: "ocupacion"; zonas: OcupacionZona[]; total: number; unifamiliar: boolean }
  | {
      clase: "salidas";
      /** La planta con más ocupantes y los que tiene. */
      plantaMayor: string;
      pPlanta: number;
      /** Los que salen por el portal (viviendas y garaje). */
      pSalida: number;
      residencial: boolean;
      h_m: number;
      recorrido_m: number | null;
      limite_m: number;
      /** Hasta dónde se mide: con escalera no protegida, hasta la salida del edificio. */
      hastaEdificio: boolean;
      fallos: ("ocupacion" | "ocupacion_edificio" | "altura" | "recorrido")[];
    }
  | { clase: "garaje"; pPlanta: number; recorrido_m: number | null; limite_m: number; hAsc_m: number; fallos: ("ocupacion" | "recorrido" | "altura")[] }
  | {
      clase: "escalera";
      proteccion: ProteccionEscalera;
      exigida: ProteccionEscalera;
      h_m: number;
      anchura_m: number;
      /** Ocupantes que bajan por ella y su capacidad. */
      p: number;
      capacidad: number;
      plantas: number;
    }
  | { clase: "escalera_garaje"; p: number; capacidad: number; plantas: number; hAsc_m: number }
  | { clase: "puertas"; pSalida: number; anchura_m: number; sentidoEvacuacion: boolean; garaje: boolean }
  | { clase: "senalizacion"; residencial: boolean; garaje: boolean }
  | { clase: "humo"; ventilacion: "mecanica" | "natural"; plazas: number; extraccion_l_s: number; aportacion_l_s: number; compuertas: boolean }
  | { clase: "discapacidad"; exige: boolean; motivo: string | null }
  | { clase: "unifamiliar"; garaje: boolean }
  | { clase: "local"; zona: ZonaSi; p: number };

export type ElementoSi3 = ElementoSi<DetalleSi3>;

export interface JustificacionSi3 extends JustificacionSiBase {
  elementos: ElementoSi3[];
  decisiones: DecisionesSi3;
  habituales: DecisionesSi3;
  comp: Compartimentacion;
  /** Hay escalera común que se decide (no en la unifamiliar ni en un edificio de una planta). */
  conEscalera: boolean;
  conGaraje: boolean;
}

const RANGO: Record<ProteccionEscalera, number> = { no_protegida: 0, compartimentada: 0, protegida: 1, especialmente_protegida: 2 };

/** La protección mínima de la tabla 5.1 para una altura de evacuación descendente. */
export function proteccionExigida(h_m: number): ProteccionEscalera {
  const t = PROTECCION_TABLA_5_1.datos.residencial;
  if (h_m <= t.noProtegida_m) return "no_protegida";
  if (h_m <= t.protegida_m) return "protegida";
  return "especialmente_protegida";
}

function ocupacionDe(e: EdificioSi, z: ZonaSi): OcupacionZona {
  const d = DENSIDADES_SI3.datos;
  let densidad: number | null = null;
  switch (z.uso) {
    case "viviendas":
    case "vivienda_unifamiliar":
      densidad = d.residencialVivienda;
      break;
    case "oficinas":
      densidad = d.administrativoOficinas;
      break;
    case "vestibulo":
      densidad = e.usoPrincipal === "administrativo" ? d.administrativoVestibulos : null;
      break;
    case "garaje":
      densidad = e.resumen.tieneOficinas && !e.resumen.tieneViviendas ? d.aparcamientoConHorario : d.aparcamientoOtros;
      break;
    case "local_sin_uso":
      densidad = z.bajoRasante || z.niveles.includes(0) ? DENSIDADES_EXTRA.datos.comercialBaja : DENSIDADES_EXTRA.datos.comercialOtras;
      break;
    default:
      densidad = null;
  }
  const porPlanta = densidad ? Math.ceil(z.util_m2 / densidad) : 0;
  return { zona: z, densidad_m2: densidad, porPlanta, total: porPlanta * z.repeticiones };
}

export function habitualesSi3(e: EdificioSi): DecisionesSi3 {
  const garajeBajo = e.zonas.some((z) => z.uso === "garaje" && z.bajoRasante);
  return {
    escalera: proteccionExigida(e.alturaEvacuacion_m),
    anchuraEscalera_m: ANCHURA_ESCALERA_HABITUAL_m,
    ventilacionGaraje: garajeBajo ? "mecanica" : "natural",
  };
}

export function justificarSi3(estado: Si3Estado, p: ProyectoSi): JustificacionSi3 {
  const e = edificioSi(p.edificio);
  const c = compartimentar(e);
  const habituales = habitualesSi3(e);
  const d = resolverSi3(estado, habituales);
  const T = SALIDAS_TABLA_3_1.datos;
  const elementos: ElementoSi3[] = [];
  const avisos: Aviso[] = [];
  const unifamiliar = e.resumen.esUnifamiliar;
  const h = e.alturaEvacuacion_m;
  const residencial = e.usoPrincipal === "residencial_vivienda";

  // ── Ocupación ─────────────────────────────────────────────────────────────
  const ocup = e.zonas.map((z) => ocupacionDe(e, z));
  const total = ocup.reduce((a, o) => a + (o.zona.uso === "local_sin_uso" ? 0 : o.total), 0);
  elementos.push({
    id: "ocupacion",
    nombre: "Ocupación",
    tipo: "dato",
    veredicto: "dato",
    valor: { valor: total, unidad: "personas" },
    manda: { tipo: "dato_de_partida", fuente: "El edificio y la tabla 2.1" },
    cita: ["SI 3 · tabla 2.1", "ap. 2"],
    detalle: { clase: "ocupacion", zonas: ocup, total, unifamiliar },
  });

  const aparcamiento = c.riesgo.aparcamiento;
  const ocupGaraje = ocup.filter((o) => aparcamiento?.zonas.some((z) => z.id === o.zona.id));
  const pGaraje = ocupGaraje.reduce((a, o) => a + o.total, 0);

  if (unifamiliar) {
    const garaje = e.zonas.some((z) => z.uso === "garaje_privado" || z.uso === "garaje");
    elementos.push({
      id: "unifamiliar",
      nombre: "Recorridos de evacuación",
      tipo: "salidas",
      veredicto: "ok",
      valor: { texto: "no hay" },
      manda: { tipo: "dato_de_partida", fuente: "Anejo SI A" },
      cita: ["Anejo SI A · origen de evacuación", "SI 1 · tabla 2.2, nota 5"],
      detalle: { clase: "unifamiliar", garaje },
    });
  }

  // ── Salidas y recorridos de las plantas del uso principal ─────────────────
  const conEscalera = !unifamiliar && e.plantas.filter((pl) => pl.nivel > 0).length > 0;
  if (!unifamiliar) {
    const principalIds = new Set(c.principal.zonas.map((z) => z.id));
    const porNivel = new Map<number, number>();
    for (const o of ocup) {
      if (!principalIds.has(o.zona.id)) continue;
      for (const n of o.zona.niveles) porNivel.set(n, (porNivel.get(n) ?? 0) + o.porPlanta);
    }
    let plantaMayor = "PB";
    let pPlanta = 0;
    for (const [n, pp] of porNivel) {
      if (pp > pPlanta) {
        pPlanta = pp;
        plantaMayor = e.plantas.find((x) => x.nivel === n)?.etiqueta ?? String(n);
      }
    }
    const pPrincipal = ocup.filter((o) => principalIds.has(o.zona.id)).reduce((a, o) => a + o.total, 0);
    const pSalida = pPrincipal + pGaraje;
    const hastaEdificio = d.escalera === "no_protegida" && conEscalera;
    const limite_m = T.unaSalida.recorridoMax_m;
    const fallos: Extract<DetalleSi3, { clase: "salidas" }>["fallos"] = [];
    if (pPlanta > T.unaSalida.ocupacionMax) fallos.push("ocupacion");
    if (residencial && pSalida > T.unaSalida.ocupacionEdificioViviendasMax) fallos.push("ocupacion_edificio");
    if (h > T.unaSalida.alturaDescendenteMax_m) fallos.push("altura");
    if (estado.recorrido_m !== null && estado.recorrido_m > limite_m) fallos.push("recorrido");
    elementos.push({
      id: "salidas",
      nombre: residencial ? "Salidas de las plantas de viviendas" : "Salidas de las plantas",
      tipo: "salidas",
      veredicto: fallos.length > 0 ? "fail" : "ok",
      valor: estado.recorrido_m !== null ? { valor: estado.recorrido_m, unidad: "m" } : { texto: `≤ ${limite_m} m` },
      limite: { valor: limite_m, unidad: "m" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.1", entradas: [{ k: "Salidas de planta", v: "1" }, { k: "Ocupación de la planta", v: String(pPlanta) }] },
      cita: ["SI 3 · tabla 3.1", "ap. 3"],
      detalle: { clase: "salidas", plantaMayor, pPlanta, pSalida, residencial, h_m: h, recorrido_m: estado.recorrido_m, limite_m, hastaEdificio, fallos },
    });
    if (estado.recorrido_m === null) avisos.push({ id: "recorrido", tipo: "supuesto", elementoId: "salidas", datos: { hastaEdificio, limite_m } });

    // ── La escalera ─────────────────────────────────────────────────────────
    if (conEscalera) {
      const exigida = proteccionExigida(h);
      const plantasArriba = e.plantas.filter((pl) => pl.nivel > 0).map((pl) => pl.nivel);
      const pEscalera = ocup
        .filter((o) => principalIds.has(o.zona.id))
        .reduce((a, o) => a + o.porPlanta * o.zona.niveles.filter((n) => plantasArriba.includes(n)).length, 0);
      const capacidad =
        d.escalera === "protegida" || d.escalera === "especialmente_protegida"
          ? capacidadProtegida(d.anchuraEscalera_m, plantasArriba.length)
          : Math.floor(DIMENSIONADO_TABLA_4_1.datos.escaleraDescendenteDivisor * d.anchuraEscalera_m);
      const insuficiente = RANGO[d.escalera] < RANGO[exigida] || (d.escalera === "compartimentada" && exigida !== "no_protegida");
      elementos.push({
        id: "escalera",
        nombre: "Escalera",
        tipo: "escalera",
        veredicto: insuficiente || capacidad < pEscalera ? "fail" : "ok",
        valor: { texto: d.escalera.replace("_", " ") },
        manda: { tipo: "grado_tabla", tabla: "Tabla 5.1", entradas: [{ k: "Uso", v: residencial ? "Residencial Vivienda" : "Administrativo" }, { k: "h", v: `${h} m` }] },
        cita: ["SI 3 · tablas 5.1, 4.1 y 4.2", "ap. 4 y 5"],
        detalle: { clase: "escalera", proteccion: d.escalera, exigida, h_m: h, anchura_m: d.anchuraEscalera_m, p: pEscalera, capacidad, plantas: plantasArriba.length },
      });
    }

    // ── Puertas de salida ───────────────────────────────────────────────────
    const P = PUERTAS_SI3.datos;
    const anchura_m = Math.max(DIMENSIONADO_TABLA_4_1.datos.puertaMin_m, Math.ceil((pSalida / DIMENSIONADO_TABLA_4_1.datos.puertaDivisor) * 100) / 100);
    elementos.push({
      id: "puertas",
      nombre: "Puerta de salida del edificio",
      tipo: "puerta",
      veredicto: "ok",
      valor: { valor: anchura_m, unidad: "m" },
      manda: { tipo: "formula", formula: "A ≥ P/200 ≥ 0,80 m", resultado: { valor: anchura_m, unidad: "m" } },
      cita: ["SI 3 · tabla 4.1", "ap. 6"],
      detalle: { clase: "puertas", pSalida, anchura_m, sentidoEvacuacion: pSalida > (residencial ? P.sentidoViviendas : P.sentidoOtros), garaje: aparcamiento !== null },
    });
  }

  // ── El garaje ─────────────────────────────────────────────────────────────
  if (aparcamiento) {
    const pPlantaGaraje = Math.max(0, ...ocupGaraje.map((o) => o.porPlanta));
    const limite_m = T.unaSalida.recorridoAparcamiento_m;
    const hAsc = e.alturaAscendente_m;
    const fallos: Extract<DetalleSi3, { clase: "garaje" }>["fallos"] = [];
    if (pPlantaGaraje > T.unaSalida.ocupacionMax) fallos.push("ocupacion");
    if (estado.recorridoGaraje_m !== null && estado.recorridoGaraje_m > limite_m) fallos.push("recorrido");
    if (hAsc > T.unaSalida.alturaAscendenteMax_m) fallos.push("altura");
    elementos.push({
      id: "garaje",
      nombre: "Salida del garaje",
      tipo: "salidas",
      veredicto: fallos.length > 0 ? "fail" : "ok",
      valor: estado.recorridoGaraje_m !== null ? { valor: estado.recorridoGaraje_m, unidad: "m" } : { texto: `≤ ${limite_m} m` },
      limite: { valor: limite_m, unidad: "m" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.1", entradas: [{ k: "Uso", v: "Aparcamiento" }, { k: "Ocupación", v: String(pPlantaGaraje) }] },
      cita: ["SI 3 · tabla 3.1"],
      detalle: { clase: "garaje", pPlanta: pPlantaGaraje, recorrido_m: estado.recorridoGaraje_m, limite_m, hAsc_m: hAsc, fallos },
    });
    if (estado.recorridoGaraje_m === null) avisos.push({ id: "recorrido-garaje", tipo: "supuesto", elementoId: "garaje", datos: { limite_m } });

    const plantasGaraje = new Set(aparcamiento.zonas.flatMap((z) => z.niveles)).size;
    elementos.push({
      id: "escalera-garaje",
      nombre: "Escalera del garaje",
      tipo: "escalera",
      veredicto: "ok",
      valor: { texto: "especialmente protegida" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 5.1", entradas: [{ k: "Uso", v: "Aparcamiento" }] },
      cita: ["SI 3 · tabla 5.1", "SI 1 · tabla 1.1"],
      detalle: { clase: "escalera_garaje", p: pGaraje, capacidad: capacidadProtegida(d.anchuraEscalera_m, plantasGaraje), plantas: plantasGaraje, hAsc_m: e.alturaAscendente_m },
    });

    if (aparcamiento.zonas.some((z) => z.bajoRasante)) {
      const H = HUMO_SI3.datos;
      const plazas = aparcamiento.zonas.reduce((a, z) => a + Math.max(0, Math.trunc(z.zona.plazas ?? 0)) * z.repeticiones, 0);
      const alturaMax = Math.max(0, ...e.plantas.filter((pl) => aparcamiento.zonas.some((z) => z.niveles.includes(pl.nivel))).map((pl) => pl.altura_m));
      elementos.push({
        id: "humo",
        nombre: "Control del humo del garaje",
        tipo: "humo",
        veredicto: "ok",
        valor: d.ventilacionGaraje === "mecanica" ? { valor: plazas * H.extraccion_l_s_plaza, unidad: "l/s" } : { texto: "ventilación natural (HS 3)" },
        manda: { tipo: "caudal_por_unidad", tabla: "SI 3 ap. 8", unidades: { valor: plazas, unidad: "plazas" }, porUnidad: { valor: H.extraccion_l_s_plaza, unidad: "l/s" } },
        cita: ["SI 3 · ap. 8", "DB-HS 3"],
        detalle: {
          clase: "humo",
          ventilacion: d.ventilacionGaraje,
          plazas,
          extraccion_l_s: plazas * H.extraccion_l_s_plaza,
          aportacion_l_s: plazas * H.aportacionMax_l_s_plaza,
          compuertas: alturaMax > H.alturaCompuertas_m,
        },
      });
    }
  }

  if (!unifamiliar) {
    elementos.push({
      id: "senalizacion",
      nombre: "Señalización",
      tipo: "senalizacion",
      veredicto: "ok",
      valor: { texto: "UNE 23034" },
      manda: { tipo: "dato_de_partida", fuente: "SI 3 ap. 7" },
      cita: ["SI 3 · ap. 7"],
      detalle: { clase: "senalizacion", residencial, garaje: aparcamiento !== null },
    });
  }

  // ── Personas con discapacidad ─────────────────────────────────────────────
  const D = DISCAPACIDAD_SI3.datos;
  const garajeGrande = (aparcamiento?.zonas ?? []).some((z) => z.construida.valor > D.plantaAparcamiento_m2);
  const motivo =
    residencial && h > D.residencialH_m
      ? `altura de evacuación > ${D.residencialH_m} m`
      : e.usoPrincipal === "administrativo" && h > D.administrativoH_m
        ? `altura de evacuación > ${D.administrativoH_m} m`
        : garajeGrande
          ? `planta de garaje > ${D.plantaAparcamiento_m2} m²`
          : null;
  if (!unifamiliar) {
    elementos.push({
      id: "discapacidad",
      nombre: "Personas con discapacidad",
      tipo: "discapacidad",
      veredicto: "ok",
      valor: { texto: motivo ? "zona de refugio o sector alternativo" : "itinerario accesible en la salida" },
      manda: { tipo: "dato_de_partida", fuente: "SI 3 ap. 9" },
      cita: ["SI 3 · ap. 9"],
      detalle: { clase: "discapacidad", exige: motivo !== null, motivo },
    });
  }

  // ── El local sin uso: salidas propias ─────────────────────────────────────
  for (const o of ocup.filter((x) => x.zona.uso === "local_sin_uso")) {
    elementos.push({
      id: `local-${o.zona.id}`,
      nombre: "Local sin uso",
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "salidas propias" },
      manda: { tipo: "decision_proyectista", decision: "previsto" },
      cita: ["SI 3 · ap. 1"],
      detalle: { clase: "local", zona: o.zona, p: o.total },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales, comp: c, conEscalera, conGaraje: aparcamiento !== null };
}
