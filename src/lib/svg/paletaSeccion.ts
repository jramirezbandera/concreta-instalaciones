// =============================================================================
// Paletas de los dibujos de sección (feature-15 §B): pantalla y papel. En papel
// los colores son fijos porque las variables CSS no se resuelven al rasterizar
// el SVG suelto. Solo constantes.
// =============================================================================

export interface PaletaSeccion {
  ink: string;
  accent: string;
  warn: string;
  fail: string;
  ok: string;
  slab: string;
  earth: string;
  wall: string;
  fondo: string;
  caja: string;
  texto: string;
  texto2: string;
  texto3: string;
}

export const PALETA_PANTALLA: PaletaSeccion = {
  ink: "var(--color-ink)",
  accent: "var(--color-accent)",
  warn: "var(--color-state-warn)",
  fail: "var(--color-state-fail)",
  ok: "var(--color-state-ok)",
  slab: "var(--color-slab)",
  earth: "var(--color-earth)",
  wall: "var(--color-border-main)",
  fondo: "var(--color-bg-primary)",
  caja: "var(--color-border-main)",
  texto: "var(--color-text-primary)",
  texto2: "var(--color-text-secondary)",
  texto3: "var(--color-text-disabled)",
};

export const PALETA_PAPEL: PaletaSeccion = {
  ink: "#475569",
  accent: "#0f172a",
  warn: "#92400e",
  fail: "#b91c1c",
  ok: "#15803d",
  slab: "#e2e8f0",
  earth: "#c3cbd6",
  wall: "#cbd5e1",
  fondo: "#ffffff",
  caja: "#94a3b8",
  texto: "#0f172a",
  texto2: "#475569",
  texto3: "#64748b",
};

export const FUENTE_MONO = "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace";
export const FUENTE_SANS = "Geist Sans, Geist, system-ui, sans-serif";
