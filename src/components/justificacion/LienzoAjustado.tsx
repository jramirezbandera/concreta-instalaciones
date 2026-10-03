import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";
import type { Caja } from "../../lib/ui/ajustar";

// =============================================================================
// Lienzo del dibujo (REDISENO-V4 §3.3). Mide la caja disponible —ancho Y alto—
// y se la pasa al módulo para que el SVG quepa ENTERO sin scroll: el dibujo es
// lo principal y no debe quedar ni encajonado ni cortado. El papel de puntos es
// el de Concreta (`.canvas-dot-grid`).
// =============================================================================

/** Caja por defecto mientras no hay medida (primer render, jsdom). */
const CAJA_DEFECTO: Caja = { ancho: 640, alto: 520 };

export function LienzoAjustado({
  children,
}: {
  children: (caja: Caja) => ReactNode;
}): JSX.Element {
  const [caja, setCaja] = useState<Caja>(CAJA_DEFECTO);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    const medir = (ancho: number, alto: number) => {
      // Sin medida real (jsdom, nodo oculto) se conserva la caja por defecto.
      if (ancho > 0 && alto > 0) setCaja({ ancho, alto });
    };
    const observer = new ResizeObserver((entries) => {
      for (const e of entries) medir(e.contentRect.width, e.contentRect.height);
    });
    observer.observe(el);
    observerRef.current = observer;
    const r = el.getBoundingClientRect();
    medir(r.width, r.height);
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <div className="canvas-dot-grid bg-bg-primary relative flex min-h-[360px] flex-1 flex-col p-5 max-lg:min-h-[420px]">
      {/* La caja medida no depende del dibujo (va en absoluto dentro): si el SVG
          la empujara, cada medida agrandaría el dibujo y este a la caja. */}
      <div ref={ref} className="relative min-h-0 flex-1">
        <div className="absolute inset-0 flex items-center justify-center">
          {children(caja)}
        </div>
      </div>
    </div>
  );
}
