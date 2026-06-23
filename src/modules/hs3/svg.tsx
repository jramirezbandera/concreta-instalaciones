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
import type {
  HS3Result,
  ResultadoColectivo,
  ResultadoEstancia,
  ResultadoTramoRed,
  TipoEstancia,
} from "./calc";
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
  R_ORIGIN_X,
  R_ORIGIN_Y,
  R_COL_W,
  R_GAP_X,
  R_NODE_W,
  R_NODE_H,
  R_GAP_Y,
  R_PAD,
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

// =============================================================================
// MODO RED (avanzado) — esquema de la red colectiva de extracción.
//
// Columnas verticales, una por colectivo: la boca arriba y las plantas
// descendiendo por nivel (el aire sube hacia la boca). El tramo DIMENSIONANTE
// se resalta MULTICANAL (WCAG 1.4.1): color crítico + trazo grueso/discontinuo
// (kind="critical") + etiqueta textual «◆ manda» — nunca solo color.
//
// Constantes de layout en ./svg-meta (única fuente de verdad del tamaño nativo,
// que consume la ficha PDF). No reusa `calcularArbol` de HS4/HS5: esa dedup es
// un TODO aparte, fuera del alcance de HS3 estructurado.
// =============================================================================

interface NodoRed {
  t: ResultadoTramoRed;
  x: number;
  y: number;
  cx: number;
}

/** Orden de pintado de un colectivo: boca arriba, luego plantas por nivel desc. */
function ordenarColumna(col: ResultadoColectivo): ResultadoTramoRed[] {
  const boca = col.tramos.filter((t) => t.nivel === null);
  const plantas = col.tramos
    .filter((t) => t.nivel !== null)
    .sort((a, b) => (b.nivel ?? 0) - (a.nivel ?? 0));
  return [...boca, ...plantas];
}

function describirRed(red: NonNullable<HS3Result["red"]>): string {
  if (!red.estadoRed.valida) {
    return (
      "Esquema de la red colectiva de extracción. Red no válida, exportación " +
      `bloqueada: ${red.estadoRed.bloqueos.join(" ")}`
    );
  }
  const n = red.colectivos.length;
  const manda = red.colectivos.flatMap((c) => c.tramos).find((t) => t.esManda);
  const base = `Esquema de la red colectiva de extracción con ${n} colectivo${n === 1 ? "" : "s"}. `;
  return manda
    ? base +
        `El tramo que manda exige una sección de ${fmt(manda.seccionRequerida_cm2, "cm²", 0)} ` +
        `(clase de tiro ${manda.claseTiro}) en la boca, para un caudal acumulado de ` +
        `${fmt(manda.qvtAcum_l_s, "l/s")}. Se resalta con color, trazo grueso ` +
        `discontinuo y la etiqueta «◆ manda».`
    : base;
}

function RedDiagram({
  red,
  mode,
  width,
  height,
}: {
  red: NonNullable<HS3Result["red"]>;
  mode: SvgMode;
  width: number;
  height: number;
}) {
  const columnas = red.colectivos.map((col, j) => {
    const x = R_ORIGIN_X + j * (R_COL_W + R_GAP_X);
    const nodos: NodoRed[] = ordenarColumna(col).map((t, k) => ({
      t,
      x,
      y: R_ORIGIN_Y + k * (R_NODE_H + R_GAP_Y),
      cx: x + R_NODE_W / 2,
    }));
    return { col, nodos };
  });

  const esquinas = columnas.flatMap((c) =>
    c.nodos.flatMap((n) => [
      { x: n.x, y: n.y },
      { x: n.x + R_NODE_W, y: n.y + R_NODE_H },
    ]),
  );
  const [vbX, vbY, vbW, vbH] = fitViewBox(
    esquinas.length
      ? esquinas
      : [
          { x: 0, y: 0 },
          { x: R_NODE_W, y: R_NODE_H },
        ],
    R_PAD,
  );
  const viewBox: [number, number, number, number] = [vbX, vbY, vbW, vbH];

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Esquema de la red colectiva de extracción (DB-HS3)"
      desc={describirRed(red)}
    >
      {columnas.map(({ col, nodos }) => (
        <g key={col.id}>
          {/* Conducto vertical entre nodos consecutivos. */}
          {nodos.slice(0, -1).map((n, k) => (
            <Seg
              key={`d-${col.id}-${k}`}
              x1={n.cx}
              y1={n.y + R_NODE_H}
              x2={n.cx}
              y2={nodos[k + 1].y}
              mode={mode}
              kind={n.t.esDimensionante || nodos[k + 1].t.esDimensionante ? "critical" : "flow"}
            />
          ))}
          {/* Etiqueta de clase de tiro del colectivo (encima de la boca). */}
          {nodos[0] && (
            <Tag x={nodos[0].cx} y={R_ORIGIN_Y - 5} mode={mode} size={3.6}>
              {`clase ${col.claseTiro} · ${col.plantasServidas} pl.`}
            </Tag>
          )}
          {nodos.map((n) => {
            const dim = n.t.esDimensionante;
            const kind = dim ? "critical" : "normal";
            const esBoca = n.t.nivel === null;
            return (
              <g key={n.t.id}>
                <Seg x1={n.x} y1={n.y} x2={n.x + R_NODE_W} y2={n.y} mode={mode} kind={kind} />
                <Seg x1={n.x + R_NODE_W} y1={n.y} x2={n.x + R_NODE_W} y2={n.y + R_NODE_H} mode={mode} kind={kind} />
                <Seg x1={n.x + R_NODE_W} y1={n.y + R_NODE_H} x2={n.x} y2={n.y + R_NODE_H} mode={mode} kind={kind} />
                <Seg x1={n.x} y1={n.y + R_NODE_H} x2={n.x} y2={n.y} mode={mode} kind={kind} />
                <Tag x={n.cx} y={n.y + 9} mode={mode} size={4} critical={dim}>
                  {esBoca ? `Boca · ${col.id}` : `Planta ${n.t.nivel}`}
                </Tag>
                <Tag x={n.cx} y={n.y + 17} mode={mode} size={3.6}>
                  {`qvt ${fmt(n.t.qvtAcum_l_s, "l/s")}`}
                </Tag>
                <Tag x={n.cx} y={n.y + 25} mode={mode} size={3.6} critical={dim}>
                  {fmt(n.t.seccionRequerida_cm2, "cm²", 0)}
                </Tag>
                {n.t.esManda && (
                  <Tag x={n.cx} y={n.y + 33} mode={mode} size={3.8} critical>
                    ◆ manda
                  </Tag>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </DiagramSvg>
  );
}

export function HS3SVG({ result, mode, width, height }: HS3SVGProps) {
  // Modo avanzado: el diagrama es la red colectiva (árbol), no la rejilla.
  if (result.red) {
    return <RedDiagram red={result.red} mode={mode} width={width} height={height} />;
  }

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
