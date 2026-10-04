// =============================================================================
// DB-SUA, SUA 6 — La justificación (feature-20): la piscina comunitaria (barrera,
// profundidades, señalización, pendientes, fondo, andén y escaleras) y los pozos
// y depósitos. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua6-sua8.md, bloques A y C1):
//   - el ap. 1 se aplica a las piscinas de uso colectivo; la de una comunidad de
//     propietarios lo es (A.2, interpretación respaldada por un comentario); la
//     de la unifamiliar queda excluida (A.1);
//   - el ap. 2 (pozos y depósitos) no se limita a las piscinas: se declara
//     siempre, también sin piscina o en la unifamiliar (A.5, A.6);
//   - la piscina no está en El edificio: solo se sabe si la hay (Datos de la
//     obra). Lo demás son decisiones con lo habitual (K1, K2).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { HABITUAL_SUA6, resolverSua6, type Acceso, type DecisionesSua6, type Escaleras, type Sua6Estado, type Vasos } from "./estado";
import { SUA6_ANDEN, SUA6_BARRERA, SUA6_ESCALERAS, SUA6_VASO } from "./tablas";

const V = SUA6_VASO.datos;

/** Por qué no se aplica el ap. 1: no hay piscina, o es de la unifamiliar. */
export type MotivoNoAplica = "sin_piscina" | "unifamiliar";

export type DetalleSua6 =
  | { clase: "ambito"; motivo: MotivoNoAplica }
  | { clase: "acceso"; acceso: Acceso; altura_m: number; cumple: boolean }
  | {
      clase: "profundidad";
      min_m: number;
      max_m: number;
      /** ≤ 3 m. */
      maxCumple: boolean;
      /** Hay zona de profundidad menor que 1,40 m. */
      someraCumple: boolean;
    }
  | { clase: "infantil"; max_m: number; cumple: boolean }
  | {
      clase: "senalizacion";
      /** Profundidad mínima y máxima de la piscina (de todos sus vasos). */
      min_m: number;
      max_m: number;
      /** Hay puntos de más de 1,40 m que señalizar. */
      supera: boolean;
    }
  | { clase: "pendientes"; vasos: Vasos }
  | {
      clase: "fondo";
      max_m: number;
      /** Todo el fondo tiene profundidad de 1,50 m o menos: todo de clase 3. */
      todo: boolean;
    }
  | { clase: "anden"; hay: boolean; anchura_m: number; cumple: boolean }
  | { clase: "escaleras"; escaleras: Escaleras; separacion_m: number; cumple: boolean }
  | { clase: "pozos"; hay: boolean };

export type ElementoSua6 = ElementoSi<DetalleSua6>;

export interface JustificacionSua6 extends JustificacionSiBase {
  elementos: ElementoSua6[];
  decisiones: DecisionesSua6;
  habituales: DecisionesSua6;
  /** Se aplica el ap. 1 (hay piscina de uso colectivo). */
  aplica: boolean;
  motivo: MotivoNoAplica | null;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Una cifra del proyectista: positiva y finita, o la habitual. */
function cifra(v: number, habitual: number): number {
  return Number.isFinite(v) && v > 0 ? r2(v) : habitual;
}

export function justificarSua6(estado: Sua6Estado, p: ProyectoSi): JustificacionSua6 {
  const e = edificioSua(p.edificio);
  const habituales = HABITUAL_SUA6;
  const d0 = resolverSua6(estado, habituales);
  // Las profundidades del recreo, ordenadas: la mínima no puede ser mayor que la máxima.
  const a = cifra(d0.profMin_m, habituales.profMin_m);
  const b = cifra(d0.profMax_m, habituales.profMax_m);
  const decisiones: DecisionesSua6 = {
    ...d0,
    barrera_m: cifra(d0.barrera_m, habituales.barrera_m),
    profMin_m: Math.min(a, b),
    profMax_m: Math.max(a, b),
    profInfantil_m: cifra(d0.profInfantil_m, habituales.profInfantil_m),
    anden_m: cifra(d0.anden_m, habituales.anden_m),
    separacion_m: cifra(d0.separacion_m, habituales.separacion_m),
  };
  const d = decisiones;
  const avisos: Aviso[] = [];
  const elementos: ElementoSua6[] = [];

  const motivo: MotivoNoAplica | null = !p.datosGenerales.tienePiscina ? "sin_piscina" : e.unifamiliar ? "unifamiliar" : null;

  if (motivo) {
    elementos.push({
      id: "ambito",
      nombre: "Piscina de uso colectivo",
      tipo: "ambito",
      veredicto: "dato",
      valor: { texto: motivo === "sin_piscina" ? "no hay" : "de la unifamiliar" },
      manda: { tipo: "dato_de_partida", fuente: motivo === "sin_piscina" ? "Datos de la obra" : "El edificio" },
      cita: ["SUA 6 · ap. 1 pto 1"],
      detalle: { clase: "ambito", motivo },
    });
  } else {
    const recreo = d.vasos !== "infantil";
    const infantil = d.vasos !== "recreo";

    // ── 1.1 Barrera o acceso controlado ─────────────────────────────────────
    const barrera = d.acceso === "barrera";
    const alturaOk = d.barrera_m >= SUA6_BARRERA.datos.alturaMin_m;
    elementos.push({
      id: "acceso",
      nombre: barrera ? "Barrera de protección" : "Acceso de niños controlado",
      tipo: "barrera",
      veredicto: barrera && !alturaOk ? "fail" : "ok",
      valor: barrera ? { valor: d.barrera_m, unidad: "m" } : { texto: "controlado" },
      ...(barrera ? { limite: { valor: SUA6_BARRERA.datos.alturaMin_m, unidad: "m" } } : {}),
      manda: { tipo: "decision_proyectista", decision: d.acceso },
      cita: ["SUA 6 · ap. 1.1"],
      detalle: { clase: "acceso", acceso: d.acceso, altura_m: d.barrera_m, cumple: !barrera || alturaOk },
    });
    if (!barrera) avisos.push({ id: "acceso-controlado", tipo: "caso_especial", elementoId: "acceso", datos: {} });

    // ── 1.2.1 Profundidad ───────────────────────────────────────────────────
    if (recreo) {
      const maxCumple = d.profMax_m <= V.restoMax_m;
      const someraCumple = d.profMin_m < V.zonaSomeraMenorQue_m;
      elementos.push({
        id: "profundidad",
        nombre: "Profundidad del vaso",
        tipo: "vaso",
        veredicto: maxCumple && someraCumple ? "ok" : "fail",
        valor: { valor: d.profMax_m, unidad: "m" },
        limite: { valor: V.restoMax_m, unidad: "m" },
        manda: { tipo: "decision_proyectista", decision: "profundidad" },
        cita: ["SUA 6 · ap. 1.2.1"],
        detalle: { clase: "profundidad", min_m: d.profMin_m, max_m: d.profMax_m, maxCumple, someraCumple },
      });
    }
    if (infantil) {
      const cumple = d.profInfantil_m <= V.infantilMax_m;
      elementos.push({
        id: "infantil",
        nombre: "Profundidad del vaso infantil",
        tipo: "vaso",
        veredicto: cumple ? "ok" : "fail",
        valor: { valor: d.profInfantil_m, unidad: "m" },
        limite: { valor: V.infantilMax_m, unidad: "m" },
        manda: { tipo: "decision_proyectista", decision: "profundidad infantil" },
        cita: ["SUA 6 · ap. 1.2.1"],
        detalle: { clase: "infantil", max_m: d.profInfantil_m, cumple },
      });
    }

    // ── 1.2.1 Señalización ──────────────────────────────────────────────────
    const maxPiscina = recreo ? d.profMax_m : d.profInfantil_m;
    const minPiscina = infantil ? d.profInfantil_m : d.profMin_m;
    const supera = maxPiscina > V.senalizarSiSupera_m;
    elementos.push({
      id: "senalizacion",
      nombre: "Señalización de la profundidad",
      tipo: "senalizacion",
      veredicto: "ok",
      valor: { texto: supera ? "más de 1,40 m" : "máxima y mínima" },
      manda: { tipo: "decision_proyectista", decision: "señalización" },
      cita: ["SUA 6 · ap. 1.2.1"],
      detalle: { clase: "senalizacion", min_m: minPiscina, max_m: maxPiscina, supera },
    });

    // ── 1.2.2 Pendientes y 1.2.4 fondo ─────────────────────────────────────
    elementos.push({
      id: "pendientes",
      nombre: "Pendiente del fondo",
      tipo: "vaso",
      veredicto: "ok",
      valor: { texto: recreo ? `≤ ${V.pendienteHasta140_pct} % · ≤ ${V.pendienteResto_pct} %` : `≤ ${V.pendienteInfantil_pct} %` },
      manda: { tipo: "decision_proyectista", decision: "pendientes" },
      cita: ["SUA 6 · ap. 1.2.2"],
      detalle: { clase: "pendientes", vasos: d.vasos },
    });
    elementos.push({
      id: "fondo",
      nombre: "Material del fondo",
      tipo: "vaso",
      veredicto: "ok",
      valor: { texto: `clase ${V.claseFondo}` },
      manda: { tipo: "decision_proyectista", decision: "fondo" },
      cita: ["SUA 6 · ap. 1.2.4"],
      detalle: { clase: "fondo", max_m: maxPiscina, todo: maxPiscina <= V.fondoHasta_m },
    });

    // ── 1.3 Andén ───────────────────────────────────────────────────────────
    const hayAnden = d.anden === "si";
    const andenOk = !hayAnden || d.anden_m >= SUA6_ANDEN.datos.anchuraMin_m;
    elementos.push({
      id: "anden",
      nombre: "Andén",
      tipo: "anden",
      veredicto: !hayAnden ? "dato" : andenOk ? "ok" : "fail",
      valor: hayAnden ? { valor: d.anden_m, unidad: "m" } : { texto: "no hay" },
      ...(hayAnden ? { limite: { valor: SUA6_ANDEN.datos.anchuraMin_m, unidad: "m" } } : {}),
      manda: { tipo: "decision_proyectista", decision: hayAnden ? "andén" : "sin andén" },
      cita: ["SUA 6 · ap. 1.3"],
      detalle: { clase: "anden", hay: hayAnden, anchura_m: d.anden_m, cumple: andenOk },
    });

    // ── 1.4 Escaleras (excepto en las piscinas infantiles) ──────────────────
    if (recreo) {
      const cumple = d.separacion_m <= SUA6_ESCALERAS.datos.separacionMax_m;
      elementos.push({
        id: "escaleras",
        nombre: "Escaleras del vaso",
        tipo: "escaleras",
        veredicto: cumple ? "ok" : "fail",
        valor: { valor: d.separacion_m, unidad: "m" },
        limite: { valor: SUA6_ESCALERAS.datos.separacionMax_m, unidad: "m" },
        manda: { tipo: "decision_proyectista", decision: d.escaleras },
        cita: ["SUA 6 · ap. 1.4"],
        detalle: { clase: "escaleras", escaleras: d.escaleras, separacion_m: d.separacion_m, cumple },
      });
    }
  }

  // ── 2 Pozos y depósitos: siempre ────────────────────────────────────────
  const pozos = d.pozos === "si";
  elementos.push({
    id: "pozos",
    nombre: "Pozos y depósitos",
    tipo: "pozos",
    veredicto: pozos ? "ok" : "dato",
    valor: { texto: pozos ? "tapa y cierre" : "no hay" },
    manda: { tipo: "decision_proyectista", decision: d.pozos },
    cita: ["SUA 6 · ap. 2"],
    detalle: { clase: "pozos", hay: pozos },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones, habituales, aplica: motivo === null, motivo };
}
