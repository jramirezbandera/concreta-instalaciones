import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HR (feature-25) sobre el router real y el Demo: la pantalla común de SI con las
// decisiones de HR. Mismo patrón que HE 6 (hash ANTES de importar App y
// resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Separaciones, fachada y cubierta";

async function renderModulo() {
  window.location.hash = `#/p/${DEMO_ID}/hr/ruido`;
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

describe("HR · Protección frente al ruido (feature-25)", () => {
  it("cabecera, qué entra y avisos; una tabiquería que no llega no cumple", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole } = await renderModulo();
    const frases = await findAllByText(/6 viviendas con Ld 60 dBA: tabiquería, separaciones, forjados y fachadas cumplen la opción simplificada\./);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(getByRole("region", { name: "Qué entra" })).toHaveTextContent(/Actividad e instalaciones.*Local sin uso \(PB\)/);
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Indica el Ld de la zona en los datos de la obra.");

    await user.selectOptions(getByRole("combobox", { name: /Tabiquería/ }), "tab-lhgf70-yeso");
    await user.click(getByRole("button", { name: "Apoyo directo" }));
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("La tabiquería no llega."));
  });

  it("qué linda con qué: el local que no queda bajo viviendas deja de justificarse", async () => {
    const user = userEvent.setup();
    const { getByRole } = await renderModulo();
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("3 colindancias supuestas.");
    await user.click(within(getByRole("group", { name: "Local sin uso (PB) bajo viviendas" })).getByRole("button", { name: "No" }));
    await waitFor(() => expect(getByRole("region", { name: "Qué entra" })).not.toHaveTextContent("Actividad e instalaciones"));
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("2 colindancias supuestas.");
  });
});
