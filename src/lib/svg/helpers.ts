// Helpers no-componente de las primitivas SVG (separados de primitives.tsx para
// cumplir react-refresh/only-export-components).

export type SvgMode = "screen" | "pdf";
export type Kind = "normal" | "flow" | "critical";

export interface Palette {
  section: string;
  flow: string;
  critical: string;
  dim: string;
  dimText: string;
  label: string;
}

// 'pdf' = paleta fija (sin var(), que no resuelve al rasterizar el SVG aislado);
// legible también en gris. El crítico se apoya en trazo grueso + discontinuo +
// etiqueta, no solo en el color.
const PDF_PALETTE: Palette = {
  section: "#475569",
  flow: "#334155",
  critical: "#b91c1c",
  dim: "#64748b",
  dimText: "#334155",
  label: "#0f172a",
};

const SCREEN_PALETTE: Palette = {
  section: "var(--color-chart-section)",
  flow: "var(--color-chart-flow)",
  critical: "var(--color-chart-critical)",
  dim: "var(--color-chart-dim)",
  dimText: "var(--color-chart-dim-text)",
  label: "var(--color-chart-label)",
};

export function palette(mode: SvgMode): Palette {
  return mode === "pdf" ? PDF_PALETTE : SCREEN_PALETTE;
}

export function strokeOf(kind: Kind, pal: Palette): string {
  if (kind === "critical") return pal.critical;
  if (kind === "flow") return pal.flow;
  return pal.section;
}

/**
 * Codificación MULTICANAL del elemento crítico (WCAG 1.4.1): no depender del
 * color. Devuelve grosor mayor + trazo discontinuo para `critical`.
 */
export function criticalStroke(
  kind: Kind,
  base = 1.2,
): { strokeWidth: number; strokeDasharray?: string } {
  if (kind === "critical") return { strokeWidth: base * 2, strokeDasharray: "4 2" };
  return { strokeWidth: base };
}

/**
 * viewBox que encuadra una nube de puntos del dominio + padding (SPEC §7:
 * bbox auto-calculado de los DATOS, no `getBBox()` del DOM).
 */
export function fitViewBox(
  points: Array<{ x: number; y: number }>,
  padding = 8,
): [number, number, number, number] {
  if (points.length === 0) return [0, 0, 100, 100];
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return [minX - padding, minY - padding, maxX - minX + 2 * padding, maxY - minY + 2 * padding];
}
