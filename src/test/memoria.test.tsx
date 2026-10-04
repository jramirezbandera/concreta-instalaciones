import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// La memoria CTE (feature-16 §E) sobre el router real: la barra lateral lleva a
// ella con su recuento y la página enseña los apartados redactados del Demo.
// Un solo router por archivo (ver rutas.test.tsx).
// =============================================================================

async function renderApp(hash: string) {
  window.location.hash = hash;
  vi.resetModules();
  const { App } = await import("../App");
  return render(<App />);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
});

describe("«/p/demo/memoria»", () => {
  it("los apartados del Demo, el «no aplica» y lo pendiente; «Copiar todo» copia el texto", async () => {
    inicializarStorage("2026-10-04T10:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/memoria`);

    expect(await screen.findByRole("heading", { level: 1, name: "Memoria CTE de instalaciones" }, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText("6 de 6 apartados listos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HS 5 · Evacuación de aguas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-SUA6 · Piscinas" })).toBeInTheDocument();
    expect(screen.getByText(/Aún sin redactar: HS1/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Memoria CTE/ })).toHaveTextContent("6/6");

    // user-event pone su propio portapapeles: se espía después de crearlo.
    const user = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: "Copiar todo" }));
    expect(escribir).toHaveBeenCalledTimes(1);
    expect(escribir.mock.calls[0][0]).toMatch(/^Memoria CTE de instalaciones\n\n/);
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
  });
});
