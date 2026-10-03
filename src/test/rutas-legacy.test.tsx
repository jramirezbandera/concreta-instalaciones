import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { inicializarStorage } from "../lib/proyecto/storage";

// =============================================================================
// Smoke de integración del router del expediente (feature-6 F4) — parte 2:
// redirecciones legacy y sandbox. Separado de `rutas.test.tsx` por el límite
// práctico de routers de módulo-nivel por jsdom (ver nota allí).
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

describe("rutas del expediente (F4) · legacy y sandbox", () => {
  it("ruta legacy «/hs/saneamiento?…» redirige al proyecto activo conservando la query", async () => {
    inicializarStorage("2026-08-23T00:00:00.000Z");
    const { findAllByText } = await renderApp("#/hs/saneamiento?numPlantas=7");
    await waitFor(
      () => {
        expect(window.location.hash).toMatch(/^#\/p\/[^/]+\/hs\/saneamiento\?numPlantas=7$/);
      },
      { timeout: 8000 },
    );
    // El módulo HS5 (lazy, aún con su UI legacy) debe montar bajo /p/<activo>/…
    const hs5 = await findAllByText(/HS5 Saneamiento|Evacuación de aguas/, {}, { timeout: 8000 });
    expect(hs5.length).toBeGreaterThan(0);
  });

  it("«/_smoke» sigue funcionando sin provider de proyecto (sandbox)", async () => {
    const { findAllByText } = await renderApp("#/_smoke");
    const smoke = await findAllByText(/Demo cimientos/, {}, { timeout: 8000 });
    expect(smoke.length).toBeGreaterThan(0);
  });
});
