import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { EditorSeleccion } from "../EditorSeleccion";

// =============================================================================
// El ascensor del edificio se indica en la zona común (Portal y escalera): lo
// piden los avisos de SUA 1 y REBT.
// =============================================================================

afterEach(cleanup);

function montar(edificio: Edificio, zonaId: string) {
  const onCambiar = vi.fn<(e: Edificio) => void>();
  const r = render(
    <EditorSeleccion edificio={edificio} seleccion={{ tipo: "zona", id: zonaId }} onCambiar={onCambiar} onSeleccionar={() => {}} />,
  );
  return { ...r, onCambiar };
}

describe("ascensor en El edificio", () => {
  it("la zona común pregunta por el ascensor, sin indicar al empezar", () => {
    const { getByRole } = montar(edificioDeCaso("plurifamiliar"), "z3");
    const grupo = getByRole("group", { name: "Ascensor del edificio" });
    expect(within(grupo).getByRole("button", { name: "Sin indicar" })).toHaveAttribute("aria-pressed", "true");
  });

  it("indicarlo lo escribe en el edificio, y «Sin indicar» lo quita", async () => {
    const user = userEvent.setup();
    const { getByRole, onCambiar, rerender } = montar(edificioDeCaso("plurifamiliar"), "z3");
    await user.click(getByRole("button", { name: "Sí" }));
    const con = onCambiar.mock.lastCall![0];
    expect(con.ascensor).toBe(true);

    rerender(<EditorSeleccion edificio={con} seleccion={{ tipo: "zona", id: "z3" }} onCambiar={onCambiar} onSeleccionar={() => {}} />);
    expect(getByRole("button", { name: "Sí" })).toHaveAttribute("aria-pressed", "true");
    await user.click(getByRole("button", { name: "Sin indicar" }));
    expect("ascensor" in onCambiar.mock.lastCall![0]).toBe(false);
  });

  it("las demás zonas no lo preguntan", () => {
    const { queryByRole } = montar(edificioDeCaso("plurifamiliar"), "z4");
    expect(queryByRole("group", { name: "Ascensor del edificio" })).toBeNull();
  });
});
