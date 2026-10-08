import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HE1 v4 (feature-15) sobre el router real y el Demo («Plurifamiliar con
// locales», Cáceres, zona C): cabecera redactada, «Qué entra» con los
// cerramientos, decisiones, el dibujo por cerramiento con su franja, el
// incumplimiento con su arreglo, la lista y la memoria. Mismo patrón que HS5
// (hash ANTES de importar App y resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const FACHADA = "Sección de la fachada · a escala";

async function renderHe1() {
  window.location.hash = `#/p/${DEMO_ID}/he/envolvente`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("complementary", { name: FACHADA }, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HE1 · desde El edificio (feature-15)", () => {
  it("cabecera, qué entra, decisiones y la franja de la fachada", async () => {
    const { findAllByText, getByRole, findByRole } = await renderHe1();
    const frases = await findAllByText(/Todos los elementos de la envolvente están por debajo de los límites de zona C/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Zona climática.*Cáceres, 459 m.*C4/);
    expect(entra).toHaveTextContent(/Forjado sobre el local.*0,45 \/ 0,70/);

    const decisiones = getByRole("region", { name: "Decisiones" });
    expect(within(decisiones).getByRole("group", { name: "Aislante de la fachada" })).toHaveTextContent("60");
    expect(within(decisiones).getByRole("button", { name: "No habitable" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("button", { name: "Bajo emisivo" })).toHaveAttribute("aria-pressed", "true");

    const aside = await findByRole("complementary", { name: FACHADA });
    expect(aside).toHaveTextContent(/El aislante: con 60 mm se lleva el 71 % de la resistencia del muro\. Cumple desde 50 mm\./);
  });

  it("bajar el aislante a 40 mm no cumple; «Poner 50 mm» lo arregla", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText, findByRole } = await renderHe1();
    const paso = within(getByRole("region", { name: "Decisiones" })).getByRole("group", { name: "Aislante de la fachada" });
    await user.click(within(paso).getByRole("button", { name: "Bajar 10 mm" }));
    await user.click(within(paso).getByRole("button", { name: "Bajar 10 mm" }));
    expect(await findByText("La fachada no cumple")).toBeInTheDocument();
    await user.click(getByRole("button", { name: "Poner 50 mm" }));
    const aside = await findByRole("complementary", { name: FACHADA });
    await waitFor(() => expect(aside).toHaveTextContent(/con 50 mm se lleva/));
  });

  it("el local como otra unidad cambia el límite del forjado; la ventana se ve en alzado", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHe1();
    await user.click(within(getByRole("region", { name: "Decisiones" })).getByRole("button", { name: "Otra unidad" }));
    await user.click(within(getByRole("region", { name: "Qué entra" })).getByRole("button", { name: /Forjado sobre el local/ }));
    const suelo = await findByRole("complementary", { name: "Sección del forjado sobre el local" });
    await waitFor(() => expect(suelo).toHaveTextContent(/partición entre usos distintos: límite 0,95/));

    await user.click(within(getByRole("region", { name: "Qué entra" })).getByRole("button", { name: /Ventanas/ }));
    const ventana = await findByRole("complementary", { name: "Alzado de la ventana tipo" });
    expect(ventana).toHaveTextContent(/Junta vidrio-marco/);
  });

  it("Comprobaciones es la lista; Memoria, el texto", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHe1();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 7/ });
    expect(within(lista).getByRole("button", { name: /Ventanas\s*1,99 ≤ 2,10\s*cumple/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/Esta comprobación es un predimensionado por elementos/);
  });
});
