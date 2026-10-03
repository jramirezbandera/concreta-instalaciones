import type { JSX } from "react";
import type { Veredicto } from "../../lib/proyecto/tipos";
import { STATE_TEXT } from "../../lib/ui/veredicto";

// Fila «concepto · valor» de los resúmenes de módulo, dentro de un <dl>. Cabe
// en la columna estrecha de la izquierda: el valor y su nota van apilados a la
// derecha en vez de en línea. Con `estado` el valor toma el color del veredicto
// (nunca solo color: la nota o el propio valor dicen qué es).

interface FilaResumenProps {
  k: string;
  v: string;
  sub?: string;
  estado?: Veredicto;
}

export function FilaResumen({
  k,
  v,
  sub,
  estado,
}: FilaResumenProps): JSX.Element {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1.5">
      <dt className="text-text-secondary min-w-0">{k}</dt>
      <dd className="flex shrink-0 flex-col items-end text-right">
        <span
          className={`tabular-nums ${estado ? `font-semibold ${STATE_TEXT[estado]}` : "text-text-primary"}`}
        >
          {v}
        </span>
        {sub && (
          <span className="text-text-disabled text-[11px] leading-snug">
            {sub}
          </span>
        )}
      </dd>
    </div>
  );
}
