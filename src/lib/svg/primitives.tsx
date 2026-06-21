// Primitivas SVG compartidas (SPEC §7). Render declarativo: los módulos pasan
// datos y estas primitivas pintan SOLO formas planas (compatibles con el
// rasterizado Acrobat-safe de embedSvgAsImage).
//
// Reglas que imponen:
//  • `viewBox` en unidades del DOMINIO (mm) + preserveAspectRatio="xMidYMid meet".
//  • Accesibilidad WCAG AA: <svg role="img"> + <title>/<desc> + aria-labelledby;
//    el elemento crítico NUNCA se distingue solo por color → codificación
//    MULTICANAL (color + grosor + trazo discontinuo + etiqueta directa).
//  • `mode`: 'screen' usa tokens de tema (var(--color-chart-*)); 'pdf' usa una
//    paleta fija (ver ./helpers).
//
// Helpers no-componente (palette, criticalStroke, fitViewBox, tipos) viven en
// ./helpers para cumplir react-refresh; se re-exportan aquí por comodidad.

import { useId, type ReactNode } from "react";
import {
  palette,
  strokeOf,
  criticalStroke,
  type SvgMode,
  type Kind,
} from "./helpers";

export type { SvgMode, Kind, Palette } from "./helpers";

export interface DiagramSvgProps {
  /** viewBox en unidades del dominio: [minX, minY, width, height] (mm). */
  viewBox: [number, number, number, number];
  /** Tamaño en px en pantalla; el contenido escala por viewBox. */
  width: number;
  height: number;
  /** Texto accesible obligatorio. */
  title: string;
  desc: string;
  mode: SvgMode;
  children: ReactNode;
}

/** Lienzo SVG accesible y auto-escalado. */
export function DiagramSvg({ viewBox, width, height, title, desc, mode, children }: DiagramSvgProps) {
  const id = useId();
  const titleId = `${id}-t`;
  const descId = `${id}-d`;
  const [minX, minY, w, h] = viewBox;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`${minX} ${minY} ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      data-mode={mode}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      {children}
    </svg>
  );
}

export interface SegProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind?: Kind;
  mode: SvgMode;
  /** Grosor base en unidades de viewBox (mm). */
  base?: number;
}

/** Segmento de línea (tramo, conducto, eje). */
export function Seg({ x1, y1, x2, y2, kind = "normal", mode, base = 1.2 }: SegProps) {
  const pal = palette(mode);
  const cs = criticalStroke(kind, base);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={strokeOf(kind, pal)}
      strokeWidth={cs.strokeWidth}
      strokeDasharray={cs.strokeDasharray}
      strokeLinecap="round"
    />
  );
}

export interface DotProps {
  x: number;
  y: number;
  r?: number;
  kind?: Kind;
  mode: SvgMode;
}

/** Nodo (unión, local, punto de cálculo). */
export function Dot({ x, y, r = 2.2, kind = "normal", mode }: DotProps) {
  const pal = palette(mode);
  return <circle cx={x} cy={y} r={r} fill={strokeOf(kind, pal)} />;
}

export interface TagProps {
  x: number;
  y: number;
  children: string;
  mode: SvgMode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  /** Etiqueta de elemento crítico (color crítico + negrita). */
  critical?: boolean;
}

/** Etiqueta de texto directa sobre el elemento (refuerzo redundante al color). */
export function Tag({ x, y, children, mode, anchor = "middle", size = 4, critical = false }: TagProps) {
  const pal = palette(mode);
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={critical ? pal.critical : pal.label}
      fontWeight={critical ? 700 : 400}
      fontFamily="system-ui, sans-serif"
    >
      {children}
    </text>
  );
}

export interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mode: SvgMode;
  kind?: Kind;
  base?: number;
}

/** Flecha de flujo (admisión→extracción, sentido de escorrentía…). */
export function Arrow({ x1, y1, x2, y2, mode, kind = "flow", base = 1.2 }: ArrowProps) {
  const pal = palette(mode);
  const color = strokeOf(kind, pal);
  const cs = criticalStroke(kind, base);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 3;
  const ax = x2 - head * Math.cos(angle - Math.PI / 6);
  const ay = y2 - head * Math.sin(angle - Math.PI / 6);
  const bx = x2 - head * Math.cos(angle + Math.PI / 6);
  const by = y2 - head * Math.sin(angle + Math.PI / 6);
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={cs.strokeWidth}
        strokeDasharray={cs.strokeDasharray}
        strokeLinecap="round"
      />
      <polyline
        points={`${ax},${ay} ${x2},${y2} ${bx},${by}`}
        fill="none"
        stroke={color}
        strokeWidth={cs.strokeWidth}
      />
    </g>
  );
}
