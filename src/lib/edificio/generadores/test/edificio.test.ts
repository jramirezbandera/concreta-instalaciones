import { describe, it, expect } from "vitest";
import { edificioDeCaso } from "../../casos";
import { setUnidades } from "../../editar";
import {
  entradaGeneradores,
  generarHs3,
  generarHs4,
  generarHs5,
  puedeGenerarRedes,
} from "..";
import { generarHs5Reparto } from "../viviendas";
import { calcHS3, hs3Defaults } from "../../../../modules/hs3/calc";
import { calcHS4, hs4Defaults } from "../../../../modules/hs4/calc";
import { calcHS5, hs5Defaults } from "../../../../modules/hs5/calc";

// =============================================================================
// Generadores desde El edificio (feature-12): el adaptador saca el reparto por
// planta física de las zonas de viviendas. El núcleo tiene sus propios tests
// (`viviendas.test.ts`); aquí se prueba la traducción y que el resultado sigue
// siendo calculable por los motores reales.
// =============================================================================

describe("entradaGeneradores", () => {
  it("plurifamiliar con locales: P1, P2 y P3 con un A y un B; la PB (local) no entra", () => {
    const { vts, reparto } = entradaGeneradores(edificioDeCaso("plurifamiliar_locales"));
    expect(vts.map((v) => v.id)).toEqual(["A", "B"]);
    expect(reparto).toEqual([1, 2, 3].map((nivel) => ({
      nivel,
      viviendas: [
        { tipoId: "A", cantidad: 1 },
        { tipoId: "B", cantidad: 1 },
      ],
    })));
  });

  it("plurifamiliar: la PB con viviendas también entra (nivel 0)", () => {
    const { reparto } = entradaGeneradores(edificioDeCaso("plurifamiliar"));
    expect(reparto?.map((r) => r.nivel)).toEqual([0, 1, 2, 3]);
  });

  it("unifamiliar: sin reparto, la vivienda de la casa", () => {
    const { vts, reparto } = entradaGeneradores(edificioDeCaso("unifamiliar"));
    expect(reparto).toBeUndefined();
    expect(vts.map((v) => v.id)).toEqual(["U"]);
  });

  it("oficinas o viviendas sin asignar: nada que generar", () => {
    expect(puedeGenerarRedes(edificioDeCaso("oficinas"))).toBe(false);
    const vacia = setUnidades(
      setUnidades(edificioDeCaso("plurifamiliar_locales"), "z1", "A", 0),
      "z1",
      "B",
      0,
    );
    expect(puedeGenerarRedes(vacia)).toBe(false);
    expect(generarHs5(vacia)).toEqual({ tramos: [], aparatos: [] });
  });
});

describe("generar desde el edificio", () => {
  const e = edificioDeCaso("plurifamiliar_locales");

  it("HS5 es el núcleo aplicado al reparto del edificio", () => {
    const { vts, reparto } = entradaGeneradores(e);
    expect(generarHs5(e)).toEqual(generarHs5Reparto(vts, reparto));
  });

  it("las tres redes generadas se calculan con los motores reales", () => {
    const hs5 = generarHs5(e);
    expect(hs5.tramos.length).toBeGreaterThan(2);
    expect(() => calcHS5({ ...hs5Defaults, ...hs5 })).not.toThrow();

    const hs4 = generarHs4(e);
    expect(() => calcHS4({ ...hs4Defaults, ...hs4 })).not.toThrow();

    const { notas: _notas, numPlantasConducto, ...hs3 } = generarHs3(e);
    expect(numPlantasConducto).toBe(3);
    expect(() => calcHS3({ ...hs3Defaults, ...hs3, numPlantasConducto })).not.toThrow();
  });
});
