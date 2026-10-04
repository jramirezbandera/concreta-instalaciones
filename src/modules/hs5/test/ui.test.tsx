import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS5 v4 (feature-14) sobre el router real y el Demo («Plurifamiliar con
// locales», cota del alcantarillado −1,20, sin zona pluviométrica): cabecera
// redactada, «Qué entra», decisiones, cifras del dibujo, franja, avisos que se
// revisan, lista de comprobaciones, memoria y «Ajustar a mano». Mismo patrón que
// `src/test/rutas.test.tsx` (hash ANTES de importar App y resetModules).
// El detalle del SVG y de los textos tiene sus tests propios.
// =============================================================================

// El módulo es LAZY: el primer render del archivo paga la carga del chunk.
const ESPERA_CHUNK = { timeout: 8000 };

async function renderHs5() {
  window.location.hash = `#/p/${DEMO_ID}/hs/saneamiento`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("complementary", { name: "Esquema de columnas" }, ESPERA_CHUNK);
  return utils;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HS5 · desde El edificio (feature-14)", () => {
  it("cabecera redactada, qué entra, decisiones y la franja del colector", async () => {
    const { findAllByText, findByText, getByRole, findByRole } = await renderHs5();

    // La frase va en la cabecera (y en la descripción accesible del dibujo).
    const frases = await findAllByText(/Cuatro bajantes de residuales, dos de pluviales y colector colgado Ø110 al 2 %/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);
    expect(await findByText("2 cosas por revisar")).toBeInTheDocument();

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Viviendas.*P1–P3 · 6 · A 23 UD · B 22 UD/);
    expect(entra).toHaveTextContent(/Garaje.*bombeo/);
    expect(entra).toHaveTextContent(/Local.*previsión/);
    expect(within(entra).getByRole("link", { name: "Editar el edificio" })).toHaveAttribute("href", `#/p/${DEMO_ID}/edificio`);

    const decisiones = getByRole("region", { name: "Decisiones" });
    expect(within(decisiones).getByRole("button", { name: "Unitario" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("button", { name: "Colgados" })).toHaveAttribute("aria-pressed", "true");

    // Sin selección, la franja enseña el colector general.
    const aside = await findByRole("complementary", { name: "Esquema de columnas" });
    expect(aside).toHaveTextContent(/Lo que manda.*Las unidades de desagüe\. Con Ø90 solo admitiría 130 UD y le llegan 135\./);
  });

  it("pulsar una cifra del dibujo la explica; cambiar la pendiente cambia lo que manda", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs5();
    const aside = await findByRole("complementary", { name: "Esquema de columnas" });

    await user.click(within(aside).getByRole("button", { name: /^Bajante A · cocina: Ø75, cumple$/ }));
    await waitFor(() => expect(aside).toHaveTextContent(/Cumple justo en el límite de Ø75/));

    const decisiones = getByRole("region", { name: "Decisiones" });
    await user.click(within(decisiones).getByRole("button", { name: "4 %" }));
    await user.click(within(aside).getByRole("button", { name: /^Colector general: Ø110 · 4 %/ }));
    await waitFor(() =>
      expect(aside).toHaveTextContent(/Las bajantes\. Por unidades bastaría Ø90 \(160 UD\)/),
    );
    expect(within(decisiones).getByText("No es lo habitual.")).toBeInTheDocument();
  });

  it("el aviso del garaje se revisa y se deshace", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = await renderHs5();
    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("El garaje queda por debajo del alcantarillado.");
    expect(avisos).toHaveTextContent("Falta la intensidad de lluvia.");

    const [revisarGaraje] = within(avisos).getAllByRole("button", { name: "Marcar como revisado" });
    await user.click(revisarGaraje);
    expect(await findByText("1 cosa por revisar")).toBeInTheDocument();
    await user.click(within(avisos).getByRole("button", { name: "Deshacer" }));
    expect(await findByText("2 cosas por revisar")).toBeInTheDocument();
  });

  it("Comprobaciones es la lista; Memoria, el texto con «Copiar texto»", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs5();

    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 12 · 2 por revisar$/ });
    expect(within(lista).getByRole("button", { name: /Colector general\s*Ø110 · 42 %\s*cumple/ })).toBeInTheDocument();
    expect(within(lista).getByRole("button", { name: /Local sin uso\s*Ø110\s*previsto/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/La red de evacuación se ha dimensionado conforme a la sección HS 5/);
    expect(within(memoria).getByRole("button", { name: "Copiar texto" })).toBeInTheDocument();
  });

  it("«Ajustar a mano» pasa la red a la tabla de tramos y se puede volver", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole, findByDisplayValue, findAllByRole } = await renderHs5();

    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const ajustar = await findByRole("button", { name: "Ajustar a mano" });
    await user.click(ajustar);
    await user.click(await findByRole("button", { name: "¿Pasar la red a la tabla?" }));

    await findByRole("treegrid");
    expect(await findByDisplayValue("Colector general")).toBeInTheDocument();
    expect(await findByDisplayValue("Bajante A · fecales")).toBeInTheDocument();
    expect((await findAllByRole("row")).length).toBeGreaterThan(20);

    // El dibujo pasa al esquema de columna y la izquierda ofrece volver.
    await user.click(getByRole("tab", { name: "Esquema" }));
    await findByRole("complementary", { name: "Esquema de columna" });
    const volver = getByRole("button", { name: "Volver a generar desde El edificio" });
    await user.click(volver);
    await user.click(await findByRole("button", { name: "¿Descartar la tabla y volver a generarla?" }));
    await findByRole("complementary", { name: "Esquema de columnas" });
  });
});
