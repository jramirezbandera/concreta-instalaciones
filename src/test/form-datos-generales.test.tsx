import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// Datos generales — regresiones de la edición (QA 1.5). Integración sobre el
// router real porque las dos son de FRONTERA: una es cómo se comporta un campo
// numérico al vaciarlo, y la otra es que una tecla no debe navegar y tirar por
// la borda un formulario que aún no se ha guardado.
//
// Mismo patrón que `rutas.test.tsx`: el router se crea a nivel de módulo
// leyendo el hash, así que se fija ANTES de importar App y se resetea el
// registro de módulos.
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

describe("Datos generales · alturas por planta", () => {
  it("vaciar una altura deja el campo EN BLANCO (no en 0) y bloquea el guardado", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    const user = userEvent.setup();
    await renderApp(`#/p/${DEMO_ID}/datos`);

    await user.click(await screen.findByRole("button", { name: "Definir alturas reales" }));
    const pb = await screen.findByLabelText("Planta baja");

    await user.click(pb);
    await user.keyboard("{Backspace}{Backspace}{Backspace}");

    // El fallo original: el campo saltaba a "0" y parecía no borrarse nunca.
    expect(pb).toHaveValue(null);
    // El aviso sale en los DOS sitios: junto al editor y en el resumen de arriba.
    expect(screen.getAllByText("Faltan alturas de planta por rellenar.")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
    // Y borrar NUNCA navega: seguimos en la edición.
    expect(window.location.hash).toContain("/datos");
  });
});

describe("Datos generales · Backspace no navega hacia atrás", () => {
  it("fuera de un campo editable, Backspace queda neutralizado", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    await renderApp(`#/p/${DEMO_ID}/datos`);
    await screen.findByRole("button", { name: "Definir alturas reales" });

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
