import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// Checklist del dashboard — el menú ⋯ de aplicabilidad (QA 1.6).
//
// Se monta sobre el router real (el componente exige ProyectoProvider) con el
// mismo patrón que `rutas.test.tsx`: hash fijado ANTES de importar App.
// =============================================================================

async function renderApp(hash: string) {
  window.location.hash = hash;
  vi.resetModules();
  const { App } = await import("../../../App");
  return render(<App />);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
});

async function abrirMenuHS3() {
  inicializarStorage("2026-08-23T00:00:00.000Z");
  const user = userEvent.setup();
  await renderApp(`#/p/${DEMO_ID}`);
  const boton = await screen.findByRole("button", {
    name: "Opciones de aplicabilidad de HS3",
  });
  await user.click(boton);
  expect(await screen.findByRole("menu", { name: "Aplicabilidad de HS3" })).toBeInTheDocument();
  return { user, boton };
}

describe("menú ⋯ de aplicabilidad", () => {
  it("se cierra al pulsar FUERA", async () => {
    const { user } = await abrirMenuHS3();

    // Clic en un punto neutro del dashboard (el título de la sección).
    await user.click(screen.getByRole("heading", { name: "Justificaciones" }));

    expect(screen.queryByRole("menu", { name: "Aplicabilidad de HS3" })).not.toBeInTheDocument();
  });

  it("se cierra con Escape", async () => {
    const { user } = await abrirMenuHS3();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu", { name: "Aplicabilidad de HS3" })).not.toBeInTheDocument();
  });

  it("el botón ⋯ lo alterna (segundo clic cierra)", async () => {
    const { user, boton } = await abrirMenuHS3();
    await user.click(boton);
    expect(screen.queryByRole("menu", { name: "Aplicabilidad de HS3" })).not.toBeInTheDocument();
  });

  it("abrir el menú de otra fila cierra el anterior", async () => {
    const { user } = await abrirMenuHS3();
    await user.click(
      screen.getByRole("button", { name: "Opciones de aplicabilidad de HS5" }),
    );
    expect(screen.queryByRole("menu", { name: "Aplicabilidad de HS3" })).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Aplicabilidad de HS5" })).toBeInTheDocument();
  });
});
