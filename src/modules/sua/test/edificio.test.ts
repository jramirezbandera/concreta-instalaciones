import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { cambiarAscensor } from "../editar";
import { edificioSua } from "../edificio";

// =============================================================================
// DB-SUA — El edificio visto por el DB-SUA (feature-20): clases de zona,
// escaleras, garaje y ascensor con los cuatro casos.
// =============================================================================

describe("edificioSua", () => {
  it("unifamiliar: interior de vivienda, garaje de la vivienda, escalera interior, sin ascensor exigido", () => {
    const e = edificioSua(edificioDeCaso("unifamiliar"));
    expect(new Set(e.zonas.map((z) => z.clase))).toEqual(new Set(["vivienda", "garaje_vivienda"]));
    expect(e.garaje).toBeNull();
    expect(e.escaleras.map((x) => x.tipo)).toEqual(["interior"]);
    expect(e.ascensor.exigido).toBe(false);
  });

  it("plurifamiliar PB+3 con sótano: escalera común y del garaje; ascensor exigido (3 plantas)", () => {
    const e = edificioSua(edificioDeCaso("plurifamiliar"));
    expect(e.escaleras.map((x) => x.tipo)).toEqual(["comun", "garaje"]);
    expect(e.garaje).toMatchObject({ usoAparcamiento: true, plazas: 16, bajoRasante: true });
    expect(e.ascensor).toMatchObject({ exigido: true, plantasASalvar: 3, hay: { valor: true, supuesto: true } });
    expect(e.alturaCubierta_m).toBe(12);
  });

  it("el ascensor indicado manda sobre el supuesto", () => {
    const e = edificioSua(cambiarAscensor(edificioDeCaso("plurifamiliar"), false));
    expect(e.ascensor.hay).toEqual({ valor: false, supuesto: false });
    expect(cambiarAscensor(cambiarAscensor(edificioDeCaso("plurifamiliar"), true), undefined).ascensor).toBeUndefined();
  });

  it("oficinas: más de 200 m² útiles fuera de la planta de entrada → ascensor exigido", () => {
    const e = edificioSua(edificioDeCaso("oficinas"));
    expect(e.residencial).toBe(false);
    expect(e.ascensor.utilSinEntrada_m2).toBeGreaterThan(200);
    expect(e.ascensor.exigido).toBe(true);
  });
});
