import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS6 v4 (feature-15) sobre el router real y el Demo («Plurifamiliar con
// locales», zona II): cabecera redactada, «Qué entra», decisiones, la sección
// con la franja, el aviso del núcleo, la lista y la memoria. Mismo patrón que
// HS5 (hash ANTES de importar App y resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 8000 };
const DIBUJO = "Lo que toca el terreno";

async function renderHs6() {
  window.location.hash = `#/p/${DEMO_ID}/hs/radon`;
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

describe("HS6 · desde El edificio (feature-15)", () => {
  it("cabecera, qué entra, decisiones y la franja de la barrera", async () => {
    const { findAllByText, getByRole, findByRole } = await renderHs6();
    const frases = await findAllByText(/Cáceres está en zona II: barrera de protección y, además, un espacio de contención ventilado/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Garaje.*S1 · no habitable · ventilado.*contención/);
    expect(entra).toHaveTextContent(/Local y portal.*PB sobre el garaje · 195 m².*se protege/);

    const decisiones = getByRole("region", { name: "Decisiones" });
    const donde = within(decisiones).getByRole("group", { name: "Dónde va la barrera bajo el garaje" });
    expect(within(donde).getByRole("button", { name: "Solera y muros" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("button", { name: "Lámina tipo" })).toHaveAttribute("aria-pressed", "true");
    // Sin nada que apoye en el terreno, zona II no pregunta por la cámara.
    expect(within(decisiones).queryByRole("button", { name: "Cámara ventilada" })).toBeNull();

    const aside = await findByRole("complementary", { name: DIBUJO });
    expect(aside).toHaveTextContent(/Lámina bajo la solera y en los muros del sótano/);
    expect(aside).toHaveTextContent(/con al menos 2 mm y un coeficiente de difusión del radón menor que/);
  });

  it("la barrera en el forjado cambia la franja; el núcleo se revisa", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole, findByText } = await renderHs6();
    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "Forjado de PB" }));
    const aside = await findByRole("complementary", { name: DIBUJO });
    await waitFor(() => expect(aside).toHaveTextContent(/Lámina en el forjado de la planta baja/));
    expect(within(decisiones).getByText("No es lo habitual.")).toBeInTheDocument();

    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("La escalera y el ascensor bajan al garaje.");
    await user.click(within(avisos).getByRole("button", { name: "Marcar como revisado" }));
    expect(await findByText(/todo revisado/)).toBeInTheDocument();
  });

  it("Comprobaciones es la lista; Memoria, el texto", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs6();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 5 · 1 por revisar$/ });
    expect(within(lista).getByRole("button", { name: /El garaje, espacio de contención\s*ventilado \(HS 3\)\s*cumple/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/el espacio de contención es el propio garaje, local no habitable/);
  });
});
