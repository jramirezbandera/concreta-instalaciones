import { useEffect, useRef, useState, type JSX } from "react";
import { MoreHorizontal } from "lucide-react";
import type { Aplicabilidad, Flexibilidad, JustificacionKey } from "../../lib/proyecto/tipos";

// =============================================================================
// Menú ⋯ de aplicabilidad de una fila de La obra (feature-16 §B; viene del
// checklist de la fase A): la herramienta propone, el proyectista dispone.
// «Aplica» se fuerza directamente; «no aplica», «a lo intervenido» y «con
// flexibilidad» (estas dos, solo en un edificio existente, feature-27) abren el
// editor del párrafo bajo la fila. «Volver a la propuesta» quita lo forzado.
//
// El cierre por clic fuera NO se confía al foco: escucha `pointerdown` en el
// documento y cierra salvo que el clic caiga dentro del propio menú. Así
// funciona aunque el clic vaya a texto no enfocable. Escape también cierra.
// =============================================================================

/** Lo que se elige con párrafo propio: se edita bajo la fila. */
export type AplicabilidadConParrafo = "no_aplica" | "aplica_reformado" | "aplica_flexibilidad";

export interface AccionesAplicabilidad {
  forzar(key: JustificacionKey, valor: Aplicabilidad | null, nota?: string, flexibilidad?: Flexibilidad): void;
  /** Abre el editor del párrafo bajo la fila. */
  editar(key: JustificacionKey, valor: AplicabilidadConParrafo): void;
  /** Despliega el párrafo de la fila. */
  verParrafo(key: JustificacionKey): void;
}

const ITEM =
  "text-text-secondary hover:bg-bg-elevated hover:text-text-primary block w-full px-3 py-1.5 text-left text-[12px] transition-colors";

export function MenuAplicabilidad(props: {
  clave: JustificacionKey;
  codigo: string;
  forzada: boolean;
  /** Obra en un edificio existente: ofrece «a lo intervenido» y la flexibilidad. */
  existente?: boolean;
  /** La fila tiene un párrafo que se puede desplegar. */
  conParrafo?: boolean;
  acciones: AccionesAplicabilidad;
}): JSX.Element {
  const { clave, codigo, forzada, existente = false, conParrafo = false, acciones } = props;
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

  const hacer = (f: () => void) => () => {
    f();
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
          className="border-border-main bg-bg-primary absolute top-full right-0 z-20 mt-1 w-56 rounded border py-1"
        >
          <button type="button" role="menuitem" onClick={hacer(() => acciones.forzar(clave, "aplica"))} className={ITEM}>
            Forzar aplica
          </button>
          {existente && (
            <>
              <button type="button" role="menuitem" onClick={hacer(() => acciones.editar(clave, "aplica_reformado"))} className={ITEM}>
                Aplica a lo intervenido…
              </button>
              <button type="button" role="menuitem" onClick={hacer(() => acciones.editar(clave, "aplica_flexibilidad"))} className={ITEM}>
                Aplica con flexibilidad…
              </button>
            </>
          )}
          <button type="button" role="menuitem" onClick={hacer(() => acciones.editar(clave, "no_aplica"))} className={ITEM}>
            Forzar no aplica…
          </button>
          {conParrafo && (
            <button type="button" role="menuitem" onClick={hacer(() => acciones.verParrafo(clave))} className={ITEM}>
              Ver el párrafo
            </button>
          )}
          {forzada && (
            <button type="button" role="menuitem" onClick={hacer(() => acciones.forzar(clave, null))} className={ITEM}>
              Volver a la propuesta
            </button>
          )}
        </div>
      )}
    </div>
  );
}
