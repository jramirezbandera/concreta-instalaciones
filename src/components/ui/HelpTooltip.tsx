import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/**
 * Tooltip de ayuda por campo. Icono ⓘ que muestra explicación en un portal a
 * `body` (no se recorta en paneles con scroll). Cierra con Escape, scroll/resize,
 * y al salir ratón/foco. Sin sombra: eleva por superficie + borde. Portado
 * verbatim de "Concreta estructura".
 */
interface HelpTooltipProps {
  /** Texto de ayuda. Vacío/undefined → no renderiza nada (ni el icono). */
  text?: string;
  /** Referencia normativa opcional (2ª línea, atenuada). */
  refText?: string;
  /** Nombre del campo para el aria-label del icono. */
  fieldLabel?: string;
}

const GAP = 6;
const MARGIN = 8;
const MAX_W = 260;

export function HelpTooltip({ text, refText, fieldLabel }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current || !tipRef.current) return;
    const icon = btnRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    let left = icon.left + icon.width / 2 - tip.width / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - tip.width - MARGIN));
    let top = icon.bottom + GAP;
    if (top + tip.height > window.innerHeight - MARGIN) {
      top = icon.top - tip.height - GAP;
    }
    setPos({ top: Math.max(MARGIN, top), left });
  }, [open]);

  if (!text) return null;

  const aria = fieldLabel ? `Ayuda: ${fieldLabel}` : "Ayuda";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={aria}
        aria-describedby={open ? tipId : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={() => {
          setPos(null);
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          setPos(null);
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        className="text-text-secondary hover:text-accent focus:text-accent focus-visible:text-accent -m-1 inline-flex shrink-0 cursor-help items-center justify-center p-1 transition-colors outline-none"
      >
        <Info size={13} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={tipId}
            role="tooltip"
            style={{
              position: "fixed",
              top: pos ? pos.top : 0,
              left: pos ? pos.left : 0,
              maxWidth: MAX_W,
              visibility: pos ? "visible" : "hidden",
            }}
            className="bg-bg-surface border-border-main text-text-primary pointer-events-none z-50 rounded border px-2.5 py-1.5 text-[12px] leading-snug"
          >
            {text}
            {refText && (
              <span className="text-text-secondary mt-1 block font-mono text-[11px]">{refText}</span>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
