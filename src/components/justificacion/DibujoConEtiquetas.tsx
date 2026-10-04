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

// Medidas del chip [px] (h-[26px], px-[7px], punto 6 + hueco 5, mono 12 px ≈ 7,25 px/carácter).
const CHIP_ALTO = 26;
const CHIP_FIJO = 2 * 7 + 6 + 5 + 2;
const CHIP_CARACTER = 7.25;
const HOLGURA = 4;
/** Saltos verticales que se prueban, en alturas de chip, cuando dos se pisan. */
const SALTOS = [0, 1, -1, 2, -2];

/**
 * Centro de cada chip [px]. Las anclas vienen del dibujo, pero los chips miden
 * lo mismo a cualquier escala: con el dibujo estrecho, dos anclas vecinas se
 * pisan. En orden, cada chip que choca con uno ya colocado se escalona arriba o
 * abajo; si no cabe en ningún salto, se queda en su ancla.
 */
function colocar(etiquetas: EtiquetaDibujo[], ancho: number, alto: number, viewW: number, viewH: number) {
  const puestas: { x: number; y: number; w: number }[] = [];
  return etiquetas.map((e) => {
    const x = (e.x / viewW) * ancho;
    const y0 = (e.y / viewH) * alto;
    const w = e.texto.length * CHIP_CARACTER + CHIP_FIJO;
    const choca = (y: number) =>
      puestas.some(
        (p) =>
          Math.abs(p.x - x) < (p.w + w) / 2 + HOLGURA && Math.abs(p.y - y) < CHIP_ALTO + HOLGURA,
      );
    const salto = SALTOS.map((k) => y0 + k * (CHIP_ALTO + HOLGURA)).find(
      (y) => y - CHIP_ALTO / 2 >= 0 && y + CHIP_ALTO / 2 <= alto && !choca(y),
    );
    const y = salto ?? y0;
    puestas.push({ x, y, w });
    return { x, y };
  });
}

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
  const sitios = colocar(etiquetas, ancho, alto, viewW, viewH);
  return (
    <div className="relative" style={{ width: ancho, height: alto }}>
      {svg}
      <ul aria-label="Cifras del dibujo">
        {etiquetas.map((e, i) => {
          const on = e.elementoId === seleccion;
          return (
            <li key={e.key}>
              <button
                type="button"
                onClick={() => onSelect(e.elementoId)}
                aria-pressed={on}
                aria-label={`${e.nombre}: ${e.texto}, ${TEXTO_ESTADO[e.estado]}`}
                style={{ left: sitios[i].x, top: sitios[i].y }}
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
