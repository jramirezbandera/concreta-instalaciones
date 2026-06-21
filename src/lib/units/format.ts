// Helpers de PRESENTACIÓN. El motor de cálculo opera en IEEE-754 doble SIN
// redondear (determinismo para snapshots); el redondeo vive aquí, en la frontera
// de presentación (UI + ficha). Convención del SPEC §4/§11.

/** Redondea a `decimals` decimales para mostrar. No usar dentro del motor. */
export function round(value: number, decimals = 1): number {
  if (!Number.isFinite(value)) return value;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Formatea un número con unidad para UI/ficha, p.ej. `fmt(49.97, "l/s")` →
 * "50 l/s". Usa coma decimal (es-ES). Devuelve "—" para valores no finitos.
 */
export function fmt(value: number, unit?: string, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  const n = round(value, decimals).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return unit ? `${n} ${unit}` : n;
}
