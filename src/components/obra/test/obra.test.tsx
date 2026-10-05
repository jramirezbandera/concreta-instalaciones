import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProyectoProvider } from "../../../lib/proyecto/ProyectoContext";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { LoQueSeJustifica } from "../LoQueSeJustifica";
import { AntesDeEntregar } from "../AntesDeEntregar";
import { LoQueSeEntrega } from "../LoQueSeEntrega";

// =============================================================================
// Las piezas de La obra (feature-16) sobre el Demo, sin el router de la app.
// =============================================================================

const descargarBlob = vi.hoisted(() => vi.fn());
vi.mock("../../../lib/export/descargar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../lib/export/descargar")>()),
  descargarBlob,
}));

const demo = (): Proyecto => crearProyectoDemo("2026-10-04T10:00:00.000Z");

function montar(ui: React.ReactNode, proyecto: Proyecto = demo()) {
  return render(
    <MemoryRouter>
      <ProyectoProvider proyectoInicial={proyecto} persistir={false}>
        {ui}
      </ProyectoProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => descargarBlob.mockClear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Lo que se justifica", () => {
  it("el recuento y las filas con su estado, enlazadas al módulo", () => {
    montar(<LoQueSeJustifica />);
    expect(screen.getByText("6 cumple · 19 por revisar · 2 no aplica · 2 externo")).toBeInTheDocument();
    const hs5 = screen.getByRole("link", { name: /HS5.*Evacuación de aguas/ });
    expect(hs5).toHaveAttribute("href", "/hs/saneamiento");
    expect(within(hs5).getByText("revisar")).toBeInTheDocument();
    expect(within(hs5).getByText("garaje · bombeo")).toBeInTheDocument();
    // SI1 a SI6 publicadas (feature-19): cada una con su fila y su enlace.
    expect(screen.getByRole("link", { name: /SI1.*Propagación interior/ })).toHaveAttribute("href", "/si/propagacion-interior");
  });

  it("un «no aplica» despliega su párrafo", async () => {
    const user = userEvent.setup();
    montar(<LoQueSeJustifica />);
    const boton = screen.getByRole("button", { name: /SUA6.*Ahogamiento/ });
    expect(boton).toHaveAttribute("aria-expanded", "false");
    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/no dispone de piscina de uso colectivo/)).toBeVisible();
  });

  it("una externa guarda la referencia de su documento", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "prompt").mockReturnValue("EXP-HULC-7");
    montar(<LoQueSeJustifica />);
    await user.click(screen.getByRole("button", { name: "HULC · adjuntar documento" }));
    expect(await screen.findByRole("button", { name: "HULC · EXP-HULC-7" })).toBeInTheDocument();
  });

  describe("menú ⋯ de aplicabilidad", () => {
    it("forzar «no aplica» saca la fila de su estado y la marca como forzada", async () => {
      const user = userEvent.setup();
      vi.spyOn(window, "prompt").mockReturnValue("Lo justifica el acústico");
      montar(<LoQueSeJustifica />);
      await user.click(screen.getByRole("button", { name: "Opciones de aplicabilidad de HS6" }));
      await user.click(screen.getByRole("menuitem", { name: "Forzar no aplica…" }));
      const fila = screen.getByRole("button", { name: /HS6.*radón/ });
      expect(within(fila).getByText("no aplica")).toBeInTheDocument();
      expect(within(fila).getByText("· forzado")).toBeInTheDocument();
    });

    it("se cierra al pulsar fuera y con Escape; el botón lo alterna", async () => {
      const user = userEvent.setup();
      montar(<LoQueSeJustifica />);
      const boton = screen.getByRole("button", { name: "Opciones de aplicabilidad de HS4" });
      await user.click(boton);
      expect(screen.getByRole("menu")).toBeInTheDocument();
      await user.click(screen.getByText("Lo que se justifica"));
      expect(screen.queryByRole("menu")).toBeNull();
      await user.click(boton);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).toBeNull();
      await user.click(boton);
      await user.click(boton);
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});

describe("Antes de entregar", () => {
  it("los avisos sin revisar del Demo, cada uno hacia su módulo", () => {
    montar(<AntesDeEntregar />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(31);
    // HR (feature-25): el porcentaje de huecos, el Ld, las colindancias supuestas y el local.
    expect(within(items[19]).getByRole("link")).toHaveAttribute("href", "/hr/ruido");
    expect(items[20]).toHaveTextContent(/HR · Indica el Ld/);
    expect(items[21]).toHaveTextContent(/HR · 3 colindancias supuestas/);
    expect(within(items[23]).getByRole("link")).toHaveAttribute("href", "/he/acs");
    expect(items[26]).toHaveTextContent(/HE5 · /);
    expect(within(items[29]).getByRole("link")).toHaveAttribute("href", "/rebt/prevision");
    expect(items[29]).toHaveTextContent(/REBT · /);
    expect(within(items[0]).getByRole("link")).toHaveAttribute("href", "/hs/humedad");
    expect(items[0]).toHaveTextContent("HS1 · Faltan datos del clima: se ha supuesto zona pluviométrica I.");
    expect(within(items[1]).getByRole("link")).toHaveAttribute("href", "/hs/residuos");
    expect(items[1]).toHaveTextContent("HS2 · Confirma cómo se recogen los residuos.");
    expect(within(items[3]).getByRole("link")).toHaveAttribute("href", "/hs/fontaneria");
    expect(items[3]).toHaveTextContent("HS4 · La presión de la red es un dato supuesto.");
  });

  it("lo que no cumple va primero, en rojo", () => {
    const p = demo();
    montar(<AntesDeEntregar />, { ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } });
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent(/^No cumple: HS4/);
  });

  it("sin nada pendiente, lo dice", () => {
    const p = demo();
    const j = p.justificaciones;
    montar(<AntesDeEntregar />, {
      ...p,
      justificaciones: {
        ...j,
        hs1: { ...j.hs1, revisados: ["clima-supuesto"] },
        hs2: { revisados: ["dobles", "recogida"] },
        hs4: { ...j.hs4, revisados: ["presion-red-supuesta"] },
        hs5: { ...j.hs5, revisados: ["garaje-s1-bombeo", "pluviometria-supuesta"] },
        hs6: { ...j.hs6, revisados: ["nucleo-garaje"] },
        si1: { revisados: ["uso-local-z2", "cuarto-z6"] },
        si3: { revisados: ["recorrido", "recorrido-garaje"] },
        si4: { revisados: ["construida-garaje"] },
        si6: { revisados: ["sector-sotano"] },
        sua2: { revisados: ["garaje-altura"] },
        sua3: { revisados: ["cierrapuertas"] },
        sua4: { revisados: ["cuarto-sin-tipo"] },
        sua8: { revisados: ["ng-supuesto", "local-comercial"] },
        sua9: { revisados: ["viviendas-accesibles"] },
        he4: { revisados: ["perdidas", "scop"] },
        he5: { revisados: ["construida", "mixto"] },
        he6: { revisados: ["mixto"] },
        rebt: { revisados: ["ascensor-supuesto", "servicios", "humo"] },
        hr: { revisados: ["huecos", "ld", "colindancias", "local"] },
      },
    });
    expect(screen.getByText(/Nada pendiente/)).toBeInTheDocument();
  });
});

describe("Lo que se entrega", () => {
  it("el recuento de cada entregable", () => {
    montar(<LoQueSeEntrega />);
    expect(screen.getByText("27 apartados")).toBeInTheDocument();
    expect(screen.getByText("25 fichas")).toBeInTheDocument();
    expect(screen.getByText("2 esquemas")).toBeInTheDocument();
  });

  it("con algo que no cumple, lo nombra y no lo cuenta", () => {
    const p = demo();
    montar(<LoQueSeEntrega />, { ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } });
    expect(screen.getByText("26 de 27 apartados")).toBeInTheDocument();
    expect(screen.getAllByText("HS4 no cumple")).toHaveLength(3);
    expect(screen.getByText("1 de 2 esquemas")).toBeInTheDocument();
  });

  it("descarga la memoria en Word y los esquemas en DXF", async () => {
    const user = userEvent.setup();
    montar(<LoQueSeEntrega />);
    await user.click(screen.getByRole("button", { name: "Word" }));
    await waitFor(() => expect(descargarBlob).toHaveBeenCalledTimes(1), { timeout: 10000 });
    expect(descargarBlob.mock.calls[0][1]).toBe("memoria-cte-demo-vivienda-c-mayor-12.docx");

    await user.click(screen.getByRole("button", { name: "Esquemas para el plano en DXF" }));
    await waitFor(() => expect(descargarBlob).toHaveBeenCalledTimes(2), { timeout: 10000 });
    expect(descargarBlob.mock.calls[1][1]).toBe("esquemas-instalaciones-demo-vivienda-c-mayor-12.dxf");
  }, 20000);

  it("el PDF de la memoria se abre en la previsualización", async () => {
    const user = userEvent.setup();
    montar(<LoQueSeEntrega />);
    await user.click(screen.getByRole("button", { name: "PDF" }));
    expect(await screen.findByTitle("PDF preview", undefined, { timeout: 10000 })).toBeInTheDocument();
  }, 20000);
});
