// DB-HS3 — Planta esquemática de ventilación. RENDER SVG (visual primero).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS3Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (layout determinista
// por índice). Compatible con el export PDF (svg2pdf): solo primitivas planas.
//
// Diferencial "visual primero": planta de la vivienda con el checker
// verde/rojo por estancia (codificación MULTICANAL, WCAG 1.4.1) y las flechas
// de flujo admisión (locales secos) → extracción (locales húmedos), reflejando
// el sentido seco→húmedo del DB-HS3.

import { DiagramSvg, Seg, Arrow, Tag, type SvgMode } from "../../lib/svg/primitives";
import { fitViewBox } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { HS3Result, ResultadoEstancia, TipoEstancia } from "./calc";
// Geometría de la rejilla + tamaño nativo del viewBox: viven en ./svg-meta
// (módulo SIN JSX) para que este archivo exporte SOLO componentes
// (react-refresh/only-export-components). ÚNICA fuente de verdad de las medidas.
import {
  COLS,
  BOX_W,
  BOX_H,
  GAP_X,
  GAP_Y,
  ORIGIN_X,
  ORIGIN_Y,
  VB_PAD,
  BANDA_TOTALES,
} from "./svg-meta";

interface HS3SVGProps {
  result: HS3Result;
  mode: SvgMode;
  width: number;
  height: number;
}

/** Nombre legible (es-ES) del tipo de estancia para la etiqueta. */
const NOMBRE_ESTANCIA: Record<TipoEstancia, string> = {
  dorm_principal: "Dorm. principal",
  dormitorio: "Dormitorio",
  salon_comedor: "Salón-comedor",
  cocina: "Cocina",
  bano: "Baño",
  aseo: "Aseo",
};

interface Caja {
  e: ResultadoEstancia;
  /** Esquina superior izquierda. */
  x: number;
  y: number;
  cx: number;
  cy: number;
}

/** Posición determinista de cada estancia en la rejilla, a partir del índice. */
function colocar(estancias: ResultadoEstancia[]): Caja[] {
  return estancias.map((e, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = ORIGIN_X + col * (BOX_W + GAP_X);
    const y = ORIGIN_Y + row * (BOX_H + GAP_Y);
    return { e, x, y, cx: x + BOX_W / 2, cy: y + BOX_H / 2 };
  });
}

// -----------------------------------------------------------------------------
// Caja-estancia: rectángulo (4 Seg) + etiquetas. Local a HS3 (es específico de
// este módulo: nombre de estancia, caudal y checker de cumplimiento), no se
// promueve a primitiva compartida.
//
// MULTICANAL (WCAG 1.4.1): una estancia que NO cumple se distingue por
//   (1) color crítico  +  (2) trazo grueso/discontinuo (kind="critical")  +
//   (3) marca textual "✗ INCUMPLE" en <Tag critical>.
// Una que cumple lleva "✓" — nunca se depende solo del color.
// -----------------------------------------------------------------------------
function CajaEstancia({ caja, mode }: { caja: Caja; mode: SvgMode }) {
  const { e, x, y, cx } = caja;
  const critico = !e.cumple;
  const kind = critico ? "critical" : "normal";
  const nombre = NOMBRE_ESTANCIA[e.tipo];

  return (
    <g>
      {/* Rectángulo de la estancia (4 segmentos). */}
      <Seg x1={x} y1={y} x2={x + BOX_W} y2={y} mode={mode} kind={kind} />
      <Seg x1={x + BOX_W} y1={y} x2={x + BOX_W} y2={y + BOX_H} mode={mode} kind={kind} />
      <Seg x1={x + BOX_W} y1={y + BOX_H} x2={x} y2={y + BOX_H} mode={mode} kind={kind} />
      <Seg x1={x} y1={y + BOX_H} x2={x} y2={y} mode={mode} kind={kind} />

      {/* Nombre de la estancia. */}
      <Tag x={cx} y={y + 11} mode={mode} size={4.4}>
        {nombre}
      </Tag>

      {/* Caudal propuesto + rol (admisión / extracción). */}
      <Tag x={cx} y={y + 19} mode={mode} size={3.6}>
        {`${fmt(e.caudalPropuesto_l_s, "l/s")} · ${
          e.tipoAbertura === "extraccion" ? "extracción" : "admisión"
        }`}
      </Tag>

      {/* Checker MULTICANAL: marca textual + color (refuerza al trazo). */}
      <Tag x={cx} y={y + 30} mode={mode} size={4.6} critical={critico}>
        {critico ? "✗ INCUMPLE" : "✓ Cumple"}
      </Tag>

      {/* Mínimo exigido (resultado numérico también en texto, no solo color). */}
      <Tag x={cx} y={y + 37} mode={mode} size={3.2}>
        {`mín. ${fmt(e.caudalRequerido_l_s, "l/s")}`}
      </Tag>
    </g>
  );
}

// -----------------------------------------------------------------------------
// Descripción accesible (WCAG 1.4.1 / A3-26): veredicto global + conteo
// "X de N cumplen" + totales de admisión/extracción. Texto en español. El SVG
// COMPLEMENTA, nunca sustituye, a los resultados en texto/tabla de la ficha.
// -----------------------------------------------------------------------------
const TEXTO_VEREDICTO: Record<HS3Result["veredictoGlobal"], string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

function describir(result: HS3Result): string {
  const n = result.porEstancia.length;
  const cumplen = result.porEstancia.filter((e) => e.cumple).length;
  const balance = result.balanceOk
    ? "Admisión y extracción equilibradas."
    : "Admisión y extracción no equilibradas.";
  return (
    `Planta esquemática de ventilación de la vivienda. ` +
    `Veredicto global: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ` +
    `${cumplen} de ${n} estancias cumplen. ` +
    `Admisión total ${fmt(result.totalAdmision_l_s, "l/s")}, ` +
    `extracción total ${fmt(result.totalExtraccion_l_s, "l/s")}. ${balance}`
  );
}

export function HS3SVG({ result, mode, width, height }: HS3SVGProps) {
  const cajas = colocar(result.porEstancia);

  // viewBox auto-encuadrado a partir de los DATOS (esquinas de las cajas) +
  // padding (helper fitViewBox; no getBBox del DOM). Reserva extra abajo para
  // la banda de totales.
  const esquinas = cajas.flatMap((c) => [
    { x: c.x, y: c.y },
    { x: c.x + BOX_W, y: c.y + BOX_H },
  ]);
  const [vbX, vbY, vbW, vbHRaw] = fitViewBox(esquinas, VB_PAD);
  const vbH = vbHRaw + BANDA_TOTALES;
  const viewBox: [number, number, number, number] = [vbX, vbY, vbW, vbH];

  // Flujo seco→húmedo: una flecha desde cada estancia de admisión hacia la
  // estancia de extracción más cercana (centro-a-centro). Trazado direccional
  // legible (no enrutado perfecto), coherente con el DB-HS3.
  const secas = cajas.filter((c) => c.e.tipoAbertura === "admision");
  const humedas = cajas.filter((c) => c.e.tipoAbertura === "extraccion");
  const flujos = secas
    .map((seca) => {
      let destino = humedas[0];
      let mejor = Infinity;
      for (const h of humedas) {
        const d = (h.cx - seca.cx) ** 2 + (h.cy - seca.cy) ** 2;
        if (d < mejor) {
          mejor = d;
          destino = h;
        }
      }
      return destino ? { seca, destino } : null;
    })
    .filter((f): f is { seca: Caja; destino: Caja } => f !== null);

  const yTotales = vbY + vbH - 5;
  const xTotales = vbX + vbW / 2;

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Planta esquemática de ventilación (DB-HS3)"
      desc={describir(result)}
    >
      {/* Flechas de flujo seco→húmedo (debajo de las cajas para no taparlas). */}
      {flujos.map(({ seca, destino }) => (
        <Arrow
          key={`flujo-${seca.e.id}-${destino.e.id}`}
          x1={seca.cx}
          y1={seca.cy}
          x2={destino.cx}
          y2={destino.cy}
          mode={mode}
        />
      ))}

      {/* Cajas-estancia con checker multicanal. */}
      {cajas.map((caja) => (
        <CajaEstancia key={caja.e.id} caja={caja} mode={mode} />
      ))}

      {/* Banda de totales (el dato numérico también va en texto, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={4}>
        {`Admisión ${fmt(result.totalAdmision_l_s, "l/s")} → Extracción ${fmt(
          result.totalExtraccion_l_s,
          "l/s",
        )}`}
      </Tag>
    </DiagramSvg>
  );
}
