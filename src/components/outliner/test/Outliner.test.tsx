import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Outliner } from "../Outliner";
import type { OutlinerColumna, OutlinerFila, OutlinerProps } from "../tipos";

// =============================================================================
// Tests del outliner (feature-7 §A): teclado (Enter/Tab/Supr/flechas), colapso
// de descendientes y estados icono+texto. El componente es agnóstico del
// dominio: aquí se monta un arbolito genérico colector → ramal → aparato.
// =============================================================================

const COLUMNAS: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento" },
  { key: "estado", header: "Estado", align: "right", width: "90px" },
];

/** Árbol de 3 niveles ya proyectado en plano (colector → ramal → aparato). */
function filasDemo(): OutlinerFila[] {
  return [
    {
      id: "colector",
      depth: 0,
      kind: "tramo",
      anidable: false,
      borrable: false,
      celdas: [
        { tipo: "texto", valor: "Colector" },
        { tipo: "estado", veredicto: "ok" },
      ],
    },
    {
      id: "ramal",
      depth: 1,
      kind: "tramo",
      anidable: true,
      borrable: true,
      celdas: [
        { tipo: "nombre", valor: "Ramal cocina", onChange: () => {} },
        { tipo: "estado", veredicto: "fail" },
      ],
    },
    {
      id: "aparato",
      depth: 2,
      kind: "aparato",
      anidable: false,
      borrable: true,
      celdas: [
        { tipo: "texto", valor: "Fregadero", dim: true },
        { tipo: "texto", valor: "3 UD", mono: true },
      ],
    },
  ];
}

/** Render con callbacks espiados; devuelve los mocks y helpers de consulta. */
function montar(props?: Partial<OutlinerProps>) {
  const mocks = {
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onNest: vi.fn(),
    onUnnest: vi.fn(),
    onRemove: vi.fn(),
  };
  const utils = render(
    <Outliner
      columnas={COLUMNAS}
      filas={filasDemo()}
      selectedId={null}
      etiquetaAdd="+ Añadir tramo"
      {...mocks}
      {...props}
    />,
  );
  /** <tr> que contiene el texto dado (las filas son los targets de teclado). */
  const fila = (texto: string) => {
    const tr = screen.getByText(texto).closest("tr");
    if (!tr) throw new Error(`No hay fila con el texto "${texto}"`);
    return tr;
  };
  /** Fila del input de nombre (getByText no ve el value de un <input>). */
  const filaNombre = () => {
    const tr = screen.getByDisplayValue("Ramal cocina").closest("tr");
    if (!tr) throw new Error("No hay fila con el input de nombre");
    return tr;
  };
  return { ...utils, ...mocks, fila, filaNombre };
}

beforeEach(() => {
  cleanup();
});

describe("Outliner · teclado", () => {
  it("Enter añade tras la fila seleccionada (onAdd con su id)", () => {
    const { filaNombre, onAdd } = montar({ selectedId: "ramal" });
    fireEvent.keyDown(filaNombre(), { key: "Enter" });
    expect(onAdd).toHaveBeenCalledExactlyOnceWith("ramal");
  });

  it("el enlace del footer añade tras la selección actual (null sin selección)", async () => {
    const user = userEvent.setup();
    const { onAdd } = montar({ selectedId: null });
    await user.click(screen.getByRole("button", { name: "+ Añadir tramo" }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("Tab/Shift-Tab emiten onNest/onUnnest SOLO en filas anidables", () => {
    const { fila, filaNombre, onNest, onUnnest } = montar({ selectedId: "ramal" });
    // Fila anidable: Tab anida, Shift-Tab desanida (y se previene el default).
    fireEvent.keyDown(filaNombre(), { key: "Tab" });
    expect(onNest).toHaveBeenCalledExactlyOnceWith("ramal");
    fireEvent.keyDown(filaNombre(), { key: "Tab", shiftKey: true });
    expect(onUnnest).toHaveBeenCalledExactlyOnceWith("ramal");
    // Fila NO anidable: Tab sigue el flujo normal del navegador (no intercepta).
    fireEvent.keyDown(fila("Colector"), { key: "Tab" });
    expect(onNest).toHaveBeenCalledTimes(1);
    expect(onUnnest).toHaveBeenCalledTimes(1);
  });

  it("Supr elimina solo si la fila es borrable", () => {
    const { fila, filaNombre, onRemove } = montar({ selectedId: "ramal" });
    fireEvent.keyDown(fila("Colector"), { key: "Delete" }); // borrable: false
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.keyDown(filaNombre(), { key: "Delete" }); // borrable: true
    expect(onRemove).toHaveBeenCalledExactlyOnceWith("ramal");
  });

  it("↑↓ mueven la selección entre filas visibles", () => {
    const { fila, filaNombre, onSelect } = montar({ selectedId: "colector" });
    fireEvent.keyDown(fila("Colector"), { key: "ArrowDown" });
    expect(onSelect).toHaveBeenLastCalledWith("ramal");
    fireEvent.keyDown(filaNombre(), { key: "ArrowUp" });
    expect(onSelect).toHaveBeenLastCalledWith("colector");
  });

  it("las flechas y Supr NO se interceptan con el foco dentro de un editor inline", async () => {
    const user = userEvent.setup();
    const { onSelect, onRemove } = montar({ selectedId: "ramal" });
    const input = screen.getByDisplayValue("Ramal cocina");
    await user.click(input); // el clic selecciona la fila pero deja el foco en el editor
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("ramal");
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Delete" });
    expect(onSelect).toHaveBeenCalledTimes(1); // la flecha no movió la selección
    expect(onRemove).not.toHaveBeenCalled(); // Supr edita el texto, no borra la fila
    expect(input).toHaveFocus();
  });
});

describe("Outliner · colapso y jerarquía", () => {
  it("colapsar una fila oculta sus descendientes (y expandir los devuelve)", async () => {
    const user = userEvent.setup();
    const { filaNombre } = montar();
    const ramal = filaNombre();
    expect(ramal).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Fregadero")).toBeInTheDocument();
    await user.click(within(ramal).getByRole("button", { name: "Contraer" }));
    expect(screen.queryByText("Fregadero")).not.toBeInTheDocument();
    expect(filaNombre()).toHaveAttribute("aria-expanded", "false");
    await user.click(within(filaNombre()).getByRole("button", { name: "Expandir" }));
    expect(screen.getByText("Fregadero")).toBeInTheDocument();
  });

  it("las hojas no tienen caret ni aria-expanded; aria-level = depth + 1", () => {
    const { fila, filaNombre } = montar();
    const hoja = fila("Fregadero");
    expect(hoja).not.toHaveAttribute("aria-expanded");
    expect(within(hoja).queryByRole("button", { name: /Contraer|Expandir/ })).toBeNull();
    expect(fila("Colector")).toHaveAttribute("aria-level", "1");
    expect(filaNombre()).toHaveAttribute("aria-level", "2");
    expect(hoja).toHaveAttribute("aria-level", "3");
  });
});

describe("Outliner · celdas y ARIA", () => {
  it("las celdas de estado renderizan icono + texto (nunca solo color)", () => {
    montar();
    const ok = screen.getByText("CUMPLE");
    const fail = screen.getByText("INCUMPLE");
    // El icono lucide (svg aria-hidden) acompaña SIEMPRE al texto del veredicto.
    expect(ok.querySelector("svg")).not.toBeNull();
    expect(fail.querySelector("svg")).not.toBeNull();
    expect(ok.className).toContain("text-state-ok");
    expect(fail.className).toContain("text-state-fail");
  });

  it("expone treegrid con selección y roving tabindex", () => {
    const { fila, filaNombre } = montar({ selectedId: "ramal" });
    expect(screen.getByRole("treegrid")).toBeInTheDocument();
    expect(filaNombre()).toHaveAttribute("aria-selected", "true");
    expect(filaNombre()).toHaveAttribute("tabindex", "0");
    expect(fila("Colector")).toHaveAttribute("aria-selected", "false");
    expect(fila("Colector")).toHaveAttribute("tabindex", "-1");
  });
});
