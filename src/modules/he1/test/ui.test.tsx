import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_ID } from "../../../lib/proyecto/demo";
import { inicializarStorage } from "../../../lib/proyecto/storage";

// =============================================================================
// Integración de la zona de trabajo HE1 (feature-8 §B) sobre el router real:
// outliner cerramiento → capas → puentes, cableado outliner ↔ estado ↔ motor
// (editar el espesor de una capa mueve la U del cerramiento), teclado (Enter
// añade una capa hermana en el MISMO cerramiento) y sincronía tabla → pie de
// selección del esquema. Mismo patrón que `hs5/test/ui.test.tsx` y
// `hs3/test/ui.test.tsx` (router de módulo-nivel: hash ANTES de importar App y
// resetModules; archivo propio para respetar el límite de ~3 routers/jsdom).
//
// NO se aserta el detalle del SVG (tiene su propio contrato en svg-meta): aquí
// se valida el cableado outliner ↔ estado ↔ motor ↔ banda/selección.
// =============================================================================

// El módulo es LAZY: el primer render del archivo paga la carga del chunk, así
// que cada test espera el treegrid con timeout largo (patrón rutas-legacy).
const ESPERA_CHUNK = { timeout: 8000 };

// Nombres sembrados por el Demo (he1Defaults + zona climática del expediente).
const MURO = "Muro de fachada (½ pie + XPS + cámara + tabique)";
const CUBIERTA = "Cubierta plana invertida";
const VENTANA = "Ventana de salón (doble acristalamiento)";
const CAPA_XPS = "Aislante XPS (60 mm)";
const CAPA_CAMARA = "Cámara de aire sin ventilar (30 mm)";

async function renderHe1() {
  window.location.hash = `#/p/${DEMO_ID}/he/envolvente`;
  vi.resetModules();
  const { App } = await import("../../../App");
  const utils = render(<App />);
  await utils.findByRole("treegrid", {}, ESPERA_CHUNK);
  return utils;
}

/** Fila (tr) del outliner cuya celda-nombre muestra el valor dado. */
async function filaPorNombre(
  utils: Awaited<ReturnType<typeof renderHe1>>,
  nombre: string,
) {
  const input = await utils.findByDisplayValue(nombre);
  return input.closest("tr")!;
}

/**
 * U [W/m²K] leída de la celda "U / R" de una fila de cerramiento ("U 0,38 ≤
 * 0,49"). Se re-consulta el DOM en cada llamada (la fila es el mismo nodo entre
 * renders, su contenido no).
 */
function uDe(fila: HTMLElement): number {
  const texto = (within(fila).getByText(/^U /).textContent ?? "").trim();
  const m = /^U\s+([\d,]+)/.exec(texto);
  expect(m).not.toBeNull();
  return Number(m![1].replace(",", "."));
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
  inicializarStorage("2026-08-23T00:00:00.000Z");
});

describe("HE1 · zona de trabajo feature-8 (outliner + esquema)", () => {
  it("monta el outliner con los cerramientos del Demo, sus capas y la banda del veredicto", async () => {
    const utils = await renderHe1();
    const { findByDisplayValue, findByText } = utils;

    // Cerramientos del Demo (depth 0) con editor de nombre inline.
    expect(await findByDisplayValue(MURO)).toBeInTheDocument();
    expect(await findByDisplayValue(CUBIERTA)).toBeInTheDocument();
    expect(await findByDisplayValue(VENTANA)).toBeInTheDocument();

    // Capas (depth 1) del muro, en orden interior→exterior; la cámara sin
    // material y el XPS con material del CEC.
    const filaCamara = await filaPorNombre(utils, CAPA_CAMARA);
    const filaXps = await filaPorNombre(utils, CAPA_XPS);
    expect(filaCamara).toHaveAttribute("aria-level", "2");
    expect(filaXps).toHaveAttribute("aria-level", "2");
    // El select de material de la capa muestra el TEXTO de la opción elegida.
    expect(
      within(filaCamara).getByRole("combobox"),
    ).toHaveDisplayValue("— personalizado (λ / R manual)");
    // Resultado en línea de la capa: su R calculada.
    expect(filaXps).toHaveTextContent(/^.*R \d+,\d+/);

    // La fila del cerramiento trae el resultado en línea: U vs límite efectivo.
    const filaMuro = await filaPorNombre(utils, MURO);
    expect(filaMuro).toHaveTextContent(/U \d+,\d+ ≤ \d+,\d+/);
    expect(uDe(filaMuro)).toBeGreaterThan(0);

    // Puentes térmicos del muro (depth 1, kind "puente"): el Demo siembra dos.
    expect(
      await utils.findAllByText("Puente térmico"),
    ).toHaveLength(4); // 2 del muro + 1 de la cubierta + 1 de la ventana

    // La banda de veredicto del shell refleja el motor sobre el Demo (zona
    // climática heredada del expediente: Cáceres, 459 m → C4 → letra C).
    expect(
      await findByText(/Envolvente térmica \(zona C\)/),
    ).toBeInTheDocument();
  });

  it("editar el espesor de una capa cambia la U del cerramiento (outliner → estado → motor)", async () => {
    const user = userEvent.setup();
    const utils = await renderHe1();

    const filaMuro = await filaPorNombre(utils, MURO);
    const uAntes = uDe(filaMuro);

    // Numéricos de la fila de capa, en orden de columna: e · λ · R · µ · Sd
    // (comparten aria-label "Valor": la unidad vive en la cabecera).
    const filaXps = await filaPorNombre(utils, CAPA_XPS);
    const espesor = within(filaXps).getAllByLabelText("Valor")[0];
    expect(espesor).toHaveValue(0.06);

    // Engordar el aislante baja la transmitancia del cerramiento entero. El
    // estado es DIFERIDO (useDeferredValue) → waitFor.
    await user.clear(espesor);
    await user.type(espesor, "1");

    await waitFor(() => {
      expect(uDe(filaMuro)).toBeLessThan(uAntes);
    });
    // …y la R de la propia capa sube con ella (el resultado por capa también).
    await waitFor(() => {
      expect(filaXps).toHaveTextContent(/R \d\d+,\d+/);
    });
  });

  it("Enter sobre una fila de capa añade otra capa en el mismo cerramiento (teclado primero)", async () => {
    const user = userEvent.setup();
    const utils = await renderHe1();
    const { findByDisplayValue, findAllByRole } = utils;

    // Seleccionar la fila del XPS (clic fuera de un editor: en el tr).
    const filaXps = await filaPorNombre(utils, CAPA_XPS);
    await user.click(filaXps);
    const antes = (await findAllByRole("row")).length;

    await user.keyboard("{Enter}");

    // Capa nueva con id determinista del cerramiento, insertada JUSTO DESPUÉS
    // de la fila de referencia (el orden del array es la física del muro).
    const nueva = await findByDisplayValue("muro-fachada-cap-1");
    const filaNueva = nueva.closest("tr")!;
    expect(filaXps.nextElementSibling).toBe(filaNueva);
    expect(filaNueva).toHaveAttribute("aria-level", "2");
    await waitFor(async () => {
      expect((await findAllByRole("row")).length).toBe(antes + 1);
    });
  });

  it("seleccionar una fila muestra su resumen en el pie del esquema", async () => {
    const user = userEvent.setup();
    const utils = await renderHe1();
    const { findByRole } = utils;

    // Fila de capa → nombre, espesor y R.
    await user.click(await filaPorNombre(utils, CAPA_XPS));
    const aside = await findByRole("complementary", {
      name: "Esquema del cerramiento",
    });
    await waitFor(() => {
      expect(aside).toHaveTextContent(
        /Seleccionado: Aislante XPS \(60 mm\) — e 0,06 m · R \d+,\d+/,
      );
    });

    // Fila de cerramiento → U vs límite efectivo y veredicto en texto.
    await user.click(await filaPorNombre(utils, CUBIERTA));
    await waitFor(() => {
      expect(aside).toHaveTextContent(
        /Seleccionado: Cubierta plana invertida — U \d+,\d+ ≤ \d+,\d+ · (Cumple|Aviso|No cumple|Informativo)/,
      );
    });

    // …y el panel pinta SOLO ese cerramiento (`soloCerramientoId`): el <title>
    // del SVG nombra la cubierta y el muro ya no aparece en el aside.
    expect(aside).toHaveTextContent("Cerramiento Cubierta plana invertida");
    expect(aside).not.toHaveTextContent("Muro de fachada");
  });
});
