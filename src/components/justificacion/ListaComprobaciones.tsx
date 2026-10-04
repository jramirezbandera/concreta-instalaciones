import type { JSX, ReactNode } from "react";
import { TEXTO_ESTADO, type EstadoPresentacion } from "../../lib/cte/presentacion";

// =============================================================================
// La pestaña Comprobaciones (REDISENO-V4 §3.3, feature-14 §H): todos los
// elementos de la justificación en una lista de solo lectura — punto, nombre,
// resultado y estado EN TEXTO. Es la alternativa accesible al dibujo (SPEC
// §4.4): cada fila es un botón y comparte la selección con el dibujo y la
// franja.
// =============================================================================

export interface FilaComprobacion {
  id: string;
  nombre: string;
  /** «Ø110 · 42 %», «primaria». */
  resultado: string;
  estado: EstadoPresentacion;
}

const PUNTO: Record<EstadoPresentacion, string> = {
  ok: "bg-state-ok",
  rv: "bg-state-warn",
  ko: "bg-state-fail",
  pv: "border-[1.5px] border-text-disabled",
  in: "bg-text-disabled",
  dt: "bg-text-disabled",
  fu: "bg-text-disabled",
};

const TEXTO: Record<EstadoPresentacion, string> = {
  ok: "text-state-ok",
  rv: "text-state-warn",
  ko: "text-state-fail",
  pv: "text-text-disabled",
  in: "text-text-disabled",
  dt: "text-text-disabled",
  fu: "text-text-disabled",
};

interface ListaComprobacionesProps {
  filas: FilaComprobacion[];
  seleccion: string | null;
  onSelect: (id: string) => void;
  /** Lo que va tras la lista («Ajustar a mano»…). */
  pie?: ReactNode;
}

const COLUMNAS = "grid grid-cols-[8px_minmax(0,1.5fr)_minmax(0,1fr)_96px] items-center gap-3";

export function ListaComprobaciones({ filas, seleccion, onSelect, pie }: ListaComprobacionesProps): JSX.Element {
  const pendientes = filas.filter((f) => f.estado === "rv").length;
  const fallan = filas.filter((f) => f.estado === "ko").length;
  const resumen =
    fallan > 0
      ? `${filas.length} · ${fallan} no ${fallan === 1 ? "cumple" : "cumplen"}`
      : pendientes > 0
        ? `${filas.length} · ${pendientes} por revisar`
        : `${filas.length} · todo bien`;
  return (
    <div className="mx-auto w-full max-w-[920px]">
      <div className="border-border-main overflow-hidden rounded border">
        <div
          className={`${COLUMNAS} bg-bg-surface text-text-disabled px-3.5 py-2.5 text-[10px] font-semibold tracking-[0.09em] uppercase`}
          aria-hidden="true"
        >
          <span />
          <span>Comprobación · {resumen}</span>
          <span>Resultado</span>
          <span>Estado</span>
        </div>
        <ul aria-label={`Comprobaciones: ${resumen}`}>
          {filas.map((f) => {
            const on = f.id === seleccion;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onSelect(f.id)}
                  aria-pressed={on}
                  className={[
                    `${COLUMNAS} border-border-sub min-h-[42px] w-full border-t px-3.5 py-2 text-left text-[13px] transition-colors`,
                    on
                      ? "bg-tint-accent shadow-[inset_3px_0_0_var(--color-accent)]"
                      : "hover:bg-bg-surface",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${PUNTO[f.estado]}`} />
                  <span className="text-text-primary min-w-0 truncate">{f.nombre}</span>
                  <span className="text-text-secondary min-w-0 truncate font-mono text-[12px]">{f.resultado}</span>
                  <span className={`text-[12px] font-semibold ${TEXTO[f.estado]}`}>{TEXTO_ESTADO[f.estado]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {pie}
    </div>
  );
}
