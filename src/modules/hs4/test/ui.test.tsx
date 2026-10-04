import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS4 v4 (feature-15) sobre el router real y el Demo («Plurifamiliar con
// locales», 250 kPa de red): cabecera redactada, «Qué entra», la presión de la
// red que se ajusta y se confirma, lo que no cumple con el grupo que lo arregla,
// la lista, la memoria y «Ajustar a mano». Mismo patrón que HS5.
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "Montantes y presión por planta";

async function renderHs4() {
  window.location.hash = `#/p/${DEMO_ID}/hs/fontaneria`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("complementary", { name: DIBUJO }, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HS4 · desde El edificio (feature-15)", () => {
  it("cabecera, qué entra, decisiones y la franja del grifo más desfavorable", async () => {
    const { findAllByText, findByText, getByRole, findByRole } = await renderHs4();

    const frases = await findAllByText(/Batería de 8 contadores en planta baja y un montante por vivienda/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(await findByText("1 cosa por revisar")).toBeInTheDocument();

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Viviendas.*P1–P3 · 6 · A 11 · B 10 ap./);
    expect(entra).toHaveTextContent(/Local.*previsto/);
    expect(entra).toHaveTextContent(/Garaje.*no aplica/);

    const decisiones = getByRole("region", { name: "Decisiones" });
    expect(within(decisiones).getByRole("group", { name: "Presión de la red" })).toHaveTextContent("250");
    expect(within(decisiones).getByRole("button", { name: "Batería en PB" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("button", { name: "Multicapa" })).toHaveAttribute("aria-pressed", "true");

    const aside = await findByRole("complementary", { name: DIBUJO });
    expect(aside).toHaveTextContent(/Grifo más desfavorable/);
    expect(aside).toHaveTextContent(/La altura\. Subir 11 m se come 108 kPa de los 250 de partida\./);
  });

  it("bajar la presión de la red hasta que no llega; el grupo de presión lo arregla y se quita", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole, findByText } = await renderHs4();
    const decisiones = getByRole("region", { name: "Decisiones" });
    const bajar = within(decisiones).getByRole("button", { name: "Bajar 10 kPa" });
    for (let i = 0; i < 5; i++) await user.click(bajar);
    expect(within(decisiones).getByRole("group", { name: "Presión de la red" })).toHaveTextContent("200");

    const avisos = getByRole("region", { name: "Avisos" });
    await waitFor(() => expect(avisos).toHaveTextContent("No llega presión a las plantas 2 y 3."));
    await user.click(within(avisos).getByRole("button", { name: "Añadir grupo de presión" }));

    const aside = await findByRole("complementary", { name: DIBUJO });
    await waitFor(() => expect(aside).toHaveTextContent(/Lo pide la planta 3: con la red sola no llegaría a 100 kPa\./));
    expect(await findByText(/Grupo de presión a 300 kPa/, { selector: "p" })).toBeInTheDocument();

    await user.click(within(aside).getByRole("button", { name: "Quitar el grupo de presión" }));
    await waitFor(() => expect(avisos).toHaveTextContent("No llega presión"));
  });

  it("la presión de la red se confirma y se deshace", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = await renderHs4();
    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("La presión de la red es un dato supuesto.");
    await user.click(within(avisos).getByRole("button", { name: "Ya está confirmada" }));
    expect(await findByText("Presión de la red confirmada por la compañía.")).toBeInTheDocument();
    expect(within(getByRole("region", { name: "Decisiones" })).getByText("confirmada")).toBeInTheDocument();
    await user.click(within(avisos).getByRole("button", { name: "Deshacer" }));
    expect(await findByText("1 cosa por revisar")).toBeInTheDocument();
  });

  it("Comprobaciones es la lista; Memoria, el texto", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs4();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 12 · 1 por revisar$/ });
    expect(within(lista).getByRole("button", { name: /Presión en P3\s*117 ≥ 100 kPa\s*cumple/ })).toBeInTheDocument();
    expect(within(lista).getByRole("button", { name: /Montante · A\s*Ø20 · 1,8 m\/s\s*criterio/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/La instalación se ha dimensionado conforme a la sección HS 4/);
  });

  it("«Ajustar a mano» pasa la red a la tabla de tramos y se puede volver", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole, findByDisplayValue } = await renderHs4();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    await user.click(await findByRole("button", { name: "Ajustar a mano" }));
    await user.click(await findByRole("button", { name: "¿Pasar la red a la tabla?" }));
    await findByRole("treegrid");
    expect(await findByDisplayValue("Montante · A3")).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Esquema" }));
    await findByRole("complementary", { name: "Esquema de columna" });
    const entra = getByRole("region", { name: "Qué entra" });
    await user.click(within(entra).getByRole("button", { name: "Volver a generar desde El edificio" }));
    await user.click(within(entra).getByRole("button", { name: "¿Descartar la tabla y volver a generarla?" }));
    await findByRole("complementary", { name: DIBUJO });
  });
});
