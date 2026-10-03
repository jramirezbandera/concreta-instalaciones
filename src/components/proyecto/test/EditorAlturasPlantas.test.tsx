import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EditorAlturasPlantas } from "../EditorAlturasPlantas";

// =============================================================================
// EditorAlturasPlantas (feature-10) — lo que se verifica: los dos estados (sin
// definir / definido), que las ediciones emiten las listas RECONCILIADAS con
// los contadores (la mecánica sin efectos por la que cambiar el nº de plantas
// no pierde alturas), que las cotas de suelo se calculan y formatean, y la
// vuelta a la estimación. El componente es controlado: se testea con onChange
// espía, sin anfitrión con estado (una interacción por caso).
// =============================================================================

beforeEach(() => {
  cleanup();
});

describe("EditorAlturasPlantas · sin definir", () => {
  it("ofrece definir alturas reales y explica la estimación vigente", () => {
    const onChange = vi.fn();
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={1}
        alturas={undefined}
        onChange={onChange}
      />,
    );
    expect(screen.getByText(/se estima 3 m por planta/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Definir alturas reales" }));
    // El punto de partida son los contadores actuales, todo a 3,00.
    expect(onChange).toHaveBeenCalledWith({ sobre: [3, 3], bajo: [3] });
  });
});

describe("EditorAlturasPlantas · definido", () => {
  const alturas = { sobre: [4.2, 3], bajo: [3.3] };

  it("pinta las plantas en orden de sección con sus cotas de suelo", () => {
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={1}
        alturas={alturas}
        onChange={vi.fn()}
      />,
    );
    // Filas editables con nombre accesible (label → input).
    expect(screen.getByLabelText("Planta baja")).toHaveValue(4.2);
    expect(screen.getByLabelText("Planta 1")).toHaveValue(3);
    expect(screen.getByLabelText("Sótano 1")).toHaveValue(3.3);
    // Cotas: cubierta = 4,2 + 3; Planta 1 = +4,20; Sótano 1 = −3,30.
    expect(screen.getByText("+7,20")).toBeInTheDocument();
    expect(screen.getByText("+4,20")).toBeInTheDocument();
    expect(screen.getByText("-3,30")).toBeInTheDocument();
  });

  it("editar una altura emite las listas completas con el cambio", () => {
    const onChange = vi.fn();
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={1}
        alturas={alturas}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Planta baja"), { target: { value: "4.5" } });
    expect(onChange).toHaveBeenCalledWith({ sobre: [4.5, 3], bajo: [3.3] });
  });

  it("con más plantas que alturas guardadas, la vista completa a 3 y una edición emite las listas casadas", () => {
    const onChange = vi.fn();
    render(
      <EditorAlturasPlantas
        plantasSobre={3} // una más que las 2 alturas guardadas
        plantasBajo={0}
        alturas={alturas}
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText("Planta 2")).toHaveValue(3); // completada
    fireEvent.change(screen.getByLabelText("Planta 2"), { target: { value: "2.7" } });
    // Reconciliada con los contadores: 3 sobre, 0 bajo (el sótano se recorta).
    expect(onChange).toHaveBeenCalledWith({ sobre: [4.2, 3, 2.7], bajo: [] });
  });

  it("vaciar el campo emite NaN (queda EN BLANCO), no 0", () => {
    // Regresión: con `Number("") === 0` el campo se repintaba a "0" y parecía
    // no borrarse nunca — el usuario seguía pulsando borrar contra un 0.
    const onChange = vi.fn();
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={0}
        alturas={{ sobre: [4.2, 3], bajo: [] }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Planta baja"), { target: { value: "" } });
    const emitido = onChange.mock.calls[0][0] as { sobre: number[] };
    expect(Number.isNaN(emitido.sobre[0])).toBe(true);
    expect(emitido.sobre[1]).toBe(3);
  });

  it("una altura vacía no rompe las cotas ni el dibujo (cuenta como 0)", () => {
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={0}
        alturas={{ sobre: [Number.NaN, 3], bajo: [] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Planta baja")).toHaveValue(null);
    // Cubierta = 0 + 3 (la planta sin altura no aporta cota).
    expect(screen.getByText("+3,00")).toBeInTheDocument();
  });

  it("«Volver a la estimación» emite undefined", () => {
    const onChange = vi.fn();
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={1}
        alturas={alturas}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Volver a la estimación" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("muestra el aviso de validación cuando llega", () => {
    render(
      <EditorAlturasPlantas
        plantasSobre={2}
        plantasBajo={0}
        alturas={{ sobre: [1, 3], bajo: [] }}
        onChange={vi.fn()}
        warning="Las alturas de planta deben estar entre 2 y 10 m."
      />,
    );
    expect(screen.getByText(/entre 2 y 10 m/)).toBeInTheDocument();
  });
});
