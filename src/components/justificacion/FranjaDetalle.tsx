import type { JSX, ReactNode } from "react";
import { TEXTO_ESTADO, type DetalleElemento, type EstadoPresentacion } from "../../lib/cte/presentacion";

// =============================================================================
// Franja de detalle bajo el dibujo (REDISENO-V4 §3.3): lo seleccionado, en una
// banda baja a lo ancho — qué es · lo que manda · cuentas y cita.
//
// Dos formas:
//   - `detalle` (feature-14): el elemento ya redactado por el módulo, en tres
//     columnas: la cifra grande con su estado; «Lo que manda» y la nota; las
//     cuentas, la capacidad usada y la cita;
//   - `seleccion` (fase 1): el resumen en texto, para los módulos que aún no
//     devuelven el contrato de §3.2.
// =============================================================================

interface FranjaDetalleProps {
  /** Resumen del elemento seleccionado, o null si no hay selección. */
  seleccion?: string | null;
  /** El elemento redactado (tiene prioridad sobre `seleccion`). */
  detalle?: DetalleElemento | null;
  /** Qué hacer para ver detalle cuando no hay nada seleccionado. */
  pista?: string;
  /** Rótulo del resumen. Por defecto «Seleccionado»; HS6 dice «Lo que falta». */
  etiqueta?: string;
  manda?: ReactNode;
  cuentas?: ReactNode;
  /** Un botón bajo «Lo que manda» (feature-15): «Quitar el grupo de presión». */
  accion?: ReactNode;
}

const ESTADO: Record<EstadoPresentacion, string> = {
  ok: "text-state-ok",
  rv: "text-state-warn",
  ko: "text-state-fail",
  pv: "text-text-disabled",
  in: "text-text-disabled",
  dt: "text-text-disabled",
  fu: "text-text-disabled",
};

const BARRA: Record<EstadoPresentacion, string> = {
  ok: "bg-state-ok",
  rv: "bg-state-warn",
  ko: "bg-state-fail",
  pv: "bg-text-disabled",
  in: "bg-text-disabled",
  dt: "bg-text-disabled",
  fu: "bg-text-disabled",
};

function Estructurada({ d, accion }: { d: DetalleElemento; accion?: ReactNode }): JSX.Element {
  const usoPct = d.uso === undefined ? null : Math.round(d.uso * 100);
  const estadoBarra: EstadoPresentacion = d.estado === "ko" || (d.uso ?? 0) > 1 ? "ko" : d.estado === "rv" ? "rv" : "ok";
  return (
    <div className="border-border-main bg-bg-surface flex shrink-0 flex-wrap border-t" aria-live="polite">
      <div className="min-w-0 flex-[1_1_220px] px-5 pt-3 pb-3.5 shadow-[inset_3px_0_0_var(--color-accent)]">
        <div className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">{d.clase}</div>
        <div className="text-text-primary mt-0.5 text-[15px] leading-snug font-semibold">{d.titulo}</div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          <b className="text-text-primary font-mono text-[26px] leading-[1.1] font-semibold tracking-[-0.02em]">
            {d.valor}
          </b>
          {d.unidad && <span className="text-text-secondary font-mono text-[12px]">{d.unidad}</span>}
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${ESTADO[d.estado]}`}>
            <i aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />
            {TEXTO_ESTADO[d.estado]}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1.4_1_280px] flex-col gap-2 px-5 pt-3 pb-3.5">
        <div className="rounded bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-bg-primary))] px-[11px] py-[9px] text-[12.5px] leading-normal">
          <b className="text-accent mb-0.5 block text-[10px] font-semibold tracking-[0.09em] uppercase">
            Lo que manda
          </b>
          {d.manda}
        </div>
        {d.nota && <p className="text-text-secondary text-[12px] leading-normal">{d.nota}</p>}
        {accion && <div>{accion}</div>}
      </div>
      <div className="min-w-0 flex-[1.2_1_260px] px-5 pt-3 pb-3.5">
        <dl>
          {d.filas.map((f) => (
            <div
              key={f.k}
              className="border-border-sub text-text-secondary flex items-baseline justify-between gap-3 border-b py-[5px] text-[12.5px]"
            >
              <dt>{f.k}</dt>
              <dd className="text-text-primary text-right font-mono text-[12px] font-medium">{f.v}</dd>
            </div>
          ))}
        </dl>
        {usoPct !== null && (
          <div className="text-text-secondary flex items-center gap-2.5 py-[7px] text-[12px]">
            <span>Capacidad usada</span>
            <span className="bg-border-sub h-1 flex-1 overflow-hidden rounded-sm" aria-hidden="true">
              <i className={`block h-full ${BARRA[estadoBarra]}`} style={{ width: `${Math.min(usoPct, 100)}%` }} />
            </span>
            <b className="text-text-primary min-w-[38px] text-right font-mono text-[12px] font-medium">{usoPct} %</b>
          </div>
        )}
        <div className="text-text-disabled pt-1.5 font-mono text-[10.5px]">{d.cita}</div>
      </div>
    </div>
  );
}

export function FranjaDetalle({
  seleccion = null,
  detalle,
  pista = "Pulsa un elemento del dibujo para ver su detalle.",
  etiqueta = "Seleccionado",
  manda,
  cuentas,
  accion,
}: FranjaDetalleProps): JSX.Element {
  if (detalle) return <Estructurada d={detalle} accion={accion} />;
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
