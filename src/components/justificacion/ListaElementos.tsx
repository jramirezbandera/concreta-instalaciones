import type { JSX } from "react";
import type { Veredicto } from "../../lib/proyecto/tipos";

// =============================================================================
// Lista compacta de elementos para la columna izquierda (REDISENO-V4 §3.3): los
// cerramientos de HE1, las estancias de HS3… Cada fila dice su nombre, una cifra
// y su estado; pulsarla la selecciona, y el dibujo y la franja la siguen. Es la
// misma selección que la del dibujo y la de Comprobaciones.
// Accesibilidad: botones con aria-pressed; el estado va en texto, no solo en el
// punto de color.
// =============================================================================

export interface ElementoLista {
  id: string;
  nombre: string;
  /** Cifra en mono a la derecha: «U 0,38», «8 l/s». */
  valor?: string;
  estado: Veredicto;
}

const PUNTO: Record<Veredicto, string> = {
  ok: "bg-state-ok",
  warn: "bg-state-warn",
  fail: "bg-state-fail",
  neutral: "bg-text-disabled",
};

const TEXTO_ESTADO: Record<Veredicto, string> = {
  ok: "cumple",
  warn: "por revisar",
  fail: "no cumple",
  neutral: "informativo",
};

interface ListaElementosProps {
  titulo: string;
  elementos: ElementoLista[];
  /** Elemento que se ve ahora en el dibujo (aunque no haya selección explícita). */
  activoId: string | null;
  onSelect: (id: string) => void;
}

export function ListaElementos({
  titulo,
  elementos,
  activoId,
  onSelect,
}: ListaElementosProps): JSX.Element | null {
  if (elementos.length === 0) return null;
  return (
    <section aria-label={titulo} className="pb-2">
      <div className="text-text-disabled pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        {titulo}
      </div>
      <ul>
        {elementos.map((el) => {
          const activo = el.id === activoId;
          return (
            <li key={el.id}>
              <button
                type="button"
                onClick={() => onSelect(el.id)}
                aria-pressed={activo}
                className={[
                  "-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors",
                  activo ? "bg-tint-accent" : "hover:bg-bg-surface",
                ].join(" ")}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${PUNTO[el.estado]}`}
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={`truncate text-[13px] ${activo ? "text-accent font-medium" : "text-text-primary"}`}
                  >
                    {el.nombre}
                  </span>
                  <span className="text-text-disabled truncate font-mono text-[10.5px]">
                    {el.valor ? `${el.valor} · ` : ""}
                    {TEXTO_ESTADO[el.estado]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
