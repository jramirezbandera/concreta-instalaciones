import { useState } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectorMunicipio, type CambioMunicipio } from "../SelectorMunicipio";

// =============================================================================
// SelectorMunicipio (feature-9) — el municipio como CLAVE, no como etiqueta.
//
// Lo que se verifica: que elegir de la lista resuelve el código INE (que es lo
// único que permite cruzar el municipio con las tablas normativas), que el
// listado se filtra por provincia, y que un municipio no reconocido se admite
// pero SIN código y con aviso (hay fusiones y altas; bloquear sería presumir de
// un listado completo). El dataset se importa de verdad — no se mockea — para
// que el test también cubra la carga diferida del chunk.
// =============================================================================

/**
 * Monta el selector dentro de un anfitrión con estado: el componente es
 * CONTROLADO, así que sin un padre que devuelva el valor escrito el input nunca
 * cambiaría (y `user.type` emitiría una letra suelta por pulsación).
 */
function montar(provincia: string, municipioInicial = "") {
  const cambios: CambioMunicipio[] = [];
  const onChange = vi.fn((c: CambioMunicipio) => cambios.push(c));

  function Anfitrion() {
    const [estado, setEstado] = useState<CambioMunicipio>({ municipio: municipioInicial });
    return (
      <SelectorMunicipio
        provincia={provincia}
        municipio={estado.municipio}
        onChange={(c) => {
          setEstado(c);
          onChange(c);
        }}
      />
    );
  }

  const utils = render(<Anfitrion />);
  return { ...utils, cambios, onChange };
}

/**
 * Espera a que el chunk de municipios llegue. La lista es un listbox propio que
 * solo se pinta con el campo enfocado, así que se comprueba sobre el estado del
 * combobox, no sobre el DOM de las opciones.
 */
async function esperarListado() {
  await waitFor(
    () => {
      expect(screen.getByLabelText("Municipio")).not.toHaveAttribute(
        "placeholder",
        "Cargando municipios…",
      );
    },
    { timeout: 20000 },
  );
}

beforeEach(() => {
  cleanup();
});

describe("SelectorMunicipio · el municipio pasa a tener clave INE", () => {
  it("sin provincia elegida, el campo está deshabilitado y lo explica", () => {
    montar("");
    const campo = screen.getByLabelText("Municipio");
    expect(campo).toBeDisabled();
    expect(campo).toHaveAttribute("placeholder", "Elige antes la provincia");
  });

  it("resuelve el código INE al escribir un municipio del listado", async () => {
    const user = userEvent.setup();
    const { cambios } = montar("Cáceres");
    await esperarListado();

    await user.type(screen.getByLabelText("Municipio"), "Cáceres");

    // El último cambio emitido lleva el código INE oficial de Cáceres capital.
    await waitFor(() => {
      const ultimo = cambios[cambios.length - 1];
      expect(ultimo.municipio).toBe("Cáceres");
      expect(ultimo.municipioIne).toBe("10037");
    });
  });

  it("resuelve aunque se escriba sin acentos ni mayúsculas", async () => {
    const user = userEvent.setup();
    const { cambios } = montar("Cáceres");
    await esperarListado();

    await user.type(screen.getByLabelText("Municipio"), "caceres");

    await waitFor(() => {
      expect(cambios[cambios.length - 1].municipioIne).toBe("10037");
    });
  });

  it("un municipio que no es de la provincia no se resuelve", async () => {
    const user = userEvent.setup();
    const { cambios } = montar("Cáceres");
    await esperarListado();

    // Madrid existe, pero no en Cáceres: el listado está filtrado.
    await user.type(screen.getByLabelText("Municipio"), "Madrid");

    await waitFor(() => {
      expect(cambios[cambios.length - 1].municipioIne).toBeUndefined();
    });
  });

  it("admite un municipio no reconocido, pero avisa de lo que se pierde", async () => {
    // El valor llega ya escrito (como al reabrir un expediente antiguo).
    montar("Cáceres", "Villa Inventada del Monte");
    await esperarListado();

    await waitFor(() => {
      expect(screen.getByText(/No está en el listado oficial de Cáceres/)).toBeInTheDocument();
    });
    // El aviso explica la consecuencia, no solo que "está mal".
    expect(screen.getByText(/sin código INE no podrá cruzarse/)).toBeInTheDocument();
  });

  it("no avisa cuando el municipio sí está en el listado", async () => {
    montar("Cáceres", "Cáceres");
    await esperarListado();

    await waitFor(() => {
      expect(screen.getByLabelText("Municipio")).toHaveValue("Cáceres");
    });
    expect(screen.queryByText(/No está en el listado oficial/)).not.toBeInTheDocument();
  });
});

describe("SelectorMunicipio · la lista es propia, no el desplegable del navegador", () => {
  it("al enfocar abre un listbox con los municipios de la provincia", async () => {
    const user = userEvent.setup();
    montar("Málaga");
    await esperarListado();

    await user.click(screen.getByLabelText("Municipio"));

    const listbox = await screen.findByRole("listbox", { name: "Municipios de Málaga" });
    expect(listbox).toBeInTheDocument();
    // La lista está ACOTADA: no se vuelcan los 103 municipios en el DOM.
    const opciones = screen.getAllByRole("option");
    expect(opciones.length).toBeLessThanOrEqual(40);
    expect(screen.getByText(/y \d+ más/)).toBeInTheDocument();
  });

  it("filtra al escribir y prioriza los que empiezan por el texto", async () => {
    const user = userEvent.setup();
    montar("Málaga");
    await esperarListado();

    await user.type(screen.getByLabelText("Municipio"), "ante");

    await waitFor(() => {
      const nombres = screen.getAllByRole("option").map((o) => o.textContent ?? "");
      // "Antequera" empieza por "ante" → va antes que "Alfarnatejo", que lo contiene.
      expect(nombres[0]).toMatch(/^Antequera/);
      expect(nombres.every((n) => /ante/i.test(n.normalize("NFD").replace(/[̀-ͯ]/g, "")))).toBe(true);
    });
  });

  it("se recorre con las flechas y se elige con Enter", async () => {
    const user = userEvent.setup();
    const { cambios } = montar("Málaga");
    await esperarListado();

    const campo = screen.getByLabelText("Municipio");
    await user.click(campo);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    await waitFor(() => {
      const ultimo = cambios[cambios.length - 1];
      expect(ultimo.municipioIne).toMatch(/^29\d{3}$/); // provincia 29 = Málaga
      expect(campo).toHaveValue(ultimo.municipio);
    });
  });

  it("al elegir con el ratón se cierra la lista y queda el código INE", async () => {
    const user = userEvent.setup();
    const { cambios } = montar("Málaga");
    await esperarListado();

    await user.click(screen.getByLabelText("Municipio"));
    await user.click(await screen.findByRole("option", { name: /Antequera/ }));

    await waitFor(() => {
      expect(cambios[cambios.length - 1]).toMatchObject({ municipio: "Antequera" });
      expect(cambios[cambios.length - 1].municipioIne).toBe("29015");
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Escape cierra la lista sin perder lo escrito", async () => {
    const user = userEvent.setup();
    montar("Málaga");
    await esperarListado();

    const campo = screen.getByLabelText("Municipio");
    await user.type(campo, "Ronda");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(campo).toHaveValue("Ronda");
  });
});
