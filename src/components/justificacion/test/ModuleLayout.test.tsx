import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "../../../lib/theme/ThemeProvider";
import { ModuleLayout, type ModuleLayoutProps } from "../ModuleLayout";
import { ajustar } from "../../../lib/ui/ajustar";

// =============================================================================
// ModuleLayout (REDISENO-V4 §3.3): la anatomía común sin módulo ni proyecto
// (contexto null, como /_smoke). Pestañas, avisos plegables, columna izquierda
// solo en Esquema y franja compartida. El cableado con cada motor lo prueban
// los ui.test de los módulos.
// =============================================================================

function montar(props: Partial<ModuleLayoutProps> = {}) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <ModuleLayout
          justificacionKey="smoke"
          resultado={{ veredicto: "ok", sujeto: "Extracción de cocción", metricas: "50 l/s" }}
          entradas={<p>Entradas del módulo</p>}
          dibujo={{
            titulo: "Esquema",
            lienzo: <svg aria-label="Dibujo" />,
            franja: <p>Franja de selección</p>,
          }}
          comprobaciones={<table aria-label="Lista de comprobaciones" />}
          {...props}
        />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => cleanup());

describe("ModuleLayout · cabecera y pestañas", () => {
  it("abre en Esquema: columna izquierda + dibujo + franja", () => {
    montar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Demo cimientos");
    expect(screen.getByText("Cumple")).toBeInTheDocument();
    expect(screen.getByText(/Extracción de cocción/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Esquema" })).toHaveAttribute("aria-selected", "true");

    const aside = screen.getByRole("complementary", { name: "Esquema" });
    expect(within(aside).getByLabelText("Dibujo")).toBeInTheDocument();
    expect(aside).toHaveTextContent("Franja de selección");
    expect(screen.getByText("Entradas del módulo")).toBeInTheDocument();
  });

  it("Comprobaciones va a todo el ancho (sin columna izquierda) y conserva la franja", async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole("tab", { name: "Comprobaciones" }));

    const lista = screen.getByRole("region", { name: "Comprobaciones" });
    expect(within(lista).getByRole("table", { name: "Lista de comprobaciones" })).toBeInTheDocument();
    expect(lista).toHaveTextContent("Franja de selección");
    expect(screen.queryByText("Entradas del módulo")).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Esquema" })).not.toBeInTheDocument();
  });

  it("sin resultado dice que faltan datos", () => {
    montar({ resultado: null });
    expect(screen.getByText("Sin datos suficientes")).toBeInTheDocument();
    expect(screen.getByText("Datos insuficientes para el cálculo.")).toBeInTheDocument();
  });
});

describe("ModuleLayout · avisos", () => {
  it("cuenta lo que hay por revisar y pliega a partir del tercero", async () => {
    const user = userEvent.setup();
    montar({ avisos: ["Aviso uno", "Aviso dos", "Aviso tres", "Aviso cuatro"] });

    expect(screen.getByText("4 cosas por revisar")).toBeInTheDocument();
    const region = screen.getByRole("region", { name: "Avisos" });
    expect(region).toHaveTextContent("Aviso dos");
    expect(region).not.toHaveTextContent("Aviso tres");

    await user.click(within(region).getByRole("button", { name: "Ver 2 más" }));
    expect(region).toHaveTextContent("Aviso cuatro");
    expect(within(region).getByRole("button", { name: "Ver menos" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("los errores van en su propia barra y no cuentan como «por revisar»", () => {
    montar({ errores: ["La red no es un árbol válido."] });
    expect(screen.getByText("No se puede calcular")).toBeInTheDocument();
    expect(screen.getByText("La red no es un árbol válido.")).toBeInTheDocument();
    expect(screen.queryByText(/por revisar/)).not.toBeInTheDocument();
  });

  it("sin avisos ni errores no hay barra", () => {
    montar();
    expect(screen.queryByRole("region", { name: "Avisos" })).not.toBeInTheDocument();
  });
});

describe("ajustar · el dibujo cabe entero en su lienzo", () => {
  it("lo limita el alto en un lienzo apaisado", () => {
    // 400×600 en 900×600 → escala 1 por alto.
    expect(ajustar(400, 600, { ancho: 900, alto: 600 })).toEqual({ width: 400, height: 600 });
  });

  it("lo limita el ancho en un lienzo estrecho, conservando la proporción", () => {
    expect(ajustar(800, 400, { ancho: 400, alto: 900 })).toEqual({ width: 400, height: 200 });
  });

  it("no pasa del ancho máximo aunque sobre sitio", () => {
    expect(ajustar(100, 100, { ancho: 2000, alto: 2000 }, { max: 600 })).toEqual({
      width: 600,
      height: 600,
    });
  });

  it("con tamaño nativo inválido devuelve el mínimo", () => {
    expect(ajustar(0, 100, { ancho: 500, alto: 500 })).toEqual({ width: 240, height: 240 });
  });
});
