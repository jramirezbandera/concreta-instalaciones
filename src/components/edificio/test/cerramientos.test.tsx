import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { CerramientosEdificio } from "../CerramientosEdificio";
import { EditorSeleccion } from "../EditorSeleccion";

// =============================================================================
// Los cerramientos se eligen en El edificio (feature-26, paso 2): las tarjetas
// bajo la sección y el editor de la columna izquierda.
// =============================================================================

afterEach(cleanup);

function montar(edificio: Edificio) {
  const onCambiar = vi.fn<(e: Edificio) => void>();
  const r = render(
    <EditorSeleccion edificio={edificio} seleccion={{ tipo: "cerramientos" }} onCambiar={onCambiar} onSeleccionar={() => {}} />,
  );
  return { ...r, onCambiar };
}

describe("Cerramientos en El edificio", () => {
  it("las tarjetas enseñan los habituales y abren el editor", async () => {
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    const { getByRole } = render(
      <CerramientosEdificio edificio={edificioDeCaso("plurifamiliar")} seleccion={null} onSeleccionar={onSeleccionar} />,
    );
    const seccion = getByRole("region", { name: /Cerramientos/ });
    expect(within(seccion).getByText(/los habituales/)).toBeInTheDocument();
    const fachada = within(seccion).getByRole("button", { name: /^Fachada: Enfoscado \+ LP ½ pie \+ cámara/ });
    expect(within(fachada).getByText(/CEC F 3\.2, p\. 59/)).toBeInTheDocument();
    await user.click(fachada);
    expect(onSeleccionar).toHaveBeenCalledWith({ tipo: "cerramientos" });
  });

  it("elegir la fachada la escribe en el edificio", async () => {
    const user = userEvent.setup();
    const { getByLabelText, onCambiar } = montar(edificioDeCaso("plurifamiliar"));
    await user.selectOptions(getByLabelText("Fachada"), "fa-sate-lp115");
    expect(onCambiar.mock.lastCall![0].cerramientos?.fachada).toEqual({ id: "fa-sate-lp115" });
  });

  it("el marco se elige con la ventana", async () => {
    const user = userEvent.setup();
    const { getByLabelText, onCambiar } = montar(edificioDeCaso("plurifamiliar"));
    await user.selectOptions(getByLabelText("Marco"), "metalico_rpt_mayor_12mm");
    expect(onCambiar.mock.lastCall![0].cerramientos?.ventana).toEqual({ id: "ve-4-c-6-batiente", marco: "metalico_rpt_mayor_12mm" });
  });

  it("la planta baja distinta muestra su fachada y su ventana; sin viviendas en ella, avisa de que no entra en HE1", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByLabelText, getByLabelText, getByText, onCambiar, rerender } = montar(
      edificioDeCaso("plurifamiliar_locales"),
    );
    expect(queryByLabelText("Fachada de la planta baja")).toBeNull();
    await user.click(within(getByRole("group", { name: "Planta baja" })).getByRole("button", { name: "Distinta" }));
    const con = onCambiar.mock.lastCall![0];
    expect(con.cerramientos?.fachadaPB).toEqual({ id: "fa-enf-lp115-c-at-lhd70" });

    rerender(<EditorSeleccion edificio={con} seleccion={{ tipo: "cerramientos" }} onCambiar={onCambiar} onSeleccionar={() => {}} />);
    expect(getByLabelText("Fachada de la planta baja")).toBeInTheDocument();
    expect(getByLabelText("Marco de la planta baja")).toBeInTheDocument();
    expect(getByText(/no entran en HE1/)).toBeInTheDocument();
  });

  it("la cubierta plana se elige invertida o convencional; con solado flotante, solo invertida", async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, queryByRole, onCambiar, rerender } = montar(edificioDeCaso("plurifamiliar"));
    const grupo = getByRole("group", { name: "Aislante de la cubierta" });
    expect(within(grupo).getByRole("button", { name: "Invertida" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(grupo).getByRole("button", { name: "Convencional" }));
    expect(onCambiar.mock.lastCall![0].cerramientos?.aislanteCubierta).toBe("convencional");

    const transitable: Edificio = {
      ...edificioDeCaso("plurifamiliar"),
      cubierta: { tipo: "plana_transitable", superficie_m2: 210 },
      cerramientos: { ...onCambiar.mock.lastCall![0].cerramientos!, cubierta: { id: "cu-plana-solado-flotante" } },
    };
    rerender(<EditorSeleccion edificio={transitable} seleccion={{ tipo: "cerramientos" }} onCambiar={onCambiar} onSeleccionar={() => {}} />);
    expect(queryByRole("group", { name: "Aislante de la cubierta" })).toBeNull();
    expect(getByText(/el Catálogo solo la da así/)).toBeInTheDocument();
  });

  it("la cubierta lleva a Cerramientos", async () => {
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    const { getByRole } = render(
      <EditorSeleccion edificio={edificioDeCaso("plurifamiliar")} seleccion={{ tipo: "cubierta" }} onCambiar={() => {}} onSeleccionar={onSeleccionar} />,
    );
    await user.click(getByRole("button", { name: /en Cerramientos/ }));
    expect(onSeleccionar).toHaveBeenCalledWith({ tipo: "cerramientos" });
  });
});
