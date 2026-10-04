import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// El edificio (feature-12) sobre el router real: la sección es el editor (lo
// pulsado se edita a la izquierda), los cambios se ven al momento en la sección
// y en la frase, y «Partir de un caso» pide confirmación antes de sustituir.
// Mismo patrón que `rutas.test.tsx` (hash antes de importar App).
// =============================================================================

async function renderEdificio() {
  window.location.hash = `#/p/${DEMO_ID}/edificio`;
  vi.resetModules();
  const { App } = await import("../App");
  const utils = render(<App />);
  await utils.findByRole("heading", { name: "El edificio" });
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("El edificio", () => {
  it("la sección es el editor: seleccionar, editar y ver el resultado al momento", async () => {
    const user = userEvent.setup();
    await renderEdificio();

    // La frase resume el caso del Demo.
    expect(
      screen.getByText(
        "4 plantas sobre rasante y 1 sótano · 6 viviendas de 2 tipos · local sin uso en planta baja · garaje de 14 plazas.",
      ),
    ).toBeInTheDocument();

    // Por defecto se edita la zona de viviendas de P1–P3.
    const editor = screen.getByRole("complementary", { name: "Editar lo seleccionado" });
    expect(within(editor).getByRole("heading", { name: "Viviendas" })).toBeInTheDocument();
    expect(within(editor).getByText("6 (2 por planta)")).toBeInTheDocument();

    // Cambiar la superficie útil de la zona se ve en la sección.
    const sup = within(editor).getByLabelText("Superficie útil de la zona, en cada planta");
    await user.clear(sup);
    await user.type(sup, "170{Enter}");
    const seccion = screen.getByRole("region", { name: "Sección del edificio" });
    expect(
      within(seccion).getByRole("button", { name: /^P1–P3: Viviendas, .*170 m² por planta$/ }),
    ).toHaveAttribute("aria-pressed", "true");

    // Pulsar el canalón de la PB la edita a la izquierda; una planta igual más
    // convierte «PB» en «PB–P1» y sube el resto.
    await user.click(within(seccion).getByRole("button", { name: /^Planta baja, 4,00 m/ }));
    expect(within(editor).getByRole("heading", { name: "Planta baja" })).toBeInTheDocument();
    await user.click(within(editor).getByRole("button", { name: "Plantas iguales: más" }));
    expect(within(editor).getByRole("heading", { name: "Planta baja y planta 1" })).toBeInTheDocument();
    expect(screen.getByText(/^5 plantas sobre rasante y 1 sótano/)).toBeInTheDocument();
    expect(within(seccion).getByRole("button", { name: /^Plantas 2 a 4, 3 plantas iguales/ })).toBeInTheDocument();

    // Un tipo de lo que se repite también se edita a la izquierda.
    await user.click(screen.getByRole("button", { name: /Tipo A: T3 · 90 m²/ }));
    expect(within(editor).getByRole("heading", { name: "Tipo A · T3" })).toBeInTheDocument();
    expect(within(editor).getByText("básica · 5750 W")).toBeInTheDocument();
  });

  it("partir de un caso pide confirmación y sustituye el edificio", async () => {
    const user = userEvent.setup();
    await renderEdificio();

    const casos = screen.getByRole("group", { name: "Partir de un caso" });
    expect(within(casos).getByRole("button", { name: "Plurifamiliar con locales" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(casos).getByRole("button", { name: "Oficinas" }));

    // Cancelar no cambia nada.
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText(/6 viviendas de 2 tipos/)).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("group", { name: "Partir de un caso" })).getByRole("button", {
        name: "Oficinas",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Sustituir" }));
    expect(
      screen.getByText(
        "3 plantas sobre rasante y 1 sótano · 640 m² de oficinas · local sin uso en planta baja · garaje de 10 plazas.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Núcleos de aseos · lo que se repite" })).toBeInTheDocument();
    // La selección pasa a la zona de oficinas.
    const editor = screen.getByRole("complementary", { name: "Editar lo seleccionado" });
    expect(within(editor).getByRole("heading", { name: "Oficinas" })).toBeInTheDocument();
  });
});
