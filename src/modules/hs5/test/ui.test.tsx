import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// Integración de la zona de trabajo HS5 (feature-7 §C, anatomía v4) sobre el
// router real: outliner en la pestaña Comprobaciones (filas de tramos y
// aparatos), presets, teclado (Enter añade) y sincronía tabla → franja de
// selección, que se ve bajo la lista y bajo el esquema. Mismo patrón que
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
  // Abre en Esquema (el dibujo manda); la tabla de tramos vive en Comprobaciones.
  await utils.findByRole("complementary", { name: "Esquema de columna" }, ESPERA_CHUNK);
  await userEvent.setup().click(utils.getByRole("tab", { name: "Comprobaciones" }));
  await utils.findByRole("treegrid");
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

    // La cabecera del módulo refleja el motor sobre el Demo.
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

    // La franja de selección apunta al ramal recién creado.
    const lista = await findByRole("region", { name: "Comprobaciones" });
    await waitFor(() => {
      expect(lista).toHaveTextContent(/Seleccionado: Ramal cocina/);
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

  it("«Del proyecto» muestra lo heredado y abre las excepciones locales", async () => {
    const user = userEvent.setup();
    const { findByRole, getByRole } = await renderHs5();

    // «Del proyecto» vive en la columna izquierda de Esquema.
    await user.click(getByRole("tab", { name: "Esquema" }));
    const delProyecto = await findByRole("region", { name: "Del proyecto" });
    expect(delProyecto).toHaveTextContent(/Nº de plantas\s*4/);
    expect(within(delProyecto).getByRole("link", { name: "Cambiar en El edificio" })).toHaveAttribute(
      "href",
      `#/p/${DEMO_ID}/datos`,
    );

    await user.click(within(delProyecto).getByRole("button", { name: /Nº de plantas/ }));
    expect(
      await findByRole("dialog", { name: "Excepciones locales del contexto heredado" }),
    ).toBeInTheDocument();
  });

  it("seleccionar una fila muestra su resumen en la franja, también bajo el esquema", async () => {
    const user = userEvent.setup();
    const { findByDisplayValue, findByRole, getByRole } = await renderHs5();

    const inputBajante = await findByDisplayValue("bajante");
    await user.click(inputBajante.closest("tr")!);

    // La selección sobrevive al cambio de pestaña: la franja del esquema la muestra.
    await user.click(getByRole("tab", { name: "Esquema" }));
    const aside = await findByRole("complementary", {
      name: "Esquema de columna",
    });
    await waitFor(() => {
      expect(aside).toHaveTextContent(/Seleccionado: bajante — Ø\d+/);
    });
  });
});
