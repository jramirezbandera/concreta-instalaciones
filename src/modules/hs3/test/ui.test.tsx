import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS3 v4 (feature-15) sobre el router real y el Demo («Plurifamiliar con
// locales»): cabecera redactada, «Qué entra», decisiones, las partes del dibujo
// (vivienda A, B, garaje y trasteros), la franja, la lista y la memoria. Mismo
// patrón que HS5 (hash ANTES de importar App y resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Camino del aire";

async function renderHs3() {
  window.location.hash = `#/p/${DEMO_ID}/hs/ventilacion`;
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

describe("HS3 · desde El edificio (feature-15)", () => {
  it("cabecera, qué entra, decisiones y la franja del salón", async () => {
    const { findAllByText, getByRole, findByRole } = await renderHs3();
    const frases = await findAllByText(/Ventilación mecánica: el aire entra por aireadores en dormitorios y salón/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Viviendas A.*T3 · 3 viviendas/);
    expect(entra).toHaveTextContent(/Garaje.*S1 · 14 plazas.*1680 l\/s/);
    expect(entra).toHaveTextContent(/Local.*RITE/);

    const decisiones = getByRole("region", { name: "Decisiones" });
    const sistema = within(decisiones).getByRole("group", { name: "Sistema" });
    expect(within(sistema).getByRole("button", { name: "Mecánica" })).toHaveAttribute("aria-pressed", "true");
    const garaje = within(decisiones).getByRole("group", { name: "Garaje" });
    expect(within(garaje).getByRole("button", { name: "Mecánica" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("button", { name: "Se reparte" })).toHaveAttribute("aria-pressed", "true");

    const aside = await findByRole("complementary", { name: DIBUJO });
    expect(aside).toHaveTextContent(/Entra aire · local seco/);
    expect(aside).toHaveTextContent(/todos suben en proporción, × 1,27/);
  });

  it("las partes del dibujo: la vivienda B y el garaje con sus cifras", async () => {
    const user = userEvent.setup();
    const { findByRole } = await renderHs3();
    const aside = await findByRole("complementary", { name: DIBUJO });
    const partes = within(aside).getByRole("group", { name: "Parte del edificio" });
    await user.click(within(partes).getByRole("button", { name: "Vivienda B · T2" }));
    await waitFor(() => expect(aside).toHaveTextContent(/Salón-comedor · vivienda B/));

    await user.click(within(partes).getByRole("button", { name: "Garaje y trasteros" }));
    await user.click(within(aside).getByRole("button", { name: /^Extracción del garaje: 1680 l\/s, cumple$/ }));
    await waitFor(() => expect(aside).toHaveTextContent(/Las plazas: 120 l\/s por cada una, y hay 14\./));
  });

  it("cambiar el equilibrado al salón cambia lo que manda", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs3();
    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "Al salón" }));
    const aside = await findByRole("complementary", { name: DIBUJO });
    await waitFor(() => expect(aside).toHaveTextContent(/el salón pasa de 10 a 17/));
    expect(within(decisiones).getByText("No es lo habitual.")).toBeInTheDocument();
  });

  it("Comprobaciones es la lista de la parte; Memoria, el texto", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs3();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 11/ });
    expect(within(lista).getByRole("button", { name: /Salón-comedor\s*10 → 12,7 l\/s\s*cumple/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/Las viviendas se ventilan con un sistema mecánico conforme a la sección HS 3/);
  });
});
