// =============================================================================
// DB-SI, SI 2 — Propagación exterior (feature-19): la resistencia de las
// medianeras, las franjas de fachada entre sectores (vertical y horizontal), la
// reacción al fuego de la fachada por su altura y lo que pide la cubierta. Los
// sectores salen del núcleo común (los mismos de SI 1). PURA y DETERMINISTA.
//
// Lecturas (research/verificacion-si1-si2.md, bloques A7 y A8):
//   - las franjas solo se exigen entre sectores distintos (no entre viviendas de
//     un mismo sector), desde un local de riesgo alto o hacia una escalera o un
//     pasillo protegido;
//   - la altura de la fachada es su altura total, no la de evacuación (criterio
//     C8: hasta la coronación, como en HS1; se avisa si un peto cruza un umbral);
//   - un garaje bajo rasante no tiene fachada.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import { compartimentar, type Compartimentacion, type SectorSi } from "../si/sectores";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { ANGULO_ENCUENTRO, habitualesSi2, resolverSi2, type DecisionesSi2, type Si2Estado } from "./estado";
import { claseFachada, distanciaAngulo, FACHADAS_SI2 } from "./tablas";

/** Altura habitual de un peto, para avisar cerca de los umbrales de altura de fachada (criterio, como en HS1). */
export const PETO_m = 1.1;

/** Dónde se encuentran dos sectores en la fachada. */
export interface Encuentro {
  /** «PB y P1», «PB». */
  donde: string;
  /** «el local y las viviendas». */
  entre: [SectorSi, SectorSi];
  /** Nivel de la planta de abajo (vertical) o de la planta (horizontal). */
  nivel: number;
}

export type DetalleSi2 =
  | { clase: "medianeras"; tiene: boolean }
  | { clase: "vertical"; encuentros: Encuentro[]; porPlantas: boolean }
  | { clase: "horizontal"; encuentros: Encuentro[]; alfa: number; d_m: number }
  | { clase: "reaccion"; altura_m: number; sistemas: string; aislante: string | null; arranque: boolean }
  | { clase: "cubierta"; medianeras: boolean };

export type ElementoSi2 = ElementoSi<DetalleSi2>;

export interface JustificacionSi2 extends JustificacionSiBase {
  elementos: ElementoSi2[];
  decisiones: DecisionesSi2;
  habituales: DecisionesSi2;
  comp: Compartimentacion;
  altura_m: number;
}

function sectorEn(c: Compartimentacion, nivel: number): SectorSi[] {
  return c.sectores.filter((s) => s.zonas.some((z) => z.niveles.includes(nivel)));
}

export function justificarSi2(estado: Si2Estado, p: ProyectoSi): JustificacionSi2 {
  const e = edificioSi(p.edificio);
  const c = compartimentar(e);
  const unifamiliar = e.resumen.esUnifamiliar;
  const d = resolverSi2(estado, unifamiliar);
  const F = FACHADAS_SI2.datos;
  const elementos: ElementoSi2[] = [];
  const avisos: Aviso[] = [];
  const etiqueta = (n: number) => e.plantas.find((x) => x.nivel === n)?.etiqueta ?? String(n);

  // ── Medianeras ────────────────────────────────────────────────────────────
  const conMedianeras = d.medianeras === "si";
  elementos.push({
    id: "medianeras",
    nombre: "Medianeras",
    tipo: "medianera",
    veredicto: "ok",
    valor: { texto: conMedianeras ? `EI ${F.medianeria_EI}` : "no tiene" },
    manda: { tipo: "decision_proyectista", decision: d.medianeras },
    cita: ["SI 2 · ap. 1 pto 1"],
    detalle: { clase: "medianeras", tiene: conMedianeras },
  });

  // ── Encuentros de sectores en fachada ─────────────────────────────────────
  const sobre = e.plantas.filter((x) => x.nivel >= 0).map((x) => x.nivel).sort((a, b) => a - b);
  const verticales: Encuentro[] = [];
  const horizontales: Encuentro[] = [];
  for (const n of sobre) {
    const aqui = sectorEn(c, n);
    if (aqui.length > 1) horizontales.push({ donde: etiqueta(n), entre: [aqui[0], aqui[1]], nivel: n });
    const arriba = sectorEn(c, n + 1);
    for (const a of aqui) {
      for (const b of arriba) {
        if (a.id !== b.id) verticales.push({ donde: `${etiqueta(n)} y ${etiqueta(n + 1)}`, entre: [a, b], nivel: n });
      }
    }
  }
  // Sectores por plantas: cada forjado entre plantas del sector principal separa sectores.
  const porPlantas = c.principal.porPlantas;
  if (verticales.length > 0 || porPlantas) {
    elementos.push({
      id: "vertical",
      nombre: "Franja vertical",
      tipo: "fachada",
      veredicto: "ok",
      valor: { texto: `EI ${F.franja_EI} · ${F.franjaAltura_m.toFixed(2).replace(".", ",")} m` },
      manda: { tipo: "grado_tabla", tabla: "SI 2 ap. 1 pto 3", entradas: verticales.map((v) => ({ k: v.donde, v: `${v.entre[0].id} / ${v.entre[1].id}` })) },
      cita: ["SI 2 · ap. 1 pto 3"],
      detalle: { clase: "vertical", encuentros: verticales, porPlantas },
    });
  }
  if (horizontales.length > 0) {
    const alfa = ANGULO_ENCUENTRO[d.encuentro];
    const d_m = Math.round(distanciaAngulo(alfa) * 100) / 100;
    elementos.push({
      id: "horizontal",
      nombre: "Separación horizontal",
      tipo: "fachada",
      veredicto: "ok",
      valor: { valor: d_m, unidad: "m" },
      manda: { tipo: "grado_tabla", tabla: "SI 2 ap. 1 pto 2", entradas: [{ k: "Ángulo entre fachadas", v: `${alfa}°` }] },
      cita: ["SI 2 · ap. 1 pto 2"],
      detalle: { clase: "horizontal", encuentros: horizontales, alfa, d_m },
    });
  }

  // ── Reacción al fuego de la fachada ───────────────────────────────────────
  const alta = e.plantas[0];
  const altura_m = alta ? Math.round((alta.cota_m + alta.altura_m) * 100) / 100 : 0;
  const sistemas = claseFachada(F.reaccionSistemas, altura_m);
  const aislante = d.ventilada === "si" ? claseFachada(F.reaccionAislamientoCamara, altura_m) : null;
  const arranque = d.arranque === "publico" && altura_m <= F.arranqueFachadaMax_m;
  elementos.push({
    id: "reaccion",
    nombre: "Reacción al fuego de la fachada",
    tipo: "reaccion",
    veredicto: "ok",
    valor: { texto: sistemas },
    manda: { tipo: "grado_tabla", tabla: "SI 2 ap. 1 pto 4", entradas: [{ k: "Altura de la fachada", v: `${altura_m} m` }] },
    cita: ["SI 2 · ap. 1 ptos 4 a 6"],
    detalle: { clase: "reaccion", altura_m, sistemas, aislante, arranque },
  });
  const umbrales = [10, 18, 28];
  if (umbrales.some((u) => altura_m <= u && altura_m + PETO_m > u)) {
    avisos.push({ id: "peto", tipo: "caso_especial", elementoId: "reaccion", datos: { altura_m } });
  }

  // ── Cubierta ──────────────────────────────────────────────────────────────
  elementos.push({
    id: "cubierta",
    nombre: "Cubierta",
    tipo: "cubierta",
    veredicto: "ok",
    valor: { texto: conMedianeras ? "REI 60 · 0,50 m" : "BROOF(t1)" },
    manda: { tipo: "decision_proyectista", decision: d.medianeras },
    cita: ["SI 2 · ap. 2"],
    detalle: { clase: "cubierta", medianeras: conMedianeras },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales: habitualesSi2(unifamiliar), comp: c, altura_m };
}
