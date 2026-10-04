import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProyectoProvider } from "../../../lib/proyecto/ProyectoContext";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { LoQueSeEntrega } from "../../obra/LoQueSeEntrega";

// =============================================================================
// GeneradorAnejo (feature-8 §D) — el momento del producto, extremo a extremo:
// pulsar «PDF» en «Fichas justificativas» de La obra (feature-16) con el
// proyecto Demo debe calcular TODOS los módulos que se calculan (import
// dinámico de motor + ficha + SVG), montar los clones ocultos de los diagramas
// y componer un único PDF vía `renderAnejo`.
//
// Este test valida el CABLEADO (adaptadores, dynamic imports, dos fases de
// render); la composición del PDF en sí tiene sus tests en
// `src/lib/pdf/test/anejo.test.ts`. En jsdom el raster de los SVG no corre
// (Image+canvas): `renderFicha` cae a su placeholder, que es justo el
// comportamiento degradado que se quiere ejercitar.
//
// Se monta solo <LoQueSeEntrega /> dentro de un MemoryRouter + ProyectoProvider
// (sin persistir): no hace falta el router de la app, así que no consume uno de
// los ~3 routers de módulo-nivel que tolera un jsdom.
// =============================================================================

/** Espía sobre renderAnejo para verificar QUÉ se le pasa (y no re-medir el PDF). */
const renderAnejoSpy = vi.hoisted(() => vi.fn());

vi.mock("../../../lib/pdf/anejo", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../lib/pdf/anejo")>();
  return {
    ...real,
    renderAnejo: (entrada: Parameters<typeof real.renderAnejo>[0]) => {
      renderAnejoSpy(entrada);
      return real.renderAnejo(entrada);
    },
  };
});

function renderTarjeta(proyecto = crearProyectoDemo("2026-08-23T00:00:00.000Z")) {
  return render(
    <MemoryRouter>
      <ProyectoProvider proyectoInicial={proyecto} persistir={false}>
        <LoQueSeEntrega />
      </ProyectoProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cleanup();
  renderAnejoSpy.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("GeneradorAnejo · anejo del expediente (feature-8 §D)", () => {
  it("el PDF de las fichas está disponible con el Demo", () => {
    renderTarjeta();
    expect(screen.getByRole("button", { name: "Fichas justificativas en PDF" })).toBeEnabled();
  });

  it("genera el anejo del Demo con las fichas de los módulos calculados", async () => {
    const user = userEvent.setup();
    renderTarjeta();

    await user.click(screen.getByRole("button", { name: "Fichas justificativas en PDF" }));

    // La composición es asíncrona (imports dinámicos de los 6 motores + doble
    // rAF antes de rasterizar): se espera a que renderAnejo reciba su entrada.
    await waitFor(() => expect(renderAnejoSpy).toHaveBeenCalledTimes(1), { timeout: 15000 });

    const entrada = renderAnejoSpy.mock.calls[0][0] as Parameters<
      typeof import("../../../lib/pdf/anejo").renderAnejo
    >[0];

    // Los 6 módulos publicados se calculan → 6 fichas.
    expect(entrada.fichas.map((f) => f.key).sort()).toEqual(["he1", "hs1", "hs3", "hs4", "hs5", "hs6"]);
    // Cada ficha llega identificada con el proyecto (cabecera del documento).
    for (const { data } of entrada.fichas) {
      expect(data.proyecto).toBe(entrada.proyecto.nombre);
      expect(data.fechaProyecto).toBeTruthy();
    }
    // Los estados cubren TODO el registry (incluidas no-aplicables y externas),
    // que es lo que permite al anejo redactar esos apartados.
    expect(entrada.estados.length).toBeGreaterThan(entrada.fichas.length);
    expect(entrada.estados.some((e) => e.estado.aplicabilidad === "externo")).toBe(true);

    // Y el PDF acaba abriéndose en el modal de previsualización.
    await waitFor(() => expect(screen.getByTitle("PDF preview")).toBeInTheDocument(), {
      timeout: 15000,
    });
  }, 30000);

  it("los módulos que no se han abierto también tienen su ficha (feature-16)", async () => {
    const user = userEvent.setup();
    renderTarjeta({ ...crearProyectoDemo("2026-08-23T00:00:00.000Z"), justificaciones: {} });
    await user.click(screen.getByRole("button", { name: "Fichas justificativas en PDF" }));
    await waitFor(() => expect(renderAnejoSpy).toHaveBeenCalledTimes(1), { timeout: 15000 });
    const entrada = renderAnejoSpy.mock.calls[0][0] as Parameters<
      typeof import("../../../lib/pdf/anejo").renderAnejo
    >[0];
    expect(entrada.fichas.map((f) => f.key).sort()).toEqual(["he1", "hs1", "hs3", "hs4", "hs5", "hs6"]);
  }, 30000);
});
