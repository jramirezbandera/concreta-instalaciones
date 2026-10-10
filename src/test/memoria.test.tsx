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
  it("los apartados del Demo y el «no aplica»; «Copiar todo» copia el texto", async () => {
    inicializarStorage("2026-10-04T10:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/memoria`);

    expect(await screen.findByRole("heading", { level: 1, name: "Memoria CTE de instalaciones" }, { timeout: 20000 })).toBeInTheDocument();
    expect(screen.getByText("26 de 26 apartados listos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HS 5 · Evacuación de aguas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-SUA6 · Ahogamiento" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HS 1 · Protección frente a la humedad" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-SI 1 · Propagación interior" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HS 2 · Recogida y evacuación de residuos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HE 4 · Contribución mínima de energía renovable para ACS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HE 5 · Generación mínima de energía eléctrica renovable" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HE 6 · Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "REBT ITC-BT-10 · Grado de electrificación y previsión de cargas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DB-HR · Protección frente al ruido" })).toBeInTheDocument();
    // Desde feature-25 (HR) no queda nada por redactar.
    expect(screen.queryByText(/Aún sin redactar/)).toBeNull();
    expect(screen.getByRole("link", { name: /Memoria CTE/ })).toHaveTextContent("26/26");

    // user-event pone su propio portapapeles: se espía después de crearlo.
    const user = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: "Copiar todo" }));
    expect(escribir).toHaveBeenCalledTimes(1);
    expect(escribir.mock.calls[0][0]).toMatch(/^Memoria CTE de instalaciones\n\n/);
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
  });
});
