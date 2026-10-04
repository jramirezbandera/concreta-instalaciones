import { useEffect, useRef, useState, type JSX } from "react";
import { MoreHorizontal } from "lucide-react";
import type { JustificacionKey } from "../../lib/proyecto/tipos";

// =============================================================================
// Menú ⋯ de aplicabilidad de una fila de La obra (feature-16 §B; viene del
// checklist de la fase A): la herramienta propone, el proyectista dispone.
// Forzar «no aplica» (con su nota para la memoria), forzar «aplica» o volver a
// lo que propone la herramienta.
//
// El cierre por clic fuera NO se confía al foco: escucha `pointerdown` en el
// documento y cierra salvo que el clic caiga dentro del propio menú. Así
// funciona aunque el clic vaya a texto no enfocable. Escape también cierra.
// =============================================================================

export interface AccionesAplicabilidad {
  forzar(key: JustificacionKey, valor: "aplica" | "no_aplica" | null, nota?: string): void;
}

const ITEM =
  "text-text-secondary hover:bg-bg-elevated hover:text-text-primary block w-full px-3 py-1.5 text-left text-[12px] transition-colors";

export function MenuAplicabilidad(props: {
  clave: JustificacionKey;
  codigo: string;
  forzada: boolean;
  acciones: AccionesAplicabilidad;
}): JSX.Element {
  const { clave, codigo, forzada, acciones } = props;
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: PointerEvent): void {
      if (e.target instanceof Node && raiz.current?.contains(e.target)) return;
      setAbierto(false);
    }
    function tecla(e: KeyboardEvent): void {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("pointerdown", fuera);
    window.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      window.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const elegir = (valor: "aplica" | "no_aplica" | null) => {
    if (valor === "no_aplica") {
      const nota = window.prompt("Forzar «no aplica» — nota justificativa para la memoria (opcional):");
      if (nota === null) {
        setAbierto(false);
        return;
      }
      acciones.forzar(clave, "no_aplica", nota.trim() !== "" ? nota.trim() : undefined);
    } else {
      acciones.forzar(clave, valor);
    }
    setAbierto(false);
  };

  return (
    <div ref={raiz} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Opciones de aplicabilidad de ${codigo}`}
        onClick={() => setAbierto((a) => !a)}
        className="text-text-disabled hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent rounded p-1 transition-colors focus-visible:outline-2"
      >
        <MoreHorizontal size={15} aria-hidden="true" />
      </button>
      {abierto && (
        <div
          role="menu"
          aria-label={`Aplicabilidad de ${codigo}`}
          className="border-border-main bg-bg-primary absolute top-full right-0 z-20 mt-1 w-48 rounded border py-1"
        >
          <button type="button" role="menuitem" onClick={() => elegir("no_aplica")} className={ITEM}>
            Forzar no aplica…
          </button>
          <button type="button" role="menuitem" onClick={() => elegir("aplica")} className={ITEM}>
            Forzar aplica
          </button>
          {forzada && (
            <button type="button" role="menuitem" onClick={() => elegir(null)} className={ITEM}>
              Quitar forzado
            </button>
          )}
        </div>
      )}
    </div>
  );
}
