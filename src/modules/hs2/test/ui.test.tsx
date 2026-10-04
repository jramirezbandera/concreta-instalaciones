import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS2 (feature-21) sobre el router real y el Demo: la pantalla común de SI con
// las decisiones de HS 2. Mismo patrón que SI (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Almacén, reserva y recorrido hasta la calle";

async function renderHs2() {
  window.location.hash = `#/p/${DEMO_ID}/hs/residuos`;
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

describe("HS2 · Recogida y evacuación de residuos (feature-21)", () => {
  it("cabecera, qué entra y avisos; puerta a puerta pide almacén en lugar de reserva", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole } = await renderHs2();
    const frases = await findAllByText(/21 ocupantes, espacio de reserva de 5,63 m²/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Reserva.*contenedores de calle.*≥ 5,63 m²/);
    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("Confirma cómo se recogen los residuos.");
    expect(avisos).toHaveTextContent("Indica los dormitorios dobles.");

    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "Puerta" }));
    await waitFor(() => expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Almacén.*puerta a puerta.*≥ 4,51 m²/));
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Confirma los periodos y los contenedores del servicio.");
    expect(getByRole("region", { name: "Avisos" })).not.toHaveTextContent("Confirma cómo se recogen los residuos.");

    // Dos dobles en el tipo A: P sube a 24.
    await user.click(within(decisiones).getByRole("button", { name: "Dormitorios dobles del tipo A: más" }));
    await waitFor(() => expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/P = 24/));
  });
});
