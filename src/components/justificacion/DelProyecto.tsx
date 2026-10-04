import { useId, useRef, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router";
import { Pencil } from "lucide-react";
import type { HerenciaBinding } from "./ModuleLayout";
import { ExcepcionesLocales } from "./ExcepcionesLocales";

// =============================================================================
// «Del proyecto» (REDISENO-V4 §3.3): los datos que la justificación toma del
// expediente, arriba de la columna izquierda. Sustituye a la barra de contexto
// horizontal. Cada dato muestra su valor efectivo; si difiere del proyecto
// (excepción local) lleva lápiz. Pulsar abre el popover de excepciones.
// Se convertirá en «Qué entra» con el contrato de resultado de las fases 4 y 5.
// =============================================================================

type Campo = HerenciaBinding["campos"][number];

/** Valor EFECTIVO del campo formateado (con unidad si la hay). */
function fmtValor(c: Campo): string {
  const v = c.valorActual;
  if (c.editor.tipo === "boolean") return v ? "Sí" : "No";
  if (c.editor.tipo === "select") {
    const op = c.editor.opciones?.find((o) => o.valor === String(v));
    if (op) return op.etiqueta;
  }
  if (v === null || v === undefined || v === "") return "—";
  return c.editor.unidad ? `${String(v)} ${c.editor.unidad}` : String(v);
}

interface DelProyectoProps {
  proyectoId: string;
  herencia?: HerenciaBinding;
}

export function DelProyecto({
  proyectoId,
  herencia,
}: DelProyectoProps): JSX.Element | null {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const campos = herencia?.campos ?? [];
  if (campos.length === 0) return null;

  return (
    <section ref={wrapRef} className="relative pb-2" aria-label="Del proyecto">
      <div className="text-text-disabled flex items-baseline justify-between gap-2 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Del proyecto
        <Link
          to={`/p/${proyectoId}/edificio`}
          className="text-accent hover:text-accent-hover text-[11.5px] font-medium tracking-normal normal-case"
        >
          Cambiar en El edificio
        </Link>
      </div>
      <ul>
        {campos.map((c) => (
          <li key={c.campo}>
            <button
              type="button"
              onClick={() => setAbierto((o) => !o)}
              aria-expanded={abierto}
              aria-haspopup="dialog"
              aria-controls={abierto ? popoverId : undefined}
              title={
                c.override
                  ? "Difiere del proyecto (excepción local)"
                  : "Heredado del proyecto"
              }
              className="hover:bg-bg-surface -mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors"
            >
              <span className="text-text-secondary min-w-0 flex-1 truncate">
                {c.etiqueta}
              </span>
              {c.override && (
                <Pencil
                  size={11}
                  className="text-accent shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={`shrink-0 font-mono text-[12px] tabular-nums ${c.override ? "text-accent" : "text-text-primary"}`}
              >
                {fmtValor(c)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {abierto && herencia && (
        <ExcepcionesLocales
          id={popoverId}
          herencia={herencia}
          anchorRef={wrapRef}
          onClose={() => setAbierto(false)}
        />
      )}
    </section>
  );
}
