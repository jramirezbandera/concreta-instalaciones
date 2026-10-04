import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage, listarProyectos } from "../lib/proyecto/storage";
import { edificioDeCaso } from "../lib/edificio/casos";

// =============================================================================
// Datos de la obra (feature-12) — integración sobre el router real: lo que ya no
// está (plantas, viviendas, garaje… viven en El edificio), el alta con un caso
// de partida que abre El edificio, y la regresión de QA 1.5 (una tecla no debe
// navegar y tirar por la borda un formulario que aún no se ha guardado).
//
// Mismo patrón que `rutas.test.tsx`: el router se crea a nivel de módulo
// leyendo el hash, así que se fija ANTES de importar App y se resetea el
// registro de módulos. Tres routers como máximo por archivo jsdom.
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

describe("Datos de la obra", () => {
  it("ya no describe el edificio, y fuera de un campo Backspace queda neutralizado", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/datos`);
    await screen.findByRole("heading", { name: "Datos de la obra" });

    expect(screen.queryByLabelText("Plantas sobre rasante")).toBeNull();
    expect(screen.queryByLabelText("Número de viviendas")).toBeNull();
    expect(screen.queryByLabelText("Uso del edificio")).toBeNull();
    expect(screen.getByLabelText("Tipo de intervención")).toBeInTheDocument();
    expect(screen.getByLabelText("Piscina")).toBeInTheDocument();
    // Al editar no se ofrece «Partir de un caso»: eso es de El edificio.
    expect(screen.queryByText("Partir de un caso")).toBeNull();

    // feature-14: la lluvia (Figura B.1 del HS5) y la cota del alcantarillado.
    // El Demo trae la cota y no la zona (Cáceres cae en el límite del mapa).
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Suministro y saneamiento/ }));
    expect(screen.getByRole("textbox", { name: /Cota del alcantarillado/ })).toHaveValue("-1.2");
    const zona = screen.getByRole("combobox", { name: /Zona pluviométrica/ });
    expect(zona).toHaveValue("");
    expect(screen.queryByRole("combobox", { name: /Isoyeta/ })).toBeNull();
    await user.selectOptions(zona, "A");
    expect(screen.getByRole("combobox", { name: /Isoyeta/ })).toHaveValue("30");
    expect(screen.getByText(/Intensidad pluviométrica: 90 mm\/h/)).toBeInTheDocument();

    // Foco en un elemento no editable (el caso que en algunos navegadores
    // dispara "atrás" y cierra la edición perdiendo lo escrito).
    const evento = new KeyboardEvent("keydown", {
      key: "Backspace",
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });

  it("dentro de un campo de texto, Backspace se respeta (sigue borrando)", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/datos`);

    const nombre = await screen.findByLabelText("Nombre del proyecto");
    const evento = new KeyboardEvent("keydown", {
      key: "Backspace",
      bubbles: true,
      cancelable: true,
    });
    nombre.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(false);
  });
});

describe("Nuevo proyecto", () => {
  it("se crea desde un caso de partida y abre El edificio", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    const user = userEvent.setup();
    await renderApp("#/nuevo");

    await user.type(await screen.findByLabelText("Nombre del proyecto"), "Oficinas Norte");
    await user.selectOptions(screen.getByLabelText("Provincia"), "Madrid");
    await user.click(screen.getByLabelText("Oficinas"));
    await user.click(screen.getByRole("button", { name: "Crear proyecto" }));

    await screen.findByRole("heading", { name: "El edificio" });
    expect(window.location.hash).toMatch(/\/edificio$/);
    const creado = listarProyectos().find((p) => p.nombre === "Oficinas Norte");
    expect(creado?.edificio).toEqual(edificioDeCaso("oficinas"));
  });
});
