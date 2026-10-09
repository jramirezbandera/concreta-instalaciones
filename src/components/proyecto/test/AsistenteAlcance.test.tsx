import { useState, type JSX } from "react";
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AsistenteAlcance } from "../AsistenteAlcance";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Alcance, DatosGenerales } from "../../../lib/proyecto/tipos";

// =============================================================================
// AsistenteAlcance (feature-27, paso 3): las respuestas llegan al alcance y la
// propuesta sale del motor.
// =============================================================================

const DG: DatosGenerales = {
  municipio: "Cáceres",
  provincia: "Cáceres",
  altitud_m: 459,
  intervencion: "reforma",
  tienePiscina: false,
  zonaRadon: "I",
};

let ultimo: Alcance | undefined;

function Arnes({ inicial }: { inicial?: Alcance }): JSX.Element {
  const [dg, setDg] = useState<DatosGenerales>({ ...DG, alcance: inicial });
  return (
    <AsistenteAlcance
      dg={dg}
      edificio={edificioDeCaso("plurifamiliar_locales")}
      onChange={(a) => {
        ultimo = a;
        setDg((p) => ({ ...p, alcance: a }));
      }}
    />
  );
}

afterEach(() => {
  cleanup();
  ultimo = undefined;
});

describe("AsistenteAlcance", () => {
  it("sin responder nada, avisa de que el alcance queda pendiente", () => {
    render(<Arnes />);
    expect(screen.getByText(/alcance pendiente/)).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Reforma" })).toHaveProperty("checked", true);
  });

  it("«nada de la envolvente» es una lista vacía, distinta de sin responder", async () => {
    const u = userEvent.setup();
    render(<Arnes />);
    await u.click(screen.getByLabelText("Nada de la envolvente ni de las particiones"));
    expect(ultimo?.envolvente).toEqual([]);
    expect(screen.getByText(/Lo que se propone/)).toBeTruthy();
    await u.click(screen.getByLabelText("Fachadas"));
    expect(ultimo?.envolvente).toEqual(["fachadas"]);
    await u.click(screen.getByLabelText("Fachadas"));
    expect(ultimo?.envolvente).toBeUndefined();
  });

  it("marcar ampliación suma el tipo y pregunta por el 10 %", async () => {
    const u = userEvent.setup();
    render(<Arnes />);
    await u.click(screen.getByRole("checkbox", { name: "Ampliación" }));
    expect(ultimo?.tipos).toEqual(["reforma", "ampliacion"]);
    expect(screen.getByRole("combobox", { name: /Crece más del 10/ })).toBeTruthy();
  });

  it("solo mantenimiento esconde las preguntas y no aplica nada", async () => {
    const u = userEvent.setup();
    render(<Arnes />);
    await u.click(screen.getByRole("checkbox", { name: /Solo mantenimiento/ }));
    expect(screen.queryByRole("combobox", { name: /Rehabilitación integral/ })).toBeNull();
    expect(screen.getByText(/No aplican \(29\)/)).toBeTruthy();
  });

  it("la estructura sin tocar deja DB-SE entre las que no aplican", async () => {
    const u = userEvent.setup();
    render(<Arnes inicial={{}} />);
    await u.selectOptions(screen.getByRole("combobox", { name: /Se toca la estructura/ }), "no");
    expect(ultimo?.estructura).toBe(false);
    expect(screen.getByText(/No aplican/).parentElement?.textContent).toContain("DB-SE");
  });
});
