import type { JSX, ReactNode } from "react";
import { TEXTO_ESTADO, type EstadoPresentacion } from "../../lib/cte/presentacion";

// =============================================================================
// El dibujo con sus cifras encima (REDISENO-V4 §3.3, feature-14 §H). El SVG va
// a su tamaño ajustado y cada cifra es un BOTÓN HTML colocado en % sobre su
// ancla del viewBox: se lee, se enfoca con el teclado y se pulsa. Pulsar
// selecciona el elemento; la franja y la lista lo siguen.
//
// Estado multicanal (WCAG 1.4.1): punto de color, borde (discontinuo en lo
// previsto) y el estado en el nombre accesible, nunca solo el color. En papel
// las etiquetas van dentro del SVG (svg2pdf no ve HTML): eso es cosa del módulo.
// =============================================================================

export interface EtiquetaDibujo {
  /** Clave única de la etiqueta (un elemento puede tener varias). */
  key: string;
  elementoId: string;
  /** Ancla en unidades del viewBox. */
  x: number;
  y: number;
  texto: string;
  estado: EstadoPresentacion;
  /** Nombre del elemento para el lector de pantalla («Bajante A · fecales»). */
  nombre: string;
}

const CHIP: Record<EstadoPresentacion, string> = {
  ok: "border-border-main text-text-primary bg-bg-primary",
  rv: "border-state-warn/55 text-state-warn bg-bg-primary",
  ko: "border-state-fail/60 text-state-fail bg-[color-mix(in_srgb,var(--color-state-fail)_7%,var(--color-bg-primary))]",
  pv: "border-border-main border-dashed text-text-secondary bg-bg-primary",
  in: "border-border-main text-text-secondary bg-bg-primary",
  dt: "border-border-main text-text-secondary bg-bg-primary",
  fu: "border-border-main text-text-secondary bg-bg-primary",
};

const PUNTO: Record<EstadoPresentacion, string> = {
  ok: "bg-state-ok",
  rv: "bg-state-warn",
  ko: "bg-state-fail",
  pv: "border-[1.5px] border-text-disabled",
  in: "bg-text-disabled",
  dt: "bg-text-disabled",
  fu: "bg-text-disabled",
};

interface DibujoConEtiquetasProps {
  /** Tamaño al que se pinta el SVG [px]. */
  ancho: number;
  alto: number;
  /** Tamaño del viewBox. */
  viewW: number;
  viewH: number;
  svg: ReactNode;
  etiquetas: EtiquetaDibujo[];
  seleccion: string | null;
  onSelect: (elementoId: string) => void;
}

export function DibujoConEtiquetas({
  ancho,
  alto,
  viewW,
  viewH,
  svg,
  etiquetas,
  seleccion,
  onSelect,
}: DibujoConEtiquetasProps): JSX.Element {
  return (
    <div className="relative" style={{ width: ancho, height: alto }}>
      {svg}
      <ul aria-label="Cifras del dibujo">
        {etiquetas.map((e) => {
          const on = e.elementoId === seleccion;
          return (
            <li key={e.key}>
              <button
                type="button"
                onClick={() => onSelect(e.elementoId)}
                aria-pressed={on}
                aria-label={`${e.nombre}: ${e.texto}, ${TEXTO_ESTADO[e.estado]}`}
                style={{ left: `${(e.x / viewW) * 100}%`, top: `${(e.y / viewH) * 100}%` }}
                className={[
                  "absolute inline-flex h-[26px] -translate-x-1/2 -translate-y-1/2 items-center gap-[5px] rounded border px-[7px] font-mono text-[12px] font-medium whitespace-nowrap transition-colors",
                  on
                    ? "border-accent bg-accent text-bg-primary z-[2]"
                    : `${CHIP[e.estado]} hover:border-text-disabled z-[1]`,
                ].join(" ")}
              >
                <i
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${on ? "bg-bg-primary" : PUNTO[e.estado]}`}
                />
                {e.texto}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
