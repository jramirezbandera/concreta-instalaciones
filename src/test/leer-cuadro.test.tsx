import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../lib/proyecto/demo";
import { inicializarStorage } from "../lib/proyecto/storage";
import type { ChatRequest } from "../lib/ai/types";

// =============================================================================
// «Leer el cuadro de superficies» (feature-13) sobre el router real: elegir un
// PDF, leerlo (con el proveedor simulado), corregir una fila en la tabla y ver
// el edificio al momento, sustituirlo y deshacer. El PDF tampoco se abre de
// verdad: pdf.js no corre en jsdom, y lo suyo se prueba en `cuadro-leer`.
// =============================================================================

const mocks = vi.hoisted(() => ({ run: vi.fn() }));

vi.mock("../lib/ai/providers", () => ({ runChatTurn: mocks.run }));

vi.mock("../lib/ai/pdfPrep", async (original) => {
  const actual = await original<typeof import("../lib/ai/pdfPrep")>();
  return {
    ...actual,
    leerPdf: async (file: File) => ({
      nombre: file.name,
      bytes: 2048,
      paginas: 1,
      textos: [{ n: 1, texto: "CUADRO DE SUPERFICIES ÚTILES\nPortal | 20,00\nLocal | 150,00" }],
      imagenes: async () => [],
      cerrar: () => {},
    }),
  };
});

const fila = (p: Record<string, unknown>) => ({
  pagina: 1,
  nivel: 0,
  plantas: 1,
  superficie_m2: 0,
  tipoSuperficie: "util",
  que: "otro",
  estancia: "otra",
  unidad: "",
  tipoVivienda: "",
  dormitorios: 0,
  banos: 0,
  aseos: 0,
  plazas: 0,
  numero: 0,
  confianza: "alta",
  nota: "",
  ...p,
});

const LECTURA = {
  reply: "Edificio de PB y dos plantas con cuatro viviendas de dos tipos y un local en planta baja.",
  proposal: {
    filas: [
      fila({ texto: "Vivienda A", que: "vivienda", superficie_m2: 90, unidad: "A", tipoVivienda: "A", dormitorios: 3, banos: 2, nivel: 1, plantas: 2 }),
      fila({ texto: "Vivienda B", que: "vivienda", superficie_m2: 70, unidad: "B", tipoVivienda: "B", dormitorios: 2, banos: 1, nivel: 1, plantas: 2 }),
      fila({ texto: "Rellano", que: "zona_comun", superficie_m2: 12, nivel: 1, plantas: 2 }),
      fila({ texto: "Local", que: "local_sin_uso", superficie_m2: 150, unidad: "Local" }),
      fila({ texto: "Portal", que: "zona_comun", superficie_m2: 20 }),
      fila({ texto: "Cuarto de contadores", que: "zona_comun", superficie_m2: 5, confianza: "media", nota: "¿instalaciones?" }),
      fila({ texto: "Total construido", que: "total", tipoSuperficie: "construida", superficie_m2: 620 }),
    ],
    avisos: ["El cuadro no da la cubierta."],
  },
};

async function renderEdificio() {
  window.location.hash = `#/p/${DEMO_ID}/edificio`;
  vi.resetModules();
  const { App } = await import("../App");
  const utils = render(<App />);
  await utils.findByRole("heading", { name: "El edificio" });
  return utils;
}

async function abrirYElegir(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Leer el cuadro de superficies" }));
  const dialogo = await screen.findByRole("dialog", { name: "Leer el cuadro de superficies" }, { timeout: 8000 });
  await user.upload(
    within(dialogo).getByLabelText("PDF o imágenes del cuadro de superficies"),
    new File(["%PDF-1.7"], "cuadro.pdf", { type: "application/pdf" }),
  );
  await within(dialogo).findByText("cuadro.pdf");
  return dialogo;
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  mocks.run.mockReset();
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("Leer el cuadro de superficies", () => {
  it("leer, corregir una fila, sustituir el edificio y deshacer", async () => {
    const user = userEvent.setup();
    mocks.run.mockResolvedValueOnce(LECTURA);
    await renderEdificio();
    const fraseDemo = screen.getByText(/^4 plantas sobre rasante y 1 sótano/).textContent;

    const dialogo = await abrirYElegir(user);
    expect(within(dialogo).getByText(/1 página · .* se manda el texto de su página/)).toBeInTheDocument();
    expect(within(dialogo).getByText("clave compartida")).toBeInTheDocument();
    await user.click(within(dialogo).getByRole("button", { name: "Leer con IA" }));

    // La petición va al proveedor por defecto, con la clave compartida y el texto del PDF.
    expect(mocks.run).toHaveBeenCalledTimes(1);
    const [proveedor, clave, req] = mocks.run.mock.calls[0] as [string, string, ChatRequest];
    expect([proveedor, clave]).toEqual(["gemini", "test-shared-gemini-key"]);
    expect(req.turns[0]!.text).toContain("Portal | 20,00");

    // Revisión: la tabla con las filas y, al lado, el edificio que sale.
    const tabla = await within(dialogo).findByRole("table");
    expect(within(dialogo).getByText("7 filas leídas · 6 entran · 1 fuera")).toBeInTheDocument();
    expect(within(tabla).getByRole("checkbox", { name: "Usar «Total construido»" })).not.toBeChecked();
    expect(within(tabla).getByText(/Total o subtotal: la aplicación suma sus líneas/)).toBeInTheDocument();
    const previa = within(dialogo).getByRole("complementary", { name: "Así queda el edificio" });
    expect(within(previa).getByText(/^3 plantas sobre rasante · 4 viviendas de 2 tipos/)).toBeInTheDocument();
    expect(within(previa).queryByRole("button", { name: /Instalaciones/ })).toBeNull();

    // Corregir a qué va una fila rehace el edificio al momento.
    await user.selectOptions(
      within(tabla).getByRole("combobox", { name: "A qué va «Cuarto de contadores»" }),
      "instalaciones",
    );
    expect(within(previa).getByRole("button", { name: /^PB: Instalaciones, .*5 m²$/ })).toBeInTheDocument();

    // Pulsar una fila la señala en el edificio.
    await user.click(within(tabla).getByRole("button", { name: "«Local»: verla en el edificio" }));
    expect(within(previa).getByRole("button", { name: /^PB: Local sin uso/ })).toHaveAttribute("aria-pressed", "true");

    // Sustituir: la ventana se cierra, el edificio es el del cuadro y se puede deshacer.
    await user.click(within(dialogo).getByRole("button", { name: "Sustituir el edificio" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/^3 plantas sobre rasante · 4 viviendas de 2 tipos/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Edificio leído de «cuadro.pdf»");

    // Cada zona dice de dónde sale.
    const seccion = screen.getByRole("region", { name: "Sección del edificio" });
    await user.click(within(seccion).getByRole("button", { name: /^PB: Instalaciones/ }));
    const editor = screen.getByRole("complementary", { name: "Editar lo seleccionado" });
    expect(within(editor).getByText(/Leído con IA y revisado por el proyectista/)).toBeInTheDocument();
    expect(within(editor).getByText("Cuarto de contadores · 5,00 m²")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(screen.getByText(/^4 plantas sobre rasante y 1 sótano/).textContent).toBe(fraseDemo);
    expect(screen.queryByText(/Edificio leído de/)).toBeNull();
  });

  it("un error del proveedor se dice y deja volver a intentarlo; cerrar no toca el edificio", async () => {
    const user = userEvent.setup();
    await renderEdificio();
    // La clase de la app, no la de este fichero: `renderEdificio` recarga los módulos.
    const { AiError } = await import("../lib/ai/types");
    mocks.run.mockRejectedValueOnce(new AiError("rate-limit", "HTTP 429"));
    const frase = screen.getByText(/^4 plantas sobre rasante y 1 sótano/).textContent;

    const dialogo = await abrirYElegir(user);
    await user.click(within(dialogo).getByRole("button", { name: "Leer con IA" }));
    expect(await within(dialogo).findByRole("alert")).toHaveTextContent("Límite de peticiones alcanzado");
    expect(within(dialogo).getByRole("button", { name: "Leer con IA" })).toBeEnabled();

    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/^4 plantas sobre rasante y 1 sótano/).textContent).toBe(frase);
  });
});
