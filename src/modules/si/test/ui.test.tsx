import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// DB-SI (feature-19) sobre el router real y el Demo: la pantalla común con las
// decisiones de SI1 (escriben en El edificio) y de SI3 (el recorrido medido).
// Mismo patrón que HS1 (hash ANTES de importar App y resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };

async function renderRuta(ruta: string, dibujo: string) {
  window.location.hash = `#/p/${DEMO_ID}/${ruta}`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("complementary", { name: dibujo }, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("SI1 · Propagación interior (feature-19)", () => {
  it("cabecera, qué entra y el cuarto: al decir que es de agua, deja de ser local de riesgo", async () => {
    const user = userEvent.setup();
    const { findAllByText, getByRole, findByRole } = await renderRuta("si/propagacion-interior", "Los sectores");
    const frases = await findAllByText(/Las viviendas forman un sector de 655 m²/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Garaje.*EI 120 · vestíbulo/);

    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("Un cuarto de instalaciones no dice qué es.");

    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.selectOptions(within(decisiones).getByRole("combobox"), "agua");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).not.toHaveTextContent("Un cuarto de instalaciones no dice qué es."));
    const aside = await findByRole("complementary", { name: "Los sectores" });
    expect(aside).toBeInTheDocument();
  });
});

describe("SI3 · Evacuación (feature-19)", () => {
  it("el recorrido sin medir se avisa; anotado, la lista lo enseña", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderRuta("si/evacuacion", "La evacuación");
    expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("Falta medir el recorrido más largo.");

    const campo = getByRole("textbox", { name: "Recorrido más largo de las plantas" });
    await user.clear(campo);
    await user.type(campo, "21,5{Enter}");
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).not.toHaveTextContent("Falta medir el recorrido más largo."));

    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones/ });
    expect(within(lista).getByRole("button", { name: /Salidas de las plantas de viviendas.*21,5 m ≤ 25 m/ })).toBeInTheDocument();
  });
});
