import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// REBT (feature-23) sobre el router real y el Demo: la pantalla común de SI con
// las decisiones del REBT. Mismo patrón que SI (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Previsión de cargas del edificio";

async function renderModulo() {
  window.location.hash = `#/p/${DEMO_ID}/rebt/prevision`;
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

describe("REBT · Grado de electrificación y previsión de cargas (feature-23)", () => {
  it("cabecera, qué entra y avisos; por superficie las viviendas pasan a básicas", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole, getByLabelText } = await renderModulo();
    const frases = await findAllByText(/6 viviendas de electrificación elevada: 91 kW de carga total, 10 contadores/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Viviendas.*elevada · 9200 W/);
    expect(entra).toHaveTextContent(/Local.*16 kW/);
    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("Indica la potencia del ascensor y los demás servicios generales.");

    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "Por superficie" }));
    expect((await findAllByText(/6 viviendas de electrificación básica/)).length).toBeGreaterThan(0);

    const otros = getByLabelText("Otros servicios generales");
    await user.clear(otros);
    await user.type(otros, "3{Enter}");
    const ascensor = getByLabelText("Potencia del ascensor");
    await user.clear(ascensor);
    await user.type(ascensor, "7,5{Enter}");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).not.toHaveTextContent("Indica la potencia del ascensor"));
  });
});
