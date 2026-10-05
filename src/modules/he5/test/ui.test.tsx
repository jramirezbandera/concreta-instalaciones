import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HE5 (feature-22) sobre el router real y el Demo: la pantalla común de SI con
// las decisiones de HE5. Mismo patrón que SI (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Superficie construida, cubierta y generación renovable";

async function renderModulo() {
  window.location.hash = `#/p/${DEMO_ID}/he/generacion`;
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
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HE5 · Generación eléctrica renovable (feature-22)", () => {
  it("cabecera y decisiones; menos potencia de la mínima no cumple", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole, getByLabelText } = await renderModulo();
    const frases = await findAllByText(/1368 m² construidos: potencia mínima de 7,80 kW/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Cubierta.*Sc = 210 m²/);
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Confirma el factor de producción de cada uso.");

    const potencia = getByLabelText("Potencia instalada");
    await user.clear(potencia);
    await user.type(potencia, "5{Enter}");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("La potencia instalada no llega a la mínima."));
  });
});
