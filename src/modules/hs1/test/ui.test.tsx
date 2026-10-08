import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// HS1 (feature-17) sobre el router real y el Demo («Plurifamiliar con locales»):
// cabecera redactada, «Qué entra», decisiones, la sección con la franja, el aviso
// del clima, la lista y la memoria. Mismo patrón que HS6 (hash ANTES de
// importar App y resetModules).
// =============================================================================

const ESPERA_CHUNK = { timeout: 20000 };
const DIBUJO = "La envolvente";

async function renderHs1() {
  window.location.hash = `#/p/${DEMO_ID}/hs/humedad`;
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

describe("HS1 · desde El edificio (feature-17)", () => {
  it("cabecera, qué entra, decisiones, la franja de la fachada y el aviso del clima", async () => {
    const { findAllByText, getByRole, findByRole } = await renderHs1();
    const frases = await findAllByText(/Grado 1 en los muros del sótano, 2 en el suelo del sótano y 5 en las fachadas/);
    expect(frases.some((f) => f.tagName === "P")).toBe(true);

    const entra = getByRole("region", { name: "Qué entra" });
    expect(entra).toHaveTextContent(/Terreno.*freático no detectado hasta 10 m.*presencia baja/);
    expect(entra).toHaveTextContent(/Fachadas.*F 3\.2 · 13 m de coronación · V3.*grado 5/);

    const decisiones = getByRole("region", { name: "Decisiones" });
    const muro = within(decisiones).getByRole("group", { name: "El muro del sótano" });
    expect(within(muro).getByRole("button", { name: "Por fuera" })).toHaveAttribute("aria-pressed", "true");
    expect(within(decisiones).getByRole("combobox", { name: "Tipo de muro" })).toHaveValue("flexorresistente");
    expect(within(decisiones).getByRole("button", { name: "Grava" })).toHaveAttribute("aria-pressed", "true");

    // Lo seleccionado por defecto: la fachada.
    const aside = await findByRole("complementary", { name: DIBUJO });
    expect(aside).toHaveTextContent(/Enfoscado \+ LP ½ pie \+ cámara \+ aislante \+ LHD 7 \+ enlucido/);
    expect(aside).toHaveTextContent(/a esta altura la zona eólica no influye/);

    const avisos = getByRole("region", { name: "Avisos" });
    expect(avisos).toHaveTextContent("Faltan datos del clima: se ha supuesto zona pluviométrica I.");
    expect(within(avisos).getByRole("link", { name: "Indicarlo en Datos de la obra" })).toHaveAttribute("href", `#/p/${DEMO_ID}/datos`);
  });

  it("la fachada es la de El edificio: con un revestimiento R1 no llega al grado 5 y se vuelve a lo propuesto; el muro por dentro la condición", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs1();
    const decisiones = getByRole("region", { name: "Decisiones" });
    expect(within(decisiones).getByRole("link", { name: "Cambiar en El edificio" })).toHaveAttribute("href", `#/p/${DEMO_ID}/edificio`);
    const rev = within(decisiones).getByRole("group", { name: "Revestimiento exterior" });
    expect(within(rev).getByRole("button", { name: "R3 · muy alta" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(rev).getByRole("button", { name: "R1 · media" }));
    const aside = await findByRole("complementary", { name: DIBUJO });
    await waitFor(() => expect(getByRole("region", { name: "Avisos" })).toHaveTextContent("La fachada no llega al grado 5."));
    expect(within(decisiones).getByText("Declarado.")).toBeInTheDocument();
    await user.click(getByRole("button", { name: "Volver a lo propuesto" }));
    await waitFor(() => expect(within(rev).getByRole("button", { name: "R3 · muy alta" })).toHaveAttribute("aria-pressed", "true"));

    await user.click(within(decisiones).getByRole("button", { name: "Por dentro" }));
    await user.click(getByRole("button", { name: /^Muros del sótano: grado 1 · C1\+I2\+D1\+D5/ }));
    await waitFor(() => expect(aside).toHaveTextContent(/Muro flexorresistente impermeabilizado por el interior/));
  });

  it("Comprobaciones es la lista; Memoria, el texto", async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = await renderHs1();
    await user.click(getByRole("tab", { name: "Comprobaciones" }));
    const lista = await findByRole("list", { name: /^Comprobaciones: 5 · 1 por revisar$/ });
    expect(within(lista).getByRole("button", { name: /Suelo del sótano\s*grado 2 · C2\+C3\+D1\s*cumple/ })).toBeInTheDocument();

    await user.click(getByRole("tab", { name: "Memoria" }));
    const memoria = await findByRole("region", { name: "Memoria" });
    expect(memoria).toHaveTextContent(/Los muros del sótano son flexorresistentes, impermeabilizados por el exterior/);
    expect(memoria).toHaveTextContent(/D5 — Red de evacuación del agua de lluvia/);
  });
});
