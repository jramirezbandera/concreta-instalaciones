import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HE4 (feature-22) sobre el router real y el Demo: la pantalla común de SI con
// las decisiones de HE4. Mismo patrón que SI (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Demanda de ACS y producción renovable";

async function renderModulo() {
  window.location.hash = `#/p/${DEMO_ID}/he/acs`;
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

describe("HE4 · ACS de origen renovable (feature-22)", () => {
  it("cabecera, qué entra y avisos; con SCOP por debajo de 2,5 no cumple", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole, getByLabelText } = await renderModulo();
    const frases = await findAllByText(/Demanda de ACS de 588 l\/d: bomba de calor con un 60 % renovable/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Viviendas.*588 l\/d/);
    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("Indica el SCOPdhw de la bomba de calor.");
    expect(avisos).toHaveTextContent("Indica las pérdidas térmicas del ACS.");

    const scop = getByLabelText("SCOPdhw del equipo");
    await user.clear(scop);
    await user.type(scop, "2,2{Enter}");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).not.toHaveTextContent("Indica el SCOPdhw"));
    expect((await findAllByText(/bomba de calor con un 0 % renovable, menos del 60 %/)).length).toBeGreaterThan(0);

    // Solar: la fracción exigida como objetivo, con su aviso.
    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "Solar" }));
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Indica la fracción solar de la instalación."));
  });
});
