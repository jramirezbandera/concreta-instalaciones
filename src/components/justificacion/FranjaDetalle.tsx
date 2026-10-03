import type { JSX, ReactNode } from "react";

// =============================================================================
// Franja de detalle bajo el dibujo (REDISENO-V4 §3.3): lo seleccionado, en una
// banda baja a lo ancho — qué es · lo que manda · cuentas y cita. Hasta que los
// motores devuelvan `ElementoResultado` (fases 4-5) la franja recibe el resumen
// en texto que ya produce cada módulo; las columnas «lo que manda» y «cuentas»
// llegan como `manda` / `cuentas` cuando el módulo las tenga.
// =============================================================================

interface FranjaDetalleProps {
  /** Resumen del elemento seleccionado, o null si no hay selección. */
  seleccion: string | null;
  /** Qué hacer para ver detalle cuando no hay nada seleccionado. */
  pista?: string;
  /** Rótulo del resumen. Por defecto «Seleccionado»; HS6 dice «Lo que falta». */
  etiqueta?: string;
  manda?: ReactNode;
  cuentas?: ReactNode;
}

export function FranjaDetalle({
  seleccion,
  pista = "Pulsa un elemento del dibujo para ver su detalle.",
  etiqueta = "Seleccionado",
  manda,
  cuentas,
}: FranjaDetalleProps): JSX.Element {
  if (seleccion === null) {
    return (
      <div className="border-border-main bg-bg-surface text-text-disabled shrink-0 border-t px-5 py-3 text-[12px]">
        {pista}
      </div>
    );
  }
  return (
    <div
      className="border-border-main bg-bg-surface flex shrink-0 flex-wrap border-t"
      aria-live="polite"
    >
      <div className="min-w-0 flex-[1_1_260px] px-5 py-3 shadow-[inset_3px_0_0_var(--color-accent)]">
        <p className="text-text-primary text-[13px] leading-snug">
          <span className="text-text-disabled mr-1 text-[10px] font-semibold tracking-[0.09em] uppercase">
            {etiqueta}:
          </span>{" "}
          {seleccion}
        </p>
      </div>
      {manda !== undefined && (
        <div className="min-w-0 flex-[1.4_1_280px] px-5 py-3 text-[12.5px]">
          {manda}
        </div>
      )}
      {cuentas !== undefined && (
        <div className="min-w-0 flex-[1.2_1_260px] px-5 py-3 text-[12.5px]">
          {cuentas}
        </div>
      )}
    </div>
  );
}
