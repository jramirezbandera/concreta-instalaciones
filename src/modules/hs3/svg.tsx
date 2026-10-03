// DB-HS3 — Planta esquemática de ventilación. RENDER SVG (feature-8,
// UX-RECONCEPT §7: el esquema es soporte compacto sincronizado con la
// tabla/outliner — la tabla manda).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS3Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (layout determinista
// por índice). Compatible con el export PDF (svg2pdf): solo primitivas planas.
//
// DOS diagramas (como en feature-4/6):
//   • PLANTA esquemática: rejilla de cajas-estancia con checker verde/rojo y
//     flechas de flujo admisión (secos) → extracción (húmedos), el sentido
//     seco→húmedo del DB-HS3.
//   • RED de columnas (si `result.red` existe, modo avanzado): una columna
//     vertical por colectivo, boca arriba y plantas descendiendo.
//
// MULTICANAL (WCAG 1.4.1): el elemento crítico se distingue por color + trazo
// grueso/discontinuo (kind="critical") + marca textual («✗ INCUMPLE» en las
// estancias, «◆ manda» en la red) — NUNCA solo color. Selección (contrato
// feature-7): acento + trazo grueso + anillo (Ring); hover: refuerzo
// intermedio. En mode="pdf" no hay interactividad ni estados de selección.
//
// COMPACTO (feature-8): por debajo de COMPACT_WIDTH (→ ./svg-meta, patrón HE1)
// se ocultan las microetiquetas densas y se agrandan las restantes, SIN cambiar
// la geometría (la UI dimensiona el alto con hs3NativeSize/hs3RedNativeSize y
// el aspecto debe coincidir). Nunca en PDF.

import type { ReactNode } from "react";
import { DiagramSvg, Seg, Arrow, Tag, Ring, type SvgMode } from "../../lib/svg/primitives";
import { fitViewBox, type Kind } from "../../lib/svg/helpers";
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
  esCompacto,
} from "./svg-meta";

interface HS3SVGProps {
  result: HS3Result;
  mode: SvgMode;
  width: number;
  height: number;
  /** Id (estancia o tramo de la red) seleccionado en la tabla — acento + anillo. */
  selectedId?: string | null;
  /** Id bajo el cursor en la tabla — refuerzo intermedio. */
  hoverId?: string | null;
  /** Clic en un elemento del esquema → selecciona la fila en la tabla. */
  onSelect?: (id: string) => void;
  /** Nombres legibles por id (feature-7); sin entrada, el rótulo por defecto. */
  etiquetas?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Kit de interacción (contrato feature-7). En mode="pdf" el kit queda inerte
// (sin handlers ni estados) y el render es idéntico al de feature-6.
// -----------------------------------------------------------------------------
interface Kit {
  interactivo: boolean;
  sel: string | null;
  hov: string | null;
  onSelect?: (id: string) => void;
  etiquetas?: Record<string, string>;
}

/** Estilo MULTICANAL resuelto de un elemento (trazo + anillo). */
interface Trazo {
  kind: Kind;
  base: number;
  ring: boolean;
}

/**
 * Trazo MULTICANAL: fallo manda (crítico); luego selección/hover (acento).
 * Los grosores están a escala de ESTE viewBox (cajas de 60×42, fuentes ~4):
 * el 3.5 del patrón hs4/hs5 (fuentes 8–10) equivale aquí a ~2.4.
 */
function trazoDe(kit: Kit, ids: readonly string[], fallo: boolean, base: number): Trazo {
  const esSel = ids.some((i) => i === kit.sel);
  const esHov = ids.some((i) => i === kit.hov);
  if (fallo) {
    // criticalStroke duplica el grosor y aplica trazo discontinuo.
    return { kind: "critical", base: esSel ? base * 1.35 : esHov ? base * 1.15 : base, ring: esSel };
  }
  if (esSel) return { kind: "flow", base: 2.4, ring: true };
  if (esHov) return { kind: "flow", base: Math.min(2, base + 0.6), ring: false };
  return { kind: "normal", base, ring: false };
}

/** Envoltorio interactivo: clic → onSelect(id); `hit` es la zona de golpeo. */
function envolver(kit: Kit, key: string, id: string, contenido: ReactNode, hit: ReactNode): ReactNode {
  return kit.interactivo ? (
    <g
      key={key}
      data-el={id}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        kit.onSelect?.(id);
      }}
    >
      {contenido}
      {hit}
    </g>
  ) : (
    <g key={key}>{contenido}</g>
  );
}

/** Rectángulo invisible de golpeo (solo pantalla interactiva). */
function hitRect(kit: Kit, x: number, y: number, w: number, h: number): ReactNode {
  return kit.interactivo ? <rect x={x} y={y} width={w} height={h} fill="transparent" /> : null;
}

/** Nombre legible: `etiquetas[id]`; sin entrada, el rótulo por defecto. */
function nombreDe(kit: Kit, id: string, porDefecto: string): string {
  return kit.etiquetas?.[id] ?? porDefecto;
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
//
// COMPACTO: se ocultan la línea fina «caudal · rol» y el «mín. …» (los datos
// finos viven en el outliner) y suben los cuerpos del nombre, el caudal y el
// checker. La geometría de la caja NO cambia.
// -----------------------------------------------------------------------------
function CajaEstancia({
  caja,
  mode,
  compact,
  titulo,
  tr,
}: {
  caja: Caja;
  mode: SvgMode;
  compact: boolean;
  /** Nombre legible resuelto (etiquetas[id] o el tipo de estancia). */
  titulo: string;
  /** Trazo MULTICANAL resuelto (fallo/selección/hover). */
  tr: Trazo;
}) {
  const { e, x, y, cx } = caja;
  const critico = !e.cumple;

  return (
    <g>
      {/* Rectángulo de la estancia (4 segmentos). */}
      <Seg x1={x} y1={y} x2={x + BOX_W} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
      <Seg x1={x + BOX_W} y1={y} x2={x + BOX_W} y2={y + BOX_H} mode={mode} kind={tr.kind} base={tr.base} />
      <Seg x1={x + BOX_W} y1={y + BOX_H} x2={x} y2={y + BOX_H} mode={mode} kind={tr.kind} base={tr.base} />
      <Seg x1={x} y1={y + BOX_H} x2={x} y2={y} mode={mode} kind={tr.kind} base={tr.base} />

      {compact ? (
        <>
          {/* Nombre + caudal propuesto + checker, en cuerpos legibles. */}
          <Tag x={cx} y={y + 12} mode={mode} size={5.4}>
            {titulo}
          </Tag>
          <Tag x={cx} y={y + 22} mode={mode} size={4.6}>
            {fmt(e.caudalPropuesto_l_s, "l/s")}
          </Tag>
          <Tag x={cx} y={y + 34} mode={mode} size={5.2} critical={critico}>
            {critico ? "✗ INCUMPLE" : "✓ Cumple"}
          </Tag>
        </>
      ) : (
        <>
          {/* Nombre de la estancia. */}
          <Tag x={cx} y={y + 11} mode={mode} size={4.4}>
            {titulo}
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
        </>
      )}

      {/* Anillo de selección (contrato feature-7), en el borde superior. */}
      {tr.ring && <Ring x={cx} y={y} mode={mode} kind={tr.kind} />}
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
  compact,
  kit,
}: {
  red: NonNullable<HS3Result["red"]>;
  mode: SvgMode;
  width: number;
  height: number;
  compact: boolean;
  kit: Kit;
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
            <Tag x={nodos[0].cx} y={R_ORIGIN_Y - 5} mode={mode} size={compact ? 4.4 : 3.6}>
              {`clase ${col.claseTiro} · ${col.plantasServidas} pl.`}
            </Tag>
          )}
          {nodos.map((n) => {
            const dim = n.t.esDimensionante;
            const tr = trazoDe(kit, [n.t.id], dim, 1.2);
            const esBoca = n.t.nivel === null;
            // El nombre legible de la tabla (etiquetas[id]) sustituye al rótulo
            // por defecto de la caja cuando existe (contrato feature-7).
            const titulo = nombreDe(
              kit,
              n.t.id,
              esBoca ? `Boca · ${nombreDe(kit, col.id, col.id)}` : `Planta ${n.t.nivel}`,
            );
            const contenido = (
              <>
                <Seg x1={n.x} y1={n.y} x2={n.x + R_NODE_W} y2={n.y} mode={mode} kind={tr.kind} base={tr.base} />
                <Seg x1={n.x + R_NODE_W} y1={n.y} x2={n.x + R_NODE_W} y2={n.y + R_NODE_H} mode={mode} kind={tr.kind} base={tr.base} />
                <Seg x1={n.x + R_NODE_W} y1={n.y + R_NODE_H} x2={n.x} y2={n.y + R_NODE_H} mode={mode} kind={tr.kind} base={tr.base} />
                <Seg x1={n.x} y1={n.y + R_NODE_H} x2={n.x} y2={n.y} mode={mode} kind={tr.kind} base={tr.base} />
                {compact ? (
                  <>
                    {/* COMPACTO: sin la línea fina de qvt (vive en el outliner);
                        cuerpos mayores para el título y la sección exigida. */}
                    <Tag x={n.cx} y={n.y + 11} mode={mode} size={4.8} critical={dim}>
                      {titulo}
                    </Tag>
                    <Tag x={n.cx} y={n.y + 21} mode={mode} size={4.6} critical={dim}>
                      {fmt(n.t.seccionRequerida_cm2, "cm²", 0)}
                    </Tag>
                    {n.t.esManda && (
                      <Tag x={n.cx} y={n.y + 31} mode={mode} size={4.6} critical>
                        ◆ manda
                      </Tag>
                    )}
                  </>
                ) : (
                  <>
                    <Tag x={n.cx} y={n.y + 9} mode={mode} size={4} critical={dim}>
                      {titulo}
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
                  </>
                )}
                {/* Anillo de selección (contrato feature-7), borde superior. */}
                {tr.ring && <Ring x={n.cx} y={n.y} mode={mode} kind={tr.kind} />}
              </>
            );
            return envolver(
              kit,
              `nodo-${n.t.id}`,
              n.t.id,
              contenido,
              hitRect(kit, n.x, n.y, R_NODE_W, R_NODE_H),
            );
          })}
        </g>
      ))}
    </DiagramSvg>
  );
}

export function HS3SVG({
  result,
  mode,
  width,
  height,
  selectedId = null,
  hoverId = null,
  onSelect,
  etiquetas,
}: HS3SVGProps) {
  // En PDF no hay interactividad NI estados de selección/hover (contrato).
  const kit: Kit = {
    interactivo: mode === "screen" && onSelect !== undefined,
    sel: mode === "screen" ? selectedId : null,
    hov: mode === "screen" ? hoverId : null,
    onSelect,
    etiquetas,
  };
  const compact = esCompacto(mode, width);

  // Modo avanzado: el diagrama es la red colectiva (árbol), no la rejilla.
  if (result.red) {
    return (
      <RedDiagram red={result.red} mode={mode} width={width} height={height} compact={compact} kit={kit} />
    );
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

      {/* Cajas-estancia con checker multicanal + selección/hover (feature-7). */}
      {cajas.map((caja) => {
        const tr = trazoDe(kit, [caja.e.id], !caja.e.cumple, 1.2);
        return envolver(
          kit,
          `caja-${caja.e.id}`,
          caja.e.id,
          <CajaEstancia
            caja={caja}
            mode={mode}
            compact={compact}
            titulo={nombreDe(kit, caja.e.id, NOMBRE_ESTANCIA[caja.e.tipo])}
            tr={tr}
          />,
          hitRect(kit, caja.x, caja.y, BOX_W, BOX_H),
        );
      })}

      {/* Banda de totales (el dato numérico también va en texto, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={compact ? 4.6 : 4}>
        {`Admisión ${fmt(result.totalAdmision_l_s, "l/s")} → Extracción ${fmt(
          result.totalExtraccion_l_s,
          "l/s",
        )}`}
      </Tag>
    </DiagramSvg>
  );
}
