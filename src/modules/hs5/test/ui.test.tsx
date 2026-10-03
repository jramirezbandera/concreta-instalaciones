import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// Integración de la zona de trabajo HS5 (feature-7 §C) sobre el router real:
// outliner (filas de tramos y aparatos), presets, teclado (Enter añade) y
// sincronía tabla → pie de selección del esquema. Mismo patrón que
// `src/test/rutas.test.tsx` (router de módulo-nivel: hash ANTES de importar App
// y resetModules; archivo propio para respetar el límite de ~3 routers/jsdom).
//
// NO se aserta el detalle del SVG (tiene sus tests propios): aquí se valida el
// cableado outliner ↔ estado ↔ motor ↔ banda/selección.
// =============================================================================

// El módulo es LAZY: el primer render del archivo paga la carga del chunk, así
// que cada test espera el treegrid con timeout largo (patrón rutas-legacy).
const ESPERA_CHUNK = { timeout: 8000 };

async function renderHs5() {
  window.location.hash = `#/p/${DEMO_ID}/hs/saneamiento`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("treegrid", {}, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HS5 · zona de trabajo feature-7 (outliner + esquema)", () => {
  it("monta el outliner con las filas del Demo (tramos + aparatos) y la banda del veredicto", async () => {
    const { findByDisplayValue, findByText } = await renderHs5();

    // Jerarquía del Demo: colector (raíz), bajante, ramales y aparatos como
    // filas con editor de nombre inline (el treegrid ya lo esperó renderHs5).
    expect(await findByDisplayValue("colector")).toBeInTheDocument();
    expect(await findByDisplayValue("bajante")).toBeInTheDocument();
    expect(await findByDisplayValue("ramal-bano")).toBeInTheDocument();
    expect(await findByDisplayValue("bano-completo")).toBeInTheDocument();

    // La banda de veredicto del shell refleja el motor sobre el Demo.
    expect(await findByText(/Red de evacuación/)).toBeInTheDocument();
  });

  it("el preset «+ Cocina» crea el ramal con sus 3 aparatos y recalcula", async () => {
    const user = userEvent.setup();
    const { findByRole, findByDisplayValue, findAllByDisplayValue } =
      await renderHs5();

    await user.click(await findByRole("button", { name: "+ Cocina" }));

    // Ramal nuevo con el nombre del preset + fregadero/lavavajillas/lavadora
    // (los del Demo ya existen: el preset añade una segunda tanda). En selects,
    // el display value es el TEXTO de la opción seleccionada.
    expect(await findByDisplayValue("Ramal cocina")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await findAllByDisplayValue("Fregadero de cocina")).toHaveLength(
        2,
      );
    });

    // El pie de selección del esquema apunta al ramal recién creado.
    const aside = await findByRole("complementary", {
      name: "Esquema de columna",
    });
    await waitFor(() => {
      expect(aside).toHaveTextContent(/Seleccionado: Ramal cocina/);
    });
  });

  it("Enter sobre una fila de tramo añade un tramo hermano (teclado primero)", async () => {
    const user = userEvent.setup();
    const { findByDisplayValue, findAllByRole } = await renderHs5();

    // Seleccionar la fila del ramal del baño (clic fuera de un editor: en el tr).
    const inputRamal = await findByDisplayValue("ramal-bano");
    const fila = inputRamal.closest("tr")!;
    await user.click(fila);
    const antes = (await findAllByRole("row")).length;

    await user.keyboard("{Enter}");

    // Aparece el tramo nuevo con id determinista "t1" y una fila más.
    expect(await findByDisplayValue("t1")).toBeInTheDocument();
    await waitFor(async () => {
      expect((await findAllByRole("row")).length).toBe(antes + 1);
    });
  });

  it("seleccionar una fila muestra su resumen en el pie del esquema", async () => {
    const user = userEvent.setup();
    const { findByDisplayValue, findByRole } = await renderHs5();

    const inputBajante = await findByDisplayValue("bajante");
    await user.click(inputBajante.closest("tr")!);

    const aside = await findByRole("complementary", {
      name: "Esquema de columna",
    });
    await waitFor(() => {
      expect(aside).toHaveTextContent(/Seleccionado: bajante — Ø\d+/);
    });
  });
});
