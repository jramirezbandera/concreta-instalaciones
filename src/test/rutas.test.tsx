import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { DEMO_ID, DEMO_NOMBRE } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// Smoke de integración del router del expediente (feature-6 F4) — parte 1:
// inicio, dashboard y proyecto inexistente.
//
// El router de App se crea a NIVEL DE MÓDULO leyendo window.location.hash
// (createHashRouter), así que cada test fija el hash ANTES de importar App y
// resetea el registro de módulos para obtener un router fresco. Las rutas
// legacy y el sandbox viven en `rutas-legacy.test.tsx`: más de ~3 routers de
// módulo-nivel en el mismo jsdom interfieren entre sí (el cuarto se queda en
// el HydrateFallback), y el aislamiento por archivo de Vitest lo resuelve.
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

describe("rutas del expediente (F4) · inicio y dashboard", () => {
  it("«/» inicializa el storage (siembra Demo) y lista los proyectos", async () => {
    const { findByText } = await renderApp("#/");
    // La página de inicio siembra el proyecto Demo en el primer arranque.
    expect(await findByText(DEMO_NOMBRE)).toBeInTheDocument();
    expect(await findByText("Nuevo proyecto")).toBeInTheDocument();
  });

  it("«/p/demo» monta el dashboard del expediente dentro del provider", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    const { findByText, findAllByText } = await renderApp(`#/p/${DEMO_ID}`);
    expect(await findByText("Generar anejo CTE (PDF)")).toBeInTheDocument();
    // El Demo viene sembrado con cálculos: debe haber justificaciones en verde.
    // «HS5» sale también en la barra lateral; aquí interesa la del dashboard.
    const hs5 = await findAllByText("HS5");
    expect(hs5.some((el) => el.closest("nav") === null)).toBe(true);
  });

  it("«/p/<id-inexistente>» redirige a la lista de proyectos", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    const { findByText } = await renderApp("#/p/no-existe");
    expect(await findByText("Nuevo proyecto")).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe("#/"));
  });
});
