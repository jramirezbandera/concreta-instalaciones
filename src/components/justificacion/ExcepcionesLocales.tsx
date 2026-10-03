import { useEffect, useId, useRef } from "react";
import type { JSX, RefObject } from "react";
import { X } from "lucide-react";
import { NumberInput, SelectInput } from "../ui/InputLabel";
import type { HerenciaBinding } from "./ModuleLayout";

// Popover de excepciones locales (feature-6 T3.3-bis): lista los campos del
// contexto heredado con checkbox "Excepción local" (toggleOverride) y, con el
// override activo, el editor que declare `editor.tipo` (number/select/boolean/
// text) llamando a setCampo. Sin dependencias nuevas: div absolute, cierre con
// Escape y clic fuera. Sin sombra — eleva por superficie + borde (patrón
// HelpTooltip). Lo posiciona bajo la barra de contexto quien lo monta
// (DelProyecto, dentro de un contenedor `relative`).

type Campo = HerenciaBinding["campos"][number];

/** Valor del PROYECTO formateado para la línea informativa (sin override). */
function fmtValorProyecto(c: Campo): string {
  const v = c.valorProyecto;
  if (c.editor.tipo === "boolean") return v ? "Sí" : "No";
  if (c.editor.tipo === "select") {
    const op = c.editor.opciones?.find((o) => o.valor === String(v));
    if (op) return op.etiqueta;
  }
  if (v === null || v === undefined || v === "") return "—";
  return c.editor.unidad ? `${String(v)} ${c.editor.unidad}` : String(v);
}

interface ExcepcionesLocalesProps {
  herencia: HerenciaBinding;
  onClose: () => void;
  /** id del panel — lo referencia el `aria-controls` de los chips trigger. */
  id?: string;
  /**
   * Contenedor de los chips trigger: los `pointerdown` dentro NO cierran aquí
   * (el propio chip alterna abierto/cerrado; sin esta exclusión el cierre por
   * "clic fuera" y el toggle del chip se anularían mutuamente).
   */
  anchorRef?: RefObject<HTMLElement | null>;
}

export function ExcepcionesLocales({
  herencia,
  onClose,
  id,
  anchorRef,
}: ExcepcionesLocalesProps): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  // Foco al abrir (panel focuseable, no roba el foco a un control concreto).
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Cierre con Escape y clic fuera. `pointerdown` (no `click`) para decidir
  // antes de que el trigger procese su toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef?.current?.contains(t)) return; // el chip alterna por su cuenta
      onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label="Excepciones locales del contexto heredado"
      tabIndex={-1}
      className="border-border-main bg-bg-surface absolute top-full left-4 z-30 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded border p-3 outline-none"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-text-primary text-[13px] leading-tight font-semibold">
            Contexto heredado
          </div>
          <div className="text-text-secondary text-[11px] leading-snug">
            Marca «Excepción local» para usar en este módulo un valor distinto al del proyecto.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar excepciones locales"
          className="text-text-secondary hover:text-text-primary -m-1 shrink-0 p-1 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <ul className="divide-border-sub divide-y">
        {herencia.campos.map((c) => {
          const editorId = `${baseId}-${c.campo}`;
          const overrideId = `${baseId}-${c.campo}-ov`;
          return (
            <li key={c.campo} className="py-2">
              <div className="flex items-center justify-between gap-3">
                {c.override ? (
                  <label
                    htmlFor={editorId}
                    className="text-text-secondary min-w-0 truncate text-[13px]"
                  >
                    {c.etiqueta}
                  </label>
                ) : (
                  <span className="text-text-secondary min-w-0 truncate text-[13px]">
                    {c.etiqueta}
                  </span>
                )}
                <label
                  htmlFor={overrideId}
                  className="text-text-secondary flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px]"
                >
                  <input
                    id={overrideId}
                    type="checkbox"
                    checked={c.override}
                    onChange={(e) => herencia.toggleOverride(c.campo, e.target.checked)}
                    className="accent-accent"
                  />
                  Excepción local
                </label>
              </div>

              {c.override ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {c.editor.tipo === "number" && (
                    <>
                      <div className="w-28">
                        <NumberInput
                          id={editorId}
                          value={typeof c.valorActual === "number" ? c.valorActual : NaN}
                          onChange={(v) => herencia.setCampo(c.campo, v)}
                        />
                      </div>
                      {c.editor.unidad && (
                        <span className="text-text-disabled text-[11px]">{c.editor.unidad}</span>
                      )}
                    </>
                  )}
                  {c.editor.tipo === "select" && (
                    <div className="min-w-0 flex-1">
                      <SelectInput
                        id={editorId}
                        value={String(c.valorActual ?? "")}
                        options={(c.editor.opciones ?? []).map((o) => ({
                          value: o.valor,
                          label: o.etiqueta,
                        }))}
                        onChange={(v) => herencia.setCampo(c.campo, v)}
                      />
                    </div>
                  )}
                  {c.editor.tipo === "boolean" && (
                    <input
                      id={editorId}
                      type="checkbox"
                      checked={Boolean(c.valorActual)}
                      onChange={(e) => herencia.setCampo(c.campo, e.target.checked)}
                      className="accent-accent"
                    />
                  )}
                  {c.editor.tipo === "text" && (
                    <input
                      id={editorId}
                      type="text"
                      value={String(c.valorActual ?? "")}
                      onChange={(e) => herencia.setCampo(c.campo, e.target.value)}
                      className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] transition-colors focus:ring-1 focus:outline-none"
                    />
                  )}
                </div>
              ) : (
                <div className="text-text-disabled mt-0.5 text-[11px]">
                  Del proyecto: {fmtValorProyecto(c)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
