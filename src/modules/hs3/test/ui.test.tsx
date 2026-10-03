import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// Integración de la zona de trabajo HS3 (feature-8 §A) sobre el router real:
// outliner de estancias (filas planas con inputs y resultados), teclado (Enter
// añade) y sincronía tabla → pie de selección del esquema. Mismo patrón que
// `hs5/test/ui.test.tsx` (router de módulo-nivel: hash ANTES de importar App y
// resetModules; archivo propio para respetar el límite de ~3 routers/jsdom).
//
// NO se aserta el detalle del SVG (tiene sus tests propios): aquí se valida el
// cableado outliner ↔ estado ↔ motor ↔ banda/selección.
// =============================================================================

// El módulo es LAZY: el primer render del archivo paga la carga del chunk, así
// que cada test espera el treegrid con timeout largo (patrón rutas-legacy).
const ESPERA_CHUNK = { timeout: 8000 };

async function renderHs3() {
  window.location.hash = `#/p/${DEMO_ID}/hs/ventilacion`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("treegrid", {}, ESPERA_CHUNK);
  return utils;
}

/** Fila (tr) del outliner cuya celda-nombre muestra el valor dado. */
async function filaPorNombre(
  utils: Awaited<ReturnType<typeof renderHs3>>,
  nombre: string,
) {
  const input = await utils.findByDisplayValue(nombre);
  return input.closest("tr")!;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HS3 · zona de trabajo feature-8 (outliner + esquema)", () => {
  it("monta el outliner con las estancias del Demo y la banda del veredicto", async () => {
    const utils = await renderHs3();
    const { findByDisplayValue, findByText } = utils;

    // Estancias del Demo como filas con editor de nombre inline (sin `nombre`
    // guardado, la celda muestra el id).
    expect(await findByDisplayValue("dorm-pral")).toBeInTheDocument();
    expect(await findByDisplayValue("salon")).toBeInTheDocument();
    expect(await findByDisplayValue("cocina")).toBeInTheDocument();
    expect(await findByDisplayValue("bano")).toBeInTheDocument();

    // La fila del baño trae el resultado en línea: requerido de la Tabla 2.1.
    const fila = await filaPorNombre(utils, "bano");
    expect(fila).toHaveTextContent("7 l/s");

    // La banda de veredicto del shell refleja el motor sobre el Demo.
    expect(await findByText(/Ventilación de la vivienda/)).toBeInTheDocument();
  });

  it("editar el caudal de una estancia recalcula requerido/estado de la fila", async () => {
    const user = userEvent.setup();
    const utils = await renderHs3();

    const fila = await filaPorNombre(utils, "bano");
    // El baño del Demo propone 8 l/s ≥ 7 l/s (Tabla 2.1, cat. 2) → CUMPLE.
    await waitFor(() => expect(fila).toHaveTextContent("CUMPLE"));

    // Bajar el caudal por debajo del requerido vuelca el estado a INCUMPLE.
    const caudal = within(fila).getByLabelText("Valor (l/s)");
    await user.clear(caudal);
    await user.type(caudal, "2");
    await waitFor(() => {
      expect(fila).toHaveTextContent("7 l/s"); // el requerido no cambia…
      expect(fila).toHaveTextContent("INCUMPLE"); // …pero el veredicto sí
    });
  });

  it("Enter sobre una fila añade una estancia tras ella (teclado primero)", async () => {
    const user = userEvent.setup();
    const utils = await renderHs3();
    const { findByDisplayValue, findAllByRole } = utils;

    // Seleccionar la fila del salón (clic fuera de un editor: en el tr).
    const fila = await filaPorNombre(utils, "salon");
    await user.click(fila);
    const antes = (await findAllByRole("row")).length;

    await user.keyboard("{Enter}");

    // Aparece la estancia nueva con id determinista y una fila más.
    expect(await findByDisplayValue("estancia-1")).toBeInTheDocument();
    await waitFor(async () => {
      expect((await findAllByRole("row")).length).toBe(antes + 1);
    });
  });

  it("seleccionar una fila muestra su resumen en el pie del esquema", async () => {
    const user = userEvent.setup();
    const utils = await renderHs3();
    const { findByRole } = utils;

    const fila = await filaPorNombre(utils, "bano");
    await user.click(fila);

    const aside = await findByRole("complementary", { name: "Esquema" });
    await waitFor(() => {
      expect(aside).toHaveTextContent(
        /Seleccionado: bano — 8 l\/s ≥ 7 l\/s · Cumple/,
      );
    });
  });
});
