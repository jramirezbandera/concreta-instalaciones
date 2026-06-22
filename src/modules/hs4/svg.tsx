// DB-HS4 — Esquema del árbol de red de fontanería (AF). RENDER SVG (visual primero).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS4Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (layout determinista
// por profundidad/índice). Compatible con el export PDF (svg2pdf): solo
// primitivas planas en px, atributos de presentación inline.
//
// Diferencial "visual primero": esquema en columna del árbol de suministro
//   derivaciones a aparato → derivaciones particulares → columna/montante →
//   tubo de alimentación → acometida
// con el RECORRIDO CRÍTICO (más desfavorable) resaltado MULTICANAL (WCAG
// 1.4.1): color rojo + trazo grueso/discontinuo + etiqueta textual «crítico»,
// NUNCA solo color. Por cada tramo se muestra su Ø (mm), el caudal de cálculo
// (dm³/s) y la presión residual (kPa). El estado del veredicto por tramo añade
// un checker (✓/✗) redundante al color.

import { DiagramSvg, Seg, Dot, Tag, type SvgMode } from "../../lib/svg/primitives";
import type { Kind } from "../../lib/svg/helpers";
import { fitViewBox } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { HS4Result, ResultadoTramoHS4, TipoTramoHS4 } from "./calc";
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

interface HS4SVGProps {
  result: HS4Result;
  mode: SvgMode;
  width: number;
  height: number;
}

/** Nombre legible (es-ES) del tipo de tramo para la etiqueta. */
const NOMBRE_TIPO: Record<TipoTramoHS4, string> = {
  derivacion_aparato: "Deriv. aparato",
  derivacion_particular: "Deriv. particular",
  columna_montante: "Montante",
  tubo_alimentacion: "Alimentación",
  acometida: "Acometida",
};

// -----------------------------------------------------------------------------
// Estado MULTICANAL por tramo. Dos ejes independientes, ambos reforzados con
// texto (nunca solo color):
//   1. CRÍTICO (recorrido más desfavorable, `esCritico`): rojo + trazo grueso
//      discontinuo (kind="critical") + etiqueta «crítico». Es el diferencial.
//   2. VEREDICTO (`estado`): checker ✓/✗ + tono de etiqueta. fail/warn marcan
//      el tramo aunque no sea del recorrido crítico.
// El `kind` del trazo prioriza el recorrido crítico; un tramo que incumple sin
// ser crítico se delata por su checker «✗».
// -----------------------------------------------------------------------------
const VEREDICTO_MARCA: Record<Veredicto, string> = {
  ok: "✓ cumple",
  warn: "△ aviso",
  fail: "✗ incumple",
  neutral: "· s/d",
};

/** `kind` del trazo: el recorrido crítico manda; si no, normal. */
function kindDe(t: ResultadoTramoHS4): Kind {
  return t.esCritico ? "critical" : "normal";
}

// -----------------------------------------------------------------------------
// Conexión padre↔hijo: la "tubería" del esquema. Codo en L que NACE en el borde
// INFERIOR de la caja hija y MUERE en el borde SUPERIOR de la caja padre, de modo
// que el trazo discurre por el hueco entre cajas sin cruzar sus etiquetas. El
// trazo hereda el estado MULTICANAL del HIJO (tramo aguas arriba): si el hijo
// está en el recorrido crítico, su conexión también se ve roja/gruesa/discontinua.
// -----------------------------------------------------------------------------
function Conexion({ hijo, padre, mode }: { hijo: Nodo; padre: Nodo; mode: SvgMode }) {
  const kind = kindDe(hijo.t);
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
// Caja-tramo: nodo del árbol con su Ø, caudal de cálculo, presión residual y
// checker de veredicto. El recorrido crítico (`esCritico`) se distingue por
//   (1) color rojo  +  (2) trazo grueso/discontinuo (kind="critical")  +
//   (3) etiqueta textual «crítico»  — codificación MULTICANAL (WCAG 1.4.1).
// El veredicto del tramo añade un checker ✓/✗ redundante al color.
// -----------------------------------------------------------------------------
function CajaTramo({ nodo, esPuntoCritico, mode }: { nodo: Nodo; esPuntoCritico: boolean; mode: SvgMode }) {
  const { t, cx, cy } = nodo;
  const critico = t.esCritico;
  const kind = kindDe(t);
  const nombre = NOMBRE_TIPO[t.tipo];
  const top = cy + NODE_TOP_DY;
  const incumple = t.estado === "fail" || t.estado === "warn";

  const diametroTxt = t.diametro_mm == null ? "Ø —" : `Ø${fmt(t.diametro_mm, "mm", 0)}`;
  const caudalTxt = `Q ${fmt(t.caudalCalculo_dm3_s, "dm³/s", 3)}`;
  const presionTxt = `P ${fmt(t.presionResidual_kPa, "kPa", 0)}`;

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
      <Tag x={cx} y={top + 8} mode={mode} size={4.2} critical={critico}>
        {`${nombre} · ${t.id}`}
      </Tag>

      {/* Ø resultante (resultado numérico también en texto, no solo color). */}
      <Tag x={cx} y={top + 15} mode={mode} size={4.4} critical={critico}>
        {diametroTxt}
      </Tag>

      {/* Caudal de cálculo del tramo. */}
      <Tag x={cx} y={top + 22} mode={mode} size={3.8}>
        {caudalTxt}
      </Tag>

      {/* Presión residual a la salida del tramo (clave para el punto crítico). */}
      <Tag x={cx} y={top + 29} mode={mode} size={3.8} critical={critico}>
        {presionTxt}
      </Tag>

      {/* Checker de veredicto MULTICANAL: marca textual + color. */}
      <Tag x={cx} y={top + 36} mode={mode} size={4} critical={incumple}>
        {VEREDICTO_MARCA[t.estado]}
      </Tag>

      {/* Etiqueta directa del recorrido crítico (refuerzo textual del rojo). El
          punto más desfavorable lleva «◆ crítico»; el resto del recorrido «crítico». */}
      {critico && (
        <Tag x={cx} y={top + 43} mode={mode} size={4} critical>
          {esPuntoCritico ? "◆ crítico" : "crítico"}
        </Tag>
      )}
    </g>
  );
}

// -----------------------------------------------------------------------------
// Descripción accesible (WCAG 1.4.1): resumen del resultado (nº de tramos,
// presión crítica, grupo de presión) + cómo se codifica el recorrido crítico.
// Texto en español. El SVG COMPLEMENTA, nunca sustituye, a los resultados en
// texto/tabla de la UI/ficha.
// -----------------------------------------------------------------------------
const TEXTO_VEREDICTO: Record<Veredicto, string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

function describir(result: HS4Result): string {
  const n = result.porTramo.length;
  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const criticos = result.porTramo.filter((t) => t.esCritico).length;
  const grupoTxt = result.grupoPresionNecesario
    ? "Requiere grupo de presión (ap. 4.5)."
    : "No requiere grupo de presión.";
  const puntoTxt =
    result.puntoCriticoId == null
      ? "sin punto de consumo crítico identificado"
      : `punto de consumo más desfavorable «${result.puntoCriticoId}»`;
  return (
    `Esquema del árbol de red de fontanería (agua fría, DB-HS4): derivaciones a ` +
    `aparato, derivaciones particulares, columna/montante, tubo de alimentación y ` +
    `acometida. Veredicto global: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ` +
    `${cumplen} de ${n} tramos cumplen. ` +
    `Caudal de cálculo total ${fmt(result.caudalTotal_dm3_s, "dm³/s", 2)}; ` +
    `presión en el ${puntoTxt}: ${fmt(result.presionCritica_kPa, "kPa", 0)}. ${grupoTxt} ` +
    `El recorrido crítico (más desfavorable, ${criticos} tramos) se resalta con ` +
    `color rojo, trazo grueso discontinuo y la etiqueta «crítico».`
  );
}

export function HS4SVG({ result, mode, width, height }: HS4SVGProps) {
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

  // El punto de consumo crítico cuelga de una derivación de aparato cuyo id es
  // `puntoCriticoId` (id del APARATO) → su tramo (`tramoId`) lleva la marca
  // reforzada «◆ crítico». El motor no expone el tramoId del aparato crítico en
  // el resultado de tramos, así que se localiza por la hoja crítica más profunda.
  const puntoCriticoTramoId = (() => {
    const criticos = nodos.filter((nd) => nd.t.esCritico);
    if (criticos.length === 0) return null;
    // La hoja del recorrido crítico = el tramo crítico de mayor profundidad
    // (más aguas arriba), que es la derivación del aparato más desfavorable.
    return criticos.reduce((max, nd) => (nd.depth > max.depth ? nd : max), criticos[0]).t.id;
  })();

  const yTotales = vbY + vbH - 6;
  const xTotales = vbX + vbW / 2;

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Esquema del árbol de red de fontanería (DB-HS4)"
      desc={describir(result)}
    >
      {/* Tuberías (conexiones aguas arriba → aguas abajo). */}
      {conexiones.map(({ hijo, padre }) => (
        <Conexion key={`con-${hijo.t.id}-${padre.t.id}`} hijo={hijo} padre={padre} mode={mode} />
      ))}

      {/* Cajas-tramo con etiquetas y recorrido crítico multicanal. */}
      {nodos.map((nodo) => (
        <CajaTramo
          key={nodo.t.id}
          nodo={nodo}
          esPuntoCritico={nodo.t.id === puntoCriticoTramoId}
          mode={mode}
        />
      ))}

      {/* Banda de totales (el dato numérico también va en texto, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={4.2}>
        {`Q total ${fmt(result.caudalTotal_dm3_s, "dm³/s", 2)} · P crítica ${fmt(
          result.presionCritica_kPa,
          "kPa",
          0,
        )} · ${result.porTramo.filter((t) => t.cumple).length}/${result.porTramo.length} tramos cumplen`}
      </Tag>
    </DiagramSvg>
  );
}
