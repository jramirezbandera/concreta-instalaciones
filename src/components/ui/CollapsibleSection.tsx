import { useState, useId, type ReactNode } from "react";

interface CollapsibleSectionProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /**
   * Referencia normativa opcional alineada a la derecha del label de sección
   * (p.ej. "DB-HS3 Tabla 2.1"). Los módulos documentan el artículo que respalda
   * cada bloque de inputs. Portado de "Concreta estructura".
   */
  refNorma?: string;
}

export function CollapsibleSection({
  label,
  children,
  defaultOpen = true,
  refNorma,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className="text-text-disabled border-border-sub mt-3 mb-2.5 flex w-full cursor-pointer items-center justify-between border-b pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase first:mt-0 max-md:min-h-11 max-md:py-3"
      >
        <span className="flex items-center gap-1.5">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="transition-transform duration-150"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
            aria-hidden="true"
          >
            <path d="M3 4l2 2 2-2" />
          </svg>
          {label}
        </span>
        {refNorma && (
          <span className="text-text-disabled font-mono tracking-normal normal-case">{refNorma}</span>
        )}
      </button>
      {open && (
        <div id={contentId} className="animate-[fadeIn_150ms_ease-out]">
          {children}
        </div>
      )}
    </div>
  );
}
