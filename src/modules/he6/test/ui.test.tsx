import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HE 6 (feature-24) sobre el router real y el Demo: la pantalla común de SI con
// las decisiones de HE 6. Mismo patrón que HE 5 (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Aparcamiento, conducción de cables y estaciones de recarga";

async function renderModulo() {
  window.location.hash = `#/p/${DEMO_ID}/he/recarga`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("complementary", { name: DIBUJO }, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-10-05T00:00:00.000Z");
});

describe("HE 6 · Recarga del vehículo eléctrico (feature-24)", () => {
  it("cabecera y decisiones; menos conducción que plazas no cumple", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole, getByLabelText } = await renderModulo();
    const frases = await findAllByText(/14 plazas: conducción de cables hasta todas; ninguna estación exigida\./);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Garaje.*14 plazas/);
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Viviendas y otros usos: se aplica el criterio del uso característico.");

    const conduccion = getByLabelText("Plazas con conducción");
    await user.clear(conduccion);
    await user.type(conduccion, "7{Enter}");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("La conducción de cables no llega a las plazas exigidas."));
  });
});
