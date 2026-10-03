import { useId, useRef, useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router";
import { ArrowLeft, Pencil, SquarePen } from "lucide-react";
import type { HerenciaBinding } from "./ModuleShell";
import { ExcepcionesLocales } from "./ExcepcionesLocales";

// Barra de contexto heredado del ModuleShell (feature-6 T3.3-bis): "← Proyecto",
// chips `etiqueta: valor efectivo` de los campos de herencia (override → borde
// distinto + icono lápiz + title "difiere del proyecto") y enlace "editar en
// proyecto". Clic en un chip abre el popover <ExcepcionesLocales>. Cuando no hay
// proyecto (sandbox _smoke) ModuleShell NO monta esta barra — aquí `proyectoId`
// es obligatorio.

type Campo = HerenciaBinding["campos"][number];

/** Valor EFECTIVO del campo formateado para el chip (con unidad si la hay). */
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

interface BarraContextoProps {
  proyectoId: string;
  /** Sin binding (módulo sin campos heredados) → barra solo con los enlaces. */
  herencia?: HerenciaBinding;
}

export function BarraContexto({ proyectoId, herencia }: BarraContextoProps): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const campos = herencia?.campos ?? [];

  return (
    <div ref={wrapRef} className="border-border-sub bg-bg-surface relative shrink-0 border-b">
      <div className="scroll-hide flex items-center gap-2 overflow-x-auto px-4 py-1.5">
        <Link
          to={`/p/${proyectoId}`}
          className="text-text-secondary hover:text-text-primary flex shrink-0 items-center gap-1 text-[12px] transition-colors"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Proyecto
        </Link>

        {campos.length > 0 && (
          <>
            <span aria-hidden="true" className="bg-border-sub h-4 w-px shrink-0" />
            {campos.map((c) => (
              <button
                key={c.campo}
                type="button"
                onClick={() => setAbierto((o) => !o)}
                aria-expanded={abierto}
                aria-haspopup="dialog"
                aria-controls={abierto ? popoverId : undefined}
                title={c.override ? "difiere del proyecto" : `${c.etiqueta} — heredado del proyecto`}
                className={[
                  "flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[11px] transition-colors",
                  c.override
                    ? "border-accent/60 bg-tint-accent hover:border-accent"
                    : "border-border-sub bg-bg-primary hover:border-border-main",
                ].join(" ")}
              >
                {c.override && <Pencil size={11} className="text-accent shrink-0" aria-hidden="true" />}
                <span className="text-text-disabled">{c.etiqueta}:</span>
                <span className="text-text-primary font-medium tabular-nums">{fmtValor(c)}</span>
              </button>
            ))}
          </>
        )}

        <div className="flex-1" />

        <Link
          to={`/p/${proyectoId}/datos`}
          className="text-accent hover:text-accent-hover flex shrink-0 items-center gap-1 text-[11px] transition-colors"
        >
          <SquarePen size={11} aria-hidden="true" />
          editar en proyecto
        </Link>
      </div>

      {abierto && herencia && (
        <ExcepcionesLocales
          id={popoverId}
          herencia={herencia}
          anchorRef={wrapRef}
          onClose={() => setAbierto(false)}
        />
      )}
    </div>
  );
}
