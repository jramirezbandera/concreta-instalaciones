import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProyectoProvider, useProyecto } from "../../../lib/proyecto/ProyectoContext";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { Sidebar } from "../../layout/Sidebar";

// =============================================================================
// La barra lateral calcula el estado (feature-16 §A): si cambia El edificio,
// cambia sin abrir el módulo. Antes leía el último veredicto que dejaba el
// módulo al abrirse y se quedaba viejo.
// =============================================================================

/** Sube el grupo P1–P3 a seis plantas, como haría El edificio. */
function SubirPlantas() {
  const { proyecto, actualizarEdificio } = useProyecto();
  const subir = () =>
    actualizarEdificio(
      {
        ...proyecto.edificio,
        grupos: proyecto.edificio.grupos.map((g) => (g.nivelInicial === 1 ? { ...g, repeticiones: 6 } : g)),
      },
      "2026-10-04T11:00:00.000Z",
    );
  return (
    <button type="button" onClick={subir}>
      Subir plantas
    </button>
  );
}

afterEach(() => cleanup());

describe("Sidebar — estado calculado", () => {
  it("HS4 pasa de «por revisar» a «no cumple» al subir plantas, sin abrir el módulo", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/p/demo"]}>
        <ProyectoProvider proyectoInicial={crearProyectoDemo("2026-10-04T10:00:00.000Z")} persistir={false}>
          <Sidebar isOpen onClose={() => {}} />
          <SubirPlantas />
        </ProyectoProvider>
      </MemoryRouter>,
    );
    const hs4 = () => screen.getByRole("link", { name: /HS4/ });
    expect(within(hs4()).getByRole("img", { name: "Estado: Cumple, con cosas por revisar" })).toBeInTheDocument();
    const memoria = () => screen.getByRole("link", { name: /Memoria CTE/ });
    expect(memoria()).toHaveTextContent("22/22");

    await user.click(screen.getByRole("button", { name: "Subir plantas" }));

    expect(within(hs4()).getByRole("img", { name: "Estado: No cumple" })).toBeInTheDocument();
    expect(memoria()).toHaveTextContent("21/22");
  });
});
