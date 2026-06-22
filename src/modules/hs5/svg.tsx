// DB-HS5 — Esquema del árbol de red de saneamiento. RENDER SVG (visual primero).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS5Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (layout determinista
// por profundidad/índice). Compatible con el export PDF (svg2pdf): solo
// primitivas planas.
//
// Diferencial "visual primero": árbol jerárquico de evacuación
//   derivaciones de aparatos → ramales colectores → bajantes → colector
// con el tramo subdimensionado / que incumple resaltado MULTICANAL (WCAG
// 1.4.1): color crítico + trazo grueso/discontinuo + etiqueta textual "✗",
// NUNCA solo color. Por cada tramo se muestra su Ø (mm), las UD acumuladas y,
// en ramales/colectores, la pendiente %.

import { DiagramSvg, Seg, Dot, Tag, type SvgMode } from "../../lib/svg/primitives";
import { fitViewBox } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { HS5Result, TipoTramo } from "./calc";
// Id del clon PDF, constantes de layout, geometría del árbol y tamaño nativo del
// viewBox: viven en ./svg-meta (módulo SIN JSX) para que este archivo exporte
// SOLO componentes (react-refresh/only-export-components). ÚNICA fuente de
// verdad de las medidas y de `calcularArbol`.
import {
  NODE_W,
  VB_PAD,
  BANDA_TOTALES,
  NODE_TOP_DY,
  NODE_BOX_H,
  NODE_BOT_DY,
  calcularArbol,
  type Nodo,
} from "./svg-meta";

interface HS5SVGProps {
  result: HS5Result;
  mode: SvgMode;
  width: number;
  height: number;
}

/** Nombre legible (es-ES) del tipo de tramo para la etiqueta. */
const NOMBRE_TIPO: Record<TipoTramo, string> = {
  ramal: "Ramal",
  bajante: "Bajante",
  colector: "Colector",
};

// -----------------------------------------------------------------------------
// Conexión padre↔hijo: la "tubería" del esquema. Codo en L que NACE en el borde
// INFERIOR de la caja hija y MUERE en el borde SUPERIOR de la caja padre, de modo
// que el trazo discurre por el hueco entre cajas sin cruzar sus etiquetas (p.ej.
// el checker "✓ Cumple"). El trazo hereda el estado MULTICANAL del HIJO (el tramo
// aguas arriba), de modo que un tramo que incumple se ve también en su conexión.
// -----------------------------------------------------------------------------
function Conexion({ hijo, padre, mode }: { hijo: Nodo; padre: Nodo; mode: SvgMode }) {
  const kind = !hijo.t.cumple ? "critical" : "normal";
  const yNace = hijo.cy + NODE_BOT_DY; // borde inferior de la caja hija
  const yMuere = padre.cy + NODE_TOP_DY; // borde superior de la caja padre
  return (
    <g>
      {/* Baja por la x del hijo hasta la fila del padre, luego horizontal al padre. */}
      <Seg x1={hijo.cx} y1={yNace} x2={hijo.cx} y2={yMuere} mode={mode} kind={kind} />
      <Seg x1={hijo.cx} y1={yMuere} x2={padre.cx} y2={yMuere} mode={mode} kind={kind} />
    </g>
  );
}

// -----------------------------------------------------------------------------
// Caja-tramo: nodo del árbol con su Ø, UD acumuladas, pendiente y checker.
//
// MULTICANAL (WCAG 1.4.1): un tramo que NO cumple se distingue por
//   (1) color crítico  +  (2) trazo grueso/discontinuo (kind="critical")  +
//   (3) marca textual "✗ INCUMPLE" en <Tag critical>.
// Un tramo que cumple lleva "✓" — nunca se depende solo del color.
// -----------------------------------------------------------------------------
function CajaTramo({ nodo, mode }: { nodo: Nodo; mode: SvgMode }) {
  const { t, cx, cy } = nodo;
  const critico = !t.cumple;
  const kind = critico ? "critical" : "normal";
  const nombre = NOMBRE_TIPO[t.tipo];
  const top = cy + NODE_TOP_DY;

  // El nodo es un punto + un recuadro discreto de etiquetas. La pendiente solo
  // aplica a ramales y colectores (la bajante es vertical → pendiente 0).
  const muestraPendiente = t.tipo === "ramal" || t.tipo === "colector";
  const diametroTxt = t.diametro_mm == null ? "Ø —" : `Ø${fmt(t.diametro_mm, "mm")}`;

  return (
    <g>
      {/* Nodo de unión del tramo (refuerza el vértice del árbol). */}
      <Dot x={cx} y={cy} r={2.6} mode={mode} kind={kind} />

      {/* Marco del nodo (4 segmentos) para anclar las etiquetas. */}
      <Seg x1={cx - NODE_W / 2} y1={top} x2={cx + NODE_W / 2} y2={top} mode={mode} kind={kind} />
      <Seg
        x1={cx + NODE_W / 2}
        y1={top}
        x2={cx + NODE_W / 2}
        y2={top + NODE_BOX_H}
        mode={mode}
        kind={kind}
      />
      <Seg
        x1={cx + NODE_W / 2}
        y1={top + NODE_BOX_H}
        x2={cx - NODE_W / 2}
        y2={top + NODE_BOX_H}
        mode={mode}
        kind={kind}
      />
      <Seg
        x1={cx - NODE_W / 2}
        y1={top + NODE_BOX_H}
        x2={cx - NODE_W / 2}
        y2={top}
        mode={mode}
        kind={kind}
      />

      {/* Tipo de tramo + identificador. */}
      <Tag x={cx} y={top + 8} mode={mode} size={4.4}>
        {`${nombre} · ${t.id}`}
      </Tag>

      {/* Ø resultante (resultado numérico también en texto, no solo color). */}
      <Tag x={cx} y={top + 15} mode={mode} size={4.2} critical={critico}>
        {diametroTxt}
      </Tag>

      {/* UD acumuladas + pendiente (en ramales/colectores). */}
      <Tag x={cx} y={top + 22} mode={mode} size={3.6}>
        {muestraPendiente
          ? `${fmt(t.udAcumuladas, "UD")} · ${fmt(t.pendiente_pct, "%")}`
          : `${fmt(t.udAcumuladas, "UD")}`}
      </Tag>

      {/* Checker MULTICANAL: marca textual + color (refuerza al trazo). */}
      <Tag x={cx} y={top + 31} mode={mode} size={4.4} critical={critico}>
        {critico ? "✗ INCUMPLE" : "✓ Cumple"}
      </Tag>
    </g>
  );
}

// -----------------------------------------------------------------------------
// Descripción accesible (WCAG 1.4.1): veredicto global + conteo "X de N
// cumplen" + Ø de la bajante y del colector principal. Texto en español. El SVG
// COMPLEMENTA, nunca sustituye, a los resultados en texto/tabla de la UI.
// -----------------------------------------------------------------------------
const TEXTO_VEREDICTO: Record<HS5Result["veredictoGlobal"], string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

/** Ø del mayor tramo de un tipo dado (mm) o `null` si no hay/ no dimensiona. */
function diametroDe(result: HS5Result, tipo: TipoTramo): number | null {
  const ds = result.porTramo
    .filter((t) => t.tipo === tipo && t.diametro_mm != null)
    .map((t) => t.diametro_mm as number);
  return ds.length ? Math.max(...ds) : null;
}

function describir(result: HS5Result): string {
  const n = result.porTramo.length;
  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const dBajante = diametroDe(result, "bajante");
  const dColector = diametroDe(result, "colector");
  const bajanteTxt = dBajante == null ? "sin bajante dimensionada" : `bajante Ø${fmt(dBajante, "mm")}`;
  const colectorTxt =
    dColector == null ? "sin colector dimensionado" : `colector principal Ø${fmt(dColector, "mm")}`;
  return (
    `Esquema del árbol de red de saneamiento (DB-HS5): derivaciones de aparatos, ` +
    `ramales colectores, bajantes y colector horizontal. ` +
    `Veredicto global: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ` +
    `${cumplen} de ${n} tramos cumplen. ` +
    `${bajanteTxt}, ${colectorTxt}. ` +
    `Total ${fmt(result.udTotales, "UD")}. El tramo que incumple se resalta con ` +
    `color, trazo grueso discontinuo y la marca «✗».`
  );
}

export function HS5SVG({ result, mode, width, height }: HS5SVGProps) {
  const { nodos, porId } = calcularArbol(result);

  // viewBox auto-encuadrado a partir de los DATOS (esquinas de las cajas) +
  // padding (helper fitViewBox; no getBBox del DOM). Reserva extra abajo para la
  // banda de totales.
  const esquinas = nodos.flatMap((nd) => [
    { x: nd.cx - NODE_W / 2, y: nd.cy + NODE_TOP_DY },
    { x: nd.cx + NODE_W / 2, y: nd.cy + NODE_BOT_DY },
  ]);
  const [vbX, vbY, vbW, vbHRaw] = fitViewBox(esquinas, VB_PAD);
  const vbH = vbHRaw + BANDA_TOTALES;
  const viewBox: [number, number, number, number] = [vbX, vbY, vbW, vbH];

  // Conexiones padre↔hijo (la "tubería"). Se dibujan primero, debajo de las
  // cajas, para no taparlas.
  const conexiones = nodos
    .map((hijo) => {
      const padreId = hijo.t.parentId;
      if (padreId === null) return null;
      const padre = porId.get(padreId);
      return padre ? { hijo, padre } : null;
    })
    .filter((c): c is { hijo: Nodo; padre: Nodo } => c !== null);

  const yTotales = vbY + vbH - 6;
  const xTotales = vbX + vbW / 2;

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Esquema del árbol de red de saneamiento (DB-HS5)"
      desc={describir(result)}
    >
      {/* Tuberías (conexiones aguas arriba → aguas abajo). */}
      {conexiones.map(({ hijo, padre }) => (
        <Conexion key={`con-${hijo.t.id}-${padre.t.id}`} hijo={hijo} padre={padre} mode={mode} />
      ))}

      {/* Cajas-tramo con checker multicanal. */}
      {nodos.map((nodo) => (
        <CajaTramo key={nodo.t.id} nodo={nodo} mode={mode} />
      ))}

      {/* Banda de totales (el dato numérico también va en texto, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={4.2}>
        {`Total ${fmt(result.udTotales, "UD")} · ${
          result.porTramo.filter((t) => t.cumple).length
        }/${result.porTramo.length} tramos cumplen`}
      </Tag>
    </DiagramSvg>
  );
}
