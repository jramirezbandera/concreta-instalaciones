import {
  useRef,
  useState,
  type ComponentType,
  type JSX,
  type KeyboardEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MinusCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Veredicto } from "../../lib/proyecto/tipos";
import { STATE_TEXT } from "../../lib/ui/veredicto";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import type { OutlinerCelda, OutlinerFila, OutlinerProps } from "./tipos";

// =============================================================================
// Outliner (feature-7 §A) — treegrid denso con jerarquía por indentación.
//
// Genérico y agnóstico del dominio: recibe la proyección plana ordenada (filas
// con `depth`) y emite intenciones; NO conoce `parentId`. Teclado primero con
// roving tabindex por fila: ↑↓ navega · Enter añade · Tab/Shift-Tab anida/
// desanida (solo filas `anidable`) · Supr borra (solo `borrable`). Cuando el
// foco está DENTRO de un editor inline (input/select), el outliner no
// intercepta NINGUNA tecla: las flechas/Enter/Supr editan y Tab sigue el flujo
// normal del navegador entre campos.
//
// Estética: tabla densa de la maqueta `JustificacionHS5.dc.html` — cabecera
// uppercase 10px slate, filetes `border-border-sub`, filas de 30px, selección
// con `bg-tint-accent` (token de acento, light-first). Estados SIEMPRE
// icono + texto (nunca solo color, WCAG). Componente puro (React Compiler):
// sin efectos, sin Date.now/Math.random; el único estado interno es el Set de
// filas colapsadas.
// =============================================================================

/** Icono por veredicto (paridad con la cabecera de ModuleLayout / STATE_TEXT). */
const ICONO_ESTADO: Record<
  Veredicto,
  ComponentType<{ size?: number; className?: string }>
> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  neutral: MinusCircle,
};

/** ¿El evento nace dentro de un editor inline? (input/select/textarea). */
function esEditorInline(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement)
  );
}

/** Estilo compartido de los editores inline (sin borde aparente hasta el foco). */
const EDITOR_BASE =
  "rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] " +
  "hover:border-border-sub focus:border-accent focus:ring-accent/30 focus:ring-1 focus:outline-none";

/** Contenido de una celda según su tipo (ver `OutlinerCelda`). */
function ContenidoCelda({ celda }: { celda: OutlinerCelda }): JSX.Element {
  switch (celda.tipo) {
    case "texto":
      return (
        <span
          className={[
            celda.dim ? "text-text-disabled" : "",
            celda.mono ? "font-mono tabular-nums" : "tabular-nums",
          ].join(" ")}
        >
          {celda.valor}
        </span>
      );
    case "estado": {
      const Icono = ICONO_ESTADO[celda.veredicto];
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap ${STATE_TEXT[celda.veredicto]}`}
        >
          <Icono size={12} className="shrink-0" aria-hidden="true" />
          {STATUS_LABEL[celda.veredicto]}
          {celda.extra && (
            <span className="ml-0.5 truncate font-normal opacity-80">
              {celda.extra}
            </span>
          )}
        </span>
      );
    }
    case "nombre":
      return (
        <input
          type="text"
          value={celda.valor}
          onChange={(e) => celda.onChange(e.target.value)}
          aria-label="Nombre"
          className={`text-text-primary w-full min-w-16 ${EDITOR_BASE}`}
        />
      );
    case "numero":
      return (
        <span className="inline-flex items-center justify-end gap-1">
          <input
            type="number"
            value={
              celda.valor !== undefined && Number.isFinite(celda.valor)
                ? celda.valor
                : ""
            }
            min={celda.min}
            step={celda.step ?? 1}
            onChange={(e) => celda.onChange(Number(e.target.value))}
            aria-label={celda.unidad ? `Valor (${celda.unidad})` : "Valor"}
            className={`text-text-primary w-16 text-right tabular-nums ${EDITOR_BASE}`}
          />
          {celda.unidad && (
            <span className="text-text-disabled shrink-0 text-[11px]">
              {celda.unidad}
            </span>
          )}
        </span>
      );
    case "select":
      return (
        <select
          value={celda.valor}
          onChange={(e) => celda.onChange(e.target.value)}
          aria-label="Tipo"
          className={`text-text-secondary max-w-full ${EDITOR_BASE}`}
        >
          {celda.opciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
  }
}

/**
 * Treegrid genérico de edición jerárquica (una fila por elemento, inputs y
 * resultados en la misma fila). Ver `tipos.ts` para el contrato completo.
 */
export function Outliner({
  columnas,
  filas,
  selectedId,
  onSelect,
  onHover,
  onAdd,
  onNest,
  onUnnest,
  onRemove,
  etiquetaAdd,
  toolbar,
}: OutlinerProps): JSX.Element {
  /** Ids colapsados (estado interno; los descendientes se ocultan). */
  const [colapsadas, setColapsadas] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  /** id → <tr> para mover el foco con ↑↓ (roving tabindex). */
  const refsFilas = useRef(new Map<string, HTMLTableRowElement>());

  // Proyección visible: una fila con descendientes colapsada oculta el rango
  // siguiente hasta volver a depth ≤ (descendiente = depth estrictamente mayor).
  const visibles: { fila: OutlinerFila; tieneDescendientes: boolean }[] = [];
  let ocultarSiMayorQue: number | null = null;
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    if (ocultarSiMayorQue !== null && fila.depth > ocultarSiMayorQue) continue;
    ocultarSiMayorQue = null;
    const tieneDescendientes =
      i + 1 < filas.length && filas[i + 1].depth > fila.depth;
    if (tieneDescendientes && colapsadas.has(fila.id))
      ocultarSiMayorQue = fila.depth;
    visibles.push({ fila, tieneDescendientes });
  }

  // Roving tabindex: la fila seleccionada (o la primera visible) lleva tabIndex 0.
  const idActivo =
    selectedId !== null && visibles.some((v) => v.fila.id === selectedId)
      ? selectedId
      : (visibles[0]?.fila.id ?? null);

  /** Selecciona y enfoca la fila visible en el índice dado (clamp a los bordes). */
  function moverFoco(indice: number): void {
    const destino =
      visibles[Math.max(0, Math.min(visibles.length - 1, indice))];
    if (!destino) return;
    onSelect(destino.fila.id);
    refsFilas.current.get(destino.fila.id)?.focus();
  }

  function alternarColapso(id: string): void {
    setColapsadas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function manejarTecla(
    e: KeyboardEvent<HTMLTableRowElement>,
    fila: OutlinerFila,
    i: number,
  ): void {
    // Dentro de un editor inline no se intercepta nada: flechas/Enter/Supr
    // editan el campo y Tab sigue el flujo normal del navegador.
    if (esEditorInline(e.target)) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moverFoco(i + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moverFoco(i - 1);
        break;
      case "Enter":
        e.preventDefault();
        onAdd(fila.id);
        break;
      case "Tab":
        // preventDefault SOLO en filas anidables; en el resto Tab sigue el
        // flujo normal del navegador (sale del treegrid).
        if (fila.anidable) {
          e.preventDefault();
          if (e.shiftKey) onUnnest(fila.id);
          else onNest(fila.id);
        }
        break;
      case "Delete":
        if (fila.borrable) {
          e.preventDefault();
          onRemove(fila.id);
        }
        break;
    }
  }

  return (
    <div className="flex min-w-0 flex-col">
      <table
        role="treegrid"
        aria-label={etiquetaAdd}
        className="w-full border-collapse text-[13px]"
      >
        {columnas.some((c) => c.width) && (
          <colgroup>
            {columnas.map((c) => (
              <col
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
              />
            ))}
            <col style={{ width: "28px" }} />
          </colgroup>
        )}
        <thead role="rowgroup">
          <tr role="row" className="border-border-sub border-b">
            {columnas.map((c) => (
              <th
                key={c.key}
                role="columnheader"
                className={`text-text-secondary h-[26px] px-3 text-[10px] font-medium tracking-wider uppercase ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.header}
              </th>
            ))}
            {/* Columna implícita de acciones (papelera). */}
            <th role="columnheader" className="h-[26px] px-1">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" onMouseLeave={() => onHover?.(null)}>
          {visibles.map(({ fila, tieneDescendientes }, i) => {
            const seleccionada = fila.id === selectedId;
            const expandida = tieneDescendientes
              ? !colapsadas.has(fila.id)
              : undefined;
            return (
              <tr
                key={fila.id}
                role="row"
                ref={(el) => {
                  if (el) refsFilas.current.set(fila.id, el);
                  else refsFilas.current.delete(fila.id);
                }}
                tabIndex={fila.id === idActivo ? 0 : -1}
                aria-level={fila.depth + 1}
                aria-selected={seleccionada}
                aria-expanded={expandida}
                onKeyDown={(e) => manejarTecla(e, fila, i)}
                onClick={(e) => {
                  onSelect(fila.id);
                  // El clic en un editor deja el foco en el editor; en el resto
                  // de la fila, el foco pasa a la fila (navegación por teclado).
                  if (!esEditorInline(e.target))
                    refsFilas.current.get(fila.id)?.focus();
                }}
                onMouseEnter={() => onHover?.(fila.id)}
                className={[
                  "border-border-sub h-[30px] border-b transition-colors",
                  "focus-visible:outline-accent focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2",
                  seleccionada ? "bg-tint-accent" : "hover:bg-bg-surface",
                  fila.kind === "aparato"
                    ? "text-text-secondary"
                    : "text-text-primary",
                ].join(" ")}
              >
                {fila.celdas.map((celda, j) => {
                  const col = columnas[j];
                  const alineacion =
                    col?.align === "right" ? "text-right" : "text-left";
                  if (j === 0) {
                    // Primera celda: indentación por depth + caret de colapso.
                    return (
                      <td
                        key={col?.key ?? j}
                        role="gridcell"
                        className={`px-3 py-0 align-middle ${alineacion}`}
                        style={{ paddingLeft: `${12 + fila.depth * 16}px` }}
                      >
                        <span className="flex min-w-0 items-center gap-1">
                          {tieneDescendientes ? (
                            <button
                              type="button"
                              tabIndex={-1}
                              aria-label={expandida ? "Contraer" : "Expandir"}
                              onClick={(e) => {
                                e.stopPropagation();
                                alternarColapso(fila.id);
                              }}
                              className="text-text-disabled hover:text-text-primary -ml-1 shrink-0 rounded p-0.5"
                            >
                              {expandida ? (
                                <ChevronDown size={12} aria-hidden="true" />
                              ) : (
                                <ChevronRight size={12} aria-hidden="true" />
                              )}
                            </button>
                          ) : (
                            <span
                              className="w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <ContenidoCelda celda={celda} />
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={col?.key ?? j}
                      role="gridcell"
                      className={`px-3 py-0 align-middle ${alineacion}`}
                    >
                      <ContenidoCelda celda={celda} />
                    </td>
                  );
                })}
                <td
                  role="gridcell"
                  className="px-1 py-0 text-right align-middle"
                >
                  {fila.borrable && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label="Eliminar fila"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(fila.id);
                      }}
                      className="text-text-disabled hover:text-state-fail rounded p-0.5"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Footer: añadir + hint de teclado + toolbar (presets). */}
      <div className="border-border-sub flex items-center justify-between gap-3 border-t px-3 py-1.5">
        <button
          type="button"
          onClick={() => onAdd(selectedId)}
          className="text-accent hover:text-accent-hover shrink-0 text-[12px] font-medium hover:underline"
        >
          {etiquetaAdd}
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-text-disabled truncate font-mono text-[10px] max-sm:hidden">
            Enter añade · Tab anida bajo el anterior · ↑↓ navega
          </span>
          {toolbar}
        </div>
      </div>
    </div>
  );
}
