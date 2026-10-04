import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

// =============================================================================
// «Qué entra» (REDISENO-V4 §3.3, feature-14 §H): las partes del edificio que
// toca esta justificación y cómo las trata («se calcula», «previsión»,
// «bombeo»…). Sustituye a «Del proyecto» en los módulos que ya leen El
// edificio. Pulsar una fila selecciona su elemento en el dibujo y en la franja.
// =============================================================================

/** Cómo se pinta el trato: normal, previsto (discontinuo), por revisar, no cumple o fuera. */
export type TratoQueEntra = "normal" | "pv" | "rv" | "ko" | "out";

export interface FilaQueEntra {
  id: string;
  /** «Viviendas», «Local», «Garaje», «Cubierta». */
  titulo: string;
  /** «P1–P3 · 6 · A 23 UD · B 22 UD». */
  detalle: string;
  /** «se calcula», «previsión», «bombeo». */
  trato: string;
  estado: TratoQueEntra;
  /** El elemento que se selecciona al pulsar (sin él, la fila no es pulsable). */
  elementoId?: string;
}

const TRATO: Record<TratoQueEntra, string> = {
  normal: "border-border-sub text-text-secondary bg-bg-primary",
  pv: "border-border-main border-dashed text-text-disabled bg-bg-primary",
  rv: "border-state-warn/45 text-state-warn bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]",
  ko: "border-state-fail/45 text-state-fail bg-[color-mix(in_srgb,var(--color-state-fail)_6%,var(--color-bg-primary))]",
  out: "border-transparent text-text-disabled bg-bg-elevated",
};

interface QueEntraProps {
  filas: FilaQueEntra[];
  seleccion: string | null;
  onSelect: (elementoId: string) => void;
  /** Enlace de la cabecera («Editar el edificio»). */
  enlace?: { to: string; label: string };
  /** Lo que va debajo de las filas (una nota, «Red ajustada a mano»…). */
  pie?: ReactNode;
}

export function QueEntra({ filas, seleccion, onSelect, enlace, pie }: QueEntraProps): JSX.Element {
  return (
    <section aria-label="Qué entra" className="pb-1">
      <div className="text-text-disabled flex items-baseline justify-between gap-2 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Qué entra
        {enlace && (
          <Link
            to={enlace.to}
            className="text-accent hover:text-accent-hover text-[11.5px] font-medium tracking-normal normal-case"
          >
            {enlace.label}
          </Link>
        )}
      </div>
      {filas.length === 0 ? (
        <p className="text-text-disabled py-1 text-[12.5px]">Nada de El edificio entra en esta justificación.</p>
      ) : (
        <ul>
          {filas.map((f) => {
            const activa = f.elementoId !== undefined && f.elementoId === seleccion;
            const contenido = (
              <>
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="text-text-primary text-[13px] font-medium">{f.titulo}</span>
                  <span className="text-text-disabled truncate font-mono text-[10.5px]">{f.detalle}</span>
                </span>
                <span className={`shrink-0 rounded border px-[7px] py-[5px] text-[11.5px] leading-none whitespace-nowrap ${TRATO[f.estado]}`}>
                  {f.trato}
                </span>
              </>
            );
            return (
              <li key={f.id}>
                {f.elementoId !== undefined ? (
                  <button
                    type="button"
                    onClick={() => onSelect(f.elementoId!)}
                    aria-pressed={activa}
                    className={[
                      "-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors",
                      activa ? "bg-tint-accent" : "hover:bg-bg-surface",
                    ].join(" ")}
                  >
                    {contenido}
                  </button>
                ) : (
                  <div className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 px-2 py-1.5">{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pie}
    </section>
  );
}
